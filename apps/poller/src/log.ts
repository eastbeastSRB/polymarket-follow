import { mkdirSync, readdirSync, rmSync } from "node:fs";
import path from "node:path";
import { pino, type Logger } from "pino";
import { DAY_MS, nextRun, utcDate } from "./schedule.js";

export type { Logger };

const KEEP_DAYS = 30;

/**
 * pino, JSON lines, one file a UTC day under `<STATE_DIR>/logs`, 30 days kept
 * (COLLECTOR-PLAN §1.4 item 11). `name` is the program's (`poller`, `paper`):
 * each writes and prunes only its own files.
 */
export function createLog(
  stateDir: string,
  name: string,
): {
  log: Logger;
  close: () => void;
} {
  const dir = path.join(stateDir, "logs");
  mkdirSync(dir, { recursive: true });
  const fileOf = (dayMs: number) =>
    path.join(dir, `${name}-${utcDate(dayMs)}.log`);
  // Synchronous: a few lines a minute, none lost to a crash, and the file is
  // open at once (an exit before an asynchronous open completed threw).
  const destination = pino.destination({
    dest: fileOf(Date.now()),
    mkdir: true,
    sync: true,
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
      deleteOldLogs(dir, midnight, name);
      scheduleNextDay();
    }, midnight - Date.now());
    timer.unref();
  };
  deleteOldLogs(dir, Date.now(), name);
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

export function logsToDelete(
  names: readonly string[],
  now: number,
  name: string,
): string[] {
  const oldestKept = utcDate(now - KEEP_DAYS * DAY_MS);
  const pattern = new RegExp(`^${name}-(\\d{4}-\\d{2}-\\d{2})\\.log$`);
  return names.filter((file) => {
    const day = pattern.exec(file)?.[1];
    return day !== undefined && day < oldestKept;
  });
}

function deleteOldLogs(dir: string, now: number, name: string): void {
  for (const file of logsToDelete(readdirSync(dir), now, name)) {
    rmSync(path.join(dir, file), { force: true });
  }
}
