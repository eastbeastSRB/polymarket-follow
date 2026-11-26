/**
 * The pass (copyh/rules.md C3, C15; the analyzer's pass, polish/pass.ts, as
 * the pattern): every raw fill file of a range into its part, by a pool of
 * worker threads, a file at a time, each worker with its own heap ceiling
 * (which holds because no heap flag is given: copyh.ts refuses one). A file
 * is read only past the seals (its key, its path by name and real path, the
 * run's roots) and when its SHA-256 equals its list's line. A part this code
 * wrote for the same input and lists is not redone, so a stopped pass
 * resumes; the `.tmp` files a crash left are removed first. A UTC day of
 * files with more than FAIL_SHARE, and at least FAIL_LEAST, of its records
 * failing the boundary stops it, judged once all the day's files are done. No file starts once the run's minutes are
 * spent or a closed window has begun: the files under way end, and the run
 * is not finished (exit 3). A counting pass (`mode: "count"`) reads the same
 * way with the lists it has (a `dir` or coin outside them counted, never a
 * stop) and writes each file's scan as a small JSON file instead of a part,
 * from which `dirs.json` is ruled (C15 (c) 1).
 */
import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  unlinkSync,
} from "node:fs";
import path from "node:path";
import { getHeapStatistics } from "node:v8";
import { z } from "zod";
import { Worker } from "node:worker_threads";
import { formatOf, keyDate } from "../waveh/keys.js";
import { FAIL_LEAST, FAIL_SHARE, WORKER_HEAP_GB } from "./design.js";
import type { DirKind } from "./dirs.js";
import {
  ScanJson,
  partFile,
  partOf,
  readPartHeader,
  scanJsonOf,
} from "./part.js";
import {
  NotFinished,
  PACKAGE_ROOT,
  StoreError,
  writeUnflushed,
  type Budget,
} from "./run.js";
import { scanFile, type Sink } from "./scan.js";
import {
  SEALED,
  SealedError,
  checkInside,
  checkKey,
  checkPath,
  type Seal,
} from "./seal.js";
import { Writers } from "./writers.js";

/** The worker's compiled file: tests through the sources start the build's worker too. */
export const WORKER_FILE = path.join(
  PACKAGE_ROOT,
  "dist",
  "copyh",
  "worker.js",
);

export type FileTask = { index: number; key: string; sha256: string };
/** The lists a pass reads with, as plain pairs (a worker's message), and their SHA-256s, which a part names; a counting pass may lack `dirs.json` (kinds null, its hash "none"). */
export type PassLists = {
  iids: readonly (readonly [string, number])[];
  kinds: readonly (readonly [string, DirKind])[] | null;
  hashes: { coins: string; dirs: string };
};
/** A build writes parts; a count writes each file's scan alone. */
export type PassMode = "build" | "count";
export type Task = FileTask & {
  mode: PassMode;
  store: string;
  parts: string;
  start: number;
  end: number;
  code: string;
  lists: PassLists;
  seal: Seal;
  roots: readonly string[];
};

/** A thread's memory, and its heap's ceiling. */
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

/** A counting pass's file: one input's scan, named by its input, code and lists. */
export const CountFile = z.object({
  input: z.object({ index: z.number(), key: z.string(), sha256: z.string() }),
  code: z.string(),
  lists: z.object({ coins: z.string(), dirs: z.string() }),
  compressed: z.number(),
  scan: ScanJson,
});
export type CountFile = z.infer<typeof CountFile>;
export const countFile = (dir: string, index: number) =>
  path.join(dir, `${index}.json`);

/** A count file's content when it is whole and parses; else null (a resumed count redoes it). */
export function readCountFile(file: string): CountFile | null {
  try {
    const r = CountFile.safeParse(JSON.parse(readFileSync(file, "utf8")));
    return r.success ? r.data : null;
  } catch {
    return null;
  }
}

const NOTHING: Sink = { add: () => {} };

type Done = {
  index: number;
  key: string;
  compressed: number;
  decoded: number;
  seen: number;
  failed: number;
  memory: Memory;
};

/** One file into its part: the seals first, then read, held to its hash, scanned and written whole. */
function extractFile(task: Task): Done {
  const file = path.join(task.store, ...task.key.split("/"));
  checkKey(task.key, task.seal);
  checkPath(file, task.seal);
  checkInside(file, task.roots);
  let bytes: Buffer;
  try {
    bytes = readFileSync(file);
  } catch (err) {
    throw new StoreError(
      `${task.key}: ${(err as NodeJS.ErrnoException).code ?? String(err)}`,
    );
  }
  const got = createHash("sha256").update(bytes).digest("hex");
  if (got !== task.sha256)
    throw new StoreError(
      `${task.key}: SHA-256 ${got}, the list's ${task.sha256}`,
    );
  const counting = task.mode === "count";
  const writers = counting ? null : new Writers();
  let scan: ReturnType<typeof scanFile>;
  try {
    scan = scanFile(bytes, {
      key: task.key,
      format: formatOf(task.key),
      start: task.start,
      end: task.end,
      lists: {
        iids: new Map(task.lists.iids),
        kinds: task.lists.kinds === null ? null : new Map(task.lists.kinds),
        counting,
      },
      sink: writers ?? NOTHING,
    });
  } catch (err) {
    // Every error of the scan, a frame that fails to decode and a programming error alike, is "not ready" (exit 5), its message kept.
    if (err instanceof StoreError) throw err;
    throw new StoreError(`${task.key}: ${(err as Error).message}`);
  }
  const input = { index: task.index, key: task.key, sha256: task.sha256 };
  const out =
    writers === null
      ? Buffer.from(
          `${JSON.stringify({ input, code: task.code, lists: task.lists.hashes, compressed: bytes.length, scan: scanJsonOf(scan) } satisfies CountFile)}\n`,
        )
      : partOf({
          input,
          code: task.code,
          lists: task.lists.hashes,
          compressed: bytes.length,
          scan,
          writers,
        });
  const memory = memoryNow();
  writeUnflushed(
    (counting ? countFile : partFile)(task.parts, task.index),
    out,
  );
  return {
    index: task.index,
    key: task.key,
    compressed: bytes.length,
    decoded: scan.decoded,
    seen: scan.seen,
    failed: scan.classes.failed,
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

/** Deletes the `.tmp` files under a folder: a file written whole is renamed from its `.tmp`, so one left is a crash's. Only files; no link is followed. */
export function removeLeftovers(dir: string): number {
  if (!existsSync(dir)) return 0;
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) n += removeLeftovers(p);
    else if (e.isFile() && e.name.endsWith(".tmp")) {
      unlinkSync(p);
      n += 1;
    }
  }
  return n;
}

export type PassSummary = {
  files: number;
  skipped: number;
  extracted: number;
  compressed: number;
  decoded: number;
  seen: number;
  failed: number;
  seconds: number;
  peaks: { main: Memory; workers: Memory[] };
};

export async function runPass(o: {
  store: string;
  /** The parts' folder, or a count's files'. */
  parts: string;
  /** "build" when not given. */
  mode?: PassMode;
  files: readonly FileTask[];
  start: number;
  end: number;
  code: string;
  lists: PassLists;
  /** 0: in this thread (the tests). */
  workers: number;
  /** Each worker's heap ceiling, GB (run.ts `heapOf`). */
  heapGb?: number;
  seal?: Seal;
  roots: readonly string[];
  budget: Budget;
  log: (event: string, fields: object) => void;
}): Promise<PassSummary> {
  const t0 = Date.now();
  mkdirSync(o.parts, { recursive: true });
  const removed = removeLeftovers(o.parts);
  if (removed > 0) o.log("leftovers removed", { tmp: removed });
  // The day rule reads a day's whole total: each day is judged once all its files are done.
  const dayOf = (key: string) =>
    new Date(keyDate(key)!).toISOString().slice(0, 10);
  const filesOfDay = new Map<string, number>();
  for (const f of o.files)
    filesOfDay.set(dayOf(f.key), (filesOfDay.get(dayOf(f.key)) ?? 0) + 1);
  const days = new Map<
    string,
    { seen: number; failed: number; files: number }
  >();
  const tally = (key: string, seen: number, failed: number) => {
    const day = dayOf(key);
    const d = days.get(day) ?? { seen: 0, failed: 0, files: 0 };
    d.seen += seen;
    d.failed += failed;
    d.files += 1;
    days.set(day, d);
    if (
      d.files === filesOfDay.get(day) &&
      d.failed >= FAIL_LEAST &&
      d.failed / d.seen > FAIL_SHARE
    )
      throw new StoreError(
        `${day}: ${d.failed} of ${d.seen} records fail the boundary`,
      );
  };
  const mode = o.mode ?? "build";
  /** A file's part or count file as a resumed pass finds it: its input, code, lists and scan; null when it must be redone. */
  const doneOf = (f: FileTask) =>
    mode === "count"
      ? readCountFile(countFile(o.parts, f.index))
      : (readPartHeader(partFile(o.parts, f.index))?.header ?? null);
  const todo: FileTask[] = [];
  let skipped = 0;
  for (const f of o.files) {
    const h = doneOf(f);
    if (
      h !== null &&
      h.input.key === f.key &&
      h.input.sha256 === f.sha256 &&
      h.code === o.code &&
      h.lists.coins === o.lists.hashes.coins &&
      h.lists.dirs === o.lists.hashes.dirs
    ) {
      skipped += 1;
      tally(f.key, h.scan.seen, h.scan.classes.failed);
    } else todo.push(f);
  }
  o.log("pass", {
    files: o.files.length,
    skipped,
    todo: todo.length,
    workers: o.workers,
  });
  const sum = { compressed: 0, decoded: 0, seen: 0, failed: 0 };
  let main = memoryNow();
  const peakOf: Memory[] = [];
  let done = 0;
  const onDone = (d: Done, worker: number) => {
    done += 1;
    sum.compressed += d.compressed;
    sum.decoded += d.decoded;
    sum.seen += d.seen;
    sum.failed += d.failed;
    main = higher(main, memoryNow());
    peakOf[worker] = higher(peakOf[worker] ?? NO_MEMORY, d.memory);
    tally(d.key, d.seen, d.failed);
    if (done % 25 === 0 || done === todo.length) {
      const s = (Date.now() - t0) / 1000;
      o.log("files", {
        done,
        of: todo.length,
        skipped,
        seconds: Math.round(s),
        readMBs: Math.round(sum.compressed / 1e6 / s),
        decodedMBs: Math.round(sum.decoded / 1e6 / s),
        memory: { main, workers: peakOf },
      });
    }
  };
  const task = (f: FileTask): Task => ({
    ...f,
    mode,
    store: o.store,
    parts: o.parts,
    start: o.start,
    end: o.end,
    code: o.code,
    lists: o.lists,
    seal: o.seal ?? SEALED,
    roots: o.roots,
  });
  let stopped: string | null = null;
  if (o.workers === 0) {
    for (const f of todo) {
      stopped = o.budget.stop();
      if (stopped !== null) break;
      onDone(extractFile(task(f)), 0);
    }
  } else
    stopped = await pool(
      Math.min(o.workers, todo.length),
      todo.map(task),
      o.heapGb ?? WORKER_HEAP_GB,
      o.budget,
      onDone,
    );
  const summary: PassSummary = {
    files: o.files.length,
    skipped,
    extracted: done,
    ...sum,
    seconds: Math.round((Date.now() - t0) / 1000),
    peaks: { main, workers: peakOf },
  };
  if (done < todo.length) {
    o.log("pass stopped", { ...summary, why: stopped });
    throw new NotFinished(
      `the pass stopped with ${todo.length - done} files to go: ${stopped ?? "?"}`,
    );
  }
  return summary;
}

/** The tasks through `n` worker threads, until the budget stops the feeding; the first refusal or crash stops it too and is thrown once the busy workers end. Returns why the feeding stopped, or null when every task was fed. */
async function pool(
  n: number,
  tasks: readonly Task[],
  heapGb: number,
  budget: Budget,
  onDone: (d: Done, worker: number) => void,
): Promise<string | null> {
  if (n === 0) return null;
  let next = 0;
  const state: { stop: Error | null; why: string | null } = {
    stop: null,
    why: null,
  };
  await Promise.all(
    Array.from(
      { length: n },
      (_, w) =>
        new Promise<void>((resolve) => {
          const worker = new Worker(WORKER_FILE, {
            resourceLimits: { maxOldGenerationSizeMb: heapGb * 1024 },
          });
          const finish = () => {
            void worker.terminate().then(() => resolve());
          };
          const feed = () => {
            if (state.stop !== null || next >= tasks.length) return finish();
            state.why ??= budget.stop();
            if (state.why !== null) return finish();
            worker.postMessage(tasks[next++]!);
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
            feed();
          });
          worker.on("error", (err) => {
            state.stop ??= err;
            resolve();
          });
          feed();
        }),
    ),
  );
  if (state.stop !== null) throw state.stop;
  return state.why;
}
