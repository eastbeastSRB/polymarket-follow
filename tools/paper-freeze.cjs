"use strict";
/**
 * The paper experiment's freeze list (rules.md R0; PAPER-PLAN-REVIEW F4):
 * every file of what runs — the scope the program's own gate checks
 * (dist/paper/gate.js, FROZEN_SCOPE) — with its SHA-256, in sha256sum's
 * format, paths relative to apps/poller; the toolchain written above it as
 * comment lines (information: the gate reads only hash lines). Run after
 * `pnpm verify` on a clean tree, from the repository:
 *
 *   node tools/paper-freeze.cjs            the draft, experiment/FROZEN.draft.sha256
 *   node tools/paper-freeze.cjs --final    the freeze, experiment/FROZEN.sha256
 *
 * The final list opens the program's blind gate; it is written only at the
 * freeze (after the fresh rules review), its own SHA-256 recorded in
 * decisions and its commit tagged paper-freeze-1.
 */
const { createHash } = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");
const { pathToFileURL } = require("node:url");

const PKG = path.join(__dirname, "..", "apps", "poller");
const sha256 = (b) => createHash("sha256").update(b).digest("hex");

function filesUnder(rel) {
  const full = path.join(PKG, rel);
  if (!fs.existsSync(full)) return [];
  if (!fs.statSync(full).isDirectory()) return [rel];
  return fs
    .readdirSync(full)
    .sort()
    .flatMap((name) => filesUnder(`${rel}/${name}`));
}

async function main() {
  const final = process.argv.includes("--final");
  const { FROZEN_SCOPE } = await import(
    pathToFileURL(path.join(PKG, "dist", "paper", "gate.js")).href
  );
  const files = FROZEN_SCOPE.flatMap(filesUnder).filter(
    (f) => !f.startsWith("experiment/FROZEN"),
  );
  if (!files.includes("dist/paper.js"))
    throw new Error("build first: dist/paper.js is missing");
  const version = (pkg) =>
    JSON.parse(
      fs.readFileSync(
        path.join(PKG, "node_modules", pkg, "package.json"),
        "utf8",
      ),
    ).version;
  const commit = execFileSync("git", ["rev-parse", "HEAD"], {
    cwd: PKG,
    encoding: "utf8",
  }).trim();
  const dirty = execFileSync("git", ["status", "--porcelain"], {
    cwd: PKG,
    encoding: "utf8",
  }).trim();
  const lock = fs.readFileSync(path.join(PKG, "..", "..", "pnpm-lock.yaml"));
  const head = [
    `# ${final ? "FROZEN" : "DRAFT, not a freeze"}: the paper experiment's files of what runs (rules.md R0)`,
    `# written ${new Date().toISOString()} from commit ${commit}${dirty ? " (the tree was not clean)" : ""}`,
    `# node ${process.version}; typescript ${version("typescript")}; zod ${version("zod")}; mongodb ${version("mongodb")}; pino ${version("pino")}`,
    `# pnpm-lock.yaml sha256 ${sha256(lock)}`,
  ];
  const lines = files.map(
    (f) => `${sha256(fs.readFileSync(path.join(PKG, f)))} *${f}`,
  );
  const out = path.join(
    PKG,
    "experiment",
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
    `paper-freeze: ${String(err && err.stack ? err.stack : err)}\n`,
  );
  process.exit(1);
});
