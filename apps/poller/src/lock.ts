/**
 * One poller at a time (COLLECTOR-PLAN §1.4 item 2): two would double the
 * connections and the tokens. The lock file names its holder; a start that
 * finds a live holder with a fresh heartbeat exits. A crashed holder (its
 * process gone) or a stale heartbeat (after a restart of the PC, where a pid
 * can be reused) frees it.
 */
import {
  closeSync,
  openSync,
  readFileSync,
  rmSync,
  statSync,
  writeSync,
} from "node:fs";
import path from "node:path";

export const STALE_HEARTBEAT_MS = 2 * 60_000;
export const LOCK_FILE = "poller.lock";
export const HEARTBEAT_FILE = "heartbeat.json";

/** A program's lock and the heartbeat that keeps it fresh; the paper experiment has its own pair. */
export type LockFiles = { lock: string; heartbeat: string };
const POLLER_FILES: LockFiles = { lock: LOCK_FILE, heartbeat: HEARTBEAT_FILE };

export function lockHeld(
  holderPid: number | null,
  ownPid: number,
  holderAlive: boolean,
  heartbeatAgeMs: number | null,
): boolean {
  return (
    holderPid !== null &&
    holderPid !== ownPid &&
    holderAlive &&
    heartbeatAgeMs !== null &&
    heartbeatAgeMs < STALE_HEARTBEAT_MS
  );
}

export type LockResult =
  { taken: true } | { taken: false; holderPid: number; heartbeatAgeMs: number };

export function takeLock(
  stateDir: string,
  now = Date.now(),
  files = POLLER_FILES,
): LockResult {
  const lock = path.join(stateDir, files.lock);
  const holderPid = readPid(lock);
  const heartbeatAgeMs = ageMs(path.join(stateDir, files.heartbeat), now);
  if (
    holderPid !== null &&
    lockHeld(holderPid, process.pid, isAlive(holderPid), heartbeatAgeMs)
  ) {
    return { taken: false, holderPid, heartbeatAgeMs: heartbeatAgeMs ?? 0 };
  }
  rmSync(lock, { force: true });
  let fd: number;
  try {
    fd = openSync(lock, "wx");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "EEXIST") throw err;
    return { taken: false, holderPid: readPid(lock) ?? 0, heartbeatAgeMs: 0 };
  }
  try {
    writeSync(fd, `${process.pid}\n`);
  } finally {
    closeSync(fd);
  }
  return { taken: true };
}

export function releaseLock(stateDir: string, files = POLLER_FILES): void {
  const lock = path.join(stateDir, files.lock);
  if (readPid(lock) === process.pid) rmSync(lock, { force: true });
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
