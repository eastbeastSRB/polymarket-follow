/**
 * The prints beside the exam's verdict (polish/rules.md P13, P14; THE PLAN
 * D46, D52), deciding nothing, written in report.json after result.json:
 * the deciding line's (the exploration's lines beside — months, sides,
 * without the two best days, a day and a coin out, the tail, BTC's and
 * ETH's moves, the event-level mean, OWN — with each segment, the means by
 * price source and by depth short, the two best days' share of the gain,
 * the net per hour held, and the $10,000 and $50,000 walks at its entry
 * books); a line's statistic with the two best days' share; a set of
 * positions at the tape from the one sweep.
 */
import { walkOpen } from "../../market1/book.js";
import type { Item } from "../../market1/stats.js";
import { dayOf } from "../../paper/stats.js";
import { coinName } from "../../waveh/coins.js";
import { bookAt } from "../../waveh/price.js";
import { linesBeside, type Line } from "../tries/beside.js";
import type { Data } from "../tries/data.js";
import { statOf } from "../tries/stats.js";
import type { Net } from "../tries/sweep.js";
import { SEGMENTS } from "./design.js";
import type { LookPosition } from "./look.js";
import type { BookFound } from "./price.js";

/** A look position as the exploration's lines beside read one: its net, why it is unpriced, its gross on marks. */
export const lineOf = (
  p: LookPosition,
  group: string,
  x: { net: number | null; unpriced: string | null; onMarks: number | null },
): Line => ({
  group,
  slice: p.slice,
  t: p.t,
  iid: p.iid,
  tid: p.tid,
  dir: p.dir,
  xIn: p.xIn,
  xOut: p.xOut,
  net: x.net,
  unpriced: x.unpriced,
  onMarks: x.onMarks,
});

const itemsOf = (ls: readonly Line[]): Item[] =>
  ls.flatMap((l) => (l.net === null ? [] : [{ t: l.t, iid: l.iid, x: l.net }]));

/** A line's statistic (M10's two-way) over its priced nets, and the two best days' share of its gain (D52; null unless the gain is above 0). */
export function statLine(kit: Data["kit"], items: readonly Item[]) {
  const byDay = new Map<number, number>();
  for (const i of items)
    byDay.set(dayOf(i.t), (byDay.get(dayOf(i.t)) ?? 0) + i.x);
  const gain = items.reduce((s, i) => s + i.x, 0);
  const best = [...byDay.values()]
    .sort((a, b) => b - a)
    .slice(0, 2)
    .reduce((s, x) => s + x, 0);
  return {
    priced: items.length,
    stat: statOf(kit, items),
    twoBestDaysShare: gain > 0 ? best / gain : null,
  };
}

/**
 * The deciding line's prints (D46): the exploration's lines beside on its
 * priced positions (BTC's and ETH's BASE over the segments' whole span),
 * the two best days' share, the net per hour held (m ÷ 24), and each
 * segment, each price source (both legs at the book, a leg at the tape)
 * and each depth (a leg short, none).
 */
export function decidingPrints(
  d: Data,
  rows: readonly {
    line: Line;
    bookBoth: boolean;
    short: boolean;
    where: string;
  }[],
) {
  const ls = rows.map((r) => r.line);
  const of = (pick: (r: (typeof rows)[number]) => boolean) =>
    statLine(d.kit, itemsOf(rows.filter(pick).map((r) => r.line)));
  const all = statLine(d.kit, itemsOf(ls));
  return {
    ...linesBeside(d, ls, 0, { start: SEGMENTS[0].from, end: SEGMENTS[1].to }),
    twoBestDaysShare: all.twoBestDaysShare,
    perHourHeld: all.stat === null ? null : all.stat.mean / 24,
    bySegment: {
      "segment 1": of((r) => r.where === "segment 1"),
      "segment 2": of((r) => r.where === "segment 2"),
    },
    bySource: {
      "both legs at the book": of((r) => r.bookBoth),
      "a leg at the tape": of((r) => !r.bookBoth),
    },
    byDepth: {
      "a leg depth short": of((r) => r.short),
      "no leg short": of((r) => !r.short),
    },
  };
}

/** The walks' notionals: MARKET-1's $1,000 and the two larger (D46). */
const SIZES = [1_000, 10_000, 50_000] as const;

/**
 * The entry books walked for $1,000, $10,000 and $50,000 (D46, as the
 * exploration's walks): the cost against the book's mid, dir × (p ÷ mid −
 * 1) × 10⁴, and the larger walks' extra over $1,000's, dir × (p ÷ p₁,₀₀₀ −
 * 1) × 10⁴, each with its two-way error; the walks depth short; the
 * entries without a live, usable book, by why. The books in the coin's and
 * the instant's order, so each file is read once.
 */
export async function walksOf(
  d: Data,
  ps: readonly LookPosition[],
  find: (coin: string, x: number) => Promise<BookFound>,
) {
  const coin = (p: LookPosition) => coinName(d.coins, p.iid);
  const cost = SIZES.map((): Item[] => []);
  const extra = SIZES.map((): Item[] => []);
  const short = SIZES.map(() => 0);
  const not: Record<string, number> = {};
  const order = [...ps].sort((a, b) =>
    coin(a) < coin(b) ? -1 : coin(a) > coin(b) ? 1 : a.xIn - b.xIn,
  );
  for (const p of order) {
    const f = await find(coin(p), p.xIn);
    const at = bookAt(p.xIn, f.atHour, f.before);
    if (!("book" in at)) {
      not[at.why] = (not[at.why] ?? 0) + 1;
      continue;
    }
    const side = p.dir > 0 ? at.book.asks : at.book.bids;
    const mid = (at.book.bids[0]![0] + at.book.asks[0]![0]) / 2;
    const ws = SIZES.map((n) => walkOpen(side, n));
    ws.forEach((w, k) => {
      cost[k]!.push({
        t: p.t,
        iid: p.iid,
        x: p.dir * (w.price / mid - 1) * 1e4,
      });
      extra[k]!.push({
        t: p.t,
        iid: p.iid,
        x: p.dir * (w.price / ws[0]!.price - 1) * 1e4,
      });
      if (w.short) short[k]! += 1;
    });
  }
  return {
    entries: ps.length,
    notWalked: not,
    bySize: Object.fromEntries(
      SIZES.map((n, k) => [
        `$${n.toLocaleString("en-US")}`,
        {
          cost: statOf(d.kit, cost[k]!),
          extra: k === 0 ? null : statOf(d.kit, extra[k]!),
          short: short[k],
        },
      ]),
    ),
  };
}

/** A set of positions at the tape (H8), from the one sweep's nets by position: how many, priced, unpriced by why, depth short, and its statistic. */
export function tapeLine(
  kit: Data["kit"],
  ps: readonly LookPosition[],
  nets: ReadonlyMap<string, Net>,
  key: (p: LookPosition) => string,
) {
  const items: Item[] = [];
  const unpriced: Record<string, number> = {};
  let short = 0;
  for (const p of ps) {
    const n = nets.get(key(p))!;
    if (n.net !== null) items.push({ t: p.t, iid: p.iid, x: n.net });
    if (n.unpriced !== null)
      unpriced[n.unpriced] = (unpriced[n.unpriced] ?? 0) + 1;
    if (n.short) short += 1;
  }
  return { positions: ps.length, unpriced, short, ...statLine(kit, items) };
}
