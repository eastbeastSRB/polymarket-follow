/**
 * The market contexts and the settled funding (the polishing plan 4.1 and
 * 4.2(5); WAVE-H's rules.md H9 and H10): the `asset_ctxs` days into the
 * minute table's context columns for the 40 coins, and the funding windows
 * into the funding table. A minute's context is the row H10 picks for its
 * mark: the coin's row with the latest stamp in (m, m + 1 min], of two rows
 * of one stamp the first, the next day's 00:00 row for 23:59. A row is taken
 * when its time and its mark pass WAVE-H's schema; each other cell is its
 * number, or NaN and counted when it is none. A row stamped at or after the
 * range's end is not used. The counts are WAVE-H's, by day, for the 38
 * coins, and a day above WAVE-H's 1% stops the run; in FRESH's range such
 * a day, or one whose header lacks a column, is read as absent and listed
 * instead (polish/rules.md P2; decisions 2026-11-19, POLISH-RULES's plan
 * ruled, Q6). Funding goes through WAVE-H's own readers.
 */
import { z } from "zod";
import { MINUTE_MS } from "../schedule.js";
import type { CtxsCount } from "../waveh/ctxs.js";
import { fundingRows, joinFunding, type FundingRow } from "../waveh/funding.js";
import { isoDay } from "../waveh/instants.js";
import { ctxsKey, fundingKey } from "../waveh/keys.js";
import { FAIL_LEAST, FAIL_SHARE } from "../waveh/pass.js";
import { StoreError, type DataList } from "../waveh/store.js";
import { readHeld } from "./held.js";
import { decodeAll } from "./lz4.js";
import type { Seal } from "./seal.js";

/** A day file whose header lacks a column the store keeps. */
export class CtxsHeaderError extends Error {}

/** The minute table's context columns: the store's name and the CSV's, the mark first. */
export const CONTEXT: readonly (readonly [column: string, csv: string])[] = [
  ["mark", "mark_px"],
  ["oracle", "oracle_px"],
  ["mid", "mid_px"],
  ["impactBid", "impact_bid_px"],
  ["impactAsk", "impact_ask_px"],
  ["openInterest", "open_interest"],
  ["funding", "funding"],
  ["premium", "premium"],
  ["dayNtlVlm", "day_ntl_vlm"],
  ["prevDayPx", "prev_day_px"],
];

/** WAVE-H's row schema (its `ctxs.ts`): a time of whole seconds and a mark above 0. */
const Row = z.object({
  time: z
    .string()
    .regex(/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/)
    .transform((s) => Date.parse(s))
    .refine((t) => Number.isFinite(t)),
  mark_px: z
    .string()
    .refine((s) => s.length > 0 && Number(s) > 0 && Number.isFinite(Number(s)))
    .transform(Number),
});

/** A cell's number, or NaN when it is none. */
const numberOf = (s: string | undefined) =>
  s !== undefined && s.length > 0 && Number.isFinite(Number(s))
    ? Number(s)
    : NaN;

/** The minutes [start + k min, start + (k + 1) min), k < minutes. */
export type Grid = { start: number; minutes: number };

export type Contexts = {
  grid: Grid;
  /** By coin and column, each minute's value; NaN where no row gave one. */
  byCoin: Map<string, Map<string, Float64Array>>;
  /** By coin, the stamp of the row that gave each minute. */
  stamps: Map<string, Float64Array>;
  /** WAVE-H's counts of the 38 coins' rows, by day. */
  byDay: Map<string, CtxsCount>;
  /** BTC's and ETH's rows, counted alike. */
  large: CtxsCount;
  /** By column, the cells that are not a number (each one NaN). */
  badCells: Map<string, number>;
  /** FRESH's days read as absent (rules.md P2), by day: why. */
  absent: Map<string, string>;
};

const zeroCount = (): CtxsCount => ({
  rows: 0,
  failed: 0,
  offMinute: 0,
  late: 0,
  twice: 0,
});

export function newContexts(grid: Grid, forty: Iterable<string>): Contexts {
  const byCoin = new Map<string, Map<string, Float64Array>>();
  const stamps = new Map<string, Float64Array>();
  for (const coin of forty) {
    byCoin.set(
      coin,
      new Map(
        CONTEXT.map(([c]) => [c, new Float64Array(grid.minutes).fill(NaN)]),
      ),
    );
    stamps.set(coin, new Float64Array(grid.minutes).fill(NaN));
  }
  return {
    grid,
    byCoin,
    stamps,
    byDay: new Map(),
    large: zeroCount(),
    badCells: new Map(),
    absent: new Map(),
  };
}

/** One day file's text into the contexts; returns its counts of the 38 coins' rows (WAVE-H's `addCtxs`). */
export function addDay(
  c: Contexts,
  text: string,
  until: number,
  small: ReadonlySet<string>,
): CtxsCount {
  const count = zeroCount();
  const lines = text.split("\n");
  const head = lines[0]!.split(",");
  const iTime = head.indexOf("time");
  const iCoin = head.indexOf("coin");
  const at = CONTEXT.map(([, csv]) => head.indexOf(csv));
  if (iTime < 0 || iCoin < 0 || at.some((i) => i < 0))
    throw new CtxsHeaderError(`asset_ctxs header "${lines[0]!.slice(0, 200)}"`);
  for (let k = 1; k < lines.length; k++) {
    const line = lines[k]!;
    if (line === "") continue;
    let coin: string | undefined;
    if (iCoin === 1) {
      const c1 = line.indexOf(",");
      const c2 = c1 < 0 ? -1 : line.indexOf(",", c1 + 1);
      coin = c1 < 0 ? undefined : line.slice(c1 + 1, c2 < 0 ? undefined : c2);
    } else coin = line.split(",")[iCoin];
    if (coin === undefined || coin === "") {
      count.rows += 1;
      count.failed += 1;
      continue;
    }
    const columns = c.byCoin.get(coin);
    if (columns === undefined) continue;
    const tally = small.has(coin) ? count : c.large;
    tally.rows += 1;
    const cells = line.split(",");
    const r =
      cells.length === head.length
        ? Row.safeParse({ time: cells[iTime], mark_px: cells[at[0]!] })
        : null;
    if (r === null || !r.success) {
      tally.failed += 1;
      continue;
    }
    const t = r.data.time;
    if (t % MINUTE_MS !== 0) tally.offMinute += 1;
    if (t >= until) {
      tally.late += 1;
      continue;
    }
    const i = Math.ceil((t - c.grid.start) / MINUTE_MS) - 1;
    if (i < 0 || i >= c.grid.minutes) continue;
    const mark = columns.get("mark")!;
    const stamps = c.stamps.get(coin)!;
    if (!Number.isNaN(mark[i]!)) {
      tally.twice += 1;
      if (t <= stamps[i]!) continue;
    }
    stamps[i] = t;
    mark[i] = r.data.mark_px;
    for (let j = 1; j < CONTEXT.length; j++) {
      const [name] = CONTEXT[j]!;
      const v = numberOf(cells[at[j]!]);
      if (Number.isNaN(v))
        c.badCells.set(name, (c.badCells.get(name) ?? 0) + 1);
      columns.get(name)![i] = v;
    }
  }
  return count;
}

/** WAVE-H's 1% rule on a day's rows of the small coins. */
const failing = (c: CtxsCount) =>
  c.failed >= FAIL_LEAST && c.failed / c.rows > FAIL_SHARE;
const failingText = (c: CtxsCount) =>
  `${c.failed} of ${c.rows} asset_ctxs rows of the small coins fail WAVE-H's schema`;

/** Why a day file would fail WAVE-H's rules (its header, or its 1%), counted by `addDay` itself on contexts of no minute; null when it passes. */
function whyAbsent(
  text: string,
  until: number,
  forty: Iterable<string>,
  small: ReadonlySet<string>,
): string | null {
  try {
    const count = addDay(
      newContexts({ start: 0, minutes: 0 }, forty),
      text,
      until,
      small,
    );
    return failing(count) ? failingText(count) : null;
  } catch (err) {
    if (err instanceof CtxsHeaderError) return err.message;
    throw err;
  }
}

/** Every day of `days` (each held to the list) into new contexts on `grid`; a day failing WAVE-H's 1% stops it, or with `failingDayAbsent` (FRESH's range) is read as absent and listed. */
export async function readContexts(o: {
  store: string;
  list: DataList;
  days: readonly number[];
  grid: Grid;
  until: number;
  forty: Iterable<string>;
  small: ReadonlySet<string>;
  pace: () => Promise<void>;
  failingDayAbsent?: boolean;
  /** The seal the days are read under; closed when not given. */
  seal?: Seal;
}): Promise<Contexts> {
  const c = newContexts(o.grid, o.forty);
  for (const d of o.days) {
    await o.pace();
    const key = ctxsKey(d);
    let text: string;
    try {
      text = decodeAll(
        readHeld(o.store, key, o.list.get(key), o.seal),
      ).toString("utf8");
    } catch (err) {
      if (err instanceof StoreError) throw err;
      throw new StoreError(`${key}: ${(err as Error).message}`);
    }
    if (o.failingDayAbsent === true) {
      const why = whyAbsent(text, o.until, c.byCoin.keys(), o.small);
      if (why !== null) {
        c.absent.set(isoDay(d), why);
        continue;
      }
    }
    const count = addDay(c, text, o.until, o.small);
    if (failing(count))
      throw new StoreError(`${isoDay(d)}: ${failingText(count)}`);
    c.byDay.set(isoDay(d), count);
  }
  return c;
}

export type Funding = {
  /** By coin, its rows in hour order (WAVE-H's `joinFunding`). */
  byCoin: Map<string, FundingRow[]>;
  /** By coin, WAVE-H's counts: rows by window (its first day), failing, late. */
  counts: Map<
    string,
    { windows: Record<string, number>; failed: number; late: number }
  >;
};

/** Each coin's funding windows (each held to the list) through WAVE-H's `fundingRows` and `joinFunding`. */
export function readFunding(o: {
  store: string;
  list: DataList;
  coins: readonly string[];
  starts: readonly number[];
  until: number;
  /** The seal the windows are read under; closed when not given. */
  seal?: Seal;
}): Funding {
  const byCoin = new Map<string, FundingRow[]>();
  const counts: Funding["counts"] = new Map();
  for (const coin of o.coins) {
    const rows: FundingRow[] = [];
    const windows: Record<string, number> = {};
    let failed = 0;
    let late = 0;
    for (const start of o.starts) {
      const key = fundingKey(coin, start);
      const r = fundingRows(
        coin,
        readHeld(o.store, key, o.list.get(key), o.seal).toString("utf8"),
        o.until,
      );
      windows[isoDay(start)] = r.rows.length;
      failed += r.failed;
      late += r.late;
      rows.push(...r.rows);
    }
    try {
      byCoin.set(coin, joinFunding(rows));
    } catch (err) {
      throw new StoreError(`${coin}: ${(err as Error).message}`);
    }
    counts.set(coin, { windows, failed, late });
  }
  return { byCoin, counts };
}
