/**
 * The positions of WAVE and of every line beside it (rules.md M5, M6, M12),
 * and their prices: pure functions of the counted fills, the tradable test,
 * the market objects and each leg's quote. BASE, OWN and S's basket are read
 * from the kit's minute marks.
 */
import type { Market, Research } from "../paper/research.js";
import { HOUR_MS, MINUTE_MS } from "../schedule.js";
import { LARGE, SMALL_COINS, type Liq } from "./fills.js";
import {
  ENTRY_DELAY_MS,
  HOLD_MS,
  grossOnMarks,
  pricePosition,
  type LegQuote,
  type Priced,
} from "./price.js";
import { episodes, marketsAt, waveEntries } from "./waves.js";

export type Line = "WAVE" | "P" | "B1" | "B3_60" | "B3_180" | "B7" | "B10";

/** A position before its price: the fill that made it and its instants. */
export type Spot = {
  line: Line;
  /** The position's market. */
  iid: number;
  /** The fill's instant and its forced side; the position is against it. */
  t: number;
  side: 1 | -1;
  dir: 1 | -1;
  xIn: number;
  xOut: number;
  /** The fill's market (B7's position is in BTC or ETH at a small coin's wave). */
  fillIid: number;
  /** The accounts of the wave state for the fill's side at t. */
  accounts: string[];
  /** B4: the small coins with a counted fill of that side in the 60 minutes up to t. */
  coins: number;
};

export type Position = Spot & {
  /** Null while pending (M7, M8). */
  priced: Priced | null;
  /** WAVE's OWN: the gross on marks − dir × the other small coins' mean move (F1). */
  own?: number | null;
  /** WAVE's S: the small-coin basket's move over the 7 days before t. */
  basket?: number | null;
};

/** The instants of each line (M1, M12). */
export type Instants = { cut: number; start: number };

const spot = (
  line: Line,
  iid: number,
  f: Liq,
  accounts: string[],
  coins: number,
  delay: number,
): Spot => {
  const xIn = f.t + delay;
  return {
    line,
    iid,
    t: f.t,
    side: f.side,
    dir: f.side === 1 ? -1 : 1,
    xIn,
    xOut: xIn + HOLD_MS,
    fillIid: f.iid,
    accounts,
    coins,
  };
};

/**
 * Every position of every line with x_in < end: WAVE (t ≥ START), P (CUT ≤
 * t < START, every leg at the mark), B1 (the small coins' episodes), B3 (WAVE
 * entered 60 and 180 minutes late), B7 (BTC and ETH at WAVE's instants) and
 * B10 (the large markets' own episodes). Each needs its market tradable at t.
 */
export function spotsOf(
  small: readonly Liq[],
  large: readonly Liq[],
  at: Instants,
  end: number,
  tradable: (iid: number, t: number) => boolean,
): Spot[] {
  const out: Spot[] = [];
  const keep = (s: Spot) => {
    if (s.xIn < end && tradable(s.iid, s.t)) out.push(s);
  };
  for (const e of waveEntries(small)) {
    const f = e.fill;
    if (f.t < at.cut) continue;
    const coins = marketsAt(small, f.t, f.side).size;
    if (f.t < at.start) {
      keep(spot("P", f.iid, f, e.accounts, coins, ENTRY_DELAY_MS));
      continue;
    }
    if (!tradable(f.iid, f.t)) continue;
    keep(spot("WAVE", f.iid, f, e.accounts, coins, ENTRY_DELAY_MS));
    keep(spot("B3_60", f.iid, f, e.accounts, coins, HOUR_MS));
    keep(spot("B3_180", f.iid, f, e.accounts, coins, 3 * HOUR_MS));
    for (const iid of LARGE)
      keep(spot("B7", iid, f, e.accounts, coins, ENTRY_DELAY_MS));
  }
  for (const e of episodes(small)) {
    if (e.fill.t < at.start) continue;
    const coins = marketsAt(small, e.fill.t, e.fill.side).size;
    keep(spot("B1", e.fill.iid, e.fill, e.accounts, coins, ENTRY_DELAY_MS));
  }
  for (const e of episodes(large)) {
    if (e.fill.t < at.start) continue;
    keep(spot("B10", e.fill.iid, e.fill, e.accounts, 0, ENTRY_DELAY_MS));
  }
  return out;
}

/** M12's BASE of a market: the mean of (marks[j + 1,440] ÷ marks[j] − 1) × 10⁴ by 4-hour UTC block of minute j, j in [from, end − 24 h). */
export function baseOf(mk: Market, from: number, end: number): number[] {
  const sum = [0, 0, 0, 0, 0, 0];
  const cnt = [0, 0, 0, 0, 0, 0];
  const i0 = Math.max(0, Math.ceil((from - mk.start) / MINUTE_MS));
  const i1 = Math.min(mk.n, (end - HOLD_MS - mk.start) / MINUTE_MS);
  for (let i = i0; i < i1 && i + 1_440 < mk.n; i++) {
    const a = mk.marks[i]!;
    const b = mk.marks[i + 1_440]!;
    if (Number.isNaN(a) || Number.isNaN(b)) continue;
    const block = blockOf(mk.start + i * MINUTE_MS);
    sum[block]! += (b / a - 1) * 1e4;
    cnt[block]! += 1;
  }
  return sum.map((s, k) => (cnt[k]! > 0 ? s / cnt[k]! : NaN));
}

/** The 4-hour UTC block of an instant, 0 to 5. */
export const blockOf = (t: number): number =>
  Math.floor((((t % 86_400_000) + 86_400_000) % 86_400_000) / (4 * HOUR_MS));

/** The mean move of the small coins but `iid` over [a, b], each with both marks, at least 5 of them (OWN), else null. */
export function othersMove(
  kit: Research,
  market: (iid: number) => Market | null,
  iid: number,
  a: number,
  b: number,
): number | null {
  let s = 0;
  let n = 0;
  for (const other of SMALL_COINS) {
    if (other === iid) continue;
    const mk = market(other);
    if (mk === null) continue;
    const m = grossOnMarks(kit, mk, 1, a, b);
    if (m === null) continue;
    s += m;
    n += 1;
  }
  return n >= 5 ? s / n : null;
}

/** S's basket: the mean of (the mark at t − 1 min ÷ the mark at t − 7 d − 1) × 10⁴ over the small coins with both marks, at least 5, else null. */
export function basketWeek(
  kit: Research,
  market: (iid: number) => Market | null,
  t: number,
): number | null {
  let s = 0;
  let n = 0;
  for (const iid of SMALL_COINS) {
    const mk = market(iid);
    if (mk === null) continue;
    const m = grossOnMarks(kit, mk, 1, t - 7 * 86_400_000, t - MINUTE_MS);
    if (m === null) continue;
    s += m;
    n += 1;
  }
  return n >= 5 ? s / n : null;
}

/** A leg's quote, or "pending" while its inputs are not final (M7, M8). */
export type Quote = (iid: number, x: number) => LegQuote | "pending";

/**
 * Prices a spot (M7–M9): pending while a leg is pending or its market object
 * does not reach x_out; P's legs at the mark whatever the book says.
 */
export function priceSpot(
  kit: Research,
  s: Spot,
  market: (iid: number) => Market | null,
  quote: Quote,
  fee: (iid: number, t: number) => number,
  base: (iid: number, xIn: number) => number | null,
): Position {
  const mk = market(s.iid);
  const pending = { ...s, priced: null };
  if (mk === null || mk.end <= s.xOut) return pending;
  const mark: LegQuote = { source: "mark", why: "before the books" };
  const entry = s.line === "P" ? mark : quote(s.iid, s.xIn);
  const exit = s.line === "P" ? mark : quote(s.iid, s.xOut);
  if (entry === "pending" || exit === "pending") return pending;
  return {
    ...s,
    priced: pricePosition(kit, mk, {
      dir: s.dir,
      xIn: s.xIn,
      xOut: s.xOut,
      entry,
      exit,
      fee: (t) => fee(s.iid, t),
      base: base(s.iid, s.xIn),
    }),
  };
}
