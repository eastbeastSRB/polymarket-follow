/**
 * The statistic and the verdict (the plan's R12, R14, R15, with its review's
 * F16 and F18). x = a copy's net in bps, each copy alike; the error is
 * two-way: SE = √max(V_trader + V_day − V_iid, V_trader, V_day), V_trader and
 * V_day the kit's CR1 variances of the mean clustered by address and by the
 * UTC day of t + D, V_iid = s² / n. KEEP when m − z·SE > 0 and the mean d of
 * the set's copies with a d is above 0; DROP when m + z·SE < +10 bps; DROP
 * wins when both hold (decisions 2026-11-12, Q-G); TOO FEW TO TELL otherwise;
 * WITHHELD when more than 2% of the set is unpriced (F16 c).
 */
import { DAY_MS } from "../schedule.js";
import type { Research } from "./research.js";

/** The looks' two-sided limits: 0.5%, 1.5%, 3% (5% in all, two-sided; KEEP spends half of it). */
export const LOOK_Z = [2.81, 2.43, 2.17] as const;
/** δ, the smallest edge worth having (decisions 2026-11-12, APPROACH-REVIEW accepted). */
export const DROP_BPS = 10;
/** A look's verdict is withheld above this share of unpriced copies. */
export const UNPRICED_LIMIT = 0.02;
/** z of 80% power: "the smallest edge seen four times in five" (APPROACH-REVIEW C5). */
export const Z_POWER = 0.8416212335729143;

export type TwoWay = {
  n: number;
  mean: number;
  se: number | null;
  seTrader: number | null;
  seDay: number | null;
  seIid: number | null;
  traders: number;
  days: number;
};

export type Item = { addr: string; tIn: number; x: number };

export const dayOf = (t: number): number => Math.floor(t / DAY_MS) * DAY_MS;

export function twoWay(kit: Research, items: readonly Item[]): TwoWay | null {
  const n = items.length;
  if (n === 0) return null;
  const byTrader = kit.stats.cr1Test(
    items,
    (i) => i.addr,
    (i) => i.x,
  );
  const byDay = kit.stats.cr1Test(
    items,
    (i) => dayOf(i.tIn),
    (i) => i.x,
  );
  const mean = items.reduce((s, i) => s + i.x, 0) / n;
  const s2 =
    n > 1 ? items.reduce((s, i) => s + (i.x - mean) ** 2, 0) / (n - 1) : null;
  const vT = byTrader.se === null ? null : byTrader.se ** 2;
  const vD = byDay.se === null ? null : byDay.se ** 2;
  const vI = s2 === null ? null : s2 / n;
  const se =
    vT === null || vD === null || vI === null
      ? null
      : Math.sqrt(Math.max(vT + vD - vI, vT, vD));
  return {
    n,
    mean,
    se,
    seTrader: byTrader.se,
    seDay: byDay.se,
    seIid: vI === null ? null : Math.sqrt(vI),
    traders: byTrader.clusters,
    days: byDay.clusters,
  };
}

export type Verdict = "KEEP" | "DROP" | "TOO FEW TO TELL" | "WITHHELD";

export function verdict(args: {
  mean: number;
  se: number | null;
  z: number;
  meanD: number | null;
  unpricedShare: number;
}): Verdict {
  if (args.unpricedShare > UNPRICED_LIMIT) return "WITHHELD";
  if (args.se === null) return "TOO FEW TO TELL";
  const keep =
    args.mean - args.z * args.se > 0 && args.meanD !== null && args.meanD > 0;
  const drop = args.mean + args.z * args.se < DROP_BPS;
  if (drop) return "DROP";
  if (keep) return "KEEP";
  return "TOO FEW TO TELL";
}

/** A day's vote is a tie, dropped, when its mean d lies within ±0.1 bps (decisions 2026-11-07, R3 (4)). */
export const TIE_BPS = 0.1;

function logFactorial(n: number): number {
  let s = 0;
  for (let i = 2; i <= n; i++) s += Math.log(i);
  return s;
}

/**
 * R3's pooled daily e-value (decisions 2026-11-07, R3 (4)): one vote a UTC
 * day of t + D, the sign of the day's mean d; E = 2ⁿ·k!(n−k)!/(n+1)! for k
 * positive votes of n untied. Deciding nothing here.
 */
export function dailyEValue(items: readonly { tIn: number; d: number }[]): {
  e: number;
  votes: number;
  positive: number;
} {
  const days = new Map<number, { s: number; n: number }>();
  for (const { tIn, d } of items) {
    const g = days.get(dayOf(tIn)) ?? { s: 0, n: 0 };
    g.s += d;
    g.n += 1;
    days.set(dayOf(tIn), g);
  }
  let n = 0;
  let k = 0;
  for (const g of days.values()) {
    const m = g.s / g.n;
    if (Math.abs(m) < TIE_BPS) continue;
    n += 1;
    if (m > 0) k += 1;
  }
  const logE =
    n * Math.LN2 + logFactorial(k) + logFactorial(n - k) - logFactorial(n + 1);
  return { e: Math.exp(logE), votes: n, positive: k };
}

/**
 * The smallest edge the next look would see four times in five at the
 * realized noise (R14, F16 b): (z_next + z_0.80) × SE × √(n / n_next), where
 * n_next = n × (the next look's days of data ÷ the days so far).
 */
export function smallestEdge(
  se: number | null,
  zNext: number,
  daysSoFar: number,
  daysAtNext: number,
): number | null {
  if (se === null || daysSoFar <= 0) return null;
  return (zNext + Z_POWER) * se * Math.sqrt(daysSoFar / daysAtNext);
}

/**
 * A trader's 95% band on the page (R15, F16 b): the mean with its CR1 error
 * clustered by UTC day and Student's t on days − 1 degrees of freedom, from
 * 20 days with a copy; else none ("too few days").
 */
export function traderBand(
  kit: Research,
  items: readonly Item[],
): { low: number; high: number } | null {
  const r = kit.stats.cr1Test(
    items,
    (i) => dayOf(i.tIn),
    (i) => i.x,
  );
  if (r.clusters < 20 || r.se === null || r.estimate === null) return null;
  const t = kit.stats.tCritical(0.05, r.clusters - 1);
  return { low: r.estimate - t * r.se, high: r.estimate + t * r.se };
}
