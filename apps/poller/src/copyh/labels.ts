/**
 * Labels and habits at an entry's Monday M (copyh/rules.md C5, R5 with one
 * bound), from the account's fills before M only.
 * - The label: the kit's `labelAt` at M on the account's kept fills in
 *   [max(ARCHIVE_START, M − 90 d), M), given as a truncated capture whose
 *   oldest instant is that start (the kit's own case for a capture whose
 *   older history is unread). An account with no fill in the 14 days before
 *   M gets the classifier's "no fills in window" at once (the kit's answer
 *   for such a capture). A capture of more than LABEL_FILLS_MAX fills is not
 *   run through the kit: the account is not P1 at that Monday, and is named
 *   and counted (the supervisor's ruling on COPYH-ENGINE's Q1, 2026-11-26;
 *   its sentence queued for the rules' last touch).
 * - P1 at M: the label "directional" and the label's window covered, which
 *   C5 reads as M − 14 d at or after ARCHIVE_START (true from M₀); the
 *   reproduction passes R5's own coverage.
 * - The habits: the kit's `habitsAt({cycles, groups}, M)` on the events of
 *   the fills before M. They are read from the whole history's cycles and
 *   groups when no order event of the account straddles M (its fills both
 *   before M and at or after it), which gives the same events before M; an
 *   account with a straddling event has them computed apart, and counted.
 * The kit's own 14 and 30 days are its `LABEL_DAYS` and `HABIT_DAYS`.
 */
import type {
  Capture,
  Cycle,
  Fill,
  Group,
  Habits,
  OrderEvent,
  Research,
} from "../paper/research.js";
import { DAY_MS } from "../schedule.js";
import { ARCHIVE_START, LABEL_CAPTURE_DAYS, MERGE_MS } from "./design.js";

/** The classifier's own label for an account with no fill in the window (classifier.mjs `classify`). */
export const NO_FILLS = "no fills in window";
/** The label of a capture too large for the kit (Q1's rule): never P1. */
export const TOO_LARGE = "too many fills for the kit";
export const DIRECTIONAL = "directional";

/** The first fill at or after t (fills oldest first). */
function lowerBound(fills: readonly Fill[], t: number): number {
  let lo = 0;
  let hi = fills.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (fills[mid]!.t < t) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** The fills before t (fills oldest first). */
export const fillsBefore = (fills: readonly Fill[], t: number): Fill[] =>
  fills.slice(0, lowerBound(fills, t));

/** The label's capture at M (C5): the fills in [max(ARCHIVE_START, M − 90 d), M), truncated, its oldest instant that start. */
export function boundedCapture(fills: readonly Fill[], M: number): Capture {
  const start = Math.max(ARCHIVE_START, M - LABEL_CAPTURE_DAYS * DAY_MS);
  return {
    fills: fills.slice(lowerBound(fills, start), lowerBound(fills, M)),
    pages: 0,
    truncated: true,
    oldest: start,
  };
}

/**
 * The label at M on a capture of fills before M, oldest first: "no fills in
 * window" at once when the kit's 14 days before M hold none; TOO_LARGE past
 * `fillsMax` fills (LABEL_FILLS_MAX; a test passes its own); else the kit's.
 */
export function labelOf(
  kit: Research,
  capture: Capture,
  M: number,
  fillsMax: number,
): string {
  const last = capture.fills.at(-1);
  if (last === undefined || last.t < M - kit.labels.LABEL_DAYS * DAY_MS)
    return NO_FILLS;
  if (capture.fills.length > fillsMax) return TOO_LARGE;
  return kit.labels.labelAt(capture, M).label;
}

/** The windows P1 and the habits need at M covered (C5; R3 in the paper's reproduction). */
export type Coverage = {
  readonly labelCovered: boolean;
  readonly habitCovered: boolean;
};

/** COPY-H's coverage at M (C3, C5): a window is covered when it lies in the archive. */
export const coverageAt = (kit: Research, M: number): Coverage => ({
  labelCovered: M - kit.labels.LABEL_DAYS * DAY_MS >= ARCHIVE_START,
  habitCovered: M - kit.labels.HABIT_DAYS * DAY_MS >= ARCHIVE_START,
});

/** P1 at M (C5; R5): directional, its label window covered. */
export const isP1 = (label: string, coverage: Coverage): boolean =>
  label === DIRECTIONAL && coverage.labelCovered;

/** Whether an order event's fills lie both before M and at or after it. */
export const straddles = (events: readonly OrderEvent[], M: number): boolean =>
  events.some((e) => e.t < M && e.t1 >= M);

/**
 * The habits at M from the fills before M: from the whole history's cycles
 * and groups when no order event straddles M, else computed apart from the
 * fills before M (`apart`, counted).
 */
export function habitsAtMonday(
  kit: Research,
  history: {
    readonly events: readonly OrderEvent[];
    readonly cycles: readonly Cycle[];
    readonly groups: readonly Group[];
  },
  fills: readonly Fill[],
  M: number,
): { habits: Habits; apart: boolean } {
  if (!straddles(history.events, M))
    return {
      habits: kit.labels.habitsAt(
        { cycles: history.cycles, groups: history.groups },
        M,
      ),
      apart: false,
    };
  const events = kit.entries.toEvents(fillsBefore(fills, M));
  return {
    habits: kit.labels.habitsAt(
      {
        cycles: kit.entries.toCycles(events),
        groups: kit.entries.buildEntries(events, -Infinity, Infinity, MERGE_MS),
      },
      M,
    ),
    apart: true,
  };
}
