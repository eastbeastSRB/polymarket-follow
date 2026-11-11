import { pino } from "pino";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  GIB,
  diskRules,
  diskState,
  startDiskWatch,
  type DiskReading,
  type DiskRule,
} from "../src/health/disk.js";
import { HOUR_MS } from "../src/schedule.js";

const log = pino({ level: "silent" });

describe("diskState", () => {
  it("warns under the warning line and stops under the stop line, each line itself ok", () => {
    const rule = { warnGiB: 15, stopGiB: 6 };
    expect(diskState(15 * GIB, rule)).toBe("ok");
    expect(diskState(15 * GIB - 1, rule)).toBe("warn");
    expect(diskState(6 * GIB, rule)).toBe("warn");
    expect(diskState(6 * GIB - 1, rule)).toBe("stop");
  });
});

describe("diskRules", () => {
  it("watches C: for the database and the recordings' own disk", () => {
    expect(diskRules("F:\\polymarket-follow\\recordings")).toEqual([
      {
        name: "database",
        path: "C:\\",
        warnGiB: 15,
        stopGiB: 6,
        stops: "database writes",
      },
      {
        name: "recordings",
        path: "F:\\",
        warnGiB: 50,
        stopGiB: 10,
        stops: "stream files",
      },
    ]);
  });
});

describe("startDiskWatch", () => {
  afterEach(() => vi.useRealTimers());

  it("reads at start and every hour, and reports each change of state from ok, and nothing else", () => {
    vi.useFakeTimers();
    const [db, files] = diskRules("F:\\recordings") as [DiskRule, DiskRule];
    const free: Record<string, number> = { "C:\\": 40 * GIB, "F:\\": 40 * GIB };
    const heard: string[] = [];
    const watch = startDiskWatch(
      [db, files],
      (rule, r: DiskReading) =>
        heard.push(`${rule.name} ${r.state} ${r.freeGiB}`),
      log,
      (p) => free[p]!,
    );
    // C: at 40 GiB is ok (not heard); F: at 40 GiB is under its 50 GiB line.
    expect(heard).toEqual(["recordings warn 40"]);
    expect(watch.readings()).toEqual({
      database: { path: "C:\\", freeGiB: 40, state: "ok" },
      recordings: { path: "F:\\", freeGiB: 40, state: "warn" },
    });
    free["F:\\"] = 9.5 * GIB;
    free["C:\\"] = 14 * GIB;
    vi.advanceTimersByTime(HOUR_MS - 1);
    expect(heard).toHaveLength(1);
    vi.advanceTimersByTime(1);
    expect(heard).toEqual([
      "recordings warn 40",
      "database warn 14",
      "recordings stop 9.5",
    ]);
    vi.advanceTimersByTime(HOUR_MS);
    expect(heard).toHaveLength(3);
    free["F:\\"] = 60 * GIB;
    vi.advanceTimersByTime(HOUR_MS);
    expect(heard.at(-1)).toBe("recordings ok 60");
    watch.stop();
    free["C:\\"] = 1 * GIB;
    vi.advanceTimersByTime(HOUR_MS);
    expect(heard).toHaveLength(4);
  });

  it("keeps a disk's last state when it cannot be read", () => {
    vi.useFakeTimers();
    const rules = diskRules("F:\\recordings");
    let failing = false;
    const heard: string[] = [];
    const watch = startDiskWatch(
      rules,
      (rule, r) => heard.push(`${rule.name} ${r.state}`),
      log,
      (p) => {
        if (failing && p === "F:\\") throw new Error("no such drive");
        return 5 * GIB;
      },
    );
    expect(heard).toEqual(["database stop", "recordings stop"]);
    failing = true;
    vi.advanceTimersByTime(HOUR_MS);
    expect(heard).toHaveLength(2);
    expect(watch.readings().recordings?.state).toBe("stop");
    watch.stop();
  });
});
