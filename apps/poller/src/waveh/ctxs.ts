/**
 * The marks (rules.md H10): Hyperliquid's `asset_ctxs` day files, a CSV row
 * a coin a minute, stamped at the minute's start or, in stretches, at another
 * second of it. The mark at the end of minute [m, m + 1 min) is the
 * `mark_px` of the coin's row with the latest stamp in (m, m + 1 min]: a row
 * stamped on the boundary wins over an earlier one, and of two rows of one
 * stamp the first line stands (R1; decisions 2026-11-14, Q6). Only the small
 * coins' rows are read, each by WAVE-H's own schema; a row that fails, or has
 * no coin cell, is dropped and counted; a row stamped at or after the run's
 * bound is not used.
 */
import { z } from "zod";
import { MINUTE_MS } from "../schedule.js";
import type { Coins } from "./coins.js";

/** The coins' marks at each minute's end, from `start`, NaN where no row gave one; with the stamp of the row that gave each. */
export type Marks = {
  start: number;
  end: number;
  byCoin: Map<string, Float64Array>;
  stamps: Map<string, Float64Array>;
};

export const newMarks = (coins: Coins, start: number, end: number): Marks => {
  const series = () =>
    new Map(
      coins.list.map((c) => [
        c.name,
        new Float64Array((end - start) / MINUTE_MS).fill(NaN),
      ]),
    );
  return { start, end, byCoin: series(), stamps: series() };
};

const Row = z.object({
  time: z
    .string()
    .regex(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/)
    .transform((s) => Date.parse(s))
    .refine((t) => Number.isFinite(t)),
  mark_px: z
    .string()
    .refine((s) => s.length > 0 && Number(s) > 0 && Number.isFinite(Number(s)))
    .transform(Number),
});

export type CtxsCount = {
  /** The small coins' rows, and those without a coin cell. */
  rows: number;
  failed: number;
  /** Rows stamped off a minute's start. */
  offMinute: number;
  /** Rows stamped at or after the run's bound. */
  late: number;
  /** A coin's minute given by a second row. */
  twice: number;
};

/** Adds one day file's rows (decoded text) of the small coins to `marks`; rows stamped at or after `until` are not used. */
export function addCtxs(marks: Marks, text: string, until: number): CtxsCount {
  const count: CtxsCount = {
    rows: 0,
    failed: 0,
    offMinute: 0,
    late: 0,
    twice: 0,
  };
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
    const coin = cells[iCoin];
    if (coin === undefined || coin === "") {
      count.rows += 1;
      count.failed += 1;
      continue;
    }
    const series = marks.byCoin.get(coin);
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
    const t = r.data.time;
    if (t % MINUTE_MS !== 0) count.offMinute += 1;
    if (t >= until) {
      count.late += 1;
      continue;
    }
    const i = Math.ceil((t - marks.start) / MINUTE_MS) - 1;
    if (i < 0 || i >= series.length) continue;
    const stamps = marks.stamps.get(coin)!;
    if (!Number.isNaN(series[i]!)) {
      count.twice += 1;
      if (t <= stamps[i]!) continue;
    }
    series[i] = r.data.mark_px;
    stamps[i] = t;
  }
  return count;
}
