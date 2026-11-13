/**
 * MARKET-1's process mechanics (rules.md M2, M15; MARKET-PLAN-REVIEW F2): its
 * settings, its own lock and heartbeat in STATE_DIR (`market1.lock`,
 * `market1-heartbeat.json`), its log (`logs\market1-<UTC date>.log`), its
 * whole-file writes that survive a failed rename, and the wait for the
 * paper experiment's run to be over before any of its files is opened.
 */
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  renameSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  lockHeld,
  releaseLock,
  takeLock,
  type LockFiles,
  type LockResult,
} from "../lock.js";
import { createLog, type Logger } from "../log.js";

export const MARKET1_LOCK: LockFiles = {
  lock: "market1.lock",
  heartbeat: "market1-heartbeat.json",
};
/** The paper experiment's pair (its `run.ts`), read only. */
export const PAPER_LOCK: LockFiles = {
  lock: "paper.lock",
  heartbeat: "paper-heartbeat.json",
};
const HEARTBEAT_EVERY_MS = 10_000;
/** A live paper run is checked again every minute, for at most 6 hours (rules.md M2). */
export const PAPER_CHECK_EVERY_MS = 60_000;
export const PAPER_WAIT_MS = 6 * 3_600_000;
const RENAME_TRIES = 10;
const RENAME_PAUSE_MS = 1_000;

const absolutePath = z
  .string()
  .trim()
  .refine((p) => path.isAbsolute(p), "must be an absolute path");

/** `own` is neither one of the sealed stores nor a folder inside one (on Windows, `path.relative` ignores case). */
const outsideSealed = (
  own: string,
  c: { PAPER_ROOT: string; RECORDINGS_ROOT: string },
): boolean =>
  [c.PAPER_ROOT, c.RECORDINGS_ROOT].every((sealed) => {
    const rel = path.relative(sealed, own);
    return (
      rel === ".." || rel.startsWith(`..${path.sep}`) || path.isAbsolute(rel)
    );
  });
const OUTSIDE = "must lie outside PAPER_ROOT and RECORDINGS_ROOT";

/**
 * No defaults: a run without its folders stops instead of reading or writing
 * somewhere unintended; its own folders never lie in the sealed stores.
 */
const Market1Config = z
  .object({
    STATE_DIR: absolutePath,
    MARKET1_ROOT: absolutePath,
    MARKET1_BACKUP: absolutePath,
    PAPER_ROOT: absolutePath,
    RECORDINGS_ROOT: absolutePath,
    MONGO_URI: z.string().trim().startsWith("mongodb://"),
    MONGO_DB: z
      .literal("polymarket_follow")
      .or(z.literal("polymarket_follow_test")),
  })
  .refine((c) => outsideSealed(c.MARKET1_ROOT, c), {
    path: ["MARKET1_ROOT"],
    message: OUTSIDE,
  })
  .refine((c) => outsideSealed(c.MARKET1_BACKUP, c), {
    path: ["MARKET1_BACKUP"],
    message: OUTSIDE,
  });
export type Market1Config = z.infer<typeof Market1Config>;

export function parseMarket1Config(env: NodeJS.ProcessEnv): Market1Config {
  return Market1Config.parse(env);
}

/** The `.env` in the working directory (the run copy's); a variable already set wins. */
export function loadMarket1Config(): Market1Config {
  if (existsSync(".env")) process.loadEnvFile(".env");
  return parseMarket1Config(process.env);
}

const pause = (ms: number) =>
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

/**
 * Written whole to `<file>.tmp`, flushed, then renamed over the file; a
 * rename refused (on Windows, while a reader holds the file) is tried again
 * once a second, 10 times in all, before the error is thrown (F2).
 */
export function writeWhole(
  file: string,
  bytes: Buffer | string,
  tries = RENAME_TRIES,
  pauseMs = RENAME_PAUSE_MS,
): void {
  mkdirSync(path.dirname(file), { recursive: true });
  const fd = openSync(`${file}.tmp`, "w");
  try {
    writeFileSync(fd, bytes);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  for (let i = 1; ; i++) {
    try {
      renameSync(`${file}.tmp`, file);
      return;
    } catch (err) {
      if (i >= tries) throw err;
      pause(pauseMs);
    }
  }
}

/** Whether the paper experiment's run is live now: its lock's holder alive, its heartbeat under 2 minutes old. */
export function paperRunLive(stateDir: string, now: number): boolean {
  const pid = readPid(path.join(stateDir, PAPER_LOCK.lock));
  if (pid === null) return false;
  const age = ageMs(path.join(stateDir, PAPER_LOCK.heartbeat), now);
  return lockHeld(pid, process.pid, isAlive(pid), age);
}

function readPid(file: string): number | null {
  try {
    const pid = Number(readFileSync(file, "utf8").trim());
    return Number.isInteger(pid) && pid > 0 ? pid : null;
  } catch {
    return null;
  }
}

function ageMs(file: string, now: number): number | null {
  try {
    return now - statSync(file).mtimeMs;
  } catch {
    return null;
  }
}

function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err) {
    return (err as NodeJS.ErrnoException).code === "EPERM";
  }
}

/**
 * Waits while the paper experiment's run is live (M2, F2): true once it is
 * not, false after `PAPER_WAIT_MS` (the run then stops with exit 5).
 */
export async function waitForPaper(
  stateDir: string,
  log: Logger,
  clock: { now: () => number; sleep: (ms: number) => Promise<void> } = {
    now: Date.now,
    sleep: (ms) => new Promise((r) => setTimeout(r, ms)),
  },
): Promise<boolean> {
  const since = clock.now();
  for (;;) {
    if (!paperRunLive(stateDir, clock.now())) return true;
    if (clock.now() - since >= PAPER_WAIT_MS) {
      log.warn(
        { waitedMs: clock.now() - since },
        "the paper experiment's run is still live; nothing of it read",
      );
      return false;
    }
    log.info("the paper experiment's run is live; waiting a minute");
    await clock.sleep(PAPER_CHECK_EVERY_MS);
  }
}

export type RunHandle =
  | {
      taken: true;
      log: Logger;
      stage: (what: string) => void;
      close: () => void;
    }
  | (Extract<LockResult, { taken: false }> & {
      log: Logger;
      close: () => void;
    });

/**
 * The log first (a refusal is written to it), then the lock; while it is
 * held a heartbeat names the run's stage every 10 s. A heartbeat whose write
 * fails is logged and skipped: it never stops the run (F2).
 */
export function openRun(stateDir: string): RunHandle {
  const { log, close: closeLog } = createLog(stateDir, "market1");
  const lock = takeLock(stateDir, Date.now(), MARKET1_LOCK);
  if (!lock.taken) return { ...lock, log, close: closeLog };
  let stage = "starting";
  const beat = () => {
    try {
      writeWhole(
        path.join(stateDir, MARKET1_LOCK.heartbeat),
        `${JSON.stringify({ pid: process.pid, time: new Date().toISOString(), stage })}\n`,
        1,
      );
    } catch (err) {
      log.warn({ err }, "heartbeat not written; the next beat tries again");
    }
  };
  beat();
  const timer = setInterval(beat, HEARTBEAT_EVERY_MS);
  timer.unref();
  return {
    taken: true,
    log,
    stage: (what) => {
      stage = what;
      beat();
    },
    close: () => {
      clearInterval(timer);
      releaseLock(stateDir, MARKET1_LOCK);
      closeLog();
    },
  };
}
