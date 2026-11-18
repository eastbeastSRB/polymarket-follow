/**
 * `polish extract` (the polishing plan 4.2 and 4.4; decisions 2026-11-17,
 * the plan approved, F3): every file the range needs must be in the list
 * before any is read; then the range's fill files through the pass into
 * parts, its days of contexts and its funding windows, and the merge into
 * the store under `<root>\store`. Memory is sampled every 5 s and on every
 * file; the peaks and each step's seconds go into the manifest.
 */
import path from "node:path";
import { getHeapStatistics } from "node:v8";
import { ctxsKey, fundingKey } from "../waveh/keys.js";
import { StoreError, type DataList } from "../waveh/store.js";
import { readContexts, readFunding } from "./ctxs.js";
import { merge } from "./merge.js";
import { runPass } from "./pass.js";
import type { Range } from "./range.js";
import { checkPath } from "./seal.js";
import type { Manifest } from "./store.js";

export const PARTS = "parts";
export const STORE = "store";

/** The highest of every `process.memoryUsage()` field and of the heap's ceiling (`heapLimit`), sampled every `ms` until stopped; `peak` is kept up to date. */
export function peakWatch(ms = 5_000) {
  const peak: Record<string, number> = {};
  const sample = () => {
    const m: Record<string, number> = {
      ...process.memoryUsage(),
      heapLimit: getHeapStatistics().heap_size_limit,
    };
    for (const [k, v] of Object.entries(m)) peak[k] = Math.max(peak[k] ?? 0, v);
  };
  sample();
  const timer = setInterval(sample, ms);
  timer.unref();
  return {
    peak,
    stop: () => {
      clearInterval(timer);
      sample();
    },
  };
}

export async function extract(o: {
  /** The raw store, read only. */
  store: string;
  /** The analyzer's folder of the range: `parts\`, `store\`. */
  root: string;
  list: DataList;
  listName: string;
  listSha256: string;
  range: Range;
  workers: number;
  code: string;
  wavehFrozen: string;
  forty: readonly string[];
  small: readonly string[];
  pace: () => Promise<void>;
  log: (event: string, fields: object) => void;
}): Promise<Manifest> {
  checkPath(o.store);
  checkPath(o.root);
  const r = o.range;
  const keys = [
    ...r.fill,
    ...r.days.map(ctxsKey),
    ...o.small.flatMap((c) => r.fundingStarts.map((s) => fundingKey(c, s))),
  ];
  const absent = keys.filter((k) => !o.list.has(k));
  if (absent.length > 0)
    throw new StoreError(
      `${absent.length} files of ${r.name} are not in the list, the first ${absent[0]}`,
    );
  const watch = peakWatch();
  const seconds: Record<string, number> = {};
  let t = Date.now();
  const lap = (step: string) => {
    seconds[step] = Math.round((Date.now() - t) / 1000);
    t = Date.now();
  };
  const pass = await runPass({
    store: o.store,
    parts: path.join(o.root, PARTS),
    files: r.fill.map((key, index) => ({
      index,
      key,
      sha256: o.list.get(key)!,
    })),
    end: r.end,
    code: o.code,
    forty: o.forty,
    small: o.small,
    workers: o.workers,
    pace: o.pace,
    log: o.log,
  });
  lap("pass");
  o.log("pass done", pass);
  const contexts = await readContexts({
    store: o.store,
    list: o.list,
    days: r.days,
    grid: r.grid,
    until: r.end,
    forty: o.forty,
    small: new Set(o.small),
    pace: o.pace,
  });
  lap("contexts");
  const funding = readFunding({
    store: o.store,
    list: o.list,
    coins: o.small,
    starts: r.fundingStarts,
    until: r.end,
  });
  lap("funding");
  o.log("contexts and funding", { days: contexts.byDay.size, seconds });
  const manifest = await merge(
    {
      parts: path.join(o.root, PARTS),
      dir: path.join(o.root, STORE),
      files: r.fill.map((key, index) => ({
        index,
        key,
        sha256: o.list.get(key)!,
      })),
      code: o.code,
      months: r.months,
      grid: r.grid,
      small: o.small,
      forty: o.forty,
      contexts,
      funding,
      pace: o.pace,
      log: o.log,
    },
    {
      range: r.name,
      partial: r.partial,
      end: r.end,
      minuteStart: r.grid.start,
      inputs: {
        list: o.listName,
        listSha256: o.listSha256,
        fill: r.fill.length,
        ctxs: r.days.length,
        funding: o.small.length * r.fundingStarts.length,
      },
      code: {
        fingerprint: o.code,
        wavehFrozen: o.wavehFrozen,
        node: process.version,
      },
      peaks: () => ({ pass: pass.peaks, main: { ...watch.peak } }),
      seconds,
    },
  );
  watch.stop();
  o.log("merged", {
    partitions: manifest.partitions.length,
    peaks: manifest.peaks,
  });
  return manifest;
}
