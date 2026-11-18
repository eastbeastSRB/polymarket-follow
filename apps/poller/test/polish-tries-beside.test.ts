/**
 * The prints beside (src/polish/tries/beside.ts) as pure functions, on
 * inputs built by hand (the breaks' survivors, POLISH-EXPLORE-3): K by
 * count, the smallest K within 3% of all slices' error; the book footprint
 * at K slices with H8's 10 s; the placebo's flips, windows and t*; the
 * exam's z; the projection and its power; the signal meter; a filter's
 * lines on E; the event-level mean and OWN.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { normalUpper } from "../src/market1/stats.js";
import { loadResearch, type Research } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import {
  examZ,
  footprintOf,
  kOf,
  linesBeside,
  linesOf,
  placeboOf,
  projectionOf,
  signalOf,
  type Line,
} from "../src/polish/tries/beside.js";
import type { Data } from "../src/polish/tries/data.js";
import { statOf } from "../src/polish/tries/stats.js";
import type { CutsFile } from "../src/polish/tries/trylog.js";
import { fortyOf } from "../src/polish/writers.js";
import { loadCoins } from "../src/waveh/coins.js";
import type { Counted } from "../src/waveh/fills.js";
import { addr } from "./polish-world.js";

const coins = loadCoins();
let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const START = Date.parse("2025-06-01T00:00:00Z");
const MINUTES = 200 * 1440;

/** A world of counted fills and minute prices (NaN where none given). */
function dataOf(
  counted: Counted[] = [],
  pc = new Map<string, Float64Array>(),
): Data {
  const nan = new Float64Array(MINUTES).fill(NaN);
  return {
    kit,
    start: START,
    minutes: MINUTES,
    coins,
    counted,
    forced: {
      t: Float64Array.of(),
      coin: Uint16Array.of(),
      user: Uint32Array.of(),
      side: Int8Array.of(),
      backstop: Uint8Array.of(),
      coins: [],
      px: Float64Array.of(),
      sz: Float64Array.of(),
      markPx: Float64Array.of(),
    },
    pc: new Map([...fortyOf(coins)].map((c) => [c, pc.get(c) ?? nan])),
    column: () => nan,
    funding: () => [],
    levels: () => [],
  };
}

const line = (o: Partial<Line> & { t: number; iid: number }): Line => ({
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

describe("K and the book footprint", () => {
  it("K: the smallest of 1, 5, 10 slices whose pooled error is within 3% of all slices'; slices 0 to K − 1 pooled", () => {
    // Slices 0–4 hold 60 positions each, 5–9 four each, ±10 bps in turn, each on its own day and coin: the error is
    // 10 ÷ √(n − 1), so 5 slices (300) are 3.3% above all 10 (320).
    const ls: Line[] = [];
    for (let s = 0; s < 10; s++)
      for (let j = 0; j < (s < 5 ? 60 : 4); j++)
        ls.push(
          line({
            slice: s,
            t: START + ls.length * DAY_MS,
            iid: ls.length,
            net: j % 2 === 0 ? 10 : -10,
          }),
        );
    const k = kOf(dataOf(), ls, 0, 10);
    expect(k.at.map((x) => [x.K, x.n])).toEqual([
      [1, 60],
      [5, 300],
      [10, 320],
    ]);
    const ratio = k.at[1]!.se! / k.at[2]!.se!;
    expect(ratio).toBeGreaterThan(1.03);
    expect(ratio).toBeLessThanOrEqual(1.05);
    expect(k.K).toBe(10);
  });

  it("the footprint: each leg's hour file, the hour before only within 10 s of the hour's start, at K slices", () => {
    const h = Date.parse("2025-09-10T10:00:00Z");
    const ls = [
      // The entry exactly 10 s after its hour's start: its own hour; the exit 9.999 s after: and the hour before.
      line({
        t: h - 110_000,
        iid: 5,
        xIn: h + 10_000,
        xOut: h + DAY_MS + 9_999,
      }),
      line({ t: h + 3 * HOUR_MS, iid: 5, slice: 0 }),
      line({ t: h + 5 * HOUR_MS, iid: 15, slice: 1 }),
    ];
    const f = footprintOf(ls, 1);
    // Positions 1 and 2: 3 files and 2 (their entry and exit hours); position 3 is slice 1's.
    expect(f).toMatchObject({ files: 5, days: 1, perDay: 5 });
  });
});

describe("the placebo", () => {
  /** Positions on given days, each in its own coin (so its own B1 episode), with their counted fills. */
  const world = (days: number[], net: (k: number) => number) => {
    const small = coins.list.map((c) => c.assetId);
    const counted: Counted[] = [];
    const ls = days.map((day, k) => {
      const t = START + day * DAY_MS + HOUR_MS;
      const iid = small[k % small.length]!;
      counted.push({
        t,
        iid,
        addr: addr(k + 1),
        side: -1,
        tid: String(k),
        method: "market",
      });
      return line({ t, iid, tid: String(k), net: net(k) });
    });
    return { d: dataOf(counted.sort((a, b) => a.t - b.t)), ls };
  };

  it("flips each episode's sign at random: t* is the flipped mean over the flipped error, finite and centred", () => {
    // Four positions of +10 bps in four episodes: unflipped, no error; a draw with both signs has one.
    const { d, ls } = world([0, 1, 2, 3], () => 10);
    const p = placeboOf(d, ls, 0, {
      seed: 7,
      draws: 400,
      from: START,
      to: START + 100 * DAY_MS,
    });
    const w = p["100 days"]!;
    // 2 of 16 sign patterns are all alike and have no error.
    expect(w.draws).toBeGreaterThan(300);
    expect(w.draws).toBeLessThan(400);
    expect(Number.isFinite(w.p9975!)).toBe(true);
    expect(w.p995!).toBeGreaterThan(0);
    expect(w.errors.median).toBe(0);
    expect(p["182 days"]!.draws).toBe(0);
  });

  it("each window holds 100 days from its start; the starts are random", () => {
    // Days 0, 1, 2 and 99 in one window of 100 days: the unflipped error is all four's.
    const one = world([0, 1, 2, 99], (k) => [1, 2, 3, 4][k]!);
    const all = statOf(
      kit,
      one.ls.map((l) => ({ t: l.t, iid: l.iid, x: l.net! })),
    )!;
    const p = placeboOf(one.d, one.ls, 0, {
      seed: 7,
      draws: 20,
      from: START,
      to: START + 100 * DAY_MS,
    });
    expect(p["100 days"]!.errors.median).toBeCloseTo(all.se!, 12);
    // Positions every 5 days over 120 days, k²/10 bps: windows starting on days 0 to 20 hold different ones.
    const many = world(
      Array.from({ length: 24 }, (_, k) => 5 * k),
      (k) => (k * k) / 10,
    );
    const q = placeboOf(many.d, many.ls, 0, {
      seed: 7,
      draws: 200,
      from: START,
      to: START + 120 * DAY_MS,
    })["100 days"]!;
    expect(q.errors.q1!).toBeLessThan(q.errors.q3!);
  });
});

describe("the exam's z, the projection and the signal meter", () => {
  it("the exam's z is the rule's 99.75th percentile, never under 2.81", () => {
    expect([examZ(2), examZ(3.1), examZ(null)]).toEqual([2.81, 3.1, 2.81]);
  });

  it("the projection: m − SE for a rule chosen by passing C, m for B0; HOLDS' power at max(z·SE, 50 − z·SE)", () => {
    const chosen = projectionOf(40, 5, true, 2.81, { look1: 5, look2: null });
    expect(chosen).toMatchObject({ mProj: 35, beside: 40, look2: null });
    expect(chosen.look1).toBeCloseTo(
      1 - normalUpper((35 - (50 - 2.81 * 5)) / 5),
      12,
    );
    expect(
      projectionOf(40, 5, false, 2.81, { look1: null, look2: null }),
    ).toEqual({
      mProj: 40,
      beside: 35,
      look1: null,
      look2: null,
    });
  });

  it("the signal meter: the mean of t² over the adoptable tries with a t; at 1.2 nothing beyond luck; each gain shrunk by 1 − 1 ÷ it", () => {
    const tries = [
      { name: "A", adoptable: true, t: 1, d: 12 },
      { name: "B", adoptable: true, t: 1, d: 0 },
      { name: "C", adoptable: true, t: 2, d: 0 },
      { name: "D", adoptable: true, t: 0, d: 0 },
      { name: "E", adoptable: true, t: 0, d: 0 },
      { name: "N7", adoptable: false, t: 9, d: 5 },
      { name: "F", adoptable: true, t: null, d: null },
    ];
    const s = signalOf(tries) as Extract<
      ReturnType<typeof signalOf>,
      { shrink: number }
    >;
    expect(s).toMatchObject({
      tries: 5,
      meanSquare: 1.2,
      verdict: "nothing beyond luck",
    });
    expect(s.shrink).toBeCloseTo(1 / 6, 12);
    expect(s.gains.A).toBeCloseTo(2, 12);
  });
});

describe("a rule's lines and 6.1's lines", () => {
  it("a filter going to FRESH: on E, B0's lines its feature keeps; on C, its own", () => {
    const t = START + 10 * DAY_MS;
    const e = [
      { ...line({ t, iid: 5 }), S1: -1 },
      { ...line({ t: t + 1, iid: 5 }), S1: 1 },
      { ...line({ t: t + 2, iid: 5 }), S1: null },
    ];
    const c = [line({ t: t + 3, iid: 5, group: "S1" })];
    const got = linesOf("S1", { e, choice: [], c }, {} as CutsFile["cuts"]);
    expect(got.E.map((l) => l.t)).toEqual([t]);
    expect(got.C).toEqual(c);
  });

  it("the event-level mean takes each B1 episode's earliest position; OWN takes the other small coins' move", () => {
    const t = START + 10 * DAY_MS;
    const SOL = 5;
    const f1: Counted = {
      t,
      iid: SOL,
      addr: addr(1),
      side: -1,
      tid: "1",
      method: "market",
    };
    const f2 = { ...f1, t: t + 30 * MINUTE_MS, addr: addr(2), tid: "2" };
    // SOL rises 1% from x_in's minute to x_out's; the other small coins stay at 100.
    const pc = new Map<string, Float64Array>();
    const k = (x: number) => Math.floor((x - START) / MINUTE_MS);
    for (const c of coins.list.slice(0, 6))
      pc.set(c.name, new Float64Array(MINUTES).fill(100));
    const sol = new Float64Array(MINUTES).fill(100);
    sol.fill(101, k(t + 120_000 + DAY_MS));
    pc.set("SOL", sol);
    const ls = [
      line({ t: f2.t, iid: SOL, tid: "2", net: 30, onMarks: null }),
      line({ t, iid: SOL, tid: "1", net: 10, onMarks: 100 }),
    ];
    const b = linesBeside(dataOf([f1, f2], pc), ls, 0, {
      start: START,
      end: START + 100 * DAY_MS,
    });
    expect(b.eventLevel).toMatchObject({ n: 1, mean: 10 });
    expect(b.own).toMatchObject({ n: 1, mean: 100 });
  });
});
