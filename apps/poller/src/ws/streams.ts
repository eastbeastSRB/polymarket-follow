/**
 * The two streams (COLLECTOR-PLAN §1.1): books (top 20) and trades of every
 * market in the list, at most 100 channels a connection. Book frames go
 * through the sampler; trade frames are all kept. A market with no book
 * frame for 15 s on an open connection is a stall; every market stalled while
 * the connection lives (pongs arrive) means reconnect.
 */
import { issuesText } from "../api/rest-client.js";
import { BookFrame, TradesFrame, unknownKeyPaths } from "../api/schemas.js";
import { type Clock, realClock } from "../clock.js";
import {
  CLOCK_WATCH_MS,
  ClockWatch,
  type ClockMinute,
} from "../health/clock-watch.js";
import {
  auditRows,
  type AuditCounts,
  type AuditRow,
  type Top,
} from "../jobs/price-audit.js";
import type { Logger } from "../log.js";
import { MINUTE_MS, utcDate } from "../schedule.js";
import type { Recorder } from "../store/files.js";
import { BookSampler } from "./book-sampler.js";
import {
  Connection,
  SILENCE_MS,
  openSocket,
  type SocketLike,
} from "./connection.js";

export const CHANNELS_PER_CONNECTION = 100;
const HISTORY_MS = 5_000;

type Kind = "book" | "trades";
type Watch = {
  lastAt: number;
  lastWall: number | null;
  stalled: boolean;
  refused: boolean;
  tops: Top[];
};

export class Streams {
  readonly stats = {
    bookFrames: 0,
    bookLines: 0,
    tradeFrames: 0,
    rejected: 0,
    stalls: 0,
  };
  readonly linesByMarket = new Map<number, number>();
  readonly clockWatch = new ClockWatch();
  private clockWatching = false;
  private readonly connections: Record<Kind, Connection[]> = {
    book: [],
    trades: [],
  };
  private readonly sampler = new BookSampler();
  private readonly watches = new Map<number, Watch>();
  private readonly lastRejectLog = new Map<string, number>();
  private readonly lastKeyCheck = new Map<string, number>();
  private readonly unknownKeysSeen = new Set<string>();
  private readonly stallTimer: NodeJS.Timeout;

  constructor(
    private readonly recorder: Pick<Recorder, "write" | "coverage">,
    private readonly log: Logger,
    private readonly clock: Clock = realClock,
    private readonly createSocket: (url: string) => SocketLike = openSocket,
  ) {
    this.stallTimer = setInterval(() => this.checkStalls(), 1_000);
  }

  /** Subscribes what is new and unsubscribes what left, one message per connection. */
  setMarkets(ids: readonly number[]): void {
    const wanted = new Set(ids);
    for (const iid of [...this.watches.keys()]) {
      if (wanted.has(iid)) continue;
      this.watches.delete(iid);
      const line = this.sampler.forget(iid);
      if (line) this.writeBook(line.iid, line.recvMs, line.text);
    }
    for (const iid of wanted) {
      if (this.watches.has(iid)) continue;
      this.watches.set(iid, {
        lastAt: this.clock.monotonic(),
        lastWall: null,
        stalled: false,
        refused: false,
        tops: [],
      });
    }
    this.place(
      "book",
      [...wanted].map((iid) => `book::${iid}`),
    );
    this.place(
      "trades",
      [...wanted].map((iid) => `trades::${iid}`),
    );
  }

  stop(): void {
    clearInterval(this.stallTimer);
    for (const c of this.allConnections()) c.stop();
    for (const line of this.sampler.flushAll()) {
      this.writeBook(line.iid, line.recvMs, line.text);
    }
  }

  deafenAll(): void {
    for (const c of this.allConnections()) c.deafen();
  }

  audit(rows: readonly AuditRow[]): AuditCounts {
    return auditRows(rows, (iid) => this.watches.get(iid)?.tops ?? []);
  }

  connectionStats(): Record<string, Connection["stats"]> {
    return Object.fromEntries(
      this.allConnections().map((c) => [c.name, c.stats]),
    );
  }

  health(): {
    connections: Record<string, ReturnType<Connection["health"]>>;
    stalledMarkets: number;
  } {
    return {
      connections: Object.fromEntries(
        this.allConnections().map((c) => [c.name, c.health()]),
      ),
      stalledMarkets: [...this.watches.values()].filter((w) => w.stalled)
        .length,
    };
  }

  private allConnections(): Connection[] {
    return [...this.connections.book, ...this.connections.trades];
  }

  private place(kind: Kind, channels: readonly string[]): void {
    const wanted = new Set(channels);
    const connections = this.connections[kind];
    for (const c of connections) {
      const gone = [...c.channels].filter((ch) => !wanted.has(ch));
      if (gone.length > 0) c.unsubscribe(gone);
    }
    const placed = new Set(connections.flatMap((c) => [...c.channels]));
    const missing = channels.filter((ch) => !placed.has(ch));
    for (const c of connections) {
      const room = CHANNELS_PER_CONNECTION - c.channels.size;
      if (room > 0 && missing.length > 0) c.subscribe(missing.splice(0, room));
    }
    while (missing.length > 0) {
      const c = new Connection(
        `${kind}-${connections.length + 1}`,
        {
          onData: (msg, text, recvMs) => this.onData(msg, text, recvMs),
          onReject: (source, text, reason, recvMs) =>
            this.reject(source, text, reason, recvMs),
          onOpen: (opened) => this.onOpen(opened),
          onRefused: (channel) => this.onRefused(channel),
        },
        this.recorder,
        this.log,
        this.clock,
        this.createSocket,
      );
      c.subscribe(missing.splice(0, CHANNELS_PER_CONNECTION));
      connections.push(c);
      c.start();
    }
  }

  private onData(
    msg: Record<string, unknown>,
    text: string,
    recvMs: number,
  ): void {
    const ch = msg.ch as string;
    if (ch.startsWith("book::")) this.onBook(msg, text, recvMs);
    else if (ch.startsWith("trades::")) this.onTrades(msg, text, recvMs);
    else this.reject("ws", text, "unexpected channel", recvMs);
  }

  private onBook(
    msg: Record<string, unknown>,
    text: string,
    recvMs: number,
  ): void {
    const parsed = BookFrame.safeParse(msg);
    if (!parsed.success) {
      this.reject("ws:book", text, issuesText(parsed.error), recvMs);
      return;
    }
    this.checkKeys("book", BookFrame, msg, recvMs);
    const { ch, ts, data } = parsed.data;
    const iid = Number(ch.slice("book::".length));
    this.stats.bookFrames += 1;
    const minute = this.clockWatch.note(recvMs, ts);
    if (minute) this.onClockMinute(minute);
    const watch = this.watches.get(iid);
    if (watch === undefined) return;
    if (watch.stalled) {
      watch.stalled = false;
      this.recorder.coverage({
        event: "market_resume",
        iid,
        gapMs: watch.lastWall === null ? null : recvMs - watch.lastWall,
      });
    }
    watch.lastAt = this.clock.monotonic();
    watch.lastWall = recvMs;
    watch.tops.push({
      ts,
      bid: data.b[0]?.[0] ?? null,
      ask: data.a[0]?.[0] ?? null,
    });
    while (watch.tops.length > 0 && watch.tops[0]!.ts < ts - HISTORY_MS) {
      watch.tops.shift();
    }
    const line = this.sampler.onFrame(
      iid,
      ts,
      recvMs,
      text,
      JSON.stringify([data.b, data.a]),
    );
    if (line) this.writeBook(line.iid, line.recvMs, line.text);
  }

  /** A WATCH begins or ends: logged once each way; the heartbeat shows every minute's figure. */
  private onClockMinute(minute: ClockMinute): void {
    const watching = minute.minOffsetMs > CLOCK_WATCH_MS;
    if (watching === this.clockWatching) return;
    this.clockWatching = watching;
    if (watching) {
      this.log.warn(
        minute,
        "clock watch: books arrive over 2 s after their server time",
      );
    } else {
      this.log.info(minute, "clock watch: books back under 2 s");
    }
  }

  private onTrades(
    msg: Record<string, unknown>,
    text: string,
    recvMs: number,
  ): void {
    const parsed = TradesFrame.safeParse(msg);
    if (!parsed.success) {
      this.reject("ws:trades", text, issuesText(parsed.error), recvMs);
      return;
    }
    this.checkKeys("trades", TradesFrame, msg, recvMs);
    this.recorder.write("trades", recvMs, text);
    this.stats.tradeFrames += 1;
  }

  private writeBook(iid: number, recvMs: number, text: string): void {
    this.recorder.write("book", recvMs, text);
    this.stats.bookLines += 1;
    this.linesByMarket.set(iid, (this.linesByMarket.get(iid) ?? 0) + 1);
  }

  /** A (re)opened connection gives its markets 15 s for a first frame, and asks again for refused ones. */
  private onOpen(channels: readonly string[]): void {
    const now = this.clock.monotonic();
    for (const ch of channels) {
      if (!ch.startsWith("book::")) continue;
      const watch = this.watches.get(Number(ch.slice("book::".length)));
      if (watch === undefined) continue;
      watch.lastAt = now;
      watch.refused = false;
    }
  }

  private onRefused(channel: string): void {
    if (!channel.startsWith("book::")) return;
    const watch = this.watches.get(Number(channel.slice("book::".length)));
    if (watch) watch.refused = true;
  }

  /** Every market quiet is the connection's gap, logged once by it; some quiet are stalls, one line each. */
  private checkStalls(): void {
    const now = this.clock.monotonic();
    for (const c of this.connections.book) {
      if (!c.isOpen()) continue;
      const watched: [number, Watch][] = [];
      for (const ch of c.channels) {
        const iid = Number(ch.slice("book::".length));
        const watch = this.watches.get(iid);
        if (watch !== undefined && !watch.refused) watched.push([iid, watch]);
      }
      const quiet = watched.filter(([, w]) => now - w.lastAt > SILENCE_MS);
      if (watched.length > 0 && quiet.length === watched.length) {
        c.restart("every market stalled");
        continue;
      }
      for (const [iid, watch] of quiet) {
        if (watch.stalled) continue;
        watch.stalled = true;
        this.stats.stalls += 1;
        this.recorder.coverage({
          event: "market_stall",
          iid,
          lastFrameAt: watch.lastWall,
        });
      }
    }
  }

  /** Kept raw with its reason (Iron Rule 3); logged at most once a minute a source. */
  private reject(
    source: string,
    text: string,
    reason: string,
    recvMs: number,
  ): void {
    this.stats.rejected += 1;
    this.recorder.write(
      "rejected",
      recvMs,
      `${JSON.stringify({ source, reason })}\t${text}`,
    );
    const last = this.lastRejectLog.get(source) ?? -Infinity;
    if (recvMs - last < MINUTE_MS) return;
    this.lastRejectLog.set(source, recvMs);
    this.log.error(
      { source, reason },
      "frame failed its schema; kept raw in rejected",
    );
  }

  /** One frame a kind a minute is checked for keys the schema does not name, each logged once a day. */
  private checkKeys(
    kind: Kind,
    schema: typeof BookFrame | typeof TradesFrame,
    msg: unknown,
    recvMs: number,
  ): void {
    if (recvMs - (this.lastKeyCheck.get(kind) ?? -Infinity) < MINUTE_MS) return;
    this.lastKeyCheck.set(kind, recvMs);
    for (const keyPath of unknownKeyPaths(schema, msg)) {
      const seen = `${utcDate(recvMs)} ${kind} ${keyPath}`;
      if (this.unknownKeysSeen.has(seen)) continue;
      this.unknownKeysSeen.add(seen);
      this.log.info({ kind, keyPath }, "unknown key, kept in the raw text");
    }
  }
}
