/**
 * A range's store built and checked (src/copyh/stores.ts; the plan's Q6),
 * each in the folder and under the seal its caller gives, a tool's range
 * folder or step 1's `look1`: the build refuses a built store there before
 * it reads any list (already run), its twin's folder alike; the check
 * refuses a folder without a store, and one its seal closes. The bodies'
 * runs on made-up files are the pass's, merge's and integrity's own tests;
 * the tools' refusals are copyh-main's, spawned.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { RANGES } from "../src/copyh/range.js";
import { AlreadyRun, StoreError } from "../src/copyh/run.js";
import { SEALED, SealedError } from "../src/copyh/seal.js";
import { buildStore, checkStores, type StoreRun } from "../src/copyh/stores.js";

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
