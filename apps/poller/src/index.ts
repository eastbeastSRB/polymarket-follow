/**
 * The poller (its first part: the collector). Exit codes: 0 a clean stop,
 * 1 a crash, 2 a bad configuration, 3 another poller holds the lock.
 */
import { COLLECTOR_SHARE, RestClient } from "./api/rest-client.js";
import { realClock } from "./clock.js";
import { loadConfig, parseRunFor, type Config } from "./config.js";
import { diskRules, startDiskWatch } from "./health/disk.js";
import { readLastHeartbeat, startHeartbeat } from "./health/heartbeat.js";
import { startProcessStats } from "./health/process-stats.js";
import { watchTestSwitches } from "./health/test-switches.js";
import { boardPassJob } from "./jobs/board-pass.js";
import { competitionPassJob } from "./jobs/competition-pass.js";
import { dailyReadsJob } from "./jobs/daily-reads.js";
import {
  awaitFirstList,
  instrumentsJob,
  marketKeeper,
  readKeptMarkets,
} from "./jobs/instruments.js";
import { exchangeJob, tickersJob } from "./jobs/minute-reads.js";
import { priceAuditJob } from "./jobs/price-audit.js";
import { startJobs, startPauseMarks, type JobStatus } from "./jobs/run.js";
import { releaseLock, takeLock } from "./lock.js";
import { createLog } from "./log.js";
import { missedSlots, utcDate } from "./schedule.js";
import { Store } from "./store/db.js";
import { Recorder } from "./store/files.js";
import { Streams } from "./ws/streams.js";

let config: Config;
let runForS: number | null;
try {
  config = loadConfig();
  runForS = parseRunFor(process.argv.slice(2));
} catch (err) {
  process.stderr.write(`poller: configuration refused: ${String(err)}\n`);
  process.exit(2);
}

const startedAt = Date.now();
const processStats = startProcessStats();
const { log, close: closeLog } = createLog(config.STATE_DIR);

/**
 * Set before anything else can fail: the task keeps no output, so a crash's
 * last words go to this log (written synchronously). Once this process
 * records, its crash is also a stop in the coverage.
 */
let markCrash = (): void => {};
process.on("uncaughtException", (err) => crash(err));
process.on("unhandledRejection", (err) => crash(err));

function crash(err: unknown): never {
  log.fatal({ err }, "poller crashed");
  markCrash();
  process.exit(1);
}

const lastHeartbeatAt = readLastHeartbeat(config.STATE_DIR);
const lock = takeLock(config.STATE_DIR);
if (!lock.taken) {
  const holder = {
    holderPid: lock.holderPid,
    heartbeatAgeMs: lock.heartbeatAgeMs,
  };
  log.warn(holder, "another poller holds the lock; exiting");
  process.stderr.write(
    `poller: another poller holds the lock ${JSON.stringify(holder)}\n`,
  );
  closeLog();
  process.exit(3);
}

const recorder = new Recorder(config.RECORDINGS_ROOT, log);
markCrash = () =>
  recorder.coverage({
    event: "process_stop",
    pid: process.pid,
    reason: "crash",
  });
const store = Store.open(config.MONGO_URI, config.MONGO_DB, log);
const client = new RestClient(COLLECTOR_SHARE, recorder, log);
/** A server's close of a connection is also a maintenance mark in the rule book (COLLECTOR-PLAN §1.3 item 2). */
const streams = new Streams(
  {
    write: (kind, recvMs, text) => recorder.write(kind, recvMs, text),
    coverage: (event) => {
      recorder.coverage(event);
      if (event.event === "ws_close" && event.cause === "server close") {
        store.noteEvent(
          "connection_drop",
          event.conn,
          { code: event.code, reason: event.reason },
          Date.now(),
        );
      }
    },
  },
  log,
);
const audit = priceAuditJob(
  client,
  (rows) => streams.audit(rows),
  log,
  realClock,
);
const competitionPass = competitionPassJob(client, store, log, realClock);
const boardPass = boardPassJob(client, store, recorder, log, realClock);
let jobs: { stop: () => void; status: () => Record<string, JobStatus> } = {
  stop: () => {},
  status: () => ({}),
};

const disks = startDiskWatch(
  diskRules(config.RECORDINGS_ROOT),
  (rule, reading) => {
    const stopped = reading.state === "stop";
    if (rule.name === "database") store.pauseWrites(stopped);
    else recorder.pauseStreams(stopped);
    recorder.coverage({
      event: "disk",
      disk: rule.name,
      ...reading,
      stops: rule.stops,
    });
    const facts = { disk: rule.name, ...reading, stops: rule.stops };
    if (reading.state === "ok") log.info(facts, "disk space ok again");
    else
      log.warn(
        facts,
        stopped ? `disk space low: ${rule.stops} stopped` : "disk space low",
      );
  },
  log,
);

const heartbeat = startHeartbeat(
  config.STATE_DIR,
  () => {
    const memory = processStats();
    const health = streams.health();
    return {
      time: Date.now(),
      iso: new Date().toISOString(),
      pid: process.pid,
      startedAt,
      connections: health.connections,
      jobs: jobs.status(),
      tokensLastMinute: client.tokensInLastMinute(),
      rest: client.counts,
      streams: { ...streams.stats, stalledMarkets: health.stalledMarkets },
      files: recorder.counts,
      db: store.counts,
      audit: audit.last(),
      memory: {
        rssMb: memory.rssMb,
        heapUsedMb: memory.heapUsedMb,
        heapTotalMb: memory.heapTotalMb,
        externalMb: memory.externalMb,
        arrayBuffersMb: memory.arrayBuffersMb,
      },
      clock: streams.clockWatch.last,
      disk: disks.readings(),
    };
  },
  log,
);

await recorder.start();
recorder.coverage({
  event: "process_start",
  pid: process.pid,
  lastHeartbeatAt,
});
if (lastHeartbeatAt !== null) {
  for (const pass of [competitionPass, boardPass]) {
    for (const slot of missedSlots(
      pass.schedule,
      pass.catchUpMs ?? 0,
      lastHeartbeatAt,
      Date.now(),
    )) {
      recorder.coverage({
        event: "pass_missed",
        pass: pass.name,
        passDate: utcDate(slot),
      });
    }
  }
}
const stopMarks = startPauseMarks(recorder);
const stopSwitches = watchTestSwitches(
  config.STATE_DIR,
  {
    "test-silence-streams": () => streams.deafenAll(),
    "test-stop-heartbeat": () => heartbeat.stop(),
  },
  recorder,
  log,
);
let stopping = false;

async function stop(reason: string): Promise<void> {
  if (stopping) return;
  stopping = true;
  jobs.stop();
  stopMarks();
  disks.stop();
  stopSwitches();
  heartbeat.stop();
  streams.stop();
  recorder.coverage({ event: "process_stop", pid: process.pid, reason });
  await recorder.close();
  await store.close();
  releaseLock(config.STATE_DIR);
  const summary = {
    reason,
    seconds: Math.round((Date.now() - startedAt) / 1_000),
    rest: client.counts,
    files: recorder.counts,
    db: store.counts,
    streams: streams.stats,
    connections: streams.connectionStats(),
    bookLinesPerMarket: spread([...streams.linesByMarket.values()]),
    audit: audit.totals,
    process: processStats(),
  };
  log.info(summary, "poller stopped");
  if (runForS !== null) process.stdout.write(`${JSON.stringify(summary)}\n`);
  closeLog();
  process.exit(0);
}

function spread(values: number[]): Record<string, number> {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    markets: sorted.length,
    min: sorted[0] ?? 0,
    median: sorted[Math.floor(sorted.length / 2)] ?? 0,
    max: sorted.at(-1) ?? 0,
  };
}

process.on("SIGINT", () => void stop("SIGINT"));
process.on("SIGTERM", () => void stop("SIGTERM"));
if (runForS !== null) {
  setTimeout(() => void stop(`ran ${runForS} s`), runForS * 1000);
}
log.info({ runForS, lastHeartbeatAt }, "poller started");

const kept = readKeptMarkets(config.STATE_DIR, log);
const keepMarkets = marketKeeper(config.STATE_DIR, kept, log);
const useMarkets = (ids: number[]) => {
  streams.setMarkets(ids);
  keepMarkets(ids);
};
// Before the first market list is read: the passes and the minute reads do
// not need it, and a list that cannot be read must not hold them back.
jobs = startJobs(
  [
    tickersJob(client),
    exchangeJob(client, store, log),
    instrumentsJob(client, store, log, useMarkets),
    audit,
    competitionPass,
    boardPass,
    dailyReadsJob(client, store),
  ],
  log,
);
await awaitFirstList(client, kept, useMarkets, log, realClock, () => stopping);
