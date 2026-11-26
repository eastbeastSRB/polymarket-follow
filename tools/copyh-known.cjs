"use strict";
/**
 * COPY-H's known answers' sets (copyh/rules.md C15 (a); the supervisor's
 * rulings on COPYH-REPRO's Q1 and Q2, 2026-11-26): the sets the paper's own
 * reproduction defined (PAPER-BUILD's part 4, decisions 2026-11-12), applied
 * to the record's files, each held to its SHA-256 before it is read:
 *
 *   node tools/copyh-known.cjs [--out <file>]
 *     writes apps/poller/copyh/known.json (or <file>)
 *
 * - find6exits: the entry ids of FIND-6-EXITS's copies whose account is not
 *   in the kit's holdout (`population.json`'s flag);
 * - x3: FIND-3's population rows `primary` and not `holdout`; x3voted those
 *   it voted at 24 h (the set of X3's held-24-h figure); x3find3 those whose
 *   FIND-3 look row holds a taker net (the per-entry check at 24 h);
 * - mondays: the record's 26 Mondays, consecutive, ending at the last Monday
 *   before the kit's cut; every Monday of the kit's pool-weeks rows outside
 *   the holdout must be one of them (the holdout's rows, which hold the
 *   others of part 4's list, are not read);
 * - x3printed: X3's printed figures, as the record holds them.
 * A holdout account's row is read no further than its flag: counted, never
 * kept. Every account must be the kit's population's. Nothing is written
 * unless every source passes.
 */
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");
const { createHash } = require("node:crypto");
const { pathToFileURL } = require("node:url");

const PKG = path.join(__dirname, "..", "apps", "poller");
const KIT = path.join(PKG, "research", "kit");
const F = "F:/polymarket-follow-research";
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

/** The record's files and their SHA-256 (FIND-6-EXITS's report, section 1; FIND-3's report, its evidence; pool-weeks, recorded as `5a7dbae3…fa5f` by the approach review, the paper's plan and FIND-9). */
const SOURCES = {
  find6exits: {
    file: `${F}/FIND-6-EXITS/copies.jsonl.gz`,
    sha256: "06a8125c54d5deee964d7baa0d7ff5b0010cdf880db1e2762e7d46c033d18195",
  },
  find3: {
    file: `${F}/FIND-3/population.jsonl.gz`,
    sha256: "fd34f29abd5504bd610a928955d5380ea1518c13bbf146ffc39589204d31c63d",
  },
  find3look: {
    file: `${F}/FIND-3/look/entries.jsonl.gz`,
    sha256: "8278f54439adc33a533ba2776f9f236411a55e14fcc8cdc42ff9f571ca419feb",
  },
  poolWeeks: {
    file: `${F}/KIT/derived/pool-weeks.jsonl.gz`,
    sha256: "5a7dbae3d08157a262348703ce160bfd9e45e21fae705483912e92e7140afa5f",
  },
};

/** The paper's reproduction labelled 26 Mondays (decisions 2026-11-12, PAPER-BUILD's technical calls). */
const MONDAYS = 26;

/** X3's figures as printed (bps a copy, each copy alike, ± one CR1 error by trader, to one decimal). */
const X3_PRINTED = {
  source:
    "decisions 2026-11-12, PAPER-BUILD's technical calls (its part 4: X3's 1,366 copies at its printed figures, -9.9 ± 9.1 and +9.1 ± 13.7); docs/reviews/approach-review-2026-11-12.md, X3: exits copied -9.9 ± 9.1 (gross +1.1), held 24 h +9.1 ± 13.7 over FIND-3's voted set",
  exitsCopied: { over: "x3", mean: -9.9, se: 9.1 },
  gross: { over: "x3", mean: 1.1 },
  held24h: { over: "x3voted", mean: 9.1, se: 13.7 },
};

/** A file's bytes held to their SHA-256, then its JSON lines; nothing parsed when they differ. */
function rowsOf(file, want) {
  const bytes = fs.readFileSync(file);
  const got = sha256(bytes);
  if (got !== want)
    throw new Error(`${file}: SHA-256 ${got}, not ${want}: nothing written`);
  return zlib
    .gunzipSync(bytes)
    .toString("utf8")
    .split("\n")
    .filter((line) => line !== "")
    .map((line) => JSON.parse(line));
}

const DAY_MS = 86_400_000;
const WEEK_MS = 7 * DAY_MS;
const iso = (t) => new Date(t).toISOString().slice(0, 10);

/**
 * known.json's sets from the kit's population (`accounts`), the four
 * sources' rows and the kit's cut; the Mondays are the `count` ending at
 * the last Monday before the cut.
 */
function knownOf({
  population,
  find6exits,
  find3,
  find3look,
  poolWeeks,
  cut,
  count,
}) {
  const held = new Map(population.map((a) => [a.addr, a.holdout === true]));
  /** Whether a row's account is the holdout's; an account outside the population throws. */
  const isHoldout = (addr, what) => {
    const h = held.get(addr);
    if (h === undefined)
      throw new Error(`${what}: ${addr} is not in the kit's population`);
    return h;
  };
  const holdout = { find6exits: 0, find3: 0, find3look: 0, poolWeeks: 0 };
  const f6 = [];
  for (const r of find6exits) {
    if (isHoldout(r.addr, "FIND-6-EXITS")) {
      holdout.find6exits += 1;
      continue;
    }
    if (!r.id.startsWith(`${r.addr}|`))
      throw new Error(`FIND-6-EXITS: ${r.id} is not ${r.addr}'s`);
    f6.push(r.id);
  }
  const x3 = [];
  const voted = [];
  for (const r of find3) {
    if (r.holdout !== isHoldout(r.addr, "FIND-3"))
      throw new Error(
        `FIND-3: ${r.addr}'s holdout flag differs from the population's`,
      );
    if (r.holdout) {
      holdout.find3 += 1;
      continue;
    }
    if (!r.primary) continue;
    x3.push(r.id);
    if (r.voted24) voted.push(r.id);
  }
  const inX3 = new Set(x3);
  const find3Net = [];
  for (const r of find3look) {
    if (isHoldout(r.id.split("|")[0], "FIND-3's look")) {
      holdout.find3look += 1;
      continue;
    }
    if (inX3.has(r.id) && typeof r.taker === "number") find3Net.push(r.id);
  }
  const lastMonday =
    Math.floor((cut - 1 - 4 * DAY_MS) / WEEK_MS) * WEEK_MS + 4 * DAY_MS;
  const mondays = Array.from(
    { length: count },
    (_, k) => lastMonday - (count - 1 - k) * WEEK_MS,
  );
  const seen = new Set();
  for (const r of poolWeeks) {
    if (isHoldout(r.addr, "pool-weeks")) {
      holdout.poolWeeks += 1;
      continue;
    }
    if (!mondays.includes(r.M))
      throw new Error(`pool-weeks: ${r.M} is not one of the ${count} Mondays`);
    seen.add(r.M);
  }
  const ids = (list) => {
    if (new Set(list).size !== list.length)
      throw new Error("an entry id twice: nothing written");
    return [...list].sort();
  };
  return {
    holdout,
    poolWeeksMondays: seen.size,
    mondays: mondays.map(iso),
    find6exits: ids(f6),
    x3: ids(x3),
    x3voted: ids(voted),
    x3find3: ids(find3Net),
  };
}

async function main() {
  const args = process.argv.slice(2);
  if (!(args.length === 0 || (args.length === 2 && args[0] === "--out")))
    throw new Error("usage: copyh-known.cjs [--out <file>]");
  const out = args[1] ?? path.join(PKG, "copyh", "known.json");
  const kitList = fs.readFileSync(path.join(KIT, "FINGERPRINT.sha256"), "utf8");
  const line = /^([0-9a-f]{64}) \*data\/population\.json$/m.exec(kitList);
  if (line === null)
    throw new Error("the kit's FINGERPRINT.sha256 names no population.json");
  const popBytes = fs.readFileSync(path.join(KIT, "data", "population.json"));
  if (sha256(popBytes) !== line[1])
    throw new Error("population.json differs from the kit's line");
  const { CUT } = await import(
    pathToFileURL(path.join(KIT, "constants.mjs")).href
  );
  const rows = Object.fromEntries(
    Object.entries(SOURCES).map(([k, s]) => [k, rowsOf(s.file, s.sha256)]),
  );
  const known = knownOf({
    population: JSON.parse(popBytes.toString("utf8")).accounts,
    ...rows,
    cut: CUT,
    count: MONDAYS,
  });
  const file = {
    rule: "copyh/rules.md C15 (a): the known answers' sets as the paper's own reproduction defined them (PAPER-BUILD's part 4, decisions 2026-11-12; the supervisor's rulings on COPYH-REPRO's Q1 and Q2, 2026-11-26): find6exits, FIND-6-EXITS's copies of accounts outside the kit's holdout; x3, FIND-3's population rows primary and not holdout; x3voted, those voted at 24 h; x3find3, those whose FIND-3 look row holds a taker net; mondays, the record's 26, consecutive, ending at the last Monday before the kit's cut, every Monday of pool-weeks' rows outside the holdout among them; written by tools/copyh-known.cjs, a holdout account's row read no further than its flag",
    sources: [
      {
        name: "population",
        file: "research/kit/data/population.json",
        sha256: line[1],
      },
      ...Object.entries(SOURCES).map(([name, s]) => ({
        name,
        file: s.file,
        sha256: s.sha256,
        rows: rows[name].length,
        holdout: known.holdout[name],
      })),
    ],
    poolWeeksMondays: known.poolWeeksMondays,
    mondays: known.mondays,
    find6exits: known.find6exits,
    x3: known.x3,
    x3voted: known.x3voted,
    x3find3: known.x3find3,
    x3printed: X3_PRINTED,
  };
  const text = `${JSON.stringify(file, null, 1)}\n`;
  fs.writeFileSync(out, text);
  process.stdout.write(
    `wrote ${out}: ${sha256(text)}; mondays ${known.mondays[0]} to ${known.mondays.at(-1)} (pool-weeks outside the holdout: ${known.poolWeeksMondays}), find6exits ${known.find6exits.length}, x3 ${known.x3.length}, x3voted ${known.x3voted.length}, x3find3 ${known.x3find3.length}; holdout rows ${JSON.stringify(known.holdout)}\n`,
  );
}

module.exports = { knownOf, rowsOf };

if (require.main === module)
  main().catch((err) => {
    process.stderr.write(`copyh-known: ${err.message}\n`);
    process.exit(1);
  });
