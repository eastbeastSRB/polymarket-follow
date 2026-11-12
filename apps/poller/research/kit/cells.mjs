// The cells an entry may count in.
// - A.0-7, the markets. Left out of every primary cell: the pre-IPO market;
//   PRL, NCLD, SKHYNIX, SAMSUNG and CXMT (R8's list); a retired market from the
//   day it turned close-only — the API gives only the settlement, so its
//   settlement's UTC day (KIOXIA-USD: 2026-09-28); any market-day with a split
//   — none before the cut (data/rulebook.json).
// - A.1-8, the map: a market x horizon x cost setting cell whose break-even
//   share of right calls is above 55% is closed, and no entry takes it as its
//   primary cell (the owner, decisions 2026-11-11: not applied to entries 7
//   and 8). The cells of FIND's 65 days, frozen in data/m8-map.tsv (first
//   measurement 8, SHA-256 d8f8657c…3f77).
import { readFileSync } from 'node:fs';
import { KIT_DATA, DAY, HOUR } from './constants.mjs';

const R8_LEFT_OUT = [96, 88, 14, 52, 50];

let leftOutFrom = null; // iid -> the instant from which the market is left out
function load() {
  if (!leftOutFrom) {
    const rulebook = JSON.parse(readFileSync(new URL('rulebook.json', KIT_DATA), 'utf8'));
    if (rulebook.splits.events.length) throw new Error('the rule book lists stock splits: A.0-7 leaves their market-days out, which cells.mjs does not do');
    leftOutFrom = new Map(rulebook.instruments.map((i) => [i.iid,
      i.category === 'pre_ipo' || R8_LEFT_OUT.includes(i.iid) ? -Infinity : i.settlement ? Math.floor(i.settlement.timestamp / DAY) * DAY : Infinity]));
  }
  return leftOutFrom;
}

// Whether an entry in market iid at instant t may count in a primary cell.
export function inPrimaryCell(iid, t) {
  const from = load().get(iid);
  if (from === undefined) throw new Error(`instrument ${iid} is not in the rule book`);
  return t < from;
}

// The map's cells of FIND's 65 days from its TSV (also used by tests):
// `${iid}|${hours}|${setting}` -> { long, short }, true where that direction is closed.
export function mapFrom(tsv) {
  const cells = new Map();
  for (const line of tsv.split('\n').slice(1).filter(Boolean)) {
    const r = line.split('\t');
    if (r.length !== 17 || ![r[15], r[16]].every((x) => x === 'true' || x === 'false')) throw new Error(`the map: a malformed row: ${line}`);
    if (r[5] === '65 days') cells.set(`${r[0]}|${r[4]}|${r[8]}`, { long: r[15] === 'true', short: r[16] === 'true' });
  }
  return cells;
}
let map = null;

// Whether the map leaves the cell of an entry open: market iid, horizon h (ms:
// 1, 6, 24 or 72 h), cost setting (SETTINGS.taker or .maker), the entry's
// direction dir (+1 long, -1 short: funding makes the two differ from 24 h).
export function mapOpen(iid, { h, setting, dir }) {
  map ??= mapFrom(readFileSync(new URL('m8-map.tsv', KIT_DATA), 'utf8'));
  const c = map.get(`${iid}|${h / HOUR}|${setting.name}`);
  if (!c) throw new Error(`the map has no cell for instrument ${iid}, ${h / HOUR} h, setting ${setting.name}`);
  if (dir !== 1 && dir !== -1) throw new Error(`direction ${dir} is neither 1 nor -1`);
  return !(dir === 1 ? c.long : c.short);
}
