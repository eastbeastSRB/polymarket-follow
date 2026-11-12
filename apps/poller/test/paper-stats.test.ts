import { describe, expect, it } from "vitest";
import { loadResearch } from "../src/paper/research.js";
import {
  DROP_BPS,
  LOOK_Z,
  dailyEValue,
  smallestEdge,
  traderBand,
  twoWay,
  verdict,
  type Item,
} from "../src/paper/stats.js";
import { DAY_MS } from "../src/schedule.js";

const kit = await loadResearch();
const D0 = Date.parse("2026-11-09T00:00:00Z");

describe("the two-way error (R12)", () => {
  it("is √max(V_trader + V_day − V_iid, V_trader, V_day) on the kit's CR1 variances", () => {
    const items: Item[] = [
      { addr: "a", tIn: D0 + 1, x: 10 },
      { addr: "a", tIn: D0 + DAY_MS + 1, x: -4 },
      { addr: "b", tIn: D0 + 2, x: 25 },
      { addr: "b", tIn: D0 + 2 * DAY_MS, x: 7 },
      { addr: "c", tIn: D0 + DAY_MS + 5, x: -12 },
      { addr: "c", tIn: D0 + 2 * DAY_MS + 9, x: 3 },
    ];
    const r = twoWay(kit, items)!;
    const vT =
      kit.stats.cr1Test(
        items,
        (i) => i.addr,
        (i) => i.x,
      ).se! ** 2;
    const vD =
      kit.stats.cr1Test(
        items,
        (i) => Math.floor(i.tIn / DAY_MS),
        (i) => i.x,
      ).se! ** 2;
    const m = items.reduce((s, i) => s + i.x, 0) / 6;
    const vI = items.reduce((s, i) => s + (i.x - m) ** 2, 0) / 5 / 6;
    expect(r.mean).toBeCloseTo(m, 12);
    expect(r.se).toBeCloseTo(Math.sqrt(Math.max(vT + vD - vI, vT, vD)), 12);
    expect([r.traders, r.days, r.n]).toEqual([3, 3, 6]);
    expect(r.seIid).toBeCloseTo(Math.sqrt(vI), 12);
  });

  it("is never below either one-way error", () => {
    // Positive dependence inside a trader and inside a day: the sum can exceed both; one alone can be the larger.
    const items: Item[] = Array.from({ length: 40 }, (_, i) => ({
      addr: `t${i % 4}`,
      tIn: D0 + (i % 5) * DAY_MS,
      x: (i % 4) * 9 - (i % 5) * 2 + (i % 3),
    }));
    const r = twoWay(kit, items)!;
    expect(r.se!).toBeGreaterThanOrEqual(r.seTrader! - 1e-12);
    expect(r.se!).toBeGreaterThanOrEqual(r.seDay! - 1e-12);
  });

  it("has no error with one trader or one day", () => {
    expect(
      twoWay(kit, [
        { addr: "a", tIn: D0, x: 1 },
        { addr: "a", tIn: D0 + DAY_MS, x: 2 },
      ])!.se,
    ).toBeNull();
    expect(twoWay(kit, [])).toBeNull();
  });
});

describe("the verdict (R12, Q-G, F16 c)", () => {
  const z = LOOK_Z[0];
  it("keeps when the lower bound is above zero and d agrees", () => {
    expect(verdict({ mean: 40, se: 10, z, meanD: 1, unpricedShare: 0 })).toBe(
      "KEEP",
    );
    expect(verdict({ mean: 40, se: 10, z, meanD: 0, unpricedShare: 0 })).toBe(
      "TOO FEW TO TELL",
    );
    expect(
      verdict({ mean: 40, se: 10, z, meanD: null, unpricedShare: 0 }),
    ).toBe("TOO FEW TO TELL");
    expect(verdict({ mean: 28.1, se: 10, z, meanD: 1, unpricedShare: 0 })).toBe(
      "TOO FEW TO TELL",
    );
    expect(verdict({ mean: 28.2, se: 10, z, meanD: 1, unpricedShare: 0 })).toBe(
      "KEEP",
    );
  });

  it("drops when the upper bound is below +10 bps, and drop wins when both hold", () => {
    expect(verdict({ mean: -20, se: 10, z, meanD: -3, unpricedShare: 0 })).toBe(
      "DROP",
    );
    expect(
      verdict({
        mean: DROP_BPS - z * 1 - 0.01,
        se: 1,
        z,
        meanD: 5,
        unpricedShare: 0,
      }),
    ).toBe("DROP");
    // Both: a lower bound above zero and an upper bound below 10.
    expect(verdict({ mean: 5, se: 1, z, meanD: 2, unpricedShare: 0 })).toBe(
      "DROP",
    );
    expect(
      verdict({
        mean: DROP_BPS - z * 1 + 0.01,
        se: 1,
        z,
        meanD: 5,
        unpricedShare: 0,
      }),
    ).toBe("KEEP");
  });

  it("withholds above 2% unpriced, and has nothing to say without an error", () => {
    expect(
      verdict({ mean: 40, se: 10, z, meanD: 1, unpricedShare: 0.021 }),
    ).toBe("WITHHELD");
    expect(
      verdict({ mean: 40, se: 10, z, meanD: 1, unpricedShare: 0.02 }),
    ).toBe("KEEP");
    expect(
      verdict({ mean: -40, se: null, z, meanD: 1, unpricedShare: 0 }),
    ).toBe("TOO FEW TO TELL");
    expect(LOOK_Z).toEqual([2.81, 2.43, 2.17]);
  });
});

describe("R3's pooled daily e-value, the smallest edge, a trader's band (R14, R15, F16 b)", () => {
  it("votes once a UTC day by the sign of its mean d, dropping ties within 0.1 bps", () => {
    const e = dailyEValue([
      { tIn: D0 + 1, d: 5 },
      { tIn: D0 + 2, d: -1 },
      { tIn: D0 + DAY_MS, d: 3 },
      { tIn: D0 + 2 * DAY_MS, d: 2 },
      { tIn: D0 + 3 * DAY_MS, d: 0.05 },
    ]);
    // 3 votes, 3 positive: 2^3 · 3! · 0! / 4! = 2.
    expect(e).toEqual({
      e: expect.closeTo(2, 12) as number,
      votes: 3,
      positive: 3,
    });
    const mixed = dailyEValue([
      { tIn: D0, d: 1 },
      { tIn: D0 + DAY_MS, d: -1 },
    ]);
    // 2 votes, 1 positive: 4 · 1 · 1 / 6.
    expect(mixed.e).toBeCloseTo(4 / 6, 12);
  });

  it("scales the realized error to the next look's data", () => {
    expect(smallestEdge(10, 2.43, 42, 91)).toBeCloseTo(
      (2.43 + 0.8416212335729143) * 10 * Math.sqrt(42 / 91),
      12,
    );
    expect(smallestEdge(null, 2.43, 42, 91)).toBeNull();
  });

  it("bands a trader by day from 20 days with a copy, with Student's t", () => {
    const items = (days: number): Item[] =>
      Array.from({ length: days * 2 }, (_, i) => ({
        addr: "a",
        tIn: D0 + Math.floor(i / 2) * DAY_MS,
        x: ((i * 7) % 11) - 4,
      }));
    expect(traderBand(kit, items(19))).toBeNull();
    const b = traderBand(kit, items(20))!;
    const r = kit.stats.cr1Test(
      items(20),
      (i) => Math.floor(i.tIn / DAY_MS),
      (i) => i.x,
    );
    const t = kit.stats.tCritical(0.05, 19);
    expect(b.low).toBeCloseTo(r.estimate! - t * r.se!, 12);
    expect(b.high).toBeCloseTo(r.estimate! + t * r.se!, 12);
  });
});
