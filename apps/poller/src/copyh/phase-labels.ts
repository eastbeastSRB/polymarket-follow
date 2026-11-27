/**
 * The label phase, LABELS, and its large lane, LABELS-L (copyh/rules.md C5,
 * C2; the engine's plan, section 1; the supervisor's two-lane ruling,
 * 2026-11-26), on engine.ts.
 * - A LABELS part: one account bucket and a block of the step's Mondays.
 *   Each account of the bucket in the reading, but the vault accounts (C2,
 *   named), at each Monday M of the block: its capture's fills counted
 *   first from the store's columns, no row made — none in the kit's 14 days
 *   before M, "no fills in window"; above LABEL_FILLS_MAX, "too many fills
 *   for the kit", never P1, named with its count; above the normal lane's
 *   threshold, deferred to LABELS-L, named with its count; else the kit's
 *   label on C5's capture.
 * - A LABELS-L part: the deferred (account, Monday) pairs of one LABELS
 *   part, one capture in memory at a time, its rows dropped before the kit
 *   runs; the phase runs alone on the machine at the heap cap.
 * - A part's bytes: per Monday, the accounts by label, the P1 accounts
 *   (directional, the label window covered), those too large and those
 *   deferred, each with its capture's fills. The labels a later phase reads
 *   are LABELS' and LABELS-L's together: the lanes change no output (a test
 *   runs the threshold at 0 and at none).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { DAY_MS } from "../schedule.js";
import { readBucket, vaultsOf, type AccountView } from "./accounts.js";
import { ARCHIVE_START, BUCKETS, LABEL_CAPTURE_DAYS } from "./design.js";
import { DirsFile, kindsOf } from "./dirs.js";
import type { PartFunction, PartSpec, PhaseRecord } from "./engine.js";
import { partBytes } from "./engine.js";
import {
  NO_FILLS,
  TOO_LARGE,
  boundedCapture,
  coverageAt,
  isP1,
  labelOf,
} from "./labels.js";
import { normOf } from "./normalize.js";
import { StoreError, sha256 } from "./run.js";
import type { Seal } from "./seal.js";
import { MANIFEST, openStore, type Store } from "./store.js";

/** The Mondays of a LABELS part (a part constant: it decides nothing). */
export const LABELS_BLOCK = 8;
/** The normal lane's capture at most: a market maker's capture there fits within half of an 8 GB heap (the kit's 0.77 KB a fill and the reader's 0.25 KB, COPYH-ENGINE's measure, 2026-11-26). Never scaled by the heap: a part's inputs hold it, so a heap raised in a step would make its closed phases of other inputs (COPYH-ENGINE-REVIEW-2 M1). */
export const LANE_LABEL_FILLS = 3_500_000;

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
/** Where a phase reads the step's reading: its stores' folders in time order, the run's roots, dirs.json. */
export const ReadingContext = z.object({
  stores: z.array(z.string()),
  roots: z.array(z.string()),
  dirsFile: z.string(),
});
export type ReadingContext = z.infer<typeof ReadingContext>;
/** A reading's identity: its stores' manifests and dirs.json, by SHA-256. */
export const ReadingInputs = z.object({
  stores: z.array(SHA256),
  dirs: SHA256,
});
export type ReadingInputs = z.infer<typeof ReadingInputs>;

/** The reading's stores and dirs.json's kinds, each held to the part's inputs. */
export function heldReading(
  context: unknown,
  inputs: ReadingInputs,
  seal: Seal,
): { stores: Store[]; kinds: ReturnType<typeof kindsOf> } {
  const c = ReadingContext.parse(context);
  if (c.stores.length !== inputs.stores.length)
    throw new StoreError("the reading's stores are not its part's");
  const stores = c.stores.map((dir, i) => {
    const s = openStore(dir, c.roots, seal);
    if (sha256(readFileSync(path.join(dir, MANIFEST))) !== inputs.stores[i])
      throw new StoreError(`${dir}: its manifest is not its part's`);
    return s;
  });
  const dirs = readFileSync(c.dirsFile);
  if (sha256(dirs) !== inputs.dirs)
    throw new StoreError(`${c.dirsFile} is not its part's`);
  return {
    stores,
    kinds: kindsOf(DirsFile.parse(JSON.parse(dirs.toString("utf8")))),
  };
}

export const LabelsInputs = ReadingInputs.extend({
  code: z.string(),
  bucket: z
    .number()
    .int()
    .min(0)
    .max(BUCKETS - 1),
  mondays: z.array(z.number()),
  fillsMax: z.number(),
  /** The normal lane's capture at most; null: none (every capture in this lane). JSON holds no Infinity. */
  lane: z.number().nullable(),
});
export type LabelsInputs = z.infer<typeof LabelsInputs>;

/** One Monday's labels of a part. */
export const MondayLabels = z.object({
  M: z.number(),
  counts: z.record(z.string(), z.number()),
  p1: z.array(z.string()),
  tooLarge: z.array(z.tuple([z.string(), z.number()])),
  deferred: z.array(z.tuple([z.string(), z.number()])),
});
export type MondayLabels = z.infer<typeof MondayLabels>;
export const LabelsPart = z.object({
  vaults: z.array(z.string()),
  mondays: z.array(MondayLabels),
});
export type LabelsPart = z.infer<typeof LabelsPart>;

const captureStart = (M: number) =>
  Math.max(ARCHIVE_START, M - LABEL_CAPTURE_DAYS * DAY_MS);
const encode = (v: unknown) => new TextEncoder().encode(JSON.stringify(v));

/** The label of one account at M, by its capture's count first: what C5 says, or "deferred" past the lane. */
function labelAt(
  ctx: Parameters<PartFunction>[1],
  view: AccountView,
  M: number,
  i: { fillsMax: number; lane: number | null },
): { label: string; fills: number } | { deferred: number } {
  const days = ctx.kit.labels.LABEL_DAYS * DAY_MS;
  if (view.count(M - days, M) === 0) return { label: NO_FILLS, fills: 0 };
  const fills = view.count(captureStart(M), M);
  if (fills > i.fillsMax) return { label: TOO_LARGE, fills };
  if (i.lane !== null && fills > i.lane) return { deferred: fills };
  const capture = boundedCapture(normOf(view.rows(captureStart(M), M)), M);
  return { label: labelOf(ctx.kit, capture, M, i.fillsMax), fills };
}

/** LABELS's function (engine.ts `PartFunction`). */
export const labelsPart: PartFunction = (inputs, ctx) => {
  const i = LabelsInputs.parse(inputs);
  const { stores, kinds } = heldReading(ctx.context, i, ctx.seal);
  const vaults = vaultsOf(stores);
  const views = readBucket(
    stores,
    i.bucket,
    { from: captureStart(i.mondays[0]!), to: i.mondays.at(-1)! },
    kinds,
  ).filter((v) => !vaults.has(v.addr));
  const mondays = i.mondays.map((M): MondayLabels => {
    const day: MondayLabels = {
      M,
      counts: {},
      p1: [],
      tooLarge: [],
      deferred: [],
    };
    for (const view of views) {
      const r = labelAt(ctx, view, M, i);
      if ("deferred" in r) {
        day.deferred.push([view.addr, r.deferred]);
        continue;
      }
      day.counts[r.label] = (day.counts[r.label] ?? 0) + 1;
      if (r.label === TOO_LARGE) day.tooLarge.push([view.addr, r.fills]);
      if (isP1(r.label, coverageAt(ctx.kit, M))) day.p1.push(view.addr);
    }
    return day;
  });
  const bucketVaults = [...vaults]
    .filter((a) => Number.parseInt(a.slice(-2), 16) === i.bucket)
    .sort();
  return encode({ vaults: bucketVaults, mondays } satisfies LabelsPart);
};

export const LargeInputs = LabelsInputs.extend({
  /** The deferred pairs of its LABELS part: [account, M]. */
  deferred: z.array(z.tuple([z.string(), z.number()])),
});
export type LargeInputs = z.infer<typeof LargeInputs>;

/** LABELS-L's function: each deferred (account, M) alone, by C5 (the lane at none). */
export const labelsLargePart: PartFunction = (inputs, ctx) => {
  const i = LargeInputs.parse(inputs);
  const { stores, kinds } = heldReading(ctx.context, i, ctx.seal);
  const byM = new Map<number, MondayLabels>(
    i.mondays.map((M) => [
      M,
      { M, counts: {}, p1: [], tooLarge: [], deferred: [] },
    ]),
  );
  for (const [addr, M] of i.deferred) {
    const view = readBucket(
      stores,
      i.bucket,
      { from: captureStart(M), to: M },
      kinds,
    ).find((v) => v.addr === addr);
    if (view === undefined)
      throw new StoreError(
        `${addr}: deferred at ${M}, and not in its bucket's reading`,
      );
    const r = labelAt(ctx, view, M, { fillsMax: i.fillsMax, lane: null });
    if ("deferred" in r) throw new Error("the large lane defers nothing");
    const day = byM.get(M)!;
    day.counts[r.label] = (day.counts[r.label] ?? 0) + 1;
    if (r.label === TOO_LARGE) day.tooLarge.push([addr, r.fills]);
    if (isP1(r.label, coverageAt(ctx.kit, M))) day.p1.push(addr);
  }
  return encode({
    vaults: [],
    mondays: [...byM.values()],
  } satisfies LabelsPart);
};

/** LABELS's parts: every bucket, each block of LABELS_BLOCK Mondays. */
export function labelsParts(o: {
  code: string;
  reading: ReadingInputs;
  mondays: readonly number[];
  fillsMax: number;
  lane: number | null;
}): PartSpec[] {
  const out: PartSpec[] = [];
  for (let bucket = 0; bucket < BUCKETS; bucket++)
    for (let k = 0; k < o.mondays.length; k += LABELS_BLOCK)
      out.push({
        id: `b${String(bucket).padStart(3, "0")}-m${String(k).padStart(3, "0")}`,
        inputs: {
          ...o.reading,
          code: o.code,
          bucket,
          mondays: o.mondays.slice(k, k + LABELS_BLOCK),
          fillsMax: o.fillsMax,
          lane: o.lane,
        } satisfies LabelsInputs,
      });
  return out;
}

/** A closed LABELS phase's parts, read back. */
export function labelsOf(
  dir: string,
  record: PhaseRecord,
): Map<string, LabelsPart> {
  return new Map(
    record.parts.map(([id]) => [
      id,
      LabelsPart.parse(JSON.parse(partBytes(dir, record, id).toString("utf8"))),
    ]),
  );
}

/** LABELS-L's parts: one for each LABELS part that deferred a capture. */
export function largeParts(
  parts: readonly PartSpec[],
  labels: ReadonlyMap<string, LabelsPart>,
): PartSpec[] {
  return parts.flatMap((p) => {
    const deferred = labels
      .get(p.id)!
      .mondays.flatMap((d) =>
        d.deferred.map(([addr]): [string, number] => [addr, d.M]),
      );
    return deferred.length === 0
      ? []
      : [
          {
            id: p.id,
            inputs: {
              ...(p.inputs as LabelsInputs),
              deferred,
            } satisfies LargeInputs,
          },
        ];
  });
}
