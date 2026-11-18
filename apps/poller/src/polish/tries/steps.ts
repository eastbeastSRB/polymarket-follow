/**
 * The exploration's steps (POLISH-EXPLORE's plan 1.2, 7 and 9; decisions
 * 2026-11-18, "POLISH-EXPLORE's plan approved", 1, 2 and 11), run by
 * `polish explore --step <name>`. Each opens only the trusted store, names
 * its identity first (the store, its gates and the code that made and gated
 * it, held equal; this program; the look's files the gates read), refuses a
 * predecessor's output missing or of another identity (exit 5), and writes
 * its output whole into `<ANALYZER_ROOT>\explore\`, with its peaks and
 * seconds. `features`: the checks and the nine E cuts from the features
 * alone, no price at any leg; its `cuts.json` is what the supervisor
 * commits as `polish/cuts.json` before any outcome.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { gunzipSync, gzipSync } from "node:zlib";
import { z } from "zod";
import { ENTRY_DELAY_MS, HOLD_MS } from "../../market1/price.js";
import { DAY_MS } from "../../schedule.js";
import type { Item } from "../../market1/stats.js";
import type { Research } from "../../paper/research.js";
import type { Coins } from "../../waveh/coins.js";
import { sha256 } from "../../waveh/gate.js";
import { DATA_END, TEST_END, TEST_START } from "../../waveh/instants.js";
import { writeWhole } from "../../waveh/run.js";
import { StoreError } from "../../waveh/store.js";
import { trustedStore } from "../explore.js";
import { Step1 } from "../gates.js";
import { GATES, GATES_FILE } from "../library.js";
import { GateFailed } from "../run.js";
import type { Store } from "../store.js";
import {
  FAMILIES,
  adoptedOf,
  chooseOnC,
  refusedFor,
  type CheckOnC,
  type TryOnE,
} from "./choice.js";
import { checkPrices, dataFrom, type Data } from "./data.js";
import { cutsOf, featuresOf } from "./features.js";
import { C, E, STOP_MS, inPart, positionOf, type Entry } from "./parts.js";
import {
  B0,
  entriesAt,
  itemsOf,
  judged,
  place,
  ruleOf,
  stopExit,
  tryNamed,
  unpricedOf,
  type Rule,
} from "./rules.js";
import {
  C_FLOORS,
  E_FLOORS,
  dTest,
  floorsOf,
  footprintOk,
  gainFloor,
  statOf,
} from "./stats.js";
import {
  drySweep,
  grossOnMarks,
  priceAll,
  type Net,
  type Spec,
} from "./sweep.js";
import { CutsFile, TRIES, keeps } from "./trylog.js";

/** The steps' folder in the analyzer's folder of the range. */
export const EXPLORE = "explore";
export const STEPS = ["features", "e", "choice", "c"] as const;
export type StepName = (typeof STEPS)[number];

/** The look's EVERY SLICE pooled line on marks (WAVE-H's report.json, 2026-11-17): what B0 over TEST must reproduce. */
export type Expected = {
  /** A line of one cluster has no error (null). */
  everySlice: { positions: number; mean: number; se: number | null };
};
export const LOOK_EXPECTED: Expected = {
  everySlice: {
    positions: 176_986,
    mean: 66.13311166059404,
    se: 31.30967357566865,
  },
};

export type StepInput = {
  /** ANALYZER_ROOT, the analyzer's folder of the range. */
  root: string;
  /** WAVE-H's look folder (`step1.json`, `positions.jsonl.gz`). */
  look: string;
  coins: Coins;
  kit: Research;
  /** This program's fingerprint. */
  code: string;
  /** `polish/cuts.json`, the frozen cuts. */
  cutsFile: string;
  expect: Expected;
  pace: () => Promise<void>;
  log: (event: string, fields: object) => void;
};

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
/** What the steps read of `gates.json` beyond the library's `GatesFile`. */
const GatesRefs = z.object({
  references: z.object({ step1: SHA256, positions: SHA256 }),
  code: z.object({ fingerprint: SHA256 }),
});

export type Identity = {
  /** The store's manifest SHA-256, its id. */
  store: string;
  gates: string;
  /** The code that made the store (its manifest's) and that gated it (gates.json's): one. */
  storeCode: string;
  gatesCode: string;
  /** This program's fingerprint. */
  code: string;
  look: { step1: string; positions: string };
  /** B0's M, the look's (`step1.json`). */
  M: number;
};

/** The trusted store and the step's identity; unequal fingerprints of the store and its gates, or a look other than the one the gates read, are refused (exit 5). */
export function identityOf(o: StepInput): { store: Store; identity: Identity } {
  const store = trustedStore(o.root);
  const gatesText = readFileSync(path.join(o.root, GATES, GATES_FILE));
  const refs = GatesRefs.parse(JSON.parse(gatesText.toString("utf8")));
  if (refs.code.fingerprint !== store.manifest.code.fingerprint)
    throw new StoreError(
      `gates.json's code ${refs.code.fingerprint} is not the store's ${store.manifest.code.fingerprint}`,
    );
  const step1 = readFileSync(path.join(o.look, "step1.json"));
  if (sha256(step1) !== refs.references.step1)
    throw new StoreError("the look's step1.json is not the one the gates read");
  return {
    store,
    identity: {
      store: store.id,
      gates: sha256(gatesText),
      storeCode: store.manifest.code.fingerprint,
      gatesCode: refs.code.fingerprint,
      code: o.code,
      look: refs.references,
      M: Step1.parse(JSON.parse(step1.toString("utf8"))).M,
    },
  };
}

/** A step's clock and memory: each phase's seconds, and the process's sizes at its end. */
function meter(log: StepInput["log"]) {
  const t0 = Date.now();
  let t = t0;
  const seconds: Record<string, number> = {};
  const peaks: Record<string, Record<string, number>> = {};
  return {
    phase: (name: string) => {
      const m = process.memoryUsage();
      seconds[name] = Math.round((Date.now() - t) / 1000);
      peaks[name] = {
        rssMB: Math.round(m.rss / 2 ** 20),
        heapUsedMB: Math.round(m.heapUsed / 2 ** 20),
        externalMB: Math.round(m.external / 2 ** 20),
        arrayBuffersMB: Math.round(m.arrayBuffers / 2 ** 20),
        maxRssMB: Math.round(process.resourceUsage().maxRSS / 1024),
      };
      log("phase", { phase: name, seconds: seconds[name], ...peaks[name] });
      t = Date.now();
    },
    done: () => ({
      peaks,
      seconds: { ...seconds, all: Math.round((Date.now() - t0) / 1000) },
    }),
  };
}

/** Writes a step's output whole and returns its SHA-256. */
function writeOutput(o: StepInput, name: string, value: unknown): string {
  const text = `${JSON.stringify(value, null, 1)}\n`;
  writeWhole(path.join(o.root, EXPLORE, name), text);
  return sha256(text);
}

/** Positions of entries with a delay and a hold, as the sweep prices them. */
export const specsOf = (
  entries: readonly Entry[],
  delay = ENTRY_DELAY_MS,
  hold = HOLD_MS,
): Spec[] =>
  entries.map((e) => {
    const p = positionOf(e, delay, hold);
    return { iid: e.fill.iid, dir: p.dir, xIn: p.xIn, xOut: p.xOut };
  });

/** The legs the E step prices that its entries alone fix: B0's, D0's, D15's, D60's, H1–H12's and W2's (X1's exits are found from prices after the entry, so not here). */
export function fixedSpecs(d: Data, M: number): Spec[] {
  const inE = (all: readonly Entry[]) => all.filter((e) => inPart(E, e.fill.t));
  const b0 = inE(entriesAt(d, M).all);
  const out = specsOf(b0);
  for (const t of TRIES)
    if ("variant" in t && t.variant.target !== true && t.variant.M2 !== true)
      out.push(...specsOf(b0, t.variant.delay, t.variant.hold));
  out.push(...specsOf(inE(entriesAt(d, 2 * M).all)));
  return out;
}

/**
 * Run 1, `features` (no outcome): the forced fills held to the counted
 * fills and every minute price to legs.ts `minutePrice` (exit 6 otherwise);
 * B0's E entries; every filter's feature on them and the nine cuts; the dry
 * sweep of the E step's fixed legs. Writes `features.json`, then `cuts.json`
 * naming it.
 */
export async function featuresStep(o: StepInput) {
  const m = meter(o.log);
  const { store, identity } = identityOf(o);
  const d = dataFrom(store, o.coins, o.kit);
  m.phase("data");
  const prices = checkPrices(store, d);
  m.phase("prices");
  const { slices, all } = entriesAt(d, identity.M);
  const entries = all.filter((e) => inPart(E, e.fill.t));
  const features = featuresOf(d, {
    entries,
    slices,
    all,
    delay: ENTRY_DELAY_MS,
  });
  const cuts = cutsOf(d, features);
  m.phase("features");
  const dry = await drySweep(d, fixedSpecs(d, identity.M), o.pace);
  m.phase("dry sweep");
  const out = {
    step: "features",
    identity,
    counted: d.counted.length,
    forced: d.forced.t.length,
    prices,
    b0: { entries: all.length, E: entries.length },
    features: Object.fromEntries(
      [...features].map(([name, v]) => [
        name,
        { unknown: v.filter((x) => Number.isNaN(x)).length },
      ]),
    ),
    cuts,
    dry,
    ...m.done(),
    written: new Date().toISOString(),
  };
  const sha = writeOutput(o, "features.json", out);
  writeWhole(
    path.join(o.root, EXPLORE, "cuts.json"),
    `${JSON.stringify({ features: sha, cuts }, null, 2)}\n`,
  );
  return { sha, out };
}

/** A predecessor's output, its SHA-256 and value; missing, or of another identity (store, gates, code, look, M), not ready (exit 5). */
function readOutput(o: StepInput, name: string, identity: Identity) {
  let bytes: Buffer;
  try {
    bytes = readFileSync(path.join(o.root, EXPLORE, name));
  } catch {
    throw new StoreError(`no ${EXPLORE}\\${name}: run its step first`);
  }
  const value = JSON.parse(bytes.toString("utf8")) as Record<string, unknown>;
  if (!isDeepStrictEqual(value.identity, identity))
    throw new StoreError(
      `${EXPLORE}\\${name} is of another store, code or look`,
    );
  return { sha: sha256(bytes), value };
}

/** The committed `polish/cuts.json`, held to the features step's output and its cuts (else not ready). */
function readCuts(
  o: StepInput,
  features: { sha: string; value: Record<string, unknown> },
) {
  let bytes: Buffer;
  try {
    bytes = readFileSync(o.cutsFile);
  } catch {
    throw new StoreError(
      "no polish/cuts.json: commit the features step's cuts.json first",
    );
  }
  const c = CutsFile.parse(JSON.parse(bytes.toString("utf8")));
  if (
    c.features !== features.sha ||
    !isDeepStrictEqual(c.cuts, features.value.cuts)
  )
    throw new StoreError("polish/cuts.json is not the features step's cuts");
  return { sha: sha256(bytes), cuts: c.cuts };
}

/** A step's positions, a JSON line each, gzipped and written whole. */
function writePositions(o: StepInput, name: string, lines: readonly string[]) {
  writeWhole(
    path.join(o.root, EXPLORE, name),
    gzipSync(Buffer.from(lines.map((l) => `${l}\n`).join(""))),
  );
}

const LookLine = z.object({
  set: z.string(),
  spot: z.object({ t: z.number(), iid: z.number() }).loose(),
  priced: z
    .object({
      net: z.number().nullable(),
      legs: z.array(z.object({ source: z.string() }).loose().nullable()),
    })
    .loose()
    .nullable(),
});

/** The look's slice-0 TEST positions priced at the book at both ends: their book nets by the entry's instant and coin (`positions.jsonl.gz`, held to the SHA-256 the gates read). */
export function bookNets(look: string, want: string): Map<string, number> {
  const bytes = readFileSync(path.join(look, "positions.jsonl.gz"));
  if (sha256(bytes) !== want)
    throw new StoreError(
      "the look's positions.jsonl.gz is not the one the gates read",
    );
  const out = new Map<string, number>();
  for (const text of gunzipSync(bytes).toString("utf8").split("\n")) {
    if (text === "") continue;
    const l = LookLine.parse(JSON.parse(text));
    if (l.set !== "WAVE-H" || l.priced === null || l.priced.net === null)
      continue;
    if (l.priced.legs.every((g) => g?.source === "book"))
      out.set(`${l.spot.t}|${l.spot.iid}`, l.priced.net);
  }
  return out;
}

/** Q10's threshold: the nets are re-based when the tape beat the book by more than 10 bps. */
const REBASE_BPS = 10;

/** 4.7, the tape against the book: over slice 0's positions of the part that the look priced at the book at both ends, b = the mean of (tape net − book net), with its two-way error; the re-basing it sets. */
export function calibrationOf(
  kit: Research,
  entries: readonly Entry[],
  nets: readonly Net[],
  book: ReadonlyMap<string, number>,
) {
  const items: Item[] = [];
  let positions = 0;
  entries.forEach((e, i) => {
    const ref =
      e.slice === 0 ? book.get(`${e.fill.t}|${e.fill.iid}`) : undefined;
    if (ref === undefined) return;
    positions += 1;
    const n = nets[i]!.net;
    if (n !== null) items.push({ t: e.fill.t, iid: e.fill.iid, x: n - ref });
  });
  const stat = statOf(kit, items);
  return {
    positions,
    unpriced: positions - items.length,
    stat,
    rebasedBy: stat !== null && stat.mean > REBASE_BPS ? stat.mean : 0,
  };
}

/** Q11: B0 over TEST on marks (every slice's positions with t in TEST and x_out before DATA END) equals the look's EVERY SLICE pooled line, n exactly, m and SE to 1e-9 bps. */
export function reproductionOf(
  d: Data,
  all: readonly Entry[],
  expect: Expected,
) {
  const names = new Map(d.coins.list.map((c) => [c.assetId, c.name]));
  const inTest = all.filter(
    (e) => e.fill.t >= TEST_START && e.fill.t < TEST_END,
  );
  const items: Item[] = [];
  let positions = 0;
  specsOf(inTest).forEach((sp, i) => {
    if (sp.xOut >= DATA_END) return;
    positions += 1;
    const g = grossOnMarks(d, sp, names.get(sp.iid)!);
    if (!Number.isNaN(g))
      items.push({ t: inTest[i]!.fill.t, iid: sp.iid, x: g });
  });
  const s = statOf(d.kit, items);
  const want = expect.everySlice;
  return {
    equal:
      positions === want.positions &&
      s?.n === want.positions &&
      Math.abs(s.mean - want.mean) <= 1e-9 &&
      (s.se === null || want.se === null
        ? s.se === want.se
        : Math.abs(s.se - want.se) <= 1e-9),
    positions,
    onMarks: items.length,
    /** Only the comparison: B0's m and SE less the look's. */
    difference: {
      mean: s === null ? null : s.mean - want.mean,
      se: s?.se == null || want.se === null ? null : s.se - want.se,
    },
  };
}

/** A group's positions as lines (its entry, legs, net and gross on marks; B0's on E with its features), for the steps' positions files and the Final review's recomputation. */
function positionLines(
  d: Data,
  group: string,
  entries: readonly Entry[],
  specs: readonly Spec[],
  nets: readonly Net[],
  features?: ReadonlyMap<string, Float64Array>,
): string[] {
  const names = new Map(d.coins.list.map((c) => [c.assetId, c.name]));
  return specs.map((sp, i) => {
    const e = entries[i]!;
    const om = grossOnMarks(d, sp, names.get(sp.iid)!);
    return JSON.stringify({
      group,
      slice: e.slice,
      t: e.fill.t,
      iid: sp.iid,
      tid: e.fill.tid,
      dir: sp.dir,
      xIn: sp.xIn,
      xOut: sp.xOut,
      ...nets[i]!,
      onMarks: Number.isNaN(om) ? null : om,
      ...(features === undefined
        ? {}
        : Object.fromEntries(
            [...features].map(([k, v]) => [
              k,
              Number.isNaN(v[i]!) ? null : v[i]!,
            ]),
          )),
    });
  });
}

/** A group of positions the E step prices: its entries, their specs, those left out by reason. */
type Group = {
  name: string;
  entries: Entry[];
  specs: Spec[];
  left: Record<string, number>;
};

/**
 * The E step's numbers (POLISH-EXPLORE's plan 5.2, 4.7 and 6.3): the
 * reproduction first, then every group's legs in one sweep (B0, each
 * variant, X2), the calibration, B0, the 35 tries in the written order with
 * their D-tests against B0, X2 printed. A failed check throws GateFailed.
 */
export async function eOf(
  d: Data,
  o: {
    M: number;
    cuts: CutsFile["cuts"];
    book: ReadonlyMap<string, number>;
    expect: Expected;
    pace: () => Promise<void>;
    phase: (name: string) => void;
  },
) {
  const { slices, all } = entriesAt(d, o.M);
  const reproduction = reproductionOf(d, all, o.expect);
  if (!reproduction.equal)
    throw new GateFailed(
      `B0 over TEST on marks is not the look's EVERY SLICE line: ${JSON.stringify(reproduction)}`,
    );
  o.phase("reproduction");
  const entries = all.filter((e) => inPart(E, e.fill.t));
  const f = featuresOf(d, { entries, slices, all, delay: ENTRY_DELAY_MS });
  if (!isDeepStrictEqual(JSON.parse(JSON.stringify(cutsOf(d, f))), o.cuts))
    throw new GateFailed("the features' cuts on E are not polish/cuts.json's");
  o.phase("features");
  const names = new Map(d.coins.list.map((c) => [c.assetId, c.name]));
  const groups: Group[] = [
    { name: "B0", entries, specs: specsOf(entries), left: {} },
  ];
  for (const t of TRIES) {
    if (!("variant" in t)) continue;
    const v = t.variant;
    if (v.M2 === true || v.target === true) {
      const p = place(d, ruleOf(t.name, [t]), E, o.M, o.cuts);
      groups.push({ name: t.name, ...p });
    } else
      groups.push({
        name: t.name,
        entries,
        specs: specsOf(entries, v.delay, v.hold),
        left: {},
      });
  }
  const x2: Group = { name: "X2", entries: [], specs: [], left: {} };
  groups[0]!.specs.forEach((sp, i) => {
    const out = stopExit(
      d,
      d.pc.get(names.get(sp.iid)!)!,
      sp.dir,
      sp.xIn,
      sp.xOut,
    );
    if (out === null) x2.left["X2 unknown"] = (x2.left["X2 unknown"] ?? 0) + 1;
    else {
      x2.entries.push(entries[i]!);
      x2.specs.push({ ...sp, xOut: out });
    }
  });
  groups.push(x2);
  const priced = await priceAll(
    d,
    groups.flatMap((g) => g.specs),
    o.pace,
  );
  const nets = new Map<string, Net[]>();
  let at = 0;
  for (const g of groups) {
    nets.set(g.name, priced.slice(at, at + g.specs.length));
    at += g.specs.length;
  }
  o.phase("sweep");
  const b0Nets = nets.get("B0")!;
  const calibration = calibrationOf(d.kit, entries, b0Nets, o.book);
  const b = calibration.rebasedBy;
  const b0Items = itemsOf(entries, b0Nets, b);
  const b0Stat = statOf(d.kit, b0Items);
  const gain = gainFloor(b0Stat?.mean ?? 0);
  const tries = TRIES.map((t) => {
    let group: { entries: Entry[]; nets: Net[]; left: Record<string, number> };
    if ("filter" in t) {
      const v = f.get(t.name)!;
      const cut = o.cuts[t.name as keyof typeof o.cuts]?.value ?? null;
      const kept: number[] = [];
      let unknown = 0;
      entries.forEach((_, i) => {
        const k = keeps(t, v[i]!, cut);
        if (k === null) unknown += 1;
        else if (k) kept.push(i);
      });
      group = {
        entries: kept.map((i) => entries[i]!),
        nets: kept.map((i) => b0Nets[i]!),
        left: unknown > 0 ? { [`${t.name} unknown`]: unknown } : {},
      };
    } else {
      const g = groups.find((x) => x.name === t.name)!;
      group = { entries: g.entries, nets: nets.get(t.name)!, left: g.left };
    }
    const items = itemsOf(group.entries, group.nets, b);
    const { stat, test } = judged(d.kit, items, b0Items, b0Stat?.se ?? null);
    const onE: TryOnE = {
      name: t.name,
      family: t.family,
      order: t.order,
      adoptable: t.adoptable,
      d: test?.d ?? NaN,
      t: test?.t ?? null,
      floors:
        stat === null
          ? { mean: false, days: false, coins: false }
          : floorsOf(stat, E_FLOORS),
    };
    return {
      ...onE,
      kind: "filter" in t ? "F" : "V",
      seeded: t.seeded,
      venue: t.venue,
      positions: group.entries.length,
      priced: items.length,
      left: group.left,
      unpriced: unpricedOf(group.nets),
      stat,
      test,
      refused: refusedFor(onE, gain),
    };
  });
  o.phase("tries");
  const x2Items = itemsOf(x2.entries, nets.get("X2")!, b);
  const lines = groups.flatMap((g) =>
    positionLines(
      d,
      g.name,
      g.entries,
      g.specs,
      nets.get(g.name)!,
      g.name === "B0" ? f : undefined,
    ),
  );
  return {
    out: {
      reproduction,
      calibration,
      b0: {
        positions: entries.length,
        priced: b0Items.length,
        unpriced: unpricedOf(b0Nets),
        stat: b0Stat,
      },
      gain,
      tries,
      x2: {
        print: "X2 STOP, printed only (F15)",
        positions: x2.specs.length,
        priced: x2Items.length,
        left: x2.left,
        unpriced: unpricedOf(nets.get("X2")!),
        stat: statOf(d.kit, x2Items),
      },
    },
    lines,
  };
}

/** Run 2, `e`: features.json and the committed cuts held to each other; `eOf` on the store; `e-positions.jsonl.gz`, then `e.json`. */
export async function eStep(o: StepInput) {
  const m = meter(o.log);
  const { store, identity } = identityOf(o);
  const features = readOutput(o, "features.json", identity);
  const cuts = readCuts(o, features);
  const d = dataFrom(store, o.coins, o.kit);
  m.phase("data");
  const { out, lines } = await eOf(d, {
    M: identity.M,
    cuts: cuts.cuts,
    book: bookNets(o.look, identity.look.positions),
    expect: o.expect,
    pace: o.pace,
    phase: m.phase,
  });
  writePositions(o, "e-positions.jsonl.gz", lines);
  const value = {
    step: "e",
    identity,
    inputs: { features: features.sha, cuts: cuts.sha },
    ...out,
    ...m.done(),
    written: new Date().toISOString(),
  };
  return { sha: writeOutput(o, "e.json", value), out: value };
}

const Num = z.number().nullable();
const StatOut = z
  .object({ n: z.number(), mean: z.number(), se: Num })
  .loose()
  .nullable();
/** What the choice and C steps read of `e.json` (our own file: one that does not parse throws). */
export const EFile = z.object({
  calibration: z.object({ rebasedBy: z.number() }).loose(),
  b0: z.object({ stat: StatOut }).loose(),
  gain: z.number(),
  tries: z.array(
    z
      .object({
        name: z.string(),
        family: z.enum(FAMILIES),
        order: z.number(),
        adoptable: z.boolean(),
        d: Num,
        t: Num,
        floors: z.object({
          mean: z.boolean(),
          days: z.boolean(),
          coins: z.boolean(),
        }),
        stat: StatOut,
      })
      .loose(),
  ),
});
export type EFile = z.infer<typeof EFile>;

/** e.json's tries as the choice rule reads them (a D-test without a value is NaN, never adopted). */
export const triesOnE = (e: EFile): TryOnE[] =>
  e.tries.map((t) => ({
    name: t.name,
    family: t.family,
    order: t.order,
    adoptable: t.adoptable,
    d: t.d ?? NaN,
    t: t.t,
    floors: t.floors,
  }));

/**
 * The choice's numbers (POLISH-EXPLORE's plan 5.3): the changes adopted on
 * E, largest t first; N, B0 with them together, placed and priced on E in
 * its own sweep, its numbers printed (they test nothing) with its k for C
 * (SE_N ÷ SE_B0 on E). Nothing adopted: N is B0, and nothing is priced.
 */
export async function choiceOf(
  d: Data,
  o: {
    M: number;
    cuts: CutsFile["cuts"];
    e: EFile;
    pace: () => Promise<void>;
  },
) {
  const adopted = adoptedOf(triesOnE(o.e), o.e.gain);
  if (adopted.length === 0)
    return { adopted: [], rule: B0, N: null, lines: [] as string[] };
  const rule = ruleOf(
    "N",
    adopted.map((t) => tryNamed(t.name)),
  );
  const p = place(d, rule, E, o.M, o.cuts);
  const nets = await priceAll(d, p.specs, o.pace);
  const items = itemsOf(p.entries, nets, o.e.calibration.rebasedBy);
  const stat = statOf(d.kit, items);
  const seB0 = o.e.b0.stat?.se ?? null;
  return {
    adopted: adopted.map((t) => ({
      name: t.name,
      family: t.family,
      t: t.t,
      d: t.d,
    })),
    rule,
    N: {
      positions: p.specs.length,
      priced: items.length,
      left: p.left,
      unpriced: unpricedOf(nets),
      stat,
      /** k for N's D-test on C: SE_N ÷ SE_B0, both on E. */
      k: stat?.se != null && seB0 ? stat.se / seB0 : null,
    },
    lines: positionLines(d, "N", p.entries, p.specs, nets),
  };
}

/** Run 3, `choice`: e.json held to this identity; `choiceOf`; `choice-positions.jsonl.gz`, then `choice.json`. */
export async function choiceStep(o: StepInput) {
  const m = meter(o.log);
  const { store, identity } = identityOf(o);
  const e = readOutput(o, "e.json", identity);
  const features = readOutput(o, "features.json", identity);
  const cuts = readCuts(o, features);
  const d = dataFrom(store, o.coins, o.kit);
  m.phase("data");
  const { lines, ...out } = await choiceOf(d, {
    M: identity.M,
    cuts: cuts.cuts,
    e: EFile.parse(e.value),
    pace: o.pace,
  });
  m.phase("N on E");
  writePositions(o, "choice-positions.jsonl.gz", lines);
  const value = {
    step: "choice",
    identity,
    inputs: { e: e.sha, cuts: cuts.sha },
    ...out,
    note: "N's numbers on E test nothing; N's only test is C (F5)",
    ...m.done(),
    written: new Date().toISOString(),
  };
  return { sha: writeOutput(o, "choice.json", value), out: value };
}

/** What the C step reads of `choice.json`. */
export const ChoiceFile = z.object({
  adopted: z.array(z.object({ name: z.string() }).loose()),
  rule: z.object({
    name: z.string(),
    M2: z.boolean(),
    delay: z.number(),
    hold: z.number(),
    target: z.boolean(),
    filters: z.array(z.string()),
  }),
  N: z.object({ k: Num }).loose().nullable(),
});
export type ChoiceFile = z.infer<typeof ChoiceFile>;

/** C's entry days: from its start to 50 hours before its end, 146 (F2's footprint windows start on days 0 to 46). */
export const C_DAYS = Math.ceil((C.end - STOP_MS - C.start) / DAY_MS);

/**
 * The check's numbers (POLISH-EXPLORE's plan 5.4; decisions 2026-11-18,
 * "POLISH-EXPLORE's plan approved", 3): B0 on C first (its m, SE and z,
 * deciding nothing, exempt from the floors); then at most two evaluations,
 * each placed, priced and computed only when its turn comes: N, then, when
 * N fails and more than one change was adopted, the adopted change with the
 * largest t on E alone. Each: the D-test against B0 with k from E (C's own
 * k beside), F2's floors and the 100-day footprint, its share left out
 * (Q13, a print). B0 goes when none passes.
 */
export async function cOf(
  d: Data,
  o: {
    M: number;
    cuts: CutsFile["cuts"];
    e: EFile;
    choice: ChoiceFile;
    pace: () => Promise<void>;
  },
) {
  const b = o.e.calibration.rebasedBy;
  const lines: string[] = [];
  const on = async (rule: Rule, group: string) => {
    const p = place(d, rule, C, o.M, o.cuts);
    const nets = await priceAll(d, p.specs, o.pace);
    lines.push(...positionLines(d, group, p.entries, p.specs, nets));
    return { p, nets, items: itemsOf(p.entries, nets, b) };
  };
  const b0 = await on(B0, "B0");
  const b0Stat = statOf(d.kit, b0.items);
  const seB0 = o.e.b0.stat?.se ?? null;
  const evaluate = async (
    name: string,
  ): Promise<CheckOnC & Record<string, unknown>> => {
    const rule =
      name === "N" ? (o.choice.rule as Rule) : ruleOf(name, [tryNamed(name)]);
    const seE = o.e.tries.find((t) => t.name === name)?.stat?.se ?? null;
    const k =
      name === "N"
        ? (o.choice.N?.k ?? null)
        : seE !== null && seB0
          ? seE / seB0
          : null;
    const r = await on(rule, name);
    const stat = statOf(d.kit, r.items);
    const test = k === null ? null : dTest(r.items, b0.items, k);
    const left = Object.values(r.p.left).reduce((s, x) => s + x, 0);
    return {
      rule: name,
      t: test?.t ?? null,
      floors: {
        ...(stat === null
          ? { mean: false, days: false, coins: false }
          : floorsOf(stat, C_FLOORS)),
        footprint: footprintOk(r.items, C.start, C_DAYS),
      },
      definition: rule,
      positions: r.p.specs.length,
      priced: r.items.length,
      left: r.p.left,
      leftShare: left / (left + r.p.specs.length || 1),
      unpriced: unpricedOf(r.nets),
      stat,
      test,
      ownK: stat?.se != null && b0Stat?.se ? stat.se / b0Stat.se : null,
    };
  };
  const adopted = triesOnE(o.e).filter((t) =>
    o.choice.adopted.some((a) => a.name === t.name),
  );
  adopted.sort(
    (x, y) => (y.t ?? -Infinity) - (x.t ?? -Infinity) || x.order - y.order,
  );
  const { goes, evaluations } = await chooseOnC(adopted, evaluate);
  const rule =
    goes === "B0"
      ? B0
      : goes === "N"
        ? (o.choice.rule as Rule)
        : ruleOf(goes, [tryNamed(goes)]);
  return {
    out: {
      b0: {
        print: "B0 on C: decides nothing, exempt from the floors (F2)",
        positions: b0.p.specs.length,
        priced: b0.items.length,
        unpriced: unpricedOf(b0.nets),
        stat: b0Stat,
      },
      evaluations,
      goes,
      rule,
    },
    lines,
  };
}

/** Run 4, `c`: choice.json held to this identity and naming the current e.json; `cOf`; `c-positions.jsonl.gz`, then `c.json`. */
export async function cStep(o: StepInput) {
  const m = meter(o.log);
  const { store, identity } = identityOf(o);
  const e = readOutput(o, "e.json", identity);
  const choice = readOutput(o, "choice.json", identity);
  if ((choice.value.inputs as { e?: string } | undefined)?.e !== e.sha)
    throw new StoreError(
      `${EXPLORE}\\choice.json is not of the current e.json`,
    );
  const features = readOutput(o, "features.json", identity);
  const cuts = readCuts(o, features);
  const d = dataFrom(store, o.coins, o.kit);
  m.phase("data");
  const { out, lines } = await cOf(d, {
    M: identity.M,
    cuts: cuts.cuts,
    e: EFile.parse(e.value),
    choice: ChoiceFile.parse(choice.value),
    pace: o.pace,
  });
  m.phase("C");
  writePositions(o, "c-positions.jsonl.gz", lines);
  const value = {
    step: "c",
    identity,
    inputs: { e: e.sha, choice: choice.sha, cuts: cuts.sha },
    ...out,
    ...m.done(),
    written: new Date().toISOString(),
  };
  return { sha: writeOutput(o, "c.json", value), out: value };
}

/** Runs one step by its name. */
export async function runStep(step: StepName, o: StepInput) {
  switch (step) {
    case "features":
      return featuresStep(o);
    case "e":
      return eStep(o);
    case "choice":
      return choiceStep(o);
    case "c":
      return cStep(o);
  }
}
