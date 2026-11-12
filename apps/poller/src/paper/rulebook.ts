/**
 * The collector's rule book as the experiment reads it after the freeze (the
 * plan's R6 (3), R9 and R13 COMP; architecture, "What it records"): the
 * `rulebook` collection of the collector's database, read only, every
 * document Zod-parsed. A value is stored when it changes, so a record is the
 * first time the collector saw it. From it:
 * - a market is left out of the primary cells from the UTC day of the first
 *   record that shows it close-only, settled or gone from the list (for
 *   entries at or after the cut only, so the kit's own rule stands before it);
 * - a split (R6): an event's shape is not known, so only its numeric
 *   `instrument_id` is read; the market it names (an event without one: every
 *   equity market) is out of the primary cells on every UTC day the event is
 *   in the recorded list;
 * - the base-tier taker fee from each record's instant (never a lower tier,
 *   never a rebate): an instrument's fee override in force, else its
 *   category's rate in the fee schedule; before the first record, the kit's;
 * - every competition it lists, with its boosted markets.
 */
import { MongoClient } from "mongodb";
import { z } from "zod";
import { checkDbName } from "../store/db.js";
import { DAY_MS } from "../schedule.js";

const ms = z.number().int();

const RuleDoc = z.object({
  kind: z.string(),
  key: z.string(),
  at: ms,
  value: z.unknown(),
});

const InstrumentRow = z.object({
  instrument_id: z.number().int(),
  symbol: z.string(),
  close_only: z.boolean().optional(),
  settlement: z.object({ timestamp: ms.optional() }).nullish(),
  fee_override: z
    .object({
      start_time: ms.nullish(),
      end_time: ms.nullish(),
      tiers: z.array(z.object({ taker_fee_rate: z.string() })).min(1),
    })
    .nullish(),
});

const FeeRow = z.object({
  instrument_type: z.string(),
  category: z.string(),
  taker_fee_rate: z.string(),
});

const CompetitionRow = z.object({
  competition_id: z.number().int(),
  start_time: ms,
  end_time: ms,
});

const CompetitionMarkets = z.object({
  all_markets: z.boolean(),
  markets: z.array(
    z.object({ instrument_id: z.number().int(), boost: z.string() }),
  ),
});

export const RULE_KINDS = [
  "instruments",
  "instrument",
  "fees",
  "splits",
  "competitions",
  "competition_markets",
] as const;

type Override = { start: number; end: number; rate: number };

/** The fee rules in force from `at`: the latest schedule and the latest list's overrides. */
type FeeState = {
  at: number;
  schedule: ReadonlyMap<string, number> | null;
  overrides: ReadonlyMap<number, Override>;
};

export type RuleBook = {
  /**
   * The instant of the collector's first record (2026-11-11T15:47Z): before
   * it the kit's `rulebook.json` is the rule book (R6, R9); null without one.
   */
  firstRecordAt: number | null;
  /** A market → the instant (a UTC day) from which it is left out. */
  leftOutFrom: Map<number, number>;
  /**
   * Each split event recorded (R6): the market its numeric `instrument_id`
   * names (null: every equity market) and the UTC days it was listed,
   * `from` to `to` (null: still listed), both days included.
   */
  splits: { iid: number | null; from: number; to: number | null }[];
  fees: FeeState[];
  competitions: {
    id: number;
    start: number;
    end: number;
    boosted: Set<number>;
  }[];
  /** Documents that failed their schema: logged and left out. */
  rejected: number;
};

const dayOf = (t: number) => Math.floor(t / DAY_MS) * DAY_MS;

/** `markets`: the kit's rule book's instruments (a market missing from a list record is gone). */
export function parseRuleBook(
  docs: readonly unknown[],
  markets: readonly number[],
): RuleBook {
  const book: RuleBook = {
    firstRecordAt: null,
    leftOutFrom: new Map(),
    splits: [],
    fees: [],
    competitions: [],
    rejected: 0,
  };
  const leaveOut = (iid: number, t: number) => {
    const from = book.leftOutFrom.get(iid);
    if (from === undefined || dayOf(t) < from)
      book.leftOutFrom.set(iid, dayOf(t));
  };
  const parsed = docs
    .map((d) => RuleDoc.safeParse(d))
    .flatMap((r) => {
      if (!r.success) book.rejected += 1;
      return r.success ? [r.data] : [];
    })
    .sort((a, b) => a.at - b.at);
  book.firstRecordAt = parsed[0]?.at ?? null;
  let schedule: Map<string, number> | null = null;
  let overrides = new Map<number, Override>();
  const competitions = new Map<number, { start: number; end: number }>();
  const boosted = new Map<number, Set<number>>();
  const noteFees = (at: number) => book.fees.push({ at, schedule, overrides });
  /** The split events listed now, by their text, with the day each was first listed. */
  const listed = new Map<string, { iid: number | null; from: number }>();
  for (const doc of parsed) {
    if (doc.kind === "instruments" && doc.key === "list") {
      const rows = z.array(InstrumentRow).safeParse(doc.value);
      if (!rows.success) {
        book.rejected += 1;
        continue;
      }
      const listed = new Map(rows.data.map((r) => [r.instrument_id, r]));
      overrides = new Map();
      for (const r of rows.data) {
        if (r.close_only === true || r.settlement != null)
          leaveOut(r.instrument_id, doc.at);
        const o = r.fee_override;
        if (o) {
          overrides.set(r.instrument_id, {
            start: o.start_time ?? -Infinity,
            end: o.end_time ?? Infinity,
            rate: Number(o.tiers[0]!.taker_fee_rate),
          });
        }
      }
      for (const iid of markets) if (!listed.has(iid)) leaveOut(iid, doc.at);
      noteFees(doc.at);
    } else if (doc.kind === "instrument") {
      const row = InstrumentRow.safeParse(doc.value);
      if (!row.success) {
        book.rejected += 1;
        continue;
      }
      if (row.data.close_only === true || row.data.settlement != null) {
        leaveOut(
          row.data.instrument_id,
          row.data.settlement?.timestamp ?? doc.at,
        );
      }
    } else if (doc.kind === "fees" && doc.key === "schedule") {
      const rows = z.array(FeeRow).safeParse(doc.value);
      if (!rows.success) {
        book.rejected += 1;
        continue;
      }
      schedule = new Map(
        rows.data
          .filter((r) => r.instrument_type === "perpetual")
          .map((r) => [r.category, Number(r.taker_fee_rate)]),
      );
      noteFees(doc.at);
    } else if (doc.kind === "splits" && doc.key === "events") {
      const events = z.array(z.unknown()).safeParse(doc.value);
      if (!events.success) {
        book.rejected += 1;
        continue;
      }
      const now = new Map(events.data.map((e) => [JSON.stringify(e), e]));
      for (const [key, e] of now) {
        if (listed.has(key)) continue;
        const id = z.object({ instrument_id: z.number().int() }).safeParse(e);
        listed.set(key, {
          iid: id.success ? id.data.instrument_id : null,
          from: dayOf(doc.at),
        });
      }
      for (const [key, s] of [...listed]) {
        if (now.has(key)) continue;
        book.splits.push({ ...s, to: dayOf(doc.at) });
        listed.delete(key);
      }
    } else if (doc.kind === "competitions" && doc.key === "list") {
      const rows = z.array(CompetitionRow).safeParse(doc.value);
      if (!rows.success) {
        book.rejected += 1;
        continue;
      }
      for (const r of rows.data) {
        competitions.set(r.competition_id, {
          start: r.start_time,
          end: r.end_time,
        });
      }
    } else if (doc.kind === "competition_markets") {
      const markets = CompetitionMarkets.safeParse(doc.value);
      if (!markets.success) {
        book.rejected += 1;
        continue;
      }
      boosted.set(
        Number(doc.key),
        new Set(
          markets.data.markets
            .filter((m) => Number(m.boost) > 1)
            .map((m) => m.instrument_id),
        ),
      );
    }
  }
  book.competitions = [...competitions]
    .sort((a, b) => a[0] - b[0])
    .map(([id, c]) => ({ id, ...c, boosted: boosted.get(id) ?? new Set() }));
  for (const s of listed.values()) book.splits.push({ ...s, to: null });
  return book;
}

/**
 * The base-tier taker rate in force at t by the rule book — an override in
 * force at t, else the category's rate — or null before its first record
 * (the kit's rate applies).
 */
export function bookTaker(
  book: RuleBook,
  iid: number,
  category: string,
  t: number,
): number | null {
  let state: FeeState | undefined;
  for (const s of book.fees) {
    if (s.at > t) break;
    state = s;
  }
  if (state === undefined) return null;
  const o = state.overrides.get(iid);
  if (o !== undefined && t >= o.start && t < o.end) return o.rate;
  return state.schedule?.get(category) ?? null;
}

/**
 * The categories of `categories` that some recorded fee schedule has no rate
 * for: their copies are priced at the kit's rate, and the page raises an
 * alarm (R9).
 */
export function missingFeeCategories(
  book: RuleBook,
  categories: Iterable<string>,
): string[] {
  const wanted = [...new Set(categories)].sort();
  return wanted.filter((c) =>
    book.fees.some((s) => s.schedule !== null && !s.schedule.has(c)),
  );
}

/** Every rule-book document of the kinds above, read only, oldest first. */
export async function readRuleBook(
  uri: string,
  dbName: string,
): Promise<unknown[]> {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10_000 });
  try {
    return await client
      .db(checkDbName(dbName))
      .collection("rulebook")
      .find({ kind: { $in: [...RULE_KINDS] } }, { projection: { _id: 0 } })
      .sort({ at: 1 })
      .toArray();
  } finally {
    await client.close();
  }
}
