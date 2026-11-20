/**
 * The exam's reproduction (src/polish/exam/repro.ts, steps.ts; polish/rules.md
 * P15; THE PLAN D47): (a) a store made again by the extraction, equal to the
 * explored one but for the run's own fields, and every file read back, in
 * look 1's folder (`…\ANALYZER\FRESH\repro`) only under the open seal; (b)
 * a rule's numbers on a part as the choice and c steps print them, held to
 * a printed copy field by field, and the deciding line to placebo.json's;
 * (c) the look's lines, each bps within 1e-9 and every other field equal;
 * the step's held inputs; the built program's settings.
 */
import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { loadResearch, type Research } from "../src/paper/research.js";
import {
  N_FIELDS,
  differs,
  matchExtraction,
  matchLook,
  matchPlacebo,
  partOf,
} from "../src/polish/exam/repro.js";
import {
  heldFile,
  reproEnd,
  reproExtraction,
} from "../src/polish/exam/steps.js";
import { extract } from "../src/polish/extract.js";
import type { Range } from "../src/polish/range.js";
import { GateFailed, exitOf } from "../src/polish/run.js";
import { SEALED, SealedError } from "../src/polish/seal.js";
import {
  Store,
  openStore,
  partitionDir,
  type Manifest,
} from "../src/polish/store.js";
import { B0, place } from "../src/polish/tries/rules.js";
import { E } from "../src/polish/tries/parts.js";
import { CUTS_FILE } from "../src/polish/tries/steps.js";
import { CutsFile } from "../src/polish/tries/trylog.js";
import { fortyOf } from "../src/polish/writers.js";
import { loadCoins } from "../src/waveh/coins.js";
import { PACKAGE_ROOT } from "../src/waveh/gate.js";
import { DATA_END } from "../src/waveh/instants.js";
import { ctxsKey, fundingKey } from "../src/waveh/keys.js";
import type { Spot } from "../src/waveh/positions.js";
import { manifestList } from "../src/waveh/store.js";
import { makeWorld } from "./polish-tries-world.js";
import { addr, trade } from "./polish-world.js";
import { CTXS_HEAD, fillKey, makeStore, sha } from "./waveh-world.js";

const coins = loadCoins();
let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});
const tmp = (name: string) => mkdtempSync(path.join(tmpdir(), `${name}-`));

describe("(a) the extraction made again", { timeout: 60_000 }, () => {
  const T = Date.parse("2025-06-10T10:00:00Z");
  const D = Date.parse("2025-06-10T00:00:00Z");
  const fills = [fillKey(T), fillKey(T + 3_600_000)];
  const files = new Map<string, string>([
    [
      fills[0]!,
      `${trade(addr(1), addr(2), { coin: "SOL", side: "B", time: T + 1000, tid: 1 }).join("\n")}\n`,
    ],
    [
      fills[1]!,
      `${trade(addr(3), addr(2), { coin: "HYPE", side: "A", time: T + 3_601_000, tid: 2 }).join("\n")}\n`,
    ],
    [
      ctxsKey(D),
      `${CTXS_HEAD}\n2025-06-10T10:01:00Z,SOL,0,1,1,1,0,1,150,1,1,1\n`,
    ],
    ...coins.list.map((c) => [fundingKey(c.name, D), "[]"] as [string, string]),
  ]);
  const range: Range = {
    name: "TEST",
    partial: null,
    fill: fills,
    days: [D],
    fundingStarts: [D],
    end: DATA_END,
    grid: { start: D, minutes: 1440 },
    months: ["2025-06"],
  };
  const run = (store: string, root: string, code: string) =>
    extract({
      store,
      root,
      list: manifestList(
        readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
      ),
      // As the reproduction names its list.
      listName: "waveh/data.sha256",
      listSha256: "3".repeat(64),
      range,
      workers: 0,
      code,
      wavehFrozen: "5".repeat(64),
      forty: [...fortyOf(coins)],
      small: coins.list.map((c) => c.name),
      pace: () => Promise.resolve(),
      log: () => {},
    });

  it("passes a store of other code equal file for file, and names each file or field that differs", async () => {
    const { store } = makeStore(files, false);
    const explored = tmp("repro-explored");
    const again = tmp("repro-again");
    await run(store, explored, "4".repeat(64));
    await run(store, again, "6".repeat(64));
    const a = openStore(path.join(explored, "store"));
    const b = () => openStore(path.join(again, "store"));
    // The code, the instant written, the seconds and the peaks differ, and are not compared.
    expect(b().manifest.code).not.toEqual(a.manifest.code);
    let paced = 0;
    const pace = () => {
      paced += 1;
      return Promise.resolve();
    };
    const ok = await matchExtraction(a.manifest, b(), pace);
    expect(paced).toBe(ok.files);
    expect(ok).toMatchObject({ equal: true, problems: [], more: 0 });
    expect(ok.files).toBe(
      3 +
        a.manifest.partitions.reduce(
          (s, p) => s + Object.keys(p.files).length,
          0,
        ),
    );
    // A column's byte changed in the store made again.
    const p = a.manifest.partitions.find(
      (x) => x.table === "tape" && x.coin === "SOL",
    )!;
    const col = Object.keys(p.files).find((f) => f.startsWith("px."))!;
    const rel = `${partitionDir(p.table, p.coin, p.month)}/${col}`;
    const file = path.join(again, "store", ...rel.split("/"));
    const bytes = readFileSync(file);
    bytes[0] = bytes[0]! ^ 1;
    writeFileSync(file, bytes);
    expect(await matchExtraction(a.manifest, b(), pace)).toMatchObject({
      equal: false,
      problems: [`${rel}: differs from the manifest`],
    });
    // A file missing.
    rmSync(file);
    expect((await matchExtraction(a.manifest, b(), pace)).problems).toEqual([
      `${rel}: ENOENT`,
    ]);
    // A count of the manifest's own.
    const other = {
      ...a.manifest,
      counts: { ...a.manifest.counts, badCells: { x: 1 } },
    };
    expect(
      (
        await matchExtraction(
          other,
          openStore(path.join(explored, "store")),
          pace,
        )
      ).problems,
    ).toEqual(["the manifest's counts differs"]);
    // A field the explored manifest lacks.
    const s = openStore(path.join(explored, "store"));
    const wider = new Store(
      s.dir,
      { ...s.manifest, extra: 1 } as unknown as Manifest,
      s.id,
    );
    expect((await matchExtraction(a.manifest, wider, pace)).problems).toEqual([
      "the manifests' fields differ",
    ]);
  });

  it("makes the store again in look 1's folder, …\\ANALYZER\\FRESH\\repro, only under the open seal: closed, nothing is made", async () => {
    const { store } = makeStore(files, false);
    const explored = tmp("repro-explored");
    await run(store, explored, "4".repeat(64));
    const manifest = openStore(path.join(explored, "store")).manifest;
    const root = path.join(tmp("repro-at"), "ANALYZER", "FRESH");
    const o = {
      root,
      raw: store,
      list: manifestList(
        readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
      ),
      listSha256: "3".repeat(64),
      workers: 0,
      code: "6".repeat(64),
      wavehFrozen: "5".repeat(64),
      coins,
      pace: () => Promise.resolve(),
      log: () => {},
    };
    const closed = await reproExtraction(
      { ...o, seal: SEALED },
      manifest,
      range,
    ).catch((e: unknown) => e);
    expect(closed).toBeInstanceOf(SealedError);
    expect((closed as Error).message).toBe(
      `${path.join(root, "repro")}: FRESH is sealed until the polishing's exam is frozen`,
    );
    expect(existsSync(root)).toBe(false);
    expect(
      await reproExtraction(
        { ...o, seal: { examFrozen: true } },
        manifest,
        range,
      ),
    ).toMatchObject({ equal: true, problems: [], more: 0 });
    expect(existsSync(path.join(root, "repro", "store", "manifest.json"))).toBe(
      true,
    );
  });
});

describe("(b) N's numbers and the deciding line", () => {
  it("holds each field to the printed one as JSON, exactly, and names those that differ", () => {
    const got = {
      positions: 10,
      priced: 9,
      left: {},
      unpriced: { "no trade at the exit": 1 },
      stat: { n: 9, mean: 0.1 + 0.2, se: 3, days: 4, markets: 2 },
    };
    const printed = JSON.parse(JSON.stringify(got)) as typeof got;
    expect(differs(got, printed, N_FIELDS)).toEqual([]);
    expect(
      differs(
        got,
        { ...printed, stat: { ...printed.stat, mean: 0.3 } },
        N_FIELDS,
      ),
    ).toEqual(["stat"]);
    expect(
      differs(got, { ...printed, unpriced: {}, priced: 10 }, N_FIELDS),
    ).toEqual(["priced", "unpriced"]);
    expect(N_FIELDS).toEqual([
      "positions",
      "priced",
      "left",
      "unpriced",
      "stat",
    ]);
  });

  it("holds the deciding line's counts to placebo.json's exactly, m and SE to 1e-9 of their size", () => {
    const got = {
      positions: 5_067,
      priced: 4_310,
      left: {},
      unpriced: {},
      stat: {
        n: 4_310,
        mean: 203.3589718434901,
        se: 79.08321017007256,
        seDay: null,
        seMarket: null,
        days: 51,
        markets: 33,
        z: null,
      },
    };
    const printed = {
      positions: 5_067,
      priced: 4_310,
      m: 203.3589718434901 * (1 + 5e-10),
      se: 79.08321017007256,
      days: 51,
      coins: 33,
    };
    expect(matchPlacebo(got, printed)).toEqual([]);
    expect(
      matchPlacebo(got, { ...printed, m: 203.3589718434901 * (1 + 2e-9) }),
    ).toEqual(["m"]);
    expect(
      matchPlacebo(got, { ...printed, positions: 5_066, days: 50, coins: 34 }),
    ).toEqual(["positions", "days", "coins"]);
    expect(
      matchPlacebo(got, {
        ...printed,
        priced: 4_311,
        se: 79.08321017007256 * (1 + 2e-9),
      }),
    ).toEqual(["priced", "se"]);
    expect(matchPlacebo({ ...got, stat: null }, printed)).toEqual([
      "days",
      "coins",
      "m",
      "se",
    ]);
  });

  it("prices a rule's positions on a part as the steps do, the deciding line on its slices alone", async () => {
    const d = makeWorld(kit, true);
    const cuts = CutsFile.parse(
      JSON.parse(readFileSync(CUTS_FILE, "utf8")),
    ).cuts;
    // M = 2: this world's two accounts of a wave are two apart, so every entry lies in slice 0.
    const o = {
      rule: B0,
      part: E,
      M: 2,
      cuts,
      b: 0,
      pace: () => Promise.resolve(),
    };
    const all = await partOf(d, o);
    const p = place(d, B0, E, 2, cuts);
    expect(all.positions).toBe(p.specs.length);
    expect(all.positions).toBeGreaterThan(0);
    expect(p.entries.every((e) => e.slice === 0)).toBe(true);
    expect(await partOf(d, { ...o, slices: 1 })).toEqual(all);
    expect(await partOf(d, { ...o, slices: 0 })).toMatchObject({
      positions: 0,
      priced: 0,
      stat: null,
    });
    expect(all.stat!.n).toBe(all.priced);
    // b re-bases every net.
    const based = await partOf(d, { ...o, b: 10 });
    expect(based.stat!.mean).toBeCloseTo(all.stat!.mean - 10, 9);
  });
});

describe("(c) the look's lines", () => {
  const spot: Spot = {
    slice: 0,
    iid: 5,
    t: 1,
    side: -1,
    dir: 1,
    xIn: 2,
    xOut: 3,
    method: "market",
    accounts: [],
  };
  const priced = {
    net: 12.5,
    unpriced: null,
    gross: 20,
    fees: 9,
    funding: 1.5,
    fundingMissing: 0,
    grossOnMarks: 18,
    excess: 17,
    entryCost: 4,
    legs: [null, null] as [null, null],
    depthShort: false,
  };
  const leg = {
    side: "buy" as const,
    source: "book" as const,
    why: null,
    age: 5,
    file: "f",
    trades: 0,
    tids: [],
    tapeMinusBook: null,
  };
  const line = (p = priced, legs = [leg]) => ({
    set: "WAVE-H",
    spot,
    priced: p,
    legs,
  });

  it("passes each bps field within 1e-9 and every other field equal; names a line beyond, another field, a line missing", () => {
    const prices = [{ priced, legs: [leg] }];
    expect(matchLook([spot], prices, [line()])).toMatchObject({
      equal: true,
      lines: 1,
      priced: 1,
      largestBps: 0,
    });
    const near = matchLook([spot], prices, [
      line({ ...priced, net: 12.5 + 5e-10, excess: 17 - 9e-10 }),
    ]);
    expect(near.equal).toBe(true);
    expect(near.largestBps).toBeCloseTo(9e-10, 13);
    expect(
      matchLook([spot], prices, [line({ ...priced, funding: 1.5 + 2e-9 })]),
    ).toMatchObject({ equal: false, problems: ["line 1 differs"] });
    expect(
      matchLook([spot], prices, [
        line(priced, [{ ...leg, source: "tape" as never }]),
      ]).equal,
    ).toBe(false);
    expect(
      matchLook([spot, spot], [...prices, ...prices], [line()]),
    ).toMatchObject({
      equal: false,
      problems: ["1 lines of the look, 2 positions"],
    });
  });
});

describe("the reproduction's end (repro.json and the exit)", () => {
  const head = {
    step: "reproduce" as const,
    identity: { code: "4".repeat(64) },
    inputs: { list: "3".repeat(64) },
  };
  const b = (e: string[] = [], c: string[] = [], d: string[] = []) => ({
    E: { differs: e },
    C: { differs: c },
    deciding: { differs: d },
  });
  const held = { equal: true };
  const off = { equal: false };
  const written = (root: string) =>
    JSON.parse(readFileSync(path.join(root, "repro.json"), "utf8")) as Record<
      string,
      unknown
    >;

  it("writes passed only when (a), (b) and (c) all held", () => {
    const root = tmp("repro-end");
    const r = reproEnd(
      root,
      head,
      { a: held, b: b(), c: held },
      { written: "2026-11-20T00:00:00.000Z" },
    );
    const text = readFileSync(path.join(root, "repro.json"), "utf8");
    expect(sha(Buffer.from(text))).toBe(r.sha);
    expect(text.endsWith("}\n")).toBe(true);
    expect(Object.keys(written(root))).toEqual([
      "step",
      "identity",
      "inputs",
      "passed",
      "a",
      "b",
      "c",
      "written",
    ]);
    expect(written(root)).toMatchObject({ ...head, passed: true });
  });

  it("writes passed false and stops (exit 6) naming each part that failed, every field of (b) counted", () => {
    for (const [parts, named] of [
      [{ a: off, b: b(), c: held }, "(a) the extraction"],
      [{ a: held, b: b(["stat"]), c: held }, "(b) N's numbers"],
      [{ a: held, b: b([], ["positions"]), c: held }, "(b) N's numbers"],
      [{ a: held, b: b([], [], ["m"]), c: held }, "(b) N's numbers"],
      [{ a: held, b: b(), c: off }, "(c) the look"],
      [
        { a: off, b: b([], ["left"]), c: off },
        "(a) the extraction, (b) N's numbers, (c) the look",
      ],
    ] as const) {
      const root = tmp("repro-end");
      let error: unknown = null;
      try {
        reproEnd(root, head, parts, {});
      } catch (err) {
        error = err;
      }
      expect(error, named).toBeInstanceOf(GateFailed);
      expect(exitOf(error).code).toBe(6);
      expect((error as Error).message).toBe(
        `the reproduction failed: ${named}; see repro.json`,
      );
      expect(written(root).passed, named).toBe(false);
    }
  });
});

describe("the reproduction's held inputs and settings", () => {
  it("reads a file only held to its SHA-256, naming it", () => {
    const dir = tmp("repro-held");
    const file = path.join(dir, "placebo.json");
    expect(() =>
      heldFile(file, "0".repeat(64), "placebo.json in EXAM_ROOT"),
    ).toThrow("no placebo.json in EXAM_ROOT");
    writeFileSync(file, "{}");
    expect(() =>
      heldFile(file, "0".repeat(64), "placebo.json in EXAM_ROOT"),
    ).toThrow(
      `placebo.json in EXAM_ROOT: SHA-256 ${sha(Buffer.from("{}"))}, the exam's ${"0".repeat(64)}`,
    );
    expect(heldFile(file, sha(Buffer.from("{}")), "x").toString()).toBe("{}");
  });

  it("the built program refuses a reproduction without WAVE-H's raw store and look, or inside its folder (exit 2)", () => {
    const program = path.join(PACKAGE_ROOT, "dist", "polish.js");
    const analyzer = tmp("repro-analyzer");
    const root = tmp("repro-root");
    const raw = path.join(tmp("repro-raw"), "WAVE-H", "store");
    const ok = {
      ANALYZER_ROOT: analyzer,
      EXAM_ROOT: root,
      WAVEH_STORE: raw,
      WAVEH_ROOT: tmp("repro-look"),
    };
    for (const [env, why] of [
      [{ ...ok, WAVEH_STORE: "" }, "WAVEH_STORE"],
      [{ ...ok, WAVEH_ROOT: "" }, "WAVEH_ROOT"],
      [
        { ...ok, WAVEH_STORE: path.join(tmp("repro-raw"), "store") },
        "is not WAVE-H's raw store",
      ],
      [
        { ...ok, WAVEH_ROOT: path.join(root, "look") },
        "must lie outside EXAM_ROOT",
      ],
    ] as const) {
      const r = spawnSync(
        process.execPath,
        [program, "exam", "--step", "reproduce"],
        {
          env: { ...process.env, ...env },
          encoding: "utf8",
          timeout: 60_000,
        },
      );
      expect(r.status, why).toBe(2);
      expect(r.stderr, why).toContain(why);
    }
  }, 60_000);
});
