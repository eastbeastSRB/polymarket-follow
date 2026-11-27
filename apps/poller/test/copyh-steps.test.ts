/**
 * COPY-H's steps (src/copyh/steps.ts; rules.md C15, C0's identity, C13's
 * counts, C16's stop), behind the gate, on made-up data:
 * - step 1's refusals in C15's order, each exit 5: a second step 1; the
 *   rehearsal's store sealed; repro.json missing, not JSON, not of its
 *   form, another program's or not passed; each value set before the freeze
 *   unset;
 * - E's store held to its record (A'): equal, the rehearsal's build its
 *   twin and none built; not equal, the twin built and compared, the
 *   difference listed; a resumed run building and checking nothing again; a
 *   twin that differs (exit 7) still recorded in builds.json;
 * - C16's stop over every set projected: MAIN's look set and each try's,
 *   each above 1% named, a try projected without its conditions on the prior
 *   mean net saying so; none past the tripwire;
 * - on the phases' world through real child processes, every part of every
 *   phase: the engine stopped at the tripwire above 1% (exit 6), its phases
 *   closed up to TRIPWIRE and none priced, then run on with
 *   --past-tripwire from the closed phases; the look's writes in C15's
 *   order, the positions' lines held to RESULT's hash and the file to
 *   result.json's, each output's identity first, the step's counts beside
 *   RESULT's prints; result.json written before the file is renamed into
 *   place and before report.json (a rename refused leaves result.json alone);
 * - the rehearsal's priced fortnight, in memory: on the whole world's window
 *   its lines are RESULT's positions' lines, and its folder holds only the
 *   unpriced phases; a window before the copy holds none;
 * - the identity's lists and files by SHA-256, a missing one refused; the
 *   logs copied beside the outputs;
 * - step 2's refusals in C15's order, each exit 5: a second step 2,
 *   repro.json, an unset value, step 1's three files not those
 *   `copyh/look1.sha256` lists (a file changed, a list of another form),
 *   E's store not that step 1's result.json names, no choice; S's store
 *   with no record (the twin always built); step 1's positions recomputed
 *   held to its result.json's (exit 6); through real child processes,
 *   CONFIRM: each chosen try's set on S with every condition, the prior
 *   mean net's among them, its statistic and reading, and MAIN on S alone;
 * - FRESH-2's stage's engine through RANK with no look: MAIN's whole set
 *   stops nothing, the judged sets alone do, no RESULT, and runEngine refuses
 *   a run with no look; SEALED through real child processes: every line
 *   hashed as RESULT hashes it, each judged set's copies on FRESH-2, its
 *   statistic and sealed reading, MAIN's prints in FRESH-2's form, none
 *   without MAIN;
 * - the engine end to end (the engine's plan, section 12): a run stopped
 *   inside a phase and resumed under a raised heap gives every phase's
 *   record of an unbroken run; a run of other inputs over its closed phases
 *   is refused (exit 5); a step's engine run the same at any heap but for
 *   the heap itself (its lanes' thresholds never scaled), RESULT one child
 *   at the heap cap.
 */
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { confirmationOf } from "../src/copyh/confirm.js";
import { fresh2Report, sealedOf } from "../src/copyh/fresh2.js";
import { runPhase } from "../src/copyh/engine.js";
import { confirmOf, confirmParts } from "../src/copyh/phase-confirm.js";
import {
  sealedParts,
  sealedReportOf,
  sealedResultOf,
  type SealedSet,
} from "../src/copyh/phase-sealed.js";
import { printCopyOf, reportOf } from "../src/copyh/prints.js";
import { TryLine, inTry, judgedOf, type Try } from "../src/copyh/tries.js";
import { statisticOf } from "../src/copyh/verdict.js";
import { loadResearch } from "../src/paper/research.js";
import {
  positionLines,
  reportFrom,
  resultOf,
} from "../src/copyh/phase-result.js";
import {
  AlreadyRun,
  BuildsDiffer,
  CheckFailed,
  NotFinished,
  PACKAGE_ROOT,
  StoreError,
  exitOf,
  fingerprintOf,
  sha256,
} from "../src/copyh/run.js";
import {
  END_S,
  WORKER_HEAP_CAP_GB,
  WORKER_HEAP_GB,
} from "../src/copyh/design.js";
import { LANE_HISTORY_FILLS } from "../src/copyh/phase-build.js";
import { LANE_LABEL_FILLS } from "../src/copyh/phase-labels.js";
import { SEALED } from "../src/copyh/seal.js";
import {
  FORTNIGHT_MINUTES,
  StoreRecord,
  LOOK_FILES,
  copyLogs,
  engineRunOf,
  fortnightOf,
  heldLookFiles,
  heldRecomputed,
  heldStepStore,
  heldStores,
  readyForStep2,
  identityOf,
  pricedPhases,
  readyForStep1,
  runEngine,
  stepCounts,
  tripwireStop,
  writeLook,
  type EngineRecords,
  type EngineRun,
} from "../src/copyh/steps.js";
import type { TrySet } from "../src/copyh/phase-tripwire.js";
import type { Projection } from "../src/copyh/tripwire.js";
import { MANIFEST, openStore, type Manifest } from "../src/copyh/store.js";
import { HOUR_MS } from "../src/schedule.js";
import { COINS, addr, trade } from "./copyh-world.js";
import {
  A,
  END,
  M1,
  M2,
  SEAL,
  START,
  V,
  X,
  at,
  engineDir,
  fundingWorld,
  phaseWorld,
} from "./copyh-phase-world.js";

const temp = (name: string) =>
  mkdtempSync(path.join(tmpdir(), `copyh-${name}-`));
const codeOf = (f: () => unknown): number | null => {
  try {
    f();
  } catch (err) {
    return exitOf(err).code;
  }
  return null;
};
const never = { stop: () => null };

describe("step 1's refusals (C15, in its order)", () => {
  const values = {
    labelFills: 13_000_000,
    historyFills: 8_500_000,
    markMinutes: 5,
  } as const;

  it("refuses a second step 1, the rehearsal's store, a repro.json not passed by this program and an unset value, each exit 5, in that order", () => {
    const root = path.join(temp("steps"), "COPY-H");
    const write = (rel: string, text: string) => {
      mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
      writeFileSync(path.join(root, rel), text);
    };
    write("look1/result.json", "{}");
    write("E/store/manifest.json", "{}");
    const ready =
      (v: Parameters<typeof readyForStep1>[0]["values"] = values) =>
      () =>
        readyForStep1({ root, program: "this", values: v });
    expect(ready()).toThrow(AlreadyRun);
    expect(codeOf(ready())).toBe(5);
    rmSync(path.join(root, "look1", "result.json"));
    expect(ready()).toThrow(/the rehearsal's store is sealed/);
    expect(codeOf(ready())).toBe(5);
    rmSync(path.join(root, "E", "store", "manifest.json"));
    for (const [text, why] of [
      [null, /no reproduction's record that parses/],
      ["{not json", /no reproduction's record that parses/],
      [`{"identity":{},"passed":true}`, /is not the reproduction's record/],
      [
        `{"identity":{"program":"other"},"passed":true}`,
        /another program's \(other\)/,
      ],
      [`{"identity":{"program":"this"},"passed":false}`, /did not pass/],
    ] as const) {
      if (text !== null) write("repro.json", text);
      expect(ready()).toThrow(StoreError);
      expect(ready()).toThrow(why);
    }
    write(
      "repro.json",
      `{"identity":{"program":"this"},"passed":true,"report":1}`,
    );
    expect(
      ready({ labelFills: null, historyFills: null, markMinutes: null }),
    ).toThrow(
      "set before the freeze, and unset: LABEL_FILLS_MAX, HISTORY_FILLS_MAX, SETTLEMENT_MARK_MINUTES (C17)",
    );
    for (const [k, name] of [
      ["labelFills", "LABEL_FILLS_MAX"],
      ["historyFills", "HISTORY_FILLS_MAX"],
      ["markMinutes", "SETTLEMENT_MARK_MINUTES"],
    ] as const) {
      const v = ready({ ...values, [k]: null });
      expect(v).toThrow(`unset: ${name} (C17)`);
      expect(codeOf(v)).toBe(5);
    }
    expect(ready()()).toEqual(values);
  });
});

const H = "0".repeat(64);
/** A made-up store manifest of its kind; `kept` its one count, `written` a run field. */
const manifestOf = (kept: number, written: string): Manifest => ({
  version: 1,
  range: "E",
  start: 0,
  end: 1,
  inputs: {
    list: "data.sha256",
    listSha256: H,
    coinsSha256: H,
    dirsSha256: H,
    files: 1,
  },
  code: { fingerprint: written, node: "v0" },
  dict: {
    users: { count: 0, file: { bytes: 0, sha256: H } },
    names: { bytes: 0, sha256: H },
  },
  files: { bytes: 0, sha256: H },
  partitions: [],
  counts: {
    classes: { kept },
    failedBy: [],
    seen: kept,
    slowLines: 0,
    slowRecords: 0,
    misread: 0,
    dirs: [],
    takers: [],
    coins: [],
    vaults: [],
    merge: { in: kept, out: kept, duplicates: 0, byFile: [] },
    straddles: 0,
    unpaired: [],
    odd: [],
  },
  peaks: { pass: written },
  seconds: { pass: written.length },
  written,
});

describe("E's store held to its record (A', C15 step 1's 2.)", () => {
  /** A look's folder, its builds writing `kept` (the first) or `twinKept`, its check writing the integrity's files: the twin's comparison when a twin is built. */
  function fakes(o: { twinKept: number; twinEqual?: boolean }) {
    const root = temp("held");
    const look = path.join(root, "COPY-H", "look1");
    const calls: string[] = [];
    const storeFile = (base: string) => path.join(base, "store", MANIFEST);
    const put = (file: string, v: unknown) => {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, JSON.stringify(v));
    };
    return {
      look,
      calls,
      build: (base: string) => {
        calls.push(`build ${path.relative(look, base) || "look1"}`);
        put(
          storeFile(base),
          manifestOf(base === look ? 5 : o.twinKept, `run ${calls.length}`),
        );
        return Promise.resolve();
      },
      check: (base: string) => {
        calls.push("check");
        const twin = existsSync(storeFile(path.join(base, "twin")));
        if (twin)
          put(path.join(base, "integrity", "builds.json"), {
            first: "a",
            second: "b",
            equal: o.twinEqual ?? true,
          });
        if (o.twinEqual === false) throw new BuildsDiffer("the builds differ");
        put(path.join(base, "integrity", "integrity.json"), {
          store: sha256(readFileSync(storeFile(base))),
          passed: true,
        });
      },
      open: (dir: string) => openStore(dir, [root], SEALED),
      log: () => {},
    };
  }
  const record = (kept: number) =>
    StoreRecord.parse(manifestOf(kept, "the rehearsal's"));
  const buildsOf = (look: string) =>
    JSON.parse(readFileSync(path.join(look, "builds.json"), "utf8")) as {
      first: string;
      record: { equal: boolean; differences: string[] };
      twin: unknown;
    };

  it("takes the rehearsal's build as the twin when the first equals the record but for the run's fields; a resumed run builds and checks nothing again", async () => {
    const f = fakes({ twinKept: 5 });
    const store = await heldStores({ ...f, record: record(5) });
    expect(f.calls).toEqual(["build look1", "check"]);
    expect(existsSync(path.join(f.look, "twin"))).toBe(false);
    expect(buildsOf(f.look)).toEqual({
      first: store.id,
      record: { equal: true, differences: [] },
      twin: null,
    });
    await heldStores({ ...f, record: record(5) });
    expect(f.calls).toEqual(["build look1", "check"]);
    // An integrity of another store, or one that failed, is run again.
    const done = path.join(f.look, "integrity", "integrity.json");
    for (const other of [
      { store: "another", passed: true },
      { store: store.id, passed: false },
    ]) {
      writeFileSync(done, JSON.stringify(other));
      f.calls.length = 0;
      await heldStores({ ...f, record: record(5) });
      expect(f.calls).toEqual(["check"]);
    }
  });

  it("builds the twin when the first differs from the record, lists the difference, and records the twins' comparison", async () => {
    const f = fakes({ twinKept: 5 });
    await heldStores({ ...f, record: record(6) });
    expect(f.calls).toEqual([
      "build look1",
      `build ${path.join("twin")}`,
      "check",
    ]);
    expect(buildsOf(f.look)).toMatchObject({
      record: { equal: false, differences: ["the manifests' counts differ"] },
      twin: { first: "a", second: "b", equal: true },
    });
  });

  it("builds the twin always without a record (S's, FRESH-2's), and records no record's comparison", async () => {
    const f = fakes({ twinKept: 5 });
    const store = await heldStores({ ...f, record: null });
    expect(f.calls).toEqual([
      "build look1",
      `build ${path.join("twin")}`,
      "check",
    ]);
    expect(buildsOf(f.look)).toEqual({
      first: store.id,
      record: null,
      twin: { first: "a", second: "b", equal: true },
    });
    f.calls.length = 0;
    await heldStores({ ...f, record: null });
    expect(f.calls).toEqual([]);
  });

  it("stops at exit 7 when the twin differs, its comparison still in builds.json", async () => {
    const f = fakes({ twinKept: 7, twinEqual: false });
    const held = heldStores({ ...f, record: record(6) });
    await expect(held).rejects.toThrow(BuildsDiffer);
    await held.catch((err: unknown) => expect(exitOf(err).code).toBe(7));
    expect(buildsOf(f.look)).toMatchObject({
      record: { equal: false },
      twin: { equal: false },
    });
  });
});

describe("C16's stop over every set projected (RH1 (a))", () => {
  const p = (copies: number, unpriced: number): Projection => ({
    copies,
    unpriced: {
      "no mark at the follow instant": unpriced,
      "no mark at an exit instant": 0,
      "a funding settlement without a mark": 0,
    },
    share: copies === 0 ? 0 : unpriced / copies,
    settled: 0,
    missingHours: 0,
    copiesMissing: 0,
    gap: 0,
  });
  const prior = { covariate: "priorMeanNetBps", op: ">", value: 0 } as const;
  const tryOf = (name: string, projection: Projection, leftOut = false) => ({
    name,
    line: "MAIN" as const,
    leftOut: leftOut ? [prior] : [],
    projection,
  });

  it("stops on any set above 1%, naming each, MAIN's first; none at 1% or past the tripwire", () => {
    const tail =
      "projected unpriced, above 1% (C16): a decisions entry runs on with --past-tripwire, or ends there";
    expect(
      tripwireStop(p(1000, 10), [tryOf("a", p(100, 1))], false),
    ).toBeNull();
    expect(tripwireStop(p(1000, 11), [], false)).toBe(
      `the tripwire: 1.10% of MAIN's 1000 copies ${tail}`,
    );
    expect(
      tripwireStop(
        p(1000, 10),
        [
          tryOf("a", p(100, 2)),
          tryOf("b", p(100, 1)),
          tryOf("c", p(50, 1), true),
        ],
        false,
      ),
    ).toBe(
      `the tripwire: 2.00% of the set "a"'s 100 copies; 2.00% of the set "c"'s 50 copies (projected without its conditions on the prior mean net) ${tail}`,
    );
    expect(tripwireStop(p(10, 1), [tryOf("a", p(10, 1))], false)).toBe(
      `the tripwire: 10.00% of MAIN's 10 copies; 10.00% of the set "a"'s 10 copies ${tail}`,
    );
    // FRESH-2's stage: no look set, its judged sets alone.
    expect(tripwireStop(null, [tryOf("MAIN", p(10, 1))], false)).toBe(
      `the tripwire: 10.00% of the set "MAIN"'s 10 copies ${tail}`,
    );
    expect(tripwireStop(null, [tryOf("MAIN", p(1000, 10))], false)).toBeNull();
    expect(tripwireStop(p(10, 1), [tryOf("a", p(10, 1))], true)).toBeNull();
    expect(tripwireStop(p(0, 0), [tryOf("a", p(0, 0))], false)).toBeNull();
  });
});

describe("the identity and the logs (C0; the store review's L15)", () => {
  it("names the lists and the step's files by SHA-256, and refuses a missing one", () => {
    const pkg = temp("pkg");
    for (const f of ["dist/schedule.js", "dist/log.js"]) {
      mkdirSync(path.dirname(path.join(pkg, f)), { recursive: true });
      writeFileSync(path.join(pkg, f), f);
    }
    mkdirSync(path.join(pkg, "copyh"));
    const lists = [
      "data.sha256",
      "funding.sha256",
      "coins.json",
      "dirs.json",
      "unpaired.json",
      "calibration.json",
      "rehearsal.json",
    ];
    for (const f of lists)
      writeFileSync(path.join(pkg, "copyh", f), `the ${f}`);
    const step = path.join(pkg, "builds.json");
    writeFileSync(step, "the builds");
    const id = identityOf({
      packageRoot: pkg,
      freeze: { sha256: H, tag: "copyh-freeze-1" },
      kit: "the kit",
      files: { "builds.json": step },
      heapGb: 8,
    });
    expect(Object.keys(id)[0]).toBe("program");
    expect(id).toMatchObject({
      program: fingerprintOf(pkg),
      freeze: { sha256: H, tag: "copyh-freeze-1" },
      kit: "the kit",
      lists: Object.fromEntries(lists.map((f) => [f, sha256(`the ${f}`)])),
      files: { "builds.json": sha256("the builds") },
      shared: {
        "dist/schedule.js": sha256("dist/schedule.js"),
        "dist/log.js": sha256("dist/log.js"),
      },
      heapGb: 8,
      node: process.version,
    });
    rmSync(path.join(pkg, "copyh", "calibration.json"));
    const missing = () =>
      identityOf({
        packageRoot: pkg,
        freeze: { sha256: H, tag: "copyh-freeze-1" },
        kit: "the kit",
        files: {},
        heapGb: 8,
      });
    expect(missing).toThrow(/calibration\.json: an output names it/);
    expect(codeOf(missing)).toBe(5);
  });

  it("copies the program's day logs beside a look's outputs, and nothing else", () => {
    const root = temp("logs");
    mkdirSync(path.join(root, "logs"));
    writeFileSync(path.join(root, "logs", "copyh-2026-11-26.log"), "one\n");
    writeFileSync(path.join(root, "logs", "copyh-2026-11-27.log"), "two\n");
    writeFileSync(path.join(root, "logs", "other-2026-11-27.log"), "no\n");
    const look = path.join(root, "look1");
    expect(copyLogs(root, look)).toBe(2);
    expect(readdirSync(path.join(look, "logs"))).toEqual([
      "copyh-2026-11-26.log",
      "copyh-2026-11-27.log",
    ]);
    expect(
      readFileSync(path.join(look, "logs", "copyh-2026-11-27.log"), "utf8"),
    ).toBe("two\n");
  });
});

/** The phases' world (A's SOL copy in M2's week, from at(1, 10) + D to at(2, 9) + D) with SOL's funding every hour up to at(1, 11), the first hour of the hold: A's trade 60 minutes before it and none in the 6, so the copy is projected unpriced under the 5-minute settlement mark (a funding settlement without a mark) and priced under the 60. */
/** W (bucket 05): two ETH taker fills against X in M2's week before it, so that the large lanes have a capture in two buckets. */
const W = addr(0xa05);
const world = await phaseWorld(
  [at(-3, 4), at(-2, 7)].flatMap((t, k) =>
    trade(W, X, {
      coin: "ETH",
      side: "B",
      sz: "1",
      px: "2000.5",
      time: t,
      tid: 90_000 + k,
      oid: 90_000 + k,
    }).map((r): [number, string] => [t, r]),
  ),
);
const hoursOf = (from: number, to: number) => {
  const out: number[] = [];
  for (let h = from; h < to; h += HOUR_MS) out.push(h);
  return out;
};
const F = fundingWorld([
  {
    coin: "SOL",
    start: START,
    rows: hoursOf(START, at(1, 11) + HOUR_MS).map((h, k): [number, string] => [
      h + 5 + (k % 89),
      (((k % 5) - 2) * 1e-5).toFixed(6),
    ]),
  },
]);
const recordSha = (dir: string) =>
  sha256(readFileSync(path.join(dir, "record.json")));
/** A part's header line, its first: the phase, its id and the inputs its bytes are a function of. */
const headerOf = (dir: string, id: string) =>
  JSON.parse(
    readFileSync(path.join(dir, "a", `${id}.part`), "utf8").split("\n", 1)[0]!,
  ) as { inputs: Record<string, unknown> };
/** A closed phase's runs of copy a: each part's `.run.json`. */
const runsOf = (dir: string) =>
  readdirSync(path.join(dir, "a"))
    .filter((f) => f.endsWith(".run.json"))
    .map(
      (f) =>
        JSON.parse(readFileSync(path.join(dir, "a", f), "utf8")) as {
          pid: number;
          heapGb: number;
        },
    );

/** The engine's run on the world, its lanes' thresholds given (null: none). */
const runOf = (
  dir: string,
  o: {
    markMinutes: 5 | 60;
    pastTripwire: boolean;
    lanes: { labelFills: number | null; historyFills: number | null };
    tries?: TrySet[];
    look?: 1 | 2 | null;
  },
): EngineRun => ({
  dir,
  code: "made-up",
  reading: {
    inputs: world.reading,
    context: { ...world.context, roots: [...world.context.roots, F.root] },
  },
  end: END,
  stage: [M1, END],
  mondays: [M1, M2],
  limits: { labelFills: 1e9, historyFills: 2e9, exits: 3e9 },
  lanes: o.lanes,
  markMinutes: o.markMinutes,
  tries: o.tries ?? [],
  funding: { store: F.store, list: F.list, sha256: F.sha256 },
  coins: new Map(COINS.map((c, i) => [i, c])),
  look: o.look === undefined ? 1 : o.look,
  earlier: [],
  pastTripwire: o.pastTripwire,
  workers: 3,
  heapGb: 1,
  seal: SEAL,
  budget: never,
  log: () => {},
});
const NO_LANES = { labelFills: null, historyFills: null };

describe(
  "step 1's engine and writes (C15, C16), every part of every phase through real child processes",
  { timeout: 300_000 },
  () => {
    const engine = engineDir();
    const look = path.dirname(engine);
    let first: { e: EngineRecords; counts: ReturnType<typeof stepCounts> };

    it("stops at the tripwire above 1% under the step's settlement mark (exit 6) with no price, then runs on with --past-tripwire from the closed phases, each phase's parts of the inputs it names", async () => {
      const stopped = runEngine(
        runOf(engine, { markMinutes: 5, pastTripwire: false, lanes: NO_LANES }),
      );
      await expect(stopped).rejects.toThrow(CheckFailed);
      await stopped.catch((err: unknown) => {
        expect(exitOf(err).code).toBe(6);
        expect((err as Error).message).toBe(
          "the tripwire: 100.00% of MAIN's 1 copies projected unpriced, above 1% (C16): a decisions entry runs on with --past-tripwire, or ends there",
        );
      });
      for (const p of ["labels", "build", "removal", "tripwire"])
        expect(existsSync(path.join(engine, p, "record.json")), p).toBe(true);
      for (const p of ["labels-l", "build-l", "prices", "rank", "result"])
        expect(existsSync(path.join(engine, p)), p).toBe(false);

      const e = await runEngine(
        runOf(engine, { markMinutes: 5, pastTripwire: true, lanes: NO_LANES }),
      );
      expect(e.labels.record.parts.length).toBe(256);
      expect(e.build.record.parts.length).toBe(256);
      expect(e.labelsL).toBeNull();
      expect(e.buildL).toBeNull();
      expect(e.removal.record.parts.map(([id]) => id)).toEqual(["c002"]);
      expect(e.prices.record.parts.map(([id]) => id)).toEqual(["c002"]);
      expect(e.projection).toMatchObject({
        copies: 1,
        share: 1,
        unpriced: {
          "no mark at the follow instant": 0,
          "no mark at an exit instant": 0,
          "a funding settlement without a mark": 1,
        },
      });
      expect(headerOf(e.labels.dir, "b001-m000").inputs).toMatchObject({
        code: "made-up",
        ...world.reading,
        mondays: [M1, M2],
        fillsMax: 1e9,
        lane: null,
      });
      expect(headerOf(e.build.dir, "b001").inputs).toEqual({
        ...world.reading,
        code: "made-up",
        bucket: 1,
        end: END,
        stage: [M1, END],
        mondays: [M1, M2],
        labels: [recordSha(e.labels.dir), null],
        limits: { fills: 2e9, exits: 3e9 },
        lane: null,
      });
      const builds = [recordSha(e.build.dir), null];
      expect(headerOf(e.removal.dir, "c002").inputs).toEqual({
        code: "made-up",
        build: builds,
        iid: 2,
        mondays: [M1, M2],
      });
      const coin = {
        ...world.reading,
        code: "made-up",
        build: builds,
        iid: 2,
        coin: "SOL",
        end: END,
        funding: F.sha256,
      };
      expect(headerOf(e.tripwire.dir, "c002").inputs).toEqual({
        ...coin,
        tries: [],
      });
      expect(headerOf(e.prices.dir, "c002").inputs).toEqual({
        ...coin,
        removal: recordSha(e.removal.dir),
        mondays: [M1, M2],
        markMinutes: 5,
      });
      expect(headerOf(e.rank.dir, "rank").inputs).toEqual({
        code: "made-up",
        build: builds,
        prices: recordSha(e.prices.dir),
        mondays: [M1, M2],
      });
      expect(headerOf(e.result.dir, "result").inputs).toEqual({
        code: "made-up",
        prices: recordSha(e.prices.dir),
        rank: recordSha(e.rank.dir),
        mondays: [M1, M2],
        start: M1,
        end: END,
        look: 1,
        earlier: [],
      });
      expect(new Set(runsOf(e.labels.dir).map((r) => r.heapGb))).toEqual(
        new Set([1]),
      );
      // RESULT keeps every voted copy's readings: one child at the heap cap (COPYH-ENGINE-REVIEW-2 M2).
      expect(runsOf(e.result.dir).map((r) => r.heapGb)).toEqual([
        WORKER_HEAP_CAP_GB,
      ]);
      const result = resultOf(e.result.dir, e.result.record);
      expect(result).toMatchObject({ look: 1, z: 2.81, verdict: "WITHHELD" });
      first = {
        e,
        counts: stepCounts({ engine: e, stores: [world.store], end: END }),
      };
    });

    it("runs on under the 60-minute settlement mark, which projects none unpriced, a try's set projected beside MAIN's", async () => {
      const prior = {
        covariate: "priorMeanNetBps",
        op: ">",
        value: 0,
      } as const;
      const sets: TrySet[] = [
        {
          name: "BROAD",
          line: "BROAD",
          from: M1,
          to: END,
          conditions: [prior],
        },
        { name: "none", line: "MAIN", from: END - 1, to: END, conditions: [] },
      ];
      const e = await runEngine(
        runOf(engineDir(), {
          markMinutes: 60,
          pastTripwire: false,
          lanes: NO_LANES,
          tries: sets,
        }),
      );
      expect(e.projection).toMatchObject({ copies: 1, share: 0 });
      expect(e.tries).toEqual([
        {
          name: "BROAD",
          line: "BROAD",
          leftOut: [prior],
          projection: e.projection,
        },
        {
          name: "none",
          line: "MAIN",
          leftOut: [],
          projection: expect.objectContaining({
            copies: 0,
            share: 0,
          }) as unknown,
        },
      ]);
      expect(headerOf(e.tripwire.dir, "c002").inputs).toMatchObject({
        tries: sets,
      });
      expect(
        stepCounts({ engine: e, stores: [world.store], end: END }).tripwire,
      ).toEqual({ look: e.projection, tries: e.tries });
      expect(headerOf(e.prices.dir, "c002").inputs).toMatchObject({
        markMinutes: 60,
      });
      expect(resultOf(e.result.dir, e.result.record)).toMatchObject({
        verdict: "TOO FEW TO TELL",
        statistic: { copies: 1, unpriced: 0 },
      });
    });

    it("changes nothing by its lanes: every capture and history past a threshold of 0, in the large lanes (one child at the heap cap), gives the same result, positions and counts", async () => {
      const e = await runEngine(
        runOf(engineDir(), {
          markMinutes: 5,
          pastTripwire: true,
          lanes: { labelFills: 0, historyFills: 0 },
        }),
      );
      expect(e.labelsL!.record.parts.map(([id]) => id)).toEqual([
        "b001-m000",
        "b005-m000",
      ]);
      expect(e.buildL!.record.parts.map(([id]) => id)).toEqual(["b001"]);
      for (const dir of [e.labelsL!.dir, e.buildL!.dir]) {
        const runs = runsOf(dir);
        expect(new Set(runs.map((r) => r.heapGb))).toEqual(new Set([20]));
        expect(new Set(runs.map((r) => r.pid)).size).toBe(1);
      }
      expect(headerOf(e.labels.dir, "b001-m000").inputs).toMatchObject({
        lane: 0,
      });
      expect(headerOf(e.build.dir, "b001").inputs).toMatchObject({
        labels: [recordSha(e.labels.dir), recordSha(e.labelsL!.dir)],
        lane: 0,
      });
      expect(headerOf(e.removal.dir, "c002").inputs).toMatchObject({
        build: [recordSha(e.build.dir), recordSha(e.buildL!.dir)],
      });
      expect(resultOf(e.result.dir, e.result.record)).toEqual(
        resultOf(first.e.result.dir, first.e.result.record),
      );
      const counts = stepCounts({ engine: e, stores: [world.store], end: END });
      const noDeferred = (c: typeof counts) =>
        c.labels.map((l) => ({ ...l, deferred: 0 }));
      expect(noDeferred(counts)).toEqual(noDeferred(first.counts));
      expect(counts.labels.reduce((s, l) => s + l.deferred, 0)).toBeGreaterThan(
        0,
      );
      expect(counts.build).toEqual({
        ...first.counts.build,
        largeLane: [[A, expect.any(Number) as number]],
      });
    });

    it("prices the rehearsal's fortnight in memory by the code that prices at step 1: on the whole world's window its lines are RESULT's, no file of priced copies written; a window before the copy holds none", async () => {
      const kit = await loadResearch();
      const r = resultOf(first.e.result.dir, first.e.result.record);
      const dir = path.join(engineDir(), "fortnight");
      const run = runOf(dir, {
        markMinutes: 5,
        pastTripwire: true,
        lanes: NO_LANES,
      });
      const f = await fortnightOf(run, kit, [M1, END], never);
      const [p] = [
        ...positionLines({
          prices: first.e.prices,
          rank: first.e.rank,
          mondays: [M1, M2],
        }),
      ].map((l) => l.p);
      expect(f).toEqual({
        sha256: r.positions.sha256,
        lines: 1,
        byLine: { MAIN: 1, BROAD: 1, DAY: 1 },
        legs: { [p!.plan.legs[0]!.kind]: 1 },
        seconds: expect.any(Number) as number,
      });
      // The pricing in memory measured: well under its margin of minutes on the made-up world.
      expect(f.seconds).toBeLessThan(FORTNIGHT_MINUTES * 60);
      expect(p!.plan.legs).toHaveLength(1);
      expect(readdirSync(dir).sort()).toEqual(["build", "labels", "removal"]);
      const none = await fortnightOf(
        runOf(path.join(engineDir(), "fortnight"), {
          markMinutes: 5,
          pastTripwire: true,
          lanes: NO_LANES,
        }),
        kit,
        [M1, M2],
        never,
      );
      expect(none).toEqual({
        sha256: sha256(""),
        lines: 0,
        byLine: {},
        legs: {},
        seconds: expect.any(Number) as number,
      });
    });

    it("starts the fortnight's pricing in memory only while its budget (the run's less FORTNIGHT_MINUTES) allows: spent, its unpriced phases close as parts and it stops before any price (exit 3); the next run prices from the closed parts", async () => {
      expect(FORTNIGHT_MINUTES).toBe(5);
      const kit = await loadResearch();
      const dir = path.join(engineDir(), "fortnight");
      const run = runOf(dir, {
        markMinutes: 5,
        pastTripwire: true,
        lanes: NO_LANES,
      });
      const spent = { stop: () => "its 0 minutes are spent" };
      const stopped = fortnightOf(run, kit, [M1, END], spent);
      await expect(stopped).rejects.toThrow(
        "the fortnight's prices wait: its 0 minutes are spent",
      );
      await stopped.catch((err: unknown) => expect(exitOf(err).code).toBe(3));
      for (const p of ["labels", "build", "removal"])
        expect(existsSync(path.join(dir, p, "record.json")), p).toBe(true);
      const f = await fortnightOf(run, kit, [M1, END], never);
      expect(f.lines).toBe(1);
    });

    it("gives the step's counts and writes the look in C15's order: the positions' lines held to RESULT's hash, result.json first, the file renamed into place, then report.json, each with its identity first", async () => {
      const { e, counts } = first;
      expect(counts.labels.map((l) => l.M)).toEqual([
        new Date(M1).toISOString(),
        new Date(M2).toISOString(),
      ]);
      expect(counts.labels[1]).toMatchObject({ tooLarge: [], deferred: 0 });
      expect(counts.labels[1]!.p1).toBeGreaterThanOrEqual(1);
      expect(counts.vaults).toEqual([V, X]);
      expect(counts.build).toMatchObject({
        p1: 1,
        built: 1,
        tooManyFills: [],
        tooManyExits: [],
        largeLane: [],
        idsTwice: 0,
        sizeZero: 0,
        largestMerged: 0,
      });
      expect(counts.build.copies).toEqual({ MAIN: 1, BROAD: 1, DAY: 1 });
      expect(counts.build.mainAfterSettlement).toEqual({});
      expect(counts.tripwire).toEqual({ look: e.projection, tries: [] });
      expect(counts.stores).toEqual([
        expect.objectContaining({
          store: world.store.id,
          classes: world.store.manifest.counts.classes,
        }),
      ]);
      const left = counts.leftOutTakers.reduce(
        (s, [, m]) => ({
          backstop: s.backstop + m.backstop,
          adl: s.adl + m.adl,
          settlement: s.settlement + m.settlement,
          vault: s.vault + m.vault,
        }),
        { backstop: 0, adl: 0, settlement: 0, vault: 0 },
      );
      expect(left).toEqual({ backstop: 0, adl: 0, settlement: 0, vault: 1 });
      expect(counts.runs.labels).toMatchObject({ parts: 256 });
      expect(counts.runs.labelsL).toBeNull();
      expect(counts.runs.result).toMatchObject({ parts: 1 });
      // Each phase's slowest part's copy and where its largest peak was measured, among its parts' runs.
      const ids = (dir: string) =>
        ["a", "b"].flatMap((copy) =>
          readdirSync(path.join(dir, copy))
            .filter((f) => f.endsWith(".run.json"))
            .map((f) => `${copy}/${f.slice(0, -".run.json".length)}`),
        );
      const runOfPart = (dir: string, at: string) =>
        JSON.parse(readFileSync(path.join(dir, `${at}.run.json`), "utf8")) as {
          seconds: number;
          maxRssMb: number;
        };
      for (const [name, c] of [
        ["labels", e.labels],
        ["build", e.build],
        ["result", e.result],
      ] as const) {
        const runs = counts.runs[name]!;
        const all = ids(c.dir).map((at) => runOfPart(c.dir, at));
        expect(ids(c.dir), name).toContain(runs.peakAt);
        expect(runs.maxRssMb, name).toBe(
          Math.max(...all.map((r) => r.maxRssMb)),
        );
        expect(runOfPart(c.dir, runs.peakAt!).maxRssMb, name).toBe(
          runs.maxRssMb,
        );
        expect(ids(c.dir), name).toContain(runs.slowest!.part);
        expect(runs.slowest!.seconds, name).toBe(
          Math.round(Math.max(...all.map((r) => r.seconds))),
        );
      }

      const result = resultOf(e.result.dir, e.result.record);
      const identity = { program: "made-up", node: process.version };
      const step = {
        result,
        report: { ...reportFrom(e.result.dir, e.result.record), step: counts },
      };
      await writeLook({
        look,
        engine: e,
        mondays: [M1, M2],
        identity,
        ...step,
        log: () => {},
      });
      const lines = [
        ...positionLines({ prices: e.prices, rank: e.rank, mondays: [M1, M2] }),
      ].map((l) => `${l.line}\n`);
      expect(lines).toHaveLength(1);
      const gz = readFileSync(path.join(look, "positions.jsonl.gz"));
      expect(gunzipSync(gz).toString("utf8")).toBe(lines.join(""));
      const written = JSON.parse(
        readFileSync(path.join(look, "result.json"), "utf8"),
      ) as Record<string, unknown>;
      expect(Object.keys(written)[0]).toBe("identity");
      expect(written).toEqual({
        identity,
        ...result,
        positions: {
          lines: 1,
          sha256: sha256(lines.join("")),
          file: { name: "positions.jsonl.gz", sha256: sha256(gz) },
        },
      });
      const report = JSON.parse(
        readFileSync(path.join(look, "report.json"), "utf8"),
      ) as Record<string, unknown>;
      expect(Object.keys(report)[0]).toBe("identity");
      expect(report).toEqual({
        identity,
        ...JSON.parse(
          JSON.stringify(reportFrom(e.result.dir, e.result.record)),
        ),
        step: JSON.parse(JSON.stringify(counts)) as object,
      });
      expect(existsSync(path.join(engine, "positions.jsonl.gz.tmp"))).toBe(
        false,
      );

      // A rename refused: result.json is written first, the file stays in the engine folder, no report.
      const other = path.join(temp("look"), "COPY-H", "look1");
      mkdirSync(path.join(other, "positions.jsonl.gz", "taken"), {
        recursive: true,
      });
      await expect(
        writeLook({
          look: other,
          engine: e,
          mondays: [M1, M2],
          identity,
          ...step,
          log: () => {},
        }),
      ).rejects.toThrow();
      expect(existsSync(path.join(other, "result.json"))).toBe(true);
      expect(existsSync(path.join(other, "report.json"))).toBe(false);
      expect(existsSync(path.join(engine, "positions.jsonl.gz.tmp"))).toBe(
        true,
      );
    });

    it("refuses positions whose lines are not RESULT's (exit 6), writing no result.json", async () => {
      const { e, counts } = first;
      const r = resultOf(e.result.dir, e.result.record);
      const other = path.join(temp("look"), "COPY-H", "look1");
      const held = writeLook({
        look: other,
        engine: e,
        mondays: [M1, M2],
        identity: {},
        result: { ...r, positions: { lines: 1, sha256: "f".repeat(64) } },
        report: { step: counts },
        log: () => {},
      });
      await expect(held).rejects.toThrow(
        /the positions written \(1 lines, [0-9a-f]{64}\) are not RESULT's \(1, f{64}\)/,
      );
      await held.catch((err: unknown) => expect(exitOf(err).code).toBe(6));
      expect(existsSync(path.join(other, "result.json"))).toBe(false);
    });

    it("confirms the chosen tries on S and prints MAIN on S alone (CONFIRM, through real child processes): each try's set its line's copies voted by END with t in S, every condition met, the prior mean net's among them", async () => {
      const { e } = first;
      const tries: Try[] = [
        { name: "MAIN", line: "MAIN", conditions: [], why: "made-up" },
        {
          name: "a prior mean net",
          line: "BROAD",
          conditions: [{ covariate: "priorMeanNetBps", op: ">", value: -1e9 }],
          why: "made-up",
        },
      ];
      const lines = [
        ...positionLines({ prices: e.prices, rank: e.rank, mondays: [M1, M2] }),
      ];
      expect(lines).toHaveLength(1);
      const confirmIn = async (from: number, to: number) => {
        const dir = path.join(engine, `confirm-${from}`);
        const record = await runPhase({
          name: "CONFIRM",
          dir,
          module: path.join(PACKAGE_ROOT, "dist", "copyh", "phase-confirm.js"),
          fn: "confirmPart",
          parts: confirmParts({
            code: "made-up",
            prices: recordSha(e.prices.dir),
            rank: recordSha(e.rank.dir),
            mondays: [M1, M2],
            tries,
            from,
            to,
            z: 2.43,
          }),
          context: { prices: e.prices.dir, rank: e.rank.dir },
          workers: 1,
          heapGb: 1,
          seal: SEAL,
          budget: never,
          log: () => {},
        });
        return confirmOf(dir, record);
      };
      const kit = await loadResearch();
      // The copy's prior mean net is none (no copy of its trader before M2), so the second try's set is empty: a condition on a covariate the copy lacks is false.
      const [{ p, line, rank }] = lines as [(typeof lines)[number]];
      expect(
        TryLine.parse(JSON.parse(line)).covariates.priorMeanNetBps,
      ).toBeNull();
      const c = await confirmIn(M1, END);
      // The world's copy is unpriced under the 5-minute mark: MAIN's set WITHHELD before its (missing) error.
      expect(
        c.tries.map((t) => [t.name, t.statistic.copies, t.reading, t.s, t.z]),
      ).toEqual([
        ["MAIN", 1, "WITHHELD", null, null],
        ["a prior mean net", 0, "NOT CONFIRMED", null, null],
      ]);
      expect(c.tries[0]!.statistic).toEqual(
        statisticOf(kit, [judgedOf(TryLine.parse(JSON.parse(line)), "MAIN")]),
      );
      expect(c.tries[0]!.sentences).toEqual(
        confirmationOf([c.tries[0]!.statistic])[0]!.sentences,
      );
      expect(inTry(TryLine.parse(JSON.parse(line)), tries[0]!)).toBe(true);
      expect(c.mainOnS).toEqual(
        JSON.parse(
          JSON.stringify(
            reportOf(kit, [printCopyOf(p, rank)], {
              z: 2.43,
              look: 2,
              start: M1,
              end: END,
              endS: END_S,
            }),
          ),
        ),
      );
      // A window that holds no copy (t one millisecond after the copy's): no set, no print of a copy.
      const none = await confirmIn(p.t + 1, END);
      expect(none.tries.map((t) => t.statistic.copies)).toEqual([0, 0]);
      expect(none.mainOnS).toMatchObject({ r14: { copies: 0 } });
      expect((await confirmIn(p.t, p.t + 1)).tries[0]!.statistic.copies).toBe(
        1,
      );
    });

    it("runs FRESH-2's stage's engine through RANK with no look: MAIN's whole set, unpriced under the 5-minute mark, stops nothing, its judged sets alone are projected, no RESULT; runEngine refuses a run with no look", async () => {
      const dir = engineDir();
      const judged: TrySet = {
        name: "MAIN",
        line: "MAIN",
        from: END - 1,
        to: END,
        conditions: [],
      };
      const run = runOf(dir, {
        markMinutes: 5,
        pastTripwire: false,
        lanes: NO_LANES,
        tries: [judged],
        look: null,
      });
      await expect(runEngine(run)).rejects.toThrow(/RESULT reads a look/);
      expect(existsSync(path.join(dir, "labels"))).toBe(false);
      const p = await pricedPhases(run);
      expect(p.projection).toBeNull();
      expect(p.tries).toEqual([
        {
          name: "MAIN",
          line: "MAIN",
          leftOut: [],
          projection: expect.objectContaining({
            copies: 0,
            share: 0,
          }) as unknown,
        },
      ]);
      for (const phase of ["tripwire", "prices", "rank"])
        expect(existsSync(path.join(dir, phase, "record.json")), phase).toBe(
          true,
        );
      expect(existsSync(path.join(dir, "result"))).toBe(false);
      expect(
        stepCounts({
          engine: { ...p, result: null },
          stores: [world.store],
          end: END,
        }),
      ).toMatchObject({
        tripwire: { look: null, tries: p.tries },
        runs: { result: null },
      });
    });

    it("judges FRESH-2's sets in SEALED (through real child processes): every line hashed as RESULT hashes it; each judged set its line's copies voted by END with t in the window, every condition met, its statistic and sealed reading at its z; MAIN's prints in FRESH-2's form, none without MAIN", async () => {
      const { e } = first;
      const kit = await loadResearch();
      const lines = [
        ...positionLines({ prices: e.prices, rank: e.rank, mondays: [M1, M2] }),
      ];
      expect(lines).toHaveLength(1);
      const [{ p, line, rank }] = lines as [(typeof lines)[number]];
      const coin = (name: string, iid: number): SealedSet => ({
        kind: "try",
        name,
        line: "BROAD",
        conditions: [{ covariate: "coin", op: "=", value: iid }],
        z: 1.96,
      });
      const sets: SealedSet[] = [
        { kind: "MAIN", name: "MAIN", line: "MAIN", conditions: [], z: 1.645 },
        coin("its coin", p.iid),
        coin("another coin", p.iid + 1),
      ];
      const sealedIn = async (
        s: readonly SealedSet[],
        from: number,
        to: number,
      ) => {
        const dir = path.join(engine, `sealed-${s.length}-${from}-${to}`);
        const record = await runPhase({
          name: "SEALED",
          dir,
          module: path.join(PACKAGE_ROOT, "dist", "copyh", "phase-sealed.js"),
          fn: "sealedPart",
          parts: sealedParts({
            code: "made-up",
            prices: recordSha(e.prices.dir),
            rank: recordSha(e.rank.dir),
            mondays: [M1, M2],
            sets: [...s],
            from,
            to,
          }),
          context: { prices: e.prices.dir, rank: e.rank.dir },
          workers: 1,
          heapGb: 1,
          seal: SEAL,
          budget: never,
          log: () => {},
        });
        return {
          result: sealedResultOf(dir, record),
          report: sealedReportOf(dir, record),
        };
      };
      const tl = TryLine.parse(JSON.parse(line));
      const judged = (s: SealedSet, copies: ReturnType<typeof judgedOf>[]) => {
        const statistic = statisticOf(kit, copies);
        return {
          kind: s.kind,
          name: s.name,
          line: s.line,
          statistic,
          ...sealedOf(statistic, s.z),
        };
      };
      const r = await sealedIn(sets, M1, END);
      expect(r.result.positions).toEqual(
        resultOf(e.result.dir, e.result.record).positions,
      );
      expect(r.result.sets).toEqual([
        judged(sets[0]!, [judgedOf(tl, "MAIN")]),
        judged(sets[1]!, [judgedOf(tl, "BROAD")]),
        judged(sets[2]!, []),
      ]);
      expect(r.result.sets.map((s) => [s.reading, s.z])).toEqual([
        ["WITHHELD", 1.645],
        ["WITHHELD", 1.96],
        ["NOT CONFIRMED", 1.96],
      ]);
      expect(r.report).toEqual({
        main: JSON.parse(
          JSON.stringify(
            fresh2Report(
              reportOf(kit, [printCopyOf(p, rank)], {
                z: 1.645,
                look: 2,
                start: M1,
                end: END,
                endS: END_S,
              }),
            ),
          ),
        ) as unknown,
      });
      expect(r.report.main).not.toHaveProperty("cascade");
      expect(r.report.main).toHaveProperty(["h1", "d"]);
      expect(r.report.main).not.toHaveProperty(["h1", "nullMeanGross"]);
      // No MAIN set: no MAIN prints. A window one millisecond after the copy's t holds none; one of its millisecond holds it.
      const none = await sealedIn(sets.slice(1), p.t + 1, END);
      expect(none.result.sets.map((s) => s.statistic.copies)).toEqual([0, 0]);
      expect(none.result.positions).toEqual(r.result.positions);
      expect(none.report).toEqual({ main: null });
      expect(
        (await sealedIn(sets.slice(1), p.t, p.t + 1)).result.sets.map(
          (s) => s.statistic.copies,
        ),
      ).toEqual([1, 0]);
    });

    it("gives a run stopped in a phase and resumed under a raised heap the records of an unbroken one, phase by phase (C15: a resumed command's output equals an unbroken one's, a later run under a larger ceiling); a run of other inputs over its closed phases refused (exit 5), changing nothing", async () => {
      const dir = engineDir();
      const o = {
        markMinutes: 5 as const,
        pastTripwire: true,
        lanes: NO_LANES,
      };
      let asked = 0;
      // The run's minutes spent after the budget is asked four times: a stop among the first phases' parts.
      const stopped = runEngine({
        ...runOf(dir, o),
        budget: {
          stop: () => (asked++ < 4 ? null : "the test's minutes are spent"),
        },
      });
      await expect(stopped).rejects.toThrow(NotFinished);
      await stopped.catch((err: unknown) => expect(exitOf(err).code).toBe(3));
      expect(existsSync(path.join(dir, "labels"))).toBe(true);
      expect(existsSync(path.join(dir, "result"))).toBe(false);
      // Resumed under a larger ceiling (COPYH_HEAP_GB, C15): the parts before the stop at 1 GB, those after at 2.
      const e = await runEngine({ ...runOf(dir, o), heapGb: 2 });
      expect(new Set(runsOf(e.labels.dir).map((r) => r.heapGb))).toEqual(
        new Set([1, 2]),
      );
      expect(new Set(runsOf(e.build.dir).map((r) => r.heapGb))).toEqual(
        new Set([2]),
      );
      const closed = (r: EngineRecords) =>
        [
          r.labels,
          r.labelsL,
          r.build,
          r.buildL,
          r.removal,
          r.tripwire,
          r.prices,
          r.rank,
          r.result,
        ].map((c) => (c === null ? null : recordSha(c.dir)));
      expect(closed(e)).toEqual(closed(first.e));
      expect(e.projection).toEqual(first.e.projection);
      const before = closed(e);
      const other = runEngine(runOf(dir, { ...o, markMinutes: 60 }));
      await expect(other).rejects.toThrow(StoreError);
      await other.catch((err: unknown) => expect(exitOf(err).code).toBe(5));
      expect(closed(e)).toEqual(before);
    });

    it("makes a step's engine run the same at any heap but for the heap itself: the lanes' thresholds are never scaled by it (COPYH-ENGINE-REVIEW-2 M1)", () => {
      const dir = engineDir();
      const log = () => {};
      const at = (heapGb: number) =>
        engineRunOf(
          {
            roots: world.context.roots,
            funding: F.store,
            seal: SEAL,
            workers: 3,
            heapGb,
            budget: never,
            log,
          },
          {
            program: "made-up",
            values: { labelFills: 1e9, historyFills: 2e9, markMinutes: 5 },
            stores: [world.store],
            dir,
            end: END,
            stage: [M1, END],
            mondays: [M1, M2],
            look: 1,
            earlier: [],
            tries: [],
            pastTripwire: false,
            engine: "look1",
            fundingList: F.list,
          },
        );
      const base = at(WORKER_HEAP_GB);
      expect(base.lanes).toEqual({
        labelFills: LANE_LABEL_FILLS,
        historyFills: LANE_HISTORY_FILLS,
      });
      for (const heapGb of [WORKER_HEAP_GB + 4, WORKER_HEAP_CAP_GB]) {
        const raised = at(heapGb);
        expect(raised.heapGb).toBe(heapGb);
        expect({ ...raised, heapGb: base.heapGb }).toEqual(base);
      }
    });
  },
);

describe("step 2's refusals (C15, in its order)", () => {
  const values = {
    labelFills: 13_000_000,
    historyFills: 8_500_000,
    markMinutes: 5,
  } as const;
  /** A COPY-H folder with step 1's files and E's store files, and a package folder with look1.sha256 and choice.json naming them. */
  function stepWorld() {
    const root = path.join(temp("step2"), "COPY-H");
    const pkg = temp("pkg2");
    const put = (file: string, text: string) => {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, text);
    };
    const look1 = path.join(root, "look1");
    put(
      path.join(root, "repro.json"),
      `{"identity":{"program":"this"},"passed":true}`,
    );
    const store = {
      "store/manifest.json": "the manifest",
      "builds.json": "the builds",
      "integrity/integrity.json": "the integrity",
    };
    for (const [name, text] of Object.entries(store))
      put(path.join(look1, ...name.split("/")), text);
    const H = "0".repeat(64);
    const result = {
      identity: {
        files: Object.fromEntries(
          Object.entries(store).map(([n, t]) => [n, sha256(t)]),
        ),
      },
      look: 1,
      z: 2.81,
      verdict: "TOO FEW TO TELL",
      sentences: [],
      after: false,
      statistic: {
        copies: 0,
        unpriced: 0,
        unpricedShare: 0,
        money: null,
        edge: { byDay: null, byWeek: null, se: null },
        signs: { traders: null, days: null, withoutThin: null },
      },
      positions: {
        lines: 0,
        sha256: H,
        file: { name: "positions.jsonl.gz", sha256: H },
      },
    };
    put(path.join(look1, "result.json"), JSON.stringify(result));
    put(path.join(look1, "positions.jsonl.gz"), "the positions");
    put(path.join(look1, "report.json"), "the report");
    const list = () =>
      put(
        path.join(pkg, "copyh", "look1.sha256"),
        LOOK_FILES.map(
          (f) => `${sha256(readFileSync(path.join(look1, f)))} *${f}\n`,
        ).join(""),
      );
    list();
    const chosen: Try = {
      name: "a",
      line: "BROAD",
      conditions: [{ covariate: "coin", op: "=", value: 2 }],
      why: "made-up",
    };
    put(
      path.join(pkg, "copyh", "choice.json"),
      JSON.stringify({
        identity: {},
        rounds: [],
        qualified: [],
        chosen: [{ round: 1, index: 0, name: "a", try: chosen, figures: {} }],
      }),
    );
    const ready =
      (v: Parameters<typeof readyForStep2>[0]["values"] = values) =>
      () =>
        readyForStep2({ root, packageRoot: pkg, program: "this", values: v });
    return { root, pkg, look1, put, list, chosen, ready };
  }

  it("passes with step 1's files and E's store held to their lists, giving the values, step 1's result and the chosen tries", () => {
    const w = stepWorld();
    const r = w.ready()();
    expect(r.values).toEqual(values);
    expect(r.look1.verdict).toBe("TOO FEW TO TELL");
    expect(r.chosen).toEqual([w.chosen]);
  });

  it("refuses a second step 2, repro.json not this program's, an unset value, a step 1 file changed or a list of another form, E's store changed, no choice, each exit 5, in that order", () => {
    const w = stepWorld();
    const code = (f: () => unknown) => codeOf(f);
    w.put(path.join(w.root, "look2", "result.json"), "{}");
    expect(w.ready()).toThrow(AlreadyRun);
    rmSync(path.join(w.root, "look2", "result.json"));
    w.put(
      path.join(w.root, "repro.json"),
      `{"identity":{"program":"other"},"passed":true}`,
    );
    expect(w.ready()).toThrow(/another program's \(other\)/);
    w.put(
      path.join(w.root, "repro.json"),
      `{"identity":{"program":"this"},"passed":true}`,
    );
    expect(w.ready({ ...values, markMinutes: null })).toThrow(
      "unset: SETTLEMENT_MARK_MINUTES (C17)",
    );
    for (const f of LOOK_FILES) {
      const file = path.join(w.look1, f);
      const bytes = readFileSync(file);
      writeFileSync(file, Buffer.concat([bytes, Buffer.from(" ")]));
      expect(w.ready(), f).toThrow(
        `${file} is not the file look1.sha256 names`,
      );
      expect(code(w.ready())).toBe(5);
      writeFileSync(file, bytes);
    }
    const listFile = path.join(w.pkg, "copyh", "look1.sha256");
    const listed = readFileSync(listFile, "utf8");
    writeFileSync(listFile, listed.split("\n").slice(1).join("\n"));
    expect(w.ready()).toThrow(
      /lists positions\.jsonl\.gz, report\.json, not a step's three files/,
    );
    writeFileSync(listFile, "not a list\n");
    expect(w.ready()).toThrow(/no list of a step's files/);
    w.list();
    for (const name of [
      "store/manifest.json",
      "builds.json",
      "integrity/integrity.json",
    ]) {
      const file = path.join(w.look1, ...name.split("/"));
      const bytes = readFileSync(file);
      writeFileSync(file, "changed");
      expect(w.ready(), name).toThrow(
        `${file} is not the file ${w.look1}'s result.json names`,
      );
      expect(code(w.ready())).toBe(5);
      writeFileSync(file, bytes);
    }
    rmSync(path.join(w.pkg, "copyh", "choice.json"));
    expect(w.ready()).toThrow(/no the rounds' choice that parses/);
    expect(code(w.ready())).toBe(5);
  });

  it("holds a step's store files to its result.json and step 1's recomputed positions to its own (exit 6)", () => {
    const w = stepWorld();
    const r = w.ready()().look1;
    expect(() => heldStepStore(w.look1, r)).not.toThrow();
    expect(() =>
      heldStepStore(w.look1, { ...r, identity: { files: {} } }),
    ).toThrow(/names no store\/manifest\.json/);
    const want = { lines: 3, sha256: "a".repeat(64) };
    expect(() => heldRecomputed(want, want)).not.toThrow();
    for (const again of [
      { ...want, lines: 4 },
      { ...want, sha256: "b".repeat(64) },
    ]) {
      expect(() => heldRecomputed(again, want)).toThrow(CheckFailed);
      expect(codeOf(() => heldRecomputed(again, want))).toBe(6);
    }
    expect(() =>
      heldLookFiles(w.look1, path.join(w.pkg, "copyh", "look1.sha256")),
    ).not.toThrow();
  });
});
