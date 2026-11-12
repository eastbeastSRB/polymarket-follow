/**
 * Whether an account's window was read (the plan's R3, with its review's F2):
 * a window [a, b) is covered when every fill before b has been read (P ≥ b),
 * no hole of the account meets it, and, before the account's reads start,
 * the seed holds it — the seed is whole, or its oldest fill is at or before
 * a. Days that were not read never count as quiet days.
 */
import type { AccountState } from "./store.js";

/** The seed's facts of an account (the kit's `truncated` and `oldest`); null when it has none. */
export type SeedFacts = { truncated: boolean; oldest: number | null };

export function covered(
  account: AccountState,
  seed: SeedFacts | null,
  a: number,
  b: number,
): boolean {
  if (account.P < b) return false;
  if (account.holes.some((h) => h.from < b && h.to > a)) return false;
  if (a >= account.from) return true;
  if (seed === null) return false;
  return !seed.truncated || (seed.oldest !== null && seed.oldest <= a);
}
