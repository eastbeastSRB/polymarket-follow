/**
 * The exam's price (src/polish/exam/price.ts; polish/rules.md P6, P7; THE
 * PLAN D19–D27): book first through WAVE-H's own book code, else the tape,
 * else unpriced, equal to WAVE-H's `priceSpot` line for line (every leg's
 * print and the priced fields, to the bit) wherever every instant has a
 * mark; funding and the gross on marks through the minute price where the
 * kit has no mark; the book reader's refusals and its seal; BASE pooled
 * over the deciding days' segments.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import {
  loadResearch,
  type Market,
  type Research,
} from "../src/paper/research.js";
import {
  baseCell,
  baseOver,
  bookReader,
  priceAtTheBook,
  pricedOf,
  type ExamSpot,
} from "../src/polish/exam/price.js";
import { SEALED, SealedError } from "../src/polish/seal.js";
import type { Data } from "../src/polish/tries/data.js";
import type { Forced } from "../src/polish/tries/forced.js";
import { baseOf, priceColumn } from "../src/polish/tries/prices.js";
import { fortyOf } from "../src/polish/writers.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { loadCoins } from "../src/waveh/coins.js";
import type { FundingRow } from "../src/waveh/funding.js";
import { SealedError as Unopened } from "../src/waveh/gate.js";
import { bookKey } from "../src/waveh/keys.js";
import { BooksNeeded, priceSpot, shelfOf } from "../src/waveh/legs.js";
import type { Spot } from "../src/waveh/positions.js";
import { type Trade } from "../src/waveh/price.js";
import { StoreError, readBookList } from "../src/waveh/store.js";
import { addr } from "./polish-world.js";
import { lz4, sha } from "./waveh-world.js";

const coins = loadCoins();
let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const SOL = 5;
const KPEPE = 15;
type Side = [number, number][];
const hourOf = (x: number) => Math.floor(x / HOUR_MS) * HOUR_MS;
/** A book snapshot line in the archive's shape. */
const snapshot = (coin: string, time: number, bids: Side, asks: Side) =>
  JSON.stringify({
    time: "x",
    raw: {
      channel: "l2Book",
      data: {
        coin,
        time,
        levels: [bids, asks].map((s) =>
          s.map(([px, sz]) => ({ px: String(px), sz: String(sz), n: 1 })),
        ),
      },
    },
  });

/** A raw store of book files and its book list: files by (coin, hour) with their lines, and the keys the archive lacks. */
function rawStore(
  files: { coin: string; hour: number; lines: string[] }[],
  missing: { coin: string; hour: number }[],
) {
  const dir = mkdtempSync(path.join(tmpdir(), "polish-exam-price-"));
  const list: string[] = [];
  for (const f of files) {
    const key = bookKey(f.coin, f.hour);
    const bytes = lz4(f.lines.join("\n"));
    const file = path.join(dir, ...key.split("/"));
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, bytes);
    list.push(JSON.stringify({ key, bytes: bytes.length, sha256: sha(bytes) }));
  }
  for (const m of missing)
    list.push(JSON.stringify({ key: bookKey(m.coin, m.hour), missing: true }));
  return { dir, list: readBookList(`${list.join("\n")}\n`) };
}

/** A world's data: the coins' minute price columns from marks and trades' last prices, and funding rows. */
function dataOf(o: {
  start: number;
  minutes: number;
  marks: Map<string, Float64Array>;
  last?: Map<string, Float64Array>;
  funding: Map<string, FundingRow[]>;
}): Data {
  const nan = new Float64Array(o.minutes).fill(NaN);
  const forced: Forced = {
    t: Float64Array.of(),
    coin: Uint16Array.of(),
    user: Uint32Array.of(),
    side: Int8Array.of(),
    backstop: Uint8Array.of(),
    coins: [],
    px: Float64Array.of(),
    sz: Float64Array.of(),
    markPx: Float64Array.of(),
  };
  return {
    kit,
    start: o.start,
    minutes: o.minutes,
    coins,
    counted: [],
    forced,
    pc: new Map(
      [...fortyOf(coins)].map((c) => [
        c,
        priceColumn(o.marks.get(c) ?? nan, o.last?.get(c) ?? nan),
      ]),
    ),
    column: () => nan,
    funding: (coin) => o.funding.get(coin) ?? [],
    levels: () => [],
  };
}

const trade = (t: number, px: number, sz: number, side: 1 | -1, n: number) => ({
  t,
  px,
  sz,
  side,
  user: addr(n),
  tid: String(1_000 + n),
});

describe("the book first, then the tape (D19–D24)", () => {
  const start = Date.parse("2025-09-10T00:00:00Z");
  const minutes = 3 * 1_440;
  const at = (h: number, m = 0, s = 0) =>
    start + h * HOUR_MS + m * MINUTE_MS + s * 1_000;
  const marks = new Map([
    [
      "SOL",
      Float64Array.from(
        { length: minutes },
        (_, k) => 100 + 3 * Math.sin(k / 97) + (k % 5) / 10,
      ),
    ],
    [
      "kPEPE",
      Float64Array.from(
        { length: minutes },
        (_, k) => 1 + 0.01 * Math.cos(k / 61),
      ),
    ],
  ]);
  // Hourly settlements, but SOL's at 20:00 of the first day (an hour without a row: charged nothing, counted).
  const rows = (coin: string) => {
    const out: FundingRow[] = [];
    for (let h = start + HOUR_MS; h < start + minutes * MINUTE_MS; h += HOUR_MS)
      if (!(coin === "SOL" && h === at(20)))
        out.push([h, ((h / HOUR_MS) % 7) * 1e-5 - 2e-5, h + 17]);
    return out;
  };
  const funding = new Map(["SOL", "kPEPE"].map((c) => [c, rows(c)]));
  // SOL's book: level boundaries inside a $1,000 walk; a thin side (depth short); a crossed one (not usable).
  const BIDS: Side = [
    [99.9, 3],
    [99.8, 4],
    [99.5, 300],
  ];
  const ASKS: Side = [
    [100.1, 3],
    [100.2, 4],
    [100.5, 300],
  ];
  const THIN: Side = [
    [100.1, 2],
    [100.3, 3],
  ];
  const K_BIDS: Side = [[0.999, 10_000]];
  const K_ASKS: Side = [[1.001, 10_000]];
  const sol = (t: number, b = BIDS, a = ASKS) => snapshot("SOL", t, b, a);
  const kp = (t: number) => snapshot("kPEPE", t, K_BIDS, K_ASKS);
  const D = DAY_MS;
  // The spots: x_in and x_out of each.
  const x = {
    p1: at(10, 7, 5),
    p3: at(11, 20),
    p4: at(12, 30),
    p5: at(14, 0, 5),
    p6: at(15, 10),
    p7: at(16, 30),
    p8: at(17, 15),
    p9: at(18, 5),
    p10: at(19, 45),
  };
  const build = () =>
    rawStore(
      [
        // P1 and P2: live 5 s before the entry, a line that fails WAVE-H's schema; live exactly 10 s before the exit.
        {
          coin: "SOL",
          hour: hourOf(x.p1),
          lines: [sol(x.p1 - 5_000), "not a snapshot", sol(x.p1 + 1_000)],
        },
        {
          coin: "SOL",
          hour: hourOf(x.p1 + D),
          lines: [sol(x.p1 + D - 10_000)],
        },
        { coin: "SOL", hour: hourOf(x.p3 + D), lines: [sol(x.p3 + D - 1_000)] },
        // P4: 10.001 s before the entry, stale.
        { coin: "SOL", hour: hourOf(x.p4), lines: [sol(x.p4 - 10_001)] },
        { coin: "SOL", hour: hourOf(x.p4 + D), lines: [sol(x.p4 + D - 2_000)] },
        // P5: its hour's first snapshot comes after the entry, 5 s into the hour; the hour before's last is live.
        { coin: "kPEPE", hour: hourOf(x.p5), lines: [kp(x.p5 + 3_000)] },
        {
          coin: "kPEPE",
          hour: hourOf(x.p5) - HOUR_MS,
          lines: [kp(x.p5 - 7_000)],
        },
        {
          coin: "kPEPE",
          hour: hourOf(x.p5 + D),
          lines: [kp(x.p5 + D - 2_000)],
        },
        // P6: crossed, not usable.
        {
          coin: "SOL",
          hour: hourOf(x.p6),
          lines: [sol(x.p6 - 1_000, [[100.2, 10]], [[100.1, 10]])],
        },
        { coin: "SOL", hour: hourOf(x.p6 + D), lines: [sol(x.p6 + D - 1_000)] },
        // P7: no snapshot at or before the entry, which is not in its hour's first 10 s.
        { coin: "SOL", hour: hourOf(x.p7), lines: [sol(x.p7 + 600_000)] },
        { coin: "SOL", hour: hourOf(x.p7 + D), lines: [sol(x.p7 + D - 1_000)] },
        { coin: "SOL", hour: hourOf(x.p8), lines: [sol(x.p8 - 1_000)] },
        // P9: a thin ask, depth short at the book.
        {
          coin: "SOL",
          hour: hourOf(x.p9),
          lines: [sol(x.p9 - 1_000, BIDS, THIN)],
        },
        { coin: "SOL", hour: hourOf(x.p9 + D), lines: [sol(x.p9 + D - 1_000)] },
      ],
      [
        { coin: "SOL", hour: hourOf(x.p3) },
        { coin: "SOL", hour: hourOf(x.p8 + D) },
        { coin: "SOL", hour: hourOf(x.p10) },
        { coin: "SOL", hour: hourOf(x.p10 + D) },
      ],
    );
  // The tape: P1's legs beside a live book; P3, P4 and P6's entries; P10's short entry and its exit.
  const tape = [
    trade(x.p1 + 100, 100.15, 2, 1, 1),
    trade(x.p1 + 200, 100.3, 50, 1, 2),
    trade(x.p1 + 300, 99.85, 50, -1, 3),
    trade(x.p1 + D + 50, 99.7, 50, -1, 4),
    trade(x.p1 + D + 60, 100.2, 50, 1, 5),
    trade(x.p3 + 10, 100.2, 4, 1, 6),
    trade(x.p3 + 20, 100.4, 20, 1, 7),
    trade(x.p4 + 59_999, 100.0, 20, 1, 8),
    trade(x.p6 + 1_000, 100.25, 20, 1, 9),
    trade(x.p10 + 10, 100.0, 3, 1, 10),
    trade(x.p10 + 20, 100.1, 2, 1, 11),
    trade(x.p10 + D + 30, 99.0, 30, -1, 12),
  ].sort((a, b) => a.t - b.t);
  const tapeAt = (coin: string, buy: boolean, t: number): Trade[] =>
    coin !== "SOL"
      ? []
      : tape
          .filter(
            (r) => r.side === (buy ? 1 : -1) && r.t >= t && r.t < t + 60_000,
          )
          .map(({ t, px, sz, user, tid }) => ({ t, px, sz, user, tid }));
  const spot = (iid: number, dir: 1 | -1, xIn: number): ExamSpot => ({
    iid,
    dir,
    xIn,
    xOut: xIn + D,
    base: 1.5,
  });
  const spots: ExamSpot[] = [
    spot(SOL, 1, x.p1),
    spot(SOL, -1, x.p1),
    spot(SOL, 1, x.p3),
    spot(SOL, 1, x.p4),
    spot(KPEPE, -1, x.p5),
    spot(SOL, 1, x.p6),
    spot(SOL, 1, x.p7),
    spot(SOL, 1, x.p8),
    spot(SOL, 1, x.p9),
    { ...spot(SOL, 1, x.p10), base: null },
  ];
  const market = (coin: string, iid: number): Market =>
    kit.panel.marketFrom({
      iid,
      symbol: coin,
      category: "crypto",
      start,
      end: start + minutes * MINUTE_MS,
      firstTrade: null,
      retired: null,
      marks: Array.from(marks.get(coin)!, (v) => (Number.isNaN(v) ? null : v)),
      klines: { minute: [], trades: [], volume: [] },
      funding: funding.get(coin)!,
    });

  it("is WAVE-H's priceSpot, every leg's print and every priced field to the bit, where every instant has a mark", async () => {
    const { dir, list } = build();
    let reads = 0;
    const reader = bookReader(dir, { open: true }, list, SEALED, () => {
      reads += 1;
      return Promise.resolve();
    });
    const d = dataOf({ start, minutes, marks, funding });
    const got = await priceAtTheBook(d, reader.find, tapeAt, spots);
    // Each book file read once: 8 of the entries' hours, 7 of the exits'.
    expect(reads).toBe(15);
    const shelf = shelfOf(list);
    const ctx = {
      store: dir,
      list: new Map(),
      coins,
      kit,
      pace: () => Promise.resolve(),
      log: () => undefined,
    };
    spots.forEach((s, i) => {
      const coin = s.iid === SOL ? "SOL" : "kPEPE";
      const tapes = new Map([
        [`${i}|0`, tapeAt(coin, s.dir > 0, s.xIn)],
        [`${i}|1`, tapeAt(coin, s.dir < 0, s.xOut)],
      ]);
      const w = priceSpot(
        ctx,
        { open: true },
        shelf,
        tapes,
        market(coin, s.iid),
        {
          slice: 0,
          iid: s.iid,
          t: s.xIn - 120_000,
          side: -s.dir as 1 | -1,
          dir: s.dir,
          xIn: s.xIn,
          xOut: s.xOut,
          method: "market",
          accounts: [],
        } satisfies Spot,
        String(i),
        s.base,
      );
      expect(got[i], `spot ${i}`).toEqual({ priced: w.priced, legs: w.legs });
    });
    expect(reader.read).toEqual(shelf.read);
    expect(reader.read.get(bookKey("SOL", hourOf(x.p1)))).toEqual({
      lines: 3,
      failed: 1,
    });
    // Every branch the world was built to reach.
    expect(
      got.map((g) => g.legs.map((l) => `${l.source} ${l.why ?? ""}`.trim())),
    ).toEqual([
      ["book", "book"],
      ["book", "book"],
      ["tape no book file", "book"],
      ["tape stale", "book"],
      ["book", "book"],
      ["tape not usable", "book"],
      ["none no snapshot", "book"],
      ["book", "none no book file"],
      ["book", "book"],
      ["tape no book file", "tape no book file"],
    ]);
    expect(got.map((g) => [g.priced.unpriced, g.priced.depthShort])).toEqual([
      [null, false],
      [null, false],
      [null, false],
      [null, false],
      [null, false],
      [null, false],
      ["no book and no trade at the entry", false],
      ["no book and no trade at the exit", false],
      [null, true],
      [null, true],
    ]);
    // P1 by hand: $1,000 over the asks' three levels, its Q sold over the bids; the tape beside each book leg.
    const q1 = 3 + 4 + (1_000 - 3 * 100.1 - 4 * 100.2) / 100.5;
    const pOut = (3 * 99.9 + 4 * 99.8 + (q1 - 7) * 99.5) / q1;
    const p1 = got[0]!;
    expect(p1.priced.legs[0]).toMatchObject({ deepest: 3, short: false });
    expect(p1.priced.legs[0]!.price).toBeCloseTo(1_000 / q1, 12);
    expect(p1.priced.legs[1]!.price).toBeCloseTo(pOut, 12);
    expect(p1.priced.gross).toBeCloseTo((pOut - 1_000 / q1) * q1 * 10, 9);
    expect(p1.legs[0]).toMatchObject({ age: 5_000, trades: 2, tids: [] });
    expect(p1.legs[1]).toMatchObject({ age: 10_000, trades: 1 });
    expect(p1.legs[0]!.tapeMinusBook).not.toBeNull();
    // P5 read the hour before's book, 7 s old; P3's tape names its trades.
    expect(got[4]!.legs[0]).toMatchObject({
      age: 7_000,
      file: bookKey("kPEPE", hourOf(x.p5) - HOUR_MS),
    });
    expect(got[2]!.legs[0]!.tids).toEqual(["1006", "1007"]);
    // SOL's hour without a row lies inside every SOL hold, counted where both legs priced; P10 has no BASE cell, so no excess.
    expect(got.map((g) => g.priced.fundingMissing)).toEqual([
      1, 1, 1, 1, 0, 1, 0, 0, 1, 1,
    ]);
    expect(got[9]!.priced.excess).toBeNull();
    expect(got[0]!.priced.excess).toBe(got[0]!.priced.grossOnMarks! - 1.5);
  });

  it("asks for every book file it needs before reading one, holds each to its line, and reads FRESH's months only under the opened seal", async () => {
    const { dir, list } = build();
    let reads = 0;
    const pace = () => {
      reads += 1;
      return Promise.resolve();
    };
    const off = at(21);
    await expect(
      bookReader(dir, { open: true }, list, SEALED, pace).find("SOL", off),
    ).rejects.toThrow(BooksNeeded);
    expect(reads).toBe(0);
    const key = bookKey("SOL", hourOf(x.p1));
    writeFileSync(path.join(dir, ...key.split("/")), lz4("changed"));
    await expect(
      bookReader(dir, { open: true }, list, SEALED, pace).find("SOL", x.p1),
    ).rejects.toThrow(StoreError);
    // A key listed missing is "no file", nothing read.
    reads = 0;
    expect(
      await bookReader(dir, { open: true }, list, SEALED, pace).find(
        "SOL",
        x.p3,
      ),
    ).toEqual({ atHour: "no file", before: null, age: null, file: null });
    expect(reads).toBe(0);
    // FRESH's months: refused while the exam's seal is closed, and while WAVE-H's gate is; read once both are open.
    const fresh = Date.parse("2026-07-20T10:00:00Z");
    const f = rawStore(
      [{ coin: "SOL", hour: fresh, lines: [sol(fresh + 1_000)] }],
      [],
    );
    await expect(
      bookReader(f.dir, { open: true }, f.list, SEALED, pace).find(
        "SOL",
        fresh + 2_000,
      ),
    ).rejects.toThrow(SealedError);
    await expect(
      bookReader(
        f.dir,
        { open: false },
        f.list,
        { examFrozen: true },
        pace,
      ).find("SOL", fresh + 2_000),
    ).rejects.toThrow(Unopened);
    const open = await bookReader(
      f.dir,
      { open: true },
      f.list,
      { examFrozen: true },
      pace,
    ).find("SOL", fresh + 2_000);
    expect(open).toMatchObject({ age: 1_000, file: bookKey("SOL", fresh) });
    // At FRESH_END, never.
    const end = Date.parse("2026-11-16T00:00:00Z");
    const e = rawStore([{ coin: "SOL", hour: end, lines: [sol(end)] }], []);
    await expect(
      bookReader(
        e.dir,
        { open: true },
        e.list,
        { examFrozen: true },
        pace,
      ).find("SOL", end + 20_000),
    ).rejects.toThrow(SealedError);
  });
});

describe("the minute price where the kit has no mark (D23, D25, D26)", () => {
  const start = Date.parse("2026-07-07T00:00:00Z");
  const minutes = 3 * 1_440;
  const xIn = start + 10 * HOUR_MS + 2 * MINUTE_MS;
  const xOut = xIn + DAY_MS;
  const quote = (px: number) => ({
    source: "tape" as const,
    why: "no book file" as const,
    trades: [{ t: 0, px, sz: 1e6, user: addr(1), tid: "1" }],
  });
  const rows: FundingRow[] = [];
  for (let h = start + HOUR_MS; h < start + minutes * MINUTE_MS; h += HOUR_MS)
    rows.push([h, 1e-5, h + 20]);

  it("charges each settlement at the minute price before its hour, the last trade's where no mark is, and leaves a settlement with neither unpriced", () => {
    // The marks of a whole day (past the kit's CUT the kit could not read them anyway); a trade 3 minutes before each hour.
    const mark = new Float64Array(minutes).fill(200);
    const day = (start + DAY_MS - start) / MINUTE_MS;
    for (let k = day; k < 2 * day; k++) mark[k] = NaN;
    const last = new Float64Array(minutes).fill(NaN);
    for (let k = day; k < 2 * day; k += 60) last[k + 56] = 210;
    last[(xOut - start) / MINUTE_MS] = 205;
    const s: ExamSpot = { iid: SOL, dir: 1, xIn, xOut, base: 2 };
    const d = dataOf({
      start,
      minutes,
      marks: new Map([["SOL", mark]]),
      last: new Map([["SOL", last]]),
      funding: new Map([["SOL", rows]]),
    });
    const p = pricedOf(d, "SOL", s, quote(200), quote(201));
    expect(p.unpriced).toBeNull();
    // 24 settlements in (x_in, x_out]: 13 before 2026-07-08 00:00 at the mark, 01:00 … 10:00 of the 8th at the
    // trade's 210 (the 00:00 one still has a mark in force, 5 minutes stale at most), Q = 5 units, longs pay.
    const Q = 1_000 / 200;
    const sum = 14 * 1e-5 * 200 + 10 * 1e-5 * 210;
    expect(p.funding).toBeCloseTo(-sum * Q * 10, 9);
    // x_out's minute has no mark: the trade in it, 205.
    expect(p.grossOnMarks).toBeCloseTo((205 / 200 - 1) * 1e4, 9);
    expect(p.excess).toBeCloseTo((205 / 200 - 1) * 1e4 - 2, 9);
    // No trade in the 5 minutes before one of those hours: funding without a price.
    const thin = Float64Array.from(last);
    thin[day + 5 * 60 + 56] = NaN;
    const u = pricedOf(
      dataOf({
        start,
        minutes,
        marks: new Map([["SOL", mark]]),
        last: new Map([["SOL", thin]]),
        funding: new Map([["SOL", rows]]),
      }),
      "SOL",
      s,
      quote(200),
      quote(201),
    );
    expect(u).toMatchObject({
      unpriced: "funding without a price",
      net: null,
      depthShort: false,
    });
    // An exit minute with neither a mark nor a trade: no gross on marks, so no excess.
    const xNone = xOut + 10 * MINUTE_MS;
    const g = pricedOf(d, "SOL", { ...s, xOut: xNone }, quote(200), quote(201));
    expect(
      Number.isNaN(
        priceColumn(mark, last)[Math.floor((xNone - start) / MINUTE_MS)]!,
      ),
    ).toBe(true);
    expect([g.grossOnMarks, g.excess]).toEqual([null, null]);
  });
});

describe("BASE on the deciding days (D27)", () => {
  it("pools every segment's whole minutes by 4-hour block; one segment is the exploration's baseOf", () => {
    const start = Date.parse("2026-05-29T00:00:00Z");
    const n = 6 * 1_440;
    const pc = Float64Array.from({ length: n }, (_, k) => 50 + (k * k) / 1e6);
    pc[1_000] = NaN;
    const h = 1_440;
    const seg1 = { from: start + DAY_MS, to: start + 3 * DAY_MS };
    const seg2 = { from: start + 4 * DAY_MS, to: start + 6 * DAY_MS };
    expect(baseOver(pc, start, [seg1], h)).toEqual(
      baseOf(pc, start, seg1.from, seg1.to, h),
    );
    // By hand: each block's minutes of both segments, both prices present.
    const sum = [0, 0, 0, 0, 0, 0];
    const count = [0, 0, 0, 0, 0, 0];
    for (const s of [seg1, seg2])
      for (let t = s.from; t < s.to - h * MINUTE_MS; t += MINUTE_MS) {
        const i = (t - start) / MINUTE_MS;
        const a = pc[i]!;
        const b = pc[i + h]!;
        if (Number.isNaN(a) || Number.isNaN(b)) continue;
        const block = Math.floor((t % DAY_MS) / (4 * HOUR_MS));
        sum[block]! += (b / a - 1) * 1e4;
        count[block]! += 1;
      }
    const pooled = baseOver(pc, start, [seg1, seg2], h);
    pooled.forEach((v, k) => expect(v).toBeCloseTo(sum[k]! / count[k]!, 9));
    expect(count).toEqual([480, 480, 480, 480, 480, 480]);
    // A block with no minute has no BASE: its positions have no excess.
    expect(baseCell(pooled, start + 5 * HOUR_MS)).toBe(pooled[1]);
    expect(baseCell([NaN, 1, 2, 3, 4, 5], start + HOUR_MS)).toBeNull();
  });
});
