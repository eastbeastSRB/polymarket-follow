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
 * Step 2 (`look2\`, `step2`) and FRESH-2's stage (`fresh2\`, `fresh2`) the
 * same way, each with its own refusals, stores and last phases (CONFIRM;
 * SEALED in RESULT's place). Each heavy piece resumes from whole parts: a
 * run whose minutes are spent exits 3, and the next run goes on.
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
  END_F2,
  END_S,
  EXITS_MAX,
  HISTORY_FILLS_MAX,
  LABEL_FILLS_MAX,
  M0,
  REHEARSAL_WINDOW,
  SETTLEMENT_MARK_MINUTES,
  WORKER_HEAP_CAP_GB,
  Z_LOOKS,
  Z_SEAL,
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
import { TryConfirmation, confirmOf, confirmParts } from "./phase-confirm.js";
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
  sealedParts,
  sealedReportOf,
  sealedResultOf,
  type SealedSet,
} from "./phase-sealed.js";
import {
  Result,
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
import { RANGES, readDataList } from "./range.js";
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
import { checkInstant, type EngineStep, type Seal } from "./seal.js";
import { MANIFEST, Manifest, openStore, type Store } from "./store.js";
import { buildStore, checkStores, type StoreRun } from "./stores.js";
import { Try, type Condition } from "./tries.js";
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

/** repro.json passed by this very program (C15 (a): its identity's program the run's fingerprint and `passed` true; else exit 5). */
export function reproPassed(root: string, program: string): void {
  const file = path.join(root, "repro.json");
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
  if (repro.data.identity.program !== program)
    throw new StoreError(
      `${file} is another program's (${repro.data.identity.program}), not this one's (${program})`,
    );
  if (!repro.data.passed)
    throw new StoreError(`${file}: the reproduction did not pass`);
}

/** The values set before the freeze, each set (C17). */
export type SetValues = {
  readonly labelFills: number;
  readonly historyFills: number;
  readonly markMinutes: MarkMinutes;
};
/** design.ts's values set before the freeze. */
export const FROZEN_VALUES: FrozenValues = {
  labelFills: LABEL_FILLS_MAX,
  historyFills: HISTORY_FILLS_MAX,
  markMinutes: SETTLEMENT_MARK_MINUTES,
};
/** The values set before the freeze, none unset (C17, the engine's plan Q19; else exit 5). */
export function setValues(v: FrozenValues): SetValues {
  const { labelFills, historyFills, markMinutes } = v;
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

/** Step 1's refusals in C15's order, before anything is read: a second step 1, the rehearsal's store, repro.json, the values set before the freeze. */
export function readyForStep1(o: {
  root: string;
  program: string;
  values: FrozenValues;
}): SetValues {
  const result = path.join(o.root, "look1", RESULT_FILE);
  if (existsSync(result))
    throw new AlreadyRun(`${result} exists: step 1 is made once (C15)`);
  const sealed = path.join(o.root, "E", "store", MANIFEST);
  if (existsSync(sealed))
    throw new StoreError(
      `${sealed}: the rehearsal's store is sealed, moved aside or deleted before step 1 (C15 (c))`,
    );
  reproPassed(o.root, o.program);
  return setValues(o.values);
}

/** A file of ours parsed by its schema, or why not (exit 5). */
export function parsedOf<T>(
  file: string,
  schema: z.ZodType<T>,
  what: string,
): T {
  let json: unknown;
  try {
    json = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    throw new StoreError(`${file}: no ${what} that parses`);
  }
  const r = schema.safeParse(json);
  if (!r.success)
    throw new StoreError(
      `${file} is not ${what}: ${r.error.issues.map((x) => `${x.path.join(".")}: ${x.message}`).join("; ")}`,
    );
  return r.data;
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

/** A step's store held to a second build: the first build in `<look>\store`; with a record (E's in `copyh/rehearsal.json`, A'), held to it, the twin in `<look>\twin\store` built only when they differ; without one (S's, FRESH-2's), the twin always built (C15 step 2's 2.); then the twin compare and the integrity (exit 7, exit 6), the comparisons into `<look>\builds.json`. Each piece resumes: a built store is not built again, a passed integrity of this store not run again. */
export async function heldStores(o: {
  look: string;
  record: StoreRecord | null;
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
  const differences =
    o.record === null ? null : recordDifferences(first.manifest, o.record);
  const twinned = differences === null || differences.length > 0;
  const twin = path.join(o.look, "twin");
  if (twinned && !built(twin)) await o.build(twin);
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
          record:
            differences === null
              ? null
              : { equal: differences.length === 0, differences },
          twin:
            twinned && existsSync(twinFile)
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
    record:
      differences === null
        ? "none"
        : differences.length === 0
          ? "equal"
          : "differs",
    differences: differences === null ? null : differences.length,
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
  /** The look of MAIN's set (C12); null at FRESH-2's stage, which has none: C16 projects its judged sets alone (`tries`, MAIN's among them at a KEEP), and SEALED stands in RESULT's place. */
  readonly look: 1 | 2 | null;
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

/** C16's stop: every set projected above 1% named, MAIN's look set first (none at FRESH-2's stage), a set saying whether it was projected without its conditions on the prior mean net; null when none is above, or the step runs past the tripwire. */
export function tripwireStop(
  main: Projection | null,
  tries: readonly TryProjection[],
  pastTripwire: boolean,
): string | null {
  const pct = (p: Projection) => (p.share * 100).toFixed(2);
  const above = [
    ...(main !== null && tripwireStops(main.share, pastTripwire)
      ? [`${pct(main)}% of MAIN's ${main.copies} copies`]
      : []),
    ...tries.flatMap((t) =>
      tripwireStops(t.projection.share, pastTripwire)
        ? [
            `${pct(t.projection)}% of the set ${JSON.stringify(t.name)}'s ${t.projection.copies} copies${t.leftOut.length > 0 ? " (projected without its conditions on the prior mean net)" : ""}`,
          ]
        : [],
    ),
  ];
  return above.length === 0
    ? null
    : `the tripwire: ${above.join("; ")} projected unpriced, above 1% (C16): a decisions entry runs on with --past-tripwire, or ends there`;
}

/** The engine's records through RANK; MAIN's look set's projection null at FRESH-2's stage. */
export type PricedRecords = {
  readonly dir: string;
  readonly labels: Closed;
  readonly labelsL: Closed | null;
  readonly build: Closed;
  readonly buildL: Closed | null;
  readonly removal: Closed;
  readonly tripwire: Closed;
  readonly projection: Projection | null;
  readonly tries: readonly TryProjection[];
  readonly prices: Closed;
  readonly rank: Closed;
};
/** A look's engine records: through RESULT. */
export type EngineRecords = PricedRecords & { readonly result: Closed };

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

/** The engine's phases through RANK: the unpriced ones, C16's tripwire and its stop (exit 6 when any set projected is above 1%, unless `--past-tripwire`), then the prices and RANK. */
export async function pricedPhases(o: EngineRun): Promise<PricedRecords> {
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
  const projection =
    o.look === null
      ? null
      : tripwireOf(tripwire.dir, tripwire.record, o.markMinutes);
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
  };
}

/** A look's engine: the phases through RANK, then RESULT (C12, MAIN's set at the look's z). */
export async function runEngine(o: EngineRun): Promise<EngineRecords> {
  const look = o.look;
  if (look === null)
    throw new Error("RESULT reads a look: FRESH-2's stage judges in SEALED");
  const p = await pricedPhases(o);
  const result = await closedOf(
    phaseOf(
      o,
      "RESULT",
      "phase-result.js",
      "resultPart",
      resultParts({
        code: o.code,
        prices: shaOf(p.prices)!,
        rank: shaOf(p.rank)!,
        mondays: [...o.mondays],
        start: o.stage[0],
        end: o.end,
        look,
        earlier: [...o.earlier],
      }),
      { prices: p.prices.dir, rank: p.rank.dir },
    ),
  );
  return { ...p, result };
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
  engine: PricedRecords & { readonly result: Closed | null };
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
      largestMerged: all.reduce((m, f) => Math.max(m, f.largestMerged), 0),
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
 * engine folder, gzipped as the positions' lines come (never one string),
 * their count and SHA-256 held to the result's (exit 6); the file hashed;
 * `result.json` written whole, its identity first, naming both hashes; the
 * file renamed into place; then `report.json`, its identity first. Nothing
 * about the outcome is logged. The step composes the result (RESULT's, and
 * at step 2 the confirmations) and the report (the prints and its counts).
 */
export async function writeLook(o: {
  look: string;
  engine: Pick<EngineRecords, "dir" | "prices" | "rank">;
  mondays: readonly number[];
  identity: object;
  /** What `result.json` holds of the outcome, the positions' lines' count and SHA-256 among it. */
  result: {
    readonly positions: { readonly lines: number; readonly sha256: string };
  } & Readonly<Record<string, unknown>>;
  /** What `report.json` holds beside its identity. */
  report: object;
  log: Log;
}): Promise<void> {
  const want = o.result.positions;
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
  if (lines !== want.lines || linesSha !== want.sha256)
    throw new CheckFailed(
      `the positions written (${lines} lines, ${linesSha}) are not RESULT's (${want.lines}, ${want.sha256})`,
    );
  writeWhole(
    path.join(o.look, RESULT_FILE),
    `${JSON.stringify(
      {
        identity: o.identity,
        ...o.result,
        positions: {
          ...want,
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
    `${JSON.stringify({ identity: o.identity, ...o.report }, null, 1)}\n`,
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

/** What a step takes from main.ts, after the gate. */
export type StepRun = {
  readonly root: string;
  /** The step's raw store: WAVE-H's at step 1, FRESH's at step 2. */
  readonly raw: string;
  /** COPYH-FUNDING's store. */
  readonly funding: string;
  readonly roots: readonly string[];
  readonly freeze: { readonly sha256: string; readonly tag: string };
  /** The gate's seal for the step (gate.ts `sealOf`). */
  readonly seal: Seal;
  readonly workers: number;
  readonly heapGb: number;
  readonly pastTripwire: boolean;
  readonly budget: Budget;
  readonly log: Log;
};

/** A step's engine run on its stores, at its END, stage, Mondays and look, in its engine folder. */
function engineRunOf(
  o: StepRun,
  s: {
    readonly program: string;
    readonly values: SetValues;
    readonly stores: readonly Store[];
    readonly dir: string;
    readonly end: number;
    readonly stage: readonly [number, number];
    readonly mondays: readonly number[];
    readonly look: 1 | 2 | null;
    readonly earlier: readonly Verdict[];
    readonly tries: readonly TrySet[];
    readonly pastTripwire: boolean;
    readonly engine: EngineStep;
    /** The funding list: `copyh/funding.sha256`, or FRESH-2's composed one. */
    readonly fundingList: string;
  },
): EngineRun {
  return {
    dir: s.dir,
    code: s.program,
    reading: {
      inputs: {
        stores: s.stores.map((x) => x.id),
        dirs: sha256(readFileSync(DIRS_FILE)),
      },
      context: {
        stores: s.stores.map((x) => x.dir),
        roots: [...o.roots],
        dirsFile: DIRS_FILE,
      },
    },
    end: s.end,
    stage: s.stage,
    mondays: s.mondays,
    limits: {
      labelFills: s.values.labelFills,
      historyFills: s.values.historyFills,
      exits: EXITS_MAX,
    },
    lanes: {
      labelFills: laneLabelFills(o.heapGb),
      historyFills: laneHistoryFills(o.heapGb),
    },
    markMinutes: s.values.markMinutes,
    tries: s.tries,
    funding: {
      store: o.funding,
      list: s.fundingList,
      sha256: sha256(readFileSync(s.fundingList)),
    },
    coins: new Map(
      CoinsFile.parse(JSON.parse(readFileSync(COINS_FILE, "utf8"))).coins.map(
        (c) => [c.iid, c.name],
      ),
    ),
    look: s.look,
    earlier: s.earlier,
    pastTripwire: s.pastTripwire,
    workers: o.workers,
    heapGb: o.heapGb,
    seal: { ...o.seal, engine: s.engine },
    budget: o.budget,
    log: o.log,
  };
}

/** A step's store files by their names in its folder, as its result.json's identity names them. */
function storeFiles(look: string, prefix: string): Record<string, string> {
  const twin = path.join(look, "twin", "store", MANIFEST);
  return {
    [`${prefix}store/${MANIFEST}`]: path.join(look, "store", MANIFEST),
    ...(existsSync(twin) ? { [`${prefix}twin/store/${MANIFEST}`]: twin } : {}),
    [`${prefix}${BUILDS_FILE}`]: path.join(look, BUILDS_FILE),
    [`${prefix}integrity/integrity.json`]: path.join(
      look,
      "integrity",
      "integrity.json",
    ),
  };
}

/** Step 1 (C15): the refusals, E's store held, the integrity, the engine at END_E on E's Mondays, the fortnight, look 1's writes, the logs. */
export async function step1(o: StepRun): Promise<void> {
  const program = fingerprintOf(PACKAGE_ROOT);
  const values = readyForStep1({
    root: o.root,
    program,
    values: FROZEN_VALUES,
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
  const run = engineRunOf(o, {
    program,
    values,
    stores: [store],
    dir: path.join(look, "engine"),
    end: END_E,
    stage: STAGE_WINDOWS.E,
    mondays,
    look: 1,
    earlier: [],
    tries: [],
    pastTripwire: o.pastTripwire,
    engine: "look1",
    fundingList: FUNDING_FILE,
  });
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
  const identity = identityOf({
    packageRoot: PACKAGE_ROOT,
    freeze: o.freeze,
    kit: kit.fingerprint,
    files: {
      "repro.json": path.join(o.root, "repro.json"),
      ...storeFiles(look, ""),
    },
    heapGb: o.heapGb,
  });
  await writeLook({
    look,
    engine,
    mondays,
    identity,
    result: resultOf(engine.result.dir, engine.result.record),
    report: {
      ...reportFrom(engine.result.dir, engine.result.record),
      step: counts,
    },
    log: o.log,
  });
  o.log("done: step 1", { look, logs: copyLogs(o.root, look) });
}

/** A step's three files, as `copyh/look1.sha256` (and FRESH-2's `look2.sha256`) lists them, relative to the step's folder (C14: the rounds' freeze). */
export const LOOK_FILES = [RESULT_FILE, POSITIONS_FILE, REPORT_FILE] as const;
export const LOOK1_LIST = "copyh/look1.sha256";
export const CHOICE_LIST = "copyh/choice.json";

/** A step's three files held to their list (sha256sum's form, `<hash> *<name>`, the three names each once): step 1's to `copyh/look1.sha256` at step 2 (C15), step 2's to `copyh/look2.sha256` at FRESH-2's stage (C14 (4)); else exit 5. */
export function heldLookFiles(look: string, listFile: string): void {
  let list: Map<string, string>;
  try {
    list = readDataList(readFileSync(listFile, "utf8"));
  } catch {
    throw new StoreError(`${listFile}: no list of a step's files`);
  }
  const names = [...list.keys()].sort();
  if (names.join("|") !== [...LOOK_FILES].sort().join("|"))
    throw new StoreError(
      `${listFile} lists ${names.join(", ") || "nothing"}, not a step's three files`,
    );
  for (const name of LOOK_FILES) {
    const file = path.join(look, name);
    if (!existsSync(file) || fileSha256(file) !== list.get(name))
      throw new StoreError(
        `${file} is not the file ${path.basename(listFile)} names`,
      );
  }
}

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
/** A look's result.json as a later step reads it (writeLook's form): its identity's files, MAIN's reading and its positions. */
export const LookFile = Result.extend({
  identity: z.object({ files: z.record(z.string(), SHA256) }),
  positions: Result.shape.positions.extend({
    file: z.object({ name: z.literal(POSITIONS_FILE), sha256: SHA256 }),
  }),
});
export type LookFile = z.infer<typeof LookFile>;

/** A step's store as its result.json names it: the manifest, builds.json and the integrity, each held to its SHA-256 there (C15 step 2's 3., C14 (4); else exit 5). */
export function heldStepStore(look: string, r: LookFile): void {
  for (const name of [
    `store/${MANIFEST}`,
    BUILDS_FILE,
    "integrity/integrity.json",
  ]) {
    const want = r.identity.files[name];
    if (want === undefined)
      throw new StoreError(`${look}'s ${RESULT_FILE} names no ${name}`);
    const file = path.join(look, ...name.split("/"));
    if (!existsSync(file) || fileSha256(file) !== want)
      throw new StoreError(
        `${file} is not the file ${look}'s ${RESULT_FILE} names`,
      );
  }
}

/** `copyh/choice.json` as step 2 reads it: the chosen tries whole, in the choice's order (choice.ts writes it; the rounds' freeze lists it). */
const ChosenFile = z.object({ chosen: z.array(z.object({ try: Try })) });

/** Step 2's refusals in C15's order, before anything is read: a second step 2 (its result.json); repro.json passed by this program (C15 (a)); the values set before the freeze; step 1's three files held to `copyh/look1.sha256`; E's store held to step 1's result.json; the chosen tries. Each exit 5. */
export function readyForStep2(o: {
  root: string;
  packageRoot: string;
  program: string;
  values: FrozenValues;
}): { values: SetValues; look1: LookFile; chosen: Try[] } {
  const result = path.join(o.root, "look2", RESULT_FILE);
  if (existsSync(result))
    throw new AlreadyRun(`${result} exists: step 2 is made once (C15)`);
  reproPassed(o.root, o.program);
  const values = setValues(o.values);
  const look1 = path.join(o.root, "look1");
  heldLookFiles(look1, path.join(o.packageRoot, LOOK1_LIST));
  const r1 = parsedOf(
    path.join(look1, RESULT_FILE),
    LookFile,
    "step 1's result",
  );
  heldStepStore(look1, r1);
  const choice = parsedOf(
    path.join(o.packageRoot, CHOICE_LIST),
    ChosenFile,
    "the rounds' choice",
  );
  return { values, look1: r1, chosen: choice.chosen.map((c) => c.try) };
}

/** Step 1's positions recomputed at step 2 held to those its result.json names (C15 step 2's 3.: the lines' count and SHA-256; exit 6). */
export function heldRecomputed(
  again: { readonly lines: number; readonly sha256: string },
  want: { readonly lines: number; readonly sha256: string },
): void {
  if (again.lines !== want.lines || again.sha256 !== want.sha256)
    throw new CheckFailed(
      `step 1 recomputed: its positions (${again.lines} lines, ${again.sha256}) are not those step 1's result.json names (${want.lines}, ${want.sha256})`,
    );
}

/** Step 2 (C15): the refusals; S's store built twice, held equal, and its integrity; step 1 recomputed from E's store and held to its positions (exit 6); the engine on E ∪ S at END_S, C16 on look 2's set and each chosen try's set on S; look 2 (C12); CONFIRM, the chosen tries on S alone (C14) and MAIN on S alone (L8); the writes; the logs. */
export async function step2(o: StepRun): Promise<void> {
  const program = fingerprintOf(PACKAGE_ROOT);
  const ready = readyForStep2({
    root: o.root,
    packageRoot: PACKAGE_ROOT,
    program,
    values: FROZEN_VALUES,
  });
  const kit = await loadResearch();
  const look1 = path.join(o.root, "look1");
  const look = path.join(o.root, "look2");
  const open = (dir: string) => openStore(dir, o.roots, o.seal);
  const E = open(path.join(look1, "store"));
  const storeRun = (base: string): StoreRun => ({
    range: RANGES.S,
    raw: o.raw,
    base,
    roots: o.roots,
    seal: o.seal,
    budget: o.budget,
    log: o.log,
  });
  const S = await heldStores({
    look,
    record: null,
    build: (base) =>
      buildStore({ ...storeRun(base), workers: o.workers, heapGb: o.heapGb }),
    check: (base) => checkStores(storeRun(base)),
    open,
    log: o.log,
  });
  // Step 1 again, by this program on E's store, past its tripwire (step 1 passed it): its positions held to step 1's.
  const again = await runEngine(
    engineRunOf(o, {
      program,
      values: ready.values,
      stores: [E],
      dir: path.join(look, "engine", "look1"),
      end: END_E,
      stage: STAGE_WINDOWS.E,
      mondays: mondaysOf("E"),
      look: 1,
      earlier: [],
      tries: [],
      pastTripwire: true,
      engine: "look2",
      fundingList: FUNDING_FILE,
    }),
  );
  heldRecomputed(
    resultOf(again.result.dir, again.result.record).positions,
    ready.look1.positions,
  );
  const mondays = [...mondaysOf("E"), ...mondaysOf("S")];
  const run = engineRunOf(o, {
    program,
    values: ready.values,
    stores: [E, S],
    dir: path.join(look, "engine"),
    end: END_S,
    stage: [M0, END_S],
    mondays,
    look: 2,
    earlier: [ready.look1.verdict],
    tries: ready.chosen.map((t) => ({
      name: t.name,
      line: t.line,
      from: END_E,
      to: END_S,
      conditions: t.conditions,
    })),
    pastTripwire: o.pastTripwire,
    engine: "look2",
    fundingList: FUNDING_FILE,
  });
  const engine = await runEngine(run);
  const confirm = await closedOf(
    phaseOf(
      run,
      "CONFIRM",
      "phase-confirm.js",
      "confirmPart",
      confirmParts({
        code: program,
        prices: shaOf(engine.prices)!,
        rank: shaOf(engine.rank)!,
        mondays,
        tries: ready.chosen,
        from: END_E,
        to: END_S,
        z: Z_LOOKS[1],
      }),
      { prices: engine.prices.dir, rank: engine.rank.dir },
    ),
  );
  const why = o.budget.stop();
  if (why !== null) throw new NotFinished(`step 2's writes wait: ${why}`);
  const c = confirmOf(confirm.dir, confirm.record);
  const counts = stepCounts({ engine, stores: [E, S], end: END_S });
  const identity = identityOf({
    packageRoot: PACKAGE_ROOT,
    freeze: o.freeze,
    kit: kit.fingerprint,
    files: {
      "repro.json": path.join(o.root, "repro.json"),
      ...Object.fromEntries(
        LOOK_FILES.map((f) => [`look1/${f}`, path.join(look1, f)]),
      ),
      ...storeFiles(look1, "look1/"),
      ...storeFiles(look, ""),
    },
    heapGb: o.heapGb,
  });
  await writeLook({
    look,
    engine,
    mondays,
    identity,
    result: {
      ...resultOf(engine.result.dir, engine.result.record),
      confirmations: c.tries,
    },
    report: {
      ...reportFrom(engine.result.dir, engine.result.record),
      mainOnS: c.mainOnS,
      step: counts,
    },
    log: o.log,
  });
  o.log("done: step 2", { look, logs: copyLogs(o.root, look) });
}

export const LOOK2_LIST = "copyh/look2.sha256";
/** FRESH-2's lists (C14 (4) 2.), which FRESH-2's freeze adds. */
const FRESH2_LISTS = [
  "copyh/fresh2.sha256",
  "copyh/funding2.sha256",
  LOOK2_LIST,
] as const;
const FUNDING2_FILE = path.join(PACKAGE_ROOT, "copyh", "funding2.sha256");

/** Step 2's result.json as FRESH-2's stage reads it: look 2's reading and the chosen tries' confirmations on S (writeLook's form). */
export const Look2File = LookFile.extend({
  confirmations: z.array(TryConfirmation),
});
export type Look2File = z.infer<typeof Look2File>;

/** FRESH-2's judged sets (C14): MAIN's when MAIN's verdict, the first KEEP or DROP of its looks (C12), is KEEP, at 1.645, then each try confirmed on S at 1.96, in the choice's order; step 2's confirmations held to the chosen tries by place and name (else exit 5). */
export function judgedSetsOf(
  verdicts: readonly Verdict[],
  chosen: readonly Try[],
  confirmations: readonly { readonly name: string; readonly reading: string }[],
): SealedSet[] {
  if (
    confirmations.length !== chosen.length ||
    confirmations.some((c, k) => c.name !== chosen[k]!.name)
  )
    throw new StoreError(
      `step 2's confirmations (${confirmations.map((c) => c.name).join(", ")}) are not the chosen tries of ${CHOICE_LIST}`,
    );
  const verdict = verdicts.find((v) => v === "KEEP" || v === "DROP");
  return [
    ...(verdict === "KEEP"
      ? [
          {
            kind: "MAIN" as const,
            name: "MAIN",
            line: "MAIN" as const,
            conditions: [],
            z: Z_SEAL[1],
          },
        ]
      : []),
    ...chosen.flatMap((t, k) =>
      confirmations[k]!.reading === "CONFIRMED"
        ? [
            {
              kind: "try" as const,
              name: t.name,
              line: t.line,
              conditions: t.conditions,
              z: Z_SEAL[0],
            },
          ]
        : [],
    ),
  ];
}

/** FRESH-2's refusals (C14 (4), as step 2's), before anything is read, each exit 5: a second run (its result.json); repro.json passed by this program; the values set before the freeze; step 2's three files held to `copyh/look2.sha256`; step 1's result.json the one step 2's names; E's and S's stores held to steps 1's and 2's result.json; the chosen tries; no yes to confirm (FRESH-2 is then never read). */
export function readyForFresh2(o: {
  root: string;
  packageRoot: string;
  program: string;
  values: FrozenValues;
}): { values: SetValues; sets: SealedSet[] } {
  const result = path.join(o.root, "fresh2", RESULT_FILE);
  if (existsSync(result))
    throw new AlreadyRun(`${result} exists: FRESH-2's stage runs once (C14)`);
  reproPassed(o.root, o.program);
  const values = setValues(o.values);
  const look1 = path.join(o.root, "look1");
  const look2 = path.join(o.root, "look2");
  heldLookFiles(look2, path.join(o.packageRoot, LOOK2_LIST));
  const r2 = parsedOf(
    path.join(look2, RESULT_FILE),
    Look2File,
    "step 2's result",
  );
  const r1File = path.join(look1, RESULT_FILE);
  if (
    !existsSync(r1File) ||
    fileSha256(r1File) !== r2.identity.files[`look1/${RESULT_FILE}`]
  )
    throw new StoreError(
      `${r1File} is not the file ${look2}'s ${RESULT_FILE} names`,
    );
  const r1 = parsedOf(r1File, LookFile, "step 1's result");
  heldStepStore(look1, r1);
  heldStepStore(look2, r2);
  const choice = parsedOf(
    path.join(o.packageRoot, CHOICE_LIST),
    ChosenFile,
    "the rounds' choice",
  );
  const sets = judgedSetsOf(
    [r1.verdict, r2.verdict],
    choice.chosen.map((c) => c.try),
    r2.confirmations,
  );
  if (sets.length === 0)
    throw new StoreError(
      "no yes to confirm: MAIN's verdict is no KEEP and no try was confirmed on S, so COPY-H ends at step 2's report and FRESH-2 is never read (C14)",
    );
  return { values, sets };
}

/** FRESH-2's one funding list (C14 (4) 2.; the supervisor's ruling, 2026-11-27): `copyh/funding.sha256`'s windows and `copyh/funding2.sha256`'s, each once, the rows of both in the one funding store, written whole to the stage's engine folder; its path. */
export function composedFunding(dir: string, lists: readonly string[]): string {
  const text = lists
    .map((f) => {
      let t: string;
      try {
        t = readFileSync(f, "utf8");
      } catch {
        throw new StoreError(`no ${f}: FRESH-2's funding reads it`);
      }
      return t === "" || t.endsWith("\n") ? t : `${t}\n`;
    })
    .join("");
  try {
    readDataList(text);
  } catch (err) {
    throw new StoreError(`FRESH-2's funding lists: ${(err as Error).message}`);
  }
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "funding.sha256");
  writeWhole(file, text);
  return file;
}

/** FRESH-2's stage (C14 (4)): the refusals; FRESH-2's store built twice, held equal, and its integrity; the engine on E ∪ S ∪ FRESH-2 at END_F2 on their 98 Mondays, C16 on each judged set alone; SEALED, each judged set's sealed reading on FRESH-2 alone and MAIN's prints in FRESH-2's form when MAIN is judged; `fresh2\result.json` first, then the positions, then `report.json`; the logs. */
export async function fresh2(o: StepRun): Promise<void> {
  const program = fingerprintOf(PACKAGE_ROOT);
  const ready = readyForFresh2({
    root: o.root,
    packageRoot: PACKAGE_ROOT,
    program,
    values: FROZEN_VALUES,
  });
  const kit = await loadResearch();
  const look1 = path.join(o.root, "look1");
  const look2 = path.join(o.root, "look2");
  const look = path.join(o.root, "fresh2");
  const open = (dir: string) => openStore(dir, o.roots, o.seal);
  const storeRun = (base: string): StoreRun => ({
    range: RANGES["FRESH-2"],
    raw: o.raw,
    base,
    roots: o.roots,
    seal: o.seal,
    budget: o.budget,
    log: o.log,
  });
  const F = await heldStores({
    look,
    record: null,
    build: (base) =>
      buildStore({ ...storeRun(base), workers: o.workers, heapGb: o.heapGb }),
    check: (base) => checkStores(storeRun(base)),
    open,
    log: o.log,
  });
  const stores = [
    open(path.join(look1, "store")),
    open(path.join(look2, "store")),
    F,
  ];
  const dir = path.join(look, "engine");
  const funding = composedFunding(dir, [FUNDING_FILE, FUNDING2_FILE]);
  const mondays = [
    ...mondaysOf("E"),
    ...mondaysOf("S"),
    ...mondaysOf("FRESH-2"),
  ];
  const [from, to] = STAGE_WINDOWS["FRESH-2"];
  const run = engineRunOf(o, {
    program,
    values: ready.values,
    stores,
    dir,
    end: END_F2,
    stage: [M0, END_F2],
    mondays,
    look: null,
    earlier: [],
    tries: ready.sets.map((s) => ({
      name: s.name,
      line: s.line,
      from,
      to,
      conditions: s.conditions,
    })),
    pastTripwire: o.pastTripwire,
    engine: "fresh2",
    fundingList: funding,
  });
  const engine = await pricedPhases(run);
  const sealed = await closedOf(
    phaseOf(
      run,
      "SEALED",
      "phase-sealed.js",
      "sealedPart",
      sealedParts({
        code: program,
        prices: shaOf(engine.prices)!,
        rank: shaOf(engine.rank)!,
        mondays,
        sets: ready.sets,
        from,
        to,
      }),
      { prices: engine.prices.dir, rank: engine.rank.dir },
    ),
  );
  const why = o.budget.stop();
  if (why !== null) throw new NotFinished(`FRESH-2's writes wait: ${why}`);
  const counts = stepCounts({
    engine: { ...engine, result: null },
    stores,
    end: END_F2,
  });
  const identity = identityOf({
    packageRoot: PACKAGE_ROOT,
    freeze: o.freeze,
    kit: kit.fingerprint,
    files: {
      "repro.json": path.join(o.root, "repro.json"),
      ...Object.fromEntries(
        FRESH2_LISTS.map((f) => [f, path.join(PACKAGE_ROOT, ...f.split("/"))]),
      ),
      ...Object.fromEntries(
        LOOK_FILES.map((f) => [`look2/${f}`, path.join(look2, f)]),
      ),
      ...storeFiles(look1, "look1/"),
      ...storeFiles(look2, "look2/"),
      ...storeFiles(look, ""),
      "engine/funding.sha256": funding,
    },
    heapGb: o.heapGb,
  });
  await writeLook({
    look,
    engine,
    mondays,
    identity,
    result: sealedResultOf(sealed.dir, sealed.record),
    report: {
      ...sealedReportOf(sealed.dir, sealed.record),
      step: { ...counts, runs: { ...counts.runs, sealed: runsOf(sealed) } },
    },
    log: o.log,
  });
  o.log("done: FRESH-2's stage", { look, logs: copyLogs(o.root, look) });
}
