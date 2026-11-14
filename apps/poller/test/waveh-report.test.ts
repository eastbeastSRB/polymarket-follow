/**
 * WAVE-H's lines beside and prints (rules.md H13, H14), each a pure function
 * pinned by hand: a line on marks (the gross on marks, the excess's sign, the
 * positions lacking either), WAVE-H's outcome in MARKET-1's position shape,
 * the day with the most positions, M BY MONTH's window, TEST's months, and
 * R9's counts kept inside their window.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { loadResearch, type Research } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import type { Counted } from "../src/waveh/fills.js";
import { SIZING_START, TEST_END, TEST_START } from "../src/waveh/instants.js";
import { waveSpots, type Spot } from "../src/waveh/positions.js";
import { loadCoins } from "../src/waveh/coins.js";
import type { Priced } from "../src/waveh/price.js";
import { burstiness, type Outcome } from "../src/waveh/rehearse.js";
import {
  asPosition,
  dayMost,
  linesBeside,
  markAt,
  marksLine,
  monthM,
  monthWindow,
  netLine,
  testMonths,
  type MarkAt,
} from "../src/waveh/report.js";
import { addr } from "./waveh-world.js";

let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const T0 = Date.parse("2025-09-10T00:00:00Z");
const spot = (o: Partial<Spot>): Spot => ({
  slice: 0,
  iid: 5,
  t: T0 + HOUR_MS,
  side: -1,
  dir: 1,
  xIn: T0 + HOUR_MS + 120_000,
  xOut: T0 + 25 * HOUR_MS + 120_000,
  method: "market",
  accounts: [],
  ...o,
});
const priced = (net: number | null, o: Partial<Priced> = {}): Priced => ({
  net,
  unpriced: net === null ? "no book and no trade at the exit" : null,
  gross: net,
  fees: 0,
  funding: 0,
  fundingMissing: 0,
  grossOnMarks: null,
  excess: null,
  entryCost: null,
  legs: [null, null],
  depthShort: false,
  ...o,
});

describe("a line on marks (H13)", () => {
  // 100 on the first day, 101 after: a long across the step gains 100 bps on marks.
  const market = () =>
    kit.panel.marketFrom({
      iid: 5,
      symbol: "SOL",
      category: "crypto",
      start: T0,
      end: T0 + 3 * DAY_MS,
      firstTrade: null,
      retired: null,
      marks: Array.from({ length: (3 * DAY_MS) / MINUTE_MS }, (_, i) =>
        i < 1_440 ? 100 : 101,
      ),
      klines: { minute: [], trades: [], volume: [] },
      funding: [],
    });
  const m = (): MarkAt => {
    const mk = market();
    return {
      kit,
      market: (iid) => (iid === 6 ? undefined : mk),
      base: (iid) => (iid === 5 ? 10 : null),
    };
  };

  it("reads the gross on marks and the excess against BASE by the position's direction", () => {
    const long = marksLine(m(), [spot({ dir: 1 })]);
    expect(long.onMarks?.mean).toBeCloseTo(100, 9);
    expect(long.excess?.mean).toBeCloseTo(90, 9);
    const short = marksLine(m(), [spot({ dir: -1, side: 1 })]);
    expect(short.onMarks?.mean).toBeCloseTo(-100, 9);
    expect(short.excess?.mean).toBeCloseTo(-90, 9);
  });

  it("counts the positions without marks and without BASE, the days, coins and slices", () => {
    const line = marksLine(m(), [
      spot({}),
      spot({ iid: 7, slice: 3 }),
      spot({ iid: 6, t: T0 + DAY_MS }),
    ]);
    expect(line).toMatchObject({
      positions: 3,
      days: 2,
      coins: 3,
      slices: 2,
      withoutMarks: 1,
      withoutBase: 1,
      excessLow: null,
    });
    expect(line.onMarks?.n).toBe(2);
    expect(line.onMarks?.mean).toBeCloseTo(100, 9);
    expect(line.excess?.n).toBe(1);
    expect(line.excess?.mean).toBeCloseTo(90, 9);
  });
});

describe("the net lines (H13, H14)", () => {
  const leg = (price: number, deepest: number, short = false) => ({
    source: "tape" as const,
    why: "stale" as const,
    price,
    deepest,
    short,
    at: [1, 2],
  });

  it("gives MARKET-1's position shape: the legs' prices and depths, no mark leg", () => {
    const o: Outcome = {
      spot: spot({ accounts: [addr(1), addr(2)] }),
      priced: priced(12, { legs: [leg(100, 1), leg(101, 2)] }),
      legs: [],
    };
    expect(asPosition(o)).toEqual({
      line: "WAVE",
      iid: 5,
      t: o.spot.t,
      side: -1,
      dir: 1,
      xIn: o.spot.xIn,
      xOut: o.spot.xOut,
      fillIid: 5,
      accounts: [addr(1), addr(2)],
      coins: 0,
      priced: {
        ...o.priced,
        legs: undefined,
        pIn: 100,
        pOut: 101,
        markLegs: [null, null],
        deepest: [1, 2],
      },
    });
    expect(asPosition({ ...o, priced: null }).priced).toBeNull();
  });

  it("adds the slices, the tape legs by reason and the depth-short legs to M13's prints", () => {
    const line = netLine(kit, [
      {
        spot: spot({}),
        priced: priced(10, { legs: [leg(1, 0, true), leg(1, 0)] }),
        legs: [
          {
            side: "buy",
            source: "tape",
            why: "stale",
            age: 11_000,
            file: null,
            trades: 1,
            tids: ["1"],
            tapeMinusBook: null,
          },
        ],
      },
      { spot: spot({ slice: 2 }), priced: priced(20), legs: [] },
    ]);
    expect(line).toMatchObject({
      positions: 2,
      priced: 2,
      slices: 2,
      tapeLegs: { stale: 1 },
      shortLegs: 1,
    });
  });

  it("names the day with the most positions, the mean without it and with each day alike", () => {
    const at = (day: number, net: number | null, iid = 5): Outcome => ({
      spot: spot({ t: T0 + day * DAY_MS + HOUR_MS, iid }),
      priced: priced(net),
      legs: [],
    });
    const d = dayMost(kit, [
      at(0, 10),
      at(0, 20, 6),
      at(0, 30, 7),
      at(1, -40),
      at(2, 5, 6),
      at(2, null),
    ])!;
    expect(d).toMatchObject({
      day: "2025-09-10",
      positions: 3,
      share: 0.5,
      fiveBusiestShare: 1,
    });
    expect(d.without.mean).toBeCloseTo(-17.5, 9);
    expect(d.daysAlike.mean).toBeCloseTo(-5, 9);
    expect(d.daysAlike.days).toBe(3);
    expect(dayMost(kit, [])).toBeNull();
  });
});

describe("M BY MONTH and TEST's months (H13)", () => {
  it("spans each calendar month of TEST inside TEST", () => {
    const months = testMonths();
    expect(months.length).toBe(10);
    expect(months[0]).toEqual({
      month: "2025-08",
      from: TEST_START,
      to: Date.parse("2025-09-01T00:00:00Z"),
    });
    expect(months[9]).toEqual({
      month: "2026-05",
      from: Date.parse("2026-05-01T00:00:00Z"),
      to: TEST_END,
    });
  });

  it("scans the 68 days before the month, from SIZING's start at the earliest, over the window's days", () => {
    // 923 lone fills 90 minutes apart from 2025-05-26. August's window is SIZING's,
    // 67.42 days: r(3) = 923 ÷ 3 ÷ 67.42 = 4.56 is nearer 5.68 than r(2) = 6.85.
    // Over 68 days it would be r(2) = 6.79 against r(3) = 4.52: M 2.
    const T = Date.parse("2025-05-26T00:00:00Z");
    const counted: Counted[] = Array.from({ length: 923 }, (_, i) => ({
      t: T + i * 90 * MINUTE_MS,
      iid: 28,
      addr: addr(1_000 + i),
      side: -1,
      tid: String(i),
      method: "market",
    }));
    expect(monthM(counted, TEST_START)).toBe(3);
    // September's window starts 2025-06-25: 443 fills, r(1) = 443 ÷ 68 = 6.51.
    const sep = Date.parse("2025-09-01T00:00:00Z");
    expect(counted.filter((f) => f.t >= sep - 68 * DAY_MS).length).toBe(443);
    expect(monthM(counted, sep)).toBe(1);
    expect(monthWindow(sep)).toEqual({
      from: Date.parse("2025-06-25T00:00:00Z"),
      days: 68,
    });
    expect(monthWindow(TEST_START)).toEqual({
      from: SIZING_START,
      days: 67 + 10 / 24,
    });
  });
});

describe("BASE at a position (H10)", () => {
  it("reads the cell of x_in's 4-hour block, none where no minute had both marks", () => {
    // Marks only from 00:00 to 04:00 on three days from TEST's start, rising 1% a day.
    const mk = kit.panel.marketFrom({
      iid: 5,
      symbol: "SOL",
      category: "crypto",
      start: TEST_START,
      end: TEST_START + 3 * DAY_MS,
      firstTrade: null,
      retired: null,
      marks: Array.from({ length: (3 * DAY_MS) / MINUTE_MS }, (_, i) =>
        i % 1_440 < 240 ? 100 * 1.01 ** Math.floor(i / 1_440) : null,
      ),
      klines: { minute: [], trades: [], volume: [] },
      funding: [],
    });
    const at = markAt(kit, new Map([[5, mk]]));
    expect(at.base(5, TEST_START + HOUR_MS)).toBeCloseTo(100, 9);
    expect(at.base(5, TEST_START + 13 * HOUR_MS)).toBeNull();
    expect(at.base(6, TEST_START + HOUR_MS)).toBeNull();
    expect(at.market(5)).toBe(mk);
  });
});

describe("the lines beside (H13): which positions each takes", () => {
  it("splits WAVE-H and the slices' entries and episodes by line, side, method, month and coin", () => {
    const coins = loadCoins();
    const iid = (name: string) => coins.byName.get(name)!.assetId;
    const S = Date.parse("2025-09-10T00:00:00Z");
    const O = Date.parse("2025-10-10T00:00:00Z");
    const fill = (
      n: number,
      coin: string,
      side: 1 | -1,
      t: number,
      method = "market",
    ): Counted => ({
      t,
      iid: iid(coin),
      addr: addr(n),
      side,
      tid: String(n),
      method,
    });
    // M = 2: even accounts in slice 0, odd in slice 1.
    const counted = [
      // Before TEST (H4's order holds): in no TEST line, nor in TEST's counts by method.
      fill(14, "SOL", -1, Date.parse("2025-07-01T00:00:00Z")),
      fill(2, "SOL", -1, S),
      fill(4, "SOL", -1, S + 5 * MINUTE_MS),
      fill(12, "kPEPE", -1, S + 10 * MINUTE_MS, "backstop"),
      fill(1, "DOGE", -1, S + 2 * HOUR_MS),
      fill(3, "DOGE", -1, S + 2 * HOUR_MS + 5 * MINUTE_MS),
      fill(6, "SOL", 1, O),
      fill(8, "SOL", 1, O + 5 * MINUTE_MS),
    ];
    const slice0 = counted.filter((f) => BigInt(f.addr) % 2n === 0n);
    const spots = waveSpots(0, slice0, TEST_START, TEST_END);
    expect(spots.map((s) => [s.t, s.method])).toEqual([
      [S + 5 * MINUTE_MS, "market"],
      [S + 10 * MINUTE_MS, "backstop"],
      [O + 5 * MINUTE_MS, "market"],
    ]);
    const leg = (source: "book" | "tape") => ({
      side: "buy" as const,
      source,
      why: null,
      age: null,
      file: null,
      trades: 0,
      tids: [],
      tapeMinusBook: null,
    });
    const wave: Outcome[] = spots.map((s, i) => ({
      spot: s,
      priced: priced([10, -20, 30][i]!),
      legs: [leg("book"), leg(i === 1 ? "tape" : "book")],
    }));
    // SOL's marks: 100, then 110, 121 and 133.1 from S + 1h30, 2h30 and 3h30 on; no other coin's.
    const sol = kit.panel.marketFrom({
      iid: iid("SOL"),
      symbol: "SOL",
      category: "crypto",
      start: S,
      end: O + 2 * DAY_MS,
      firstTrade: null,
      retired: null,
      marks: Array.from({ length: (O + 2 * DAY_MS - S) / MINUTE_MS }, (_, i) =>
        i < 90 ? 100 : i < 150 ? 110 : i < 210 ? 121 : 133.1,
      ),
      klines: { minute: [], trades: [], volume: [] },
      funding: [],
    });
    const m: MarkAt = {
      kit,
      market: (k) => (k === iid("SOL") ? sol : undefined),
      base: () => null,
    };
    const out = linesBeside({
      m,
      coins,
      counted,
      M: 2,
      wave,
      sizingCoins: new Set(["SOL"]),
    });
    const n = (line: { positions: number }) => line.positions;
    expect(n(out.ALONE.B1)).toBe(4);
    expect(n(out.ALONE.B2)).toBe(3);
    expect(n(out.LATE["1 h"])).toBe(3);
    expect(n(out.LATE["3 h"])).toBe(3);
    // In at S + 1h05 (100) and 3h05 (121), out at 133.1; October's SOL flat; kPEPE unmarked.
    expect(out.LATE["1 h"]).toMatchObject({ withoutMarks: 1 });
    expect(out.LATE["1 h"].onMarks?.mean).toBeCloseTo((3_310 + 0) / 2, 6);
    expect(out.LATE["3 h"].onMarks?.mean).toBeCloseTo((1_000 + 0) / 2, 6);
    expect(n(out.SIDES["forced sells"])).toBe(2);
    expect(n(out.SIDES["forced buys"])).toBe(1);
    expect(
      out["EVERY SLICE"].slices.map((s) => [s.slice, s.positions]),
    ).toEqual([
      [0, 3],
      [1, 1],
    ]);
    expect(out["EVERY SLICE"].pooled).toMatchObject({
      positions: 4,
      slices: 2,
    });
    // Slice 0's SOL entries gain (+3,310 and 0); slice 1 has no marked position.
    expect(out["EVERY SLICE"].aboveZero).toBe(1);
    expect(out["M HALVED"]).toMatchObject({ M: 1, positions: 4 });
    expect(out["M DOUBLED"]).toMatchObject({ M: 4, positions: 1 });
    expect(out["M BY MONTH"].months.slice(0, 3)).toEqual([
      { month: "2025-08", M: 1, positions: 0 },
      { month: "2025-09", M: 1, positions: 3 },
      { month: "2025-10", M: 1, positions: 1 },
    ]);
    expect(n(out["M BY MONTH"].line)).toBe(4);
    expect(n(out.METHOD.backstop)).toBe(1);
    expect(out.METHOD.countedByMonth).toEqual({
      "2025-09|market": 4,
      "2025-09|backstop": 1,
      "2025-10|market": 2,
    });
    expect(out["THE LATE COINS"].coins.length).toBe(37);
    expect(n(out["THE LATE COINS"].line)).toBe(1);
    expect(
      out["BY MONTH"].slice(1, 3).map((b) => [b.month, n(b.line), b.M]),
    ).toEqual([
      ["2025-09", 2, 2],
      ["2025-10", 1, 2],
    ]);
    expect(out["BY MONTH"][1]!.entriesASliceADay).toBeCloseTo(3 / 2 / 30, 12);
    expect(out["THE BOOK AND THE TAPE"].book.positions).toBe(2);
    expect(out["THE BOOK AND THE TAPE"].tape.positions).toBe(1);
    expect(out["THE TAIL"].worst).toBe(-20);
  });
});

describe("R9's counts (burstiness)", () => {
  it("counts the accounts and fills inside its window only", () => {
    const from = Date.parse("2025-09-10T00:00:00Z");
    const to = from + DAY_MS;
    const fill = (n: number, t: number): Counted => ({
      t,
      iid: 5,
      addr: addr(n),
      side: -1,
      tid: String(n),
      method: "market",
    });
    const counted = [
      fill(1, from - 2 * HOUR_MS),
      fill(2, from + HOUR_MS),
      fill(3, from + HOUR_MS + 5 * MINUTE_MS),
    ];
    const b = burstiness(counted, 1, from, to);
    expect(b).toMatchObject({
      M: 1,
      entriesASliceADay: 1,
      episodesASliceADay: 1,
      accountsASliceADay: 2,
      fillsAnEpisode: 2,
    });
    expect(b.waveStateShare).toBeCloseTo(4 / 96, 12);
  });
});
