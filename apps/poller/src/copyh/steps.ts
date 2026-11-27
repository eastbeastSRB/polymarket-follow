/**
 * COPY-H's steps (copyh/rules.md C15, C0's identity, C13's counts, C16's
 * stop; the engine's plan, sections 7 and 10), behind main.ts's gate. Step 1
 * (`<COPYH_ROOT>\look1\`), in this order, every refusal before any data is
 * read:
 * - a second step 1 refuses (its `result.json` exists: exit 5);
 * - the rehearsal's store is sealed (C15 (c)): refused while
 *   `<COPYH_ROOT>\E\store\manifest.json` exists (exit 5; the supervisor's
 *   ruling on the engine review's Q4, decisions 2026-11-26);
 * - `repro.json` passed by this very program (C15 (a): its identity's
 *   program the run's fingerprint and `passed` true; else exit 5);
 * - no value set before the freeze left unset (C17; the engine's plan,
 *   Q19): LABEL_FILLS_MAX, HISTORY_FILLS_MAX, SETTLEMENT_MARK_MINUTES (exit
 *   5);
 * - E's store held to a second build (step 1's 2.; decisions 2026-11-26,
 *   (a-lite) + A'): `look1\store` built from WAVE-H's raw files, its
 *   manifest but for the run's fields held to E's record in
 *   `copyh/rehearsal.json`: equal, the rehearsal's build is its twin; else
 *   `look1\twin\store` is built and the two are compared (exit 7), the
 *   difference from the record listed, deciding nothing; both comparisons in
 *   `look1\builds.json`;
 * - the integrity before any position (stores.ts `checkStores`, into
 *   `look1\integrity\`; exit 6);
 * - the engine's phases in `look1\engine` (sealed to every reader but step
 *   1's engine), every part twice: LABELS, LABELS-L, BUILD, BUILD-L,
 *   REMOVAL, TRIPWIRE — C16's stop above 1% (exit 6) unless
 *   `--past-tripwire` — then PRICES, RANK and RESULT;
 * - the writes: the positions file to a temp in the engine folder, its
 *   lines held to RESULT's hash, then `result.json` (its identity first,
 *   both hashes), the file renamed into place, then `report.json` (RESULT's
 *   prints and the step's counts); then the logs copied beside them (the
 *   store review's L15: the program's logs are kept 30 days).
 * Each heavy piece resumes from whole parts: a run whose minutes are spent
 * exits 3, and the next run goes on.
 */
import { createHash } from "node:crypto";
import {
  copyFileSync,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
} from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { createGzip } from "node:zlib";
import { z } from "zod";
import {
  LIB_EXITS_SHA256,
  loadResearch,
  type Research,
} from "../paper/research.js";
import { columnOf } from "./accounts.js";
import { RehearsalRecord } from "./closure.js";
import { CoinsFile } from "./coins.js";
import {
  END_E,
  EXITS_MAX,
  HISTORY_FILLS_MAX,
  LABEL_FILLS_MAX,
  REHEARSAL_WINDOW,
  SETTLEMENT_MARK_MINUTES,
  WORKER_HEAP_CAP_GB,
} from "./design.js";
import {
  fileSha256,
  runPhase,
  type Phase,
  type PhaseRecord,
} from "./engine.js";
import { STAGE_WINDOWS, mondaysOf } from "./instants.js";
import type { MarkMinutes } from "./markets.js";
import {
  BuildFacts,
  buildLargeParts,
  buildParts,
  coinsOf,
  factsOf,
  laneHistoryFills,
} from "./phase-build.js";
import {
  labelsOf,
  labelsParts,
  laneLabelFills,
  largeParts,
  type LabelsPart,
  type ReadingContext,
  type ReadingInputs,
} from "./phase-labels.js";
import {
  byId,
  coinPositions,
  positionOf,
  pricesParts,
  type Position,
} from "./phase-prices.js";
import {
  Rank,
  mainAccountsOf,
  rankInputOf,
  rankOf,
  rankParts,
  tablesOf,
  type RankInput,
} from "./phase-rank.js";
import { removalParts } from "./phase-removal.js";
import {
  linesOf,
  positionLines,
  reportFrom,
  resultOf,
  resultParts,
} from "./phase-result.js";
import {
  readsPrice,
  tripwireOf,
  tripwireParts,
  type TrySet,
} from "./phase-tripwire.js";
import { RANGES } from "./range.js";
import {
  AlreadyRun,
  COINS_FILE,
  CheckFailed,
  DIRS_FILE,
  NotFinished,
  PACKAGE_ROOT,
  StoreError,
  fingerprintOf,
  sha256,
  sharedHashes,
  writeWhole,
  type Budget,
} from "./run.js";
import { checkInstant, type Seal } from "./seal.js";
import { MANIFEST, Manifest, openStore, type Store } from "./store.js";
import { buildStore, checkStores, type StoreRun } from "./stores.js";
import type { Condition } from "./tries.js";
import { tripwireStops, type Projection } from "./tripwire.js";
import { manifestDifferences } from "./twin.js";
import type { Verdict } from "./verdict.js";
import { holesOfReading } from "./unpriced.js";

/** A step's files in its folder (C15). */
export const RESULT_FILE = "result.json";
export const POSITIONS_FILE = "positions.jsonl.gz";
export const REPORT_FILE = "report.json";
export const BUILDS_FILE = "builds.json";
/** The lists every output names by SHA-256 (C0), in `copyh/`. */
export const IDENTITY_LISTS = [
  "data.sha256",
  "funding.sha256",
  "coins.json",
  "dirs.json",
  "unpaired.json",
  "calibration.json",
  "rehearsal.json",
] as const;
const FUNDING_FILE = path.join(PACKAGE_ROOT, "copyh", "funding.sha256");
const REHEARSAL_FILE = path.join(PACKAGE_ROOT, "copyh", "rehearsal.json");

type Log = (event: string, fields: object) => void;

/** `repro.json` as a step reads it (C15 (a)): the program that wrote it and whether it passed; the rest is the reproduction's report. */
export const ReproFile = z.object({
  identity: z.object({ program: z.string() }),
  passed: z.boolean(),
});

/** E's store as the rehearsal records it in `copyh/rehearsal.json` (C15 (c); decisions 2026-11-26, (a-lite) + A'): its manifest but for the run's fields, which names every file's SHA-256. */
export const StoreRecord = Manifest.omit({
  written: true,
  seconds: true,
  peaks: true,
  code: true,
});
export type StoreRecord = z.infer<typeof StoreRecord>;
/** What the rehearsal's priced fortnight gives (C15 (c) 10, `fortnightOf`): the SHA-256 of its copies' lines as `positions.jsonl.gz` writes them, by entry id, their count, the copies by line and the legs by kind (a settled copy's last leg "settled"). */
export const Fortnight = z.object({
  sha256: z.string().regex(/^[0-9a-f]{64}$/),
  lines: z.number().int().nonnegative(),
  byLine: z.record(z.string(), z.number()),
  legs: z.record(z.string(), z.number()),
});
export type Fortnight = z.infer<typeof Fortnight>;
/** `copyh/rehearsal.json` as step 1 reads it: the store's closure (closure.ts), E's store and the fortnight; its other fields are the rehearsal's counts. */
export const RehearsalFile = RehearsalRecord.extend({
  store: StoreRecord,
  fortnight: Fortnight,
});

/** The values set before the freeze that step 1 reads (C17). */
export type FrozenValues = {
  readonly labelFills: number | null;
  readonly historyFills: number | null;
  readonly markMinutes: MarkMinutes | null;
};

/** Step 1's refusals in C15's order, before anything is read; the values set before the freeze, none unset. */
export function readyForStep1(o: {
  root: string;
  program: string;
  values: FrozenValues;
}): { labelFills: number; historyFills: number; markMinutes: MarkMinutes } {
  const result = path.join(o.root, "look1", RESULT_FILE);
  if (existsSync(result))
    throw new AlreadyRun(`${result} exists: step 1 is made once (C15)`);
  const sealed = path.join(o.root, "E", "store", MANIFEST);
  if (existsSync(sealed))
    throw new StoreError(
      `${sealed}: the rehearsal's store is sealed, moved aside or deleted before step 1 (C15 (c))`,
    );
  const file = path.join(o.root, "repro.json");
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    throw new StoreError(
      `${file}: no reproduction's record that parses: reproduce runs first (C15 (a))`,
    );
  }
  const repro = ReproFile.safeParse(json);
  if (!repro.success)
    throw new StoreError(`${file} is not the reproduction's record`);
  if (repro.data.identity.program !== o.program)
    throw new StoreError(
      `${file} is another program's (${repro.data.identity.program}), not this one's (${o.program})`,
    );
  if (!repro.data.passed)
    throw new StoreError(`${file}: the reproduction did not pass`);
  const { labelFills, historyFills, markMinutes } = o.values;
  const unset = [
    labelFills === null ? "LABEL_FILLS_MAX" : null,
    historyFills === null ? "HISTORY_FILLS_MAX" : null,
    markMinutes === null ? "SETTLEMENT_MARK_MINUTES" : null,
  ].filter((n) => n !== null);
  if (labelFills === null || historyFills === null || markMinutes === null)
    throw new StoreError(
      `set before the freeze, and unset: ${unset.join(", ")} (C17)`,
    );
  return { labelFills, historyFills, markMinutes };
}

/** How a build's manifest differs from E's record, but for the run's fields (twin.ts's comparison; the record's run fields are the build's own, which it leaves out). */
export const recordDifferences = (m: Manifest, record: StoreRecord): string[] =>
  manifestDifferences(m, {
    ...record,
    written: m.written,
    seconds: m.seconds,
    peaks: m.peaks,
    code: m.code,
  });

const IntegrityDone = z.object({ store: z.string(), passed: z.boolean() });

/** E's store held to a second build (A'): the first build in `<look>\store`, held to E's record; when they differ, the twin in `<look>\twin\store`; then the integrity, both comparisons into `<look>\builds.json`. Each piece resumes: a built store is not built again, a passed integrity of this store not run again. */
export async function heldStores(o: {
  look: string;
  record: StoreRecord;
  /** stores.ts `buildStore`, into `<base>\store\`. */
  build: (base: string) => Promise<void>;
  /** stores.ts `checkStores`: `<base>\store\` and its twin when built, into `<base>\integrity\`. */
  check: (base: string) => void;
  open: (dir: string) => Store;
  log: Log;
}): Promise<Store> {
  const built = (base: string) =>
    existsSync(path.join(base, "store", MANIFEST));
  if (!built(o.look)) await o.build(o.look);
  const first = o.open(path.join(o.look, "store"));
  const differences = recordDifferences(first.manifest, o.record);
  const twin = path.join(o.look, "twin");
  if (differences.length > 0 && !built(twin)) await o.build(twin);
  const integrity = path.join(o.look, "integrity");
  const doneFile = path.join(integrity, "integrity.json");
  const done =
    existsSync(doneFile) &&
    (() => {
      const r = IntegrityDone.parse(JSON.parse(readFileSync(doneFile, "utf8")));
      return r.store === first.id && r.passed;
    })();
  try {
    if (!done) o.check(o.look);
  } finally {
    const twinFile = path.join(integrity, BUILDS_FILE);
    writeWhole(
      path.join(o.look, BUILDS_FILE),
      `${JSON.stringify(
        {
          first: first.id,
          record: { equal: differences.length === 0, differences },
          twin:
            differences.length > 0 && existsSync(twinFile)
              ? z
                  .record(z.string(), z.unknown())
                  .parse(JSON.parse(readFileSync(twinFile, "utf8")))
              : null,
        },
        null,
        1,
      )}\n`,
    );
  }
  o.log("the store held", {
    store: first.id,
    record: differences.length === 0 ? "equal" : "differs",
    differences: differences.length,
  });
  return first;
}

/** A closed phase: its folder and record. */
export type Closed = { readonly dir: string; readonly record: PhaseRecord };
/** A closed phase's record by its file's SHA-256, as a later part names it. */
const shaOf = (c: Closed | null): string | null =>
  c === null ? null : sha256(readFileSync(path.join(c.dir, "record.json")));

/** What the engine's phases take (END and the stage window parameters, so that one code serves every step and the tests' worlds). */
export type EngineRun = {
  /** The step's engine folder (`look1\engine`). */
  readonly dir: string;
  readonly code: string;
  readonly reading: {
    readonly inputs: ReadingInputs;
    readonly context: ReadingContext;
  };
  readonly end: number;
  readonly stage: readonly [number, number];
  readonly mondays: readonly number[];
  readonly limits: {
    readonly labelFills: number;
    readonly historyFills: number;
    readonly exits: number;
  };
  /** The normal lanes' thresholds, a capture's and a history's fills at most (phase-labels.ts `laneLabelFills`, phase-build.ts `laneHistoryFills`, at the heap); null: none, every account in the normal lanes. */
  readonly lanes: {
    readonly labelFills: number | null;
    readonly historyFills: number | null;
  };
  readonly markMinutes: MarkMinutes;
  /** The sets C16 projects beside MAIN's look set (step 2: each chosen try's set on S; none at step 1). */
  readonly tries: readonly TrySet[];
  /** The funding store, its list (`copyh/funding.sha256`) and the list's SHA-256. */
  readonly funding: {
    readonly store: string;
    readonly list: string;
    readonly sha256: string;
  };
  /** Each coin's name by its iid (coins.json). */
  readonly coins: ReadonlyMap<number, string>;
  readonly look: 1 | 2;
  readonly earlier: readonly Verdict[];
  readonly pastTripwire: boolean;
  readonly workers: number;
  readonly heapGb: number;
  /** The step's seal, its engine folder named. */
  readonly seal: Seal;
  readonly budget: Budget;
  readonly log: Log;
};
/** A try's set as C16 projected it: its name and line, the conditions the projection left out (those on the prior mean net, a price: the engine's plan, Q2), its projection. */
export type TryProjection = {
  readonly name: string;
  readonly line: TrySet["line"];
  readonly leftOut: readonly Condition[];
  readonly projection: Projection;
};

/** C16's stop: every set projected above 1% named, MAIN's look set first, a try's set saying whether it was projected without its conditions on the prior mean net; null when none is above, or the step runs past the tripwire. */
export function tripwireStop(
  main: Projection,
  tries: readonly TryProjection[],
  pastTripwire: boolean,
): string | null {
  const pct = (p: Projection) => (p.share * 100).toFixed(2);
  const above = [
    ...(tripwireStops(main.share, pastTripwire)
      ? [`${pct(main)}% of MAIN's ${main.copies} copies`]
      : []),
    ...tries.flatMap((t) =>
      tripwireStops(t.projection.share, pastTripwire)
        ? [
            `${pct(t.projection)}% of the try ${JSON.stringify(t.name)}'s ${t.projection.copies} copies${t.leftOut.length > 0 ? " (projected without its conditions on the prior mean net)" : ""}`,
          ]
        : [],
    ),
  ];
  return above.length === 0
    ? null
    : `the tripwire: ${above.join("; ")} projected unpriced, above 1% (C16): a decisions entry runs on with --past-tripwire, or ends there`;
}

export type EngineRecords = {
  readonly dir: string;
  readonly labels: Closed;
  readonly labelsL: Closed | null;
  readonly build: Closed;
  readonly buildL: Closed | null;
  readonly removal: Closed;
  readonly tripwire: Closed;
  readonly projection: Projection;
  readonly tries: readonly TryProjection[];
  readonly prices: Closed;
  readonly rank: Closed;
  readonly result: Closed;
};

/** A phase of the engine's run, in its folder (`<dir>\<name>`): a large lane's one child at the heap cap, alone. */
function phaseOf(
  o: EngineRun,
  name: string,
  module: string,
  fn: string,
  parts: Phase["parts"],
  context: unknown,
  lane = false,
): Phase {
  return {
    name,
    dir: path.join(o.dir, name.toLowerCase()),
    module: path.join(PACKAGE_ROOT, "dist", "copyh", module),
    fn,
    parts,
    context,
    workers: lane ? 1 : o.workers,
    heapGb: lane ? WORKER_HEAP_CAP_GB : o.heapGb,
    seal: o.seal,
    budget: o.budget,
    log: o.log,
  };
}
const closedOf = async (p: Phase): Promise<Closed> => ({
  dir: p.dir,
  record: await runPhase(p),
});

/** The engine's phases before any price, each resumed or closed by engine.ts. */
export type Unpriced = {
  readonly labels: Closed;
  readonly labelsL: Closed | null;
  readonly build: Closed;
  readonly buildL: Closed | null;
  readonly removal: Closed;
  /** BUILD-L's folder, read by the later phases whether or not it ran. */
  readonly largeDir: string;
  /** BUILD's and BUILD-L's records by SHA-256, as a later part names them. */
  readonly builds: [string, string | null];
  /** The coins the BUILD phases hold, by iid, with coins.json's names. */
  readonly named: readonly (readonly [iid: number, name: string])[];
};

/** The labels and the build with their large lanes (one child at the heap cap, alone), then the removal: no price. */
export async function unpricedPhases(o: EngineRun): Promise<Unpriced> {
  const { inputs: reading, context: readingContext } = o.reading;
  const labelsSpec = labelsParts({
    code: o.code,
    reading,
    mondays: o.mondays,
    fillsMax: o.limits.labelFills,
    lane: o.lanes.labelFills,
  });
  const labels = await closedOf(
    phaseOf(
      o,
      "LABELS",
      "phase-labels.js",
      "labelsPart",
      labelsSpec,
      readingContext,
    ),
  );
  const largeLabels = largeParts(
    labelsSpec,
    labelsOf(labels.dir, labels.record),
  );
  const labelsLPhase = phaseOf(
    o,
    "LABELS-L",
    "phase-labels.js",
    "labelsLargePart",
    largeLabels,
    readingContext,
    true,
  );
  const labelsL =
    largeLabels.length === 0 ? null : await closedOf(labelsLPhase);
  const buildSpec = buildParts({
    ...reading,
    code: o.code,
    end: o.end,
    stage: [o.stage[0], o.stage[1]],
    mondays: [...o.mondays],
    labels: [shaOf(labels)!, shaOf(labelsL)],
    limits: { fills: o.limits.historyFills, exits: o.limits.exits },
    lane: o.lanes.historyFills,
  });
  const buildContext = {
    ...readingContext,
    labels: labels.dir,
    large: labelsLPhase.dir,
  };
  const build = await closedOf(
    phaseOf(o, "BUILD", "phase-build.js", "buildPart", buildSpec, buildContext),
  );
  const largeBuild = buildLargeParts(
    buildSpec,
    new Map(
      build.record.parts.map(([id]) => [
        id,
        factsOf(build.dir, build.record, id),
      ]),
    ),
  );
  const buildLPhase = phaseOf(
    o,
    "BUILD-L",
    "phase-build.js",
    "buildPart",
    largeBuild,
    buildContext,
    true,
  );
  const buildL = largeBuild.length === 0 ? null : await closedOf(buildLPhase);
  const builds: [string, string | null] = [shaOf(build)!, shaOf(buildL)];
  const iids = [
    ...new Set([
      ...coinsOf(build.dir, build.record),
      ...(buildL === null ? [] : coinsOf(buildL.dir, buildL.record)),
    ]),
  ].sort((a, b) => a - b);
  const named = iids.map((iid) => {
    const name = o.coins.get(iid);
    if (name === undefined)
      throw new StoreError(`iid ${iid}: a coin coins.json does not hold`);
    return [iid, name] as const;
  });
  const removal = await closedOf(
    phaseOf(
      o,
      "REMOVAL",
      "phase-removal.js",
      "removalPart",
      removalParts(
        { code: o.code, build: builds, mondays: [...o.mondays] },
        iids,
      ),
      { build: build.dir, large: buildLPhase.dir },
    ),
  );
  return {
    labels,
    labelsL,
    build,
    buildL,
    removal,
    largeDir: buildLPhase.dir,
    builds,
    named,
  };
}

/** A coin phase's inputs (TRIPWIRE, PRICES) but its coin: the reading, the builds, END and the funding list. */
const coinInputsOf = (o: EngineRun, u: Unpriced) => ({
  ...o.reading.inputs,
  code: o.code,
  build: u.builds,
  end: o.end,
  funding: o.funding.sha256,
});
/** Where a coin phase reads: the reading's stores, the builds' folders, the funding store and its list. */
const coinContextOf = (o: EngineRun, u: Unpriced) => ({
  ...o.reading.context,
  build: u.build.dir,
  large: u.largeDir,
  fundingStore: o.funding.store,
  fundingList: o.funding.list,
});

/** The engine's phases in order: the unpriced ones, C16's tripwire and its stop (exit 6 when any set projected is above 1%, unless `--past-tripwire`), then the prices, RANK and RESULT. */
export async function runEngine(o: EngineRun): Promise<EngineRecords> {
  const u = await unpricedPhases(o);
  const coin = coinInputsOf(o, u);
  const coinContext = coinContextOf(o, u);
  const tripwire = await closedOf(
    phaseOf(
      o,
      "TRIPWIRE",
      "phase-tripwire.js",
      "tripwirePart",
      tripwireParts({ ...coin, tries: [...o.tries] }, u.named),
      coinContext,
    ),
  );
  const projection = tripwireOf(tripwire.dir, tripwire.record, o.markMinutes);
  const tries = o.tries.map((s, k): TryProjection => ({
    name: s.name,
    line: s.line,
    leftOut: s.conditions.filter(readsPrice),
    projection: tripwireOf(tripwire.dir, tripwire.record, o.markMinutes, k),
  }));
  o.log("the tripwire", { markMinutes: o.markMinutes, ...projection, tries });
  const stop = tripwireStop(projection, tries, o.pastTripwire);
  if (stop !== null) throw new CheckFailed(stop);

  const prices = await closedOf(
    phaseOf(
      o,
      "PRICES",
      "phase-prices.js",
      "pricesPart",
      pricesParts(
        {
          ...coin,
          removal: shaOf(u.removal)!,
          mondays: [...o.mondays],
          markMinutes: o.markMinutes,
        },
        u.named,
      ),
      { ...coinContext, removal: u.removal.dir },
    ),
  );
  const rank = await closedOf(
    phaseOf(
      o,
      "RANK",
      "phase-rank.js",
      "rankPart",
      rankParts({
        code: o.code,
        build: u.builds,
        prices: shaOf(prices)!,
        mondays: [...o.mondays],
      }),
      { build: u.build.dir, large: u.largeDir, prices: prices.dir },
    ),
  );
  const result = await closedOf(
    phaseOf(
      o,
      "RESULT",
      "phase-result.js",
      "resultPart",
      resultParts({
        code: o.code,
        prices: shaOf(prices)!,
        rank: shaOf(rank)!,
        mondays: [...o.mondays],
        start: o.stage[0],
        end: o.end,
        look: o.look,
        earlier: [...o.earlier],
      }),
      { prices: prices.dir, rank: rank.dir },
    ),
  );
  return {
    dir: o.dir,
    labels: u.labels,
    labelsL: u.labelsL,
    build: u.build,
    buildL: u.buildL,
    removal: u.removal,
    tripwire,
    projection,
    tries,
    prices,
    rank,
    result,
  };
}

/**
 * The rehearsal's priced fortnight (C15 (c) 10; the engine's plan, section
 * 15), the rehearsal's and step 1's: the copies with t in a window [from,
 * to), END its end, the run's Mondays in it, by the code that prices at
 * step 1 — the unpriced phases as parts in `o.dir`, then each coin's
 * positions (phase-prices.ts `coinPositions`) and RANK (`rankOf`) in this
 * process, in memory: no file of priced copies is written (M9). Each
 * position is held as its JSON line and parsed back as a part's reader
 * parses it, and RANK reads them in PRICES' parts' order (the coins', then
 * each coin's by id), so that each line is the one `positions.jsonl.gz`
 * would hold.
 */
export async function fortnightOf(
  o: EngineRun,
  kit: Research,
  window: readonly [number, number],
): Promise<Fortnight> {
  const [from, to] = window;
  const mondays = o.mondays.filter((M) => M >= from && M < to);
  const f: EngineRun = { ...o, end: to, stage: [from, to], mondays };
  const u = await unpricedPhases(f);
  const why = f.budget.stop();
  if (why !== null)
    throw new NotFinished(`the fortnight's prices wait: ${why}`);
  const c = { ...coinContextOf(f, u), removal: u.removal.dir };
  const inputs = {
    ...coinInputsOf(f, u),
    removal: shaOf(u.removal)!,
    mondays,
    markMinutes: f.markMinutes,
  };
  const held: { id: string; line: string }[] = [];
  const ranked: RankInput[] = [];
  for (const [iid, coin] of u.named)
    for (const pos of coinPositions(kit, { ...inputs, iid, coin }, c, f.seal)) {
      const line = JSON.stringify(pos);
      const p = positionOf(Buffer.from(line, "utf8"));
      held.push({ id: p.id, line });
      ranked.push(rankInputOf(p, mondays));
    }
  held.sort(byId);
  const members = [u.build, u.buildL].flatMap((x) =>
    x === null
      ? []
      : x.record.parts.map(([id]) => factsOf(x.dir, x.record, id).members),
  );
  const rank = Rank.parse(
    JSON.parse(
      JSON.stringify(rankOf(mondays, mainAccountsOf(members), ranked)),
    ),
  );
  function* positions(): Generator<Position> {
    for (const h of held) yield positionOf(Buffer.from(h.line, "utf8"));
  }
  const hash = createHash("sha256");
  let lines = 0;
  const byLine: Record<string, number> = {};
  const legs: Record<string, number> = {};
  for (const { p, line } of linesOf(positions(), tablesOf(rank), mondays)) {
    hash.update(`${line}\n`);
    lines += 1;
    for (const l of p.lines) byLine[l] = (byLine[l] ?? 0) + 1;
    p.plan.legs.forEach((leg, k) => {
      const kind =
        p.plan.settled && k === p.plan.legs.length - 1 ? "settled" : leg.kind;
      legs[kind] = (legs[kind] ?? 0) + 1;
    });
  }
  return { sha256: hash.digest("hex"), lines, byLine, legs };
}

const RunFile = z.object({ seconds: z.number(), maxRssMb: z.number() });

/** A closed phase's runs, both copies: its parts, their seconds summed and the largest peak (the `.run.json` beside each part). */
function runsOf(c: Closed | null) {
  if (c === null) return null;
  let seconds = 0;
  let maxRssMb = 0;
  for (const copy of ["a", "b"])
    for (const [id] of c.record.parts) {
      const r = RunFile.parse(
        JSON.parse(
          readFileSync(path.join(c.dir, copy, `${id}.run.json`), "utf8"),
        ),
      );
      seconds += r.seconds;
      if (r.maxRssMb > maxRssMb) maxRssMb = r.maxRssMb;
    }
  return {
    parts: c.record.parts.length,
    seconds: Math.round(seconds),
    maxRssMb,
  };
}

/** The bars' left-out taker records by cause and UTC month (C13, M1's print), from the stores' bars. */
function leftOutTakers(stores: readonly Store[]) {
  const CAUSES = [
    ["backstop", "leftBackstop"],
    ["adl", "leftAdl"],
    ["settlement", "leftSettlement"],
    ["vault", "leftVault"],
  ] as const;
  const out = new Map<string, Record<(typeof CAUSES)[number][0], number>>();
  for (const s of stores)
    for (const p of s.manifest.partitions) {
      if (p.table !== "bars" || p.rows === 0) continue;
      checkInstant(p.start, `bars/${p.key}/${p.month}`, s.seal);
      const month = out.get(p.month) ?? {
        backstop: 0,
        adl: 0,
        settlement: 0,
        vault: 0,
      };
      for (const [cause, name] of CAUSES) {
        const col = columnOf(s, p, name, Uint32Array);
        let n = 0;
        for (let i = 0; i < col.length; i++) n += col[i]!;
        month[cause] += n;
      }
      out.set(p.month, month);
    }
  return [...out].sort(([a], [b]) => (a < b ? -1 : 1));
}

/** The step's counts for `report.json` beside RESULT's prints (C13; C15 step 1's 4.), from the closed phases and the stores alone, no price: the labels at each Monday, the vault accounts, the accounts the kit is not run on, BUILD's facts, the tripwire's projection, C3's counts, the holes, the left-out takers, each phase's runs. */
export function stepCounts(o: {
  engine: EngineRecords;
  stores: readonly Store[];
  end: number;
}) {
  const e = o.engine;
  const parts: LabelsPart[] = [
    ...labelsOf(e.labels.dir, e.labels.record).values(),
    ...(e.labelsL === null
      ? []
      : labelsOf(e.labelsL.dir, e.labelsL.record).values()),
  ];
  const byMonday = new Map<
    number,
    {
      counts: Record<string, number>;
      p1: number;
      tooLarge: [string, number][];
      deferred: number;
    }
  >();
  const vaults = new Set<string>();
  for (const part of parts) {
    for (const a of part.vaults) vaults.add(a);
    for (const d of part.mondays) {
      const m = byMonday.get(d.M) ?? {
        counts: {},
        p1: 0,
        tooLarge: [],
        deferred: 0,
      };
      for (const [label, n] of Object.entries(d.counts))
        m.counts[label] = (m.counts[label] ?? 0) + n;
      m.p1 += d.p1.length;
      for (const t of d.tooLarge) m.tooLarge.push(t);
      m.deferred += d.deferred.length;
      byMonday.set(d.M, m);
    }
  }
  const facts = (c: Closed | null): BuildFacts[] =>
    c === null
      ? []
      : c.record.parts.map(([id]) => factsOf(c.dir, c.record, id));
  const main = facts(e.build);
  const all = [...main, ...facts(e.buildL)];
  const sum = (
    k:
      | "built"
      | "residues"
      | "chainBreaks"
      | "habitsApart"
      | "idsTwice"
      | "sizeZero"
      | "keys",
  ) => all.reduce((s, f) => s + f[k], 0);
  const byLine = (k: "otherMarkets" | "copies") => {
    const out: Record<string, number> = {};
    for (const f of all)
      for (const [line, n] of Object.entries(f[k]))
        out[line] = (out[line] ?? 0) + n;
    return out;
  };
  return {
    labels: [...byMonday]
      .sort(([a], [b]) => a - b)
      .map(([M, m]) => ({ M: new Date(M).toISOString(), ...m })),
    vaults: [...vaults].sort(),
    build: {
      p1: main.reduce((s, f) => s + f.p1, 0),
      built: sum("built"),
      tooManyFills: all.flatMap((f) => f.tooManyFills),
      tooManyExits: all.flatMap((f) => f.tooManyExits),
      largeLane: main.flatMap((f) => f.deferred),
      residues: sum("residues"),
      chainBreaks: sum("chainBreaks"),
      habitsApart: sum("habitsApart"),
      idsTwice: sum("idsTwice"),
      sizeZero: sum("sizeZero"),
      otherMarkets: byLine("otherMarkets"),
      copies: byLine("copies"),
      keys: sum("keys"),
    },
    tripwire: { look: e.projection, tries: e.tries },
    stores: o.stores.map((s) => ({
      store: s.id,
      range: s.manifest.range,
      classes: s.manifest.counts.classes,
      failedBy: s.manifest.counts.failedBy,
      dirs: s.manifest.counts.dirs,
      takers: s.manifest.counts.takers,
      merge: s.manifest.counts.merge,
      straddles: s.manifest.counts.straddles,
      seconds: s.manifest.seconds,
      peaks: s.manifest.peaks,
    })),
    holes: holesOfReading(o.stores, o.end),
    leftOutTakers: leftOutTakers(o.stores),
    runs: {
      labels: runsOf(e.labels),
      labelsL: runsOf(e.labelsL),
      build: runsOf(e.build),
      buildL: runsOf(e.buildL),
      removal: runsOf(e.removal),
      tripwire: runsOf(e.tripwire),
      prices: runsOf(e.prices),
      rank: runsOf(e.rank),
      result: runsOf(e.result),
    },
  };
}

/** Every output's identity (C0), first in it: the program, the freeze, the kit and lib-exits, `copyh/`'s lists and the step's files by SHA-256 (each read a chunk at a time: a later step names a positions file), the shared files, the heap, Node. */
export function identityOf(o: {
  packageRoot: string;
  freeze: { readonly sha256: string; readonly tag: string };
  kit: string;
  /** The step's files by their names in its folder: its stores' manifests, builds.json, the integrity, repro.json; later steps' earlier files. */
  files: Readonly<Record<string, string>>;
  heapGb: number;
}) {
  const hash = (file: string) => {
    if (!existsSync(file))
      throw new StoreError(`no ${file}: an output names it`);
    return fileSha256(file);
  };
  return {
    program: fingerprintOf(o.packageRoot),
    freeze: { sha256: o.freeze.sha256, tag: o.freeze.tag },
    kit: o.kit,
    libExits: LIB_EXITS_SHA256,
    lists: Object.fromEntries(
      IDENTITY_LISTS.map((f) => [
        f,
        hash(path.join(o.packageRoot, "copyh", f)),
      ]),
    ),
    files: Object.fromEntries(
      Object.entries(o.files).map(([name, file]) => [name, hash(file)]),
    ),
    shared: sharedHashes(o.packageRoot),
    heapGb: o.heapGb,
    node: process.version,
  };
}

/** A chunk of the positions file at least, in characters: a stream of one chunk a line is slow. */
const CHUNK_CHARS = 1 << 20;

/**
 * A look's writes in C15's order: the positions file to a temp in the
 * engine folder, gzipped as RESULT's lines come (never one string), its
 * lines' count and SHA-256 held to RESULT's (exit 6); the file hashed;
 * `result.json` written whole, its identity first, naming both hashes; the
 * file renamed into place; then `report.json`, its identity first, RESULT's
 * prints and the step's counts. Nothing about the outcome is logged.
 */
export async function writeLook(o: {
  look: string;
  engine: EngineRecords;
  mondays: readonly number[];
  identity: object;
  counts: object;
  log: Log;
}): Promise<void> {
  const r = o.engine.result;
  const result = resultOf(r.dir, r.record);
  const report = reportFrom(r.dir, r.record);
  const tmp = path.join(o.engine.dir, `${POSITIONS_FILE}.tmp`);
  const hash = createHash("sha256");
  let lines = 0;
  const lineSource = positionLines({
    prices: o.engine.prices,
    rank: o.engine.rank,
    mondays: o.mondays,
  });
  function* chunks(): Generator<string> {
    let chunk: string[] = [];
    let size = 0;
    for (const { line } of lineSource) {
      const s = `${line}\n`;
      hash.update(s);
      lines += 1;
      chunk.push(s);
      size += s.length;
      if (size >= CHUNK_CHARS) {
        yield chunk.join("");
        chunk = [];
        size = 0;
      }
    }
    if (chunk.length > 0) yield chunk.join("");
  }
  await pipeline(Readable.from(chunks()), createGzip(), createWriteStream(tmp));
  const linesSha = hash.digest("hex");
  if (lines !== result.positions.lines || linesSha !== result.positions.sha256)
    throw new CheckFailed(
      `the positions written (${lines} lines, ${linesSha}) are not RESULT's (${result.positions.lines}, ${result.positions.sha256})`,
    );
  writeWhole(
    path.join(o.look, RESULT_FILE),
    `${JSON.stringify(
      {
        identity: o.identity,
        ...result,
        positions: {
          ...result.positions,
          file: { name: POSITIONS_FILE, sha256: fileSha256(tmp) },
        },
      },
      null,
      1,
    )}\n`,
  );
  renameSync(tmp, path.join(o.look, POSITIONS_FILE));
  writeWhole(
    path.join(o.look, REPORT_FILE),
    `${JSON.stringify({ identity: o.identity, ...report, step: o.counts }, null, 1)}\n`,
  );
  o.log("done: the look's files written", {
    look: o.look,
    files: [RESULT_FILE, POSITIONS_FILE, REPORT_FILE],
  });
}

/** The program's logs copied beside a step's outputs, `<look>\logs\` (the store review's L15: they are kept 30 days, and a later step comes weeks after). */
export function copyLogs(root: string, look: string): number {
  const from = path.join(root, "logs");
  const to = path.join(look, "logs");
  mkdirSync(to, { recursive: true });
  let n = 0;
  for (const f of readdirSync(from).sort())
    if (/^copyh-\d{4}-\d{2}-\d{2}\.log$/.test(f)) {
      copyFileSync(path.join(from, f), path.join(to, f));
      n += 1;
    }
  return n;
}

/** What step 1 takes from main.ts, after the gate. */
export type Step1 = {
  readonly root: string;
  /** WAVE-H's raw store. */
  readonly raw: string;
  /** COPYH-FUNDING's store. */
  readonly funding: string;
  readonly roots: readonly string[];
  readonly freeze: { readonly sha256: string; readonly tag: string };
  /** The gate's seal for step 1 (gate.ts `sealOf`). */
  readonly seal: Seal;
  readonly workers: number;
  readonly heapGb: number;
  readonly pastTripwire: boolean;
  readonly budget: Budget;
  readonly log: Log;
};

/** Step 1 (C15): the refusals, E's store held, the integrity, the engine at END_E on E's Mondays, look 1's writes, the logs. */
export async function step1(o: Step1): Promise<void> {
  const program = fingerprintOf(PACKAGE_ROOT);
  const values = readyForStep1({
    root: o.root,
    program,
    values: {
      labelFills: LABEL_FILLS_MAX,
      historyFills: HISTORY_FILLS_MAX,
      markMinutes: SETTLEMENT_MARK_MINUTES,
    },
  });
  const look = path.join(o.root, "look1");
  const rehearsal = RehearsalFile.safeParse(
    JSON.parse(readFileSync(REHEARSAL_FILE, "utf8")),
  );
  if (!rehearsal.success)
    throw new StoreError(
      `${REHEARSAL_FILE} holds no record of E's store (C15 (c))`,
    );
  const kit = await loadResearch();
  const storeRun = (base: string): StoreRun => ({
    range: RANGES.E,
    raw: o.raw,
    base,
    roots: o.roots,
    seal: o.seal,
    budget: o.budget,
    log: o.log,
  });
  const store = await heldStores({
    look,
    record: rehearsal.data.store,
    build: (base) =>
      buildStore({ ...storeRun(base), workers: o.workers, heapGb: o.heapGb }),
    check: (base) => checkStores(storeRun(base)),
    open: (dir) => openStore(dir, o.roots, o.seal),
    log: o.log,
  });
  const mondays = mondaysOf("E");
  const run: EngineRun = {
    dir: path.join(look, "engine"),
    code: program,
    reading: {
      inputs: { stores: [store.id], dirs: sha256(readFileSync(DIRS_FILE)) },
      context: {
        stores: [store.dir],
        roots: [...o.roots],
        dirsFile: DIRS_FILE,
      },
    },
    end: END_E,
    stage: STAGE_WINDOWS.E,
    mondays,
    limits: {
      labelFills: values.labelFills,
      historyFills: values.historyFills,
      exits: EXITS_MAX,
    },
    lanes: {
      labelFills: laneLabelFills(o.heapGb),
      historyFills: laneHistoryFills(o.heapGb),
    },
    markMinutes: values.markMinutes,
    tries: [],
    funding: {
      store: o.funding,
      list: FUNDING_FILE,
      sha256: sha256(readFileSync(FUNDING_FILE)),
    },
    coins: new Map(
      CoinsFile.parse(JSON.parse(readFileSync(COINS_FILE, "utf8"))).coins.map(
        (c) => [c.iid, c.name],
      ),
    ),
    look: 1,
    earlier: [],
    pastTripwire: o.pastTripwire,
    workers: o.workers,
    heapGb: o.heapGb,
    seal: { ...o.seal, engine: "look1" },
    budget: o.budget,
    log: o.log,
  };
  const engine = await runEngine(run);
  // The rehearsal's fortnight again, by this program on this store: printed beside the rehearsal's, deciding nothing (C15 (c) 10, RL7).
  const fortnight = await fortnightOf(
    { ...run, dir: path.join(look, "engine", "fortnight") },
    kit,
    REHEARSAL_WINDOW,
  );
  // The counts and the writes are no part: they start only while the run has minutes left (C15: a run ends inside 15).
  const why = o.budget.stop();
  if (why !== null) throw new NotFinished(`step 1's writes wait: ${why}`);
  const counts = {
    ...stepCounts({ engine, stores: [store], end: END_E }),
    fortnight: {
      ...fortnight,
      rehearsal: rehearsal.data.fortnight.sha256,
      equal: fortnight.sha256 === rehearsal.data.fortnight.sha256,
    },
  };
  const twin = path.join(look, "twin", "store", MANIFEST);
  const identity = identityOf({
    packageRoot: PACKAGE_ROOT,
    freeze: o.freeze,
    kit: kit.fingerprint,
    files: {
      "repro.json": path.join(o.root, "repro.json"),
      "store/manifest.json": path.join(look, "store", MANIFEST),
      ...(existsSync(twin) ? { "twin/store/manifest.json": twin } : {}),
      [BUILDS_FILE]: path.join(look, BUILDS_FILE),
      "integrity/integrity.json": path.join(
        look,
        "integrity",
        "integrity.json",
      ),
    },
    heapGb: o.heapGb,
  });
  await writeLook({ look, engine, mondays, identity, counts, log: o.log });
  o.log("done: step 1", { look, logs: copyLogs(o.root, look) });
}
