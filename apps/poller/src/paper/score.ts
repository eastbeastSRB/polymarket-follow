/**
 * The scorer (the plan's R4–R11 and R13, with its review's F9 and F14): every
 * entry from the cut (arm F: from the freeze) of the accounts, its lines
 * fixed at its Monday, its market checked (R6), and both readings of each
 * copy — the money with the trader's exits copied (lib-exits' `priceCopy` on
 * this file's plans, the taker setting of R9) and d at 24 h against the
 * exact matched null (the kit's `dAgainstNull`, the line's own accounts left
 * out of the null's minutes) — with its flags and the beside lines' variants.
 * Accounts are taken one at a time; only their copies and the week fills the
 * nulls leave out are kept.
 */
import { HOUR_MS } from "../schedule.js";
import {
  history,
  linesAt,
  mondayFacts,
  type AccountData,
  type MondayCache,
  type MondayFacts,
} from "./account.js";
import { DAYS7_MS, jumpRatio, planCopyThrough, stopInstant } from "./copy.js";
import { CUT, WEEK_MS, mondayOf } from "./instants.js";
import type {
  CopyExit,
  CopyPlan,
  Fill,
  Market,
  Research,
  Setting,
} from "./research.js";
import { bookTaker, type RuleBook } from "./rulebook.js";

export const LINES = ["MAIN", "TEN", "BROAD", "DAY", "FAV"] as const;
export type LineName = (typeof LINES)[number];

const H24 = 24 * HOUR_MS;
const BPS = 1e4;

/** Money in bps of the copy's $1,000; holds in ms. */
export type Money = {
  net: number;
  gross: number;
  fees: number;
  funding: number;
  holdMs: number;
  fullExitMs: number;
  fundingMissing: number;
  spreadFallback: boolean;
};

export type CopyRecord = {
  id: string;
  addr: string;
  iid: number;
  dir: number;
  type: "OPEN" | "FLIP";
  t: number;
  D: number;
  tIn: number;
  monday: number;
  lines: LineName[];
  label: string;
  facts: MondayFacts | null;
  exits: CopyExit[];
  plan: CopyPlan;
  /** The paper entry's price: the mark at the end of t + D's minute, plus or minus the spread and depth. */
  entryPrice: number | null;
  money: Money | null;
  unpriced: string | null;
  /** d at 24 h in bps, per line (each line leaves its own accounts out of the null). */
  d: Partial<Record<LineName, number | null>>;
  dReason: Partial<Record<LineName, string>>;
  voted: boolean;
  gap: boolean;
  /** MAIN's beside variants (R13), net bps; null when unpriced. */
  stop2: number | null;
  stop5: number | null;
  days7: number | null;
  jump: number | null;
  notional: boolean;
  competition: { days: boolean; boosted: boolean };
  mapOpen: boolean | null;
};

export type Scored = {
  copies: CopyRecord[];
  /** Entries of a line in a market that is not primary (R6): counted, priced in no line. */
  otherMarkets: number;
  /** The accounts P1 at each Monday. */
  p1: Map<number, Set<string>>;
};

export type ScoreInput = {
  kit: Research;
  end: number;
  pool: readonly { addr: string; notionalBoard: boolean }[];
  /** Arm F: each favourite with F0, the instant its entries count from. */
  favourites: readonly { addr: string; from: number }[];
  account: (addr: string) => AccountData;
  market: (iid: number) => Market | null;
  book: RuleBook;
  cache: MondayCache;
  /** The kit's rule book's markets with their category (R6 (2), R9). */
  kitMarkets: ReadonlyMap<number, string>;
  /**
   * Where arm A's entries start: the cut. Only the rehearsal on the old weeks
   * (part 4) sets an earlier one, and then END may not pass the cut (F6).
   */
  start?: number;
};

/** R10: every leg drawn from the entry's hour ends by END (the kit's `voted` with END in place of the cut). */
export const votedBy = (kit: Research, t: number, end: number): boolean =>
  Math.floor(t / HOUR_MS) * HOUR_MS + HOUR_MS + kit.entries.maxDelay() + H24 <=
  end;

/** Mondays from the cut's to the last one before `end`. */
export function mondaysTo(end: number, start = CUT): number[] {
  const out: number[] = [];
  for (let M = mondayOf(start); M < end; M += WEEK_MS) out.push(M);
  return out;
}

/** R6: in the kit's rule book (first: the kit's check throws otherwise), the kit's primary cell, and from the cut the collector's rule book. */
export function primaryMarket(
  input: ScoreInput,
  iid: number,
  t: number,
): boolean {
  if (!input.kitMarkets.has(iid)) return false;
  if (!input.kit.cells.inPrimaryCell(iid, t)) return false;
  if (t >= CUT) {
    const from = input.book.leftOutFrom.get(iid);
    if (from !== undefined && t >= from) return false;
  }
  return true;
}

/** R9: the base-tier taker fee in force (the collector's rule book, else the kit's), the kit's spread table. */
export function takerSetting(input: ScoreInput): Setting {
  const { kit, book, kitMarkets } = input;
  return {
    name: "taker",
    fee: (iid, t) =>
      bookTaker(book, iid, kitMarkets.get(iid) ?? "", t) ??
      kit.costs.feeAt("taker", iid, t),
    spread: kit.costs.SETTINGS.taker.spread,
  };
}

const fillsIn = (fills: readonly Fill[], from: number, to: number) =>
  fills.filter((f) => f.t >= from && f.t < to);

/** The accounts read every day in the week of M: P1 at M, and every trader with a copy still open at M (R3, section 3). */
export function weekList(input: ScoreInput, M: number): Set<string> {
  const { kit } = input;
  const list = new Set<string>();
  for (const { addr } of input.pool) {
    const account = input.account(addr);
    const lines = (m: number) =>
      linesAt(mondayFacts(kit, account, m, input.cache));
    if (lines(M).p1) {
      list.add(addr);
      continue;
    }
    const earlier = mondaysTo(M).filter((m) => lines(m).p1);
    if (earlier.length === 0) continue;
    const { groups, liqKeys } = history(kit, account);
    const open = groups.some(
      (g) =>
        (g.type === "OPEN" || g.type === "FLIP") &&
        g.t >= CUT &&
        g.t < M &&
        earlier.includes(mondayOf(g.t)) &&
        primaryMarket(input, g.iid, g.t) &&
        planCopyThrough(
          { t: g.t, D: kit.entries.delayOf(kit.entries.entryId(addr, g)) },
          kit.exits.exitsOf(g, liqKeys),
          M,
        ).flag !== null,
    );
    if (open) list.add(addr);
  }
  return list;
}

export function score(input: ScoreInput): Scored {
  const { kit, end } = input;
  const start = input.start ?? CUT;
  if (start !== CUT && end > CUT) {
    throw new Error("a rehearsal scores only weeks before the cut");
  }
  const mondays = mondaysTo(end, start);
  const notional = new Map(input.pool.map((p) => [p.addr, p.notionalBoard]));
  const favourites = new Map(input.favourites.map((f) => [f.addr, f.from]));
  const accounts = [
    ...new Set([...input.pool.map((p) => p.addr), ...favourites.keys()]),
  ].sort();
  const p1 = new Map<number, Set<string>>(mondays.map((M) => [M, new Set()]));
  const removalFills = new Map<string, Fill[][]>();
  const candidates: Omit<
    CopyRecord,
    | "entryPrice"
    | "money"
    | "unpriced"
    | "d"
    | "dReason"
    | "stop2"
    | "stop5"
    | "days7"
    | "jump"
    | "mapOpen"
  >[] = [];
  let otherMarkets = 0;

  for (const addr of accounts) {
    const account = input.account(addr);
    const inPool = notional.has(addr);
    const f0 = favourites.get(addr);
    const facts = new Map(
      mondays.map((M) => [M, mondayFacts(kit, account, M, input.cache)]),
    );
    let anyLine = false;
    for (const M of mondays) {
      const l = linesAt(facts.get(M)!);
      const lines: LineName[] = [];
      if (inPool && l.p1) lines.push("BROAD");
      if (inPool && l.main) lines.push("MAIN");
      if (inPool && l.ten) lines.push("TEN");
      if (inPool && l.day) lines.push("DAY");
      if (f0 !== undefined && M + WEEK_MS > f0) lines.push("FAV");
      if (inPool && l.p1) p1.get(M)!.add(addr);
      if (lines.length === 0) continue;
      anyLine = true;
      const week = fillsIn(account.fills, M, M + WEEK_MS);
      for (const line of lines) {
        const key = `${line}|${M}`;
        const lists = removalFills.get(key) ?? [];
        lists.push(week);
        removalFills.set(key, lists);
      }
    }
    // An account in no line at any Monday has no copy: its history is not needed.
    if (!anyLine) continue;
    const { events, groups, liqKeys, chain } = history(kit, account);
    for (const g of groups) {
      if (g.type === "ADD" || g.t < start || g.t >= end) continue;
      const M = mondayOf(g.t);
      const fact = facts.get(M) ?? null;
      const l = fact === null ? null : linesAt(fact);
      const lines: LineName[] = [];
      if (inPool && l?.p1) lines.push("BROAD");
      if (inPool && l?.main) lines.push("MAIN");
      if (inPool && l?.ten) lines.push("TEN");
      if (inPool && l?.day) lines.push("DAY");
      if (f0 !== undefined && g.t >= f0) lines.push("FAV");
      if (lines.length === 0) continue;
      if (!primaryMarket(input, g.iid, g.t)) {
        otherMarkets += 1;
        continue;
      }
      const id = kit.entries.entryId(addr, g);
      const D = kit.entries.delayOf(id);
      const exits = kit.exits.exitsOf(g, liqKeys);
      const plan = planCopyThrough({ t: g.t, D }, exits, end);
      const spanEnd = plan.flag === "open" ? end : (plan.lastExitT ?? g.t);
      const gap =
        kit.exits.crossesBreak(chain, events, g, plan) ||
        account.state.holes.some((h) => h.from <= spanEnd && h.to > g.t);
      const comp = input.book.competitions.filter(
        (c) => c.start < end && c.end > CUT,
      );
      candidates.push({
        id,
        addr,
        iid: g.iid,
        dir: g.dir,
        type: g.type,
        t: g.t,
        D,
        tIn: g.t + D,
        monday: M,
        lines,
        label: fact?.label ?? "",
        facts: fact,
        exits,
        plan,
        voted: votedBy(kit, g.t, end),
        gap,
        notional: notional.get(addr) ?? false,
        competition: {
          days: comp.some((c) => g.t >= c.start && g.t < c.end),
          boosted: comp.some((c) => c.boosted.has(g.iid)),
        },
      });
    }
  }

  const setting = takerSetting(input);
  const removals = new Map<
    string,
    (iid: number) => (minute: number) => number
  >();
  const removedFor = (line: LineName, M: number) => {
    const key = `${line}|${M}`;
    let r = removals.get(key);
    if (r === undefined) {
      r = kit.nulls.removalOf(removalFills.get(key) ?? []);
      removals.set(key, r);
    }
    return r;
  };
  const copies: CopyRecord[] = [];
  for (const c of candidates) {
    const mk = input.market(c.iid);
    const record: CopyRecord = {
      ...c,
      entryPrice: null,
      money: null,
      unpriced: null,
      d: {},
      dReason: {},
      stop2: null,
      stop5: null,
      days7: null,
      jump: null,
      mapOpen: null,
    };
    copies.push(record);
    if (mk === null) {
      record.unpriced = "no mark at the follow instant";
      continue;
    }
    const markIn = kit.panel.markAtMinuteEnd(mk, c.tIn);
    record.entryPrice =
      markIn === null
        ? null
        : markIn * (1 + c.dir * setting.spread(c.iid, c.tIn).c);
    const price = (legs: CopyPlan["legs"]) =>
      kit.exits.priceCopy(mk, { dir: c.dir, tIn: c.tIn, legs, setting });
    const p = price(c.plan.legs);
    if (p.reason !== undefined) record.unpriced = p.reason;
    else {
      record.money = {
        net: p.net * BPS,
        gross: p.gross * BPS,
        fees: p.fees * BPS,
        funding: p.funding * BPS,
        holdMs: p.hold,
        fullExitMs: p.fullExit,
        fundingMissing: p.fundingMissing,
        spreadFallback: p.spreadFallback,
      };
    }
    for (const line of c.lines) {
      const share = c.facts?.longShare ?? null;
      if (share === null) {
        record.d[line] = null;
        record.dReason[line] = "no long share";
        continue;
      }
      const r = kit.nulls.dAgainstNull(mk, {
        dir: c.dir,
        t: c.t,
        D: c.D,
        h: H24,
        longShare: share,
        removed: removedFor(line, c.monday)(c.iid),
      });
      record.d[line] = r.d === null ? null : r.d * BPS;
      if (r.d === null) record.dReason[line] = r.reason;
    }
    if (c.lines.includes("MAIN") && record.money !== null) {
      const until = c.plan.flag === null ? c.plan.lastExitT! + c.D : end;
      const variant = (closeAt: number | null) => {
        if (closeAt === null) return record.money!.net;
        const v = price(
          planCopyThrough({ t: c.t, D: c.D }, c.exits, end, closeAt).legs,
        );
        return v.reason === undefined ? v.net * BPS : null;
      };
      record.stop2 = variant(stopInstant(kit, mk, c, 0.02, until));
      record.stop5 = variant(stopInstant(kit, mk, c, 0.05, until));
      record.days7 = variant(c.tIn + DAYS7_MS);
      record.jump = jumpRatio(kit, mk, c.t);
      try {
        record.mapOpen = kit.cells.mapOpen(c.iid, {
          h: H24,
          setting: kit.costs.SETTINGS.taker,
          dir: c.dir,
        });
      } catch {
        record.mapOpen = null;
      }
    }
  }
  return { copies, otherMarkets, p1 };
}
