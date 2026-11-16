/**
 * WAVE-H's fixed instants (rules.md H1). Times are ms since the epoch; every
 * window [a, b) includes a and excludes b.
 */
import { DAY_MS } from "../schedule.js";

/** The archive's first fill file, 2025-05-25 14h: SIZING's start. */
export const SIZING_START = Date.parse("2025-05-25T14:00:00Z");
/** TEST's start, and the seal: no store file dated from it is opened while the gate is closed (H0). */
export const TEST_START = Date.parse("2025-08-01T00:00:00Z");
export const TEST_END = Date.parse("2026-05-28T00:00:00Z");
/** No record at or after it is used. */
export const DATA_END = Date.parse("2026-05-29T01:00:00Z");
/** SIZING's length in days, 67 days and 10 hours: H5's divisor. */
export const SIZING_DAYS = (TEST_START - SIZING_START) / DAY_MS;

/** The UTC day of t, `YYYY-MM-DD`. */
export const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);
/** The UTC month of t, `YYYY-MM`. */
export const monthOf = (t: number) => new Date(t).toISOString().slice(0, 7);
