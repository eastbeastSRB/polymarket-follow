/**
 * COPY-H's program (copyh/rules.md C15), run by `dist/copyh.js` in a worker
 * thread of its heap ceiling (copyh.ts, the launcher), by hand, one command
 * at a time, at idle priority; it makes no request to any API:
 *
 *   node dist/copyh.js coins
 *   node dist/copyh.js count --range burnin|E [--workers n] [--minutes m]
 *   node dist/copyh.js build --range burnin|E [--twin] [--workers n] [--minutes m]
 *   node dist/copyh.js integrity --range burnin|E [--minutes m]
 *   node dist/copyh.js step1 | tries | choice | step2 | fresh2
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
 * `<range>\integrity\integrity.json` (integrity.ts).
 * Before the freeze every command runs under the closed seal, so S's range
 * is refused. The gate's commands verify the freeze of their kind first
 * (gate.ts) and stop with exit 4, having read nothing, when it does not
 * verify; their phases after the gate are the engine's parts. Settings, no
 * defaults (run.ts `Settings`); a run starts no new part once its minutes
 * (14, or `--minutes`) are spent or a closed window began, and exits 3. Exit
 * codes: 0 done, 1 a crash, 2 bad settings or options, 3 not finished, 4 the
 * freeze does not verify, 5 not ready, 6 a check failed, 7 two builds
 * differ. Every line goes to `<COPYH_ROOT>\logs\copyh-<day>.log`; stderr
 * says only why the program stopped before its log was open.
 */
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { getHeapStatistics } from "node:v8";
import { createLog } from "../log.js";
import {
  CoinsFile,
  META_KEY,
  StoredLine,
  coinsFromMeta,
  iidsOf,
} from "./coins.js";
import { countsOf } from "./count.js";
import { RUN_MINUTES } from "./design.js";
import { DirsFile, kindsOf } from "./dirs.js";
import { COMMANDS, sealOf, verifyGate, type Command } from "./gate.js";
import { UNIT_ROWS, merge } from "./merge.js";
import {
  countFile,
  readCountFile,
  runPass,
  type PassLists,
  type PassSummary,
} from "./pass.js";
import {
  RANGES,
  RANGE_NAMES,
  filesOf,
  readDataList,
  sampleDaysOf,
  type RangeName,
} from "./range.js";
import {
  AlreadyRun,
  COINS_FILE,
  DATA_FILE,
  DIRS_FILE,
  FreezeDiffers,
  UNPAIRED_FILE,
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
import { MANIFEST, openStore } from "./store.js";
import { UNIT_BYTES, UnpairedFile, runIntegrity } from "./integrity.js";

function refuse(why: string): never {
  process.stderr.write(`copyh: refused: ${why}\n`);
  process.exit(2);
}
const issues = (e: { issues: { path: PropertyKey[]; message: string }[] }) =>
  e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");

const TOOLS = ["coins", "count", "build", "integrity"] as const;
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
for (let i = 0; i < options.length; i++) {
  const [flag, value] = [options[i], options[i + 1]];
  const passes = tool === "count" || tool === "build";
  const ranged = passes || tool === "integrity";
  if (ranged && flag === "--range" && RANGE_NAMES.some((r) => r === value)) {
    range = value as RangeName;
    i += 1;
  } else if (
    passes &&
    flag === "--workers" &&
    /^([1-9]|1[0-6])$/.test(value ?? "")
  ) {
    workers = Number(value);
    i += 1;
  } else if (
    ranged &&
    flag === "--minutes" &&
    /^[1-9][0-9]?$/.test(value ?? "") &&
    Number(value) <= RUN_MINUTES
  ) {
    minutes = Number(value);
    i += 1;
  } else if (tool === "build" && flag === "--twin" && !twin) twin = true;
  else refuse(`the option "${flag ?? ""}"`);
}
if (
  (tool === "count" || tool === "build" || tool === "integrity") &&
  range === null
)
  refuse(`${tool} needs --range ${RANGE_NAMES.join(" | ")}`);
const parsed = Settings.safeParse(process.env);
if (!parsed.success) refuse(issues(parsed.error));
const settings = parsed.data;
if (tool === "coins" && settings.COPYH_FUNDING === undefined)
  refuse("coins needs COPYH_FUNDING, COPYH-FUNDING's store");
const heap = heapOf(process.env.COPYH_HEAP_GB);
const heapGb: number = typeof heap === "string" ? refuse(heap) : heap;
/** The range's raw store: FRESH's for S (step 2's), else WAVE-H's. */
const raw: string =
  (range === "S" ? settings.FRESH_STORE : settings.WAVEH_STORE) ??
  refuse("S's range needs FRESH_STORE");

/** The run's folder of the range, and its roots: the folders its settings name that it reads or writes (seal 5). */
const rangeDir = range === null ? null : path.join(settings.COPYH_ROOT, range);
const roots =
  tool === "coins"
    ? [settings.COPYH_ROOT, settings.COPYH_FUNDING!]
    : [settings.COPYH_ROOT, raw];

// The seal before anything is opened or made, the log's folder included: before the freeze, closed.
try {
  checkWrite(settings.COPYH_ROOT, SEALED);
  if (rangeDir !== null) checkWrite(rangeDir, SEALED);
  for (const r of roots) checkPath(r, SEALED);
} catch (err) {
  process.stderr.write(`copyh: not ready: ${(err as Error).message}\n`);
  process.exit(5);
}

os.setPriority(os.constants.priority.PRIORITY_LOW);
const { log, close } = createLog(settings.COPYH_ROOT, "copyh");
const logOf = (event: string, fields: object) => log.info(fields, event);

/** The lists a pass reads: a count takes those that exist, a build needs both. */
function listsOf(counting: boolean): PassLists {
  const read = (file: string) => {
    if (existsSync(file)) return readFileSync(file);
    if (counting) return null;
    throw new StoreError(
      `no ${path.relative(PACKAGE_ROOT, file)}: a build needs it`,
    );
  };
  const coins = read(COINS_FILE);
  const dirs = read(DIRS_FILE);
  const parse = (b: Buffer) => JSON.parse(b.toString("utf8")) as unknown;
  return {
    iids: coins === null ? [] : [...iidsOf(CoinsFile.parse(parse(coins)))],
    kinds: dirs === null ? null : [...kindsOf(DirsFile.parse(parse(dirs)))],
    hashes: {
      coins: coins === null ? "none" : sha256(coins),
      dirs: dirs === null ? "none" : sha256(dirs),
    },
  };
}

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

/** A pass's run: its files from the data list, its time budget, its log. */
function passOf(r: RangeName) {
  const data = readFileSync(DATA_FILE);
  return {
    files: filesOf(RANGES[r], readDataList(data.toString("utf8"))),
    list: { name: "copyh/data.sha256", sha256: sha256(data) },
    budget: budgetOf(minutes),
  };
}

async function count(r: RangeName): Promise<void> {
  const dir = path.join(rangeDir!, "counts");
  const lists = listsOf(true);
  const p = passOf(r);
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
    budget: p.budget,
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

async function build(r: RangeName): Promise<void> {
  const base = twin ? path.join(rangeDir!, "twin") : rangeDir!;
  const store = path.join(base, "store");
  if (existsSync(path.join(store, MANIFEST)))
    throw new AlreadyRun(`${store} is built: move it aside to build it again`);
  const lists = listsOf(false);
  const p = passOf(r);
  const code = fingerprintOf(PACKAGE_ROOT);
  const pass: PassSummary = await runPass({
    store: raw,
    parts: path.join(base, "parts"),
    files: p.files,
    start: RANGES[r].start,
    end: RANGES[r].end,
    code,
    lists,
    workers,
    heapGb,
    roots,
    budget: p.budget,
    log: logOf,
  });
  const m = merge(
    {
      parts: path.join(base, "parts"),
      dir: store,
      files: p.files,
      code,
      lists: lists.hashes,
      range: RANGES[r],
      list: p.list,
      budget: p.budget,
      unitRows: UNIT_ROWS,
      log: logOf,
    },
    {
      peaks: () => ({
        pass: pass.peaks,
        merge: {
          rss: process.memoryUsage().rss,
          heapLimit: getHeapStatistics().heap_size_limit,
        },
      }),
      seconds: { pass: pass.seconds },
    },
  );
  logOf("done: the store is built", {
    store,
    partitions: m.partitions.length,
    merge: m.counts.merge,
    classes: m.counts.classes,
  });
}

/** `integrity`: the store and its twin (when built) through the twin compare and K0–K3. */
function integrity(r: RangeName): void {
  const base = rangeDir!;
  const store = openStore(path.join(base, "store"), roots, SEALED);
  const twinDir = path.join(base, "twin", "store");
  const twin = existsSync(path.join(twinDir, MANIFEST))
    ? openStore(twinDir, roots, SEALED)
    : null;
  const lists = listsOf(false);
  const p = passOf(r);
  const unpaired = existsSync(UNPAIRED_FILE)
    ? UnpairedFile.parse(JSON.parse(readFileSync(UNPAIRED_FILE, "utf8")))
    : {
        rule: "none yet: copyh/unpaired.json is written from the rehearsal's pass",
        records: [],
      };
  const result = runIntegrity({
    range: RANGES[r],
    files: p.files,
    store,
    twin,
    dir: path.join(base, "integrity"),
    inputs: {
      listSha256: p.list.sha256,
      coinsSha256: lists.hashes.coins,
      dirsSha256: lists.hashes.dirs,
    },
    code: fingerprintOf(PACKAGE_ROOT),
    unpaired,
    sampleDays: sampleDaysOf(r),
    reread: {
      raw,
      roots,
      seal: SEALED,
      files: p.files,
      start: RANGES[r].start,
      end: RANGES[r].end,
      iids: new Map(lists.iids),
      kinds: new Map(lists.kinds ?? []),
    },
    budget: p.budget,
    unitBytes: UNIT_BYTES,
    log: logOf,
  });
  logOf("done: the integrity passed", {
    twin: twin !== null,
    unpaired: unpaired.records.length,
    edges: result.k1.edges,
    holes: result.k3.holes.length,
    multiChain: result.k3.multiChain,
    seconds: result.seconds,
  });
}

/** A gated command: the gate first (exit 4, nothing read); its phases are the engine's parts, still to be built. */
async function gate(c: Command): Promise<void> {
  const freeze = await verifyGate(PACKAGE_ROOT, c);
  if (!freeze.ok)
    throw new FreezeDiffers(
      `${freeze.problems.length}: ${freeze.problems.slice(0, 10).join("; ")}`,
    );
  logOf("gate", { command: c, freeze, seal: sealOf(freeze, c) });
  throw new StoreError(
    `${c}: its phases are built with the engine (parts 3 to 5)`,
  );
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
    },
    `start ${command}`,
  );
  if (gated !== null) await gate(gated);
  else if (tool === "coins") coins();
  else if (tool === "count") await count(range!);
  else if (tool === "integrity") integrity(range!);
  else await build(range!);
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
