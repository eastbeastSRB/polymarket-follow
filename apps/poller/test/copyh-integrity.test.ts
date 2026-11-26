/**
 * The integrity (src/copyh/integrity.ts, reread.ts, twin.ts, digest.ts;
 * rules.md C15, step 1, 2–3): a made-up store and its twin through every
 * check, passing whole, then each check failed by its own planted fault — a
 * file changed on disk (K0), a partition lost from the manifest (K0's
 * conservation), another data list, coins.json, dirs.json or code, the
 * merge's counts, files.jsonl's counts and a column's size each with its
 * manifest line made to match (K0), a record unpaired in a middle file (K1)
 * and the same record ruled in unpaired.json, one in the last file an edge,
 * a trade of two takers (K1), a cell and a bar changed with their manifest
 * lines made to match (only the re-read sees it: K2), the twin's manifest or
 * a twin file differing (exit 7), the twin's run fields and partition order;
 * a run stopped between units and resumed equal to an unbroken one, another
 * store's unit record never reused; the matching events counted; a sample
 * day read with its neighbour files (a backstop's trade across them, ADL,
 * the vault, a pair across files at 2,000 ms, 15 digits); blank lines, an
 * infinite `px` or `sz`, an `sz` whose double is 0 and the switch hour's
 * repeats read as the store reads them; the re-reader's
 * flags equal to the store's format, its windows below 2 GiB; the digest
 * moved by any one cell.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SWITCH_HOUR } from "../src/copyh/design.js";
import { Digest, rowBytes, type RowCells } from "../src/copyh/digest.js";
import {
  UNIT_BYTES,
  runIntegrity,
  type IntegrityInput,
  type UnpairedFile,
} from "../src/copyh/integrity.js";
import { merge } from "../src/copyh/merge.js";
import { runPass, type FileTask, type PassLists } from "../src/copyh/pass.js";
import { hourKeys, monthsOf } from "../src/copyh/range.js";
import { FLAG, SWITCH_KEYS, WINDOW, eachLine } from "../src/copyh/reread.js";
import {
  BuildsDiffer,
  CheckFailed,
  NotFinished,
  sha256,
} from "../src/copyh/run.js";
import { SEALED } from "../src/copyh/seal.js";
import {
  FILES_FILE,
  MANIFEST,
  Manifest,
  openStore,
  partitionDir,
} from "../src/copyh/store.js";
import { manifestDifferences } from "../src/copyh/twin.js";
import * as W from "../src/copyh/writers.js";
import { HOUR_MS } from "../src/schedule.js";
import {
  COINS,
  DIRS,
  LIST_HASHES,
  addr,
  byBlock,
  keyOf,
  makeStore,
  record,
  trade,
  type FillSpec,
} from "./copyh-world.js";

const H0 = Date.parse("2025-09-15T12:00:00Z");
const RANGE = {
  name: "burnin" as const,
  fill: [] as string[],
  start: H0,
  end: H0 + 3 * HOUR_MS,
  months: monthsOf(H0, H0 + 3 * HOUR_MS),
};
const LISTS: PassLists = {
  iids: COINS.map((c, i) => [c, i] as const),
  kinds: DIRS,
  hashes: LIST_HASHES,
};
const never = { stop: () => null };
const NONE: UnpairedFile = { rule: "none", records: [] };

type WorldOptions = {
  /** A maker unpaired in the middle file. */
  middleUnpaired?: boolean;
  /** A maker unpaired in the last file. */
  lastUnpaired?: boolean;
  /** A trade of two takers in the middle file. */
  odd?: boolean;
};

/** Three files of one day: trades within files, a pair within 2 s, a Settlement, a two-chain matching event, a trade split across files, a maker left unpaired at the first file. */
function texts(o: WorldOptions = {}): Map<string, string> {
  const H1 = H0 + HOUR_MS;
  const H2 = H0 + 2 * HOUR_MS;
  return new Map([
    [
      keyOf(H0),
      `${byBlock(1, [
        ...trade(addr(1), addr(2), {
          coin: "BTC",
          side: "B",
          time: H0 + 1_000,
          tid: 1,
          px: "100",
        }),
        record(addr(9), {
          coin: "BTC",
          side: "A",
          time: H0 + 2_000,
          crossed: false,
          tid: 99,
        }),
        record(addr(3), {
          coin: "@1",
          side: "A",
          time: H0 + 3_000,
          crossed: true,
          tid: 2,
        }),
      ])}\n`,
    ],
    [
      keyOf(H1),
      `${byBlock(2, [
        ...trade(addr(3), addr(4), {
          coin: "SOL",
          side: "B",
          time: H1 + 5_000,
          tid: 3,
          px: "10",
        }),
        ...trade(addr(5), addr(6), {
          coin: "SOL",
          side: "A",
          time: H1 + 5_500,
          tid: 4,
          px: "10.1",
        }),
        // A Settlement trade: its taker left out of the tape, both records in the Settlement sums.
        ...trade(addr(7), addr(16), {
          coin: "HYPE",
          side: "A",
          time: H1 + 9_000,
          tid: 5,
          px: "2.5",
          sz: "4.0",
          dir: "Settlement",
        }),
        // One account's two fills of one oid at one time that make two chains (startPosition 0 and 7).
        record(addr(8), {
          coin: "ETH",
          side: "B",
          time: H1 + 20_000,
          crossed: true,
          tid: 6,
          oid: 77,
          startPosition: "0.0",
          sz: "1.0",
        }),
        record(addr(8), {
          coin: "ETH",
          side: "B",
          time: H1 + 20_000,
          crossed: true,
          tid: 7,
          oid: 77,
          startPosition: "7.0",
          sz: "1.0",
        }),
        record(addr(10), {
          coin: "ETH",
          side: "A",
          time: H1 + 20_000,
          crossed: false,
          tid: 6,
        }),
        record(addr(10), {
          coin: "ETH",
          side: "A",
          time: H1 + 20_000,
          crossed: false,
          tid: 7,
          startPosition: "-2.0",
        }),
        ...(o.middleUnpaired === true
          ? [
              record(addr(11), {
                coin: "ETH",
                side: "A",
                time: H1 + 30_000,
                crossed: false,
                tid: 50,
              }),
            ]
          : []),
        // One trade met with two takers.
        ...(o.odd === true
          ? [18, 19].map((n) =>
              record(addr(n), {
                coin: "ETH",
                side: "B",
                time: H1 + 40_000,
                crossed: true,
                tid: 52,
              }),
            )
          : []),
        // A trade's taker at the hour's end; its maker sits in the next file.
        record(addr(12), {
          coin: "SOL",
          side: "B",
          time: H2 - 100,
          crossed: true,
          tid: 8,
          px: "10.2",
        }),
      ])}\n`,
    ],
    [
      keyOf(H2),
      `${byBlock(3, [
        record(addr(13), {
          coin: "SOL",
          side: "A",
          time: H2 - 100,
          crossed: false,
          tid: 8,
          px: "10.2",
        }),
        ...trade(addr(14), addr(15), {
          coin: "ETH",
          side: "A",
          time: H2 + 60_000,
          tid: 9,
        }),
        ...(o.lastUnpaired === true
          ? [
              record(addr(17), {
                coin: "ETH",
                side: "A",
                time: H2 + 30_000,
                crossed: false,
                tid: 51,
              }),
            ]
          : []),
      ])}\n`,
    ],
  ]);
}

/** A raw store of these files (text by key, in the range's order) over a window, its two builds, and the integrity's input. */
async function worldOf(
  files: ReadonlyMap<string, string>,
  window: { start: number; end: number } = RANGE,
) {
  const s = makeStore(files);
  const tasks: FileTask[] = [...files.keys()].map((key, index) => ({
    index,
    key,
    sha256: s.list.get(key)!,
  }));
  const out = mkdtempSync(path.join(tmpdir(), "copyh-integ-"));
  const range = {
    ...RANGE,
    fill: tasks.map((t) => t.key),
    start: window.start,
    end: window.end,
    months: monthsOf(window.start, window.end),
  };
  const buildInto = async (base: string) => {
    await runPass({
      store: s.store,
      parts: path.join(base, "parts"),
      files: tasks,
      start: range.start,
      end: range.end,
      code: "code-a",
      lists: LISTS,
      workers: 0,
      roots: [s.root, out],
      budget: never,
      log: () => {},
    });
    merge(
      {
        parts: path.join(base, "parts"),
        dir: path.join(base, "store"),
        files: tasks,
        code: "code-a",
        lists: LIST_HASHES,
        range,
        list: { name: "test", sha256: sha256("list") },
        budget: never,
        unitRows: 1_000_000,
        log: () => {},
      },
      { peaks: () => ({}), seconds: {} },
    );
    return path.join(base, "store");
  };
  const first = await buildInto(path.join(out, "first"));
  const second = await buildInto(path.join(out, "twin"));
  const roots = [s.root, out];
  const input = (over: Partial<IntegrityInput> = {}): IntegrityInput => ({
    range,
    files: tasks,
    store: openStore(first, roots),
    twin: openStore(second, roots),
    dir: mkdtempSync(path.join(out, "integrity-")),
    inputs: {
      listSha256: sha256("list"),
      coinsSha256: LIST_HASHES.coins,
      dirsSha256: LIST_HASHES.dirs,
    },
    code: "code-a",
    unpaired: NONE,
    sampleDays: ["2025-09-15"],
    reread: {
      raw: s.store,
      roots,
      seal: SEALED,
      files: tasks,
      start: range.start,
      end: range.end,
      iids: new Map(LISTS.iids),
      kinds: new Map(DIRS),
    },
    budget: never,
    unitBytes: UNIT_BYTES,
    log: () => {},
    ...over,
  });
  return { s, tasks, first, second, roots, input, out };
}

/** The standard world: three files of 2025-09-15 (texts). */
const world = (o: WorldOptions = {}) => worldOf(texts(o));

/** Each input file's records failing the boundary, by the pass (files.jsonl). */
const failedByFile = (storeDir: string, roots: string[]) =>
  (
    openStore(storeDir, roots).fileLines() as {
      scan: { classes: { failed: number } };
    }[]
  ).map((l) => l.scan.classes.failed);

/** A store's manifest edited and written back (the store's id then changes). */
function tamperManifest(storeDir: string, edit: (m: Manifest) => void) {
  const mfile = path.join(storeDir, MANIFEST);
  const m = Manifest.parse(JSON.parse(readFileSync(mfile, "utf8")));
  edit(m);
  writeFileSync(mfile, `${JSON.stringify(m, null, 1)}\n`);
}

/** A partition's file rewritten, and (when `match`) its manifest line made to match its bytes. */
function rewrite(storeDir: string, rel: string, b: Buffer, match: boolean) {
  writeFileSync(path.join(storeDir, ...rel.split("/")), b);
  if (match)
    tamperManifest(storeDir, (m) => {
      for (const p of m.partitions)
        for (const [name, f] of Object.entries(p.files))
          if (`${partitionDir(p.table, p.key, p.month)}/${name}` === rel) {
            f.bytes = b.length;
            f.sha256 = sha256(b);
          }
    });
}

/** A store file's bytes changed in place, and (when `match`) its manifest line made to match. */
function change(
  storeDir: string,
  rel: string,
  edit: (b: Buffer) => void,
  match: boolean,
) {
  const b = readFileSync(path.join(storeDir, ...rel.split("/")));
  edit(b);
  rewrite(storeDir, rel, b, match);
}

/** A column cut short by `by` bytes, its manifest line made to match. */
const truncateColumn = (storeDir: string, rel: string, by: number) =>
  rewrite(
    storeDir,
    rel,
    readFileSync(path.join(storeDir, ...rel.split("/"))).subarray(0, -by),
    true,
  );

type FileLineJson = {
  key: string;
  scan: {
    seen: number;
    classes: Record<string, number>;
    failedBy: [string, number][];
  };
};
/** files.jsonl's lines edited, its manifest line made to match. */
function tamperFiles(storeDir: string, edit: (lines: FileLineJson[]) => void) {
  const file = path.join(storeDir, FILES_FILE);
  const lines = readFileSync(file, "utf8")
    .split("\n")
    .filter((l) => l !== "")
    .map((l) => JSON.parse(l) as FileLineJson);
  edit(lines);
  const b = Buffer.from(`${lines.map((l) => JSON.stringify(l)).join("\n")}\n`);
  writeFileSync(file, b);
  tamperManifest(storeDir, (m) => {
    m.files = { bytes: b.length, sha256: sha256(b) };
  });
}

/** A run's integrity.json, as written. */
const saved = (i: IntegrityInput) =>
  JSON.parse(readFileSync(path.join(i.dir, "integrity.json"), "utf8")) as {
    k0: { pass: boolean; problems: string[] };
    k1: { pass: boolean; odd: unknown[] };
    k2: { pass: boolean; problems: string[] };
  };

const fillsPartOf = (storeDir: string, user: string) => {
  const m = Manifest.parse(
    JSON.parse(readFileSync(path.join(storeDir, MANIFEST), "utf8")),
  );
  return m.partitions.find(
    (p) =>
      p.table === "fills" &&
      p.key === W.bucketOf(user).toString(16).padStart(2, "0"),
  )!;
};

describe("the integrity", { timeout: 60_000 }, () => {
  it("passes a whole store and its twin: K0–K3 and builds.json", async () => {
    const w = await world();
    const i = w.input();
    const r = runIntegrity(i);
    expect([r.k0.pass, r.k1.pass, r.k2.pass]).toEqual([true, true, true]);
    expect(r.k0.problems).toEqual([]);
    // The maker of tid 99 is unpaired in the first file: an edge.
    expect([r.k1.edges, r.k1.listed, r.k1.unexpectedCount]).toEqual([1, 0, 0]);
    expect(r.k2).toMatchObject({ days: ["2025-09-15"], files: 3, count: 0 });
    expect(r.k3.multiChain).toBe(1);
    expect(r.k3.events).toBeGreaterThan(0);
    expect(r.k3.holes.length).toBeGreaterThan(0);
    const builds = JSON.parse(
      readFileSync(path.join(i.dir, "builds.json"), "utf8"),
    ) as { equal: boolean; problems: string[] };
    expect([builds.equal, builds.problems]).toEqual([true, []]);
    const saved = JSON.parse(
      readFileSync(path.join(i.dir, "integrity.json"), "utf8"),
    ) as { passed: boolean };
    expect(saved.passed).toBe(true);
  });

  it("stopped between units and resumed, gives the unbroken result", async () => {
    const w = await world();
    const whole = runIntegrity(w.input());
    const dir = mkdtempSync(path.join(w.out, "integrity-"));
    let calls = 0;
    const stopAfter = {
      stop: () => (calls++ >= 1 ? "its minutes are spent" : null),
    };
    expect(() =>
      runIntegrity(w.input({ dir, budget: stopAfter, unitBytes: 1 })),
    ).toThrow(NotFinished);
    const resumed = runIntegrity(w.input({ dir, unitBytes: 1 }));
    expect({ ...resumed, seconds: 0 }).toEqual({ ...whole, seconds: 0 });
  });

  it("fails K0 on a file changed on disk, and on a partition lost from the manifest", async () => {
    const w = await world();
    const p = fillsPartOf(w.first, addr(3));
    const rel = `${partitionDir("fills", p.key, p.month)}/px.f64`;
    change(w.first, rel, (b) => (b[0] = b[0]! ^ 1), false);
    expect(() => runIntegrity(w.input({ twin: null }))).toThrow(CheckFailed);
    const v = await world();
    const mfile = path.join(v.first, MANIFEST);
    const m = Manifest.parse(JSON.parse(readFileSync(mfile, "utf8")));
    const lost = m.partitions.findIndex((q) => q.table === "fills");
    m.partitions.splice(lost, 1);
    writeFileSync(mfile, `${JSON.stringify(m, null, 1)}\n`);
    const i = v.input({ twin: null });
    expect(() => runIntegrity(i)).toThrow(CheckFailed);
    const saved = JSON.parse(
      readFileSync(path.join(i.dir, "integrity.json"), "utf8"),
    ) as { k0: { problems: string[] } };
    expect(saved.k0.problems.join("\n")).toContain("rows in the store");
  });

  it("fails K1 on a record unpaired in a middle file, and passes it once unpaired.json lists it", async () => {
    const w = await world({ middleUnpaired: true });
    expect(() => runIntegrity(w.input({ twin: null }))).toThrow(CheckFailed);
    const listed: UnpairedFile = {
      rule: "test",
      records: [[w.tasks[1]!.key, 1, H0 + HOUR_MS + 30_000, "50", false]],
    };
    const r = runIntegrity(w.input({ twin: null, unpaired: listed }));
    expect([r.k1.pass, r.k1.listed]).toEqual([true, 1]);
  });

  it("fails K2 on a cell and on a bar changed with their manifest lines made to match, which K0 cannot see", async () => {
    const w = await world();
    const p = fillsPartOf(w.first, addr(5));
    change(
      w.first,
      `${partitionDir("fills", p.key, p.month)}/px.f64`,
      (b) => b.writeDoubleLE(b.readDoubleLE(0) + 0.5, 0),
      true,
    );
    const i = w.input({ twin: null });
    expect(() => runIntegrity(i)).toThrow(CheckFailed);
    const saved = JSON.parse(
      readFileSync(path.join(i.dir, "integrity.json"), "utf8"),
    ) as {
      k0: { pass: boolean };
      k2: { problems: string[] };
    };
    expect(saved.k0.pass).toBe(true);
    expect(saved.k2.problems.join("\n")).toContain("differ from the re-read");
    const v = await world();
    change(
      v.first,
      "bars/002/2025-09/sz.f64",
      (b) => b.writeDoubleLE(1e9, 8 * 65),
      true,
    );
    const j = v.input({ twin: null });
    expect(() => runIntegrity(j)).toThrow(CheckFailed);
    const s2 = JSON.parse(
      readFileSync(path.join(j.dir, "integrity.json"), "utf8"),
    ) as {
      k0: { pass: boolean };
      k2: { problems: string[] };
    };
    expect(s2.k0.pass).toBe(true);
    expect(s2.k2.problems.join("\n")).toContain("bar cells differ");
  });

  it("fails K0 on a store built from another data list, coins.json, dirs.json or code", async () => {
    const w = await world();
    const base = w.input().inputs;
    for (const [key, what] of [
      ["listSha256", "data.sha256's SHA-256"],
      ["coinsSha256", "coins.json's SHA-256"],
      ["dirsSha256", "dirs.json's SHA-256"],
    ] as const) {
      const i = w.input({
        twin: null,
        inputs: { ...base, [key]: "0".repeat(64) },
      });
      expect(() => runIntegrity(i), key).toThrow(CheckFailed);
      expect(saved(i).k0.problems.join("\n"), key).toContain(what);
    }
    const i = w.input({ twin: null, code: "other" });
    expect(() => runIntegrity(i)).toThrow(CheckFailed);
    expect(saved(i).k0.problems.join("\n")).toContain("the code: code-a");
  });

  it("fails K0 when the merge's counts do not add up: in, out and duplicates; in and the files' kept records", async () => {
    const w = await world();
    tamperManifest(w.first, (m) => {
      m.counts.merge.duplicates += 1;
    });
    const i = w.input({ twin: null });
    expect(() => runIntegrity(i)).toThrow(CheckFailed);
    expect(saved(i).k0.problems).toHaveLength(1);
    expect(saved(i).k0.problems[0]).toMatch(/^the merge's in: /);
    const v = await world();
    tamperManifest(v.first, (m) => {
      m.counts.merge.in += 1;
      m.counts.merge.duplicates += 1;
    });
    const j = v.input({ twin: null });
    expect(() => runIntegrity(j)).toThrow(CheckFailed);
    expect(saved(j).k0.problems).toHaveLength(1);
    expect(saved(j).k0.problems[0]).toMatch(/^the merge's rows in: /);
  });

  it("passes a record unpaired in the last file as an edge, and fails K1 on a trade of two takers alone", async () => {
    const w = await world({ lastUnpaired: true });
    const r = runIntegrity(w.input({ twin: null }));
    expect([r.k1.pass, r.k1.edges, r.k1.unexpectedCount]).toEqual([true, 2, 0]);
    const v = await world({ odd: true });
    const i = v.input({ twin: null });
    expect(() => runIntegrity(i)).toThrow(CheckFailed);
    const s = saved(i);
    expect([s.k0.pass, s.k1.pass, s.k2.pass, s.k1.odd.length]).toEqual([
      true,
      false,
      true,
      1,
    ]);
  });

  it("fails on files.jsonl's counts changed with its manifest line made to match: the classes' sum, the failures by why, a value outside the lists, a class the re-read sees", async () => {
    const key = (await world()).tasks[0]!.key;
    const run = async (edit: (l: FileLineJson) => void) => {
      const w = await world();
      tamperFiles(w.first, (lines) => edit(lines[0]!));
      const i = w.input({ twin: null });
      expect(() => runIntegrity(i)).toThrow(CheckFailed);
      return saved(i);
    };
    // The first file holds 3 kept and 1 spot: 4 seen.
    const seen = await run((l) => {
      l.scan.seen += 1;
    });
    expect(seen.k0.problems).toContain(
      `${key}: its classes hold 4 records of 5`,
    );
    const why = await run((l) => {
      l.scan.failedBy = [["frame", 1]];
    });
    expect(why.k0.problems).toEqual([
      `${key}: its failures by why hold 1 records of 0`,
    ]);
    const unknown = await run((l) => {
      l.scan.classes.unknownDir! += 1;
      l.scan.seen += 1;
    });
    expect(unknown.k0.problems).toContain(
      `${key}: 1 dirs and 0 coins outside the lists, 0 misread`,
    );
    const moved = await run((l) => {
      l.scan.classes.spot! -= 1;
      l.scan.classes.builder! += 1;
    });
    expect(moved.k0.pass).toBe(true);
    expect(moved.k2.problems).toContain(
      `${key}: spot 0 in the pass, 1 re-read`,
    );
  });

  it("counts the matching events: one account's fills of one oid and coin at one time", async () => {
    // addr(1) at one time: oid 7 on BTC, oid 8 on BTC, oid 7 on ETH (3 events); its three makers one each: 6.
    const w = await worldOf(
      new Map([
        [
          keyOf(H0),
          `${byBlock(1, [
            ...trade(addr(1), addr(2), {
              coin: "BTC",
              side: "B",
              time: H0 + 1_000,
              tid: 1,
            }),
            ...trade(addr(1), addr(3), {
              coin: "BTC",
              side: "B",
              time: H0 + 1_000,
              tid: 2,
              oid: 8,
            }),
            ...trade(addr(1), addr(4), {
              coin: "ETH",
              side: "B",
              time: H0 + 1_000,
              tid: 3,
            }),
          ])}\n`,
        ],
      ]),
    );
    const r = runIntegrity(w.input({ twin: null }));
    expect([r.k0.pass, r.k1.pass, r.k2.pass]).toEqual([true, true, true]);
    expect([r.k3.events, r.k3.multiChain]).toEqual([6, 0]);
  });

  it("does not reuse a unit's record of another store", async () => {
    const w = await world();
    const dir = mkdtempSync(path.join(w.out, "integrity-"));
    expect(runIntegrity(w.input({ dir, twin: null })).k0.pass).toBe(true);
    const p = fillsPartOf(w.second, addr(3));
    change(
      w.second,
      `${partitionDir("fills", p.key, p.month)}/px.f64`,
      (b) => (b[0] = b[0]! ^ 1),
      false,
    );
    const second = w.input({
      dir,
      store: openStore(w.second, w.roots),
      twin: null,
    });
    expect(() => runIntegrity(second)).toThrow(CheckFailed);
    expect(saved(second).k0.problems.join("\n")).toContain(
      "px.f64: differs from the manifest",
    );
  });

  it("fails K0 on a column whose size does not fit its rows, though its manifest line matches", async () => {
    const w = await world();
    const p = fillsPartOf(w.first, addr(3));
    const rel = `${partitionDir("fills", p.key, p.month)}/px.f64`;
    truncateColumn(w.first, rel, 8);
    const i = w.input({ twin: null });
    expect(() => runIntegrity(i)).toThrow(CheckFailed);
    expect(saved(i).k0.problems).toContain(
      `${rel}: ${8 * (p.rows - 1)} bytes for ${p.rows} rows`,
    );
  });

  it("holds two builds equal but for the run's fields, and sees another partition order or other inputs", async () => {
    const w = await world();
    const a = openStore(w.first, w.roots).manifest;
    const b = structuredClone(a);
    b.written = "x";
    b.seconds = { merge: 99 };
    b.peaks = { x: 1 };
    b.code = { fingerprint: "other", node: "v0" };
    expect(manifestDifferences(a, b)).toEqual([]);
    b.partitions.reverse();
    expect(manifestDifferences(a, b)).toEqual([
      "the partitions are listed in another order",
    ]);
    b.inputs.files += 1;
    expect(manifestDifferences(a, b)).toContain("the manifests' inputs differ");
  });

  it("passes a sample day with its neighbour files, a backstop's trade across them, ADL, the vault, a pair across files at 2,000 ms and 15 significant digits", async () => {
    const day = Date.parse("2025-09-15T00:00:00Z");
    const before = day - 100;
    const w = await worldOf(
      new Map([
        [
          keyOf(day - HOUR_MS),
          `${byBlock(1, [
            record(addr(21), {
              coin: "SOL",
              side: "A",
              time: before,
              crossed: true,
              tid: 70,
              liquidation: {
                liquidatedUser: addr(22),
                markPx: "1",
                method: "backstop",
              },
            }),
          ])}\n`,
        ],
        [
          keyOf(day),
          `${byBlock(2, [
            // The backstop's maker, in the day's first file: it takes the taker's reading from the file before.
            record(addr(23), {
              coin: "SOL",
              side: "B",
              time: before,
              crossed: false,
              tid: 70,
            }),
            ...trade(addr(24), addr(25), {
              coin: "ETH",
              side: "B",
              time: day + 10 * 60_000,
              tid: 73,
              dir: "Auto-Deleveraging",
            }),
            ...trade(addr(26), addr(27), {
              coin: "ETH",
              side: "A",
              time: day + 20 * 60_000,
              tid: 74,
              dir: "Net Child Vaults",
            }),
            ...trade(addr(28), addr(29), {
              coin: "SOL",
              side: "B",
              time: day + 30 * 60_000,
              tid: 75,
              sz: "123456789012345",
            }),
            ...trade(addr(30), addr(31), {
              coin: "BTC",
              side: "B",
              time: day + HOUR_MS - 2_000,
              tid: 71,
              px: "10",
            }),
          ])}\n`,
        ],
        [
          keyOf(day + HOUR_MS),
          `${byBlock(3, [
            ...trade(addr(32), addr(33), {
              coin: "BTC",
              side: "A",
              time: day + HOUR_MS,
              tid: 72,
              px: "10",
            }),
          ])}\n`,
        ],
      ]),
      { start: day - HOUR_MS, end: day + 3 * HOUR_MS },
    );
    const r = runIntegrity(w.input({ twin: null }));
    expect([r.k0.pass, r.k1.pass, r.k2.pass]).toEqual([true, true, true]);
    expect(r.k2).toMatchObject({ days: ["2025-09-15"], files: 2, count: 0 });
    expect(r.counts.straddles).toBe(1);
    // The pair across the hour, 2,000 ms apart, in the store's bars at 01:00 (the range starts at 23:00).
    const store = openStore(w.first, w.roots);
    const bars = store.partition("bars", "000", "2025-09")!;
    expect(store.column(bars, "pairs")[120]).toBe(1);
  });

  it("re-reads startPosition as its double and sz as its text, as the pass reads them, and counts the records read so", async () => {
    const at = (n: number, more: Partial<FillSpec>) =>
      record(addr(n), {
        coin: "SOL",
        side: "B",
        time: H0 + n * 1_000,
        crossed: false,
        tid: n,
        ...more,
      });
    const w = await worldOf(
      new Map([
        [
          keyOf(H0),
          `${byBlock(1, [
            // Kept: a residue under a lot past 15 digits; an exponent form of 15 digits.
            at(1, { startPosition: "1234567.1200000001" }),
            at(2, { startPosition: "0.000000123456789012345" }),
            // Failing: a double of 17 digits; a sz of 16; no double at all.
            at(3, { startPosition: "0.30000000000000004" }),
            at(4, { sz: "1234567.120000001" }),
            at(5, { startPosition: `1${"0".repeat(400)}` }),
          ])}
`,
        ],
      ]),
    );
    const r = runIntegrity(w.input({ twin: null }));
    expect([r.k0.pass, r.k1.pass, r.k2.pass]).toEqual([true, true, true]);
    expect(r.counts.classes).toMatchObject({ kept: 2, failed: 3 });
    const [line] = openStore(w.first, w.roots).fileLines() as {
      scan: { startByDouble: number };
    }[];
    expect(line!.scan.startByDouble).toBe(1);
  });

  it("refuses a px and an sz whose double is Infinity, and an sz whose double is 0, in both readers, and the manifest says why", async () => {
    const at = (n: number, more: Partial<FillSpec>) =>
      record(addr(n), {
        coin: "SOL",
        side: "B",
        time: H0 + n * 1_000,
        crossed: false,
        tid: n,
        ...more,
      });
    const w = await worldOf(
      new Map([
        [
          keyOf(H0),
          `${byBlock(1, [
            at(1, {}),
            at(2, { px: `1${"0".repeat(400)}` }),
            at(3, { sz: `1${"0".repeat(400)}` }),
            at(4, { sz: `0.${"0".repeat(400)}1` }),
          ])}
`,
        ],
      ]),
    );
    const r = runIntegrity(w.input({ twin: null }));
    expect([r.k0.pass, r.k1.pass, r.k2.pass]).toEqual([true, true, true]);
    expect(r.k2).toMatchObject({ days: ["2025-09-15"], files: 1 });
    expect(r.counts.classes).toMatchObject({ kept: 1, failed: 3 });
    expect(openStore(w.first, w.roots).manifest.counts.failedBy).toEqual([
      ["1.px", 1],
      ["1.sz", 2],
    ]);
  });

  it("leaves out an outcome market's records (`#n`) by their coin's form in both readers: a Buy, a Settlement at px 0.0 and one above 0; a perp coin's Settlement kept, forced", async () => {
    const at = (n: number, f: Partial<Omit<FillSpec, "crossed">>) =>
      trade(addr(2 * n), addr(2 * n + 1), {
        coin: "#450",
        side: "B",
        time: H0 + n * 1_000,
        tid: n,
        ...f,
      });
    // The build would stop on a "#n" coin or the dir "Buy" read against the lists.
    const w = await worldOf(
      new Map([
        [
          keyOf(H0),
          `${byBlock(1, [
            ...at(1, { dir: "Buy" }),
            ...at(2, { coin: "#1", dir: "Settlement", px: "0.0" }),
            ...at(3, { coin: "#1", dir: "Settlement", px: "1.0" }),
            ...at(4, { coin: "SOL", dir: "Settlement", px: "151.0" }),
          ])}
`,
        ],
      ]),
    );
    const r = runIntegrity(w.input({ twin: null }));
    expect([r.k0.pass, r.k1.pass, r.k2.pass]).toEqual([true, true, true]);
    expect(r.k2).toMatchObject({ days: ["2025-09-15"], files: 1 });
    expect(r.counts.classes).toMatchObject({
      kept: 2,
      outcome: 6,
      failed: 0,
    });
    const m = openStore(w.first, w.roots).manifest;
    expect([m.counts.failedBy, m.counts.dirs]).toEqual([
      [],
      [["Settlement", 2]],
    ]);
    // SOL (iid 2): both records kept, its first Settlement their time.
    expect(m.counts.coins).toEqual([
      [2, 2, H0 + 4_000, H0 + 4_000, H0 + 4_000],
    ]);
  });

  it("re-reads a blank line as the pass reads it, one failed record: leading, between lines and two trailing", async () => {
    const H1 = H0 + HOUR_MS;
    const H2 = H0 + 2 * HOUR_MS;
    const sol = { coin: "SOL", side: "B" } as const;
    const w = await worldOf(
      new Map([
        [
          keyOf(H0),
          `\n${byBlock(1, trade(addr(1), addr(2), { ...sol, time: H0 + 1_000, tid: 1 }))}\n`,
        ],
        [
          keyOf(H1),
          `${byBlock(2, trade(addr(3), addr(4), { ...sol, time: H1 + 1_000, tid: 2 }))}\n\n${byBlock(3, trade(addr(5), addr(6), { ...sol, time: H1 + 9_000, tid: 3 }))}\n`,
        ],
        [
          keyOf(H2),
          `${byBlock(4, trade(addr(7), addr(8), { ...sol, time: H2 + 1_000, tid: 4 }))}\n\n\n`,
        ],
      ]),
    );
    const r = runIntegrity(w.input({ twin: null }));
    expect([r.k0.pass, r.k1.pass, r.k2.pass]).toEqual([true, true, true]);
    expect(r.k2).toMatchObject({ days: ["2025-09-15"], files: 3, count: 0 });
    expect(failedByFile(w.first, w.roots)).toEqual([1, 1, 2]);
    expect(r.counts.classes).toMatchObject({ kept: 8, failed: 4 });
  });

  it("re-reads the switch hour's second file without the first's records, as the store keeps them once: K0–K2 pass on 2025-07-27", async () => {
    const S = SWITCH_HOUR;
    // A whole ADL trade and a lone maker in both files; one account's taker in the first and its own maker in the second (no repeat: another side).
    const adl = trade(addr(3), addr(4), {
      coin: "SOL",
      side: "A",
      time: S + 2_000,
      tid: 2,
      dir: "Auto-Deleveraging",
    });
    const maker = record(addr(5), {
      coin: "ETH",
      side: "B",
      time: S + 3_000,
      crossed: false,
      tid: 3,
    });
    const self = { coin: "SOL", time: S + 5_000, tid: 5 } as const;
    const w = await worldOf(
      new Map([
        [
          keyOf(S, "node_fills"),
          [
            ...trade(addr(1), addr(2), {
              coin: "BTC",
              side: "B",
              time: S + 1_000,
              tid: 1,
            }),
            ...adl,
            maker,
            record(addr(8), { ...self, side: "B", crossed: true }),
          ]
            .map((l) => `${l}\n`)
            .join(""),
        ],
        [
          keyOf(S),
          `${byBlock(1, [
            ...adl,
            maker,
            record(addr(8), { ...self, side: "A", crossed: false }),
            ...trade(addr(6), addr(7), {
              coin: "BTC",
              side: "A",
              time: S + 60_000,
              tid: 4,
            }),
          ])}\n`,
        ],
      ]),
      { start: S, end: S + HOUR_MS },
    );
    expect(w.tasks.map((t) => t.key)).toEqual(SWITCH_KEYS);
    const r = runIntegrity(w.input({ twin: null, sampleDays: ["2025-07-27"] }));
    expect([r.k0.pass, r.k1.pass, r.k2.pass]).toEqual([true, true, true]);
    expect(r.k2).toMatchObject({ days: ["2025-07-27"], files: 2, count: 0 });
    expect(r.counts.merge).toEqual({
      in: 12,
      out: 9,
      duplicates: 3,
      byFile: [[1, 3]],
    });
    expect([r.counts.straddles, r.k1.edges]).toEqual([1, 2]);
  });

  it("stops on two builds that differ: their manifests, or a file of the second (exit 7)", async () => {
    const w = await world();
    const p = fillsPartOf(w.second, addr(3));
    change(
      w.second,
      `${partitionDir("fills", p.key, p.month)}/sz.f64`,
      (b) => (b[1] = b[1]! ^ 4),
      true,
    );
    expect(() => runIntegrity(w.input())).toThrow(
      "the builds' manifests differ",
    );
    const v = await world();
    const q = fillsPartOf(v.second, addr(3));
    change(
      v.second,
      `${partitionDir("fills", q.key, q.month)}/sz.f64`,
      (b) => (b[1] = b[1]! ^ 4),
      false,
    );
    expect(() => runIntegrity(v.input())).toThrow(BuildsDiffer);
  });
});

describe("the re-reader and the digest", { timeout: 60_000 }, () => {
  it("finds every line in windows of any size as the pass's loop does: a blank one, a line across windows whole, the last without its newline", () => {
    let seed = 7;
    const rnd = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };
    for (let k = 0; k < 200; k++) {
      const text = Array.from({ length: Math.floor(rnd() * 40) }, () =>
        rnd() < 0.3 ? "\n" : String.fromCharCode(97 + Math.floor(rnd() * 26)),
      ).join("");
      // Every piece between newlines is a line, a blank one too; what follows the last newline is one when it is not empty.
      const want = text.split("\n");
      if (want.at(-1) === "") want.pop();
      for (const window of [1, 2, 3, 7, 64]) {
        const got: string[] = [];
        eachLine(Buffer.from(text), window, (l) => got.push(l.toString()));
        expect(got, `${JSON.stringify(text)} by ${window}`).toEqual(want);
      }
    }
  });

  it("names the switch hour's two files as the archive and the pass do, node_fills first", () => {
    expect(SWITCH_KEYS).toEqual([
      "node_fills/hourly/20250727/8.lz4",
      "node_fills_by_block/hourly/20250727/8.lz4",
    ]);
    expect(SWITCH_KEYS).toEqual(hourKeys(SWITCH_HOUR, SWITCH_HOUR + HOUR_MS));
  });

  it("reads the store's flags as writers.ts writes them", () => {
    expect(FLAG).toEqual({
      taker: W.TAKER,
      own: W.OWN_LIQUIDATION,
      other: W.OTHER_LIQUIDATION,
      unnamed: W.UNNAMED_LIQUIDATION,
      backstop: W.BACKSTOP,
      market: W.MARKET,
    });
  });

  it("moves a row's digest with any one cell, a method of none apart from an empty one", () => {
    const base: RowCells = {
      user: addr(1),
      time: H0,
      iid: 2,
      px: 10,
      sz: 1,
      side: 1,
      startPosition: 0,
      oid: 7n,
      tid: 9n,
      flags: 33,
      dir: "Open Long",
      method: null,
      file: 1,
    };
    const one = (r: RowCells) => {
      const d = new Digest();
      d.add(r);
      return d.hex();
    };
    const h = one(base);
    const changes: Partial<RowCells>[] = [
      { user: addr(2) },
      { time: H0 + 1 },
      { iid: 3 },
      { px: 10.000000001 },
      { sz: 2 },
      { side: -1 },
      { startPosition: -1 },
      { oid: 2n ** 64n - 1n },
      { tid: 10n },
      { flags: 32 },
      { dir: "Open Short" },
      { method: "" },
      { method: "market" },
      { file: 2 },
    ];
    for (const c of changes)
      expect(
        one({ ...base, ...c }),
        JSON.stringify(c, (_, v: unknown) =>
          typeof v === "bigint" ? String(v) : v,
        ),
      ).not.toBe(h);
    // The digest of two rows is the same in either order.
    const a = new Digest();
    a.add(base);
    a.add({ ...base, file: 2 });
    const b = new Digest();
    b.add({ ...base, file: 2 });
    b.add(base);
    expect([a.hex(), a.count]).toEqual([b.hex(), 2]);
    expect(rowBytes(base).length).toBeGreaterThan(80);
    // The dir and the method are kept apart: "ab" and "c" are not "a" and "bc".
    expect(one({ ...base, dir: "ab", method: "c" })).not.toBe(
      one({ ...base, dir: "a", method: "bc" }),
    );
  });

  it("searches its decoded bytes in windows below 2 GiB, by the name WINDOW", () => {
    expect(WINDOW).toBe(256 * 2 ** 20);
    expect(WINDOW).toBeLessThan(2 ** 31);
    const source = readFileSync(
      new URL("../src/copyh/reread.ts", import.meta.url),
      "utf8",
    );
    expect(source).toContain("eachLine(text, WINDOW, ");
  });
});
