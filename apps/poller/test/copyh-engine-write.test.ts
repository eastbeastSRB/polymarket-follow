/**
 * A part's write (src/copyh/engine.ts `runJob`; COPYH-ENGINE-REVIEW-2 H1 and
 * M3), in this process: a made-up chunk stands for gigabytes (its length
 * passes its bytes), and node:fs's writeSync, stubbed, counts its writes
 * without making them and refuses one of 2^31 bytes or more, as Node does.
 * A part above 2 GiB, whole or as chunks, is written a gigabyte a write at
 * most, through one file descriptor, flushed before its rename.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { runJob } from "../src/copyh/engine.js";
import { SEALED } from "../src/copyh/seal.js";
import { loadResearch } from "../src/paper/research.js";

/** The calls of node:fs's writers while `on`. */
const fs = vi.hoisted(() => ({ on: false, calls: [] as unknown[][] }));
vi.mock("node:fs", async (importOriginal) => {
  const real = await importOriginal<typeof import("node:fs")>();
  const writeSync = (fd: number, b: unknown, ...rest: unknown[]): number => {
    const [offset, length] = rest;
    if (fs.on) fs.calls.push(["write", fd, offset, length]);
    if (b instanceof Uint8Array && b.length !== b.byteLength) {
      if (typeof length !== "number" || length >= 2 ** 31)
        throw new RangeError(
          `The value of "length" is out of range: ${String(length)}`,
        );
      return length;
    }
    return (real.writeSync as (...a: unknown[]) => number)(fd, b, ...rest);
  };
  const openSync = (...a: Parameters<typeof real.openSync>) => {
    const fd = real.openSync(...a);
    if (fs.on) fs.calls.push(["open", a[0], a[1], fd]);
    return fd;
  };
  const fsyncSync = (fd: number) => {
    if (fs.on) fs.calls.push(["fsync", fd]);
    real.fsyncSync(fd);
  };
  const closeSync = (fd: number) => {
    if (fs.on) fs.calls.push(["close", fd]);
    real.closeSync(fd);
  };
  const renameSync = (...a: Parameters<typeof real.renameSync>) => {
    if (fs.on) fs.calls.push(["rename", a[0], a[1]]);
    real.renameSync(...a);
  };
  const stubs = { writeSync, openSync, fsyncSync, closeSync, renameSync };
  return { ...real, ...stubs, default: { ...real, ...stubs } };
});

const kit = loadResearch();
const GB = 2 ** 30;
const HEADER = JSON.stringify({ phase: "PRICES", id: "c000", inputs: {} });
/** A made-up phase module: a part of 3 GB and 5 bytes, whole or as chunks between two real lines; its big chunk's length passes its bytes (none). */
const MODULE = path.join(
  mkdtempSync(path.join(tmpdir(), "copyh-write-module-")),
  "phase.mjs",
);
writeFileSync(
  MODULE,
  [
    `const huge = () => Object.defineProperty(new Uint8Array(0), "length", { value: 3 * 2 ** 30 + 5 });`,
    `const line = (s) => new TextEncoder().encode(s + "\\n");`,
    `export const whole = () => huge();`,
    `export const chunks = () => [line("a line"), huge(), line("its last line")];`,
    "",
  ].join("\n"),
);

/** The part's job and file, in a step's engine folder, and its writers' calls. */
async function written(fn: string) {
  const dir = path.join(
    mkdtempSync(path.join(tmpdir(), "copyh-write-")),
    "COPY-H",
    "look1",
    "engine",
    "prices",
    "a",
  );
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, "c000.part");
  fs.calls = [];
  fs.on = true;
  try {
    const reply = await runJob(
      {
        module: MODULE,
        fn,
        phase: "PRICES",
        id: "c000",
        inputs: {},
        context: null,
        header: HEADER,
        file,
        seal: { ...SEALED, engine: "look1" },
      },
      kit,
    );
    return { reply, file, calls: fs.calls };
  } finally {
    fs.on = false;
  }
}

/** The writes of a chunk of `n` bytes from its start, a gigabyte at most each. */
const writesOf = (fd: unknown, n: number) => {
  const out: unknown[][] = [];
  for (let at = 0; at < n; at += GB)
    out.push(["write", fd, at, Math.min(n - at, GB)]);
  return out;
};

describe("a part's write (H1, M3)", { timeout: 60_000 }, () => {
  it("writes a part above 2 GiB given as chunks a gigabyte a write at most, through one descriptor, flushed, then renamed", async () => {
    const { reply, file, calls } = await written("chunks");
    expect(reply).toMatchObject({ ok: true, id: "c000" });
    const fd = calls[0]![3];
    expect(calls).toEqual([
      ["open", `${file}.tmp`, "w", fd],
      ["write", fd, 0, HEADER.length + 1],
      ["write", fd, 0, 7],
      ...writesOf(fd, 3 * GB + 5),
      ["write", fd, 0, 14],
      ["fsync", fd],
      ["close", fd],
      ["rename", `${file}.tmp`, file],
    ]);
    // The big chunk wrote nothing: the file holds the real bytes alone.
    expect(readFileSync(file, "utf8")).toBe(
      `${HEADER}\na line\nits last line\n`,
    );
  });

  it("writes a part above 2 GiB given whole the same way", async () => {
    const { reply, file, calls } = await written("whole");
    expect(reply).toMatchObject({ ok: true, id: "c000" });
    const fd = calls[0]![3];
    expect(calls).toEqual([
      ["open", `${file}.tmp`, "w", fd],
      ["write", fd, 0, HEADER.length + 1],
      ...writesOf(fd, 3 * GB + 5),
      ["fsync", fd],
      ["close", fd],
      ["rename", `${file}.tmp`, file],
    ]);
    expect(readFileSync(file, "utf8")).toBe(`${HEADER}\n`);
  });
});
