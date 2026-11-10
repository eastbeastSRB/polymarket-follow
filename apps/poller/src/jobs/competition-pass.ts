/**
 * The competition pass (COLLECTOR-PLAN §1.1; decisions 2026-11-10, (6)):
 * daily at 23:15Z, the list of competitions into the rule book, then each
 * competition running or ended less than 7 days ago — its markets and
 * boosts into the rule book, its whole table read with
 * `include_unqualified=true` into `competition_snapshots` and the universe.
 * Logs hold counts only (§1.3 item 7).
 */
import type { Reply, RestClient } from "../api/rest-client.js";
import type { Clock } from "../clock.js";
import type { Logger } from "../log.js";
import { DAY_MS, HOUR_MS, MINUTE_MS, nextRun, utcDate } from "../schedule.js";
import type { CompetitionSnapshot, Store } from "../store/db.js";
import { competitionSource } from "../store/universe.js";
import { BOARD_PASS_AT_MS } from "./board-pass.js";
import {
  PAGE_LIMIT,
  pacer,
  readPages,
  withTries,
  type PageRead,
} from "./paging.js";
import type { Job } from "./run.js";

export const COMPETITION_PASS_AT_MS = 23 * HOUR_MS + 15 * MINUTE_MS;
/** Final and paid rows come after the end (§1.7). */
export const READ_AFTER_END_MS = 7 * DAY_MS;
/** The table has no cap of its own (4,746 rows on 2026-11-10): a bound, so a pass always ends. */
export const COMPETITION_ROWS = 20_000;

type TablePage = Reply<"competition/leaderboard">;

export function competitionsToRead(
  list: Reply<"competitions">["competitions"],
  now: number,
): number[] {
  return list
    .filter((c) => c.start_time <= now && now < c.end_time + READ_AFTER_END_MS)
    .map((c) => c.competition_id)
    .sort((a, b) => a - b);
}

/** One row an account, the first page's (the table grows while it is paged); addresses lower-cased. */
export function competitionSnapshot(
  passDate: string,
  competitionId: number,
  competition: Reply<"competition"> | null,
  pages: readonly PageRead<TablePage>[],
  complete: boolean,
): CompetitionSnapshot {
  const seen = new Set<string>();
  const rows: CompetitionSnapshot["rows"] = [];
  for (const page of pages) {
    for (const row of page.data.entries) {
      const account = row.account.toLowerCase();
      if (seen.has(account)) continue;
      seen.add(account);
      rows.push({ ...row, account });
    }
  }
  const total = pages.at(-1)?.data.total ?? 0;
  return {
    passDate,
    competition_id: competitionId,
    competition,
    total,
    updated_at: pages[0]?.data.updated_at ?? null,
    pages: pages.map((p) => ({
      offset: p.offset,
      total: p.data.total,
      updated_at: p.data.updated_at ?? null,
      readAt: p.readAt,
      rows: p.data.entries.length,
    })),
    rows,
    complete: complete && total <= COMPETITION_ROWS,
  };
}

/** The rule book keeps a competition's dates (A.0-8), not its figures. */
function listRule(list: Reply<"competitions">["competitions"]) {
  return list.map(
    ({ competition_id, number, name, status, start_time, end_time }) => ({
      competition_id,
      number,
      name,
      status,
      start_time,
      end_time,
    }),
  );
}

/** Until the board pass begins: the tables are read before the boards. */
export function competitionPassJob(
  client: Pick<RestClient, "get">,
  store: Pick<Store, "saveCompetition" | "noteSeen" | "noteRule">,
  log: Logger,
  clock: Clock,
): Job {
  return {
    name: "competition-pass",
    schedule: { everyMs: DAY_MS, offsetMs: COMPETITION_PASS_AT_MS },
    catchUpMs: BOARD_PASS_AT_MS - COMPETITION_PASS_AT_MS,
    run: async () => {
      const list = await withTries(() => client.get("competitions"));
      if (!list.ok) return false;
      store.noteRule(
        "competitions",
        "list",
        listRule(list.data.competitions),
        list.recvMs,
      );
      const now = clock.wall();
      const passDate = utcDate(now);
      const deadline = nextRun(
        { everyMs: DAY_MS, offsetMs: BOARD_PASS_AT_MS },
        now,
      );
      const pace = pacer(clock);
      let ok = true;
      for (const id of competitionsToRead(list.data.competitions, now)) {
        const detail = await withTries(() =>
          client.get("competition", { competition_id: id }),
        );
        if (detail.ok) {
          const { all_markets, markets } = detail.data;
          store.noteRule(
            "competition_markets",
            String(id),
            { all_markets, markets },
            detail.recvMs,
          );
        }
        const paged = await readPages(
          (offset, maxWaitMs) =>
            client.get(
              "competition/leaderboard",
              {
                competition_id: id,
                include_unqualified: "true",
                limit: PAGE_LIMIT,
                offset,
              },
              maxWaitMs,
            ),
          1,
          COMPETITION_ROWS,
          deadline,
          pace,
          clock,
        );
        if (paged.pages.length === 0) {
          ok = false;
          log.warn({ competition_id: id }, "competition table not read");
          continue;
        }
        const doc = competitionSnapshot(
          passDate,
          id,
          detail.ok ? detail.data : null,
          paged.pages,
          paged.complete,
        );
        store.saveCompetition(doc);
        store.noteSeen(
          doc.rows.map((r) => r.account),
          competitionSource(id),
          utcDate(doc.updated_at ?? doc.pages[0]!.readAt),
        );
        log.info(
          {
            competition_id: id,
            pages: doc.pages.length,
            rows: doc.rows.length,
            complete: doc.complete,
          },
          "competition table",
        );
        ok &&= doc.complete && detail.ok;
      }
      return ok;
    },
  };
}
