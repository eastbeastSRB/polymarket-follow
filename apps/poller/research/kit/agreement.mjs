// Entry 9's agreement events (IDEAS-REVIEW entry 9) and its link tests, the
// definitions first measurement 4 counted with (moved from
// scripts/index-pool.mjs and scripts/m-runs-agree.mjs, unchanged in meaning).
// No visible link between two accounts: (a) fewer than 20 shared trades (R2
// Q3), (b) not the same first three hex digits (a reading of "R2's prefix
// clusters"), (c) no copy pattern — one opening the same market and side
// within 60 s after the other ten times or more, in either order (study 12).
// Pure functions.
import { MIN } from './constants.mjs';

export const pairKey = (a, b) => [a, b].sort().join('|');

// (a) Account pairs sharing 20 or more trades — both sides of a trade carry its
// trade key — from [address, fills] of each account. Returns { a, b, shared }.
export function sharedTradePairs(accounts) {
  const keyAccounts = new Map();
  for (const [a, fills] of accounts) {
    const seen = new Set();
    for (const f of fills) {
      const k = `${f.tid}|${f.iid}|${f.t}`;
      if (seen.has(k)) continue;
      seen.add(k);
      const l = keyAccounts.get(k);
      if (l) l.push(a); else keyAccounts.set(k, [a]);
    }
  }
  const pairCount = new Map();
  for (const l of keyAccounts.values()) if (l.length > 1) for (let i = 0; i < l.length; i++) for (let j = i + 1; j < l.length; j++) { const k = pairKey(l[i], l[j]); pairCount.set(k, (pairCount.get(k) ?? 0) + 1); }
  return [...pairCount].filter(([, c]) => c >= 20).map(([k, c]) => ({ a: k.split('|')[0], b: k.split('|')[1], shared: c }));
}

// (c) Copy-pattern pairs among entries { addr, iid, t, dir } (openings and
// flips): the pair keys where one account opened the same market and side
// within 60 s after the other ten times or more, counted in each order apart.
export function copyPatternPairs(entries) {
  const byMkt = new Map();
  for (const e of [...entries].sort((a, b) => a.t - b.t)) { if (!byMkt.has(e.iid)) byMkt.set(e.iid, []); byMkt.get(e.iid).push(e); }
  const follow = new Map();
  for (const list of byMkt.values()) for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length && list[j].t - list[i].t <= 60000; j++) {
    if (list[j].addr === list[i].addr || list[j].dir !== list[i].dir) continue;
    const k = `${list[i].addr}>${list[j].addr}`;
    follow.set(k, (follow.get(k) ?? 0) + 1);
  }
  const pairs = new Set();
  for (const [k, n] of follow) if (n >= 10) { const [a, b] = k.split('>'); pairs.add(pairKey(a, b)); }
  return pairs;
}

// The visible link between two accounts ('shared trades', 'prefix', 'copy
// pattern') or null, from the pair keys of (a) and (c).
export const linkOf = ({ sharedPairs, copyPairs }) => (a, b) => {
  const k = pairKey(a, b);
  return sharedPairs.has(k) ? 'shared trades' : a.slice(2, 5) === b.slice(2, 5) ? 'prefix' : copyPairs.has(k) ? 'copy pattern' : null;
};

// The events among entries { addr, iid, t, dir } — the caller's population
// (entry 9: P1 entries in primary-cell markets) — with link(a, b) from linkOf.
// An event triggers at an entry when, with it, three or more accounts no two
// of which are linked opened the same side of that market within the 60
// minutes up to it, and no entry of the list opened the other side between the
// first of them and it; on one market, a trigger within 60 minutes of its last
// event is no new event — so an event depends on the entries before it: pass
// every entry and take a period from the events. Returns { events: [{ iid, t,
// dir, accounts }], blocked: { link, opposite } } (candidates stopped).
export function agreementEvents(entries, link) {
  const unlinkedTriple = (accs) => { for (let i = 0; i < accs.length; i++) for (let j = i + 1; j < accs.length; j++) if (!link(accs[i], accs[j])) for (let k = j + 1; k < accs.length; k++) if (!link(accs[i], accs[k]) && !link(accs[j], accs[k])) return true; return false; };
  const events = [], blocked = { link: 0, opposite: 0 };
  const byMkt = new Map();
  for (const e of [...entries].sort((a, b) => a.t - b.t)) { if (!byMkt.has(e.iid)) byMkt.set(e.iid, []); byMkt.get(e.iid).push(e); }
  for (const [iid, list] of byMkt) {
    let last = -Infinity;
    for (let i = 0; i < list.length; i++) {
      const e = list[i];
      if (e.t - last <= 60 * MIN) continue;
      const win = list.filter((x) => x.t >= e.t - 60 * MIN && x.t <= e.t);
      const same = win.filter((x) => x.dir === e.dir);
      const accs = [...new Set(same.map((x) => x.addr))];
      if (accs.length < 3) continue;
      if (!unlinkedTriple(accs)) { blocked.link++; continue; }
      const first = Math.min(...same.map((x) => x.t));
      if (list.some((x) => x.dir !== e.dir && x.t >= first && x.t <= e.t)) { blocked.opposite++; continue; }
      events.push({ iid, t: e.t, dir: e.dir, accounts: accs.length });
      last = e.t;
    }
  }
  return { events, blocked };
}
