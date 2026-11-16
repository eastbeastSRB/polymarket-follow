/**
 * The one look (rules.md H15, R3, R7), `waveh look`, with the gate open.
 *
 * Step 1: every fill file read and verified into one pass — SIZING's files
 * first, their records before TEST's start, then TEST's to DATA END's hour —
 * M recomputed from SIZING alone and held to the frozen `sizing.json`;
 * slice 0's TEST positions (WAVE-H's) and the SIZING positions whose exit
 * reaches TEST's hour before (the rehearsal left those it could not price);
 * R3's counts printed before any book is fetched or any price exists; the
 * book files their legs need and the positions' SHA-256 written to
 * `look/step1.json`; then it stops (books needed).
 *
 * Step 2 (the same command again): step 1 recomputed and its SHA-256 held to
 * `step1.json`'s; every needed book file answered by the store's book list;
 * the sealed SIZING outcomes held to `sizing.json`'s SHA-256; every leg
 * priced; the verdict written to `look/result.json` before anything about an
 * outcome is written or logged; then the positions and the report. A second
 * step 2 refuses.
 */
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { z } from "zod";
import { byM4 } from "../market1/fills.js";
import { DAY_MS, HOUR_MS } from "../schedule.js";
import { WAVEH_DIR, coinName } from "./coins.js";
import type { Counted } from "./fills.js";
import { keyDate, sha256, type Gate } from "./gate.js";
import {
  DATA_END,
  SIZING_DAYS,
  SIZING_START,
  TEST_END,
  TEST_START,
  isoDay,
  monthOf,
} from "./instants.js";
import {
  BooksNeeded,
  LegPrint,
  booksOf,
  legsOf,
  priceSpot,
  readTapes,
  tally,
  type Ctx,
  type Outcome,
} from "./legs.js";
import { readMarkets } from "./market.js";
import { newPass, passFile } from "./pass.js";
import { episodeSpots, waveSpots, type Spot } from "./positions.js";
import { Priced } from "./price.js";
import { SizingFile } from "./rehearse.js";
import { dayMost, linesBeside, markAt, netLine, testMonths } from "./report.js";
import { bySlice, scanM } from "./slices.js";
import {
  SHA256,
  StoreError,
  fillKeys,
  readBookList,
  type BookList,
} from "./store.js";
import { Z, decide } from "./verdict.js";

/** The run cannot start: WAVE-H's freeze is not valid (exit 4). */
export class FrozenDiffer extends Error {}
/** `look/result.json` exists: the one look has run (exit 5). */
export class AlreadyRun extends Error {}

/** The frozen `waveh/sizing.json`; a file that does not parse throws (our own file). */
export const loadSizing = (dir = WAVEH_DIR): SizingFile =>
  SizingFile.parse(
    JSON.parse(readFileSync(path.join(dir, "sizing.json"), "utf8")),
  );

export type Step1 = {
  M: number;
  /** WAVE-H's positions: slice 0's entries with t in TEST and x_out before DATA END (H6, H11). */
  spots: Spot[];
  /** Slice 0's SIZING positions, as the rehearsal found them. */
  sizing: Spot[];
  /** Those whose exit reaches TEST's hour before: priced again at the look, for the rehearsal could not price them all (H1). */
  late: Spot[];
  /** The SHA-256 of the positions step 2 prices: step 2 must recompute the same. */
  sha256: string;
  needed: string[];
  /** Every counted fill, in H4's order. */
  counted: Counted[];
  /** The coins with a record in SIZING (H13's late coins have none). */
  sizingCoins: Set<string>;
  counts: Record<string, unknown>;
};

export async function lookStep1(
  ctx: Ctx,
  gate: Gate,
  frozenM: number,
): Promise<Step1> {
  const keys = fillKeys(SIZING_START, DATA_END + HOUR_MS);
  const absent = keys.filter((k) => !ctx.list.has(k));
  if (absent.length > 0)
    throw new StoreError(
      `${absent.length} fill files are not in the store's list, the first ${absent[0]}`,
    );
  const pass = newPass();
  const seen = new Set<string>();
  let read = 0;
  const readAll = async (some: readonly string[], until: number) => {
    for (const key of some) {
      await ctx.pace();
      passFile(pass, seen, gate, ctx.store, ctx.list, key, ctx.coins, until);
      read += 1;
      if (read % 500 === 0 || read === keys.length)
        ctx.log("files", {
          read,
          of: keys.length,
          counted: pass.counted.length,
          heapMB: Math.round(process.memoryUsage().heapUsed / 2 ** 20),
        });
    }
  };
  const sizingFile = (k: string) => keyDate(k)! < TEST_START;
  await readAll(keys.filter(sizingFile), TEST_START);
  const { M } = scanM([...pass.counted].sort(byM4), SIZING_DAYS);
  if (M !== frozenM)
    throw new StoreError(`M is ${M} on SIZING, sizing.json's ${frozenM}`);
  const sizingCoins = new Set(pass.coins);
  const fromSizing = pass.counted.length;
  await readAll(
    keys.filter((k) => !sizingFile(k)),
    DATA_END,
  );
  // H1: a TEST file's counted fill stamped before TEST's start is in neither
  // part, so the look's SIZING is the rehearsal's, record for record.
  const fromTest = pass.counted.splice(fromSizing);
  const counted = [
    ...pass.counted,
    ...fromTest.filter((f) => f.t >= TEST_START),
  ].sort(byM4);
  const early = fromTest.length - (counted.length - fromSizing);
  const slice0 = bySlice(counted, M)[0]!;
  const spots = waveSpots(0, slice0, TEST_START, TEST_END).filter(
    (s) => s.xOut < DATA_END,
  );
  const sizing = waveSpots(0, slice0, SIZING_START, TEST_START);
  const late = sizing.filter((s) => s.xOut >= TEST_START - HOUR_MS);
  const episodes = tally(episodeSpots(0, slice0, TEST_START, TEST_END), (e) =>
    monthOf(e.t),
  );
  return {
    M,
    spots,
    sizing,
    late,
    sha256: sha256(JSON.stringify({ spots, late })),
    needed: booksOf([...spots, ...late], ctx.coins),
    counted,
    sizingCoins,
    counts: {
      files: keys.length,
      days: Object.fromEntries(pass.days),
      late: pass.late,
      early,
      legs: Object.fromEntries([...pass.legs].sort()),
      blocks: {
        missing: Object.fromEntries(pass.blocks.missing),
        back: pass.blocks.back,
      },
      topTakerBps: Object.fromEntries(
        [...pass.topTaker].map(([m, r]) => [m, Math.round(r * 1e8) / 1e4]),
      ),
      counted: counted.length,
      M,
      sizingCoins: [...sizingCoins].sort(),
      slice0: {
        positions: spots.length,
        byMonth: tally(spots, (s) => monthOf(s.t)),
        backstopEntries: spots.filter((s) => s.method === "backstop").length,
        episodesADayByMonth: Object.fromEntries(
          testMonths().map((m) => [
            m.month,
            (episodes[m.month] ?? 0) / ((m.to - m.from) / DAY_MS),
          ]),
        ),
        sizingPositions: sizing.length,
        sizingLate: late.length,
      },
    },
  };
}

const Step1File = z.object({ sha256: z.string().regex(SHA256) });

/** A line of the rehearsal's sealed outcomes (our own file: a line that fails throws). */
const SealedLine = z.object({
  spot: z.unknown(),
  priced: Priced.nullable(),
  legs: z.array(LegPrint),
});

/** A file written whole or not at all. */
function writeWhole(file: string, data: string | Buffer): void {
  writeFileSync(`${file}.part`, data);
  renameSync(`${file}.part`, file);
}

const json = (x: unknown) => `${JSON.stringify(x, null, 2)}\n`;

/** The sealed SIZING outcomes (H13's SIZING line): the rehearsal's, the ones it left priced at the look. */
function sizingOutcomes(
  sealed: Buffer,
  step: Step1,
  late: ReadonlyMap<string, Outcome>,
): Outcome[] {
  // The rehearsal wrote the positions it priced, then those whose exit is in
  // TEST: time order, as every exit before TEST's start comes from an earlier t.
  const want = step.sizing.map((s) => JSON.stringify(s));
  const lines = gunzipSync(sealed).toString("utf8").split("\n");
  if (lines.pop() !== "" || lines.length !== want.length)
    throw new StoreError(
      `the sealed SIZING outcomes hold ${lines.length} positions, SIZING ${want.length}`,
    );
  return lines.map((line, i) => {
    const o = SealedLine.parse(JSON.parse(line));
    if (JSON.stringify(o.spot) !== want[i])
      throw new StoreError(
        `the sealed SIZING outcomes' position ${i + 1} is not SIZING's`,
      );
    if (o.priced !== null)
      return { spot: step.sizing[i]!, priced: o.priced, legs: o.legs };
    const again = late.get(want[i]);
    if (again === undefined)
      throw new StoreError(
        `the sealed SIZING outcomes' position ${i + 1} was left for the look, but its exit is before TEST's hour before`,
      );
    return again;
  });
}

/**
 * The look: step 1, or step 2 once step 1's file exists and every book file
 * is answered. `dataSha256` is the SHA-256 of the list read (`data.sha256`).
 */
export async function look(
  ctx: Ctx,
  gate: Gate,
  root: string,
  sizing: SizingFile,
  dataSha256: string,
): Promise<{ verdict: string }> {
  if (!gate.open) throw new FrozenDiffer("WAVE-H's freeze is not valid");
  const dir = path.join(root, "look");
  if (existsSync(path.join(dir, "result.json")))
    throw new AlreadyRun("look/result.json exists");
  mkdirSync(dir, { recursive: true });
  const t0 = Date.now();
  const step = await lookStep1(ctx, gate, sizing.M);
  const stepFile = path.join(dir, "step1.json");
  if (!existsSync(stepFile)) {
    writeWhole(
      path.join(dir, "books-needed.txt"),
      `${step.needed.join("\n")}\n`,
    );
    writeWhole(
      stepFile,
      json({
        sha256: step.sha256,
        M: step.M,
        positions: step.spots.length,
        sizingLate: step.late.length,
        booksNeeded: step.needed.length,
        dataSha256,
        counts: step.counts,
        minutes: Math.round((Date.now() - t0) / 60_000),
      }),
    );
    ctx.log("step 1", {
      M: step.M,
      positions: step.spots.length,
      booksNeeded: step.needed.length,
    });
    throw new BooksNeeded(
      `step 1 done: ${step.needed.length} book files listed`,
    );
  }
  const prior = Step1File.parse(JSON.parse(readFileSync(stepFile, "utf8")));
  if (prior.sha256 !== step.sha256)
    throw new StoreError(
      `the positions' SHA-256 is ${step.sha256}, step 1's ${prior.sha256}`,
    );
  const bookText = path.join(ctx.store, "books.jsonl");
  const books: BookList = existsSync(bookText)
    ? readBookList(readFileSync(bookText, "utf8"))
    : { files: new Map(), missing: new Set() };
  const lacking = step.needed.filter(
    (k) => !books.files.has(k) && !books.missing.has(k),
  );
  if (lacking.length > 0)
    throw new BooksNeeded(
      `${lacking.length} of ${step.needed.length} book files`,
    );
  const sealedFile = path.join(root, "rehearsal", sizing.outcomes.file);
  if (!existsSync(sealedFile))
    throw new StoreError(`no ${path.join("rehearsal", sizing.outcomes.file)}`);
  const sealed = readFileSync(sealedFile);
  if (sha256(sealed) !== sizing.outcomes.sha256)
    throw new StoreError(
      `the sealed SIZING outcomes' SHA-256 is ${sha256(sealed)}, sizing.json's ${sizing.outcomes.sha256}`,
    );

  const all = [...step.spots, ...step.late];
  const tapes = await readTapes(ctx, gate, legsOf(all, ctx.coins));
  const read = await readMarkets(
    ctx,
    gate,
    new Set(ctx.coins.list.map((c) => c.assetId)),
  );
  const m = markAt(ctx.kit, read.markets);
  const priced = all.map((s, i) =>
    priceSpot(
      ctx,
      gate,
      books,
      tapes,
      read.markets.get(s.iid)!,
      s,
      String(i),
      i < step.spots.length ? m.base(s.iid, s.xIn) : null,
    ),
  );
  const wave = priced.slice(0, step.spots.length);
  const late = new Map(
    priced.slice(step.spots.length).map((o) => [JSON.stringify(o.spot), o]),
  );
  const sizingSet = sizingOutcomes(sealed, step, late);
  const decision = decide(
    ctx.kit,
    wave.map((o) => ({ t: o.spot.t, iid: o.spot.iid, priced: o.priced! })),
  );
  const legs = wave.flatMap((o) => o.legs.map((l, n) => ({ o, l, n })));
  const neededMissing = step.needed.filter((k) => books.missing.has(k));
  // Computed before the result is written (a crash here is not a look), written after it.
  const report = {
    "WAVE-H": { ...decision, z: Z, prints: netLine(ctx.kit, wave) },
    "THE DAY WITH THE MOST POSITIONS": dayMost(ctx.kit, wave),
    SIZING: {
      label:
        "SIZING: days counted before the freeze, outcomes first read at the look",
      ...netLine(ctx.kit, sizingSet),
    },
    ...linesBeside({
      m,
      coins: ctx.coins,
      counted: step.counted,
      M: step.M,
      wave,
      sizingCoins: step.sizingCoins,
    }),
    prints: {
      counts: step.counts,
      countedByCoinMethod: tally(
        step.counted.filter((f) => f.t >= TEST_START && f.t < TEST_END),
        (f) => `${coinName(ctx.coins, f.iid)}|${f.method}`,
      ),
      bookHoles: {
        filesByDay: tally(neededMissing, (k) => isoDay(keyDate(k)!)),
        legsByDay: tally(
          legs.filter((x) => x.l.why === "no book file"),
          (x) => isoDay(x.n === 0 ? x.o.spot.xIn : x.o.spot.xOut),
        ),
      },
      baseTier: Object.entries(
        step.counts.topTakerBps as Record<string, number>,
      )
        .filter(([, bps]) => bps > 4.5)
        .map(([month, bps]) => `ALARM ${month}: a taker paid ${bps} bps`),
      files: {
        fill: step.counts.files,
        assetCtxs: read.ctxs,
        funding: read.funding,
        books: step.needed.length - neededMissing.length,
        booksMissing: neededMissing.length,
      },
      dataSha256,
      booksSha256: existsSync(bookText) ? sha256(readFileSync(bookText)) : null,
      minutes: Math.round((Date.now() - t0) / 60_000),
    },
  };
  // R7: the result exists before anything about an outcome is written or logged.
  writeWhole(
    path.join(dir, "result.json"),
    json({
      ...decision,
      z: Z,
      M: step.M,
      positionsSha256: step.sha256,
      dataSha256,
      written: new Date().toISOString(),
    }),
  );
  ctx.log("result", { verdict: decision.verdict });
  writeWhole(
    path.join(dir, "positions.jsonl.gz"),
    gzipSync(
      `${[
        ...wave.map((o) => ({ set: "WAVE-H", ...o })),
        ...sizingSet.map((o) => ({ set: "SIZING", ...o })),
      ]
        .map((o) => JSON.stringify(o))
        .join("\n")}\n`,
    ),
  );
  writeWhole(path.join(dir, "report.json"), json(report));
  ctx.log("done", { verdict: decision.verdict });
  return { verdict: decision.verdict };
}
