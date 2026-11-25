"use strict";
/**
 * COPY-H's lists (copyh/rules.md C0, C3). Run from the repository after
 * `pnpm verify`, on its build:
 *
 *   node tools/copyh-freeze.cjs --data   writes apps/poller/copyh/data.sha256
 *
 * --data: every fill file COPY-H's two stages read, E's from WAVE-H's frozen
 * list (`waveh/data.sha256`) and S's from FRESH's (`polish/fresh.sha256`), in
 * the ranges' own order (dist/copyh/range.js `RANGES`), each line equal to
 * its line there: names and hashes only, no data file opened. Nothing is
 * written unless every file of both ranges is in its list, once. The freeze
 * list itself (`copyh/FROZEN.sha256`, C0) is written by this tool at part 5.
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

async function main() {
  const [flag] = process.argv.slice(2);
  if (flag !== "--data") throw new Error("usage: copyh-freeze.cjs --data");
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
}

module.exports = { dataList, listOf };

if (require.main === module)
  main().catch((err) => {
    process.stderr.write(`copyh-freeze: ${err.message}\n`);
    process.exit(1);
  });
