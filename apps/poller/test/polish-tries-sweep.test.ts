/**
 * The exploration's sweep and rules (src/polish/tries/sweep.ts, rules.ts)
 * and the E step's checks (steps.ts): the net equal to WAVE-H's
 * pricePosition on the same tape, to the bit, where every settlement has a
 * mark, and the trade's price where one has none; the funding equal to the
 * kit's; each distinct leg read once in the coin's and the instant's order,
 * pace at each coin-month; X1's and X2's exits; a rule placed with its
 * filters and its M; the calibration's b and its threshold; the
 * reproduction held to WAVE-H's own EVERY SLICE line; the look's book nets.
 */
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { beforeAll, describe, expect, it } from "vitest";
import { byM4 } from "../src/market1/fills.js";
import { ENTRY_DELAY_MS } from "../src/market1/price.js";
import {
  loadResearch,
  type Market,
  type Research,
} from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import type { Data } from "../src/polish/tries/data.js";
import type { Forced } from "../src/polish/tries/forced.js";
import { cutsOf, featuresOf } from "../src/polish/tries/features.js";
import { E, entriesOf, inPart, type Entry } from "../src/polish/tries/parts.js";
import { priceColumn } from "../src/polish/tries/prices.js";
import {
  B0,
  entriesAt,
  place,
  ruleOf,
  stopExit,
  targetExit,
  tryNamed,
} from "../src/polish/tries/rules.js";
import {
  bookNets,
  calibrationOf,
  eOf,
  fixedSpecs,
  reproductionOf,
  specsOf,
} from "../src/polish/tries/steps.js";
import {
  eachLeg,
  fundingBetween,
  grossOnMarks,
  priceAll,
  settlementsOf,
  type Net,
  type Spec,
} from "../src/polish/tries/sweep.js";
import { fortyOf } from "../src/polish/writers.js";
import { loadCoins } from "../src/waveh/coins.js";
import type { Counted } from "../src/waveh/fills.js";
import type { FundingRow } from "../src/waveh/funding.js";
import { TEST_START } from "../src/waveh/instants.js";
import { levelsOf, pricePosition, type Trade } from "../src/waveh/price.js";
import { marksLine, markAt } from "../src/waveh/report.js";
import { waveSpots } from "../src/waveh/positions.js";
import { bySlice } from "../src/waveh/slices.js";
import { addr } from "./polish-world.js";

const coins = loadCoins();
let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const SOL = 5;
const KPEPE = 15;

/** A world in memory: the 40 coins' price columns from marks (NaN where none) and trades' last prices, funding rows, a tape of trades. */
function world(o: {
  start: number;
  minutes: number;
  marks?: Map<string, Float64Array>;
  last?: Map<string, Float64Array>;
  funding?: Map<string, FundingRow[]>;
  tape?: Map<string, (Trade & { side: 1 | -1 })[]>;
  counted?: Counted[];
}): Data & { calls: string[] } {
  const calls: string[] = [];
  const nan = new Float64Array(o.minutes).fill(NaN);
  const counted = [...(o.counted ?? [])].sort(byM4);
  const empty = new Float64Array(counted.length);
  const forced: Forced = {
    t: Float64Array.of(),
    coin: Uint16Array.of(),
    user: Uint32Array.of(),
    side: Int8Array.of(),
    backstop: Uint8Array.of(),
    coins: [],
    px: empty.map(() => 100),
    sz: empty.map(() => 1),
    markPx: empty.map(() => 100),
  };
  return {
    kit,
    start: o.start,
    minutes: o.minutes,
    coins,
    counted,
    forced,
    pc: new Map(
      [...fortyOf(coins)].map((c) => [
        c,
        priceColumn(o.marks?.get(c) ?? nan, o.last?.get(c) ?? nan),
      ]),
    ),
    column: (_coin, name) =>
      name.endsWith("Ntl") ? new Float64Array(o.minutes) : nan,
    funding: (coin) => o.funding?.get(coin) ?? [],
    levels: (coin, buy, x) => {
      calls.push(`${coin}|${buy ? "B" : "A"}|${x}`);
      return levelsOf(
        (o.tape?.get(coin) ?? []).filter(
          (t) => t.side === (buy ? 1 : -1) && t.t >= x && t.t < x + 60_000,
        ),
      );
    },
    calls,
  };
}

const trade = (t: number, px: number, sz: number, side: 1 | -1, tid = 1) => ({
  t,
  px,
  sz,
  side,
  user: addr(tid),
  tid: String(tid),
});

describe("the net at the tape", () => {
  const start = Date.parse("2025-09-10T00:00:00Z");
  const minutes = 3 * 1440;
  const marks = Float64Array.from(
    { length: minutes },
    (_, k) => 100 + 3 * Math.sin(k / 97) + (k % 5) / 10,
  );
  const hours: FundingRow[] = [];
  for (let h = start + HOUR_MS; h < start + minutes * MINUTE_MS; h += HOUR_MS)
    if (h !== start + 30 * HOUR_MS)
      hours.push([h, ((h / HOUR_MS) % 7) * 1e-5 - 2e-5, h + 17]);
  const xIn = start + 10 * HOUR_MS + 7 * MINUTE_MS + 5_000;
  const xOut = xIn + DAY_MS;
  const tape = [
    trade(xIn + 100, 101, 3, 1),
    trade(xIn + 200, 101.5, 10, 1),
    trade(xIn + 300, 100.5, 4, -1),
    trade(xIn + 400, 100.25, 8, -1),
    trade(xOut + 50, 103, 20, -1),
    trade(xOut + 60, 102, 2, 1),
    trade(xOut + 70, 102.5, 30, 1),
    // Depth short: $300 at the entry 6 hours later.
    trade(xIn + 6 * HOUR_MS + 10, 100, 3, 1),
    trade(xOut + 6 * HOUR_MS + 10, 99, 50, -1),
  ];
  const mk = (): Market =>
    kit.panel.marketFrom({
      iid: SOL,
      symbol: "SOL",
      category: "crypto",
      start,
      end: start + minutes * MINUTE_MS,
      firstTrade: null,
      retired: null,
      marks: Array.from(marks, (v) => (Number.isNaN(v) ? null : v)),
      klines: { minute: [], trades: [], volume: [] },
      funding: hours,
    });

  it("is WAVE-H's pricePosition on the same trades, to the bit, every settlement marked; unpriced where the tape is empty", async () => {
    const d = world({
      start,
      minutes,
      marks: new Map([["SOL", marks]]),
      funding: new Map([["SOL", hours]]),
      tape: new Map([["SOL", tape]]),
    });
    const specs: Spec[] = [
      { iid: SOL, dir: 1, xIn, xOut },
      { iid: SOL, dir: -1, xIn, xOut },
      { iid: SOL, dir: 1, xIn: xIn + 6 * HOUR_MS, xOut: xOut + 6 * HOUR_MS },
      { iid: SOL, dir: 1, xIn: xIn + 2 * HOUR_MS, xOut: xOut + 2 * HOUR_MS },
      { iid: SOL, dir: 1, xIn, xOut: xOut + 3 * HOUR_MS },
    ];
    const nets = await priceAll(d, specs, () => Promise.resolve());
    const quote = (x: number, buy: boolean) => ({
      source: "tape" as const,
      why: "no book file" as const,
      trades: tape.filter(
        (t) => t.side === (buy ? 1 : -1) && t.t >= x && t.t < x + 60_000,
      ),
    });
    specs.forEach((sp, i) => {
      const w = pricePosition(kit, mk(), {
        dir: sp.dir,
        xIn: sp.xIn,
        xOut: sp.xOut,
        entry: quote(sp.xIn, sp.dir > 0),
        exit: quote(sp.xOut, sp.dir < 0),
        base: null,
      });
      const n = nets[i]!;
      expect([n.net, n.gross, n.fees, n.funding], `${i}`).toEqual([
        w.net,
        w.gross,
        w.fees,
        w.funding,
      ]);
      expect(n.unpriced).toBe(w.unpriced?.replace("no book and ", "") ?? null);
      if (n.net !== null) {
        expect(n.missing).toBe(w.fundingMissing);
        expect(n.short).toBe(w.depthShort);
      }
    });
    expect(nets.map((n) => [n.unpriced, n.short, n.missing])).toEqual([
      [null, false, 1],
      [null, false, 1],
      [null, true, 1],
      ["no trade at the entry", false, 0],
      ["no trade at the exit", false, 0],
    ]);
  });

  it("charges a settlement without a mark at the trade's price, the kit's funding everywhere a mark is", () => {
    // The minute before the hour 20:00 and the 5 before it lose their marks; a trade at 19:59:30.
    const h = start + 20 * HOUR_MS;
    const holed = Float64Array.from(marks);
    for (let k = (h - start) / MINUTE_MS - 6; k < (h - start) / MINUTE_MS; k++)
      holed[k] = NaN;
    const last = new Float64Array(minutes).fill(NaN);
    last[(h - start) / MINUTE_MS - 1] = 77;
    const d = world({
      start,
      minutes,
      marks: new Map([["SOL", holed]]),
      last: new Map([["SOL", last]]),
      funding: new Map([["SOL", hours]]),
    });
    const st = settlementsOf(d, "SOL");
    const m = kit.panel.marketFrom({
      iid: SOL,
      symbol: "SOL",
      category: "crypto",
      start,
      end: start + minutes * MINUTE_MS,
      firstTrade: null,
      retired: null,
      marks: Array.from(holed, (v) => (Number.isNaN(v) ? null : v)),
      klines: { minute: [], trades: [], volume: [] },
      funding: hours,
    });
    // Before the hour without a mark, the kit's to the bit (the same running sums); after it, the same window less
    // the same rows, to rounding; over it, the kit has no sum and this one charges the trade's price.
    for (const [a, b] of [
      [start, start + 10 * HOUR_MS],
      [start + HOUR_MS, start + HOUR_MS],
      [start - 1, start + 19 * HOUR_MS + 1],
    ] as const)
      expect(fundingBetween(st, a, b)).toEqual(
        kit.panel.fundingBetween(m, a, b),
      );
    const after = fundingBetween(
      st,
      start + 25 * HOUR_MS,
      start + 40 * HOUR_MS + 1,
    );
    const kits = kit.panel.fundingBetween(
      m,
      start + 25 * HOUR_MS,
      start + 40 * HOUR_MS + 1,
    );
    expect(after.missing).toBe(kits.missing);
    expect(Math.abs(after.sum - kits.sum)).toBeLessThanOrEqual(
      1e-12 * Math.abs(kits.sum),
    );
    expect(kit.panel.fundingBetween(m, xIn, xOut).sum).toBeNaN();
    const row = hours.find((r) => r[0] === h)!;
    const over = fundingBetween(st, h - 1, h);
    expect(over.missing).toBe(0);
    expect(over.sum).toBeCloseTo(row[1] * 77, 15);
    const nan = {
      ...st,
      unpriced: st.unpriced.map((u, i) => (st.hour[i]! >= h ? u + 1 : u)),
    };
    expect(fundingBetween(nan, h - 1, h).sum).toBeNaN();
    expect(fundingBetween(nan, start, h - 1).sum).toBe(
      fundingBetween(st, start, h - 1).sum,
    );
  });
});

describe("the sweep", () => {
  it("reads each distinct leg once, by coin and instant, a sell before a buy at one instant, pace at each coin-month", async () => {
    const start = Date.parse("2025-09-29T00:00:00Z");
    const d = world({ start, minutes: 10 * 1440 });
    const t = Date.parse("2025-09-30T12:00:00Z");
    const specs: Spec[] = [
      { iid: KPEPE, dir: 1, xIn: t, xOut: t + DAY_MS },
      { iid: SOL, dir: -1, xIn: t + 5, xOut: t + DAY_MS },
      { iid: SOL, dir: 1, xIn: t + 5, xOut: t + HOUR_MS },
      { iid: SOL, dir: 1, xIn: t + 5, xOut: t + DAY_MS },
    ];
    let paces = 0;
    const seen: [string, number][] = [];
    await eachLeg(
      d,
      specs,
      () => {
        paces += 1;
        return Promise.resolve();
      },
      (leg, _levels, uses) =>
        seen.push([
          `${leg.coin}|${leg.buy ? "B" : "A"}|${leg.x - t}`,
          uses.length,
        ]),
    );
    expect(seen).toEqual([
      ["SOL|A|5", 1],
      ["SOL|B|5", 2],
      ["SOL|A|3600000", 1],
      ["SOL|A|86400000", 1],
      ["SOL|B|86400000", 1],
      ["kPEPE|B|0", 1],
      ["kPEPE|A|86400000", 1],
    ]);
    expect(d.calls).toHaveLength(7);
    // SOL's September, SOL's October, kPEPE's September, kPEPE's October.
    expect(paces).toBe(4);
  });

  it("gives the gross on marks at the ends of the legs' minutes", () => {
    const start = Date.parse("2025-09-10T00:00:00Z");
    const marks = Float64Array.from({ length: 1440 }, (_, k) => 100 + k);
    const d = world({ start, minutes: 1440, marks: new Map([["SOL", marks]]) });
    const sp: Spec = {
      iid: SOL,
      dir: -1,
      xIn: start + 59_999,
      xOut: start + 600_000,
    };
    expect(grossOnMarks(d, sp, "SOL")).toBe(-1 * ((110 / 100 - 1) * 1e4));
    expect(
      grossOnMarks(d, { ...sp, xOut: start + 1440 * MINUTE_MS }, "SOL"),
    ).toBeNaN();
  });
});

describe("a rule's exits and positions", () => {
  const start = Date.parse("2025-09-10T00:00:00Z");
  const K = 600;
  const at = (k: number, ms = 0) => start + k * MINUTE_MS + ms;
  const pc = new Float64Array(3 * 1440).fill(NaN);
  const fill = (t: number, side: 1 | -1, a = 1): Counted => ({
    t,
    iid: SOL,
    addr: addr(a),
    side,
    tid: "1",
    method: "market",
  });
  const entry = (f: Counted): Entry => ({
    slice: 0,
    M: 1,
    fill: f,
    accounts: [],
  });

  it("X1: out at the first minute end after x_in that gives back half the hour's forced move, a minute without a price never triggering; X2 at a 1,000 bps fall", () => {
    pc.fill(NaN);
    pc[K - 61] = 100;
    pc[K - 1] = 90;
    pc[K + 5] = 94.99;
    pc[K + 6] = NaN;
    pc[K + 7] = 95;
    const d = world({
      start,
      minutes: 3 * 1440,
      marks: new Map([["SOL", pc]]),
    });
    const e = entry(fill(at(K), -1));
    const xIn = at(K) + ENTRY_DELAY_MS;
    expect(targetExit(d, pc, e, xIn, xIn + DAY_MS)).toBe(at(K + 8));
    // A minute end at x_in is not after it; σ·B ≤ 0 holds to x_out; P(t − 60 min) unknown leaves it out.
    expect(targetExit(d, pc, e, at(K + 8), at(K + 8) + DAY_MS)).toBe(
      at(K + 8) + DAY_MS,
    );
    expect(targetExit(d, pc, entry(fill(at(K), 1)), xIn, xIn + DAY_MS)).toBe(
      xIn + DAY_MS,
    );
    // No forced move (B = 0): held to x_out, whatever the price does after x_in.
    pc[K - 61] = 90;
    expect(targetExit(d, pc, e, xIn, xIn + DAY_MS)).toBe(xIn + DAY_MS);
    pc[K - 61] = NaN;
    expect(targetExit(d, pc, e, xIn, xIn + DAY_MS)).toBeNull();
    // X2: from P(e₁) = 100 at the minute after x_in, out where a long has lost 1,000 bps.
    pc.fill(NaN);
    pc[K + 2] = 100;
    pc[K + 20] = 90.0001;
    pc[K + 30] = 89.99;
    expect(stopExit(d, pc, 1, xIn, xIn + DAY_MS)).toBe(at(K + 31));
    expect(stopExit(d, pc, -1, xIn, xIn + DAY_MS)).toBe(xIn + DAY_MS);
    pc[K + 2] = NaN;
    expect(stopExit(d, pc, 1, xIn, xIn + DAY_MS)).toBeNull();
  });

  it("places a rule: its M's entries in the part, its filters (an unknown feature counted), its delay, hold and exit", () => {
    const t0 = Date.parse("2025-09-10T09:00:00Z");
    // Two accounts' forced sells a minute apart in each wave, two waves a day apart; a forced buy wave at 10:00.
    const counted: Counted[] = [];
    for (const [t, side] of [
      [t0, -1],
      [t0 + DAY_MS, -1],
      [t0 + HOUR_MS + 60_000, 1],
    ] as const)
      counted.push(fill(t, side, 2), fill(t + 60_000, side, 4));
    const d = world({
      start: Date.parse("2025-09-01T00:00:00Z"),
      minutes: 20 * 1440,
      counted,
    });
    const cuts = {} as Parameters<typeof place>[4];
    const b0 = place(d, B0, E, 1, cuts);
    expect(b0.specs.map((s) => [s.dir, s.xIn - t0, s.xOut - s.xIn])).toEqual([
      [1, 180_000, DAY_MS],
      [-1, HOUR_MS + 240_000, DAY_MS],
      [1, DAY_MS + 180_000, DAY_MS],
    ]);
    const n = place(
      d,
      ruleOf("N", [tryNamed("S1"), tryNamed("D0"), tryNamed("H4")]),
      E,
      1,
      cuts,
    );
    expect(n.specs.map((s) => [s.dir, s.xIn - t0, s.xOut - s.xIn])).toEqual([
      [1, 70_000, 4 * HOUR_MS],
      [1, DAY_MS + 70_000, 4 * HOUR_MS],
    ]);
    // W5 knows no notional here: every position left out and counted; X1 without prices likewise.
    expect(place(d, ruleOf("W5", [tryNamed("W5")]), E, 1, cuts)).toMatchObject({
      specs: [],
      left: { "W5 unknown": 3 },
    });
    expect(place(d, ruleOf("X1", [tryNamed("X1")]), E, 1, cuts).left).toEqual({
      "X1 unknown": 3,
    });
    // W2 doubles M: accounts 2 and 4 share slice 0 of 2, so its entries are B0's.
    expect(place(d, ruleOf("W2", [tryNamed("W2")]), E, 1, cuts).specs).toEqual(
      b0.specs,
    );
    // Accounts 2 and 3 fall in slices 0 and 1 of 2: a wave at M = 1, none at W2's 2.
    const split = world({
      start: Date.parse("2025-09-01T00:00:00Z"),
      minutes: 20 * 1440,
      counted: [fill(t0, -1, 2), fill(t0 + 60_000, -1, 3)],
    });
    expect(place(split, B0, E, 1, cuts).specs).toHaveLength(1);
    expect(
      place(split, ruleOf("W2", [tryNamed("W2")]), E, 1, cuts).specs,
    ).toEqual([]);
    // The dry sweep's legs: B0's and its 8 delay and hold variants', and W2's at 2M (none here).
    expect(fixedSpecs(split, 1)).toHaveLength(9);
    // N4 at the rule's own x_in: the entry at 09:01 fell from 100 to 90 in the hour; by B0's x_in nothing came back,
    // by D60's the price is 96, past half of the fall: left out of N = D60 + N4 only.
    const s4 = Date.parse("2025-09-01T00:00:00Z");
    const mark = new Float64Array(20 * 1440).fill(NaN);
    const row = (iso: string) => (Date.parse(iso) - s4) / MINUTE_MS;
    mark[row("2025-09-10T08:00:00Z")] = 100;
    mark[row("2025-09-10T09:00:00Z")] = 90;
    mark[row("2025-09-10T10:00:00Z")] = 96;
    const bounce = world({
      start: s4,
      minutes: 20 * 1440,
      marks: new Map([["SOL", mark]]),
      counted: [fill(t0, -1, 2), fill(t0 + 60_000, -1, 4)],
    });
    expect(
      place(bounce, ruleOf("N4", [tryNamed("N4")]), E, 1, cuts).specs,
    ).toHaveLength(1);
    expect(
      place(bounce, ruleOf("N", [tryNamed("D60"), tryNamed("N4")]), E, 1, cuts)
        .specs,
    ).toEqual([]);
    expect(
      ruleOf("N", [tryNamed("W2"), tryNamed("X1"), tryNamed("T1")]),
    ).toEqual({
      ...B0,
      name: "N",
      M2: true,
      target: true,
      filters: ["T1"],
    });
  });
});

describe("the E step's checks", () => {
  const net = (x: number | null): Net => ({
    net: x,
    unpriced: x === null ? "no trade at the exit" : null,
    gross: null,
    fees: null,
    funding: null,
    missing: 0,
    short: false,
    pIn: null,
    pOut: null,
  });
  const e = (slice: number, day: number, iid: number): Entry => ({
    slice,
    M: 2,
    fill: {
      t: Date.parse("2025-09-01T10:00:00Z") + day * DAY_MS,
      iid,
      addr: addr(1),
      side: -1,
      tid: "1",
      method: "market",
    },
    accounts: [],
  });

  it("the calibration: b over slice 0's positions the look priced at the book, re-basing only above +10 bps", () => {
    const entries = [
      e(0, 0, SOL),
      e(0, 1, KPEPE),
      e(1, 2, SOL),
      e(0, 3, SOL),
      e(0, 4, KPEPE),
    ];
    const book = new Map(
      entries.map((x) => [`${x.fill.t}|${x.fill.iid}`, 100]),
    );
    book.delete(`${entries[4]!.fill.t}|${KPEPE}`);
    const at = (gap: number) =>
      calibrationOf(
        kit,
        entries,
        [net(100 + gap), net(100 + gap + 4), net(999), net(null), net(0)],
        book,
      );
    expect(at(10)).toMatchObject({
      positions: 3,
      unpriced: 1,
      stat: { n: 2, mean: 12 },
      rebasedBy: 12,
    });
    // b exactly +10: not above it.
    expect(at(8).rebasedBy).toBe(0);
    expect(at(8.000001).rebasedBy).toBeCloseTo(10.000001, 9);
    expect(at(-50).rebasedBy).toBe(0);
  });

  it("the reproduction: B0 over TEST on marks is WAVE-H's own EVERY SLICE line, to 1e-9 bps", () => {
    const start = TEST_START - DAY_MS;
    const minutes = 40 * 1440;
    const marks = new Map(
      ["SOL", "kPEPE"].map((c, j) => [
        c,
        Float64Array.from(
          { length: minutes },
          (_, k) => 50 + j + 7 * Math.sin(k / (300 + j)),
        ),
      ]),
    );
    const counted: Counted[] = [];
    for (let i = 0; i < 30; i++)
      for (const [iid, a] of [
        [SOL, 2 + 2 * i],
        [KPEPE, 3 + 2 * i],
      ] as const) {
        const t = TEST_START - HOUR_MS + i * 0.9 * DAY_MS + iid * 1_000;
        counted.push(
          {
            t,
            iid,
            addr: addr(a),
            side: i % 2 === 0 ? -1 : 1,
            tid: String(i),
            method: "market",
          },
          {
            t: t + 1_000,
            iid,
            addr: addr(a + 100),
            side: i % 2 === 0 ? -1 : 1,
            tid: String(i + 99),
            method: "market",
          },
        );
      }
    const d = world({ start, minutes, marks, counted });
    const slices = bySlice(d.counted, 2);
    const all = entriesOf(slices);
    const markets = new Map(
      ["SOL", "kPEPE"].map((c, j) => [
        [SOL, KPEPE][j]!,
        kit.panel.marketFrom({
          iid: [SOL, KPEPE][j]!,
          symbol: c,
          category: "crypto",
          start,
          end: start + minutes * MINUTE_MS,
          firstTrade: null,
          retired: null,
          marks: Array.from(marks.get(c)!),
          klines: { minute: [], trades: [], volume: [] },
          funding: [],
        }),
      ]),
    );
    const line = marksLine(
      markAt(kit, markets),
      slices.flatMap((fills, k) =>
        waveSpots(k, fills, TEST_START, Date.parse("2026-05-28T00:00:00Z")),
      ),
    );
    expect(line.positions).toBeGreaterThan(40);
    const want = {
      positions: line.positions,
      mean: line.onMarks!.mean,
      se: line.onMarks!.se!,
    };
    expect(reproductionOf(d, all, { everySlice: want })).toEqual({
      equal: true,
      positions: line.positions,
      onMarks: line.positions,
      difference: { mean: 0, se: 0 },
    });
    expect(
      reproductionOf(d, all, {
        everySlice: { ...want, mean: want.mean + 2e-9 },
      }).equal,
    ).toBe(false);
    expect(
      reproductionOf(d, all, {
        everySlice: { ...want, positions: want.positions + 1 },
      }).equal,
    ).toBe(false);
    // The first TEST position without a price at its exit (6 minutes without a mark): n must be both the positions'
    // count and the count priced on marks.
    const sp = specsOf(all.filter((e) => e.fill.t >= TEST_START))[0]!;
    const coin = sp.iid === SOL ? "SOL" : "kPEPE";
    const holed = Float64Array.from(marks.get(coin)!);
    const k = Math.floor((sp.xOut - start) / MINUTE_MS);
    holed.fill(NaN, k - 5, k + 1);
    const h = world({
      start,
      minutes,
      marks: new Map([...marks, [coin, holed]]),
      counted,
    });
    const at0 = reproductionOf(h, all, {
      everySlice: { positions: 0, mean: 0, se: 0 },
    });
    expect(at0).toMatchObject({
      positions: line.positions,
      onMarks: line.positions - 1,
    });
    const s = { mean: at0.difference.mean!, se: at0.difference.se! };
    for (const positions of [line.positions, line.positions - 1])
      expect(
        reproductionOf(h, all, { everySlice: { positions, ...s } }).equal,
      ).toBe(false);
  });

  it("the E step on one wave: W2 placed at 2M, where the wave's two accounts part; the gain floor from B0's mean", async () => {
    // Accounts 2 and 3 a minute apart: slice 0 at M = 1, slices 0 and 1 at 2. B0 buys at 100 and sells at 102.5.
    const t0 = Date.parse("2025-09-10T09:00:00Z");
    const start = Date.parse("2025-09-01T00:00:00Z");
    const minutes = 20 * 1440;
    const xIn = t0 + 60_000 + ENTRY_DELAY_MS;
    const sell = (t: number, a: number): Counted => ({
      t,
      iid: SOL,
      addr: addr(a),
      side: -1,
      tid: String(a),
      method: "market",
    });
    const d = world({
      start,
      minutes,
      marks: new Map([["SOL", new Float64Array(minutes).fill(100)]]),
      counted: [sell(t0, 2), sell(t0 + 60_000, 3)],
      tape: new Map([
        [
          "SOL",
          [
            trade(xIn + 1, 100, 1e6, 1),
            trade(xIn + DAY_MS + 1, 102.5, 1e6, -1, 2),
          ],
        ],
      ]),
    });
    const { slices, all } = entriesAt(d, 1);
    const entries = all.filter((e) => inPart(E, e.fill.t));
    const cuts = JSON.parse(
      JSON.stringify(
        cutsOf(
          d,
          featuresOf(d, { entries, slices, all, delay: ENTRY_DELAY_MS }),
        ),
      ),
    ) as Parameters<typeof eOf>[1]["cuts"];
    const { out } = await eOf(d, {
      M: 1,
      cuts,
      book: new Map(),
      expect: { everySlice: { positions: 1, mean: 0, se: null } },
      pace: () => Promise.resolve(),
      phase: () => {},
    });
    const net = (2.5 * 10 - (0.00045 * 1_000 + 0.00045 * 1_025)) * 10;
    expect(out.b0).toMatchObject({ positions: 1, priced: 1 });
    expect(out.b0.stat!.mean).toBeCloseTo(net, 9);
    expect(out.gain).toBeCloseTo(net / 10, 9);
    expect(out.tries.find((x) => x.name === "W2")!.positions).toBe(0);
  });

  it("reads the look's book nets: WAVE-H's positions priced at the book at both ends, held to the gates' SHA-256", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "polish-look-"));
    const line = (
      set: string,
      t: number,
      sources: (string | null)[],
      n: number | null,
    ) =>
      JSON.stringify({
        set,
        spot: { slice: 0, t, iid: SOL },
        priced: {
          net: n,
          legs: sources.map((s) => (s === null ? null : { source: s })),
        },
        legs: [],
      });
    const bytes = gzipSync(
      [
        line("WAVE-H", 1, ["book", "book"], 12.5),
        line("WAVE-H", 2, ["book", "tape"], 1),
        line("WAVE-H", 3, ["book", "book"], null),
        line("SIZING", 4, ["book", "book"], 1),
        line("WAVE-H", 5, [null, null], null),
      ].join("\n") + "\n",
    );
    writeFileSync(path.join(dir, "positions.jsonl.gz"), bytes);
    const sha = (b: Buffer) => createHash("sha256").update(b).digest("hex");
    expect([...bookNets(dir, sha(bytes))]).toEqual([[`1|${SOL}`, 12.5]]);
    expect(() => bookNets(dir, "0".repeat(64))).toThrow(
      "is not the one the gates read",
    );
  });
});
