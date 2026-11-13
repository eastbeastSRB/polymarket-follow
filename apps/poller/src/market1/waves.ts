/**
 * The wave and its entries (rules.md M5) and the episodes of the lines beside
 * (M12 B1–B5), as pure functions of the counted fills in M4's order. Every
 * count is by instants: a fill whose instant lies in the 60 minutes up to t
 * counts, a fill of the same millisecond that sorts after this one included.
 */
import type { Liq } from "./fills.js";

/** "The 60 minutes up to t": [t − 3,600,000, t], both ends included (M1). */
export const WINDOW_MS = 3_600_000;
/** A wave needs this many different accounts (M5). */
export const WAVE_ACCOUNTS = 2;

/** The first index whose instant is not `before` (the fills sorted by instant). */
function firstNot(fills: readonly Liq[], before: (t: number) => boolean) {
  let a = 0;
  let b = fills.length;
  while (a < b) {
    const m = (a + b) >> 1;
    if (before(fills[m]!.t)) a = m + 1;
    else b = m;
  }
  return a;
}

/** The fills with an instant in [t − WINDOW_MS, t], as an index range into the sorted list. */
function windowOf(fills: readonly Liq[], t: number) {
  return {
    lo: firstNot(fills, (u) => u < t - WINDOW_MS),
    hi: firstNot(fills, (u) => u <= t),
  };
}

/** The different accounts with a counted fill of `side` in the 60 minutes up to t (M5). */
export function accountsAt(
  fills: readonly Liq[],
  t: number,
  side: 1 | -1,
): Set<string> {
  const { lo, hi } = windowOf(fills, t);
  const out = new Set<string>();
  for (let i = lo; i < hi; i++)
    if (fills[i]!.side === side) out.add(fills[i]!.addr);
  return out;
}

/** The different markets with a counted fill of `side` in the 60 minutes up to t (B4). */
export function marketsAt(
  fills: readonly Liq[],
  t: number,
  side: 1 | -1,
): Set<number> {
  const { lo, hi } = windowOf(fills, t);
  const out = new Set<number>();
  for (let i = lo; i < hi; i++)
    if (fills[i]!.side === side) out.add(fills[i]!.iid);
  return out;
}

/** An entry or an episode's first fill: the fill, and the accounts of its wave state. */
export type Event = { fill: Liq; accounts: string[] };

/**
 * M5's entries: in M4's order, a counted fill at whose instant the wave state
 * holds for its side, when its market has had no entry in the 60 minutes up
 * to it, of either side. `fills` are the counted fills in M4's order.
 */
export function waveEntries(fills: readonly Liq[]): Event[] {
  const last = new Map<number, number>();
  const out: Event[] = [];
  for (const f of fills) {
    const accounts = accountsAt(fills, f.t, f.side);
    if (accounts.size < WAVE_ACCOUNTS) continue;
    const l = last.get(f.iid);
    if (l !== undefined && f.t - l <= WINDOW_MS) continue;
    last.set(f.iid, f.t);
    out.push({ fill: f, accounts: [...accounts].sort() });
  }
  return out;
}

/**
 * B1's 60-minute episodes: a counted fill whose market's previous counted
 * fill (in M4's order) is more than 60 minutes before it, or none.
 */
export function episodes(fills: readonly Liq[]): Event[] {
  const prev = new Map<number, number>();
  const out: Event[] = [];
  for (const f of fills) {
    const p = prev.get(f.iid);
    prev.set(f.iid, f.t);
    if (p !== undefined && f.t - p <= WINDOW_MS) continue;
    out.push({ fill: f, accounts: [...accountsAt(fills, f.t, f.side)].sort() });
  }
  return out;
}
