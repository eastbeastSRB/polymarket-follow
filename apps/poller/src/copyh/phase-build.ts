/**
 * The build phase, BUILD, and its large lane, BUILD-L (copyh/rules.md C2,
 * C4–C8, C10's members, C11's gap; the engine's plan, section 1; the
 * supervisor's two-lane ruling, 2026-11-26), on engine.ts.
 * - A BUILD part: one account bucket's accounts P1 at some Monday of the
 *   step (LABELS' and LABELS-L's parts, each read held to its record). Each
 *   one's fills to END counted first, from the store's columns: above
 *   HISTORY_FILLS_MAX, named with its count and run through nothing; above
 *   the normal lane's threshold, deferred to BUILD-L; else its rows, their
 *   market trades' keys kept apart and the rows dropped before the kit runs,
 *   its fills through the kit's history (entries.ts; above EXITS_MAX named
 *   with its exit rows and its OPEN and FLIP events where it is P1).
 * - A built account: its habits at each Monday where it is P1 (labels.ts,
 *   the straddling ones counted), its lines there (lines.ts); each entry of
 *   the stage judged in a line, in a primary market (C6; the others counted
 *   by line), as a copy: its id and D, its exits, its plan to END or its
 *   coin's end (money.ts), the vote, the gap (unpriced.ts), and C14's
 *   covariates but the prior mean net (a price); and, at each Monday where
 *   it is in a line, its market trades' keys in the week of M cut at END,
 *   with the lines as a mask, for REMOVAL (C10).
 * - A BUILD-L part: the deferred accounts of one BUILD part, one at a time,
 *   alone on the machine at the heap cap.
 * - Counted beside (no price): the ids that two of the stage's entries of a
 *   built account share (the kit's id is account, coin, time and type: both
 *   entries are copies, never keyed by the id alone, the kit's order
 *   breaking a tie of ids; the supervisor's ruling on the engine review's
 *   Q2, 2026-11-26), and the entries of direction 0 (an OPEN of size 0,
 *   which the rule of Q3 makes no entry once the rehearsal counts one).
 * - A part's bytes: an index line, then the facts (the counts and the
 *   accounts named), then each coin's copies, a JSON line each, and its
 *   keys, KEYS_A_LINE a line, the index giving each run of lines, so that a
 *   later phase reads one coin's lines alone and no line nears V8's cap on a
 *   string.
 */
import { statSync } from "node:fs";
import { z } from "zod";
import { MINUTE_MS } from "../schedule.js";
import { readBucket, type AccountView } from "./accounts.js";
import { BUCKETS, WORKER_HEAP_GB } from "./design.js";
import type { PartFunction, PartSpec, PhaseRecord } from "./engine.js";
import { bytesAt, heldPart, partBytes, recordAt } from "./engine.js";
import {
  delayOf,
  entriesIn,
  historyOf,
  openFlipEvents,
  residues,
} from "./entries.js";
import { mondayOf } from "./instants.js";
import { memberRecords, votedBy } from "./judge.js";
import { DIRECTIONAL, coverageAt, habitsAtMonday } from "./labels.js";
import { LINES, accountLines, entryLines, type Line } from "./lines.js";
import { isPrimary } from "./markets.js";
import { planOf } from "./money.js";
import { normOf } from "./normalize.js";
import {
  LabelsPart,
  ReadingContext,
  ReadingInputs,
  readingOf,
} from "./phase-labels.js";
import { StoreError } from "./run.js";
import type { Store } from "./store.js";
import { holesOfReading, isGap } from "./unpriced.js";

/** The normal lane's history at most, at WORKER_HEAP_GB: a market maker's history there fits within half the heap (the kit's 1.18 KB a fill and the reader's 0.25 KB, COPYH-ENGINE's measure, 2026-11-26); scaled by the heap. */
export const LANE_HISTORY_FILLS = 2_500_000;
export const laneHistoryFills = (heapGb: number): number =>
  Math.floor((LANE_HISTORY_FILLS * heapGb) / WORKER_HEAP_GB);
/** A line's bit in a key's mask. */
export const MASK: Readonly<Record<Line, number>> = {
  MAIN: 1,
  TEN: 2,
  BROAD: 4,
  DAY: 8,
};
/** The keys of a part's line at most (a part constant: it decides nothing). */
export const KEYS_A_LINE = 100_000;

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
export const BuildInputs = ReadingInputs.extend({
  code: z.string(),
  bucket: z
    .number()
    .int()
    .min(0)
    .max(BUCKETS - 1),
  end: z.number(),
  stage: z.tuple([z.number(), z.number()]),
  mondays: z.array(z.number()),
  /** LABELS' and LABELS-L's records, by SHA-256 (none: LABELS-L had no part). */
  labels: z.tuple([SHA256, SHA256.nullable()]),
  limits: z.object({ fills: z.number(), exits: z.number() }),
  /** The normal lane's history at most; null: none (BUILD-L). JSON holds no Infinity. */
  lane: z.number().nullable(),
  /** BUILD-L: the deferred accounts alone. */
  only: z.array(z.string()).optional(),
});
export type BuildInputs = z.infer<typeof BuildInputs>;
/** Where BUILD reads: the reading, and LABELS' and LABELS-L's phase folders. */
export const BuildContext = ReadingContext.extend({
  labels: z.string(),
  large: z.string(),
});

/** A copy as BUILD plans it: no price. */
export const Copy = z.object({
  id: z.string(),
  addr: z.string(),
  iid: z.number(),
  dir: z.number(),
  type: z.enum(["OPEN", "FLIP"]),
  t: z.number(),
  D: z.number(),
  M: z.number(),
  lines: z.array(z.enum(LINES)),
  exits: z.array(
    z.object({
      t: z.number(),
      share: z.number(),
      kind: z.string(),
      forced: z.boolean(),
      liq: z.boolean(),
    }),
  ),
  plan: z.object({
    legs: z.array(
      z.object({
        h: z.number(),
        part: z.number(),
        kind: z.string(),
        forced: z.boolean(),
        liq: z.boolean(),
      }),
    ),
    flag: z.enum(["open", "crossing"]).nullable(),
    lastExitT: z.number().nullable(),
    settled: z.boolean(),
  }),
  voted: z.boolean(),
  gap: z.boolean(),
  /** C14's covariates, by their names (the engine's plan, Q16), but the prior mean net. */
  covariates: z.object({
    closedCycles: z.number(),
    medianHoldHours: z.number().nullable(),
    longShare: z.number().nullable(),
    entries: z.number(),
    coin: z.number(),
    sizeUsd: z.number(),
    priorCopies: z.number(),
  }),
});
export type Copy = z.infer<typeof Copy>;

export const BuildFacts = z.object({
  p1: z.number(),
  built: z.number(),
  tooManyFills: z.array(z.tuple([z.string(), z.number()])),
  tooManyExits: z.array(z.tuple([z.string(), z.number(), z.number()])),
  deferred: z.array(z.tuple([z.string(), z.number()])),
  residues: z.number(),
  chainBreaks: z.number(),
  habitsApart: z.number(),
  /** The ids two or more of the stage's entries of an account share (Q2). */
  idsTwice: z.number(),
  /** The stage's entries of direction 0 (Q3). */
  sizeZero: z.number(),
  otherMarkets: z.record(z.string(), z.number()),
  copies: z.record(z.string(), z.number()),
  keys: z.number(),
  /** Each built account's lines at the Mondays where it is in one: [account, [[the Monday's index, the lines' mask]]] (RANK's MAIN accounts, the memberships' counts). */
  members: z.array(
    z.tuple([z.string(), z.array(z.tuple([z.number(), z.number()]))]),
  ),
});
export type BuildFacts = z.infer<typeof BuildFacts>;
/** A key a line's null leaves out: [the Monday's index, the lines' mask, time, tid]. */
export const Key = z.tuple([z.number(), z.number(), z.number(), z.string()]);
export type Key = z.infer<typeof Key>;
/** A run of a body's lines: its first byte and its length. */
const Span = z.tuple([z.number(), z.number()]);
type Span = z.infer<typeof Span>;
export const BuildIndex = z.object({
  facts: Span,
  /** Each coin's copies' lines and its keys' lines. */
  coins: z.array(z.tuple([z.number(), Span, Span])),
});
export type BuildIndex = z.infer<typeof BuildIndex>;

/** The JSON values of a run of lines, each ending in its newline (our own file: anything else is refused). Searched by Uint8Array's indexOf, which Buffer's is not past 2^31 bytes (code-rules). */
export function linesOf(bytes: Uint8Array, where: string): unknown[] {
  const out: unknown[] = [];
  const text = new TextDecoder();
  for (let at = 0; at < bytes.length;) {
    const nl = Uint8Array.prototype.indexOf.call(bytes, 10, at);
    if (nl < 0) throw new StoreError(`${where}: a line without its newline`);
    out.push(JSON.parse(text.decode(bytes.subarray(at, nl))));
    at = nl + 1;
  }
  return out;
}

/** A copy's latest instant: its follow instant or its last leg's, by a loop (never a copy's legs spread into a call: the engine review's section 8). */
export function lastInstantOf(c: {
  readonly t: number;
  readonly D: number;
  readonly plan: { readonly legs: readonly { readonly h: number }[] };
}): number {
  let h = 0;
  for (const l of c.plan.legs) if (l.h > h) h = l.h;
  return c.t + c.D + h;
}

/** Each coin's end and first Settlement in a reading of END (markets.ts `coinOf`'s, from the manifests alone: the plan needs no price). */
export function endsOf(
  stores: readonly Pick<Store, "manifest">[],
  END: number,
): (iid: number) => { end: number; settlement: { t: number } | null } {
  const first = new Map<number, number>();
  for (const s of stores)
    for (const c of s.manifest.counts.coins)
      if (c[4] >= 0 && c[4] < END && c[4] < (first.get(c[0]) ?? Infinity))
        first.set(c[0], c[4]);
  return (iid) => {
    const t = first.get(iid);
    return t === undefined
      ? { end: END, settlement: null }
      : {
          end: Math.floor(t / MINUTE_MS) * MINUTE_MS + MINUTE_MS,
          settlement: { t },
        };
  };
}

/** The P1 Mondays of a bucket's accounts, from LABELS' and LABELS-L's parts. */
function p1Mondays(
  context: z.infer<typeof BuildContext>,
  i: BuildInputs,
): Map<string, number[]> {
  const prefix = `b${String(i.bucket).padStart(3, "0")}-`;
  const out = new Map<string, number[]>();
  const read = (dir: string, want: string | null) => {
    if (want === null) return;
    const record = recordAt(dir, want);
    for (const [id] of record.parts) {
      if (!id.startsWith(prefix)) continue;
      const part = LabelsPart.parse(
        JSON.parse(partBytes(dir, record, id).toString("utf8")),
      );
      for (const d of part.mondays)
        for (const a of d.p1) {
          const ms = out.get(a);
          if (ms === undefined) out.set(a, [d.M]);
          else ms.push(d.M);
        }
    }
  };
  read(context.labels, i.labels[0]);
  read(context.large, i.labels[1]);
  for (const ms of out.values()) ms.sort((a, b) => a - b);
  return out;
}

/** C14's prior count of each copy: the trader's MAIN copies whose follow instant and every leg lie before its M, priced or not (RL6; the engine's plan, Q2). */
export function priorCopies(
  copies: readonly Pick<Copy, "t" | "D" | "M" | "lines" | "plan">[],
): number[] {
  const main = copies
    .filter((c) => c.lines.includes("MAIN"))
    .map(lastInstantOf)
    .sort((a, b) => a - b);
  /** The MAIN copies whose latest instant lies before M. */
  const before = (M: number) => {
    let lo = 0;
    let hi = main.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (main[mid]! < M) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  return copies.map((c) => before(c.M));
}

type Built = {
  copies: Copy[];
  keys: Map<number, Key[]>;
  member: [number, number][];
};

/** One account through C4–C8 and C10's members. */
function buildAccount(
  ctx: Parameters<PartFunction>[1],
  i: BuildInputs,
  view: AccountView,
  mondays: readonly number[],
  reading: {
    start: number;
    ends: ReturnType<typeof endsOf>;
    holes: [number, number][];
  },
  facts: BuildFacts,
): Built | null {
  const kit = ctx.kit;
  const fills = view.count(reading.start, i.end);
  if (fills > i.limits.fills) {
    facts.tooManyFills.push([view.addr, fills]);
    return null;
  }
  if (i.lane !== null && fills > i.lane) {
    facts.deferred.push([view.addr, fills]);
    return null;
  }
  const rows = view.rows(reading.start, i.end);
  // Its market trades' keys of each week where it is P1, taken so that the rows go before the kit runs.
  const weeks = new Map(mondays.map((M) => [M, memberRecords(rows, M, i.end)]));
  const normed = normOf(rows);
  rows.length = 0;
  const built = historyOf(kit, normed, i.limits);
  if (built.kind === "too many exits") {
    facts.tooManyExits.push([
      view.addr,
      built.exitRows,
      openFlipEvents(built.events, mondays),
    ]);
    return null;
  }
  if (built.kind === "too many fills") throw new Error("counted above");
  const h = built.history;
  facts.built += 1;
  facts.residues += residues(h.events);
  facts.chainBreaks += h.chain.breaks.length;
  const at = new Map(
    mondays.map((M) => {
      const r = habitsAtMonday(kit, h, normed, M);
      if (r.apart) facts.habitsApart += 1;
      return [
        M,
        {
          habits: r.habits,
          lines: accountLines(DIRECTIONAL, r.habits, coverageAt(kit, M)),
        },
      ];
    }),
  );
  const entries = entriesIn(h.groups, i.stage[0], i.stage[1]);
  const ids = new Map<string, number>();
  for (const g of entries) {
    if (g.dir === 0) facts.sizeZero += 1;
    const id = kit.entries.entryId(view.addr, g);
    ids.set(id, (ids.get(id) ?? 0) + 1);
  }
  for (const n of ids.values()) if (n > 1) facts.idsTwice += 1;
  const copies: Copy[] = [];
  for (const g of entries) {
    if (g.type === "ADD") continue; // none: it narrows the type
    const M = mondayOf(g.t);
    const facts_M = at.get(M);
    if (facts_M === undefined) continue;
    const coin = reading.ends(g.iid);
    const lines = entryLines(facts_M.lines, isPrimary(g.t, coin.settlement));
    if (lines.length === 0) {
      for (const l of entryLines(facts_M.lines, true))
        facts.otherMarkets[l] = (facts.otherMarkets[l] ?? 0) + 1;
      continue;
    }
    const { id, D } = delayOf(kit, view.addr, g);
    const exits = kit.exits.exitsOf(g, h.liqKeys);
    const plan = planOf({ t: g.t, D }, exits, coin);
    const habits = facts_M.habits;
    copies.push({
      id,
      addr: view.addr,
      iid: g.iid,
      dir: g.dir,
      type: g.type,
      t: g.t,
      D,
      M,
      lines,
      exits,
      plan,
      voted: votedBy(kit, g.t, i.end),
      gap: isGap(kit, h, g, plan, reading.holes, coin.end),
      covariates: {
        closedCycles: habits.closed,
        medianHoldHours:
          habits.medianHoldMs === null ? null : habits.medianHoldMs / 3_600_000,
        longShare: habits.longShare,
        entries: habits.entries,
        coin: g.iid,
        sizeUsd: g.first.notional,
        priorCopies: 0,
      },
    });
  }
  priorCopies(copies).forEach(
    (n, k) => (copies[k]!.covariates.priorCopies = n),
  );
  const out = new Map<number, Key[]>();
  const member: [number, number][] = [];
  for (const M of mondays) {
    const lines = at.get(M)!.lines;
    const mask = LINES.reduce((m, l) => (lines[l] ? m | MASK[l] : m), 0);
    if (mask === 0) continue;
    const index = i.mondays.indexOf(M);
    member.push([index, mask]);
    for (const k of weeks.get(M)!) {
      const list = out.get(k.iid) ?? [];
      list.push([index, mask, k.t, String(k.tid)]);
      out.set(k.iid, list);
    }
  }
  return { copies, keys: out, member };
}

const encode = (s: string) => Buffer.from(s, "utf8");

/** BUILD's and BUILD-L's function (engine.ts `PartFunction`). */
export const buildPart: PartFunction = (inputs, ctx) => {
  const i = BuildInputs.parse(inputs);
  const context = BuildContext.parse(ctx.context);
  const { stores, kinds } = readingOf(context, i, ctx.seal);
  const p1 = p1Mondays(context, i);
  const start = stores[0]!.manifest.start;
  const reading = {
    start,
    ends: endsOf(stores, i.end),
    holes: holesOfReading(stores, i.end),
  };
  const facts: BuildFacts = {
    p1: 0,
    built: 0,
    tooManyFills: [],
    tooManyExits: [],
    deferred: [],
    residues: 0,
    chainBreaks: 0,
    habitsApart: 0,
    idsTwice: 0,
    sizeZero: 0,
    otherMarkets: {},
    copies: {},
    keys: 0,
    members: [],
  };
  const only = i.only === undefined ? null : new Set(i.only);
  const copies = new Map<number, Copy[]>();
  const keys = new Map<number, Key[]>();
  for (const view of readBucket(
    stores,
    i.bucket,
    { from: start, to: i.end },
    kinds,
  )) {
    const mondays = p1.get(view.addr);
    if (mondays === undefined || (only !== null && !only.has(view.addr)))
      continue;
    facts.p1 += 1;
    const b = buildAccount(ctx, i, view, mondays, reading, facts);
    if (b === null) continue;
    for (const c of b.copies) {
      const list = copies.get(c.iid);
      if (list === undefined) copies.set(c.iid, [c]);
      else list.push(c);
      for (const l of c.lines) facts.copies[l] = (facts.copies[l] ?? 0) + 1;
    }
    if (b.member.length > 0) facts.members.push([view.addr, b.member]);
    for (const [iid, ks] of b.keys) {
      const list = keys.get(iid) ?? [];
      for (const k of ks) list.push(k);
      keys.set(iid, list);
      facts.keys += ks.length;
    }
  }
  if (only !== null && facts.p1 !== only.size)
    throw new StoreError(
      `bucket ${i.bucket}: a deferred account is not P1 in its reading`,
    );
  // The body: the facts, then each coin's copies by id (a tie in the kit's order: the sort is stable), a line each, and its keys, KEYS_A_LINE a line.
  const lines: Buffer[] = [];
  let at = 0;
  const put = (v: unknown) => {
    const b = encode(`${JSON.stringify(v)}\n`);
    lines.push(b);
    at += b.length;
  };
  const span = (write: () => void): Span => {
    const from = at;
    write();
    return [from, at - from];
  };
  const factsSpan = span(() => put(facts));
  const coins = [...new Set([...copies.keys(), ...keys.keys()])].sort(
    (a, b) => a - b,
  );
  const index: BuildIndex = {
    facts: factsSpan,
    coins: coins.map((iid) => [
      iid,
      span(() => {
        const list = (copies.get(iid) ?? []).sort((a, b) =>
          a.id < b.id ? -1 : a.id > b.id ? 1 : 0,
        );
        for (const c of list) put(c);
      }),
      span(() => {
        const list = keys.get(iid) ?? [];
        for (let k = 0; k < list.length; k += KEYS_A_LINE)
          put(list.slice(k, k + KEYS_A_LINE));
      }),
    ]),
  };
  return Buffer.concat([encode(`${JSON.stringify(index)}\n`), ...lines]);
};

/** The index line a part may hold at most (about 40 bytes a coin). */
const INDEX_MAX = 4 * 1024 * 1024;
/** Each BUILD part a process has read, by its file and SHA-256: its index and where its body starts. */
const indexes = new Map<string, { index: BuildIndex; body: number }>();

/** A closed BUILD or BUILD-L part, held once a process to its record (engine.ts `heldPart`): its file, index and body's start. */
function indexOf(dir: string, record: PhaseRecord, id: string) {
  const { file, sha256, start } = heldPart(dir, record, id);
  const key = `${file}|${sha256}`;
  let at = indexes.get(key);
  if (at === undefined) {
    const head = bytesAt(
      file,
      start,
      Math.min(statSync(file).size - start, INDEX_MAX),
    );
    const nl = head.indexOf(10);
    if (nl < 0) throw new StoreError(`${file}: no index line`);
    at = {
      index: BuildIndex.parse(JSON.parse(head.toString("utf8", 0, nl))),
      body: start + nl + 1,
    };
    indexes.set(key, at);
  }
  return { file, ...at };
}

/** A run of a part's lines, by its span in the part's body. */
const runOf = (
  part: { file: string; body: number },
  [off, len]: Span,
): Buffer => bytesAt(part.file, part.body + off, len);

/** A closed BUILD or BUILD-L part's facts, read by its index alone. */
export function factsOf(
  dir: string,
  record: PhaseRecord,
  id: string,
): BuildFacts {
  const part = indexOf(dir, record, id);
  return BuildFacts.parse(linesOf(runOf(part, part.index.facts), id)[0]);
}

/** One coin's copies from every part of a closed BUILD or BUILD-L phase, each part read by its index alone. */
export function coinCopies(
  dir: string,
  record: PhaseRecord,
  iid: number,
): Copy[] {
  const copies: Copy[] = [];
  for (const [id] of record.parts) {
    const part = indexOf(dir, record, id);
    const coin = part.index.coins.find(([c]) => c === iid);
    if (coin === undefined) continue;
    for (const v of linesOf(runOf(part, coin[1]), id))
      copies.push(Copy.parse(v));
  }
  return copies;
}

/** One coin's keys from every part of a closed BUILD or BUILD-L phase, each part read by its index alone. */
export function coinKeys(dir: string, record: PhaseRecord, iid: number): Key[] {
  const keys: Key[] = [];
  for (const [id] of record.parts) {
    const part = indexOf(dir, record, id);
    const coin = part.index.coins.find(([c]) => c === iid);
    if (coin === undefined) continue;
    for (const chunk of linesOf(runOf(part, coin[2]), id))
      for (const k of z.array(Key).parse(chunk)) keys.push(k);
  }
  return keys;
}

/** The coins a closed BUILD or BUILD-L phase holds copies or keys of, rising. */
export function coinsOf(dir: string, record: PhaseRecord): number[] {
  const out = new Set<number>();
  for (const [id] of record.parts)
    for (const [c] of indexOf(dir, record, id).index.coins) out.add(c);
  return [...out].sort((a, b) => a - b);
}

/** A closed BUILD part read by its index: its facts, and each coin's copies and keys. */
export function buildOf(dir: string, record: PhaseRecord, id: string) {
  const part = indexOf(dir, record, id);
  const one: PhaseRecord = {
    phase: record.phase,
    parts: record.parts.filter(([p]) => p === id),
  };
  return {
    facts: factsOf(dir, record, id),
    coins: new Map(
      part.index.coins.map(([iid]) => [
        iid,
        {
          copies: coinCopies(dir, one, iid),
          keys: coinKeys(dir, one, iid),
        },
      ]),
    ),
  };
}

/** BUILD's parts: every bucket. */
export function buildParts(
  o: Omit<BuildInputs, "bucket" | "only">,
): PartSpec[] {
  return Array.from({ length: BUCKETS }, (_, bucket) => ({
    id: `b${String(bucket).padStart(3, "0")}`,
    inputs: { ...o, bucket } satisfies BuildInputs,
  }));
}

/** BUILD-L's parts: one for each BUILD part that deferred an account, the lane at none. */
export function buildLargeParts(
  parts: readonly PartSpec[],
  facts: ReadonlyMap<string, BuildFacts>,
): PartSpec[] {
  return parts.flatMap((p) => {
    const deferred = facts.get(p.id)!.deferred.map(([a]) => a);
    return deferred.length === 0
      ? []
      : [
          {
            id: p.id,
            inputs: {
              ...(p.inputs as BuildInputs),
              lane: null,
              only: deferred,
            } satisfies BuildInputs,
          },
        ];
  });
}
