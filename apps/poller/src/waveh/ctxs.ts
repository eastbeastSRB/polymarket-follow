/**
 * The marks (rules.md H10): Hyperliquid's `asset_ctxs` day files, a CSV row
 * a coin a minute stamped at the minute's start. The mark at the end of
 * minute [m, m + 1 min) is the `mark_px` of the coin's row stamped m + 1 min
 * (R1), so a row stamped s fills the minute before s. Only the small coins'
 * rows are read, each by WAVE-H's own schema; a row that fails is dropped
 * and counted, a row stamped at or after the run's bound is not used.
 */
import { z } from "zod";
import { MINUTE_MS } from "../schedule.js";
import type { Coins } from "./coins.js";

/** The coins' marks at each minute's end, from `start`, NaN where no row gave one. */
export type Marks = {
  start: number;
  end: number;
  byCoin: Map<string, Float64Array>;
};

export const newMarks = (coins: Coins, start: number, end: number): Marks => ({
  start,
  end,
  byCoin: new Map(
    coins.list.map((c) => [
      c.name,
      new Float64Array((end - start) / MINUTE_MS).fill(NaN),
    ]),
  ),
});

const Row = z.object({
  time: z
    .string()
    .regex(/^\d{4}-\d\d-\d\dT\d\d:\d\d:00Z$/)
    .transform((s) => Date.parse(s))
    .refine((t) => Number.isFinite(t)),
  mark_px: z
    .string()
    .refine((s) => s.length > 0 && Number(s) > 0 && Number.isFinite(Number(s)))
    .transform(Number),
});

export type CtxsCount = {
  rows: number;
  failed: number;
  /** Rows stamped at or after the run's bound. */
  late: number;
  /** A coin's minute given twice: the first row kept. */
  twice: number;
};

/** Adds one day file's rows (decoded text) of the small coins to `marks`; rows stamped at or after `until` are not used. */
export function addCtxs(marks: Marks, text: string, until: number): CtxsCount {
  const count: CtxsCount = { rows: 0, failed: 0, late: 0, twice: 0 };
  const lines = text.split("\n");
  const head = lines[0]!.split(",");
  const [iTime, iCoin, iMark] = ["time", "coin", "mark_px"].map((c) =>
    head.indexOf(c),
  ) as [number, number, number];
  if (iTime < 0 || iCoin < 0 || iMark < 0)
    throw new Error(`asset_ctxs header "${lines[0]!.slice(0, 200)}"`);
  for (let k = 1; k < lines.length; k++) {
    if (lines[k] === "") continue;
    const cells = lines[k]!.split(",");
    const series = marks.byCoin.get(cells[iCoin] ?? "");
    if (series === undefined) continue;
    count.rows += 1;
    const r =
      cells.length === head.length
        ? Row.safeParse({ time: cells[iTime], mark_px: cells[iMark] })
        : null;
    if (r === null || !r.success) {
      count.failed += 1;
      continue;
    }
    if (r.data.time >= until) {
      count.late += 1;
      continue;
    }
    const i = (r.data.time - marks.start) / MINUTE_MS - 1;
    if (i < 0 || i >= series.length) continue;
    if (Number.isNaN(series[i]!)) series[i] = r.data.mark_px;
    else count.twice += 1;
  }
  return count;
}
