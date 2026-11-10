import type { RestClient } from "../api/rest-client.js";
import type { Logger } from "../log.js";
import { MINUTE_MS, SECOND_MS } from "../schedule.js";
import type { Job } from "./run.js";

/**
 * The market list every 10 minutes. A market that leaves the list is read
 * once by id, so its settlement is in the record (COLLECTOR-PLAN §1.1).
 */
export function instrumentsJob(client: RestClient, log: Logger): Job {
  let listed: Set<number> | undefined;
  const readById = new Set<number>();
  return {
    name: "instruments",
    schedule: { everyMs: 10 * MINUTE_MS, offsetMs: 155 * SECOND_MS },
    run: async () => {
      const reply = await client.get("instruments");
      if (!reply.ok) return;
      const now = new Set(reply.data.map((i) => i.instrument_id));
      if (listed) {
        const added = [...now].filter((id) => !listed?.has(id));
        const left = [...listed].filter((id) => !now.has(id));
        if (added.length > 0 || left.length > 0) {
          log.info({ added, left }, "market list changed");
        }
        for (const id of left) {
          if (readById.has(id)) continue;
          readById.add(id);
          await client.get("instruments", { instrument_id: id });
        }
      }
      listed = now;
    },
  };
}
