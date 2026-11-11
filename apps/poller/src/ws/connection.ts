/**
 * One public WebSocket connection (code-rules: a reader needs a no-frame
 * watchdog). It pings every 10 s; no frame — data or pong — for 15 s means
 * close, reopen and resubscribe, with back-off of 1, 2, 5, 10, 30 and 60 s,
 * reset after 5 healthy minutes; a connect may take 90 s (COLLECTOR-PLAN §1.4
 * item 5). It sends only `sub`, `unsub` and the ping (Iron Rule 1). Every gap
 * is a coverage line with its cause; time is measured on the monotonic clock.
 */
import { USER_AGENT } from "../api/rest-client.js";
import { ErrorReply, PongReply, SubReply } from "../api/schemas.js";
import { type Clock, realClock } from "../clock.js";
import type { Logger } from "../log.js";
import type { Recorder } from "../store/files.js";

export const WS_URL = "wss://ws.perpetuals.polymarket.com/v1/ws";
export const PING_EVERY_MS = 10_000;
export const SILENCE_MS = 15_000;
export const CONNECT_TIMEOUT_MS = 90_000;
export const HEALTHY_MS = 5 * 60_000;
const RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 30_000, 60_000];
const PUBLIC_CHANNEL = /^(book|trades)::\d+$/;
const OPEN = 1;

export function reconnectDelayMs(failures: number): number {
  return RECONNECT_DELAYS_MS[
    Math.min(failures, RECONNECT_DELAYS_MS.length - 1)
  ]!;
}

/** Everything the poller can send over a WebSocket. */
export type Outbound =
  | { id: number; req: "sub" | "unsub"; chs: string[] }
  | { id: number; req: "post"; op: { type: "ping" } };

export type SocketLike = {
  readonly readyState: number;
  send(data: string): void;
  close(code?: number, reason?: string): void;
  addEventListener(type: "open", listener: () => void): void;
  addEventListener(
    type: "message",
    listener: (event: { data: unknown }) => void,
  ): void;
  addEventListener(
    type: "close",
    listener: (event: { code: number; reason: string }) => void,
  ): void;
  addEventListener(type: "error", listener: (event: unknown) => void): void;
};

export type ConnectionHooks = {
  onData(msg: Record<string, unknown>, text: string, recvMs: number): void;
  onReject(source: string, text: string, reason: string, recvMs: number): void;
  onOpen(channels: readonly string[]): void;
  onRefused(channel: string): void;
};

export function openSocket(url: string): SocketLike {
  return new WebSocket(url, { headers: { "user-agent": USER_AGENT } });
}

export class Connection {
  readonly channels = new Set<string>();
  readonly stats = {
    messages: 0,
    bytes: 0,
    opens: 0,
    reconnects: 0,
    pongs: 0,
    refused: 0,
    serverErrors: 0,
  };
  private socket: SocketLike | null = null;
  private generation = 0;
  private nextId = 1;
  private failures = 0;
  private connectingSince = 0;
  private openedAt: number | null = null;
  private lastFrameAt = 0;
  private lastFrameWall: number | null = null;
  private lastDataWall: number | null = null;
  private gapCause: string | null = null;
  private deaf = false;
  private stopped = false;
  private readonly pendingSubs = new Map<number, string[]>();
  private watchdog: NodeJS.Timeout | undefined;
  private pinger: NodeJS.Timeout | undefined;
  private reconnectTimer: NodeJS.Timeout | undefined;

  constructor(
    readonly name: string,
    private readonly hooks: ConnectionHooks,
    private readonly recorder: Pick<Recorder, "coverage">,
    private readonly log: Logger,
    private readonly clock: Clock = realClock,
    private readonly createSocket: (url: string) => SocketLike = openSocket,
  ) {}

  start(): void {
    this.open();
  }

  stop(): void {
    this.stopped = true;
    this.generation += 1;
    this.clearTimers();
    clearTimeout(this.reconnectTimer);
    this.socket?.close(1000, "poller stopping");
    this.socket = null;
  }

  isOpen(): boolean {
    return this.openedAt !== null;
  }

  /** `lastFrameAt`: the last frame of any kind, a pong too, as the watchdog counts them (wall ms). */
  health(): { open: boolean; lastFrameAt: number | null } {
    return { open: this.isOpen(), lastFrameAt: this.lastFrameWall };
  }

  subscribe(channels: readonly string[]): void {
    for (const ch of channels) {
      if (!PUBLIC_CHANNEL.test(ch)) throw new Error(`channel ${ch}`);
    }
    for (const ch of channels) this.channels.add(ch);
    if (this.isOpen()) this.request("sub", channels);
  }

  unsubscribe(channels: readonly string[]): void {
    for (const ch of channels) this.channels.delete(ch);
    if (this.isOpen()) this.request("unsub", channels);
  }

  /** The test switch: frames are ignored, as if the server fell silent, until the watchdog reconnects. */
  deafen(): void {
    this.deaf = true;
  }

  /** Close and reopen now, for a cause found outside (every market stalled while pongs arrive). */
  restart(cause: string): void {
    if (this.isOpen()) this.abandon(cause);
  }

  private open(): void {
    const generation = (this.generation += 1);
    this.connectingSince = this.clock.monotonic();
    this.lastFrameAt = this.connectingSince;
    const socket = this.createSocket(WS_URL);
    this.socket = socket;
    const current = () => generation === this.generation;
    socket.addEventListener("open", () => {
      if (current()) this.onOpen();
    });
    socket.addEventListener("message", (event) => {
      if (current()) this.onMessage(event.data);
    });
    socket.addEventListener("close", (event) => {
      if (current()) this.onClose(event.code, event.reason);
    });
    socket.addEventListener("error", () => {
      if (current()) this.log.warn({ conn: this.name }, "websocket error");
    });
    this.watchdog = setInterval(() => this.check(), 1_000);
  }

  private onOpen(): void {
    const now = this.clock.monotonic();
    this.openedAt = now;
    this.lastFrameAt = now;
    this.stats.opens += 1;
    this.recorder.coverage({
      event: "ws_open",
      conn: this.name,
      channels: this.channels.size,
    });
    const channels = [...this.channels];
    this.hooks.onOpen(channels);
    if (channels.length > 0) this.request("sub", channels);
    this.pinger = setInterval(() => {
      this.send({ id: this.nextId++, req: "post", op: { type: "ping" } });
    }, PING_EVERY_MS);
  }

  private onMessage(data: unknown): void {
    if (this.deaf) return;
    const recvMs = this.clock.wall();
    this.lastFrameAt = this.clock.monotonic();
    this.lastFrameWall = recvMs;
    if (typeof data !== "string") {
      this.hooks.onReject(this.name, String(data), "not text", recvMs);
      return;
    }
    this.stats.messages += 1;
    this.stats.bytes += data.length;
    let msg: unknown;
    try {
      msg = JSON.parse(data);
    } catch {
      this.hooks.onReject(this.name, data, "not JSON", recvMs);
      return;
    }
    if (typeof msg !== "object" || msg === null || Array.isArray(msg)) {
      this.hooks.onReject(this.name, data, "not an object", recvMs);
      return;
    }
    const record = msg as Record<string, unknown>;
    if (typeof record.ch === "string") {
      if (this.gapCause !== null) {
        this.recorder.coverage({
          event: "ws_resumed",
          conn: this.name,
          cause: this.gapCause,
          lastFrameAt: this.lastDataWall,
          firstFrameAt: recvMs,
          gapMs: this.lastDataWall === null ? null : recvMs - this.lastDataWall,
        });
        this.gapCause = null;
      }
      this.lastDataWall = recvMs;
      this.hooks.onData(record, data, recvMs);
      return;
    }
    this.onReply(record, data, recvMs);
  }

  private onReply(msg: Record<string, unknown>, text: string, recvMs: number) {
    const sub = SubReply.safeParse(msg);
    if (sub.success) {
      const channels = this.pendingSubs.get(sub.data.id);
      this.pendingSubs.delete(sub.data.id);
      sub.data.data.forEach((status, i) => {
        const channel = channels?.[i];
        if (status.status === "ok" || channel === undefined) return;
        this.stats.refused += 1;
        this.recorder.coverage({
          event: "sub_refused",
          conn: this.name,
          channel,
          error: status.error ?? status.status,
        });
        this.hooks.onRefused(channel);
      });
      return;
    }
    if (PongReply.safeParse(msg).success) {
      this.stats.pongs += 1;
      return;
    }
    const refused = ErrorReply.safeParse(msg);
    if (refused.success) {
      this.stats.serverErrors += 1;
      this.log.warn(
        { conn: this.name, error: refused.data.data.error },
        "server refused a message",
      );
      return;
    }
    this.hooks.onReject(this.name, text, "unknown message", recvMs);
  }

  /** A close before the open is a connect that failed (ours or the network's), not the server's close of a connection. */
  private onClose(code: number, reason: string): void {
    const cause = this.openedAt === null ? "connect failed" : "server close";
    this.recorder.coverage({
      event: "ws_close",
      conn: this.name,
      code,
      reason,
      cause,
      lastFrameAt: this.lastDataWall,
    });
    this.reconnectLater(`${cause} ${code}`);
  }

  private check(): void {
    const now = this.clock.monotonic();
    if (this.openedAt === null) {
      if (now - this.connectingSince > CONNECT_TIMEOUT_MS) {
        this.abandon("connect timeout");
      }
      return;
    }
    if (now - this.lastFrameAt > SILENCE_MS) {
      this.abandon(`no frame for ${SILENCE_MS / 1_000} s`);
    }
  }

  /** Our own close: the old socket's late events are ignored, and the reopen does not wait for them. */
  private abandon(cause: string): void {
    this.recorder.coverage({
      event: "ws_close",
      conn: this.name,
      code: 4000,
      reason: cause,
      cause: "watchdog",
      lastFrameAt: this.lastDataWall,
    });
    const old = this.socket;
    this.generation += 1;
    try {
      old?.close(4000, cause);
    } catch (err) {
      this.log.warn({ conn: this.name, err }, "websocket close failed");
    }
    this.reconnectLater(cause);
  }

  private reconnectLater(cause: string): void {
    this.clearTimers();
    this.socket = null;
    this.deaf = false;
    this.pendingSubs.clear();
    if (this.stopped) return;
    const now = this.clock.monotonic();
    if (this.openedAt !== null && now - this.openedAt >= HEALTHY_MS) {
      this.failures = 0;
    }
    this.openedAt = null;
    const delayMs = reconnectDelayMs(this.failures);
    this.failures += 1;
    this.stats.reconnects += 1;
    this.gapCause ??= cause;
    this.log.warn(
      { conn: this.name, cause, delayMs },
      "websocket reconnecting",
    );
    this.reconnectTimer = setTimeout(() => this.open(), delayMs);
  }

  private request(req: "sub" | "unsub", channels: readonly string[]): void {
    for (const ch of channels) {
      if (!PUBLIC_CHANNEL.test(ch)) throw new Error(`channel ${ch}`);
    }
    const id = this.nextId++;
    if (req === "sub") this.pendingSubs.set(id, [...channels]);
    this.send({ id, req, chs: [...channels] });
  }

  private send(message: Outbound): void {
    if (this.socket?.readyState === OPEN) {
      this.socket.send(JSON.stringify(message));
    }
  }

  private clearTimers(): void {
    clearInterval(this.watchdog);
    clearInterval(this.pinger);
    this.watchdog = undefined;
    this.pinger = undefined;
  }
}
