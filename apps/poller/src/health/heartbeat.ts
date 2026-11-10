/**
 * `<STATE_DIR>/heartbeat.json`, rewritten every 10 s (COLLECTOR-PLAN §1.4
 * item 3): the check task restarts a poller whose file is older than 2
 * minutes, and v1's notifier will read it to say "poller down" — its fields
 * are an interface (§1.6, "What later phases build on" 2). It works when
 * MongoDB does not.
 */
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { HEARTBEAT_FILE } from "../lock.js";
import type { Logger } from "../log.js";

export const HEARTBEAT_EVERY_MS = 10_000;

export type Heartbeat = {
  time: number;
  iso: string;
  pid: number;
  startedAt: number;
  connections: Record<string, { open: boolean; lastFrameAt: number | null }>;
  jobs: Record<string, { lastRunAt: number | null; lastOkAt: number | null }>;
  tokensLastMinute: number;
  rest: Record<string, number>;
  streams: Record<string, number>;
  files: Record<string, unknown>;
  db: Record<string, number>;
  audit: Record<string, number> | null;
  memory: {
    rssMb: number;
    heapUsedMb: number;
    heapTotalMb: number;
    externalMb: number;
    arrayBuffersMb: number;
  };
};

/** The time of the last heartbeat an earlier run left, to measure the gap at start. */
export function readLastHeartbeat(stateDir: string): number | null {
  try {
    const parsed = JSON.parse(
      readFileSync(path.join(stateDir, HEARTBEAT_FILE), "utf8"),
    ) as { time?: unknown };
    return typeof parsed.time === "number" ? parsed.time : null;
  } catch {
    return null;
  }
}

/** Writes now and every 10 s; `stop()` ends it, and so does the test switch. */
export function startHeartbeat(
  stateDir: string,
  build: () => Heartbeat,
  log: Logger,
): { stop: () => void } {
  const file = path.join(stateDir, HEARTBEAT_FILE);
  const tmp = `${file}.tmp`;
  const beat = () => {
    try {
      writeFileSync(tmp, `${JSON.stringify(build(), null, 2)}\n`);
      renameSync(tmp, file);
    } catch (err) {
      log.warn({ err }, "heartbeat not written; next try in 10 s");
    }
  };
  beat();
  const timer = setInterval(beat, HEARTBEAT_EVERY_MS);
  return { stop: () => clearInterval(timer) };
}
