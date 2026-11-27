/**
 * COPY-H's synthetic world (test/copyh-chain.ts; copyh/rules.md C15 (b)):
 * - always: the world's traders and files (each trader alone on its coin,
 *   the copies on days of their own and none in the rehearsal's fortnight,
 *   every record in its stage, the funding rows through the program's
 *   reader), each copy's numbers above the bars the choice and the verdict
 *   read, and the scratch's refusals (a relative folder, one not empty, one
 *   inside the repository or holding it, by name and by a junction's real
 *   path);
 * - with COPYH_WORLD=pieces and COPYH_WORLD_DIR an empty folder outside the
 *   repository (COPYH_WORLD_SOURCE the repository, by default this one):
 *   the scratch from HEAD, the world, E's store built once as the
 *   rehearsal's record, the first list and its tag in the scratch, the gate
 *   opening under it, and the control;
 * - with COPYH_WORLD=chain: the same, then the chain through the built
 *   program (step1, tries --round 1, choice, --rounds, step2, --fresh2,
 *   fresh2), every output asserted against the world's own numbers, then
 *   the control: on a commit whose source changed after the tag, step 1
 *   stops at the gate (exit 4) having written nothing. One heavy load at a
 *   time: the chain runs alone, on the supervisor's word, outside
 *   02:30-06:00Z and 10:25-11:15Z.
 * The repository is only read (`git archive`, `rev-parse`, `ls-tree`, its
 * tags before and after): no tag, list or store of it is touched.
 */
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { afterAll, describe, expect, it } from "vitest";
import {
  END_E,
  END_F2,
  END_S,
  REHEARSAL_WINDOW,
  WORKER_HEAP_GB,
} from "../src/copyh/design.js";
import { fundingKey, readWindow } from "../src/copyh/funding.js";
import { FROZEN_FILE } from "../src/copyh/gate.js";
import { RANGES } from "../src/copyh/range.js";
import {
  PACKAGE_ROOT,
  fingerprintOf,
  sha256,
  sharedHashes,
} from "../src/copyh/run.js";
import { IDENTITY_LISTS, LOOK_FILES } from "../src/copyh/steps.js";
import { TryLine } from "../src/copyh/tries.js";
import { KIT_FINGERPRINT, LIB_EXITS_SHA256 } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import {
  NEW_COIN,
  PLANS,
  STAGES,
  TRIES,
  WORLD_FILES,
  buildScratch,
  commitAll,
  envOf,
  expectedOf,
  freezeList,
  logOf,
  makeScratch,
  mondayOf,
  program,
  scratchProblem,
  setWorldValues,
  settingsOf,
  stageAt,
  unlinkScratch,
  worldOf,
  writeFresh2Lists,
  writeRehearsal,
  writeRepro,
  writeWorld,
  writeWorldLists,
  type ProgramRun,
  type Scratch,
  type Settings,
  type Stage,
  type Trader,
} from "./copyh-chain.js";
import { git } from "./copyh-world.js";

const COINS = (
  JSON.parse(
    readFileSync(path.join(PACKAGE_ROOT, "copyh", "coins.json"), "utf8"),
  ) as { coins: { name: string }[] }
).coins.map((c) => c.name);
const world = worldOf(COINS);
const of = (s: Stage) => world.traders.filter((t) => t.stage === s);
const mean = (a: readonly number[]) => a.reduce((s, x) => s + x, 0) / a.length;
const nets = (ts: readonly Trader[]) => ts.map((t) => expectedOf(t).net);
const END: Record<Stage, number> = { E: END_E, S: END_S, "FRESH-2": END_F2 };
/** Voted by END (C10): ⌊t / 1 h⌋·1 h + 1 h + 95.44 s + 24 h ≤ END. */
const voted = (t: number, end: number) =>
  Math.floor(t / HOUR_MS) * HOUR_MS + HOUR_MS + 95_440 + DAY_MS <= end;

describe("COPYH-WORLD's world and its scratch's refusals", () => {
  it("has 120 traders on E and 30 each on S and FRESH-2, each alone on its coin, its copy on a day of its own, voted by its stage's END and after the rehearsal's fortnight; FRESH-2's last on the coin its freeze appends", () => {
    expect(STAGES.map((s) => of(s).length)).toEqual([120, 30, 30]);
    for (const key of ["iid", "coin", "addr"] as const)
      expect(new Set(world.traders.map((t) => t[key])).size, key).toBe(180);
    expect(new Set(of("E").map((t) => Math.floor(t.h0 / DAY_MS))).size).toBe(
      120,
    );
    for (const t of world.traders) {
      // The first setup fill, the copy and its next day's tape: all in the stage.
      expect(stageAt(mondayOf(t.h0) - 6 * DAY_MS), t.addr).toBe(t.stage);
      expect(stageAt(t.h0 + DAY_MS + HOUR_MS), t.addr).toBe(t.stage);
      expect(voted(t.h0 + 30_000, END[t.stage]), t.addr).toBe(true);
      expect(t.h0 >= REHEARSAL_WINDOW[1], t.addr).toBe(true);
    }
    expect(of("FRESH-2").at(-1)).toMatchObject({
      coin: NEW_COIN,
      iid: COINS.length,
    });
    expect(COINS).not.toContain(NEW_COIN);
  });

  it("writes E's and S's every hour and FRESH-2's hours that hold a record, 42 records a trader, and a funding row an episode the program's reader passes", () => {
    expect([...world.files.E.keys()]).toEqual(RANGES.E.fill);
    expect([...world.files.S.keys()]).toEqual(RANGES.S.fill);
    const fresh2 = [...world.files["FRESH-2"].keys()];
    const held = new Set(fresh2);
    expect(fresh2).toEqual(RANGES["FRESH-2"].fill.filter((k) => held.has(k)));
    // Each trader's 4 round trips and its copy's 13 tape trades, a taker and a maker each.
    expect(world.records).toEqual({
      E: 120 * 42,
      S: 30 * 42,
      "FRESH-2": 30 * 42,
    });
    const empty = world.files.E.get(RANGES.E.fill[0]!)!;
    expect(
      [...world.files["FRESH-2"].values()].some((b) => b.equals(empty)),
    ).toBe(false);
    for (const p of PLANS) {
      const traders = of(p.stage);
      expect([...world.windows[p.stage].keys()]).toEqual(
        traders.map((t) => fundingKey(t.coin, p.window)).sort(),
      );
      for (const t of traders) {
        const rows = readWindow(
          world.windows[p.stage].get(fundingKey(t.coin, p.window))!,
          t.coin,
        );
        expect(rows, t.coin).toMatchObject([{ hour: t.h0 + HOUR_MS }]);
      }
    }
  });

  it("gives each copy a net and an edge over the market above the bars the choice and the verdict read, from its two prices alone", () => {
    for (const t of world.traders) {
      const e = expectedOf(t);
      expect(e.net, t.addr).toBeGreaterThan(80);
      expect(e.edge, t.addr).toBeGreaterThan(40);
      expect(e.d, t.addr).toBeCloseTo(0.8 * e.gross, 9);
      expect(Number(t.q) * Number(t.p0), t.addr).toBeGreaterThan(1000);
    }
  });

  it("refuses a scratch in a folder that is relative, not empty, inside the repository or holding it, by name or by a junction's real path", () => {
    const tmp = mkdtempSync(path.join(tmpdir(), "copyh-chain-"));
    const repo = path.join(tmp, "repo");
    mkdirSync(path.join(repo, "x"), { recursive: true });
    const overlap = (dir: string, source = repo) =>
      `${dir} and the repository ${source} overlap`;
    expect(scratchProblem(repo, "relative")).toBe(
      "relative is not an absolute path",
    );
    expect(scratchProblem(repo, repo)).toBe(`${repo} is not empty`);
    const fresh = path.join(repo, "new");
    expect(scratchProblem(repo, fresh)).toBe(overlap(fresh));
    const outer = path.join(tmp, "outer");
    expect(scratchProblem(path.join(outer, "repo"), outer)).toBe(
      overlap(outer, path.join(outer, "repo")),
    );
    const link = path.join(tmp, "link");
    symlinkSync(repo, link, "junction");
    try {
      const through = path.join(link, "new");
      expect(scratchProblem(repo, through)).toBe(overlap(through));
      expect(scratchProblem(repo, path.join(tmp, "new"))).toBeNull();
    } finally {
      rmdirSync(link);
    }
    expect(existsSync(path.join(repo, "x"))).toBe(true);
  });
});

const MODE = process.env.COPYH_WORLD;
const DIR = process.env.COPYH_WORLD_DIR ?? "";
/** The repository the scratch is made from: this one, unless named. */
const SOURCE =
  process.env.COPYH_WORLD_SOURCE ?? path.resolve(PACKAGE_ROOT, "..", "..");

const fileSha = (f: string) => sha256(readFileSync(f));
/** Why a program's run ended as it did: its stderr and its log's last line. */
const whyOf = (r: ProgramRun) => `${r.stderr}${JSON.stringify(r.last)}`;
const readJson = (...p: string[]): unknown =>
  JSON.parse(readFileSync(path.join(...p), "utf8"));
/** A freeze list's file lines, its head left out. */
const fileLines = (list: string) =>
  list.split("\n").filter((l) => /^[0-9a-f]{64} \*/.test(l));
const LIST_AT_1 = "copyh-freeze-1:apps/poller/copyh/FROZEN.sha256";
type Freeze = { sha256: string; tag: string };
/** Every output's identity (C0) as the world expects it: the scratch's program and freeze, the kit, the lists and these files by SHA-256. */
const identityOf = (
  s: Scratch,
  freeze: Freeze,
  files: Record<string, string>,
) => ({
  program: fingerprintOf(s.pkg),
  freeze,
  kit: KIT_FINGERPRINT,
  libExits: LIB_EXITS_SHA256,
  lists: Object.fromEntries(
    IDENTITY_LISTS.map((f) => [f, fileSha(path.join(s.pkg, "copyh", f))]),
  ),
  files: Object.fromEntries(
    Object.entries(files).map(([name, f]) => [name, fileSha(f)]),
  ),
  shared: sharedHashes(s.pkg),
  heapGb: WORKER_HEAP_GB,
  node: process.version,
});
/** A step's store files by their names in its result's identity. */
const storeFiles = (look: string, prefix: string, twin: boolean) => ({
  [`${prefix}store/manifest.json`]: path.join(look, "store", "manifest.json"),
  ...(twin
    ? {
        [`${prefix}twin/store/manifest.json`]: path.join(
          look,
          "twin",
          "store",
          "manifest.json",
        ),
      }
    : {}),
  [`${prefix}builds.json`]: path.join(look, "builds.json"),
  [`${prefix}integrity/integrity.json`]: path.join(
    look,
    "integrity",
    "integrity.json",
  ),
});
type Money = { n: number; mean: number; traders: number; days: number };
type Positions = { lines: number; sha256: string; file: { sha256: string } };
type Look = {
  identity: unknown;
  look: number;
  z: number;
  verdict: string;
  after: boolean;
  statistic: {
    copies: number;
    unpriced: number;
    money: Money;
    edge: { byDay: { mean: number } };
  };
  positions: Positions;
};
/** A look's report as the world reads it: its identity, MAIN's prints, the step's counts. */
type Report = {
  identity: unknown;
  calibration: unknown;
  venues: { hyperliquidBase: { money: Money } };
  h1: { nullMeanGross: number };
  step: { fortnight: { equal: boolean; lines: number } };
};
/** A look's positions file held to its result.json (the lines' count and SHA-256, the file's SHA-256), its lines read. */
function positionsOf(look: string, want: Positions): TryLine[] {
  const file = path.join(look, "positions.jsonl.gz");
  const text = gunzipSync(readFileSync(file)).toString("utf8");
  expect(fileSha(file)).toBe(want.file.sha256);
  expect(sha256(text)).toBe(want.sha256);
  const lines = text.split("\n").filter((l) => l !== "");
  expect(lines.length).toBe(want.lines);
  return lines.map((l) => TryLine.parse(JSON.parse(l)));
}
/** Each of these traders' copy in the positions, priced as the world priced it: its money, its d and its x′ on MAIN. */
function copiesHeld(lines: readonly TryLine[], traders: readonly Trader[]) {
  const by = new Map(lines.map((l) => [l.addr, l]));
  for (const t of traders) {
    const l = by.get(t.addr);
    const e = expectedOf(t);
    expect(l?.t, t.addr).toBe(t.h0 + 30_000);
    expect(l?.lines, t.addr).toEqual(expect.arrayContaining(["MAIN", "BROAD"]));
    expect([l?.voted, l?.thin], t.addr).toEqual([true, false]);
    expect(l?.money, t.addr).toMatchObject({
      net: expect.closeTo(e.net, 6) as unknown,
      gross: expect.closeTo(e.gross, 6) as unknown,
    });
    expect(l?.judged.MAIN, t.addr).toMatchObject({
      d: expect.closeTo(e.d, 6) as unknown,
      edge: expect.closeTo(e.edge, 6) as unknown,
    });
  }
}

describe.runIf(MODE === "pieces" || MODE === "chain")(
  `COPYH-WORLD's ${MODE ?? ""} in ${DIR}`,
  { timeout: 6 * 3600_000 },
  () => {
    const settings: Settings = settingsOf(path.join(DIR, "world"));
    const scratches: Scratch[] = [];
    let tags: string | undefined;
    let s: Scratch;
    let list1: Freeze;
    let list2: Freeze;
    let list3: Freeze;

    afterAll(() => {
      for (const x of scratches) unlinkScratch(x);
      // The repository's tags as they were: no list or tag of the world reached it.
      if (tags !== undefined) expect(git(SOURCE, "tag", "--list")).toBe(tags);
    }, 120_000);

    it("makes the scratch from the repository's HEAD, in its own repository, built", () => {
      tags = git(SOURCE, "tag", "--list");
      s = makeScratch(SOURCE, DIR);
      scratches.push(s);
      expect(s.head).toBe(git(SOURCE, "rev-parse", "HEAD").trim());
      expect(git(s.repo, "log", "--format=%s").trim()).toBe(
        `COPYH-WORLD: ${s.head} as git archive wrote it`,
      );
      expect(git(s.repo, "tag", "--list")).toBe("");
      expect(existsSync(path.join(s.pkg, "dist", "copyh.js"))).toBe(true);
    });

    it("writes the world, sets the scratch's values and lists, builds E's store once as the rehearsal's record, and freezes the first list, tagged in the scratch alone", async () => {
      writeWorld(settings, world);
      setWorldValues(s.pkg);
      writeWorldLists(s.pkg, world);
      buildScratch(s.pkg);
      const r = await writeRehearsal(s, settings);
      expect(
        [r.build.code, r.closure.code],
        r.build.stderr + r.closure.stderr,
      ).toEqual([0, 0]);
      const rehearsal = readJson(s.pkg, "copyh", "rehearsal.json") as {
        store: { range: unknown };
      };
      expect(rehearsal.store.range).toBe("E");
      expect(existsSync(path.join(settings.COPYH_ROOT, "E"))).toBe(false);
      commitAll(s.repo, "COPYH-WORLD: the world's values and lists");
      const f = await freezeList(s, ["--final"], 1);
      expect(f.run.code, f.run.stderr).toBe(0);
      writeRepro(s, settings);
      const text = readFileSync(path.join(s.pkg, FROZEN_FILE), "utf8");
      expect(text.split("\n").filter((l) => l.startsWith("# tag "))).toEqual([
        "# tag copyh-freeze-1",
      ]);
      expect(git(s.repo, "tag", "--list").trim()).toBe("copyh-freeze-1");
      expect(git(SOURCE, "tag", "--list")).toBe(tags);
      list1 = { sha256: sha256(text), tag: "copyh-freeze-1" };
    });

    it.runIf(MODE === "pieces")(
      "opens the gate under the synthetic tag: tries is refused after it, for want of tries.json (exit 5)",
      async () => {
        const r = await program(
          s,
          envOf(settings, ["COPYH_ROOT", "WAVEH_STORE"]),
          ["tries", "--round", "1"],
        );
        expect(r.code, whyOf(r)).toBe(5);
        const log = logOf(settings.COPYH_ROOT);
        expect(log.filter((l) => l.msg === "gate").at(-1)).toMatchObject({
          freeze: { ok: true, ...list1, command: "tries" },
        });
        expect(log.at(-1)).toMatchObject({
          msg: "not ready",
          why: "no copyh/tries.json",
        });
      },
    );

    it.runIf(MODE === "chain")(
      "step 1: E's store held to the record, look 1 KEEP on the world's numbers, every output's identity first",
      async () => {
        const r = await program(
          s,
          envOf(settings, ["COPYH_ROOT", "WAVEH_STORE", "COPYH_FUNDING"]),
          ["step1"],
        );
        expect(r.code, whyOf(r)).toBe(0);
        const look = path.join(settings.COPYH_ROOT, "look1");
        const result = readJson(look, "result.json") as Look;
        const report = readJson(look, "report.json") as Report;
        const identity = identityOf(s, list1, {
          "repro.json": path.join(settings.COPYH_ROOT, "repro.json"),
          ...storeFiles(look, "", false),
        });
        expect(result.identity).toEqual(identity);
        expect(report.identity).toEqual(identity);
        expect(result).toMatchObject({
          look: 1,
          z: 2.81,
          verdict: "KEEP",
          after: false,
        });
        const E = of("E");
        expect(result.statistic).toMatchObject({ copies: 120, unpriced: 0 });
        expect(result.statistic.money).toMatchObject({
          n: 120,
          traders: 120,
          days: 120,
        });
        expect(result.statistic.money.mean).toBeCloseTo(mean(nets(E)), 6);
        expect(result.statistic.edge.byDay.mean).toBeCloseTo(
          mean(E.map((t) => expectedOf(t).edge)),
          6,
        );
        copiesHeld(positionsOf(look, result.positions), E);
        expect(readJson(look, "builds.json")).toMatchObject({
          record: { equal: true, differences: [] },
          twin: null,
        });
        expect(readJson(look, "integrity", "integrity.json")).toMatchObject({
          passed: true,
        });
        expect(report.calibration).toEqual(
          readJson(s.pkg, "copyh", "calibration.json"),
        );
        expect(report.venues.hyperliquidBase.money.mean).toBeCloseTo(
          mean(nets(E)),
          6,
        );
        expect(report.h1.nullMeanGross).toBeCloseTo(
          mean(E.map((t) => 0.2 * expectedOf(t).gross)),
          6,
        );
        expect(report.step.fortnight).toMatchObject({ equal: true, lines: 0 });
        expect(existsSync(path.join(look, "logs"))).toBe(true);
      },
    );

    it.runIf(MODE === "chain")(
      "the rounds: T1 qualifies on E and is chosen, T2 not; the rounds' list adds tries.json, choice.json and look1.sha256 alone, tagged copyh-freeze-2",
      async () => {
        const tries = path.join(s.pkg, "copyh", "tries.json");
        writeFileSync(tries, `${JSON.stringify(TRIES, null, 1)}\n`);
        commitAll(s.repo, "COPYH-WORLD: round 1's tries");
        const env = envOf(settings, ["COPYH_ROOT", "WAVEH_STORE"]);
        const r1 = await program(s, env, ["tries", "--round", "1"]);
        expect(r1.code, whyOf(r1)).toBe(0);
        const rounds = path.join(settings.COPYH_ROOT, "rounds");
        const round = readJson(rounds, "round-1.json") as {
          tries: unknown;
          triesSha256: string;
          figures: {
            statistic: { money: Money };
            lower: { money: number; edge: number } | null;
            withoutBestDays: number | null;
          }[];
        };
        expect(round.tries).toEqual(TRIES.rounds[0]);
        expect(round.triesSha256).toBe(fileSha(tries));
        const [t1, t2] = round.figures;
        expect(t1?.statistic.money).toMatchObject({
          n: 120,
          traders: 120,
          days: 120,
          mean: expect.closeTo(mean(nets(of("E"))), 6) as unknown,
        });
        expect(t1?.lower?.money).toBeGreaterThan(0);
        expect(t1?.lower?.edge).toBeGreaterThan(0);
        expect(t1?.withoutBestDays).toBeGreaterThan(0);
        expect(t2?.statistic.money).toMatchObject({ n: 3, traders: 3 });
        const r2 = await program(s, env, ["choice"]);
        expect(r2.code, whyOf(r2)).toBe(0);
        const choice = readJson(rounds, "choice.json") as {
          rounds: unknown;
          qualified: unknown;
          chosen: { name: string; try: unknown }[];
        };
        expect(choice.rounds).toEqual([
          { round: 1, sha256: fileSha(path.join(rounds, "round-1.json")) },
        ]);
        expect(choice.qualified).toEqual([{ round: 1, index: 0, name: "T1" }]);
        expect(choice.chosen.map((c) => [c.name, c.try])).toEqual([
          ["T1", TRIES.rounds[0]![0]],
        ]);
        copyFileSync(
          path.join(rounds, "choice.json"),
          path.join(s.pkg, "copyh", "choice.json"),
        );
        commitAll(s.repo, "COPYH-WORLD: the choice");
        const f = await freezeList(
          s,
          ["--rounds", "--root", settings.COPYH_ROOT, "--tag", "2"],
          2,
        );
        expect(f.run.code, f.run.stderr).toBe(0);
        const look1 = path.join(settings.COPYH_ROOT, "look1");
        expect(
          readFileSync(path.join(s.pkg, "copyh", "look1.sha256"), "utf8"),
        ).toBe(
          LOOK_FILES.map((n) => `${fileSha(path.join(look1, n))} *${n}\n`).join(
            "",
          ),
        );
        const text = readFileSync(path.join(s.pkg, FROZEN_FILE), "utf8");
        const before = fileLines(git(s.repo, "show", LIST_AT_1));
        expect(
          fileLines(text)
            .filter((l) => !before.includes(l))
            .map((l) => l.slice(66))
            .sort(),
        ).toEqual([
          "copyh/choice.json",
          "copyh/look1.sha256",
          "copyh/tries.json",
        ]);
        expect(fileLines(text).length).toBe(before.length + 3);
        list2 = { sha256: sha256(text), tag: "copyh-freeze-2" };
      },
    );

    it.runIf(MODE === "chain")(
      "step 2: S's store twice, step 1 recomputed and held, look 2 after the verdict, T1 confirmed on S at 2.24, MAIN on S printed",
      async () => {
        const r = await program(
          s,
          envOf(settings, [
            "COPYH_ROOT",
            "WAVEH_STORE",
            "COPYH_FUNDING",
            "FRESH_STORE",
          ]),
          ["step2"],
        );
        expect(r.code, whyOf(r)).toBe(0);
        const look1 = path.join(settings.COPYH_ROOT, "look1");
        const look = path.join(settings.COPYH_ROOT, "look2");
        const result = readJson(look, "result.json") as Look & {
          confirmations: {
            name: string;
            reading: string;
            z: number | null;
            statistic: { money: Money };
          }[];
        };
        const report = readJson(look, "report.json") as Report & {
          mainOnS: Report;
        };
        const identity = identityOf(s, list2, {
          "repro.json": path.join(settings.COPYH_ROOT, "repro.json"),
          ...Object.fromEntries(
            LOOK_FILES.map((f) => [`look1/${f}`, path.join(look1, f)]),
          ),
          ...storeFiles(look1, "look1/", false),
          ...storeFiles(look, "", true),
        });
        expect(result.identity).toEqual(identity);
        expect(report.identity).toEqual(identity);
        expect(result).toMatchObject({ look: 2, z: 2.43, after: true });
        const ES = [...of("E"), ...of("S")];
        expect(result.statistic.money).toMatchObject({
          n: 150,
          mean: expect.closeTo(mean(nets(ES)), 6) as unknown,
        });
        copiesHeld(positionsOf(look, result.positions), ES);
        const onS = {
          n: 30,
          mean: expect.closeTo(mean(nets(of("S"))), 6) as unknown,
        };
        expect(
          result.confirmations.map((c) => [c.name, c.reading, c.z]),
        ).toEqual([["T1", "CONFIRMED", 2.24]]);
        expect(result.confirmations[0]?.statistic.money).toMatchObject(onS);
        expect(report.mainOnS.venues.hyperliquidBase.money).toMatchObject(onS);
        expect(readJson(look, "builds.json")).toMatchObject({
          record: null,
          twin: expect.anything() as unknown,
        });
      },
    );

    it.runIf(MODE === "chain")(
      "FRESH-2's freeze adds fresh2.sha256, funding2.sha256 and look2.sha256 and appends the world's coin, tagged copyh-freeze-3",
      async () => {
        writeFresh2Lists(s.pkg, world);
        commitAll(s.repo, "COPYH-WORLD: FRESH-2's lists and its new coin");
        const f = await freezeList(
          s,
          ["--fresh2", "--root", settings.COPYH_ROOT, "--tag", "3"],
          3,
        );
        expect(f.run.code, f.run.stderr).toBe(0);
        const look2 = path.join(settings.COPYH_ROOT, "look2");
        expect(
          readFileSync(path.join(s.pkg, "copyh", "look2.sha256"), "utf8"),
        ).toBe(
          LOOK_FILES.map((n) => `${fileSha(path.join(look2, n))} *${n}\n`).join(
            "",
          ),
        );
        expect(git(s.repo, "tag", "--list").trim().split("\n")).toEqual([
          "copyh-freeze-1",
          "copyh-freeze-2",
          "copyh-freeze-3",
        ]);
        list3 = {
          sha256: fileSha(path.join(s.pkg, FROZEN_FILE)),
          tag: "copyh-freeze-3",
        };
      },
    );

    it.runIf(MODE === "chain")(
      "FRESH-2's stage: its store twice, MAIN at 1.645 and T1 at 1.96 each sealed and confirmed on FRESH-2's copies alone, MAIN's prints in FRESH-2's form",
      async () => {
        const r = await program(
          s,
          envOf(settings, [
            "COPYH_ROOT",
            "WAVEH_STORE",
            "COPYH_FUNDING",
            "FRESH2_STORE",
          ]),
          ["fresh2"],
        );
        expect(r.code, whyOf(r)).toBe(0);
        const [look1, look2, look] = ["look1", "look2", "fresh2"].map((l) =>
          path.join(settings.COPYH_ROOT, l),
        ) as [string, string, string];
        const result = readJson(look, "result.json") as {
          identity: unknown;
          sets: {
            kind: string;
            name: string;
            line: string;
            z: number;
            reading: string;
            statistic: { money: Money };
          }[];
          positions: Positions;
        };
        const report = readJson(look, "report.json") as {
          identity: unknown;
          main: Record<string, unknown> & { h1: Record<string, unknown> };
        };
        const identity = identityOf(s, list3, {
          "repro.json": path.join(settings.COPYH_ROOT, "repro.json"),
          ...Object.fromEntries(
            [
              "copyh/fresh2.sha256",
              "copyh/funding2.sha256",
              "copyh/look2.sha256",
            ].map((f) => [f, path.join(s.pkg, ...f.split("/"))]),
          ),
          ...Object.fromEntries(
            LOOK_FILES.map((f) => [`look2/${f}`, path.join(look2, f)]),
          ),
          ...storeFiles(look1, "look1/", false),
          ...storeFiles(look2, "look2/", true),
          ...storeFiles(look, "", true),
          "engine/funding.sha256": path.join(look, "engine", "funding.sha256"),
        });
        expect(result.identity).toEqual(identity);
        expect(report.identity).toEqual(identity);
        expect(
          result.sets.map((x) => [x.kind, x.name, x.line, x.z, x.reading]),
        ).toEqual([
          ["MAIN", "MAIN", "MAIN", 1.645, "CONFIRMED"],
          ["try", "T1", "MAIN", 1.96, "CONFIRMED"],
        ]);
        const onF2 = {
          n: 30,
          mean: expect.closeTo(mean(nets(of("FRESH-2"))), 6) as unknown,
        };
        for (const x of result.sets)
          expect(x.statistic.money, x.name).toMatchObject(onF2);
        copiesHeld(positionsOf(look, result.positions), world.traders);
        expect(Object.keys(report.main).sort()).toEqual([
          "concentration",
          "gap",
          "h1",
          "lines",
          "parts",
          "r14",
          "settled",
          "thin",
          "venues",
        ]);
        expect(Object.keys(report.main.h1).sort()).toEqual([
          "d",
          "edge",
          "moneyByMonth",
          "moneyByWeek",
        ]);
      },
    );

    it("the control: on a commit whose source changed after the first list's tag, the same chain stops at step 1's gate (exit 4), having written nothing", async () => {
      const c = makeScratch(SOURCE, path.join(DIR, "control"));
      scratches.push(c);
      for (const f of WORLD_FILES)
        copyFileSync(path.join(s.pkg, f), path.join(c.pkg, f));
      buildScratch(c.pkg);
      commitAll(c.repo, "COPYH-WORLD: the world's values and lists");
      const f = await freezeList(c, ["--final"], 1);
      expect(f.run.code, f.run.stderr).toBe(0);
      // The control froze the very files of the chain's first list.
      expect(
        fileLines(readFileSync(path.join(c.pkg, FROZEN_FILE), "utf8")),
      ).toEqual(fileLines(git(s.repo, "show", LIST_AT_1)));
      const cs: Settings = {
        ...settingsOf(path.join(c.dir, "world")),
        WAVEH_STORE: settings.WAVEH_STORE,
      };
      writeRepro(c, cs);
      const env = envOf(cs, ["COPYH_ROOT", "WAVEH_STORE", "COPYH_FUNDING"]);
      // Before the defect the gate opens: tries is refused after it.
      const open = await program(c, env, ["tries", "--round", "1"]);
      expect(open.code, whyOf(open)).toBe(5);
      expect(logOf(cs.COPYH_ROOT).at(-1)).toMatchObject({
        msg: "not ready",
        why: "no copyh/tries.json",
      });
      const design = path.join(c.pkg, "src", "copyh", "design.ts");
      const z = "export const Z_LOOKS = [2.81, 2.43] as const;";
      const text = readFileSync(design, "utf8");
      expect(text.split(z).length).toBe(2);
      writeFileSync(
        design,
        text.replace(z, "export const Z_LOOKS = [1.81, 2.43] as const;"),
      );
      buildScratch(c.pkg);
      commitAll(
        c.repo,
        "COPYH-WORLD: the control's planted defect, look 1's bar lowered after the freeze",
      );
      const r = await program(c, env, ["step1"]);
      expect(r.code, whyOf(r)).toBe(4);
      expect(logOf(cs.COPYH_ROOT).at(-1)).toMatchObject({
        msg: "frozen files differ",
        why: "1: changed: dist/copyh/design.js",
      });
      expect(existsSync(path.join(cs.COPYH_ROOT, "look1"))).toBe(false);
    });
  },
);
