/**
 * The taker setting and its prints' two variants (copyh/rules.md C9, C13),
 * from a coin's bars, given to the kit's `leg` and lib-exits' `priceCopy`:
 * - c(coin, d), the tape's quoted half-spread: half the median, over the
 *   minutes of UTC day d − 1 that hold a pair, of the minute's mean relative
 *   gap (the bars' pair gaps ÷ pairs: two consecutive market-trade taker
 *   records of opposite sides at most 2 s apart, counted in the minute of
 *   the second; writers.ts, merge.ts); with fewer than 30 such minutes on
 *   d − 1, the coin's latest earlier day with 30, flagged; with none, 25 bps,
 *   flagged. d is the UTC day of the leg's instant.
 * - The taker setting: 4.5 bps a leg on every leg of every month, and c.
 * - The cascade print's (C13): each leg's c from its own minute, half the
 *   minute's mean gap, where that minute holds a pair; c(coin, d) otherwise.
 * - Binance futures' venue print (C13): 5 bps a side, with COPY-H's c.
 * A setting serves its own coin: a leg of another is refused.
 */
import type { Research, Setting } from "../paper/research.js";
import { DAY_MS, MINUTE_MS } from "../schedule.js";
import {
  BINANCE_FEE_A_SIDE,
  FEE_A_LEG,
  SPREAD_FALLBACK,
  SPREAD_MIN_MINUTES,
} from "./design.js";
import { dayOf } from "./instants.js";
import type { Bars } from "./markets.js";

/** A leg's spread: c, and whether it came from an earlier day or the 25 bps. */
export type Spread = { c: number; fallback: boolean };

/** c(coin, d) of a coin's bars, by a leg's instant. */
export function spreadsOf(kit: Research, bars: Bars): (t: number) => Spread {
  const day0 = dayOf(bars.start);
  const days =
    Math.floor((bars.start + bars.n * MINUTE_MS - 1 - day0) / DAY_MS) + 1;
  /** Each day's c, NaN for a day with fewer than SPREAD_MIN_MINUTES minutes of pairs. */
  const c = new Float64Array(days).fill(NaN);
  let day = 0;
  let gaps: number[] = [];
  const close = () => {
    if (gaps.length >= SPREAD_MIN_MINUTES)
      c[day] = kit.entries.median(gaps)! / 2;
    gaps = [];
  };
  for (let k = 0; k < bars.n; k++) {
    const d = Math.floor((bars.start + k * MINUTE_MS - day0) / DAY_MS);
    if (d !== day) {
      close();
      day = d;
    }
    const pairs = bars.pairs[k]!;
    if (pairs > 0) gaps.push(bars.pairGap[k]! / pairs);
  }
  close();
  /** The latest day at or before each whose c stands, or −1. */
  const latest = new Int32Array(days);
  for (let d = 0; d < days; d++)
    latest[d] = Number.isNaN(c[d]!) ? (d > 0 ? latest[d - 1]! : -1) : d;
  return (t) => {
    const before = Math.floor((dayOf(t) - day0) / DAY_MS) - 1;
    const j = before < 0 ? -1 : latest[Math.min(before, days - 1)]!;
    return j < 0
      ? { c: SPREAD_FALLBACK, fallback: true }
      : { c: c[j]!, fallback: j !== before };
  };
}

/** A coin's settings (C9, C13): the taker's, the cascade print's and Binance's venue print's. */
export function settingsOf(
  kit: Research,
  bars: Bars,
): { taker: Setting; cascade: Setting; binance: Setting } {
  const spreads = spreadsOf(kit, bars);
  const own = (iid: number) => {
    if (iid !== bars.iid)
      throw new Error(`coin ${bars.iid}'s setting asked for coin ${iid}`);
  };
  /** The leg's own minute's c where it holds a pair, else c(coin, d). */
  const minuteSpread = (t: number): Spread => {
    const k = Math.floor((t - bars.start) / MINUTE_MS);
    const pairs = k >= 0 && k < bars.n ? bars.pairs[k]! : 0;
    return pairs > 0
      ? { c: bars.pairGap[k]! / pairs / 2, fallback: false }
      : spreads(t);
  };
  const settingOf = (
    name: string,
    fee: number,
    spread: (t: number) => Spread,
  ): Setting => ({
    name,
    fee: (iid) => {
      own(iid);
      return fee;
    },
    spread: (iid, t) => {
      own(iid);
      return spread(t);
    },
  });
  return {
    taker: settingOf("copyh taker", FEE_A_LEG, spreads),
    cascade: settingOf("copyh cascade", FEE_A_LEG, minuteSpread),
    binance: settingOf("binance taker", BINANCE_FEE_A_SIDE, spreads),
  };
}
