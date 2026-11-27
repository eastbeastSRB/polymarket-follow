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
 * - the values its counts set before the freeze (C17): C9's settlement mark
 *   (C16: 60 minutes when the 5-minute projection is above 0.5%; the freeze
 *   waits while the set mark's is above 1%) and C15's worker heap (twice the
 *   largest peak measured, rounded up to a whole GB; above the cap the parts
 *   are cut smaller instead); the caps' are read with their large lane's
 *   labels (C15 (c) 5);
 * - in memory, started only while `pricing` allows (the run's budget less
 *   steps.ts's FORTNIGHT_MINUTES): the fortnight priced at the mark set (C15
 *   (c) 10, steps.ts `fortnightOf`), then the counts from the closed phases;
 * - `rehearsal.json` written whole, its identity first, for the supervisor
 *   to commit as `copyh/rehearsal.json` (steps.ts `RehearsalFile`): E's
 *   store's record (its store closure in `tools/copyh-freeze.cjs
 *   --closure`'s form, closure.ts's; its manifest without the run's fields),
 *   the fortnight, the caps' base, the values, the prints (the ids met
 *   twice, the entries of size 0, the largest merged order event) and the
 *   counts (C15 (c) 1–4, 6, 8 and 9).
 * Each heavy piece resumes from whole parts: a run whose minutes are spent
 * exits 3, and the next run goes on.
 */
import { existsSync } from "node:fs";
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
  END_E,
  HISTORY_FILLS_MAX,
  LABEL_FILLS_MAX,
  REHEARSAL_WINDOW,
  SETTLEMENT_MARK_SWITCH,
  TRIPWIRE_STOP,
  WORKER_HEAP_CAP_GB,
} from "./design.js";
import { fileSha256 } from "./engine.js";
import { STAGE_WINDOWS, dayOf, mondaysOf } from "./instants.js";
import { readBars, type MarkMinutes } from "./markets.js";
import { MASK, coinCopies, factsOf, type Copy } from "./phase-build.js";
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
  engineRunOf,
  fortnightOf,
  parsedOf,
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

/** Count 2's copies a week by line and MAIN's legs a week by kind (a settled copy's last leg "settled"), and count 4 on MAIN's voted copies (H1 fix 7): the survival curve of their holds (at each whole hour after the follow instant, the copies still open and their open share) and MAIN's long share by UTC day of the follow instant. */
export function copyCounts(copies: Iterable<Copy>) {
  const weeks = new Map<
    number,
    { copies: Record<string, number>; legs: Record<string, number> }
  >();
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
    for (const l of c.lines) w.copies[l] = (w.copies[l] ?? 0) + 1;
    weeks.set(c.M, w);
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

/** C9's settlement mark from C16's projection on all of E (C17): 60 minutes when the 5-minute rule projects above 0.5% unpriced; the freeze waits while the mark set still projects above 1%. */
export function settlementMarkOf(shares: { 5: number; 60: number }) {
  const minutes: MarkMinutes = shares[5] > SETTLEMENT_MARK_SWITCH ? 60 : 5;
  return { shares, minutes, freezeWaits: shares[minutes] > TRIPWIRE_STOP };
}

/** The rehearsal's engine on a reading and what it gives, the store's record and identity aside: the unpriced phases and TRIPWIRE, the values, then in memory the fortnight priced at the mark set and the counts. */
export async function rehearsalOf(o: {
  run: EngineRun;
  stores: readonly Store[];
  kit: Research;
  window: readonly [number, number];
  pricing: Budget;
}) {
  const u = await unpricedPhases(o.run);
  const tripwire = await tripwirePhase(o.run, u);
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
  const more = {
    tripwire: projected,
    memberships: membershipsOf([u.build, u.buildL], o.run.mondays),
    ...copyCounts(copiesOf(u)),
    settlements: settlementsOf(
      o.stores,
      o.run.end,
      b.mainAfterSettlement,
      o.run.coins,
    ),
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
