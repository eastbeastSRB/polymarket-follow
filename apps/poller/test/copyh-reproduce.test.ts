/**
 * The reproduction (src/copyh/reproduce.ts; rules.md C15 (a), RM6), on
 * made-up seeds:
 * - the converter: each of the paper's order events split by timestamp,
 *   each timestamp's fills chained from its previous_size exactly (a buy's
 *   chain rising, a sell's falling, decimals a double would round), so that
 *   C3's chain rule heads every fill with it; an event over two timestamps,
 *   both chains from its one previous_size, the kit's one event again; every
 *   field in Hyperliquid's (side, crossed, own liquidation, kind, the market
 *   reading; iid the instrument's id; ids above 2^53 kept); the rows beyond
 *   the boundary's 15 digits listed, at 15 and 16; a text that is not a
 *   plain decimal and rows out of time order refused;
 * - the two paths: the kit on a made-up seed's own rows and COPY-H's on its
 *   converted rows equal field for field (events, entries with their D and
 *   exits, labels, P1 and habits at each Monday) for a directional trader
 *   with multi-fill taker orders, an order over two timestamps, a flip and
 *   a liquidation; the churner pnl 0 makes of a mixed account counted, never
 *   a failure; R3's coverage at each window's start, 1 ms either side;
 * - the comparison: each planted difference a failure (a fill's head, an
 *   event, an entry in one path only, its D, its exits, P1, a label, the
 *   habits); an account whose heads move only in a matching event beyond the
 *   boundary's digits has its events' and exits' differences allowed and
 *   listed, its P1 still a failure;
 * - the seed's source and the run: the manifest's accounts in order, each
 *   file sealed and inside the roots before the paper's loadSeed, a file it
 *   refuses a failed check; an account outside the kit's pool refused
 *   before its file is read; a row at the cut refused; an account the kit is
 *   not run on a failure; the pool from the kit's population;
 * - the known copies priced on a made-up panel of the kit's form with the
 *   kit's taker setting: COPY-H's readings (money.ts) equal to the
 *   reference's (lib-exits' planCopy and priceCopy) exits copied, at D = 0
 *   and held 24 h, with funding and a missing hour, a liquidation's share
 *   closed; a copy open at the cut, one in a stretch without marks,
 *   unpriced alike; each planted difference
 *   of a reading caught, the tolerance on both sides; each set's counts and
 *   figures by trader, a market loaded once; a retired market's copies and
 *   those the settled reading would change; the known answers held to the
 *   record, each failing alone; the kit's own loadMarket.
 * A maker order hit twice in one millisecond keeps the paper's two events
 * (C3's cut E, the supervisor's ruling of 2026-11-26).
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { gzipSync } from "node:zlib";
import { describe, expect, it, vi } from "vitest";
import { chainHeads } from "../src/copyh/chains.js";
import { REPRODUCTION_TOLERANCE_BPS } from "../src/copyh/design.js";
import { normOf } from "../src/copyh/normalize.js";
import {
  Known,
  ReproError,
  answersOf,
  compareAccount,
  compareReading,
  copyhOf,
  copyhReadings,
  kitPanel,
  poolOf,
  referenceOf,
  referenceReadings,
  reproduceAccounts,
  seedCoverage,
  seedRows,
  seedSource,
  type AccountsReport,
  type Entry,
  type Figure,
  type Limits,
  type Path,
  type Reading,
  type ReadingReport,
  type SetReport,
} from "../src/copyh/reproduce.js";
import { PACKAGE_ROOT, sha256 } from "../src/copyh/run.js";
import { SealedError } from "../src/copyh/seal.js";
import { accountData, linesAt, mondayFacts } from "../src/paper/account.js";
import {
  RESEARCH_ROOT,
  loadResearch,
  type Market,
  type PanelFile,
} from "../src/paper/research.js";
import { loadSeed, type SeedAccount } from "../src/paper/seed.js";
import type { StoredRow } from "../src/paper/store.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";

const kit = await loadResearch();
const A = `0x${"1".repeat(40)}`;
const T = Date.parse("2026-10-12T10:00:00Z");
const M1 = Date.parse("2026-10-12T00:00:00Z");
/** Two weeks after M1: no fill in its 14 days. */
const M2 = M1 + 14 * DAY_MS;
const NO_LIMITS: Limits = {
  labelFills: Infinity,
  history: { fills: Infinity, exits: Infinity },
};

let tid = 0;
/** A made-up seed row: a long taker fill of order 1 at T from flat, unless told. */
const row = (o: Partial<StoredRow> = {}): StoredRow => ({
  trade_id: String((tid += 1)),
  order_id: "1",
  instrument_id: 6,
  timestamp: T,
  side: "long",
  price: "100",
  quantity: "1",
  previous_size: "0",
  fee: "0.1",
  pnl: "0",
  taker: true,
  liquidation: false,
  ...o,
});
const seedOf = (rows: StoredRow[], addr = A): SeedAccount => ({
  addr,
  pages: 1,
  truncated: false,
  rows,
  dropped: 0,
});
const starts = (rows: StoredRow[]) =>
  seedRows(seedOf(rows)).rows.map((r) => r.startPosition);

describe("the seed's rows as Hyperliquid's", () => {
  it("chain each order event's fills of one timestamp from its previous_size, exactly, so that C3's rule heads them with it", () => {
    const buy = [
      row({ previous_size: "0.04", quantity: "0.02701" }),
      row({ previous_size: "0.04", quantity: "0.0213" }),
      row({ previous_size: "0.04", quantity: "0.5" }),
    ];
    expect(starts(buy)).toEqual([0.04, 0.06701, 0.08831]);
    const rows = seedRows(seedOf(buy)).rows;
    expect(chainHeads(rows)).toEqual([0.04, 0.04, 0.04]);
    expect(normOf(rows).map((f) => f.prevS)).toEqual(["0.04", "0.04", "0.04"]);
    const sell = [
      row({ side: "short", previous_size: "1.5", quantity: "0.5" }),
      row({ side: "short", previous_size: "1.5", quantity: "0.25" }),
    ];
    expect(starts(sell)).toEqual([1.5, 1]);
    expect(chainHeads(seedRows(seedOf(sell)).rows)).toEqual([1.5, 1.5]);
    // 0.1 + 0.2 as decimals, never as doubles (0.30000000000000004).
    expect(
      starts([
        row({ previous_size: "0.1", quantity: "0.2" }),
        row({ previous_size: "0.1", quantity: "1" }),
      ]),
    ).toEqual([0.1, 0.3]);
  });

  it("start each timestamp's chain of one event at its previous_size, so the kit's event is one again (RM6)", () => {
    const seed = seedOf([
      row({ order_id: "7", previous_size: "2", quantity: "1" }),
      row({ order_id: "7", previous_size: "2", timestamp: T + 5 }),
      row({ order_id: "7", previous_size: "2", timestamp: T + 5 }),
    ]);
    const { rows } = seedRows(seed);
    expect(rows.map((r) => r.startPosition)).toEqual([2, 2, 3]);
    const mine = kit.entries.toEvents(normOf(rows));
    expect(mine).toHaveLength(1);
    expect(mine[0]).toMatchObject({ t: T, t1: T + 5, n: 3, prev: 2, net: 3 });
    expect(mine).toEqual(
      kit.entries.toEvents(seed.rows.map((r) => kit.fills.normFill(r))),
    );
  });

  it("give each field Hyperliquid's: side, crossed, an own liquidation, the kind, the market reading, the instrument's id, the ids' digits", () => {
    const seed = seedOf([
      row({
        side: "short",
        taker: false,
        trade_id: "9007199254740993",
        order_id: "18446744073709551615",
        instrument_id: 42,
        price: "83800.5",
        quantity: "0.04",
      }),
      row({ side: "short", liquidation: true, timestamp: T + 1 }),
      row({ adl: true, timestamp: T + 2 }),
      row({ settlement: true, timestamp: T + 3 }),
      row({ liquidation: true, adl: true, timestamp: T + 4 }),
    ]);
    const { rows } = seedRows(seed);
    expect(rows[0]).toEqual({
      time: T,
      iid: 42,
      px: 83800.5,
      sz: 0.04,
      side: -1,
      startPosition: 0,
      oid: "18446744073709551615",
      tid: "9007199254740993",
      crossed: false,
      ownLiquidation: false,
      dirKind: "trade",
      market: true,
    });
    const flags = ({
      side,
      crossed,
      ownLiquidation,
      dirKind,
      market,
    }: (typeof rows)[number]) =>
      `${side} ${crossed} ${ownLiquidation} ${dirKind} ${market}`;
    expect(rows.map(flags)).toEqual([
      "-1 false false trade true",
      "-1 true true forced true",
      "1 true false forced false",
      "1 true false forced false",
      "1 true true forced false",
    ]);
    // The kit's own reading of the seed's flags: forced, liq and taker alike.
    const pick = ({ forced, liq, taker }: (typeof normed)[number]) =>
      `${forced} ${liq} ${taker}`;
    const normed = normOf(rows);
    expect(normed.map(pick)).toEqual(
      seed.rows.map((r) => pick(kit.fills.normFill(r))),
    );
  });

  it("list the rows whose quantity passes the boundary's 15 digits, at 15 and at 16", () => {
    const at = (q: string, p = "0") =>
      seedRows(
        seedOf([
          row({ previous_size: p, quantity: q }),
          row({ previous_size: p, quantity: "1" }),
        ]),
      ).beyond;
    expect(at("1.00000000000001")).toEqual([]);
    expect(at("1.000000000000001")).toEqual([0]);
    // A previous size is no quantity: not listed.
    expect(at("1", "0.1234567890123456")).toEqual([]);
  });

  it("refuse a text that is not a plain decimal and rows out of time order", () => {
    expect(() => seedRows(seedOf([row({ quantity: "1e-7" })]))).toThrow(
      ReproError,
    );
    expect(() => seedRows(seedOf([row({ previous_size: ".5" })]))).toThrow(
      /not a plain decimal/,
    );
    expect(() =>
      seedRows(seedOf([row({ timestamp: T + 1 }), row({ timestamp: T })])),
    ).toThrow(/out of time order/);
  });
});

/** A made-up Polymarket account: each order's fills share the position before it (a taker's previous_size), positions kept by instrument. */
class SeedBook {
  readonly rows: StoredRow[] = [];
  private readonly pos = new Map<number, number>();

  order(o: {
    t: number;
    iid?: number;
    oid: number;
    side: 1 | -1;
    sizes: readonly number[];
    /** Each fill's own instant (an order over two timestamps). */
    at?: readonly number[];
    liquidation?: boolean;
    taker?: boolean;
    pnl?: string;
  }): this {
    const iid = o.iid ?? 6;
    const before = this.pos.get(iid) ?? 0;
    o.sizes.forEach((q, k) =>
      this.rows.push(
        row({
          order_id: String(o.oid),
          instrument_id: iid,
          timestamp: o.at?.[k] ?? o.t,
          side: o.side > 0 ? "long" : "short",
          quantity: String(q),
          previous_size: String(before),
          pnl: o.pnl ?? "0",
          taker: o.taker ?? true,
          liquidation: o.liquidation ?? false,
        }),
      ),
    );
    this.pos.set(iid, before + o.side * o.sizes.reduce((s, q) => s + q, 0));
    return this;
  }

  seed(addr = A): SeedAccount {
    return seedOf(
      [...this.rows].sort((a, b) => a.timestamp - b.timestamp),
      addr,
    );
  }
}

/** Eight round trips of 12 h on two instruments in the 13 days before M1, every size its own, the opens split in two taker fills: one over two timestamps, one closed by a liquidation, one flipped into the next. */
function directional(): SeedBook {
  const sizes = [1, 2, 3, 1.5, 2.5, 4, 3.5, 5];
  const book = new SeedBook();
  sizes.forEach((q, k) => {
    const t = M1 - 13 * DAY_MS + k * 36 * HOUR_MS;
    const iid = k % 2 === 0 ? 6 : 7;
    const side = k % 3 === 0 ? -1 : 1;
    book.order({
      t,
      iid,
      oid: 10 * k + 1,
      side,
      sizes: [q / 2, q / 2],
      ...(k === 2 ? { at: [t, t + 3] } : {}),
    });
    book.order({
      t: t + 12 * HOUR_MS,
      iid,
      oid: 10 * k + 2,
      side: side === 1 ? -1 : 1,
      sizes: k === 5 ? [q, 1] : [q],
      liquidation: k === 3,
    });
    if (k === 5)
      book.order({
        t: t + 13 * HOUR_MS,
        iid,
        oid: 10 * k + 3,
        side,
        sizes: [1],
      });
  });
  return book;
}

/** Six round trips each closed in 30 s, a day apart, every size its own, each close's pnl given. */
function churner(pnl: string): SeedBook {
  const book = new SeedBook();
  for (let k = 0; k < 6; k++) {
    const t = M1 - 12 * DAY_MS + k * DAY_MS;
    book
      .order({ t, oid: 2 * k + 1, side: 1, sizes: [k + 1] })
      .order({ t: t + 30_000, oid: 2 * k + 2, side: -1, sizes: [k + 1], pnl });
  }
  return book;
}

const both = (seed: SeedAccount, mondays = [M1, M2]) => {
  const { rows, beyond } = seedRows(seed);
  const mine = copyhOf(kit, seed, rows, mondays, NO_LIMITS);
  if (mine.kind !== "built") throw new Error(mine.why);
  return { ref: referenceOf(kit, seed, mondays), mine: mine.path, beyond };
};

describe("the two paths", () => {
  it("equal field for field for a directional trader, P1 at M1 only", () => {
    const seed = directional().seed();
    const { ref, mine, beyond } = both(seed);
    expect(beyond).toEqual([]);
    expect(mine.events).toEqual(ref.events);
    expect([...mine.entries.keys()]).toEqual([...ref.entries.keys()]);
    expect(mine.entries).toEqual(ref.entries);
    expect(mine.facts).toEqual(ref.facts);
    expect(ref.facts.map((f) => [f.label, f.p1])).toEqual([
      ["directional", true],
      ["no fills in window", false],
    ]);
    // The flip is one FLIP entry, the liquidation a forced exit.
    const kinds = [...ref.entries.values()].map((e) => e.group.type);
    expect(kinds.filter((k) => k === "FLIP")).toHaveLength(1);
    expect(
      [...ref.entries.values()].flatMap((e) => e.exits).filter((x) => x.liq),
    ).toHaveLength(1);
    expect(compareAccount(A, [M1, M2], ref, mine, beyond)).toEqual({
      events: { kit: ref.events.length, copyh: ref.events.length },
      entries: { kit: ref.entries.size, copyh: ref.entries.size },
      p1: { kit: 1, copyh: 1 },
      pnlLabels: 0,
      allowed: [],
      differ: [],
    });
  });

  it("count the churner pnl 0 makes of a mixed account, never a failure", () => {
    const seed = churner("-0.5").seed();
    const { ref, mine, beyond } = both(seed, [M1]);
    expect([ref.facts[0]!.label, mine.facts[0]!.label]).toEqual([
      "unclassified — mixed",
      "churner",
    ]);
    const c = compareAccount(A, [M1], ref, mine, beyond);
    expect([c.pnlLabels, c.differ]).toEqual([1, []]);
    // With a pnl of 0 in the seed, the two labels are one.
    const zero = both(churner("0").seed(), [M1]);
    expect(zero.ref.facts[0]!.label).toBe("churner");
    expect(compareAccount(A, [M1], zero.ref, zero.mine, []).pnlLabels).toBe(0);
  });

  it("give the reference the paper's own Monday facts (its accountData, mondayFacts and linesAt), truncated seeds covered and not among them", () => {
    const state = { P: kit.constants.CUT, from: kit.constants.CUT, holes: [] };
    // A round trip 20 days before M1: a truncated seed that covers M1's 14 days.
    const early = directional()
      .order({ t: M1 - 20 * DAY_MS, iid: 8, oid: 900, side: 1, sizes: [1] })
      .order({
        t: M1 - 20 * DAY_MS + HOUR_MS,
        iid: 8,
        oid: 901,
        side: -1,
        sizes: [1],
      })
      .seed();
    const covered = { ...early, truncated: true };
    expect(referenceOf(kit, covered, [M1]).facts[0]!.p1).toBe(true);
    for (const seed of [
      directional().seed(),
      { ...directional().seed(), truncated: true },
      covered,
      churner("-0.5").seed(),
    ]) {
      const paper = accountData(kit, seed.addr, seed, [], state);
      const want = [M1, M2].map((M) => {
        const f = mondayFacts(kit, paper, M, new Map());
        return {
          label: f.label,
          p1: linesAt(f).p1,
          closed: f.closed,
          medianHoldMs: f.medianHoldMs,
          longShare: f.longShare,
        };
      });
      expect(referenceOf(kit, seed, [M1, M2]).facts).toEqual(want);
    }
  });

  it("read P1 through each path's coverage, and COPY-H's label past its fills' limit", () => {
    // Truncated, its oldest fill 13 days before M1: M1's 14 days not covered.
    const seed = { ...directional().seed(), truncated: true };
    const { ref, mine } = both(seed, [M1]);
    expect([ref.facts[0]!, mine.facts[0]!].map((f) => [f.label, f.p1])).toEqual(
      [
        ["directional", false],
        ["directional", false],
      ],
    );
    const capped = copyhOf(kit, seed, seedRows(seed).rows, [M1], {
      ...NO_LIMITS,
      labelFills: 1,
    });
    expect(capped.kind === "built" && capped.path.facts[0]!.label).toBe(
      "too many fills for the kit",
    );
  });

  it("keep a maker order's matches of one millisecond apart, as the paper's events (C3's cut E)", () => {
    // Long 1, then one resting sell order hit twice in one millisecond:
    // Polymarket gives each match its own previous_size (a CLOSE, then an
    // OPEN), and so does cut E; one chain of them would make one FLIP.
    const book = new SeedBook().order({ t: T, oid: 1, side: 1, sizes: [1] });
    const at = T + 60_000;
    book.rows.push(
      row({
        order_id: "2",
        timestamp: at,
        side: "short",
        taker: false,
        previous_size: "1",
      }),
      row({
        order_id: "2",
        timestamp: at,
        side: "short",
        taker: false,
        previous_size: "0",
      }),
    );
    const seed = book.seed();
    const { ref, mine, beyond } = both(seed, [M2]);
    expect(ref.events.map((e) => e.kind)).toEqual(["OPEN", "CLOSE", "OPEN"]);
    expect(mine.events).toEqual(ref.events);
    expect([...mine.entries.keys()]).toEqual([
      `${A}|6|${T}|OPEN`,
      `${A}|6|${at}|OPEN`,
    ]);
    expect(compareAccount(A, [M2], ref, mine, beyond).differ).toEqual([]);
  });

  it("read R3's coverage of a truncated seed at each window's start, 1 ms either side", () => {
    const at = (oldest: number) =>
      seedCoverage(
        kit,
        { ...seedOf([row({ timestamp: oldest })]), truncated: true },
        M2,
      );
    const LABEL = M2 - 14 * DAY_MS;
    const HABIT = M2 - 30 * DAY_MS;
    expect(at(LABEL)).toEqual({ labelCovered: true, habitCovered: false });
    expect(at(LABEL + 1).labelCovered).toBe(false);
    expect(at(HABIT)).toEqual({ labelCovered: true, habitCovered: true });
    expect(at(HABIT + 1).habitCovered).toBe(false);
    expect(seedCoverage(kit, seedOf([row({ timestamp: M2 - 1 })]), M2)).toEqual(
      { labelCovered: true, habitCovered: true },
    );
  });
});

describe("the comparison", () => {
  const seed = directional().seed();
  const { ref, mine } = both(seed);
  const differ = (changed: Path, beyond: number[] = []) =>
    compareAccount(A, [M1, M2], ref, changed, beyond).differ;
  const firstId = [...ref.entries.keys()][0]!;

  it("fails each planted difference", () => {
    const fills = mine.fills.map((f, i) => (i === 0 ? { ...f, prev: 9 } : f));
    expect(differ({ ...mine, fills })).toEqual([
      `${A}: 1 fills take another chain head`,
    ]);
    expect(differ({ ...mine, events: mine.events.slice(1) })).toEqual([
      `${A}: 1 of the kit's events not the other's`,
    ]);
    const kinds = mine.events.map((e, i) =>
      i === 0 ? { ...e, kind: "ADD" as const } : e,
    );
    expect(differ({ ...mine, events: kinds })).toEqual([
      `${A}: 1 of the kit's events not the other's`,
      `${A}: 1 of COPY-H's events not the other's`,
    ]);
    const without = new Map(mine.entries);
    without.delete(firstId);
    expect(differ({ ...mine, entries: without })).toEqual([
      `${firstId}: the kit's entry only`,
    ]);
    const entry = mine.entries.get(firstId)!;
    const swap = (e: typeof entry) =>
      new Map([...mine.entries].map(([id, x]) => [id, id === firstId ? e : x]));
    expect(
      differ({ ...mine, entries: swap({ ...entry, D: entry.D + 1 }) }),
    ).toEqual([`${firstId}: its D or direction differs`]);
    expect(
      differ({
        ...mine,
        entries: swap({ ...entry, exits: entry.exits.slice(1) }),
      }),
    ).toEqual([`${firstId}: its exits differ`]);
    const extra = new Map(mine.entries).set(`${A}|9|1|OPEN`, entry);
    expect(differ({ ...mine, entries: extra })).toEqual([
      `${A}|9|1|OPEN: COPY-H's entry only`,
    ]);
    const facts = (f: Partial<Path["facts"][number]>) => [
      { ...mine.facts[0]!, ...f },
      mine.facts[1]!,
    ];
    expect(differ({ ...mine, facts: facts({ p1: false }) })).toEqual([
      `${A} 2026-10-12: P1 true / false (directional / directional)`,
    ]);
    expect(differ({ ...mine, facts: facts({ label: "algorithm" }) })).toEqual([
      `${A} 2026-10-12: label directional / algorithm`,
    ]);
    expect(differ({ ...mine, facts: facts({ closed: 99 }) })[0]).toMatch(
      /^0x1{40} 2026-10-12: habits \d+ \d+ [\d.]+ \/ 99 /,
    );
  });

  it("allows a head, an order event and an exit to differ only in a matching event beyond the boundary, never P1", () => {
    // The first entry's first exit: its closing order's matching event.
    const entry = mine.entries.get(firstId)!;
    const exitT = entry.exits[0]!.t;
    const at = mine.fills.findIndex(
      (f) => f.t === exitT && f.iid === entry.group.iid,
    );
    const fills = mine.fills.map((f, i) => (i === at ? { ...f, prev: 9 } : f));
    const events = mine.events.filter(
      (e) => !(e.t === exitT && e.iid === entry.group.iid),
    );
    const entries = new Map(
      [...mine.entries].map(([id, x]) => [
        id,
        id === firstId ? { ...entry, exits: entry.exits.slice(1) } : x,
      ]),
    );
    const moved = { ...mine, fills, events, entries };
    const c = compareAccount(A, [M1, M2], ref, moved, [at]);
    expect(c.differ).toEqual([]);
    expect(c.allowed).toEqual([
      `${A}: 1 fills take another chain head, in matching events beyond the boundary's digits`,
      `${A}: 1 of the kit's events not the other's, in matching events beyond the boundary's digits`,
      `${firstId}: its exits differ`,
    ]);
    // A row beyond the boundary in another matching event explains nothing.
    expect(compareAccount(A, [M1, M2], ref, moved, [0]).differ).toEqual([
      `${A}: 1 fills take another chain head`,
      `${A}: 1 of the kit's events not the other's`,
      `${firstId}: its exits differ`,
    ]);
    const p1 = [{ ...mine.facts[0]!, p1: false }, mine.facts[1]!];
    expect(
      compareAccount(A, [M1, M2], ref, { ...moved, facts: p1 }, [at]).differ,
    ).toEqual([`${A} 2026-10-12: P1 true / false (directional / directional)`]);
  });
});

const CUT = kit.constants.CUT;
const PANEL_START = M1 - 14 * DAY_MS;
/** The funding hour without a row: inside the hold of the directional trader's first round trip, 24 h to 36 h after PANEL_START. */
const MISSING_HOUR = PANEL_START + 30 * HOUR_MS;
/** A made-up panel file of the kit's form from PANEL_START to the cut, or to `end`: uneven marks every minute but in `quiet`, a funding row each hour but MISSING_HOUR, stamped a few ms late, uneven rates. */
function panelOf(
  iid: number,
  o: {
    end?: number;
    retired?: unknown;
    quiet?: readonly [number, number];
  } = {},
): PanelFile {
  const end = o.end ?? CUT;
  const hours: number[] = [];
  for (let h = PANEL_START + HOUR_MS; h < end; h += HOUR_MS)
    if (h !== MISSING_HOUR) hours.push(h);
  return {
    iid,
    symbol: `I${iid}`,
    category: "crypto",
    start: PANEL_START,
    end,
    firstTrade: PANEL_START,
    retired: o.retired ?? null,
    marks: Array.from({ length: (end - PANEL_START) / MINUTE_MS }, (_, i) => {
      const t = PANEL_START + i * MINUTE_MS;
      return o.quiet !== undefined && t >= o.quiet[0] && t < o.quiet[1]
        ? null
        : 100 + iid + ((i * i) % 53) / 7;
    }),
    klines: { minute: [], trades: [], volume: [] },
    funding: hours.map((h, k): [number, number, number] => [
      h,
      ((k % 3) - 1) * 1e-5 + 2e-6,
      h + 7 * ((k % 5) + 1),
    ]),
  };
}
const SETTING = kit.costs.SETTINGS.taker;
/** The directional trader's fifth open (instrument 6), whose follow instant lies in its panel's quiet stretch. */
const QUIET_T = M1 - 13 * DAY_MS + 4 * 36 * HOUR_MS;
/** A retired market's panel end (instrument 8) and its record. */
const RETIRED_END = M1 - 3 * DAY_MS;
const RETIREMENT = { timestamp: RETIRED_END - 30_000, price: "123.4" };
const MARKETS = new Map<number, Market>([
  [
    6,
    kit.panel.marketFrom(
      panelOf(6, { quiet: [QUIET_T - 6 * MINUTE_MS, QUIET_T + 6 * MINUTE_MS] }),
    ),
  ],
  [7, kit.panel.marketFrom(panelOf(7))],
  [
    8,
    kit.panel.marketFrom(panelOf(8, { end: RETIRED_END, retired: RETIREMENT })),
  ],
]);
const market = (iid: number): Market => MARKETS.get(iid)!;
/** A long opened at CUT − 10 h on instrument 7, never closed: open at the cut. */
const atCut = (addr: string) =>
  new SeedBook()
    .order({ t: CUT - 10 * HOUR_MS, iid: 7, oid: 1, side: 1, sizes: [2] })
    .seed(addr);
/** Two longs on the retired instrument 8: one closed a day later, before its panel ends; one never closed, open at the panel's end. */
const onRetired = (addr: string) =>
  new SeedBook()
    .order({ t: M1 - 6 * DAY_MS, iid: 8, oid: 1, side: 1, sizes: [1] })
    .order({ t: M1 - 5 * DAY_MS, iid: 8, oid: 2, side: -1, sizes: [1] })
    .order({ t: M1 - 4 * DAY_MS, iid: 8, oid: 3, side: 1, sizes: [3] })
    .seed(addr);
const entriesOf = (seed: SeedAccount) => referenceOf(kit, seed, []).entries;

describe("the seed's source and the run", () => {
  const B = `0x${"2".repeat(40)}`;
  const H = `0x${"3".repeat(40)}`;

  /** A seed folder of these accounts' files, `…\seed`, and its manifest as the paper's `readManifest` gives it. */
  function folder(seeds: readonly SeedAccount[]) {
    const root = mkdtempSync(path.join(tmpdir(), "copyh-repro-"));
    const dir = path.join(root, "seed");
    mkdirSync(dir);
    const manifest = new Map<string, string>();
    for (const s of seeds) {
      const bytes = gzipSync(JSON.stringify(s));
      writeFileSync(path.join(dir, `${s.addr}.json.gz`), bytes);
      manifest.set(`${s.addr}.json.gz`, sha256(bytes));
    }
    return { root, dir, manifest };
  }

  it("reads the manifest's accounts in address order, each file sealed and inside the roots before the paper's loadSeed", () => {
    const f = folder([directional().seed(B), churner("0").seed(A)]);
    const source = seedSource({ ...f, roots: [f.root], load: loadSeed });
    expect(source.accounts).toEqual([A, B]);
    expect(source.load(B).rows).toHaveLength(directional().rows.length);
    const outside = seedSource({
      ...f,
      roots: [path.join(f.root, "elsewhere")],
      load: loadSeed,
    });
    expect(() => outside.load(A)).toThrow(SealedError);
    const sealed = path.join(f.root, "FRESH", "store", "seed");
    expect(() =>
      seedSource({ ...f, dir: sealed, roots: [f.root], load: loadSeed }).load(
        A,
      ),
    ).toThrow(/sealed until step 2/);
    expect(() =>
      seedSource({
        ...f,
        manifest: new Map([["MANIFEST.sha256", "0"]]),
        roots: [f.root],
        load: loadSeed,
      }),
    ).toThrow(/the seed's manifest names MANIFEST\.sha256/);
    const bytes = gzipSync("{}");
    writeFileSync(path.join(f.dir, `${A}.json.gz`), bytes);
    expect(() => source.load(A)).toThrow(ReproError);
    expect(() => source.load(A)).toThrow(
      new RegExp(
        `^${A}: seed ${A}\\.json\\.gz: SHA-256 .* differs from the manifest's`,
      ),
    );
  });

  it("runs every account through both paths, a known set's ids looked up in both, refusing one outside the pool before its file is read and a row at the cut", () => {
    const seeds = [directional().seed(A), churner("-0.5").seed(B)];
    const f = folder(seeds);
    const load = vi.fn(loadSeed);
    const idA = [...referenceOf(kit, seeds[0]!, [M1]).entries.keys()][0]!;
    const sets = {
      known: [idA, `${A}|6|1|OPEN`, `${H}|6|1|OPEN`],
      none: [],
    };
    const run = (pool: string[], limits = NO_LIMITS) =>
      reproduceAccounts({
        kit,
        seed: seedSource({ ...f, roots: [f.root], load }),
        pool: new Set(pool),
        mondays: [M1, M2],
        limits,
        sets,
        market,
        setting: SETTING,
      });
    const r = run([A, B]);
    expect(r.sets).toMatchObject({
      known: {
        count: 3,
        found: 1,
        missing: { count: 2, first: [`${A}|6|1|OPEN`, `${H}|6|1|OPEN`] },
      },
      none: { count: 0, found: 0, missing: { count: 0, first: [] } },
    });
    expect(r).toMatchObject({
      accounts: 2,
      rows: seeds[0]!.rows.length + seeds[1]!.rows.length,
      span: {
        first: Math.min(
          ...seeds.flatMap((s) => s.rows.map((x) => x.timestamp)),
        ),
      },
      mondays: ["2026-10-12", "2026-10-26"],
      p1: { kit: 1, copyh: 1 },
      pnlLabels: 1,
      beyond: { count: 0, first: [] },
      allowed: { count: 0, first: [] },
      differ: { count: 0, first: [] },
    });
    load.mockClear();
    expect(() => run([B, H])).toThrow(
      new RegExp(`${A} is not in the kit's pool outside the holdout`),
    );
    expect(load).not.toHaveBeenCalled();
    expect(
      run([A, B], { ...NO_LIMITS, history: { fills: 3, exits: 1e9 } }).differ,
    ).toMatchObject({ count: 2 });
    const late = folder([
      seedOf([
        row({ timestamp: kit.constants.CUT - 1 }),
        row({ timestamp: kit.constants.CUT }),
      ]),
    ]);
    expect(() =>
      reproduceAccounts({
        kit,
        seed: seedSource({ ...late, roots: [late.root], load: loadSeed }),
        pool: new Set([A]),
        mondays: [M1],
        limits: NO_LIMITS,
        sets: {},
        market,
        setting: SETTING,
      }),
    ).toThrow(/a seed row at or after the cut/);
  });

  it("prices every known copy found in both paths: each set's readings counted with their figures by trader, a market loaded once, a retired market's copies and those its settled reading would change", () => {
    const C = `0x${"4".repeat(40)}`;
    const R = `0x${"5".repeat(40)}`;
    const seeds = [directional().seed(A), atCut(C), onRetired(R)];
    const f = folder(seeds);
    const byId = new Map(seeds.flatMap((s) => [...entriesOf(s)]));
    const ids = [...byId.keys()];
    const nA = entriesOf(seeds[0]!).size;
    const atCutId = [...entriesOf(seeds[1]!).keys()][0]!;
    const loads = vi.fn(market);
    const r = reproduceAccounts({
      kit,
      seed: seedSource({ ...f, roots: [f.root], load: loadSeed }),
      pool: new Set([A, C, R]),
      mondays: [M1],
      limits: NO_LIMITS,
      sets: { all: [...ids, `${H}|6|1|OPEN`], cut: [atCutId] },
      market: loads,
      setting: SETTING,
    });
    expect(loads.mock.calls.map(([iid]) => iid)).toEqual([6, 7, 8]);
    expect(r.differ).toEqual({ count: 0, first: [] });
    const all = r.sets.all!;
    expect([all.count, all.found, all.missing.first]).toEqual([
      ids.length + 1,
      ids.length,
      [`${H}|6|1|OPEN`],
    ]);
    // Unpriced alike: the quiet entry's three readings, the copy open at the
    // retired panel's end (exits, D = 0, 24 h), and the copy open at the cut
    // held 24 h past it.
    const counts = (x: ReadingReport) => [x.equal, x.unpriced, x.largest];
    expect(counts(all.readings.exits)).toEqual([nA + 1, 2, 0]);
    expect(counts(all.readings.zero)).toEqual([nA + 1, 2, 0]);
    expect(counts(all.readings.held)).toEqual([nA, 3, 0]);
    const cut = r.sets.cut!.readings;
    expect([cut.exits, cut.zero, cut.held].map(counts)).toEqual([
      [1, 0, 0],
      [1, 0, 0],
      [0, 1, 0],
    ]);
    // Each figure the kit's cr1Test by trader over the path's priced copies, in the set's order.
    for (const k of ["exits", "held"] as const) {
      const items = ids.flatMap((id) => {
        const e = byId.get(id)!;
        const x = referenceReadings(kit, market(e.group.iid), SETTING, e)[k];
        return x.reason === undefined ? [{ addr: id.slice(0, 42), x }] : [];
      });
      const figure = (v: "net" | "gross"): Figure => {
        const t = kit.stats.cr1Test(
          items,
          (i) => i.addr,
          (i) => i.x[v],
        );
        return { n: t.n, traders: t.clusters, mean: t.estimate, se: t.se };
      };
      const x = all.readings[k];
      expect(x.copyh).toEqual({ net: figure("net"), gross: figure("gross") });
      expect(x.kit).toEqual(x.copyh);
      expect(x.copyh.net.traders).toBe(k === "exits" ? 3 : 2);
    }
    expect(r.retired).toEqual([
      {
        iid: 8,
        symbol: "I8",
        end: new Date(RETIRED_END).toISOString(),
        sets: {
          all: { copies: 2, changed: 1 },
          cut: { copies: 0, changed: 0 },
        },
      },
    ]);
  });

  it("lists a reading that differs from its reference beyond the tolerance as a difference, and keeps the largest one within it", () => {
    // A setting whose fee moves by `by` once COPY-H's path has priced the
    // one known copy: only the reference's readings of it see the move.
    const seed = directional().seed(A);
    const f = folder([seed]);
    const [id, e] = [...entriesOf(seed)][0]!;
    let calls = 0;
    const counting = {
      ...SETTING,
      fee: (iid: number, t: number) => {
        calls += 1;
        return SETTING.fee(iid, t);
      },
    };
    copyhReadings(kit, market(e.group.iid), counting, e, {
      end: CUT,
      settlement: null,
    });
    const first = calls;
    const drifted = (by: number) => {
      calls = 0;
      return reproduceAccounts({
        kit,
        seed: seedSource({ ...f, roots: [f.root], load: loadSeed }),
        pool: new Set([A]),
        mondays: [M1],
        limits: NO_LIMITS,
        sets: { one: [id] },
        market,
        setting: {
          ...SETTING,
          fee: (iid, t) =>
            SETTING.fee(iid, t) + ((calls += 1) > first ? by : 0),
        },
      });
    };
    const r = drifted(5e-5);
    expect(r.differ.first.map((l) => l.split(" by ")[0])).toEqual([
      `${id}: exits`,
      `${id}: zero`,
      `${id}: held`,
    ]);
    const x = r.sets.one!.readings.exits;
    expect([x.equal, x.unpriced, x.differ.count]).toEqual([0, 0, 1]);
    expect(x.differ.first[0]!.startsWith(`${id}: by `)).toBe(true);
    // Each path's figure from its own readings: the reference's two fees
    // each 0.5 bps higher.
    expect(x.kit.net.mean! - x.copyh.net.mean!).toBeCloseTo(-1, 0);
    // A fee 1e-14 higher moves the net by about 2e-10 bps: equal, kept.
    const near = drifted(1e-14);
    expect(near.differ.count).toBe(0);
    for (const k of ["exits", "zero", "held"] as const) {
      const y = near.sets.one!.readings[k];
      expect(y.equal).toBe(1);
      expect(y.largest).toBeGreaterThan(0);
      expect(y.largest).toBeLessThanOrEqual(REPRODUCTION_TOLERANCE_BPS);
    }
  });

  it("takes the pool from the kit's population, outside its holdout", () => {
    const pool = poolOf(RESEARCH_ROOT);
    const { accounts } = JSON.parse(
      readFileSync(
        path.join(RESEARCH_ROOT, "kit", "data", "population.json"),
        "utf8",
      ),
    ) as { accounts: { addr: string; holdout: boolean }[] };
    expect([...pool]).toEqual(
      accounts.filter((a) => !a.holdout).map((a) => a.addr),
    );
    expect(accounts.some((a) => a.holdout && pool.has(a.addr))).toBe(false);
    expect(pool.size).toBe(1602);
  });
});

describe("a known copy's readings", () => {
  const seed = directional().seed();
  const { ref, mine } = both(seed, [M1]);
  const SEED_COIN = { end: CUT, settlement: null };

  it("are COPY-H's equal to the reference's, exits copied, at D = 0 and held 24 h, on funding with a missing hour", () => {
    let priced = 0;
    for (const [id, e] of ref.entries) {
      const mk = market(e.group.iid);
      const a = copyhReadings(
        kit,
        mk,
        SETTING,
        mine.entries.get(id)!,
        SEED_COIN,
      );
      const b = referenceReadings(kit, mk, SETTING, e);
      expect(a).toEqual(b);
      for (const k of ["exits", "zero", "held"] as const)
        if (b[k].reason === undefined) {
          priced += 1;
          expect(compareReading(a[k], b[k])).toEqual({
            kind: "equal",
            largest: 0,
          });
        }
    }
    expect(priced).toBe(3 * (ref.entries.size - 1));
    // A third of a long liquidated: its share closed, not the whole copy
    // (FIND-6-EXITS's reading), alike in both paths.
    const liquidated = new SeedBook()
      .order({ t: M1 - 10 * DAY_MS, iid: 7, oid: 1, side: 1, sizes: [1, 2] })
      .order({
        t: M1 - 10 * DAY_MS + 2 * HOUR_MS,
        iid: 7,
        oid: 2,
        side: -1,
        sizes: [1],
        liquidation: true,
      })
      .order({
        t: M1 - 10 * DAY_MS + 5 * HOUR_MS,
        iid: 7,
        oid: 3,
        side: -1,
        sizes: [2],
      })
      .seed();
    const l = both(liquidated, []);
    const [[lid, le]] = [...l.ref.entries] as [[string, Entry]];
    expect(le.exits.map((x) => [x.share, x.liq])).toEqual([
      [1 / 3, true],
      [1, false],
    ]);
    expect(
      kit.exits
        .planCopy({ t: le.group.t, D: le.D }, le.exits)
        .legs.map((x) => x.part),
    ).toEqual([1 / 3, 1 - 1 / 3]);
    expect(
      copyhReadings(
        kit,
        market(7),
        SETTING,
        l.mine.entries.get(lid)!,
        SEED_COIN,
      ),
    ).toEqual(referenceReadings(kit, market(7), SETTING, le));
    // The first round trip, closed whole by one exit 12 h in: every field
    // the kit's leg in bps; its hold spans MISSING_HOUR.
    const [, e] = [...ref.entries][0]!;
    const mk = market(e.group.iid);
    const x = e.exits[0]!;
    expect(e.exits).toHaveLength(1);
    expect(MISSING_HOUR > e.group.t && MISSING_HOUR < x.t).toBe(true);
    const legOf = (tIn: number, h: number): Reading => {
      const r = kit.returns.leg(mk, {
        dir: e.group.dir,
        tIn,
        h,
        setting: SETTING,
      })!;
      return {
        net: r.net * 1e4,
        gross: r.gross * 1e4,
        fees: r.fees * 1e4,
        funding: r.funding * 1e4,
        exact: `${r.fundingMissing} ${r.spreadFallback}`,
      };
    };
    const h = x.t - e.group.t;
    const at = (D: number) => {
      const l = legOf(e.group.t + D, h);
      if (l.reason !== undefined) throw new Error(l.reason);
      const [missing, fallback] = l.exact.split(" ");
      return { ...l, exact: `${h} ${h} ${missing} ${fallback}` };
    };
    const got = referenceReadings(kit, mk, SETTING, e);
    expect(got.exits).toEqual(at(e.D));
    expect(got.zero).toEqual(at(0));
    expect(got.held).toEqual(legOf(e.group.t + e.D, 24 * HOUR_MS));
    const exits = got.exits;
    if (exits.reason !== undefined) throw new Error(exits.reason);
    expect(exits.exact.split(" ")[2]).toBe("1");
    expect(exits.funding).not.toBe(0);
  });

  it("are unpriced alike, with lib-exits' reasons, in a stretch without marks and past the cut", () => {
    const [id, e] = [...ref.entries].find(([, x]) => x.group.t === QUIET_T)!;
    const mk = market(6);
    const quiet = copyhReadings(
      kit,
      mk,
      SETTING,
      mine.entries.get(id)!,
      SEED_COIN,
    );
    const follow = { reason: "no mark at the follow instant" };
    expect(quiet).toEqual({ exits: follow, zero: follow, held: follow });
    expect(referenceReadings(kit, mk, SETTING, e)).toEqual(quiet);
    expect(compareReading(quiet.exits, follow)).toEqual({ kind: "unpriced" });
    // Open at the cut: its part marked at CUT − 1 ms, its 24 h past the panel.
    const open = [...entriesOf(atCut(A)).values()][0]!;
    const r = referenceReadings(kit, market(7), SETTING, open);
    const tIn = open.group.t + open.D;
    expect(r.exits.reason === undefined && r.exits.exact.split(" ")[0]).toBe(
      String(CUT - 1 - tIn),
    );
    expect(r.held).toEqual({ reason: "no mark at an exit instant" });
    expect(copyhReadings(kit, market(7), SETTING, open, SEED_COIN)).toEqual(r);
  });
});

describe("a reading held to its reference", () => {
  const priced = {
    net: 0.5,
    gross: 9.75,
    fees: 9,
    funding: -0.25,
    exact: "3600000 3600000 0 false",
  };
  const TOL = REPRODUCTION_TOLERANCE_BPS;
  const moved = (f: "net" | "gross" | "fees" | "funding", by: number) => {
    const r = { ...priced };
    r[f] += by;
    return r;
  };

  it("is equal within the tolerance, its largest difference kept, and differs beyond it, field by field", () => {
    expect(compareReading(priced, priced)).toEqual({
      kind: "equal",
      largest: 0,
    });
    for (const f of ["net", "gross", "fees", "funding"] as const) {
      const near = compareReading(moved(f, TOL / 2), priced);
      expect(near.kind).toBe("equal");
      expect(near.kind === "equal" && near.largest).toBeCloseTo(TOL / 2, 15);
      expect(compareReading(moved(f, 2 * TOL), priced)).toMatchObject({
        kind: "differ",
        why: expect.stringMatching(/^by .* bps$/) as unknown,
      });
      for (const [a, b] of [
        [moved(f, -2 * TOL), priced],
        [priced, moved(f, 2 * TOL)],
        [priced, moved(f, -2 * TOL)],
      ] as const)
        expect(compareReading(a, b).kind).toBe("differ");
    }
    expect(compareReading({ ...priced, net: NaN }, priced).kind).toBe("differ");
  });

  it("differs on an exact field, on one side unpriced or two reasons, and is unpriced alike on one reason", () => {
    expect(
      compareReading({ ...priced, exact: "3600001 3600000 0 false" }, priced),
    ).toEqual({
      kind: "differ",
      why: "3600001 3600000 0 false / 3600000 3600000 0 false",
    });
    const follow = { reason: "no mark at the follow instant" };
    const exit = { reason: "no mark at an exit instant" };
    expect(compareReading(priced, follow)).toEqual({
      kind: "differ",
      why: "unpriced: no / no mark at the follow instant",
    });
    expect(compareReading(exit, priced)).toEqual({
      kind: "differ",
      why: "unpriced: no mark at an exit instant / no",
    });
    expect(compareReading(exit, follow).kind).toBe("differ");
    expect(compareReading(exit, { ...exit })).toEqual({ kind: "unpriced" });
  });
});

describe("the known answers", () => {
  const known = Known.parse(
    JSON.parse(
      readFileSync(path.join(PACKAGE_ROOT, "copyh", "known.json"), "utf8"),
    ),
  );
  const printed = known.x3printed;
  const fig = (mean: number | null, se: number | null = null): Figure => ({
    n: 2,
    traders: 2,
    mean,
    se,
  });
  const none = fig(null);
  const reading = (
    equal: number,
    net: Figure = none,
    gross: Figure = none,
  ): ReadingReport => ({
    equal,
    unpriced: 0,
    largest: 2.5e-14,
    differ: { count: 0, first: [] },
    copyh: { net, gross },
    kit: { net, gross },
  });
  const setOf = (
    count: number,
    r: Partial<SetReport["readings"]>,
  ): SetReport => ({
    count,
    found: count,
    missing: { count: 0, first: [] },
    readings: { exits: reading(0), zero: reading(0), held: reading(0), ...r },
  });
  const empty = { count: 0, first: [] };
  /** A report that gives every known answer: X3's figures a little off the printed decimals. */
  const good: AccountsReport = {
    accounts: 1602,
    rows: 0,
    span: { first: 0, last: 0 },
    mondays: known.mondays,
    events: { kit: 0, copyh: 0 },
    entries: { kit: 0, copyh: 0 },
    p1: { kit: 0, copyh: 0 },
    pnlLabels: 0,
    sets: {
      find6exits: setOf(1700, {
        exits: reading(1700),
        zero: reading(1700),
        held: reading(1700),
      }),
      x3: setOf(1366, { exits: reading(1366, fig(-9.94, 9.06), fig(1.12)) }),
      x3voted: setOf(1293, { held: reading(1293, fig(9.14, 13.66)) }),
      x3find3: setOf(1104, { held: reading(1104) }),
    },
    retired: [],
    beyond: empty,
    allowed: empty,
    differ: empty,
  };

  it("reads the committed known.json: the 26 Mondays, the sets and X3's printed figures", () => {
    expect(printed).toEqual({
      exitsCopied: { over: "x3", mean: -9.9, se: 9.1 },
      gross: { over: "x3", mean: 1.1 },
      held24h: { over: "x3voted", mean: 9.1, se: 13.7 },
    });
    expect(
      [
        known.mondays,
        known.find6exits,
        known.x3,
        known.x3voted,
        known.x3find3,
      ].map((x) => x.length),
    ).toEqual([26, 1700, 1366, 1293, 1104]);
  });

  it("holds each to the record, X3's figures at one decimal in both paths", () => {
    const answers = answersOf(good, printed);
    expect(answers.map((a) => [a.answer, a.want, a.passed])).toEqual([
      [
        "every value of COPY-H's path equal to the kit's",
        "0 differences",
        true,
      ],
      ["every known entry found in both paths", "5463 of 5463", true],
      ["FIND-6-EXITS's copies, exits copied", "1700 of 1700", true],
      ["FIND-6-EXITS's copies, held 24 h", "1700 of 1700", true],
      ["FIND-6-EXITS's copies at D = 0", "1700 of 1700", true],
      ["X3's copies, exits copied", "1366 of 1366", true],
      ["X3's exits copied by trader", "-9.9 ± 9.1", true],
      ["X3's gross by trader", "1.1", true],
      ["X3's held 24 h by trader, over its voted set", "9.1 ± 13.7", true],
      ["X3's 1,104 in FIND-3's look, held 24 h", "1104 of 1104", true],
      ["the Mondays", "26", true],
    ]);
    expect(answers[2]!.got).toBe(
      "1700 of 1700 (the largest difference 2.5e-14 bps)",
    );
    expect(answers[6]!.got).toBe("COPY-H -9.9 ± 9.1, the kit -9.9 ± 9.1");
  });

  it("fails each answer alone when its number moves", () => {
    const failed = (r: AccountsReport) =>
      answersOf(r, printed)
        .filter((a) => !a.passed)
        .map((a) => a.answer);
    const sets = good.sets;
    const withSet = (name: string, s: SetReport): AccountsReport => ({
      ...good,
      sets: { ...sets, [name]: s },
    });
    const x3 = sets.x3!;
    const x3exits = (copyh: Figure, gross: Figure = fig(1.12)) =>
      withSet("x3", {
        ...x3,
        readings: {
          ...x3.readings,
          exits: { ...reading(1366, copyh, gross), kit: x3.readings.exits.kit },
        },
      });
    expect(failed({ ...good, differ: { count: 1, first: ["x"] } })).toEqual([
      "every value of COPY-H's path equal to the kit's",
    ]);
    expect(
      failed(withSet("x3voted", { ...sets.x3voted!, found: 1292 })),
    ).toEqual(["every known entry found in both paths"]);
    for (const [k, answer] of [
      ["exits", "FIND-6-EXITS's copies, exits copied"],
      ["held", "FIND-6-EXITS's copies, held 24 h"],
      ["zero", "FIND-6-EXITS's copies at D = 0"],
    ] as const) {
      const f6 = sets.find6exits!;
      const less = { ...f6, readings: { ...f6.readings, [k]: reading(1699) } };
      expect(failed(withSet("find6exits", less))).toEqual([answer]);
    }
    expect(
      failed(
        withSet("find6exits", {
          ...sets.find6exits!,
          count: 1701,
          found: 1701,
        }),
      ),
    ).toEqual([
      "FIND-6-EXITS's copies, exits copied",
      "FIND-6-EXITS's copies, held 24 h",
      "FIND-6-EXITS's copies at D = 0",
    ]);
    expect(
      failed(
        withSet("x3", {
          ...x3,
          readings: {
            ...x3.readings,
            exits: { ...x3.readings.exits, equal: 1365 },
          },
        }),
      ),
    ).toEqual(["X3's copies, exits copied"]);
    expect(failed(x3exits(fig(-9.96, 9.06)))).toEqual([
      "X3's exits copied by trader",
    ]);
    expect(failed(x3exits(fig(-9.94, 9.04)))).toEqual([
      "X3's exits copied by trader",
    ]);
    expect(failed(x3exits(fig(-9.94, 9.06), fig(1.04)))).toEqual([
      "X3's gross by trader",
    ]);
    // The kit's path off alone fails too.
    expect(
      failed(
        withSet("x3", {
          ...x3,
          readings: {
            ...x3.readings,
            exits: {
              ...x3.readings.exits,
              kit: { net: fig(-9.94, 9.16), gross: fig(1.12) },
            },
          },
        }),
      ),
    ).toEqual(["X3's exits copied by trader"]);
    const voted = (net: Figure) =>
      withSet("x3voted", {
        ...sets.x3voted!,
        readings: { ...sets.x3voted!.readings, held: reading(1293, net) },
      });
    expect(failed(voted(fig(9.14, null)))).toEqual([
      "X3's held 24 h by trader, over its voted set",
    ]);
    expect(failed(voted(fig(9.16, 13.66)))).toEqual([
      "X3's held 24 h by trader, over its voted set",
    ]);
    const f3 = sets.x3find3!;
    expect(
      failed(
        withSet("x3find3", {
          ...f3,
          readings: { ...f3.readings, held: reading(1103) },
        }),
      ),
    ).toEqual(["X3's 1,104 in FIND-3's look, held 24 h"]);
    expect(failed({ ...good, mondays: good.mondays.slice(1) })).toEqual([
      "the Mondays",
    ]);
    const noX3 = Object.fromEntries(
      Object.entries(sets).filter(([name]) => name !== "x3"),
    );
    expect(() => answersOf({ ...good, sets: noX3 }, printed)).toThrow(
      /no known set x3/,
    );
  });
});

describe("the kit's own panel", () => {
  it("is read by the kit's loadMarket, the panel module the kit's loader checked", async () => {
    const panel = (await import(
      pathToFileURL(path.join(RESEARCH_ROOT, "kit", "panel.mjs")).href
    )) as { loadMarket: unknown };
    expect(typeof panel.loadMarket).toBe("function");
    expect(kitPanel(kit)).toBe(panel.loadMarket);
  });
});
