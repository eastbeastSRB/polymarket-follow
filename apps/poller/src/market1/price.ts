/**
 * A position's price (rules.md M6–M9): $1,000 against the forced side, in at
 * x_in and out at x_out, each leg at the recorded book as a taker when it is
 * live and usable, else at the kit's mark with the kit's taker spread; the
 * base-tier taker fee on both legs; funding by the kit's `fundingBetween`.
 * Results are bps of the $1,000. With both legs at the mark the net is the
 * kit's `leg`.
 */
import type { Market, Research } from "../paper/research.js";
import { walkClose, walkOpen, type Book } from "./book.js";

export const NOTIONAL = 1_000;
/** x_in = t + 120,000 ms; x_out = x_in + 86,400,000 ms (M6). */
export const ENTRY_DELAY_MS = 120_000;
export const HOLD_MS = 86_400_000;

/** How a leg is quoted: the book line found live and usable, or the mark with the reason. */
export type LegQuote =
  { source: "book"; book: Book } | { source: "mark"; why: string };

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
  /** The gross on marks − dir × BASE (F1). */
  excess: number | null;
  /** dir × (p_in ÷ the book's mid − 1) × 10⁴, for an entry at the book. */
  entryCost: number | null;
  pIn: number | null;
  pOut: number | null;
  /** The reasons of the legs priced at the mark: [entry, exit]. */
  markLegs: (string | null)[];
  depthShort: boolean;
  deepest: (number | null)[];
};

/** Priced at the book on both legs, with no depth-short leg (M11's WITHHELD counts the others, F6). */
export const atBook = (p: Priced): boolean =>
  p.net !== null && p.markLegs.every((m) => m === null) && !p.depthShort;

export function grossOnMarks(
  kit: Research,
  mk: Market,
  dir: number,
  xIn: number,
  xOut: number,
): number | null {
  const a = kit.panel.markAtMinuteEnd(mk, xIn);
  const b = kit.panel.markAtMinuteEnd(mk, xOut);
  return a === null || b === null ? null : dir * ((b / a - 1) * 1e4);
}

export function pricePosition(
  kit: Research,
  mk: Market,
  p: {
    dir: number;
    xIn: number;
    xOut: number;
    entry: LegQuote;
    exit: LegQuote;
    /** The base-tier taker rate at an instant (M9). */
    fee: (t: number) => number;
    /** BASE of the market and x_in's block (M12), or null. */
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
    pIn: null,
    pOut: null,
    markLegs: [null, null],
    depthShort: false,
    deepest: [null, null],
  };
  const spread = (t: number) => kit.costs.SETTINGS.taker.spread(mk.iid, t).c;
  // The entry: buy the asks for a long, sell into the bids for a short.
  let pIn: number;
  let Q: number;
  if (p.entry.source === "book") {
    const b = p.entry.book;
    const w = walkOpen(p.dir > 0 ? b.asks : b.bids, NOTIONAL);
    pIn = w.price;
    Q = w.units;
    out.depthShort ||= w.short;
    out.deepest[0] = w.deepest;
    const mid = (b.bids[0]![0] + b.asks[0]![0]) / 2;
    out.entryCost = p.dir * ((pIn / mid - 1) * 1e4);
  } else {
    const m = kit.panel.markAtMinuteEnd(mk, p.xIn);
    out.markLegs[0] = p.entry.why;
    if (m === null) {
      out.unpriced = "no book and no mark at the entry";
      return out;
    }
    pIn = m * (1 + p.dir * spread(p.xIn));
    Q = NOTIONAL / pIn;
  }
  let pOut: number;
  if (p.exit.source === "book") {
    const b = p.exit.book;
    const w = walkClose(p.dir > 0 ? b.bids : b.asks, Q);
    pOut = w.price;
    out.depthShort ||= w.short;
    out.deepest[1] = w.deepest;
  } else {
    const m = kit.panel.markAtMinuteEnd(mk, p.xOut);
    out.markLegs[1] = p.exit.why;
    if (m === null) {
      out.unpriced = "no book and no mark at the exit";
      return out;
    }
    pOut = m * (1 - p.dir * spread(p.xOut));
  }
  const f = kit.panel.fundingBetween(mk, p.xIn, p.xOut);
  out.fundingMissing = f.missing;
  if (Number.isNaN(f.sum)) {
    out.unpriced = "funding without a mark";
    return out;
  }
  const k = (1 / NOTIONAL) * 1e4;
  out.pIn = pIn;
  out.pOut = pOut;
  out.gross = p.dir * (pOut - pIn) * Q * k;
  out.fees = (p.fee(p.xIn) * NOTIONAL + p.fee(p.xOut) * pOut * Q) * k;
  out.funding = -p.dir * f.sum * Q * k;
  out.net = out.gross - out.fees + out.funding;
  return out;
}
