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
import { walkClose, walkOpen, type Level } from "../market1/book.js";
import { byM4 } from "../market1/fills.js";
import { accountsAt } from "../market1/waves.js";
import type { Market, Research } from "../paper/research.js";
import { DAY_MS, HOUR_MS } from "../schedule.js";
import { bookHours, bookKey, lastAtOrBefore } from "./books.js";
import type { Coins } from "./coins.js";
import { addCtxs, newMarks } from "./ctxs.js";
import type { Counted, Rec } from "./fills.js";
import { fundingRows, joinFunding, type FundingRow } from "./funding.js";
import type { Gate } from "./gate.js";
import { DATA_END, SIZING_DAYS, SIZING_START, TEST_START } from "./instants.js";
import { marketOf } from "./market.js";
import { newPass, passFile, type Pass } from "./pass.js";
import { episodeSpots, waveSpots, type Spot } from "./positions.js";
import {
  TAPE_MS,
  bookAt,
  levelsOf,
  pricePosition,
  tapeAt,
  type Found,
  type Priced,
  type Quote,
  type Trade,
} from "./price.js";
import { bySlice, scanM, type ScanRow } from "./slices.js";
import {
  StoreError,
  fillKeys,
  readBookList,
  readLz4,
  readStoreFile,
  type BookList,
  type DataList,
} from "./store.js";

/** The rehearsal's gate: closed whatever the freeze says (the plan's 3.6). */
export const CLOSED: Gate = { open: false };
/** The first `asset_ctxs` day: its rows give the marks from the minute before its 00:01 row. */
export const MARKS_START = Date.parse("2025-05-25T00:00:00Z");
/** The records and marks a run uses end here: TEST's start while the gate is closed (the rehearsal), DATA END once it is open (the look). */
export const boundOf = (gate: Gate): number =>
  gate.open ? DATA_END : TEST_START;

export type Ctx = {
  store: string;
  list: DataList;
  coins: Coins;
  kit: Research;
  /** Waits, before each file, out of the windows in which no heavy work runs. */
  pace: () => Promise<void>;
  log: (event: string, fields: object) => void;
};

export class BooksNeeded extends Error {}

export const coinName = (coins: Coins, iid: number) =>
  coins.list.find((c) => c.assetId === iid)!.name;
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

/** The book files H8 reads for the legs of the spots. */
export function booksOf(spots: readonly Spot[], coins: Coins): string[] {
  const keys = new Set<string>();
  for (const s of spots)
    for (const x of [s.xIn, s.xOut])
      for (const h of bookHours(x))
        keys.add(bookKey(coinName(coins, s.iid), h));
  return [...keys].sort();
}

type LegAsk = { id: string; coin: string; buy: boolean; x: number };

/** Each position's two legs for `readTapes`, `<index>|0` the entry and `<index>|1` the exit. */
export const legsOf = (spots: readonly Spot[], coins: Coins): LegAsk[] =>
  spots.flatMap((s, i) =>
    [s.xIn, s.xOut].map((x, n) => ({
      id: `${i}|${n}`,
      coin: coinName(coins, s.iid),
      buy: n === 0 ? s.dir > 0 : s.dir < 0,
      x,
    })),
  );

/**
 * Each leg's tape (H8) from the fill files of x's hour and the next, each
 * file read once; while the gate is closed, a leg whose hours reach TEST's
 * start has none (null), for the rehearsal opens no sealed file.
 */
export async function readTapes(
  ctx: Ctx,
  gate: Gate,
  legs: readonly LegAsk[],
): Promise<Map<string, Trade[] | null>> {
  const out = new Map<string, Trade[] | null>();
  const byFile = new Map<string, LegAsk[]>();
  for (const leg of legs) {
    const h = Math.floor(leg.x / HOUR_MS) * HOUR_MS;
    if (!gate.open && h + HOUR_MS >= TEST_START) {
      out.set(leg.id, null);
      continue;
    }
    for (const key of fillKeys(h, h + 2 * HOUR_MS)) {
      const asks = byFile.get(key) ?? [];
      asks.push(leg);
      byFile.set(key, asks);
    }
  }
  const recs = new Map<string, Rec[]>();
  for (const key of [...byFile.keys()].sort()) {
    const asks = byFile.get(key)!;
    const coins = new Set(asks.map((a) => a.coin));
    await ctx.pace();
    passFile(
      newPass(),
      new Set(),
      gate,
      ctx.store,
      ctx.list,
      key,
      ctx.coins,
      boundOf(gate),
      (rec) => {
        if (!coins.has(rec.fill.coin)) return;
        for (const a of asks)
          if (
            rec.fill.coin === a.coin &&
            rec.fill.time >= a.x &&
            rec.fill.time < a.x + TAPE_MS
          ) {
            const list = recs.get(a.id) ?? [];
            list.push(rec);
            recs.set(a.id, list);
          }
      },
    );
  }
  for (const leg of legs)
    if (!out.has(leg.id))
      out.set(leg.id, tapeAt(recs.get(leg.id) ?? [], leg.coin, leg.buy, leg.x));
  return out;
}

/** The coins' market objects from the `asset_ctxs` days and funding windows (R1) before the gate's bound, with what was read. */
export async function readMarkets(
  ctx: Ctx,
  gate: Gate,
  iids: ReadonlySet<number>,
) {
  const bound = boundOf(gate);
  const marks = newMarks(ctx.coins, MARKS_START, bound);
  const ctxs = { files: 0, rows: 0, failed: 0, late: 0, twice: 0 };
  for (let d = MARKS_START; d < bound; d += DAY_MS) {
    await ctx.pace();
    const key = `asset_ctxs/${dayKey(d).replaceAll("-", "")}.csv.lz4`;
    const c = addCtxs(
      marks,
      Buffer.from(readLz4(gate, ctx.store, ctx.list, key)).toString("utf8"),
      bound,
    );
    ctxs.files += 1;
    ctxs.rows += c.rows;
    ctxs.failed += c.failed;
    ctxs.late += c.late;
    ctxs.twice += c.twice;
  }
  const funding = { files: 0, rows: 0, failed: 0, late: 0 };
  const markets = new Map<number, Market>();
  for (const coin of ctx.coins.list) {
    if (!iids.has(coin.assetId)) continue;
    const prefix = `info/fundingHistory/${coin.name}/`;
    const rows: FundingRow[] = [];
    for (const key of [...ctx.list.keys()]
      .filter((k) => k.startsWith(prefix))
      .sort()) {
      if (Number(key.slice(prefix.length, -".json".length)) >= bound) continue;
      const r = fundingRows(
        coin.name,
        readStoreFile(gate, ctx.store, ctx.list, key).toString("utf8"),
        bound,
      );
      funding.files += 1;
      funding.rows += r.rows.length;
      funding.failed += r.failed;
      funding.late += r.late;
      rows.push(...r.rows);
    }
    let joined: FundingRow[];
    try {
      joined = joinFunding(rows);
    } catch (err) {
      throw new StoreError(`${coin.name}: ${(err as Error).message}`);
    }
    markets.set(coin.assetId, marketOf(ctx.kit, coin, marks, joined));
  }
  return { markets, ctxs, funding };
}

/** H8's files at x for a coin, from the store's book list (a key the archive lacks is "no file"); the snapshot's age and its file. */
export function bookFound(
  ctx: Ctx,
  gate: Gate,
  books: BookList,
  coin: string,
  x: number,
): { atHour: Found; before: Found; age: number | null; file: string | null } {
  const found = (hour: number): Found => {
    const key = bookKey(coin, hour);
    if (books.missing.has(key)) return "no file";
    if (!books.files.has(key)) throw new BooksNeeded(key);
    return lastAtOrBefore(readLz4(gate, ctx.store, books.files, key), coin, x)
      .book;
  };
  const [h, prior] = bookHours(x);
  const atHour = found(h!);
  const before =
    prior !== undefined && (atHour === null || atHour === "no file")
      ? found(prior)
      : null;
  const [snap, hour] =
    atHour !== null && atHour !== "no file"
      ? [atHour, h!]
      : before !== null && before !== "no file"
        ? [before, prior!]
        : [null, null];
  return {
    atHour,
    before,
    age: snap === null ? null : x - snap.ts,
    file: hour === null ? null : bookKey(coin, hour),
  };
}

export type LegPrint = {
  side: "buy" | "sell";
  source: "book" | "tape" | "none" | "sealed";
  why: string | null;
  /** x less the snapshot's time, when one was found. */
  age: number | null;
  /** The book file of the snapshot found (H9: so the Final review can reprice). */
  file: string | null;
  trades: number;
  /** The tape's `tid`s in H4's order, when the book did not price the leg. */
  tids: string[];
  /** R2: (the tape's walk − the book's) ÷ the book's × 10⁴, when both priced the leg. */
  tapeMinusBook: number | null;
};

export type Outcome = { spot: Spot; priced: Priced | null; legs: LegPrint[] };

/**
 * One position priced (H8, H9) with what the prints count of its legs; `base`
 * its BASE cell (null in the rehearsal). With the gate closed, a leg needing
 * a sealed tape leaves the position for the look.
 */
export function priceSpot(
  ctx: Ctx,
  gate: Gate,
  books: BookList,
  tapes: ReadonlyMap<string, Trade[] | null>,
  market: Market,
  s: Spot,
  id: string,
  base: number | null,
): Outcome {
  const coin = coinName(ctx.coins, s.iid);
  const legs: LegPrint[] = [];
  const quotes: (Quote | null)[] = [];
  let units: number | null = null;
  for (const [n, x] of [s.xIn, s.xOut].entries()) {
    const buy = n === 0 ? s.dir > 0 : s.dir < 0;
    const f = bookFound(ctx, gate, books, coin, x);
    const at = bookAt(x, f.atHour, f.before);
    const tape = tapes.get(`${id}|${n}`) ?? null;
    const walk = (levels: readonly Level[]) =>
      n === 0 ? walkOpen(levels, 1_000) : walkClose(levels, units!);
    const print: LegPrint = {
      side: buy ? "buy" : "sell",
      source: "book",
      why: null,
      age: f.age,
      file: f.file,
      trades: tape?.length ?? 0,
      tids: [],
      tapeMinusBook: null,
    };
    let levels: readonly Level[] = [];
    if ("book" in at) {
      levels = buy ? at.book.asks : at.book.bids;
      quotes.push({ source: "book", book: at.book });
      const taped = levelsOf(tape ?? []);
      if (taped.length > 0 && (n === 0 || units !== null)) {
        const b = walk(levels).price;
        print.tapeMinusBook = ((walk(taped).price - b) / b) * 1e4;
      }
    } else if (tape === null) {
      print.source = "sealed";
      print.why = at.why;
      quotes.push(null);
    } else {
      levels = levelsOf(tape);
      print.source = levels.length > 0 ? "tape" : "none";
      print.why = at.why;
      print.tids = tape.map((t) => t.tid);
      quotes.push({ source: "tape", why: at.why, trades: tape });
    }
    if (n === 0 && levels.length > 0) units = walkOpen(levels, 1_000).units;
    legs.push(print);
  }
  if (legs.some((l) => l.source === "sealed"))
    return { spot: s, priced: null, legs };
  return {
    spot: s,
    priced: pricePosition(ctx.kit, market, {
      dir: s.dir,
      xIn: s.xIn,
      xOut: s.xOut,
      entry: quotes[0] ?? null,
      exit: quotes[1] ?? null,
      base,
    }),
    legs,
  };
}

const quantiles = (xs: readonly number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const at = (q: number) =>
    s.length === 0 ? null : s[Math.floor(q * (s.length - 1))]!;
  return { n: s.length, p10: at(0.1), median: at(0.5), p90: at(0.9) };
};
/** How many of `xs` have each key (a null key is not counted). */
export const tally = <T>(xs: readonly T[], key: (x: T) => string | null) => {
  const out: Record<string, number> = {};
  for (const x of xs) {
    const k = key(x);
    if (k !== null) out[k] = (out[k] ?? 0) + 1;
  }
  return out;
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
