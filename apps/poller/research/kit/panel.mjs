// The one-minute panel's reader (foundation 2). A market's file, built by
// scripts/build-panel.mjs, is checked against the hash the kit pins
// (data/panel-manifest.sha256) and held as dense per-minute arrays from the
// market's first trading day to its end (the cut, or a retired market's
// settlement). Every row at or after the cut is refused.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { CUT, MIN, HOUR, PANEL, KIT_DATA } from './constants.mjs';
import { BlindStoreError } from './fills.mjs';

// R8's staleness limit, 300 s, in whole minutes: a minute without a mark takes
// the latest earlier minute's last mark if at most 5 minutes older.
export const MAX_STALE_MINUTES = 5;

let pinned = null;
function pinnedHash(name) {
  if (!pinned) {
    pinned = new Map();
    for (const line of readFileSync(new URL('panel-manifest.sha256', KIT_DATA), 'utf8').split('\n')) {
      const m = /^([0-9a-f]{64}) \*?(.+)$/.exec(line.trim());
      if (m) pinned.set(m[2], m[1]);
    }
  }
  return pinned.get(name);
}

// Builds the in-memory market from a parsed panel file (also used by tests).
export function marketFrom(p) {
  if (!(p.end <= CUT)) throw new BlindStoreError(`market ${p.iid}: the panel ends at ${new Date(p.end).toISOString()}, after the cut`);
  const n = (p.end - p.start) / MIN;
  if (!Number.isInteger(n) || p.marks.length !== n) throw new Error(`market ${p.iid}: ${p.marks.length} marks for ${n} minutes`);
  const marks = Float64Array.from(p.marks, (v) => (v === null ? NaN : v));
  const trades = new Int32Array(n), volume = new Float64Array(n);
  p.klines.minute.forEach((i, k) => {
    if (!(i >= 0 && i < n)) throw new BlindStoreError(`market ${p.iid}: a kline outside the panel's minutes`);
    trades[i] = p.klines.trades[k]; volume[i] = p.klines.volume[k];
  });
  const mk = { iid: p.iid, symbol: p.symbol, category: p.category, start: p.start, end: p.end, n, marks, trades, volume, retired: p.retired ?? null, firstTrade: p.firstTrade };
  const hours = p.funding.map((r) => r[0]);
  for (const [, , stamp] of p.funding) if (stamp >= CUT) throw new BlindStoreError(`market ${p.iid}: a funding row stamped at or after the cut`);
  // Prefix sums of rate x the settlement's mark, and of settlements without a mark.
  const cum = new Float64Array(hours.length), cumUnmarked = new Int32Array(hours.length);
  let s = 0, u = 0;
  p.funding.forEach(([hour, rate], i) => {
    const m = markAtMinuteEnd(mk, hour - 1);
    if (m === null) u++; else s += rate * m;
    cum[i] = s; cumUnmarked[i] = u;
  });
  mk.funding = { hour: Float64Array.from(hours), rate: Float64Array.from(p.funding, (r) => r[1]), cum, cumUnmarked };
  return mk;
}

export function loadMarket(iid) {
  const name = `${iid}.json.gz`;
  const buf = readFileSync(`${PANEL}/${name}`);
  const want = pinnedHash(name);
  const got = createHash('sha256').update(buf).digest('hex');
  if (!want) throw new Error(`panel file ${name} is not in the kit's pinned manifest`);
  if (got !== want) throw new Error(`panel file ${name}: SHA-256 ${got} differs from the pinned ${want}`);
  return marketFrom(JSON.parse(gunzipSync(buf).toString('utf8')));
}

export const minuteIndex = (mk, t) => Math.floor((t - mk.start) / MIN);

// The mark in force at the end of the minute that holds t (A.0-2), or null.
export function markAtMinuteEnd(mk, t) {
  const i = minuteIndex(mk, t);
  if (i < 0 || i >= mk.n) return null;
  for (let j = i; j >= 0 && i - j <= MAX_STALE_MINUTES; j--) if (!Number.isNaN(mk.marks[j])) return mk.marks[j];
  return null;
}

// Public trades in the minute starting at m (0 outside the panel).
export function tradesAt(mk, m) {
  const i = minuteIndex(mk, m);
  return i >= 0 && i < mk.n ? mk.trades[i] : 0;
}

// Funding of the settlements whose NOMINAL hour lies in (tIn, tOut] (a row
// stamped late still belongs to its hour; R8-REVIEW note 4): sum = the sum of
// rate x the mark at the end of the minute before the hour (NaN if one such
// mark is missing); missing = the whole hours in (tIn, tOut] without a row,
// counted as rows, never charged.
export function fundingBetween(mk, tIn, tOut) {
  const H = mk.funding.hour;
  const lo = upperBound(H, tIn), hi = upperBound(H, tOut) - 1; // first hour > tIn, last hour <= tOut
  const { cum, cumUnmarked } = mk.funding;
  const window = (a) => (hi >= lo ? a[hi] - (lo > 0 ? a[lo - 1] : 0) : 0);
  const sum = window(cumUnmarked) > 0 ? NaN : window(cum);
  const expected = Math.floor(tOut / HOUR) - Math.floor(tIn / HOUR);
  return { sum, missing: expected - Math.max(0, hi - lo + 1) };
}
function upperBound(a, x) { let lo = 0, hi = a.length; while (lo < hi) { const m = (lo + hi) >> 1; if (a[m] <= x) lo = m + 1; else hi = m; } return lo; }
