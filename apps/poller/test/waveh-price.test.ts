/**
 * WAVE-H's prices, positions, statistic and verdict (rules.md H6–H12), each
 * in a synthetic world: the book at x across an hour, live at 10 s, usable;
 * the tape and its shortfall; a position at the book equal to a hand
 * computation; the fee and funding's sign; every verdict branch and order.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { toBook } from "../src/market1/book.js";
import { loadResearch, type Research } from "../src/paper/research.js";
import { HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import type { Counted, Rec } from "../src/waveh/fills.js";
import { episodeSpots, waveSpots } from "../src/waveh/positions.js";
import {
  FEE,
  bookAt,
  pricePosition,
  tapeAt,
  type Trade,
} from "../src/waveh/price.js";
import { Z, decide, sentence, verdict } from "../src/waveh/verdict.js";

let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const H = Date.parse("2025-07-15T12:00:00Z");
const book = (ts: number, bid = 99, ask = 101) =>
  toBook(ts, [[String(bid), "10"]], [[String(ask), "10"]]);

describe("the book at x (H8)", () => {
  it("takes x's hour's snapshot, live within 10 s and usable", () => {
    expect(bookAt(H + 30_000, book(H + 25_000), "no file")).toEqual({
      book: book(H + 25_000),
    });
    expect(bookAt(H + 30_000, book(H + 20_000), null)).toEqual({
      book: book(H + 20_000),
    });
    expect(bookAt(H + 30_000, book(H + 19_999), null)).toEqual({
      why: "stale",
    });
    expect(bookAt(H + 30_000, book(H + 25_000, 101, 101), null)).toEqual({
      why: "not usable",
    });
    expect(
      bookAt(H + 30_000, toBook(H + 25_000, [], [["101", "1"]]), null),
    ).toEqual({ why: "not usable" });
  });

  it("reads the hour before only in the first 10 s of x's hour", () => {
    expect(bookAt(H + 9_000, null, book(H - 300))).toEqual({
      book: book(H - 300),
    });
    expect(bookAt(H + 9_000, "no file", book(H - 300))).toEqual({
      book: book(H - 300),
    });
    expect(bookAt(H + 10_000, null, book(H - 1))).toEqual({
      why: "no snapshot",
    });
    expect(bookAt(H + 9_000, null, null)).toEqual({ why: "no snapshot" });
    expect(bookAt(H + 9_000, "no file", "no file")).toEqual({
      why: "no book file",
    });
    expect(bookAt(H + 9_900, "no file", book(H - 200))).toEqual({
      why: "no book file",
    });
  });
});

const rec = (user: string, over: Partial<Rec["fill"]> = {}): Rec => ({
  user,
  fill: {
    coin: "SOL",
    px: "100",
    sz: "1",
    side: "B",
    time: H,
    startPosition: "0",
    crossed: true,
    fee: "0.045",
    tid: "1",
    ...over,
  },
});

describe("the tape (H8, R2)", () => {
  it("keeps the coin's takers on our side in [x, x + 60 s), no backstop, each once, in H4's order", () => {
    const recs = [
      rec("0xb", { tid: "2", time: H + 5 }),
      rec("0xa", { tid: "9", time: H + 5 }),
      rec("0xa", { tid: "10", time: H + 5 }),
      rec("0xa", { tid: "10", time: H + 5 }),
      rec("0xc", { time: H }),
      rec("0xd", { time: H + 59_999 }),
      rec("0xe", { time: H + 60_000 }),
      rec("0xf", { time: H - 1 }),
      rec("0xg", { crossed: false }),
      rec("0xh", { side: "A" }),
      rec("0xi", { coin: "kPEPE" }),
      rec("0xj", {
        liquidation: { liquidatedUser: "0xz", markPx: "1", method: "backstop" },
      }),
      rec("0xk", {
        time: H + 1,
        liquidation: { liquidatedUser: "0xk", markPx: "1", method: "market" },
      }),
    ];
    expect(
      tapeAt(recs, "SOL", true, H).map((t) => `${t.t - H}|${t.user}|${t.tid}`),
    ).toEqual([
      "0|0xc|1",
      "1|0xk|1",
      "5|0xa|9",
      "5|0xa|10",
      "5|0xb|2",
      "59999|0xd|1",
    ]);
    expect(tapeAt(recs, "SOL", false, H).map((t) => t.user)).toEqual(["0xh"]);
  });
});

describe("a position's price (H7–H9)", () => {
  const T0 = Date.parse("2025-07-14T00:00:00Z");
  const n = (3 * 86_400_000) / MINUTE_MS;
  const t = Date.parse("2025-07-15T10:00:00Z");
  const xIn = t + 120_000;
  const xOut = xIn + 86_400_000;
  const settle = Date.parse("2025-07-15T15:00:00Z");
  const market = () => {
    const marks: number[] = new Array<number>(n).fill(100);
    marks[(xOut - T0) / MINUTE_MS] = 110;
    marks[(settle - T0) / MINUTE_MS - 1] = 105;
    return kit.panel.marketFrom({
      iid: 5,
      symbol: "SOL",
      category: "crypto",
      start: T0,
      end: T0 + n * MINUTE_MS,
      firstTrade: null,
      retired: null,
      marks,
      klines: { minute: [], trades: [], volume: [] },
      funding: [[settle, 0.0001, settle + 17]],
    });
  };
  const entry = {
    source: "book" as const,
    book: toBook(
      xIn - 300,
      [["99", "50"]],
      [
        ["100", "6"],
        ["101", "10"],
      ],
    ),
  };
  const exit = {
    source: "book" as const,
    book: toBook(
      xOut - 300,
      [
        ["110", "5"],
        ["109", "20"],
      ],
      [["111", "50"]],
    ),
  };

  it("walks the book as a taker and charges 4.5 bps a leg and funding, longs paying a positive rate", () => {
    const p = pricePosition(kit, market(), {
      dir: 1,
      xIn,
      xOut,
      entry,
      exit,
      base: 200,
    });
    // By hand: Q = 6 + 400 ÷ 101; out 5 at 110 and the rest at 109.
    const Q = 6 + 400 / 101;
    const out = 550 + 109 * (Q - 5);
    expect(p.unpriced).toBeNull();
    expect(p.gross).toBeCloseTo(906.831683, 5);
    expect(p.fees).toBeCloseTo(4.5 + 4.90807426, 6);
    expect(p.funding).toBeCloseTo(-1.04584158, 6);
    expect(p.net).toBeCloseTo(896.37776, 3);
    expect(p.net).toBeCloseTo(
      (out - 1000) * 10 - (0.45 + FEE * out) * 10 - 0.0105 * Q * 10,
      9,
    );
    expect(p.grossOnMarks).toBeCloseTo(1000, 9);
    expect(p.excess).toBeCloseTo(800, 9);
    expect(p.entryCost).toBeCloseTo((1000 / Q / 99.5 - 1) * 1e4, 9);
    expect(p.legs.map((l) => [l!.source, l!.deepest, l!.short])).toEqual([
      ["book", 2, false],
      ["book", 2, false],
    ]);
    expect(p.depthShort).toBe(false);
  });

  it("prices a short the other way and pays it funding", () => {
    const p = pricePosition(kit, market(), {
      dir: -1,
      xIn,
      xOut,
      entry: {
        source: "book",
        book: toBook(xIn, [["100", "20"]], [["101", "1"]]),
      },
      exit: {
        source: "book",
        book: toBook(xOut, [["90", "1"]], [["110", "20"]]),
      },
      base: null,
    });
    // In at 100 (10 units), out at 110: −1,000 bps; funding received.
    expect(p.gross).toBeCloseTo(-1000, 9);
    expect(p.funding).toBeCloseTo(0.0105 * 10 * 10, 9);
    expect(p.excess).toBeNull();
    expect(p.grossOnMarks).toBeCloseTo(-1000, 9);
    // A short sells into the bids: at 100 against a mid of 100.5, it gains on the mid.
    expect(p.entryCost).toBeCloseTo(-(100 / 100.5 - 1) * 1e4, 9);
  });

  it("walks the tape's takers, short of the leg when the minute holds too little", () => {
    const trades: Trade[] = [
      { t: xIn, px: 100, sz: 3, user: "0xa", tid: "1" },
      { t: xIn + 10, px: 102, sz: 2, user: "0xb", tid: "2" },
    ];
    const p = pricePosition(kit, market(), {
      dir: 1,
      xIn,
      xOut,
      entry: { source: "tape", why: "no book file", trades },
      exit,
      base: null,
    });
    // 300 + 204 of the $1,000; the rest at the last trade's 102.
    expect(p.legs[0]).toEqual({
      source: "tape",
      why: "no book file",
      price: 1000 / (3 + 2 + 496 / 102),
      deepest: 2,
      short: true,
      at: [xIn, xIn + 10],
    });
    expect(p.depthShort).toBe(true);
    expect(p.entryCost).toBeNull();
    expect(p.net).not.toBeNull();
  });

  it("leaves a leg with neither book nor trade unpriced, and a settlement without a mark", () => {
    const none = pricePosition(kit, market(), {
      dir: 1,
      xIn,
      xOut,
      entry: null,
      exit,
      base: null,
    });
    expect(none.unpriced).toBe("no book and no trade at the entry");
    expect(
      pricePosition(kit, market(), {
        dir: 1,
        xIn,
        xOut,
        entry: { source: "tape", why: "stale", trades: [] },
        exit,
        base: null,
      }).unpriced,
    ).toBe("no book and no trade at the entry");
    expect(
      pricePosition(kit, market(), {
        dir: 1,
        xIn,
        xOut,
        entry,
        exit: null,
        base: null,
      }).unpriced,
    ).toBe("no book and no trade at the exit");
    const mk = market();
    mk.marks.fill(
      NaN,
      (settle - T0) / MINUTE_MS - 7,
      (settle - T0) / MINUTE_MS,
    );
    const marks = Array.from(mk.marks, (v) => (Number.isNaN(v) ? null : v));
    const holed = kit.panel.marketFrom({
      iid: 5,
      symbol: "SOL",
      category: "crypto",
      start: T0,
      end: T0 + n * MINUTE_MS,
      firstTrade: null,
      retired: null,
      marks,
      klines: { minute: [], trades: [], volume: [] },
      funding: [[settle, 0.0001, settle + 17]],
    });
    expect(
      pricePosition(kit, holed, { dir: 1, xIn, xOut, entry, exit, base: null })
        .unpriced,
    ).toBe("funding without a mark");
  });
});

describe("the positions (H6, H7, H13)", () => {
  const c = (n: number, t: number, iid = 5, side: 1 | -1 = -1): Counted => ({
    t,
    iid,
    addr: `0x${n.toString(16).padStart(40, "0")}`,
    side,
    tid: String(t),
    method: n === 9 ? "backstop" : "market",
  });

  it("opens against the forced side 2 minutes after t for 24 hours, entries in [from, to) only, an earlier entry still blocking", () => {
    // SOL's entry at H − 5 min blocks its waves at H + 1 and H + 2 min; kPEPE's wave (accounts 8
    // and 9, the first in PUMP) enters at H + 3 min by account 9's backstop and blocks H + 4 min.
    const fills = [
      c(1, H - 10 * MINUTE_MS),
      c(2, H - 5 * MINUTE_MS),
      c(3, H + MINUTE_MS),
      c(4, H + 2 * MINUTE_MS),
      c(8, H + 2.5 * MINUTE_MS, 200, 1),
      c(9, H + 3 * MINUTE_MS, 15, 1),
      c(5, H + 4 * MINUTE_MS, 15, 1),
    ];
    const all = waveSpots(0, fills, 0, Infinity);
    expect(all.map((s) => [s.t - H, s.iid, s.side, s.dir])).toEqual([
      [-5 * MINUTE_MS, 5, -1, 1],
      [3 * MINUTE_MS, 15, 1, -1],
    ]);
    const late = waveSpots(0, fills, H, Infinity);
    expect(late).toHaveLength(1);
    expect(late[0]).toMatchObject({
      t: H + 3 * MINUTE_MS,
      xIn: H + 3 * MINUTE_MS + 120_000,
      xOut: H + 3 * MINUTE_MS + 120_000 + 86_400_000,
      method: "backstop",
      accounts: [c(8, 0).addr, c(9, 0).addr],
    });
    expect(waveSpots(0, fills, H, Infinity, HOUR_MS)[0]!.xIn).toBe(
      H + 3 * MINUTE_MS + HOUR_MS,
    );
    expect(waveSpots(0, fills, 0, H)).toHaveLength(1);
    // [from, to): an entry at `to` is not in it.
    expect(waveSpots(0, fills, 0, H + 3 * MINUTE_MS)).toHaveLength(1);
    const eps = episodeSpots(0, fills, 0, Infinity);
    expect(eps.map((e) => [e.t - H, e.alone, e.method])).toEqual([
      [-10 * MINUTE_MS, true, "market"],
      [2.5 * MINUTE_MS, true, "market"],
      [3 * MINUTE_MS, false, "backstop"],
    ]);
  });
});

describe("the verdict (H11, H12)", () => {
  const base = {
    mean: 120,
    se: 30,
    meanExcess: 10,
    notAtBookShare: 0,
    days: 20,
    coins: 10,
  };

  it("decides in M11's order with z = 2.58 and MARKET-1's δ and minimums", () => {
    expect(Z).toBe(2.58);
    expect(verdict(base)).toBe("HOLDS");
    expect(verdict({ ...base, notAtBookShare: 0.1001 })).toBe("WITHHELD");
    expect(verdict({ ...base, notAtBookShare: 0.1 })).toBe("HOLDS");
    expect(verdict({ ...base, se: null })).toBe("TOO FEW TO TELL");
    expect(verdict({ ...base, days: 19 })).toBe("TOO FEW TO TELL");
    expect(verdict({ ...base, coins: 9 })).toBe("TOO FEW TO TELL");
    expect(verdict({ ...base, meanExcess: 0 })).toBe("NOT SETTLED");
    expect(verdict({ ...base, meanExcess: null })).toBe("NOT SETTLED");
    // m − 2.58 SE is 0 exactly: not above zero.
    expect(verdict({ ...base, mean: 77.4 })).toBe("NOT SETTLED");
    expect(verdict({ ...base, mean: 77.5 })).toBe("HOLDS");
    // m + 2.58 SE below +50: DOES NOT HOLD, before HOLDS when both hold.
    expect(verdict({ ...base, mean: -27.5 })).toBe("DOES NOT HOLD");
    expect(verdict({ ...base, mean: -27.4 })).toBe("NOT SETTLED");
    expect(verdict({ ...base, mean: 10, se: 1 })).toBe("DOES NOT HOLD");
    // m + z·SE of exactly +50 is not below it.
    expect(verdict({ ...base, mean: 50, se: 0, meanExcess: 0 })).toBe(
      "NOT SETTLED",
    );
    expect(verdict({ ...base, notAtBookShare: 0.5, se: null })).toBe(
      "WITHHELD",
    );
  });

  it("says the largest mean not ruled out only when not settled", () => {
    expect(sentence("NOT SETTLED", 40, 10)).toBe(
      "No mean result as large as 65.8 bps a position was seen.",
    );
    for (const v of [
      "HOLDS",
      "DOES NOT HOLD",
      "WITHHELD",
      "TOO FEW TO TELL",
    ] as const)
      expect(sentence(v, 40, 10)).toBe(
        "Holds and does not hold are verdicts on this test, never instructions to trade.",
      );
  });

  it("counts the unpriced and the depth-short against the set, never the tape-priced", () => {
    const priced = (
      net: number | null,
      depthShort = false,
      excess: number | null = 5,
    ) => ({ net, depthShort, excess }) as never;
    const day = 86_400_000;
    const set = [
      ...Array.from({ length: 25 }, (_, i) => ({
        t: H + (i % 21) * day,
        iid: i % 11,
        priced: priced(100 + (i % 7) * 10),
      })),
      { t: H, iid: 1, priced: priced(null) },
      { t: H, iid: 1, priced: priced(80, true, null) },
    ];
    const d = decide(kit, set);
    expect([d.positions, d.priced, d.unpriced, d.depthShort]).toEqual([
      27, 26, 1, 1,
    ]);
    expect(d.notAtBookShare).toBeCloseTo(2 / 27, 12);
    expect(d.withoutExcess).toBe(1);
    expect(d.meanExcess).toBe(5);
    expect(d.stat!.n).toBe(26);
    expect([d.stat!.days, d.stat!.markets]).toEqual([21, 11]);
    expect(decide(kit, set.slice(0, 2)).verdict).toBe("TOO FEW TO TELL");
    expect(
      decide(kit, [
        ...set,
        { t: H, iid: 1, priced: priced(null) },
        { t: H, iid: 1, priced: priced(null) },
      ]).verdict,
    ).toBe("WITHHELD");
  });
});
