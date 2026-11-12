// Labels and habits at an instant, from the data before it only.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { labelAt, habitsAt, mondays, LABEL_DAYS, HABIT_DAYS } from '../labels.mjs';
import { toEvents, toCycles, buildEntries } from '../entries.mjs';
import { DAY, HOUR, MIN } from '../constants.mjs';

const M = Date.parse('2026-10-05T00:00:00Z'); // a Monday
let tid = 1, oid = 1;
const fill = (t, iid, prev, side, q, taker = true) => ({ t, iid, oid: oid++, tid: tid++, prevS: String(prev), prev, sgn: side === 'long' ? 1 : -1, px: 100, q, fee: 0, pnl: 0, taker, liq: false, forced: false });
const account = (fills, truncated = false) => ({ fills, pages: 1, truncated, oldest: fills.length ? fills[0].t : null });

// A slow directional trader: one open and one close a day on two instruments, irregular hours.
function slowTrader(days = 20) {
  const f = [];
  for (let d = days; d >= 1; d--) {
    const t0 = M - d * DAY + ((d * 37) % 12) * HOUR + ((d * 13) % 50) * MIN;
    const iid = d % 2 ? 6 : 7;
    const side = d % 3 ? 'long' : 'short';
    f.push(fill(t0, iid, 0, side, 1 + (d % 4)), fill(t0 + (3 + (d % 5)) * HOUR, iid, side === 'long' ? 1 + (d % 4) : -(1 + (d % 4)), side === 'long' ? 'short' : 'long', 1 + (d % 4)));
  }
  return f.sort((a, b) => a.t - b.t);
}

test('labelAt: v1 on the 14 days before the instant; data after it changes nothing', () => {
  const f = slowTrader();
  const a = labelAt(account(f), M);
  assert.equal(a.label, 'directional');
  assert.equal(a.covered, true);
  const later = [...f, ...Array.from({ length: 3000 }, (_, i) => fill(M + i * 1000, 6, i % 2, i % 2 ? 'short' : 'long', 1))];
  assert.deepEqual(labelAt(account(later), M), a);
  // The same account far busier inside the window: an algorithm.
  const busy = [...f, ...Array.from({ length: 4000 }, (_, i) => fill(M - 5 * DAY + i * 2000, 8, i % 2, i % 2 ? 'short' : 'long', 1))].sort((x, y) => x.t - y.t);
  assert.equal(labelAt(account(busy), M).label, 'algorithm');
  assert.equal(LABEL_DAYS, 14);
});

test('labelAt: covered only if a truncated capture reaches the window start', () => {
  const f = slowTrader(10);
  assert.equal(labelAt(account(f, true), M).covered, false);
  assert.equal(labelAt(account(slowTrader(20), true), M).covered, true);
  assert.equal(labelAt(account(f, false), M).covered, true);
});

test('habitsAt: closed cycles of the 30 days before, the median hold, the class, the long share', () => {
  const f = slowTrader(40);
  const ev = toEvents(f);
  const h = habitsAt({ cycles: toCycles(ev), groups: buildEntries(ev, -Infinity, Infinity) }, M);
  const inWin = (t) => t >= M - HABIT_DAYS * DAY && t < M;
  const closes = f.filter((x) => x.prev !== 0 && inWin(x.t));
  assert.equal(h.closed, closes.length);
  const opens = f.filter((x) => x.prev === 0 && inWin(x.t));
  assert.equal(h.entries, opens.length);
  assert.equal(h.longShare, opens.filter((x) => x.sgn > 0).length / opens.length);
  const holds = closes.map((c) => c.t - f.filter((o) => o.prev === 0 && o.iid === c.iid && o.t < c.t).at(-1).t).sort((a, b) => a - b);
  const med = holds.length % 2 ? holds[holds.length >> 1] : (holds[holds.length / 2 - 1] + holds[holds.length / 2]) / 2;
  assert.equal(h.medianHoldMs, med);
  assert.equal(h.hClass, 6 * HOUR); // 3-7 h holds: the 6 h class
});

test('habitsAt: a cycle closing or an entry opening exactly at the instant is not before it', () => {
  // An add (61 s after the open, its own add group) is no entry for the long share.
  const f = [fill(M - 2 * DAY, 6, 0, 'long', 1), fill(M - 2 * DAY + 61000, 6, 1, 'long', 1), fill(M, 6, 2, 'short', 2), fill(M, 7, 0, 'short', 1)];
  const ev = toEvents(f);
  const h = habitsAt({ cycles: toCycles(ev), groups: buildEntries(ev, -Infinity, Infinity) }, M);
  assert.deepEqual([h.closed, h.entries, h.longShare], [0, 1, 1]);
  const h1 = habitsAt({ cycles: toCycles(ev), groups: buildEntries(ev, -Infinity, Infinity) }, M + 1);
  assert.deepEqual([h1.closed, h1.entries, h1.longShare], [1, 2, 0.5]);
  // A cycle whose start the capture does not hold is not counted.
  const g = [fill(M - DAY, 8, 2, 'short', 2)];
  const eg = toEvents(g);
  assert.equal(habitsAt({ cycles: toCycles(eg), groups: buildEntries(eg, -Infinity, Infinity) }, M).closed, 0);
});

test('mondays', () => {
  assert.deepEqual(mondays(Date.parse('2026-10-01T00:00:00Z'), Date.parse('2026-10-19T00:00:00Z')).map((t) => new Date(t).toISOString().slice(0, 10)), ['2026-10-05', '2026-10-12', '2026-10-19']);
  assert.deepEqual(mondays(Date.parse('2026-10-05T12:00:00Z'), Date.parse('2026-10-13T00:00:00Z')).map((t) => new Date(t).toISOString().slice(0, 10)), ['2026-10-12']);
});
