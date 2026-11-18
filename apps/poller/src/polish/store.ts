/**
 * The analyzer's store (the polishing plan 4.1 and 4.3; decisions
 * 2026-11-17, the plan approved): its manifest, read by Zod (our own file:
 * one that does not parse throws), and its files, each read whole and held
 * to the manifest's size and SHA-256. A partition is a table's coin and
 * month (liq's: its month alone), a file a column, its type in its name.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { StoreError } from "../waveh/store.js";
import { checkPath } from "./seal.js";
import { valuesOf, type ColumnType, type Values } from "./tables.js";

export const TABLES = ["tape", "liq", "minute", "funding"] as const;
export type Table = (typeof TABLES)[number];

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
export const StoredFile = z.object({
  bytes: z.number().int().nonnegative(),
  sha256: SHA256,
});
export type StoredFile = z.infer<typeof StoredFile>;

export const Partition = z.object({
  table: z.enum(TABLES),
  coin: z.string().nullable(),
  month: z.string().regex(/^\d{4}-\d\d$/),
  /** Its first instant: the month's, or the minute grid's first minute in it. */
  start: z.number(),
  rows: z.number().int().nonnegative(),
  files: z.record(z.string(), StoredFile),
});
export type Partition = z.infer<typeof Partition>;

const Count = z.object({
  rows: z.number(),
  failed: z.number(),
  offMinute: z.number(),
  late: z.number(),
  twice: z.number(),
});

export const Manifest = z.object({
  version: z.literal(1),
  range: z.string(),
  /** Null for a whole range; the day of a timing run. */
  partial: z.string().nullable(),
  /** No record at or after it is stored. */
  end: z.number(),
  minuteStart: z.number(),
  inputs: z.object({
    list: z.string(),
    listSha256: SHA256,
    fill: z.number(),
    ctxs: z.number(),
    funding: z.number(),
  }),
  code: z.object({
    fingerprint: SHA256,
    wavehFrozen: SHA256,
    node: z.string(),
  }),
  dict: z.object({
    users: z.object({ count: z.number(), file: StoredFile }),
    names: StoredFile,
  }),
  /** `files.jsonl`: each input file's counts, a line each. */
  files: StoredFile,
  partitions: z.array(Partition),
  counts: z.object({
    ctxsByDay: z.record(z.string(), Count),
    ctxsLarge: Count,
    badCells: z.record(z.string(), z.number()),
    funding: z.record(
      z.string(),
      z.object({
        windows: z.record(z.string(), z.number()),
        failed: z.number(),
        late: z.number(),
      }),
    ),
    merge: z.record(
      z.string(),
      z.object({ in: z.number(), out: z.number(), duplicates: z.number() }),
    ),
  }),
  peaks: z.record(z.string(), z.unknown()),
  seconds: z.record(z.string(), z.number()),
  written: z.string(),
});
export type Manifest = z.infer<typeof Manifest>;

/** A line of `files.jsonl`: one input file's counts, from its part. */
export const FileCounts = z.object({
  index: z.number(),
  key: z.string(),
  sha256: SHA256,
  compressed: z.number(),
  decoded: z.number(),
  lines: z.number(),
  records: z.number(),
  failed: z.number(),
  slowLines: z.number(),
  slowRecords: z.number(),
  misread: z.number(),
  late: z.number(),
  refused: z.number(),
  byHour: z.array(z.tuple([z.number(), z.number()])),
  pairs: z.array(z.tuple([z.string(), z.number(), z.number(), z.number()])),
  /** The 40 coins' (coin, `tid`)s that do not pair inside the file: takers less makers (G5). */
  unpaired: z.array(z.tuple([z.string(), z.string(), z.number()])),
  runs: z.array(z.tuple([z.number(), z.number()])),
  times: z
    .object({
      first: z.number(),
      max: z.number(),
      holes: z.array(z.tuple([z.number(), z.number()])),
    })
    .nullable(),
  topTaker: z.array(z.tuple([z.string(), z.number()])),
  takerRows: z.number(),
  liqRows: z.number(),
});
export type FileCounts = z.infer<typeof FileCounts>;

export const Names = z.object({
  coins: z.array(z.string()),
  methods: z.array(z.string()),
  dirs: z.array(z.string()),
});
export type Names = z.infer<typeof Names>;

export const MANIFEST = "manifest.json";
export const USERS_FILE = "dict/users.bin";
export const NAMES_FILE = "dict/names.json";
export const FILES_FILE = "files.jsonl";

/** A partition's folder, relative to the store. */
export const partitionDir = (
  table: Table,
  coin: string | null,
  month: string,
) => (coin === null ? `${table}/${month}` : `${table}/${coin}/${month}`);

export const sha256 = (b: Uint8Array) =>
  createHash("sha256").update(b).digest("hex");

export class Store {
  constructor(
    readonly dir: string,
    readonly manifest: Manifest,
    /** The manifest file's own SHA-256: the store's identity. */
    readonly id: string,
  ) {}

  /** A store file's bytes, held to its line. */
  bytes(rel: string, want: StoredFile): Buffer {
    const file = path.join(this.dir, ...rel.split("/"));
    checkPath(file);
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

  partition(table: Table, coin: string | null, month: string): Partition {
    const p = this.manifest.partitions.find(
      (x) => x.table === table && x.coin === coin && x.month === month,
    );
    if (p === undefined)
      throw new StoreError(`no partition ${partitionDir(table, coin, month)}`);
    return p;
  }

  /** A partition's column, whole (a u64 as its halves, two a row). */
  column(p: Partition, name: string): Values {
    const file = Object.keys(p.files).find((f) => f.startsWith(`${name}.`));
    if (file === undefined)
      throw new StoreError(
        `${partitionDir(p.table, p.coin, p.month)} has no ${name}`,
      );
    const type = file.slice(name.length + 1) as ColumnType;
    return valuesOf(
      type,
      this.bytes(
        `${partitionDir(p.table, p.coin, p.month)}/${file}`,
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

  files(): FileCounts[] {
    return this.bytes(FILES_FILE, this.manifest.files)
      .toString("utf8")
      .split("\n")
      .filter((l) => l !== "")
      .map((l) => FileCounts.parse(JSON.parse(l)));
  }
}

/** The store in `dir`: its manifest read and parsed (a store without one, or with one that does not parse, is refused). */
export function openStore(dir: string): Store {
  checkPath(dir);
  let text: Buffer;
  try {
    text = readFileSync(path.join(dir, MANIFEST));
  } catch {
    throw new StoreError(`${dir}: no ${MANIFEST}`);
  }
  const m = Manifest.parse(JSON.parse(text.toString("utf8")));
  return new Store(dir, m, sha256(text));
}
