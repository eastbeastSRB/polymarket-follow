/**
 * The engine's runner (src/copyh/engine.ts, engine-worker.ts; rules.md C15,
 * the engine's guard; the engine's plan, Q3), through real child processes
 * of the build: each part twice, copy a then copy b in new processes, the
 * two copies byte-equal and the record holding their SHA-256s; a resumed
 * phase equal to an unbroken one, a part without its run file computed
 * again; a closed phase read back, its parts held
 * to their hashes; a record or a part of other inputs refused (exit 5), a
 * difference between the copies stopping the phase (exit 7) with no record;
 * a child's refusal passed on (exit 5) and its crash (exit 1), one ending
 * before it is ready a crash too; a part whose inputs pass 64 KB resumed
 * and read back by its record; a part given as chunks written as the same
 * part given whole, and read back by its lines; each child
 * at the heap asked, exactly; a phase only in its own step's engine folder.
 */
import { execFileSync } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it, vi } from "vitest";
import {
  PhaseRecord,
  bytesAt,
  heldPart,
  partBytes,
  partLines,
  recordAt,
  runPhase,
  type Phase,
  type PartSpec,
} from "../src/copyh/engine.js";
import { loadResearch } from "../src/paper/research.js";
import {
  BuildsDiffer,
  NotFinished,
  PACKAGE_ROOT,
  StoreError,
  sha256,
} from "../src/copyh/run.js";
import { SEALED, SealedError } from "../src/copyh/seal.js";

const kit = await loadResearch();
const RUN = pathToFileURL(
  path.join(PACKAGE_ROOT, "dist", "copyh", "run.js"),
).href;
/** A made-up phase module: each function a part's bytes. */
const MODULE = path.join(
  mkdtempSync(path.join(tmpdir(), "copyh-engine-module-")),
  "phase.mjs",
);
writeFileSync(
  MODULE,
  [
    `import { getHeapStatistics } from "node:v8";`,
    `import { StoreError } from ${JSON.stringify(RUN)};`,
    `const bytes = (v) => new TextEncoder().encode(JSON.stringify(v));`,
    `export const echo = (inputs, ctx) => bytes({ inputs, kit: ctx.kit.fingerprint, engine: ctx.seal.engine ?? null, context: ctx.context });`,
    // echo's bytes as chunks: 7 bytes, an empty chunk, then 5 at a time.
    `export function* chunks(inputs, ctx) { const b = echo(inputs, ctx); yield b.subarray(0, 7); yield new Uint8Array(0); for (let at = 7; at < b.length; at += 5) yield b.subarray(at, at + 5); }`,
    // inputs.n lines of uneven length, in slices of 4,099 bytes that cut lines.
    `export function* lines(inputs) { const text = Buffer.from(Array.from({ length: inputs.n }, (_, k) => JSON.stringify({ k, pad: "x".repeat(400 + (k % 97)) }) + "\\n").join("")); for (let at = 0; at < text.length; at += 4099) yield text.subarray(at, at + 4099); }`,
    `export const pid = () => bytes(process.pid);`,
    `export const heap = () => bytes(getHeapStatistics().heap_size_limit);`,
    `export const refuse = (inputs) => { if (inputs.k === 2) throw new StoreError("a listed file differs"); return bytes(inputs); };`,
    `export const crash = (inputs) => { if (inputs.k === 1) process.exit(9); return bytes(inputs); };`,
    "",
  ].join("\n"),
);
const SEAL = { ...SEALED, engine: "look1" as const };
const parts = (n: number, extra: object = {}): PartSpec[] =>
  Array.from({ length: n }, (_, k) => ({
    id: `p${k}`,
    inputs: { k, code: "made-up", ...extra },
  }));
const never = { stop: () => null };
function phaseOf(o: Partial<Phase> & { dir?: string } = {}) {
  const events: [string, object][] = [];
  const phase: Phase = {
    name: "LABELS",
    dir:
      o.dir ??
      path.join(
        mkdtempSync(path.join(tmpdir(), "copyh-engine-")),
        "COPY-H",
        "look1",
        "engine",
        "labels",
      ),
    module: MODULE,
    fn: "echo",
    parts: parts(5),
    context: { store: "made-up" },
    workers: 2,
    heapGb: 1,
    seal: SEAL,
    budget: never,
    log: (event, fields) => events.push([event, fields]),
    ...o,
  };
  return { phase, events };
}
const runOf = (dir: string, copy: string, id: string) =>
  JSON.parse(readFileSync(path.join(dir, copy, `${id}.run.json`), "utf8")) as {
    pid: number;
    seconds: number;
    maxRssMb: number;
    heapGb: number;
  };
const payloadOf = (inputs: object) =>
  JSON.stringify({
    inputs,
    kit: kit.fingerprint,
    engine: "look1",
    context: { store: "made-up" },
  });

describe("a phase (C15, the engine's guard)", { timeout: 60_000 }, () => {
  it("computes each part twice, copy a then copy b in new processes, byte-equal, and records each part's SHA-256", async () => {
    const { phase, events } = phaseOf();
    const record = await runPhase(phase);
    expect(PhaseRecord.parse(record)).toEqual(record);
    const header = (k: number) =>
      JSON.stringify({
        phase: "LABELS",
        id: `p${k}`,
        inputs: { k, code: "made-up" },
      });
    for (let k = 0; k < 5; k++) {
      const a = readFileSync(path.join(phase.dir, "a", `p${k}.part`));
      const b = readFileSync(path.join(phase.dir, "b", `p${k}.part`));
      expect(a.equals(b)).toBe(true);
      expect(a.toString("utf8")).toBe(
        `${header(k)}\n${payloadOf({ k, code: "made-up" })}`,
      );
      expect(record.parts[k]).toEqual([`p${k}`, sha256(header(k)), sha256(a)]);
      expect(partBytes(phase.dir, record, `p${k}`).toString("utf8")).toBe(
        payloadOf({ k, code: "made-up" }),
      );
    }
    const pids = (copy: string) =>
      new Set(parts(5).map((s) => runOf(phase.dir, copy, s.id).pid));
    expect(pids("a").size).toBeLessThanOrEqual(2);
    expect([...pids("a")].some((pid) => pids("b").has(pid))).toBe(false);
    expect(pids("a").has(process.pid)).toBe(false);
    expect(runOf(phase.dir, "a", "p0").heapGb).toBe(1);
    expect(
      JSON.parse(readFileSync(path.join(phase.dir, "record.json"), "utf8")),
    ).toEqual(record);
    expect(events.filter(([e]) => e === "engine part").length).toBe(10);
  });

  it("resumes from its whole parts after the budget stops it, equal to an unbroken run", async () => {
    let calls = 0;
    const stopping = {
      stop: () => (calls++ >= 2 ? "its minutes are spent" : null),
    };
    const { phase } = phaseOf({ budget: stopping });
    await expect(runPhase(phase)).rejects.toThrow(NotFinished);
    const done = readdirSync(path.join(phase.dir, "a")).filter((f) =>
      f.endsWith(".part"),
    );
    expect(done.length).toBe(2);
    expect(existsSync(path.join(phase.dir, "b"))).toBe(false);
    const resumed = await runPhase({ ...phase, budget: never });
    const unbroken = await runPhase(phaseOf().phase);
    expect(resumed).toEqual(unbroken);
  });

  it("gives a closed phase's record without computing, and refuses a record or a part of other inputs (exit 5)", async () => {
    const { phase } = phaseOf();
    const record = await runPhase(phase);
    const again = phaseOf({ dir: phase.dir });
    expect(await runPhase(again.phase)).toEqual(record);
    // Its context (where it reads) is none of its parts' identity.
    expect(
      await runPhase({ ...again.phase, context: { store: "moved" } }),
    ).toEqual(record);
    expect(again.events.filter(([e]) => e === "engine part")).toEqual([]);
    const other = parts(5, { end: 1 });
    await expect(runPhase({ ...phase, parts: other })).rejects.toThrow(
      StoreError,
    );
    // Without its record, a part of other inputs is refused too, never overwritten, its run file gone or not.
    const { phase: fresh } = phaseOf();
    const freshRecord = await runPhase(fresh);
    const file = path.join(fresh.dir, "a", "p3.part");
    const bytes = readFileSync(file);
    const p0 = readFileSync(path.join(fresh.dir, "a", "p0.part"));
    rmSync(path.join(fresh.dir, "record.json"));
    rmSync(path.join(fresh.dir, "a", "p0.run.json"));
    await expect(runPhase({ ...fresh, parts: other })).rejects.toThrow(
      /p0\.part: a part of other inputs/,
    );
    expect(readFileSync(file).equals(bytes)).toBe(true);
    expect(readFileSync(path.join(fresh.dir, "a", "p0.part")).equals(p0)).toBe(
      true,
    );
    // A part changed after its record: refused when read.
    writeFileSync(file, Buffer.concat([bytes, Buffer.from("x")]));
    expect(() => partBytes(fresh.dir, freshRecord, "p3")).toThrow(StoreError);
  });

  it("computes a part again whose run file is missing (its parent stopped between the part and its run): byte-equal, its run back (COPYH-ENGINE-REVIEW-2 L1)", async () => {
    const { phase } = phaseOf();
    const record = await runPhase(phase);
    const part = path.join(phase.dir, "a", "p2.part");
    const bytes = readFileSync(part);
    rmSync(path.join(phase.dir, "record.json"));
    rmSync(path.join(phase.dir, "a", "p2.run.json"));
    const again = phaseOf({ dir: phase.dir });
    expect(await runPhase(again.phase)).toEqual(record);
    expect(
      again.events
        .filter(([e]) => e === "engine part")
        .map(([, f]) => [
          (f as { copy: string }).copy,
          (f as { id: string }).id,
        ]),
    ).toEqual([["a", "p2"]]);
    expect(runOf(phase.dir, "a", "p2").heapGb).toBe(1);
    expect(readFileSync(part).equals(bytes)).toBe(true);
  });

  it("stops when the two copies differ (exit 7), naming the parts, and records nothing", async () => {
    const { phase } = phaseOf({ fn: "pid", parts: parts(2) });
    await expect(runPhase(phase)).rejects.toThrow(BuildsDiffer);
    await expect(runPhase(phase)).rejects.toThrow(
      "LABELS: the two copies of 2 parts differ: p0, p1",
    );
    expect(existsSync(path.join(phase.dir, "record.json"))).toBe(false);
  });

  it("passes a child's refusal on (exit 5) and its crash (exit 1), keeping the whole parts", async () => {
    const refused = phaseOf({ fn: "refuse", workers: 1 }).phase;
    const err = await runPhase(refused).catch((e: unknown) => e);
    expect(err).toBeInstanceOf(StoreError);
    expect((err as Error).message).toBe("a listed file differs");
    expect(
      readdirSync(path.join(refused.dir, "a")).filter((f) =>
        f.endsWith(".part"),
      ),
    ).toEqual(["p0.part", "p1.part"]);
    const crashed = phaseOf({ fn: "crash", workers: 1 }).phase;
    const c = await runPhase(crashed).catch((e: unknown) => e);
    expect(c).toBeInstanceOf(Error);
    expect(c).not.toBeInstanceOf(StoreError);
    expect((c as Error).message).toMatch(
      /^the engine's child for LABELS p1 exited with code 9/,
    );
  });

  it("reads a child that ends before it is ready as a crash (exit 1), never as not finished", async () => {
    const exits = path.join(
      mkdtempSync(path.join(tmpdir(), "copyh-engine-exit-")),
      "exit.cjs",
    );
    writeFileSync(exits, "process.exit(4);\n");
    vi.stubEnv("NODE_OPTIONS", `--require ${JSON.stringify(exits)}`);
    try {
      const { phase } = phaseOf({ workers: 1 });
      const err = await runPhase(phase).catch((e: unknown) => e);
      expect(err).toBeInstanceOf(Error);
      expect(err).not.toBeInstanceOf(NotFinished);
      expect((err as Error).message).toMatch(
        /^the engine's child for no part yet exited with code 4/,
      );
    } finally {
      vi.unstubAllEnvs();
    }
  });

  it("resumes a part whose inputs pass 64 KB from its whole copies, and reads it by its record (heldPart, bytesAt)", async () => {
    const long = parts(2, { pad: "x".repeat(100_000) });
    const { phase } = phaseOf({ parts: long });
    const record = await runPhase(phase);
    rmSync(path.join(phase.dir, "record.json"));
    const again = phaseOf({ dir: phase.dir, parts: long });
    expect(await runPhase(again.phase)).toEqual(record);
    expect(again.events.filter(([e]) => e === "engine part")).toEqual([]);
    const held = heldPart(phase.dir, record, "p0");
    expect(held.sha256).toBe(record.parts[0]![2]);
    const size = readFileSync(held.file).length;
    expect(
      bytesAt(held.file, held.start, size - held.start).equals(
        partBytes(phase.dir, record, "p0"),
      ),
    ).toBe(true);
    // A part changed before a process holds it: refused.
    const p1 = path.join(phase.dir, "a", "p1.part");
    writeFileSync(p1, Buffer.concat([readFileSync(p1), Buffer.from("x")]));
    expect(() => heldPart(phase.dir, record, "p1")).toThrow(StoreError);
    // A record read back is held to the SHA-256 a later part names.
    const sha = sha256(readFileSync(path.join(phase.dir, "record.json")));
    expect(recordAt(phase.dir, sha)).toEqual(record);
    expect(() => recordAt(phase.dir, "0".repeat(64))).toThrow(StoreError);
  });

  it("writes a part given as chunks as the same part given whole: its files, its record, and a resume of one by the other (COPYH-ENGINE-REVIEW-2 H1)", async () => {
    const whole = phaseOf().phase;
    const record = await runPhase(whole);
    const chunked = phaseOf({ fn: "chunks" }).phase;
    expect(await runPhase(chunked)).toEqual(record);
    for (const copy of ["a", "b"])
      for (const s of parts(5)) {
        const file = (dir: string) => path.join(dir, copy, `${s.id}.part`);
        expect(
          readFileSync(file(chunked.dir)).equals(readFileSync(file(whole.dir))),
        ).toBe(true);
      }
    // Stopped after two parts given as chunks, then resumed by parts given whole.
    let calls = 0;
    const stopped = phaseOf({
      fn: "chunks",
      budget: { stop: () => (calls++ >= 2 ? "its minutes are spent" : null) },
    }).phase;
    await expect(runPhase(stopped)).rejects.toThrow(NotFinished);
    expect(await runPhase({ ...stopped, fn: "echo", budget: never })).toEqual(
      record,
    );
  });

  it("reads a part of many chunks back by its lines, a line cut across chunks and across partLines' reads", async () => {
    const n = 3_000;
    const { phase } = phaseOf({
      fn: "lines",
      parts: [{ id: "p0", inputs: { n } }],
    });
    const record = await runPhase(phase);
    const want = Array.from({ length: n }, (_, k) =>
      JSON.stringify({ k, pad: "x".repeat(400 + (k % 97)) }),
    );
    // The lines pass 1 MB, partLines' read: one is cut between two reads.
    expect(want.join("\n").length).toBeGreaterThan(1024 * 1024);
    const got = [...partLines(phase.dir, record, "p0")].map((b) =>
      b.toString("utf8"),
    );
    expect(got.length).toBe(n);
    expect(sha256(got.join("\n"))).toBe(sha256(want.join("\n")));
  });

  it("gives each child the heap asked, exactly: a process at that ceiling's", async () => {
    for (const heapGb of [1, 2]) {
      const { phase } = phaseOf({ fn: "heap", parts: parts(1), heapGb });
      const record = await runPhase(phase);
      const limit = Number(partBytes(phase.dir, record, "p0").toString("utf8"));
      const own = execFileSync(
        process.execPath,
        [
          `--max-old-space-size=${heapGb * 1024}`,
          "-e",
          "process.stdout.write(String(require('node:v8').getHeapStatistics().heap_size_limit))",
        ],
        { encoding: "utf8" },
      );
      expect(limit).toBe(Number(own));
    }
  });

  it("refuses a part id that is no file name, or twice", async () => {
    for (const ids of [["p0", "p0"], ["../p0"], [""]]) {
      const { phase } = phaseOf({
        parts: ids.map((id) => ({ id, inputs: {} })),
      });
      await expect(runPhase(phase)).rejects.toThrow(/is not a new name/);
      expect(existsSync(path.join(phase.dir, "a"))).toBe(false);
    }
  });

  it("runs only in its own step's engine folder", async () => {
    const root = mkdtempSync(path.join(tmpdir(), "copyh-engine-"));
    const look2 = path.join(root, "COPY-H", "look2", "engine", "labels");
    mkdirSync(look2, { recursive: true });
    await expect(runPhase(phaseOf({ dir: look2 }).phase)).rejects.toThrow(
      SealedError,
    );
    await expect(runPhase(phaseOf({ seal: SEALED }).phase)).rejects.toThrow(
      SealedError,
    );
    expect(readdirSync(look2)).toEqual([]);
  });
});
