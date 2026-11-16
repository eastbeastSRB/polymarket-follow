/**
 * The rehearsal on SIZING (rules.md H1, H5; the plan's section 5, part 3,
 * with R2, R3, R5 and R9): the gate closed whatever the freeze; every SIZING
 * fill file read and verified; the counted fills; M's scan; slice 0's SIZING
 * positions; the book files their legs need (listed, and the run stops until
 * the store's book list answers each); then the tapes, the marks, funding,
 * every leg priced, and the outcomes written sealed with their hash. It
 * prints counts and mechanics only: never a leg's prices, a gross, net,
 * excess, mean, error, win share or BASE value.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { byM4 } from "../market1/fills.js";
import { accountsAt } from "../market1/waves.js";
import { DAY_MS } from "../schedule.js";
import { coinName } from "./coins.js";
import type { Counted } from "./fills.js";
import { CLOSED } from "./gate.js";
import { SIZING_DAYS, SIZING_START, TEST_START } from "./instants.js";
import {
  BooksNeeded,
  booksOf,
  legsOf,
  priceSpot,
  readTapes,
  tally,
  type Ctx,
  type LegPrint,
} from "./legs.js";
import { readMarkets } from "./market.js";
import { newPass, passFile, type Pass } from "./pass.js";
import { episodeSpots, waveSpots } from "./positions.js";
import { bySlice, scanM, type ScanRow } from "./slices.js";
import { StoreError, fillKeys, readBookList, type BookList } from "./store.js";

const dayKey = (t: number) => new Date(t).toISOString().slice(0, 10);

/** Every SIZING fill file, one at a time, into one pass; records stamped from TEST's start are not used. */
export async function sizingPass(ctx: Ctx): Promise<Pass> {
  const keys = fillKeys(SIZING_START, TEST_START);
  const absent = keys.filter((k) => !ctx.list.has(k));
  if (absent.length > 0)
    throw new StoreError(
      `${absent.length} SIZING fill files are not in the store's list, the first ${absent[0]}`,
    );
  const pass = newPass();
  const seen = new Set<string>();
  for (const [i, key] of keys.entries()) {
    await ctx.pace();
    passFile(
      pass,
      seen,
      CLOSED,
      ctx.store,
      ctx.list,
      key,
      ctx.coins,
      TEST_START,
    );
    if ((i + 1) % 100 === 0 || i + 1 === keys.length)
      ctx.log("files", {
        read: i + 1,
        of: keys.length,
        counted: pass.counted.length,
        heapMB: Math.round(process.memoryUsage().heapUsed / 2 ** 20),
      });
  }
  pass.counted.sort(byM4);
  return pass;
}

/** R9 over [from, to): a slicing's entries and episodes a slice a day, its wave-state share of quarter-hours, liquidated accounts a slice a day, counted fills an episode. */
export function burstiness(
  counted: readonly Counted[],
  M: number,
  from: number,
  to: number,
) {
  const days = (to - from) / DAY_MS;
  let entries = 0;
  let episodes = 0;
  let accounts = 0;
  let fillsIn = 0;
  let on = 0;
  let quarters = 0;
  for (const [k, fills] of bySlice(counted, M).entries()) {
    entries += waveSpots(k, fills, from, to).length;
    episodes += episodeSpots(k, fills, from, to).length;
    const inside = fills.filter((f) => f.t >= from && f.t < to);
    accounts += new Set(inside.map((f) => f.addr)).size;
    fillsIn += inside.length;
    for (let q = Math.ceil(from / 900_000) * 900_000; q < to; q += 900_000) {
      quarters += 1;
      if (
        accountsAt(fills, q, 1).size >= 2 ||
        accountsAt(fills, q, -1).size >= 2
      )
        on += 1;
    }
  }
  return {
    M,
    entriesASliceADay: entries / M / days,
    episodesASliceADay: episodes / M / days,
    waveStateShare: on / quarters,
    accountsASliceADay: accounts / M / days,
    fillsAnEpisode: fillsIn / episodes,
  };
}

const quantiles = (xs: readonly number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const at = (q: number) =>
    s.length === 0 ? null : s[Math.floor(q * (s.length - 1))]!;
  return { n: s.length, p10: at(0.1), median: at(0.5), p90: at(0.9) };
};

export type Sizing = {
  M: number;
  scan: ScanRow[];
  days: number;
  counted: number;
  outcomes: { file: string; sha256: string; positions: number };
};

/** The whole rehearsal; writes `books-needed.txt` and throws BooksNeeded when the book list lacks a leg's file. */
export async function rehearse(ctx: Ctx, root: string): Promise<Sizing> {
  const dir = path.join(root, "rehearsal");
  mkdirSync(dir, { recursive: true });
  const t0 = Date.now();
  const pass = await sizingPass(ctx);
  const counted = pass.counted;
  const { M, scan } = scanM(counted, SIZING_DAYS);
  const spots = waveSpots(0, bySlice(counted, M)[0]!, SIZING_START, TEST_START);
  const priceable = spots.filter((s) => s.xOut < TEST_START);
  const needed = booksOf(priceable, ctx.coins);
  writeFileSync(path.join(dir, "books-needed.txt"), `${needed.join("\n")}\n`);
  const bookFile = path.join(ctx.store, "books.jsonl");
  const books: BookList = existsSync(bookFile)
    ? readBookList(readFileSync(bookFile, "utf8"))
    : { files: new Map(), missing: new Set() };
  const lacking = needed.filter(
    (k) => !books.files.has(k) && !books.missing.has(k),
  );
  const counts = {
    files: fillKeys(SIZING_START, TEST_START).length,
    days: Object.fromEntries(pass.days),
    late: pass.late,
    legs: Object.fromEntries([...pass.legs].sort()),
    blocks: {
      missing: Object.fromEntries(pass.blocks.missing),
      back: pass.blocks.back,
    },
    topTakerBps: Object.fromEntries(
      [...pass.topTaker].map(([m, r]) => [m, Math.round(r * 1e8) / 1e4]),
    ),
    counted: counted.length,
    countedByCoin: tally(counted, (f) => coinName(ctx.coins, f.iid)),
    countedByDay: tally(counted, (f) => dayKey(f.t)),
    liquidatedAccounts: new Set(counted.map((f) => f.addr)).size,
    M,
    scanRows: scan.length,
    burstiness: [M, 2 * M].map((m) =>
      burstiness(counted, m, SIZING_START, TEST_START),
    ),
    slice0: {
      entries: spots.length,
      priceable: priceable.length,
      leftForTheLook: spots.length - priceable.length,
      backstopEntries: spots.filter((s) => s.method === "backstop").length,
      byCoin: tally(spots, (s) => coinName(ctx.coins, s.iid)),
    },
    booksNeeded: needed.length,
    booksLacking: lacking.length,
    passMinutes: Math.round((Date.now() - t0) / 60_000),
  };
  writeFileSync(
    path.join(dir, "counts.json"),
    `${JSON.stringify(counts, null, 2)}\n`,
  );
  ctx.log("counts", {
    M,
    counted: counted.length,
    booksNeeded: needed.length,
    booksLacking: lacking.length,
  });
  if (lacking.length > 0)
    throw new BooksNeeded(`${lacking.length} of ${needed.length} book files`);
  const tapes = await readTapes(ctx, CLOSED, legsOf(priceable, ctx.coins));
  const { markets, ctxs, funding } = await readMarkets(
    ctx,
    CLOSED,
    new Set(priceable.map((s) => s.iid)),
  );
  const outcomes = priceable.map((s, i) =>
    priceSpot(
      ctx,
      CLOSED,
      books,
      tapes,
      markets.get(s.iid)!,
      s,
      String(i),
      null,
    ),
  );
  const sealed = gzipSync(
    `${[
      ...outcomes,
      ...spots
        .filter((s) => s.xOut >= TEST_START)
        .map((s) => ({ spot: s, priced: null, legs: [] })),
    ]
      .map((o) => JSON.stringify(o))
      .join("\n")}\n`,
  );
  writeFileSync(path.join(dir, "sizing-outcomes.jsonl.gz"), sealed);
  const legPrints = outcomes.flatMap((o) => o.legs);
  const sides = (pick: (l: LegPrint) => number | null) =>
    Object.fromEntries(
      (["buy", "sell"] as const).map((side) => [
        side,
        quantiles(
          legPrints
            .filter((l) => l.side === side && pick(l) !== null)
            .map((l) => pick(l)!),
        ),
      ]),
    );
  const report = {
    legsBySource: tally(legPrints, (l) => `${l.side} ${l.source}`),
    tapeWhy: tally(legPrints, (l) => l.why),
    depthShortPositions: outcomes.filter((o) => o.priced?.depthShort === true)
      .length,
    unpriced: tally(outcomes, (o) => o.priced?.unpriced ?? null),
    bookAgeMs: quantiles(
      legPrints
        .filter((l) => l.source === "book" && l.age !== null)
        .map((l) => l.age!),
    ),
    tapeTrades: quantiles(legPrints.map((l) => l.trades)),
    tapeMinusBookBps: sides((l) => l.tapeMinusBook),
    ctxs,
    funding,
    fundingHoursMissing: outcomes.reduce(
      (s, o) => s + (o.priced?.fundingMissing ?? 0),
      0,
    ),
    outcomes: {
      file: "sizing-outcomes.jsonl.gz",
      sha256: createHash("sha256").update(sealed).digest("hex"),
      positions: spots.length,
    },
    minutes: Math.round((Date.now() - t0) / 60_000),
  };
  writeFileSync(
    path.join(dir, "report.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  ctx.log("rehearsal", { outcomes: report.outcomes, minutes: report.minutes });
  const sizing: Sizing = {
    M,
    scan,
    days: SIZING_DAYS,
    counted: counted.length,
    outcomes: report.outcomes,
  };
  writeFileSync(
    path.join(dir, "sizing.json"),
    `${JSON.stringify(sizing, null, 2)}\n`,
  );
  return sizing;
}
