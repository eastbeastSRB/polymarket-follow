/**
 * MARKET-1's two gates (rules.md M0). The freeze: a run goes on only when
 * `market1/FROZEN.sha256` lists every file of what runs — the program
 * (`dist/market1.js`, `dist/market1/`), the eleven paper files it imports or
 * reads with (MARKET-PLAN-REVIEW F8), the vendored research files and
 * `market1/` — each with its listed hash. The sealed data: every reader of
 * the recordings, the collector's rule book and the paper experiment's files
 * written after the cut takes a `Gate` and refuses first, before anything is
 * opened, a window that reaches the cut while the gate is closed; with the
 * gate closed it also refuses any datum at or after the cut.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { CUT } from "../paper/instants.js";
import { RESEARCH_ROOT } from "../paper/research.js";

/** The package's folder: the repository's `apps/poller`, or the run copy's. */
export const PACKAGE_ROOT = path.join(RESEARCH_ROOT, "..");

export const FROZEN_FILE = "market1/FROZEN.sha256";

/** The paper experiment's files MARKET-1 imports (eight) or reads what they write (three). */
export const PAPER_FILES = [
  "instants",
  "store",
  "routes",
  "rulebook",
  "market",
  "research",
  "seed",
  "stats",
  "loop",
  "reader",
  "reparse",
].map((name) => `dist/paper/${name}.js`);

/** What runs: every file under these, relative to the package root, must be listed. */
export const FROZEN_SCOPE: readonly string[] = [
  "dist/market1.js",
  "dist/market1",
  ...PAPER_FILES,
  "research",
  "market1",
];

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

/** The files of what runs at `root`, as the freeze tool lists them (the list and its draft left out). */
export function frozenFiles(root: string): string[] {
  return FROZEN_SCOPE.flatMap((scope) => filesUnder(root, scope)).filter(
    (file) => !file.startsWith("market1/FROZEN"),
  );
}

/** MARKET-1's freeze at `root` (the repository's `apps/poller`, or the run copy's folder). */
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
  // The eleven paper files are required even when a folder lacks them.
  for (const file of new Set([...frozenFiles(root), ...PAPER_FILES])) {
    if (!want.has(file)) problems.push(`not in the freeze: ${file}`);
  }
  for (const [file, hash] of want) {
    const full = path.join(root, file);
    const got = existsSync(full) ? sha256(readFileSync(full)) : null;
    if (got !== hash)
      problems.push(`${got === null ? "missing" : "changed"}: ${file}`);
  }
  return problems.length > 0
    ? { ok: false, problems }
    : { ok: true, sha256: sha256(list), files: want.size };
}

export class SealedError extends Error {}

/** Open only when MARKET-1's own freeze verified. */
export type Gate = { readonly open: boolean };

export const gateOf = (freeze: Freeze): Gate => ({ open: freeze.ok });

/** Refuses, before anything is opened, a read whose window ends after the cut while the gate is closed. */
export function checkSealed(gate: Gate, end: number, what: string): void {
  if (end > CUT && !gate.open) {
    throw new SealedError(
      `${what}: a read through ${new Date(end).toISOString()} reaches the cut, and MARKET-1's freeze is not valid`,
    );
  }
}

/** With the gate closed, a datum at or after the cut is refused. */
export function checkDatum(gate: Gate, t: number, what: string): void {
  if (t >= CUT && !gate.open) {
    throw new SealedError(
      `${what}: ${new Date(t).toISOString()} is at or after the cut, and MARKET-1's freeze is not valid`,
    );
  }
}
