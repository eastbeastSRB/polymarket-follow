/**
 * COPY-H's synthetic world through the built program under a synthetic tag
 * (copyh/rules.md C15 (b); C14 (3): FRESH-2's stage is the first list's
 * program, and this world runs through it), and its control on a planted
 * defect's commit (code-rules: a rehearsal on synthetic data rehearses the
 * wiring; run it once on the defect's own commit).
 * - The scratch (`makeScratch`): the repository's HEAD as `git archive`
 *   writes it, in its own `git init` (never a worktree or a clone, so no
 *   tag, ref or object reaches the repository), its package's node_modules
 *   a real folder of per-package junctions into the repository's (never
 *   pnpm there), built by the lockfile's tsc; the junctions removed one by
 *   one at the end, each checked gone and its target whole
 *   (`unlinkScratch`).
 * - The world (`worldOf`): made-up traders, each alone on its coin of
 *   `coins.json` (FRESH-2's last on a coin appended at FRESH-2's freeze).
 *   Each makes three long round trips of 8 h in the week before its Monday
 *   M (6 decisions in the 14 days and 3 closed cycles in the 30: P1 and MAIN
 *   at M), then one in M's week, the copy: it buys at p0 at H0 + 30 s; the
 *   price is p1 = p0 (1 + j), j from 1.5% to 2.5%, from H0 + 15 min; it
 *   sells at p1 at H0 + 8 h + 30 s. One-off accounts, one fill each and so
 *   never P1, make every other fill: each maker, and the tape that gives
 *   the marks the copy, its moved lines and d's null need (H0 + 4 min at
 *   p0; H0 + 15, 30, 45 and 58 min, H0 + 8 h + 4 and 14 min, and the next
 *   day's H0 + 1, 4, 15, 30, 45 and 58 min at p1). One funding row an
 *   episode, at H0 + 1 h. E has 120 traders, a copy every 2 days from
 *   2025-07-14 (none in the rehearsal's fortnight); S and FRESH-2 30 each,
 *   every 4 days. E's and S's every hour is a file, most of them an empty
 *   frame; FRESH-2's only those that hold a record (its holes allowed, C14
 *   (4) 1.).
 * - A copy's numbers follow from its two prices (`expectedOf`): no spread
 *   pair on any coin, so C9's 25 bps on each leg; the fee on both; the row
 *   charged at p1 under either settlement mark (the trade at H0 + 58 min is
 *   within both rules' minutes); d = 0.8 j (d's null: five minutes, one at
 *   p0 and four at p1, held 24 h at p1); x′ = x − 0.2 j, its 24 hours
 *   costing what its 8 do.
 * - The values set before the freeze and the lists are the world's, in the
 *   scratch alone (`setWorldValues`, `writeWorldLists`, `writeRehearsal`):
 *   SETTLEMENT_MARK_MINUTES 60 unless HEAD has set it, rules.md's markers
 *   replaced,
 *   `copyh/data.sha256`, `funding.sha256`, `unpaired.json` (no record),
 *   `calibration.json` and `rehearsal.json` (the scratch's store closure, E's
 *   store as the scratch's own `build --range E` made it, then moved aside,
 *   and the empty fortnight); `repro.json` synthetic, saying why
 *   (`writeRepro`; the supervisor's ruling, 2026-11-27 14:00Z).
 */
import { spawn, spawnSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  realpathSync,
  renameSync,
  rmdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import path from "node:path";
import {
  CLOSED_WINDOWS,
  END_E,
  END_S,
  FEE_A_LEG,
  M0,
  SPREAD_FALLBACK,
  SWITCH_HOUR,
} from "../src/copyh/design.js";
import { fundingKey } from "../src/copyh/funding.js";
import { RANGES } from "../src/copyh/range.js";
import { fingerprintOf, sha256 } from "../src/copyh/run.js";
import { isIn } from "../src/copyh/seal.js";
import { StoreRecord } from "../src/copyh/steps.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { addr, byBlock, git, keyOf, lz4Of, record } from "./copyh-world.js";

export type Stage = "E" | "S" | "FRESH-2";
export const STAGES: readonly Stage[] = ["E", "S", "FRESH-2"];

/** Each stage's traders: how many, the first copy's hour H0, the days between copies, the first coin's iid and the funding window's start. */
export const PLANS: readonly {
  readonly stage: Stage;
  readonly traders: number;
  readonly first: number;
  readonly days: number;
  readonly iid: number;
  readonly window: number;
}[] = [
  {
    stage: "E",
    traders: 120,
    first: Date.parse("2025-07-14T10:00:00Z"),
    days: 2,
    iid: 0,
    window: M0,
  },
  {
    stage: "S",
    traders: 30,
    first: Date.parse("2026-06-08T10:00:00Z"),
    days: 4,
    iid: 120,
    window: END_E,
  },
  {
    stage: "FRESH-2",
    traders: 30,
    first: Date.parse("2026-11-23T10:00:00Z"),
    days: 4,
    iid: 150,
    window: END_S,
  },
];
/** The coin FRESH-2's freeze appends to coins.json (C14 (4) 2.), its last trader's. */
export const NEW_COIN = "ZWORLD";
/** Each episode's funding row's rate: longs pay. */
const RATE = "0.0000125";

export type Trader = {
  readonly stage: Stage;
  readonly addr: string;
  readonly iid: number;
  readonly coin: string;
  /** The copy's hour: the trader buys at H0 + 30 s. */
  readonly h0: number;
  readonly p0: string;
  readonly p1: string;
  readonly q: string;
};

/** The Monday 00:00Z of t's week. */
export const mondayOf = (t: number): number => {
  const day = Math.floor(t / DAY_MS) * DAY_MS;
  return day - ((new Date(day).getUTCDay() + 6) % 7) * DAY_MS;
};

/** The world's traders, the stages' in order; `coins` are coins.json's names by iid. */
function tradersOf(coins: readonly string[]): Trader[] {
  const out: Trader[] = [];
  for (const p of PLANS)
    for (let k = 0; k < p.traders; k++) {
      const g = out.length;
      const appended = p.stage === "FRESH-2" && k === p.traders - 1;
      const iid = appended ? coins.length : p.iid + k;
      const p0 = 20 + 3 * (g % 50);
      const j = 0.015 + 0.01 * ((g * 0.6180339887498949) % 1);
      out.push({
        stage: p.stage,
        addr: addr(0xa00000 + g),
        iid,
        coin: appended ? NEW_COIN : coins[iid]!,
        h0: p.first + k * p.days * DAY_MS,
        p0: p0.toFixed(2),
        p1: (p0 * (1 + j)).toFixed(2),
        q: ((1500 + 10 * (g % 97)) / p0).toFixed(2),
      });
    }
  return out;
}

/** A trade as its taker made it; its maker is a one-off account of the other side. */
type Trade = {
  readonly time: number;
  readonly coin: string;
  readonly px: string;
  readonly sz: string;
  readonly buy: boolean;
  readonly taker: string;
  readonly start: string;
  readonly dir: string;
};

/** A trader's trades and its copy's tape, oldest first; `oneOff` gives a new account. */
function tradesOf(t: Trader, oneOff: () => string): Trade[] {
  const own = (time: number, buy: boolean, sz: string, px: string): Trade => ({
    time,
    coin: t.coin,
    px,
    sz,
    buy,
    taker: t.addr,
    start: buy ? "0.0" : sz,
    dir: buy ? "Open Long" : "Close Long",
  });
  const tape = (time: number, px: string): Trade => ({
    time,
    coin: t.coin,
    px,
    sz: "1.0",
    buy: true,
    taker: oneOff(),
    start: "0.0",
    dir: "Open Long",
  });
  const M = mondayOf(t.h0);
  const out: Trade[] = [];
  for (let i = 0; i < 3; i++) {
    const open = M - (6 - 2 * i) * DAY_MS + 10 * HOUR_MS + 30_000;
    const sz = (Number(t.q) * (1 + 0.01 * (i + 1))).toFixed(2);
    out.push(
      own(open, true, sz, t.p0),
      own(open + 8 * HOUR_MS, false, sz, t.p0),
    );
  }
  const h = t.h0;
  const close = h + 8 * HOUR_MS;
  out.push(
    own(h + 30_000, true, t.q, t.p0),
    tape(h + 4 * MINUTE_MS, t.p0),
    ...[15, 30, 45, 58].map((m) => tape(h + m * MINUTE_MS, t.p1)),
    own(close + 30_000, false, t.q, t.p1),
    ...[4, 14].map((m) => tape(close + m * MINUTE_MS, t.p1)),
    ...[1, 4, 15, 30, 45, 58].map((m) =>
      tape(h + DAY_MS + m * MINUTE_MS, t.p1),
    ),
  );
  return out;
}

/** A trade's taker record and its maker's, one `tid`. */
function recordsOf(tr: Trade, tid: number, maker: string): [string, string] {
  const fill = {
    coin: tr.coin,
    px: tr.px,
    sz: tr.sz,
    time: tr.time,
    tid,
  };
  return [
    record(tr.taker, {
      ...fill,
      side: tr.buy ? "B" : "A",
      startPosition: tr.start,
      dir: tr.dir,
      oid: 2 * tid,
      crossed: true,
    }),
    record(maker, {
      ...fill,
      side: tr.buy ? "A" : "B",
      startPosition: "0.0",
      dir: tr.buy ? "Open Short" : "Open Long",
      oid: 2 * tid + 1,
      crossed: false,
    }),
  ];
}

/** The stage that holds t. */
export const stageAt = (t: number): Stage =>
  t < END_E ? "E" : t < END_S ? "S" : "FRESH-2";

export type World = {
  readonly traders: readonly Trader[];
  /** Each stage's raw files by key, in the range's order. */
  readonly files: Readonly<Record<Stage, ReadonlyMap<string, Buffer>>>;
  /** Each stage's funding windows by key, sorted. */
  readonly windows: Readonly<Record<Stage, ReadonlyMap<string, Buffer>>>;
  /** Each stage's records. */
  readonly records: Readonly<Record<Stage, number>>;
};

/** The world: its traders, their records in hour files (`node_fills` a record a line before the switch hour, `node_fills_by_block` a trade a line after it, none in it) and their funding windows. */
export function worldOf(coins: readonly string[]): World {
  const traders = tradersOf(coins);
  let accounts = 0;
  const oneOff = () => addr(0x100000 + (accounts += 1));
  const trades = traders
    .flatMap((t) => tradesOf(t, oneOff))
    .sort((a, b) => a.time - b.time);
  const lines = new Map<string, string[]>();
  const records: Record<Stage, number> = { E: 0, S: 0, "FRESH-2": 0 };
  trades.forEach((tr, i) => {
    const hour = Math.floor(tr.time / HOUR_MS) * HOUR_MS;
    if (hour === SWITCH_HOUR)
      throw new Error("the world holds no record in the switch hour");
    const pair = recordsOf(tr, i + 1, oneOff());
    const key = keyOf(
      hour,
      hour < SWITCH_HOUR ? "node_fills" : "node_fills_by_block",
    );
    const list = lines.get(key) ?? [];
    if (hour < SWITCH_HOUR) list.push(...pair);
    else list.push(byBlock(i + 1, pair));
    lines.set(key, list);
    records[stageAt(tr.time)] += 2;
  });
  const empty = lz4Of("");
  const fileOf = (key: string) => {
    const l = lines.get(key);
    return l === undefined ? empty : lz4Of(`${l.join("\n")}\n`);
  };
  const files = {
    E: new Map(RANGES.E.fill.map((k) => [k, fileOf(k)])),
    S: new Map(RANGES.S.fill.map((k) => [k, fileOf(k)])),
    "FRESH-2": new Map(
      RANGES["FRESH-2"].fill
        .filter((k) => lines.has(k))
        .map((k) => [k, fileOf(k)]),
    ),
  };
  const used = STAGES.reduce(
    (n, s) => n + [...files[s].keys()].filter((k) => lines.has(k)).length,
    0,
  );
  if (used !== lines.size)
    throw new Error(`${lines.size - used} hour files lie in no stage's range`);
  const windows = Object.fromEntries(
    PLANS.map((p) => [
      p.stage,
      new Map(
        traders
          .filter((t) => t.stage === p.stage)
          .map((t): [string, Buffer] => [
            fundingKey(t.coin, p.window),
            Buffer.from(
              JSON.stringify([
                {
                  coin: t.coin,
                  fundingRate: RATE,
                  premium: "0.0001",
                  time: t.h0 + HOUR_MS + 7,
                },
              ]),
            ),
          ])
          .sort(([a], [b]) => (a < b ? -1 : 1)),
      ),
    ]),
  ) as Record<Stage, Map<string, Buffer>>;
  return { traders, files, windows, records };
}

/** A copy's money net and gross, d and x′, in bps, from its two prices (the module's comment says why). */
export function expectedOf(t: Trader) {
  const p0 = Number(t.p0);
  const p1 = Number(t.p1);
  const pIn = p0 * (1 + SPREAD_FALLBACK);
  const pOut = p1 * (1 - SPREAD_FALLBACK);
  const fees = FEE_A_LEG + (FEE_A_LEG * pOut) / pIn;
  const funding = -(Number(RATE) * p1) / pIn;
  const net = (pOut - pIn) / pIn - fees + funding;
  const j = (p1 - p0) / p0;
  return {
    net: 1e4 * net,
    gross: 1e4 * j,
    d: 0.8e4 * j,
    edge: 1e4 * (net - 0.2 * j),
  };
}

/** A list in sha256sum's form, after its comment: each file by key, in the map's order. */
const listOf = (comment: string, files: ReadonlyMap<string, Buffer>) =>
  `# ${comment}\n${[...files].map(([k, b]) => `${sha256(b)} *${k}\n`).join("")}`;

const json = (x: unknown) => `${JSON.stringify(x, null, 1)}\n`;

/** The world's folders, as the program's settings name them (run.ts `Settings`). */
export type Settings = {
  readonly COPYH_ROOT: string;
  readonly WAVEH_STORE: string;
  readonly COPYH_FUNDING: string;
  readonly FRESH_STORE: string;
  readonly FRESH2_STORE: string;
};
export const settingsOf = (world: string): Settings => ({
  COPYH_ROOT: path.join(world, "COPY-H"),
  WAVEH_STORE: path.join(world, "WAVE-H", "store"),
  COPYH_FUNDING: path.join(world, "COPY-H", "funding"),
  FRESH_STORE: path.join(world, "FRESH", "store"),
  FRESH2_STORE: path.join(world, "FRESH-2", "store"),
});

function writeFiles(dir: string, files: ReadonlyMap<string, Buffer>): void {
  for (const [key, bytes] of files) {
    const file = path.join(dir, ...key.split("/"));
    mkdirSync(path.dirname(file), { recursive: true });
    writeFileSync(file, bytes);
  }
}

/** The world's raw stores and its funding store, in the folders `settings` names. */
export function writeWorld(settings: Settings, w: World): void {
  writeFiles(settings.WAVEH_STORE, w.files.E);
  writeFiles(settings.FRESH_STORE, w.files.S);
  writeFiles(settings.FRESH2_STORE, w.files["FRESH-2"]);
  for (const s of STAGES) writeFiles(settings.COPYH_FUNDING, w.windows[s]);
}

/** The scratch's packages: junctions into the repository's, in a real folder (code-rules: never pnpm there). */
const PACKAGES = [
  "lz4js",
  "mongodb",
  "pino",
  "typescript",
  "zod",
  path.join("@types", "node"),
];
/** Windows' own tar (bsdtar), which reads `git archive`'s output from stdin. */
const TAR = path.join(
  process.env.SystemRoot ?? "C:\\Windows",
  "System32",
  "tar.exe",
);

export type Scratch = {
  /** The run's folder: the scratch repository and the world under it. */
  readonly dir: string;
  readonly repo: string;
  /** The scratch's package folder, `repo\apps\poller`. */
  readonly pkg: string;
  /** The repository's HEAD it was made from. */
  readonly head: string;
  readonly links: readonly string[];
};

/** A path's real path: its longest existing part's, the rest as written. */
function realOf(p: string): string {
  const full = path.resolve(p);
  try {
    return realpathSync.native(full);
  } catch {
    const parent = path.dirname(full);
    return parent === full
      ? full
      : path.join(realOf(parent), path.basename(full));
  }
}

/** Why `dir` cannot hold a scratch of the repository at `source`, or null: it must be absolute, empty or new, and neither inside the repository nor holding it, by name and by real path. */
export function scratchProblem(source: string, dir: string): string | null {
  if (!path.isAbsolute(dir)) return `${dir} is not an absolute path`;
  if (existsSync(dir) && readdirSync(dir).length > 0)
    return `${dir} is not empty`;
  for (const [a, b] of [
    [path.resolve(dir), path.resolve(source)],
    [realOf(dir), realOf(source)],
  ] as const)
    if (isIn(a, b) || isIn(b, a))
      return `${dir} and the repository ${source} overlap`;
  return null;
}

function filesIn(dir: string): number {
  return readdirSync(dir, { withFileTypes: true }).reduce(
    (n, e) =>
      n +
      (e.isDirectory() ? filesIn(path.join(dir, e.name)) : e.isFile() ? 1 : 0),
    0,
  );
}

/** The lockfile's tsc on the scratch's package (tsconfig.build.json). */
export function buildScratch(pkg: string): void {
  const r = spawnSync(
    process.execPath,
    [
      path.join(pkg, "node_modules", "typescript", "bin", "tsc"),
      "-p",
      "tsconfig.build.json",
    ],
    { cwd: pkg, encoding: "utf8", timeout: 300_000 },
  );
  if (r.status !== 0) throw new Error(`tsc: ${r.stdout}${r.stderr}`);
}

/** A scratch of the repository at `source` in `dir`: HEAD's tree in its own repository, one commit, built. */
export function makeScratch(source: string, dir: string): Scratch {
  const why = scratchProblem(source, dir);
  if (why !== null) throw new Error(`no scratch: ${why}`);
  const head = git(source, "rev-parse", "HEAD").trim();
  const repo = path.join(dir, "repo");
  mkdirSync(repo, { recursive: true });
  const archive = spawnSync(
    "git",
    ["-C", source, "archive", "--format=tar", head],
    { env: cleanEnv(), maxBuffer: 1 << 30, timeout: 120_000 },
  );
  if (archive.status !== 0)
    throw new Error(`git archive: ${archive.stderr.toString()}`);
  const tar = spawnSync(TAR, ["-x", "-f", "-", "-C", repo], {
    input: archive.stdout,
    timeout: 120_000,
  });
  if (tar.status !== 0) throw new Error(`tar: ${tar.stderr.toString()}`);
  const listed = git(source, "ls-tree", "-r", "--name-only", head)
    .split("\n")
    .filter((l) => l !== "").length;
  const written = filesIn(repo);
  if (written !== listed)
    throw new Error(`the scratch holds ${written} files, HEAD ${listed}`);
  const pkg = path.join(repo, "apps", "poller");
  const links = PACKAGES.map((name) => {
    const link = path.join(pkg, "node_modules", name);
    mkdirSync(path.dirname(link), { recursive: true });
    symlinkSync(
      realpathSync(path.join(source, "apps", "poller", "node_modules", name)),
      link,
      "junction",
    );
    return link;
  });
  git(repo, "init", "-q");
  commitAll(repo, `COPYH-WORLD: ${head} as git archive wrote it`);
  buildScratch(pkg);
  return { dir, repo, pkg, head, links };
}

/** The scratch's junctions removed, each alone, checked gone and its target whole (code-rules: never a recursive delete through a link). */
export function unlinkScratch(s: Scratch): void {
  for (const link of s.links) {
    let target: string;
    try {
      lstatSync(link);
      target = realpathSync(link);
    } catch {
      continue;
    }
    rmdirSync(link);
    let gone = false;
    try {
      lstatSync(link);
    } catch {
      gone = true;
    }
    if (!gone) throw new Error(`${link}: the junction is still there`);
    if (!existsSync(path.join(target, "package.json")))
      throw new Error(`${target}: not whole after its junction's removal`);
  }
}

/** Everything in the scratch committed (dist and node_modules are ignored); the commit's sha. */
export function commitAll(repo: string, message: string): string {
  git(repo, "add", "-A");
  git(repo, "commit", "-q", "-m", message);
  return git(repo, "rev-parse", "HEAD").trim();
}

/** The values set before the freeze, as the world sets them in the scratch alone (C17): the settlement mark 60 minutes while HEAD leaves it unset (the world's copies are priced alike under either mark), and rules.md's markers replaced. */
export function setWorldValues(pkg: string): void {
  const design = path.join(pkg, "src", "copyh", "design.ts");
  const unset = "export const SETTLEMENT_MARK_MINUTES: 5 | 60 | null = null;";
  const text = readFileSync(design, "utf8");
  if (text.includes(unset))
    writeFileSync(
      design,
      text.replace(unset, unset.replace("= null;", "= 60;")),
    );
  const rules = path.join(pkg, "copyh", "rules.md");
  writeFileSync(
    rules,
    readFileSync(rules, "utf8").replace(
      /\[SET BEFORE THE FREEZE(?=[:\]])/g,
      "[SET FOR COPYH-WORLD",
    ),
  );
}

/** The world's lists in the scratch's `copyh/`: E's and S's fill files, their funding windows, no unpaired record, a calibration that says it is none. */
export function writeWorldLists(pkg: string, w: World): void {
  const copyh = path.join(pkg, "copyh");
  writeFileSync(
    path.join(copyh, "data.sha256"),
    listOf(
      "COPYH-WORLD's made-up fill files: E's every hour, then S's",
      new Map([...w.files.E, ...w.files.S]),
    ),
  );
  writeFileSync(
    path.join(copyh, "funding.sha256"),
    listOf(
      "COPYH-WORLD's made-up funding windows of E and S",
      new Map([...w.windows.E, ...w.windows.S]),
    ),
  );
  writeFileSync(
    path.join(copyh, "unpaired.json"),
    json({
      rule: "COPYH-WORLD: every made-up trade has its taker and its maker in one file",
      records: [],
    }),
  );
  writeFileSync(
    path.join(copyh, "calibration.json"),
    json({
      synthetic:
        "COPYH-WORLD: a made-up world's file; no calibration print was computed",
    }),
  );
}

/** The fortnight of a world with no copy in it (C15 (c) 10): no line, the SHA-256 of nothing. */
const EMPTY_FORTNIGHT = {
  sha256: sha256(""),
  lines: 0,
  byLine: {},
  legs: {},
  seconds: 0,
};

/** The scratch's files the world changes before the first list (copied into the control's scratch). */
export const WORLD_FILES = [
  "src/copyh/design.ts",
  "copyh/rules.md",
  "copyh/data.sha256",
  "copyh/funding.sha256",
  "copyh/unpaired.json",
  "copyh/calibration.json",
  "copyh/rehearsal.json",
];

/** A run of node: its exit code, its output and its seconds. */
export type Run = {
  readonly code: number | null;
  readonly stdout: string;
  readonly stderr: string;
  readonly seconds: number;
};

function runNode(
  cwd: string,
  args: readonly string[],
  env: NodeJS.ProcessEnv,
  timeoutMs: number,
): Promise<Run> {
  return new Promise((resolve, reject) => {
    const started = Date.now();
    const child = spawn(process.execPath, args, {
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8").on("data", (d: string) => (stdout += d));
    child.stderr.setEncoding("utf8").on("data", (d: string) => (stderr += d));
    const timer = setTimeout(() => child.kill(), timeoutMs);
    child.once("error", (err) => {
      clearTimeout(timer);
      reject(err);
    });
    child.once("close", (code) => {
      clearTimeout(timer);
      resolve({ code, stdout, stderr, seconds: (Date.now() - started) / 1000 });
    });
  });
}

/** This process's environment without what a run must not inherit: git's own variables and every setting the program reads. */
const cleanEnv = (): NodeJS.ProcessEnv =>
  Object.fromEntries(
    Object.entries(process.env).filter(
      ([k]) =>
        !/^(GIT_|COPYH_|WAVEH_STORE$|FRESH_STORE$|FRESH2_STORE$|PAPER_SEED$)/.test(
          k,
        ),
    ),
  );

/** The environment of a run with these settings alone. */
export function envOf(
  settings: Settings,
  names: readonly (keyof Settings)[],
): NodeJS.ProcessEnv {
  const env = cleanEnv();
  for (const n of names) env[n] = settings[n];
  return env;
}

/** A program's runs at most for one command: each exit 3 (its minutes spent) is run again (C15). */
const RUNS_AT_MOST = 20;
/** A run of the program at most, in ms: a run ends inside 15 minutes (C15). */
const RUN_LIMIT_MS = 20 * 60_000;

/** Whether this UTC minute lies in a closed window (C15). */
const inClosedWindow = (): boolean => {
  const minute = Math.floor((Date.now() % DAY_MS) / MINUTE_MS);
  return CLOSED_WINDOWS.some(([a, b]) => minute >= a && minute < b);
};

/** A program's run, and the last line its log holds after it (null: no log). */
export type ProgramRun = Run & { readonly last: unknown };

/** A command of the scratch's built program, run again after each exit 3 until it ends otherwise; never started in a closed window. Each run is appended to `<dir>\chain.jsonl`. */
export async function program(
  s: Scratch,
  env: NodeJS.ProcessEnv,
  args: readonly string[],
): Promise<ProgramRun> {
  const root = env.COPYH_ROOT ?? "";
  for (let k = 1; ; k++) {
    if (inClosedWindow())
      throw new Error(
        `${args.join(" ")}: a closed window (C15): run the world outside 02:30-06:00Z and 10:25-11:15Z`,
      );
    const r = await runNode(
      s.pkg,
      [path.join("dist", "copyh.js"), ...args],
      env,
      RUN_LIMIT_MS,
    );
    const last = existsSync(path.join(root, "logs"))
      ? (logOf(root).at(-1) ?? null)
      : null;
    writeFileSync(
      path.join(s.dir, "chain.jsonl"),
      `${JSON.stringify({ at: new Date().toISOString(), args, code: r.code, seconds: r.seconds, stderr: r.stderr, last })}\n`,
      { flag: "a" },
    );
    if (r.code !== 3 || k === RUNS_AT_MOST) return { ...r, last };
  }
}

/** The scratch's own freeze tool (`tools/copyh-freeze.cjs`), on the scratch's package. */
const freezeTool = (s: Scratch, args: readonly string[]) =>
  runNode(
    s.repo,
    [path.join("tools", "copyh-freeze.cjs"), ...args],
    cleanEnv(),
    600_000,
  );

/** The program's log lines in COPY-H's folder, every day's, in order. */
export function logOf(root: string): { msg: string; [k: string]: unknown }[] {
  const dir = path.join(root, "logs");
  return readdirSync(dir)
    .filter((f) => /^copyh-\d{4}-\d{2}-\d{2}\.log$/.test(f))
    .sort()
    .flatMap((f) =>
      readFileSync(path.join(dir, f), "utf8")
        .split("\n")
        .filter((l) => l !== "")
        .map((l) => JSON.parse(l) as { msg: string }),
    );
}

/**
 * E's store as the rehearsal records it (C15 (c)): built once by the
 * scratch's program into `<COPYH_ROOT>\E\store`, its manifest but for the
 * run's fields beside the scratch's store closure (`--closure`) and the empty
 * fortnight, in `copyh/rehearsal.json`; then the store moved aside, out of
 * COPY-H's folder (step 1 refuses it there). Its two runs, the build's and
 * the tool's.
 */
export async function writeRehearsal(
  s: Scratch,
  settings: Settings,
): Promise<{ build: Run; closure: Run }> {
  const build = await program(
    s,
    envOf(settings, ["COPYH_ROOT", "WAVEH_STORE"]),
    ["build", "--range", "E"],
  );
  if (build.code !== 0) return { build, closure: build };
  const closure = await freezeTool(s, ["--closure"]);
  if (closure.code !== 0) return { build, closure };
  const E = path.join(settings.COPYH_ROOT, "E");
  const manifest = JSON.parse(
    readFileSync(path.join(E, "store", "manifest.json"), "utf8"),
  ) as unknown;
  writeFileSync(
    path.join(s.pkg, "copyh", "rehearsal.json"),
    json({
      synthetic:
        "COPYH-WORLD: E's made-up store as the scratch's build --range E made it; no rehearsal count was computed",
      ...(JSON.parse(closure.stdout) as object),
      store: StoreRecord.parse(manifest),
      fortnight: EMPTY_FORTNIGHT,
    }),
  );
  renameSync(E, path.join(path.dirname(settings.COPYH_ROOT), "E-rehearsal"));
  return { build, closure };
}

/** `<COPYH_ROOT>\repro.json`, synthetic (the supervisor's ruling, 2026-11-27 14:00Z): the scratch build's fingerprint, passed, and why. */
export function writeRepro(s: Scratch, settings: Settings): void {
  mkdirSync(settings.COPYH_ROOT, { recursive: true });
  writeFileSync(
    path.join(settings.COPYH_ROOT, "repro.json"),
    json({
      synthetic:
        "COPYH-WORLD: written by the world's script, not by reproduce: the real reproduction passed on the real seed (the supervisor's runs), and the world reads nothing outside its scratch",
      identity: { program: fingerprintOf(s.pkg) },
      passed: true,
    }),
  );
}

/** A list made by the scratch's tool, committed and tagged `copyh-freeze-<n>` in the scratch; the tool's run and the list's commit. */
export async function freezeList(
  s: Scratch,
  args: readonly string[],
  n: number,
): Promise<{ run: Run; commit: string | null }> {
  const run = await freezeTool(s, args);
  if (run.code !== 0) return { run, commit: null };
  const commit = commitAll(s.repo, `COPYH-WORLD: the list copyh-freeze-${n}`);
  git(s.repo, "tag", `copyh-freeze-${n}`);
  return { run, commit };
}

/** The owner's rounds as the world declares them (C14): T1 every MAIN copy (it qualifies on E), T2 three traders of BROAD (below the choice's 100). */
export const TRIES = {
  rounds: [
    [
      {
        name: "T1",
        line: "MAIN",
        conditions: [{ covariate: "sizeUsd", op: ">=", value: 1000 }],
        why: "COPYH-WORLD: every copy of the world, so that a try qualifies on E",
      },
      {
        name: "T2",
        line: "BROAD",
        conditions: [{ covariate: "coin", op: "one of", value: [0, 1, 2] }],
        why: "COPYH-WORLD: three traders, below the choice's 100",
      },
    ],
  ],
};

/** FRESH-2's lists in the scratch (C14 (4) 2.): its fill files, its funding windows, and coins.json with the world's new coin appended (every coin before it unchanged). */
export function writeFresh2Lists(pkg: string, w: World): void {
  const copyh = path.join(pkg, "copyh");
  writeFileSync(
    path.join(copyh, "fresh2.sha256"),
    listOf("COPYH-WORLD's made-up FRESH-2 fill files", w.files["FRESH-2"]),
  );
  writeFileSync(
    path.join(copyh, "funding2.sha256"),
    listOf(
      "COPYH-WORLD's made-up FRESH-2 funding windows",
      w.windows["FRESH-2"],
    ),
  );
  const file = path.join(copyh, "coins.json");
  const coins = JSON.parse(readFileSync(file, "utf8")) as {
    coins: { iid: number }[];
  };
  writeFileSync(
    file,
    json({
      ...coins,
      coins: [
        ...coins.coins,
        {
          iid: coins.coins.length,
          name: NEW_COIN,
          szDecimals: 2,
          delisted: false,
        },
      ],
    }),
  );
}
