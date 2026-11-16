"use strict";
/**
 * WAVE-H's freeze list (its rules.md H0): every file of what runs — the
 * scope its own gate checks (dist/waveh/gate.js, FROZEN_SCOPE) — with its
 * SHA-256, in sha256sum's format, paths relative to apps/poller; the
 * toolchain written above it as comment lines (the gate reads hash lines
 * only). The closure's files (MARKET-1's and the paper experiment's compiled
 * files the program imports) must each be in MARKET-1's freeze
 * (market1/FROZEN.sha256) or the paper experiment's
 * (experiment/FROZEN.sha256) and equal every list that names it, byte for
 * byte, or nothing is written. Run after `pnpm verify` on a clean tree, from
 * the repository:
 *
 *   node tools/waveh-freeze.cjs            the draft, waveh/FROZEN.draft.sha256
 *   node tools/waveh-freeze.cjs --final    the freeze, waveh/FROZEN.sha256
 *   node tools/waveh-freeze.cjs --data <store>\manifest.jsonl
 *
 * --data writes waveh/data.sha256 (rules.md H2: every file the main download
 * stored, its key and SHA-256, as the download's manifest lists them; run
 * once the download is complete, before the draft) and prints R3 (i)'s list:
 * each fill file whose bytes are under 30% of the median of its 24 nearest
 * neighbours' in its format (12 before, 12 after), from the manifest's sizes
 * alone: no data file is opened. It writes nothing unless every key is new
 * and the files are, by prefix, the counts the program reads (DATA_COUNTS).
 * The final list opens WAVE-H's gate; it is written only at the freeze
 * (after its fresh reviews), its SHA-256 recorded in decisions and its commit
 * tagged waveh-freeze-1. `--final` refuses a tree that is not clean, and both
 * lists hash a build made here from the tree (`dist/waveh.js` and
 * `dist/waveh/` removed first). MARKET-1's and the paper experiment's own
 * tools are not this one and are never run for WAVE-H.
 */
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");

const PKG = path.join(__dirname, "..", "apps", "poller");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

function manifest(text) {
  const want = new Map();
  for (const line of text.split("\n")) {
    const m = /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim());
    if (m) want.set(m[2], m[1]);
  }
  return want;
}

/** The download's manifest lines (key, bytes, sha256); a line that is not one, or repeats a key, throws (our own file). */
function manifestLines(text) {
  const lines = text.split("\n");
  if (lines.pop() !== "") throw new Error("the manifest's last line is torn");
  const keys = new Set();
  return lines.map((line, i) => {
    const l = JSON.parse(line);
    if (
      typeof l.key !== "string" ||
      !Number.isSafeInteger(l.bytes) ||
      !/^[0-9a-f]{64}$/.test(l.sha256 ?? "")
    )
      throw new Error(`the manifest's line ${i + 1} is not a file's`);
    if (keys.has(l.key))
      throw new Error(`the manifest's line ${i + 1} repeats ${l.key}`);
    keys.add(l.key);
    return { key: l.key, bytes: l.bytes, sha256: l.sha256 };
  });
}

/**
 * The store's files the program reads, by prefix: every fill file of both
 * formats (fillKeys: 1,507 + 7,338), the asset_ctxs days from 2025-05-25 to
 * DATA END's (370) and the 38 coins' 20 funding windows (760).
 */
const DATA_COUNTS = {
  "node_fills/hourly/": 1_507,
  "node_fills_by_block/hourly/": 7_338,
  "asset_ctxs/": 370,
  "info/fundingHistory/": 760,
};

/** Throws unless the manifest's files are, by prefix, DATA_COUNTS's, with no key under another prefix. */
function checkCounts(lines) {
  const prefixes = Object.keys(DATA_COUNTS);
  const got = Object.fromEntries(prefixes.map((p) => [p, 0]));
  for (const { key } of lines) {
    const p = prefixes.find((q) => key.startsWith(q));
    if (p === undefined)
      throw new Error(`the manifest holds ${key}, under none of the prefixes`);
    got[p] += 1;
  }
  const off = prefixes.filter((p) => got[p] !== DATA_COUNTS[p]);
  if (off.length > 0)
    throw new Error(
      `the manifest holds ${off.map((p) => `${got[p]} ${p} files, not ${DATA_COUNTS[p]}`).join("; ")}`,
    );
}

/** R3 (i): each fill file under 30% of the median of its 24 nearest neighbours' bytes in its format. */
function shortFiles(lines) {
  const out = [];
  for (const format of ["node_fills/", "node_fills_by_block/"]) {
    const hour = (key) => {
      const m = /hourly\/(\d{8})\/(\d{1,2})\.lz4$/.exec(key);
      return `${m[1]}${m[2].padStart(2, "0")}`;
    };
    const files = lines
      .filter((l) => l.key.startsWith(format))
      .sort((a, b) => (hour(a.key) < hour(b.key) ? -1 : 1));
    files.forEach((l, i) => {
      const near = [
        ...files.slice(Math.max(0, i - 12), i),
        ...files.slice(i + 1, i + 13),
      ]
        .map((n) => n.bytes)
        .sort((a, b) => a - b);
      if (near.length === 0) return;
      const median =
        near.length % 2 === 1
          ? near[(near.length - 1) / 2]
          : (near[near.length / 2 - 1] + near[near.length / 2]) / 2;
      if (l.bytes < 0.3 * median)
        out.push({ key: l.key, bytes: l.bytes, median });
    });
  }
  return out;
}

/**
 * Why --final writes nothing, or null: a tree that is not clean (`git status
 * --porcelain`'s text), or a file the gate requires by name missing (the
 * look reads both: WAVEH_FILES).
 */
function finalRefusal(status, present) {
  if (status !== "") return "the tree is not clean: commit first, then freeze";
  for (const f of ["waveh/sizing.json", "waveh/data.sha256"])
    if (!present(f)) return `${f} is missing: nothing written`;
  return null;
}

/** waveh/data.sha256's text: every file of the manifest, by key. */
const dataList = (lines) =>
  `${[...lines]
    .sort((a, b) => (a.key < b.key ? -1 : 1))
    .map((l) => `${l.sha256} *${l.key}`)
    .join("\n")}\n`;

async function main() {
  const at = process.argv.indexOf("--data");
  if (at !== -1) {
    const lines = manifestLines(fs.readFileSync(process.argv[at + 1], "utf8"));
    checkCounts(lines);
    fs.writeFileSync(path.join(PKG, "waveh", "data.sha256"), dataList(lines));
    process.stdout.write(
      `waveh/data.sha256: ${lines.length} files\nR3 (i), fill files under 30% of their 24 neighbours' median bytes:\n${shortFiles(
        lines,
      )
        .map((s) => `  ${s.key} ${s.bytes} B, the median ${s.median} B\n`)
        .join("")}`,
    );
    return;
  }
  const final = process.argv.includes("--final");
  const git = (...args) =>
    execFileSync("git", args, { cwd: PKG, encoding: "utf8" }).trim();
  if (final) {
    const why = finalRefusal(git("status", "--porcelain"), (f) =>
      fs.existsSync(path.join(PKG, f)),
    );
    if (why !== null) throw new Error(why);
  }
  fs.rmSync(path.join(PKG, "dist", "waveh.js"), { force: true });
  fs.rmSync(path.join(PKG, "dist", "waveh"), { recursive: true, force: true });
  execFileSync(
    process.execPath,
    [
      path.join(PKG, "node_modules", "typescript", "bin", "tsc"),
      "-p",
      "tsconfig.build.json",
    ],
    { cwd: PKG, stdio: "inherit" },
  );
  const { frozenFiles, CLOSURE } = await import(
    pathToFileURL(path.join(PKG, "dist", "waveh", "gate.js")).href
  );
  const files = frozenFiles(PKG);
  if (!files.includes("dist/waveh.js"))
    throw new Error("build first: dist/waveh.js is missing");
  const lists = ["market1/FROZEN.sha256", "experiment/FROZEN.sha256"].map(
    (f) => [f, manifest(fs.readFileSync(path.join(PKG, f), "utf8"))],
  );
  for (const f of CLOSURE) {
    const got = sha256(fs.readFileSync(path.join(PKG, f)));
    const naming = lists.filter(([, list]) => list.has(f));
    if (naming.length === 0)
      throw new Error(
        `${f} is in neither MARKET-1's nor the paper experiment's freeze: nothing written`,
      );
    for (const [name, list] of naming)
      if (list.get(f) !== got)
        throw new Error(`${f} differs from ${name}: nothing written`);
  }
  const version = (pkg) =>
    JSON.parse(
      fs.readFileSync(
        path.join(PKG, "node_modules", pkg, "package.json"),
        "utf8",
      ),
    ).version;
  const commit = git("rev-parse", "HEAD");
  const dirty = git("status", "--porcelain");
  const lock = fs.readFileSync(path.join(PKG, "..", "..", "pnpm-lock.yaml"));
  const head = [
    `# ${final ? "FROZEN" : "DRAFT, not a freeze"}: WAVE-H's files of what runs (waveh/rules.md H0)`,
    `# written ${new Date().toISOString()} from commit ${commit}${dirty ? " (the tree was not clean)" : ""}`,
    `# node ${process.version}; typescript ${version("typescript")}; zod ${version("zod")}; pino ${version("pino")}; lz4js ${version("lz4js")}`,
    `# pnpm-lock.yaml sha256 ${sha256(lock)}`,
  ];
  const lines = files.map(
    (f) => `${sha256(fs.readFileSync(path.join(PKG, f)))} *${f}`,
  );
  const out = path.join(
    PKG,
    "waveh",
    final ? "FROZEN.sha256" : "FROZEN.draft.sha256",
  );
  const text = `${[...head, ...lines].join("\n")}\n`;
  fs.writeFileSync(out, text);
  process.stdout.write(
    `${path.relative(PKG, out)}: ${files.length} files, its SHA-256 ${sha256(text)}\n`,
  );
}

module.exports = {
  DATA_COUNTS,
  checkCounts,
  dataList,
  finalRefusal,
  manifestLines,
  shortFiles,
};

if (require.main === module)
  main().catch((err) => {
    process.stderr.write(
      `waveh-freeze: ${String(err && err.stack ? err.stack : err)}\n`,
    );
    process.exit(1);
  });
