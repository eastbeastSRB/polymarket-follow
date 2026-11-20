/**
 * The polishing's program, run by `dist/polish.js` in a worker thread of a
 * 20 GB heap (polish.ts, the launcher; decisions 2026-11-18, EXTRACT-REVIEW's
 * findings, L5). `extract`: WAVE-H's ten months into the analyzer's store
 * (extract.ts), every file held to the frozen `waveh/data.sha256`; `--day`
 * one day of them, for a timing run. `gates`: the store's gates G0–G6
 * (gates.ts) into `<ANALYZER_ROOT>\gates\gates.json`. `explore`: its frame
 * (explore.ts), the store opened only when its gates passed; `explore --step
 * <name>` one of the exploration's steps (tries/steps.ts) into
 * `<ANALYZER_ROOT>\explore\`. `exam --step <name>` one of the exam's steps
 * (exam/steps.ts, polish/rules.md P15) into `<EXAM_ROOT>`, under the seal
 * the exam's freeze gives (exam/gate.ts; closed while no freeze exists).
 * Settings, no defaults: WAVEH_STORE (WAVE-H's raw store, read only),
 * ANALYZER_ROOT (the analyzer's folder of the range), for `gates` and a
 * step WAVEH_ROOT (WAVE-H's rehearsal and look, read only), and for the
 * exam ANALYZER_ROOT (the ten months', read only) and EXAM_ROOT, with
 * FRESH_STORE (FRESH's raw store, read only) for the look's steps. Exit
 * codes: 0 done, 1 a crash, 2 bad settings, 4 WAVE-H's freeze, or for the
 * look's steps the exam's, does not verify, 5 not ready (books needed
 * among them), 6 a gate or a step's check failed. Every line goes to the
 * log, `<ANALYZER_ROOT>\logs\polish-<day>.log` (the exam's in EXAM_ROOT);
 * stderr says only why the program stopped before its log was open.
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { getHeapStatistics } from "node:v8";
import { createLog } from "../log.js";
import { loadResearch } from "../paper/research.js";
import { EXAM_DESIGN } from "./exam/design.js";
import { FRESH_LIST_FILE, FRESH_UNPAIRED_FILE } from "./exam/fresh.js";
import { sealOf, verifyExamFreeze } from "./exam/gate.js";
import { EXAM_STEPS, runExamStep, type ExamStep } from "./exam/steps.js";
import { explore, trustedStore, wholeStore } from "./explore.js";
import { extract } from "./extract.js";
import {
  KNOWN_UNPAIRED_FILE,
  KnownUnpaired,
  WAVEH_EXPECTED,
  runGates,
} from "./gates.js";
import { GATES } from "./library.js";
import { FRESH_RANGE, WAVEH_RANGE, dayOf } from "./range.js";
import {
  ExamSettings,
  ExtractSettings,
  FreshSettings,
  GateFailed,
  LookSettings,
  ReproSettings,
  exitOf,
  fingerprintOf,
} from "./run.js";
import { SEALED, checkPath } from "./seal.js";
import {
  CUTS_FILE,
  LOOK_EXPECTED,
  STEPS,
  runStep,
  type StepName,
} from "./tries/steps.js";
import { fortyOf } from "./writers.js";
import { WAVEH_DIR, loadCoins } from "../waveh/coins.js";
import { PACKAGE_ROOT, gateOf, sha256, verifyFreeze } from "../waveh/gate.js";
import { loadSizing } from "../waveh/look.js";
import { FrozenDiffer, sharedHashes, windowEnd } from "../waveh/run.js";
import { StoreError, readDataList } from "../waveh/store.js";

function refuse(why: string): never {
  process.stderr.write(`polish: refused: ${why}\n`);
  process.exit(2);
}
const issues = (e: { issues: { path: PropertyKey[]; message: string }[] }) =>
  e.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");

const [command, ...options] = process.argv.slice(2);
if (
  command !== "extract" &&
  command !== "gates" &&
  command !== "explore" &&
  command !== "exam"
)
  refuse(`the command "${command ?? ""}": extract, gates, explore or exam`);
let workers = 6;
let day: string | null = null;
let step: StepName | null = null;
let examStep: ExamStep | null = null;
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
  else if (
    command === "explore" &&
    flag === "--step" &&
    step === null &&
    STEPS.some((s) => s === value)
  )
    step = value as StepName;
  else if (
    command === "exam" &&
    flag === "--step" &&
    examStep === null &&
    EXAM_STEPS.some((s) => s === value)
  )
    examStep = value as ExamStep;
  else refuse(`the option "${flag ?? ""} ${value ?? ""}"`);
}
if (command === "exam" && examStep === null)
  refuse(`exam needs --step ${EXAM_STEPS.join(" | ")}`);
const exam = command === "exam" ? ExamSettings.safeParse(process.env) : null;
if (exam !== null && !exam.success) refuse(issues(exam.error));
const repro =
  examStep === "reproduce" ? ReproSettings.safeParse(process.env) : null;
if (repro !== null && !repro.success) refuse(issues(repro.error));
const fresh =
  examStep === "1" || examStep === "2"
    ? FreshSettings.safeParse(process.env)
    : null;
if (fresh !== null && !fresh.success) refuse(issues(fresh.error));
const parsed =
  command === "exam" ? null : ExtractSettings.safeParse(process.env);
if (parsed !== null && !parsed.success) refuse(issues(parsed.error));
const settings = parsed?.data;
const look = LookSettings.safeParse(process.env);
if ((command === "gates" || step !== null) && !look.success)
  refuse(issues(look.error));
let range = WAVEH_RANGE;
if (day !== null) {
  try {
    range = dayOf(WAVEH_RANGE, day);
  } catch (err) {
    refuse((err as Error).message);
  }
}
/** The folders the command reads or writes, its log's first. */
const folders =
  exam !== null
    ? [
        exam.data.EXAM_ROOT,
        exam.data.ANALYZER_ROOT,
        ...(repro === null
          ? []
          : [repro.data.WAVEH_STORE, repro.data.WAVEH_ROOT]),
        ...(fresh === null ? [] : [fresh.data.FRESH_STORE]),
      ]
    : [
        settings!.ANALYZER_ROOT,
        settings!.WAVEH_STORE,
        ...(command === "gates" || step !== null
          ? [look.data!.WAVEH_ROOT]
          : []),
      ];
// The exam's steps run under the seal its freeze gives; every other command under the closed seal. The look's steps need the freeze.
const examFreeze = command === "exam" ? verifyExamFreeze(PACKAGE_ROOT) : null;
if (fresh !== null && examFreeze !== null && !examFreeze.ok) {
  process.stderr.write(
    `polish: the exam's freeze does not verify: ${examFreeze.problems.slice(0, 10).join("; ")}\n`,
  );
  process.exit(4);
}
const seal = examFreeze === null ? SEALED : sealOf(examFreeze);

// The seal before anything is opened or made, the log's folder included.
try {
  for (const f of folders) checkPath(f, seal);
} catch (err) {
  process.stderr.write(`polish: not ready: ${(err as Error).message}\n`);
  process.exit(5);
}

os.setPriority(os.constants.priority.PRIORITY_LOW);
const { log, close } = createLog(folders[0]!, "polish");
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
      ...(command === "exam" && {
        examStep,
        examSealOpen: seal.examFrozen,
        shared: sharedHashes(PACKAGE_ROOT),
      }),
    },
    `start ${command}`,
  );
  const data = readFileSync(path.join(WAVEH_DIR, "data.sha256"));
  const list = readDataList(data.toString("utf8"));
  const listSha256 = createHash("sha256").update(data).digest("hex");
  const coins = loadCoins();
  if (examStep !== null) {
    // The look's list: FRESH's files by SHA-256 (tools/polish-freeze.cjs --data), and the one-sided trades ruled.
    const lookList = () => {
      if (!existsSync(FRESH_LIST_FILE))
        throw new StoreError("no polish/fresh.sha256");
      const bytes = readFileSync(FRESH_LIST_FILE);
      return {
        list: readDataList(bytes.toString("utf8")),
        listSha256: sha256(bytes),
        known: KnownUnpaired.parse(
          JSON.parse(readFileSync(FRESH_UNPAIRED_FILE, "utf8")),
        ),
      };
    };
    const r = await runExamStep(
      examStep,
      {
        analyzer: exam!.data.ANALYZER_ROOT,
        root: exam!.data.EXAM_ROOT,
        coins,
        kit: await loadResearch(),
        code: fingerprint,
        wavehFrozen: freeze.sha256,
        cutsFile: CUTS_FILE,
        design: EXAM_DESIGN,
        log: (event, fields) => log.info(fields, event),
      },
      {
        repro:
          repro === null
            ? null
            : {
                raw: repro.data.WAVEH_STORE,
                list,
                listSha256,
                wavehRoot: repro.data.WAVEH_ROOT,
                gate: gateOf(freeze),
                workers,
                pace,
              },
        look:
          fresh === null || examFreeze === null || !examFreeze.ok
            ? null
            : {
                fresh: fresh.data.FRESH_STORE,
                ...lookList(),
                range: FRESH_RANGE,
                seal,
                freeze: { sha256: examFreeze.sha256, tag: examFreeze.tag },
                gate: gateOf(freeze),
                workers,
                pace,
              },
      },
    );
    log.info(
      { examStep, sha256: r.sha },
      `done: the exam's ${examStep} step written`,
    );
  } else if (command === "extract") {
    const manifest = await extract({
      store: settings!.WAVEH_STORE,
      root: settings!.ANALYZER_ROOT,
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
        store: wholeStore(settings!.ANALYZER_ROOT),
        raw: settings!.WAVEH_STORE,
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
        knownUnpairedFile: KNOWN_UNPAIRED_FILE,
        pace,
        log: (event, fields) => log.info(fields, event),
      },
      path.join(settings!.ANALYZER_ROOT, GATES),
    );
    const failed = Object.entries(result.gates)
      .filter(([, g]) => !g.pass)
      .map(([name]) => name);
    if (!result.passed)
      throw new GateFailed(
        `${failed.join(", ") || "a gate not run"}: see gates\\gates.json`,
      );
    log.info({ seconds: result.seconds }, "done: every gate passed");
  } else if (step !== null) {
    const r = await runStep(step, {
      root: settings!.ANALYZER_ROOT,
      look: path.join(look.data!.WAVEH_ROOT, "look"),
      raw: settings!.WAVEH_STORE,
      gate: gateOf(freeze),
      coins,
      kit: await loadResearch(),
      code: fingerprint,
      cutsFile: CUTS_FILE,
      expect: LOOK_EXPECTED,
      pace,
      log: (event, fields) => log.info(fields, event),
    });
    log.info({ step, sha256: r.sha }, `done: the ${step} step written`);
  } else {
    const frame = explore(trustedStore(settings!.ANALYZER_ROOT), coins);
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
