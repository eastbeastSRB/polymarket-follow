// One leg priced by the minute (A.0-2, A.0-3): the follower enters at the mark
// at the end of the minute that holds tIn and leaves at the mark at the end of
// the minute that holds tIn + h; it buys at mark x (1 + c) and sells at
// mark x (1 - c) (c: the setting's spread and depth at that leg's instant);
// the setting's fee on both legs; funding of every settlement whose nominal
// hour lies in (tIn, tIn + h], at the mark at the end of the minute before it
// (positive rate: longs pay). As R8's legReturn, on minute marks.
// Returns null when a mark is missing (unpriced).
// And A.0-5's risk unit, by the same minute convention.
import { markAtMinuteEnd, fundingBetween } from './panel.mjs';
import { MIN, HOUR, DAY } from './constants.mjs';

export function leg(mk, { dir, tIn, h, setting }) {
  const tOut = tIn + h;
  const markIn = markAtMinuteEnd(mk, tIn), markOut = markAtMinuteEnd(mk, tOut);
  if (markIn === null || markOut === null) return null;
  const f = fundingBetween(mk, tIn, tOut);
  if (Number.isNaN(f.sum)) return null;
  const cIn = setting.spread(mk.iid, tIn), cOut = setting.spread(mk.iid, tOut);
  const pIn = markIn * (1 + dir * cIn.c), pOut = markOut * (1 - dir * cOut.c);
  const gross = (dir * (markOut - markIn)) / markIn;
  const fees = setting.fee(mk.iid, tIn) + (setting.fee(mk.iid, tOut) * pOut) / pIn;
  const funding = (-dir * f.sum) / pIn;
  return { gross, net: (dir * (pOut - pIn)) / pIn - fees + funding, fees, funding, fundingMissing: f.missing, spreadFallback: cIn.fallback || cOut.fallback };
}

// A.0-5's risk unit (d in risk units = d / value): the market's mean absolute
// h-return over the 30 days of whole minutes before the minute that holds t
// (t: the entry's instant, A.0-1) — every start minute s that lies in them with
// its exit minute s + h, the return as a leg's gross (the mark at the end of
// minute s to the mark at the end of minute s + h), a start without either mark
// skipped. Returns { value, starts } (value null when no start is priced).
export const RISK_DAYS = 30;
export const RISK_HORIZONS = [1, 6, 24, 72].map((x) => x * HOUR);
const riskSums = new WeakMap(); // mk -> Map(h -> prefix sums over start minutes)
export function riskUnit(mk, t, h) {
  if (!RISK_HORIZONS.includes(h)) throw new Error(`no risk unit at ${h / HOUR} h: A.0-5's horizons are 1, 6, 24 and 72 h`);
  if (!riskSums.has(mk)) riskSums.set(mk, new Map());
  const byH = riskSums.get(mk);
  if (!byH.has(h)) {
    const sum = new Float64Array(mk.n), starts = new Int32Array(mk.n);
    let s = 0, c = 0;
    for (let i = 0; i < mk.n; i++) {
      const a = markAtMinuteEnd(mk, mk.start + i * MIN), b = markAtMinuteEnd(mk, mk.start + i * MIN + h);
      if (a !== null && b !== null) { s += Math.abs(b / a - 1); c++; }
      sum[i] = s; starts[i] = c;
    }
    byH.set(h, { sum, starts });
  }
  const { sum, starts } = byH.get(h);
  const M = Math.floor(t / MIN) * MIN;
  const lo = Math.max(0, (M - RISK_DAYS * DAY - mk.start) / MIN), hi = Math.min(mk.n - 1, (M - MIN - h - mk.start) / MIN);
  if (hi < lo) return { value: null, starts: 0 };
  const n = starts[hi] - (lo > 0 ? starts[lo - 1] : 0);
  return { value: n ? (sum[hi] - (lo > 0 ? sum[lo - 1] : 0)) / n : null, starts: n };
}
