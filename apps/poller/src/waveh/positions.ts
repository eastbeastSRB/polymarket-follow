/**
 * The positions (rules.md H6, H7, H13): MARKET-1's M6 on each entry of a
 * slice — against the forced side, $1,000, in at t + 120 s (later for LATE),
 * out 24 h after — and B1's episodes inside a slice, with whether the wave
 * state held at their first fill (B2).
 */
import { ENTRY_DELAY_MS, HOLD_MS } from "../market1/price.js";
import { WAVE_ACCOUNTS, episodes, waveEntries } from "../market1/waves.js";
import type { Counted } from "./fills.js";

export type Spot = {
  slice: number;
  /** The coin's asset id. */
  iid: number;
  t: number;
  /** The forced side; the position is against it. */
  side: 1 | -1;
  dir: 1 | -1;
  xIn: number;
  xOut: number;
  /** The entry fill's method, "market" or "backstop". */
  method: string;
  /** The accounts of the wave state for the fill's side at t. */
  accounts: string[];
};

const spotOf = (
  slice: number,
  f: Counted,
  accounts: string[],
  delay: number,
): Spot => ({
  slice,
  iid: f.iid,
  t: f.t,
  side: f.side,
  dir: f.side === 1 ? -1 : 1,
  xIn: f.t + delay,
  xOut: f.t + delay + HOLD_MS,
  method: f.method,
  accounts,
});

/** The entries of one slice's counted fills (H4's order, from the first file) with t in [from, to), as positions. */
export function waveSpots(
  slice: number,
  fills: readonly Counted[],
  from: number,
  to: number,
  delay = ENTRY_DELAY_MS,
): Spot[] {
  return waveEntries(fills)
    .filter((e) => e.fill.t >= from && e.fill.t < to)
    .map((e) => spotOf(slice, e.fill as Counted, e.accounts, delay));
}

/** B1's episodes of one slice with t in [from, to), each with `alone` when its wave state did not hold (B2). */
export function episodeSpots(
  slice: number,
  fills: readonly Counted[],
  from: number,
  to: number,
): (Spot & { alone: boolean })[] {
  return episodes(fills)
    .filter((e) => e.fill.t >= from && e.fill.t < to)
    .map((e) => ({
      ...spotOf(slice, e.fill as Counted, e.accounts, ENTRY_DELAY_MS),
      alone: e.accounts.length < WAVE_ACCOUNTS,
    }));
}
