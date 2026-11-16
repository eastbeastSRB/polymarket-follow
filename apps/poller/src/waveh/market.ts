/**
 * A coin's market object (rules.md H10): the kit's `marketFrom` on the
 * coin's marks and its settled funding rows, so the kit's `markAtMinuteEnd`
 * (5 minutes' staleness at most) and `fundingBetween` read it unchanged; and
 * the 38 coins' objects read from the store's `asset_ctxs` days and funding
 * windows.
 */
import type { Market, Research } from "../paper/research.js";
import { DAY_MS } from "../schedule.js";
import type { Coin } from "./coins.js";
import { addCtxs, newMarks, type Marks } from "./ctxs.js";
import { fundingRows, joinFunding, type FundingRow } from "./funding.js";
import { boundOf, type Gate } from "./gate.js";
import { ctxsKey } from "./keys.js";
import type { Ctx } from "./legs.js";
import { StoreError, readLz4, readStoreFile } from "./store.js";

/** The first `asset_ctxs` day: its rows give the marks from the minute before its 00:01 row. */
export const MARKS_START = Date.parse("2025-05-25T00:00:00Z");

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

/** The coins' market objects from the `asset_ctxs` days and funding windows (R1) before the gate's bound, with what was read. */
export async function readMarkets(
  ctx: Ctx,
  gate: Gate,
  iids: ReadonlySet<number>,
) {
  const bound = boundOf(gate);
  const marks = newMarks(ctx.coins, MARKS_START, bound);
  const ctxs = {
    files: 0,
    rows: 0,
    failed: 0,
    offMinute: 0,
    late: 0,
    twice: 0,
  };
  for (let d = MARKS_START; d < bound; d += DAY_MS) {
    await ctx.pace();
    const c = addCtxs(
      marks,
      Buffer.from(readLz4(gate, ctx.store, ctx.list, ctxsKey(d))).toString(
        "utf8",
      ),
      bound,
    );
    ctxs.files += 1;
    ctxs.rows += c.rows;
    ctxs.failed += c.failed;
    ctxs.offMinute += c.offMinute;
    ctxs.late += c.late;
    ctxs.twice += c.twice;
  }
  const funding = { files: 0, rows: 0, failed: 0, late: 0 };
  const markets = new Map<number, Market>();
  for (const coin of ctx.coins.list) {
    if (!iids.has(coin.assetId)) continue;
    const prefix = `info/fundingHistory/${coin.name}/`;
    const rows: FundingRow[] = [];
    for (const key of [...ctx.list.keys()]
      .filter((k) => k.startsWith(prefix))
      .sort()) {
      if (Number(key.slice(prefix.length, -".json".length)) >= bound) continue;
      const r = fundingRows(
        coin.name,
        readStoreFile(gate, ctx.store, ctx.list, key).toString("utf8"),
        bound,
      );
      funding.files += 1;
      funding.rows += r.rows.length;
      funding.failed += r.failed;
      funding.late += r.late;
      rows.push(...r.rows);
    }
    let joined: FundingRow[];
    try {
      joined = joinFunding(rows);
    } catch (err) {
      throw new StoreError(`${coin.name}: ${(err as Error).message}`);
    }
    markets.set(coin.assetId, marketOf(ctx.kit, coin, marks, joined));
  }
  return { markets, ctxs, funding };
}
