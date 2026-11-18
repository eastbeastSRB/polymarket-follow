/**
 * What the exploration's computations read (POLISH-EXPLORE-2's call: one
 * shape for the store and for a world in memory, so every computation is
 * tested on known answers): the minute grid, the counted and forced fills,
 * each coin's minute price, a minute column, the settled funding and the
 * tape at a leg as walk levels.
 */
import type { Level } from "../../market1/book.js";
import type { Research } from "../../paper/research.js";
import type { Coins } from "../../waveh/coins.js";
import type { Counted } from "../../waveh/fills.js";
import type { FundingRow } from "../../waveh/funding.js";
import type { Forced } from "./forced.js";

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
