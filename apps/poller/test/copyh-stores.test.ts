/**
 * A range's store built and checked (src/copyh/stores.ts; the plan's Q6),
 * each in the folder and under the seal its caller gives, a tool's range
 * folder or step 1's `look1`: the build refuses a built store there before
 * it reads any list (already run), its twin's folder alike; the check
 * refuses a folder without a store, and one its seal closes. A range's
 * files (the engine review's M2): FRESH-2's the keys its list holds, in
 * order, their indices consecutive; E's and S's a missing key refused. The
 * bodies'
 * runs on made-up files are the pass's, merge's and integrity's own tests;
 * the tools' refusals are copyh-main's, spawned.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FRESH2_FILES } from "../src/copyh/design.js";
import { RANGES } from "../src/copyh/range.js";
import { AlreadyRun, StoreError } from "../src/copyh/run.js";
import { SEALED, SealedError } from "../src/copyh/seal.js";
import {
  buildStore,
  checkStores,
  rangeFiles,
  type StoreRun,
} from "../src/copyh/stores.js";

const never = { stop: () => null };
const runIn = (base: string, root: string): StoreRun => ({
  range: RANGES.burnin,
  raw: path.join(root, "WAVE-H", "store"),
  base,
  roots: [root],
  seal: SEALED,
  budget: never,
  log: () => {},
});

describe("a range's files from its data list (C14 (1), RH1 (g); the engine review's M2)", () => {
  /** A list of the range's keys, each its made-up SHA-256, but those left out. */
  const listOf = (keys: readonly string[], without: readonly string[] = []) =>
    new Map(
      keys
        .filter((k) => !without.includes(k))
        .map((k, i) => [k, i.toString(16).padStart(64, "0")]),
    );

  it("takes FRESH-2's keys the list holds, in order, indices 0 to n - 1: two hours missing are holes", () => {
    const keys = RANGES["FRESH-2"].fill;
    expect(keys).toHaveLength(FRESH2_FILES);
    const missing = [keys[1]!, keys[2000]!];
    const list = listOf(keys, missing);
    const files = rangeFiles(RANGES["FRESH-2"], list);
    expect(files).toHaveLength(FRESH2_FILES - 2);
    expect(files.map((f) => f.key)).toEqual(
      keys.filter((k) => !missing.includes(k)),
    );
    expect(files.map((f) => f.index)).toEqual(files.map((_, i) => i));
    expect(files.map((f) => f.sha256)).toEqual(
      files.map((f) => list.get(f.key)),
    );
    expect(rangeFiles(RANGES["FRESH-2"], listOf(keys))).toHaveLength(
      FRESH2_FILES,
    );
  });

  it("refuses a key E's or S's list lacks (exit 5)", () => {
    for (const r of [RANGES.E, RANGES.S]) {
      expect(rangeFiles(r, listOf(r.fill))).toHaveLength(r.fill.length);
      expect(() => rangeFiles(r, listOf(r.fill, [r.fill[7]!]))).toThrow(
        StoreError,
      );
    }
  });
});

describe("a range's store, in its caller's folder", () => {
  it("is refused when built, before a list is read: step 1's look1 and its twin", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "copyh-stores-"));
    const look1 = path.join(root, "COPY-H", "look1");
    for (const base of [look1, path.join(look1, "twin")]) {
      mkdirSync(path.join(base, "store"), { recursive: true });
      writeFileSync(path.join(base, "store", "manifest.json"), "{}");
      await expect(
        buildStore({ ...runIn(base, root), workers: 1, heapGb: 8 }),
      ).rejects.toThrow(AlreadyRun);
    }
  });

  it("is not checked in a folder without one, nor in one its seal closes", () => {
    const root = mkdtempSync(path.join(tmpdir(), "copyh-stores-"));
    expect(() =>
      checkStores(runIn(path.join(root, "COPY-H", "look1"), root)),
    ).toThrow(StoreError);
    expect(() =>
      checkStores(runIn(path.join(root, "COPY-H", "S"), root)),
    ).toThrow(SealedError);
  });
});
