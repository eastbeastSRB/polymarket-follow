/**
 * Each line's figures: the daily page's (R15) and a look's (R12, R14, with
 * the review's F16 and F18). Money is a copy's net in bps, each copy alike;
 * d is the line's own d at 24 h, voted copies only.
 */
import { DAY_MS } from "../schedule.js";
import { CUT, LOOK_ENDS } from "./instants.js";
import type { Research } from "./research.js";
import type { CopyRecord, LineName, Scored } from "./score.js";
import {
  LOOK_Z,
  dailyEValue,
  dayOf,
  smallestEdge,
  twoWay,
  verdict,
  type Item,
  type Verdict,
} from "./stats.js";

export const inLine = (scored: Scored, line: LineName): CopyRecord[] =>
  scored.copies.filter((c) => c.lines.includes(line));

const money = (
  cs: readonly CopyRecord[],
  value = (c: CopyRecord) => c.money?.net ?? null,
): Item[] =>
  cs.flatMap((c) => {
    const x = value(c);
    return x === null ? [] : [{ addr: c.addr, tIn: c.tIn, x }];
  });

const dItems = (cs: readonly CopyRecord[], line: LineName): Item[] =>
  cs.flatMap((c) => {
    const x = c.voted ? c.d[line] : null;
    return x === null || x === undefined
      ? []
      : [{ addr: c.addr, tIn: c.tIn, x }];
  });

const isOpen = (c: CopyRecord) => c.plan.flag !== null;

/** The page's figures of one line. */
export function pageLine(
  kit: Research,
  cs: readonly CopyRecord[],
  line: LineName,
) {
  const m = twoWay(kit, money(cs));
  const dd = dItems(cs, line);
  const d = twoWay(kit, dd);
  return {
    positions: cs.length,
    traders: new Set(cs.map((c) => c.addr)).size,
    days: new Set(cs.map((c) => dayOf(c.tIn))).size,
    open: cs.filter(isOpen).length,
    money: m === null ? null : { mean: m.mean, se: m.se },
    d: d === null ? null : { mean: d.mean, se: d.se, n: d.n },
    e:
      dd.length === 0
        ? null
        : (({ e, votes }) => ({ e, votes }))(
            dailyEValue(dd.map((i) => ({ tIn: i.tIn, d: i.x }))),
          ),
  };
}

function countBy<T>(
  xs: readonly T[],
  key: (x: T) => string,
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const x of xs) out[key(x)] = (out[key(x)] ?? 0) + 1;
  return out;
}

const mean = (xs: readonly number[]) =>
  xs.length ? xs.reduce((s, x) => s + x, 0) / xs.length : null;

/** The paper equity's largest fall at $1,000 a copy, copies taken in the order of their paper entry. */
function drawdownUsd(items: readonly Item[]): number {
  let equity = 0;
  let peak = 0;
  let worst = 0;
  for (const i of [...items].sort((a, b) => a.tIn - b.tIn)) {
    equity += i.x / 10;
    peak = Math.max(peak, equity);
    worst = Math.max(worst, peak - equity);
  }
  return worst;
}

/** The mean without the account (or day) whose removal moves it most. */
function withoutMost(items: readonly Item[], keyOf: (i: Item) => string) {
  const S = items.reduce((s, i) => s + i.x, 0);
  const N = items.length;
  const by = new Map<string, { s: number; n: number }>();
  for (const i of items) {
    const g = by.get(keyOf(i)) ?? { s: 0, n: 0 };
    g.s += i.x;
    g.n += 1;
    by.set(keyOf(i), g);
  }
  let best: { key: string; without: number } | null = null;
  for (const [key, g] of [...by].sort((a, b) => (a[0] < b[0] ? -1 : 1))) {
    if (N - g.n === 0) continue;
    const without = (S - g.s) / (N - g.n);
    if (
      best === null ||
      Math.abs(without - S / N) > Math.abs(best.without - S / N)
    )
      best = { key, without };
  }
  return best;
}

/**
 * A look k at END_k (R12, R14): the line's copies voted by END_k, both
 * readings on that one set, its verdict (MAIN's decides; the others print
 * the same figures, deciding nothing), and every print.
 */
export function lookReport(
  kit: Research,
  scored: Scored,
  line: LineName,
  k: 1 | 2 | 3,
) {
  const ends: readonly number[] = LOOK_ENDS;
  const zs: readonly number[] = LOOK_Z;
  const end = ends[k - 1]!;
  const z = zs[k - 1]!;
  const set = inLine(scored, line).filter((c) => c.voted);
  const priced = set.filter((c) => c.money !== null);
  const x = money(priced);
  const m = twoWay(kit, x);
  const dd = dItems(set, line);
  const d = twoWay(kit, dd);
  const gross = twoWay(
    kit,
    money(priced, (c) => c.money!.gross),
  );
  const unpricedShare = set.length
    ? (set.length - priced.length) / set.length
    : 0;
  const v: Verdict | null =
    m === null
      ? null
      : verdict({
          mean: m.mean,
          se: m.se,
          z,
          meanD: d?.mean ?? null,
          unpricedShare,
        });
  const nets = x.map((i) => i.x);
  const wl = kit.exits.winLoss(nets);
  const holds = priced.map((c) => c.money!.holdMs);
  const daysOfData = (end - CUT) / DAY_MS;
  const next = k < 3 ? { z: zs[k]!, days: (ends[k]! - CUT) / DAY_MS } : null;
  const byDay = new Map<number, number[]>();
  for (const i of x)
    byDay.set(dayOf(i.tIn), [...(byDay.get(dayOf(i.tIn)) ?? []), i.x]);
  const byTrader = new Map<string, number[]>();
  for (const i of x)
    byTrader.set(i.addr, [...(byTrader.get(i.addr) ?? []), i.x]);
  const sum = (xs: number[]) => xs.reduce((s, y) => s + y, 0);
  const worstDay = [...byDay].sort((a, b) => sum(a[1]) - sum(b[1]))[0];
  const worstTrader = [...byTrader].sort((a, b) => sum(a[1]) - sum(b[1]))[0];
  const withoutAccount = withoutMost(x, (i) => i.addr);
  const withoutBoth =
    withoutAccount === null
      ? null
      : withoutMost(
          x.filter((i) => i.addr !== withoutAccount.key),
          (i) => new Date(dayOf(i.tIn)).toISOString().slice(0, 10),
        );
  const closedOnly = twoWay(kit, money(priced.filter((c) => !isOpen(c))));
  // R14: Student's t at the look's two-sided level, on the day clusters (df = days - 1).
  const tBand =
    m === null || m.seDay === null
      ? null
      : kit.stats.tCritical(2 * normalUpper(z), Math.max(1, m.days - 1)) *
        m.seDay;
  return {
    look: k,
    end: new Date(end).toISOString(),
    line,
    z,
    copies: set.length,
    traders: new Set(set.map((c) => c.addr)).size,
    days: new Set(set.map((c) => dayOf(c.tIn))).size,
    unpriced: countBy(
      set.filter((c) => c.money === null),
      (c) => c.unpriced ?? "unpriced",
    ),
    unpricedShare,
    open: set.filter((c) => c.plan.flag === "open").length,
    crossing: set.filter((c) => c.plan.flag === "crossing").length,
    gap: set.filter((c) => c.gap).length,
    money: m,
    oneWayLower:
      m === null
        ? null
        : {
            byTrader: m.seTrader === null ? null : m.mean - z * m.seTrader,
            byDay: m.seDay === null ? null : m.mean - z * m.seDay,
          },
    tBandHalfWidth: tBand,
    d,
    dReasons: countBy(
      set.filter((c) => c.d[line] === null || c.d[line] === undefined),
      (c) => c.dReason[line] ?? "none",
    ),
    gross:
      gross === null
        ? null
        : {
            mean: gross.mean,
            se: gross.se,
            breakEvenRoundTrip:
              gross.se === null ? null : gross.mean - z * gross.se,
          },
    fees: mean(priced.map((c) => c.money!.fees)),
    funding: mean(priced.map((c) => c.money!.funding)),
    winLoss: { ...wl, label: "exits can flatter these; only money measures" },
    holdMs: {
      median: kit.exits.quantile(holds, 0.5),
      q1: kit.exits.quantile(holds, 0.25),
      q3: kit.exits.quantile(holds, 0.75),
    },
    worstDay:
      worstDay === undefined
        ? null
        : {
            day: new Date(worstDay[0]).toISOString().slice(0, 10),
            bps: sum(worstDay[1]),
            copies: worstDay[1].length,
          },
    worstTrader:
      worstTrader === undefined
        ? null
        : {
            addr: worstTrader[0],
            bps: sum(worstTrader[1]),
            copies: worstTrader[1].length,
          },
    drawdownUsd: drawdownUsd(x),
    withoutMostInfluentialAccount: withoutAccount,
    withoutItAndTheMostInfluentialDay: withoutBoth,
    closedOnly:
      closedOnly === null
        ? null
        : { mean: closedOnly.mean, se: closedOnly.se, n: closedOnly.n },
    longShare: set.length
      ? set.filter((c) => c.dir > 0).length / set.length
      : null,
    eValue: dd.length
      ? dailyEValue(dd.map((i) => ({ tIn: i.tIn, d: i.x })))
      : null,
    copiesAWeek: set.length / (daysOfData / 7),
    smallestEdgeAtNextLook:
      next === null || m === null
        ? null
        : smallestEdge(m.se, next.z, daysOfData, next.days),
    // R12: only MAIN's line carries a verdict; the others print the same figures, deciding nothing.
    verdict: line === "MAIN" ? v : null,
    sentence:
      line !== "MAIN"
        ? null
        : v === "TOO FEW TO TELL" && k === 3 && m?.se != null
          ? `no mean result as large as ${(m.mean + z * m.se).toFixed(1)} bps a position was seen`
          : "Keep and drop are verdicts on this test, never instructions to trade.",
  };
}

/** MAIN's statistic for a set (R12): the copies priced, the mean net per copy and its two-way SE. */
function statOf(
  kit: Research,
  cs: readonly CopyRecord[],
  value?: (c: CopyRecord) => number | null,
) {
  const m = twoWay(kit, money(cs, value));
  return m === null
    ? { n: 0, mean: null, se: null }
    : { n: m.n, mean: m.mean, se: m.se };
}

/**
 * The lines beside MAIN at a look (R6, R7, R11, R13, R14), deciding nothing
 * and with no verdict word: on MAIN's voted copies (COMP on BROAD's too),
 * each with MAIN's statistic.
 */
export function besideLines(kit: Research, scored: Scored) {
  const voted = (line: LineName) => inLine(scored, line).filter((c) => c.voted);
  const main = voted("MAIN");
  const comp = (cs: readonly CopyRecord[]) => ({
    withoutCompetitionDays: statOf(
      kit,
      cs.filter((c) => !c.competition.days),
    ),
    withoutBoostedMarkets: statOf(
      kit,
      cs.filter((c) => !c.competition.boosted),
    ),
  });
  return {
    STOP2: statOf(kit, main, (c) => c.stop2),
    STOP5: statOf(kit, main, (c) => c.stop5),
    DAYS7: statOf(kit, main, (c) => c.days7),
    JUMP: {
      above3: statOf(
        kit,
        main.filter((c) => c.jump !== null && c.jump > 3),
      ),
      upTo3: statOf(
        kit,
        main.filter((c) => c.jump !== null && c.jump <= 3),
      ),
      withoutJ: main.filter((c) => c.jump === null).length,
    },
    NOTIONAL: {
      board: statOf(
        kit,
        main.filter((c) => c.notional),
      ),
      rest: statOf(
        kit,
        main.filter((c) => !c.notional),
      ),
    },
    COMP: { MAIN: comp(main), BROAD: comp(voted("BROAD")) },
    mapWouldClose: statOf(
      kit,
      main.filter((c) => c.mapOpen === false),
    ),
    withoutGapCopies: statOf(
      kit,
      main.filter((c) => !c.gap),
    ),
  };
}

/** P(Z > z) of the standard normal (Abramowitz–Stegun 26.2.17; error below 7.5e-8). */
function normalUpper(z: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly =
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const p = (Math.exp((-z * z) / 2) / Math.sqrt(2 * Math.PI)) * poly;
  return z >= 0 ? p : 1 - p;
}
