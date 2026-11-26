/**
 * The taker setting (src/copyh/setting.ts; rules.md C9, C13): c(coin, d),
 * half the median of UTC day d − 1's minute mean gaps, from the day before
 * only (written out here as the rule says it); the 30-minute rule at 29 and
 * at 30 minutes, the latest earlier day with 30 flagged, 25 bps flagged with
 * none, a day past the bars; the pairs at 2 s and at 2 s + 1 ms and across a
 * minute's boundary, from the store's own pass and merge; the taker's
 * 4.5 bps a leg, the cascade print's minute c, Binance's 5 bps a side; a leg
 * of another coin refused; the kit's leg on the taker setting.
 */
import { describe, expect, it } from "vitest";
import { SPREAD_FALLBACK } from "../src/copyh/design.js";
import { marketOf, readBars, type Bars } from "../src/copyh/markets.js";
import { settingsOf, spreadsOf } from "../src/copyh/setting.js";
import { loadResearch } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { addr, byBlock, keyOf, trade } from "./copyh-world.js";
import { storeOf } from "./copyh-engine-world.js";

const kit = await loadResearch();
const MIN = MINUTE_MS;
const DAY0 = Date.parse("2025-09-01T00:00:00Z");
const SOL = 2;

/** Made-up bars of `days` UTC days from DAY0, each listed minute with its pairs and their mean gap. */
function barsWith(
  days: number,
  pairs: ReadonlyMap<number, readonly [count: number, gap: number]>,
): Bars {
  const n = days * 1440;
  const b = {
    iid: SOL,
    start: DAY0,
    n,
    trades: new Uint32Array(n),
    sz: new Float64Array(n),
    ntl: new Float64Array(n),
    last: new Float64Array(n).fill(NaN),
    pairGap: new Float64Array(n),
    pairs: new Uint32Array(n),
    settleSz: new Float64Array(n),
    settleNtl: new Float64Array(n),
  };
  for (const [k, [count, gap]] of pairs) {
    b.pairs[k] = count;
    b.pairGap[k] = count * gap;
  }
  return b;
}

/** The rule written out: half the median of these minutes' mean gaps. */
function cOf(b: Bars, minutes: readonly number[]): number {
  const gaps = minutes
    .map((k) => b.pairGap[k]! / b.pairs[k]!)
    .sort((x, y) => x - y);
  const m = gaps.length >> 1;
  return (gaps.length % 2 === 1 ? gaps[m]! : (gaps[m - 1]! + gaps[m]!) / 2) / 2;
}

const range = (n: number, f: (j: number) => number) =>
  Array.from({ length: n }, (_, j) => f(j));
/** Day 0: 31 minutes of pairs; day 1: 30; day 2: 29; day 3: none; day 4: 40. */
const DAY_0 = range(31, (j) => 10 + 7 * j);
const DAY_1 = range(30, (j) => 1440 + 5 + 11 * j);
const DAY_2 = range(29, (j) => 2880 + 3 * j);
const DAY_4 = range(40, (j) => 5760 + j);
const world = barsWith(
  5,
  new Map([
    ...DAY_0.map(
      (k, j) => [k, [1 + (j % 3), (((j * j) % 17) + 1) / 1e4]] as const,
    ),
    ...DAY_1.map((k, j) => [k, [2, 0.002 + (j % 4) * 0.0005]] as const),
    ...DAY_2.map((k) => [k, [1, 0.05]] as const),
    ...DAY_4.map((k) => [k, [1, 0.01]] as const),
  ]),
);
const C0 = cOf(world, DAY_0);
const C1 = cOf(world, DAY_1);
const at = (day: number) => DAY0 + day * DAY_MS + 9 * HOUR_MS + 17 * MIN;

describe("c(coin, d)", () => {
  it("is half the median of day d − 1's minute mean gaps, from the day before only", () => {
    const c = spreadsOf(kit, world);
    expect(C0).not.toBe(C1);
    expect(c(at(1))).toEqual({ c: C0, fallback: false });
    // Day 1 holds exactly 30 minutes of pairs: an even median, unflagged.
    expect(c(at(2))).toEqual({ c: C1, fallback: false });
    expect(c(DAY0 + 2 * DAY_MS)).toEqual({ c: C1, fallback: false });
    expect(c(DAY0 + 2 * DAY_MS - 1)).toEqual({ c: C0, fallback: false });
    // Day 4's 40 minutes at 0.01, read on day 5, past the bars.
    expect(c(at(5))).toEqual({ c: 0.005, fallback: false });
  });

  it("takes the latest earlier day with 30 minutes when d − 1 has fewer, flagged, and 25 bps flagged when none has", () => {
    const c = spreadsOf(kit, world);
    // Day 2 holds 29 minutes, day 3 none: day 1's c, flagged.
    expect(c(at(3))).toEqual({ c: C1, fallback: true });
    expect(c(at(4))).toEqual({ c: C1, fallback: true });
    expect(c(at(7))).toEqual({ c: 0.005, fallback: true });
    expect(c(at(0))).toEqual({ c: SPREAD_FALLBACK, fallback: true });
    expect(c(DAY0 - 1)).toEqual({ c: SPREAD_FALLBACK, fallback: true });
    const thin = spreadsOf(
      kit,
      barsWith(
        3,
        new Map(DAY_0.slice(0, 29).map((k) => [k, [1, 0.001]] as const)),
      ),
    );
    for (const day of [0, 1, 2, 3, 5])
      expect(thin(at(day))).toEqual({ c: SPREAD_FALLBACK, fallback: true });
  });
});

describe("the settings", () => {
  const { taker, cascade, binance } = settingsOf(kit, world);
  const c = spreadsOf(kit, world);

  it("charge 4.5 bps a leg with c for the taker, 5 bps a side with c for Binance", () => {
    for (const t of [at(0), at(1), at(4), Date.parse("2026-10-01T00:00:00Z")]) {
      expect(taker.fee(SOL, t)).toBe(0.00045);
      expect(binance.fee(SOL, t)).toBe(0.0005);
      expect(cascade.fee(SOL, t)).toBe(0.00045);
      expect(taker.spread(SOL, t)).toEqual(c(t));
      expect(binance.spread(SOL, t)).toEqual(c(t));
    }
  });

  it("take the cascade print's c from the leg's own minute where it holds a pair, else c(coin, d)", () => {
    const k = DAY_0[3]!;
    expect(cascade.spread(SOL, DAY0 + k * MIN + 59_999)).toEqual({
      c: world.pairGap[k]! / world.pairs[k]! / 2,
      fallback: false,
    });
    expect(cascade.spread(SOL, DAY0 + (k + 1) * MIN)).toEqual({
      c: SPREAD_FALLBACK,
      fallback: true,
    });
    expect(cascade.spread(SOL, DAY0 + (1440 + 1) * MIN)).toEqual({
      c: C0,
      fallback: false,
    });
  });

  it("refuse a leg of another coin", () => {
    for (const s of [taker, cascade, binance]) {
      expect(() => s.fee(3, at(1))).toThrow(
        "coin 2's setting asked for coin 3",
      );
      expect(() => s.spread(3, at(1))).toThrow(
        "coin 2's setting asked for coin 3",
      );
    }
  });

  it("price the kit's leg: c on both sides, the fee on both legs", () => {
    const start = DAY0 + DAY_MS;
    const mk = marketOf(
      kit,
      {
        iid: SOL,
        symbol: "SOL",
        category: "main dex",
        start,
        end: start + 2 * HOUR_MS,
        firstTrade: start,
        retired: null,
        marks: range(120, (i) => 100 + (i * i) / 1000),
        klines: { minute: [], trades: [], volume: [] },
        funding: [],
      },
      start + 2 * HOUR_MS,
      5,
    );
    const tIn = start + 10 * MIN + 1_000;
    const leg = kit.returns.leg(mk, {
      dir: 1,
      tIn,
      h: 30 * MIN,
      setting: taker,
    })!;
    const pIn = (100 + 100 / 1000) * (1 + C0);
    const pOut = (100 + 1600 / 1000) * (1 - C0);
    const fees = 0.00045 + (0.00045 * pOut) / pIn;
    expect(leg.fees).toBe(fees);
    expect(leg.net).toBe((pOut - pIn) / pIn - fees + 0);
    expect(leg.spreadFallback).toBe(false);
  });
});

describe("the pairs", { timeout: 60_000 }, () => {
  it("are two market takers of opposite sides at most 2 s apart, in the minute of the second: 30 minutes, day d − 1's c", async () => {
    const A = addr(0x0a);
    const B = addr(0x0b);
    const px = (v: number) => v.toFixed(2);
    const records: string[] = [];
    let tid = 0;
    const take = (time: number, side: "A" | "B", price: number) =>
      records.push(
        ...trade(A, B, {
          coin: "SOL",
          px: px(price),
          sz: "1",
          side,
          time,
          tid: ++tid,
        }),
      );
    for (let k = 0; k <= 28; k++) {
      const p = 100 + k / 10;
      take(DAY0 + k * MIN + 10_000, "B", p);
      take(DAY0 + k * MIN + 12_000, "A", p - ((k % 4) + 1) / 100);
      // 2 s + 1 ms after the sell: no second pair.
      if (k === 0) take(DAY0 + 14_001, "B", 100.05);
    }
    // Across minutes 29 and 30: counted in minute 30.
    take(DAY0 + 29 * MIN + 59_000, "B", 103);
    take(DAY0 + 30 * MIN + 500, "A", 102.9);
    const store = await storeOf(
      new Map([[keyOf(DAY0), `${byBlock(1, records)}\n`]]),
      DAY0,
      DAY0 + DAY_MS + HOUR_MS,
    );
    const bars = readBars([store], SOL, DAY0 + DAY_MS + HOUR_MS)!;
    const minutes = [...range(29, (k) => k), 30];
    expect([...bars.pairs.slice(0, 32)]).toEqual([
      ...range(29, () => 1),
      0,
      1,
      0,
    ]);
    const gap = (a: number, b: number) => Math.abs(b - a) / ((b + a) / 2);
    expect(bars.pairGap[0]).toBe(gap(100, 99.99));
    expect(bars.pairGap[30]).toBe(gap(103, 102.9));
    expect(spreadsOf(kit, bars)(DAY0 + DAY_MS + 30 * MIN)).toEqual({
      c: cOf(bars, minutes),
      fallback: false,
    });
  });
});
