/**
 * The record scanner (the polishing plan 4.2, from WAVE-H-LOOK-REVIEW's
 * `scan.cjs`): one fill file's decoded bytes, line by line. In a line whose
 * records tile it as the format says (`["0x…",{…}]` one after another; a
 * `["0x` cannot occur inside a JSON string), each record is read from its
 * text before any parse: its address, its time, its coin (the fill's first
 * key), `crossed` for the 40 coins, a `liquidation` object. A record a
 * writer wants is parsed — `JSON.parse`, a long `tid` or `oid` kept as its
 * digits — and checked by WAVE-H's own Zod schema (H2); a record the others
 * leave is counted by its frame and address. A line or record whose text
 * does not settle it is parsed whole by WAVE-H's readers (the slow path,
 * counted). The counts are what the manifest and the gates need: records and
 * failures (WAVE-H's), records by the hour of their time and those at or
 * after the range's end (counted, never kept), the 40 coins' takers and
 * makers (one of each a trade) and, paired by `tid`, the trades whose
 * taker or maker the file lacks, the block numbers' runs, and the stretches
 * of 60 s or more with no record.
 */
import {
  parseRecord,
  rawRecords,
  type Format,
  type Rec,
} from "../waveh/fills.js";
import { decodeFrame } from "./lz4.js";
import type { Names, Writer } from "./writers.js";

/** A stretch this long or longer with no record is a hole. */
export const HOLE_MS = 60_000;
const HOUR_MS = 3_600_000;

export type Scan = {
  decoded: number;
  lines: number;
  /** Records that pass: a kept one by WAVE-H's schema, the others by their frame and address. */
  records: number;
  /** Lines that do not parse and records that fail (as WAVE-H's pass counts them, H2). */
  failed: number;
  /** Lines and records parsed whole because their text did not settle them. */
  slowLines: number;
  slowRecords: number;
  /** Kept records whose parse disagrees with their text's reading (the parse stands). */
  misread: number;
  /** Records at or after the range's end: counted, never kept. */
  late: number;
  /** Records a writer could not store (an id above 64 bits; liq's other keys failing). */
  refused: number;
  /** Records by the UTC hour of their time (the hour's start in ms). */
  byHour: Map<number, number>;
  /** The 40 coins' taker and maker records, and their earliest time (WAVE-H's coins with a record in SIZING, H13). */
  pairs: Map<string, [takers: number, makers: number, first: number]>;
  /** The 40 coins' (coin, `tid`)s whose taker and maker records do not pair inside the file, with takers less makers (never 0), in coin and `tid` order. */
  unpaired: [coin: string, tid: string, takersLessMakers: number][];
  /** `node_fills_by_block`'s block numbers in line order, as runs of consecutive numbers. */
  runs: [number, number][];
  /** The records' first time, their latest, and the stretches of HOLE_MS or more with none, in file order. */
  times: { first: number; max: number; holes: [number, number][] } | null;
};

const REC = Buffer.from('["0x', "latin1");
const TIME = Buffer.from('"time":', "latin1");
const CROSSED = Buffer.from('"crossed":', "latin1");
const LIQ = Buffer.from('"liquidation":', "latin1");
const TID = Buffer.from('"tid":', "latin1");
const COIN = Buffer.from('{"coin":"', "latin1");
const EVENTS = Buffer.from('"events":[', "latin1");
const BLOCK = /"block_number":(\d{1,15})[,}]/;
const LONG_ID = /"(?:tid|oid)":\s*\d{16}/;

const HEX = new Uint8Array(256);
for (const c of "0123456789abcdefABCDEF") HEX[c.charCodeAt(0)] = 1;

const keepIds = (
  key: string,
  value: unknown,
  context?: { source?: string },
): unknown =>
  (key === "tid" || key === "oid") &&
  typeof value === "number" &&
  typeof context?.source === "string"
    ? context.source
    : value;

/** JSON text, a `tid` or `oid` of 16 digits or more kept as its digits (above 2^53 a number rounds). */
export function parseText(text: string): unknown {
  return LONG_ID.test(text) ? JSON.parse(text, keepIds) : JSON.parse(text);
}

function positions(line: Buffer, needle: Buffer): number[] {
  const out: number[] = [];
  for (
    let i = line.indexOf(needle);
    i !== -1;
    i = line.indexOf(needle, i + needle.length)
  )
    out.push(i);
  return out;
}

/** The frame `["0x<40 hex>",{…}]` of the record [s, e). */
function framed(line: Buffer, s: number, e: number): boolean {
  if (
    e - s < 50 ||
    line[s + 44] !== 0x22 ||
    line[s + 45] !== 0x2c ||
    line[s + 46] !== 0x7b ||
    line[e - 2] !== 0x7d ||
    line[e - 1] !== 0x5d
  )
    return false;
  for (let k = s + 4; k < s + 44; k++) if (HEX[line[k]!] !== 1) return false;
  return true;
}

/** The whole number at k, ended by `,` or `}`; −1 when there is none of at most 15 digits. */
function numberAt(line: Buffer, k: number, e: number): number {
  let v = 0;
  const d0 = k;
  for (; k < e; k++) {
    const c = line[k]!;
    if (c < 0x30 || c > 0x39) break;
    v = v * 10 + (c - 0x30);
  }
  return k === d0 || k - d0 > 15 || (line[k] !== 0x2c && line[k] !== 0x7d)
    ? -1
    : v;
}

/** `true` (1) or `false` (0) at v, ended by `,` or `}`; −1 otherwise. */
function boolAt(line: Buffer, v: number): number {
  if (
    line[v] === 0x74 &&
    line[v + 1] === 0x72 &&
    line[v + 2] === 0x75 &&
    line[v + 3] === 0x65 &&
    (line[v + 4] === 0x2c || line[v + 4] === 0x7d)
  )
    return 1;
  if (
    line[v] === 0x66 &&
    line[v + 1] === 0x61 &&
    line[v + 2] === 0x6c &&
    line[v + 3] === 0x73 &&
    line[v + 4] === 0x65 &&
    (line[v + 5] === 0x2c || line[v + 5] === 0x7d)
  )
    return 0;
  return -1;
}

/** The record's `tid` as its digits: [s, e) holds one `"tid":`, its value plain digits ended by `,` or `}`; else null. */
function tidAt(line: Buffer, s: number, e: number): string | null {
  const k = line.indexOf(TID, s);
  if (k < 0 || k >= e) return null;
  const again = line.indexOf(TID, k + TID.length);
  if (again >= 0 && again < e) return null;
  const d0 = k + TID.length;
  let q = d0;
  while (q < e && line[q]! >= 0x30 && line[q]! <= 0x39) q++;
  return q === d0 || (line[q] !== 0x2c && line[q] !== 0x7d)
    ? null
    : line.toString("latin1", d0, q);
}

const byText = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** Coin names by a hash of their bytes: a record's coin is read without a new string. */
const coinNames = new Map<number, string[]>();

/** The fill's coin when the fill opens with it (`{"coin":"…"`) in plain ASCII without an escape; else null. */
function coinAt(line: Buffer, s: number, e: number): string | null {
  for (let i = 0; i < COIN.length; i++)
    if (line[s + 46 + i] !== COIN[i]) return null;
  const from = s + 46 + COIN.length;
  let h = 2166136261;
  let q = from;
  for (; q < e; q++) {
    const c = line[q]!;
    if (c === 0x22) break;
    if (c === 0x5c || c >= 0x80) return null;
    h = Math.imul(h ^ c, 16777619);
  }
  if (q >= e) return null;
  const bucket = coinNames.get(h);
  if (bucket !== undefined)
    for (const name of bucket) {
      if (name.length !== q - from) continue;
      let same = true;
      for (let i = 0; i < name.length; i++)
        if (name.charCodeAt(i) !== line[from + i]) {
          same = false;
          break;
        }
      if (same) return name;
    }
  const name = line.toString("latin1", from, q);
  if (bucket === undefined) coinNames.set(h, [name]);
  else bucket.push(name);
  return name;
}

class Scanner {
  readonly scan: Scan = {
    decoded: 0,
    lines: 0,
    records: 0,
    failed: 0,
    slowLines: 0,
    slowRecords: 0,
    misread: 0,
    late: 0,
    refused: 0,
    byHour: new Map(),
    pairs: new Map(),
    unpaired: [],
    runs: [],
    times: null,
  };
  private hour = -1;
  private hourCount = 0;
  /** `<coin> <tid>` → takers less makers so far; a pair met is deleted. */
  private readonly open = new Map<string, number>();

  constructor(
    private readonly format: Format,
    private readonly end: number,
    private readonly forty: ReadonlySet<string>,
    private readonly writers: readonly Writer[],
    private readonly users: Names,
  ) {}

  /** The records of one line, or null when its text does not tile as its format's. */
  private tiles(
    line: Buffer,
    starts: readonly number[],
  ): [number, number][] | null {
    const n = starts.length;
    const len = line.length;
    if (this.format === "node_fills")
      return n === 1 && starts[0] === 0 && line[len - 1] === 0x5d
        ? [[0, len]]
        : null;
    const ev = line.indexOf(EVENTS);
    if (
      ev < 0 ||
      ev > 256 ||
      len < 2 ||
      line[len - 1] !== 0x7d ||
      line[len - 2] !== 0x5d
    )
      return null;
    const first = ev + EVENTS.length;
    if (n === 0) return first === len - 2 ? [] : null;
    if (starts[0] !== first) return null;
    const out: [number, number][] = [];
    for (let i = 0; i < n; i++) {
      const e = i + 1 < n ? starts[i + 1]! - 1 : len - 2;
      if (i + 1 < n && line[e] !== 0x2c) return null;
      out.push([starts[i]!, e]);
    }
    return out;
  }

  line(line: Buffer): void {
    this.scan.lines += 1;
    const tiles = this.tiles(line, positions(line, REC));
    let block: number | null = null;
    if (tiles !== null && this.format === "node_fills_by_block") {
      const m = BLOCK.exec(
        line.toString("latin1", 0, Math.min(line.length, 256)),
      );
      if (m !== null) block = Number(m[1]);
    }
    if (
      tiles === null ||
      (this.format === "node_fills_by_block" && block === null)
    ) {
      this.slowLine(line);
      return;
    }
    if (block !== null) this.blockSeen(block);
    const time = positions(line, TIME);
    const crossed = positions(line, CROSSED);
    const liq = positions(line, LIQ);
    let it = 0;
    let ic = 0;
    let il = 0;
    for (const [s, e] of tiles) {
      // Each needle's places inside this record.
      while (it < time.length && time[it]! < s) it++;
      const t0 = it;
      while (it < time.length && time[it]! < e) it++;
      while (ic < crossed.length && crossed[ic]! < s) ic++;
      const c0 = ic;
      while (ic < crossed.length && crossed[ic]! < e) ic++;
      while (il < liq.length && liq[il]! < s) il++;
      const l0 = il;
      while (il < liq.length && liq[il]! < e) il++;
      if (!framed(line, s, e)) {
        this.scan.failed += 1;
        continue;
      }
      // What the text settles: one time, the coin first, at most one liquidation object, and for the 40 coins one `crossed`.
      const t = it - t0 === 1 ? numberAt(line, time[t0]! + TIME.length, e) : -1;
      const coin = t >= 0 && il - l0 <= 1 ? coinAt(line, s, e) : null;
      const hasLiq = il - l0 === 1;
      const taker =
        coin === null || !this.forty.has(coin)
          ? 0
          : ic - c0 === 1
            ? boolAt(line, crossed[c0]! + CROSSED.length)
            : -1;
      if (
        coin === null ||
        taker < 0 ||
        (hasLiq && line[liq[l0]! + LIQ.length] !== 0x7b)
      ) {
        this.slowRecord(line.toString("utf8", s, e), block);
        continue;
      }
      const isTaker = taker === 1;
      let wanted = false;
      if (t < this.end)
        for (const w of this.writers)
          if (w.wants(coin, isTaker, hasLiq)) {
            wanted = true;
            break;
          }
      if (!wanted) {
        // The 40 coins' records pair by `tid`: one whose text does not settle it is parsed.
        const tid = this.forty.has(coin) ? tidAt(line, s, e) : "";
        if (tid === null) this.slowRecord(line.toString("utf8", s, e), block);
        else this.count(t, coin, isTaker, tid);
        continue;
      }
      const rec = this.parse(line.toString("utf8", s, e));
      if (rec === null) continue;
      const f = rec.rec.fill;
      if (
        f.coin !== coin ||
        f.time !== t ||
        (f.liquidation !== undefined) !== hasLiq ||
        (this.forty.has(coin) && f.crossed !== isTaker)
      )
        this.scan.misread += 1;
      this.take(rec.rec, rec.raw, block);
    }
  }

  /** A record's text through `JSON.parse` and WAVE-H's schema; null (counted as failed) when either refuses it. */
  private parse(text: string): { rec: Rec; raw: unknown } | null {
    let parsed: unknown;
    try {
      parsed = parseText(text);
    } catch {
      this.scan.failed += 1;
      return null;
    }
    const rec = parseRecord(parsed);
    if (rec === null) {
      this.scan.failed += 1;
      return null;
    }
    return { rec, raw: (parsed as unknown[])[1] };
  }

  private slowRecord(text: string, block: number | null): void {
    this.scan.slowRecords += 1;
    const rec = this.parse(text);
    if (rec !== null) this.take(rec.rec, rec.raw, block);
  }

  /** A line whose text does not tile: parsed whole by WAVE-H's line readers, as its pass does (a line that fails is one failure). */
  private slowLine(line: Buffer): void {
    this.scan.slowLines += 1;
    let parsed: unknown;
    try {
      parsed = parseText(line.toString("utf8"));
    } catch {
      this.scan.failed += 1;
      return;
    }
    const raw = rawRecords(this.format, parsed);
    if (raw === null) {
      this.scan.failed += 1;
      return;
    }
    if (raw.block !== null) this.blockSeen(raw.block);
    for (const r of raw.records) {
      const rec = parseRecord(r);
      if (rec === null) this.scan.failed += 1;
      else this.take(rec, (r as unknown[])[1], raw.block);
    }
  }

  /** A record that passed: counted, and handed to the writers that want it unless it is late. */
  private take(rec: Rec, raw: unknown, block: number | null): void {
    const f = rec.fill;
    this.count(f.time, f.coin, f.crossed, f.tid);
    if (f.time >= this.end) return;
    const hasLiq = f.liquidation !== undefined;
    for (const w of this.writers)
      if (
        w.wants(f.coin, f.crossed, hasLiq) &&
        !w.add({ user: rec.user, fill: f, raw, block }, this.users)
      )
        this.scan.refused += 1;
  }

  private count(t: number, coin: string, isTaker: boolean, tid: string): void {
    const sc = this.scan;
    sc.records += 1;
    if (t >= this.end) sc.late += 1;
    const h = t - (t % HOUR_MS);
    if (h !== this.hour) {
      this.flushHour();
      this.hour = h;
    }
    this.hourCount += 1;
    if (sc.times === null) sc.times = { first: t, max: t, holes: [] };
    else {
      if (t - sc.times.max >= HOLE_MS) sc.times.holes.push([sc.times.max, t]);
      if (t > sc.times.max) sc.times.max = t;
    }
    if (this.forty.has(coin)) {
      const p = sc.pairs.get(coin);
      if (p === undefined) sc.pairs.set(coin, isTaker ? [1, 0, t] : [0, 1, t]);
      else {
        p[isTaker ? 0 : 1] += 1;
        if (t < p[2]) p[2] = t;
      }
      const k = `${coin} ${tid}`;
      const d = (this.open.get(k) ?? 0) + (isTaker ? 1 : -1);
      if (d === 0) this.open.delete(k);
      else this.open.set(k, d);
    }
  }

  /** The last hour's count, and the (coin, `tid`)s left open. */
  finish(): void {
    this.flushHour();
    this.scan.unpaired = [...this.open]
      .map(([k, d]): [string, string, number] => {
        const at = k.lastIndexOf(" ");
        return [k.slice(0, at), k.slice(at + 1), d];
      })
      .sort(
        (a, b) =>
          byText(a[0], b[0]) || a[1].length - b[1].length || byText(a[1], b[1]),
      );
  }

  private flushHour(): void {
    if (this.hourCount > 0)
      this.scan.byHour.set(
        this.hour,
        (this.scan.byHour.get(this.hour) ?? 0) + this.hourCount,
      );
    this.hourCount = 0;
  }

  private blockSeen(b: number): void {
    const last = this.scan.runs.at(-1);
    if (last !== undefined && b === last[1] + 1) last[1] = b;
    else this.scan.runs.push([b, b]);
  }
}

/**
 * One fill file (its compressed bytes) through the decoder and the scanner:
 * every record before `end` that a writer wants is handed to it, with the
 * file's addresses numbered in `users`. A frame that fails throws.
 */
export function scanFill(
  src: Uint8Array,
  format: Format,
  end: number,
  forty: ReadonlySet<string>,
  writers: readonly Writer[],
  users: Names,
): Scan {
  const sc = new Scanner(format, end, forty, writers, users);
  let carry: Buffer | null = null;
  sc.scan.decoded = decodeFrame(src, (block) => {
    const view = Buffer.from(block.buffer, block.byteOffset, block.length);
    const data: Buffer = carry === null ? view : Buffer.concat([carry, view]);
    let at = 0;
    for (let nl = data.indexOf(10); nl !== -1; nl = data.indexOf(10, at)) {
      sc.line(data.subarray(at, nl));
      at = nl + 1;
    }
    // The block's buffer is reused: the unfinished line is copied.
    carry = at < data.length ? Buffer.from(data.subarray(at)) : null;
  });
  if (carry !== null) sc.line(carry);
  sc.finish();
  return sc.scan;
}
