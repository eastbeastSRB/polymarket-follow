/**
 * WAVE-H's counted fills (rules.md H4) and its SIZING and TEST parts (H1),
 * read from the store's liq table (the polishing plan 4.5; decisions
 * 2026-11-17, the plan approved): a 38-coin record whose `liquidation`
 * object names its own account, reducing, a taker's or a backstop's.
 * SIZING's come from the files dated before TEST's start, stamped before
 * it; TEST's from the later files, stamped from TEST's start to DATA END; a
 * later file's fill stamped before TEST's start is in neither part. With
 * them, WAVE-H's count of the 38 coins' liquidation legs by month, kind and
 * method. Each list in MARKET-1's M4 order, as WAVE-H's.
 */
import { byM4 } from "../market1/fills.js";
import type { Coins } from "../waveh/coins.js";
import type { Counted } from "../waveh/fills.js";
import { DATA_END, TEST_START, monthOf } from "../waveh/instants.js";
import { keyDate } from "../waveh/keys.js";
import type { FileCounts, Store } from "./store.js";
import { NONE } from "./writers.js";

/** A u64 column's row (its halves, low first) as its digits. */
export const digitsOf = (halves: Uint32Array, i: number): string =>
  ((BigInt(halves[2 * i + 1]!) << 32n) | BigInt(halves[2 * i]!)).toString();

/** Whether an input file is SIZING's (dated before TEST's start), and the bound of the records WAVE-H used from it. */
export function boundOf(f: Pick<FileCounts, "key">): {
  sizing: boolean;
  until: number;
} {
  const sizing = keyDate(f.key)! < TEST_START;
  return { sizing, until: sizing ? TEST_START : DATA_END };
}

export type CountedSet = {
  /** SIZING's counted fills, in M4's order. */
  sizing: Counted[];
  /** SIZING's and TEST's, in M4's order: WAVE-H's `counted`. */
  counted: Counted[];
  /** TEST files' counted fills stamped before TEST's start. */
  early: number;
  /** `<month>|<kind>|<method>` → the 38 coins' liquidation legs before their file's bound. */
  legs: Map<string, number>;
};

export function countedFrom(store: Store, coins: Coins): CountedSet {
  const users = store.users();
  const names = store.names();
  const bounds = store.files().map(boundOf);
  const backstop = names.methods.indexOf("backstop");
  const legs = new Map<string, number>();
  const sizing: Counted[] = [];
  const test: Counted[] = [];
  let early = 0;
  for (const p of store.manifest.partitions) {
    if (p.table !== "liq") continue;
    const col = (name: string) => store.column(p, name);
    const time = col("time") as Float64Array;
    const coin = col("coin") as Uint16Array;
    const user = col("user") as Uint32Array;
    const liqUser = col("liqUser") as Uint32Array;
    const side = col("side") as Int8Array;
    const crossed = col("crossed") as Uint8Array;
    const method = col("method") as Uint8Array;
    const start = col("startPosition") as Float64Array;
    const tid = col("tid") as Uint32Array;
    const file = col("file") as Uint16Array;
    for (let i = 0; i < p.rows; i++) {
      const c = coins.byName.get(names.coins[coin[i]!]!);
      if (c === undefined) continue;
      const t = time[i]!;
      const b = bounds[file[i]!]!;
      if (t >= b.until) continue;
      const kind =
        liqUser[i] === NONE
          ? "no liquidatedUser"
          : liqUser[i] !== user[i]
            ? "counterparty"
            : Math.sign(start[i]!) !== -side[i]!
              ? "not reducing"
              : crossed[i] !== 1 && method[i] !== backstop
                ? "neither crossed nor backstop"
                : "counted";
      const m = names.methods[method[i]!]!;
      const key = `${monthOf(t)}|${kind}|${m}`;
      legs.set(key, (legs.get(key) ?? 0) + 1);
      if (kind !== "counted") continue;
      const f: Counted = {
        t,
        iid: c.assetId,
        addr: users[user[i]!]!,
        side: side[i]! > 0 ? 1 : -1,
        tid: digitsOf(tid, i),
        method: m,
      };
      if (b.sizing) sizing.push(f);
      else if (t >= TEST_START) test.push(f);
      else early += 1;
    }
  }
  sizing.sort(byM4);
  return { sizing, counted: [...sizing, ...test].sort(byM4), early, legs };
}
