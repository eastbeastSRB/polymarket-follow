/**
 * `<STATE_DIR>/heartbeat.json`, rewritten every 10 s (COLLECTOR-PLAN §1.4
 * item 3): the check task restarts a poller whose file is older than 2
 * minutes, `status` prints it, and v1's notifier will read it to say "poller
 * down" — its fields are an interface (§1.6, "What later phases build on" 2).
 * It works when MongoDB does not.
 */
import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { HEARTBEAT_FILE } from "../lock.js";
import type { Logger } from "../log.js";

export const HEARTBEAT_EVERY_MS = 10_000;

const ms = z.number();
const counts = z.record(z.string(), z.number());

export const Heartbeat = z.object({
  time: ms,
  iso: z.string(),
  pid: ms,
  startedAt: ms,
  connections: z.record(
    z.string(),
    z.object({ open: z.boolean(), lastFrameAt: ms.nullable() }),
  ),
  jobs: z.record(
    z.string(),
    z.object({ lastRunAt: ms.nullable(), lastOkAt: ms.nullable() }),
  ),
  tokensLastMinute: z.number(),
  rest: counts,
  streams: counts,
  files: z.record(z.string(), z.unknown()),
  db: counts,
  audit: counts.nullable(),
  memory: z.object({
    rssMb: z.number(),
    heapUsedMb: z.number(),
    heapTotalMb: z.number(),
    externalMb: z.number(),
    arrayBuffersMb: z.number(),
  }),
  /** The clock watch's last minute (health/clock-watch.ts). */
  clock: z.object({ minuteStart: ms, minOffsetMs: z.number() }).nullable(),
  /** Each watched disk's last reading (health/disk.ts). */
  disk: z.record(
    z.string(),
    z.object({
      path: z.string(),
      freeGiB: z.number(),
      state: z.enum(["ok", "warn", "stop"]),
    }),
  ),
});
export type Heartbeat = z.infer<typeof Heartbeat>;

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
