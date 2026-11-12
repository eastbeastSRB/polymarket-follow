// The cost settings (A.0-3): every net figure under a taker here and a maker
// here; Polymarket Perps' measured taker costs are the default (the owner,
// decisions 2026-11-10). The owner's own setting is not defined yet (to be
// talked through, same entry): no setting stands in for it.
// - taker: the base-tier taker fee on both legs, and the spread and depth of
//   R8's session-pair price table (decisions 2026-11-09, R8's price table
//   chosen: the weekday table in US regular hours, the Saturday table at every
//   other instant; per instrument, half-spread + depth for $1,000);
// - maker: the base-tier maker fee on both legs, no spread paid.
// Fees from the rule book as read 2026-11-10 (data/rulebook.json).
import { readFileSync } from 'node:fs';
import { KIT_DATA } from './constants.mjs';

let loaded = null;
function data() {
  if (!loaded) {
    const read = (f) => JSON.parse(readFileSync(new URL(f, KIT_DATA), 'utf8'));
    loaded = { pair: read('price-table.json'), rulebook: read('rulebook.json') };
    loaded.instrument = new Map(loaded.rulebook.instruments.map((i) => [i.iid, i]));
  }
  return loaded;
}

const NY = new Intl.DateTimeFormat('en-US', { timeZone: 'America/New_York', weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
// The session of an instant in New York: 'us_regular' (Mon-Fri 09:30-16:00),
// 'weekend' (Saturday, Sunday) or 'off_hours'. Every boundary falls on a whole
// minute, so the answer is kept per minute.
const sessions = new Map();
export function nySession(t) {
  const minute = Math.floor(t / 60000);
  let s = sessions.get(minute);
  if (s === undefined) {
    const p = Object.fromEntries(NY.formatToParts(new Date(minute * 60000)).map((x) => [x.type, x.value]));
    const m = Number(p.hour) * 60 + Number(p.minute);
    s = p.weekday === 'Sat' || p.weekday === 'Sun' ? 'weekend' : m >= 570 && m < 960 ? 'us_regular' : 'off_hours';
    sessions.set(minute, s);
  }
  return s;
}

// The price tables' categories: crypto splits into majors (BTC, ETH, SOL) and the rest.
export function costCategory(iid) {
  const i = data().instrument.get(iid);
  if (!i) throw new Error(`instrument ${iid} is not in the rule book`);
  if (i.category === 'crypto') return [6, 7, 8].includes(iid) ? 'crypto-major' : 'crypto-small';
  return i.category;
}

// Half-spread + depth for $1,000 at t, as a fraction: the instrument's value in
// the table that applies at t, else its category's mean (flagged), else an error.
export function spreadAt(table, iid, t) {
  const tab = table.mode === 'pair' ? (nySession(t) === 'us_regular' ? table.tables.us_regular : table.tables.other) : table.tables.all;
  const v = tab.by_iid[iid];
  if (v !== undefined) return { c: v / 1e4, fallback: false };
  const w = tab.by_category[costCategory(iid)];
  if (w === undefined) throw new Error(`no spread for instrument ${iid}`);
  return { c: w / 1e4, fallback: true };
}

// The base-tier fee of a side at t: the instrument's fee override where one
// is in force (ANT-USD from 2026-10-29T15:23:35.757Z), else the schedule's.
export function feeAt(side, iid, t) {
  const { rulebook, instrument } = data();
  const o = instrument.get(iid)?.fee_override;
  const inForce = o && t >= o.start_time && (o.end_time === null || t < o.end_time);
  return Number(inForce ? o.tiers[0][`${side}_fee_rate`] : rulebook.fees[`${side}_fee_rate`]);
}

export const SETTINGS = {
  taker: { name: 'taker', fee: (iid, t) => feeAt('taker', iid, t), spread: (iid, t) => spreadAt(data().pair, iid, t) },
  maker: { name: 'maker', fee: (iid, t) => feeAt('maker', iid, t), spread: () => ({ c: 0, fallback: false }) },
};
