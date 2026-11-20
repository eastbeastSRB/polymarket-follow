/**
 * FRESH's positions on the exam's days (polish/rules.md P1, P4, P5, P8; THE
 * PLAN D4, D15, D16, D29, D30, D53b; decisions 2026-11-19, the 715 option
 * made safe, and "the exam's placebo and WITHHELD projection ran", Q1 and
 * T12): which days a position belongs to — a deciding segment, cut by
 * option B for a leg on a day without books, or the discovery window,
 * printed apart; the stretches of 60 s or more without a record that leave
 * a position out; and the safety net, read once at the first look's step 1,
 * that hands the exam to N when the 715 line's positions on the deciding
 * days span under 20 UTC days or 10 coins.
 */
import { ENTRY_DELAY_MS, HOLD_MS } from "../../market1/price.js";
import { HOUR_MS, MINUTE_MS } from "../../schedule.js";
import { FRESH_END } from "../seal.js";
import type { FileCounts } from "../store.js";
import { NO_BOOK_DAYS, SAFETY_NET, SEGMENTS } from "./design.js";

/** The exam's positions (D4): entries from 2026-05-30, closing before FRESH_END (entries of 2026-05-29 decide nothing; they still block, M5). Not the parts' 50-hour stop. */
export const inExam = (t: number): boolean =>
  t >= SEGMENTS[0].from && t + ENTRY_DELAY_MS + HOLD_MS < FRESH_END;

const dayOf = (x: number) => new Date(x).toISOString().slice(0, 10);
const noBook = new Set<string>(NO_BOOK_DAYS);

/**
 * Where an exam position stands (D4; option B): in a deciding segment when
 * t ≥ its start and x_out < its end; with `cut` (option B), a deciding
 * position whose x_in or x_out falls on a day of NO_BOOK_DAYS is cut and
 * printed apart; every other is the discovery window's, "not independent".
 */
export function whereOf(
  p: { t: number; xIn: number; xOut: number },
  cut: boolean,
): "segment 1" | "segment 2" | "cut: a day without books" | "discovery" {
  const i = SEGMENTS.findIndex((s) => p.t >= s.from && p.xOut < s.to);
  if (i < 0) return "discovery";
  if (cut && (noBook.has(dayOf(p.xIn)) || noBook.has(dayOf(p.xOut))))
    return "cut: a day without books";
  return i === 0 ? "segment 1" : "segment 2";
}

/** A stretch of 60 s or more without a record (D29). */
export const HOLE_MS = MINUTE_MS;

/**
 * D29: the holes inside the fill files' span — the stretches of 60 s or
 * more with no record of any coin — from every file's record times
 * (`files.jsonl` `times`: its first, its last, and its own holes): each
 * file's records cover [first, max] but its holes, the files' covers
 * joined, and a gap of 60 s or more between them a hole (a gap between
 * files counts). Each hole is (a, b), a and b records' times.
 */
export function holesOf(
  files: readonly Pick<FileCounts, "times">[],
): [number, number][] {
  const covered: [number, number][] = [];
  for (const f of files) {
    if (f.times === null) continue;
    let a = f.times.first;
    for (const [x, y] of [...f.times.holes].sort((u, v) => u[0] - v[0])) {
      covered.push([a, x]);
      a = y;
    }
    covered.push([a, f.times.max]);
  }
  covered.sort((u, v) => u[0] - v[0]);
  const holes: [number, number][] = [];
  let reach = covered[0]?.[1] ?? 0;
  for (const [a, b] of covered.slice(1)) {
    if (a - reach >= HOLE_MS) holes.push([reach, a]);
    reach = Math.max(reach, b);
  }
  return holes;
}

/** Whether a hole (a, b) meets [u, v): the holes are disjoint and in order, so the last one starting before v is the only one that can reach past u. */
function meets(holes: readonly [number, number][], u: number, v: number) {
  let lo = 0;
  let hi = holes.length;
  while (lo < hi) {
    const m = (lo + hi) >> 1;
    if (holes[m]![0] < v) lo = m + 1;
    else hi = m;
  }
  return lo > 0 && holes[lo - 1]![1] > u;
}

/**
 * D30: why a position is left out — a hole meets the 60 minutes up to t
 * ([t − 60 min, t], both ends in), the entry's tape window [x_in, x_in +
 * 60 s) or the exit's [x_out, x_out + 60 s) — or null. W4 is never unknown,
 * so no feature leaves one out.
 */
export function leftOutOf(
  holes: readonly [number, number][],
  p: { t: number; xIn: number; xOut: number },
): string | null {
  if (meets(holes, p.t - HOUR_MS, p.t + 1)) return "a hole in the hour up to t";
  if (meets(holes, p.xIn, p.xIn + MINUTE_MS))
    return "a hole in the entry's minute";
  if (meets(holes, p.xOut, p.xOut + MINUTE_MS))
    return "a hole in the exit's minute";
  return null;
}

/**
 * The safety net (D53b; T12): over the 715 line's positions on the deciding
 * days, after option B's cut, not left out — counted at the first look's
 * step 1, before any price — under 20 UTC days of t or 10 coins hands the
 * exam to N, at the same z, for every later look too.
 */
export function safetyNet(ps: readonly { t: number; iid: number }[]) {
  const days = new Set(ps.map((p) => dayOf(p.t))).size;
  const coins = new Set(ps.map((p) => p.iid)).size;
  const fires = days < SAFETY_NET.days || coins < SAFETY_NET.coins;
  return {
    deciding: fires ? ("N" as const) : ("715" as const),
    why: fires
      ? `the 715 line spans ${days} UTC days and ${coins} coins on the deciding days; ${SAFETY_NET.days} and ${SAFETY_NET.coins} are needed`
      : null,
    days,
    coins,
  };
}
