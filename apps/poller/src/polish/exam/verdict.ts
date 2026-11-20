/**
 * The exam's statistic and verdict (polish/rules.md P9, P11, P12; THE PLAN
 * D31, D36–D44; decisions 2026-11-19: the owner's HOLDS at 99% with LIKELY
 * at 95%, the plan's questions ruled Q3 and Q4, and the placebo's run, F14
 * read as MARKET-1's M11). At a look, over the deciding line's positions,
 * left-out ones included: m and MARKET-1's two-way SE over the priced nets,
 * depth-short ones included; then the first of WITHHELD, TOO FEW TO TELL,
 * DOES NOT HOLD, HOLDS, LIKELY and NOT SETTLED that holds, with its sentence
 * written in advance. Over the looks, the first HOLDS or DOES NOT HOLD is
 * the exam's verdict; any other reading lets the next look run, and the
 * last look's reading stands.
 */
import { statOf } from "../tries/stats.js";
import type { Research } from "../../paper/research.js";
import { DELTA, TOO_FEW, WITHHELD_SHARE } from "./design.js";

export type Verdict =
  | "WITHHELD"
  | "TOO FEW TO TELL"
  | "DOES NOT HOLD"
  | "HOLDS"
  | "LIKELY"
  | "NOT SETTLED";

/** H12's line, printed with every verdict. */
export const NOT_ADVICE =
  "Holds and does not hold are verdicts on this test, never instructions to trade.";

/**
 * A deciding position as the verdict reads it (D36): left out (D30); its net,
 * null when unpriced or left out; a leg depth short, at the book or at the
 * tape; both legs at the book (F8); HOLDS's excess by the owner's option
 * (D28: over BASE, or OWN), null when it has none.
 */
export type Decided = {
  t: number;
  iid: number;
  leftOut: boolean;
  net: number | null;
  depthShort: boolean;
  bookBoth: boolean;
  excess: number | null;
};

const mean = (xs: readonly number[]) =>
  xs.length === 0 ? null : xs.reduce((s, x) => s + x, 0) / xs.length;
const bps = (x: number) => x.toFixed(1);

/**
 * One look's verdict (D36–D42) at HOLDS's z and LIKELY's z_L (DOES NOT HOLD
 * keeps HOLDS's z, Q3); `excess` names HOLDS's second condition, "BASE"
 * (the default) or "OWN" (the owner's option D).
 */
export function verdictOf(
  kit: Research,
  set: readonly Decided[],
  bars: { z: number; zL: number; excess: "BASE" | "OWN" },
) {
  const leftOut = set.filter((p) => p.leftOut).length;
  const priced = set.filter((p) => !p.leftOut && p.net !== null);
  const unpriced = set.length - leftOut - priced.length;
  const depthShort = priced.filter((p) => p.depthShort).length;
  const withheld = leftOut + unpriced + depthShort;
  const share = set.length === 0 ? 0 : withheld / set.length;
  const stat = statOf(
    kit,
    priced.map((p) => ({ t: p.t, iid: p.iid, x: p.net! })),
  );
  const excess = priced.flatMap((p) => (p.excess === null ? [] : [p.excess]));
  const book = priced.flatMap((p) => (p.bookBoth ? [p.net!] : []));
  const meanExcess = mean(excess);
  const meanBook = mean(book);
  const se = stat?.se ?? null;
  const m = stat?.mean ?? null;
  const bounds =
    m === null || se === null
      ? null
      : {
          holds: m - bars.z * se,
          likely: m - bars.zL * se,
          doesNotHold: m + bars.z * se,
        };
  // HOLDS's and LIKELY's other two conditions (D40): the mean excess and the mean of the positions at the book at both ends, each above 0.
  const signs =
    meanExcess !== null && meanExcess > 0 && meanBook !== null && meanBook > 0;
  let verdict: Verdict;
  if (share > WITHHELD_SHARE) verdict = "WITHHELD";
  else if (
    stat === null ||
    bounds === null ||
    stat.days < TOO_FEW.days ||
    stat.markets < TOO_FEW.coins
  )
    verdict = "TOO FEW TO TELL";
  else if (bounds.doesNotHold < DELTA) verdict = "DOES NOT HOLD";
  else if (bounds.holds > 0 && signs) verdict = "HOLDS";
  else if (bounds.likely > 0 && signs) verdict = "LIKELY";
  else verdict = "NOT SETTLED";
  const over =
    bars.excess === "BASE"
      ? "the excess over BASE"
      : "the move net of the other small coins (OWN)";
  const sentence = {
    WITHHELD: `Withheld: ${(100 * share).toFixed(1)}% of the deciding positions were left out, unpriced or depth short, above the 10% limit; the data could not answer.`,
    "TOO FEW TO TELL":
      bounds === null
        ? "Too few to tell: no error could be computed."
        : `Too few to tell: the priced positions span ${stat!.days} UTC days and ${stat!.markets} coins; ${TOO_FEW.days} and ${TOO_FEW.coins} are needed.`,
    "DOES NOT HOLD": `Does not hold: even m + z·SE = ${bps(bounds?.doesNotHold ?? 0)} bps a position is below the owner's line of +${DELTA}.`,
    HOLDS: `Holds: m − z·SE = ${bps(bounds?.holds ?? 0)} bps a position is above 0, with ${over} and the positions priced at the book both above 0.`,
    LIKELY: `Likely, not proven: m − z_L·SE = ${bps(bounds?.likely ?? 0)} bps a position is above 0 at the 95% bar, and m − z·SE = ${bps(bounds?.holds ?? 0)} is not above 0 at the 99% bar. Very probably real, not yet proven; it decides nothing that HOLDS decides.`,
    "NOT SETTLED": `No mean result as large as ${bps(bounds?.doesNotHold ?? 0)} bps a position was seen.`,
  }[verdict];
  return {
    verdict,
    sentence,
    line: NOT_ADVICE,
    bars,
    positions: set.length,
    leftOut,
    unpriced,
    depthShort,
    priced: priced.length,
    withheldShare: share,
    stat,
    bounds,
    excess: {
      mean: meanExcess,
      n: excess.length,
      without: priced.length - excess.length,
    },
    atTheBook: { mean: meanBook, n: book.length },
  };
}

/** A reading that ends the exam at a look before its last (F14 as MARKET-1's M11: the first KEEP or DROP is the verdict). */
export const decides = (v: Verdict) => v === "HOLDS" || v === "DOES NOT HOLD";

/**
 * The exam's verdict over its looks so far (D43, D44): the first look whose
 * reading is HOLDS or DOES NOT HOLD decides, and every later look prints
 * beside it; WITHHELD, TOO FEW TO TELL, LIKELY and NOT SETTLED let the next
 * look run; at the last look its reading stands. Null while the exam goes
 * on. Never combined with MARKET-1's verdicts.
 */
export function examVerdict(
  readings: readonly Verdict[],
  looks: number,
): { verdict: Verdict; look: number } | null {
  for (const [i, v] of readings.entries())
    if (decides(v) || i === looks - 1) return { verdict: v, look: i + 1 };
  return null;
}
