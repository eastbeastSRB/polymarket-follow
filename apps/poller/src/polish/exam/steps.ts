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
 * - `1` (look 1, the exam's seal open, the reproduction passed by this
 *   program): FRESH extracted and held whole, its lines placed and counted,
 *   the safety net read, the book files needed listed; then exit 5.
 * - `2` (look 1, after the books): the lines held to step 1's, the deciding
 *   line priced book first, the verdict at look 1's bars; `result.json`,
 *   then `positions.jsonl.gz` and `report.json`.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { z } from "zod";
import type { Research } from "../../paper/research.js";
import { coinName, type Coins } from "../../waveh/coins.js";
import { sha256, type Gate } from "../../waveh/gate.js";
import { BooksNeeded, booksOf } from "../../waveh/legs.js";
import { markAt } from "../../waveh/report.js";
import { AlreadyRun, writeWhole } from "../../waveh/run.js";
import {
  SHA256,
  StoreError,
  readBookList,
  type DataList,
} from "../../waveh/store.js";
import { countedFrom } from "../counted.js";
import { trustedStore } from "../explore.js";
import { STORE, extract } from "../extract.js";
import { topTakerOf, type KnownUnpaired } from "../gates.js";
import { Tape, marketsFrom } from "../legs.js";
import { GATES, GATES_FILE, positionsOf } from "../library.js";
import { WAVEH_RANGE, type Range } from "../range.js";
import { BuildsDiffer, ExamUnfrozen, GateFailed } from "../run.js";
import { SEALED, type Seal } from "../seal.js";
import { openStore, type Manifest, type Store } from "../store.js";
import { Line } from "../tries/beside.js";
import { dataFrom } from "../tries/data.js";
import { readGzLines } from "../tries/gzlines.js";
import { C, E } from "../tries/parts.js";
import type { Rule } from "../tries/rules.js";
import { ChoiceFile, meter } from "../tries/steps.js";
import { priceAll } from "../tries/sweep.js";
import { CutsFile } from "../tries/trylog.js";
import { fortyOf } from "../writers.js";
import { BARS, K, M, OPTIONS, PLACEBO, type ExamDesign } from "./design.js";
import { holesOf, integrityOf, safetyNet } from "./fresh.js";
import {
  decidingPrints,
  lineOf,
  statLine,
  tapeLine,
  walksOf,
} from "./lines.js";
import {
  LINES,
  countsOf,
  keyOf,
  linesOf,
  onDeciding,
  type LineName,
  type LookPosition,
} from "./look.js";
import { placeboPrint } from "./placebo.js";
import { baseCell, bookReader, examBase, priceAtTheBook } from "./price.js";
import {
  N_FIELDS,
  differs,
  matchExtraction,
  matchLook,
  matchPlacebo,
  partOf,
} from "./repro.js";
import { bothAtTheBook, decidedOf, examVerdict, verdictOf } from "./verdict.js";

export const EXAM_STEPS = ["placebo", "reproduce", "1", "2"] as const;
export type ExamStep = (typeof EXAM_STEPS)[number];

/** A file of ours, as the steps write each: indented JSON and a newline. */
const json = (value: unknown) => `${JSON.stringify(value, null, 1)}\n`;

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
  const text = json(value);
  writeWhole(path.join(o.root, "placebo.json"), text);
  return { sha: sha256(text), out: value };
}

/** What the reproduction reads beside the exam's inputs (THE PLAN D47, D50): WAVE-H's raw store and its data list, the look's folder, WAVE-H's gate, the seal the exam's freeze gives (open at look 1, whose EXAM_ROOT is `ANALYZER\FRESH`), the extraction's workers and pace. */
export type ReproInput = ExamInput & {
  raw: string;
  list: DataList;
  listSha256: string;
  wavehRoot: string;
  gate: Gate;
  seal: Seal;
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

/** (a): the frozen extraction of `range` from WAVE-H's raw store into `<EXAM_ROOT>\repro\`, under the step's seal (look 1's `ANALYZER\FRESH\repro` is sealed by name until the exam's freeze opens it), held to the explored store's manifest. */
export async function reproExtraction(
  o: Pick<
    ReproInput,
    | "root"
    | "raw"
    | "list"
    | "listSha256"
    | "workers"
    | "code"
    | "wavehFrozen"
    | "coins"
    | "seal"
    | "pace"
    | "log"
  >,
  explored: Manifest,
  range: Range,
) {
  const root = path.join(o.root, REPRO);
  await extract({
    store: o.raw,
    root,
    list: o.list,
    listName: "waveh/data.sha256",
    listSha256: o.listSha256,
    range,
    workers: o.workers,
    code: o.code,
    wavehFrozen: o.wavehFrozen,
    forty: [...fortyOf(o.coins)],
    small: o.coins.list.map((c) => c.name),
    pace: o.pace,
    log: o.log,
    seal: o.seal,
  });
  return matchExtraction(
    explored,
    openStore(path.join(root, STORE), o.seal),
    o.pace,
  );
}

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
 * of the ten months into `<EXAM_ROOT>\repro\`, under the exam's seal,
 * against the explored store; then `repro.json` written whole, naming this
 * program; exit 6 when a part fails.
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
  const exploredJson = (name: string, want: string) =>
    JSON.parse(readFileSync(explored(o, name, want), "utf8")) as unknown;
  const choiceFile = exploredJson("choice.json", o.design.explored.choice);
  const rule = ChoiceFile.parse(choiceFile).rule as Rule;
  const nOnE = ChoiceN.parse(choiceFile).N;
  const nOnC = CEvaluations.parse(exploredJson("c.json", o.design.explored.c))
    .evaluations[0];
  if (nOnC?.rule !== "N")
    throw new GateFailed("c.json's first evaluation is not N's");
  const b = Calibration.parse(exploredJson("e.json", o.design.explored.e))
    .calibration.rebasedBy;
  const placebo = PlaceboLine.parse(
    JSON.parse(
      heldFile(
        path.join(o.root, "placebo.json"),
        o.design.placebo,
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
  const extraction = await reproExtraction(o, store.manifest, WAVEH_RANGE);
  m.phase("extraction");
  return reproEnd(
    o.root,
    {
      step: "reproduce",
      identity,
      inputs: {
        ...o.design.explored,
        placebo: o.design.placebo,
        books: refs.books,
        lookPositions: refs.positions,
        list: o.listSha256,
      },
    },
    { a: extraction, b: n, c: lookMatch },
    { ...m.done(), written: new Date().toISOString() },
  );
}

/**
 * The reproduction's end (THE PLAN D47): `<EXAM_ROOT>\repro.json` written
 * whole, `passed` only when (a), (b) and (c) all held (step 1 opens FRESH
 * only on such a file of its own program); then exit 6 naming each part
 * that failed.
 */
export function reproEnd(
  root: string,
  head: { step: "reproduce"; identity: object; inputs: object },
  parts: {
    a: { equal: boolean };
    b: Record<"E" | "C" | "deciding", { differs: readonly string[] }>;
    c: { equal: boolean };
  },
  tail: object,
) {
  const { a, b, c } = parts;
  const failed = [
    a.equal ? null : "(a) the extraction",
    b.E.differs.length + b.C.differs.length + b.deciding.differs.length > 0
      ? "(b) N's numbers"
      : null,
    c.equal ? null : "(c) the look",
  ].filter((x) => x !== null);
  const value = { ...head, passed: failed.length === 0, ...parts, ...tail };
  const text = json(value);
  writeWhole(path.join(root, "repro.json"), text);
  if (failed.length > 0)
    throw new GateFailed(
      `the reproduction failed: ${failed.join(", ")}; see repro.json`,
    );
  return { sha: sha256(text), out: value };
}

/** What the look's steps read beside the exam's inputs (THE PLAN D47, D50): FRESH's raw store and its list (`polish/fresh.sha256`), its range, the seal the exam's freeze opens and that freeze, WAVE-H's gate (its book code's), the one-sided trades ruled (`polish/fresh-unpaired.json`), the extraction's workers and pace. */
export type LookInput = ExamInput & {
  fresh: string;
  list: DataList;
  listSha256: string;
  range: Range;
  seal: Seal;
  freeze: { sha256: string; tag: string };
  gate: Gate;
  known: KnownUnpaired;
  workers: number;
  pace: () => Promise<void>;
};

/** Look 1's folder in the exam's, and the files its steps write there. */
export const LOOK1 = "look1";
export const STEP1 = "step1.json";
export const BOOKS_NEEDED = "books-needed.txt";
export const INTEGRITY = "integrity.json";
export const BUILDS = "builds.json";
/** The second build's root in the exam's folder: its own parts and store. */
export const TWIN = "twin";
export const RESULT = "result.json";
export const POSITIONS = "positions.jsonl.gz";
export const REPORT = "report.json";

/** What the look reads of repro.json (our own file: one that does not parse throws). */
const ReproFile = z.object({
  identity: z.object({ code: z.string() }),
  passed: z.boolean(),
});

/** The look's gate (D47): the exam's seal open (its freeze verified, held by its tag), and `<EXAM_ROOT>\repro.json` passed by this very program; repro.json's SHA-256. */
function lookGate(o: LookInput): string {
  if (!o.seal.examFrozen)
    throw new ExamUnfrozen(
      "FRESH stays sealed: the exam's freeze does not verify",
    );
  const file = path.join(o.root, "repro.json");
  if (!existsSync(file))
    throw new StoreError(
      "no repro.json in EXAM_ROOT: the reproduction runs first",
    );
  const bytes = readFileSync(file);
  const r = ReproFile.parse(JSON.parse(bytes.toString("utf8")));
  if (!r.passed || r.identity.code !== o.code)
    throw new StoreError(
      `repro.json is not a reproduction this program passed (passed ${r.passed}, by ${r.identity.code})`,
    );
  return sha256(bytes);
}

/** The exam's rule and cuts: choice.json's rule (N's) and polish/cuts.json, each held to the design's SHA-256, W4's cut N's. */
function ruleAndCuts(o: ExamInput) {
  const rule = ChoiceFile.parse(
    JSON.parse(
      readFileSync(
        explored(o, "choice.json", o.design.explored.choice),
        "utf8",
      ),
    ),
  ).rule as Rule;
  const cuts = CutsFile.parse(
    JSON.parse(
      heldFile(o.cutsFile, o.design.explored.cuts, "polish/cuts.json").toString(
        "utf8",
      ),
    ),
  ).cuts;
  if (cuts.W4.value !== o.design.recipe.n)
    throw new GateFailed(
      `polish/cuts.json's W4 is not N's cut ${o.design.recipe.n}`,
    );
  return { rule, cuts };
}

/** FRESH's lines from its store (D13–D17, D29, D30): its data (its counted fills read once, their legs step 1's print), files and holes, each line's positions, and their SHA-256, which step 2 holds to step 1's. */
function lookOf(
  o: LookInput,
  store: Store,
  { rule, cuts }: ReturnType<typeof ruleAndCuts>,
) {
  const set = countedFrom(store, o.coins);
  const d = dataFrom(store, o.coins, o.kit, set);
  const files = store.files();
  const holes = holesOf(files);
  const { lines, unknown } = linesOf(d, holes, rule, cuts, o.design.recipe);
  const positionsSha256 = sha256(JSON.stringify(lines));
  return { d, files, holes, lines, unknown, positionsSha256, legs: set.legs };
}

/**
 * `exam --step 1` (THE PLAN D47; D8, D9, D48, D53b; T11, T12), counts only,
 * before any price: the look's gate and the inputs held; FRESH's
 * extraction under the open seal into `<EXAM_ROOT>\store`, and again, from
 * its own parts, into `<EXAM_ROOT>\twin\store`; the two held equal byte for
 * byte by the reproduction's (a) comparison into `look1\builds.json`, a
 * difference stopping here (exit 7; nothing repaired: both builds moved
 * aside, step 1 again); the first's integrity into `look1\integrity.json`,
 * a failure stopping here (exit 6, every record listed, for H0's route);
 * the lines placed; the safety net, read
 * once, here, naming the deciding line; the counts; the book files that N's
 * legs on the deciding days need (a superset of the 715 line's) into
 * `look1\books-needed.txt`; `look1\step1.json` written whole; then exit 5,
 * books needed. It runs again only once H0's route has removed step1.json.
 */
export async function stepOne(o: LookInput): Promise<never> {
  const m = meter(o.log);
  const repro = lookGate(o);
  const dir = path.join(o.root, LOOK1);
  if (existsSync(path.join(dir, STEP1)))
    throw new AlreadyRun(
      `${LOOK1}\\${STEP1} exists: step 1 runs again only once H0's route removes it`,
    );
  const { identity } = identityOf(o);
  const rc = ruleAndCuts(o);
  const forty = [...fortyOf(o.coins)];
  const extractInto = (root: string) =>
    extract({
      store: o.fresh,
      root,
      list: o.list,
      listName: "polish/fresh.sha256",
      listSha256: o.listSha256,
      range: o.range,
      workers: o.workers,
      code: o.code,
      wavehFrozen: o.wavehFrozen,
      forty,
      small: o.coins.list.map((c) => c.name),
      pace: o.pace,
      log: o.log,
      seal: o.seal,
    });
  // Twice, each from its own parts: FRESH has no reference store, so only a second build can show a fault in one (decisions 2026-11-20, the reproduction's first run).
  await extractInto(o.root);
  await extractInto(path.join(o.root, TWIN));
  m.phase("extraction");
  const store = openStore(path.join(o.root, STORE), o.seal);
  const twin = openStore(path.join(o.root, TWIN, STORE), o.seal);
  const builds = await matchExtraction(store.manifest, twin, o.pace);
  const buildsText = json({
    store: store.id,
    twin: twin.id,
    ...builds,
    written: new Date().toISOString(),
  });
  writeWhole(path.join(dir, BUILDS), buildsText);
  m.phase("builds");
  if (!builds.equal)
    throw new BuildsDiffer(
      `FRESH's two builds differ: see ${LOOK1}\\${BUILDS}`,
    );
  const integrity = integrityOf(
    {
      store,
      list: o.list,
      listSha256: o.listSha256,
      wavehFrozen: o.wavehFrozen,
      code: o.code,
      fill: o.range.fill,
      coins: o.coins,
      forty,
    },
    o.known,
  );
  const integrityText = json({
    store: store.id,
    ...integrity,
    written: new Date().toISOString(),
  });
  writeWhole(path.join(dir, INTEGRITY), integrityText);
  m.phase("integrity");
  if (!integrity.pass)
    throw new GateFailed(
      `FRESH's store failed its integrity: see ${LOOK1}\\${INTEGRITY}`,
    );
  const look = lookOf(o, store, rc);
  const net = safetyNet(
    look.lines["715"].filter(onDeciding),
    o.design.safetyNet,
  );
  const needed = booksOf(
    look.lines.N.filter((p) => onDeciding(p) && p.left === null),
    o.coins,
  );
  const counts = countsOf({
    d: look.d,
    m: store.manifest,
    files: look.files,
    holes: look.holes,
    lines: look.lines,
    deciding: net.deciding,
    range: o.range,
    coins: o.coins,
    forty,
    legs: look.legs,
  });
  m.phase("positions");
  const neededText = `${needed.join("\n")}\n`;
  writeWhole(path.join(dir, BOOKS_NEEDED), neededText);
  const positions = Object.fromEntries(
    LINES.map((n) => [n, look.lines[n].length]),
  );
  writeWhole(
    path.join(dir, STEP1),
    json({
      step: "1",
      identity: {
        ...identity,
        exam: o.freeze,
        freshList: o.listSha256,
        freshStore: store.id,
        repro,
      },
      inputs: {
        choice: o.design.explored.choice,
        cuts: o.design.explored.cuts,
        recipe: o.design.recipe,
        safetyNet: o.design.safetyNet,
      },
      builds: sha256(buildsText),
      integrity: sha256(integrityText),
      deciding: {
        line: net.deciding,
        why: net.why,
        days: net.days,
        coins: net.coins,
      },
      positionsSha256: look.positionsSha256,
      positions,
      featureUnknown: look.unknown,
      booksNeeded: needed.length,
      booksNeededSha256: sha256(neededText),
      counts,
      ...m.done(),
      written: new Date().toISOString(),
    }),
  );
  o.log("step 1", {
    deciding: net.deciding,
    positions,
    booksNeeded: needed.length,
  });
  throw new BooksNeeded(
    `step 1 done: ${needed.length} book files listed in ${LOOK1}\\${BOOKS_NEEDED}`,
  );
}

/** What step 2 reads of step1.json (our own file: one that does not parse throws). */
const Step1File = z.object({
  identity: z.object({
    code: z.string(),
    exam: z.object({ sha256: z.string() }),
    freshStore: z.string(),
  }),
  builds: z.string().regex(SHA256),
  integrity: z.string().regex(SHA256),
  deciding: z.object({
    line: z.enum(["715", "N"]),
    why: z.string().nullable(),
    days: z.number(),
    coins: z.number(),
  }),
  positionsSha256: z.string().regex(SHA256),
  booksNeededSha256: z.string().regex(SHA256),
});
/** What the report copies of placebo.json: every line's percentiles by flip and window, and the bars. */
const PlaceboFile = z.object({ placebo: z.unknown(), z: z.unknown() });

/**
 * `exam --step 2` (THE PLAN D47; D19–D28, D31, D36–D46, D52; T11, T12):
 * the look's gate; a second step 2 refused (already run); `step1.json`
 * this very program's under this freeze, and `builds.json` and
 * `integrity.json` the files it names by SHA-256 (else not ready, exit 5);
 * every book file step 1 listed answered by FRESH's `books.jsonl` (a file
 * or missing) before any store file is read, else books needed (exit 5);
 * FRESH's store step 1's, and the lines recomputed and held to step 1's
 * SHA-256 (exit 5 otherwise). Then N's positions on the deciding days, not
 * left out, priced book first (the deciding line's among them; T11), BASE
 * pooled over the segments; the deciding line step 1 named (the safety
 * net, read once, T12), its left-out positions in the set; the verdict at
 * look 1's bars and the owner's options. Everything is computed first (a
 * crash there is no look); then `result.json`, written whole before
 * anything about an outcome is logged or written, then `positions.jsonl.gz`
 * and `report.json` (H15: a failure between the writes is recovered by
 * moving result.json aside, by H0's route, and one more step 2, which must
 * give the same result).
 */
export async function stepTwo(o: LookInput) {
  const m = meter(o.log);
  const repro = lookGate(o);
  const dir = path.join(o.root, LOOK1);
  if (existsSync(path.join(dir, RESULT)))
    throw new AlreadyRun(`${LOOK1}\\${RESULT} exists`);
  if (!existsSync(path.join(dir, STEP1)))
    throw new StoreError(`no ${LOOK1}\\${STEP1}: step 1 runs first`);
  const step1Bytes = readFileSync(path.join(dir, STEP1));
  const step1 = Step1File.parse(JSON.parse(step1Bytes.toString("utf8")));
  // Steps 1 and 2 are one program under one freeze; step 1's checks' files are the ones it named.
  if (
    step1.identity.code !== o.code ||
    step1.identity.exam.sha256 !== o.freeze.sha256
  )
    throw new StoreError(
      `${LOOK1}\\${STEP1} is not this program's under this freeze: code ${step1.identity.code}, freeze ${step1.identity.exam.sha256}; this program's ${o.code}, ${o.freeze.sha256}`,
    );
  heldFile(path.join(dir, BUILDS), step1.builds, `${LOOK1}\\${BUILDS}`);
  heldFile(
    path.join(dir, INTEGRITY),
    step1.integrity,
    `${LOOK1}\\${INTEGRITY}`,
  );
  const needed = heldFile(
    path.join(dir, BOOKS_NEEDED),
    step1.booksNeededSha256,
    `${LOOK1}\\${BOOKS_NEEDED}`,
  )
    .toString("utf8")
    .split("\n")
    .filter((k) => k !== "");
  const bookText = path.join(o.fresh, "books.jsonl");
  const bookBytes = existsSync(bookText) ? readFileSync(bookText) : null;
  const books =
    bookBytes === null
      ? { files: new Map<string, string>(), missing: new Set<string>() }
      : readBookList(bookBytes.toString("utf8"));
  const lacking = needed.filter(
    (k) => !books.files.has(k) && !books.missing.has(k),
  );
  if (lacking.length > 0)
    throw new BooksNeeded(
      `${lacking.length} of ${needed.length} book files not answered by FRESH's books.jsonl`,
    );
  const { identity } = identityOf(o);
  const rc = ruleAndCuts(o);
  const placebo = PlaceboFile.parse(
    JSON.parse(
      heldFile(
        path.join(o.root, "placebo.json"),
        o.design.placebo,
        "placebo.json in EXAM_ROOT",
      ).toString("utf8"),
    ),
  );
  const store = openStore(path.join(o.root, STORE), o.seal);
  if (store.id !== step1.identity.freshStore)
    throw new StoreError(
      `FRESH's store's manifest is ${store.id}, step 1's ${step1.identity.freshStore}`,
    );
  const look = lookOf(o, store, rc);
  if (look.positionsSha256 !== step1.positionsSha256)
    throw new StoreError(
      `the positions' SHA-256 is ${look.positionsSha256}, step 1's ${step1.positionsSha256}`,
    );
  m.phase("positions");
  const { d, lines } = look;
  const bases = new Map<number, number[]>();
  const baseAt = (p: LookPosition) => {
    let b = bases.get(p.iid);
    if (b === undefined) {
      b = examBase(d.pc.get(coinName(o.coins, p.iid))!, d.start);
      bases.set(p.iid, b);
    }
    return baseCell(b, p.xIn);
  };
  const reader = bookReader(o.fresh, o.gate, books, o.seal, o.pace);
  const tape = new Tape(store);
  const toPrice = lines.N.filter((p) => onDeciding(p) && p.left === null);
  const prices = await priceAtTheBook(
    d,
    reader.find,
    (coin, buy, x) => tape.at(coin, buy, x),
    toPrice.map((p) => ({
      iid: p.iid,
      dir: p.dir,
      xIn: p.xIn,
      xOut: p.xOut,
      base: baseAt(p),
    })),
  );
  const priced = new Map(toPrice.map((p, i) => [keyOf(p), prices[i]!]));
  m.phase("book");
  const bookOf = (p: LookPosition) => priced.get(keyOf(p))!.priced;
  const decided = (p: LookPosition) =>
    decidedOf(d, p, p.left === null ? bookOf(p) : null, OPTIONS.excess);
  const deciding = lines[step1.deciding.line].filter(onDeciding);
  // Look 1 of the two (rules.md P12), at its bars.
  const verdict = verdictOf(o.kit, deciding.map(decided), {
    ...BARS[0],
    excess: OPTIONS.excess,
  });
  // The report, computed before result.json is written: the lines beside, every exam position not left out at the tape in one sweep.
  const atBook = (n: LineName) =>
    lines[n].filter((p) => onDeciding(p) && p.left === null);
  const bookLine = (ps: readonly LookPosition[]) =>
    statLine(
      o.kit,
      ps.flatMap((p) => {
        const net = bookOf(p).net;
        return net === null ? [] : [{ t: p.t, iid: p.iid, x: net }];
      }),
    );
  const rows = atBook(step1.deciding.line).map((p) => {
    const pr = bookOf(p);
    return {
      line: lineOf(p, step1.deciding.line, {
        net: pr.net,
        unpriced: pr.unpriced,
        onMarks: pr.grossOnMarks,
      }),
      bookBoth: bothAtTheBook(pr),
      short: pr.depthShort,
      where: p.where,
    };
  });
  const walks = await walksOf(d, atBook(step1.deciding.line), reader.find);
  m.phase("walks");
  const sweep = lines.B0.filter((p) => p.left === null);
  const nets = await priceAll(
    d,
    sweep.map((p) => ({ iid: p.iid, dir: p.dir, xIn: p.xIn, xOut: p.xOut })),
    o.pace,
  );
  const atTape = new Map(sweep.map((p, i) => [keyOf(p), nets[i]!]));
  const tapeOf = (ps: readonly LookPosition[]) =>
    tapeLine(
      o.kit,
      ps.filter((p) => p.left === null),
      atTape,
      keyOf,
    );
  const onDays = (p: LookPosition) =>
    p.where === "segment 1" || p.where === "segment 2";
  m.phase("tape");
  const topTakerBps = topTakerOf(look.files, store.manifest.end);
  const read = [...reader.read.values()];
  const report = {
    print:
      "beside the verdict, deciding nothing (polish/rules.md P13): the deciding line's prints; the W4 lines on the deciding days, book first, those beside the deciding one seeded (their cuts chosen after looking at E); every line at the tape; the discovery window and the days cut, not independent",
    identity,
    deciding: {
      line: step1.deciding.line,
      ...decidingPrints(d, rows),
      walks,
    },
    sliceZero: bookLine(
      atBook(step1.deciding.line).filter((p) => p.slice === 0),
    ),
    bookFirst: Object.fromEntries(
      (["715", "N", "1391"] as const).map((n) => [
        n === step1.deciding.line
          ? `${n}, deciding`
          : `${n}, beside: seeded, decides nothing`,
        bookLine(atBook(n)),
      ]),
    ),
    atTheTape: {
      "the deciding line": tapeOf(
        lines[step1.deciding.line].filter(onDeciding),
      ),
      ...Object.fromEntries(
        (["715", "N", "1391", "B0"] as const).map((n) => [
          `${n}, 147 slices`,
          tapeOf(lines[n].filter(onDays)),
        ]),
      ),
      "B0, slices 0-19": tapeOf(lines.B0.filter(onDeciding)),
      "the discovery window (N, slices 0-19), not independent": tapeOf(
        lines.N.filter((p) => p.slice < K && p.where === "discovery"),
      ),
      "the days cut (N, slices 0-19), not independent": tapeOf(
        lines.N.filter(
          (p) => p.slice < K && p.where === "cut: a day without books",
        ),
      ),
    },
    placebo: { sha256: o.design.placebo, ...placebo },
    baseTier: {
      topTakerBps,
      alarms: Object.entries(topTakerBps)
        .filter(([, bps]) => bps > 4.5)
        .map(([month, bps]) => `ALARM ${month}: a taker paid ${bps} bps`),
    },
    books: {
      needed: needed.length,
      missing: needed.filter((k) => books.missing.has(k)).length,
      read: read.length,
      lines: read.reduce((s, f) => s + f.lines, 0),
      failed: read.reduce((s, f) => s + f.failed, 0),
    },
  };
  const in715 = new Set(lines["715"].map(keyOf));
  const in1391 = new Set(lines["1391"].map(keyOf));
  const positions = gzipSync(
    `${lines.N.filter(onDeciding)
      .map((p) =>
        JSON.stringify({
          in715: in715.has(keyOf(p)),
          in1391: in1391.has(keyOf(p)),
          ...p,
          ...(priced.get(keyOf(p)) ?? { priced: null, legs: [] }),
        }),
      )
      .join("\n")}\n`,
  );
  const reportText = json({ ...report, ...m.done() });
  // R7: the result exists before anything about an outcome is written or logged.
  const resultText = json({
    step: "2",
    identity: {
      ...identity,
      exam: o.freeze,
      freshList: o.listSha256,
      freshStore: store.id,
      books: bookBytes === null ? null : sha256(bookBytes),
      step1: sha256(step1Bytes),
      repro,
    },
    look: 1,
    looks: BARS.length,
    deciding: step1.deciding,
    options: OPTIONS,
    ...verdict,
    exam: examVerdict([verdict.verdict], BARS.length),
    positionsSha256: look.positionsSha256,
    written: new Date().toISOString(),
  });
  writeWhole(path.join(dir, RESULT), resultText);
  o.log("result", { verdict: verdict.verdict });
  writeWhole(path.join(dir, POSITIONS), positions);
  writeWhole(path.join(dir, REPORT), reportText);
  o.log("done", { verdict: verdict.verdict });
  return { sha: sha256(resultText), out: verdict };
}

/** Runs one exam step by its name; the reproduction and the look with their own settings. */
export function runExamStep(
  step: ExamStep,
  o: ExamInput,
  more: {
    repro: Omit<ReproInput, keyof ExamInput> | null;
    look: Omit<LookInput, keyof ExamInput> | null;
  },
) {
  switch (step) {
    case "placebo":
      return placeboStep(o);
    case "reproduce":
      if (more.repro === null)
        throw new GateFailed("the reproduction needs its own settings");
      return reproduceStep({ ...o, ...more.repro });
    case "1":
    case "2":
      if (more.look === null)
        throw new GateFailed("the look needs its own settings");
      return (step === "1" ? stepOne : stepTwo)({ ...o, ...more.look });
  }
}
