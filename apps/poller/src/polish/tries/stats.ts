/**
 * The exploration's statistics (POLISH-EXPLORE's plan 4.5, 4.6 and 5; the
 * polishing plan 1.4; its review's F2 and F4; decisions 2026-11-18,
 * "POLISH-EXPLORE's plan approved"): a rule's mean net with M10's two-way
 * error (MARKET-1's `twoWay`, unchanged) and z; the D-test of a change V
 * against B0 by each position's influence, with M10's clusters and max
 * form; the floors on E and C, the gain floor and C's 100-day footprint;
 * the same two-way error on typed arrays, for the placebo's many draws.
 */
import { twoWay, type Item, type TwoWay } from "../../market1/stats.js";
import type { Research } from "../../paper/research.js";
import { dayOf } from "../../paper/stats.js";
import { DAY_MS } from "../../schedule.js";

export type Stat = TwoWay & { z: number | null };

/** A rule's statistic (M10): m, SE by MARKET-1's `twoWay`, z = m ÷ SE; null for no position. */
export function statOf(kit: Research, items: readonly Item[]): Stat | null {
  const s = twoWay(kit, items);
  if (s === null) return null;
  return { ...s, z: s.se === null || s.se === 0 ? null : s.mean / s.se };
}

const meanOf = (items: readonly Item[]) =>
  items.reduce((s, i) => s + i.x, 0) / items.length;

/** The kit's CR1 variance of a sum of influences by one clustering: K ÷ (K − 1) × Σ over the clusters of (Σψ)²; null under two clusters. */
function cr1(sums: ReadonlyMap<string | number, number>): number | null {
  const K = sums.size;
  if (K < 2) return null;
  let s = 0;
  for (const v of sums.values()) s += v * v;
  return (K / (K - 1)) * s;
}

export type DTest = {
  k: number;
  d: number;
  se: number | null;
  t: number | null;
  days: number;
  coins: number;
};

/**
 * The D-test of V against B0 (the plan 1.4): D = m_V − k·m_B0, k given (E's
 * SE_V ÷ SE_B0); each of V's positions has the influence (x − m_V) ÷ n_V and
 * each of B0's −k·(x − m_B0) ÷ n_B0, a position in both both; the influences
 * are summed by the UTC day of t, the coin and the pair, and SE_D =
 * √max(V_day + V_coin − V_both, V_day, V_coin); t = D ÷ SE_D, none when SE_D
 * is 0 or cannot be computed.
 */
export function dTest(
  v: readonly Item[],
  b0: readonly Item[],
  k: number,
): DTest | null {
  if (v.length === 0 || b0.length === 0) return null;
  const mV = meanOf(v);
  const mB = meanOf(b0);
  const day = new Map<number, number>();
  const coin = new Map<number, number>();
  const both = new Map<string, number>();
  const add = (i: Item, psi: number) => {
    const d = dayOf(i.t);
    day.set(d, (day.get(d) ?? 0) + psi);
    coin.set(i.iid, (coin.get(i.iid) ?? 0) + psi);
    const p = `${d}|${i.iid}`;
    both.set(p, (both.get(p) ?? 0) + psi);
  };
  for (const i of v) add(i, (i.x - mV) / v.length);
  for (const i of b0) add(i, (-k * (i.x - mB)) / b0.length);
  const vd = cr1(day);
  const vc = cr1(coin);
  const vb = cr1(both);
  const se =
    vd === null || vc === null || vb === null
      ? null
      : Math.sqrt(Math.max(vd + vc - vb, vd, vc));
  const d = mV - k * mB;
  return {
    k,
    d,
    se,
    t: se === null || se === 0 ? null : d / se,
    days: day.size,
    coins: coin.size,
  };
}

/** The floors a change must keep on E (the plan 1.4), and the nominee on C (F2). */
export const E_FLOORS = { mean: 50, days: 40, coins: 15 } as const;
export const C_FLOORS = { mean: 25, days: 30, coins: 15 } as const;
export type Floors = { mean: number; days: number; coins: number };

/** Which floors a rule's statistic keeps: its mean net, its priced positions' UTC days of t and coins. */
export const floorsOf = (s: TwoWay, f: Floors) => ({
  mean: s.mean >= f.mean,
  days: s.days >= f.days,
  coins: s.markets >= f.coins,
});

/** F4's gain floor beside t ≥ 2.5: D ≥ max(+10 bps, 10% of |m_B0|). */
export const gainFloor = (mB0: number): number =>
  Math.max(10, 0.1 * Math.abs(mB0));

/** F2's exam footprint (Q9): in every window of 100 consecutive UTC days of the part's entry days, the positions span at least 20 UTC days of t and 10 coins. */
export function footprintOk(
  items: readonly Item[],
  firstDay: number,
  entryDays: number,
  window = 100,
  minDays = 20,
  minCoins = 10,
): boolean {
  for (let w = 0; w + window <= entryDays; w++) {
    const from = firstDay + w * DAY_MS;
    const to = from + window * DAY_MS;
    const days = new Set<number>();
    const coins = new Set<number>();
    for (const i of items)
      if (i.t >= from && i.t < to) {
        days.add(dayOf(i.t));
        coins.add(i.iid);
      }
    if (days.size < minDays || coins.size < minCoins) return false;
  }
  return true;
}

/** Each item's cluster numbers (UTC day of t, coin, pair), for `twoWayFast`. */
export type Clusters = {
  day: Int32Array;
  coin: Int32Array;
  both: Int32Array;
  sizes: [number, number, number];
};

export function clustersOf(items: readonly Item[]): Clusters {
  const ids = [
    new Map<string, number>(),
    new Map<string, number>(),
    new Map<string, number>(),
  ];
  const cols = [0, 1, 2].map(() => new Int32Array(items.length));
  items.forEach((i, n) => {
    const keys = [String(dayOf(i.t)), String(i.iid), `${dayOf(i.t)}|${i.iid}`];
    keys.forEach((key, g) => {
      let id = ids[g]!.get(key);
      if (id === undefined) {
        id = ids[g]!.size;
        ids[g]!.set(key, id);
      }
      cols[g]![n] = id;
    });
  });
  return {
    day: cols[0]!,
    coin: cols[1]!,
    both: cols[2]!,
    sizes: [ids[0]!.size, ids[1]!.size, ids[2]!.size],
  };
}

/** M10's two-way SE of the mean of x[lo, hi) (the kit's CR1 by each clustering, K the clusters present; the max form) on typed arrays, for the placebo's thousands of draws; null under two clusters. */
export function twoWayFast(
  x: Float64Array,
  c: Clusters,
  lo = 0,
  hi = x.length,
): number | null {
  const n = hi - lo;
  if (n <= 0) return null;
  let m = 0;
  for (let i = lo; i < hi; i++) m += x[i]!;
  m /= n;
  const v: number[] = [];
  for (const [g, id] of [c.day, c.coin, c.both].entries()) {
    const s = new Float64Array(c.sizes[g]!);
    const seen = new Uint8Array(c.sizes[g]!);
    let K = 0;
    for (let i = lo; i < hi; i++) {
      const j = id[i]!;
      if (seen[j] === 0) {
        seen[j] = 1;
        K += 1;
      }
      s[j]! += x[i]! - m;
    }
    if (K < 2) return null;
    let q = 0;
    for (let j = 0; j < s.length; j++) q += s[j]! * s[j]!;
    v.push(((K / (K - 1)) * q) / (n * n));
  }
  const [vd, vc, vb] = v as [number, number, number];
  return Math.sqrt(Math.max(vd + vc - vb, vd, vc));
}
