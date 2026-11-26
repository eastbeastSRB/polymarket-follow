/**
 * A coin's markets (copyh/rules.md C6, C9; RM4, M6, M7), from the bars the
 * store keeps (`bars/<iid>/<YYYY-MM>/`, row k the minute `start + k`: the
 * market-trade takers' count, Σ sz, Σ px·sz and last price, the pairs' gaps,
 * the Settlement records' Σ sz and Σ px·sz; only coin-months with a taker or
 * a Settlement record).
 * - Its bars: the reading's partitions of the coin joined minute by minute
 *   to END (a minute no partition holds has no taker record); every file
 *   held to its manifest line (`Store.bytes`), no partition at or after the
 *   seal's end opened, the last minute read of each checked by its seal.
 * - Its end: the end of the minute that holds its first Settlement record
 *   when the reading holds one (only records before END are read), else
 *   END. That minute's Settlement Σ px·sz ÷ Σ sz is the Settlement price,
 *   what every holder was paid.
 * - Primary (C6): no Settlement at or before the end of t's UTC day. The
 *   rule's first condition, a coin of `coins.json`, holds for every kept
 *   record: the pass keeps no other coin (C3).
 * - Its two market objects: the kit's `marketFrom`, step for step, with the
 *   reading's END in place of the kit's cut and each funding settlement at
 *   C9's mark (5 minutes: the kit's `markAtMinuteEnd(mk, hour − 1)`; 60:
 *   the latest mark among the minute that ends at the hour and the 60
 *   before it); from the coin's first market trade's minute to its end; the
 *   VWAP marks (Σ px·sz ÷ Σ sz where Σ sz > 0) or the last prices (M7), the
 *   Settlement minute's mark the Settlement price in both (Q10); `trades`
 *   the market trades, `volume` their Σ sz; every funding row by its nominal
 *   hour, a row stamped at or after END refused as the kit refuses one past
 *   its cut. A settled coin's rows past its end stay: one whose hour lies
 *   inside a hold is charged as it was paid, however late it was stamped;
 *   one at or after the coin's end lies in no hold (the supervisor's ruling,
 *   2026-11-26, in place of Q9's).
 * - Thin legs (M6): a leg instant whose minute and the five before it hold
 *   under $1,000 of market-trade notional.
 */
import type { Market, PanelFile, Research } from "../paper/research.js";
import { DAY_MS, MINUTE_MS } from "../schedule.js";
import { columnOf } from "./accounts.js";
import { THIN_MINUTES, THIN_NOTIONAL } from "./design.js";
import type { FundingRow } from "./funding.js";
import { dayOf } from "./instants.js";
import { StoreError } from "./run.js";
import { checkInstant } from "./seal.js";
import { coinKey, type Store } from "./store.js";

const iso = (t: number) => new Date(t).toISOString();

/** What the bars reader takes of a store. */
export type BarsSource = Pick<Store, "manifest" | "column" | "seal">;

/** A coin's bars over the minutes [start, start + n min): part.ts BARS' columns (a minute without a taker: 0, its last price NaN). */
export type Bars = {
  readonly iid: number;
  readonly start: number;
  readonly n: number;
  readonly trades: Uint32Array;
  readonly sz: Float64Array;
  readonly ntl: Float64Array;
  readonly last: Float64Array;
  readonly pairGap: Float64Array;
  readonly pairs: Uint32Array;
  readonly settleSz: Float64Array;
  readonly settleNtl: Float64Array;
};
const F64 = ["sz", "ntl", "last", "pairGap", "settleSz", "settleNtl"] as const;
const U32 = ["trades", "pairs"] as const;

/** A coin's bars in the stores of a reading, from its first partition's start to `to` (END, a minute's start); null when they hold none. */
export function readBars(
  stores: readonly BarsSource[],
  iid: number,
  to: number,
): Bars | null {
  if (to % MINUTE_MS !== 0)
    throw new Error(`the bars' end ${iso(to)} is not a minute's start`);
  const parts = stores
    .flatMap((store) =>
      store.manifest.partitions
        .filter(
          (p) => p.table === "bars" && p.key === coinKey(iid) && p.start < to,
        )
        .map((p) => ({ store, p })),
    )
    .sort((a, b) => a.p.start - b.p.start);
  const start = parts[0]?.p.start;
  if (start === undefined) return null;
  const n = (to - start) / MINUTE_MS;
  const bars = {
    iid,
    start,
    n,
    trades: new Uint32Array(n),
    sz: new Float64Array(n),
    ntl: new Float64Array(n),
    last: new Float64Array(n).fill(NaN),
    pairGap: new Float64Array(n),
    pairs: new Uint32Array(n),
    settleSz: new Float64Array(n),
    settleNtl: new Float64Array(n),
  };
  let next = start;
  for (const { store, p } of parts) {
    const where = `bars/${p.key}/${p.month}`;
    const at = (p.start - start) / MINUTE_MS;
    if (p.start < next || !Number.isInteger(at))
      throw new StoreError(
        `${where}: its start is not a minute after the coin's partition before it`,
      );
    const rows = Math.min(p.rows, (to - p.start) / MINUTE_MS);
    checkInstant(p.start, where, store.seal);
    checkInstant(
      p.start + (rows - 1) * MINUTE_MS,
      `${where}'s last minute read`,
      store.seal,
    );
    for (const name of F64)
      bars[name].set(
        columnOf(store, p, name, Float64Array).subarray(0, rows),
        at,
      );
    for (const name of U32)
      bars[name].set(
        columnOf(store, p, name, Uint32Array).subarray(0, rows),
        at,
      );
    next = p.start + p.rows * MINUTE_MS;
  }
  return bars;
}

/** A Settlement: its first record's instant and the price every holder was paid. */
export type Settlement = { readonly t: number; readonly price: number };

/** A coin of a reading: its bars to END, its end and its first Settlement. */
export type Coin = {
  readonly bars: Bars;
  readonly end: number;
  readonly settlement: Settlement | null;
};

/** A coin of a reading of END (C6, C9); null when the reading holds no bars of it. A Settlement the bars do not hold is refused (our own files). */
export function coinOf(
  stores: readonly BarsSource[],
  iid: number,
  END: number,
): Coin | null {
  let first = Infinity;
  for (const s of stores)
    for (const c of s.manifest.counts.coins)
      if (c[0] === iid && c[4] >= 0 && c[4] < END && c[4] < first) first = c[4];
  const bars = readBars(stores, iid, END);
  if (first === Infinity)
    return bars === null ? null : { bars, end: END, settlement: null };
  const minute = Math.floor(first / MINUTE_MS) * MINUTE_MS;
  const k = bars === null ? -1 : (minute - bars.start) / MINUTE_MS;
  const sz = bars?.settleSz[k] ?? 0;
  if (bars === null || !(sz > 0))
    throw new StoreError(
      `coin ${iid}: its first Settlement at ${iso(first)} is not in its minute's bars`,
    );
  return {
    bars,
    end: minute + MINUTE_MS,
    settlement: { t: first, price: bars.settleNtl[k]! / sz },
  };
}

/** C6: an entry at t is in a primary market when its coin's reading holds no Settlement at or before the end of t's UTC day. */
export const isPrimary = (
  t: number,
  settlement: Pick<Settlement, "t"> | null,
): boolean => settlement === null || settlement.t >= dayOf(t) + DAY_MS;

/** C9's settlement mark: 5 minutes (the kit's rule) or 60. */
export type MarkMinutes = 5 | 60;

/** The latest minute mark among the minute that holds t and the `minutes` before it, or null: the kit's `markAtMinuteEnd` with `minutes` in place of its 5. */
export function latestMark(
  mk: Market,
  t: number,
  minutes: number,
): number | null {
  const i = Math.floor((t - mk.start) / MINUTE_MS);
  if (i < 0 || i >= mk.n) return null;
  for (let j = i; j >= 0 && i - j <= minutes; j--) {
    const m = mk.marks[j]!;
    if (!Number.isNaN(m)) return m;
  }
  return null;
}

/** The kit's `marketFrom`, step for step (C9): `cut` (the reading's END) in place of its cut, each funding settlement at the mark of C9's rule. */
export function marketOf(
  kit: Research,
  p: PanelFile,
  cut: number,
  markMinutes: MarkMinutes,
): Market {
  if (!(p.end <= cut))
    throw new Error(
      `market ${p.iid}: the panel ends at ${iso(p.end)}, after the cut`,
    );
  const n = (p.end - p.start) / MINUTE_MS;
  if (!Number.isInteger(n) || p.marks.length !== n)
    throw new Error(
      `market ${p.iid}: ${p.marks.length} marks for ${n} minutes`,
    );
  const marks = Float64Array.from(p.marks, (v) => (v === null ? NaN : v));
  const trades = new Int32Array(n);
  const volume = new Float64Array(n);
  p.klines.minute.forEach((i, k) => {
    if (!(i >= 0 && i < n))
      throw new Error(`market ${p.iid}: a kline outside the panel's minutes`);
    trades[i] = p.klines.trades[k]!;
    volume[i] = p.klines.volume[k]!;
  });
  const partial = {
    iid: p.iid,
    symbol: p.symbol,
    category: p.category,
    start: p.start,
    end: p.end,
    n,
    marks,
    trades,
    volume,
    retired: p.retired ?? null,
    firstTrade: p.firstTrade,
  };
  for (const [, , stamp] of p.funding)
    if (stamp >= cut)
      throw new StoreError(
        `market ${p.iid}: a funding row stamped at or after the cut`,
      );
  const mk = partial as Market;
  const markOf =
    markMinutes === 5
      ? (hour: number) => kit.panel.markAtMinuteEnd(mk, hour - 1)
      : (hour: number) => latestMark(mk, hour - 1, markMinutes);
  const cum = new Float64Array(p.funding.length);
  const cumUnmarked = new Int32Array(p.funding.length);
  let s = 0;
  let u = 0;
  p.funding.forEach(([hour, rate], i) => {
    const m = markOf(hour);
    if (m === null) u++;
    else s += rate * m;
    cum[i] = s;
    cumUnmarked[i] = u;
  });
  mk.funding = {
    hour: Float64Array.from(p.funding, (r) => r[0]),
    rate: Float64Array.from(p.funding, (r) => r[1]),
    cum,
    cumUnmarked,
  };
  return mk;
}

/** A coin's two market objects (C9; M7). */
export type CoinMarkets = { readonly vwap: Market; readonly last: Market };

/** A coin's market objects on its funding rows (funding.ts's, of its windows), cut at the reading's END, where its bars end; null when it has no market trade before its end. A row of another coin is refused (the engine review's L5). */
export function coinMarkets(
  kit: Research,
  coin: Coin & { readonly name: string },
  funding: readonly FundingRow[],
  markMinutes: MarkMinutes,
): CoinMarkets | null {
  const { bars, end, settlement } = coin;
  const cut = bars.start + bars.n * MINUTE_MS;
  const kEnd = (end - bars.start) / MINUTE_MS;
  let k0 = 0;
  while (k0 < kEnd && bars.trades[k0] === 0) k0++;
  if (k0 === kEnd) return null;
  const start = bars.start + k0 * MINUTE_MS;
  const n = kEnd - k0;
  const rows = funding
    .map((r): [number, number, number] => {
      if (r.coin !== coin.name)
        throw new Error(`coin ${coin.name}'s object given a row of ${r.coin}`);
      return [r.hour, Number(r.fundingRate), r.time];
    })
    .sort((a, b) => a[0] - b[0]);
  const klines = {
    minute: [] as number[],
    trades: [] as number[],
    volume: [] as number[],
  };
  for (let k = k0; k < kEnd; k++)
    if (bars.trades[k]! > 0) {
      klines.minute.push(k - k0);
      klines.trades.push(bars.trades[k]!);
      klines.volume.push(bars.sz[k]!);
    }
  /** The panel of these marks, the Settlement minute (the object's last) at the Settlement price. */
  const panel = (markAt: (k: number) => number): PanelFile => ({
    iid: bars.iid,
    symbol: coin.name,
    category: "main dex",
    start,
    end,
    firstTrade: start,
    retired: settlement,
    marks: Array.from({ length: n }, (_, i) => {
      const v =
        settlement !== null && i === n - 1 ? settlement.price : markAt(k0 + i);
      return Number.isNaN(v) ? null : v;
    }),
    klines,
    funding: rows,
  });
  return {
    vwap: marketOf(
      kit,
      panel((k) => (bars.sz[k]! > 0 ? bars.ntl[k]! / bars.sz[k]! : NaN)),
      cut,
      markMinutes,
    ),
    // A minute whose market trades' Σ sz is 0 has no mark here either (C9; the engine review's L4).
    last: marketOf(
      kit,
      panel((k) => (bars.sz[k]! > 0 ? bars.last[k]! : NaN)),
      cut,
      markMinutes,
    ),
  };
}

/** M6: a leg instant is thin when the coin's market trades in the minute that holds it and the five before it sum to under $1,000 of notional. */
export function isThin(bars: Bars, x: number): boolean {
  const m = Math.floor((x - bars.start) / MINUTE_MS);
  let sum = 0;
  for (
    let k = Math.max(0, m - THIN_MINUTES + 1);
    k <= Math.min(m, bars.n - 1);
    k++
  )
    sum += bars.ntl[k]!;
  return sum < THIN_NOTIONAL;
}
