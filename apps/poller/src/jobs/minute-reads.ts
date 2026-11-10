/**
 * The small reads (COLLECTOR-PLAN §1.1, "the REST reads"): the client keeps
 * each raw reply in the hour's `rest` file; these jobs only watch for what
 * changes. Offsets spread the reads over the minute.
 */
import type { RestClient } from "../api/rest-client.js";
import type { Logger } from "../log.js";
import { MINUTE_MS, SECOND_MS } from "../schedule.js";
import type { Job } from "./run.js";

export function tickersJob(client: RestClient): Job {
  return {
    name: "tickers",
    schedule: { everyMs: MINUTE_MS, offsetMs: 5 * SECOND_MS },
    run: async () => {
      await client.get("tickers");
    },
  };
}

/** Every 5 minutes, not every minute: CloudFront serves it minutes old (decisions 2026-11-10, (6)). */
export function exchangeJob(client: RestClient, log: Logger): Job {
  let last: { cancel_only: boolean; engine_version: string } | undefined;
  return {
    name: "exchange",
    schedule: { everyMs: 5 * MINUTE_MS, offsetMs: 80 * SECOND_MS },
    run: async () => {
      const reply = await client.get("exchange");
      if (!reply.ok) return;
      const { cancel_only, engine_version } = reply.data;
      if (
        last &&
        (last.cancel_only !== cancel_only ||
          last.engine_version !== engine_version)
      ) {
        log.info(
          { was: last, now: { cancel_only, engine_version } },
          "exchange marks changed",
        );
      }
      last = { cancel_only, engine_version };
    },
  };
}
