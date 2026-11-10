import { pino } from "pino";
import { describe, expect, it } from "vitest";
import type { Reply } from "../src/api/rest-client.js";
import {
  COMPETITION_ROWS,
  competitionPassJob,
  competitionSnapshot,
  competitionsToRead,
} from "../src/jobs/competition-pass.js";
import { dailyReadsJob } from "../src/jobs/daily-reads.js";
import { DAY_MS } from "../src/schedule.js";
import type { CompetitionSnapshot } from "../src/store/db.js";
import { address, ok, tablePage, world } from "./fixtures.js";

const log = pino({ level: "silent" });
const PASS = Date.parse("2026-11-10T23:15:00Z");
const UPDATED = Date.parse("2026-11-10T23:14:55Z");

const competition = (
  competition_id: number,
  start: string,
  end: string,
): Reply<"competitions">["competitions"][number] => ({
  competition_id,
  number: competition_id,
  name: `Competition ${competition_id}`,
  status: "live",
  start_time: Date.parse(start),
  end_time: Date.parse(end),
  prize_pool: "50000",
  internal: false,
});

const detail = (competition_id: number): Reply<"competition"> => ({
  competition_id,
  status: "live",
  start_time: Date.parse("2026-11-02T14:30:00Z"),
  end_time: Date.parse("2026-11-16T14:30:00Z"),
  all_markets: true,
  markets: [{ instrument_id: 3, boost: "1.5" }],
  min_volume: "1000",
  ranked: 110,
  participants: 10_019,
});

function sink() {
  const tables: CompetitionSnapshot[] = [];
  const seen: { accounts: readonly string[]; source: string; day: string }[] =
    [];
  const rules: unknown[][] = [];
  return {
    tables,
    seen,
    rules,
    store: {
      saveCompetition: (doc: CompetitionSnapshot) => {
        tables.push(doc);
      },
      noteSeen: (accounts: readonly string[], source: string, day: string) => {
        seen.push({ accounts, source, day });
      },
      noteRule: (...args: unknown[]) => {
        rules.push(args);
      },
    },
  };
}

describe("competitionsToRead", () => {
  it("takes each competition from its start until 7 days after its end", () => {
    const list = [
      competition(4, "2026-11-20T00:00:00Z", "2026-11-27T00:00:00Z"),
      competition(1, "2026-11-02T14:30:00Z", "2026-11-16T14:30:00Z"),
      competition(2, "2026-10-20T00:00:00Z", "2026-11-03T23:15:00.001Z"),
      competition(3, "2026-10-01T00:00:00Z", "2026-11-03T23:15:00Z"),
    ];
    expect(competitionsToRead(list, PASS)).toEqual([1, 2]);
    expect(
      competitionsToRead(list, Date.parse("2026-11-02T14:30:00Z")),
    ).toEqual([1, 2, 3]);
    expect(
      competitionsToRead(list, Date.parse("2026-11-02T14:29:59.999Z")),
    ).toEqual([2, 3]);
  });
});

describe("the competition pass", () => {
  it("keeps the list's dates and a competition's boosts in the rule book, and its whole table with the universe", async () => {
    const w = world(PASS, (route, q) => {
      if (route === "competitions") {
        return ok({
          competitions: [
            competition(1, "2026-11-02T14:30:00Z", "2026-11-16T14:30:00Z"),
            competition(9, "2026-09-01T00:00:00Z", "2026-09-15T00:00:00Z"),
          ],
        });
      }
      if (route === "competition") return ok(detail(Number(q.competition_id)));
      const offset = Number(q.offset);
      return ok(tablePage(1, offset, 250, offset === 200 ? 50 : 100, UPDATED));
    });
    const s = sink();
    const job = competitionPassJob(w.client, s.store, log, w.clock);
    expect(await job.run()).toBe(true);

    expect(w.calls.map((c) => c.route)).toEqual([
      "competitions",
      "competition",
      "competition/leaderboard",
      "competition/leaderboard",
      "competition/leaderboard",
    ]);
    expect(w.calls[2]!.query).toEqual({
      competition_id: 1,
      include_unqualified: "true",
      limit: 100,
      offset: 0,
    });
    expect(w.calls.slice(2).map((c) => c.query.offset)).toEqual([0, 100, 200]);
    const gaps = w.calls.slice(3).map((c, i) => c.at - w.calls[i + 2]!.at);
    expect(Math.min(...gaps)).toBe(1_350);
    expect(w.calls[2]!.maxWaitMs).toBe(
      Date.parse("2026-11-10T23:38:00Z") - w.calls[2]!.at,
    );

    expect(s.rules[0]!.slice(0, 2)).toEqual(["competitions", "list"]);
    expect(s.rules[0]![2]).toEqual([
      {
        competition_id: 1,
        number: 1,
        name: "Competition 1",
        status: "live",
        start_time: Date.parse("2026-11-02T14:30:00Z"),
        end_time: Date.parse("2026-11-16T14:30:00Z"),
      },
      {
        competition_id: 9,
        number: 9,
        name: "Competition 9",
        status: "live",
        start_time: Date.parse("2026-09-01T00:00:00Z"),
        end_time: Date.parse("2026-09-15T00:00:00Z"),
      },
    ]);
    expect(s.rules[1]!.slice(0, 3)).toEqual([
      "competition_markets",
      "1",
      { all_markets: true, markets: [{ instrument_id: 3, boost: "1.5" }] },
    ]);

    expect(s.tables).toHaveLength(1);
    const table = s.tables[0]!;
    expect(table).toMatchObject({
      passDate: "2026-11-10",
      competition_id: 1,
      total: 250,
      updated_at: UPDATED,
      complete: true,
    });
    expect(table.competition).toEqual(detail(1));
    expect(table.rows).toHaveLength(250);
    expect(table.rows[0]!.account).toBe(address(1).toLowerCase());
    expect(table.pages.map((p) => [p.offset, p.rows])).toEqual([
      [0, 100],
      [100, 100],
      [200, 50],
    ]);
    expect(s.seen).toEqual([
      {
        accounts: table.rows.map((r) => r.account),
        source: "competition:1:include_unqualified",
        day: "2026-11-10",
      },
    ]);
  });

  it("reads nothing more when the list cannot be read", async () => {
    const w = world(PASS, () => ({ ok: false, reason: "network" }));
    const s = sink();
    expect(
      await competitionPassJob(w.client, s.store, log, w.clock).run(),
    ).toBe(false);
    expect(w.calls.map((c) => c.route)).toEqual([
      "competitions",
      "competitions",
      "competitions",
    ]);
    expect(s.rules).toEqual([]);
  });
});

describe("competitionSnapshot", () => {
  it("keeps one row an account, the first page's, and is incomplete past its bound", () => {
    const first = {
      offset: 0,
      readAt: UPDATED + 300,
      data: tablePage(1, 0, 150, 100, UPDATED),
    };
    const second = {
      offset: 100,
      readAt: UPDATED + 1_600,
      data: tablePage(1, 100, 151, 51, UPDATED + 1_000),
    };
    second.data.entries[0] = { ...first.data.entries[0]!, pnl: "-3" };
    const doc = competitionSnapshot(
      "2026-11-10",
      1,
      null,
      [first, second],
      true,
    );
    expect(doc.rows).toHaveLength(150);
    expect(doc.rows[0]!.pnl).toBe("12.5");
    expect(doc.total).toBe(151);
    expect(doc.updated_at).toBe(UPDATED);
    expect(doc.complete).toBe(true);
    const totalled = (total: number) => ({
      ...second,
      data: { ...second.data, total },
    });
    expect(
      competitionSnapshot(
        "2026-11-10",
        1,
        null,
        [first, totalled(COMPETITION_ROWS)],
        true,
      ).complete,
    ).toBe(true);
    expect(
      competitionSnapshot(
        "2026-11-10",
        1,
        null,
        [first, totalled(COMPETITION_ROWS + 1)],
        true,
      ).complete,
    ).toBe(false);
  });
});

describe("the daily reads", () => {
  it("put the splits, with their sequence beside, and the fee schedule into the rule book", async () => {
    const fees = {
      fee_schedule: [
        {
          instrument_type: "perpetual",
          category: "crypto",
          taker_fee_rate: "0.0004",
          maker_fee_rate: "0.000125",
          tiers: [
            {
              min_volume_30d: "0",
              taker_fee_rate: "0.0004",
              maker_fee_rate: "0.000125",
            },
          ],
        },
      ],
    };
    const w = world(PASS + DAY_MS, (route) =>
      route === "stock-splits"
        ? ok({ events: [], sequence: 101_655_028_994 })
        : ok(fees),
    );
    const s = sink();
    expect(await dailyReadsJob(w.client, s.store).run()).toBe(true);
    expect(w.calls.map((c) => c.route)).toEqual(["stock-splits", "fees"]);
    expect(s.rules.map((r) => [r[0], r[1], r[2], r[4]])).toEqual([
      ["splits", "events", [], { sequence: 101_655_028_994 }],
      ["fees", "schedule", fees.fee_schedule, undefined],
    ]);
  });
});
