// An account's style label and habits at an instant, from data before it only
// (IDEAS-REVIEW point 2.22: labels and hold classes come from the weeks before
// each entry, as R8 did at T0).
// - The label: the frozen classifier v1 (data/classifier-v1/, byte-identical:
//   classifier.mjs f7f32f22…8c01, classifier-v1.json d803192c…e4ad) on the 14
//   days before the instant, on the contiguous capture, as r8-pret0.mjs does.
// - The habits: R8's selection rules on the 30 days before the instant — the
//   median hold of the cycles closed in them whose start is captured, its
//   horizon class, and the long share of the entries opened in them.
import { readFileSync } from 'node:fs';
import { KIT_DATA, DAY } from './constants.mjs';
import { features, classify } from './data/classifier-v1/classifier.mjs';
import { horizonClass, median } from './entries.mjs';

export const LABEL_DAYS = 14;
export const HABIT_DAYS = 30;

let params = null;
const P = () => (params ??= JSON.parse(readFileSync(new URL('classifier-v1/classifier-v1.json', KIT_DATA), 'utf8')));

// covered: the capture reaches the window's start, or holds the account whole.
export function labelAt(account, at) {
  const from = at - LABEL_DAYS * DAY;
  const cap = { fills: account.fills, pages: account.pages, truncated: account.truncated, oldest: account.oldest };
  const f = features(cap, from, at, P());
  return { ...classify(f, P()), covered: !account.truncated || (account.oldest !== null && account.oldest <= from) };
}

// cycles: toCycles(events); groups: buildEntries(events, -Infinity, Infinity)
// (merging depends on history only, so filtering the whole list by time is the
// same as a windowed call).
export function habitsAt({ cycles, groups }, at) {
  const from = at - HABIT_DAYS * DAY;
  const closed = cycles.filter((c) => c.end !== null && c.end >= from && c.end < at && c.start !== null);
  const medianHoldMs = median(closed.map((c) => c.end - c.start));
  const opened = groups.filter((g) => g.type !== 'ADD' && g.t >= from && g.t < at);
  return {
    closed: closed.length, medianHoldMs, hClass: horizonClass(medianHoldMs, closed.length),
    entries: opened.length, longShare: opened.length ? opened.filter((g) => g.dir > 0).length / opened.length : null,
  };
}

// Mondays 00:00Z in [from, to].
export function mondays(from, to) {
  const out = [];
  const d = new Date(from);
  d.setUTCHours(0, 0, 0, 0);
  if (d.getTime() < from) d.setUTCDate(d.getUTCDate() + 1);
  while (d.getUTCDay() !== 1) d.setUTCDate(d.getUTCDate() + 1);
  for (let t = d.getTime(); t <= to; t += 7 * DAY) out.push(t);
  return out;
}
