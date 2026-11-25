/**
 * The archive's holes (copyh/rules.md C3, "Holes"): every stretch of HOLE_MS
 * or more inside a range's window [start, end) with no record of any coin,
 * from the union of every file's record times, so that a gap between files
 * counts (the switch hour's 4 min 22 s among them). Each file's scan keeps
 * its records' first and last time in each minute (`scan.ts`); two records
 * of one minute lie under a minute apart, so the union's holes are exactly
 * the gaps between one minute's last time and the next minute's first, with
 * the window's start and end as their outer bounds. The window's ends are
 * whole minutes, so a minute lies wholly inside it or outside.
 */
import { MINUTE_MS } from "../schedule.js";
import { HOLE_MS } from "./design.js";

/** A minute's records: [minute (its start ÷ 60,000), the first time, the last]. */
export type MinuteSpan = readonly [number, number, number];

/** The holes [from, to) of the union of the files' minutes inside [start, end), in time order. */
export function holesOf(
  files: Iterable<readonly MinuteSpan[]>,
  start: number,
  end: number,
): [number, number][] {
  const union = new Map<number, [number, number]>();
  for (const minutes of files)
    for (const [m, lo, hi] of minutes) {
      if (m * MINUTE_MS < start || m * MINUTE_MS >= end) continue;
      const u = union.get(m);
      if (u === undefined) union.set(m, [lo, hi]);
      else {
        if (lo < u[0]) u[0] = lo;
        if (hi > u[1]) u[1] = hi;
      }
    }
  const holes: [number, number][] = [];
  let last = start;
  for (const [, [lo, hi]] of [...union].sort((a, b) => a[0] - b[0])) {
    if (lo - last >= HOLE_MS) holes.push([last, lo]);
    last = hi;
  }
  if (end - last >= HOLE_MS) holes.push([last, end]);
  return holes;
}
