/**
 * The two prints beside that read slice 0's held books (POLISH-EXPLORE's
 * plan 6.2; the polishing plan 1.5; the supervisor's ruling 2 to
 * POLISH-EXPLORE-3, 2026-11-18): the tape against the book by delay, and
 * the cost of $10,000 and $50,000 walks against $1,000 (the owner's idea 1).
 * Each leg's book is H8's, read through WAVE-H's own book code from the raw
 * store's book files the look fetched. They decide nothing.
 */
import { walkClose, walkOpen, type Book } from "../../market1/book.js";
import { NOTIONAL } from "../../market1/price.js";
import type { Item } from "../../market1/stats.js";
import { bookHours, lastAtOrBefore } from "../../waveh/books.js";
import type { Gate } from "../../waveh/gate.js";
import { bookKey } from "../../waveh/keys.js";
import { bookAt, type Found } from "../../waveh/price.js";
import { readLz4, type BookList } from "../../waveh/store.js";
import { checkKey } from "../seal.js";
import type { Line } from "./beside.js";
import type { Data } from "./data.js";
import { statOf } from "./stats.js";

/** H8's book at a leg, or why it has none: H8's reason, or "not held" when an hour file the leg reads is on no line of the book list. */
export type HeldBook = { book: Book } | { why: string };

/**
 * H8's book at a leg from the raw store's held book files, by WAVE-H's own
 * code: x's hour file and, in the first 10 s of the hour when that file has
 * no snapshot, the hour before's (`bookHours`, as WAVE-H's `bookFound`); the
 * last snapshot at or before x (`lastAtOrBefore`), live within 10 s and
 * usable (`bookAt`). Each file is sealed after DATA END (`checkKey`), read
 * through the gate and held to the list's SHA-256 (`readLz4`), after
 * `pace`; the last two files read are kept (an hour's and the hour before's),
 * so legs in the order of the coin and the instant read each file once.
 */
export function heldBooks(
  raw: string,
  gate: Gate,
  list: BookList,
  pace: () => Promise<void>,
): (coin: string, x: number) => Promise<HeldBook> {
  const kept: { key: string; bytes: Uint8Array }[] = [];
  const found = async (
    coin: string,
    hour: number,
    x: number,
  ): Promise<Found | "not held"> => {
    const key = bookKey(coin, hour);
    if (list.missing.has(key)) return "no file";
    if (!list.files.has(key)) return "not held";
    let file = kept.find((k) => k.key === key);
    if (file === undefined) {
      checkKey(key);
      await pace();
      file = { key, bytes: readLz4(gate, raw, list.files, key) };
      kept.unshift(file);
      kept.length = Math.min(kept.length, 2);
    }
    return lastAtOrBefore(file.bytes, coin, x).book;
  };
  return async (coin, x) => {
    const [hour, prior] = bookHours(x);
    const atHour = await found(coin, hour!, x);
    if (atHour === "not held") return { why: "not held" };
    const before =
      prior !== undefined && (atHour === null || atHour === "no file")
        ? await found(coin, prior, x)
        : null;
    if (before === "not held") return { why: "not held" };
    return bookAt(x, atHour, before);
  };
}

/** The tape against the book's entry legs, after t (THE PLAN 6.2); at 2 minutes, B0's x_in, the exit too. */
export const DELAYS = {
  "10 s": 10_000,
  "2 min": 120_000,
  "5 min": 300_000,
  "15 min": 900_000,
} as const;
/** The walks at each entry book: $1,000, B0's, and the larger sizes of idea 1. */
export const SIZES = [1_000, 10_000, 50_000] as const;

type Tally = { items: Item[]; short: number; not: Record<string, number> };
const tally = (): Tally => ({ items: [], short: 0, not: {} });
const count = (not: Record<string, number>, why: string) =>
  (not[why] = (not[why] ?? 0) + 1);

/**
 * The two prints on slice 0's B0 positions of E and of C (the E and C
 * steps' lines, whose books the look fetched), each leg's book through
 * `bookOf`, its tape through the store's:
 * - **the tape against the book by delay:** the entry leg at t + 10 s, 2, 5
 *   and 15 minutes, walked for $1,000 at the book and at the tape, and the
 *   exit at 2 minutes, both walked for the tape entry's Q; the tape's gain
 *   for the follower in bps of the book's price, dir × (book − tape) ÷ book
 *   × 10⁴ at an entry and dir × (tape − book) ÷ book × 10⁴ at the exit
 *   (above 0 the tape priced the leg better: the calibration's sense), with
 *   its two-way error; a walk depth short at either counted; the legs not
 *   compared by reason;
 * - **the walks:** each entry book at x_in walked for $1,000, $10,000 and
 *   $50,000: the cost against the book's mid, dir × (p ÷ mid − 1) × 10⁴,
 *   and the larger walks' extra over $1,000's, dir × (p ÷ p₁,₀₀₀ − 1) ×
 *   10⁴, each with its two-way error; the walks depth short counted.
 */
export async function bookPrints(
  d: Data,
  lines: { e: readonly Line[]; c: readonly Line[] },
  bookOf: (coin: string, x: number) => Promise<HeldBook>,
) {
  const legs: {
    part: "E" | "C";
    l: Line;
    delay: string;
    x: number;
    exit: boolean;
  }[] = [];
  for (const [part, ls] of [
    ["E", lines.e],
    ["C", lines.c],
  ] as const)
    for (const l of ls) {
      if (l.group !== "B0" || l.slice !== 0) continue;
      for (const [delay, ms] of Object.entries(DELAYS))
        legs.push({ part, l, delay, x: l.t + ms, exit: false });
      legs.push({ part, l, delay: "2 min exit", x: l.xOut, exit: true });
    }
  legs.sort((a, b) => a.l.iid - b.l.iid || a.x - b.x);
  const names = new Map(d.coins.list.map((c) => [c.assetId, c.name]));
  const delays = [...Object.keys(DELAYS), "2 min exit"];
  const byDelay = () =>
    Object.fromEntries(delays.map((k) => [k, tally()])) as Record<
      string,
      Tally
    >;
  const tape = { E: byDelay(), C: byDelay() };
  const sized = () => ({
    positions: 0,
    not: {} as Record<string, number>,
    cost: SIZES.map(tally),
    extra: SIZES.map(tally),
  });
  const walks = { E: sized(), C: sized() };
  for (const g of legs) {
    const { l } = g;
    const coin = names.get(l.iid)!;
    const buy = g.exit ? l.dir < 0 : l.dir > 0;
    const item = (x: number): Item => ({ t: l.t, iid: l.iid, x });
    const found = await bookOf(coin, g.x);
    const side =
      "book" in found ? (buy ? found.book.asks : found.book.bids) : [];
    if (g.delay === "2 min") {
      const w = walks[g.part];
      w.positions += 1;
      if ("why" in found) count(w.not, found.why);
      else {
        const mid = (found.book.bids[0]![0] + found.book.asks[0]![0]) / 2;
        const ws = SIZES.map((n) => walkOpen(side, n));
        ws.forEach((x, k) => {
          w.cost[k]!.items.push(item(l.dir * (x.price / mid - 1) * 1e4));
          w.extra[k]!.items.push(
            item(l.dir * (x.price / ws[0]!.price - 1) * 1e4),
          );
          if (x.short) w.cost[k]!.short += 1;
        });
      }
    }
    const c = tape[g.part][g.delay]!;
    if ("why" in found) {
      count(c.not, found.why);
      continue;
    }
    const levels = d.levels(coin, buy, g.x);
    if (levels.length === 0) {
      count(c.not, "no trade");
      continue;
    }
    if (!g.exit) {
      const b = walkOpen(side, NOTIONAL);
      const t = walkOpen(levels, NOTIONAL);
      c.items.push(item((l.dir * (b.price - t.price) * 1e4) / b.price));
      if (b.short || t.short) c.short += 1;
      continue;
    }
    const entry = d.levels(coin, l.dir > 0, l.xIn);
    if (entry.length === 0) {
      count(c.not, "no trade at the entry");
      continue;
    }
    const Q = walkOpen(entry, NOTIONAL).units;
    const b = walkClose(side, Q);
    const t = walkClose(levels, Q);
    c.items.push(item((l.dir * (t.price - b.price) * 1e4) / b.price));
    if (b.short || t.short) c.short += 1;
  }
  const lineOf = (c: Tally) => ({
    compared: statOf(d.kit, c.items),
    short: c.short,
    notCompared: c.not,
  });
  const walksOf = (w: ReturnType<typeof sized>) => ({
    positions: w.positions,
    notWalked: w.not,
    bySize: Object.fromEntries(
      SIZES.map((n, k) => [
        `$${n.toLocaleString("en-US")}`,
        {
          cost: statOf(d.kit, w.cost[k]!.items),
          extra: k === 0 ? null : statOf(d.kit, w.extra[k]!.items),
          short: w.cost[k]!.short,
        },
      ]),
    ),
  });
  return {
    print:
      "slice 0's held books, deciding nothing (THE PLAN 6.2): the tape's gain over the book a leg, by delay; the cost of $10,000 and $50,000 walks against $1,000",
    tapeAgainstBook: {
      E: Object.fromEntries(delays.map((k) => [k, lineOf(tape.E[k]!)])),
      C: Object.fromEntries(delays.map((k) => [k, lineOf(tape.C[k]!)])),
    },
    walks: { E: walksOf(walks.E), C: walksOf(walks.C) },
  };
}
