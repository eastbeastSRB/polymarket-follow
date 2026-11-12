/**
 * The night's whole REST path, 23:10Z to 00:30Z, on fake timers: the real
 * client and its admission, every job on its schedule, the competition pass
 * and the board pass beside the minute reads. Only the API (a fake `fetch`)
 * and the store are stand-ins; every value is made up.
 */
import { pino } from "pino";
import { afterEach, describe, expect, it, vi } from "vitest";
import { spentInWindow, type Spend } from "../src/api/admission.js";
import {
  COLLECTOR_LIMITS,
  COLLECTOR_SHARE,
  ROUTES,
  RestClient,
} from "../src/api/rest-client.js";
import type { Clock } from "../src/clock.js";
import { BOARD_PASS_GUARD_MS, boardPassJob } from "../src/jobs/board-pass.js";
import { competitionPassJob } from "../src/jobs/competition-pass.js";
import { dailyReadsJob } from "../src/jobs/daily-reads.js";
import { instrumentsJob } from "../src/jobs/instruments.js";
import { exchangeJob, tickersJob } from "../src/jobs/minute-reads.js";
import { priceAuditJob } from "../src/jobs/price-audit.js";
import { startJobs } from "../src/jobs/run.js";
import { MINUTE_MS, dayStart } from "../src/schedule.js";
import type { BoardSnapshot, CompetitionSnapshot } from "../src/store/db.js";
import { boardPage, tablePage } from "./fixtures.js";

const log = pino({ level: "silent" });
const START = Date.parse("2026-11-10T23:10:00Z");
const GUARD = dayStart(START) + BOARD_PASS_GUARD_MS;
const TABLE_ROWS = 5_232;
const competition = {
  competition_id: 1,
  status: "live",
  start_time: Date.parse("2026-11-02T14:30:00Z"),
  end_time: Date.parse("2026-11-16T14:30:00Z"),
};

function reply(url: URL): unknown {
  const offset = Number(url.searchParams.get("offset"));
  switch (url.pathname) {
    case ROUTES.exchange.path:
      return {
        name: "x",
        version: "1",
        chain_id: 137,
        contract: "0x",
        cancel_only: false,
        engine_version: "1",
      };
    case ROUTES.instruments.path:
      return [{ instrument_id: 1, symbol: "BTC-USD" }];
    case ROUTES.competitions.path:
      return { competitions: [competition] };
    case ROUTES.competition.path:
      return { ...competition, all_markets: true, markets: [] };
    case ROUTES["competition/leaderboard"].path:
      return tablePage(
        1,
        offset,
        TABLE_ROWS,
        Math.min(100, TABLE_ROWS - offset),
        Date.now() - 5_000,
      );
    case ROUTES.leaderboard.path:
      return boardPage(
        url.searchParams.get("window")!,
        url.searchParams.get("sort_by")!,
        offset,
        Date.now() - 1_000,
        6_000,
      );
    case ROUTES.fees.path:
      return { fee_schedule: [] };
    case ROUTES["stock-splits"].path:
      return { events: [], sequence: 1 };
    default:
      return [];
  }
}

/** A poller's REST side from `start` for `minutes`; `dbReadMs`: how long each read of the database takes to answer. */
async function night(dbReadMs = 0, start = START, minutes = 80) {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  vi.setSystemTime(start);
  const clock: Clock = {
    wall: () => Date.now(),
    monotonic: () => Date.now(),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
  };
  const calls: { at: number; path: string; weight: number }[] = [];
  const fetchFn = (async (input: string) => {
    const url = new URL(input);
    const route = Object.values(ROUTES).find((r) => r.path === url.pathname)!;
    calls.push({ at: Date.now(), path: url.pathname, weight: route.weight });
    await clock.sleep(300);
    return new Response(JSON.stringify(reply(url)), { status: 200 });
  }) as typeof fetch;
  const client = new RestClient(
    ROUTES,
    COLLECTOR_LIMITS,
    { write: () => undefined },
    log,
    fetchFn,
    clock,
  );
  const boards: BoardSnapshot[] = [];
  const tables: CompetitionSnapshot[] = [];
  const coverage: unknown[] = [];
  const store = {
    saveBoard: (doc: BoardSnapshot) => void boards.push(doc),
    saveCompetition: (doc: CompetitionSnapshot) => void tables.push(doc),
    noteSeen: () => undefined,
    noteRule: () => undefined,
    boardTop: async () => {
      await clock.sleep(dbReadMs);
      return null;
    },
    boardsStored: async () => {
      await clock.sleep(dbReadMs);
      return new Set<string>();
    },
  };
  const none = { rows: 0, agree: 0, timingMiss: 0, otherMiss: 0, noBook: 0 };
  const jobs = startJobs(
    [
      tickersJob(client),
      exchangeJob(client, store, log),
      instrumentsJob(client, store, log, () => undefined),
      priceAuditJob(client, () => none, log, clock),
      competitionPassJob(client, store, log, clock),
      boardPassJob(
        client,
        store,
        { coverage: (e) => void coverage.push(e) },
        log,
        clock,
      ),
      dailyReadsJob(client, store),
    ],
    log,
  );
  await vi.advanceTimersByTimeAsync(minutes * MINUTE_MS);
  jobs.stop();
  vi.useRealTimers();

  const spends: Spend[] = [];
  let peakMinute = 0;
  let peakBurst = 0;
  for (const call of calls) {
    spends.push({ at: call.at, weight: call.weight });
    peakMinute = Math.max(peakMinute, spentInWindow(spends, call.at, 60_000));
    peakBurst = Math.max(peakBurst, spentInWindow(spends, call.at, 5_000));
  }
  const of = (route: keyof typeof ROUTES) =>
    calls.filter((c) => c.path === ROUTES[route].path);
  return {
    client,
    boards,
    tables,
    coverage,
    count: (route: keyof typeof ROUTES) => of(route).length,
    /** When the first and the last call of a route were sent, or null. */
    firstAt: (route: keyof typeof ROUTES) => of(route)[0]?.at ?? null,
    lastAt: (route: keyof typeof ROUTES) => of(route).at(-1)?.at ?? null,
    peakMinute,
    peakBurst,
  };
}

afterEach(() => {
  vi.useRealTimers();
});

describe("the night's passes beside the minute reads", () => {
  it("keep every trailing minute within 50 tokens and every 5 s within 30, drop nothing, and read all 16 boards before 23:59:30Z", async () => {
    const n = await night();

    // Each pass begins in its slot's first 100 ms.
    const slots = [
      ["competitions", "2026-11-10T23:15:00Z"],
      ["leaderboard", "2026-11-10T23:38:00Z"],
      ["stock-splits", "2026-11-11T00:20:00Z"],
    ] as const;
    for (const [route, slot] of slots) {
      const after = n.firstAt(route)! - Date.parse(slot);
      expect([route, after >= 0 && after < 100]).toEqual([route, true]);
    }
    // The board pass's 45 and the minute reads' 4: admission never has to hold a page.
    expect(n.peakMinute).toBe(49);
    expect(n.peakBurst).toBe(12);
    expect(n.client.counts).toMatchObject({
      dropped: 0,
      rateLimited: 0,
      rejected: 0,
      peakMinute: n.peakMinute,
      peakBurst: n.peakBurst,
    });
    expect(n.client.counts.ok).toBe(n.client.counts.calls);

    // No minute read was held back long enough to miss its next slot.
    expect(n.count("tickers")).toBe(81);
    expect(n.count("exchange")).toBe(17);
    expect(n.count("instruments")).toBe(9);
    expect(n.count("bbo")).toBe(8);
    expect(n.count("competitions")).toBe(1);
    expect(n.count("competition")).toBe(1);
    expect(n.count("competition/leaderboard")).toBe(53);
    expect(n.count("leaderboard")).toBe(160);
    expect(n.count("stock-splits")).toBe(1);
    expect(n.count("fees")).toBe(1);

    expect(n.tables).toHaveLength(1);
    expect(n.tables[0]).toMatchObject({ complete: true, total: TABLE_ROWS });
    expect(n.tables[0]!.rows).toHaveLength(TABLE_ROWS);
    expect(n.boards).toHaveLength(16);
    expect(n.boards.every((b) => b.complete && b.rows.length === 1_000)).toBe(
      true,
    );
    expect(n.boards.every((b) => b.passDate === "2026-11-10")).toBe(true);
    expect(n.coverage).toEqual([]);
    expect(n.lastAt("leaderboard")).toBeLessThan(
      Date.parse("2026-11-10T23:57:00Z"),
    );
  });

  it("still read all 16 boards before 23:59:30Z when each read of the database takes its 10 s to fail", async () => {
    const n = await night(10_000);
    expect(n.peakMinute).toBeLessThanOrEqual(COLLECTOR_SHARE);
    expect(n.boards).toHaveLength(16);
    expect(n.boards.every((b) => b.complete)).toBe(true);
    expect(n.coverage).toEqual([]);
    expect(n.lastAt("leaderboard")).toBeLessThan(GUARD);
    expect(n.client.counts.dropped).toBe(0);
  });
});

describe("a start inside a pass's window (a restart)", () => {
  // "At once": within two windows of the collector's burst of 15 in 5 s (decisions 2026-11-12, the two fresh reviews (7)).
  const AT_ONCE_MS = 10_000;

  it("runs the competition pass at once from 23:15Z until the board pass begins, and no other pass", async () => {
    const start = Date.parse("2026-11-10T23:20:00Z");
    const n = await night(0, start, 3);
    expect(n.firstAt("competitions")! - start).toBeLessThan(AT_ONCE_MS);
    expect(n.count("competition/leaderboard")).toBe(53);
    expect(n.count("leaderboard")).toBe(0);
    expect(n.count("stock-splits")).toBe(0);
  });

  it("runs the board pass at once from 23:38Z, sends no page from 23:59:30Z and logs the boards it missed", async () => {
    const start = Date.parse("2026-11-10T23:45:00Z");
    const n = await night(0, start, 16);
    expect(n.firstAt("leaderboard")! - start).toBeLessThan(AT_ONCE_MS);
    expect(n.lastAt("leaderboard")).toBeLessThan(GUARD);
    expect(n.count("competitions")).toBe(0);
    expect(n.boards.map((b) => b.complete)).toEqual([
      ...Array.from({ length: 12 }, () => true),
      false,
    ]);
    expect(n.coverage).toEqual([
      {
        event: "boards_missed",
        passDate: "2026-11-10",
        boards: ["day:notional", "day:account_value", "day:roi"],
      },
    ]);
  });

  it("runs no board pass from 23:59:30Z", async () => {
    const n = await night(0, GUARD, 1);
    expect(n.count("leaderboard")).toBe(0);
    expect(n.count("tickers")).toBeGreaterThan(0);
  });

  it("runs the daily reads at once for two hours after 00:20Z, and not after", async () => {
    const start = Date.parse("2026-11-11T01:00:00Z");
    const inside = await night(0, start, 1);
    expect(inside.firstAt("stock-splits")! - start).toBeLessThan(AT_ONCE_MS);
    expect(inside.count("fees")).toBe(1);
    const after = await night(0, Date.parse("2026-11-11T02:20:00Z"), 1);
    expect(after.count("stock-splits")).toBe(0);
    expect(after.count("fees")).toBe(0);
    expect(after.count("tickers")).toBeGreaterThan(0);
  });
});
