/**
 * A coin's reading for the phases that read its tape, TRIPWIRE and PRICES
 * (copyh/rules.md C9, C16), one coin a part:
 * - its bars across the reading's stores to END and its end and first
 *   Settlement (markets.ts `coinOf`), each store's manifest and dirs.json
 *   held to the part's inputs (phase-labels.ts `readingOf`); none when the
 *   reading holds no bars of it;
 * - its funding rows: the windows of the coin that `copyh/funding.sha256`
 *   lists (the list held to the part's inputs, each window file sealed by
 *   name and real path, inside the run's roots, and held to its line),
 *   those starting before END, read by funding.ts's reader through the
 *   step's seal (each row's own time; C0's seal 2); the rows timed at or
 *   after END are dropped, a reading whose END lies inside a window (the
 *   rehearsal's fortnight; the engine review's section 8, 3).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { sealedRows, type FundingRow } from "./funding.js";
import { coinOf, type Coin } from "./markets.js";
import { ReadingContext, ReadingInputs, readingOf } from "./phase-labels.js";
import { readDataList } from "./range.js";
import { StoreError, sha256 } from "./run.js";
import { checkInside, checkPath, type Seal } from "./seal.js";

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
/** A coin part's identity: the reading, BUILD's and BUILD-L's records (none: BUILD-L had no part), the coin, END and the funding list. */
export const CoinInputs = ReadingInputs.extend({
  code: z.string(),
  build: z.tuple([SHA256, SHA256.nullable()]),
  iid: z.number().int().min(0),
  /** Its name in coins.json, as its funding windows are keyed. */
  coin: z.string().min(1),
  end: z.number(),
  /** copyh/funding.sha256's SHA-256. */
  funding: SHA256,
});
export type CoinInputs = z.infer<typeof CoinInputs>;
/** Where a coin part reads: the reading, BUILD's and BUILD-L's phase folders, the funding store and its list. */
export const CoinContext = ReadingContext.extend({
  build: z.string(),
  large: z.string(),
  fundingStore: z.string(),
  fundingList: z.string(),
});
export type CoinContext = z.infer<typeof CoinContext>;

const WINDOW = /^info\/fundingHistory\/([^/]+)\/(\d+)\.json$/;

/** A coin's bars, end and Settlement (null: no bars in the reading) and its funding rows before END. */
export function coinReadingOf(
  context: CoinContext,
  inputs: CoinInputs,
  seal: Seal,
): { coin: (Coin & { readonly name: string }) | null; rows: FundingRow[] } {
  const { stores } = readingOf(context, inputs, seal);
  const coin = coinOf(stores, inputs.iid, inputs.end);
  const list = readFileSync(context.fundingList);
  if (sha256(list) !== inputs.funding)
    throw new StoreError(`${context.fundingList} is not its part's`);
  const windows: { key: string; bytes: Buffer }[] = [];
  for (const [key, want] of readDataList(list.toString("utf8"))) {
    const m = WINDOW.exec(key);
    if (m === null || m[1] !== inputs.coin || Number(m[2]) >= inputs.end)
      continue;
    const file = path.join(context.fundingStore, ...key.split("/"));
    checkPath(file, seal);
    checkInside(file, context.roots);
    const bytes = readFileSync(file);
    if (sha256(bytes) !== want)
      throw new StoreError(`${key}: not its line in the funding list`);
    windows.push({ key, bytes });
  }
  const rows = sealedRows(inputs.coin, windows, seal).filter(
    (r) => r.time < inputs.end,
  );
  return {
    coin: coin === null ? null : { ...coin, name: inputs.coin },
    rows,
  };
}
