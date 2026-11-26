/**
 * The statistic and the verdict (copyh/rules.md C12, MAIN only).
 * - The set of a look: MAIN's copies voted by its END (C10), both readings
 *   on that one set.
 * - The money: x, a copy's net in bps; m its mean over the set's priced
 *   copies; SE, R12's two-way error by address and by the UTC day of t + D
 *   (`dist/paper/stats.js`'s `twoWay`, with the kit's `cr1Test`).
 * - The edge over the market: x′ over the set's copies with a d; m′ its
 *   mean; SE′ the larger of the two-way error with the UTC day of t + D as
 *   its time cluster and the same with the UTC week (`twoWay` on the
 *   copies' instants moved to their week's Monday, whose day is itself).
 * - The three sign conditions, on x: the mean of the traders' own means,
 *   the mean of the UTC days' own means (the day of t + D), and the mean
 *   over the copies without a thin leg (C9), each above 0; a mean over no
 *   copy is not.
 * - The readings in order, the first that holds: WITHHELD above 2% of the
 *   set unpriced; TOO FEW TO TELL when SE or SE′ cannot be computed; DROP
 *   when both upper bounds (m + z·SE, m′ + z·SE′) are below +10 bps; KEEP
 *   when both lower bounds are above 0 and the three sign conditions hold;
 *   else TOO FEW TO TELL with every case of (a)–(e) that applies, in order,
 *   or, when none does, "no mean result as large as" the larger upper
 *   bound. Each reading's sentences are C12's, written in advance, X and Y
 *   in bps a copy and P in percent, one decimal each (the paper's); R12's
 *   line follows every reading.
 * C14's confirmation and FRESH-2's sealed judgment read the same forms.
 */
import { twoWay, type TwoWay } from "../paper/stats.js";
import type { Research } from "../paper/research.js";
import { DELTA_BPS, WITHHELD_SHARE } from "./design.js";
import { dayOf, weekOf } from "./instants.js";

/** A copy of a judged set as the statistic reads it. */
export type JudgedCopy = {
  readonly addr: string;
  /** Its follow instant, t + D. */
  readonly tIn: number;
  /** Its net in bps; null when unpriced. */
  readonly x: number | null;
  /** Its x′ in bps; null when its d is. */
  readonly edge: number | null;
  /** Whether it is a thin-tape copy (C9). */
  readonly thin: boolean;
};

/** C12's forms on a set. */
export type Statistic = {
  readonly copies: number;
  readonly unpriced: number;
  readonly unpricedShare: number;
  /** m and SE over the priced copies. */
  readonly money: TwoWay | null;
  /** m′ (byDay's mean) and SE′, the larger of the errors by day and by week. */
  readonly edge: {
    readonly byDay: TwoWay | null;
    readonly byWeek: TwoWay | null;
    readonly se: number | null;
  };
  /** The sign conditions' three means of x, each null over no copy. */
  readonly signs: {
    readonly traders: number | null;
    readonly days: number | null;
    readonly withoutThin: number | null;
  };
};

const meanOf = (xs: readonly number[]): number | null =>
  xs.length === 0 ? null : xs.reduce((s, x) => s + x, 0) / xs.length;

/** The mean of the groups' own means. */
function meanOfMeans<T>(
  items: readonly { readonly x: number; readonly key: T }[],
): number | null {
  const groups = new Map<T, number[]>();
  for (const { x, key } of items) {
    const g = groups.get(key);
    if (g === undefined) groups.set(key, [x]);
    else g.push(x);
  }
  return meanOf([...groups.values()].map((g) => meanOf(g)!));
}

/** C12's forms on a set of copies. */
export function statisticOf(
  kit: Research,
  copies: readonly JudgedCopy[],
): Statistic {
  const priced = copies.flatMap((c) =>
    c.x === null ? [] : [{ addr: c.addr, tIn: c.tIn, x: c.x, thin: c.thin }],
  );
  const edged = copies.flatMap((c) =>
    c.edge === null ? [] : [{ addr: c.addr, tIn: c.tIn, x: c.edge }],
  );
  const byDay = twoWay(kit, edged);
  const byWeek = twoWay(
    kit,
    edged.map((c) => ({ ...c, tIn: weekOf(c.tIn) })),
  );
  const unpriced = copies.length - priced.length;
  return {
    copies: copies.length,
    unpriced,
    unpricedShare: copies.length === 0 ? 0 : unpriced / copies.length,
    money: twoWay(kit, priced),
    edge: {
      byDay,
      byWeek,
      se:
        byDay?.se == null || byWeek?.se == null
          ? null
          : Math.max(byDay.se, byWeek.se),
    },
    signs: {
      traders: meanOfMeans(priced.map((c) => ({ x: c.x, key: c.addr }))),
      days: meanOfMeans(priced.map((c) => ({ x: c.x, key: dayOf(c.tIn) }))),
      withoutThin: meanOf(priced.filter((c) => !c.thin).map((c) => c.x)),
    },
  };
}

/** Both readings' bounds at z, when both errors exist. */
export type Bounds = {
  readonly money: { readonly lower: number; readonly upper: number };
  readonly edge: { readonly lower: number; readonly upper: number };
};

export function boundsOf(s: Statistic, z: number): Bounds | null {
  const m = s.money;
  const e = s.edge;
  if (m === null || m.se === null || e.byDay === null || e.se === null)
    return null;
  return {
    money: { lower: m.mean - z * m.se, upper: m.mean + z * m.se },
    edge: {
      lower: e.byDay.mean - z * e.se,
      upper: e.byDay.mean + z * e.se,
    },
  };
}

/** The first of the three sign conditions that fails, by its name in C12's sentence; null when all hold. */
export function failingSign(s: Statistic): string | null {
  const above = (v: number | null) => v !== null && v > 0;
  if (!above(s.signs.traders)) return "the mean of the traders' own means";
  if (!above(s.signs.days)) return "the mean of the days' own means";
  if (!above(s.signs.withoutThin))
    return "the mean without the thin-tape copies";
  return null;
}

export type Verdict = "KEEP" | "DROP" | "TOO FEW TO TELL" | "WITHHELD";

/** The first KEEP or DROP is COPY-H's verdict on MAIN (C12): a look after one prints its figures marked "after the verdict" and changes nothing. */
export const afterTheVerdict = (earlier: readonly Verdict[]): boolean =>
  earlier.some((v) => v === "KEEP" || v === "DROP");

/** R12's line, after every reading. */
export const R12_LINE =
  "Keep and drop are verdicts on this test, never instructions to trade.";

/** A number of a sentence: one decimal (the paper's). */
export const fixed = (v: number): string => v.toFixed(1);

/** MAIN's reading of a look at z (C12): its verdict and its sentences, R12's line last. */
export function readingOf(
  s: Statistic,
  z: number,
): { verdict: Verdict; sentences: string[] } {
  const done = (verdict: Verdict, sentences: string[]) => ({
    verdict,
    sentences: [...sentences, R12_LINE],
  });
  if (s.unpricedShare > WITHHELD_SHARE)
    return done("WITHHELD", [
      `Withheld: ${fixed(s.unpricedShare * 100)}% of MAIN's copies were unpriced, above the 2% limit; the data could not answer.`,
    ]);
  const b = boundsOf(s, z);
  if (b === null)
    return done("TOO FEW TO TELL", [
      "Too few to tell: no error could be computed.",
    ]);
  const { money, edge } = b;
  if (money.upper < DELTA_BPS && edge.upper < DELTA_BPS)
    return done("DROP", [
      `Drop: m + z·SE = ${fixed(money.upper)} bps a copy on the money and m′ + z·SE′ = ${fixed(edge.upper)} on the edge over the market, both below the +10 bps line.`,
    ]);
  const sign = failingSign(s);
  if (money.lower > 0 && edge.lower > 0 && sign === null)
    return done("KEEP", [
      `Keep: m − z·SE = ${fixed(money.lower)} bps a copy on the money and m′ − z·SE′ = ${fixed(edge.lower)} on the edge over the market, both above 0; the traders' own means, the days' own means and the copies without thin legs are above 0 too.`,
    ]);
  // DROP did not hold: an upper bound below +10 is the only one.
  const cases: string[] = [];
  if (money.upper < DELTA_BPS)
    cases.push(
      `Too few to tell: the money's upper bound, ${fixed(money.upper)} bps a copy, is below the +10 bps line, but the edge over the market's, ${fixed(edge.upper)}, is not.`,
    );
  if (edge.upper < DELTA_BPS)
    cases.push(
      `Too few to tell: the edge over the market's upper bound, ${fixed(edge.upper)} bps a copy, is below the +10 bps line, but the money's, ${fixed(money.upper)}, is not.`,
    );
  if (money.lower > 0 && !(edge.lower > 0))
    cases.push(
      `Too few to tell: the money's lower bound, ${fixed(money.lower)} bps a copy, is above 0, but the edge over the market's, ${fixed(edge.lower)}, is not; the market's direction may carry the money.`,
    );
  if (edge.lower > 0 && !(money.lower > 0))
    cases.push(
      `Too few to tell: the edge over the market's lower bound, ${fixed(edge.lower)} bps a copy, is above 0, but the money's, ${fixed(money.lower)}, is not.`,
    );
  if (money.lower > 0 && edge.lower > 0 && sign !== null)
    cases.push(
      `Too few to tell: both lower bounds are above 0, but ${sign} is not.`,
    );
  if (cases.length === 0)
    cases.push(
      `Too few to tell: no mean result as large as ${fixed(Math.max(money.upper, edge.upper))} bps a copy was seen.`,
    );
  return done("TOO FEW TO TELL", cases);
}
