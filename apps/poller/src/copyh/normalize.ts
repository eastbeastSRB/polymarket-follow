/**
 * An account's kept fills normalized into the kit's `normFill` fields
 * (copyh/rules.md C3; the kit's `fills.mjs`): t = `time`; iid = the coin's
 * index in `coins.json`; oid and tid their digits as text; **prevS = a
 * taker fill's chain head's `startPosition`** (chains.ts: the chains of its
 * matching event's taker fills) **and a maker fill's own**, as its shortest
 * text, prev its value: each maker fill is its own event, as the paper's
 * order events read them (the supervisor's ruling, 2026-11-26, from
 * COPYH-REPRO's count on the paper's seed: 953,244 events, no entry or P1
 * differing); sgn +1 for "B", −1 for "A"; px and q from `px` and `sz`;
 * fee and pnl 0 (C5: the label never needs pnl); taker = `crossed`; liq =
 * the account's own liquidation leg; forced = liq, or a `dir` of kind
 * `forced`. The chain heads are computed here, when an account is read,
 * never stored (the supervisor's ruling 4).
 */
import { chainHeads } from "./chains.js";
import type { Fill } from "../paper/research.js";
import type { DirKind } from "./dirs.js";

/** One kept record of an account, as the store gives it, in the store's order (time, then the archive's). */
export type Row = {
  readonly time: number;
  readonly iid: number;
  readonly px: number;
  readonly sz: number;
  /** +1 for "B", −1 for "A". */
  readonly side: number;
  readonly startPosition: number;
  readonly oid: string;
  readonly tid: string;
  readonly crossed: boolean;
  /** The record's own liquidation leg (its `liquidatedUser` the account). */
  readonly ownLiquidation: boolean;
  readonly dirKind: DirKind;
};

/** The kit's normalized fill (`normFill`'s fields, as the paper types them). */
export type NormFill = Fill;

/** The rows of one account as the kit's fills, in the rows' order: the taker fills of each matching event (oid, coin, `time`) take their chain heads as prevS, a maker fill its own `startPosition`. */
export function normOf(rows: readonly Row[]): NormFill[] {
  const events = new Map<string, number[]>();
  rows.forEach((r, i) => {
    if (!r.crossed) return;
    const k = `${r.oid}|${r.iid}|${r.time}`;
    const e = events.get(k);
    if (e === undefined) events.set(k, [i]);
    else e.push(i);
  });
  const heads = rows.map((r) => r.startPosition);
  for (const idx of events.values()) {
    const h = chainHeads(idx.map((i) => rows[i]!));
    idx.forEach((i, j) => (heads[i] = h[j]!));
  }
  return rows.map((r, i) => ({
    t: r.time,
    iid: r.iid,
    oid: r.oid,
    tid: r.tid,
    prevS: String(heads[i]),
    prev: heads[i]!,
    sgn: r.side > 0 ? 1 : -1,
    px: r.px,
    q: r.sz,
    fee: 0,
    pnl: 0,
    taker: r.crossed,
    liq: r.ownLiquidation,
    forced: r.ownLiquidation || r.dirKind === "forced",
  }));
}
