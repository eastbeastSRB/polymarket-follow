/**
 * The pass's writers (copyh/rules.md C3, the store): one raw file's kept
 * records as the part holds them.
 * - **fills:** every kept record, both sides, in its account's bucket group
 *   (the address's last two hex digits are its bucket; sixteen buckets a
 *   group, so a merge unit reads one stretch of each part), in the file's
 *   order: the file-local account, `time`, iid, `px`, `sz`, side,
 *   `startPosition`, `oid` and `tid` (u64), flags, the `dir` and the
 *   liquidation method (file-local dictionaries). The trade's market
 *   reading (market-trades.ts) is set on both records of each trade the
 *   file pairs; a record left unpaired keeps its own and is listed, so that
 *   a trade split across two files next to each other is read after the
 *   pass.
 * - **bars:** each coin's minutes in the file, from its market-trade taker
 *   records (one a trade) taken in `time` order, ties in the file's: the
 *   trades, Σ sz, Σ px·sz, the last price (the latest in time), the
 *   opposite-side pairs at most PAIR_MS apart (|p_buy − p_sell| ÷ their mean,
 *   in the minute of the second), the taker records left out by cause, and
 *   the Settlement records' Σ sz and Σ px·sz (either side: the price every
 *   holder was paid, RM4); with the coin's first and last market taker, so
 *   that the merge joins a pair across files and refuses files out of time
 *   order.
 */
import { BACKSTOP_METHOD, BUCKETS, PAIR_MS, SETTLEMENT_DIR } from "./design.js";
import {
  TradePairs,
  isMarket,
  leftOutOf,
  type LeftOut,
} from "./market-trades.js";
import type { Sink } from "./scan.js";
import type { Rec } from "./schema.js";

/** A merge unit's buckets: sixteen a group. */
export const GROUP_BUCKETS = 16;
export const GROUPS = BUCKETS / GROUP_BUCKETS;

/** flags' bits. */
export const TAKER = 1;
export const OWN_LIQUIDATION = 2;
export const OTHER_LIQUIDATION = 4;
/** A `liquidation` object that names no account. */
export const UNNAMED_LIQUIDATION = 8;
export const BACKSTOP = 16;
/** The record's trade is a market trade (its taker's reading). */
export const MARKET = 32;

/** An address's bucket: its last two hex digits. */
export const bucketOf = (user: string): number =>
  Number.parseInt(user.slice(-2), 16);

/** Names numbered in the order of first use (a file's accounts, its dirs and methods). */
export class Names {
  readonly list: string[] = [];
  private readonly ids = new Map<string, number>();

  id(name: string): number {
    let i = this.ids.get(name);
    if (i === undefined) {
      i = this.list.length;
      this.list.push(name);
      this.ids.set(name, i);
    }
    return i;
  }
}

/** A whole number's digits as a u64's low and high 32-bit halves (the schema holds it below 2^64). */
export function u64Of(digits: string): readonly [number, number] {
  if (digits.length <= 15) {
    const n = Number(digits);
    return [n % 2 ** 32, Math.floor(n / 2 ** 32)];
  }
  const b = BigInt(digits);
  return [Number(b & 0xffffffffn), Number(b >> 32n)];
}

/** One bucket group's rows, a column each (`oid` and `tid` as their halves, two a row). */
export type GroupRows = {
  user: number[];
  time: number[];
  iid: number[];
  px: number[];
  sz: number[];
  side: number[];
  startPosition: number[];
  oid: number[];
  tid: number[];
  flags: number[];
  dir: number[];
  method: number[];
};
const emptyGroup = (): GroupRows => ({
  user: [],
  time: [],
  iid: [],
  px: [],
  sz: [],
  side: [],
  startPosition: [],
  oid: [],
  tid: [],
  flags: [],
  dir: [],
  method: [],
});

/** A record the file could not pair: its trade's key, its place, its side of the trade, its own reading. */
export type Unpaired = {
  iid: number;
  time: number;
  tid: string;
  group: number;
  row: number;
  taker: boolean;
  market: boolean;
};

/** A market taker as the bars take it. */
type Taker = {
  time: number;
  px: number;
  sz: number;
  side: number;
  order: number;
};

/** One coin's minutes in a file, from `start` (a minute's start), a column each. */
export type CoinBars = {
  iid: number;
  start: number;
  trades: number[];
  sz: number[];
  ntl: number[];
  /** The latest market taker's time and price in the minute (NaN when none). */
  lastTime: number[];
  last: number[];
  pairGap: number[];
  pairs: number[];
  leftBackstop: number[];
  leftAdl: number[];
  leftSettlement: number[];
  leftVault: number[];
  /** The Settlement records' Σ sz and Σ px·sz. */
  settleSz: number[];
  settleNtl: number[];
  /** The coin's first and last market taker in the file, in time order: [time, px, side]. */
  first: [number, number, number] | null;
  lastTaker: [number, number, number] | null;
};

const MINUTE_MS = 60_000;

/** The build's sink: a file's fills by bucket group, its trades paired, its bars by coin. */
export class Writers implements Sink {
  readonly users = new Names();
  readonly dirs = new Names();
  readonly methods = new Names();
  readonly groups: GroupRows[] = Array.from({ length: GROUPS }, emptyGroup);
  private readonly pairs = new TradePairs();
  private readonly takers = new Map<number, Taker[]>();
  private readonly left = new Map<number, [number, LeftOut][]>();
  private readonly settled = new Map<number, [number, number, number][]>();
  private order = 0;

  add(rec: Rec, iid: number): void {
    const f = rec.fill;
    const g = Math.floor(bucketOf(rec.user) / GROUP_BUCKETS);
    const rows = this.groups[g]!;
    const method = f.liquidation?.method ?? null;
    const named = f.liquidation?.liquidatedUser?.toLowerCase();
    const market = isMarket(method, f.dir);
    const flags =
      (f.crossed ? TAKER : 0) |
      (f.liquidation === undefined
        ? 0
        : named === undefined
          ? UNNAMED_LIQUIDATION
          : named === rec.user
            ? OWN_LIQUIDATION
            : OTHER_LIQUIDATION) |
      (method === BACKSTOP_METHOD ? BACKSTOP : 0) |
      (market ? MARKET : 0);
    const row = rows.time.length;
    const oid = u64Of(f.oid);
    const tid = u64Of(f.tid);
    rows.user.push(this.users.id(rec.user));
    rows.time.push(f.time);
    rows.iid.push(iid);
    rows.px.push(Number(f.px));
    rows.sz.push(Number(f.sz));
    rows.side.push(f.side === "B" ? 1 : -1);
    rows.startPosition.push(Number(f.startPosition));
    rows.oid.push(oid[0], oid[1]);
    rows.tid.push(tid[0], tid[1]);
    rows.flags.push(flags);
    rows.dir.push(this.dirs.id(f.dir));
    rows.method.push(method === null ? 0 : 1 + this.methods.id(method));
    this.pairs.add(TradePairs.keyOf(iid, f.time, f.tid), {
      at: [g, row],
      taker: f.crossed,
      market,
    });
    if (f.dir === SETTLEMENT_DIR) {
      const l = this.settled.get(iid) ?? [];
      l.push([f.time, Number(f.px), Number(f.sz)]);
      this.settled.set(iid, l);
    }
    if (!f.crossed) return;
    const why = leftOutOf(method, f.dir);
    if (why !== null) {
      const l = this.left.get(iid) ?? [];
      l.push([f.time, why]);
      this.left.set(iid, l);
      return;
    }
    const t = this.takers.get(iid) ?? [];
    t.push({
      time: f.time,
      px: Number(f.px),
      sz: Number(f.sz),
      side: f.side === "B" ? 1 : -1,
      order: this.order++,
    });
    this.takers.set(iid, t);
  }

  /** The file's end: each paired trade's reading set on both its records; the records left unpaired; the bars. */
  finish(): { unpaired: Unpaired[]; odd: string[]; bars: CoinBars[] } {
    for (const { at, market } of this.pairs.settled) {
      const rows = this.groups[at[0]]!;
      rows.flags[at[1]] =
        (rows.flags[at[1]]! & ~MARKET) | (market ? MARKET : 0);
    }
    const unpaired = this.pairs.unpaired().map(([key, w]) => {
      const [iid, time, tid] = key.split("|") as [string, string, string];
      return {
        iid: Number(iid),
        time: Number(time),
        tid,
        group: w.at[0],
        row: w.at[1],
        taker: w.taker,
        market: w.market,
      };
    });
    const coins = new Set([
      ...this.takers.keys(),
      ...this.left.keys(),
      ...this.settled.keys(),
    ]);
    const bars = [...coins]
      .sort((a, b) => a - b)
      .map((iid) =>
        barsOf(
          iid,
          this.takers.get(iid) ?? [],
          this.left.get(iid) ?? [],
          this.settled.get(iid) ?? [],
        ),
      );
    return { unpaired, odd: this.pairs.odd, bars };
  }
}

/** A coin's bars over the minutes its taker and Settlement records span. */
function barsOf(
  iid: number,
  takers: readonly Taker[],
  left: readonly (readonly [number, LeftOut])[],
  settled: readonly (readonly [number, number, number])[],
): CoinBars {
  const ts = [...takers].sort((a, b) => a.time - b.time || a.order - b.order);
  // A loop, not Math.min(...times): millions of arguments overflow the stack.
  let lo = Infinity;
  let hi = -Infinity;
  for (const t of [
    ...ts.map((x) => x.time),
    ...left.map((l) => l[0]),
    ...settled.map((x) => x[0]),
  ]) {
    if (t < lo) lo = t;
    if (t > hi) hi = t;
  }
  const m0 = Math.floor(lo / MINUTE_MS);
  const n = Math.floor(hi / MINUTE_MS) - m0 + 1;
  const zeros = () => new Array<number>(n).fill(0);
  const nans = () => new Array<number>(n).fill(NaN);
  const b: CoinBars = {
    iid,
    start: m0 * MINUTE_MS,
    trades: zeros(),
    sz: zeros(),
    ntl: zeros(),
    lastTime: nans(),
    last: nans(),
    pairGap: zeros(),
    pairs: zeros(),
    leftBackstop: zeros(),
    leftAdl: zeros(),
    leftSettlement: zeros(),
    leftVault: zeros(),
    settleSz: zeros(),
    settleNtl: zeros(),
    first: ts.length === 0 ? null : [ts[0]!.time, ts[0]!.px, ts[0]!.side],
    lastTaker:
      ts.length === 0
        ? null
        : [ts.at(-1)!.time, ts.at(-1)!.px, ts.at(-1)!.side],
  };
  ts.forEach((t, i) => {
    const k = Math.floor(t.time / MINUTE_MS) - m0;
    b.trades[k] = b.trades[k]! + 1;
    b.sz[k] = b.sz[k]! + t.sz;
    b.ntl[k] = b.ntl[k]! + t.px * t.sz;
    // Sorted by time, ties in the file's order: the latest is the last one met.
    b.lastTime[k] = t.time;
    b.last[k] = t.px;
    const p = ts[i - 1];
    if (p !== undefined && p.side !== t.side && t.time - p.time <= PAIR_MS) {
      b.pairGap[k] =
        b.pairGap[k]! + Math.abs(t.px - p.px) / ((t.px + p.px) / 2);
      b.pairs[k] = b.pairs[k]! + 1;
    }
  });
  for (const [t, why] of left) {
    const k = Math.floor(t / MINUTE_MS) - m0;
    const col =
      why === "backstop"
        ? b.leftBackstop
        : why === "adl"
          ? b.leftAdl
          : why === "settlement"
            ? b.leftSettlement
            : b.leftVault;
    col[k] = col[k]! + 1;
  }
  for (const [t, px, sz] of settled) {
    const k = Math.floor(t / MINUTE_MS) - m0;
    b.settleSz[k] = b.settleSz[k]! + sz;
    b.settleNtl[k] = b.settleNtl[k]! + px * sz;
  }
  return b;
}
