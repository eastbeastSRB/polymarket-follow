/**
 * How WAVE-H runs (rules.md H0, H15): its settings, with no defaults; the
 * windows in which no heavy work runs (02:30–06:00Z and 10:25–11:15Z, the
 * other programs' runs); the hashes of the shared files it imports, logged
 * at each start (information, not a stop, as MARKET-1's M0); its whole-file
 * writes; its exit codes.
 */
import { createHash } from "node:crypto";
import {
  closeSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { z } from "zod";
import { DAY_MS, MINUTE_MS } from "../schedule.js";
import { BooksNeeded } from "./legs.js";
import { StoreError } from "./store.js";

/** The run cannot start: WAVE-H's freeze is not valid (exit 4). */
export class FrozenDiffer extends Error {}
/** `look/result.json` exists: the one look has run (exit 5). */
export class AlreadyRun extends Error {}

/** The program's exit for an error and its log line (H15's Runs): 4 frozen files differ; 5 not ready (books needed, a store file missing or failing, a hold) or already run; 1 a crash. */
export function exitOf(err: unknown): { code: 1 | 4 | 5; event: string } {
  if (err instanceof FrozenDiffer)
    return { code: 4, event: "frozen files differ" };
  if (err instanceof BooksNeeded) return { code: 5, event: "books needed" };
  if (err instanceof AlreadyRun) return { code: 5, event: "already run" };
  if (err instanceof StoreError) return { code: 5, event: "not ready" };
  return { code: 1, event: "crash" };
}

const absolute = z
  .string()
  .refine((p) => path.isAbsolute(p), "not an absolute path");

/** WAVEH_STORE (the download's store, read only) and WAVEH_ROOT (the program's own files), neither inside the other. */
export const Settings = z
  .object({ WAVEH_STORE: absolute, WAVEH_ROOT: absolute })
  .refine(
    (s) => {
      const inside = (a: string, b: string) => {
        const rel = path.relative(b, a);
        return !rel.startsWith("..") && !path.isAbsolute(rel);
      };
      return (
        !inside(s.WAVEH_ROOT, s.WAVEH_STORE) &&
        !inside(s.WAVEH_STORE, s.WAVEH_ROOT)
      );
    },
    {
      message: "must lie outside WAVEH_STORE, and WAVEH_STORE outside it",
      path: ["WAVEH_ROOT"],
    },
  );
export type Settings = z.infer<typeof Settings>;

/** The UTC minutes of the day in which WAVE-H starts no file: 02:30–06:00 and 10:25–11:15. */
export const WINDOWS: readonly (readonly [number, number])[] = [
  [150, 360],
  [625, 675],
];

/** The end of the window `now` falls in, or null. */
export function windowEnd(now: number): number | null {
  const day = Math.floor(now / DAY_MS) * DAY_MS;
  const minute = Math.floor((now - day) / MINUTE_MS);
  for (const [from, to] of WINDOWS)
    if (minute >= from && minute < to) return day + to * MINUTE_MS;
  return null;
}

/** A refused rename is tried again once a second, 10 times in all. */
export const RENAME_TRIES = 10;
export const RENAME_PAUSE_MS = 1_000;

const pause = (ms: number) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/**
 * Written whole to `<file>.tmp`, flushed, then renamed over the file; a
 * rename refused (on Windows, while a reader holds the file) is tried again
 * before the error is thrown. A copy of MARKET-1's `writeWhole`
 * (market1/run.ts; MARKET-PLAN-REVIEW F2), so that no MARKET-1 process file
 * joins WAVE-H's frozen closure (decisions 2026-11-16, WAVE-H-FIX's calls).
 */
export function writeWhole(
  file: string,
  bytes: Buffer | string,
  tries = RENAME_TRIES,
  pauseMs = RENAME_PAUSE_MS,
): void {
  mkdirSync(path.dirname(file), { recursive: true });
  const fd = openSync(`${file}.tmp`, "w");
  try {
    writeFileSync(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  for (let i = 1; ; i++) {
    try {
      renameSync(`${file}.tmp`, file);
      return;
    } catch (err) {
      if (i >= tries) throw err;
      pause(pauseMs);
    }
  }
}

/** The shared files the program imports, unfrozen (R4): their hashes for the run's log. */
export function sharedHashes(packageRoot: string): Record<string, string> {
  return Object.fromEntries(
    ["dist/schedule.js", "dist/log.js"].map((f) => [
      f,
      createHash("sha256")
        .update(readFileSync(path.join(packageRoot, f)))
        .digest("hex"),
    ]),
  );
}
