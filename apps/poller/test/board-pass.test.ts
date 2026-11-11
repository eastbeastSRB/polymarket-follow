import { pino } from "pino";
import { describe, expect, it } from "vitest";
import type { RouteName } from "../src/api/rest-client.js";
import {
  BOARD_PASS_GUARD_MS,
  boardOrder,
  boardPassJob,
  boardSnapshot,
  readBoards,
} from "../src/jobs/board-pass.js";
import { dayStart } from "../src/schedule.js";
import type { BoardSnapshot } from "../src/store/db.js";
import { address, boardPage, ok, world } from "./fixtures.js";

const log = pino({ level: "silent" });
const PASS = Date.parse("2026-11-10T23:38:00Z");
const GUARD = dayStart(PASS) + BOARD_PASS_GUARD_MS;
const STAMP = Date.parse("2026-11-10T23:37:40Z");

function sink(
  stored: string[] = [],
  dayBefore: (board: string) => BoardSnapshot["rows"] | null = () => null,
) {
  const boards: BoardSnapshot[] = [];
  const seen: { accounts: readonly string[]; source: string; day: string }[] =
    [];
  const coverage: unknown[] = [];
  const asked: string[] = [];
  return {
    boards,
    seen,
    coverage,
    asked,
    store: {
      saveBoard: (doc: BoardSnapshot) => {
        boards.push(doc);
      },
      noteSeen: (accounts: readonly string[], source: string, day: string) => {
        seen.push({ accounts, source, day });
      },
      boardTop: (
        passDate: string,
        board: { window: string; sort: string },
        n: number,
      ) => {
        const name = `${board.window}:${board.sort}`;
        asked.push(`${passDate} ${name} ${n}`);
        return Promise.resolve(dayBefore(name));
      },
      boardsStored: () => Promise.resolve(new Set(stored)),
    },
    recorder: { coverage: (e: unknown) => coverage.push(e) },
  };
}

/** Every board answers full pages of 100 rows, one stamp a board. */
function full(_route: RouteName, q: Record<string, string | number>) {
  return ok(
    boardPage(
      String(q.window),
      String(q.sort_by),
      Number(q.offset),
      STAMP,
      5_000,
    ),
  );
}

const names = (calls: { query: Record<string, string | number> }[]) => [
  ...new Set(calls.map((c) => `${c.query.window}:${c.query.sort_by}`)),
];

describe("the board pass", () => {
  it("reads the 16 boards in order, day last, ten pages each, evenly spaced, and stores each with its universe", async () => {
    const w = world(PASS, full);
    const s = sink();
    const job = boardPassJob(w.client, s.store, s.recorder, log, w.clock);
    expect(await job.run()).toBe(true);

    expect(w.calls).toHaveLength(160);
    expect(w.calls.every((c) => c.route === "leaderboard")).toBe(true);
    expect(names(w.calls)).toEqual(
      boardOrder().map((b) => `${b.window}:${b.sort}`),
    );
    expect(names(w.calls).slice(0, 4)).toEqual([
      "all:pnl",
      "all:notional",
      "all:account_value",
      "all:roi",
    ]);
    expect(names(w.calls).slice(-4)).toEqual([
      "day:pnl",
      "day:notional",
      "day:account_value",
      "day:roi",
    ]);
    expect(w.calls.slice(0, 10).map((c) => c.query)).toEqual(
      Array.from({ length: 10 }, (_, i) => ({
        window: "all",
        sort_by: "pnl",
        limit: 100,
        offset: i * 100,
      })),
    );
    const gaps = w.calls.slice(1).map((c, i) => c.at - w.calls[i]!.at);
    expect(Math.min(...gaps)).toBe(6_750);
    // At most 45 tokens in any minute: room for the minute reads inside the 50.
    const inAMinute = w.calls.map(
      (c) => w.calls.filter((d) => d.at <= c.at && c.at - d.at < 60_000).length,
    );
    expect(Math.max(...inAMinute) * 5).toBe(45);
    expect(w.calls[0]!.maxWaitMs).toBe(GUARD - PASS);
    expect(w.calls.at(-1)!.at).toBeLessThan(Date.parse("2026-11-10T23:56:00Z"));

    expect(s.boards).toHaveLength(16);
    for (const b of s.boards) {
      expect(b.passDate).toBe("2026-11-10");
      expect(b.day).toBe("2026-11-10");
      expect(b.rows).toHaveLength(1_000);
      expect(b.complete).toBe(true);
      expect(b.consistent).toBe(true);
      expect(b.pages.map((p) => p.offset)).toEqual(
        Array.from({ length: 10 }, (_, i) => i * 100),
      );
      expect(b.pages[0]).toMatchObject({
        timestamp: STAMP,
        total: 5_000,
        rows: 100,
      });
    }
    expect(s.seen.map((x) => x.source)).toEqual(
      boardOrder().map((b) => `board:${b.window}:${b.sort}`),
    );
    expect(s.seen[0]!.day).toBe("2026-11-10");
    expect(s.seen[0]!.accounts).toHaveLength(1_000);
    expect(s.seen[0]!.accounts[0]).toBe(address(1).toLowerCase());
    expect(s.coverage).toEqual([]);
  });

  it("sends no page from 23:59:30Z: the board under way is stored as read, the rest are missed and logged", async () => {
    const start = Date.parse("2026-11-10T23:56:00Z");
    const w = world(start, full);
    const s = sink();
    const job = boardPassJob(w.client, s.store, s.recorder, log, w.clock);
    expect(await job.run()).toBe(false);

    expect(w.calls).toHaveLength(32);
    expect(w.calls.at(-1)!.at).toBe(start + 31 * 6_750);
    expect(w.calls.every((c) => c.at < GUARD)).toBe(true);
    expect(w.calls.at(-1)!.maxWaitMs).toBe(GUARD - (start + 31 * 6_750));
    expect(s.boards.map((b) => [b.window, b.sort, b.pages.length])).toEqual([
      ["all", "pnl", 10],
      ["all", "notional", 10],
      ["all", "account_value", 10],
      ["all", "roi", 2],
    ]);
    expect(s.boards.map((b) => b.complete)).toEqual([true, true, true, false]);
    const missed = boardOrder()
      .slice(4)
      .map((b) => `${b.window}:${b.sort}`);
    expect(s.coverage).toEqual([
      { event: "boards_missed", passDate: "2026-11-10", boards: missed },
    ]);
    // The pass ends at the cut, without waiting a turn for each missed board.
    expect(w.clock.wall()).toBeLessThan(GUARD + 6_750);
  });

  it("sends no page at 23:59:30Z itself", async () => {
    const start = GUARD - 2 * 6_750;
    const w = world(start, full);
    const s = sink();
    await boardPassJob(w.client, s.store, s.recorder, log, w.clock).run();
    expect(w.calls.map((c) => c.at)).toEqual([start, start + 6_750]);
  });

  it("after a restart inside its window, reads only the boards its date does not hold", async () => {
    const w = world(PASS, full);
    const s = sink(["all:pnl", "all:notional"]);
    const job = boardPassJob(w.client, s.store, s.recorder, log, w.clock);
    expect(await job.run()).toBe(true);
    expect(w.calls).toHaveLength(140);
    expect(names(w.calls)[0]).toBe("all:account_value");
    expect(s.boards).toHaveLength(14);
  });

  it("tries a failing page three times, then ends that board as read and goes on with the next", async () => {
    const w = world(PASS, (route, q) =>
      q.sort_by === "pnl" && q.offset === 200
        ? { ok: false, reason: "rate_limited" }
        : full(route, q),
    );
    const s = sink();
    await readBoards(
      [
        { window: "all", sort: "pnl" },
        { window: "all", sort: "notional" },
      ],
      "2026-11-10",
      GUARD,
      w.client,
      s.store,
      log,
      w.clock,
    );
    expect(
      w.calls
        .filter((c) => c.query.sort_by === "pnl")
        .map((c) => c.query.offset),
    ).toEqual([0, 100, 200, 200, 200]);
    expect(s.boards.map((b) => [b.sort, b.pages.length, b.complete])).toEqual([
      ["pnl", 2, false],
      ["notional", 10, true],
    ]);
  });

  it("does not try a refused page again, and refuses a page of another board", async () => {
    const w = world(PASS, (route, q) => {
      if (q.sort_by === "pnl") return { ok: false, reason: "rejected" };
      if (q.sort_by === "roi") {
        return ok(boardPage("day", "roi", Number(q.offset), STAMP, 5_000));
      }
      return full(route, q);
    });
    const s = sink();
    const read = await readBoards(
      [
        { window: "all", sort: "pnl" },
        { window: "all", sort: "roi" },
        { window: "all", sort: "notional" },
      ],
      "2026-11-10",
      GUARD,
      w.client,
      s.store,
      log,
      w.clock,
    );
    expect(w.calls.map((c) => `${c.query.sort_by}:${c.query.offset}`)).toEqual([
      "pnl:0",
      "roi:0",
      ...Array.from({ length: 10 }, (_, i) => `notional:${i * 100}`),
    ]);
    expect(read).toEqual({
      stored: 1,
      complete: 1,
      consistent: 1,
      stale: 0,
      rows: 1_000,
      missed: ["all:pnl", "all:roi"],
    });
  });

  it("ends a board at a short page or at its total", async () => {
    const w = world(PASS, (_route, q) => {
      const offset = Number(q.offset);
      if (q.sort_by === "pnl") {
        // The list ends before the `total` the page claims.
        return ok(
          boardPage(
            "all",
            "pnl",
            offset,
            STAMP,
            5_000,
            offset === 200 ? 50 : 100,
          ),
        );
      }
      return ok(boardPage("all", String(q.sort_by), offset, STAMP, 200));
    });
    const s = sink();
    await readBoards(
      [
        { window: "all", sort: "pnl" },
        { window: "all", sort: "roi" },
      ],
      "2026-11-10",
      GUARD,
      w.client,
      s.store,
      log,
      w.clock,
    );
    expect(w.calls.map((c) => `${c.query.sort_by}:${c.query.offset}`)).toEqual([
      "pnl:0",
      "pnl:100",
      "pnl:200",
      "roi:0",
      "roi:100",
    ]);
    expect(s.boards.map((b) => [b.rows.length, b.complete])).toEqual([
      [250, true],
      [200, true],
    ]);
  });

  it("logs and coverage hold no field of a row (§1.3 item 7)", async () => {
    const lines: string[] = [];
    const captured = pino(
      { level: "debug" },
      { write: (line: string) => lines.push(line) },
    );
    const w = world(Date.parse("2026-11-10T23:58:00Z"), (route, q) =>
      q.sort_by === "notional"
        ? { ok: false, reason: "rejected" }
        : full(route, q),
    );
    const s = sink();
    await boardPassJob(w.client, s.store, s.recorder, captured, w.clock).run();
    const text = [...lines, JSON.stringify(s.coverage)].join("\n");
    expect(lines.length).toBeGreaterThan(0);
    for (const value of [
      "0xabc",
      "0xAbC",
      ".123456",
      "1000.5",
      "250.25",
      "0.4527",
    ]) {
      expect(text).not.toContain(value);
    }
  });
});

describe("boardSnapshot", () => {
  const board = { window: "week", sort: "notional" };
  const page = (offset: number, timestamp: number) => ({
    offset,
    readAt: timestamp + 500,
    data: boardPage("week", "notional", offset, timestamp, 300),
  });

  it("is consistent while its pages lie within 10 s of snapshot, and dated by its earliest stamp", () => {
    const at = Date.parse("2026-11-10T23:59:59Z");
    const within = boardSnapshot(
      "2026-11-10",
      board,
      [page(0, at), page(100, at + 10_000)],
      true,
      null,
    );
    expect(within.consistent).toBe(true);
    expect(within.day).toBe("2026-11-10");
    const beyond = boardSnapshot(
      "2026-11-10",
      board,
      [page(0, at + 10_001), page(100, at)],
      true,
      null,
    );
    expect(beyond.consistent).toBe(false);
    expect(beyond.day).toBe("2026-11-10");
    expect(beyond.pages.map((p) => [p.offset, p.timestamp, p.readAt])).toEqual([
      [0, at + 10_001, at + 10_501],
      [100, at, at + 500],
    ]);
  });

  it("keeps one row an account, the first page's, lower-cased", () => {
    const first = page(0, STAMP);
    const second = page(100, STAMP);
    second.data.entries[0] = {
      ...first.data.entries[3]!,
      rank: 101,
      pnl: "-1",
    };
    const doc = boardSnapshot("2026-11-10", board, [first, second], true, null);
    expect(doc.rows).toHaveLength(199);
    const repeated = doc.rows.filter(
      (r) => r.account === address(4).toLowerCase(),
    );
    expect(repeated).toEqual([
      { ...first.data.entries[3]!, account: address(4).toLowerCase() },
    ]);
    expect(doc.rows.every((r) => r.account === r.account.toLowerCase())).toBe(
      true,
    );
  });

  it("is stale when a page's snapshot was over 5 minutes old at read, 10 for `all`", () => {
    const aged = (window: string, ageMs: number) => ({
      offset: 0,
      readAt: STAMP + ageMs,
      data: boardPage(window, "notional", 0, STAMP, 300),
    });
    const stale = (window: string, ageMs: number) =>
      boardSnapshot(
        "2026-11-10",
        { window, sort: "notional" },
        [aged(window, ageMs)],
        true,
        null,
      ).stale;
    expect(stale("week", 5 * 60_000)).toBe(false);
    expect(stale("week", 5 * 60_000 + 1)).toBe(true);
    expect(stale("all", 10 * 60_000)).toBe(false);
    expect(stale("all", 10 * 60_000 + 1)).toBe(true);
  });

  it("is stale when its top 100 rows are the day before's, and only then", () => {
    const pages = [page(0, STAMP), page(100, STAMP)];
    const today = boardSnapshot("2026-11-10", board, pages, true, null);
    expect(today.stale).toBe(false);
    const same = boardSnapshot("2026-11-10", board, pages, true, today.rows);
    expect(same.stale).toBe(true);
    // Only the first 100 count: a change below them leaves it stale.
    const below = today.rows.map((r, i) =>
      i === 150 ? { ...r, pnl: "-7" } : r,
    );
    expect(boardSnapshot("2026-11-10", board, pages, true, below).stale).toBe(
      true,
    );
    const moved = today.rows.map((r, i) =>
      i === 99 ? { ...r, pnl: "-7" } : r,
    );
    expect(boardSnapshot("2026-11-10", board, pages, true, moved).stale).toBe(
      false,
    );
    expect(boardSnapshot("2026-11-10", board, pages, true, []).stale).toBe(
      false,
    );
  });
});

describe("the board pass and the day before", () => {
  it("asks each board's top 100 of the day before, and counts the stale ones", async () => {
    // Pages stamped a second before their read, so no page is old.
    const freshWorld = () => {
      let now = () => 0;
      const w = world(PASS, (_route, q) =>
        ok(
          boardPage(
            String(q.window),
            String(q.sort_by),
            Number(q.offset),
            now() - 1_000,
            5_000,
          ),
        ),
      );
      now = () => w.clock.wall();
      return w;
    };
    const w = freshWorld();
    const yesterday = sink();
    await boardPassJob(
      w.client,
      yesterday.store,
      yesterday.recorder,
      log,
      w.clock,
    ).run();
    expect(yesterday.boards.some((b) => b.stale)).toBe(false);
    const top = new Map(
      yesterday.boards.map((b) => [
        `${b.window}:${b.sort}`,
        b.rows.slice(0, 100),
      ]),
    );
    const lines: string[] = [];
    const captured = pino(
      { level: "info" },
      { write: (l: string) => lines.push(l) },
    );
    const w2 = freshWorld();
    const s = sink([], (name) => (name === "week:pnl" ? top.get(name)! : null));
    await boardPassJob(
      w2.client,
      s.store,
      s.recorder,
      captured,
      w2.clock,
    ).run();
    expect(s.asked).toEqual(
      boardOrder().map((b) => `2026-11-09 ${b.window}:${b.sort} 100`),
    );
    expect(
      s.boards.filter((b) => b.stale).map((b) => `${b.window}:${b.sort}`),
    ).toEqual(["week:pnl"]);
    const passLine = JSON.parse(
      lines.find((l) => l.includes('"board pass"'))!,
    ) as {
      stale: number;
    };
    expect(passLine.stale).toBe(1);
  });
});
