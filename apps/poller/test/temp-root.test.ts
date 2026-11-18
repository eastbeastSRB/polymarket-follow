import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  symlinkSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import setup, { RUN_PREFIX, STALE_MS, sweepStale } from "./temp-root.js";

const TEMP_VARS = ["TEMP", "TMP", "TMPDIR"] as const;

/** A folder outside every run folder made here, with one file to check. */
function target(base: string): string {
  const at = path.join(base, "outside");
  mkdirSync(at);
  writeFileSync(path.join(at, "keep.txt"), "kept");
  return at;
}

describe("the test run's temporary folder", () => {
  it("is where this worker's tmpdir() points: the environment set in globalSetup reached it", () => {
    const run = tmpdir();
    expect(path.basename(run).startsWith(RUN_PREFIX)).toBe(true);
    expect(lstatSync(run).isDirectory()).toBe(true);
    for (const name of TEMP_VARS) expect(process.env[name]).toBe(run);
  });

  it("is made under tmpdir() by setup, which sweeps old run folders first and points TEMP, TMP and TMPDIR at it; the teardown removes it and a junction inside, never the junction's target", () => {
    const saved = TEMP_VARS.map((name) => process.env[name]);
    const base = mkdtempSync(path.join(tmpdir(), "temp-root-"));
    const outside = target(base);
    const stale = path.join(base, `${RUN_PREFIX}stale`);
    const young = path.join(base, `${RUN_PREFIX}young`);
    mkdirSync(stale);
    mkdirSync(young);
    utimesSync(stale, 1_700_000_000, 1_700_000_000);
    try {
      process.env.TEMP = base;
      process.env.TMP = base;
      const teardown = setup();
      expect(existsSync(stale)).toBe(false);
      expect(existsSync(young)).toBe(true);
      const run = tmpdir();
      expect(path.dirname(run)).toBe(base);
      expect(path.basename(run).startsWith(RUN_PREFIX)).toBe(true);
      for (const name of TEMP_VARS) expect(process.env[name]).toBe(run);

      mkdirSync(path.join(run, "a", "b"), { recursive: true });
      writeFileSync(path.join(run, "a", "b", "f.txt"), "x");
      const link = path.join(run, "a", "link");
      symlinkSync(outside, link, "junction");
      expect(lstatSync(link).isSymbolicLink()).toBe(true);
      expect(readFileSync(path.join(link, "keep.txt"), "utf8")).toBe("kept");

      teardown();
      expect(existsSync(run)).toBe(false);
      expect(readFileSync(path.join(outside, "keep.txt"), "utf8")).toBe("kept");
    } finally {
      TEMP_VARS.forEach((name, i) => {
        if (saved[i] === undefined) delete process.env[name];
        else process.env[name] = saved[i];
      });
    }
  });
});

describe("sweepStale", () => {
  it("removes a run folder only once it is six hours old", () => {
    const base = mkdtempSync(path.join(tmpdir(), "temp-root-"));
    const old = path.join(base, `${RUN_PREFIX}old`);
    mkdirSync(path.join(old, "a"), { recursive: true });
    writeFileSync(path.join(old, "a", "f.txt"), "x");
    utimesSync(old, 1_700_000_000, 1_700_000_000);
    const changed = lstatSync(old).mtimeMs;

    expect(sweepStale(base, changed + STALE_MS - 1)).toEqual([]);
    expect(existsSync(path.join(old, "a", "f.txt"))).toBe(true);
    expect(sweepStale(base, changed + STALE_MS)).toEqual([old]);
    expect(existsSync(old)).toBe(false);
  });

  it("matches the prefix exactly and real folders only: a junction with the prefix stays, and so does its target", () => {
    const base = mkdtempSync(path.join(tmpdir(), "temp-root-"));
    const outside = target(base);
    const run = path.join(base, `${RUN_PREFIX}run`);
    mkdirSync(run);
    const others = [
      `x-${RUN_PREFIX}folder`,
      "polymarket-follow-test-folder",
      "waveh-folder",
    ].map((name) => path.join(base, name));
    for (const at of others) mkdirSync(at);
    const file = path.join(base, `${RUN_PREFIX}file`);
    writeFileSync(file, "x");
    const link = path.join(base, `${RUN_PREFIX}link`);
    symlinkSync(outside, link, "junction");

    expect(sweepStale(base, Date.now() + 10 * STALE_MS)).toEqual([run]);
    expect(existsSync(run)).toBe(false);
    for (const at of [...others, file]) expect(existsSync(at)).toBe(true);
    expect(lstatSync(link).isSymbolicLink()).toBe(true);
    expect(readFileSync(path.join(outside, "keep.txt"), "utf8")).toBe("kept");
  });
});
