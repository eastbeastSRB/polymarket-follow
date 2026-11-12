// The primary cell's markets (A.0-7) and the map's cells (A.1-8) on the kit's data.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { inPrimaryCell, mapOpen, mapFrom } from '../cells.mjs';
import { SETTINGS } from '../costs.mjs';
import { HOUR } from '../constants.mjs';

const at = (s) => Date.parse(s);

test('A.0-7: pre-IPO and R8\'s five left out; KIOXIA-USD from its settlement day; the rest in', () => {
  const t = at('2026-10-14T15:00:00Z');
  for (const iid of [97, 96, 88, 14, 52, 50]) assert.equal(inPrimaryCell(iid, t), false, `iid ${iid}`);
  for (const iid of [1, 6, 7, 8, 19, 33]) assert.equal(inPrimaryCell(iid, t), true, `iid ${iid}`);
  // KIOXIA-USD (51) settled 2026-09-28T00:33:01.797Z: left out from that day's start.
  assert.equal(inPrimaryCell(51, at('2026-09-27T23:59:59.999Z')), true);
  assert.equal(inPrimaryCell(51, at('2026-09-28T00:00:00Z')), false);
  assert.equal(inPrimaryCell(51, at('2026-09-28T00:10:00Z')), false);
  assert.throws(() => inPrimaryCell(12, t), /not in the rule book/);
});

const { taker, maker } = SETTINGS;
const open = (iid, hours, setting, dir) => mapOpen(iid, { h: hours * HOUR, setting, dir });

test('A.1-8: the map\'s cells of FIND\'s 65 days, by direction', () => {
  // BTC-USD: a taker's 1 h cell closed (67.0%), its 24 h cell open both ways (54.0% / 52.3%).
  assert.deepEqual([open(6, 1, taker, 1), open(6, 1, taker, -1), open(6, 24, taker, 1), open(6, 24, taker, -1)], [false, false, true, true]);
  // From 24 h funding splits the two: GOLD-USD long 58.2% closed, short 53.4% open; BRENTOIL-USD the reverse.
  assert.deepEqual([open(2, 24, taker, 1), open(2, 24, taker, -1)], [false, true]);
  assert.deepEqual([open(46, 24, taker, 1), open(46, 24, taker, -1)], [true, false]);
  // The 65 days decide, not a half: SKHY-USD (13) at 6 h is open over 65 days (54.4%), closed in
  // the first half; ETH-USD at 6 h closed over 65 days (55.2%), open in the second half.
  assert.deepEqual([open(13, 6, taker, 1), open(7, 6, taker, 1)], [true, false]);
  // A maker's cells: BTC-USD 1 h closed (55.2%), ETH-USD 1 h open (53.9%).
  assert.deepEqual([open(6, 1, maker, 1), open(7, 1, maker, 1)], [false, true]);
  assert.throws(() => mapOpen(6, { h: HOUR / 2, setting: taker, dir: 1 }), /no cell/);
  assert.throws(() => mapOpen(12, { h: HOUR, setting: taker, dir: 1 }), /no cell/);
  assert.throws(() => mapOpen(6, { h: HOUR, setting: { name: 'owner' }, dir: 1 }), /no cell/);
  assert.throws(() => mapOpen(6, { h: HOUR, setting: taker, dir: 0 }), /neither 1 nor -1/);
});

test('A.1-8: the frozen map holds first measurement 8\'s counts (84 primary-cell markets)', () => {
  const tsv = readFileSync(new URL('../data/m8-map.tsv', import.meta.url), 'utf8');
  const markets = [...new Set(tsv.split('\n').slice(1).filter(Boolean).map((l) => l.split('\t')).filter((r) => r[3] === 'true').map((r) => Number(r[0])))];
  assert.equal(markets.length, 84);
  const count = (hours, setting, both) => markets.filter((iid) => (both
    ? !open(iid, hours, setting, 1) && !open(iid, hours, setting, -1) : !open(iid, hours, setting, 1) || !open(iid, hours, setting, -1))).length;
  assert.deepEqual([1, 6, 24, 72].map((h) => count(h, taker, true)), [82, 41, 4, 1]);
  assert.deepEqual([1, 6, 24, 72].map((h) => count(h, taker, false)), [82, 41, 15, 8]);
  assert.deepEqual([1, 6, 24, 72].map((h) => count(h, maker, true)), [14, 2, 0, 0]);
});

test('the map\'s parser refuses a malformed row, a carriage return among them', () => {
  const head = 'market\tsymbol\tcategory\tprimary\thorizon_h\tperiod\tminutes\tmean_abs_move_bps\tsetting\tround_trip_bps\tfunding_long_bps\tcost_over_move_long\tbreak_even_long\tcost_over_move_short\tbreak_even_short\tclosed_long\tclosed_short';
  const row = '6\tBTC-USD\tcrypto-major\ttrue\t1\t65 days\t93540\t24.19\ttaker\t8.23\t0.00\t0.340\t0.6701\t0.340\t0.6701\ttrue\ttrue';
  assert.deepEqual([...mapFrom(`${head}\n${row}\n`)], [['6|1|taker', { long: true, short: true }]]);
  assert.throws(() => mapFrom(`${head}\r\n${row}\r\n`), /malformed/);
  assert.throws(() => mapFrom(`${head}\n${row.replace('\ttrue\ttrue', '\ttrue')}\n`), /malformed/);
  assert.deepEqual([...mapFrom(`${head}\n${row.replace('65 days', 'first half')}\n`)], []);
});
