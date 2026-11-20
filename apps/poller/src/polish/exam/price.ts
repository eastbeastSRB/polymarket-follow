/**
 * The exam's price (polish/rules.md P6, P7; THE PLAN D19–D27): each leg at
 * the archived book first — H8's snapshot through WAVE-H's own code
 * (`bookHours`, `lastAtOrBefore`, `snapshotAt`, `bookAt`), from a raw
 * store's book files held to its book list and read under the exam's seal —
 * walked over its 20 levels; else at the store's tape (the takers on our
 * side in [x, x + 60 s), no backstop's, in H8's order), with H8's reason;
 * else unpriced. Then WAVE-H's `pricePosition` with the minute price in the
 * kit's place (no kit market object, whose `marketFrom` refuses a panel past
 * 2026-11-07): funding through the exploration's settlements, the gross on
 * marks through `priceAfter`. Each position keeps WAVE-H's `Priced` and its
 * legs' `LegPrint`s, so the reproduction holds it to the look line by line.
 */
import { walkClose, walkOpen, type Level } from "../../market1/book.js";
import { blockOf } from "../../market1/lines.js";
import { NOTIONAL } from "../../market1/price.js";
import { MINUTE_MS } from "../../schedule.js";
import { bookHours, lastAtOrBefore } from "../../waveh/books.js";
import type { Gate } from "../../waveh/gate.js";
import { bookKey } from "../../waveh/keys.js";
import { BooksNeeded, type LegPrint } from "../../waveh/legs.js";
import {
  FEE,
  bookAt,
  levelsOf,
  snapshotAt,
  type Found,
  type Priced,
  type Quote,
  type Trade,
} from "../../waveh/price.js";
import { readLz4, type BookList } from "../../waveh/store.js";
import { checkKey, type Seal } from "../seal.js";
import type { Data } from "../tries/data.js";
import { priceAfter } from "../tries/prices.js";
import { fundingBetween, settlementsOf } from "../tries/sweep.js";
import { SEGMENTS } from "./design.js";

/** H8's files at a leg (WAVE-H's `bookFound`): x's hour's and, in its first 10 s when that has none, the hour before's; the snapshot's age and its file. */
export type BookFound = {
  atHour: Found;
  before: Found;
  age: number | null;
  file: string | null;
};

/**
 * A raw store's book files at a leg (D19): a key the list names missing is
 * "no file"; a key on no line stops (`BooksNeeded`, exit 5) before anything
 * is read; a file is read under the seal (`checkKey`), after `pace`, held
 * to its line (`readLz4`); the last two files read are kept, so legs in the
 * coin's and the instant's order read each file once. `read` counts each
 * file's lines and the lines failing WAVE-H's schema (H14).
 */
export function bookReader(
  raw: string,
  gate: Gate,
  list: BookList,
  seal: Seal,
  pace: () => Promise<void>,
) {
  const read = new Map<string, { lines: number; failed: number }>();
  const kept: { key: string; bytes: Uint8Array }[] = [];
  const found = async (coin: string, hour: number, x: number) => {
    const key = bookKey(coin, hour);
    if (list.missing.has(key)) return "no file" as const;
    if (!list.files.has(key)) throw new BooksNeeded(key);
    let file = kept.find((k) => k.key === key);
    if (file === undefined) {
      checkKey(key, seal);
      await pace();
      file = { key, bytes: readLz4(gate, raw, list.files, key) };
      kept.unshift(file);
      kept.length = Math.min(kept.length, 2);
    }
    const { book, lines, failed } = lastAtOrBefore(file.bytes, coin, x);
    read.set(key, { lines, failed });
    return book;
  };
  const find = async (coin: string, x: number): Promise<BookFound> => {
    const [h, prior] = bookHours(x);
    const atHour = await found(coin, h!, x);
    const before =
      prior !== undefined && (atHour === null || atHour === "no file")
        ? await found(coin, prior, x)
        : null;
    const snap = snapshotAt(x, atHour, before);
    return {
      atHour,
      before,
      age: snap === null ? null : x - snap.book.ts,
      file: snap === null ? null : bookKey(coin, snap.prior ? prior! : h!),
    };
  };
  return { find, read };
}

/** A position's price: WAVE-H's `Priced` and its legs' prints (`priceSpot`'s). */
export type Price = { priced: Priced; legs: LegPrint[] };

/** A position the exam prices: its coin, direction, legs' instants and its BASE cell (null when none). */
export type ExamSpot = {
  iid: number;
  dir: 1 | -1;
  xIn: number;
  xOut: number;
  base: number | null;
};

type Leg = Priced["legs"][0];
/** WAVE-H's `legOf` (price.ts, not exported): a priced leg's source, walk and instants. */
function legOf(
  q: Quote,
  w: { price: number; deepest: number; short: boolean },
): Leg {
  return {
    source: q.source,
    why: q.source === "tape" ? q.why : null,
    price: w.price,
    deepest: w.deepest,
    short: w.short,
    at:
      q.source === "book"
        ? [q.book.ts]
        : [q.trades[0]!.t, q.trades[q.trades.length - 1]!.t],
  };
}

/**
 * WAVE-H's `pricePosition` (H9) with the minute price in the kit's place
 * (D23, D26): the gross on marks dir × (the minute price at the end of
 * x_out's minute ÷ x_in's − 1) × 10⁴; funding by the settlements in
 * (x_in, x_out] at the minute price before each hour, a settlement without
 * one leaving the position "funding without a price"; every other line as
 * WAVE-H's, in its order.
 */
export function pricedOf(
  d: Data,
  coin: string,
  s: ExamSpot,
  entry: Quote | null,
  exit: Quote | null,
): Priced {
  const pc = d.pc.get(coin)!;
  const a = priceAfter(pc, d.start, s.xIn);
  const b = priceAfter(pc, d.start, s.xOut);
  const gom =
    Number.isNaN(a) || Number.isNaN(b) ? null : s.dir * ((b / a - 1) * 1e4);
  const out: Priced = {
    net: null,
    unpriced: null,
    gross: null,
    fees: null,
    funding: null,
    fundingMissing: 0,
    grossOnMarks: gom,
    excess: gom === null || s.base === null ? null : gom - s.dir * s.base,
    entryCost: null,
    legs: [null, null],
    depthShort: false,
  };
  const entryLevels =
    entry === null
      ? []
      : entry.source === "book"
        ? s.dir > 0
          ? entry.book.asks
          : entry.book.bids
        : levelsOf(entry.trades);
  if (entry === null || entryLevels.length === 0) {
    out.unpriced = "no book and no trade at the entry";
    return out;
  }
  const open = walkOpen(entryLevels, NOTIONAL);
  out.legs[0] = legOf(entry, open);
  if (entry.source === "book") {
    const bk = entry.book;
    const mid = (bk.bids[0]![0] + bk.asks[0]![0]) / 2;
    out.entryCost = s.dir * ((open.price / mid - 1) * 1e4);
  }
  const exitLevels =
    exit === null
      ? []
      : exit.source === "book"
        ? s.dir > 0
          ? exit.book.bids
          : exit.book.asks
        : levelsOf(exit.trades);
  if (exit === null || exitLevels.length === 0) {
    out.unpriced = "no book and no trade at the exit";
    return out;
  }
  const Q = open.units;
  const close = walkClose(exitLevels, Q);
  out.legs[1] = legOf(exit, close);
  out.depthShort = open.short || close.short;
  const f = fundingBetween(settlementsOf(d, coin), s.xIn, s.xOut);
  out.fundingMissing = f.missing;
  if (Number.isNaN(f.sum)) {
    out.unpriced = "funding without a price";
    return out;
  }
  const k = (1 / NOTIONAL) * 1e4;
  out.gross = s.dir * (close.price - open.price) * Q * k;
  out.fees = (FEE * NOTIONAL + FEE * close.price * Q) * k;
  out.funding = -s.dir * f.sum * Q * k;
  out.net = out.gross - out.fees + out.funding;
  return out;
}

/**
 * Every spot priced book first (D19–D24), as WAVE-H's `priceSpot` prints
 * its legs: the entries in the coin's and the instant's order, then the
 * exits (each walking the entry's Q), so the book files and the tape's
 * coin-months are each read once; the outcomes in the spots' order.
 */
export async function priceAtTheBook(
  d: Data,
  book: (coin: string, x: number) => Promise<BookFound>,
  tapeAt: (coin: string, buy: boolean, x: number) => Trade[],
  spots: readonly ExamSpot[],
): Promise<Price[]> {
  const names = new Map(d.coins.list.map((c) => [c.assetId, c.name]));
  const quotes = spots.map((): (Quote | null)[] => [null, null]);
  const prints = spots.map((): LegPrint[] => []);
  const units = spots.map((): number | null => null);
  for (const n of [0, 1] as const) {
    const x = (i: number) => (n === 0 ? spots[i]!.xIn : spots[i]!.xOut);
    const coin = (i: number) => names.get(spots[i]!.iid)!;
    const order = spots
      .map((_, i) => i)
      .sort((p, q) =>
        coin(p) < coin(q) ? -1 : coin(p) > coin(q) ? 1 : x(p) - x(q) || p - q,
      );
    for (const i of order) {
      const s = spots[i]!;
      const buy = n === 0 ? s.dir > 0 : s.dir < 0;
      const f = await book(coin(i), x(i));
      const at = bookAt(x(i), f.atHour, f.before);
      const tape = tapeAt(coin(i), buy, x(i));
      const walk = (levels: readonly Level[]) =>
        n === 0 ? walkOpen(levels, NOTIONAL) : walkClose(levels, units[i]!);
      const print: LegPrint = {
        side: buy ? "buy" : "sell",
        source: "book",
        why: null,
        age: f.age,
        file: f.file,
        trades: tape.length,
        tids: [],
        tapeMinusBook: null,
      };
      let levels: readonly Level[];
      if ("book" in at) {
        levels = buy ? at.book.asks : at.book.bids;
        quotes[i]![n] = { source: "book", book: at.book };
        const taped = levelsOf(tape);
        if (taped.length > 0 && (n === 0 || units[i] !== null)) {
          const b = walk(levels).price;
          print.tapeMinusBook = ((walk(taped).price - b) / b) * 1e4;
        }
      } else {
        levels = levelsOf(tape);
        print.source = levels.length > 0 ? "tape" : "none";
        print.why = at.why;
        print.tids = tape.map((t) => t.tid);
        quotes[i]![n] = { source: "tape", why: at.why, trades: tape };
      }
      if (n === 0 && levels.length > 0)
        units[i] = walkOpen(levels, NOTIONAL).units;
      prints[i]!.push(print);
    }
  }
  return spots.map((s, i) => ({
    priced: pricedOf(
      d,
      names.get(s.iid)!,
      s,
      quotes[i]![0] ?? null,
      quotes[i]![1] ?? null,
    ),
    legs: prints[i]!,
  }));
}

/**
 * BASE on the deciding days (D27; H10 with F11): for each 4-hour UTC block,
 * the mean of (pc[j + h] ÷ pc[j] − 1) × 10⁴ over the whole minutes j of each
 * range's [from, to − h) whose minute lies in the block, both prices
 * present, the ranges pooled; NaN for a block with none. On one range it is
 * the exploration's `baseOf`.
 */
export function baseOver(
  pc: Float64Array,
  start: number,
  ranges: readonly { from: number; to: number }[],
  h: number,
): number[] {
  const sum = [0, 0, 0, 0, 0, 0];
  const count = [0, 0, 0, 0, 0, 0];
  for (const { from, to } of ranges) {
    const i0 = Math.max(0, Math.ceil((from - start) / MINUTE_MS));
    const i1 = Math.min(pc.length, (to - h * MINUTE_MS - start) / MINUTE_MS);
    for (let i = i0; i < i1 && i + h < pc.length; i++) {
      const a = pc[i]!;
      const b = pc[i + h]!;
      if (Number.isNaN(a) || Number.isNaN(b)) continue;
      const block = blockOf(start + i * MINUTE_MS);
      sum[block]! += (b / a - 1) * 1e4;
      count[block]! += 1;
    }
  }
  return sum.map((s, k) => (count[k]! > 0 ? s / count[k]! : NaN));
}

/** The exam's BASE for a coin (D27; rules.md P7): its 24-hour moves over the deciding segments' whole minutes, pooled. */
export const examBase = (pc: Float64Array, start: number): number[] =>
  baseOver(pc, start, SEGMENTS, 1_440);

/** A position's BASE cell: its coin's BASE in the 4-hour block of x_in, null when none (H10). */
export const baseCell = (
  base: readonly number[],
  xIn: number,
): number | null => {
  const v = base[blockOf(xIn)]!;
  return Number.isNaN(v) ? null : v;
};
