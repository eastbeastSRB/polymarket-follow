/**
 * The store's closure (copyh/rules.md C15 (c); decisions 2026-11-26, E's
 * store built once and recorded): what the store's programs load, so that a
 * store built before the freeze is known to be the frozen code's. From the
 * store's entry points in `dist/copyh` (the pass, its worker, the merge, the
 * store, the twin, the integrity, the re-reader), every compiled file their
 * relative imports reach, each by its SHA-256; but `design.js`, which holds
 * the engine's and the run's numbers too, enters by the values the reached
 * files import from it, each by name and value, the run-only names left out
 * (RUN_ONLY: they time or size a run, never its content), so that a change
 * to a number the store does not read leaves the closure as it was. The
 * closure's SHA-256 is that of its files and values together.
 * `copyh/rehearsal.json` records it after E's build; the freeze tool's
 * `--final` refuses a candidate whose closure differs.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import * as D from "./design.js";
import { PACKAGE_ROOT, sha256 } from "./run.js";

/** The store's entry points, relative to the package root. */
export const STORE_ENTRIES = [
  "pass",
  "worker",
  "merge",
  "store",
  "twin",
  "integrity",
  "reread",
].map((f) => `dist/copyh/${f}.js`);
const DESIGN = "dist/copyh/design.js";
/** design.ts's names that time or size a run, never the store's content: the heap and its cap, the closed windows, the part's and the run's minutes. */
export const RUN_ONLY: readonly string[] = [
  "WORKER_HEAP_GB",
  "WORKER_HEAP_CAP_GB",
  "CLOSED_WINDOWS",
  "PART_MINUTES",
  "RUN_MINUTES",
];

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
export const StoreClosure = z.object({
  sha256: SHA256,
  /** Each file reached but design.js: [path, SHA-256], by path. */
  files: z.array(z.tuple([z.string(), SHA256])),
  /** Each value the files import from design.js, run-only names left out: [name, value], by name. */
  design: z.array(z.tuple([z.string(), z.unknown()])),
});
export type StoreClosure = z.infer<typeof StoreClosure>;
/** `copyh/rehearsal.json` as the freeze tool reads it: its record of the store's closure (its other fields are its own). */
export const RehearsalRecord = z.object({ storeClosure: StoreClosure });

/** A compiled file's relative imports: an import's or a re-export's clause and path, a dynamic import's path, a bare import's path (written here in words: an example in this comment would be read as an import by such a regex). */
const IMPORT =
  /(?:import|export)\s([^;]*?)from\s*"(\.{1,2}\/[^"]+)"|import\s*\(\s*"(\.{1,2}\/[^"]+)"\s*\)|import\s*"(\.{1,2}\/[^"]+)"/g;

/** The names an import clause takes ("*" for every name: `* as N`, `export *`): `{ A, B as C }` takes A and B. */
function namesOf(clause: string): string[] {
  if (clause.trim().startsWith("*")) return ["*"];
  const braces = /\{([^}]*)\}/.exec(clause);
  return braces === null
    ? []
    : braces[1]!
        .split(",")
        .map((n) => n.trim().split(/\s+as\s+/)[0]!)
        .filter((n) => n !== "");
}

const hashOf = (files: StoreClosure["files"], design: StoreClosure["design"]) =>
  sha256(JSON.stringify({ files, design }));

/** The closure of `entries` at `root`, its design.js's values as `design` gives them. */
export function closureOf(
  root: string,
  entries: readonly string[],
  design: Readonly<Record<string, unknown>>,
): StoreClosure {
  const seen = new Set<string>();
  const names = new Set<string>();
  const files: [string, string][] = [];
  const todo = [...entries];
  while (todo.length > 0) {
    const rel = todo.pop()!;
    if (seen.has(rel)) continue;
    seen.add(rel);
    const bytes = readFileSync(path.join(root, ...rel.split("/")));
    if (rel !== DESIGN) files.push([rel, sha256(bytes)]);
    for (const m of bytes.toString("utf8").matchAll(IMPORT)) {
      const to = path.posix.join(
        path.posix.dirname(rel),
        m[2] ?? m[3] ?? m[4]!,
      );
      // A dynamic import may read any name; a bare one reads none.
      const taken =
        m[2] !== undefined ? namesOf(m[1]!) : m[3] !== undefined ? ["*"] : [];
      if (to === DESIGN) for (const n of taken) names.add(n);
      todo.push(to);
    }
  }
  const taken = names.has("*") ? Object.keys(design) : [...names];
  const values = taken
    .filter((n) => !RUN_ONLY.includes(n))
    .sort()
    .map((n): [string, unknown] => {
      if (!(n in design)) throw new Error(`design.js exports no ${n}`);
      return [n, design[n]];
    });
  files.sort((a, b) => (a[0] < b[0] ? -1 : 1));
  return { sha256: hashOf(files, values), files, design: values };
}

/** The store's closure at the package root, as this build would load it. */
export const storeClosure = (root = PACKAGE_ROOT): StoreClosure =>
  closureOf(root, STORE_ENTRIES, D);

/** How a candidate's closure differs from a recorded one: each file loaded anew, no longer or changed; each value; a record whose SHA-256 is not its content's. None: the same closure. */
export function closureDifferences(
  recorded: StoreClosure,
  candidate: StoreClosure,
): string[] {
  const out: string[] = [];
  if (hashOf(recorded.files, recorded.design) !== recorded.sha256)
    out.push("the record's SHA-256 is not its content's");
  const was = new Map(recorded.files);
  const now = new Map(candidate.files);
  for (const [f, h] of now)
    if (!was.has(f)) out.push(`loaded, and not by the recorded store: ${f}`);
    else if (was.get(f) !== h) out.push(`changed: ${f}`);
  for (const f of was.keys())
    if (!now.has(f)) out.push(`no longer loaded: ${f}`);
  const text = (v: unknown) => JSON.stringify(v);
  const wasV = new Map(recorded.design.map(([n, v]) => [n, text(v)]));
  const nowV = new Map(candidate.design.map(([n, v]) => [n, text(v)]));
  for (const [n, v] of nowV)
    if (wasV.get(n) !== v)
      out.push(`design.js's ${n}: ${v}, recorded ${wasV.get(n) ?? "none"}`);
  for (const n of wasV.keys())
    if (!nowV.has(n)) out.push(`design.js's ${n} no longer read`);
  return out;
}
