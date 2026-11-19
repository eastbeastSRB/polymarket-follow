/**
 * FRESH stays sealed until the polishing's exam is frozen (the plan 3.7 and
 * 4.2(6); decisions 2026-11-17, the plan approved): every reader of the
 * analyzer refuses, before it opens anything, a path inside FRESH's raw
 * store (`…\FRESH\store`) or the analyzer's FRESH folder (`…\ANALYZER\FRESH`),
 * by its name and by its real path (a junction or link followed), and a
 * store key dated after DATA END. Only the exam's gate opens them
 * (exam/gate.ts: its freeze list verified and held by the tag it names;
 * decisions 2026-11-19, POLISH-RULES's plan ruled, Q1). A key dated at or
 * after FRESH_END is refused, open or closed.
 */
import { realpathSync } from "node:fs";
import path from "node:path";
import { DATA_END } from "../waveh/instants.js";
import { keyDate } from "../waveh/keys.js";

export class SealedError extends Error {}

/** The seal's state. Only the exam's gate opens it (exam/gate.ts `sealOf`); its field is the exam's own, so WAVE-H's gate (`{ open }`) never passes for it. */
export type Seal = { readonly examFrozen: boolean };
/** The seal closed: every reader's default. */
export const SEALED: Seal = { examFrozen: false };

/** FRESH's end, the download's (tools/waveh-fetch.cjs FRESH_END; decisions 2026-11-17, FRESH-FETCH): no key dated at or after it is opened. */
export const FRESH_END = Date.parse("2026-11-16T00:00:00Z");

const SEALED_FOLDERS: readonly (readonly [string, string])[] = [
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
    for (const [a, b] of SEALED_FOLDERS)
      if (parts[i] === a && parts[i + 1] === b) return true;
  return false;
}

/** Refuses, while the seal is closed, a path inside a sealed folder by its name, else by its real path: a path sealed by its name is never resolved, so nothing of FRESH is touched. */
export function checkPath(file: string, seal: Seal = SEALED): void {
  if (seal.examFrozen) return;
  if (sealed(path.resolve(file)) || sealed(realOf(file)))
    throw new SealedError(
      `${file}: FRESH is sealed until the polishing's exam is frozen`,
    );
}

/** Refuses a store key whose date does not parse or is at or after FRESH_END, and, while the seal is closed, one dated after DATA END. */
export function checkKey(key: string, seal: Seal = SEALED): void {
  const t = keyDate(key);
  if (t === null) throw new SealedError(`${key}: no date that parses`);
  if (t >= FRESH_END)
    throw new SealedError(
      `${key}: dated at or after FRESH_END, after every month the exam reads`,
    );
  if (t > DATA_END && !seal.examFrozen)
    throw new SealedError(
      `${key}: dated after DATA END, FRESH's months, sealed until the polishing's exam is frozen`,
    );
}
