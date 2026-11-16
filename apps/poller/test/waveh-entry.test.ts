/**
 * WAVE-H's entry point (rules.md H15's runs): a missing or bad setting and a
 * command it does not know are refused in one line, before anything runs
 * (exit 2). Only what never depends on WAVE-H's freeze is run through the
 * built program; the exits 4, 5 and 1 are tested through `exitOf`, which the
 * program's catch uses. Run in `pnpm verify`'s order: the build first.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
import { SealedError } from "../src/waveh/gate.js";
import { BooksNeeded } from "../src/waveh/legs.js";
import { AlreadyRun, FrozenDiffer, exitOf } from "../src/waveh/run.js";
import { StoreError } from "../src/waveh/store.js";

const program = fileURLToPath(new URL("../dist/waveh.js", import.meta.url));
const dir = mkdtempSync(path.join(tmpdir(), "waveh-entry-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const settings = {
  WAVEH_STORE: path.join(dir, "store"),
  WAVEH_ROOT: path.join(dir, "root"),
};

function run(args: string[], env: Record<string, string>) {
  return spawnSync(process.execPath, [program, ...args], {
    cwd: dir,
    env: {
      PATH: process.env.PATH ?? "",
      SystemRoot: process.env.SystemRoot ?? "",
      ...env,
    },
    encoding: "utf8",
    timeout: 60_000,
  });
}

describe("WAVE-H's entry point (exit 2)", () => {
  it("refuses a missing setting, one folder inside the other and an unknown command, in one line, before anything runs", () => {
    const none = run(["rehearse"], {});
    expect(none.status).toBe(2);
    expect(none.stderr).toMatch(/^waveh: refused: WAVEH_STORE: [^\n]*\n$/);
    expect(none.stderr).toContain("WAVEH_ROOT: ");
    const inside = run(["look"], {
      ...settings,
      WAVEH_ROOT: path.join(settings.WAVEH_STORE, "root"),
    });
    expect(inside.status).toBe(2);
    expect(inside.stderr).toBe(
      "waveh: refused: WAVEH_ROOT: must lie outside WAVEH_STORE, and WAVEH_STORE outside it\n",
    );
    for (const args of [[], ["look", "2"], ["freeze"]]) {
      const bad = run(args, settings);
      expect(bad.status, args.join(" ")).toBe(2);
      expect(bad.stderr).toMatch(/^waveh: refused: the command: [^\n]*\n$/);
    }
    expect(existsSync(settings.WAVEH_ROOT)).toBe(false);
  }, 60_000);
});

describe("WAVE-H's exit codes (H15's Runs)", () => {
  it("exits 4 when the frozen files differ, 5 when not ready or already run, 1 on anything else", () => {
    expect(
      [
        new FrozenDiffer("x"),
        new BooksNeeded("x"),
        new StoreError("x"),
        new AlreadyRun("x"),
        new SealedError("x"),
        new Error("x"),
        "a string",
      ].map(exitOf),
    ).toEqual([
      { code: 4, event: "frozen files differ" },
      { code: 5, event: "books needed" },
      { code: 5, event: "not ready" },
      { code: 5, event: "already run" },
      { code: 1, event: "crash" },
      { code: 1, event: "crash" },
      { code: 1, event: "crash" },
    ]);
  });
});
