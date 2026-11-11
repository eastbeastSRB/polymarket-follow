import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import type { Heartbeat } from "../src/health/heartbeat.js";
import {
  backupRow,
  readDayFacts,
  readHeartbeat,
  statusLines,
  type DayFacts,
} from "../src/health/status.js";

const NOW = Date.parse("2026-11-11T16:00:00Z");

const beat: Heartbeat = {
  time: NOW - 4_000,
  iso: new Date(NOW - 4_000).toISOString(),
  pid: 26852,
  startedAt: Date.parse("2026-11-11T15:47:43Z"),
  connections: {
    "book-1": { open: true, lastFrameAt: NOW - 4_100 },
    "trades-1": { open: false, lastFrameAt: NOW - 5_000 },
    "book-2": { open: true, lastFrameAt: NOW - 20_000 },
  },
  jobs: {
    tickers: { lastRunAt: NOW - 55_000, lastOkAt: NOW - 55_000 },
    "board-pass": { lastRunAt: null, lastOkAt: null },
  },
  tokensLastMinute: 4,
  rest: { calls: 10, ok: 10, rateLimited: 0, peakMinute: 12, peakBurst: 8 },
  streams: { bookFrames: 205_740, rejected: 0, stalls: 0 },
  files: { lines: { book: 18_687, trades: 246 }, notStored: 0 },
  db: { done: 2, failed: 0, waiting: 0, refused: 0 },
  audit: { rows: 90, agree: 88, timingMiss: 2, otherMiss: 0, noBook: 0 },
  memory: {
    rssMb: 142.6,
    heapUsedMb: 30,
    heapTotalMb: 40,
    externalMb: 5,
    arrayBuffersMb: 1,
  },
  clock: { minuteStart: NOW - 60_000, minOffsetMs: 2_400 },
  disk: {
    database: { path: "C:\\", freeGiB: 39.1, state: "ok" },
    recordings: { path: "F:\\", freeGiB: 9.4, state: "stop" },
  },
};

const day: DayFacts = {
  date: "2026-11-11",
  files: [
    { name: "book-14.jsonl.br", bytes: 20_000_000 },
    { name: "book-15.jsonl", bytes: 5_000_000 },
    { name: "rest-15.jsonl", bytes: 100_000 },
    { name: "coverage.jsonl", bytes: 400 },
  ],
  coverage: [
    { at: NOW - 3_600_000, event: "process_start", lastHeartbeatAt: null },
    {
      at: Date.parse("2026-11-11T15:47:43Z"),
      event: "process_start",
      lastHeartbeatAt: Date.parse("2026-11-11T15:46:43Z"),
    },
    { at: NOW - 600_000, event: "ws_open" },
  ],
  unreadableCoverage: 1,
  yesterday: { date: "2026-11-10", manifestFiles: 70 },
};

describe("statusLines", () => {
  it("prints every row, with its state", () => {
    const text = statusLines(beat, 4_000, day, backupRow(null, NOW)).join("\n");
    for (const row of [
      "process: ok - pid 26852, heartbeat 4.0 s old, started 2026-11-11T15:47:43.000Z, rss 142.6 MB",
      "connection book-1: ok - open, last frame 0.1 s before the heartbeat",
      "connection trades-1: WATCH - closed, last frame 1.0 s before the heartbeat",
      "connection book-2: WATCH - open, last frame 16.0 s before the heartbeat",
      "job tickers: last run 15:59:05Z, last ok 15:59:05Z",
      "job board-pass: last run never, last ok never",
      "budget: 4 tokens in the last minute of the share's 50; peak 12 a minute, 8 in 5 s",
      "replies: calls 10, ok 10, rateLimited 0, peakMinute 12, peakBurst 8",
      "streams: bookFrames 205740, rejected 0, stalls 0",
      'files: lines {"book":18687,"trades":246}, notStored 0',
      "database: done 2, failed 0, waiting 0, refused 0",
      "price audit: rows 90, agree 88, timingMiss 2, otherMiss 0, noBook 0",
      "clock: WATCH - the books' smallest receive - ts 2400 ms in the minute from 15:59:00Z",
      "disk database: ok - C:\\ 39.1 GiB free",
      "disk recordings: STOP - F:\\ 9.4 GiB free",
      "backup: WATCH - none yet",
      "day 2026-11-11 book: 2 file(s), 1 plain, 25.0 MB",
      "day 2026-11-11 rest: 1 file(s), 1 plain, 0.1 MB",
      "day 2026-11-11 coverage: process_start 2, ws_open 1; 1 unreadable line(s)",
      "day 2026-11-11 last start: 15:47:43Z, 60.0 s after the last heartbeat",
      "day 2026-11-10: manifest of 70 file(s)",
    ]) {
      expect(text).toContain(row);
    }
  });

  it("says DOWN for an old or missing heartbeat, and ok for a clock under 2 s", () => {
    expect(statusLines(beat, 120_000, day, "backup: x")[0]).toMatch(
      /^process: DOWN - pid 26852/,
    );
    expect(statusLines(null, null, day, "backup: x")[0]).toBe(
      "process: DOWN - no readable heartbeat file",
    );
    const calm = {
      ...beat,
      clock: { minuteStart: NOW - 60_000, minOffsetMs: 2_000 },
    };
    expect(statusLines(calm, 4_000, day, "backup: x").join("\n")).toContain(
      "clock: ok - ",
    );
  });
});

describe("status from the folders", () => {
  it("reads names, sizes, coverage and the manifest, and prints no field of a row (§1.3 item 7)", () => {
    const root = mkdtempSync(path.join(tmpdir(), "poller-status-"));
    const state = path.join(root, "var");
    const today = path.join(root, "recordings", "2026-11-11");
    const yesterday = path.join(root, "recordings", "2026-11-10");
    mkdirSync(state, { recursive: true });
    mkdirSync(today, { recursive: true });
    mkdirSync(yesterday, { recursive: true });
    const row =
      '{"account":"0xdeadbeefcafe","pnl":"123456.789","price":"98765.4321"}';
    writeFileSync(path.join(today, "book-15.jsonl"), `${NOW}\t${row}\n`);
    writeFileSync(path.join(today, "rest-15.jsonl"), `${NOW}\t${row}\n`);
    writeFileSync(
      path.join(today, "coverage.jsonl"),
      `${NOW - 1_000}\t{"event":"process_start","pid":1,"lastHeartbeatAt":${NOW - 61_000}}\nnot json\n`,
    );
    writeFileSync(
      path.join(yesterday, "manifest.json"),
      '{"date":"2026-11-10","files":[{},{}]}',
    );
    writeFileSync(path.join(state, "heartbeat.json"), JSON.stringify(beat));
    const read = readHeartbeat(state, Date.now());
    expect(read?.heartbeat.pid).toBe(26852);
    const facts = readDayFacts(path.join(root, "recordings"), NOW);
    expect(facts.coverage).toHaveLength(1);
    expect(facts.unreadableCoverage).toBe(1);
    expect(facts.yesterday).toEqual({ date: "2026-11-10", manifestFiles: 2 });
    const text = statusLines(
      read!.heartbeat,
      read!.ageMs,
      facts,
      "backup: x",
    ).join("\n");
    expect(text).toContain("day 2026-11-11 book: 1 file(s), 1 plain");
    expect(text).toContain(
      "last start: 15:59:59Z, 60.0 s after the last heartbeat",
    );
    for (const value of [
      "0xdeadbeefcafe",
      "123456.789",
      "98765.4321",
      "account",
      "pnl",
    ]) {
      expect(text).not.toContain(value);
    }
  });

  it("has no heartbeat to read in a folder without one, or with one that does not parse", () => {
    const state = mkdtempSync(path.join(tmpdir(), "poller-status-"));
    expect(readHeartbeat(state, NOW)).toBeNull();
    writeFileSync(path.join(state, "heartbeat.json"), '{"pid":"x"}');
    expect(readHeartbeat(state, NOW)).toBeNull();
  });
});

describe("backupRow", () => {
  it("is ok for an ok line under 36 hours old, and a WATCH otherwise", () => {
    const at = (h: number) => new Date(NOW - h * 3_600_000).toISOString();
    expect(backupRow(`${at(5)} ok F:\\d.gz 10 B`, NOW)).toBe(
      `backup: ok - ${at(5)} ok F:\\d.gz 10 B`,
    );
    expect(backupRow(`${at(36)} ok F:\\d.gz 10 B`, NOW)).toMatch(
      /^backup: ok - /,
    );
    expect(backupRow(`${at(36.01)} ok F:\\d.gz 10 B`, NOW)).toMatch(
      /^backup: WATCH - /,
    );
    expect(backupRow(`${at(1)} FAILED no server`, NOW)).toMatch(
      /^backup: WATCH - .* FAILED no server$/,
    );
    expect(backupRow("garbage", NOW)).toMatch(/^backup: WATCH - garbage$/);
    expect(backupRow(null, NOW)).toBe("backup: WATCH - none yet");
  });
});
