// FIND-6-EXITS: FIND-6's copies with the trader's exits copied, R8's mirrored
// money on the kit's minute marks (decisions 2026-11-12, "an exploring check:
// FIND-6's copies with the trader's exits copied", points (2)-(5)). Pure
// functions; the run (run.mjs) does the reading.
import { leg } from '../kit/returns.mjs';
import { markAtMinuteEnd } from '../kit/panel.mjs';
import { cr1Test, welchTest, tTwoSidedP } from '../kit/stats.mjs';
import { CUT } from '../kit/constants.mjs';

// R8's mirroredReturn: a copy whose open part is at most this is closed.
export const OPEN_EPS = 1e-12;
// The cut's mark (point 3): the panel's last minute, [CUT - 1 min, CUT); a leg
// to this instant reads its mark, the spread and fee of that instant, and the
// funding of hours up to it, so nothing at or after the cut.
export const CUT_MARK_T = CUT - 1;

// A copy's exits: the kit's buildEntries exits of its entry, each with liq =
// a forced exit whose event holds a liquidation fill (decisions 2026-11-12,
// "the exploring check's Q1": the line beside). liqKeys: liquidationKeys(events).
export const liquidationKeys = (events) => new Set(events.filter((e) => e.liq).map((e) => `${e.iid}|${e.t}|${e.kind}`));
export const exitsOf = (g, liqKeys) => g.exits.map((x) => ({ t: x.t, share: x.share, kind: x.kind, forced: x.forced, liq: x.forced && liqKeys.has(`${g.iid}|${x.t}|${x.kind}`) }));

// The copy's legs (point 2): each exit ({ t, share, kind, forced, liq }, in
// order) closes `share` of what is still open of the copy at its t + D — all
// of it on a liquidation when wholeOnLiquidation (the line beside, Q1);
// h = exit.t - t, so that tIn + h is the exit instant. An exit instant at or
// after the cut ('crossing'), or a part still open after the trader's last
// exit ('open'), is marked at CUT_MARK_T (point 3).
// lastExitT: the trader's time of the last exit the copy used (the crossing
// one included); null when it used none.
export function planCopy({ t, D }, exits, wholeOnLiquidation = false) {
  const tIn = t + D;
  const legs = [];
  let open = 1, flag = null, lastExitT = null;
  for (const x of exits) {
    lastExitT = x.t;
    if (x.t + D >= CUT) { flag = 'crossing'; break; }
    const part = wholeOnLiquidation && x.liq ? open : open * Math.min(1, x.share);
    legs.push({ h: x.t - t, part, kind: x.kind, forced: x.forced, liq: x.liq === true });
    open -= part;
    if (open <= OPEN_EPS) { open = 0; break; }
  }
  if (open > 0) {
    flag ??= 'open';
    legs.push({ h: CUT_MARK_T - tIn, part: open, kind: 'cut', forced: false, liq: false });
  }
  return { legs, flag, lastExitT };
}

// The copy's result: the sum over its legs of part x the kit's leg from tIn
// held h (fees on both legs, spread and depth at each instant, funding on what
// is still open). A leg the kit cannot price leaves the copy unpriced, with
// the reason (point 3: counted, never guessed). fundingMissing: the whole hours
// without a funding row in the longest leg (each leg starts at tIn, so it
// holds every other's), charged nothing (the kit); spreadFallback: a leg's
// spread from its category's mean (the kit).
export function priceCopy(mk, { dir, tIn, legs, setting }) {
  let net = 0, gross = 0, fees = 0, funding = 0, hold = 0, last = 0, fundingMissing = 0, spreadFallback = false;
  for (const L of legs) {
    const r = leg(mk, { dir, tIn, h: L.h, setting });
    if (r === null) return { reason: unpricedReason(mk, tIn, tIn + L.h) };
    net += L.part * r.net; gross += L.part * r.gross; fees += L.part * r.fees; funding += L.part * r.funding;
    hold += L.part * L.h; last = Math.max(last, L.h);
    fundingMissing = Math.max(fundingMissing, r.fundingMissing); spreadFallback ||= r.spreadFallback;
  }
  return { net, gross, fees, funding, hold, fullExit: last, fundingMissing, spreadFallback };
}

export function unpricedReason(mk, tIn, tOut) {
  if (markAtMinuteEnd(mk, tIn) === null) return 'no mark at the follow instant';
  if (markAtMinuteEnd(mk, tOut) === null) return 'no mark at an exit instant';
  return 'a funding settlement without a mark';
}

// FIND-REVIEW-6, F5: an order event whose previous size is not the size the
// event before it on the instrument left (fills missing from the capture).
// events: the kit's toEvents (each instrument's events in chain order).
// Returns Map(event -> its index on its instrument) and the list of breaks.
const SIZE_TOL = 1e-9; // relative: sizes are sums of decimal strings as Numbers
export function chainBreaks(events) {
  const index = new Map(), last = new Map(), count = new Map(), breaks = [];
  for (const e of events) {
    const i = count.get(e.iid) ?? 0;
    index.set(e, i); count.set(e.iid, i + 1);
    if (last.has(e.iid)) {
      const a = last.get(e.iid);
      if (Math.abs(e.prev - a) > SIZE_TOL * Math.max(1, Math.abs(e.prev), Math.abs(a))) breaks.push(e);
    }
    last.set(e.iid, e.after);
  }
  return { index, breaks };
}

// Whether a copy's exit chain crosses a break: a break on its instrument after
// the entry's first event, up to the last exit the copy used (every event at
// that exit's millisecond counted), or to the end of the capture when the
// trader's position was still open there.
export function crossesBreak({ index, breaks }, events, g, plan) {
  const i0 = index.get(g.first);
  let iEnd = Infinity;
  if (plan.flag !== 'open') {
    iEnd = -1;
    for (const e of events) if (e.iid === g.iid && e.t === plan.lastExitT) iEnd = Math.max(iEnd, index.get(e));
    if (iEnd < 0) throw new Error(`no event at the last exit of ${g.iid}|${g.t}`);
  }
  return breaks.some((b) => b.iid === g.iid && index.get(b) > i0 && index.get(b) <= iEnd);
}

// ---- statistics (point 5), in bps; clusters are traders (addr).
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;
const byTrader = (c) => c.addr;

// The mean over copies, each alike, with its CR1 error by trader.
export function meanCR1(copies, valueOf) {
  const items = copies.filter((c) => Number.isFinite(valueOf(c)));
  if (!items.length) return { n: 0, traders: 0, mean: null, se: null, p: null };
  const r = cr1Test(items, byTrader, valueOf);
  return { n: items.length, traders: r.clusters, mean: r.estimate, se: r.se, p: r.p };
}

// The win share, the average win and loss and their ratio (as FIND-6's R9).
export function winLoss(values) {
  const wins = values.filter((x) => x > 0), losses = values.filter((x) => x < 0);
  return { winShare: values.length ? wins.length / values.length : null, avgWin: wins.length ? mean(wins) : null,
    avgLoss: losses.length ? mean(losses) : null, ratio: wins.length && losses.length ? mean(wins) / Math.abs(mean(losses)) : null };
}

// Quantile by linear interpolation between order statistics (type 7).
export function quantile(values, q) {
  if (!values.length) return null;
  const s = [...values].sort((x, y) => x - y);
  const k = (s.length - 1) * q, lo = Math.floor(k), hi = Math.ceil(k);
  return s[lo] + (s[hi] - s[lo]) * (k - lo);
}

// Top minus the rest: Welch's test on the traders' mean values (each trader's
// copies in that group, as FIND-6's netDifference), and the entry-weighted
// difference with a CR1 error by trader — the coefficient of a top indicator
// in a regression on a constant and the indicator, clustered by trader (a
// trader can sit in both groups, one per window), with the kit's CR1 factor
// G / (G - 1) and Student's t on G - 1 degrees of freedom.
export function topMinusRest(top, rest, valueOf) {
  const T = top.filter((c) => Number.isFinite(valueOf(c))), R = rest.filter((c) => Number.isFinite(valueOf(c)));
  const traderMeans = (cs) => {
    const m = new Map();
    for (const c of cs) { const g = m.get(c.addr) ?? { s: 0, n: 0 }; g.s += valueOf(c); g.n++; m.set(c.addr, g); }
    return [...m.values()].map((g) => g.s / g.n);
  };
  const w = welchTest(traderMeans(T), traderMeans(R));
  return { welch: { estimate: w.estimate, se: w.se ?? null, df: w.df, p: w.p }, entryWeighted: cr1Difference(T, R, byTrader, valueOf) };
}

export function cr1Difference(top, rest, clusterOf, valueOf) {
  if (!top.length || !rest.length) return null;
  const mT = mean(top.map(valueOf)), mR = mean(rest.map(valueOf));
  const S = new Map();
  for (const c of top) S.set(clusterOf(c), (S.get(clusterOf(c)) ?? 0) + (valueOf(c) - mT) / top.length);
  for (const c of rest) S.set(clusterOf(c), (S.get(clusterOf(c)) ?? 0) - (valueOf(c) - mR) / rest.length);
  const G = S.size, estimate = mT - mR;
  if (G < 2) return { estimate, se: null, t: null, df: G - 1, p: null, clusters: G };
  const se = Math.sqrt((G / (G - 1)) * [...S.values()].reduce((s, x) => s + x * x, 0));
  const t = se > 0 ? estimate / se : estimate === 0 ? 0 : Math.sign(estimate) * Infinity;
  return { estimate, se, t, df: G - 1, p: tTwoSidedP(t, G - 1), clusters: G };
}

// Point 6: whether a group's mean rests on one or two accounts — the mean
// without the account whose removal moves it most, then without the next.
export function withoutMostInfluential(copies, valueOf, k = 2) {
  let rest = copies.filter((c) => Number.isFinite(valueOf(c)));
  const steps = [];
  for (let i = 0; i < k; i++) {
    const sums = new Map();
    for (const c of rest) { const g = sums.get(c.addr) ?? { s: 0, n: 0 }; g.s += valueOf(c); g.n++; sums.set(c.addr, g); }
    if (sums.size < 2) break;
    const S = rest.reduce((s, c) => s + valueOf(c), 0), N = rest.length, m = S / N;
    let best = null;
    for (const [addr, g] of [...sums.entries()].sort((x, y) => (x[0] < y[0] ? -1 : 1))) {
      const without = (S - g.s) / (N - g.n);
      if (!best || Math.abs(without - m) > Math.abs(best.without - m)) best = { addr, copies: g.n, without };
    }
    steps.push(best);
    rest = rest.filter((c) => c.addr !== best.addr);
  }
  return steps;
}
