"use strict";
/**
 * COPY-H's lists (copyh/rules.md C0, C3, C17). Run from the repository
 * after `pnpm verify`, on its build:
 *
 *   node tools/copyh-freeze.cjs --data [--funding <COPYH_FUNDING>]
 *     writes apps/poller/copyh/data.sha256, and with --funding also
 *     apps/poller/copyh/funding.sha256
 *   node tools/copyh-freeze.cjs --final
 *     the first freeze list, copyh/FROZEN.sha256, its tag copyh-freeze-1
 *   node tools/copyh-freeze.cjs --closure [<package folder>]
 *     prints the store closure of this build, or of a package folder's
 *     build, as copyh/rehearsal.json records it
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
 * passes.
 *
 * The freeze lists (C0, RM2), one core: every file of what runs (the gate's
 * `frozenFiles`: the program, the closure, the kit, lz4js's three files and
 * `copyh/`), each with its SHA-256 in sha256sum's form, paths relative to
 * apps/poller, by path, after the head: what the list is, when and from
 * which commit it was written, the toolchain, the lockfile's SHA-256 and
 * `# tag copyh-freeze-<n>`, n the next free number (the tags 1 to n − 1
 * exist, n not). Each refuses a tree that is not clean, and writes nothing
 * when it refuses; the supervisor commits the list and tags its commit, and
 * the gate opens only then.
 *
 * --final (C0, C15 (c), C17): the first list (n = 1). It refuses rules.md
 * while it holds a marker (`[SET BEFORE THE FREEZE` then `:` or `]`, or
 * `[OPEN Q` then a digit; C17's own quoted sentence is neither); then it
 * builds the program anew (`dist/copyh.js` and `dist/copyh/` removed, then
 * tsc) and refuses a file `copyh/` must hold missing (the gate's
 * `COPYH_FILES`), a later list's file present, a closure or lz4js file in
 * none of the four freezes or unequal to one naming it (RL12), and a store
 * closure other than the one `copyh/rehearsal.json` records (decisions
 * 2026-11-26, E's store built once and recorded).
 *
 * --closure (C15 (c)): the record of E's store for `copyh/rehearsal.json`,
 * `{"storeClosure": …}` on stdout, writing nothing: the closure of the
 * build in the package folder given (a pinned snapshot's, whose build made
 * E's store), else of this repository's, its files and its own design.js's
 * values found by this build's `dist/copyh/closure.js`.
 */
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { createHash } = require("node:crypto");
const { pathToFileURL } = require("node:url");

const PKG = path.join(__dirname, "..", "apps", "poller");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
/** A module of the build the tool runs on. */
const load = (rel) => import(pathToFileURL(path.join(PKG, "dist", rel)).href);

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

/** --final's store closure check: how the build's store closure at `pkg` differs from the one `rehearsal` records; none when the same. */
async function finalProblems(
  pkg,
  rehearsal = path.join(pkg, "copyh", "rehearsal.json"),
) {
  if (!fs.existsSync(rehearsal))
    return [
      `no ${path.basename(rehearsal)}: E's store is built and recorded first`,
    ];
  const closure = await import(
    pathToFileURL(path.join(pkg, "dist", "copyh", "closure.js")).href
  );
  const record = closure.RehearsalRecord.parse(
    JSON.parse(fs.readFileSync(rehearsal, "utf8")),
  );
  return closure.closureDifferences(
    record.storeClosure,
    closure.storeClosure(pkg),
  );
}

/** --closure: the store closure of the build at `pkg`, its design.js's values its own, by this build's closure.js. */
async function closureRecord(pkg) {
  const closure = await import(
    pathToFileURL(path.join(PKG, "dist", "copyh", "closure.js")).href
  );
  const design = await import(
    pathToFileURL(path.join(pkg, "dist", "copyh", "design.js")).href
  );
  return closure.closureOf(pkg, closure.STORE_ENTRIES, design);
}

/** The four freezes a closure or lz4js file is held to (RL12). */
const FREEZES = [
  "waveh/FROZEN.sha256",
  "market1/FROZEN.sha256",
  "experiment/FROZEN.sha256",
  "polish/FROZEN.sha256",
];
const FROZEN = "copyh/FROZEN.sha256";
/** A marker rules.md may not hold at the freeze (C17, RL10): `[SET BEFORE THE FREEZE` then `:` or `]`, or `[OPEN Q` then a digit. */
const MARKER = /\[SET BEFORE THE FREEZE[:\]]|\[OPEN Q\d/;

/** A list's file lines by path, as the gate reads them (`<hash> *<path>`; any other line skipped). */
function hashLines(text) {
  const out = new Map();
  for (const line of text.split("\n")) {
    const m = /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim());
    if (m) out.set(m[2], m[1]);
  }
  return out;
}

/** The closure's and lz4js's files against the four freezes (RL12): each in one of them and equal to every one naming it; every problem, none when they hold. */
function closureProblems(files, lists, hashOf) {
  const problems = [];
  for (const f of files) {
    const got = hashOf(f);
    const naming = lists.filter(([, list]) => list.has(f));
    if (naming.length === 0)
      problems.push(`${f} is in none of the four freezes`);
    for (const [name, list] of naming)
      if (list.get(f) !== got) problems.push(`${f} differs from ${name}`);
  }
  return problems;
}

/** The lines of rules.md that hold a marker (C17): 1-based. */
const markerLines = (text) =>
  text.split("\n").flatMap((line, i) => (MARKER.test(line) ? [i + 1] : []));

/** The list's head (C0): what it is, when and from which commit it was written, the toolchain, the lockfile, its tag. */
function headOf(o) {
  const v = o.versions;
  return [
    `# FROZEN: COPY-H's files of what runs (copyh/rules.md C0): ${o.what}`,
    `# written ${o.written} from commit ${o.commit}`,
    `# node ${v.node}; typescript ${v.typescript}; zod ${v.zod}; pino ${v.pino}; lz4js ${v.lz4js}`,
    `# pnpm-lock.yaml sha256 ${o.lock}`,
    `# tag copyh-freeze-${o.tag}`,
  ];
}

/**
 * The first freeze list (C0) at the package folder `o.pkg`, written whole,
 * or a refusal that writes no list: `o.tag` is n, `o.build` builds the
 * program anew, `o.storeProblems` gives how the build's store closure
 * differs from the rehearsal's record. The gate's names come from the build
 * the tool runs on.
 */
async function freezeList(o) {
  const { pkg, tag } = o;
  const git = (...args) =>
    execFileSync("git", args, {
      cwd: pkg,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  const refuse = (why) => {
    throw new Error(`${why}: nothing written`);
  };
  const tags = git("tag", "--list", "copyh-freeze-*")
    .split("\n")
    .filter((t) => t !== "")
    .map((t) => Number(t.slice("copyh-freeze-".length)))
    .sort((a, b) => a - b);
  if (
    tags.join(",") !==
    Array.from({ length: tag - 1 }, (_, k) => k + 1).join(",")
  )
    refuse(
      `copyh-freeze-${tag} is not the next free number (the tags: ${tags.join(", ") || "none"})`,
    );
  if (git("status", "--porcelain") !== "")
    refuse("the tree is not clean: commit first, then freeze");
  const read = (rel) => fs.readFileSync(path.join(pkg, rel));
  const has = (rel) => fs.existsSync(path.join(pkg, rel));
  if (has("copyh/rules.md")) {
    const lines = markerLines(read("copyh/rules.md").toString("utf8"));
    if (lines.length > 0)
      refuse(
        `copyh/rules.md holds a marker to set before the freeze, at line ${lines.join(", ")}`,
      );
  }
  o.build();
  const gate = await load("copyh/gate.js");
  const missing = gate.COPYH_FILES.filter((f) => !has(f));
  if (missing.length > 0) refuse(`missing: ${missing.join(", ")}`);
  const K = gate.KINDS;
  const early = [
    ...K.step2.holds,
    ...K.tries.besides,
    ...K.fresh2.holds,
  ].filter(has);
  if (early.length > 0)
    refuse(`a later list's file in the first: ${early.join(", ")}`);
  const problems = closureProblems(
    [...gate.COPYH_CLOSURE, ...gate.LZ4JS_FILES],
    FREEZES.map((f) => [f, hashLines(read(f).toString("utf8"))]),
    (f) => sha256(read(f)),
  );
  const store = await o.storeProblems(pkg);
  if (store.length > 0)
    problems.push(
      `the store closure is not the rehearsal's: ${store.join("; ")}`,
    );
  if (problems.length > 0) refuse(problems.join("; "));
  const files = filesOf(pkg, gate);
  const version = (p) =>
    JSON.parse(read(`node_modules/${p}/package.json`).toString("utf8")).version;
  const head = headOf({
    what: "the first list (copyh-freeze.cjs --final)",
    written: new Date().toISOString(),
    commit: git("rev-parse", "HEAD"),
    versions: {
      node: process.version,
      typescript: version("typescript"),
      zod: version("zod"),
      pino: version("pino"),
      lz4js: version("lz4js"),
    },
    lock: sha256(fs.readFileSync(path.join(pkg, "..", "..", "pnpm-lock.yaml"))),
    tag,
  });
  const list = `${[...head, ...[...files].map(([f, h]) => `${h} *${f}`)].join("\n")}\n`;
  fs.writeFileSync(path.join(pkg, FROZEN), list);
  return { files: files.size, sha256: sha256(list), written: [FROZEN] };
}

/** Every file of what runs at `pkg` by the gate's walk, each with its SHA-256, by path. */
function filesOf(pkg, gate) {
  return new Map(
    gate
      .frozenFiles(pkg)
      .map((f) => [f, sha256(fs.readFileSync(path.join(pkg, f)))])
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0)),
  );
}

/** --final's build, made anew from the tree: `dist/copyh.js` and `dist/copyh/` removed, then the lockfile's tsc. */
function rebuild(pkg) {
  fs.rmSync(path.join(pkg, "dist", "copyh.js"), { force: true });
  fs.rmSync(path.join(pkg, "dist", "copyh"), { recursive: true, force: true });
  execFileSync(
    process.execPath,
    [
      path.join(pkg, "node_modules", "typescript", "bin", "tsc"),
      "-p",
      "tsconfig.build.json",
    ],
    { cwd: pkg, stdio: "inherit" },
  );
}

const USAGE =
  "usage: copyh-freeze.cjs --data [--funding <COPYH_FUNDING>] | --final | --closure [<package folder>]";

async function main() {
  const args = process.argv.slice(2);
  if (args[0] === "--closure" && args.length <= 2) {
    const storeClosure = await closureRecord(
      args.length === 2 ? path.resolve(args[1]) : PKG,
    );
    process.stdout.write(`${JSON.stringify({ storeClosure }, null, 2)}\n`);
    return;
  }
  if (args[0] === "--final" && args.length === 1) {
    const r = await freezeList({
      pkg: PKG,
      tag: 1,
      build: () => rebuild(PKG),
      storeProblems: (pkg) => finalProblems(pkg),
    });
    process.stdout.write(
      `wrote ${r.written.join(", ")}: ${r.files} files, the list's SHA-256 ${r.sha256}; commit it and tag the commit\n`,
    );
    return;
  }
  const funding = args.length === 3 && args[1] === "--funding" ? args[2] : null;
  if (args[0] !== "--data" || (args.length !== 1 && funding === null))
    throw new Error(USAGE);
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

module.exports = {
  closureProblems,
  closureRecord,
  dataList,
  finalProblems,
  freezeList,
  fundingList,
  hashLines,
  listOf,
  manifestOf,
  markerLines,
};

if (require.main === module)
  main().catch((err) => {
    process.stderr.write(`copyh-freeze: ${err.message}\n`);
    process.exit(1);
  });
