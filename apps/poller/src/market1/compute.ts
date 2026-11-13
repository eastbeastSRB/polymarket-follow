/**
 * Every line's positions with their prices (rules.md M5–M12), and the named
 * sets the prints read (M12, M13): a pure function of a run's or a look's
 * inputs, so a run, a look and the rehearsal on the old weeks share it.
 */
import type { Market, Research } from "../paper/research.js";
import type { Liq } from "./fills.js";
import {
  baseOf,
  basketWeek,
  blockOf,
  othersMove,
  priceSpot,
  spotsOf,
  type Instants,
  type Position,
  type Quote,
} from "./lines.js";

export type Inputs = {
  kit: Research;
  small: readonly Liq[];
  large: readonly Liq[];
  at: Instants;
  /** The run's END (or END_k): positions with x_in < end are listed. */
  end: number;
  tradable: (iid: number, t: number) => boolean;
  market: (iid: number) => Market | null;
  quote: Quote;
  fee: (iid: number, t: number) => number;
};

/** Every position of every line, priced or pending, in order of t. */
export function computeAll(w: Inputs): Position[] {
  const bases = new Map<number, number[] | null>();
  const base = (iid: number, xIn: number): number | null => {
    if (!bases.has(iid)) {
      const mk = w.market(iid);
      bases.set(iid, mk === null ? null : baseOf(mk, w.at.start, w.end));
    }
    const v = bases.get(iid)?.[blockOf(xIn)];
    return v === undefined || Number.isNaN(v) ? null : v;
  };
  const spots = spotsOf(w.small, w.large, w.at, w.end, w.tradable);
  return spots.map((s) => {
    const p = priceSpot(w.kit, s, w.market, w.quote, w.fee, base);
    if (s.line !== "WAVE") return p;
    const gom = p.priced?.grossOnMarks ?? null;
    const others = othersMove(w.kit, w.market, s.iid, s.xIn, s.xOut);
    return {
      ...p,
      own: gom === null || others === null ? null : gom - s.dir * others,
      basket: basketWeek(w.kit, w.market, s.t),
    };
  });
}

export type Competition = {
  start: number;
  end: number;
  boosted: ReadonlySet<number>;
};

/**
 * The sets the prints read, each with x_out < end: WAVE and its splits (B6,
 * C, S), P, B1 and its selections (B2, B4, B5), B3, B7 by market, B10.
 */
export function namedSets(
  positions: readonly Position[],
  end: number,
  competitions: readonly Competition[],
): Map<string, Position[]> {
  const closed = positions.filter((p) => p.xOut < end);
  const of = (line: string) => closed.filter((p) => p.line === line);
  const wave = of("WAVE");
  const b1 = of("B1");
  const inCompetition = (p: Position) =>
    competitions.some((c) => c.start <= p.t && p.t < c.end);
  const boosted = (p: Position) =>
    competitions.some(
      (c) => c.start <= p.t && p.t < c.end && c.boosted.has(p.iid),
    );
  const sets = new Map<string, Position[]>([
    ["WAVE", wave],
    ["P", of("P")],
    ["B1 EPISODES", b1],
    ["B2 ALONE", b1.filter((p) => p.accounts.length < 2)],
    ["B3 LATE 1 h", of("B3_60")],
    ["B3 LATE 3 h", of("B3_180")],
    ["B4 COINS", b1.filter((p) => p.coins >= 2)],
    ["B5 THREE", b1.filter((p) => p.accounts.length >= 3)],
    ["B6 FORCED SELLS", wave.filter((p) => p.side === -1)],
    ["B6 FORCED BUYS", wave.filter((p) => p.side === 1)],
    ["B7 BTC", of("B7").filter((p) => p.iid === 6)],
    ["B7 ETH", of("B7").filter((p) => p.iid === 7)],
    ["B10 LARGE", of("B10")],
    ["C WITHOUT COMPETITIONS", wave.filter((p) => !inCompetition(p))],
    ["C WITHOUT BOOSTED MARKETS", wave.filter((p) => !boosted(p))],
  ]);
  for (const p of wave) {
    const month = `S ${new Date(p.t).toISOString().slice(0, 7)}`;
    sets.set(month, [...(sets.get(month) ?? []), p]);
  }
  const cell = (p: Position) => {
    const b = p.basket ?? null;
    if (b === null || b === 0) return "S BASKET UNKNOWN";
    return `S BASKET ${b < 0 ? "FELL" : "ROSE"}, FORCED ${p.side === -1 ? "SELLS" : "BUYS"}`;
  };
  for (const p of wave) sets.set(cell(p), [...(sets.get(cell(p)) ?? []), p]);
  return sets;
}
