// Entry 7's runs on synthetic fills with known answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { runsOf } from '../runs.mjs';
import { MIN } from '../constants.mjs';

let tid = 1;
// A fill: t (min), instrument, order id, side, notional (price 100); taker and forced optional.
const F = (tMin, iid, oid, side, q = 1, taker = true, forced = false) => ({ t: Math.round(tMin * MIN), iid, oid, tid: tid++, sgn: side === 'long' ? 1 : -1, px: 100, q, taker, forced });
// One taker order a fill at each instant (minutes), long on market 6 unless said.
const orders = (mins, iid = 6, side = 'long', from = 1) => mins.map((m, k) => F(m, iid, from + k, side));
const view = (runs) => runs.map((r) => [r.iid, r.side, r.start / MIN, r.trigger / MIN, r.orders]);

test('five taker orders within 30 minutes, gaps under 10: a run at the fifth', () => {
  assert.deepEqual(view(runsOf(orders([0, 5, 10, 15, 20]))), [[6, 1, 0, 20, 5]]);
  assert.deepEqual(runsOf(orders([0, 5, 10, 15])), []);
  // One run a chain, triggered by the earliest order completing five; the chain's orders counted.
  assert.deepEqual(view(runsOf(orders([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]))), [[6, 1, 0, 4, 12]]);
});

test('a gap of 10 minutes ends a chain; 30 minutes is inclusive', () => {
  assert.deepEqual(runsOf(orders([0, 5, 15, 20, 25, 30])), []); // 5 -> 15 is 10 minutes: chains of 2 and 4
  const justUnder = 15 - 1 / 60000;
  assert.deepEqual(view(runsOf(orders([0, 5, justUnder, 20, 25, 30]))).map((r) => r[3]), [25]);
  // 0, 8, 16, 24, 32: the fifth is 32 minutes after the first; the sixth, at 38, 30 after the second.
  assert.deepEqual(view(runsOf(orders([0, 8, 16, 24, 32, 38]))), [[6, 1, 0, 38, 6]]);
  assert.deepEqual(runsOf(orders([0, 8, 16, 24, 32, 38.001])), []);
});

test('a taker order is one with half or more of its notional taken; forced fills are left out', () => {
  const half = [F(0, 6, 1, 'long', 1, true), F(0, 6, 1, 'long', 1, false), ...orders([2, 4, 6, 8], 6, 'long', 2)];
  assert.equal(runsOf(half).length, 1);
  const under = [F(0, 6, 1, 'long', 0.99, true), F(0, 6, 1, 'long', 1.01, false), ...orders([2, 4, 6, 8], 6, 'long', 2)];
  assert.equal(runsOf(under).length, 0);
  const forced = [F(0, 6, 1, 'long', 1, true, true), ...orders([2, 4, 6, 8], 6, 'long', 2)];
  assert.equal(runsOf(forced).length, 0);
  // An order's instant is its first fill, its notional all its fills'.
  const late = [F(0, 6, 1, 'long', 1), F(11, 6, 1, 'long', 1), ...orders([2, 4, 6, 8], 6, 'long', 2)];
  assert.deepEqual(view(runsOf(late)), [[6, 1, 0, 8, 5]]);
});

test('sides and markets make separate chains; runs come in trigger order', () => {
  assert.deepEqual(runsOf([...orders([0, 1, 2], 6, 'long', 1), ...orders([3, 4], 6, 'short', 4)]), []);
  assert.deepEqual(runsOf([...orders([0, 1, 2], 6, 'long', 1), ...orders([3, 4], 7, 'long', 4)]), []);
  const two = [...orders([10, 11, 12, 13, 14], 7, 'short', 1), ...orders([0, 1, 2, 3, 4], 6, 'long', 10)];
  assert.deepEqual(view(runsOf(two)), [[6, 1, 0, 4, 5], [7, -1, 10, 14, 5]]);
});
