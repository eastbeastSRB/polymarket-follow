/**
 * `copyh/known.json` as the `reproduce` command reads it (src/copyh/known.ts;
 * rules.md C15 (a)): the committed file read whole and parsed; a file
 * missing, one that is no JSON and one not of its form each a failed check
 * (ReproError, exit 6).
 */
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { knownOf } from "../src/copyh/known.js";
import { ReproError } from "../src/copyh/reproduce.js";
import { PACKAGE_ROOT, exitOf, sha256 } from "../src/copyh/run.js";

describe("known.json (C15 (a))", () => {
  it("reads the committed file whole and parses it", () => {
    const file = path.join(PACKAGE_ROOT, "copyh", "known.json");
    const { bytes, known } = knownOf(file);
    expect(sha256(bytes)).toMatch(/^[0-9a-f]{64}$/);
    expect(known.mondays.length).toBe(26);
  });

  it("refuses a file missing, one that is no JSON and one not of its form (exit 6)", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "copyh-known-"));
    const bad = path.join(dir, "bad.json");
    const other = path.join(dir, "other.json");
    writeFileSync(bad, "{");
    writeFileSync(other, JSON.stringify({ mondays: [] }));
    for (const f of [path.join(dir, "none.json"), bad, other]) {
      let err: unknown = null;
      try {
        knownOf(f);
      } catch (e) {
        err = e;
      }
      expect(err, f).toBeInstanceOf(ReproError);
      expect(exitOf(err).code, f).toBe(6);
      expect((err as Error).message.startsWith(f)).toBe(true);
    }
  });
});
