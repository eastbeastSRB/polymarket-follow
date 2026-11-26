/**
 * The build phase (src/copyh/phase-build.ts; rules.md C2, C4–C8, C10's
 * members, C11's gap; the two lanes), through real child processes on the
 * phases' made-up world, after LABELS: the one P1 account built, its copy
 * of its entry in M2's week every field as computed here by the kit,
 * lib-exits and money.ts, its entry of M1's week, where it is in no line,
 * none; its market trades' keys in M2's week with its lines' mask; an
 * account above HISTORY_FILLS_MAX named with its fills and one above
 * EXITS_MAX with its exit rows and its OPEN and FLIP events, neither built;
 * the lanes changing nothing (the threshold at 0, the account through
 * BUILD-L); an entry whose coin settles later on its day in no line,
 * counted by line; a labels record other than the part's refused; two
 * entries of one id both copies, in the kit's order, and an OPEN of size 0
 * a copy, each counted (the engine review's Q2 and Q3); the prior count on
 * a copy of 200,000 legs (no legs spread into a call).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readBucket } from "../src/copyh/accounts.js";
import { runPhase } from "../src/copyh/engine.js";
import {
  delayOf,
  entriesIn,
  exitRows,
  historyOf,
  openFlipEvents,
} from "../src/copyh/entries.js";
import { votedBy } from "../src/copyh/judge.js";
import { habitsAtMonday } from "../src/copyh/labels.js";
import { planOf } from "../src/copyh/money.js";
import { normOf } from "../src/copyh/normalize.js";
import {
  MASK,
  buildLargeParts,
  buildOf,
  buildParts,
  lastInstantOf,
  priorCopies,
} from "../src/copyh/phase-build.js";
import { StoreError, sha256 } from "../src/copyh/run.js";
import { holesOfReading, isGap } from "../src/copyh/unpriced.js";
import { loadResearch } from "../src/paper/research.js";
import { KINDS } from "./copyh-engine-world.js";
import { record, trade } from "./copyh-world.js";
import {
  A,
  END,
  M1,
  M2,
  START,
  X,
  at,
  engineDir,
  labelsRun,
  phaseOf,
  phaseWorld,
  type PhaseWorld,
} from "./copyh-phase-world.js";

const kit = await loadResearch();
const world = await phaseWorld();
const SOL = 2;
const NO_LIMITS = { fills: 1e9, exits: 1e9 };

async function buildRun(
  w: PhaseWorld,
  o: {
    limits?: { fills: number; exits: number };
    lane?: number | null;
    labelsRecord?: string;
  } = {},
) {
  const engine = engineDir();
  const l = await labelsRun(w, engine);
  const recordSha = (dir: string) =>
    sha256(readFileSync(path.join(dir, "record.json")));
  const parts = buildParts({
    ...w.reading,
    code: "made-up",
    end: END,
    stage: [M1, END],
    mondays: [M1, M2],
    labels: [o.labelsRecord ?? recordSha(l.dirs.labels), null],
    limits: o.limits ?? NO_LIMITS,
    lane: o.lane ?? null,
  }).filter((p) => p.id === "b001");
  const context = { ...w.context, labels: l.dirs.labels, large: l.dirs.large };
  const main = phaseOf(
    engine,
    "BUILD",
    "phase-build.js",
    "buildPart",
    parts,
    context,
  );
  const record = await runPhase(main);
  const built = buildOf(main.dir, record, "b001");
  const large = buildLargeParts(parts, new Map([["b001", built.facts]]));
  if (large.length === 0) return { built, large: null };
  const L = phaseOf(
    engine,
    "BUILD-L",
    "phase-build.js",
    "buildPart",
    large,
    context,
  );
  return { built, large: buildOf(L.dir, await runPhase(L), "b001") };
}

/** A's history and its entry in M2's week, computed here. */
function expected(w: PhaseWorld) {
  const view = readBucket([w.store], 1, { from: START, to: END }, KINDS).find(
    (v) => v.addr === A,
  )!;
  const fills = normOf(view.rows(START, END));
  const b = historyOf(kit, fills, NO_LIMITS);
  if (b.kind !== "built") throw new Error(b.kind);
  const h = b.history;
  const entries = entriesIn(h.groups, M1, END);
  const g = entries.find((e) => e.t === at(1, 10))!;
  const { id, D } = delayOf(kit, A, g);
  const exits = kit.exits.exitsOf(g, h.liqKeys);
  const plan = planOf({ t: g.t, D }, exits, { end: END, settlement: null });
  const habits = habitsAtMonday(kit, h, fills, M2).habits;
  return { fills, h, entries, g, id, D, exits, plan, habits };
}

describe("the build phase (C4–C8, C10, C11)", { timeout: 60_000 }, () => {
  it("builds the P1 account and gives its copy of M2's week every field the kit and money.ts give, and its keys with its lines' mask", async () => {
    const { built, large } = await buildRun(world);
    expect(large).toBeNull();
    const e = expected(world);
    // Its entry of M1's week (A is no P1 at M1) gives no copy.
    expect(e.entries.map((g) => g.t)).toEqual([at(-6, 11), at(1, 10)]);
    expect(built.facts).toEqual({
      p1: 1,
      built: 1,
      tooManyFills: [],
      tooManyExits: [],
      deferred: [],
      residues: 0,
      chainBreaks: 0,
      habitsApart: 0,
      idsTwice: 0,
      sizeZero: 0,
      otherMarkets: {},
      copies: { MAIN: 1, BROAD: 1, DAY: 1 },
      keys: 2,
      members: [[A, [[1, 13]]]],
    });
    expect([...built.coins.keys()]).toEqual([SOL]);
    // MAIN, BROAD and DAY: 1 + 4 + 8.
    expect(MASK).toEqual({ MAIN: 1, TEN: 2, BROAD: 4, DAY: 8 });
    const { copies, keys } = built.coins.get(SOL)!;
    expect(copies).toEqual([
      {
        id: e.id,
        addr: A,
        iid: SOL,
        dir: 1,
        type: "OPEN",
        t: at(1, 10),
        D: e.D,
        M: M2,
        lines: ["MAIN", "BROAD", "DAY"],
        exits: e.exits,
        plan: e.plan,
        voted: votedBy(kit, at(1, 10), END),
        gap: isGap(
          kit,
          e.h,
          e.g,
          e.plan,
          holesOfReading([world.store], END),
          END,
        ),
        covariates: {
          closedCycles: e.habits.closed,
          medianHoldHours: e.habits.medianHoldMs! / 3_600_000,
          longShare: e.habits.longShare,
          entries: e.habits.entries,
          coin: SOL,
          sizeUsd: e.g.first.notional,
          priorCopies: 0,
        },
      },
    ]);
    expect(e.habits.closed).toBe(3);
    expect(e.plan.legs.map((l) => at(1, 10) + e.D + l.h)).toEqual([
      at(2, 9) + e.D,
    ]);
    expect(keys).toEqual([
      [1, 13, at(1, 10), "8"],
      [1, 13, at(2, 9), "9"],
    ]);
  });

  it("names an account above HISTORY_FILLS_MAX with its fills, and one above EXITS_MAX with its exit rows and OPEN and FLIP events, building neither", async () => {
    const e = expected(world);
    const fills = (await buildRun(world, { limits: { fills: 8, exits: 1e9 } }))
      .built;
    expect(fills.facts).toMatchObject({
      p1: 1,
      built: 0,
      tooManyFills: [[A, 9]],
      keys: 0,
    });
    expect(fills.coins.size).toBe(0);
    const at9 = (await buildRun(world, { limits: { fills: 9, exits: 1e9 } }))
      .built;
    expect(at9.facts.built).toBe(1);
    const rows = exitRows(e.h.events);
    const exits = (
      await buildRun(world, { limits: { fills: 1e9, exits: rows - 1 } })
    ).built;
    expect(exits.facts).toMatchObject({
      built: 0,
      tooManyExits: [[A, rows, openFlipEvents(e.h.events, [M2])]],
    });
    expect(openFlipEvents(e.h.events, [M2])).toBe(1);
    const atRows = (
      await buildRun(world, { limits: { fills: 1e9, exits: rows } })
    ).built;
    expect(atRows.facts.built).toBe(1);
  });

  it("changes nothing by its lanes: the account deferred at a threshold of 0 and built in BUILD-L", async () => {
    const normal = await buildRun(world);
    const lanes = await buildRun(world, { lane: 0 });
    expect(lanes.built.facts).toMatchObject({
      p1: 1,
      built: 0,
      deferred: [[A, 9]],
      keys: 0,
    });
    expect(lanes.built.coins.size).toBe(0);
    expect(lanes.large!.coins).toEqual(normal.built.coins);
    expect(lanes.large!.facts).toEqual(normal.built.facts);
  });

  it("puts an entry whose coin settles later on its day in no line, counted by line", async () => {
    const settled = await phaseWorld([
      [
        at(1, 20),
        record(X, {
          coin: "SOL",
          side: "A",
          time: at(1, 20),
          dir: "Settlement",
          tid: 9_001,
          crossed: true,
        }),
      ],
    ]);
    const { built } = await buildRun(settled);
    expect(built.facts).toMatchObject({
      built: 1,
      otherMarkets: { MAIN: 1, BROAD: 1, DAY: 1 },
      copies: {},
    });
    expect(built.coins.get(SOL)!.copies).toEqual([]);
  });

  it("refuses a labels record other than its part's", async () => {
    await expect(
      buildRun(world, { labelsRecord: "0".repeat(64) }),
    ).rejects.toThrow(StoreError);
  });

  it("keeps two entries of one id as two copies in the kit's order, and counts the id and an OPEN of size 0, a copy until Q3's filter is written", async () => {
    const t0 = at(3, 10);
    const sol = (
      side: "A" | "B",
      sz: string,
      time: number,
      tid: number,
      startPosition: string,
      dir: string,
    ) =>
      trade(A, X, {
        coin: "SOL",
        side,
        sz,
        time,
        tid,
        oid: tid,
        startPosition,
        dir,
      }).map((r): [number, string] => [time, r]);
    const w = await phaseWorld([
      // An OPEN of size 0 from flat: direction 0, no exit (Q3).
      ...sol("B", "0", at(2, 20), 9_101, "0.0", "Open Long"),
      // An OPEN long, its CLOSE and an OPEN short in one millisecond: two entries of one id (Q2).
      ...sol("B", "1", t0, 9_201, "0.0", "Open Long"),
      ...sol("A", "1", t0, 9_202, "1.0", "Close Long"),
      ...sol("A", "1", t0, 9_203, "0.0", "Open Short"),
    ]);
    const { built } = await buildRun(w);
    expect(built.facts).toMatchObject({
      built: 1,
      idsTwice: 1,
      sizeZero: 1,
      copies: { MAIN: 4, BROAD: 4, DAY: 4 },
      keys: 6,
    });
    const copies = built.coins.get(SOL)!.copies;
    expect(copies.map((c) => [c.t, c.dir, c.type, c.exits.length])).toEqual([
      [at(1, 10), 1, "OPEN", 1],
      [at(2, 20), 0, "OPEN", 0],
      [t0, 1, "OPEN", 1],
      [t0, -1, "OPEN", 0],
    ]);
    expect(copies[2]!.id).toBe(copies[3]!.id);
    expect(copies[2]!.D).toBe(copies[3]!.D);
    expect(built.coins.get(SOL)!.keys.map((k) => k[3])).toEqual([
      "8",
      "9",
      "9101",
      "9201",
      "9202",
      "9203",
    ]);
  });
});

describe("C14's prior count", () => {
  it("counts the trader's MAIN copies whose follow instant and every leg lie before M, priced or not", () => {
    const D = 60_000;
    const leg = (h: number) => ({
      h,
      part: 0.5,
      kind: "REDUCE" as const,
      forced: false,
      liq: false,
    });
    /** A copy at M whose last leg lies `last` ms after its follow instant. */
    const copy = (
      t: number,
      last: number,
      M: number,
      lines: ("MAIN" | "BROAD")[],
    ) => ({
      t,
      D,
      M,
      lines,
      plan: {
        legs: [leg(1_000), leg(last)],
        flag: null,
        lastExitT: null,
        settled: false,
      },
    });
    const t = M1 + 3_600_000;
    expect(
      priorCopies([
        copy(t, 7_200_000, M1, ["MAIN", "BROAD"]),
        copy(t, 7_200_000, M1, ["BROAD"]),
        copy(t, M2 - (t + D), M1, ["MAIN"]),
        copy(t, M2 - 1 - (t + D), M1, ["MAIN"]),
        copy(M2 + 3_600_000, 7_200_000, M2, ["MAIN"]),
      ]),
    ).toEqual([0, 0, 0, 0, 2]);
  });

  it("reads a copy's latest instant by a loop: 200,000 legs, and a leg before its follow instant", () => {
    const D = 60_000;
    const t = M1 + 3_600_000;
    const leg = (h: number) => ({
      h,
      part: 1 / 200_000,
      kind: "REDUCE" as const,
      forced: false,
      liq: false,
    });
    const plan = (legs: ReturnType<typeof leg>[]) => ({
      legs,
      flag: null,
      lastExitT: null,
      settled: false,
    });
    const many = {
      t,
      D,
      M: M1,
      lines: ["MAIN" as const],
      plan: plan(Array.from({ length: 200_000 }, (_, k) => leg(k + 1))),
    };
    expect(lastInstantOf(many)).toBe(t + D + 200_000);
    expect(lastInstantOf({ t, D, plan: plan([leg(-20_001)]) })).toBe(t + D);
    expect(priorCopies([many, { ...many, t: M2 + 3_600_000, M: M2 }])).toEqual([
      0, 1,
    ]);
  });
});
