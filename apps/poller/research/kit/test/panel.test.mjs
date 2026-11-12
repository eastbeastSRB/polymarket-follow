// The panel reader, the minute-convention leg, the exact matched null, A.0-4's
// d and A.0-5's risk unit on synthetic markets with hand-computed answers.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { marketFrom, markAtMinuteEnd, tradesAt, fundingBetween, MAX_STALE_MINUTES } from '../panel.mjs';
import { leg, riskUnit, RISK_DAYS } from '../returns.mjs';
import { exactNull, removalOf, dAgainstNull } from '../nulls.mjs';
import { BlindStoreError } from '../fills.mjs';
import { CUT, MIN, HOUR, DAY } from '../constants.mjs';
import { mulberry32 } from '../stats.mjs';

const near = (a, b, tol = 1e-12) => Math.abs(a - b) <= tol;
const S = Date.parse('2026-10-01T00:00:00Z');
const synth = ({ start = S, marks, klines = [], funding = [], end }) => marketFrom({
  iid: 6, symbol: 'X-USD', category: 'crypto', start, end: end ?? start + marks.length * MIN, marks,
  klines: { minute: klines.map((k) => k[0]), trades: klines.map((k) => k[1]), volume: klines.map((k) => k[2] ?? 0) }, funding, firstTrade: start,
});
const flat = (n, v = 100) => Array.from({ length: n }, () => v);

test('the mark at the end of the minute that holds t; holes up to 5 minutes; nothing outside the panel', () => {
  const marks = flat(20);
  marks[3] = 101; marks[4] = null; marks[5] = null; for (let i = 10; i <= 15; i++) marks[i] = null;
  const mk = synth({ marks });
  assert.equal(markAtMinuteEnd(mk, S + 3 * MIN), 101);
  assert.equal(markAtMinuteEnd(mk, S + 3 * MIN + 59999), 101);
  assert.equal(markAtMinuteEnd(mk, S + 5 * MIN + 30000), 101);          // 2 minutes stale
  assert.equal(markAtMinuteEnd(mk, S + 14 * MIN), 100);                  // minute 9's, 5 minutes older
  assert.equal(markAtMinuteEnd(mk, S + 15 * MIN), null);                 // 6 minutes
  assert.equal(markAtMinuteEnd(mk, S - 1), null);
  assert.equal(markAtMinuteEnd(mk, S + 20 * MIN), null);
  assert.equal(MAX_STALE_MINUTES, 5);
});

test('trade counts per minute', () => {
  const mk = synth({ marks: flat(10), klines: [[2, 7, 1.5], [9, 1]] });
  assert.deepEqual([tradesAt(mk, S + 2 * MIN), tradesAt(mk, S + 3 * MIN), tradesAt(mk, S + 9 * MIN), tradesAt(mk, S - MIN), tradesAt(mk, S + 10 * MIN)], [7, 0, 1, 0, 0]);
  assert.equal(mk.volume[2], 1.5);
});

test('funding by nominal hour in (tIn, tOut], a late stamp in its own hour, missing rows counted, a mark-less settlement local', () => {
  const n = 6 * 60;
  const marks = flat(n, 200);
  marks[2 * 60 - 1] = null; for (let i = 2 * 60 - 7; i < 2 * 60; i++) marks[i] = null; // no mark for the 7 minutes before hour 2
  const H = (k) => S + k * HOUR;
  const mk = synth({ marks, funding: [[H(1), 0.001, H(1) + 40], [H(2), 0.002, H(2) + 46400], [H(4), 0.003, H(4) + 38], [H(5), 0.004, H(5) + 38]] });
  assert.deepEqual(fundingBetween(mk, H(0), H(1)), { sum: 0.001 * 200, missing: 0 });
  assert.deepEqual(fundingBetween(mk, H(1), H(1) + 10), { sum: 0, missing: 0 });                 // tIn on the hour: excluded
  assert.ok(Number.isNaN(fundingBetween(mk, H(1) + 5, H(2) + 5).sum));                         // hour 2 has no mark
  const f = fundingBetween(mk, H(2) + 5, H(5));                                                 // hours 3 (missing), 4, 5
  assert.ok(near(f.sum, 0.003 * 200 + 0.004 * 200) && f.missing === 1, JSON.stringify(f));     // later windows are not poisoned
  assert.deepEqual(fundingBetween(mk, H(2) - 30000, H(2) + 30000).missing, 0);                  // the 46 s late row belongs to hour 2
});

test('the panel refuses what lies at or after the cut, and malformed files', () => {
  assert.throws(() => synth({ start: CUT - 2 * MIN, marks: flat(3) }), BlindStoreError);
  assert.throws(() => synth({ start: CUT - 3 * HOUR, marks: flat(60), funding: [[CUT, 0.001, CUT + 40]] }), BlindStoreError);
  assert.throws(() => synth({ marks: flat(5), klines: [[5, 1]] }), BlindStoreError);
  assert.throws(() => synth({ marks: flat(5), end: S + 6 * MIN }), /5 marks for 6 minutes/);
  assert.doesNotThrow(() => synth({ start: CUT - 3 * MIN, marks: flat(3) }));
});

const SET = (fee, c) => ({ name: 'test', fee: () => fee, spread: () => ({ c, fallback: false }) });

test('a leg by the minute: prices, gross before costs, fees, spread, funding, as R8\'s legReturn', () => {
  const marks = flat(200, 100);
  for (let i = 70; i < 200; i++) marks[i] = 110;
  const mk = synth({ marks });
  const L = leg(mk, { dir: 1, tIn: S + 5 * MIN + 1234, h: HOUR, setting: SET(0.0004, 0.0002) }); // minute 5 -> minute 65 ... both 100
  assert.ok(near(L.gross, 0) && near(L.net, (99.98 - 100.02) / 100.02 - 0.0004 * (1 + 99.98 / 100.02)));
  const up = leg(mk, { dir: 1, tIn: S + 10 * MIN + 59999, h: HOUR, setting: SET(0.0004, 0.0002) });  // minute 10 (100) -> 70 (110)
  assert.ok(near(up.gross, 0.1) && near(up.net, 0.098720264, 1e-9) && near(up.fees, 0.000839824, 1e-9), JSON.stringify(up));
  const dn = leg(synth({ marks: flat(200, 100).map((v, i) => (i >= 70 ? 90 : v)) }), { dir: -1, tIn: S + 10 * MIN, h: HOUR, setting: SET(0.0004, 0.0002) });
  assert.ok(near(dn.gross, 0.1) && near(dn.net, 0.098879784, 1e-9));
  const maker = leg(mk, { dir: 1, tIn: S + 10 * MIN, h: HOUR, setting: SET(0.000125, 0) });
  assert.ok(near(maker.net, 0.1 - 0.000125 * (1 + 1.1)));
  assert.equal(leg(mk, { dir: 1, tIn: S + 150 * MIN, h: HOUR, setting: SET(0, 0) }), null);    // exit past the panel
});

test('a leg pays funding: a positive rate charges a long and pays a short', () => {
  const mk = synth({ marks: flat(3 * 60, 100), funding: [[S + HOUR, 0.0001, S + HOUR + 40]] });
  const L = leg(mk, { dir: 1, tIn: S + 30 * MIN, h: HOUR, setting: SET(0, 0) });
  const Sh = leg(mk, { dir: -1, tIn: S + 30 * MIN, h: HOUR, setting: SET(0, 0) });
  assert.ok(near(L.funding, -0.0001) && near(Sh.funding, 0.0001) && near(L.net, -0.0001) && L.fundingMissing === 0);
  const noMark = synth({ marks: flat(3 * 60, 100).map((v, i) => (i >= 50 && i < 60 ? null : v)), funding: [[S + HOUR, 0.0001, S + HOUR + 40]] });
  assert.equal(leg(noMark, { dir: 1, tIn: S + 30 * MIN, h: HOUR, setting: SET(0, 0) }), null);
});

test('the exact null: trade-count weights, the D split between two follow minutes, the long share, removal', () => {
  const rnd = mulberry32(17);
  const n = 4 * 60;
  const marks = Array.from({ length: n }, () => 100 * (1 + (rnd() - 0.5) * 0.02));
  const klines = [[3, 3], [10, 1], [11, 5], [59, 2]];
  const mk = synth({ marks, klines });
  const set = SET(0, 0);
  const g = (dir, f) => leg(mk, { dir, tIn: f, h: HOUR, setting: set })?.gross ?? null;
  for (const D of [62140, 80000, 95439, 120000]) {
    const k0 = Math.floor(D / MIN), phi = (D % MIN) / MIN;
    let want = 0, W = 0;
    for (const [i, w] of klines) {
      const m = S + i * MIN;
      // Brute force over the trade's second, on a 1 ms grid.
      let acc = 0;
      for (let s = 0; s < MIN; s += 1) acc += g(1, Math.floor((m + s + D) / MIN) * MIN);
      want += w * acc / MIN; W += w;
      assert.ok(near(acc / MIN, (1 - phi) * g(1, m + k0 * MIN) + phi * g(1, m + (k0 + 1) * MIN), 1e-12));
    }
    const got = exactNull(mk, { t: S + 20 * MIN, D, longShare: 1, value: g });
    assert.ok(near(got.value, want / W, 1e-12) && got.weight === 11 && got.minutes === 4, `D ${D}`);
  }
  const D = 80000;
  const L1 = exactNull(mk, { t: S + 5, D, longShare: 1, value: g }).value;
  assert.ok(near(exactNull(mk, { t: S + 5, D, longShare: 0, value: g }).value, -L1, 1e-15));
  assert.ok(near(exactNull(mk, { t: S + 5, D, longShare: 0.7, value: g }).value, 0.4 * L1, 1e-15));
  // Removing minute 11's five trades leaves 3 : 1 : 2.
  const rem = exactNull(mk, { t: S + 5, D, longShare: 1, value: g, removed: (m) => (m === S + 11 * MIN ? 5 : 0) });
  assert.equal(rem.weight, 6);
  assert.equal(exactNull(mk, { t: S + HOUR + 5, D, longShare: 1, value: g }).reason, 'no trades in the hour');
  assert.equal(exactNull(mk, { t: S + 5, D, longShare: 1, value: (dir, f) => (f === S + 12 * MIN ? null : g(dir, f)) }).reason, 'unpriced');
  // removalOf: distinct trades per market and minute; a trade seen from two removed accounts counts once.
  const f = (tid, iid, t) => ({ tid, iid, t });
  const rm = removalOf([[f(1, 6, S + 11 * MIN + 5), f(2, 6, S + 11 * MIN + 59999), f(3, 7, S + 11 * MIN)], [f(1, 6, S + 11 * MIN + 5), f(4, 6, S + 12 * MIN)]]);
  assert.deepEqual([rm(6)(S + 11 * MIN), rm(6)(S + 12 * MIN), rm(7)(S + 11 * MIN), rm(8)(S), rm(6)(S + 13 * MIN)], [2, 1, 1, 0, 0]);
  assert.equal(exactNull(mk, { t: S + 5, D, longShare: 1, value: g, removed: rm(6) }).weight, 11 - 2);
  // A delay of whole minutes uses one follow minute only.
  const one = exactNull(mk, { t: S + 5, D: 120000, longShare: 1, value: (dir, f) => (f === S + 6 * MIN ? null : g(dir, f)) });
  assert.ok(one.value !== null);
});

test('A.0-4\'s d: the entry\'s gross at t + D minus the exact null\'s gross over t\'s hour; d net minus net only when asked', () => {
  const rnd = mulberry32(23);
  const marks = Array.from({ length: 5 * 60 }, () => 100 * (1 + (rnd() - 0.5) * 0.02));
  const mk = synth({ marks, klines: [[3, 3], [10, 1], [11, 5], [59, 2], [70, 4]], funding: [[S + HOUR, 0.0009, S + HOUR + 40], [S + 2 * HOUR, -0.0004, S + 2 * HOUR + 40]] });
  const zero = SET(0, 0), taker = SET(0.0004, 0.0002);
  const at = (setting, key) => (dir, f) => leg(mk, { dir, tIn: f, h: HOUR, setting })?.[key] ?? null;
  const none = () => 0, rm = (m) => (m === S + 11 * MIN ? 5 : 0);
  for (const [t, D, dir, ls, removed] of [[S + 20 * MIN + 12345, 80000, 1, 0.7, none], [S + 20 * MIN + 12345, 80000, -1, 0.7, rm], [S + 59 * MIN + 30000, 62140, 1, 0.25, none]]) {
    const want = at(zero, 'gross')(dir, t + D) - exactNull(mk, { t, D, longShare: ls, value: at(zero, 'gross'), removed }).value;
    const r = dAgainstNull(mk, { dir, t, D, h: HOUR, longShare: ls, removed });
    assert.equal(r.d, want);
    assert.equal(r.gross, leg(mk, { dir, tIn: t + D, h: HOUR, setting: taker }).gross); // costs cancel: any setting's gross
    assert.equal('dNet' in r, false);
    const withNet = dAgainstNull(mk, { dir, t, D, h: HOUR, longShare: ls, removed, netSetting: taker });
    assert.equal(withNet.d, r.d);
    assert.equal(withNet.dNet, at(taker, 'net')(dir, t + D) - exactNull(mk, { t, D, longShare: ls, value: at(taker, 'net'), removed }).value);
    assert.ok(Math.abs(withNet.dNet - r.d) > 1e-6);
  }
  // The entry at 00:59:30 is followed in hour 1, its null drawn from hour 0 (11 trades), not hour 1 (4).
  assert.equal(dAgainstNull(mk, { dir: 1, t: S + 59 * MIN + 30000, D: 62140, h: HOUR, longShare: 0.25, removed: none }).weight, 11);
  assert.equal(dAgainstNull(mk, { dir: 1, t: S + 20 * MIN, D: 80000, h: HOUR, longShare: 1, removed: rm }).weight, 6);
  assert.deepEqual(dAgainstNull(mk, { dir: 1, t: S + 4 * HOUR + 30 * MIN, D: 80000, h: HOUR, longShare: 1, removed: none }), { d: null, reason: 'entry unpriced' });
  assert.deepEqual(dAgainstNull(mk, { dir: 1, t: S + 2 * HOUR + 5, D: 80000, h: HOUR, longShare: 1, removed: none }), { d: null, reason: 'no trades in the hour' });
  assert.throws(() => dAgainstNull(mk, { dir: 1, t: S + 20 * MIN, D: 80000, h: HOUR, longShare: 1 }), /whose trades/);
  for (const ls of [null, undefined, NaN, -0.1, 1.2]) assert.throws(() => dAgainstNull(mk, { dir: 1, t: S + 20 * MIN, D: 80000, h: HOUR, longShare: ls, removed: none }), /long share/);
});

test('A.0-5\'s risk unit: the mean absolute h-return over the 30 days of minutes before the instant\'s minute', () => {
  // Marks 100 in minutes 0-59, 110 in 60-119, 88 from 120. At 02:30:30 the 1 h starts are minutes
  // 0-89 (exits 60-149): 60 returns of 0.1 and 30 of 0.2.
  const base = [...flat(60, 100), ...flat(60, 110), ...flat(120, 88)];
  const t = S + 150 * MIN + 30000;
  const r = riskUnit(synth({ marks: base }), t, HOUR);
  assert.ok(near(r.value, 12 / 90) && r.starts === 90, JSON.stringify(r));
  assert.deepEqual(riskUnit(synth({ marks: base }), S + 150 * MIN, HOUR), r);
  const r1 = riskUnit(synth({ marks: base }), S + 150 * MIN - 1, HOUR);
  assert.ok(near(r1.value, 11.8 / 89) && r1.starts === 89);
  // Nothing from the instant's minute on is read; the minute before it is.
  const rnd = mulberry32(5);
  assert.deepEqual(riskUnit(synth({ marks: base.map((v, i) => (i >= 150 ? 50 + 100 * rnd() : v)) }), t, HOUR), r);
  assert.notDeepEqual(riskUnit(synth({ marks: base.map((v, i) => (i === 149 ? 50 : v)) }), t, HOUR), r);
  // A start (or an exit) without a mark, past the 5 minutes a mark may be carried, is skipped and not counted.
  const holeIn = riskUnit(synth({ marks: base.map((v, i) => (i >= 20 && i < 28 ? null : v)) }), t, HOUR);
  assert.ok(near(holeIn.value, 11.7 / 87) && holeIn.starts === 87, JSON.stringify(holeIn));
  const holeOut = riskUnit(synth({ marks: base.map((v, i) => (i >= 100 && i < 108 ? null : v)) }), t, HOUR);
  assert.ok(near(holeOut.value, 11.7 / 87) && holeOut.starts === 87, JSON.stringify(holeOut));
  assert.deepEqual(riskUnit(synth({ marks: base }), S + 60 * MIN, HOUR), { value: null, starts: 0 }); // no exit before 01:00
  assert.throws(() => riskUnit(synth({ marks: base }), t, 30 * MIN), /1, 6, 24 and 72 h/);
});

test('A.0-5\'s risk unit: the window\'s first start is 30 days before the instant\'s minute', () => {
  // 31 days and an hour of minutes at 100, one minute at 200. At day 31 the 1 h starts are minutes
  // 1,440 (30 days back) to 44,579: 43,140 of them.
  const spike = (x) => synth({ marks: Array.from({ length: 31 * 1440 + 60 }, (_, i) => (i === x ? 200 : 100)) });
  const t = S + 31 * DAY;
  const inside = riskUnit(spike(1500), t, HOUR); // starts 1,440 (100 -> 200) and 1,500 (200 -> 100)
  assert.ok(near(inside.value * 43140, 1.5, 1e-9) && inside.starts === 43140, JSON.stringify(inside));
  const edge = riskUnit(spike(1499), t, HOUR); // start 1,439 is outside: only 1,499 (200 -> 100) counts
  assert.ok(near(edge.value * 43140, 0.5, 1e-9) && edge.starts === 43140);
  assert.equal(RISK_DAYS, 30);
});

test('A.0-5\'s risk unit against a direct sum at every horizon', () => {
  const rnd = mulberry32(31);
  let p = 100;
  const marks = Array.from({ length: 35 * 1440 }, (_, i) => { p *= 1 + (rnd() - 0.5) * 0.004; return i % 997 < 7 ? null : p; });
  const mk = synth({ marks });
  const direct = (t, h) => {
    const M = Math.floor(t / MIN) * MIN;
    let s = 0, n = 0;
    for (let x = Math.max(mk.start, M - 30 * DAY); x + h <= M - MIN; x += MIN) {
      const a = markAtMinuteEnd(mk, x), b = markAtMinuteEnd(mk, x + h);
      if (a !== null && b !== null) { s += Math.abs(b / a - 1); n++; }
    }
    return { value: n ? s / n : null, starts: n };
  };
  for (const h of [1, 6, 24, 72].map((x) => x * HOUR)) for (const t of [S + 2 * DAY + 17, S + 20 * DAY, S + 33 * DAY + 59999, S + 35 * DAY]) {
    const got = riskUnit(mk, t, h), want = direct(t, h);
    assert.equal(got.starts, want.starts, `${h} ${t}`);
    if (want.value === null) assert.equal(got.value, null); // 72 h at day 2: no start yet
    else assert.ok(Math.abs(got.value / want.value - 1) < 1e-9, `${h} ${t}: ${got.value} ${want.value}`);
  }
});
