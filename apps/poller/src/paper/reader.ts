/**
 * The experiment's reads (the plan's R3 and R9): one account's fills over a
 * window, and one market's UTC day of marks, klines and funding. Every
 * request names its window and passes the blind gate first; each is tried up
 * to three times, spaced by the client's back-off (`withTries`,
 * jobs/paging.ts). The client is the shared plumbing (admission, User-Agent,
 * back-off); what is asked and how a reply is read is this file's.
 */
import type { z } from "zod";
import type { Failure, Outcome, RestClient } from "../api/rest-client.js";
import { withTries } from "../jobs/paging.js";
import { DAY_MS, MINUTE_MS } from "../schedule.js";
import { checkWindow, type Gate } from "./gate.js";
import { FillRow, type PaperRoutes, type RejectedRow } from "./routes.js";
import type { MarketDay, StoredRow } from "./store.js";

/** A backed-off request waits up to 60 s, so a sequential reader is never dropped by the client's deadline. */
const MAX_WAIT_MS = 120_000;

type Route = keyof PaperRoutes;
type ReplyOf<R extends Route> = z.infer<PaperRoutes[R]["schema"]>;

export type PaperRequest = <R extends Route>(
  route: R,
  query: Record<string, string | number>,
  window: readonly [number, number],
) => Promise<Outcome<ReplyOf<R>>>;

export function paperRequest(
  client: Pick<RestClient<PaperRoutes>, "get">,
  gate: Gate,
): PaperRequest {
  return (route, query, [start, end]) => {
    checkWindow(gate, start, end, route);
    return withTries(() => client.get(route, query, MAX_WAIT_MS));
  };
}

/** Why a read did not finish: the night pause (or a dropped request) ends the run; any other failure only this read. */
export type Unfinished =
  | { kind: "paused" }
  | { kind: "failed"; reason: string }
  | { kind: "not found" };

function unfinished(reply: {
  reason: Failure;
  status?: number;
  text?: string;
}): Unfinished {
  if (reply.reason === "paused" || reply.reason === "budget")
    return { kind: "paused" };
  if (reply.status === 400 && reply.text?.includes("account not found")) {
    return { kind: "not found" };
  }
  return { kind: "failed", reason: reply.reason };
}

export type FillsRead =
  | {
      kind: "complete" | "capped";
      rows: StoredRow[];
      rejected: RejectedRow[];
      rowsSeen: number;
      pages: number;
      /** The newest fill read: a capped read's hole starts there. */
      lastT: number | null;
    }
  | (Unfinished & { pages: number });

/**
 * An account's fills in [start, end), oldest first, paged by cursor until
 * `more` is false or `maxPages` pages are read ("capped"). A row that fails
 * its check, or lies outside the window, is counted with its instant.
 */
export async function readFills(
  request: PaperRequest,
  address: string,
  start: number,
  end: number,
  maxPages: number,
): Promise<FillsRead> {
  const base = {
    address,
    start_timestamp: start,
    end_timestamp: end,
    sort: "asc",
  };
  const rows: StoredRow[] = [];
  const rejected: RejectedRow[] = [];
  let rowsSeen = 0;
  let lastT: number | null = null;
  let cursor: string | null = null;
  for (let pages = 0; ;) {
    const query: Record<string, string | number> =
      cursor === null ? base : { ...base, cursor };
    const reply = await request("fills", query, [start, end]);
    if (!reply.ok) return { ...unfinished(reply), pages };
    pages += 1;
    for (const raw of reply.data.data) {
      rowsSeen += 1;
      const row = FillRow.safeParse(raw);
      const t = row.success ? row.data.timestamp : null;
      if (row.success && t !== null && t >= start && t < end) {
        rows.push(row.data);
        lastT = lastT === null ? t : Math.max(lastT, t);
        continue;
      }
      const stamp = (raw as { timestamp?: unknown } | null)?.timestamp;
      rejected.push({
        t: Number.isSafeInteger(stamp) ? (stamp as number) : null,
      });
    }
    if (!reply.data.more) {
      return { kind: "complete", rows, rejected, rowsSeen, pages, lastT };
    }
    if (pages >= maxPages) {
      return { kind: "capped", rows, rejected, rowsSeen, pages, lastT };
    }
    cursor = reply.data.cursor ?? null;
    if (cursor === null) return { kind: "failed", reason: "no cursor", pages };
  }
}

export type DayRead = { kind: "ok"; day: MarketDay } | Unfinished;

class BadDay extends Error {}

/** The minute of `t` inside the day, or a BadDay for an instant that is no minute of it. */
function minuteOfDay(t: number, day: number, what: string): number {
  const i = (t - day) / MINUTE_MS;
  if (!Number.isInteger(i) || i < 0 || i >= 1_440) {
    throw new BadDay(
      `${what} at ${new Date(t).toISOString()} is no minute of the day`,
    );
  }
  return i;
}

/**
 * One market's UTC day as the kit's panel was pulled (RESEARCH-KIT §1, R9):
 * `mark-history` at 1m asked with the day's end (a bucket comes only if it
 * ends by then), `klines` at 1m with the day's end − 1 ms, `funding` stamped
 * in the day, newest first, filed by nominal hour (a row stamped late keeps
 * its hour). A reply that breaks the day's shape fails the day.
 */
export async function readMarketDay(
  request: PaperRequest,
  iid: number,
  day: number,
): Promise<DayRead> {
  const end = day + DAY_MS;
  const window = [day, end] as const;
  try {
    const marks: (number | null)[] = new Array<number | null>(1_440).fill(null);
    for (let start = day; ;) {
      const reply = await request(
        "mark-history",
        {
          instrument_id: iid,
          interval: "1m",
          start_timestamp: start,
          end_timestamp: end,
        },
        window,
      );
      if (!reply.ok) return unfinished(reply);
      for (const [t, mark] of reply.data.data) {
        const i = minuteOfDay(t, day, "a mark");
        if (marks[i] !== null) throw new BadDay("two marks in one minute");
        marks[i] = Number(mark);
      }
      const last = reply.data.data.at(-1);
      if (!reply.data.more || last === undefined) break;
      start = last[0] + MINUTE_MS;
    }

    const klines = new Map<number, { trades: number; volume: number }>();
    for (let start = day; ;) {
      const reply = await request(
        "klines",
        {
          instrument_id: iid,
          interval: "1m",
          start_timestamp: start,
          end_timestamp: end - 1,
        },
        window,
      );
      if (!reply.ok) return unfinished(reply);
      for (const row of reply.data.data) {
        const i = minuteOfDay(row[0], day, "a kline");
        if (klines.has(i)) throw new BadDay("two klines in one minute");
        klines.set(i, { trades: row[6], volume: Number(row[5]) });
      }
      const last = reply.data.data.at(-1);
      if (!reply.data.more || last === undefined) break;
      start = last[0] + MINUTE_MS;
    }

    const funding = new Map<number, [number, number, number]>();
    for (let before = end - 1; ;) {
      const reply = await request(
        "funding",
        { instrument_id: iid, start_timestamp: day, end_timestamp: before },
        window,
      );
      if (!reply.ok) return unfinished(reply);
      for (const row of reply.data.data) {
        if (row.timestamp < day || row.timestamp >= end) {
          throw new BadDay("a settlement stamped outside the day");
        }
        const hour = Math.floor(row.timestamp / 3_600_000) * 3_600_000;
        if (funding.has(hour)) throw new BadDay("two settlements in one hour");
        funding.set(hour, [hour, Number(row.funding_rate), row.timestamp]);
      }
      const oldest = reply.data.data.at(-1);
      if (!reply.data.more || oldest === undefined) break;
      before = oldest.timestamp;
    }

    const minutes = [...klines.keys()].sort((a, b) => a - b);
    return {
      kind: "ok",
      day: {
        iid,
        day,
        marks,
        klines: {
          minute: minutes,
          trades: minutes.map((i) => klines.get(i)!.trades),
          volume: minutes.map((i) => klines.get(i)!.volume),
        },
        funding: [...funding.values()].sort((a, b) => a[0] - b[0]),
      },
    };
  } catch (err) {
    if (err instanceof BadDay) return { kind: "failed", reason: err.message };
    throw err;
  }
}
