/**
 * The judgement reading and the edge over the market (src/copyh/judge.ts;
 * rules.md C10, C11): the vote at its bound; a member's records, its market
 * trades' in the week of M cut at END; a line's removal through the real
 * pass and merge — a trade between two members in two buckets counted once,
 * a backstop's leg and an ADL not removed, two coins apart — read back equal
 * to the kit's own `removalOf` at every minute of the hour; d equal to the
 * kit's `dAgainstNull` and to the null written out on uneven marks and
 * minute counts, long and short, with and without the removal; x′ = d − the
 * copy's cost written out on uneven marks with funding and a missing hour;
 * d null by each reason, x′ null exactly then.
 */
import { describe, expect, it } from "vitest";
import { readBucket, type AccountRow } from "../src/copyh/accounts.js";
import { WEEK_MS } from "../src/copyh/instants.js";
import {
  NO_LONG_SHARE,
  dOf,
  edgeOf,
  memberRecords,
  removalsOf,
  removedBy,
  votedBy,
  type DReading,
  type Followed,
} from "../src/copyh/judge.js";
import { marketOf } from "../src/copyh/markets.js";
import { normOf } from "../src/copyh/normalize.js";
import {
  loadResearch,
  type PanelFile,
  type Setting,
} from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { addr, byBlock, keyOf, record, trade } from "./copyh-world.js";
import { KINDS, storeOf } from "./copyh-engine-world.js";

const kit = await loadResearch();
const MIN = MINUTE_MS;
const BTC = 0;
const SOL = 2;
/** A Monday, and the hour of the first copy's entry on it. */
const M = Date.parse("2025-09-08T00:00:00Z");
const T = M + 10 * HOUR_MS;
const END = M + WEEK_MS;
const SHARE = 0.62;

describe("the vote (C10)", () => {
  it("holds when every leg drawn from the entry's hour ends by END, the kit's 95.44 s of delay at most, not 1 ms later", () => {
    expect(kit.entries.maxDelay()).toBe(95_440);
    const t = T + 10 * MIN + 1_234;
    const edge = T + HOUR_MS + 95_440 + DAY_MS;
    expect(votedBy(kit, t, edge)).toBe(true);
    expect(votedBy(kit, t, edge - 1)).toBe(false);
    expect(votedBy(kit, T + HOUR_MS - 1, edge)).toBe(true);
    expect(votedBy(kit, T + HOUR_MS, edge)).toBe(false);
  });
});

describe("a member's records (C10)", () => {
  const row = (time: number, market = true) => ({
    time,
    iid: SOL,
    tid: String(time - M),
    market,
  });
  const key = (t: number) => ({ t, iid: SOL, tid: String(t - M) });

  it("are its market trades' records in the week of M", () => {
    const rows = [
      row(M - 1),
      row(M),
      row(M + 5_000, false),
      row(M + WEEK_MS - 1),
      row(M + WEEK_MS),
    ];
    expect(memberRecords(rows, M, M + 2 * WEEK_MS)).toEqual([
      key(M),
      key(M + WEEK_MS - 1),
    ]);
  });

  it("are cut at END inside the week", () => {
    const end = M + 3 * DAY_MS;
    expect(memberRecords([row(end - 1), row(end)], M, end)).toEqual([
      key(end - 1),
    ]);
  });
});

/** Members P (bucket 01) and Q (bucket 02); X and the backstop B in neither line. */
const P = addr(0x101);
const Q = addr(0x202);
const X = addr(0x303);
const B = addr(0x404);
const FILE = [
  // A market trade between the two members: one trade, two buckets.
  ...trade(P, Q, { coin: "SOL", side: "B", time: T + 30_000, tid: 11 }),
  ...trade(P, X, { coin: "BTC", side: "B", time: T + 40_000, tid: 21 }),
  ...trade(P, X, { coin: "SOL", side: "A", time: T + 65_000, tid: 12 }),
  ...trade(X, Q, { coin: "SOL", side: "B", time: T + 70_000, tid: 13 }),
  // The backstop takes P's liquidated position: no market trade.
  record(B, {
    coin: "SOL",
    sz: "4",
    side: "B",
    time: T + 130_000,
    tid: 14,
    crossed: true,
    liquidation: { liquidatedUser: P, markPx: "100.4", method: "backstop" },
  }),
  record(P, {
    coin: "SOL",
    sz: "4",
    side: "A",
    time: T + 130_000,
    startPosition: "4.0",
    dir: "Liquidated Cross Long",
    tid: 14,
    crossed: false,
    liquidation: { liquidatedUser: P, markPx: "100.4", method: "backstop" },
  }),
  // Q deleveraged: its taker record's dir makes the trade no market trade.
  record(Q, {
    coin: "SOL",
    side: "A",
    time: T + 190_000,
    dir: "Auto-Deleveraging",
    tid: 15,
    crossed: true,
  }),
  record(X, {
    coin: "SOL",
    side: "B",
    time: T + 190_000,
    dir: "Close Short",
    tid: 15,
    crossed: false,
  }),
];

describe("a line's removal (C10)", { timeout: 60_000 }, () => {
  it("counts each market trade of its members once, whichever bucket holds a record, leaves a backstop's leg and an ADL out, and reads back the kit's own counts", async () => {
    const store = await storeOf(
      new Map([[keyOf(T), `${byBlock(1, FILE)}\n`]]),
      T,
      T + HOUR_MS,
    );
    const rowsOf = (bucket: number, a: string): AccountRow[] =>
      readBucket([store], bucket, { from: T, to: T + HOUR_MS }, KINDS)
        .find((v) => v.addr === a)!
        .rows(T, T + HOUR_MS);
    const p = rowsOf(1, P);
    const q = rowsOf(2, Q);
    expect(p.map((r) => [r.time, r.iid, r.market])).toEqual([
      [T + 30_000, SOL, true],
      [T + 40_000, BTC, true],
      [T + 65_000, SOL, true],
      [T + 130_000, SOL, false],
    ]);
    expect(q.map((r) => [r.time, r.market])).toEqual([
      [T + 30_000, true],
      [T + 70_000, true],
      [T + 190_000, false],
    ]);
    const tables = removalsOf(kit, [
      memberRecords(p, M, END),
      memberRecords(q, M, END),
    ]);
    expect([...tables.keys()].sort()).toEqual([BTC, SOL]);
    expect([...tables.get(SOL)!]).toEqual([
      [T, 1],
      [T + MIN, 2],
    ]);
    expect([...tables.get(BTC)!]).toEqual([[T, 1]]);
    // The kit's own removalOf over the members' market-trade fills, minute by minute.
    const market = (rows: AccountRow[]) =>
      normOf(rows).filter((_, i) => rows[i]!.market);
    const own = kit.nulls.removalOf([market(p), market(q)]);
    for (const iid of [SOL, BTC])
      for (let m = T; m < T + HOUR_MS; m += MIN)
        expect(removedBy(tables.get(iid))(m), `${iid} ${m}`).toBe(own(iid)(m));
    // Every record of theirs would also remove the backstop's minute and the ADL's.
    const all = kit.nulls.removalOf([normOf(p), normOf(q)])(SOL);
    expect([all(T + 2 * MIN), all(T + 3 * MIN)]).toEqual([1, 1]);
    expect(removedBy(tables.get(SOL))(T + 2 * MIN)).toBe(0);
    expect(removedBy(tables.get(SOL))(T + 3 * MIN)).toBe(0);
    expect(removedBy(undefined)(T)).toBe(0);
  });
});

/** A made-up SOL panel from T − 1 h to T + 27 h: uneven marks and minute counts; an hour without a market trade; seven minutes without a mark a day after the second hour; a funding row each hour but T + 5 h's, stamped a few ms late. */
const START = T - HOUR_MS;
const PANEL_END = T + 27 * HOUR_MS;
const QUIET = T + 2 * HOUR_MS;
const DARK = [T + 25 * HOUR_MS + 40 * MIN, T + 25 * HOUR_MS + 47 * MIN];
function panel(): PanelFile {
  const n = (PANEL_END - START) / MIN;
  const klines = {
    minute: [] as number[],
    trades: [] as number[],
    volume: [] as number[],
  };
  for (let i = 0; i < n; i++) {
    const t = START + i * MIN;
    if (t >= QUIET && t < QUIET + HOUR_MS) continue;
    klines.minute.push(i);
    klines.trades.push(t === T ? 1 : t === T + MIN ? 3 : 1 + ((i * i) % 5));
    klines.volume.push(1 + (i % 3));
  }
  const hours = Array.from(
    { length: 27 },
    (_, k) => START + (k + 1) * HOUR_MS,
  ).filter((h) => h !== T + 5 * HOUR_MS);
  return {
    iid: SOL,
    symbol: "SOL",
    category: "main dex",
    start: START,
    end: PANEL_END,
    firstTrade: START,
    retired: null,
    marks: Array.from({ length: n }, (_, i) => {
      const t = START + i * MIN;
      return t >= DARK[0]! && t < DARK[1]! ? null : 100 + ((i * i) % 89) / 9;
    }),
    klines,
    funding: hours.map((h, k): [number, number, number] => [
      h,
      ((k % 3) - 1) * 1e-5 + 3e-6,
      h + 5 * (k + 1),
    ]),
  };
}
const mk = marketOf(kit, panel(), PANEL_END, 5);
/** A made-up setting: the base fee, an uneven c by the leg's minute. */
const SETTING: Setting = {
  name: "made-up",
  fee: () => 0.00045,
  spread: (_, t) => ({
    c: 1e-4 + (Math.floor(t / MIN) % 7) * 1e-5,
    fallback: false,
  }),
};
/** The two members' trades left out of the first hour, as their table reads them. */
const TABLE = new Map([
  [T, 1],
  [T + MIN, 2],
]);
const LONG: Followed = { dir: 1, t: T + 10 * MIN + 1_234, D: 80_530 };
const SHORT: Followed = { ...LONG, dir: -1 };

const mark = (t: number) => kit.panel.markAtMinuteEnd(mk, t)!;
/** A leg's gross over 24 h from f, written out. */
const gross = (dir: number, f: number) =>
  (dir * (mark(f + DAY_MS) - mark(f))) / mark(f);

/** d in bps written out: the copy's gross less the null's, every minute of t's hour weighed by its trades left after the removal, its follow instant split across two minutes by D. */
function dWrittenOut(c: Followed, share: number, removed: Map<number, number>) {
  const H = Math.floor(c.t / HOUR_MS) * HOUR_MS;
  const k0 = Math.floor(c.D / MIN);
  const phi = (c.D - k0 * MIN) / MIN;
  const lean = (f: number) => share * gross(1, f) + (1 - share) * gross(-1, f);
  let sum = 0;
  let weight = 0;
  for (let m = H; m < H + HOUR_MS; m += MIN) {
    const w = kit.panel.tradesAt(mk, m) - (removed.get(m) ?? 0);
    if (w <= 0) continue;
    sum +=
      w * ((1 - phi) * lean(m + k0 * MIN) + phi * lean(m + (k0 + 1) * MIN));
    weight += w;
  }
  return (gross(c.dir, c.t + c.D) - sum / weight) * 1e4;
}

/** The copy's cost over 24 h written out (C9's leg): the spread at both ends, the fee on both legs, the funding of each hour's row in the hold. */
function costWrittenOut(c: Followed) {
  const tIn = c.t + c.D;
  const tOut = tIn + DAY_MS;
  const pIn = mark(tIn) * (1 + c.dir * SETTING.spread(SOL, tIn).c);
  const pOut = mark(tOut) * (1 - c.dir * SETTING.spread(SOL, tOut).c);
  let paid = 0;
  mk.funding.hour.forEach((h, k) => {
    if (h > tIn && h <= tOut) paid += mk.funding.rate[k]! * mark(h - 1);
  });
  const fees = 0.00045 + (0.00045 * pOut) / pIn;
  const net = (c.dir * (pOut - pIn)) / pIn - fees + (-c.dir * paid) / pIn;
  return { cost: gross(c.dir, tIn) - net, paid };
}

describe("d (C10)", () => {
  it("is the kit's dAgainstNull at 24 h in bps, and the null written out, long and short, with and without the line's removal", () => {
    const values: number[] = [];
    for (const c of [LONG, SHORT])
      for (const table of [new Map<number, number>(), TABLE]) {
        const removed = removedBy(table);
        const own = kit.nulls.dAgainstNull(mk, {
          dir: c.dir,
          t: c.t,
          D: c.D,
          h: 24 * HOUR_MS,
          longShare: SHARE,
          removed,
        });
        if (own.d === null) throw new Error(own.reason);
        const d = dOf(kit, mk, c, SHARE, removed);
        expect(d).toEqual({ d: own.d * 1e4, nullGross: own.nullGross * 1e4 });
        expect(d.d).toBeCloseTo(dWrittenOut(c, SHARE, table), 9);
        values.push(d.d!);
      }
    // The removal moves the null, and the long's d is not the short's.
    expect(new Set(values).size).toBe(4);
  });
});

describe("x′, the edge over the market (C10)", () => {
  it("is d less the copy's own cost over the same 24 h written out, on uneven marks with funding and a missing hour", () => {
    for (const c of [LONG, SHORT]) {
      const d = dOf(kit, mk, c, SHARE, removedBy(TABLE));
      const { cost, paid } = costWrittenOut(c);
      expect(paid).not.toBe(0);
      const x = edgeOf(kit, mk, c, SETTING, d);
      expect(x).toBeCloseTo(d.d! - cost * 1e4, 9);
      const leg = kit.returns.leg(mk, {
        dir: c.dir,
        tIn: c.t + c.D,
        h: DAY_MS,
        setting: SETTING,
      })!;
      expect(leg.fundingMissing).toBe(1);
      expect(x).toBe(d.d! - (leg.gross - leg.net) * 1e4);
    }
  });
});

describe("d null by each reason, and x′ null exactly then (C11)", () => {
  /** All of the first hour's trades left out. */
  const ALL = new Map(
    Array.from({ length: 60 }, (_, k) => [
      T + k * MIN,
      kit.panel.tradesAt(mk, T + k * MIN),
    ]),
  );
  const cases: [
    string,
    Followed,
    number | null,
    Map<number, number>,
    string,
  ][] = [
    ["no long share", LONG, null, TABLE, NO_LONG_SHARE],
    [
      "a minute of the null unpriced",
      { ...LONG, t: T + HOUR_MS + 5 * MIN },
      SHARE,
      TABLE,
      "unpriced",
    ],
    [
      "no market trade in the hour",
      { ...LONG, t: QUIET + 5 * MIN },
      SHARE,
      TABLE,
      "no trades in the hour",
    ],
    ["none left after the removal", LONG, SHARE, ALL, "no trades in the hour"],
    [
      "the entry unpriced",
      { ...LONG, t: T + 3 * HOUR_MS + 5 * MIN },
      SHARE,
      TABLE,
      "entry unpriced",
    ],
  ];
  it.each(cases)("%s", (_, c, share, table, reason) => {
    const d: DReading = dOf(kit, mk, c, share, removedBy(table));
    expect(d).toEqual({ d: null, reason });
    expect(edgeOf(kit, mk, c, SETTING, d)).toBeNull();
    // Each case's own leg is priced but the entry's: the null is what fails.
    const leg = kit.returns.leg(mk, {
      dir: c.dir,
      tIn: c.t + c.D,
      h: DAY_MS,
      setting: SETTING,
    });
    expect(leg === null).toBe(reason === "entry unpriced");
  });

  it("refuses x′ for a d its market's leg cannot give", () => {
    const late: Followed = { ...LONG, t: T + 3 * HOUR_MS + 5 * MIN };
    expect(() =>
      edgeOf(kit, mk, late, SETTING, { d: 1, nullGross: 0 }),
    ).toThrow(/unpriced where its d is not/);
    expect(
      typeof edgeOf(
        kit,
        mk,
        LONG,
        SETTING,
        dOf(kit, mk, LONG, SHARE, removedBy(TABLE)),
      ),
    ).toBe("number");
  });
});

describe("the made-up market", () => {
  it("has the first hour's counts, the quiet hour and the dark minutes the cases lean on", () => {
    expect(kit.panel.tradesAt(mk, T)).toBe(1);
    expect(kit.panel.tradesAt(mk, T + MIN)).toBe(3);
    expect(kit.panel.tradesAt(mk, QUIET + 30 * MIN)).toBe(0);
    expect(kit.panel.markAtMinuteEnd(mk, DARK[1]! - 1)).toBeNull();
  });
});
