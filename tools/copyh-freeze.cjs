"use strict";
/**
 * COPY-H's lists (copyh/rules.md C0, C3). Run from the repository after
 * `pnpm verify`, on its build:
 *
 *   node tools/copyh-freeze.cjs --data [--funding <COPYH_FUNDING>]
 *     writes apps/poller/copyh/data.sha256, and with --funding also
 *     apps/poller/copyh/funding.sha256
 *
 * --data: every fill file COPY-H's two stages read, E's from WAVE-H's frozen
 * list (`waveh/data.sha256`) and S's from FRESH's (`polish/fresh.sha256`), in
 * the ranges' own order (dist/copyh/range.js `RANGES`), each line equal to
 * its line there: names and hashes only, no data file opened. Nothing is
 * written unless every file of both ranges is in its list, once.
 *
 * --funding (C9; RM5): COPY-H's funding store's own list (`funding.sha256`),
 * each line held to the store's `manifest.jsonl`; it must hold the `meta`
 * reply `copyh/coins.json` was made from and every window of every coin of
 * `coins.json` (the funding download's windows, `waveh-fetch.cjs` COPYH),
 * each window file held to its line and read by the program's own reader
 * (`dist/copyh/funding.js`: its shape and its rows' times, no coin's nominal
 * hour twice; no rate is used). Nothing is written unless every window
 * passes. The freeze list itself (`copyh/FROZEN.sha256`, C0) is written by
 * this tool at part 5.
 */
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { pathToFileURL } = require("node:url");

const PKG = path.join(__dirname, "..", "apps", "poller");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

/** A sha256sum list's hashes by key; a key twice or a line of another form throws. */
function listOf(text, name) {
  const list = new Map();
  text.split("\n").forEach((line, i) => {
    if (line === "" || line.startsWith("#")) return;
    const m = /^([0-9a-f]{64}) \*(\S+)$/.exec(line);
    if (m === null || list.has(m[2]))
      throw new Error(`${name} line ${i + 1} is not a new file's line`);
    list.set(m[2], m[1]);
  });
  return list;
}

/** copyh/data.sha256's text: a header naming its two sources by SHA-256, then each range's files in its order, each with its source's hash. */
function dataList(sources, ranges) {
  const lines = [
    "# COPY-H's raw fill files (copyh/rules.md C3): written by tools/copyh-freeze.cjs --data",
    "# from the frozen lists' names and hashes alone, no data file opened:",
  ];
  const body = [];
  const seen = new Set();
  for (const [i, { name, text }] of sources.entries()) {
    const list = listOf(text, name);
    const keys = ranges[i].fill;
    const missing = keys.filter((k) => !list.has(k));
    if (missing.length > 0)
      throw new Error(
        `${missing.length} files of ${ranges[i].name} are not in ${name}, the first ${missing[0]}: nothing written`,
      );
    for (const k of keys) {
      if (seen.has(k))
        throw new Error(`${k} is in two ranges: nothing written`);
      seen.add(k);
      body.push(`${list.get(k)} *${k}`);
    }
    lines.push(
      `# ${ranges[i].name}: ${keys.length} files from ${name} (${sha256(text)})`,
    );
  }
  return `${[...lines, ...body].join("\n")}\n`;
}

const META_KEY = "info/meta.json";

/** manifest.jsonl's lines by key (a torn last line of a running download not read); a key twice throws. */
function manifestOf(text) {
  const lines = new Map();
  const whole = text.slice(0, text.lastIndexOf("\n") + 1);
  for (const row of whole.split("\n")) {
    if (row === "") continue;
    const line = JSON.parse(row);
    if (lines.has(line.key))
      throw new Error(`manifest.jsonl: ${line.key} twice`);
    lines.set(line.key, line);
  }
  return lines;
}

/**
 * copyh/funding.sha256's text: the meta reply's line and every window of
 * every coin, sorted by key, each held to the store's list and manifest and
 * each coin's windows read by the program's reader (`coinRows`, which
 * throws on a window that fails); nothing when any is missing or fails.
 */
function fundingList({
  list,
  listText,
  manifest,
  coins,
  windows,
  read,
  reader,
}) {
  const keys = [
    META_KEY,
    ...coins.coins.flatMap((c) =>
      windows.map((w) => reader.fundingKey(c.name, w.start)),
    ),
  ];
  const missing = keys.filter((k) => !list.has(k));
  if (missing.length > 0)
    throw new Error(
      `${missing.length} files are not in the funding store's list, the first ${missing[0]}: nothing written`,
    );
  for (const k of keys) {
    const m = manifest.get(k);
    if (m === undefined || m.sha256 !== list.get(k))
      throw new Error(
        `${k}: its line differs from the store's manifest: nothing written`,
      );
  }
  if (coins.meta.sha256 !== list.get(META_KEY))
    throw new Error(
      `coins.json was made from another meta reply: nothing written`,
    );
  for (const c of coins.coins) {
    const files = windows.map((w) => {
      const key = reader.fundingKey(c.name, w.start);
      const bytes = read(key);
      if (sha256(bytes) !== list.get(key))
        throw new Error(
          `${key}: its bytes differ from its line: nothing written`,
        );
      return { key, bytes };
    });
    reader.coinRows(c.name, files);
  }
  const lines = [
    "# COPY-H's funding (copyh/rules.md C9): written by tools/copyh-freeze.cjs --data --funding",
    `# from the funding store's funding.sha256 (${sha256(listText)}), each line held to its manifest.jsonl,`,
    `# every window of the ${coins.coins.length} coins of coins.json read by dist/copyh/funding.js:`,
    ...[...keys].sort().map((k) => `${list.get(k)} *${k}`),
  ];
  return `${lines.join("\n")}\n`;
}

async function main() {
  const args = process.argv.slice(2);
  const funding = args.length === 3 && args[1] === "--funding" ? args[2] : null;
  if (args[0] !== "--data" || (args.length !== 1 && funding === null))
    throw new Error(
      "usage: copyh-freeze.cjs --data [--funding <COPYH_FUNDING>]",
    );
  const { RANGES } = await import(
    pathToFileURL(path.join(PKG, "dist", "copyh", "range.js")).href
  );
  const read = (rel) => fs.readFileSync(path.join(PKG, rel), "utf8");
  const text = dataList(
    [
      { name: "waveh/data.sha256", text: read("waveh/data.sha256") },
      { name: "polish/fresh.sha256", text: read("polish/fresh.sha256") },
    ],
    [RANGES.E, RANGES.S],
  );
  const out = path.join(PKG, "copyh", "data.sha256");
  fs.writeFileSync(out, text);
  process.stdout.write(`wrote ${out}: ${sha256(text)}\n`);
  if (funding === null) return;
  const reader = await import(
    pathToFileURL(path.join(PKG, "dist", "copyh", "funding.js")).href
  );
  const listText = fs.readFileSync(
    path.join(funding, "funding.sha256"),
    "utf8",
  );
  const ftext = fundingList({
    list: listOf(listText, "funding.sha256"),
    listText,
    manifest: manifestOf(
      fs.readFileSync(path.join(funding, "manifest.jsonl"), "utf8"),
    ),
    coins: JSON.parse(read("copyh/coins.json")),
    windows: require("./waveh-fetch.cjs").COPYH.windows,
    read: (key) => fs.readFileSync(path.join(funding, ...key.split("/"))),
    reader,
  });
  const fout = path.join(PKG, "copyh", "funding.sha256");
  fs.writeFileSync(fout, ftext);
  process.stdout.write(`wrote ${fout}: ${sha256(ftext)}\n`);
}

module.exports = { dataList, fundingList, listOf, manifestOf };

if (require.main === module)
  main().catch((err) => {
    process.stderr.write(`copyh-freeze: ${err.message}\n`);
    process.exit(1);
  });
