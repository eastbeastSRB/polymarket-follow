/**
 * A range of the archive the store holds (the polishing plan 4.4 and 4.6):
 * its fill files in time order, its `asset_ctxs` days, its funding windows,
 * its end (no record at or after it), its minute grid and its months.
 * WAVE-H's ten months are the one range now; FRESH's is added with the
 * exam's freeze. A timing run reads one day of it.
 */
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../schedule.js";
import { DATA_END, SIZING_START } from "../waveh/instants.js";
import { FUNDING_STARTS, fillKeys } from "../waveh/keys.js";
import { MARKS_START } from "../waveh/market.js";
import type { Grid } from "./ctxs.js";
import { monthsOf } from "./merge.js";

export type Range = {
  name: string;
  /** Null for the whole range; the day of a timing run. */
  partial: string | null;
  fill: readonly string[];
  days: readonly number[];
  fundingStarts: readonly number[];
  end: number;
  grid: Grid;
  months: readonly string[];
};

const dayStarts = (from: number, to: number) =>
  Array.from(
    { length: Math.ceil((to - from) / DAY_MS) },
    (_, i) => from + i * DAY_MS,
  );

/** WAVE-H's data (rules.md H1, H2, H9, H10): 8,845 fill files, 370 days, 20 funding windows a coin, before DATA END. */
export const WAVEH_RANGE: Range = {
  name: "WAVE-H",
  partial: null,
  fill: fillKeys(SIZING_START, DATA_END + HOUR_MS),
  days: dayStarts(MARKS_START, DATA_END),
  fundingStarts: FUNDING_STARTS,
  end: DATA_END,
  grid: { start: MARKS_START, minutes: (DATA_END - MARKS_START) / MINUTE_MS },
  months: monthsOf(MARKS_START, DATA_END),
};

/**
 * One day of a range, for a timing run: its 24 fill files and its day of
 * contexts, no funding; the grid begins an hour before the day, for the
 * records its first file holds of the hour before.
 */
export function dayOf(range: Range, day: string): Range {
  const from = Date.parse(`${day}T00:00:00Z`);
  if (!Number.isFinite(from) || !range.days.includes(from))
    throw new Error(`${day} is not a day of ${range.name}`);
  const fill = fillKeys(from, from + DAY_MS);
  return {
    name: range.name,
    partial: day,
    fill,
    days: [from],
    fundingStarts: [],
    end: range.end,
    grid: { start: from - HOUR_MS, minutes: 25 * 60 },
    months: monthsOf(from - HOUR_MS, from + DAY_MS),
  };
}
