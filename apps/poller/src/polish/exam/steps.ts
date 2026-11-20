/**
 * The exam's steps (polish/rules.md P15; THE PLAN D47–D51), each `node
 * dist\polish.js exam --step <name>`, each naming its identity first: the
 * program's fingerprint, WAVE-H's freeze, the trusted store's manifest and
 * gates, and every exploration file it reads, each held to the SHA-256 the
 * design names (else not ready, exit 5).
 * - `placebo` (before the freeze): the placebo gate (placebo.ts) from the
 *   exploration's positions files and the trusted store's counted fills,
 *   into `<EXAM_ROOT>\placebo.json`.
 * - `reproduce` (before FRESH opens; again at look 1 by the frozen program):
 *   repro.ts's three parts, into `<EXAM_ROOT>\repro.json`, exit 6 when one
 *   fails.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { z } from "zod";
import type { Research } from "../../paper/research.js";
import type { Coins } from "../../waveh/coins.js";
import { sha256, type Gate } from "../../waveh/gate.js";
import { markAt } from "../../waveh/report.js";
import { writeWhole } from "../../waveh/run.js";
import {
  SHA256,
  StoreError,
  readBookList,
  type DataList,
} from "../../waveh/store.js";
import { countedFrom } from "../counted.js";
import { trustedStore } from "../explore.js";
import { STORE, extract } from "../extract.js";
import { Tape, marketsFrom } from "../legs.js";
import { GATES, GATES_FILE, positionsOf } from "../library.js";
import { WAVEH_RANGE } from "../range.js";
import { GateFailed } from "../run.js";
import { SEALED } from "../seal.js";
import { openStore } from "../store.js";
import { Line } from "../tries/beside.js";
import { dataFrom } from "../tries/data.js";
import { readGzLines } from "../tries/gzlines.js";
import { C, E } from "../tries/parts.js";
import type { Rule } from "../tries/rules.js";
import { ChoiceFile, meter } from "../tries/steps.js";
import { CutsFile } from "../tries/trylog.js";
import { fortyOf } from "../writers.js";
import { K, M, PLACEBO, PLACEBO_JSON, type ExamDesign } from "./design.js";
import { placeboPrint } from "./placebo.js";
import { bookReader, priceAtTheBook } from "./price.js";
import {
  N_FIELDS,
  differs,
  matchExtraction,
  matchLook,
  matchPlacebo,
  partOf,
} from "./repro.js";

export const EXAM_STEPS = ["placebo", "reproduce"] as const;
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

/** What the reproduction reads beside the exam's inputs (THE PLAN D47, D50): WAVE-H's raw store and its data list, the look's folder, WAVE-H's gate, the extraction's workers and pace. */
export type ReproInput = ExamInput & {
  raw: string;
  list: DataList;
  listSha256: string;
  wavehRoot: string;
  gate: Gate;
  workers: number;
  pace: () => Promise<void>;
};

/** The reproduction's folder in the exam's: the frozen extraction's root (its `parts\` and `store\`). */
export const REPRO = "repro";

/** What the reproduction reads of gates.json: the look's references, by SHA-256. */
const GatesRefs = z.object({
  references: z
    .object({
      positions: z.string().regex(SHA256),
      books: z.string().regex(SHA256),
    })
    .loose(),
});
/** What it reads of the exploration's files and placebo.json (our own: one that does not parse throws). */
const NumbersOf = z
  .object({
    positions: z.number(),
    priced: z.number(),
    left: z.record(z.string(), z.number()),
    unpriced: z.record(z.string(), z.number()),
    stat: z.unknown(),
  })
  .loose();
const ChoiceN = z.object({ N: NumbersOf });
const CEvaluations = z.object({
  evaluations: z.array(NumbersOf.extend({ rule: z.string() })),
});
const Calibration = z.object({
  calibration: z.object({ rebasedBy: z.number() }),
});
const PlaceboLine = z.object({
  lines: z.object({
    l715: z.object({ positions: z.number(), priced: z.number() }),
  }),
  projection: z.object({
    l715: z.object({
      m: z.number(),
      se: z.number(),
      days: z.number(),
      coins: z.number(),
    }),
  }),
});

/** A file read whole and held to a SHA-256 (else not ready, exit 5). */
export function heldFile(file: string, want: string, name: string): Buffer {
  if (!existsSync(file)) throw new StoreError(`no ${name}`);
  const b = readFileSync(file);
  if (sha256(b) !== want)
    throw new StoreError(`${name}: SHA-256 ${sha256(b)}, the exam's ${want}`);
  return b;
}

/**
 * `exam --step reproduce` (THE PLAN D47; T4): every input held to its
 * SHA-256 first (the design's, gates.json's references, placebo.json's in
 * EXAM_ROOT); (b) N on E and C, and the deciding line on E; (c) WAVE-H's
 * positions repriced book first against the look; (a) the frozen extraction
 * of the ten months into `<EXAM_ROOT>\repro\` against the explored store;
 * then `repro.json` written whole, naming this program; exit 6 when a part
 * fails.
 */
export async function reproduceStep(o: ReproInput) {
  const m = meter(o.log);
  const { store, identity } = identityOf(o);
  const refs = GatesRefs.parse(
    JSON.parse(readFileSync(path.join(o.analyzer, GATES, GATES_FILE), "utf8")),
  ).references;
  const cuts = CutsFile.parse(
    JSON.parse(
      heldFile(o.cutsFile, o.design.explored.cuts, "polish/cuts.json").toString(
        "utf8",
      ),
    ),
  ).cuts;
  const json = (name: string, want: string) =>
    JSON.parse(readFileSync(explored(o, name, want), "utf8")) as unknown;
  const choiceFile = json("choice.json", o.design.explored.choice);
  const rule = ChoiceFile.parse(choiceFile).rule as Rule;
  const nOnE = ChoiceN.parse(choiceFile).N;
  const nOnC = CEvaluations.parse(json("c.json", o.design.explored.c))
    .evaluations[0];
  if (nOnC?.rule !== "N")
    throw new GateFailed("c.json's first evaluation is not N's");
  const b = Calibration.parse(json("e.json", o.design.explored.e)).calibration
    .rebasedBy;
  const placebo = PlaceboLine.parse(
    JSON.parse(
      heldFile(
        path.join(o.root, "placebo.json"),
        PLACEBO_JSON,
        "placebo.json in EXAM_ROOT",
      ).toString("utf8"),
    ),
  );
  const books = readBookList(
    heldFile(
      path.join(o.raw, "books.jsonl"),
      refs.books,
      "WAVE-H's books.jsonl",
    ).toString("utf8"),
  );
  const look = gunzipSync(
    heldFile(
      path.join(o.wavehRoot, "look", "positions.jsonl.gz"),
      refs.positions,
      "the look's positions.jsonl.gz",
    ),
  )
    .toString("utf8")
    .split("\n")
    .filter((l) => l !== "")
    .map((l) => JSON.parse(l) as unknown);
  const d = dataFrom(store, o.coins, o.kit);
  m.phase("data");
  const on = { M, cuts, b, pace: o.pace };
  const eN = await partOf(d, { ...on, rule, part: E });
  const cN = await partOf(d, { ...on, rule, part: C });
  const deciding = await partOf(d, {
    ...on,
    rule,
    part: E,
    b: 0,
    slices: K,
    cuts: { ...cuts, W4: { ...cuts.W4, value: o.design.recipe.deciding } },
  });
  const n = {
    E: { ...eN, differs: differs(eN, nOnE, N_FIELDS) },
    C: { ...cN, differs: differs(cN, nOnC, N_FIELDS) },
    deciding: {
      ...deciding,
      cut: o.design.recipe.deciding,
      differs: matchPlacebo(deciding, {
        ...placebo.lines.l715,
        ...placebo.projection.l715,
      }),
    },
  };
  m.phase("N");
  const spots = positionsOf(d, M).spots;
  const at = markAt(o.kit, marketsFrom(store, o.kit, o.coins).markets);
  const reader = bookReader(o.raw, o.gate, books, SEALED, o.pace);
  const tape = new Tape(store);
  const prices = await priceAtTheBook(
    d,
    reader.find,
    (coin, buy, x) => tape.at(coin, buy, x),
    spots.map((s) => ({
      iid: s.iid,
      dir: s.dir,
      xIn: s.xIn,
      xOut: s.xOut,
      base: at.base(s.iid, s.xIn),
    })),
  );
  const lookMatch = matchLook(spots, prices, look);
  m.phase("look");
  const root = path.join(o.root, REPRO);
  await extract({
    store: o.raw,
    root,
    list: o.list,
    listName: "waveh/data.sha256",
    listSha256: o.listSha256,
    range: WAVEH_RANGE,
    workers: o.workers,
    code: o.code,
    wavehFrozen: o.wavehFrozen,
    forty: [...fortyOf(o.coins)],
    small: o.coins.list.map((c) => c.name),
    pace: o.pace,
    log: o.log,
  });
  const extraction = await matchExtraction(
    store.manifest,
    openStore(path.join(root, STORE)),
    o.pace,
  );
  m.phase("extraction");
  const failed = [
    extraction.equal ? null : "(a) the extraction",
    n.E.differs.length + n.C.differs.length + n.deciding.differs.length > 0
      ? "(b) N's numbers"
      : null,
    lookMatch.equal ? null : "(c) the look",
  ].filter((x) => x !== null);
  const value = {
    step: "reproduce",
    identity,
    inputs: {
      ...o.design.explored,
      placebo: PLACEBO_JSON,
      books: refs.books,
      lookPositions: refs.positions,
      list: o.listSha256,
    },
    passed: failed.length === 0,
    a: extraction,
    b: n,
    c: lookMatch,
    ...m.done(),
    written: new Date().toISOString(),
  };
  const text = `${JSON.stringify(value, null, 1)}\n`;
  writeWhole(path.join(o.root, "repro.json"), text);
  if (failed.length > 0)
    throw new GateFailed(
      `the reproduction failed: ${failed.join(", ")}; see repro.json`,
    );
  return { sha: sha256(text), out: value };
}

/** Runs one exam step by its name; the reproduction with its own settings. */
export function runExamStep(
  step: ExamStep,
  o: ExamInput,
  repro: Omit<ReproInput, keyof ExamInput> | null,
) {
  switch (step) {
    case "placebo":
      return placeboStep(o);
    case "reproduce":
      if (repro === null)
        throw new GateFailed("the reproduction needs its own settings");
      return reproduceStep({ ...o, ...repro });
  }
}
