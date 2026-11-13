/**
 * MARKET-1's daily run and look end to end (the plan's part 5) over a
 * synthetic world: a package folder of the test's own with a freeze over it,
 * a paper store written by the paper experiment's own PaperStore, recordings
 * written by the collector's own Recorder and BookSampler, synthetic
 * rule-book documents. Every value is made up; nothing real is read.
 */
import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { daily, type DailyIo } from "../src/market1/daily.js";
import { PAPER_FILES, frozenFiles } from "../src/market1/gate.js";
import { kitData } from "../src/market1/inputs.js";
import { look, lookMonday } from "../src/market1/look.js";
import { bannedWords } from "../src/market1/page.js";
import { PAPER_LOCK, type Market1Config } from "../src/market1/run.js";
import { CUT } from "../src/paper/instants.js";
import { RESEARCH_ROOT, type PanelFile } from "../src/paper/research.js";
import { PaperStore, type StoredRow } from "../src/paper/store.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { at, log, record, type Item } from "./market1-world.js";

const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
const MARKETS = [6, 7, 8, 10];
const BASE: Record<number, number> = { 6: 90_000, 7: 3_000, 8: 150, 10: 30 };
const mid = (iid: number, t: number) =>
  BASE[iid]! * (1 + 0.0001 * (Math.floor(t / MINUTE_MS) % 13));
const WAVE_T = at("2026-11-18T10:00:00Z");
const PANEL_START = CUT - 3 * DAY_MS;
const LAST_DAY = at("2026-11-23T00:00:00Z");

let tmp: string;
let pkg: string;
let config: Market1Config;
let io: DailyIo;
let A: string;
let B: string;
const children: ChildProcess[] = [];
const noStage = () => undefined;

function forcedSell(n: number, t: number, iid: number): StoredRow {
  return {
    trade_id: String(10_000 + n),
    order_id: String(20_000 + n),
    instrument_id: iid,
    timestamp: t,
    side: "short",
    price: String(mid(iid, t)),
    quantity: "3",
    previous_size: "3",
    fee: "0.2",
    pnl: "-5",
    taker: true,
    liquidation: true,
  };
}

function freeze(): void {
  const lines = frozenFiles(pkg).map(
    (f) => `${sha256(readFileSync(path.join(pkg, f)))} *${f}`,
  );
  writeFileSync(
    path.join(pkg, "market1", "FROZEN.sha256"),
    `# FROZEN: a test's\n# written 2026-11-20T00:00:00.000Z from commit test\n${lines.join("\n")}\n`,
  );
}

beforeAll(async () => {
  tmp = mkdtempSync(path.join(tmpdir(), "market1-daily-"));
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
  mkdirSync(path.join(pkg, "market1"), { recursive: true });
  writeFileSync(path.join(pkg, "market1", "rules.md"), "the rules\n");
  const real = kitData(pkg);
  [A, B] = [real.pool[0]!, real.pool[1]!];
  const paperRoot = path.join(tmp, "paper");
  const pinned = new Map<string, string>();
  mkdirSync(path.join(paperRoot, "panel-precut"), { recursive: true });
  const store = new PaperStore(paperRoot);
  for (const iid of MARKETS) {
    const minutes = (CUT - PANEL_START) / MINUTE_MS;
    const p: PanelFile = {
      iid,
      symbol: real.markets.get(iid)!.symbol,
      category: "crypto",
      start: PANEL_START,
      end: CUT,
      firstTrade: null,
      retired: null,
      marks: Array.from({ length: minutes }, (_, i) =>
        mid(iid, PANEL_START + i * MINUTE_MS),
      ),
      klines: { minute: [], trades: [], volume: [] },
      funding: [],
    };
    const bytes = gzipSync(JSON.stringify(p));
    writeFileSync(
      path.join(paperRoot, "panel-precut", `${iid}.json.gz`),
      bytes,
    );
    pinned.set(`${iid}.json.gz`, sha256(bytes));
    for (let d = CUT; d < LAST_DAY; d += DAY_MS) {
      store.saveMarketDay({
        iid,
        day: d,
        marks: Array.from({ length: 1_440 }, (_, i) =>
          mid(iid, d + i * MINUTE_MS),
        ),
        klines: { minute: [], trades: [], volume: [] },
        funding: Array.from({ length: 24 }, (_, h) => [
          d + h * HOUR_MS,
          0.00001,
          d + h * HOUR_MS + 70,
        ]),
      });
    }
  }
  // A's forced sell is read; B's (the same millisecond, another coin) only after the Monday sweep.
  store.addRows(A, [forcedSell(1, WAVE_T, 8)]);
  store.saveState({
    version: 1,
    accounts: {
      [A]: { P: at("2026-11-21T00:00:00Z"), from: CUT, holes: [] },
      [B]: { P: at("2026-11-18T00:00:00Z"), from: CUT, holes: [] },
    },
  });
  // Recordings of the four markets, 2026-11-17 to the first minutes of 11-21; a stall of market 10 over WAVE's entry.
  const items: Item[] = [];
  for (
    let ts = at("2026-11-17T00:00:00Z");
    ts < at("2026-11-21T00:00:30Z");
    ts += 30_000
  ) {
    for (const iid of MARKETS) {
      if (iid === 10 && ts >= WAVE_T + MINUTE_MS && ts < WAVE_T + 3 * MINUTE_MS)
        continue;
      const m = mid(iid, ts);
      items.push({
        kind: "frame",
        iid,
        ts,
        recv: ts + 120,
        bids: [
          [String(m * 0.999), "50"],
          [String(m * 0.998), "50"],
        ],
        asks: [
          [String(m * 1.001), "50"],
          [String(m * 1.002), "50"],
        ],
      });
    }
  }
  // The collector marks its REST pause every night: every day has a coverage file.
  for (
    let d = at("2026-11-17T00:00:00Z");
    d < at("2026-11-21T00:00:00Z");
    d += DAY_MS
  ) {
    items.push(
      {
        kind: "coverage",
        at: d + 155 * MINUTE_MS,
        event: { event: "rest_pause", state: "start" },
      },
      {
        kind: "coverage",
        at: d + 230 * MINUTE_MS,
        event: { event: "rest_pause", state: "end" },
      },
    );
  }
  items.push(
    {
      kind: "coverage",
      at: WAVE_T + MINUTE_MS + 15_000,
      event: { event: "market_stall", iid: 10, lastFrameAt: WAVE_T + 30_120 },
    },
    {
      kind: "coverage",
      at: WAVE_T + 3 * MINUTE_MS + 120,
      event: { event: "market_resume", iid: 10, gapMs: 1 },
    },
  );
  await record(
    path.join(tmp, "recordings"),
    items,
    at("2026-11-17T00:00:00Z"),
    at("2026-11-21T00:01:00Z"),
  );
  config = {
    STATE_DIR: path.join(tmp, "var"),
    MARKET1_ROOT: path.join(tmp, "market1"),
    MARKET1_BACKUP: path.join(tmp, "backup"),
    PAPER_ROOT: paperRoot,
    RECORDINGS_ROOT: path.join(tmp, "recordings"),
    MONGO_URI: "mongodb://unused",
    MONGO_DB: "polymarket_follow_test",
  };
  mkdirSync(config.STATE_DIR, { recursive: true });
  io = {
    packageRoot: pkg,
    kd: { ...real, pinned },
    ruleBook: () => Promise.resolve([]),
  };
}, 180_000);
afterAll(() => {
  for (const c of children) c.kill();
  rmSync(tmp, { recursive: true, force: true });
});

const logOf = (date: string) =>
  readFileSync(path.join(config.MARKET1_ROOT, "log", `${date}.jsonl`), "utf8")
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l) as Record<string, unknown>);
const positionsOf = (date: string) =>
  gunzipSync(
    readFileSync(
      path.join(config.MARKET1_ROOT, "log", `${date}-positions.jsonl.gz`),
    ),
  )
    .toString("utf8")
    .split("\n")
    .map(
      (l) =>
        JSON.parse(l) as {
          line: string;
          iid: number;
          firstSeen: string;
          priced: { net: number | null; markLegs: (string | null)[] } | null;
        },
    );

describe("MARKET-1's daily run and look, end to end", () => {
  it("refuses without a valid freeze with nothing sealed opened, then runs a day, a Monday's sweep, a look and the page", async () => {
    // 1. No freeze: exit 4, one log line, nothing else written; the paper store untouched.
    expect(
      await daily(config, log, noStage, at("2026-11-21T10:30:00Z"), io),
    ).toBe(4);
    expect(readdirSync(config.MARKET1_ROOT)).toEqual(["log"]);
    expect(logOf("2026-11-21").at(-1)).toMatchObject({
      line: "frozen files differ",
      problems: ["no market1/FROZEN.sha256"],
    });
    freeze();
    writeFileSync(
      path.join(pkg, "market1", "rules.md"),
      "the rules, changed\n",
    );
    expect(
      await daily(config, log, noStage, at("2026-11-21T10:30:00Z"), io),
    ).toBe(4);
    expect(logOf("2026-11-21").at(-1)).toMatchObject({
      problems: ["changed: market1/rules.md"],
    });
    writeFileSync(path.join(pkg, "market1", "rules.md"), "the rules\n");

    // 2. A paper run live: MARKET-1 waits, gives up, reads nothing of it (exit 5).
    const holder = spawn(process.execPath, ["-e", "setTimeout(()=>{},60000)"], {
      stdio: "ignore",
    });
    children.push(holder);
    writeFileSync(
      path.join(config.STATE_DIR, PAPER_LOCK.lock),
      `${holder.pid}\n`,
    );
    writeFileSync(path.join(config.STATE_DIR, PAPER_LOCK.heartbeat), "{}\n");
    let t = Date.now();
    const giveUp = {
      now: () => t,
      sleep: (ms: number) => {
        t += ms * 400;
        // The paper run's heartbeat stays fresh in the fake clock's time.
        const beat = path.join(config.STATE_DIR, PAPER_LOCK.heartbeat);
        utimesSync(beat, new Date(t), new Date(t));
        return Promise.resolve();
      },
    };
    const live = await daily(config, log, noStage, at("2026-11-21T10:30:00Z"), {
      ...io,
      paperClock: giveUp,
    });
    expect(live).toBe(5);
    expect(existsSync(path.join(config.MARKET1_ROOT, "page"))).toBe(false);
    rmSync(path.join(config.STATE_DIR, PAPER_LOCK.lock));

    // 3. A normal day: A alone, no wave; its episode in 8 is B1's.
    expect(
      await daily(config, log, noStage, at("2026-11-21T10:30:00Z"), io),
    ).toBe(0);
    const first = positionsOf("2026-11-21");
    expect(first.filter((p) => p.line === "WAVE")).toEqual([]);
    expect(first.filter((p) => p.line === "B1").map((p) => p.iid)).toEqual([8]);
    const line1 = logOf("2026-11-21").at(-1)!;
    expect(line1).toMatchObject({
      end: "2026-11-21T00:00:00.000Z",
      format: { daysClosed: 4, daysChecked: 4, linesFailed: 0, alarmDays: [] },
      legsDecided: 2,
    });
    expect(readdirSync(path.join(config.MARKET1_ROOT, "days")).sort()).toEqual([
      "2026-11-17.json",
      "2026-11-18.json",
      "2026-11-19.json",
      "2026-11-20.json",
    ]);

    // 4. The Monday's sweep reads B's forced sell of last Wednesday: the wave appears, first seen that day.
    const store = new PaperStore(config.PAPER_ROOT);
    store.addRows(B, [forcedSell(2, WAVE_T, 10)]);
    const state = store.readState();
    state.accounts[B]!.P = at("2026-11-22T00:00:00Z");
    state.accounts[A]!.P = at("2026-11-22T00:00:00Z");
    store.saveState(state);
    expect(
      await daily(config, log, noStage, at("2026-11-22T10:30:00Z"), io),
    ).toBe(0);
    const second = positionsOf("2026-11-22");
    const wave = second.filter((p) => p.line === "WAVE");
    expect(wave.map((p) => [p.iid, p.firstSeen])).toEqual([
      [8, "2026-11-22"],
      [10, "2026-11-22"],
    ]);
    // 8 at the book on both legs; 10's entry in the stall, at the mark.
    expect(wave[0]!.priced!.markLegs).toEqual([null, null]);
    expect(wave[1]!.priced!.markLegs).toEqual(["gap: market stall", null]);
    expect(
      second.filter((p) => p.line === "B1").find((p) => p.iid === 8)!.firstSeen,
    ).toBe("2026-11-21");
    expect(second.filter((p) => p.line === "B7").map((p) => p.iid)).toEqual([
      6, 7, 6, 7,
    ]);
    // The record: the legs decided once, kept with their lines; the manifest; the backup.
    const books = readdirSync(path.join(config.MARKET1_ROOT, "books")).sort();
    expect(books).toEqual([
      "2026-11-21-103000.jsonl.gz",
      "2026-11-22-103000.jsonl.gz",
    ]);
    const manifest = readFileSync(
      path.join(config.MARKET1_ROOT, "manifest", "2026-11-22.sha256"),
      "utf8",
    );
    expect(manifest).toContain("*books/2026-11-22-103000.jsonl.gz");
    expect(manifest).toContain("*log/2026-11-22-positions.jsonl.gz");
    for (const rel of [
      "books/2026-11-22-103000.jsonl.gz",
      "days/2026-11-17.json",
      "log/2026-11-22.jsonl",
      "page/index.html",
      "seen.json",
    ])
      expect(existsSync(path.join(config.MARKET1_BACKUP, rel)), rel).toBe(true);
    const page = readFileSync(
      path.join(config.MARKET1_ROOT, "page", "index.html"),
      "utf8",
    );
    expect(bannedWords(page)).toEqual([]);
    expect(page).toContain("Too early to judge — next look 2026-12-19.");
    expect(page).toContain("Partial: the rest of the pool is read on Monday");
    expect(page).toContain("../../paper/page/index.html");
    expect(page).not.toContain("<script");

    // 5. A rerun reprices from the record: the same numbers, no leg decided again.
    expect(
      await daily(config, log, noStage, at("2026-11-22T11:30:00Z"), io),
    ).toBe(0);
    expect(logOf("2026-11-22").at(-1)).toMatchObject({ legsDecided: 0 });
    const again = positionsOf("2026-11-22").filter((p) => p.line === "WAVE");
    expect(again.map((p) => p.priced!.net)).toEqual(
      wave.map((p) => p.priced!.net),
    );

    // 6. The look: not due, then not ready, then 7 days past its Monday it runs with what is missing listed.
    const monday = lookMonday(1);
    expect(new Date(monday).toISOString()).toBe("2026-12-21T00:00:00.000Z");
    expect(await look(config, log, 1, monday - 1, io)).toBe(5);
    expect(await look(config, log, 1, monday + DAY_MS, io)).toBe(5);
    expect(logOf("2026-12-22").at(-1)!.line).toMatch(
      /^the look is not ready: /,
    );
    expect(await look(config, log, 1, monday + 8 * DAY_MS, io)).toBe(0);
    const result = JSON.parse(
      readFileSync(
        path.join(config.MARKET1_ROOT, "looks", "L1", "result.json"),
        "utf8",
      ),
    ) as {
      verdict: string;
      forced: boolean;
      missing: string[];
      wave: { positions: number; notAtBook: number };
    };
    // Two positions, one with a leg at the mark: 50% not at the book.
    expect(result).toMatchObject({
      verdict: "WITHHELD",
      forced: true,
      wave: { positions: 2, notAtBook: 1 },
    });
    expect(result.missing.length).toBeGreaterThan(0);
    expect(await look(config, log, 1, monday + 9 * DAY_MS, io)).toBe(5);
    expect(logOf("2026-12-30").at(-1)!.line).toBe("the look has run already");

    // 7. The page after the look: its verdict box, nothing banned.
    expect(await daily(config, log, noStage, monday + 9 * DAY_MS, io)).toBe(0);
    const after = readFileSync(
      path.join(config.MARKET1_ROOT, "page", "index.html"),
      "utf8",
    );
    expect(after).toContain("Look 1 (2026-12-19): WAVE WITHHELD.");
    expect(after).toContain("Next look 2027-02-06.");
    expect(bannedWords(after)).toEqual([]);
  }, 180_000);
});
