/**
 * The forced fills (WAVE-H's rules.md H4, with each input file's bound as
 * `countedFrom` reads it) of every coin of the store's liq table, for the
 * tries that read more than a counted fill carries (POLISH-EXPLORE's plan 2
 * (5); decisions 2026-11-18, "POLISH-EXPLORE's plan approved"): every coin's
 * forced fills with their account, side and method (N5, N10), and the 38
 * small coins' px, sz and markPx in `countedFrom`'s order (W5, N2, N9), held
 * to its counted fills fill for fill.
 */
import type { Coins } from "../../waveh/coins.js";
import type { Counted } from "../../waveh/fills.js";
import { TEST_START } from "../../waveh/instants.js";
import { boundOf, digitsOf } from "../counted.js";
import { GateFailed } from "../run.js";
import type { Store } from "../store.js";
import { NONE } from "../writers.js";

export type Forced = {
  /** Every coin's forced fills, in the store's order: the instant, the coin (an index of `coins`), the account (of the store's users), the forced side and whether a backstop's. */
  t: Float64Array;
  coin: Uint16Array;
  user: Uint32Array;
  side: Int8Array;
  backstop: Uint8Array;
  coins: readonly string[];
  /** The 38 small coins' counted fills' px, sz and markPx: row i is `countedFrom`'s counted fill i. */
  px: Float64Array;
  sz: Float64Array;
  markPx: Float64Array;
};

/** The forced fills; `counted` is `countedFrom`'s, and the 38 coins' rows must be it, fill for fill, else the check fails (exit 6). */
export function forcedFrom(
  store: Store,
  coins: Coins,
  counted: readonly Counted[],
): Forced {
  const users = store.users();
  const names = store.names();
  const bounds = store.files().map(boundOf);
  const backstop = names.methods.indexOf("backstop");
  const assetOf = names.coins.map((n) => coins.byName.get(n)?.assetId ?? -1);
  const all = { t: [] as number[], coin: [] as number[], user: [] as number[] };
  const side: number[] = [];
  const isBackstop: number[] = [];
  // The 38 coins' rows: the store's index of each, then what M4's order and the check read.
  const small = {
    t: [] as number[],
    iid: [] as number[],
    user: [] as number[],
    side: [] as number[],
    hi: [] as number[],
    lo: [] as number[],
    method: [] as number[],
    px: [] as number[],
    sz: [] as number[],
    markPx: [] as number[],
  };
  for (const p of store.manifest.partitions) {
    if (p.table !== "liq") continue;
    const col = (name: string) => store.column(p, name);
    const time = col("time") as Float64Array;
    const coin = col("coin") as Uint16Array;
    const user = col("user") as Uint32Array;
    const liqUser = col("liqUser") as Uint32Array;
    const s = col("side") as Int8Array;
    const crossed = col("crossed") as Uint8Array;
    const method = col("method") as Uint8Array;
    const start = col("startPosition") as Float64Array;
    const px = col("px") as Float64Array;
    const sz = col("sz") as Float64Array;
    const markPx = col("markPx") as Float64Array;
    const tid = col("tid") as Uint32Array;
    const file = col("file") as Uint16Array;
    for (let i = 0; i < p.rows; i++) {
      const t = time[i]!;
      const b = bounds[file[i]!]!;
      if (t >= b.until || (!b.sizing && t < TEST_START)) continue;
      if (
        liqUser[i] === NONE ||
        liqUser[i] !== user[i] ||
        Math.sign(start[i]!) !== -s[i]! ||
        (crossed[i] !== 1 && method[i] !== backstop)
      )
        continue;
      all.t.push(t);
      all.coin.push(coin[i]!);
      all.user.push(user[i]!);
      side.push(s[i]! > 0 ? 1 : -1);
      isBackstop.push(method[i] === backstop ? 1 : 0);
      const iid = assetOf[coin[i]!]!;
      if (iid < 0) continue;
      small.t.push(t);
      small.iid.push(iid);
      small.user.push(user[i]!);
      small.side.push(s[i]! > 0 ? 1 : -1);
      small.lo.push(tid[2 * i]!);
      small.hi.push(tid[2 * i + 1]!);
      small.method.push(method[i]!);
      small.px.push(px[i]!);
      small.sz.push(sz[i]!);
      small.markPx.push(markPx[i]!);
    }
  }
  // M4's order (t, asset id, address, tid): an account's id is in its address's order.
  const order = Uint32Array.from(small.t, (_, i) => i).sort(
    (a, b) =>
      small.t[a]! - small.t[b]! ||
      small.iid[a]! - small.iid[b]! ||
      small.user[a]! - small.user[b]! ||
      small.hi[a]! - small.hi[b]! ||
      small.lo[a]! - small.lo[b]!,
  );
  const halves = new Uint32Array(2);
  const differ: string[] = [];
  if (order.length !== counted.length)
    differ.push(`${order.length} rows, ${counted.length} counted fills`);
  for (let i = 0; i < Math.min(order.length, counted.length); i++) {
    const k = order[i]!;
    const f = counted[i]!;
    halves[0] = small.lo[k]!;
    halves[1] = small.hi[k]!;
    if (
      f.t !== small.t[k] ||
      f.iid !== small.iid[k] ||
      f.addr !== users[small.user[k]!] ||
      f.side !== small.side[k] ||
      f.tid !== digitsOf(halves, 0) ||
      f.method !== names.methods[small.method[k]!]
    ) {
      differ.push(`counted fill ${i} (tid ${f.tid})`);
      break;
    }
  }
  if (differ.length > 0)
    throw new GateFailed(
      `the forced fills are not the counted fills: ${differ.join("; ")}`,
    );
  const pick = (a: readonly number[]) => Float64Array.from(order, (k) => a[k]!);
  return {
    t: Float64Array.from(all.t),
    coin: Uint16Array.from(all.coin),
    user: Uint32Array.from(all.user),
    side: Int8Array.from(side),
    backstop: Uint8Array.from(isBackstop),
    coins: names.coins,
    px: pick(small.px),
    sz: pick(small.sz),
    markPx: pick(small.markPx),
  };
}
