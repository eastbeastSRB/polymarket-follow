/**
 * What a leg reads, from the store (WAVE-H's rules.md H8, H9, H10; the
 * polishing plan 1.4; decisions 2026-11-17, the plan approved, Q7): the tape
 * at x (the coin's takers on our side with time in [x, x + 60 s), no
 * backstop's, in H8's order, as WAVE-H's `Trade`s); the 38 coins' market
 * objects from the minute and funding tables, through WAVE-H's `marketOf`;
 * and the minute price.
 */
import type { Market, Research } from "../paper/research.js";
import type { Coins } from "../waveh/coins.js";
import type { Marks } from "../waveh/ctxs.js";
import { joinFunding, type FundingRow } from "../waveh/funding.js";
import { marketOf } from "../waveh/market.js";
import { TAPE_MS, type Trade } from "../waveh/price.js";
import { StoreError } from "../waveh/store.js";
import { digitsOf } from "./counted.js";
import { monthsOf } from "./merge.js";
import type { Store } from "./store.js";
import { BACKSTOP } from "./writers.js";

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
/** The minute price's look-back for a trade, as the kit's for a mark (5 minutes). */
export const LAST_TRADE_MS = 5 * MINUTE_MS;

type TapeRows = {
  time: Float64Array;
  px: Float64Array;
  sz: Float64Array;
  side: Int8Array;
  flags: Uint8Array;
  user: Uint32Array;
  tid: Uint32Array;
};

/** The first index whose time is at or after t. */
function lowerBound(time: Float64Array, t: number): number {
  let lo = 0;
  let hi = time.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (time[mid]! < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** Coin-months a `Tape` keeps: legs asked coin by coin in time order reach at most two at once. */
const KEPT = 2;

/** The tape table, a coin-month read whole when first asked; the last two kept. */
export class Tape {
  private readonly months = new Map<string, TapeRows>();
  private users: string[] | null = null;

  constructor(private readonly store: Store) {}

  private rows(coin: string, month: string): TapeRows {
    const key = `${coin}|${month}`;
    let r = this.months.get(key);
    if (r === undefined) {
      const p = this.store.partition("tape", coin, month);
      const col = (name: string) => this.store.column(p, name);
      r = {
        time: col("time") as Float64Array,
        px: col("px") as Float64Array,
        sz: col("sz") as Float64Array,
        side: col("side") as Int8Array,
        flags: col("flags") as Uint8Array,
        user: col("user") as Uint32Array,
        tid: col("tid") as Uint32Array,
      };
      this.months.set(key, r);
      if (this.months.size > KEPT)
        this.months.delete(this.months.keys().next().value!);
    }
    return r;
  }

  /** The coin's taker rows with time in [from, to), in the store's order (H8's), month by month. */
  private *between(coin: string, from: number, to: number) {
    for (const month of monthsOf(from, to)) {
      const r = this.rows(coin, month);
      for (let i = lowerBound(r.time, from); i < r.time.length; i++) {
        if (r.time[i]! >= to) break;
        yield { r, i };
      }
    }
  }

  /** H8's tape at x: the takers on our side (a buy takes "B"), time in [x, x + 60 s), no backstop's. */
  at(coin: string, buy: boolean, x: number): Trade[] {
    this.users ??= this.store.users();
    const out: Trade[] = [];
    for (const { r, i } of this.between(coin, x, x + TAPE_MS))
      if (r.side[i] === (buy ? 1 : -1) && !(r.flags[i]! & BACKSTOP))
        out.push({
          t: r.time[i]!,
          px: r.px[i]!,
          sz: r.sz[i]!,
          user: this.users[r.user[i]!]!,
          tid: digitsOf(r.tid, i),
        });
    return out;
  }

  /** The price of the last taker but a backstop's, either side, with time in [from, to); null when none. */
  last(coin: string, from: number, to: number): number | null {
    let px: number | null = null;
    for (const { r, i } of this.between(coin, from, to))
      if (!(r.flags[i]! & BACKSTOP)) px = r.px[i]!;
    return px;
  }
}

/**
 * The minute price at t (the polishing plan 1.4; Q7): the mark in force at
 * the end of t's minute (the kit's, 5 minutes stale at most); where there is
 * none, the price of the last taker but a backstop's in the 5 minutes before
 * that minute's end; else null.
 */
export function minutePrice(
  kit: Research,
  mk: Market,
  tape: Tape,
  t: number,
): number | null {
  const mark = kit.panel.markAtMinuteEnd(mk, t);
  if (mark !== null) return mark;
  const end = Math.floor(t / MINUTE_MS) * MINUTE_MS + MINUTE_MS;
  return tape.last(mk.symbol, end - LAST_TRADE_MS, end);
}

/** A coin's column over the whole minute grid, its months' partitions end to end. */
export function minuteColumn(store: Store, coin: string, name: string) {
  const m = store.manifest;
  const n = (m.end - m.minuteStart) / MINUTE_MS;
  const out = new Float64Array(n);
  let at = 0;
  for (const p of m.partitions) {
    if (p.table !== "minute" || p.coin !== coin) continue;
    if (p.start !== m.minuteStart + at * MINUTE_MS)
      throw new StoreError(
        `minute/${coin}/${p.month} does not follow its month before`,
      );
    out.set(store.column(p, name), at);
    at += p.rows;
  }
  if (at !== n)
    throw new StoreError(`minute/${coin}: ${at} minutes, the grid's ${n}`);
  return out;
}

/** A coin's settled funding as WAVE-H's rows [the nominal hour, the rate, the stamp], in hour order. */
export function fundingOf(store: Store, coin: string): FundingRow[] {
  const rows: FundingRow[] = [];
  for (const p of store.manifest.partitions) {
    if (p.table !== "funding" || p.coin !== coin) continue;
    const time = store.column(p, "time") as Float64Array;
    const rate = store.column(p, "rate") as Float64Array;
    for (let i = 0; i < p.rows; i++)
      rows.push([Math.round(time[i]! / HOUR_MS) * HOUR_MS, rate[i]!, time[i]!]);
  }
  try {
    return joinFunding(rows);
  } catch (err) {
    throw new StoreError(`funding/${coin}: ${(err as Error).message}`);
  }
}

/** The 38 coins' marks (WAVE-H's `Marks`, over the minute grid; the store keeps no stamps) and their market objects (H9, H10). */
export function marketsFrom(store: Store, kit: Research, coins: Coins) {
  const m = store.manifest;
  const marks: Marks = {
    start: m.minuteStart,
    end: m.end,
    byCoin: new Map(
      coins.list.map((c) => [c.name, minuteColumn(store, c.name, "mark")]),
    ),
    stamps: new Map(),
  };
  const markets = new Map<number, Market>(
    coins.list.map((c) => [
      c.assetId,
      marketOf(kit, c, marks, fundingOf(store, c.name)),
    ]),
  );
  return { marks, markets };
}
