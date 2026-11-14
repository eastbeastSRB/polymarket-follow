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
 *
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

async function main() {
  const final = process.argv.includes("--final");
  const git = (...args) =>
    execFileSync("git", args, { cwd: PKG, encoding: "utf8" }).trim();
  if (final && git("status", "--porcelain") !== "")
    throw new Error("the tree is not clean: commit first, then freeze");
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

main().catch((err) => {
  process.stderr.write(
    `waveh-freeze: ${String(err && err.stack ? err.stack : err)}\n`,
  );
  process.exit(1);
});
