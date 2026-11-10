/**
 * Admission against the shared token budget (code-rules, "The Perps API"):
 * a request is sent only when the tokens spent in the trailing 60 s plus its
 * weight fit the caller's share, and the trailing 5 s plus it stay within 30.
 */

export type Spend = { at: number; weight: number };

export const WINDOW_MS = 60_000;
export const BURST_MS = 5_000;
export const BURST_CAP = 30;

/** Spends must be in the order they were made; `at` and `now` are monotonic ms. */
export function admissionDelay(
  spends: readonly Spend[],
  now: number,
  weight: number,
  share: number,
): number {
  if (weight > share || weight > BURST_CAP) {
    throw new Error(`weight ${weight} can never fit a share of ${share}`);
  }
  return Math.max(
    delayInWindow(spends, now, weight, WINDOW_MS, share),
    delayInWindow(spends, now, weight, BURST_MS, BURST_CAP),
  );
}

/** A spend counts while `now - at < windowMs`; waiting until `at + windowMs` frees it. */
function delayInWindow(
  spends: readonly Spend[],
  now: number,
  weight: number,
  windowMs: number,
  cap: number,
): number {
  const live = spends.filter((s) => now - s.at < windowMs);
  let sum = live.reduce((total, s) => total + s.weight, 0);
  let wait = 0;
  for (const oldest of live) {
    if (sum + weight <= cap) break;
    sum -= oldest.weight;
    wait = oldest.at + windowMs - now;
  }
  return wait;
}

/** The tokens spent in the trailing window ending at `now`. */
export function spentInWindow(
  spends: readonly Spend[],
  now: number,
  windowMs: number,
): number {
  return spends
    .filter((s) => now - s.at < windowMs)
    .reduce((total, s) => total + s.weight, 0);
}
