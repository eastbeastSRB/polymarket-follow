/**
 * The prints of one line at a look or on the page (rules.md M13): counts,
 * what is not priced at the book and why, the money with its errors and band,
 * the costs, the spread of the results, the readings on marks and against
 * BASE, the leave-outs; and WAVE's own: OWN and the tail (B11).
 */
import { mondayOf } from "../paper/instants.js";
import type { Research } from "../paper/research.js";
import { atBook } from "./price.js";
import type { Position } from "./lines.js";
import {
  byDay,
  dayOf,
  normalUpper,
  twoWay,
  type Item,
  type TwoWay,
} from "./stats.js";

const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

function count(values: readonly string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const v of values) out[v] = (out[v] ?? 0) + 1;
  return out;
}

/** The value at quantile q of sorted values (the lower one at a tie, as the kit's research prints). */
function quantile(sorted: readonly number[], q: number): number | null {
  if (sorted.length === 0) return null;
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))]!;
}

function median(sorted: readonly number[]): number | null {
  const n = sorted.length;
  if (n === 0) return null;
  return n % 2
    ? sorted[(n - 1) / 2]!
    : (sorted[n / 2 - 1]! + sorted[n / 2]!) / 2;
}

const meanOf = (xs: readonly number[]) =>
  xs.length === 0 ? null : xs.reduce((s, x) => s + x, 0) / xs.length;

/** M12: the two-way error when the items span several markets, else by day. */
export function statOf(kit: Research, items: readonly Item[]): TwoWay | null {
  return new Set(items.map((i) => i.iid)).size > 1
    ? twoWay(kit, items)
    : byDay(kit, items);
}

export type Tail = {
  worstDay: { day: string; sum: number; positions: number } | null;
  largestFall: number;
  mostOpen: number;
  worst: number | null;
  worstFivePct: number | null;
};

/** B11 on the priced positions' nets: by the UTC day of t, from the first day. */
export function tailOf(ps: readonly Position[]): Tail {
  const priced = ps.filter((p) => p.priced?.net != null);
  const byDayNet = new Map<number, { sum: number; n: number }>();
  for (const p of priced) {
    const d = dayOf(p.t);
    const g = byDayNet.get(d) ?? { sum: 0, n: 0 };
    g.sum += p.priced!.net!;
    g.n += 1;
    byDayNet.set(d, g);
  }
  const days = [...byDayNet].sort((a, b) => a[0] - b[0]);
  let cum = 0;
  let peak = 0;
  let fall = 0;
  for (const [, g] of days) {
    cum += g.sum;
    peak = Math.max(peak, cum);
    fall = Math.max(fall, peak - cum);
  }
  const worst = days.reduce<[number, { sum: number; n: number }] | null>(
    (w, d) => (w === null || d[1].sum < w[1].sum ? d : w),
    null,
  );
  let mostOpen = 0;
  for (const p of priced) {
    const open = priced.filter((q) => q.xIn <= p.xIn && p.xIn < q.xOut).length;
    mostOpen = Math.max(mostOpen, open);
  }
  const nets = priced.map((p) => p.priced!.net!).sort((a, b) => a - b);
  return {
    worstDay:
      worst === null
        ? null
        : { day: iso(worst[0]), sum: worst[1].sum, positions: worst[1].n },
    largestFall: fall,
    mostOpen,
    worst: nets[0] ?? null,
    worstFivePct: meanOf(nets.slice(0, Math.ceil(nets.length * 0.05))),
  };
}

export type LineSummary = ReturnType<typeof summarize>;

/** M13's prints for one line's set; z the look's (or the next look's) limit. */
export function summarize(kit: Research, ps: readonly Position[], z: number) {
  const priced = ps.filter((p) => p.priced?.net != null);
  const items = (pick: (p: Position) => number | null): Item[] =>
    ps.flatMap((p) => {
      const x = pick(p);
      return x === null ? [] : [{ t: p.t, iid: p.iid, x }];
    });
  const net = (p: Position) => p.priced?.net ?? null;
  const money = statOf(kit, items(net));
  const nets = priced.map((p) => p.priced!.net!).sort((a, b) => a - b);
  const notAtBook = ps.filter((p) => p.priced === null || !atBook(p.priced));
  const bandT =
    money?.seDay == null || money.days < 2
      ? null
      : kit.stats.tCritical(2 * normalUpper(z), money.days - 1) * money.seDay;
  const gross = statOf(
    kit,
    items((p) => p.priced?.gross ?? null),
  );
  const excess = statOf(
    kit,
    items((p) => (p.priced?.net == null ? null : (p.priced.excess ?? null))),
  );
  const costs = priced
    .filter((p) => p.priced!.entryCost !== null)
    .sort((a, b) => a.priced!.entryCost! - b.priced!.entryCost!);
  const entryCosts = costs.map((p) => p.priced!.entryCost!);
  const third = costs.slice(costs.length - Math.ceil(costs.length / 3));
  const dayKeys = [...new Set(priced.map((p) => dayOf(p.t)))];
  const daySums = dayKeys
    .map((d) => [
      d,
      priced
        .filter((p) => dayOf(p.t) === d)
        .reduce((s, p) => s + p.priced!.net!, 0),
    ])
    .sort((a, b) => b[1]! - a[1]!);
  const top2 = new Set(daySums.slice(0, 2).map((d) => d[0]));
  const leaveOut = (keys: readonly number[], key: (p: Position) => number) => {
    const means = keys
      .map((k) =>
        meanOf(priced.filter((p) => key(p) !== k).map((p) => p.priced!.net!)),
      )
      .filter((m): m is number => m !== null);
    return means.length === 0
      ? null
      : { lowest: Math.min(...means), highest: Math.max(...means) };
  };
  const byDayCount = [...new Set(ps.map((p) => dayOf(p.t)))]
    .map((d) => ps.filter((p) => dayOf(p.t) === d).length)
    .sort((a, b) => b - a);
  return {
    positions: ps.length,
    pending: ps.filter((p) => p.priced === null).length,
    priced: priced.length,
    days: new Set(priced.map((p) => dayOf(p.t))).size,
    markets: new Set(priced.map((p) => p.iid)).size,
    unpriced: count(
      ps.flatMap((p) => (p.priced?.unpriced ? [p.priced.unpriced] : [])),
    ),
    markLegs: count(
      ps.flatMap((p) => (p.priced?.markLegs ?? []).filter((m) => m !== null)),
    ),
    depthShort: ps.filter((p) => p.priced?.depthShort === true).length,
    notAtBook: notAtBook.length,
    notAtBookShare: ps.length === 0 ? 0 : notAtBook.length / ps.length,
    money,
    seWeek:
      kit.stats.cr1Test(
        items(net),
        (i) => mondayOf(i.t),
        (i) => i.x,
      ).se ?? null,
    band:
      money === null || bandT === null
        ? null
        : { low: money.mean - bandT, high: money.mean + bandT },
    atBookOnly: statOf(
      kit,
      items((p) => (p.priced !== null && atBook(p.priced) ? net(p) : null)),
    ),
    gross,
    grossLow: gross?.se == null ? null : gross.mean - z * gross.se,
    fees: meanOf(priced.map((p) => p.priced!.fees!)),
    funding: meanOf(priced.map((p) => p.priced!.funding!)),
    winShare:
      nets.length === 0 ? null : nets.filter((x) => x > 0).length / nets.length,
    median: median(nets),
    q1: quantile(nets, 0.25),
    q3: quantile(nets, 0.75),
    entryCost:
      entryCosts.length === 0
        ? null
        : { median: median(entryCosts), p90: quantile(entryCosts, 0.9) },
    costliestThird: meanOf(third.map((p) => p.priced!.net!)),
    onMarks: statOf(
      kit,
      items((p) => (p.priced?.net == null ? null : p.priced.grossOnMarks)),
    ),
    excess,
    excessLow: excess?.se == null ? null : excess.mean - z * excess.se,
    noBase: priced.filter((p) => p.priced!.excess === null).length,
    withoutTopTwo: meanOf(
      priced.filter((p) => !top2.has(dayOf(p.t))).map((p) => p.priced!.net!),
    ),
    dayLeftOut: leaveOut(dayKeys, (p) => dayOf(p.t)),
    marketLeftOut: leaveOut(
      [...new Set(priced.map((p) => p.iid))],
      (p) => p.iid,
    ),
    fiveBusiestShare:
      ps.length === 0
        ? null
        : byDayCount.slice(0, 5).reduce((s, n) => s + n, 0) / ps.length,
    perWeek: count(ps.map((p) => iso(mondayOf(p.t)))),
    /** WAVE's: the coin's own part (OWN). */
    own: statOf(
      kit,
      items((p) => (p.priced?.net == null ? null : (p.own ?? null))),
    ),
  };
}
