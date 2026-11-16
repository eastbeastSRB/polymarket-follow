/**
 * The layer the rehearsal and the look share (rules.md H8, H9): the run's
 * context; the book files and the tapes a position's legs read, each through
 * the gate; a position priced, with what the prints count of its legs.
 */
import { z } from "zod";
import { walkClose, walkOpen, type Level } from "../market1/book.js";
import { NOTIONAL } from "../market1/price.js";
import type { Market, Research } from "../paper/research.js";
import { HOUR_MS } from "../schedule.js";
import { bookHours, lastAtOrBefore } from "./books.js";
import { coinName, type Coins } from "./coins.js";
import type { Rec } from "./fills.js";
import { boundOf, type Gate } from "./gate.js";
import { TEST_START } from "./instants.js";
import { bookKey, fillKeys } from "./keys.js";
import { newPass, passFile } from "./pass.js";
import type { Spot } from "./positions.js";
import {
  TAPE_MS,
  bookAt,
  levelsOf,
  pricePosition,
  snapshotAt,
  tapeAt,
  type Found,
  type Priced,
  type Quote,
  type Trade,
} from "./price.js";
import { readLz4, type BookList, type DataList } from "./store.js";

export type Ctx = {
  store: string;
  list: DataList;
  coins: Coins;
  kit: Research;
  /** Waits, before each file, out of the windows in which no heavy work runs. */
  pace: () => Promise<void>;
  log: (event: string, fields: object) => void;
};

export class BooksNeeded extends Error {}

/** The book files H8 reads for the legs of the spots. */
export function booksOf(spots: readonly Spot[], coins: Coins): string[] {
  const keys = new Set<string>();
  for (const s of spots)
    for (const x of [s.xIn, s.xOut])
      for (const h of bookHours(x))
        keys.add(bookKey(coinName(coins, s.iid), h));
  return [...keys].sort();
}

type LegAsk = { id: string; coin: string; buy: boolean; x: number };

/** Each position's two legs for `readTapes`, `<index>|0` the entry and `<index>|1` the exit. */
export const legsOf = (spots: readonly Spot[], coins: Coins): LegAsk[] =>
  spots.flatMap((s, i) =>
    [s.xIn, s.xOut].map((x, n) => ({
      id: `${i}|${n}`,
      coin: coinName(coins, s.iid),
      buy: n === 0 ? s.dir > 0 : s.dir < 0,
      x,
    })),
  );

/**
 * Each leg's tape (H8) from the fill files of x's hour and the next, each
 * file read once; while the gate is closed, a leg whose hours reach TEST's
 * start has none (null), for the rehearsal opens no sealed file.
 */
export async function readTapes(
  ctx: Ctx,
  gate: Gate,
  legs: readonly LegAsk[],
): Promise<Map<string, Trade[] | null>> {
  const out = new Map<string, Trade[] | null>();
  const byFile = new Map<string, LegAsk[]>();
  for (const leg of legs) {
    const h = Math.floor(leg.x / HOUR_MS) * HOUR_MS;
    if (!gate.open && h + HOUR_MS >= TEST_START) {
      out.set(leg.id, null);
      continue;
    }
    for (const key of fillKeys(h, h + 2 * HOUR_MS)) {
      const asks = byFile.get(key) ?? [];
      asks.push(leg);
      byFile.set(key, asks);
    }
  }
  const recs = new Map<string, Rec[]>();
  for (const key of [...byFile.keys()].sort()) {
    const asks = byFile.get(key)!;
    const coins = new Set(asks.map((a) => a.coin));
    await ctx.pace();
    passFile(
      newPass(),
      new Set(),
      gate,
      ctx.store,
      ctx.list,
      key,
      ctx.coins,
      boundOf(gate),
      (rec) => {
        if (!coins.has(rec.fill.coin)) return;
        for (const a of asks)
          if (
            rec.fill.coin === a.coin &&
            rec.fill.time >= a.x &&
            rec.fill.time < a.x + TAPE_MS
          ) {
            const list = recs.get(a.id) ?? [];
            list.push(rec);
            recs.set(a.id, list);
          }
      },
    );
  }
  for (const leg of legs)
    if (!out.has(leg.id))
      out.set(leg.id, tapeAt(recs.get(leg.id) ?? [], leg.coin, leg.buy, leg.x));
  return out;
}

/** The book files a run reads (H8): the store's book list, and each file read with its lines and the lines failing WAVE-H's schema. */
export type Shelf = {
  books: BookList;
  read: Map<string, { lines: number; failed: number }>;
};

export const shelfOf = (books: BookList): Shelf => ({ books, read: new Map() });

/** H8's count of the book files read: their lines, those failing, and the files holding one. */
export function bookLines(shelf: Shelf) {
  let lines = 0;
  let failed = 0;
  for (const c of shelf.read.values()) {
    lines += c.lines;
    failed += c.failed;
  }
  return {
    files: shelf.read.size,
    lines,
    failed,
    filesWithFailed: [...shelf.read]
      .filter(([, c]) => c.failed > 0)
      .map(([key]) => key)
      .sort(),
  };
}

/** H8's files at x for a coin, from the store's book list (a key the archive lacks is "no file"); the snapshot's age and its file. */
export function bookFound(
  ctx: Ctx,
  gate: Gate,
  shelf: Shelf,
  coin: string,
  x: number,
): { atHour: Found; before: Found; age: number | null; file: string | null } {
  const found = (hour: number): Found => {
    const key = bookKey(coin, hour);
    if (shelf.books.missing.has(key)) return "no file";
    if (!shelf.books.files.has(key)) throw new BooksNeeded(key);
    const { book, lines, failed } = lastAtOrBefore(
      readLz4(gate, ctx.store, shelf.books.files, key),
      coin,
      x,
    );
    shelf.read.set(key, { lines, failed });
    return book;
  };
  const [h, prior] = bookHours(x);
  const atHour = found(h!);
  const before =
    prior !== undefined && (atHour === null || atHour === "no file")
      ? found(prior)
      : null;
  const snap = snapshotAt(x, atHour, before);
  return {
    atHour,
    before,
    age: snap === null ? null : x - snap.book.ts,
    file: snap === null ? null : bookKey(coin, snap.prior ? prior! : h!),
  };
}

export const LegPrint = z.object({
  side: z.enum(["buy", "sell"]),
  source: z.enum(["book", "tape", "none", "sealed"]),
  why: z.string().nullable(),
  /** x less the snapshot's time, when one was found. */
  age: z.number().nullable(),
  /** The book file of the snapshot found (H9: so the Final review can reprice). */
  file: z.string().nullable(),
  trades: z.number(),
  /** The tape's `tid`s in H4's order, when the book did not price the leg. */
  tids: z.array(z.string()),
  /** R2: (the tape's walk − the book's) ÷ the book's × 10⁴, when both priced the leg. */
  tapeMinusBook: z.number().nullable(),
});
export type LegPrint = z.infer<typeof LegPrint>;

export type Outcome = { spot: Spot; priced: Priced | null; legs: LegPrint[] };

/**
 * One position priced (H8, H9) with what the prints count of its legs; `base`
 * its BASE cell (null in the rehearsal). With the gate closed, a leg needing
 * a sealed tape leaves the position for the look.
 */
export function priceSpot(
  ctx: Ctx,
  gate: Gate,
  shelf: Shelf,
  tapes: ReadonlyMap<string, Trade[] | null>,
  market: Market,
  s: Spot,
  id: string,
  base: number | null,
): Outcome {
  const coin = coinName(ctx.coins, s.iid);
  const legs: LegPrint[] = [];
  const quotes: (Quote | null)[] = [];
  let units: number | null = null;
  for (const [n, x] of [s.xIn, s.xOut].entries()) {
    const buy = n === 0 ? s.dir > 0 : s.dir < 0;
    const f = bookFound(ctx, gate, shelf, coin, x);
    const at = bookAt(x, f.atHour, f.before);
    const tape = tapes.get(`${id}|${n}`) ?? null;
    const walk = (levels: readonly Level[]) =>
      n === 0 ? walkOpen(levels, NOTIONAL) : walkClose(levels, units!);
    const print: LegPrint = {
      side: buy ? "buy" : "sell",
      source: "book",
      why: null,
      age: f.age,
      file: f.file,
      trades: tape?.length ?? 0,
      tids: [],
      tapeMinusBook: null,
    };
    let levels: readonly Level[] = [];
    if ("book" in at) {
      levels = buy ? at.book.asks : at.book.bids;
      quotes.push({ source: "book", book: at.book });
      const taped = levelsOf(tape ?? []);
      if (taped.length > 0 && (n === 0 || units !== null)) {
        const b = walk(levels).price;
        print.tapeMinusBook = ((walk(taped).price - b) / b) * 1e4;
      }
    } else if (tape === null) {
      print.source = "sealed";
      print.why = at.why;
      quotes.push(null);
    } else {
      levels = levelsOf(tape);
      print.source = levels.length > 0 ? "tape" : "none";
      print.why = at.why;
      print.tids = tape.map((t) => t.tid);
      quotes.push({ source: "tape", why: at.why, trades: tape });
    }
    if (n === 0 && levels.length > 0) units = walkOpen(levels, NOTIONAL).units;
    legs.push(print);
  }
  if (legs.some((l) => l.source === "sealed"))
    return { spot: s, priced: null, legs };
  return {
    spot: s,
    priced: pricePosition(ctx.kit, market, {
      dir: s.dir,
      xIn: s.xIn,
      xOut: s.xOut,
      entry: quotes[0] ?? null,
      exit: quotes[1] ?? null,
      base,
    }),
    legs,
  };
}

/** How many of `xs` have each key (a null key is not counted). */
export const tally = <T>(xs: readonly T[], key: (x: T) => string | null) => {
  const out: Record<string, number> = {};
  for (const x of xs) {
    const k = key(x);
    if (k !== null) out[k] = (out[k] ?? 0) + 1;
  }
  return out;
};
