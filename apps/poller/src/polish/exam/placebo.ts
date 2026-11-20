/**
 * The placebo gate before the freeze (polish/rules.md P4, P10, P16; THE
 * PLAN D32–D35, D52, D53; decisions 2026-11-19, the plan's questions ruled
 * Q2, and the owner's "the 715 cut decides the exam on FRESH, with the
 * safety net"), from the exploration's positions files, by one code path:
 * - N's E lines checked to be B0's with W4 at least N's cut, priced alike,
 *   so the 715 line taken from B0's is N's subset;
 * - the two stricter cuts recomputed from W4 over B0's E lines (the
 *   features alone) and held to the design's;
 * - F1's placebo (`placeboOf`, both flips) on the deciding line, the 715
 *   line on slices 0–19, from E alone (C is never read for it), and on N at
 *   K = 20 and 10 over E ∪ C; N at K = 147 with 10,000 episode draws must
 *   equal beside.json's placebo to the bit;
 * - z and LIKELY's z for each look option (T10: one z whichever line
 *   decides), the projections (F13), and each line's TOO FEW and safety-net
 *   shares over every whole-day window.
 * No mean of an unflipped C net is printed.
 */
import { normalUpper, type Item } from "../../market1/stats.js";
import type { Research } from "../../paper/research.js";
import { dayOf } from "../../paper/stats.js";
import { DAY_MS } from "../../schedule.js";
import type { Counted } from "../../waveh/fills.js";
import { GateFailed } from "../run.js";
import { placeboOf, type Line, type Placebo } from "../tries/beside.js";
import { statOf } from "../tries/stats.js";
import {
  DELTA,
  K,
  M,
  PLACEBO,
  SAFETY_NET,
  SPANS,
  TEXTBOOK,
  TOO_FEW,
  type Recipe,
} from "./design.js";

/** W4's feature on a line (B0's E lines carry it), or null. */
export const w4Of = (l: Line): number | null =>
  ((l as Record<string, unknown>).W4 as number | null | undefined) ?? null;

/** The exploration's lines the placebo reads: B0's on E (with W4), N's on E (choice-positions) and on C (c-positions). */
export type Lines = {
  b0E: readonly Line[];
  nE: readonly Line[];
  nC: readonly Line[];
};

const keyOf = (l: Line) => `${l.slice}|${l.t}|${l.iid}|${l.tid}`;

/** Throws (exit 6) unless N's E lines are B0's E lines with W4 at least `cut`, one for one, each with the same direction, legs, net and reason. */
export function checkN(lines: Lines, cut: number): void {
  const kept = lines.b0E.filter((l) => {
    const v = w4Of(l);
    if (v === null) throw new GateFailed(`a B0 line on E without W4`);
    return v >= cut;
  });
  const n = new Map(lines.nE.map((l) => [keyOf(l), l]));
  const differ: string[] = [];
  if (kept.length !== lines.nE.length || n.size !== lines.nE.length)
    differ.push(
      `${kept.length} B0 lines at W4 >= ${cut}, ${lines.nE.length} N lines`,
    );
  for (const b of kept) {
    const l = n.get(keyOf(b));
    if (
      l === undefined ||
      l.dir !== b.dir ||
      l.xIn !== b.xIn ||
      l.xOut !== b.xOut ||
      l.net !== b.net ||
      l.unpriced !== b.unpriced
    ) {
      differ.push(`the B0 line ${keyOf(b)}`);
      break;
    }
  }
  if (differ.length > 0)
    throw new GateFailed(
      `N's E lines are not B0's at W4 >= ${cut}: ${differ.join("; ")}`,
    );
}

/** The cuts recomputed: the kit's type-7 quantiles of W4 over B0's E lines, held to the recipe's N, deciding and beside cuts (exit 6 otherwise). */
export function sideCuts(kit: Research, b0E: readonly Line[], recipe: Recipe) {
  const values = b0E.map((l) => w4Of(l) ?? NaN);
  if (values.length !== recipe.entriesOnE || values.some(Number.isNaN))
    throw new GateFailed(
      `${values.length} B0 lines on E with W4, not ${recipe.entriesOnE}`,
    );
  const got = {
    n: kit.exits.quantile(values, recipe.quantiles.n),
    deciding: kit.exits.quantile(values, recipe.quantiles.deciding),
    beside: kit.exits.quantile(values, recipe.quantiles.beside),
  };
  const off = (["n", "deciding", "beside"] as const).filter(
    (k) => got[k] !== recipe[k],
  );
  if (off.length > 0)
    throw new GateFailed(
      `W4's quantiles on E are ${JSON.stringify(got)}, not the design's ${off.map((k) => `${k} ${recipe[k]}`).join(", ")}`,
    );
  return { entries: values.length, ...got };
}

/** The lines the placebo runs on: the deciding line (B0's E lines at W4 at least the deciding cut, slices 0–19; E alone) and N at K = 20, 10 and M (E's lines, then C's, as beside's). */
export function placeboLines(lines: Lines, deciding: number) {
  const n = [...lines.nE, ...lines.nC];
  return {
    l715: lines.b0E.filter((l) => l.slice < K && w4Of(l)! >= deciding),
    n20: n.filter((l) => l.slice < K),
    n10: n.filter((l) => l.slice < 10),
    nAll: n,
  };
}

/** Both flips' placebo of one line on its span. */
export type ByFlip = {
  episode: Record<string, Placebo>;
  day: Record<string, Placebo>;
};
export function byFlip(
  d: { counted: readonly Counted[]; kit: Research },
  ls: readonly Line[],
  span: { from: number; to: number },
  draws: number,
): ByFlip {
  const o = { seed: PLACEBO.seed, draws, ...span };
  return {
    episode: placeboOf(d, ls, 0, { ...o, flip: "episode" }),
    day: placeboOf(d, ls, 0, { ...o, flip: "day" }),
  };
}

/**
 * Every whole-day window of `days` days whose start the placebo can draw
 * (span.from + w days, w = 0 … ⌊(to − from − days) ÷ 1 day⌋): the share
 * whose priced positions span under 20 UTC days of t or 10 coins (TOO
 * FEW), and whose positions, priced or not, do (the safety net's count,
 * read at step 1 before any price).
 */
export function windowShares(
  ls: readonly Line[],
  span: { from: number; to: number },
  days: number,
) {
  const last = Math.floor((span.to - span.from - days * DAY_MS) / DAY_MS);
  let tooFew = 0;
  let net = 0;
  let windows = 0;
  for (let w = 0; w <= last; w++) {
    const from = span.from + w * DAY_MS;
    const to = from + days * DAY_MS;
    const all = { days: new Set<number>(), coins: new Set<number>() };
    const priced = { days: new Set<number>(), coins: new Set<number>() };
    for (const l of ls) {
      if (l.t < from || l.t >= to) continue;
      all.days.add(dayOf(l.t));
      all.coins.add(l.iid);
      if (l.net === null) continue;
      priced.days.add(dayOf(l.t));
      priced.coins.add(l.iid);
    }
    windows += 1;
    if (priced.days.size < TOO_FEW.days || priced.coins.size < TOO_FEW.coins)
      tooFew += 1;
    if (all.days.size < SAFETY_NET.days || all.coins.size < SAFETY_NET.coins)
      net += 1;
  }
  return {
    windows,
    tooFew: windows === 0 ? null : tooFew / windows,
    safetyNet: windows === 0 ? null : net / windows,
  };
}

/**
 * A look's window length, which percentiles its HOLDS and LIKELY bars read,
 * and their textbook floors: the two looks', and the one later look's that
 * placebo.json also prints (its floors 99% and 95% at one look), a branch
 * removed before the freeze that decides nothing (rules.md P10; decisions
 * 2026-11-20, the exam's looks: two).
 */
const LOOKS = {
  twoLooks: [
    {
      look: "look 1",
      days: 100,
      holds: "p9975",
      likely: "p9875",
      floor: TEXTBOOK,
    },
    {
      look: "look 2",
      days: 182,
      holds: "p9975",
      likely: "p9875",
      floor: TEXTBOOK,
    },
  ],
  oneLook: [
    {
      look: "one later look",
      days: 182,
      holds: "p995",
      likely: "p975",
      floor: { holds: 2.58, likely: 1.96 },
    },
  ],
} as const;

/**
 * z and LIKELY's z for each look option (D33; T10, one z whichever line
 * decides): the larger of the textbook floor and the larger flip's
 * percentile of every line, at the look's window length.
 */
export function zTable(lines: Record<string, ByFlip>) {
  const table = (option: keyof typeof LOOKS) =>
    LOOKS[option].map((l) => {
      const at = (p: "p9975" | "p9875" | "p995" | "p975") =>
        Object.fromEntries(
          Object.entries(lines).map(([name, f]) => [
            name,
            {
              episode: f.episode[`${l.days} days`]![p],
              day: f.day[`${l.days} days`]![p],
            },
          ]),
        );
      const largest = (p: "p9975" | "p9875" | "p995" | "p975") =>
        Math.max(
          ...Object.values(lines).flatMap((f) => [
            f.episode[`${l.days} days`]![p] ?? -Infinity,
            f.day[`${l.days} days`]![p] ?? -Infinity,
          ]),
        );
      const floor = l.floor;
      return {
        look: l.look,
        window: l.days,
        holds: {
          textbook: floor.holds,
          percentile: l.holds,
          placebo: at(l.holds),
          z: Math.max(floor.holds, largest(l.holds)),
        },
        likely: {
          textbook: floor.likely,
          percentile: l.likely,
          placebo: at(l.likely),
          z: Math.max(floor.likely, largest(l.likely)),
        },
      };
    });
  return { twoLooks: table("twoLooks"), oneLook: table("oneLook") };
}

/** F13's power at a look (D35): P(HOLDS) = Φ((m − max(z·SE, δ − z·SE)) ÷ SE); P(LIKELY or HOLDS) with z_L for the lower bar, DOES NOT HOLD keeping z. */
export function powerOf(m: number, se: number | null, z: number, zL: number) {
  if (se === null || se <= 0) return { holds: null, likelyOrHolds: null };
  const phi = (v: number) => 1 - normalUpper(v);
  return {
    holds: phi((m - Math.max(z * se, DELTA - z * se)) / se),
    likelyOrHolds: phi((m - Math.max(zL * se, DELTA - z * se)) / se),
  };
}

/** The fields of beside.json's placebo that the generalized `placeboOf` must give again, to the bit. */
export const BESIDE_FIELDS = [
  "draws",
  "above258",
  "above281",
  "sd",
  "p995",
  "p9975",
  "student",
] as const;

/** N on all M slices with the exploration's 10,000 episode draws, held to beside.json's placebo of the rule field for field, to the bit (exit 6 otherwise). */
export function checkBeside(
  d: { counted: readonly Counted[]; kit: Research },
  nAll: readonly Line[],
  want: Record<
    string,
    Pick<Placebo, (typeof BESIDE_FIELDS)[number] | "errors">
  >,
  draws = 10_000,
): void {
  const got = placeboOf(d, nAll, 0, { seed: PLACEBO.seed, draws, ...SPANS.EC });
  const differ: string[] = [];
  for (const w of ["100 days", "182 days"]) {
    const g = got[w]!;
    const x = want[w];
    if (x === undefined) {
      differ.push(`${w}: not in beside.json`);
      continue;
    }
    for (const f of BESIDE_FIELDS)
      if (g[f] !== x[f]) differ.push(`${w} ${f}: ${g[f]}, beside's ${x[f]}`);
    for (const f of ["median", "q1", "q3"] as const)
      if (g.errors[f] !== x.errors[f])
        differ.push(
          `${w} errors.${f}: ${g.errors[f]}, beside's ${x.errors[f]}`,
        );
  }
  if (differ.length > 0)
    throw new GateFailed(
      `the placebo of N on all slices is not beside.json's: ${differ.join("; ")}`,
    );
}

const itemsOf = (ls: readonly Line[]): Item[] =>
  ls.flatMap((l) => (l.net === null ? [] : [{ t: l.t, iid: l.iid, x: l.net }]));

/**
 * The placebo's whole print: the checks, the lines' placebos, z, and for
 * each line the projection at each look (the 715 line from E alone, its m
 * less one error, "seeded: chosen after looking, optimistic"; N from C's
 * printed estimate less one error, `nOnC`), with the TOO FEW and
 * safety-net shares, and the 715 choice's combined chance (the safety net
 * handing over to N).
 */
export function placeboPrint(
  d: { counted: readonly Counted[]; kit: Research },
  lines: Lines,
  nOnC: { mean: number; se: number },
  beside: Parameters<typeof checkBeside>[2],
  design: { recipe: Recipe; draws: number },
) {
  const { recipe, draws } = design;
  checkN(lines, recipe.n);
  const cuts = sideCuts(d.kit, lines.b0E, recipe);
  const p = placeboLines(lines, recipe.deciding);
  checkBeside(d, p.nAll, beside);
  const placebo = {
    l715: byFlip(d, p.l715, SPANS.E, draws),
    n20: byFlip(d, p.n20, SPANS.EC, draws),
    n10: byFlip(d, p.n10, SPANS.EC, draws),
  };
  const z = zTable({ l715: placebo.l715, n20: placebo.n20 });
  const on715 = statOf(d.kit, itemsOf(p.l715));
  const proj = {
    l715:
      on715?.se == null
        ? null
        : {
            from: "E alone, the 715 line at K = 20: m less one error; seeded (chosen after looking), optimistic",
            m: on715.mean,
            se: on715.se,
            days: on715.days,
            coins: on715.markets,
            mProj: on715.mean - on715.se,
          },
    n20: {
      from: "C's printed estimate of N (c.json), less one error (F13)",
      m: nOnC.mean,
      se: nOnC.se,
      mProj: nOnC.mean - nOnC.se,
    },
  };
  const shares = {
    l715: {
      "100 days": windowShares(p.l715, SPANS.E, 100),
      "182 days": windowShares(p.l715, SPANS.E, 182),
    },
    n20: {
      "100 days": windowShares(p.n20, SPANS.EC, 100),
      "182 days": windowShares(p.n20, SPANS.EC, 182),
    },
  };
  const power = (option: "twoLooks" | "oneLook") =>
    z[option].map((look) => {
      const w = `${look.window} days`;
      const at = (name: "l715" | "n20") => {
        const pr = proj[name];
        return pr === null
          ? null
          : powerOf(
              pr.mProj,
              placebo[name].episode[w]!.errors.median,
              look.holds.z,
              look.likely.z,
            );
      };
      const a = at("l715");
      const b = at("n20");
      // The safety net is read once, at the first look's step 1 (T12): its share at that look's window.
      const fires = shares.l715[`${z[option][0]!.window} days`].safetyNet;
      const mix = (k: "holds" | "likelyOrHolds") =>
        a?.[k] == null || b?.[k] == null || fires === null
          ? null
          : (1 - fires) * a[k] + fires * b[k];
      return {
        look: look.look,
        window: look.window,
        seL715: placebo.l715.episode[w]!.errors.median,
        seN20: placebo.n20.episode[w]!.errors.median,
        l715: a,
        n20: b,
        safetyNetFires: fires,
        theChoice: { holds: mix("holds"), likelyOrHolds: mix("likelyOrHolds") },
      };
    });
  return {
    print:
      "the exam's placebo gate (polish/rules.md P10): deciding nothing until frozen in rules.md; C's nets enter only N's flipped draws and window errors, never a mean",
    M,
    K,
    checks: {
      nIsB0AtItsCut: true,
      cuts,
      besideToTheBit:
        "N on all 147 slices, 10,000 episode draws: beside.json's placebo of the rule, every field",
    },
    lines: {
      l715: { positions: p.l715.length, priced: itemsOf(p.l715).length },
      n20: { positions: p.n20.length, priced: itemsOf(p.n20).length },
      n10: { positions: p.n10.length, priced: itemsOf(p.n10).length },
      nAll: { positions: p.nAll.length, priced: itemsOf(p.nAll).length },
    },
    placebo,
    z,
    projection: proj,
    shares,
    power: { twoLooks: power("twoLooks"), oneLook: power("oneLook") },
  };
}
