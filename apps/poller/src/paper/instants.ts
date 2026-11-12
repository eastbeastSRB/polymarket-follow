/**
 * The experiment's fixed instants (the plan's R1): the cut, the weeks and
 * the three looks. Times are milliseconds since the epoch; a window [a, b)
 * is start-inclusive, end-exclusive, as the API's.
 */
import { DAY_MS } from "../schedule.js";

/** The blind store's cut, the kit's `CUT` (a test pins the two equal). */
export const CUT = Date.parse("2026-11-07T00:00:00Z");
export const WEEK_MS = 7 * DAY_MS;

/** The looks' ends END₁ … END₃ (decisions 2026-11-12, APPROACH-REVIEW accepted). */
export const LOOK_ENDS = [
  Date.parse("2026-12-19T00:00:00Z"),
  Date.parse("2027-02-06T00:00:00Z"),
  Date.parse("2027-05-08T00:00:00Z"),
] as const;

/** The latest Monday 00:00Z at or before `t` (an entry's Monday M; 1970-01-05 was a Monday). */
export function mondayOf(t: number): number {
  const monday0 = 4 * DAY_MS;
  return Math.floor((t - monday0) / WEEK_MS) * WEEK_MS + monday0;
}

/** A run's END: 00:00Z of its UTC day. */
export function runEnd(wallMs: number): number {
  return Math.floor(wallMs / DAY_MS) * DAY_MS;
}
