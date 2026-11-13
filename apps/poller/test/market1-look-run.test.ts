/**
 * MARKET-1's look and the page around it, run end to end over a small world
 * that is ready for look 1 (rules.md M14, M15, with MARKET-PLAN-REVIEW F2,
 * F9, F11): a package folder with a freeze over it; a paper store with every
 * pool account read through 2026-12-21 and the 40 markets' market-days from
 * the cut to END_1; three waves (2026-11-13 in 8, 2026-11-20 in 10, 2026-12-17
 * at 00:00Z in 8), each two accounts' forced sells; a book line 20 s before
 * each WAVE leg in closed recording days written by hand, 2026-12-19 and
 * 2026-12-20 closed too. Each case changes one thing and puts it back. Every
 * value is made up; nothing real is read.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import {
  appendFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { daily, type DailyIo } from "../src/market1/daily.js";
import { LARGE, SMALL_COINS } from "../src/market1/fills.js";
import { PAPER_FILES, frozenFiles } from "../src/market1/gate.js";
import { kitData, type KitData } from "../src/market1/inputs.js";
import { look, lookMonday } from "../src/market1/look.js";
import type { Priced } from "../src/market1/price.js";
import { PAPER_LOCK, type Market1Config } from "../src/market1/run.js";
import { statOf } from "../src/market1/summary.js";
import { CUT, LOOK_ENDS } from "../src/paper/instants.js";
import {
  RESEARCH_ROOT,
  loadResearch,
  type PanelFile,
  type Research,
} from "../src/paper/research.js";
import { Z_POWER } from "../src/paper/stats.js";
import { PaperStore, type StoredRow } from "../src/paper/store.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { at, log, writeDay } from "./market1-world.js";

const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
const END1 = LOOK_ENDS[0];
const MONDAY1 = lookMonday(1);
const P = at("2026-12-21T00:00:00Z");
const PANEL_START = CUT - 3 * DAY_MS;
const RATE = 0.00001;
/** The mark of market 8 or 10 at an instant (the minute's start). */
const mark = (iid: number, t: number) =>
  (50 + iid) * (1 + 0.0001 * (Math.floor(t / MINUTE_MS) % 13));
const WAVES = [
  { iid: 8, t: at("2026-11-13T10:20:00Z"), b: 1_000 },
  { iid: 10, t: at("2026-11-20T10:20:00Z"), b: 1_000 },
  // Both accounts at the same millisecond: the entry is at 00:00:00.000Z of its day.
  { iid: 8, t: at("2026-12-17T00:00:00Z"), b: 0 },
].map((w) => {
  const xIn = w.t + w.b + 120_000;
  return { ...w, entry: w.t + w.b, xIn, xOut: xIn + DAY_MS };
});
const KEEP_TEXT =
  "Keep and drop are verdicts on this test, never instructions to trade.";

let tmp: string;
let pkg: string;
let paper: string;
let rec: string;
let kit: Research;
let kd: KitData;
let A: string;
let B: string;
let runs = 0;
const children: ChildProcess[] = [];

function forcedSell(n: number, t: number, iid: number): StoredRow {
  return {
    trade_id: String(30_000 + n),
    order_id: String(40_000 + n),
    instrument_id: iid,
    timestamp: t,
    side: "short",
    price: String(mark(iid, t)),
    quantity: "3",
    previous_size: "3",
    fee: "0.2",
    pnl: "-5",
    taker: true,
    liquidation: true,
  };
}

/** A book line of market `iid` written 20 s before x, received 0.1 s later: the mid ± 5 bps, deep. */
function bookLine(iid: number, x: number): string {
  const ts = x - 20_000;
  const mid = mark(iid, ts);
  return `${ts + 100}\t${JSON.stringify({
    ch: `book::${iid}`,
    ts,
    data: {
      b: [[String(mid * 0.9995), "1000"]],
      a: [[String(mid * 1.0005), "1000"]],
    },
  })}`;
}

beforeAll(async () => {
  tmp = mkdtempSync(path.join(tmpdir(), "market1-look-run-"));
  kit = await loadResearch();
  // The package, frozen.
  pkg = path.join(tmp, "pkg");
  cpSync(RESEARCH_ROOT, path.join(pkg, "research"), { recursive: true });
  for (const f of [
    "dist/market1.js",
    "dist/market1/daily.js",
    ...PAPER_FILES,
  ]) {
    mkdirSync(path.dirname(path.join(pkg, f)), { recursive: true });
    writeFileSync(path.join(pkg, f), `${f}\n`);
  }
  mkdirSync(path.join(pkg, "market1"));
  writeFileSync(path.join(pkg, "market1", "rules.md"), "the rules\n");
  writeFileSync(
    path.join(pkg, "market1", "FROZEN.sha256"),
    `# FROZEN: a test's\n# written 2026-12-01T00:00:00.000Z from commit test\n${frozenFiles(
      pkg,
    )
      .map((f) => `${sha256(readFileSync(path.join(pkg, f)))} *${f}`)
      .join("\n")}\n`,
  );
  const real = kitData(pkg);
  [A, B] = [real.pool[0]!, real.pool[1]!];
  // The paper store: the pre-cut panel of 8 and 10, the market-days of the 40 markets, the state, the fills.
  paper = path.join(tmp, "paper");
  const store = new PaperStore(paper);
  const pinned = new Map<string, string>();
  mkdirSync(path.join(paper, "panel-precut"), { recursive: true });
  for (const iid of [8, 10]) {
    const p: PanelFile = {
      iid,
      symbol: real.markets.get(iid)!.symbol,
      category: "crypto",
      start: PANEL_START,
      end: CUT,
      firstTrade: null,
      retired: null,
      marks: Array.from({ length: (CUT - PANEL_START) / MINUTE_MS }, (_, i) =>
        mark(iid, PANEL_START + i * MINUTE_MS),
      ),
      klines: { minute: [], trades: [], volume: [] },
      funding: [],
    };
    const bytes = gzipSync(JSON.stringify(p));
    writeFileSync(path.join(paper, "panel-precut", `${iid}.json.gz`), bytes);
    pinned.set(`${iid}.json.gz`, sha256(bytes));
  }
  kd = { ...real, pinned };
  const blank = Array.from({ length: 1_440 }, () => null);
  for (const iid of [...SMALL_COINS, ...LARGE]) {
    mkdirSync(path.join(paper, "panel", String(iid)), { recursive: true });
    for (let d = CUT; d < END1; d += DAY_MS) {
      const used = iid === 8 || iid === 10;
      // Written as the paper experiment's store writes a market-day (without its flush).
      writeFileSync(
        store.marketDayFile(iid, d),
        gzipSync(
          JSON.stringify({
            iid,
            day: d,
            marks: used
              ? Array.from({ length: 1_440 }, (_, i) =>
                  mark(iid, d + i * MINUTE_MS),
                )
              : blank,
            klines: { minute: [], trades: [], volume: [] },
            funding: used
              ? Array.from({ length: 24 }, (_, h) => [
                  d + h * HOUR_MS,
                  RATE,
                  d + h * HOUR_MS + 70,
                ])
              : [],
          }),
        ),
      );
    }
  }
  store.addRows(
    A,
    WAVES.map((w, k) => forcedSell(k, w.t, w.iid)),
  );
  store.addRows(
    B,
    WAVES.map((w, k) => forcedSell(10 + k, w.entry, w.iid)),
  );
  store.saveState({
    version: 1,
    accounts: Object.fromEntries(
      real.pool.map((addr) => [
        addr,
        {
          P,
          from: CUT,
          // A hole of A's that ends half an hour before the second wave: its window touches it.
          holes:
            addr === A
              ? [
                  {
                    from: WAVES[1]!.t - 2 * HOUR_MS,
                    to: WAVES[1]!.t - 30 * MINUTE_MS,
                    cause: "page cap" as const,
                    readOn: "2026-11-21",
                  },
                ]
              : [],
        },
      ]),
    ),
  });
  // The recordings: each WAVE leg's line in its hour's file; the days after END_1 closed.
  rec = path.join(tmp, "recordings");
  const days = new Map<string, Record<string, string[]>>();
  for (const w of WAVES) {
    for (const x of [w.xIn, w.xOut]) {
      const iso = new Date(x - 19_900).toISOString();
      const hours = days.get(iso.slice(0, 10)) ?? {};
      (hours[iso.slice(11, 13)] ??= []).push(bookLine(w.iid, x));
      days.set(iso.slice(0, 10), hours);
    }
  }
  for (const d of ["2026-12-19", "2026-12-20"]) days.set(d, {});
  for (const [date, hours] of days) writeDay(rec, date, hours);
}, 120_000);

afterAll(() => {
  for (const c of children) c.kill();
  rmSync(tmp, { recursive: true, force: true });
});

/** A fresh MARKET-1 record over the world (or another paper root or recordings). */
function configFor(over: Partial<Market1Config> = {}): Market1Config {
  runs += 1;
  const config: Market1Config = {
    STATE_DIR: path.join(tmp, `var-${runs}`),
    MARKET1_ROOT: path.join(tmp, `market1-${runs}`),
    MARKET1_BACKUP: path.join(tmp, `backup-${runs}`),
    PAPER_ROOT: paper,
    RECORDINGS_ROOT: rec,
    MONGO_URI: "mongodb://unused",
    MONGO_DB: "polymarket_follow_test",
    ...over,
  };
  mkdirSync(config.STATE_DIR, { recursive: true });
  return config;
}
const io = (docs: unknown[] = []): DailyIo => ({
  packageRoot: pkg,
  kd,
  ruleBook: () => Promise.resolve(docs),
});
const logOf = (config: Market1Config, date: string) =>
  readFileSync(path.join(config.MARKET1_ROOT, "log", `${date}.jsonl`), "utf8")
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l) as Record<string, unknown>);
type Result = {
  look: number;
  verdict: string;
  sentence: string;
  afterTheVerdict: boolean;
  forced: boolean;
  missing: string[];
  z: number;
  frozen: string;
  wave: {
    positions: number;
    days: number;
    markets: number;
    notAtBook: number;
    markLegs: Record<string, number>;
    money: { se: number | null } | null;
  };
  smallestEdgeNextLook: number | null;
  holes: Record<string, number>;
  waveWindowsOnHoles: number;
};
const resultOf = (config: Market1Config, k: number) =>
  JSON.parse(
    readFileSync(
      path.join(config.MARKET1_ROOT, "looks", `L${k}`, "result.json"),
      "utf8",
    ),
  ) as Result;
type Logged = {
  line: string;
  iid: number;
  t: number;
  xIn: number;
  priced: Priced | null;
};
const positionsOf = (config: Market1Config, date: string) =>
  gunzipSync(
    readFileSync(
      path.join(config.MARKET1_ROOT, "log", `${date}-positions.jsonl.gz`),
    ),
  )
    .toString("utf8")
    .split("\n")
    .map((l) => JSON.parse(l) as Logged);
const pageOf = (config: Market1Config) =>
  readFileSync(path.join(config.MARKET1_ROOT, "page", "index.html"), "utf8");
/** Moves a file aside for the time of `run`, then back. */
async function without<T>(file: string, run: () => Promise<T>): Promise<T> {
  renameSync(file, `${file}.aside`);
  try {
    return await run();
  } finally {
    renameSync(`${file}.aside`, file);
  }
}
const bps = (x: number) => `${x >= 0 ? "+" : ""}${x.toFixed(1)}`;

describe("a look end to end (M15, F11)", () => {
  it("runs once on its Monday when its reads are complete, and keeps what it decided", async () => {
    const config = configFor();
    expect(await look(config, log, 1, MONDAY1, io())).toBe(0);
    const r = resultOf(config, 1);
    expect(r).toMatchObject({
      look: 1,
      verdict: "TOO FEW TO TELL",
      sentence: KEEP_TEXT,
      afterTheVerdict: false,
      forced: false,
      missing: [],
      z: 2.81,
      frozen: sha256(readFileSync(path.join(pkg, "market1", "FROZEN.sha256"))),
      wave: { positions: 3, days: 3, markets: 2, notAtBook: 0, markLegs: {} },
      holes: { "page cap": 1 },
      waveWindowsOnHoles: 1,
    });
    // The smallest edge look 2 would see: (z₂ + z of 80% power) × SE × √(37 ÷ 86 days).
    expect(r.smallestEdgeNextLook).toBeCloseTo(
      (2.43 + Z_POWER) * r.wave.money!.se! * Math.sqrt(37 / 86),
      9,
    );
    // The legs it decided, kept as a run's and named in the day's manifest.
    const books = path.join("books", "2026-12-21-L1.jsonl.gz");
    const bytes = readFileSync(path.join(config.MARKET1_ROOT, books));
    expect(
      readFileSync(
        path.join(config.MARKET1_ROOT, "manifest", "2026-12-21.sha256"),
        "utf8",
      ),
    ).toBe(`${sha256(bytes)} *books/2026-12-21-L1.jsonl.gz\n`);
    expect(logOf(config, "2026-12-21").at(-1)).toMatchObject({
      look: 1,
      verdict: "TOO FEW TO TELL",
      forced: false,
      missing: [],
    });
    expect(await look(config, log, 1, MONDAY1 + HOUR_MS, io())).toBe(5);
    expect(logOf(config, "2026-12-21").at(-1)!.line).toBe(
      "the look has run already",
    );
  }, 60_000);

  it("without a valid freeze writes one log line and nothing else (exit 4)", async () => {
    const config = configFor({
      PAPER_ROOT: path.join(tmp, "nowhere-paper"),
      RECORDINGS_ROOT: path.join(tmp, "nowhere-recordings"),
    });
    const unfrozen = path.join(tmp, "unfrozen");
    mkdirSync(unfrozen, { recursive: true });
    expect(
      await look(config, log, 1, MONDAY1, { ...io(), packageRoot: unfrozen }),
    ).toBe(4);
    expect(readdirSync(config.MARKET1_ROOT)).toEqual(["log"]);
    expect(logOf(config, "2026-12-21")).toMatchObject([
      { line: "frozen files differ", problems: ["no market1/FROZEN.sha256"] },
    ]);
  }, 60_000);

  it("waits a minute at a time for a live paper run, and after 6 hours stops with nothing of it read (exit 5)", async () => {
    const config = configFor();
    const holder = spawn(process.execPath, ["-e", "setTimeout(()=>{},60000)"], {
      stdio: "ignore",
    });
    children.push(holder);
    const beat = path.join(config.STATE_DIR, PAPER_LOCK.heartbeat);
    writeFileSync(
      path.join(config.STATE_DIR, PAPER_LOCK.lock),
      `${holder.pid}\n`,
    );
    writeFileSync(beat, "{}\n");
    let t = Date.now();
    const slept: number[] = [];
    const paperClock = {
      now: () => t,
      sleep: (ms: number) => {
        slept.push(ms);
        t += ms;
        utimesSync(beat, new Date(t), new Date(t));
        return Promise.resolve();
      },
    };
    expect(await look(config, log, 1, MONDAY1, { ...io(), paperClock })).toBe(
      5,
    );
    expect(slept).toHaveLength(360);
    expect(existsSync(path.join(config.MARKET1_ROOT, "looks"))).toBe(false);
    expect(logOf(config, "2026-12-21").at(-1)!.line).toBe(
      "the paper experiment's run is still live after 6 hours",
    );
  }, 60_000);

  it("is not ready while a read is missing, until 7 days past its Monday; then it runs forced and lists what was missing", async () => {
    const statePath = path.join(paper, "state.json");
    const state = readFileSync(statePath, "utf8");
    const cases: [string, () => Promise<void> | void, () => void, string][] = [
      [
        "an account read only to the day before END_1",
        () => {
          const s = JSON.parse(state) as {
            accounts: Record<string, { P: number }>;
          };
          s.accounts[B]!.P = END1 - DAY_MS;
          writeFileSync(statePath, JSON.stringify(s));
        },
        () => writeFileSync(statePath, state),
        "1 pool accounts not read through 2026-12-19",
      ],
      [
        "the day after END_1's day not closed",
        () =>
          renameSync(
            path.join(rec, "2026-12-20", "manifest.json"),
            path.join(rec, "2026-12-20", "manifest.aside"),
          ),
        () =>
          renameSync(
            path.join(rec, "2026-12-20", "manifest.aside"),
            path.join(rec, "2026-12-20", "manifest.json"),
          ),
        "recording days through 2026-12-19 and the day after not all closed",
      ],
      [
        "one market-day missing",
        () =>
          renameSync(
            path.join(paper, "panel", "59", "2026-12-18.json.gz"),
            path.join(paper, "panel", "59", "aside"),
          ),
        () =>
          renameSync(
            path.join(paper, "panel", "59", "aside"),
            path.join(paper, "panel", "59", "2026-12-18.json.gz"),
          ),
        "market-days missing: 1",
      ],
    ];
    for (const [what, apply, undo, missing] of cases) {
      await apply();
      try {
        const early = configFor();
        expect(
          await look(early, log, 1, MONDAY1 + 7 * DAY_MS - 1, io()),
          what,
        ).toBe(5);
        expect(logOf(early, "2026-12-27").at(-1)!.line).toBe(
          `the look is not ready: ${missing}`,
        );
        const late = configFor();
        expect(await look(late, log, 1, MONDAY1 + 7 * DAY_MS, io()), what).toBe(
          0,
        );
        expect(resultOf(late, 1)).toMatchObject({
          forced: true,
          missing: [missing],
        });
      } finally {
        undo();
      }
    }
  }, 60_000);

  it("forced, prices at the mark a leg whose recording days are not final, flagged, and counts it as not at the book", async () => {
    const days = ["2026-12-19", "2026-12-20"].map((d) =>
      path.join(rec, d, "manifest.json"),
    );
    const config = configFor();
    await without(days[0]!, () =>
      without(days[1]!, () => look(config, log, 1, MONDAY1 + 7 * DAY_MS, io())),
    );
    expect(resultOf(config, 1)).toMatchObject({
      forced: true,
      missing: [
        "recording days through 2026-12-19 and the day after not all closed",
      ],
      wave: {
        positions: 3,
        notAtBook: 1,
        markLegs: { "recording not final at the look": 1 },
      },
    });
  }, 60_000);

  it("after a KEEP or a DROP marks a later look 'after the verdict'; after WITHHELD or TOO FEW TO TELL it does not", async () => {
    for (const [verdict, after] of [
      ["KEEP", true],
      ["DROP", true],
      ["WITHHELD", false],
      ["TOO FEW TO TELL", false],
    ] as const) {
      const config = configFor();
      const first = path.join(
        config.MARKET1_ROOT,
        "looks",
        "L1",
        "result.json",
      );
      mkdirSync(path.dirname(first), { recursive: true });
      writeFileSync(
        first,
        JSON.stringify({
          look: 1,
          end: "2026-12-19T00:00:00.000Z",
          verdict,
          sentence: KEEP_TEXT,
        }),
      );
      expect(await look(config, log, 2, lookMonday(2) + 7 * DAY_MS, io())).toBe(
        0,
      );
      expect(resultOf(config, 2), verdict).toMatchObject({
        look: 2,
        z: 2.43,
        afterTheVerdict: after,
      });
    }
  }, 60_000);
});

describe("the daily page around a look (M9, M14)", () => {
  const RUN = at("2026-12-18T10:30:00Z");
  const END = at("2026-12-18T00:00:00Z");

  it("shows the band the next look will use, at look 1's z, then at look 2's once look 1 has run", async () => {
    const config = configFor();
    expect(await daily(config, log, () => undefined, RUN, io())).toBe(0);
    // The headline's set: the closed WAVE positions before the Monday every account has reached.
    const closed = positionsOf(config, "2026-12-18").filter(
      (p) => p.line === "WAVE" && p.priced !== null,
    );
    expect(closed.map((p) => p.iid)).toEqual([8, 10]);
    const money = statOf(
      kit,
      closed.map((p) => ({ t: p.t, iid: p.iid, x: p.priced!.net! })),
    )!;
    const band = (z: number) =>
      `2 positions on 2 days in 2 markets; mean net ${bps(money.mean)} bps a position ± ${money.se!.toFixed(1)}; the band the next look will use: ${bps(money.mean - z * money.se!)} to ${bps(money.mean + z * money.se!)}`;
    expect(pageOf(config)).toContain(band(2.81));
    const first = path.join(config.MARKET1_ROOT, "looks", "L1", "result.json");
    mkdirSync(path.dirname(first), { recursive: true });
    writeFileSync(
      first,
      JSON.stringify({
        look: 1,
        end: "2026-12-19T00:00:00.000Z",
        verdict: "WITHHELD",
        sentence: KEEP_TEXT,
      }),
    );
    expect(await daily(config, log, () => undefined, RUN + HOUR_MS, io())).toBe(
      0,
    );
    expect(pageOf(config)).toContain(band(2.43));
  }, 60_000);

  it("shows an open position at the mark at END − 1 ms, labelled", async () => {
    const config = configFor();
    expect(await daily(config, log, () => undefined, RUN, io())).toBe(0);
    const w = WAVES[2]!;
    const minute = (t: number) => Math.floor(t / MINUTE_MS) * MINUTE_MS;
    const c = (t: number) => kit.costs.SETTINGS.taker.spread(8, t).c;
    const pIn = mark(8, minute(w.xIn)) * (1 + c(w.xIn));
    const pOut = mark(8, minute(END - 1)) * (1 - c(END - 1));
    const q = 1_000 / pIn;
    let funding = 0;
    for (
      let h = Math.ceil((w.xIn + 1) / HOUR_MS) * HOUR_MS;
      h < END;
      h += HOUR_MS
    )
      funding -= RATE * mark(8, h - MINUTE_MS) * q * 10;
    const net =
      (pOut - pIn) * q * 10 -
      (0.0004 * 1_000 + 0.0004 * pOut * q) * 10 +
      funding;
    expect(pageOf(config)).toContain(
      `<td>${bps(net)} (open, at the mark)</td>`,
    );
  }, 60_000);

  it("prices each leg at the recorded taker rate, 4 bps without a record, and raises the fee alarm only on a change (F9)", async () => {
    const plain = configFor();
    expect(await daily(plain, log, () => undefined, RUN, io())).toBe(0);
    const recorded = configFor();
    const schedule = [
      {
        kind: "fees",
        key: "schedule",
        at: at("2026-11-10T00:00:00Z"),
        value: [
          {
            instrument_type: "perpetual",
            category: "crypto",
            taker_fee_rate: "0.0008",
          },
        ],
      },
    ];
    expect(await daily(recorded, log, () => undefined, RUN, io(schedule))).toBe(
      0,
    );
    for (const [config, rate] of [
      [plain, 0.0004],
      [recorded, 0.0008],
    ] as const) {
      const first = positionsOf(config, "2026-12-18").find(
        (p) => p.line === "WAVE" && p.iid === 8,
      )!.priced!;
      expect(first.markLegs).toEqual([null, null]);
      expect(first.fees).toBeCloseTo(
        rate * 1e4 * (1 + first.pOut! / first.pIn!),
        9,
      );
    }
    const alarm = `alarm: a recorded taker rate differs from 4 bps in markets ${[...SMALL_COINS, ...LARGE].join(", ")} — their legs are priced at the recorded rate (M9)`;
    expect(pageOf(plain)).not.toContain("alarm: a recorded taker rate");
    expect(pageOf(recorded)).toContain(alarm);
    expect(logOf(recorded, "2026-12-18").at(-1)).toMatchObject({
      feeCategories: ["crypto"],
      alarms: [alarm],
    });
  }, 60_000);

  it("leaves out a coin from the day its record leaves it out, a wave at that day's first millisecond included (M3)", async () => {
    const config = configFor();
    const closeOnly = [
      {
        kind: "instrument",
        key: "8",
        at: at("2026-12-17T05:00:00Z"),
        value: { instrument_id: 8, symbol: "SOL-USD", close_only: true },
      },
    ];
    expect(await daily(config, log, () => undefined, RUN, io(closeOnly))).toBe(
      0,
    );
    expect(
      positionsOf(config, "2026-12-18")
        .filter((p) => p.line === "WAVE")
        .map((p) => [p.iid, p.t]),
    ).toEqual([
      [8, WAVES[0]!.entry],
      [10, WAVES[1]!.entry],
    ]);
  }, 60_000);

  it("names a day whose coverage cannot be read, and prices that day's legs at the mark with the reason", async () => {
    const copy = path.join(tmp, "recordings-damaged");
    cpSync(rec, copy, { recursive: true });
    appendFileSync(path.join(copy, "2026-11-13", "coverage.jsonl"), "x\n");
    const config = configFor({ RECORDINGS_ROOT: copy });
    expect(await daily(config, log, () => undefined, RUN, io())).toBe(0);
    expect(pageOf(config)).toContain(
      "alarm: the coverage of 2026-11-13 cannot be read — that day is a gap",
    );
    const first = positionsOf(config, "2026-12-18").find(
      (p) => p.line === "WAVE" && p.iid === 8 && p.t === WAVES[0]!.entry,
    )!;
    expect(first.priced!.markLegs).toEqual([
      "gap: the day's coverage cannot be read",
      null,
    ]);
  }, 60_000);
});
