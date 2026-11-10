/**
 * The poller (its first part: the collector). Exit codes: 0 a clean stop,
 * 1 a crash, 2 a bad configuration, 3 another poller holds the lock.
 */
import { COLLECTOR_SHARE, RestClient } from "./api/rest-client.js";
import { realClock } from "./clock.js";
import { loadConfig, parseRunFor, type Config } from "./config.js";
import { readLastHeartbeat, startHeartbeat } from "./health/heartbeat.js";
import { startProcessStats } from "./health/process-stats.js";
import { watchTestSwitches } from "./health/test-switches.js";
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
const client = new RestClient(COLLECTOR_SHARE, recorder, log);
const streams = new Streams(recorder, log);
const audit = priceAuditJob(
  client,
  (rows) => streams.audit(rows),
  log,
  realClock,
);
let jobs: { stop: () => void; status: () => Record<string, JobStatus> } = {
  stop: () => {},
  status: () => ({}),
};

process.on("uncaughtException", (err) => crash(err));
process.on("unhandledRejection", (err) => crash(err));

function crash(err: unknown): never {
  log.fatal({ err }, "poller crashed");
  recorder.coverage({
    event: "process_stop",
    pid: process.pid,
    reason: "crash",
  });
  process.exit(1);
}

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
      audit: audit.last(),
      memory: {
        rssMb: memory.rssMb,
        heapUsedMb: memory.heapUsedMb,
        heapTotalMb: memory.heapTotalMb,
        externalMb: memory.externalMb,
        arrayBuffersMb: memory.arrayBuffersMb,
      },
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
  stopSwitches();
  heartbeat.stop();
  streams.stop();
  recorder.coverage({ event: "process_stop", pid: process.pid, reason });
  await recorder.close();
  releaseLock(config.STATE_DIR);
  const summary = {
    reason,
    seconds: Math.round((Date.now() - startedAt) / 1_000),
    rest: client.counts,
    files: recorder.counts,
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
const listed = await awaitFirstList(
  client,
  kept,
  useMarkets,
  log,
  realClock,
  () => stopping,
);
if (listed && !stopping) {
  jobs = startJobs(
    [
      tickersJob(client),
      exchangeJob(client, log),
      instrumentsJob(client, log, useMarkets),
      audit,
    ],
    log,
  );
}
