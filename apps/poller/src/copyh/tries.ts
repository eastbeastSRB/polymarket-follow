/**
 * A try of the owner's rounds (copyh/rules.md C14; the engine's plan, Q15 and
 * Q16): data, never code. Its line (MAIN or BROAD), its conditions on C14's
 * covariates by name, all of which must hold, and why; `copyh/tries.json`
 * holds the rounds' tries. A condition on a covariate the copy lacks is
 * false. A try's set is its line's copies voted by the look's END, every
 * condition met (a round's on E, step 2's confirmation on S); x a copy's
 * net, x′ its line's edge.
 */
import { z } from "zod";
import { ROUNDS, TRIES_A_ROUND } from "./design.js";
import { Position } from "./phase-prices.js";
import type { JudgedCopy } from "./verdict.js";

/** `copyh/tries.json`, relative to the package folder. */
export const TRIES_FILE = "copyh/tries.json";

/** C14's covariates, by name and in the units of the engine's plan, Q16 (hours for the median hold, USD for the size, bps for the prior mean net, a coin by its iid): every other name, the side among them, is refused. */
export const COVARIATES = [
  "closedCycles",
  "medianHoldHours",
  "longShare",
  "entries",
  "coin",
  "sizeUsd",
  "priorCopies",
  "priorMeanNetBps",
] as const;
export type Covariate = (typeof COVARIATES)[number];
/** A condition: a covariate, one of ≥ (">="), >, ≤ ("<="), <, = and "one of", and a constant or a list of constants (C14). */
export const Condition = z.union([
  z.strictObject({
    covariate: z.enum(COVARIATES),
    op: z.enum([">=", ">", "<=", "<", "="]),
    value: z.number(),
  }),
  z.strictObject({
    covariate: z.enum(COVARIATES),
    op: z.literal("one of"),
    value: z.array(z.number()).min(1),
  }),
]);
export type Condition = z.infer<typeof Condition>;
/** A try (C14): data, never code. */
export const Try = z.strictObject({
  name: z.string().min(1),
  line: z.enum(["MAIN", "BROAD"]),
  conditions: z.array(Condition),
  why: z.string().min(1),
});
export type Try = z.infer<typeof Try>;
/** `copyh/tries.json`: the rounds' tries, round n the n-th list; at most 3 rounds of at most 8, 6 and 4 tries, each name once. */
export const TriesFile = z
  .strictObject({ rounds: z.array(z.array(Try).min(1)).min(1).max(ROUNDS) })
  .refine((f) => f.rounds.every((r, k) => r.length <= TRIES_A_ROUND[k]!), {
    message: `a round past its cap of tries (${TRIES_A_ROUND.join(", ")})`,
    path: ["rounds"],
  })
  .refine(
    (f) => {
      const names = f.rounds.flat().map((t) => t.name);
      return new Set(names).size === names.length;
    },
    { message: "a try's name twice", path: ["rounds"] },
  );
export type TriesFile = z.infer<typeof TriesFile>;

/** Whether a copy's covariates meet a condition; a covariate the copy lacks meets none (C14). */
export function holds(
  c: Condition,
  covariates: Readonly<Record<Covariate, number | null>>,
): boolean {
  const v = covariates[c.covariate];
  if (v === null) return false;
  switch (c.op) {
    case ">=":
      return v >= c.value;
    case ">":
      return v > c.value;
    case "<=":
      return v <= c.value;
    case "<":
      return v < c.value;
    case "=":
      return v === c.value;
    case "one of":
      return c.value.includes(v);
  }
}

/** What a round reads of a positions line (phase-result.ts `positionLine`: PRICES' position, its prior mean net among its covariates). */
export const TryLine = Position.pick({
  addr: true,
  t: true,
  D: true,
  lines: true,
  voted: true,
  thin: true,
  money: true,
  judged: true,
}).extend({
  covariates: Position.shape.covariates.extend({
    priorMeanNetBps: z.number().nullable(),
  }),
});
export type TryLine = z.infer<typeof TryLine>;

/** Whether a copy is in a try's set (or FRESH-2's MAIN set, a line with no condition): its line's, voted by the look's END, every condition met. */
export const inTry = (
  p: TryLine,
  t: Pick<Try, "line" | "conditions">,
): boolean =>
  p.voted &&
  p.lines.includes(t.line) &&
  t.conditions.every((c) => holds(c, p.covariates));

/** A copy of a try's set as the statistic reads it: x its net, x′ its line's edge. */
export const tryCopyOf = (p: TryLine, line: Try["line"]): JudgedCopy => ({
  addr: p.addr,
  tIn: p.t + p.D,
  x: p.money.reason === undefined ? p.money.net : null,
  edge: p.judged[line]?.edge ?? null,
  thin: p.thin,
});
