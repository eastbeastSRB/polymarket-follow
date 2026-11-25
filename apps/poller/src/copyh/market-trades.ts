/**
 * Market trades (copyh/rules.md C3, M1): a trade is the two records that
 * share (coin, `tid`, `time`) — a `tid` alone is not unique (external-apis,
 * 2026-11-19). A trade is a market trade when its taker record's
 * `liquidation.method` is not "backstop" and its `dir` is neither
 * "Auto-Deleveraging" nor "Settlement": the backstop's takeover and the
 * engine's deleveraging and settlement prints are prices no follower could
 * trade at. Both records of a trade take the reading of its taker record; a
 * record whose trade's other record is in neither its own file nor the next
 * file in order reads its own fields, and is counted. Within a file the
 * pass pairs its records here; a trade split across two files next to each
 * other is paired after the pass, from the parts' unpaired lists.
 */
import { ADL_DIR, BACKSTOP_METHOD, SETTLEMENT_DIR } from "./design.js";

/** Why a taker record is no market trade, or null when it is one (the precedence: backstop, then ADL, then Settlement). */
export type LeftOut = "backstop" | "adl" | "settlement";
export function leftOutOf(method: string | null, dir: string): LeftOut | null {
  if (method === BACKSTOP_METHOD) return "backstop";
  if (dir === ADL_DIR) return "adl";
  if (dir === SETTLEMENT_DIR) return "settlement";
  return null;
}

/** A record's own reading: true for a market trade's fields. */
export const isMarket = (method: string | null, dir: string): boolean =>
  leftOutOf(method, dir) === null;

/** A record waiting for its trade's other record: where it is, its side of the trade, its own reading. */
export type Waiting = {
  /** The row's place in its writer (its bucket group and index there). */
  readonly at: readonly [group: number, row: number];
  readonly taker: boolean;
  readonly market: boolean;
};

/**
 * A file's trades, paired as its records come: `add` returns the reading the
 * record's trade has so far (its taker's when the pair is complete), and
 * `pairs` gives, for each record that waited, the reading to set once its
 * other record came. What is left at the end is the file's unpaired list.
 */
export class TradePairs {
  private readonly open = new Map<string, Waiting>();
  /** Rows to set once their trade was paired: the reading their taker gives. */
  readonly settled: { at: readonly [number, number]; market: boolean }[] = [];
  /** Trades met with a third record, or with two takers or two makers: listed, never paired. */
  readonly odd: string[] = [];

  /** The key of a record's trade. */
  static keyOf(iid: number, time: number, tid: string): string {
    return `${iid}|${time}|${tid}`;
  }

  /** A record of a trade; its own reading stands until its other record comes. */
  add(key: string, w: Waiting): void {
    const other = this.open.get(key);
    if (other === undefined) {
      this.open.set(key, w);
      return;
    }
    this.open.delete(key);
    if (other.taker === w.taker) {
      this.odd.push(key);
      return;
    }
    const market = other.taker ? other.market : w.market;
    this.settled.push({ at: other.at, market }, { at: w.at, market });
  }

  /** The records still waiting at the file's end: its unpaired list, by key. */
  unpaired(): [key: string, w: Waiting][] {
    return [...this.open];
  }
}
