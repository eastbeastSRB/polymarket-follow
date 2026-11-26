/**
 * COPY-H's gate (copyh/rules.md C0; the exam's gate, polish/exam/gate.ts, as
 * the pattern). A step runs only when `copyh/FROZEN.sha256` lists every file
 * of what runs, each with its hash, and the git tag its header names (`# tag
 * copyh-freeze-<n>`) holds this very list, byte for byte; when the kit's
 * `checkKit()` returns its fingerprint and lib-exits its hash; and when the
 * list is of the kind the command asks for, by what it holds (RM2): step 1
 * a list without `copyh/look1.sha256`, the rounds the same with
 * `copyh/tries.json` allowed beside it, step 2 one with `look1.sha256` and
 * `choice.json` and no `fresh2.sha256`, FRESH-2's stage one with
 * `fresh2.sha256`, `funding2.sha256` and `look2.sha256`. An untagged or
 * locally edited list opens nothing. What runs: the program
 * (`dist/copyh.js`, `dist/copyh/`), the compiled files of other programs
 * its imports reach (`COPYH_CLOSURE`, the rules' D14 list: a test walks the
 * imports; each equal to its own program's freeze), the vendored kit,
 * lz4js's three files and `copyh/`. `dist/schedule.js` and `dist/log.js` are
 * shared, unfrozen, their hashes logged at each start.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { loadResearch } from "../paper/research.js";
import { sha256 } from "./run.js";
import type { Seal } from "./seal.js";

export const FROZEN_FILE = "copyh/FROZEN.sha256";

/** The compiled files of other programs that COPY-H's imports reach (C0; D14): the engine's `dist/paper/copy.js` and `stats.js` among them, and the reproduction's `seed.js` with its `routes.js` (C15 (a)). */
export const COPYH_CLOSURE = [
  "dist/paper/copy.js",
  "dist/paper/research.js",
  "dist/paper/routes.js",
  "dist/paper/seed.js",
  "dist/paper/stats.js",
  "dist/polish/lz4.js",
  "dist/polish/tables.js",
  "dist/waveh/instants.js",
  "dist/waveh/keys.js",
  "dist/waveh/lz4.js",
];

/** lz4js 0.2.0's files (WAVE-H's decoder, behind its pinned hashes). */
export const LZ4JS_FILES = ["lz4.js", "util.js", "xxh32.js"].map(
  (f) => `node_modules/lz4js/${f}`,
);

/** The files COPY-H reads, required in the list by name even when its folder lacks them (C0). */
export const COPYH_FILES = [
  "copyh/rules.md",
  "copyh/coins.json",
  "copyh/dirs.json",
  "copyh/data.sha256",
  "copyh/funding.sha256",
  "copyh/unpaired.json",
  "copyh/calibration.json",
  "copyh/rehearsal.json",
];

/** What runs: every file under these, relative to the package root, must be listed. */
const SCOPE: readonly string[] = [
  "dist/copyh.js",
  "dist/copyh",
  ...COPYH_CLOSURE,
  "research",
  ...LZ4JS_FILES,
  "copyh",
];

/** The commands that run under the gate. */
export const COMMANDS = [
  "step1",
  "tries",
  "choice",
  "step2",
  "fresh2",
] as const;
export type Command = (typeof COMMANDS)[number];

/** A command's kind of list (C0, RM2): the files it must hold and must lack, and those allowed beside it, unlisted. */
export const KINDS: Readonly<
  Record<
    Command,
    {
      holds: readonly string[];
      lacks: readonly string[];
      besides: readonly string[];
    }
  >
> = {
  step1: { holds: [], lacks: ["copyh/look1.sha256"], besides: [] },
  tries: {
    holds: [],
    lacks: ["copyh/look1.sha256"],
    besides: ["copyh/tries.json"],
  },
  choice: {
    holds: [],
    lacks: ["copyh/look1.sha256"],
    besides: ["copyh/tries.json"],
  },
  step2: {
    holds: ["copyh/look1.sha256", "copyh/choice.json"],
    lacks: ["copyh/fresh2.sha256"],
    besides: [],
  },
  fresh2: {
    holds: [
      "copyh/fresh2.sha256",
      "copyh/funding2.sha256",
      "copyh/look2.sha256",
    ],
    lacks: [],
    besides: [],
  },
};

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
  | {
      ok: true;
      sha256: string;
      files: number;
      tag: string;
      /** The command whose kind of list it was verified for; null: the list alone. */
      command: Command | null;
    }
  | { ok: false; problems: string[] };

/** COPY-H's freeze at `root` (the repository's `apps/poller`): the list, every file of what runs, and the tag; with a command, the list's kind too. */
export function verifyFreeze(
  root: string,
  command: Command | null = null,
): Freeze {
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
  const kind = command === null ? null : KINDS[command];
  const problems: string[] = [];
  for (const file of new Set([
    ...frozenFiles(root),
    ...COPYH_CLOSURE,
    ...LZ4JS_FILES,
    ...COPYH_FILES,
  ]))
    if (!want.has(file) && !(kind?.besides.includes(file) ?? false))
      problems.push(`not in the freeze: ${file}`);
  for (const [file, hash] of want) {
    const full = path.join(root, file);
    const got = existsSync(full) ? sha256(readFileSync(full)) : null;
    if (got !== hash)
      problems.push(`${got === null ? "missing" : "changed"}: ${file}`);
  }
  if (kind !== null) {
    for (const f of kind.holds)
      if (!want.has(f))
        problems.push(`a list for ${command} holds ${f}; this one does not`);
    for (const f of kind.lacks)
      if (want.has(f))
        problems.push(`a list for ${command} lacks ${f}; this one holds it`);
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
    : { ok: true, sha256: sha256(list), files: want.size, tag, command };
}

/** The gate a command runs under: its kind of list verified, then the kit's `checkKit()` fingerprint and lib-exits' hash (`loadResearch` refuses a difference). */
export async function verifyGate(
  root: string,
  command: Command,
  kit: (research: string) => Promise<unknown> = (research) =>
    loadResearch(research),
): Promise<Freeze> {
  const freeze = verifyFreeze(root, command);
  try {
    await kit(path.join(root, "research"));
    return freeze;
  } catch (err) {
    return {
      ok: false,
      problems: [
        ...(freeze.ok ? [] : freeze.problems),
        `the kit or lib-exits: ${(err as Error).message}`,
      ],
    };
  }
}

/** The seal a command's readers take: S open for step 2 and FRESH-2's stage, FRESH-2 open for its stage, each only on a freeze verified for that very command. */
export function sealOf(freeze: Freeze, command: Command): Seal {
  const verified = freeze.ok && freeze.command === command;
  return {
    sOpen: verified && (command === "step2" || command === "fresh2"),
    f2Open: verified && command === "fresh2",
  };
}
