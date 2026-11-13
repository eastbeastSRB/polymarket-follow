import { describe, expect, it } from "vitest";
import {
  GAP_MARGIN_MS,
  bookFileHour,
  bookSource,
  gapAt,
  gapsOf,
  toBook,
  usable,
  walkClose,
  walkOpen,
  type CoverageEvent,
} from "../src/market1/book.js";

const at = (iso: string) => Date.parse(iso);

describe("a recorded book's levels (M7)", () => {
  it("keeps levels with price and size above 0, asks ascending, bids descending", () => {
    const book = toBook(
      5,
      [
        ["99", "1"],
        ["99.5", "2"],
        ["0", "4"],
        ["98", "0"],
      ],
      [
        ["101", "1"],
        ["100.5", "3", "extra"],
        ["102", "-1"],
      ],
    );
    expect(book).toEqual({
      ts: 5,
      bids: [
        [99.5, 2],
        [99, 1],
      ],
      asks: [
        [100.5, 3],
        [101, 1],
      ],
    });
    expect(usable(book)).toBe(true);
    expect(usable({ ...book, bids: [] })).toBe(false);
    expect(usable({ ...book, asks: [] })).toBe(false);
    expect(usable({ ts: 5, bids: [[100, 1]], asks: [[100, 1]] })).toBe(false);
    expect(usable({ ts: 5, bids: [[101, 1]], asks: [[100, 1]] })).toBe(false);
  });
});

describe("the walk as a taker (M7)", () => {
  it("opens $1,000 over one level, many levels, and past the last (depth short)", () => {
    expect(walkOpen([[100, 50]], 1000)).toEqual({
      price: 100,
      units: 10,
      deepest: 1,
      short: false,
    });
    // 2 units at 100 ($200), then $800 at 101.
    const many = walkOpen(
      [
        [100, 2],
        [101, 100],
        [105, 1],
      ],
      1000,
    );
    expect(many.units).toBeCloseTo(2 + 800 / 101, 12);
    expect(many.price).toBeCloseTo(1000 / (2 + 800 / 101), 9);
    expect(many.deepest).toBe(2);
    expect(many.short).toBe(false);
    // $500 of levels, the rest at the last level's price.
    const short = walkOpen(
      [
        [100, 2],
        [150, 2],
      ],
      1000,
    );
    expect(short.units).toBeCloseTo(2 + 2 + 500 / 150, 12);
    expect(short).toMatchObject({ deepest: 2, short: true });
    // A level exactly the size of what is left ends the walk there.
    expect(
      walkOpen(
        [
          [100, 10],
          [200, 1],
        ],
        1000,
      ),
    ).toMatchObject({
      units: 10,
      deepest: 1,
      short: false,
    });
  });

  it("closes Q units, best level first, the rest at the last level's price", () => {
    expect(walkClose([[99, 50]], 10)).toEqual({
      price: 99,
      units: 10,
      deepest: 1,
      short: false,
    });
    const many = walkClose(
      [
        [99, 4],
        [98, 4],
        [97, 100],
      ],
      10,
    );
    expect(many.price).toBeCloseTo((99 * 4 + 98 * 4 + 97 * 2) / 10, 12);
    expect(many).toMatchObject({ deepest: 3, short: false });
    const short = walkClose(
      [
        [99, 4],
        [98, 4],
      ],
      10,
    );
    expect(short.price).toBeCloseTo((99 * 4 + 98 * 6) / 10, 12);
    expect(short).toMatchObject({ deepest: 2, short: true });
    // A level exactly the size of what is left ends the walk there.
    expect(
      walkClose(
        [
          [99, 10],
          [98, 5],
        ],
        10,
      ),
    ).toEqual({ price: 99, units: 10, deepest: 1, short: false });
  });
});

const ev = (iso: string, fields: Record<string, unknown>): CoverageEvent => ({
  at: at(iso),
  event: "",
  ...fields,
});

describe("the gaps of the record (M7)", () => {
  it("each event pair, widened by 60 s, open ones to the end of time", () => {
    const gaps = gapsOf([
      ev("2026-11-20T10:00:00Z", { event: "market_stall", iid: 8 }),
      ev("2026-11-20T10:01:00Z", { event: "market_stall", iid: 8 }),
      ev("2026-11-20T10:05:00Z", { event: "market_resume", iid: 8 }),
      ev("2026-11-20T11:00:15Z", {
        event: "ws_close",
        conn: "book-1",
        lastFrameAt: at("2026-11-20T11:00:00Z"),
      }),
      ev("2026-11-20T11:00:20Z", {
        event: "ws_close",
        conn: "trades-1",
        lastFrameAt: at("2026-11-20T10:59:00Z"),
      }),
      ev("2026-11-20T11:02:00Z", {
        event: "ws_resumed",
        conn: "book-1",
        firstFrameAt: at("2026-11-20T11:02:01Z"),
      }),
      ev("2026-11-20T12:00:00Z", { event: "process_stop", pid: 1 }),
      ev("2026-11-20T12:10:00Z", {
        event: "process_start",
        pid: 2,
        lastHeartbeatAt: at("2026-11-20T11:59:55Z"),
      }),
      ev("2026-11-20T13:00:00Z", {
        event: "disk",
        disk: "database",
        state: "stop",
      }),
      ev("2026-11-20T13:10:00Z", {
        event: "disk",
        disk: "recordings",
        state: "stop",
      }),
      ev("2026-11-20T13:20:00Z", {
        event: "disk",
        disk: "recordings",
        state: "warn",
      }),
      ev("2026-11-20T14:30:00Z", {
        event: "cut_line_dropped",
        file: "F:\\rec\\2026-11-20\\book-14.jsonl",
      }),
      ev("2026-11-20T14:31:00Z", {
        event: "write_failed",
        file: "F:\\rec\\2026-11-20\\trades-14.jsonl",
      }),
      ev("2026-11-20T15:00:00Z", {
        event: "sub_refused",
        conn: "book-2",
        channel: "book::31",
      }),
      ev("2026-11-20T15:00:00Z", {
        event: "sub_refused",
        conn: "trades-1",
        channel: "trades::31",
      }),
      ev("2026-11-20T15:30:00Z", { event: "ws_open", conn: "book-2" }),
      ev("2026-11-20T16:00:00Z", { event: "market_stall", iid: 10 }),
      ev("2026-11-20T17:00:00Z", { event: "process_stop", pid: 2 }),
    ]);
    const m = GAP_MARGIN_MS;
    expect(gaps).toEqual([
      {
        from: at("2026-11-20T10:00:00Z") - m,
        to: at("2026-11-20T10:05:00Z") + m,
        iid: 8,
        cause: "market stall",
      },
      {
        from: at("2026-11-20T11:00:00Z") - m,
        to: at("2026-11-20T11:02:01Z") + m,
        iid: null,
        cause: "book connection closed",
      },
      {
        from: at("2026-11-20T12:00:00Z") - m,
        to: at("2026-11-20T12:10:00Z") + m,
        iid: null,
        cause: "collector stopped",
      },
      {
        from: at("2026-11-20T11:59:55Z") - m,
        to: at("2026-11-20T12:10:00Z") + m,
        iid: null,
        cause: "collector restarted",
      },
      {
        from: at("2026-11-20T13:10:00Z") - m,
        to: at("2026-11-20T13:20:00Z") + m,
        iid: null,
        cause: "recordings disk full",
      },
      {
        from: at("2026-11-20T14:00:00Z") - m,
        to: at("2026-11-20T15:00:00Z") + m,
        iid: null,
        cause: "book file cut_line_dropped",
      },
      {
        from: at("2026-11-20T15:00:00Z") - m,
        to: at("2026-11-20T15:30:00Z") + m,
        iid: 31,
        cause: "book channel refused",
      },
      {
        from: at("2026-11-20T16:00:00Z") - m,
        to: Infinity,
        iid: 10,
        cause: "market stall",
      },
      {
        from: at("2026-11-20T17:00:00Z") - m,
        to: Infinity,
        iid: null,
        cause: "collector stopped",
      },
    ]);
    expect(bookFileHour("F:\\x\\2026-11-20\\book-07.jsonl")).toBe(
      at("2026-11-20T07:00:00Z"),
    );
    expect(bookFileHour("F:\\x\\2026-11-20\\trades-07.jsonl")).toBeNull();
    // A gap covers a market's instant inside it, both widened ends included.
    expect(gapAt(gaps, 8, at("2026-11-20T09:59:00Z"))?.cause).toBe(
      "market stall",
    );
    expect(gapAt(gaps, 8, at("2026-11-20T09:58:59.999Z"))).toBeNull();
    expect(gapAt(gaps, 10, at("2026-11-20T10:03:00Z"))).toBeNull();
    expect(gapAt(gaps, 31, at("2026-11-20T15:20:00Z"))?.cause).toBe(
      "book channel refused",
    );
    expect(gapAt(gaps, 32, at("2026-11-20T15:20:00Z"))).toBeNull();
  });

  it("a refused channel or a closed connection never reopened runs to the end of time; a second stop does not move the first", () => {
    const m = GAP_MARGIN_MS;
    expect(
      gapsOf([
        ev("2026-11-20T10:00:00Z", { event: "process_stop", pid: 1 }),
        ev("2026-11-20T10:05:00Z", { event: "process_stop", pid: 1 }),
        ev("2026-11-20T10:10:00Z", { event: "process_start", pid: 2 }),
        ev("2026-11-20T11:00:00Z", {
          event: "sub_refused",
          conn: "book-3",
          channel: "book::31",
        }),
        ev("2026-11-20T12:00:15Z", {
          event: "ws_close",
          conn: "book-4",
          lastFrameAt: at("2026-11-20T12:00:00Z"),
        }),
      ]),
    ).toEqual([
      {
        from: at("2026-11-20T10:00:00Z") - m,
        to: at("2026-11-20T10:10:00Z") + m,
        iid: null,
        cause: "collector stopped",
      },
      {
        from: at("2026-11-20T11:00:00Z") - m,
        to: Infinity,
        iid: 31,
        cause: "book channel refused",
      },
      {
        from: at("2026-11-20T12:00:00Z") - m,
        to: Infinity,
        iid: null,
        cause: "book connection closed",
      },
    ]);
  });
});

describe("the book at x, live and usable (M7)", () => {
  const book = toBook(
    at("2026-11-20T10:00:00Z"),
    [["99", "5"]],
    [["101", "5"]],
  );
  it("uses a book line at most 61 minutes old, outside every gap, and usable", () => {
    expect(bookSource(book, null, at("2026-11-20T11:01:00Z"))).toEqual({
      source: "book",
      book,
    });
    expect(bookSource(book, null, at("2026-11-20T11:01:00.001Z"))).toEqual({
      source: "mark",
      why: "stale book",
    });
    expect(bookSource(null, null, 0)).toEqual({
      source: "mark",
      why: "no book line",
    });
    expect(
      bookSource(
        book,
        { from: 0, to: 1, iid: null, cause: "collector stopped" },
        at("2026-11-20T10:30:00Z"),
      ),
    ).toEqual({ source: "mark", why: "gap", gap: "collector stopped" });
    expect(
      bookSource({ ...book, asks: [] }, null, at("2026-11-20T10:30:00Z")),
    ).toEqual({ source: "mark", why: "book not usable" });
  });
});
