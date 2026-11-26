/**
 * COPY-H's instants (copyh/rules.md C1; D13): an instant's stage, its Monday
 * M (the latest Monday 00:00Z at or before it), its UTC day, week and month,
 * and each stage's Mondays. The instants themselves are design.ts's (C18).
 * Times are ms since the epoch; a window [a, b) includes a and excludes b.
 */
import { DAY_MS } from "../schedule.js";
import { ARCHIVE_START, END_E, END_F2, END_S, M0 } from "./design.js";

export const WEEK_MS = 7 * DAY_MS;

export const STAGES = ["burn-in", "E", "S", "FRESH-2"] as const;
export type Stage = (typeof STAGES)[number];

/** Each stage's window of an entry's first fill t (C1's table). */
export const STAGE_WINDOWS: Readonly<Record<Stage, readonly [number, number]>> =
  {
    "burn-in": [ARCHIVE_START, M0],
    E: [M0, END_E],
    S: [END_E, END_S],
    "FRESH-2": [END_S, END_F2],
  };

/** The stage whose window holds t, or null outside [ARCHIVE_START, END_F2). */
export function stageOf(t: number): Stage | null {
  for (const s of STAGES) {
    const [from, to] = STAGE_WINDOWS[s];
    if (t >= from && t < to) return s;
  }
  return null;
}

/** The UTC day that holds t: its first instant. */
export const dayOf = (t: number): number => Math.floor(t / DAY_MS) * DAY_MS;

/** M: the latest Monday 00:00Z at or before t. */
export function mondayOf(t: number): number {
  const day = dayOf(t);
  return day - ((new Date(day).getUTCDay() + 6) % 7) * DAY_MS;
}

/** The UTC week that holds t: its Monday (C1). */
export const weekOf = mondayOf;

/** The UTC month that holds t: its first instant. */
export function monthOf(t: number): number {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
}

/** A stage's Mondays (C1's table): none for the burn-in, which judges nothing; else every Monday 00:00Z in its window. */
export function mondaysOf(stage: Stage): number[] {
  if (stage === "burn-in") return [];
  const [from, to] = STAGE_WINDOWS[stage];
  const out: number[] = [];
  let M = mondayOf(from);
  if (M < from) M += WEEK_MS;
  for (; M < to; M += WEEK_MS) out.push(M);
  return out;
}
