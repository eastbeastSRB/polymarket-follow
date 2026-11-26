/**
 * The removal phase (src/copyh/phase-removal.ts; rules.md C10), through real
 * child processes on the phases' made-up world, after LABELS and BUILD: a
 * coin's tables by Monday and line, each its members' keys through the
 * kit's own removalOf, equal to judge.ts's removal of the P1 account's market
 * trades in M2's week computed here; no table for a line it is not in; the
 * BUILD parts read a coin's line at a time, each held to its record (a part
 * changed after its record refused); a BUILD record other than the part's
 * refused; the lanes changing no table (every account through BUILD-L).
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { readBucket } from "../src/copyh/accounts.js";
import { runPhase } from "../src/copyh/engine.js";
import { memberRecords, removalsOf } from "../src/copyh/judge.js";
import {
  buildLargeParts,
  buildParts,
  coinKeys,
  coinsOf,
  factsOf,
} from "../src/copyh/phase-build.js";
import { removalParts, removalTablesOf } from "../src/copyh/phase-removal.js";
import { StoreError, sha256 } from "../src/copyh/run.js";
import { loadResearch } from "../src/paper/research.js";
import { MINUTE_MS } from "../src/schedule.js";
import { KINDS } from "./copyh-engine-world.js";
import {
  A,
  END,
  M1,
  M2,
  START,
  at,
  engineDir,
  labelsRun,
  phaseOf,
  phaseWorld,
} from "./copyh-phase-world.js";

const kit = await loadResearch();
const world = await phaseWorld();
const SOL = 2;
const recordSha = (dir: string) =>
  sha256(readFileSync(path.join(dir, "record.json")));

/** LABELS, BUILD and BUILD-L on bucket 01, then REMOVAL on the coins they hold. */
async function removalRun(
  o: { buildRecord?: string; lane?: number | null } = {},
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
  const removal = phaseOf(
    engine,
    "REMOVAL",
    "phase-removal.js",
    "removalPart",
    removalParts(
      {
        code: "made-up",
        build: [
          o.buildRecord ?? recordSha(build.dir),
          largeRecord === null ? null : recordSha(L.dir),
        ],
        mondays: [M1, M2],
      },
      coins,
    ),
    { build: build.dir, large: L.dir },
  );
  return { build, buildRecord, largeRecord, coins, removal };
}

describe("the removal phase (C10)", { timeout: 60_000 }, () => {
  it("gives each coin's tables by Monday and line, the kit's own removal of the members' market trades of the week", async () => {
    const { build, buildRecord, coins, removal } = await removalRun();
    expect(coins).toEqual([SOL]);
    expect(coinKeys(build.dir, buildRecord, SOL).length).toBe(2);
    const record = await runPhase(removal);
    const tables = removalTablesOf(removal.dir, record, SOL);
    expect([...tables.keys()]).toEqual(["1|MAIN", "1|BROAD", "1|DAY"]);
    const view = readBucket(
      [world.store],
      1,
      { from: START, to: END },
      KINDS,
    ).find((v) => v.addr === A)!;
    const own = removalsOf(kit, [
      memberRecords(view.rows(START, END), M2, END),
    ]).get(SOL)!;
    expect([...own]).toEqual([
      [Math.floor(at(1, 10) / MINUTE_MS) * MINUTE_MS, 1],
      [Math.floor(at(2, 9) / MINUTE_MS) * MINUTE_MS, 1],
    ]);
    for (const t of tables.values()) expect(t).toEqual(own);
  });

  it("refuses a BUILD part changed after its record, and a BUILD record other than its part's", async () => {
    const { build, removal } = await removalRun();
    const file = path.join(build.dir, "a", "b001.part");
    writeFileSync(file, Buffer.concat([readFileSync(file), Buffer.from(" ")]));
    await expect(runPhase(removal)).rejects.toThrow(StoreError);
    const other = await removalRun({ buildRecord: "0".repeat(64) });
    await expect(runPhase(other.removal)).rejects.toThrow(StoreError);
  });

  it("changes no table by its lanes: the account deferred at a threshold of 0, its keys read from BUILD-L", async () => {
    const normal = await removalRun();
    const lanes = await removalRun({ lane: 0 });
    expect(lanes.largeRecord).not.toBeNull();
    expect(coinKeys(lanes.build.dir, lanes.buildRecord, SOL)).toEqual([]);
    expect(lanes.coins).toEqual([SOL]);
    const tablesOf = async (r: typeof normal) =>
      removalTablesOf(r.removal.dir, await runPhase(r.removal), SOL);
    const deferred = await tablesOf(lanes);
    expect([...deferred.keys()]).toEqual(["1|MAIN", "1|BROAD", "1|DAY"]);
    expect(deferred).toEqual(await tablesOf(normal));
  });
});
