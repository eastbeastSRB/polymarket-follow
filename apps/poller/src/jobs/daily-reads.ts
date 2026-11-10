/**
 * The daily reads (COLLECTOR-PLAN §1.1): at 00:20Z the splits and the fee
 * schedule, each into the rule book when it changed (a split: §1.7, readers
 * never join sizes or prices across it). The raw replies are in the files.
 */
import type { RestClient } from "../api/rest-client.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../schedule.js";
import type { Store } from "../store/db.js";
import { withTries } from "./paging.js";
import type { Job } from "./run.js";

export const DAILY_READS_AT_MS = 20 * MINUTE_MS;

export function dailyReadsJob(
  client: Pick<RestClient, "get">,
  store: Pick<Store, "noteRule">,
): Job {
  return {
    name: "daily-reads",
    schedule: { everyMs: DAY_MS, offsetMs: DAILY_READS_AT_MS },
    /** Late by up to 2 hours after a restart; a read that changes nothing stores nothing. */
    catchUpMs: 2 * HOUR_MS,
    run: async () => {
      const splits = await withTries(() => client.get("stock-splits"));
      if (splits.ok) {
        store.noteRule("splits", "events", splits.data.events, splits.recvMs, {
          sequence: splits.data.sequence,
        });
      }
      const fees = await withTries(() => client.get("fees"));
      if (fees.ok) {
        store.noteRule("fees", "schedule", fees.data.fee_schedule, fees.recvMs);
      }
      return splits.ok && fees.ok;
    },
  };
}
