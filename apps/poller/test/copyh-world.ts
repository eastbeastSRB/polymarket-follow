/**
 * Synthetic raw stores for COPY-H's tests: fill files of either format by
 * key, each an LZ4 frame of independent blocks (polish-world.ts's encoder),
 * with their data list; records in Hyperliquid's key order with `closedPnl`,
 * `fee` and, when given, `builderFee`; the lists COPY-H reads (coins, dirs);
 * the bytes a search reads.
 */
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { Worker } from "node:worker_threads";
import { vi } from "vitest";
import { sha256 } from "../src/copyh/run.js";
import type { Lists } from "../src/copyh/scan.js";
import { frameOf } from "./polish-world.js";

export { addr, byBlock, record, trade, type FillSpec } from "./polish-world.js";

/** The coins of the synthetic worlds, by iid (meta's order). */
export const COINS = ["BTC", "ETH", "SOL", "HYPE", "kPEPE"];
export const DIRS: [string, "trade" | "forced" | "vault" | "outcome"][] = [
  ["Open Long", "trade"],
  ["Open Short", "trade"],
  ["Close Long", "trade"],
  ["Close Short", "trade"],
  ["Long > Short", "trade"],
  ["Short > Long", "trade"],
  ["Liquidated Cross Long", "forced"],
  ["Liquidated Isolated Short", "forced"],
  ["Auto-Deleveraging", "forced"],
  ["Settlement", "forced"],
  ["Net Child Vaults", "vault"],
  ["Split Outcome", "outcome"],
];
export const LISTS: Lists = {
  iids: new Map(COINS.map((c, i) => [c, i])),
  kinds: new Map(DIRS),
  counting: false,
};
/** Stand-ins for the lists' SHA-256s a part names. */
export const LIST_HASHES = { coins: sha256("coins"), dirs: sha256("dirs") };

/** The key of a fill file of an hour. */
export const keyOf = (
  hour: number,
  format: "node_fills" | "node_fills_by_block" = "node_fills_by_block",
) => {
  const d = new Date(hour);
  return `${format}/hourly/${d.toISOString().slice(0, 10).replaceAll("-", "")}/${d.getUTCHours()}.lz4`;
};

/** A raw store of these files (text by key), each an LZ4 frame, its folder `…\WAVE-H\store`; its list, key to SHA-256. */
export function makeStore(
  files: ReadonlyMap<string, string>,
  blockSize = 65_536,
) {
  const root = mkdtempSync(path.join(tmpdir(), "copyh-store-"));
  const store = path.join(root, "WAVE-H", "store");
  const list = new Map<string, string>();
  for (const [key, text] of files) {
    const file = path.join(store, ...key.split("/"));
    mkdirSync(path.dirname(file), { recursive: true });
    const bytes = frameOf(Buffer.from(text, "utf8"), blockSize);
    writeFileSync(file, bytes);
    list.set(key, sha256(bytes));
  }
  return { root, store, list };
}

/** A synthetic text's file bytes: its LZ4 frame. */
export const lz4Of = (text: string) => frameOf(Buffer.from(text, "utf8"));

/** The heap limit (bytes) V8 gives a worker of this old-generation ceiling on this machine: what a COPY-H worker of that ceiling reports. */
export const heapLimitOf = (maxOldGenerationSizeMb: number) =>
  new Promise<number>((resolve, reject) => {
    const w = new Worker(
      "require('node:worker_threads').parentPort.postMessage(require('node:v8').getHeapStatistics().heap_size_limit);",
      { eval: true, resourceLimits: { maxOldGenerationSizeMb } },
    );
    w.once("message", (limit: number) => {
      void w.terminate();
      resolve(limit);
    });
    w.once("error", reject);
  });

/** What `run` gives, and the bytes `Buffer#indexOf` searched for these needles while it ran: from each call's offset to its match's end, or to the end of the buffer searched when none. */
export function searchedBytes<T>(
  needles: readonly Buffer[],
  run: () => T,
): [bytes: number, value: T] {
  const spy = vi.spyOn(Buffer.prototype as Buffer, "indexOf");
  try {
    const value = run();
    const { calls, contexts, results } = spy.mock;
    let bytes = 0;
    calls.forEach((args, i) => {
      const [needle, from] = args as unknown[];
      const r = results[i]!;
      if (
        !Buffer.isBuffer(needle) ||
        !needles.some((n) => n.equals(needle)) ||
        r.type !== "return"
      )
        return;
      const searched = contexts[i] as Buffer;
      bytes +=
        (r.value === -1 ? searched.length : r.value + needle.length) -
        (typeof from === "number" ? from : 0);
    });
    return [bytes, value];
  } finally {
    spy.mockRestore();
  }
}
