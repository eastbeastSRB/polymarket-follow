/**
 * The exam's placebo gate (src/polish/exam/placebo.ts, steps.ts, design.ts;
 * tries/beside.ts `placeboOf`'s day flips; polish/rules.md P4, P10, P16):
 * the day flips against an independent recomputation (MARKET-1's two-way
 * error, the kit's generator and quantile), the episode flips unchanged; N's
 * lines held to B0's at N's cut; the cuts recomputed by the kit's type-7
 * quantile; the lines at each K and the 715 line's cut and slices at their
 * edges; TOO FEW and the safety net over every whole-day window; z per look
 * at each boundary; the projection's arithmetic; beside.json's check to the
 * bit; the step on a synthetic trusted store, and its every refusal; the
 * built program's `exam` refusals. Run in `pnpm verify`'s order.
 */
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { beforeAll, describe, expect, it } from "vitest";
import { normalUpper, type Item } from "../src/market1/stats.js";
import { loadResearch, type Research } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import {
  EXAM_DESIGN,
  EXPLORED,
  K,
  M,
  PLACEBO,
  PLACEBO_JSON,
  RECIPE,
  SAFETY_NET,
  SEGMENTS,
  SPANS,
  TEXTBOOK,
  type ExamDesign,
  type Recipe,
} from "../src/polish/exam/design.js";
import {
  byFlip,
  checkBeside,
  checkN,
  placeboLines,
  placeboPrint,
  powerOf,
  sideCuts,
  windowShares,
  zTable,
  type ByFlip,
} from "../src/polish/exam/placebo.js";
import { placeboStep, type ExamInput } from "../src/polish/exam/steps.js";
import { GATE_NAMES } from "../src/polish/library.js";
import { GateFailed } from "../src/polish/run.js";
import { FRESH_END } from "../src/polish/seal.js";
import {
  placeboOf,
  type Line,
  type Placebo,
} from "../src/polish/tries/beside.js";
import { writeGzLines } from "../src/polish/tries/gzlines.js";
import { C, E, STOP_MS } from "../src/polish/tries/parts.js";
import { statOf } from "../src/polish/tries/stats.js";
import { CUTS_FILE } from "../src/polish/tries/steps.js";
import { loadCoins } from "../src/waveh/coins.js";
import { PACKAGE_ROOT } from "../src/waveh/gate.js";
import { DATA_END } from "../src/waveh/instants.js";
import { loadSizing } from "../src/waveh/look.js";
import { StoreError } from "../src/waveh/store.js";
import { sha, writeStore } from "./polish-tries-store.js";

const coins = loadCoins();
const SMALL = coins.list.map((c) => c.assetId);
let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});
const tmp = (name: string) => mkdtempSync(path.join(tmpdir(), `${name}-`));
const E0 = E.start;
const C0 = C.start;

const line = (
  o: Partial<Line> & { t: number; iid: number } & { W4?: number },
): Line => ({
  group: "B0",
  slice: 0,
  tid: "1",
  dir: 1,
  xIn: o.t + 120_000,
  xOut: o.t + 120_000 + DAY_MS,
  net: 0,
  unpriced: null,
  onMarks: null,
  ...o,
});
const w4 = (l: Line) => (l as Line & { W4: number }).W4;

describe("the placebo's flips (tries/beside.ts)", () => {
  /** Three coins a day over 200 days, at 01:00, 12:00 and 23:00, uneven nets. */
  const ls = Array.from({ length: 600 }, (_, k) =>
    line({
      t: E0 + Math.floor(k / 3) * DAY_MS + HOUR_MS * (1 + 11 * (k % 3)),
      iid: SMALL[k % 3]!,
      tid: String(k),
      net: ((k * k) % 97) / 10 - 4,
    }),
  );
  // A span that is not whole days, as E's (its end 50 hours before E's): its last day a part day with its own sign.
  const span = { from: E0, to: E0 + 200 * DAY_MS - 10 * HOUR_MS };

  it("flips each UTC day's sign with day flips: every printed number is an independent recomputation's", () => {
    const draws = 300;
    const got = placeboOf({ counted: [], kit }, ls, 0, {
      seed: 11,
      draws,
      ...span,
      flip: "day",
    });
    // The same draws by hand: the start, then one sign a day of the span, MARKET-1's two-way error.
    const rng = (
      kit.stats as unknown as { mulberry32: (s: number) => () => number }
    ).mulberry32(11);
    const units = Math.ceil((span.to - span.from) / DAY_MS);
    const items: Item[] = ls.map((l) => ({ t: l.t, iid: l.iid, x: l.net! }));
    for (const days of [100, 182]) {
      const room = span.to - span.from - days * DAY_MS;
      const ts: number[] = [];
      const errors: number[] = [];
      for (let k = 0; k < draws; k++) {
        const s = span.from + Math.floor(rng() * (room / DAY_MS + 1)) * DAY_MS;
        const sign = Array.from({ length: units }, () =>
          rng() < 0.5 ? -1 : 1,
        );
        const win = items.filter((i) => i.t >= s && i.t < s + days * DAY_MS);
        const flipped = win.map((i) => ({
          ...i,
          x: sign[Math.floor((i.t - span.from) / DAY_MS)]! * i.x,
        }));
        const f = statOf(kit, flipped)!;
        errors.push(statOf(kit, win)!.se!);
        ts.push(f.mean / f.se!);
      }
      const w = got[`${days} days`]!;
      const q = (vs: number[], p: number) => kit.exits.quantile(vs, p)!;
      const above = (z: number) => ts.filter((v) => v > z).length / ts.length;
      expect(w.draws).toBe(draws);
      for (const [z, v] of [
        [1.96, w.above196],
        [2.24, w.above224],
        [2.58, w.above258],
        [2.81, w.above281],
      ] as const)
        expect(v, `above ${z}`).toBe(above(z));
      for (const [p, v] of [
        [0.975, w.p975],
        [0.9875, w.p9875],
        [0.995, w.p995],
        [0.9975, w.p9975],
      ] as const)
        expect(v!, `p ${p}`).toBeCloseTo(q(ts, p), 10);
      const mt = ts.reduce((a, b) => a + b, 0) / ts.length;
      expect(w.sd).toBeCloseTo(
        Math.sqrt(ts.reduce((a, b) => a + (b - mt) ** 2, 0) / (ts.length - 1)),
        10,
      );
      expect(w.errors.median!).toBeCloseTo(q(errors, 0.5), 10);
      expect(w.errors.q1!).toBeCloseTo(q(errors, 0.25), 10);
      expect(w.errors.q3!).toBeCloseTo(q(errors, 0.75), 10);
    }
  });

  it("keeps the episode flips by default, draw for draw, and day flips differ from them", () => {
    const counted = ls.map((l) => ({
      t: l.t,
      iid: l.iid,
      addr: `0x${"0".repeat(39)}1`,
      side: -1 as const,
      tid: l.tid,
      method: "market",
    }));
    const o = { seed: 5, draws: 200, ...span };
    const plain = placeboOf({ counted, kit }, ls, 0, o);
    expect(
      placeboOf({ counted, kit }, ls, 0, { ...o, flip: "episode" }),
    ).toEqual(plain);
    expect(
      placeboOf({ counted, kit }, ls, 0, { ...o, flip: "day" }),
    ).not.toEqual(plain);
  });
});

/** B0's E lines, W4 0, 37, 74, …, every 7th unpriced, slices 0–24. */
const b0E = Array.from({ length: 40 }, (_, k) =>
  line({
    slice: k % 25,
    t: E0 + (5 * k + 1) * DAY_MS,
    iid: SMALL[k % 12]!,
    tid: String(k),
    net: k % 7 === 0 ? null : ((k * k) % 53) - 20,
    unpriced: k % 7 === 0 ? "no trade at the exit" : null,
    W4: 37 * k,
  }),
);
const recipeOf = (): Recipe => {
  const v = b0E.map(w4);
  const q = (p: number) => kit.exits.quantile(v, p)!;
  return {
    n: q(0.5),
    deciding: q(0.75),
    beside: q(0.9),
    quantiles: { n: 0.5, deciding: 0.75, beside: 0.9 },
    entriesOnE: 40,
  };
};
const nOf = (cut: number) =>
  b0E.filter((l) => w4(l) >= cut).map((l) => ({ ...l, group: "N" }));
const nC = Array.from({ length: 20 }, (_, k) =>
  line({
    group: "N",
    slice: k % 25,
    t: C0 + (6 * k + 1) * DAY_MS,
    iid: SMALL[k % 12]!,
    tid: String(100 + k),
    net: ((k * k) % 41) - 15,
  }),
);

describe("N's lines and the cuts (rules.md P4)", () => {
  it("holds N's E lines to B0's at N's cut, one for one; each difference fails", () => {
    // A cut at a line's own W4 (k = 15, 555): that line is kept.
    const cut = w4(b0E[15]!);
    const nE = nOf(cut);
    expect(nE[0]!.tid).toBe("15");
    expect(() => checkN({ b0E, nE, nC }, cut)).not.toThrow();
    for (const [why, n] of [
      ["the line at the cut exactly left out", nE.slice(1)],
      ["one more", [...nE, { ...b0E[0]!, group: "N" }]],
      [
        "a net",
        nE.map((l, i) => (i === 3 ? { ...l, net: (l.net ?? 0) + 1e-9 } : l)),
      ],
      ["a reason", nE.map((l, i) => (i === 0 ? { ...l, unpriced: "x" } : l))],
      ["an exit", nE.map((l, i) => (i === 1 ? { ...l, xOut: l.xOut + 1 } : l))],
      [
        "a direction",
        nE.map((l, i) => (i === 2 ? { ...l, dir: -1 as const } : l)),
      ],
      ["a slice", nE.map((l, i) => (i === 4 ? { ...l, slice: 99 } : l))],
    ] as const)
      expect(() => checkN({ b0E, nE: n, nC }, cut), why).toThrow(GateFailed);
    const without = b0E.map((l, i) =>
      i === 4
        ? (Object.fromEntries(
            Object.entries(l).filter(([k]) => k !== "W4"),
          ) as Line)
        : l,
    );
    expect(() => checkN({ b0E: without, nE, nC }, cut)).toThrow(
      "a B0 line on E without W4",
    );
  });

  it("recomputes the three cuts by the kit's type-7 quantile and holds them to the recipe", () => {
    const r = recipeOf();
    expect(sideCuts(kit, b0E, r)).toEqual({
      entries: 40,
      n: r.n,
      deciding: r.deciding,
      beside: r.beside,
    });
    // 40 values 0, 37, …: h = 39 p, so 0.75 lands at 29.25, between 1,073 and 1,110.
    expect(r.deciding).toBeCloseTo(1073 + 0.25 * 37, 9);
    for (const bad of [
      { ...r, deciding: r.deciding + 1 },
      { ...r, beside: r.beside - 1e-9 },
      { ...r, n: r.n + 0.5 },
      { ...r, entriesOnE: 41 },
    ])
      expect(() => sideCuts(kit, b0E, bad)).toThrow(GateFailed);
    expect(RECIPE).toEqual({
      deciding: 715,
      n: 336,
      beside: 1_391,
      quantiles: { n: 0.5, deciding: 0.75, beside: 0.9 },
      entriesOnE: 148_154,
    });
  });

  it("takes the 715 line from B0's E lines at the deciding cut and slices 0–19; N at 20, 10 and every slice, E's then C's", () => {
    const r = recipeOf();
    const lines = { b0E, nE: nOf(r.n), nC };
    // A cut at k = 15's W4 (555, slice 15): it is kept; k = 14 (518) is not; k = 20–24 (slices 20–24) are above it and left out.
    const cut = w4(b0E[15]!);
    const p = placeboLines(lines, cut);
    expect(p.l715.map((l) => l.tid)).toEqual([
      "15",
      "16",
      "17",
      "18",
      "19",
      ...Array.from({ length: 15 }, (_, i) => String(25 + i)),
    ]);
    expect(b0E.filter((l) => l.slice >= 20).map((l) => w4(l) >= cut)).toEqual([
      true,
      true,
      true,
      true,
      true,
    ]);
    const n = [...lines.nE, ...nC];
    expect(p.nAll).toEqual(n);
    expect(p.n20).toEqual(n.filter((l) => l.slice < 20));
    expect(p.n10).toEqual(n.filter((l) => l.slice < 10));
    expect(K).toBe(20);
    expect(M).toBe(loadSizing().M);
  });
});

describe("the windows' shares: TOO FEW and the safety net", () => {
  it("counts every whole-day window: TOO FEW on the priced positions, the safety net on them all", () => {
    // 21 days, a coin each of 10 for the first 10 days, then one coin; day 0 unpriced.
    const ls = Array.from({ length: 21 }, (_, d) =>
      line({
        t: E0 + d * DAY_MS + HOUR_MS,
        iid: SMALL[d < 10 ? d : 0]!,
        tid: String(d),
        net: d === 0 ? null : 1,
      }),
    );
    const span = { from: E0, to: E0 + 25 * DAY_MS };
    // Windows of 21 days starting on days 0–4.
    const s = windowShares(ls, span, 21);
    expect(s.windows).toBe(5);
    // Day 0's: 21 days and 10 coins in all, 20 priced (coins 1–9 and 0); day 1's: 20 days, all priced; days 2–4's: 19, 18, 17.
    expect(s.safetyNet).toBe(3 / 5);
    expect(s.tooFew).toBe(3 / 5);
    // Unpricing day 1 too: days 0's and 1's windows have 19 priced days (TOO FEW) but 21 and 20 in all (no safety net).
    const fewer = ls.map((l, d) => (d === 1 ? { ...l, net: null } : l));
    expect(windowShares(fewer, span, 21)).toEqual({
      windows: 5,
      tooFew: 1,
      safetyNet: 3 / 5,
    });
    // Ten coins needed: day 0's window without coin 9's day is short of coins.
    const nine = ls.filter((_, d) => d !== 9);
    expect(windowShares(nine, span, 21).safetyNet).toBe(1);
    expect(windowShares(ls, { from: E0, to: E0 + 20 * DAY_MS }, 21)).toEqual({
      windows: 0,
      tooFew: null,
      safetyNet: null,
    });
    // A window is [start, start + days): a position at its end is the next window's.
    const edge = Array.from({ length: 21 }, (_, d) =>
      line({ t: E0 + d * DAY_MS, iid: SMALL[d % 10]!, tid: String(d), net: 1 }),
    );
    expect(windowShares(edge, { from: E0, to: E0 + 20 * DAY_MS }, 20)).toEqual({
      windows: 1,
      tooFew: 0,
      safetyNet: 0,
    });
    expect(
      windowShares(edge.slice(1), { from: E0, to: E0 + 20 * DAY_MS }, 20),
    ).toEqual({ windows: 1, tooFew: 1, safetyNet: 1 });
    expect(SAFETY_NET).toEqual({ days: 20, coins: 10 });
  });
});

describe("z and the projection (rules.md P10, P16)", () => {
  const print = (v: Partial<Placebo>): Placebo => ({
    draws: 1,
    above258: 0,
    above281: 0,
    sd: 1,
    p995: 0,
    p9975: 0,
    errors: { median: 50, q1: 40, q3: 60 },
    student: 3,
    above196: 0,
    above224: 0,
    p975: 0,
    p9875: 0,
    ...v,
  });
  const flips = (
    e100: Partial<Placebo>,
    d100: Partial<Placebo>,
    e182: Partial<Placebo> = {},
    d182: Partial<Placebo> = {},
  ): ByFlip => ({
    episode: { "100 days": print(e100), "182 days": print(e182) },
    day: { "100 days": print(d100), "182 days": print(d182) },
  });

  it("takes the textbook floor, or the larger flip's percentile of either line when larger, at each look's window", () => {
    const low = zTable({
      l715: flips({ p9975: 2.5, p9875: 2.0 }, { p9975: 2.6 }),
      n20: flips({ p9975: 2.7 }, { p9975: 2.8 }),
    });
    expect(low.twoLooks[0]).toMatchObject({
      look: "look 1",
      window: 100,
      holds: { textbook: 2.81, percentile: "p9975", z: 2.81 },
      likely: { textbook: 2.24, percentile: "p9875", z: 2.24 },
    });
    const high = zTable({
      l715: flips(
        { p9975: 2.9, p9875: 2.3 },
        { p9975: 3.0, p9875: 2.25 },
        { p9975: 2.0, p995: 2.7, p975: 2.0 },
        { p995: 2.6, p975: 2.1 },
      ),
      n20: flips({ p9975: 2.95 }, { p9875: 2.31 }, {}, { p9975: 2.82 }),
    });
    expect(high.twoLooks[0]!.holds.z).toBe(3.0);
    expect(high.twoLooks[0]!.likely.z).toBe(2.31);
    expect(high.twoLooks[1]).toMatchObject({
      look: "look 2",
      window: 182,
      holds: { z: 2.82 },
      likely: { z: 2.24 },
    });
    expect(high.oneLook[0]).toMatchObject({
      look: "one later look",
      window: 182,
      holds: { textbook: 2.58, percentile: "p995", z: 2.7 },
      likely: { textbook: 1.96, percentile: "p975", z: 2.1 },
    });
    expect(high.twoLooks[0]!.holds.placebo).toEqual({
      l715: { episode: 2.9, day: 3.0 },
      n20: { episode: 2.95, day: 0 },
    });
    expect(TEXTBOOK).toEqual({
      twoLooks: { holds: 2.81, likely: 2.24 },
      oneLook: { holds: 2.58, likely: 1.96 },
    });
  });

  it("projects P(HOLDS) and P(LIKELY or HOLDS) by F13, DOES NOT HOLD keeping HOLDS's z", () => {
    const phi = (v: number) => 1 - normalUpper(v);
    expect(powerOf(100, 40, 2.81, 2.24)).toEqual({
      holds: phi((100 - 2.81 * 40) / 40),
      likelyOrHolds: phi((100 - 2.24 * 40) / 40),
    });
    // A small error: DOES NOT HOLD's bar, δ − z·SE, is the larger one.
    expect(powerOf(60, 5, 2.81, 2.24)).toEqual({
      holds: phi((60 - (50 - 2.81 * 5)) / 5),
      likelyOrHolds: phi((60 - (50 - 2.81 * 5)) / 5),
    });
    expect(powerOf(60, null, 2.81, 2.24)).toEqual({
      holds: null,
      likelyOrHolds: null,
    });
    expect(powerOf(60, 0, 2.81, 2.24).holds).toBeNull();
  });
});

describe("beside.json's check, to the bit", () => {
  it("passes on beside's own numbers and fails on any field one ulp off, named", () => {
    const n = [...nOf(recipeOf().n), ...nC];
    const d = { counted: [], kit };
    const want = placeboOf(d, n, 0, {
      seed: PLACEBO.seed,
      draws: 400,
      ...SPANS.EC,
    });
    expect(() => checkBeside(d, n, want, 400)).not.toThrow();
    const off = structuredClone(want);
    off["182 days"]!.sd = off["182 days"]!.sd * (1 + Number.EPSILON);
    expect(() => checkBeside(d, n, off, 400)).toThrow("182 days sd");
    const err = structuredClone(want);
    err["100 days"]!.errors.q3 = (err["100 days"]!.errors.q3 ?? 0) + 1;
    expect(() => checkBeside(d, n, err, 400)).toThrow("100 days errors.q3");
    const one = { "100 days": want["100 days"]! };
    expect(() => checkBeside(d, n, one, 400)).toThrow(
      "182 days: not in beside.json",
    );
  });
});

describe("the placebo's print", () => {
  it("names the checks, runs the 715 line on E alone and N on E ∪ C, and mixes the two by the safety net", () => {
    const r = recipeOf();
    const lines = { b0E, nE: nOf(r.n), nC };
    const d = { counted: [], kit };
    const n = [...lines.nE, ...nC];
    const beside = placeboOf(d, n, 0, {
      seed: PLACEBO.seed,
      draws: 10_000,
      ...SPANS.EC,
    });
    const p = placeboPrint(d, lines, { mean: 211, se: 122 }, beside, {
      recipe: r,
      draws: 50,
    });
    expect(p.checks.cuts).toMatchObject({ n: r.n, deciding: r.deciding });
    expect(p.lines.l715.positions).toBe(
      b0E.filter((l) => l.slice < 20 && w4(l) >= r.deciding).length,
    );
    expect(p.projection.n20).toMatchObject({ mProj: 89 });
    expect(p.projection.l715!.mProj).toBe(
      p.projection.l715!.m - p.projection.l715!.se,
    );
    // The 715 line's draws start inside E's span alone.
    expect(p.placebo.l715.episode["100 days"]!.draws).toBeGreaterThan(0);
    for (const option of ["twoLooks", "oneLook"] as const)
      for (const look of p.power[option]) {
        const f = look.safetyNetFires!;
        const a = look.l715!;
        const b = look.n20!;
        if (a.holds !== null && b.holds !== null)
          expect(look.theChoice.holds).toBeCloseTo(
            (1 - f) * a.holds + f * b.holds,
            12,
          );
      }
    expect(p.power.twoLooks[1]!.safetyNetFires).toBe(
      p.shares.l715["100 days"].safetyNet,
    );
    expect(p.power.oneLook[0]!.safetyNetFires).toBe(
      p.shares.l715["182 days"].safetyNet,
    );
    expect(() =>
      placeboPrint(d, lines, { mean: 211, se: 122 }, beside, {
        recipe: { ...r, n: r.n + 1 },
        draws: 50,
      }),
    ).toThrow(GateFailed);
    // Each line's placebo on its own span, both flips: the 715 line's E alone, N's E ∪ C.
    const pl = placeboLines(lines, r.deciding);
    const both = (ls: readonly Line[], span: { from: number; to: number }) => {
      const o = { seed: PLACEBO.seed, draws: 50, ...span };
      return {
        episode: placeboOf(d, ls, 0, { ...o, flip: "episode" }),
        day: placeboOf(d, ls, 0, { ...o, flip: "day" }),
      };
    };
    expect(p.placebo.l715).toEqual(both(pl.l715, SPANS.E));
    expect(p.placebo.n20).toEqual(both(pl.n20, SPANS.EC));
    expect(byFlip(d, pl.n10, SPANS.EC, 50)).toEqual(p.placebo.n10);
    // N's E lines held to B0's, and N's placebo to beside.json's, inside the print itself.
    const nE = lines.nE.map((l, k) =>
      k === 0 ? { ...l, net: l.net! + 1 } : l,
    );
    expect(() =>
      placeboPrint(d, { ...lines, nE }, { mean: 211, se: 122 }, beside, {
        recipe: r,
        draws: 50,
      }),
    ).toThrow("N's E lines are not B0's");
    const off = structuredClone(beside);
    off["100 days"]!.sd = off["100 days"]!.sd * (1 + Number.EPSILON);
    expect(() =>
      placeboPrint(d, lines, { mean: 211, se: 122 }, off, {
        recipe: r,
        draws: 50,
      }),
    ).toThrow("the placebo of N on all slices is not beside.json's");
  });
});

describe("the design (rules.md)", () => {
  it("passes the design's own numbers to the step, the spans and segments the rules name", () => {
    expect(EXAM_DESIGN).toEqual({
      explored: EXPLORED,
      recipe: RECIPE,
      draws: 100_000,
      placebo: PLACEBO_JSON,
    });
    expect(PLACEBO).toEqual({
      seed: 20_261_118,
      draws: 100_000,
      windows: [100, 182],
    });
    expect(SPANS).toEqual({
      E: { from: E.start, to: E.end - STOP_MS },
      EC: { from: E.start, to: C.end - STOP_MS },
    });
    expect(SPANS.EC.to).toBe(Date.parse("2026-05-26T23:00:00Z"));
    expect(SEGMENTS).toEqual([
      {
        from: Date.parse("2026-05-30T00:00:00Z"),
        to: Date.parse("2026-08-31T00:00:00Z"),
      },
      { from: Date.parse("2026-11-07T00:00:00Z"), to: FRESH_END },
    ]);
    const cuts = readFileSync(CUTS_FILE);
    expect(sha(cuts)).toBe(EXPLORED.cuts);
    expect(
      (JSON.parse(cuts.toString("utf8")) as { cuts: { W4: { value: number } } })
        .cuts.W4.value,
    ).toBe(RECIPE.n);
  });
});

/** A trusted store of the ten months' shape, no liq row, and the exploration's files, with their SHA-256s as the design to hold them to. */
async function stepWorld() {
  const analyzer = tmp("exam-analyzer");
  writeStore(path.join(analyzer, "store"), {
    minuteStart: E0,
    end: DATA_END,
    files: [],
  });
  const manifest = readFileSync(path.join(analyzer, "store", "manifest.json"));
  const gates = JSON.stringify({
    store: { manifestSha256: sha(manifest) },
    passed: true,
    gates: Object.fromEntries(GATE_NAMES.map((g) => [g, { pass: true }])),
    written: "2026-11-19T00:00:00.000Z",
  });
  mkdirSync(path.join(analyzer, "gates"));
  writeFileSync(path.join(analyzer, "gates", "gates.json"), gates);
  const r = recipeOf();
  const nE = nOf(r.n);
  const ex = path.join(analyzer, "explore");
  mkdirSync(ex);
  const gz = async (name: string, ls: readonly Line[]) => {
    await writeGzLines(
      path.join(ex, name),
      ls.map((l) => JSON.stringify(l)),
    );
    return sha(readFileSync(path.join(ex, name)));
  };
  const other = (ls: readonly Line[], group: string) =>
    ls.map((l) => ({ ...l, group }));
  const ePositions = await gz("e-positions.jsonl.gz", [
    ...b0E,
    ...other(b0E, "S1"),
  ]);
  const choicePositions = await gz("choice-positions.jsonl.gz", nE);
  const cPositions = await gz("c-positions.jsonl.gz", [
    ...other(nC, "B0"),
    ...nC,
  ]);
  const file = (name: string, value: unknown) => {
    const text = JSON.stringify(value);
    writeFileSync(path.join(ex, name), text);
    return sha(text);
  };
  const beside = file("beside.json", {
    goes: "N",
    rebasedBy: 0,
    placebo: {
      seed: PLACEBO.seed,
      rule: placeboOf({ counted: [], kit }, [...nE, ...nC], 0, {
        seed: PLACEBO.seed,
        draws: 10_000,
        ...SPANS.EC,
      }),
    },
  });
  const c = file("c.json", {
    goes: "N",
    evaluations: [{ rule: "N", stat: { mean: 211, se: 122 } }],
  });
  const choice = file("choice.json", { step: "choice" });
  const real = JSON.parse(readFileSync(CUTS_FILE, "utf8")) as {
    cuts: { W4: { value: number } };
  };
  real.cuts.W4.value = r.n;
  const cutsFile = path.join(analyzer, "cuts.json");
  writeFileSync(cutsFile, JSON.stringify(real));
  const design: ExamDesign = {
    explored: {
      store: sha(manifest),
      gates: sha(gates),
      cuts: sha(readFileSync(cutsFile)),
      e: "0".repeat(64),
      choice,
      c,
      beside,
      ePositions,
      choicePositions,
      cPositions,
    },
    recipe: r,
    draws: 40,
    placebo: "0".repeat(64),
  };
  const input = (root: string, d = design): ExamInput => ({
    analyzer,
    root,
    coins,
    kit,
    code: "4".repeat(64),
    wavehFrozen: "5".repeat(64),
    cutsFile,
    design: d,
    log: () => {},
  });
  return { analyzer, design, input, ex, cutsFile };
}

describe("the placebo step (exam --step placebo)", () => {
  it("writes placebo.json on the trusted store, naming its identity and inputs", async () => {
    const w = await stepWorld();
    const root = tmp("exam-root");
    const r = await placeboStep(w.input(root));
    const text = readFileSync(path.join(root, "placebo.json"), "utf8");
    expect(sha(text)).toBe(r.sha);
    const v = JSON.parse(text) as Record<string, unknown>;
    expect(v).toMatchObject({
      step: "placebo",
      identity: {
        code: "4".repeat(64),
        wavehFrozen: "5".repeat(64),
        store: w.design.explored.store,
        gates: w.design.explored.gates,
      },
      inputs: w.design.explored,
      seed: PLACEBO.seed,
      draws: 40,
      M: 147,
      K: 20,
    });
    expect(v.lines).toMatchObject({
      nAll: { positions: nOf(w.design.recipe.n).length + nC.length },
    });
    expect(Object.keys(v.seconds as object)).toEqual([
      "data",
      "placebo",
      "all",
    ]);
  }, 60_000);

  it("refuses an input other than the design's, before any placebo: each named", async () => {
    const w = await stepWorld();
    const root = tmp("exam-root");
    const off = (k: keyof ExamDesign["explored"]) => ({
      ...w.design,
      explored: { ...w.design.explored, [k]: "f".repeat(64) },
    });
    for (const [k, why] of [
      ["store", "is not the exploration's"],
      ["gates", "is not the exploration's"],
      ["cuts", "polish/cuts.json: SHA-256"],
      ["beside", "explore\\beside.json: SHA-256"],
      ["c", "explore\\c.json: SHA-256"],
      ["choice", "explore\\choice.json: SHA-256"],
      ["ePositions", "explore\\e-positions.jsonl.gz: SHA-256"],
      ["choicePositions", "explore\\choice-positions.jsonl.gz: SHA-256"],
      ["cPositions", "explore\\c-positions.jsonl.gz: SHA-256"],
    ] as const) {
      const err = await placeboStep(w.input(root, off(k))).catch(
        (e: unknown) => e,
      );
      expect(err, k).toBeInstanceOf(StoreError);
      expect((err as Error).message, k).toContain(why);
    }
    await expect(
      placeboStep(
        w.input(root, {
          ...w.design,
          recipe: { ...w.design.recipe, n: w.design.recipe.n + 1 },
        }),
      ),
    ).rejects.toThrow("polish/cuts.json's W4 is not N's cut");
    expect(() => readFileSync(path.join(root, "placebo.json"))).toThrow();
  }, 60_000);
});

describe("the built program's exam command", () => {
  const program = path.join(PACKAGE_ROOT, "dist", "polish.js");
  const runIt = (args: string[], env: Record<string, string>) =>
    spawnSync(process.execPath, [program, ...args], {
      env: {
        ...process.env,
        WAVEH_STORE: "",
        ANALYZER_ROOT: "",
        WAVEH_ROOT: "",
        EXAM_ROOT: "",
        ...env,
      },
      encoding: "utf8",
      timeout: 60_000,
    });

  it("refuses a missing or unknown step and bad settings (exit 2), a sealed root (exit 5), a store not trusted (exit 5)", () => {
    const analyzer = tmp("exam-analyzer");
    const ok = { ANALYZER_ROOT: analyzer, EXAM_ROOT: tmp("exam-root") };
    for (const [args, env, why] of [
      [["exam"], ok, "exam needs --step placebo"],
      [["exam", "--step", "look"], ok, 'the option "--step look"'],
      [
        ["exam", "--step", "placebo", "--step", "placebo"],
        ok,
        'the option "--step placebo"',
      ],
      [["exam", "--step", "placebo"], { ANALYZER_ROOT: analyzer }, "EXAM_ROOT"],
      [
        ["exam", "--step", "placebo"],
        { ...ok, EXAM_ROOT: path.join(analyzer, "exam") },
        "must lie outside ANALYZER_ROOT",
      ],
      [["explore", "--step", "placebo"], ok, 'the option "--step placebo"'],
    ] as const) {
      const r = runIt([...args], env);
      expect(r.status, why).toBe(2);
      expect(r.stderr, why).toContain(why);
    }
    const sealed = runIt(["exam", "--step", "placebo"], {
      ...ok,
      EXAM_ROOT: path.join(tmp("exam-at"), "ANALYZER", "FRESH"),
    });
    expect(sealed.status).toBe(5);
    expect(sealed.stderr).toContain("FRESH is sealed");
    const untrusted = runIt(["exam", "--step", "placebo"], ok);
    expect(untrusted.status).toBe(5);
    const log = readFileSync(
      path.join(
        ok.EXAM_ROOT,
        "logs",
        `polish-${new Date().toISOString().slice(0, 10)}.log`,
      ),
      "utf8",
    );
    expect(log).toContain("start exam");
    expect(log).toContain('"examSealOpen":false');
    expect(log).toContain("dist/schedule.js");
  }, 60_000);
});
