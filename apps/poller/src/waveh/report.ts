/**
 * WAVE-H's lines beside and its prints at the look (rules.md H13, H14),
 * pure functions of the counted fills, the market objects and the priced
 * positions. A line on marks reads the gross on marks and the excess with
 * MARKET-1's error (`statOf`: two-way, by day alone for one coin); a line on
 * the net prints MARKET-1's M13 (`summarize`, `tailOf`) through `asPosition`.
 * None of them decides anything.
 */
import { baseOf, blockOf, type Position } from "../market1/lines.js";
import { grossOnMarks } from "../market1/price.js";
import { byDay, type Item } from "../market1/stats.js";
import { statOf, summarize, tailOf } from "../market1/summary.js";
import type { Market, Research } from "../paper/research.js";
import { dayOf } from "../paper/stats.js";
import { DAY_MS, HOUR_MS } from "../schedule.js";
import type { Coins } from "./coins.js";
import type { Counted } from "./fills.js";
import { DATA_END, SIZING_START, TEST_END, TEST_START } from "./instants.js";
import { episodeSpots, waveSpots, type Spot } from "./positions.js";
import { burstiness, coinName, tally, type Outcome } from "./rehearse.js";
import { bySlice, scanM } from "./slices.js";
import { Z } from "./verdict.js";

const iso = (t: number) => new Date(t).toISOString().slice(0, 10);
const monthOf = (t: number) => new Date(t).toISOString().slice(0, 7);

/** How a line on marks reads a position: the kit, the coin's market object, its BASE cell at x_in (H10). */
export type MarkAt = {
  kit: Research;
  market: (iid: number) => Market | undefined;
  base: (iid: number, xIn: number) => number | null;
};

/** H10's BASE of each coin over TEST, by the 4-hour UTC block of x_in; a cell without a minute has none. */
export function markAt(
  kit: Research,
  markets: ReadonlyMap<number, Market>,
): MarkAt {
  const cells = new Map(
    [...markets].map(([iid, mk]) => [iid, baseOf(mk, TEST_START, TEST_END)]),
  );
  return {
    kit,
    market: (iid) => markets.get(iid),
    base: (iid, xIn) => {
      const b = cells.get(iid)?.[blockOf(xIn)];
      return b === undefined || Number.isNaN(b) ? null : b;
    },
  };
}

/** A line on marks (H13): positions, days, coins, slices; the gross on marks and the excess, with the positions lacking either. */
export function marksLine(m: MarkAt, spots: readonly Spot[]) {
  const onMarks: Item[] = [];
  const excess: Item[] = [];
  for (const s of spots) {
    const mk = m.market(s.iid);
    const g =
      mk === undefined ? null : grossOnMarks(m.kit, mk, s.dir, s.xIn, s.xOut);
    if (g === null) continue;
    onMarks.push({ t: s.t, iid: s.iid, x: g });
    const b = m.base(s.iid, s.xIn);
    if (b !== null) excess.push({ t: s.t, iid: s.iid, x: g - s.dir * b });
  }
  const ex = statOf(m.kit, excess);
  return {
    positions: spots.length,
    days: new Set(spots.map((s) => dayOf(s.t))).size,
    coins: new Set(spots.map((s) => s.iid)).size,
    slices: new Set(spots.map((s) => s.slice)).size,
    onMarks: statOf(m.kit, onMarks),
    withoutMarks: spots.length - onMarks.length,
    excess: ex,
    excessLow: ex?.se == null ? null : ex.mean - Z * ex.se,
    withoutBase: onMarks.length - excess.length,
  };
}

/** A WAVE-H outcome in MARKET-1's position shape, so its M13 prints read it: a tape leg is priced (H12), never a mark leg. */
export function asPosition(o: Outcome): Position {
  const s = o.spot;
  const p = o.priced;
  return {
    line: "WAVE",
    iid: s.iid,
    t: s.t,
    side: s.side,
    dir: s.dir,
    xIn: s.xIn,
    xOut: s.xOut,
    fillIid: s.iid,
    accounts: s.accounts,
    coins: 0,
    priced:
      p === null
        ? null
        : {
            net: p.net,
            unpriced: p.unpriced,
            gross: p.gross,
            fees: p.fees,
            funding: p.funding,
            fundingMissing: p.fundingMissing,
            grossOnMarks: p.grossOnMarks,
            excess: p.excess,
            entryCost: p.entryCost,
            pIn: p.legs[0]?.price ?? null,
            pOut: p.legs[1]?.price ?? null,
            markLegs: [null, null],
            depthShort: p.depthShort,
            deepest: [p.legs[0]?.deepest ?? null, p.legs[1]?.deepest ?? null],
          },
  };
}

/** A set on the net (H14): MARKET-1's M13 prints, with WAVE-H's slices, tape-priced legs by reason and depth-short legs. */
export function netLine(kit: Research, os: readonly Outcome[]) {
  const legs = os.flatMap((o) => o.legs);
  return {
    ...summarize(kit, os.map(asPosition), Z),
    slices: new Set(os.map((o) => o.spot.slice)).size,
    tapeLegs: tally(
      legs.filter((l) => l.source === "tape"),
      (l) => l.why,
    ),
    shortLegs: os.reduce(
      (n, o) => n + (o.priced?.legs.filter((l) => l?.short).length ?? 0),
      0,
    ),
  };
}

/** THE DAY WITH THE MOST POSITIONS (H13), on the net: the day, its count and share; m and SE without it; each day alike; the five busiest days' share. */
export function dayMost(kit: Research, os: readonly Outcome[]) {
  const count = new Map<number, number>();
  for (const o of os)
    count.set(dayOf(o.spot.t), (count.get(dayOf(o.spot.t)) ?? 0) + 1);
  const days = [...count].sort((a, b) => b[1] - a[1] || a[0] - b[0]);
  if (days.length === 0) return null;
  const [day, n] = days[0]!;
  const priced = os.filter((o) => o.priced?.net != null);
  const without = statOf(
    kit,
    priced
      .filter((o) => dayOf(o.spot.t) !== day)
      .map((o) => ({ t: o.spot.t, iid: o.spot.iid, x: o.priced!.net! })),
  );
  const sums = new Map<number, { sum: number; n: number }>();
  for (const o of priced) {
    const g = sums.get(dayOf(o.spot.t)) ?? { sum: 0, n: 0 };
    g.sum += o.priced!.net!;
    g.n += 1;
    sums.set(dayOf(o.spot.t), g);
  }
  const alike = byDay(
    kit,
    [...sums].map(([d, g]) => ({ t: d, iid: 0, x: g.sum / g.n })),
  );
  return {
    day: iso(day),
    positions: n,
    share: n / os.length,
    without: { mean: without?.mean ?? null, se: without?.se ?? null },
    daysAlike: {
      mean: alike?.mean ?? null,
      se: alike?.se ?? null,
      days: alike?.days ?? 0,
    },
    fiveBusiestShare:
      days.slice(0, 5).reduce((s, d) => s + d[1], 0) / os.length,
  };
}

/** M BY MONTH's M (H13): H5's scan on the counted fills of the 68 days before `start`, from SIZING's start at the earliest, over that window's days. */
export function monthM(counted: readonly Counted[], start: number): number {
  const from = Math.max(start - 68 * DAY_MS, SIZING_START);
  return scanM(
    counted.filter((f) => f.t >= from && f.t < start),
    (start - from) / DAY_MS,
  ).M;
}

/** The calendar months of TEST: each month's span inside TEST. */
export function testMonths(): { month: string; from: number; to: number }[] {
  const out = [];
  for (let from = TEST_START; from < TEST_END;) {
    const d = new Date(from);
    const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1);
    out.push({ month: monthOf(from), from, to: Math.min(next, TEST_END) });
    from = next;
  }
  return out;
}

/**
 * H13's lines beside: every one on marks but THE BOOK AND THE TAPE and THE
 * TAIL (the net of WAVE-H's priced positions). `counted` is every counted
 * fill in H4's order; `wave` WAVE-H's priced positions; `sizingCoins` the
 * coins with a record in SIZING.
 */
export function linesBeside(a: {
  m: MarkAt;
  coins: Coins;
  counted: readonly Counted[];
  M: number;
  wave: readonly Outcome[];
  sizingCoins: ReadonlySet<string>;
}) {
  const { m, counted, M, wave } = a;
  const spots = wave.map((o) => o.spot);
  const slices = bySlice(counted, M);
  const inTest = (k: number, fills: readonly Counted[], delay?: number) =>
    waveSpots(k, fills, TEST_START, TEST_END, delay).filter(
      (s) => s.xOut < DATA_END,
    );
  const every = slices.map((fills, k) => inTest(k, fills));
  const perSlice = every.map((ss, k) => ({
    slice: k,
    positions: ss.length,
    mean: marksLine(m, ss).onMarks?.mean ?? null,
  }));
  const withMean = perSlice.filter((s) => s.mean !== null);
  const episodes = slices.flatMap((fills, k) =>
    episodeSpots(k, fills, TEST_START, TEST_END),
  );
  const atM = (k: number) => ({
    M: k,
    ...marksLine(m, inTest(0, bySlice(counted, k)[0]!)),
  });
  // TEST starts on a month's first day, so each span starts its month.
  const months = testMonths().map((mo) => ({
    ...mo,
    M: monthM(counted, mo.from),
  }));
  const byMonth = months.map((mo) =>
    waveSpots(0, bySlice(counted, mo.M)[0]!, mo.from, mo.to).filter(
      (s) => s.xOut < DATA_END,
    ),
  );
  const late = a.coins.list
    .map((c) => c.name)
    .filter((name) => !a.sizingCoins.has(name));
  const isBook = (o: Outcome) => o.legs.every((l) => l.source === "book");
  return {
    ALONE: {
      B1: marksLine(m, episodes),
      B2: marksLine(
        m,
        episodes.filter((e) => e.alone),
      ),
    },
    LATE: {
      "1 h": marksLine(
        m,
        waveSpots(0, slices[0]!, TEST_START, TEST_END, HOUR_MS),
      ),
      "3 h": marksLine(
        m,
        waveSpots(0, slices[0]!, TEST_START, TEST_END, 3 * HOUR_MS),
      ),
    },
    SIDES: {
      "forced sells": marksLine(
        m,
        spots.filter((s) => s.side === -1),
      ),
      "forced buys": marksLine(
        m,
        spots.filter((s) => s.side === 1),
      ),
    },
    "EVERY SLICE": {
      slices: perSlice,
      aboveZero:
        withMean.length === 0
          ? null
          : withMean.filter((s) => s.mean! > 0).length / withMean.length,
      pooled: marksLine(m, every.flat()),
    },
    "M HALVED": atM(Math.ceil(M / 2)),
    "M DOUBLED": atM(2 * M),
    "M BY MONTH": {
      months: months.map((mo, i) => ({
        month: mo.month,
        M: mo.M,
        positions: byMonth[i]!.length,
      })),
      line: marksLine(m, byMonth.flat()),
    },
    METHOD: {
      backstop: marksLine(
        m,
        spots.filter((s) => s.method === "backstop"),
      ),
      countedByMonth: tally(
        counted.filter((f) => f.t >= TEST_START && f.t < TEST_END),
        (f) => `${monthOf(f.t)}|${f.method}`,
      ),
    },
    "THE LATE COINS": {
      coins: late,
      line: marksLine(
        m,
        spots.filter((s) => late.includes(coinName(a.coins, s.iid))),
      ),
    },
    "BY MONTH": months.map((mo) => ({
      month: mo.month,
      line: marksLine(
        m,
        spots.filter((s) => s.t >= mo.from && s.t < mo.to),
      ),
      ...burstiness(counted, M, mo.from, mo.to),
    })),
    "THE BOOK AND THE TAPE": {
      book: netLine(m.kit, wave.filter(isBook)),
      tape: netLine(
        m.kit,
        wave.filter((o) => o.legs.some((l) => l.source === "tape")),
      ),
    },
    "THE TAIL": tailOf(wave.map(asPosition)),
  };
}
