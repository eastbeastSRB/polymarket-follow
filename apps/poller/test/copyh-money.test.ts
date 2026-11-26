/**
 * The money reading (src/copyh/money.ts; rules.md C8): a made-up account's
 * long entry with a partial exit, a liquidation's share and the flip that
 * closes it, and its short entry crossing END; an entry never closed, open
 * at END; the long entry settled at its coin's end; each plan the paper's
 * `planCopyThrough`, the cut legs at END − 1 ms and at the coin's end −
 * 1 ms; every bps field of the price on uneven marks with funding and a
 * missing hour, held to Σ part × the kit's leg, a settled copy's last leg
 * at the Settlement price; STOP's search end.
 */
import { describe, expect, it } from "vitest";
import { delayOf, entriesIn, historyOf } from "../src/copyh/entries.js";
import { marketOf } from "../src/copyh/markets.js";
import { moneyOf, planOf, stopUntil, type Plan } from "../src/copyh/money.js";
import { planCopyThrough } from "../src/paper/copy.js";
import {
  loadResearch,
  type Group,
  type Market,
  type PanelFile,
  type Setting,
} from "../src/paper/research.js";
import { HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { FillBook } from "./copyh-engine-world.js";

const kit = await loadResearch();
const MIN = MINUTE_MS;
const A = `0x${"0".repeat(39)}a`;
const T0 = Date.parse("2025-09-08T10:00:00Z");
const END = T0 + 6 * HOUR_MS;

/** A long of 3 opened at T0: a third sold at 2 h, half the rest liquidated at 3 h, a flip to −2 at 5 h; the short closed at 8 h. */
const book = new FillBook();
book.order({ t: T0, oid: 1, side: 1, sizes: [1, 2] });
book.order({ t: T0 + 2 * HOUR_MS, oid: 2, side: -1, sizes: [1] });
book.order({ t: T0 + 3 * HOUR_MS, oid: 3, side: -1, sizes: [1], liq: true });
book.order({ t: T0 + 5 * HOUR_MS, oid: 4, side: -1, sizes: [3] });
book.order({ t: T0 + 8 * HOUR_MS, oid: 5, side: 1, sizes: [2] });
const built = historyOf(kit, book.fills, { fills: 1e9, exits: 1e9 });
if (built.kind !== "built") throw new Error(built.kind);
const history = built.history;
const [LONG, SHORT] = entriesIn(history.groups, T0, T0 + 10 * HOUR_MS) as [
  Group,
  Group,
];
const exits = (g: Group) => kit.exits.exitsOf(g, history.liqKeys);
const D = delayOf(kit, A, LONG).D;
const DS = delayOf(kit, A, SHORT).D;
const UNSETTLED = { end: END, settlement: null };

describe("a copy's plan", () => {
  it("is the paper's planCopyThrough to END: the long's three exits, its liquidation's share flagged", () => {
    const plan = planOf({ t: LONG.t, D }, exits(LONG), UNSETTLED);
    expect(plan).toEqual({
      ...planCopyThrough({ t: LONG.t, D }, exits(LONG), END),
      settled: false,
    });
    expect(plan.legs.map((l) => [l.h, l.kind, l.forced, l.liq])).toEqual([
      [2 * HOUR_MS, "REDUCE", false, false],
      [3 * HOUR_MS, "REDUCE", true, true],
      [5 * HOUR_MS, "FLIP", false, false],
    ]);
    let open = 1;
    const parts = [1 / 3, 1 / 2, 1].map((share) => {
      const part = open * share;
      open -= part;
      return part;
    });
    expect(plan.legs.map((l) => l.part)).toEqual(parts);
    expect([plan.flag, plan.lastExitT]).toEqual([null, T0 + 5 * HOUR_MS]);
  });

  it("flags the short crossing END and an entry never closed open, each cut at END − 1 ms", () => {
    const short = planOf({ t: SHORT.t, D: DS }, exits(SHORT), UNSETTLED);
    expect(short).toEqual({
      legs: [
        {
          h: END - 1 - (SHORT.t + DS),
          part: 1,
          kind: "cut",
          forced: false,
          liq: false,
        },
      ],
      flag: "crossing",
      lastExitT: T0 + 8 * HOUR_MS,
      settled: false,
    });
    const lone = new FillBook();
    lone.order({ t: T0, oid: 9, side: -1, sizes: [4] });
    const h = historyOf(kit, lone.fills, { fills: 1e9, exits: 1e9 });
    if (h.kind !== "built") throw new Error(h.kind);
    const g = h.history.groups[0]!;
    expect(planOf({ t: g.t, D }, exits(g), UNSETTLED)).toEqual({
      legs: [
        {
          h: END - 1 - (T0 + D),
          part: 1,
          kind: "cut",
          forced: false,
          liq: false,
        },
      ],
      flag: "open",
      lastExitT: null,
      settled: false,
    });
  });

  it("plans a copy on a coin that settles to the coin's end: still open there, settled, cut at its last millisecond", () => {
    const end = T0 + 4 * HOUR_MS + MIN;
    const coin = { end, settlement: { t: end - 50_000, price: 123.5 } };
    const plan = planOf({ t: LONG.t, D }, exits(LONG), coin);
    expect(plan.settled).toBe(true);
    expect(plan.flag).toBe("crossing");
    expect(plan.legs.map((l) => [l.h, l.kind])).toEqual([
      [2 * HOUR_MS, "REDUCE"],
      [3 * HOUR_MS, "REDUCE"],
      [end - 1 - (T0 + D), "cut"],
    ]);
    // Closed by its exits before the coin's end: not settled.
    const later = { end: T0 + 7 * HOUR_MS, settlement: { t: 0, price: 1 } };
    expect(planOf({ t: LONG.t, D }, exits(LONG), later).settled).toBe(false);
  });

  it("ends STOP's search at the last exit instant of a closed copy, else at the plan's end", () => {
    const closed = planOf({ t: LONG.t, D }, exits(LONG), UNSETTLED);
    expect(stopUntil(closed, D, END)).toBe(T0 + 5 * HOUR_MS + D);
    const crossing = planOf({ t: SHORT.t, D: DS }, exits(SHORT), UNSETTLED);
    expect(stopUntil(crossing, DS, END)).toBe(END);
  });
});

/** A made-up SOL panel from T0 − 1 h: uneven marks at every minute, a funding row each hour but T0 + 3 h's, stamped a few ms late. */
function panelOf(end: number, last?: number): PanelFile {
  const start = T0 - HOUR_MS;
  const n = (end - start) / MIN;
  const hours = Array.from(
    { length: (end - start) / HOUR_MS },
    (_, k) => start + (k + 1) * HOUR_MS,
  ).filter((h) => h !== T0 + 3 * HOUR_MS && h < end);
  return {
    iid: 2,
    symbol: "SOL",
    category: "main dex",
    start,
    end,
    firstTrade: start,
    retired: null,
    marks: Array.from({ length: n }, (_, i) =>
      last !== undefined && i === n - 1 ? last : 100 + ((i * i) % 53) / 7,
    ),
    klines: { minute: [], trades: [], volume: [] },
    funding: hours.map((h, k): [number, number, number] => [
      h,
      ((k % 3) - 1) * 1e-5 + 2e-6,
      h + 7 * (k + 1),
    ]),
  };
}
/** A made-up setting: an uneven c, flagged every fifth minute. */
const SETTING: Setting = {
  name: "made-up",
  fee: () => 0.00045,
  spread: (_, t) => ({
    c: 1e-4 + (Math.floor(t / MIN) % 7) * 1e-5,
    fallback: Math.floor(t / MIN) % 5 === 0,
  }),
};

/** C8's price written out: Σ part × the kit's leg, in bps. */
function expected(mk: Market, dir: number, tIn: number, plan: Plan) {
  const legs = plan.legs.map((L) => ({
    L,
    r: kit.returns.leg(mk, { dir, tIn, h: L.h, setting: SETTING })!,
  }));
  const sum = (f: (r: (typeof legs)[number]["r"]) => number) =>
    legs.reduce((s, { L, r }) => s + L.part * f(r), 0);
  return {
    net: sum((r) => r.net) * 1e4,
    gross: sum((r) => r.gross) * 1e4,
    fees: sum((r) => r.fees) * 1e4,
    funding: sum((r) => r.funding) * 1e4,
    holdMs: legs.reduce((s, { L }) => s + L.part * L.h, 0),
    fullExitMs: Math.max(0, ...legs.map(({ L }) => L.h)),
    fundingMissing: Math.max(0, ...legs.map(({ r }) => r.fundingMissing)),
    spreadFallback: legs.some(({ r }) => r.spreadFallback),
  };
}

describe("a copy's price", () => {
  it("is Σ part × the kit's leg in bps, every field, on uneven marks with funding and a missing hour", () => {
    const mk = marketOf(kit, panelOf(T0 + 10 * HOUR_MS), T0 + 10 * HOUR_MS, 5);
    const long = planOf({ t: LONG.t, D }, exits(LONG), UNSETTLED);
    const m = moneyOf(
      kit,
      mk,
      { dir: 1, tIn: LONG.t + D, plan: long },
      SETTING,
    );
    expect(m).toEqual(expected(mk, 1, LONG.t + D, long));
    if (m.reason !== undefined) throw new Error(m.reason);
    expect(m.funding).not.toBe(0);
    expect(m.fundingMissing).toBe(1);
    const short = planOf({ t: SHORT.t, D: DS }, exits(SHORT), UNSETTLED);
    expect(
      moneyOf(kit, mk, { dir: -1, tIn: SHORT.t + DS, plan: short }, SETTING),
    ).toEqual(expected(mk, -1, SHORT.t + DS, short));
  });

  it("values a settled copy's last leg at the Settlement price, its object's last minute", () => {
    const end = T0 + 4 * HOUR_MS + MIN;
    const mk = marketOf(kit, panelOf(end, 123.5), T0 + 10 * HOUR_MS, 5);
    const plan = planOf({ t: LONG.t, D }, exits(LONG), {
      end,
      settlement: { t: end - 50_000, price: 123.5 },
    });
    const m = moneyOf(kit, mk, { dir: 1, tIn: LONG.t + D, plan }, SETTING);
    expect(m).toEqual(expected(mk, 1, LONG.t + D, plan));
    expect(kit.panel.markAtMinuteEnd(mk, end - 1)).toBe(123.5);
  });
});
