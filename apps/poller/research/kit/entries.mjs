// Fills -> order events -> position cycles -> entries, by R8's rules (A4;
// rules.json "entries" and its details), the one definition every study uses.
// R8-PRETEST's lib-r8.mjs (baf5a4da…0e8f) is the source: the logic is kept
// step for step; only names are longer, and R8's flag for its mirrored money
// (reopenedInMerge), which the kit does not compute, is left out. Pure functions.
import { createHash } from 'node:crypto';
import { HOUR, CUT } from './constants.mjs';

const EPS = 1e-9;

// Order events: fills sharing (order_id, previous_size, instrument) — the
// position before the whole matching event (R1 Q4, code-rules). Events of one
// instrument in the same millisecond are put in chain order: each one's
// previous size is the size after the one before, starting from the size
// before the run (for the first run: the event no other event leads to).
export function toEvents(fills) {
  const byKey = new Map();
  for (const f of fills) {
    const k = `${f.oid}|${f.prevS}|${f.iid}`;
    let e = byKey.get(k);
    if (!e) {
      e = { oid: f.oid, iid: f.iid, t: f.t, t1: f.t, prev: f.prev, net: 0, n: 0, notional: 0, forced: false, liq: false, tids: [] };
      byKey.set(k, e);
    }
    e.t = Math.min(e.t, f.t); e.t1 = Math.max(e.t1, f.t);
    e.net += f.sgn * f.q; e.n++;
    e.notional += f.px * f.q;
    if (f.forced) e.forced = true;
    if (f.liq) e.liq = true;
    e.tids.push(f.tid);
  }
  const events = [...byKey.values()];
  for (const e of events) {
    e.after = Math.abs(e.prev + e.net) < EPS ? 0 : e.prev + e.net;
    e.kind = Math.abs(e.prev) < EPS ? 'OPEN' : e.after === 0 ? 'CLOSE'
      : Math.sign(e.after) !== Math.sign(e.prev) ? 'FLIP' : Math.abs(e.after) > Math.abs(e.prev) ? 'ADD' : 'REDUCE';
    e.dir = Math.sign(e.net);
  }
  events.sort((x, y) => x.t - y.t);
  const byInstrument = groupByInstrument(events);
  for (const list of byInstrument.values()) {
    let pos = null; // the size after the previous run (unknown before the first)
    for (let i = 0; i < list.length;) {
      let j = i;
      while (j + 1 < list.length && list[j + 1].t === list[i].t) j++;
      if (j > i) {
        const run = list.slice(i, j + 1);
        let cur = pos;
        if (cur === null) {
          const heads = run.filter((e) => !run.some((o) => o !== e && Math.abs(o.after - e.prev) <= EPS));
          cur = (heads[0] ?? run[0]).prev;
        }
        const ordered = [];
        while (run.length) {
          const k = run.findIndex((e) => Math.abs(e.prev - cur) <= EPS);
          const e = run.splice(k >= 0 ? k : 0, 1)[0];
          ordered.push(e); cur = e.after;
        }
        list.splice(i, j - i + 1, ...ordered);
      }
      pos = list[j].after;
      i = j + 1;
    }
  }
  // Instruments interleave by time; each instrument's order is kept (stable sort).
  return [...byInstrument.values()].flat().sort((x, y) => x.t - y.t);
}

function groupByInstrument(events) {
  const m = new Map();
  for (const e of events) { if (!m.has(e.iid)) m.set(e.iid, []); m.get(e.iid).push(e); }
  return m;
}

// Position cycles per instrument: an OPEN (or a FLIP's new side) to a CLOSE or
// FLIP; start null when the cycle began before the captured events; end null
// while it is open.
export function toCycles(events) {
  const out = [];
  for (const [iid, list] of groupByInstrument(events)) {
    let c = null;
    for (const e of list) {
      if (!c) c = { iid, start: Math.abs(e.prev) < EPS ? e.t : null, dir: Math.sign(Math.abs(e.prev) < EPS ? e.after : e.prev) };
      if (e.kind === 'CLOSE' || e.kind === 'FLIP') {
        c.end = e.t; c.closedBy = e.kind; c.forced = e.forced; out.push(c);
        c = e.kind === 'FLIP' ? { iid, start: e.t, dir: Math.sign(e.after) } : null;
      }
    }
    if (c) { c.end = null; out.push(c); }
  }
  return out;
}

// Entries (A4): each opening from flat (OPEN) and each flip (FLIP) of a
// decision — forced events (liquidation, adl, settlement) are exits only; a
// later non-forced OPEN or ADD on the same instrument in the same direction
// whose first fill is within mergeMs of the group's first fill joins the
// group; any other ADD starts an add group, merged the same way. Each group
// lists the exits that follow it: REDUCE, CLOSE, FLIP or a forced event, with
// the share of the position closed (|prev| - |after|) / |prev|, all of it on a
// close or flip. Returns the groups whose first fill lies in [from, to).
export function buildEntries(events, from, to, mergeMs = 60000) {
  const groups = [];
  for (const [iid, list] of groupByInstrument(events)) {
    let cur = null;  // the latest group on this instrument (for merging)
    let open = [];   // groups whose position is still open
    for (const e of list) {
      const reduces = (Math.abs(e.prev) >= EPS && Math.abs(e.after) < Math.abs(e.prev) - EPS) || e.kind === 'FLIP' || e.kind === 'CLOSE';
      if (reduces) {
        const share = e.kind === 'CLOSE' || e.kind === 'FLIP' ? 1 : (Math.abs(e.prev) - Math.abs(e.after)) / Math.abs(e.prev);
        const side = Math.sign(e.prev);
        for (const g of open) if (g.dir === side) g.exits.push({ t: e.t, share, kind: e.kind, forced: e.forced });
        if (e.kind === 'CLOSE' || e.kind === 'FLIP') open = open.filter((g) => g.dir !== side);
      }
      if (e.forced) continue;
      if (e.kind !== 'OPEN' && e.kind !== 'FLIP' && e.kind !== 'ADD') continue;
      const dir = e.kind === 'ADD' ? Math.sign(e.prev) : Math.sign(e.after);
      if (cur && (e.kind === 'OPEN' || e.kind === 'ADD') && cur.dir === dir && e.t - cur.t <= mergeMs) {
        cur.merged.push(e); cur.tids.push(...e.tids);
        continue;
      }
      const g = { iid, dir, type: e.kind === 'ADD' ? 'ADD' : e.kind, t: e.t, first: e, merged: [], tids: [...e.tids], exits: [] };
      cur = g;
      if (g.t >= from && g.t < to) groups.push(g);
      open.push(g);
    }
  }
  return groups.sort((x, y) => x.t - y.t || x.iid - y.iid);
}

// R8's entry id; the seed of its delay and of any per-entry draw.
export const entryId = (addr, g) => `${addr}|${g.iid}|${g.t}|${g.type}`;

// Deterministic uniform [0, 1) from a seed and a key (SHA-256, 52 bits).
export function hashU(seed, key) {
  const h = createHash('sha256').update(`${seed}|${key}`).digest();
  const hi = h.readUInt32BE(0) >>> 12;
  const lo = h.readUInt32BE(4);
  return (hi * 4294967296 + lo) / 4503599627370496;
}

// The follower's delay (A.0-2; R8 rules.json "delay"): D = U*T + 1.5 s (API
// lag) + 0.3 s (processing) + 0.34 s (notification) + R (to act), U from the
// entry id. Base: T = 33.3 s, R = 60 s, so D lies in [62.14 s, 95.44 s).
export const DELAY_FIXED_MS = 2140;
export const BASE_DELAY = { T: 33300, R: 60000 };
export const delayOf = (id, { T, R } = BASE_DELAY) => hashU('R8-delay-v1', id) * T + DELAY_FIXED_MS + R;
export const maxDelay = ({ T, R } = BASE_DELAY) => T + DELAY_FIXED_MS + R;

// R8's voted rule: an entry is scored only if every leg drawn from its hour
// ends before the cut — the hour's end + the largest delay + h <= CUT.
export const voted = (t, h, delay = BASE_DELAY) => Math.floor(t / HOUR) * HOUR + HOUR + maxDelay(delay) + h <= CUT;

// The horizon class nearest a median holding time on the log scale
// (boundaries sqrt(1*6) h and sqrt(6*24) h); under minClosed closed cycles, 6 h.
export function horizonClass(medianHoldMs, nClosed, minClosed = 10) {
  if (medianHoldMs === null || nClosed < minClosed) return 6 * HOUR;
  const hrs = medianHoldMs / HOUR;
  if (hrs < Math.sqrt(6)) return 1 * HOUR;
  if (hrs < 12) return 6 * HOUR;
  return 24 * HOUR;
}

export const median = (a) => {
  if (!a.length) return null;
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};
