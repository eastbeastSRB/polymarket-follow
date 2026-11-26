/**
 * The prints (src/copyh/prints.ts; rules.md C13, R14's list), on made-up
 * voted copies whose every reading is its own uneven number, so that a
 * print reading the wrong one shows: R14's list on MAIN's set (each count,
 * mean, bound and band from the items it must read; the smallest edge at
 * look 1 only); every line's figures on its own money and x′ (TEN, BROAD,
 * DAY; STOP2, STOP5, DAYS7 with MAIN's x′; JUMP's three groups; the moved
 * lines; RANK); SIDES, MONTHS and SLICES; concentration; the venues, H1's
 * prints, the settled and thin copies and the cascade print; no verdict
 * word anywhere; and the paper's look's helpers as it computes them.
 */
import { describe, expect, it } from "vitest";
import { loadResearch } from "../src/paper/research.js";
import { dailyEValue, twoWay, type Item } from "../src/paper/stats.js";
import { weekOf } from "../src/copyh/instants.js";
import { MOVED, sliceOf } from "../src/copyh/lines.js";
import type { Position } from "../src/copyh/phase-prices.js";
import {
  concentrationOf,
  drawdownUsd,
  linesOf,
  normalUpper,
  partsOf,
  printCopyOf,
  r14Of,
  reportOf,
  withoutMost,
  type PrintCopy,
} from "../src/copyh/prints.js";
import { statisticOf, type JudgedCopy } from "../src/copyh/verdict.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";

const kit = await loadResearch();
const START = Date.parse("2025-06-30T00:00:00Z");
const END = START + 70 * DAY_MS;
const END_S = START + 140 * DAY_MS;
const addr = (n: number) => `0x${n.toString(16).padStart(40, "0")}`;

type Money = Position["money"];
const priced = (net: number, k: number): Money => ({
  net,
  gross: net + 9 + k / 10,
  fees: -9 - k / 100,
  funding: -k / 1000,
  holdMs: (k + 1) * HOUR_MS,
  fullExitMs: (k + 2) * HOUR_MS,
  fundingMissing: 0,
  spreadFallback: false,
});
const judged = (d: number | null, edge: number | null) =>
  d === null
    ? { d: null, reason: "no trades in the hour", edge: null }
    : { d, nullGross: d / 3, edge };

/** The k-th made-up MAIN copy: its trader, day, nets and edges uneven in k (k²/10), every one of its lines' readings its own. */
function copy(k: number, o: Partial<PrintCopy> = {}): PrintCopy {
  const net = ((k * k) % 17) / 10 - 0.7 + k;
  const edge = ((k * k) % 13) / 10 - 0.4;
  const t = START + (k % 5) * 3 * DAY_MS + k * HOUR_MS;
  const of = (shift: number) => priced(net + shift, k);
  return {
    addr: addr(1 + (k % 4)),
    iid: 1 + (k % 3),
    dir: k % 3 === 0 ? -1 : 1,
    t,
    tIn: t + 5_000,
    lines: ["MAIN", "BROAD", ...(k % 2 === 0 ? (["TEN"] as const) : [])],
    gap: false,
    thin: false,
    money: of(0),
    judged: {
      MAIN: judged(net / 2, edge),
      BROAD: judged(net / 2 + 1, edge + 1),
      TEN: judged(net / 2 + 2, edge + 2),
    },
    main: {
      stop: { STOP2: of(100), STOP5: of(200) },
      days7: of(300),
      jump: k % 4 === 0 ? null : k % 4,
      moved: {
        DELAY0: { money: of(400), judged: judged(1, edge + 40) },
        "DELAY+5": { money: of(500), judged: judged(1, edge + 50) },
        "DELAY+15": { money: of(600), judged: judged(1, edge + 60) },
        LAST: { money: of(700), judged: judged(1, edge + 70) },
      },
      cascade: { money: of(800), edge: edge + 80 },
      binance: of(900),
    },
    flag: null,
    settled: false,
    rank: false,
    ...o,
  };
}

const SET = Array.from({ length: 24 }, (_, k) => copy(k));
/** The statistic of copies, each value read as told. */
const statOf = (
  cs: readonly PrintCopy[],
  x: (c: PrintCopy) => number | null,
  e: (c: PrintCopy) => number | null,
) =>
  statisticOf(
    kit,
    cs.map((c): JudgedCopy => ({
      addr: c.addr,
      tIn: c.tIn,
      x: x(c),
      edge: e(c),
      thin: c.thin,
    })),
  );
const net = (m: Money) => (m.reason === undefined ? m.net : null);
const items = (
  cs: readonly PrintCopy[],
  x: (c: PrintCopy) => number | null,
): Item[] =>
  cs.flatMap((c) => {
    const v = x(c);
    return v === null ? [] : [{ addr: c.addr, tIn: c.tIn, x: v }];
  });

describe("the paper's look's helpers", () => {
  it("give the normal's upper tail, the equity's largest fall in follow order and the mean without the group that moves it most", () => {
    expect(normalUpper(0)).toBeCloseTo(0.5, 7);
    expect(normalUpper(1.96)).toBeCloseTo(0.0249979, 6);
    expect(normalUpper(-1.96)).toBeCloseTo(1 - 0.0249979, 6);
    // $ = bps ÷ 10 a copy: +10, −20, −15, −25 in follow order; peak 10, trough −25.
    const x = [100, -300, 50, -100].map((v, k) => ({
      addr: "a",
      tIn: k,
      x: v,
    }));
    expect(drawdownUsd([x[2]!, x[0]!, x[3]!, x[1]!])).toBe(35);
    const g = [
      { addr: "a", tIn: 0, x: 10 },
      { addr: "a", tIn: 1, x: 10 },
      { addr: "b", tIn: 2, x: -30 },
      { addr: "c", tIn: 3, x: 1 },
    ];
    expect(withoutMost(g, (i) => i.addr)).toEqual({ key: "a", without: -14.5 });
    expect(withoutMost(g.slice(0, 2), (i) => i.addr)).toBeNull();
  });
});

describe("R14's list on MAIN's set (C13)", () => {
  const set = SET.map((c, k) =>
    k === 3
      ? { ...c, money: { reason: "no mark at an exit instant" } }
      : k === 5
        ? { ...c, flag: "open" as const, settled: true }
        : k === 7
          ? { ...c, flag: "crossing" as const, gap: true }
          : k === 9
            ? { ...c, judged: { ...c.judged, MAIN: judged(null, null) } }
            : // An entry of direction 0 (a size-0 OPEN stays an entry, the supervisor's ruling on Q3): not long.
              k === 11
              ? { ...c, dir: 0 }
              : c,
  );
  const o = { z: 2.81, look: 1 as const, start: START, end: END, endS: END_S };
  const r = r14Of(kit, set, o);
  const pricedSet = set.filter((c) => c.money.reason === undefined);
  const x = items(pricedSet, (c) => net(c.money));
  const m = twoWay(kit, x)!;

  it("counts the set, its unpriced by reason, its open, crossing and gap copies", () => {
    expect(r).toMatchObject({
      copies: 24,
      traders: 4,
      days: new Set(set.map((c) => Math.floor(c.tIn / DAY_MS))).size,
      unpriced: { "no mark at an exit instant": 1 },
      unpricedShare: 1 / 24,
      open: 1,
      crossing: 1,
      gap: 1,
    });
  });

  it("reads the money, its bounds and band, d, the gross, fees, funding, wins and holds from the priced copies' own fields", () => {
    expect(r.money).toEqual(m);
    expect(r.oneWayLower).toEqual({
      byTrader: m.mean - 2.81 * m.seTrader!,
      byDay: m.mean - 2.81 * m.seDay!,
    });
    expect(r.tBandHalfWidth).toBe(
      kit.stats.tCritical(2 * normalUpper(2.81), m.days - 1) * m.seDay!,
    );
    const dd = items(set, (c) => c.judged.MAIN?.d ?? null);
    expect(r.d).toEqual(twoWay(kit, dd));
    expect(r.dReasons).toEqual({ "no trades in the hour": 1 });
    const gross = twoWay(
      kit,
      items(pricedSet, (c) =>
        c.money.reason === undefined ? c.money.gross : null,
      ),
    )!;
    expect(r.gross).toEqual({
      mean: gross.mean,
      se: gross.se,
      breakEvenRoundTrip: gross.mean - 2.81 * gross.se!,
    });
    const field = (f: "fees" | "funding" | "holdMs") =>
      pricedSet.map((c) => (c.money.reason === undefined ? c.money[f] : NaN));
    const mean = (v: number[]) => v.reduce((s, y) => s + y, 0) / v.length;
    expect(r.fees).toBe(mean(field("fees")));
    expect(r.funding).toBe(mean(field("funding")));
    expect(r.winLoss).toEqual({
      ...kit.exits.winLoss(x.map((i) => i.x)),
      label: "exits can flatter these; only money measures",
    });
    expect(r.holdMs).toEqual({
      median: kit.exits.quantile(field("holdMs"), 0.5),
      q1: kit.exits.quantile(field("holdMs"), 0.25),
      q3: kit.exits.quantile(field("holdMs"), 0.75),
    });
    expect(r.eValue).toEqual(
      dailyEValue(dd.map((i) => ({ tIn: i.tIn, d: i.x }))),
    );
  });

  it("finds the worst day and trader, the equity's fall, the influential account and day, the closed copies alone, the long share, copies a week and the smallest edge at look 2", () => {
    const sums = new Map<string, number>();
    for (const i of x) sums.set(i.addr, (sums.get(i.addr) ?? 0) + i.x);
    const worstTrader = [...sums].sort((a, b) => a[1] - b[1])[0]!;
    expect(r.worstTrader).toMatchObject({
      key: worstTrader[0],
      bps: worstTrader[1],
    });
    expect(r.worstDay?.key).toMatch(/^2025-0[67]-\d\d$/);
    expect(r.drawdownUsd).toBe(drawdownUsd(x));
    const acct = withoutMost(x, (i) => i.addr)!;
    expect(r.withoutMostInfluentialAccount).toEqual(acct);
    expect(r.withoutItAndTheMostInfluentialDay).toEqual(
      withoutMost(
        x.filter((i) => i.addr !== acct.key),
        (i) =>
          new Date(Math.floor(i.tIn / DAY_MS) * DAY_MS)
            .toISOString()
            .slice(0, 10),
      ),
    );
    // The closed copies: flag null, so never the settled (open) one nor the crossing one.
    expect(r.closedOnly).toEqual(
      twoWay(
        kit,
        items(
          pricedSet.filter((c) => c.flag === null),
          (c) => net(c.money),
        ),
      ),
    );
    expect(r.closedOnly!.n).toBe(pricedSet.length - 2);
    expect(r.longShare).toBe(set.filter((c) => c.dir > 0).length / 24);
    expect(set.filter((c) => c.dir === 0)).toHaveLength(1);
    expect(r.copiesAWeek).toBe(24 / 10);
    const e = statOf(
      set,
      (c) => net(c.money),
      (c) => c.judged.MAIN?.edge ?? null,
    );
    expect([m.se, e.edge.se].includes(null)).toBe(false);
    const root = Math.sqrt(70 / 140);
    expect(r.smallestEdgeAtLook2).toEqual({
      money: (2.43 + 0.8416212335729143) * m.se! * root,
      edge: (2.43 + 0.8416212335729143) * e.edge.se! * root,
    });
    expect(r14Of(kit, set, { ...o, look: 2 }).smallestEdgeAtLook2).toBeNull();
  });
});

describe("every line's figures (C7, C13)", () => {
  const voted = [
    ...SET.map((c, k) => ({ ...c, rank: k % 3 === 1 })),
    // A BROAD copy alone: in BROAD only.
    { ...copy(30), lines: ["BROAD" as const], main: null },
  ];
  const main = voted.filter((c) => c.lines.includes("MAIN"));
  const l = linesOf(kit, voted);
  const mainEdge = (c: PrintCopy) => c.judged.MAIN?.edge ?? null;
  const mainOf = (c: PrintCopy) => c.main!;

  it("reads TEN, BROAD and DAY on their own copies and x′", () => {
    expect(l.MAIN).toEqual(statOf(main, (c) => net(c.money), mainEdge));
    expect(l.TEN).toEqual(
      statOf(
        voted.filter((c) => c.lines.includes("TEN")),
        (c) => net(c.money),
        (c) => c.judged.TEN?.edge ?? null,
      ),
    );
    expect(l.BROAD).toEqual(
      statOf(
        voted,
        (c) => net(c.money),
        (c) => c.judged.BROAD?.edge ?? null,
      ),
    );
    expect(l.BROAD!.copies).toBe(25);
    expect(l.DAY!.copies).toBe(0);
  });

  it("reads STOP2, STOP5 and DAYS7 on their own net with MAIN's x′, JUMP's three groups, the moved lines on their own money and x′, and RANK's copies", () => {
    expect(l.STOP2).toEqual(
      statOf(main, (c) => net(mainOf(c).stop.STOP2), mainEdge),
    );
    expect(l.STOP5).toEqual(
      statOf(main, (c) => net(mainOf(c).stop.STOP5), mainEdge),
    );
    expect(l.DAYS7).toEqual(
      statOf(main, (c) => net(mainOf(c).days7), mainEdge),
    );
    const j = (keep: (v: number | null) => boolean) =>
      main.filter((c) => keep(mainOf(c).jump));
    expect(l["JUMP>3"]!.copies).toBe(0);
    expect(l["JUMP<=3"]).toEqual(
      statOf(
        j((v) => v !== null && v <= 3),
        (c) => net(c.money),
        mainEdge,
      ),
    );
    expect(l["JUMP none"]).toEqual(
      statOf(
        j((v) => v === null),
        (c) => net(c.money),
        mainEdge,
      ),
    );
    expect(l["JUMP none"]!.copies).toBe(6);
    for (const v of MOVED)
      expect(l[v.line], v.line).toEqual(
        statOf(
          main,
          (c) => net(mainOf(c).moved[v.line].money),
          (c) => mainOf(c).moved[v.line].judged.edge,
        ),
      );
    expect(l.RANK).toEqual(
      statOf(
        main.filter((c) => c.rank),
        (c) => net(c.money),
        mainEdge,
      ),
    );
    expect(l.RANK!.copies).toBe(8);
    // A J of exactly 3 is at most 3; above it, above.
    const jumped = linesOf(kit, [
      { ...copy(1), main: { ...copy(1).main!, jump: 3 } },
      { ...copy(2), main: { ...copy(2).main!, jump: 3.0001 } },
    ]);
    expect([jumped["JUMP<=3"]!.copies, jumped["JUMP>3"]!.copies]).toEqual([
      1, 1,
    ]);
  });

  it("splits MAIN by side, by the UTC month of t and by slice", () => {
    const p = partsOf(kit, main);
    expect(Object.keys(p.sides)).toEqual(["long", "short"]);
    // An entry of direction 0 is neither side.
    const flat = partsOf(kit, [{ ...main[0]!, dir: 0 }, main[1]!]).sides;
    expect(Object.keys(flat)).toEqual(["long", "none"]);
    expect(p.sides.short).toEqual(
      statOf(
        main.filter((c) => c.dir < 0),
        (c) => net(c.money),
        mainEdge,
      ),
    );
    expect(Object.keys(p.months)).toEqual(["2025-06", "2025-07"]);
    expect(p.months["2025-06"]!.copies).toBe(
      main.filter((c) => c.t < Date.parse("2025-07-01T00:00:00Z")).length,
    );
    expect(Object.keys(p.slices)).toEqual(["0", "1", "2", "3"]);
    expect(p.slices["1"]).toEqual(
      statOf(
        main.filter((c) => sliceOf(c.addr) === 1),
        (c) => net(c.money),
        mainEdge,
      ),
    );
  });
});

describe("concentration and the report's other prints (C13)", () => {
  it("gives the two best days' share and the mean without them, the top traders' share and the mean without the ten, the event level and the most copies of one trader", () => {
    const cs = [
      copy(0, { addr: addr(9), t: START, money: priced(50, 0) }),
      copy(1, { addr: addr(9), t: START + 10 * 60_000, money: priced(30, 1) }),
      copy(2, { addr: addr(8), t: START + DAY_MS, money: priced(-10, 2) }),
      copy(3, { addr: addr(7), t: START + 2 * DAY_MS, money: priced(20, 3) }),
      copy(4, {
        addr: addr(7),
        t: START + 3 * DAY_MS,
        money: { reason: "no mark at the follow instant" },
      }),
      // Coin, side and day of addr(9)'s two, two hours later: its own event.
      copy(5, { addr: addr(6), t: START + 2 * HOUR_MS, money: priced(10, 5) }),
    ].map((c) => ({ ...c, iid: 2, dir: 1, tIn: c.t + 5_000 }));
    // A short of addr(9)'s coin and hour: its own event.
    const t6 = START + 20 * 60_000;
    cs.push({
      ...copy(6, { addr: addr(5), t: t6, money: priced(-4, 6) }),
      iid: 2,
      dir: -1,
      tIn: t6 + 5_000,
    });
    const c = concentrationOf(cs);
    // Day sums: 86, −10, 20: the best two 86 and 20 of a total 96.
    expect(c.bestDaysShare).toBe(106 / 96);
    expect(c.meanWithoutBestDays).toBe(-10);
    // Trader sums: addr(9) 80, addr(7) 20, addr(6) 10, addr(5) −4, addr(8) −10: the top 1% is ⌈5 × 0.01⌉ = 1 trader.
    expect(c.topTradersShare).toBe(80 / 96);
    expect(c.meanWithoutTopTen).toBeNull();
    // Events: addr(9)'s two copies share coin, side and hour; addr(6)'s hour and addr(5)'s side are their own.
    expect(c.eventLevel).toEqual({
      events: 5,
      mean: (40 + 10 - 4 - 10 + 20) / 5,
    });
    expect(c.mostCopiesOfOneTrader).toEqual({ addr: addr(7), copies: 2 });
  });

  it("reads the venues, H1's prints, the settled and thin copies and the cascade print from their own fields, with no verdict word", () => {
    const voted = SET.map((c, k) => ({
      ...c,
      settled: k % 6 === 0,
      flag: k % 6 === 0 ? ("open" as const) : null,
      thin: k % 5 === 0,
      judged: k === 6 ? { ...c.judged, MAIN: judged(null, null) } : c.judged,
    }));
    const o = {
      z: 2.81,
      look: 1 as const,
      start: START,
      end: END,
      endS: END_S,
    };
    const r = reportOf(kit, voted, o);
    const mainEdge = (c: PrintCopy) => c.judged.MAIN?.edge ?? null;
    const own = (c: PrintCopy) => net(c.money);
    expect(r.r14).toEqual(r14Of(kit, voted, o));
    expect(r.venues).toEqual({
      hyperliquidBase: statOf(voted, own, mainEdge),
      binance: statOf(voted, (c) => net(c.main!.binance), mainEdge),
    });
    const withD = voted.filter((c) => c.judged.MAIN?.d != null);
    expect(r.h1.nullMeanGross).toBe(
      withD.reduce(
        (s, c) => s + (c.judged.MAIN as { nullGross: number }).nullGross,
        0,
      ) / withD.length,
    );
    expect(r.h1.d).toEqual(
      twoWay(
        kit,
        items(voted, (c) => c.judged.MAIN?.d ?? null),
      ),
    );
    expect(r.h1.edge).toEqual(statOf(voted, own, mainEdge).edge);
    const x = items(voted, own);
    expect(r.h1.moneyByWeek).toEqual(
      twoWay(
        kit,
        x.map((i) => ({ ...i, tIn: weekOf(i.tIn) })),
      ),
    );
    expect(r.h1.moneyByMonth!.days).toBe(2);
    expect(r.settled).toEqual({
      copies: 4,
      withoutD: 1,
      main: statOf(voted, own, mainEdge),
      withoutSettled: statOf(
        voted.filter((c) => !c.settled),
        own,
        mainEdge,
      ),
    });
    expect(r.thin).toEqual({
      copies: 5,
      share: 5 / 24,
      withoutThin: statOf(
        voted.filter((c) => !c.thin),
        own,
        mainEdge,
      ),
    });
    expect(r.cascade).toEqual(
      statOf(
        voted,
        (c) => net(c.main!.cascade.money),
        (c) => c.main!.cascade.edge,
      ),
    );
    expect(JSON.stringify(r)).not.toMatch(
      /KEEP|DROP|WITHHELD|TOO FEW|Keep|Drop|Withheld|Too few/,
    );
  });

  it("keeps of a position what the prints read: its follow instant, flags and readings, not its exits, legs or covariates", () => {
    const c = copy(1);
    const p = {
      ...c,
      id: "x",
      type: "OPEN",
      D: 5_000,
      M: START,
      exits: [],
      plan: { legs: [], flag: "crossing", lastExitT: null, settled: true },
      voted: true,
      covariates: {
        closedCycles: 3,
        medianHoldHours: 7,
        longShare: 0.5,
        entries: 4,
        coin: 2,
        sizeUsd: 10,
        priorCopies: 0,
      },
    } as Position;
    expect(printCopyOf(p, true)).toEqual({
      ...c,
      tIn: c.t + 5_000,
      flag: "crossing",
      settled: true,
      rank: true,
    });
  });
});
