/**
 * The coverage tripwire (src/copyh/tripwire.ts; rules.md C16), on made-up
 * coins: each reason alone — a follow instant and an exit instant in six
 * quiet minutes (five are within the kit's staleness), minutes of
 * zero-size trades, an open copy's END − 1 ms in a quiet end, a quiet
 * :54 → :59 before an hour inside a hold of days (unmarked under the
 * 5-minute rule, marked under the 60-minute one); a settled copy on a coin
 * quiet for its last six minutes counted and never unpriced; the counts
 * beside (settled, funding hours missing, gap); the 1% stop on both sides
 * with a margin, and `--past-tripwire` running on; and, on every copy of
 * the world under both settlement rules, each projected reason equal to
 * the one lib-exits' `priceCopy` then finds on the market object.
 */
import { describe, expect, it } from "vitest";
import type { FundingRow } from "../src/copyh/funding.js";
import {
  coinMarkets,
  type Bars,
  type Coin,
  type MarkMinutes,
} from "../src/copyh/markets.js";
import { moneyOf, planOf } from "../src/copyh/money.js";
import {
  coinMarksOf,
  projectionOf,
  reasonOf,
  tripwireStops,
  type Planned,
} from "../src/copyh/tripwire.js";
import {
  loadResearch,
  type CopyExit,
  type Setting,
} from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";

const kit = await loadResearch();
const MIN = MINUTE_MS;
const T0 = Date.parse("2025-09-08T00:00:00Z");
const END = T0 + 3 * DAY_MS;
const N = (END - T0) / MIN;
/** The quiet minutes [from, to) of coin 0 (no market trade), and its minutes of zero-size trades. */
const at = (h: number, m: number) => T0 + h * HOUR_MS + m * MIN;
const QUIET_6 = [at(5, 10), at(5, 16)];
const QUIET_5 = [at(7, 20), at(7, 25)];
const QUIET_HOUR = [at(30, 54), at(31, 0)];
const QUIET_END = [END - 6 * MIN, END];
const ZERO_SIZE = [at(40, 0), at(40, 6)];
/** Coin 1 settles in its minute at 2 d 29 min, quiet for the six minutes before its end; coin 2 has no market trade and settles at 20 h 29 min. */
const SETTLE_END = T0 + 2 * DAY_MS + 30 * MIN;
const SETTLE_END_2 = at(20, 30);

const inAny = (t: number, spans: readonly (readonly number[])[]) =>
  spans.some(([a, b]) => t >= a! && t < b!);
function barsOf(iid: number, quiet: number[][], zero: number[][]): Bars {
  const price = (k: number) => 100 + ((k * k) % 37) / 10;
  const minute = (k: number) => T0 + k * MIN;
  const trades = Uint32Array.from({ length: N }, (_, k) =>
    inAny(minute(k), quiet) ? 0 : 1 + (k % 3),
  );
  const sz = Float64Array.from({ length: N }, (_, k) =>
    trades[k] === 0 || inAny(minute(k), zero) ? 0 : 1 + (k % 4),
  );
  return {
    iid,
    start: T0,
    n: N,
    trades,
    sz,
    ntl: Float64Array.from({ length: N }, (_, k) => sz[k]! * price(k)),
    last: Float64Array.from({ length: N }, (_, k) =>
      trades[k] === 0 ? NaN : price(k) + 0.1,
    ),
    pairGap: new Float64Array(N),
    pairs: new Uint32Array(N),
    settleSz: new Float64Array(N),
    settleNtl: new Float64Array(N),
  };
}
const COINS: (Coin & { name: string })[] = [
  {
    bars: barsOf(0, [QUIET_6, QUIET_5, QUIET_HOUR, QUIET_END], [ZERO_SIZE]),
    end: END,
    settlement: null,
    name: "SOL",
  },
  {
    bars: barsOf(1, [[SETTLE_END - 6 * MIN, SETTLE_END]], []),
    end: SETTLE_END,
    settlement: { t: SETTLE_END - 25_000, price: 104.2 },
    name: "ETH",
  },
  {
    bars: barsOf(2, [[T0, END]], []),
    end: SETTLE_END_2,
    settlement: { t: SETTLE_END_2 - 55_000, price: 50 },
    name: "XYZ",
  },
];
/** Hourly funding rows, a few ms late, but none at 9 h. */
const ROWS: FundingRow[] = Array.from(
  { length: 3 * 24 - 1 },
  (_, k) => T0 + (k + 1) * HOUR_MS,
)
  .filter((h) => h !== at(9, 0))
  .map((hour, k) => ({
    coin: "SOL",
    fundingRate: (((k % 5) - 2) * 1e-5).toFixed(6),
    premium: "0",
    time: hour + 3 + k,
    hour,
  }));
const HOURS = ROWS.map((r) => r.hour);
const SETTING: Setting = {
  name: "made-up",
  fee: () => 0.00045,
  spread: () => ({ c: 1e-4, fallback: false }),
};

/** A copy of an entry at t followed after D, closed by its exits (each of its share of what is open, whole unless given) or still open. */
type Made = {
  iid: number;
  t: number;
  D: number;
  exits: number[];
  shares?: number[];
  gap?: boolean;
};
const exitsOf = (c: Made): CopyExit[] =>
  c.exits.map((t, i) => ({
    t,
    share: c.shares?.[i] ?? 1,
    kind: "REDUCE",
    forced: false,
    liq: false,
  }));
const D = 80_000;
function planned(c: Made) {
  const plan = planOf({ t: c.t, D: c.D }, exitsOf(c), COINS[c.iid]!);
  const tIn = c.t + c.D;
  const copy: Planned = {
    iid: c.iid,
    tIn,
    legs: plan.legs.map((l) => tIn + l.h),
    settled: plan.settled,
    gap: c.gap ?? false,
  };
  return { plan, copy };
}
const marks = (mm: MarkMinutes) =>
  COINS.map((c) => coinMarksOf(c, c.bars.iid === 0 ? HOURS : [], mm));
/** Each coin's VWAP object; null for a coin without a market trade, whose copies PRICES gives the kit's first reason. */
const markets = (mm: MarkMinutes) =>
  COINS.map(
    (c) => coinMarkets(kit, c, c.bars.iid === 0 ? ROWS : [], mm)?.vwap ?? null,
  );

/** The cases, each reason alone. */
const CASES: Record<string, Made> = {
  "follow instant in six quiet minutes": {
    iid: 0,
    t: at(5, 15) + 30_000 - D,
    D,
    exits: [at(8, 0)],
  },
  "exit instant in six quiet minutes": {
    iid: 0,
    t: at(2, 0),
    D,
    exits: [at(5, 15) + 30_000 - D],
  },
  "exit instant in five quiet minutes, within the staleness": {
    iid: 0,
    t: at(2, 0),
    D,
    exits: [at(7, 24) + 30_000 - D],
  },
  "exit instant in minutes of zero-size trades": {
    iid: 0,
    t: at(38, 0),
    D,
    exits: [at(40, 5) + 1_000 - D],
  },
  "open at END, its END − 1 ms in a quiet end": {
    iid: 0,
    t: at(60, 0),
    D,
    exits: [],
  },
  "a quiet :54 → :59 before an hour inside a hold of days": {
    iid: 0,
    t: at(1, 3),
    D,
    exits: [at(60, 1)],
  },
  "a funding hour missing in the hold, after its first leg": {
    iid: 0,
    t: at(8, 30),
    D,
    exits: [at(8, 44), at(9, 30)],
    shares: [0.5, 1],
    gap: true,
  },
  "settled on a coin quiet for its last six minutes": {
    iid: 1,
    t: at(40, 0),
    D,
    exits: [],
  },
  "an earlier leg in six quiet minutes, the last priced": {
    iid: 0,
    t: at(3, 0),
    D,
    exits: [at(5, 15) + 30_000 - D, at(6, 0)],
    shares: [0.5, 1],
  },
  "followed after its coin's end": {
    iid: 1,
    t: SETTLE_END - 30_000,
    D,
    exits: [],
  },
  "on a coin without a market trade": { iid: 2, t: at(10, 0), D, exits: [] },
  "on a coin without a market trade, followed in its Settlement minute": {
    iid: 2,
    t: at(20, 29) + 30_000 - D,
    D,
    exits: [],
  },
};

describe("each reason alone (C16)", () => {
  const five = marks(5);
  const sixty = marks(60);
  const reason = (name: string, m = five) => {
    const { copy } = planned(CASES[name]!);
    return reasonOf(m[copy.iid]!, copy);
  };

  it("finds no mark at a follow or exit instant in six quiet minutes, and one in five (the kit's staleness)", () => {
    expect(reason("follow instant in six quiet minutes")).toBe(
      "no mark at the follow instant",
    );
    expect(reason("exit instant in six quiet minutes")).toBe(
      "no mark at an exit instant",
    );
    expect(
      reason("exit instant in five quiet minutes, within the staleness"),
    ).toBeNull();
  });

  it("counts a minute of zero-size market trades as none, and an open copy's END − 1 ms among its instants", () => {
    expect(reason("exit instant in minutes of zero-size trades")).toBe(
      "no mark at an exit instant",
    );
    const { copy } = planned(
      CASES["open at END, its END − 1 ms in a quiet end"]!,
    );
    expect(copy.legs).toEqual([END - 1]);
    expect(reasonOf(five[0]!, copy)).toBe("no mark at an exit instant");
  });

  it("finds a funding settlement without a mark after a quiet :54 → :59, under the 5-minute rule and not under the 60-minute one", () => {
    const name = "a quiet :54 → :59 before an hour inside a hold of days";
    expect(reason(name)).toBe("a funding settlement without a mark");
    expect(reason(name, sixty)).toBeNull();
  });

  it("never finds a settled copy unpriced, its last leg at its coin's Settlement minute", () => {
    const { plan, copy } = planned(
      CASES["settled on a coin quiet for its last six minutes"]!,
    );
    expect(plan.settled).toBe(true);
    expect(copy.legs).toEqual([SETTLE_END - 1]);
    expect(reasonOf(five[1]!, copy)).toBeNull();
    // Its six minutes before hold no market trade: on the coin unsettled, the same leg is unpriced.
    const unsettled = coinMarksOf({ ...COINS[1]!, settlement: null }, [], 5);
    expect(reasonOf(unsettled, copy)).toBe("no mark at an exit instant");
  });

  it("counts the settled copies, the funding hours missing and the gap copies beside, unpricing none of them", () => {
    const copies = Object.values(CASES).map((c) => planned(c).copy);
    const { projection, reasons } = projectionOf(copies, (iid) => five[iid]!);
    expect(reasons).toEqual([
      "no mark at the follow instant",
      "no mark at an exit instant",
      null,
      "no mark at an exit instant",
      "no mark at an exit instant",
      "a funding settlement without a mark",
      null,
      null,
      "no mark at an exit instant",
      "no mark at the follow instant",
      "no mark at the follow instant",
      "no mark at the follow instant",
    ]);
    // 9 h is missing in two holds, the long one's and its own copy's (after its first leg); coins 1 and 2 have no rows: the eight hours of the copy settled on coin 1 and the ten of coin 2's are missing too. A copy open at its coin's end is settled, unpriced or not.
    expect(projection).toEqual({
      copies: 12,
      unpriced: {
        "no mark at the follow instant": 4,
        "no mark at an exit instant": 4,
        "a funding settlement without a mark": 1,
      },
      share: 9 / 12,
      settled: 4,
      missingHours: 20,
      copiesMissing: 4,
      gap: 1,
    });
  });
});

describe("the stop (C16)", () => {
  it("stops above 1%, not at 1% or below, and runs on past it with --past-tripwire", () => {
    expect(tripwireStops(0.0101, false)).toBe(true);
    expect(tripwireStops(0.01, false)).toBe(false);
    expect(tripwireStops(0.0099, false)).toBe(false);
    expect(tripwireStops(0.0101, true)).toBe(false);
    expect(tripwireStops(0.5, true)).toBe(false);
  });
});

describe("the projection against the pricing (C16)", () => {
  /** The cases and a batch of copies across the world: entries every 47 minutes, D across its range, closed after 1–40 h, a third of them halved first, some never closed; none entered after its coin's end. */
  const batch: Made[] = [
    ...Object.values(CASES),
    ...Array.from({ length: 90 }, (_, j): Made => {
      const t = T0 + j * 47 * MIN + ((j * 7_919) % 60_000);
      const d = 62_140 + ((j * 104_729) % 33_300);
      const iid = j % 9 === 0 ? 1 : 0;
      const close = t + (1 + ((j * j) % 40)) * HOUR_MS;
      const half = t + (1 + ((j * 13) % 9)) * 17 * MIN;
      if (j % 7 === 0) return { iid, t, D: d, exits: [] };
      if (j % 3 === 1 && half < close)
        return { iid, t, D: d, exits: [half, close], shares: [0.5, 1] };
      return { iid, t, D: d, exits: [close] };
    }),
  ].filter((c) => c.t < COINS[c.iid]!.end);

  it("gives each copy the reason priceCopy finds on the market object, under both settlement rules", () => {
    for (const mm of [5, 60] as const) {
      const m = marks(mm);
      const objects = markets(mm);
      const found: (string | null)[] = [];
      const projected: (string | null)[] = [];
      for (const c of batch) {
        const { plan, copy } = planned(c);
        const mk = objects[c.iid]!;
        const money =
          mk === null
            ? { reason: "no mark at the follow instant" }
            : moneyOf(kit, mk, { dir: 1, tIn: copy.tIn, plan }, SETTING);
        found.push(money.reason ?? null);
        projected.push(reasonOf(m[c.iid]!, copy));
      }
      expect(projected, `${mm}`).toEqual(found);
      // The world reaches every reason, and prices most copies.
      expect(new Set(found).size, `${mm}`).toBe(mm === 5 ? 4 : 3);
      expect(found.filter((r) => r === null).length).toBeGreaterThan(40);
    }
  });
});
