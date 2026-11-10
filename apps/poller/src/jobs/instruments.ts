import { readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { Reply, RestClient } from "../api/rest-client.js";
import type { Clock } from "../clock.js";
import type { Logger } from "../log.js";
import { MINUTE_MS, SECOND_MS } from "../schedule.js";
import type { Store } from "../store/db.js";
import { reconnectDelayMs } from "../ws/connection.js";
import type { Job } from "./run.js";

/** The last market list read, in the state folder: the streams open from it while the list cannot be read. */
export const MARKETS_FILE = "markets.json";

const KeptMarkets = z.object({
  savedAt: z.number().int(),
  markets: z.array(z.number().int().safe()),
});

/** The markets to record: every listed one not settled (a settled market cannot trade again). */
export function liveMarkets(list: Reply<"instruments">): number[] {
  return list
    .filter((i) => i.settlement == null)
    .map((i) => i.instrument_id)
    .sort((a, b) => a - b);
}

/** The kept list, or null when there is none or it does not parse (a stored document is parsed where it enters). */
export function readKeptMarkets(
  stateDir: string,
  log: Logger,
): number[] | null {
  let text: string;
  try {
    text = readFileSync(path.join(stateDir, MARKETS_FILE), "utf8");
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code !== "ENOENT") {
      log.warn({ err }, "kept market list not read");
    }
    return null;
  }
  try {
    return KeptMarkets.parse(JSON.parse(text)).markets;
  } catch {
    log.warn("kept market list does not parse; not used");
    return null;
  }
}

/** Keeps each list that differs from the one kept, written whole by rename. */
export function marketKeeper(
  stateDir: string,
  kept: readonly number[] | null,
  log: Logger,
): (ids: readonly number[]) => void {
  const file = path.join(stateDir, MARKETS_FILE);
  let last = kept?.join(",") ?? null;
  return (ids) => {
    const now = ids.join(",");
    if (now === last) return;
    try {
      writeFileSync(
        `${file}.tmp`,
        `${JSON.stringify({ savedAt: Date.now(), markets: ids })}\n`,
      );
      renameSync(`${file}.tmp`, file);
      last = now;
    } catch (err) {
      log.warn({ err }, "market list not kept");
    }
  };
}

/**
 * The first market list, retried with back-off until it is read (COLLECTOR-PLAN
 * §1.7). After the first failure the streams open from the kept list, so a
 * start inside the nightly window, when no list can be read until 03:50Z,
 * records books at once; the first list read corrects it. False if stopped.
 */
export async function awaitFirstList(
  client: Pick<RestClient, "get">,
  kept: readonly number[] | null,
  onList: (ids: number[]) => void,
  log: Logger,
  clock: Clock,
  stopped: () => boolean,
): Promise<boolean> {
  for (let failures = 0; !stopped(); failures += 1) {
    const reply = await client.get("instruments");
    if (reply.ok) {
      onList(liveMarkets(reply.data));
      return true;
    }
    if (failures === 0 && kept !== null) {
      onList([...kept]);
      log.info(
        { markets: kept.length, reason: reply.reason },
        "the streams open from the kept market list",
      );
    }
    const delayMs = reconnectDelayMs(failures);
    log.warn(
      { reason: reply.reason, delayMs },
      "market list not read; retrying",
    );
    await clock.sleep(delayMs);
  }
  return false;
}

/**
 * A market's row as the rule book keeps it: a settlement's price and
 * insurance debit are values, not rules (IDEAS-REVIEW A.0-9), so only its
 * time and sequence stay.
 */
export function instrumentRule(row: Reply<"instruments">[number]) {
  const { settlement, ...rule } = row;
  if (settlement == null) return rule;
  const { sequence, timestamp } = settlement;
  return { ...rule, settlement: { sequence, timestamp } };
}

/**
 * The market list every 10 minutes; it drives the subscriptions, and each
 * change of it goes into the rule book. A market that leaves the list is
 * read once by id, so its settlement is in the record (COLLECTOR-PLAN §1.1).
 */
export function instrumentsJob(
  client: RestClient,
  store: Pick<Store, "noteRule">,
  log: Logger,
  onList: (live: number[]) => void,
): Job {
  let listed: Set<number> | undefined;
  const readById = new Set<number>();
  return {
    name: "instruments",
    schedule: { everyMs: 10 * MINUTE_MS, offsetMs: 155 * SECOND_MS },
    run: async () => {
      const reply = await client.get("instruments");
      if (!reply.ok) return false;
      store.noteRule(
        "instruments",
        "list",
        reply.data.map(instrumentRule),
        reply.recvMs,
        reply.served,
      );
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
          const byId = await client.get("instruments", { instrument_id: id });
          if (!byId.ok) continue;
          for (const row of byId.data) {
            store.noteRule(
              "instrument",
              String(row.instrument_id),
              instrumentRule(row),
              byId.recvMs,
              byId.served,
            );
          }
        }
      }
      listed = now;
      onList(liveMarkets(reply.data));
      return true;
    },
  };
}
