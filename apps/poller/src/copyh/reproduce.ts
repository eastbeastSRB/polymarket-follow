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
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { z } from "zod";
import type {
  Capture,
  CopyExit,
  Fill,
  Group,
  OrderEvent,
  Research,
} from "../paper/research.js";
import type { SeedAccount } from "../paper/seed.js";
import { DAY_MS } from "../schedule.js";
import type { AccountRow } from "./accounts.js";
import { MERGE_MS } from "./design.js";
import {
  delayOf,
  entriesIn,
  historyOf,
  type Limits as HistoryLimits,
} from "./entries.js";
import {
  DIRECTIONAL,
  fillsBefore,
  habitsAtMonday,
  isP1,
  labelOf,
  type Coverage,
} from "./labels.js";
import { normOf } from "./normalize.js";
import { CheckFailed } from "./run.js";
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

/** One account as one path gives it: fills in the kit's `normFill` fields, events, entries by id, the facts at each Monday. */
export type Path = {
  readonly fills: readonly Fill[];
  readonly events: readonly OrderEvent[];
  readonly entries: ReadonlyMap<string, Entry>;
  readonly facts: readonly MondayFacts[];
};

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
    entries.set(id, {
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
    entries.set(id, { group: g, D, exits: kit.exits.exitsOf(g, h.liqKeys) });
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
  readonly p1: { readonly kit: number; readonly copyh: number };
  readonly pnlLabels: number;
  readonly allowed: string[];
  readonly differ: string[];
};

/**
 * Holds COPY-H's path to the reference, field for field. Allowed, listed
 * (C15 (a)): the labels pnl 0 turns into each other; and in a matching
 * event holding a row beyond the boundary (`beyond`: a quantity of more
 * than 15 digits, whose chain no double gives back), its fills' heads, the
 * order events holding its fills and the exits at its instant. Every other
 * difference fails: a fill's head, an order event, an entry's id, D or
 * exits, P1, a label, the habits.
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
  for (const [id, e] of ref.entries) {
    const m = mine.entries.get(id);
    const outside = (xs: readonly CopyExit[]) =>
      xs.filter((x) => !beyondAt.has(`${e.group.iid}|${x.t}`));
    if (m === undefined) differ.push(`${id}: the kit's entry only`);
    else if (m.D !== e.D || m.group.dir !== e.group.dir)
      differ.push(`${id}: its D or direction differs`);
    else if (!isDeepStrictEqual(m.exits, e.exits))
      (isDeepStrictEqual(outside(m.exits), outside(e.exits))
        ? allowed
        : differ
      ).push(`${id}: its exits differ`);
  }
  for (const id of mine.entries.keys())
    if (!ref.entries.has(id)) differ.push(`${id}: COPY-H's entry only`);
  let pnlLabels = 0;
  mondays.forEach((M, k) => {
    const a = ref.facts[k]!;
    const b = mine.facts[k]!;
    const at = `${addr} ${day(M)}`;
    if (a.p1 !== b.p1)
      differ.push(`${at}: P1 ${a.p1} / ${b.p1} (${a.label} / ${b.label})`);
    else if (a.label !== b.label) {
      if (PNL_LABELS.includes(a.label) && PNL_LABELS.includes(b.label))
        pnlLabels += 1;
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
    p1: {
      kit: ref.facts.filter((f) => f.p1).length,
      copyh: mine.facts.filter((f) => f.p1).length,
    },
    pnlLabels,
    allowed,
    differ,
  };
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
 * `loadSeed` holds it to its line and parses it.
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
      const seed = o.load(o.dir, o.manifest, addr);
      if (seed === null)
        throw new ReproError(`${addr}: the seed's manifest lists no file`);
      return seed;
    },
  };
}

const Population = z.object({
  accounts: z.array(z.object({ addr: z.string(), holdout: z.boolean() })),
});

/** The kit's pool outside its holdout (`kit/data/population.json`, under the kit's fingerprint): the only accounts the reproduction reads. */
export const poolOf = (researchRoot: string): Set<string> =>
  new Set(
    Population.parse(
      JSON.parse(
        readFileSync(
          path.join(researchRoot, "kit", "data", "population.json"),
          "utf8",
        ),
      ),
    )
      .accounts.filter((a) => !a.holdout)
      .map((a) => a.addr),
  );

/** A list printed with its count: its first lines only. */
export type Listed = { readonly count: number; readonly first: string[] };
const LISTED = 100;
const listed = (lines: readonly string[]): Listed => ({
  count: lines.length,
  first: lines.slice(0, LISTED),
});

/** A known set's entries found in both paths (their equality is `compareAccount`'s), and those not found. */
export type SetReport = {
  readonly count: number;
  readonly found: number;
  readonly missing: Listed;
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
  readonly p1: { readonly kit: number; readonly copyh: number };
  readonly pnlLabels: number;
  readonly sets: Readonly<Record<string, SetReport>>;
  readonly beyond: Listed;
  readonly allowed: Listed;
  readonly differ: Listed;
};

/**
 * Every seed account through both paths, one at a time: never one of the
 * kit's holdout (`pool` holds the population's accounts outside it), no row
 * at or after the kit's cut (the paper's blind store); each known set's
 * entry ids (known.json's) looked up in both paths.
 */
export function reproduceAccounts(o: {
  kit: Research;
  seed: SeedSource;
  pool: ReadonlySet<string>;
  mondays: readonly number[];
  limits: Limits;
  sets: Readonly<Record<string, readonly string[]>>;
}): AccountsReport {
  const CUT = o.kit.constants.CUT;
  const wanted = new Map<string, string[]>();
  for (const ids of Object.values(o.sets))
    for (const id of ids) {
      const addr = id.split("|")[0]!;
      const list = wanted.get(addr);
      if (list === undefined) wanted.set(addr, [id]);
      else list.push(id);
    }
  const found = new Set<string>();
  let rows = 0;
  const span = { first: Infinity, last: -Infinity };
  const events = { kit: 0, copyh: 0 };
  const entries = { kit: 0, copyh: 0 };
  const p1 = { kit: 0, copyh: 0 };
  let pnlLabels = 0;
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
    for (const id of wanted.get(addr) ?? [])
      if (ref.entries.has(id) && mine.path.entries.has(id)) found.add(id);
    const c = compareAccount(addr, o.mondays, ref, mine.path, converted.beyond);
    events.kit += c.events.kit;
    events.copyh += c.events.copyh;
    entries.kit += c.entries.kit;
    entries.copyh += c.entries.copyh;
    p1.kit += c.p1.kit;
    p1.copyh += c.p1.copyh;
    pnlLabels += c.pnlLabels;
    allowed.push(...c.allowed);
    differ.push(...c.differ);
  }
  return {
    accounts: o.seed.accounts.length,
    rows,
    span,
    mondays: o.mondays.map(day),
    events,
    entries,
    p1,
    pnlLabels,
    sets: Object.fromEntries(
      Object.entries(o.sets).map(([name, ids]) => [
        name,
        {
          count: ids.length,
          found: ids.filter((id) => found.has(id)).length,
          missing: listed(ids.filter((id) => !found.has(id))),
        },
      ]),
    ),
    beyond: listed(beyond),
    allowed: listed(allowed),
    differ: listed(differ),
  };
}
