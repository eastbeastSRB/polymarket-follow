/**
 * The experiment's process mechanics (PAPER-PLAN-REVIEW F11): its own
 * settings, its own lock and heartbeat beside the poller's in STATE_DIR
 * (`paper.lock`, `paper-heartbeat.json`), so a hand-started run beside the
 * task's is refused, and its own log, `logs\paper-<UTC date>.log`.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  releaseLock,
  takeLock,
  type LockFiles,
  type LockResult,
} from "../lock.js";
import { createLog, type Logger } from "../log.js";
import { writeAtomic } from "./store.js";

export const PAPER_LOCK: LockFiles = {
  lock: "paper.lock",
  heartbeat: "paper-heartbeat.json",
};
const HEARTBEAT_EVERY_MS = 10_000;

const absolutePath = z
  .string()
  .trim()
  .refine((p) => path.isAbsolute(p), "must be an absolute path");

/** No defaults: a run without its folders stops instead of writing somewhere unintended. */
const PaperConfig = z.object({
  STATE_DIR: absolutePath,
  PAPER_ROOT: absolutePath,
  PAPER_BACKUP: absolutePath,
});
export type PaperConfig = z.infer<typeof PaperConfig>;

export function parsePaperConfig(env: NodeJS.ProcessEnv): PaperConfig {
  return PaperConfig.parse(env);
}

/** The `.env` in the working directory (the run copy's), as the poller's; a variable already set wins. */
export function loadPaperConfig(): PaperConfig {
  if (existsSync(".env")) process.loadEnvFile(".env");
  return parsePaperConfig(process.env);
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
 * The log first (a refusal is written to it), then the lock; while the lock
 * is held a heartbeat names the run's stage every 10 s, which keeps the lock
 * fresh (lock.ts frees a lock whose heartbeat is older than 2 minutes).
 */
export function openRun(stateDir: string): RunHandle {
  const { log, close: closeLog } = createLog(stateDir, "paper");
  const lock = takeLock(stateDir, Date.now(), PAPER_LOCK);
  if (!lock.taken) return { ...lock, log, close: closeLog };
  let stage = "starting";
  const beat = () =>
    writeAtomic(
      path.join(stateDir, PAPER_LOCK.heartbeat),
      `${JSON.stringify({ pid: process.pid, time: new Date().toISOString(), stage })}\n`,
    );
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
      releaseLock(stateDir, PAPER_LOCK);
      closeLog();
    },
  };
}
