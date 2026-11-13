/**
 * The book side of a leg (rules.md M7), as pure functions: a recorded book's
 * usable levels, the taker's walk for $1,000 in and for Q units out, the gaps
 * of the collector's record from its coverage events, and whether the book at
 * an instant is live.
 */
import { HOUR_MS } from "../schedule.js";

/** A level, [price, size] in the instrument's base units. */
export type Level = readonly [number, number];
/** A book line's usable levels: price and size above 0, asks ascending, bids descending. */
export type Book = { ts: number; bids: Level[]; asks: Level[] };

const LIVE_MS = 3_660_000;
/** Every gap is widened by this on both sides (M7). */
export const GAP_MARGIN_MS = 60_000;

export function toBook(
  ts: number,
  b: readonly (readonly unknown[])[],
  a: readonly (readonly unknown[])[],
): Book {
  const levels = (side: readonly (readonly unknown[])[]) =>
    side
      .map((l) => [Number(l[0]), Number(l[1])] as const)
      .filter(([p, s]) => p > 0 && s > 0);
  return {
    ts,
    bids: levels(b).sort((x, y) => y[0] - x[0]),
    asks: levels(a).sort((x, y) => x[0] - y[0]),
  };
}

/** Both sides hold a level and the best bid is below the best ask. */
export const usable = (book: Book): boolean =>
  book.bids.length > 0 &&
  book.asks.length > 0 &&
  book.bids[0]![0] < book.asks[0]![0];

export type Walk = {
  /** p_in for an opening walk, p_out for a closing one. */
  price: number;
  /** Units: Q of an opening walk. */
  units: number;
  /** The deepest level walked, 1 for the best. */
  deepest: number;
  short: boolean;
};

/** Opening (M7): `notional` taken from the side, best level first; p_in = notional ÷ Q. */
export function walkOpen(levels: readonly Level[], notional: number): Walk {
  let left = notional;
  let units = 0;
  let deepest = 0;
  for (const [price, size] of levels) {
    deepest += 1;
    if (size * price >= left) {
      units += left / price;
      left = 0;
      break;
    }
    units += size;
    left -= size * price;
  }
  const short = left > 0;
  if (short) units += left / levels[levels.length - 1]![0];
  return { price: notional / units, units, deepest, short };
}

/** Closing (M7): `units` taken from the side, best level first; p_out = Σ(price × q) ÷ Q. */
export function walkClose(levels: readonly Level[], units: number): Walk {
  let left = units;
  let paid = 0;
  let deepest = 0;
  for (const [price, size] of levels) {
    deepest += 1;
    if (size >= left) {
      paid += price * left;
      left = 0;
      break;
    }
    paid += price * size;
    left -= size;
  }
  const short = left > 0;
  if (short) paid += levels[levels.length - 1]![0] * left;
  return { price: paid / units, units, deepest, short };
}

/** A gap of the record: [from, to] of our wall clock, widened; `iid` null for every market. */
export type Gap = {
  from: number;
  to: number;
  iid: number | null;
  cause: string;
};

/** One coverage event as MARKET-1 reads it: its wall time (the line's head) and its fields. */
export type CoverageEvent = { at: number; event: string } & Record<
  string,
  unknown
>;

const num = (v: unknown): number | null =>
  typeof v === "number" && Number.isFinite(v) ? v : null;
const str = (v: unknown): string | null => (typeof v === "string" ? v : null);

/** The hour of a book file named in an event (`…\<date>\book-HH.jsonl`), else null. */
export function bookFileHour(file: string): number | null {
  const m = /(\d{4}-\d{2}-\d{2})[\\/]book-(\d\d)\.jsonl/.exec(file);
  return m ? Date.parse(`${m[1]}T${m[2]}:00:00Z`) : null;
}

/**
 * The gaps of the record (M7) from coverage events in time order: an event
 * that opens a gap and is never closed runs to the end of time. Hours and
 * days found missing or failing are added by the caller.
 */
export function gapsOf(events: readonly CoverageEvent[]): Gap[] {
  const gaps: Gap[] = [];
  const add = (from: number, to: number, iid: number | null, cause: string) =>
    gaps.push({
      from: from - GAP_MARGIN_MS,
      to: to + GAP_MARGIN_MS,
      iid,
      cause,
    });
  const stalls = new Map<number, number>();
  const conns = new Map<string, number>();
  /** Book channels the server refused, by connection: no stall is ever marked for them. */
  const refused = new Map<string, Map<number, number>>();
  let stopped: number | null = null;
  let diskStop: number | null = null;
  for (const e of events) {
    switch (e.event) {
      case "market_stall": {
        const iid = num(e.iid);
        if (iid !== null && !stalls.has(iid)) stalls.set(iid, e.at);
        break;
      }
      case "market_resume": {
        const iid = num(e.iid);
        const from = iid === null ? undefined : stalls.get(iid);
        if (iid !== null && from !== undefined) {
          add(from, e.at, iid, "market stall");
          stalls.delete(iid);
        }
        break;
      }
      case "ws_close": {
        const conn = str(e.conn);
        if (conn?.startsWith("book-") && !conns.has(conn))
          conns.set(conn, num(e.lastFrameAt) ?? e.at);
        break;
      }
      case "sub_refused": {
        const conn = str(e.conn);
        const ch = /^book::(\d+)$/.exec(str(e.channel) ?? "");
        if (conn === null || ch === null) break;
        const byConn = refused.get(conn) ?? new Map<number, number>();
        const iid = Number(ch[1]);
        if (!byConn.has(iid)) byConn.set(iid, e.at);
        refused.set(conn, byConn);
        break;
      }
      case "ws_resumed":
      case "ws_open": {
        const conn = str(e.conn);
        const from = conn === null ? undefined : conns.get(conn);
        if (conn !== null && from !== undefined) {
          const to =
            e.event === "ws_resumed" ? (num(e.firstFrameAt) ?? e.at) : e.at;
          add(from, to, null, "book connection closed");
          conns.delete(conn);
        }
        // A reopened connection asks again for the channels it was refused.
        if (conn !== null && e.event === "ws_open") {
          for (const [iid, at] of refused.get(conn) ?? [])
            add(at, e.at, iid, "book channel refused");
          refused.delete(conn);
        }
        break;
      }
      case "process_stop":
        stopped ??= e.at;
        break;
      case "process_start": {
        if (stopped !== null) add(stopped, e.at, null, "collector stopped");
        stopped = null;
        const beat = num(e.lastHeartbeatAt);
        if (beat !== null) add(beat, e.at, null, "collector restarted");
        break;
      }
      case "disk":
        if (e.disk !== "recordings") break;
        if (e.state === "stop") diskStop ??= e.at;
        else if (diskStop !== null) {
          add(diskStop, e.at, null, "recordings disk full");
          diskStop = null;
        }
        break;
      case "write_failed":
      case "cut_line_dropped":
      case "compression_failed": {
        const hour = bookFileHour(str(e.file) ?? "");
        if (hour !== null)
          add(hour, hour + HOUR_MS, null, `book file ${e.event}`);
        break;
      }
    }
  }
  for (const [iid, from] of stalls) add(from, Infinity, iid, "market stall");
  for (const byConn of refused.values())
    for (const [iid, from] of byConn)
      add(from, Infinity, iid, "book channel refused");
  for (const from of conns.values())
    add(from, Infinity, null, "book connection closed");
  if (stopped !== null) add(stopped, Infinity, null, "collector stopped");
  if (diskStop !== null) add(diskStop, Infinity, null, "recordings disk full");
  return gaps;
}

/** The first gap covering x for the market, else null. */
export function gapAt(
  gaps: readonly Gap[],
  iid: number,
  x: number,
): Gap | null {
  return (
    gaps.find(
      (g) => (g.iid === null || g.iid === iid) && g.from <= x && x <= g.to,
    ) ?? null
  );
}

/** The whole hour [h, h + 1 h) as a gap of every market, widened. */
export const hourGap = (hour: number, cause: string): Gap => ({
  from: hour - GAP_MARGIN_MS,
  to: hour + HOUR_MS + GAP_MARGIN_MS,
  iid: null,
  cause,
});

export type BookSource =
  | { source: "book"; book: Book }
  | {
      source: "mark";
      why: "no book line" | "stale book" | "gap" | "book not usable";
      gap?: string;
    };

/** M7: the book at x is used when it is live (fresh, no gap covering x) and usable. */
export function bookSource(
  book: Book | null,
  gap: Gap | null,
  x: number,
): BookSource {
  if (gap !== null) return { source: "mark", why: "gap", gap: gap.cause };
  if (book === null) return { source: "mark", why: "no book line" };
  if (book.ts < x - LIVE_MS) return { source: "mark", why: "stale book" };
  if (!usable(book)) return { source: "mark", why: "book not usable" };
  return { source: "book", book };
}
