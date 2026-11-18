/**
 * The exploration's parts and positions (POLISH-EXPLORE's plan 3.2; the
 * polishing plan 1.1 and 1.5; decisions 2026-11-18, "POLISH-EXPLORE's plan
 * approved"): E and C by the instant t of the entry's fill, entries
 * stopping 50 h before a part's end; every slice's entries (MARKET-1's M5
 * inside each slice, WAVE-H's H6) for any M; a position for any delay and
 * hold; and each counted fill's B1 episode over all accounts (F17, F1).
 */
import { ENTRY_DELAY_MS, HOLD_MS } from "../../market1/price.js";
import { WINDOW_MS, waveEntries } from "../../market1/waves.js";
import { HOUR_MS } from "../../schedule.js";
import type { Counted } from "../../waveh/fills.js";
import { DATA_END } from "../../waveh/instants.js";

/** Entries stop this long before a part's end: the longest hold and delay of the plan as written (kept by decisions 2026-11-18, "POLISH-EXPLORE's plan approved", 5). */
export const STOP_MS = 50 * HOUR_MS;

export type Part = { name: "E" | "C"; start: number; end: number };
/** E, explore, and C, check: every outcome a position of a part reads lies before the part's end. */
export const E: Part = {
  name: "E",
  start: Date.parse("2025-06-01T00:00:00Z"),
  end: Date.parse("2026-01-01T00:00:00Z"),
};
export const C: Part = {
  name: "C",
  start: Date.parse("2026-01-01T00:00:00Z"),
  end: DATA_END,
};

/** Whether an entry whose fill's instant is t belongs to the part: t in [start, end − 50 h). */
export const inPart = (p: Part, t: number): boolean =>
  t >= p.start && t < p.end - STOP_MS;

export type Entry = {
  slice: number;
  M: number;
  /** The entry's counted fill (H4): its instant t, the coin's asset id, the account, the forced side σ, `tid`, method. */
  fill: Counted;
  /** The different accounts of the slice's wave state for σ at t. */
  accounts: string[];
};

/** Every slice's entries, the slices being `bySlice`'s for M: MARKET-1's `waveEntries` over each slice's counted fills from the first file, so an earlier entry blocks; slice by slice, each in M4's order. */
export function entriesOf(slices: readonly (readonly Counted[])[]): Entry[] {
  const out: Entry[] = [];
  slices.forEach((fills, slice) => {
    for (const e of waveEntries(fills))
      out.push({
        slice,
        M: slices.length,
        fill: e.fill as Counted,
        accounts: e.accounts,
      });
  });
  return out;
}

export type Position = {
  e: Entry;
  /** Against the forced side: +1, long, after a forced sell. */
  dir: 1 | -1;
  xIn: number;
  xOut: number;
};

/** MARKET-1's M6 on an entry, for any delay and hold: $1,000 against σ, in at t + delay, out a hold later. */
export const positionOf = (
  e: Entry,
  delay = ENTRY_DELAY_MS,
  hold = HOLD_MS,
): Position => ({
  e,
  dir: e.fill.side === 1 ? -1 : 1,
  xIn: e.fill.t + delay,
  xOut: e.fill.t + delay + hold,
});

/** Each counted fill's B1 episode over every account (MARKET-1's `episodes`: a coin's fill more than 60 minutes after the coin's previous one, or its first, starts one), numbered in M4's order. */
export function episodeIds(counted: readonly Counted[]): Map<Counted, number> {
  const prev = new Map<number, { t: number; id: number }>();
  const out = new Map<Counted, number>();
  let next = 0;
  for (const f of counted) {
    const p = prev.get(f.iid);
    const id = p !== undefined && f.t - p.t <= WINDOW_MS ? p.id : next++;
    prev.set(f.iid, { t: f.t, id });
    out.set(f, id);
  }
  return out;
}
