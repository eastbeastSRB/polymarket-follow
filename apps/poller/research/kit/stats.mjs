// Statistics every study uses. Pure functions.
// - R8's cluster bootstrap (entry-weighted and cluster-weighted) and its exact
//   two-sided sign test (stats.mjs f88afbed…5f59), with the share of resampled
//   means at or above zero beside the interval (R8-REVIEW note 1);
// - IDEAS-REVIEW A.0-6: a plain t-test on cluster means (one mean per UTC day,
//   one per trader; the larger p decides), the day-by-day difference and a
//   two-group test on trader means, a rank correlation's permutation p; beside
//   it, the entry-weighted mean with CR1 errors by day and by trader;
// - A.0-11: Holm's step-down with every frozen hypothesis counted in m.

// mulberry32 (R2's lib.mjs rng).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Exact two-sided sign test: k positive of n untied votes under Binomial(n, 1/2).
function logChoose(n, i) { let s = 0; for (let j = 1; j <= i; j++) s += Math.log(n - i + j) - Math.log(j); return s; }
export function signTestP(k, n) {
  if (n <= 0) return 1;
  const pm = Array.from({ length: n + 1 }, (_, i) => Math.exp(logChoose(n, i) - n * Math.LN2));
  let lo = 0, hi = 0;
  for (let i = 0; i <= k; i++) lo += pm[i];
  for (let i = k; i <= n; i++) hi += pm[i];
  return Math.min(1, 2 * Math.min(lo, hi));
}

function clusterSums(items, clusterOf, valueOf) {
  const groups = new Map();
  for (const it of items) {
    const c = String(clusterOf(it));
    const g = groups.get(c) ?? { s: 0, n: 0 };
    g.s += valueOf(it); g.n++;
    groups.set(c, g);
  }
  // Clusters in sorted key order, so a result does not depend on the items' order.
  return [...groups.entries()].sort((x, y) => (x[0] < y[0] ? -1 : x[0] > y[0] ? 1 : 0)).map(([key, g]) => ({ key, ...g }));
}
const percentiles = (st) => ({ lo: st[Math.floor(0.025 * (st.length - 1))], hi: st[Math.ceil(0.975 * (st.length - 1))], atOrAboveZero: st.filter((x) => x >= 0).length / st.length });

// Percentile interval of the entry-weighted mean: resample whole clusters
// with replacement; each resample's statistic is the mean of its entries.
export function clusterBootstrap(items, clusterOf, valueOf, B, seed) {
  const G = clusterSums(items, clusterOf, valueOf);
  const K = G.length;
  const tot = G.reduce((a, g) => ({ s: a.s + g.s, n: a.n + g.n }), { s: 0, n: 0 });
  const rnd = mulberry32(seed);
  const st = new Float64Array(B);
  for (let b = 0; b < B; b++) {
    let s = 0, n = 0;
    for (let i = 0; i < K; i++) { const g = G[Math.floor(rnd() * K)]; s += g.s; n += g.n; }
    st[b] = s / n;
  }
  st.sort();
  return { mean: tot.s / tot.n, ...percentiles(st), clusters: K, n: tot.n };
}

// The same with every cluster weighing the same (the mean of cluster means).
export function clusterMeanBootstrap(items, clusterOf, valueOf, B, seed) {
  const M = clusterSums(items, clusterOf, valueOf).map((g) => g.s / g.n);
  const K = M.length;
  const rnd = mulberry32(seed);
  const st = new Float64Array(B);
  for (let b = 0; b < B; b++) { let s = 0; for (let i = 0; i < K; i++) s += M[Math.floor(rnd() * K)]; st[b] = s / K; }
  st.sort();
  return { mean: M.reduce((s, x) => s + x, 0) / K, ...percentiles(st), clusters: K };
}

// ---- Student's t (two-sided p) through the regularized incomplete beta.
function lgamma(x) {
  const c = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059,
    12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - lgamma(1 - x);
  x -= 1;
  let a = c[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += c[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}
function betaContinuedFraction(a, b, x) {
  const TINY = 1e-300;
  const qab = a + b, qap = a + 1, qam = a - 1;
  let c = 1, d = 1 - (qab * x) / qap;
  if (Math.abs(d) < TINY) d = TINY;
  d = 1 / d;
  let h = d;
  for (let m = 1; m <= 500; m++) {
    const m2 = 2 * m;
    let aa = (m * (b - m) * x) / ((qam + m2) * (a + m2));
    d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d; h *= d * c;
    aa = (-(a + m) * (qab + m) * x) / ((a + m2) * (qap + m2));
    d = 1 + aa * d; if (Math.abs(d) < TINY) d = TINY;
    c = 1 + aa / c; if (Math.abs(c) < TINY) c = TINY;
    d = 1 / d;
    const del = d * c;
    h *= del;
    if (Math.abs(del - 1) < 1e-15) break;
  }
  return h;
}
export function betaRegularized(a, b, x) {
  if (x <= 0) return 0;
  if (x >= 1) return 1;
  const front = Math.exp(lgamma(a + b) - lgamma(a) - lgamma(b) + a * Math.log(x) + b * Math.log(1 - x));
  return x < (a + 1) / (a + b + 2) ? (front * betaContinuedFraction(a, b, x)) / a : 1 - (front * betaContinuedFraction(b, a, 1 - x)) / b;
}
export const tTwoSidedP = (t, df) => (Number.isFinite(t) ? betaRegularized(df / 2, 0.5, df / (df + t * t)) : 0);
// The |t| whose two-sided p is p, by bisection.
export function tCritical(p, df) {
  let lo = 0, hi = 1000;
  for (let i = 0; i < 200; i++) { const mid = (lo + hi) / 2; if (tTwoSidedP(mid, df) > p) lo = mid; else hi = mid; }
  return (lo + hi) / 2;
}

// One-sample t-test that a list's mean is zero.
export function tTest(values) {
  const K = values.length;
  if (K < 2) return { estimate: K ? values[0] : null, se: null, t: null, df: K - 1, p: null, n: K };
  const mean = values.reduce((s, x) => s + x, 0) / K;
  const sd = Math.sqrt(values.reduce((s, x) => s + (x - mean) ** 2, 0) / (K - 1));
  const se = sd / Math.sqrt(K);
  const t = se > 0 ? mean / se : mean === 0 ? 0 : Math.sign(mean) * Infinity;
  return { estimate: mean, se, t, df: K - 1, p: tTwoSidedP(t, K - 1), n: K };
}
export const clusterMeans = (items, clusterOf, valueOf) => clusterSums(items, clusterOf, valueOf).map((g) => g.s / g.n);

// A.0-6: a plain t-test on the day means and on the trader means; p is the larger.
export function twoPValues(items, { dayOf, traderOf, valueOf }) {
  const day = tTest(clusterMeans(items, dayOf, valueOf));
  const trader = tTest(clusterMeans(items, traderOf, valueOf));
  const p = day.p === null || trader.p === null ? null : Math.max(day.p, trader.p);
  return { day, trader, p };
}

// The entry-weighted mean with a cluster-robust standard error (CR1: K / (K - 1)
// times the sum over clusters of the squared sum of their residuals, over N^2)
// and Student's t on K - 1 degrees of freedom (K clusters, N items).
export function cr1Test(items, clusterOf, valueOf) {
  const G = clusterSums(items, clusterOf, valueOf);
  const K = G.length, N = G.reduce((s, g) => s + g.n, 0);
  if (K < 2) return { estimate: N ? G[0].s / N : null, se: null, t: null, df: K - 1, p: null, clusters: K, n: N };
  const mean = G.reduce((s, g) => s + g.s, 0) / N;
  const se = Math.sqrt((K / (K - 1)) * G.reduce((s, g) => s + (g.s - g.n * mean) ** 2, 0)) / N;
  const t = se > 0 ? mean / se : mean === 0 ? 0 : Math.sign(mean) * Infinity;
  return { estimate: mean, se, t, df: K - 1, p: tTwoSidedP(t, K - 1), clusters: K, n: N };
}
// Printed beside every result, deciding nothing (the owner, decisions
// 2026-11-11, question 6): the entry-weighted mean with its CR1 errors by day
// and by trader; p is the larger.
export function entryWeightedCR1(items, { dayOf, traderOf, valueOf }) {
  const day = cr1Test(items, dayOf, valueOf), trader = cr1Test(items, traderOf, valueOf);
  const p = day.p === null || trader.p === null ? null : Math.max(day.p, trader.p);
  return { estimate: day.estimate, day, trader, p };
}

// A difference between two groups (A.0-6): each day with both groups gives
// (day mean of a) - (day mean of b); a t-test on those differences.
export function dayDifferenceTest(a, b, { dayOf, valueOf }) {
  const ma = new Map(clusterSums(a, dayOf, valueOf).map((g) => [g.key, g.s / g.n]));
  const diffs = clusterSums(b, dayOf, valueOf).filter((g) => ma.has(g.key)).map((g) => ma.get(g.key) - g.s / g.n);
  return tTest(diffs);
}
// ... and a two-group (Welch) t-test on the trader means of the two groups.
export function welchTest(x, y) {
  const m = (v) => v.reduce((s, z) => s + z, 0) / v.length;
  const v = (w, mw) => w.reduce((s, z) => s + (z - mw) ** 2, 0) / (w.length - 1);
  if (x.length < 2 || y.length < 2) return { estimate: null, t: null, df: null, p: null };
  const mx = m(x), my = m(y), sx = v(x, mx) / x.length, sy = v(y, my) / y.length;
  const se = Math.sqrt(sx + sy);
  const t = se > 0 ? (mx - my) / se : mx === my ? 0 : Math.sign(mx - my) * Infinity;
  const df = se > 0 ? (sx + sy) ** 2 / (sx ** 2 / (x.length - 1) + sy ** 2 / (y.length - 1)) : x.length + y.length - 2;
  return { estimate: mx - my, se, t, df, p: tTwoSidedP(t, df) };
}

// Ranks with ties at their average rank; Spearman's correlation; and its
// two-sided permutation p (A.0-6: "a permutation of the traders").
export function ranks(a) {
  const idx = a.map((v, i) => [v, i]).sort((x, y) => x[0] - y[0]);
  const r = new Array(a.length);
  for (let i = 0; i < idx.length;) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    for (let k = i; k <= j; k++) r[idx[k][1]] = (i + j) / 2 + 1;
    i = j + 1;
  }
  return r;
}
function pearson(x, y) {
  const n = x.length, mx = x.reduce((s, v) => s + v, 0) / n, my = y.reduce((s, v) => s + v, 0) / n;
  let sxy = 0, sxx = 0, syy = 0;
  for (let i = 0; i < n; i++) { sxy += (x[i] - mx) * (y[i] - my); sxx += (x[i] - mx) ** 2; syy += (y[i] - my) ** 2; }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : 0;
}
export const spearman = (x, y) => pearson(ranks(x), ranks(y));
export function spearmanPermutationP(x, y, nPerm, seed) {
  const rx = ranks(x), ry = ranks(y);
  const obs = Math.abs(pearson(rx, ry));
  const rnd = mulberry32(seed);
  const p = [...ry];
  let atLeast = 0;
  for (let k = 0; k < nPerm; k++) {
    for (let i = p.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; }
    if (Math.abs(pearson(rx, p)) >= obs - 1e-12) atLeast++;
  }
  return { rho: pearson(rx, ry), p: (1 + atLeast) / (nPerm + 1) };
}

// Holm's step-down at level alpha over a batch of m frozen hypotheses
// (A.0-11): the candidates (those pointing FIND's way) in ascending p; the
// i-th (from 0) passes if p <= alpha / (m - i) and every earlier one passed.
// A dropped hypothesis is no candidate but stays in m; m is never lowered.
export function holm(candidates, alpha, m) {
  if (!(m >= candidates.length)) throw new Error(`m = ${m} is below the ${candidates.length} candidates`);
  const passed = [];
  const sorted = [...candidates].sort((a, b) => a.p - b.p);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].p <= alpha / (m - i)) passed.push(sorted[i].id);
    else break;
  }
  return passed;
}
