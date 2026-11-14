/**
 * WAVE-H's reproduction on Polymarket's old weeks (the plan's section 5, with
 * its review's R8; a script and a test, never a frozen command): the pre-cut
 * seed's fills from 2026-08-31 to the cut, re-expressed as Hyperliquid's
 * `node_fills` lines (each row its own leg; a liquidation also its
 * counterparty's leg, which carries the same object), read through WAVE-H's
 * own line parser, record schema and counted fill (H4), then the slices at
 * M = 1 and MARKET-1's entries, against MARKET-1's own M4 and M5 on the same
 * rows. Pre-cut data only; exploring figures, deciding nothing.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { byM4, isForced, liqOf, SMALL_COINS } from "../src/market1/fills.js";
import { waveEntries } from "../src/market1/waves.js";
import { kitData } from "../src/market1/inputs.js";
import { CUT } from "../src/paper/instants.js";
import { loadSeed, readManifest } from "../src/paper/seed.js";
import { dayOf } from "../src/paper/stats.js";
import type { StoredRow } from "../src/paper/store.js";
import { loadCoins, type Coins } from "../src/waveh/coins.js";
import {
  countedOf,
  parseLine,
  parseRecord,
  type Counted,
} from "../src/waveh/fills.js";
import { bySlice } from "../src/waveh/slices.js";
import { LAUNCH } from "./market1-reproduce.js";

/** The counterparty of every converted liquidation: an address of no account in the pool. */
export const COUNTERPARTY = `0x${"c".repeat(40)}`;

export class ReproductionBlindError extends Error {}

/**
 * One seed row as `node_fills` lines (R8): `crossed` from `taker`, but false
 * for a backstop (order id "0"); `startPosition` from `previous_size`; a
 * liquidation row carries `{liquidatedUser: its account, markPx, method}`,
 * "backstop" for order id "0", else "market", and adds the counterparty's
 * leg: the other side, the same object, crossed where the own leg is not, a
 * maker closing for a market liquidation, the vault opening for a backstop.
 */
export function toLines(addr: string, row: StoredRow, coin: string): string[] {
  const backstop = row.order_id === "0";
  const side = row.side === "long" ? "B" : "A";
  const liquidation = row.liquidation
    ? {
        liquidatedUser: addr,
        markPx: row.price,
        method: backstop ? "backstop" : "market",
      }
    : undefined;
  const crossed = row.taker && !backstop;
  const line = (user: string, fill: Record<string, unknown>) =>
    // `tid` as the row's digits, of any size, as the archive writes it: a JSON number.
    JSON.stringify([user, { ...fill, tid: "TID" }]).replace(
      '"tid":"TID"',
      `"tid":${row.trade_id}`,
    );
  const own = line(addr, {
    coin,
    px: row.price,
    sz: row.quantity,
    side,
    time: row.timestamp,
    startPosition: row.previous_size,
    crossed,
    fee: row.fee,
    ...(liquidation ? { liquidation } : {}),
  });
  if (liquidation === undefined) return [own];
  const other = side === "B" ? "A" : "B";
  return [
    own,
    line(COUNTERPARTY, {
      coin,
      px: row.price,
      sz: row.quantity,
      side: other,
      time: row.timestamp,
      startPosition: backstop
        ? "0.0"
        : `${other === "B" ? "-" : ""}${row.quantity}`,
      crossed: !crossed,
      fee: "0.0",
      liquidation,
    }),
  ];
}

const key = (f: {
  addr: string;
  iid: number;
  t: number;
  side: number;
  tid: string;
}) => `${f.addr}|${f.iid}|${f.t}|${f.side}|${f.tid}`;

export type Paths = { packageRoot: string; seedDir: string };

export function reproduce(paths: Paths, coins: Coins = loadCoins()) {
  const kd = kitData(paths.packageRoot);
  const manifest = readManifest(
    readFileSync(
      path.join(paths.packageRoot, "experiment", "seed.sha256"),
      "utf8",
    ),
  );
  const small = new Set(SMALL_COINS);
  const counted: Counted[] = [];
  const market1: Counted[] = [];
  let lines = 0;
  let failed = 0;
  for (const addr of kd.pool) {
    const seed = loadSeed(paths.seedDir, manifest, addr);
    if (seed === null) continue;
    for (const row of seed.rows) {
      if (row.timestamp >= CUT)
        throw new ReproductionBlindError(
          `${addr}: a seed row at or after the cut`,
        );
      if (row.timestamp < LAUNCH) continue;
      const coin =
        coins.byIid.get(row.instrument_id)?.name ??
        kd.markets.get(row.instrument_id)?.symbol ??
        `instrument ${row.instrument_id}`;
      for (const text of toLines(addr, row, coin)) {
        lines += 1;
        const rec = parseRecord(parseLine(text));
        if (rec === null) {
          failed += 1;
          continue;
        }
        const c = countedOf(rec, coins);
        if (c !== null) counted.push(c);
      }
      if (small.has(row.instrument_id) && isForced(row)) {
        const liq = liqOf(row, addr);
        market1.push({
          ...liq,
          iid: coins.byIid.get(row.instrument_id)!.assetId,
          method: row.order_id === "0" ? "backstop" : "market",
        });
      }
    }
  }
  counted.sort(byM4);
  market1.sort(byM4);
  const [pool] = bySlice(counted, 1);
  const entries = waveEntries(pool!).map((e) => e.fill as Counted);
  const market1Entries = waveEntries(market1).map((e) => e.fill as Counted);
  const methods = (fs: readonly Counted[]) =>
    Object.fromEntries(
      ["market", "backstop"].map((m) => [
        m,
        fs.filter((f) => f.method === m).length,
      ]),
    );
  return {
    lines,
    failed,
    counted: counted.length,
    countedByMethod: methods(counted),
    sameFillsAsMarket1:
      counted.map(key).join("\n") === market1.map(key).join("\n"),
    entries: entries.length,
    entriesByMethod: methods(entries),
    days: new Set(entries.map((e) => dayOf(e.t))).size,
    coins: new Set(entries.map((e) => e.iid)).size,
    sells: entries.filter((e) => e.side === -1).length,
    buys: entries.filter((e) => e.side === 1).length,
    sameEntriesAsMarket1:
      entries.map(key).join("\n") === market1Entries.map(key).join("\n"),
    market1: { counted: market1.length, entries: market1Entries.length },
  };
}

export type Report = ReturnType<typeof reproduce>;
