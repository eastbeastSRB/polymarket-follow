/**
 * The store's closure (src/copyh/closure.ts; rules.md C15 (c)): on made-up
 * compiled trees, every file the entry points' relative imports reach (an
 * `export … from`, a dynamic `import()` and a bare import among them) by
 * its SHA-256, a
 * file not reached left out; design.js by the values the files import,
 * `* as` taking every name, the run-only names left out, so that design.js's
 * bytes, a value no store file reads and a run-only value leave the closure
 * as it was; each difference named, a record whose SHA-256 is not its
 * content's among them. On this build: every export of design.ts classified
 * store, run-only or engine, the closure reading exactly the store's; and
 * the freeze tool's `--final` check against a record.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  RUN_ONLY,
  STORE_ENTRIES,
  closureDifferences,
  closureOf,
  storeClosure,
  type StoreClosure,
} from "../src/copyh/closure.js";
import * as D from "../src/copyh/design.js";
import { PACKAGE_ROOT } from "../src/copyh/run.js";

/** A made-up compiled tree: its files by path, under a new root. */
function tree(files: Record<string, string>): string {
  const root = mkdtempSync(path.join(tmpdir(), "copyh-closure-"));
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(path.dirname(path.join(root, rel)), { recursive: true });
    writeFileSync(path.join(root, rel), text);
  }
  return root;
}
const FILES = {
  "dist/copyh/a.js":
    'import { X, Y as Why, WORKER_HEAP_GB } from "./design.js";\nimport { b } from "./b.js";\nexport const a = X + Why + WORKER_HEAP_GB + b;\n',
  "dist/copyh/b.js": 'export { c } from "../c.js";\nexport const b = 1;\n',
  "dist/c.js":
    'export const c = 2;\nexport const later = () => import("./d.js");\n',
  "dist/d.js": "export const d = 3;\n",
  "dist/copyh/design.js": "export const X = 1;\n",
  "dist/copyh/unreached.js": 'import { Z } from "./design.js";\n',
};
const DESIGN = { X: 1, Y: 2, Z: 3, WORKER_HEAP_GB: 8 };
const closureAt = (
  files: Record<string, string> = FILES,
  design: Record<string, unknown> = DESIGN,
) => closureOf(tree(files), ["dist/copyh/a.js"], design);

describe("the store's closure", { timeout: 60_000 }, () => {
  it("holds every file the entry points reach, by its hash, and design.js by the values imported from it", () => {
    const c = closureAt();
    expect(c.files.map(([f]) => f)).toEqual([
      "dist/c.js",
      "dist/copyh/a.js",
      "dist/copyh/b.js",
      "dist/d.js",
    ]);
    expect(c.files.every(([, h]) => /^[0-9a-f]{64}$/.test(h))).toBe(true);
    expect(c.design).toEqual([
      ["X", 1],
      ["Y", 2],
    ]);
  });

  it("stays the same for design.js's bytes, a value no reached file imports and a run-only value; moves with an imported value and a file's bytes", () => {
    const c = closureAt();
    const same = [
      closureAt({ ...FILES, "dist/copyh/design.js": "export const X = 99;\n" }),
      closureAt(FILES, { ...DESIGN, Z: 30 }),
      closureAt(FILES, { ...DESIGN, WORKER_HEAP_GB: 16 }),
    ];
    for (const s of same) {
      expect(s.sha256).toBe(c.sha256);
      expect(closureDifferences(c, s)).toEqual([]);
    }
    const value = closureAt(FILES, { ...DESIGN, X: 5 });
    expect(value.sha256).not.toBe(c.sha256);
    expect(closureDifferences(c, value)).toEqual([
      "design.js's X: 5, recorded 1",
    ]);
    const bytes = closureAt({
      ...FILES,
      "dist/d.js": "export const d = 4;\n",
    });
    expect(bytes.sha256).not.toBe(c.sha256);
    expect(closureDifferences(c, bytes)).toEqual(["changed: dist/d.js"]);
  });

  it("takes every name but the run-only ones for `* as`, and names a file loaded anew or no longer, a value no longer read and a record that does not hash", () => {
    const c = closureAt();
    const all = closureAt({
      ...FILES,
      "dist/copyh/b.js":
        'import * as D from "./design.js";\nimport "./e.js";\nexport { c } from "../c.js";\nexport const b = D.Z;\n',
      "dist/copyh/e.js": 'export { e } from "./f.js";\n',
      "dist/copyh/f.js": "export const e = 5;\n",
    });
    expect(all.design).toEqual([
      ["X", 1],
      ["Y", 2],
      ["Z", 3],
    ]);
    // A bare `import "./e.js"` is followed, and its re-export.
    expect(closureDifferences(c, all)).toEqual([
      "changed: dist/copyh/b.js",
      "loaded, and not by the recorded store: dist/copyh/e.js",
      "loaded, and not by the recorded store: dist/copyh/f.js",
      "design.js's Z: 3, recorded none",
    ]);
    const fewer = closureAt({
      ...FILES,
      "dist/copyh/a.js":
        'import { X } from "./design.js";\nexport const a = X;\n',
    });
    expect(closureDifferences(c, fewer)).toEqual([
      "changed: dist/copyh/a.js",
      "no longer loaded: dist/c.js",
      "no longer loaded: dist/copyh/b.js",
      "no longer loaded: dist/d.js",
      "design.js's Y no longer read",
    ]);
    expect(closureDifferences(fewer, c)).toEqual([
      "loaded, and not by the recorded store: dist/c.js",
      "changed: dist/copyh/a.js",
      "loaded, and not by the recorded store: dist/copyh/b.js",
      "loaded, and not by the recorded store: dist/d.js",
      "design.js's Y: 2, recorded none",
    ]);
    const forged: StoreClosure = { ...c, design: [["X", 1]] };
    expect(closureDifferences(forged, c)).toEqual([
      "the record's SHA-256 is not its content's",
      "design.js's Y: 2, recorded none",
    ]);
    expect(() => closureAt(FILES, { X: 1 })).toThrow("design.js exports no Y");
  });
});

/** Every export of design.ts, by what reads it: the store's programs, the run's timing and size alone, or the engine's steps. */
const CLASSES: Record<string, "store" | "run-only" | "engine"> = {
  ARCHIVE_START: "store",
  M0: "store",
  END_E: "store",
  END_S: "store",
  END_F2: "store",
  FUNDING_FROM: "engine",
  SWITCH_HOUR: "store",
  FAIL_SHARE: "store",
  FAIL_LEAST: "store",
  EXACT_DIGITS: "store",
  BUCKETS: "store",
  HOLE_MS: "store",
  MERGE_MS: "engine",
  EXITS_MAX: "engine",
  RESIDUE_BOUNDS: "engine",
  LABEL_FILLS_MAX: "engine",
  HISTORY_FILLS_MAX: "engine",
  ADL_DIR: "store",
  SETTLEMENT_DIR: "store",
  VAULT_DIR: "store",
  BACKSTOP_METHOD: "store",
  LABEL_CAPTURE_DAYS: "engine",
  MAIN_HOLD_HOURS: "engine",
  MAIN_CLOSED_CYCLES: "engine",
  TEN_CLOSED_CYCLES: "engine",
  DAY_HOLD_HOURS: "engine",
  STOPS: "engine",
  DAYS7_DAYS: "engine",
  JUMP: "engine",
  DELAY_LINES_MINUTES: "engine",
  RANK_WEEKS: "engine",
  RANK_MIN_COPIES: "engine",
  RANK_SHARE: "engine",
  SLICES: "engine",
  FEE_A_LEG: "engine",
  BINANCE_FEE_A_SIDE: "engine",
  PAIR_MS: "store",
  SPREAD_MIN_MINUTES: "engine",
  SPREAD_FALLBACK: "engine",
  SETTLEMENT_MARK_MINUTES: "engine",
  SETTLEMENT_MARK_SWITCH: "engine",
  THIN_NOTIONAL: "engine",
  THIN_MINUTES: "engine",
  D_HORIZON_HOURS: "engine",
  WITHHELD_SHARE: "engine",
  DELTA_BPS: "engine",
  Z_LOOKS: "engine",
  SMALLEST_EDGE: "engine",
  CONCENTRATION: "engine",
  ROUNDS: "engine",
  TRIES_A_ROUND: "engine",
  Z_CHOICE: "engine",
  CHOICE_MIN_TRADERS: "engine",
  CHOICE_MIN_DAYS: "engine",
  CHOICE_BEST_DAYS_LEFT_OUT: "engine",
  CHOSEN_AT_MOST: "engine",
  Z_CONFIRM: "engine",
  Z_SEAL: "engine",
  FRESH2_FILES: "engine",
  TRIPWIRE_MINUTES: "engine",
  TRIPWIRE_STOP: "engine",
  PART_MINUTES: "run-only",
  RUN_MINUTES: "run-only",
  CLOSED_WINDOWS: "run-only",
  WORKER_HEAP_GB: "run-only",
  WORKER_HEAP_CAP_GB: "run-only",
  REHEARSAL_WINDOW: "engine",
  LABEL_CHECK_MONDAYS: "engine",
  LABEL_CHECK_SLICE: "engine",
  LABEL_CHECK_PASS: "engine",
  REPRODUCTION: "engine",
  REPRODUCTION_TOLERANCE_BPS: "engine",
  SAMPLE_DAYS: "store",
};
const namesOf = (c: string) =>
  Object.entries(CLASSES)
    .filter(([, k]) => k === c)
    .map(([n]) => n)
    .sort();

describe("this build's store closure", { timeout: 60_000 }, () => {
  it("classifies every export of design.ts, and reads exactly the store's values: an engine value read by the store, or a new export, fails here", () => {
    expect(Object.keys(D).sort()).toEqual(Object.keys(CLASSES).sort());
    expect([...RUN_ONLY].sort()).toEqual(namesOf("run-only"));
    const c = storeClosure();
    expect(c.design.map(([n]) => n)).toEqual(namesOf("store"));
    const files = c.files.map(([f]) => f);
    for (const e of STORE_ENTRIES) expect(files, e).toContain(e);
    expect(files).not.toContain("dist/copyh/design.js");
    expect(files.every((f) => f.startsWith("dist/"))).toBe(true);
  });

  it("is checked by the freeze tool's --final against copyh/rehearsal.json's record: none, the same, another", async () => {
    const tool = createRequire(import.meta.url)(
      path.join(PACKAGE_ROOT, "..", "..", "tools", "copyh-freeze.cjs"),
    ) as {
      finalProblems: (pkg: string, rehearsal: string) => Promise<string[]>;
    };
    const dir = mkdtempSync(path.join(tmpdir(), "copyh-rehearsal-"));
    const file = path.join(dir, "rehearsal.json");
    expect(await tool.finalProblems(PACKAGE_ROOT, file)).toEqual([
      "no rehearsal.json: E's store is built and recorded first",
    ]);
    const c = storeClosure();
    writeFileSync(file, JSON.stringify({ storeClosure: c, other: 1 }));
    expect(await tool.finalProblems(PACKAGE_ROOT, file)).toEqual([]);
    const [first, ...rest] = c.files;
    const changed = {
      ...c,
      files: [[first![0], "0".repeat(64)], ...rest],
    };
    writeFileSync(file, JSON.stringify({ storeClosure: changed }));
    expect(await tool.finalProblems(PACKAGE_ROOT, file)).toEqual([
      "the record's SHA-256 is not its content's",
      `changed: ${first![0]}`,
    ]);
  });
});
