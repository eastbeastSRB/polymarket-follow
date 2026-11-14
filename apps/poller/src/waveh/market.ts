/**
 * A coin's market object (rules.md H10): the kit's `marketFrom` on the
 * coin's marks and its settled funding rows, so the kit's `markAtMinuteEnd`
 * (5 minutes' staleness at most) and `fundingBetween` read it unchanged.
 */
import type { Market, Research } from "../paper/research.js";
import type { Coin } from "./coins.js";
import type { Marks } from "./ctxs.js";
import type { FundingRow } from "./funding.js";

export function marketOf(
  kit: Research,
  coin: Coin,
  marks: Marks,
  funding: readonly FundingRow[],
): Market {
  const series = marks.byCoin.get(coin.name);
  if (series === undefined) throw new Error(`no marks of ${coin.name}`);
  return kit.panel.marketFrom({
    iid: coin.assetId,
    symbol: coin.name,
    category: "crypto",
    start: marks.start,
    end: marks.end,
    firstTrade: null,
    retired: null,
    marks: Array.from(series, (v) => (Number.isNaN(v) ? null : v)),
    klines: { minute: [], trades: [], volume: [] },
    funding: funding.map(([hour, rate, stamp]) => [hour, rate, stamp]),
  });
}
