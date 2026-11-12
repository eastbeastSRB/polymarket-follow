import { describe, expect, it } from "vitest";
import {
  DAYS7_MS,
  jumpRatio,
  planCopyThrough,
  stopInstant,
} from "../src/paper/copy.js";
import { CUT } from "../src/paper/instants.js";
import { marketThrough } from "../src/paper/market.js";
import {
  loadResearch,
  type CopyExit,
  type PanelFile,
} from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";

const kit = await loadResearch();
const D = 80_000;

function exits(spec: [number, number, string, boolean?][]): CopyExit[] {
  return spec.map(([t, share, kind, liq = false]) => ({
    t,
    share,
    kind: kind as CopyExit["kind"],
    forced: liq,
    liq,
  }));
}

describe("a copy's legs with the run's END (R8, F9)", () => {
  it("equals lib-exits' planCopy at END = CUT on 2,000 random histories", () => {
    let seed = 11;
    const rnd = () =>
      (seed = (seed * 1_103_515_245 + 12_345) % 2_147_483_648) / 2_147_483_648;
    for (let n = 0; n < 2_000; n += 1) {
      const t = CUT - Math.floor(rnd() * 10 * DAY_MS) - 1;
      const xs: [number, number, string, boolean?][] = [];
      let at = t;
      for (let k = Math.floor(rnd() * 5); k > 0; k -= 1) {
        at += Math.floor(rnd() * 3 * DAY_MS);
        const kind = rnd() < 0.3 ? "CLOSE" : rnd() < 0.2 ? "FLIP" : "REDUCE";
        xs.push([at, kind === "REDUCE" ? rnd() : 1, kind, rnd() < 0.1]);
      }
      const ex = exits(xs);
      const dd = 62_140 + Math.floor(rnd() * 33_300);
      expect(planCopyThrough({ t, D: dd }, ex, CUT)).toEqual(
        kit.exits.planCopy({ t, D: dd }, ex),
      );
    }
  });

  it("closes at an exit before END, crosses at an exit at or after END, and marks what stays open at END − 1 ms", () => {
    const END = CUT + 20 * DAY_MS;
    const t = CUT + 3 * HOUR_MS;
    const tIn = t + D;
    expect(
      planCopyThrough({ t, D }, exits([[t + HOUR_MS, 1, "CLOSE"]]), END),
    ).toEqual({
      legs: [{ h: HOUR_MS, part: 1, kind: "CLOSE", forced: false, liq: false }],
      flag: null,
      lastExitT: t + HOUR_MS,
    });
    // An exit whose instant (its fill + D) is exactly END crosses it.
    const atEnd = planCopyThrough(
      { t, D },
      exits([
        [t + DAY_MS, 0.5, "REDUCE"],
        [END - D, 1, "CLOSE"],
      ]),
      END,
    );
    expect(atEnd).toEqual({
      legs: [
        { h: DAY_MS, part: 0.5, kind: "REDUCE", forced: false, liq: false },
        { h: END - 1 - tIn, part: 0.5, kind: "cut", forced: false, liq: false },
      ],
      flag: "crossing",
      lastExitT: END - D,
    });
    expect(
      planCopyThrough({ t, D }, exits([[END - D - 1, 1, "CLOSE"]]), END).flag,
    ).toBeNull();
    expect(planCopyThrough({ t, D }, [], END)).toEqual({
      legs: [
        { h: END - 1 - tIn, part: 1, kind: "cut", forced: false, liq: false },
      ],
      flag: "open",
      lastExitT: null,
    });
    // A partial liquidation closes its share; a full one all of it.
    expect(
      planCopyThrough({ t, D }, exits([[t + 1, 0.25, "REDUCE", true]]), END)
        .legs[0]!.part,
    ).toBe(0.25);
  });

  it("gives an entry in the last 95 s before END a follow instant past it: unpriced, never a negative hold priced", () => {
    const END = CUT + 2 * DAY_MS;
    const p = panel(9);
    const mk = marketThrough(
      kit,
      {
        ...p,
        end: END,
        marks: [...p.marks, ...new Array<number | null>(2_880).fill(100)],
      },
      END,
    );
    const t = END - 30_000;
    const plan = planCopyThrough({ t, D }, [], END);
    expect(plan.flag).toBe("open");
    const price = kit.exits.priceCopy(mk, {
      dir: 1,
      tIn: t + D,
      legs: plan.legs,
      setting: kit.costs.SETTINGS.taker,
    });
    expect(price).toEqual({ reason: "no mark at the follow instant" });
  });

  it("closes the remainder at STOP's or DAYS7's instant when it comes first, and not after an exit or END", () => {
    const END = CUT + 30 * DAY_MS;
    const t = CUT + HOUR_MS;
    const tIn = t + D;
    const ex = exits([
      [t + 2 * DAY_MS, 0.5, "REDUCE"],
      [t + 9 * DAY_MS, 1, "CLOSE"],
    ]);
    expect(planCopyThrough({ t, D }, ex, END, tIn + DAYS7_MS)).toEqual({
      legs: [
        { h: 2 * DAY_MS, part: 0.5, kind: "REDUCE", forced: false, liq: false },
        { h: DAYS7_MS, part: 0.5, kind: "cut", forced: false, liq: false },
      ],
      flag: null,
      lastExitT: t + 2 * DAY_MS,
    });
    expect(planCopyThrough({ t, D }, ex, END, tIn + 20 * DAY_MS)).toEqual(
      planCopyThrough({ t, D }, ex, END),
    );
    expect(planCopyThrough({ t, D }, [], tIn + DAY_MS, tIn + DAYS7_MS)).toEqual(
      planCopyThrough({ t, D }, [], tIn + DAY_MS),
    );
  });
});

/** A panel of `days` days before the cut: marks at 100, then whatever `markAt` gives for minute i. */
function panel(
  days: number,
  markAt: (i: number) => number | null = () => 100,
): PanelFile {
  const start = CUT - days * DAY_MS;
  const n = days * 1_440;
  return {
    iid: 6,
    symbol: "BTC-USD",
    category: "crypto",
    start,
    end: CUT,
    firstTrade: start,
    retired: null,
    marks: Array.from({ length: n }, (_, i) => markAt(i)),
    klines: { minute: [], trades: [], volume: [] },
    funding: [],
  };
}

describe("STOP's instant (R13, F14 b)", () => {
  it("is the last millisecond of the first whole minute after the entry's whose end mark is 2% against it", () => {
    const days = 3;
    const start = CUT - days * DAY_MS;
    const tIn = start + DAY_MS + 30 * MINUTE_MS + 20_000;
    const i0 = (tIn - start - 20_000) / MINUTE_MS;
    // The entry's minute ends at 100; a fall to 98.1 at i0 + 3 (short of 2%), to 97.9 at i0 + 7.
    const mk = marketThrough(
      kit,
      panel(days, (i) => (i === i0 + 3 ? 98.1 : i >= i0 + 7 ? 97.9 : 100)),
      CUT,
    );
    expect(stopInstant(kit, mk, { dir: 1, tIn }, 0.02, CUT)).toBe(
      start + (i0 + 8) * MINUTE_MS - 1,
    );
    expect(stopInstant(kit, mk, { dir: -1, tIn }, 0.02, CUT)).toBeNull();
    // Searched only before `until`.
    expect(
      stopInstant(
        kit,
        mk,
        { dir: 1, tIn },
        0.02,
        start + (i0 + 8) * MINUTE_MS - 1,
      ),
    ).toBeNull();
    expect(stopInstant(kit, mk, { dir: 1, tIn }, 0.05, CUT)).toBeNull();
  });
});

describe("JUMP's ratio (R13, F14 c)", () => {
  it("is the last 15 minutes' move over the mean 15-minute move of the 30 days before, never looking past the entry's minute", () => {
    const days = 40;
    const start = CUT - days * DAY_MS;
    // Marks alternate 100 / 101 every 15 minutes: every 15-minute move is 1%.
    const level = (i: number) => (Math.floor(i / 15) % 2 === 0 ? 100 : 101);
    const e = start + 35 * DAY_MS;
    const ie = (e - start) / MINUTE_MS;
    const mk = marketThrough(
      kit,
      panel(days, (i) => (i >= ie ? 140 : level(i))),
      CUT,
    );
    const j = jumpRatio(kit, mk, e + 5_000)!;
    const mean = (() => {
      let s = 0;
      let n = 0;
      for (let k = ie - 30 * 1_440; k + 15 <= ie; k += 1) {
        const a = mk.marks[k - 1]!;
        const b = mk.marks[k + 14]!;
        s += Math.abs(b / a - 1);
        n += 1;
      }
      return s / n;
    })();
    const move = Math.abs(mk.marks[ie - 1]! / mk.marks[ie - 16]! - 1);
    expect(j).toBeCloseTo(move / mean, 10);
    // The jump to 140 at e itself is not in the window: the same J as without it.
    const without = marketThrough(kit, panel(days, level), CUT);
    expect(jumpRatio(kit, without, e + 5_000)).toBeCloseTo(j, 12);
  });
});
