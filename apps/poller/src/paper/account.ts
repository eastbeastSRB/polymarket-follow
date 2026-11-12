/**
 * One account as the scorer sees it (the plan's R4 and R5): its fills (the
 * seed's before the cut, the stored reads after it), its order events,
 * entries and exits (the kit's `toEvents`, `buildEntries`; lib-exits'
 * exits), and its facts at each Monday M — the frozen classifier's label on
 * the 14 days before M and the habits on the 30 days before M (the kit's
 * `labelAt` and `habitsAt`), computed from the fills before M only, so a
 * Monday's facts never change once its fills are read (code-rules: a rule
 * that fixes an instant is read at that instant), and cached per (account,
 * Monday) under a hash of those fills (PAPER-PLAN-REVIEW F11). Whether a
 * window was read is R3's coverage, never the kit's `covered`.
 */
import { createHash } from "node:crypto";
import { HOUR_MS } from "../schedule.js";
import { covered } from "./coverage.js";
import { CUT } from "./instants.js";
import type { Fill, Group, OrderEvent, Research } from "./research.js";
import type { SeedAccount } from "./seed.js";
import type { AccountState, StoredRow } from "./store.js";

export type AccountData = {
  addr: string;
  fills: Fill[];
  seed: { pages: number; truncated: boolean; oldest: number | null } | null;
  state: AccountState;
};

/** The seed's rows and the stored reads, deduplicated by trade key, oldest first (stable), normalized by the kit. */
export function accountData(
  kit: Research,
  addr: string,
  seed: SeedAccount | null,
  rows: readonly StoredRow[],
  state: AccountState,
): AccountData {
  const seen = new Set<string>();
  const fills: Fill[] = [];
  for (const r of [...(seed?.rows ?? []), ...rows]) {
    const k = `${r.trade_id}|${r.instrument_id}|${r.timestamp}`;
    if (seen.has(k)) continue;
    seen.add(k);
    fills.push(kit.fills.normFill(r));
  }
  fills.sort((a, b) => a.t - b.t);
  return {
    addr,
    fills,
    seed:
      seed === null
        ? null
        : {
            pages: seed.pages,
            truncated: seed.truncated,
            oldest: seed.rows[0]?.timestamp ?? null,
          },
    state,
  };
}

/** The fills before `t` (they are oldest first). */
export function fillsBefore(fills: readonly Fill[], t: number): Fill[] {
  let lo = 0;
  let hi = fills.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (fills[mid]!.t < t) lo = mid + 1;
    else hi = mid;
  }
  return fills.slice(0, lo);
}

/** An account's label and habits at a Monday: what is cached. */
export type MondayValue = {
  label: string;
  closed: number;
  medianHoldMs: number | null;
  longShare: number | null;
};

export type MondayFacts = MondayValue & {
  /** P1's window [M − 14 d, M) read (R3, F2). */
  labelCovered: boolean;
  /** The habits' window [M − 30 d, M) read (R5). */
  habitCovered: boolean;
};

/** Cached Monday values, `<addr>|<M>` → the fills' hash and the value. */
export type MondayCache = Map<string, { hash: string; value: MondayValue }>;

const LABEL_MS = 14 * 24 * HOUR_MS;
const HABIT_MS = 30 * 24 * HOUR_MS;

/** The seed is frozen (its manifest is checked at load): its facts and size stand for it; the reads are hashed. */
function hashOf(account: AccountData, before: readonly Fill[]): string {
  const h = createHash("sha256");
  h.update(`${JSON.stringify(account.seed)}|${before.length}\n`);
  for (const f of before) {
    if (f.t < CUT) continue;
    h.update(
      `${f.tid}|${f.iid}|${f.t}|${f.oid}|${f.prevS}|${f.sgn}|${f.q}|${f.px}|${f.fee}|${f.pnl}|${f.taker}|${f.forced}\n`,
    );
  }
  return h.digest("hex");
}

/** The kit's label and habits at M from the fills before M, through the cache. */
export function mondayValue(
  kit: Research,
  account: AccountData,
  M: number,
  cache: MondayCache,
): MondayValue {
  const before = fillsBefore(account.fills, M);
  const key = `${account.addr}|${M}`;
  const hash = hashOf(account, before);
  const hit = cache.get(key);
  if (hit !== undefined && hit.hash === hash) return hit.value;
  const capture = {
    fills: before,
    pages: account.seed?.pages ?? 0,
    truncated: account.seed?.truncated ?? false,
    oldest: account.seed?.oldest ?? null,
  };
  const label = kit.labels.labelAt(capture, M).label;
  const events = kit.entries.toEvents(before);
  const habits = kit.labels.habitsAt(
    {
      cycles: kit.entries.toCycles(events),
      groups: kit.entries.buildEntries(events, -Infinity, Infinity, 60_000),
    },
    M,
  );
  const value: MondayValue = {
    label,
    closed: habits.closed,
    medianHoldMs: habits.medianHoldMs,
    longShare: habits.longShare,
  };
  cache.set(key, { hash, value });
  return value;
}

export function mondayFacts(
  kit: Research,
  account: AccountData,
  M: number,
  cache: MondayCache,
): MondayFacts {
  return {
    ...mondayValue(kit, account, M, cache),
    labelCovered: covered(account.state, account.seed, M - LABEL_MS, M),
    habitCovered: covered(account.state, account.seed, M - HABIT_MS, M),
  };
}

/** The account-level conditions of the lines at a Monday (R7). */
export function linesAt(f: MondayFacts) {
  const p1 = f.label === "directional" && f.labelCovered;
  const main =
    p1 &&
    f.habitCovered &&
    f.medianHoldMs !== null &&
    f.medianHoldMs >= 6 * HOUR_MS &&
    f.closed >= 3;
  return {
    p1,
    main,
    ten: main && f.closed >= 10,
    day: main && f.medianHoldMs! >= 24 * HOUR_MS,
  };
}

/** The account's whole history: events, every group with its exits, and lib-exits' liquidation keys. */
export function history(kit: Research, account: AccountData) {
  const events: OrderEvent[] = kit.entries.toEvents(account.fills);
  const groups: Group[] = kit.entries.buildEntries(
    events,
    -Infinity,
    Infinity,
    60_000,
  );
  return {
    events,
    groups,
    liqKeys: kit.exits.liquidationKeys(events),
    chain: kit.exits.chainBreaks(events),
  };
}
