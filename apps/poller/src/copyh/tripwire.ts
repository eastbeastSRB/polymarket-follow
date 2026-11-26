/**
 * The coverage tripwire, before any price (copyh/rules.md C16): from a
 * coin's bars, its funding rows' hours and the copies' plans alone (entries,
 * exits and D), each copy's reason to be unpriced as lib-exits' `priceCopy`
 * will find it on C9's market object, leg by leg in order:
 * 1. no mark in the 6 minutes up to the minute end of its follow instant,
 *    or of a leg's instant (an open or crossing copy's END − 1 ms among
 *    them): the minute that holds it and the 5 before, the kit's staleness;
 * 2. a funding row whose nominal hour lies in (t + D, that leg's instant]
 *    with no mark in the 6 minutes before the hour, or in the 61 under C9's
 *    60-minute rule.
 * A minute holds a mark exactly when it lies in the object's minutes (from
 * the coin's first market trade's minute to its end) and holds a market
 * trade of a size above 0, or is the coin's Settlement minute, the object's
 * last (C9; C6; the engine's plan, Q12): so a settled copy's last leg, at
 * its coin's end − 1 ms, is never unpriced. Counted beside: 3. the copies
 * open at their coin's first Settlement; 4. the funding hours missing in
 * the copies' holds; 5. the gap copies. The projected unpriced share is the
 * set's share with reason 1 or 2; above 1% the step stops before any price
 * (exit 6) unless run again with `--past-tripwire`, which runs as frozen.
 */
import { HOUR_MS, MINUTE_MS } from "../schedule.js";
import { TRIPWIRE_MINUTES, TRIPWIRE_STOP } from "./design.js";
import type { Coin, MarkMinutes } from "./markets.js";

/** lib-exits' three reasons, in `unpricedReason`'s order. */
export const UNPRICED_REASONS = [
  "no mark at the follow instant",
  "no mark at an exit instant",
  "a funding settlement without a mark",
] as const;
export type UnpricedReason = (typeof UNPRICED_REASONS)[number];

/** A coin's marks as its market object will hold them, and its funding rows' hours. */
export type CoinMarks = {
  /** Whether the object holds a mark at the minute end of x, within the kit's staleness. */
  readonly markAt: (x: number) => boolean;
  /** The funding settlements without a mark (C9's rule) whose nominal hour lies in (a, b]. */
  readonly unmarked: (a: number, b: number) => number;
  /** The whole hours in (a, b] without a funding row (the kit's `fundingBetween`). */
  readonly missing: (a: number, b: number) => number;
};

/** The first index whose value is above x (values rising). */
function upperBound(values: readonly number[], x: number): number {
  let lo = 0;
  let hi = values.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (values[mid]! <= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** A coin's marks from its bars and end (markets.ts `coinOf`) and its funding rows' nominal hours, each settled at C9's mark. */
export function coinMarksOf(
  coin: Pick<Coin, "bars" | "end" | "settlement">,
  hours: readonly number[],
  markMinutes: MarkMinutes,
): CoinMarks {
  const { bars } = coin;
  const kEnd = (coin.end - bars.start) / MINUTE_MS;
  let k0 = 0;
  while (k0 < kEnd && bars.trades[k0] === 0) k0++;
  /** The minutes with a mark among the bars' first k. */
  const count = new Int32Array(kEnd + 1);
  for (let k = 0; k < kEnd; k++) {
    const mark =
      k >= k0 &&
      (bars.sz[k]! > 0 || (coin.settlement !== null && k === kEnd - 1));
    count[k + 1] = count[k]! + (mark ? 1 : 0);
  }
  /** A mark in the minute that holds x or one of the `back` before it, x's minute inside the object. */
  const within = (x: number, back: number) => {
    const i = Math.floor((x - bars.start) / MINUTE_MS);
    return (
      i >= k0 && i < kEnd && count[i + 1]! - count[Math.max(k0, i - back)]! > 0
    );
  };
  const rising = [...hours].sort((a, b) => a - b);
  /** The settlements without a mark among the first i hours. */
  const cumUnmarked = [0];
  for (const h of rising)
    cumUnmarked.push(
      cumUnmarked.at(-1)! + (within(h - 1, markMinutes) ? 0 : 1),
    );
  return {
    markAt: (x) => within(x, TRIPWIRE_MINUTES - 1),
    unmarked: (a, b) =>
      cumUnmarked[upperBound(rising, b)]! - cumUnmarked[upperBound(rising, a)]!,
    missing: (a, b) =>
      Math.floor(b / HOUR_MS) -
      Math.floor(a / HOUR_MS) -
      (upperBound(rising, b) - upperBound(rising, a)),
  };
}

/** A copy of a projected set as the tripwire reads it: its plan's instants (the follow instant t + D, each leg's in order) and flags. */
export type Planned = {
  readonly iid: number;
  readonly tIn: number;
  readonly legs: readonly number[];
  readonly settled: boolean;
  readonly gap: boolean;
};

/** The reason `priceCopy` will give the copy, by 1 and 2 above, or null when it will be priced. */
export function reasonOf(marks: CoinMarks, c: Planned): UnpricedReason | null {
  if (!marks.markAt(c.tIn)) return UNPRICED_REASONS[0];
  for (const x of c.legs) {
    if (!marks.markAt(x)) return UNPRICED_REASONS[1];
    if (marks.unmarked(c.tIn, x) > 0) return UNPRICED_REASONS[2];
  }
  return null;
}

/** C16's counts over a set. */
export type Projection = {
  readonly copies: number;
  readonly unpriced: Readonly<Record<UnpricedReason, number>>;
  /** The set's share with reason 1 or 2. */
  readonly share: number;
  readonly settled: number;
  /** The funding hours missing in the copies' holds, (t + D, the last leg's instant], and the copies with one. */
  readonly missingHours: number;
  readonly copiesMissing: number;
  readonly gap: number;
};

/** The projection of a set (C16), each copy's coin's marks by `marksOf`; with each copy's projected reason, in the set's order. */
export function projectionOf(
  copies: readonly Planned[],
  marksOf: (iid: number) => CoinMarks,
): { projection: Projection; reasons: (UnpricedReason | null)[] } {
  const unpriced = Object.fromEntries(
    UNPRICED_REASONS.map((r) => [r, 0]),
  ) as Record<UnpricedReason, number>;
  let settled = 0;
  let missingHours = 0;
  let copiesMissing = 0;
  let gap = 0;
  const reasons = copies.map((c) => {
    const marks = marksOf(c.iid);
    const reason = reasonOf(marks, c);
    if (reason !== null) unpriced[reason] += 1;
    if (c.settled) settled += 1;
    if (c.gap) gap += 1;
    // A loop, never a copy's legs spread into a call: a call takes about 124,600 arguments in a process's main thread (the engine review's M1).
    let last = c.tIn;
    for (const x of c.legs) if (x > last) last = x;
    const missing = marks.missing(c.tIn, last);
    missingHours += missing;
    if (missing > 0) copiesMissing += 1;
    return reason;
  });
  const n = reasons.filter((r) => r !== null).length;
  return {
    projection: {
      copies: copies.length,
      unpriced,
      share: copies.length === 0 ? 0 : n / copies.length,
      settled,
      missingHours,
      copiesMissing,
      gap,
    },
    reasons,
  };
}

/** Whether the step stops before any price (C16): a projected share above 1%, without `--past-tripwire`. */
export const tripwireStops = (share: number, pastTripwire: boolean): boolean =>
  share > TRIPWIRE_STOP && !pastTripwire;
