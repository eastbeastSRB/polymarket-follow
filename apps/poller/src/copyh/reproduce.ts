/**
 * The reproduction (copyh/rules.md C15 (a), "The reproduction"; RM6): the
 * paper's seed — Polymarket's weeks before the cut, whose answers are on
 * record (decisions 2026-11-12, PAPER-BUILD's technical calls) — converted
 * record for record into the rows COPY-H's reader gives the engine, run
 * through COPY-H's mapping and, in the same run, through the kit on the
 * seed's own rows (the reference), every value of the first held to the
 * second, one account at a time.
 *
 * The rows are made here, not read from a store: the seed's instants lie at
 * or after END_E, which every store reader's seal refuses before step 2
 * (C0), and C15 (a) runs C3's chain heads and normalization, not the pass.
 * The known copies are priced on the kit's own panel with its taker
 * setting, COPY-H's way (money.ts) and the reference's (lib-exits); every
 * MAIN and TEN entry of the seed's weeks is judged, COPY-H's way (lines.ts,
 * judge.ts) and the kit's (`dAgainstNull` with `removalOf`); FR1's counts
 * come from both. `reproduce` is the whole of it, repro.json's body.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import {
  KIT_FINGERPRINT,
  type Capture,
  type CopyExit,
  type CopyPrice,
  type Fill,
  type Group,
  type Market,
  type OrderEvent,
  type Research,
  type Setting,
} from "../paper/research.js";
import type { SeedAccount } from "../paper/seed.js";
import { DAY_MS, HOUR_MS } from "../schedule.js";
import type { AccountRow } from "./accounts.js";
import {
  D_HORIZON_HOURS,
  MERGE_MS,
  REPRODUCTION,
  REPRODUCTION_TOLERANCE_BPS,
} from "./design.js";
import {
  delayOf,
  entriesIn,
  historyOf,
  type Limits as HistoryLimits,
} from "./entries.js";
import { mondayOf } from "./instants.js";
import {
  dOf,
  edgeOf,
  memberRecords,
  removalsOf,
  removedBy,
  type Removal,
  type TradeKey,
} from "./judge.js";
import {
  DIRECTIONAL,
  fillsBefore,
  habitsAtMonday,
  isP1,
  labelOf,
  type Coverage,
} from "./labels.js";
import { accountLines, entryLines } from "./lines.js";
import { moneyOf, planOf, type Money } from "./money.js";
import { normOf } from "./normalize.js";
import { CheckFailed, sha256 } from "./run.js";
import { exactInDouble } from "./schema.js";
import { SEALED, checkInside, checkPath } from "./seal.js";

/** The seed is not what the reproduction reads: a check failed (exit 6, C15). */
export class ReproError extends CheckFailed {}

/** A plain decimal's value: m · 10^−scale. */
type Decimal = { readonly m: bigint; readonly scale: number };

const PLAIN = /^-?\d+(\.\d+)?$/;

/** A plain decimal text's value; another form is refused (the seed's texts are plain, as Hyperliquid's boundary reads them). */
function decimalOf(text: string): Decimal {
  if (!PLAIN.test(text))
    throw new ReproError(`"${text}" is not a plain decimal`);
  const neg = text.startsWith("-");
  const [whole, fraction = ""] = (neg ? text.slice(1) : text).split(".");
  const m = BigInt(`${whole}${fraction}`);
  return { m: neg ? -m : m, scale: fraction.length };
}

/** a + sign · b, exactly. */
function plus(a: Decimal, b: Decimal, sign: number): Decimal {
  const scale = Math.max(a.scale, b.scale);
  const at = (d: Decimal) => d.m * 10n ** BigInt(scale - d.scale);
  return { m: at(a) + BigInt(sign) * at(b), scale };
}

/** A decimal's plain text, no trailing zero after the point. */
function textOf(d: Decimal): string {
  const neg = d.m < 0n;
  const digits = (neg ? -d.m : d.m).toString().padStart(d.scale + 1, "0");
  const whole = digits.slice(0, digits.length - d.scale);
  const fraction = digits.slice(digits.length - d.scale).replace(/0+$/, "");
  return `${neg ? "-" : ""}${whole}${fraction === "" ? "" : `.${fraction}`}`;
}

/**
 * One seed account as the rows of Hyperliquid's records (C15 (a)): each of
 * the paper's order events — the kit's key, `order_id`, `previous_size` (as
 * text) and `instrument_id` — split by timestamp, each timestamp's fills in
 * the seed's order given the `startPosition` chain that starts at the
 * event's `previous_size` (each fill's the sizes before it added, signed,
 * exactly), so that C3's chain rule heads them with it, a timestamp at a
 * time (RM6: the kit's key holds no time); `side` +1 for a long fill ("B")
 * and −1 for a short ("A"); the instrument's own id as iid, so that ids and
 * delays are the paper's; `crossed` the fill's taker flag; an own
 * liquidation for a liquidation fill (Hyperliquid's `liquidatedUser` the
 * account); a liquidation, ADL or settlement fill of kind `forced`
 * ("Liquidated …", "Auto-Deleveraging", "Settlement"), any other a `trade`;
 * the market reading the record's own (the seed holds one account's side
 * of a trade): ADL and settlement no market trade (C3, market-trades.ts).
 * `beyond` lists the rows (by index) whose `quantity` text has more than
 * EXACT_DIGITS significant digits, which Hyperliquid's boundary refuses
 * (C3, D5): no double gives their chain back exactly, so C3's exact rule
 * may split their matching event's heads (C15 (a)'s allowed difference).
 * The seed's rows must be in time order (it is written so).
 */
export function seedRows(seed: SeedAccount): {
  rows: AccountRow[];
  beyond: number[];
} {
  const next = new Map<string, Decimal>();
  const beyond: number[] = [];
  let last = -Infinity;
  const rows = seed.rows.map((r, i): AccountRow => {
    if (r.timestamp < last)
      throw new ReproError(`${seed.addr}: the seed's rows out of time order`);
    last = r.timestamp;
    const side = r.side === "long" ? 1 : -1;
    const key = `${r.order_id}|${r.previous_size}|${r.instrument_id}|${r.timestamp}`;
    const start = next.get(key) ?? decimalOf(r.previous_size);
    next.set(key, plus(start, decimalOf(r.quantity), side));
    if (!exactInDouble(r.quantity)) beyond.push(i);
    const forcedOnly = r.adl === true || r.settlement === true;
    return {
      time: r.timestamp,
      iid: r.instrument_id,
      px: Number(r.price),
      sz: Number(r.quantity),
      side,
      startPosition: Number(textOf(start)),
      oid: r.order_id,
      tid: r.trade_id,
      crossed: r.taker,
      ownLiquidation: r.liquidation,
      dirKind: r.liquidation || forcedOnly ? "forced" : "trade",
      market: !forcedOnly,
    };
  });
  return { rows, beyond };
}

/** The kit's limits the engine runs under: LABEL_FILLS_MAX, HISTORY_FILLS_MAX and EXITS_MAX (design.ts; a test passes its own). */
export type Limits = {
  readonly labelFills: number;
  readonly history: HistoryLimits;
};

/** An account's facts at a Monday that P1 and MAIN read. */
export type MondayFacts = {
  readonly label: string;
  readonly p1: boolean;
  readonly closed: number;
  readonly medianHoldMs: number | null;
  readonly longShare: number | null;
};

/** An entry (a group of type OPEN or FLIP), its delay and its exits (lib-exits' `exitsOf`). */
export type Entry = {
  readonly group: Group;
  readonly D: number;
  readonly exits: readonly CopyExit[];
};

/** One account as one path gives it: fills in the kit's `normFill` fields, events, entries by key (`entryKey`), the facts at each Monday. */
export type Path = {
  readonly fills: readonly Fill[];
  readonly events: readonly OrderEvent[];
  readonly entries: ReadonlyMap<string, Entry>;
  readonly facts: readonly MondayFacts[];
};

/**
 * An entry's key in a path: its id and its ordinal among the account's
 * entries of that id, in the kit's order (`<id>#0`, `<id>#1`, …). The kit's
 * id is account, coin, time and type, with no direction, so an OPEN long,
 * its CLOSE and an OPEN short of one millisecond give two entries of one id;
 * both are entries (R4), and each is compared under its own key (the engine
 * review's L7, as the supervisor reworked it on the real seed, 2026-11-26).
 */
export const entryKey = (id: string, n: number): string => `${id}#${n}`;

/** An entry put under its id's next ordinal. */
function putEntry(entries: Map<string, Entry>, id: string, entry: Entry): void {
  let n = 0;
  while (entries.has(entryKey(id, n))) n += 1;
  entries.set(entryKey(id, n), entry);
}

/** A known id's entry in a path: its one entry, or none; an id of more than one entry is refused, since the record cannot say which one it meant. */
export function knownEntry(
  entries: ReadonlyMap<string, Entry>,
  addr: string,
  id: string,
): Entry | undefined {
  if (entries.has(entryKey(id, 1)))
    throw new ReproError(
      `${addr}: the known entry ${id} is more than one entry of a path, and the record cannot say which one it meant`,
    );
  return entries.get(entryKey(id, 0));
}

/** R5's whole capture at M: the fills before M with the seed's page facts (the paper's `mondayValue`; C15 (a) in place of C5's 90 days). */
const captureAt = (
  seed: SeedAccount,
  fills: readonly Fill[],
  M: number,
): Capture => ({
  fills: fillsBefore(fills, M),
  pages: seed.pages,
  truncated: seed.truncated,
  oldest: seed.rows[0]?.timestamp ?? null,
});

/** R3's coverage of a seed-only account at M (the paper's `covered`, its reads all at the cut): the seed whole, or its oldest fill at or before each window's start. */
export function seedCoverage(
  kit: Research,
  seed: SeedAccount,
  M: number,
): Coverage {
  const oldest = seed.rows[0]?.timestamp ?? null;
  const from = (days: number) =>
    !seed.truncated || (oldest !== null && oldest <= M - days * DAY_MS);
  return {
    labelCovered: from(kit.labels.LABEL_DAYS),
    habitCovered: from(kit.labels.HABIT_DAYS),
  };
}

/** The reference: the kit on the seed's own rows, as the paper computed them (R4; R5's label and habits from the fills before M, P1 with the kit's own coverage). */
export function referenceOf(
  kit: Research,
  seed: SeedAccount,
  mondays: readonly number[],
): Path {
  const fills = seed.rows.map((r) => kit.fills.normFill(r));
  const events = kit.entries.toEvents(fills);
  const liqKeys = kit.exits.liquidationKeys(events);
  const entries = new Map<string, Entry>();
  for (const g of kit.entries.buildEntries(
    events,
    -Infinity,
    Infinity,
    MERGE_MS,
  )) {
    if (g.type !== "OPEN" && g.type !== "FLIP") continue;
    const id = kit.entries.entryId(seed.addr, g);
    putEntry(entries, id, {
      group: g,
      D: kit.entries.delayOf(id),
      exits: kit.exits.exitsOf(g, liqKeys),
    });
  }
  const facts = mondays.map((M) => {
    const capture = captureAt(seed, fills, M);
    const label = kit.labels.labelAt(capture, M);
    const before = kit.entries.toEvents(capture.fills);
    const h = kit.labels.habitsAt(
      {
        cycles: kit.entries.toCycles(before),
        groups: kit.entries.buildEntries(before, -Infinity, Infinity, MERGE_MS),
      },
      M,
    );
    return {
      label: label.label,
      p1: label.label === DIRECTIONAL && label.covered,
      closed: h.closed,
      medianHoldMs: h.medianHoldMs,
      longShare: h.longShare,
    };
  });
  return { fills, events, entries, facts };
}

/** COPY-H's path on the converted rows: C3's chain heads and normalization, C4, C5's label on R5's whole capture (C15 (a)) with the paper's coverage; or why the kit is not run on the account. */
export function copyhOf(
  kit: Research,
  seed: SeedAccount,
  rows: readonly AccountRow[],
  mondays: readonly number[],
  limits: Limits,
): { kind: "built"; path: Path } | { kind: "not built"; why: string } {
  const fills = normOf(rows);
  const built = historyOf(kit, fills, limits.history);
  if (built.kind === "too many fills")
    return { kind: "not built", why: `${built.kind}: ${built.fills}` };
  if (built.kind === "too many exits")
    return { kind: "not built", why: `${built.kind}: ${built.exitRows}` };
  const h = built.history;
  const entries = new Map<string, Entry>();
  for (const g of entriesIn(h.groups, -Infinity, Infinity)) {
    const { id, D } = delayOf(kit, seed.addr, g);
    putEntry(entries, id, {
      group: g,
      D,
      exits: kit.exits.exitsOf(g, h.liqKeys),
    });
  }
  const facts = mondays.map((M) => {
    const label = labelOf(kit, captureAt(seed, fills, M), M, limits.labelFills);
    const { habits } = habitsAtMonday(kit, h, fills, M);
    return {
      label,
      p1: isP1(label, seedCoverage(kit, seed, M)),
      closed: habits.closed,
      medianHoldMs: habits.medianHoldMs,
      longShare: habits.longShare,
    };
  });
  return { kind: "built", path: { fills, events: h.events, entries, facts } };
}

/** The two labels C5's pnl of 0 may turn one into the other (L4): listed, never a failure. */
const PNL_LABELS = ["churner", "unclassified — mixed"];

/** An event's fields but prevS, whose text is the chain head's shortest by design. */
const eventKey = (e: OrderEvent) =>
  JSON.stringify([
    e.oid,
    e.iid,
    e.t,
    e.t1,
    e.prev,
    e.net,
    e.n,
    e.notional,
    e.forced,
    e.liq,
    e.tids,
    e.after,
    e.kind,
    e.dir,
  ]);

const day = (t: number) => new Date(t).toISOString().slice(0, 10);

/** One account's comparison: its counts, the differences beyond the boundary (allowed, listed) and every other one (a failure). */
export type AccountComparison = {
  readonly events: { readonly kit: number; readonly copyh: number };
  readonly entries: { readonly kit: number; readonly copyh: number };
  /** The reference's ids of more than one entry, each entry compared under its own key (COPY-H's are held to them by the keys). */
  readonly idsTwice: string[];
  readonly p1: { readonly kit: number; readonly copyh: number };
  readonly pnlLabels: number;
  /** Each label pair pnl 0 made, listed: account, Monday, the kit's label and COPY-H's (C15 (a): every difference listed; the engine review's L8). */
  readonly pnlPairs: string[];
  readonly allowed: string[];
  readonly differ: string[];
};

/**
 * Holds COPY-H's path to the reference, field for field. Allowed, listed
 * (C15 (a)): the labels pnl 0 turns into each other; and in a matching
 * event holding a row beyond the boundary (`beyond`: a quantity of more
 * than 15 digits, whose chain no double gives back), its fills' heads, the
 * order events holding its fills and the exits at its instant. Every other
 * difference fails: a fill's head, an order event, an entry's key, D,
 * direction or exits, P1, a label, the habits. Each entry is compared under
 * its key, so two entries of one id are both compared, in the kit's order.
 */
export function compareAccount(
  addr: string,
  mondays: readonly number[],
  ref: Path,
  mine: Path,
  beyond: readonly number[],
): AccountComparison {
  const allowed: string[] = [];
  const differ: string[] = [];
  const matching = (f: Fill) => `${f.oid}|${f.iid}|${f.t}`;
  const beyondEvents = new Set(beyond.map((i) => matching(mine.fills[i]!)));
  const inBeyond = mine.fills.filter((f) => beyondEvents.has(matching(f)));
  const beyondTrades = new Set(inBeyond.map((f) => `${f.iid}|${f.tid}`));
  const beyondAt = new Set(inBeyond.map((f) => `${f.iid}|${f.t}`));
  let heads = 0;
  let headsBeyond = 0;
  mine.fills.forEach((f, i) => {
    if (f.prev === ref.fills[i]!.prev) return;
    if (beyondEvents.has(matching(f))) headsBeyond += 1;
    else heads += 1;
  });
  if (heads > 0) differ.push(`${addr}: ${heads} fills take another chain head`);
  if (headsBeyond > 0)
    allowed.push(
      `${addr}: ${headsBeyond} fills take another chain head, in matching events beyond the boundary's digits`,
    );
  /** The events of `b` that `a` lacks, field for field. */
  const unmatched = (a: readonly OrderEvent[], b: readonly OrderEvent[]) => {
    const bag = new Map<string, number>();
    for (const e of a) bag.set(eventKey(e), (bag.get(eventKey(e)) ?? 0) + 1);
    return b.filter((e) => {
      const c = bag.get(eventKey(e)) ?? 0;
      if (c > 0) bag.set(eventKey(e), c - 1);
      return c === 0;
    });
  };
  const held = (e: OrderEvent) =>
    e.tids.some((tid) => beyondTrades.has(`${e.iid}|${tid}`));
  for (const [whose, list] of [
    ["the kit's", unmatched(mine.events, ref.events)],
    ["COPY-H's", unmatched(ref.events, mine.events)],
  ] as const) {
    const ok = list.filter(held).length;
    if (ok > 0)
      allowed.push(
        `${addr}: ${ok} of ${whose} events not the other's, in matching events beyond the boundary's digits`,
      );
    if (list.length > ok)
      differ.push(
        `${addr}: ${list.length - ok} of ${whose} events not the other's`,
      );
  }
  const idsTwice: string[] = [];
  for (const [key, e] of ref.entries) {
    const m = mine.entries.get(key);
    const outside = (xs: readonly CopyExit[]) =>
      xs.filter((x) => !beyondAt.has(`${e.group.iid}|${x.t}`));
    // An id's second entry: the key of its ordinal 1.
    if (key.endsWith("#1")) idsTwice.push(key.slice(0, -2));
    if (m === undefined) differ.push(`${key}: the kit's entry only`);
    else if (m.D !== e.D || m.group.dir !== e.group.dir)
      differ.push(`${key}: its D or direction differs`);
    else if (!isDeepStrictEqual(m.exits, e.exits))
      (isDeepStrictEqual(outside(m.exits), outside(e.exits))
        ? allowed
        : differ
      ).push(`${key}: its exits differ`);
  }
  for (const key of mine.entries.keys())
    if (!ref.entries.has(key)) differ.push(`${key}: COPY-H's entry only`);
  const pnlPairs: string[] = [];
  mondays.forEach((M, k) => {
    const a = ref.facts[k]!;
    const b = mine.facts[k]!;
    const at = `${addr} ${day(M)}`;
    if (a.p1 !== b.p1)
      differ.push(`${at}: P1 ${a.p1} / ${b.p1} (${a.label} / ${b.label})`);
    else if (a.label !== b.label) {
      if (PNL_LABELS.includes(a.label) && PNL_LABELS.includes(b.label))
        pnlPairs.push(`${at}: label ${a.label} / ${b.label}`);
      else differ.push(`${at}: label ${a.label} / ${b.label}`);
    }
    if (
      a.closed !== b.closed ||
      a.medianHoldMs !== b.medianHoldMs ||
      a.longShare !== b.longShare
    )
      differ.push(
        `${at}: habits ${a.closed} ${a.medianHoldMs} ${a.longShare} / ${b.closed} ${b.medianHoldMs} ${b.longShare}`,
      );
  });
  return {
    events: { kit: ref.events.length, copyh: mine.events.length },
    entries: { kit: ref.entries.size, copyh: mine.entries.size },
    idsTwice,
    p1: {
      kit: ref.facts.filter((f) => f.p1).length,
      copyh: mine.facts.filter((f) => f.p1).length,
    },
    pnlLabels: pnlPairs.length,
    pnlPairs,
    allowed,
    differ,
  };
}

/**
 * The kit's own panel reader (C15 (a); the supervisor's ruling Q7):
 * `loadMarket` reads a market's file where the kit keeps it, held to the
 * kit's pinned hash. The paper's `Research` type leaves it out.
 */
export const kitPanel = (kit: Research): ((iid: number) => Market) =>
  (kit.panel as Research["panel"] & { loadMarket: (iid: number) => Market })
    .loadMarket;

/** FIND-6-EXITS's and X3's hold: 24 h, C10's horizon. */
const HELD_MS = D_HORIZON_HOURS * HOUR_MS;
const BPS = 1e4;

/**
 * A copy's reading in bps of its $1,000 — its net, gross, fees and funding,
 * and as text the fields held exactly (the hold and full exit, the funding
 * hours missing, the spread fallback) — or why it is unpriced.
 */
export type Reading =
  | {
      readonly net: number;
      readonly gross: number;
      readonly fees: number;
      readonly funding: number;
      readonly exact: string;
      readonly reason?: undefined;
    }
  | { readonly reason: string };

/** C15 (a)'s readings of a known copy: exits copied at its D and at D = 0, and held 24 h from its follow instant. */
export const READINGS = ["exits", "zero", "held"] as const;
export type Readings = Readonly<Record<(typeof READINGS)[number], Reading>>;

/** A coin as money.ts's `planOf` reads it: where its copies end, and its Settlement (C8). */
export type Coin = { readonly end: number; readonly settlement: unknown };

/** Held 24 h from the follow instant in bps, the kit's `leg` on the path's own t, D and direction, or lib-exits' reason. */
function heldOf(
  kit: Research,
  mk: Market,
  setting: Setting,
  e: Entry,
): Reading {
  const tIn = e.group.t + e.D;
  const r = kit.returns.leg(mk, {
    dir: e.group.dir,
    tIn,
    h: HELD_MS,
    setting,
  });
  if (r === null)
    return { reason: kit.exits.unpricedReason(mk, tIn, tIn + HELD_MS) };
  return {
    net: r.net * BPS,
    gross: r.gross * BPS,
    fees: r.fees * BPS,
    funding: r.funding * BPS,
    exact: `${r.fundingMissing} ${r.spreadFallback}`,
  };
}

/** COPY-H's readings of an entry (C8): money.ts's plan to the coin's end and its price. */
export function copyhReadings(
  kit: Research,
  mk: Market,
  setting: Setting,
  e: Entry,
  coin: Coin,
): Readings {
  const { t, dir } = e.group;
  const at = (D: number): Reading => {
    const plan = planOf({ t, D }, e.exits, coin);
    const m: Money = moneyOf(kit, mk, { dir, tIn: t + D, plan }, setting);
    if (m.reason !== undefined) return m;
    return {
      net: m.net,
      gross: m.gross,
      fees: m.fees,
      funding: m.funding,
      exact: `${m.holdMs} ${m.fullExitMs} ${m.fundingMissing} ${m.spreadFallback}`,
    };
  };
  return { exits: at(e.D), zero: at(0), held: heldOf(kit, mk, setting, e) };
}

/** The reference's readings (C15 (a)): lib-exits' `planCopy` (the cut's) and `priceCopy`, in bps. */
export function referenceReadings(
  kit: Research,
  mk: Market,
  setting: Setting,
  e: Entry,
): Readings {
  const { t, dir } = e.group;
  const at = (D: number): Reading => {
    const { legs } = kit.exits.planCopy({ t, D }, e.exits);
    const p: CopyPrice = kit.exits.priceCopy(mk, {
      dir,
      tIn: t + D,
      legs,
      setting,
    });
    if (p.reason !== undefined) return p;
    return {
      net: p.net * BPS,
      gross: p.gross * BPS,
      fees: p.fees * BPS,
      funding: p.funding * BPS,
      exact: `${p.hold} ${p.fullExit} ${p.fundingMissing} ${p.spreadFallback}`,
    };
  };
  return { exits: at(e.D), zero: at(0), held: heldOf(kit, mk, setting, e) };
}

/** A reading held to its reference: equal (with the largest difference of its bps fields), unpriced alike, or why the two differ. */
export type Compared =
  | { readonly kind: "equal"; readonly largest: number }
  | { readonly kind: "unpriced" }
  | { readonly kind: "differ"; readonly why: string };

const BPS_FIELDS = ["net", "gross", "fees", "funding"] as const;

/** Equal: both priced, the exact fields alike and each bps field within REPRODUCTION_TOLERANCE_BPS (C15 (a)); unpriced alike: one reason. */
export function compareReading(mine: Reading, ref: Reading): Compared {
  if (mine.reason !== undefined || ref.reason !== undefined)
    return mine.reason === ref.reason
      ? { kind: "unpriced" }
      : {
          kind: "differ",
          why: `unpriced: ${mine.reason ?? "no"} / ${ref.reason ?? "no"}`,
        };
  if (mine.exact !== ref.exact)
    return { kind: "differ", why: `${mine.exact} / ${ref.exact}` };
  const largest = Math.max(
    ...BPS_FIELDS.map((f) => Math.abs(mine[f] - ref[f])),
  );
  return largest <= REPRODUCTION_TOLERANCE_BPS
    ? { kind: "equal", largest }
    : { kind: "differ", why: `by ${largest} bps` };
}

/** The seed as the reproduction reads it: its accounts, in address order, and each one's file held to its manifest line. */
export type SeedSource = {
  readonly accounts: readonly string[];
  load(addr: string): SeedAccount;
};

/**
 * The seed's accounts from its frozen manifest (`experiment/seed.sha256`,
 * the paper's `readManifest`), each file sealed by name and real path and
 * held inside the run's roots (C0 seal 5; D15) before the paper's
 * `loadSeed` holds it to its line and parses it; a file it refuses is a
 * failed check (exit 6; the supervisor's ruling, 2026-11-26).
 */
export function seedSource(o: {
  dir: string;
  manifest: ReadonlyMap<string, string>;
  roots: readonly string[];
  load: (
    dir: string,
    manifest: ReadonlyMap<string, string>,
    addr: string,
  ) => SeedAccount | null;
}): SeedSource {
  const accounts = [...o.manifest.keys()]
    .map((name) => {
      const m = /^(0x[0-9a-f]{40})\.json\.gz$/.exec(name);
      if (m === null) throw new ReproError(`the seed's manifest names ${name}`);
      return m[1]!;
    })
    .sort();
  return {
    accounts,
    load(addr) {
      const file = path.join(o.dir, `${addr}.json.gz`);
      checkPath(file, SEALED);
      checkInside(file, o.roots);
      let seed: SeedAccount | null;
      try {
        seed = o.load(o.dir, o.manifest, addr);
      } catch (err) {
        throw new ReproError(`${addr}: ${(err as Error).message}`);
      }
      if (seed === null)
        throw new ReproError(`${addr}: the seed's manifest lists no file`);
      return seed;
    },
  };
}

const Population = z.object({
  accounts: z.array(z.object({ addr: z.string(), holdout: z.boolean() })),
});

/**
 * A file of the kit's data, `kit/data/<name>`, parsed only once its SHA-256
 * is its line's in the kit's FINGERPRINT.sha256, and that list's own the
 * pinned fingerprint (the supervisor's condition, 2026-11-26): whatever the
 * order of calls, no kit file the kit's check has not held is read.
 */
function kitData(researchRoot: string, name: string): unknown {
  const kit = path.join(researchRoot, "kit");
  const list = readFileSync(path.join(kit, "FINGERPRINT.sha256"));
  if (sha256(list) !== KIT_FINGERPRINT)
    throw new ReproError(
      `the kit's FINGERPRINT.sha256 is not the pinned ${KIT_FINGERPRINT}`,
    );
  const want = list
    .toString("utf8")
    .split("\n")
    .map((line) => /^([0-9a-f]{64}) \*(.+)$/.exec(line.trim()))
    .find((m) => m?.[2] === `data/${name}`)?.[1];
  const bytes = readFileSync(path.join(kit, "data", name));
  if (want === undefined || sha256(bytes) !== want)
    throw new ReproError(`the kit's data/${name} is not its fingerprint's`);
  return JSON.parse(bytes.toString("utf8"));
}

/** The kit's pool outside its holdout (`kit/data/population.json`): the only accounts the reproduction reads. */
export const poolOf = (researchRoot: string): Set<string> =>
  new Set(
    Population.parse(kitData(researchRoot, "population.json"))
      .accounts.filter((a) => !a.holdout)
      .map((a) => a.addr),
  );

const RuleBook = z.object({
  instruments: z.array(z.object({ iid: z.number().int() })),
});

/** The kit's rule book's instruments (`kit/data/rulebook.json`): R6's markets, its primary cell's first condition (the paper's `primaryMarket`). */
export const kitInstruments = (researchRoot: string): Set<number> =>
  new Set(
    RuleBook.parse(kitData(researchRoot, "rulebook.json")).instruments.map(
      (i) => i.iid,
    ),
  );

/** A list printed with its count: its first lines only. */
export type Listed = { readonly count: number; readonly first: string[] };
const LISTED = 100;
const listed = (lines: readonly string[]): Listed => ({
  count: lines.length,
  first: lines.slice(0, LISTED),
});

/** A mean in bps by trader: the kit's `cr1Test` clustered by address, as X3's figures (lib-exits' `meanCR1`). */
export type Figure = {
  readonly n: number;
  readonly traders: number;
  readonly mean: number | null;
  readonly se: number | null;
};

/** Values held to their references: equal (the largest difference in bps kept), null or unpriced alike for one reason, and the differences. */
export type Tally = {
  readonly equal: number;
  readonly unpriced: number;
  readonly largest: number;
  readonly differ: Listed;
};

function tallyOf(compared: readonly (readonly [string, Compared])[]): Tally {
  let equal = 0;
  let unpriced = 0;
  let largest = 0;
  const lines: string[] = [];
  for (const [id, c] of compared)
    if (c.kind === "equal") {
      equal += 1;
      largest = Math.max(largest, c.largest);
    } else if (c.kind === "unpriced") unpriced += 1;
    else lines.push(`${id}: ${c.why}`);
  return { equal, unpriced, largest, differ: listed(lines) };
}

/** One reading over a known set's copies found in both paths, with each path's mean net and gross by trader over its priced copies. */
export type ReadingReport = Tally & {
  readonly copyh: { readonly net: Figure; readonly gross: Figure };
  readonly kit: { readonly net: Figure; readonly gross: Figure };
};

type ReadingName = (typeof READINGS)[number];
const byReading = <T>(f: (k: ReadingName) => T): Record<ReadingName, T> => ({
  exits: f("exits"),
  zero: f("zero"),
  held: f("held"),
});

/** A known set's entries found in both paths (their equality is `compareAccount`'s), those not found, and its copies' readings. */
export type SetReport = {
  readonly count: number;
  readonly found: number;
  readonly missing: Listed;
  readonly readings: Readonly<Record<ReadingName, ReadingReport>>;
};

/**
 * A retired market of the kit's panel holding known copies (the
 * supervisor's ruling on Q1, 2026-11-26): each set's copies on it, and how
 * many of them money.ts's settled rule would change, in plan and so in
 * price, were the retirement read as a Settlement (the coin's end the
 * panel's, its Settlement the retirement) in place of the paper's R8 and
 * R11 at the cut.
 */
export type RetiredReport = {
  readonly iid: number;
  readonly symbol: string;
  readonly end: string;
  readonly sets: Readonly<
    Record<string, { readonly copies: number; readonly changed: number }>
  >;
};

/** The lines whose copies the reproduction judges, each with its own accounts as d's removal (C10; the supervisor's ruling on Q3). */
export const JUDGED = ["MAIN", "TEN"] as const;
export type JudgedLine = (typeof JUDGED)[number];

/**
 * R7's account-level conditions at M as the paper's `linesAt` reads them,
 * on the reference's facts and R3's coverage: MAIN, P1 with the habit
 * window covered, a median hold of at least 6 h and at least 3 closed
 * cycles; TEN, MAIN with at least 10.
 */
export function referenceLines(
  f: MondayFacts,
  coverage: Coverage,
): Record<JudgedLine, boolean> {
  const main =
    f.p1 &&
    coverage.habitCovered &&
    f.medianHoldMs !== null &&
    f.medianHoldMs >= 6 * HOUR_MS &&
    f.closed >= 3;
  return { MAIN: main, TEN: main && f.closed >= 10 };
}

/** The paper's Monday of an instant (its part 4's), the reference's. */
const paperMonday = (t: number) =>
  Math.floor((t - 4 * DAY_MS) / (7 * DAY_MS)) * 7 * DAY_MS + 4 * DAY_MS;

/** The reference's fills of a line's member in the week of M, cut at `end`: market trades only, an ADL or settlement fill none (the seed holds one account's side of a trade). */
function marketWeek(
  seed: SeedAccount,
  fills: readonly Fill[],
  M: number,
  end: number,
): Fill[] {
  const to = Math.min(M + 7 * DAY_MS, end);
  return fills.filter(
    (f, i) =>
      f.t >= M &&
      f.t < to &&
      seed.rows[i]!.adl !== true &&
      seed.rows[i]!.settlement !== true,
  );
}

/** A d or x′ in bps, or why it is null (C11). */
export type Judgement =
  | { readonly bps: number; readonly reason?: undefined }
  | { readonly reason: string };

/** A judgement held to its reference: equal within REPRODUCTION_TOLERANCE_BPS, null alike for one reason, or why not. */
export function compareJudgement(mine: Judgement, ref: Judgement): Compared {
  if (mine.reason !== undefined || ref.reason !== undefined)
    return mine.reason === ref.reason
      ? { kind: "unpriced" }
      : {
          kind: "differ",
          why: `null: ${mine.reason ?? "no"} / ${ref.reason ?? "no"}`,
        };
  const largest = Math.abs(mine.bps - ref.bps);
  return largest <= REPRODUCTION_TOLERANCE_BPS
    ? { kind: "equal", largest }
    : { kind: "differ", why: `by ${largest} bps` };
}

/** An entry judged in a line (C10): its account, instant, delay, direction and coin, its Monday's index, and the long share there. */
export type JudgedCopy = {
  readonly addr: string;
  readonly t: number;
  readonly D: number;
  readonly dir: number;
  readonly iid: number;
  readonly k: number;
  readonly longShare: number | null;
};

/**
 * The reference's d and x′ (C15 (a)): the kit's `dAgainstNull` at 24 h with
 * the `removalOf` of the line's members, in bps, and d less the copy's own
 * cost over the same 24 h (the kit's `leg`); a null long share leaves both
 * null, as the paper's scorer.
 */
export function referenceJudgement(
  kit: Research,
  mk: Market,
  c: JudgedCopy,
  removed: (minute: number) => number,
  setting: Setting,
): { readonly d: Judgement; readonly edge: Judgement } {
  if (c.longShare === null) {
    const none = { reason: "no long share" };
    return { d: none, edge: none };
  }
  const r = kit.nulls.dAgainstNull(mk, {
    dir: c.dir,
    t: c.t,
    D: c.D,
    h: HELD_MS,
    longShare: c.longShare,
    removed,
  });
  if (r.d === null) {
    const none = { reason: r.reason };
    return { d: none, edge: none };
  }
  const d = r.d * BPS;
  const L = kit.returns.leg(mk, {
    dir: c.dir,
    tIn: c.t + c.D,
    h: HELD_MS,
    setting,
  });
  return {
    d: { bps: d },
    edge:
      L === null
        ? { reason: "the 24 h leg unpriced" }
        : { bps: d - (L.gross - L.net) * BPS },
  };
}

/** A line's entries and their traders. */
export type Count = { readonly entries: number; readonly traders: number };

/** d and x′ of a line's copies judged in both paths, each held to the reference, and COPY-H's null reasons counted. */
export type JudgedReport = {
  readonly copies: number;
  readonly d: Tally;
  readonly edge: Tally;
  readonly nulls: Readonly<Record<string, number>>;
};

/** What the accounts' part of the reproduction found (repro.json's `accounts`). */
export type AccountsReport = {
  readonly accounts: number;
  readonly rows: number;
  /** The seed's first and last fill instants (ms). */
  readonly span: { readonly first: number; readonly last: number };
  readonly mondays: readonly string[];
  readonly events: { readonly kit: number; readonly copyh: number };
  readonly entries: { readonly kit: number; readonly copyh: number };
  /** The reference's ids of more than one entry, listed: each entry compared under its own key. */
  readonly idsTwice: Listed;
  readonly p1: { readonly kit: number; readonly copyh: number };
  readonly pnlLabels: number;
  /** Every label pair pnl 0 made, in full (account, Monday, both labels). */
  readonly pnlPairs: readonly string[];
  readonly sets: Readonly<Record<string, SetReport>>;
  readonly retired: readonly RetiredReport[];
  /** The account-Mondays in MAIN and in TEN (R7's account-level conditions at M). */
  readonly lines: Readonly<
    Record<JudgedLine, { readonly kit: number; readonly copyh: number }>
  >;
  /** FR1's counts: each line's entries with t in [CUT − 28 d, CUT). */
  readonly fr1: Readonly<
    Record<JudgedLine, { readonly kit: Count; readonly copyh: Count }>
  >;
  /** d and x′ of every MAIN and TEN entry of the run's weeks. */
  readonly judged: Readonly<Record<JudgedLine, JudgedReport>>;
  readonly beyond: Listed;
  readonly allowed: Listed;
  readonly differ: Listed;
};

/** A known copy priced in both paths; `changed`, on a retired market, whether the settled reading changes it (null on any other). */
type PricedCopy = {
  readonly addr: string;
  readonly iid: number;
  readonly mine: Readings;
  readonly ref: Readings;
  readonly changed: boolean | null;
};

/** FR1's weeks: the last four before the cut (APPROACH-REVIEW's FR1; PAPER-BUILD's part 4). */
const FR1_MS = 28 * DAY_MS;

/**
 * Every seed account through both paths, one at a time: never one of the
 * kit's holdout (`pool` holds the population's accounts outside it), no row
 * at or after the kit's cut (the paper's blind store); each known set's
 * entry ids (known.json's) looked up in both paths (`knownEntry`: an id of
 * two entries refused), and each one found in both priced in both on the
 * kit's panel (`market`, its markets by iid: `kitPanel`, or a test's) with
 * the kit's taker setting. The seed's weeks
 * end at the cut, under the paper's R8 and R11: no market of the kit's
 * panel is read as a settled coin (the supervisor's ruling on Q1,
 * 2026-11-26). At each Monday, each path's MAIN and TEN: COPY-H's by
 * lines.ts with R3's coverage, the reference's by R7 as the paper reads it;
 * every entry of a Monday of the run in either line, in a market of R6's
 * primary cells (`instruments`: the kit's rule book's, then the kit's
 * `inPrimaryCell`), judged with the line's members' records of its week:
 * COPY-H's through judge.ts, the reference's through the kit.
 */
export function reproduceAccounts(o: {
  kit: Research;
  seed: SeedSource;
  pool: ReadonlySet<string>;
  instruments: ReadonlySet<number>;
  mondays: readonly number[];
  limits: Limits;
  sets: Readonly<Record<string, readonly string[]>>;
  market: (iid: number) => Market;
  setting: Setting;
}): AccountsReport {
  const CUT = o.kit.constants.CUT;
  const seedCoin: Coin = { end: CUT, settlement: null };
  const wanted = new Map<string, Set<string>>();
  for (const ids of Object.values(o.sets))
    for (const id of ids) {
      const addr = id.split("|")[0]!;
      wanted.set(addr, (wanted.get(addr) ?? new Set<string>()).add(id));
    }
  const markets = new Map<number, Market>();
  const marketOf = (iid: number): Market => {
    let mk = markets.get(iid);
    if (mk === undefined) markets.set(iid, (mk = o.market(iid)));
    return mk;
  };
  const mondayAt = new Map(o.mondays.map((M, k) => [M, k]));
  const primary = (g: Group) =>
    o.instruments.has(g.iid) && o.kit.cells.inPrimaryCell(g.iid, g.t);
  const priced = new Map<string, PricedCopy>();
  /** Each path's line members' records of the week of the Monday, by `<line>|<Monday's index>`. */
  const members = {
    copyh: new Map<string, TradeKey[][]>(),
    kit: new Map<string, Fill[][]>(),
  };
  /** Each path's judged copies, by `<line>|<entry key>`. */
  const judged = {
    copyh: new Map<string, JudgedCopy>(),
    kit: new Map<string, JudgedCopy>(),
  };
  const inLines = {
    MAIN: { kit: 0, copyh: 0 },
    TEN: { kit: 0, copyh: 0 },
  };
  let rows = 0;
  const span = { first: Infinity, last: -Infinity };
  const events = { kit: 0, copyh: 0 };
  const entries = { kit: 0, copyh: 0 };
  const p1 = { kit: 0, copyh: 0 };
  const idsTwice: string[] = [];
  let pnlLabels = 0;
  const pnlPairs: string[] = [];
  const beyond: string[] = [];
  const allowed: string[] = [];
  const differ: string[] = [];
  for (const addr of o.seed.accounts) {
    if (!o.pool.has(addr))
      throw new ReproError(
        `${addr} is not in the kit's pool outside the holdout: never read`,
      );
    const seed = o.seed.load(addr);
    for (const r of seed.rows) {
      if (r.timestamp >= CUT)
        throw new ReproError(`${addr}: a seed row at or after the cut`);
      span.first = Math.min(span.first, r.timestamp);
      span.last = Math.max(span.last, r.timestamp);
    }
    rows += seed.rows.length;
    const converted = seedRows(seed);
    for (const i of converted.beyond) {
      const r = seed.rows[i]!;
      beyond.push(
        `${addr} ${r.timestamp} order ${r.order_id} q ${r.quantity} prev ${r.previous_size}`,
      );
    }
    const ref = referenceOf(o.kit, seed, o.mondays);
    const mine = copyhOf(o.kit, seed, converted.rows, o.mondays, o.limits);
    if (mine.kind === "not built") {
      differ.push(`${addr}: COPY-H did not run the kit on it (${mine.why})`);
      continue;
    }
    for (const id of wanted.get(addr) ?? []) {
      const r = knownEntry(ref.entries, addr, id);
      const m = knownEntry(mine.path.entries, addr, id);
      if (r === undefined || m === undefined) continue;
      const mk = marketOf(r.group.iid);
      /** Its plans at D and at D = 0 under a coin: its readings of exits copied are their prices, so they move only when a plan does. */
      const plans = (coin: Coin) =>
        [m.D, 0].map((D) => planOf({ t: m.group.t, D }, m.exits, coin));
      priced.set(id, {
        addr,
        iid: mk.iid,
        mine: copyhReadings(o.kit, mk, o.setting, m, seedCoin),
        ref: referenceReadings(o.kit, mk, o.setting, r),
        changed:
          mk.retired === null
            ? null
            : !isDeepStrictEqual(
                plans(seedCoin),
                plans({ end: mk.end, settlement: mk.retired }),
              ),
      });
    }
    const c = compareAccount(addr, o.mondays, ref, mine.path, converted.beyond);
    events.kit += c.events.kit;
    events.copyh += c.events.copyh;
    entries.kit += c.entries.kit;
    entries.copyh += c.entries.copyh;
    p1.kit += c.p1.kit;
    p1.copyh += c.p1.copyh;
    pnlLabels += c.pnlLabels;
    // Loops, never a list spread into a call (the engine review's section 8).
    for (const id of c.idsTwice) idsTwice.push(id);
    for (const p of c.pnlPairs) pnlPairs.push(p);
    for (const a of c.allowed) allowed.push(a);
    for (const d of c.differ) differ.push(d);
    const lines = o.mondays.map((M, k) => {
      const coverage = seedCoverage(o.kit, seed, M);
      const f = mine.path.facts[k]!;
      const at = {
        copyh: accountLines(f.label, f, coverage),
        kit: referenceLines(ref.facts[k]!, coverage),
      };
      for (const L of JUDGED) {
        if (at.copyh[L] !== at.kit[L])
          differ.push(`${addr} ${day(M)}: ${L} ${at.kit[L]} / ${at.copyh[L]}`);
        const key = `${L}|${k}`;
        if (at.copyh[L]) {
          inLines[L].copyh += 1;
          const list = members.copyh.get(key) ?? [];
          members.copyh.set(key, list);
          list.push(memberRecords(converted.rows, M, CUT));
        }
        if (at.kit[L]) {
          inLines[L].kit += 1;
          const list = members.kit.get(key) ?? [];
          members.kit.set(key, list);
          list.push(marketWeek(seed, ref.fills, M, CUT));
        }
      }
      return at;
    });
    const copyOf = (e: Entry, k: number, longShare: number | null) => ({
      addr,
      t: e.group.t,
      D: e.D,
      dir: e.group.dir,
      iid: e.group.iid,
      k,
      longShare,
    });
    for (const [key, e] of mine.path.entries) {
      const k = mondayAt.get(mondayOf(e.group.t));
      if (k === undefined) continue;
      for (const L of entryLines(lines[k]!.copyh, primary(e.group)))
        if (L === "MAIN" || L === "TEN")
          judged.copyh.set(
            `${L}|${key}`,
            copyOf(e, k, mine.path.facts[k]!.longShare),
          );
    }
    for (const [key, e] of ref.entries) {
      const k = mondayAt.get(paperMonday(e.group.t));
      if (k === undefined || !primary(e.group)) continue;
      for (const L of JUDGED)
        if (lines[k]!.kit[L])
          judged.kit.set(`${L}|${key}`, copyOf(e, k, ref.facts[k]!.longShare));
    }
  }
  const compared = new Map<string, Record<ReadingName, Compared>>();
  for (const [id, p] of priced) {
    const c = byReading((k) => compareReading(p.mine[k], p.ref[k]));
    for (const k of READINGS) {
      const x = c[k];
      if (x.kind === "differ") differ.push(`${id}: ${k} ${x.why}`);
    }
    compared.set(id, c);
  }
  const readingOf = (ids: readonly string[], k: ReadingName): ReadingReport => {
    const figures = (path: "mine" | "ref") => {
      const items = ids.flatMap((id) => {
        const p = priced.get(id)!;
        const r = p[path][k];
        return r.reason === undefined ? [{ addr: p.addr, r }] : [];
      });
      const figure = (f: "net" | "gross"): Figure => {
        const t = o.kit.stats.cr1Test(
          items,
          (i) => i.addr,
          (i) => i.r[f],
        );
        return { n: t.n, traders: t.clusters, mean: t.estimate, se: t.se };
      };
      return { net: figure("net"), gross: figure("gross") };
    };
    return {
      ...tallyOf(ids.map((id) => [id, compared.get(id)![k]] as const)),
      copyh: figures("mine"),
      kit: figures("ref"),
    };
  };
  const retired = [...markets.values()]
    .filter((mk) => mk.retired !== null)
    .sort((a, b) => a.iid - b.iid)
    .map((mk): RetiredReport => ({
      iid: mk.iid,
      symbol: mk.symbol,
      end: new Date(mk.end).toISOString(),
      sets: Object.fromEntries(
        Object.entries(o.sets).map(([name, ids]) => {
          const on = ids.flatMap((id) => {
            const p = priced.get(id);
            return p?.iid === mk.iid ? [p] : [];
          });
          return [
            name,
            {
              copies: on.length,
              changed: on.filter((p) => p.changed === true).length,
            },
          ];
        }),
      ),
    }));
  const removals = {
    copyh: new Map<string, Map<number, Removal>>(),
    kit: new Map<string, (iid: number) => (minute: number) => number>(),
  };
  for (const [key, lists] of members.copyh)
    removals.copyh.set(key, removalsOf(o.kit, lists));
  for (const [key, lists] of members.kit)
    removals.kit.set(key, o.kit.nulls.removalOf(lists));
  const judgedOf = (L: JudgedLine): JudgedReport => {
    const d: (readonly [string, Compared])[] = [];
    const edge: (readonly [string, Compared])[] = [];
    const nulls: Record<string, number> = {};
    const keys = new Set(
      [...judged.copyh.keys(), ...judged.kit.keys()].filter((key) =>
        key.startsWith(`${L}|`),
      ),
    );
    for (const key of keys) {
      const entry = key.slice(L.length + 1);
      const a = judged.copyh.get(key);
      const b = judged.kit.get(key);
      if (a === undefined || b === undefined) {
        differ.push(`${entry}: in ${L} in one path only`);
        continue;
      }
      const mk = marketOf(a.iid);
      const removal = removals.copyh.get(`${L}|${a.k}`)?.get(a.iid);
      const dm = dOf(o.kit, mk, a, a.longShare, removedBy(removal));
      const dJ: Judgement =
        dm.d === null ? { reason: dm.reason } : { bps: dm.d };
      const x = edgeOf(o.kit, mk, a, o.setting, dm);
      const removed = removals.kit.get(`${L}|${b.k}`)!(b.iid);
      const r = referenceJudgement(o.kit, mk, b, removed, o.setting);
      if (dJ.reason !== undefined)
        nulls[dJ.reason] = (nulls[dJ.reason] ?? 0) + 1;
      d.push([entry, compareJudgement(dJ, r.d)]);
      edge.push([
        entry,
        compareJudgement(x === null ? dJ : { bps: x }, r.edge),
      ]);
    }
    for (const [what, list] of [
      ["d", d],
      ["x′", edge],
    ] as const)
      for (const [entry, c] of list)
        if (c.kind === "differ") differ.push(`${entry}: ${L} ${what} ${c.why}`);
    return { copies: d.length, d: tallyOf(d), edge: tallyOf(edge), nulls };
  };
  const fr1Of = (p: "copyh" | "kit", L: JudgedLine): Count => {
    const traders = new Set<string>();
    let n = 0;
    for (const [key, c] of judged[p])
      if (key.startsWith(`${L}|`) && c.t >= CUT - FR1_MS) {
        n += 1;
        traders.add(c.addr);
      }
    return { entries: n, traders: traders.size };
  };
  const byLine = <T>(f: (L: JudgedLine) => T): Record<JudgedLine, T> => ({
    MAIN: f("MAIN"),
    TEN: f("TEN"),
  });
  const judgedLines = byLine(judgedOf);
  return {
    accounts: o.seed.accounts.length,
    rows,
    span,
    mondays: o.mondays.map(day),
    events,
    entries,
    idsTwice: listed(idsTwice),
    p1,
    pnlLabels,
    pnlPairs,
    sets: Object.fromEntries(
      Object.entries(o.sets).map(([name, ids]): [string, SetReport] => {
        const found = ids.filter((id) => priced.has(id));
        return [
          name,
          {
            count: ids.length,
            found: found.length,
            missing: listed(ids.filter((id) => !priced.has(id))),
            readings: byReading((k) => readingOf(found, k)),
          },
        ];
      }),
    ),
    retired,
    lines: inLines,
    fr1: byLine((L) => ({ kit: fr1Of("kit", L), copyh: fr1Of("copyh", L) })),
    judged: judgedLines,
    beyond: listed(beyond),
    allowed: listed(allowed),
    differ: listed(differ),
  };
}

const Ids = z.array(z.string());

/** copyh/known.json, as tools/copyh-known.cjs writes it (C15 (a)): the 26 Mondays, the known sets' entry ids and X3's printed figures. */
export const Known = z.object({
  mondays: z.array(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
  find6exits: Ids,
  x3: Ids,
  x3voted: Ids,
  x3find3: Ids,
  x3printed: z.object({
    exitsCopied: z.object({
      over: z.literal("x3"),
      mean: z.number(),
      se: z.number(),
    }),
    gross: z.object({ over: z.literal("x3"), mean: z.number() }),
    held24h: z.object({
      over: z.literal("x3voted"),
      mean: z.number(),
      se: z.number(),
    }),
  }),
});
export type Known = z.infer<typeof Known>;

/** One known answer held to the record (C15 (a)): what it must be and what the run gave, as text. */
export type Answer = {
  readonly answer: string;
  readonly want: string;
  readonly got: string;
  readonly passed: boolean;
};

/** A figure at one decimal, as X3 printed it. */
const decimal = (mean: number | null, se?: number | null) =>
  `${mean?.toFixed(1) ?? "none"}${se === undefined ? "" : ` ± ${se?.toFixed(1) ?? "none"}`}`;

/**
 * C15 (a)'s known answers, each held to the record (design.ts
 * REPRODUCTION; known.json's `x3printed`): no difference; every known entry
 * found in both paths; FIND-6-EXITS's 1,700 equal in each reading; X3's
 * 1,366 equal exits copied, and its figures by trader at one decimal in
 * both paths (exits copied and gross over X3's set, held 24 h over its
 * voted set); X3's 1,104 equal held 24 h; the 26 Mondays; FR1's counts in
 * both paths; every MAIN and TEN copy's d and x′ equal or null alike, at
 * least one judged.
 */
export function answersOf(
  r: AccountsReport,
  printed: Known["x3printed"],
): Answer[] {
  const [F6, X3, X3_FIND3, MONDAYS, MAIN_E, MAIN_T, TEN_E, TEN_T] =
    REPRODUCTION;
  const set = (name: string): SetReport => {
    const s = r.sets[name];
    if (s === undefined) throw new ReproError(`no known set ${name}`);
    return s;
  };
  const equal = (
    answer: string,
    name: string,
    k: ReadingName,
    want: number,
  ): Answer => {
    const s = set(name);
    const x = s.readings[k];
    return {
      answer,
      want: `${want} of ${want}`,
      got: `${x.equal} of ${s.count} (the largest difference ${x.largest} bps)`,
      passed: x.equal === want && s.count === want,
    };
  };
  const figure = (
    answer: string,
    x: ReadingReport,
    f: "net" | "gross",
    p: { readonly mean: number; readonly se?: number },
  ): Answer => {
    const at = (g: Figure) =>
      decimal(g.mean, p.se === undefined ? undefined : g.se);
    const want = decimal(p.mean, p.se);
    return {
      answer,
      want,
      got: `COPY-H ${at(x.copyh[f])}, the kit ${at(x.kit[f])}`,
      passed: at(x.copyh[f]) === want && at(x.kit[f]) === want,
    };
  };
  const fr1 = (L: JudgedLine, entries: number, traders: number): Answer => {
    const at = (c: Count) => `${c.entries} entries, ${c.traders} traders`;
    const want = at({ entries, traders });
    const { kit, copyh } = r.fr1[L];
    return {
      answer: `FR1: ${L}'s entries in the four weeks before the cut`,
      want,
      got: `COPY-H ${at(copyh)}, the kit ${at(kit)}`,
      passed: at(copyh) === want && at(kit) === want,
    };
  };
  const judgedAs = (L: JudgedLine, what: "d" | "edge"): Answer => {
    const { copies } = r.judged[L];
    const x = r.judged[L][what];
    return {
      answer: `${what === "d" ? "d" : "x′"} of ${L}'s copies`,
      want: `${copies} of ${copies}, at least one`,
      got: `${x.equal + x.unpriced} of ${copies} (${x.unpriced} null alike, the largest difference ${x.largest} bps)`,
      passed: copies > 0 && x.equal + x.unpriced === copies,
    };
  };
  const sets = Object.values(r.sets);
  const count = sets.reduce((s, x) => s + x.count, 0);
  const found = sets.reduce((s, x) => s + x.found, 0);
  return [
    {
      answer: "every value of COPY-H's path equal to the kit's",
      want: "0 differences",
      got: `${r.differ.count} differences`,
      passed: r.differ.count === 0,
    },
    {
      answer: "every known entry found in both paths",
      want: `${count} of ${count}`,
      got: `${found} of ${count}`,
      passed: found === count,
    },
    equal("FIND-6-EXITS's copies, exits copied", "find6exits", "exits", F6),
    equal("FIND-6-EXITS's copies, held 24 h", "find6exits", "held", F6),
    equal("FIND-6-EXITS's copies at D = 0", "find6exits", "zero", F6),
    equal("X3's copies, exits copied", "x3", "exits", X3),
    figure(
      "X3's exits copied by trader",
      set("x3").readings.exits,
      "net",
      printed.exitsCopied,
    ),
    figure(
      "X3's gross by trader",
      set("x3").readings.exits,
      "gross",
      printed.gross,
    ),
    figure(
      "X3's held 24 h by trader, over its voted set",
      set("x3voted").readings.held,
      "net",
      printed.held24h,
    ),
    equal(
      "X3's 1,104 in FIND-3's look, held 24 h",
      "x3find3",
      "held",
      X3_FIND3,
    ),
    {
      answer: "the Mondays",
      want: String(MONDAYS),
      got: String(r.mondays.length),
      passed: r.mondays.length === MONDAYS,
    },
    fr1("MAIN", MAIN_E, MAIN_T),
    fr1("TEN", TEN_E, TEN_T),
    judgedAs("MAIN", "d"),
    judgedAs("MAIN", "edge"),
    judgedAs("TEN", "d"),
    judgedAs("TEN", "edge"),
  ];
}

/** C15 (a)'s reproduction, repro.json's body but its identity: the accounts' part and its known answers; passed when every answer is. */
export type Repro = {
  readonly passed: boolean;
  readonly report: {
    readonly accounts: AccountsReport;
    readonly answers: readonly Answer[];
  };
};

/**
 * The whole reproduction (C15 (a)): every seed account through both paths
 * on known.json's 26 Mondays and sets, the known copies priced on the
 * kit's panel (`market`: `kitPanel`) with the kit's taker setting, and the
 * known answers held to the record. The `reproduce` command (main.ts)
 * gives it the seed (`seedSource`), the pool (`poolOf`), R6's instruments
 * (`kitInstruments`), known.json (`Known`) and design.ts's limits, writes
 * repro.json whole with its identity first, and exits 6 unless it passed.
 */
export function reproduce(o: {
  kit: Research;
  seed: SeedSource;
  pool: ReadonlySet<string>;
  instruments: ReadonlySet<number>;
  known: Known;
  limits: Limits;
  market: (iid: number) => Market;
}): Repro {
  const accounts = reproduceAccounts({
    kit: o.kit,
    seed: o.seed,
    pool: o.pool,
    instruments: o.instruments,
    mondays: o.known.mondays.map((d) => Date.parse(`${d}T00:00:00Z`)),
    limits: o.limits,
    sets: {
      find6exits: o.known.find6exits,
      x3: o.known.x3,
      x3voted: o.known.x3voted,
      x3find3: o.known.x3find3,
    },
    market: o.market,
    setting: o.kit.costs.SETTINGS.taker,
  });
  const answers = answersOf(accounts, o.known.x3printed);
  return {
    passed: answers.every((a) => a.passed),
    report: { accounts, answers },
  };
}
