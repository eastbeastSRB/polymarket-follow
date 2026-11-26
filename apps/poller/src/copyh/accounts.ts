/**
 * Who, and how an account's rows are read (copyh/rules.md C2, C3).
 * - Every account of Hyperliquid's main perp dex: every `user` of the step's
 *   stores, lower-cased (a store's dictionary holds the parsed, lower-cased
 *   addresses), each address alone, with no linking.
 * - Left out, named and counted: the protocol vault's accounts. For a
 *   reading whose END is END_k, every account with a kept record of kind
 *   `vault` ("Net Child Vaults") in [ARCHIVE_START, END_k): the union of the
 *   lists that the reading's stores counted (`vaultsOf`).
 * - A bucket's accounts across the step's stores (E, then S, then FRESH-2,
 *   joined by address), each account's rows in the store's order: its stores
 *   in time order, each store's months in order, rows by `time`, ties in the
 *   pass's order. Every file is held to its manifest line (`Store.bytes`),
 *   no partition at or after the seal's end is opened, and every row made is
 *   checked by its store's seal (`checkInstant`). The bucket's partitions
 *   that a window touches are held as columns; an account's rows are made on
 *   demand, one account at a time, as normalize.ts's `Row` with its trade's
 *   market reading.
 */
import type { Values } from "../polish/tables.js";
import { kindOf, type DirKind } from "./dirs.js";
import type { Row } from "./normalize.js";
import { monthBounds } from "./range.js";
import { StoreError } from "./run.js";
import { checkInstant } from "./seal.js";
import { USERS_FILE, bucketKey, type Partition, type Store } from "./store.js";
import { MARKET, OWN_LIQUIDATION, TAKER } from "./writers.js";

/** One kept record of an account: normalize.ts's `Row` and its trade's market reading (C3; C10's removal reads market trades only). */
export type AccountRow = Row & { readonly market: boolean };

/** What the reader takes of a store. */
export type FillsSource = Pick<
  Store,
  "manifest" | "column" | "bytes" | "names" | "seal"
>;

/** C2: the vault accounts of a reading, the union of its stores' own lists. */
export const vaultsOf = (
  stores: readonly Pick<Store, "manifest">[],
): Set<string> => new Set(stores.flatMap((s) => s.manifest.counts.vaults));

const TWO_32 = 4_294_967_296;
/** A u64's digits from its halves, low first (a value below 2^53 by its double, else by BigInt). */
export const digitsOf = (lo: number, hi: number): string =>
  hi < 2_097_152
    ? String(hi * TWO_32 + lo)
    : ((BigInt(hi) << 32n) | BigInt(lo)).toString();

type Columns = {
  readonly user: Uint32Array;
  readonly time: Float64Array;
  readonly iid: Uint16Array;
  readonly px: Float64Array;
  readonly sz: Float64Array;
  readonly side: Int8Array;
  readonly startPosition: Float64Array;
  readonly oid: Uint32Array;
  readonly tid: Uint32Array;
  readonly flags: Uint8Array;
  readonly dir: Uint8Array;
};

/** A partition's columns of the kinds part.ts's FILLS writes; another kind or length is refused (our own file). */
function columnsOf(store: FillsSource, p: Partition): Columns {
  const col = <T extends Values>(
    name: string,
    kind: { readonly prototype: T },
    per = 1,
  ): T => {
    const v = store.column(p, name);
    if (
      Object.getPrototypeOf(v) !== kind.prototype ||
      v.length !== p.rows * per
    )
      throw new StoreError(
        `${p.table}/${p.key}/${p.month}: its ${name} column is not of its kind or length`,
      );
    return v as T;
  };
  return {
    user: col("user", Uint32Array),
    time: col("time", Float64Array),
    iid: col("iid", Uint16Array),
    px: col("px", Float64Array),
    sz: col("sz", Float64Array),
    side: col("side", Int8Array),
    startPosition: col("startPosition", Float64Array),
    oid: col("oid", Uint32Array, 2),
    tid: col("tid", Uint32Array, 2),
    flags: col("flags", Uint8Array),
    dir: col("dir", Uint8Array),
  };
}

/** One account's rows in one partition: [lo, hi) of its columns. */
type Segment = {
  readonly cols: Columns;
  readonly lo: number;
  readonly hi: number;
  readonly kinds: readonly DirKind[];
  readonly store: FillsSource;
};

/** The first row of [lo, hi) whose time is at least t (times ascend there). */
function lowerBound(time: Float64Array, lo: number, hi: number, t: number) {
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (time[mid]! < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** One account of a bucket: its address and its rows in the windows asked. */
export type AccountView = {
  readonly addr: string;
  /** Its rows with `time` in [from, to). */
  count(from: number, to: number): number;
  /** Its rows with `time` in [from, to), in the store's order. */
  rows(from: number, to: number): AccountRow[];
};

function viewOf(addr: string, segments: readonly Segment[]): AccountView {
  return {
    addr,
    count(from, to) {
      let n = 0;
      for (const s of segments)
        n +=
          lowerBound(s.cols.time, s.lo, s.hi, to) -
          lowerBound(s.cols.time, s.lo, s.hi, from);
      return n;
    },
    rows(from, to) {
      const out: AccountRow[] = [];
      for (const s of segments) {
        const c = s.cols;
        const end = lowerBound(c.time, s.lo, s.hi, to);
        for (let i = lowerBound(c.time, s.lo, s.hi, from); i < end; i++) {
          const time = c.time[i]!;
          checkInstant(time, `${addr}'s fill`, s.store.seal);
          const flags = c.flags[i]!;
          out.push({
            time,
            iid: c.iid[i]!,
            px: c.px[i]!,
            sz: c.sz[i]!,
            side: c.side[i]!,
            startPosition: c.startPosition[i]!,
            oid: digitsOf(c.oid[2 * i]!, c.oid[2 * i + 1]!),
            tid: digitsOf(c.tid[2 * i]!, c.tid[2 * i + 1]!),
            crossed: (flags & TAKER) !== 0,
            ownLiquidation: (flags & OWN_LIQUIDATION) !== 0,
            dirKind: s.kinds[c.dir[i]!]!,
            market: (flags & MARKET) !== 0,
          });
        }
      }
      return out;
    },
  };
}

/**
 * A bucket's accounts across the step's stores, in address order, the
 * partitions overlapping [from, to) held as columns. The stores come in time
 * order (each one's window after the one before); `kinds` is dirs.json's.
 */
export function readBucket(
  stores: readonly FillsSource[],
  bucket: number,
  window: { readonly from: number; readonly to: number },
  kinds: ReadonlyMap<string, DirKind>,
): AccountView[] {
  stores.forEach((s, i) => {
    const before = stores[i - 1];
    if (before !== undefined && before.manifest.end > s.manifest.start)
      throw new StoreError(
        `the stores ${before.manifest.range} and ${s.manifest.range} are not in time order`,
      );
  });
  const segments = new Map<string, Segment[]>();
  for (const store of stores) {
    const m = store.manifest;
    const parts = m.partitions
      .filter(
        (p) =>
          p.table === "fills" &&
          p.key === bucketKey(bucket) &&
          p.start < window.to &&
          Math.min(monthBounds(p.month)[1], m.end) > window.from,
      )
      .sort((a, b) => a.start - b.start);
    if (parts.length === 0) continue;
    const dirKinds = store.names().dirs.map((d) => kindOf(kinds, d));
    const dict = store.bytes(USERS_FILE, m.dict.users.file);
    const addrs = new Map<number, string>();
    const addrOf = (u: number) => {
      let a = addrs.get(u);
      if (a === undefined) {
        if (u >= m.dict.users.count)
          throw new StoreError(`${m.range}: a user index past its dictionary`);
        a = `0x${dict.toString("hex", 20 * u, 20 * u + 20)}`;
        addrs.set(u, a);
      }
      return a;
    };
    for (const p of parts) {
      checkInstant(p.start, `${p.table}/${p.key}/${p.month}`, store.seal);
      const cols = columnsOf(store, p);
      for (let lo = 0; lo < p.rows;) {
        const u = cols.user[lo]!;
        let hi = lo + 1;
        for (; hi < p.rows && cols.user[hi] === u; hi++)
          if (cols.time[hi]! < cols.time[hi - 1]!)
            throw new StoreError(
              `${p.table}/${p.key}/${p.month}: an account's rows out of time order`,
            );
        if (hi < p.rows && cols.user[hi]! < u)
          throw new StoreError(
            `${p.table}/${p.key}/${p.month}: rows not in account order`,
          );
        const a = addrOf(u);
        const list = segments.get(a) ?? [];
        list.push({ cols, lo, hi, kinds: dirKinds, store });
        segments.set(a, list);
        lo = hi;
      }
    }
  }
  return [...segments.keys()]
    .sort()
    .map((addr) => viewOf(addr, segments.get(addr)!));
}
