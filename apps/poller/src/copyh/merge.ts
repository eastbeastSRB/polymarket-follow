/**
 * The merge (copyh/rules.md C3, the store; the analyzer's merge as the
 * pattern), in units a run can stop between and resume from: every part of
 * the range held first to its input, its code and its lists; then
 * - the trades split across two files next to each other paired from the
 *   parts' unpaired lists, the maker taking its taker's reading; and the
 *   bars' pairs across files, a file whose first market taker of a coin is
 *   timed before the previous file's last one stopping the merge (the
 *   supervisor's ruling 8);
 * - the dictionaries: every address, sorted, so that an id's order is its
 *   address's; the `dir` values and methods, sorted;
 * - the fills by (month, bucket group), or by (month, bucket) when a group
 *   holds more than UNIT_ROWS rows: each bucket's rows by (account, `time`),
 *   ties in the pass's order, a second record of one (account, `time`,
 *   coin, `tid`, side, taker) dropped and counted (the first file's kept),
 *   one that is a market taker stopping the merge (its bars would count it
 *   twice; the supervisor's ruling 4);
 * - the bars by month, every coin with a taker record in it, the parts'
 *   minutes added in file order, the last price the latest in time (ties:
 *   the later file), the pairs across files added;
 * - `files.jsonl`, then the manifest, last.
 * Each unit's files are written whole (unflushed; the manifest holds each to
 * its SHA-256), then its record (flushed); a unit with a record is not
 * redone. No unit starts once the run's minutes are spent or a closed
 * window has begun: the run is not finished (exit 3).
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { PAIR_MS } from "./design.js";
import {
  BARS,
  FILLS,
  barsBlobs,
  partFile,
  readPartHeader,
  readStretch,
  usersOf,
  valuesIn,
  type Head,
  type PartHeader,
} from "./part.js";
import type { FileTask } from "./pass.js";
import { monthBounds, type Range } from "./range.js";
import {
  NotFinished,
  StoreError,
  sha256,
  writeUnflushed,
  writeWhole,
  type Budget,
} from "./run.js";
import {
  FILES_FILE,
  MANIFEST,
  Manifest,
  NAMES_FILE,
  Partition,
  USERS_FILE,
  bucketKey,
  coinKey,
  partitionDir,
} from "./store.js";
import { GROUPS, GROUP_BUCKETS, MARKET, TAKER, bucketOf } from "./writers.js";

/** A merge unit's rows at most, before it runs bucket by bucket [SET from the measured peak: COPYH-STORE's synthetic measurement]. */
export const UNIT_ROWS = 12_000_000;
const MINUTE_MS = 60_000;

const MERGE = "merge";
const UnitRecord = z.object({
  unit: z.string(),
  dict: z.string(),
  partitions: z.array(Partition),
  in: z.number(),
  out: z.number(),
  duplicates: z.array(z.tuple([z.number(), z.string()])),
});
type UnitRecord = z.infer<typeof UnitRecord>;
const DictRecord = z.object({
  parts: z.string(),
  users: z.object({ count: z.number(), bytes: z.number(), sha256: z.string() }),
  names: z.object({ bytes: z.number(), sha256: z.string() }),
});

type Typed = Float64Array | Uint32Array | Uint16Array | Uint8Array | Int8Array;
const raw = (a: Typed) => Buffer.from(a.buffer, a.byteOffset, a.byteLength);
/** `a` at the kept rows, in their order (`pairs`: two values a row). */
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

export type MergeInput = {
  parts: string;
  /** The store's folder, written. */
  dir: string;
  files: readonly FileTask[];
  code: string;
  lists: { coins: string; dirs: string };
  range: Range;
  list: { name: string; sha256: string };
  budget: Budget;
  /** A unit's rows at most before it runs bucket by bucket (UNIT_ROWS; a test passes a small one). */
  unitRows: number;
  log: (event: string, fields: object) => void;
};

/** Each part's header, held to its input, this code and these lists. */
function headsOf(o: MergeInput): (Head & { file: string; index: number })[] {
  return o.files.map((f) => {
    const file = partFile(o.parts, f.index);
    const h = readPartHeader(file);
    if (h === null)
      throw new StoreError(
        `part ${f.index} (${f.key}) is missing or not whole`,
      );
    const x = h.header;
    if (x.input.key !== f.key || x.input.sha256 !== f.sha256)
      throw new StoreError(`part ${f.index} is not of ${f.key} as listed`);
    if (x.code !== o.code)
      throw new StoreError(`part ${f.index} was written by other code`);
    if (x.lists.coins !== o.lists.coins || x.lists.dirs !== o.lists.dirs)
      throw new StoreError(`part ${f.index} was read with other lists`);
    return { ...h, file, index: f.index };
  });
}

/** The trades split across files next to each other, paired: the maker rows to set, by file; the records left unpaired; the count. */
export function straddlesOf(
  heads: readonly { index: number; header: PartHeader }[],
) {
  const patches = new Map<number, Map<string, boolean>>();
  const left = heads.map(
    (h) =>
      new Map(h.header.unpaired.map((u) => [`${u.iid}|${u.time}|${u.tid}`, u])),
  );
  let straddles = 0;
  for (let i = 0; i + 1 < heads.length; i++)
    for (const [k, a] of left[i]!) {
      const b = left[i + 1]!.get(k);
      if (b === undefined || b.taker === a.taker) continue;
      const taker = a.taker ? a : b;
      const [maker, makerFile] = a.taker
        ? [b, heads[i + 1]!.index]
        : [a, heads[i]!.index];
      if (maker.market !== taker.market) {
        const p = patches.get(makerFile) ?? new Map<string, boolean>();
        p.set(`${maker.group}|${maker.row}`, taker.market);
        patches.set(makerFile, p);
      }
      left[i]!.delete(k);
      left[i + 1]!.delete(k);
      straddles += 1;
    }
  const unpaired: [number, number, number, string, boolean][] = [];
  heads.forEach((h, i) => {
    for (const u of left[i]!.values())
      unpaired.push([h.index, u.iid, u.time, u.tid, u.taker]);
  });
  return { patches, unpaired, straddles };
}

/** The bars' pairs across files: a file's first market taker of a coin against the previous file's last; a file out of time order stops the merge. */
export function crossPairsOf(
  heads: readonly { index: number; header: PartHeader }[],
) {
  const prev = new Map<number, [number, number, number]>();
  const pairs: { iid: number; time: number; gap: number }[] = [];
  for (const h of heads)
    for (const c of h.header.bars.coins) {
      const p = prev.get(c.iid);
      if (p !== undefined && c.first !== null) {
        if (c.first[0] < p[0])
          throw new StoreError(
            `part ${h.index}: coin ${c.iid}'s first market taker at ${new Date(c.first[0]).toISOString()} is before the previous file's last at ${new Date(p[0]).toISOString()}: files out of time order need a ruling`,
          );
        if (c.first[2] !== p[2] && c.first[0] - p[0] <= PAIR_MS)
          pairs.push({
            iid: c.iid,
            time: c.first[0],
            gap: Math.abs(c.first[1] - p[1]) / ((c.first[1] + p[1]) / 2),
          });
      }
      if (c.lastTaker !== null) prev.set(c.iid, c.lastTaker);
    }
  return pairs;
}

export function merge(
  o: MergeInput,
  meta: {
    peaks: () => Record<string, unknown>;
    seconds: Record<string, number>;
  },
) {
  const t0 = Date.now();
  mkdirSync(path.join(o.dir, MERGE), { recursive: true });
  const heads = headsOf(o);
  const partsId = sha256(
    JSON.stringify(
      heads.map((h) => [
        h.index,
        h.header.input,
        h.header.code,
        h.header.lists,
      ]),
    ),
  );
  const { patches, unpaired, straddles } = straddlesOf(heads);
  const crossPairs = crossPairsOf(heads);
  const odd = heads.flatMap((h) =>
    h.header.odd.map((k): [number, string] => [h.index, k]),
  );

  // The dictionaries, once: every unit names them.
  const dictFile = path.join(o.dir, MERGE, "dict.json");
  let users: string[];
  let names: { dirs: string[]; methods: string[] };
  if (existsSync(dictFile)) {
    const d = DictRecord.parse(JSON.parse(readFileSync(dictFile, "utf8")));
    if (d.parts !== partsId)
      throw new StoreError(
        `${o.dir}: its merge is of other parts: move it aside`,
      );
    const ub = readFileSync(path.join(o.dir, ...USERS_FILE.split("/")));
    const nb = readFileSync(path.join(o.dir, ...NAMES_FILE.split("/")));
    if (sha256(ub) !== d.users.sha256 || sha256(nb) !== d.names.sha256)
      throw new StoreError(
        `${o.dir}: its dictionaries differ from their record`,
      );
    users = Array.from(
      { length: d.users.count },
      (_, i) => `0x${ub.toString("hex", 20 * i, 20 * i + 20)}`,
    );
    names = JSON.parse(nb.toString("utf8")) as typeof names;
  } else {
    const all = new Set<string>();
    const dirs = new Set<string>();
    const methods = new Set<string>();
    for (const h of heads) {
      for (const u of usersOf(h.file, h)) all.add(u);
      for (const d of h.header.dicts.dirs) dirs.add(d);
      for (const m of h.header.dicts.methods) methods.add(m);
    }
    users = [...all].sort();
    names = { dirs: [...dirs].sort(), methods: [...methods].sort() };
    if (names.dirs.length > 0xff || names.methods.length > 0xfe)
      throw new StoreError("the store's names outgrow their columns");
    const ub = Buffer.concat(users.map((u) => Buffer.from(u.slice(2), "hex")));
    const nb = Buffer.from(`${JSON.stringify(names)}\n`);
    writeWhole(path.join(o.dir, ...USERS_FILE.split("/")), ub);
    writeWhole(path.join(o.dir, ...NAMES_FILE.split("/")), nb);
    writeWhole(
      dictFile,
      `${JSON.stringify({ parts: partsId, users: { count: users.length, bytes: ub.length, sha256: sha256(ub) }, names: { bytes: nb.length, sha256: sha256(nb) } })}\n`,
    );
    o.log("dictionaries", { users: users.length, dirs: names.dirs.length });
  }
  const dictId = sha256(readFileSync(dictFile));
  const userId = new Map(users.map((u, i) => [u, i]));
  const bucketOfId = Uint8Array.from(users, (u) => bucketOf(u));
  const dirId = new Map(names.dirs.map((d, i) => [d, i]));
  const methodId = new Map(names.methods.map((m, i) => [m, i]));

  /** A unit's record, when it was written by this merge. */
  const recordOf = (unit: string): UnitRecord | null => {
    const f = path.join(o.dir, MERGE, `${unit}.json`);
    if (!existsSync(f)) return null;
    const r = UnitRecord.parse(JSON.parse(readFileSync(f, "utf8")));
    if (r.dict !== dictId)
      throw new StoreError(`${unit}: a unit of another merge`);
    return r;
  };
  const records: UnitRecord[] = [];
  const due = () => {
    const why = o.budget.stop();
    if (why !== null) throw new NotFinished(`the merge stopped: ${why}`);
  };

  // The fills, by (month, group), or (month, bucket) when a group is large.
  for (const month of o.range.months) {
    const [from, to] = monthBounds(month);
    /** Each part's accounts as the store's ids, read once a month for its sixteen groups. */
    const ids = new Map<number, Uint32Array>();
    const idsOf = (h: Head & { file: string; index: number }) => {
      let a = ids.get(h.index);
      if (a === undefined) {
        a = Uint32Array.from(usersOf(h.file, h), (x) => userId.get(x)!);
        ids.set(h.index, a);
      }
      return a;
    };
    const lo = Math.max(from, o.range.start);
    const meets = (a: number | null, b: number | null) =>
      a !== null && b !== null && a < to && b >= from;
    for (let g = 0; g < GROUPS; g++) {
      const chosen = heads.filter((h) =>
        meets(h.header.groups[g]!.minTime, h.header.groups[g]!.maxTime),
      );
      const cap = chosen.reduce((s, h) => s + h.header.groups[g]!.rows, 0);
      const runs: (number | null)[] =
        cap > o.unitRows
          ? Array.from({ length: GROUP_BUCKETS }, (_, b) => b)
          : [null];
      for (const only of runs) {
        const unit = `fills-${month}-g${g}${only === null ? "" : `-b${only}`}`;
        const done = recordOf(unit);
        if (done !== null) {
          records.push(done);
          continue;
        }
        due();
        const rows =
          only === null
            ? cap
            : chosen.reduce(
                (s, h) => s + h.header.groups[g]!.buckets[only]!,
                0,
              );
        if (rows > o.unitRows)
          throw new StoreError(
            `${unit}: ${rows} rows, more than the ${o.unitRows} a unit was measured at: a ruling sets a larger size`,
          );
        const r = fillsUnit({
          o,
          chosen,
          g,
          only,
          month,
          lo,
          from,
          to,
          cap: rows,
          idsOf,
          bucketOfId,
          dirId,
          methodId,
          patches,
          dictId,
          unit,
        });
        writeWhole(
          path.join(o.dir, MERGE, `${unit}.json`),
          `${JSON.stringify(r)}\n`,
        );
        records.push(r);
        o.log("unit", {
          unit,
          rows: r.in,
          out: r.out,
          duplicates: r.duplicates.length,
          rssMB: Math.round(process.memoryUsage().rss / 2 ** 20),
        });
      }
    }
    // The bars of the month.
    const unit = `bars-${month}`;
    const done = recordOf(unit);
    if (done !== null) records.push(done);
    else {
      due();
      const r = barsUnit({
        o,
        heads,
        month,
        lo,
        from,
        to,
        crossPairs,
        dictId,
        unit,
      });
      writeWhole(
        path.join(o.dir, MERGE, `${unit}.json`),
        `${JSON.stringify(r)}\n`,
      );
      records.push(r);
      o.log("unit", { unit, coins: r.partitions.length });
    }
  }

  // files.jsonl and the manifest, last.
  const lines = heads.map((h) =>
    JSON.stringify({
      ...h.header.input,
      compressed: h.header.compressed,
      scan: h.header.scan,
      unpaired: h.header.unpaired.length,
      odd: h.header.odd.length,
    }),
  );
  const filesBytes = Buffer.from(`${lines.join("\n")}\n`);
  writeWhole(path.join(o.dir, FILES_FILE), filesBytes);
  const sum = (f: (h: PartHeader) => number) =>
    heads.reduce((s, h) => s + f(h.header), 0);
  const classes: Record<string, number> = {};
  for (const h of heads)
    for (const [k, v] of Object.entries(h.header.scan.classes))
      classes[k] = (classes[k] ?? 0) + v;
  const tally = (pick: (h: PartHeader) => [string, number][]) => {
    const m = new Map<string, number>();
    for (const h of heads)
      for (const [k, v] of pick(h.header)) m.set(k, (m.get(k) ?? 0) + v);
    return [...m].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));
  };
  const coins = new Map<number, [number, number, number, number]>();
  for (const h of heads)
    for (const [iid, n, first, last, settled] of h.header.scan.coins) {
      const c = coins.get(iid);
      if (c === undefined) coins.set(iid, [n, first, last, settled]);
      else {
        c[0] += n;
        c[1] = Math.min(c[1], first);
        c[2] = Math.max(c[2], last);
        if (settled >= 0 && (c[3] < 0 || settled < c[3])) c[3] = settled;
      }
    }
  const ub = readFileSync(path.join(o.dir, ...USERS_FILE.split("/")));
  const nb = readFileSync(path.join(o.dir, ...NAMES_FILE.split("/")));
  const partitions = records.flatMap((r) => r.partitions);
  const manifest: Manifest = {
    version: 1,
    range: o.range.name,
    start: o.range.start,
    end: o.range.end,
    inputs: {
      list: o.list.name,
      listSha256: o.list.sha256,
      coinsSha256: o.lists.coins,
      dirsSha256: o.lists.dirs,
      files: o.files.length,
    },
    code: { fingerprint: o.code, node: process.version },
    dict: {
      users: {
        count: users.length,
        file: { bytes: ub.length, sha256: sha256(ub) },
      },
      names: { bytes: nb.length, sha256: sha256(nb) },
    },
    files: { bytes: filesBytes.length, sha256: sha256(filesBytes) },
    partitions,
    counts: {
      classes,
      seen: sum((h) => h.scan.seen),
      slowLines: sum((h) => h.scan.slowLines),
      slowRecords: sum((h) => h.scan.slowRecords),
      misread: sum((h) => h.scan.misread),
      dirs: tally((h) => h.scan.dirs),
      takers: tally((h) => h.scan.takers),
      coins: [...coins]
        .sort((a, b) => a[0] - b[0])
        .map(([iid, c]) => [iid, ...c]),
      vaults: [...new Set(heads.flatMap((h) => h.header.scan.vaults))].sort(),
      merge: {
        in: records.reduce((s, r) => s + r.in, 0),
        out: records.reduce((s, r) => s + r.out, 0),
        duplicates: records.reduce((s, r) => s + r.duplicates.length, 0),
      },
      straddles,
      unpaired,
      odd,
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

/** One unit of the fills: a month's rows of a group (or of one bucket of it), each bucket's partition written whole. */
function fillsUnit(u: {
  o: MergeInput;
  chosen: readonly (Head & { file: string; index: number })[];
  g: number;
  only: number | null;
  month: string;
  lo: number;
  from: number;
  to: number;
  cap: number;
  idsOf: (h: Head & { file: string; index: number }) => Uint32Array;
  bucketOfId: Uint8Array;
  dirId: ReadonlyMap<string, number>;
  methodId: ReadonlyMap<string, number>;
  patches: ReadonlyMap<number, ReadonlyMap<string, boolean>>;
  dictId: string;
  unit: string;
}): UnitRecord {
  const n0 = u.cap;
  const col = {
    user: new Uint32Array(n0),
    time: new Float64Array(n0),
    iid: new Uint16Array(n0),
    px: new Float64Array(n0),
    sz: new Float64Array(n0),
    side: new Int8Array(n0),
    startPosition: new Float64Array(n0),
    oid: new Uint32Array(2 * n0),
    tid: new Uint32Array(2 * n0),
    flags: new Uint8Array(n0),
    dir: new Uint8Array(n0),
    method: new Uint8Array(n0),
    file: new Uint16Array(n0),
  };
  let n = 0;
  for (const h of u.chosen) {
    const gh = h.header.groups[u.g]!;
    if (gh.rows === 0) continue;
    const st = readStretch(h.file, h, gh);
    const v = Object.fromEntries(
      FILLS.map(([name, type]) => [name, valuesIn(st, gh.blobs[name]!, type)]),
    );
    const ids = u.idsOf(h);
    const dirs = h.header.dicts.dirs.map((d) => u.dirId.get(d)!);
    const methods = [
      0,
      ...h.header.dicts.methods.map((m) => 1 + u.methodId.get(m)!),
    ];
    const patch = u.patches.get(h.index);
    const time = v.time as Float64Array;
    for (let i = 0; i < time.length; i++) {
      const t = time[i]!;
      if (t < u.from || t >= u.to) continue;
      const user = ids[(v.user as Uint32Array)[i]!]!;
      if (u.only !== null && u.bucketOfId[user]! % GROUP_BUCKETS !== u.only)
        continue;
      col.user[n] = user;
      col.time[n] = t;
      col.iid[n] = (v.iid as Uint16Array)[i]!;
      col.px[n] = (v.px as Float64Array)[i]!;
      col.sz[n] = (v.sz as Float64Array)[i]!;
      col.side[n] = (v.side as Int8Array)[i]!;
      col.startPosition[n] = (v.startPosition as Float64Array)[i]!;
      col.oid[2 * n] = (v.oid as Uint32Array)[2 * i]!;
      col.oid[2 * n + 1] = (v.oid as Uint32Array)[2 * i + 1]!;
      col.tid[2 * n] = (v.tid as Uint32Array)[2 * i]!;
      col.tid[2 * n + 1] = (v.tid as Uint32Array)[2 * i + 1]!;
      let flags = (v.flags as Uint8Array)[i]!;
      const set = patch?.get(`${u.g}|${i}`);
      if (set !== undefined) flags = (flags & ~MARKET) | (set ? MARKET : 0);
      col.flags[n] = flags;
      col.dir[n] = dirs[(v.dir as Uint8Array)[i]!]!;
      col.method[n] = methods[(v.method as Uint8Array)[i]!]!;
      col.file[n] = h.index;
      n += 1;
    }
  }
  // Each bucket's rows by (account, time), ties in the pass's order (the gathering's).
  const byBucket = new Map<number, number[]>();
  for (let i = 0; i < n; i++) {
    const b = u.bucketOfId[col.user[i]!]!;
    const l = byBucket.get(b);
    if (l === undefined) byBucket.set(b, [i]);
    else l.push(i);
  }
  const partitions: Partition[] = [];
  const duplicates: [number, string][] = [];
  let out = 0;
  for (const b of [...byBucket.keys()].sort((x, y) => x - y)) {
    const order = byBucket
      .get(b)!
      .sort(
        (x, y) =>
          col.user[x]! - col.user[y]! || col.time[x]! - col.time[y]! || x - y,
      );
    const keep: number[] = [];
    let run = new Set<string>();
    for (let j = 0; j < order.length; j++) {
      const i = order[j]!;
      const p = j > 0 ? order[j - 1]! : -1;
      if (p < 0 || col.user[p] !== col.user[i] || col.time[p] !== col.time[i])
        run = new Set();
      const k = `${col.iid[i]}|${col.tid[2 * i]}|${col.tid[2 * i + 1]}|${col.side[i]}|${col.flags[i]! & TAKER}`;
      if (run.has(k)) {
        if ((col.flags[i]! & TAKER) !== 0 && (col.flags[i]! & MARKET) !== 0)
          throw new StoreError(
            `${u.unit}: a market taker twice (file ${col.file[i]}, ${new Date(col.time[i]!).toISOString()}): its bars would count it twice`,
          );
        duplicates.push([col.file[i]!, k]);
        continue;
      }
      run.add(k);
      keep.push(i);
    }
    out += keep.length;
    const rel = partitionDir("fills", bucketKey(b), u.month);
    const files: Partition["files"] = {};
    for (const [name, a, pairs] of [
      ["user.u32", col.user, false],
      ["time.f64", col.time, false],
      ["iid.u16", col.iid, false],
      ["px.f64", col.px, false],
      ["sz.f64", col.sz, false],
      ["side.i8", col.side, false],
      ["startPosition.f64", col.startPosition, false],
      ["oid.u64", col.oid, true],
      ["tid.u64", col.tid, true],
      ["flags.u8", col.flags, false],
      ["dir.u8", col.dir, false],
      ["method.u8", col.method, false],
      ["file.u16", col.file, false],
    ] as const) {
      const bytes = raw(pick(a as Typed, keep, pairs));
      writeUnflushed(path.join(u.o.dir, ...rel.split("/"), name), bytes);
      files[name] = { bytes: bytes.length, sha256: sha256(bytes) };
    }
    partitions.push({
      table: "fills",
      key: bucketKey(b),
      month: u.month,
      start: u.lo,
      rows: keep.length,
      files,
    });
  }
  return { unit: u.unit, dict: u.dictId, partitions, in: n, out, duplicates };
}

/** One month of the bars: every coin with a taker record in it, the parts' minutes added in file order. */
function barsUnit(u: {
  o: MergeInput;
  heads: readonly (Head & { file: string; index: number })[];
  month: string;
  lo: number;
  from: number;
  to: number;
  crossPairs: readonly { iid: number; time: number; gap: number }[];
  dictId: string;
  unit: string;
}): UnitRecord {
  const hi = Math.min(u.to, u.o.range.end);
  const minutes = Math.max(0, Math.round((hi - u.lo) / MINUTE_MS));
  type Acc = Record<string, Float64Array>;
  const accs = new Map<number, Acc>();
  const accOf = (iid: number) => {
    let a = accs.get(iid);
    if (a === undefined) {
      a = Object.fromEntries(
        [...BARS.map(([n]) => n), "lastTime"].map((n) => [
          n,
          new Float64Array(minutes),
        ]),
      );
      a.last!.fill(NaN);
      a.lastTime!.fill(-Infinity);
      accs.set(iid, a);
    }
    return a;
  };
  for (const h of u.heads) {
    const coins = h.header.bars.coins.filter(
      (c) => c.start < hi && c.start + c.minutes * MINUTE_MS > u.lo,
    );
    if (coins.length === 0) continue;
    const st = readStretch(h.file, h, h.header.bars);
    for (const c of coins) {
      const a = accOf(c.iid);
      const blobs = barsBlobs(c);
      const v = Object.fromEntries(
        BARS.map(([name, type]) => [name, valuesIn(st, blobs[name]!, type)]),
      );
      for (let j = 0; j < c.minutes; j++) {
        const k = Math.round((c.start + j * MINUTE_MS - u.lo) / MINUTE_MS);
        if (k < 0 || k >= minutes) continue;
        for (const name of [
          "trades",
          "sz",
          "ntl",
          "pairGap",
          "pairs",
          "leftBackstop",
          "leftAdl",
          "leftSettlement",
        ])
          a[name]![k] = a[name]![k]! + v[name]![j]!;
        const lt = v.lastTime![j]!;
        if (!Number.isNaN(lt) && lt >= a.lastTime![k]!) {
          a.lastTime![k] = lt;
          a.last![k] = v.last![j]!;
        }
      }
    }
  }
  for (const p of u.crossPairs) {
    const k = Math.floor((p.time - u.lo) / MINUTE_MS);
    if (p.time < u.lo || k >= minutes) continue;
    const a = accOf(p.iid);
    a.pairGap![k] = a.pairGap![k]! + p.gap;
    a.pairs![k] = a.pairs![k]! + 1;
  }
  const partitions: Partition[] = [];
  for (const iid of [...accs.keys()].sort((x, y) => x - y)) {
    const a = accs.get(iid)!;
    const rel = partitionDir("bars", coinKey(iid), u.month);
    const files: Partition["files"] = {};
    for (const [name, type] of BARS) {
      if (name === "lastTime") continue;
      const values = a[name]!;
      const bytes = raw(type === "u32" ? Uint32Array.from(values) : values);
      writeUnflushed(
        path.join(u.o.dir, ...rel.split("/"), `${name}.${type}`),
        bytes,
      );
      files[`${name}.${type}`] = { bytes: bytes.length, sha256: sha256(bytes) };
    }
    partitions.push({
      table: "bars",
      key: coinKey(iid),
      month: u.month,
      start: u.lo,
      rows: minutes,
      files,
    });
  }
  return {
    unit: u.unit,
    dict: u.dictId,
    partitions,
    in: 0,
    out: 0,
    duplicates: [],
  };
}
