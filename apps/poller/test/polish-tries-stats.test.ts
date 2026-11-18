/**
 * The exploration's statistics (src/polish/tries/stats.ts): the D-test by
 * hand and against M10's two-way error; the floors' and the gain floor's
 * boundaries; C's 100-day footprint; the typed-array two-way error against
 * MARKET-1's `twoWay`, whole and on a range.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { twoWay, type Item } from "../src/market1/stats.js";
import { loadResearch, type Research } from "../src/paper/research.js";
import { DAY_MS } from "../src/schedule.js";
import {
  C_FLOORS,
  E_FLOORS,
  clustersOf,
  dTest,
  floorsOf,
  footprintOk,
  gainFloor,
  statOf,
  twoWayFast,
} from "../src/polish/tries/stats.js";

const D0 = Date.parse("2026-01-01T00:00:00Z");
const item = (day: number, iid: number, x: number): Item => ({
  t: D0 + day * DAY_MS + 3_600_000,
  iid,
  x,
});
const close = (a: number | null, b: number | null) => {
  expect(a).not.toBeNull();
  expect(b).not.toBeNull();
  expect(Math.abs(a! - b!)).toBeLessThanOrEqual(1e-12 * Math.abs(b!));
};

let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

/** A synthetic set: 60 days, 12 coins, a few positions a cell, heavy tails (a fixed linear congruential draw). */
function world(seed: number, n = 900): Item[] {
  let state = seed;
  const r = () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
  return Array.from({ length: n }, () =>
    item(
      Math.floor(r() * 60),
      1 + Math.floor(r() * 12),
      ((r() - 0.45) * 400) / (0.2 + r()),
    ),
  ).sort((a, b) => a.t - b.t);
}

describe("the statistic and the D-test", () => {
  it("statOf is MARKET-1's twoWay with z = m ÷ SE", () => {
    const xs = world(1);
    const s = statOf(kit, xs)!;
    const w = twoWay(kit, xs)!;
    expect(s).toEqual({ ...w, z: w.mean / w.se! });
    expect(statOf(kit, [])).toBeNull();
  });

  it("by hand: D = m_V − k·m_B0; the influences summed by day, coin and pair; the max form", () => {
    const v = [item(0, 1, 10), item(1, 2, 30)];
    const b0 = [...v, item(0, 2, -20), item(1, 1, 40)];
    // m_V 20, m_B0 15. Influences: V −5 (day 0, coin 1), +5 (1, 2); B0 at k = ½: 0.625, −1.875, 4.375, −3.125.
    // Day sums 0 and 0; coin sums −7.5 and 7.5, so V_coin = 2 × 112.5 = 225; the pairs' V = 4/3 × 57.8125.
    expect(dTest(v, b0, 0.5)).toEqual({
      k: 0.5,
      d: 12.5,
      se: 15,
      t: 12.5 / 15,
      days: 2,
      coins: 2,
    });
  });

  it("with k = 0 its error is M10's two-way error of V; V against itself at k = 1 has no t", () => {
    for (const seed of [2, 3, 4]) {
      const xs = world(seed);
      const v = xs.filter((_, i) => i % 3 !== 0);
      const d = dTest(v, xs, 0)!;
      const w = twoWay(kit, v)!;
      expect(d.d).toBe(w.mean);
      close(d.se, w.se);
      expect([d.days, d.coins]).toEqual([
        twoWay(kit, xs)!.days,
        twoWay(kit, xs)!.markets,
      ]);
    }
    const xs = world(5);
    const same = dTest(xs, xs, 1)!;
    expect(same.d).toBe(0);
    expect(same.t === null || same.t === 0).toBe(true);
    expect(dTest([], xs, 1)).toBeNull();
  });
});

describe("the floors", () => {
  const s = (mean: number, days: number, markets: number) => ({
    n: 1,
    mean,
    se: 1,
    seDay: 1,
    seMarket: 1,
    days,
    markets,
  });
  it("E's +50, 40 days and 15 coins and C's +25, 30 and 15, each at its boundary", () => {
    expect(floorsOf(s(50, 40, 15), E_FLOORS)).toEqual({
      mean: true,
      days: true,
      coins: true,
    });
    expect(floorsOf(s(49.999999, 39, 14), E_FLOORS)).toEqual({
      mean: false,
      days: false,
      coins: false,
    });
    expect(floorsOf(s(25, 30, 15), C_FLOORS)).toEqual({
      mean: true,
      days: true,
      coins: true,
    });
    expect(floorsOf(s(24.999999, 29, 14), C_FLOORS)).toEqual({
      mean: false,
      days: false,
      coins: false,
    });
  });
  it("the gain floor is max(+10 bps, 10% of |m_B0|)", () => {
    expect([50, 100, 150, -250, 0].map(gainFloor)).toEqual([
      10, 10, 15, 25, 10,
    ]);
  });
  it("C's footprint: every 100-day window of the entry days holds 20 UTC days and 10 coins", () => {
    const every = (step: number, coins = 10) =>
      Array.from({ length: Math.ceil(146 / step) * coins }, (_, i) =>
        item(Math.floor(i / coins) * step, 1 + (i % coins), 1),
      );
    expect(footprintOk(every(1), D0, 146)).toBe(true);
    // Every fifth day: each window holds exactly 20 days; every sixth, 16 or 17.
    expect(footprintOk(every(5), D0, 146)).toBe(true);
    expect(footprintOk(every(6), D0, 146)).toBe(false);
    expect(footprintOk(every(1, 9), D0, 146)).toBe(false);
    // Positions only on days 0–19 and 126–145: the window [20, 120) holds none.
    const ends = every(1).filter(
      (i) => (i.t - D0) / DAY_MS < 20 || (i.t - D0) / DAY_MS >= 126,
    );
    expect(footprintOk(ends, D0, 146)).toBe(false);
  });
});

describe("the two-way error on typed arrays", () => {
  it("equals MARKET-1's twoWay, whole and on a range of the items", () => {
    for (const seed of [6, 7]) {
      const xs = world(seed);
      const c = clustersOf(xs);
      const x = Float64Array.from(xs, (i) => i.x);
      close(twoWayFast(x, c), twoWay(kit, xs)!.se);
      close(twoWayFast(x, c, 200, 700), twoWay(kit, xs.slice(200, 700))!.se);
    }
    const one = [item(0, 1, 5), item(0, 1, 7)];
    expect(twoWayFast(Float64Array.from([5, 7]), clustersOf(one))).toBeNull();
  });
});
