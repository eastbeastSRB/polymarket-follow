/**
 * The label bound's check (src/copyh/phase-check.ts LABELCHECK and
 * LABELCHECK-L; rules.md C15 (c) 7, RL4), through real child processes on
 * a made-up store whose window passes 90 days (the supervisor's ruling on
 * COPYH-ENGINE-10's question 2, 2026-11-27): the phases' world with L, a
 * taker whose BTC position opened 100 days before M2 closes inside the 14
 * days, beside three seconds-long and nine slow SOL round trips. C5's
 * 90-day capture misses the BTC open, so its closed cycles are the twelve
 * SOL ones, three of them fast (a share of 0.25: "unclassified — mixed");
 * the whole capture from ARCHIVE_START closes thirteen (directional, and
 * MAIN's by its habits). The part's labels are the kit's on both captures
 * read here from the store, L's difference listed with MAIN's, A's MAIN
 * under both, and the pass mark failing (1 of 2); LABELS itself leaves L
 * out of P1 there; the large lane gives the same check.
 */
import { describe, expect, it } from "vitest";
import { readBucket } from "../src/copyh/accounts.js";
import { runPhase, type PartSpec } from "../src/copyh/engine.js";
import { ARCHIVE_START } from "../src/copyh/design.js";
import { boundedCapture, labelOf } from "../src/copyh/labels.js";
import { normOf } from "../src/copyh/normalize.js";
import {
  checksOf,
  labelCheckOf,
  labelCheckParts,
  largeCheckParts,
} from "../src/copyh/phase-check.js";
import { captureStart } from "../src/copyh/phase-labels.js";
import { loadResearch } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import { KINDS } from "./copyh-engine-world.js";
import { addr, trade } from "./copyh-world.js";
import {
  A,
  M2,
  X,
  at,
  engineDir,
  labelsRun,
  p1Of,
  phaseOf,
  phaseWorld,
} from "./copyh-phase-world.js";

const kit = await loadResearch();
const L = addr(0xf01);
/** L's orders, [instant, coin, side, size, position before]: the BTC cycle from 100 days before M2 to 3 days before it, and twelve SOL round trips a day from day −13, the second, sixth and tenth closed after 30 s, the others after 7 h, each of its own size. */
const L_ORDERS: [number, string, "B" | "A", string, string][] = [
  [M2 - 100 * DAY_MS + 10 * HOUR_MS, "BTC", "B", "1", "0.0"],
  [at(-3, 15), "BTC", "A", "1", "1.0"],
];
for (let k = 0; k < 12; k++) {
  const open = at(-13 + k, 10);
  const sz = (1 + k / 10).toFixed(1);
  L_ORDERS.push(
    [open, "SOL", "B", sz, "0.0"],
    [open + (k % 4 === 1 ? 30_000 : 7 * HOUR_MS), "SOL", "A", sz, sz],
  );
}
const extra: [number, string][] = [];
let tid = 50_000;
for (const [time, coin, side, sz, startPosition] of L_ORDERS)
  for (const r of trade(L, X, {
    coin,
    side,
    sz,
    time,
    tid: (tid += 1),
    startPosition,
    oid: tid,
  }))
    extra.push([time, r]);
const world = await phaseWorld(extra, M2 - 105 * DAY_MS);

/** L's label at M2 on C5's 90-day capture and on the whole capture from ARCHIVE_START, the kit's, read here from the store. */
function labelsOfL() {
  const view = readBucket(
    [world.store],
    1,
    { from: ARCHIVE_START, to: M2 },
    KINDS,
  ).find((v) => v.addr === L)!;
  return {
    days90: labelOf(
      kit,
      boundedCapture(normOf(view.rows(captureStart(M2), M2)), M2),
      M2,
      1e9,
    ),
    whole: labelOf(
      kit,
      {
        fills: normOf(view.rows(ARCHIVE_START, M2)),
        pages: 0,
        truncated: true,
        oldest: ARCHIVE_START,
      },
      M2,
      1e9,
    ),
  };
}

/** A check phase on bucket 01 at M2 in `engine`, its parts read back. */
async function checked(engine: string, name: string, parts: PartSpec[]) {
  const fn = name === "LABELCHECK" ? "labelCheckPart" : "labelCheckLargePart";
  const p = phaseOf(engine, name, "phase-check.js", fn, parts, world.context);
  return checksOf(p.dir, await runPhase(p));
}
const specOf = (lane: number | null) =>
  labelCheckParts(
    { ...world.reading, code: "made-up", fillsMax: 1e9, lane },
    [1],
    [M2],
  );

describe("the label bound's check where the bound binds (C15 (c) 7)", () => {
  const labels = labelsOfL();
  const differ: [string, string, string, boolean, boolean] = [
    L,
    labels.days90,
    labels.whole,
    false,
    true,
  ];

  it("reads a label that the 90-day bound changes: the BTC open lies before C5's capture, mixed on it and directional on the whole capture", () => {
    expect(captureStart(M2)).toBe(M2 - 90 * DAY_MS);
    expect(L_ORDERS[0]![0]).toBeLessThan(captureStart(M2));
    expect(L_ORDERS[0]![0]).toBeGreaterThan(ARCHIVE_START);
    expect(labels).toEqual({
      days90: "unclassified — mixed",
      whole: "directional",
    });
  });

  it(
    "lists L's difference with MAIN's under each capture, A MAIN's under both, and fails the pass mark at 1 of 2; LABELS leaves L out of P1",
    { timeout: 120_000 },
    async () => {
      const engine = engineDir();
      const parts = await checked(engine, "LABELCHECK", specOf(null));
      // Bucket 01's accounts but V, the vault: A MAIN's, B the maker, C silent in the 14 days, L.
      expect(parts).toEqual([
        {
          mondays: [
            {
              M: M2,
              checked: 4,
              main90: 1,
              mainWhole: 2,
              differ: [differ],
              apart: [],
              deferred: [],
            },
          ],
        },
      ]);
      expect(labelCheckOf(parts, [M2], 0.01)).toEqual({
        passMark: 0.01,
        mondays: [
          {
            M: new Date(M2).toISOString(),
            checked: 4,
            main90: 1,
            mainWhole: 2,
            mainDiffer: 1,
            labelDiffer: 1,
            differ: [differ],
            apart: [],
            pass: false,
          },
        ],
        pass: false,
      });
      const p1 = p1Of((await labelsRun(world, engine)).labels).get(M2)!;
      expect([p1.has(A), p1.has(L)]).toEqual([true, false]);
    },
  );

  it(
    "gives the same check through its large lane: the threshold at 0, every account with a fill in the 14 days deferred to LABELCHECK-L",
    { timeout: 120_000 },
    async () => {
      const engine = engineDir();
      const spec = specOf(0);
      const normal = await checked(engine, "LABELCHECK", spec);
      expect(normal[0]!.mondays[0]!.deferred.map(([a]) => a)).toEqual([
        A,
        addr(0xb01),
        L,
      ]);
      const large = await checked(
        engine,
        "LABELCHECK-L",
        largeCheckParts(spec, normal),
      );
      expect(labelCheckOf([...normal, ...large], [M2], 0.01)).toEqual(
        labelCheckOf(
          await checked(engineDir(), "LABELCHECK", specOf(null)),
          [M2],
          0.01,
        ),
      );
    },
  );
});
