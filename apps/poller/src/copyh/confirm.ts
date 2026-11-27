/**
 * The confirmation, once, on S alone, at step 2 (copyh/rules.md C14; Holm
 * with m = 2 always: M5; RM1): each chosen try on its line's copies with t
 * in S, voted by END_S. Its statistic s = min(m ÷ SE, m′ ÷ SE′), C12's forms
 * on that set; a try with no copy there, or whose SE or SE′ cannot be
 * computed, has no s. The try with the larger s is the first (a try with no
 * s second; equal s, the choice's order); the first is tested at 2.24, the
 * second at 1.96 and only when the first's s exceeded 2.24, whatever the
 * first's other conditions say (Holm's step-down is on s alone); a lone try
 * at 2.24. A try's reading, the first that holds: WITHHELD, more than 2% of
 * its set unpriced; NOT CONFIRMED with no s; NOT CONFIRMED when not tested;
 * CONFIRMED when its s exceeds its bar and C12's three sign conditions hold
 * on S; NOT CONFIRMED otherwise. Each sentence is written in advance, with
 * R12's line after it; a try not confirmed is closed for good.
 */
import { WITHHELD_SHARE, Z_CONFIRM } from "./design.js";
import {
  R12_LINE,
  boundsOf,
  failingSign,
  fixed,
  type Statistic,
} from "./verdict.js";

/** A reading on S, or on FRESH-2 (fresh2.ts). */
export type Confirmation = "CONFIRMED" | "NOT CONFIRMED" | "WITHHELD";

/** A chosen try's reading on S: its s, the bar it was tested at (null: not tested), its sentences. */
export type TryReading = {
  readonly reading: Confirmation;
  readonly s: number | null;
  readonly z: number | null;
  readonly sentences: readonly string[];
};

/** s = min(m ÷ SE, m′ ÷ SE′) on a set, null with no copy or no error. */
export function sOf(st: Statistic): number | null {
  const m = st.money;
  const e = st.edge;
  if (m === null || m.se === null || e.byDay === null || e.se === null)
    return null;
  return Math.min(m.mean / m.se, e.byDay.mean / e.se);
}

/** The tries' places in Holm's order: the larger s first, a try with no s after one with an s, equal s (or none) in the choice's order. */
export function holmOrder(ss: readonly (number | null)[]): number[] {
  return ss
    .map((_, k) => k)
    .sort((a, b) => {
      const x = ss[a] ?? null;
      const y = ss[b] ?? null;
      if (x === null || y === null)
        return x === y ? a - b : x === null ? 1 : -1;
      return y - x || a - b;
    });
}

/** One try's reading on S, tested at `bar` (null: not tested). */
function readingOnS(
  st: Statistic,
  s: number | null,
  bar: number | null,
): TryReading {
  const done = (reading: Confirmation, sentence: string) => ({
    reading,
    s,
    z: bar,
    sentences: [sentence, R12_LINE],
  });
  if (st.unpricedShare > WITHHELD_SHARE)
    return done(
      "WITHHELD",
      `Withheld on S: ${fixed(st.unpricedShare * 100)}% of the copies were unpriced, above the 2% limit.`,
    );
  if (s === null)
    return done(
      "NOT CONFIRMED",
      "Not confirmed on S: no error could be computed.",
    );
  if (bar === null)
    return done(
      "NOT CONFIRMED",
      "Not confirmed on S: not tested, since the first try's bounds at 2.24 were not both above 0.",
    );
  const b = boundsOf(st, bar)!;
  if (s > bar && failingSign(st) === null)
    return done(
      "CONFIRMED",
      `Confirmed on S at ${bar}: m − z·SE = ${fixed(b.money.lower)} bps a copy and m′ − z·SE′ = ${fixed(b.edge.lower)}, both above 0; the traders' own means, the days' own means and the copies without thin legs are above 0 too.`,
    );
  return done(
    "NOT CONFIRMED",
    `Not confirmed on S at ${bar}: m − z·SE = ${fixed(b.money.lower)} bps a copy and m′ − z·SE′ = ${fixed(b.edge.lower)}; a confirmation needs both above 0 and the three conditions.`,
  );
}

/** The chosen tries' readings on S, in the choice's order, each from its set's statistic: the first in Holm's order at 2.24, the second at 1.96 when the first's s exceeded 2.24 (at most two: Z_CONFIRM's bars). */
export function confirmationOf(stats: readonly Statistic[]): TryReading[] {
  if (stats.length > Z_CONFIRM.length)
    throw new Error(
      `${stats.length} chosen tries: at most ${Z_CONFIRM.length}`,
    );
  const ss = stats.map(sOf);
  const order = holmOrder(ss);
  const first = order.length === 0 ? null : (ss[order[0]!] ?? null);
  const out: TryReading[] = [];
  order.forEach((k, place) => {
    const s = ss[k] ?? null;
    const tested = place === 0 || (first !== null && first > Z_CONFIRM[0]);
    out[k] = readingOnS(
      stats[k]!,
      s,
      tested && s !== null ? Z_CONFIRM[place]! : null,
    );
  });
  return out;
}
