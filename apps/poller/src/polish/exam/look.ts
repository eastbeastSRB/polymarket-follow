/**
 * The exam's look on FRESH (polish/rules.md P4, P5, P8, P13, P14; THE PLAN
 * D14–D17, D29, D30, D48, D52, D53b; T11, T12): its lines, placed by the
 * exploration's own `place` with the exam's entry test — the recipe's W4 cut
 * at 715 deciding, N's 336 (deciding instead when the safety net fires),
 * the 1,391 beside, and B0 — each position with where it stands and why it
 * is left out; the deciding line's days; and step 1's counts, none of which
 * reads an outcome.
 */
import { MINUTE_MS } from "../../schedule.js";
import { coinName, type Coins } from "../../waveh/coins.js";
import { isoDay } from "../../waveh/instants.js";
import { tally } from "../../waveh/legs.js";
import type { Spot } from "../../waveh/positions.js";
import { byDayOf } from "../gates.js";
import type { Range } from "../range.js";
import type { FileCounts, Manifest } from "../store.js";
import type { Data } from "../tries/data.js";
import { priceColumn } from "../tries/prices.js";
import { B0, place, type Rule } from "../tries/rules.js";
import { fundingBetween, settlementsOf } from "../tries/sweep.js";
import type { CutsFile } from "../tries/trylog.js";
import {
  K,
  M,
  NO_BOOK_DAYS,
  OPTIONS,
  THIN_CTXS_DAYS,
  type Recipe,
} from "./design.js";
import { inExam, leftOutOf, whereOf } from "./fresh.js";

/** The exam's lines (rules.md P4, P13): the recipe's 715, N's 336, the 1,391 cut beside, and B0. */
export const LINES = ["715", "N", "1391", "B0"] as const;
export type LineName = (typeof LINES)[number];

/** A position of a line on FRESH: WAVE-H's spot, its entry fill's `tid`, where it stands (D4, option B), and why it is left out (D30), null when it is not. */
export type LookPosition = Spot & {
  tid: string;
  where: ReturnType<typeof whereOf>;
  left: string | null;
};

const withW4 = (cuts: CutsFile["cuts"], value: number): CutsFile["cuts"] => ({
  ...cuts,
  W4: { ...cuts.W4, value },
});

/**
 * Each line's positions on FRESH, every slice (D14–D17, D52): N's rule
 * (choice.json's, B0 + W4) with W4's cut at the recipe's deciding, N's and
 * beside numbers, and B0, placed by `place` with the exam's entry test
 * (D15); and each line's entries a feature left out, by reason (W4 is never
 * unknown, so none).
 */
export function linesOf(
  d: Data,
  holes: readonly [number, number][],
  rule: Rule,
  cuts: CutsFile["cuts"],
  recipe: Recipe,
) {
  const unknown = {} as Record<LineName, Record<string, number>>;
  const lineOf = (name: LineName, r: Rule, c: CutsFile["cuts"]) => {
    const p = place(d, r, inExam, M, c);
    unknown[name] = p.left;
    return p.entries.map((e, i): LookPosition => {
      const s = p.specs[i]!;
      const at = { t: e.fill.t, xIn: s.xIn, xOut: s.xOut };
      return {
        slice: e.slice,
        iid: e.fill.iid,
        t: e.fill.t,
        side: e.fill.side,
        dir: s.dir,
        xIn: s.xIn,
        xOut: s.xOut,
        method: e.fill.method,
        accounts: e.accounts,
        tid: e.fill.tid,
        where: whereOf(at, OPTIONS.noBookDays === "cut"),
        left: leftOutOf(holes, at),
      };
    });
  };
  const lines: Record<LineName, LookPosition[]> = {
    "715": lineOf("715", rule, withW4(cuts, recipe.deciding)),
    N: lineOf("N", rule, withW4(cuts, recipe.n)),
    "1391": lineOf("1391", rule, withW4(cuts, recipe.beside)),
    B0: lineOf("B0", B0, cuts),
  };
  return { lines, unknown };
}

/** A position's key in step 2's maps: its slice, instant and coin (two slices may enter one coin at one instant, on either side). */
export const keyOf = (p: { slice: number; t: number; iid: number }): string =>
  `${p.slice} ${p.t} ${p.iid}`;

/** On the deciding line's days (D16): slices 0 to K − 1, in a deciding segment (after option B's cut). */
export const onDeciding = (p: LookPosition): boolean =>
  p.slice < K && (p.where === "segment 1" || p.where === "segment 2");

/**
 * F7's days (rules.md P2, D12), each with why: the range's grid days
 * without an `asset_ctxs` file, the days read as absent (D11), the thin
 * days (THIN_CTXS_DAYS), and the archive's days without books
 * (NO_BOOK_DAYS).
 */
export function f7Of(range: Range, m: Manifest): Map<string, string[]> {
  const out = new Map<string, string[]>();
  const add = (day: string, why: string) =>
    out.set(day, [...(out.get(day) ?? []), why]);
  const days = new Set(range.days.map(isoDay));
  for (let t = range.grid.start; t < range.end; t += 1_440 * MINUTE_MS)
    if (!days.has(isoDay(t))) add(isoDay(t), "no asset_ctxs file");
  for (const [day, why] of Object.entries(m.counts.ctxsAbsent ?? {}))
    add(day, `asset_ctxs read as absent: ${why}`);
  for (const day of THIN_CTXS_DAYS)
    add(day, "a thin asset_ctxs file (under half WAVE-H's median bytes)");
  for (const day of NO_BOOK_DAYS)
    add(day, "no books (the archive's listing of 2026-11-13)");
  return new Map([...out].sort(([a], [b]) => (a < b ? -1 : 1)));
}

/** Whether a position's [x_in, x_out] meets a UTC day (F7's shares). */
export const touches = (p: { xIn: number; xOut: number }, day: string) => {
  const from = Date.parse(`${day}T00:00:00Z`);
  return p.xIn < from + 1_440 * MINUTE_MS && p.xOut >= from;
};

/**
 * Step 1's counts (D48), none an outcome: the fill files' records by day
 * and the block numbers missing; the holes (D29); the counted fills and the
 * 38 coins' other liquidation legs by month, kind and method (WAVE-H's
 * H15 print, `countedFrom`'s); the `asset_ctxs` rows of
 * the small coins by day and the days read as absent; the minutes priced by
 * the trade fallback, and those without a price, by coin and day; the
 * funding rows by coin and window; each line's positions by where they
 * stand; on the deciding days, the left out by reason and the positions not
 * left out whose funding has a settlement without a minute price; F7's days,
 * each with the share of the 715 line's and N's positions on the deciding
 * days, before option B's cut, that it touches.
 */
export function countsOf(o: {
  d: Data;
  m: Manifest;
  files: readonly FileCounts[];
  holes: readonly [number, number][];
  lines: Record<LineName, LookPosition[]>;
  range: Range;
  coins: Coins;
  forty: readonly string[];
  legs: ReadonlyMap<string, number>;
}) {
  const { d, lines } = o;
  const prices: Record<string, Record<string, [number, number]>> = {};
  for (const coin of o.forty) {
    const pc = d.pc.get(coin)!;
    const marked = priceColumn(
      d.column(coin, "mark"),
      new Float64Array(d.minutes).fill(NaN),
    );
    for (let k = 0; k < d.minutes; k++) {
      const none = Number.isNaN(pc[k]!);
      if (!none && !Number.isNaN(marked[k]!)) continue;
      const day = isoDay(d.start + k * MINUTE_MS);
      const c = ((prices[coin] ??= {})[day] ??= [0, 0]);
      c[none ? 1 : 0] += 1;
    }
  }
  const settled = new Map<number, ReturnType<typeof settlementsOf>>();
  const unpricedFunding = (p: LookPosition) => {
    let st = settled.get(p.iid);
    if (st === undefined) {
      st = settlementsOf(d, coinName(o.coins, p.iid));
      settled.set(p.iid, st);
    }
    return Number.isNaN(fundingBetween(st, p.xIn, p.xOut).sum);
  };
  const byLine = <T>(f: (n: LineName) => T) =>
    Object.fromEntries(LINES.map((n) => [n, f(n)]));
  const beforeTheCut = (n: LineName) =>
    lines[n].filter((p) => p.slice < K && p.where !== "discovery");
  const sharesOf = (day: string) =>
    Object.fromEntries(
      (["715", "N"] as const).map((n) => {
        const all = beforeTheCut(n);
        const hit = all.filter((p) => touches(p, day)).length;
        return [
          n,
          { positions: hit, share: all.length === 0 ? 0 : hit / all.length },
        ];
      }),
    );
  return {
    files: o.files.length,
    ...byDayOf(o.files),
    legs: Object.fromEntries([...o.legs].sort(([a], [b]) => (a < b ? -1 : 1))),
    holes: o.holes.map(([a, b]) => [
      new Date(a).toISOString(),
      new Date(b).toISOString(),
    ]),
    ctxsByDay: o.m.counts.ctxsByDay,
    ctxsAbsent: o.m.counts.ctxsAbsent ?? {},
    prices: { columns: ["by the trade fallback", "no price"], byCoin: prices },
    funding: o.m.counts.funding,
    positions: byLine((n) => tally(lines[n], (p) => p.where)),
    left: byLine((n) => tally(lines[n].filter(onDeciding), (p) => p.left)),
    fundingWithoutPrice: byLine(
      (n) =>
        lines[n].filter(
          (p) => onDeciding(p) && p.left === null && unpricedFunding(p),
        ).length,
    ),
    f7: Object.fromEntries(
      [...f7Of(o.range, o.m)].map(([day, why]) => [
        day,
        { why, ...sharesOf(day) },
      ]),
    ),
  };
}
