/**
 * One daily run (rules.md M15): the frozen files checked (else one line,
 * "frozen files differ", exit 4, nothing sealed opened); the paper run
 * waited for (else exit 5); every position recomputed from the inputs and
 * the record; then the day's record (the legs decided, the positions, the
 * log with the format counts first), the manifest, the backup (F16) and the
 * page last.
 */
import { createHash } from "node:crypto";
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  statSync,
} from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { z } from "zod";
import type { Logger } from "../log.js";
import { DAY_MS, utcDate } from "../schedule.js";
import { CUT, LOOK_ENDS, mondayOf, runEnd } from "../paper/instants.js";
import { loadResearch, type Research } from "../paper/research.js";
import { LOOK_Z } from "../paper/stats.js";
import { START, assemble, coinsLeftOut, type Assembled } from "./assemble.js";
import { namedSets } from "./compute.js";
import { LARGE, SMALL_COINS } from "./fills.js";
import { PACKAGE_ROOT, verifyFreeze } from "./gate.js";
import { kitData, standing, type KitData } from "./inputs.js";
import type { Position } from "./lines.js";
import {
  renderPage,
  renderPositions,
  type PageData,
  type PageRow,
} from "./page.js";
import { pricePosition } from "./price.js";
import { statOf, tailOf } from "./summary.js";
import { dayOf } from "./stats.js";
import { waitForPaper, writeWhole, type Market1Config } from "./run.js";

/** The old weeks' rehearsal alone passes these (its END must not pass the cut). */
export type Rehearsal = { from: number; start: number };

/**
 * What a run takes from outside itself, each by default the real one: the
 * package's folder, the kit's data (a test's synthetic world brings its own
 * panel pins, the kit's being frozen with it), the rule book's documents,
 * the clock of the paper run's wait.
 */
export type DailyIo = {
  packageRoot?: string;
  kd?: KitData;
  ruleBook?: () => Promise<unknown[]>;
  paperClock?: { now: () => number; sleep: (ms: number) => Promise<void> };
  rehearsal?: Rehearsal;
};

const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");

/** The record, in its own words: each run's files and their hashes. */
class RunRecord {
  private readonly written: string[] = [];
  constructor(readonly root: string) {}
  write(rel: string, bytes: Buffer | string): void {
    writeWhole(path.join(this.root, rel), bytes);
    this.written.push(`${sha256(bytes)} *${rel}`);
  }
  logLine(runDate: string, record: object): void {
    const file = path.join(this.root, "log", `${runDate}.jsonl`);
    mkdirSync(path.dirname(file), { recursive: true });
    appendFileSync(file, `${JSON.stringify(record)}\n`);
  }
  flushManifest(runDate: string): void {
    if (this.written.length === 0) return;
    const file = path.join(this.root, "manifest", `${runDate}.sha256`);
    mkdirSync(path.dirname(file), { recursive: true });
    appendFileSync(file, `${this.written.join("\n")}\n`);
    this.written.length = 0;
  }
}

/** MARKET-1's own backup list (F16): what cannot be read again, its decisive inputs first. */
export const BACKED_UP = [
  "books",
  "days",
  "log",
  "manifest",
  "looks",
  "page",
  "seen.json",
];

function filesUnder(root: string, rel: string): string[] {
  const full = path.join(root, rel);
  if (!existsSync(full)) return [];
  if (!statSync(full).isDirectory()) return [rel];
  return readdirSync(full)
    .sort()
    .flatMap((n) => filesUnder(root, path.join(rel, n)));
}

/** Copies a file when its copy is missing or differs; never deletes there. Returns how many were copied. */
export function backupMarket1(root: string, dest: string): number {
  let copied = 0;
  for (const rel of BACKED_UP.flatMap((r) => filesUnder(root, r))) {
    const from = path.join(root, rel);
    const to = path.join(dest, rel);
    if (
      existsSync(to) &&
      statSync(to).size === statSync(from).size &&
      sha256(readFileSync(to)) === sha256(readFileSync(from))
    )
      continue;
    mkdirSync(path.dirname(to), { recursive: true });
    copyFileSync(from, `${to}.tmp`);
    renameSync(`${to}.tmp`, to);
    copied += 1;
  }
  return copied;
}

const Seen = z.record(z.string(), z.string());
const keyOf = (p: Position) => `${p.line}|${p.iid}|${p.t}|${p.side}`;

/** The shared files the run used, and the runtime (information, not a stop; M0). */
export function sharedFiles(
  packageRoot = PACKAGE_ROOT,
): Record<string, string> {
  const out: Record<string, string> = { node: process.version };
  for (const f of ["schedule.js", "log.js", "lock.js", "store/db.js"]) {
    const file = path.join(packageRoot, "dist", f);
    out[f] = existsSync(file) ? sha256(readFileSync(file)) : "missing";
  }
  return out;
}

const LookResult = z.object({
  look: z.number().int(),
  end: z.string(),
  verdict: z.enum(["KEEP", "DROP", "TOO FEW TO TELL", "WITHHELD"]),
  sentence: z.string(),
});

/** The looks run so far (their results), by look. */
export function looksDone(root: string): (z.infer<typeof LookResult> | null)[] {
  return [1, 2, 3].map((k) => {
    const file = path.join(root, "looks", `L${k}`, "result.json");
    return existsSync(file)
      ? LookResult.parse(JSON.parse(readFileSync(file, "utf8")))
      : null;
  });
}

/** M14's verdict box. */
export function verdictBox(
  done: readonly (z.infer<typeof LookResult> | null)[],
): string[] {
  const next = (k: number) => {
    const i = done.findIndex((d, j) => j >= k && d === null);
    return i < 0 ? null : utcDate(LOOK_ENDS[i]!);
  };
  const last = done.reduce<number>((l, d, i) => (d === null ? l : i), -1);
  if (last < 0) return [`Too early to judge — next look ${next(0)}.`];
  const r = done[last]!;
  const lines = [
    `Look ${last + 1} (${r.end.slice(0, 10)}): WAVE ${r.verdict}.`,
    r.sentence,
  ];
  const n = next(last + 1);
  if (r.verdict !== "KEEP" && r.verdict !== "DROP" && n !== null)
    lines.push(`Next look ${n}.`);
  return lines;
}

/** M14's fee alarm (F9): a recorded rate for these markets other than the kit's 4 bps. */
export function feeAlarm(a: Assembled, kd: KitData, kit: Research): string[] {
  const changed = new Set<number>();
  for (const iid of [...SMALL_COINS, ...LARGE]) {
    const cat = kd.markets.get(iid)?.category ?? "";
    for (const s of a.book.fees) {
      const o = s.overrides.get(iid);
      const rate = o?.rate ?? s.schedule?.get(cat) ?? null;
      if (rate !== null && rate !== kit.costs.feeAt("taker", iid, s.at))
        changed.add(iid);
    }
  }
  return changed.size === 0
    ? []
    : [
        `alarm: a recorded taker rate differs from 4 bps in markets ${[...changed].join(", ")} — their legs are priced at the recorded rate (M9)`,
      ];
}

export async function daily(
  config: Market1Config,
  log: Logger,
  stage: (what: string) => void,
  now = Date.now(),
  io: DailyIo = {},
): Promise<number> {
  const packageRoot = io.packageRoot ?? PACKAGE_ROOT;
  const runDate = utcDate(now);
  const end = runEnd(now);
  if (io.rehearsal && end > CUT)
    throw new Error("a rehearsal runs only on weeks before the cut");
  const record = new RunRecord(config.MARKET1_ROOT);
  const freeze = verifyFreeze(packageRoot);
  if (!freeze.ok) {
    record.logLine(runDate, {
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
  const gate = { open: true };
  const kit = await loadResearch(path.join(packageRoot, "research"));
  const kd = io.kd ?? kitData(packageRoot);
  stage("waiting for the paper experiment's run");
  if (!(await waitForPaper(config.STATE_DIR, log, io.paperClock))) {
    record.logLine(runDate, {
      at: new Date().toISOString(),
      line: "the paper experiment's run is still live after 6 hours: nothing read",
    });
    return 5;
  }
  stage("reading");
  const at = io.rehearsal
    ? { cut: io.rehearsal.from, start: io.rehearsal.start }
    : { cut: CUT, start: START };
  const a = await assemble({
    gate,
    config,
    kit,
    kd,
    end,
    at,
    ruleBook: io.ruleBook,
  });
  stage("writing");
  const seenFile = path.join(config.MARKET1_ROOT, "seen.json");
  const seen = existsSync(seenFile)
    ? Seen.parse(JSON.parse(readFileSync(seenFile, "utf8")))
    : {};
  for (const p of a.positions) seen[keyOf(p)] ??= runDate;
  const sets = namedSets(a.positions, end, a.book.competitions);
  const done = looksDone(config.MARKET1_ROOT);
  const nextLook = done.findIndex((d) => d === null);
  const data = pageData(
    a,
    kd,
    kit,
    end,
    runDate,
    seen,
    sets,
    { sha256: freeze.sha256, at: freezeDate(packageRoot) },
    LOOK_Z[nextLook < 0 ? 2 : nextLook]!,
  );
  data.verdict = verdictBox(done);
  data.alarms.push(...feeAlarm(a, kd, kit));
  // The day's record first: the legs decided, every position, the log line, the manifest, the backup; the page last.
  if (a.decided.length > 0)
    record.write(
      `books/${runDate}.jsonl.gz`,
      gzipSync(a.decided.map((l) => JSON.stringify(l)).join("\n")),
    );
  record.write(
    `log/${runDate}-positions.jsonl.gz`,
    gzipSync(
      a.positions
        .map((p) => JSON.stringify({ ...p, firstSeen: seen[keyOf(p)] }))
        .join("\n"),
    ),
  );
  record.write("seen.json", `${JSON.stringify(seen)}\n`);
  record.logLine(runDate, {
    at: new Date().toISOString(),
    end: new Date(end).toISOString(),
    format: a.format,
    frozen: freeze.sha256,
    kit: kit.fingerprint,
    positions: Object.fromEntries([...sets].map(([n, ps]) => [n, ps.length])),
    pending: a.positions.filter((p) => p.priced === null).length,
    legsDecided: a.decided.length,
    feeCategories: [...(a.book.fees.at(-1)?.schedule?.keys() ?? [])].sort(),
    ruleBookRefused: a.book.rejected,
    coinsLeftOut: coinsLeftOut(a.book, a.docs),
    alarms: data.alarms,
    shared: sharedFiles(packageRoot),
  });
  record.flushManifest(runDate);
  try {
    log.info(
      { copied: backupMarket1(config.MARKET1_ROOT, config.MARKET1_BACKUP) },
      "backed up",
    );
  } catch (err) {
    log.error({ err }, "the backup failed; the run's files stand");
    record.logLine(runDate, {
      at: new Date().toISOString(),
      line: "the backup failed",
      error: err instanceof Error ? err.message : String(err),
    });
    data.alarms.push("the backup failed: its error is in the log of the run");
  }
  writeWhole(
    path.join(config.MARKET1_ROOT, "page", "index.html"),
    renderPage(data),
  );
  writeWhole(
    path.join(config.MARKET1_ROOT, "page", "positions.html"),
    renderPositions(data),
  );
  return 0;
}

/** The page's data (M14) from the same objects the log records. */
export function pageData(
  a: Assembled,
  kd: KitData,
  kit: Research,
  end: number,
  runDate: string,
  seen: Record<string, string>,
  sets: Map<string, Position[]>,
  frozen: { sha256: string; at: string },
  zNext: number,
): PageData {
  const accounts = [...a.pool.accounts.values()];
  const reading = accounts.filter((x) => !standing(x));
  const minP =
    reading.length === 0 ? null : Math.min(...reading.map((x) => x.P));
  const complete = minP === null ? null : mondayOf(minP);
  const wave = a.positions.filter((p) => p.line === "WAVE");
  const closed = wave.filter((p) => p.xOut < end);
  const head = complete === null ? [] : closed.filter((p) => p.t < complete);
  const items = head.flatMap((p) =>
    p.priced?.net == null ? [] : [{ t: p.t, iid: p.iid, x: p.priced.net }],
  );
  const money = statOf(kit, items);
  const tail = head.length === 0 ? null : tailOf(head);
  const symbol = (iid: number) => kd.markets.get(iid)?.symbol ?? String(iid);
  const rows: PageRow[] = [...wave]
    .sort((x, y) => y.t - x.t || y.iid - x.iid)
    .map((p) => {
      const open = p.xOut >= end;
      let net = p.priced?.net ?? null;
      let state: PageRow["state"] = p.priced === null ? "pending" : "closed";
      if (open) {
        const mk = a.market(p.iid);
        const interim =
          mk === null || mk.end <= end - 1
            ? null
            : pricePosition(kit, mk, {
                dir: p.dir,
                xIn: p.xIn,
                xOut: end - 1,
                entry: { source: "mark", why: "open" },
                exit: { source: "mark", why: "open" },
                fee: (t) => a.fee(p.iid, t),
                base: null,
              });
        net = interim?.net ?? null;
        state = interim === null ? "pending" : "open, at the mark";
      }
      const flags = [
        ...(p.priced?.markLegs ?? []).flatMap((m, i) =>
          m === null ? [] : [`${i === 0 ? "in" : "out"} at the mark: ${m}`],
        ),
        ...(p.priced?.depthShort ? ["depth short"] : []),
        ...(p.priced?.unpriced ? [`unpriced: ${p.priced.unpriced}`] : []),
      ];
      return {
        symbol: symbol(p.iid),
        side: p.side === -1 ? "forced sell" : "forced buy",
        t: p.t,
        accounts: p.accounts.length,
        xIn: p.xIn,
        pIn: p.priced?.pIn ?? null,
        inAt:
          p.priced === null
            ? "pending"
            : p.priced.markLegs[0] === null
              ? "book"
              : "mark",
        xOut: p.xOut,
        state,
        net,
        flags,
        firstSeen: seen[keyOf(p)] ?? runDate,
      };
    });
  const alarms = [
    ...a.format.alarmDays.map(
      (d) =>
        `alarm: book lines of ${d} fail MARKET-1's schema — that day is a gap`,
    ),
    ...a.format.coverageUnreadable.map(
      (d) => `alarm: the coverage of ${d} cannot be read — that day is a gap`,
    ),
    ...(a.format.changedFiles > 0
      ? [
          `alarm: ${a.format.changedFiles} book hour files changed since their check — their hours are gaps`,
        ]
      : []),
    ...(a.book.rejected > 0
      ? [`rule-book documents refused: ${a.book.rejected}`]
      : []),
  ];
  return {
    runDate,
    dataThrough: utcDate(end - DAY_MS),
    readThrough:
      minP === null
        ? null
        : new Date(minP).toISOString().slice(0, 16).replace("T", " "),
    frozen,
    verdict: [],
    headline: {
      completeBefore: complete === null ? null : utcDate(complete),
      positions: head.length,
      days: new Set(head.map((p) => dayOf(p.t))).size,
      markets: new Set(head.map((p) => p.iid)).size,
      mean: money?.mean ?? null,
      se: money?.se ?? null,
      band:
        money === null || money.se === null
          ? null
          : {
              low: money.mean - zNext * money.se,
              high: money.mean + zNext * money.se,
            },
      tail:
        tail === null || tail.worstDay === null
          ? null
          : {
              worstDay: `${tail.worstDay.day} (${tail.worstDay.sum.toFixed(0)} bps over ${tail.worstDay.positions})`,
              largestFall: tail.largestFall,
              mostOpen: tail.mostOpen,
              worst: tail.worst,
            },
      markPriced: head.filter((p) => p.priced?.markLegs.some((m) => m !== null))
        .length,
      depthShort: head.filter((p) => p.priced?.depthShort === true).length,
      pending: head.filter((p) => p.priced === null).length,
      unpriced: head.filter((p) => p.priced !== null && p.priced.net === null)
        .length,
    },
    partial: {
      positions:
        complete === null
          ? wave.length
          : wave.filter((p) => p.t >= complete).length,
      from: complete === null ? null : utcDate(complete),
    },
    beside: [...sets]
      .filter(([n]) => n !== "WAVE")
      .map(([name, ps]) => ({ name, positions: ps.length })),
    weeks: [...a.pool.fills.weeks]
      .sort((x, y) => x[0] - y[0])
      .map(([m, w]) => ({ monday: utcDate(m), ...w })),
    alarms,
    coinsLeftOut: coinsLeftOut(a.book, a.docs).map(
      (c) =>
        `${symbol(c.iid)} from ${c.from} (${c.records.join(", ") || "the record of that day"})`,
    ),
    rows,
  };
}

/** The freeze's instant, from the list's head line (`# written <ISO> …`). */
export function freezeDate(packageRoot: string): string {
  const head = readFileSync(
    path.join(packageRoot, "market1", "FROZEN.sha256"),
    "utf8",
  );
  return /^# written (S+)/m.exec(head)?.[1]?.slice(0, 10) ?? "unknown";
}
