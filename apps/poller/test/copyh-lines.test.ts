/**
 * The lines (src/copyh/lines.ts; rules.md C7): each account-level condition
 * on both sides of its threshold, the coverage the caller's, an account the
 * kit is not run on in no line; the account-level lines equal to the
 * paper's own `linesAt` on a grid; an entry's lines only in a primary market;
 * DELAY0 and LAST on the minute's last price, DELAY+5 and DELAY+15 on C9's
 * marks with every leg moved, each priced as written out; RANK's top fifth
 * (⌈n ÷ 5⌉), its five copies, its window's two edges and its ties by
 * address; SLICES disjoint and whole, the address's number mod 4.
 */
import { describe, expect, it } from "vitest";
import { delayOf, entriesIn, historyOf } from "../src/copyh/entries.js";
import { WEEK_MS } from "../src/copyh/instants.js";
import type { Coverage } from "../src/copyh/labels.js";
import {
  LINES,
  MOVED,
  accountLines,
  entryLines,
  rankAt,
  sliceOf,
  type AccountLines,
  type RankCopy,
} from "../src/copyh/lines.js";
import { coinMarkets, type Bars } from "../src/copyh/markets.js";
import { moneyOf, planOf } from "../src/copyh/money.js";
import { linesAt } from "../src/paper/account.js";
import { loadResearch, type Setting } from "../src/paper/research.js";
import { HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { addr } from "./copyh-world.js";
import { FillBook } from "./copyh-engine-world.js";

const kit = await loadResearch();
const MIN = MINUTE_MS;
const COVERED: Coverage = { labelCovered: true, habitCovered: true };
const lines = (
  label: string,
  closed: number,
  holdHours: number | null,
  coverage = COVERED,
) =>
  accountLines(
    label,
    {
      closed,
      medianHoldMs: holdHours === null ? null : holdHours * HOUR_MS,
    },
    coverage,
  );
const set = (...on: string[]): AccountLines => ({
  MAIN: on.includes("MAIN"),
  TEN: on.includes("TEN"),
  BROAD: on.includes("BROAD"),
  DAY: on.includes("DAY"),
});

describe("an account's lines at M (C7; R7)", () => {
  it("MAIN: P1, the habit window covered, a median hold of 6 h and 3 closed cycles, each on both sides", () => {
    expect(lines("directional", 3, 6)).toEqual(set("MAIN", "BROAD"));
    expect(lines("directional", 2, 6)).toEqual(set("BROAD"));
    expect(lines("directional", 3, 6 - 1 / 3_600_000)).toEqual(set("BROAD"));
    expect(lines("directional", 3, null)).toEqual(set("BROAD"));
    expect(
      lines("directional", 3, 6, { labelCovered: true, habitCovered: false }),
    ).toEqual(set("BROAD"));
  });

  it("TEN at 10 closed cycles, DAY at a median hold of 24 h, each with MAIN only", () => {
    expect(lines("directional", 10, 24)).toEqual(
      set("MAIN", "TEN", "BROAD", "DAY"),
    );
    expect(lines("directional", 9, 24)).toEqual(set("MAIN", "BROAD", "DAY"));
    expect(lines("directional", 10, 24 - 1 / 3_600_000)).toEqual(
      set("MAIN", "TEN", "BROAD"),
    );
    // Neither without MAIN.
    expect(
      lines("directional", 10, 24, { labelCovered: true, habitCovered: false }),
    ).toEqual(set("BROAD"));
  });

  it("BROAD is P1: directional with its label window covered; none for another label, an uncovered window or an account the kit is not run on", () => {
    expect(lines("unclassified — mixed", 10, 24)).toEqual(set());
    expect(lines("too many fills for the kit", 10, 24)).toEqual(set());
    expect(
      lines("directional", 10, 24, { labelCovered: false, habitCovered: true }),
    ).toEqual(set());
    expect(accountLines("directional", null, COVERED)).toEqual(set());
  });

  it("equals the paper's own linesAt on a grid of labels, coverage, holds and cycles: MAIN the paper's rule as frozen (the engine review's L9)", () => {
    const labels = [
      "directional",
      "market maker",
      "no fills in window",
      "unclassified — mixed",
    ];
    const holds = [null, 6, 24, 30].flatMap((h) =>
      h === null ? [null] : [h * HOUR_MS - 1, h * HOUR_MS],
    );
    let cells = 0;
    for (const label of labels)
      for (const labelCovered of [true, false])
        for (const habitCovered of [true, false])
          for (const medianHoldMs of holds)
            for (const closed of [0, 2, 3, 9, 10, 11]) {
              const paper = linesAt({
                label,
                closed,
                medianHoldMs,
                longShare: 0.5,
                labelCovered,
                habitCovered,
              });
              expect(
                accountLines(
                  label,
                  { closed, medianHoldMs },
                  { labelCovered, habitCovered },
                ),
                `${label} ${labelCovered} ${habitCovered} ${medianHoldMs} ${closed}`,
              ).toEqual({
                MAIN: paper.main,
                TEN: paper.ten,
                BROAD: paper.p1,
                DAY: paper.day,
              });
              cells += 1;
            }
    expect(cells).toBe(4 * 2 * 2 * 7 * 6);
  });

  it("gives an entry its account's lines in C7's order, and none outside a primary market", () => {
    const all = lines("directional", 10, 24);
    expect(entryLines(all, true)).toEqual(["MAIN", "TEN", "BROAD", "DAY"]);
    expect(entryLines(lines("directional", 3, 6), true)).toEqual([
      "MAIN",
      "BROAD",
    ]);
    expect(entryLines(all, false)).toEqual([]);
    expect(LINES).toEqual(["MAIN", "TEN", "BROAD", "DAY"]);
  });
});

/** A made-up SOL tape from T0 − 1 h: a trade every minute, the last price apart from the minute's VWAP. */
const T0 = Date.parse("2025-09-08T10:00:00Z");
const START = T0 - HOUR_MS;
const N = 6 * 60;
const vwap = (k: number) => 100 + ((k * k) % 41) / 8;
const last = (k: number) => vwap(k) + 0.25 + (k % 7) / 16;
const BARS: Bars = {
  iid: 2,
  start: START,
  n: N,
  trades: Uint32Array.from({ length: N }, (_, k) => 1 + (k % 3)),
  sz: Float64Array.from({ length: N }, (_, k) => 1 + (k % 5)),
  ntl: Float64Array.from({ length: N }, (_, k) => (1 + (k % 5)) * vwap(k)),
  last: Float64Array.from({ length: N }, (_, k) => last(k)),
  pairGap: new Float64Array(N),
  pairs: new Uint32Array(N),
  settleSz: new Float64Array(N),
  settleNtl: new Float64Array(N),
};
const END = START + N * MIN;
const COIN = { bars: BARS, end: END, settlement: null, name: "SOL" };
const MARKETS = coinMarkets(kit, COIN, [], 5)!;
const SETTING: Setting = {
  name: "made-up",
  fee: () => 0.00045,
  spread: () => ({ c: 2e-4, fallback: false }),
};

describe("MAIN's copies at another delay or on other marks (C7; M7)", () => {
  const A = addr(0xa1);
  const book = new FillBook()
    .order({ t: T0 + 10 * MIN + 3_000, oid: 1, side: 1, sizes: [2] })
    .order({ t: T0 + 70 * MIN + 9_000, oid: 2, side: -1, sizes: [2] });
  const built = historyOf(kit, book.fills, { fills: 1e9, exits: 1e9 });
  if (built.kind !== "built") throw new Error(built.kind);
  const [g] = entriesIn(built.history.groups, T0, END);
  const exits = kit.exits.exitsOf(g!, built.history.liqKeys);
  const { D } = delayOf(kit, A, g!);
  const exitT = T0 + 70 * MIN + 9_000;
  const k = (x: number) => Math.floor((x - START) / MIN);

  it("are DELAY0 at D = 0 and LAST at D on the last prices, DELAY+5 and DELAY+15 at D + 5 and + 15 min on C9's marks", () => {
    expect(MOVED.map((v) => [v.line, v.delay(D) - D, v.marks])).toEqual([
      ["DELAY0", -D, "last"],
      ["DELAY+5", 5 * MIN, "vwap"],
      ["DELAY+15", 15 * MIN, "vwap"],
      ["LAST", 0, "last"],
    ]);
  });

  it("move every leg by their delay and price each on its own marks, as written out", () => {
    for (const v of MOVED) {
      const delay = v.delay(D);
      const tIn = g!.t + delay;
      const plan = planOf({ t: g!.t, D: delay }, exits, COIN);
      expect(plan.legs.map((l) => tIn + l.h)).toEqual([exitT + delay]);
      const money = moneyOf(
        kit,
        MARKETS[v.marks],
        { dir: 1, tIn, plan },
        SETTING,
      );
      if (money.reason !== undefined) throw new Error(money.reason);
      const price = v.marks === "last" ? last : vwap;
      const a = price(k(tIn));
      const b = price(k(exitT + delay));
      expect(money.gross).toBeCloseTo(((b - a) / a) * 1e4, 9);
    }
    // DELAY0's marks are the trader's own minutes' last prices.
    expect(k(g!.t)).toBe(70);
    expect(kit.panel.markAtMinuteEnd(MARKETS.last, g!.t)).toBe(last(70));
  });
});

describe("RANK (C7)", () => {
  const M = Date.parse("2026-01-05T00:00:00Z");
  const FROM = M - 12 * WEEK_MS;
  /** n copies of one trader, each net `net`, inside the window. */
  const copies = (a: string, n: number, net: number): RankCopy[] =>
    Array.from({ length: n }, (_, i) => ({
      addr: a,
      tIn: FROM + (i + 1) * HOUR_MS,
      lastLeg: FROM + (i + 2) * HOUR_MS,
      net,
    }));
  const traders = (n: number) =>
    Array.from({ length: n }, (_, i) => addr(i + 1));
  const ranked = (n: number) =>
    traders(n).flatMap((a, i) => copies(a, 5, 10 + i * i));

  it("keeps the first ⌈n ÷ 5⌉ of the n ranked by their mean net", () => {
    for (const [n, kept] of [
      [5, 1],
      [6, 2],
      [10, 2],
      [11, 3],
    ] as const) {
      const top = rankAt(M, new Set(traders(n)), ranked(n));
      expect(top.size, `n ${n}`).toBe(kept);
      // The highest means: the last traders.
      expect([...top].sort()).toEqual(
        traders(n)
          .slice(n - kept)
          .sort(),
      );
    }
  });

  it("ranks a trader only with five priced MAIN copies inside [M − 12 w, M), and only when it is MAIN's at M", () => {
    const a = addr(0x10);
    const b = addr(0x20);
    const c = addr(0x30);
    const base = traders(4).flatMap((t) => copies(t, 5, 1));
    // a's fifth copy starts 1 ms before the window, b's ends at M: four each.
    const aCopies = copies(a, 5, 99).map((x, i) =>
      i === 0 ? { ...x, tIn: FROM - 1 } : x,
    );
    const bCopies = copies(b, 5, 98).map((x, i) =>
      i === 0 ? { ...x, lastLeg: M } : x,
    );
    const cCopies = copies(c, 5, 97);
    const main = new Set([...traders(4), a, b, c]);
    expect([
      ...rankAt(M, main, [...base, ...aCopies, ...bCopies, ...cCopies]),
    ]).toEqual([c]);
    // At the window's edges, a copy from M − 12 w and one ending at M − 1 ms count: n = 6, two kept.
    const edges = copies(a, 5, 99).map((x, i) =>
      i === 0 ? { ...x, tIn: FROM } : i === 1 ? { ...x, lastLeg: M - 1 } : x,
    );
    expect([...rankAt(M, main, [...base, ...edges, ...cCopies])]).toEqual([
      a,
      c,
    ]);
    // c not MAIN's at M: out, whatever its copies.
    main.delete(c);
    expect(rankAt(M, main, [...base, ...cCopies]).has(c)).toBe(false);
  });

  it("breaks a tie of means by address, the smaller first", () => {
    const low = addr(0x5);
    const high = addr(0x6);
    const rest = traders(4).flatMap((t) => copies(t, 5, 1));
    const top = rankAt(M, new Set([...traders(4), low, high]), [
      ...rest,
      ...copies(high, 5, 50),
      ...copies(low, 5, 50),
    ]);
    // n = 6: two kept, both tied at the top.
    expect([...top]).toEqual([low, high]);
    const one = rankAt(M, new Set([...traders(3), low, high]), [
      ...traders(3).flatMap((t) => copies(t, 5, 1)),
      ...copies(high, 5, 50),
      ...copies(low, 5, 50),
    ]);
    expect([...one]).toEqual([low]);
  });
});

describe("SLICES (C7)", () => {
  it("are four disjoint groups, whole, by the address's number mod 4", () => {
    const addrs = Array.from(
      { length: 64 },
      (_, i) => `0x${(i * 2654435761).toString(16).padStart(40, "9")}`,
    );
    const groups = [0, 1, 2, 3].map((s) =>
      addrs.filter((a) => sliceOf(a) === s),
    );
    expect(groups.flat().sort()).toEqual([...addrs].sort());
    for (const g of groups) expect(g.length).toBeGreaterThan(0);
    for (const a of addrs) expect(sliceOf(a)).toBe(Number(BigInt(a) % 4n));
    expect(
      [addr(0x10), addr(0x11), addr(0x12), addr(0x1f)].map(sliceOf),
    ).toEqual([0, 1, 2, 3]);
  });
});
