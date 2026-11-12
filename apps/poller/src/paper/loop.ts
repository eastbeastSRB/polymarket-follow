/**
 * The reading loop (the plan's R3 and section 3, with its review's F1, F3
 * and F11): one rule for the first run, a missed day and every Monday.
 * Week by week from the cut's Monday, each week's list — the accounts P1 at
 * its Monday, the traders with open copies, the favourites — is read to the
 * week's end (or the run's END) without a page cap but with a high safety
 * cap; when the week is over, every other pool account is read to its end,
 * at most 10 pages an account-week; then the week's market-days. Each read
 * asks [P, end) and moves P only when it finished; the state is saved after
 * each account, so a stop, a crash or the night pause loses at most one
 * read, and the next run continues from each P.
 */
import type { Logger } from "../log.js";
import { DAY_MS } from "../schedule.js";
import { CUT, WEEK_MS, mondayOf } from "./instants.js";
import { readFills, readMarketDay, type PaperRequest } from "./reader.js";
import type { RejectedRow } from "./routes.js";
import {
  FOREVER,
  type AccountState,
  type Hole,
  type PaperStore,
  type State,
  type StoredRow,
} from "./store.js";

/** The sweep's cap, 10 pages an account-week (decisions 2026-11-12, Q3). */
export const SWEEP_PAGES_A_WEEK = 10;
/** The list's safety cap, 50 pages (5,000 fills) an account-day (PAPER-PLAN-REVIEW F11). */
export const SAFETY_PAGES_A_DAY = 50;
/** The schema alarm (F3): more than this share of a run's rows rejected, and at least ALARM_MIN_ROWS of them. */
export const ALARM_SHARE = 0.01;
export const ALARM_MIN_ROWS = 10;
/** So many rejected rows end a run at once: a reply's shape has changed. */
export const ALARM_STOP_ROWS = 1_000;
/** So many failed reads in a row end a run: the API is failing; the next run continues. */
export const FAILING_READS = 5;

export type LoopEnd = "done" | "paused" | "schema alarm" | "api failing";

export type LoopCounts = {
  accountReads: number;
  rows: number;
  rejectedRows: number;
  sweepCapped: string[];
  safetyCapped: string[];
  failedReads: number;
  notFound: string[];
  marketDays: number;
  failedMarketDays: number;
};

export type LoopInput = {
  /** The pool's accounts, read from the cut on (the seed holds them before it). */
  pool: readonly string[];
  /** Arm F: each favourite with the instant its reads start at (a pool account's: the cut). */
  favourites: readonly { addr: string; from: number }[];
  markets: readonly number[];
  end: number;
  /** The accounts read every day in the week of `monday` (P1 at it, open copies), from the fills read so far. */
  weekList: (monday: number) => ReadonlySet<string>;
  request: PaperRequest;
  store: PaperStore;
  state: State;
  log: Logger;
  /** The UTC date the reads are made on: a hole names it, so that a re-parse finds its raw replies. */
  readOn: string;
};

class Stop extends Error {
  constructor(readonly why: Exclude<LoopEnd, "done">) {
    super(why);
  }
}

/** Account-day holes for rejected rows, inside [start, end); a row without an instant holes the whole read. */
export function rejectedHoles(
  rejected: readonly RejectedRow[],
  start: number,
  end: number,
  readOn: string,
): Hole[] {
  const byDay = new Map<number, number>();
  for (const { t } of rejected) {
    const day = t === null ? -1 : Math.floor(t / DAY_MS) * DAY_MS;
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
  }
  return [...byDay]
    .sort((a, b) => a[0] - b[0])
    .map(([day, rows]) => ({
      from: day === -1 ? start : Math.max(start, day),
      to: day === -1 ? end : Math.min(end, day + DAY_MS),
      cause: "rejected rows",
      readOn,
      rows,
    }));
}

const standing = (account: AccountState | undefined): boolean =>
  account?.holes.some((h) => h.cause === "account not found") ?? false;

export async function readThrough(
  input: LoopInput,
): Promise<{ end: LoopEnd; counts: LoopCounts }> {
  const { store, state, log, end, readOn } = input;
  const counts: LoopCounts = {
    accountReads: 0,
    rows: 0,
    rejectedRows: 0,
    sweepCapped: [],
    safetyCapped: [],
    failedReads: 0,
    notFound: [],
    marketDays: 0,
    failedMarketDays: 0,
  };
  /** Reads with a rejected row: applied at the run's end unless the schema alarm holds (F3). */
  const deferred = new Map<
    string,
    { rows: StoredRow[]; holes: Hole[]; P: number }
  >();
  const fromOf = new Map(input.favourites.map((f) => [f.addr, f.from]));
  const present = new Map(
    input.markets.map((iid) => [iid, store.marketDays(iid)]),
  );
  let failingInARow = 0;

  const accountOf = (addr: string): AccountState =>
    (state.accounts[addr] ??= {
      P: fromOf.get(addr) ?? CUT,
      from: fromOf.get(addr) ?? CUT,
      holes: [],
    });

  const failed = (): void => {
    failingInARow += 1;
    if (failingInARow >= FAILING_READS) throw new Stop("api failing");
  };

  async function readAccount(
    addr: string,
    to: number,
    maxPages: (span: number) => number,
    capCause: "page cap" | "safety cap",
  ): Promise<void> {
    const account = accountOf(addr);
    if (account.P >= to || standing(account) || deferred.has(addr)) return;
    const start = account.P;
    const read = await readFills(
      input.request,
      addr,
      start,
      to,
      maxPages(to - start),
    );
    if (read.kind === "paused") throw new Stop("paused");
    if (read.kind === "failed") {
      counts.failedReads += 1;
      log.warn({ addr, reason: read.reason }, "a fills read failed; P stays");
      failed();
      return;
    }
    failingInARow = 0;
    if (read.kind === "not found") {
      counts.notFound.push(addr);
      account.holes.push({
        from: start,
        to: FOREVER,
        cause: "account not found",
        readOn,
      });
      store.saveState(state);
      return;
    }
    counts.accountReads += 1;
    counts.rows += read.rowsSeen;
    counts.rejectedRows += read.rejected.length;
    const holes = rejectedHoles(read.rejected, start, to, readOn);
    if (read.kind === "capped") {
      (capCause === "page cap" ? counts.sweepCapped : counts.safetyCapped).push(
        addr,
      );
      if (capCause === "safety cap") {
        log.warn(
          { addr, pages: read.pages },
          "the safety cap stopped a list account's read",
        );
      }
      holes.push({ from: read.lastT ?? start, to, cause: capCause, readOn });
    }
    if (read.rejected.length > 0) {
      deferred.set(addr, { rows: read.rows, holes, P: to });
      if (counts.rejectedRows >= ALARM_STOP_ROWS)
        throw new Stop("schema alarm");
      return;
    }
    store.addRows(addr, read.rows);
    account.holes.push(...holes);
    account.P = to;
    store.saveState(state);
  }

  /** Every account read to the week's end (or a standing hole), every market-day of it present. */
  function weekDone(monday: number, weekEnd: number): boolean {
    const accounts = [
      ...input.pool,
      ...input.favourites.filter((f) => f.from < weekEnd).map((f) => f.addr),
    ];
    const readTo = Math.min(end, monday + WEEK_MS);
    const listed = accounts.every((addr) => {
      const a = state.accounts[addr];
      return standing(a) || (a !== undefined && a.P >= readTo);
    });
    if (!listed) return false;
    for (
      let day = Math.max(CUT, monday);
      day + DAY_MS <= weekEnd;
      day += DAY_MS
    ) {
      for (const iid of input.markets)
        if (!present.get(iid)!.has(day)) return false;
    }
    return true;
  }

  const sweepPages = (span: number) =>
    SWEEP_PAGES_A_WEEK * Math.ceil(span / WEEK_MS);
  const safetyPages = (span: number) =>
    SAFETY_PAGES_A_DAY * Math.ceil(span / DAY_MS);

  let ended: LoopEnd = "done";
  try {
    for (let monday = mondayOf(CUT); monday < end; monday += WEEK_MS) {
      const weekEnd = Math.min(end, monday + WEEK_MS);
      if (weekDone(monday, weekEnd)) continue;
      const list = new Set(input.weekList(monday));
      for (const f of input.favourites) if (f.from < weekEnd) list.add(f.addr);
      for (const addr of [...list].sort()) {
        await readAccount(addr, weekEnd, safetyPages, "safety cap");
      }
      if (monday + WEEK_MS <= end) {
        for (const addr of [...input.pool].sort()) {
          if (!list.has(addr))
            await readAccount(addr, monday + WEEK_MS, sweepPages, "page cap");
        }
      }
      for (
        let day = Math.max(CUT, monday);
        day + DAY_MS <= weekEnd;
        day += DAY_MS
      ) {
        for (const iid of input.markets) {
          const days = present.get(iid)!;
          if (days.has(day)) continue;
          const read = await readMarketDay(input.request, iid, day);
          if (read.kind === "paused") throw new Stop("paused");
          if (read.kind === "ok") {
            store.saveMarketDay(read.day);
            days.add(day);
            counts.marketDays += 1;
            failingInARow = 0;
            continue;
          }
          counts.failedMarketDays += 1;
          log.warn(
            { iid, day: new Date(day).toISOString(), read },
            "a market-day read failed",
          );
          failed();
        }
      }
    }
  } catch (err) {
    if (!(err instanceof Stop)) throw err;
    ended = err.why;
  }

  const alarm =
    ended === "schema alarm" ||
    (counts.rejectedRows >= ALARM_MIN_ROWS &&
      counts.rejectedRows > ALARM_SHARE * counts.rows);
  if (alarm) {
    log.error(
      {
        rejectedRows: counts.rejectedRows,
        rows: counts.rows,
        accounts: deferred.size,
      },
      "schema alarm: no hole written and no P moved for the accounts with rejected rows",
    );
    return { end: "schema alarm", counts };
  }
  for (const [addr, d] of deferred) {
    store.addRows(addr, d.rows);
    const account = accountOf(addr);
    account.holes.push(...d.holes);
    account.P = d.P;
  }
  if (deferred.size > 0) store.saveState(state);
  return { end: ended, counts };
}
