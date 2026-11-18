/**
 * The merge (the polishing plan 4.2(4); decisions 2026-11-17, the plan
 * approved, F3: by month, all coins at once). Every part of the range is
 * first held to its input and its code. The dictionaries come first: every
 * address, sorted, so an id's order is its address's; liq's coins, methods
 * and `dir`s, sorted. Then month by month: each coin's taker rows in H8's
 * order (time, the user's address, `tid`, then the input file's order), a
 * second record of one (time, user, `tid`) dropped and counted (the first
 * file's kept), a `tid` met twice in a coin's month stopping the run; liq
 * alike by (time, coin, user, `tid`, file), a (user, `tid`) met twice
 * stopping it. Written for each month: the 38 coins' tape, liq, the 40
 * coins' minute table (the contexts and the bars from their takers), the 38
 * coins' funding; each file whole, its size and SHA-256 kept; then
 * `files.jsonl` and the manifest, last.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { MINUTE_MS } from "../schedule.js";
import { sha256 } from "../waveh/gate.js";
import { writeWhole } from "../waveh/run.js";
import { StoreError } from "../waveh/store.js";
import type { Contexts, Funding, Grid } from "./ctxs.js";
import { CONTEXT } from "./ctxs.js";
import type { FileTask } from "./pass.js";
import { writeUnflushed } from "./run.js";
import {
  partFile,
  readPart,
  readPartHeader,
  readUsers,
  type PartHeader,
} from "./part.js";
import {
  FILES_FILE,
  MANIFEST,
  NAMES_FILE,
  USERS_FILE,
  partitionDir,
  type FileCounts,
  type Manifest,
  type Partition,
  type StoredFile,
  type Table,
} from "./store.js";
import { BACKSTOP, NONE } from "./writers.js";

/** The first instant of a month `YYYY-MM`, and of the next. */
function monthBounds(month: string): [number, number] {
  const y = Number(month.slice(0, 4));
  const m = Number(month.slice(5, 7)) - 1;
  return [Date.UTC(y, m, 1), Date.UTC(y, m + 1, 1)];
}

/** The months [from, to) touches, in order. */
export function monthsOf(from: number, to: number): string[] {
  const out: string[] = [];
  for (let t = from; t < to;) {
    const month = new Date(t).toISOString().slice(0, 7);
    out.push(month);
    t = monthBounds(month)[1];
  }
  return out;
}

/** liq's float columns. */
const LIQ_F64 = [
  "time",
  "block",
  "px",
  "sz",
  "markPx",
  "startPosition",
  "fee",
  "closedPnl",
] as const;

/** liq's store columns: the part's, then the input file's index. */
const LIQ_FILES: readonly (readonly [string, string])[] = [
  ["time", "time.f64"],
  ["block", "block.f64"],
  ["coin", "coin.u16"],
  ["user", "user.u32"],
  ["liqUser", "liqUser.u32"],
  ["side", "side.i8"],
  ["crossed", "crossed.u8"],
  ["method", "method.u8"],
  ["dir", "dir.u8"],
  ["px", "px.f64"],
  ["sz", "sz.f64"],
  ["markPx", "markPx.f64"],
  ["startPosition", "startPosition.f64"],
  ["fee", "fee.f64"],
  ["closedPnl", "closedPnl.f64"],
  ["tid", "tid.u64"],
  ["oid", "oid.u64"],
  ["file", "file.u16"],
];

type Typed = Float64Array | Uint32Array | Uint16Array | Uint8Array | Int8Array;
const raw = (a: Typed) => Buffer.from(a.buffer, a.byteOffset, a.byteLength);

/** Writes one partition's columns, whole and unflushed (the manifest holds each to its size and SHA-256). */
function writePartition(
  dir: string,
  table: Table,
  coin: string | null,
  month: string,
  start: number,
  rows: number,
  columns: readonly (readonly [string, Typed])[],
): Partition {
  const rel = partitionDir(table, coin, month);
  const files: Record<string, StoredFile> = {};
  for (const [file, values] of columns) {
    const b = raw(values);
    writeUnflushed(path.join(dir, ...rel.split("/"), file), b);
    files[file] = { bytes: b.length, sha256: sha256(b) };
  }
  return { table, coin, month, start, rows, files };
}

/** A coin's taker rows of a month, gathered from the parts (ids already global). */
class Takers {
  n = 0;
  readonly time: Float64Array;
  readonly px: Float64Array;
  readonly sz: Float64Array;
  readonly side: Int8Array;
  readonly flags: Uint8Array;
  readonly user: Uint32Array;
  readonly tid: Uint32Array;
  readonly file: Uint16Array;

  constructor(cap: number) {
    this.time = new Float64Array(cap);
    this.px = new Float64Array(cap);
    this.sz = new Float64Array(cap);
    this.side = new Int8Array(cap);
    this.flags = new Uint8Array(cap);
    this.user = new Uint32Array(cap);
    this.tid = new Uint32Array(2 * cap);
    this.file = new Uint16Array(cap);
  }
}

/** liq's rows of a month (ids already global). */
class Liqs {
  n = 0;
  readonly f64: Record<string, Float64Array>;
  readonly coin: Uint16Array;
  readonly user: Uint32Array;
  readonly liqUser: Uint32Array;
  readonly side: Int8Array;
  readonly crossed: Uint8Array;
  readonly method: Uint8Array;
  readonly dir: Uint8Array;
  readonly tid: Uint32Array;
  readonly oid: Uint32Array;
  readonly file: Uint16Array;

  constructor(cap: number) {
    this.f64 = Object.fromEntries(
      LIQ_F64.map((c) => [c, new Float64Array(cap)]),
    );
    this.coin = new Uint16Array(cap);
    this.user = new Uint32Array(cap);
    this.liqUser = new Uint32Array(cap);
    this.side = new Int8Array(cap);
    this.crossed = new Uint8Array(cap);
    this.method = new Uint8Array(cap);
    this.dir = new Uint8Array(cap);
    this.tid = new Uint32Array(2 * cap);
    this.oid = new Uint32Array(2 * cap);
    this.file = new Uint16Array(cap);
  }
}

/** `a` taken at the kept rows, in their order (`pairs`: two values a row). */
function pick<T extends Typed>(
  a: T,
  keep: readonly number[],
  pairs = false,
): T {
  const C = a.constructor as new (n: number) => T;
  const out = new C(keep.length * (pairs ? 2 : 1));
  if (pairs)
    keep.forEach((i, j) => {
      out[2 * j] = a[2 * i]!;
      out[2 * j + 1] = a[2 * i + 1]!;
    });
  else keep.forEach((i, j) => (out[j] = a[i]!));
  return out;
}

/** Every `tid` (u64 halves) once, else the run stops: in a coin's taker rows a trade has one taker. */
function checkUnique(tid: Uint32Array, what: string): void {
  const b = new BigUint64Array(tid.slice().buffer);
  b.sort();
  for (let i = 1; i < b.length; i++)
    if (b[i] === b[i - 1])
      throw new StoreError(`${what}: the tid ${b[i]} is in two records`);
}

export type MergeInput = {
  parts: string;
  /** The store's folder, written. */
  dir: string;
  files: readonly FileTask[];
  code: string;
  months: readonly string[];
  grid: Grid;
  small: readonly string[];
  forty: readonly string[];
  contexts: Contexts;
  funding: Funding;
  pace: () => Promise<void>;
  log: (event: string, fields: object) => void;
};

/** The manifest's fields the merge does not make. */
export type Meta = Pick<
  Manifest,
  "range" | "partial" | "end" | "minuteStart" | "inputs" | "code"
> & {
  /** Read when the manifest is written, so the merge's own peak is in it. */
  peaks: () => Manifest["peaks"];
  seconds: Record<string, number>;
};

export async function merge(o: MergeInput, meta: Meta): Promise<Manifest> {
  const t0 = Date.now();
  mkdirSync(o.dir, { recursive: true });
  // Every part, of its input and this code.
  const heads = o.files.map((f) => {
    const file = partFile(o.parts, f.index);
    const h = readPartHeader(file);
    if (h === null)
      throw new StoreError(
        `part ${f.index} (${f.key}) is missing or not whole`,
      );
    if (h.header.input.key !== f.key || h.header.input.sha256 !== f.sha256)
      throw new StoreError(`part ${f.index} is not of ${f.key} as listed`);
    if (h.header.code !== o.code)
      throw new StoreError(`part ${f.index} was written by other code`);
    return { ...h, file, index: f.index };
  });
  heads.sort((a, b) => a.index - b.index);
  // The dictionaries.
  const addresses = new Set<string>();
  const coinNames = new Set<string>();
  const methodNames = new Set<string>();
  const dirNames = new Set<string>();
  for (const h of heads) {
    for (const u of readUsers(h.file, h)) addresses.add(u);
    for (const c of h.header.liq.coins) coinNames.add(c);
    for (const m of h.header.liq.methods) methodNames.add(m);
    for (const d of h.header.liq.dirs) dirNames.add(d);
  }
  const users = [...addresses].sort();
  const userId = new Map(users.map((u, i) => [u, i]));
  const names = {
    coins: [...coinNames].sort(),
    methods: [...methodNames].sort(),
    dirs: [...dirNames].sort(),
  };
  if (
    names.coins.length > 0xffff ||
    names.methods.length > 0xff ||
    names.dirs.length > 0xff
  )
    throw new StoreError("liq's names outgrow their columns");
  const idOf = (list: readonly string[]) => new Map(list.map((x, i) => [x, i]));
  const coinId = idOf(names.coins);
  const methodId = idOf(names.methods);
  const dirId = idOf(names.dirs);
  const backstop = methodId.get("backstop") ?? -1;
  const usersBytes = Buffer.concat(
    users.map((u) => Buffer.from(u.slice(2), "hex")),
  );
  writeWhole(path.join(o.dir, ...USERS_FILE.split("/")), usersBytes);
  const namesBytes = Buffer.from(`${JSON.stringify(names)}\n`);
  writeWhole(path.join(o.dir, ...NAMES_FILE.split("/")), namesBytes);
  o.log("dictionaries", { users: users.length, coins: names.coins.length });

  const counts: Record<
    string,
    { in: number; out: number; duplicates: number }
  > = {
    tape: { in: 0, out: 0, duplicates: 0 },
    bars: { in: 0, out: 0, duplicates: 0 },
    liq: { in: 0, out: 0, duplicates: 0 },
  };
  const partitions: Partition[] = [];
  const small = new Set(o.small);
  for (const month of o.months) {
    await o.pace();
    const tm = Date.now();
    const [from, to] = monthBounds(month);
    const meets = (lo: number | null, hi: number | null) =>
      lo !== null && hi !== null && lo < to && hi >= from;
    const chosen = heads.filter(
      (h) =>
        h.header.taker.some((t) => meets(t.minTime, t.maxTime)) ||
        meets(h.header.liq.minTime, h.header.liq.maxTime),
    );
    const cap = new Map<string, number>(o.forty.map((c) => [c, 0]));
    let liqCap = 0;
    for (const h of chosen) {
      for (const t of h.header.taker)
        if (meets(t.minTime, t.maxTime))
          cap.set(t.coin, (cap.get(t.coin) ?? 0) + t.rows);
      if (meets(h.header.liq.minTime, h.header.liq.maxTime))
        liqCap += h.header.liq.rows;
    }
    const takers = new Map(o.forty.map((c) => [c, new Takers(cap.get(c)!)]));
    const liqs = new Liqs(liqCap);
    for (const h of chosen) {
      const p = readPart(h.file);
      const uid = Uint32Array.from(p.users, (u) => userId.get(u)!);
      for (const [coin, cols] of p.taker) {
        const acc = takers.get(coin);
        if (acc === undefined)
          throw new StoreError(`part ${h.index}: ${coin} is not one of the 40`);
        const time = cols.time as Float64Array;
        for (let i = 0; i < time.length; i++) {
          const t = time[i]!;
          if (t < from || t >= to) continue;
          const k = acc.n++;
          acc.time[k] = t;
          acc.px[k] = cols.px![i]!;
          acc.sz[k] = cols.sz![i]!;
          acc.side[k] = cols.side![i]!;
          acc.flags[k] = cols.flags![i]!;
          acc.user[k] = uid[cols.user![i]!]!;
          acc.tid[2 * k] = cols.tid![2 * i]!;
          acc.tid[2 * k + 1] = cols.tid![2 * i + 1]!;
          acc.file[k] = h.index;
        }
      }
      const L = p.liq;
      const coinMap = h.header.liq.coins.map((c) => coinId.get(c)!);
      const methodMap = h.header.liq.methods.map((m) => methodId.get(m)!);
      const dirMap = h.header.liq.dirs.map((d) => dirId.get(d)!);
      const time = L.time as Float64Array;
      for (let i = 0; i < time.length; i++) {
        const t = time[i]!;
        if (t < from || t >= to) continue;
        const k = liqs.n++;
        for (const c of LIQ_F64) liqs.f64[c]![k] = L[c]![i]!;
        liqs.coin[k] = coinMap[L.coin![i]!]!;
        liqs.user[k] = uid[L.user![i]!]!;
        const lu = L.liqUser![i]!;
        liqs.liqUser[k] = lu === NONE ? NONE : uid[lu]!;
        liqs.side[k] = L.side![i]!;
        liqs.crossed[k] = L.crossed![i]!;
        liqs.method[k] = methodMap[L.method![i]!]!;
        liqs.dir[k] = dirMap[L.dir![i]!]!;
        liqs.tid[2 * k] = L.tid![2 * i]!;
        liqs.tid[2 * k + 1] = L.tid![2 * i + 1]!;
        liqs.oid[2 * k] = L.oid![2 * i]!;
        liqs.oid[2 * k + 1] = L.oid![2 * i + 1]!;
        liqs.file[k] = h.index;
      }
    }

    // liq: (time, coin, user, tid, file); the later of one (time, user, tid) dropped.
    const lt = liqs.f64.time!;
    const lorder = Array.from({ length: liqs.n }, (_, i) => i).sort(
      (a, b) =>
        lt[a]! - lt[b]! ||
        liqs.coin[a]! - liqs.coin[b]! ||
        liqs.user[a]! - liqs.user[b]! ||
        liqs.tid[2 * a + 1]! - liqs.tid[2 * b + 1]! ||
        liqs.tid[2 * a]! - liqs.tid[2 * b]! ||
        liqs.file[a]! - liqs.file[b]!,
    );
    const lkeep: number[] = [];
    for (const i of lorder) {
      const j = lkeep.at(-1);
      if (
        j !== undefined &&
        lt[i] === lt[j] &&
        liqs.user[i] === liqs.user[j] &&
        liqs.tid[2 * i] === liqs.tid[2 * j] &&
        liqs.tid[2 * i + 1] === liqs.tid[2 * j + 1]
      )
        continue;
      lkeep.push(i);
    }
    counts.liq!.in += liqs.n;
    counts.liq!.out += lkeep.length;
    counts.liq!.duplicates += liqs.n - lkeep.length;
    const seen = new Set<string>();
    for (const i of lkeep) {
      const k = `${liqs.user[i]}:${liqs.tid[2 * i + 1]}:${liqs.tid[2 * i]}`;
      if (seen.has(k))
        throw new StoreError(
          `liq ${month}: one account's tid is in two records`,
        );
      seen.add(k);
    }
    const liqCols = {
      ...Object.fromEntries(LIQ_F64.map((c) => [c, pick(liqs.f64[c]!, lkeep)])),
      coin: pick(liqs.coin, lkeep),
      user: pick(liqs.user, lkeep),
      liqUser: pick(liqs.liqUser, lkeep),
      side: pick(liqs.side, lkeep),
      crossed: pick(liqs.crossed, lkeep),
      method: pick(liqs.method, lkeep),
      dir: pick(liqs.dir, lkeep),
      tid: pick(liqs.tid, lkeep, true),
      oid: pick(liqs.oid, lkeep, true),
      file: pick(liqs.file, lkeep),
    } as Record<string, Typed>;
    partitions.push(
      writePartition(
        o.dir,
        "liq",
        null,
        month,
        from,
        lkeep.length,
        LIQ_FILES.map(([n, f]) => [f, liqCols[n]!]),
      ),
    );

    // The minute grid of the month.
    const g0 = Math.max(from, o.grid.start);
    const g1 = Math.min(to, o.grid.start + o.grid.minutes * MINUTE_MS);
    const minutes = Math.max(0, (g1 - g0) / MINUTE_MS);
    const off = (g0 - o.grid.start) / MINUTE_MS;

    for (const coin of o.forty) {
      const acc = takers.get(coin)!;
      const order = Array.from({ length: acc.n }, (_, i) => i).sort(
        (a, b) =>
          acc.time[a]! - acc.time[b]! ||
          acc.user[a]! - acc.user[b]! ||
          acc.tid[2 * a + 1]! - acc.tid[2 * b + 1]! ||
          acc.tid[2 * a]! - acc.tid[2 * b]! ||
          acc.file[a]! - acc.file[b]!,
      );
      const keep: number[] = [];
      for (const i of order) {
        const j = keep.at(-1);
        if (
          j !== undefined &&
          acc.time[i] === acc.time[j] &&
          acc.user[i] === acc.user[j] &&
          acc.tid[2 * i] === acc.tid[2 * j] &&
          acc.tid[2 * i + 1] === acc.tid[2 * j + 1]
        )
          continue;
        keep.push(i);
      }
      const tid = pick(acc.tid, keep, true);
      checkUnique(tid, `${coin} ${month}`);
      const table = small.has(coin) ? counts.tape! : counts.bars!;
      table.in += acc.n;
      table.out += keep.length;
      table.duplicates += acc.n - keep.length;
      const time = pick(acc.time, keep);
      const px = pick(acc.px, keep);
      const sz = pick(acc.sz, keep);
      const side = pick(acc.side, keep);
      const flags = pick(acc.flags, keep);
      if (small.has(coin))
        partitions.push(
          writePartition(o.dir, "tape", coin, month, from, keep.length, [
            ["time.f64", time],
            ["px.f64", px],
            ["sz.f64", sz],
            ["side.i8", side],
            ["flags.u8", flags],
            ["user.u32", pick(acc.user, keep)],
            ["tid.u64", tid],
          ]),
        );
      // The bars: the takers but the backstop's; its notional apart; the coin's counted fills by forced side.
      const trades = new Uint32Array(minutes);
      const buyNtl = new Float64Array(minutes);
      const sellNtl = new Float64Array(minutes);
      const backstopNtl = new Float64Array(minutes);
      const last = new Float64Array(minutes).fill(NaN);
      const high = new Float64Array(minutes).fill(NaN);
      const low = new Float64Array(minutes).fill(NaN);
      const liqBuyNtl = new Float64Array(minutes);
      const liqSellNtl = new Float64Array(minutes);
      for (let j = 0; j < time.length; j++) {
        const k = Math.floor((time[j]! - g0) / MINUTE_MS);
        if (k < 0 || k >= minutes)
          throw new StoreError(
            `${coin} ${month}: a taker row outside the minute grid`,
          );
        const n = px[j]! * sz[j]!;
        if (flags[j]! & BACKSTOP) {
          backstopNtl[k] = backstopNtl[k]! + n;
          continue;
        }
        trades[k] = trades[k]! + 1;
        if (side[j]! > 0) buyNtl[k] = buyNtl[k]! + n;
        else sellNtl[k] = sellNtl[k]! + n;
        last[k] = px[j]!;
        if (!(high[k]! >= px[j]!)) high[k] = px[j]!;
        if (!(low[k]! <= px[j]!)) low[k] = px[j]!;
      }
      const cid = coinId.get(coin);
      const lc = liqCols;
      for (let j = 0; j < lkeep.length; j++) {
        if (cid === undefined || lc.coin![j] !== cid) continue;
        const user = lc.user![j]!;
        const own = lc.liqUser![j] !== NONE && lc.liqUser![j] === user;
        const s = lc.side![j]!;
        const reducing = Math.sign(lc.startPosition![j]!) === -s;
        if (
          !own ||
          !reducing ||
          !(lc.crossed![j] === 1 || lc.method![j] === backstop)
        )
          continue;
        const k = Math.floor((lc.time![j]! - g0) / MINUTE_MS);
        if (k < 0 || k >= minutes) continue;
        const n = lc.px![j]! * lc.sz![j]!;
        if (s > 0) liqBuyNtl[k] = liqBuyNtl[k]! + n;
        else liqSellNtl[k] = liqSellNtl[k]! + n;
      }
      const ctx = o.contexts.byCoin.get(coin)!;
      partitions.push(
        writePartition(o.dir, "minute", coin, month, g0, minutes, [
          ...CONTEXT.map(
            ([name]) =>
              [
                `${name}.f64`,
                ctx.get(name)!.subarray(off, off + minutes),
              ] as const,
          ),
          ["trades.u32", trades],
          ["buyNtl.f64", buyNtl],
          ["sellNtl.f64", sellNtl],
          ["backstopNtl.f64", backstopNtl],
          ["last.f64", last],
          ["high.f64", high],
          ["low.f64", low],
          ["liqBuyNtl.f64", liqBuyNtl],
          ["liqSellNtl.f64", liqSellNtl],
        ]),
      );
      if (small.has(coin)) {
        const rows = (o.funding.byCoin.get(coin) ?? []).filter(
          ([, , stamp]) => stamp >= from && stamp < to,
        );
        partitions.push(
          writePartition(o.dir, "funding", coin, month, from, rows.length, [
            ["time.f64", Float64Array.from(rows, (r) => r[2])],
            ["rate.f64", Float64Array.from(rows, (r) => r[1])],
          ]),
        );
      }
      // The coin's month written: its rows are freed before the next coin's.
      takers.delete(coin);
    }
    o.log("month", {
      month,
      parts: chosen.length,
      liq: lkeep.length,
      seconds: Math.round((Date.now() - tm) / 1000),
      rssMB: Math.round(process.memoryUsage().rss / 2 ** 20),
    });
  }
  partitions.sort(
    (a, b) =>
      (a.table < b.table ? -1 : a.table > b.table ? 1 : 0) ||
      ((a.coin ?? "") < (b.coin ?? "")
        ? -1
        : (a.coin ?? "") > (b.coin ?? "")
          ? 1
          : 0) ||
      (a.month < b.month ? -1 : a.month > b.month ? 1 : 0),
  );
  const lines = heads.map(
    ({ header: h, index }: { header: PartHeader; index: number }) => {
      const line: FileCounts = {
        index,
        key: h.input.key,
        sha256: h.input.sha256,
        compressed: h.compressed,
        ...h.scan,
        topTaker: h.topTaker,
        takerRows: h.taker.reduce((s, t) => s + t.rows, 0),
        liqRows: h.liq.rows,
      };
      return JSON.stringify(line);
    },
  );
  const filesBytes = Buffer.from(`${lines.join("\n")}\n`);
  writeWhole(path.join(o.dir, FILES_FILE), filesBytes);
  const c = o.contexts;
  const manifest: Manifest = {
    version: 1,
    range: meta.range,
    partial: meta.partial,
    end: meta.end,
    minuteStart: meta.minuteStart,
    inputs: meta.inputs,
    code: meta.code,
    dict: {
      users: {
        count: users.length,
        file: { bytes: usersBytes.length, sha256: sha256(usersBytes) },
      },
      names: { bytes: namesBytes.length, sha256: sha256(namesBytes) },
    },
    files: { bytes: filesBytes.length, sha256: sha256(filesBytes) },
    partitions,
    counts: {
      ctxsByDay: Object.fromEntries(c.byDay),
      ctxsLarge: c.large,
      badCells: Object.fromEntries(c.badCells),
      funding: Object.fromEntries(o.funding.counts),
      merge: counts,
    },
    peaks: meta.peaks(),
    seconds: { ...meta.seconds, merge: Math.round((Date.now() - t0) / 1000) },
    written: new Date().toISOString(),
  };
  writeWhole(
    path.join(o.dir, MANIFEST),
    `${JSON.stringify(manifest, null, 1)}\n`,
  );
  return manifest;
}
