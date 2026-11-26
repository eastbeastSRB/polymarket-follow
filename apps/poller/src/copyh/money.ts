/**
 * The money reading (copyh/rules.md C8, R8 unchanged; RM4): a copy's legs
 * and its price, in bps of its $1,000.
 * - The exits: the kit's `buildEntries` exits of the entry's group, through
 *   lib-exits' `exitsOf` and `liquidationKeys` (entries.ts's history).
 * - The legs: `dist/paper/copy.js`'s `planCopyThrough({t, D}, exits, end)`:
 *   each exit, at its first fill + D, closes its share of what is still open;
 *   an exit instant at or after `end` flags the copy `crossing`, a part
 *   still open after the trader's last exit `open`, both marked at
 *   `end` − 1 ms. `end` is END, or the coin's end when it settles before END
 *   (markets.ts `coinOf`): what is still open there is marked at the end's
 *   last millisecond, at the Settlement price, and the copy is `settled`.
 * - The price: lib-exits' `priceCopy(mk, {dir, tIn: t + D, legs, setting})`,
 *   ×10⁴ for net, gross, fees and funding; unpriced with lib-exits' reason.
 * - STOP's search (R13): up to the copy's last exit instant when its exits
 *   closed it, else its plan's end (the paper's scorer).
 */
import { planCopyThrough } from "../paper/copy.js";
import type {
  CopyExit,
  CopyPlan,
  Market,
  Research,
  Setting,
} from "../paper/research.js";

const BPS = 1e4;

/** A copy's plan: the paper's, and whether it was still open at its coin's Settlement (its flag then `open` or `crossing`, from the coin's end), having been opened before it. */
export type Plan = CopyPlan & { readonly settled: boolean };

/** A copy's legs (C8), to END or its coin's end; `closeAt`, STOP's or DAYS7's extra close (R13). A copy followed at or after its coin's end opens nothing, so is not settled (it is unpriced, no mark at its follow instant: the engine review's L6). */
export function planOf(
  entry: { readonly t: number; readonly D: number },
  exits: readonly CopyExit[],
  coin: { readonly end: number; readonly settlement: unknown },
  closeAt: number | null = null,
): Plan {
  const plan = planCopyThrough(entry, exits, coin.end, closeAt);
  return {
    ...plan,
    settled:
      coin.settlement !== null &&
      plan.flag !== null &&
      entry.t + entry.D < coin.end,
  };
}

/** A copy's money in bps of its $1,000 (C8), or why it is unpriced (C11). */
export type Money =
  | {
      readonly net: number;
      readonly gross: number;
      readonly fees: number;
      readonly funding: number;
      /** The share-weighted hold and the full exit's, ms from the follow instant. */
      readonly holdMs: number;
      readonly fullExitMs: number;
      /** Whole funding hours without a row, charged nothing (C9, C11). */
      readonly fundingMissing: number;
      readonly spreadFallback: boolean;
      readonly reason?: undefined;
    }
  | { readonly reason: string };

/** lib-exits' `priceCopy` on a market object and setting, in bps. */
export function moneyOf(
  kit: Research,
  mk: Market,
  copy: { readonly dir: number; readonly tIn: number; readonly plan: CopyPlan },
  setting: Setting,
): Money {
  const p = kit.exits.priceCopy(mk, {
    dir: copy.dir,
    tIn: copy.tIn,
    legs: copy.plan.legs,
    setting,
  });
  if (p.reason !== undefined) return { reason: p.reason };
  return {
    net: p.net * BPS,
    gross: p.gross * BPS,
    fees: p.fees * BPS,
    funding: p.funding * BPS,
    holdMs: p.hold,
    fullExitMs: p.fullExit,
    fundingMissing: p.fundingMissing,
    spreadFallback: p.spreadFallback,
  };
}

/** STOP's search ends (R13): the copy's last exit instant when its exits closed it, else its plan's end. */
export const stopUntil = (plan: CopyPlan, D: number, end: number): number =>
  plan.flag === null ? plan.lastExitT! + D : end;
