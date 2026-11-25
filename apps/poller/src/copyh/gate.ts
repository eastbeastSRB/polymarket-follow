/**
 * COPY-H's gate (the plan's C0; the exam's gate, polish/exam/gate.ts, as the
 * pattern). S opens only when `copyh/FROZEN.sha256` lists every file of what
 * runs, each with its hash, and the git tag its header names (`# tag
 * copyh-freeze-<n>`) holds this very list, byte for byte: an untagged or
 * locally edited list opens nothing. What runs: the program
 * (`dist/copyh.js`, `dist/copyh/`), the compiled files of other programs
 * its imports reach (`COPYH_CLOSURE`, exactly: a test walks the imports; each
 * equal to its own program's freeze), the vendored kit, lz4js's three files
 * and `copyh/`. `dist/schedule.js` and `dist/log.js` are shared, unfrozen,
 * their hashes logged at each start.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { sha256 } from "./run.js";
import type { Seal } from "./seal.js";

export const FROZEN_FILE = "copyh/FROZEN.sha256";

/** The compiled files of other programs that COPY-H's imports reach, exactly (test/copyh-gate.test.ts walks them). */
export const COPYH_CLOSURE = ["dist/waveh/instants.js", "dist/waveh/keys.js"];

/** lz4js 0.2.0's files (WAVE-H's decoder, behind its pinned hashes). */
export const LZ4JS_FILES = ["lz4.js", "util.js", "xxh32.js"].map(
  (f) => `node_modules/lz4js/${f}`,
);

/** The files COPY-H reads, required in the list by name even when its folder lacks them. */
export const COPYH_FILES = [
  "copyh/rules.md",
  "copyh/coins.json",
  "copyh/dirs.json",
  "copyh/data.sha256",
  "copyh/funding.sha256",
  "copyh/unpaired.json",
];

/** What runs: every file under these, relative to the package root, must be listed. */
export const SCOPE: readonly string[] = [
  "dist/copyh.js",
  "dist/copyh",
  ...COPYH_CLOSURE,
  "research",
  ...LZ4JS_FILES,
  "copyh",
];

const TAG_LINE = /^# tag (copyh-freeze-[1-9][0-9]*)$/;
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
export function frozenFiles(root: string): string[] {
  return SCOPE.flatMap((scope) => filesUnder(root, scope)).filter(
    (file) => !file.startsWith("copyh/FROZEN"),
  );
}

/** The list's bytes as the tag holds them, or why not: git has no such tag or file there, or git could not run (not on the PATH, or it timed out). */
export function taggedList(root: string, tag: string): Buffer | string {
  try {
    return execFileSync("git", ["show", `${tag}:./${FROZEN_FILE}`], {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 30_000,
    });
  } catch (err) {
    // git's own refusal carries its exit status; a git that never ran or was stopped has none.
    return typeof (err as { status?: unknown }).status === "number"
      ? `the tag ${tag} does not hold ${FROZEN_FILE}`
      : `git could not show the tag's list (${(err as Error).message})`;
  }
}

export type Freeze =
  | { ok: true; sha256: string; files: number; tag: string }
  | { ok: false; problems: string[] };

/** COPY-H's freeze at `root` (the repository's `apps/poller`): the list, every file of what runs, and the tag. */
export function verifyFreeze(root: string): Freeze {
  const listFile = path.join(root, FROZEN_FILE);
  if (!existsSync(listFile))
    return { ok: false, problems: [`no ${FROZEN_FILE}`] };
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
    ...frozenFiles(root),
    ...COPYH_CLOSURE,
    ...LZ4JS_FILES,
    ...COPYH_FILES,
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
      `${tags.length} tag lines ("# tag copyh-freeze-<n>") in ${FROZEN_FILE}, not one`,
    );
  else {
    const held = taggedList(root, tag);
    if (typeof held === "string") problems.push(held);
    else if (!held.equals(list))
      problems.push(`the tag ${tag} holds another ${FROZEN_FILE}`);
  }
  return problems.length > 0 || tag === null
    ? { ok: false, problems }
    : { ok: true, sha256: sha256(list), files: want.size, tag };
}

/** The steps whose seal the gate gives. */
export type Step = "1" | "2";

/** The seal a step's readers take: S open only for step 2 on a verified, tagged freeze. */
export const sealOf = (freeze: Freeze, step: Step): Seal => ({
  sOpen: freeze.ok && step === "2",
});
