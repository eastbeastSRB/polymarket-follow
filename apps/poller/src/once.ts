/**
 * One pass run now, for the live checks of the build and the supervisor
 * (COLLECTOR-PLAN §1.8, part 4's done line), from apps/poller:
 *
 *   node dist/once.js board <window> <sort>   one board: 10 pages, 50 tokens
 *   node dist/once.js competitions            the competition pass, ~50 tokens
 *   node dist/once.js daily-reads             splits and fees, 12 tokens
 *
 * Paced as the passes are. It takes the state folder's lock, so it never
 * runs beside a poller of the same folders, and refuses every database but
 * polymarket_follow_test, so the record's own documents are never touched.
 * It prints counts only (§1.3 item 7). Exit codes as the poller's.
 */
import { COLLECTOR_SHARE, RestClient } from "./api/rest-client.js";
import { realClock } from "./clock.js";
import { loadConfig, type Config } from "./config.js";
import { BOARD_SORTS, BOARD_WINDOWS, readBoards } from "./jobs/board-pass.js";
import { competitionPassJob } from "./jobs/competition-pass.js";
import { dailyReadsJob } from "./jobs/daily-reads.js";
import { releaseLock, takeLock } from "./lock.js";
import { createLog } from "./log.js";
import { MINUTE_MS, utcDate } from "./schedule.js";
import { Store } from "./store/db.js";
import { Recorder } from "./store/files.js";

const [what, window, sort] = process.argv.slice(2);
let config: Config;
try {
  config = loadConfig();
  if (config.MONGO_DB !== "polymarket_follow_test") {
    throw new Error("MONGO_DB must be polymarket_follow_test");
  }
  const board =
    what === "board" &&
    (BOARD_WINDOWS as readonly (string | undefined)[]).includes(window) &&
    (BOARD_SORTS as readonly (string | undefined)[]).includes(sort);
  if (!board && what !== "competitions" && what !== "daily-reads") {
    throw new Error(
      "usage: once.js board <all|month|week|day> <pnl|notional|account_value|roi> | competitions | daily-reads",
    );
  }
} catch (err) {
  process.stderr.write(`once: refused: ${String(err)}\n`);
  process.exit(2);
}

const { log, close: closeLog } = createLog(config.STATE_DIR);
const lock = takeLock(config.STATE_DIR);
if (!lock.taken) {
  process.stderr.write("once: another poller holds the lock\n");
  closeLog();
  process.exit(3);
}
const recorder = new Recorder(config.RECORDINGS_ROOT, log);
const store = Store.open(config.MONGO_URI, config.MONGO_DB, log);
const client = new RestClient(COLLECTOR_SHARE, recorder, log);
const now = realClock.wall();

let result: unknown;
if (what === "board") {
  result = await readBoards(
    [{ window: window!, sort: sort! }],
    utcDate(now),
    now + 10 * MINUTE_MS,
    client,
    store,
    log,
    realClock,
  );
} else if (what === "competitions") {
  result = await competitionPassJob(client, store, log, realClock).run();
} else {
  result = await dailyReadsJob(client, store).run();
}
await recorder.close();
await store.close();
releaseLock(config.STATE_DIR);
const summary = { what, result, rest: client.counts, db: store.counts };
log.info(summary, "once done");
process.stdout.write(`${JSON.stringify(summary)}\n`);
closeLog();
process.exit(0);
