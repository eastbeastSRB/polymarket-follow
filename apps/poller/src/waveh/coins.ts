/**
 * The small coins (rules.md H3): MARKET-1's 38 by Hyperliquid's names, from
 * the frozen `waveh/coins.json` (name, Hyperliquid's asset id, MARKET-1's
 * instrument id). A file that does not hold exactly M3's coins, in M3's
 * order, is refused.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { SMALL_COINS } from "../market1/fills.js";
import { RESEARCH_ROOT } from "../paper/research.js";

/** `waveh/` beside `research/`: WAVE-H's frozen files. */
export const WAVEH_DIR = path.join(RESEARCH_ROOT, "..", "waveh");

const CoinsFile = z.object({
  coins: z.array(
    z.object({
      name: z.string().min(1),
      assetId: z.number().int().nonnegative(),
      iid: z.number().int(),
    }),
  ),
});

export type Coin = { name: string; assetId: number; iid: number };
export type Coins = {
  list: readonly Coin[];
  byName: ReadonlyMap<string, Coin>;
  byIid: ReadonlyMap<number, Coin>;
};

export function coinsFrom(text: string): Coins {
  const list = CoinsFile.parse(JSON.parse(text)).coins;
  const iids = list.map((c) => c.iid).join(",");
  if (iids !== SMALL_COINS.join(","))
    throw new Error(`coins.json holds ${iids}, not M3's coins in order`);
  const byName = new Map(list.map((c) => [c.name, c]));
  if (
    byName.size !== list.length ||
    new Set(list.map((c) => c.assetId)).size !== list.length
  )
    throw new Error("coins.json names a coin or an asset id twice");
  return { list, byName, byIid: new Map(list.map((c) => [c.iid, c])) };
}

export const loadCoins = (dir = WAVEH_DIR): Coins =>
  coinsFrom(readFileSync(path.join(dir, "coins.json"), "utf8"));
