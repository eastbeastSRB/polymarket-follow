/**
 * RESULT (copyh/rules.md C12, C14's covariates, C15's writes; the engine's
 * plan, section 7), on engine.ts: one part, after RANK.
 * - Every position of PRICES' parts in the positions' order, by entry id:
 *   each part is one coin's, by id, so the parts are merged; a tie of ids is
 *   one account's, in the kit's order. Each is written as its line of
 *   `positions.jsonl.gz` (`positionLine`): the copy with its legs and readings,
 *   C14's prior mean net in its covariates and its RANK membership (C7) from
 *   RANK's tables; the lines are hashed uncompressed as they come (C15 (c)
 *   10's form; the engine's plan, Q5), never held as one string.
 * - The set of the look: MAIN's copies voted by its END (C12), x its net,
 *   x′ its MAIN edge, its thin tape; the statistic (verdict.ts `statisticOf`)
 *   and MAIN's reading at the look's z (`readingOf`), "after the verdict"
 *   when an earlier look gave KEEP or DROP.
 * - The look's prints (prints.ts `reportOf`, C13) on its voted copies.
 * A part's bytes: two JSON lines, {look, z, verdict, sentences, after,
 * statistic, positions: {lines, sha256}}, what `result.json` holds of the
 * outcome, then the prints, what `report.json` holds of the positions (the
 * step writes both, each with its identity first, the result before
 * anything about an outcome is logged and the report after the positions).
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { END_S, Z_LOOKS } from "./design.js";
import type { PartFunction, PartSpec, PhaseRecord } from "./engine.js";
import { partBytes, partLines, recordAt } from "./engine.js";
import { positionOf, type Position } from "./phase-prices.js";
import { rankTablesOf, type RankTables } from "./phase-rank.js";
import { printCopyOf, reportOf, type PrintCopy } from "./prints.js";
import { StoreError } from "./run.js";
import {
  afterTheVerdict,
  readingOf,
  statisticOf,
  type JudgedCopy,
  type Statistic,
} from "./verdict.js";

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
const VERDICT = z.enum(["KEEP", "DROP", "TOO FEW TO TELL", "WITHHELD"]);
export const ResultInputs = z.object({
  code: z.string(),
  prices: SHA256,
  rank: SHA256,
  mondays: z.array(z.number()),
  /** The stage's first instant and END: the prints' weeks (copies a week, the smallest edge at look 2). */
  start: z.number(),
  end: z.number(),
  look: z.union([z.literal(1), z.literal(2)]),
  /** The earlier looks' verdicts (C12's "after the verdict"). */
  earlier: z.array(VERDICT),
});
export type ResultInputs = z.infer<typeof ResultInputs>;
/** Where RESULT reads: PRICES' and RANK's phase folders. */
export const ResultContext = z.object({ prices: z.string(), rank: z.string() });

const TwoWayLine = z.object({
  n: z.number(),
  mean: z.number(),
  se: z.number().nullable(),
  seTrader: z.number().nullable(),
  seDay: z.number().nullable(),
  seIid: z.number().nullable(),
  traders: z.number(),
  days: z.number(),
});
/** verdict.ts's Statistic as RESULT's part and a round's file hold it. */
export const StatisticLine = z.object({
  copies: z.number(),
  unpriced: z.number(),
  unpricedShare: z.number(),
  money: TwoWayLine.nullable(),
  edge: z.object({
    byDay: TwoWayLine.nullable(),
    byWeek: TwoWayLine.nullable(),
    se: z.number().nullable(),
  }),
  signs: z.object({
    traders: z.number().nullable(),
    days: z.number().nullable(),
    withoutThin: z.number().nullable(),
  }),
}) satisfies z.ZodType<Statistic>;
/** What RESULT gives a step: MAIN's reading of the look and the positions' lines. */
export const Result = z.object({
  look: z.union([z.literal(1), z.literal(2)]),
  z: z.number(),
  verdict: VERDICT,
  sentences: z.array(z.string()),
  after: z.boolean(),
  statistic: StatisticLine,
  positions: z.object({ lines: z.number(), sha256: SHA256 }),
});
export type Result = z.infer<typeof Result>;

/** A position's line of positions.jsonl.gz, without its newline: the copy, C14's prior mean net among its covariates, and whether it is a RANK copy (C7). */
export const positionLine = (
  p: Position,
  priorMeanNetBps: number | null,
  rank: boolean,
): string =>
  JSON.stringify({
    ...p,
    covariates: { ...p.covariates, priorMeanNetBps },
    rank,
  });

/** A closed PRICES phase's positions in the positions' order, by entry id: its parts (one coin's each, by id) merged; a part out of that order, and an id in two parts (an id holds its coin), are refused. */
export function* positionsInOrder(
  dir: string,
  record: PhaseRecord,
): Generator<Position> {
  type Head = { p: Position; lines: Generator<Buffer>; part: number };
  const heap: Head[] = [];
  const less = (a: Head, b: Head) => a.p.id < b.p.id;
  const push = (h: Head) => {
    heap.push(h);
    for (let k = heap.length - 1; k > 0;) {
      const up = (k - 1) >> 1;
      if (!less(heap[k]!, heap[up]!)) break;
      [heap[k], heap[up]] = [heap[up]!, heap[k]!];
      k = up;
    }
  };
  const pop = (): Head => {
    const top = heap[0]!;
    const last = heap.pop()!;
    if (heap.length > 0) {
      heap[0] = last;
      for (let k = 0; ;) {
        const l = 2 * k + 1;
        const r = l + 1;
        let m = k;
        if (l < heap.length && less(heap[l]!, heap[m]!)) m = l;
        if (r < heap.length && less(heap[r]!, heap[m]!)) m = r;
        if (m === k) break;
        [heap[k], heap[m]] = [heap[m]!, heap[k]!];
        k = m;
      }
    }
    return top;
  };
  const next = (h: Omit<Head, "p">, after: string | null) => {
    const r = h.lines.next();
    if (r.done === true) return;
    const p = positionOf(r.value);
    if (after !== null && p.id < after)
      throw new StoreError(`PRICES' part ${h.part}: a copy out of id order`);
    push({ ...h, p });
  };
  record.parts.forEach(([id], part) =>
    next({ lines: partLines(dir, record, id), part }, null),
  );
  let last: { id: string; part: number } | null = null;
  while (heap.length > 0) {
    const h = pop();
    if (last !== null && last.id === h.p.id && last.part !== h.part)
      throw new StoreError(`${h.p.id}: an id in two of PRICES' parts`);
    last = { id: h.p.id, part: h.part };
    yield h.p;
    next(h, h.p.id);
  }
}

/** Each position's line in the positions' order, with RANK's tables (the lines `positions.jsonl.gz` holds, and RESULT hashes). */
export function* positionLines(o: {
  prices: { dir: string; record: PhaseRecord };
  rank: { dir: string; record: PhaseRecord };
  mondays: readonly number[];
}): Generator<{ p: Position; line: string; rank: boolean }> {
  yield* rankedLinesOf(
    positionsInOrder(o.prices.dir, o.prices.record),
    rankTablesOf(o.rank.dir, o.rank.record),
    o.mondays,
  );
}

/** Positions' lines, in the positions' order, with RANK's tables: a closed PRICES phase's, or the fortnight's in memory (steps.ts `fortnightOf`). */
export function* rankedLinesOf(
  positions: Iterable<Position>,
  t: RankTables,
  mondays: readonly number[],
): Generator<{ p: Position; line: string; rank: boolean }> {
  for (const p of positions) {
    const k = mondays.indexOf(p.M);
    if (k < 0)
      throw new StoreError(`${p.id}: a copy of a Monday not the step's`);
    // An account in RANK at M is in MAIN there, so each of its copies of M is MAIN's (C7).
    const rank = t.inRank(p.addr, k);
    yield { p, line: positionLine(p, t.prior(p.addr, k), rank), rank };
  }
}

/** Whether a copy is in the look's set (C12): MAIN's, voted by the look's END. */
export const inLookSet = (p: Position): boolean =>
  p.voted && p.lines.includes("MAIN");

/** A copy of the look's set as the statistic reads it (C12): x its net, x′ its MAIN edge. */
export const judgedCopyOf = (p: Position): JudgedCopy => ({
  addr: p.addr,
  tIn: p.t + p.D,
  x: p.money.reason === undefined ? p.money.net : null,
  edge: p.judged.MAIN?.edge ?? null,
  thin: p.thin,
});

/** RESULT's function (engine.ts `PartFunction`). */
export const resultPart: PartFunction = (inputs, ctx) => {
  const i = ResultInputs.parse(inputs);
  const c = ResultContext.parse(ctx.context);
  const hash = createHash("sha256");
  let lines = 0;
  const set: JudgedCopy[] = [];
  const voted: PrintCopy[] = [];
  for (const { p, line, rank } of positionLines({
    prices: { dir: c.prices, record: recordAt(c.prices, i.prices) },
    rank: { dir: c.rank, record: recordAt(c.rank, i.rank) },
    mondays: i.mondays,
  })) {
    hash.update(`${line}\n`);
    lines += 1;
    if (inLookSet(p)) set.push(judgedCopyOf(p));
    if (p.voted) voted.push(printCopyOf(p, rank));
  }
  const statistic = statisticOf(ctx.kit, set);
  const z = Z_LOOKS[i.look - 1]!;
  const result: Result = {
    look: i.look,
    z,
    ...readingOf(statistic, z),
    after: afterTheVerdict(i.earlier),
    statistic,
    positions: { lines, sha256: hash.digest("hex") },
  };
  const report = reportOf(ctx.kit, voted, {
    z,
    look: i.look,
    start: i.start,
    end: i.end,
    endS: END_S,
  });
  return Buffer.from(
    `${JSON.stringify(result)}\n${JSON.stringify(report)}\n`,
    "utf8",
  );
};

/** RESULT's one part. */
export const resultParts = (o: ResultInputs): PartSpec[] => [
  { id: "result", inputs: o },
];

/** A closed RESULT phase's two lines, held to its record. */
function resultLines(dir: string, record: PhaseRecord): [string, string] {
  const lines = partBytes(dir, record, "result").toString("utf8").split("\n");
  if (lines.length !== 3 || lines[2] !== "")
    throw new StoreError(`${dir}: RESULT's part is not its two lines`);
  return [lines[0]!, lines[1]!];
}

/** A closed RESULT phase's result, held to its record. */
export const resultOf = (dir: string, record: PhaseRecord): Result =>
  Result.parse(JSON.parse(resultLines(dir, record)[0]));

/** A closed RESULT phase's prints, held to its record (report.json's figures; they decide nothing). */
export const reportFrom = (
  dir: string,
  record: PhaseRecord,
): Record<string, unknown> =>
  z
    .record(z.string(), z.unknown())
    .parse(JSON.parse(resultLines(dir, record)[1]));
