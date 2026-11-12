// The competition (A.0-8) on the kit's rule book.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { inCompetition, COMPETITION } from '../competition.mjs';

const at = (s) => Date.parse(s);

test('A.0-8: the window [2026-11-02 14:30Z, 2026-11-16 14:30Z) and the boosted markets ANT, AMD, ARM, SOXL', () => {
  assert.deepEqual([COMPETITION.start, COMPETITION.end], [at('2026-11-02T14:30:00Z'), at('2026-11-16T14:30:00Z')]);
  assert.deepEqual(inCompetition(6, at('2026-11-02T14:29:59.999Z')), { days: false, boosted: false });
  assert.deepEqual(inCompetition(6, at('2026-11-02T14:30:00Z')), { days: true, boosted: false });
  assert.deepEqual(inCompetition(6, at('2026-11-16T14:29:59.999Z')), { days: true, boosted: false });
  assert.deepEqual(inCompetition(6, at('2026-11-16T14:30:00Z')), { days: false, boosted: false });
  // AMD-USD 22, ARM-USD 26, SOXL-USD 89, ANT-USD 97 (the rule book's ids): boosted whatever the day.
  for (const iid of [22, 26, 89, 97]) {
    assert.deepEqual(inCompetition(iid, at('2026-10-14T15:00:00Z')), { days: false, boosted: true }, `iid ${iid}`);
    assert.deepEqual(inCompetition(iid, at('2026-11-05T15:00:00Z')), { days: true, boosted: true }, `iid ${iid}`);
  }
  for (const iid of [1, 7, 19, 25, 88]) assert.equal(inCompetition(iid, at('2026-11-05T15:00:00Z')).boosted, false, `iid ${iid}`);
  assert.throws(() => inCompetition(12, at('2026-11-05T15:00:00Z')), /not in the rule book/);
});
