/**
 * G6's sample days (the polishing plan 4.5, its review's F9; decisions
 * 2026-11-18, EXTRACT-REVIEW's findings, M2 and Q6): a day's numbers from
 * the store, and the same day re-read from the raw files by WAVE-H's own
 * readers, compared cell by cell: the 38 coins' tape (rows, Σ tid, Σ px·sz),
 * the 40 coins' nine bars and ten contexts minute by minute, and every
 * column of every liq row.
 */
import { isDeepStrictEqual } from "node:util";
import { byM4 } from "../market1/fills.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../schedule.js";
import { parseRecord, rawRecords, type Rec } from "../waveh/fills.js";
import { DATA_END, monthOf } from "../waveh/instants.js";
import { ctxsKey, fillKeys, formatOf } from "../waveh/keys.js";
import { linesOf, readLz4 } from "../waveh/store.js";
import { digitsOf } from "./counted.js";
import { CONTEXT } from "./ctxs.js";
import type { GatesInput } from "./gates.js";
import { NONE } from "./writers.js";

/** The minute table's nine bars, as the merge writes them. */
const BARS = [
  "trades",
  "buyNtl",
  "sellNtl",
  "backstopNtl",
  "last",
  "high",
  "low",
  "liqBuyNtl",
  "liqSellNtl",
] as const;

/** A liq row as G6 compares it: names and addresses as text, ids as digits. */
type LiqRow = {
  time: number;
  block: number;
  coin: string;
  user: string;
  liqUser: string | null;
  side: number;
  crossed: number;
  method: string;
  dir: string;
  px: number;
  sz: number;
  markPx: number;
  startPosition: number;
  fee: number;
  closedPnl: number;
  tid: string;
  oid: string;
  file: number;
};
const LIQ_COLUMNS: readonly (keyof LiqRow)[] = [
  "time",
  "block",
  "coin",
  "user",
  "liqUser",
  "side",
  "crossed",
  "method",
  "dir",
  "px",
  "sz",
  "markPx",
  "startPosition",
  "fee",
  "closedPnl",
  "tid",
  "oid",
  "file",
];

type Columns = Record<string, ArrayLike<number>>;

/** A sample day's numbers: the 38 coins' tape (rows, Σ tid mod 2^64, Σ px·sz in H8's order); the 40 coins' bars and contexts, each column minute by minute; every liq row of the day, in the store's order. */
export type DayNumbers = {
  tape: Record<string, [number, string, number]>;
  bars: Record<string, Columns>;
  ctxs: Record<string, Columns>;
  liq: LiqRow[];
};

const U64 = 2n ** 64n;
const tidSum = (tids: Iterable<bigint>) => {
  let s = 0n;
  for (const t of tids) s = (s + t) % U64;
  return s.toString();
};
const total = (a: ArrayLike<number>) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]!;
  return s;
};
const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);
/** The store's liq order: time, coin, account, `tid`, the input file's. */
const liqOrder = (a: LiqRow, b: LiqRow) =>
  a.time - b.time ||
  byText(a.coin, b.coin) ||
  byText(a.user, b.user) ||
  (a.tid === b.tid ? 0 : BigInt(a.tid) < BigInt(b.tid) ? -1 : 1) ||
  a.file - b.file;
/** The minutes of a sample day in the grid: 1,440, or fewer on the day DATA END cuts. */
const minutesOf = (day: number) =>
  (Math.min(day + DAY_MS, DATA_END) - day) / MINUTE_MS;

/** A sample day from the store. */
export function dayFromStore(o: GatesInput, day: number): DayNumbers {
  const month = monthOf(day);
  const end = day + DAY_MS;
  const minutes = minutesOf(day);
  const out: DayNumbers = { tape: {}, bars: {}, ctxs: {}, liq: [] };
  const inDay = (time: Float64Array) => {
    const rows: number[] = [];
    for (let i = 0; i < time.length; i++)
      if (time[i]! >= day && time[i]! < end) rows.push(i);
    return rows;
  };
  for (const c of o.coins.list) {
    const p = o.store.partition("tape", c.name, month);
    const px = o.store.column(p, "px") as Float64Array;
    const sz = o.store.column(p, "sz") as Float64Array;
    const tid = o.store.column(p, "tid") as Uint32Array;
    const rows = inDay(o.store.column(p, "time") as Float64Array);
    let ntl = 0;
    for (const i of rows) ntl += px[i]! * sz[i]!;
    out.tape[c.name] = [
      rows.length,
      tidSum(rows.map((i) => BigInt(digitsOf(tid, i)))),
      ntl,
    ];
  }
  for (const coin of o.forty) {
    const p = o.store.partition("minute", coin, month);
    const off = (day - p.start) / MINUTE_MS;
    const columns = (names: readonly string[]) =>
      Object.fromEntries(
        names.map((n) => [
          n,
          o.store.column(p, n).subarray(off, off + minutes),
        ]),
      );
    out.bars[coin] = columns(BARS);
    out.ctxs[coin] = columns(CONTEXT.map(([n]) => n));
  }
  const p = o.store.partition("liq", null, month);
  const col = (name: string) => o.store.column(p, name);
  const time = col("time") as Float64Array;
  const [block, px, sz, markPx, startPosition, fee, closedPnl] = [
    "block",
    "px",
    "sz",
    "markPx",
    "startPosition",
    "fee",
    "closedPnl",
  ].map(col) as Float64Array[];
  const [coin, file] = ["coin", "file"].map(col) as Uint16Array[];
  const [user, liqUser, tid, oid] = ["user", "liqUser", "tid", "oid"].map(
    col,
  ) as Uint32Array[];
  const [method, dir, crossed] = ["method", "dir", "crossed"].map(
    col,
  ) as Uint8Array[];
  const side = col("side") as Int8Array;
  const users = o.store.users();
  const names = o.store.names();
  for (const i of inDay(time))
    out.liq.push({
      time: time[i]!,
      block: block![i]!,
      coin: names.coins[coin![i]!]!,
      user: users[user![i]!]!,
      liqUser: liqUser![i] === NONE ? null : users[liqUser![i]!]!,
      side: side[i]!,
      crossed: crossed![i]!,
      method: names.methods[method![i]!]!,
      dir: names.dirs[dir![i]!]!,
      px: px![i]!,
      sz: sz![i]!,
      markPx: markPx![i]!,
      startPosition: startPosition![i]!,
      fee: fee![i]!,
      closedPnl: closedPnl![i]!,
      tid: digitsOf(tid!, i),
      oid: digitsOf(oid!, i),
      file: file![i]!,
    });
  return out;
}

type Taken = {
  t: number;
  iid: number;
  addr: string;
  side: 1 | -1;
  tid: string;
  px: number;
  n: number;
  backstop: boolean;
};

const LONG_ID = /"(?:tid|oid)":\s*\d{16}/;
/** A line as JSON, a `tid` or `oid` of 16 digits or more kept as its digits: G6's own (WAVE-H's `parseLine` keeps the `tid` alone), apart from the pass's. */
const parseIds = (text: string): unknown =>
  LONG_ID.test(text)
    ? JSON.parse(
        text,
        (key: string, value: unknown, context?: { source?: string }) =>
          (key === "tid" || key === "oid") &&
          typeof value === "number" &&
          typeof context?.source === "string"
            ? context.source
            : value,
      )
    : JSON.parse(text);

/** A record of a liquidation as a liq row; `closedPnl`, `oid` and `dir` read from the record as it is (the store refuses one that lacks them, and G0 sees that). */
function liqRowOf(
  rec: Rec,
  raw: unknown,
  block: number | null,
  file: number,
): LiqRow {
  const f = rec.fill;
  const liq = f.liquidation!;
  const more = (raw as unknown[])[1] as Record<string, unknown>;
  return {
    time: f.time,
    block: block ?? NaN,
    coin: f.coin,
    user: rec.user,
    liqUser: liq.liquidatedUser?.toLowerCase() ?? null,
    side: f.side === "B" ? 1 : -1,
    crossed: f.crossed ? 1 : 0,
    method: liq.method,
    dir: String(more.dir),
    px: Number(f.px),
    sz: Number(f.sz),
    markPx: Number(liq.markPx),
    startPosition: Number(f.startPosition),
    fee: Number(f.fee),
    closedPnl: Number(more.closedPnl),
    tid: f.tid,
    oid: String(more.oid),
    file,
  };
}

/**
 * A sample day re-read from WAVE-H's raw store by its own readers (lz4js,
 * `JSON.parse` of every line, its schema), independent of the pass: the
 * day's files and an hour's either side, each record of the day once by
 * account and `tid`, the first file's; the takers in H8's order and liq in
 * the store's, so every sum is made in the store's order.
 */
export async function dayFromRaw(
  o: GatesInput,
  day: number,
): Promise<{ numbers: DayNumbers; records: number; twice: number }> {
  const end = Math.min(day + DAY_MS, DATA_END);
  const minutes = minutesOf(day);
  const forty = new Set(o.forty);
  const seen = new Set<string>();
  const takers = new Map<string, Taken[]>(o.forty.map((c) => [c, []]));
  const liq: LiqRow[] = [];
  let records = 0;
  let twice = 0;
  for (const key of fillKeys(day - HOUR_MS, day + DAY_MS + HOUR_MS)) {
    await o.pace();
    const file = o.fill.indexOf(key);
    for (const line of linesOf(readLz4(o.gate, o.raw, o.list, key))) {
      let raw: ReturnType<typeof rawRecords>;
      try {
        raw = rawRecords(formatOf(key), parseIds(line));
      } catch {
        raw = null;
      }
      for (const r of raw?.records ?? []) {
        const rec = parseRecord(r);
        if (rec === null) continue;
        const f = rec.fill;
        if (f.time < day || f.time >= end) continue;
        records += 1;
        const isLiq = f.liquidation !== undefined;
        const isTaker = f.crossed && forty.has(f.coin);
        if (!isLiq && !isTaker) continue;
        const k = `${rec.user}|${f.tid}`;
        if (seen.has(k)) {
          twice += 1;
          continue;
        }
        seen.add(k);
        if (isLiq) liq.push(liqRowOf(rec, r, raw!.block, file));
        if (isTaker)
          takers.get(f.coin)!.push({
            t: f.time,
            iid: 0,
            addr: rec.user,
            side: f.side === "B" ? 1 : -1,
            tid: f.tid,
            px: Number(f.px),
            n: Number(f.px) * Number(f.sz),
            backstop: f.liquidation?.method === "backstop",
          });
      }
    }
  }
  for (const list of takers.values()) list.sort(byM4);
  liq.sort(liqOrder);
  const out: DayNumbers = {
    tape: {},
    bars: {},
    ctxs: ctxsFromRaw(o, day, minutes),
    liq,
  };
  for (const c of o.coins.list) {
    const list = takers.get(c.name)!;
    out.tape[c.name] = [
      list.length,
      tidSum(list.map((r) => BigInt(r.tid))),
      total(list.map((r) => r.n)),
    ];
  }
  for (const coin of o.forty) {
    const b = Object.fromEntries(
      BARS.map((n) => [
        n,
        new Float64Array(minutes).fill(
          n === "last" || n === "high" || n === "low" ? NaN : 0,
        ),
      ]),
    ) as Record<(typeof BARS)[number], Float64Array>;
    for (const r of takers.get(coin)!) {
      const k = Math.floor((r.t - day) / MINUTE_MS);
      if (r.backstop) {
        b.backstopNtl[k] = b.backstopNtl[k]! + r.n;
        continue;
      }
      b.trades[k] = b.trades[k]! + 1;
      if (r.side > 0) b.buyNtl[k] = b.buyNtl[k]! + r.n;
      else b.sellNtl[k] = b.sellNtl[k]! + r.n;
      b.last[k] = r.px;
      if (!(b.high[k]! >= r.px)) b.high[k] = r.px;
      if (!(b.low[k]! <= r.px)) b.low[k] = r.px;
    }
    // The liq bars: an account's own reducing leg, a taker's or a backstop's, in liq's order.
    for (const l of liq) {
      if (
        l.coin !== coin ||
        l.liqUser === null ||
        l.liqUser !== l.user ||
        Math.sign(l.startPosition) !== -l.side ||
        !(l.crossed === 1 || l.method === "backstop")
      )
        continue;
      const k = Math.floor((l.time - day) / MINUTE_MS);
      const n = l.px * l.sz;
      if (l.side > 0) b.liqBuyNtl[k] = b.liqBuyNtl[k]! + n;
      else b.liqSellNtl[k] = b.liqSellNtl[k]! + n;
    }
    out.bars[coin] = b;
  }
  return { numbers: out, records, twice };
}

const TIME = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/;

/** The day's minutes of the 40 coins from the `asset_ctxs` files of the day and a day either side, in day order: each minute's row the latest stamped in (m, m + 1 min], the first of one stamp, a row whose time or mark fails not taken; each column minute by minute, NaN where no row or no number. */
function ctxsFromRaw(
  o: GatesInput,
  day: number,
  minutes: number,
): DayNumbers["ctxs"] {
  const rows = new Map<string, ({ t: number; values: number[] } | undefined)[]>(
    o.forty.map((c) => [c, new Array<undefined>(minutes).fill(undefined)]),
  );
  for (const d of [day - DAY_MS, day, day + DAY_MS]) {
    if (d < o.store.manifest.minuteStart || d >= DATA_END) continue;
    const lines = Buffer.from(readLz4(o.gate, o.raw, o.list, ctxsKey(d)))
      .toString("utf8")
      .split("\n");
    const head = lines[0]!.split(",");
    const [iTime, iCoin, iMark] = ["time", "coin", "mark_px"].map((c) =>
      head.indexOf(c),
    ) as [number, number, number];
    const at = CONTEXT.map(([, csv]) => head.indexOf(csv));
    for (const line of lines.slice(1)) {
      const cells = line.split(",");
      const kept = rows.get(cells[iCoin] ?? "");
      if (kept === undefined || cells.length !== head.length) continue;
      const mark = Number(cells[iMark]);
      if (!TIME.test(cells[iTime]!) || !(mark > 0 && Number.isFinite(mark)))
        continue;
      const t = Date.parse(cells[iTime]!);
      const k = Math.ceil((t - day) / MINUTE_MS) - 1;
      if (t >= DATA_END || k < 0 || k >= minutes) continue;
      if (kept[k] !== undefined && t <= kept[k].t) continue;
      kept[k] = {
        t,
        values: at.map((i) => {
          const s = cells[i]!;
          return s.length > 0 && Number.isFinite(Number(s)) ? Number(s) : NaN;
        }),
      };
    }
  }
  return Object.fromEntries(
    o.forty.map((coin) => {
      const kept = rows.get(coin)!;
      return [
        coin,
        Object.fromEntries(
          CONTEXT.map(([name], j) => [
            name,
            Float64Array.from(kept, (r) => r?.values[j] ?? NaN),
          ]),
        ),
      ];
    }),
  );
}

/** Where a day's numbers from the store and from the raw files differ: each named by its table, coin and column, with how many cells and the first. */
export function compareDay(
  mine: DayNumbers,
  raw: DayNumbers,
  day: number,
): string[] {
  const out: string[] = [];
  const keys = (a: object, b: object) =>
    [...new Set([...Object.keys(a), ...Object.keys(b)])].sort();
  /** The minutes two columns differ in, by Object.is (NaN equals NaN); a column read on one side only differs everywhere. */
  const minutes = (
    what: string,
    x: ArrayLike<unknown> | undefined,
    y: ArrayLike<unknown> | undefined,
  ) => {
    const length = Math.max(x?.length ?? 0, y?.length ?? 0);
    let n = 0;
    let first = -1;
    for (let k = 0; k < length; k++)
      if (
        x === undefined ||
        y === undefined ||
        x.length !== y.length ||
        !Object.is(x[k], y[k])
      ) {
        n += 1;
        if (first < 0) first = k;
      }
    if (n > 0)
      out.push(
        `${what}: ${n} of ${length} minutes differ, the first at ${new Date(day + first * MINUTE_MS).toISOString()}`,
      );
  };
  for (const coin of keys(mine.tape, raw.tape))
    if (!isDeepStrictEqual(mine.tape[coin], raw.tape[coin]))
      out.push(`tape ${coin}`);
  for (const part of ["bars", "ctxs"] as const)
    for (const coin of keys(mine[part], raw[part])) {
      const a = mine[part][coin] ?? {};
      const b = raw[part][coin] ?? {};
      for (const name of keys(a, b))
        minutes(`${part} ${coin} ${name}`, a[name], b[name]);
    }
  if (mine.liq.length !== raw.liq.length)
    out.push(`liq: ${mine.liq.length} rows, ${raw.liq.length} re-read`);
  else
    for (const name of LIQ_COLUMNS) {
      let n = 0;
      let first = -1;
      mine.liq.forEach((r, j) => {
        if (!Object.is(r[name], raw.liq[j]![name])) {
          n += 1;
          if (first < 0) first = j;
        }
      });
      if (n > 0)
        out.push(
          `liq ${name}: ${n} of ${mine.liq.length} rows differ, the first row ${first}`,
        );
    }
  return out;
}
