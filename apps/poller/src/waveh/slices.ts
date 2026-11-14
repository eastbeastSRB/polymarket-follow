/**
 * The slices (rules.md H5): every account in one slice, slice(a) = the
 * address as a 160-bit whole number modulo M; M fixed from SIZING's counted
 * fills so that a slice sees MARKET-1's pool's rate of 60-minute episodes.
 * MARKET-1's `episodes` and `waveEntries` then run inside each slice (H6).
 */
import type { Liq } from "../market1/fills.js";
import { episodes } from "../market1/waves.js";

/** MARKET-FIND's 386 episodes in 68 days: the rate M matches. */
export const TARGET_RATE = 5.68;
/** The scan stops after the first M whose rate is below half the target. */
export const STOP_RATE = 2.84;

export const sliceOf = (addr: string, M: number): number =>
  Number(BigInt(addr) % BigInt(M));

/** The fills of each slice, each list in the order given (H4's). */
export function bySlice<T extends Liq>(fills: readonly T[], M: number): T[][] {
  const out = Array.from({ length: M }, (): T[] => []);
  const of = new Map<string, number>();
  for (const f of fills) {
    let k = of.get(f.addr);
    if (k === undefined) {
      k = sliceOf(f.addr, M);
      of.set(f.addr, k);
    }
    out[k]!.push(f);
  }
  return out;
}

export type ScanRow = { M: number; episodes: number; rate: number };

/**
 * H5's scan on SIZING's counted fills in H4's order: r(M) = the slices' mean
 * count of episodes ÷ `days`, from M = 1 to the first M below STOP_RATE; M is
 * the one nearest TARGET_RATE, a tie taking the larger.
 */
export function scanM(
  sizing: readonly Liq[],
  days: number,
): { M: number; scan: ScanRow[] } {
  const scan: ScanRow[] = [];
  for (let M = 1; ; M++) {
    const n = bySlice(sizing, M).reduce((s, l) => s + episodes(l).length, 0);
    scan.push({ M, episodes: n, rate: n / M / days });
    if (n / M / days < STOP_RATE) break;
  }
  return { M: pickM(scan), scan };
}

/** The scan's M: its rate nearest TARGET_RATE, a tie taking the larger M. */
export function pickM(scan: readonly ScanRow[]): number {
  let best = scan[0]!;
  for (const row of scan) {
    const d = Math.abs(row.rate - TARGET_RATE);
    const b = Math.abs(best.rate - TARGET_RATE);
    if (d < b || (d === b && row.M > best.M)) best = row;
  }
  return best.M;
}
