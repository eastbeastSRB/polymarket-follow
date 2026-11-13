/**
 * The coins and the liquidation fills (rules.md M3, M4): which markets count,
 * which stored fill rows are counted, their order, and what an account's rows
 * add to the prints (its weeks of small-coin activity, liquidations in crypto
 * markets outside the small coins).
 */
import { mondayOf } from "../paper/instants.js";
import type { StoredRow } from "../paper/store.js";

/** M3's small coins, fixed (instrument ids): the kit's rule book's crypto markets but 6, 7 and 96. */
export const SMALL_COINS: readonly number[] = [
  8, 10, 31, 32, 33, 34, 35, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66,
  67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84,
];
/** BTC-USD and ETH-USD, for the lines beside only. */
export const LARGE: readonly number[] = [6, 7];

/** A counted fill (M4): `side` is the fill's own, the forced side (long +1 a forced buy, short −1 a forced sell). */
export type Liq = {
  t: number;
  iid: number;
  addr: string;
  side: 1 | -1;
  tid: string;
};

/** M4's test, any market: a liquidation, taker, reducing (`previous_size` non-zero and opposite to the fill's side). */
export function isForced(row: StoredRow): boolean {
  if (!row.liquidation || !row.taker) return false;
  const prev = Number(row.previous_size);
  const side = row.side === "long" ? 1 : -1;
  return prev !== 0 && Math.sign(prev) === -side;
}

export const liqOf = (row: StoredRow, addr: string): Liq => ({
  t: row.timestamp,
  iid: row.instrument_id,
  addr,
  side: row.side === "long" ? 1 : -1,
  tid: row.trade_id,
});

/** M4's order: timestamp, instrument, address, trade id as a whole number of any size. */
export function byM4(a: Liq, b: Liq): number {
  if (a.t !== b.t) return a.t - b.t;
  if (a.iid !== b.iid) return a.iid - b.iid;
  if (a.addr !== b.addr) return a.addr < b.addr ? -1 : 1;
  const x = BigInt(a.tid);
  const y = BigInt(b.tid);
  return x < y ? -1 : x > y ? 1 : 0;
}

/** What the pool's rows give MARKET-1, gathered account by account in bounded memory. */
export type PoolFills = {
  /** Counted fills in the small coins (M4), in M4's order once `finish`ed. */
  small: Liq[];
  /** Counted fills in BTC and ETH (B10). */
  large: Liq[];
  /** M4's test in crypto markets outside M3 and in markets the kit does not list, by market (M13). */
  outside: Map<number, number>;
  /** By week (its Monday): accounts with a small-coin fill, accounts liquidated in small coins, counted fills (M13, F18). */
  weeks: Map<number, { active: number; liquidated: number; counted: number }>;
};

export const emptyPoolFills = (): PoolFills => ({
  small: [],
  large: [],
  outside: new Map(),
  weeks: new Map(),
});

/**
 * Adds one account's rows with from ≤ timestamp < to. `crypto` holds the
 * kit's crypto markets; a market the kit does not list counts as outside.
 */
export function addAccount(
  into: PoolFills,
  addr: string,
  rows: readonly StoredRow[],
  from: number,
  to: number,
  crypto: ReadonlySet<number>,
  known: ReadonlySet<number>,
): void {
  const small = new Set(SMALL_COINS);
  const large = new Set(LARGE);
  const active = new Set<number>();
  const liquidated = new Set<number>();
  for (const row of rows) {
    const t = row.timestamp;
    if (t < from || t >= to) continue;
    const iid = row.instrument_id;
    const week = mondayOf(t);
    if (small.has(iid)) active.add(week);
    if (!isForced(row)) continue;
    if (small.has(iid)) {
      into.small.push(liqOf(row, addr));
      liquidated.add(week);
      const w = weekOf(into, week);
      w.counted += 1;
    } else if (large.has(iid)) {
      into.large.push(liqOf(row, addr));
    }
    if (!small.has(iid) && (crypto.has(iid) || !known.has(iid))) {
      into.outside.set(iid, (into.outside.get(iid) ?? 0) + 1);
    }
  }
  for (const week of active) weekOf(into, week).active += 1;
  for (const week of liquidated) weekOf(into, week).liquidated += 1;
}

function weekOf(into: PoolFills, week: number) {
  let w = into.weeks.get(week);
  if (w === undefined) {
    w = { active: 0, liquidated: 0, counted: 0 };
    into.weeks.set(week, w);
  }
  return w;
}

/** Sorts the gathered fills into M4's order. */
export function finish(pool: PoolFills): PoolFills {
  pool.small.sort(byM4);
  pool.large.sort(byM4);
  return pool;
}
