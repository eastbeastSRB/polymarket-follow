/**
 * A position's price (rules.md H7–H9): $1,000 against the forced side, in at
 * x_in and out at x_out, each leg a taker's at the archived book when it is
 * live and usable, else at the tape — the next minute's real takers on our
 * side, a time-ordered sweep, no backstop's record — else unpriced; 4.5 bps a
 * leg; funding by the kit's `fundingBetween`; the net by M9's formulas. The
 * walks are MARKET-1's.
 */
import { usable, walkClose, walkOpen, type Book } from "../market1/book.js";
import { byM4 } from "../market1/fills.js";
import { NOTIONAL, grossOnMarks } from "../market1/price.js";
import { HOUR_MS } from "../schedule.js";
import type { Market, Research } from "../paper/research.js";
import { LIVE_MS } from "./books.js";
import type { Rec } from "./fills.js";

/** Hyperliquid's base-tier taker rate, a leg's notional times it (H9). */
export const FEE = 0.00045;
/** The tape's window after a leg's instant (H8). */
export const TAPE_MS = 60_000;

export type TapeWhy = "no book file" | "no snapshot" | "stale" | "not usable";

/** A book file's snapshot at or before x, none in the file, or no such file in the archive. */
export type Found = Book | null | "no file";

/**
 * H8's book at x: x's hour file's last snapshot at or before x; when it holds
 * none and x lies within 10 s after its hour's start, the hour before's. Live
 * within 10 s, and usable; else why the tape stands in.
 */
export function bookAt(
  x: number,
  atHour: Found,
  before: Found,
): { book: Book } | { why: TapeWhy } {
  const hour = Math.floor(x / HOUR_MS) * HOUR_MS;
  const snap =
    atHour !== null && atHour !== "no file"
      ? atHour
      : x - hour < LIVE_MS && before !== null && before !== "no file"
        ? before
        : null;
  if (snap === null)
    return { why: atHour === "no file" ? "no book file" : "no snapshot" };
  if (snap.ts < x - LIVE_MS)
    return { why: atHour === "no file" ? "no book file" : "stale" };
  if (!usable(snap))
    return { why: atHour === "no file" ? "no book file" : "not usable" };
  return { book: snap };
}

/** A taker's record on the tape: its instant, price, size and identity. */
export type Trade = {
  t: number;
  px: number;
  sz: number;
  user: string;
  tid: string;
};

/**
 * The tape at x (H8): the coin's `crossed` records on our side ("B" when we
 * buy) with `time` in [x, x + 60 s), no record of a backstop, each fill once,
 * in H4's order.
 */
export function tapeAt(
  recs: readonly Rec[],
  coin: string,
  buy: boolean,
  x: number,
): Trade[] {
  const seen = new Set<string>();
  const out: (Trade & { iid: number; addr: string; side: 1 | -1 })[] = [];
  for (const { user, fill } of recs) {
    if (
      fill.coin !== coin ||
      !fill.crossed ||
      fill.side !== (buy ? "B" : "A") ||
      fill.time < x ||
      fill.time >= x + TAPE_MS ||
      fill.liquidation?.method === "backstop" ||
      seen.has(`${user}|${fill.tid}`)
    )
      continue;
    seen.add(`${user}|${fill.tid}`);
    out.push({
      t: fill.time,
      px: Number(fill.px),
      sz: Number(fill.sz),
      user,
      tid: fill.tid,
      iid: 0,
      addr: user,
      side: buy ? 1 : -1,
    });
  }
  return out
    .sort(byM4)
    .map(({ t, px, sz, user, tid }) => ({ t, px, sz, user, tid }));
}

/** A leg's source: the book, or the tape with the reason; null when neither priced it. */
export type Quote =
  | { source: "book"; book: Book }
  | { source: "tape"; why: TapeWhy; trades: readonly Trade[] };

export type Leg = {
  source: "book" | "tape";
  why: TapeWhy | null;
  price: number;
  deepest: number;
  short: boolean;
  /** The snapshot's time, or the tape's first and last instants. */
  at: number[];
};

export type Priced = {
  /** Null when unpriced. */
  net: number | null;
  unpriced: string | null;
  gross: number | null;
  fees: number | null;
  funding: number | null;
  fundingMissing: number;
  /** dir × (the mark at x_out ÷ the mark at x_in − 1) × 10⁴. */
  grossOnMarks: number | null;
  /** The gross on marks − dir × BASE. */
  excess: number | null;
  /** dir × (p_in ÷ the book's mid − 1) × 10⁴, for an entry at the book. */
  entryCost: number | null;
  legs: [Leg | null, Leg | null];
  depthShort: boolean;
};

export const levelsOf = (trades: readonly Trade[]) =>
  trades.filter((t) => t.px > 0 && t.sz > 0).map((t) => [t.px, t.sz] as const);

export function pricePosition(
  kit: Research,
  mk: Market,
  p: {
    dir: 1 | -1;
    xIn: number;
    xOut: number;
    entry: Quote | null;
    exit: Quote | null;
    base: number | null;
  },
): Priced {
  const gom = grossOnMarks(kit, mk, p.dir, p.xIn, p.xOut);
  const out: Priced = {
    net: null,
    unpriced: null,
    gross: null,
    fees: null,
    funding: null,
    fundingMissing: 0,
    grossOnMarks: gom,
    excess: gom === null || p.base === null ? null : gom - p.dir * p.base,
    entryCost: null,
    legs: [null, null],
    depthShort: false,
  };
  // The entry buys for a long and sells for a short; the exit the other way.
  const entryLevels =
    p.entry === null
      ? []
      : p.entry.source === "book"
        ? p.dir > 0
          ? p.entry.book.asks
          : p.entry.book.bids
        : levelsOf(p.entry.trades);
  if (p.entry === null || entryLevels.length === 0) {
    out.unpriced = "no book and no trade at the entry";
    return out;
  }
  const open = walkOpen(entryLevels, NOTIONAL);
  out.legs[0] = legOf(p.entry, open);
  if (p.entry.source === "book") {
    const b = p.entry.book;
    const mid = (b.bids[0]![0] + b.asks[0]![0]) / 2;
    out.entryCost = p.dir * ((open.price / mid - 1) * 1e4);
  }
  const exitLevels =
    p.exit === null
      ? []
      : p.exit.source === "book"
        ? p.dir > 0
          ? p.exit.book.bids
          : p.exit.book.asks
        : levelsOf(p.exit.trades);
  if (p.exit === null || exitLevels.length === 0) {
    out.unpriced = "no book and no trade at the exit";
    return out;
  }
  const Q = open.units;
  const close = walkClose(exitLevels, Q);
  out.legs[1] = legOf(p.exit, close);
  out.depthShort = open.short || close.short;
  const f = kit.panel.fundingBetween(mk, p.xIn, p.xOut);
  out.fundingMissing = f.missing;
  if (Number.isNaN(f.sum)) {
    out.unpriced = "funding without a mark";
    return out;
  }
  const k = (1 / NOTIONAL) * 1e4;
  out.gross = p.dir * (close.price - open.price) * Q * k;
  out.fees = (FEE * NOTIONAL + FEE * close.price * Q) * k;
  out.funding = -p.dir * f.sum * Q * k;
  out.net = out.gross - out.fees + out.funding;
  return out;
}

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
