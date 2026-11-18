/**
 * The exploration's minute prices (POLISH-EXPLORE's plan 2 (2), (3), (7),
 * 4.1 and 4.4; the polishing plan 1.4; decisions 2026-11-18,
 * "POLISH-EXPLORE's plan approved"): a coin's minute price column from the
 * store's minute table alone, with no kit market object (the kit's
 * `marketFrom` refuses a panel ending after its CUT, 2026-11-07, and FRESH
 * runs past it); the price a decision may read at an instant, never ahead
 * of it; an outcome's price at the end of a leg's minute; BASE for any hold.
 */
import { blockOf } from "../../market1/lines.js";
import { MINUTE_MS } from "../../schedule.js";
import { knownAt } from "../legs.js";

/** A mark stays in force this many minutes (the kit's MAX_STALE_MINUTES); the last trade is looked for this many minutes back (legs.ts LAST_TRADE_MS). */
const MARK_STALE = 5;
const TRADE_MINUTES = 5;

/**
 * Row k is the price at the end of minute k: the mark of row k, else of the
 * latest of rows k − 5 … k − 1 with one (the kit's `markAtMinuteEnd`), else
 * the bars' `last` of the latest of rows k − 4 … k with a trade (the last
 * taker but a backstop's in the 5 minutes before the minute's end, as
 * `Tape.last`), else NaN. It equals legs.ts `minutePrice` at every minute.
 */
export function priceColumn(
  mark: Float64Array,
  last: Float64Array,
): Float64Array {
  const out = new Float64Array(mark.length).fill(NaN);
  for (let k = 0; k < mark.length; k++) {
    for (let j = k; j >= 0 && k - j <= MARK_STALE; j--)
      if (!Number.isNaN(mark[j]!)) {
        out[k] = mark[j]!;
        break;
      }
    if (!Number.isNaN(out[k]!)) continue;
    for (let j = k; j >= 0 && k - j < TRADE_MINUTES; j--)
      if (!Number.isNaN(last[j]!)) {
        out[k] = last[j]!;
        break;
      }
  }
  return out;
}

/** The price a decision may read at τ (F10 (1)): the minute price at the end of the last whole minute ending at or before τ, never of the minute τ is in; NaN when unknown. */
export const priceAt = (pc: Float64Array, start: number, tau: number): number =>
  knownAt(pc, start, tau);

/** An outcome's price at x (WAVE-H's "mark at x", H9): the minute price at the end of the minute holding x; NaN outside the grid. */
export function priceAfter(pc: Float64Array, start: number, x: number): number {
  const k = Math.floor((x - start) / MINUTE_MS);
  return k >= 0 && k < pc.length ? pc[k]! : NaN;
}

/**
 * BASE (H10, for any hold: F11): for each 4-hour UTC block, the mean of
 * (pc[j + h] ÷ pc[j] − 1) × 10⁴ over every whole minute j in [from, to − h)
 * whose minute lies in the block, both prices present; NaN for a block with
 * none. h in whole minutes; MARKET-1's `baseOf` for h = 1,440.
 */
export function baseOf(
  pc: Float64Array,
  start: number,
  from: number,
  to: number,
  h: number,
): number[] {
  const sum = [0, 0, 0, 0, 0, 0];
  const count = [0, 0, 0, 0, 0, 0];
  const i0 = Math.max(0, Math.ceil((from - start) / MINUTE_MS));
  const i1 = Math.min(pc.length, (to - h * MINUTE_MS - start) / MINUTE_MS);
  for (let i = i0; i < i1 && i + h < pc.length; i++) {
    const a = pc[i]!;
    const b = pc[i + h]!;
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    const block = blockOf(start + i * MINUTE_MS);
    sum[block]! += (b / a - 1) * 1e4;
    count[block]! += 1;
  }
  return sum.map((s, k) => (count[k]! > 0 ? s / count[k]! : NaN));
}
