/**
 * One run of the experiment (the plan's section 3 and R0, R15, with its
 * review's F2, F4, F10 and F11): the frozen files checked (else one line,
 * "frozen files differ", and nothing read or written); the reads through the
 * run's END (00:00Z of its UTC day); every copy recomputed from all inputs by
 * the frozen code; the day's log (its frozen hash, counts, coverage, the
 * reads' cost, the shared files it ran with), every copy's state that day,
 * the manifest, and the page.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync, gzipSync } from "node:zlib";
import { z } from "zod";
import { RestClient } from "../api/rest-client.js";
import type { Clock } from "../clock.js";
import type { Logger } from "../log.js";
import { DAY_MS, utcDate } from "../schedule.js";
import { Recorder } from "../store/files.js";
import { accountData, type MondayCache } from "./account.js";
import { backupPaper } from "./backup.js";
import { verifyFreeze } from "./gate.js";
import { CUT, LOOK_ENDS, mondayOf, runEnd } from "./instants.js";
import { readThrough } from "./loop.js";
import { joinDays, loadPrecut, marketThrough, pinnedPanel } from "./market.js";
import { renderPage, renderPositions, type PageData } from "./page.js";
import { paperRequest } from "./reader.js";
import {
  RESEARCH_ROOT,
  loadResearch,
  type Market,
  type Research,
} from "./research.js";
import { PAPER_LIMITS, PAPER_ROUTES } from "./routes.js";
import {
  missingFeeCategories,
  parseRuleBook,
  readRuleBook,
  type RuleBook,
} from "./rulebook.js";
import { inLine, pageLine } from "./summary.js";
import {
  LINES,
  score,
  weekList,
  type ScoreInput,
  type Scored,
} from "./score.js";
import { loadSeed, readManifest } from "./seed.js";
import { LOOK_Z, traderBand } from "./stats.js";
import { PaperStore, writeAtomic, type State } from "./store.js";

/** The package's folder: the repository's `apps/poller`, or the run copy's. */
export const PACKAGE_ROOT = path.join(RESEARCH_ROOT, "..");

export type DailyConfig = {
  PAPER_ROOT: string;
  PAPER_BACKUP: string;
  MONGO_URI: string;
  MONGO_DB: string;
};

/**
 * What a run takes from outside itself, each by default the real one: the
 * package's folder (its freeze, research files and experiment files), the API
 * and the clock it is asked on, the collector's rule-book documents, and the
 * run's fixed inputs. A test replaces them to drive a whole run over a
 * synthetic world (the kit's pool, markets and panel pin are its own data,
 * frozen by its fingerprint, so a synthetic world comes in as `fixed`).
 */
export type DailyIo = {
  packageRoot?: string;
  fetchFn?: typeof fetch;
  clock?: Clock;
  ruleBook?: () => Promise<unknown[]>;
  fixed?: FixedInputs;
};

const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");

/**
 * The favourites (R2): `from <ISO instant>` — F0, the freeze's instant — then
 * one address a line, at most 20, each once (read lower-case, as addresses
 * are stored); the file is written at the freeze and frozen with the rest, so
 * none exists before it.
 */
export function readFavourites(
  text: string | null,
): { from: number; addrs: string[] } | null {
  if (text === null) return null;
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l !== "" && !l.startsWith("#"));
  const head = /^from (\S+)$/.exec(lines[0] ?? "");
  const from = head ? Date.parse(head[1]!) : NaN;
  const addrs = lines.slice(1).map((a) => a.toLowerCase());
  if (
    !Number.isFinite(from) ||
    addrs.length > 20 ||
    new Set(addrs).size !== addrs.length ||
    !addrs.every((a) => /^0x[0-9a-f]{40}$/.test(a))
  ) {
    throw new Error(
      "experiment/favourites.txt: `from <ISO instant>`, then at most 20 addresses (0x and 40 hex digits), each once",
    );
  }
  return { from, addrs };
}

/** A holdout account joins the favourites only after D1 is scored (R2): refused, by address. */
function refuseHoldout(
  addrs: readonly string[],
  holdout: ReadonlySet<string>,
): void {
  const barred = addrs.filter((a) => holdout.has(a));
  if (barred.length > 0) {
    throw new Error(
      `experiment/favourites.txt: holdout accounts join only after D1 is scored (R2): ${barred.join(", ")}`,
    );
  }
}

/** The kit's population (frozen with the kit): the pool and the holdout (R2). */
function populationOf(packageRoot: string) {
  const pop = Population.parse(
    JSON.parse(
      readFileSync(
        path.join(packageRoot, "research", "kit/data/population.json"),
        "utf8",
      ),
    ),
  );
  return {
    pool: pop.accounts
      .filter((a) => !a.holdout)
      .map((a) => ({ addr: a.addr, notionalBoard: a.notionalBoard })),
    holdout: new Set(
      pop.accounts.filter((a) => a.holdout).map((a) => a.addr.toLowerCase()),
    ),
  };
}

/**
 * The favourites file as the freeze checks it before it writes the list
 * (R1, R2): its form, F0 between the cut and the freeze's instant, no holdout
 * account. Throws the first problem.
 */
export function checkFavourites(
  text: string,
  packageRoot: string,
  now: number,
): { from: number; addrs: string[] } {
  const fav = readFavourites(text)!;
  if (fav.from < CUT || fav.from > now) {
    throw new Error(
      `experiment/favourites.txt: F0 ${new Date(fav.from).toISOString()} is not between the cut and the freeze`,
    );
  }
  refuseHoldout(fav.addrs, populationOf(packageRoot).holdout);
  return fav;
}

const Population = z.object({
  accounts: z.array(
    z.object({
      addr: z.string(),
      notionalBoard: z.boolean(),
      holdout: z.boolean(),
    }),
  ),
});
const KitRuleBook = z.object({
  instruments: z.array(
    z.object({
      iid: z.number().int(),
      symbol: z.string(),
      category: z.string(),
    }),
  ),
});

/** The run's fixed inputs: the pool, the kit's markets and panel pin, the favourites, the seed's frozen manifest. */
export function fixedInputs(kit: Research, packageRoot = PACKAGE_ROOT) {
  const research = path.join(packageRoot, "research");
  const experiment = path.join(packageRoot, "experiment");
  const { pool, holdout } = populationOf(packageRoot);
  const rb = KitRuleBook.parse(
    JSON.parse(
      readFileSync(path.join(research, "kit/data/rulebook.json"), "utf8"),
    ),
  );
  const kitMarkets = new Map(rb.instruments.map((i) => [i.iid, i.category]));
  const symbols = new Map(rb.instruments.map((i) => [i.iid, i.symbol]));
  const favFile = path.join(experiment, "favourites.txt");
  const favourites = readFavourites(
    existsSync(favFile) ? readFileSync(favFile, "utf8") : null,
  );
  refuseHoldout(favourites?.addrs ?? [], holdout);
  return {
    pool,
    kitMarkets,
    symbols,
    /** The markets read day by day: those in a primary cell at the cut. */
    markets: [...kitMarkets.keys()]
      .filter((iid) => kit.cells.inPrimaryCell(iid, CUT - 1))
      .sort((a, b) => a - b),
    /** The kit's pinned manifest of the pre-cut panel. */
    pinned: pinnedPanel(research),
    favourites,
    seedManifest: readManifest(
      readFileSync(path.join(experiment, "seed.sha256"), "utf8"),
    ),
  };
}

export type FixedInputs = ReturnType<typeof fixedInputs>;

/** R9's alarm: the primary markets' categories some recorded fee schedule has no rate for. */
export function feeAlarm(book: RuleBook, fixed: FixedInputs): string[] {
  const missing = missingFeeCategories(
    book,
    fixed.markets.map((iid) => fixed.kitMarkets.get(iid) ?? ""),
  );
  return missing.length === 0
    ? []
    : [
        `alarm: fee categories missing from the collector's schedule: ${missing.join(", ")} — their copies are priced at the kit's rate (R9)`,
      ];
}

/** The collector's rule book as a run or a look reads it (R6, R9). */
export async function ruleBookOf(
  config: DailyConfig,
  io: DailyIo,
  fixed: FixedInputs,
): Promise<RuleBook> {
  const docs = await (
    io.ruleBook ?? (() => readRuleBook(config.MONGO_URI, config.MONGO_DB))
  )();
  return parseRuleBook(docs, [...fixed.kitMarkets.keys()]);
}

const MondayCacheFile = z.record(
  z.string(),
  z.object({
    hash: z.string(),
    value: z.object({
      label: z.string(),
      closed: z.number(),
      medianHoldMs: z.number().nullable(),
      longShare: z.number().nullable(),
    }),
  }),
);

export function loadCache(root: string): MondayCache {
  const file = path.join(root, "cache", "mondays.json.gz");
  if (!existsSync(file)) return new Map();
  return new Map(
    Object.entries(
      MondayCacheFile.parse(
        JSON.parse(gunzipSync(readFileSync(file)).toString("utf8")),
      ),
    ),
  );
}

export function saveCache(root: string, cache: MondayCache): void {
  writeAtomic(
    path.join(root, "cache", "mondays.json.gz"),
    gzipSync(JSON.stringify(Object.fromEntries(cache))),
  );
}

/** The markets through `end`: the pre-cut panel joined with the market-days present. */
export function marketsThrough(
  kit: Research,
  store: PaperStore,
  end: number,
  pinned: ReadonlyMap<string, string>,
) {
  const built = new Map<number, Market | null>();
  return (iid: number): Market | null => {
    if (built.has(iid)) return built.get(iid)!;
    let mk: Market | null = null;
    if (pinned.has(`${iid}.json.gz`)) {
      const pre = loadPrecut(
        path.join(store.root, "panel-precut"),
        pinned,
        iid,
      );
      const present = store.marketDays(iid);
      const days = [];
      for (let d = pre.end; d < end && present.has(d); d += DAY_MS)
        days.push(store.readMarketDay(iid, d));
      mk = marketThrough(kit, joinDays(pre, days, end), end);
    }
    built.set(iid, mk);
    return mk;
  };
}

export type ScoreSetup = {
  kit: Research;
  store: PaperStore;
  state: State;
  book: RuleBook;
  cache: MondayCache;
  end: number;
};

export function scoreInput(s: ScoreSetup, fixed: FixedInputs): ScoreInput {
  const seedDir = path.join(s.store.root, "seed");
  return {
    kit: s.kit,
    end: s.end,
    pool: fixed.pool,
    favourites:
      fixed.favourites?.addrs.map((addr) => ({
        addr,
        from: fixed.favourites!.from,
      })) ?? [],
    account: (addr) =>
      accountData(
        s.kit,
        addr,
        loadSeed(seedDir, fixed.seedManifest, addr),
        // R1: nothing at or after END is used (a look reads nothing a later run stored).
        s.store.readRows(addr).filter((r) => r.timestamp < s.end),
        s.state.accounts[addr] ?? { P: CUT, from: CUT, holes: [] },
      ),
    market: marketsThrough(s.kit, s.store, s.end, fixed.pinned),
    book: s.book,
    cache: s.cache,
    kitMarkets: fixed.kitMarkets,
  };
}

const LookResultFile = z.object({
  lines: z.array(
    z.object({
      line: z.string(),
      verdict: z.string().nullable(),
      sentence: z.string().nullish(),
    }),
  ),
});

export type LookDone = {
  k: 1 | 2 | 3;
  verdict: string | null;
  sentence: string | null;
};

/** Each look's MAIN verdict and sentence from its result file; null for a look not yet run. */
export function looksDone(paperRoot: string): (LookDone | null)[] {
  return ([1, 2, 3] as const).map((k) => {
    const file = path.join(paperRoot, "looks", `L${k}`, "result.json");
    if (!existsSync(file)) return null;
    const main = LookResultFile.parse(
      JSON.parse(readFileSync(file, "utf8")),
    ).lines.find((l) => l.line === "MAIN");
    return {
      k,
      verdict: main?.verdict ?? null,
      sentence: main?.sentence ?? null,
    };
  });
}

/** The page's data from a scored run. */
export function pageData(
  kit: Research,
  scored: Scored,
  end: number,
  symbols: ReadonlyMap<number, string>,
  frozen: PageData["frozen"],
  lacks: string[],
  cost: string,
  looks: readonly (LookDone | null)[],
): PageData {
  // R15: the next look is the first not yet run; at and after a look, its MAIN verdict and sentence.
  const next = looks.findIndex((l) => l === null);
  const dateOf = (i: number) =>
    new Date(LOOK_ENDS[i]!).toISOString().slice(0, 10);
  const latest = looks.filter((l) => l !== null).at(-1) ?? null;
  const titles = {
    MAIN: "Main line (decides)",
    TEN: "Ten closed cycles",
    BROAD: "Every directional trader",
    DAY: "Day-holders",
    FAV: "Your favourites",
  } as const;
  const lines = LINES.map((name) => ({
    name,
    title: titles[name],
    ...pageLine(kit, inLine(scored, name), name),
  }));
  const main = inLine(scored, "MAIN");
  const traders = [...new Set(main.map((c) => c.addr))].sort().map((addr) => {
    const own = main.filter((c) => c.addr === addr);
    const items = own.flatMap((c) =>
      c.money === null ? [] : [{ addr, tIn: c.tIn, x: c.money.net }],
    );
    return {
      addr,
      positions: own.length,
      open: own.filter((c) => c.plan.flag !== null).length,
      mean: items.length
        ? items.reduce((s, i) => s + i.x, 0) / items.length
        : null,
      band: traderBand(kit, items),
    };
  });
  const rows = [...scored.copies]
    .sort((a, b) => b.t - a.t)
    .map((c) => ({
      addr: c.addr,
      symbol: symbols.get(c.iid) ?? String(c.iid),
      side: c.dir > 0 ? ("long" as const) : ("short" as const),
      t: c.t,
      tIn: c.tIn,
      entryPrice: c.entryPrice,
      legs: c.plan.legs
        .map((l) => (l.kind === "cut" ? "marked" : l.kind.toLowerCase()))
        .join(" "),
      state: c.plan.flag === null ? ("closed" as const) : c.plan.flag,
      net: c.money?.net ?? null,
      flags: [
        ...(c.unpriced ? [`unpriced: ${c.unpriced}`] : []),
        ...(c.gap ? ["gap"] : []),
        ...c.lines,
      ],
    }));
  return {
    writtenAt: Date.now(),
    dataThrough: end - DAY_MS,
    frozen,
    nextLook:
      next < 0
        ? null
        : {
            date: dateOf(next),
            z: LOOK_Z[next]!,
          },
    verdict:
      latest === null
        ? null
        : `Look ${latest.k} (${dateOf(latest.k - 1)}): the main line ${latest.verdict ?? "has no verdict"}.${latest.sentence === null ? "" : ` ${latest.sentence}`}${latest.verdict !== "KEEP" && latest.verdict !== "DROP" && next >= 0 ? ` Next look ${dateOf(next)}.` : ""}`,
    lines,
    rows,
    traders,
    lacks,
    cost,
  };
}

/** The shared files the experiment ran with, and the runtime (F4: information, not a stop). */
export function sharedFiles(
  packageRoot = PACKAGE_ROOT,
): Record<string, string> {
  const dist = path.join(packageRoot, "dist");
  const out: Record<string, string> = { node: process.version };
  for (const f of [
    "api/rest-client.js",
    "api/admission.js",
    "api/schemas.js",
    "store/files.js",
    "store/db.js",
    "schedule.js",
    "clock.js",
    "log.js",
    "lock.js",
    "jobs/paging.js",
  ]) {
    const file = path.join(dist, f);
    out[f] = existsSync(file) ? sha256(readFileSync(file)) : "missing";
  }
  for (const f of ["DEPLOYED.txt", "package.json"]) {
    const file = path.join(packageRoot, f);
    if (existsSync(file)) out[f] = readFileSync(file, "utf8").trim();
  }
  return out;
}

export async function daily(
  config: DailyConfig,
  log: Logger,
  stage: (what: string) => void,
  now = Date.now(),
  io: DailyIo = {},
): Promise<number> {
  const packageRoot = io.packageRoot ?? PACKAGE_ROOT;
  const runDate = utcDate(now);
  const store = new PaperStore(config.PAPER_ROOT);
  const freeze = verifyFreeze(packageRoot);
  if (!freeze.ok) {
    store.logLine(runDate, {
      at: new Date().toISOString(),
      line: "frozen files differ",
      problems: freeze.problems,
    });
    log.error(
      { problems: freeze.problems },
      "frozen files differ: nothing read, no page",
    );
    return 4;
  }
  const kit = await loadResearch(path.join(packageRoot, "research"));
  const fixed = io.fixed ?? fixedInputs(kit, packageRoot);
  const end = runEnd(now);
  const state = store.readState();
  stage("reading the rule book");
  const book = await ruleBookOf(config, io, fixed);
  const cache = loadCache(config.PAPER_ROOT);
  const recorder = new Recorder(path.join(config.PAPER_ROOT, "raw"), log);
  await recorder.start();
  const client = new RestClient(
    PAPER_ROUTES,
    PAPER_LIMITS,
    recorder,
    log,
    io.fetchFn,
    io.clock,
  );
  const setup = { kit, store, state, book, cache, end };
  stage("reading");
  const loop = await readThrough({
    pool: fixed.pool.map((p) => p.addr),
    favourites: readsOfFavourites(fixed),
    markets: fixed.markets,
    end,
    weekList: (M) =>
      weekList(scoreInput({ ...setup, end: M + 7 * DAY_MS }, fixed), M),
    request: paperRequest(client, { open: true }),
    store,
    state,
    log,
    readOn: runDate,
  });
  await recorder.close();
  stage("scoring");
  const scored = score(scoreInput(setup, fixed));
  saveCache(config.PAPER_ROOT, cache);
  const missingDays = fixed.markets.flatMap((iid) => {
    const present = store.marketDays(iid);
    const out: string[] = [];
    for (let d = CUT; d < end; d += DAY_MS)
      if (!present.has(d)) out.push(`${iid} ${utcDate(d)}`);
    return out;
  });
  const holes = Object.entries(state.accounts).flatMap(([addr, a]) =>
    a.holes.map((h) => ({ addr, ...h })),
  );
  const lacks = [
    `reading ended: ${loop.end}${loop.end === "schema alarm" ? " — a reply's shape has changed; nothing new is read until a recorded fix" : ""}`,
    `holes: ${holes.length} in ${new Set(holes.map((h) => h.addr)).size} accounts (${
      Object.entries(countCauses(holes))
        .map(([c, n]) => `${c} ${n}`)
        .join(", ") || "none"
    })`,
    `market-days missing: ${missingDays.length}`,
    `unpriced positions: ${scored.copies.filter((c) => c.money === null).length}; positions in markets outside the primary cells: ${scored.otherMarkets}`,
    book.splits.length === 0
      ? `split events recorded by the collector: 0; rule-book documents refused: ${book.rejected}`
      : `split events recorded by the collector: ${book.splits.length} — alarm: their markets are out of the primary cells on the days listed, and positions open across those days are unpriced (R6): ${scored.copies.filter((c) => c.unpriced === "open across a split day of its market").length} unpriced; rule-book documents refused: ${book.rejected}`,
    ...feeAlarm(book, fixed),
    ...(recorder.counts.dropped > 0
      ? [
          `raw replies not stored: ${recorder.counts.dropped} (the raw folder refused them)`,
        ]
      : []),
  ];
  const cost = `this run: ${client.counts.calls} calls, peak ${client.counts.peakMinute} tokens a minute and ${client.counts.peakBurst} in 5 s, ${client.counts.rateLimited} answered 429`;
  const frozenAt =
    fixed.favourites === null
      ? "unknown"
      : new Date(fixed.favourites.from).toISOString().slice(0, 10);
  const data = pageData(
    kit,
    scored,
    end,
    fixed.symbols,
    { sha256: freeze.sha256, at: frozenAt },
    lacks,
    cost,
    looksDone(config.PAPER_ROOT),
  );
  stage("writing");
  // The day's record first (decisions 2026-11-12, PAPER-BUILD's call (8)): every copy, the log line, the manifest, the backup; the page last.
  writeAtomic(
    path.join(config.PAPER_ROOT, "log", `${runDate}-positions.jsonl.gz`),
    gzipSync(scored.copies.map((c) => JSON.stringify(c)).join("\n")),
  );
  store.logLine(runDate, {
    at: new Date().toISOString(),
    end: new Date(end).toISOString(),
    frozen: freeze.sha256,
    kit: kit.fingerprint,
    reading: loop,
    client: client.counts,
    marketDaysMissing: missingDays.length,
    holes: holes.length,
    copies: scored.copies.length,
    rawRepliesNotStored: recorder.counts.dropped,
    lines: data.lines.map(({ name, positions, open, money, d }) => ({
      name,
      positions,
      open,
      money,
      d,
    })),
    shared: sharedFiles(packageRoot),
  });
  store.flushManifest(runDate);
  try {
    log.info(
      { copied: backupPaper(config.PAPER_ROOT, config.PAPER_BACKUP) },
      "backed up",
    );
  } catch (err) {
    const why = err instanceof Error ? err.message : String(err);
    log.error({ err }, "the backup failed; the run's files stand");
    store.logLine(runDate, {
      at: new Date().toISOString(),
      line: "the backup failed",
      error: why,
    });
    lacks.push(`the backup failed: ${why}`);
  }
  writeAtomic(
    path.join(config.PAPER_ROOT, "page", "index.html"),
    renderPage(data),
  );
  writeAtomic(
    path.join(config.PAPER_ROOT, "page", "positions.html"),
    renderPositions(data),
  );
  return 0;
}

/**
 * Where a favourite's reads start: a pool account's at the cut (the seed holds
 * it before); another's 30 days before F0's Monday, so that its first Monday's
 * label and habits are read (R5).
 */
function readsOfFavourites(fixed: FixedInputs) {
  const fav = fixed.favourites;
  if (fav === null) return [];
  const pool = new Set(fixed.pool.map((p) => p.addr));
  return fav.addrs.map((addr) => ({
    addr,
    from: pool.has(addr) ? CUT : mondayOf(fav.from) - 30 * DAY_MS,
  }));
}

function countCauses(
  holes: readonly { cause: string }[],
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const h of holes) out[h.cause] = (out[h.cause] ?? 0) + 1;
  return out;
}
