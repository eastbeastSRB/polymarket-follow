/**
 * The sealed judgment, once, on FRESH-2 alone (copyh/rules.md C14; RM1):
 * each try confirmed on S at one-sided 2.5% (z 1.96), and a MAIN KEEP at 5%
 * (z 1.645), each on its copies with t in FRESH-2, voted by END_F2. The
 * reading, the first that holds: WITHHELD, more than 2% of the set
 * unpriced; NOT CONFIRMED, the set empty or its SE or SE′ not computed;
 * CONFIRMED, m − z·SE > 0, m′ − z·SE′ > 0 and C12's three sign conditions;
 * NOT CONFIRMED otherwise. Each sentence is written in advance, with R12's
 * line after it. Only a confirmed KEEP or a confirmed try is a yes; a
 * reading not confirmed is not judged again. MAIN's prints, when MAIN is
 * judged, in FRESH-2's form (`fresh2Report`).
 */
import type { Confirmation } from "./confirm.js";
import { WITHHELD_SHARE } from "./design.js";
import type { Report } from "./prints.js";
import {
  R12_LINE,
  boundsOf,
  failingSign,
  fixed,
  type Statistic,
} from "./verdict.js";

/** A set's sealed reading on FRESH-2 at z. */
export function sealedOf(
  st: Statistic,
  z: number,
): { reading: Confirmation; z: number; sentences: string[] } {
  const done = (reading: Confirmation, sentence: string) => ({
    reading,
    z,
    sentences: [sentence, R12_LINE],
  });
  if (st.unpricedShare > WITHHELD_SHARE)
    return done(
      "WITHHELD",
      `Withheld on FRESH-2: ${fixed(st.unpricedShare * 100)}% of the copies were unpriced, above the 2% limit.`,
    );
  const b = boundsOf(st, z);
  if (b === null)
    return done(
      "NOT CONFIRMED",
      "Not confirmed on FRESH-2: no error could be computed.",
    );
  if (b.money.lower > 0 && b.edge.lower > 0 && failingSign(st) === null)
    return done(
      "CONFIRMED",
      `Confirmed on FRESH-2: m − z·SE = ${fixed(b.money.lower)} bps a copy and m′ − z·SE′ = ${fixed(b.edge.lower)}, both above 0; the traders' own means, the days' own means and the copies without thin legs are above 0 too.`,
    );
  return done(
    "NOT CONFIRMED",
    `Not confirmed on FRESH-2: m − z·SE = ${fixed(b.money.lower)} bps a copy and m′ − z·SE′ = ${fixed(b.edge.lower)}; a yes needs both above 0 and the three conditions.`,
  );
}

/** MAIN's prints in FRESH-2's form (C14 (4) 5.; L9, decisions 2026-11-25, "the crash side only", ruling 6: FRESH-2 is also that frozen page's months): no move of a crash hour, so no cascade print and no null mean gross (a market's own move beside the copies' figures); the day and month prints named as what they are. Every other print is taken by name, so that none is added by accident. */
export function fresh2Report(r: Report) {
  const { worstDay, withoutItAndTheMostInfluentialDay, ...r14 } = r.r14;
  const { months, ...parts } = r.parts;
  return {
    r14: {
      ...r14,
      "COPY-H's copies by UTC day: the worst": worstDay,
      "COPY-H's copies by UTC day: the mean without the most influential account, then also without the most influential day":
        withoutItAndTheMostInfluentialDay,
    },
    lines: r.lines,
    parts: { ...parts, "COPY-H's copies by UTC month": months },
    venues: r.venues,
    h1: {
      d: r.h1.d,
      edge: r.h1.edge,
      moneyByWeek: r.h1.moneyByWeek,
      moneyByMonth: r.h1.moneyByMonth,
    },
    concentration: r.concentration,
    settled: r.settled,
    thin: r.thin,
    gap: r.gap,
  };
}
