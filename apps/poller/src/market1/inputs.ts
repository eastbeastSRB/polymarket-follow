/**
 * MARKET-1's inputs (rules.md M2, M3, M8, M9), each behind the sealed gate:
 * the pool's fills as the paper experiment stores them (`state.json` first,
 * then each pool account's file, rows below its P), the collector's rule book
 * and the market objects (the kit's pre-cut panel joined with the paper
 * experiment's market-days). Every file is read whole by the paper
 * experiment's own frozen readers and schemas, and closed at once.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { DAY_MS } from "../schedule.js";
import { CUT } from "../paper/instants.js";
import {
  joinDays,
  loadPrecut,
  marketThrough,
  pinnedPanel,
} from "../paper/market.js";
import type { Market, Research } from "../paper/research.js";
import { readRuleBook } from "../paper/rulebook.js";
import { FOREVER, PaperStore, type Hole } from "../paper/store.js";
import { addAccount, emptyPoolFills, finish, type PoolFills } from "./fills.js";
import { checkDatum, checkSealed, type Gate } from "./gate.js";

const Population = z.object({
  accounts: z.array(z.object({ addr: z.string(), holdout: z.boolean() })),
});
const KitRuleBook = z.object({
  instruments: z.array(
    z.object({
      iid: z.number().int(),
      symbol: z.string(),
      category: z.string(),
    }),
  ),
});

/** The kit's own data (frozen with the kit): the pool (M2) and the markets with their symbols and categories. */
export function kitData(packageRoot: string) {
  const data = path.join(packageRoot, "research", "kit", "data");
  const pop = Population.parse(
    JSON.parse(readFileSync(path.join(data, "population.json"), "utf8")),
  );
  const rb = KitRuleBook.parse(
    JSON.parse(readFileSync(path.join(data, "rulebook.json"), "utf8")),
  );
  return {
    pool: pop.accounts
      .filter((a) => !a.holdout)
      .map((a) => a.addr.toLowerCase()),
    markets: new Map(
      rb.instruments.map((i) => [
        i.iid,
        { symbol: i.symbol, category: i.category },
      ]),
    ),
    pinned: pinnedPanel(path.join(packageRoot, "research")),
  };
}
export type KitData = ReturnType<typeof kitData>;

export type AccountRead = { P: number; holes: Hole[] };

/** A standing hole: the API does not know the account; nothing after its P will ever be read. */
export const standing = (a: AccountRead): boolean =>
  a.holes.some((h) => h.to === FOREVER);

/**
 * The pool's fills through `end` (M2): the paper experiment's state first,
 * then each pool account's rows with from ≤ timestamp < min(P, end), from
 * the cut (the rehearsal on the old weeks alone passes an earlier one). An
 * account the state does not hold yet adds nothing (its P is the cut).
 */
export function readPool(
  gate: Gate,
  paperRoot: string,
  kit: KitData,
  end: number,
  from = CUT,
): { fills: PoolFills; accounts: Map<string, AccountRead> } {
  checkSealed(gate, end, "the paper experiment's store");
  const store = new PaperStore(paperRoot);
  const state = store.readState();
  const crypto = new Set(
    [...kit.markets]
      .filter(([, m]) => m.category === "crypto")
      .map(([iid]) => iid),
  );
  const known = new Set(kit.markets.keys());
  const fills = emptyPoolFills();
  const accounts = new Map<string, AccountRead>();
  for (const addr of kit.pool) {
    const a = state.accounts[addr];
    if (a === undefined) {
      accounts.set(addr, { P: CUT, holes: [] });
      continue;
    }
    checkDatum(gate, a.P - 1, `${addr}'s read-through instant`);
    accounts.set(addr, { P: a.P, holes: a.holes });
    if (a.P <= from) continue;
    const rows = store.readRows(addr);
    addAccount(fills, addr, rows, from, Math.min(a.P, end), crypto, known);
  }
  return { fills: finish(fills), accounts };
}

/** The collector's rule-book documents (M3, M9; its database, read only). */
export async function ruleBookDocs(
  gate: Gate,
  end: number,
  uri: string,
  dbName: string,
): Promise<unknown[]> {
  checkSealed(gate, end, "the collector's rule book");
  return readRuleBook(uri, dbName);
}

/**
 * The market objects through `end` (M8): the kit's pre-cut panel (the paper
 * experiment's checked copy) joined with the market-days present, day after
 * day until the first missing one, built exactly as the kit's `marketFrom`.
 * A market without a pinned panel file has none (null).
 */
export function marketsThrough(
  gate: Gate,
  research: Research,
  paperRoot: string,
  pinned: ReadonlyMap<string, string>,
  end: number,
): (iid: number) => Market | null {
  checkSealed(gate, end, "the paper experiment's market-days");
  const store = new PaperStore(paperRoot);
  const built = new Map<number, Market | null>();
  return (iid) => {
    const known = built.get(iid);
    if (known !== undefined) return known;
    let mk: Market | null = null;
    if (pinned.has(`${iid}.json.gz`)) {
      const pre = loadPrecut(path.join(paperRoot, "panel-precut"), pinned, iid);
      // A pre-cut run lists no folder of the paper experiment's market-days.
      const present = pre.end < end ? store.marketDays(iid) : new Set<number>();
      const days = [];
      for (let d = pre.end; d < end && present.has(d); d += DAY_MS) {
        checkDatum(gate, d, `market ${iid}'s day`);
        days.push(store.readMarketDay(iid, d));
      }
      mk = marketThrough(research, joinDays(pre, days, end), end);
    }
    built.set(iid, mk);
    return mk;
  };
}
