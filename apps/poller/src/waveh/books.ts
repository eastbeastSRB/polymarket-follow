/**
 * The archived books (rules.md H8): `market_data/<date>/<hour>/l2Book/<COIN>.lz4`,
 * a snapshot a line (`raw.data` with the coin, its time and its 20 levels a
 * side, `levels[0]` the bids, `levels[1]` the asks). A line that fails
 * WAVE-H's schema, or names another coin, is dropped and counted.
 */
import { z } from "zod";
import { HOUR_MS } from "../schedule.js";
import { toBook, type Book } from "../market1/book.js";
import { numText } from "./fills.js";
import { linesOf } from "./store.js";

const Level = z.object({ px: numText, sz: numText });
const Snapshot = z.object({
  raw: z.object({
    channel: z.literal("l2Book"),
    data: z.object({
      coin: z.string(),
      time: z.number().int().safe(),
      levels: z.tuple([z.array(Level), z.array(Level)]),
    }),
  }),
});

/** The coin's last snapshot with its time at or before x in a decoded book file (the later line on a tie), as MARKET-1's `Book`. */
export function lastAtOrBefore(
  bytes: Uint8Array,
  coin: string,
  x: number,
): { book: Book | null; lines: number; failed: number } {
  let best: z.infer<typeof Snapshot>["raw"]["data"] | null = null;
  let lines = 0;
  let failed = 0;
  for (const line of linesOf(bytes)) {
    lines += 1;
    let s: ReturnType<typeof Snapshot.safeParse>;
    try {
      s = Snapshot.safeParse(JSON.parse(line));
    } catch {
      failed += 1;
      continue;
    }
    if (!s.success || s.data.raw.data.coin !== coin) {
      failed += 1;
      continue;
    }
    const d = s.data.raw.data;
    if (d.time <= x && (best === null || d.time >= best.time)) best = d;
  }
  const level = (l: { px: string; sz: string }) => [l.px, l.sz];
  return {
    book:
      best === null
        ? null
        : toBook(
            best.time,
            best.levels[0].map(level),
            best.levels[1].map(level),
          ),
    lines,
    failed,
  };
}

/** A book file's hour holds x, or x lies within this much after the hour's start so the hour before's file is read too (H8). */
export const LIVE_MS = 10_000;

/** The hours whose book files H8 reads for a leg at x: x's, and the one before in the first 10 s of x's hour. */
export function bookHours(x: number): number[] {
  const h = Math.floor(x / HOUR_MS) * HOUR_MS;
  return x - h < LIVE_MS ? [h, h - HOUR_MS] : [h];
}
