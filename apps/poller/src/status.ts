/**
 * `node dist/status.js`, from the run copy's folder (its .env names the
 * folders): prints the collector's status rows (health/status.ts). Reads
 * files only; exit 2 on a bad configuration.
 */
import { loadConfig, type Config } from "./config.js";
import {
  backupRow,
  readBackupLine,
  readDayFacts,
  readHeartbeat,
  statusLines,
} from "./health/status.js";

let config: Config;
try {
  config = loadConfig();
} catch (err) {
  process.stderr.write(`status: configuration refused: ${String(err)}\n`);
  process.exit(2);
}
const now = Date.now();
const beat = readHeartbeat(config.STATE_DIR, now);
const lines = statusLines(
  beat?.heartbeat ?? null,
  beat?.ageMs ?? null,
  readDayFacts(config.RECORDINGS_ROOT, now),
  backupRow(readBackupLine(config.STATE_DIR), now),
);
process.stdout.write(`${new Date(now).toISOString()}\n${lines.join("\n")}\n`);
