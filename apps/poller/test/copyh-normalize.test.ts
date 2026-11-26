/**
 * An account's rows as the kit's fills (src/copyh/normalize.ts; rules.md
 * C3): every field; an own and a counterparty liquidation leg; each kind's
 * `forced`; matching events by (oid, coin, `time`), their chain heads as
 * prevS; an event split across the rows of two files; and through the kit's
 * own `toEvents`, a taker's sweep one order event, where Hyperliquid's
 * per-fill `startPosition` alone would give one per fill, and a maker order
 * hit three times in one millisecond three events, each maker fill its own
 * head (the supervisor's ruling, 2026-11-26).
 */
import { beforeAll, describe, expect, it } from "vitest";
import { normOf, type Row } from "../src/copyh/normalize.js";
import { loadResearch, type Research } from "../src/paper/research.js";

let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
}, 60_000);

const row = (o: Partial<Row>): Row => ({
  time: 1_750_000_000_000,
  iid: 5,
  px: 150,
  sz: 1,
  side: 1,
  startPosition: 0,
  oid: "7",
  tid: "1",
  crossed: true,
  ownLiquidation: false,
  dirKind: "trade",
  ...o,
});

describe("the kit's fills", { timeout: 60_000 }, () => {
  it("carry every field, fee and pnl zero, prevS the chain head's shortest text", () => {
    const [f] = normOf([
      row({
        px: 151.25,
        sz: 0.5,
        side: -1,
        startPosition: 2.0,
        tid: "9007199254740993",
        crossed: false,
      }),
    ]);
    expect(f).toEqual({
      t: 1_750_000_000_000,
      iid: 5,
      oid: "7",
      tid: "9007199254740993",
      prevS: "2",
      prev: 2,
      sgn: -1,
      px: 151.25,
      q: 0.5,
      fee: 0,
      pnl: 0,
      taker: false,
      liq: false,
      forced: false,
    });
  });

  it("read an own liquidation leg as liq and forced, a counterparty's as neither, and a forced dir as forced", () => {
    const [own, other, settled, vault, ownTrade] = normOf([
      row({ oid: "1", ownLiquidation: true, dirKind: "forced" }),
      row({ oid: "2", ownLiquidation: false }),
      row({ oid: "3", dirKind: "forced" }),
      row({ oid: "4", dirKind: "vault" }),
      row({ oid: "6", ownLiquidation: true, dirKind: "trade" }),
    ]);
    expect([own!.liq, own!.forced]).toEqual([true, true]);
    expect([other!.liq, other!.forced]).toEqual([false, false]);
    expect([settled!.liq, settled!.forced]).toEqual([false, true]);
    expect([vault!.liq, vault!.forced]).toEqual([false, false]);
    // An own liquidation leg is forced whatever its dir's kind (C3: forced = liq, or a forced dir).
    expect([ownTrade!.liq, ownTrade!.forced]).toEqual([true, true]);
  });

  it("take each matching event's chain head: one oid, coin and time; another of any is another event", () => {
    const t = 1_750_000_000_000;
    const out = normOf([
      row({ startPosition: 0, sz: 1 }),
      row({ startPosition: 1, sz: 2 }),
      row({ startPosition: 1, sz: 2, oid: "8" }),
      row({ startPosition: 1, sz: 2, iid: 6 }),
      row({ startPosition: 3, sz: 1, time: t + 1 }),
      row({ startPosition: 3, sz: 1 }),
    ]);
    expect(out.map((f) => f.prevS)).toEqual(["0", "0", "1", "1", "3", "0"]);
  });

  it("join an event whose rows two files hold, as its rows come, file after file", () => {
    const one = [
      row({ startPosition: -3, sz: 1 }),
      row({ startPosition: -2, sz: 1.5 }),
      row({ startPosition: -0.5, sz: 0.5 }),
    ];
    expect(normOf(one).map((f) => f.prevS)).toEqual(["-3", "-3", "-3"]);
    // The same rows with an unrelated fill of another coin between them (the next file's first).
    const split = [
      one[0]!,
      one[1]!,
      row({ iid: 9, startPosition: 4 }),
      one[2]!,
    ];
    expect(normOf(split).map((f) => f.prevS)).toEqual(["-3", "-3", "4", "-3"]);
  });

  it("give the kit one order event per matching event, where per-fill startPositions would give one per fill", () => {
    const fills = normOf([
      row({ startPosition: 0, sz: 1, tid: "1" }),
      row({ startPosition: 1, sz: 2, tid: "2" }),
      row({ startPosition: 3, sz: 0.5, tid: "3" }),
    ]);
    const events = kit.entries.toEvents(fills);
    expect(events).toHaveLength(1);
    expect(events[0]).toMatchObject({
      prev: 0,
      net: 3.5,
      n: 3,
      kind: "OPEN",
      after: 3.5,
      tids: ["1", "2", "3"],
    });
    const perFill = fills.map((f, i) => ({
      ...f,
      prevS: String([0, 1, 3][i]),
      prev: [0, 1, 3][i]!,
    }));
    expect(kit.entries.toEvents(perFill)).toHaveLength(3);
  });

  it("give a maker order hit three times in one millisecond three events, each fill its own head, as the paper reads them", () => {
    const fills = normOf([
      row({ startPosition: 0, sz: 1, tid: "1", crossed: false }),
      row({ startPosition: 1, sz: 2, tid: "2", crossed: false }),
      row({ startPosition: 3, sz: 0.5, tid: "3", crossed: false }),
    ]);
    expect(fills.map((f) => f.prevS)).toEqual(["0", "1", "3"]);
    const events = kit.entries.toEvents(fills);
    expect(events.map((e) => [e.kind, e.prev, e.after, e.tids])).toEqual([
      ["OPEN", 0, 1, ["1"]],
      ["ADD", 1, 3, ["2"]],
      ["ADD", 3, 3.5, ["3"]],
    ]);
    // A taker fill of the same order and millisecond still chains with the others taken.
    const mixed = normOf([
      row({ startPosition: 0, sz: 1, tid: "1", crossed: false }),
      row({ startPosition: 1, sz: 2, tid: "2" }),
      row({ startPosition: 3, sz: 0.5, tid: "3" }),
    ]);
    expect(mixed.map((f) => f.prevS)).toEqual(["0", "1", "1"]);
  });
});
