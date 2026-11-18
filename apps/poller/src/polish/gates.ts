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
import type { Research } from "../paper/research.js";
import { DAY_MS, MINUTE_MS } from "../schedule.js";
import { coinName, type Coins } from "../waveh/coins.js";
import { minutesWithout } from "../waveh/ctxs.js";
import { sha256, type Gate } from "../waveh/gate.js";
import {
  DATA_END,
  SIZING_DAYS,
  TEST_END,
  TEST_START,
  isoDay,
  monthOf,
} from "../waveh/instants.js";
import { keyDate } from "../waveh/keys.js";
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
import { SHA256, readBookList, type DataList } from "../waveh/store.js";
import { boundOf } from "./counted.js";
import { compareDay, dayFromRaw, dayFromStore } from "./days.js";
import { minuteColumn, minutePrice } from "./legs.js";
import {
  GATES_FILE,
  GATE_NAMES,
  libraryOf,
  positionsOf,
  type GatesFile,
  type Library,
} from "./library.js";
import { monthsOf } from "./merge.js";
import { checkPath } from "./seal.js";
import type { Counters } from "./pass.js";
import {
  FILES_FILE,
  NAMES_FILE,
  TABLES,
  USERS_FILE,
  partitionDir,
  type FileCounts,
  type Manifest,
  type Store,
  type Table,
} from "./store.js";
import { WIDTH, type ColumnType } from "./tables.js";

/** G3's tolerance on a position's bps: the plan's 1e-9 bps (4.5(3)); 0 expected, the largest difference printed. */
const BPS_TOLERANCE = 1e-9;
/** At most this many problems a gate lists (all are counted). */
const LISTED = 20;

/** What no reference file holds (decisions 2026-11-17: the entries of all slices, WAVE-H's Final review; F9's sample days, with decisions 2026-11-18, EXTRACT-REVIEW's findings, M2: a month's last and first day, and the day holding the hour before DATA END). */
type Expected = {
  everySlice: number;
  sampleDays: readonly string[];
};
export const WAVEH_EXPECTED: Expected = {
  everySlice: 176_986,
  sampleDays: [
    "2025-05-31",
    "2025-06-01",
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
    "2026-05-29",
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

type GateResult = { pass: boolean } & Record<string, unknown>;

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

/** The scan's counters summed over the input files (G0 refuses any refused or misread record; the slow path's are printed). */
function countersOf(lines: readonly FileCounts[]): Counters {
  const sum = (k: keyof Counters) => lines.reduce((s, f) => s + f[k], 0);
  return {
    refused: sum("refused"),
    misread: sum("misread"),
    slowLines: sum("slowLines"),
    slowRecords: sum("slowRecords"),
  };
}

/** Rows in = rows out + duplicates dropped, by table: the parts' rows (`files.jsonl`) against the merge's counts and the partitions' rows (the manifest). */
function conservation(m: Manifest, lines: readonly FileCounts[]): string[] {
  const { tape, bars, liq } = m.counts.merge;
  if (tape === undefined || bars === undefined || liq === undefined)
    return ["the manifest has no merge counts of tape, bars and liq"];
  const problems: string[] = [];
  const check = (what: string, a: number, b: number) => {
    if (a !== b) problems.push(`${what}: ${a}, not ${b}`);
  };
  const parts = (k: "takerRows" | "liqRows") =>
    lines.reduce((s, f) => s + f[k], 0);
  const rows = (table: Table) =>
    m.partitions
      .filter((p) => p.table === table)
      .reduce((s, p) => s + p.rows, 0);
  check(
    "the parts' taker rows, as the merge's tape and bars in",
    parts("takerRows"),
    tape.in + bars.in,
  );
  check("the parts' liq rows, as the merge's liq in", parts("liqRows"), liq.in);
  for (const [name, t] of [
    ["tape", tape],
    ["bars", bars],
    ["liq", liq],
  ] as const)
    check(`${name} in, as its out and duplicates`, t.in, t.out + t.duplicates);
  check(
    "the tape partitions' rows, as the merge's tape out",
    rows("tape"),
    tape.out,
  );
  check(
    "the liq partitions' rows, as the merge's liq out",
    rows("liq"),
    liq.out,
  );
  return problems;
}

/** G0: every file the manifest names, whole; the inputs WAVE-H's list's, one line a fill file; the partitions every table needs; no record refused or misread; every row conserved. */
export function g0(o: GatesInput, step1: Step1): GateResult {
  const m = o.store.manifest;
  const problems: string[] = [];
  if (m.range !== "WAVE-H" || m.partial !== null)
    problems.push(`the store is ${m.range}, ${m.partial ?? "whole"}`);
  if (m.inputs.listSha256 !== o.listSha256 || step1.dataSha256 !== o.listSha256)
    problems.push("the store or the look was made from another list");
  if (m.code.wavehFrozen !== o.wavehFrozen)
    problems.push("the store was made under another WAVE-H freeze");
  if (m.code.fingerprint !== o.code)
    problems.push("the store was made by other code");
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
  const counters = countersOf(lines);
  if (counters.refused !== 0)
    problems.push(`files.jsonl: ${counters.refused} records a writer refused`);
  if (counters.misread !== 0)
    problems.push(`files.jsonl: ${counters.misread} records misread`);
  problems.push(...conservation(m, lines));
  return {
    pass: problems.length === 0,
    counters,
    files,
    bytes,
    partitions: m.partitions.length,
    tables: TABLES.map((t) => m.partitions.filter((p) => p.table === t).length),
    storeCode: m.code.fingerprint,
    thisCode: o.code,
    ...listed(problems),
  };
}

/** WAVE-H's step-1 counts from the store (look.ts `lookStep1`, readMarkets): all but M's and slice 0's, which are G2's. */
function stepCounts(o: GatesInput, lib: Library) {
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
function compareLine(
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

/**
 * G5 (decisions 2026-11-18, EXTRACT-REVIEW's findings, Q4): each of the 40
 * coins' taker records has its maker record, one `tid` a trade, in its own
 * file; a trade a file boundary splits pairs across it, as one taker and one
 * maker of one coin and `tid` left open in two files next in the range's
 * order. Anything else left unpaired fails, listed by file, coin and `tid`;
 * no tolerance. `day_ntl_vlm` beside, deciding nothing.
 */
export function g5(o: GatesInput, lib: Library): GateResult {
  const problems: string[] = [];
  const totals: Record<string, [number, number]> = {};
  const open = new Map<string, { file: number; d: number }[]>();
  for (const f of lib.files) {
    for (const [coin, takers, makers] of f.pairs) {
      const t = (totals[coin] ??= [0, 0]);
      t[0] += takers;
      t[1] += makers;
    }
    for (const [coin, tid, d] of f.unpaired) {
      const k = `${coin} ${tid}`;
      const list = open.get(k) ?? [];
      list.push({ file: f.index, d });
      open.set(k, list);
    }
  }
  let straddled = 0;
  for (const [k, list] of open) {
    const [a, b] = list;
    if (
      list.length === 2 &&
      b!.file === a!.file + 1 &&
      Math.abs(a!.d) === 1 &&
      a!.d + b!.d === 0
    ) {
      straddled += 1;
      continue;
    }
    for (const { file, d } of list)
      problems.push(
        `${lib.files[file]!.key} ${k}: ${Math.abs(d)} ${d > 0 ? "taker" : "maker"}${Math.abs(d) > 1 ? "s" : ""} unpaired`,
      );
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
    straddled,
    ...listed(problems),
    dayNtlVlm: { columns: ["with the backstop", "without"], ratios },
  };
}

/** G6: each sample day's numbers from the store equal, cell by cell, those re-read from the raw files. */
export async function g6(o: GatesInput): Promise<GateResult> {
  const days = [];
  for (const d of o.expect.sampleDays) {
    const day = Date.parse(`${d}T00:00:00Z`);
    const raw = await dayFromRaw(o, day);
    const mine = dayFromStore(o, day);
    const differ = compareDay(mine, raw.numbers, day);
    days.push({
      day: d,
      pass: differ.length === 0,
      records: raw.records,
      twice: raw.twice,
      tapeRows: Object.values(mine.tape).reduce((s, x) => s + x[0], 0),
      liqRows: mine.liq.length,
      differences: differ.length,
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
  checkPath(o.raw);
  checkPath(o.look);
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
    passed: GATE_NAMES.every((g) => gates[g]?.pass === true),
    gates,
    seconds: { ...seconds, all: Math.round((Date.now() - t0) / 1000) },
    written: new Date().toISOString(),
  };
  writeWhole(path.join(dir, GATES_FILE), `${JSON.stringify(file, null, 1)}\n`);
  return file;
}
