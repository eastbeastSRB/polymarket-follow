// The exact matched null (A.0-4; foundation 2): the expected result of a
// random public trade in the same market and UTC hour as the entry — every
// trade equally likely, so each minute weighs its trade count, less the trades
// of the accounts the caller removes — followed after the same delay D and held
// over the same horizon, its direction long with the trader's long share.
// Klines give each minute's count, not each trade's second: a trade is taken
// as uniform within its minute, so its follow instant falls in the minute
// k0 = floor(D / 1 min) after its own with probability 1 - phi and in the next
// one with phi = (D mod 1 min) / 1 min.
// No tape is read and no trade is drawn. Klines carry no taker side, so a null
// "in the trade's own direction" (R8's primary) cannot be built this way.
// And A.0-4's d, the entry's result against that null.
import { HOUR, MIN } from './constants.mjs';
import { tradesAt } from './panel.mjs';
import { leg } from './returns.mjs';

// value(dir, followMinuteStart) -> the leg's result (e.g. leg(...).gross) or
// null when unpriced. removed(minuteStart) -> trades of that minute to leave out.
// Returns { value, weight, minutes } or { value: null, reason }.
export function exactNull(mk, { t, D, longShare, value, removed = () => 0 }) {
  const H = Math.floor(t / HOUR) * HOUR;
  const k0 = Math.floor(D / MIN), phi = (D - k0 * MIN) / MIN;
  let weight = 0, sum = 0, minutes = 0;
  for (let m = H; m < H + HOUR; m += MIN) {
    const w = tradesAt(mk, m) - removed(m);
    if (w <= 0) continue;
    const a = matched(value, m + k0 * MIN, longShare);
    const b = phi > 0 ? matched(value, m + (k0 + 1) * MIN, longShare) : 0;
    if (a === null || b === null) return { value: null, reason: 'unpriced' };
    sum += w * ((1 - phi) * a + phi * b);
    weight += w;
    minutes++;
  }
  if (weight === 0) return { value: null, reason: 'no trades in the hour' };
  return { value: sum / weight, weight, minutes };
}

// The trades a study leaves out of the null's minutes (R8 left out its tracked
// accounts' trades): from those accounts' fills, the distinct trades (by trade
// key) per market and minute. Returns (iid) -> (minuteStart) -> count.
export function removalOf(fillLists) {
  const per = new Map(), seen = new Set();
  for (const fills of fillLists) for (const f of fills) {
    const k = `${f.tid}|${f.iid}|${f.t}`;
    if (seen.has(k)) continue;
    seen.add(k);
    const m = Math.floor(f.t / MIN) * MIN;
    if (!per.has(f.iid)) per.set(f.iid, new Map());
    per.get(f.iid).set(m, (per.get(f.iid).get(m) ?? 0) + 1);
  }
  return (iid) => { const byMinute = per.get(iid); return (m) => byMinute?.get(m) ?? 0; };
}

// A.0-4's d for one entry: its gross result minus the exact matched null's
// gross over the same horizon (costs cancel in d) — the entry at instant t in
// direction dir, followed at t + D and held h (leg); the null over t's UTC hour
// with the trader's long share, leaving out the trades `removed` names (the
// caller says whose: removalOf, or () => 0 for nobody's). With netSetting, d
// net minus net under that setting beside, for an entry that asks for it.
// Returns { d, gross, nullGross, weight, minutes[, dNet] } or { d: null, reason }
// (a leg is unpriced for a missing mark whatever the setting, so dNet exists
// whenever d does).
const GROSS = { name: 'gross', fee: () => 0, spread: () => ({ c: 0, fallback: false }) }; // gross needs no costs
export function dAgainstNull(mk, { dir, t, D, h, longShare, removed, netSetting }) {
  if (typeof removed !== 'function') throw new Error('d: the caller says whose trades the null leaves out (removed)');
  if (!(typeof longShare === 'number' && longShare >= 0 && longShare <= 1)) throw new Error(`d: a long share of ${longShare}`);
  const value = (key, setting) => (side, f) => leg(mk, { dir: side, tIn: f, h, setting })?.[key] ?? null;
  const gross = value('gross', GROSS)(dir, t + D);
  if (gross === null) return { d: null, reason: 'entry unpriced' };
  const g = exactNull(mk, { t, D, longShare, value: value('gross', GROSS), removed });
  if (g.value === null) return { d: null, reason: g.reason };
  const out = { d: gross - g.value, gross, nullGross: g.value, weight: g.weight, minutes: g.minutes };
  if (netSetting) out.dNet = value('net', netSetting)(dir, t + D) - exactNull(mk, { t, D, longShare, value: value('net', netSetting), removed }).value;
  return out;
}

function matched(value, f, longShare) {
  const long = longShare > 0 ? value(1, f) : 0;
  const short = longShare < 1 ? value(-1, f) : 0;
  if (long === null || short === null) return null;
  return longShare * long + (1 - longShare) * short;
}
