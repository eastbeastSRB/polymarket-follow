/**
 * WAVE-H's two gates (rules.md H0). The freeze: a run goes on only when
 * `waveh/FROZEN.sha256` lists every file of what runs — the program
 * (`dist/waveh.js`, `dist/waveh/`), MARKET-1's and the paper experiment's
 * compiled files its imports reach, the vendored research files, lz4js's
 * three files and `waveh/` — each with its listed hash. The seal: every
 * reader of the store takes a `Gate` and refuses first, before anything is
 * opened, a key dated at or after TEST's start while the gate is closed, and
 * any key whose date does not parse.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { RESEARCH_ROOT } from "../paper/research.js";
import { DATA_END, TEST_START } from "./instants.js";

/** The package's folder: the repository's `apps/poller`. */
export const PACKAGE_ROOT = path.join(RESEARCH_ROOT, "..");

export const FROZEN_FILE = "waveh/FROZEN.sha256";

/**
 * MARKET-1's and the paper experiment's compiled files the program's imports
 * reach, exactly (R4: test/waveh-freeze.test.ts walks the closure).
 */
export const CLOSURE = [
  "dist/market1/book.js",
  "dist/market1/fills.js",
  "dist/market1/lines.js",
  "dist/market1/price.js",
  "dist/market1/stats.js",
  "dist/market1/summary.js",
  "dist/market1/waves.js",
  "dist/paper/instants.js",
  "dist/paper/research.js",
  "dist/paper/stats.js",
];

/** lz4js 0.2.0's files (R4), also checked when they load (`lz4.ts`). */
export const LZ4JS_FILES = ["lz4.js", "util.js", "xxh32.js"].map(
  (f) => `node_modules/lz4js/${f}`,
);

/** `waveh/`'s files the look reads (H0): required in the list even when the folder lacks them. */
export const WAVEH_FILES = [
  "waveh/rules.md",
  "waveh/coins.json",
  "waveh/sizing.json",
  "waveh/data.sha256",
];

/** What runs: every file under these, relative to the package root, must be listed. */
export const FROZEN_SCOPE: readonly string[] = [
  "dist/waveh.js",
  "dist/waveh",
  ...CLOSURE,
  "research",
  ...LZ4JS_FILES,
  "waveh",
];

export type Freeze =
  | { ok: true; sha256: string; files: number }
  | { ok: false; problems: string[] };

export const sha256 = (bytes: Buffer | string): string =>
  createHash("sha256").update(bytes).digest("hex");

function filesUnder(root: string, rel: string): string[] {
  const full = path.join(root, rel);
  if (!existsSync(full)) return [];
  if (!statSync(full).isDirectory()) return [rel];
  return readdirSync(full)
    .sort()
    .flatMap((name) => filesUnder(root, `${rel}/${name}`));
}

/** The files of what runs at `root`, as the freeze tool lists them (the list and its draft left out). */
export function frozenFiles(root: string): string[] {
  return FROZEN_SCOPE.flatMap((scope) => filesUnder(root, scope)).filter(
    (file) => !file.startsWith("waveh/FROZEN"),
  );
}

/** WAVE-H's freeze at `root` (the repository's `apps/poller`). */
export function verifyFreeze(root: string): Freeze {
  const listFile = path.join(root, FROZEN_FILE);
  if (!existsSync(listFile))
    return { ok: false, problems: [`no ${FROZEN_FILE}`] };
  const list = readFileSync(listFile);
  const want = new Map<string, string>();
  for (const line of list.toString("utf8").split("\n")) {
    const m = /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim());
    if (m) want.set(m[2]!, m[1]!);
  }
  const problems: string[] = [];
  // The closure's, lz4js's and the look's own files are required even when a folder lacks them.
  for (const file of new Set([
    ...frozenFiles(root),
    ...CLOSURE,
    ...LZ4JS_FILES,
    ...WAVEH_FILES,
  ])) {
    if (!want.has(file)) problems.push(`not in the freeze: ${file}`);
  }
  for (const [file, hash] of want) {
    const full = path.join(root, file);
    const got = existsSync(full) ? sha256(readFileSync(full)) : null;
    if (got !== hash)
      problems.push(`${got === null ? "missing" : "changed"}: ${file}`);
  }
  return problems.length > 0
    ? { ok: false, problems }
    : { ok: true, sha256: sha256(list), files: want.size };
}

export class SealedError extends Error {}

/** Open only when WAVE-H's own freeze verified. */
export type Gate = { readonly open: boolean };

export const gateOf = (freeze: Freeze): Gate => ({ open: freeze.ok });

/** The rehearsal's gate: closed whatever the freeze says (the plan's 3.6). */
export const CLOSED: Gate = { open: false };
/** The records and marks a run uses end here: TEST's start while the gate is closed (the rehearsal), DATA END once it is open (the look). */
export const boundOf = (gate: Gate): number =>
  gate.open ? DATA_END : TEST_START;

/** The UTC date `YYYYMMDD` with an hour, or null when it is no such date. */
function utc(ymd: string, hour: string): number | null {
  const [y, m, d, h] = [
    Number(ymd.slice(0, 4)),
    Number(ymd.slice(4, 6)),
    Number(ymd.slice(6, 8)),
    Number(hour),
  ];
  const t = Date.UTC(y, m - 1, d, h);
  const back = new Date(t);
  return back.getUTCFullYear() === y &&
    back.getUTCMonth() === m - 1 &&
    back.getUTCDate() === d &&
    back.getUTCHours() === h
    ? t
    : null;
}

/** The instant a store key is dated — its hour, its day, or a funding window's start — or null. */
export function keyDate(key: string): number | null {
  const hourly =
    /^(?:node_fills|node_fills_by_block)\/hourly\/(\d{8})\/(\d{1,2})\.lz4$/.exec(
      key,
    ) ?? /^market_data\/(\d{8})\/(\d{1,2})\/l2Book\/[^/]+\.lz4$/.exec(key);
  if (hourly) return utc(hourly[1]!, hourly[2]!);
  const daily = /^asset_ctxs\/(\d{8})\.csv\.lz4$/.exec(key);
  if (daily) return utc(daily[1]!, "0");
  const funding = /^info\/fundingHistory\/[^/]+\/(\d{13})\.json$/.exec(key);
  return funding ? Number(funding[1]) : null;
}

/** Refuses, before anything is opened, a key without a date that parses, and one dated at or after TEST's start while the gate is closed. */
export function checkSealed(gate: Gate, key: string): void {
  const t = keyDate(key);
  if (t === null) throw new SealedError(`${key}: no date that parses`);
  if (t >= TEST_START && !gate.open) {
    throw new SealedError(
      `${key}: dated ${new Date(t).toISOString()}, at or after TEST's start, and WAVE-H's freeze is not valid`,
    );
  }
}
