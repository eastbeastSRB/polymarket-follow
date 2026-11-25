/**
 * A part: one raw file's kept records, counts and bars (copyh/rules.md C3,
 * the store; the analyzer's part, polish/part.ts, as the pattern), written
 * whole by the worker that scanned it and read back by the merge. Its bytes:
 * `COPYHPT1`, the header's length (u32), the header (JSON), then the payload:
 * the file's addresses, each bucket group's columns side by side, then the
 * bars, each blob at an offset a multiple of 8. The payload is cut into
 * stretches that cover it whole — the addresses, each group, the bars — each
 * held to its own SHA-256, so that a merge unit reads only its group's
 * stretch of a part and still finds a flipped bit there. The header names
 * the input (its key and SHA-256), the code that wrote it (the
 * fingerprint), the lists it was read with, the scan's counts, the file's
 * dictionaries and every blob; a part that does not match is refused.
 */
import { createHash } from "node:crypto";
import { closeSync, openSync, readSync, statSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  WIDTH,
  bytesOf,
  valuesOf,
  type Column,
  type Values,
} from "../polish/tables.js";
import { StoreError } from "./run.js";
import type { Scan } from "./scan.js";
import {
  GROUPS,
  GROUP_BUCKETS,
  bucketOf,
  type CoinBars,
  type Writers,
} from "./writers.js";

const MAGIC = Buffer.from("COPYHPT1", "latin1");

/** A group's fill columns in a part (the store adds `file`). */
export const FILLS: readonly Column[] = [
  ["user", "u32"],
  ["time", "f64"],
  ["iid", "u16"],
  ["px", "f64"],
  ["sz", "f64"],
  ["side", "i8"],
  ["startPosition", "f64"],
  ["oid", "u64"],
  ["tid", "u64"],
  ["flags", "u8"],
  ["dir", "u8"],
  ["method", "u8"],
];
/** A coin's bar columns in a part. */
export const BARS: readonly Column[] = [
  ["trades", "u32"],
  ["sz", "f64"],
  ["ntl", "f64"],
  ["lastTime", "f64"],
  ["last", "f64"],
  ["pairGap", "f64"],
  ["pairs", "u32"],
  ["leftBackstop", "u32"],
  ["leftAdl", "u32"],
  ["leftSettlement", "u32"],
];

const Blob = z.tuple([z.number(), z.number()]);
const Blobs = z.record(z.string(), Blob);
const SHA = z.string().regex(/^[0-9a-f]{64}$/);
const Stretch = z.object({ span: Blob, sha256: SHA });
const Taker = z.tuple([z.number(), z.number(), z.number()]).nullable();

export const PartHeader = z.object({
  input: z.object({ index: z.number(), key: z.string(), sha256: SHA }),
  code: z.string(),
  lists: z.object({ coins: SHA, dirs: SHA }),
  compressed: z.number(),
  scan: z.object({
    decoded: z.number(),
    lines: z.number(),
    seen: z.number(),
    classes: z.object({
      kept: z.number(),
      spot: z.number(),
      builder: z.number(),
      outcome: z.number(),
      early: z.number(),
      late: z.number(),
      refused: z.number(),
      failed: z.number(),
      unknownDir: z.number(),
      unknownCoin: z.number(),
    }),
    slowLines: z.number(),
    slowRecords: z.number(),
    misread: z.number(),
    byHour: z.array(z.tuple([z.number(), z.number()])),
    dirs: z.array(z.tuple([z.string(), z.number()])),
    takers: z.array(z.tuple([z.string(), z.number()])),
    coins: z.array(
      z.tuple([z.number(), z.number(), z.number(), z.number(), z.number()]),
    ),
    unknownDirs: z.array(z.tuple([z.string(), z.number()])),
    unknownCoins: z.array(z.tuple([z.string(), z.number()])),
    vaults: z.array(z.string()),
    runs: z.array(z.tuple([z.number(), z.number()])),
    times: z
      .object({
        first: z.number(),
        max: z.number(),
        holes: z.array(z.tuple([z.number(), z.number()])),
      })
      .nullable(),
  }),
  users: Stretch.extend({ count: z.number(), blob: Blob }),
  dicts: z.object({ dirs: z.array(z.string()), methods: z.array(z.string()) }),
  groups: z.array(
    Stretch.extend({
      rows: z.number(),
      /** The group's rows by bucket, its sixteen in order. */
      buckets: z.array(z.number()),
      minTime: z.number().nullable(),
      maxTime: z.number().nullable(),
      blobs: Blobs,
    }),
  ),
  unpaired: z.array(
    z.object({
      iid: z.number(),
      time: z.number(),
      tid: z.string(),
      group: z.number(),
      row: z.number(),
      taker: z.boolean(),
      market: z.boolean(),
    }),
  ),
  odd: z.array(z.string()),
  bars: Stretch.extend({
    coins: z.array(
      z.object({
        iid: z.number(),
        start: z.number(),
        minutes: z.number(),
        first: Taker,
        lastTaker: Taker,
        /** Its first column's offset: the columns follow in BARS' order, each padded to 8 (`barsBlobs`). */
        at: z.number(),
      }),
    ),
  }),
  payload: z.object({ bytes: z.number() }),
});
export type PartHeader = z.infer<typeof PartHeader>;

export const partFile = (dir: string, index: number) =>
  path.join(dir, `${index}.part`);

const pad8 = (n: number) => (8 - (n % 8)) % 8;
const hash = (b: Buffer) => createHash("sha256").update(b).digest("hex");
const byKey = <K extends string | number, V>(m: Map<K, V>): [K, V][] =>
  [...m].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0));

/** The least and the greatest of a list, by a loop; nulls when empty. */
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

/** The part of one scanned file (its writers finished here). */
export function partOf(p: {
  input: { index: number; key: string; sha256: string };
  code: string;
  lists: { coins: string; dirs: string };
  compressed: number;
  scan: Scan;
  writers: Writers;
}): Buffer {
  const done = p.writers.finish();
  const chunks: Buffer[] = [];
  let at = 0;
  const blob = (bytes: Buffer): [number, number] => {
    const where: [number, number] = [at, bytes.length];
    chunks.push(bytes, Buffer.alloc(pad8(bytes.length)));
    at += bytes.length + pad8(bytes.length);
    return where;
  };
  /** The stretch [from, at) as written so far: its span and SHA-256. */
  const stretch = (from: number, first: number) => {
    const bytes = Buffer.concat(chunks.slice(first));
    return { span: [from, at - from] as [number, number], sha256: hash(bytes) };
  };
  const columns = (cols: readonly Column[], rows: Record<string, number[]>) =>
    Object.fromEntries(
      cols.map(([name, type]) => [name, blob(bytesOf(type, rows[name]!))]),
    );
  const users = blob(
    Buffer.concat(
      p.writers.users.list.map((a) => Buffer.from(a.slice(2), "hex")),
    ),
  );
  const usersStretch = stretch(0, 0);
  const bucketOfUser = p.writers.users.list.map(
    (u) => bucketOf(u) % GROUP_BUCKETS,
  );
  const groups = p.writers.groups.map((rows) => {
    const from = at;
    const first = chunks.length;
    const [minTime, maxTime] = range(rows.time);
    const blobs = columns(FILLS, rows);
    const buckets = new Array<number>(GROUP_BUCKETS).fill(0);
    for (const u of rows.user) {
      const b = bucketOfUser[u]!;
      buckets[b] = buckets[b]! + 1;
    }
    return {
      ...stretch(from, first),
      rows: rows.time.length,
      buckets,
      minTime,
      maxTime,
      blobs,
    };
  });
  const barsFrom = at;
  const barsFirst = chunks.length;
  const coins = done.bars.map((b: CoinBars) => ({
    iid: b.iid,
    start: b.start,
    minutes: b.trades.length,
    first: b.first,
    lastTaker: b.lastTaker,
    at: columns(BARS, b as unknown as Record<string, number[]>).trades![0],
  }));
  const bars = { ...stretch(barsFrom, barsFirst), coins };
  const payload = Buffer.concat(chunks);
  const s = p.scan;
  const header: PartHeader = {
    input: p.input,
    code: p.code,
    lists: p.lists,
    compressed: p.compressed,
    scan: {
      decoded: s.decoded,
      lines: s.lines,
      seen: s.seen,
      classes: s.classes,
      slowLines: s.slowLines,
      slowRecords: s.slowRecords,
      misread: s.misread,
      byHour: byKey(s.byHour),
      dirs: byKey(s.dirs),
      takers: byKey(s.takers),
      coins: byKey(s.coins).map(([iid, c]) => [iid, ...c]),
      unknownDirs: byKey(s.unknownDirs),
      unknownCoins: byKey(s.unknownCoins),
      vaults: [...s.vaults].sort(),
      runs: s.runs,
      times: s.times,
    },
    users: {
      ...usersStretch,
      count: p.writers.users.list.length,
      blob: users,
    },
    dicts: { dirs: p.writers.dirs.list, methods: p.writers.methods.list },
    groups,
    unpaired: done.unpaired,
    odd: done.odd,
    bars,
    payload: { bytes: payload.length },
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

export type Head = { header: PartHeader; start: number };

/** A part's header and where its payload starts; null when the file is missing or is not a whole part (a resumed pass redoes it). */
export function readPartHeader(file: string): Head | null {
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
    if (!h.success || h.data.groups.length !== GROUPS) return null;
    if (statSync(file).size !== 12 + n + h.data.payload.bytes) return null;
    return { header: h.data, start: 12 + n };
  } catch {
    return null;
  } finally {
    closeSync(fd);
  }
}

/** One stretch of a part's payload, read alone and held to its SHA-256 (a flipped bit there throws). */
export function readStretch(
  file: string,
  head: Head,
  s: { span: readonly [number, number]; sha256: string },
): { from: number; bytes: Buffer } {
  const [o, n] = s.span;
  const bytes = Buffer.alloc(n);
  const fd = openSync(file, "r");
  try {
    if (readSync(fd, bytes, 0, n, head.start + o) !== n)
      throw new StoreError(`${file}: a stretch is cut short`);
  } finally {
    closeSync(fd);
  }
  if (hash(bytes) !== s.sha256)
    throw new StoreError(
      `${file}: a stretch's SHA-256 differs from its header's`,
    );
  return { from: o, bytes };
}

/** A blob's typed values from the stretch that holds it (copied, so aligned). */
export const valuesIn = (
  st: { from: number; bytes: Buffer },
  [o, n]: readonly [number, number],
  type: Column[1],
): Values => valuesOf(type, st.bytes.subarray(o - st.from, o - st.from + n));

/** A coin's bar columns in a part: each at its offset, from the first, in BARS' order. */
export function barsBlobs(c: {
  at: number;
  minutes: number;
}): Record<string, [number, number]> {
  let at = c.at;
  const out: Record<string, [number, number]> = {};
  for (const [name, type] of BARS) {
    const n = c.minutes * WIDTH[type];
    out[name] = [at, n];
    at += n + pad8(n);
  }
  return out;
}

/** A part's addresses, lower-case, in its own order. */
export function usersOf(file: string, head: Head): string[] {
  const st = readStretch(file, head, head.header.users);
  const [o] = head.header.users.blob;
  return Array.from(
    { length: head.header.users.count },
    (_, i) =>
      `0x${st.bytes.toString("hex", o - st.from + 20 * i, o - st.from + 20 * i + 20)}`,
  );
}
