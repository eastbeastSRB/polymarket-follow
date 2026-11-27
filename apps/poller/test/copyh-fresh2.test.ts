/**
 * FRESH-2's sealed judgment (src/copyh/fresh2.ts; rules.md C14, RM1), on
 * statistics written out: each reading and sentence, in their order
 * (WITHHELD before the bounds; no error; both lower bounds and the three
 * sign conditions), each bound on both sides with a margin and at exactly
 * 0, at a try's 1.96 and at MAIN's 1.645.
 */
import { describe, expect, it } from "vitest";
import { Z_SEAL } from "../src/copyh/design.js";
import { sealedOf } from "../src/copyh/fresh2.js";
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
const yes = (x: number, y: number) => [
  `Confirmed on FRESH-2: m − z·SE = ${x.toFixed(1)} bps a copy and m′ − z·SE′ = ${y.toFixed(1)}, both above 0; the traders' own means, the days' own means and the copies without thin legs are above 0 too.`,
  R12_LINE,
];
const no = (x: number, y: number) => [
  `Not confirmed on FRESH-2: m − z·SE = ${x.toFixed(1)} bps a copy and m′ − z·SE′ = ${y.toFixed(1)}; a yes needs both above 0 and the three conditions.`,
  R12_LINE,
];

describe("the sealed judgment on FRESH-2 (C14, RM1)", () => {
  it("bars a try at 1.96 and MAIN's KEEP at 1.645", () => {
    expect(Z_SEAL).toEqual([1.96, 1.645]);
  });

  it("confirms when both lower bounds are above 0, each bound on both sides with a margin, at a try's 1.96 and MAIN's 1.645", () => {
    for (const z of Z_SEAL) {
      const m = 2 * z;
      expect(sealedOf(stat({ m: m + 0.02 }), z)).toEqual({
        reading: "CONFIRMED",
        z,
        sentences: yes(m + 0.02 - z * 2, 9 - z * 1.5),
      });
      expect(sealedOf(stat({ m: m - 0.02 }), z)).toEqual({
        reading: "NOT CONFIRMED",
        z,
        sentences: no(m - 0.02 - z * 2, 9 - z * 1.5),
      });
      // A lower bound of exactly 0 (m = z·SE) is not above 0.
      expect(sealedOf(stat({ m }), z).reading).toBe("NOT CONFIRMED");
      const mp = 1.5 * z;
      expect(sealedOf(stat({ m: 9, mp }), z).reading).toBe("NOT CONFIRMED");
      expect(sealedOf(stat({ m: 9, mp: mp + 0.02 }), z)).toEqual({
        reading: "CONFIRMED",
        z,
        sentences: yes(9 - z * 2, mp + 0.02 - z * 1.5),
      });
      expect(sealedOf(stat({ m: 9, mp: mp - 0.02 }), z)).toEqual({
        reading: "NOT CONFIRMED",
        z,
        sentences: no(9 - z * 2, mp - 0.02 - z * 1.5),
      });
    }
  });

  it("confirms only when the three sign conditions hold", () => {
    for (const signs of [{ traders: 0 }, { days: null }, { withoutThin: -1 }])
      expect(sealedOf(stat({ m: 9, signs }), 1.96)).toEqual({
        reading: "NOT CONFIRMED",
        z: 1.96,
        sentences: no(9 - 1.96 * 2, 9 - 1.96 * 1.5),
      });
  });

  it("withholds a set of more than 2% unpriced before the bounds, and not one of 2%", () => {
    expect(sealedOf(stat({ unpriced: 0.0201 }), 1.96)).toEqual({
      reading: "WITHHELD",
      z: 1.96,
      sentences: [
        "Withheld on FRESH-2: 2.0% of the copies were unpriced, above the 2% limit.",
        R12_LINE,
      ],
    });
    expect(sealedOf(stat({ m: 9, unpriced: 0.02 }), 1.96).reading).toBe(
      "CONFIRMED",
    );
    expect(sealedOf(stat({ se: null, unpriced: 0.05 }), 1.645).reading).toBe(
      "WITHHELD",
    );
  });

  it("gives no error's reading for an empty set or one whose SE or SE′ cannot be computed", () => {
    for (const s of [
      stat({ noMoney: true }),
      stat({ se: null }),
      stat({ sep: null }),
    ])
      expect(sealedOf(s, 1.645)).toEqual({
        reading: "NOT CONFIRMED",
        z: 1.645,
        sentences: [
          "Not confirmed on FRESH-2: no error could be computed.",
          R12_LINE,
        ],
      });
  });
});
