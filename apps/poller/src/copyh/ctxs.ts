/**
 * COPY-H's reader of an `asset_ctxs` day file (copyh/rules.md C13's
 * calibration; the supervisor's ruling of 2026-11-27 10:25Z: the mark half
 * has its own reader, WAVE-H's reads no impact price). The file is a CSV, a
 * row a coin a minute, stamped at the minute's start or, in stretches, at
 * another second of it (external-apis: the header `time,coin,funding,…,
 * mark_px,mid_px,impact_bid_px,impact_ask_px`). As WAVE-H reads its marks
 * (waveh/ctxs.ts, its H10): the row with the latest stamp in (m, m + 1 min]
 * gives the minute [m, m + 1 min), the first line on a tie; a row that fails
 * its schema, or has no coin cell, is dropped and counted; a row stamped at
 * or after `until` is never used. Each minute's mark and impact prices come
 * from that one row: two prices of one moment, never a change across time.
 */
import { z } from "zod";
import { MINUTE_MS } from "../schedule.js";

const price = z
  .string()
  .refine((s) => s.length > 0 && Number(s) > 0 && Number.isFinite(Number(s)))
  .transform(Number);
const Row = z.object({
  time: z
    .string()
    .regex(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/)
    .transform((s) => Date.parse(s))
    .refine((t) => Number.isFinite(t)),
  mark: price,
  bid: price.nullable(),
  ask: price.nullable(),
});

/** A coin's day of minutes: each minute's mark_px and impact prices (NaN where no row gave one) and the stamp of the row that gave them. */
export type CtxsDay = {
  readonly mark: Float64Array;
  readonly bid: Float64Array;
  readonly ask: Float64Array;
  readonly stamp: Float64Array;
};

/** The rows read of the coins asked, those that failed or had no coin cell, those stamped at or after the bound, and the minutes a second row gave. */
export type CtxsCount = {
  rows: number;
  failed: number;
  late: number;
  twice: number;
};

/** One day file's rows (decoded text) of the coins asked, the day starting at `day`: by coin, its minutes. */
export function ctxsOf(
  text: string,
  coins: ReadonlySet<string>,
  day: number,
  until: number,
): { byCoin: Map<string, CtxsDay>; count: CtxsCount } {
  const minutes = (24 * 60 * 60_000) / MINUTE_MS;
  const count: CtxsCount = { rows: 0, failed: 0, late: 0, twice: 0 };
  const byCoin = new Map<string, CtxsDay>();
  const lines = text.split("\n");
  const head = lines[0]!.split(",");
  const at = (c: string) => head.indexOf(c);
  const [iTime, iCoin, iMark, iBid, iAsk] = [
    "time",
    "coin",
    "mark_px",
    "impact_bid_px",
    "impact_ask_px",
  ].map(at) as [number, number, number, number, number];
  if ([iTime, iCoin, iMark, iBid, iAsk].some((i) => i < 0))
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
    if (!coins.has(coin)) continue;
    count.rows += 1;
    const r =
      cells.length === head.length
        ? Row.safeParse({
            time: cells[iTime],
            mark: cells[iMark],
            bid: cells[iBid] === "" ? null : cells[iBid],
            ask: cells[iAsk] === "" ? null : cells[iAsk],
          })
        : null;
    if (r === null || !r.success) {
      count.failed += 1;
      continue;
    }
    const t = r.data.time;
    if (t >= until) {
      count.late += 1;
      continue;
    }
    const i = Math.ceil((t - day) / MINUTE_MS) - 1;
    if (i < 0 || i >= minutes) continue;
    let d = byCoin.get(coin);
    if (d === undefined) {
      const series = () => new Float64Array(minutes).fill(NaN);
      d = { mark: series(), bid: series(), ask: series(), stamp: series() };
      byCoin.set(coin, d);
    }
    if (!Number.isNaN(d.mark[i]!)) {
      count.twice += 1;
      if (t <= d.stamp[i]!) continue;
    }
    d.mark[i] = r.data.mark;
    d.bid[i] = r.data.bid ?? NaN;
    d.ask[i] = r.data.ask ?? NaN;
    d.stamp[i] = t;
  }
  return { byCoin, count };
}
