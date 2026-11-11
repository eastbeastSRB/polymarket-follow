/**
 * Free space, at start and every hour (COLLECTOR-PLAN §1.2, "Alarms";
 * decisions 2026-11-08): the database's disk (C:, the shared server's data)
 * warns under 15 GiB and stops our database writes under 6; the recordings'
 * disk warns under 50 GiB and stops the stream files under 10, while the
 * streams keep running for the watchdog. Each change of state is reported.
 */
import { statfsSync } from "node:fs";
import path from "node:path";
import type { Logger } from "../log.js";
import { HOUR_MS } from "../schedule.js";

export const GIB = 2 ** 30;

export type DiskState = "ok" | "warn" | "stop";
export type DiskRule = {
  name: "database" | "recordings";
  /** The disk's root, e.g. `C:\`. */
  path: string;
  warnGiB: number;
  stopGiB: number;
  /** What a stop stops, for the logs and `status`. */
  stops: string;
};
export type DiskReading = { path: string; freeGiB: number; state: DiskState };

/** The shared MongoDB server keeps its data on C: (decisions 2026-11-10, (7)). */
export function diskRules(recordingsRoot: string): DiskRule[] {
  return [
    {
      name: "database",
      path: "C:\\",
      warnGiB: 15,
      stopGiB: 6,
      stops: "database writes",
    },
    {
      name: "recordings",
      path: path.parse(recordingsRoot).root,
      warnGiB: 50,
      stopGiB: 10,
      stops: "stream files",
    },
  ];
}

export function diskState(
  freeBytes: number,
  rule: Pick<DiskRule, "warnGiB" | "stopGiB">,
): DiskState {
  if (freeBytes < rule.stopGiB * GIB) return "stop";
  if (freeBytes < rule.warnGiB * GIB) return "warn";
  return "ok";
}

export function freeBytes(path: string): number {
  const fs = statfsSync(path);
  return fs.bavail * fs.bsize;
}

/**
 * Reads every rule's disk now and every hour; `onChange` hears each change
 * of state, from "ok" before the first reading. A disk that cannot be read
 * keeps its last state and is logged.
 */
export function startDiskWatch(
  rules: readonly DiskRule[],
  onChange: (rule: DiskRule, reading: DiskReading) => void,
  log: Logger,
  read: (path: string) => number = freeBytes,
): { stop: () => void; readings: () => Record<string, DiskReading> } {
  const readings: Record<string, DiskReading> = {};
  const check = () => {
    for (const rule of rules) {
      let free: number;
      try {
        free = read(rule.path);
      } catch (err) {
        log.warn({ err, disk: rule.name }, "free space not read");
        continue;
      }
      const reading: DiskReading = {
        path: rule.path,
        freeGiB: Math.round((free / GIB) * 10) / 10,
        state: diskState(free, rule),
      };
      const changed = (readings[rule.name]?.state ?? "ok") !== reading.state;
      readings[rule.name] = reading;
      if (changed) onChange(rule, reading);
    }
  };
  check();
  const timer = setInterval(check, HOUR_MS);
  return {
    stop: () => clearInterval(timer),
    readings: () => structuredClone(readings),
  };
}
