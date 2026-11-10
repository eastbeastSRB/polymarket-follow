/**
 * The price audit (COLLECTOR-PLAN §1.1): every 10 minutes each market's REST
 * best bid and ask against the book frames received within 200 ms of the
 * reply's one `timestamp`. It reads prices only to say agree or not, and
 * reports counts (§1.3 item 4): a miss is "timing" when the market's best
 * prices moved within a second of that instant, "other" when they did not.
 */
import type { RestClient } from "../api/rest-client.js";
import type { Clock } from "../clock.js";
import type { Logger } from "../log.js";
import { MINUTE_MS, SECOND_MS } from "../schedule.js";
import type { Job } from "./run.js";

export const AGREE_WITHIN_MS = 200;
const MOVED_WITHIN_MS = 1_000;
/** Frames up to a second after the reply's instant must have arrived before it is judged. */
export const SETTLE_MS = 1_500;

export type Top = { ts: number; bid: string | null; ask: string | null };
export type AuditRow = {
  instrument_id: number;
  bid_price: string;
  ask_price: string;
  timestamp: number;
};
export type AuditCounts = {
  rows: number;
  agree: number;
  timingMiss: number;
  otherMiss: number;
  noBook: number;
};

/** "100.50" and "100.5" are one price. */
export function sameDecimal(a: string | null, b: string | null): boolean {
  if (a === null || b === null) return a === b;
  const norm = (s: string) =>
    s.includes(".") ? s.replace(/0+$/, "").replace(/\.$/, "") : s;
  return norm(a) === norm(b);
}

export function auditRows(
  rows: readonly AuditRow[],
  history: (iid: number) => readonly Top[],
): AuditCounts {
  const counts = { rows: 0, agree: 0, timingMiss: 0, otherMiss: 0, noBook: 0 };
  for (const row of rows) {
    counts.rows += 1;
    const tops = history(row.instrument_id);
    const near = tops.filter(
      (t) => Math.abs(t.ts - row.timestamp) <= AGREE_WITHIN_MS,
    );
    if (near.length === 0) {
      counts.noBook += 1;
    } else if (
      near.some(
        (t) =>
          sameDecimal(t.bid, row.bid_price) &&
          sameDecimal(t.ask, row.ask_price),
      )
    ) {
      counts.agree += 1;
    } else {
      const around = new Set(
        tops
          .filter((t) => Math.abs(t.ts - row.timestamp) <= MOVED_WITHIN_MS)
          .map((t) => `${t.bid} ${t.ask}`),
      );
      if (around.size > 1) counts.timingMiss += 1;
      else counts.otherMiss += 1;
    }
  }
  return counts;
}

export function priceAuditJob(
  client: RestClient,
  audit: (rows: readonly AuditRow[]) => AuditCounts,
  log: Logger,
  clock: Clock,
): Job & { totals: AuditCounts; last: () => AuditCounts | null } {
  const totals = { rows: 0, agree: 0, timingMiss: 0, otherMiss: 0, noBook: 0 };
  let last: AuditCounts | null = null;
  return {
    name: "price-audit",
    schedule: { everyMs: 10 * MINUTE_MS, offsetMs: 470 * SECOND_MS },
    /** At start the streams have no book yet: every row would be "no book". */
    catchUpMs: 0,
    totals,
    last: () => last,
    run: async () => {
      const reply = await client.get("bbo");
      if (!reply.ok) return false;
      await clock.sleep(SETTLE_MS);
      const counts = audit(reply.data);
      for (const key of Object.keys(totals) as (keyof AuditCounts)[]) {
        totals[key] += counts[key];
      }
      last = counts;
      log.info(counts, "price audit");
      return true;
    },
  };
}
