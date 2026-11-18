/**
 * What the exploration's computations read (POLISH-EXPLORE-2's call: one
 * shape for the store and for a world in memory, so every computation is
 * tested on known answers): the minute grid, the counted and forced fills,
 * each coin's minute price, a minute column, the settled funding and the
 * tape at a leg as walk levels; read from the trusted store, with the
 * features step's check of the minute price against legs.ts `minutePrice`.
 */
import type { Level } from "../../market1/book.js";
import type { Research } from "../../paper/research.js";
import { MINUTE_MS } from "../../schedule.js";
import type { Coins } from "../../waveh/coins.js";
import type { Counted } from "../../waveh/fills.js";
import type { FundingRow } from "../../waveh/funding.js";
import { TAPE_MS } from "../../waveh/price.js";
import { countedFrom } from "../counted.js";
import {
  Tape,
  fundingOf,
  marketsFrom,
  minuteColumn,
  minutePrice,
} from "../legs.js";
import { monthsOf } from "../merge.js";
import { GateFailed } from "../run.js";
import type { Store } from "../store.js";
import { BACKSTOP, fortyOf } from "../writers.js";
import { forcedFrom, type Forced } from "./forced.js";
import { priceColumn } from "./prices.js";

export type Data = {
  kit: Research;
  /** The minute grid's first minute and its length in minutes. */
  start: number;
  minutes: number;
  /** The 38 small coins. */
  coins: Coins;
  /** WAVE-H's counted fills, in M4's order. */
  counted: readonly Counted[];
  forced: Forced;
  /** Each of the 40 coins' minute price column (`priceColumn`), by name. */
  pc: ReadonlyMap<string, Float64Array>;
  /** A coin's minute column over the grid. */
  column: (coin: string, name: string) => Float64Array;
  /** A small coin's settled funding rows [the nominal hour, the rate, the stamp], in hour order. */
  funding: (coin: string) => readonly FundingRow[];
  /** H8's tape at a leg as walk levels: the takers on our side in [x, x + 60 s), no backstop's, in H8's order, price and size above 0. */
  levels: (coin: string, buy: boolean, x: number) => readonly Level[];
};

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

/** WAVE-H's `levelsOf(tape.at(coin, buy, x))`, read straight from the coin-months' columns (no trade object a row). */
export function levelsAt(
  tape: Tape,
  coin: string,
  buy: boolean,
  x: number,
): Level[] {
  const out: Level[] = [];
  const side = buy ? 1 : -1;
  for (const month of monthsOf(x, x + TAPE_MS)) {
    const r = tape.rows(coin, month);
    for (
      let i = lowerBound(r.time, x);
      i < r.time.length && r.time[i]! < x + TAPE_MS;
      i++
    )
      if (
        r.side[i] === side &&
        !(r.flags[i]! & BACKSTOP) &&
        r.px[i]! > 0 &&
        r.sz[i]! > 0
      )
        out.push([r.px[i]!, r.sz[i]!]);
  }
  return out;
}

/** The trusted store's data: the counted fills and the forced fills held to them, the 40 coins' price columns, the 38 coins' funding. */
export function dataFrom(store: Store, coins: Coins, kit: Research): Data {
  const { counted } = countedFrom(store, coins);
  const m = store.manifest;
  const tape = new Tape(store);
  const funding = new Map(
    coins.list.map((c) => [c.name, fundingOf(store, c.name)]),
  );
  return {
    kit,
    start: m.minuteStart,
    minutes: (m.end - m.minuteStart) / MINUTE_MS,
    coins,
    counted,
    forced: forcedFrom(store, coins, counted),
    pc: new Map(
      [...fortyOf(coins)].map((c) => [
        c,
        priceColumn(
          minuteColumn(store, c, "mark"),
          minuteColumn(store, c, "last"),
        ),
      ]),
    ),
    column: (coin, name) => minuteColumn(store, coin, name),
    funding: (coin) => funding.get(coin) ?? [],
    levels: (coin, buy, x) => levelsAt(tape, coin, buy, x),
  };
}

/** The features step's check (POLISH-EXPLORE's plan 2 (3)): each of the 38 coins' price column is legs.ts `minutePrice` at every minute of the grid; a difference fails (exit 6). */
export function checkPrices(
  store: Store,
  d: Data,
): { minutes: number; byTrade: number } {
  const { markets } = marketsFrom(store, d.kit, d.coins);
  const tape = new Tape(store);
  let minutes = 0;
  let byTrade = 0;
  const differ: string[] = [];
  for (const c of d.coins.list) {
    const mk = markets.get(c.assetId)!;
    const pc = d.pc.get(c.name)!;
    for (let k = 0; k < d.minutes && differ.length < 10; k++) {
      const t = d.start + k * MINUTE_MS;
      const want = minutePrice(d.kit, mk, tape, t) ?? NaN;
      minutes += 1;
      if (!Number.isNaN(want) && d.kit.panel.markAtMinuteEnd(mk, t) === null)
        byTrade += 1;
      if (!Object.is(pc[k], want))
        differ.push(`${c.name} ${new Date(t).toISOString()}`);
    }
  }
  if (differ.length > 0)
    throw new GateFailed(
      `the minute price is not legs.ts minutePrice: ${differ.join("; ")}`,
    );
  return { minutes, byTrade };
}
