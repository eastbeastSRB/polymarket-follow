/**
 * The coverage tripwire's phase, TRIPWIRE (copyh/rules.md C16; the engine's
 * plan, sections 1 and 9), on engine.ts, before any price: a part is one
 * coin.
 * - Its copies of the set projected, at step 1 MAIN's set of look 1 (C12:
 *   MAIN's copies voted by END), from every BUILD and BUILD-L part, each as
 *   tripwire.ts reads a plan: the follow instant t + D, each leg's instant,
 *   settled, gap.
 * - Projected on the coin's bars and its funding rows' nominal hours
 *   (phase-coin.ts) under both of C9's settlement rules: the rehearsal sets
 *   the rule from both counts (C15 (c) 3), a step reads its own. A coin the
 *   reading holds no bars of has no mark: each copy "no mark at the follow
 *   instant", as PRICES finds it (COPYH-ENGINE-2's recommendation).
 * - At step 2 also each chosen try's set on S (C16; RH1 (a)): its line's
 *   copies voted by END with t in S, every condition met but those on the
 *   prior mean net, a price of earlier copies, which the projection leaves
 *   out and names (the engine's plan, Q2); the try's own WITHHELD reading
 *   still guards its set once priced.
 * - The parent sums the parts into each set's projection (`tripwireOf`),
 *   whose share stops the step above 1% (tripwire.ts `tripwireStops`).
 */
import { z } from "zod";
import type { PartFunction, PartSpec, PhaseRecord } from "./engine.js";
import { partBytes, recordAt } from "./engine.js";
import type { Bars, Coin, MarkMinutes } from "./markets.js";
import { coinCopies, type Copy } from "./phase-build.js";
import { CoinContext, CoinInputs, coinReadingOf } from "./phase-coin.js";
import { Condition, holds } from "./tries.js";
import {
  UNPRICED_REASONS,
  coinMarksOf,
  projectionOf,
  type Planned,
  type Projection,
} from "./tripwire.js";

const Count = z.number().int().min(0);
const ProjectionPart = z.object({
  copies: Count,
  unpriced: z.object(
    Object.fromEntries(UNPRICED_REASONS.map((r) => [r, Count])) as Record<
      (typeof UNPRICED_REASONS)[number],
      typeof Count
    >,
  ),
  share: z.number(),
  settled: Count,
  missingHours: Count,
  copiesMissing: Count,
  gap: Count,
});
/** A set's projections under C9's two settlement rules, by their minutes. */
const ByRule = z.object({ "5": ProjectionPart, "60": ProjectionPart });
/** A coin's projections: MAIN's look set's, then each try's set's. */
export const TripwirePart = z.object({
  iid: z.number(),
  by: ByRule,
  tries: z.array(ByRule),
});
export type TripwirePart = z.infer<typeof TripwirePart>;

/** A coin with no bars, as an object with no mark holds it. */
const noBars = (iid: number, end: number): Bars => ({
  iid,
  start: end,
  n: 0,
  trades: new Uint32Array(0),
  sz: new Float64Array(0),
  ntl: new Float64Array(0),
  last: new Float64Array(0),
  pairGap: new Float64Array(0),
  pairs: new Uint32Array(0),
  settleSz: new Float64Array(0),
  settleNtl: new Float64Array(0),
});

/** A copy as tripwire.ts reads its plan. */
const plannedCopy = (c: Copy): Planned => {
  const tIn = c.t + c.D;
  return {
    iid: c.iid,
    tIn,
    legs: c.plan.legs.map((l) => tIn + l.h),
    settled: c.plan.settled,
    gap: c.gap,
  };
};

/** A coin's set as tripwire.ts reads it: MAIN's copies voted by END. */
export const plannedOf = (copies: readonly Copy[]): Planned[] =>
  copies.flatMap((c) =>
    c.voted && c.lines.includes("MAIN") ? [plannedCopy(c)] : [],
  );

/** A try's set to project (C16 at step 2): its name, line, the stage window [from, to) of t and its conditions. */
export const TrySet = z.object({
  name: z.string(),
  line: z.enum(["MAIN", "BROAD"]),
  from: z.number(),
  to: z.number(),
  conditions: z.array(Condition),
});
export type TrySet = z.infer<typeof TrySet>;

/** Whether a condition reads the prior mean net, a price of earlier copies, which a projection leaves out (the engine's plan, Q2). */
export const readsPrice = (c: Condition): boolean =>
  c.covariate === "priorMeanNetBps";

/** A try's set as tripwire.ts reads it: its line's copies voted by END with t in its window, every condition met but those that read a price. */
export const triedOf = (copies: readonly Copy[], set: TrySet): Planned[] => {
  const conditions = set.conditions.filter((c) => !readsPrice(c));
  return copies.flatMap((c) =>
    c.voted &&
    c.lines.includes(set.line) &&
    c.t >= set.from &&
    c.t < set.to &&
    conditions.every((k) =>
      holds(k, { ...c.covariates, priorMeanNetBps: null }),
    )
      ? [plannedCopy(c)]
      : [],
  );
};

/** TRIPWIRE's inputs: a coin's, and the tries' sets to project (none at step 1). */
export const TripwireInputs = CoinInputs.extend({ tries: z.array(TrySet) });
export type TripwireInputs = z.infer<typeof TripwireInputs>;

/** A coin's projection under both settlement rules (null coin: no bars). */
export function coinProjection(
  planned: readonly Planned[],
  coin: Pick<Coin, "bars" | "end" | "settlement"> | null,
  hours: readonly number[],
  iid: number,
  end: number,
): TripwirePart["by"] {
  const at = (mm: MarkMinutes) => {
    const marks = coinMarksOf(
      coin ?? { bars: noBars(iid, end), end, settlement: null },
      hours,
      mm,
    );
    return projectionOf(planned, () => marks).projection;
  };
  return { "5": at(5), "60": at(60) };
}

/** TRIPWIRE's function (engine.ts `PartFunction`). */
export const tripwirePart: PartFunction = (inputs, ctx) => {
  const i = TripwireInputs.parse(inputs);
  const c = CoinContext.parse(ctx.context);
  const { coin, rows } = coinReadingOf(c, i, ctx.seal);
  const copies = coinCopies(c.build, recordAt(c.build, i.build[0]), i.iid);
  if (i.build[1] !== null)
    for (const x of coinCopies(c.large, recordAt(c.large, i.build[1]), i.iid))
      copies.push(x);
  const hours = rows.map((r) => r.hour);
  const by = (planned: readonly Planned[]) =>
    coinProjection(planned, coin, hours, i.iid, i.end);
  return new TextEncoder().encode(
    JSON.stringify({
      iid: i.iid,
      by: by(plannedOf(copies)),
      tries: i.tries.map((s) => by(triedOf(copies, s))),
    } satisfies TripwirePart),
  );
};

/** TRIPWIRE's parts: one a coin the BUILD phases hold, each with its coins.json name. */
export const tripwireParts = (
  o: Omit<TripwireInputs, "iid" | "coin">,
  coins: readonly (readonly [iid: number, name: string])[],
): PartSpec[] =>
  coins.map(([iid, coin]) => ({
    id: `c${String(iid).padStart(3, "0")}`,
    inputs: { ...o, iid, coin } satisfies TripwireInputs,
  }));

/** A closed TRIPWIRE phase's projection of a whole set under one settlement rule, MAIN's look set or the try of that place: its parts summed, its share over the set. */
export function tripwireOf(
  dir: string,
  record: PhaseRecord,
  markMinutes: MarkMinutes,
  tryAt: number | null = null,
): Projection {
  const sum = {
    copies: 0,
    unpriced: Object.fromEntries(UNPRICED_REASONS.map((r) => [r, 0])) as Record<
      (typeof UNPRICED_REASONS)[number],
      number
    >,
    settled: 0,
    missingHours: 0,
    copiesMissing: 0,
    gap: 0,
  };
  for (const [id] of record.parts) {
    const part = TripwirePart.parse(
      JSON.parse(partBytes(dir, record, id).toString("utf8")),
    );
    const set = tryAt === null ? part.by : part.tries[tryAt];
    if (set === undefined) throw new Error(`${dir} ${id}: no try at ${tryAt}`);
    const p = set[markMinutes];
    sum.copies += p.copies;
    for (const r of UNPRICED_REASONS) sum.unpriced[r] += p.unpriced[r];
    sum.settled += p.settled;
    sum.missingHours += p.missingHours;
    sum.copiesMissing += p.copiesMissing;
    sum.gap += p.gap;
  }
  const unpriced = UNPRICED_REASONS.reduce((n, r) => n + sum.unpriced[r], 0);
  return { ...sum, share: sum.copies === 0 ? 0 : unpriced / sum.copies };
}
