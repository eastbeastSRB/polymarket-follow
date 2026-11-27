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
 * - the identity's lists and files by SHA-256, a missing one refused; the
 *   logs copied beside the outputs.
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
import {
  positionLines,
  reportFrom,
  resultOf,
} from "../src/copyh/phase-result.js";
import {
  AlreadyRun,
  BuildsDiffer,
  CheckFailed,
  StoreError,
  exitOf,
  fingerprintOf,
  sha256,
} from "../src/copyh/run.js";
import { SEALED } from "../src/copyh/seal.js";
import {
  StoreRecord,
  copyLogs,
  heldStores,
  identityOf,
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
      `the tripwire: 2.00% of the try "a"'s 100 copies; 2.00% of the try "c"'s 50 copies (projected without its conditions on the prior mean net) ${tail}`,
    );
    expect(tripwireStop(p(10, 1), [tryOf("a", p(10, 1))], false)).toBe(
      `the tripwire: 10.00% of MAIN's 10 copies; 10.00% of the try "a"'s 10 copies ${tail}`,
    );
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
  look: 1,
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
      });
      expect(counts.build.copies).toEqual({ MAIN: 1, BROAD: 1, DAY: 1 });
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

      const result = resultOf(e.result.dir, e.result.record);
      const identity = { program: "made-up", node: process.version };
      await writeLook({
        look,
        engine: e,
        mondays: [M1, M2],
        identity,
        counts,
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
          counts,
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
      const part = readFileSync(
        path.join(e.result.dir, "a", "result.part"),
        "utf8",
      );
      const [header, resultLine, reportLine] = part.split("\n");
      const r = JSON.parse(resultLine!) as { positions: object };
      const bytes = `${header}\n${JSON.stringify({ ...r, positions: { lines: 1, sha256: "f".repeat(64) } })}\n${reportLine}\n`;
      const dir = path.join(temp("result"), "result");
      mkdirSync(path.join(dir, "a"), { recursive: true });
      writeFileSync(path.join(dir, "a", "result.part"), bytes);
      const other = path.join(temp("look"), "COPY-H", "look1");
      const held = writeLook({
        look: other,
        engine: {
          ...e,
          result: {
            dir,
            record: {
              phase: "RESULT",
              parts: [["result", sha256(header!), sha256(bytes)]],
            },
          },
        },
        mondays: [M1, M2],
        identity: {},
        counts,
        log: () => {},
      });
      await expect(held).rejects.toThrow(
        /the positions written \(1 lines, [0-9a-f]{64}\) are not RESULT's \(1, f{64}\)/,
      );
      await held.catch((err: unknown) => expect(exitOf(err).code).toBe(6));
      expect(existsSync(path.join(other, "result.json"))).toBe(false);
    });
  },
);
