/**
 * COPY-H's rehearsal (src/copyh/rehearse.ts; rules.md C15 (c), C16, C17):
 * - its refusals in their order, each exit 5: a second rehearsal, a cap
 *   unset, E's store or its twin not built, its integrity missing, not
 *   passed, or of another store or twin;
 * - on the phases' made-up world, every part through real child processes:
 *   the phases before any price and TRIPWIRE, MAIN's copy projected under
 *   both settlement marks, the mark they set (60) and the fortnight priced
 *   in memory at it (the 60-minute fortnight's, not the 5's); the counts
 *   and the prints; no file of priced copies written;
 * - `rehearsal.json`'s content read by step 1's schema (steps.ts
 *   `RehearsalFile`), its identity, store record and closure;
 * - the counts' pieces on made-up copies and stores: the copies a week by
 *   line with MAIN's legs, the survival curve at whole hours and its share,
 *   the long share by day; RL11's settlements, a trade in the Settlement's
 *   own minute left out; the worker heap and the settlement mark on both
 *   sides of their bounds.
 */
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { storeClosure } from "../src/copyh/closure.js";
import { fileSha256 } from "../src/copyh/engine.js";
import { dayOf, mondayOf } from "../src/copyh/instants.js";
import type { Copy } from "../src/copyh/phase-build.js";
import {
  CAPS_BASE,
  REHEARSAL_FILE,
  copyCounts,
  readyForRehearsal,
  rehearsalJson,
  rehearsalOf,
  settlementMarkOf,
  settlementsOf,
  workerHeapOf,
} from "../src/copyh/rehearse.js";
import { PACKAGE_ROOT, exitOf, sha256 } from "../src/copyh/run.js";
import { SEALED } from "../src/copyh/seal.js";
import {
  RehearsalFile,
  StoreRecord,
  fortnightOf,
  type EngineRun,
} from "../src/copyh/steps.js";
import { MANIFEST, Store, openStore } from "../src/copyh/store.js";
import { loadResearch } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { COINS, addr, record, trade } from "./copyh-world.js";
import {
  A,
  END,
  M1,
  M2,
  START,
  X,
  at,
  buildOf,
  fundingWorld,
  phaseWorld,
} from "./copyh-phase-world.js";

const temp = (name: string) =>
  mkdtempSync(path.join(tmpdir(), `copyh-${name}-`));
const codeOf = (f: () => unknown): number | null => {
  try {
    f();
  } catch (err) {
    return exitOf(err).code;
  }
  return null;
};
const never = { stop: () => null };
const iso = (t: number) => new Date(t).toISOString();
const SOL = 2;

const kit = await loadResearch();
/** The phases' world: A's SOL copy in M2's week, from at(1, 10) + D to at(2, 9) + D; SOL's funding every hour up to at(1, 11), the first hour of its hold, with A's trade 60 minutes before it and none in the 6: unpriced under the 5-minute settlement mark, priced under the 60. */
const world = await phaseWorld();
const F = fundingWorld([
  {
    coin: "SOL",
    start: START,
    rows: Array.from(
      { length: (at(1, 11) + HOUR_MS - START) / HOUR_MS },
      (_, k): [number, string] => [
        START + k * HOUR_MS + 5 + (k % 89),
        (((k % 5) - 2) * 1e-5).toFixed(6),
      ],
    ),
  },
]);

/** The rehearsal's engine run on the world, in `dir`, under the closed seal (no step's engine folder). */
const runAt = (dir: string, markMinutes: 5 | 60 = 5): EngineRun => ({
  dir,
  code: "made-up",
  reading: {
    inputs: world.reading,
    context: { ...world.context, roots: [...world.context.roots, F.root] },
  },
  end: END,
  stage: [M1, END],
  mondays: [M1, M2],
  limits: { labelFills: 1e9, historyFills: 2e9, exits: 3e9 },
  lanes: { labelFills: null, historyFills: null },
  markMinutes,
  tries: [],
  funding: { store: F.store, list: F.list, sha256: F.sha256 },
  coins: new Map(COINS.map((c, i) => [i, c])),
  look: null,
  earlier: [],
  pastTripwire: false,
  workers: 3,
  heapGb: 1,
  seal: SEALED,
  budget: never,
  log: () => {},
});

/** A COPY-H folder whose E holds the world's store as its first build and as its twin (`twin`: a twin's manifest of other bytes), its integrity as given (none: not written). */
function eFolder(o: {
  twin?: "same" | "other" | "none";
  integrity?: (ids: { store: string; twin: string }) => unknown;
}) {
  const root = path.join(temp("rehearse-e"), "COPY-H");
  const e = path.join(root, "E");
  const text = readFileSync(path.join(world.store.dir, MANIFEST), "utf8");
  mkdirSync(path.join(e, "store"), { recursive: true });
  writeFileSync(path.join(e, "store", MANIFEST), text);
  const twinText =
    o.twin === "other" ? JSON.stringify(JSON.parse(text), null, 2) : text;
  if (o.twin !== "none") {
    mkdirSync(path.join(e, "twin", "store"), { recursive: true });
    writeFileSync(path.join(e, "twin", "store", MANIFEST), twinText);
  }
  if (o.integrity !== undefined) {
    mkdirSync(path.join(e, "integrity"), { recursive: true });
    writeFileSync(
      path.join(e, "integrity", "integrity.json"),
      JSON.stringify(
        o.integrity({ store: sha256(text), twin: sha256(twinText) }),
      ),
    );
    writeFileSync(
      path.join(e, "integrity", "builds.json"),
      JSON.stringify({ equal: true }),
    );
  }
  return { root, e, id: sha256(text) };
}
const K = {
  k1: { edges: 2, listed: 0, unexpectedCount: 0, odd: [] },
  k3: { holes: [[1, 2]], events: 40, multiChain: 3 },
};
const passed = (ids: { store: string; twin: string }) => ({
  ...ids,
  passed: true,
  ...K,
});
const CAPS = { labelFills: 13_000_000, historyFills: 8_500_000 };

describe("the rehearsal's refusals (C15 (c), in their order)", () => {
  it("refuses a second rehearsal, a cap unset, E's store or its twin not built, and its integrity missing, not passed, or of another store or twin, each exit 5, in that order", () => {
    const ready =
      (
        root: string,
        caps: {
          readonly labelFills: number | null;
          readonly historyFills: number | null;
        } = CAPS,
      ) =>
      () =>
        readyForRehearsal({ root, roots: [root], caps });
    const unset = { labelFills: 13_000_000, historyFills: null };
    // Every later piece missing too: each refusal comes before the next.
    const none = path.join(temp("rehearse-none"), "COPY-H");
    mkdirSync(path.join(none, "E", "rehearsal"), { recursive: true });
    writeFileSync(path.join(none, "E", "rehearsal", REHEARSAL_FILE), "{}");
    expect(ready(none, unset)).toThrow("is made once");
    expect(codeOf(ready(none, unset))).toBe(5);
    rmSync(path.join(none, "E", "rehearsal", REHEARSAL_FILE));
    expect(ready(none, unset)).toThrow("a cap unset");
    expect(codeOf(ready(none, unset))).toBe(5);
    expect(ready(none, { labelFills: null, historyFills: 1 })).toThrow(
      "a cap unset",
    );
    expect(ready(none)).toThrow(
      "E's store is not built: build --range E first",
    );
    expect(codeOf(ready(none))).toBe(5);

    const noTwin = eFolder({ twin: "none", integrity: passed });
    expect(ready(noTwin.root)).toThrow(
      "E's twin is not built: build --range E --twin first",
    );
    expect(codeOf(ready(noTwin.root))).toBe(5);
    const noIntegrity = eFolder({});
    expect(ready(noIntegrity.root)).toThrow("no E's integrity that parses");
    expect(codeOf(ready(noIntegrity.root))).toBe(5);
    for (const integrity of [
      (ids: { store: string; twin: string }) => ({
        ...passed(ids),
        passed: false,
      }),
      (ids: { store: string; twin: string }) => ({
        ...passed(ids),
        store: "0".repeat(64),
      }),
      (ids: { store: string; twin: string }) => ({
        ...passed(ids),
        twin: null,
      }),
    ]) {
      const f = eFolder({ integrity });
      expect(ready(f.root)).toThrow(
        "E's integrity has not passed for this store and its twin",
      );
      expect(codeOf(ready(f.root))).toBe(5);
    }
    // A twin of other bytes that the integrity did not check.
    const other = eFolder({
      twin: "other",
      integrity: (ids) => passed({ ...ids, twin: ids.store }),
    });
    expect(codeOf(ready(other.root))).toBe(5);

    const ok = eFolder({ integrity: passed });
    const r = readyForRehearsal({
      root: ok.root,
      roots: [ok.root],
      caps: CAPS,
    });
    expect([r.store.id, r.twin.id]).toEqual([ok.id, ok.id]);
    expect(r.integrity).toMatchObject({ store: ok.id, passed: true, ...K });
    expect(r.caps).toEqual(CAPS);
  });
});

describe(
  "the rehearsal on the made-up world (C15 (c), C16, C17), every part through real child processes",
  { timeout: 300_000 },
  () => {
    const engine = path.join(
      temp("rehearse"),
      "COPY-H",
      "E",
      "rehearsal",
      "engine",
    );
    let r: Awaited<ReturnType<typeof rehearsalOf>>;
    /** The world's store with the peaks stores.ts's build records (the test world's records none): a pass worker's 9 GB the largest. */
    const store = new Store(
      world.store.dir,
      {
        ...world.store.manifest,
        peaks: {
          pass: {
            main: { rss: 2 ** 30 },
            workers: [{ rss: 9 * 2 ** 30 }, { rss: 2 ** 31 }],
          },
          merge: { rss: 3 * 2 ** 30, heapLimit: 8 * 2 ** 30 },
        },
      },
      world.store.id,
      world.store.roots,
      world.store.seal,
    );

    it("runs the phases before any price and TRIPWIRE, sets the settlement mark from its projection, prices the fortnight in memory at that mark, and writes no file of priced copies", async () => {
      r = await rehearsalOf({
        run: runAt(engine),
        stores: [store],
        kit,
        window: [M1, END],
        pricing: never,
      });
      expect(readdirSync(engine).sort()).toEqual([
        "build",
        "fortnight",
        "labels",
        "removal",
        "tripwire",
      ]);
      expect(readdirSync(path.join(engine, "fortnight")).sort()).toEqual([
        "build",
        "labels",
        "removal",
      ]);
      // MAIN's one copy: a funding settlement without a mark under the 5-minute rule, priced under the 60.
      expect(r.counts.tripwire[5]).toMatchObject({
        copies: 1,
        share: 1,
        unpriced: { "a funding settlement without a mark": 1 },
      });
      expect(r.counts.tripwire[60]).toMatchObject({ copies: 1, share: 0 });
      expect(r.values.settlementMark).toEqual({
        shares: { 5: 1, 60: 0 },
        minutes: 60,
        freezeWaits: false,
      });
      // The fortnight at the mark set: the 60-minute one's lines, not the 5's.
      const at60 = await fortnightOf(
        runAt(path.join(temp("f60"), "fortnight"), 60),
        kit,
        [M1, END],
        never,
      );
      const at5 = await fortnightOf(
        runAt(path.join(temp("f5"), "fortnight"), 5),
        kit,
        [M1, END],
        never,
      );
      expect({ ...r.fortnight, seconds: 0 }).toEqual({ ...at60, seconds: 0 });
      expect(r.fortnight.lines).toBe(1);
      expect(at5.sha256).not.toBe(at60.sha256);
    });

    it("gives the counts and the prints: the labels, memberships, copies a week by line, the survival curve and long share of MAIN's voted copy, no settlement, each phase's runs, no price phase", () => {
      const build = path.join(engine, "build");
      const record = JSON.parse(
        readFileSync(path.join(build, "record.json"), "utf8"),
      ) as Parameters<typeof buildOf>[1];
      const [c] = buildOf(build, record, "b001").coins.get(SOL)!.copies;
      const hold = c!.plan.legs.at(-1)!.h;
      expect(hold).toBe(at(2, 9) - at(1, 10));
      expect(r.counts.labels.map((l) => l.M)).toEqual([iso(M1), iso(M2)]);
      expect(r.counts.build).toMatchObject({
        p1: 1,
        built: 1,
        copies: { MAIN: 1, BROAD: 1, DAY: 1 },
        mainAfterSettlement: {},
      });
      expect(r.prints).toEqual({
        idsTwice: 0,
        sizeZero: 0,
        largestMerged: 0,
        largestMergedRuling: null,
      });
      expect(r.counts.memberships).toEqual([
        { M: iso(M1), MAIN: 0, TEN: 0, BROAD: 0, DAY: 0 },
        { M: iso(M2), MAIN: 1, TEN: 0, BROAD: 1, DAY: 1 },
      ]);
      expect(r.counts.weeks).toEqual([
        {
          M: iso(M2),
          copies: { MAIN: 1, BROAD: 1, DAY: 1 },
          legs: { [c!.plan.legs[0]!.kind]: 1 },
        },
      ]);
      // Held 23 hours exactly: open at hours 0 to 22.
      const hours = Math.ceil(hold / HOUR_MS);
      expect(hours).toBe(23);
      expect(r.counts.survival).toEqual({
        copies: 1,
        censored: 0,
        open: Array<number>(hours).fill(1),
        share: Array<number>(hours).fill(1),
      });
      expect(r.counts.longShare).toEqual([
        {
          day: iso(dayOf(c!.t + c!.D)).slice(0, 10),
          copies: 1,
          longs: 1,
        },
      ]);
      expect(r.counts.settlements).toEqual([]);
      expect(r.counts.runs).toMatchObject({
        labels: { parts: 256 },
        build: { parts: 256 },
        removal: { parts: 1 },
        tripwire: { parts: 1 },
        prices: null,
        rank: null,
        result: null,
      });
      // The store's pass worker's 9 GB above every engine part's and this process's peak: twice, 18 GB.
      expect(r.values.workerHeap).toEqual({
        largestMb: 9_216,
        at: `${world.store.manifest.range}'s pass, worker 0`,
        gb: 18,
        cutParts: false,
      });
    });

    it("writes rehearsal.json's content as step 1 reads it: its identity first, E's store record, this build's store closure, the fortnight, the caps' base", () => {
      const f = eFolder({ integrity: passed });
      const ready = readyForRehearsal({
        root: f.root,
        roots: [f.root],
        caps: CAPS,
      });
      const json = rehearsalJson({
        e: f.e,
        ready,
        r,
        program: "made-up",
        kit: kit.fingerprint,
        heapGb: 8,
      });
      expect(Object.keys(json)[0]).toBe("identity");
      const read = RehearsalFile.parse(JSON.parse(JSON.stringify(json)));
      expect(read.store).toEqual(StoreRecord.parse(world.store.manifest));
      expect(read.storeClosure).toEqual(storeClosure());
      expect(read.fortnight).toEqual(r.fortnight);
      expect(json.identity).toMatchObject({
        program: "made-up",
        kit: kit.fingerprint,
        heapGb: 8,
      });
      expect(Object.keys(json.identity.lists).sort()).toEqual([
        "coins.json",
        "data.sha256",
        "dirs.json",
        "funding.sha256",
        "unpaired.json",
      ]);
      expect(json.identity.lists["dirs.json"]).toBe(
        fileSha256(path.join(PACKAGE_ROOT, "copyh", "dirs.json")),
      );
      expect(json.identity.files).toEqual(
        Object.fromEntries(
          [
            "store/manifest.json",
            "twin/store/manifest.json",
            "integrity/builds.json",
            "integrity/integrity.json",
          ].map((n) => [n, fileSha256(path.join(f.e, ...n.split("/")))]),
        ),
      );
      expect(json.builtBy).toEqual(world.store.manifest.code);
      expect(json.caps).toEqual({ base: CAPS_BASE, provisional: CAPS });
      expect(CAPS_BASE).toEqual({
        labelKbAFill: 0.77,
        historyKbAFill: 1.18,
        laneGb: 20,
        share: 0.5,
      });
      expect(json.counts.integrity).toEqual(K);
      expect(json.values).toEqual(r.values);
      expect(json.prints).toEqual(r.prints);
    });
  },
);

/** A made-up copy of the build phase: MAIN, voted, long, followed a minute after t; its legs [h, part, kind]. */
function copyOf(o: {
  t: number;
  legs: readonly [number, number, Copy["plan"]["legs"][number]["kind"]][];
  lines?: Copy["lines"];
  voted?: boolean;
  dir?: number;
  flag?: Copy["plan"]["flag"];
  settled?: boolean;
}): Copy {
  return {
    id: `c${o.t}`,
    addr: A,
    iid: SOL,
    dir: o.dir ?? 1,
    type: "OPEN",
    t: o.t,
    D: MINUTE_MS,
    M: mondayOf(o.t),
    lines: o.lines ?? ["MAIN"],
    exits: [],
    plan: {
      legs: o.legs.map(([h, part, kind]) => ({
        h,
        part,
        kind,
        forced: false,
        liq: false,
      })),
      flag: o.flag ?? null,
      lastExitT: null,
      settled: o.settled ?? false,
    },
    voted: o.voted ?? true,
    gap: false,
    covariates: {
      closedCycles: 3,
      medianHoldHours: 7,
      longShare: 0.5,
      entries: 4,
      coin: SOL,
      sizeUsd: 1_000,
      priorCopies: 0,
    },
  };
}

describe(
  "the counts' pieces on made-up copies and stores",
  { timeout: 60_000 },
  () => {
    it("counts the copies a week by line and MAIN's legs by kind; the survival of MAIN's voted copies at whole hours, its open share after a partial exit, the censored; the long share by the follow instant's UTC day", () => {
      const H = HOUR_MS;
      const week2 = M2 + 7 * DAY_MS;
      const copies = [
        // Exits a quarter at 1.5 h and the rest at 4 h.
        copyOf({
          t: M2 + H,
          legs: [
            [1.5 * H, 0.25, "REDUCE"],
            [4 * H, 0.75, "CLOSE"],
          ],
        }),
        // Closed at 2 h exactly: open at hours 0 and 1.
        copyOf({ t: M2 + 2 * H, legs: [[2 * H, 1, "CLOSE"]] }),
        // Open at its coin's Settlement, cut at 5 h: censored, its last leg "settled".
        copyOf({
          t: M2 + 3 * H,
          legs: [[5 * H, 1, "cut"]],
          flag: "open",
          settled: true,
        }),
        // Not voted: in the week's counts only.
        copyOf({ t: M2 + 4 * H, legs: [[H, 1, "CLOSE"]], voted: false }),
        // BROAD only: its copy counted, nothing else.
        copyOf({ t: M2 + 5 * H, legs: [[H, 1, "CLOSE"]], lines: ["BROAD"] }),
        // A short of the next week, closed within its first hour.
        copyOf({ t: week2 + H, legs: [[0.5 * H, 1, "CLOSE"]], dir: -1 }),
      ];
      const c = copyCounts(copies);
      expect(c.weeks).toEqual([
        {
          M: iso(copies[0]!.M),
          copies: { MAIN: 4, BROAD: 1 },
          legs: { REDUCE: 1, CLOSE: 3, settled: 1 },
        },
        { M: iso(copies[5]!.M), copies: { MAIN: 1 }, legs: { CLOSE: 1 } },
      ]);
      expect(copies[0]!.M).not.toBe(copies[5]!.M);
      expect(c.survival).toEqual({
        copies: 4,
        censored: 1,
        open: [4, 3, 2, 2, 1],
        share: [4, 3, 1.75, 1.75, 1],
      });
      expect(c.longShare).toEqual([
        { day: iso(dayOf(M2)).slice(0, 10), copies: 3, longs: 3 },
        { day: iso(dayOf(week2)).slice(0, 10), copies: 1, longs: 0 },
      ]);
      expect(copyCounts([])).toEqual({
        weeks: [],
        survival: { copies: 0, censored: 0, open: [], share: [] },
        longShare: [],
      });
    });

    it("takes the worker heap at twice the largest peak measured, rounded up to a whole GB, naming where it was, and cuts the parts above the 20 GB cap", () => {
      const peaks = (rss: number) => ({
        pass: { main: { rss: 2 ** 30 }, workers: [{ rss }, { rss: 2 ** 29 }] },
        merge: { rss: 2 ** 31 },
      });
      const phases = {
        labels: { maxRssMb: 900, peakAt: "a/b001-m000" },
        build: { maxRssMb: 1_500, peakAt: "b/b003" },
        prices: null,
        rank: { maxRssMb: 0, peakAt: null },
      };
      expect(
        workerHeapOf(phases, [{ name: "E", peaks: peaks(3 * 2 ** 30) }], 800),
      ).toEqual({
        largestMb: 3_072,
        at: "E's pass, worker 0",
        gb: 6,
        cutParts: false,
      });
      expect(
        workerHeapOf(phases, [{ name: "E", peaks: peaks(2 ** 20) }], 800),
      ).toEqual({
        largestMb: 2_048,
        at: "E's merge",
        gb: 4,
        cutParts: false,
      });
      expect(workerHeapOf(phases, [], 4_000)).toMatchObject({
        largestMb: 4_000,
        at: "the rehearsal's own process",
        gb: 8,
      });
      expect(workerHeapOf({}, [], 1_536)).toMatchObject({
        largestMb: 1_536,
        gb: 3,
      });
      expect(workerHeapOf(phases, [], 10_240)).toMatchObject({
        gb: 20,
        cutParts: false,
      });
      expect(workerHeapOf(phases, [], 10_241)).toMatchObject({
        gb: 21,
        cutParts: true,
      });
      expect(
        workerHeapOf({ build: { maxRssMb: 5_000, peakAt: "b/b007" } }, [], 800),
      ).toMatchObject({ largestMb: 5_000, at: "build b/b007", gb: 10 });
    });

    it("sets the settlement mark at 60 minutes above 0.5% at the 5-minute rule, and has the freeze wait above 1% at the mark set, each bound on both sides", () => {
      expect(settlementMarkOf({ 5: 0.005, 60: 0.5 })).toEqual({
        shares: { 5: 0.005, 60: 0.5 },
        minutes: 5,
        freezeWaits: false,
      });
      expect(settlementMarkOf({ 5: 0.0050001, 60: 0.01 })).toMatchObject({
        minutes: 60,
        freezeWaits: false,
      });
      expect(settlementMarkOf({ 5: 0.02, 60: 0.0100001 })).toMatchObject({
        minutes: 60,
        freezeWaits: true,
      });
    });

    it("gives each coin's first Settlement before END with its market trades in the minutes after its own and MAIN's entries after it (RL11); a trade in the Settlement's minute left out, a Settlement at END none", async () => {
      const s = at(1, 5) + 10_000;
      const W = addr(0xa05);
      const sol = (time: number, tid: number) =>
        trade(W, X, {
          coin: "SOL",
          side: "B",
          sz: "1",
          time,
          tid,
          oid: tid,
        }).map((rec): [number, string] => [time, rec]);
      const settled = await phaseWorld([
        [
          s,
          record(X, {
            coin: "SOL",
            side: "A",
            time: s,
            dir: "Settlement",
            tid: 9_001,
            crossed: true,
          }),
        ],
        ...sol(s + 20_000, 9_101),
        ...sol(Math.floor(s / MINUTE_MS) * MINUTE_MS + MINUTE_MS, 9_102),
      ]);
      const store = openStore(settled.store.dir, settled.context.roots, SEALED);
      const coins = new Map(COINS.map((c, i) => [i, c]));
      // After its minute: W's trade of the next minute and A's two of at(1, 10) and at(2, 9).
      expect(settlementsOf([store], END, { [SOL]: 1 }, coins)).toEqual([
        {
          iid: SOL,
          coin: "SOL",
          settlement: iso(s),
          marketTradesAfter: 3,
          mainEntriesAfter: 1,
        },
      ]);
      expect(
        settlementsOf(
          [store],
          Math.floor(s / MINUTE_MS) * MINUTE_MS,
          {},
          coins,
        ),
      ).toEqual([]);
      expect(settlementsOf([world.store], END, {}, coins)).toEqual([]);
    });
  },
);
