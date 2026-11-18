/**
 * The pass (the polishing plan 4.2; decisions 2026-11-17, the plan approved,
 * F3): every fill file of the range into its part, by a pool of worker
 * threads, a file at a time, each worker with a 4 GB old-generation ceiling
 * (which holds because no heap flag is given: polish.ts refuses one).
 * A file is read only when it is not sealed and its SHA-256 equals its
 * list's line. A part this code already wrote for the same input is not
 * redone, so a stopped pass resumes. WAVE-H's day rule stops it: a UTC day
 * of files with more than 1%, and at least 10, of its records failing. No
 * file starts in WAVE-H's windows; a line every 25 files says how far, and
 * memory is sampled on every file, its peaks kept.
 */
import { mkdirSync } from "node:fs";
import path from "node:path";
import { getHeapStatistics } from "node:v8";
import { Worker } from "node:worker_threads";
import { PACKAGE_ROOT } from "../waveh/gate.js";
import { isoDay } from "../waveh/instants.js";
import { formatOf, keyDate } from "../waveh/keys.js";
import { FAIL_LEAST, FAIL_SHARE } from "../waveh/pass.js";
import { StoreError } from "../waveh/store.js";
import { partFile, partOf, readPartHeader } from "./part.js";
import { scanFill } from "./scan.js";
import { readHeld } from "./held.js";
import { writeUnflushed } from "./run.js";
import { SealedError } from "./seal.js";
import { LiqWriter, Names, TakerWriter } from "./writers.js";

/** The worker's compiled file: tests through the sources start the build's worker too. */
export const WORKER_FILE = path.join(
  PACKAGE_ROOT,
  "dist",
  "polish",
  "worker.js",
);
/** Each worker's old-generation ceiling (F3). */
const WORKER_HEAP_MB = 4096;

export type FileTask = { index: number; key: string; sha256: string };
export type Task = FileTask & {
  store: string;
  parts: string;
  end: number;
  code: string;
  forty: readonly string[];
  small: readonly string[];
};

/** A thread's memory, and its heap's ceiling (`heapLimit`, V8's `heap_size_limit`). */
export type Memory = {
  rss: number;
  heapUsed: number;
  external: number;
  arrayBuffers: number;
  heapLimit: number;
};
const memoryNow = (): Memory => {
  const m = process.memoryUsage();
  return {
    rss: m.rss,
    heapUsed: m.heapUsed,
    external: m.external,
    arrayBuffers: m.arrayBuffers,
    heapLimit: getHeapStatistics().heap_size_limit,
  };
};
const higher = (a: Memory, b: Memory): Memory => ({
  rss: Math.max(a.rss, b.rss),
  heapUsed: Math.max(a.heapUsed, b.heapUsed),
  external: Math.max(a.external, b.external),
  arrayBuffers: Math.max(a.arrayBuffers, b.arrayBuffers),
  heapLimit: Math.max(a.heapLimit, b.heapLimit),
});
const NO_MEMORY: Memory = {
  rss: 0,
  heapUsed: 0,
  external: 0,
  arrayBuffers: 0,
  heapLimit: 0,
};

/** The scan's own counters, which G0 reads too: records a writer refused, records misread, the slow path's lines and records. */
export type Counters = {
  refused: number;
  misread: number;
  slowLines: number;
  slowRecords: number;
};
const countersOf = (s: Counters): Counters => ({
  refused: s.refused,
  misread: s.misread,
  slowLines: s.slowLines,
  slowRecords: s.slowRecords,
});

type Done = {
  index: number;
  key: string;
  compressed: number;
  decoded: number;
  records: number;
  failed: number;
  counters: Counters;
  /** The thread's memory with the file's part built, before it is written. */
  memory: Memory;
};

/** One input file into its part: sealed and listed first, then read, held to its hash, scanned and written whole. */
function extractFile(task: Task): Done {
  const bytes = readHeld(task.store, task.key, task.sha256);
  const forty = new Set(task.forty);
  const users = new Names();
  const taker = new TakerWriter(forty, new Set(task.small));
  const liq = new LiqWriter();
  let scan: ReturnType<typeof scanFill>;
  try {
    scan = scanFill(
      bytes,
      formatOf(task.key),
      task.end,
      forty,
      [taker, liq],
      users,
    );
  } catch (err) {
    throw new StoreError(`${task.key}: ${(err as Error).message}`);
  }
  const part = partOf({
    input: { index: task.index, key: task.key, sha256: task.sha256 },
    code: task.code,
    compressed: bytes.length,
    scan,
    taker,
    liq,
    users,
  });
  const memory = memoryNow();
  writeUnflushed(partFile(task.parts, task.index), part);
  return {
    index: task.index,
    key: task.key,
    compressed: bytes.length,
    decoded: scan.decoded,
    records: scan.records,
    failed: scan.failed,
    counters: countersOf(scan),
    memory,
  };
}

/** A worker's answer: the file done, or why not (a store or seal refusal, or a crash). */
export type Answer =
  | ({ ok: true } & Done)
  | {
      ok: false;
      index: number;
      kind: "store" | "sealed" | "crash";
      message: string;
    };

export function answerOf(task: Task): Answer {
  try {
    return { ok: true, ...extractFile(task) };
  } catch (err) {
    return {
      ok: false,
      index: task.index,
      kind:
        err instanceof StoreError
          ? "store"
          : err instanceof SealedError
            ? "sealed"
            : "crash",
      message: err instanceof Error ? (err.stack ?? err.message) : String(err),
    };
  }
}

type PassSummary = {
  files: number;
  skipped: number;
  extracted: number;
  compressed: number;
  decoded: number;
  records: number;
  failed: number;
  /** The scan's counters over every file of the range, a resumed part's from its header. */
  counters: Counters;
  seconds: number;
  peaks: { main: Memory; workers: Memory[] };
};

export async function runPass(o: {
  store: string;
  parts: string;
  files: readonly FileTask[];
  end: number;
  code: string;
  forty: readonly string[];
  small: readonly string[];
  /** 0: in this thread (the tests). */
  workers: number;
  /** Waits out the windows before a file starts. */
  pace: () => Promise<void>;
  log: (event: string, fields: object) => void;
}): Promise<PassSummary> {
  const t0 = Date.now();
  mkdirSync(o.parts, { recursive: true });
  const days = new Map<string, { records: number; failed: number }>();
  const tally = (key: string, records: number, failed: number) => {
    const day = isoDay(keyDate(key)!);
    const d = days.get(day) ?? { records: 0, failed: 0 };
    d.records += records;
    d.failed += failed;
    days.set(day, d);
    if (
      d.failed >= FAIL_LEAST &&
      d.failed / (d.records + d.failed) > FAIL_SHARE
    )
      throw new StoreError(
        `${day}: ${d.failed} of ${d.records + d.failed} records fail WAVE-H's schema`,
      );
  };
  const counters: Counters = {
    refused: 0,
    misread: 0,
    slowLines: 0,
    slowRecords: 0,
  };
  const count = (c: Counters) => {
    counters.refused += c.refused;
    counters.misread += c.misread;
    counters.slowLines += c.slowLines;
    counters.slowRecords += c.slowRecords;
  };
  const todo: FileTask[] = [];
  let skipped = 0;
  for (const f of o.files) {
    const h = readPartHeader(partFile(o.parts, f.index));
    if (
      h !== null &&
      h.header.input.key === f.key &&
      h.header.input.sha256 === f.sha256 &&
      h.header.code === o.code
    ) {
      skipped += 1;
      count(h.header.scan);
      tally(f.key, h.header.scan.records, h.header.scan.failed);
    } else todo.push(f);
  }
  o.log("pass", {
    files: o.files.length,
    skipped,
    todo: todo.length,
    workers: o.workers,
  });
  const sum = { compressed: 0, decoded: 0, records: 0, failed: 0 };
  let main = memoryNow();
  const peakOf: Memory[] = [];
  let done = 0;
  const onDone = (d: Done, worker: number) => {
    done += 1;
    sum.compressed += d.compressed;
    sum.decoded += d.decoded;
    sum.records += d.records;
    sum.failed += d.failed;
    count(d.counters);
    main = higher(main, memoryNow());
    peakOf[worker] = higher(peakOf[worker] ?? NO_MEMORY, d.memory);
    tally(d.key, d.records, d.failed);
    const s = (Date.now() - t0) / 1000;
    if (done % 25 === 0 || done === todo.length)
      o.log("files", {
        done,
        of: todo.length,
        skipped,
        seconds: Math.round(s),
        readMBs: Math.round(sum.compressed / 1e6 / s),
        decodedMBs: Math.round(sum.decoded / 1e6 / s),
      });
    if (done % 100 === 0 || done === todo.length)
      o.log("memory", { main, workers: peakOf });
  };
  const task = (f: FileTask): Task => ({
    ...f,
    store: o.store,
    parts: o.parts,
    end: o.end,
    code: o.code,
    forty: o.forty,
    small: o.small,
  });
  if (o.workers === 0) {
    for (const f of todo) {
      await o.pace();
      onDone(extractFile(task(f)), 0);
    }
  } else {
    await pool(
      Math.min(o.workers, todo.length),
      todo.map(task),
      o.pace,
      onDone,
    );
  }
  return {
    files: o.files.length,
    skipped,
    extracted: done,
    ...sum,
    counters,
    seconds: Math.round((Date.now() - t0) / 1000),
    peaks: { main, workers: peakOf },
  };
}

/** The tasks through `n` worker threads; the first refusal or crash stops the feeding, and is thrown once the busy workers end. */
async function pool(
  n: number,
  tasks: readonly Task[],
  pace: () => Promise<void>,
  onDone: (d: Done, worker: number) => void,
): Promise<void> {
  if (n === 0) return;
  let next = 0;
  /** The first refusal or crash: an object, so the closures' writes are seen. */
  const state: { stop: Error | null } = { stop: null };
  await Promise.all(
    Array.from(
      { length: n },
      (_, w) =>
        new Promise<void>((resolve) => {
          const worker = new Worker(WORKER_FILE, {
            resourceLimits: { maxOldGenerationSizeMb: WORKER_HEAP_MB },
          });
          const finish = () => {
            void worker.terminate().then(() => resolve());
          };
          const feed = async () => {
            if (state.stop !== null || next >= tasks.length) return finish();
            const t = tasks[next++]!;
            await pace();
            worker.postMessage(t);
          };
          worker.on("message", (a: Answer) => {
            if (a.ok) {
              try {
                onDone(a, w);
              } catch (err) {
                state.stop ??= err as Error;
              }
            } else
              state.stop ??=
                a.kind === "store"
                  ? new StoreError(a.message)
                  : a.kind === "sealed"
                    ? new SealedError(a.message)
                    : new Error(a.message);
            void feed();
          });
          worker.on("error", (err) => {
            state.stop ??= err;
            resolve();
          });
          void feed();
        }),
    ),
  );
  if (state.stop !== null) throw state.stop;
}
