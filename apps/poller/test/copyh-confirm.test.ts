/**
 * The confirmation on S (src/copyh/confirm.ts; rules.md C14, Holm with
 * m = 2, RM1), on statistics written out: s = min(m ÷ SE, m′ ÷ SE′), none
 * without an error; Holm's order by s, a try with no s second, equal s in
 * the choice's order; the first at 2.24, the second at 1.96 only when the
 * first's s exceeded 2.24, whatever the first's other conditions; a lone try
 * at 2.24; WITHHELD before the bounds; each sign condition; every reading's
 * sentence, each bound on both sides with a margin, and an s of exactly
 * 2.24 not above it.
 */
import { describe, expect, it } from "vitest";
import { confirmationOf, holmOrder, sOf } from "../src/copyh/confirm.js";
import { R12_LINE, type Statistic } from "../src/copyh/verdict.js";

const line = (mean: number, se: number | null) => ({
  n: 300,
  mean,
  se,
  seTrader: se,
  seDay: se,
  seIid: se,
  traders: 40,
  days: 90,
});
/** A set's statistic: the money's m and SE, the edge's m′ and SE′ (byDay's mean, the larger error), the share unpriced, the sign means. */
const stat = (
  o: {
    m?: number;
    se?: number | null;
    mp?: number;
    sep?: number | null;
    unpriced?: number;
    signs?: Partial<Statistic["signs"]>;
    noMoney?: boolean;
  } = {},
): Statistic => ({
  copies: 300,
  unpriced: Math.round((o.unpriced ?? 0) * 300),
  unpricedShare: o.unpriced ?? 0,
  money:
    o.noMoney === true ? null : line(o.m ?? 10, o.se === undefined ? 2 : o.se),
  edge: {
    byDay: line(o.mp ?? 9, 1),
    byWeek: line(o.mp ?? 9, 1.5),
    se: o.sep === undefined ? 1.5 : o.sep,
  },
  signs: { traders: 1, days: 1, withoutThin: 1, ...o.signs },
});
const confirmed = (z: number, x: number, y: number) => [
  `Confirmed on S at ${z}: m − z·SE = ${x.toFixed(1)} bps a copy and m′ − z·SE′ = ${y.toFixed(1)}, both above 0; the traders' own means, the days' own means and the copies without thin legs are above 0 too.`,
  R12_LINE,
];
const notConfirmed = (z: number, x: number, y: number) => [
  `Not confirmed on S at ${z}: m − z·SE = ${x.toFixed(1)} bps a copy and m′ − z·SE′ = ${y.toFixed(1)}; a confirmation needs both above 0 and the three conditions.`,
  R12_LINE,
];
const NOT_TESTED = [
  "Not confirmed on S: not tested, since the first try's bounds at 2.24 were not both above 0.",
  R12_LINE,
];
const NO_S = ["Not confirmed on S: no error could be computed.", R12_LINE];

describe("s and Holm's order (C14)", () => {
  it("takes s as the smaller of m ÷ SE and m′ ÷ SE′, none without an error", () => {
    expect(sOf(stat({ m: 10, se: 2, mp: 9, sep: 1.5 }))).toBe(5);
    expect(sOf(stat({ m: 10, se: 4, mp: 9, sep: 1.5 }))).toBe(2.5);
    expect(sOf(stat({ m: 10, se: 1, mp: 9, sep: 3 }))).toBe(3);
    expect(sOf(stat({ noMoney: true }))).toBeNull();
    expect(sOf(stat({ se: null }))).toBeNull();
    expect(sOf(stat({ sep: null }))).toBeNull();
  });

  it("orders by s, the larger first; a try with no s second; equal s, or none, in the choice's order", () => {
    expect(holmOrder([3, 5])).toEqual([1, 0]);
    expect(holmOrder([5, 3])).toEqual([0, 1]);
    expect(holmOrder([null, 2])).toEqual([1, 0]);
    expect(holmOrder([2, null])).toEqual([0, 1]);
    expect(holmOrder([4, 4])).toEqual([0, 1]);
    expect(holmOrder([null, null])).toEqual([0, 1]);
    expect(holmOrder([7])).toEqual([0]);
    expect(holmOrder([])).toEqual([]);
  });
});

describe("the readings on S (C14, RM1, in their order)", () => {
  it("confirms a lone try at 2.24 when its s exceeds it, both sides with a margin", () => {
    // s = min(m / 2, 9 / 1.5 = 6): 2.25 against 2.23 at m = 4.5 and 4.46.
    expect(confirmationOf([stat({ m: 4.5 })])).toEqual([
      {
        reading: "CONFIRMED",
        s: 2.25,
        z: 2.24,
        sentences: confirmed(2.24, 4.5 - 2.24 * 2, 9 - 2.24 * 1.5),
      },
    ]);
    expect(confirmationOf([stat({ m: 4.46 })])[0]).toEqual({
      reading: "NOT CONFIRMED",
      s: 2.23,
      z: 2.24,
      sentences: notConfirmed(2.24, 4.46 - 2.24 * 2, 9 - 2.24 * 1.5),
    });
    // The edge's side: s = min(9 / 2, m′ / 1.5), 2.25 against 2.23.
    expect(confirmationOf([stat({ m: 9, mp: 3.375 })])[0]!.reading).toBe(
      "CONFIRMED",
    );
    expect(confirmationOf([stat({ m: 9, mp: 3.345 })])[0]).toMatchObject({
      reading: "NOT CONFIRMED",
      z: 2.24,
    });
  });

  it("tests the second at 1.96 only when the first's s exceeded 2.24, whatever the first's other conditions", () => {
    // The first by s is the choice's second here.
    const second = stat({ m: 4 }); // s = 2.0
    expect(
      confirmationOf([second, stat({ m: 9 })]).map((r) => [r.reading, r.z]),
    ).toEqual([
      ["CONFIRMED", 1.96],
      ["CONFIRMED", 2.24],
    ]);
    expect(confirmationOf([stat({ m: 3.9 }), stat({ m: 9 })])[0]).toEqual({
      reading: "NOT CONFIRMED",
      s: 1.95,
      z: 1.96,
      sentences: notConfirmed(1.96, 3.9 - 1.96 * 2, 9 - 1.96 * 1.5),
    });
    // The first's s at 2.23: the second not tested.
    expect(confirmationOf([second, stat({ m: 4.46 })])).toEqual([
      { reading: "NOT CONFIRMED", s: 2, z: null, sentences: NOT_TESTED },
      {
        reading: "NOT CONFIRMED",
        s: 2.23,
        z: 2.24,
        sentences: notConfirmed(2.24, 4.46 - 2.24 * 2, 9 - 2.24 * 1.5),
      },
    ]);
    // The first's s exactly 2.24 (4.48 ÷ 2): not above its bar, and the second not tested.
    expect(
      confirmationOf([second, stat({ m: 4.48 })]).map((r) => [r.reading, r.z]),
    ).toEqual([
      ["NOT CONFIRMED", null],
      ["NOT CONFIRMED", 2.24],
    ]);
    // The first's s above 2.24 but a sign failing, or WITHHELD: the second is still tested.
    for (const [first, reading] of [
      [stat({ m: 9, signs: { days: 0 } }), "NOT CONFIRMED"],
      [stat({ m: 9, unpriced: 0.021 }), "WITHHELD"],
    ] as const)
      expect(
        confirmationOf([first, second]).map((r) => [r.reading, r.z]),
      ).toEqual([
        [reading, 2.24],
        ["CONFIRMED", 1.96],
      ]);
  });

  it("puts a try with no s second, its reading no error; equal s in the choice's order", () => {
    expect(confirmationOf([stat({ se: null }), stat({ m: 9 })])).toEqual([
      { reading: "NOT CONFIRMED", s: null, z: null, sentences: NO_S },
      {
        reading: "CONFIRMED",
        s: 4.5,
        z: 2.24,
        sentences: confirmed(2.24, 9 - 2.24 * 2, 9 - 2.24 * 1.5),
      },
    ]);
    expect(
      confirmationOf([stat({ m: 6 }), stat({ m: 6 })]).map((r) => r.z),
    ).toEqual([2.24, 1.96]);
    expect(
      confirmationOf([stat({ noMoney: true }), stat({ sep: null })]).map(
        (r) => r.sentences,
      ),
    ).toEqual([NO_S, NO_S]);
  });

  it("withholds a set of more than 2% unpriced before the bounds, and not one of 2%", () => {
    expect(confirmationOf([stat({ m: 9, unpriced: 0.0201 })])[0]).toEqual({
      reading: "WITHHELD",
      s: 4.5,
      z: 2.24,
      sentences: [
        "Withheld on S: 2.0% of the copies were unpriced, above the 2% limit.",
        R12_LINE,
      ],
    });
    expect(confirmationOf([stat({ m: 9, unpriced: 0.02 })])[0]!.reading).toBe(
      "CONFIRMED",
    );
    expect(
      confirmationOf([stat({ se: null, unpriced: 0.05 })])[0]!.reading,
    ).toBe("WITHHELD");
  });

  it("confirms only when the three sign conditions hold on S", () => {
    for (const signs of [{ traders: 0 }, { days: -0.1 }, { withoutThin: null }])
      expect(confirmationOf([stat({ m: 9, signs })])[0]).toEqual({
        reading: "NOT CONFIRMED",
        s: 4.5,
        z: 2.24,
        sentences: notConfirmed(2.24, 9 - 2.24 * 2, 9 - 2.24 * 1.5),
      });
  });

  it("refuses more than two chosen tries", () => {
    expect(() => confirmationOf([stat(), stat(), stat()])).toThrow(/at most 2/);
  });
});
