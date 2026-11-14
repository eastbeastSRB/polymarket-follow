/**
 * The store's files (rules.md H0, H2): each read takes the gate first; a file
 * is read only when its bytes' SHA-256 equals its list's line — the frozen
 * `waveh/data.sha256` at the look, the download's manifest in the rehearsal,
 * the book list for a book file — and an `.lz4` file is decoded only when
 * its one frame ends at its end. A file missing, differing or failing is a
 * StoreError (exit 5).
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { HOUR_MS } from "../schedule.js";
import { checkSealed, type Gate } from "./gate.js";
import { DATA_END, SIZING_START } from "./instants.js";
import { decodeLz4 } from "./lz4.js";

export class StoreError extends Error {}

/** A list of store files: key → SHA-256. */
export type DataList = ReadonlyMap<string, string>;

const SHA256 = /^[0-9a-f]{64}$/;

/** `waveh/data.sha256`: sha256sum lines `<hash> *<key>`, `#` comments; any other line throws (our own file). */
export function readDataList(text: string): DataList {
  const list = new Map<string, string>();
  text.split("\n").forEach((line, i) => {
    if (line === "" || line.startsWith("#")) return;
    const m = /^([0-9a-f]{64}) \*(\S+)$/.exec(line);
    if (m === null || list.has(m[2]!))
      throw new Error(`data.sha256 line ${i + 1} is not a new file's line`);
    list.set(m[2]!, m[1]!);
  });
  return list;
}

const ManifestLine = z.object({
  key: z.string().min(1),
  bytes: z.number().int().nonnegative(),
  sha256: z.string().regex(SHA256),
});

/**
 * The download's `manifest.jsonl` (the rehearsal's list, before the freeze):
 * a last line without its newline is still being written and is left out;
 * any other line that is not a manifest line throws (our own file).
 */
export function manifestList(text: string): DataList {
  const list = new Map<string, string>();
  const lines = text.split("\n");
  lines.pop();
  lines.forEach((line, i) => {
    const m = ManifestLine.safeParse(JSON.parse(line));
    if (!m.success || list.has(m.data.key))
      throw new Error(`manifest.jsonl line ${i + 1} is not a new file's line`);
    list.set(m.data.key, m.data.sha256);
  });
  return list;
}

const BookLine = z.union([
  z.object({
    key: z.string().min(1),
    bytes: z.number().int().nonnegative(),
    sha256: z.string().regex(SHA256),
  }),
  z.object({ key: z.string().min(1), missing: z.literal(true) }),
]);

/** The store's book list (`books.jsonl`): each needed book file fetched with its hash, or missing from the archive's listing. */
export type BookList = { files: DataList; missing: ReadonlySet<string> };

export function readBookList(text: string): BookList {
  const files = new Map<string, string>();
  const missing = new Set<string>();
  const lines = text.split("\n");
  lines.pop();
  lines.forEach((line, i) => {
    const b = BookLine.safeParse(JSON.parse(line));
    if (!b.success || files.has(b.data.key) || missing.has(b.data.key))
      throw new Error(`books.jsonl line ${i + 1} is not a new key's line`);
    if ("sha256" in b.data) files.set(b.data.key, b.data.sha256);
    else missing.add(b.data.key);
  });
  return { files, missing };
}

/** A store file's bytes: the gate first, then the list's line, then the hash. */
export function readStoreFile(
  gate: Gate,
  store: string,
  list: DataList,
  key: string,
): Buffer {
  checkSealed(gate, key);
  const want = list.get(key);
  if (want === undefined) throw new StoreError(`${key}: not in the list`);
  let bytes: Buffer;
  try {
    bytes = readFileSync(path.join(store, ...key.split("/")));
  } catch (err) {
    throw new StoreError(`${key}: ${(err as NodeJS.ErrnoException).code}`);
  }
  const got = createHash("sha256").update(bytes).digest("hex");
  if (got !== want)
    throw new StoreError(`${key}: SHA-256 ${got}, the list's ${want}`);
  return bytes;
}

/** An `.lz4` store file, checked as `readStoreFile` and decoded. */
export function readLz4(
  gate: Gate,
  store: string,
  list: DataList,
  key: string,
): Uint8Array {
  const bytes = readStoreFile(gate, store, list, key);
  try {
    return decodeLz4(bytes);
  } catch (err) {
    throw new StoreError(`${key}: ${(err as Error).message}`);
  }
}

/** Each line of decoded bytes as text, without a whole-file string; a last empty line is none. */
export function* linesOf(bytes: Uint8Array): Generator<string> {
  const buf = Buffer.from(bytes.buffer, bytes.byteOffset, bytes.length);
  let at = 0;
  while (at < buf.length) {
    const nl = buf.indexOf(10, at);
    const end = nl === -1 ? buf.length : nl;
    yield buf.toString("utf8", at, end);
    at = end + 1;
  }
}

/** The fill files' formats by hour (H2): `node_fills` from its first file to 2025-07-27 08h, `node_fills_by_block` from that hour to DATA END's. */
export const FORMAT_SWITCH = Date.parse("2025-07-27T08:00:00Z");

const keyHour = (t: number) => {
  const iso = new Date(t).toISOString();
  return `${iso.slice(0, 4)}${iso.slice(5, 7)}${iso.slice(8, 10)}/${new Date(t).getUTCHours()}`;
};

/** Every fill file of the hours [from, to), in time order: both formats in the hour they share. */
export function fillKeys(from: number, to: number): string[] {
  const keys: string[] = [];
  const first = Math.max(from, SIZING_START);
  const last = Math.min(to, DATA_END + HOUR_MS);
  for (let h = first; h < last; h += HOUR_MS) {
    if (h <= FORMAT_SWITCH) keys.push(`node_fills/hourly/${keyHour(h)}.lz4`);
    if (h >= FORMAT_SWITCH)
      keys.push(`node_fills_by_block/hourly/${keyHour(h)}.lz4`);
  }
  return keys;
}
