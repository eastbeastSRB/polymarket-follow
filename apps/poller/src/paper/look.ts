/**
 * A look (the plan's R12, R14, R16 and part 7, with its review's F2 and
 * F16): run once, on the Monday after its date, after that day's run, with
 * END = END_k. It waits while the reads are unfinished — every account of
 * the last week's list and every one with an open copy read to END_k, every
 * other to the latest Monday before it, every market-day present — at most
 * a week past END_k + 2 days, then runs and lists what was not read as
 * holes. A second run of a look is refused. The first KEEP or DROP is the
 * test's verdict; a later look prints its figures marked "after the
 * verdict".
 */
import { existsSync } from "node:fs";
import path from "node:path";
import type { Logger } from "../log.js";
import { DAY_MS, utcDate } from "../schedule.js";
import {
  fixedInputs,
  loadCache,
  looksDone,
  PACKAGE_ROOT,
  ruleBookOf,
  scoreInput,
  type DailyConfig,
  type DailyIo,
} from "./daily.js";
import { verifyFreeze } from "./gate.js";
import { CUT, LOOK_ENDS, WEEK_MS, mondayOf } from "./instants.js";
import { loadResearch } from "./research.js";
import { LINES, score, weekList } from "./score.js";
import { PaperStore, writeAtomic } from "./store.js";
import { lookReport } from "./summary.js";

/** How long past its Monday a look waits for unfinished reads. */
export const LOOK_WAIT_MS = 7 * DAY_MS;

export async function look(
  config: DailyConfig,
  log: Logger,
  k: 1 | 2 | 3,
  now = Date.now(),
  io: DailyIo = {},
): Promise<number> {
  const packageRoot = io.packageRoot ?? PACKAGE_ROOT;
  const store = new PaperStore(config.PAPER_ROOT);
  const freeze = verifyFreeze(packageRoot);
  if (!freeze.ok) {
    log.error({ problems: freeze.problems }, "frozen files differ: no look");
    return 4;
  }
  const ends: readonly number[] = LOOK_ENDS;
  const end = ends[k - 1]!;
  const dir = path.join(config.PAPER_ROOT, "looks", `L${k}`);
  if (existsSync(path.join(dir, "result.json"))) {
    log.error({ k }, "this look has run: a look runs once");
    return 5;
  }
  const monday = end + 2 * DAY_MS;
  if (now < monday) {
    log.error(
      { k, monday: utcDate(monday) },
      "a look runs on the Monday after its date",
    );
    return 5;
  }
  const kit = await loadResearch(path.join(packageRoot, "research"));
  const fixed = io.fixed ?? fixedInputs(kit, packageRoot);
  const state = store.readState();
  const book = await ruleBookOf(config, io, fixed);
  const cache = loadCache(config.PAPER_ROOT);
  const setup = { kit, store, state, book, cache, end };
  const lastMonday = mondayOf(end - 1);
  const list = weekList(
    scoreInput({ ...setup, end: lastMonday + WEEK_MS }, fixed),
    lastMonday,
  );
  const unread = fixed.pool.flatMap(({ addr }) => {
    const a = state.accounts[addr];
    const due = list.has(addr) ? end : lastMonday;
    const standing =
      a?.holes.some((h) => h.cause === "account not found") ?? false;
    return standing || (a !== undefined && a.P >= due)
      ? []
      : [{ addr, P: a?.P ?? CUT, due }];
  });
  const missingDays = fixed.markets.flatMap((iid) => {
    const present = store.marketDays(iid);
    const out: string[] = [];
    for (let d = CUT; d < end; d += DAY_MS)
      if (!present.has(d)) out.push(`${iid} ${utcDate(d)}`);
    return out;
  });
  const ready = unread.length === 0 && missingDays.length === 0;
  if (!ready && now < monday + LOOK_WAIT_MS) {
    log.warn(
      { k, unread: unread.length, missingDays: missingDays.length },
      "the reads are unfinished: the look waits",
    );
    return 5;
  }
  const earlier = looksDone(config.PAPER_ROOT).flatMap((l) =>
    l !== null && l.k < k && (l.verdict === "KEEP" || l.verdict === "DROP")
      ? [{ look: l.k, verdict: l.verdict }]
      : [],
  );
  const scored = score(scoreInput(setup, fixed));
  const result = {
    look: k,
    end: new Date(end).toISOString(),
    ranAt: new Date(now).toISOString(),
    frozen: freeze.sha256,
    kit: kit.fingerprint,
    afterTheVerdict: earlier[0] ?? null,
    unreadListedAsHoles: unread,
    marketDaysMissing: missingDays,
    lines: LINES.map((line) => lookReport(kit, scored, line, k)),
  };
  writeAtomic(
    path.join(dir, "result.json"),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  log.info(
    { k, verdict: result.lines.find((l) => l.line === "MAIN")?.verdict },
    "look written",
  );
  return 0;
}
