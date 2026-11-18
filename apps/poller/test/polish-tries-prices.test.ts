/**
 * The exploration's minute prices (src/polish/tries/prices.ts): the price
 * column equal to legs.ts `minutePrice` (the kit's mark, 5 minutes stale at
 * most, else the last trade but a backstop's in the 5 minutes before the
 * minute's end) at every minute; the decision's price never of the minute
 * it is in; the outcome's at the end of the leg's minute; BASE equal to
 * MARKET-1's for 24 h, and by hand for other holds and across a block.
 */
import { describe, expect, it } from "vitest";
import { baseOf as base24 } from "../src/market1/lines.js";
import { loadResearch, type Market } from "../src/paper/research.js";
import { MINUTE_MS } from "../src/schedule.js";
import { minutePrice, type Tape } from "../src/polish/legs.js";
import {
  baseOf,
  priceAfter,
  priceAt,
  priceColumn,
} from "../src/polish/tries/prices.js";

const START = Date.parse("2025-09-10T00:00:00Z");
const N = 30;
const at = (k: number, ms = 0) => START + k * MINUTE_MS + ms;

describe("the minute price", () => {
  // Marks at minutes 0 and 10; trades (none a backstop's) in minutes 3, 8 (two) and 20.
  const mark = new Float64Array(N).fill(NaN);
  mark[0] = 100;
  mark[10] = 101;
  const trades: [number, number][] = [
    [at(3, 10_000), 99],
    [at(8, 5_000), 97],
    [at(8, 40_000), 98],
    [at(20, 59_999), 102],
  ];
  const last = new Float64Array(N).fill(NaN);
  for (const [t, px] of trades) last[Math.floor((t - START) / MINUTE_MS)] = px;
  const pc = priceColumn(mark, last);

  it("is the kit's mark, else the last trade in the 5 minutes before the minute's end, at every minute: legs.ts minutePrice", async () => {
    const kit = await loadResearch();
    const mk = kit.panel.marketFrom({
      iid: 5,
      symbol: "SOL",
      category: "crypto",
      start: START,
      end: at(N),
      firstTrade: null,
      retired: null,
      marks: Array.from(mark, (v) => (Number.isNaN(v) ? null : v)),
      klines: { minute: [], trades: [], volume: [] },
      funding: [],
    });
    const tape = {
      last: (_coin: string, from: number, to: number) => {
        let px: number | null = null;
        for (const [t, p] of trades) if (t >= from && t < to) px = p;
        return px;
      },
    } as unknown as Tape;
    for (let k = 0; k < N; k++)
      for (const ms of [0, 30_000, 59_999])
        expect(pc[k], `${k} ${ms}`).toBe(
          minutePrice(kit, mk, tape, at(k, ms)) ?? NaN,
        );
    // By hand: the mark 5 minutes stale at most; then minute 3's trade until minute 7, minute 8's last
    // trade until 12 but for the mark of 10; nothing from 16; minute 20's trade from 20 to 24.
    expect(Array.from(pc)).toEqual([
      100,
      100,
      100,
      100,
      100,
      100,
      99,
      99,
      98,
      98,
      101,
      101,
      101,
      101,
      101,
      101,
      NaN,
      NaN,
      NaN,
      NaN,
      102,
      102,
      102,
      102,
      102,
      NaN,
      NaN,
      NaN,
      NaN,
      NaN,
    ]);
  });

  it("a decision at τ reads the minute ended by τ, never the minute τ is in; an outcome at x the end of x's minute", () => {
    expect(priceAt(pc, START, at(0, 59_999))).toBeNaN();
    expect(priceAt(pc, START, at(1))).toBe(100);
    expect(priceAt(pc, START, at(8, 59_999))).toBe(99);
    expect(priceAt(pc, START, at(9))).toBe(98);
    expect(priceAt(pc, START, at(N + 1))).toBeNaN();
    expect(priceAfter(pc, START, at(7, 59_999))).toBe(99);
    expect(priceAfter(pc, START, at(8))).toBe(98);
    expect(priceAfter(pc, START, START - 1)).toBeNaN();
    expect(priceAfter(pc, START, at(N))).toBeNaN();
  });
});

describe("BASE for any hold", () => {
  it("is MARKET-1's baseOf for 24 hours, holes and blocks included", () => {
    const n = 3 * 1440 + 100;
    const col = Float64Array.from({ length: n }, (_, i) =>
      i % 97 === 13 ? NaN : 100 + 5 * Math.sin(i / 50) + (i % 7) / 10,
    );
    const mk = { start: START, n, marks: col } as unknown as Market;
    for (const [from, to] of [
      [START, START + n * MINUTE_MS],
      [START + 10 * MINUTE_MS + 1, START + 2 * 1440 * MINUTE_MS],
    ] as const)
      expect(baseOf(col, START, from, to, 1440)).toEqual(base24(mk, from, to));
  });

  it("by hand for a 60-minute hold, and in the block of each minute j", () => {
    const col = Float64Array.from({ length: 121 }, (_, i) =>
      i < 60 ? 100 : 125,
    );
    expect(baseOf(col, START, START, START + 121 * MINUTE_MS, 60)).toEqual([
      (60 * 2500) / 61,
      NaN,
      NaN,
      NaN,
      NaN,
      NaN,
    ]);
    // 03:59 lies in the block 00–04, 04:00 in 04–08.
    const s = Date.parse("2025-09-10T03:59:00Z");
    const four = Float64Array.from([100, 100, 125, 125]);
    expect(baseOf(four, s, s, s + 4 * MINUTE_MS, 2)).toEqual([
      2500,
      2500,
      NaN,
      NaN,
      NaN,
      NaN,
    ]);
  });
});
