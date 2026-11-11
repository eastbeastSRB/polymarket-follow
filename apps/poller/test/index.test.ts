import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/** The built program: `pnpm verify` builds before it tests. */
const program = fileURLToPath(new URL("../dist/index.js", import.meta.url));

describe("the poller's crash handler", () => {
  it("puts a crash at start in its own log, exits 1, and writes no coverage before it records", () => {
    const dir = mkdtempSync(path.join(tmpdir(), "poller-crash-"));
    const stateDir = path.join(dir, "var");
    const recordings = path.join(dir, "recordings");
    // A folder where the lock file goes: taking the lock throws (EISDIR),
    // before the recorder exists.
    mkdirSync(path.join(stateDir, "poller.lock"), { recursive: true });
    const run = spawnSync(process.execPath, [program], {
      cwd: dir,
      env: {
        ...process.env,
        RECORDINGS_ROOT: recordings,
        STATE_DIR: stateDir,
        MONGO_URI: "mongodb://127.0.0.1:27017",
        MONGO_DB: "polymarket_follow_test",
      },
      encoding: "utf8",
      timeout: 30_000,
    });
    expect(run.status).toBe(1);
    const [file] = readdirSync(path.join(stateDir, "logs"));
    const last = JSON.parse(
      readFileSync(path.join(stateDir, "logs", file!), "utf8")
        .trim()
        .split("\n")
        .at(-1)!,
    ) as { level: number; msg: string; err?: { message?: string } };
    expect(last).toMatchObject({ level: 60, msg: "poller crashed" });
    expect(last.err?.message).toMatch(/EISDIR/);
    expect(existsSync(recordings)).toBe(false);
  });
});
