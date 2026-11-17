/**
 * A part: one input file's rows and counts (the polishing plan 4.2(3)),
 * written whole by the worker that scanned it and read back by the merge.
 * Its bytes: `PLSHPRT1`, the header's length (u32), the header (JSON), then
 * the column blobs, each at an offset a multiple of 8. The header names the
 * input (its key and SHA-256), the code that wrote it (the fingerprint), the
 * scan's counts, the file's dictionaries, every blob, and the SHA-256 of
 * everything after it; a part that does not match is refused.
 */
import { createHash } from "node:crypto";
import { closeSync, openSync, readFileSync, readSync, statSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { StoreError } from "../waveh/store.js";
import type { Scan } from "./scan.js";
import {
  LIQ,
  TAPE,
  bytesOf,
  valuesOf,
  type Column,
  type Values,
} from "./tables.js";
import type { LiqWriter, Names, TakerWriter } from "./writers.js";

const MAGIC = Buffer.from("PLSHPRT1", "latin1");

const Blobs = z.record(z.string(), z.tuple([z.number(), z.number()]));

export const PartHeader = z.object({
  input: z.object({ index: z.number(), key: z.string(), sha256: z.string() }),
  code: z.string(),
  compressed: z.number(),
  scan: z.object({
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
    pairs: z.array(z.tuple([z.string(), z.number(), z.number()])),
    runs: z.array(z.tuple([z.number(), z.number()])),
    times: z
      .object({
        first: z.number(),
        max: z.number(),
        holes: z.array(z.tuple([z.number(), z.number()])),
      })
      .nullable(),
  }),
  topTaker: z.array(z.tuple([z.string(), z.number()])),
  users: z.object({
    count: z.number(),
    blob: z.tuple([z.number(), z.number()]),
  }),
  taker: z.array(
    z.object({
      coin: z.string(),
      rows: z.number(),
      minTime: z.number(),
      maxTime: z.number(),
      blobs: Blobs,
    }),
  ),
  liq: z.object({
    rows: z.number(),
    minTime: z.number().nullable(),
    maxTime: z.number().nullable(),
    coins: z.array(z.string()),
    methods: z.array(z.string()),
    dirs: z.array(z.string()),
    blobs: Blobs,
  }),
  payload: z.object({ bytes: z.number(), sha256: z.string() }),
});
export type PartHeader = z.infer<typeof PartHeader>;

export const partFile = (dir: string, index: number) =>
  path.join(dir, `${index}.part`);

const pad8 = (n: number) => (8 - (n % 8)) % 8;

/** The least and the greatest of a list (a spread would overflow the stack on millions of rows); nulls when empty. */
function range(xs: readonly number[]): [number, number] | [null, null] {
  if (xs.length === 0) return [null, null];
  let lo = xs[0]!;
  let hi = lo;
  for (const x of xs) {
    if (x < lo) lo = x;
    if (x > hi) hi = x;
  }
  return [lo, hi];
}

/** The part of one scanned input file. */
export function partOf(p: {
  input: { index: number; key: string; sha256: string };
  code: string;
  compressed: number;
  scan: Scan;
  taker: TakerWriter;
  liq: LiqWriter;
  users: Names;
}): Buffer {
  const chunks: Buffer[] = [];
  let at = 0;
  const blob = (bytes: Buffer): [number, number] => {
    const where: [number, number] = [at, bytes.length];
    chunks.push(bytes, Buffer.alloc(pad8(bytes.length)));
    at += bytes.length + pad8(bytes.length);
    return where;
  };
  const columns = (cols: readonly Column[], rows: Record<string, number[]>) =>
    Object.fromEntries(
      cols.map(([name, type]) => [name, blob(bytesOf(type, rows[name]!))]),
    );
  const users = blob(
    Buffer.concat(p.users.list.map((a) => Buffer.from(a.slice(2), "hex"))),
  );
  const taker = [...p.taker.coins].map(([coin, rows]) => {
    const [minTime, maxTime] = range(rows.time) as [number, number];
    return {
      coin,
      rows: rows.time.length,
      minTime,
      maxTime,
      blobs: columns(TAPE, rows),
    };
  });
  const lt = p.liq.rows.time;
  const [minTime, maxTime] = range(lt);
  const liq = {
    rows: lt.length,
    minTime,
    maxTime,
    coins: p.liq.coins.list,
    methods: p.liq.methods.list,
    dirs: p.liq.dirs.list,
    blobs: columns(LIQ, p.liq.rows),
  };
  const payload = Buffer.concat(chunks);
  const s = p.scan;
  const header: PartHeader = {
    input: p.input,
    code: p.code,
    compressed: p.compressed,
    scan: {
      decoded: s.decoded,
      lines: s.lines,
      records: s.records,
      failed: s.failed,
      slowLines: s.slowLines,
      slowRecords: s.slowRecords,
      misread: s.misread,
      late: s.late,
      refused: s.refused,
      byHour: [...s.byHour],
      pairs: [...s.pairs].map(([c, [a, b]]) => [c, a, b]),
      runs: s.runs,
      times: s.times,
    },
    topTaker: [...p.taker.topTaker],
    users: { count: p.users.list.length, blob: users },
    taker,
    liq,
    payload: {
      bytes: payload.length,
      sha256: createHash("sha256").update(payload).digest("hex"),
    },
  };
  const text = Buffer.from(JSON.stringify(header), "utf8");
  const head = Buffer.concat([
    text,
    Buffer.alloc(pad8(MAGIC.length + 4 + text.length), 0x20),
  ]);
  const len = Buffer.alloc(4);
  len.writeUInt32LE(head.length);
  return Buffer.concat([MAGIC, len, head, payload]);
}

/** A part's header and where its payload starts; null when the file is missing or is not a whole part (a resumed pass redoes it). */
export function readPartHeader(
  file: string,
): { header: PartHeader; start: number } | null {
  let fd: number;
  try {
    fd = openSync(file, "r");
  } catch {
    return null;
  }
  try {
    const pre = Buffer.alloc(12);
    if (readSync(fd, pre, 0, 12, 0) !== 12 || !pre.subarray(0, 8).equals(MAGIC))
      return null;
    const n = pre.readUInt32LE(8);
    const text = Buffer.alloc(n);
    if (readSync(fd, text, 0, n, 12) !== n) return null;
    const h = PartHeader.safeParse(JSON.parse(text.toString("utf8")));
    if (!h.success) return null;
    if (statSync(file).size !== 12 + n + h.data.payload.bytes) return null;
    return { header: h.data, start: 12 + n };
  } catch {
    return null;
  } finally {
    closeSync(fd);
  }
}

export type PartRows = {
  header: PartHeader;
  users: string[];
  taker: Map<string, Record<string, Values>>;
  liq: Record<string, Values>;
};

/** A whole part, its payload held to its SHA-256; a part that is not whole or differs throws. */
export function readPart(file: string): PartRows {
  const head = readPartHeader(file);
  if (head === null) throw new StoreError(`${file}: not a whole part`);
  const bytes = readFileSync(file);
  const payload = bytes.subarray(head.start);
  const got = createHash("sha256").update(payload).digest("hex");
  if (got !== head.header.payload.sha256)
    throw new StoreError(
      `${file}: its payload's SHA-256 differs from its header's`,
    );
  const at = ([o, n]: readonly [number, number]) => payload.subarray(o, o + n);
  const columns = (
    cols: readonly Column[],
    blobs: Record<string, [number, number]>,
  ) =>
    Object.fromEntries(
      cols.map(([name, type]) => [name, valuesOf(type, at(blobs[name]!))]),
    );
  return {
    header: head.header,
    users: addresses(at(head.header.users.blob), head.header.users.count),
    taker: new Map(
      head.header.taker.map((t) => [t.coin, columns(TAPE, t.blobs)]),
    ),
    liq: columns(LIQ, head.header.liq.blobs),
  };
}

const addresses = (u: Buffer, count: number): string[] =>
  Array.from(
    { length: count },
    (_, i) => `0x${u.toString("hex", 20 * i, 20 * i + 20)}`,
  );

/** A part's addresses alone, read from where its header says (the merge's dictionary reads no rows). */
export function readUsers(
  file: string,
  head: { header: PartHeader; start: number },
): string[] {
  const [o, n] = head.header.users.blob;
  const u = Buffer.alloc(n);
  const fd = openSync(file, "r");
  try {
    if (readSync(fd, u, 0, n, head.start + o) !== n)
      throw new StoreError(`${file}: its addresses are cut short`);
  } finally {
    closeSync(fd);
  }
  return addresses(u, head.header.users.count);
}
