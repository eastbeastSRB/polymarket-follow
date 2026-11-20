/**
 * How the polishing's program runs (the polishing plan 4.6; decisions
 * 2026-11-17, the plan approved, Q9): its settings, with no defaults; its
 * exit codes; the code's fingerprint (the hashes of `dist/polish`), which a
 * part and the manifest name; its bulk writes.
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { z } from "zod";
import { BooksNeeded } from "../waveh/legs.js";
import {
  AlreadyRun,
  FrozenDiffer,
  RENAME_PAUSE_MS,
  RENAME_TRIES,
} from "../waveh/run.js";
import { StoreError } from "../waveh/store.js";
import { SealedError } from "./seal.js";

/** A gate of the store failed (exit 6). */
export class GateFailed extends Error {}
/** The exam's freeze does not verify, so FRESH stays sealed (exit 4; the look's steps). */
export class ExamUnfrozen extends Error {}

/** The program's exit for an error, and its log line: 4 WAVE-H's freeze, or the exam's for the look's steps, does not verify; 5 not ready (a store file missing, differing or failing; a sealed path; the store not trusted; books needed; already run); 6 a gate or a check failed; 1 a crash. */
export function exitOf(err: unknown): { code: 1 | 4 | 5 | 6; event: string } {
  if (err instanceof FrozenDiffer)
    return { code: 4, event: "WAVE-H's freeze does not verify" };
  if (err instanceof ExamUnfrozen)
    return { code: 4, event: "the exam's freeze does not verify" };
  if (err instanceof StoreError || err instanceof SealedError)
    return { code: 5, event: "not ready" };
  if (err instanceof BooksNeeded) return { code: 5, event: "books needed" };
  if (err instanceof AlreadyRun) return { code: 5, event: "already run" };
  if (err instanceof GateFailed) return { code: 6, event: "a gate failed" };
  return { code: 1, event: "crash" };
}

const absolute = z
  .string()
  .refine((p) => path.isAbsolute(p), "not an absolute path");
const inside = (a: string, b: string) => {
  const rel = path.relative(b, a);
  return !rel.startsWith("..") && !path.isAbsolute(rel);
};
/** The last two folders of a path, as Windows compares them. */
const tail = (p: string) =>
  path
    .resolve(p)
    .split(/[\\/]+/)
    .slice(-2)
    .join("/")
    .toLowerCase();

/** WAVEH_STORE: WAVE-H's raw store (`…\WAVE-H\store`), read only; ANALYZER_ROOT: the analyzer's folder of the range, outside it. */
export const ExtractSettings = z
  .object({ WAVEH_STORE: absolute, ANALYZER_ROOT: absolute })
  .refine((s) => tail(s.WAVEH_STORE) === "wave-h/store", {
    message: "is not WAVE-H's raw store (…\\WAVE-H\\store)",
    path: ["WAVEH_STORE"],
  })
  .refine(
    (s) =>
      !inside(s.ANALYZER_ROOT, s.WAVEH_STORE) &&
      !inside(s.WAVEH_STORE, s.ANALYZER_ROOT),
    {
      message: "must lie outside WAVEH_STORE, and WAVEH_STORE outside it",
      path: ["ANALYZER_ROOT"],
    },
  );

const pause = (ms: number) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/**
 * A part or a store column, written as WAVE-H's `writeWhole` writes (to
 * `<file>.tmp`, then renamed over the file, a refused rename tried again)
 * but not flushed: on F:, a hard disk, the flushes cost about 13% of the
 * whole run, and a hash already guards each such file (the part's payload
 * SHA-256, the manifest's of every column), so a torn one is refused, never
 * read (decisions 2026-11-18, EXTRACT-BUILD's technical calls, the fsync).
 */
export function writeUnflushed(
  file: string,
  bytes: Buffer,
  tries = RENAME_TRIES,
  pauseMs = RENAME_PAUSE_MS,
): void {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(`${file}.tmp`, bytes);
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

/** WAVEH_ROOT, for `gates`: WAVE-H's folder of the rehearsal and the look, whose files are the references (read only). */
export const LookSettings = z.object({ WAVEH_ROOT: absolute });

/** The exam's settings (polish/rules.md P15), no defaults: ANALYZER_ROOT, the ten months' folder (its trusted store, gates and exploration; read only), and EXAM_ROOT, the exam's own folder, neither inside the other. */
export const ExamSettings = z
  .object({ ANALYZER_ROOT: absolute, EXAM_ROOT: absolute })
  .refine(
    (s) =>
      !inside(s.EXAM_ROOT, s.ANALYZER_ROOT) &&
      !inside(s.ANALYZER_ROOT, s.EXAM_ROOT),
    {
      message: "must lie outside ANALYZER_ROOT, and ANALYZER_ROOT outside it",
      path: ["EXAM_ROOT"],
    },
  );

/** The reproduction's settings beside the exam's (THE PLAN D47, D50): WAVEH_STORE, WAVE-H's raw store (its fill files the extraction reads again, its books), and WAVEH_ROOT, WAVE-H's folder of the look; both read only, neither inside the exam's folder. */
export const ReproSettings = z
  .object({ WAVEH_STORE: absolute, WAVEH_ROOT: absolute, EXAM_ROOT: absolute })
  .refine((s) => tail(s.WAVEH_STORE) === "wave-h/store", {
    message: "is not WAVE-H's raw store (…\\WAVE-H\\store)",
    path: ["WAVEH_STORE"],
  })
  .refine(
    (s) =>
      [s.WAVEH_STORE, s.WAVEH_ROOT].every(
        (f) => !inside(s.EXAM_ROOT, f) && !inside(f, s.EXAM_ROOT),
      ),
    {
      message: "must lie outside EXAM_ROOT, and EXAM_ROOT outside them",
      path: ["WAVEH_STORE"],
    },
  );

/** The look's settings beside the exam's (THE PLAN D50): FRESH_STORE, FRESH's raw store (`…\FRESH\store`; its fill files, `asset_ctxs` days, funding windows and books), read only, outside the exam's folder. */
export const FreshSettings = z
  .object({ FRESH_STORE: absolute, EXAM_ROOT: absolute })
  .refine((s) => tail(s.FRESH_STORE) === "fresh/store", {
    message: "is not FRESH's raw store (…\\FRESH\\store)",
    path: ["FRESH_STORE"],
  })
  .refine(
    (s) =>
      !inside(s.EXAM_ROOT, s.FRESH_STORE) &&
      !inside(s.FRESH_STORE, s.EXAM_ROOT),
    {
      message: "must lie outside EXAM_ROOT, and EXAM_ROOT outside it",
      path: ["FRESH_STORE"],
    },
  );

/** The compiled program's files, `dist/polish.js` and `dist/polish/`: their paths and hashes, hashed again. */
export function fingerprintOf(packageRoot: string): string {
  const files: string[] = [];
  const walk = (rel: string) => {
    const full = path.join(packageRoot, rel);
    if (!existsSync(full)) return;
    if (statSync(full).isDirectory())
      for (const name of readdirSync(full).sort()) walk(`${rel}/${name}`);
    else files.push(rel);
  };
  walk("dist/polish.js");
  walk("dist/polish");
  const lines = files.map(
    (f) =>
      `${createHash("sha256")
        .update(readFileSync(path.join(packageRoot, f)))
        .digest("hex")} *${f}\n`,
  );
  return createHash("sha256").update(lines.join("")).digest("hex");
}
