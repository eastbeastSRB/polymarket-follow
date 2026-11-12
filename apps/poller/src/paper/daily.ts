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
import { parseRuleBook, readRuleBook, type RuleBook } from "./rulebook.js";
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
const EXPERIMENT = path.join(PACKAGE_ROOT, "experiment");

export type DailyConfig = {
  PAPER_ROOT: string;
  PAPER_BACKUP: string;
  MONGO_URI: string;
  MONGO_DB: string;
};

const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");

/**
 * The favourites (R2): `from <ISO instant>` — F0, the freeze's instant — then
 * one lower-case address a line, at most 20; the file is written at the
 * freeze and frozen with the rest, so none exists before it.
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
  const addrs = lines.slice(1);
  if (
    !Number.isFinite(from) ||
    addrs.length > 20 ||
    !addrs.every((a) => /^0x[0-9a-f]{40}$/.test(a))
  ) {
    throw new Error(
      "experiment/favourites.txt: `from <ISO instant>`, then at most 20 lower-case addresses",
    );
  }
  return { from, addrs };
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

/** The run's fixed inputs: the pool, the kit's markets, the favourites, the seed's frozen manifest. */
export function fixedInputs(kit: Research) {
  const pop = Population.parse(
    JSON.parse(
      readFileSync(
        path.join(RESEARCH_ROOT, "kit/data/population.json"),
        "utf8",
      ),
    ),
  );
  const rb = KitRuleBook.parse(
    JSON.parse(
      readFileSync(path.join(RESEARCH_ROOT, "kit/data/rulebook.json"), "utf8"),
    ),
  );
  const kitMarkets = new Map(rb.instruments.map((i) => [i.iid, i.category]));
  const symbols = new Map(rb.instruments.map((i) => [i.iid, i.symbol]));
  const favFile = path.join(EXPERIMENT, "favourites.txt");
  return {
    pool: pop.accounts
      .filter((a) => !a.holdout)
      .map((a) => ({ addr: a.addr, notionalBoard: a.notionalBoard })),
    kitMarkets,
    symbols,
    /** The markets read day by day: those in a primary cell at the cut. */
    markets: [...kitMarkets.keys()]
      .filter((iid) => kit.cells.inPrimaryCell(iid, CUT - 1))
      .sort((a, b) => a - b),
    favourites: readFavourites(
      existsSync(favFile) ? readFileSync(favFile, "utf8") : null,
    ),
    seedManifest: readManifest(
      readFileSync(path.join(EXPERIMENT, "seed.sha256"), "utf8"),
    ),
  };
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
export function marketsThrough(kit: Research, store: PaperStore, end: number) {
  const pinned = pinnedPanel(RESEARCH_ROOT);
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

export function scoreInput(
  s: ScoreSetup,
  fixed: ReturnType<typeof fixedInputs>,
): ScoreInput {
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
        s.store.readRows(addr),
        s.state.accounts[addr] ?? { P: CUT, from: CUT, holes: [] },
      ),
    market: marketsThrough(s.kit, s.store, s.end),
    book: s.book,
    cache: s.cache,
    kitMarkets: fixed.kitMarkets,
  };
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
): PageData {
  const next = LOOK_ENDS.findIndex((t) => t >= end);
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
            date: new Date(LOOK_ENDS[next]!).toISOString().slice(0, 10),
            z: LOOK_Z[next]!,
          },
    verdict: null,
    lines,
    rows,
    traders,
    lacks,
    cost,
  };
}

/** The shared files the experiment ran with, and the runtime (F4: information, not a stop). */
export function sharedFiles(): Record<string, string> {
  const dist = path.join(PACKAGE_ROOT, "dist");
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
    const file = path.join(PACKAGE_ROOT, f);
    if (existsSync(file)) out[f] = readFileSync(file, "utf8").trim();
  }
  return out;
}

export async function daily(
  config: DailyConfig,
  log: Logger,
  stage: (what: string) => void,
  now = Date.now(),
  packageRoot = PACKAGE_ROOT,
): Promise<number> {
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
  const kit = await loadResearch();
  const fixed = fixedInputs(kit);
  const end = runEnd(now);
  const state = store.readState();
  stage("reading the rule book");
  const book = parseRuleBook(
    await readRuleBook(config.MONGO_URI, config.MONGO_DB),
    [...fixed.kitMarkets.keys()],
  );
  const cache = loadCache(config.PAPER_ROOT);
  const recorder = new Recorder(path.join(config.PAPER_ROOT, "raw"), log);
  await recorder.start();
  const client = new RestClient(PAPER_ROUTES, PAPER_LIMITS, recorder, log);
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
    `split events recorded by the collector: ${book.splitEvents}${book.splitEvents > 0 ? " — the rules cannot read them; a recorded fix is needed" : ""}; rule-book documents refused: ${book.rejected}`,
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
  );
  stage("writing");
  writeAtomic(
    path.join(config.PAPER_ROOT, "page", "index.html"),
    renderPage(data),
  );
  writeAtomic(
    path.join(config.PAPER_ROOT, "page", "positions.html"),
    renderPositions(data),
  );
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
    lines: data.lines.map(({ name, positions, open, money, d }) => ({
      name,
      positions,
      open,
      money,
      d,
    })),
    shared: sharedFiles(),
  });
  store.flushManifest(runDate);
  try {
    log.info(
      { copied: backupPaper(config.PAPER_ROOT, config.PAPER_BACKUP) },
      "backed up",
    );
  } catch (err) {
    log.error({ err }, "the backup failed; the run's files stand");
  }
  return 0;
}

/**
 * Where a favourite's reads start: a pool account's at the cut (the seed holds
 * it before); another's 30 days before F0's Monday, so that its first Monday's
 * label and habits are read (R5).
 */
function readsOfFavourites(fixed: ReturnType<typeof fixedInputs>) {
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
