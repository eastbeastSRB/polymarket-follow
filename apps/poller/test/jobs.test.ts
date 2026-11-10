import { pino } from "pino";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { RestClient } from "../src/api/rest-client.js";
import { parseRunFor } from "../src/config.js";
import { instrumentsJob, liveMarkets } from "../src/jobs/instruments.js";
import { exchangeJob } from "../src/jobs/minute-reads.js";
import { runsAtStart, startJobs } from "../src/jobs/run.js";
import { logsToDelete } from "../src/log.js";
import { DAY_MS, HOUR_MS, MINUTE_MS, missedSlots } from "../src/schedule.js";

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

  it("starts a job that never catches up only at its slot", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(Date.parse("2026-11-10T12:00:30Z"));
    const started: string[] = [];
    const jobs = startJobs(
      [
        {
          name: "audit",
          schedule: { everyMs: 10 * MINUTE_MS, offsetMs: 7 * MINUTE_MS },
          catchUpMs: 0,
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

  it("runs a daily job at start only inside its catch-up window, then not again that day", async () => {
    vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
    vi.setSystemTime(Date.parse("2026-11-10T23:50:00Z"));
    const started: string[] = [];
    const jobs = startJobs(
      [
        {
          name: "board-pass",
          schedule: {
            everyMs: DAY_MS,
            offsetMs: 23 * HOUR_MS + 38 * MINUTE_MS,
          },
          catchUpMs: 21.5 * MINUTE_MS,
          run: () => {
            started.push(new Date().toISOString());
            return Promise.resolve(true);
          },
        },
      ],
      log,
    );
    await vi.advanceTimersByTimeAsync(DAY_MS);
    expect(started).toEqual([
      "2026-11-10T23:50:00.000Z",
      "2026-11-11T23:38:00.000Z",
    ]);
    jobs.stop();
  });
});

describe("runsAtStart", () => {
  const job = {
    name: "board-pass",
    schedule: { everyMs: DAY_MS, offsetMs: 23 * HOUR_MS + 38 * MINUTE_MS },
    catchUpMs: 21.5 * MINUTE_MS,
    run: () => Promise.resolve(true),
  };
  it("is true from the slot to the end of the catch-up window, exclusive", () => {
    expect(runsAtStart(job, Date.parse("2026-11-10T23:37:59.999Z"))).toBe(
      false,
    );
    expect(runsAtStart(job, Date.parse("2026-11-10T23:38:00Z"))).toBe(true);
    expect(runsAtStart(job, Date.parse("2026-11-10T23:59:29.999Z"))).toBe(true);
    expect(runsAtStart(job, Date.parse("2026-11-10T23:59:30Z"))).toBe(false);
    expect(runsAtStart(job, Date.parse("2026-11-11T10:00:00Z"))).toBe(false);
  });

  it("is always true for a job without a window, never for one of 0", () => {
    const always = { ...job, catchUpMs: undefined };
    expect(runsAtStart(always, Date.parse("2026-11-11T10:00:00Z"))).toBe(true);
    expect(
      runsAtStart({ ...job, catchUpMs: 0 }, Date.parse("2026-11-10T23:38:00Z")),
    ).toBe(false);
  });
});

describe("missedSlots", () => {
  const schedule = { everyMs: DAY_MS, offsetMs: 23 * HOUR_MS + 38 * MINUTE_MS };
  const window = 21.5 * MINUTE_MS;
  it("names each pass whose whole window lay inside the gap", () => {
    expect(
      missedSlots(
        schedule,
        window,
        Date.parse("2026-11-10T22:00:00Z"),
        Date.parse("2026-11-13T00:10:00Z"),
      ).map((s) => new Date(s).toISOString()),
    ).toEqual([
      "2026-11-10T23:38:00.000Z",
      "2026-11-11T23:38:00.000Z",
      "2026-11-12T23:38:00.000Z",
    ]);
  });

  it("names none for a gap that began inside a window or ended before its end", () => {
    expect(
      missedSlots(
        schedule,
        window,
        Date.parse("2026-11-10T23:40:00Z"),
        Date.parse("2026-11-11T00:10:00Z"),
      ),
    ).toEqual([]);
    expect(
      missedSlots(
        schedule,
        window,
        Date.parse("2026-11-10T23:00:00Z"),
        Date.parse("2026-11-10T23:59:29Z"),
      ),
    ).toEqual([]);
    expect(
      missedSlots(
        schedule,
        window,
        Date.parse("2026-11-10T23:00:00Z"),
        Date.parse("2026-11-10T23:59:30Z"),
      ),
    ).toEqual([Date.parse("2026-11-10T23:38:00Z")]);
  });
});

describe("instrumentsJob", () => {
  it("reads a market that left the list once by id, and puts each list and settlement into the rule book", async () => {
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
        const data = query
          ? [
              {
                instrument_id: query.instrument_id,
                symbol: `S${query.instrument_id}`,
                settlement: {
                  sequence: 7,
                  timestamp: 1_794_000_000_000,
                  price: "353.87",
                  insurance_debit: "0",
                },
              },
            ]
          : lists.shift()!.map((instrument_id) => ({
              instrument_id,
              symbol: `S${instrument_id}`,
            }));
        return Promise.resolve({
          ok: true,
          recvMs: 5,
          served: { date: "d", age: "3" },
          data,
        });
      },
    } as unknown as RestClient;
    const rules: unknown[][] = [];
    const store = { noteRule: (...args: unknown[]) => rules.push(args) };
    const handed: number[][] = [];
    const job = instrumentsJob(client, store, log, (ids) => handed.push(ids));
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
    const served = { date: "d", age: "3" };
    expect(rules[0]).toEqual([
      "instruments",
      "list",
      [
        { instrument_id: 1, symbol: "S1" },
        { instrument_id: 2, symbol: "S2" },
        { instrument_id: 3, symbol: "S3" },
      ],
      5,
      served,
    ]);
    expect(rules.filter((r) => r[0] === "instruments")).toHaveLength(4);
    expect(rules.filter((r) => r[0] === "instrument")).toEqual([
      [
        "instrument",
        "2",
        {
          instrument_id: 2,
          symbol: "S2",
          settlement: { sequence: 7, timestamp: 1_794_000_000_000 },
        },
        5,
        served,
      ],
      [
        "instrument",
        "1",
        {
          instrument_id: 1,
          symbol: "S1",
          settlement: { sequence: 7, timestamp: 1_794_000_000_000 },
        },
        5,
        served,
      ],
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

describe("exchangeJob", () => {
  it("puts the maintenance flag and the engine version into the rule book with the reply's date and age", async () => {
    const replies = [
      { cancel_only: false, engine_version: "0.0.86" },
      { cancel_only: true, engine_version: "0.0.87" },
    ];
    const client = {
      get: () =>
        Promise.resolve({
          ok: true,
          recvMs: 9,
          served: { date: "Tue, 10 Nov 2026 12:00:00 GMT", age: "213" },
          data: {
            name: "x",
            version: "1",
            chain_id: 137,
            contract: "0x1",
            ...replies.shift()!,
          },
        }),
    } as unknown as RestClient;
    const rules: unknown[][] = [];
    const job = exchangeJob(
      client,
      { noteRule: (...args: unknown[]) => rules.push(args) },
      log,
    );
    expect(await job.run()).toBe(true);
    expect(await job.run()).toBe(true);
    expect(rules).toEqual([
      [
        "exchange",
        "marks",
        { cancel_only: false, engine_version: "0.0.86" },
        9,
        { date: "Tue, 10 Nov 2026 12:00:00 GMT", age: "213" },
      ],
      [
        "exchange",
        "marks",
        { cancel_only: true, engine_version: "0.0.87" },
        9,
        { date: "Tue, 10 Nov 2026 12:00:00 GMT", age: "213" },
      ],
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
