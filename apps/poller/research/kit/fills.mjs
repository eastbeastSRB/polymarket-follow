// Fills of the captured accounts, read with the blind store enforced.
// Only <addr>.fills.jsonl.gz is ever opened: never R2's light files, which hold
// portfolio, profit, equity and competition reads made after the cut (A.0-9).
// Money and sizes become Numbers here: fine for statistics, never accounting.
import { readFileSync, existsSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { CUT, R2_CAPTURE, R8_MERGED } from './constants.mjs';

export class BlindStoreError extends Error {}

const isNumStr = (s) => typeof s === 'string' && s.length > 0 && Number.isFinite(Number(s));
// The boundary check of a fill row (Iron Rule 3): a row that fails it is
// dropped and counted, never guessed. R8's validFill.
export function validFill(x) {
  return !!x && Number.isSafeInteger(x.trade_id) && Number.isSafeInteger(x.order_id) && Number.isSafeInteger(x.instrument_id)
    && Number.isSafeInteger(x.timestamp) && (x.side === 'long' || x.side === 'short') && isNumStr(x.price) && isNumStr(x.quantity)
    && isNumStr(x.previous_size) && isNumStr(x.pnl) && isNumStr(x.fee) && (x.total_fee === undefined || isNumStr(x.total_fee))
    && typeof x.taker === 'boolean' && typeof x.liquidation === 'boolean';
}

export const normFill = (x) => ({
  t: x.timestamp, iid: x.instrument_id, oid: x.order_id, tid: x.trade_id, prevS: x.previous_size, prev: Number(x.previous_size),
  sgn: x.side === 'long' ? 1 : -1, px: Number(x.price), q: Number(x.quantity), fee: Number(x.total_fee ?? x.fee), pnl: Number(x.pnl),
  taker: x.taker === true, liq: x.liquidation === true, forced: x.liquidation === true || x.adl === true || x.settlement === true,
});

// Where an account's fills are: R8's completed file first (R2's pages plus
// R8's older ones), else R2's file; `folder` says accounts/ or holdout/.
export function fillsFile(addr, roots = { capture: R2_CAPTURE, merged: R8_MERGED }) {
  for (const folder of ['accounts', 'holdout']) {
    const p = `${roots.capture}/${folder}/${addr}.fills.jsonl.gz`;
    if (!existsSync(p)) continue;
    const m = `${roots.merged}/${addr}.fills.jsonl.gz`;
    return existsSync(m) ? { path: m, folder, merged: true } : { path: p, folder, merged: false };
  }
  return null;
}

// One account: its contiguous capture (numbered pages; window samples are not
// contiguous and are left out), deduplicated by (trade_id, instrument_id,
// timestamp), oldest first. truncated = the last numbered page said more.
// Throws BlindStoreError on any row stamped at or after the cut.
export function readAccount(addr, roots) {
  const file = fillsFile(addr, roots);
  if (!file) return null;
  const pages = gunzipSync(readFileSync(file.path)).toString('utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l))
    .filter((p) => p.status === 200 && Array.isArray(p.body?.data) && typeof p.page === 'number')
    .sort((a, b) => a.page - b.page);
  const seen = new Set();
  const fills = [];
  let dropped = 0;
  for (const p of pages) {
    for (const x of p.body.data) {
      if (!validFill(x)) { dropped++; continue; }
      if (x.timestamp >= CUT) throw new BlindStoreError(`${addr}: a fill stamped ${new Date(x.timestamp).toISOString()}, at or after the cut`);
      const k = `${x.trade_id}|${x.instrument_id}|${x.timestamp}`;
      if (seen.has(k)) continue;
      seen.add(k);
      fills.push(normFill(x));
    }
  }
  fills.sort((a, b) => a.t - b.t);
  const last = pages.at(-1);
  return { addr, ...file, fills, pages: pages.length, truncated: last ? last.body.more === true : false,
    oldest: fills.length ? fills[0].t : null, newest: fills.length ? fills.at(-1).t : null, dropped };
}
