/**
 * What a daily run and a look share (rules.md M2–M9, M15): after the gate and
 * the paper run's wait, the inputs read, each closed recording day checked
 * once and kept (`days\<date>.json`), every leg decided once from the
 * recordings and kept with the book line it used (`books\<run date>.jsonl.gz`),
 * so a later run and the looks reprice from the record and get the same
 * number; then every position of every line computed.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { z } from "zod";
import { utcDate } from "../schedule.js";
import type { Research } from "../paper/research.js";
import { bookTaker, parseRuleBook, type RuleBook } from "../paper/rulebook.js";
import {
  bookSource,
  gapAt,
  gapsOf,
  toBook,
  type CoverageEvent,
  type Gap,
} from "./book.js";
import { computeAll } from "./compute.js";
import { LARGE, SMALL_COINS } from "./fills.js";
import type { Gate } from "./gate.js";
import {
  marketsThrough,
  readPool,
  ruleBookDocs,
  type KitData,
} from "./inputs.js";
import { spotsOf, type Instants, type Position } from "./lines.js";
import type { LegQuote } from "./price.js";
import {
  DayCheckSchema,
  booksAt,
  checkDay,
  dayGaps,
  legFinal,
  parseBookText,
  recordingDays,
  type DayCheck,
  type Days,
} from "./recordings.js";
import type { Market1Config } from "./run.js";
import { writeWhole } from "./run.js";

/** START: the first whole UTC day of the collector's books (M1). */
export const START = Date.parse("2026-11-11T00:00:00Z");

/** A leg's decision, kept in MARKET-1's record. */
export const LegRecord = z.union([
  z.object({
    iid: z.number().int(),
    x: z.number().int(),
    source: z.literal("book"),
    recv: z.number().int(),
    file: z.string(),
    text: z.string(),
  }),
  z.object({
    iid: z.number().int(),
    x: z.number().int(),
    source: z.literal("mark"),
    why: z.string(),
  }),
]);
export type LegRecord = z.infer<typeof LegRecord>;

const legKey = (iid: number, x: number) => `${iid}|${x}`;

/** Every leg decision of the record, from `books\*.jsonl.gz`. */
export function readLegs(root: string): Map<string, LegRecord> {
  const dir = path.join(root, "books");
  const legs = new Map<string, LegRecord>();
  if (!existsSync(dir)) return legs;
  for (const name of readdirSync(dir).sort()) {
    if (!name.endsWith(".jsonl.gz")) continue;
    const text = gunzipSync(readFileSync(path.join(dir, name))).toString(
      "utf8",
    );
    for (const line of text.split("\n")) {
      if (line === "") continue;
      const leg = LegRecord.parse(JSON.parse(line));
      legs.set(legKey(leg.iid, leg.x), leg);
    }
  }
  return legs;
}

/** A recorded decision as the price reads it. */
export function quoteOf(leg: LegRecord): LegQuote {
  if (leg.source === "mark") return { source: "mark", why: leg.why };
  const frame = parseBookText(leg.text);
  if (frame === null)
    throw new Error(`a recorded book line fails: ${leg.file}`);
  return { source: "book", book: toBook(frame.ts, frame.data.b, frame.data.a) };
}

/** Each closed day's check, from the record or made now and kept (M15). */
async function dayChecks(
  gate: Gate,
  config: Market1Config,
  days: Days,
): Promise<{ checks: Map<string, DayCheck>; checkedNow: string[] }> {
  const checks = new Map<string, DayCheck>();
  const checkedNow: string[] = [];
  for (const date of [...days.closed].sort()) {
    const file = path.join(config.MARKET1_ROOT, "days", `${date}.json`);
    if (existsSync(file)) {
      checks.set(
        date,
        DayCheckSchema.parse(JSON.parse(readFileSync(file, "utf8"))),
      );
      continue;
    }
    const check = await checkDay(gate, config.RECORDINGS_ROOT, date);
    writeWhole(file, `${JSON.stringify(check)}\n`);
    checks.set(date, check);
    checkedNow.push(date);
  }
  return { checks, checkedNow };
}

export type Assembled = Awaited<ReturnType<typeof assemble>>;

/**
 * The run's (or a look's) world through `end`. `forceLegs` (a look past its
 * wait, M15) prices at the mark a leg whose recording days are not final.
 */
export async function assemble(a: {
  gate: Gate;
  config: Market1Config;
  kit: Research;
  kd: KitData;
  end: number;
  at: Instants;
  ruleBook?: () => Promise<unknown[]>;
  forceLegs?: boolean;
}) {
  const { gate, config, kit, kd, end, at } = a;
  const pool = readPool(gate, config.PAPER_ROOT, kd, end, at.cut);
  const docs = await (
    a.ruleBook ??
    (() => ruleBookDocs(gate, end, config.MONGO_URI, config.MONGO_DB))
  )();
  const book: RuleBook = parseRuleBook(docs, [...kd.markets.keys()]);
  const market = marketsThrough(gate, kit, config.PAPER_ROOT, kd.pinned, end);
  const tradable = (iid: number, t: number) => {
    const from = book.leftOutFrom.get(iid);
    return from === undefined || t < from;
  };
  const fee = (iid: number, t: number) =>
    bookTaker(book, iid, kd.markets.get(iid)?.category ?? "", t) ??
    kit.costs.feeAt("taker", iid, t);
  const days = recordingDays(gate, config.RECORDINGS_ROOT, end);
  const { checks, checkedNow } = await dayChecks(gate, config, days);
  const events: CoverageEvent[] = [...checks.values()]
    .flatMap((c) => c.events)
    .sort((x, y) => x.at - y.at);
  const gaps: Gap[] = [
    ...gapsOf(events),
    ...dayGaps(days, [...checks.values()]),
  ];
  // The legs to decide now: final, not P's, not yet in the record.
  const legs = readLegs(config.MARKET1_ROOT);
  const spots = spotsOf(pool.fills.small, pool.fills.large, at, end, tradable);
  const needs = new Map<string, { iid: number; x: number }>();
  for (const s of spots) {
    if (s.line === "P") continue;
    for (const x of [s.xIn, s.xOut]) {
      const k = legKey(s.iid, x);
      if (x >= end || legs.has(k)) continue;
      if (legFinal(days, x)) needs.set(k, { iid: s.iid, x });
    }
  }
  const found = await booksAt(gate, config.RECORDINGS_ROOT, days, checks, [
    ...needs.values(),
  ]);
  const allGaps = [...gaps, ...found.changed];
  const decided: LegRecord[] = [];
  for (const [k, { iid, x }] of needs) {
    const line = found.found.get(k) ?? null;
    const s = bookSource(line?.book ?? null, gapAt(allGaps, iid, x), x);
    const leg: LegRecord =
      s.source === "book"
        ? {
            iid,
            x,
            source: "book",
            recv: line!.recv,
            file: line!.file,
            text: line!.text,
          }
        : { iid, x, source: "mark", why: s.gap ? `gap: ${s.gap}` : s.why };
    legs.set(k, leg);
    decided.push(leg);
  }
  const positions: Position[] = computeAll({
    kit,
    small: pool.fills.small,
    large: pool.fills.large,
    at,
    end,
    tradable,
    market,
    quote: (iid, x) => {
      const leg = legs.get(legKey(iid, x));
      if (leg !== undefined) return quoteOf(leg);
      if (a.forceLegs && x < end)
        return { source: "mark", why: "recording not final at the look" };
      return "pending";
    },
    fee,
  });
  const hours = [...checks.values()].flatMap((c) => c.hours);
  return {
    pool,
    book,
    docs,
    market,
    fee,
    days,
    checks,
    checkedNow,
    decided,
    positions,
    format: {
      daysClosed: days.closed.size,
      daysChecked: checkedNow.length,
      hourFiles: hours.filter((h) => h.state === "ok").length,
      hourFilesNotOk: hours.filter((h) => h.state !== "ok").length,
      lines: hours.reduce((s, h) => s + h.lines, 0),
      linesFailed: hours.reduce((s, h) => s + h.failed, 0),
      alarmDays: [...checks.values()].filter((c) => c.alarm).map((c) => c.date),
      coverageUnreadable: [...checks.values()]
        .filter((c) => c.coverage !== "ok" || c.coverageFailed > 0)
        .map((c) => c.date),
      changedFiles: found.changed.length,
    },
  };
}

/** The coins left out (M3, F15): each with its day and the record that left it out. */
export function coinsLeftOut(book: RuleBook, docs: readonly unknown[]) {
  const Doc = z.object({ kind: z.string(), key: z.string(), at: z.number() });
  return [...SMALL_COINS, ...LARGE].flatMap((iid) => {
    const from = book.leftOutFrom.get(iid);
    if (from === undefined) return [];
    const day = utcDate(from);
    const by = docs
      .map((d) => Doc.safeParse(d))
      .flatMap((r) => (r.success ? [r.data] : []))
      .filter(
        (d) =>
          utcDate(d.at) === day &&
          (d.kind === "instruments" ||
            (d.kind === "instrument" && d.key === String(iid))),
      )
      .map((d) => `${d.kind}/${d.key} at ${new Date(d.at).toISOString()}`);
    return [{ iid, from: day, records: by }];
  });
}
