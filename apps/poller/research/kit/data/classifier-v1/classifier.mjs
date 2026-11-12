// R2-STYLE style classifier — pure functions over one account's fills.
// Implements label-definitions.md v1 (frozen 2026-11-07, sha256 29df3f0c…)
// with the thresholds of a params file (classifier-v1.json). Fills only — the
// same input R2-LABELS labels from. No holdout guard here on purpose: the
// supervisor runs it on the holdout through label-accounts.mjs; R2's own
// runs go through that script's guard.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';

const HOUR = 3600000;
const DAY = 86400000;

// One account's stored fills file (one gzip member per page). Numbered pages
// only: window samples ("w<k>") lie before the contiguous capture.
export function readFillsFile(path) {
  const pages = gunzipSync(readFileSync(path)).toString('utf8').split('\n').filter(Boolean)
    .map((l) => JSON.parse(l)).filter((p) => p.status === 200 && Array.isArray(p.body?.data) && typeof p.page === 'number');
  pages.sort((a, b) => a.page - b.page);
  const seen = new Set();
  const fills = [];
  for (const p of pages) {
    for (const x of p.body.data) {
      const k = `${x.trade_id}|${x.instrument_id}|${x.timestamp}`;
      if (seen.has(k)) continue;
      seen.add(k);
      fills.push({
        t: x.timestamp, iid: x.instrument_id, oid: x.order_id, prevS: x.previous_size, prev: Number(x.previous_size),
        sgn: x.side === 'long' ? 1 : -1, px: Number(x.price), q: Number(x.quantity), fee: Number(x.fee), pnl: Number(x.pnl),
        taker: x.taker === true, forced: x.liquidation === true || x.adl === true || x.settlement === true,
      });
    }
  }
  fills.sort((a, b) => a.t - b.t);
  const last = pages.at(-1);
  return { fills, pages: pages.length, truncated: last ? last.body.more === true : false, oldest: fills.length ? fills[0].t : null };
}

const EPS = 1e-9;
// Order events: fills sharing (order_id, previous_size, instrument) — the state
// before the whole order event (R1 Q4). Inside one millisecond, chained by size.
function toEvents(fills) {
  const m = new Map();
  for (const f of fills) {
    const k = `${f.oid}|${f.prevS}|${f.iid}`;
    let e = m.get(k);
    if (!e) { e = { oid: f.oid, iid: f.iid, t: f.t, t1: f.t, prev: f.prev, net: 0, maker: 0, taker: 0, notional: 0, makerNotional: 0, pnl: 0, forced: false }; m.set(k, e); }
    e.t = Math.min(e.t, f.t); e.t1 = Math.max(e.t1, f.t);
    e.net += f.sgn * f.q;
    const n = f.px * f.q;
    e.notional += n; e.pnl += f.pnl;
    if (f.taker) e.taker++; else { e.maker++; e.makerNotional += n; }
    if (f.forced) e.forced = true;
  }
  const ev = [...m.values()];
  for (const e of ev) {
    e.after = Math.abs(e.prev + e.net) < EPS ? 0 : e.prev + e.net;
    e.kind = Math.abs(e.prev) < EPS ? 'OPEN' : e.after === 0 ? 'CLOSE'
      : Math.sign(e.after) !== Math.sign(e.prev) ? 'FLIP' : Math.abs(e.after) > Math.abs(e.prev) ? 'ADD' : 'REDUCE';
    e.dir = Math.sign(e.net);
  }
  ev.sort((x, y) => x.t - y.t);
  const byI = new Map();
  for (const e of ev) { if (!byI.has(e.iid)) byI.set(e.iid, []); byI.get(e.iid).push(e); }
  for (const list of byI.values()) {
    for (let i = 0; i < list.length - 1; i++) {
      if (list[i + 1].t !== list[i].t || Math.abs(list[i + 1].prev - list[i].after) <= EPS) continue;
      const j = list.findIndex((e, k) => k > i + 1 && e.t === list[i].t && Math.abs(e.prev - list[i].after) <= EPS);
      if (j > 0) [list[i + 1], list[j]] = [list[j], list[i + 1]];
    }
  }
  return [...byI.values()].flat().sort((x, y) => x.t - y.t);
}

// Position cycles per instrument over the contiguous capture.
function toCycles(events) {
  const byI = new Map();
  for (const e of events) { if (!byI.has(e.iid)) byI.set(e.iid, []); byI.get(e.iid).push(e); }
  const out = [];
  for (const [iid, list] of byI) {
    let c = null;
    for (const e of list) {
      if (!c) c = { iid, start: Math.abs(e.prev) < EPS ? e.t : null, notional: 0, pnl: 0 };
      c.notional += e.notional; c.pnl += e.pnl;
      if (e.kind === 'CLOSE' || e.kind === 'FLIP') {
        c.end = e.t; out.push(c);
        c = e.kind === 'FLIP' ? { iid, start: e.t, notional: 0, pnl: 0 } : null;
      }
    }
    if (c) { c.end = null; out.push(c); }
  }
  return out;
}

const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); const m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
const quant = (a, p) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.round(p * (s.length - 1)))]; };

// Features of one account in [from, to). `cap` = readFillsFile's result.
export function features(cap, from, to, P) {
  const covFrom = cap.truncated && cap.oldest !== null ? Math.max(from, cap.oldest) : from;
  const f = { coveredDays: Math.max(0, to - covFrom) / DAY, coverage: Math.max(0, to - covFrom) / (to - from), truncated: cap.truncated };
  const win = cap.fills.filter((x) => x.t >= from && x.t < to);
  f.nFills = win.length;
  f.nForced = win.filter((x) => x.forced).length;
  if (!win.length) return f;
  const allEv = toEvents(cap.fills);
  const evW = allEv.filter((e) => e.t >= from && e.t < to);
  const dec = evW.filter((e) => !e.forced);
  f.nEvents = dec.length;
  // Orders and action groups (decisions).
  const om = new Map();
  for (const e of dec) {
    const o = om.get(e.oid) ?? { iid: e.iid, dir: e.dir, t: e.t, t1: e.t1, size: 0, maker: 0, taker: 0, notional: 0 };
    o.t = Math.min(o.t, e.t); o.t1 = Math.max(o.t1, e.t1); o.size += Math.abs(e.net);
    o.maker += e.maker; o.taker += e.taker; o.notional += e.notional;
    om.set(e.oid, o);
  }
  const orders = [...om.values()].sort((x, y) => x.t - y.t);
  f.nOrders = orders.length;
  const groups = [];
  const lastG = new Map();
  for (const o of orders) {
    const g = lastG.get(o.iid);
    if (g && g.dir === o.dir && o.t - g.t1 <= P.groupGapMs) { g.t1 = Math.max(g.t1, o.t1); g.size += o.size; g.n++; }
    else { const ng = { iid: o.iid, dir: o.dir, t: o.t, t1: o.t1, size: o.size, n: 1 }; groups.push(ng); lastG.set(o.iid, ng); }
  }
  f.nGroups = groups.length;
  // "One pattern repeated on several instruments" at machine speed: windows of
  // basketMs in which orders touch basketInstruments or more instruments.
  let baskets = 0;
  for (let i = 0; i < orders.length;) {
    const ins = new Set();
    let j = i;
    while (j < orders.length && orders[j].t - orders[i].t < P.basketMs) { ins.add(orders[j].iid); j++; }
    if (ins.size >= P.basketInstruments) { baskets++; i = j; } else i++;
  }
  f.basketBursts = baskets;
  // "Many decisions an hour for hours on end": clock hours holding at least
  // busyHourDecisions decisions (a 14-day average would dilute a bot's bursts).
  const perHour = new Map();
  for (const g of groups) { const h = Math.floor(g.t / HOUR); perHour.set(h, (perHour.get(h) ?? 0) + 1); }
  f.busyHours = [...perHour.values()].filter((n) => n >= P.busyHourDecisions).length;
  f.peakHour = Math.max(...perHour.values());
  const spanDays = Math.max(f.coveredDays, 1 / 24);
  f.ordersPerDay = orders.length / spanDays;
  f.groupsPerDay = groups.length / spanDays;
  // Maker activity and its two-sidedness.
  const notional = dec.reduce((s, e) => s + e.notional, 0);
  f.makerShare = notional > 0 ? dec.reduce((s, e) => s + e.makerNotional, 0) / notional : 0;
  const mk = orders.filter((o) => o.maker > o.taker);
  f.makerOrders = mk.length;
  let sw = 0, pairs = 0;
  const lastMk = new Map();
  for (const o of mk) { if (lastMk.has(o.iid)) { pairs++; if (lastMk.get(o.iid) !== o.dir) sw++; } lastMk.set(o.iid, o.dir); }
  f.makerSwitch = pairs >= P.minMakerPairs ? sw / pairs : null;
  // Fixed clip across decisions (action groups).
  if (groups.length >= P.minGroupsForClip) {
    const cnt = new Map();
    for (const g of groups) { const k = `${g.iid}|${g.size.toPrecision(6)}`; cnt.set(k, (cnt.get(k) ?? 0) + 1); }
    const best = new Map();
    for (const [k, n] of cnt) { const i = k.split('|')[0]; best.set(i, Math.max(best.get(i) ?? 0, n)); }
    f.clipShare = [...best.values()].reduce((s, n) => s + n, 0) / groups.length;
  } else f.clipShare = null;
  // Timing: gap regularity of group starts inside sessions; quiet hours of the day.
  const gs = groups.map((g) => g.t);
  const gaps = gs.slice(1).map((t, i) => t - gs[i]).filter((g) => g > 0 && g <= 4 * HOUR);
  f.gapReg = gaps.length >= P.minGapsForReg ? quant(gaps, 0.95) / quant(gaps, 0.5) : null;
  if (f.coveredDays >= P.minDaysForHours && groups.length >= P.minGroupsForHours) {
    const h = new Array(24).fill(0);
    for (const g of groups) h[new Date(g.t).getUTCHours()]++;
    let best = 0, run = 0;
    for (let i = 0; i < 48; i++) { if (h[i % 24] === 0) { run++; best = Math.max(best, run); } else run = 0; }
    f.quietHours = Math.min(best, 24);
  } else f.quietHours = null;
  // Book: positions held at once and how rarely positions open or close.
  const size = new Map();
  let maxPos = 0;
  for (const e of allEv) {
    if (e.t >= to) break;
    if (!size.has(e.iid)) size.set(e.iid, e.prev);
    size.set(e.iid, e.after);
    if (e.t >= from) maxPos = Math.max(maxPos, [...size.values()].filter((x) => x !== 0).length);
  }
  f.maxPositions = maxPos;
  f.openCloseShare = dec.length ? dec.filter((e) => e.kind !== 'ADD' && e.kind !== 'REDUCE').length / dec.length : null;
  f.instruments = new Set(dec.map((e) => e.iid)).size;
  // Cycles closed in the covered window; flat round trips of seconds.
  const cyc = toCycles(allEv).filter((c) => c.end !== null && c.end >= covFrom && c.end < to && c.start !== null);
  f.closedCycles = cyc.length;
  const holds = cyc.map((c) => c.end - c.start);
  f.holdMedianMs = median(holds);
  const fast = cyc.filter((c) => c.end - c.start < P.fastMs);
  f.fastCount = fast.length;
  f.fastShare = cyc.length ? fast.length / cyc.length : null;
  // Gross PnL of the quick round trips, in basis points of the side's notional.
  f.fastAbsPnlBp = median(fast.filter((c) => c.notional > 0).map((c) => (1e4 * Math.abs(c.pnl)) / (c.notional / 2)));
  const open = toCycles(allEv).filter((c) => c.end === null && c.start !== null && c.start < to);
  f.openAgeMedianMs = median(open.map((c) => to - c.start));
  return f;
}

// The rules, in the definitions' order (§5). Returns { label, horizon, reason }.
export function classify(f, P) {
  if (!f.nFills) return { label: 'no fills in window', horizon: '', reason: 'dormant' };
  if (!f.nGroups || f.nGroups < P.minGroups) return { label: 'unclassified — too few', horizon: '', reason: `${f.nGroups ?? 0} decisions` };
  const strong = [], weak = [];
  // Market maker.
  if (f.makerShare >= P.mm.makerShare && f.makerOrders >= P.mm.minMakerOrders && f.makerSwitch !== null && f.makerSwitch >= P.mm.makerSwitch) {
    return { label: 'market maker', horizon: '', reason: `maker ${pc(f.makerShare)}, switches ${pc(f.makerSwitch)} of ${f.makerOrders} maker orders` };
  }
  if (f.makerShare >= P.gray.makerShare && f.makerSwitch !== null && f.makerSwitch >= P.gray.makerSwitch) weak.push(`maker ${pc(f.makerShare)} two-sided ${pc(f.makerSwitch)}`);
  // Algorithm: strong signs.
  if (f.groupsPerDay >= P.alg.groupsPerDay) strong.push(`${f.groupsPerDay.toFixed(0)} decisions/day`);
  if (f.busyHours >= P.alg.minBusyHours) strong.push(`${f.busyHours} hours with ${P.busyHourDecisions}+ decisions`);
  if (f.basketBursts >= P.alg.minBaskets) strong.push(`${f.basketBursts} baskets (${P.basketInstruments}+ instruments within ${P.basketMs / 1000} s)`);
  if (f.quietHours !== null && f.quietHours <= P.alg.quietHours && f.groupsPerDay >= P.alg.groupsPerDayRoundClock) strong.push(`round the clock (${f.quietHours} quiet h)`);
  if (f.clipShare !== null && f.clipShare >= P.alg.clipShare && f.groupsPerDay >= P.alg.groupsPerDayClip) strong.push(`fixed clip ${pc(f.clipShare)}`);
  if (f.maxPositions >= P.alg.bookPositions && f.openCloseShare !== null && f.openCloseShare <= P.alg.bookOpenClose && f.nEvents >= P.alg.bookMinEvents) strong.push(`book of ${f.maxPositions}, opens/closes ${pc(f.openCloseShare)}`);
  if (f.closedCycles >= P.alg.mechMinCycles && f.fastShare >= P.alg.mechFastShare && f.clipShare !== null && f.clipShare >= P.alg.mechClip) strong.push('mechanical round trips');
  if (strong.length) return { label: 'algorithm', horizon: '', reason: strong.join('; ') };
  // Churner: most round trips closed within seconds, gross PnL near zero, not maker.
  if (f.fastCount >= P.churn.minFast && f.fastShare >= P.churn.fastShare && f.fastAbsPnlBp !== null
    && f.fastAbsPnlBp <= P.churn.maxAbsPnlBp && f.makerShare < P.churn.maxMakerShare) {
    return { label: 'churner', horizon: '', reason: `${f.fastCount} of ${f.closedCycles} cycles closed within ${P.fastMs / 1000} s, median |gross pnl| ${f.fastAbsPnlBp.toFixed(1)} bp` };
  }
  // The gray zone: any weaker sign → unclassified — mixed (in doubt, never directional).
  if (f.groupsPerDay >= P.gray.groupsPerDay) weak.push(`${f.groupsPerDay.toFixed(0)} decisions/day`);
  if (f.busyHours >= P.gray.minBusyHours) weak.push(`${f.busyHours} busy hours`);
  if (f.quietHours !== null && f.quietHours <= P.gray.quietHours) weak.push(`${f.quietHours} quiet h`);
  if (f.clipShare !== null && f.clipShare >= P.gray.clipShare) weak.push(`clip ${pc(f.clipShare)}`);
  if (f.maxPositions >= P.gray.bookPositions && f.openCloseShare !== null && f.openCloseShare <= P.gray.bookOpenClose) weak.push(`book of ${f.maxPositions}`);
  if (f.maxPositions >= P.gray.manyPositions) weak.push(`${f.maxPositions} positions at once`);
  if (f.peakHour >= P.gray.peakHour) weak.push(`${f.peakHour} decisions in one hour`);
  if (f.basketBursts >= P.gray.minBaskets) weak.push(`${f.basketBursts} basket burst(s)`);
  if (f.fastCount >= P.gray.minFast && f.fastShare >= P.gray.fastShare) weak.push(`${f.fastCount} round trips of seconds`);
  if (f.gapReg !== null && f.gapReg <= P.gray.gapReg) weak.push(`regular gaps (${f.gapReg.toFixed(1)})`);
  if (weak.length) return { label: 'unclassified — mixed', horizon: '', reason: weak.join('; ') };
  return { label: 'directional', horizon: horizonOf(f, P), reason: `${f.nGroups} decisions, maker ${pc(f.makerShare)}, ${f.closedCycles} closed cycles` };
}

function horizonOf(f, P) {
  const h = f.holdMedianMs ?? f.openAgeMedianMs;
  if (h === null || h === undefined) return 'unknown';
  const tag = f.holdMedianMs === null ? ' (open, at least)' : '';
  const b = P.horizonMs;
  return (h < b.scalp ? 'scalp' : h < b.intraday ? 'intraday' : h < b.swing ? 'swing' : 'position') + tag;
}
const pc = (x) => `${Math.round(100 * x)}%`;
