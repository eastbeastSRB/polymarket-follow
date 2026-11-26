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
 *   settlement mark), then the bytes the phase's function gives. A part or
 *   a record found with another header is refused (exit 5: moved aside by
 *   hand), never reused or overwritten. No heap and no time is in a part:
 *   no output depends on them (C15).
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
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  rmSync,
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
  StoreError,
  sha256,
  writeUnflushed,
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

/** A phase's function, in a compiled module: a part's bytes from its inputs; `context` is where it reads them (folders, roots), the same for every part of the phase and none of its identity. */
export type PartFunction = (
  inputs: unknown,
  ctx: {
    readonly kit: Research;
    readonly seal: Seal;
    readonly context: unknown;
  },
) => Uint8Array | Promise<Uint8Array>;

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
    writeUnflushed(
      job.file,
      Buffer.concat([Buffer.from(`${job.header}\n`), bytes]),
    );
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
function fileSha256(file: string): string {
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

/** A part file's header line (its first, up to 64 KB of it read). */
function headerLine(file: string): string {
  const buf = Buffer.alloc(65_536);
  const fd = openSync(file, "r");
  try {
    const n = readSync(fd, buf, 0, buf.length, 0);
    const end = buf.subarray(0, n).indexOf(10);
    return buf.toString("utf8", 0, end < 0 ? n : end);
  } finally {
    closeSync(fd);
  }
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
          const finish = () => {
            current = null;
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
          child.on("exit", (code) => {
            if (current !== null)
              state.stop ??= new Error(
                `the engine's child for ${current.phase} ${current.id} exited with code ${code}: ${stderr.trim()}`,
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
