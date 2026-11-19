/**
 * Every number the exam's rules fix (polish/rules.md), one home in code
 * (POLISH-RULES's plan, D1–D53, as ruled: decisions 2026-11-19, "the plan's
 * eight questions ruled", "the 715 option made safe" and the owner's "the
 * 715 cut decides the exam on FRESH, with the safety net"). A test holds
 * rules.md's numbers to these.
 */
import { FRESH_END } from "../seal.js";
import { C, E, STOP_MS } from "../tries/parts.js";

/** WAVE-H's M (waveh/sizing.json): slice(a) = a mod 147. */
export const M = 147;
/** The deciding line pools slices 0–19 (the owner, 2026-11-19). */
export const K = 20;

/**
 * The recipe (rules.md P4): B0 + W4, W4's cut at 715 accounts deciding;
 * N's cut (polish/cuts.json's W4, 336) decides instead when the safety net
 * fires; 1,391 is printed beside. The two stricter cuts are the kit's
 * quantiles (type 7) at 0.75 and 0.9 of W4 over B0's 148,154 E entries.
 */
export const RECIPE = {
  deciding: 715,
  n: 336,
  beside: 1_391,
  quantiles: { n: 0.5, deciding: 0.75, beside: 0.9 },
  entriesOnE: 148_154,
} as const;
export type Recipe = {
  deciding: number;
  n: number;
  beside: number;
  quantiles: { n: number; deciding: number; beside: number };
  entriesOnE: number;
};

/** The safety net (rules.md P4): step 1's 715 line under 20 UTC days or 10 coins → N decides. */
export const SAFETY_NET = { days: 20, coins: 10 } as const;

/** The deciding days (rules.md P1): positions with t ≥ from and x_out < to. */
export const SEGMENTS = [
  {
    from: Date.parse("2026-05-30T00:00:00Z"),
    to: Date.parse("2026-08-31T00:00:00Z"),
  },
  { from: Date.parse("2026-11-07T00:00:00Z"), to: FRESH_END },
] as const;
/** MARKET-FIND's discovery window, printed apart, "not independent". */
export const DISCOVERY = {
  from: Date.parse("2026-08-31T00:00:00Z"),
  to: Date.parse("2026-11-07T00:00:00Z"),
} as const;
/** Look 2's segment 2′ ends here (rules.md P12). */
export const LOOK2_END = Date.parse("2027-02-06T00:00:00Z");

/** The owner's line: DOES NOT HOLD when m + z·SE < δ. */
export const DELTA = 50;
/** WITHHELD above this share; TOO FEW under these days or coins. */
export const WITHHELD_SHARE = 0.1;
export const TOO_FEW = { days: 20, coins: 10 } as const;

/** F1's placebo for the exam's z (rules.md P10): the exploration's seed, 100,000 draws a window, both flips. */
export const PLACEBO = {
  seed: 20_261_118,
  draws: 100_000,
  windows: [100, 182],
} as const;
/** The textbook floors (F1; decisions 2026-11-19): HOLDS's 99% two-sided, LIKELY's 95%, Bonferroni over two looks. */
export const TEXTBOOK = {
  twoLooks: { holds: 2.81, likely: 2.24 },
  oneLook: { holds: 2.58, likely: 1.96 },
} as const;

/** The spans the placebo's windows lie in, the exploration's entries' (besideOf's): E's (the 715 line's, E alone) and E ∪ C's (N's). */
export const SPANS = {
  E: { from: E.start, to: E.end - STOP_MS },
  EC: { from: E.start, to: C.end - STOP_MS },
} as const;

/**
 * The exploration's files the exam reads, by SHA-256 (rules.md P0; the
 * supervisor's run of 2026-11-19, `ANALYZER\WAVE-H`): the trusted store's
 * manifest and gates, the cuts, the steps' outputs and positions files.
 */
export const EXPLORED = {
  store: "19b726884e4857cda11cdc5401e2d0fe1ec3f2e0d706abbbc8413ed673c13c92",
  gates: "8aef300dc1c1490c4fb633ffa62a5d34a836a4d4db42a1afe663c050f697b968",
  cuts: "2040ded35d8e6dd2224acd6730d79b869afc241706a89022086b818854dd4e5c",
  e: "82cb2a76658ffb3eb7fada6c2de5a7bcdc13dd8355843e317d5a4906d4ddf274",
  choice: "a886635083c7c074978f4de89b4763824fbf94413917041118813598b178edf3",
  c: "945366a6fbace0a8633ba61419061d0cfde00982e14543c11a670ecb2a336d94",
  beside: "daa41f8889fb9f0e2ac71de6c9996f03b3bcfbc16f2a57e3f6e0105f3bb4db72",
  ePositions:
    "76d8ee37e56e44a22855f040e606d5d0ff3cdac8e04b4d7c264578cef5c5b5f6",
  choicePositions:
    "ba339baa23fb190cbaa942e81a472a11547d9d3e42370a27f834d19b0e41f515",
  cPositions:
    "7c6a4618f174bd57dd630974d4871f636818574ad03ef7457c2adb1e0d75182c",
} as const;

/** What the steps hold their inputs to, passed by name: main.ts passes EXAM_DESIGN (pinned by a test); a test's world its own. */
export type ExamDesign = {
  explored: { [k in keyof typeof EXPLORED]: string };
  recipe: Recipe;
  draws: number;
};
export const EXAM_DESIGN: ExamDesign = {
  explored: EXPLORED,
  recipe: RECIPE,
  draws: PLACEBO.draws,
};
