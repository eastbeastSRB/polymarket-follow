/**
 * The board pass (COLLECTOR-PLAN §1.1 and §1.7): once a day from 23:38Z, the
 * top 1,000 of all 16 boards — four windows by four sorts, `day` last since
 * it resets at midnight — ten pages each. No page is sent after 23:59:30Z;
 * a board not read by then is lost and logged as missed, never filled from a
 * later read. Logs and coverage hold counts and names only, never a field of
 * a row (§1.3 item 7).
 */
import {
  ROUTES,
  type Outcome,
  type Reply,
  type RestClient,
} from "../api/rest-client.js";
import type { Clock } from "../clock.js";
import type { Logger } from "../log.js";
import {
  DAY_MS,
  HOUR_MS,
  MINUTE_MS,
  SECOND_MS,
  dayStart,
  utcDate,
} from "../schedule.js";
import { canonical, type BoardSnapshot, type Store } from "../store/db.js";
import type { Recorder } from "../store/files.js";
import { boardSource } from "../store/universe.js";
import { PAGE_LIMIT, pacer, readPages, type PageRead } from "./paging.js";
import type { Job } from "./run.js";

export const BOARD_WINDOWS = ["all", "month", "week", "day"] as const;
export const BOARD_SORTS = ["pnl", "notional", "account_value", "roi"] as const;
/** `offset + limit` may not exceed 1,000 (external-apis, "Leaderboard"). */
export const BOARD_ROWS = 1_000;
export const BOARD_PASS_AT_MS = 23 * HOUR_MS + 38 * MINUTE_MS;
export const BOARD_PASS_GUARD_MS =
  23 * HOUR_MS + 59 * MINUTE_MS + 30 * SECOND_MS;
/** Pages read more than 10 s of snapshot apart may straddle a refresh: flagged, not re-read. */
export const CONSISTENT_WITHIN_MS = 10_000;
/**
 * A frozen source (§1.7): a board is stale when a page's snapshot was older
 * than 5 minutes at read (10 for `all`; R1 saw at most 60 s and 281 s), or
 * its top 100 rows are the day before's.
 */
export const STALE_PAGE_MS = 5 * MINUTE_MS;
export const STALE_PAGE_ALL_MS = 10 * MINUTE_MS;
export const STALE_TOP = 100;

export type Board = { window: string; sort: string };
type BoardPage = Reply<"leaderboard">;
export type BoardsRead = {
  stored: number;
  complete: number;
  consistent: number;
  stale: number;
  rows: number;
  missed: string[];
};

export const boardName = (board: Board) => `${board.window}:${board.sort}`;

export function boardOrder(): Board[] {
  return BOARD_WINDOWS.flatMap((window) =>
    BOARD_SORTS.map((sort) => ({ window, sort })),
  );
}

/**
 * One row an account, the first page's (a list can shift while it is
 * paged); addresses lower-cased. `dayBeforeTop`: the same board's first rows
 * the pass date before, or null.
 */
export function boardSnapshot(
  passDate: string,
  board: Board,
  pages: readonly PageRead<BoardPage>[],
  complete: boolean,
  dayBeforeTop: BoardSnapshot["rows"] | null,
): BoardSnapshot {
  const seen = new Set<string>();
  const rows: BoardSnapshot["rows"] = [];
  for (const page of pages) {
    for (const row of page.data.entries) {
      const account = row.account.toLowerCase();
      if (seen.has(account)) continue;
      seen.add(account);
      rows.push({ ...row, account });
    }
  }
  const stamps = pages.map((p) => p.data.timestamp);
  const first = Math.min(...stamps);
  const oldest = board.window === "all" ? STALE_PAGE_ALL_MS : STALE_PAGE_MS;
  const stale =
    pages.some((p) => p.readAt - p.data.timestamp > oldest) ||
    (dayBeforeTop !== null &&
      canonical(rows.slice(0, STALE_TOP)) ===
        canonical(dayBeforeTop.slice(0, STALE_TOP)));
  return {
    passDate,
    window: board.window,
    sort: board.sort,
    day: utcDate(first),
    pages: pages.map((p) => ({
      offset: p.offset,
      timestamp: p.data.timestamp,
      total: p.data.total,
      readAt: p.readAt,
      rows: p.data.entries.length,
    })),
    rows,
    consistent: Math.max(...stamps) - first <= CONSISTENT_WITHIN_MS,
    complete,
    stale,
  };
}

/** A page of another board than the one asked for is refused, never stored under the wrong name. */
async function boardPage(
  client: Pick<RestClient, "get">,
  board: Board,
  offset: number,
  maxWaitMs: number,
  log: Logger,
): Promise<Outcome<BoardPage>> {
  const reply = await client.get(
    "leaderboard",
    { window: board.window, sort_by: board.sort, limit: PAGE_LIMIT, offset },
    maxWaitMs,
  );
  if (
    reply.ok &&
    (reply.data.window !== board.window || reply.data.sort_by !== board.sort)
  ) {
    log.error(
      { board: boardName(board), offset },
      "a page of another board came back; refused",
    );
    return { ok: false, reason: "rejected" };
  }
  return reply;
}

/** The boards in order, each stored with its universe as soon as it is read; none after the deadline. */
export async function readBoards(
  boards: readonly Board[],
  passDate: string,
  deadlineWall: number,
  client: Pick<RestClient, "get">,
  store: Pick<Store, "saveBoard" | "noteSeen" | "boardTop">,
  log: Logger,
  clock: Clock,
): Promise<BoardsRead> {
  const pace = pacer(clock);
  const dayBefore = utcDate(Date.parse(`${passDate}T00:00:00Z`) - DAY_MS);
  const read: BoardsRead = {
    stored: 0,
    complete: 0,
    consistent: 0,
    stale: 0,
    rows: 0,
    missed: [],
  };
  let ended = false;
  for (const board of boards) {
    if (ended) {
      read.missed.push(boardName(board));
      continue;
    }
    const paged = await readPages(
      (offset, maxWaitMs) => boardPage(client, board, offset, maxWaitMs, log),
      ROUTES.leaderboard.weight,
      BOARD_ROWS,
      deadlineWall,
      pace,
      clock,
    );
    if (paged.cut === "deadline") ended = true;
    if (paged.pages.length === 0) {
      read.missed.push(boardName(board));
      continue;
    }
    const doc = boardSnapshot(
      passDate,
      board,
      paged.pages,
      paged.complete,
      await store.boardTop(dayBefore, board, STALE_TOP),
    );
    store.saveBoard(doc);
    store.noteSeen(
      doc.rows.map((r) => r.account),
      boardSource(board.window, board.sort),
      doc.day,
    );
    read.stored += 1;
    if (doc.complete) read.complete += 1;
    if (doc.consistent) read.consistent += 1;
    if (doc.stale) read.stale += 1;
    read.rows += doc.rows.length;
  }
  return read;
}

/**
 * The daily pass. A start inside its window (a crash restart) runs it at
 * once and reads only the boards the pass date does not hold yet.
 */
export function boardPassJob(
  client: Pick<RestClient, "get">,
  store: Pick<Store, "saveBoard" | "noteSeen" | "boardTop" | "boardsStored">,
  recorder: Pick<Recorder, "coverage">,
  log: Logger,
  clock: Clock,
): Job {
  return {
    name: "board-pass",
    schedule: { everyMs: DAY_MS, offsetMs: BOARD_PASS_AT_MS },
    catchUpMs: BOARD_PASS_GUARD_MS - BOARD_PASS_AT_MS,
    run: async () => {
      const startedAt = clock.wall();
      const passDate = utcDate(startedAt);
      const stored = await store.boardsStored(passDate);
      const boards = boardOrder().filter((b) => !stored.has(boardName(b)));
      const read = await readBoards(
        boards,
        passDate,
        dayStart(startedAt) + BOARD_PASS_GUARD_MS,
        client,
        store,
        log,
        clock,
      );
      if (read.missed.length > 0) {
        recorder.coverage({
          event: "boards_missed",
          passDate,
          boards: read.missed,
        });
      }
      log.info({ passDate, alreadyStored: stored.size, ...read }, "board pass");
      return read.complete === boards.length;
    },
  };
}
