/**
 * How COPY-H's program runs (the plan's section 7; COPYH-STORE's plan,
 * approved 2026-11-25): its settings, with no defaults; its errors and exit
 * codes; a run's time (about 15 minutes, never in a closed window: the PC's
 * rule of 2026-11-25); the code's fingerprint (the hashes of `dist/copyh`),
 * which a part and a store name; its whole-file writes.
 */
import { createHash } from "node:crypto";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { DAY_MS, MINUTE_MS } from "../schedule.js";
import { CLOSED_WINDOWS, PART_MINUTES } from "./design.js";
import { SealedError } from "./seal.js";

/** The package's folder (the repository's `apps/poller`), from `src/copyh` or `dist/copyh` alike. */
export const PACKAGE_ROOT = fileURLToPath(new URL("../../", import.meta.url));

/** A file missing, differing or failing, an unknown coin or `dir`, a part set aside: not ready (exit 5). */
export class StoreError extends Error {}
/** The run's minutes are spent, or a closed window began: run again (exit 3). */
export class NotFinished extends Error {}
/** COPY-H's freeze does not verify (exit 4). */
export class FreezeDiffers extends Error {}
/** A step's output exists: it ran (exit 5). */
export class AlreadyRun extends Error {}
/** A gate of the store failed (exit 6). */
export class GateFailed extends Error {}
/** The two builds differ (exit 7): a fault in one, never repaired in code. */
export class BuildsDiffer extends Error {}

/** The program's exit for an error, and its log line. */
export function exitOf(err: unknown): {
  code: 1 | 3 | 4 | 5 | 6 | 7;
  event: string;
} {
  if (err instanceof NotFinished) return { code: 3, event: "not finished" };
  if (err instanceof FreezeDiffers)
    return { code: 4, event: "frozen files differ" };
  if (err instanceof StoreError || err instanceof SealedError)
    return { code: 5, event: "not ready" };
  if (err instanceof AlreadyRun) return { code: 5, event: "already run" };
  if (err instanceof GateFailed) return { code: 6, event: "a gate failed" };
  if (err instanceof BuildsDiffer)
    return { code: 7, event: "the two builds differ" };
  return { code: 1, event: "crash" };
}

const absolute = z
  .string()
  .refine((p) => path.isAbsolute(p), "not an absolute path");
const inside = (a: string, b: string) => {
  const rel = path.relative(b, a);
  return !rel.startsWith("..") && !path.isAbsolute(rel);
};
/** A path's last `n` folders, as Windows compares them. */
const tail = (p: string, n: number) =>
  path
    .resolve(p)
    .split(/[\\/]+/)
    .slice(-n)
    .join("/")
    .toLowerCase();

/**
 * COPYH_ROOT: COPY-H's folder (`…\COPY-H`), the only one written;
 * WAVEH_STORE: WAVE-H's raw store (`…\WAVE-H\store`), read only;
 * COPYH_FUNDING: COPYH-FUNDING's store (`…\COPY-H\funding`), read only;
 * FRESH_STORE: FRESH's raw store (`…\FRESH\store`), read only, step 2's.
 * None lies inside another, but the funding store may lie in COPYH_ROOT.
 */
export const Settings = z
  .object({
    COPYH_ROOT: absolute,
    WAVEH_STORE: absolute,
    COPYH_FUNDING: absolute.optional(),
    FRESH_STORE: absolute.optional(),
  })
  .refine((s) => tail(s.COPYH_ROOT, 1) === "copy-h", {
    message: "is not COPY-H's folder (…\\COPY-H)",
    path: ["COPYH_ROOT"],
  })
  .refine((s) => tail(s.WAVEH_STORE, 2) === "wave-h/store", {
    message: "is not WAVE-H's raw store (…\\WAVE-H\\store)",
    path: ["WAVEH_STORE"],
  })
  .refine(
    (s) =>
      s.COPYH_FUNDING === undefined ||
      tail(s.COPYH_FUNDING, 2) === "copy-h/funding",
    {
      message: "is not COPYH-FUNDING's store (…\\COPY-H\\funding)",
      path: ["COPYH_FUNDING"],
    },
  )
  .refine(
    (s) =>
      s.FRESH_STORE === undefined || tail(s.FRESH_STORE, 2) === "fresh/store",
    {
      message: "is not FRESH's raw store (…\\FRESH\\store)",
      path: ["FRESH_STORE"],
    },
  )
  .refine(
    (s) => {
      const all = [
        s.COPYH_ROOT,
        s.WAVEH_STORE,
        s.COPYH_FUNDING,
        s.FRESH_STORE,
      ].filter((p): p is string => p !== undefined);
      const allowed = (a: string, b: string) =>
        a === s.COPYH_FUNDING && b === s.COPYH_ROOT;
      return all.every((a, i) =>
        all.every((b, j) => i === j || allowed(a, b) || !inside(a, b)),
      );
    },
    {
      message:
        "COPYH_ROOT, WAVEH_STORE, COPYH_FUNDING and FRESH_STORE must lie outside each other, but the funding store in COPYH_ROOT",
      path: ["COPYH_ROOT"],
    },
  );
export type Settings = z.infer<typeof Settings>;

/** The end of the closed window `now` falls in, or null (WAVE-H's `windowEnd`, waveh/run.ts, on design.ts's windows, so that no WAVE-H process file joins COPY-H's closure). */
export function windowEnd(now: number): number | null {
  const day = Math.floor(now / DAY_MS) * DAY_MS;
  const minute = Math.floor((now - day) / MINUTE_MS);
  for (const [from, to] of CLOSED_WINDOWS)
    if (minute >= from && minute < to) return day + to * MINUTE_MS;
  return null;
}

/** A run's minutes when none are given: one less than a part's, so that the work in flight ends inside it. */
export const RUN_MINUTES = PART_MINUTES - 1;

/** A run's time: no new work starts once its minutes are spent or a closed window has begun. */
export function budgetOf(minutes: number, now: () => number = Date.now) {
  const until = now() + minutes * MINUTE_MS;
  return {
    /** Why no new work may start now, or null. */
    stop(): string | null {
      const t = now();
      const w = windowEnd(t);
      if (w !== null)
        return `a closed window, until ${new Date(w).toISOString()}`;
      return t >= until ? `its ${minutes} minutes are spent` : null;
    },
  };
}
export type Budget = ReturnType<typeof budgetOf>;

/** A refused rename is tried again once a second, 10 times in all. */
export const RENAME_TRIES = 10;
export const RENAME_PAUSE_MS = 1_000;

const pause = (ms: number) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function renameOver(file: string, tries: number, pauseMs: number): void {
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

/** Written whole to `<file>.tmp`, flushed, then renamed over the file, a refused rename tried again (a copy of WAVE-H's `writeWhole`, as WAVE-H's is of MARKET-1's). */
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
  renameOver(file, tries, pauseMs);
}

/** A part or a store column, written as `writeWhole` but not flushed: a hash guards each such file (the part's payload SHA-256, the manifest's of every column), so a torn one is refused, never read (the analyzer's rule, decisions 2026-11-18, EXTRACT-BUILD's technical calls). */
export function writeUnflushed(
  file: string,
  bytes: Buffer,
  tries = RENAME_TRIES,
  pauseMs = RENAME_PAUSE_MS,
): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(`${file}.tmp`, bytes);
  renameOver(file, tries, pauseMs);
}

export const sha256 = (bytes: Buffer | string): string =>
  createHash("sha256").update(bytes).digest("hex");

/** The compiled program's files, `dist/copyh.js` and `dist/copyh/`: their paths and hashes, hashed again. */
export function fingerprintOf(packageRoot: string): string {
  const files: string[] = [];
  const walk = (rel: string) => {
    const full = path.join(packageRoot, rel);
    if (!existsSync(full)) return;
    if (statSync(full).isDirectory())
      for (const name of readdirSync(full).sort()) walk(`${rel}/${name}`);
    else files.push(rel);
  };
  walk("dist/copyh.js");
  walk("dist/copyh");
  return sha256(
    files
      .map((f) => `${sha256(readFileSync(path.join(packageRoot, f)))} *${f}\n`)
      .join(""),
  );
}
