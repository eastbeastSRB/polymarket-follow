// The statistics against hand-computed and closed-form values.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signTestP, clusterBootstrap, clusterMeanBootstrap, tTwoSidedP, tCritical, tTest, twoPValues, dayDifferenceTest, welchTest,
  ranks, spearman, spearmanPermutationP, holm, mulberry32, clusterMeans, cr1Test, entryWeightedCR1 } from '../stats.mjs';

const near = (a, b, tol = 1e-9) => Math.abs(a - b) <= tol;

// Exact binomial tails with BigInt, an independent computation.
function exactTwoSided(k, n) {
  const C = (a, b) => { let r = 1n; for (let j = 1n; j <= BigInt(b); j++) r = (r * (BigInt(a) - BigInt(b) + j)) / j; return r; };
  let lo = 0n, hi = 0n;
  for (let i = 0; i <= k; i++) lo += C(n, i);
  for (let i = k; i <= n; i++) hi += C(n, i);
  const m = lo < hi ? lo : hi;
  return Math.min(1, Number((2n * m * 1000000000000n) / 2n ** BigInt(n)) / 1e12);
}

test('the exact sign test', () => {
  assert.ok(near(signTestP(9, 10), 22 / 1024));
  assert.ok(near(signTestP(1, 10), 22 / 1024));
  assert.equal(signTestP(5, 10), 1);
  assert.equal(signTestP(0, 0), 1);
  for (const [k, n] of [[31, 47], [30, 47], [14, 20], [15, 20], [36, 50], [21, 47]]) assert.ok(near(signTestP(k, n), exactTwoSided(k, n), 1e-9), `${k} of ${n}`);
});

test('the cluster bootstrap: entry-weighted, order-free, its interval and the share at or above zero', () => {
  const items = [{ c: 'A', v: 1 }, { c: 'A', v: 1 }, { c: 'B', v: 4 }];
  const bs = clusterBootstrap(items, (x) => x.c, (x) => x.v, 2000, 7);
  assert.ok(near(bs.mean, 2));
  assert.deepEqual([bs.lo, bs.hi, bs.clusters, bs.n, bs.atOrAboveZero], [1, 4, 2, 3, 1]);
  assert.deepEqual(clusterBootstrap([...items].reverse(), (x) => x.c, (x) => x.v, 2000, 7), bs);
  const neg = clusterBootstrap([{ c: 'A', v: -1 }, { c: 'B', v: 1 }], (x) => x.c, (x) => x.v, 4000, 3);
  assert.ok(neg.atOrAboveZero > 0.65 && neg.atOrAboveZero < 0.85, `${neg.atOrAboveZero}`); // P(mean >= 0) = 3/4
  const tw = clusterMeanBootstrap(items, (x) => x.c, (x) => x.v, 2000, 7);
  assert.ok(near(tw.mean, 2.5));
  assert.deepEqual([tw.lo, tw.hi, tw.clusters], [1, 4, 2]);
});

test('Student t: closed forms at 1 and 2 degrees of freedom, table values, the critical value', () => {
  for (const t of [0.3, 1, 2.5, 7, 40]) {
    assert.ok(near(tTwoSidedP(t, 1), 1 - (2 / Math.PI) * Math.atan(t), 1e-12), `df 1, t ${t}`);
    assert.ok(near(tTwoSidedP(t, 2), 1 - t / Math.sqrt(2 + t * t), 1e-12), `df 2, t ${t}`);
  }
  assert.ok(near(tTwoSidedP(2.228138852, 10), 0.05, 1e-8));
  assert.ok(near(tTwoSidedP(3.169272673, 10), 0.01, 1e-8));
  assert.ok(near(tTwoSidedP(2.085963447, 20), 0.05, 1e-8));
  assert.ok(near(tTwoSidedP(1.959963985, 1e7), 0.05, 1e-6));
  assert.equal(tTwoSidedP(0, 7), 1);
  assert.equal(tTwoSidedP(Infinity, 7), 0);
  assert.ok(near(tTwoSidedP(-2.228138852, 10), 0.05, 1e-8));
  for (const [p, df] of [[0.05, 10], [0.005, 22], [0.0004, 22], [0.045, 41], [0.0038, 41]]) assert.ok(near(tTwoSidedP(tCritical(p, df), df), p, 1e-10), `${p} ${df}`);
  assert.ok(near(tCritical(0.05, 10), 2.228138852, 1e-7));
});

test('the one-sample t-test and A.0-6\'s two p-values on cluster means', () => {
  const r = tTest([1, 2]);
  assert.ok(near(r.estimate, 1.5) && near(r.se, 0.5) && near(r.t, 3) && r.df === 1 && near(r.p, 1 - (2 / Math.PI) * Math.atan(3), 1e-12));
  assert.deepEqual(tTest([5]), { estimate: 5, se: null, t: null, df: 0, p: null, n: 1 });
  assert.equal(tTest([2, 2, 2]).p, 0);
  assert.equal(tTest([0, 0]).p, 1);
  // Days d1 (values 1, 3), d2 (5); traders A (1, 5), B (3).
  const items = [{ d: 'd1', tr: 'A', v: 1 }, { d: 'd1', tr: 'B', v: 3 }, { d: 'd2', tr: 'A', v: 5 }];
  assert.deepEqual(clusterMeans(items, (x) => x.d, (x) => x.v), [2, 5]);
  const two = twoPValues(items, { dayOf: (x) => x.d, traderOf: (x) => x.tr, valueOf: (x) => x.v });
  const day = tTest([2, 5]), trader = tTest([3, 3]);
  assert.ok(near(two.day.p, day.p) && near(two.trader.p, trader.p));
  assert.equal(two.p, Math.max(day.p, trader.p));
  assert.equal(twoPValues([items[0]], { dayOf: (x) => x.d, traderOf: (x) => x.tr, valueOf: (x) => x.v }).p, null);
});

test('the entry-weighted mean with CR1 errors (question 6\'s beside-print): a hand-worked example', () => {
  // Clusters A (1, 3), B (5), C (2, 2, 8): N = 6, mean 21 / 6 = 3.5; the clusters' residual sums
  // -3, 1.5, 1.5; CR1 variance (3 / 2) x (9 + 2.25 + 2.25) / 6^2 = 0.5625, se 0.75; t 14 / 3 on 2 df.
  const items = [['A', 1], ['A', 3], ['B', 5], ['C', 2], ['C', 2], ['C', 8]].map(([c, v]) => ({ c, v }));
  const r = cr1Test(items, (x) => x.c, (x) => x.v);
  assert.ok(near(r.estimate, 3.5) && near(r.se, 0.75) && near(r.t, 14 / 3) && r.df === 2 && r.clusters === 3 && r.n === 6, JSON.stringify(r));
  assert.ok(near(r.p, 1 - (14 / 3) / Math.sqrt(2 + (14 / 3) ** 2), 1e-12));
  assert.deepEqual(cr1Test([...items].reverse(), (x) => x.c, (x) => x.v), r);
  // One item a cluster: CR1 is the plain standard error.
  const vals = [0.3, -1.2, 2.5, 0.7, 1.1];
  const one = cr1Test(vals.map((v, i) => ({ c: i, v })), (x) => x.c, (x) => x.v), plain = tTest(vals);
  assert.ok(near(one.se, plain.se, 1e-15) && near(one.p, plain.p, 1e-15) && one.df === plain.df);
  assert.deepEqual(cr1Test([{ c: 'A', v: 2 }, { c: 'A', v: 4 }], (x) => x.c, (x) => x.v), { estimate: 3, se: null, t: null, df: 0, p: null, clusters: 1, n: 2 });
  // By day and by trader; p is the larger. Days d1 (1, 3), d2 (5, 7); traders A (1, 5), B (3, 7).
  const two = [{ d: 'd1', tr: 'A', v: 1 }, { d: 'd1', tr: 'B', v: 3 }, { d: 'd2', tr: 'A', v: 5 }, { d: 'd2', tr: 'B', v: 7 }];
  const ew = entryWeightedCR1(two, { dayOf: (x) => x.d, traderOf: (x) => x.tr, valueOf: (x) => x.v });
  // Mean 4. By day: residual sums -4, 4 -> (2 / 1) x 32 / 16 = 4, se 2, t 2 on 1 df; by trader: -2, 2 -> se 1, t 4.
  assert.ok(near(ew.estimate, 4) && near(ew.day.se, 2) && near(ew.trader.se, 1) && ew.day.df === 1 && ew.trader.df === 1);
  assert.ok(near(ew.day.p, 1 - (2 / Math.PI) * Math.atan(2), 1e-12) && near(ew.trader.p, 1 - (2 / Math.PI) * Math.atan(4), 1e-12));
  assert.equal(ew.p, Math.max(ew.day.p, ew.trader.p));
  assert.equal(entryWeightedCR1([two[0], two[1]], { dayOf: (x) => x.d, traderOf: (x) => x.tr, valueOf: (x) => x.v }).p, null);
});

test('a difference between two groups: by day, and Welch on trader means', () => {
  const a = [{ d: 'd1', v: 1 }, { d: 'd1', v: 3 }, { d: 'd2', v: 5 }];
  const b = [{ d: 'd1', v: 1 }, { d: 'd2', v: 2 }, { d: 'd2', v: 4 }, { d: 'd3', v: 9 }];
  const dd = dayDifferenceTest(a, b, { dayOf: (x) => x.d, valueOf: (x) => x.v });
  assert.ok(near(dd.estimate, 1.5) && dd.n === 2 && near(dd.t, 3));
  const w = welchTest([1, 2, 3, 4], [2, 4, 6, 8, 10]);
  const sx = (5 / 3) / 4, sy = 10 / 5;
  assert.ok(near(w.estimate, -3.5) && near(w.se, Math.sqrt(sx + sy)) && near(w.t, -3.5 / Math.sqrt(sx + sy)));
  assert.ok(near(w.df, (sx + sy) ** 2 / (sx ** 2 / 3 + sy ** 2 / 4)));
  assert.ok(near(w.p, tTwoSidedP(w.t, w.df)));
  assert.equal(welchTest([1], [2, 3]).p, null);
});

test('ranks with ties, Spearman, and its permutation p', () => {
  assert.deepEqual(ranks([5, 6, 7, 8, 7]), [1, 2, 3.5, 5, 3.5]);
  assert.ok(near(spearman([1, 2, 3, 4, 5], [5, 6, 7, 8, 7]), 8 / Math.sqrt(95), 1e-12));
  assert.ok(near(spearman([1, 2, 3], [3, 2, 1]), -1));
  // Ten points in order: no permutation of 1,000 reaches |rho| = 1 (chance 2 / 10!), so p = 1 / 1,001.
  const perfect = spearmanPermutationP([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 1000, 9);
  assert.ok(near(perfect.rho, 1) && perfect.p === 1 / 1001, `${perfect.p}`);
  const rnd = mulberry32(4);
  const x = Array.from({ length: 60 }, () => rnd()), y = Array.from({ length: 60 }, () => rnd());
  const nul = spearmanPermutationP(x, y, 2000, 5);
  assert.ok(nul.p > 0.05, `${nul.p}`);
  assert.deepEqual(spearmanPermutationP(x, y, 2000, 5), nul);
});

test('Holm: A.0-11\'s worked example, a dropped hypothesis kept in m, and m never below the candidates', () => {
  const c = [{ id: 'a', p: 0.0046 }, { id: 'b', p: 0.03 }, { id: 'c', p: 0.2 }, { id: 'd', p: 0.6 }];
  assert.deepEqual(holm(c, 0.045, 5), ['a']);
  assert.deepEqual(holm(c, 0.045, 4), ['a']);
  // m = 5 (a third, dropped hypothesis counted): b faces 0.045 / 4 = 0.01125 and fails;
  // with m = 4 it would face 0.045 / 3 = 0.015 and pass.
  assert.deepEqual(holm([{ id: 'b', p: 0.0113 }, { id: 'a', p: 0.009 }], 0.045, 5), ['a']);
  assert.deepEqual(holm([{ id: 'b', p: 0.0113 }, { id: 'a', p: 0.009 }], 0.045, 4), ['a', 'b']);
  assert.deepEqual(holm([{ id: 'a', p: 0.0091 }], 0.045, 5), []);
  // It stops at the first failure: b (0.0105 <= 0.045 / 4) would pass on its own, but a failed first.
  assert.deepEqual(holm([{ id: 'a', p: 0.01 }, { id: 'b', p: 0.0105 }], 0.045, 5), []);
  assert.throws(() => holm(c, 0.045, 3));
});
