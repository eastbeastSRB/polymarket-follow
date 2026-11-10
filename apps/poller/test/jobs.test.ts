import { pino } from "pino";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RestClient } from "../src/api/rest-client.js";
import { parseRunFor } from "../src/config.js";
import { instrumentsJob } from "../src/jobs/instruments.js";
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
    let finish: (() => void) | undefined;
    const stop = startJobs(
      [
        {
          name: "slow",
          schedule: { everyMs: MINUTE_MS, offsetMs: 0 },
          run: () => {
            started.push(new Date().toISOString());
            return new Promise<void>((resolve) => (finish = resolve));
          },
        },
      ],
      log,
    );
    await vi.advanceTimersByTimeAsync(2 * MINUTE_MS);
    expect(started).toEqual(["2026-11-10T12:00:30.000Z"]);
    finish?.();
    await vi.advanceTimersByTimeAsync(MINUTE_MS);
    expect(started).toEqual([
      "2026-11-10T12:00:30.000Z",
      "2026-11-10T12:03:00.000Z",
    ]);
    stop();
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
    const job = instrumentsJob(client, log);
    for (let i = 0; i < 4; i += 1) await job.run();
    expect(asked).toEqual([
      "instruments",
      "instruments",
      { route: "instruments", instrument_id: 2 },
      "instruments",
      "instruments",
      { route: "instruments", instrument_id: 1 },
    ]);
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
