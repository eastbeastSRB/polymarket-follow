/**
 * A range of the archive the store holds (the polishing plan 4.4 and 4.6):
 * its fill files in time order, its `asset_ctxs` days, its funding windows,
 * its end (no record at or after it), its minute grid and its months.
 * WAVE-H's ten months, and FRESH's months after them (polish/rules.md P1,
 * P2), which only the exam's gate opens (seal.ts). A timing run reads one
 * day of a range.
 */
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../schedule.js";
import { DATA_END, SIZING_START } from "../waveh/instants.js";
import { FUNDING_STARTS, fillKeys } from "../waveh/keys.js";
import { MARKS_START } from "../waveh/market.js";
import type { Grid } from "./ctxs.js";
import { monthsOf } from "./merge.js";
import { FRESH_END } from "./seal.js";

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
  /** FRESH's (rules.md P2): an `asset_ctxs` day failing WAVE-H's 1% rule, or whose header lacks a column, is read as absent and listed, never a stop. */
  failingCtxsDayAbsent?: true;
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

/** FRESH's first day; its first fill file is DATA END's next hour (2026-05-29 02h). */
const FRESH_START = Date.parse("2026-05-29T00:00:00Z");
/** The archive has no `asset_ctxs` file of this day (decisions 2026-11-19, the extraction's run stopped: FRESH's download ended, 170 days). */
const NO_CTXS_DAY = Date.parse("2026-07-08T00:00:00Z");

/** The `node_fills_by_block` file of each hour of [from, to), as the archive names it (WAVE-H's `fillKeys` stops at DATA END's hour). */
export function blockFillKeys(from: number, to: number): string[] {
  const keys: string[] = [];
  for (let h = from; h < to; h += HOUR_MS) {
    const d = new Date(h);
    keys.push(
      `node_fills_by_block/hourly/${d.toISOString().slice(0, 10).replaceAll("-", "")}/${d.getUTCHours()}.lz4`,
    );
  }
  return keys;
}

/**
 * FRESH's data, the download's (tools/waveh-fetch.cjs FRESH; rules.md P1):
 * the 4,102 fill files of the hours [DATA END + 1 h, FRESH_END), the 170
 * `asset_ctxs` days of [2026-05-29, FRESH_END) but 2026-07-08, each coin's
 * 9 funding windows on the 20-day grid from DATA END, the last ending at
 * FRESH_END; its minute grid [2026-05-29, FRESH_END), 246,240 minutes.
 */
export const FRESH_RANGE: Range = {
  name: "FRESH",
  partial: null,
  fill: blockFillKeys(DATA_END + HOUR_MS, FRESH_END),
  days: dayStarts(FRESH_START, FRESH_END).filter((d) => d !== NO_CTXS_DAY),
  fundingStarts: Array.from(
    { length: Math.ceil((FRESH_END - DATA_END) / (20 * DAY_MS)) },
    (_, k) => DATA_END + k * 20 * DAY_MS,
  ),
  end: FRESH_END,
  grid: { start: FRESH_START, minutes: (FRESH_END - FRESH_START) / MINUTE_MS },
  months: monthsOf(FRESH_START, FRESH_END),
  failingCtxsDayAbsent: true,
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
