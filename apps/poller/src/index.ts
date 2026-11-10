/**
 * The poller (its first part: the collector). Exit codes: 0 a clean stop,
 * 1 a crash, 2 a bad configuration.
 */
import { COLLECTOR_SHARE, RestClient } from "./api/rest-client.js";
import { loadConfig, parseRunFor, type Config } from "./config.js";
import { instrumentsJob } from "./jobs/instruments.js";
import { exchangeJob, tickersJob } from "./jobs/minute-reads.js";
import { startJobs, startPauseMarks } from "./jobs/run.js";
import { createLog } from "./log.js";
import { Recorder } from "./store/files.js";

let config: Config;
let runForS: number | null;
try {
  config = loadConfig();
  runForS = parseRunFor(process.argv.slice(2));
} catch (err) {
  process.stderr.write(`poller: configuration refused: ${String(err)}\n`);
  process.exit(2);
}

const { log, close: closeLog } = createLog(config.STATE_DIR);
const recorder = new Recorder(config.RECORDINGS_ROOT, log);

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

await recorder.start();
recorder.coverage({
  event: "process_start",
  pid: process.pid,
  lastHeartbeatAt: null,
});
const client = new RestClient(COLLECTOR_SHARE, recorder, log);
const stopJobs = startJobs(
  [tickersJob(client), exchangeJob(client, log), instrumentsJob(client, log)],
  log,
);
const stopMarks = startPauseMarks(recorder);
log.info({ runForS }, "poller started");

let stopping = false;
async function stop(reason: string): Promise<void> {
  if (stopping) return;
  stopping = true;
  stopJobs();
  stopMarks();
  recorder.coverage({ event: "process_stop", pid: process.pid, reason });
  await recorder.close();
  const summary = { reason, rest: client.counts, files: recorder.counts };
  log.info(summary, "poller stopped");
  if (runForS !== null) process.stdout.write(`${JSON.stringify(summary)}\n`);
  closeLog();
  process.exit(0);
}

process.on("SIGINT", () => void stop("SIGINT"));
process.on("SIGTERM", () => void stop("SIGTERM"));
if (runForS !== null) {
  setTimeout(() => void stop(`ran ${runForS} s`), runForS * 1000);
}
