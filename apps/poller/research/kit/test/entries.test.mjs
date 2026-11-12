// Order events, cycles, entries, the delay and the voted rule on synthetic
// fills with known answers (R8's test-entries scenarios, every output asserted,
// and the boundaries R8's tests did not pin).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toEvents, toCycles, buildEntries, horizonClass, hashU, entryId, delayOf, maxDelay, voted, median, DELAY_FIXED_MS } from '../entries.mjs';
import { HOUR, CUT } from '../constants.mjs';

let tid = 1;
// A fill: t (s), instrument, order id, previous size, side, quantity; forced optional.
const F = (t, iid, oid, prev, side, q, forced = false, taker = true) => ({ t: t * 1000, iid, oid, tid: tid++, prevS: String(prev), prev: Number(prev),
  sgn: side === 'long' ? 1 : -1, px: 100, q, fee: 0.04, pnl: 0, taker, liq: forced, forced });
const sec = (ms) => ms / 1000;

test('s1: an open in two fills, an add 30 s later merged, an add 90 s later on its own, a reduce, a close', () => {
  const ev = toEvents([F(0, 1, 11, 0, 'long', 1), F(0.2, 1, 11, 0, 'long', 1), F(30, 1, 12, 2, 'long', 1), F(90, 1, 13, 3, 'long', 1), F(120, 1, 14, 4, 'short', 2), F(200, 1, 15, 2, 'short', 2)]);
  assert.deepEqual(ev.map((e) => e.kind), ['OPEN', 'ADD', 'ADD', 'REDUCE', 'CLOSE']);
  assert.deepEqual([ev[0].n, ev[0].net, ev[0].notional, sec(ev[0].t), sec(ev[0].t1)], [2, 2, 200, 0, 0.2]);
  assert.deepEqual(ev.map((e) => e.after), [2, 3, 4, 2, 0]);
  const g = buildEntries(ev, 0, 1e12);
  assert.deepEqual(g.map((x) => [x.type, sec(x.t), x.dir, x.merged.length]), [['OPEN', 0, 1, 1], ['ADD', 90, 1, 0]]);
  assert.deepEqual(g[0].exits.map((x) => [sec(x.t), x.share, x.kind, x.forced]), [[120, 0.5, 'REDUCE', false], [200, 1, 'CLOSE', false]]);
  assert.deepEqual(g[1].exits.map((x) => [sec(x.t), x.share]), [[120, 0.5], [200, 1]]);
  assert.equal(g[0].tids.length, 3);
  assert.deepEqual(toCycles(ev).map((c) => [sec(c.start), sec(c.end), c.closedBy, c.dir]), [[0, 200, 'CLOSE', 1]]);
});

test('s2: a flip closes the short entry and is an entry itself', () => {
  const ev = toEvents([F(1000, 2, 21, 0, 'short', 3), F(2000, 2, 22, -3, 'long', 5)]);
  assert.deepEqual(ev.map((e) => e.kind), ['OPEN', 'FLIP']);
  const g = buildEntries(ev, 0, 1e12);
  assert.deepEqual(g.map((x) => [x.type, x.dir]), [['OPEN', -1], ['FLIP', 1]]);
  assert.deepEqual(g[0].exits.map((x) => [x.kind, x.share]), [['FLIP', 1]]);
  assert.deepEqual(g[1].exits, []);
  assert.deepEqual(toCycles(ev).map((c) => [c.dir, sec(c.start), c.end === null ? null : sec(c.end)]), [[-1, 1000, 2000], [1, 2000, null]]);
});

test('s3: open, close 10 s later, re-open 30 s after the first open: one entry, the re-open absorbed', () => {
  const g = buildEntries(toEvents([F(5000, 3, 31, 0, 'long', 1), F(5010, 3, 32, 1, 'short', 1), F(5030, 3, 33, 0, 'long', 1)]), 0, 1e12);
  assert.deepEqual(g.map((x) => [x.type, x.merged.length]), [['OPEN', 1]]);
  assert.deepEqual(g[0].exits.map((x) => [x.kind, x.share]), [['CLOSE', 1]]);
});

test('s4: a liquidation reduce is an exit, never an entry; an add 61 s after the open is its own group', () => {
  const g = buildEntries(toEvents([F(9000, 4, 41, 0, 'long', 4), F(9061, 4, 42, 4, 'long', 4), F(9100, 4, 43, 8, 'short', 2, true)]), 0, 1e12);
  assert.deepEqual(g.map((x) => [x.type, sec(x.t) - 9000]), [['OPEN', 0], ['ADD', 61]]);
  assert.deepEqual(g[0].exits.map((x) => [x.share, x.forced]), [[0.25, true]]);
});

test('a forced open is no entry; the merge window is inclusive at exactly 60 s and the flip never merges', () => {
  assert.deepEqual(buildEntries(toEvents([F(100, 9, 1, 0, 'long', 1, true)]), 0, 1e12), []);
  const at60 = buildEntries(toEvents([F(0, 9, 2, 0, 'long', 1), F(60, 9, 3, 1, 'long', 1)]), 0, 1e12);
  assert.deepEqual(at60.map((x) => [x.type, x.merged.length]), [['OPEN', 1]]);
  const after60 = buildEntries(toEvents([F(0, 9, 4, 0, 'long', 1), F(60.001, 9, 5, 1, 'long', 1)]), 0, 1e12);
  assert.deepEqual(after60.map((x) => x.type), ['OPEN', 'ADD']);
  const flip = buildEntries(toEvents([F(0, 9, 6, 0, 'short', 1), F(10, 9, 7, -1, 'long', 2)]), 0, 1e12);
  assert.deepEqual(flip.map((x) => [x.type, x.dir]), [['OPEN', -1], ['FLIP', 1]]);
  // A flip back to the group's own side inside 60 s (after a forced flip) is a new entry, never merged.
  const back = buildEntries(toEvents([F(0, 10, 8, 0, 'long', 1), F(10, 10, 9, 1, 'short', 2, true), F(30, 10, 10, -1, 'long', 2)]), 0, 1e12);
  assert.deepEqual(back.map((x) => [x.type, x.dir, sec(x.t), x.merged.length]), [['OPEN', 1, 0, 0], ['FLIP', 1, 30, 0]]);
  assert.deepEqual(back[0].exits.map((x) => [x.kind, x.forced]), [['FLIP', true]]);
});

test('s5: events in one millisecond given in the wrong order are chained by size', () => {
  assert.deepEqual(toEvents([F(20000, 5, 52, 1, 'long', 1), F(20000, 5, 51, 0, 'long', 1)]).map((e) => e.kind), ['OPEN', 'ADD']);
  assert.deepEqual(buildEntries(toEvents([F(20000, 5, 52, 1, 'long', 1), F(20000, 5, 51, 0, 'long', 1)]), 0, 1e12).map((x) => [x.type, x.merged.length]), [['OPEN', 1]]);
  // After an earlier position (size 2): reduce 2 -> 1, close 1 -> 0, open short 0 -> -1, scrambled.
  const s5b = [F(21000, 5, 50, 0, 'long', 2), F(21500, 5, 55, 0, 'short', 1), F(21500, 5, 53, 2, 'short', 1), F(21500, 5, 54, 1, 'short', 1)];
  assert.deepEqual(toEvents(s5b).map((e) => e.kind), ['OPEN', 'REDUCE', 'CLOSE', 'OPEN']);
  // A first run with no earlier position: its head is the event no other leads to
  // (0 -> 1 -> 2 -> 1, given backwards).
  const first = [F(30000, 5, 63, 2, 'short', 1), F(30000, 5, 62, 1, 'long', 1), F(30000, 5, 61, 0, 'long', 1)];
  assert.deepEqual(toEvents(first).map((e) => [e.kind, e.oid]), [['OPEN', 61], ['ADD', 62], ['REDUCE', 63]]);
});

test('s6: two instruments at once are two entries; the window [from, to) keeps groups whose first fill is in it', () => {
  const g = buildEntries(toEvents([F(30000, 6, 61, 0, 'long', 1), F(30000, 7, 62, 0, 'short', 1), F(40000, 6, 63, 1, 'short', 1), F(40000, 6, 64, 0, 'short', 1)]), 30000e3, 40000e3);
  assert.deepEqual(g.map((x) => [x.iid, x.dir]), [[6, 1], [7, -1]]);
});

test('s7: one resting order filled in two matching events makes two events', () => {
  assert.deepEqual(toEvents([F(50000, 8, 71, 0, 'long', 1), F(50100, 8, 71, 1, 'long', 1)]).map((e) => e.kind), ['OPEN', 'ADD']);
  const mixed = toEvents([F(60000, 8, 72, 0, 'long', 1, false, false), F(60000, 8, 72, 0, 'long', 3, false, true)]);
  assert.deepEqual([mixed.length, mixed[0].notional, mixed[0].n], [1, 400, 2]);
});

test('the horizon class on the log scale, and the default under 10 closed cycles', () => {
  assert.deepEqual([0.5, 2.44, 2.45, 11.9, 12, 40].map((h) => horizonClass(h * HOUR, 10) / HOUR), [1, 1, 6, 6, 24, 24]);
  assert.equal(horizonClass(0.5 * HOUR, 9) / HOUR, 6);
  assert.equal(horizonClass(null, 50) / HOUR, 6);
});

test('the entry id, the delay and the voted rule are R8\'s', () => {
  const id = entryId('0xabc', { iid: 6, t: 1790000000000, type: 'OPEN' });
  assert.equal(id, '0xabc|6|1790000000000|OPEN');
  const D = delayOf(id);
  assert.equal(D, hashU('R8-delay-v1', id) * 33300 + 2140 + 60000);
  assert.ok(D >= 62140 && D < 95440);
  assert.equal(DELAY_FIXED_MS, 2140);
  assert.equal(maxDelay(), 95440);
  assert.equal(maxDelay({ T: 100000, R: 60000 }), 162140);
  // The hour [cut - 3 h, cut - 2 h): its end + 95.44 s + 1 h is before the cut.
  assert.equal(voted(CUT - 3 * HOUR + 1000, HOUR), true);
  // The hour [cut - 2 h, cut - 1 h): + 95.44 s + 1 h passes the cut.
  assert.equal(voted(CUT - 2 * HOUR + 1000, HOUR), false);
  assert.equal(voted(CUT - 2 * HOUR + 1000, HOUR - 95440), true);   // ends exactly at the cut: allowed
  assert.equal(voted(CUT - 2 * HOUR + 1000, HOUR - 95439), false);  // one ms past it
  assert.equal(voted(CUT - 3 * HOUR + 1000, HOUR, { T: 100000, R: 60000 }), true);
  assert.equal(voted(CUT - 3 * HOUR + 1000, HOUR + 3600000 - 162140 + 1, { T: 100000, R: 60000 }), false);
});

test('hashU is uniform on [0, 1) and deterministic; median', () => {
  const us = Array.from({ length: 20000 }, (_, i) => hashU('test', i));
  assert.ok(us.every((u) => u >= 0 && u < 1));
  assert.ok(Math.abs(us.reduce((s, u) => s + u, 0) / us.length - 0.5) < 0.01);
  assert.equal(hashU('a', 'b'), hashU('a', 'b'));
  assert.deepEqual([median([]), median([3, 1, 2]), median([4, 1, 2, 3])], [null, 2, 2.5]);
});
