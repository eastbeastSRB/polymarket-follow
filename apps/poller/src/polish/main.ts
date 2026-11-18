/**
 * The polishing's program, run by `dist/polish.js` in a worker thread of a
 * 20 GB heap (polish.ts, the launcher; decisions 2026-11-18, EXTRACT-REVIEW's
 * findings, L5). `extract`: WAVE-H's ten months into the analyzer's store
 * (extract.ts), every file held to the frozen `waveh/data.sha256`; `--day`
 * one day of them, for a timing run. `gates`: the store's gates G0–G6
 * (gates.ts) into `<ANALYZER_ROOT>\gates\gates.json`. `explore`: its frame
 * (explore.ts), the store opened only when its gates passed. Settings, no
 * defaults: WAVEH_STORE (WAVE-H's raw store, read only), ANALYZER_ROOT (the
 * analyzer's folder of the range), and for `gates` WAVEH_ROOT (WAVE-H's
 * rehearsal and look, read only). Exit codes: 0 done, 1 a crash, 2 bad
 * settings, 4 WAVE-H's freeze does not verify, 5 not ready, 6 a gate failed.
 * Every line goes to the log, `<ANALYZER_ROOT>\logs\polish-<day>.log`;
 * stderr says only why the program stopped before its log was open.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { getHeapStatistics } from "node:v8";
import { createLog } from "../log.js";
import { loadResearch } from "../paper/research.js";
import { explore, trustedStore, wholeStore } from "./explore.js";
import { extract } from "./extract.js";
import { WAVEH_EXPECTED, runGates } from "./gates.js";
import { GATES } from "./library.js";
import { WAVEH_RANGE, dayOf } from "./range.js";
import {
  ExtractSettings,
  GateFailed,
  LookSettings,
  exitOf,
  fingerprintOf,
} from "./run.js";
import { checkPath } from "./seal.js";
import { fortyOf } from "./writers.js";
import { WAVEH_DIR, loadCoins } from "../waveh/coins.js";
import { PACKAGE_ROOT, gateOf, sha256, verifyFreeze } from "../waveh/gate.js";
import { loadSizing } from "../waveh/look.js";
import { FrozenDiffer, windowEnd } from "../waveh/run.js";
import { readDataList } from "../waveh/store.js";

function refuse(why: string): never {
  process.stderr.write(`polish: refused: ${why}\n`);
  process.exit(2);
}
const issues = (e: { issues: { path: PropertyKey[]; message: string }[] }) =>
  e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");

const [command, ...options] = process.argv.slice(2);
if (command !== "extract" && command !== "gates" && command !== "explore")
  refuse(`the command "${command ?? ""}": extract, gates or explore`);
let workers = 6;
let day: string | null = null;
for (let i = 0; i < options.length; i += 2) {
  const [flag, value] = [options[i], options[i + 1]];
  if (
    command === "extract" &&
    flag === "--workers" &&
    /^([1-9]|1[0-6])$/.test(value ?? "")
  )
    workers = Number(value);
  else if (
    command === "extract" &&
    flag === "--day" &&
    /^\d{4}-\d\d-\d\d$/.test(value ?? "")
  )
    day = value!;
  else refuse(`the option "${flag ?? ""} ${value ?? ""}"`);
}
const parsed = ExtractSettings.safeParse(process.env);
if (!parsed.success) refuse(issues(parsed.error));
const settings = parsed.data;
const look = LookSettings.safeParse(process.env);
if (command === "gates" && !look.success) refuse(issues(look.error));
let range = WAVEH_RANGE;
if (day !== null) {
  try {
    range = dayOf(WAVEH_RANGE, day);
  } catch (err) {
    refuse((err as Error).message);
  }
}

// The seal before anything is opened or made, the log's folder included.
try {
  checkPath(settings.WAVEH_STORE);
  checkPath(settings.ANALYZER_ROOT);
  if (command === "gates") checkPath(look.data!.WAVEH_ROOT);
} catch (err) {
  process.stderr.write(`polish: not ready: ${(err as Error).message}\n`);
  process.exit(5);
}

os.setPriority(os.constants.priority.PRIORITY_LOW);
const { log, close } = createLog(settings.ANALYZER_ROOT, "polish");
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const pace = async () => {
  for (
    let end = windowEnd(Date.now());
    end !== null;
    end = windowEnd(Date.now())
  ) {
    log.info({ until: new Date(end).toISOString() }, "a window: waiting");
    await sleep(Math.min(60_000, end - Date.now() + 1_000));
  }
};
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
      heapLimitMB: Math.round(getHeapStatistics().heap_size_limit / 2 ** 20),
    },
    `start ${command}`,
  );
  const data = readFileSync(path.join(WAVEH_DIR, "data.sha256"));
  const list = readDataList(data.toString("utf8"));
  const listSha256 = createHash("sha256").update(data).digest("hex");
  const coins = loadCoins();
  if (command === "extract") {
    const manifest = await extract({
      store: settings.WAVEH_STORE,
      root: settings.ANALYZER_ROOT,
      list,
      listName: "waveh/data.sha256",
      listSha256,
      range,
      workers,
      code: fingerprint,
      wavehFrozen: freeze.sha256,
      forty: [...fortyOf(coins)],
      small: coins.list.map((c) => c.name),
      pace,
      log: (event, fields) => log.info(fields, event),
    });
    log.info(
      { partitions: manifest.partitions.length, seconds: manifest.seconds },
      "done",
    );
  } else if (command === "gates") {
    const result = await runGates(
      {
        store: wholeStore(settings.ANALYZER_ROOT),
        raw: settings.WAVEH_STORE,
        list,
        listSha256,
        look: path.join(look.data!.WAVEH_ROOT, "look"),
        sizing: loadSizing(),
        sizingSha256: sha256(readFileSync(path.join(WAVEH_DIR, "sizing.json"))),
        wavehFrozen: freeze.sha256,
        gate: gateOf(freeze),
        code: fingerprint,
        fill: WAVEH_RANGE.fill,
        coins,
        forty: [...fortyOf(coins)],
        kit: await loadResearch(),
        expect: WAVEH_EXPECTED,
        pace,
        log: (event, fields) => log.info(fields, event),
      },
      path.join(settings.ANALYZER_ROOT, GATES),
    );
    const failed = Object.entries(result.gates)
      .filter(([, g]) => !g.pass)
      .map(([name]) => name);
    if (!result.passed)
      throw new GateFailed(
        `${failed.join(", ") || "a gate not run"}: see gates\\gates.json`,
      );
    log.info({ seconds: result.seconds }, "done: every gate passed");
  } else {
    const frame = explore(trustedStore(settings.ANALYZER_ROOT), coins);
    log.info(frame, "explore: the store is trusted; no try is defined");
  }
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
