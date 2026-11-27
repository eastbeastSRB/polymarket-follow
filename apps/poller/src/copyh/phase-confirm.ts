/**
 * CONFIRM (copyh/rules.md C14's confirmation, C13's "MAIN on S alone"; the
 * engine's plan, section 8 and Q3), on engine.ts: one part after RANK at
 * step 2, computed twice like every light phase that decides.
 * - Every position of the look in the positions' order, as its line of
 *   `positions.jsonl.gz` (phase-result.ts `positionLines`), and of those
 *   with t in S ([from, to)):
 * - each chosen try's set on S: its line's copies voted by END, every
 *   condition met, the prior mean net's among them (tries.ts `inTry`), x its
 *   net and x′ its line's edge; their statistics (C12's forms) and readings
 *   (confirm.ts `confirmationOf`: Holm's order by s, 2.24 then 1.96), in the
 *   choice's order;
 * - MAIN on S alone (L8): the prints of S's voted copies (prints.ts
 *   `reportOf`), every figure of a look's report, deciding nothing.
 * A part's bytes: one JSON line, {tries: [{name, line, statistic, reading,
 * s, z, sentences}…], mainOnS}.
 */
import { z } from "zod";
import { confirmationOf } from "./confirm.js";
import { END_S } from "./design.js";
import type { PartFunction, PartSpec, PhaseRecord } from "./engine.js";
import { partBytes, recordAt } from "./engine.js";
import { StatisticLine, positionLines } from "./phase-result.js";
import { printCopyOf, reportOf, type PrintCopy } from "./prints.js";
import { StoreError } from "./run.js";
import { Try, TryLine, inTry, judgedOf } from "./tries.js";
import { statisticOf, type JudgedCopy } from "./verdict.js";

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
export const ConfirmInputs = z.object({
  code: z.string(),
  prices: SHA256,
  rank: SHA256,
  mondays: z.array(z.number()),
  /** The chosen tries, in the choice's order (copyh/choice.json). */
  tries: z.array(Try),
  /** S's window of t. */
  from: z.number(),
  to: z.number(),
  /** The look's z, for MAIN on S's prints. */
  z: z.number(),
});
export type ConfirmInputs = z.infer<typeof ConfirmInputs>;
/** Where CONFIRM reads: PRICES' and RANK's folders. */
export const ConfirmContext = z.object({
  prices: z.string(),
  rank: z.string(),
});

/** A chosen try's reading on S. */
export const TryConfirmation = z.object({
  name: z.string(),
  line: z.enum(["MAIN", "BROAD"]),
  statistic: StatisticLine,
  reading: z.enum(["CONFIRMED", "NOT CONFIRMED", "WITHHELD"]),
  s: z.number().nullable(),
  z: z.number().nullable(),
  sentences: z.array(z.string()),
});
export type TryConfirmation = z.infer<typeof TryConfirmation>;
export const ConfirmPart = z.object({
  tries: z.array(TryConfirmation),
  mainOnS: z.record(z.string(), z.unknown()),
});
export type ConfirmPart = z.infer<typeof ConfirmPart>;

/** CONFIRM's function (engine.ts `PartFunction`). */
export const confirmPart: PartFunction = (inputs, ctx) => {
  const i = ConfirmInputs.parse(inputs);
  const c = ConfirmContext.parse(ctx.context);
  const sets = i.tries.map((): JudgedCopy[] => []);
  const onS: PrintCopy[] = [];
  for (const { p, line, rank } of positionLines({
    prices: { dir: c.prices, record: recordAt(c.prices, i.prices) },
    rank: { dir: c.rank, record: recordAt(c.rank, i.rank) },
    mondays: i.mondays,
  })) {
    if (p.t < i.from || p.t >= i.to) continue;
    if (p.voted) onS.push(printCopyOf(p, rank));
    const tl = TryLine.parse(JSON.parse(line));
    i.tries.forEach((t, k) => {
      if (inTry(tl, t)) sets[k]!.push(judgedOf(tl, t.line));
    });
  }
  const statistics = sets.map((s) => statisticOf(ctx.kit, s));
  const readings = confirmationOf(statistics);
  return Buffer.from(
    `${JSON.stringify({
      tries: i.tries.map((t, k) => ({
        name: t.name,
        line: t.line,
        statistic: statistics[k]!,
        ...readings[k]!,
      })),
      mainOnS: reportOf(ctx.kit, onS, {
        z: i.z,
        look: 2,
        start: i.from,
        end: i.to,
        endS: END_S,
      }),
    })}\n`,
    "utf8",
  );
};

/** CONFIRM's one part. */
export const confirmParts = (o: ConfirmInputs): PartSpec[] => [
  { id: "confirm", inputs: o },
];

/** A closed CONFIRM phase's readings and prints, held to its record. */
export function confirmOf(dir: string, record: PhaseRecord): ConfirmPart {
  const text = partBytes(dir, record, "confirm").toString("utf8");
  if (!text.endsWith("\n") || text.indexOf("\n") !== text.length - 1)
    throw new StoreError(`${dir}: CONFIRM's part is not its one line`);
  return ConfirmPart.parse(JSON.parse(text));
}
