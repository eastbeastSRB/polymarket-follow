/**
 * COPY-H's store (copyh/rules.md C3, the store): its manifest, read by Zod
 * (our own file: one that does not parse throws), and its files, each read
 * whole past the seals and held to the manifest's size and SHA-256. Two
 * tables, a file a column, its type in its name (the analyzer's form):
 * - `fills/<bucket>/<YYYY-MM>/`: every kept record of the bucket's accounts
 *   and the month, rows by (account, `time`), ties in the pass's order;
 *   the columns of a part's group (`part.ts` FILLS, the dictionaries made
 *   global: `user` the store's sorted addresses, `dir` and `method` its
 *   sorted names) and `file`, the input file's index;
 * - `bars/<iid>/<YYYY-MM>/`: a coin's minutes of the month in the range,
 *   row k the minute `start + k min`: trades, Σ sz, Σ px·sz, the last price,
 *   the pairs' gap sum and count, the left-out takers by cause; only the
 *   coin-months with a taker record.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { valuesOf, type ColumnType, type Values } from "../polish/tables.js";
import { StoreError, sha256 } from "./run.js";
import { SEALED, checkInside, checkPath, type Seal } from "./seal.js";

export const TABLES = ["fills", "bars"] as const;
export type Table = (typeof TABLES)[number];

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
export const StoredFile = z.object({
  bytes: z.number().int().nonnegative(),
  sha256: SHA256,
});
export type StoredFile = z.infer<typeof StoredFile>;

export const Partition = z.object({
  table: z.enum(TABLES),
  /** The bucket (two hex digits) or the coin's iid (three digits). */
  key: z.string(),
  month: z.string().regex(/^\d{4}-\d\d$/),
  /** Its first instant: the month's, or the range's when later. */
  start: z.number(),
  rows: z.number().int().nonnegative(),
  files: z.record(z.string(), StoredFile),
});
export type Partition = z.infer<typeof Partition>;

/** The store's counts, summed over its files. */
const Counts = z.object({
  classes: z.record(z.string(), z.number()),
  seen: z.number(),
  slowLines: z.number(),
  slowRecords: z.number(),
  misread: z.number(),
  dirs: z.array(z.tuple([z.string(), z.number()])),
  takers: z.array(z.tuple([z.string(), z.number()])),
  /** By coin: [iid, kept, first time, last time, first Settlement time or -1]. */
  coins: z.array(
    z.tuple([z.number(), z.number(), z.number(), z.number(), z.number()]),
  ),
  vaults: z.array(z.string()),
  merge: z.object({
    in: z.number(),
    out: z.number(),
    duplicates: z.number(),
  }),
  /** Trades split across two files next to each other, paired after the pass. */
  straddles: z.number(),
  /** Records whose trade's other record is in neither their file nor the next one: [file, iid, time, tid, taker]. */
  unpaired: z.array(
    z.tuple([z.number(), z.number(), z.number(), z.string(), z.boolean()]),
  ),
  /** Trades met with two takers or two makers, or a third record: [file, key]. */
  odd: z.array(z.tuple([z.number(), z.string()])),
});

export const Manifest = z.object({
  version: z.literal(1),
  range: z.string(),
  start: z.number(),
  end: z.number(),
  inputs: z.object({
    list: z.string(),
    listSha256: SHA256,
    coinsSha256: SHA256,
    dirsSha256: SHA256,
    files: z.number(),
  }),
  code: z.object({ fingerprint: z.string(), node: z.string() }),
  dict: z.object({
    users: z.object({ count: z.number(), file: StoredFile }),
    names: StoredFile,
  }),
  /** `files.jsonl`: each input file's counts, a line each. */
  files: StoredFile,
  partitions: z.array(Partition),
  counts: Counts,
  peaks: z.record(z.string(), z.unknown()),
  seconds: z.record(z.string(), z.number()),
  written: z.string(),
});
export type Manifest = z.infer<typeof Manifest>;

/** The store's names: its `dir` values and liquidation methods, sorted. */
export const Names = z.object({
  dirs: z.array(z.string()),
  methods: z.array(z.string()),
});
export type Names = z.infer<typeof Names>;

export const MANIFEST = "manifest.json";
export const USERS_FILE = "dict/users.bin";
export const NAMES_FILE = "dict/names.json";
export const FILES_FILE = "files.jsonl";

/** A partition's folder, relative to the store. */
export const partitionDir = (table: Table, key: string, month: string) =>
  `${table}/${key}/${month}`;
/** A bucket's or a coin's partition key. */
export const bucketKey = (bucket: number) =>
  bucket.toString(16).padStart(2, "0");
export const coinKey = (iid: number) => String(iid).padStart(3, "0");

export class Store {
  constructor(
    readonly dir: string,
    readonly manifest: Manifest,
    /** The manifest file's own SHA-256: the store's identity. */
    readonly id: string,
    readonly roots: readonly string[],
    readonly seal: Seal = SEALED,
  ) {}

  /** A store file's bytes, held to its line. */
  bytes(rel: string, want: StoredFile): Buffer {
    const file = path.join(this.dir, ...rel.split("/"));
    checkPath(file, this.seal);
    checkInside(file, this.roots);
    let b: Buffer;
    try {
      b = readFileSync(file);
    } catch (err) {
      throw new StoreError(
        `${rel}: ${(err as NodeJS.ErrnoException).code ?? String(err)}`,
      );
    }
    if (b.length !== want.bytes || sha256(b) !== want.sha256)
      throw new StoreError(`${rel}: differs from the manifest`);
    return b;
  }

  partition(table: Table, key: string, month: string): Partition | null {
    return (
      this.manifest.partitions.find(
        (x) => x.table === table && x.key === key && x.month === month,
      ) ?? null
    );
  }

  /** A partition's column, whole (a u64 as its halves, two a row). */
  column(p: Partition, name: string): Values {
    const file = Object.keys(p.files).find((f) => f.startsWith(`${name}.`));
    if (file === undefined)
      throw new StoreError(
        `${partitionDir(p.table, p.key, p.month)} has no ${name}`,
      );
    const type = file.slice(name.length + 1) as ColumnType;
    return valuesOf(
      type,
      this.bytes(
        `${partitionDir(p.table, p.key, p.month)}/${file}`,
        p.files[file]!,
      ),
    );
  }

  users(): string[] {
    const u = this.bytes(USERS_FILE, this.manifest.dict.users.file);
    return Array.from(
      { length: this.manifest.dict.users.count },
      (_, i) => `0x${u.toString("hex", 20 * i, 20 * i + 20)}`,
    );
  }

  names(): Names {
    return Names.parse(
      JSON.parse(
        this.bytes(NAMES_FILE, this.manifest.dict.names).toString("utf8"),
      ),
    );
  }

  /** `files.jsonl`'s lines, as written (each a part header's input and scan). */
  fileLines(): unknown[] {
    return this.bytes(FILES_FILE, this.manifest.files)
      .toString("utf8")
      .split("\n")
      .filter((l) => l !== "")
      .map((l) => JSON.parse(l) as unknown);
  }
}

/** The store in `dir`, past the seals and inside the run's roots: its manifest read and parsed (a store without one, or with one that does not parse, is refused). */
export function openStore(
  dir: string,
  roots: readonly string[],
  seal: Seal = SEALED,
): Store {
  checkPath(dir, seal);
  checkInside(dir, roots);
  let text: Buffer;
  try {
    text = readFileSync(path.join(dir, MANIFEST));
  } catch {
    throw new StoreError(`${dir}: no ${MANIFEST}`);
  }
  const m = Manifest.parse(JSON.parse(text.toString("utf8")));
  return new Store(dir, m, sha256(text), roots, seal);
}
