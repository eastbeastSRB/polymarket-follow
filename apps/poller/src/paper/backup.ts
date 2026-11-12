/**
 * The experiment's own backup (decisions 2026-11-12, Q-F; PAPER-PLAN-REVIEW
 * F10): after each run, what cannot be read again — the state, the day logs
 * and manifests, the looks, the page — and the seed and the pre-cut panel it
 * stands on are copied to PAPER_BACKUP on another disk (E:). A file is copied
 * when the copy is missing or differs; nothing is ever deleted there. The raw
 * replies, the stored rows and the market-days can be read again (the API's
 * history, the raw files on F:), so they are not copied.
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
} from "node:fs";
import path from "node:path";

export const BACKED_UP = [
  "state.json",
  "log",
  "manifest",
  "looks",
  "page",
  "seed",
  "panel-precut",
] as const;

const sha256 = (file: string) =>
  createHash("sha256").update(readFileSync(file)).digest("hex");

function filesUnder(root: string, rel: string): string[] {
  const full = path.join(root, rel);
  if (!existsSync(full)) return [];
  if (!statSync(full).isDirectory()) return [rel];
  return readdirSync(full)
    .sort()
    .flatMap((n) => filesUnder(root, path.join(rel, n)));
}

/** Returns how many files were copied. */
export function backupPaper(root: string, dest: string): number {
  let copied = 0;
  for (const rel of BACKED_UP.flatMap((r) => filesUnder(root, r))) {
    const from = path.join(root, rel);
    const to = path.join(dest, rel);
    if (
      existsSync(to) &&
      statSync(to).size === statSync(from).size &&
      sha256(to) === sha256(from)
    )
      continue;
    mkdirSync(path.dirname(to), { recursive: true });
    copyFileSync(from, `${to}.tmp`);
    renameSync(`${to}.tmp`, to);
    copied += 1;
  }
  return copied;
}
