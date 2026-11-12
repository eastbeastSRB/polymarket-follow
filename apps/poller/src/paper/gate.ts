/**
 * The blind gate (PAPER-PLAN-REVIEW F6): nothing at or after the cut is
 * asked of the API until a valid freeze exists. Every request of the
 * experiment names its window and passes `checkWindow` first. A freeze is
 * valid when `experiment/FROZEN.sha256` lists every file of what runs — the
 * program (`dist/paper.js`, `dist/paper/`), the vendored research files and
 * the experiment's frozen files — and each one has its listed hash (F4).
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { CUT } from "./instants.js";

export class BlindGateError extends Error {}

export type Gate = { readonly open: boolean };

/** Refuses a window that reaches the cut while the gate is closed. */
export function checkWindow(
  gate: Gate,
  start: number,
  end: number,
  what: string,
): void {
  if (!(start < end)) throw new Error(`${what}: an empty window`);
  if (end > CUT && !gate.open) {
    throw new BlindGateError(
      `${what}: the window [${new Date(start).toISOString()}, ${new Date(end).toISOString()}) reaches the cut, and no valid freeze exists`,
    );
  }
}

export const FROZEN_FILE = "experiment/FROZEN.sha256";
/** What runs: every file under these, relative to the package root, must be listed. */
export const FROZEN_SCOPE = [
  "dist/paper.js",
  "dist/paper",
  "research",
  "experiment",
] as const;

export type Freeze =
  | { ok: true; sha256: string; files: number }
  | { ok: false; problems: string[] };

const sha256 = (bytes: Buffer): string =>
  createHash("sha256").update(bytes).digest("hex");

function filesUnder(root: string, rel: string): string[] {
  const full = path.join(root, rel);
  if (!existsSync(full)) return [];
  if (!statSync(full).isDirectory()) return [rel];
  return readdirSync(full)
    .sort()
    .flatMap((name) => filesUnder(root, `${rel}/${name}`));
}

/** The freeze of the package at `root` (the repository's `apps/poller`, or the run copy's folder). */
export function verifyFreeze(root: string): Freeze {
  const listFile = path.join(root, FROZEN_FILE);
  if (!existsSync(listFile))
    return { ok: false, problems: [`no ${FROZEN_FILE}`] };
  const list = readFileSync(listFile);
  const want = new Map<string, string>();
  for (const line of list.toString("utf8").split("\n")) {
    const m = /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim());
    if (m) want.set(m[2]!, m[1]!);
  }
  const problems: string[] = [];
  for (const scope of FROZEN_SCOPE) {
    for (const file of filesUnder(root, scope)) {
      // The list itself, and a draft of it, are not part of what it hashes.
      if (file.startsWith("experiment/FROZEN")) continue;
      if (!want.has(file)) problems.push(`not in the freeze: ${file}`);
    }
  }
  for (const [file, hash] of want) {
    const full = path.join(root, file);
    const got = existsSync(full) ? sha256(readFileSync(full)) : null;
    if (got !== hash)
      problems.push(`${got === null ? "missing" : "changed"}: ${file}`);
  }
  if (want.size === 0) problems.push(`${FROZEN_FILE} lists no file`);
  return problems.length > 0
    ? { ok: false, problems }
    : { ok: true, sha256: sha256(list), files: want.size };
}
