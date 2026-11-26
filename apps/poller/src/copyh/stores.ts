/**
 * A range's store built and checked (copyh/rules.md C3, C15; the plan's
 * Q6): the bodies of the `build` and `integrity` tools, which main.ts and
 * the steps both call, each in its own folder (`base`: a tool's
 * `<COPYH_ROOT>\<range>`, step 1's `look1`) and under its own seal.
 * - The lists a pass reads (`listsOf`): `copyh/coins.json` and `dirs.json`;
 *   a count takes those that exist, a build needs both.
 * - A range's files (`passOf`): its keys in its order, each held to its
 *   SHA-256 in its data list (`copyh/data.sha256`, FRESH-2's
 *   `copyh/fresh2.sha256`).
 * - `buildStore`: the pass and the merge into `<base>\parts\` and
 *   `<base>\store\`; a built store is refused before any list is read.
 * - `checkStores`: the twin (`<base>\twin\store\`, when built) held to the
 *   first build, then K0–K3 into `<base>\integrity\` (integrity.ts).
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { getHeapStatistics } from "node:v8";
import { CoinsFile, iidsOf } from "./coins.js";
import { DirsFile, kindsOf } from "./dirs.js";
import { UNIT_BYTES, UnpairedFile, runIntegrity } from "./integrity.js";
import { UNIT_ROWS, merge } from "./merge.js";
import {
  runPass,
  type FileTask,
  type PassLists,
  type PassSummary,
} from "./pass.js";
import {
  filesOf,
  listNameOf,
  readDataList,
  sampleDaysOf,
  type Range,
} from "./range.js";
import {
  AlreadyRun,
  COINS_FILE,
  DATA_FILE,
  DIRS_FILE,
  FRESH2_FILE,
  PACKAGE_ROOT,
  StoreError,
  UNPAIRED_FILE,
  fingerprintOf,
  sha256,
  type Budget,
} from "./run.js";
import type { Seal } from "./seal.js";
import { MANIFEST, openStore } from "./store.js";

/** The lists a pass reads: a count takes those that exist, a build needs both. */
export function listsOf(counting: boolean): PassLists {
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

/** A range's files from the data list, and the list's own name and SHA-256. */
export function passOf(range: Range): {
  files: FileTask[];
  list: { name: string; sha256: string };
} {
  const data = readFileSync(range.name === "FRESH-2" ? FRESH2_FILE : DATA_FILE);
  return {
    files: filesOf(range, readDataList(data.toString("utf8"))),
    list: { name: listNameOf(range.name), sha256: sha256(data) },
  };
}

/** What a store's build and its check take: the range, its raw store, where, and under which seal. */
export type StoreRun = {
  readonly range: Range;
  readonly raw: string;
  /** The folder of `parts\`, `store\`, `twin\` and `integrity\`. */
  readonly base: string;
  readonly roots: readonly string[];
  readonly seal: Seal;
  readonly budget: Budget;
  readonly log: (event: string, fields: object) => void;
};

/** The pass and the merge into `<base>\store\` (a twin's `base` is the first's `twin\`). */
export async function buildStore(
  o: StoreRun & { readonly workers: number; readonly heapGb: number },
): Promise<void> {
  const store = path.join(o.base, "store");
  if (existsSync(path.join(store, MANIFEST)))
    throw new AlreadyRun(`${store} is built: move it aside to build it again`);
  const lists = listsOf(false);
  const p = passOf(o.range);
  const code = fingerprintOf(PACKAGE_ROOT);
  const pass: PassSummary = await runPass({
    store: o.raw,
    parts: path.join(o.base, "parts"),
    files: p.files,
    start: o.range.start,
    end: o.range.end,
    code,
    lists,
    workers: o.workers,
    heapGb: o.heapGb,
    seal: o.seal,
    roots: o.roots,
    budget: o.budget,
    log: o.log,
  });
  const m = merge(
    {
      parts: path.join(o.base, "parts"),
      dir: store,
      files: p.files,
      code,
      lists: lists.hashes,
      range: o.range,
      list: p.list,
      budget: o.budget,
      unitRows: UNIT_ROWS,
      log: o.log,
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
  o.log("done: the store is built", {
    store,
    partitions: m.partitions.length,
    merge: m.counts.merge,
    classes: m.counts.classes,
  });
}

/** The store at `<base>\store\` and its twin (when built) through the twin compare and K0–K3. */
export function checkStores(o: StoreRun): void {
  const store = openStore(path.join(o.base, "store"), o.roots, o.seal);
  const twinDir = path.join(o.base, "twin", "store");
  const twin = existsSync(path.join(twinDir, MANIFEST))
    ? openStore(twinDir, o.roots, o.seal)
    : null;
  const lists = listsOf(false);
  const p = passOf(o.range);
  if (!existsSync(UNPAIRED_FILE))
    throw new StoreError(
      `no ${path.relative(PACKAGE_ROOT, UNPAIRED_FILE)}: the integrity needs it`,
    );
  const unpaired = UnpairedFile.parse(
    JSON.parse(readFileSync(UNPAIRED_FILE, "utf8")),
  );
  const result = runIntegrity({
    range: o.range,
    files: p.files,
    store,
    twin,
    dir: path.join(o.base, "integrity"),
    inputs: {
      listSha256: p.list.sha256,
      coinsSha256: lists.hashes.coins,
      dirsSha256: lists.hashes.dirs,
    },
    code: fingerprintOf(PACKAGE_ROOT),
    unpaired,
    sampleDays: sampleDaysOf(o.range.name),
    reread: {
      raw: o.raw,
      roots: o.roots,
      seal: o.seal,
      files: p.files,
      start: o.range.start,
      end: o.range.end,
      iids: new Map(lists.iids),
      kinds: new Map(lists.kinds),
    },
    budget: o.budget,
    unitBytes: UNIT_BYTES,
    log: o.log,
  });
  o.log("done: the integrity passed", {
    twin: twin !== null,
    unpaired: unpaired.records.length,
    edges: result.k1.edges,
    holes: result.k3.holes.length,
    multiChain: result.k3.multiChain,
    seconds: result.seconds,
  });
}
