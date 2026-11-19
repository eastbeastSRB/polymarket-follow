/**
 * The exploration's positions files as streams (decisions 2026-11-19, "the
 * E step stopped while writing"; EXPLORE-FIX-1): lines, gzipped, written and
 * read a chunk at a time, so no string or Buffer holds a whole file. The E
 * step's lines joined into one string passed V8's longest (536,870,888
 * characters on Node 24.13, 2026-11-19), and the step stopped before
 * writing.
 */
import {
  createReadStream,
  createWriteStream,
  mkdirSync,
  renameSync,
} from "node:fs";
import path from "node:path";
import { Writable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { StringDecoder } from "node:string_decoder";
import { setTimeout as sleep } from "node:timers/promises";
import { createGunzip, createGzip } from "node:zlib";
import { RENAME_PAUSE_MS, RENAME_TRIES } from "../../waveh/run.js";

/** The writer's chunk: 2^20 characters (1 MiB of ASCII), running to the end of the line that reaches it. */
export const CHUNK = 2 ** 20;

/** The lines, each ending in "\n", joined into chunks: a chunk ends after the line that brings it to `size` characters, so it holds less than `size` plus one line, and no line is split. */
export function* chunksOf(
  lines: readonly string[],
  size = CHUNK,
): Generator<string> {
  let chunk = "";
  for (const line of lines) {
    chunk += `${line}\n`;
    if (chunk.length >= size) {
      yield chunk;
      chunk = "";
    }
  }
  if (chunk !== "") yield chunk;
}

/**
 * The lines, each ending in "\n", gzipped as one stream into `<file>.tmp`,
 * flushed and closed, then renamed over the file, a refused rename tried
 * again, as WAVE-H's `writeWhole` writes a file whole: a crash leaves no
 * torn file under its name.
 */
export async function writeGzLines(
  file: string,
  lines: readonly string[],
  tries = RENAME_TRIES,
  pauseMs = RENAME_PAUSE_MS,
): Promise<void> {
  mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.tmp`;
  await pipeline(
    chunksOf(lines),
    createGzip(),
    createWriteStream(tmp, { flush: true }),
  );
  for (let i = 1; ; i++) {
    try {
      renameSync(tmp, file);
      return;
    } catch (err) {
      if (i >= tries) throw err;
      await sleep(pauseMs);
    }
  }
}

/**
 * A sink of UTF-8 bytes that hands `each` every line as it arrives, in
 * order, the empty ones left out (as `split("\n")` and a filter): a line or
 * a character split across chunks is joined, and a last line without "\n"
 * is a line. What `each` throws fails the sink with that error.
 */
export function lineSink(each: (line: string) => void): Writable {
  const decoder = new StringDecoder("utf8");
  let rest = "";
  const take = (text: string) => {
    const parts = text.split("\n");
    rest = parts.pop()!;
    for (const p of parts) if (p !== "") each(p);
  };
  return new Writable({
    write(chunk: Buffer, _encoding, done) {
      try {
        take(rest + decoder.write(chunk));
        done();
      } catch (err) {
        done(err as Error);
      }
    },
    final(done) {
      try {
        take(`${rest}${decoder.end()}\n`);
        done();
      } catch (err) {
        done(err as Error);
      }
    },
  });
}

/**
 * A gzipped file's lines through `parse`, in order, the file read 64 KiB
 * and gunzipped 16 KiB at a time (Node's defaults). A file cut short, or a
 * line `parse` refuses, rejects with its own error: the pipeline ends in a
 * Writable (`lineSink`), because an async function there that throws makes
 * it reject with an AbortError instead (its `for await` destroys the source
 * first; Node 24.13, 2026-11-19).
 */
export async function readGzLines<T>(
  file: string,
  parse: (line: string) => T,
): Promise<T[]> {
  const out: T[] = [];
  await pipeline(
    createReadStream(file),
    createGunzip(),
    lineSink((line) => out.push(parse(line))),
  );
  return out;
}
