/**
 * The settled funding (rules.md H9): Hyperliquid's `fundingHistory` replies,
 * stored unparsed by the download a window a file, read here as the kit's
 * funding rows [nominal hour, rate, stamp]. A row's nominal hour is its
 * stamp rounded to the nearest hour (R1: the rows come 17–69 ms after it).
 * A row that fails WAVE-H's schema, or names another coin, is dropped and
 * counted; a row stamped at or after the run's bound is not used.
 */
import { z } from "zod";
import { HOUR_MS } from "../schedule.js";

const numText = z
  .string()
  .refine((s) => s.length > 0 && Number.isFinite(Number(s)), "not a number");
const Row = z.object({
  coin: z.string(),
  fundingRate: numText,
  premium: numText,
  time: z.number().int().safe(),
});

export type FundingRow = [hour: number, rate: number, stamp: number];

/** One stored reply's rows of `coin`; a reply that is not a JSON array throws. */
export function fundingRows(
  coin: string,
  text: string,
  until: number,
): { rows: FundingRow[]; failed: number; late: number } {
  const reply: unknown = JSON.parse(text);
  if (!Array.isArray(reply)) throw new Error("not a fundingHistory reply");
  const rows: FundingRow[] = [];
  let failed = 0;
  let late = 0;
  for (const raw of reply) {
    const r = Row.safeParse(raw);
    if (!r.success || r.data.coin !== coin) failed += 1;
    else if (r.data.time >= until) late += 1;
    else
      rows.push([
        Math.round(r.data.time / HOUR_MS) * HOUR_MS,
        Number(r.data.fundingRate),
        r.data.time,
      ]);
  }
  return { rows, failed, late };
}

/** A coin's rows of every window in hour order; two rows of one nominal hour throw (no row is guessed). */
export function joinFunding(rows: readonly FundingRow[]): FundingRow[] {
  const sorted = [...rows].sort((a, b) => a[0] - b[0]);
  for (let i = 1; i < sorted.length; i++)
    if (sorted[i]![0] === sorted[i - 1]![0])
      throw new Error(
        `two funding rows of the hour ${new Date(sorted[i]![0]).toISOString()}`,
      );
  return sorted;
}
