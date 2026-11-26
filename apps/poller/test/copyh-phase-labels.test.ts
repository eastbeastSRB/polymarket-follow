/**
 * The label phase (src/copyh/phase-labels.ts; rules.md C5, C2; the two
 * lanes), through real child processes on the phases' made-up world: each
 * account's label at each Monday the kit's on C5's capture, the directional
 * trader P1, an account without a fill in the 14 days "no fills in window",
 * a vault account named and never labelled; a capture above LABEL_FILLS_MAX
 * "too many fills for the kit", named with its count and never P1, one at
 * the cap not above it; the lanes changing no label and no P1 (the
 * threshold at 0, every capture through LABELS-L one at a time, against
 * none); a reading of another store refused.
 */
import { describe, expect, it } from "vitest";
import { readBucket } from "../src/copyh/accounts.js";
import { runPhase } from "../src/copyh/engine.js";
import {
  NO_FILLS,
  TOO_LARGE,
  boundedCapture,
  labelOf,
} from "../src/copyh/labels.js";
import { normOf } from "../src/copyh/normalize.js";
import {
  labelsParts,
  p1Of,
  type LabelsPart,
} from "../src/copyh/phase-labels.js";
import { StoreError } from "../src/copyh/run.js";
import { loadResearch } from "../src/paper/research.js";
import { DAY_MS } from "../src/schedule.js";
import { KINDS } from "./copyh-engine-world.js";
import {
  A,
  B,
  C,
  M1,
  M2,
  V,
  engineDir,
  labelsRun,
  phaseOf,
  phaseWorld,
} from "./copyh-phase-world.js";

const kit = await loadResearch();
const world = await phaseWorld();

/** The kit's label at M on C5's capture, computed here from the store's rows. */
function kitLabel(account: string, M: number) {
  const from = M - 90 * DAY_MS;
  const view = readBucket([world.store], 1, { from, to: M }, KINDS).find(
    (v) => v.addr === account,
  )!;
  return labelOf(kit, boundedCapture(normOf(view.rows(from, M)), M), M, 1e9);
}
const atM2 = (labels: ReadonlyMap<string, LabelsPart>) =>
  [...labels.values()][0]!.mondays.find((m) => m.M === M2)!;

describe("the label phase (C5)", { timeout: 60_000 }, () => {
  it("gives each account the kit's label at each Monday, P1 the directional one's, the vault account named and unlabelled", async () => {
    const { labels, large } = await labelsRun(world, engineDir());
    expect(large.size).toBe(0);
    const [part] = labels.values();
    expect(part!.vaults).toEqual([V]);
    for (const d of part!.mondays) {
      const want: Record<string, number> = {};
      for (const a of [A, B, C]) {
        const l = kitLabel(a, d.M);
        want[l] = (want[l] ?? 0) + 1;
      }
      expect(d.counts, new Date(d.M).toISOString()).toEqual(want);
      expect(d.tooLarge).toEqual([]);
      expect(d.deferred).toEqual([]);
    }
    expect(kitLabel(A, M2)).toBe("directional");
    expect(kitLabel(C, M2)).toBe(NO_FILLS);
    expect(p1Of(labels).get(M2)).toEqual(new Set([A]));
    expect(p1Of(labels).get(M1)).toEqual(new Set());
  });

  it("names a capture above LABEL_FILLS_MAX with its count, never P1, and one at the cap not above it", async () => {
    // A's capture at M2 holds its seven fills before M2; B's thirty.
    const d = atM2(
      (await labelsRun(world, engineDir(), { fillsMax: 8 })).labels,
    );
    expect(d.tooLarge).toEqual([[B, 30]]);
    expect(d.counts[TOO_LARGE]).toBe(1);
    const at7 = atM2(
      (await labelsRun(world, engineDir(), { fillsMax: 7 })).labels,
    );
    expect(at7.tooLarge).toEqual([[B, 30]]);
    expect(at7.p1).toEqual([A]);
    const at6 = atM2(
      (await labelsRun(world, engineDir(), { fillsMax: 6 })).labels,
    );
    expect(at6.tooLarge).toEqual([
      [A, 7],
      [B, 30],
    ]);
    expect(at6.p1).toEqual([]);
  });

  it("changes no label and no P1 by its lanes: every capture through LABELS-L at a threshold of 0", async () => {
    const normal = await labelsRun(world, engineDir());
    const lanes = await labelsRun(world, engineDir(), { lane: 0 });
    const [part] = lanes.labels.values();
    expect(
      part!.mondays.flatMap((d) => d.deferred.map(([a]) => a)).sort(),
    ).toEqual([A, A, B, B, C].sort());
    expect(p1Of(lanes.labels, lanes.large)).toEqual(p1Of(normal.labels));
    const counts = (...ls: ReadonlyMap<string, LabelsPart>[]) => {
      const out = new Map<number, Record<string, number>>();
      for (const l of ls)
        for (const p of l.values())
          for (const d of p.mondays) {
            const c = out.get(d.M) ?? {};
            for (const [k, n] of Object.entries(d.counts))
              c[k] = (c[k] ?? 0) + n;
            out.set(d.M, c);
          }
      return out;
    };
    expect(counts(lanes.labels, lanes.large)).toEqual(counts(normal.labels));
  });

  it("refuses a reading whose store is not its part's", async () => {
    const parts = labelsParts({
      code: "made-up",
      reading: { ...world.reading, stores: ["0".repeat(64)] },
      mondays: [M1, M2],
      fillsMax: 1e9,
      lane: null,
    }).filter((p) => p.id.startsWith("b001-"));
    await expect(
      runPhase(
        phaseOf(
          engineDir(),
          "LABELS",
          "phase-labels.js",
          "labelsPart",
          parts,
          world.context,
        ),
      ),
    ).rejects.toThrow(StoreError);
  });
});
