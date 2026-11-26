/**
 * Events, cycles, entries, the delay (copyh/rules.md C4, R4 unchanged): the
 * kit's `toEvents`, `toCycles` and `buildEntries(events, −∞, ∞, 60 000)` on
 * a built account's normalized fills from ARCHIVE_START to the step's END,
 * with lib-exits' liquidation keys and chain breaks beside them. Two
 * accounts are not run through the kit, each named and counted at every
 * look:
 * - one whose fills to END number more than HISTORY_FILLS_MAX: the kit holds
 *   every fill and event of a history at once (the supervisor's ruling on
 *   COPYH-ENGINE's Q1, 2026-11-26; its sentence queued for the rules' last
 *   touch);
 * - one whose exit rows — the exits `buildEntries` would append over all its
 *   groups, counted by `exitRows` without building them — number more than
 *   EXITS_MAX (C4; RH1 (b)).
 * Neither has habits, so neither is in a line or a line's removal set. An
 * entry is a group of type OPEN or FLIP whose first fill lies in the stage
 * judged; its id is the kit's `entryId`, which holds the coin's iid, and its
 * delay D the kit's `delayOf`.
 */
import type {
  ChainBreaks,
  Cycle,
  Fill,
  Group,
  OrderEvent,
  Research,
} from "../paper/research.js";
import { DAY_MS } from "../schedule.js";
import { MERGE_MS, RESIDUE_BOUNDS } from "./design.js";

/** The kit's zero (entries.mjs): a size within it is flat. */
const EPS = 1e-9;
const WEEK_MS = 7 * DAY_MS;

/**
 * The exits `buildEntries(events, −∞, ∞, mergeMs)` would append over all
 * its groups: the kit's own loop, instrument by instrument, with a count of
 * the open groups on each side in place of the groups themselves.
 */
export function exitRows(
  events: readonly OrderEvent[],
  mergeMs: number = MERGE_MS,
): number {
  const byIid = new Map<number, OrderEvent[]>();
  for (const e of events) {
    const list = byIid.get(e.iid);
    if (list === undefined) byIid.set(e.iid, [e]);
    else list.push(e);
  }
  let rows = 0;
  for (const list of byIid.values()) {
    let cur: { dir: number; t: number } | null = null;
    /** The groups still open on each side (the kit's `open`, by `dir`). */
    const open = new Map<number, number>();
    for (const e of list) {
      const reduces =
        (Math.abs(e.prev) >= EPS &&
          Math.abs(e.after) < Math.abs(e.prev) - EPS) ||
        e.kind === "FLIP" ||
        e.kind === "CLOSE";
      if (reduces) {
        const side = Math.sign(e.prev);
        rows += open.get(side) ?? 0;
        if (e.kind === "CLOSE" || e.kind === "FLIP") open.delete(side);
      }
      if (e.forced) continue;
      if (e.kind !== "OPEN" && e.kind !== "FLIP" && e.kind !== "ADD") continue;
      const dir = e.kind === "ADD" ? Math.sign(e.prev) : Math.sign(e.after);
      if (
        cur !== null &&
        (e.kind === "OPEN" || e.kind === "ADD") &&
        cur.dir === dir &&
        e.t - cur.t <= mergeMs
      )
        continue;
      cur = { dir, t: e.t };
      open.set(dir, (open.get(dir) ?? 0) + 1);
    }
  }
  return rows;
}

/** An account's history as the kit builds it. */
export type History = {
  readonly events: OrderEvent[];
  readonly cycles: Cycle[];
  readonly groups: Group[];
  readonly liqKeys: Set<string>;
  readonly chain: ChainBreaks;
  readonly exitRows: number;
};

/** An account's history, or why the kit is not run on it (each named and counted). */
export type Built =
  | { readonly kind: "built"; readonly history: History }
  | { readonly kind: "too many fills"; readonly fills: number }
  | {
      readonly kind: "too many exits";
      readonly exitRows: number;
      readonly events: OrderEvent[];
    };

/** The limits the kit is run under: HISTORY_FILLS_MAX and EXITS_MAX (design.ts; a test passes its own). */
export type Limits = { readonly fills: number; readonly exits: number };

/** The kit's history of an account's fills (oldest first, the store's order), unless it holds more fills or exit rows than the limits. */
export function historyOf(
  kit: Research,
  fills: readonly Fill[],
  limits: Limits,
): Built {
  if (fills.length > limits.fills)
    return { kind: "too many fills", fills: fills.length };
  const events = kit.entries.toEvents(fills);
  const rows = exitRows(events);
  if (rows > limits.exits)
    return { kind: "too many exits", exitRows: rows, events };
  return {
    kind: "built",
    history: {
      events,
      cycles: kit.entries.toCycles(events),
      groups: kit.entries.buildEntries(events, -Infinity, Infinity, MERGE_MS),
      liqKeys: kit.exits.liquidationKeys(events),
      chain: kit.exits.chainBreaks(events),
      exitRows: rows,
    },
  };
}

/** An account above EXITS_MAX is named with its OPEN and FLIP order events (not forced) in the weeks of the Mondays where it is P1: its entries' upper bound (C4). */
export const openFlipEvents = (
  events: readonly OrderEvent[],
  mondays: readonly number[],
): number =>
  events.filter(
    (e) =>
      !e.forced &&
      (e.kind === "OPEN" || e.kind === "FLIP") &&
      mondays.some((M) => e.t >= M && e.t < M + WEEK_MS),
  ).length;

/** C4's float residues: the order events with 1e-9 ≤ |prev + net| < 1e-6, which the kit reads as a reduce or a flip (L3). */
export const residues = (events: readonly OrderEvent[]): number =>
  events.filter((e) => {
    const r = Math.abs(e.prev + e.net);
    return r >= RESIDUE_BOUNDS[0] && r < RESIDUE_BOUNDS[1];
  }).length;

/** The entries of a stage window [from, to): the groups of type OPEN or FLIP whose first fill lies in it (C4). */
export const entriesIn = (
  groups: readonly Group[],
  from: number,
  to: number,
): Group[] =>
  groups.filter(
    (g) => (g.type === "OPEN" || g.type === "FLIP") && g.t >= from && g.t < to,
  );

/** An entry's id (the kit's `entryId`, which holds the coin's iid) and its delay D (the kit's `delayOf`): its follow instant is t + D. */
export function delayOf(
  kit: Research,
  addr: string,
  g: Group,
): { id: string; D: number } {
  const id = kit.entries.entryId(addr, g);
  return { id, D: kit.entries.delayOf(id) };
}
