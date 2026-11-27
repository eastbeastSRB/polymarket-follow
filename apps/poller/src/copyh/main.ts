/**
 * COPY-H's program (copyh/rules.md C15), run by `dist/copyh.js` in a worker
 * thread of its heap ceiling (copyh.ts, the launcher), by hand, one command
 * at a time, at idle priority; it makes no request to any API:
 *
 *   node dist/copyh.js coins
 *   node dist/copyh.js count --range burnin|E [--workers n] [--minutes m]
 *   node dist/copyh.js build --range burnin|E [--twin] [--workers n] [--minutes m]
 *   node dist/copyh.js integrity --range burnin|E [--minutes m]
 *   node dist/copyh.js reproduce
 *   node dist/copyh.js step1 [--workers n] [--minutes m] [--past-tripwire]
 *   node dist/copyh.js tries --round n [--minutes m]
 *   node dist/copyh.js choice [--minutes m]
 *   node dist/copyh.js step2 [--workers n] [--minutes m] [--past-tripwire]
 *   node dist/copyh.js fresh2 [--workers n] [--minutes m] [--past-tripwire]
 *
 * `coins`: `<COPYH_ROOT>\coins.json` from COPYH-FUNDING's stored `meta`
 * reply, held to its manifest line (C3), for the supervisor to commit as
 * `copyh/coins.json`. `count`: the pass in counting mode, each file's scan
 * into `<range>\counts\`, then `<range>\counts.json` (every `dir` value as
 * written, with its count: `dirs.json` is ruled from it). `build`: the pass
 * and the merge into `<range>\store\` (`--twin`: `<range>\twin\store\`, from
 * its own parts), from `copyh/data.sha256`, `coins.json` and `dirs.json`.
 * `integrity`: the twin held to the first build when it exists
 * (`<range>\integrity\builds.json`), then K0–K3 into
 * `<range>\integrity\integrity.json` (integrity.ts). `reproduce` (C15
 * (a)): the paper's seed (PAPER_SEED, its files held to
 * `experiment/seed.sha256`) through reproduce.ts's `reproduce`, and
 * `<COPYH_ROOT>\repro.json` written whole, its identity first; exit 6
 * unless it passed. It reads the seed's accounts in one process, in under
 * a minute, with no parts. A cap still unset (null, design.ts) reads no cap
 * there: the seed's largest account lies far below either, and the kit's
 * own reading of the seed, which the reproduction holds COPY-H to, has none;
 * a step refuses an unset cap.
 * Before the freeze every command runs under the closed seal, so S's range
 * is refused. The gate's commands verify the freeze of their kind first
 * (gate.ts) and stop with exit 4, having read nothing, when it does not
 * verify; `step1` then runs steps.ts's step 1 (it needs COPYH_FUNDING; C16's
 * stop unless `--past-tripwire`), `tries --round n` a round of the owner's
 * tries (rounds.ts), `choice` the choice (choice.ts) and `step2` steps.ts's
 * step 2 (it needs FRESH_STORE and COPYH_FUNDING; its raw store, FRESH's, is
 * read only after the gate opens it) and `fresh2` FRESH-2's stage (C14 (4):
 * it needs FRESH2_STORE and COPYH_FUNDING, and reads FRESH-2's raw store only
 * after the gate opens it). Settings, no
 * defaults (run.ts `Settings`); a run starts no new part once its minutes
 * (14, or `--minutes`) are spent or a closed window began, and exits 3. Exit
 * codes: 0 done, 1 a crash, 2 bad settings or options (an option given
 * twice among them), 3 not finished, 4 the freeze does not verify, 5 not
 * ready, 6 a check failed, 7 two builds differ. Every line goes to `<COPYH_ROOT>\logs\copyh-<day>.log`; stderr
 * says only why the program stopped before its log was open.
 */
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { getHeapStatistics } from "node:v8";
import { createLog } from "../log.js";
import {
  LIB_EXITS_SHA256,
  RESEARCH_ROOT,
  loadResearch,
} from "../paper/research.js";
import { loadSeed, readManifest } from "../paper/seed.js";
import { META_KEY, StoredLine, coinsFromMeta } from "./coins.js";
import { countsOf } from "./count.js";
import {
  EXITS_MAX,
  HISTORY_FILLS_MAX,
  LABEL_FILLS_MAX,
  ROUNDS,
  RUN_MINUTES,
} from "./design.js";
import { COMMANDS, sealOf, verifyGate, type Command } from "./gate.js";
import { knownOf } from "./known.js";
import { runChoice } from "./choice.js";
import { countFile, readCountFile, runPass } from "./pass.js";
import { RANGES, RANGE_NAMES, type RangeName } from "./range.js";
import {
  ReproError,
  kitInstruments,
  kitPanel,
  poolOf,
  reproduce,
  seedSource,
} from "./reproduce.js";
import { runRound } from "./rounds.js";
import {
  FreezeDiffers,
  PACKAGE_ROOT,
  Settings,
  StoreError,
  budgetOf,
  exitOf,
  fingerprintOf,
  heapOf,
  sha256,
  sharedHashes,
  writeWhole,
} from "./run.js";
import { SEALED, checkInside, checkPath, checkWrite } from "./seal.js";
import { fresh2, step1, step2 } from "./steps.js";
import { buildStore, checkStores, listsOf, passOf } from "./stores.js";

function refuse(why: string): never {
  process.stderr.write(`copyh: refused: ${why}\n`);
  process.exit(2);
}
const issues = (e: { issues: { path: PropertyKey[]; message: string }[] }) =>
  e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");

const TOOLS = ["coins", "count", "build", "integrity", "reproduce"] as const;
const [command, ...options] = process.argv.slice(2);
const tool = TOOLS.find((t) => t === command) ?? null;
const gated = COMMANDS.find((c) => c === command) ?? null;
if (tool === null && gated === null)
  refuse(
    `the command "${command ?? ""}": ${[...TOOLS, ...COMMANDS].join(", ")}`,
  );
let range: RangeName | null = null;
let workers = 3;
let minutes = RUN_MINUTES;
let twin = false;
let pastTripwire = false;
let round: number | null = null;
const given = new Set<string | undefined>();
for (let i = 0; i < options.length; i++) {
  const [flag, value] = [options[i], options[i + 1]];
  if (given.has(flag)) refuse(`the option "${flag ?? ""}" given twice`);
  given.add(flag);
  const passes = tool === "count" || tool === "build";
  const ranged = passes || tool === "integrity";
  const stepped = gated === "step1" || gated === "step2" || gated === "fresh2";
  const rounding = gated === "tries" || gated === "choice";
  if (ranged && flag === "--range" && RANGE_NAMES.some((r) => r === value)) {
    range = value as RangeName;
    i += 1;
  } else if (
    (passes || stepped) &&
    flag === "--workers" &&
    /^([1-9]|1[0-6])$/.test(value ?? "")
  ) {
    workers = Number(value);
    i += 1;
  } else if (
    (ranged || stepped || rounding) &&
    flag === "--minutes" &&
    /^[1-9][0-9]?$/.test(value ?? "") &&
    Number(value) <= RUN_MINUTES
  ) {
    minutes = Number(value);
    i += 1;
  } else if (tool === "build" && flag === "--twin") twin = true;
  else if (stepped && flag === "--past-tripwire") pastTripwire = true;
  else if (
    gated === "tries" &&
    flag === "--round" &&
    /^[1-9]$/.test(value ?? "") &&
    Number(value) <= ROUNDS
  ) {
    round = Number(value);
    i += 1;
  } else refuse(`the option "${flag ?? ""}"`);
}
if (
  (tool === "count" || tool === "build" || tool === "integrity") &&
  range === null
)
  refuse(`${tool} needs --range ${RANGE_NAMES.join(" | ")}`);
if (gated === "tries" && round === null)
  refuse(`tries needs --round 1 to ${ROUNDS}`);
const parsed = Settings.safeParse(process.env);
if (!parsed.success) refuse(issues(parsed.error));
const settings = parsed.data;
if (tool === "coins" && settings.COPYH_FUNDING === undefined)
  refuse("coins needs COPYH_FUNDING, COPYH-FUNDING's store");
if (tool === "reproduce" && settings.PAPER_SEED === undefined)
  refuse("reproduce needs PAPER_SEED, the paper's seed folder");
if (
  (gated === "step1" || gated === "step2" || gated === "fresh2") &&
  settings.COPYH_FUNDING === undefined
)
  refuse(`${gated} needs COPYH_FUNDING, COPYH-FUNDING's store`);
const heap = heapOf(process.env.COPYH_HEAP_GB);
const heapGb: number = typeof heap === "string" ? refuse(heap) : heap;
/** The range's raw store: FRESH's for S (step 2's), FRESH-2's for FRESH-2 (its stage's), else WAVE-H's. */
const rawName =
  range === "S" || gated === "step2"
    ? "FRESH_STORE"
    : range === "FRESH-2" || gated === "fresh2"
      ? "FRESH2_STORE"
      : "WAVEH_STORE";
const raw: string =
  settings[rawName] ??
  refuse(
    range === null
      ? `${command ?? ""} needs ${rawName}`
      : `${range}'s range needs ${rawName}`,
  );

/** The run's folder of the range, and its roots: the folders its settings name that it reads or writes (seal 5). */
const rangeDir = range === null ? null : path.join(settings.COPYH_ROOT, range);
const roots =
  tool === "coins"
    ? [settings.COPYH_ROOT, settings.COPYH_FUNDING!]
    : tool === "reproduce"
      ? [settings.COPYH_ROOT, settings.PAPER_SEED!]
      : gated === "step1" || gated === "step2" || gated === "fresh2"
        ? [settings.COPYH_ROOT, raw, settings.COPYH_FUNDING!]
        : [settings.COPYH_ROOT, raw];

// The seal before anything is opened or made, the log's folder included: before the freeze, closed.
try {
  checkWrite(settings.COPYH_ROOT, SEALED);
  if (rangeDir !== null) checkWrite(rangeDir, SEALED);
  // Step 2's raw store, FRESH's, and FRESH-2's stage's, FRESH-2's, are sealed until the gate opens them: the roots are checked again after the gate, under the gate's seal.
  for (const r of roots)
    if (!((gated === "step2" || gated === "fresh2") && r === raw))
      checkPath(r, SEALED);
} catch (err) {
  process.stderr.write(`copyh: not ready: ${(err as Error).message}\n`);
  process.exit(5);
}

os.setPriority(os.constants.priority.PRIORITY_LOW);
const { log, close } = createLog(settings.COPYH_ROOT, "copyh");
const logOf = (event: string, fields: object) => log.info(fields, event);

/** `coins`: the stored reply's manifest line, the reply held to it, coins.json written whole. */
function coins(): void {
  const store = settings.COPYH_FUNDING!;
  const manifestFile = path.join(store, "manifest.jsonl");
  const metaFile = path.join(store, ...META_KEY.split("/"));
  for (const f of [manifestFile, metaFile]) {
    checkPath(f, SEALED);
    checkInside(f, roots);
  }
  // A download may be appending: a last line without its newline is not read.
  const text = readFileSync(manifestFile, "utf8");
  const lines = text.slice(0, text.lastIndexOf("\n") + 1).split("\n");
  const found = lines
    .filter((l) => l.startsWith("{"))
    .map((l) => JSON.parse(l) as unknown)
    .filter(
      (j) =>
        typeof j === "object" && j !== null && "key" in j && j.key === META_KEY,
    );
  if (found.length !== 1)
    throw new StoreError(
      `${found.length} lines for ${META_KEY} in the funding store's manifest, not one`,
    );
  const line = StoredLine.safeParse(found[0]);
  if (!line.success)
    throw new StoreError(`${META_KEY}'s manifest line: ${issues(line.error)}`);
  const file = coinsFromMeta(readFileSync(metaFile), line.data);
  const out = path.join(settings.COPYH_ROOT, "coins.json");
  writeWhole(out, `${JSON.stringify(file, null, 1)}\n`);
  logOf("done: coins.json written", {
    file: out,
    coins: file.coins.length,
    delisted: file.coins.filter((c) => c.delisted).length,
    meta: file.meta,
  });
}

async function count(r: RangeName): Promise<void> {
  const dir = path.join(rangeDir!, "counts");
  const lists = listsOf(true);
  const p = passOf(RANGES[r]);
  const code = fingerprintOf(PACKAGE_ROOT);
  const summary = await runPass({
    store: raw,
    parts: dir,
    mode: "count",
    files: p.files,
    start: RANGES[r].start,
    end: RANGES[r].end,
    code,
    lists,
    workers,
    heapGb,
    roots,
    budget: budgetOf(minutes),
    log: logOf,
  });
  const files = p.files.map((f) => {
    const c = readCountFile(countFile(dir, f.index));
    if (c === null)
      throw new StoreError(`${f.key}: its count file is not whole`);
    return c;
  });
  const counts = countsOf(files, RANGES[r]);
  const out = path.join(rangeDir!, "counts.json");
  writeWhole(
    out,
    `${JSON.stringify({ range: r, list: p.list, lists: lists.hashes, code, node: process.version, heapGb, seconds: summary.seconds, peaks: summary.peaks, ...counts }, null, 1)}\n`,
  );
  logOf("done: counts written", {
    file: out,
    seen: counts.seen,
    classes: counts.classes,
    failedBy: counts.failedBy,
    dirs: counts.dirs.length,
    unknownDirs: counts.unknownDirs,
    unknownCoins: counts.unknownCoins,
    largestBucketMonths: counts.largestBucketMonths,
  });
}

/** `reproduce` (C15 (a)): the kit loaded and checked first, then the seed, the pool, the kit's instruments, the known answers and the caps through reproduce.ts's `reproduce`; repro.json written whole, its identity first. */
async function reproduction(): Promise<void> {
  const kit = await loadResearch();
  const manifestText = readFileSync(
    path.join(PACKAGE_ROOT, "experiment", "seed.sha256"),
    "utf8",
  );
  const { bytes: knownBytes, known } = knownOf(
    path.join(PACKAGE_ROOT, "copyh", "known.json"),
  );
  const r = reproduce({
    kit,
    seed: seedSource({
      dir: settings.PAPER_SEED!,
      manifest: readManifest(manifestText),
      roots,
      load: loadSeed,
    }),
    pool: poolOf(RESEARCH_ROOT),
    instruments: kitInstruments(RESEARCH_ROOT),
    known,
    limits: {
      labelFills: LABEL_FILLS_MAX ?? Infinity,
      history: { fills: HISTORY_FILLS_MAX ?? Infinity, exits: EXITS_MAX },
    },
    market: kitPanel(kit),
  });
  const out = path.join(settings.COPYH_ROOT, "repro.json");
  const identity = {
    program: fingerprintOf(PACKAGE_ROOT),
    kit: kit.fingerprint,
    libExits: LIB_EXITS_SHA256,
    seedManifest: sha256(manifestText),
    known: sha256(knownBytes),
    node: process.version,
    shared: sharedHashes(PACKAGE_ROOT),
    heapGb,
  };
  writeWhole(
    out,
    `${JSON.stringify({ identity, passed: r.passed, ...r.report }, null, 1)}\n`,
  );
  logOf("done: repro.json written", { file: out, passed: r.passed });
  if (!r.passed)
    throw new ReproError(`the reproduction did not pass: ${out} says where`);
}

/** A tool's store run: the range's folder (`--twin`: its `twin\`), under the closed seal. */
const storeRun = (r: RangeName, base: string) => ({
  range: RANGES[r],
  raw,
  base,
  roots,
  seal: SEALED,
  budget: budgetOf(minutes),
  log: logOf,
});

/** A gated command: the gate first (exit 4, nothing read), then a round (rounds.ts), the choice (choice.ts), step 1, step 2 or FRESH-2's stage (steps.ts) under the gate's seal. */
async function gate(c: Command): Promise<void> {
  const freeze = await verifyGate(PACKAGE_ROOT, c);
  if (!freeze.ok)
    throw new FreezeDiffers(
      `${freeze.problems.length}: ${freeze.problems.slice(0, 10).join("; ")}`,
    );
  const seal = sealOf(freeze, c);
  logOf("gate", { command: c, freeze, seal });
  const rounds = {
    root: settings.COPYH_ROOT,
    freeze,
    seal,
    heapGb,
    budget: budgetOf(minutes),
    log: logOf,
  };
  if (c === "tries") {
    await runRound({ ...rounds, round: round! });
    return;
  }
  if (c === "choice") {
    await runChoice(rounds);
    return;
  }
  for (const r of roots) checkPath(r, seal);
  await (c === "step1" ? step1 : c === "step2" ? step2 : fresh2)({
    root: settings.COPYH_ROOT,
    raw,
    funding: settings.COPYH_FUNDING!,
    roots,
    freeze,
    seal,
    workers,
    heapGb,
    pastTripwire,
    budget: budgetOf(minutes),
    log: logOf,
  });
}

let code = 0;
try {
  log.info(
    {
      node: process.version,
      fingerprint: fingerprintOf(PACKAGE_ROOT),
      shared: sharedHashes(PACKAGE_ROOT),
      heapGb,
      heapLimitMB: Math.round(getHeapStatistics().heap_size_limit / 2 ** 20),
      range,
      workers,
      minutes,
      twin,
      pastTripwire,
      round,
    },
    `start ${command}`,
  );
  if (gated !== null) await gate(gated);
  else if (tool === "coins") coins();
  else if (tool === "reproduce") await reproduction();
  else if (tool === "count") await count(range!);
  else if (tool === "integrity") checkStores(storeRun(range!, rangeDir!));
  else
    await buildStore({
      ...storeRun(range!, twin ? path.join(rangeDir!, "twin") : rangeDir!),
      workers,
      heapGb,
    });
} catch (err) {
  const exit = exitOf(err);
  if (exit.code === 1)
    log.error({ err: String((err as Error)?.stack ?? err) }, exit.event);
  else log.warn({ why: (err as Error).message }, exit.event);
  code = exit.code;
} finally {
  close();
}
process.exit(code);
