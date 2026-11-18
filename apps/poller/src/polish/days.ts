/**
 * G6's sample days (the polishing plan 4.5, its review's F9): a day's
 * numbers from the store, and the same day re-read from the raw files by
 * WAVE-H's own readers (decisions 2026-11-18, EXTRACT-REVIEW's findings,
 * Q6: apart from the gates).
 */
import { byM4 } from "../market1/fills.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../schedule.js";
import { parseLine, parseRecord, rawRecords } from "../waveh/fills.js";
import { DATA_END, monthOf } from "../waveh/instants.js";
import { ctxsKey, fillKeys, formatOf } from "../waveh/keys.js";
import { linesOf, readLz4 } from "../waveh/store.js";
import { digitsOf } from "./counted.js";
import { CONTEXT } from "./ctxs.js";
import type { GatesInput } from "./gates.js";
import { LARGE_COINS } from "./writers.js";

/** A sample day's numbers: the 38 coins' tape (rows, Σ tid mod 2^64, Σ px·sz); BTC's and ETH's bars (trades, buy, sell and the backstop's notional); liq (rows, Σ tid); the 40 coins' contexts (minutes, each column's sum and cells that are none). */
type DayNumbers = {
  tape: Record<string, [number, string, number]>;
  bars: Record<string, [number, number, number, number]>;
  liq: [number, string];
  ctxs: Record<string, (number | string)[]>;
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
/** A context column's day: the sum of its numbers and how many cells were none, as `<sum>|<none>`. */
const columnSum = (values: readonly number[]) => {
  let sum = 0;
  let none = 0;
  for (const v of values)
    if (Number.isNaN(v)) none += 1;
    else sum += v;
  return `${sum}|${none}`;
};

/** A sample day from the store. */
export function dayFromStore(o: GatesInput, day: number): DayNumbers {
  const month = monthOf(day);
  const end = day + DAY_MS;
  const out: DayNumbers = { tape: {}, bars: {}, liq: [0, "0"], ctxs: {} };
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
    const f64 = (name: string) =>
      (o.store.column(p, name) as Float64Array).subarray(off, off + 1440);
    if (LARGE_COINS.includes(coin))
      out.bars[coin] = [
        total(
          (o.store.column(p, "trades") as Uint32Array).subarray(
            off,
            off + 1440,
          ),
        ),
        total(f64("buyNtl")),
        total(f64("sellNtl")),
        total(f64("backstopNtl")),
      ];
    const mark = f64("mark");
    const marked: number[] = [];
    for (let k = 0; k < mark.length; k++)
      if (!Number.isNaN(mark[k]!)) marked.push(k);
    out.ctxs[coin] = [
      marked.length,
      ...CONTEXT.map(([name]) => {
        const v = f64(name);
        return columnSum(marked.map((k) => v[k]!));
      }),
    ];
  }
  const p = o.store.partition("liq", null, month);
  const tid = o.store.column(p, "tid") as Uint32Array;
  const rows = inDay(o.store.column(p, "time") as Float64Array);
  out.liq = [rows.length, tidSum(rows.map((i) => BigInt(digitsOf(tid, i))))];
  return out;
}

type Taken = {
  t: number;
  iid: number;
  addr: string;
  side: 1 | -1;
  tid: string;
  n: number;
  backstop: boolean;
};

/**
 * A sample day re-read from WAVE-H's raw store by its own readers (lz4js,
 * `JSON.parse` of every line, its schema), independent of the pass: the
 * day's files and an hour's either side, each record of the day once by
 * account and `tid`; the takers summed in H8's order, as the store's.
 */
export async function dayFromRaw(
  o: GatesInput,
  day: number,
): Promise<{ numbers: DayNumbers; records: number; twice: number }> {
  const end = Math.min(day + DAY_MS, DATA_END);
  const forty = new Set(o.forty);
  const seen = new Set<string>();
  const takers = new Map<string, Taken[]>(o.forty.map((c) => [c, []]));
  const liq: bigint[] = [];
  let records = 0;
  let twice = 0;
  for (const key of fillKeys(day - HOUR_MS, day + DAY_MS + HOUR_MS)) {
    await o.pace();
    for (const line of linesOf(readLz4(o.gate, o.raw, o.list, key))) {
      let raw: ReturnType<typeof rawRecords>;
      try {
        raw = rawRecords(formatOf(key), parseLine(line));
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
        if (isLiq) liq.push(BigInt(f.tid));
        if (isTaker)
          takers.get(f.coin)!.push({
            t: f.time,
            iid: 0,
            addr: rec.user,
            side: f.side === "B" ? 1 : -1,
            tid: f.tid,
            n: Number(f.px) * Number(f.sz),
            backstop: f.liquidation?.method === "backstop",
          });
      }
    }
  }
  for (const list of takers.values()) list.sort(byM4);
  const out: DayNumbers = {
    tape: {},
    bars: {},
    liq: [liq.length, tidSum(liq)],
    ctxs: ctxsFromRaw(o, day),
  };
  for (const c of o.coins.list) {
    const list = takers.get(c.name)!;
    out.tape[c.name] = [
      list.length,
      tidSum(list.map((r) => BigInt(r.tid))),
      total(list.map((r) => r.n)),
    ];
  }
  for (const coin of LARGE_COINS) {
    const buy = new Float64Array(1440);
    const sell = new Float64Array(1440);
    const backstop = new Float64Array(1440);
    let trades = 0;
    for (const r of takers.get(coin)!) {
      const k = Math.floor((r.t - day) / MINUTE_MS);
      if (r.backstop) backstop[k] = backstop[k]! + r.n;
      else {
        trades += 1;
        if (r.side > 0) buy[k] = buy[k]! + r.n;
        else sell[k] = sell[k]! + r.n;
      }
    }
    out.bars[coin] = [trades, total(buy), total(sell), total(backstop)];
  }
  return { numbers: out, records, twice };
}

const TIME = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/;

/** The day's minutes of the 40 coins from the `asset_ctxs` files of the day and a day either side, in day order: each minute's row the latest stamped in (m, m + 1 min], the first of one stamp, a row whose time or mark fails not taken. */
function ctxsFromRaw(o: GatesInput, day: number): DayNumbers["ctxs"] {
  const rows = new Map<string, ({ t: number; values: number[] } | undefined)[]>(
    o.forty.map((c) => [c, new Array<undefined>(1440).fill(undefined)]),
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
      const minutes = rows.get(cells[iCoin] ?? "");
      if (minutes === undefined || cells.length !== head.length) continue;
      const mark = Number(cells[iMark]);
      if (!TIME.test(cells[iTime]!) || !(mark > 0 && Number.isFinite(mark)))
        continue;
      const t = Date.parse(cells[iTime]!);
      const k = Math.ceil((t - day) / MINUTE_MS) - 1;
      if (t >= DATA_END || k < 0 || k >= 1440) continue;
      if (minutes[k] !== undefined && t <= minutes[k].t) continue;
      minutes[k] = {
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
      const kept = rows.get(coin)!.filter((r) => r !== undefined);
      return [
        coin,
        [
          kept.length,
          ...CONTEXT.map((_, j) => columnSum(kept.map((r) => r.values[j]!))),
        ],
      ];
    }),
  );
}
