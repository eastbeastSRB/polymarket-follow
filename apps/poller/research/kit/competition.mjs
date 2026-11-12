// The competition (IDEAS-REVIEW A.0-8): every result is printed again (a)
// without the competition's days and (b) without its boosted markets; a
// result that lives only inside them is "competition only". Competition 1 runs
// 2026-11-02T14:30Z -> 2026-11-16T14:30Z with boosted volume on ANT (3x) and
// AMD, ARM, SOXL (2x) — R1 Q12 (read 2026-11-07), DOCS-SWEEP (read
// 2026-11-09), external-apis; no stored rule-book read holds it. The markets
// are taken by symbol from the rule book (data/rulebook.json). FIND, which ends
// at the cut, sees no other competition; a later one is a kit change.
import { readFileSync } from 'node:fs';
import { KIT_DATA } from './constants.mjs';

export const COMPETITION = {
  start: Date.parse('2026-11-02T14:30:00Z'),
  end: Date.parse('2026-11-16T14:30:00Z'),
  boosted: ['ANT-USD', 'AMD-USD', 'ARM-USD', 'SOXL-USD'],
};

let iids = null; // every instrument id in the rule book, and the boosted ones
function load() {
  if (!iids) {
    const instruments = JSON.parse(readFileSync(new URL('rulebook.json', KIT_DATA), 'utf8')).instruments;
    const boosted = new Set(COMPETITION.boosted.map((s) => {
      const i = instruments.find((x) => x.symbol === s);
      if (!i) throw new Error(`boosted market ${s} is not in the rule book`);
      return i.iid;
    }));
    iids = { all: new Set(instruments.map((i) => i.iid)), boosted };
  }
  return iids;
}

// An instant t in market iid (a study passes the entry's instant, A.0-1):
// days = t inside the competition's window [start, end); boosted = the market
// is one of its boosted markets, whatever the day.
export function inCompetition(iid, t) {
  const { all, boosted } = load();
  if (!all.has(iid)) throw new Error(`instrument ${iid} is not in the rule book`);
  return { days: t >= COMPETITION.start && t < COMPETITION.end, boosted: boosted.has(iid) };
}
