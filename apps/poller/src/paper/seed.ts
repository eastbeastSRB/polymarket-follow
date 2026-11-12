/**
 * The seed (the plan's R3, with its review's F6 and F10): every pool
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
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { z } from "zod";
import { CUT } from "./instants.js";
import { FillRow, keepIdDigits } from "./routes.js";
import { writeAtomic, type StoredRow } from "./store.js";

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

export const SeedAccount = z.object({
  addr: z.string().regex(/^0x[0-9a-f]{40}$/),
  pages: z.number().int(),
  truncated: z.boolean(),
  rows: z.array(FillRow),
  /** Rows that failed the check, as the kit's `dropped`. */
  dropped: z.number().int(),
});
export type SeedAccount = z.infer<typeof SeedAccount>;

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

/** `name -> sha256` of a manifest in sha256sum's format. */
export function readManifest(text: string): Map<string, string> {
  const want = new Map<string, string>();
  for (const line of text.split("\n")) {
    const m = /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim());
    if (m) want.set(m[2]!, m[1]!);
  }
  return want;
}

/** An account's seed, checked against the frozen manifest; null when the manifest lists none for it. */
export function loadSeed(
  seedDir: string,
  manifest: ReadonlyMap<string, string>,
  addr: string,
): SeedAccount | null {
  const name = `${addr}.json.gz`;
  const want = manifest.get(name);
  if (want === undefined) return null;
  const bytes = readFileSync(path.join(seedDir, name));
  const got = sha256(bytes);
  if (got !== want) {
    throw new Error(
      `seed ${name}: SHA-256 ${got} differs from the manifest's ${want}`,
    );
  }
  const seed = SeedAccount.parse(
    JSON.parse(gunzipSync(bytes).toString("utf8")),
  );
  if (seed.addr !== addr) throw new Error(`seed ${name} holds ${seed.addr}`);
  return seed;
}
