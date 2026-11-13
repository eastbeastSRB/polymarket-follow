/**
 * A look (rules.md M10, M11, M13, M15, with MARKET-PLAN-REVIEW F11): once,
 * on or after the Monday after END_k, when the reads through END_k are
 * complete — every pool account's P at END_k or a standing hole, every
 * recording day through END_k's day and the day after closed or missing, the
 * 40 markets' market-days before END_k present — or 7 days after that
 * Monday whatever is missing (listed; a leg not final then at the mark,
 * flagged). WAVE alone carries a verdict; every other line prints the same
 * figures with none.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import { gzipSync } from "node:zlib";
import type { Logger } from "../log.js";
import { DAY_MS, utcDate } from "../schedule.js";
import { CUT, LOOK_ENDS, mondayOf } from "../paper/instants.js";
import { loadResearch } from "../paper/research.js";
import { LOOK_Z } from "../paper/stats.js";
import { PaperStore } from "../paper/store.js";
import { START, assemble, coinsLeftOut } from "./assemble.js";
import { namedSets } from "./compute.js";
import { LARGE, SMALL_COINS } from "./fills.js";
import { PACKAGE_ROOT, gateOf, verifyFreeze } from "./gate.js";
import { kitData, standing } from "./inputs.js";
import { legFinal, recordingDays } from "./recordings.js";
import { RunRecord, looksDone, type DailyIo } from "./daily.js";
import { smallestEdge, verdict, sentence } from "./stats.js";
import { summarize, tailOf } from "./summary.js";
import { waitForPaper, writeWhole, type Market1Config } from "./run.js";

/** The Monday after END_k (END_k falls on a Saturday). */
export const lookMonday = (k: 1 | 2 | 3): number =>
  mondayOf(LOOK_ENDS[k - 1]!) + 7 * DAY_MS;
/** A look waits for its reads at most 7 days past its Monday (M15). */
export const LOOK_WAIT_MS = 7 * DAY_MS;

export async function look(
  config: Market1Config,
  log: Logger,
  k: 1 | 2 | 3,
  now = Date.now(),
  io: DailyIo = {},
): Promise<number> {
  const packageRoot = io.packageRoot ?? PACKAGE_ROOT;
  const runDate = utcDate(now);
  const record = new RunRecord(config.MARKET1_ROOT);
  const freeze = verifyFreeze(packageRoot);
  if (!freeze.ok) {
    record.logLine(runDate, {
      at: new Date().toISOString(),
      line: "frozen files differ",
      problems: freeze.problems,
    });
    return 4;
  }
  const end = LOOK_ENDS[k - 1]!;
  const resultFile = path.join(
    config.MARKET1_ROOT,
    "looks",
    `L${k}`,
    "result.json",
  );
  const refuse = (why: string) => {
    record.logLine(runDate, {
      at: new Date().toISOString(),
      look: k,
      line: why,
    });
    log.warn({ look: k }, why);
    return 5;
  };
  if (now < lookMonday(k)) return refuse("the look is not due");
  if (existsSync(resultFile)) return refuse("the look has run already");
  if (!(await waitForPaper(config.STATE_DIR, log, io.paperClock)))
    return refuse("the paper experiment's run is still live after 6 hours");
  const gate = gateOf(freeze);
  const kit = await loadResearch(path.join(packageRoot, "research"));
  const kd = io.kd ?? kitData(packageRoot);
  // Readiness (M15, F11).
  const state = new PaperStore(config.PAPER_ROOT).readState();
  const behind = kd.pool.filter((addr) => {
    const a = state.accounts[addr];
    return a === undefined || (a.P < end && !standing(a));
  });
  const days = recordingDays(gate, config.RECORDINGS_ROOT, end + 2 * DAY_MS);
  // END_k's own day is then closed or missing as well (a later day is closed).
  const recordingsFinal = legFinal(days, end);
  const store = new PaperStore(config.PAPER_ROOT);
  const marketDaysMissing = [...SMALL_COINS, ...LARGE].flatMap((iid) => {
    const present = store.marketDays(iid);
    const out: string[] = [];
    for (let d = CUT; d < end; d += DAY_MS)
      if (!present.has(d)) out.push(`${iid} ${utcDate(d)}`);
    return out;
  });
  const missing = [
    ...(behind.length > 0
      ? [`${behind.length} pool accounts not read through ${utcDate(end)}`]
      : []),
    ...(recordingsFinal
      ? []
      : [
          `recording days through ${utcDate(end)} and the day after not all closed`,
        ]),
    ...(marketDaysMissing.length > 0
      ? [`market-days missing: ${marketDaysMissing.length}`]
      : []),
  ];
  const forced = missing.length > 0;
  if (forced && now < lookMonday(k) + LOOK_WAIT_MS)
    return refuse(`the look is not ready: ${missing.join("; ")}`);
  const a = await assemble({
    gate,
    config,
    kit,
    kd,
    end,
    at: { cut: CUT, start: START },
    ruleBook: io.ruleBook,
    forceLegs: forced,
  });
  const z = LOOK_Z[k - 1]!;
  const sets = namedSets(a.positions, end, a.book.competitions);
  const wave = sets.get("WAVE")!;
  const w = summarize(kit, wave, z);
  const v = verdict({
    mean: w.money?.mean ?? 0,
    se: w.money?.se ?? null,
    z,
    meanExcess: w.excess?.mean ?? null,
    notAtBookShare: w.notAtBookShare,
    days: w.money?.days ?? 0,
    markets: w.money?.markets ?? 0,
  });
  const earlier = looksDone(config.MARKET1_ROOT)
    .slice(0, k - 1)
    .some((d) => d !== null && (d.verdict === "KEEP" || d.verdict === "DROP"));
  const holes = [...a.pool.accounts].flatMap(([addr, acc]) =>
    acc.holes.map((h) => ({ addr, ...h })),
  );
  const windowsOnHoles = wave.filter((p) =>
    holes.some((h) => h.from <= p.t && p.t - 3_600_000 < h.to),
  ).length;
  const daysSoFar = (end - DAY_MS - START) / DAY_MS;
  const ends: readonly number[] = LOOK_ENDS;
  const zs: readonly number[] = LOOK_Z;
  const next = ends[k] ?? null;
  const result = {
    look: k,
    end: new Date(end).toISOString(),
    verdict: v,
    sentence: sentence(k, v, w.money?.mean ?? 0, w.money?.se ?? null, z),
    afterTheVerdict: earlier,
    frozen: freeze.sha256,
    forced,
    missing,
    z,
    wave: { ...w, tail: tailOf(wave) },
    beside: Object.fromEntries(
      [...sets]
        .filter(([n]) => n !== "WAVE")
        .map(([n, ps]) => [n, summarize(kit, ps, z)]),
    ),
    smallestEdgeNextLook:
      next === null
        ? null
        : smallestEdge(
            w.money?.se ?? null,
            zs[k]!,
            daysSoFar,
            (next - DAY_MS - START) / DAY_MS,
          ),
    holes: Object.fromEntries(
      [...new Set(holes.map((h) => h.cause))].map((c) => [
        c,
        holes.filter((h) => h.cause === c).length,
      ]),
    ),
    waveWindowsOnHoles: windowsOnHoles,
    outsideLiquidations: Object.fromEntries(a.pool.fills.outside),
    weeks: Object.fromEntries(
      [...a.pool.fills.weeks].map(([m, x]) => [utcDate(m), x]),
    ),
    coinsLeftOut: coinsLeftOut(a.book, a.docs),
    alarmDays: a.format.alarmDays,
    format: a.format,
  };
  if (a.decided.length > 0) {
    record.write(
      `books/${runDate}-L${k}.jsonl.gz`,
      gzipSync(a.decided.map((l) => JSON.stringify(l)).join("\n")),
    );
    record.flushManifest(runDate);
  }
  writeWhole(resultFile, `${JSON.stringify(result, null, 2)}\n`);
  record.logLine(runDate, {
    at: new Date().toISOString(),
    look: k,
    verdict: v,
    forced,
    missing,
  });
  return 0;
}
