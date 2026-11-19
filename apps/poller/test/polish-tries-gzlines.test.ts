/**
 * The exploration's positions files as streams (src/polish/tries/gzlines.ts;
 * EXPLORE-FIX-1): each line written byte for byte as the one-string join
 * wrote it, gzipped as `gzipSync` gzips the whole text, and read back in
 * order; the empty set; chunks of 2^20 characters ending at a line's end, a
 * line at the edge and a line across it; a sink that joins a line or a
 * character split across chunks and hands each line on as it arrives; the
 * `.tmp`, then the rename, a refused rename tried again; a file cut short or
 * a line refused rejects with its own error; a set past V8's longest string
 * written and read back.
 */
import { constants } from "node:buffer";
import { spawn, type ChildProcess } from "node:child_process";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { gunzipSync, gzipSync } from "node:zlib";
import { afterAll, describe, expect, it } from "vitest";
import {
  CHUNK,
  chunksOf,
  lineSink,
  readGzLines,
  writeGzLines,
} from "../src/polish/tries/gzlines.js";
import { RENAME_PAUSE_MS, RENAME_TRIES } from "../src/waveh/run.js";

const tmp = () => mkdtempSync(path.join(tmpdir(), "polish-gzlines-"));
/** The text the one-string join wrote: each line, then "\n". */
const joined = (lines: readonly string[]) =>
  Buffer.from(lines.map((l) => `${l}\n`).join(""));
const same = (a: Buffer, b: Buffer) => Buffer.compare(a, b) === 0;
const asIs = (l: string) => l;

describe("the positions files' writer", () => {
  it("writes each line byte for byte, ending in \\n, gzipped as gzipSync gzips the whole text, into a folder it makes; the lines read back in order", async () => {
    const dir = tmp();
    const file = path.join(dir, "explore", "e-positions.jsonl.gz");
    const lines = [
      JSON.stringify({ group: "B0", slice: 0, t: 1, net: -2.5, onMarks: null }),
      JSON.stringify({ group: "D15", tid: "899064266001530", net: null }),
      // Characters of two, three and four bytes, a carriage return inside a line, a space.
      "é € 𝄞",
      "a\rb",
      " ",
    ];
    await writeGzLines(file, lines);
    const bytes = readFileSync(file);
    expect(same(gunzipSync(bytes), joined(lines))).toBe(true);
    expect(same(bytes, gzipSync(joined(lines)))).toBe(true);
    expect(readdirSync(path.dirname(file))).toEqual(["e-positions.jsonl.gz"]);
    expect(await readGzLines(file, asIs)).toEqual(lines);
  });

  it("writes the empty set as gzipSync gzips nothing, read back as no line", async () => {
    const file = path.join(tmp(), "choice-positions.jsonl.gz");
    await writeGzLines(file, []);
    const bytes = readFileSync(file);
    expect(gunzipSync(bytes).length).toBe(0);
    expect(same(bytes, gzipSync(Buffer.alloc(0)))).toBe(true);
    expect(await readGzLines(file, asIs)).toEqual([]);
    expect([...chunksOf([])]).toEqual([]);
  });

  it("joins the lines into chunks that end at a line's end: one at the edge closes its chunk, one across it stays whole in it", () => {
    expect(CHUNK).toBe(1_048_576);
    // At the edge: 4 + 1 and 4 + 1 characters reach 10 exactly.
    expect([...chunksOf(["abcd", "efgh", "ij"], 10)]).toEqual([
      "abcd\nefgh\n",
      "ij\n",
    ]);
    // Across it: the second line takes its chunk to 11.
    expect([...chunksOf(["abcd", "efghi", "j"], 10)]).toEqual([
      "abcd\nefghi\n",
      "j\n",
    ]);
    // A line longer than a chunk ends the chunk it joins, whole.
    const long = "x".repeat(25);
    expect([...chunksOf(["ab", long, "c"], 10)]).toEqual([
      `ab\n${long}\n`,
      "c\n",
    ]);
  });

  it("writes a set of more than one chunk, lines ending at the edges and lines across one, and reads it back in order", async () => {
    // 2,500 lines of 1,024 characters with their "\n": 1,024 lines fill a chunk exactly. Then lines of uneven
    // lengths, one of which takes the third chunk across its edge.
    const lines = [
      ...Array.from(
        { length: 2_500 },
        (_, i) => `${String(i).padStart(5, "0")}${"y".repeat(1_018)}`,
      ),
      ...Array.from({ length: 3_000 }, (_, i) =>
        JSON.stringify({ i, x: "z".repeat((i * i) % 997) }),
      ),
    ];
    const chunks = [...chunksOf(lines)];
    const longest = Math.max(...lines.map((l) => l.length + 1));
    expect(chunks.length).toBe(4);
    expect(chunks.slice(0, 2).map((c) => c.length)).toEqual([CHUNK, CHUNK]);
    expect(chunks[2]!.length).toBeGreaterThan(CHUNK);
    expect(chunks[2]!.length).toBeLessThan(CHUNK + longest);
    expect(chunks[2]!.endsWith("\n")).toBe(true);
    expect(chunks[3]!.length).toBeLessThan(CHUNK);
    expect(same(Buffer.from(chunks.join("")), joined(lines))).toBe(true);
    const file = path.join(tmp(), "c-positions.jsonl.gz");
    await writeGzLines(file, lines);
    const bytes = readFileSync(file);
    expect(same(gunzipSync(bytes), joined(lines))).toBe(true);
    expect(same(bytes, gzipSync(joined(lines)))).toBe(true);
    expect(await readGzLines(file, asIs)).toEqual(lines);
  });
});

describe("the positions files' reader", () => {
  const b = (text: string) => Buffer.from(text);
  /** The lines a sink hands on for these chunks. */
  const linesOf = async (chunks: Buffer[]) => {
    const seen: string[] = [];
    await pipeline(
      Readable.from(chunks),
      lineSink((l) => seen.push(l)),
    );
    return seen;
  };

  it("joins a line split across chunks, a line ending at a chunk's edge or starting after it, and a character split across chunks; leaves out the empty lines; keeps a last line without \\n", async () => {
    expect(await linesOf([b("ab\ncd"), b("\nef\n")])).toEqual([
      "ab",
      "cd",
      "ef",
    ]);
    // A chunk ending at a line's end; a chunk whose first byte is the "\n"; a last line without one.
    expect(await linesOf([b("ab\n"), b("cd"), b("\nef")])).toEqual([
      "ab",
      "cd",
      "ef",
    ]);
    expect(await linesOf([b("a"), b("b"), b("c\n")])).toEqual(["abc"]);
    // "é" (C3 A9) and "𝄞" (F0 9D 84 9E), each cut between two chunks.
    const text = b("é𝄞\n");
    expect(
      await linesOf([
        text.subarray(0, 1),
        text.subarray(1, 3),
        text.subarray(3),
      ]),
    ).toEqual(["é𝄞"]);
    expect(await linesOf([b("\n\nab\n\n"), b("\n")])).toEqual(["ab"]);
    expect(await linesOf([])).toEqual([]);
  });

  it("hands each line on as its chunk arrives, never holding the text to its end", async () => {
    const seen: string[] = [];
    const sink = lineSink((l) => seen.push(l));
    const write = (text: string) =>
      new Promise<void>((resolve, reject) =>
        sink.write(Buffer.from(text), (err) => (err ? reject(err) : resolve())),
      );
    await write("ab\ncd");
    expect(seen).toEqual(["ab"]);
    await write("ef\ngh\n");
    expect(seen).toEqual(["ab", "cdef", "gh"]);
    await new Promise<void>((resolve) => sink.end(resolve));
    expect(seen).toEqual(["ab", "cdef", "gh"]);
  });

  it("refuses a file cut short, a missing file, and a line its parse refuses, each with its own error", async () => {
    const dir = tmp();
    const file = path.join(dir, "e-positions.jsonl.gz");
    const lines = Array.from({ length: 5_000 }, (_, i) =>
      JSON.stringify({ i, x: "q".repeat(i % 50) }),
    );
    await writeGzLines(file, lines);
    const whole = readFileSync(file);
    // The trailer's length gone, then half the file: never read as fewer lines.
    const cut = path.join(dir, "cut.jsonl.gz");
    writeFileSync(cut, whole.subarray(0, whole.length - 4));
    await expect(readGzLines(cut, asIs)).rejects.toThrow(
      "unexpected end of file",
    );
    writeFileSync(cut, whole.subarray(0, Math.floor(whole.length / 2)));
    await expect(readGzLines(cut, asIs)).rejects.toThrow(
      "unexpected end of file",
    );
    await expect(
      readGzLines(path.join(dir, "none.jsonl.gz"), asIs),
    ).rejects.toThrow("ENOENT");
    // The 4,000th line refused: the parse's own error, not the stream's.
    await expect(
      readGzLines(file, (l) => {
        if (l === lines[3_999]) throw new SyntaxError("line 4,000 refused");
        return l;
      }),
    ).rejects.toThrow("line 4,000 refused");
    // A last line without "\n", refused in its turn.
    const open = path.join(dir, "open.jsonl.gz");
    writeFileSync(open, gzipSync("good\nbad"));
    expect(await readGzLines(open, asIs)).toEqual(["good", "bad"]);
    await expect(
      readGzLines(open, (l) => {
        if (l === "bad") throw new SyntaxError("the last line refused");
        return l;
      }),
    ).rejects.toThrow("the last line refused");
  });
});

describe("the positions files' whole write", () => {
  const children: ChildProcess[] = [];
  afterAll(() => {
    for (const c of children) c.kill();
  });

  it("writes into <file>.tmp and renames it over the file: a .tmp that cannot be written leaves the file as it was", async () => {
    const dir = tmp();
    const file = path.join(dir, "e-positions.jsonl.gz");
    await writeGzLines(file, ["one"]);
    await writeGzLines(file, ["two", "three"]);
    expect(await readGzLines(file, asIs)).toEqual(["two", "three"]);
    expect(readdirSync(dir)).toEqual(["e-positions.jsonl.gz"]);
    // A folder where the .tmp goes: opening it for writing fails (EISDIR).
    mkdirSync(`${file}.tmp`);
    await expect(writeGzLines(file, ["four"])).rejects.toThrow(/EISDIR|EPERM/);
    expect(await readGzLines(file, asIs)).toEqual(["two", "three"]);
  });

  it("tries a refused rename again, by default once a second, 10 times in all, then gives up, the whole .tmp left", async () => {
    expect([RENAME_TRIES, RENAME_PAUSE_MS]).toEqual([10, 1_000]);
    const dir = tmp();
    // A rename onto a folder that holds a file is refused every time: 3 tries, 2 pauses between.
    const folder = path.join(dir, "folder");
    mkdirSync(path.join(folder, "x"), { recursive: true });
    const t0 = Date.now();
    await expect(writeGzLines(folder, ["a", "b"], 3, 500)).rejects.toThrow(
      /EPERM|EISDIR|ENOTEMPTY/,
    );
    const waited = Date.now() - t0;
    expect(waited).toBeGreaterThanOrEqual(2 * 500);
    expect(waited).toBeLessThan(3 * 500);
    expect(gunzipSync(readFileSync(`${folder}.tmp`)).toString("utf8")).toBe(
      "a\nb\n",
    );
    if (process.platform !== "win32") return;
    // Another process holds the file for 1.5 s: Windows refuses a rename over it.
    const file = path.join(dir, "c-positions.jsonl.gz");
    await writeGzLines(file, ["one"]);
    const holder = spawn(
      process.execPath,
      [
        "-e",
        `const fs=require("fs");const fd=fs.openSync(${JSON.stringify(file)},"r");process.stdout.write("held\\n");setTimeout(()=>fs.closeSync(fd),1500);`,
      ],
      { stdio: ["ignore", "pipe", "ignore"] },
    );
    children.push(holder);
    await new Promise<void>((resolve) =>
      holder.stdout.once("data", () => resolve()),
    );
    await expect(writeGzLines(file, ["two"], 1)).rejects.toThrow(
      /EPERM|EACCES|EBUSY/,
    );
    await writeGzLines(file, ["three"]);
    expect(await readGzLines(file, asIs)).toEqual(["three"]);
  }, 60_000);
});

describe("a set past V8's longest string", () => {
  it("is written and read back line for line, where the one-string join stops", async () => {
    const tail = "w".repeat(1_000);
    const lineOf = (i: number) => `${i} ${tail}`;
    const n = Math.ceil(constants.MAX_STRING_LENGTH / 1_000) + 1_000;
    const lines = Array.from({ length: n }, (_, i) => lineOf(i));
    expect(lines.reduce((s, l) => s + l.length + 1, 0)).toBeGreaterThan(
      constants.MAX_STRING_LENGTH,
    );
    // The writer before EXPLORE-FIX-1.
    expect(() => lines.map((l) => `${l}\n`).join("")).toThrow(
      "Invalid string length",
    );
    const file = path.join(tmp(), "e-positions.jsonl.gz");
    await writeGzLines(file, lines);
    let i = 0;
    const back = await readGzLines(file, (l) => {
      if (l !== lineOf(i)) throw new Error(`line ${i + 1} differs`);
      i += 1;
      return l.length;
    });
    expect(back.length).toBe(n);
    expect(i).toBe(n);
  }, 180_000);
});
