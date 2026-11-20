/**
 * The prints beside the exam's verdict (src/polish/exam/lines.ts; polish/rules.md
 * P13, P14; THE PLAN D46, D52), deciding nothing: a line's statistic and the
 * two best days' share of its gain; a set of positions at the tape; the
 * deciding line's prints by segment, price source and depth, and its net per
 * hour held.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { loadResearch, type Research } from "../src/paper/research.js";
import {
  decidingPrints,
  statLine,
  tapeLine,
} from "../src/polish/exam/lines.js";
import type { LookPosition } from "../src/polish/exam/look.js";
import type { Line } from "../src/polish/tries/beside.js";
import type { Data } from "../src/polish/tries/data.js";
import { statOf } from "../src/polish/tries/stats.js";
import type { Net } from "../src/polish/tries/sweep.js";
import { fortyOf } from "../src/polish/writers.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import { loadCoins } from "../src/waveh/coins.js";

const coins = loadCoins();
let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const START = Date.parse("2026-06-01T00:00:00Z");
const day = (k: number, h = 1) => START + k * DAY_MS + h * HOUR_MS;
const item = (k: number, iid: number, x: number, h = 1) => ({
  t: day(k, h),
  iid,
  x,
});

describe("a line's statistic (D52)", () => {
  it("is M10's over its priced nets, with the two best days' share of a gain above 0", () => {
    // By day: +40, −20, +25, +15; the gain 60, its two best days 65.
    const items = [
      item(0, 1, 30),
      item(0, 2, 10, 5),
      item(1, 1, -20),
      item(2, 3, 25),
      item(3, 2, 15),
    ];
    const s = statLine(kit, items);
    expect(s.priced).toBe(5);
    expect(s.stat).toEqual(statOf(kit, items));
    expect(s.twoBestDaysShare).toBe(65 / 60);
    // No gain: no share.
    expect(
      statLine(kit, [item(0, 1, -5), item(1, 2, -1)]).twoBestDaysShare,
    ).toBeNull();
    expect(
      statLine(kit, [item(0, 1, 5), item(1, 2, -5)]).twoBestDaysShare,
    ).toBeNull();
    expect(statLine(kit, []).twoBestDaysShare).toBeNull();
  });
});

const position = (k: number, iid: number, slice = 0): LookPosition => ({
  slice,
  iid,
  t: day(k),
  side: -1,
  dir: 1,
  xIn: day(k) + 120_000,
  xOut: day(k + 1) + 120_000,
  method: "market",
  accounts: [],
  tid: String(k),
  where: "segment 1",
  left: null,
});
const net = (x: number | null, short = false): Net => ({
  net: x,
  unpriced: x === null ? "no trade at the entry" : null,
  gross: null,
  fees: null,
  funding: null,
  missing: 0,
  short,
  pIn: null,
  pOut: null,
});

describe("a set of positions at the tape (H8)", () => {
  it("counts its positions, the unpriced by why and the depth short, with its statistic", () => {
    const ps = [position(0, 1), position(1, 2), position(2, 3), position(3, 1)];
    const nets = new Map([
      ["0", net(12)],
      ["1", net(null)],
      ["2", net(-4, true)],
      ["3", net(20, true)],
    ]);
    const t = tapeLine(kit, ps, nets, (p) => p.tid);
    expect(t).toMatchObject({
      positions: 4,
      unpriced: { "no trade at the entry": 1 },
      short: 2,
      priced: 3,
    });
    expect(t.stat).toEqual(
      statOf(kit, [item(0, 1, 12), item(2, 3, -4), item(3, 1, 20)]),
    );
  });
});

describe("the deciding line's prints (D46)", () => {
  it("splits the priced positions by segment, price source and depth, and gives the net per hour held", () => {
    const minutes = 20 * 1_440;
    const flat = new Float64Array(minutes).fill(100);
    const d = {
      kit,
      start: START,
      minutes,
      coins,
      counted: [],
      pc: new Map([...fortyOf(coins)].map((c) => [c, flat])),
    } as unknown as Data;
    const line = (k: number, iid: number, x: number | null): Line => ({
      group: "N",
      slice: 0,
      t: day(k),
      iid,
      tid: String(k),
      dir: 1,
      xIn: day(k) + 120_000,
      xOut: day(k + 1) + 120_000,
      net: x,
      unpriced: x === null ? "no book and no trade at the entry" : null,
      onMarks: x === null ? null : 0,
    });
    const rows = [
      {
        line: line(0, 1, 10),
        bookBoth: true,
        short: false,
        where: "segment 1",
      },
      {
        line: line(1, 2, 30),
        bookBoth: false,
        short: true,
        where: "segment 1",
      },
      { line: line(2, 3, -6), bookBoth: true, short: true, where: "segment 2" },
      {
        line: line(3, 1, 14),
        bookBoth: false,
        short: false,
        where: "segment 2",
      },
      {
        line: line(4, 2, null),
        bookBoth: false,
        short: false,
        where: "segment 1",
      },
    ];
    const p = decidingPrints(d, rows);
    const priced = (s: { priced: number }) => s.priced;
    expect(priced(p.bySegment["segment 1"])).toBe(2);
    expect(priced(p.bySegment["segment 2"])).toBe(2);
    expect(priced(p.bySource["both legs at the book"])).toBe(2);
    expect(p.bySource["a leg at the tape"].stat?.mean).toBe((30 + 14) / 2);
    expect(p.bySource["both legs at the book"].stat?.mean).toBe((10 - 6) / 2);
    expect(p.byDepth["a leg depth short"].stat?.mean).toBe((30 - 6) / 2);
    expect(p.byDepth["no leg short"].stat?.mean).toBe((10 + 14) / 2);
    const all = statOf(kit, [
      item(0, 1, 10),
      item(1, 2, 30),
      item(2, 3, -6),
      item(3, 1, 14),
    ]);
    expect(p.perHourHeld).toBe(all!.mean / 24);
    // By day: +10, +30, −6, +14; the gain 48, its two best days 44.
    expect(p.twoBestDaysShare).toBe(44 / 48);
  });
});
