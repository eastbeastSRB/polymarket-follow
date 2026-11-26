/**
 * Made-up data for the copy engine's tests:
 * - stores: fill files of made-up records through the store's own pass and
 *   merge (pass.ts, merge.ts), so that the engine reads what a real build
 *   writes; a store's window is the test's own, its files
 *   `node_fills_by_block` hours (copyh-world.ts's encoder);
 * - accounts: an account's fills in the kit's `normFill` fields, as
 *   normalize.ts gives them (each order's fills at one time sharing their
 *   chain head, the position before the order), positions kept by coin.
 */
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { merge } from "../src/copyh/merge.js";
import { runPass, type FileTask, type PassLists } from "../src/copyh/pass.js";
import { monthsOf } from "../src/copyh/range.js";
import { sha256 } from "../src/copyh/run.js";
import { SEALED, type Seal } from "../src/copyh/seal.js";
import { openStore, type Store } from "../src/copyh/store.js";
import type { Fill } from "../src/paper/research.js";
import { COINS, DIRS, LIST_HASHES, makeStore } from "./copyh-world.js";

export const PASS_LISTS: PassLists = {
  iids: COINS.map((c, i) => [c, i] as const),
  kinds: DIRS,
  hashes: LIST_HASHES,
};
/** dirs.json's kinds, as the engine reads them. */
export const KINDS = new Map(DIRS);
const never = { stop: () => null };

/**
 * A store of these files (text by key) whose window is [start, end), built
 * by the pass and the merge as a build runs them, opened under `open` (the
 * seal its readers take); `build` is the seal the pass reads its keys under.
 */
export async function storeOf(
  files: ReadonlyMap<string, string>,
  start: number,
  end: number,
  o: { build?: Seal; open?: Seal } = {},
): Promise<Store> {
  const raw = makeStore(files);
  const tasks: FileTask[] = [...files.keys()].map((key, index) => ({
    index,
    key,
    sha256: raw.list.get(key)!,
  }));
  const parts = mkdtempSync(path.join(tmpdir(), "copyh-eparts-"));
  await runPass({
    store: raw.store,
    parts,
    files: tasks,
    start,
    end,
    code: "engine-world",
    lists: PASS_LISTS,
    workers: 0,
    seal: o.build ?? SEALED,
    roots: [raw.root],
    budget: never,
    log: () => {},
  });
  const dir = path.join(
    mkdtempSync(path.join(tmpdir(), "copyh-estore-")),
    "store",
  );
  merge(
    {
      parts,
      dir,
      files: tasks,
      code: "engine-world",
      lists: LIST_HASHES,
      range: {
        name: "burnin",
        fill: tasks.map((t) => t.key),
        start,
        end,
        months: monthsOf(start, end),
      },
      list: { name: "engine-world", sha256: sha256("engine-world") },
      budget: never,
      unitRows: 1_000_000,
      log: () => {},
    },
    { peaks: () => ({}), seconds: {} },
  );
  return openStore(dir, [path.dirname(dir)], o.open ?? SEALED);
}

/** An order of a made-up account: `side` +1 buys, −1 sells; its fills' sizes at one time. */
export type Order = {
  t: number;
  /** The coin (2: SOL in copyh-world's list). */
  iid?: number;
  oid: number | string;
  side: 1 | -1;
  sizes: readonly number[];
  px?: number;
  taker?: boolean;
  /** An own liquidation's fills: liq and forced. */
  liq?: boolean;
  /** A forced fill of another kind (ADL, Settlement). */
  forced?: boolean;
  pnl?: number;
};

/** A made-up account's fills, oldest first, in the kit's `normFill` fields. */
export class FillBook {
  readonly fills: Fill[] = [];
  private readonly pos = new Map<number, number>();
  private tid = 0;

  order(o: Order): this {
    const iid = o.iid ?? 2;
    const head = this.pos.get(iid) ?? 0;
    for (const q of o.sizes)
      this.fills.push({
        t: o.t,
        iid,
        oid: String(o.oid),
        tid: String((this.tid += 1)),
        prevS: String(head),
        prev: head,
        sgn: o.side,
        px: o.px ?? 100,
        q,
        fee: 0,
        pnl: o.pnl ?? 0,
        taker: o.taker ?? true,
        liq: o.liq ?? false,
        forced: (o.forced ?? false) || (o.liq ?? false),
      });
    this.pos.set(iid, head + o.side * o.sizes.reduce((s, q) => s + q, 0));
    return this;
  }
}
