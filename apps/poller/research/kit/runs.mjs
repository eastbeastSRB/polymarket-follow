// Entry 7's runs (IDEAS-REVIEW entry 7), the definition first measurement 3
// counted with (moved from scripts/index-pool.mjs, unchanged in meaning).
// An order is a taker order when at least half its notional was taken (forced
// fills left out); per market and side (buy or sell), an account's taker
// orders in time order with gaps under 10 minutes form a chain; a run is a
// chain in which five consecutive orders lie within 30 minutes; it triggers at
// the earliest such fifth order. One run per chain. Pure function.
import { MIN } from './constants.mjs';

// fills: one account's normalized fills (fills.mjs). Returns { iid, side,
// start, trigger, orders } in trigger order: start = the chain's first order,
// trigger = the order that completes the run, orders = the chain's count; an
// order's instant is its first fill.
export function runsOf(fills) {
  const orders = new Map();
  for (const f of fills) {
    if (f.forced) continue;
    const o = orders.get(f.oid) ?? { iid: f.iid, side: f.sgn, t: f.t, n: 0, tk: 0 };
    o.t = Math.min(o.t, f.t); o.n += f.px * f.q; if (f.taker) o.tk += f.px * f.q;
    orders.set(f.oid, o);
  }
  const by = new Map();
  for (const o of orders.values()) {
    if (!(o.n > 0 && o.tk / o.n >= 0.5)) continue;
    const k = `${o.iid}|${o.side}`;
    if (!by.has(k)) by.set(k, []);
    by.get(k).push(o.t);
  }
  const runs = [];
  for (const [k, ts] of by) {
    ts.sort((a, b) => a - b);
    const [iid, side] = k.split('|').map(Number);
    for (let i = 0; i < ts.length;) {
      let j = i;
      while (j + 1 < ts.length && ts[j + 1] - ts[j] < 10 * MIN) j++;
      for (let q = i + 4; q <= j; q++) if (ts[q] - ts[q - 4] <= 30 * MIN) { runs.push({ iid, side, start: ts[i], trigger: ts[q], orders: j - i + 1 }); break; }
      i = j + 1;
    }
  }
  return runs.sort((a, b) => a.trigger - b.trigger);
}
