/**
 * The judgement reading and the edge over the market (copyh/rules.md C10;
 * d's null reasons, C11).
 * - d (R10 unchanged): the kit's `dAgainstNull(mk, {dir, t, D, h: 24 h,
 *   longShare, removed})` × 10⁴ on C9's market object, the copy's gross
 *   over 24 h from t + D less the exact matched null's gross (every market
 *   trade of t's coin and UTC hour equally likely, by the object's minute
 *   counts, followed after the same D, long with the long share). The long
 *   share is the habits' at M; a null one leaves d null, "no long share",
 *   beside the kit's three reasons (the paper's scorer).
 * - removed: the kit's `removalOf` over the records, in the week of M cut
 *   at END, of every account in the copy's line at M, their market trades'
 *   records only (M1), so that a trade between two of them counts once by
 *   (coin, `tid`, `time`), whichever bucket holds each record; read back at
 *   every minute that holds one, a table a part can keep. The cut changes
 *   nothing (only the entry's own UTC hour is read) and keeps S closed at
 *   step 1.
 * - Voted by END: ⌊t / 1 h⌋·1 h + 1 h + the kit's `maxDelay()` + 24 h ≤ END
 *   (the paper's `votedBy`).
 * - x′, the edge over the market (H1): d − (L.gross − L.net) × 10⁴, L the
 *   kit's `leg` from t + D over the same 24 h with C9's setting, the copy's
 *   own cost; it exists exactly when d does.
 */
import type { Fill, Market, Research, Setting } from "../paper/research.js";
import { HOUR_MS, MINUTE_MS } from "../schedule.js";
import type { AccountRow } from "./accounts.js";
import { D_HORIZON_HOURS } from "./design.js";
import { WEEK_MS } from "./instants.js";

const BPS = 1e4;
const HORIZON_MS = D_HORIZON_HOURS * HOUR_MS;

/** d's reason when the habits give no long share (C11; the paper's scorer). */
export const NO_LONG_SHARE = "no long share";

/** C10: every leg drawn from the entry's UTC hour ends by END. */
export const votedBy = (kit: Research, t: number, END: number): boolean =>
  Math.floor(t / HOUR_MS) * HOUR_MS +
    HOUR_MS +
    kit.entries.maxDelay() +
    HORIZON_MS <=
  END;

/** A record's trade key as the kit's `removalOf` reads a fill: its coin, `tid` and `time` (nulls.mjs reads nothing else). */
export type TradeKey = Readonly<Pick<Fill, "t" | "iid" | "tid">>;

/** The records a line's member gives its null at M: its market trades' records in the week of M, cut at END (C10; M1). */
export function memberRecords(
  rows: readonly Pick<AccountRow, "time" | "iid" | "tid" | "market">[],
  M: number,
  END: number,
): TradeKey[] {
  const to = Math.min(M + WEEK_MS, END);
  const out: TradeKey[] = [];
  for (const r of rows)
    if (r.market && r.time >= M && r.time < to)
      out.push({ t: r.time, iid: r.iid, tid: r.tid });
  return out;
}

/** One coin's removal at one Monday and line: each minute that holds a member's record (its start) and the trades the null leaves out of it. */
export type Removal = ReadonlyMap<number, number>;

/** C10's removals of one line at one Monday, by coin: the kit's `removalOf` over the members' records, read back at every minute that holds one. */
export function removalsOf(
  kit: Research,
  lists: readonly (readonly TradeKey[])[],
): Map<number, Removal> {
  const removalOf = kit.nulls.removalOf as (
    lists: readonly (readonly TradeKey[])[],
  ) => (iid: number) => (minute: number) => number;
  const counts = removalOf(lists);
  const out = new Map<number, Map<number, number>>();
  for (const list of lists)
    for (const r of list) {
      let byMinute = out.get(r.iid);
      if (byMinute === undefined)
        out.set(r.iid, (byMinute = new Map<number, number>()));
      const m = Math.floor(r.t / MINUTE_MS) * MINUTE_MS;
      if (!byMinute.has(m)) byMinute.set(m, counts(r.iid)(m));
    }
  return out;
}

/** A coin's removal as the kit's null reads it: the trades left out of the minute that starts at m (none where it holds no member's record). */
export const removedBy =
  (removal: Removal | undefined) =>
  (m: number): number =>
    removal?.get(m) ?? 0;

/** A copy's d in bps with the null's gross (C10), or why it is null (C11). */
export type DReading =
  | {
      readonly d: number;
      readonly nullGross: number;
      readonly reason?: undefined;
    }
  | { readonly d: null; readonly reason: string };

/** The entry at t in direction dir, followed at t + D. */
export type Followed = {
  readonly dir: number;
  readonly t: number;
  readonly D: number;
};

/** d (C10) on a market object, the long share at M and the removal of the copy's line at M. */
export function dOf(
  kit: Research,
  mk: Market,
  copy: Followed,
  longShare: number | null,
  removed: (minute: number) => number,
): DReading {
  if (longShare === null) return { d: null, reason: NO_LONG_SHARE };
  const r = kit.nulls.dAgainstNull(mk, {
    dir: copy.dir,
    t: copy.t,
    D: copy.D,
    h: HORIZON_MS,
    longShare,
    removed,
  });
  return r.d === null
    ? { d: null, reason: r.reason }
    : { d: r.d * BPS, nullGross: r.nullGross * BPS };
}

/** x′ in bps (C10): d less the copy's own cost over the same 24 h, the kit's `leg` on the same object with C9's setting; null exactly when d is. */
export function edgeOf(
  kit: Research,
  mk: Market,
  copy: Followed,
  setting: Setting,
  d: DReading,
): number | null {
  if (d.d === null) return null;
  const tIn = copy.t + copy.D;
  const leg = kit.returns.leg(mk, {
    dir: copy.dir,
    tIn,
    h: HORIZON_MS,
    setting,
  });
  if (leg === null)
    throw new Error(
      `x′: the leg from ${new Date(tIn).toISOString()} is unpriced where its d is not`,
    );
  return d.d - (leg.gross - leg.net) * BPS;
}
