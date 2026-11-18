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
import { C, E, inPart } from "../src/polish/tries/parts.js";
import { entriesAt, ruleOf, tryNamed } from "../src/polish/tries/rules.js";
import { C_FLOORS, E_FLOORS, statOf } from "../src/polish/tries/stats.js";
import {
  CFile,
  C_DAYS,
  ChoiceFile,
  EFile,
  besideOf,
  cOf,
  choiceOf,
  eOf,
  type Expected,
} from "../src/polish/tries/steps.js";
import { Line } from "../src/polish/tries/beside.js";
import { TRIES, keeps } from "../src/polish/tries/trylog.js";
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
  const features = featuresOf(x, {
    entries,
    slices,
    all,
    delay: ENTRY_DELAY_MS,
  });
  const cuts = JSON.parse(JSON.stringify(cutsOf(x, features))) as Parameters<
    typeof eOf
  >[1]["cuts"];
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
  return { entries, features, cuts, expect, ref };
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
      // k = SE_V ÷ SE_B0 on E.
      expect(byName.get("S1")!.test!.k).toBeCloseTo(
        byName.get("S1")!.stat!.se! / out.b0.stat!.se!,
        12,
      );
      // The E floors, not C's: D0's mean lies between C's +25 and E's +50.
      const d0 = byName.get("D0")!;
      expect(d0.stat!.mean).toBeGreaterThan(C_FLOORS.mean);
      expect(d0.stat!.mean).toBeLessThan(E_FLOORS.mean);
      expect(d0.floors.mean).toBe(false);
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

    it("the choice: S1 and R4 adopted, the larger t first; N, B0 with both, placed and priced on E as H9 written out, its k for C; without the edge N is B0 and nothing is priced", async () => {
      const i = inputsOf(w);
      const { out } = await run(w, i, 20);
      const e = EFile.parse(JSON.parse(JSON.stringify(out)));
      const c = await choiceOf(w, {
        M: 1,
        cuts: i.cuts,
        e,
        pace: () => Promise.resolve(),
      });
      expect(c.adopted.map((a) => a.name)).toEqual(["S1", "R4"]);
      expect(c.rule).toEqual(ruleOf("N", [tryNamed("S1"), tryNamed("R4")]));
      // N's positions: B0's E entries of forced sells whose 7-day range is below R4's E median.
      const r4 = TRIES.find((t) => t.name === "R4")!;
      const kept = i.ref.filter(
        (r, k) =>
          r.e.fill.side === -1 &&
          keeps(r4, i.features.get("R4")![k]!, i.cuts.R4.value) === true,
      );
      expect(c.N).toMatchObject({
        positions: kept.length,
        priced: kept.length,
        unpriced: {},
      });
      expect(c.N!.stat!.mean).toBeCloseTo(
        mean(kept.map((r) => r.net)) - out.calibration.rebasedBy,
        9,
      );
      expect(c.N!.k).toBeCloseTo(c.N!.stat!.se! / out.b0.stat!.se!, 12);
      expect(c.lines).toHaveLength(kept.length);
      const f = inputsOf(flat);
      const none = await run(flat, f, 5);
      expect(
        await choiceOf(flat, {
          M: 1,
          cuts: f.cuts,
          e: EFile.parse(JSON.parse(JSON.stringify(none.out))),
          pace: () => Promise.reject(new Error("nothing is priced")),
        }),
      ).toMatchObject({
        adopted: [],
        rule: { name: "B0" },
        N: null,
        lines: [],
      });
    });

    it("the check: B0 on C first; N evaluated, passing with every F2 floor and the footprint, goes to FRESH alone; N failing, S1 (the larger t) next; without the edge B0 goes, nothing evaluated", async () => {
      const i = inputsOf(w);
      const { out } = await run(w, i, 20);
      const e = EFile.parse(JSON.parse(JSON.stringify(out)));
      const pace = () => Promise.resolve();
      const ch = await choiceOf(w, { M: 1, cuts: i.cuts, e, pace });
      const choice = ChoiceFile.parse(JSON.parse(JSON.stringify(ch)));
      const r = await cOf(w, { M: 1, cuts: i.cuts, e, choice, pace });
      const { slices, all } = entriesAt(w, 1);
      const onC = all.filter((x) => inPart(C, x.fill.t));
      const ref = onC.map((x) =>
        netOf(
          w,
          x.fill.iid,
          x.fill.side === 1 ? -1 : 1,
          x.fill.t + ENTRY_DELAY_MS,
        ),
      );
      const b = out.calibration.rebasedBy;
      expect(r.out.b0).toMatchObject({
        positions: onC.length,
        priced: onC.length,
      });
      expect(r.out.b0.stat!.mean).toBeCloseTo(mean(ref) - b, 9);
      // N on C: C's forced sells whose 7-day range is below R4's E cut.
      const f = featuresOf(w, {
        entries: onC,
        slices,
        all,
        delay: ENTRY_DELAY_MS,
      });
      const r4 = TRIES.find((t) => t.name === "R4")!;
      const kept = ref.filter(
        (_, k) =>
          onC[k]!.fill.side === -1 &&
          keeps(r4, f.get("R4")![k]!, i.cuts.R4.value) === true,
      );
      expect(r.out.goes).toBe("N");
      expect(r.out.rule).toEqual(ch.rule);
      expect(r.out.evaluations).toHaveLength(1);
      expect(r.out.evaluations[0]).toMatchObject({
        rule: "N",
        positions: kept.length,
        floors: { mean: true, days: true, coins: true, footprint: true },
      });
      const n = r.out.evaluations[0] as unknown as {
        t: number;
        stat: { mean: number };
        test: { k: number };
      };
      expect(n.t).toBeGreaterThan(1);
      expect(n.test.k).toBe(ch.N!.k);
      expect(n.stat.mean).toBeCloseTo(mean(kept) - b, 9);
      // N made to fail (W5 is unknown everywhere): the adopted change with the larger t, S1, is next, and goes.
      const failing = ChoiceFile.parse({
        ...choice,
        rule: ruleOf("N", [tryNamed("S1"), tryNamed("R4"), tryNamed("W5")]),
      });
      const s = await cOf(w, { M: 1, cuts: i.cuts, e, choice: failing, pace });
      expect(
        s.out.evaluations.map((x) => [x.rule, x.floors.footprint]),
      ).toEqual([
        ["N", false],
        ["S1", true],
      ]);
      expect(s.out.goes).toBe("S1");
      expect(s.out.rule).toEqual(ruleOf("S1", [tryNamed("S1")]));
      // A change's k on C is its E k: SE_S1 ÷ SE_B0, both on E.
      expect(
        (s.out.evaluations[1] as unknown as { test: { k: number } }).test.k,
      ).toBeCloseTo(
        e.tries.find((x) => x.name === "S1")!.stat!.se! / e.b0.stat!.se!,
        12,
      );
      // C's floors, not E's: a rule whose C mean lies between +25 and +50 keeps the mean floor; C has 146 entry days.
      const mid = await cOf(w, {
        M: 1,
        cuts: i.cuts,
        e,
        choice: ChoiceFile.parse({
          ...choice,
          rule: ruleOf("N", [tryNamed("D0")]),
        }),
        pace,
      });
      const m0 = mid.out.evaluations[0] as unknown as {
        stat: { mean: number };
        floors: { mean: boolean };
      };
      expect(m0.stat.mean).toBeGreaterThan(C_FLOORS.mean);
      expect(m0.stat.mean).toBeLessThan(E_FLOORS.mean);
      expect(m0.floors.mean).toBe(true);
      expect(C_DAYS).toBe(146);
      // Without the edge: nothing adopted, B0 goes, no evaluation.
      const fl = inputsOf(flat);
      const none = await run(flat, fl, 5);
      const ne = EFile.parse(JSON.parse(JSON.stringify(none.out)));
      const nc = await choiceOf(flat, { M: 1, cuts: fl.cuts, e: ne, pace });
      const z = await cOf(flat, {
        M: 1,
        cuts: fl.cuts,
        e: ne,
        choice: ChoiceFile.parse(JSON.parse(JSON.stringify(nc))),
        pace,
      });
      expect(z.out).toMatchObject({
        goes: "B0",
        evaluations: [],
        rule: { name: "B0" },
      });
    });

    it("the prints beside: 6.1's lines, K, the book footprint, the placebo and the exam's z, the projection, the signal meter, from the steps' positions", async () => {
      const i = inputsOf(w);
      const { out, lines: eLines } = await run(w, i, 20);
      const e = EFile.parse(JSON.parse(JSON.stringify(out)));
      const pace = () => Promise.resolve();
      const ch = await choiceOf(w, { M: 1, cuts: i.cuts, e, pace });
      const choice = ChoiceFile.parse(JSON.parse(JSON.stringify(ch)));
      const r = await cOf(w, { M: 1, cuts: i.cuts, e, choice, pace });
      const parse = (ls: readonly string[]) =>
        ls.map((l) => Line.parse(JSON.parse(l)));
      const c = CFile.parse(
        JSON.parse(JSON.stringify({ inputs: { choice: "x" }, ...r.out })),
      );
      const lines = {
        e: parse(eLines),
        choice: parse(ch.lines),
        c: parse(r.lines),
      };
      const o = {
        M: 1,
        cuts: i.cuts,
        e,
        c,
        lines,
        book: new Map<string, number>(),
        seed: 5,
        draws: 300,
      };
      const p = besideOf(w, o);
      const n = r.out.evaluations[0] as unknown as {
        stat: { mean: number; se: number };
        positions: number;
      };
      expect(p.goes).toBe("N");
      // The rule's C line is the C evaluation's; one position an episode here, and OWN for every one.
      expect(p.lines.rule.C.all!.mean).toBeCloseTo(n.stat.mean, 12);
      expect(p.lines.rule.C.eventLevel!.n).toBe(n.positions);
      expect(p.lines.rule.C.own!.n).toBe(n.positions);
      expect(Object.keys(p.lines.rule.C.sides)).toEqual(["forced sells"]);
      expect(Object.keys(p.lines.rule.C.months)).toEqual([
        "2026-01",
        "2026-02",
        "2026-03",
        "2026-04",
        "2026-05",
      ]);
      expect(p.lines.b0.E.all!.n).toBe(i.entries.length);
      // M = 1: K is 1; each position needs its two legs' hour files, none within 10 s of an hour's start.
      const rule = [...lines.choice, ...lines.c.filter((l) => l.group === "N")];
      expect(p.K).toMatchObject({ K: 1, at: [{ K: 1, n: rule.length }] });
      expect(p.footprint.files).toBe(2 * rule.length);
      // The placebo: seeded, so the same twice; its z the exam's floor or above.
      const window = p.placebo.rule["100 days"]!;
      expect(window.draws).toBe(300);
      expect(window.student).toBe(kit.stats.tCritical(0.005, 99));
      expect(p.examZ).toBe(Math.max(2.81, window.p9975!));
      expect(besideOf(w, o).placebo).toEqual(p.placebo);
      expect(p.projection.fromC).toMatchObject({
        mProj: n.stat.mean - n.stat.se,
        beside: n.stat.mean,
      });
      const ts = out.tries
        .filter((t) => t.adoptable && t.t !== null)
        .map((t) => t.t!);
      expect(p.signal.meanSquare).toBeCloseTo(
        ts.reduce((s, t) => s + t * t, 0) / ts.length,
        9,
      );
      expect(p.calibrationOnC).toMatchObject({ positions: 0, stat: null });
      // The placebo flips: t* about 0, not the edge's t; B2's no-wave episodes (every first fill here is alone).
      expect(window.above258).toBeLessThan(0.2);
      expect(window.errors.q1!).toBeLessThan(window.errors.q3!);
      expect(p.placebo.b2["100 days"]!.draws).toBe(300);
      // The projection from E and C pooled, less b.
      const pooled = statOf(
        kit,
        rule.flatMap((l) =>
          l.net === null
            ? []
            : [{ t: l.t, iid: l.iid, x: l.net - e.calibration.rebasedBy }],
        ),
      )!;
      expect(p.projection.pooled!.mProj).toBeCloseTo(
        pooled.mean - pooled.se!,
        9,
      );
      // B2 on M's slices: at M = 2 every account here is in slice 0, so B2 is M = 1's.
      expect(besideOf(w, { ...o, M: 2 }).placebo.b2).toEqual(p.placebo.b2);
      // W2 going: K up to 2M; B0 going: its projection is m_C itself.
      expect(
        besideOf(w, {
          ...o,
          c: { ...c, rule: { ...c.rule, M2: true } },
        }).K.at.map((x) => x.K),
      ).toEqual([1, 2]);
      expect(
        besideOf(w, { ...o, c: { ...c, goes: "B0" } }).projection.fromC,
      ).toMatchObject({
        mProj: c.b0.stat!.mean,
        beside: c.b0.stat!.mean - c.b0.stat!.se!,
      });
    });
  },
);
