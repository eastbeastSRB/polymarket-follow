/**
 * The try log as data (apps/poller/polish/tries.md, section 3.4; decisions
 * 2026-11-18, "POLISH-EXPLORE's plan approved"): the 35 tries in the written
 * order, each with its family, its kind, whether the look seeded it, its
 * venue and whether it can be adopted; a filter's test on its feature (the
 * feature itself is features.ts's, at the try's pinned instant), with the
 * E cut it reads; a variant's change to B0. And `polish/cuts.json`, the nine
 * E cuts frozen before any outcome.
 */
import { z } from "zod";
import { HOUR_MS } from "../../schedule.js";
import type { Family } from "./choice.js";

/** A filter keeps B0's positions whose feature passes its test; an unknown feature leaves the position out. */
export type Filter = {
  /** The E quantile its cut is (0.5 the median, 0.9 the 90th percentile), or none. */
  q?: 0.5 | 0.9;
  keep: (v: number, cut: number) => boolean;
};
/** A variant changes B0's delay, hold, exit or M. */
export type Variant = {
  delay?: number;
  hold?: number;
  target?: true;
  M2?: true;
};

export type Try = {
  order: number;
  name: string;
  family: Family;
  seeded: boolean;
  venue: "HL" | "Both";
  /** False for N7 and N8: printed, never adopted. */
  adoptable: boolean;
} & ({ filter: Filter } | { variant: Variant });

const f = (
  order: number,
  name: string,
  family: Family,
  seeded: boolean,
  venue: "HL" | "Both",
  filter: Filter,
  adoptable = true,
): Try => ({ order, name, family, seeded, venue, adoptable, filter });
const v = (
  order: number,
  name: string,
  family: Family,
  variant: Variant,
): Try => ({
  order,
  name,
  family,
  seeded: true,
  venue: "Both",
  adoptable: true,
  variant,
});
const is = (want: number) => (x: number) => x === want;

export const TRIES: readonly Try[] = [
  f(1, "S1", "S", true, "HL", { keep: is(-1) }),
  v(2, "D0", "D", { delay: 10_000 }),
  v(3, "D15", "D", { delay: 900_000 }),
  v(4, "D60", "D", { delay: 3_600_000 }),
  ...[1, 2, 4, 8, 12].map((h, i) =>
    v(5 + i, `H${h}`, "H", { hold: h * HOUR_MS }),
  ),
  f(10, "W1", "W", false, "Both", { keep: (x) => x >= 3 }),
  v(11, "W2", "W", { M2: true }),
  f(12, "W3", "W", false, "Both", { keep: (x) => x >= 2 }),
  f(13, "W4", "W", false, "HL", { q: 0.5, keep: (x, c) => x >= c }),
  f(14, "W5", "W", false, "HL", { q: 0.5, keep: (x, c) => x >= c }),
  f(15, "R1", "R", true, "Both", { keep: (x) => x > 0 }),
  f(16, "R2", "R", true, "Both", { q: 0.9, keep: (x, c) => x <= c }),
  f(17, "R3", "R", true, "Both", { q: 0.9, keep: (x, c) => x <= c }),
  f(18, "R4", "R", true, "Both", { q: 0.5, keep: (x, c) => x < c }),
  f(19, "C1", "C", false, "Both", { keep: is(1) }),
  f(20, "C2", "C", false, "Both", { keep: is(1) }),
  f(21, "C3", "C", false, "Both", { keep: is(1) }),
  f(22, "T1", "T", false, "Both", { keep: (x) => x < 8 || x > 11 }),
  f(23, "T2", "T", false, "Both", { keep: (x) => x !== 0 && x !== 6 }),
  v(24, "X1", "X", { target: true }),
  f(25, "N1", "N", false, "Both", { keep: is(1) }),
  f(26, "N2", "N", false, "Both", { q: 0.5, keep: (x, c) => x >= c }),
  f(27, "N3", "N", false, "Both", { keep: is(1) }),
  f(28, "N4", "N", false, "Both", { keep: is(0) }),
  f(29, "N5", "N", false, "HL", { keep: is(1) }),
  f(30, "N6", "N", false, "Both", { keep: is(0) }),
  f(31, "N7", "N", false, "HL", { q: 0.5, keep: (x, c) => x > c }, false),
  f(32, "N8", "N", false, "HL", { q: 0.5, keep: (x, c) => x > c }, false),
  f(33, "N9", "N", false, "HL", { q: 0.5, keep: (x, c) => x >= c }),
  f(34, "N10", "N", false, "HL", { keep: is(1) }),
  f(35, "N11", "N", false, "Both", { keep: (x) => x >= 1.5 }),
];

/** The filters' names, the features a position carries. */
export const FILTERS = TRIES.filter((t) => "filter" in t).map((t) => t.name);

/** The nine tries whose cut is an E quantile, in the log's order. */
export const CUT_NAMES = [
  "W4",
  "W5",
  "R2",
  "R3",
  "R4",
  "N2",
  "N7",
  "N8",
  "N9",
] as const;

/** Whether a position passes a filter: null when its feature, or the cut, is unknown. */
export function keeps(
  t: Try,
  value: number,
  cut: number | null,
): boolean | null {
  if (!("filter" in t)) throw new Error(`${t.name} is not a filter`);
  if (Number.isNaN(value)) return null;
  if (t.filter.q === undefined) return t.filter.keep(value, NaN);
  return cut === null ? null : t.filter.keep(value, cut);
}

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
const Cut = z.object({
  q: z.union([z.literal(0.5), z.literal(0.9)]),
  value: z.number().nullable(),
  n: z.number().int().nonnegative(),
  unknown: z.number().int().nonnegative(),
});
export type Cut = z.infer<typeof Cut>;

/** `polish/cuts.json` (our own file: one that does not parse throws): the nine cuts and the features step's output they came from. */
export const CutsFile = z.object({
  features: SHA256,
  cuts: z.record(z.enum(CUT_NAMES), Cut),
});
export type CutsFile = z.infer<typeof CutsFile>;
