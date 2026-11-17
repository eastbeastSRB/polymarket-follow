/**
 * FRESH stays sealed until the polishing's exam is frozen (the plan 3.7 and
 * 4.2(6); decisions 2026-11-17, the plan approved): every reader of the
 * analyzer refuses, before it opens anything, a path inside FRESH's raw
 * store (`…\FRESH\store`) or the analyzer's FRESH folder (`…\ANALYZER\FRESH`),
 * and a store key dated after DATA END. No exam freeze exists yet, so
 * nothing opens them; the exam's build adds the opening.
 */
import path from "node:path";
import { DATA_END } from "../waveh/instants.js";
import { keyDate } from "../waveh/keys.js";

export class SealedError extends Error {}

const SEALED: readonly (readonly [string, string])[] = [
  ["fresh", "store"],
  ["analyzer", "fresh"],
];

/** Refuses a path inside a sealed folder (case aside, as Windows reads paths). */
export function checkPath(file: string): void {
  const parts = path
    .resolve(file)
    .split(/[\\/]+/)
    .map((p) => p.toLowerCase());
  for (let i = 0; i + 1 < parts.length; i++)
    for (const [a, b] of SEALED)
      if (parts[i] === a && parts[i + 1] === b)
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
