/**
 * MARKET-1's entry point as a process (`src/market1.ts`; its exit codes):
 * the built program (`pnpm verify` builds before it tests), run in a scratch
 * folder with made-up settings and nothing else from the environment.
 * Nothing real is read or written.
 */
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
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
  }, 60_000);

  it("stops while another run holds its lock with a fresh heartbeat (exit 3), leaving the lock to it", () => {
    const holder = spawn(process.execPath, ["-e", "setTimeout(()=>{},60000)"], {
      stdio: "ignore",
    });
    try {
      mkdirSync(settings.STATE_DIR, { recursive: true });
      const lock = path.join(settings.STATE_DIR, "market1.lock");
      writeFileSync(lock, `${holder.pid}\n`);
      writeFileSync(
        path.join(settings.STATE_DIR, "market1-heartbeat.json"),
        "{}\n",
      );
      expect(run(["daily"], settings).status).toBe(3);
      expect(readFileSync(lock, "utf8")).toBe(`${holder.pid}\n`);
      expect(existsSync(settings.MARKET1_ROOT)).toBe(false);
      rmSync(lock);
    } finally {
      holder.kill();
    }
  }, 60_000);

  it("passes the run's exit code to the process and releases its lock: look 3, already run, stops with 4 without a valid freeze of this package, else 5", () => {
    const own = {
      ...settings,
      STATE_DIR: path.join(dir, "var-exit"),
      MARKET1_ROOT: path.join(dir, "market1-exit"),
    };
    // A result already there: with a valid freeze the look is refused at any date (not due, or run already).
    const result = path.join(own.MARKET1_ROOT, "looks", "L3", "result.json");
    mkdirSync(path.dirname(result), { recursive: true });
    writeFileSync(result, "{}\n");
    const r = run(["look", "3"], own);
    expect([4, 5], `exit ${r.status}: ${r.stderr}`).toContain(r.status);
    expect(r.stderr).toBe("");
    expect(readdirSync(own.STATE_DIR).sort()).toEqual([
      "logs",
      "market1-heartbeat.json",
    ]);
    const logs = path.join(own.STATE_DIR, "logs");
    const ended = readdirSync(logs)
      .flatMap((f) =>
        readFileSync(path.join(logs, f), "utf8").trim().split("\n"),
      )
      .map((l) => JSON.parse(l) as { msg: string; exit?: number })
      .filter((l) => l.msg === "market1 run ended");
    expect(ended.map((l) => l.exit)).toEqual([r.status]);
    const lines = readdirSync(path.join(own.MARKET1_ROOT, "log")).flatMap((f) =>
      readFileSync(path.join(own.MARKET1_ROOT, "log", f), "utf8")
        .trim()
        .split("\n")
        .map((l) => (JSON.parse(l) as { line: string }).line),
    );
    expect(lines).toHaveLength(1);
    expect(lines[0]).toMatch(
      r.status === 4
        ? /^frozen files differ$/
        : /^the look (is not due|has run already)$/,
    );
    expect(readFileSync(result, "utf8")).toBe("{}\n");
  }, 60_000);

  it("exits 1 on a crash, with the error in its log (its own folder is a file here)", () => {
    const file = path.join(dir, "not-a-folder");
    writeFileSync(file, "x\n");
    const crashed = run(["look", "3"], { ...settings, MARKET1_ROOT: file });
    expect(crashed.status).toBe(1);
    const logs = path.join(settings.STATE_DIR, "logs");
    const fatal = readdirSync(logs)
      .flatMap((f) =>
        readFileSync(path.join(logs, f), "utf8").trim().split("\n"),
      )
      .map((l) => JSON.parse(l) as { level: number; msg: string })
      .filter((l) => l.level === 60);
    expect(fatal.map((l) => l.msg)).toEqual(["market1 run crashed"]);
  }, 60_000);
});
