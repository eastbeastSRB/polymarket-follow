/**
 * The statistic and the verdict (src/copyh/verdict.ts; rules.md C12): C12's
 * forms on made-up copies — m and SE the paper's `twoWay` over the priced,
 * m′ over those with a d, SE′ the larger of the day's and the week's (each
 * chosen once), the three sign conditions' means (a mean over no copy null);
 * each reading and each sentence's case on both sides of its bound with a
 * margin (code-rules POLISH-RULES), in the rules' order: WITHHELD, TOO FEW
 * without an error, DROP, KEEP, DROP over KEEP, (a)–(e) each and together,
 * and "no mean result as large as" the larger upper bound; R12's line after
 * every reading; "after the verdict".
 */
import { describe, expect, it } from "vitest";
import { dayOf, weekOf } from "../src/copyh/instants.js";
import {
  R12_LINE,
  afterTheVerdict,
  failingSign,
  readingOf,
  statisticOf,
  type JudgedCopy,
  type Statistic,
} from "../src/copyh/verdict.js";
import { twoWay, type TwoWay } from "../src/paper/stats.js";
import { loadResearch } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import { addr } from "./copyh-world.js";

const kit = await loadResearch();
const M = Date.parse("2025-09-08T00:00:00Z");
const Z = 2.81;

describe("C12's forms", () => {
  /** Two weeks: copies alike within a week, the weeks apart, so the week's error is the larger. */
  const weekly: JudgedCopy[] = Array.from({ length: 40 }, (_, i) => {
    const week = i < 20 ? 0 : 1;
    const x = (week === 0 ? 12 : -9) + ((i * i) % 7) / 10;
    return {
      addr: addr(i + 1),
      tIn: M + week * 7 * DAY_MS + (i % 5) * DAY_MS + HOUR_MS,
      x,
      edge: x - 1.5,
      thin: false,
    };
  });
  /** Days of one week apart, each week alike, so the day's error is the larger. */
  const daily: JudgedCopy[] = Array.from({ length: 40 }, (_, i) => {
    const day = i % 2;
    const x = (day === 0 ? 11 : -10) + ((i * i) % 5) / 10;
    return {
      addr: addr(i + 1),
      tIn: M + Math.floor(i / 20) * 7 * DAY_MS + day * DAY_MS + HOUR_MS,
      x,
      edge: x + 0.5,
      thin: false,
    };
  });

  it("take m and SE from the paper's twoWay over the priced copies, and m′ and SE′ over those with a d, SE′ the larger of the day's and the week's", () => {
    for (const [copies, larger] of [
      [weekly, "week"],
      [daily, "day"],
    ] as const) {
      const s = statisticOf(kit, copies);
      const items = (f: (c: JudgedCopy) => number | null) =>
        copies.map((c) => ({ addr: c.addr, tIn: c.tIn, x: f(c)! }));
      expect(s.money).toEqual(
        twoWay(
          kit,
          items((c) => c.x),
        ),
      );
      const byDay = twoWay(
        kit,
        items((c) => c.edge),
      )!;
      const byWeek = twoWay(
        kit,
        items((c) => c.edge).map((i) => ({ ...i, tIn: weekOf(i.tIn) })),
      )!;
      expect(s.edge.byDay).toEqual(byDay);
      expect(s.edge.byWeek).toEqual(byWeek);
      expect(byWeek.days).toBe(2);
      expect(s.edge.se).toBe(Math.max(byDay.se!, byWeek.se!));
      expect(s.edge.se).toBe(larger === "week" ? byWeek.se : byDay.se);
      expect(byWeek.se === byDay.se).toBe(false);
    }
  });

  it("leave an unpriced copy out of the money and count it, and a copy without a d out of the edge", () => {
    const copies: JudgedCopy[] = [
      ...weekly.slice(0, 10),
      { ...weekly[10]!, x: null },
      { ...weekly[11]!, edge: null },
    ];
    const s = statisticOf(kit, copies);
    expect([s.copies, s.unpriced, s.unpricedShare]).toEqual([12, 1, 1 / 12]);
    expect(s.money!.n).toBe(11);
    expect(s.edge.byDay!.n).toBe(11);
    expect(statisticOf(kit, [])).toMatchObject({
      copies: 0,
      unpriced: 0,
      unpricedShare: 0,
      money: null,
      edge: { byDay: null, byWeek: null, se: null },
    });
  });

  it("give the three sign conditions' means: the traders' own, the days' own, and without the thin-tape copies", () => {
    const A = addr(0xa);
    const B = addr(0xb);
    const day1 = M + HOUR_MS;
    const day2 = M + DAY_MS + HOUR_MS;
    const copy = (a: string, tIn: number, x: number | null, thin = false) => ({
      addr: a,
      tIn,
      x,
      edge: 1,
      thin,
    });
    const s = statisticOf(kit, [
      copy(A, day1, 10),
      copy(A, day1, 10),
      copy(A, day1 + 1, 10),
      copy(B, day2, -40, true),
      copy(B, day2, null),
    ]);
    // The mean of x is −2.5; the traders' and the days' own means average −15; without B's thin copy, 10.
    expect(s.money!.mean).toBe(-2.5);
    expect(s.signs).toEqual({ traders: -15, days: -15, withoutThin: 10 });
    expect(dayOf(day1 + 1)).toBe(dayOf(day1));
    // Every copy thin: the mean over none is null, and not above 0.
    const allThin = statisticOf(kit, [copy(A, day1, 10, true)]);
    expect(allThin.signs.withoutThin).toBeNull();
    expect(failingSign(allThin)).toBe("the mean without the thin-tape copies");
  });
});

/** A made-up statistic: m ± SE and m′ ± SE′ as given, the sign means 1 unless given. */
const two = (mean: number, se: number | null): TwoWay => ({
  n: 100,
  mean,
  se,
  seTrader: se,
  seDay: se,
  seIid: se,
  traders: 10,
  days: 10,
});
function stat(
  m: number,
  me: number,
  o: {
    se?: number | null;
    seE?: number | null;
    share?: number;
    signs?: [number | null, number | null, number | null];
  } = {},
): Statistic {
  const [traders, days, withoutThin] = o.signs ?? [1, 1, 1];
  const seE = o.seE === undefined ? 1 : o.seE;
  return {
    copies: 1000,
    unpriced: Math.round((o.share ?? 0) * 1000),
    unpricedShare: o.share ?? 0,
    money: two(m, o.se === undefined ? 1 : o.se),
    // SE′ the week's, the day's half of it.
    edge: {
      byDay: two(me, seE === null ? null : seE / 2),
      byWeek: two(me, seE),
      se: seE,
    },
    signs: { traders, days, withoutThin },
  };
}
/** At z = 2.81 with an error se: the mean whose upper bound is u, or whose lower bound is l. */
const upAt = (u: number, se: number) => u - Z * se;
const lowAt = (l: number, se: number) => l + Z * se;
const E2 = { se: 2, seE: 2 };
const E5 = { se: 5, seE: 5 };

describe("MAIN's reading (C12)", () => {
  const read = (s: Statistic) => {
    const r = readingOf(s, Z);
    expect(r.sentences.at(-1)).toBe(R12_LINE);
    return { verdict: r.verdict, sentences: r.sentences.slice(0, -1) };
  };
  /** Both lower bounds above 0, both upper bounds above +10: a KEEP but for the sign conditions. */
  const keep = (o: Parameters<typeof stat>[2] = {}) =>
    stat(lowAt(0.1, 5), lowAt(0.2, 5), { ...E5, ...o });

  it("is WITHHELD above 2% unpriced, whatever the rest, and not at 1.99%", () => {
    expect(read(keep({ share: 0.0201 }))).toEqual({
      verdict: "WITHHELD",
      sentences: [
        "Withheld: 2.0% of MAIN's copies were unpriced, above the 2% limit; the data could not answer.",
      ],
    });
    expect(read(keep({ share: 0.0199 })).verdict).toBe("KEEP");
    // Exactly 2%, 20 of 1,000: not more than 2%.
    expect(read(keep({ share: 20 / 1000 })).verdict).toBe("KEEP");
    expect(read(stat(5, 5, { ...E2, share: 0.035 })).sentences).toEqual([
      "Withheld: 3.5% of MAIN's copies were unpriced, above the 2% limit; the data could not answer.",
    ]);
  });

  it("is TOO FEW TO TELL with no error when SE or SE′ cannot be computed, or the set holds no copy", () => {
    const none = {
      verdict: "TOO FEW TO TELL",
      sentences: ["Too few to tell: no error could be computed."],
    };
    expect(read(keep({ se: null }))).toEqual(none);
    expect(read(keep({ seE: null }))).toEqual(none);
    expect(read(statisticOf(kit, []))).toEqual(none);
  });

  it("is DROP when both upper bounds are below +10 bps, each on both sides with a margin", () => {
    expect(read(stat(upAt(9.9, 2), upAt(9.8, 2), E2))).toEqual({
      verdict: "DROP",
      sentences: [
        "Drop: m + z·SE = 9.9 bps a copy on the money and m′ + z·SE′ = 9.8 on the edge over the market, both below the +10 bps line.",
      ],
    });
    expect(read(stat(upAt(10.1, 2), upAt(9.8, 2), E2)).verdict).toBe(
      "TOO FEW TO TELL",
    );
    expect(read(stat(upAt(9.9, 2), upAt(10.1, 2), E2)).verdict).toBe(
      "TOO FEW TO TELL",
    );
  });

  it("is KEEP when both lower bounds are above 0 and the three sign conditions hold, each on both sides with a margin", () => {
    expect(read(keep())).toEqual({
      verdict: "KEEP",
      sentences: [
        "Keep: m − z·SE = 0.1 bps a copy on the money and m′ − z·SE′ = 0.2 on the edge over the market, both above 0; the traders' own means, the days' own means and the copies without thin legs are above 0 too.",
      ],
    });
    expect(read(stat(lowAt(-0.1, 5), lowAt(0.2, 5), E5)).verdict).toBe(
      "TOO FEW TO TELL",
    );
    expect(read(stat(lowAt(0.1, 5), lowAt(-0.1, 5), E5)).verdict).toBe(
      "TOO FEW TO TELL",
    );
    for (const signs of [
      [-0.1, 1, 1],
      [1, -0.1, 1],
      [1, 1, -0.1],
      [0, 1, 1],
      [1, 0, 1],
      [1, 1, 0],
      [null, 1, 1],
      [1, null, 1],
      [1, 1, null],
    ] as const)
      expect(read(keep({ signs: [...signs] })).verdict, String(signs)).toBe(
        "TOO FEW TO TELL",
      );
    expect(read(keep({ signs: [0.1, 0.1, 0.1] })).verdict).toBe("KEEP");
  });

  it("is DROP when DROP and KEEP would both hold", () => {
    // Lower bounds 2.19 and 1.19, upper bounds 7.81 and 6.81, the signs above 0.
    expect(read(stat(5, 4)).verdict).toBe("DROP");
  });

  it("gives every case of (a)–(e) that applies, in order", () => {
    // (a): the money's upper bound below +10, the edge's not; both lower bounds below 0.
    expect(read(stat(upAt(9.9, 2), upAt(10.1, 2), E2)).sentences).toEqual([
      "Too few to tell: the money's upper bound, 9.9 bps a copy, is below the +10 bps line, but the edge over the market's, 10.1, is not.",
    ]);
    // (b): the reverse.
    expect(read(stat(upAt(10.1, 2), upAt(9.9, 2), E2)).sentences).toEqual([
      "Too few to tell: the edge over the market's upper bound, 9.9 bps a copy, is below the +10 bps line, but the money's, 10.1, is not.",
    ]);
    // (c): the money's lower bound above 0, the edge's not; both upper bounds above +10.
    expect(read(stat(25, -2, { se: 8, seE: 8 })).sentences).toEqual([
      "Too few to tell: the money's lower bound, 2.5 bps a copy, is above 0, but the edge over the market's, -24.5, is not; the market's direction may carry the money.",
    ]);
    // (d): the reverse.
    expect(read(stat(-2, 25, { se: 8, seE: 8 })).sentences).toEqual([
      "Too few to tell: the edge over the market's lower bound, 2.5 bps a copy, is above 0, but the money's, -24.5, is not.",
    ]);
    // (a) and (c) together: the money between 0 and +10, the edge wide.
    expect(read(stat(5, 5, { se: 1, seE: 3 })).sentences).toEqual([
      "Too few to tell: the money's upper bound, 7.8 bps a copy, is below the +10 bps line, but the edge over the market's, 13.4, is not.",
      "Too few to tell: the money's lower bound, 2.2 bps a copy, is above 0, but the edge over the market's, -3.4, is not; the market's direction may carry the money.",
    ]);
    // (b) and (d) together: the reverse.
    expect(read(stat(5, 5, { se: 3, seE: 1 })).sentences).toEqual([
      "Too few to tell: the edge over the market's upper bound, 7.8 bps a copy, is below the +10 bps line, but the money's, 13.4, is not.",
      "Too few to tell: the edge over the market's lower bound, 2.2 bps a copy, is above 0, but the money's, -3.4, is not.",
    ]);
    // (e) alone, each sign condition by name, the first failing.
    for (const [signs, name] of [
      [[-1, -1, -1], "the mean of the traders' own means"],
      [[1, -1, -1], "the mean of the days' own means"],
      [[1, 1, -1], "the mean without the thin-tape copies"],
    ] as const)
      expect(read(keep({ signs: [...signs] })).sentences).toEqual([
        `Too few to tell: both lower bounds are above 0, but ${name} is not.`,
      ]);
    // (b) and (e) together.
    expect(
      read(stat(20, 5, { se: 3, seE: 1, signs: [1, -1, 1] })).sentences,
    ).toEqual([
      "Too few to tell: the edge over the market's upper bound, 7.8 bps a copy, is below the +10 bps line, but the money's, 28.4, is not.",
      "Too few to tell: both lower bounds are above 0, but the mean of the days' own means is not.",
    ]);
  });

  it("says when no bound is reached that no mean result as large as the larger upper bound was seen", () => {
    // Upper bounds 19.86 (money) and 20.86 (edge); both lower bounds below 0.
    expect(read(stat(3, 4, { se: 6, seE: 6 }))).toEqual({
      verdict: "TOO FEW TO TELL",
      sentences: [
        "Too few to tell: no mean result as large as 20.9 bps a copy was seen.",
      ],
    });
    // The money's the larger: 20.86 against 14.24.
    expect(read(stat(4, 3, { se: 6, seE: 4 })).sentences).toEqual([
      "Too few to tell: no mean result as large as 20.9 bps a copy was seen.",
    ]);
    // The edge's the larger: 19.86 against 15.24.
    expect(read(stat(4, 3, { se: 4, seE: 6 })).sentences).toEqual([
      "Too few to tell: no mean result as large as 19.9 bps a copy was seen.",
    ]);
  });
});

describe("the verdict (C12)", () => {
  it("is the first KEEP or DROP: a look after one is marked after the verdict; WITHHELD and TOO FEW leave it to the next look", () => {
    expect(afterTheVerdict(["KEEP"])).toBe(true);
    expect(afterTheVerdict(["DROP"])).toBe(true);
    expect(afterTheVerdict(["WITHHELD"])).toBe(false);
    expect(afterTheVerdict(["TOO FEW TO TELL"])).toBe(false);
    expect(afterTheVerdict([])).toBe(false);
  });
});
