/**
 * A coin's market object (rules.md H9, H10): the kit's `marketFrom` on the
 * coin's marks and its settled funding rows, so the kit's `markAtMinuteEnd`
 * (5 minutes' staleness at most) and `fundingBetween` read it unchanged; and
 * the coins' objects read from the store's `asset_ctxs` days and funding
 * windows, with what was read, by day and by coin: counts only.
 */
import type { Market, Research } from "../paper/research.js";
import { DAY_MS } from "../schedule.js";
import type { Coin } from "./coins.js";
import {
  addCtxs,
  minutesWithout,
  newMarks,
  type CtxsCount,
  type Marks,
} from "./ctxs.js";
import { fundingRows, joinFunding, type FundingRow } from "./funding.js";
import { boundOf, type Gate } from "./gate.js";
import { isoDay } from "./instants.js";
import { FUNDING_STARTS, ctxsKey, fundingKey } from "./keys.js";
import type { Ctx } from "./legs.js";
import { FAIL_LEAST, FAIL_SHARE } from "./pass.js";
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

/**
 * The market objects of the coins `iids` names, from every `asset_ctxs` day
 * and their funding windows before the gate's bound (H9, H10; R1). Every file
 * it reads must be in the list, else it stops before reading any; a day with
 * more than 1%, and at least 10, of its rows failing stops it, as H2's rule
 * for fills.
 */
export async function readMarkets(
  ctx: Ctx,
  gate: Gate,
  iids: ReadonlySet<number>,
) {
  const bound = boundOf(gate);
  const days: number[] = [];
  for (let d = MARKS_START; d < bound; d += DAY_MS) days.push(d);
  const coins = ctx.coins.list.filter((c) => iids.has(c.assetId));
  const starts = FUNDING_STARTS.filter((s) => s < bound);
  const absent = [
    ...days.map(ctxsKey),
    ...coins.flatMap((c) => starts.map((s) => fundingKey(c.name, s))),
  ].filter((k) => !ctx.list.has(k));
  if (absent.length > 0)
    throw new StoreError(
      `${absent.length} asset_ctxs days and funding windows are not in the store's list, the first ${absent[0]}`,
    );
  const marks = newMarks(ctx.coins, MARKS_START, bound);
  const ctxs = {
    files: 0,
    rows: 0,
    failed: 0,
    offMinute: 0,
    late: 0,
    twice: 0,
  };
  const ctxsByDay: Record<string, CtxsCount> = {};
  for (const d of days) {
    await ctx.pace();
    const c = addCtxs(
      marks,
      Buffer.from(readLz4(gate, ctx.store, ctx.list, ctxsKey(d))).toString(
        "utf8",
      ),
      bound,
    );
    if (c.failed >= FAIL_LEAST && c.failed / c.rows > FAIL_SHARE)
      throw new StoreError(
        `${isoDay(d)}: ${c.failed} of ${c.rows} asset_ctxs rows of the small coins fail WAVE-H's schema`,
      );
    ctxs.files += 1;
    ctxs.rows += c.rows;
    ctxs.failed += c.failed;
    ctxs.offMinute += c.offMinute;
    ctxs.late += c.late;
    ctxs.twice += c.twice;
    ctxsByDay[isoDay(d)] = c;
  }
  const funding = { files: 0, rows: 0, failed: 0, late: 0 };
  const fundingByCoin: Record<
    string,
    {
      /** Rows by window, keyed by the window's first day. */
      windows: Record<string, number>;
      failed: number;
      late: number;
      settlements: number;
      /** Settlements whose mark is missing (the kit's 5-minute rule): each leaves a position over it unpriced (H9). */
      unmarked: number;
    }
  > = {};
  const markets = new Map<number, Market>();
  for (const coin of coins) {
    const rows: FundingRow[] = [];
    const windows: Record<string, number> = {};
    let failed = 0;
    let late = 0;
    for (const start of starts) {
      const r = fundingRows(
        coin.name,
        readStoreFile(
          gate,
          ctx.store,
          ctx.list,
          fundingKey(coin.name, start),
        ).toString("utf8"),
        bound,
      );
      windows[isoDay(start)] = r.rows.length;
      failed += r.failed;
      late += r.late;
      rows.push(...r.rows);
    }
    funding.files += starts.length;
    funding.rows += rows.length;
    funding.failed += failed;
    funding.late += late;
    let joined: FundingRow[];
    try {
      joined = joinFunding(rows);
    } catch (err) {
      throw new StoreError(`${coin.name}: ${(err as Error).message}`);
    }
    const mk = marketOf(ctx.kit, coin, marks, joined);
    markets.set(coin.assetId, mk);
    fundingByCoin[coin.name] = {
      windows,
      failed,
      late,
      settlements: mk.funding.hour.length,
      unmarked: mk.funding.cumUnmarked.at(-1) ?? 0,
    };
  }
  const without = minutesWithout(marks);
  return {
    markets,
    ctxs,
    ctxsByDay,
    funding,
    byCoin: Object.fromEntries(
      ctx.coins.list.map((c) => [
        c.name,
        {
          marks: without[c.name] ?? null,
          funding: fundingByCoin[c.name] ?? null,
        },
      ]),
    ),
  };
}
