/**
 * The store's keys (rules.md H0, H2, H8, H10), in one place: every key the
 * program builds — a fill file's, a book file's, an `asset_ctxs` day's — and
 * the one parser of a key's date, by which the seal refuses (gate.ts). A
 * builder that drifted from the parser would fail closed: its key's date would
 * not parse, and the seal refuses such a key.
 */
import { HOUR_MS } from "../schedule.js";
import type { Format } from "./fills.js";
import { DATA_END, SIZING_START } from "./instants.js";

/** The fill files' formats by hour (H2): `node_fills` from its first file to 2025-07-27 08h, `node_fills_by_block` from that hour to DATA END's. */
export const FORMAT_SWITCH = Date.parse("2025-07-27T08:00:00Z");

/** A UTC date as the keys write it, `YYYYMMDD`. */
const ymd = (t: number) =>
  new Date(t).toISOString().slice(0, 10).replaceAll("-", "");

const keyHour = (t: number) => `${ymd(t)}/${new Date(t).getUTCHours()}`;

/** Every fill file of the hours [from, to), in time order: both formats in the hour they share. */
export function fillKeys(from: number, to: number): string[] {
  const keys: string[] = [];
  const first = Math.max(from, SIZING_START);
  const last = Math.min(to, DATA_END + HOUR_MS);
  for (let h = first; h < last; h += HOUR_MS) {
    if (h <= FORMAT_SWITCH) keys.push(`node_fills/hourly/${keyHour(h)}.lz4`);
    if (h >= FORMAT_SWITCH)
      keys.push(`node_fills_by_block/hourly/${keyHour(h)}.lz4`);
  }
  return keys;
}

/** A fill file's format, by its key. */
export const formatOf = (key: string): Format =>
  key.startsWith("node_fills_by_block/") ? "node_fills_by_block" : "node_fills";

/** The book file's key of a coin and an hour. */
export const bookKey = (coin: string, hour: number): string =>
  `market_data/${keyHour(hour)}/l2Book/${coin}.lz4`;

/** The `asset_ctxs` day file's key of the day starting at `day`. */
export const ctxsKey = (day: number): string =>
  `asset_ctxs/${ymd(day)}.csv.lz4`;

/** The UTC date `YYYYMMDD` with an hour, or null when it is no such date. */
function utc(ymdText: string, hour: string): number | null {
  const [y, m, d, h] = [
    Number(ymdText.slice(0, 4)),
    Number(ymdText.slice(4, 6)),
    Number(ymdText.slice(6, 8)),
    Number(hour),
  ];
  const t = Date.UTC(y, m - 1, d, h);
  const back = new Date(t);
  return back.getUTCFullYear() === y &&
    back.getUTCMonth() === m - 1 &&
    back.getUTCDate() === d &&
    back.getUTCHours() === h
    ? t
    : null;
}

/** The instant a store key is dated — its hour, its day, or a funding window's start — or null. */
export function keyDate(key: string): number | null {
  const hourly =
    /^(?:node_fills|node_fills_by_block)\/hourly\/(\d{8})\/(\d{1,2})\.lz4$/.exec(
      key,
    ) ?? /^market_data\/(\d{8})\/(\d{1,2})\/l2Book\/[^/]+\.lz4$/.exec(key);
  if (hourly) return utc(hourly[1]!, hourly[2]!);
  const daily = /^asset_ctxs\/(\d{8})\.csv\.lz4$/.exec(key);
  if (daily) return utc(daily[1]!, "0");
  const funding = /^info\/fundingHistory\/[^/]+\/(\d{13})\.json$/.exec(key);
  return funding ? Number(funding[1]) : null;
}
