/**
 * The ranges COPY-H's store is built from (the plan's C1, C3 and section 6;
 * decisions 2026-11-25, COPY-H's plan approved, and the supervisor's rulings
 * on COPYH-STORE's plan, 2): each a list of raw fill files in the range's
 * order and a window of record times. A store keeps the records of its own
 * files whose `time` lies in its window; one outside is counted, never kept.
 * - `burnin`: WAVE-H's 850 files before M₀ (2025-05-25 14h to 06-29 23h),
 *   the counts and timing run outside E and S;
 * - `E`: WAVE-H's 8,845 files, [ARCHIVE_START, END_E);
 * - `S`: FRESH's 4,102 files, [END_E, END_S), sealed until step 2.
 * In the switch hour both formats are read, `node_fills` first.
 */
import { HOUR_MS } from "../schedule.js";
import { ARCHIVE_START, END_E, END_S, M0, SWITCH_HOUR } from "./design.js";

export const RANGE_NAMES = ["burnin", "E", "S"] as const;
export type RangeName = (typeof RANGE_NAMES)[number];

export type Range = {
  name: RangeName;
  /** Its fill files, by hour. */
  fill: readonly string[];
  /** The window of record times kept: [start, end). */
  start: number;
  end: number;
  /** The UTC months the window touches, `YYYY-MM`, in order. */
  months: readonly string[];
};

const ymdHour = (h: number) => {
  const d = new Date(h);
  return `${d.toISOString().slice(0, 10).replaceAll("-", "")}/${d.getUTCHours()}`;
};

/** The fill files of the hours [from, to), as the archive names them: `node_fills` up to the switch hour, `node_fills_by_block` from it, both in it. */
export function hourKeys(from: number, to: number): string[] {
  const keys: string[] = [];
  for (let h = from; h < to; h += HOUR_MS) {
    if (h <= SWITCH_HOUR) keys.push(`node_fills/hourly/${ymdHour(h)}.lz4`);
    if (h >= SWITCH_HOUR)
      keys.push(`node_fills_by_block/hourly/${ymdHour(h)}.lz4`);
  }
  return keys;
}

/** A month's first instant and the next month's. */
export function monthBounds(month: string): [number, number] {
  const y = Number(month.slice(0, 4));
  const m = Number(month.slice(5, 7)) - 1;
  return [Date.UTC(y, m, 1), Date.UTC(y, m + 1, 1)];
}

/** The months [from, to) touches, in order. */
export function monthsOf(from: number, to: number): string[] {
  const out: string[] = [];
  for (let t = from; t < to;) {
    const month = new Date(t).toISOString().slice(0, 7);
    out.push(month);
    t = monthBounds(month)[1];
  }
  return out;
}

const rangeOf = (name: RangeName, start: number, end: number): Range => ({
  name,
  fill: hourKeys(start, end),
  start,
  end,
  months: monthsOf(start, end),
});

export const RANGES: Readonly<Record<RangeName, Range>> = {
  burnin: rangeOf("burnin", ARCHIVE_START, M0),
  E: rangeOf("E", ARCHIVE_START, END_E),
  S: rangeOf("S", END_E, END_S),
};
