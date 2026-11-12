/**
 * A whole run of the experiment, `daily()`, end to end: the real kit and the
 * experiment's code, a package folder of the test's own with its freeze, the
 * synthetic API through the real client, reader, loop and store, and
 * synthetic rule-book documents. The world, one market (6) with data:
 * - A and C, slow pool traders who open one position every evening from the
 *   cut on and leave it the next morning; A is also a favourite;
 * - F, a favourite outside the pool who trades the same way;
 * - B, a fast pool trader no list holds (read by the Monday sweeps only);
 * - N, a pool account the API does not know;
 * - the collector's market list drops market 6 on 2026-11-28.
 * Every value is made up; nothing is read from the real API, the
 * experiment's folder or the collector.
 */
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { daily, fixedInputs, type FixedInputs } from "../src/paper/daily.js";
import { CUT } from "../src/paper/instants.js";
import {
  RESEARCH_ROOT,
  loadResearch,
  type PanelFile,
} from "../src/paper/research.js";
import { LINES, type CopyRecord, type LineName } from "../src/paper/score.js";
import type { SeedAccount } from "../src/paper/seed.js";
import { PaperStore, type StoredRow } from "../src/paper/store.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import {
  addr,
  emptyWorld,
  fakeApi,
  log,
  row,
  type RawRow,
} from "./paper-world.js";

const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
const at = (iso: string) => Date.parse(iso);
const day = (t: number) => new Date(t).toISOString().slice(0, 10);

const A = addr(0xa1);
const C = addr(0xc1);
const F = addr(0xf1);
const B = addr(0xb1);
const N = addr(0xd1);
const F0 = at("2026-11-18T00:00:00Z");
/** F is read from 30 days before F0's Monday (R2, R5). */
const F_FROM = at("2026-10-17T00:00:00Z");
const LAST_DAY = at("2026-11-29T00:00:00Z");
/** The day of the collector's list without market 6: its entries from then are left out (R6). */
const DELISTED = at("2026-11-28T00:00:00Z");
/** The collector's taker rate here: not the kit's (0.0004), so that its use shows. */
const BOOK_TAKER = 0.0007;

/** A slow trader's position of a day: opened in the evening, left the next morning, 8-12 h later. */
function cycle(dayStart: number, k: number) {
  const open = dayStart + 20 * HOUR_MS + (k % 3) * 20 * MINUTE_MS;
  return {
    open,
    close: open + (8 + (k % 5)) * HOUR_MS,
    side: k % 3 ? ("long" as const) : ("short" as const),
    q: 1 + (k % 4),
  };
}

/** A pool trader before the cut, as the seed holds it: one position a day for 24 days, the last left before the cut. */
function seedOf(who: string, shift: number, idBase: number): SeedAccount {
  const rows: StoredRow[] = [];
  let n = idBase;
  const fill = (
    t: number,
    side: "long" | "short",
    q: number,
    prev: number,
  ): StoredRow => {
    n += 1;
    return {
      trade_id: String(n),
      order_id: String(n),
      instrument_id: 6,
      timestamp: t,
      side,
      price: "100",
      quantity: String(q),
      previous_size: String(prev),
      fee: "0",
      pnl: "0",
      taker: true,
      liquidation: false,
    };
  };
  for (let d = CUT - 25 * DAY_MS, k = 0; d <= CUT - 2 * DAY_MS; d += DAY_MS) {
    const c = cycle(d, (k += 1) + shift);
    rows.push(fill(c.open, c.side, c.q, 0));
    const other = c.side === "long" ? "short" : "long";
    rows.push(fill(c.close, other, c.q, c.side === "long" ? c.q : -c.q));
  }
  return { addr: who, pages: 1, truncated: false, rows, dropped: 0 };
}

/** A slow trader's positions as the API writes them: one a day from `first` to 11-29. */
function positionsFrom(first: number, shift: number, idBase: number) {
  const out: { open: number; close: number }[] = [];
  const rows: RawRow[] = [];
  for (let d = first, k = 0; d <= LAST_DAY; d += DAY_MS, k += 1) {
    const c = cycle(d, k + shift);
    const other = c.side === "long" ? "short" : "long";
    rows.push(
      row(idBase + 2 * k, c.open, {
        side: c.side,
        quantity: String(c.q),
        previous_size: "0",
      }),
      row(idBase + 2 * k + 1, c.close, {
        side: other,
        quantity: String(c.q),
        previous_size: String(c.side === "long" ? c.q : -c.q),
      }),
    );
    out.push({ open: c.open, close: c.close });
  }
  return { rows, out };
}

const slow = {
  [A]: positionsFrom(CUT, 0, 0),
  [C]: positionsFrom(CUT, 1, 300),
  [F]: positionsFrom(F_FROM, 2, 500),
};

const world = emptyWorld();
for (const [who, p] of Object.entries(slow)) world.fills.set(who, p.rows);
world.fills.set(B, [
  row(900, at("2026-11-24T10:00:00Z"), {
    side: "long",
    quantity: "1",
    previous_size: "0",
  }),
  row(901, at("2026-11-24T10:30:00Z"), {
    side: "short",
    quantity: "1",
    previous_size: "1",
  }),
]);
world.notFound.add(N);

/** Market 6's pre-cut panel, the two days before the cut: the synthetic API's marks, klines and funding. */
function precutPanel(): PanelFile {
  const start = CUT - 2 * DAY_MS;
  const n = (CUT - start) / MINUTE_MS;
  const m0 = start / MINUTE_MS;
  const minute: number[] = [];
  for (let i = 0; i < n; i += 1) if ((m0 + i) % 3 === 0) minute.push(i);
  const funding: [number, number, number][] = [];
  for (let h = start + HOUR_MS; h < CUT; h += HOUR_MS)
    funding.push([h, 0.0000125, h + 50]);
  return {
    iid: 6,
    symbol: "BTC-USD",
    category: "crypto",
    start,
    end: CUT,
    firstTrade: start,
    retired: null,
    marks: Array.from({ length: n }, (_, i) => 100 + ((m0 + i) % 7)),
    klines: {
      minute,
      trades: minute.map(() => 4),
      volume: minute.map(() => 0.125),
    },
    funding,
  };
}

/** The collector's rule book: a fee schedule, the market list (without 6 from 11-28), a split event, a refused document. */
const docs: { at?: number; [field: string]: unknown }[] = [
  {
    kind: "fees",
    key: "schedule",
    at: CUT - DAY_MS,
    value: [
      {
        instrument_type: "perpetual",
        category: "crypto",
        taker_fee_rate: String(BOOK_TAKER),
        maker_fee_rate: "0.0001",
        tiers: [],
      },
    ],
  },
  {
    kind: "instruments",
    key: "list",
    at: CUT - DAY_MS,
    value: [{ instrument_id: 6, symbol: "BTC-USD" }],
  },
  {
    kind: "instruments",
    key: "list",
    at: DELISTED + 10 * MINUTE_MS,
    value: [{ instrument_id: 7, symbol: "ETH-USD" }],
  },
  { kind: "splits", key: "events", at: CUT + DAY_MS, value: [{ any: 1 }] },
  { nonsense: true },
];

function filesUnder(root: string, rel: string): string[] {
  const full = path.join(root, rel);
  if (!statSync(full).isDirectory()) return [rel];
  return readdirSync(full)
    .sort()
    .flatMap((name) => filesUnder(root, `${rel}/${name}`));
}

/** The freeze as tools/paper-freeze.cjs writes it, over this package folder (no dist in it). */
function freeze(pkg: string): string {
  const lines = ["research", "experiment"]
    .flatMap((d) => filesUnder(pkg, d))
    .filter((f) => !f.startsWith("experiment/FROZEN"))
    .map((f) => `${sha256(readFileSync(path.join(pkg, f)))} *${f}`);
  const text = `${lines.join("\n")}\n`;
  writeFileSync(path.join(pkg, "experiment", "FROZEN.sha256"), text);
  return sha256(text);
}

type LogRecord = {
  line?: string;
  problems?: string[];
  frozen?: string;
  reading?: { end: string };
  copies?: number;
  lines?: { name: LineName; positions: number; open: number }[];
};

const logLines = (root: string, date: string): LogRecord[] =>
  readFileSync(path.join(root, "log", `${date}.jsonl`), "utf8")
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l) as LogRecord);

const positions = (root: string, date: string): CopyRecord[] =>
  gunzipSync(readFileSync(path.join(root, "log", `${date}-positions.jsonl.gz`)))
    .toString("utf8")
    .split("\n")
    .filter((l) => l !== "")
    .map((l) => JSON.parse(l) as CopyRecord);

const TITLES: Record<LineName, string> = {
  MAIN: "Main line (decides)",
  TEN: "Ten closed cycles",
  BROAD: "Every directional trader",
  DAY: "Day-holders",
  FAV: "Your favourites",
};

type Counts = {
  positions: number;
  traders: number;
  days: number;
  open: number;
};

/** The five lines' rows of the written page. */
function pageLines(root: string): Record<LineName, Counts> {
  const html = readFileSync(path.join(root, "page", "index.html"), "utf8");
  return Object.fromEntries(
    LINES.map((name) => {
      const title = TITLES[name].replace(/[()]/g, "\\$&");
      const m = new RegExp(
        `<tr><td>${title}</td><td>(\\d+)</td><td>(\\d+)</td><td>(\\d+)</td><td>(\\d+)</td>`,
      ).exec(html);
      if (m === null) throw new Error(`the page has no row for ${name}`);
      return [
        name,
        { positions: +m[1]!, traders: +m[2]!, days: +m[3]!, open: +m[4]! },
      ];
    }),
  ) as Record<LineName, Counts>;
}

/** The same counts from the day's log of every copy. */
function linesOf(copies: readonly CopyRecord[]): Record<LineName, Counts> {
  return Object.fromEntries(
    LINES.map((name) => {
      const cs = copies.filter((c) => c.lines.includes(name));
      return [
        name,
        {
          positions: cs.length,
          traders: new Set(cs.map((c) => c.addr)).size,
          days: new Set(cs.map((c) => day(c.tIn))).size,
          open: cs.filter((c) => c.plan.flag !== null).length,
        },
      ];
    }),
  ) as Record<LineName, Counts>;
}

/** A trader's copy by the instant of the trader's fill. */
const copyAt = (copies: readonly CopyRecord[], who: string, t: number) => {
  const c = copies.find((x) => x.addr === who && x.t === t);
  if (c === undefined)
    throw new Error(`no copy of ${who} at ${new Date(t).toISOString()}`);
  return c;
};

/**
 * The log's copies are exactly: A's and C's positions, in MAIN, TEN and BROAD
 * (A's in FAV too from F0), F's from F0, in FAV only — none from the day
 * market 6 left the list; DAY holds none. Each one the trader left before END
 * is closed with that exit; one still open is marked at END's last millisecond.
 */
function expectCopies(copies: readonly CopyRecord[], end: number): void {
  const want = Object.entries(slow).flatMap(([who, p]) =>
    p.out
      .filter(
        (x) => x.open < end && x.open < DELISTED && (who !== F || x.open >= F0),
      )
      .map((x) => ({
        who,
        x,
        lines:
          who === F
            ? ["FAV"]
            : [
                "BROAD",
                "MAIN",
                "TEN",
                ...(who === A && x.open >= F0 ? ["FAV"] : []),
              ],
      })),
  );
  expect(copies.map((c) => `${c.addr} ${c.t}`).sort()).toEqual(
    want.map((w) => `${w.who} ${w.x.open}`).sort(),
  );
  for (const { who, x, lines } of want) {
    const c = copyAt(copies, who, x.open);
    expect([...c.lines].sort()).toEqual([...lines].sort());
    expect(c.money?.net).toEqual(expect.any(Number));
    if (x.close < end) {
      expect(c.plan.flag).toBeNull();
      expect(c.plan.legs).toEqual([
        {
          h: x.close - x.open,
          part: 1,
          kind: "CLOSE",
          forced: false,
          liq: false,
        },
      ]);
    } else {
      expect(c.plan.flag).toBe("open");
      expect(c.plan.legs).toEqual([
        { h: end - 1 - c.tIn, part: 1, kind: "cut", forced: false, liq: false },
      ]);
    }
  }
}

describe("a whole run, daily() (R0, R3a, R15; the plan's section 3)", () => {
  it(
    "refuses to read without a valid freeze, then reads a first run across weeks (paused once at night and resumed), a normal day and a Monday's sweep, and writes the log of every copy and the page",
    { timeout: 120_000 },
    async () => {
      const tmp = mkdtempSync(path.join(tmpdir(), "paper-e2e-"));
      try {
        // The package folder: the real research files, the experiment's files of this world.
        const pkg = path.join(tmp, "pkg");
        cpSync(RESEARCH_ROOT, path.join(pkg, "research"), { recursive: true });
        const experiment = path.join(pkg, "experiment");
        mkdirSync(experiment, { recursive: true });
        const rules = "# The rules (a test's)\n";
        writeFileSync(path.join(experiment, "rules.md"), rules);
        writeFileSync(
          path.join(experiment, "favourites.txt"),
          `from ${new Date(F0).toISOString()}\n${A}\n${F}\n`,
        );
        const seeds = new Map([
          [A, gzipSync(JSON.stringify(seedOf(A, 0, 0)))],
          [C, gzipSync(JSON.stringify(seedOf(C, 1, 100)))],
        ]);
        writeFileSync(
          path.join(experiment, "seed.sha256"),
          [...seeds].map(([w, b]) => `${sha256(b)} *${w}.json.gz\n`).join(""),
        );
        const panelBytes = gzipSync(JSON.stringify(precutPanel()));
        const paperRoot = (name: string) => {
          const root = path.join(tmp, name);
          mkdirSync(path.join(root, "seed"), { recursive: true });
          mkdirSync(path.join(root, "panel-precut"), { recursive: true });
          for (const [w, b] of seeds)
            writeFileSync(path.join(root, "seed", `${w}.json.gz`), b);
          writeFileSync(
            path.join(root, "panel-precut", "6.json.gz"),
            panelBytes,
          );
          return root;
        };
        const root = paperRoot("paper");
        const control = paperRoot("paper-control");

        // The fixed inputs from the package folder: the kit's own, the experiment's files of this world.
        const kit = await loadResearch(path.join(pkg, "research"));
        const real = fixedInputs(kit, pkg);
        expect([
          real.pool.length,
          real.markets.length,
          real.pinned.size,
        ]).toEqual([1602, 84, 92]);
        expect(real.markets).toContain(6);
        expect(real.favourites).toEqual({ from: F0, addrs: [A, F] });
        expect(real.seedManifest).toEqual(
          new Map([...seeds].map(([w, b]) => [`${w}.json.gz`, sha256(b)])),
        );
        // This world's pool and market in place of the kit's 1,602 accounts and 84 markets.
        const fixed: FixedInputs = {
          ...real,
          pool: [A, B, C, N].map((a) => ({ addr: a, notionalBoard: false })),
          markets: [6],
          pinned: new Map([["6.json.gz", sha256(panelBytes)]]),
        };

        const run = async (paper: string, iso: string) => {
          const now = at(iso);
          const api = fakeApi(world, now);
          const stages: string[] = [];
          const exit = await daily(
            {
              PAPER_ROOT: paper,
              PAPER_BACKUP: `${paper}-backup`,
              MONGO_URI: "mongodb://127.0.0.1:1",
              MONGO_DB: "polymarket_follow_test",
            },
            log,
            (s) => stages.push(s),
            now,
            {
              packageRoot: pkg,
              fetchFn: api.fetchFn,
              clock: api.clock,
              // The collector's records up to the run.
              ruleBook: () =>
                Promise.resolve(docs.filter((d) => (d.at ?? 0) < now)),
              fixed,
            },
          );
          return { exit, calls: api.calls, stages };
        };
        const fillsCalls = (calls: { url: URL }[]) =>
          calls
            .filter((c) => c.url.pathname === "/v1/info/fills")
            .map((c) => ({
              address: c.url.searchParams.get("address"),
              start: day(Number(c.url.searchParams.get("start_timestamp"))),
              end: day(Number(c.url.searchParams.get("end_timestamp"))),
            }));
        const marketDays = (paper: string) =>
          readdirSync(path.join(paper, "panel", "6")).length;

        // 1. No freeze: one log line, no request, nothing written but the log.
        const unfrozen = await run(root, "2026-11-25T02:32:00Z");
        expect(unfrozen).toMatchObject({ exit: 4, calls: [], stages: [] });
        expect(readdirSync(root).sort()).toEqual([
          "log",
          "panel-precut",
          "seed",
        ]);
        expect(logLines(root, "2026-11-25").at(-1)).toMatchObject({
          line: "frozen files differ",
          problems: ["no experiment/FROZEN.sha256"],
        });
        // A frozen file changed after the freeze: the same refusal.
        const frozenHash = freeze(pkg);
        writeFileSync(
          path.join(experiment, "rules.md"),
          `${rules}one more line\n`,
        );
        const changed = await run(root, "2026-11-25T02:32:00Z");
        expect(changed).toMatchObject({ exit: 4, calls: [] });
        expect(logLines(root, "2026-11-25").at(-1)).toMatchObject({
          line: "frozen files differ",
          problems: ["changed: experiment/rules.md"],
        });
        writeFileSync(path.join(experiment, "rules.md"), rules);

        // 2. The first run, started at 02:32Z: the backlog from the cut, paused before 02:35Z.
        const first = await run(root, "2026-11-25T02:32:00Z");
        expect(first.exit).toBe(0);
        expect(first.stages).toEqual([
          "reading the rule book",
          "reading",
          "scoring",
          "writing",
        ]);
        expect(logLines(root, "2026-11-25").at(-1)!.reading!.end).toBe(
          "paused",
        );
        expect(first.calls.length).toBeGreaterThan(0);
        expect(
          first.calls.every((c) => c.wall < at("2026-11-25T02:35:00Z")),
        ).toBe(true);
        const readBeforePause = marketDays(root);
        expect(readBeforePause).toBeGreaterThan(0);
        expect(readBeforePause).toBeLessThan(18);
        expect(
          readFileSync(path.join(root, "page", "index.html"), "utf8"),
        ).toContain("reading ended: paused");

        // 3. The same day at 04:00Z: it resumes and ends with what one run without the pause gives.
        const resumed = await run(root, "2026-11-25T04:00:00Z");
        const once = await run(control, "2026-11-25T04:00:00Z");
        expect([resumed.exit, once.exit]).toEqual([0, 0]);
        expect(logLines(root, "2026-11-25").at(-1)!.reading!.end).toBe("done");
        expect(marketDays(root)).toBe(18);
        const end25 = at("2026-11-25T00:00:00Z");
        const copies25 = positions(root, "2026-11-25");
        expect(copies25).toEqual(positions(control, "2026-11-25"));
        expect(
          JSON.parse(readFileSync(path.join(root, "state.json"), "utf8")),
        ).toEqual(
          JSON.parse(readFileSync(path.join(control, "state.json"), "utf8")),
        );
        expectCopies(copies25, end25);
        expect(copies25).toHaveLength(18 + 18 + 7);
        // The slow ones read to END; B by the sweeps of the weeks over; N once, then a standing hole.
        const state25 = new PaperStore(root).readState();
        expect(state25.accounts[A]).toMatchObject({ from: CUT, P: end25 });
        expect(state25.accounts[C]).toMatchObject({ from: CUT, P: end25 });
        expect(state25.accounts[F]).toMatchObject({ from: F_FROM, P: end25 });
        expect(state25.accounts[B]!.P).toBe(at("2026-11-23T00:00:00Z"));
        expect(state25.accounts[N]!.holes).toMatchObject([
          { cause: "account not found", readOn: "2026-11-25" },
        ]);

        // 4. A normal day: the list (A and C by their label, A and F as favourites) and the day's market data, nothing swept.
        const normal = await run(root, "2026-11-26T04:00:00Z");
        expect(normal.exit).toBe(0);
        expect(fillsCalls(normal.calls)).toEqual(
          [A, C, F].map((address) => ({
            address,
            start: "2026-11-25",
            end: "2026-11-26",
          })),
        );
        const other = normal.calls.filter(
          (c) => c.url.pathname !== "/v1/info/fills",
        );
        expect(other.length).toBeGreaterThan(0);
        for (const c of other) {
          expect(c.url.searchParams.get("instrument_id")).toBe("6");
          expect(day(Number(c.url.searchParams.get("start_timestamp")))).toBe(
            "2026-11-25",
          );
        }
        const end26 = at("2026-11-26T00:00:00Z");
        const copies26 = positions(root, "2026-11-26");
        expectCopies(copies26, end26);
        // The position A opened on 11-24 was open at the last run's END; A left it on 11-25: closed now.
        const a24 = slow[A]!.out.find((x) => day(x.open) === "2026-11-24")!;
        expect(copyAt(copies25, A, a24.open).plan.flag).toBe("open");
        expect(copyAt(copies26, A, a24.open).plan.flag).toBeNull();

        // 5. Monday 11-30: the week of 11-23 is over, so the rest of the pool is swept for it.
        const monday = await run(root, "2026-11-30T04:00:00Z");
        expect(monday.exit).toBe(0);
        expect(fillsCalls(monday.calls)).toEqual([
          { address: A, start: "2026-11-26", end: "2026-11-30" },
          { address: C, start: "2026-11-26", end: "2026-11-30" },
          { address: F, start: "2026-11-26", end: "2026-11-30" },
          { address: B, start: "2026-11-23", end: "2026-11-30" },
        ]);
        expect(marketDays(root)).toBe(23);
        expect(new PaperStore(root).readRows(B)).toHaveLength(2);
        const end30 = at("2026-11-30T00:00:00Z");
        const copies30 = positions(root, "2026-11-30");
        expectCopies(copies30, end30);
        expect(copies30).toHaveLength(21 + 21 + 10);

        // The log's record and the page agree with the log of every copy, line by line.
        const record = logLines(root, "2026-11-30").at(-1)!;
        expect(record).toMatchObject({
          frozen: frozenHash,
          reading: { end: "done" },
          copies: 52,
        });
        const lines = linesOf(copies30);
        expect(lines).toEqual({
          MAIN: { positions: 42, traders: 2, days: 21, open: 0 },
          TEN: { positions: 42, traders: 2, days: 21, open: 0 },
          BROAD: { positions: 42, traders: 2, days: 21, open: 0 },
          DAY: { positions: 0, traders: 0, days: 0, open: 0 },
          FAV: { positions: 20, traders: 2, days: 10, open: 0 },
        });
        expect(pageLines(root)).toEqual(lines);
        expect(
          record.lines!.map(({ name, positions: p, open }) => [name, p, open]),
        ).toEqual(
          LINES.map((name) => [name, lines[name].positions, lines[name].open]),
        );
        const page = readFileSync(
          path.join(root, "page", "index.html"),
          "utf8",
        );
        expect(page).toContain(`SHA-256 ${frozenHash}`);
        expect(page).toContain("reading ended: done");
        expect(page).toContain("holes: 1 in 1 accounts (account not found 1)");
        expect(page).toContain("market-days missing: 0");
        expect(page).toContain(`this run: ${monday.calls.length} calls`);
        // The rule book reached the run: the entries after 6 left the list are counted apart, its taker rate prices each copy in and out, its split event and refused document are named.
        expect(page).toContain(
          "unpriced positions: 0; positions in markets outside the primary cells: 6",
        );
        expect(kit.costs.feeAt("taker", 6, CUT)).toBeLessThan(BOOK_TAKER);
        for (const c of copies30) {
          expect(c.money!.fees).toBeGreaterThan(2 * BOOK_TAKER * 1e4 * 0.9);
          expect(c.money!.fees).toBeLessThan(2 * BOOK_TAKER * 1e4 * 1.1);
        }
        expect(page).toContain(
          "split events recorded by the collector: 1 — the rules cannot read them; a recorded fix is needed; rule-book documents refused: 1",
        );
        const all = readFileSync(
          path.join(root, "page", "positions.html"),
          "utf8",
        );
        for (const [who, n] of [
          [A, 21],
          [C, 21],
          [F, 10],
        ] as const)
          expect(all.split(`<tr><td class="l">${who}</td>`).length - 1).toBe(n);
        expect(all).toContain('<td class="l">BTC-USD</td>');
        // The day's manifest names each market-day the run wrote, with its hash.
        const manifest = readFileSync(
          path.join(root, "manifest", "2026-11-30.sha256"),
          "utf8",
        );
        for (const d of [
          "2026-11-26",
          "2026-11-27",
          "2026-11-28",
          "2026-11-29",
        ]) {
          const rel = `panel/6/${d}.json.gz`;
          expect(manifest).toContain(
            `${sha256(readFileSync(path.join(root, rel)))} *${rel}`,
          );
        }
        // The run's own backup holds the page and the state.
        expect(existsSync(`${root}-backup/page/index.html`)).toBe(true);
        expect(existsSync(`${root}-backup/state.json`)).toBe(true);
      } finally {
        rmSync(tmp, { recursive: true, force: true });
      }
    },
  );
});
