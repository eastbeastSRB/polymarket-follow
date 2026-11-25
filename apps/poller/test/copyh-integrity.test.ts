/**
 * The integrity (src/copyh/integrity.ts, reread.ts, twin.ts, digest.ts;
 * rules.md C15, step 1, 2–3): a made-up store and its twin through every
 * check, passing whole, then each check failed by its own planted fault — a
 * file changed on disk (K0), a partition lost from the manifest (K0's
 * conservation), a record unpaired in a middle file (K1) and the same record
 * ruled in unpaired.json, a cell and a bar changed with their manifest lines
 * made to match (only the re-read sees it: K2), the twin's manifest or a twin
 * file differing (exit 7); a run stopped between units and resumed equal to
 * an unbroken one; the re-reader's flags equal to the store's format; the
 * digest moved by any one cell.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { Digest, rowBytes, type RowCells } from "../src/copyh/digest.js";
import {
  UNIT_BYTES,
  runIntegrity,
  type IntegrityInput,
  type UnpairedFile,
} from "../src/copyh/integrity.js";
import { merge } from "../src/copyh/merge.js";
import { runPass, type FileTask, type PassLists } from "../src/copyh/pass.js";
import { monthsOf } from "../src/copyh/range.js";
import { FLAG } from "../src/copyh/reread.js";
import {
  BuildsDiffer,
  GateFailed,
  NotFinished,
  sha256,
} from "../src/copyh/run.js";
import { SEALED } from "../src/copyh/seal.js";
import {
  MANIFEST,
  Manifest,
  openStore,
  partitionDir,
} from "../src/copyh/store.js";
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

/** Three files of one day: trades within files, a pair within 2 s, a Settlement, a two-chain matching event, a trade split across files, a maker left unpaired at the first file. */
function texts(middleUnpaired = false): Map<string, string> {
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
        ...(middleUnpaired
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
      ])}\n`,
    ],
  ]);
}

/** The world's raw store, its two builds, and the integrity's input. */
async function world(o: { middleUnpaired?: boolean } = {}) {
  const files = texts(o.middleUnpaired);
  const s = makeStore(files);
  const tasks: FileTask[] = [...files.keys()].map((key, index) => ({
    index,
    key,
    sha256: s.list.get(key)!,
  }));
  const out = mkdtempSync(path.join(tmpdir(), "copyh-integ-"));
  const range = { ...RANGE, fill: tasks.map((t) => t.key) };
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

/** A store file's bytes changed in place, and (when `match`) its manifest line made to match. */
function change(
  storeDir: string,
  rel: string,
  edit: (b: Buffer) => void,
  match: boolean,
) {
  const file = path.join(storeDir, ...rel.split("/"));
  const b = readFileSync(file);
  edit(b);
  writeFileSync(file, b);
  if (!match) return;
  const mfile = path.join(storeDir, MANIFEST);
  const m = Manifest.parse(JSON.parse(readFileSync(mfile, "utf8")));
  for (const p of m.partitions) {
    const dir = partitionDir(p.table, p.key, p.month);
    for (const [name, f] of Object.entries(p.files))
      if (`${dir}/${name}` === rel) f.sha256 = sha256(b);
  }
  writeFileSync(mfile, `${JSON.stringify(m, null, 1)}\n`);
}

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
    expect(() => runIntegrity(w.input({ twin: null }))).toThrow(GateFailed);
    const v = await world();
    const mfile = path.join(v.first, MANIFEST);
    const m = Manifest.parse(JSON.parse(readFileSync(mfile, "utf8")));
    const lost = m.partitions.findIndex((q) => q.table === "fills");
    m.partitions.splice(lost, 1);
    writeFileSync(mfile, `${JSON.stringify(m, null, 1)}\n`);
    const i = v.input({ twin: null });
    expect(() => runIntegrity(i)).toThrow(GateFailed);
    const saved = JSON.parse(
      readFileSync(path.join(i.dir, "integrity.json"), "utf8"),
    ) as { k0: { problems: string[] } };
    expect(saved.k0.problems.join("\n")).toContain("rows in the store");
  });

  it("fails K1 on a record unpaired in a middle file, and passes it once unpaired.json lists it", async () => {
    const w = await world({ middleUnpaired: true });
    expect(() => runIntegrity(w.input({ twin: null }))).toThrow(GateFailed);
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
    expect(() => runIntegrity(i)).toThrow(GateFailed);
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
    expect(() => runIntegrity(j)).toThrow(GateFailed);
    const s2 = JSON.parse(
      readFileSync(path.join(j.dir, "integrity.json"), "utf8"),
    ) as {
      k0: { pass: boolean };
      k2: { problems: string[] };
    };
    expect(s2.k0.pass).toBe(true);
    expect(s2.k2.problems.join("\n")).toContain("bar cells differ");
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
  });
});
