/**
 * The one sweep of the tape a step makes for every leg of its positions
 * (POLISH-EXPLORE's plan 4.2; the polishing plan's review F18): each
 * distinct leg (the coin, buy or sell, its instant) read once, the legs in
 * the order of the coin and the instant, so each coin-month is read once and
 * a leg across a month's end reads the two kept; `pace` before each new
 * coin-month. A position's net by H9's formulas: the entry walked for
 * $1,000 and the exit for its Q (MARKET-1's walks), 4.5 bps a leg, the
 * funding of the settlements in (x_in, x_out] at the minute price before
 * each hour (the kit's `fundingBetween` on `pc`, so it needs no kit market
 * object); and the gross on marks.
 */
import { walkClose, walkOpen, type Level } from "../../market1/book.js";
import { NOTIONAL } from "../../market1/price.js";
import { HOUR_MS } from "../../schedule.js";
import { monthOf } from "../../waveh/instants.js";
import { FEE } from "../../waveh/price.js";
import type { Data } from "./data.js";
import { priceAfter } from "./prices.js";

/** A position to price: the coin's asset id, against the forced side (+1 long), in at x_in, out at x_out. */
export type Spec = { iid: number; dir: 1 | -1; xIn: number; xOut: number };

/** A leg's uses: each position whose entry (`exit` false) or exit is the leg. */
export type Use = { spec: number; exit: boolean };

/** Every distinct leg of `specs` in the sweep's order, with its levels and its uses. */
export async function eachLeg(
  d: Data,
  specs: readonly Spec[],
  pace: () => Promise<void>,
  visit: (
    leg: { coin: string; buy: boolean; x: number },
    levels: readonly Level[],
    uses: readonly Use[],
  ) => void,
): Promise<void> {
  const names = new Map(d.coins.list.map((c) => [c.assetId, c.name]));
  // Use 2k is position k's entry, 2k + 1 its exit; the entry buys for a long, the exit sells.
  const n = 2 * specs.length;
  const coin = new Int32Array(n);
  const x = new Float64Array(n);
  const buy = new Uint8Array(n);
  specs.forEach((s, k) => {
    coin[2 * k] = coin[2 * k + 1] = s.iid;
    x[2 * k] = s.xIn;
    x[2 * k + 1] = s.xOut;
    buy[2 * k] = s.dir > 0 ? 1 : 0;
    buy[2 * k + 1] = s.dir > 0 ? 0 : 1;
  });
  const order = Uint32Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => coin[a]! - coin[b]! || x[a]! - x[b]! || buy[a]! - buy[b]!,
  );
  let month = "";
  for (let i = 0; i < n;) {
    const u = order[i]!;
    const leg = { coin: names.get(coin[u]!)!, buy: buy[u] === 1, x: x[u]! };
    const at = `${leg.coin}|${monthOf(leg.x)}`;
    if (at !== month) {
      await pace();
      month = at;
    }
    const uses: Use[] = [];
    for (
      ;
      i < n &&
      coin[order[i]!] === coin[u] &&
      x[order[i]!] === leg.x &&
      buy[order[i]!] === buy[u];
      i++
    )
      uses.push({ spec: order[i]! >> 1, exit: (order[i]! & 1) === 1 });
    visit(leg, d.levels(leg.coin, leg.buy, leg.x), uses);
  }
}

/** The features step's dry sweep (POLISH-EXPLORE's plan 7): the legs and their trades by coin-month, read as the E step reads them, nothing walked. */
export async function drySweep(
  d: Data,
  specs: readonly Spec[],
  pace: () => Promise<void>,
) {
  const byCoinMonth: Record<string, { legs: number; trades: number }> = {};
  let legs = 0;
  let trades = 0;
  let none = 0;
  await eachLeg(d, specs, pace, (leg, levels) => {
    const key = `${leg.coin}|${monthOf(leg.x)}`;
    const c = (byCoinMonth[key] ??= { legs: 0, trades: 0 });
    c.legs += 1;
    c.trades += levels.length;
    legs += 1;
    trades += levels.length;
    if (levels.length === 0) none += 1;
  });
  return { legs, trades, withoutTrade: none, byCoinMonth };
}

/** Why a position is not priced (H9; the review's F7). */
export type Unpriced =
  "no trade at the entry" | "no trade at the exit" | "funding without a price";

/** A position's net in bps of the $1,000 (H9's formulas, funding through the minute price), or why none. */
export type Net = {
  net: number | null;
  unpriced: Unpriced | null;
  gross: number | null;
  fees: number | null;
  funding: number | null;
  /** Whole hours in (x_in, x_out] without a settled row, charged nothing. */
  missing: number;
  short: boolean;
  pIn: number | null;
  pOut: number | null;
};

/** A coin's settlements: their nominal hours, and running sums of rate × the minute price at the end of the minute before the hour, and of those without that price (the kit's `marketFrom`, on `pc`). */
export type Settlements = {
  hour: Float64Array;
  cum: Float64Array;
  unpriced: Int32Array;
};

export function settlementsOf(d: Data, coin: string): Settlements {
  const rows = d.funding(coin);
  const pc = d.pc.get(coin)!;
  const cum = new Float64Array(rows.length);
  const unpriced = new Int32Array(rows.length);
  let s = 0;
  let u = 0;
  rows.forEach(([hour, rate], i) => {
    const p = priceAfter(pc, d.start, hour - 1);
    if (Number.isNaN(p)) u += 1;
    else s += rate * p;
    cum[i] = s;
    unpriced[i] = u;
  });
  return { hour: Float64Array.from(rows, (r) => r[0]), cum, unpriced };
}

function upperBound(a: Float64Array, x: number): number {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (a[m]! <= x) lo = m + 1;
    else hi = m;
  }
  return lo;
}

/** The kit's `fundingBetween` on the settlements: those whose nominal hour lies in (x_in, x_out]; NaN when one has no price; the whole hours without a row. */
export function fundingBetween(
  st: Settlements,
  xIn: number,
  xOut: number,
): { sum: number; missing: number } {
  const lo = upperBound(st.hour, xIn);
  const hi = upperBound(st.hour, xOut) - 1;
  const window = (a: Float64Array | Int32Array) =>
    hi >= lo ? a[hi]! - (lo > 0 ? a[lo - 1]! : 0) : 0;
  const sum = window(st.unpriced) > 0 ? NaN : window(st.cum);
  const expected = Math.floor(xOut / HOUR_MS) - Math.floor(xIn / HOUR_MS);
  return { sum, missing: expected - Math.max(0, hi - lo + 1) };
}

/** Every spec priced in the one sweep: the entry walked for $1,000 and the exit for its Q at the tape (H8), 4.5 bps a leg, funding through the minute price (H9). */
export async function priceAll(
  d: Data,
  specs: readonly Spec[],
  pace: () => Promise<void>,
): Promise<Net[]> {
  const n = specs.length;
  const pIn = new Float64Array(n);
  const units = new Float64Array(n);
  const pOut = new Float64Array(n);
  const short = new Uint8Array(n);
  /** 0 walked, 1 no trade at the entry, 2 no trade at the exit. */
  const none = new Uint8Array(n);
  await eachLeg(d, specs, pace, (_leg, levels, uses) => {
    for (const { spec: s, exit } of uses) {
      if (none[s] !== 0) continue;
      if (levels.length === 0) {
        none[s] = exit ? 2 : 1;
        continue;
      }
      const w = exit
        ? walkClose(levels, units[s]!)
        : walkOpen(levels, NOTIONAL);
      if (exit) pOut[s] = w.price;
      else {
        pIn[s] = w.price;
        units[s] = w.units;
      }
      if (w.short) short[s] = 1;
    }
  });
  const names = new Map(d.coins.list.map((c) => [c.assetId, c.name]));
  const settled = new Map<number, Settlements>();
  const k = 1e4 / NOTIONAL;
  return specs.map((sp, s) => {
    const out: Net = {
      net: null,
      unpriced: null,
      gross: null,
      fees: null,
      funding: null,
      missing: 0,
      short: false,
      pIn: none[s] === 1 ? null : pIn[s]!,
      pOut: none[s] === 0 ? pOut[s]! : null,
    };
    if (none[s] !== 0) {
      out.unpriced =
        none[s] === 1 ? "no trade at the entry" : "no trade at the exit";
      return out;
    }
    out.short = short[s] === 1;
    let st = settled.get(sp.iid);
    if (st === undefined) {
      st = settlementsOf(d, names.get(sp.iid)!);
      settled.set(sp.iid, st);
    }
    const f = fundingBetween(st, sp.xIn, sp.xOut);
    out.missing = f.missing;
    if (Number.isNaN(f.sum)) {
      out.unpriced = "funding without a price";
      return out;
    }
    const Q = units[s]!;
    out.gross = sp.dir * (pOut[s]! - pIn[s]!) * Q * k;
    out.fees = (FEE * NOTIONAL + FEE * pOut[s]! * Q) * k;
    out.funding = -sp.dir * f.sum * Q * k;
    out.net = out.gross - out.fees + out.funding;
    return out;
  });
}

/** The gross on marks (H9, H13): dir × (the minute price at the end of x_out's minute ÷ x_in's − 1) × 10⁴, NaN when one is unknown. */
export function grossOnMarks(d: Data, sp: Spec, coin: string): number {
  const pc = d.pc.get(coin)!;
  return (
    sp.dir *
    ((priceAfter(pc, d.start, sp.xOut) / priceAfter(pc, d.start, sp.xIn) - 1) *
      1e4)
  );
}
