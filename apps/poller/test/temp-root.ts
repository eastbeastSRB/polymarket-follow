/**
 * vitest's globalSetup: one folder per test run, removed at its end, so the
 * tests' temporary folders never pile up in %TEMP% (TEST-TEMP, decisions
 * 2026-11-18). `setup` points TEMP, TMP and TMPDIR at the run's folder before
 * vitest forks its workers, which copy the environment, so every `tmpdir()`
 * in a test lands inside it. A run that crashed leaves its folder behind; the
 * next run removes it once it is older than six hours, never sooner: another
 * session's run may be in progress.
 */
import { lstatSync, mkdtempSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

export const RUN_PREFIX = "polymarket-follow-tests-";
export const STALE_MS = 6 * 3_600_000;

/** Deletes a folder and all it holds; a junction or link inside is removed, never followed (test/temp-root.test.ts). */
export function removeTree(dir: string): void {
  rmSync(dir, { recursive: true, force: true, maxRetries: 10 });
}

/** Removes the run folders in `root` last changed `STALE_MS` or more before `now`: real folders only, never a link. */
export function sweepStale(root: string, now: number): string[] {
  const removed: string[] = [];
  for (const name of readdirSync(root)) {
    if (!name.startsWith(RUN_PREFIX)) continue;
    const at = path.join(root, name);
    // Another session's sweep may have removed it since the listing.
    const st = lstatSync(at, { throwIfNoEntry: false });
    if (st === undefined || !st.isDirectory()) continue;
    if (now - st.mtimeMs < STALE_MS) continue;
    removeTree(at);
    removed.push(at);
  }
  return removed;
}

export default function setup(): () => void {
  const root = tmpdir();
  sweepStale(root, Date.now());
  const run = mkdtempSync(path.join(root, RUN_PREFIX));
  for (const name of ["TEMP", "TMP", "TMPDIR"]) process.env[name] = run;
  return () => removeTree(run);
}
