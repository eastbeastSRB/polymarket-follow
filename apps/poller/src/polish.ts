/**
 * The polishing's program (the polishing plan 4.6; decisions 2026-11-17,
 * the plan approved), run by hand from the repository's build, one run at a
 * time, at idle priority, with a 16 GB heap (F3); it makes no request to any
 * API:
 *
 *   node --max-old-space-size=16384 dist/polish.js extract [--workers n] [--day YYYY-MM-DD]
 *
 * `extract`: WAVE-H's ten months into the analyzer's store (extract.ts),
 * every file held to the frozen `waveh/data.sha256`; `--day` one day of
 * them, for a timing run. Settings, no defaults: WAVEH_STORE (WAVE-H's raw
 * store, read only) and ANALYZER_ROOT (the analyzer's folder of the range).
 * Exit codes: 0 done, 1 a crash, 2 bad settings, 4 WAVE-H's freeze does not
 * verify, 5 not ready.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { createLog } from "./log.js";
import { extract } from "./polish/extract.js";
import { WAVEH_RANGE, dayOf } from "./polish/range.js";
import { ExtractSettings, exitOf, fingerprintOf } from "./polish/run.js";
import { fortyOf } from "./polish/writers.js";
import { WAVEH_DIR, loadCoins } from "./waveh/coins.js";
import { PACKAGE_ROOT, verifyFreeze } from "./waveh/gate.js";
import { FrozenDiffer, windowEnd } from "./waveh/run.js";
import { readDataList } from "./waveh/store.js";

function refuse(why: string): never {
  process.stderr.write(`polish: refused: ${why}\n`);
  process.exit(2);
}

const [command, ...options] = process.argv.slice(2);
if (command !== "extract") refuse(`the command "${command ?? ""}": extract`);
let workers = 6;
let day: string | null = null;
for (let i = 0; i < options.length; i += 2) {
  const [flag, value] = [options[i], options[i + 1]];
  if (flag === "--workers" && /^([1-9]|1[0-6])$/.test(value ?? ""))
    workers = Number(value);
  else if (flag === "--day" && /^\d{4}-\d\d-\d\d$/.test(value ?? ""))
    day = value!;
  else refuse(`the option "${flag ?? ""} ${value ?? ""}"`);
}
const parsed = ExtractSettings.safeParse(process.env);
if (!parsed.success)
  refuse(
    parsed.error.issues
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; "),
  );
const settings = parsed.data;
let range = WAVEH_RANGE;
if (day !== null) {
  try {
    range = dayOf(WAVEH_RANGE, day);
  } catch (err) {
    refuse((err as Error).message);
  }
}

os.setPriority(os.constants.priority.PRIORITY_LOW);
const { log, close } = createLog(settings.ANALYZER_ROOT, "polish");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let code = 0;
try {
  const freeze = verifyFreeze(PACKAGE_ROOT);
  if (!freeze.ok)
    throw new FrozenDiffer(
      `${freeze.problems.length}: ${freeze.problems.slice(0, 10).join("; ")}`,
    );
  const fingerprint = fingerprintOf(PACKAGE_ROOT);
  log.info(
    {
      node: process.version,
      wavehFrozen: freeze.sha256,
      fingerprint,
      workers,
      day,
    },
    `start ${command}`,
  );
  const data = readFileSync(path.join(WAVEH_DIR, "data.sha256"));
  const coins = loadCoins();
  const manifest = await extract({
    store: settings.WAVEH_STORE,
    root: settings.ANALYZER_ROOT,
    list: readDataList(data.toString("utf8")),
    listName: "waveh/data.sha256",
    listSha256: createHash("sha256").update(data).digest("hex"),
    range,
    workers,
    code: fingerprint,
    wavehFrozen: freeze.sha256,
    forty: [...fortyOf(coins)],
    small: coins.list.map((c) => c.name),
    pace: async () => {
      for (
        let end = windowEnd(Date.now());
        end !== null;
        end = windowEnd(Date.now())
      ) {
        log.info({ until: new Date(end).toISOString() }, "a window: waiting");
        await sleep(Math.min(60_000, end - Date.now() + 1_000));
      }
    },
    log: (event, fields) => log.info(fields, event),
  });
  log.info(
    { partitions: manifest.partitions.length, seconds: manifest.seconds },
    "done",
  );
} catch (err) {
  const exit = exitOf(err);
  if (exit.code === 1)
    log.error({ err: String((err as Error)?.stack ?? err) }, exit.event);
  else log.warn({ why: (err as Error).message }, exit.event);
  code = exit.code;
} finally {
  close();
}
process.exit(code);
