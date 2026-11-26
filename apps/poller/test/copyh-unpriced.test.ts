/**
 * Unpriced, missing, gap (src/copyh/unpriced.ts, money.ts; rules.md C11):
 * each of lib-exits' three reasons on a made-up market (no mark at the
 * follow instant, none at an exit instant, a funding settlement without a
 * mark); a gap copy by a chain break inside its exits and none by a break
 * after them; by a hole meeting [t, its last exit], none by a hole that
 * begins at the last exit's own record, ends at t, or lies after the last
 * exit, and one past the last exit while the copy is open; the holes of a
 * reading from the store's own pass and merge, joined across two stores.
 */
import { describe, expect, it } from "vitest";
import { delayOf, entriesIn, historyOf } from "../src/copyh/entries.js";
import { marketOf } from "../src/copyh/markets.js";
import { moneyOf, planOf } from "../src/copyh/money.js";
import { holesOfReading, isGap } from "../src/copyh/unpriced.js";
import {
  loadResearch,
  type Fill,
  type PanelFile,
  type Setting,
} from "../src/paper/research.js";
import { HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { addr, byBlock, keyOf, trade } from "./copyh-world.js";
import { FillBook, storeOf } from "./copyh-engine-world.js";

const kit = await loadResearch();
const MIN = MINUTE_MS;
const A = `0x${"0".repeat(39)}a`;
const T0 = Date.parse("2025-09-08T10:00:00Z");
const END = T0 + 12 * HOUR_MS;
const UNSETTLED = { end: END, settlement: null };
const NONE: Setting = {
  name: "none",
  fee: () => 0,
  spread: () => ({ c: 0, fallback: false }),
};

/** A long of 3 at T0, a third sold at 2 h, the rest closed at 5 h; a new long at 8 h. */
function account(): FillBook {
  const book = new FillBook();
  book.order({ t: T0, oid: 1, side: 1, sizes: [3] });
  book.order({ t: T0 + 2 * HOUR_MS, oid: 2, side: -1, sizes: [1] });
  book.order({ t: T0 + 5 * HOUR_MS, oid: 3, side: -1, sizes: [2] });
  book.order({ t: T0 + 8 * HOUR_MS, oid: 4, side: 1, sizes: [1] });
  return book;
}
/** The kit's history of these fills, and its first entry's plan to END. */
function copyOf(fills: readonly Fill[]) {
  const built = historyOf(kit, fills, { fills: 1e9, exits: 1e9 });
  if (built.kind !== "built") throw new Error(built.kind);
  const h = built.history;
  const g = entriesIn(h.groups, T0, END)[0]!;
  const { D } = delayOf(kit, A, g);
  const plan = planOf(
    { t: g.t, D },
    kit.exits.exitsOf(g, h.liqKeys),
    UNSETTLED,
  );
  return { h, g, D, plan };
}
/** One fill's chain head moved: the size the order saw before it, as if fills were missing. */
const broken = (fills: readonly Fill[], i: number, prev: number): Fill[] =>
  fills.map((f, k) => (k === i ? { ...f, prev, prevS: String(prev) } : f));

describe("the unpriced reasons", () => {
  /** A made-up SOL panel of 8 hours from T0, its marks null in the minutes given, a funding row each hour. */
  const panel = (quiet: (i: number) => boolean): PanelFile => ({
    iid: 2,
    symbol: "SOL",
    category: "main dex",
    start: T0,
    end: T0 + 8 * HOUR_MS,
    firstTrade: T0,
    retired: null,
    marks: Array.from({ length: 480 }, (_, i) =>
      quiet(i) ? null : 50 + (i % 17) / 4,
    ),
    klines: { minute: [], trades: [], volume: [] },
    funding: Array.from({ length: 7 }, (_, k): [number, number, number] => [
      T0 + (k + 1) * HOUR_MS,
      1e-5,
      T0 + (k + 1) * HOUR_MS + 40,
    ]),
  });
  const { g, D, plan } = copyOf(account().fills);
  const reasonOn = (quiet: (i: number) => boolean) => {
    const mk = marketOf(kit, panel(quiet), T0 + 8 * HOUR_MS, 5);
    return moneyOf(kit, mk, { dir: 1, tIn: g.t + D, plan }, NONE).reason;
  };
  const minuteOf = (t: number) => Math.floor((t - T0) / MIN);

  it("prices the copy when every instant finds a mark", () => {
    expect(reasonOn(() => false)).toBeUndefined();
  });

  it("names no mark at the follow instant: its minute and the five before quiet", () => {
    const m = minuteOf(g.t + D);
    expect(reasonOn((i) => i >= m - 5 && i <= m)).toBe(
      "no mark at the follow instant",
    );
  });

  it("names no mark at an exit instant: the 2 h exit's minute and the five before quiet", () => {
    const m = minuteOf(T0 + 2 * HOUR_MS + D);
    expect(reasonOn((i) => i >= m - 5 && i <= m)).toBe(
      "no mark at an exit instant",
    );
  });

  it("names a funding settlement without a mark: the six minutes before 13:00 quiet inside the hold", () => {
    const m = minuteOf(T0 + 3 * HOUR_MS);
    expect(reasonOn((i) => i >= m - 6 && i < m)).toBe(
      "a funding settlement without a mark",
    );
    // Five quiet minutes leave the kit's stale mark: priced.
    expect(reasonOn((i) => i >= m - 5 && i < m)).toBeUndefined();
  });
});

describe("a gap copy", () => {
  it("is one whose exits cross a chain break, and not one whose break comes after its last exit", () => {
    const fills = account().fills;
    const clean = copyOf(fills);
    expect(isGap(kit, clean.h, clean.g, clean.plan, [], END)).toBe(false);
    // The 2 h sale saw 2.5 before it, not 3: breaks inside the copy's exits.
    const inside = copyOf(broken(fills, 1, 2.5));
    expect(inside.h.chain.breaks.length).toBeGreaterThan(0);
    expect(isGap(kit, inside.h, inside.g, inside.plan, [], END)).toBe(true);
    // The 8 h buy saw 0.5, not 0: a break after the copy's last exit.
    const after = copyOf(broken(fills, 3, 0.5));
    expect(after.h.chain.breaks).toHaveLength(1);
    expect(isGap(kit, after.h, after.g, after.plan, [], END)).toBe(false);
  });

  it("is one that a hole's stretch meets in [t, its last exit]; none at the exit's own record, at t, or after the exit", () => {
    const { h, g, plan } = copyOf(account().fills);
    const x = T0 + 5 * HOUR_MS;
    expect(plan.lastExitT).toBe(x);
    const gap = (a: number, b: number) => isGap(kit, h, g, plan, [[a, b]], END);
    expect(gap(T0 + HOUR_MS, T0 + HOUR_MS + 2 * MIN)).toBe(true);
    expect(gap(x - 1, x + 2 * MIN)).toBe(true);
    expect(gap(x, x + 2 * MIN)).toBe(false);
    expect(gap(T0 - 2 * MIN, T0 + 1)).toBe(true);
    expect(gap(T0 - 2 * MIN, T0)).toBe(false);
    expect(gap(x + HOUR_MS, x + HOUR_MS + 2 * MIN)).toBe(false);
  });

  it("is one that a hole meets after its last exit while it is open, to its plan's end", () => {
    const book = new FillBook();
    book.order({ t: T0, oid: 1, side: 1, sizes: [3] });
    book.order({ t: T0 + 2 * HOUR_MS, oid: 2, side: -1, sizes: [1] });
    const { h, g, plan } = copyOf(book.fills);
    expect(plan.flag).toBe("open");
    const hole: [number, number] = [
      T0 + 6 * HOUR_MS,
      T0 + 6 * HOUR_MS + 2 * MIN,
    ];
    expect(isGap(kit, h, g, plan, [hole], END)).toBe(true);
    expect(isGap(kit, h, g, plan, [hole], T0 + 6 * HOUR_MS)).toBe(false);
  });
});

describe("the holes of a reading", { timeout: 60_000 }, () => {
  it("are every stretch of 60 s without a record, joined across two stores at their boundary", async () => {
    const H0 = Date.parse("2025-08-31T22:00:00Z");
    const H1 = H0 + HOUR_MS;
    const B = addr(0x0b);
    const at = (time: number, tid: number) =>
      trade(A, B, { coin: "SOL", side: "B", time, tid });
    const first = await storeOf(
      new Map([
        [
          keyOf(H0),
          `${byBlock(1, [...at(H0 + 10_000, 1), ...at(H0 + 69_000, 2), ...at(H1 - 30_000, 3)])}\n`,
        ],
      ]),
      H0,
      H1,
    );
    const second = await storeOf(
      new Map([[keyOf(H1), `${byBlock(1, [...at(H1 + 2 * MIN, 4)])}\n`]]),
      H1,
      H1 + HOUR_MS,
    );
    // 59 s between the first two records and 30 s before the window's end: no hole.
    expect(holesOfReading([first], H1)).toEqual([[H0 + 69_000, H1 - 30_000]]);
    expect(holesOfReading([first, second], H1 + HOUR_MS)).toEqual([
      [H0 + 69_000, H1 - 30_000],
      [H1 - 30_000, H1 + 2 * MIN],
      [H1 + 2 * MIN, H1 + HOUR_MS],
    ]);
  });

  it("list a gap of 80 s that straddles the stores' boundary, 40 s in each, which neither store holds alone", async () => {
    const H0 = Date.parse("2025-08-31T22:00:00Z");
    const H1 = H0 + HOUR_MS;
    const B = addr(0x0b);
    const at = (time: number, tid: number) =>
      trade(A, B, { coin: "SOL", side: "B", time, tid });
    const every = (from: number, n: number) =>
      Array.from({ length: n }, (_, k) =>
        at(from + k * 30_000, 100 + k),
      ).flat();
    const first = await storeOf(
      new Map([[keyOf(H0), `${byBlock(1, every(H0 + 20_000, 119))}\n`]]),
      H0,
      H1,
    );
    const second = await storeOf(
      new Map([[keyOf(H1), `${byBlock(1, every(H1 + 40_000, 118))}\n`]]),
      H1,
      H1 + HOUR_MS,
    );
    // The first store's last record 40 s before its end, the second's first 40 s after its start.
    expect(holesOfReading([first], H1)).toEqual([]);
    expect(holesOfReading([second], H1 + HOUR_MS)).toEqual([]);
    expect(holesOfReading([first, second], H1 + HOUR_MS)).toEqual([
      [H1 - 40_000, H1 + 40_000],
    ]);
  });
});
