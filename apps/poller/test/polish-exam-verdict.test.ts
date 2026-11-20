/**
 * The exam's verdict (src/polish/exam/verdict.ts; polish/rules.md P9, P11,
 * P12; THE PLAN D31, D36–D44): each verdict at its boundary, in the order
 * WITHHELD, TOO FEW TO TELL, DOES NOT HOLD, HOLDS, LIKELY, NOT SETTLED;
 * DOES NOT HOLD at HOLDS's z (Q3); HOLDS's and LIKELY's three conditions
 * each failing alone; the sentences; the looks as MARKET-1's M11 (only
 * HOLDS or DOES NOT HOLD end the exam before its last look); the bars and
 * options the design holds; OWN at a position.
 */
import { beforeAll, describe, expect, it } from "vitest";
import {
  DROP_BPS,
  MIN_DAYS,
  MIN_MARKETS,
  NOT_AT_BOOK_LIMIT,
} from "../src/market1/stats.js";
import { loadResearch, type Research } from "../src/paper/research.js";
import {
  BARS,
  DELTA,
  OPTIONS,
  PLACEBO,
  PLACEBO_JSON,
  TEXTBOOK,
  TOO_FEW,
  WITHHELD_SHARE,
} from "../src/polish/exam/design.js";
import {
  NOT_ADVICE,
  bothAtTheBook,
  decidedOf,
  decides,
  examVerdict,
  verdictOf,
  type Decided,
  type Verdict,
} from "../src/polish/exam/verdict.js";
import { ownOf } from "../src/polish/tries/beside.js";
import { statOf } from "../src/polish/tries/stats.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { loadCoins } from "../src/waveh/coins.js";
import type { Priced } from "../src/waveh/price.js";

let kit: Research;
beforeAll(async () => {
  kit = await loadResearch();
});

const DAY0 = Date.parse("2026-06-01T00:00:00Z");
/** A priced position at both books on day `d` (UTC) in coin `c`, its excess its net unless given. */
const pos = (d: number, c: number, net: number, o: Partial<Decided> = {}) => ({
  t: DAY0 + d * DAY_MS + HOUR_MS + c * MINUTE_MS,
  iid: c,
  leftOut: false,
  net,
  depthShort: false,
  bookBoth: true,
  excess: net,
  ...o,
});
/** `days` × `coins` positions, the net of each from (day, coin). */
const grid = (
  days: number,
  coins: number,
  net: (d: number, c: number) => number,
): Decided[] =>
  Array.from({ length: days * coins }, (_, k) =>
    pos(
      Math.floor(k / coins),
      k % coins,
      net(Math.floor(k / coins), k % coins),
    ),
  );
const bars = { z: 2.81, zL: 2.24, excess: "BASE" as const };

describe("one look's verdict (D36–D42)", () => {
  it("is WITHHELD above 10% of the set left out, unpriced or depth short, each counted once", () => {
    // Spread over days and coins (position k is day k ÷ 10, coin k mod 10), so every day and coin stays priced.
    const set = grid(20, 10, () => 300);
    for (let k = 0; k < 50; k += 10)
      set[k] = { ...set[k]!, leftOut: true, net: null };
    for (let k = 1; k < 51; k += 10)
      set[k] = { ...set[k]!, net: null, depthShort: k === 1 };
    for (let k = 2; k < 102; k += 10) set[k] = { ...set[k]!, depthShort: true };
    // 20 of 200: exactly 10%, not above.
    const at = verdictOf(kit, set, bars);
    expect(at).toMatchObject({
      verdict: "HOLDS",
      positions: 200,
      leftOut: 5,
      unpriced: 5,
      depthShort: 10,
      priced: 190,
      withheldShare: 0.1,
    });
    set[3] = { ...set[3]!, net: null };
    const above = verdictOf(kit, set, bars);
    expect(above).toMatchObject({
      verdict: "WITHHELD",
      unpriced: 6,
      withheldShare: 21 / 200,
      sentence:
        "Withheld: 10.5% of the deciding positions were left out, unpriced or depth short, above the 10% limit; the data could not answer.",
      line: NOT_ADVICE,
    });
    // WITHHELD comes before TOO FEW TO TELL.
    const few = grid(3, 3, () => 300);
    few[0] = { ...few[0]!, leftOut: true, net: null };
    expect(verdictOf(kit, few, bars).verdict).toBe("WITHHELD");
    // A position left out is never priced, whatever net it carries.
    const out = grid(20, 10, () => 300);
    out[0] = { ...out[0]!, leftOut: true };
    expect(verdictOf(kit, out, bars)).toMatchObject({
      leftOut: 1,
      unpriced: 0,
      priced: 199,
      withheldShare: 1 / 200,
    });
  });

  it("is TOO FEW TO TELL under 20 UTC days or 10 coins of priced positions, or with no error", () => {
    expect(
      verdictOf(
        kit,
        grid(20, 10, () => 300),
        bars,
      ).verdict,
    ).toBe("HOLDS");
    expect(
      verdictOf(
        kit,
        grid(19, 10, () => 300),
        bars,
      ),
    ).toMatchObject({
      verdict: "TOO FEW TO TELL",
      sentence:
        "Too few to tell: the priced positions span 19 UTC days and 10 coins; 20 and 10 are needed.",
    });
    expect(
      verdictOf(
        kit,
        grid(20, 9, () => 300),
        bars,
      ).verdict,
    ).toBe("TOO FEW TO TELL");
    // Days and coins of the priced positions only: a day whose one position is unpriced does not count.
    const lost = [...grid(20, 10, () => 300), pos(25, 3, 0, { net: null })];
    expect(verdictOf(kit, lost, bars).verdict).toBe("HOLDS");
    const gone = grid(20, 10, () => 300).map((p) =>
      p.t >= DAY0 + 19 * DAY_MS ? { ...p, net: null } : p,
    );
    expect(verdictOf(kit, gone, bars)).toMatchObject({
      verdict: "TOO FEW TO TELL",
      withheldShare: 0.05,
    });
    // One day: no error by day, so none at all.
    expect(
      verdictOf(
        kit,
        grid(1, 10, () => 300),
        bars,
      ),
    ).toMatchObject({
      verdict: "TOO FEW TO TELL",
      bounds: null,
      sentence: "Too few to tell: no error could be computed.",
    });
    expect(verdictOf(kit, [], bars)).toMatchObject({
      verdict: "TOO FEW TO TELL",
      withheldShare: 0,
      stat: null,
    });
    // TOO FEW TO TELL comes before DOES NOT HOLD: m + z·SE = 20 on 19 days.
    expect(
      verdictOf(
        kit,
        grid(19, 10, () => 20),
        bars,
      ).verdict,
    ).toBe("TOO FEW TO TELL");
  });

  it("is DOES NOT HOLD when m + z·SE < +50, at HOLDS's z, before HOLDS", () => {
    // Every net alike: SE 0, so m + z·SE = m.
    expect(
      verdictOf(
        kit,
        grid(20, 10, () => 50),
        bars,
      ).verdict,
    ).toBe("HOLDS");
    expect(
      verdictOf(
        kit,
        grid(20, 10, () => 49.999),
        bars,
      ).verdict,
    ).toBe("DOES NOT HOLD");
    // m − z·SE > 0 too: DOES NOT HOLD comes first.
    expect(
      verdictOf(
        kit,
        grid(20, 10, () => 20),
        bars,
      ),
    ).toMatchObject({
      verdict: "DOES NOT HOLD",
      sentence:
        "Does not hold: even m + z·SE = 20.0 bps a position is below the owner's line of +50.",
    });
    // With an error: m + z_L·SE < 50 ≤ m + z·SE is not DOES NOT HOLD (Q3).
    const set = grid(20, 10, (d, c) => 10 + (d % 2 === 0 ? 30 : -25) + c);
    const st = statOf(
      kit,
      set.map((p) => ({ t: p.t, iid: p.iid, x: p.net! })),
    )!;
    const cut = (50 - st.mean) / st.se!;
    expect(st.se).toBeGreaterThan(0);
    const v = verdictOf(kit, set, { ...bars, z: cut + 0.01, zL: cut - 0.01 });
    expect(v.verdict).toBe("NOT SETTLED");
    expect(v.bounds!.doesNotHold).toBeGreaterThan(50);
    expect(
      verdictOf(kit, set, { ...bars, z: cut - 0.01, zL: cut - 0.02 }).verdict,
    ).toBe("DOES NOT HOLD");
  });

  it("HOLDS needs m − z·SE > 0, the mean excess above 0 and the positions at the book at both ends above 0; LIKELY the same at z_L", () => {
    // m = 100 by construction; days alternate around it.
    const set = grid(20, 10, (d) => (d % 2 === 0 ? 300 : -100));
    const st = statOf(
      kit,
      set.map((p) => ({ t: p.t, iid: p.iid, x: p.net! })),
    )!;
    expect(st.mean).toBe(100);
    const r = st.mean / st.se!;
    const holds = { ...bars, z: r - 0.01, zL: r - 0.02 };
    const likely = { ...bars, z: r + 0.01, zL: r - 0.01 };
    const neither = { ...bars, z: r + 0.02, zL: r + 0.01 };
    const h = verdictOf(kit, set, holds);
    expect(h.verdict).toBe("HOLDS");
    expect(h.sentence).toBe(
      `Holds: m − z·SE = ${h.bounds!.holds.toFixed(1)} bps a position is above 0, with the excess over BASE and the positions priced at the book both above 0.`,
    );
    const l = verdictOf(kit, set, likely);
    expect(l.verdict).toBe("LIKELY");
    expect(l.sentence).toBe(
      `Likely, not proven: m − z_L·SE = ${l.bounds!.likely.toFixed(1)} bps a position is above 0 at the 95% bar, and m − z·SE = ${l.bounds!.holds.toFixed(1)} is not above 0 at the 99% bar. Very probably real, not yet proven; it decides nothing that HOLDS decides.`,
    );
    const n = verdictOf(kit, set, neither);
    expect(n).toMatchObject({ verdict: "NOT SETTLED" });
    expect(n.sentence).toBe(
      `No mean result as large as ${n.bounds!.doesNotHold.toFixed(1)} bps a position was seen.`,
    );
    // Each of the other two conditions failing alone turns HOLDS, and LIKELY, into NOT SETTLED.
    const variants: [string, Decided[]][] = [
      ["the excess at 0", set.map((p) => ({ ...p, excess: 0 }))],
      ["no excess", set.map((p) => ({ ...p, excess: null }))],
      [
        "the excess below 0",
        set.map((p, k) => ({ ...p, excess: k === 0 ? -1 : null })),
      ],
      [
        "the book's mean at 0",
        set.map((p, k) => ({ ...p, bookBoth: [0, 10, 30, 50].includes(k) })),
      ],
      ["none at the book", set.map((p) => ({ ...p, bookBoth: false }))],
      [
        "the book's mean below 0",
        set.map((p) => ({ ...p, bookBoth: p.net! < 0 })),
      ],
    ];
    for (const [name, s] of variants)
      for (const b of [holds, likely])
        expect(verdictOf(kit, s, b).verdict, name).toBe("NOT SETTLED");
    // The owner's option D: OWN reads the same excess field; only the sentence names it.
    expect(verdictOf(kit, set, { ...holds, excess: "OWN" }).sentence).toContain(
      "with the move net of the other small coins (OWN) and the positions priced at the book both above 0.",
    );
    expect(verdictOf(kit, set, { ...holds, excess: "OWN" })).toMatchObject({
      excess: { mean: 100, n: 200, without: 0 },
      atTheBook: { mean: 100, n: 200 },
    });
  });
});

describe("the looks (D43, D44: F14 as MARKET-1's M11)", () => {
  it("ends the exam at the first HOLDS or DOES NOT HOLD; any other reading lets the next look run, and the last look's stands", () => {
    const v = (...r: Verdict[]) => examVerdict(r, 2);
    expect(v("HOLDS")).toEqual({ verdict: "HOLDS", look: 1 });
    expect(v("DOES NOT HOLD")).toEqual({ verdict: "DOES NOT HOLD", look: 1 });
    for (const r of [
      "WITHHELD",
      "TOO FEW TO TELL",
      "LIKELY",
      "NOT SETTLED",
    ] as const)
      expect(v(r), r).toBeNull();
    expect(v("NOT SETTLED", "HOLDS")).toEqual({ verdict: "HOLDS", look: 2 });
    expect(v("LIKELY", "NOT SETTLED")).toEqual({
      verdict: "NOT SETTLED",
      look: 2,
    });
    expect(v("WITHHELD", "LIKELY")).toEqual({ verdict: "LIKELY", look: 2 });
    expect(v("TOO FEW TO TELL", "WITHHELD")).toEqual({
      verdict: "WITHHELD",
      look: 2,
    });
    // A later look prints beside the verdict and changes nothing.
    expect(v("HOLDS", "DOES NOT HOLD")).toEqual({ verdict: "HOLDS", look: 1 });
    expect(examVerdict(["LIKELY"], 1)).toEqual({ verdict: "LIKELY", look: 1 });
    expect(examVerdict(["WITHHELD"], 1)).toEqual({
      verdict: "WITHHELD",
      look: 1,
    });
    expect(
      (
        [
          "WITHHELD",
          "TOO FEW TO TELL",
          "DOES NOT HOLD",
          "HOLDS",
          "LIKELY",
          "NOT SETTLED",
        ] as const
      ).filter(decides),
    ).toEqual(["DOES NOT HOLD", "HOLDS"]);
  });
});

describe("the bars and options the design holds (rules.md P10, P16)", () => {
  it("takes each of the two looks' z and z_L at or above its textbook floor, from placebo.json; MARKET-1's line, minimums and limit", () => {
    expect(BARS.map((b) => [b.look, b.window])).toEqual([
      [1, PLACEBO.windows[0]],
      [2, PLACEBO.windows[1]],
    ]);
    for (const b of BARS) {
      expect(b.z).toBeGreaterThanOrEqual(TEXTBOOK.holds);
      expect(b.zL).toBeGreaterThanOrEqual(TEXTBOOK.likely);
    }
    expect(BARS[1].z).toBe(TEXTBOOK.holds);
    expect(BARS.map((b) => [b.z.toFixed(3), b.zL.toFixed(3)])).toEqual([
      ["2.847", "2.360"],
      ["2.810", "2.437"],
    ]);
    expect(PLACEBO_JSON).toMatch(/^[0-9a-f]{64}$/);
    expect(OPTIONS).toEqual({ noBookDays: "cut", excess: "BASE" });
    expect([DELTA, TOO_FEW.days, TOO_FEW.coins, WITHHELD_SHARE]).toEqual([
      DROP_BPS,
      MIN_DAYS,
      MIN_MARKETS,
      NOT_AT_BOOK_LIMIT,
    ]);
  });
});

describe("OWN at a position (D28, the owner's option D)", () => {
  it("is the gross on marks less dir × the mean move of the other small coins with both prices, at least 5", () => {
    const coins = loadCoins();
    const start = Date.parse("2026-06-01T00:00:00Z");
    const minutes = 3 * 1_440;
    const xIn = start + 10 * HOUR_MS + 2 * MINUTE_MS;
    const xOut = xIn + DAY_MS;
    const kOut = (xOut - start) / MINUTE_MS;
    // Seven small coins: the first is the position's; the others move 10, 20, … 60 bps; one of them has no price at x_out.
    const seven = coins.list.slice(0, 7);
    const pc = new Map<string, Float64Array>();
    seven.forEach((c, j) => {
      const col = new Float64Array(minutes).fill(100);
      col[kOut] = 100 * (1 + (10 * j) / 1e4);
      pc.set(c.name, col);
    });
    pc.get(seven[6]!.name)![kOut] = NaN;
    for (const c of coins.list.slice(7))
      pc.set(c.name, new Float64Array(minutes).fill(NaN));
    const d = { coins, pc, start };
    const l = { iid: seven[0]!.assetId, dir: -1, xIn, xOut };
    // The other five with both prices: 10 … 50 bps, mean 30.
    expect(ownOf(d, l, 70)).toBeCloseTo(70 - -1 * 30, 9);
    pc.get(seven[5]!.name)![kOut] = NaN;
    expect(ownOf(d, l, 70)).toBeNull();
  });
});

describe("a deciding position as step 2 reads it (D36, D28, F8)", () => {
  it("passes its price's net and depth short, both legs at the book only when both are, and HOLDS's excess by the option; a left-out one nothing", () => {
    const coins = loadCoins();
    const start = Date.parse("2026-06-01T00:00:00Z");
    const minutes = 3 * 1_440;
    const xIn = start + 10 * HOUR_MS + 2 * MINUTE_MS;
    const xOut = xIn + DAY_MS;
    const kOut = (xOut - start) / MINUTE_MS;
    // The other small coins move 10, 20, … bps: OWN is the gross on marks less dir × their mean.
    const pc = new Map<string, Float64Array>();
    coins.list.forEach((c, j) => {
      const col = new Float64Array(minutes).fill(100);
      col[kOut] = 100 * (1 + (10 * j) / 1e4);
      pc.set(c.name, col);
    });
    const d = { coins, pc, start };
    const p = {
      t: xIn - 2 * MINUTE_MS,
      iid: coins.list[0]!.assetId,
      dir: 1,
      xIn,
      xOut,
      left: null,
    };
    const leg = (source: "book" | "tape") => ({
      source,
      why: source === "tape" ? ("stale" as const) : null,
      price: 100,
      deepest: 1,
      short: false,
      at: [xIn],
    });
    const priced = (o: Partial<Priced> = {}): Priced => ({
      net: 12,
      unpriced: null,
      gross: 20,
      fees: 9,
      funding: 1,
      fundingMissing: 0,
      grossOnMarks: 30,
      excess: 25,
      entryCost: 1,
      legs: [leg("book"), leg("book")],
      depthShort: true,
      ...o,
    });
    expect(decidedOf(d, p, priced(), "BASE")).toEqual({
      t: p.t,
      iid: p.iid,
      leftOut: false,
      net: 12,
      depthShort: true,
      bookBoth: true,
      excess: 25,
    });
    for (const legs of [
      [leg("book"), leg("tape")],
      [leg("tape"), leg("book")],
      [leg("tape"), leg("tape")],
      [leg("book"), null],
    ] as const)
      expect(
        decidedOf(d, p, priced({ legs: [...legs] }), "BASE").bookBoth,
      ).toBe(false);
    expect(bothAtTheBook(priced())).toBe(true);
    const own = decidedOf(d, p, priced(), "OWN").excess;
    expect(own).toBe(ownOf(d, p, 30));
    expect(own).not.toBeNull();
    expect(own).not.toBe(25);
    expect(decidedOf(d, p, priced({ grossOnMarks: null }), "OWN").excess).toBe(
      null,
    );
    expect(
      decidedOf(d, { ...p, left: "a hole in the hour up to t" }, null, "BASE"),
    ).toEqual({
      t: p.t,
      iid: p.iid,
      leftOut: true,
      net: null,
      depthShort: false,
      bookBoth: false,
      excess: null,
    });
  });
});
