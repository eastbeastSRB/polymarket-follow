/**
 * COPY-H's rehearsal on real months, counts only (copyh/rules.md C15 (c);
 * the engine's plan, section 15), by the program to be frozen, on all of E
 * from E's store, before the freeze and under the closed seal: no copy's
 * result is read and no file of priced copies is written (C0's first seal;
 * M9). `dist/copyh.js rehearse` (main.ts), in `<COPYH_ROOT>\E\rehearsal\`:
 * - its refusals, each exit 5, before the engine runs: a second rehearsal
 *   (its `rehearsal.json` exists); a cap unset (E's runs refuse one; the
 *   reproduction alone reads none); E's store or its twin not built, or its
 *   integrity not passed for that store and twin (the tools' `build --range
 *   E`, `build --range E --twin` and `integrity --range E`);
 * - the engine's phases before any price in `E\rehearsal\engine`, every part
 *   twice (steps.ts: LABELS, LABELS-L, BUILD, BUILD-L, REMOVAL, then
 *   TRIPWIRE, MAIN's set projected under both settlement marks, no stop);
 * - its two checks (phase-check.ts), parts as the engine's: KIT, the kit on
 *   the built account with the most exit rows under EXITS_MAX alone (C15 (c)
 *   5: the freeze waits when a run of it passes one part's minutes or half
 *   its child's heap, RH1 (b)), and the label bound's check on the 1/32
 *   slice at its four Mondays (C15 (c) 7, its pass mark RL4's);
 * - the values its counts set before the freeze (C17): C9's settlement mark
 *   (C16: 60 minutes when the 5-minute projection is above 0.5%; the freeze
 *   waits while the set mark's is above 1%) and C15's worker heap (twice the
 *   largest peak measured, rounded up to a whole GB; above the cap the parts
 *   are cut smaller instead); the caps' are read with their large lane's
 *   labels (C15 (c) 5: the captures and histories past the normal lanes'
 *   thresholds and above the caps, with their fills, by Monday);
 * - in memory, started only while `pricing` allows (the run's budget less
 *   steps.ts's FORTNIGHT_MINUTES): the fortnight priced at the mark set (C15
 *   (c) 10, steps.ts `fortnightOf`), then the counts from the closed phases;
 * - `rehearsal.json` written whole, its identity first, for the supervisor
 *   to commit as `copyh/rehearsal.json` (steps.ts `RehearsalFile`): E's
 *   store's record (its store closure in `tools/copyh-freeze.cjs
 *   --closure`'s form, closure.ts's; its manifest without the run's fields),
 *   the fortnight, the caps' base, the values, the prints (the ids met
 *   twice, the entries of size 0, the largest merged order event) and the
 *   counts (C15 (c) 1–9, with the sizes of the priced phases from BUILD:
 *   each part's bytes, and by coin its copies by line and their bytes,
 *   COPYH-ENGINE-REVIEW-2 Q2; REMOVAL's and TRIPWIRE's peaks are among
 *   every phase's runs).
 * Each heavy piece resumes from whole parts: a run whose minutes are spent
 * exits 3, and the next run goes on.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import {
  LIB_EXITS_SHA256,
  loadResearch,
  type Research,
} from "../paper/research.js";
import { HOUR_MS, MINUTE_MS } from "../schedule.js";
import { storeClosure } from "./closure.js";
import {
  BUCKETS,
  END_E,
  HISTORY_FILLS_MAX,
  LABEL_CHECK_MONDAYS,
  LABEL_CHECK_PASS,
  LABEL_CHECK_SLICE,
  LABEL_FILLS_MAX,
  PART_MINUTES,
  REHEARSAL_WINDOW,
  SETTLEMENT_MARK_SWITCH,
  TRIPWIRE_STOP,
  WORKER_HEAP_CAP_GB,
} from "./design.js";
import { fileSha256, partBytes } from "./engine.js";
import { STAGE_WINDOWS, dayOf, mondaysOf } from "./instants.js";
import { readBars, type MarkMinutes } from "./markets.js";
import {
  MASK,
  coinCopies,
  factsOf,
  largestExitsOf,
  partSizesOf,
  type BuildFacts,
  type Copy,
} from "./phase-build.js";
import {
  KitPart,
  bucketOf,
  checksOf,
  kitParts,
  labelCheckOf,
  labelCheckParts,
  largeCheckParts,
} from "./phase-check.js";
import { labelsOf, type LabelsPart } from "./phase-labels.js";
import { LINES } from "./lines.js";
import { tripwireOf } from "./phase-tripwire.js";
import {
  AlreadyRun,
  PACKAGE_ROOT,
  StoreError,
  fingerprintOf,
  sharedHashes,
  writeWhole,
  type Budget,
} from "./run.js";
import { SEALED } from "./seal.js";
import {
  IDENTITY_LISTS,
  StoreRecord,
  closedOf,
  engineRunOf,
  fortnightOf,
  parsedOf,
  phaseOf,
  runsOf,
  stepCounts,
  tripwirePhase,
  unpricedPhases,
  type Closed,
  type EngineRun,
  type Unpriced,
} from "./steps.js";
import { MANIFEST, openStore, type Store } from "./store.js";

type Log = (event: string, fields: object) => void;

export const REHEARSAL_FILE = "rehearsal.json";
/** The lists the rehearsal's identity names (C0): every one but those it writes. */
const LISTS = IDENTITY_LISTS.filter(
  (f) => f !== "calibration.json" && f !== REHEARSAL_FILE,
);
/** The caps' base (decisions 2026-11-26, COPYH-ENGINE's measure on made-up market makers): the kit's peak a fill, a label capture's and a history's, and the share of the large lane's heap cap an account at a cap may fill. */
export const CAPS_BASE = {
  labelKbAFill: 0.77,
  historyKbAFill: 1.18,
  laneGb: WORKER_HEAP_CAP_GB,
  share: 0.5,
} as const;
/** The largest merged order event above which the freeze waits for a ruling: the frozen kit spreads its fills' tids into a call (decisions 2026-11-26, the builders' technical calls). */
export const MERGED_RULING = 100_000;

/** E's integrity as the rehearsal reads it (integrity.ts writes it): the store and twin it checked, whether it passed, K1's and K3's counts. */
const IntegrityFile = z.object({
  store: z.string(),
  twin: z.string().nullable(),
  passed: z.boolean(),
  k1: z.object({
    edges: z.number(),
    listed: z.number(),
    unexpectedCount: z.number(),
    odd: z.array(z.unknown()),
  }),
  k3: z.object({
    holes: z.array(z.unknown()),
    events: z.number(),
    multiChain: z.number(),
  }),
});
type IntegrityFile = z.infer<typeof IntegrityFile>;

/** The rehearsal's refusals in their order, before the engine runs, each exit 5: a second rehearsal, a cap unset, E's store or its twin not built, its integrity not passed for both. */
export function readyForRehearsal(o: {
  root: string;
  roots: readonly string[];
  caps: {
    readonly labelFills: number | null;
    readonly historyFills: number | null;
  };
}): {
  store: Store;
  twin: Store;
  integrity: IntegrityFile;
  caps: { labelFills: number; historyFills: number };
} {
  const e = path.join(o.root, "E");
  const out = path.join(e, "rehearsal", REHEARSAL_FILE);
  if (existsSync(out))
    throw new AlreadyRun(
      `${out} exists: the rehearsal is made once (move it aside to run it again)`,
    );
  const { labelFills, historyFills } = o.caps;
  if (labelFills === null || historyFills === null)
    throw new StoreError(
      "a cap unset (LABEL_FILLS_MAX, HISTORY_FILLS_MAX): E's runs read their provisional values",
    );
  for (const [what, dir, tool] of [
    ["E's store", "store", "build --range E"],
    ["E's twin", "twin/store", "build --range E --twin"],
  ] as const)
    if (!existsSync(path.join(e, ...dir.split("/"), MANIFEST)))
      throw new StoreError(`${what} is not built: ${tool} first`);
  const store = openStore(path.join(e, "store"), o.roots, SEALED);
  const twin = openStore(path.join(e, "twin", "store"), o.roots, SEALED);
  const integrity = parsedOf(
    path.join(e, "integrity", "integrity.json"),
    IntegrityFile,
    "E's integrity",
  );
  if (
    !integrity.passed ||
    integrity.store !== store.id ||
    integrity.twin !== twin.id
  )
    throw new StoreError(
      "E's integrity has not passed for this store and its twin: integrity --range E first",
    );
  return { store, twin, integrity, caps: { labelFills, historyFills } };
}

/** Every copy the build phases hold, a coin at a time: BUILD's, then BUILD-L's. */
function* copiesOf(u: Unpriced): Generator<Copy> {
  for (const [iid] of u.named)
    for (const c of [u.build, u.buildL])
      if (c !== null) yield* coinCopies(c.dir, c.record, iid);
}

/** A copy's hold: its last leg's instant from the follow instant, ms (a settled or open copy's last leg its cut). */
const holdOf = (c: Copy): number =>
  c.plan.legs.reduce((h, l) => (l.h > h ? l.h : h), 0);

/** Count 2's copies a week by line and MAIN's legs a week by kind (a settled copy's last leg "settled"), and the copies by coin and line (the sizes of the priced phases, COPYH-ENGINE-REVIEW-2 Q2); count 4 on MAIN's voted copies (H1 fix 7): the survival curve of their holds (at each whole hour after the follow instant, the copies still open and their open share) and MAIN's long share by UTC day of the follow instant. */
export function copyCounts(copies: Iterable<Copy>) {
  const weeks = new Map<
    number,
    { copies: Record<string, number>; legs: Record<string, number> }
  >();
  const coins = new Map<number, Record<string, number>>();
  const open: number[] = [];
  const share: number[] = [];
  const days = new Map<number, { copies: number; longs: number }>();
  let voted = 0;
  let censored = 0;
  const add = (a: number[], k: number, v: number) => {
    while (a.length <= k) a.push(0);
    a[k]! += v;
  };
  for (const c of copies) {
    const w = weeks.get(c.M) ?? { copies: {}, legs: {} };
    const coin = coins.get(c.iid) ?? {};
    for (const l of c.lines) {
      w.copies[l] = (w.copies[l] ?? 0) + 1;
      coin[l] = (coin[l] ?? 0) + 1;
    }
    weeks.set(c.M, w);
    coins.set(c.iid, coin);
    if (!c.lines.includes("MAIN")) continue;
    c.plan.legs.forEach((leg, k) => {
      const kind =
        c.plan.settled && k === c.plan.legs.length - 1 ? "settled" : leg.kind;
      w.legs[kind] = (w.legs[kind] ?? 0) + 1;
    });
    if (!c.voted) continue;
    voted += 1;
    if (c.plan.flag !== null) censored += 1;
    // Open at hour k while k hours lie before its last leg; its share falls at the first whole hour at or after each leg.
    add(open, 0, 1);
    add(open, Math.ceil(holdOf(c) / HOUR_MS), -1);
    add(share, 0, 1);
    for (const leg of c.plan.legs)
      add(share, Math.ceil(leg.h / HOUR_MS), -leg.part);
    const d = dayOf(c.t + c.D);
    const day = days.get(d) ?? { copies: 0, longs: 0 };
    day.copies += 1;
    if (c.dir > 0) day.longs += 1;
    days.set(d, day);
  }
  const running = (a: number[], round: (x: number) => number) => {
    let s = 0;
    return a.slice(0, -1).map((x) => round((s += x)));
  };
  return {
    weeks: [...weeks]
      .sort(([a], [b]) => a - b)
      .map(([M, w]) => ({ M: new Date(M).toISOString(), ...w })),
    coins: [...coins]
      .sort(([a], [b]) => a - b)
      .map(([iid, byLine]) => ({ iid, copies: byLine })),
    survival: {
      copies: voted,
      censored,
      open: running(open, (x) => x),
      share: running(share, (x) => Math.round(x * 1e6) / 1e6),
    },
    longShare: [...days]
      .sort(([a], [b]) => a - b)
      .map(([d, x]) => ({
        day: new Date(d).toISOString().slice(0, 10),
        ...x,
      })),
  };
}

/** The sizes of the priced phases from BUILD on all of E (COPYH-ENGINE-REVIEW-2 Q2, decisions 2026-11-27; counts of memberships, no price): each BUILD and BUILD-L part's bytes, and by coin its copies by line (copyCounts') with the bytes of its copies' and its keys' lines over both phases, what a PRICES part of the coin reads. */
export function sizesOf(
  builds: readonly (Closed | null)[],
  copies: readonly {
    readonly iid: number;
    readonly copies: Readonly<Record<string, number>>;
  }[],
  names: ReadonlyMap<number, string>,
) {
  const parts: [string, number][] = [];
  const bytes = new Map<number, { copyBytes: number; keyBytes: number }>();
  for (const c of builds)
    if (c !== null)
      for (const [id] of c.record.parts) {
        const s = partSizesOf(c.dir, c.record, id);
        parts.push([`${c.record.phase}/${id}`, s.bytes]);
        for (const [iid, copyBytes, keyBytes] of s.coins) {
          const b = bytes.get(iid) ?? { copyBytes: 0, keyBytes: 0 };
          b.copyBytes += copyBytes;
          b.keyBytes += keyBytes;
          bytes.set(iid, b);
        }
      }
  const byLine = new Map(copies.map((c) => [c.iid, c.copies]));
  return {
    parts,
    coins: [...bytes]
      .sort(([a], [b]) => a - b)
      .map(([iid, b]) => ({
        iid,
        coin: names.get(iid) ?? null,
        copies: byLine.get(iid) ?? {},
        ...b,
      })),
  };
}

/** Count 2's memberships: the accounts in each line at each Monday, from the build phases' facts. */
export function membershipsOf(
  builds: readonly (Closed | null)[],
  mondays: readonly number[],
) {
  const by = mondays.map(() =>
    Object.fromEntries(LINES.map((l) => [l, 0])),
  ) as Record<string, number>[];
  for (const c of builds)
    if (c !== null)
      for (const [id] of c.record.parts)
        for (const [, at] of factsOf(c.dir, c.record, id).members)
          for (const [k, mask] of at)
            for (const l of LINES) if (mask & MASK[l]) by[k]![l]! += 1;
  return mondays.map((M, k) => ({ M: new Date(M).toISOString(), ...by[k] }));
}

/** RL11 (count 1): each coin's first Settlement in the reading before END, its market trades in the minutes after its minute, and the entries of MAIN's accounts after it (BUILD's count). */
export function settlementsOf(
  stores: readonly Store[],
  end: number,
  mainAfter: Readonly<Record<string, number>>,
  coins: ReadonlyMap<number, string>,
) {
  const first = new Map<number, number>();
  for (const s of stores)
    for (const c of s.manifest.counts.coins)
      if (c[4] >= 0 && c[4] < end && c[4] < (first.get(c[0]) ?? Infinity))
        first.set(c[0], c[4]);
  return [...first]
    .sort(([a], [b]) => a - b)
    .map(([iid, t]) => {
      const bars = readBars(stores, iid, end);
      const from =
        bars === null
          ? 0
          : (Math.floor(t / MINUTE_MS) * MINUTE_MS - bars.start) / MINUTE_MS +
            1;
      let trades = 0;
      for (let k = from; bars !== null && k < bars.n; k++)
        trades += bars.trades[k]!;
      return {
        iid,
        coin: coins.get(iid) ?? null,
        settlement: new Date(t).toISOString(),
        marketTradesAfter: trades,
        mainEntriesAfter: mainAfter[String(iid)] ?? 0,
      };
    });
}

/** The pass's peaks a store's manifest holds (stores.ts): its main thread's and each worker's, and the merge's; RSS in bytes. */
const StorePeaks = z.object({
  pass: z.object({
    main: z.object({ rss: z.number() }),
    workers: z.array(z.object({ rss: z.number() })),
  }),
  merge: z.object({ rss: z.number() }),
});

/** C15's worker heap from the rehearsal's peaks (C17): the largest RSS measured — each engine phase's (a child's peak after a part), each store build's pass threads and merge, and the rehearsal's own process (the work in memory) — twice, rounded up to a whole GB; above the cap, the parts are cut smaller instead. */
export function workerHeapOf(
  phases: Readonly<
    Record<string, { maxRssMb: number; peakAt: string | null } | null>
  >,
  stores: readonly { readonly name: string; readonly peaks: unknown }[],
  ownMb: number,
) {
  const peaks: [string, number][] = [["the rehearsal's own process", ownMb]];
  for (const [phase, r] of Object.entries(phases))
    if (r !== null && r.peakAt !== null)
      peaks.push([`${phase} ${r.peakAt}`, r.maxRssMb]);
  const mb = (bytes: number) => Math.round(bytes / 2 ** 20);
  for (const { name, peaks: of } of stores) {
    const p = StorePeaks.parse(of);
    peaks.push([`${name}'s pass, main`, mb(p.pass.main.rss)]);
    p.pass.workers.forEach((w, k) =>
      peaks.push([`${name}'s pass, worker ${k}`, mb(w.rss)]),
    );
    peaks.push([`${name}'s merge`, mb(p.merge.rss)]);
  }
  const [at, largestMb] = peaks.reduce((m, p) => (p[1] > m[1] ? p : m), [
    "none",
    0,
  ] as [string, number]);
  const gb = Math.ceil((2 * largestMb) / 1024);
  return { largestMb, at, gb, cutParts: gb > WORKER_HEAP_CAP_GB };
}

/** The label bound's check's buckets (C15 (c) 7): the addresses whose number is 0 mod 32, eight whole buckets of the 256. */
export const CHECK_BUCKETS = Array.from(
  { length: BUCKETS },
  (_, b) => b,
).filter((b) => b % LABEL_CHECK_SLICE[0] === LABEL_CHECK_SLICE[1]);
/** The label bound's check's Mondays (C15 (c) 7), as instants. */
export const CHECK_MONDAYS = LABEL_CHECK_MONDAYS.map((d) =>
  Date.parse(`${d}T00:00:00Z`),
);

/** A check part's run as the runner keeps it beside the part. */
const KitRun = z.object({
  seconds: z.number(),
  maxRssMb: z.number(),
  heapGb: z.number(),
});

/**
 * The rehearsal's two checks (C15 (c) 5 and 7), as parts after the unpriced
 * phases, no price: KIT on the built account with the most exit rows under
 * EXITS_MAX (none when no account is built), one child at the heap cap when
 * BUILD-L built it; LABELCHECK on the check's buckets at its Mondays, its
 * large lane LABELCHECK-L one child at the cap. Their prints: the exit rows
 * of the accounts above EXITS_MAX and of the largest under it, the kit's
 * history counts on that account and its two runs, the freeze waiting when
 * either passes one part's minutes or half its child's heap (RH1 (b)); the
 * label bound's check by Monday and its pass (RL4).
 */
export async function checksOn(
  run: EngineRun,
  u: Unpriced,
  check: {
    readonly buckets: readonly number[];
    readonly mondays: readonly number[];
  },
) {
  const facts = (c: Closed | null): BuildFacts[] =>
    c === null
      ? []
      : c.record.parts.map(([id]) => factsOf(c.dir, c.record, id));
  const built = [...facts(u.build), ...facts(u.buildL)];
  const largest = largestExitsOf(built.flatMap((f) => f.largestExits));
  const top = largest[0];
  const inLargeLane = new Set(
    facts(u.build).flatMap((f) => f.deferred.map(([a]) => a)),
  );
  const kit =
    top === undefined
      ? null
      : await closedOf(
          phaseOf(
            run,
            "KIT",
            "phase-check.js",
            "kitPart",
            kitParts({
              ...run.reading.inputs,
              code: run.code,
              addr: top[0],
              bucket: bucketOf(top[0]),
              end: run.end,
              limits: {
                fills: run.limits.historyFills,
                exits: run.limits.exits,
              },
            }),
            run.reading.context,
            inLargeLane.has(top[0]),
          ),
        );
  const spec = labelCheckParts(
    {
      ...run.reading.inputs,
      code: run.code,
      fillsMax: run.limits.labelFills,
      lane: run.lanes.labelFills,
    },
    check.buckets,
    check.mondays,
  );
  const labelCheck = await closedOf(
    phaseOf(
      run,
      "LABELCHECK",
      "phase-check.js",
      "labelCheckPart",
      spec,
      run.reading.context,
    ),
  );
  const normal = checksOf(labelCheck.dir, labelCheck.record);
  const largeSpec = largeCheckParts(spec, normal);
  const labelCheckL =
    largeSpec.length === 0
      ? null
      : await closedOf(
          phaseOf(
            run,
            "LABELCHECK-L",
            "phase-check.js",
            "labelCheckLargePart",
            largeSpec,
            run.reading.context,
            true,
          ),
        );
  const runsOfKit = (c: Closed) =>
    (["a", "b"] as const).map((copy) =>
      KitRun.parse(
        JSON.parse(
          readFileSync(path.join(c.dir, copy, "kit.run.json"), "utf8"),
        ),
      ),
    );
  const kitRuns = kit === null ? null : runsOfKit(kit);
  return {
    exits: {
      aboveMax: built.flatMap((f) => f.tooManyExits),
      largestUnder: largest,
      kit:
        kit === null || kitRuns === null
          ? null
          : {
              ...KitPart.parse(
                JSON.parse(
                  partBytes(kit.dir, kit.record, "kit").toString("utf8"),
                ),
              ),
              runs: kitRuns,
              freezeWaits: kitRuns.some(
                (r) =>
                  r.seconds > PART_MINUTES * 60 ||
                  r.maxRssMb > (r.heapGb * 1024) / 2,
              ),
            },
    },
    labelBound: labelCheckOf(
      [
        ...normal,
        ...(labelCheckL === null
          ? []
          : checksOf(labelCheckL.dir, labelCheckL.record)),
      ],
      check.mondays,
      LABEL_CHECK_PASS,
    ),
    runs: {
      kit: runsOf(kit),
      labelCheck: runsOf(labelCheck),
      labelCheckL: runsOf(labelCheckL),
    },
  };
}

/**
 * Count 5's caps (C4, C5), which set them [SET BEFORE THE FREEZE]: Monday by
 * Monday the captures past the normal lane's threshold, with their fills and
 * their label from the large lane (directional: P1 there, every Monday of E
 * being covered), and those above LABEL_FILLS_MAX; the histories in BUILD-L
 * and above HISTORY_FILLS_MAX, each with its fills and its P1 Mondays (BUILD
 * reads P1 accounts alone); and the largest P1 capture past the lane and the
 * largest history among them.
 */
export function capsOf(
  labels: readonly LabelsPart[],
  large: readonly LabelsPart[],
  build: {
    readonly largeLane: readonly (readonly [string, number])[];
    readonly tooManyFills: readonly (readonly [string, number])[];
  },
) {
  const p1Mondays = new Map<string, number>();
  for (const part of [...labels, ...large])
    for (const d of part.mondays)
      for (const a of d.p1) p1Mondays.set(a, (p1Mondays.get(a) ?? 0) + 1);
  const largeP1 = new Map<number, Set<string>>();
  const largeLabels = new Map<number, Record<string, number>>();
  for (const part of large)
    for (const d of part.mondays) {
      const set = largeP1.get(d.M) ?? new Set<string>();
      for (const a of d.p1) set.add(a);
      largeP1.set(d.M, set);
      const counts = largeLabels.get(d.M) ?? {};
      for (const [label, n] of Object.entries(d.counts))
        counts[label] = (counts[label] ?? 0) + n;
      largeLabels.set(d.M, counts);
    }
  const byMonday = new Map<
    number,
    { deferred: [string, number, boolean][]; tooLarge: [string, number][] }
  >();
  for (const part of labels)
    for (const d of part.mondays) {
      const m = byMonday.get(d.M) ?? { deferred: [], tooLarge: [] };
      for (const [a, fills] of d.deferred)
        m.deferred.push([a, fills, largeP1.get(d.M)?.has(a) ?? false]);
      for (const t of d.tooLarge) m.tooLarge.push([t[0], t[1]]);
      byMonday.set(d.M, m);
    }
  const largest = (xs: readonly number[]) =>
    xs.reduce<number | null>((m, x) => (m === null || x > m ? x : m), null);
  const histories = (xs: readonly (readonly [string, number])[]) =>
    xs.map(([a, fills]): [string, number, number] => [
      a,
      fills,
      p1Mondays.get(a) ?? 0,
    ]);
  const mondays = [...byMonday]
    .sort(([a], [b]) => a - b)
    .map(([M, m]) => ({
      M: new Date(M).toISOString(),
      deferred: m.deferred,
      largeLabels: largeLabels.get(M) ?? {},
      tooLarge: m.tooLarge,
    }));
  return {
    labels: mondays,
    histories: {
      largeLane: histories(build.largeLane),
      tooManyFills: histories(build.tooManyFills),
    },
    largest: {
      p1CapturePastLane: largest(
        mondays.flatMap((m) =>
          m.deferred.filter(([, , p1]) => p1).map(([, fills]) => fills),
        ),
      ),
      history: largest(
        [...build.largeLane, ...build.tooManyFills].map(([, fills]) => fills),
      ),
    },
  };
}

/** C9's settlement mark from C16's projection on all of E (C17): 60 minutes when the 5-minute rule projects above 0.5% unpriced; the freeze waits while the mark set still projects above 1%. */
export function settlementMarkOf(shares: { 5: number; 60: number }) {
  const minutes: MarkMinutes = shares[5] > SETTLEMENT_MARK_SWITCH ? 60 : 5;
  return { shares, minutes, freezeWaits: shares[minutes] > TRIPWIRE_STOP };
}

/** The rehearsal's engine on a reading and what it gives, the store's record and identity aside: the unpriced phases, TRIPWIRE and the two checks (the label bound's on `check`'s buckets and Mondays), the values, then in memory the fortnight priced at the mark set and the counts. */
export async function rehearsalOf(o: {
  run: EngineRun;
  stores: readonly Store[];
  kit: Research;
  window: readonly [number, number];
  check: {
    readonly buckets: readonly number[];
    readonly mondays: readonly number[];
  };
  pricing: Budget;
}) {
  const u = await unpricedPhases(o.run);
  const tripwire = await tripwirePhase(o.run, u);
  const checks = await checksOn(o.run, u, o.check);
  const projected = {
    5: tripwireOf(tripwire.dir, tripwire.record, 5),
    60: tripwireOf(tripwire.dir, tripwire.record, 60),
  };
  const mark = settlementMarkOf({
    5: projected[5].share,
    60: projected[60].share,
  });
  const fortnight = await fortnightOf(
    {
      ...o.run,
      dir: path.join(o.run.dir, "fortnight"),
      markMinutes: mark.minutes,
    },
    o.kit,
    o.window,
    o.pricing,
  );
  const t0 = performance.now();
  const counts = stepCounts({
    engine: {
      dir: o.run.dir,
      ...u,
      tripwire,
      projection: null,
      tries: [],
      prices: null,
      rank: null,
      result: null,
    },
    stores: o.stores,
    end: o.run.end,
  });
  const b = counts.build;
  const parts = (c: Closed | null): LabelsPart[] =>
    c === null ? [] : [...labelsOf(c.dir, c.record).values()];
  const { coins, ...copies } = copyCounts(copiesOf(u));
  const more = {
    tripwire: projected,
    memberships: membershipsOf([u.build, u.buildL], o.run.mondays),
    ...copies,
    sizes: sizesOf([u.build, u.buildL], coins, o.run.coins),
    settlements: settlementsOf(
      o.stores,
      o.run.end,
      b.mainAfterSettlement,
      o.run.coins,
    ),
    exits: checks.exits,
    caps: capsOf(parts(u.labels), parts(u.labelsL), b),
    labelBound: checks.labelBound,
    checkRuns: checks.runs,
    seconds: Math.round(performance.now() - t0) / 1000,
  };
  return {
    fortnight,
    values: {
      settlementMark: mark,
      workerHeap: workerHeapOf(
        counts.runs,
        o.stores.map((s) => ({
          name: s.manifest.range,
          peaks: s.manifest.peaks,
        })),
        Math.round(process.resourceUsage().maxRSS / 1024),
      ),
      kit: { freezeWaits: checks.exits.kit?.freezeWaits ?? false },
      labelBound: { pass: checks.labelBound.pass },
    },
    prints: {
      idsTwice: b.idsTwice,
      sizeZero: b.sizeZero,
      largestMerged: b.largestMerged,
      largestMergedRuling:
        b.largestMerged > MERGED_RULING
          ? `above ${MERGED_RULING}: a ruling before the freeze`
          : null,
    },
    counts: { ...counts, ...more },
  };
}

/** What the command takes from main.ts. */
export type RehearseRun = {
  readonly root: string;
  /** COPYH-FUNDING's store. */
  readonly funding: string;
  readonly roots: readonly string[];
  readonly workers: number;
  readonly heapGb: number;
  readonly budget: Budget;
  /** The run's budget less FORTNIGHT_MINUTES, made with it: the work in memory. */
  readonly pricing: Budget;
  readonly log: Log;
};

/** The rehearsal (C15 (c)): its refusals, the engine at END_E on E's Mondays in `E\rehearsal\engine`, the fortnight and the counts, `rehearsal.json` written whole. */
export async function rehearse(o: RehearseRun): Promise<void> {
  const ready = readyForRehearsal({
    root: o.root,
    roots: o.roots,
    caps: { labelFills: LABEL_FILLS_MAX, historyFills: HISTORY_FILLS_MAX },
  });
  const program = fingerprintOf(PACKAGE_ROOT);
  const kit = await loadResearch();
  const e = path.join(o.root, "E");
  const dir = path.join(e, "rehearsal");
  // LABELS through TRIPWIRE read no settlement mark (TRIPWIRE projects both); the fortnight is priced at the one its projection sets.
  const run = engineRunOf(
    { ...o, seal: SEALED },
    {
      program,
      values: { ...ready.caps, markMinutes: 5 },
      stores: [ready.store],
      dir: path.join(dir, "engine"),
      end: END_E,
      stage: STAGE_WINDOWS.E,
      mondays: mondaysOf("E"),
      look: null,
      earlier: [],
      tries: [],
      pastTripwire: false,
      engine: null,
      fundingList: path.join(PACKAGE_ROOT, "copyh", "funding.sha256"),
    },
  );
  const r = await rehearsalOf({
    run,
    stores: [ready.store],
    kit,
    window: REHEARSAL_WINDOW,
    check: { buckets: CHECK_BUCKETS, mondays: CHECK_MONDAYS },
    pricing: o.pricing,
  });
  const out = path.join(dir, REHEARSAL_FILE);
  writeWhole(
    out,
    `${JSON.stringify(rehearsalJson({ e, ready, r, program, kit: kit.fingerprint, heapGb: o.heapGb }), null, 1)}\n`,
  );
  o.log("the rehearsal's prints", r.prints);
  o.log("done: rehearsal.json written", { file: out, values: r.values });
}

/** `rehearsal.json`'s content (steps.ts `RehearsalFile` reads it at step 1), its identity first (C0): the program, the kit, lib-exits, the lists it does not write and E's store files (`e`: `<COPYH_ROOT>\E`) by SHA-256, the shared files, the heap, Node; then E's store's record (its store closure, this build's: its form `tools/copyh-freeze.cjs --closure`'s; its manifest without the run's fields; the builder's code beside it), the fortnight, the caps' base, the values, the prints and the counts with E's integrity's K1 and K3. */
export function rehearsalJson(o: {
  e: string;
  ready: ReturnType<typeof readyForRehearsal>;
  r: Awaited<ReturnType<typeof rehearsalOf>>;
  program: string;
  kit: string;
  heapGb: number;
}) {
  return {
    identity: {
      program: o.program,
      kit: o.kit,
      libExits: LIB_EXITS_SHA256,
      lists: Object.fromEntries(
        LISTS.map((f) => [f, fileSha256(path.join(PACKAGE_ROOT, "copyh", f))]),
      ),
      files: Object.fromEntries(
        [
          `store/${MANIFEST}`,
          `twin/store/${MANIFEST}`,
          "integrity/builds.json",
          "integrity/integrity.json",
        ].map((f) => [f, fileSha256(path.join(o.e, ...f.split("/")))]),
      ),
      shared: sharedHashes(PACKAGE_ROOT),
      heapGb: o.heapGb,
      node: process.version,
    },
    storeClosure: storeClosure(),
    store: StoreRecord.parse(o.ready.store.manifest),
    builtBy: o.ready.store.manifest.code,
    fortnight: o.r.fortnight,
    caps: { base: CAPS_BASE, provisional: o.ready.caps },
    values: o.r.values,
    prints: o.r.prints,
    counts: {
      ...o.r.counts,
      integrity: { k1: o.ready.integrity.k1, k3: o.ready.integrity.k3 },
    },
  };
}
