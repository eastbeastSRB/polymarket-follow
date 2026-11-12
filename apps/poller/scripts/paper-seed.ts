/**
 * The seed's builder, run once outside the program (PAPER-BUILD part 2;
 * the run only loads its result, src/paper/seed.ts), and the copy of the
 * kit's pre-cut panel. The seed (the plan's R3, with its review's F6 and F10): every pool
 * account's fills before the cut, from the files the kit's `readAccount`
 * opens — R8's completed file where one exists, else R2-STYLE's capture,
 * `accounts\<addr>.fills.jsonl.gz` only (never R2's light files, which hold
 * reads made after the cut; never the holdout's) — read the kit's way:
 * numbered pages with HTTP 200, deduplicated by (trade_id, instrument_id,
 * timestamp), oldest first, `truncated` when the last page said more; a row
 * at or after the cut is refused, as the kit refuses it. Unlike the kit,
 * trade_id and order_id are kept as their text in the file, so rows with ids
 * above 2^53 − 1 are kept (FIND-REVIEW-6, F4). Written once into the
 * experiment's folder with a manifest; each file is checked against the
 * frozen copy of that manifest when it is loaded.
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { z } from "zod";
import { CUT } from "../src/paper/instants.js";
import { FillRow, keepIdDigits } from "../src/paper/routes.js";
import { SeedAccount } from "../src/paper/seed.js";
import { writeAtomic, type StoredRow } from "../src/paper/store.js";

export class SeedBlindError extends Error {}

const sha256 = (bytes: Buffer): string =>
  createHash("sha256").update(bytes).digest("hex");

/** Where the kit looks for an account's capture (kit/constants.mjs). */
export type CaptureRoots = { capture: string; merged: string };

/** The kit's `fillsFile`, for a pool account: R8's completed file first, else R2's; never the holdout's folder. */
export function captureFile(addr: string, roots: CaptureRoots): string | null {
  const r2 = path.join(roots.capture, "accounts", `${addr}.fills.jsonl.gz`);
  if (!existsSync(r2)) return null;
  const merged = path.join(roots.merged, `${addr}.fills.jsonl.gz`);
  return existsSync(merged) ? merged : r2;
}

const Page = z.object({
  page: z.unknown(),
  status: z.unknown(),
  body: z.object({ data: z.unknown(), more: z.unknown() }).partial().nullish(),
});

/** One capture file read the kit's way, ids as their text. */
export function readCapture(addr: string, file: string): SeedAccount {
  const pages = gunzipSync(readFileSync(file))
    .toString("utf8")
    .split("\n")
    .filter(Boolean)
    .map((line) => Page.safeParse(JSON.parse(line, keepIdDigits)))
    .flatMap((p) => (p.success ? [p.data] : []))
    .filter(
      (p) =>
        p.status === 200 &&
        Array.isArray(p.body?.data) &&
        typeof p.page === "number",
    )
    .sort((a, b) => (a.page as number) - (b.page as number));
  const seen = new Set<string>();
  const rows: StoredRow[] = [];
  let dropped = 0;
  for (const p of pages) {
    for (const x of p.body!.data as unknown[]) {
      const row = FillRow.safeParse(x);
      if (!row.success) {
        dropped += 1;
        continue;
      }
      if (row.data.timestamp >= CUT) {
        throw new SeedBlindError(
          `${addr}: a fill stamped ${new Date(row.data.timestamp).toISOString()}, at or after the cut`,
        );
      }
      const k = `${row.data.trade_id}|${row.data.instrument_id}|${row.data.timestamp}`;
      if (seen.has(k)) continue;
      seen.add(k);
      rows.push(row.data);
    }
  }
  rows.sort((a, b) => a.timestamp - b.timestamp);
  const last = pages.at(-1);
  return {
    addr,
    pages: pages.length,
    truncated: last ? last.body?.more === true : false,
    rows,
    dropped,
  };
}

export const SEED_MANIFEST = "MANIFEST.sha256";

/**
 * Writes every pool account's seed file (`<addr>.json.gz`) and the manifest;
 * an account without a capture file gets none. Refuses a folder that holds a
 * manifest already: the seed is written once.
 */
export function buildSeed(
  pool: readonly string[],
  roots: CaptureRoots,
  seedDir: string,
): { accounts: number; withoutFile: string[]; rows: number; dropped: number } {
  if (existsSync(path.join(seedDir, SEED_MANIFEST))) {
    throw new Error(`${seedDir} holds a seed already: it is written once`);
  }
  const lines: string[] = [];
  const withoutFile: string[] = [];
  let rows = 0;
  let dropped = 0;
  for (const addr of [...pool].sort()) {
    const file = captureFile(addr, roots);
    if (file === null) {
      withoutFile.push(addr);
      continue;
    }
    const seed = readCapture(addr, file);
    const bytes = gzipSync(JSON.stringify(seed));
    writeAtomic(path.join(seedDir, `${addr}.json.gz`), bytes);
    lines.push(`${sha256(bytes)} *${addr}.json.gz`);
    rows += seed.rows.length;
    dropped += seed.dropped;
  }
  writeAtomic(path.join(seedDir, SEED_MANIFEST), `${lines.join("\n")}\n`);
  return { accounts: lines.length, withoutFile, rows, dropped };
}

/** Copies every pinned panel file byte for byte and checks each copy; a file already there must hold the same bytes. */
export function copyPrecutPanel(
  from: string,
  to: string,
  pinned: ReadonlyMap<string, string>,
): number {
  mkdirSync(to, { recursive: true });
  for (const [name, hash] of pinned) {
    const target = path.join(to, name);
    if (!existsSync(target)) copyFileSync(path.join(from, name), target);
    const got = sha256(readFileSync(target));
    if (got !== hash)
      throw new Error(
        `panel copy ${name}: SHA-256 ${got} is not the pinned ${hash}`,
      );
  }
  return pinned.size;
}
