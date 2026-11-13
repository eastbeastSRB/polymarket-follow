/**
 * Synthetic recordings for MARKET-1's tests, written by the collector's own
 * `Recorder` (files by receive time, Brotli for a closed hour, a closed day's
 * manifest, coverage lines) and `BookSampler` (the last frame of a second when
 * its levels changed, and the first sample of each hour regardless), driven
 * through fake time. Every value is made up.
 */
import { pino } from "pino";
import { vi } from "vitest";
import type { CoverageEvent } from "../src/health/coverage.js";
import { Recorder } from "../src/store/files.js";
import { BookSampler } from "../src/ws/book-sampler.js";

export const log = pino({ level: "silent" });
export const at = (iso: string) => Date.parse(iso);

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
