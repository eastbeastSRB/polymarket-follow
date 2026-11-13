/**
 * MARKET-1's statistic and verdict (rules.md M10, M11, with MARKET-PLAN-REVIEW
 * F1, F5, F6). x = a position's net in bps, each position alike; SE =
 * √max(V_day + V_market − V_both, V_day, V_market), the kit's CR1 variances
 * of the mean clustered by the UTC day of t, by the market and by the
 * (day, market) pair. The looks' limits are the paper experiment's.
 */
import { DAY_MS } from "../schedule.js";
import type { Research } from "../paper/research.js";
import { Z_POWER } from "../paper/stats.js";

/** δ, the owner's drop line (decisions 2026-11-13). */
export const DROP_BPS = 50;
/** WITHHELD above this share of the set not priced at the book (M11, F6). */
export const NOT_AT_BOOK_LIMIT = 0.1;
/** A verdict needs at least so many UTC days and markets with a priced position (F5). */
export const MIN_DAYS = 20;
export const MIN_MARKETS = 10;

export const dayOf = (t: number): number => Math.floor(t / DAY_MS) * DAY_MS;

export type Item = { t: number; iid: number; x: number };

export type TwoWay = {
  n: number;
  mean: number;
  se: number | null;
  seDay: number | null;
  seMarket: number | null;
  days: number;
  markets: number;
};

export function twoWay(kit: Research, items: readonly Item[]): TwoWay | null {
  const n = items.length;
  if (n === 0) return null;
  const v = (key: (i: Item) => string | number) => {
    const r = kit.stats.cr1Test(items, key, (i) => i.x);
    return { se: r.se, clusters: r.clusters };
  };
  const day = v((i) => dayOf(i.t));
  const market = v((i) => i.iid);
  const both = v((i) => `${dayOf(i.t)}|${i.iid}`);
  const vd = day.se === null ? null : day.se ** 2;
  const vm = market.se === null ? null : market.se ** 2;
  const vb = both.se === null ? null : both.se ** 2;
  return {
    n,
    mean: items.reduce((s, i) => s + i.x, 0) / n,
    se:
      vd === null || vm === null || vb === null
        ? null
        : Math.sqrt(Math.max(vd + vm - vb, vd, vm)),
    seDay: day.se,
    seMarket: market.se,
    days: day.clusters,
    markets: market.clusters,
  };
}

/** The kit's CR1 error of the mean by UTC day alone (a single market, M12). */
export function byDay(kit: Research, items: readonly Item[]): TwoWay | null {
  if (items.length === 0) return null;
  const r = kit.stats.cr1Test(
    items,
    (i) => dayOf(i.t),
    (i) => i.x,
  );
  return {
    n: items.length,
    mean: items.reduce((s, i) => s + i.x, 0) / items.length,
    se: r.se,
    seDay: r.se,
    seMarket: null,
    days: r.clusters,
    markets: new Set(items.map((i) => i.iid)).size,
  };
}

export type Verdict = "KEEP" | "DROP" | "TOO FEW TO TELL" | "WITHHELD";

/** M11: WITHHELD, then TOO FEW TO TELL (no SE, under 20 days or 10 markets), then DROP before KEEP. */
export function verdict(a: {
  mean: number;
  se: number | null;
  z: number;
  /** The mean excess over the priced positions with a BASE cell (F1), or null. */
  meanExcess: number | null;
  notAtBookShare: number;
  days: number;
  markets: number;
}): Verdict {
  if (a.notAtBookShare > NOT_AT_BOOK_LIMIT) return "WITHHELD";
  if (a.se === null || a.days < MIN_DAYS || a.markets < MIN_MARKETS)
    return "TOO FEW TO TELL";
  const drop = a.mean + a.z * a.se < DROP_BPS;
  const keep =
    a.mean - a.z * a.se > 0 && a.meanExcess !== null && a.meanExcess > 0;
  if (drop) return "DROP";
  if (keep) return "KEEP";
  return "TOO FEW TO TELL";
}

/** M11's sentence. */
export function sentence(
  look: 1 | 2 | 3,
  v: Verdict,
  mean: number,
  se: number | null,
  z: number,
): string {
  if (look === 3 && v === "TOO FEW TO TELL" && se !== null) {
    return `No mean result as large as ${(mean + z * se).toFixed(1)} bps a position was seen.`;
  }
  return "Keep and drop are verdicts on this test, never instructions to trade.";
}

/** The smallest edge the next look would see four times in five (M13). */
export function smallestEdge(
  se: number | null,
  zNext: number,
  daysSoFar: number,
  daysAtNext: number,
): number | null {
  if (se === null || daysSoFar <= 0) return null;
  return (zNext + Z_POWER) * se * Math.sqrt(daysSoFar / daysAtNext);
}

/** P(Z > z) of the standard normal (Abramowitz–Stegun 26.2.17; error below 7.5e-8), as the paper experiment's summary. */
export function normalUpper(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly =
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const p = (Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI)) * poly;
  return z >= 0 ? p : 1 - p;
}
