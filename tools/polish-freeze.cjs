"use strict";
/**
 * The exam's freeze list (polish/rules.md P0; decisions 2026-11-19, the
 * plan's questions ruled, Q1): every file of what runs — the scope the
 * exam's gate checks (dist/polish/exam/gate.js `examFiles`) — with its
 * SHA-256, in sha256sum's format, paths relative to apps/poller; the
 * toolchain as comment lines; in the final list the line `# tag
 * polish-freeze-1`, the tag that must hold this very list for the gate to
 * open FRESH. The closure's files (WAVE-H's, MARKET-1's and the paper
 * experiment's compiled files the program imports: EXAM_CLOSURE) must each
 * be in one of their freezes and equal every list that names it, byte for
 * byte, or nothing is written. Run after `pnpm verify` on a clean tree, from
 * the repository:
 *
 *   node tools/polish-freeze.cjs            the draft, polish/FROZEN.draft.sha256
 *   node tools/polish-freeze.cjs --final [--tag <n>] [--look2 <look 1's tag>]
 *                                           the freeze, polish/FROZEN.sha256
 *   node tools/polish-freeze.cjs --data <FRESH's manifest.jsonl> <WAVE-H's manifest.jsonl>
 *
 * --tag <n> writes the line "# tag polish-freeze-<n>" (1 when not given): a
 * re-freeze by H0's route takes the next number (rules.md P0). --look2 is
 * look 2's freeze (rules.md P1): it refuses a list that differs from the
 * list the named tag holds anywhere but in LOOK2_ALLOWED's files, a file
 * changed, added or gone.
 *
 * --data writes polish/fresh.sha256 (rules.md P2; THE PLAN D7, D12, T3):
 * every file FRESH's range reads (FRESH_RANGE: 4,102 fill files, 170
 * asset_ctxs days, 342 funding windows), its key and SHA-256 as FRESH's
 * download lists them, from names, bytes and SHA-256s alone (no data file
 * is opened); and prints F7's thin days, FRESH's asset_ctxs days under half
 * the median bytes of WAVE-H's 370 (a fixed reference: FRESH's own days are
 * thin after 2026-09-22). It writes nothing unless the manifest holds
 * exactly the range's files, each once, and the thin days are design.ts's
 * THIN_CTXS_DAYS. The final list is written only at the freeze, after the
 * owner's talk and the fresh reviews, its commit tagged polish-freeze-1:
 * `--final` refuses a tree that is not clean or lacks polish/rules.md,
 * fresh.sha256 or fresh-unpaired.json. Both lists hash a build made here
 * from the tree (`dist/polish.js` and `dist/polish/` removed first).
 * WAVE-H's, MARKET-1's and the paper experiment's own tools are never run
 * for the exam.
 */
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const { manifestLines } = require("./waveh-freeze.cjs");

const PKG = path.join(__dirname, "..", "apps", "poller");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");
const load = (rel) => import(pathToFileURL(path.join(PKG, "dist", rel)).href);
/** The freezes the closure's files are held to. */
const FREEZES = [
  "waveh/FROZEN.sha256",
  "market1/FROZEN.sha256",
  "experiment/FROZEN.sha256",
];

/** A sha256sum list's hashes by path. */
function listOf(text) {
  const want = new Map();
  for (const line of text.split("\n")) {
    const m = /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim());
    if (m) want.set(m[2], m[1]);
  }
  return want;
}

/** Throws unless the manifest's files are exactly the range's keys (manifestLines refuses a key twice). */
function checkKeys(lines, keys) {
  const want = new Set(keys);
  const got = new Set(lines.map((l) => l.key));
  const missing = keys.filter((k) => !got.has(k));
  const extra = lines.map((l) => l.key).filter((k) => !want.has(k));
  if (missing.length + extra.length > 0)
    throw new Error(
      `the manifest is not FRESH's range: ${missing.length} of its files missing (the first ${missing[0] ?? "none"}), ${extra.length} files not in it (the first ${extra[0] ?? "none"}): nothing written`,
    );
}

/** An asset_ctxs key's day, YYYY-MM-DD. */
const dayOfKey = (key) => {
  const m = /^asset_ctxs\/(\d{4})(\d\d)(\d\d)\.csv\.lz4$/.exec(key);
  if (m === null) throw new Error(`${key} is not an asset_ctxs day's`);
  return `${m[1]}-${m[2]}-${m[3]}`;
};

/** F7's thin days (D12): FRESH's asset_ctxs days under half the median bytes of WAVE-H's, in day order, with that median. */
function thinDays(fresh, waveh) {
  const ctxs = (lines) => lines.filter((l) => l.key.startsWith("asset_ctxs/"));
  const ref = ctxs(waveh)
    .map((l) => l.bytes)
    .sort((a, b) => a - b);
  if (ref.length === 0)
    throw new Error("WAVE-H's manifest holds no asset_ctxs day");
  const n = ref.length;
  const median =
    n % 2 === 1 ? ref[(n - 1) / 2] : (ref[n / 2 - 1] + ref[n / 2]) / 2;
  const days = ctxs(fresh)
    .filter((l) => l.bytes < 0.5 * median)
    .map((l) => ({ day: dayOfKey(l.key), bytes: l.bytes }))
    .sort((a, b) => (a.day < b.day ? -1 : 1));
  return { reference: n, median, days };
}

/** polish/fresh.sha256's text: every file of the manifest, by key (waveh/data.sha256's form). */
const freshList = (lines) =>
  `${[...lines]
    .sort((a, b) => (a.key < b.key ? -1 : 1))
    .map((l) => `${l.sha256} *${l.key}`)
    .join("\n")}\n`;

/** The files look 2's freeze may change or add against the list look 1 ran under (rules.md P1, 2.; a test holds rules.md's list to this one). */
const LOOK2_ALLOWED = [
  "dist/polish/seal.js",
  "dist/polish/range.js",
  "dist/polish/main.js",
  "dist/polish/exam/design.js",
  "dist/polish/exam/fresh.js",
  "dist/polish/exam/steps.js",
  "polish/fresh2.sha256",
  "polish/look1.sha256",
  "polish/fresh-unpaired.json",
];

/** Look 2's differences from look 1's list outside LOOK2_ALLOWED, each named: a file changed or added but not allowed, and any file gone. */
function outsideLook2(before, after) {
  const out = [];
  for (const [f, hash] of after)
    if (!LOOK2_ALLOWED.includes(f) && before.get(f) !== hash)
      out.push(`${before.has(f) ? "changed" : "added"}: ${f}`);
  for (const f of before.keys()) if (!after.has(f)) out.push(`gone: ${f}`);
  return out;
}

/** The closure's files against the three freezes (EXAM_CLOSURE): each in one of them and equal to every list naming it; every problem, none when they hold. */
function closureProblems(closure, lists, hashOf) {
  const problems = [];
  for (const f of closure) {
    const got = hashOf(f);
    const naming = lists.filter(([, list]) => list.has(f));
    if (naming.length === 0)
      problems.push(`${f} is in none of the three freezes`);
    for (const [name, list] of naming)
      if (list.get(f) !== got) problems.push(`${f} differs from ${name}`);
  }
  return problems;
}

/** The list's comment lines: what it is, from which commit and toolchain, the files required by name not yet written (a draft), and in a final list alone its tag line. */
function headOf(o) {
  return [
    `# ${o.tag === null ? "DRAFT, not a freeze" : "FROZEN"}: the exam's files of what runs (polish/rules.md P0)`,
    `# written ${o.written} from commit ${o.commit}${o.dirty ? " (the tree was not clean)" : ""}`,
    `# node ${o.versions.node}; typescript ${o.versions.typescript}; zod ${o.versions.zod}; pino ${o.versions.pino}; lz4js ${o.versions.lz4js}`,
    `# pnpm-lock.yaml sha256 ${o.lock}`,
    ...(o.absent.length > 0
      ? [`# not yet written, required by name: ${o.absent.join(", ")}`]
      : []),
    ...(o.tag === null ? [] : [`# tag polish-freeze-${o.tag}`]),
  ];
}

/** The tag number of `--tag <n>`: 1 when not given; a positive integer, else refused. */
function tagOf(argv) {
  const at = argv.indexOf("--tag");
  if (at === -1) return 1;
  const n = argv[at + 1];
  if (n === undefined || !/^[1-9][0-9]*$/.test(n))
    throw new Error(`--tag needs a number from 1, not ${n ?? "nothing"}`);
  return Number(n);
}

/** Why --final writes nothing, or null: a tree that is not clean (`git status --porcelain`'s text), or a file the exam reads by name missing. */
function finalRefusal(status, present) {
  if (status !== "") return "the tree is not clean: commit first, then freeze";
  for (const f of [
    "polish/rules.md",
    "polish/fresh.sha256",
    "polish/fresh-unpaired.json",
  ])
    if (!present(f)) return `${f} is missing: nothing written`;
  return null;
}

async function main() {
  const at = process.argv.indexOf("--data");
  if (at !== -1) {
    const read = (i) => manifestLines(fs.readFileSync(process.argv[i], "utf8"));
    const lines = read(at + 1);
    const waveh = read(at + 2);
    const { FRESH_RANGE } = await load("polish/range.js");
    const { ctxsKey, fundingKey } = await load("waveh/keys.js");
    const { loadCoins } = await load("waveh/coins.js");
    const { THIN_CTXS_DAYS } = await load("polish/exam/design.js");
    checkKeys(lines, [
      ...FRESH_RANGE.fill,
      ...FRESH_RANGE.days.map(ctxsKey),
      ...loadCoins().list.flatMap((c) =>
        FRESH_RANGE.fundingStarts.map((s) => fundingKey(c.name, s)),
      ),
    ]);
    const thin = thinDays(lines, waveh);
    process.stdout.write(
      `F7's thin asset_ctxs days, under half the median ${thin.median} B of WAVE-H's ${thin.reference}:\n${thin.days
        .map((d) => `  ${d.day} ${d.bytes} B\n`)
        .join("")}`,
    );
    const days = thin.days.map((d) => d.day);
    if (JSON.stringify(days) !== JSON.stringify(THIN_CTXS_DAYS))
      throw new Error(
        `design.ts's THIN_CTXS_DAYS is ${JSON.stringify(THIN_CTXS_DAYS)}, not these ${days.length} days: nothing written`,
      );
    const text = freshList(lines);
    fs.writeFileSync(path.join(PKG, "polish", "fresh.sha256"), text);
    process.stdout.write(
      `polish/fresh.sha256: ${lines.length} files, its SHA-256 ${sha256(text)}\n`,
    );
    return;
  }
  const final = process.argv.includes("--final");
  const tag = final ? tagOf(process.argv) : null;
  const look2At = process.argv.indexOf("--look2");
  const look2 = look2At === -1 ? null : process.argv[look2At + 1];
  if (look2 !== null && (!final || look2 === undefined))
    throw new Error("--look2 <look 1's tag> goes with --final");
  const git = (...args) =>
    execFileSync("git", args, { cwd: PKG, encoding: "utf8" }).trim();
  if (final) {
    const why = finalRefusal(git("status", "--porcelain"), (f) =>
      fs.existsSync(path.join(PKG, f)),
    );
    if (why !== null) throw new Error(why);
  }
  fs.rmSync(path.join(PKG, "dist", "polish.js"), { force: true });
  fs.rmSync(path.join(PKG, "dist", "polish"), { recursive: true, force: true });
  execFileSync(
    process.execPath,
    [
      path.join(PKG, "node_modules", "typescript", "bin", "tsc"),
      "-p",
      "tsconfig.build.json",
    ],
    { cwd: PKG, stdio: "inherit" },
  );
  const { EXAM_CLOSURE, EXAM_FILES, examFiles } = await load(
    "polish/exam/gate.js",
  );
  const files = examFiles(PKG);
  if (!files.includes("dist/polish.js"))
    throw new Error("build first: dist/polish.js is missing");
  const lists = FREEZES.map((f) => [
    f,
    listOf(fs.readFileSync(path.join(PKG, f), "utf8")),
  ]);
  const closure = closureProblems(EXAM_CLOSURE, lists, (f) =>
    sha256(fs.readFileSync(path.join(PKG, f))),
  );
  if (closure.length > 0)
    throw new Error(`${closure.join("; ")}: nothing written`);
  const absent = EXAM_FILES.filter((f) => !files.includes(f));
  const version = (pkg) =>
    JSON.parse(
      fs.readFileSync(
        path.join(PKG, "node_modules", pkg, "package.json"),
        "utf8",
      ),
    ).version;
  const lock = fs.readFileSync(path.join(PKG, "..", "..", "pnpm-lock.yaml"));
  const head = headOf({
    tag,
    written: new Date().toISOString(),
    commit: git("rev-parse", "HEAD"),
    dirty: git("status", "--porcelain") !== "",
    versions: {
      node: process.version,
      typescript: version("typescript"),
      zod: version("zod"),
      pino: version("pino"),
      lz4js: version("lz4js"),
    },
    lock: sha256(lock),
    absent,
  });
  const lines = files.map(
    (f) => `${sha256(fs.readFileSync(path.join(PKG, f)))} *${f}`,
  );
  if (look2 !== null) {
    const before = listOf(git("show", `${look2}:./polish/FROZEN.sha256`));
    const outside = outsideLook2(before, listOf(lines.join("\n")));
    if (outside.length > 0)
      throw new Error(
        `look 2's list differs from ${look2}'s outside the files rules.md P1 allows: ${outside.join("; ")}: nothing written`,
      );
  }
  const out = path.join(
    PKG,
    "polish",
    final ? "FROZEN.sha256" : "FROZEN.draft.sha256",
  );
  const text = `${[...head, ...lines].join("\n")}\n`;
  fs.writeFileSync(out, text);
  process.stdout.write(
    `${path.relative(PKG, out)}: ${files.length} files, its SHA-256 ${sha256(text)}\n`,
  );
}

module.exports = {
  LOOK2_ALLOWED,
  checkKeys,
  closureProblems,
  finalRefusal,
  freshList,
  headOf,
  outsideLook2,
  tagOf,
  thinDays,
};

if (require.main === module)
  main().catch((err) => {
    process.stderr.write(
      `polish-freeze: ${String(err && err.stack ? err.stack : err)}\n`,
    );
    process.exit(1);
  });
