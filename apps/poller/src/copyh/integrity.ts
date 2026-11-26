/**
 * The store's integrity (copyh/rules.md C15, step 1, 2 and 3), before any
 * position, in units a run can stop between and resume from:
 * - **the twin:** the two builds' manifests equal but for the run's fields
 *   (twin.ts), and every file of the second read back and held to its line,
 *   into `builds.json`; a difference is exit 7;
 * - **K0, whole and conserved:** every file of the store read whole and held
 *   to the manifest; each partition with all its columns, each of its rows'
 *   bytes; the store made from these lists by this code; each input file's
 *   records in exactly one class, its failed records each with one why, no
 *   `dir` or coin outside the lists, none misread; every kept record
 *   conserved: an input file's rows in the store
 *   (by its `file` column) and its dropped duplicates are its kept records,
 *   and the merge's in = out + duplicates;
 * - **K1, one taker and one maker a trade:** no trade met with two records
 *   of one side or a third; every record left unpaired in the range's first
 *   or last file, or listed in `copyh/unpaired.json`;
 * - **K2, the sample days re-read** by reread.ts, sharing no code with the
 *   pass: each sample file's rows equal to the store's, cell by cell (their
 *   count and digest, digest.ts), its records by class equal to the pass's,
 *   and the day's bars equal minute by minute;
 * - **K3, printed:** the holes (holes.ts), the records by day, the matching
 *   events with more than one chain (D12).
 * Written whole to `integrity.json`; a failure of K0–K2 is exit 6, every
 * record listed.
 */
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { WIDTH, type ColumnType } from "../polish/tables.js";
import { MINUTE_MS } from "../schedule.js";
import { chainCount } from "./chains.js";
import { Digest, u64From } from "./digest.js";
import { holesOf } from "./holes.js";
import { ScanJson } from "./part.js";
import type { FileTask } from "./pass.js";
import { monthBounds, type Range } from "./range.js";
import {
  BAR_COLUMNS,
  dayOfKey,
  rereadDay,
  type RereadInput,
} from "./reread.js";
import {
  BuildsDiffer,
  CheckFailed,
  NotFinished,
  StoreError,
  writeWhole,
  type Budget,
} from "./run.js";
import { manifestDifferences } from "./twin.js";
import {
  FILES_FILE,
  NAMES_FILE,
  USERS_FILE,
  partitionDir,
  type Partition,
  type Store,
  type StoredFile,
} from "./store.js";

/** A unit's files at most, in bytes, before the next partition starts a new unit: one holding an 11.6-million-row partition peaked at 346 MB of heap, measured 2026-11-25 (design.ts WORKER_HEAP_GB). */
export const UNIT_BYTES = 2 * 2 ** 30;
/** How many records a list shows before it only counts. */
const SHOWN = 200;

/** A fills partition's columns and a bars partition's, by file name. */
const FILL_FILES = [
  "user.u32",
  "time.f64",
  "iid.u16",
  "px.f64",
  "sz.f64",
  "side.i8",
  "startPosition.f64",
  "oid.u64",
  "tid.u64",
  "flags.u8",
  "dir.u8",
  "method.u8",
  "file.u16",
];
const BAR_FILES = BAR_COLUMNS.map(
  (c) =>
    `${c}.${c === "trades" || c === "pairs" || c.startsWith("left") ? "u32" : "f64"}`,
);

/** `copyh/unpaired.json`: the records ruled unpaired by nature (written from the rehearsal's pass, C15). */
export const UnpairedFile = z.object({
  rule: z.string(),
  /** [file key, iid, time, tid, taker]. */
  records: z.array(
    z.tuple([z.string(), z.number(), z.number(), z.string(), z.boolean()]),
  ),
});
export type UnpairedFile = z.infer<typeof UnpairedFile>;

const UnitRecord = z.object({
  unit: z.string(),
  store: z.string(),
  files: z.number(),
  bytes: z.number(),
  problems: z.array(z.string()),
  rowsByFile: z.array(z.tuple([z.number(), z.number()])),
  /** The sample files' rows here: [file, count, digest]. */
  digests: z.array(z.tuple([z.number(), z.number(), z.string()])),
  events: z.number(),
  multi: z.number(),
  multiShown: z.array(z.string()),
});
type UnitRecord = z.infer<typeof UnitRecord>;

const DayRecord = z.object({
  day: z.string(),
  store: z.string(),
  files: z.array(
    z.object({
      index: z.number(),
      key: z.string(),
      count: z.number(),
      digest: z.string(),
      classes: z.record(z.string(), z.number()),
    }),
  ),
  bars: z.object({ cells: z.number(), differ: z.number() }),
  problems: z.array(z.string()),
});
type DayRecord = z.infer<typeof DayRecord>;

/** A files.jsonl line as the integrity and the engine's holes read it (the merge writes the part header's input and scan). */
export const FileLine = z.object({
  index: z.number(),
  key: z.string(),
  sha256: z.string(),
  scan: ScanJson,
});

export type IntegrityInput = {
  range: Range;
  files: readonly FileTask[];
  store: Store;
  /** The second build, when it exists. */
  twin: Store | null;
  /** The units' records and the outputs, written. */
  dir: string;
  inputs: { listSha256: string; coinsSha256: string; dirsSha256: string };
  code: string;
  unpaired: UnpairedFile;
  sampleDays: readonly string[];
  reread: RereadInput;
  budget: Budget;
  unitBytes: number;
  log: (event: string, fields: object) => void;
};

/** The store's files as units of whole partitions (the dictionaries and files.jsonl first). */
function unitsOf(store: Store, unitBytes: number) {
  const m = store.manifest;
  const units: {
    files: [string, StoredFile][];
    parts: Partition[];
    bytes: number;
  }[] = [
    {
      files: [
        [USERS_FILE, m.dict.users.file],
        [NAMES_FILE, m.dict.names],
        [FILES_FILE, m.files],
      ],
      parts: [],
      bytes: m.dict.users.file.bytes + m.dict.names.bytes + m.files.bytes,
    },
  ];
  for (const p of m.partitions) {
    const bytes = Object.values(p.files).reduce((s, f) => s + f.bytes, 0);
    const u = units.at(-1)!;
    if (u.parts.length > 0 && u.bytes + bytes > unitBytes)
      units.push({ files: [], parts: [p], bytes });
    else {
      u.parts.push(p);
      u.bytes += bytes;
    }
  }
  return units;
}

/** A partition's expected files and their sizes. */
function shapeProblems(p: Partition, range: Range): string[] {
  const rel = partitionDir(p.table, p.key, p.month);
  const want = p.table === "fills" ? FILL_FILES : BAR_FILES;
  const out: string[] = [];
  const names = Object.keys(p.files).sort();
  if (names.join() !== [...want].sort().join())
    out.push(`${rel}: its files are ${names.join(" ")}`);
  if (p.table === "bars") {
    const [a, b] = monthBounds(p.month);
    const minutes = Math.round(
      (Math.min(b, range.end) - Math.max(a, range.start)) / MINUTE_MS,
    );
    if (p.rows !== minutes)
      out.push(`${rel}: ${p.rows} rows, the month's ${minutes} minutes`);
  }
  for (const [name, f] of Object.entries(p.files)) {
    const type = name.slice(name.indexOf(".") + 1) as ColumnType;
    if (!(type in WIDTH) || f.bytes !== p.rows * WIDTH[type])
      out.push(`${rel}/${name}: ${f.bytes} bytes for ${p.rows} rows`);
  }
  return out;
}

/** One unit of the first build: its files read whole and held to the manifest, its rows counted by file, the sample files' rows digested, the matching events' chains counted. */
function firstUnit(
  o: IntegrityInput,
  unit: ReturnType<typeof unitsOf>[number],
  name: string,
  sample: ReadonlySet<number>,
  names: { users: string[]; dirs: string[]; methods: string[] },
): UnitRecord {
  const problems: string[] = [];
  const rowsByFile = new Map<number, number>();
  const digests = new Map<number, Digest>();
  let events = 0;
  let multi = 0;
  const multiShown: string[] = [];
  for (const [rel, want] of unit.files)
    try {
      o.store.bytes(rel, want);
    } catch (err) {
      problems.push((err as Error).message);
    }
  for (const p of unit.parts) {
    const shape = shapeProblems(p, o.range);
    problems.push(...shape);
    let col: Record<string, ArrayLike<number>>;
    try {
      col = Object.fromEntries(
        Object.keys(p.files).map((f) => {
          const c = f.slice(0, f.indexOf("."));
          return [c, o.store.column(p, c)];
        }),
      );
    } catch (err) {
      problems.push((err as Error).message);
      continue;
    }
    if (p.table !== "fills" || shape.length > 0) continue;
    const n = p.rows;
    const file = col.file!;
    for (let i = 0; i < n; i++)
      rowsByFile.set(file[i]!, (rowsByFile.get(file[i]!) ?? 0) + 1);
    const cellsOf = (i: number) => {
      const method = col.method![i]!;
      return {
        user: names.users[col.user![i]!]!,
        time: col.time![i]!,
        iid: col.iid![i]!,
        px: col.px![i]!,
        sz: col.sz![i]!,
        side: col.side![i]!,
        startPosition: col.startPosition![i]!,
        oid: u64From(col.oid![2 * i]!, col.oid![2 * i + 1]!),
        tid: u64From(col.tid![2 * i]!, col.tid![2 * i + 1]!),
        flags: col.flags![i]!,
        dir: names.dirs[col.dir![i]!]!,
        method: method === 0 ? null : names.methods[method - 1]!,
        file: file[i]!,
      };
    };
    for (let i = 0; i < n; i++)
      if (sample.has(file[i]!)) {
        let d = digests.get(file[i]!);
        if (d === undefined) {
          d = new Digest();
          digests.set(file[i]!, d);
        }
        d.add(cellsOf(i));
      }
    // The matching events: one account's fills of one oid, coin and time (one run of equal account and time).
    for (let i = 0; i < n;) {
      let j = i + 1;
      while (
        j < n &&
        col.user![j] === col.user![i] &&
        col.time![j] === col.time![i]
      )
        j++;
      const groups = new Map<string, number[]>();
      for (let k = i; k < j; k++) {
        const g = `${col.oid![2 * k]}|${col.oid![2 * k + 1]}|${col.iid![k]}`;
        const l = groups.get(g);
        if (l === undefined) groups.set(g, [k]);
        else l.push(k);
      }
      events += groups.size;
      for (const rows of groups.values()) {
        if (rows.length < 2) continue;
        const chains = chainCount(
          rows.map((k) => ({
            startPosition: col.startPosition![k]!,
            sz: col.sz![k]!,
            side: col.side![k]!,
          })),
        );
        if (chains > 1) {
          multi += 1;
          if (multiShown.length < SHOWN) {
            const c = cellsOf(rows[0]!);
            multiShown.push(
              `${c.user} ${new Date(c.time).toISOString()} iid ${c.iid} oid ${c.oid}: ${rows.length} fills, ${chains} chains`,
            );
          }
        }
      }
      i = j;
    }
  }
  return {
    unit: name,
    store: o.store.id,
    files:
      unit.files.length +
      unit.parts.reduce((s, p) => s + Object.keys(p.files).length, 0),
    bytes: unit.bytes,
    problems,
    rowsByFile: [...rowsByFile].sort((a, b) => a[0] - b[0]),
    digests: [...digests]
      .sort((a, b) => a[0] - b[0])
      .map(([f, d]) => [f, d.count, d.hex()]),
    events,
    multi,
    multiShown,
  };
}

/** One unit of the second build: every file read back and held to its line, which equals the first's. */
function twinUnit(
  twin: Store,
  unit: ReturnType<typeof unitsOf>[number],
  name: string,
): UnitRecord {
  const problems: string[] = [];
  const all: [string, StoredFile][] = [
    ...unit.files,
    ...unit.parts.flatMap((p) =>
      Object.entries(p.files).map(([f, s]): [string, StoredFile] => [
        `${partitionDir(p.table, p.key, p.month)}/${f}`,
        s,
      ]),
    ),
  ];
  for (const [rel, want] of all)
    try {
      twin.bytes(rel, want);
    } catch (err) {
      problems.push(`the second build's ${(err as Error).message}`);
    }
  return {
    unit: name,
    store: twin.id,
    files: all.length,
    bytes: unit.bytes,
    problems,
    rowsByFile: [],
    digests: [],
    events: 0,
    multi: 0,
    multiShown: [],
  };
}

const sumBy = (pairs: Iterable<readonly [number, number]>) => {
  const m = new Map<number, number>();
  for (const [k, v] of pairs) m.set(k, (m.get(k) ?? 0) + v);
  return m;
};

/** The store's integrity: units resumed from their records, then the checks, `builds.json` (with a twin) and `integrity.json`. */
export function runIntegrity(o: IntegrityInput) {
  const t0 = Date.now();
  const unitsDir = path.join(o.dir, "units");
  mkdirSync(unitsDir, { recursive: true });
  const due = () => {
    const why = o.budget.stop();
    if (why !== null) throw new NotFinished(`the integrity stopped: ${why}`);
  };
  const done = <T>(
    file: string,
    schema: z.ZodType<T>,
    store: string,
  ): T | null => {
    if (!existsSync(file)) return null;
    const r = schema.parse(JSON.parse(readFileSync(file, "utf8")));
    return (r as { store: string }).store === store ? r : null;
  };

  // The twin's manifest first: a difference stops before any file is read.
  const builds =
    o.twin === null
      ? null
      : {
          first: o.store.id,
          second: o.twin.id,
          differences: manifestDifferences(o.store.manifest, o.twin.manifest),
        };
  if (builds !== null && builds.differences.length > 0) {
    writeWhole(
      path.join(o.dir, "builds.json"),
      `${JSON.stringify({ ...builds, equal: false }, null, 1)}\n`,
    );
    throw new BuildsDiffer(
      `the builds' manifests differ: ${builds.differences.slice(0, 5).join("; ")}`,
    );
  }
  const units = unitsOf(o.store, o.unitBytes);
  const sample = new Set(
    o.files
      .filter((f) => o.sampleDays.includes(dayOfKey(f.key) ?? ""))
      .map((f) => f.index),
  );
  const names = {
    users: o.store.users(),
    dirs: o.store.names().dirs,
    methods: o.store.names().methods,
  };
  const records: UnitRecord[] = [];
  const twins: UnitRecord[] = [];
  units.forEach((u, n) => {
    if (o.twin !== null) {
      const file = path.join(unitsDir, `twin-${n}.json`);
      let r = done(file, UnitRecord, o.twin.id);
      if (r === null) {
        due();
        r = twinUnit(o.twin, u, `twin-${n}`);
        writeWhole(file, `${JSON.stringify(r)}\n`);
        o.log("unit", {
          unit: r.unit,
          files: r.files,
          problems: r.problems.length,
        });
      }
      twins.push(r);
    }
    const file = path.join(unitsDir, `first-${n}.json`);
    let r = done(file, UnitRecord, o.store.id);
    if (r === null) {
      due();
      r = firstUnit(o, u, `first-${n}`, sample, names);
      writeWhole(file, `${JSON.stringify(r)}\n`);
      o.log("unit", {
        unit: r.unit,
        files: r.files,
        problems: r.problems.length,
      });
    }
    records.push(r);
  });
  if (builds !== null) {
    const problems = twins.flatMap((r) => r.problems);
    writeWhole(
      path.join(o.dir, "builds.json"),
      `${JSON.stringify({ ...builds, files: twins.reduce((s, r) => s + r.files, 0), problems, equal: problems.length === 0 }, null, 1)}\n`,
    );
    if (problems.length > 0)
      throw new BuildsDiffer(
        `${problems.length} files of the second build differ: ${problems.slice(0, 5).join("; ")}`,
      );
  }

  // K0.
  const m = o.store.manifest;
  const k0: string[] = records.flatMap((r) => r.problems);
  const want = (what: string, got: unknown, expected: unknown) => {
    if (got !== expected)
      k0.push(`${what}: ${String(got)}, not ${String(expected)}`);
  };
  want("the range", m.range, o.range.name);
  want("the window's start", m.start, o.range.start);
  want("the window's end", m.end, o.range.end);
  want("data.sha256's SHA-256", m.inputs.listSha256, o.inputs.listSha256);
  want("coins.json's SHA-256", m.inputs.coinsSha256, o.inputs.coinsSha256);
  want("dirs.json's SHA-256", m.inputs.dirsSha256, o.inputs.dirsSha256);
  want("the input files", m.inputs.files, o.files.length);
  want("the code", m.code.fingerprint, o.code);
  const lines = o.store.fileLines().map((l) => FileLine.parse(l));
  want("files.jsonl's lines", lines.length, o.files.length);
  const rows = sumBy(records.flatMap((r) => r.rowsByFile));
  const dups = new Map(m.counts.merge.byFile);
  let kept = 0;
  lines.forEach((l, i) => {
    const f = o.files[i];
    if (
      f === undefined ||
      l.index !== f.index ||
      l.key !== f.key ||
      l.sha256 !== f.sha256
    )
      k0.push(
        `files.jsonl line ${i + 1} is not of ${f?.key ?? "a listed file"}`,
      );
    const c = l.scan.classes;
    const classes = Object.values(c).reduce((s, v) => s + v, 0);
    if (classes !== l.scan.seen)
      k0.push(
        `${l.key}: its classes hold ${classes} records of ${l.scan.seen}`,
      );
    const failedBy = l.scan.failedBy.reduce((s, [, n]) => s + n, 0);
    if (failedBy !== c.failed)
      k0.push(
        `${l.key}: its failures by why hold ${failedBy} records of ${c.failed}`,
      );
    if (c.unknownDir + c.unknownCoin + l.scan.misread > 0)
      k0.push(
        `${l.key}: ${c.unknownDir} dirs and ${c.unknownCoin} coins outside the lists, ${l.scan.misread} misread`,
      );
    const stored = (rows.get(l.index) ?? 0) + (dups.get(l.index) ?? 0);
    if (stored !== c.kept)
      k0.push(
        `${l.key}: ${c.kept} kept, ${rows.get(l.index) ?? 0} rows in the store and ${dups.get(l.index) ?? 0} duplicates`,
      );
    kept += c.kept;
  });
  want("the merge's rows in", m.counts.merge.in, kept);
  want(
    "the merge's in",
    m.counts.merge.in,
    m.counts.merge.out + m.counts.merge.duplicates,
  );
  want(
    "the fills' rows",
    m.partitions
      .filter((p) => p.table === "fills")
      .reduce((s, p) => s + p.rows, 0),
    m.counts.merge.out,
  );

  // K1.
  const last = o.files.length - 1;
  const ruled = new Set(o.unpaired.records.map((r) => JSON.stringify(r)));
  const edges: unknown[] = [];
  const listed: unknown[] = [];
  const unexpected: unknown[] = [];
  for (const u of m.counts.unpaired) {
    const [file, iid, time, tid, taker] = u;
    const key = o.files[file]?.key ?? String(file);
    if (file === 0 || file === last) edges.push(u);
    else if (ruled.has(JSON.stringify([key, iid, time, tid, taker])))
      listed.push(u);
    else unexpected.push(u);
  }
  const k1 = {
    edges: edges.length,
    listed: listed.length,
    unexpected,
    odd: m.counts.odd,
  };

  // K2: each sample day re-read, a unit each.
  const storeDigests = new Map<number, Digest>();
  for (const r of records)
    for (const [f, count, hex] of r.digests) {
      let d = storeDigests.get(f);
      if (d === undefined) {
        d = new Digest();
        storeDigests.set(f, d);
      }
      d.merge(count, hex);
    }
  const days: DayRecord[] = [];
  for (const day of o.sampleDays) {
    if (!o.files.some((f) => dayOfKey(f.key) === day)) continue;
    const file = path.join(unitsDir, `reread-${day}.json`);
    let r = done(file, DayRecord, o.store.id);
    if (r === null) {
      due();
      r = dayUnit(o, day);
      writeWhole(file, `${JSON.stringify(r)}\n`);
      o.log("unit", {
        unit: `reread-${day}`,
        files: r.files.length,
        problems: r.problems.length,
        barsDiffer: r.bars.differ,
      });
    }
    days.push(r);
  }
  const k2: string[] = days.flatMap((d) => [
    ...d.problems,
    ...(d.bars.differ > 0
      ? [`${d.day}: ${d.bars.differ} bar cells differ`]
      : []),
  ]);
  for (const d of days)
    for (const f of d.files) {
      const s = storeDigests.get(f.index) ?? new Digest();
      if (s.count !== f.count || s.hex() !== f.digest)
        k2.push(
          `${f.key}: the store's ${s.count} rows differ from the re-read ${f.count}`,
        );
      const pass = lines[f.index]?.scan.classes;
      for (const [k, v] of Object.entries(f.classes))
        if (pass?.[k as keyof typeof pass] !== v)
          k2.push(
            `${f.key}: ${k} ${String(pass?.[k as keyof typeof pass])} in the pass, ${v} re-read`,
          );
    }

  // K3, printed.
  const byDay = new Map<string, number>();
  for (const l of lines)
    for (const [h, n] of l.scan.byHour) {
      const d = new Date(h).toISOString().slice(0, 10);
      byDay.set(d, (byDay.get(d) ?? 0) + n);
    }
  const result = {
    range: o.range.name,
    store: o.store.id,
    twin: o.twin?.id ?? null,
    inputs: o.inputs,
    code: o.code,
    k0: {
      pass: k0.length === 0,
      problems: k0.slice(0, SHOWN),
      count: k0.length,
    },
    k1: {
      pass: k1.unexpected.length === 0 && k1.odd.length === 0,
      ...k1,
      unexpected: k1.unexpected.slice(0, SHOWN),
      unexpectedCount: k1.unexpected.length,
    },
    k2: {
      pass: k2.length === 0,
      days: days.map((d) => d.day),
      files: days.reduce((s, d) => s + d.files.length, 0),
      problems: k2.slice(0, SHOWN),
      count: k2.length,
    },
    k3: {
      holes: holesOf(
        lines.map((l) => l.scan.minutes),
        o.range.start,
        o.range.end,
      ),
      days: [...byDay].sort((a, b) => (a[0] < b[0] ? -1 : 1)),
      events: records.reduce((s, r) => s + r.events, 0),
      multiChain: records.reduce((s, r) => s + r.multi, 0),
      multiShown: records.flatMap((r) => r.multiShown).slice(0, SHOWN),
    },
    counts: {
      classes: m.counts.classes,
      dirs: m.counts.dirs,
      takers: m.counts.takers,
      merge: m.counts.merge,
      straddles: m.counts.straddles,
    },
    seconds: Math.round((Date.now() - t0) / 1000),
  };
  const passed = result.k0.pass && result.k1.pass && result.k2.pass;
  writeWhole(
    path.join(o.dir, "integrity.json"),
    `${JSON.stringify({ ...result, passed }, null, 1)}\n`,
  );
  if (!passed)
    throw new CheckFailed(
      `the integrity failed: K0 ${result.k0.count}, K1 ${result.k1.unexpectedCount + result.k1.odd.length}, K2 ${result.k2.count} (integrity.json)`,
    );
  return result;
}

/** A sample day re-read, and its bars held to the store's minute by minute. */
function dayUnit(o: IntegrityInput, day: string): DayRecord {
  const r = rereadDay(o.reread, day);
  const month = day.slice(0, 7);
  let cells = 0;
  let differ = 0;
  const problems = [...r.problems];
  const coins = new Set([
    ...r.bars.keys(),
    ...o.store.manifest.partitions
      .filter((p) => p.table === "bars" && p.month === month)
      .map((p) => Number(p.key)),
  ]);
  for (const iid of [...coins].sort((a, b) => a - b)) {
    const p = o.store.partition("bars", String(iid).padStart(3, "0"), month);
    const re = r.bars.get(iid);
    for (const c of BAR_COLUMNS) {
      let values: ArrayLike<number> | null = null;
      if (p !== null)
        try {
          values = o.store.column(p, c);
        } catch (err) {
          throw new StoreError((err as Error).message);
        }
      const off = p === null ? 0 : Math.round((r.from - p.start) / MINUTE_MS);
      for (let k = 0; k < r.minutes; k++) {
        const a = values === null ? (c === "last" ? NaN : 0) : values[off + k]!;
        const b = re === undefined ? (c === "last" ? NaN : 0) : re[c][k]!;
        cells += 1;
        if (!Object.is(a, b)) {
          differ += 1;
          if (problems.length < SHOWN)
            problems.push(
              `${day}: coin ${iid} ${c} at ${new Date(r.from + k * MINUTE_MS).toISOString()}: the store ${a}, re-read ${b}`,
            );
        }
      }
    }
  }
  return {
    day,
    store: o.store.id,
    files: r.files.map((f) => ({
      index: f.index,
      key: f.key,
      count: f.count,
      digest: f.digest,
      classes: f.classes,
    })),
    bars: { cells, differ },
    problems,
  };
}
