// The cost settings on the kit's own data: sessions, the session-pair table,
// the category fallback, fees and ANT-USD's override.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { nySession, spreadAt, feeAt, costCategory, SETTINGS } from '../costs.mjs';

const near = (a, b, tol = 1e-15) => Math.abs(a - b) <= tol;
const pair = JSON.parse(readFileSync(new URL('../data/price-table.json', import.meta.url), 'utf8'));
const at = (s) => Date.parse(s);

test('New York sessions across the clock change of 2026-11-01', () => {
  assert.equal(nySession(at('2026-10-14T14:00:00Z')), 'us_regular');
  assert.equal(nySession(at('2026-10-14T13:29:00Z')), 'off_hours');
  assert.equal(nySession(at('2026-10-14T13:30:00Z')), 'us_regular');
  assert.equal(nySession(at('2026-10-14T20:00:00Z')), 'off_hours');
  assert.equal(nySession(at('2026-11-04T14:29:00Z')), 'off_hours');
  assert.equal(nySession(at('2026-11-04T14:30:00Z')), 'us_regular');
  assert.equal(nySession(at('2026-11-04T20:59:00Z')), 'us_regular');
  assert.equal(nySession(at('2026-11-04T21:00:00Z')), 'off_hours');
  assert.equal(nySession(at('2026-10-17T15:00:00Z')), 'weekend');
  assert.equal(nySession(at('2026-10-18T23:00:00Z')), 'weekend');
  assert.equal(nySession(at('2026-10-16T23:00:00Z')), 'off_hours');
  // Inside one minute the answer does not change; across the boundary minute it does.
  assert.equal(nySession(at('2026-10-14T13:29:59.999Z')), 'off_hours');
  assert.equal(nySession(at('2026-10-14T13:30:00.001Z')), 'us_regular');
  assert.equal(nySession(at('2026-10-14T19:59:59.999Z')), 'us_regular');
  assert.equal(nySession(at('2026-10-16T19:59:00Z')), 'us_regular');   // Friday 15:59 EDT
  assert.equal(nySession(at('2026-10-17T03:59:59Z')), 'off_hours');    // Friday 23:59 EDT
  assert.equal(nySession(at('2026-10-17T04:00:00Z')), 'weekend');      // Saturday 00:00 EDT
});

test('the session-pair table: the weekday table in US regular hours, the Saturday table otherwise', () => {
  const reg = at('2026-10-14T15:00:00Z'), off = at('2026-10-17T15:00:00Z');
  for (const iid of [1, 6, 19, 33, 97]) {
    assert.deepEqual(spreadAt(pair, iid, reg), { c: pair.tables.us_regular.by_iid[iid] / 1e4, fallback: false });
    assert.deepEqual(spreadAt(pair, iid, off), { c: pair.tables.other.by_iid[iid] / 1e4, fallback: false });
    assert.equal(SETTINGS.taker.spread(iid, reg).c, pair.tables.us_regular.by_iid[iid] / 1e4);
  }
  // KIOXIA-USD (51, retired) is in no table: its category's mean, flagged.
  assert.deepEqual(spreadAt(pair, 51, off), { c: pair.tables.other.by_category.equity / 1e4, fallback: true });
  assert.deepEqual([costCategory(6), costCategory(8), costCategory(33), costCategory(19), costCategory(97), costCategory(51)], ['crypto-major', 'crypto-major', 'crypto-small', 'equity', 'pre_ipo', 'equity']);
  assert.throws(() => costCategory(12), /not in the rule book/);
});

test('fees: the base tier, and ANT-USD\'s override from 2026-10-29T15:23:35.757Z', () => {
  const t = at('2026-10-14T15:00:00Z');
  assert.ok(near(feeAt('taker', 6, t), 0.0004) && near(feeAt('maker', 6, t), 0.000125));
  const o = 1793287415757;
  assert.equal(new Date(o).toISOString(), '2026-10-29T15:23:35.757Z');
  assert.ok(near(feeAt('taker', 97, o - 1), 0.0004) && near(feeAt('taker', 97, o), 0.0002) && near(feeAt('maker', 97, o), 0.0000625));
  assert.ok(near(SETTINGS.taker.fee(97, o + 1), 0.0002) && near(SETTINGS.maker.fee(6, t), 0.000125));
  assert.deepEqual(SETTINGS.maker.spread(6, t), { c: 0, fallback: false });
});
