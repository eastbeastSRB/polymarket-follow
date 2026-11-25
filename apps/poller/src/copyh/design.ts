/**
 * Every number COPY-H's rules fix, one home (copyh/rules.md C18; the
 * supervisor's ruling 13 on COPYH-STORE's differences, 2026-11-25). Times are
 * ms since the epoch; a window [a, b) includes a and excludes b. A record's
 * instant is its fill's `time`, never its file's hour.
 */

/** The archive's first fill file's hour, 2025-05-25 14h (C1). */
export const ARCHIVE_START = Date.parse("2025-05-25T14:00:00Z");
/** M₀: the first Monday with 30 days of the archive before it; E's entries start here, the burn-in ends here (C1). */
export const M0 = Date.parse("2025-06-30T00:00:00Z");
/** E's end: the end of WAVE-H's raw store, whose last fill file is 2026-05-29 01h (C1). */
export const END_E = Date.parse("2026-05-29T02:00:00Z");
/** S's end, FRESH's (FRESH_END): FRESH-2's months start here (C1). */
export const END_S = Date.parse("2026-11-16T00:00:00Z");
/** FRESH-2's end, 26 weeks after END_S (C1; the review's L1, the owner's ruling 7). */
export const END_F2 = Date.parse("2027-05-17T00:00:00Z");
/** The hour both archive formats hold: `node_fills` through it, `node_fills_by_block` from it (C3). */
export const SWITCH_HOUR = Date.parse("2025-07-27T08:00:00Z");

/** The UTC minutes of the day in which no part starts: 02:30–06:00 and 10:25–11:15 (C15, C18). */
export const CLOSED_WINDOWS: readonly (readonly [number, number])[] = [
  [150, 360],
  [625, 675],
];
/** A part is planned to last at most this long (C15, C18); a run starts no new work after one minute less, so that the work in flight ends inside it. */
export const PART_MINUTES = 15;
