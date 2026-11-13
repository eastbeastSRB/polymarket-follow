"use strict";
/**
 * MARKET-1's freeze list (its rules.md M0): every file of what runs — the
 * scope its own gate checks (dist/market1/gate.js, FROZEN_SCOPE) — with its
 * SHA-256, in sha256sum's format, paths relative to apps/poller; the
 * toolchain written above it as comment lines (the gate reads hash lines
 * only). The eleven paper files must equal the paper experiment's own freeze
 * (experiment/FROZEN.sha256) byte for byte, or nothing is written. Run after
 * `pnpm verify` on a clean tree, from the repository:
 *
 *   node tools/market1-freeze.cjs            the draft, market1/FROZEN.draft.sha256
 *   node tools/market1-freeze.cjs --final    the freeze, market1/FROZEN.sha256
 *
 * The final list opens MARKET-1's gate; it is written only at the freeze
 * (after its fresh reviews), its SHA-256 recorded in decisions and its commit
 * tagged market1-freeze-1. `--final` refuses a tree that is not clean, and
 * both lists hash a build made here from the tree (`dist/market1.js` and
 * `dist/market1/` removed first). The paper experiment's own tool,
 * tools/paper-freeze.cjs, is not this one and is never run for MARKET-1.
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
  fs.rmSync(path.join(PKG, "dist", "market1.js"), { force: true });
  fs.rmSync(path.join(PKG, "dist", "market1"), {
    recursive: true,
    force: true,
  });
  execFileSync(
    process.execPath,
    [
      path.join(PKG, "node_modules", "typescript", "bin", "tsc"),
      "-p",
      "tsconfig.build.json",
    ],
    { cwd: PKG, stdio: "inherit" },
  );
  const { frozenFiles, PAPER_FILES } = await import(
    pathToFileURL(path.join(PKG, "dist", "market1", "gate.js")).href
  );
  const files = frozenFiles(PKG);
  if (!files.includes("dist/market1.js"))
    throw new Error("build first: dist/market1.js is missing");
  const paper = manifest(
    fs.readFileSync(path.join(PKG, "experiment", "FROZEN.sha256"), "utf8"),
  );
  for (const f of PAPER_FILES) {
    const got = sha256(fs.readFileSync(path.join(PKG, f)));
    if (paper.get(f) !== got)
      throw new Error(
        `${f} differs from the paper experiment's freeze: nothing written`,
      );
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
    `# ${final ? "FROZEN" : "DRAFT, not a freeze"}: MARKET-1's files of what runs (market1/rules.md M0)`,
    `# written ${new Date().toISOString()} from commit ${commit}${dirty ? " (the tree was not clean)" : ""}`,
    `# node ${process.version}; typescript ${version("typescript")}; zod ${version("zod")}; mongodb ${version("mongodb")}; pino ${version("pino")}`,
    `# pnpm-lock.yaml sha256 ${sha256(lock)}`,
  ];
  const lines = files.map(
    (f) => `${sha256(fs.readFileSync(path.join(PKG, f)))} *${f}`,
  );
  const out = path.join(
    PKG,
    "market1",
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
    `market1-freeze: ${String(err && err.stack ? err.stack : err)}\n`,
  );
  process.exit(1);
});
