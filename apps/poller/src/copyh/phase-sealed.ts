/**
 * SEALED (copyh/rules.md C14's sealed judgment and FRESH-2's prints; C15's
 * writes; the engine's plan, section 8 and Q3), on engine.ts: FRESH-2's
 * stage's one part after RANK, in RESULT's place, computed twice like every
 * light phase that decides.
 * - Every position in the positions' order, as its line of
 *   `positions.jsonl.gz` (phase-result.ts `positionLines`), hashed
 *   uncompressed as it comes (what `result.json` names).
 * - Of those with t in FRESH-2 ([from, to)), each judged set: MAIN's at a
 *   KEEP (z 1.645) and each try confirmed on S (z 1.96), its line's copies
 *   voted by END, every condition met (tries.ts `inTry`), x its net and x′
 *   its line's edge; its statistic (C12's forms) and sealed reading
 *   (fresh2.ts `sealedOf`).
 * - MAIN's prints when MAIN is judged (the supervisor's ruling, 2026-11-27):
 *   prints.ts `reportOf` on FRESH-2's voted copies at MAIN's z, in FRESH-2's
 *   form (fresh2.ts `fresh2Report`); a try's set gets its statistic and its
 *   reading only.
 * A part's bytes: two JSON lines, {sets, positions: {lines, sha256}}, what
 * `fresh2\result.json` holds of the outcome, then {main}, what its
 * `report.json` holds of the copies.
 */
import { createHash } from "node:crypto";
import { z } from "zod";
import { END_S } from "./design.js";
import type { PartFunction, PartSpec, PhaseRecord } from "./engine.js";
import { partBytes, recordAt } from "./engine.js";
import { fresh2Report, sealedOf } from "./fresh2.js";
import { StatisticLine, positionLines } from "./phase-result.js";
import { printCopyOf, reportOf, type PrintCopy } from "./prints.js";
import { StoreError } from "./run.js";
import { Condition, TryLine, inTry, judgedOf } from "./tries.js";
import { statisticOf, type JudgedCopy } from "./verdict.js";

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
/** A set FRESH-2's stage judges (C14 (4)): MAIN's at a KEEP, or a try confirmed on S, with its z. */
export const SealedSet = z.object({
  kind: z.enum(["MAIN", "try"]),
  name: z.string(),
  line: z.enum(["MAIN", "BROAD"]),
  conditions: z.array(Condition),
  z: z.number(),
});
export type SealedSet = z.infer<typeof SealedSet>;
export const SealedInputs = z.object({
  code: z.string(),
  prices: SHA256,
  rank: SHA256,
  mondays: z.array(z.number()),
  /** The judged sets, MAIN's first when judged, then the tries in the choice's order. */
  sets: z.array(SealedSet).min(1),
  /** FRESH-2's window of t. */
  from: z.number(),
  to: z.number(),
});
export type SealedInputs = z.infer<typeof SealedInputs>;
/** Where SEALED reads: PRICES' and RANK's folders. */
export const SealedContext = z.object({
  prices: z.string(),
  rank: z.string(),
});

/** A judged set's sealed reading on FRESH-2. */
export const SealedReading = SealedSet.omit({ conditions: true }).extend({
  statistic: StatisticLine,
  reading: z.enum(["CONFIRMED", "NOT CONFIRMED", "WITHHELD"]),
  sentences: z.array(z.string()),
});
/** What `fresh2\result.json` holds of the outcome. */
export const SealedResult = z.object({
  sets: z.array(SealedReading),
  positions: z.object({ lines: z.number(), sha256: SHA256 }),
});
export type SealedResult = z.infer<typeof SealedResult>;

/** SEALED's function (engine.ts `PartFunction`). */
export const sealedPart: PartFunction = (inputs, ctx) => {
  const i = SealedInputs.parse(inputs);
  const c = SealedContext.parse(ctx.context);
  const hash = createHash("sha256");
  let lines = 0;
  const sets = i.sets.map((): JudgedCopy[] => []);
  const onFresh2: PrintCopy[] = [];
  for (const { p, line, rank } of positionLines({
    prices: { dir: c.prices, record: recordAt(c.prices, i.prices) },
    rank: { dir: c.rank, record: recordAt(c.rank, i.rank) },
    mondays: i.mondays,
  })) {
    hash.update(`${line}\n`);
    lines += 1;
    if (p.t < i.from || p.t >= i.to) continue;
    if (p.voted) onFresh2.push(printCopyOf(p, rank));
    const tl = TryLine.parse(JSON.parse(line));
    i.sets.forEach((s, k) => {
      if (inTry(tl, s)) sets[k]!.push(judgedOf(tl, s.line));
    });
  }
  const result: SealedResult = {
    sets: i.sets.map((s, k) => {
      const statistic = statisticOf(ctx.kit, sets[k]!);
      const { reading, sentences } = sealedOf(statistic, s.z);
      return {
        kind: s.kind,
        name: s.name,
        line: s.line,
        z: s.z,
        statistic,
        reading,
        sentences,
      };
    }),
    positions: { lines, sha256: hash.digest("hex") },
  };
  const main = i.sets.find((s) => s.kind === "MAIN");
  const report = {
    main:
      main === undefined
        ? null
        : fresh2Report(
            reportOf(ctx.kit, onFresh2, {
              z: main.z,
              look: 2,
              start: i.from,
              end: i.to,
              endS: END_S,
            }),
          ),
  };
  return Buffer.from(
    `${JSON.stringify(result)}\n${JSON.stringify(report)}\n`,
    "utf8",
  );
};

/** SEALED's one part. */
export const sealedParts = (o: SealedInputs): PartSpec[] => [
  { id: "sealed", inputs: o },
];

/** A closed SEALED phase's two lines, held to its record. */
function sealedLines(dir: string, record: PhaseRecord): [string, string] {
  const lines = partBytes(dir, record, "sealed").toString("utf8").split("\n");
  if (lines.length !== 3 || lines[2] !== "")
    throw new StoreError(`${dir}: SEALED's part is not its two lines`);
  return [lines[0]!, lines[1]!];
}

/** A closed SEALED phase's result, held to its record. */
export const sealedResultOf = (
  dir: string,
  record: PhaseRecord,
): SealedResult => SealedResult.parse(JSON.parse(sealedLines(dir, record)[0]));

/** A closed SEALED phase's prints, held to its record (they decide nothing). */
export const sealedReportOf = (
  dir: string,
  record: PhaseRecord,
): Record<string, unknown> =>
  z
    .record(z.string(), z.unknown())
    .parse(JSON.parse(sealedLines(dir, record)[1]));
