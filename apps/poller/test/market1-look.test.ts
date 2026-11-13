/**
 * MARKET-1's look (rules.md M10, M11, M13, M15). The verdict on made-up
 * looks, as MARKET-RULES-REVIEW built them (2026-11-13): every WAVE position
 * computed by the real rules (`computeAll`, `namedSets`) from two accounts'
 * forced sells, market objects whose marks follow a formula, and a book at
 * each leg; the verdict from `lookVerdict`. The expected nets are recomputed
 * here from the same formulas. Every value is made up.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { START } from "../src/market1/assemble.js";
import { toBook } from "../src/market1/book.js";
import { computeAll, namedSets } from "../src/market1/compute.js";
import { byM4, type Liq } from "../src/market1/fills.js";
import type { Position } from "../src/market1/lines.js";
import { lookVerdict } from "../src/market1/look.js";
import type { LegQuote } from "../src/market1/price.js";
import { CUT, LOOK_ENDS } from "../src/paper/instants.js";
import { marketThrough } from "../src/paper/market.js";
import {
  loadResearch,
  type Market,
  type PanelFile,
  type Research,
} from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";

let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const at = (iso: string) => Date.parse(iso);
const END1 = LOOK_ENDS[0];
const USED = [8, 10, 31, 32, 33, 34, 35, 54, 55, 56, 57, 58];
const PANEL_START = CUT - 3 * DAY_MS;
const FIRST_WAVE_DAY = at("2026-11-13T00:00:00Z");
const RATE = 0.00001;
const KEEP_TEXT =
  "Keep and drop are verdicts on this test, never instructions to trade.";

/** A made-up world: a drift in every market (bps a day) and the rise of wave k's market over its 24 hours (bps). */
type Variant = { drift: number; rise: (k: number) => number };
type Wave = { k: number; iid: number; t: number; xIn: number; xOut: number };

const KEEP: Variant = { drift: 0, rise: (k) => 240 + ((k * 17) % 41) - 20 };
const DRIFT: Variant = { drift: 150, rise: (k) => -10 + (k % 3) };
const NOISY: Variant = { drift: 0, rise: (k) => (k % 2 === 0 ? 400 : -150) };

/** One wave a day from 2026-11-13: account a's forced sell at 10:20 (+ k mod 7 minutes), b's a second later. */
function wavesOf(n: number, markets: number): Wave[] {
  return Array.from({ length: n }, (_, k) => {
    const t =
      FIRST_WAVE_DAY + k * DAY_MS + 10 * HOUR_MS + (20 + (k % 7)) * MINUTE_MS;
    const xIn = t + 1_000 + 120_000;
    return { k, iid: USED[k % markets]!, t, xIn, xOut: xIn + DAY_MS };
  });
}

/** The mark of a market at an instant: its level, the drift, and each of its waves' rise, linear over the hold. */
function markPath(v: Variant, waves: readonly Wave[]) {
  const rate = Math.log(1 + v.drift / 1e4);
  return (iid: number, t: number): number => {
    let p = (50 + iid) * Math.exp((rate * (t - CUT)) / DAY_MS);
    for (const w of waves) {
      if (w.iid !== iid) continue;
      const ramp = Math.min(1, Math.max(0, (t - w.xIn) / DAY_MS));
      p *= 1 + (v.rise(w.k) / 1e4) * ramp;
    }
    return p;
  };
}

type World = {
  waves: Wave[];
  f: (iid: number, t: number) => number;
  /** WAVE's set at look 1, as the look takes it. */
  wave: Position[];
};

/**
 * WAVE's positions of a world: the real rules from the counted fills, each leg
 * at the book written 20 s before it (best levels at the mid ± 5 bps, deep
 * enough) unless `markLeg` names it, the taker fee `fee`.
 */
function world(
  v: Variant,
  n: number,
  markets: number,
  over: {
    fee?: number;
    markLeg?: (w: Wave, leg: "in" | "out") => string | null;
  } = {},
): World {
  const waves = wavesOf(n, markets);
  const f = markPath(v, waves);
  const mk = new Map<number, Market>();
  for (const iid of USED.slice(0, markets)) {
    const minutes = (END1 - PANEL_START) / MINUTE_MS;
    const p: PanelFile = {
      iid,
      symbol: `M${iid}-USD`,
      category: "crypto",
      start: PANEL_START,
      end: END1,
      firstTrade: null,
      retired: null,
      marks: Array.from({ length: minutes }, (_, i) =>
        f(iid, PANEL_START + i * MINUTE_MS),
      ),
      klines: { minute: [], trades: [], volume: [] },
      funding: Array.from({ length: (END1 - CUT) / HOUR_MS }, (_, h) => [
        CUT + h * HOUR_MS,
        RATE,
        CUT + h * HOUR_MS + 70,
      ]),
    };
    mk.set(iid, marketThrough(kit, p, END1));
  }
  const fills: Liq[] = waves
    .flatMap((w) => [
      { t: w.t, iid: w.iid, addr: "0xa", side: -1 as const, tid: `${w.k}1` },
      {
        t: w.t + 1_000,
        iid: w.iid,
        addr: "0xb",
        side: -1 as const,
        tid: `${w.k}2`,
      },
    ])
    .sort(byM4);
  const book = (iid: number, x: number) => {
    const mid = f(iid, x - 20_000);
    return toBook(
      x - 20_000,
      [
        [String(mid * 0.9995), "500"],
        [String(mid * 0.999), "500"],
      ],
      [
        [String(mid * 1.0005), "500"],
        [String(mid * 1.001), "500"],
      ],
    );
  };
  const quote = (iid: number, x: number): LegQuote => {
    const w = waves.find((u) => u.iid === iid && (u.xIn === x || u.xOut === x));
    const why =
      w === undefined
        ? null
        : (over.markLeg?.(w, w.xIn === x ? "in" : "out") ?? null);
    return why === null
      ? { source: "book", book: book(iid, x) }
      : { source: "mark", why };
  };
  const positions = computeAll({
    kit,
    small: fills,
    large: [],
    at: { cut: CUT, start: START },
    end: END1,
    tradable: () => true,
    market: (iid) => mk.get(iid) ?? null,
    quote,
    fee: () => over.fee ?? 0.0004,
  });
  return { waves, f, wave: namedSets(positions, END1, []).get("WAVE")! };
}

/** The mean net of a world's positions by the formulas: the best levels, the fee on both legs' notional, funding from the marks. */
function expected(w: World, fee = 0.0004): { net: number; fees: number } {
  const rows = w.waves.map((x) => {
    const pIn = w.f(x.iid, x.xIn - 20_000) * 1.0005;
    const pOut = w.f(x.iid, x.xOut - 20_000) * 0.9995;
    let sum = 0;
    for (
      let h = Math.ceil((x.xIn + 1) / HOUR_MS) * HOUR_MS;
      h <= x.xOut;
      h += HOUR_MS
    )
      sum += RATE * w.f(x.iid, h - MINUTE_MS);
    const fees = fee * 1e4 * (1 + pOut / pIn);
    return {
      net: (pOut / pIn - 1) * 1e4 - fees - sum * (1_000 / pIn) * 10,
      fees,
    };
  });
  const mean = (xs: number[]) => xs.reduce((s, x) => s + x, 0) / xs.length;
  return {
    net: mean(rows.map((r) => r.net)),
    fees: mean(rows.map((r) => r.fees)),
  };
}

describe("the look's verdict on made-up looks (M10, M11)", () => {
  it("KEEP: an effect of about +240 bps on 24 days in 12 markets, every leg at the book", () => {
    const w = world(KEEP, 24, 12);
    const r = lookVerdict(kit, w.wave, 1);
    expect(r.verdict).toBe("KEEP");
    expect(r.z).toBe(2.81);
    expect(r.sentence).toBe(KEEP_TEXT);
    const s = r.summary;
    expect(s).toMatchObject({
      positions: 24,
      priced: 24,
      days: 24,
      markets: 12,
      notAtBook: 0,
      notAtBookShare: 0,
      depthShort: 0,
      markLegs: {},
    });
    expect(s.money).toMatchObject({ n: 24, days: 24, markets: 12 });
    expect(s.money!.mean).toBeCloseTo(expected(w).net, 6);
    expect(s.fees).toBeCloseTo(expected(w).fees, 6);
    expect(s.money!.mean - 2.81 * s.money!.se!).toBeGreaterThan(0);
    expect(s.excess!.mean).toBeGreaterThan(0);
  });

  it("TOO FEW TO TELL by F1: the money's lower bound is above 0, but the market only drifted up and the excess is below 0", () => {
    const w = world(DRIFT, 24, 12);
    const r = lookVerdict(kit, w.wave, 1);
    expect(r.verdict).toBe("TOO FEW TO TELL");
    expect(r.sentence).toBe(KEEP_TEXT);
    const s = r.summary;
    expect(s.money).toMatchObject({ n: 24, days: 24, markets: 12 });
    expect(s.money!.mean).toBeCloseTo(expected(w).net, 6);
    expect(s.money!.mean - 2.81 * s.money!.se!).toBeGreaterThan(0);
    expect(s.excess!.mean).toBeLessThan(0);
    expect(s.notAtBookShare).toBe(0);
  });

  it("DROP by the recorded fee: the KEEP world with a taker rate of 2% a leg", () => {
    const w = world(KEEP, 24, 12, { fee: 0.02 });
    const r = lookVerdict(kit, w.wave, 1);
    expect(r.verdict).toBe("DROP");
    expect(r.sentence).toBe(KEEP_TEXT);
    const s = r.summary;
    expect(s.fees).toBeCloseTo(expected(w, 0.02).fees, 6);
    expect(s.money!.mean).toBeCloseTo(expected(w, 0.02).net, 6);
    expect(s.money!.mean + 2.81 * s.money!.se!).toBeLessThan(50);
    // The excess reads the marks, not the fee: still above 0.
    expect(s.excess!.mean).toBeGreaterThan(0);
  });

  it("TOO FEW TO TELL by days: the KEEP world on 15 days, KEEP-sized or DROP-sized (F5 guards both)", () => {
    for (const fee of [0.0004, 0.02]) {
      const w = world(KEEP, 15, 12, { fee });
      const r = lookVerdict(kit, w.wave, 1);
      expect(r.verdict, `fee ${fee}`).toBe("TOO FEW TO TELL");
      const s = r.summary;
      expect(s.money).toMatchObject({ n: 15, days: 15, markets: 12 });
      expect(s.excess!.mean).toBeGreaterThan(0);
      if (fee === 0.02)
        expect(s.money!.mean + 2.81 * s.money!.se!).toBeLessThan(50);
      else expect(s.money!.mean - 2.81 * s.money!.se!).toBeGreaterThan(0);
    }
  });

  it("TOO FEW TO TELL by markets: 24 days in 8 markets", () => {
    const w = world(KEEP, 24, 8);
    const r = lookVerdict(kit, w.wave, 1);
    expect(r.verdict).toBe("TOO FEW TO TELL");
    const s = r.summary;
    expect(s.money).toMatchObject({ n: 24, days: 24, markets: 8 });
    expect(s.money!.mean - 2.81 * s.money!.se!).toBeGreaterThan(0);
    expect(s.excess!.mean).toBeGreaterThan(0);
  });

  it("TOO FEW TO TELL by noise: +400 and −150 in turn; at look 3 the sentence names the largest mean not ruled out", () => {
    const w = world(NOISY, 24, 12);
    const r = lookVerdict(kit, w.wave, 1);
    expect(r.verdict).toBe("TOO FEW TO TELL");
    expect(r.sentence).toBe(KEEP_TEXT);
    const s = r.summary;
    expect(s.money!.mean).toBeCloseTo(expected(w).net, 6);
    expect(s.money!.mean).toBeGreaterThan(50);
    expect(s.excess!.mean).toBeGreaterThan(0);
    expect(s.money!.mean - 2.81 * s.money!.se!).toBeLessThan(0);
    expect(s.money!.mean + 2.81 * s.money!.se!).toBeGreaterThan(50);
    const r2 = lookVerdict(kit, w.wave, 2);
    expect([r2.z, r2.verdict, r2.sentence]).toEqual([
      2.43,
      "TOO FEW TO TELL",
      KEEP_TEXT,
    ]);
    const r3 = lookVerdict(kit, w.wave, 3);
    expect(r3.z).toBe(2.17);
    expect(r3.verdict).toBe("TOO FEW TO TELL");
    expect(r3.sentence).toBe(
      `No mean result as large as ${(s.money!.mean + 2.17 * s.money!.se!).toFixed(1)} bps a position was seen.`,
    );
  });

  it("KEEP with a forced leg: one exit leg at the mark (recording not final at the look), 1 of 24 not at the book", () => {
    const w = world(KEEP, 24, 12, {
      markLeg: (u, leg) =>
        u.k === 23 && leg === "out" ? "recording not final at the look" : null,
    });
    const r = lookVerdict(kit, w.wave, 1);
    expect(r.verdict).toBe("KEEP");
    expect(r.summary).toMatchObject({
      notAtBook: 1,
      markLegs: { "recording not final at the look": 1 },
    });
    expect(r.summary.notAtBookShare).toBeCloseTo(1 / 24, 12);
  });

  it("WITHHELD: four of 24 positions with a leg at the mark (16.7%, above 10%), whatever the money says", () => {
    const w = world(KEEP, 24, 12, {
      markLeg: (u, leg) =>
        leg === "in" && [3, 7, 11, 15].includes(u.k)
          ? "gap: missing day"
          : null,
    });
    const r = lookVerdict(kit, w.wave, 1);
    expect(r.verdict).toBe("WITHHELD");
    expect(r.sentence).toBe(KEEP_TEXT);
    expect(r.summary).toMatchObject({
      notAtBook: 4,
      markLegs: { "gap: missing day": 4 },
    });
    expect(r.summary.notAtBookShare).toBeCloseTo(4 / 24, 12);
    expect(r.summary.money!.mean - 2.81 * r.summary.money!.se!).toBeGreaterThan(
      0,
    );
  });

  it("TOO FEW TO TELL without a BASE cell: no excess to show that the market's drift is not the effect (F1)", () => {
    const w = world(KEEP, 24, 12);
    const noBase = w.wave.map((p) => ({
      ...p,
      priced: { ...p.priced!, excess: null },
    }));
    const r = lookVerdict(kit, noBase, 1);
    expect(r.verdict).toBe("TOO FEW TO TELL");
    expect(r.summary.excess).toBeNull();
    expect(r.summary.noBase).toBe(24);
    expect(r.summary.money!.mean - 2.81 * r.summary.money!.se!).toBeGreaterThan(
      0,
    );
  });
});
