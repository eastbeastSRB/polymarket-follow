/**
 * Labels and habits at M (src/copyh/labels.ts; rules.md C5): the capture's
 * start and oldest on both sides of M − 90 d = ARCHIVE_START, a fill at M
 * left out; "no fills in window" at once, as the kit says it, a fill at
 * M − 14 d not; a capture past LABEL_FILLS_MAX not run through the kit, at
 * the limit run; a directional account P1 and a market maker not, each the
 * kit's own label; an account the churner rule reaches never directional
 * with pnl 0 (nor with pnl); the coverage of P1's and the habits' windows;
 * the habits from the fills before M equal to the whole history's without a
 * straddling event, and computed apart with one.
 */
import { describe, expect, it } from "vitest";
import { ARCHIVE_START, M0 } from "../src/copyh/design.js";
import { historyOf } from "../src/copyh/entries.js";
import {
  DIRECTIONAL,
  NO_FILLS,
  TOO_LARGE,
  boundedCapture,
  coverageAt,
  fillsBefore,
  habitsAtMonday,
  isP1,
  labelOf,
} from "../src/copyh/labels.js";
import { loadResearch, type Fill } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import { FillBook } from "./copyh-engine-world.js";

const kit = await loadResearch();
const M = Date.parse("2025-09-01T00:00:00Z");
const NO_LIMIT = 1e9;
const at = (book: FillBook) => book.fills.map((f) => f.t);

/** Eight round trips of 12 hours on two coins in the 14 days before M, one at a time, every size its own: the kit's directional trader. */
function directional(): FillBook {
  const sizes = [1, 2, 3, 1.5, 2.5, 4, 3.5, 5];
  const book = new FillBook();
  sizes.forEach((q, k) => {
    const t = M - 13 * DAY_MS + k * 36 * HOUR_MS;
    const iid = k % 2 === 0 ? 2 : 3;
    const side = k % 3 === 0 ? -1 : 1;
    book.order({ t, iid, oid: 2 * k + 1, side, sizes: [q] }).order({
      t: t + 12 * HOUR_MS,
      iid,
      oid: 2 * k + 2,
      side: side === 1 ? -1 : 1,
      sizes: [q],
    });
  });
  return book;
}

/** Forty one-fill maker orders, buy and sell in turn, six hours apart: the kit's market maker. */
function marketMaker(): FillBook {
  const book = new FillBook();
  for (let k = 0; k < 40; k++)
    book.order({
      t: M - 13 * DAY_MS + k * 6 * HOUR_MS,
      oid: k + 1,
      side: k % 2 === 0 ? 1 : -1,
      sizes: [1],
      taker: false,
    });
  return book;
}

/** Six round trips each closed in 30 s, a day apart, every size its own; the close's pnl given. */
function churner(pnl: (q: number) => number): FillBook {
  const book = new FillBook();
  for (let k = 0; k < 6; k++) {
    const t = M - 12 * DAY_MS + k * DAY_MS;
    const q = k + 1;
    book.order({ t, oid: 2 * k + 1, side: 1, sizes: [q] }).order({
      t: t + 30_000,
      oid: 2 * k + 2,
      side: -1,
      sizes: [q],
      pnl: pnl(q),
    });
  }
  return book;
}

describe("the label's capture", () => {
  it("starts at max(ARCHIVE_START, M − 90 d), truncated, its oldest that start, a fill at M left out", () => {
    for (const Mx of [
      Date.parse("2025-08-18T00:00:00Z"),
      Date.parse("2025-08-25T00:00:00Z"),
    ]) {
      const start = Math.max(ARCHIVE_START, Mx - 90 * DAY_MS);
      const book = new FillBook();
      [start - 1, start, Mx - 1, Mx].forEach((t, k) =>
        book.order({ t, oid: k + 1, side: 1, sizes: [1] }),
      );
      const cap = boundedCapture(book.fills, Mx);
      expect(cap.fills.map((f) => f.t)).toEqual([start, Mx - 1]);
      expect(cap).toMatchObject({ pages: 0, truncated: true, oldest: start });
    }
    // The bound binds from the second of the two Mondays.
    expect(Date.parse("2025-08-18T00:00:00Z") - 90 * DAY_MS).toBeLessThan(
      ARCHIVE_START,
    );
    expect(Date.parse("2025-08-25T00:00:00Z") - 90 * DAY_MS).toBeGreaterThan(
      ARCHIVE_START,
    );
  });
});

describe("the label", { timeout: 60_000 }, () => {
  it("is 'no fills in window' at once when the 14 days before M hold none, as the kit says; a fill at M − 14 d runs the kit", () => {
    const early = new FillBook()
      .order({ t: M - 20 * DAY_MS, oid: 1, side: 1, sizes: [1] })
      .order({ t: M - 14 * DAY_MS - 1, oid: 2, side: -1, sizes: [1] });
    const cap = boundedCapture(early.fills, M);
    expect(labelOf(kit, cap, M, NO_LIMIT)).toBe(NO_FILLS);
    expect(kit.labels.labelAt(cap, M).label).toBe(NO_FILLS);
    // Even past the size limit, the empty window answers first.
    expect(labelOf(kit, cap, M, 1)).toBe(NO_FILLS);
    const edge = new FillBook().order({
      t: M - 14 * DAY_MS,
      oid: 1,
      side: 1,
      sizes: [1],
    });
    const capEdge = boundedCapture(edge.fills, M);
    expect(labelOf(kit, capEdge, M, NO_LIMIT)).toBe(
      kit.labels.labelAt(capEdge, M).label,
    );
    expect(labelOf(kit, capEdge, M, NO_LIMIT)).not.toBe(NO_FILLS);
  });

  it("is the kit's: a directional trader P1, a market maker not", () => {
    const cap = boundedCapture(directional().fills, M);
    expect(kit.labels.labelAt(cap, M).label).toBe(DIRECTIONAL);
    expect(labelOf(kit, cap, M, NO_LIMIT)).toBe(DIRECTIONAL);
    expect(isP1(labelOf(kit, cap, M, NO_LIMIT), coverageAt(kit, M))).toBe(true);
    const mm = boundedCapture(marketMaker().fills, M);
    expect(labelOf(kit, mm, M, NO_LIMIT)).toBe("market maker");
    expect(kit.labels.labelAt(mm, M).label).toBe("market maker");
    expect(isP1(labelOf(kit, mm, M, NO_LIMIT), coverageAt(kit, M))).toBe(false);
  });

  it("is not run past LABEL_FILLS_MAX: at the limit the kit's, one past it never P1", () => {
    const cap = boundedCapture(directional().fills, M);
    const n = cap.fills.length;
    expect(labelOf(kit, cap, M, n)).toBe(DIRECTIONAL);
    expect(labelOf(kit, cap, M, n - 1)).toBe(TOO_LARGE);
    expect(isP1(TOO_LARGE, coverageAt(kit, M))).toBe(false);
  });

  it("never makes an account the churner rule reaches directional: churner with pnl 0, mixed with pnl", () => {
    const zero = boundedCapture(churner(() => 0).fills, M);
    expect(labelOf(kit, zero, M, NO_LIMIT)).toBe("churner");
    // The close earns 2% of the side's notional: 200 bp, past the churner's 10.
    const paid = boundedCapture(churner((q) => 2 * q).fills, M);
    expect(labelOf(kit, paid, M, NO_LIMIT)).toBe("unclassified — mixed");
  });
});

describe("P1's and the habits' windows", () => {
  it("are covered when they lie in the archive: from M₀ both, a Monday earlier one or neither", () => {
    expect(coverageAt(kit, M0)).toEqual({
      labelCovered: true,
      habitCovered: true,
    });
    expect(coverageAt(kit, Date.parse("2025-06-23T00:00:00Z"))).toEqual({
      labelCovered: true,
      habitCovered: false,
    });
    expect(coverageAt(kit, Date.parse("2025-06-02T00:00:00Z"))).toEqual({
      labelCovered: false,
      habitCovered: false,
    });
    expect(isP1(DIRECTIONAL, { labelCovered: false, habitCovered: true })).toBe(
      false,
    );
  });
});

/** The kit's habits at M from the fills before M alone. */
function habitsBefore(fills: readonly Fill[], Mx: number) {
  const events = kit.entries.toEvents(fillsBefore(fills, Mx));
  return kit.labels.habitsAt(
    {
      cycles: kit.entries.toCycles(events),
      groups: kit.entries.buildEntries(events, -Infinity, Infinity, 60_000),
    },
    Mx,
  );
}

describe("the habits at M", { timeout: 60_000 }, () => {
  it("are the whole history's when no order event straddles M, equal to those of the fills before M", () => {
    const book = new FillBook()
      .order({ t: M - 10 * DAY_MS, oid: 1, side: 1, sizes: [1] })
      .order({ t: M - 9 * DAY_MS, oid: 2, side: -1, sizes: [1] })
      .order({ t: M - 5 * DAY_MS, oid: 3, side: -1, sizes: [2] })
      .order({ t: M - 4 * DAY_MS, oid: 4, side: 1, sizes: [2] })
      .order({ t: M - 2 * HOUR_MS, oid: 5, side: 1, sizes: [3] })
      .order({ t: M + 5 * HOUR_MS, oid: 6, side: -1, sizes: [3] });
    const built = historyOf(kit, book.fills, {
      fills: NO_LIMIT,
      exits: NO_LIMIT,
    });
    if (built.kind !== "built") throw new Error(built.kind);
    for (const Mx of [M - 7 * DAY_MS, M, M + 7 * DAY_MS]) {
      const h = habitsAtMonday(kit, built.history, book.fills, Mx);
      expect(h.apart).toBe(false);
      expect(h.habits).toEqual(habitsBefore(book.fills, Mx));
    }
    expect(
      habitsAtMonday(kit, built.history, book.fills, M).habits,
    ).toMatchObject({
      closed: 2,
      medianHoldMs: DAY_MS,
      entries: 3,
      longShare: 2 / 3,
    });
  });

  it("are computed apart from the fills before M when an order event straddles M", () => {
    // oid 6 rests: one fill at M − 1 h, one at M + 1 h after oid 7 bought back, so both have the chain head 1.
    const book = new FillBook()
      .order({ t: M - 2 * HOUR_MS, oid: 1, side: 1, sizes: [1] })
      .order({ t: M - HOUR_MS, oid: 6, side: -1, sizes: [1] })
      .order({ t: M - HOUR_MS / 2, oid: 7, side: 1, sizes: [1] })
      .order({ t: M + HOUR_MS, oid: 6, side: -1, sizes: [2] });
    expect(at(book)).toEqual([
      M - 2 * HOUR_MS,
      M - HOUR_MS,
      M - HOUR_MS / 2,
      M + HOUR_MS,
    ]);
    const built = historyOf(kit, book.fills, {
      fills: NO_LIMIT,
      exits: NO_LIMIT,
    });
    if (built.kind !== "built") throw new Error(built.kind);
    const h = habitsAtMonday(kit, built.history, book.fills, M);
    expect(h.apart).toBe(true);
    expect(h.habits).toEqual(habitsBefore(book.fills, M));
    expect(h.habits).toMatchObject({ entries: 2, longShare: 1 });
    // Read from the whole history, the split event's FLIP would have counted.
    expect(
      kit.labels.habitsAt(
        { cycles: built.history.cycles, groups: built.history.groups },
        M,
      ),
    ).toMatchObject({ entries: 3, longShare: 2 / 3 });
  });
});
