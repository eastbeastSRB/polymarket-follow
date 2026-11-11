import { pino } from "pino";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Clock } from "../src/clock.js";
import type { CoverageEvent } from "../src/health/coverage.js";
import type { Kind } from "../src/store/files.js";
import type { SocketLike } from "../src/ws/connection.js";
import { Streams } from "../src/ws/streams.js";

const log = pino({ level: "silent" });
const clock: Clock = {
  wall: () => Date.now(),
  monotonic: () => Date.now(),
  sleep: () => Promise.resolve(),
};

type Listener = (event?: unknown) => void;
class FakeSocket {
  readyState = 0;
  readonly sent: { req: string; chs?: string[] }[] = [];
  readonly closes: (string | undefined)[] = [];
  private readonly listeners = new Map<string, Listener[]>();
  addEventListener(type: string, listener: Listener): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  send(data: string): void {
    this.sent.push(JSON.parse(data) as { req: string; chs?: string[] });
  }
  close(_code?: number, reason?: string): void {
    this.closes.push(reason);
    this.readyState = 3;
  }
  open(): void {
    this.readyState = 1;
    for (const l of this.listeners.get("open") ?? []) l();
  }
  message(data: string): void {
    for (const l of this.listeners.get("message") ?? []) l({ data });
  }
}

let sockets: FakeSocket[];
let written: { kind: Kind; recvMs: number; text: string }[];
let coverage: CoverageEvent[];
let streams: Streams;

const ids = (from: number, to: number) =>
  Array.from({ length: to - from + 1 }, (_, i) => from + i);
const book = (iid: number, ts: number, bid = "10") =>
  JSON.stringify({
    ch: `book::${iid}`,
    ts,
    data: { b: [[bid, "1"]], a: [["11", "1"]] },
  });
const pong = () =>
  JSON.stringify({ data: { status: "ok", ts: Date.now(), sq: 1 } });

beforeEach(() => {
  vi.useFakeTimers({
    toFake: [
      "Date",
      "setTimeout",
      "clearTimeout",
      "setInterval",
      "clearInterval",
    ],
  });
  vi.setSystemTime(Date.parse("2026-11-10T14:00:00.050Z"));
  sockets = [];
  written = [];
  coverage = [];
  streams = new Streams(
    {
      write: (kind, recvMs, text) => written.push({ kind, recvMs, text }),
      coverage: (event) => coverage.push(event),
    },
    log,
    clock,
    () => {
      const socket = new FakeSocket();
      sockets.push(socket);
      return socket as unknown as SocketLike;
    },
  );
});
afterEach(() => {
  streams.stop();
  vi.useRealTimers();
});

describe("Streams", () => {
  it("puts up to 100 channels on a connection, one of each kind, and moves with the market list", () => {
    streams.setMarkets(ids(1, 90));
    expect(sockets).toHaveLength(2);
    for (const s of sockets) s.open();
    expect(sockets[0]!.sent).toEqual([
      { id: 1, req: "sub", chs: ids(1, 90).map((i) => `book::${i}`) },
    ]);
    expect(sockets[1]!.sent[0]!.chs).toEqual(
      ids(1, 90).map((i) => `trades::${i}`),
    );

    streams.setMarkets(ids(1, 150));
    expect(sockets).toHaveLength(4);
    expect(sockets[0]!.sent[1]).toMatchObject({
      req: "sub",
      chs: ids(91, 100).map((i) => `book::${i}`),
    });
    sockets[2]!.open();
    expect(sockets[2]!.sent[0]!.chs).toEqual(
      ids(101, 150).map((i) => `book::${i}`),
    );

    streams.setMarkets(ids(1, 95));
    expect(sockets[0]!.sent[2]).toMatchObject({
      req: "unsub",
      chs: ids(96, 100).map((i) => `book::${i}`),
    });
    expect(sockets[2]!.sent[1]).toMatchObject({
      req: "unsub",
      chs: ids(101, 150).map((i) => `book::${i}`),
    });
  });

  it("writes a book once a second when it changed, every trade frame, and rejects a bad frame raw", () => {
    streams.setMarkets([7]);
    const [books, trades] = sockets;
    books!.open();
    trades!.open();
    const t = Date.now();
    books!.message(book(7, t));
    books!.message(book(7, t + 100));
    books!.message(book(7, t + 1_000, "10.5"));
    trades!.message(
      JSON.stringify({ ch: "trades::7", ts: t, data: [{ tid: 1, iid: 7 }] }),
    );
    books!.message(JSON.stringify({ ch: "book::7", ts: t, data: { b: "x" } }));
    expect(written.map((w) => w.kind)).toEqual(["book", "trades", "rejected"]);
    expect(written[0]!.text).toBe(book(7, t + 100));
    expect(JSON.parse(written[2]!.text.split("\t")[0]!)).toMatchObject({
      source: "ws:book",
    });
    expect(streams.stats).toMatchObject({
      bookFrames: 3,
      bookLines: 1,
      tradeFrames: 1,
      rejected: 1,
    });
    streams.stop();
    expect(written.at(-1)!.text).toBe(book(7, t + 1_000, "10.5"));
  });

  it("logs a market with no book for 15 s while others flow, and its return", async () => {
    streams.setMarkets([1, 2]);
    sockets[0]!.open();
    sockets[1]!.open();
    for (let i = 0; i < 32; i += 1) {
      await vi.advanceTimersByTimeAsync(500);
      sockets[0]!.message(book(1, Date.now()));
    }
    expect(coverage.filter((e) => e.event === "market_stall")).toEqual([
      { event: "market_stall", iid: 2, lastFrameAt: null },
    ]);
    sockets[0]!.message(book(2, Date.now()));
    expect(coverage.at(-1)).toEqual({
      event: "market_resume",
      iid: 2,
      gapMs: null,
    });
    expect(sockets[0]!.closes).toEqual([]);
  });

  it("reopens a connection whose markets all went quiet while pongs arrive", async () => {
    streams.setMarkets([1, 2]);
    sockets[0]!.open();
    sockets[1]!.open();
    for (let i = 0; i < 16; i += 1) {
      await vi.advanceTimersByTimeAsync(1_000);
      sockets[0]!.message(pong());
      sockets[1]!.message(pong());
    }
    expect(sockets[0]!.closes).toEqual(["every market stalled"]);
    expect(sockets[1]!.closes).toEqual([]);
    // The connection's gap is one line, not one stall line a market.
    expect(coverage.filter((e) => e.event === "market_stall")).toEqual([]);
    // The reopened connection gets its own 15 s before it is judged again.
    await vi.advanceTimersByTimeAsync(1_000);
    const reopened = sockets.at(-1)!;
    reopened.open();
    for (let i = 0; i < 10; i += 1) {
      await vi.advanceTimersByTimeAsync(1_000);
      reopened.message(pong());
    }
    expect(reopened.closes).toEqual([]);
  });

  it("prices the audit from the frames it received", () => {
    streams.setMarkets([3]);
    sockets[0]!.open();
    const t = Date.now();
    sockets[0]!.message(book(3, t, "10.0"));
    expect(
      streams.audit([
        {
          instrument_id: 3,
          bid_price: "10",
          ask_price: "11",
          timestamp: t + 150,
        },
      ]),
    ).toEqual({ rows: 1, agree: 1, timingMiss: 0, otherMiss: 0, noBook: 0 });
  });

  it("logs a clock WATCH once when a minute's books all arrive over 2 s after their server time, and once when they are back", () => {
    const lines: Record<string, unknown>[] = [];
    const captured = pino(
      { level: "info", base: undefined, timestamp: false },
      { write: (l: string) => lines.push(JSON.parse(l) as never) },
    );
    const watched = new Streams(
      { write: () => undefined, coverage: () => undefined },
      captured,
      clock,
      () => {
        const socket = new FakeSocket();
        sockets.push(socket);
        return socket as unknown as SocketLike;
      },
    );
    watched.setMarkets([7]);
    sockets[0]!.open();
    const minute = (n: number) =>
      Date.parse("2026-11-10T14:01:00Z") + n * 60_000;
    /** One book frame received at `at`, `lateMs` after its server time. */
    const frame = (at: number, lateMs: number) => {
      vi.setSystemTime(at);
      sockets[0]!.message(book(7, at - lateMs));
    };
    frame(minute(0) + 1_000, 2_000);
    frame(minute(1) + 1_000, 2_600);
    frame(minute(1) + 30_000, 2_500);
    // Minute 0 closed at 2,000 ms: at the line, not over it.
    expect(lines).toEqual([]);
    frame(minute(2) + 1_000, 2_500);
    frame(minute(3) + 1_000, 100);
    frame(minute(3) + 2_000, 9_000);
    frame(minute(4) + 1_000, 100);
    watched.stop();
    expect(lines).toEqual([
      {
        level: 40,
        minuteStart: minute(1),
        minOffsetMs: 2_500,
        msg: "clock watch: books arrive over 2 s after their server time",
      },
      {
        level: 30,
        minuteStart: minute(3),
        minOffsetMs: 100,
        msg: "clock watch: books back under 2 s",
      },
    ]);
    expect(watched.clockWatch.last).toEqual({
      minuteStart: minute(3),
      minOffsetMs: 100,
    });
  });
});
