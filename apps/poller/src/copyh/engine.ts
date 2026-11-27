/**
 * The engine's runner (copyh/rules.md C15, "The engine's guard"; the
 * engine's plan, section 10 and Q3): a phase is a list of parts fixed by its
 * inputs, each part computed twice, copy a and copy b, in separate OS
 * processes, written whole, and the phase closed by a record of each part's
 * SHA-256 only when its two copies are byte-equal; else exit 7 with the
 * parts named, both copies left for a decisions entry to move aside.
 * - A part's file is its header line, the JSON of its phase, id and inputs
 *   (everything its bytes are a function of: the code's fingerprint, the
 *   stores' and lists' hashes, earlier records, END, the window, the
 *   settlement mark), then the bytes the phase's function gives, whole or
 *   as chunks; it is written through one file descriptor, flushed, then
 *   renamed, so that a part in place is whole on disk. A part or a record
 *   found with another header is refused (exit 5: moved aside by hand),
 *   never reused or overwritten. No heap and no time is in a part: no
 *   output depends on them (C15).
 * - The children: a pool of `workers` long-lived processes
 *   (`child_process.fork` of engine-worker.js at the heap given, the
 *   program's idle priority inherited) computes the phase's missing a
 *   copies; then a new pool its missing b copies, so that a part's two
 *   copies never share a process. A large lane's phase runs with one child
 *   at the heap cap, alone on the machine (the supervisor's two-lane
 *   ruling, 2026-11-26). The pools feed no part once the run's budget stops
 *   them; the parts in flight end; then exit 3, and the next run resumes
 *   from the whole parts. Children never log: the parent logs counts,
 *   seconds and peaks, and keeps each copy's run beside it.
 * - Later phases read copy a, held to the record's SHA-256.
 */
import { fork } from "node:child_process";
import {
  closeSync,
  existsSync,
  fsyncSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  renameSync,
  rmSync,
  writeSync,
} from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import type { Research } from "../paper/research.js";
import {
  BuildsDiffer,
  NotFinished,
  PACKAGE_ROOT,
  RENAME_PAUSE_MS,
  RENAME_TRIES,
  StoreError,
  sha256,
  writeWhole,
  type Budget,
} from "./run.js";
import { SealedError, checkWrite, type Seal } from "./seal.js";

/** The child's compiled file: tests through the sources start the build's child too. */
export const ENGINE_WORKER_FILE = path.join(
  PACKAGE_ROOT,
  "dist",
  "copyh",
  "engine-worker.js",
);

/** A part of a phase: its id (a file's name) and its inputs, all its bytes are a function of. */
export type PartSpec = { readonly id: string; readonly inputs: unknown };

/** A part's bytes: whole, or as chunks in their order (a PRICES part, a coin's positions, can pass 2 GiB, which no one buffer or write takes). */
export type PartBytes = Uint8Array | Iterable<Uint8Array>;

/** A phase's function, in a compiled module: a part's bytes from its inputs; `context` is where it reads them (folders, roots), the same for every part of the phase and none of its identity. */
export type PartFunction = (
  inputs: unknown,
  ctx: {
    readonly kit: Research;
    readonly seal: Seal;
    readonly context: unknown;
  },
) => PartBytes | Promise<PartBytes>;

/** One part asked of a child. */
export type Job = {
  readonly module: string;
  readonly fn: string;
  readonly phase: string;
  readonly id: string;
  readonly inputs: unknown;
  readonly context: unknown;
  readonly header: string;
  readonly file: string;
  readonly seal: Seal;
};

/** A child's answer for a part: its run, or why it failed. */
export type Reply =
  | {
      readonly ok: true;
      readonly id: string;
      readonly seconds: number;
      readonly maxRssKb: number;
      readonly pid: number;
    }
  | {
      readonly ok: false;
      readonly id: string;
      readonly kind: "store" | "sealed" | "error";
      readonly message: string;
    };

/** The bytes of one write at most: Node refuses a write of 2^31 bytes or more (Node 24.13, measured 2026-11-27: COPYH-ENGINE-REVIEW-2 H1). */
const WRITE_MAX = 2 ** 30;

/**
 * A part written whole: its header line and then its bytes, a chunk at a
 * time, to `<file>.tmp` through one file descriptor, flushed, then renamed
 * over the file, a refused rename tried again as run.ts's writers try it
 * (its loop copied: run.ts is a store-closure file). So a part in place is
 * whole on disk, and a crash leaves at most a temp, which the next run
 * removes (COPYH-ENGINE-REVIEW-2 M3).
 */
function writePart(file: string, header: string, bytes: PartBytes): void {
  const fd = openSync(`${file}.tmp`, "w");
  try {
    const put = (b: Uint8Array) => {
      for (let at = 0; at < b.length;)
        at += writeSync(fd, b, at, Math.min(b.length - at, WRITE_MAX));
    };
    put(Buffer.from(`${header}\n`, "utf8"));
    for (const chunk of bytes instanceof Uint8Array ? [bytes] : bytes)
      put(chunk);
    fsyncSync(fd);
  } finally {
    closeSync(fd);
  }
  for (let i = 1; ; i++) {
    try {
      renameSync(`${file}.tmp`, file);
      return;
    } catch (err) {
      if (i >= RENAME_TRIES) throw err;
      Atomics.wait(
        new Int32Array(new SharedArrayBuffer(4)),
        0,
        0,
        RENAME_PAUSE_MS,
      );
    }
  }
}

/** In the child: one part computed by its phase's function and written whole, its header line first. */
export async function runJob(job: Job, kit: Promise<Research>): Promise<Reply> {
  const t0 = performance.now();
  try {
    checkWrite(path.dirname(job.file), job.seal);
    const mod = (await import(pathToFileURL(job.module).href)) as Record<
      string,
      unknown
    >;
    const fn = mod[job.fn];
    if (typeof fn !== "function")
      throw new Error(`${job.module} exports no function ${job.fn}`);
    const bytes = await (fn as PartFunction)(job.inputs, {
      kit: await kit,
      seal: job.seal,
      context: job.context,
    });
    writePart(job.file, job.header, bytes);
    return {
      ok: true,
      id: job.id,
      seconds: (performance.now() - t0) / 1000,
      maxRssKb: process.resourceUsage().maxRSS,
      pid: process.pid,
    };
  } catch (err) {
    return {
      ok: false,
      id: job.id,
      kind:
        err instanceof StoreError
          ? "store"
          : err instanceof SealedError
            ? "sealed"
            : "error",
      message: err instanceof Error ? err.message : String(err),
    };
  }
}

/** A phase as the runner takes it. */
export type Phase = {
  readonly name: string;
  /** Its folder, in its step's engine folder: `a\`, `b\` and `record.json`. */
  readonly dir: string;
  /** The compiled module and its function that compute a part. */
  readonly module: string;
  readonly fn: string;
  readonly parts: readonly PartSpec[];
  /** Where the parts read their inputs: no part's identity (a store moved keeps its parts). */
  readonly context: unknown;
  readonly workers: number;
  /** Each child's old-generation ceiling, GB. */
  readonly heapGb: number;
  readonly seal: Seal;
  readonly budget: Budget;
  readonly log: (event: string, fields: object) => void;
};

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
/** A closed phase: each part's id, its header's SHA-256 and its bytes'. */
export const PhaseRecord = z.object({
  phase: z.string(),
  parts: z.array(z.tuple([z.string(), SHA256, SHA256])),
});
export type PhaseRecord = z.infer<typeof PhaseRecord>;

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;
const headerOf = (phase: string, part: PartSpec) =>
  JSON.stringify({ phase, id: part.id, inputs: part.inputs });
const partFile = (dir: string, copy: string, id: string) =>
  path.join(dir, copy, `${id}.part`);

/** A file's SHA-256, read 16 MB at a time. */
export function fileSha256(file: string): string {
  const h = createHash("sha256");
  const buf = Buffer.alloc(16 * 1024 * 1024);
  const fd = openSync(file, "r");
  try {
    for (let n; (n = readSync(fd, buf, 0, buf.length, null)) > 0;)
      h.update(buf.subarray(0, n));
  } finally {
    closeSync(fd);
  }
  return h.digest("hex");
}

/** A part file's header line, its first, read 64 KB at a time to its newline (a part's inputs can be longer: LABELS-L's deferred pairs). */
function headerLine(file: string): string {
  const chunks: Buffer[] = [];
  const buf = Buffer.alloc(65_536);
  const fd = openSync(file, "r");
  try {
    for (let pos = 0; ;) {
      const n = readSync(fd, buf, 0, buf.length, pos);
      const end = buf.subarray(0, n).indexOf(10);
      chunks.push(Buffer.from(buf.subarray(0, end < 0 ? n : end)));
      if (end >= 0 || n === 0) break;
      pos += n;
    }
  } finally {
    closeSync(fd);
  }
  return Buffer.concat(chunks).toString("utf8");
}

/** The jobs through `workers` new children at `heapGb`, until the budget stops the feeding; a child's refusal or crash stops it too and is thrown once the busy children end. Returns why the feeding stopped, or null when every job was fed. */
async function pool(
  jobs: readonly Job[],
  o: {
    workers: number;
    heapGb: number;
    budget: Budget;
    onDone: (job: Job, reply: Reply & { ok: true }) => void;
  },
): Promise<string | null> {
  let next = 0;
  const state: { stop: Error | null; why: string | null } = {
    stop: null,
    why: null,
  };
  await Promise.all(
    Array.from(
      { length: Math.min(o.workers, jobs.length) },
      () =>
        new Promise<void>((resolve) => {
          const child = fork(ENGINE_WORKER_FILE, [], {
            execArgv: [`--max-old-space-size=${o.heapGb * 1024}`],
            stdio: ["ignore", "ignore", "pipe", "ipc"],
          });
          let stderr = "";
          child.stderr!.on("data", (d: Buffer) => {
            stderr = (stderr + d.toString("utf8")).slice(-4_000);
          });
          let current: Job | null = null;
          let finished = false;
          const finish = () => {
            current = null;
            finished = true;
            if (child.connected) child.disconnect();
          };
          const feed = () => {
            if (state.stop !== null || next >= jobs.length) return finish();
            state.why ??= o.budget.stop();
            if (state.why !== null) return finish();
            current = jobs[next++]!;
            child.send(current);
          };
          child.on("message", (m: Reply | { ready: true }) => {
            if ("ready" in m) return feed();
            const job = current!;
            current = null;
            if (m.ok)
              try {
                o.onDone(job, m);
              } catch (err) {
                state.stop ??= err as Error;
              }
            else
              state.stop ??=
                m.kind === "store"
                  ? new StoreError(m.message)
                  : m.kind === "sealed"
                    ? new SealedError(m.message)
                    : new Error(`${job.phase} ${job.id}: ${m.message}`);
            feed();
          });
          child.on("error", (err) => {
            state.stop ??= err;
            resolve();
          });
          // A child that ends before it was let go crashed: in a part, or before it was ready.
          child.on("exit", (code) => {
            if (!finished)
              state.stop ??= new Error(
                `the engine's child for ${current === null ? "no part yet" : `${current.phase} ${current.id}`} exited with code ${code}: ${stderr.trim()}`,
              );
            resolve();
          });
        }),
    ),
  );
  if (state.stop !== null) throw state.stop;
  return state.why;
}

/** Runs a phase to its record, or resumes it: each missing a copy, then each missing b copy, then the compare. A closed phase gives its record at once. */
export async function runPhase(p: Phase): Promise<PhaseRecord> {
  checkWrite(p.dir, p.seal);
  const ids = new Set<string>();
  for (const s of p.parts) {
    if (!ID.test(s.id) || ids.has(s.id))
      throw new Error(`${p.name}: a part id "${s.id}" is not a new name`);
    ids.add(s.id);
  }
  const headers = p.parts.map((s) => headerOf(p.name, s));
  const recordFile = path.join(p.dir, "record.json");
  if (existsSync(recordFile)) {
    const r = PhaseRecord.parse(JSON.parse(readFileSync(recordFile, "utf8")));
    const same =
      r.phase === p.name &&
      r.parts.length === p.parts.length &&
      r.parts.every(
        ([id, h], i) => id === p.parts[i]!.id && h === sha256(headers[i]!),
      );
    if (!same)
      throw new StoreError(
        `${recordFile}: a record of other inputs, to be moved aside by hand`,
      );
    p.log("engine phase closed", { phase: p.name, parts: p.parts.length });
    return r;
  }
  const t0 = Date.now();
  for (const copy of ["a", "b"] as const) {
    const dir = path.join(p.dir, copy);
    mkdirSync(dir, { recursive: true });
    for (const f of readdirSync(dir))
      if (f.endsWith(".tmp")) rmSync(path.join(dir, f));
    const todo: Job[] = [];
    p.parts.forEach((s, i) => {
      const file = partFile(p.dir, copy, s.id);
      if (!existsSync(file)) {
        todo.push({
          module: p.module,
          fn: p.fn,
          phase: p.name,
          id: s.id,
          inputs: s.inputs,
          context: p.context,
          header: headers[i]!,
          file,
          seal: p.seal,
        });
        return;
      }
      if (headerLine(file) !== headers[i])
        throw new StoreError(
          `${file}: a part of other inputs, to be moved aside by hand`,
        );
    });
    p.log("engine phase", {
      phase: p.name,
      copy,
      parts: p.parts.length,
      todo: todo.length,
      workers: p.workers,
      heapGb: p.heapGb,
    });
    let done = 0;
    const why = await pool(todo, {
      workers: p.workers,
      heapGb: p.heapGb,
      budget: p.budget,
      onDone: (job, r) => {
        done += 1;
        const run = {
          pid: r.pid,
          seconds: r.seconds,
          maxRssMb: Math.round(r.maxRssKb / 1024),
          heapGb: p.heapGb,
        };
        writeWhole(
          path.join(dir, `${job.id}.run.json`),
          `${JSON.stringify(run)}\n`,
        );
        p.log("engine part", { phase: p.name, copy, id: job.id, ...run });
      },
    });
    if (done < todo.length)
      throw new NotFinished(
        `${p.name}: ${todo.length - done} parts of copy ${copy} to go: ${why ?? "?"}`,
      );
  }
  const parts = p.parts.map((s, i): [string, string, string] => [
    s.id,
    sha256(headers[i]!),
    fileSha256(partFile(p.dir, "a", s.id)),
  ]);
  const differ = parts
    .filter(([id, , a]) => fileSha256(partFile(p.dir, "b", id)) !== a)
    .map(([id]) => id);
  if (differ.length > 0)
    throw new BuildsDiffer(
      `${p.name}: the two copies of ${differ.length} parts differ: ${differ.join(", ")}`,
    );
  const record: PhaseRecord = { phase: p.name, parts };
  writeWhole(recordFile, `${JSON.stringify(record)}\n`);
  p.log("engine phase done", {
    phase: p.name,
    parts: parts.length,
    seconds: Math.round((Date.now() - t0) / 1000),
  });
  return record;
}

/** A closed phase's record read from its folder, held to the SHA-256 a later part names. */
export function recordAt(dir: string, want: string): PhaseRecord {
  const bytes = readFileSync(path.join(dir, "record.json"));
  if (sha256(bytes) !== want)
    throw new StoreError(`${dir}: its record is not the one its part names`);
  return PhaseRecord.parse(JSON.parse(bytes.toString("utf8")));
}

/** The parts a process has held to their records: a phase reading many parts a slice at a time hashes each file once. */
const held = new Map<string, { sha256: string; start: number }>();

/** A closed phase's part, held once a process to its record's SHA-256: its file, that SHA-256 and where its bytes start, after the header line. */
export function heldPart(
  dir: string,
  record: PhaseRecord,
  id: string,
): { file: string; sha256: string; start: number } {
  const entry = record.parts.find(([p]) => p === id);
  if (entry === undefined) throw new Error(`${record.phase} has no part ${id}`);
  const file = partFile(dir, "a", id);
  const h = held.get(file);
  if (h?.sha256 === entry[2]) return { file, sha256: entry[2], start: h.start };
  if (fileSha256(file) !== entry[2])
    throw new StoreError(`${file}: not the part its phase's record holds`);
  const start = Buffer.byteLength(headerLine(file)) + 1;
  held.set(file, { sha256: entry[2], start });
  return { file, sha256: entry[2], start };
}

/** `length` bytes of a file from `offset`. */
export function bytesAt(file: string, offset: number, length: number): Buffer {
  const buf = Buffer.alloc(length);
  const fd = openSync(file, "r");
  try {
    for (let at = 0; at < length;) {
      const n = readSync(fd, buf, at, length - at, offset + at);
      if (n === 0) throw new StoreError(`${file}: shorter than its index says`);
      at += n;
    }
  } finally {
    closeSync(fd);
  }
  return buf;
}

/** The bytes a part's lines are read in. */
const LINES_CHUNK = 1024 * 1024;

/**
 * A closed phase's part's lines, copy a's after its header line, held to
 * the record's SHA-256 (`heldPart`), each without its newline: read a chunk
 * at a time, the file opened for each chunk, so that many parts can be read
 * side by side (RESULT's merge of PRICES' coins) and none is held open
 * between reads. A part whose last line has no newline is refused.
 */
export function* partLines(
  dir: string,
  record: PhaseRecord,
  id: string,
): Generator<Buffer> {
  const { file, start } = heldPart(dir, record, id);
  const buf = Buffer.alloc(LINES_CHUNK);
  let carry: Buffer | null = null;
  for (let pos = start; ;) {
    const fd = openSync(file, "r");
    let n: number;
    try {
      n = readSync(fd, buf, 0, buf.length, pos);
    } finally {
      closeSync(fd);
    }
    if (n === 0) break;
    pos += n;
    const chunk = buf.subarray(0, n);
    let at = 0;
    for (let nl = chunk.indexOf(10); nl !== -1; nl = chunk.indexOf(10, at)) {
      const piece = chunk.subarray(at, nl);
      yield carry === null ? Buffer.from(piece) : Buffer.concat([carry, piece]);
      carry = null;
      at = nl + 1;
    }
    if (at < n)
      carry =
        carry === null
          ? Buffer.from(chunk.subarray(at))
          : Buffer.concat([carry, chunk.subarray(at)]);
  }
  if (carry !== null)
    throw new StoreError(`${file}: a line without its newline`);
}

/** A part of a closed phase: copy a's bytes after its header line, held to the record's SHA-256. */
export function partBytes(
  dir: string,
  record: PhaseRecord,
  id: string,
): Buffer {
  const entry = record.parts.find(([p]) => p === id);
  if (entry === undefined) throw new Error(`${record.phase} has no part ${id}`);
  const file = partFile(dir, "a", id);
  const bytes = readFileSync(file);
  if (sha256(bytes) !== entry[2])
    throw new StoreError(`${file}: not the part its phase's record holds`);
  return bytes.subarray(bytes.indexOf(10) + 1);
}
