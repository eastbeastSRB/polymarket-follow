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
 * - The parent sums the parts into the set's projection (`tripwireOf`),
 *   whose share stops the step above 1% (tripwire.ts `tripwireStops`).
 * A try's set on S (C16, the engine's plan Q2) comes with step 2.
 */
import { z } from "zod";
import type { PartFunction, PartSpec, PhaseRecord } from "./engine.js";
import { partBytes, recordAt } from "./engine.js";
import type { Bars, Coin, MarkMinutes } from "./markets.js";
import { coinCopies, type Copy } from "./phase-build.js";
import { CoinContext, CoinInputs, coinReadingOf } from "./phase-coin.js";
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
/** A coin's projections under C9's two settlement rules, by their minutes. */
export const TripwirePart = z.object({
  iid: z.number(),
  by: z.object({ "5": ProjectionPart, "60": ProjectionPart }),
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

/** A coin's set as tripwire.ts reads it: MAIN's copies voted by END. */
export const plannedOf = (copies: readonly Copy[]): Planned[] =>
  copies.flatMap((c) => {
    if (!c.voted || !c.lines.includes("MAIN")) return [];
    const tIn = c.t + c.D;
    return [
      {
        iid: c.iid,
        tIn,
        legs: c.plan.legs.map((l) => tIn + l.h),
        settled: c.plan.settled,
        gap: c.gap,
      },
    ];
  });

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
  const i = CoinInputs.parse(inputs);
  const c = CoinContext.parse(ctx.context);
  const { coin, rows } = coinReadingOf(c, i, ctx.seal);
  const planned = plannedOf(
    coinCopies(c.build, recordAt(c.build, i.build[0]), i.iid),
  );
  if (i.build[1] !== null)
    for (const p of plannedOf(
      coinCopies(c.large, recordAt(c.large, i.build[1]), i.iid),
    ))
      planned.push(p);
  const by = coinProjection(
    planned,
    coin,
    rows.map((r) => r.hour),
    i.iid,
    i.end,
  );
  return new TextEncoder().encode(
    JSON.stringify({ iid: i.iid, by } satisfies TripwirePart),
  );
};

/** TRIPWIRE's parts: one a coin the BUILD phases hold, each with its coins.json name. */
export const tripwireParts = (
  o: Omit<CoinInputs, "iid" | "coin">,
  coins: readonly (readonly [iid: number, name: string])[],
): PartSpec[] =>
  coins.map(([iid, coin]) => ({
    id: `c${String(iid).padStart(3, "0")}`,
    inputs: { ...o, iid, coin } satisfies CoinInputs,
  }));

/** A closed TRIPWIRE phase's projection of the whole set under one settlement rule: its parts summed, its share over the set. */
export function tripwireOf(
  dir: string,
  record: PhaseRecord,
  markMinutes: MarkMinutes,
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
    const p = TripwirePart.parse(
      JSON.parse(partBytes(dir, record, id).toString("utf8")),
    ).by[markMinutes];
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
