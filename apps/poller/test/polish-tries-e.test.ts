/**
 * The E step's numbers (src/polish/tries/steps.ts `eOf`) on a world in
 * memory with known answers (polish-tries-world.ts): the reproduction held
 * to WAVE-H's own EVERY SLICE line on the world's marks; B0's and S1's nets
 * equal to H9's formulas written out; the calibration's b re-basing every
 * net above +10 bps and none at +5; S1's planted edge adopted on E and
 * nothing adopted without it; a reproduction or cuts that differ stop the
 * step.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { ENTRY_DELAY_MS } from "../src/market1/price.js";
import { loadResearch, type Research } from "../src/paper/research.js";
import { GateFailed } from "../src/polish/run.js";
import { adoptedOf } from "../src/polish/tries/choice.js";
import { cutsOf, featuresOf } from "../src/polish/tries/features.js";
import { E, inPart } from "../src/polish/tries/parts.js";
import { entriesAt } from "../src/polish/tries/rules.js";
import { eOf, type Expected } from "../src/polish/tries/steps.js";
import { coinName } from "../src/waveh/coins.js";
import { DATA_END, TEST_END, TEST_START } from "../src/waveh/instants.js";
import { waveSpots } from "../src/waveh/positions.js";
import { marksLine, markAt } from "../src/waveh/report.js";
import { START, makeWorld, netOf, type World } from "./polish-tries-world.js";

let kit: Research;
let w: World;
let flat: World;
beforeAll(async () => {
  kit = await loadResearch();
  w = makeWorld(kit, true);
  flat = makeWorld(kit, false);
}, 60_000);

/** What the features step and the look give for a world: the cuts (as cuts.json holds them), the EVERY SLICE line by WAVE-H's own code. */
function inputsOf(x: World) {
  const { slices, all } = entriesAt(x, 1);
  const entries = all.filter((e) => inPart(E, e.fill.t));
  const cuts = JSON.parse(
    JSON.stringify(
      cutsOf(x, featuresOf(x, { entries, slices, all, delay: ENTRY_DELAY_MS })),
    ),
  ) as Parameters<typeof eOf>[1]["cuts"];
  const markets = new Map(
    [...x.prices].map(([iid, pc]) => [
      iid,
      kit.panel.marketFrom({
        iid,
        symbol: coinName(x.coins, iid),
        category: "crypto",
        start: START,
        end: DATA_END,
        firstTrade: null,
        retired: null,
        marks: Array.from(pc),
        klines: { minute: [], trades: [], volume: [] },
        funding: [],
      }),
    ]),
  );
  const line = marksLine(
    markAt(kit, markets),
    slices.flatMap((fills, k) =>
      waveSpots(k, fills, TEST_START, TEST_END).filter(
        (s) => s.xOut < DATA_END,
      ),
    ),
  );
  const expect: Expected = {
    everySlice: {
      positions: line.positions,
      mean: line.onMarks!.mean,
      se: line.onMarks!.se!,
    },
  };
  // H9 written out on each E entry: the reference nets.
  const ref = entries.map((e) => ({
    e,
    net: netOf(
      x,
      e.fill.iid,
      e.fill.side === 1 ? -1 : 1,
      e.fill.t + ENTRY_DELAY_MS,
    ),
  }));
  return { entries, cuts, expect, ref };
}

const mean = (xs: readonly number[]) =>
  xs.reduce((s, v) => s + v, 0) / xs.length;
const bookAt = (
  ref: { e: { fill: { t: number; iid: number } }; net: number }[],
  gap: number,
) =>
  new Map(
    ref
      .filter((r) => r.e.fill.t >= TEST_START)
      .map((r) => [`${r.e.fill.t}|${r.e.fill.iid}`, r.net - gap]),
  );
const run = (
  x: World,
  i: ReturnType<typeof inputsOf>,
  gap: number,
  more = {},
) =>
  eOf(x, {
    M: 1,
    cuts: i.cuts,
    book: bookAt(i.ref, gap),
    expect: i.expect,
    pace: () => Promise.resolve(),
    phase: () => {},
    ...more,
  });

describe(
  "the E step on a world with known answers",
  { timeout: 120_000 },
  () => {
    it("reproduces WAVE-H's EVERY SLICE line, prices B0 and S1 as H9 written out, re-bases by b above +10 bps, and adopts S1's planted edge", async () => {
      const i = inputsOf(w);
      const { out, lines } = await run(w, i, 20);
      expect(out.reproduction).toMatchObject({
        equal: true,
        positions: i.expect.everySlice.positions,
      });
      // The tape beat the book by 20 bps on slice 0's E positions in TEST: every net re-based by b.
      expect(out.calibration.positions).toBe(
        i.ref.filter((r) => r.e.fill.t >= TEST_START).length,
      );
      expect(out.calibration.rebasedBy).toBeCloseTo(20, 9);
      const b0 = mean(i.ref.map((r) => r.net));
      const s1 = mean(
        i.ref.filter((r) => r.e.fill.side === -1).map((r) => r.net),
      );
      expect(out.b0).toMatchObject({
        positions: i.entries.length,
        priced: i.entries.length,
        unpriced: {},
      });
      expect(out.b0.stat!.mean).toBeCloseTo(b0 - 20, 9);
      const byName = new Map(out.tries.map((t) => [t.name, t]));
      expect(byName.get("S1")!.stat!.mean).toBeCloseTo(s1 - 20, 9);
      expect(byName.get("S1")).toMatchObject({
        positions: i.ref.filter((r) => r.e.fill.side === -1).length,
        refused: [],
        floors: { mean: true, days: true, coins: true },
      });
      expect(byName.get("S1")!.t!).toBeGreaterThan(10);
      expect(adoptedOf(out.tries, out.gain).map((t) => t.name)).toContain("S1");
      // D0's positions are B0's entries at another delay; W2 here has B0's entries.
      expect(byName.get("D0")!.positions).toBe(i.entries.length);
      expect(byName.get("W2")!.stat!.mean).toBeCloseTo(b0 - 20, 9);
      expect(out.tries.map((t) => t.name)).toHaveLength(35);
      expect(out.x2.print).toBe("X2 STOP, printed only (F15)");
      // A line a position, B0's with its features.
      const first = JSON.parse(lines[0]!) as Record<string, unknown>;
      expect(first).toMatchObject({
        group: "B0",
        t: i.entries[0]!.fill.t,
        S1: i.entries[0]!.fill.side,
      });
      expect(lines.filter((l) => l.startsWith('{"group":"B0"'))).toHaveLength(
        i.entries.length,
      );
    });

    it("re-bases nothing when the tape beat the book by 5 bps; adopts nothing on a world without the edge", async () => {
      const i = inputsOf(w);
      const { out } = await run(w, i, 5);
      expect(out.calibration.rebasedBy).toBe(0);
      expect(out.calibration.stat!.mean).toBeCloseTo(5, 9);
      expect(out.b0.stat!.mean).toBeCloseTo(mean(i.ref.map((r) => r.net)), 9);
      const f = inputsOf(flat);
      const none = await run(flat, f, 5);
      expect(adoptedOf(none.out.tries, none.out.gain)).toEqual([]);
      expect(none.out.tries.every((t) => t.refused.length > 0)).toBe(true);
    });

    it("stops (a check failed) when B0 over TEST is not the look's line, or the features' cuts are not cuts.json's", async () => {
      const i = inputsOf(w);
      await expect(
        run(w, i, 5, {
          expect: {
            everySlice: {
              ...i.expect.everySlice,
              se: i.expect.everySlice.se! + 1e-8,
            },
          },
        }),
      ).rejects.toThrow(GateFailed);
      const cuts = {
        ...i.cuts,
        R2: { ...i.cuts.R2, value: (i.cuts.R2.value ?? 0) + 1 },
      };
      await expect(run(w, i, 5, { cuts })).rejects.toThrow(
        "the features' cuts on E are not polish/cuts.json's",
      );
    });
  },
);
