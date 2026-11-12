/**
 * A paper position's legs past the cut (the plan's R8 and R13, with its
 * review's F9 and F14). FIND-6-EXITS's `planCopy` hard-wires the cut; this is
 * the same rule with the run's END as a parameter, and the vendored one is
 * never called past the cut (a test pins the two equal at END = CUT). Each
 * exit of the trader, at its first fill + D, closes its share of what is
 * still open — a partial liquidation its share, a close, flip or full
 * liquidation all of it; adds are not copied; an exit instant at or after
 * END flags the copy `crossing`, a part still open after the trader's last
 * exit `open`, and both are marked at END − 1 ms (the minute that ends at
 * END).
 */
import type {
  CopyExit,
  CopyLeg,
  CopyPlan,
  Market,
  Research,
} from "./research.js";
import { DAY_MS, MINUTE_MS } from "../schedule.js";

/** lib-exits' OPEN_EPS: a copy whose open part is at most this is closed. */
const OPEN_EPS = 1e-12;

/**
 * `closeAt`: STOP's and DAYS7's extra close (R13) — when it comes before END
 * and before an exit, all that is still open closes at that instant.
 */
export function planCopyThrough(
  { t, D }: { t: number; D: number },
  exits: readonly CopyExit[],
  end: number,
  closeAt: number | null = null,
): CopyPlan {
  const tIn = t + D;
  const close = closeAt !== null && closeAt < end ? closeAt : null;
  const legs: CopyLeg[] = [];
  let open = 1;
  let flag: CopyPlan["flag"] = null;
  let lastExitT: number | null = null;
  for (const x of exits) {
    // An exit at or after the extra close finds nothing open; one at or after END crosses it.
    if (close !== null && x.t + D >= close) break;
    lastExitT = x.t;
    if (x.t + D >= end) {
      flag = "crossing";
      break;
    }
    const part = open * Math.min(1, x.share);
    legs.push({ h: x.t - t, part, kind: x.kind, forced: x.forced, liq: x.liq });
    open -= part;
    if (open <= OPEN_EPS) {
      open = 0;
      break;
    }
  }
  if (open > 0 && close !== null) {
    legs.push({
      h: close - tIn,
      part: open,
      kind: "cut",
      forced: false,
      liq: false,
    });
  } else if (open > 0) {
    flag ??= "open";
    legs.push({
      h: end - 1 - tIn,
      part: open,
      kind: "cut",
      forced: false,
      liq: false,
    });
  }
  return { legs, flag, lastExitT };
}

/**
 * STOP (R13, F14 b): the first whole minute s after the minute of t + D whose
 * end mark is `stop` or more against the mark at the end of t + D's minute;
 * the copy's remainder closes at the minute's last millisecond, s + 1 min −
 * 1 ms. Searched up to `until` (the copy's last exit instant, or END). Null
 * when no minute reaches it, or t + D's minute has no mark.
 */
export function stopInstant(
  kit: Research,
  mk: Market,
  { dir, tIn }: { dir: number; tIn: number },
  stop: number,
  until: number,
): number | null {
  const markIn = kit.panel.markAtMinuteEnd(mk, tIn);
  if (markIn === null) return null;
  const first = Math.floor(tIn / MINUTE_MS) * MINUTE_MS + MINUTE_MS;
  for (let s = first; s + MINUTE_MS - 1 < until; s += MINUTE_MS) {
    const m = kit.panel.markAtMinuteEnd(mk, s);
    if (m !== null && dir * (m / markIn - 1) <= -stop) return s + MINUTE_MS - 1;
  }
  return null;
}

/** DAYS7 (R13): the copy's remainder closes at t + D + 7 days. */
export const DAYS7_MS = 7 * DAY_MS;

const JUMP_MS = 15 * MINUTE_MS;
const JUMP_DAYS_MS = 30 * DAY_MS;
const jumpSums = new WeakMap<
  Market,
  { sum: Float64Array; count: Int32Array }
>();

/**
 * JUMP (R13, F14 c): J = |m(e)/m(e − 15 min) − 1| ÷ U, e = the start of t's
 * minute, m(x) = the mark in force at x (`markAtMinuteEnd(mk, x − 1)`), U =
 * the mean of |m(s + 15 min)/m(s) − 1| over every whole start minute s with
 * both marks, e − 30 days ≤ s and s + 15 min ≤ e (it never looks past e).
 * Null without U or without the two marks at e.
 */
export function jumpRatio(kit: Research, mk: Market, t: number): number | null {
  const at = (x: number) => kit.panel.markAtMinuteEnd(mk, x - 1);
  const e = Math.floor(t / MINUTE_MS) * MINUTE_MS;
  const now = at(e);
  const before = at(e - JUMP_MS);
  if (now === null || before === null) return null;
  let sums = jumpSums.get(mk);
  if (sums === undefined) {
    // Prefix sums over the start minute s = mk.start + i·1 min.
    const sum = new Float64Array(mk.n + 1);
    const count = new Int32Array(mk.n + 1);
    for (let i = 0; i < mk.n; i++) {
      const s = mk.start + i * MINUTE_MS;
      const a = at(s);
      const b = at(s + JUMP_MS);
      const ok = a !== null && b !== null;
      sum[i + 1] = sum[i]! + (ok ? Math.abs(b / a - 1) : 0);
      count[i + 1] = count[i]! + (ok ? 1 : 0);
    }
    sums = { sum, count };
    jumpSums.set(mk, sums);
  }
  const lo = Math.max(0, (e - JUMP_DAYS_MS - mk.start) / MINUTE_MS);
  const hi = Math.min(mk.n - 1, (e - JUMP_MS - mk.start) / MINUTE_MS);
  if (!(hi >= lo)) return null;
  const n = sums.count[hi + 1]! - sums.count[lo]!;
  if (n === 0) return null;
  const u = (sums.sum[hi + 1]! - sums.sum[lo]!) / n;
  return u > 0 ? Math.abs(now / before - 1) / u : null;
}
