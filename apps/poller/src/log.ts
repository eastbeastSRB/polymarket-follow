import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { pino, type Logger } from "pino";
import { DAY_MS, nextRun, utcDate } from "./schedule.js";

export type { Logger };

const LOG_FILE = /^poller-(\d{4}-\d{2}-\d{2})\.log$/;
const KEEP_DAYS = 30;

/** pino, JSON lines, one file a UTC day under `<STATE_DIR>/logs`, 30 days kept (COLLECTOR-PLAN §1.4 item 11). */
export function createLog(stateDir: string): {
  log: Logger;
  close: () => void;
} {
  const dir = path.join(stateDir, "logs");
  mkdirSync(dir, { recursive: true });
  const fileOf = (dayMs: number) =>
    path.join(dir, `poller-${utcDate(dayMs)}.log`);
  const destination = pino.destination({
    dest: fileOf(Date.now()),
    mkdir: true,
    sync: false,
  });
  const log = pino(
    { base: { pid: process.pid }, timestamp: pino.stdTimeFunctions.isoTime },
    destination,
  );
  let timer: NodeJS.Timeout | undefined;
  const scheduleNextDay = () => {
    const midnight = nextRun({ everyMs: DAY_MS, offsetMs: 0 }, Date.now());
    timer = setTimeout(() => {
      destination.reopen(fileOf(midnight));
      deleteOldLogs(dir, midnight);
      scheduleNextDay();
    }, midnight - Date.now());
    timer.unref();
  };
  deleteOldLogs(dir, Date.now());
  scheduleNextDay();
  return {
    log,
    close: () => {
      clearTimeout(timer);
      destination.flushSync();
      destination.end();
    },
  };
}

export function logsToDelete(names: readonly string[], now: number): string[] {
  const oldestKept = utcDate(now - KEEP_DAYS * DAY_MS);
  return names.filter((name) => {
    const day = LOG_FILE.exec(name)?.[1];
    return day !== undefined && day < oldestKept;
  });
}

function deleteOldLogs(dir: string, now: number): void {
  for (const name of logsToDelete(readdirSync(dir), now)) {
    rmSync(path.join(dir, name), { force: true });
  }
}
