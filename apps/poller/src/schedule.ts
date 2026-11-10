/**
 * When things run, in UTC. A schedule is "every `everyMs`, at `offsetMs`
 * past each multiple of it since the epoch": UTC days are exact multiples
 * of 86,400,000 ms, so a daily HH:MM is `{ everyMs: DAY_MS, offsetMs }`.
 */

export const SECOND_MS = 1_000;
export const MINUTE_MS = 60_000;
export const HOUR_MS = 3_600_000;
export const DAY_MS = 86_400_000;

export type Schedule = { everyMs: number; offsetMs: number };

/** The first run strictly after `afterMs`. */
export function nextRun(schedule: Schedule, afterMs: number): number {
  const { everyMs, offsetMs } = schedule;
  return (Math.floor((afterMs - offsetMs) / everyMs) + 1) * everyMs + offsetMs;
}

/** polymarket-lab's nightly window, 02:35–03:50Z: our REST reads pause in it (decisions 2026-11-10, (9)). */
export const NIGHTLY_PAUSE_START_MS = 2 * HOUR_MS + 35 * MINUTE_MS;
export const NIGHTLY_PAUSE_END_MS = 3 * HOUR_MS + 50 * MINUTE_MS;

export function inNightlyPause(wallMs: number): boolean {
  const ofDay = wallMs - Math.floor(wallMs / DAY_MS) * DAY_MS;
  return ofDay >= NIGHTLY_PAUSE_START_MS && ofDay < NIGHTLY_PAUSE_END_MS;
}

/** The next start or end of the nightly window strictly after `wallMs`. */
export function nextNightlyEdge(wallMs: number): {
  at: number;
  starts: boolean;
} {
  const start = nextRun(
    { everyMs: DAY_MS, offsetMs: NIGHTLY_PAUSE_START_MS },
    wallMs,
  );
  const end = nextRun(
    { everyMs: DAY_MS, offsetMs: NIGHTLY_PAUSE_END_MS },
    wallMs,
  );
  return start < end ? { at: start, starts: true } : { at: end, starts: false };
}

/**
 * The slots whose whole window `[slot, slot + windowMs)` lay inside a gap of
 * the process, from `lastAt` to `now`: their job could not run (§1.4 item 8:
 * a missed pass is lost and logged, never filled from a later read).
 */
export function missedSlots(
  schedule: Schedule,
  windowMs: number,
  lastAt: number,
  now: number,
): number[] {
  const missed: number[] = [];
  for (
    let slot = nextRun(schedule, lastAt);
    slot + windowMs <= now;
    slot += schedule.everyMs
  ) {
    missed.push(slot);
  }
  return missed;
}

export function dayStart(wallMs: number): number {
  return Math.floor(wallMs / DAY_MS) * DAY_MS;
}

export function utcDate(wallMs: number): string {
  return new Date(wallMs).toISOString().slice(0, 10);
}

export function utcHour(wallMs: number): string {
  return new Date(wallMs).toISOString().slice(11, 13);
}

export function hourStart(wallMs: number): number {
  return Math.floor(wallMs / HOUR_MS) * HOUR_MS;
}
