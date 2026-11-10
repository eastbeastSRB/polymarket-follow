/**
 * Paging for the daily passes (COLLECTOR-PLAN §1.1): one page at a time,
 * evenly spaced, each admitted by the client like every request; a failed
 * read is tried again a bounded number of times, spaced by the client's
 * back-off, never in a loop (Iron Rule 5).
 */
import type { Failure, Outcome } from "../api/rest-client.js";
import type { Clock } from "../clock.js";

export const PAGE_LIMIT = 100;
/**
 * At most 9 board pages (45 tokens) in any minute, so the minute reads (at
 * most 4 tokens in a minute) fit beside a pass inside the collector's 50
 * without its admission ever holding a page back.
 */
export const PASS_MS_PER_TOKEN = 1_350;
export const TRIES = 3;

export type PageRead<P> = { offset: number; readAt: number; data: P };

/**
 * `complete`: read to the list's end (a short page, or `total` or `maxRows`
 * reached). `cut`: "deadline" — no page could be sent before the deadline,
 * so the pass ends; "lost" — a page could not be read, so this list ends.
 */
export type Paged<P> = {
  pages: PageRead<P>[];
  complete: boolean;
  cut: "deadline" | "lost" | null;
};

/** Each send no sooner than `weight × PASS_MS_PER_TOKEN` after the one before. */
export function pacer(clock: Clock): (weight: number) => Promise<void> {
  let nextAt = -Infinity;
  return async (weight) => {
    const wait = nextAt - clock.monotonic();
    if (wait > 0) await clock.sleep(wait);
    nextAt = clock.monotonic() + weight * PASS_MS_PER_TOKEN;
  };
}

/** A 429, a server error, a timeout or the network: worth another try. A refused reply would be refused again. */
function transient(reason: Failure): boolean {
  return (
    reason === "rate_limited" ||
    reason === "http_error" ||
    reason === "timeout" ||
    reason === "network"
  );
}

/** One read, tried up to TRIES times while it fails for a transient reason. */
export async function withTries<T>(
  read: () => Promise<Outcome<T>>,
): Promise<Outcome<T>> {
  let reply = await read();
  for (let tries = 1; tries < TRIES && !reply.ok; tries += 1) {
    if (!transient(reply.reason)) break;
    reply = await read();
  }
  return reply;
}

/** Pages from offset 0 to the list's end, `maxRows` at most, none sent after `deadlineWall`. */
export async function readPages<
  P extends { total: number; entries: readonly unknown[] },
>(
  get: (offset: number, maxWaitMs: number) => Promise<Outcome<P>>,
  weight: number,
  maxRows: number,
  deadlineWall: number,
  pace: (weight: number) => Promise<void>,
  clock: Clock,
): Promise<Paged<P>> {
  const pages: PageRead<P>[] = [];
  for (let offset = 0; ; offset += PAGE_LIMIT) {
    const reply = await withTries(async (): Promise<Outcome<P>> => {
      await pace(weight);
      const left = deadlineWall - clock.wall();
      // As the client says of a request it could not send before its deadline.
      if (left <= 0) return { ok: false, reason: "budget" };
      return get(offset, left);
    });
    if (!reply.ok) {
      const ended = reply.reason === "budget" || reply.reason === "paused";
      return { pages, complete: false, cut: ended ? "deadline" : "lost" };
    }
    pages.push({ offset, readAt: reply.recvMs, data: reply.data });
    const { total, entries } = reply.data;
    if (
      entries.length < PAGE_LIMIT ||
      offset + PAGE_LIMIT >= Math.min(total, maxRows)
    ) {
      return { pages, complete: true, cut: null };
    }
  }
}
