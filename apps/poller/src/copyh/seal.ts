/**
 * COPY-H's seals (copyh/rules.md C0, "the seals"). Every reader refuses,
 * before it opens anything:
 * - always: a key whose date does not parse, and any key, fill, row or
 *   minute at or after END_F2; a path in an `ANALYZER` folder (COPY-H reads
 *   raw stores only; the analyzer's `liq` holds `closedPnl`);
 * - until step 2: a path in FRESH's raw store (`…\FRESH\store`) or COPY-H's
 *   S folder (`…\COPY-H\S`), and a key, fill, row or minute at or after
 *   END_E (S's months); so step 1 reads the funding store's rows before
 *   END_E only;
 * - until FRESH-2's freeze: a path in a `FRESH-2` folder and a key, fill,
 *   row or minute at or after END_S (RM7);
 * - a path outside the run's roots, the folders its settings name
 *   (`checkInside`): so no other program's data, run folder, backups or
 *   holdout files, and no other project, is ever reached, even through a
 *   junction inside a root (D15: the reproduction's one more root is the
 *   paper's seed folder).
 * A path is checked by its name first, then by its real path (a junction or
 * link followed); a path sealed by its name is never resolved, so nothing of
 * it is touched. Only the gate opens S and FRESH-2 (gate.ts `sealOf`: a
 * verified freeze of the command's kind). Nothing is ever written in
 * COPYH-FUNDING's `COPY-H\funding`.
 */
import { realpathSync } from "node:fs";
import path from "node:path";
import { keyDate } from "../waveh/keys.js";
import { END_E, END_F2, END_S } from "./design.js";

export class SealedError extends Error {}

/** The seal's state; only the gate opens it (gate.ts `sealOf`): S at step 2, S and FRESH-2 at FRESH-2's stage. */
export type Seal = { readonly sOpen: boolean; readonly f2Open: boolean };
/** S and FRESH-2 closed: every reader's default. */
export const SEALED: Seal = { sOpen: false, f2Open: false };

/** Folders sealed always, wherever they are. */
const ALWAYS: readonly (readonly string[])[] = [["analyzer"]];
/** Folders sealed until step 2: a name inside another. */
const UNTIL_STEP_2: readonly (readonly string[])[] = [
  ["fresh", "store"],
  ["copy-h", "s"],
];
/** Folders sealed until FRESH-2's freeze. */
const UNTIL_FRESH_2: readonly (readonly string[])[] = [["fresh-2"]];

const partsOf = (p: string) => p.split(/[\\/]+/).map((x) => x.toLowerCase());

/** The first of `folders` that `parts` passes through, or null. */
function within(
  parts: readonly string[],
  folders: readonly (readonly string[])[],
): readonly string[] | null {
  for (const f of folders)
    for (let i = 0; i + f.length <= parts.length; i++)
      if (f.every((name, k) => parts[i + k] === name)) return f;
  return null;
}

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

/** Why a resolved path is sealed, or null. */
function sealedBy(p: string, seal: Seal): string | null {
  const parts = partsOf(p);
  const always = within(parts, ALWAYS);
  if (always !== null) return `in ${always.join("\\")}, sealed always`;
  const f2 = seal.f2Open ? null : within(parts, UNTIL_FRESH_2);
  if (f2 !== null)
    return `in FRESH-2 (${f2.join("\\")}), sealed until FRESH-2's freeze`;
  const s = seal.sOpen ? null : within(parts, UNTIL_STEP_2);
  return s === null ? null : `in S (${s.join("\\")}), sealed until step 2`;
}

/** Refuses a sealed path, by its name, else by its real path. */
export function checkPath(file: string, seal: Seal = SEALED): void {
  const byName = sealedBy(path.resolve(file), seal);
  if (byName !== null) throw new SealedError(`${file}: ${byName}`);
  const byReal = sealedBy(realOf(file), seal);
  if (byReal !== null)
    throw new SealedError(`${file}: ${byReal}, by its real path`);
}

/** Whether `a` lies in `b` (or is `b`), as Windows compares paths. */
const isIn = (a: string, b: string) => {
  const rel = path.relative(b, a);
  return !rel.startsWith("..") && !path.isAbsolute(rel);
};

/** Refuses a path outside every one of the run's roots, by its name, else by its real path (a junction inside a root that leads out of it). */
export function checkInside(file: string, roots: readonly string[]): void {
  const full = path.resolve(file);
  if (!roots.some((r) => isIn(full, path.resolve(r))))
    throw new SealedError(`${file}: outside the run's folders`);
  const real = realOf(file);
  if (!roots.some((r) => isIn(real, realOf(r))))
    throw new SealedError(
      `${file}: outside the run's folders, by its real path`,
    );
}

/** The first instant the seal refuses: END_E closed, END_S with S open, END_F2 with FRESH-2 open. */
export const endOf = (seal: Seal): number =>
  seal.f2Open ? END_F2 : seal.sOpen ? END_S : END_E;

/** Why an instant is sealed, or null. */
function instantSealed(t: number, seal: Seal): string | null {
  if (t >= END_F2) return "at or after END_F2, sealed always";
  if (t >= END_S && !seal.f2Open)
    return "at or after END_S, FRESH-2's months, sealed until FRESH-2's freeze";
  if (t >= END_E && !seal.sOpen)
    return "at or after END_E, S's months, sealed until step 2";
  return null;
}

/** Refuses a fill, row or minute at an instant the seal closes (a reader's check on what it parsed). */
export function checkInstant(t: number, what: string, seal: Seal): void {
  const why = instantSealed(t, seal);
  if (why !== null)
    throw new SealedError(`${what} at ${new Date(t).toISOString()}: ${why}`);
}

/** Refuses a store key whose date does not parse, and one dated at an instant the seal closes. */
export function checkKey(key: string, seal: Seal = SEALED): void {
  const t = keyDate(key);
  if (t === null) throw new SealedError(`${key}: no date that parses`);
  const why = instantSealed(t, seal);
  if (why !== null) throw new SealedError(`${key}: dated ${why}`);
}

/** Refuses a folder COPY-H would write in: a sealed one, or one in COPYH-FUNDING's `COPY-H\funding`, by its name or its real path. */
export function checkWrite(dir: string, seal: Seal = SEALED): void {
  checkPath(dir, seal);
  for (const p of [path.resolve(dir), realOf(dir)])
    if (within(partsOf(p), [["copy-h", "funding"]]) !== null)
      throw new SealedError(
        `${dir}: in COPY-H\\funding, COPYH-FUNDING's: never written`,
      );
}
