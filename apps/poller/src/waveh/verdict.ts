/**
 * WAVE-H's statistic and verdict (rules.md H11, H12): x = a position's net in
 * bps, each position alike; MARKET-1's two-way error clustered by the UTC day
 * of t, by the coin and by the pair; z = 2.58; MARKET-1's δ and minimums. The
 * order: WITHHELD, TOO FEW TO TELL, DOES NOT HOLD, HOLDS, NOT SETTLED.
 */
import {
  DROP_BPS,
  MIN_DAYS,
  MIN_MARKETS,
  NOT_AT_BOOK_LIMIT,
  twoWay,
  type TwoWay,
} from "../market1/stats.js";
import type { Research } from "../paper/research.js";
import type { Priced } from "./price.js";

/** Two-sided 1%: HOLDS and DOES NOT HOLD each one-sided at 0.5% (H11). */
export const Z = 2.58;

export type Verdict =
  "WITHHELD" | "TOO FEW TO TELL" | "DOES NOT HOLD" | "HOLDS" | "NOT SETTLED";

export function verdict(a: {
  mean: number;
  se: number | null;
  /** The mean excess over the priced positions with one, or null. */
  meanExcess: number | null;
  /** The set's share unpriced or with a depth-short leg. */
  notAtBookShare: number;
  days: number;
  coins: number;
}): Verdict {
  if (a.notAtBookShare > NOT_AT_BOOK_LIMIT) return "WITHHELD";
  if (a.se === null || a.days < MIN_DAYS || a.coins < MIN_MARKETS)
    return "TOO FEW TO TELL";
  if (a.mean + Z * a.se < DROP_BPS) return "DOES NOT HOLD";
  if (a.mean - Z * a.se > 0 && a.meanExcess !== null && a.meanExcess > 0)
    return "HOLDS";
  return "NOT SETTLED";
}

export function sentence(v: Verdict, mean: number, se: number | null): string {
  return v === "NOT SETTLED" && se !== null
    ? `No mean result as large as ${(mean + Z * se).toFixed(1)} bps a position was seen.`
    : "Holds and does not hold are verdicts on this test, never instructions to trade.";
}

export type Decision = {
  positions: number;
  priced: number;
  unpriced: number;
  depthShort: number;
  notAtBookShare: number;
  stat: TwoWay | null;
  meanExcess: number | null;
  withoutExcess: number;
  verdict: Verdict;
  sentence: string;
};

/** H11 and H12 on the set: the statistic over the priced positions' nets, the verdict and its sentence. */
export function decide(
  kit: Research,
  set: readonly { t: number; iid: number; priced: Priced }[],
): Decision {
  const priced = set.filter((p) => p.priced.net !== null);
  const depthShort = priced.filter((p) => p.priced.depthShort).length;
  const unpriced = set.length - priced.length;
  const stat = twoWay(
    kit,
    priced.map((p) => ({ t: p.t, iid: p.iid, x: p.priced.net! })),
  );
  const excess = priced.flatMap((p) =>
    p.priced.excess === null ? [] : [p.priced.excess],
  );
  const meanExcess =
    excess.length === 0
      ? null
      : excess.reduce((s, x) => s + x, 0) / excess.length;
  const notAtBookShare =
    set.length === 0 ? 0 : (unpriced + depthShort) / set.length;
  const v = verdict({
    mean: stat?.mean ?? 0,
    se: stat?.se ?? null,
    meanExcess,
    notAtBookShare,
    days: stat?.days ?? 0,
    coins: stat?.markets ?? 0,
  });
  return {
    positions: set.length,
    priced: priced.length,
    unpriced,
    depthShort,
    notAtBookShare,
    stat,
    meanExcess,
    withoutExcess: priced.length - excess.length,
    verdict: v,
    sentence: sentence(v, stat?.mean ?? 0, stat?.se ?? null),
  };
}
