import { spawnSync } from "node:child_process";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pino } from "pino";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  readLastHeartbeat,
  startHeartbeat,
  type Heartbeat,
} from "../src/health/heartbeat.js";
import {
  HEARTBEAT_FILE,
  LOCK_FILE,
  lockHeld,
  releaseLock,
  takeLock,
} from "../src/lock.js";

const log = pino({ level: "silent" });
const dir = () => mkdtempSync(path.join(tmpdir(), "poller-lock-"));
/** A process id that existed a moment ago and does no more. */
const deadPid = () => spawnSync(process.execPath, ["-e", ""]).pid;

afterEach(() => {
  vi.useRealTimers();
});

describe("lockHeld", () => {
  it("holds only for a live holder with a heartbeat under 2 minutes", () => {
    expect(lockHeld(10, 20, true, 119_999)).toBe(true);
    expect(lockHeld(10, 20, true, 120_000)).toBe(false);
    expect(lockHeld(10, 20, false, 1_000)).toBe(false);
    expect(lockHeld(10, 20, true, null)).toBe(false);
    expect(lockHeld(null, 20, true, 1_000)).toBe(false);
    expect(lockHeld(20, 20, true, 1_000)).toBe(false);
  });
});

describe("takeLock", () => {
  it("takes a free lock and writes its own pid", () => {
    const d = dir();
    expect(takeLock(d)).toEqual({ taken: true });
    expect(readFileSync(path.join(d, LOCK_FILE), "utf8")).toBe(
      `${process.pid}\n`,
    );
    releaseLock(d);
    expect(existsSync(path.join(d, LOCK_FILE))).toBe(false);
  });

  it("refuses a second start while the holder lives and its heartbeat is fresh", () => {
    const d = dir();
    writeFileSync(path.join(d, LOCK_FILE), `${process.ppid}\n`);
    writeFileSync(path.join(d, HEARTBEAT_FILE), "{}");
    const result = takeLock(d);
    expect(result).toMatchObject({ taken: false, holderPid: process.ppid });
    expect(readFileSync(path.join(d, LOCK_FILE), "utf8")).toBe(
      `${process.ppid}\n`,
    );
    releaseLock(d);
    expect(existsSync(path.join(d, LOCK_FILE))).toBe(true);
  });

  it("takes over from a holder that is gone, or whose heartbeat is stale", () => {
    const gone = dir();
    writeFileSync(path.join(gone, LOCK_FILE), `${deadPid()}\n`);
    writeFileSync(path.join(gone, HEARTBEAT_FILE), "{}");
    expect(takeLock(gone)).toEqual({ taken: true });

    const stale = dir();
    writeFileSync(path.join(stale, LOCK_FILE), `${process.ppid}\n`);
    writeFileSync(path.join(stale, HEARTBEAT_FILE), "{}");
    const threeMinutesAgo = (Date.now() - 180_000) / 1_000;
    utimesSync(
      path.join(stale, HEARTBEAT_FILE),
      threeMinutesAgo,
      threeMinutesAgo,
    );
    expect(takeLock(stale)).toEqual({ taken: true });
    expect(readFileSync(path.join(stale, LOCK_FILE), "utf8")).toBe(
      `${process.pid}\n`,
    );
  });
});

describe("the heartbeat", () => {
  it("is written at once and every 10 s, whole, and can be stopped", async () => {
    vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
    const d = dir();
    let n = 0;
    const beat = (): Heartbeat => ({
      time: 1_794_272_400_000 + n++ * 10_000,
      iso: "",
      pid: process.pid,
      startedAt: 0,
      connections: {},
      jobs: {},
      tokensLastMinute: 0,
      rest: {},
      streams: {},
      files: {},
      audit: null,
      memory: {
        rssMb: 0,
        heapUsedMb: 0,
        heapTotalMb: 0,
        externalMb: 0,
        arrayBuffersMb: 0,
      },
    });
    const heartbeat = startHeartbeat(d, beat, log);
    expect(readLastHeartbeat(d)).toBe(1_794_272_400_000);
    await vi.advanceTimersByTimeAsync(20_000);
    expect(readLastHeartbeat(d)).toBe(1_794_272_420_000);
    heartbeat.stop();
    await vi.advanceTimersByTimeAsync(20_000);
    expect(readLastHeartbeat(d)).toBe(1_794_272_420_000);
    expect(existsSync(path.join(d, `${HEARTBEAT_FILE}.tmp`))).toBe(false);
  });

  it("reads no time from a missing or broken file", () => {
    const d = dir();
    expect(readLastHeartbeat(d)).toBeNull();
    writeFileSync(path.join(d, HEARTBEAT_FILE), "{");
    expect(readLastHeartbeat(d)).toBeNull();
  });
});
