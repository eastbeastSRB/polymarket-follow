/**
 * Events, cycles, entries, the delay (src/copyh/entries.ts; rules.md C4): the
 * exit rows counted equal to the exits the kit's `buildEntries` appends, on
 * made-up accounts and on one never flat; the kit's history, or an account
 * past HISTORY_FILLS_MAX or EXITS_MAX not run through it, each at its limit
 * and one past it, with its OPEN and FLIP events named; an OPEN, a FLIP, an
 * ADD merged inside 60 s and one outside, a forced event an exit only, the
 * stage window at its two edges; the id and its delay holding the coin's
 * iid; C4's float residue, a close in 100,000 fills the kit reads as a flip.
 */
import { describe, expect, it } from "vitest";
import {
  delayOf,
  entriesIn,
  exitRows,
  historyOf,
  openFlipEvents,
  residues,
} from "../src/copyh/entries.js";
import { loadResearch, type Group } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { FillBook } from "./copyh-engine-world.js";

const kit = await loadResearch();
const A = `0x${"0".repeat(39)}1`;
const M = Date.parse("2025-07-07T00:00:00Z");
const WEEK = 7 * DAY_MS;

const exitsOf = (groups: readonly Group[]) =>
  groups.reduce((s, g) => s + g.exits.length, 0);

/** A made-up account of `n` orders on two coins, gaps of 10 s to 3 minutes (so that some merge), one order in ten a liquidation. */
function madeUp(seed: number, n = 40): FillBook {
  let s = seed;
  const rnd = () =>
    (s = (s * 1_103_515_245 + 12_345) % 2_147_483_648) / 2_147_483_648;
  const book = new FillBook();
  let t = M;
  for (let k = 0; k < n; k++) {
    t += 10_000 + Math.floor(rnd() * 170_000);
    book.order({
      t,
      iid: rnd() < 0.5 ? 2 : 3,
      oid: k + 1,
      side: rnd() < 0.5 ? 1 : -1,
      sizes: Array.from(
        { length: 1 + Math.floor(rnd() * 3) },
        () => 1 + Math.floor(rnd() * 3),
      ),
      liq: rnd() < 0.1,
    });
  }
  return book;
}

/** Long 100, then 100 adds of 2 more than a minute apart, each followed by a trim of 1: never flat. */
function neverFlat(): FillBook {
  const book = new FillBook().order({ t: M, oid: 1, side: 1, sizes: [100] });
  for (let k = 1; k <= 100; k++)
    book
      .order({ t: M + k * 10 * MINUTE_MS, oid: 2 * k, side: 1, sizes: [2] })
      .order({
        t: M + k * 10 * MINUTE_MS + 5 * MINUTE_MS,
        oid: 2 * k + 1,
        side: -1,
        sizes: [1],
      });
  return book;
}

describe("the exit rows", { timeout: 60_000 }, () => {
  it("equal the exits buildEntries appends, on 300 made-up accounts", () => {
    let all = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const events = kit.entries.toEvents(madeUp(seed).fills);
      const want = exitsOf(
        kit.entries.buildEntries(events, -Infinity, Infinity, 60_000),
      );
      expect(exitRows(events), `seed ${seed}`).toBe(want);
      all += want;
    }
    expect(all).toBeGreaterThan(1_000);
  });

  it("grow with the square of an account that adds and trims without going flat", () => {
    const events = kit.entries.toEvents(neverFlat().fills);
    // Each trim reaches the opening group and every add before it: 100 + (1 + … + 100).
    expect(exitRows(events)).toBe(5_150);
    expect(
      exitsOf(kit.entries.buildEntries(events, -Infinity, Infinity, 60_000)),
    ).toBe(5_150);
  });
});

describe("an account's history", { timeout: 60_000 }, () => {
  const fills = neverFlat().fills;
  const events = kit.entries.toEvents(fills);

  it("is the kit's own: events, cycles, groups, liquidation keys, chain breaks", () => {
    const book = madeUp(7);
    const built = historyOf(kit, book.fills, { fills: 1e9, exits: 1e9 });
    if (built.kind !== "built") throw new Error(built.kind);
    const ev = kit.entries.toEvents(book.fills);
    expect(built.history.events).toEqual(ev);
    expect(built.history.cycles).toEqual(kit.entries.toCycles(ev));
    expect(built.history.groups).toEqual(
      kit.entries.buildEntries(ev, -Infinity, Infinity, 60_000),
    );
    expect(built.history.liqKeys).toEqual(kit.exits.liquidationKeys(ev));
    const chain = kit.exits.chainBreaks(ev);
    expect(built.history.chain.breaks).toEqual(chain.breaks);
    expect(built.history.chain.index.size).toBe(chain.index.size);
    expect(built.history.exitRows).toBe(exitRows(ev));
  });

  it("is not built past HISTORY_FILLS_MAX: at the limit built, one past it named with its fills", () => {
    const n = fills.length;
    expect(historyOf(kit, fills, { fills: n, exits: 1e9 }).kind).toBe("built");
    expect(historyOf(kit, fills, { fills: n - 1, exits: 1e9 })).toEqual({
      kind: "too many fills",
      fills: n,
    });
  });

  it("is not built past EXITS_MAX: at the limit built, one past it named with its exit rows and events", () => {
    expect(historyOf(kit, fills, { fills: 1e9, exits: 5_150 }).kind).toBe(
      "built",
    );
    expect(historyOf(kit, fills, { fills: 1e9, exits: 5_149 })).toEqual({
      kind: "too many exits",
      exitRows: 5_150,
      events,
    });
  });

  it("names an account above EXITS_MAX with its OPEN and FLIP events in the weeks where it is P1", () => {
    // neverFlat's one OPEN is at M; its adds are ADDs, its trims REDUCEs.
    expect(openFlipEvents(events, [M])).toBe(1);
    expect(openFlipEvents(events, [M - WEEK])).toBe(0);
    expect(openFlipEvents(events, [M + WEEK])).toBe(0);
    const flips = new FillBook()
      .order({ t: M + HOUR_MS, oid: 1, side: 1, sizes: [1] })
      .order({ t: M + 2 * HOUR_MS, oid: 2, side: -1, sizes: [2] })
      .order({ t: M + WEEK + HOUR_MS, oid: 3, side: 1, sizes: [2] })
      .order({
        t: M + WEEK + 2 * HOUR_MS,
        oid: 4,
        side: -1,
        sizes: [1],
        liq: true,
      });
    const ev = kit.entries.toEvents(flips.fills);
    // An OPEN and a FLIP in M's week, a FLIP in the next; the forced close counts nowhere.
    expect(openFlipEvents(ev, [M])).toBe(2);
    expect(openFlipEvents(ev, [M, M + WEEK])).toBe(3);
    expect(openFlipEvents(ev, [M + WEEK])).toBe(1);
  });
});

describe("the entries", { timeout: 60_000 }, () => {
  const t0 = M + HOUR_MS;
  const book = new FillBook()
    // On coin 3, an OPEN exactly at the window's start, closed later.
    .order({ t: M, iid: 3, oid: 100, side: 1, sizes: [1] })
    // On coin 2: an OPEN; an ADD 30 s later, merged; an ADD 2 minutes later, its own group.
    .order({ t: t0, oid: 1, side: 1, sizes: [1, 1] })
    .order({ t: t0 + 30_000, oid: 2, side: 1, sizes: [1] })
    .order({ t: t0 + 2 * MINUTE_MS, oid: 3, side: 1, sizes: [1] })
    // A REDUCE of half, then a FLIP to short.
    .order({ t: t0 + HOUR_MS, oid: 4, side: -1, sizes: [2] })
    .order({ t: t0 + 2 * HOUR_MS, oid: 5, side: -1, sizes: [3, 1] })
    // The short closed by an own liquidation: a forced exit.
    .order({ t: t0 + 3 * HOUR_MS, oid: 6, side: 1, sizes: [2], liq: true })
    // A forced event from flat opens no group; its close finds no group.
    .order({ t: t0 + 4 * HOUR_MS, oid: 7, side: -1, sizes: [1], forced: true })
    .order({ t: t0 + 5 * HOUR_MS, oid: 8, side: 1, sizes: [1] })
    .order({ t: M + 10 * HOUR_MS, iid: 3, oid: 101, side: -1, sizes: [1] })
    // An OPEN exactly at the window's end.
    .order({ t: M + WEEK, oid: 9, side: 1, sizes: [1] });
  const events = kit.entries.toEvents(book.fills);
  const groups = kit.entries.buildEntries(events, -Infinity, Infinity, 60_000);

  it("are the OPEN and FLIP groups of the window [from, to), an ADD's group never one", () => {
    const entries = entriesIn(groups, M, M + WEEK);
    expect(entries.map((g) => [g.iid, g.type, g.t, g.dir])).toEqual([
      [3, "OPEN", M, 1],
      [2, "OPEN", t0, 1],
      [2, "FLIP", t0 + 2 * HOUR_MS, -1],
    ]);
    expect(groups.map((g) => [g.iid, g.type, g.t])).toEqual([
      [3, "OPEN", M],
      [2, "OPEN", t0],
      [2, "ADD", t0 + 2 * MINUTE_MS],
      [2, "FLIP", t0 + 2 * HOUR_MS],
      [2, "OPEN", M + WEEK],
    ]);
    expect(entriesIn(groups, M, M + WEEK + 1).map((g) => g.t)).toContain(
      M + WEEK,
    );
    expect(entriesIn(groups, M + 1, M + WEEK).map((g) => g.t)).not.toContain(M);
  });

  it("merge an ADD inside 60 s, list their exits with their shares, and take a forced event as an exit only", () => {
    const [, open, add, flip] = groups;
    expect(open!.merged.map((e) => e.t)).toEqual([t0 + 30_000]);
    const long = [
      { t: t0 + HOUR_MS, share: 0.5, kind: "REDUCE", forced: false },
      { t: t0 + 2 * HOUR_MS, share: 1, kind: "FLIP", forced: false },
    ];
    expect(open!.exits).toEqual(long);
    expect(add!.exits).toEqual(long);
    expect(flip!.exits).toEqual([
      { t: t0 + 3 * HOUR_MS, share: 1, kind: "CLOSE", forced: true },
    ]);
    expect(groups.some((g) => g.t === t0 + 4 * HOUR_MS)).toBe(false);
  });

  it("have an id and a delay that hold the coin's iid", () => {
    const g = groups[1]!;
    const here = delayOf(kit, A, g);
    expect(here.id).toBe(`${A}|2|${t0}|OPEN`);
    expect(here.D).toBe(kit.entries.delayOf(here.id));
    const there = delayOf(kit, A, { ...g, iid: 3 });
    expect(there.id).toBe(`${A}|3|${t0}|OPEN`);
    expect(there.D).not.toBe(here.D);
    for (const D of [here.D, there.D]) {
      expect(D).toBeGreaterThanOrEqual(62_140);
      expect(D).toBeLessThan(95_440);
    }
  });
});

describe("C4's float residue", { timeout: 60_000 }, () => {
  it("is counted when a close of 10,000 in 100,000 fills of 0.1 leaves one, which the kit reads as no close", () => {
    const sizes = Array.from({ length: 100_000 }, () => 0.1);
    const book = new FillBook()
      .order({ t: M, oid: 1, side: 1, sizes: [10_000] })
      .order({ t: M + HOUR_MS, oid: 2, side: -1, sizes });
    let net = 0;
    for (const q of sizes) net += -1 * q;
    const r = Math.abs(10_000 + net);
    expect(r).toBeGreaterThanOrEqual(1e-9);
    expect(r).toBeLessThan(1e-6);
    const events = kit.entries.toEvents(book.fills);
    expect(residues(events)).toBe(1);
    expect(events[1]!.kind).not.toBe("CLOSE");
    const clean = kit.entries.toEvents(
      new FillBook()
        .order({ t: M, oid: 1, side: 1, sizes: [10_000] })
        .order({ t: M + HOUR_MS, oid: 2, side: -1, sizes: [5_000, 5_000] })
        .fills,
    );
    expect(residues(clean)).toBe(0);
    expect(clean[1]!.kind).toBe("CLOSE");
  });
});
