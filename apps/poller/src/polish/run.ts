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
import { FrozenDiffer, RENAME_PAUSE_MS, RENAME_TRIES } from "../waveh/run.js";
import { StoreError } from "../waveh/store.js";
import { SealedError } from "./seal.js";

/** A gate of the store failed (exit 6). */
export class GateFailed extends Error {}

/** The program's exit for an error, and its log line: 4 WAVE-H's freeze does not verify; 5 not ready (a store file missing, differing or failing; a sealed path; the store not trusted); 6 a gate failed; 1 a crash. */
export function exitOf(err: unknown): { code: 1 | 4 | 5 | 6; event: string } {
  if (err instanceof FrozenDiffer)
    return { code: 4, event: "WAVE-H's freeze does not verify" };
  if (err instanceof StoreError || err instanceof SealedError)
    return { code: 5, event: "not ready" };
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
