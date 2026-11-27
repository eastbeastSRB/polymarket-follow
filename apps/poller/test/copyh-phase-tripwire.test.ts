/**
 * The tripwire's phase (src/copyh/phase-tripwire.ts, phase-coin.ts;
 * rules.md C16, C9), through real child processes on the phases' made-up
 * world after LABELS and BUILD: a coin's projection of MAIN's copies voted
 * by END under both settlement rules, each equal to tripwire.ts's on the
 * plan and the coin's marks written out here, a settlement unmarked under
 * the 5-minute rule and marked under the 60-minute one, the hours without
 * a row counted; the lanes changing nothing (the copy from BUILD-L); the
 * set MAIN's copies voted by END alone, each leg at t + D + h; each try's
 * set beside it (C16 at step 2): its line's copies voted by END with t in
 * its window, 1 ms either side, every condition met but those on the prior
 * mean net, which the projection leaves out; the coin's reading:
 * its funding list held to the part's, each window held to its line, a
 * window starting at END never opened, rows at or after END dropped,
 * another coin's windows not read; a coin the reading holds no bars of
 * giving each copy "no mark at the follow instant", as PRICES will.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { runPhase } from "../src/copyh/engine.js";
import { coinOf } from "../src/copyh/markets.js";
import {
  buildLargeParts,
  buildParts,
  coinCopies,
  coinsOf,
  factsOf,
} from "../src/copyh/phase-build.js";
import { coinReadingOf } from "../src/copyh/phase-coin.js";
import {
  coinProjection,
  plannedOf,
  readsPrice,
  triedOf,
  tripwireOf,
  tripwireParts,
  type TrySet,
} from "../src/copyh/phase-tripwire.js";
import { StoreError, sha256 } from "../src/copyh/run.js";
import { coinMarksOf, projectionOf } from "../src/copyh/tripwire.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import { COINS } from "./copyh-world.js";
import {
  END,
  M1,
  M2,
  SEAL,
  START,
  at,
  engineDir,
  fundingWorld,
  labelsRun,
  phaseOf,
  phaseWorld,
} from "./copyh-phase-world.js";

const world = await phaseWorld();
const SOL = 2;
const recordSha = (dir: string) =>
  sha256(readFileSync(path.join(dir, "record.json")));

/** The hours [from, to). */
function hoursOf(from: number, to: number): number[] {
  const out: number[] = [];
  for (let h = from; h < to; h += HOUR_MS) out.push(h);
  return out;
}
/** SOL's last row before END: the first hour of A's hold from at(1, 10) + D to at(2, 9) + D, A's trade 60 minutes before it and none in the 6. */
const LAST_ROW = at(1, 11);
/** Each hour's row, a few ms late. */
const rowsOf = (hours: readonly number[]) =>
  hours.map((h, k): [number, string] => [
    h + 3 + (k % 97),
    (((k % 5) - 2) * 1e-5).toFixed(6),
  ]);
/** SOL's two windows (the second's rows stop at LAST_ROW and come again a week past END), a third starting at END listed and never written, and ETH's. */
const F = fundingWorld([
  { coin: "SOL", start: START, rows: rowsOf(hoursOf(START, M2)) },
  {
    coin: "SOL",
    start: M2,
    rows: rowsOf([
      ...hoursOf(M2, LAST_ROW + HOUR_MS),
      ...hoursOf(END, END + 7 * DAY_MS),
    ]),
  },
  { coin: "SOL", start: END, rows: [], absent: true },
  { coin: "ETH", start: START, rows: rowsOf(hoursOf(START, END)) },
]);
const SOL_HOURS = hoursOf(START, LAST_ROW + HOUR_MS);

/** LABELS and BUILD on bucket 01, then TRIPWIRE's parts on the coins BUILD holds. */
async function tripwireRun(
  o: { funding?: string; lane?: number | null; tries?: TrySet[] } = {},
) {
  const engine = engineDir();
  const l = await labelsRun(world, engine);
  const parts = buildParts({
    ...world.reading,
    code: "made-up",
    end: END,
    stage: [M1, END],
    mondays: [M1, M2],
    labels: [recordSha(l.dirs.labels), null],
    limits: { fills: 1e9, exits: 1e9 },
    lane: o.lane ?? null,
  }).filter((p) => p.id === "b001");
  const build = phaseOf(engine, "BUILD", "phase-build.js", "buildPart", parts, {
    ...world.context,
    labels: l.dirs.labels,
    large: l.dirs.large,
  });
  const buildRecord = await runPhase(build);
  const large = buildLargeParts(
    parts,
    new Map([["b001", factsOf(build.dir, buildRecord, "b001")]]),
  );
  const L = phaseOf(engine, "BUILD-L", "phase-build.js", "buildPart", large, {
    ...world.context,
    labels: l.dirs.labels,
    large: l.dirs.large,
  });
  const largeRecord = large.length === 0 ? null : await runPhase(L);
  const coins = [
    ...new Set([
      ...coinsOf(build.dir, buildRecord),
      ...(largeRecord === null ? [] : coinsOf(L.dir, largeRecord)),
    ]),
  ].sort((a, b) => a - b);
  const tw = phaseOf(
    engine,
    "TRIPWIRE",
    "phase-tripwire.js",
    "tripwirePart",
    tripwireParts(
      {
        ...world.reading,
        code: "made-up",
        build: [
          recordSha(build.dir),
          largeRecord === null ? null : recordSha(L.dir),
        ],
        end: END,
        funding: o.funding ?? F.sha256,
        tries: o.tries ?? [],
      },
      coins.map((iid) => [iid, COINS[iid]!] as const),
    ),
    {
      ...world.context,
      roots: [...world.context.roots, F.root],
      build: build.dir,
      large: L.dir,
      fundingStore: F.store,
      fundingList: F.list,
    },
  );
  return { build, buildRecord, coins, tw };
}
const run = await tripwireRun();

describe("the tripwire's phase (C16)", { timeout: 60_000 }, () => {
  it("projects the coin's MAIN copies voted by END under both rules, each equal to tripwire.ts's on the plan and marks written out here", async () => {
    expect(run.coins).toEqual([SOL]);
    const record = await runPhase(run.tw);
    const [c] = coinCopies(run.build.dir, run.buildRecord, SOL);
    const tIn = c!.t + c!.D;
    const planned = [
      {
        iid: SOL,
        tIn,
        legs: c!.plan.legs.map((l) => tIn + l.h),
        settled: c!.plan.settled,
        gap: c!.gap,
      },
    ];
    expect(planned[0]!.legs).toEqual([at(2, 9) + c!.D]);
    const coin = coinOf([world.store], SOL, END)!;
    for (const mm of [5, 60] as const)
      expect(tripwireOf(run.tw.dir, record, mm)).toEqual(
        projectionOf(planned, () => coinMarksOf(coin, SOL_HOURS, mm))
          .projection,
      );
    // LAST_ROW's settlement has no trade in its 6 minutes and A's entry in its 61; the 22 hours after it have no row.
    expect(tripwireOf(run.tw.dir, record, 5)).toMatchObject({
      copies: 1,
      unpriced: { "a funding settlement without a mark": 1 },
      share: 1,
      missingHours: 22,
      copiesMissing: 1,
    });
    expect(tripwireOf(run.tw.dir, record, 60)).toMatchObject({
      copies: 1,
      share: 0,
      missingHours: 22,
    });
  });

  it("changes nothing by its lanes: the account deferred at a threshold of 0, its copy read from BUILD-L", async () => {
    const lanes = await tripwireRun({ lane: 0 });
    expect(coinCopies(lanes.build.dir, lanes.buildRecord, SOL)).toEqual([]);
    const a = await runPhase(run.tw);
    const b = await runPhase(lanes.tw);
    for (const mm of [5, 60] as const)
      expect(tripwireOf(lanes.tw.dir, b, mm)).toEqual(
        tripwireOf(run.tw.dir, a, mm),
      );
  });

  it("projects MAIN's copies voted by END alone, each leg at t + D + h", () => {
    const [c] = coinCopies(run.build.dir, run.buildRecord, SOL);
    const want = {
      iid: SOL,
      tIn: c!.t + c!.D,
      legs: c!.plan.legs.map((l) => c!.t + c!.D + l.h),
      settled: c!.plan.settled,
      gap: c!.gap,
    };
    expect(
      plannedOf([
        c!,
        { ...c!, voted: false },
        { ...c!, lines: ["BROAD", "DAY"] },
      ]),
    ).toEqual([want]);
  });

  it("takes a try's set by its line, the vote, t in its window [from, to) and its conditions, but those on the prior mean net", () => {
    const [c] = coinCopies(run.build.dir, run.buildRecord, SOL);
    const want = plannedOf([c!]);
    expect(want).toHaveLength(1);
    const set = (o: Partial<TrySet> = {}): TrySet => ({
      name: "made-up",
      line: "MAIN",
      from: c!.t,
      to: c!.t + 1,
      conditions: [],
      ...o,
    });
    expect(triedOf([c!], set())).toEqual(want);
    expect(triedOf([c!], set({ from: c!.t + 1, to: c!.t + 2 }))).toEqual([]);
    expect(triedOf([c!], set({ from: c!.t - 1, to: c!.t }))).toEqual([]);
    expect(triedOf([{ ...c!, voted: false }], set())).toEqual([]);
    const broad = { ...c!, lines: ["BROAD" as const, "DAY" as const] };
    expect(triedOf([broad], set())).toEqual([]);
    expect(triedOf([broad], set({ line: "BROAD" }))).toEqual(want);
    const n = c!.covariates.closedCycles;
    const cycles = (op: ">=" | ">", value: number) =>
      set({ conditions: [{ covariate: "closedCycles", op, value }] });
    expect(triedOf([c!], cycles(">=", n))).toEqual(want);
    expect(triedOf([c!], cycles(">", n))).toEqual([]);
    // The prior mean net's conditions are left out of the projection, whatever they say.
    const prior = {
      covariate: "priorMeanNetBps",
      op: ">",
      value: 1e9,
    } as const;
    expect(triedOf([c!], set({ conditions: [prior] }))).toEqual(want);
    expect(readsPrice(prior)).toBe(true);
    expect(
      [
        "closedCycles",
        "medianHoldHours",
        "longShare",
        "entries",
        "coin",
        "sizeUsd",
        "priorCopies",
      ].some((covariate) =>
        readsPrice({ covariate, op: ">", value: 0 } as never),
      ),
    ).toBe(false);
  });

  it("projects each try's set beside MAIN's, under both rules, a set of none counting none", async () => {
    const [c] = coinCopies(run.build.dir, run.buildRecord, SOL);
    const sets: TrySet[] = [
      {
        name: "BROAD at t",
        line: "BROAD",
        from: c!.t,
        to: c!.t + 1,
        conditions: [],
      },
      {
        name: "after t",
        line: "MAIN",
        from: c!.t + 1,
        to: END,
        conditions: [],
      },
      {
        name: "a prior mean net, left out",
        line: "MAIN",
        from: M1,
        to: END,
        conditions: [{ covariate: "priorMeanNetBps", op: ">", value: 1e9 }],
      },
    ];
    const tried = await tripwireRun({ tries: sets });
    const record = await runPhase(tried.tw);
    for (const mm of [5, 60] as const) {
      const main = tripwireOf(tried.tw.dir, record, mm);
      expect(main.copies).toBe(1);
      expect(tripwireOf(tried.tw.dir, record, mm, 0)).toEqual(main);
      expect(tripwireOf(tried.tw.dir, record, mm, 1)).toMatchObject({
        copies: 0,
        share: 0,
        settled: 0,
        gap: 0,
      });
      expect(tripwireOf(tried.tw.dir, record, mm, 2)).toEqual(main);
    }
    expect(tripwireOf(tried.tw.dir, record, 5)).toMatchObject({ share: 1 });
    expect(() => tripwireOf(tried.tw.dir, record, 5, 3)).toThrow(/no try at 3/);
  });

  it("refuses a funding list other than its part's", async () => {
    const other = await tripwireRun({ funding: "0".repeat(64) });
    await expect(runPhase(other.tw)).rejects.toThrow(StoreError);
  });
});

describe("a coin's reading (C9)", () => {
  const context = {
    ...world.context,
    roots: [...world.context.roots, F.root],
    build: "",
    large: "",
    fundingStore: F.store,
    fundingList: F.list,
  };
  const inputs = {
    ...world.reading,
    code: "made-up",
    build: ["0".repeat(64), null] as [string, null],
    iid: SOL,
    coin: "SOL",
    end: END,
    funding: F.sha256,
  };

  it("reads its windows that start before END, held to the list, dropping rows at or after END and another coin's windows", () => {
    const { coin, rows } = coinReadingOf(context, inputs, SEAL);
    expect(coin!.name).toBe("SOL");
    expect(rows.every((r) => r.coin === "SOL" && r.time < END)).toBe(true);
    expect(rows.map((r) => r.hour)).toEqual(SOL_HOURS);
  });

  it("refuses a list other than its part's and a window changed after its list", () => {
    expect(() =>
      coinReadingOf(context, { ...inputs, funding: "0".repeat(64) }, SEAL),
    ).toThrow(StoreError);
    const file = path.join(
      F.store,
      "info",
      "fundingHistory",
      "SOL",
      `${M2}.json`,
    );
    const bytes = readFileSync(file);
    writeFileSync(file, Buffer.concat([bytes, Buffer.from(" ")]));
    try {
      expect(() => coinReadingOf(context, inputs, SEAL)).toThrow(
        "not its line in the funding list",
      );
    } finally {
      writeFileSync(file, bytes);
    }
  });

  it("gives each copy of a coin without bars 'no mark at the follow instant', as PRICES will", () => {
    const planned = plannedOf(coinCopies(run.build.dir, run.buildRecord, SOL));
    const by = coinProjection(planned, null, SOL_HOURS, SOL, END);
    for (const mm of ["5", "60"] as const)
      expect(by[mm]).toMatchObject({
        copies: 1,
        unpriced: {
          "no mark at the follow instant": 1,
          "no mark at an exit instant": 0,
          "a funding settlement without a mark": 0,
        },
        share: 1,
      });
  });
});
