/**
 * The tries' features (src/polish/tries/features.ts) and the try log
 * (trylog.ts) on worlds in memory: each feature at its instant, a record
 * stamped after it never seen, a minute row unknown until its minute has
 * ended, each window's ends; the monthly ranks from the 30 days before the
 * month; the nine cuts by the kit's quantile; the log's 35 tries and each
 * test's comparison at its boundary.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { byM4 } from "../src/market1/fills.js";
import { loadResearch, type Research } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import type { Data } from "../src/polish/tries/data.js";
import { cutsOf, featuresOf } from "../src/polish/tries/features.js";
import type { Forced } from "../src/polish/tries/forced.js";
import type { Entry } from "../src/polish/tries/parts.js";
import {
  CUT_NAMES,
  CutsFile,
  FILTERS,
  TRIES,
  keeps,
} from "../src/polish/tries/trylog.js";
import { fortyOf } from "../src/polish/writers.js";
import { loadCoins } from "../src/waveh/coins.js";
import type { Counted } from "../src/waveh/fills.js";
import type { FundingRow } from "../src/waveh/funding.js";
import { bySlice } from "../src/waveh/slices.js";
import { addr } from "./polish-world.js";

const coins = loadCoins();
let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const START = Date.parse("2025-05-25T00:00:00Z");
const MINUTES = 40 * 1440;
const at = (k: number, ms = 0) => START + k * MINUTE_MS + ms;
const SOL = 5;
const KPEPE = 15;
const XRP = 25;
const nan = () => new Float64Array(MINUTES).fill(NaN);

const fill = (
  t: number,
  iid: number,
  a: number,
  side: 1 | -1,
  tid = 1,
): Counted => ({
  t,
  iid,
  addr: addr(a),
  side,
  tid: String(tid),
  method: "market",
});

type World = {
  counted?: Counted[];
  /** px, sz, markPx by counted fill (100, 1, 100 when not given). */
  quotes?: Map<Counted, [number, number, number]>;
  forced?: {
    t: number;
    coin: string;
    user: number;
    side: 1 | -1;
    backstop?: boolean;
  }[];
  pc?: Map<string, Float64Array>;
  columns?: Map<string, Float64Array>;
  funding?: Map<string, FundingRow[]>;
};

function dataOf(w: World): Data {
  const counted = [...(w.counted ?? [])].sort(byM4);
  const q = (f: Counted) => w.quotes?.get(f) ?? [100, 1, 100];
  const forced = w.forced ?? [];
  const names = ["BTC", "ETH", "SOL"];
  const f: Forced = {
    t: Float64Array.from(forced, (x) => x.t),
    coin: Uint16Array.from(forced, (x) => names.indexOf(x.coin)),
    user: Uint32Array.from(forced, (x) => x.user),
    side: Int8Array.from(forced, (x) => x.side),
    backstop: Uint8Array.from(forced, (x) => (x.backstop === true ? 1 : 0)),
    coins: names,
    px: Float64Array.from(counted, (c) => q(c)[0]),
    sz: Float64Array.from(counted, (c) => q(c)[1]),
    markPx: Float64Array.from(counted, (c) => q(c)[2]),
  };
  const pc = new Map(
    [...fortyOf(coins)].map((c) => [c, w.pc?.get(c) ?? nan()]),
  );
  return {
    kit,
    start: START,
    minutes: MINUTES,
    coins,
    counted,
    forced: f,
    pc,
    column: (coin, name) =>
      w.columns?.get(`${coin}|${name}`) ??
      (name.endsWith("Ntl") ? new Float64Array(MINUTES) : nan()),
    funding: (coin) => w.funding?.get(coin) ?? [],
    levels: () => [],
  };
}

const entryOf = (
  f: Counted,
  accounts: string[] = [f.addr],
  slice = 0,
): Entry => ({
  slice,
  M: 1,
  fill: f,
  accounts,
});

/** The features of `entries` (M = 1: every fill in slice 0), the entries' own list as every entry. */
function featuresFor(
  d: Data,
  entries: Entry[],
  delay = 120_000,
  all = entries,
) {
  return featuresOf(d, {
    entries,
    slices: bySlice(d.counted, 1),
    all,
    delay,
  });
}
const valueOf = (m: Map<string, Float64Array>, name: string) =>
  Array.from(m.get(name)!);

describe("the features at t", () => {
  it("S1, W1, W3, W4, T1 and T2: the side, the wave's accounts, the slice's coins and every account up to t, the hour and the day", () => {
    const t = Date.parse("2025-06-10T09:30:00Z");
    const e = fill(t, SOL, 1, -1);
    const buy = fill(t, XRP, 6, 1);
    const d = dataOf({
      counted: [
        fill(t - HOUR_MS, SOL, 2, -1),
        fill(t - HOUR_MS - 1, SOL, 3, -1),
        e,
        fill(t, KPEPE, 4, -1),
        buy,
        fill(t + 1, XRP, 5, -1),
      ],
    });
    const m = featuresFor(d, [
      entryOf(e, [addr(1), addr(2), addr(4)]),
      entryOf(buy),
    ]);
    expect(valueOf(m, "S1")).toEqual([-1, 1]);
    expect(valueOf(m, "W1")).toEqual([3, 1]);
    expect(valueOf(m, "W3")).toEqual([2, 1]);
    expect(valueOf(m, "W4")).toEqual([3, 1]);
    expect(valueOf(m, "T1")).toEqual([9, 9]);
    expect(valueOf(m, "T2")).toEqual([2, 2]);
    expect([...m.keys()]).toEqual(FILTERS);
  });

  it("R1–R4: the baskets of the minute ended by t, at least 5 coins, S = 0 unknown", () => {
    const K = 14 * 1440 + 720;
    const five = coins.list.slice(0, 5).map((c) => c.name);
    const pc = new Map<string, Float64Array>();
    for (const c of five)
      pc.set(
        c,
        Float64Array.from({ length: MINUTES }, (_, k) => (k < K ? 100 : 101)),
      );
    pc.set(
      "BTC",
      Float64Array.from({ length: MINUTES }, (_, k) => (k < K ? 200 : 210)),
    );
    const before = fill(at(K, 59_999), SOL, 1, -1);
    const after = fill(at(K + 1), SOL, 2, -1);
    const m = featuresFor(dataOf({ pc, counted: [before, after] }), [
      entryOf(before),
      entryOf(after),
    ]);
    // In minute K the minute ended by t is K − 1 (100): S7 = 0, unknown; from K + 1 every coin has moved 1%.
    expect(valueOf(m, "R1")[0]).toBeNaN();
    expect(valueOf(m, "R1")[1]).toBeCloseTo(-100, 9);
    expect(valueOf(m, "R2")[1]).toBeCloseTo(-100, 9);
    expect(valueOf(m, "R3")).toEqual([-0, -((210 / 200 - 1) * 1e4)]);
    expect(valueOf(m, "R4")[0]).toBe(0);
    expect(valueOf(m, "R4")[1]).toBeCloseTo(0.01, 12);
    // One coin without its price a week before: 4 coins, S7 and R4 unknown; S24 still 5.
    pc.get(five[4]!)![K - 10_080] = NaN;
    const hole = featuresFor(dataOf({ pc, counted: [after] }), [
      entryOf(after),
    ]);
    expect(valueOf(hole, "R1")[0]).toBeNaN();
    expect(valueOf(hole, "R4")[0]).toBeNaN();
    expect(valueOf(hole, "R2")[0]).toBeCloseTo(-100, 9);
  });

  it("W5, N2 and N9: the coin's fills of σ up to t, against the notional of the 10,080 minutes ended by t", () => {
    const t = Date.parse("2025-06-10T09:30:20Z");
    const k = (t - START - 20_000) / MINUTE_MS;
    const buy = Float64Array.from({ length: MINUTES }, () => 1);
    const sell = Float64Array.from({ length: MINUTES }, () => 2);
    // The minute t is in, and the one before the week, are never read.
    buy[k] = 1e9;
    buy[k - 10_081] = 1e9;
    const e = fill(t, SOL, 1, -1);
    const back = fill(t - HOUR_MS, SOL, 2, -1);
    const quotes = new Map<Counted, [number, number, number]>([
      [e, [100, 2, 101]],
      [back, [150, 2, 149]],
    ]);
    const counted = [
      e,
      back,
      fill(t - HOUR_MS - 1, SOL, 3, -1),
      fill(t + 1, SOL, 4, -1),
      fill(t, SOL, 5, 1),
    ];
    const columns = new Map([
      ["SOL|buyNtl", buy],
      ["SOL|sellNtl", sell],
    ]);
    const m = featuresFor(dataOf({ counted, quotes, columns }), [entryOf(e)]);
    expect(valueOf(m, "W5")).toEqual([(200 + 300) / ((3 * 10_080) / 168)]);
    expect(valueOf(m, "N2")).toEqual([200 / 3]);
    expect(valueOf(m, "N9")[0]).toBeCloseTo(
      ((1 / 101) * 1e4 + (-1 / 149) * 1e4) / 2,
      10,
    );
    // The week must start at or after the first fill file, 2025-05-25T14:00Z.
    const edge = Date.parse("2025-06-01T14:00:00Z");
    const early = fill(edge - 1, SOL, 6, -1);
    const first = fill(edge, SOL, 7, -1);
    const w = featuresFor(dataOf({ counted: [early, first], columns }), [
      entryOf(early),
      entryOf(first),
    ]);
    expect(valueOf(w, "W5")[0]).toBeNaN();
    expect(valueOf(w, "N2")[0]).toBeNaN();
    expect(valueOf(w, "W5")[1]).toBeGreaterThan(0);
    // No notional in the week: unknown.
    const none = featuresFor(dataOf({ counted: [e] }), [entryOf(e)]);
    expect(valueOf(none, "W5")[0]).toBeNaN();
    expect(valueOf(none, "N2")[0]).toBeNaN();
  });

  it("N1, N5, N6 and N10: the slice's burst, a backstop anywhere, the slice's last entry in the coin, BTC's and ETH's accounts", () => {
    const t = Date.parse("2025-06-10T09:30:00Z");
    const e = fill(t, SOL, 1, -1);
    const g = fill(t + DAY_MS, SOL, 1, -1);
    const counted = [
      e,
      fill(t - 600_000, KPEPE, 2, -1),
      fill(t - 600_001, XRP, 3, 1),
      g,
      fill(g.t - 600_001, KPEPE, 2, -1),
    ];
    const forced = [
      { t: t - HOUR_MS, coin: "SOL", user: 1, side: -1, backstop: true },
      { t: t, coin: "BTC", user: 1, side: -1 },
      { t: t - HOUR_MS, coin: "BTC", user: 2, side: -1 },
      { t: g.t, coin: "BTC", user: 3, side: -1 },
      { t: g.t - HOUR_MS - 1, coin: "SOL", user: 4, side: -1, backstop: true },
      { t: g.t + 1, coin: "SOL", user: 4, side: -1, backstop: true },
      { t: g.t, coin: "SOL", user: 5, side: 1, backstop: true },
      { t: g.t + 1, coin: "BTC", user: 6, side: -1 },
      { t: g.t - 5, coin: "ETH", user: 7, side: 1 },
      { t: g.t - 4, coin: "ETH", user: 8, side: 1 },
    ] as const;
    const all = [
      entryOf(fill(t - DAY_MS, SOL, 9, 1)),
      entryOf(fill(g.t - DAY_MS - 1, SOL, 9, 1)),
      entryOf(fill(g.t - 1_000, SOL, 9, -1), [], 1),
      entryOf(fill(g.t - 1_000, KPEPE, 9, -1)),
    ];
    const m = featuresFor(
      dataOf({ counted, forced: [...forced] }),
      [entryOf(e), entryOf(g)],
      120_000,
      all,
    );
    expect(valueOf(m, "N1")).toEqual([1, 0]);
    expect(valueOf(m, "N5")).toEqual([1, 0]);
    expect(valueOf(m, "N6")).toEqual([1, 0]);
    expect(valueOf(m, "N10")).toEqual([1, 0]);
    // ETH's two accounts make a forced buy market-wide.
    const b = fill(g.t, KPEPE, 3, 1);
    const n = featuresFor(dataOf({ counted: [b], forced: [...forced] }), [
      entryOf(b),
    ]);
    expect(valueOf(n, "N10")).toEqual([1]);
  });

  it("N3: the last settled row stamped by t above the 90th percentile of the 30 days' rows before t, at least 168 of them", () => {
    const t = Date.parse("2025-06-20T10:00:00.017Z");
    const rows: FundingRow[] = [];
    for (
      let h = Date.parse("2025-05-25T00:00:00Z");
      h <= t + HOUR_MS;
      h += HOUR_MS
    )
      rows.push([h, (h - START) / HOUR_MS / 1e6, h + 17]);
    // The row stamped after t is never the last.
    rows[rows.length - 1]![1] = -1;
    const sell = fill(t, SOL, 1, -1);
    const buy = fill(t, SOL, 2, 1);
    const short = fill(Date.parse("2025-05-31T00:00:00.017Z"), SOL, 3, -1);
    const m = featuresFor(
      dataOf({
        counted: [sell, buy, short],
        funding: new Map([["SOL", rows]]),
      }),
      [entryOf(sell), entryOf(buy), entryOf(short)],
    );
    expect(valueOf(m, "N3")).toEqual([1, 0, NaN]);
  });

  it("N4: the bounce by the rule's x_in, read at the minute x_in ends, against the hour's forced move", () => {
    const K = 10 * 1440;
    const pc = nan();
    pc[K - 61] = 100;
    pc[K - 1] = 90;
    pc[K + 1] = 95;
    pc[K + 2] = 999;
    const sell = fill(at(K), SOL, 1, -1);
    const buy = fill(at(K), SOL, 2, 1);
    const d = dataOf({ pc: new Map([["SOL", pc]]), counted: [sell, buy] });
    expect(
      valueOf(featuresFor(d, [entryOf(sell), entryOf(buy)]), "N4"),
    ).toEqual([1, 0]);
    pc[K + 1] = 94.99;
    expect(valueOf(featuresFor(d, [entryOf(sell)]), "N4")).toEqual([0]);
    // D0's x_in, 10 s after t, ends no minute after t: it reads P(t), no bounce.
    pc[K + 1] = 95;
    expect(valueOf(featuresFor(d, [entryOf(sell)], 10_000), "N4")).toEqual([0]);
    pc[K - 61] = NaN;
    expect(
      valueOf(featuresFor(d, [entryOf(sell), entryOf(buy)]), "N4"),
    ).toEqual([NaN, NaN]);
  });

  it("N7 and N8: the open interest and the premium of the minutes ended by t and an hour before", () => {
    const K = 10 * 1440;
    const oi = nan();
    const premium = nan();
    oi[K - 61] = 1000;
    oi[K - 1] = 900;
    oi[K] = 1;
    premium[K - 1] = 0.002;
    premium[K] = 9;
    const sell = fill(at(K, 59_999), SOL, 1, -1);
    const m = featuresFor(
      dataOf({
        counted: [sell],
        columns: new Map([
          ["SOL|openInterest", oi],
          ["SOL|premium", premium],
        ]),
      }),
      [entryOf(sell)],
    );
    expect(valueOf(m, "N7")).toEqual([0.1]);
    expect(valueOf(m, "N8")).toEqual([-0.002]);
  });

  it("N11: the RV of the 288 five-minute returns ended by t against the median daily RV of the 30 days before t's day", () => {
    const a = 1.01;
    const t = Date.parse("2025-06-30T12:00:30Z");
    const end = (t - START - 30_000) / MINUTE_MS;
    const split = end - 1_441;
    const flip = (k: number) => Math.floor((k + 1) / 5) % 2;
    const pc = Float64Array.from(
      { length: MINUTES },
      (_, k) => 100 * (k < split ? a : a * a) ** flip(k),
    );
    const sell = fill(t, SOL, 1, -1);
    const d = dataOf({ pc: new Map([["SOL", pc]]), counted: [sell] });
    expect(valueOf(featuresFor(d, [entryOf(sell)]), "N11")[0]).toBeCloseTo(
      2,
      10,
    );
    // The two end points and 28 others without a price leave 230 returns, summed as they are; one more leaves 228: unknown.
    pc[end - 1] = NaN;
    pc[end - 1_441] = NaN;
    for (let j = 1; j <= 28; j++) pc[end - 1 - 10 * j] = NaN;
    expect(valueOf(featuresFor(d, [entryOf(sell)]), "N11")[0]).toBeCloseTo(
      2 * Math.sqrt(230 / 288),
      10,
    );
    pc[end - 1 - 300] = NaN;
    expect(valueOf(featuresFor(d, [entryOf(sell)]), "N11")[0]).toBeNaN();
    // Under 7 days with a daily RV before t's day: unknown.
    const early = fill(Date.parse("2025-05-31T12:00:00Z"), SOL, 2, -1);
    const e = dataOf({ pc: new Map([["SOL", pc]]), counted: [early] });
    expect(valueOf(featuresFor(e, [entryOf(early)]), "N11")[0]).toBeNaN();
  });

  it("C1–C3: the ⌊n/2⌋ thinnest, widest and smallest ranked coins of the 30 days before the month, ties by asset id", () => {
    const month = Date.parse("2025-06-01T00:00:00Z");
    const row = (t: number) => (t - START) / MINUTE_MS;
    const four = ["SOL", "HYPE", "PUMP", "ZEC"];
    const columns = new Map<string, Float64Array>();
    four.forEach((c, i) => {
      const ntl = new Float64Array(MINUTES);
      const ask = nan();
      const bid = nan();
      const mid = nan();
      const oi = nan();
      const mark = nan();
      for (let k = row(Date.parse("2025-05-25T14:00:00Z")); k < row(month); k++)
        ntl[k] = [4, 3, 3, 1][i]!;
      for (let k = 0; k < row(month); k++) {
        mid[k] = 100;
        bid[k] = 100;
        ask[k] = 100 + [0.4, 0.3, 0.2, 0.1][i]!;
        oi[k] = [10, 20, 30, 40][i]!;
        mark[k] = 1;
      }
      columns.set(`${c}|buyNtl`, ntl);
      columns.set(`${c}|impactAsk`, ask);
      columns.set(`${c}|impactBid`, bid);
      columns.set(`${c}|mid`, mid);
      columns.set(`${c}|openInterest`, oi);
      columns.set(`${c}|mark`, mark);
    });
    // Before the first fill file and from the month's first minute: never read.
    columns.get("ZEC|buyNtl")![row(Date.parse("2025-05-25T13:59:00Z"))] = 1e9;
    columns.get("HYPE|buyNtl")![row(month)] = 1e9;
    columns.get("SOL|mid")![5] = 0;
    columns.get("SOL|impactAsk")![5] = 1e9;
    const ids = [5, 159, 200, 214, XRP];
    const entries = ids.map((iid, i) =>
      entryOf(fill(month + DAY_MS + i, iid, i + 1, -1)),
    );
    const m = featuresFor(
      dataOf({ counted: entries.map((e) => e.fill), columns }),
      entries,
    );
    expect(valueOf(m, "C1")).toEqual([0, 1, 0, 1, NaN]);
    expect(valueOf(m, "C2")).toEqual([1, 1, 0, 0, NaN]);
    expect(valueOf(m, "C3")).toEqual([1, 1, 0, 0, NaN]);
  });
});

describe("the cuts and the try log", () => {
  it("cuts each of the nine by the kit's quantile (type 7) of the known values, with n and the unknown count", () => {
    const d = dataOf({});
    const features = new Map(FILTERS.map((f) => [f, Float64Array.of(NaN)]));
    features.set("W4", Float64Array.of(1, 2, 3, 4, NaN));
    features.set(
      "R2",
      Float64Array.from({ length: 11 }, (_, i) => i),
    );
    const cuts = cutsOf(d, features);
    expect(Object.keys(cuts)).toEqual([...CUT_NAMES]);
    expect(cuts.W4).toEqual({ q: 0.5, value: 2.5, n: 4, unknown: 1 });
    expect(cuts.R2).toEqual({ q: 0.9, value: 9, n: 11, unknown: 0 });
    expect(cuts.N9).toEqual({ q: 0.5, value: null, n: 0, unknown: 1 });
    expect(CutsFile.parse({ features: "a".repeat(64), cuts }).cuts).toEqual(
      cuts,
    );
    expect(() =>
      CutsFile.parse({
        features: "a".repeat(64),
        cuts: { ...cuts, W4: undefined },
      }),
    ).toThrow();
  });

  it("holds the 35 tries in the written order: 33 adoptable, 15 seeded, the nine families, each test's comparison at its boundary", () => {
    expect(TRIES.map((t) => t.order)).toEqual(TRIES.map((_, i) => i + 1));
    expect(TRIES.map((t) => t.name).join(" ")).toBe(
      "S1 D0 D15 D60 H1 H2 H4 H8 H12 W1 W2 W3 W4 W5 R1 R2 R3 R4 C1 C2 C3 T1 T2 X1 N1 N2 N3 N4 N5 N6 N7 N8 N9 N10 N11",
    );
    expect(TRIES.filter((t) => !t.adoptable).map((t) => t.name)).toEqual([
      "N7",
      "N8",
    ]);
    expect(
      TRIES.filter((t) => t.seeded)
        .map((t) => t.name)
        .join(" "),
    ).toBe("S1 D0 D15 D60 H1 H2 H4 H8 H12 W2 R1 R2 R3 R4 X1");
    expect(
      TRIES.filter((t) => t.venue === "HL")
        .map((t) => t.name)
        .join(" "),
    ).toBe("S1 W4 W5 N5 N7 N8 N9 N10");
    expect(
      TRIES.filter((t) => "filter" in t && t.filter.q !== undefined).map(
        (t) => t.name,
      ),
    ).toEqual([...CUT_NAMES]);
    expect(
      TRIES.filter((t) => "variant" in t)
        .map((t) => t.name)
        .join(" "),
    ).toBe("D0 D15 D60 H1 H2 H4 H8 H12 W2 X1");
    const k = (name: string, v: number, cut: number | null = null) =>
      keeps(
        TRIES.find((t) => t.name === name)!,
        v,
        cut,
      );
    expect([k("S1", -1), k("S1", 1), k("S1", NaN)]).toEqual([
      true,
      false,
      null,
    ]);
    expect([k("W1", 3), k("W1", 2)]).toEqual([true, false]);
    expect([k("W3", 2), k("W3", 1)]).toEqual([true, false]);
    for (const n of ["W4", "W5", "N2", "N9"])
      expect([k(n, 5, 5), k(n, 4.999, 5), k(n, 5, null)]).toEqual([
        true,
        false,
        null,
      ]);
    expect([k("R1", 1e-9), k("R1", 0)]).toEqual([true, false]);
    for (const n of ["R2", "R3"])
      expect([k(n, 7, 7), k(n, 7.001, 7)]).toEqual([true, false]);
    expect([k("R4", 0.0999, 0.1), k("R4", 0.1, 0.1)]).toEqual([true, false]);
    for (const n of ["N7", "N8"])
      expect([k(n, 0.2001, 0.2), k(n, 0.2, 0.2)]).toEqual([true, false]);
    expect([7, 8, 9, 10, 11, 12].map((h) => k("T1", h))).toEqual([
      true,
      false,
      false,
      false,
      false,
      true,
    ]);
    expect([0, 1, 5, 6].map((day) => k("T2", day))).toEqual([
      false,
      true,
      true,
      false,
    ]);
    for (const n of ["C1", "C2", "C3", "N1", "N3", "N5", "N10"])
      expect([k(n, 1), k(n, 0)]).toEqual([true, false]);
    for (const n of ["N4", "N6"])
      expect([k(n, 0), k(n, 1)]).toEqual([true, false]);
    expect([k("N11", 1.5), k("N11", 1.4999)]).toEqual([true, false]);
    expect(() =>
      keeps(
        TRIES.find((t) => t.name === "D0")!,
        1,
        null,
      ),
    ).toThrow();
  });
});
