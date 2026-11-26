/**
 * The prints (copyh/rules.md C13: every line, MAIN's decide), report.json's
 * figures from the look's positions, written after result.json and deciding
 * nothing; only MAIN carries a verdict (result.json's), so no figure here
 * holds a verdict word.
 * - R14's list on MAIN's set (C12: MAIN's copies voted by END), as the
 *   paper's look prints it: copies, traders, days; unpriced by reason and
 *   their share; open, crossing and gap copies; m with its two-way SE and
 *   both one-way lower bounds, Student's t band on the day clusters; d's
 *   mean and its null reasons; the gross and `breakEvenRoundTrip`; fees and
 *   funding; the win share, labelled; the hold's quartiles; the worst day and
 *   trader; the paper equity's largest fall; the mean without the most
 *   influential account, then also its day; the closed copies only (never a
 *   settled one: its flag is set); the long share; the pooled daily e-value;
 *   copies a week; at look 1 the smallest edge visible at look 2 (RL9).
 * - Every line's C12 figures (`statisticOf`): TEN, BROAD, DAY on their own
 *   copies and x′; MAIN's own lines on MAIN's set — STOP2, STOP5, DAYS7 with
 *   their own net and MAIN's x′; JUMP above 3 and at most 3, and the copies
 *   with no J; DELAY0, DELAY+5, DELAY+15, LAST with their own money and x′;
 *   RANK; SLICES, SIDES and MONTHS by part.
 * - The venues (Hyperliquid's base tier is the taker setting; Binance's
 *   regular taker); H1's prints (the null's mean gross, d, x′ by day and by
 *   week, the money's error with the UTC week and month as its time
 *   cluster); concentration; the settled copies; the thin tape; the cascade
 *   print.
 * The step's counts (the tripwire's, the accounts left out, the stores')
 * are set beside these by the step.
 */
import type { Research } from "../paper/research.js";
import { dailyEValue, twoWay, type Item } from "../paper/stats.js";
import { DAY_MS } from "../schedule.js";
import { CONCENTRATION, JUMP, SMALLEST_EDGE } from "./design.js";
import { dayOf, weekOf } from "./instants.js";
import { LINES, MOVED, sliceOf } from "./lines.js";
import type { Position } from "./phase-prices.js";
import { statisticOf, type JudgedCopy, type Statistic } from "./verdict.js";

/** What the prints read of a voted copy: its position less its exits, legs and covariates. */
export type PrintCopy = Pick<
  Position,
  | "addr"
  | "iid"
  | "dir"
  | "t"
  | "lines"
  | "gap"
  | "thin"
  | "money"
  | "judged"
  | "main"
> & {
  readonly tIn: number;
  readonly flag: Position["plan"]["flag"];
  readonly settled: boolean;
  readonly rank: boolean;
};

export const printCopyOf = (p: Position, rank: boolean): PrintCopy => ({
  addr: p.addr,
  iid: p.iid,
  dir: p.dir,
  t: p.t,
  tIn: p.t + p.D,
  lines: p.lines,
  gap: p.gap,
  thin: p.thin,
  money: p.money,
  judged: p.judged,
  main: p.main,
  flag: p.plan.flag,
  settled: p.plan.settled,
  rank,
});

const mean = (xs: readonly number[]): number | null =>
  xs.length === 0 ? null : xs.reduce((s, x) => s + x, 0) / xs.length;
const sum = (xs: readonly number[]) => xs.reduce((s, x) => s + x, 0);
const isoDay = (t: number) => new Date(dayOf(t)).toISOString().slice(0, 10);

function countBy<T>(xs: readonly T[], key: (x: T) => string) {
  const out: Record<string, number> = {};
  for (const x of xs) out[key(x)] = (out[key(x)] ?? 0) + 1;
  return out;
}

/** P(Z > z) of the standard normal (Abramowitz–Stegun 26.2.17; the paper's look's). */
export function normalUpper(z: number): number {
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

/** The paper equity's largest fall at $1,000 a copy, the copies in the order of their follow instants (a tie in the set's order). */
export function drawdownUsd(items: readonly Item[]): number {
  let equity = 0;
  let peak = 0;
  let worst = 0;
  for (const i of [...items].sort((a, b) => a.tIn - b.tIn)) {
    equity += i.x / 10;
    if (equity > peak) peak = equity;
    if (peak - equity > worst) worst = peak - equity;
  }
  return worst;
}

/** The mean without the group (an account, a day) whose removal moves it most; the first by key on a tie. */
export function withoutMost(
  items: readonly Item[],
  keyOf: (i: Item) => string,
): { key: string; without: number } | null {
  const S = sum(items.map((i) => i.x));
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
    if (N === g.n) continue;
    const without = (S - g.s) / (N - g.n);
    if (
      best === null ||
      Math.abs(without - S / N) > Math.abs(best.without - S / N)
    )
      best = { key, without };
  }
  return best;
}

/** A line's copies as the statistic reads them: x a money's net, x′ a judgement's edge. */
const judgedAs = (
  cs: readonly PrintCopy[],
  money: (c: PrintCopy) => Position["money"],
  edge: (c: PrintCopy) => number | null,
): JudgedCopy[] =>
  cs.map((c) => {
    const m = money(c);
    return {
      addr: c.addr,
      tIn: c.tIn,
      x: m.reason === undefined ? m.net : null,
      edge: edge(c),
      thin: c.thin,
    };
  });

const mainEdge = (c: PrintCopy) => c.judged.MAIN?.edge ?? null;
const own = (c: PrintCopy) => c.money;
/** A MAIN copy's own lines' readings (C7). */
const mainOf = (c: PrintCopy) => {
  if (c.main === null)
    throw new Error(`${c.addr}: a MAIN copy without its lines`);
  return c.main;
};

/** Items of priced copies, a value of each. */
const itemsOf = (
  cs: readonly PrintCopy[],
  x: (c: PrintCopy) => number | null,
): Item[] =>
  cs.flatMap((c) => {
    const v = x(c);
    return v === null ? [] : [{ addr: c.addr, tIn: c.tIn, x: v }];
  });

const netOf = (c: PrintCopy) =>
  c.money.reason === undefined ? c.money.net : null;

/** R14's list on MAIN's set (C13's first print), at the look's z; the smallest edge at look 1 only. */
export function r14Of(
  kit: Research,
  set: readonly PrintCopy[],
  o: { z: number; look: 1 | 2; start: number; end: number; endS: number },
) {
  const priced = set.filter((c) => c.money.reason === undefined);
  const x = itemsOf(priced, netOf);
  const m = twoWay(kit, x);
  const dd = itemsOf(set, (c) => c.judged.MAIN?.d ?? null);
  const d = twoWay(kit, dd);
  const gross = twoWay(
    kit,
    itemsOf(priced, (c) =>
      c.money.reason === undefined ? c.money.gross : null,
    ),
  );
  const money = (f: "fees" | "funding" | "holdMs") =>
    priced.map((c) => (c.money.reason === undefined ? c.money[f] : 0));
  const byDay = new Map<string, number[]>();
  const byTrader = new Map<string, number[]>();
  for (const i of x) {
    const day = isoDay(i.tIn);
    const a = byDay.get(day);
    if (a === undefined) byDay.set(day, [i.x]);
    else a.push(i.x);
    const b = byTrader.get(i.addr);
    if (b === undefined) byTrader.set(i.addr, [i.x]);
    else b.push(i.x);
  }
  const worst = (by: Map<string, number[]>) => {
    let w: [string, number[]] | null = null;
    for (const e of by) if (w === null || sum(e[1]) < sum(w[1])) w = e;
    return w === null
      ? null
      : { key: w[0], bps: sum(w[1]), copies: w[1].length };
  };
  const withoutAccount = withoutMost(x, (i) => i.addr);
  const holds = money("holdMs");
  const z = o.z;
  const weeks = (o.end - o.start) / (7 * DAY_MS);
  const stat = statisticOf(kit, judgedAs(set, own, mainEdge));
  const smallest = (se: number | null | undefined) =>
    se === null || se === undefined
      ? null
      : (SMALLEST_EDGE[0] + SMALLEST_EDGE[1]) *
        se *
        Math.sqrt((o.end - o.start) / (o.endS - o.start));
  return {
    copies: set.length,
    traders: new Set(set.map((c) => c.addr)).size,
    days: new Set(set.map((c) => dayOf(c.tIn))).size,
    unpriced: countBy(
      set.filter((c) => c.money.reason !== undefined),
      (c) => c.money.reason ?? "",
    ),
    unpricedShare:
      set.length === 0 ? 0 : (set.length - priced.length) / set.length,
    open: set.filter((c) => c.flag === "open").length,
    crossing: set.filter((c) => c.flag === "crossing").length,
    gap: set.filter((c) => c.gap).length,
    money: m,
    oneWayLower:
      m === null
        ? null
        : {
            byTrader: m.seTrader === null ? null : m.mean - z * m.seTrader,
            byDay: m.seDay === null ? null : m.mean - z * m.seDay,
          },
    tBandHalfWidth:
      m === null || m.seDay === null
        ? null
        : kit.stats.tCritical(2 * normalUpper(z), Math.max(1, m.days - 1)) *
          m.seDay,
    d,
    dReasons: countBy(
      set.filter((c) => c.judged.MAIN?.d == null),
      (c) => c.judged.MAIN?.reason ?? "none",
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
    fees: mean(money("fees")),
    funding: mean(money("funding")),
    winLoss: {
      ...kit.exits.winLoss(x.map((i) => i.x)),
      label: "exits can flatter these; only money measures",
    },
    holdMs: {
      median: kit.exits.quantile(holds, 0.5),
      q1: kit.exits.quantile(holds, 0.25),
      q3: kit.exits.quantile(holds, 0.75),
    },
    worstDay: worst(byDay),
    worstTrader: worst(byTrader),
    drawdownUsd: drawdownUsd(x),
    withoutMostInfluentialAccount: withoutAccount,
    withoutItAndTheMostInfluentialDay:
      withoutAccount === null
        ? null
        : withoutMost(
            x.filter((i) => i.addr !== withoutAccount.key),
            (i) => isoDay(i.tIn),
          ),
    closedOnly: twoWay(
      kit,
      itemsOf(
        priced.filter((c) => c.flag === null),
        netOf,
      ),
    ),
    longShare:
      set.length === 0
        ? null
        : set.filter((c) => c.dir > 0).length / set.length,
    eValue:
      dd.length === 0
        ? null
        : dailyEValue(dd.map((i) => ({ tIn: i.tIn, d: i.x }))),
    copiesAWeek: weeks > 0 ? set.length / weeks : null,
    smallestEdgeAtLook2:
      o.look === 1
        ? { money: smallest(m?.se), edge: smallest(stat.edge.se) }
        : null,
  };
}

/** Every line's C12 figures beside MAIN (C7, C13), deciding nothing. */
export function linesOf(
  kit: Research,
  voted: readonly PrintCopy[],
): Record<string, Statistic> {
  const main = voted.filter((c) => c.lines.includes("MAIN"));
  const out: Record<string, Statistic> = {};
  for (const line of LINES)
    out[line] = statisticOf(
      kit,
      judgedAs(
        voted.filter((c) => c.lines.includes(line)),
        own,
        (c) => c.judged[line]?.edge ?? null,
      ),
    );
  out.STOP2 = statisticOf(
    kit,
    judgedAs(main, (c) => mainOf(c).stop.STOP2, mainEdge),
  );
  out.STOP5 = statisticOf(
    kit,
    judgedAs(main, (c) => mainOf(c).stop.STOP5, mainEdge),
  );
  out.DAYS7 = statisticOf(
    kit,
    judgedAs(main, (c) => mainOf(c).days7, mainEdge),
  );
  const jump = (keep: (j: number) => boolean) =>
    main.filter((c) => {
      const j = mainOf(c).jump;
      return j !== null && keep(j);
    });
  out["JUMP>3"] = statisticOf(
    kit,
    judgedAs(
      jump((j) => j > JUMP),
      own,
      mainEdge,
    ),
  );
  out["JUMP<=3"] = statisticOf(
    kit,
    judgedAs(
      jump((j) => j <= JUMP),
      own,
      mainEdge,
    ),
  );
  out["JUMP none"] = statisticOf(
    kit,
    judgedAs(
      main.filter((c) => mainOf(c).jump === null),
      own,
      mainEdge,
    ),
  );
  for (const v of MOVED)
    out[v.line] = statisticOf(
      kit,
      judgedAs(
        main,
        (c) => mainOf(c).moved[v.line].money,
        (c) => mainOf(c).moved[v.line].judged.edge,
      ),
    );
  out.RANK = statisticOf(
    kit,
    judgedAs(
      main.filter((c) => c.rank),
      own,
      mainEdge,
    ),
  );
  return out;
}

/** MAIN by part (C13): SIDES, MONTHS (the UTC month of t) and SLICES, each part's C12 figures. */
export function partsOf(kit: Research, main: readonly PrintCopy[]) {
  const by = (key: (c: PrintCopy) => string) => {
    const groups = new Map<string, PrintCopy[]>();
    for (const c of main) {
      const g = groups.get(key(c));
      if (g === undefined) groups.set(key(c), [c]);
      else g.push(c);
    }
    return Object.fromEntries(
      [...groups]
        .sort((a, b) => (a[0] < b[0] ? -1 : 1))
        .map(([k, cs]) => [k, statisticOf(kit, judgedAs(cs, own, mainEdge))]),
    );
  };
  return {
    sides: by((c) => (c.dir > 0 ? "long" : c.dir < 0 ? "short" : "none")),
    months: by((c) => new Date(c.t).toISOString().slice(0, 7)),
    slices: by((c) => String(sliceOf(c.addr))),
  };
}

/** Concentration (C13), on MAIN's priced copies. */
export function concentrationOf(main: readonly PrintCopy[]) {
  const x = itemsOf(main, netOf);
  const total = sum(x.map((i) => i.x));
  const sums = (key: (i: Item) => string) => {
    const s = new Map<string, number>();
    for (const i of x) s.set(key(i), (s.get(key(i)) ?? 0) + i.x);
    return [...s].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
  };
  const days = sums((i) => isoDay(i.tIn));
  const best = new Set(days.slice(0, CONCENTRATION.bestDays).map(([d]) => d));
  const traders = sums((i) => i.addr);
  const top = traders.slice(
    0,
    Math.ceil(traders.length * CONCENTRATION.topShare),
  );
  const topTen = new Set(
    traders.slice(0, CONCENTRATION.topTraders).map(([a]) => a),
  );
  // The event level: each (coin, side, UTC hour of t) once, at its copies' mean.
  const events = new Map<string, number[]>();
  for (const c of main) {
    const n = netOf(c);
    if (n === null) continue;
    const key = `${c.iid}|${Math.sign(c.dir)}|${Math.floor(c.t / 3_600_000)}`;
    const e = events.get(key);
    if (e === undefined) events.set(key, [n]);
    else e.push(n);
  }
  const copiesOf = new Map<string, number>();
  for (const c of main) copiesOf.set(c.addr, (copiesOf.get(c.addr) ?? 0) + 1);
  let most: { addr: string; copies: number } | null = null;
  for (const [addr, copies] of [...copiesOf].sort((a, b) =>
    a[0] < b[0] ? -1 : 1,
  ))
    if (most === null || copies > most.copies) most = { addr, copies };
  return {
    bestDaysShare:
      total === 0
        ? null
        : sum(days.slice(0, CONCENTRATION.bestDays).map(([, s]) => s)) / total,
    meanWithoutBestDays: mean(
      x.filter((i) => !best.has(isoDay(i.tIn))).map((i) => i.x),
    ),
    topTradersShare: total === 0 ? null : sum(top.map(([, s]) => s)) / total,
    meanWithoutTopTen: mean(
      x.filter((i) => !topTen.has(i.addr)).map((i) => i.x),
    ),
    eventLevel: {
      events: events.size,
      mean: mean([...events.values()].map((e) => sum(e) / e.length)),
    },
    mostCopiesOfOneTrader: most,
  };
}

/** The look's report of its positions (C13): R14's list, every line, MAIN's parts, the venues, H1's prints, concentration, settled, thin and cascade. */
export function reportOf(
  kit: Research,
  voted: readonly PrintCopy[],
  o: { z: number; look: 1 | 2; start: number; end: number; endS: number },
) {
  const main = voted.filter((c) => c.lines.includes("MAIN"));
  const stat = (cs: readonly PrintCopy[], money = own, edge = mainEdge) =>
    statisticOf(kit, judgedAs(cs, money, edge));
  const priced = main.filter((c) => c.money.reason === undefined);
  const items = itemsOf(priced, netOf);
  const settled = main.filter((c) => c.settled);
  const thin = main.filter((c) => c.thin);
  return {
    r14: r14Of(kit, main, o),
    lines: linesOf(kit, voted),
    parts: partsOf(kit, main),
    venues: {
      hyperliquidBase: stat(main),
      binance: stat(main, (c) => mainOf(c).binance),
    },
    h1: {
      nullMeanGross: mean(
        main.flatMap((c) => {
          const j = c.judged.MAIN;
          return j?.d == null ? [] : [j.nullGross];
        }),
      ),
      d: twoWay(
        kit,
        itemsOf(main, (c) => c.judged.MAIN?.d ?? null),
      ),
      edge: stat(main).edge,
      moneyByWeek: twoWay(
        kit,
        items.map((i) => ({ ...i, tIn: weekOf(i.tIn) })),
      ),
      moneyByMonth: twoWay(
        kit,
        items.map((i) => {
          const d = new Date(i.tIn);
          return {
            ...i,
            tIn: Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1),
          };
        }),
      ),
    },
    concentration: concentrationOf(main),
    settled: {
      copies: settled.length,
      withoutD: settled.filter((c) => c.judged.MAIN?.d == null).length,
      main: stat(main),
      withoutSettled: stat(main.filter((c) => !c.settled)),
    },
    thin: {
      copies: thin.length,
      share: main.length === 0 ? 0 : thin.length / main.length,
      withoutThin: stat(main.filter((c) => !c.thin)),
    },
    cascade: stat(
      main,
      (c) => mainOf(c).cascade.money,
      (c) => mainOf(c).cascade.edge,
    ),
  };
}
export type Report = ReturnType<typeof reportOf>;
