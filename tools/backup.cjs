"use strict";
/**
 * The database's backup (COLLECTOR-PLAN section 1.5, as decisions 2026-11-10
 * (7) amends it), run daily by the task "polymarket-follow backup" from the
 * run copy, with the poller's MongoDB driver but none of its code (a backup
 * must not break with what it insures):
 * - every collection of MONGO_DB as canonical Extended JSON lines, gzip, into
 *   BACKUP_ROOT\<UTC date>\ (F:), the append-only collections cut at the
 *   run's start minus 60 s; the manifest written last; the dump re-read
 *   against it. Kept: the 14 newest, and the newest of each of the 8 weeks
 *   before them;
 * - then the newest dump alone into BACKUP_LATEST (E:, one file, replaced)
 *   when E: has three times its size plus 5 GiB free (R6 Q5);
 * - on Sundays (UTC) the restore test (restore.cjs) into
 *   polymarket_follow_restore_<date>, dropped after;
 * - one line a run in STATE_DIR\backup.log, which `status` shows.
 * Settings from the run copy's .env (no defaults): MONGO_URI, MONGO_DB,
 * STATE_DIR, BACKUP_ROOT, BACKUP_LATEST. Exit 1 when the run failed.
 */
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { pipeline } = require("node:stream/promises");
const { createGzip } = require("node:zlib");
const { dumpLines, restore } = require("./restore.cjs");

const DUMP_FILE = "polymarket_follow.jsonl.gz";
const MANIFEST_FILE = "manifest.json";
/** Collections only ever inserted into; the universe is updated in place and taken whole. */
const APPEND_ONLY = new Set([
  "board_snapshots",
  "competition_snapshots",
  "rulebook",
]);
const CUT_MS = 60000;
const KEEP_DAILY = 14;
const KEEP_WEEKLY = 8;
const GIB = 2 ** 30;
const DAY_DIR = /^\d{4}-\d{2}-\d{2}$/;

/** Writes every collection of `db` into `file` (gzip, one line a document, an end line last); returns the counts. */
async function dump(mongodb, db, file, cutAt) {
  const { EJSON } = mongodb.BSON;
  const before = mongodb.ObjectId.createFromTime(
    Math.floor(cutAt.getTime() / 1000),
  );
  const names = (await db.listCollections({}, { nameOnly: true }).toArray())
    .map((c) => c.name)
    .filter((n) => !n.startsWith("system."))
    .sort();
  const counts = {};
  const line = (value) => `${JSON.stringify(value)}\n`;
  async function* lines() {
    for (const name of names) {
      counts[name] = 0;
      const filter = APPEND_ONLY.has(name) ? { _id: { $lt: before } } : {};
      const docs = db.collection(name).find(filter).sort({ _id: 1 });
      for await (const doc of docs) {
        yield line({ c: name, d: EJSON.serialize(doc, { relaxed: false }) });
        counts[name] += 1;
      }
    }
    yield line({
      end: { db: db.databaseName, cutAt: cutAt.toISOString(), counts },
    });
  }
  const tmp = `${file}.tmp`;
  // A pipeline, so a failed read or write is this run's failure, not an uncaught error.
  await pipeline(lines(), createGzip(), fs.createWriteStream(tmp));
  fs.renameSync(tmp, file);
  return counts;
}

async function fileHash(file) {
  const hash = createHash("sha256");
  let bytes = 0;
  for await (const chunk of fs.createReadStream(file)) {
    hash.update(chunk);
    bytes += chunk.length;
  }
  return { bytes, sha256: hash.digest("hex") };
}

/** Re-reads a dump: its hash and every collection's lines must match the manifest. */
async function verifyDump(file, manifest) {
  const { bytes, sha256 } = await fileHash(file);
  if (bytes !== manifest.bytes || sha256 !== manifest.sha256) {
    throw new Error(`${file}: hash differs from the manifest`);
  }
  const lines = {};
  for await (const line of dumpLines(file)) {
    if (line.end === undefined) lines[line.c] = (lines[line.c] ?? 0) + 1;
  }
  for (const [name, count] of Object.entries(manifest.counts)) {
    if ((lines[name] ?? 0) !== count) {
      throw new Error(
        `${file}: ${name} has ${lines[name] ?? 0} lines, the manifest ${count}`,
      );
    }
  }
}
/** The dump folders a rotation removes: all but the 14 newest and the newest of each of the 8 weeks before them. */
function datesToDelete(dates) {
  const sorted = dates
    .filter((d) => DAY_DIR.test(d))
    .sort()
    .reverse();
  const keep = new Set(sorted.slice(0, KEEP_DAILY));
  const weeks = new Set();
  for (const date of sorted.slice(KEEP_DAILY)) {
    const day = new Date(`${date}T00:00:00Z`);
    const monday = new Date(
      day.getTime() - ((day.getUTCDay() + 6) % 7) * 86400000,
    )
      .toISOString()
      .slice(0, 10);
    if (weeks.has(monday) || weeks.size >= KEEP_WEEKLY) continue;
    weeks.add(monday);
    keep.add(date);
  }
  return sorted.filter((d) => !keep.has(d));
}

/** The newest dump into E:, replacing the one there, only with room to spare. */
async function copyLatest(file, manifest, latestDir) {
  fs.mkdirSync(latestDir, { recursive: true });
  const stat = fs.statfsSync(latestDir);
  const free = stat.bavail * stat.bsize;
  const need = 3 * manifest.bytes + 5 * GIB;
  if (free < need)
    return `E: skipped, ${(free / GIB).toFixed(1)} GiB free under ${(need / GIB).toFixed(1)}`;
  const target = path.join(latestDir, DUMP_FILE);
  fs.copyFileSync(file, `${target}.tmp`);
  const copy = await fileHash(`${target}.tmp`);
  if (copy.sha256 !== manifest.sha256)
    throw new Error(`${target}.tmp: the copy's hash differs`);
  fs.renameSync(`${target}.tmp`, target);
  return `E: replaced ${target}`;
}

async function run(mongodb, env, now) {
  const client = new mongodb.MongoClient(env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  try {
    const date = now.toISOString().slice(0, 10);
    const dir = path.join(env.BACKUP_ROOT, date);
    fs.mkdirSync(dir, { recursive: true });
    const file = path.join(dir, DUMP_FILE);
    const counts = await dump(
      mongodb,
      client.db(env.MONGO_DB),
      file,
      new Date(now.getTime() - CUT_MS),
    );
    const manifest = {
      db: env.MONGO_DB,
      file: DUMP_FILE,
      ...(await fileHash(file)),
      counts,
      startedAt: now.toISOString(),
    };
    fs.writeFileSync(
      path.join(dir, MANIFEST_FILE),
      `${JSON.stringify(manifest, null, 2)}\n`,
    );
    await verifyDump(file, manifest);
    const removed = datesToDelete(fs.readdirSync(env.BACKUP_ROOT));
    for (const old of removed)
      fs.rmSync(path.join(env.BACKUP_ROOT, old), {
        recursive: true,
        force: true,
      });
    const latest = await copyLatest(file, manifest, env.BACKUP_LATEST);
    let restoreText = "no restore test (not Sunday)";
    if (now.getUTCDay() === 0) {
      const name = `polymarket_follow_restore_${date}`;
      const result = await restore(mongodb, client, file, name);
      await client.db(name).dropDatabase();
      if (!result.ok)
        throw new Error(`restore test failed: ${result.problems.join("; ")}`);
      restoreText = `restore test ok into ${name}, dropped`;
    }
    const total = Object.values(counts).reduce((a, b) => a + b, 0);
    return `ok ${file} ${manifest.bytes} B sha256 ${manifest.sha256.slice(0, 12)}, ${total} documents in ${Object.keys(counts).length} collections; ${removed.length} old dump(s) removed; ${latest}; ${restoreText}`;
  } finally {
    await client.close();
  }
}

async function main() {
  if (fs.existsSync(".env")) process.loadEnvFile(".env");
  const env = {};
  for (const key of [
    "MONGO_URI",
    "MONGO_DB",
    "STATE_DIR",
    "BACKUP_ROOT",
    "BACKUP_LATEST",
  ]) {
    if (!process.env[key])
      throw new Error(`${key} is not set (the run copy's .env)`);
    env[key] = process.env[key];
  }
  if (!/^polymarket_follow(_test)?$/.test(env.MONGO_DB))
    throw new Error(`${env.MONGO_DB}: not our database (Iron Rule 2)`);
  const now = new Date();
  let line;
  try {
    line = await run(require("mongodb"), env, now);
  } catch (err) {
    line = `FAILED ${String(err && err.message ? err.message : err)}`;
    process.exitCode = 1;
  }
  fs.appendFileSync(
    path.join(env.STATE_DIR, "backup.log"),
    `${now.toISOString()} ${line}\n`,
  );
  process.stdout.write(`${line}\n`);
}

module.exports = { APPEND_ONLY, datesToDelete, dump, fileHash, verifyDump };

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(
      `backup: ${String(err && err.stack ? err.stack : err)}\n`,
    );
    process.exit(1);
  });
}
