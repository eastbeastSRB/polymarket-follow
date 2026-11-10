import { pino } from "pino";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RestClient } from "../src/api/rest-client.js";
import { parseRunFor } from "../src/config.js";
import { instrumentsJob, liveMarkets } from "../src/jobs/instruments.js";
import { startJobs } from "../src/jobs/run.js";
import { logsToDelete } from "../src/log.js";
import { MINUTE_MS } from "../src/schedule.js";

const log = pino({ level: "silent" });
afterEach(() => {
  vi.useRealTimers();
});

describe("startJobs", () => {
  it("runs a job at start and on each slot, skipping a slot while the last run is still going", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(Date.parse("2026-11-10T12:00:30Z"));
    const started: string[] = [];
    let finish: ((ok: boolean) => void) | undefined;
    const jobs = startJobs(
      [
        {
          name: "slow",
          schedule: { everyMs: MINUTE_MS, offsetMs: 0 },
          run: () => {
            started.push(new Date().toISOString());
            return new Promise<boolean>((resolve) => (finish = resolve));
          },
        },
      ],
      log,
    );
    await vi.advanceTimersByTimeAsync(2 * MINUTE_MS);
    expect(started).toEqual(["2026-11-10T12:00:30.000Z"]);
    expect(jobs.status()).toEqual({
      slow: { lastRunAt: Date.parse("2026-11-10T12:00:30Z"), lastOkAt: null },
    });
    finish?.(true);
    await vi.advanceTimersByTimeAsync(MINUTE_MS);
    expect(started).toEqual([
      "2026-11-10T12:00:30.000Z",
      "2026-11-10T12:03:00.000Z",
    ]);
    expect(jobs.status().slow).toEqual({
      lastRunAt: Date.parse("2026-11-10T12:03:00Z"),
      lastOkAt: Date.parse("2026-11-10T12:02:30Z"),
    });
    finish?.(false);
    await vi.advanceTimersByTimeAsync(1);
    expect(jobs.status().slow?.lastOkAt).toBe(
      Date.parse("2026-11-10T12:02:30Z"),
    );
    jobs.stop();
  });

  it("starts a job that waits for its slot only at that slot", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(Date.parse("2026-11-10T12:00:30Z"));
    const started: string[] = [];
    const jobs = startJobs(
      [
        {
          name: "audit",
          schedule: { everyMs: 10 * MINUTE_MS, offsetMs: 7 * MINUTE_MS },
          waitForSlot: true,
          run: () => {
            started.push(new Date().toISOString());
            return Promise.resolve(true);
          },
        },
      ],
      log,
    );
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(started).toEqual([]);
    await vi.advanceTimersByTimeAsync(5 * MINUTE_MS);
    expect(started).toEqual(["2026-11-10T12:07:00.000Z"]);
    jobs.stop();
  });
});

describe("instrumentsJob", () => {
  it("reads a market that left the list once by id", async () => {
    const lists = [
      [1, 2, 3],
      [1, 3],
      [1, 2, 3],
      [3, 4],
    ];
    const asked: unknown[] = [];
    const client = {
      get: (route: string, query?: Record<string, number>) => {
        asked.push(query ? { route, ...query } : route);
        const ids = query ? [] : lists.shift()!;
        return Promise.resolve({
          ok: true,
          recvMs: 0,
          data: ids.map((instrument_id) => ({
            instrument_id,
            symbol: `S${instrument_id}`,
          })),
        });
      },
    } as unknown as RestClient;
    const handed: number[][] = [];
    const job = instrumentsJob(client, log, (ids) => handed.push(ids));
    for (let i = 0; i < 4; i += 1) await job.run();
    expect(asked).toEqual([
      "instruments",
      "instruments",
      { route: "instruments", instrument_id: 2 },
      "instruments",
      "instruments",
      { route: "instruments", instrument_id: 1 },
    ]);
    expect(handed).toEqual([
      [1, 2, 3],
      [1, 3],
      [1, 2, 3],
      [3, 4],
    ]);
  });

  it("hands on only the markets not settled, in id order", () => {
    expect(
      liveMarkets([
        { instrument_id: 9, symbol: "B" },
        { instrument_id: 51, symbol: "K", settlement: { timestamp: 1 } },
        { instrument_id: 2, symbol: "A", settlement: null },
      ]),
    ).toEqual([2, 9]);
  });
});

describe("parseRunFor", () => {
  it("takes a whole number of seconds, and nothing means no end", () => {
    expect(parseRunFor(["--run-for=1800"])).toBe(1_800);
    expect(parseRunFor([])).toBeNull();
    expect(() => parseRunFor(["--run-for=0"])).toThrow();
    expect(() => parseRunFor(["--run-for=1.5"])).toThrow();
  });
});

describe("logsToDelete", () => {
  it("deletes the daily logs older than 30 days and nothing else", () => {
    const now = Date.parse("2026-12-15T10:00:00Z");
    expect(
      logsToDelete(
        [
          "poller-2026-11-14.log",
          "poller-2026-11-15.log",
          "poller-2026-12-15.log",
          "stdout.log",
        ],
        now,
      ),
    ).toEqual(["poller-2026-11-14.log"]);
  });
});
