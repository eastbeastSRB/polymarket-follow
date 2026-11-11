import { pino } from "pino";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { Clock } from "../src/clock.js";
import type { CoverageEvent } from "../src/health/coverage.js";
import {
  Connection,
  WS_URL,
  reconnectDelayMs,
  type SocketLike,
} from "../src/ws/connection.js";

const log = pino({ level: "silent" });
const clock: Clock = {
  wall: () => Date.now(),
  monotonic: () => Date.now(),
  sleep: () => Promise.resolve(),
};

type Listener = (event?: unknown) => void;

class FakeSocket {
  readyState = 0;
  readonly sent: string[] = [];
  readonly closes: { code?: number; reason?: string }[] = [];
  private readonly listeners = new Map<string, Listener[]>();
  constructor(readonly url: string) {}
  addEventListener(type: string, listener: Listener): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }
  send(data: string): void {
    this.sent.push(data);
  }
  close(code?: number, reason?: string): void {
    this.closes.push({ code, reason });
    this.readyState = 3;
  }
  open(): void {
    this.readyState = 1;
    this.emit("open");
  }
  message(data: unknown): void {
    this.emit("message", { data });
  }
  serverClose(code: number): void {
    this.readyState = 3;
    this.emit("close", { code, reason: "bye" });
  }
  private emit(type: string, event?: unknown): void {
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

let sockets: FakeSocket[];
let coverage: CoverageEvent[];
let data: string[];
let refused: string[];
let opened: string[][];

function connection(channels: string[]): Connection {
  const c = new Connection(
    "book-1",
    {
      onData: (_msg, text) => data.push(text),
      onReject: () => undefined,
      onOpen: (chs) => opened.push([...chs]),
      onRefused: (ch) => refused.push(ch),
    },
    { coverage: (event) => coverage.push(event) },
    log,
    clock,
    (url) => {
      const socket = new FakeSocket(url);
      sockets.push(socket);
      return socket as unknown as SocketLike;
    },
  );
  c.subscribe(channels);
  c.start();
  return c;
}

const last = () => sockets.at(-1)!;
const book = (iid: number) =>
  JSON.stringify({
    ch: `book::${iid}`,
    ts: Date.now(),
    data: { b: [], a: [] },
  });
const pong = () =>
  JSON.stringify({ id: 9, data: { status: "ok", ts: Date.now(), sq: 1 } });

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
  vi.setSystemTime(Date.parse("2026-11-10T14:00:00Z"));
  sockets = [];
  coverage = [];
  data = [];
  refused = [];
  opened = [];
});
afterEach(() => {
  vi.useRealTimers();
});

describe("Connection", () => {
  it("subscribes every channel in one message on open, then pings every 10 s", async () => {
    connection(["book::1", "book::2"]);
    expect(last().url).toBe(WS_URL);
    last().open();
    expect(last().sent.map((s) => JSON.parse(s) as unknown)).toEqual([
      { id: 1, req: "sub", chs: ["book::1", "book::2"] },
    ]);
    expect(opened).toEqual([["book::1", "book::2"]]);
    await vi.advanceTimersByTimeAsync(10_000);
    last().message(pong());
    await vi.advanceTimersByTimeAsync(10_000);
    expect(sockets).toHaveLength(1);
    expect(
      last()
        .sent.slice(1)
        .map((s) => JSON.parse(s) as unknown),
    ).toEqual([
      { id: 2, req: "post", op: { type: "ping" } },
      { id: 3, req: "post", op: { type: "ping" } },
    ]);
  });

  it("stays open on pongs alone", async () => {
    connection(["trades::1"]);
    last().open();
    for (let i = 0; i < 6; i += 1) {
      await vi.advanceTimersByTimeAsync(10_000);
      last().message(pong());
    }
    expect(sockets).toHaveLength(1);
    expect(coverage.map((e) => e.event)).toEqual(["ws_open"]);
  });

  it("reopens after 15 s without a frame, resubscribes, and logs the gap at the first frame after", async () => {
    const c = connection(["book::1"]);
    last().open();
    last().message(book(1));
    const lastFrameAt = Date.now();
    await vi.advanceTimersByTimeAsync(16_000);
    expect(last().closes).toEqual([
      { code: 4000, reason: "no frame for 15 s" },
    ]);
    expect(coverage.at(-1)).toMatchObject({
      event: "ws_close",
      cause: "watchdog",
      lastFrameAt,
    });
    await vi.advanceTimersByTimeAsync(1_000);
    expect(sockets).toHaveLength(2);
    last().open();
    expect(JSON.parse(last().sent[0]!)).toMatchObject({
      req: "sub",
      chs: ["book::1"],
    });
    await vi.advanceTimersByTimeAsync(500);
    last().message(book(1));
    expect(coverage.at(-1)).toEqual({
      event: "ws_resumed",
      conn: "book-1",
      cause: "no frame for 15 s",
      lastFrameAt,
      firstFrameAt: Date.now(),
      gapMs: Date.now() - lastFrameAt,
    });
    expect(c.stats.reconnects).toBe(1);
    const lines = coverage.length;
    last().message(book(1));
    expect(coverage).toHaveLength(lines);
    expect(data).toHaveLength(3);
  });

  it("ignores a closed socket's late events", async () => {
    connection(["book::1"]);
    const first = last();
    first.open();
    await vi.advanceTimersByTimeAsync(16_000);
    first.message(book(1));
    first.serverClose(1006);
    expect(data).toEqual([]);
    expect(coverage.filter((e) => e.event === "ws_close")).toHaveLength(1);
  });

  it("goes deaf on the test switch, so the watchdog reopens it", async () => {
    const c = connection(["book::1"]);
    last().open();
    c.deafen();
    for (let i = 0; i < 16; i += 1) {
      await vi.advanceTimersByTimeAsync(1_000);
      last().message(book(1));
    }
    expect(sockets[0]!.closes).toHaveLength(1);
    expect(data).toEqual([]);
    await vi.advanceTimersByTimeAsync(1_000);
    last().open();
    last().message(book(1));
    expect(data).toHaveLength(1);
  });

  it("reconnects after a server close", async () => {
    connection(["book::1"]);
    last().open();
    last().serverClose(1012);
    expect(coverage.at(-1)).toMatchObject({
      event: "ws_close",
      code: 1012,
      cause: "server close",
    });
    await vi.advanceTimersByTimeAsync(1_000);
    expect(sockets).toHaveLength(2);
  });

  it("logs a close before the open as a failed connect, never as the server's close", async () => {
    connection(["book::1"]);
    last().serverClose(1006);
    expect(coverage).toEqual([
      {
        event: "ws_close",
        conn: "book-1",
        code: 1006,
        reason: "bye",
        cause: "connect failed",
        lastFrameAt: null,
      },
    ]);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(sockets).toHaveLength(2);
    last().open();
    last().serverClose(1006);
    expect(coverage.at(-1)).toMatchObject({ cause: "server close" });
  });

  it("gives a connect 90 s, then backs off 1, 2, 5, 10, 30 and 60 s", async () => {
    connection(["book::1"]);
    const starts: number[] = [];
    const t0 = Date.now();
    for (let i = 0; i < 7; i += 1) {
      const before = sockets.length;
      while (sockets.length === before)
        await vi.advanceTimersByTimeAsync(1_000);
      starts.push((Date.now() - t0) / 1_000);
    }
    // Each attempt waits 90 s (its check runs once a second, so up to 91) and then its back-off.
    expect(starts).toEqual([92, 185, 281, 382, 503, 654, 805]);
    expect([0, 1, 2, 3, 4, 5, 6, 9].map(reconnectDelayMs)).toEqual([
      1_000, 2_000, 5_000, 10_000, 30_000, 60_000, 60_000, 60_000,
    ]);
  });

  it("starts the back-off again after 5 healthy minutes", async () => {
    connection(["book::1"]);
    last().open();
    last().serverClose(1006);
    await vi.advanceTimersByTimeAsync(1_000);
    last().open();
    last().serverClose(1006);
    await vi.advanceTimersByTimeAsync(1_999);
    expect(sockets).toHaveLength(2);
    await vi.advanceTimersByTimeAsync(1);
    expect(sockets).toHaveLength(3);
    last().open();
    for (let i = 0; i < 31; i += 1) {
      await vi.advanceTimersByTimeAsync(10_000);
      last().message(pong());
    }
    last().serverClose(1006);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(sockets).toHaveLength(4);
  });

  it("reports a refused channel", () => {
    connection(["book::1", "book::999"]);
    last().open();
    last().message(
      JSON.stringify({
        id: 1,
        data: [{ status: "ok" }, { status: "err", error: "not_found" }],
      }),
    );
    expect(refused).toEqual(["book::999"]);
    expect(coverage.at(-1)).toEqual({
      event: "sub_refused",
      conn: "book-1",
      channel: "book::999",
      error: "not_found",
    });
  });
});

describe("Iron Rule 1 on the WebSocket", () => {
  it("sends only sub, unsub and the ping", async () => {
    const c = connection(["book::1"]);
    last().open();
    c.subscribe(["trades::2"]);
    c.unsubscribe(["book::1"]);
    await vi.advanceTimersByTimeAsync(10_000);
    const kinds = last().sent.map((s) => {
      const m = JSON.parse(s) as { req: string; op?: { type: string } };
      return m.req === "post" ? `post:${m.op?.type}` : m.req;
    });
    expect(kinds).toEqual(["sub", "sub", "unsub", "post:ping"]);
  });

  it("refuses any channel but a public book or trades channel", () => {
    const c = connection([]);
    last().open();
    expect(() => c.subscribe(["fills"])).toThrow(/channel fills/);
    expect(() => c.subscribe(["orders::1"])).toThrow();
    expect([...c.channels]).toEqual([]);
    expect(last().sent).toEqual([]);
  });
});
