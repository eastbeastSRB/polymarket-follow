/**
 * MARKET-1's entry point as a process (`src/market1.ts`; its exit codes):
 * the built program (`pnpm verify` builds before it tests), run in a scratch
 * folder with made-up settings and nothing else from the environment.
 * Nothing real is read or written.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

const program = fileURLToPath(new URL("../dist/market1.js", import.meta.url));
const dir = mkdtempSync(path.join(tmpdir(), "market1-entry-"));
afterAll(() => rmSync(dir, { recursive: true, force: true }));

const settings = {
  STATE_DIR: path.join(dir, "var"),
  MARKET1_ROOT: path.join(dir, "market1"),
  MARKET1_BACKUP: path.join(dir, "backup"),
  PAPER_ROOT: path.join(dir, "paper"),
  RECORDINGS_ROOT: path.join(dir, "recordings"),
  MONGO_URI: "mongodb://127.0.0.1:9",
  MONGO_DB: "polymarket_follow_test",
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

describe("MARKET-1's entry point (exit codes)", () => {
  it("refuses a missing setting, a bad command and its own folder in a sealed store, in one line, before anything runs (exit 2)", () => {
    const none = run(["daily"], {});
    expect(none.status).toBe(2);
    expect(none.stderr).toMatch(/^market1: refused: STATE_DIR: [^\n]*\n$/);
    for (const name of Object.keys(settings))
      expect(none.stderr).toContain(`${name}: `);
    for (const args of [["look", "4"], [], ["daily", "now"]]) {
      const bad = run(args, settings);
      expect(bad.status, args.join(" ")).toBe(2);
      expect(bad.stderr).toBe("market1: refused: the command: Invalid input\n");
    }
    const inside = run(["daily"], {
      ...settings,
      MARKET1_ROOT: path.join(settings.PAPER_ROOT, "market1"),
    });
    expect(inside.status).toBe(2);
    expect(inside.stderr).toBe(
      "market1: refused: MARKET1_ROOT: must lie outside PAPER_ROOT and RECORDINGS_ROOT\n",
    );
    expect(existsSync(settings.STATE_DIR)).toBe(false);
  });
});
