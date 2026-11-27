/**
 * The calibration's mark half (copyh/rules.md C13, C15 (c) 11; the
 * supervisor's rulings of 2026-11-27 10:25Z), the rehearsal's, on
 * engine.ts, every part twice: on outcome-free cells, every coin at every
 * whole minute of E's sample days (C18), the tape's minute mark (the VWAP of
 * the minute's market trades, Σ px·sz ÷ Σ sz, as the VWAP object marks it:
 * markets.ts) against `asset_ctxs`' `mark_px` and its impact prices of the
 * same minute (ctxs.ts), where both give a value. A part is one sample day:
 * its day file read from WAVE-H's raw store, through the seal by name and
 * real path, inside the run's roots, held to its line in WAVE-H's frozen
 * list (`waveh/data.sha256`, itself held to the part's inputs), decoded by
 * WAVE-H's LZ4 reader. Two prices of one moment only: a cell's three values
 * come from one minute's tape and one minute's row, never from two instants.
 * - A cell: (tape − mark) ÷ mark, (tape − the impact mid) ÷ the impact mid,
 *   and the impact prices' half-width ÷ their mid, each in bps.
 * - The prints (`marksSummary`): by coin and in all, each value's cells,
 *   median, quartiles and mean with its standard error.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { usable, walkOpen, type Book } from "../market1/book.js";
import type { Research } from "../paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../schedule.js";
import { bookHours, lastAtOrBefore } from "../waveh/books.js";
import { bookKey, ctxsKey } from "../waveh/keys.js";
import { decodeLz4 } from "../waveh/lz4.js";
import { readBookList } from "../waveh/store.js";
import { ctxsOf } from "./ctxs.js";
import type { PartFunction, PartSpec, PhaseRecord } from "./engine.js";
import { partBytes } from "./engine.js";
import { readBars } from "./markets.js";
import { ReadingContext, ReadingInputs, heldReading } from "./phase-labels.js";
import { readDataList } from "./range.js";
import { StoreError, sha256 } from "./run.js";
import { checkInside, checkPath } from "./seal.js";
import { spreadsOf } from "./setting.js";

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
export const MarksInputs = ReadingInputs.extend({
  code: z.string(),
  /** The sample day's first instant. */
  day: z.number(),
  /** END: no minute at or after it is read. */
  end: z.number(),
  /** The coins, by iid with their coins.json names. */
  coins: z.array(z.tuple([z.number(), z.string()])),
  /** WAVE-H's frozen list (`waveh/data.sha256`), by SHA-256. */
  list: SHA256,
});
export type MarksInputs = z.infer<typeof MarksInputs>;
/** Where a part reads: the reading, WAVE-H's raw store and its list. */
export const MarksContext = ReadingContext.extend({
  wavehStore: z.string(),
  wavehList: z.string(),
});
export type MarksContext = z.infer<typeof MarksContext>;

/** A coin's cells of a day: three values a cell, in bps. */
const Cells = z.object({
  mark: z.array(z.number()),
  impactMid: z.array(z.number()),
  impactHalf: z.array(z.number()),
});
export type Cells = z.infer<typeof Cells>;
export const MarksPart = z.object({
  day: z.number(),
  count: z.object({
    rows: z.number(),
    failed: z.number(),
    late: z.number(),
    twice: z.number(),
  }),
  byCoin: z.record(z.string(), Cells),
});
export type MarksPart = z.infer<typeof MarksPart>;

const bps = (a: number, b: number) => ((a - b) / b) * 1e4;

/** One coin's cells of a day: at each minute where the tape has a market trade and asset_ctxs a mark, the tape against that minute's row alone. */
export function cellsOf(
  tape: (k: number) => number,
  row: {
    readonly mark: Float64Array;
    readonly bid: Float64Array;
    readonly ask: Float64Array;
  },
): Cells {
  const out: Cells = { mark: [], impactMid: [], impactHalf: [] };
  for (let k = 0; k < row.mark.length; k++) {
    const p = tape(k);
    const mark = row.mark[k]!;
    if (Number.isNaN(p) || Number.isNaN(mark)) continue;
    out.mark.push(bps(p, mark));
    const bid = row.bid[k]!;
    const ask = row.ask[k]!;
    if (Number.isNaN(bid) || Number.isNaN(ask) || ask < bid) continue;
    const mid = (bid + ask) / 2;
    out.impactMid.push(bps(p, mid));
    out.impactHalf.push(((ask - bid) / 2 / mid) * 1e4);
  }
  return out;
}

/** The mark half's function (engine.ts `PartFunction`): a sample day. */
export const marksPart: PartFunction = (inputs, ctx) => {
  const i = MarksInputs.parse(inputs);
  const c = MarksContext.parse(ctx.context);
  const { stores } = heldReading(c, i, ctx.seal);
  const listBytes = readFileSync(c.wavehList);
  if (sha256(listBytes) !== i.list)
    throw new StoreError(`${c.wavehList} is not its part's`);
  const key = ctxsKey(i.day);
  const want = readDataList(listBytes.toString("utf8")).get(key);
  if (want === undefined)
    throw new StoreError(`${key}: not in ${path.basename(c.wavehList)}`);
  const file = path.join(c.wavehStore, ...key.split("/"));
  checkPath(file, ctx.seal);
  checkInside(file, c.roots);
  const bytes = readFileSync(file);
  if (sha256(bytes) !== want)
    throw new StoreError(`${key}: not its line in WAVE-H's list`);
  const until = Math.min(i.day + DAY_MS, i.end);
  const ctxs = ctxsOf(
    new TextDecoder().decode(decodeLz4(bytes)),
    new Set(i.coins.map(([, name]) => name)),
    i.day,
    until,
  );
  const byCoin: Record<string, Cells> = {};
  for (const [iid, name] of i.coins) {
    const row = ctxs.byCoin.get(name);
    if (row === undefined) continue;
    const bars = readBars(stores, iid, until, i.day);
    if (bars === null) continue;
    const at = (i.day - bars.start) / MINUTE_MS;
    const tape = (k: number) => {
      const j = at + k;
      if (j < 0 || j >= bars.n) return NaN;
      return bars.sz[j]! > 0 ? bars.ntl[j]! / bars.sz[j]! : NaN;
    };
    const cells = cellsOf(tape, row);
    if (cells.mark.length > 0) byCoin[name] = cells;
  }
  return new TextEncoder().encode(
    JSON.stringify({
      day: i.day,
      count: ctxs.count,
      byCoin,
    } satisfies MarksPart),
  );
};

/** The mark half's parts: one a sample day. */
export const marksParts = (
  o: Omit<MarksInputs, "day">,
  days: readonly number[],
): PartSpec[] =>
  days.map((day) => ({
    id: `d${new Date(day).toISOString().slice(0, 10).replaceAll("-", "")}`,
    inputs: { ...o, day } satisfies MarksInputs,
  }));

/** A closed mark half's parts, read back. */
export const marksOf = (dir: string, record: PhaseRecord): MarksPart[] =>
  record.parts.map(([id]) =>
    MarksPart.parse(JSON.parse(partBytes(dir, record, id).toString("utf8"))),
  );

/** Each value's cells, median, quartiles and mean with its standard error (the kit's quantile). */
function statOf(kit: Research, xs: readonly number[]) {
  const n = xs.length;
  if (n === 0) return { cells: 0 };
  const mean = xs.reduce((s, x) => s + x, 0) / n;
  const sd =
    n > 1
      ? Math.sqrt(xs.reduce((s, x) => s + (x - mean) ** 2, 0) / (n - 1))
      : null;
  return {
    cells: n,
    median: kit.exits.quantile(xs, 0.5),
    q1: kit.exits.quantile(xs, 0.25),
    q3: kit.exits.quantile(xs, 0.75),
    mean,
    se: sd === null ? null : sd / Math.sqrt(n),
  };
}

/** The mark half's prints (C13): by coin and in all, each value's statistics; the rows read, failed, late and given twice by day. */
export function marksSummary(kit: Research, parts: readonly MarksPart[]) {
  const coins = new Map<string, Cells>();
  for (const p of parts)
    for (const [coin, c] of Object.entries(p.byCoin)) {
      const all = coins.get(coin) ?? {
        mark: [],
        impactMid: [],
        impactHalf: [],
      };
      for (const k of ["mark", "impactMid", "impactHalf"] as const)
        for (const x of c[k]) all[k].push(x);
      coins.set(coin, all);
    }
  const stats = (c: Cells) => ({
    markBps: statOf(kit, c.mark),
    impactMidBps: statOf(kit, c.impactMid),
    impactHalfBps: statOf(kit, c.impactHalf),
  });
  const pooled: Cells = { mark: [], impactMid: [], impactHalf: [] };
  for (const c of coins.values())
    for (const k of ["mark", "impactMid", "impactHalf"] as const)
      for (const x of c[k]) pooled[k].push(x);
  return {
    days: parts.map((p) => ({
      day: new Date(p.day).toISOString().slice(0, 10),
      ...p.count,
    })),
    byCoin: Object.fromEntries(
      [...coins]
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([coin, c]) => [coin, stats(c)]),
    ),
    all: stats(pooled),
  };
}

/** The book half's walk: the notional taken from each side, USD (C13). */
export const WALK_USD = 1_000;

export const BooksInputs = ReadingInputs.extend({
  code: z.string(),
  /** The day's first instant. */
  day: z.number(),
  end: z.number(),
  /** The coins the store holds books of that day, by iid with their coins.json names. */
  coins: z.array(z.tuple([z.number(), z.string()])),
  /** WAVE-H's store's book list (`books.jsonl`), by SHA-256. */
  list: SHA256,
});
export type BooksInputs = z.infer<typeof BooksInputs>;
export const BooksContext = ReadingContext.extend({
  wavehStore: z.string(),
  booksList: z.string(),
});

/** A coin's cells of a day: at each hour start, the book's half-spread and its walk, each side's average distance from the mid, and C9's c of that day, in bps; with how many c's came from an earlier day or the fallback. */
const BookCells = z.object({
  half: z.array(z.number()),
  walk: z.array(z.number()),
  c: z.array(z.number()),
  fallback: z.number(),
});
type BookCells = z.infer<typeof BookCells>;
export const BooksPart = z.object({
  day: z.number(),
  byCoin: z.record(z.string(), BookCells),
});
export type BooksPart = z.infer<typeof BooksPart>;

/** A book's half-spread and its walk of `usd` from each side (MARKET-1's `walkOpen`), their mean distance from the mid, in bps; null when the book is not usable. */
export function bookCell(
  book: Book,
  usd: number,
): { half: number; walk: number } | null {
  if (!usable(book)) return null;
  const bid = book.bids[0]![0];
  const ask = book.asks[0]![0];
  const mid = (bid + ask) / 2;
  const buy = walkOpen(book.asks, usd).price;
  const sell = walkOpen(book.bids, usd).price;
  return {
    half: ((ask - bid) / 2 / mid) * 1e4,
    walk: ((buy - mid + (mid - sell)) / 2 / mid) * 1e4,
  };
}

/** The book half's function (engine.ts `PartFunction`): a day the store holds books for; at each hour start h, each coin's last snapshot at or before h in the hour files WAVE-H reads for h (`bookHours`), against c(coin, day of h). */
export const booksPart: PartFunction = (inputs, ctx) => {
  const i = BooksInputs.parse(inputs);
  const c = BooksContext.parse(ctx.context);
  const { stores } = heldReading(c, i, ctx.seal);
  checkPath(c.booksList, ctx.seal);
  checkInside(c.booksList, c.roots);
  const listBytes = readFileSync(c.booksList);
  if (sha256(listBytes) !== i.list)
    throw new StoreError(`${c.booksList} is not its part's`);
  const list = readBookList(listBytes.toString("utf8")).files;
  const decoded = new Map<string, Uint8Array | null>();
  const fileOf = (key: string): Uint8Array | null => {
    const known = decoded.get(key);
    if (known !== undefined) return known;
    const want = list.get(key);
    let bytes: Uint8Array | null = null;
    if (want !== undefined) {
      const file = path.join(c.wavehStore, ...key.split("/"));
      checkPath(file, ctx.seal);
      checkInside(file, c.roots);
      const raw = readFileSync(file);
      if (sha256(raw) !== want)
        throw new StoreError(`${key}: not its line in books.jsonl`);
      bytes = decodeLz4(raw);
    }
    decoded.set(key, bytes);
    return bytes;
  };
  const until = Math.min(i.day + DAY_MS, i.end);
  const byCoin: Record<string, BookCells> = {};
  for (const [iid, name] of i.coins) {
    const bars = readBars(stores, iid, until);
    if (bars === null) continue;
    const spread = spreadsOf(ctx.kit, bars);
    const cells: BookCells = { half: [], walk: [], c: [], fallback: 0 };
    for (let h = i.day; h < until; h += HOUR_MS) {
      let book: Book | null = null;
      for (const hour of bookHours(h)) {
        const bytes = fileOf(bookKey(name, hour));
        if (bytes === null) continue;
        const b = lastAtOrBefore(bytes, name, h).book;
        if (b !== null && (book === null || b.ts > book.ts)) book = b;
      }
      const cell = book === null ? null : bookCell(book, WALK_USD);
      if (cell === null) continue;
      const s = spread(h);
      cells.half.push(cell.half);
      cells.walk.push(cell.walk);
      cells.c.push(s.c * 1e4);
      if (s.fallback) cells.fallback += 1;
    }
    for (const k of [...decoded.keys()])
      if (k.endsWith(`/l2Book/${name}.lz4`)) decoded.delete(k);
    if (cells.half.length > 0) byCoin[name] = cells;
  }
  return new TextEncoder().encode(
    JSON.stringify({ day: i.day, byCoin } satisfies BooksPart),
  );
};

/** The book half's parts: one a day the store holds a book file of, before END, with the coins it holds books of that day. */
export function booksParts(
  o: Omit<BooksInputs, "day" | "coins">,
  keys: Iterable<string>,
  coins: ReadonlyMap<string, number>,
): PartSpec[] {
  const days = new Map<number, Set<string>>();
  for (const key of keys) {
    const m =
      /^market_data\/(\d{8})\/(?:0|[1-9]\d?)\/l2Book\/([^/]+)\.lz4$/.exec(key);
    if (m === null || !coins.has(m[2]!)) continue;
    const day = Date.parse(
      `${m[1]!.slice(0, 4)}-${m[1]!.slice(4, 6)}-${m[1]!.slice(6)}T00:00:00Z`,
    );
    if (day >= o.end) continue;
    const set = days.get(day) ?? new Set<string>();
    set.add(m[2]!);
    days.set(day, set);
  }
  return [...days]
    .sort(([a], [b]) => a - b)
    .map(([day, names]) => ({
      id: `d${new Date(day).toISOString().slice(0, 10).replaceAll("-", "")}`,
      inputs: {
        ...o,
        day,
        coins: [...names]
          .sort()
          .map((n): [number, string] => [coins.get(n)!, n]),
      } satisfies BooksInputs,
    }));
}

/** A closed book half's parts, read back. */
export const booksOf = (dir: string, record: PhaseRecord): BooksPart[] =>
  record.parts.map(([id]) =>
    BooksPart.parse(JSON.parse(partBytes(dir, record, id).toString("utf8"))),
  );

/** The book half's prints (C13): by coin and in all, the half-spread, the walk, c, and c less each, with the fallbacks. */
export function booksSummary(kit: Research, parts: readonly BooksPart[]) {
  const coins = new Map<string, BookCells>();
  for (const p of parts)
    for (const [coin, x] of Object.entries(p.byCoin)) {
      const all = coins.get(coin) ?? { half: [], walk: [], c: [], fallback: 0 };
      for (const k of ["half", "walk", "c"] as const)
        for (const v of x[k]) all[k].push(v);
      all.fallback += x.fallback;
      coins.set(coin, all);
    }
  const stats = (x: BookCells) => ({
    halfBps: statOf(kit, x.half),
    walkBps: statOf(kit, x.walk),
    cBps: statOf(kit, x.c),
    cLessHalfBps: statOf(
      kit,
      x.c.map((v, k) => v - x.half[k]!),
    ),
    cLessWalkBps: statOf(
      kit,
      x.c.map((v, k) => v - x.walk[k]!),
    ),
    fallback: x.fallback,
  });
  const pooled: BookCells = { half: [], walk: [], c: [], fallback: 0 };
  for (const x of coins.values()) {
    for (const k of ["half", "walk", "c"] as const)
      for (const v of x[k]) pooled[k].push(v);
    pooled.fallback += x.fallback;
  }
  return {
    days: parts.length,
    byCoin: Object.fromEntries(
      [...coins]
        .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
        .map(([coin, x]) => [coin, stats(x)]),
    ),
    all: stats(pooled),
  };
}
