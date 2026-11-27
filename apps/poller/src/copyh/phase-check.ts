/**
 * The rehearsal's two checks on real months (copyh/rules.md C15 (c) 5 and 7;
 * the supervisor's rulings of 2026-11-27 08:31Z), on engine.ts, every part
 * twice, after the unpriced phases and before any price:
 * - KIT (C15 (c) 5, M4): one part, the account with the most exit rows under
 *   EXITS_MAX among those BUILD and BUILD-L built (every one P1 at some
 *   Monday of the stage), its history through the kit alone, as BUILD runs
 *   it: the kit's time and memory are the part's two runs, one child at the
 *   heap the account's lane ran at; its bytes the history's counts, which
 *   the two copies hold equal.
 * - LABELCHECK and LABELCHECK-L (C15 (c) 7, M3): the label bound's check, a
 *   part a bucket of the check's slice and one of its Mondays. Each account
 *   but the vault accounts (C2), at each Monday M: its label from C5's
 *   90-day capture and from the whole capture from ARCHIVE_START, and MAIN's
 *   account-level conditions (C7) under each, its habits from its fills
 *   before M (the same under both). An account with no fill in the kit's 14
 *   days before M is "no fills in window" under both; a whole capture above
 *   LABEL_FILLS_MAX is counted apart, never as a difference of the bound;
 *   one past the normal lane's threshold is deferred to LABELCHECK-L, one
 *   child at the heap cap, a capture in memory at a time. Every difference of
 *   a label or of MAIN is listed.
 */
import { z } from "zod";
import { DAY_MS } from "../schedule.js";
import { readBucket, vaultsOf, type AccountView } from "./accounts.js";
import { ARCHIVE_START, BUCKETS } from "./design.js";
import type { PartFunction, PartSpec, PhaseRecord } from "./engine.js";
import { partBytes } from "./engine.js";
import { historyOf } from "./entries.js";
import {
  boundedCapture,
  coverageAt,
  habitsBefore,
  isP1,
  labelOf,
} from "./labels.js";
import { accountLines } from "./lines.js";
import { normOf } from "./normalize.js";
import { ReadingInputs, captureStart, heldReading } from "./phase-labels.js";
import { StoreError } from "./run.js";

const encode = (v: unknown) => new TextEncoder().encode(JSON.stringify(v));
const Bucket = z
  .number()
  .int()
  .min(0)
  .max(BUCKETS - 1);
/** An account's bucket: its address's last two hex digits (C3). */
export const bucketOf = (addr: string): number =>
  Number.parseInt(addr.slice(-2), 16);

export const KitInputs = ReadingInputs.extend({
  code: z.string(),
  addr: z.string(),
  bucket: Bucket,
  end: z.number(),
  limits: z.object({ fills: z.number(), exits: z.number() }),
});
export type KitInputs = z.infer<typeof KitInputs>;
/** KIT's bytes: the history's counts. */
export const KitPart = z.object({
  addr: z.string(),
  fills: z.number(),
  events: z.number(),
  cycles: z.number(),
  groups: z.number(),
  exitRows: z.number(),
});
export type KitPart = z.infer<typeof KitPart>;

/** KIT's function (engine.ts `PartFunction`): the account's fills to END through the kit's history, as BUILD's (C4), its rows dropped before the kit runs. */
export const kitPart: PartFunction = (inputs, ctx) => {
  const i = KitInputs.parse(inputs);
  const { stores, kinds } = heldReading(ctx.context, i, ctx.seal);
  const start = stores[0]!.manifest.start;
  const view = readBucket(
    stores,
    i.bucket,
    { from: start, to: i.end },
    kinds,
  ).find((v) => v.addr === i.addr);
  if (view === undefined)
    throw new StoreError(`${i.addr}: not in its bucket's reading`);
  const rows = view.rows(start, i.end);
  const fills = rows.length;
  const normed = normOf(rows);
  rows.length = 0;
  const built = historyOf(ctx.kit, normed, i.limits);
  if (built.kind !== "built")
    throw new StoreError(`${i.addr}: ${built.kind}, which BUILD built`);
  const h = built.history;
  return encode({
    addr: i.addr,
    fills,
    events: h.events.length,
    cycles: h.cycles.length,
    groups: h.groups.length,
    exitRows: h.exitRows,
  } satisfies KitPart);
};

/** KIT's one part. */
export const kitParts = (o: KitInputs): PartSpec[] => [
  { id: "kit", inputs: o },
];

export const CheckInputs = ReadingInputs.extend({
  code: z.string(),
  bucket: Bucket,
  mondays: z.array(z.number()),
  fillsMax: z.number(),
  /** The normal lane's whole capture at most; null: none (LABELCHECK-L). JSON holds no Infinity. */
  lane: z.number().nullable(),
});
export type CheckInputs = z.infer<typeof CheckInputs>;
export const CheckLargeInputs = CheckInputs.extend({
  /** The deferred pairs of its LABELCHECK part: [account, M]. */
  deferred: z.array(z.tuple([z.string(), z.number()])),
});
export type CheckLargeInputs = z.infer<typeof CheckLargeInputs>;

/** A difference of the bound: [account, its 90-day label, its whole capture's, MAIN under each]. */
const Difference = z.tuple([
  z.string(),
  z.string(),
  z.string(),
  z.boolean(),
  z.boolean(),
]);
/** One Monday of a check part. */
export const MondayCheck = z.object({
  M: z.number(),
  /** The accounts labelled under both captures. */
  checked: z.number(),
  /** Of them, those meeting MAIN's account-level conditions under the 90-day capture, and under the whole. */
  main90: z.number(),
  mainWhole: z.number(),
  differ: z.array(Difference),
  /** The whole capture above LABEL_FILLS_MAX, counted apart: [account, its fills]. */
  apart: z.array(z.tuple([z.string(), z.number()])),
  /** The whole capture past the normal lane's threshold, to LABELCHECK-L: [account, its fills]. */
  deferred: z.array(z.tuple([z.string(), z.number()])),
});
export type MondayCheck = z.infer<typeof MondayCheck>;
export const CheckPart = z.object({ mondays: z.array(MondayCheck) });
export type CheckPart = z.infer<typeof CheckPart>;

const emptyMonday = (M: number): MondayCheck => ({
  M,
  checked: 0,
  main90: 0,
  mainWhole: 0,
  differ: [],
  apart: [],
  deferred: [],
});

/** One account at M under both captures, into its Monday's check. */
function checkAt(
  ctx: Parameters<PartFunction>[1],
  view: AccountView,
  day: MondayCheck,
  i: { fillsMax: number; lane: number | null },
): void {
  const M = day.M;
  const kit = ctx.kit;
  if (view.count(M - kit.labels.LABEL_DAYS * DAY_MS, M) === 0) {
    day.checked += 1;
    return;
  }
  const whole = view.count(ARCHIVE_START, M);
  if (whole > i.fillsMax) {
    day.apart.push([view.addr, whole]);
    return;
  }
  if (i.lane !== null && whole > i.lane) {
    day.deferred.push([view.addr, whole]);
    return;
  }
  // The 90-day capture as LABELS reads it (its rows alone normalized); the whole from ARCHIVE_START.
  const label90 = labelOf(
    kit,
    boundedCapture(normOf(view.rows(captureStart(M), M)), M),
    M,
    i.fillsMax,
  );
  const fills = normOf(view.rows(ARCHIVE_START, M));
  const labelWhole = labelOf(
    kit,
    { fills, pages: 0, truncated: true, oldest: ARCHIVE_START },
    M,
    i.fillsMax,
  );
  const coverage = coverageAt(kit, M);
  let main90 = false;
  let mainWhole = false;
  if (isP1(label90, coverage) || isP1(labelWhole, coverage)) {
    const habits = habitsBefore(kit, fills, M);
    main90 = accountLines(label90, habits, coverage).MAIN;
    mainWhole = accountLines(labelWhole, habits, coverage).MAIN;
  }
  day.checked += 1;
  if (main90) day.main90 += 1;
  if (mainWhole) day.mainWhole += 1;
  if (label90 !== labelWhole || main90 !== mainWhole)
    day.differ.push([view.addr, label90, labelWhole, main90, mainWhole]);
}

/** LABELCHECK's function (engine.ts `PartFunction`). */
export const labelCheckPart: PartFunction = (inputs, ctx) => {
  const i = CheckInputs.parse(inputs);
  const { stores, kinds } = heldReading(ctx.context, i, ctx.seal);
  const vaults = vaultsOf(stores);
  const views = readBucket(
    stores,
    i.bucket,
    { from: ARCHIVE_START, to: i.mondays.at(-1)! },
    kinds,
  ).filter((v) => !vaults.has(v.addr));
  const mondays = i.mondays.map((M) => {
    const day = emptyMonday(M);
    for (const view of views) checkAt(ctx, view, day, i);
    return day;
  });
  return encode({ mondays } satisfies CheckPart);
};

/** LABELCHECK-L's function: each deferred (account, M) alone, the lane at none. */
export const labelCheckLargePart: PartFunction = (inputs, ctx) => {
  const i = CheckLargeInputs.parse(inputs);
  const { stores, kinds } = heldReading(ctx.context, i, ctx.seal);
  const byM = new Map(i.mondays.map((M) => [M, emptyMonday(M)]));
  for (const [addr, M] of i.deferred) {
    const view = readBucket(
      stores,
      i.bucket,
      { from: ARCHIVE_START, to: M },
      kinds,
    ).find((v) => v.addr === addr);
    if (view === undefined)
      throw new StoreError(
        `${addr}: deferred at ${M}, and not in its bucket's reading`,
      );
    checkAt(ctx, view, byM.get(M)!, { fillsMax: i.fillsMax, lane: null });
  }
  return encode({ mondays: [...byM.values()] } satisfies CheckPart);
};

/** LABELCHECK's parts: one a bucket of the check's and a Monday (a whole capture is up to four times a LABELS part's 90 days: a part stays well inside a run). */
export const labelCheckParts = (
  o: Omit<CheckInputs, "bucket" | "mondays">,
  buckets: readonly number[],
  mondays: readonly number[],
): PartSpec[] =>
  buckets.flatMap((bucket) =>
    mondays.map((M, k) => ({
      id: `b${String(bucket).padStart(3, "0")}-m${String(k).padStart(3, "0")}`,
      inputs: { ...o, bucket, mondays: [M] } satisfies CheckInputs,
    })),
  );

/** A closed check phase's parts, read back. */
export const checksOf = (dir: string, record: PhaseRecord): CheckPart[] =>
  record.parts.map(([id]) =>
    CheckPart.parse(JSON.parse(partBytes(dir, record, id).toString("utf8"))),
  );

/** LABELCHECK-L's parts: one for each LABELCHECK part that deferred a capture. */
export function largeCheckParts(
  parts: readonly PartSpec[],
  checks: readonly CheckPart[],
): PartSpec[] {
  return parts.flatMap((p, k) => {
    const deferred = checks[k]!.mondays.flatMap((d) =>
      d.deferred.map(([addr]): [string, number] => [addr, d.M]),
    );
    return deferred.length === 0
      ? []
      : [
          {
            id: p.id,
            inputs: {
              ...(p.inputs as CheckInputs),
              lane: null,
              deferred,
            } satisfies CheckLargeInputs,
          },
        ];
  });
}

/** The label bound's check over its parts (C15 (c) 7): at each Monday the accounts checked, those meeting MAIN under each capture, every difference, those counted apart and deferred; it passes when the accounts meeting MAIN under one capture and not the other number under `passMark` of those meeting it under the whole (none differing passes). */
export function labelCheckOf(
  parts: readonly CheckPart[],
  mondays: readonly number[],
  passMark: number,
) {
  const by = mondays.map((M) => {
    const days = parts.flatMap((p) => p.mondays.filter((d) => d.M === M));
    const differ = days.flatMap((d) => d.differ);
    const mainWhole = days.reduce((s, d) => s + d.mainWhole, 0);
    const mainDiffer = differ.filter(([, , , a, b]) => a !== b).length;
    return {
      M: new Date(M).toISOString(),
      checked: days.reduce((s, d) => s + d.checked, 0),
      main90: days.reduce((s, d) => s + d.main90, 0),
      mainWhole,
      mainDiffer,
      labelDiffer: differ.filter(([, a, b]) => a !== b).length,
      differ,
      apart: days.flatMap((d) => d.apart),
      pass: mainDiffer === 0 || mainDiffer < passMark * mainWhole,
    };
  });
  return { passMark, mondays: by, pass: by.every((d) => d.pass) };
}
