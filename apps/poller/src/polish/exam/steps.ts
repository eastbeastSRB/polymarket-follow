/**
 * The exam's steps (polish/rules.md P15; THE PLAN D47–D51), each `node
 * dist\polish.js exam --step <name>`, each naming its identity first: the
 * program's fingerprint, WAVE-H's freeze, the trusted store's manifest and
 * gates, and every exploration file it reads, each held to the SHA-256 the
 * design names (else not ready, exit 5).
 * - `placebo` (before the freeze): the placebo gate (placebo.ts) from the
 *   exploration's positions files and the trusted store's counted fills,
 *   into `<EXAM_ROOT>\placebo.json`.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { Research } from "../../paper/research.js";
import type { Coins } from "../../waveh/coins.js";
import { sha256 } from "../../waveh/gate.js";
import { writeWhole } from "../../waveh/run.js";
import { StoreError } from "../../waveh/store.js";
import { countedFrom } from "../counted.js";
import { trustedStore } from "../explore.js";
import { GATES, GATES_FILE } from "../library.js";
import { GateFailed } from "../run.js";
import { Line } from "../tries/beside.js";
import { readGzLines } from "../tries/gzlines.js";
import { meter } from "../tries/steps.js";
import { CutsFile } from "../tries/trylog.js";
import { PLACEBO, type ExamDesign } from "./design.js";
import { placeboPrint } from "./placebo.js";

export const EXAM_STEPS = ["placebo"] as const;
export type ExamStep = (typeof EXAM_STEPS)[number];

export type ExamInput = {
  /** ANALYZER_ROOT: the ten months' folder (its trusted store, gates and exploration), read only. */
  analyzer: string;
  /** EXAM_ROOT: the exam's own folder. */
  root: string;
  coins: Coins;
  kit: Research;
  /** This program's fingerprint. */
  code: string;
  wavehFrozen: string;
  /** `polish/cuts.json`, the frozen cuts. */
  cutsFile: string;
  /** What the inputs are held to: the design's (EXAM_DESIGN). */
  design: ExamDesign;
  log: (event: string, fields: object) => void;
};

/** An exploration file, held to the design's SHA-256 (else not ready, exit 5). */
function explored(o: ExamInput, name: string, want: string): string {
  const file = path.join(o.analyzer, "explore", name);
  if (!existsSync(file))
    throw new StoreError(`no explore\\${name} in ${o.analyzer}`);
  const got = sha256(readFileSync(file));
  if (got !== want)
    throw new StoreError(
      `explore\\${name}: SHA-256 ${got}, the exam's ${want}`,
    );
  return file;
}

/** The trusted store of the ten months and the step's identity: its manifest and gates the exploration's (else not ready, exit 5). */
function identityOf(o: ExamInput) {
  const store = trustedStore(o.analyzer);
  const gates = sha256(readFileSync(path.join(o.analyzer, GATES, GATES_FILE)));
  if (store.id !== o.design.explored.store || gates !== o.design.explored.gates)
    throw new StoreError(
      `the trusted store (manifest ${store.id}, gates ${gates}) is not the exploration's (${o.design.explored.store}, ${o.design.explored.gates})`,
    );
  return {
    store,
    identity: {
      code: o.code,
      wavehFrozen: o.wavehFrozen,
      store: store.id,
      gates,
    },
  };
}

/** A positions file's lines of one group, each through `Line` (the others skipped unparsed), in order, as a stream. */
const groupLines = async (file: string, group: string): Promise<Line[]> =>
  (
    await readGzLines(file, (text) => {
      const raw = JSON.parse(text) as { group?: unknown };
      return raw.group === group ? Line.parse(raw) : null;
    })
  ).filter((l): l is Line => l !== null);

const Placebo = z.object({
  draws: z.number(),
  above258: z.number(),
  above281: z.number(),
  sd: z.number(),
  p995: z.number().nullable(),
  p9975: z.number().nullable(),
  errors: z.object({
    median: z.number().nullable(),
    q1: z.number().nullable(),
    q3: z.number().nullable(),
  }),
  student: z.number(),
});
/** What the placebo reads of beside.json (our own file: one that does not parse throws). */
const Beside = z.object({
  goes: z.literal("N"),
  rebasedBy: z.literal(0),
  placebo: z.object({
    seed: z.literal(PLACEBO.seed),
    rule: z.record(z.string(), Placebo),
  }),
});
/** What the placebo reads of c.json: N's evaluation on C, printed by the exploration. */
const COnN = z.object({
  goes: z.literal("N"),
  evaluations: z.array(
    z.object({
      rule: z.string(),
      stat: z.object({ mean: z.number(), se: z.number() }),
    }),
  ),
});

/** `exam --step placebo`: the placebo gate into `<EXAM_ROOT>\placebo.json`, written whole. */
export async function placeboStep(o: ExamInput) {
  const m = meter(o.log);
  const { store, identity } = identityOf(o);
  const cutsBytes = readFileSync(o.cutsFile);
  if (sha256(cutsBytes) !== o.design.explored.cuts)
    throw new StoreError(
      `polish/cuts.json: SHA-256 ${sha256(cutsBytes)}, the exam's ${o.design.explored.cuts}`,
    );
  if (
    CutsFile.parse(JSON.parse(cutsBytes.toString("utf8"))).cuts.W4.value !==
    o.design.recipe.n
  )
    throw new GateFailed(
      `polish/cuts.json's W4 is not N's cut ${o.design.recipe.n}`,
    );
  const beside = Beside.parse(
    JSON.parse(
      readFileSync(
        explored(o, "beside.json", o.design.explored.beside),
        "utf8",
      ),
    ),
  );
  const onC = COnN.parse(
    JSON.parse(
      readFileSync(explored(o, "c.json", o.design.explored.c), "utf8"),
    ),
  ).evaluations.find((e) => e.rule === "N");
  if (onC === undefined) throw new GateFailed("c.json has no evaluation of N");
  explored(o, "choice.json", o.design.explored.choice);
  const lines = {
    b0E: await groupLines(
      explored(o, "e-positions.jsonl.gz", o.design.explored.ePositions),
      "B0",
    ),
    nE: await groupLines(
      explored(
        o,
        "choice-positions.jsonl.gz",
        o.design.explored.choicePositions,
      ),
      "N",
    ),
    nC: await groupLines(
      explored(o, "c-positions.jsonl.gz", o.design.explored.cPositions),
      "N",
    ),
  };
  const { counted } = countedFrom(store, o.coins);
  m.phase("data");
  const print = placeboPrint(
    { counted, kit: o.kit },
    lines,
    onC.stat,
    beside.placebo.rule,
    o.design,
  );
  m.phase("placebo");
  const value = {
    step: "placebo",
    identity,
    inputs: o.design.explored,
    seed: PLACEBO.seed,
    draws: o.design.draws,
    ...print,
    ...m.done(),
    written: new Date().toISOString(),
  };
  const text = `${JSON.stringify(value, null, 1)}\n`;
  writeWhole(path.join(o.root, "placebo.json"), text);
  return { sha: sha256(text), out: value };
}

/** Runs one exam step by its name. */
export function runExamStep(step: ExamStep, o: ExamInput) {
  switch (step) {
    case "placebo":
      return placeboStep(o);
  }
}
