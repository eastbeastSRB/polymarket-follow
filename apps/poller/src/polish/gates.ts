/**
 * The gates that make the store trusted (the polishing plan 4.5, its
 * review's F9; decisions 2026-11-17, the plan approved, Q1 and Q5): G0 the
 * store whole; G1 WAVE-H's step-1 counts; G2 its positions; G3 its prices;
 * G4 the minute price's fallback changing none of them; G5 the tape
 * complete, each trade's taker and maker records in one file, with
 * `day_ntl_vlm` printed beside; G6 sample days re-read by WAVE-H's own
 * readers. They reproduce numbers already seen: only slice 0's known
 * positions are priced. The result, `gates\gates.json`, names the manifest
 * and every reference by SHA-256; the store is trusted only when all pass.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { isDeepStrictEqual } from "node:util";
import { gunzipSync } from "node:zlib";
import { z } from "zod";
import { byM4 } from "../market1/fills.js";
import type { Market, Research } from "../paper/research.js";
import { coinName, type Coins } from "../waveh/coins.js";
import { minutesWithout, type Marks } from "../waveh/ctxs.js";
import { parseLine, parseRecord, rawRecords } from "../waveh/fills.js";
import { sha256, type Gate } from "../waveh/gate.js";
import {
  DATA_END,
  SIZING_DAYS,
  SIZING_START,
  TEST_END,
  TEST_START,
  isoDay,
  monthOf,
} from "../waveh/instants.js";
import { ctxsKey, fillKeys, formatOf, keyDate } from "../waveh/keys.js";
import {
  LegPrint,
  booksOf,
  priceSpot,
  shelfOf,
  tally,
  type Ctx,
  type Outcome,
} from "../waveh/legs.js";
import { episodeSpots, waveSpots, type Spot } from "../waveh/positions.js";
import { Priced, type Trade } from "../waveh/price.js";
import type { SizingFile } from "../waveh/rehearse.js";
import { markAt, testMonths } from "../waveh/report.js";
import { writeWhole } from "../waveh/run.js";
import { bySlice, scanM } from "../waveh/slices.js";
import {
  SHA256,
  linesOf,
  readBookList,
  readLz4,
  type DataList,
} from "../waveh/store.js";
import { boundOf, countedFrom, digitsOf, type CountedSet } from "./counted.js";
import { CONTEXT } from "./ctxs.js";
import { Tape, marketsFrom, minuteColumn, minutePrice } from "./legs.js";
import { monthsOf } from "./merge.js";
import {
  FILES_FILE,
  NAMES_FILE,
  TABLES,
  USERS_FILE,
  partitionDir,
  type FileCounts,
  type Store,
} from "./store.js";
import { WIDTH, type ColumnType } from "./tables.js";
import { LARGE_COINS } from "./writers.js";

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
/** G3's tolerance on a position's bps (the plan: 0.01 bps; 0 expected). */
export const BPS_TOLERANCE = 0.01;
/** At most this many problems a gate lists (all are counted). */
const LISTED = 20;

/** What no reference file holds (decisions 2026-11-17: the entries of all slices, WAVE-H's Final review; F9's sample days). */
export type Expected = {
  everySlice: number;
  sampleDays: readonly string[];
};
export const WAVEH_EXPECTED: Expected = {
  everySlice: 176_986,
  sampleDays: [
    "2025-06-15",
    "2025-07-27",
    "2025-08-15",
    "2025-09-15",
    "2025-10-10",
    "2025-11-15",
    "2025-12-15",
    "2026-01-15",
    "2026-02-15",
    "2026-03-15",
    "2026-04-15",
    "2026-05-28",
  ],
};

/** WAVE-H's `look/step1.json` (our own file: one that does not parse throws). */
export const Step1 = z.object({
  sha256: z.string().regex(SHA256),
  M: z.number(),
  positions: z.number(),
  sizingLate: z.number(),
  booksNeeded: z.number(),
  dataSha256: z.string(),
  counts: z.record(z.string(), z.unknown()),
});
export type Step1 = z.infer<typeof Step1>;

/** A line of WAVE-H's `look/positions.jsonl.gz`. */
const PositionLine = z.object({
  set: z.enum(["WAVE-H", "SIZING"]),
  spot: z.unknown(),
  priced: Priced.nullable(),
  legs: z.array(LegPrint),
});

export type GateResult = { pass: boolean } & Record<string, unknown>;

export const GatesFile = z.object({
  store: z.object({ manifestSha256: z.string().regex(SHA256) }),
  passed: z.boolean(),
  gates: z.record(z.string(), z.object({ pass: z.boolean() }).loose()),
  written: z.string(),
});
export type GatesFile = z.infer<typeof GatesFile>;
/** The gates' folder in the analyzer's folder of the range, and their file. */
export const GATES = "gates";
export const GATES_FILE = "gates.json";

export type GatesInput = {
  store: Store;
  /** WAVE-H's raw store (read only), its list and the list's SHA-256. */
  raw: string;
  list: DataList;
  listSha256: string;
  /** WAVE-H's look folder (`step1.json`, `positions.jsonl.gz`). */
  look: string;
  sizing: SizingFile;
  sizingSha256: string;
  /** WAVE-H's freeze as verified now, and the gate it opens. */
  wavehFrozen: string;
  gate: Gate;
  /** This program's fingerprint. */
  code: string;
  /** The range's fill files in order. */
  fill: readonly string[];
  coins: Coins;
  forty: readonly string[];
  kit: Research;
  expect: Expected;
  pace: () => Promise<void>;
  log: (event: string, fields: object) => void;
};

/** Equal once both are JSON (a −0 is 0, an undefined key none). */
const same = (a: unknown, b: unknown) =>
  isDeepStrictEqual(JSON.parse(JSON.stringify(a)) as unknown, b);
const listed = (problems: readonly string[]) => ({
  problems: problems.length,
  first: problems.slice(0, LISTED),
});
const sha256Of = (file: string) => sha256(readFileSync(file));

/** G0: every file the manifest names, whole; the inputs WAVE-H's list's, one line a fill file; the partitions every table needs. */
export function g0(o: GatesInput, step1: Step1): GateResult {
  const m = o.store.manifest;
  const problems: string[] = [];
  if (m.range !== "WAVE-H" || m.partial !== null)
    problems.push(`the store is ${m.range}, ${m.partial ?? "whole"}`);
  if (m.inputs.listSha256 !== o.listSha256 || step1.dataSha256 !== o.listSha256)
    problems.push("the store or the look was made from another list");
  if (m.code.wavehFrozen !== o.wavehFrozen)
    problems.push("the store was made under another WAVE-H freeze");
  let files = 0;
  let bytes = 0;
  const hold = (rel: string, want: { bytes: number; sha256: string }) => {
    try {
      o.store.bytes(rel, want);
      files += 1;
      bytes += want.bytes;
    } catch (err) {
      problems.push((err as Error).message);
    }
  };
  hold(USERS_FILE, m.dict.users.file);
  hold(NAMES_FILE, m.dict.names);
  hold(FILES_FILE, m.files);
  if (m.dict.users.file.bytes !== 20 * m.dict.users.count)
    problems.push("users.bin is not 20 bytes an address");
  const months = monthsOf(m.minuteStart, m.end);
  const small = new Set(o.coins.list.map((c) => c.name));
  const want = new Set<string>();
  for (const month of months) {
    want.add(partitionDir("liq", null, month));
    for (const coin of o.forty) {
      want.add(partitionDir("minute", coin, month));
      if (small.has(coin)) {
        want.add(partitionDir("tape", coin, month));
        want.add(partitionDir("funding", coin, month));
      }
    }
  }
  for (const p of m.partitions) {
    const dir = partitionDir(p.table, p.coin, p.month);
    if (!want.delete(dir))
      problems.push(`${dir}: not a partition of the range`);
    for (const [file, f] of Object.entries(p.files)) {
      const type = file.slice(file.indexOf(".") + 1) as ColumnType;
      if (f.bytes !== p.rows * WIDTH[type])
        problems.push(`${dir}/${file}: ${f.bytes} bytes for ${p.rows} rows`);
      hold(`${dir}/${file}`, f);
    }
  }
  for (const dir of want) problems.push(`${dir}: missing`);
  let lines: FileCounts[] = [];
  try {
    lines = o.store.files();
  } catch (err) {
    problems.push((err as Error).message);
  }
  if (lines.length !== o.fill.length)
    problems.push(`files.jsonl: ${lines.length} lines, ${o.fill.length} files`);
  lines.forEach((f, i) => {
    if (f.index !== i || f.key !== o.fill[i] || f.sha256 !== o.list.get(f.key))
      problems.push(`files.jsonl line ${i + 1} is not ${o.fill[i]} as listed`);
  });
  return {
    pass: problems.length === 0,
    files,
    bytes,
    partitions: m.partitions.length,
    tables: TABLES.map((t) => m.partitions.filter((p) => p.table === t).length),
    storeCode: m.code.fingerprint,
    thisCode: o.code,
    ...listed(problems),
  };
}

/** What the gates after G0 share: the input files' counts, the counted fills, the marks and markets, the tape. */
export type Library = CountedSet & {
  files: FileCounts[];
  marks: Marks;
  markets: Map<number, Market>;
  tape: Tape;
};

export function libraryOf(o: GatesInput): Library {
  return {
    files: o.store.files(),
    ...countedFrom(o.store, o.coins),
    ...marketsFrom(o.store, o.kit, o.coins),
    tape: new Tape(o.store),
  };
}

/** WAVE-H's step-1 counts from the store (look.ts `lookStep1`, readMarkets): all but M's and slice 0's, which are G2's. */
export function stepCounts(o: GatesInput, lib: Library) {
  const days: Record<string, { records: number; failed: number }> = {};
  const missing: Record<string, number> = {};
  const top = new Map<string, number>();
  const sizingCoins = new Set<string>();
  let late = 0;
  let back = 0;
  let last: number | null = null;
  for (const f of lib.files) {
    const day = isoDay(keyDate(f.key)!);
    const d = (days[day] ??= { records: 0, failed: 0 });
    d.records += f.records;
    d.failed += f.failed;
    const b = boundOf(f);
    for (const [hour, n] of f.byHour) if (hour >= b.until) late += n;
    // WAVE-H's rule line by line (waveh/pass.ts), over each run of consecutive block numbers.
    for (const [a, z] of f.runs) {
      if (last !== null && a <= last) back += Math.min(z, last) - a + 1;
      else if (last !== null && a > last + 1)
        missing[day] = (missing[day] ?? 0) + a - last - 1;
      last = Math.max(last ?? z, z);
    }
    // A SIZING file's records from TEST's start (a month's first instant) are WAVE-H's late ones.
    for (const [month, rate] of f.topTaker)
      if (!b.sizing || month < monthOf(TEST_START))
        top.set(month, Math.max(top.get(month) ?? -Infinity, rate));
    if (b.sizing)
      for (const [coin, , , first] of f.pairs)
        if (first < TEST_START && o.coins.byName.has(coin))
          sizingCoins.add(coin);
  }
  const m = o.store.manifest.counts;
  const ctxs = {
    files: 0,
    rows: 0,
    failed: 0,
    offMinute: 0,
    late: 0,
    twice: 0,
  };
  for (const c of Object.values(m.ctxsByDay)) {
    ctxs.files += 1;
    ctxs.rows += c.rows;
    ctxs.failed += c.failed;
    ctxs.offMinute += c.offMinute;
    ctxs.late += c.late;
    ctxs.twice += c.twice;
  }
  const funding = { files: 0, rows: 0, failed: 0, late: 0 };
  for (const f of Object.values(m.funding)) {
    const windows = Object.values(f.windows);
    funding.files += windows.length;
    funding.rows += windows.reduce((s, n) => s + n, 0);
    funding.failed += f.failed;
    funding.late += f.late;
  }
  const without = minutesWithout(lib.marks);
  return {
    files: lib.files.length,
    days,
    late,
    early: lib.early,
    legs: Object.fromEntries([...lib.legs].sort()),
    blocks: { missing, back },
    topTakerBps: Object.fromEntries(
      [...top].map(([month, r]) => [month, Math.round(r * 1e8) / 1e4]),
    ),
    counted: lib.counted.length,
    sizingCoins: [...sizingCoins].sort(),
    ctxs,
    ctxsByDay: m.ctxsByDay,
    funding,
    byCoin: Object.fromEntries(
      o.coins.list.map((c) => {
        const mk = lib.markets.get(c.assetId)!;
        const f = m.funding[c.name];
        return [
          c.name,
          {
            marks: without[c.name] ?? null,
            funding:
              f === undefined
                ? null
                : {
                    ...f,
                    settlements: mk.funding.hour.length,
                    unmarked: mk.funding.cumUnmarked.at(-1) ?? 0,
                  },
          },
        ];
      }),
    ),
  };
}

/** G1: the store's counts against `step1.json`'s, field by field. */
export function g1(o: GatesInput, lib: Library, step1: Step1): GateResult {
  const mine = stepCounts(o, lib);
  const differ = Object.entries(mine)
    .filter(([k, v]) => !same(v, step1.counts[k]))
    .map(([k]) => k);
  const days = (k: "days" | "ctxsByDay") =>
    Object.keys({ ...mine[k], ...(step1.counts[k] as object) })
      .filter(
        (d) =>
          !same(
            mine[k][d] ?? null,
            (step1.counts[k] as Record<string, unknown>)[d] ?? null,
          ),
      )
      .slice(0, LISTED);
  return {
    pass: differ.length === 0,
    differ,
    daysDiffer: days("days"),
    ctxsDaysDiffer: days("ctxsByDay"),
    counted: mine.counted,
    late: mine.late,
    early: mine.early,
    sizingCoins: mine.sizingCoins.length,
  };
}

/** G2's positions, as WAVE-H's look finds them (look.ts `lookStep1`). */
export function positionsOf(lib: Library, M: number) {
  const slice0 = bySlice(lib.counted, M)[0]!;
  const spots = waveSpots(0, slice0, TEST_START, TEST_END).filter(
    (s) => s.xOut < DATA_END,
  );
  const sizing = waveSpots(0, slice0, SIZING_START, TEST_START);
  const late = sizing.filter((s) => s.xOut >= TEST_START - HOUR_MS);
  return { slice0, spots, sizing, late };
}

/** G2: M's scan against `sizing.json`; slice 0's positions, SIZING's and those left for the look, by `step1.json`'s SHA-256 and counts; the entries of every slice. */
export function g2(
  o: GatesInput,
  lib: Library,
  step1: Step1,
): { result: GateResult; spots: Spot[]; sizing: Spot[] } {
  const scan = scanM(lib.sizing, SIZING_DAYS);
  const { slice0, spots, sizing, late } = positionsOf(lib, scan.M);
  const episodes = tally(episodeSpots(0, slice0, TEST_START, TEST_END), (e) =>
    monthOf(e.t),
  );
  const slice0Counts = {
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
  };
  const everySlice = bySlice(lib.counted, scan.M).reduce(
    (n, fills, k) =>
      n +
      waveSpots(k, fills, TEST_START, TEST_END).filter((s) => s.xOut < DATA_END)
        .length,
    0,
  );
  const positionsSha256 = sha256(JSON.stringify({ spots, late }));
  const booksNeeded = booksOf([...spots, ...late], o.coins).length;
  const checks: Record<string, boolean> = {
    M: scan.M === o.sizing.M && scan.M === step1.M,
    scan: same(scan.scan, o.sizing.scan),
    sizingCounted: lib.sizing.length === o.sizing.counted,
    positionsSha256: positionsSha256 === step1.sha256,
    positions: spots.length === step1.positions,
    sizingLate: late.length === step1.sizingLate,
    booksNeeded: booksNeeded === step1.booksNeeded,
    slice0: same(slice0Counts, step1.counts.slice0),
    everySlice: everySlice === o.expect.everySlice,
  };
  return {
    result: {
      pass: Object.values(checks).every(Boolean),
      differ: Object.keys(checks).filter((k) => !checks[k]),
      M: scan.M,
      scanRows: scan.scan.length,
      positions: spots.length,
      sizingPositions: sizing.length,
      sizingLate: late.length,
      booksNeeded,
      everySlice,
      positionsSha256,
    },
    spots,
    sizing,
  };
}

/** The bps a position's line may differ by (G3); every other field must be equal. */
const BPS_FIELDS = [
  "net",
  "gross",
  "fees",
  "funding",
  "grossOnMarks",
  "excess",
  "entryCost",
] as const;

/** Two lines of positions compared: the bps fields within the tolerance, all else equal. */
export function compareLine(
  mine: unknown,
  ref: unknown,
): { equal: boolean; bps: number } {
  const a = JSON.parse(JSON.stringify(mine)) as {
    priced: Record<string, unknown> | null;
  };
  const b = ref as { priced: Record<string, unknown> | null };
  let bps = 0;
  if (a.priced !== null && b.priced !== null && typeof b.priced === "object")
    for (const k of BPS_FIELDS) {
      const x = a.priced[k];
      const y = b.priced[k];
      if (typeof x === "number" && typeof y === "number") {
        bps = Math.max(bps, Math.abs(x - y));
        a.priced[k] = y;
      }
    }
  return { equal: isDeepStrictEqual(a, b) && bps <= BPS_TOLERANCE, bps };
}

/** G3's tapes: each leg's (`<i>|<n>`) from the tape table, coin by coin in time order. */
function tapesOf(
  o: GatesInput,
  lib: Library,
  all: readonly Spot[],
): Map<string, Trade[]> {
  const legs = all.flatMap((s, i) =>
    [s.xIn, s.xOut].map((x, n) => ({
      id: `${i}|${n}`,
      coin: coinName(o.coins, s.iid),
      buy: n === 0 ? s.dir > 0 : s.dir < 0,
      x,
    })),
  );
  legs.sort((a, b) => (a.coin < b.coin ? -1 : a.coin > b.coin ? 1 : a.x - b.x));
  return new Map(legs.map((l) => [l.id, lib.tape.at(l.coin, l.buy, l.x)]));
}

/** G3: WAVE-H's `priceSpot` on its positions and SIZING's, the tapes from the store, against `positions.jsonl.gz` line by line. */
export function g3(
  o: GatesInput,
  lib: Library,
  spots: readonly Spot[],
  sizing: readonly Spot[],
): { result: GateResult; wave: Outcome[] } {
  const ctx: Ctx = {
    store: o.raw,
    list: o.list,
    coins: o.coins,
    kit: o.kit,
    pace: o.pace,
    log: o.log,
  };
  const shelf = shelfOf(
    readBookList(readFileSync(path.join(o.raw, "books.jsonl"), "utf8")),
  );
  const all = [...spots, ...sizing];
  const tapes = tapesOf(o, lib, all);
  const m = markAt(o.kit, lib.markets);
  const outcomes = all.map((s, i) =>
    priceSpot(
      ctx,
      o.gate,
      shelf,
      tapes,
      lib.markets.get(s.iid)!,
      s,
      String(i),
      i < spots.length ? m.base(s.iid, s.xIn) : null,
    ),
  );
  const text = gunzipSync(
    readFileSync(path.join(o.look, "positions.jsonl.gz")),
  ).toString("utf8");
  const lines = text.split("\n");
  const problems: string[] = [];
  if (lines.pop() !== "" || lines.length !== outcomes.length)
    problems.push(`${lines.length} lines, ${outcomes.length} positions`);
  let bps = 0;
  lines.forEach((line, i) => {
    const ref = JSON.parse(line) as unknown;
    PositionLine.parse(ref);
    const mine = outcomes[i];
    if (mine === undefined) return;
    const c = compareLine(
      { set: i < spots.length ? "WAVE-H" : "SIZING", ...mine },
      ref,
    );
    bps = Math.max(bps, c.bps);
    if (!c.equal) problems.push(`line ${i + 1} differs`);
  });
  const wave = outcomes.slice(0, spots.length);
  return {
    result: {
      pass: problems.length === 0,
      lines: lines.length,
      priced: wave.filter((x) => x.priced?.net != null).length,
      sizingPriced: outcomes
        .slice(spots.length)
        .filter((x) => x.priced?.net != null).length,
      largestBps: bps,
      ...listed(problems),
    },
    wave,
  };
}

/** G4: at every instant a priced position reads (x_in, x_out, each settlement's minute before its hour), the minute price equals WAVE-H's mark. */
export function g4(o: GatesInput, lib: Library, wave: readonly Outcome[]) {
  let instants = 0;
  let unmarked = 0;
  const problems: string[] = [];
  for (const { spot: s, priced } of wave) {
    if (priced?.net == null) continue;
    const mk = lib.markets.get(s.iid)!;
    const at = [s.xIn, s.xOut];
    for (const h of mk.funding.hour)
      if (h > s.xIn && h <= s.xOut) at.push(h - 1);
    for (const t of at) {
      instants += 1;
      const mark = o.kit.panel.markAtMinuteEnd(mk, t);
      if (mark === null) unmarked += 1;
      if (minutePrice(o.kit, mk, lib.tape, t) !== mark)
        problems.push(`${mk.symbol} ${new Date(t).toISOString()}`);
    }
  }
  return {
    pass: problems.length === 0,
    instants,
    unmarked,
    ...listed(problems),
  };
}

/** G5: in every input file, each of the 40 coins' taker records as many as its maker records; `day_ntl_vlm` beside, deciding nothing. */
export function g5(o: GatesInput, lib: Library): GateResult {
  const problems: string[] = [];
  const totals: Record<string, [number, number]> = {};
  for (const f of lib.files)
    for (const [coin, takers, makers] of f.pairs) {
      const t = (totals[coin] ??= [0, 0]);
      t[0] += takers;
      t[1] += makers;
      if (takers !== makers)
        problems.push(`${f.key} ${coin}: ${takers} takers, ${makers} makers`);
    }
  // By coin and whole UTC day: the takers' notional (with the backstop's, and without) ÷ day_ntl_vlm at the next midnight.
  const m = o.store.manifest;
  const ratios: Record<
    string,
    Record<string, [number | null, number | null]>
  > = {};
  const r4 = (x: number) =>
    Number.isFinite(x) ? Math.round(x * 1e4) / 1e4 : null;
  for (const coin of o.forty) {
    const [buy, sell, backstop, vlm] = [
      "buyNtl",
      "sellNtl",
      "backstopNtl",
      "dayNtlVlm",
    ].map((c) => minuteColumn(o.store, coin, c)) as Float64Array[];
    const byDay: Record<string, [number | null, number | null]> = {};
    for (let d = 0; (d + 1) * 1440 * MINUTE_MS <= m.end - m.minuteStart; d++) {
      let without = 0;
      let all = 0;
      for (let k = d * 1440; k < (d + 1) * 1440; k++) {
        without += buy![k]! + sell![k]!;
        all += buy![k]! + sell![k]! + backstop![k]!;
      }
      const v = vlm![(d + 1) * 1440 - 1]!;
      byDay[isoDay(m.minuteStart + d * DAY_MS)] = [
        r4(all / v),
        r4(without / v),
      ];
    }
    ratios[coin] = byDay;
  }
  return {
    pass: problems.length === 0,
    totals,
    ...listed(problems),
    dayNtlVlm: { columns: ["with the backstop", "without"], ratios },
  };
}

/** A sample day's numbers: the 38 coins' tape (rows, Σ tid mod 2^64, Σ px·sz); BTC's and ETH's bars (trades, buy, sell and the backstop's notional); liq (rows, Σ tid); the 40 coins' contexts (minutes, each column's sum and cells that are none). */
type DayNumbers = {
  tape: Record<string, [number, string, number]>;
  bars: Record<string, [number, number, number, number]>;
  liq: [number, string];
  ctxs: Record<string, (number | string)[]>;
};

const U64 = 2n ** 64n;
const tidSum = (tids: Iterable<bigint>) => {
  let s = 0n;
  for (const t of tids) s = (s + t) % U64;
  return s.toString();
};
const total = (a: ArrayLike<number>) => {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i]!;
  return s;
};
/** A context column's day: the sum of its numbers and how many cells were none, as `<sum>|<none>`. */
const columnSum = (values: readonly number[]) => {
  let sum = 0;
  let none = 0;
  for (const v of values)
    if (Number.isNaN(v)) none += 1;
    else sum += v;
  return `${sum}|${none}`;
};

/** A sample day from the store. */
export function dayFromStore(o: GatesInput, day: number): DayNumbers {
  const month = monthOf(day);
  const end = day + DAY_MS;
  const out: DayNumbers = { tape: {}, bars: {}, liq: [0, "0"], ctxs: {} };
  const inDay = (time: Float64Array) => {
    const rows: number[] = [];
    for (let i = 0; i < time.length; i++)
      if (time[i]! >= day && time[i]! < end) rows.push(i);
    return rows;
  };
  for (const c of o.coins.list) {
    const p = o.store.partition("tape", c.name, month);
    const px = o.store.column(p, "px") as Float64Array;
    const sz = o.store.column(p, "sz") as Float64Array;
    const tid = o.store.column(p, "tid") as Uint32Array;
    const rows = inDay(o.store.column(p, "time") as Float64Array);
    let ntl = 0;
    for (const i of rows) ntl += px[i]! * sz[i]!;
    out.tape[c.name] = [
      rows.length,
      tidSum(rows.map((i) => BigInt(digitsOf(tid, i)))),
      ntl,
    ];
  }
  for (const coin of o.forty) {
    const p = o.store.partition("minute", coin, month);
    const off = (day - p.start) / MINUTE_MS;
    const f64 = (name: string) =>
      (o.store.column(p, name) as Float64Array).subarray(off, off + 1440);
    if (LARGE_COINS.includes(coin))
      out.bars[coin] = [
        total(
          (o.store.column(p, "trades") as Uint32Array).subarray(
            off,
            off + 1440,
          ),
        ),
        total(f64("buyNtl")),
        total(f64("sellNtl")),
        total(f64("backstopNtl")),
      ];
    const mark = f64("mark");
    const marked: number[] = [];
    for (let k = 0; k < mark.length; k++)
      if (!Number.isNaN(mark[k]!)) marked.push(k);
    out.ctxs[coin] = [
      marked.length,
      ...CONTEXT.map(([name]) => {
        const v = f64(name);
        return columnSum(marked.map((k) => v[k]!));
      }),
    ];
  }
  const p = o.store.partition("liq", null, month);
  const tid = o.store.column(p, "tid") as Uint32Array;
  const rows = inDay(o.store.column(p, "time") as Float64Array);
  out.liq = [rows.length, tidSum(rows.map((i) => BigInt(digitsOf(tid, i))))];
  return out;
}

type Taken = {
  t: number;
  iid: number;
  addr: string;
  side: 1 | -1;
  tid: string;
  n: number;
  backstop: boolean;
};

/**
 * A sample day re-read from WAVE-H's raw store by its own readers (lz4js,
 * `JSON.parse` of every line, its schema), independent of the pass: the
 * day's files and an hour's either side, each record of the day once by
 * account and `tid`; the takers summed in H8's order, as the store's.
 */
export async function dayFromRaw(
  o: GatesInput,
  day: number,
): Promise<{ numbers: DayNumbers; records: number; twice: number }> {
  const end = Math.min(day + DAY_MS, DATA_END);
  const forty = new Set(o.forty);
  const seen = new Set<string>();
  const takers = new Map<string, Taken[]>(o.forty.map((c) => [c, []]));
  const liq: bigint[] = [];
  let records = 0;
  let twice = 0;
  for (const key of fillKeys(day - HOUR_MS, day + DAY_MS + HOUR_MS)) {
    await o.pace();
    for (const line of linesOf(readLz4(o.gate, o.raw, o.list, key))) {
      let raw: ReturnType<typeof rawRecords>;
      try {
        raw = rawRecords(formatOf(key), parseLine(line));
      } catch {
        raw = null;
      }
      for (const r of raw?.records ?? []) {
        const rec = parseRecord(r);
        if (rec === null) continue;
        const f = rec.fill;
        if (f.time < day || f.time >= end) continue;
        records += 1;
        const isLiq = f.liquidation !== undefined;
        const isTaker = f.crossed && forty.has(f.coin);
        if (!isLiq && !isTaker) continue;
        const k = `${rec.user}|${f.tid}`;
        if (seen.has(k)) {
          twice += 1;
          continue;
        }
        seen.add(k);
        if (isLiq) liq.push(BigInt(f.tid));
        if (isTaker)
          takers.get(f.coin)!.push({
            t: f.time,
            iid: 0,
            addr: rec.user,
            side: f.side === "B" ? 1 : -1,
            tid: f.tid,
            n: Number(f.px) * Number(f.sz),
            backstop: f.liquidation?.method === "backstop",
          });
      }
    }
  }
  for (const list of takers.values()) list.sort(byM4);
  const out: DayNumbers = {
    tape: {},
    bars: {},
    liq: [liq.length, tidSum(liq)],
    ctxs: ctxsFromRaw(o, day),
  };
  for (const c of o.coins.list) {
    const list = takers.get(c.name)!;
    out.tape[c.name] = [
      list.length,
      tidSum(list.map((r) => BigInt(r.tid))),
      total(list.map((r) => r.n)),
    ];
  }
  for (const coin of LARGE_COINS) {
    const buy = new Float64Array(1440);
    const sell = new Float64Array(1440);
    const backstop = new Float64Array(1440);
    let trades = 0;
    for (const r of takers.get(coin)!) {
      const k = Math.floor((r.t - day) / MINUTE_MS);
      if (r.backstop) backstop[k] = backstop[k]! + r.n;
      else {
        trades += 1;
        if (r.side > 0) buy[k] = buy[k]! + r.n;
        else sell[k] = sell[k]! + r.n;
      }
    }
    out.bars[coin] = [trades, total(buy), total(sell), total(backstop)];
  }
  return { numbers: out, records, twice };
}

const TIME = /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/;

/** The day's minutes of the 40 coins from the `asset_ctxs` files of the day and a day either side, in day order: each minute's row the latest stamped in (m, m + 1 min], the first of one stamp, a row whose time or mark fails not taken. */
function ctxsFromRaw(o: GatesInput, day: number): DayNumbers["ctxs"] {
  const rows = new Map<string, ({ t: number; values: number[] } | undefined)[]>(
    o.forty.map((c) => [c, new Array<undefined>(1440).fill(undefined)]),
  );
  for (const d of [day - DAY_MS, day, day + DAY_MS]) {
    if (d < o.store.manifest.minuteStart || d >= DATA_END) continue;
    const lines = Buffer.from(readLz4(o.gate, o.raw, o.list, ctxsKey(d)))
      .toString("utf8")
      .split("\n");
    const head = lines[0]!.split(",");
    const [iTime, iCoin, iMark] = ["time", "coin", "mark_px"].map((c) =>
      head.indexOf(c),
    ) as [number, number, number];
    const at = CONTEXT.map(([, csv]) => head.indexOf(csv));
    for (const line of lines.slice(1)) {
      const cells = line.split(",");
      const minutes = rows.get(cells[iCoin] ?? "");
      if (minutes === undefined || cells.length !== head.length) continue;
      const mark = Number(cells[iMark]);
      if (!TIME.test(cells[iTime]!) || !(mark > 0 && Number.isFinite(mark)))
        continue;
      const t = Date.parse(cells[iTime]!);
      const k = Math.ceil((t - day) / MINUTE_MS) - 1;
      if (t >= DATA_END || k < 0 || k >= 1440) continue;
      if (minutes[k] !== undefined && t <= minutes[k].t) continue;
      minutes[k] = {
        t,
        values: at.map((i) => {
          const s = cells[i]!;
          return s.length > 0 && Number.isFinite(Number(s)) ? Number(s) : NaN;
        }),
      };
    }
  }
  return Object.fromEntries(
    o.forty.map((coin) => {
      const kept = rows.get(coin)!.filter((r) => r !== undefined);
      return [
        coin,
        [
          kept.length,
          ...CONTEXT.map((_, j) => columnSum(kept.map((r) => r.values[j]!))),
        ],
      ];
    }),
  );
}

/** G6: each sample day's numbers from the store equal those re-read from the raw files. */
export async function g6(o: GatesInput): Promise<GateResult> {
  const days = [];
  for (const d of o.expect.sampleDays) {
    const day = Date.parse(`${d}T00:00:00Z`);
    const raw = await dayFromRaw(o, day);
    const mine = dayFromStore(o, day);
    const differ = [
      ...(["tape", "bars", "ctxs"] as const).flatMap((part) =>
        Object.keys({ ...mine[part], ...raw.numbers[part] })
          .filter(
            (coin) =>
              !isDeepStrictEqual(mine[part][coin], raw.numbers[part][coin]),
          )
          .map((coin) => `${part} ${coin}`),
      ),
      ...(isDeepStrictEqual(mine.liq, raw.numbers.liq) ? [] : ["liq"]),
    ];
    days.push({
      day: d,
      pass: differ.length === 0,
      records: raw.records,
      twice: raw.twice,
      tapeRows: Object.values(mine.tape).reduce((s, x) => s + x[0], 0),
      liqRows: mine.liq[0],
      differ: differ.slice(0, LISTED),
    });
    o.log("sample day", days.at(-1)!);
  }
  return { pass: days.every((x) => x.pass), days };
}

/** Every gate in order, G0 first (the others need the store whole), into `<dir>\gates.json`, written whole. */
export async function runGates(
  o: GatesInput,
  dir: string,
): Promise<GatesFile & Record<string, unknown>> {
  const t0 = Date.now();
  let t = t0;
  const seconds: Record<string, number> = {};
  const gates: Record<string, GateResult> = {};
  const done = (name: string, r: GateResult) => {
    gates[name] = r;
    seconds[name] = Math.round((Date.now() - t) / 1000);
    o.log("gate", { gate: name, pass: r.pass, seconds: seconds[name] });
    t = Date.now();
  };
  const step1File = path.join(o.look, "step1.json");
  const step1 = Step1.parse(JSON.parse(readFileSync(step1File, "utf8")));
  const references = {
    step1: sha256Of(step1File),
    positions: sha256Of(path.join(o.look, "positions.jsonl.gz")),
    sizing: o.sizingSha256,
    books: sha256Of(path.join(o.raw, "books.jsonl")),
    dataList: o.listSha256,
  };
  await o.pace();
  done("G0", g0(o, step1));
  if (gates.G0!.pass) {
    const lib = libraryOf(o);
    done("G1", g1(o, lib, step1));
    await o.pace();
    const two = g2(o, lib, step1);
    done("G2", two.result);
    await o.pace();
    const three = g3(o, lib, two.spots, two.sizing);
    done("G3", three.result);
    done("G4", g4(o, lib, three.wave));
    await o.pace();
    done("G5", g5(o, lib));
    done("G6", await g6(o));
  }
  const file = {
    store: {
      manifestSha256: o.store.id,
      range: o.store.manifest.range,
      written: o.store.manifest.written,
    },
    references,
    code: { fingerprint: o.code, wavehFrozen: o.wavehFrozen },
    passed: ["G0", "G1", "G2", "G3", "G4", "G5", "G6"].every(
      (g) => gates[g]?.pass === true,
    ),
    gates,
    seconds: { ...seconds, all: Math.round((Date.now() - t0) / 1000) },
    written: new Date().toISOString(),
  };
  writeWhole(path.join(dir, GATES_FILE), `${JSON.stringify(file, null, 1)}\n`);
  return file;
}
