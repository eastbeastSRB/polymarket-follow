/**
 * One raw fill file through COPY-H's boundary (copyh/rules.md C3): decoded
 * block by block (the analyzer's decoder, `dist/polish/lz4.js`), read line by
 * line; in a line whose records tile it as its format says (`["0x…",{…}]`
 * one after another), each record's frame, coin and `time` are read from its
 * text (the analyzer's text rules); a line or record whose text does not
 * settle it is parsed whole on the slow path (`parseSlow`), counted. Each
 * record falls in one class: a builder dex's or spot's, by its coin's form,
 * counted and never parsed; a main-dex-shaped one is cut and parsed
 * (`cutText`, `parseFast`) and held to the schema (failing: counted with
 * why, its `sz` or `startPosition` of more than 15 significant digits among
 * them), then timed before the range's start or at or after its end
 * (counted), of kind `outcome` (counted), its `dir` or coin outside its list
 * (counted; a build then stops at the file's end, naming every such value
 * with its count), else kept, counted by its account's bucket, and handed to
 * the sink. Every record's time is counted by hour and by minute (the
 * minute's first and last time), from which `holes.ts` finds the holes of
 * the union of every file's records. The counts are what the parts, the
 * manifest and the integrity need.
 */
import { decodeFrame } from "../polish/lz4.js";
import { HOUR_MS, MINUTE_MS } from "../schedule.js";
import { formOfCoin } from "./coins.js";
import { BUCKETS, SETTLEMENT_DIR } from "./design.js";
import type { DirKind } from "./dirs.js";
import { StoreError } from "./run.js";
import {
  cutText,
  exactInDouble,
  parseFast,
  parseSlow,
  recordOf,
  refusalOf,
  type Rec,
} from "./schema.js";
import { bucketOf } from "./writers.js";

export type Format = "node_fills" | "node_fills_by_block";

/** Where a kept record goes: the build's writers, or nothing when the run only counts. */
export interface Sink {
  add(rec: Rec, iid: number): void;
}

/** What one file's records were, by class: every record found is in exactly one. */
export type Classes = {
  kept: number;
  spot: number;
  builder: number;
  outcome: number;
  early: number;
  late: number;
  failed: number;
  /** A main-dex-shaped record whose `dir`, or whose coin, is outside its list (a build stops at the file's end). */
  unknownDir: number;
  unknownCoin: number;
};

export type Scan = {
  decoded: number;
  lines: number;
  /** Every record found, and every record of a line that failed (one when none could be counted). */
  seen: number;
  classes: Classes;
  /** Why the failed records failed, summing to `classes.failed`: "frame" (not `["0x…",{…}]`), "parse" (no JSON), "line" (each record of a line that fails its own shape), else the schema's first refusal's field path (schema.ts `refusalOf`). */
  failedBy: Map<string, number>;
  /** Lines and records parsed whole because their text did not settle them. */
  slowLines: number;
  slowRecords: number;
  /** Main-dex-shaped records whose text's coin or time differs from their parse (the parse stands). */
  misread: number;
  /** Records past the boundary whose `startPosition` text is not exact in a double (more than 15 significant digits), read as its double (schema.ts `exactAsDouble`). */
  startByDouble: number;
  /** Every record by the UTC hour of its time. */
  byHour: Map<number, number>;
  /** Main-dex-shaped records in the range's time, by `dir`. */
  dirs: Map<string, number>;
  /** Their taker records, by `dir` and liquidation method (`""` for none). */
  takers: Map<string, number>;
  /** Kept records by coin, keyed by its iid: [count, first time, last time, first "Settlement" time or -1]. */
  coins: Map<number, [number, number, number, number]>;
  /** Kept records by their account's bucket (writers.ts `bucketOf`), BUCKETS of them. */
  buckets: number[];
  /** The values outside their lists, with their counts. */
  unknownDirs: Map<string, number>;
  unknownCoins: Map<string, number>;
  /** The accounts with a kept record of kind `vault`. */
  vaults: Set<string>;
  /** Every record's time by its minute: [minute (its start ÷ 60,000), the first time, the last], by minute. */
  minutes: [number, number, number][];
};

export type Lists = {
  /** A coin's iid by its name (coins.json). */
  iids: ReadonlyMap<string, number>;
  /** A `dir`'s kind (dirs.json); null before the list exists, when every value counts as a trade's (a counting run). */
  kinds: ReadonlyMap<string, DirKind> | null;
  /** True for a counting run: a `dir` or coin outside its list is counted, never a stop. */
  counting: boolean;
};

const REC = Buffer.from('["0x', "latin1");
const TIME = Buffer.from('"time":', "latin1");
const COIN = Buffer.from('{"coin":"', "latin1");
const EVENTS = Buffer.from('"events":[', "latin1");
const BLOCK = /"block_number":\d{1,15}[,}]/;

const HEX = new Uint8Array(256);
for (const c of "0123456789abcdefABCDEF") HEX[c.charCodeAt(0)] = 1;

/** Each match of a needle inside [s, e), searched in those bytes only (as `cutText` searches). */
function positions(line: Buffer, needle: Buffer, s = 0, e = line.length) {
  const upToEnd = line.subarray(0, e);
  const out: number[] = [];
  for (
    let i = upToEnd.indexOf(needle, s);
    i !== -1;
    i = upToEnd.indexOf(needle, i + needle.length)
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

/** The fill's coin when the fill opens with it (`{"coin":"…"`) in plain ASCII without an escape; else null. */
function coinAt(line: Buffer, s: number, e: number): string | null {
  for (let i = 0; i < COIN.length; i++)
    if (line[s + 46 + i] !== COIN[i]) return null;
  const from = s + 46 + COIN.length;
  let q = from;
  for (; q < e; q++) {
    const c = line[q]!;
    if (c === 0x22) break;
    if (c === 0x5c || c >= 0x80) return null;
  }
  return q >= e || q === from ? null : line.toString("latin1", from, q);
}

const bump = <K>(m: Map<K, number>, k: K, n = 1) =>
  m.set(k, (m.get(k) ?? 0) + n);

class Scanner {
  readonly scan: Scan = {
    decoded: 0,
    lines: 0,
    seen: 0,
    classes: {
      kept: 0,
      spot: 0,
      builder: 0,
      outcome: 0,
      early: 0,
      late: 0,
      failed: 0,
      unknownDir: 0,
      unknownCoin: 0,
    },
    failedBy: new Map(),
    slowLines: 0,
    slowRecords: 0,
    misread: 0,
    startByDouble: 0,
    byHour: new Map(),
    dirs: new Map(),
    takers: new Map(),
    coins: new Map(),
    buckets: new Array<number>(BUCKETS).fill(0),
    unknownDirs: new Map(),
    unknownCoins: new Map(),
    vaults: new Set(),
    minutes: [],
  };
  private readonly byMinute = new Map<number, [number, number]>();

  constructor(
    private readonly key: string,
    private readonly format: Format,
    private readonly start: number,
    private readonly end: number,
    private readonly lists: Lists,
    private readonly sink: Sink,
  ) {}

  /** The records of one line, or null when its text does not tile as its format's. */
  private tiles(line: Buffer): [number, number][] | null {
    const starts = positions(line, REC);
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
    const tiles = this.tiles(line);
    if (
      tiles === null ||
      (this.format === "node_fills_by_block" &&
        !BLOCK.test(line.toString("latin1", 0, Math.min(line.length, 256))))
    ) {
      this.slowLine(line);
      return;
    }
    for (const [s, e] of tiles) {
      this.scan.seen += 1;
      if (!framed(line, s, e)) {
        this.fail("frame");
        continue;
      }
      const times = positions(line, TIME, s, e);
      const t =
        times.length === 1 ? numberAt(line, times[0]! + TIME.length, e) : -1;
      const coin = t >= 0 ? coinAt(line, s, e) : null;
      if (coin === null) {
        this.slowRecord(line.toString("utf8", s, e));
        continue;
      }
      const form = formOfCoin(coin);
      if (form !== "main") {
        this.count(t);
        this.scan.classes[form] += 1;
        continue;
      }
      const text = cutText(line, s, e);
      if (text === null) {
        this.slowRecord(line.toString("utf8", s, e));
        continue;
      }
      let raw: unknown;
      try {
        raw = parseFast(text);
      } catch {
        this.fail("parse");
        continue;
      }
      const rec = recordOf(raw);
      if (rec === null) {
        this.fail(refusalOf(raw));
        continue;
      }
      if (rec.fill.coin !== coin || rec.fill.time !== t) this.scan.misread += 1;
      this.take(rec);
    }
  }

  /** Records failing the boundary, and why. */
  private fail(why: string, n = 1): void {
    this.scan.classes.failed += n;
    bump(this.scan.failedBy, why, n);
  }

  /** A record whose text did not settle it: parsed whole, the three fields dropped by the reviver. */
  private slowRecord(text: string): void {
    this.scan.slowRecords += 1;
    let raw: unknown;
    try {
      raw = parseSlow(text);
    } catch {
      this.fail("parse");
      return;
    }
    this.classify(raw);
  }

  /** A line that does not tile: parsed whole on the slow path; one that fails counts its records as failing (one when none can be counted). */
  private slowLine(line: Buffer): void {
    this.scan.slowLines += 1;
    let parsed: unknown;
    try {
      parsed = parseSlow(line.toString("utf8"));
    } catch {
      parsed = undefined;
    }
    const records = this.recordsOf(parsed);
    if (records === null) {
      const n = Math.max(1, positions(line, REC).length);
      this.scan.seen += n;
      this.fail("line", n);
      return;
    }
    for (const r of records) {
      this.scan.seen += 1;
      this.classify(r);
    }
  }

  /** A parsed line's records, by its format; null when it is not its format's. */
  private recordsOf(parsed: unknown): unknown[] | null {
    if (this.format === "node_fills")
      return Array.isArray(parsed) ? [parsed] : null;
    if (
      typeof parsed !== "object" ||
      parsed === null ||
      !("events" in parsed) ||
      !Array.isArray(parsed.events) ||
      !("block_number" in parsed) ||
      !Number.isSafeInteger(parsed.block_number)
    )
      return null;
    return parsed.events as unknown[];
  }

  /** A record parsed whole: its class by its coin's form, then the boundary. */
  private classify(raw: unknown): void {
    const fill: unknown = Array.isArray(raw) ? (raw as unknown[])[1] : null;
    const coin =
      typeof fill === "object" &&
      fill !== null &&
      "coin" in fill &&
      typeof fill.coin === "string"
        ? fill.coin
        : null;
    const time =
      typeof fill === "object" &&
      fill !== null &&
      "time" in fill &&
      typeof fill.time === "number" &&
      Number.isSafeInteger(fill.time)
        ? fill.time
        : null;
    const form = coin === null ? "main" : formOfCoin(coin);
    if (form !== "main" && time !== null) {
      this.count(time);
      this.scan.classes[form] += 1;
      return;
    }
    const rec = recordOf(raw);
    if (rec === null) {
      this.fail(refusalOf(raw));
      return;
    }
    if (formOfCoin(rec.fill.coin) !== "main") {
      this.count(rec.fill.time);
      this.scan.classes[formOfCoin(rec.fill.coin) as "spot" | "builder"] += 1;
      return;
    }
    this.take(rec);
  }

  /** A main-dex-shaped record that passed the boundary: its time, its dir, its coin, its exactness; then kept. */
  private take(rec: Rec): void {
    const f = rec.fill;
    const c = this.scan.classes;
    if (!exactInDouble(f.startPosition)) this.scan.startByDouble += 1;
    this.count(f.time);
    if (f.time < this.start) {
      c.early += 1;
      return;
    }
    if (f.time >= this.end) {
      c.late += 1;
      return;
    }
    bump(this.scan.dirs, f.dir);
    if (f.crossed)
      bump(this.scan.takers, `${f.dir}|${f.liquidation?.method ?? ""}`);
    const { kinds, iids } = this.lists;
    const kind = kinds === null ? "trade" : kinds.get(f.dir);
    if (kind === undefined) {
      bump(this.scan.unknownDirs, f.dir);
      c.unknownDir += 1;
      return;
    }
    if (kind === "outcome") {
      c.outcome += 1;
      return;
    }
    const iid = iids.get(f.coin);
    if (iid === undefined) {
      bump(this.scan.unknownCoins, f.coin);
      c.unknownCoin += 1;
      return;
    }
    c.kept += 1;
    const b = bucketOf(rec.user);
    this.scan.buckets[b] = this.scan.buckets[b]! + 1;
    const coin = this.scan.coins.get(iid);
    const settled = f.dir === SETTLEMENT_DIR ? f.time : -1;
    if (coin === undefined)
      this.scan.coins.set(iid, [1, f.time, f.time, settled]);
    else {
      coin[0] += 1;
      if (f.time < coin[1]) coin[1] = f.time;
      if (f.time > coin[2]) coin[2] = f.time;
      if (settled >= 0 && (coin[3] < 0 || settled < coin[3])) coin[3] = settled;
    }
    if (kind === "vault") this.scan.vaults.add(rec.user);
    this.sink.add(rec, iid);
  }

  /** A record's time: its hour's count, its minute's first and last time. */
  private count(t: number): void {
    bump(this.scan.byHour, t - (t % HOUR_MS));
    const m = Math.floor(t / MINUTE_MS);
    const span = this.byMinute.get(m);
    if (span === undefined) this.byMinute.set(m, [t, t]);
    else {
      if (t < span[0]) span[0] = t;
      if (t > span[1]) span[1] = t;
    }
  }

  /** The file's end: a build stops at the values outside the lists, every one named with its count; else its minutes in order. */
  finish(): Scan {
    const c = this.scan.classes;
    if (!this.lists.counting && c.unknownDir + c.unknownCoin > 0)
      throw new StoreError(
        `${this.key}: outside the lists, each with its count: dirs ${JSON.stringify([...this.scan.unknownDirs])}, coins ${JSON.stringify([...this.scan.unknownCoins])}: a ruling`,
      );
    this.scan.minutes = [...this.byMinute]
      .sort((a, b) => a[0] - b[0])
      .map(([m, [lo, hi]]) => [m, lo, hi]);
    return this.scan;
  }
}

/**
 * One fill file (its compressed bytes) through the decoder and the boundary:
 * every kept record of the range's time [start, end) to the sink. A frame
 * that fails throws; a `dir` or coin outside its list stops it at its end (a
 * StoreError naming every such value) unless the run only counts
 * (`lists.counting`).
 */
export function scanFile(
  src: Uint8Array,
  o: {
    key: string;
    format: Format;
    start: number;
    end: number;
    lists: Lists;
    sink: Sink;
  },
): Scan {
  const sc = new Scanner(o.key, o.format, o.start, o.end, o.lists, o.sink);
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
  return sc.finish();
}
