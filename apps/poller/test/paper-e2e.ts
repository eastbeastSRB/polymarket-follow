/**
 * The end-to-end world of the experiment's tests (`paper-daily`,
 * `paper-look`): the real kit and the experiment's code, a package folder of
 * the test's own, the synthetic API through the real client, reader, loop and
 * store, and synthetic rule-book documents. The world, one market (6) with
 * data:
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
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { expect } from "vitest";
import { daily, fixedInputs, type FixedInputs } from "../src/paper/daily.js";
import { CUT } from "../src/paper/instants.js";
import { look } from "../src/paper/look.js";
import {
  RESEARCH_ROOT,
  loadResearch,
  type PanelFile,
} from "../src/paper/research.js";
import { LINES, type CopyRecord, type LineName } from "../src/paper/score.js";
import type { SeedAccount } from "../src/paper/seed.js";
import type { StoredRow } from "../src/paper/store.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import {
  addr,
  emptyWorld,
  fakeApi,
  log,
  row,
  type RawRow,
} from "./paper-world.js";

export const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");
export const at = (iso: string) => Date.parse(iso);
export const day = (t: number) => new Date(t).toISOString().slice(0, 10);

export const A = addr(0xa1);
export const C = addr(0xc1);
export const F = addr(0xf1);
export const B = addr(0xb1);
export const N = addr(0xd1);
export const F0 = at("2026-11-18T00:00:00Z");
/** F is read from 30 days before F0's Monday (R2, R5). */
export const F_FROM = at("2026-10-17T00:00:00Z");
export const LAST_DAY = at("2026-12-20T00:00:00Z");
/** The day of the collector's list without market 6: its entries from then are left out (R6). */
export const DELISTED = at("2026-11-28T00:00:00Z");
/** The collector's taker rate here: not the kit's (0.0004), so that its use shows. */
export const BOOK_TAKER = 0.0007;

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

/** A slow trader's positions as the API writes them: one a day from `first` to 12-20. */
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

export const slow = {
  [A]: positionsFrom(CUT, 0, 0),
  [C]: positionsFrom(CUT, 1, 300),
  [F]: positionsFrom(F_FROM, 2, 500),
};

export const world = emptyWorld();
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
export const docs: { at?: number; [field: string]: unknown }[] = [
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
export function freeze(pkg: string): string {
  const lines = ["research", "experiment"]
    .flatMap((d) => filesUnder(pkg, d))
    .filter((f) => !f.startsWith("experiment/FROZEN"))
    .map((f) => `${sha256(readFileSync(path.join(pkg, f)))} *${f}`);
  const text = `${lines.join("\n")}\n`;
  writeFileSync(path.join(pkg, "experiment", "FROZEN.sha256"), text);
  return sha256(text);
}

export type LogRecord = {
  line?: string;
  problems?: string[];
  frozen?: string;
  reading?: { end: string };
  copies?: number;
  lines?: { name: LineName; positions: number; open: number }[];
};

export const logLines = (root: string, date: string): LogRecord[] =>
  readFileSync(path.join(root, "log", `${date}.jsonl`), "utf8")
    .trim()
    .split("\n")
    .map((l) => JSON.parse(l) as LogRecord);

export const positions = (root: string, date: string): CopyRecord[] =>
  gunzipSync(readFileSync(path.join(root, "log", `${date}-positions.jsonl.gz`)))
    .toString("utf8")
    .split("\n")
    .filter((l) => l !== "")
    .map((l) => JSON.parse(l) as CopyRecord);

export const TITLES: Record<LineName, string> = {
  MAIN: "Main line (decides)",
  TEN: "Ten closed cycles",
  BROAD: "Every directional trader",
  DAY: "Day-holders",
  FAV: "Your favourites",
};

/** The words of a page's text that R15 bans: follow, copy, signal, edge, skill, in any form. */
export const bannedWords = (html: string): string[] =>
  html
    .replace(/<[^>]*>/g, " ")
    .toLowerCase()
    .split(/[^a-z]+/)
    .filter((w) => /^(follow|copy|copie|signal|edge|skill)/.test(w));

export type Counts = {
  positions: number;
  traders: number;
  days: number;
  open: number;
};

/** The five lines' rows of the written page. */
export function pageLines(root: string): Record<LineName, Counts> {
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
export function linesOf(
  copies: readonly CopyRecord[],
): Record<LineName, Counts> {
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
export const copyAt = (
  copies: readonly CopyRecord[],
  who: string,
  t: number,
) => {
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
export function expectCopies(copies: readonly CopyRecord[], end: number): void {
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

/** The world's package folder (not frozen) and its paper folders, the fixed inputs, and a run and a look in it. */
export async function makeWorld(tmp: string) {
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
  /** A paper folder holding the seed and the pre-cut panel, as the build leaves it. */
  const paperRoot = (name: string) => {
    const root = path.join(tmp, name);
    mkdirSync(path.join(root, "seed"), { recursive: true });
    mkdirSync(path.join(root, "panel-precut"), { recursive: true });
    for (const [w, b] of seeds)
      writeFileSync(path.join(root, "seed", `${w}.json.gz`), b);
    writeFileSync(path.join(root, "panel-precut", "6.json.gz"), panelBytes);
    return root;
  };
  // The fixed inputs from the package folder: the kit's own, the experiment's files of this world.
  const kit = await loadResearch(path.join(pkg, "research"));
  const real = fixedInputs(kit, pkg);
  // This world's pool and market in place of the kit's 1,602 accounts and 84 markets.
  const fixed: FixedInputs = {
    ...real,
    pool: [A, B, C, N].map((a) => ({ addr: a, notionalBoard: false })),
    markets: [6],
    pinned: new Map([["6.json.gz", sha256(panelBytes)]]),
  };
  const config = (paper: string) => ({
    PAPER_ROOT: paper,
    PAPER_BACKUP: `${paper}-backup`,
    MONGO_URI: "mongodb://127.0.0.1:1",
    MONGO_DB: "polymarket_follow_test",
  });
  /** The collector's records up to an instant. */
  const ruleBook = (now: number) => () =>
    Promise.resolve(docs.filter((d) => (d.at ?? 0) < now));
  const run = async (paper: string, iso: string) => {
    const now = at(iso);
    const api = fakeApi(world, now);
    const stages: string[] = [];
    const exit = await daily(config(paper), log, (s) => stages.push(s), now, {
      packageRoot: pkg,
      fetchFn: api.fetchFn,
      clock: api.clock,
      ruleBook: ruleBook(now),
      fixed,
    });
    return { exit, calls: api.calls, stages };
  };
  const runLook = (paper: string, k: 1 | 2 | 3, iso: string) =>
    look(config(paper), log, k, at(iso), {
      packageRoot: pkg,
      ruleBook: ruleBook(at(iso)),
      fixed,
    });
  return {
    pkg,
    experiment,
    rules,
    seeds,
    paperRoot,
    kit,
    real,
    fixed,
    run,
    runLook,
  };
}

/** The fills reads of a run: whose, from which day to which. */
export const fillsCalls = (calls: { url: URL }[]) =>
  calls
    .filter((c) => c.url.pathname === "/v1/info/fills")
    .map((c) => ({
      address: c.url.searchParams.get("address"),
      start: day(Number(c.url.searchParams.get("start_timestamp"))),
      end: day(Number(c.url.searchParams.get("end_timestamp"))),
    }));

/** How many market-days of market 6 a paper folder holds. */
export const marketDays = (paper: string) =>
  readdirSync(path.join(paper, "panel", "6")).length;
