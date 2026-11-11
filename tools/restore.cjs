"use strict";
/**
 * Restores a dump of polymarket_follow (tools/backup.cjs) into a database
 * named polymarket_follow_restore_<date> - never over the live one, never
 * over one that exists (COLLECTOR-PLAN section 1.5) - and compares each
 * collection's count and _id set with the dump's. The weekly restore test
 * (backup.cjs) and the owner's drill use it. Run from the run copy, whose
 * node_modules hold the poller's MongoDB driver:
 *
 *   node restore.cjs <dump .jsonl.gz> polymarket_follow_restore_<YYYY-MM-DD> [--drop]
 */
const { createReadStream, existsSync } = require("node:fs");
const readline = require("node:readline");
const { createGunzip } = require("node:zlib");

const RESTORE_DB = /^polymarket_follow_restore_\d{4}-\d{2}-\d{2}$/;
const BATCH = 1000;

/** A dump's lines: `{ c, d }` for each document (canonical Extended JSON), then one `{ end }`. */
async function* dumpLines(file) {
  const lines = readline.createInterface({
    input: createReadStream(file).pipe(createGunzip()),
    crlfDelay: Infinity,
  });
  for await (const line of lines) if (line !== "") yield JSON.parse(line);
}

/** Restores `file` into `name` and compares; returns { ok, counts, problems }. */
async function restore(mongodb, client, file, name) {
  if (!RESTORE_DB.test(name)) {
    throw new Error(
      `${name}: only polymarket_follow_restore_<date>, never the live database`,
    );
  }
  const { databases } = await client
    .db("admin")
    .admin()
    .listDatabases({ nameOnly: true });
  if (databases.some((d) => d.name === name))
    throw new Error(`${name} exists: refused`);
  const db = client.db(name);
  try {
    return await fill(mongodb, db, file);
  } catch (err) {
    // The name did not exist before this call, so what is there is its own.
    await db.dropDatabase().catch(() => undefined);
    throw err;
  }
}

/** Inserts every document of `file` into `db` and compares counts and `_id` sets with the dump's end line. */
async function fill(mongodb, db, file) {
  const { EJSON } = mongodb.BSON;
  const ids = new Map();
  let end = null;
  let batch = [];
  let batchOf = null;
  const flush = async () => {
    if (batch.length > 0) await db.collection(batchOf).insertMany(batch);
    batch = [];
  };
  for await (const line of dumpLines(file)) {
    if (line.end !== undefined) {
      end = line.end;
      continue;
    }
    if (line.c !== batchOf || batch.length >= BATCH) {
      await flush();
      batchOf = line.c;
    }
    const doc = EJSON.deserialize(line.d, { relaxed: false });
    batch.push(doc);
    if (!ids.has(line.c)) ids.set(line.c, new Set());
    ids.get(line.c).add(EJSON.stringify(doc._id, { relaxed: false }));
  }
  await flush();
  if (end === null)
    throw new Error(`${file} has no end line: it was cut short`);
  const problems = [];
  for (const [collection, count] of Object.entries(end.counts)) {
    const restored = await db
      .collection(collection)
      .find({}, { projection: { _id: 1 } })
      .toArray();
    const got = new Set(
      restored.map((d) => EJSON.stringify(d._id, { relaxed: false })),
    );
    const want = ids.get(collection) ?? new Set();
    const same = got.size === count && [...want].every((id) => got.has(id));
    if (!same)
      problems.push(
        `${collection}: ${restored.length} restored, ${count} dumped`,
      );
  }
  return { ok: problems.length === 0, counts: end.counts, problems };
}

async function main() {
  const [file, name, flag] = process.argv.slice(2);
  if (!file || !name)
    throw new Error(
      "usage: node restore.cjs <dump> polymarket_follow_restore_<date> [--drop]",
    );
  if (existsSync(".env")) process.loadEnvFile(".env");
  if (!process.env.MONGO_URI)
    throw new Error("MONGO_URI is not set (the run copy's .env)");
  const mongodb = require("mongodb");
  const client = new mongodb.MongoClient(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 10000,
  });
  try {
    const result = await restore(mongodb, client, file, name);
    if (flag === "--drop") await client.db(name).dropDatabase();
    process.stdout.write(
      `${JSON.stringify({ ...result, dropped: flag === "--drop" })}\n`,
    );
    if (!result.ok) process.exitCode = 1;
  } finally {
    await client.close();
  }
}

module.exports = { RESTORE_DB, dumpLines, restore };

if (require.main === module) {
  main().catch((err) => {
    process.stderr.write(
      `restore: ${String(err && err.stack ? err.stack : err)}\n`,
    );
    process.exit(1);
  });
}
