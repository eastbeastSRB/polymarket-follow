/**
 * MARKET-1's rules as pure functions (the plan's part 3): synthetic worlds
 * for M4–M12, every output asserted, the edges pinned.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { START } from "../src/market1/assemble.js";
import { namedSets, computeAll } from "../src/market1/compute.js";
import type { Liq } from "../src/market1/fills.js";
import {
  baseOf,
  basketWeek,
  blockOf,
  othersMove,
  spotsOf,
  type Position,
} from "../src/market1/lines.js";
import {
  atBook,
  pricePosition,
  type LegQuote,
  type Priced,
} from "../src/market1/price.js";
import {
  DROP_BPS,
  MIN_DAYS,
  MIN_MARKETS,
  NOT_AT_BOOK_LIMIT,
  sentence,
  twoWay,
  verdict,
} from "../src/market1/stats.js";
import { summarize, tailOf } from "../src/market1/summary.js";
import { accountsAt, episodes, waveEntries } from "../src/market1/waves.js";
import { marketThrough } from "../src/paper/market.js";
import {
  loadResearch,
  type Market,
  type PanelFile,
  type Research,
} from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";

let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const T0 = Date.parse("2026-11-20T10:00:00Z");
const MIN = MINUTE_MS;
const liq = (
  t: number,
  addr: string,
  side: 1 | -1 = -1,
  iid = 8,
  tid = "1",
): Liq => ({ t, iid, addr, side, tid });

describe("the wave and its entries (M5)", () => {
  it("needs two different accounts of one side in the 60 minutes up to t, both ends included", () => {
    expect(waveEntries([liq(T0, "a"), liq(T0 + 1, "a")])).toEqual([]);
    expect(waveEntries([liq(T0, "a", -1), liq(T0 + 1, "b", 1)])).toEqual([]);
    const at60 = waveEntries([liq(T0, "a"), liq(T0 + 60 * MIN, "b")]);
    expect(at60.map((e) => [e.fill.t, e.accounts])).toEqual([
      [T0 + 60 * MIN, ["a", "b"]],
    ]);
    expect(waveEntries([liq(T0, "a"), liq(T0 + 60 * MIN + 1, "b")])).toEqual(
      [],
    );
    // A fill of another market counts toward the wave.
    expect(
      waveEntries([liq(T0, "a", -1, 10), liq(T0 + MIN, "b", -1, 8)]).map(
        (e) => e.fill.iid,
      ),
    ).toEqual([8]);
  });

  it("counts a fill of the same millisecond that sorts after this one (by instants, not by order)", () => {
    const fills = [liq(T0, "a", -1, 8), liq(T0, "b", -1, 10)];
    expect(accountsAt(fills, T0, -1)).toEqual(new Set(["a", "b"]));
    expect(waveEntries(fills).map((e) => e.fill.iid)).toEqual([8, 10]);
  });

  it("blocks a market's entry for 60 minutes after its last, of either side, both ends included", () => {
    const fills = [
      liq(T0, "a"),
      liq(T0 + 1, "b"),
      liq(T0 + 30 * MIN, "c", 1),
      liq(T0 + 30 * MIN + 1, "d", 1),
      liq(T0 + 60 * MIN + 1, "e"),
      liq(T0 + 60 * MIN + 2, "f"),
    ];
    // T0+1 enters; the forced buys at +30 min are blocked; at +60 min + 2 the block is over (> 60 min).
    expect(waveEntries(fills).map((e) => e.fill.t)).toEqual([
      T0 + 1,
      T0 + 60 * MIN + 2,
    ]);
    const exactly = [
      liq(T0, "a"),
      liq(T0 + 1, "b"),
      liq(T0 + 1 + 60 * MIN, "c"),
    ];
    expect(waveEntries(exactly).map((e) => e.fill.t)).toEqual([T0 + 1]);
  });

  it("episodes chain while the market's gap is at most 60 minutes", () => {
    const fills = [
      liq(T0, "a"),
      liq(T0 + 60 * MIN, "a"),
      liq(T0 + 120 * MIN, "a"),
      liq(T0 + 180 * MIN + 1, "a"),
      liq(T0 + 10 * MIN, "b", 1, 10),
    ].sort((x, y) => x.t - y.t);
    expect(episodes(fills).map((e) => [e.fill.iid, e.fill.t])).toEqual([
      [8, T0],
      [10, T0 + 10 * MIN],
      [8, T0 + 180 * MIN + 1],
    ]);
  });
});

describe("the positions of every line (M6, M12)", () => {
  const at = { cut: T0 - DAY_MS, start: T0 };
  it("opens WAVE 2 minutes after t for 24 hours against the forced side; P before START; B3, B7, B1, B10", () => {
    const small = [
      liq(T0 - 2 * HOUR_MS, "p"),
      liq(T0 - 2 * HOUR_MS + 1, "q"),
      liq(T0, "a"),
      liq(T0, "b", -1, 10),
      liq(T0 + 5 * HOUR_MS, "c", 1, 31),
    ];
    const large = [liq(T0 + HOUR_MS, "z", 1, 6)];
    const spots = spotsOf(small, large, at, Infinity, () => true);
    const by = (line: string) =>
      spots
        .filter((s) => s.line === line)
        .map((s) => [s.iid, s.t, s.dir, s.xIn - s.t, s.xOut - s.xIn]);
    expect(by("P")).toEqual([[8, T0 - 2 * HOUR_MS + 1, 1, 120_000, DAY_MS]]);
    // Two accounts at the same millisecond: both markets enter.
    expect(by("WAVE")).toEqual([
      [8, T0, 1, 120_000, DAY_MS],
      [10, T0, 1, 120_000, DAY_MS],
    ]);
    expect(by("B3_60").map((x) => x[3])).toEqual([HOUR_MS, HOUR_MS]);
    expect(by("B3_180").map((x) => x[3])).toEqual([3 * HOUR_MS, 3 * HOUR_MS]);
    expect(by("B7")).toEqual([
      [6, T0, 1, 120_000, DAY_MS],
      [7, T0, 1, 120_000, DAY_MS],
      [6, T0, 1, 120_000, DAY_MS],
      [7, T0, 1, 120_000, DAY_MS],
    ]);
    // Episodes from START: 8 at T0 (its earlier fills ended over 60 minutes before), 10, and 31 alone.
    expect(by("B1")).toEqual([
      [8, T0, 1, 120_000, DAY_MS],
      [10, T0, 1, 120_000, DAY_MS],
      [31, T0 + 5 * HOUR_MS, -1, 120_000, DAY_MS],
    ]);
    expect(by("B10")).toEqual([[6, T0 + HOUR_MS, -1, 120_000, DAY_MS]]);
    const wave = spots.find((s) => s.line === "WAVE" && s.iid === 10)!;
    expect(wave).toMatchObject({ accounts: ["a", "b"], coins: 2, side: -1 });
  });

  it("counts WAVE from START, the first whole UTC day of the books; a wave before it is P (M1, M12)", () => {
    const before = Date.parse("2026-11-10T23:59:59.999Z");
    const first = Date.parse("2026-11-11T00:00:00.000Z");
    const spots = spotsOf(
      [
        liq(before, "a"),
        liq(before, "b"),
        liq(first, "c", -1, 10),
        liq(first, "d", -1, 10),
      ],
      [],
      { cut: Date.parse("2026-11-07T00:00:00Z"), start: START },
      Infinity,
      () => true,
    );
    expect(
      spots
        .filter((s) => s.line === "P" || s.line === "WAVE")
        .map((s) => [s.line, s.iid, s.t]),
    ).toEqual([
      ["P", 8, before],
      ["WAVE", 10, first],
    ]);
  });

  it("needs its market tradable at t, and lists what opens before END", () => {
    const small = [liq(T0, "a"), liq(T0, "b", -1, 10)];
    const spots = spotsOf(small, [], at, T0 + 3 * MIN, (iid) => iid !== 10);
    expect(spots.filter((s) => s.line === "WAVE").map((s) => s.iid)).toEqual([
      8,
    ]);
    expect(spots.some((s) => s.line === "B3_60")).toBe(false);
    expect(spots.filter((s) => s.line === "B7").map((s) => s.iid)).toEqual([
      6, 7,
    ]);
    // Every line's position needs its own market tradable: B1's episode in 10, B7 in 6, B10 in 7, P in 10.
    const all = spotsOf(
      [
        liq(T0 - HOUR_MS, "p", -1, 10),
        liq(T0 - HOUR_MS, "q", -1, 31),
        ...small,
      ],
      [liq(T0 + HOUR_MS, "z", 1, 7)],
      at,
      Infinity,
      (iid) => iid !== 10 && iid !== 6 && iid !== 7,
    );
    expect(all.map((s) => `${s.line} ${s.iid}`).sort()).toEqual([
      "B1 8",
      "B3_180 8",
      "B3_60 8",
      "P 31",
      "WAVE 8",
    ]);
  });
});

/** A market with a mark each minute, a funding row each hour; `gapAt` minutes without a mark. */
function market(
  iid: number,
  from: number,
  days: number,
  mark: (i: number) => number | null,
  rate = 0.0001,
): Market {
  const n = days * 1_440;
  const p: PanelFile = {
    iid,
    symbol: `M${iid}-USD`,
    category: "crypto",
    start: from,
    end: from + days * DAY_MS,
    firstTrade: null,
    retired: null,
    marks: Array.from({ length: n }, (_, i) => mark(i)),
    klines: { minute: [], trades: [], volume: [] },
    funding: Array.from({ length: days * 24 - 1 }, (_, h) => [
      from + (h + 1) * HOUR_MS,
      rate,
      from + (h + 1) * HOUR_MS + 60,
    ]),
  };
  return marketThrough(kit, p, p.end);
}

describe("the price (M7–M9)", () => {
  const from = Date.parse("2026-11-19T00:00:00Z");
  const mk = () => market(8, from, 4, (i) => 100 + i / 1_000);
  const xIn = Date.parse("2026-11-20T10:02:00Z");
  const xOut = xIn + DAY_MS;
  const mark: LegQuote = { source: "mark", why: "gap" };
  const fee = () => 0.0004;

  it("with both legs at the mark is the kit's leg, to 1e-12", () => {
    for (const dir of [1, -1]) {
      const p = pricePosition(kit, mk(), {
        dir,
        xIn,
        xOut,
        entry: mark,
        exit: mark,
        fee,
        base: 5,
      });
      const k = kit.returns.leg(mk(), {
        dir,
        tIn: xIn,
        h: DAY_MS,
        setting: kit.costs.SETTINGS.taker,
      })!;
      expect(p.net! / 1e4).toBeCloseTo(k.net, 12);
      expect(p.fees! / 1e4).toBeCloseTo(k.fees, 12);
      expect(p.funding! / 1e4).toBeCloseTo(k.funding, 12);
      expect(p.grossOnMarks! / 1e4).toBeCloseTo(k.gross, 12);
      expect(p.excess).toBeCloseTo(p.grossOnMarks! - dir * 5, 9);
      expect(p.markLegs).toEqual(["gap", "gap"]);
      expect(atBook(p)).toBe(false);
    }
  });

  it("walks the asks in and the bids out for a long, the reverse for a short; fees on both legs' notional; funding: longs pay a positive rate", () => {
    const entry: LegQuote = {
      source: "book",
      book: { ts: xIn, bids: [[99, 100]], asks: [[100, 100]] },
    };
    const exit: LegQuote = {
      source: "book",
      book: { ts: xOut, bids: [[110, 100]], asks: [[111, 100]] },
    };
    const long = pricePosition(kit, mk(), {
      dir: 1,
      xIn,
      xOut,
      entry,
      exit,
      fee: (t) => (t === xIn ? 0.0004 : 0.0005),
      base: null,
    });
    const sum = kit.panel.fundingBetween(mk(), xIn, xOut).sum;
    expect(long.pIn).toBeCloseTo(100, 12);
    expect(long.pOut).toBeCloseTo(110, 12);
    expect(long).toMatchObject({
      unpriced: null,
      markLegs: [null, null],
      depthShort: false,
      deepest: [1, 1],
      excess: null,
    });
    expect(long.gross).toBeCloseTo(1_000, 9);
    expect(long.fees).toBeCloseTo((0.0004 * 1_000 + 0.0005 * 110 * 10) * 10, 9);
    expect(long.funding).toBeCloseTo(-sum * 10 * 10, 9);
    expect(long.funding!).toBeLessThan(0);
    expect(long.net).toBeCloseTo(long.gross! - long.fees! + long.funding!, 9);
    expect(long.entryCost).toBeCloseTo((100 / 99.5 - 1) * 1e4, 9);
    expect(atBook(long)).toBe(true);
    const short = pricePosition(kit, mk(), {
      dir: -1,
      xIn,
      xOut,
      entry,
      exit,
      fee,
      base: null,
    });
    expect(short.pIn).toBeCloseTo(99, 12);
    expect(short.pOut).toBeCloseTo(111, 12);
    expect(short.gross).toBeCloseTo(-((111 - 99) * (1_000 / 99) * 10), 6);
    expect(short.funding!).toBeGreaterThan(0);
    expect(short.entryCost).toBeCloseTo(-(99 / 99.5 - 1) * 1e4, 9);
  });

  it("walks $1,000 exactly: a level of $1,000 fills it, one of $999 is depth short", () => {
    const at = (size: number): LegQuote => ({
      source: "book",
      book: { ts: xIn, bids: [[99, size]], asks: [[100, size]] },
    });
    const run = (size: number) =>
      pricePosition(kit, mk(), {
        dir: 1,
        xIn,
        xOut,
        entry: at(size),
        exit: mark,
        fee,
        base: null,
      }).depthShort;
    expect([run(10), run(9.99)]).toEqual([false, true]);
  });

  it("flags a depth-short leg, and is unpriced without a mark or a funding mark", () => {
    const thin: LegQuote = {
      source: "book",
      book: { ts: xIn, bids: [[99, 1]], asks: [[100, 1]] },
    };
    const p = pricePosition(kit, mk(), {
      dir: 1,
      xIn,
      xOut,
      entry: thin,
      exit: mark,
      fee,
      base: null,
    });
    expect(p.depthShort).toBe(true);
    expect(atBook(p)).toBe(false);
    const noMarkIn = market(8, from, 4, (i) =>
      i >= 2_030 && i < 2_043 ? null : 100,
    );
    expect(
      pricePosition(kit, noMarkIn, {
        dir: 1,
        xIn,
        xOut,
        entry: mark,
        exit: mark,
        fee,
        base: null,
      }),
    ).toMatchObject({
      net: null,
      unpriced: "no book and no mark at the entry",
      markLegs: ["gap", null],
    });
    const noMarkOut = market(8, from, 4, (i) =>
      i >= 3_470 && i < 3_483 ? null : 100,
    );
    expect(
      pricePosition(kit, noMarkOut, {
        dir: 1,
        xIn,
        xOut,
        entry: mark,
        exit: mark,
        fee,
        base: null,
      }).unpriced,
    ).toBe("no book and no mark at the exit");
    // The mark at the end of the minute before 2026-11-21T00:00Z is missing (funding's mark).
    const noFundingMark = market(8, from, 4, (i) =>
      i >= 2_870 && i < 2_880 ? null : 100,
    );
    expect(
      pricePosition(kit, noFundingMark, {
        dir: 1,
        xIn,
        xOut,
        entry: mark,
        exit: mark,
        fee,
        base: null,
      }).unpriced,
    ).toBe("funding without a mark");
  });
});

describe("BASE (M12, F10)", () => {
  it("is the mean of marks[j + 1,440] ÷ marks[j] − 1 by the 4-hour block of minute j, j in [from, end − 24 h)", () => {
    const from = Date.parse("2026-11-19T00:00:00Z");
    const mk = market(8, from, 3, (i) => 100 * (1 + i / 1e5));
    const base = baseOf(mk, from + DAY_MS, from + 3 * DAY_MS);
    // Only the minutes of the second day: j from 1,440 to 2,879.
    for (let b = 0; b < 6; b++) {
      let s = 0;
      for (let j = 1_440 + b * 240; j < 1_440 + (b + 1) * 240; j++)
        s +=
          ((100 * (1 + (j + 1_440) / 1e5)) / (100 * (1 + j / 1e5)) - 1) * 1e4;
      expect(base[b]).toBeCloseTo(s / 240, 9);
    }
    expect(blockOf(Date.parse("2026-11-20T03:59:59Z"))).toBe(0);
    expect(blockOf(Date.parse("2026-11-20T04:00:00Z"))).toBe(1);
    expect(blockOf(Date.parse("2026-11-20T23:59:59Z"))).toBe(5);
    const empty = baseOf(mk, from, from + DAY_MS);
    expect(empty.every((v) => Number.isNaN(v))).toBe(true);
  });

  it("stops at the window's end and at the market object's last minute (M12)", () => {
    const from = Date.parse("2026-11-19T00:00:00Z");
    const mark = (i: number) => 100 * (1 + i / 1e5 + ((i * 7) % 13) / 1e4);
    const mk = market(8, from, 3, mark);
    // j from `lo` (included) to `hi` (excluded), by block.
    const own = (lo: number, hi: number) =>
      Array.from({ length: 6 }, (_, b) => {
        let s = 0;
        let n = 0;
        for (let j = lo; j < hi; j++) {
          if (Math.floor((j % 1_440) / 240) !== b) continue;
          s += (mark(j + 1_440) / mark(j) - 1) * 1e4;
          n += 1;
        }
        return s / n;
      });
    // END − 24 h inside the marks: the minutes of the first day only.
    baseOf(mk, from, from + 2 * DAY_MS).forEach((v, b) =>
      expect(v).toBeCloseTo(own(0, 1_440)[b]!, 9),
    );
    // END past the market object's end: the last minute j with marks[j + 1,440] is 2,879.
    baseOf(mk, from, from + 4 * DAY_MS).forEach((v, b) =>
      expect(v).toBeCloseTo(own(0, 2_880)[b]!, 9),
    );
  });
});

describe("the statistic and the verdict (M10, M11)", () => {
  it("takes the larger of the two-way and each one-way variance", () => {
    // Two markets, each always the same sign across days: the market variance dominates.
    const items = Array.from({ length: 40 }, (_, k) => ({
      t: T0 + (k % 20) * DAY_MS,
      iid: k < 20 ? 8 : 10,
      x: k < 20 ? 100 + k : -50 + k,
    }));
    const s = twoWay(kit, items)!;
    const v = (key: (i: (typeof items)[0]) => string | number) =>
      kit.stats.cr1Test(items, key, (i) => i.x).se! ** 2;
    const vd = v((i) => Math.floor(i.t / DAY_MS));
    const vm = v((i) => i.iid);
    const vb = v((i) => `${Math.floor(i.t / DAY_MS)}|${i.iid}`);
    expect(s.se).toBeCloseTo(Math.sqrt(Math.max(vd + vm - vb, vd, vm)), 12);
    expect(vm).toBeGreaterThan(vd + vm - vb);
    expect(s.se).toBeCloseTo(Math.sqrt(vm), 12);
    expect(s).toMatchObject({ n: 40, days: 20, markets: 2 });
    expect(twoWay(kit, [{ t: T0, iid: 8, x: 1 }])!.se).toBeNull();
  });

  const v = (over: Partial<Parameters<typeof verdict>[0]>) =>
    verdict({
      mean: 100,
      se: 10,
      z: 2.81,
      meanExcess: 1,
      notAtBookShare: 0,
      days: MIN_DAYS,
      markets: MIN_MARKETS,
      ...over,
    });
  it("WITHHELD above 10% not at the book; TOO FEW under 20 days or 10 markets or without SE", () => {
    expect([NOT_AT_BOOK_LIMIT, DROP_BPS, MIN_DAYS, MIN_MARKETS]).toEqual([
      0.1, 50, 20, 10,
    ]);
    expect(v({ notAtBookShare: 0.1 })).toBe("KEEP");
    expect(v({ notAtBookShare: 0.1000001 })).toBe("WITHHELD");
    expect(v({ se: null })).toBe("TOO FEW TO TELL");
    expect(v({ days: MIN_DAYS - 1 })).toBe("TOO FEW TO TELL");
    expect(v({ markets: MIN_MARKETS - 1 })).toBe("TOO FEW TO TELL");
    // F5 guards DROP as well as KEEP.
    expect(v({ mean: -100, days: MIN_DAYS - 1 })).toBe("TOO FEW TO TELL");
    expect(v({ mean: -100, markets: MIN_MARKETS - 1 })).toBe("TOO FEW TO TELL");
    // M11's order: WITHHELD first, then TOO FEW TO TELL.
    expect(
      v({ notAtBookShare: 0.2, se: null, days: 1, markets: 1, mean: -100 }),
    ).toBe("WITHHELD");
  });
  it("KEEP needs m − z·SE above 0 and the mean excess above 0 (F1); DROP below +50 and it wins", () => {
    expect(v({ mean: 28.0 })).toBe("TOO FEW TO TELL");
    expect(v({ mean: 28.2 })).toBe("KEEP");
    expect(v({ meanExcess: 0 })).toBe("TOO FEW TO TELL");
    expect(v({ meanExcess: null })).toBe("TOO FEW TO TELL");
    expect(v({ mean: 21.8 })).toBe("DROP");
    expect(v({ mean: 21.95 })).toBe("TOO FEW TO TELL");
    expect(v({ mean: -100 })).toBe("DROP");
    // Both hold (an SE under δ ÷ 2z): DROP wins.
    expect(v({ mean: 30, se: 5, z: 2.17 })).toBe("DROP");
    expect(v({ mean: 30, se: 5, z: 2.81 })).toBe("DROP");
    expect(v({ mean: 60, se: 5, z: 2.17 })).toBe("KEEP");
  });
  it("words the sentence as M11", () => {
    expect(sentence(3, "TOO FEW TO TELL", 10, 20, 2.17)).toBe(
      "No mean result as large as 53.4 bps a position was seen.",
    );
    expect(sentence(2, "TOO FEW TO TELL", 10, 20, 2.43)).toBe(
      "Keep and drop are verdicts on this test, never instructions to trade.",
    );
    expect(sentence(3, "TOO FEW TO TELL", 10, null, 2.17)).toBe(
      "Keep and drop are verdicts on this test, never instructions to trade.",
    );
    expect(sentence(3, "KEEP", 10, 20, 2.17)).toBe(
      "Keep and drop are verdicts on this test, never instructions to trade.",
    );
  });
});

const priced = (net: number | null, over: Partial<Priced> = {}): Priced => ({
  net,
  unpriced: net === null ? "no book and no mark at the entry" : null,
  gross: net,
  fees: 0,
  funding: 0,
  fundingMissing: 0,
  grossOnMarks: net,
  excess: net,
  entryCost: 1,
  pIn: 1,
  pOut: 1,
  markLegs: [null, null],
  depthShort: false,
  deepest: [1, 1],
  ...over,
});
const pos = (
  t: number,
  iid: number,
  p: Priced | null,
  over: Partial<Position> = {},
): Position => ({
  line: "WAVE",
  iid,
  t,
  side: -1,
  dir: 1,
  xIn: t + 120_000,
  xOut: t + 120_000 + DAY_MS,
  fillIid: iid,
  accounts: ["a", "b"],
  coins: 1,
  priced: p,
  ...over,
});

describe("the prints (M13) and the tail (B11)", () => {
  it("counts what is not at the book, and the tail's day sums, fall, overlap, worst and worst 5%", () => {
    const D = Date.parse("2026-11-20T00:00:00Z");
    const ps = [
      pos(D + HOUR_MS, 8, priced(100)),
      pos(D + 2 * HOUR_MS, 10, priced(-300)),
      pos(D + DAY_MS + HOUR_MS, 8, priced(50, { markLegs: ["gap", null] })),
      pos(D + 2 * DAY_MS, 31, priced(-20, { depthShort: true })),
      pos(D + 2 * DAY_MS + 1, 32, priced(null)),
      pos(D + 3 * DAY_MS, 33, null),
    ];
    const s = summarize(kit, ps, 2.81);
    expect(s).toMatchObject({
      positions: 6,
      pending: 1,
      priced: 4,
      days: 3,
      markets: 3,
      unpriced: { "no book and no mark at the entry": 1 },
      markLegs: { gap: 1 },
      depthShort: 1,
      notAtBook: 4,
    });
    expect(s.notAtBookShare).toBeCloseTo(4 / 6, 12);
    expect(s.money?.mean).toBeCloseTo((100 - 300 + 50 - 20) / 4, 12);
    expect(s.atBookOnly?.mean).toBeCloseTo(-100, 12);
    expect(s.winShare).toBe(0.5);
    const t = tailOf(ps);
    // Day sums: −200, +50, −20; the running sum 0 → −200 → −150 → −170: the fall from the peak 0 is 200.
    expect(t).toEqual({
      worstDay: { day: "2026-11-20", sum: -200, positions: 2 },
      largestFall: 200,
      mostOpen: 2,
      worst: -300,
      worstFivePct: -300,
    });
  });

  it("names the sets: WAVE's splits, B1's selections, B7 by market, C, S", () => {
    const D = Date.parse("2026-11-20T00:00:00Z");
    const ps = [
      pos(D, 8, priced(1), { side: -1, basket: -5 }),
      pos(D + HOUR_MS, 10, priced(2), { side: 1, dir: -1, basket: 5 }),
      pos(D, 6, priced(3), { line: "B7" }),
      pos(D, 7, priced(4), { line: "B7" }),
      pos(D, 8, priced(5), { line: "B1", accounts: ["a"], coins: 1 }),
      pos(D, 10, priced(6), {
        line: "B1",
        accounts: ["a", "b", "c"],
        coins: 2,
      }),
      pos(D + 5 * DAY_MS, 8, priced(7)),
      // x_out exactly at the set's end: not in it.
      pos(D + 2 * DAY_MS - 120_000, 8, priced(8)),
    ];
    const sets = namedSets(ps, D + 3 * DAY_MS, [
      { start: D + HOUR_MS, end: D + 2 * HOUR_MS, boosted: new Set([8]) },
    ]);
    const ids = (name: string) =>
      (sets.get(name) ?? []).map((p) => p.priced!.net);
    expect(ids("WAVE")).toEqual([1, 2]);
    expect(ids("B6 FORCED SELLS")).toEqual([1]);
    expect(ids("B6 FORCED BUYS")).toEqual([2]);
    expect(ids("B7 BTC")).toEqual([3]);
    expect(ids("B7 ETH")).toEqual([4]);
    expect(ids("B2 ALONE")).toEqual([5]);
    expect(ids("B4 COINS")).toEqual([6]);
    expect(ids("B5 THREE")).toEqual([6]);
    expect(ids("C WITHOUT COMPETITIONS")).toEqual([1]);
    expect(ids("C WITHOUT BOOSTED MARKETS")).toEqual([1, 2]);
    expect(ids("S 2026-11")).toEqual([1, 2]);
    expect(ids("S BASKET FELL, FORCED SELLS")).toEqual([1]);
    expect(ids("S BASKET ROSE, FORCED BUYS")).toEqual([2]);
  });

  it("takes a competition's window as [start, end), and a basket of exactly 0 or none as unknown (M12 C, S)", () => {
    const D = Date.parse("2026-11-20T00:00:00Z");
    const ps = [
      pos(D, 8, priced(1), { basket: 0 }),
      pos(D + HOUR_MS, 10, priced(2), { side: 1, dir: -1 }),
    ];
    const sets = namedSets(ps, D + 3 * DAY_MS, [
      // Ends at the first position's t: it is outside; the second's t is its start: inside.
      { start: D - HOUR_MS, end: D, boosted: new Set([8]) },
      { start: D + HOUR_MS, end: D + 2 * HOUR_MS, boosted: new Set([10]) },
    ]);
    const ids = (name: string) =>
      (sets.get(name) ?? []).map((p) => p.priced!.net);
    expect(ids("C WITHOUT COMPETITIONS")).toEqual([1]);
    expect(ids("C WITHOUT BOOSTED MARKETS")).toEqual([1]);
    expect([...sets.keys()].filter((n) => n.startsWith("S BASKET"))).toEqual([
      "S BASKET UNKNOWN",
    ]);
    expect(ids("S BASKET UNKNOWN")).toEqual([1, 2]);
  });

  it("prices every position once, pending while a quote is pending or the market object ends before x_out", () => {
    const from = Date.parse("2026-11-19T00:00:00Z");
    const mk8 = market(8, from, 3, () => 100);
    const fills = [liq(T0, "a"), liq(T0 + 1, "b")];
    const all = computeAll({
      kit,
      small: fills,
      large: [],
      at: { cut: T0 - DAY_MS, start: T0 },
      end: T0 + 3 * DAY_MS,
      tradable: () => true,
      market: (iid) => (iid === 8 ? mk8 : null),
      quote: (_iid, x) =>
        x < T0 + DAY_MS ? { source: "mark", why: "gap" } : "pending",
      fee: () => 0.0004,
    });
    const wave = all.filter((p) => p.line === "WAVE");
    expect(wave).toHaveLength(1);
    expect(wave[0]!.priced).toBeNull();
    const done = computeAll({
      kit,
      small: fills,
      large: [],
      at: { cut: T0 - DAY_MS, start: T0 },
      end: T0 + 3 * DAY_MS,
      tradable: () => true,
      market: (iid) => (iid === 8 ? mk8 : null),
      quote: () => ({ source: "mark", why: "gap" }),
      fee: () => 0.0004,
    });
    const w = done.find((p) => p.line === "WAVE")!;
    expect(w.priced?.net).not.toBeNull();
    // A market object that ends at or before x_out keeps the position pending.
    const short8 = market(8, from, 2, () => 100);
    const early = computeAll({
      kit,
      small: fills,
      large: [],
      at: { cut: T0 - DAY_MS, start: T0 },
      end: T0 + 3 * DAY_MS,
      tradable: () => true,
      market: (iid) => (iid === 8 ? short8 : null),
      quote: () => ({ source: "mark", why: "gap" }),
      fee: () => 0.0004,
    });
    expect(short8.end).toBeLessThan(w.xOut);
    expect(early.find((p) => p.line === "WAVE")!.priced).toBeNull();
    // The other small coins have no market: OWN is unknown; S's basket too.
    expect(w.own).toBeNull();
    expect(w.basket).toBeNull();
  });
});

describe("the prints' numbers (M12, M13)", () => {
  it("the band with Student's t on day clusters: df = days − 1 at the look's two-sided limit", () => {
    const D = Date.parse("2026-11-20T00:00:00Z");
    const nets = [100, -50, 30, 80, -20, 60, 10, 40, -10, 70];
    const ps = nets.map((n, d) => pos(D + d * DAY_MS, 8, priced(n)));
    // t of 9 degrees at the upper tail of the normal's z (computed apart by
    // Simpson's rule and bisection): z 2.81 → 3.695608, z 2.43 → 2.994155.
    for (const [z, t] of [
      [2.81, 3.695608],
      [2.43, 2.994155],
    ] as const) {
      const s = summarize(kit, ps, z);
      expect(s.money!.days).toBe(10);
      expect((s.band!.high - s.money!.mean) / s.money!.seDay!).toBeCloseTo(
        t,
        4,
      );
      expect((s.money!.mean - s.band!.low) / s.money!.seDay!).toBeCloseTo(t, 4);
    }
  });

  it("the win share, the median and quartiles, the costliest third, the five busiest days, the worst 5%", () => {
    const D = Date.parse("2026-11-20T00:00:00Z");
    const nets = [
      -120, 45, 0, 300, -15, 80, 60, -60, 12, 7, 150, -200, 33, 90, -5, 18, 250,
      -45, 5, 70, 120,
    ];
    // 21 positions on 7 days, 6, 5, 4, 2, 2, 1 and 1 of them; entry costs rising with k.
    const dayOf = [
      0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 4, 4, 5, 6,
    ];
    const ps = nets.map((n, k) =>
      pos(
        D + dayOf[k]! * DAY_MS + k * MIN,
        8 + (k % 2) * 2,
        priced(n, {
          entryCost: k,
        }),
      ),
    );
    const s = summarize(kit, ps, 2.81);
    // Sorted: −200 −120 −60 −45 −15 −5 0 5 7 12 18 33 45 60 70 80 90 120 150 250 300.
    expect(s.winShare).toBe(14 / 21);
    expect([s.median, s.q1, s.q3]).toEqual([18, -5, 80]);
    expect(s.entryCost).toEqual({ median: 10, p90: 18 });
    // The 7 dearest entries (k 14 to 20).
    expect(s.costliestThird).toBeCloseTo(
      (-5 + 18 + 250 - 45 + 5 + 70 + 120) / 7,
      12,
    );
    expect(s.fiveBusiestShare).toBe(19 / 21);
    // ⌈5% of 21⌉ = 2: the mean of −200 and −120.
    expect(tailOf(ps).worstFivePct).toBe(-160);
  });

  it("OWN and S's basket need at least 5 coins with both marks; S's basket reads the 7 days before t", () => {
    const from = Date.parse("2026-11-10T00:00:00Z");
    const slope: Record<number, number> = {
      8: 3,
      10: 1,
      31: 2,
      32: -1,
      33: 4,
      34: 0.5,
    };
    const mark = (iid: number, i: number) =>
      100 * (1 + (slope[iid]! * i) / 1e5);
    const markets = new Map(
      Object.keys(slope).map((k) => [
        Number(k),
        market(Number(k), from, 10, (i) => mark(Number(k), i)),
      ]),
    );
    const of = (without: number | null) => (iid: number) =>
      iid === without ? null : (markets.get(iid) ?? null);
    const move = (iid: number, a: number, b: number) =>
      (mark(iid, (b - from) / MIN) / mark(iid, (a - from) / MIN) - 1) * 1e4;
    const a = Date.parse("2026-11-18T10:02:00Z");
    const b = a + DAY_MS;
    const others = [10, 31, 32, 33, 34];
    expect(othersMove(kit, of(null), 8, a, b)).toBeCloseTo(
      others.reduce((s, iid) => s + move(iid, a, b), 0) / 5,
      9,
    );
    expect(othersMove(kit, of(34), 8, a, b)).toBeNull();
    const t = Date.parse("2026-11-18T12:00:00Z");
    // The small coins with both marks: 8, 10, 31, 32, 33, 34.
    const basket = (ids: number[]) =>
      ids.reduce((s, iid) => s + move(iid, t - 7 * DAY_MS, t - MIN), 0) /
      ids.length;
    expect(basketWeek(kit, of(null), t)).toBeCloseTo(
      basket([8, 10, 31, 32, 33, 34]),
      9,
    );
    const five = (iid: number) =>
      [8, 10, 31, 32, 33].includes(iid) ? (markets.get(iid) ?? null) : null;
    expect(basketWeek(kit, five, t)).toBeCloseTo(
      basket([8, 10, 31, 32, 33]),
      9,
    );
    const four = (iid: number) =>
      [8, 10, 31, 32].includes(iid) ? (markets.get(iid) ?? null) : null;
    expect(basketWeek(kit, four, t)).toBeNull();
  });

  it("OWN is WAVE's gross on marks minus dir × the other small coins' mean move, for a forced sell and a forced buy", () => {
    const from = Date.parse("2026-11-19T00:00:00Z");
    const slope: Record<number, number> = {
      8: 3,
      10: 1,
      31: 2,
      32: -1,
      33: 4,
      34: 0.5,
    };
    const mark = (iid: number, i: number) =>
      100 * (1 + (slope[iid]! * i) / 1e5);
    const markets = new Map(
      Object.keys(slope).map((k) => [
        Number(k),
        market(Number(k), from, 3, (i) => mark(Number(k), i)),
      ]),
    );
    const all = computeAll({
      kit,
      small: [
        liq(T0, "a"),
        liq(T0, "b"),
        liq(T0 + 2 * HOUR_MS, "c", 1),
        liq(T0 + 2 * HOUR_MS, "d", 1),
      ],
      large: [],
      at: { cut: T0 - DAY_MS, start: T0 },
      end: from + 3 * DAY_MS,
      tradable: () => true,
      market: (iid) => markets.get(iid) ?? null,
      quote: () => ({ source: "mark", why: "gap" }),
      fee: () => 0.0004,
    });
    const move = (iid: number, x0: number, x1: number) =>
      (mark(iid, Math.floor((x1 - from) / MIN)) /
        mark(iid, Math.floor((x0 - from) / MIN)) -
        1) *
      1e4;
    const wave = all.filter((p) => p.line === "WAVE");
    expect(wave.map((p) => p.dir)).toEqual([1, -1]);
    for (const p of wave) {
      const others =
        [10, 31, 32, 33, 34].reduce(
          (s, iid) => s + move(iid, p.xIn, p.xOut),
          0,
        ) / 5;
      expect(p.priced!.grossOnMarks).toBeCloseTo(
        p.dir * move(8, p.xIn, p.xOut),
        9,
      );
      expect(p.own).toBeCloseTo(
        p.dir * move(8, p.xIn, p.xOut) - p.dir * others,
        9,
      );
    }
  });
});
