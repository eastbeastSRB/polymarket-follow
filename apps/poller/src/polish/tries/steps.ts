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
import { z } from "zod";
import { ENTRY_DELAY_MS, HOLD_MS } from "../../market1/price.js";
import type { Research } from "../../paper/research.js";
import type { Coins } from "../../waveh/coins.js";
import { sha256 } from "../../waveh/gate.js";
import { writeWhole } from "../../waveh/run.js";
import { bySlice } from "../../waveh/slices.js";
import { StoreError } from "../../waveh/store.js";
import { trustedStore } from "../explore.js";
import { Step1 } from "../gates.js";
import { GATES, GATES_FILE } from "../library.js";
import type { Store } from "../store.js";
import { checkPrices, dataFrom, type Data } from "./data.js";
import { cutsOf, featuresOf } from "./features.js";
import { E, entriesOf, inPart, positionOf, type Entry } from "./parts.js";
import { drySweep, type Spec } from "./sweep.js";
import { TRIES } from "./trylog.js";

/** The steps' folder in the analyzer's folder of the range. */
export const EXPLORE = "explore";
export const STEPS = ["features"] as const;
export type StepName = (typeof STEPS)[number];

/** The look's EVERY SLICE pooled line on marks (WAVE-H's report.json, 2026-11-17): what B0 over TEST must reproduce. */
export type Expected = {
  everySlice: { positions: number; mean: number; se: number };
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
    phase(name: string) {
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

/** B0's entries for the store's M: every slice's (H4's order from the first file), those of a part kept by the caller. */
export function entriesFor(d: Data, M: number) {
  const slices = bySlice(d.counted, M);
  return { slices, all: entriesOf(slices) };
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
  const b0 = inE(entriesFor(d, M).all);
  const out = specsOf(b0);
  for (const t of TRIES)
    if ("variant" in t && t.variant.target !== true && t.variant.M2 !== true)
      out.push(...specsOf(b0, t.variant.delay, t.variant.hold));
  out.push(...specsOf(inE(entriesFor(d, 2 * M).all)));
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
  const { slices, all } = entriesFor(d, identity.M);
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

/** Runs one step by its name. */
export async function runStep(step: StepName, o: StepInput) {
  switch (step) {
    case "features":
      return featuresStep(o);
  }
}
