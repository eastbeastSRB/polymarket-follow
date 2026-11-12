// Entry 9's link tests and agreement events on synthetic data with known answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sharedTradePairs, copyPatternPairs, linkOf, agreementEvents, pairKey } from '../agreement.mjs';
import { MIN } from '../constants.mjs';

// Accounts with distinct first three hex digits.
const [A, B, C, D, E] = ['0x1aa', '0x2bb', '0x3cc', '0x4dd', '0x5ee'].map((p) => p + '0'.repeat(37));
const T0 = Date.parse('2026-10-14T10:00:00Z');
const at = (min) => T0 + Math.round(min * MIN);
const ent = (addr, min, dir = 1, iid = 6) => ({ addr, iid, t: at(min), dir });

test('(a) pairs sharing 20 or more trades; an account\'s repeated trade counted once', () => {
  const fills = (keys) => keys.map((k) => ({ tid: k, iid: 6, t: 1000 + k }));
  const range = (a, n) => Array.from({ length: n }, (_, i) => a + i);
  const out = sharedTradePairs([[B, fills([...range(0, 20), 0, 0])], [A, fills(range(0, 30))], [C, fills(range(100, 19))], [D, fills(range(100, 19))]]);
  assert.deepEqual(out, [{ a: A, b: B, shared: 20 }]);
  assert.deepEqual(sharedTradePairs([[A, fills(range(0, 19))], [B, fills(range(0, 19))]]), []);
  assert.equal(pairKey(B, A), `${A}|${B}`);
});

test('(c) copy patterns: ten openings of the same market and side within 60 s after the other, each order apart', () => {
  const follow = (lead, copy, n, lagS, dir = 1) => Array.from({ length: n }, (_, k) => [ent(lead, 100 * k, dir), ent(copy, 100 * k + lagS / 60, dir)]).flat();
  assert.deepEqual([...copyPatternPairs(follow(A, B, 10, 30))], [pairKey(A, B)]);
  assert.deepEqual([...copyPatternPairs(follow(A, B, 9, 30))], []);
  assert.deepEqual([...copyPatternPairs(follow(A, B, 10, 60))], [pairKey(A, B)]);       // 60 s inclusive
  assert.deepEqual([...copyPatternPairs(follow(A, B, 10, 60.001))], []);
  assert.deepEqual([...copyPatternPairs(follow(A, B, 10, 30).map((e) => (e.addr === B ? { ...e, dir: -1 } : e)))], []); // the other side
  // Five times A then B and five times B then A: no pair.
  assert.deepEqual([...copyPatternPairs([...follow(A, B, 5, 30), ...follow(B, A, 5, 30).map((e) => ({ ...e, t: e.t + 1000 * MIN }))])], []);
  // Input order does not matter.
  assert.deepEqual([...copyPatternPairs(follow(A, B, 10, 30).reverse())], [pairKey(A, B)]);
});

test('the link between two accounts: shared trades, then the prefix, then a copy pattern', () => {
  const link = linkOf({ sharedPairs: new Set([pairKey(A, B)]), copyPairs: new Set([pairKey(C, D), pairKey(A, B)]) });
  assert.equal(link(B, A), 'shared trades');
  assert.equal(link(C, D), 'copy pattern');
  assert.equal(link(A, '0x1aaf' + '0'.repeat(36)), 'prefix');   // the same first three hex digits
  assert.equal(link(A, '0x1ab' + '0'.repeat(37)), null);         // two only
  assert.equal(link(A, C), null);
});

test('agreement events: three unlinked accounts on one side within 60 minutes, no opposite opening, merged per market', () => {
  const none = () => null;
  const ev = (list, link = none) => agreementEvents(list, link);
  const view = (r) => r.events.map((e) => [e.iid, (e.t - T0) / MIN, e.dir, e.accounts]);
  assert.deepEqual(view(ev([ent(A, 0), ent(B, 20), ent(C, 50)])), [[6, 50, 1, 3]]);
  assert.deepEqual(view(ev([ent(A, 0), ent(B, 20), ent(B, 50)])), []);                      // two accounts
  assert.deepEqual(view(ev([ent(A, 0), ent(B, 30), ent(C, 60)])), [[6, 60, 1, 3]]);          // 60 minutes inclusive
  assert.deepEqual(view(ev([ent(A, 0), ent(B, 30), ent(C, 60.001)])), []);
  // Input order does not matter; markets are apart.
  assert.deepEqual(view(ev([ent(C, 50), ent(A, 0), ent(B, 20)])), [[6, 50, 1, 3]]);
  assert.deepEqual(view(ev([ent(A, 0), ent(B, 20), ent(C, 50, 1, 7)])), []);
  // A link in the only triple stops it; a fourth account makes an unlinked triple.
  const linked = (x, y) => (pairKey(x, y) === pairKey(A, B) ? 'shared trades' : null);
  const r = ev([ent(A, 0), ent(B, 20), ent(C, 50)], linked);
  assert.deepEqual([view(r), r.blocked], [[], { link: 1, opposite: 0 }]);
  assert.deepEqual(view(ev([ent(A, 0), ent(B, 20), ent(C, 40), ent(D, 50)], linked)), [[6, 50, 1, 4]]);
  // An opposite opening between the first and the trigger stops it; one before the first does not.
  const opp = ev([ent(A, 0), ent(E, 10, -1), ent(B, 20), ent(C, 50)]);
  assert.deepEqual([view(opp), opp.blocked], [[], { link: 0, opposite: 1 }]);
  assert.deepEqual(view(ev([ent(E, -5, -1), ent(A, 0), ent(B, 20), ent(C, 50)])), [[6, 50, 1, 3]]);
  // On one market, a trigger within 60 minutes of the last event is no new event.
  const later = [ent(A, 0), ent(B, 20), ent(C, 50), ent(D, 80), ent(E, 100), ent(A, 109)];
  assert.deepEqual(view(ev(later)), [[6, 50, 1, 3]]);
  assert.deepEqual(view(ev([...later, ent(B, 110.001)])), [[6, 50, 1, 3], [6, 110.001, 1, 4]]);
});
