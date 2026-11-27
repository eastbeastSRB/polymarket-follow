/**
 * The choice (copyh/rules.md C14; the engine's plan, section 8 and Q3):
 * `dist\copyh.js choice`, from the rounds' files alone, written by the
 * program into `<COPYH_ROOT>\rounds\choice.json`. A try qualifies when, on
 * E: m − 2.99·SE > 0 and m′ − 2.99·SE′ > 0 (H1's pair); the mean of its
 * traders' own means of x > 0 and its mean of x without its two best days
 * > 0 (RL8); at least 100 traders and 100 UTC days, counted on its priced
 * copies (Q15). At most two qualifying tries go on, those with the highest
 * m − 2.99·SE (ties: the earlier round, then the earlier try); none if none
 * qualifies. A second choice refuses (exit 5); with no round run, none is
 * chosen. The choice is one part computed twice (C15's guard; Q3), each
 * round's file held to its SHA-256; `choice.json` holds the chosen tries
 * whole (line, conditions, why) for step 2's confirmation, its identity
 * first.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { loadResearch } from "../paper/research.js";
import {
  CHOICE_MIN_DAYS,
  CHOICE_MIN_TRADERS,
  CHOSEN_AT_MOST,
  ROUNDS,
} from "./design.js";
import { partBytes, runPhase, type PartFunction } from "./engine.js";
import { RoundFile, TryFigures, roundFile, type RoundsRun } from "./rounds.js";
import {
  AlreadyRun,
  PACKAGE_ROOT,
  StoreError,
  fingerprintOf,
  sha256,
  writeWhole,
} from "./run.js";
import { checkPath } from "./seal.js";
import { identityOf } from "./steps.js";
import { Try } from "./tries.js";

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);

/** Whether a try qualifies on E (C14's choice). */
export function qualifies(f: TryFigures): boolean {
  const m = f.statistic.money;
  const traders = f.statistic.signs.traders;
  return (
    f.lower !== null &&
    f.lower.money > 0 &&
    f.lower.edge > 0 &&
    traders !== null &&
    traders > 0 &&
    f.withoutBestDays !== null &&
    f.withoutBestDays > 0 &&
    m !== null &&
    m.traders >= CHOICE_MIN_TRADERS &&
    m.days >= CHOICE_MIN_DAYS
  );
}

/** A try of a round, by its round and its place in it. */
export const Placed = z.object({
  round: z.number().int().min(1).max(ROUNDS),
  index: z.number().int().nonnegative(),
  name: z.string(),
});
export const Chosen = Placed.extend({ try: Try, figures: TryFigures });
export type Chosen = z.infer<typeof Chosen>;
/** The choice's figures: the rounds read, the qualifying tries, the chosen ones whole. */
export const ChoiceOf = z.object({
  rounds: z.array(z.object({ round: z.number(), sha256: SHA256 })),
  qualified: z.array(Placed),
  chosen: z.array(Chosen),
});
export type ChoiceOf = z.infer<typeof ChoiceOf>;

/** The qualifying tries of the rounds, in their order, and the chosen: at most two by the highest m − 2.99·SE, ties the earlier round, then the earlier try. */
export function chosenOf(
  rounds: readonly Pick<RoundFile, "round" | "tries" | "figures">[],
): Pick<ChoiceOf, "qualified" | "chosen"> {
  const qualified: Chosen[] = [];
  for (const r of rounds)
    r.tries.forEach((t, index) => {
      const figures = r.figures[index]!;
      if (qualifies(figures))
        qualified.push({
          round: r.round,
          index,
          name: t.name,
          try: t,
          figures,
        });
    });
  const chosen = [...qualified]
    .sort(
      (a, b) =>
        b.figures.lower!.money - a.figures.lower!.money ||
        a.round - b.round ||
        a.index - b.index,
    )
    .slice(0, CHOSEN_AT_MOST);
  return {
    qualified: qualified.map(({ round, index, name }) => ({
      round,
      index,
      name,
    })),
    chosen,
  };
}

export const ChoiceInputs = z.object({
  code: z.string(),
  /** Each round's file by SHA-256, rounds 1 to k. */
  rounds: z.array(SHA256).max(ROUNDS),
});
/** Where the choice reads: COPY-H's folder. */
export const ChoiceContext = z.object({ root: z.string() });

/** The choice's function (engine.ts `PartFunction`): the round files held to their SHA-256s, the choice. */
export const choicePart: PartFunction = (inputs, ctx) => {
  const i = ChoiceInputs.parse(inputs);
  const c = ChoiceContext.parse(ctx.context);
  const rounds = i.rounds.map((want, k) => {
    const file = roundFile(c.root, k + 1);
    checkPath(file, ctx.seal);
    const bytes = readFileSync(file);
    if (sha256(bytes) !== want)
      throw new StoreError(`${file}: not the round the choice names`);
    const r = RoundFile.parse(JSON.parse(bytes.toString("utf8")));
    if (r.round !== k + 1 || r.figures.length !== r.tries.length)
      throw new StoreError(`${file}: not round ${k + 1}'s figures`);
    return r;
  });
  return Buffer.from(
    `${JSON.stringify({
      rounds: i.rounds.map((s, k) => ({ round: k + 1, sha256: s })),
      ...chosenOf(rounds),
    } satisfies ChoiceOf)}\n`,
    "utf8",
  );
};

/** `choice.json`, in `<COPYH_ROOT>\rounds\`. */
export const choiceFile = (root: string) =>
  path.join(root, "rounds", "choice.json");

/** `choice`: the refusal, the rounds' files 1 to k (the first missing ends them), the choice twice (one part, two processes), `choice.json` written whole, its identity first. */
export async function runChoice(o: RoundsRun): Promise<void> {
  const out = choiceFile(o.root);
  if (existsSync(out))
    throw new AlreadyRun(`${out} exists: the choice is made once`);
  const files: string[] = [];
  for (let k = 1; k <= ROUNDS && existsSync(roundFile(o.root, k)); k++)
    files.push(roundFile(o.root, k));
  const kit = await loadResearch();
  const dir = path.join(o.root, "rounds", "engine", "choice");
  const record = await runPhase({
    name: "CHOICE",
    dir,
    module: path.join(PACKAGE_ROOT, "dist", "copyh", "choice.js"),
    fn: "choicePart",
    parts: [
      {
        id: "choice",
        inputs: {
          code: fingerprintOf(PACKAGE_ROOT),
          rounds: files.map((f) => sha256(readFileSync(f))),
        } satisfies z.infer<typeof ChoiceInputs>,
      },
    ],
    context: { root: o.root },
    workers: 1,
    heapGb: o.heapGb,
    seal: o.seal,
    budget: o.budget,
    log: o.log,
  });
  const choice = ChoiceOf.parse(
    JSON.parse(partBytes(dir, record, "choice").toString("utf8")),
  );
  const identity = identityOf({
    packageRoot: PACKAGE_ROOT,
    freeze: o.freeze,
    kit: kit.fingerprint,
    files: Object.fromEntries(
      files.map((f) => [`rounds/${path.basename(f)}`, f]),
    ),
    heapGb: o.heapGb,
  });
  writeWhole(out, `${JSON.stringify({ identity, ...choice }, null, 1)}\n`);
  o.log("done: the choice written", {
    file: out,
    rounds: files.length,
    chosen: choice.chosen.length,
  });
}
