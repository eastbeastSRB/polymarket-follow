/**
 * Synthetic recordings for MARKET-1's tests, written by the collector's own
 * `Recorder` (files by receive time, Brotli for a closed hour, a closed day's
 * manifest, coverage lines) and `BookSampler` (the last frame of a second when
 * its levels changed, and the first sample of each hour regardless), driven
 * through fake time. Every value is made up.
 */
import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { brotliCompressSync } from "node:zlib";
import { pino } from "pino";
import { vi } from "vitest";
import type { CoverageEvent } from "../src/health/coverage.js";
import { Recorder } from "../src/store/files.js";
import { BookSampler } from "../src/ws/book-sampler.js";

export const log = pino({ level: "silent" });
export const at = (iso: string) => Date.parse(iso);
const sha256 = (b: Buffer | string) =>
  createHash("sha256").update(b).digest("hex");

/**
 * A closed day written by hand in the collector's format: its book hour files
 * (lines `<receive time>\t<text>`, Brotli; or bytes as given), its coverage
 * (the nightly REST pause by default), and a manifest naming each file with
 * its SHA-256.
 */
export function writeDay(
  dir: string,
  date: string,
  hours: Record<string, string[] | Buffer>,
  coverage = [
    `${at(`${date}T02:35:00Z`)}\t{"event":"rest_pause","state":"start"}`,
  ],
): void {
  const day = path.join(dir, date);
  mkdirSync(day, { recursive: true });
  const files: { name: string; sha256: string; lines: number }[] = [];
  for (const [hh, content] of Object.entries(hours)) {
    const bytes = Buffer.isBuffer(content)
      ? content
      : brotliCompressSync(`${content.join("\n")}\n`);
    const name = `book-${hh}.jsonl.br`;
    writeFileSync(path.join(day, name), bytes);
    files.push({
      name,
      sha256: sha256(bytes),
      lines: Buffer.isBuffer(content) ? 0 : content.length,
    });
  }
  const text = `${coverage.join("\n")}\n`;
  writeFileSync(path.join(day, "coverage.jsonl"), text);
  files.push({
    name: "coverage.jsonl",
    sha256: sha256(text),
    lines: coverage.length,
  });
  writeFileSync(
    path.join(day, "manifest.json"),
    JSON.stringify({ date, files }),
  );
}

export type Item =
  | {
      kind: "frame";
      iid: number;
      ts: number;
      recv: number;
      bids: readonly (readonly string[])[];
      asks: readonly (readonly string[])[];
    }
  | { kind: "coverage"; at: number; event: CoverageEvent };

const wallOf = (i: Item) => (i.kind === "frame" ? i.recv : i.at);

/** A book frame's text as the server sends it. */
export function frameText(
  iid: number,
  ts: number,
  bids: readonly (readonly string[])[],
  asks: readonly (readonly string[])[],
): string {
  return JSON.stringify({
    ch: `book::${iid}`,
    ts,
    ets: ts,
    sq: 1,
    data: { b: bids, a: asks },
  });
}

/**
 * Records the items in the order of their wall time (a frame's receive
 * time), from `from` until `until` (past the last day's first roll, so that
 * its manifest is written). Leaves real timers in place.
 */
export async function record(
  root: string,
  items: readonly Item[],
  from: number,
  until: number,
): Promise<void> {
  vi.useFakeTimers({ toFake: ["Date", "setTimeout", "clearTimeout"] });
  try {
    vi.setSystemTime(from);
    const recorder = new Recorder(root, log);
    await recorder.start();
    const sampler = new BookSampler();
    const sorted = [...items].sort((a, b) => wallOf(a) - wallOf(b));
    for (const item of sorted) {
      const wall = wallOf(item);
      if (wall > Date.now())
        await vi.advanceTimersByTimeAsync(wall - Date.now());
      if (item.kind === "coverage") {
        recorder.coverage(item.event);
        continue;
      }
      const text = frameText(item.iid, item.ts, item.bids, item.asks);
      const line = sampler.onFrame(
        item.iid,
        item.ts,
        item.recv,
        text,
        JSON.stringify([item.bids, item.asks]),
      );
      if (line) recorder.write("book", line.recvMs, line.text);
    }
    for (const line of sampler.flushAll())
      recorder.write("book", line.recvMs, line.text);
    if (until > Date.now())
      await vi.advanceTimersByTimeAsync(until - Date.now());
    await recorder.close();
  } finally {
    vi.useRealTimers();
  }
}
