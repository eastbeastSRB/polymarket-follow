/**
 * What comes first in MARKET-1's daily run and look (rules.md M0, M2): the
 * freeze check, then the wait for the paper experiment's run, and only then
 * a read of the paper experiment's store or the recordings. Here every such
 * read fails loudly: the paper store's `state.json` is a folder, each
 * market's `panel\<iid>` a file and the recordings' root a file, so a read
 * moved before the check or the wait turns the exit code into a thrown error
 * (a missing path would read as empty and leave no trace). Two package
 * folders of the test's own, one with a freeze list over it; every value is
 * made up; nothing real is read.
 */
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { daily, type DailyIo } from "../src/market1/daily.js";
import { LARGE, SMALL_COINS } from "../src/market1/fills.js";
import { PAPER_FILES, frozenFiles } from "../src/market1/gate.js";
import { look, lookMonday } from "../src/market1/look.js";
import { PAPER_LOCK, type Market1Config } from "../src/market1/run.js";
import { RESEARCH_ROOT } from "../src/paper/research.js";
import { log } from "./market1-world.js";

const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
const NOW = lookMonday(1);
const noStage = () => undefined;

let tmp: string;
let unfrozen: string;
let frozen: string;
let paper: string;
let rec: string;
let runs = 0;

/** A package folder: research, made-up files of what runs, the rules. */
function makePackage(pkg: string): void {
  cpSync(RESEARCH_ROOT, path.join(pkg, "research"), { recursive: true });
  for (const f of [
    "dist/market1.js",
    "dist/market1/daily.js",
    ...PAPER_FILES,
  ]) {
    mkdirSync(path.dirname(path.join(pkg, f)), { recursive: true });
    writeFileSync(path.join(pkg, f), `${f}\n`);
  }
  mkdirSync(path.join(pkg, "market1"));
  writeFileSync(path.join(pkg, "market1", "rules.md"), "the rules\n");
}

beforeAll(() => {
  tmp = mkdtempSync(path.join(tmpdir(), "market1-order-"));
  unfrozen = path.join(tmp, "unfrozen");
  makePackage(unfrozen);
  frozen = path.join(tmp, "frozen");
  makePackage(frozen);
  writeFileSync(
    path.join(frozen, "market1", "FROZEN.sha256"),
    `# FROZEN: a test's\n# written 2026-12-01T00:00:00.000Z from commit test\n${frozenFiles(
      frozen,
    )
      .map((f) => `${sha256(readFileSync(path.join(frozen, f)))} *${f}`)
      .join("\n")}\n`,
  );
  // Where a read would throw.
  paper = path.join(tmp, "paper");
  mkdirSync(path.join(paper, "state.json"), { recursive: true });
  mkdirSync(path.join(paper, "panel"));
  for (const iid of [...SMALL_COINS, ...LARGE])
    writeFileSync(path.join(paper, "panel", String(iid)), "not a folder\n");
  rec = path.join(tmp, "recordings");
  writeFileSync(rec, "not a folder\n");
}, 60_000);

afterAll(() => rmSync(tmp, { recursive: true, force: true }));

/** A fresh MARKET-1 record over the traps. */
function configFor(): Market1Config {
  runs += 1;
  const config: Market1Config = {
    STATE_DIR: path.join(tmp, `var-${runs}`),
    MARKET1_ROOT: path.join(tmp, `market1-${runs}`),
    MARKET1_BACKUP: path.join(tmp, `backup-${runs}`),
    PAPER_ROOT: paper,
    RECORDINGS_ROOT: rec,
    MONGO_URI: "mongodb://unused",
    MONGO_DB: "polymarket_follow_test",
  };
  mkdirSync(config.STATE_DIR, { recursive: true });
  return config;
}
const logOf = (config: Market1Config) =>
  readFileSync(
    path.join(config.MARKET1_ROOT, "log", "2026-12-21.jsonl"),
    "utf8",
  )
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l) as Record<string, unknown>);
/** The traps are as they were: nothing of the paper store or the recordings written either. */
function trapsUntouched(): void {
  expect(readdirSync(paper).sort()).toEqual(["panel", "state.json"]);
  expect(readdirSync(path.join(paper, "state.json"))).toEqual([]);
  expect(readdirSync(path.join(paper, "panel"))).toHaveLength(40);
  expect(readFileSync(rec, "utf8")).toBe("not a folder\n");
}

describe("what comes first in a run (M0, M2)", () => {
  it("without a valid freeze, daily and look stop (exit 4) before any read of the paper store or the recordings", async () => {
    const config = configFor();
    const io: DailyIo = { packageRoot: unfrozen };
    expect(await daily(config, log, noStage, NOW, io)).toBe(4);
    expect(await look(config, log, 1, NOW, io)).toBe(4);
    expect(readdirSync(config.MARKET1_ROOT)).toEqual(["log"]);
    const refused = {
      line: "frozen files differ",
      problems: ["no market1/FROZEN.sha256"],
    };
    expect(logOf(config)).toMatchObject([refused, refused]);
    trapsUntouched();
  }, 60_000);

  it("with a live paper run, daily and look wait 6 hours and stop (exit 5) before any read of the paper store or the recordings", async () => {
    const config = configFor();
    const holder = spawn(process.execPath, ["-e", "setTimeout(()=>{},60000)"], {
      stdio: "ignore",
    });
    try {
      const beat = path.join(config.STATE_DIR, PAPER_LOCK.heartbeat);
      writeFileSync(
        path.join(config.STATE_DIR, PAPER_LOCK.lock),
        `${holder.pid}\n`,
      );
      writeFileSync(beat, "{}\n");
      let t = Date.now();
      const slept: number[] = [];
      const paperClock = {
        now: () => t,
        sleep: (ms: number) => {
          slept.push(ms);
          t += ms;
          utimesSync(beat, new Date(t), new Date(t));
          return Promise.resolve();
        },
      };
      const io: DailyIo = { packageRoot: frozen, paperClock };
      expect(await daily(config, log, noStage, NOW, io)).toBe(5);
      expect(await look(config, log, 1, NOW, io)).toBe(5);
      expect(slept).toHaveLength(720);
      expect(readdirSync(config.MARKET1_ROOT)).toEqual(["log"]);
      expect(logOf(config)).toMatchObject([
        {
          line: "the paper experiment's run is still live after 6 hours: nothing read",
        },
        {
          look: 1,
          line: "the paper experiment's run is still live after 6 hours",
        },
      ]);
      trapsUntouched();
    } finally {
      holder.kill();
    }
  }, 60_000);
});
