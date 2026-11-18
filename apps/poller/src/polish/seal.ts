/**
 * FRESH stays sealed until the polishing's exam is frozen (the plan 3.7 and
 * 4.2(6); decisions 2026-11-17, the plan approved): every reader of the
 * analyzer refuses, before it opens anything, a path inside FRESH's raw
 * store (`…\FRESH\store`) or the analyzer's FRESH folder (`…\ANALYZER\FRESH`),
 * by its name and by its real path (a junction or link followed), and a
 * store key dated after DATA END. No exam freeze exists yet, so nothing
 * opens them; the exam's build adds the opening.
 */
import { realpathSync } from "node:fs";
import path from "node:path";
import { DATA_END } from "../waveh/instants.js";
import { keyDate } from "../waveh/keys.js";

export class SealedError extends Error {}

const SEALED: readonly (readonly [string, string])[] = [
  ["fresh", "store"],
  ["analyzer", "fresh"],
];

/** A path as the system resolves it: its longest existing part's real path (junctions and links followed), the rest as written. */
function realOf(file: string): string {
  const full = path.resolve(file);
  try {
    return realpathSync.native(full);
  } catch {
    const parent = path.dirname(full);
    return parent === full
      ? full
      : path.join(realOf(parent), path.basename(full));
  }
}

/** Whether a resolved path lies in a sealed folder (case aside, as Windows reads paths). */
function sealed(p: string): boolean {
  const parts = p.split(/[\\/]+/).map((x) => x.toLowerCase());
  for (let i = 0; i + 1 < parts.length; i++)
    for (const [a, b] of SEALED)
      if (parts[i] === a && parts[i + 1] === b) return true;
  return false;
}

/** Refuses a path inside a sealed folder by its name, else by its real path: a path sealed by its name is never resolved, so nothing of FRESH is touched. */
export function checkPath(file: string): void {
  if (sealed(path.resolve(file)) || sealed(realOf(file)))
    throw new SealedError(
      `${file}: FRESH is sealed until the polishing's exam is frozen`,
    );
}

/** Refuses a store key dated after DATA END, or whose date does not parse. */
export function checkKey(key: string): void {
  const t = keyDate(key);
  if (t === null) throw new SealedError(`${key}: no date that parses`);
  if (t > DATA_END)
    throw new SealedError(
      `${key}: dated after DATA END, FRESH's months, sealed until the polishing's exam is frozen`,
    );
}
