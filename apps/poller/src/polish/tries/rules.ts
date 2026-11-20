/**
 * A rule and its positions on a part (POLISH-EXPLORE's plan 3.2, 4 and 5.3;
 * decisions 2026-11-18, "POLISH-EXPLORE's plan approved"): B0, one try, or
 * B0 with several changes (the nominee N): its M's entries in the part, the
 * filters' features read at their instants (an unknown one leaves the
 * position out, counted), its delay, hold and exit; priced in one sweep; its
 * statistic and its D-test against B0, on the net re-based by the
 * calibration's b when the tape beat the book (Q10).
 */
import { ENTRY_DELAY_MS, HOLD_MS } from "../../market1/price.js";
import type { Item } from "../../market1/stats.js";
import { HOUR_MS, MINUTE_MS } from "../../schedule.js";
import type { Data } from "./data.js";
import { featuresOf } from "./features.js";
import {
  entriesOf,
  inPart,
  positionOf,
  type Entry,
  type Part,
} from "./parts.js";
import { priceAt } from "./prices.js";
import type { Net, Spec } from "./sweep.js";
import { TRIES, keeps, type CutsFile, type Try } from "./trylog.js";
import { bySlice } from "../../waveh/slices.js";
import { dTest, statOf, type DTest, type Stat } from "./stats.js";

/** B0 with changes: M doubled (W2), the entry's delay (D), the hold (H), the target exit (X1), the filters. */
export type Rule = {
  name: string;
  M2: boolean;
  delay: number;
  hold: number;
  target: boolean;
  filters: readonly string[];
};

export const B0: Rule = {
  name: "B0",
  M2: false,
  delay: ENTRY_DELAY_MS,
  hold: HOLD_MS,
  target: false,
  filters: [],
};

/** B0 with the changes of `tries` together: filters intersect; a variant sets its own part (one a family, so none twice). */
export function ruleOf(name: string, tries: readonly Try[]): Rule {
  const r = { ...B0, name, filters: [] as string[] };
  for (const t of tries)
    if ("filter" in t) r.filters.push(t.name);
    else {
      r.M2 ||= t.variant.M2 === true;
      r.delay = t.variant.delay ?? r.delay;
      r.hold = t.variant.hold ?? r.hold;
      r.target ||= t.variant.target === true;
    }
  return r;
}

export const tryNamed = (name: string): Try => {
  const t = TRIES.find((x) => x.name === name);
  if (t === undefined) throw new Error(`no try ${name}`);
  return t;
};

/**
 * X1's exit (the try log 3.4): with B = P(t) − P(t − 60 min), when σ·B > 0
 * the first minute end e in (x_in, x_out) with −σ·(P(e) − P(t)) ≥ ½·σ·B, a
 * minute without a price never triggering; else x_out. Null (left out) when
 * P(t) or P(t − 60 min) is unknown.
 */
export function targetExit(
  d: Data,
  pc: Float64Array,
  e: Entry,
  xIn: number,
  xOut: number,
): number | null {
  const { t, side } = e.fill;
  const pt = priceAt(pc, d.start, t);
  const B = pt - priceAt(pc, d.start, t - HOUR_MS);
  if (Number.isNaN(B)) return null;
  if (side * B <= 0) return xOut;
  for (let k = Math.floor((xIn - d.start) / MINUTE_MS) + 1; ; k++) {
    const end = d.start + k * MINUTE_MS;
    if (end >= xOut) return xOut;
    const p = priceAt(pc, d.start, end);
    if (-side * (p - pt) >= 0.5 * side * B) return end;
  }
}

/** X2's exit (printed only): the first minute end e in (x_in, x_out) at which dir·(P(e) ÷ P(e₁) − 1)·10⁴ ≤ −1,000, e₁ the first minute end after x_in; null when P(e₁) is unknown. */
export function stopExit(
  d: Data,
  pc: Float64Array,
  dir: 1 | -1,
  xIn: number,
  xOut: number,
): number | null {
  const k1 = Math.floor((xIn - d.start) / MINUTE_MS) + 1;
  const p1 = priceAt(pc, d.start, d.start + k1 * MINUTE_MS);
  if (Number.isNaN(p1)) return null;
  for (let k = k1; ; k++) {
    const end = d.start + k * MINUTE_MS;
    if (end >= xOut) return xOut;
    if (dir * (priceAt(pc, d.start, end) / p1 - 1) * 1e4 <= -1_000) return end;
  }
}

/** A rule's positions on a part: the entries kept, their specs, and the entries left out by reason. */
export type Placed = {
  rule: Rule;
  entries: Entry[];
  specs: Spec[];
  left: Record<string, number>;
};

/** The rule's M's entries (every slice, H4's order from the first file) and the slices. */
export function entriesAt(d: Data, M: number) {
  const slices = bySlice(d.counted, M);
  return { slices, all: entriesOf(slices) };
}

/**
 * Places a rule on a part: its entries in the part, those its filters keep
 * (the E cuts), its exits. The part is E or C (`inPart`), or any test of
 * the entry's instant (the exam's FRESH: polish/rules.md P1, THE PLAN D15).
 */
export function place(
  d: Data,
  rule: Rule,
  part: Part | ((t: number) => boolean),
  M: number,
  cuts: CutsFile["cuts"],
): Placed {
  const { slices, all } = entriesAt(d, rule.M2 ? 2 * M : M);
  const enters =
    typeof part === "function" ? part : (t: number) => inPart(part, t);
  const entries = all.filter((e) => enters(e.fill.t));
  const left: Record<string, number> = {};
  const count = (why: string) => (left[why] = (left[why] ?? 0) + 1);
  let kept = entries;
  if (rule.filters.length > 0) {
    const f = featuresOf(d, { entries, slices, all, delay: rule.delay });
    kept = entries.filter((_, i) => {
      for (const name of rule.filters) {
        const c = cuts[name as keyof typeof cuts];
        const k = keeps(tryNamed(name), f.get(name)![i]!, c?.value ?? null);
        if (k === null) {
          count(`${name} unknown`);
          return false;
        }
        if (!k) return false;
      }
      return true;
    });
  }
  const names = new Map(d.coins.list.map((c) => [c.assetId, c.name]));
  const out: Placed = { rule, entries: [], specs: [], left };
  for (const e of kept) {
    const p = positionOf(e, rule.delay, rule.hold);
    let xOut: number | null = p.xOut;
    if (rule.target)
      xOut = targetExit(d, d.pc.get(names.get(e.fill.iid)!)!, e, p.xIn, p.xOut);
    if (xOut === null) {
      count("X1 unknown");
      continue;
    }
    out.entries.push(e);
    out.specs.push({ iid: e.fill.iid, dir: p.dir, xIn: p.xIn, xOut });
  }
  return out;
}

/** A rule's items: each priced position's net, re-based by b (Q10), at its entry's instant and coin. */
export function itemsOf(
  entries: readonly Entry[],
  nets: readonly Net[],
  b: number,
): Item[] {
  const out: Item[] = [];
  nets.forEach((n, i) => {
    if (n.net !== null)
      out.push({
        t: entries[i]!.fill.t,
        iid: entries[i]!.fill.iid,
        x: n.net - b,
      });
  });
  return out;
}

/** The unpriced positions by reason. */
export function unpricedOf(nets: readonly Net[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const n of nets)
    if (n.unpriced !== null) out[n.unpriced] = (out[n.unpriced] ?? 0) + 1;
  return out;
}

/** A rule's statistic and its D-test against B0 at k (null when V has no error: no t). */
export function judged(
  kit: Data["kit"],
  v: readonly Item[],
  b0: readonly Item[],
  seB0: number | null,
  k?: number,
): { stat: Stat | null; test: DTest | null } {
  const stat = statOf(kit, v);
  const kk = k ?? (stat?.se != null && seB0 ? stat.se / seB0 : null);
  return { stat, test: kk === null ? null : dTest(v, b0, kk) };
}
