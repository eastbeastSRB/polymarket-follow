/**
 * The exam's gate (polish/rules.md P0; decisions 2026-11-19, POLISH-RULES's
 * plan ruled, Q1). FRESH opens only when `polish/FROZEN.sha256` lists every
 * file of what runs, each with its hash, and the git tag its header names
 * (`# tag polish-freeze-<n>`) holds this very list, byte for byte: an
 * untagged or locally edited list cannot open FRESH. What runs: the program
 * (`dist/polish.js`, `dist/polish/`), the compiled files of WAVE-H, MARKET-1
 * and the paper experiment its imports reach (each equal to its own freeze,
 * which tools/polish-freeze.cjs checks), the vendored kit, lz4js's three
 * files, `polish/`, and WAVE-H's data list, coins and sizing, which the exam
 * reads. `dist/schedule.js` and `dist/log.js` are shared, unfrozen, their
 * hashes logged at each start (WAVE-H's H0).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { LZ4JS_FILES, sha256 } from "../../waveh/gate.js";
import type { Seal } from "../seal.js";

export const EXAM_FROZEN_FILE = "polish/FROZEN.sha256";

/** WAVE-H's, MARKET-1's and the paper experiment's compiled files the exam's imports reach, exactly (test/polish-exam-gate.test.ts walks them). */
export const EXAM_CLOSURE = [
  "dist/market1/book.js",
  "dist/market1/fills.js",
  "dist/market1/lines.js",
  "dist/market1/price.js",
  "dist/market1/stats.js",
  "dist/market1/summary.js",
  "dist/market1/waves.js",
  "dist/paper/instants.js",
  "dist/paper/research.js",
  "dist/paper/stats.js",
  "dist/waveh/books.js",
  "dist/waveh/coins.js",
  "dist/waveh/ctxs.js",
  "dist/waveh/fills.js",
  "dist/waveh/funding.js",
  "dist/waveh/gate.js",
  "dist/waveh/instants.js",
  "dist/waveh/keys.js",
  "dist/waveh/legs.js",
  "dist/waveh/look.js",
  "dist/waveh/lz4.js",
  "dist/waveh/market.js",
  "dist/waveh/pass.js",
  "dist/waveh/positions.js",
  "dist/waveh/price.js",
  "dist/waveh/rehearse.js",
  "dist/waveh/report.js",
  "dist/waveh/run.js",
  "dist/waveh/slices.js",
  "dist/waveh/store.js",
  "dist/waveh/verdict.js",
];

/** The files the exam reads, required in the list by name even when a folder lacks them. */
export const EXAM_FILES = [
  "polish/rules.md",
  "polish/cuts.json",
  "polish/known-unpaired.json",
  "polish/tries.md",
  "polish/fresh.sha256",
  "polish/fresh-unpaired.json",
  "waveh/data.sha256",
  "waveh/coins.json",
  "waveh/sizing.json",
];

/** What runs: every file under these, relative to the package root, must be listed. */
export const EXAM_SCOPE: readonly string[] = [
  "dist/polish.js",
  "dist/polish",
  ...EXAM_CLOSURE,
  "research",
  ...LZ4JS_FILES,
  "polish",
  "waveh/data.sha256",
  "waveh/coins.json",
  "waveh/sizing.json",
];

/** The header line naming the tag that must hold the list. */
const TAG_LINE = /^# tag (polish-freeze-[1-9][0-9]*)$/;
const HASH_LINE = /^([0-9a-f]{64}) \*(.+)$/;

function filesUnder(root: string, rel: string): string[] {
  const full = path.join(root, rel);
  if (!existsSync(full)) return [];
  if (!statSync(full).isDirectory()) return [rel];
  return readdirSync(full)
    .sort()
    .flatMap((name) => filesUnder(root, `${rel}/${name}`));
}

/** The files of what runs at `root`, as the freeze tool lists them (the list and its draft left out). */
export function examFiles(root: string): string[] {
  return EXAM_SCOPE.flatMap((scope) => filesUnder(root, scope)).filter(
    (file) => !file.startsWith("polish/FROZEN"),
  );
}

/** The list's bytes as the tag holds them, or null when git has no such tag or file there. */
export function taggedList(root: string, tag: string): Buffer | null {
  try {
    return execFileSync("git", ["show", `${tag}:./${EXAM_FROZEN_FILE}`], {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 30_000,
    });
  } catch {
    return null;
  }
}

export type ExamFreeze =
  | { ok: true; sha256: string; files: number; tag: string }
  | { ok: false; problems: string[] };

/** The exam's freeze at `root` (the repository's `apps/poller`): the list, every file of what runs, and the tag. */
export function verifyExamFreeze(root: string): ExamFreeze {
  const listFile = path.join(root, EXAM_FROZEN_FILE);
  if (!existsSync(listFile))
    return { ok: false, problems: [`no ${EXAM_FROZEN_FILE}`] };
  const list = readFileSync(listFile);
  const want = new Map<string, string>();
  const tags: string[] = [];
  for (const line of list.toString("utf8").split("\n")) {
    const m = HASH_LINE.exec(line.trim());
    if (m) want.set(m[2]!, m[1]!);
    const t = TAG_LINE.exec(line);
    if (t) tags.push(t[1]!);
  }
  const problems: string[] = [];
  for (const file of new Set([
    ...examFiles(root),
    ...EXAM_CLOSURE,
    ...LZ4JS_FILES,
    ...EXAM_FILES,
  ]))
    if (!want.has(file)) problems.push(`not in the freeze: ${file}`);
  for (const [file, hash] of want) {
    const full = path.join(root, file);
    const got = existsSync(full) ? sha256(readFileSync(full)) : null;
    if (got !== hash)
      problems.push(`${got === null ? "missing" : "changed"}: ${file}`);
  }
  const tag = tags.length === 1 ? tags[0]! : null;
  if (tag === null)
    problems.push(
      `${tags.length} tag lines ("# tag polish-freeze-<n>") in ${EXAM_FROZEN_FILE}, not one`,
    );
  else {
    const held = taggedList(root, tag);
    if (held === null)
      problems.push(`the tag ${tag} does not hold ${EXAM_FROZEN_FILE}`);
    else if (!held.equals(list))
      problems.push(`the tag ${tag} holds another ${EXAM_FROZEN_FILE}`);
  }
  return problems.length > 0 || tag === null
    ? { ok: false, problems }
    : { ok: true, sha256: sha256(list), files: want.size, tag };
}

/** The seal FRESH's readers take: open only on a verified, tagged freeze. */
export const sealOf = (freeze: ExamFreeze): Seal => ({
  examFrozen: freeze.ok,
});
