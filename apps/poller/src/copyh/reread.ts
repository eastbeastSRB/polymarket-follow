/**
 * The independent re-reader (copyh/rules.md C15, step 1, 3: the sample days
 * re-read cell by cell), sharing no code with the pass: another decoder
 * (lz4js through WAVE-H's `decodeLz4`, behind its pinned hashes), every line
 * parsed whole by `JSON.parse` with this file's own reviver (`closedPnl`,
 * `fee` and `builderFee` dropped at any depth, a long id kept as its digits),
 * this file's own checks of every field, coin form, window, `dir` kind,
 * market rule, flags and pairing. A sample day's files are read with the
 * file before and the file after (for the trades split across two files and
 * the first pair of the day), and give, for each of the day's files, its
 * kept rows' count and digest (digest.ts) and its records by class; and, for
 * the day's minutes, every coin's bars, summed in the store's order (each
 * file's minutes, then the files in order, then the pairs across files).
 * A blank line is a line that fails, one record (C3), as the pass reads it.
 * In the switch hour's second file a record of the first (the same user,
 * coin, `tid`, `time`, side and `crossed`) is counted kept and left out of
 * the rows, as the store leaves it out (C3); it is in the bars, as in the
 * store's. One record unpaired in three files running could pair otherwise
 * than the merge pairs it (the merge reads every file); a difference is
 * listed, never hidden.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { decodeLz4 } from "../waveh/lz4.js";
import {
  ADL_DIR,
  BACKSTOP_METHOD,
  EXACT_DIGITS,
  PAIR_MS,
  SETTLEMENT_DIR,
  SWITCH_HOUR,
  VAULT_DIR,
} from "./design.js";
import { Digest, type RowCells } from "./digest.js";
import type { DirKind } from "./dirs.js";
import type { FileTask } from "./pass.js";
import { StoreError, sha256 } from "./run.js";
import { checkInside, checkKey, checkPath, type Seal } from "./seal.js";

/** The store's flags, as the store's format defines them (a test holds them to writers.ts). */
export const FLAG = {
  taker: 1,
  own: 2,
  other: 4,
  unnamed: 8,
  backstop: 16,
  market: 32,
} as const;

const MINUTE = 60_000;
/** The decoded bytes searched for line ends a window at a time. */
export const WINDOW = 256 * 2 ** 20;
const DROP = new Set(["closedPnl", "fee", "builderFee"]);
const ADDRESS = /^0x[0-9a-fA-F]{40}$/;
const UNSIGNED = /^\d+(\.\d+)?$/;
const SIGNED = /^-?\d+(\.\d+)?$/;
const DIGITS = /^\d+$/;
const U64_MAX = 18_446_744_073_709_551_615n;
const REC = Buffer.from('["0x', "latin1");

/** The switch hour's two files, `node_fills` first (C3), named as the archive names an hour's files. */
export const SWITCH_KEYS = (["node_fills", "node_fills_by_block"] as const).map(
  (format) => {
    const d = new Date(SWITCH_HOUR);
    return `${format}/hourly/${d.toISOString().slice(0, 10).replaceAll("-", "")}/${d.getUTCHours()}.lz4`;
  },
);

/**
 * Each line of decoded bytes, a blank one too, the last without its newline,
 * found a window of `window` bytes at a time: Buffer.indexOf gives a wrong,
 * negative offset for a match past 2^31 bytes (Node 24.13, measured
 * 2026-11-25), and a file can decode to more.
 */
export function eachLine(
  text: Uint8Array,
  window: number,
  fn: (line: Buffer) => void,
): void {
  let carry: Buffer | null = null;
  for (let base = 0; base < text.length; base += window) {
    const end = Math.min(base + window, text.length);
    const win = Buffer.from(text.buffer, text.byteOffset + base, end - base);
    let at = 0;
    for (let nl = win.indexOf(10); nl !== -1; nl = win.indexOf(10, at)) {
      const piece = win.subarray(at, nl);
      const line: Buffer =
        carry === null ? piece : Buffer.concat([carry, piece]);
      carry = null;
      fn(line);
      at = nl + 1;
    }
    if (at < win.length)
      carry =
        carry === null
          ? win.subarray(at)
          : Buffer.concat([carry, win.subarray(at)]);
  }
  if (carry !== null) fn(carry);
}

/** The reviver: the three outcome fields dropped wherever they stand; an id that is a number kept as its own digits. */
function revive(
  key: string,
  value: unknown,
  context?: { source?: string },
): unknown {
  if (DROP.has(key)) return undefined;
  if (
    (key === "oid" || key === "tid") &&
    typeof value === "number" &&
    !Number.isSafeInteger(value) &&
    typeof context?.source === "string"
  )
    return context.source;
  return value;
}

/** At most EXACT_DIGITS significant digits. */
function exact(text: string): boolean {
  const d = text.replace("-", "").replace(".", "").replace(/^0+/, "");
  return d.replace(/0+$/, "").length <= EXACT_DIGITS;
}

/** An id's digits as a whole number, or null. */
function idOf(v: unknown): bigint | null {
  if (typeof v === "number")
    return Number.isSafeInteger(v) && v >= 0 ? BigInt(v) : null;
  if (typeof v !== "string" || !DIGITS.test(v)) return null;
  const n = BigInt(v);
  return n <= U64_MAX ? n : null;
}

const formOf = (coin: string) =>
  coin.includes(":")
    ? "builder"
    : coin.startsWith("@") || coin.includes("/")
      ? "spot"
      : "main";

export type Classes = {
  kept: number;
  spot: number;
  builder: number;
  outcome: number;
  early: number;
  late: number;
  failed: number;
};

/** A kept record as the re-reader holds it until its flags are final. */
type Row = {
  cells: RowCells;
  taker: boolean;
  /** Its own reading: a market trade's fields. */
  own: boolean;
  key: string;
  /** A record of the switch hour's first file met again in its second: not a row. */
  repeat: boolean;
};

/** A market taker for the bars. */
type Taker = { time: number; px: number; sz: number; side: number };

/** A coin's partial bars in one file, by minute. */
type Partial = {
  trades: number;
  sz: number;
  ntl: number;
  lastTime: number;
  last: number;
  pairGap: number;
  pairs: number;
  leftBackstop: number;
  leftAdl: number;
  leftSettlement: number;
  leftVault: number;
  settleSz: number;
  settleNtl: number;
};
const empty = (): Partial => ({
  trades: 0,
  sz: 0,
  ntl: 0,
  lastTime: -Infinity,
  last: NaN,
  pairGap: 0,
  pairs: 0,
  leftBackstop: 0,
  leftAdl: 0,
  leftSettlement: 0,
  leftVault: 0,
  settleSz: 0,
  settleNtl: 0,
});

/** The columns the store's bars hold, compared minute by minute. */
export const BAR_COLUMNS = [
  "trades",
  "sz",
  "ntl",
  "last",
  "pairGap",
  "pairs",
  "leftBackstop",
  "leftAdl",
  "leftSettlement",
  "leftVault",
  "settleSz",
  "settleNtl",
] as const;
export type BarColumn = (typeof BAR_COLUMNS)[number];
/** A coin's bars over the day's minutes, a column each. */
export type DayBars = Record<BarColumn, Float64Array>;

/** One file read whole: its records by class, its rows, its unpaired records, its market takers and left-out takers and Settlement records by coin. */
type FileRead = {
  index: number;
  /** Its place in SWITCH_KEYS, or -1. */
  switchFile: number;
  classes: Classes;
  /** Rows whose flags are final, hashed as they come. */
  digest: Digest;
  /** Unpaired rows, by their trade's key, in the order they came. */
  unpaired: Map<string, Row>;
  takers: Map<number, Taker[]>;
  left: Map<number, [number, "backstop" | "adl" | "settlement" | "vault"][]>;
  settled: Map<number, [number, number, number][]>;
  problems: string[];
};

class Reader {
  constructor(
    private readonly o: RereadInput,
    private readonly sample: boolean,
    /** The switch hour's first file's kept records, by user, coin, `tid`, `time`, side and `crossed`. */
    private readonly switchFirst: Set<string>,
  ) {}

  read(f: FileTask): FileRead {
    const o = this.o;
    const file = path.join(o.raw, ...f.key.split("/"));
    checkKey(f.key, o.seal);
    checkPath(file, o.seal);
    checkInside(file, o.roots);
    const bytes = readFileSync(file);
    if (sha256(bytes) !== f.sha256)
      throw new StoreError(`${f.key}: differs from its list (the re-reader)`);
    const r: FileRead = {
      index: f.index,
      switchFile: SWITCH_KEYS.indexOf(f.key),
      classes: {
        kept: 0,
        spot: 0,
        builder: 0,
        outcome: 0,
        early: 0,
        late: 0,
        failed: 0,
      },
      digest: new Digest(),
      unpaired: new Map(),
      takers: new Map(),
      left: new Map(),
      settled: new Map(),
      problems: [],
    };
    const byBlock = f.key.startsWith("node_fills_by_block/");
    const text = decodeLz4(bytes);
    eachLine(text, WINDOW, (line) => this.line(line, byBlock, r));
    return r;
  }

  private line(line: Buffer, byBlock: boolean, r: FileRead): void {
    let parsed: unknown;
    try {
      parsed = JSON.parse(line.toString("utf8"), revive);
    } catch {
      parsed = undefined;
    }
    let records: unknown[] | null = null;
    if (!byBlock) records = Array.isArray(parsed) ? [parsed] : null;
    else if (
      typeof parsed === "object" &&
      parsed !== null &&
      "events" in parsed &&
      Array.isArray(parsed.events) &&
      "block_number" in parsed &&
      Number.isSafeInteger(parsed.block_number)
    )
      records = parsed.events as unknown[];
    if (records === null) {
      let n = 0;
      for (let i = line.indexOf(REC); i >= 0; i = line.indexOf(REC, i + 4))
        n += 1;
      r.classes.failed += Math.max(1, n);
      return;
    }
    for (const rec of records) this.record(rec, r);
  }

  private record(rec: unknown, r: FileRead): void {
    const c = r.classes;
    if (
      !Array.isArray(rec) ||
      rec.length !== 2 ||
      typeof rec[0] !== "string" ||
      !ADDRESS.test(rec[0]) ||
      typeof rec[1] !== "object" ||
      rec[1] === null ||
      Array.isArray(rec[1])
    ) {
      c.failed += 1;
      return;
    }
    const user = rec[0].toLowerCase();
    const f = rec[1] as Record<string, unknown>;
    const time = Number.isSafeInteger(f.time) ? (f.time as number) : null;
    if (typeof f.coin === "string" && f.coin !== "") {
      const form = formOf(f.coin);
      if (form !== "main" && time !== null) {
        c[form] += 1;
        return;
      }
    }
    const liq = f.liquidation;
    const liqOk =
      liq === undefined ||
      (typeof liq === "object" &&
        liq !== null &&
        !Array.isArray(liq) &&
        typeof (liq as { method?: unknown }).method === "string" &&
        ((liq as { liquidatedUser?: unknown }).liquidatedUser === undefined ||
          (typeof (liq as { liquidatedUser?: unknown }).liquidatedUser ===
            "string" &&
            ADDRESS.test((liq as { liquidatedUser: string }).liquidatedUser))));
    const oid = idOf(f.oid);
    const tid = idOf(f.tid);
    if (
      typeof f.coin !== "string" ||
      f.coin === "" ||
      typeof f.px !== "string" ||
      !UNSIGNED.test(f.px) ||
      !(Number(f.px) > 0) ||
      typeof f.sz !== "string" ||
      !UNSIGNED.test(f.sz) ||
      !exact(f.sz) ||
      (f.side !== "A" && f.side !== "B") ||
      time === null ||
      typeof f.startPosition !== "string" ||
      !SIGNED.test(f.startPosition) ||
      !exact(f.startPosition) ||
      typeof f.crossed !== "boolean" ||
      oid === null ||
      tid === null ||
      typeof f.dir !== "string" ||
      f.dir === "" ||
      !liqOk
    ) {
      c.failed += 1;
      return;
    }
    const form = formOf(f.coin);
    if (form !== "main") {
      c[form] += 1;
      return;
    }
    if (time < this.o.start) {
      c.early += 1;
      return;
    }
    if (time >= this.o.end) {
      c.late += 1;
      return;
    }
    const kind = this.o.kinds.get(f.dir);
    if (kind === undefined) {
      r.problems.push(`a dir outside dirs.json: ${JSON.stringify(f.dir)}`);
      return;
    }
    if (kind === "outcome") {
      c.outcome += 1;
      return;
    }
    const iid = this.o.iids.get(f.coin);
    if (iid === undefined) {
      r.problems.push(`a coin outside coins.json: ${JSON.stringify(f.coin)}`);
      return;
    }
    c.kept += 1;
    const same = `${user}|${f.coin}|${tid}|${time}|${f.side}|${f.crossed}`;
    if (r.switchFile === 0) this.switchFirst.add(same);
    const l = liq as { liquidatedUser?: string; method: string } | undefined;
    const method = l?.method ?? null;
    const own =
      method !== BACKSTOP_METHOD &&
      f.dir !== ADL_DIR &&
      f.dir !== SETTLEMENT_DIR &&
      f.dir !== VAULT_DIR;
    const px = Number(f.px);
    const sz = Number(f.sz);
    const side = f.side === "B" ? 1 : -1;
    const flags =
      (f.crossed ? FLAG.taker : 0) |
      (l === undefined
        ? 0
        : l.liquidatedUser === undefined
          ? FLAG.unnamed
          : l.liquidatedUser.toLowerCase() === user
            ? FLAG.own
            : FLAG.other) |
      (method === BACKSTOP_METHOD ? FLAG.backstop : 0);
    const row: Row = {
      cells: {
        user,
        time,
        iid,
        px,
        sz,
        side,
        startPosition: Number(f.startPosition),
        oid,
        tid,
        flags,
        dir: f.dir,
        method,
        file: r.index,
      },
      taker: f.crossed,
      own,
      key: `${iid}|${time}|${tid}`,
      repeat: r.switchFile === 1 && this.switchFirst.has(same),
    };
    this.pair(row, r);
    if (f.dir === SETTLEMENT_DIR) {
      const s = r.settled.get(iid) ?? [];
      s.push([time, px, sz]);
      r.settled.set(iid, s);
    }
    if (!f.crossed) return;
    const why =
      method === BACKSTOP_METHOD
        ? "backstop"
        : f.dir === ADL_DIR
          ? "adl"
          : f.dir === SETTLEMENT_DIR
            ? "settlement"
            : f.dir === VAULT_DIR
              ? "vault"
              : null;
    if (why !== null) {
      const x = r.left.get(iid) ?? [];
      x.push([time, why]);
      r.left.set(iid, x);
      return;
    }
    const t = r.takers.get(iid) ?? [];
    t.push({ time, px, sz, side });
    r.takers.set(iid, t);
  }

  /** A trade's two records within the file: both take the taker's reading; two of one side are an odd pair, each its own. */
  private pair(row: Row, r: FileRead): void {
    const other = r.unpaired.get(row.key);
    if (other === undefined) {
      r.unpaired.set(row.key, row);
      return;
    }
    r.unpaired.delete(row.key);
    const market =
      other.taker === row.taker ? null : other.taker ? other.own : row.own;
    this.final(other, market ?? other.own, r);
    this.final(row, market ?? row.own, r);
  }

  /** A row's flags made final, and the row hashed into its file's digest (the day's files only; a repeat is no row). */
  final(row: Row, market: boolean, r: { digest: Digest }): void {
    if (!this.sample || row.repeat) return;
    r.digest.add({
      ...row.cells,
      flags: row.cells.flags | (market ? FLAG.market : 0),
    });
  }
}

export type RereadInput = {
  /** The range's raw store, read past the seals and inside the roots. */
  raw: string;
  roots: readonly string[];
  seal: Seal;
  /** The range's files, in its order. */
  files: readonly FileTask[];
  /** The range's window of record times. */
  start: number;
  end: number;
  iids: ReadonlyMap<string, number>;
  kinds: ReadonlyMap<string, DirKind>;
};

export type RereadFile = {
  index: number;
  key: string;
  classes: Classes;
  count: number;
  digest: string;
};

/** A key's UTC day, read from its own path (`…/hourly/YYYYMMDD/H.lz4`), or null. */
export function dayOfKey(key: string): string | null {
  const m = /\/hourly\/(\d{4})(\d\d)(\d\d)\/\d{1,2}\.lz4$/.exec(key);
  return m === null ? null : `${m[1]}-${m[2]}-${m[3]}`;
}

/** One sample day re-read: each of its files' rows and classes, its minutes' bars by coin, and what it could not read. */
export function rereadDay(
  o: RereadInput,
  day: string,
): {
  files: RereadFile[];
  bars: Map<number, DayBars>;
  from: number;
  minutes: number;
  problems: string[];
} {
  const idx = o.files
    .filter((f) => dayOfKey(f.key) === day)
    .map((f) => f.index);
  if (idx.length === 0)
    throw new StoreError(`${day}: no file of the range is of this day`);
  const first = idx[0]!;
  const last = idx.at(-1)!;
  const window = o.files.slice(Math.max(0, first - 1), last + 2);
  const dayStart = Date.parse(`${day}T00:00:00Z`);
  const from = Math.max(dayStart, o.start);
  const to = Math.min(dayStart + 86_400_000, o.end);
  const minutes = Math.max(0, Math.round((to - from) / MINUTE));
  const bars = new DayBarsSum(from, minutes);
  const switchFirst = new Set<string>();
  const reads = window.map((f) => {
    const inDay = f.index >= first && f.index <= last;
    const reader = new Reader(o, inDay, switchFirst);
    const read = reader.read(f);
    // Each file's bars added as it is read; its takers then dropped.
    bars.add(read);
    read.takers.clear();
    read.left.clear();
    read.settled.clear();
    return { f, inDay, reader, read };
  });
  // The trades split across two files next to each other, in the range's order: the maker takes its taker's reading.
  for (let i = 0; i + 1 < reads.length; i++) {
    const a = reads[i]!.read;
    const b = reads[i + 1]!.read;
    for (const [k, x] of [...a.unpaired]) {
      const y = b.unpaired.get(k);
      if (y === undefined || y.taker === x.taker) continue;
      const market = x.taker ? x.own : y.own;
      a.unpaired.delete(k);
      b.unpaired.delete(k);
      reads[i]!.reader.final(x, market, a);
      reads[i + 1]!.reader.final(y, market, b);
    }
  }
  // What is left unpaired keeps its own reading.
  for (const { reader, read } of reads)
    for (const row of read.unpaired.values()) reader.final(row, row.own, read);
  return {
    files: reads
      .filter((x) => x.inDay)
      .map(({ f, read }) => ({
        index: f.index,
        key: f.key,
        classes: read.classes,
        count: read.digest.count,
        digest: read.digest.hex(),
      })),
    bars: bars.finish(),
    from,
    minutes,
    problems: reads.flatMap(({ f, read }) =>
      read.problems.map((p) => `${f.key}: ${p}`),
    ),
  };
}

/** The day's minutes' bars from the window's files, added as each is read: each file's minutes in its takers' time order, the files in order, then the pairs across files. */
class DayBarsSum {
  private readonly out = new Map<number, DayBars>();
  private readonly lastTime = new Map<number, Float64Array>();
  /** Each coin's latest market taker so far, across files: [time, px, side]. */
  private readonly prev = new Map<number, [number, number, number]>();
  private readonly cross: { iid: number; time: number; gap: number }[] = [];

  constructor(
    private readonly from: number,
    private readonly minutes: number,
  ) {}

  private barsOfCoin(iid: number): DayBars {
    const { out, minutes } = this;
    let b = out.get(iid);
    if (b === undefined) {
      b = Object.fromEntries(
        BAR_COLUMNS.map((c) => [c, new Float64Array(minutes)]),
      ) as DayBars;
      b.last.fill(NaN);
      out.set(iid, b);
    }
    return b;
  }

  add(r: FileRead): void {
    const { from, minutes, lastTime, prev, cross } = this;
    const barsOfCoin = (iid: number) => this.barsOfCoin(iid);
    const coins = new Set([
      ...r.takers.keys(),
      ...r.left.keys(),
      ...r.settled.keys(),
    ]);
    for (const iid of [...coins].sort((x, y) => x - y)) {
      const ts = (r.takers.get(iid) ?? [])
        .map((t, order) => ({ ...t, order }))
        .sort((a, b) => a.time - b.time || a.order - b.order);
      const part = new Map<number, Partial>();
      const at = (t: number) => {
        const k = Math.floor(t / MINUTE);
        let p = part.get(k);
        if (p === undefined) {
          p = empty();
          part.set(k, p);
        }
        return p;
      };
      ts.forEach((t, i) => {
        const p = at(t.time);
        p.trades += 1;
        p.sz += t.sz;
        p.ntl += t.px * t.sz;
        p.lastTime = t.time;
        p.last = t.px;
        const q = ts[i - 1];
        if (
          q !== undefined &&
          q.side !== t.side &&
          t.time - q.time <= PAIR_MS
        ) {
          p.pairGap += Math.abs(t.px - q.px) / ((t.px + q.px) / 2);
          p.pairs += 1;
        }
      });
      for (const [t, why] of r.left.get(iid) ?? []) {
        const p = at(t);
        if (why === "backstop") p.leftBackstop += 1;
        else if (why === "adl") p.leftAdl += 1;
        else if (why === "settlement") p.leftSettlement += 1;
        else p.leftVault += 1;
      }
      for (const [t, px, sz] of r.settled.get(iid) ?? []) {
        const p = at(t);
        p.settleSz += sz;
        p.settleNtl += px * sz;
      }
      const firstT = ts[0];
      const pr = prev.get(iid);
      if (firstT !== undefined && pr !== undefined)
        if (firstT.side !== pr[2] && firstT.time - pr[0] <= PAIR_MS)
          cross.push({
            iid,
            time: firstT.time,
            gap: Math.abs(firstT.px - pr[1]) / ((firstT.px + pr[1]) / 2),
          });
      const lastT = ts.at(-1);
      if (lastT !== undefined)
        prev.set(iid, [lastT.time, lastT.px, lastT.side]);
      for (const [m, p] of [...part].sort((x, y) => x[0] - y[0])) {
        const k = m - from / MINUTE;
        if (k < 0 || k >= minutes) continue;
        const b = barsOfCoin(iid);
        let lt = lastTime.get(iid);
        if (lt === undefined) {
          lt = new Float64Array(minutes).fill(-Infinity);
          lastTime.set(iid, lt);
        }
        for (const c of BAR_COLUMNS)
          if (c !== "last") b[c][k] = b[c][k]! + p[c];
        if (!Number.isNaN(p.last) && p.lastTime >= lt[k]!) {
          lt[k] = p.lastTime;
          b.last[k] = p.last;
        }
      }
    }
  }
  finish(): Map<number, DayBars> {
    for (const x of this.cross) {
      const k = Math.floor((x.time - this.from) / MINUTE);
      if (x.time < this.from || k >= this.minutes) continue;
      const b = this.barsOfCoin(x.iid);
      b.pairGap[k] = b.pairGap[k]! + x.gap;
      b.pairs[k] = b.pairs[k]! + 1;
    }
    return this.out;
  }
}
