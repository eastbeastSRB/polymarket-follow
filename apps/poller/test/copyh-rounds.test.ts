/**
 * The owner's rounds and the choice (src/copyh/tries.ts, rounds.ts, choice.ts;
 * rules.md C14), on made-up data:
 * - tries.json: a try read; its conditions on C14's covariates only, any
 *   other name (the side among them) refused; a fourth round, a round past
 *   its cap, a name twice and another key refused;
 * - each operator on both sides, a covariate the copy lacks meeting none; a
 *   try's set: its line's copies voted by END, every condition met;
 * - the mean without the two best days (equal sums: the earlier day left
 *   out); a try's figures, C12's forms at z 2.99;
 * - the choice's every condition on both sides; at most two chosen by
 *   m − 2.99·SE, ties the earlier round, then the earlier try; none when
 *   none qualifies;
 * - a round's refusals in C14's order, each exit 5, tries.json in a
 *   throwaway git repository (not committed, changed after its commit);
 * - through real child processes: a round on a made-up positions file, its
 *   figures equal to those computed here on its sets written out, a file
 *   other than step 1's and lines other than its refused; the choice from
 *   made-up round files, a round file changed refused; a second choice
 *   refused before anything is read.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { loadResearch } from "../src/paper/research.js";
import {
  ChoiceOf,
  choiceFile,
  chosenOf,
  qualifies,
  runChoice,
} from "../src/copyh/choice.js";
import { partBytes, runPhase, type Phase } from "../src/copyh/engine.js";
import {
  RoundFile,
  TryFigures,
  eachGzLine,
  figuresOf,
  readyForRound,
  roundFile,
  withoutBestDays,
} from "../src/copyh/rounds.js";
import {
  TRIES_FILE,
  TriesFile,
  holds,
  inTry,
  type Try,
  type TryLine,
} from "../src/copyh/tries.js";
import {
  AlreadyRun,
  PACKAGE_ROOT,
  StoreError,
  exitOf,
  sha256,
} from "../src/copyh/run.js";
import { SEALED } from "../src/copyh/seal.js";
import {
  boundsOf,
  statisticOf,
  type JudgedCopy,
} from "../src/copyh/verdict.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import { addr } from "./copyh-world.js";

const kit = await loadResearch();
const temp = (name: string) =>
  mkdtempSync(path.join(tmpdir(), `copyh-${name}-`));
const never = { stop: () => null };
const codeOf = async (f: () => unknown): Promise<number | null> => {
  try {
    await f();
  } catch (err) {
    return exitOf(err).code;
  }
  return null;
};

const tryOf = (name: string, o: Partial<Try> = {}): Try => ({
  name,
  line: "MAIN",
  conditions: [{ covariate: "closedCycles", op: ">=", value: 5 }],
  why: "made-up",
  ...o,
});

describe("tries.json (C14: a try is data, never code)", () => {
  it("reads a try of its line, conditions and why", () => {
    const f = {
      rounds: [
        [
          tryOf("a"),
          tryOf("b", {
            line: "BROAD",
            conditions: [{ covariate: "coin", op: "one of", value: [0, 2] }],
          }),
          tryOf("c", { conditions: [] }),
        ],
      ],
    };
    expect(TriesFile.parse(f)).toEqual(f);
  });

  it("refuses a condition on any other name, the side among them; a fourth round; a round past its cap of 8, 6 and 4; a name twice; another key", () => {
    const bad = (f: unknown) =>
      expect(TriesFile.safeParse(f).success).toBe(false);
    for (const covariate of ["side", "dir", "netBps", "medianHold"])
      bad({
        rounds: [
          [
            tryOf("a", {
              conditions: [{ covariate, op: "=", value: 1 } as never],
            }),
          ],
        ],
      });
    bad({
      rounds: [
        [
          tryOf("a", {
            conditions: [{ covariate: "coin", op: "≥", value: 1 } as never],
          }),
        ],
      ],
    });
    bad({ rounds: [[tryOf("a", { line: "TEN" as never })]] });
    const round = (n: number, k: number) =>
      Array.from({ length: n }, (_, i) => tryOf(`r${k}-${i}`));
    expect(
      TriesFile.safeParse({ rounds: [round(8, 1), round(6, 2), round(4, 3)] })
        .success,
    ).toBe(true);
    bad({ rounds: [round(9, 1)] });
    bad({ rounds: [round(8, 1), round(7, 2)] });
    bad({ rounds: [round(8, 1), round(6, 2), round(5, 3)] });
    bad({ rounds: [round(1, 1), round(1, 2), round(1, 3), round(1, 4)] });
    bad({ rounds: [[tryOf("a"), tryOf("a")]] });
    bad({ rounds: [[tryOf("a")], [tryOf("a")]] });
    bad({ rounds: [[{ ...tryOf("a"), side: "long" }]] });
    bad({
      rounds: [
        [
          tryOf("a", {
            conditions: [
              { covariate: "coin", op: "=", value: 1, side: 1 } as never,
            ],
          }),
        ],
      ],
    });
    bad({ rounds: [] });
    bad({ rounds: [[]] });
  });
});

const COV = {
  closedCycles: 4,
  medianHoldHours: 6.5,
  longShare: 0.5,
  entries: 7,
  coin: 2,
  sizeUsd: 1_500,
  priorCopies: 3,
  priorMeanNetBps: null,
};

describe("a condition and a try's set (C14)", () => {
  it("holds each operator on both sides of its constant", () => {
    const h = (op: ">=" | ">" | "<=" | "<" | "=", value: number) =>
      holds({ covariate: "closedCycles", op, value }, COV);
    expect([h(">=", 4), h(">=", 4.001)]).toEqual([true, false]);
    expect([h(">", 3.999), h(">", 4)]).toEqual([true, false]);
    expect([h("<=", 4), h("<=", 3.999)]).toEqual([true, false]);
    expect([h("<", 4.001), h("<", 4)]).toEqual([true, false]);
    expect([h("=", 4), h("=", 4.001)]).toEqual([true, false]);
    expect(holds({ covariate: "coin", op: "one of", value: [1, 2] }, COV)).toBe(
      true,
    );
    expect(holds({ covariate: "coin", op: "one of", value: [1, 3] }, COV)).toBe(
      false,
    );
  });

  it("meets no condition on a covariate the copy lacks", () => {
    for (const op of [">=", ">", "<=", "<", "="] as const)
      for (const value of [-1e9, 0, 1e9])
        expect(
          holds({ covariate: "priorMeanNetBps", op, value }, COV),
          `${op} ${value}`,
        ).toBe(false);
    expect(
      holds({ covariate: "priorMeanNetBps", op: "one of", value: [0] }, COV),
    ).toBe(false);
  });

  it("takes its line's copies voted by END that meet every condition", () => {
    const p = {
      voted: true,
      lines: ["MAIN", "BROAD"],
      covariates: { ...COV, closedCycles: 5, priorMeanNetBps: 2 },
    } as unknown as TryLine;
    const t = tryOf("a", {
      conditions: [
        { covariate: "closedCycles", op: ">=", value: 5 },
        { covariate: "priorMeanNetBps", op: ">", value: 1 },
      ],
    });
    expect(inTry(p, t)).toBe(true);
    expect(inTry({ ...p, voted: false }, t)).toBe(false);
    expect(inTry({ ...p, lines: ["BROAD"] }, t)).toBe(false);
    expect(inTry({ ...p, lines: ["BROAD"] }, { ...t, line: "BROAD" })).toBe(
      true,
    );
    expect(
      inTry({ ...p, covariates: { ...p.covariates, priorMeanNetBps: 1 } }, t),
    ).toBe(false);
    expect(
      inTry(
        { ...p, covariates: { ...p.covariates, priorMeanNetBps: null } },
        t,
      ),
    ).toBe(false);
  });
});

const D0 = Date.parse("2025-09-01T00:00:00Z");
const at = (day: number, hour = 9) => D0 + day * DAY_MS + hour * HOUR_MS;

describe("the figures a try prints (C14)", () => {
  it("leaves out the two UTC days of t + D with the largest sums of x, the earlier day first on equal sums; none left, null", () => {
    expect(
      withoutBestDays([
        { tIn: at(0), x: 4 },
        { tIn: at(0, 20), x: 6 },
        { tIn: at(1), x: 30 },
        { tIn: at(2), x: 20 },
        { tIn: at(3), x: -5 },
      ]),
    ).toBeCloseTo(5 / 3, 12);
    expect(
      withoutBestDays([
        { tIn: at(2), x: 7 },
        { tIn: at(1), x: 10 },
        { tIn: at(2, 23), x: 3 },
        { tIn: at(0), x: 10 },
      ]),
    ).toBe(5);
    expect(
      withoutBestDays([
        { tIn: at(0), x: 1 },
        { tIn: at(1), x: 2 },
      ]),
    ).toBeNull();
  });

  it("gives C12's forms on its set, the weeks of its priced copies and both lower bounds at 2.99", () => {
    const set: JudgedCopy[] = Array.from({ length: 24 }, (_, k) => ({
      addr: addr(0x100 + (k % 5)),
      tIn: at(k % 12, (k * 7) % 24),
      x: k % 7 === 3 ? null : ((k * k) % 31) / 10 - 0.9,
      edge: k % 6 === 1 ? null : ((k * 3) % 17) / 10 - 0.4,
      thin: k % 4 === 0,
    }));
    const t = tryOf("a");
    const f = figuresOf(kit, t, set);
    const s = statisticOf(kit, set);
    const b = boundsOf(s, 2.99)!;
    expect(b).not.toBeNull();
    expect(f).toEqual({
      name: "a",
      line: "MAIN",
      statistic: s,
      weeks: 2,
      lower: {
        money: s.money!.mean - 2.99 * s.money!.se!,
        edge: s.edge.byDay!.mean - 2.99 * s.edge.se!,
      },
      withoutBestDays: withoutBestDays(
        set.flatMap((c) => (c.x === null ? [] : [{ tIn: c.tIn, x: c.x }])),
      ),
    });
    expect(figuresOf(kit, t, set.slice(0, 1)).lower).toBeNull();
  });
});

/** A try's figures written out: every condition of the choice met by a margin. */
const figures = (
  o: {
    money?: number;
    edge?: number;
    lower?: null;
    traders?: number | null;
    without?: number | null;
    nTraders?: number;
    nDays?: number;
    noMoney?: boolean;
  } = {},
): TryFigures => ({
  name: "x",
  line: "MAIN",
  statistic: {
    copies: 400,
    unpriced: 0,
    unpricedShare: 0,
    money:
      o.noMoney === true
        ? null
        : {
            n: 400,
            mean: 3,
            se: 1,
            seTrader: 1,
            seDay: 1,
            seIid: 1,
            traders: o.nTraders ?? 100,
            days: o.nDays ?? 100,
          },
    edge: { byDay: null, byWeek: null, se: null },
    signs: {
      traders: o.traders === undefined ? 0.5 : o.traders,
      days: 0.5,
      withoutThin: 0.5,
    },
  },
  weeks: 20,
  lower:
    o.lower === null ? null : { money: o.money ?? 0.01, edge: o.edge ?? 0.01 },
  withoutBestDays: o.without === undefined ? 0.01 : o.without,
});

describe("the choice (C14)", () => {
  it("qualifies a try on every condition at once, each on both sides", () => {
    expect(qualifies(figures())).toBe(true);
    for (const [why, f] of [
      ["m − 2.99·SE at 0", figures({ money: 0 })],
      ["m′ − 2.99·SE′ at 0", figures({ edge: 0 })],
      ["no error", figures({ lower: null })],
      ["the traders' own means at 0", figures({ traders: 0 })],
      ["the traders' own means over none", figures({ traders: null })],
      ["the mean without the two best days at 0", figures({ without: 0 })],
      ["no copy without the two best days", figures({ without: null })],
      ["99 traders", figures({ nTraders: 99 })],
      ["99 days", figures({ nDays: 99 })],
      ["no money", figures({ noMoney: true })],
    ] as const)
      expect(qualifies(f), why).toBe(false);
  });

  it("chooses at most two qualifying tries by m − 2.99·SE, ties the earlier round, then the earlier try; none when none qualifies", () => {
    const round = (r: number, lowers: readonly (number | null)[]) => ({
      round: r,
      tries: lowers.map((_, i) => tryOf(`r${r}-${i}`)),
      figures: lowers.map((m) =>
        m === null ? figures({ nDays: 99 }) : figures({ money: m }),
      ),
    });
    expect(chosenOf([round(1, [5, null, 7]), round(2, [6])])).toEqual({
      qualified: [
        { round: 1, index: 0, name: "r1-0" },
        { round: 1, index: 2, name: "r1-2" },
        { round: 2, index: 0, name: "r2-0" },
      ],
      chosen: [
        expect.objectContaining({
          round: 1,
          index: 2,
          name: "r1-2",
          try: tryOf("r1-2"),
        }),
        expect.objectContaining({ round: 2, index: 0, name: "r2-0" }),
      ],
    });
    const tie = chosenOf([round(1, [4, 7]), round(2, [7, 7])]);
    expect(tie.chosen.map((c) => [c.round, c.index])).toEqual([
      [1, 1],
      [2, 0],
    ]);
    const same = chosenOf([round(1, [7, 7, 7])]);
    expect(same.chosen.map((c) => c.index)).toEqual([0, 1]);
    expect(chosenOf([round(1, [null, null])]).chosen).toEqual([]);
    expect(chosenOf([])).toEqual({ qualified: [], chosen: [] });
  });
});

/** A git command in a throwaway repository: no user setting, hook, signing or line-ending conversion reaches it (copyh-gate.test.ts's). */
function git(cwd: string, ...args: string[]): void {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([k]) => !k.startsWith("GIT_")),
  );
  const r = spawnSync(
    "git",
    [
      "-c",
      "user.name=test",
      "-c",
      "user.email=test@example.invalid",
      "-c",
      "commit.gpgsign=false",
      "-c",
      "core.autocrlf=false",
      "-c",
      "core.hooksPath=no-hooks",
      "-c",
      "init.defaultBranch=main",
      ...args,
    ],
    { cwd, env, encoding: "utf8", timeout: 30_000 },
  );
  if (r.status !== 0)
    throw new Error(`git ${args.join(" ")}: ${r.stderr || r.error?.message}`);
}

describe("a round's refusals (C14, in its order)", () => {
  it("refuses a round written, one before its predecessor's output, a tries.json missing, not committed as it is or not of its form, one without the round or with an earlier round changed, and step 1 unfinished, each exit 5", async () => {
    const pkg = temp("pkg");
    git(pkg, "init", "-q");
    const root = path.join(temp("root"), "COPY-H");
    const put = (file: string, text: string) => {
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, text);
    };
    const ready = (round: number) => () =>
      readyForRound({ root, packageRoot: pkg, round });
    const tries = JSON.stringify({ rounds: [[tryOf("a")], [tryOf("b")]] });
    put(roundFile(root, 1), "{}");
    expect(ready(1)).toThrow(AlreadyRun);
    expect(await codeOf(ready(1))).toBe(5);
    expect(ready(3)).toThrow("round 3: round 2's output is not written");
    expect(ready(2)).toThrow(`no ${TRIES_FILE}`);
    put(path.join(pkg, TRIES_FILE), tries);
    expect(ready(2)).toThrow(/is not committed as it is/);
    git(pkg, "add", TRIES_FILE);
    git(pkg, "commit", "-q", "-m", "tries");
    put(path.join(pkg, TRIES_FILE), `${tries} `);
    expect(ready(2)).toThrow(/is not committed as it is/);
    put(
      path.join(pkg, TRIES_FILE),
      JSON.stringify({ rounds: [[{ ...tryOf("a"), side: "long" }]] }),
    );
    git(pkg, "commit", "-q", "-a", "-m", "not of its form");
    expect(ready(2)).toThrow(/is not the rounds' tries/);
    put(path.join(pkg, TRIES_FILE), JSON.stringify({ rounds: [[tryOf("a")]] }));
    git(pkg, "commit", "-q", "-a", "-m", "one round");
    expect(ready(2)).toThrow(`${TRIES_FILE} declares no round 2`);
    put(path.join(pkg, TRIES_FILE), tries);
    git(pkg, "commit", "-q", "-a", "-m", "two rounds");
    const ran = (t: Try) =>
      put(
        roundFile(root, 1),
        JSON.stringify({
          identity: {},
          round: 1,
          tries: [t],
          triesSha256: "0".repeat(64),
          figures: [],
        }),
      );
    ran(tryOf("a", { why: "another reason" }));
    expect(ready(2)).toThrow(`${TRIES_FILE}'s round 1 is not the one that ran`);
    ran(tryOf("a"));
    expect(ready(2)).toThrow(/step 1 is not finished/);
    put(path.join(root, "look1", "report.json"), "{}");
    put(
      path.join(root, "look1", "result.json"),
      JSON.stringify({
        identity: {},
        positions: {
          lines: 3,
          sha256: "a".repeat(64),
          file: { name: "positions.jsonl.gz", sha256: "b".repeat(64) },
        },
      }),
    );
    expect(await codeOf(ready(2))).toBeNull();
    expect(ready(2)()).toEqual({
      tries: [tryOf("b")],
      triesSha256: sha256(tries),
      positions: { file: "b".repeat(64), lines: 3, sha256: "a".repeat(64) },
    });
  });

  it("refuses a second choice before it reads anything (exit 5)", async () => {
    const root = path.join(temp("root"), "COPY-H");
    mkdirSync(path.join(root, "rounds"), { recursive: true });
    writeFileSync(choiceFile(root), "{}");
    const run = runChoice({
      root,
      freeze: { sha256: "0".repeat(64), tag: "copyh-freeze-1" },
      seal: SEALED,
      heapGb: 1,
      budget: never,
      log: () => {},
    });
    await expect(run).rejects.toThrow(AlreadyRun);
    expect(await codeOf(() => run)).toBe(5);
  });

  it("reads a gzipped file's lines in order, and refuses a last line without its newline", async () => {
    const dir = temp("gz");
    const whole = path.join(dir, "whole.gz");
    writeFileSync(whole, gzipSync("a\néb\nc\n"));
    const lines: string[] = [];
    await eachGzLine(whole, (l) => lines.push(l));
    expect(lines).toEqual(["a", "éb", "c"]);
    const cut = path.join(dir, "cut.gz");
    writeFileSync(cut, gzipSync("a\nb"));
    await expect(eachGzLine(cut, () => {})).rejects.toThrow(StoreError);
  });
});

/** A made-up positions line of the fields a round reads: four traders over twelve days, uneven nets, some unpriced, some not voted, some BROAD only. */
function lineOf(k: number) {
  const net = ((k * k) % 37) / 10 - 1.2;
  const priced = k % 9 !== 4;
  return {
    id: `0x${k.toString(16).padStart(4, "0")}|2|${at(k % 12)}|OPEN`,
    addr: addr(0x101 + (k % 4)),
    t: at(k % 12, (k * 5) % 24),
    D: 62_140 + k,
    lines: k % 3 === 0 ? ["BROAD"] : ["MAIN", "BROAD"],
    voted: k % 13 !== 6,
    thin: k % 5 === 0,
    money: priced
      ? {
          net,
          gross: net + 9,
          fees: 9,
          funding: 0.1,
          holdMs: 3_600_000,
          fullExitMs: 3_600_000,
          fundingMissing: 0,
          spreadFallback: false,
        }
      : { reason: "no mark at the follow instant" },
    judged: {
      MAIN: { d: net + 1, nullGross: 0.5, edge: net + 0.3 },
      BROAD:
        k % 4 === 1
          ? { d: null, reason: "no long share", edge: null }
          : { d: net + 2, nullGross: 0.4, edge: net + 0.7 },
    },
    covariates: {
      closedCycles: 3 + (k % 6),
      medianHoldHours: k % 8 === 0 ? null : 6 + (k % 5),
      longShare: 0.5,
      entries: 4 + (k % 3),
      coin: k % 3,
      sizeUsd: 1_000 + 37 * k,
      priorCopies: k % 4,
      priorMeanNetBps: k % 5 === 2 ? null : (k % 7) - 3,
    },
    rank: false,
  };
}
const LINES = Array.from({ length: 72 }, (_, k) => lineOf(k));
const TRIES: Try[] = [
  tryOf("MAIN, at least 5 closed cycles"),
  tryOf("BROAD", { line: "BROAD", conditions: [] }),
  tryOf("MAIN, coins 0 and 2, a prior mean net above 0", {
    conditions: [
      { covariate: "coin", op: "one of", value: [0, 2] },
      { covariate: "priorMeanNetBps", op: ">", value: 0 },
    ],
  }),
];
/** Each try's set written out. */
const SETS = [
  LINES.filter(
    (p) =>
      p.voted && p.lines.includes("MAIN") && p.covariates.closedCycles >= 5,
  ),
  LINES.filter((p) => p.voted && p.lines.includes("BROAD")),
  LINES.filter(
    (p) =>
      p.voted &&
      p.lines.includes("MAIN") &&
      (p.covariates.coin === 0 || p.covariates.coin === 2) &&
      p.covariates.priorMeanNetBps !== null &&
      p.covariates.priorMeanNetBps > 0,
  ),
].map((ps, k) =>
  ps.map((p): JudgedCopy => ({
    addr: p.addr,
    tIn: p.t + p.D,
    x: p.money.net ?? null,
    edge: p.judged[TRIES[k]!.line].edge,
    thin: p.thin,
  })),
);

/** A phase of one part in a fresh folder, one child at 1 GB. */
const phaseOf = (
  module: string,
  fn: string,
  inputs: unknown,
  context: unknown,
): Phase => ({
  name: fn.toUpperCase(),
  dir: path.join(temp("phase"), "rounds", "engine", fn),
  module: path.join(PACKAGE_ROOT, "dist", "copyh", module),
  fn,
  parts: [{ id: "part", inputs }],
  context,
  workers: 1,
  heapGb: 1,
  seal: SEALED,
  budget: never,
  log: () => {},
});

describe(
  "a round and the choice through real child processes (C14; C15's guard)",
  { timeout: 120_000 },
  () => {
    const dir = temp("positions");
    const file = path.join(dir, "positions.jsonl.gz");
    const text = LINES.map((l) => `${JSON.stringify(l)}\n`).join("");
    writeFileSync(file, gzipSync(text));
    const positions = {
      file: sha256(gzipSync(text)),
      lines: LINES.length,
      sha256: sha256(text),
    };

    it("gives each try's figures on its set, computed here on the sets written out", async () => {
      expect(SETS.map((s) => s.length).every((n) => n > 2)).toBe(true);
      const p = phaseOf(
        "rounds.js",
        "roundPart",
        { code: "made-up", round: 1, tries: TRIES, positions },
        { positions: file },
      );
      const record = await runPhase(p);
      const got = JSON.parse(
        partBytes(p.dir, record, "part").toString("utf8"),
      ) as unknown;
      expect(got).toEqual(
        JSON.parse(
          JSON.stringify(TRIES.map((t, k) => figuresOf(kit, t, SETS[k]!))),
        ),
      );
      expect((got as TryFigures[])[1]!.lower).not.toBeNull();
    });

    it("refuses a positions file other than step 1's, and lines other than its (exit 5)", async () => {
      for (const other of [
        { ...positions, file: "0".repeat(64) },
        { ...positions, sha256: "0".repeat(64) },
        { ...positions, lines: LINES.length + 1 },
      ]) {
        const run = runPhase(
          phaseOf(
            "rounds.js",
            "roundPart",
            { code: "made-up", round: 1, tries: TRIES, positions: other },
            { positions: file },
          ),
        );
        await expect(run).rejects.toThrow(StoreError);
      }
      // The same file in a folder the seal refuses (an analyzer's) is not read.
      const sealed = path.join(
        temp("sealed"),
        "ANALYZER",
        "positions.jsonl.gz",
      );
      mkdirSync(path.dirname(sealed), { recursive: true });
      writeFileSync(sealed, gzipSync(text));
      const run = runPhase(
        phaseOf(
          "rounds.js",
          "roundPart",
          { code: "made-up", round: 1, tries: TRIES, positions },
          { positions: sealed },
        ),
      );
      await expect(run).rejects.toThrow(/ANALYZER/);
      expect(await codeOf(() => run)).toBe(5);
    });

    it("chooses from the round files alone, each held to its SHA-256; a round file changed is refused", async () => {
      const root = path.join(temp("root"), "COPY-H");
      const rounds = [
        {
          round: 1,
          tries: [tryOf("r1-0"), tryOf("r1-1")],
          figures: [figures({ money: 2 }), figures({ nTraders: 99 })],
        },
        { round: 2, tries: [tryOf("r2-0")], figures: [figures({ money: 3 })] },
      ];
      const bytes = rounds.map(
        (r) =>
          `${JSON.stringify({ identity: { made: "up" }, ...r, triesSha256: "0".repeat(64) } satisfies RoundFile)}\n`,
      );
      bytes.forEach((b, k) => {
        mkdirSync(path.dirname(roundFile(root, k + 1)), { recursive: true });
        writeFileSync(roundFile(root, k + 1), b);
      });
      const p = phaseOf(
        "choice.js",
        "choicePart",
        { code: "made-up", rounds: bytes.map(sha256) },
        { root },
      );
      const record = await runPhase(p);
      expect(
        ChoiceOf.parse(
          JSON.parse(partBytes(p.dir, record, "part").toString("utf8")),
        ),
      ).toEqual({
        rounds: [
          { round: 1, sha256: sha256(bytes[0]!) },
          { round: 2, sha256: sha256(bytes[1]!) },
        ],
        ...JSON.parse(JSON.stringify(chosenOf(rounds))),
      });
      writeFileSync(roundFile(root, 2), bytes[1]!.replace("r2-0", "r2-9"));
      await expect(
        runPhase(
          phaseOf(
            "choice.js",
            "choicePart",
            { code: "made-up", rounds: bytes.map(sha256) },
            { root },
          ),
        ),
      ).rejects.toThrow(StoreError);
    });
  },
);
