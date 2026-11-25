/**
 * The merge and the store (src/copyh/merge.ts, store.ts; rules.md C3): the
 * fills by bucket and month, rows by (account, time), ties in the pass's
 * order, every kept row conserved; the switch hour's record in both formats
 * kept once, and a market taker twice stopping the merge; a trade split
 * across two files paired, its maker taking the taker's reading; the bars
 * added across files, the last price the latest, a pair across files, files
 * out of time order stopping; a merge stopped between units and resumed
 * equal to an unbroken one; a group above the unit size run bucket by
 * bucket, a bucket above it refused; the store read back, a changed file
 * refused.
 */
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SWITCH_HOUR } from "../src/copyh/design.js";
import { merge, type MergeInput } from "../src/copyh/merge.js";
import { runPass, type FileTask, type PassLists } from "../src/copyh/pass.js";
import { monthsOf } from "../src/copyh/range.js";
import { NotFinished, StoreError, sha256 } from "../src/copyh/run.js";
import {
  bucketKey,
  coinKey,
  openStore,
  partitionDir,
} from "../src/copyh/store.js";
import { MARKET, TAKER, bucketOf } from "../src/copyh/writers.js";
import { HOUR_MS } from "../src/schedule.js";
import {
  COINS,
  DIRS,
  LIST_HASHES,
  addr,
  byBlock,
  keyOf,
  makeStore,
  record,
  trade,
  type FillSpec,
} from "./copyh-world.js";

const LISTS: PassLists = {
  iids: COINS.map((c, i) => [c, i] as const),
  kinds: DIRS,
  hashes: LIST_HASHES,
};
const never = { stop: () => null };
const after = (n: number) => {
  let calls = 0;
  return { stop: () => (calls++ >= n ? "its minutes are spent" : null) };
};
const H0 = SWITCH_HOUR - HOUR_MS;
const RANGE = {
  name: "burnin" as const,
  fill: [] as string[],
  start: H0,
  end: SWITCH_HOUR + 2 * HOUR_MS,
  months: monthsOf(H0, SWITCH_HOUR + 2 * HOUR_MS),
};

/** A store's files built from these texts, their parts, and the merge's input. */
async function built(files: Map<string, string>, o: Partial<MergeInput> = {}) {
  const s = makeStore(files);
  const tasks: FileTask[] = [...files.keys()].map((key, index) => ({
    index,
    key,
    sha256: s.list.get(key)!,
  }));
  const parts = mkdtempSync(path.join(tmpdir(), "copyh-mparts-"));
  await runPass({
    store: s.store,
    parts,
    files: tasks,
    start: RANGE.start,
    end: RANGE.end,
    code: "code-a",
    lists: LISTS,
    workers: 0,
    roots: [s.root],
    budget: never,
    log: () => {},
  });
  const dir = path.join(
    mkdtempSync(path.join(tmpdir(), "copyh-mstore-")),
    "store",
  );
  const input: MergeInput = {
    parts,
    dir,
    files: tasks,
    code: "code-a",
    lists: LIST_HASHES,
    range: { ...RANGE, fill: tasks.map((t) => t.key) },
    list: { name: "test", sha256: sha256("list") },
    budget: never,
    unitRows: 1_000_000,
    log: () => {},
    ...o,
  };
  return { s, tasks, parts, dir, input };
}
/** The merge as a promise, so that a refusal is a rejection. */
const run = (input: MergeInput) =>
  Promise.resolve().then(() =>
    merge(input, { peaks: () => ({}), seconds: {} }),
  );

const t = (
  user: number,
  f: Partial<FillSpec> & { time: number; tid: number },
) => record(addr(user), { coin: "SOL", side: "B", crossed: true, ...f });

describe("the fills", { timeout: 60_000 }, () => {
  it("lie by bucket and month, rows by account and time, ties in the pass's order, every kept row conserved", async () => {
    const files = new Map([
      [
        keyOf(H0, "node_fills"),
        `${[t(1, { time: H0 + 5, tid: 1 }), t(2, { time: H0 + 1, tid: 2 }), t(1, { time: H0 + 1, tid: 3, coin: "BTC" })].join("\n")}\n`,
      ],
      [
        keyOf(SWITCH_HOUR, "node_fills"),
        `${[t(1, { time: H0 + 1, tid: 4, crossed: false }), t(257, { time: SWITCH_HOUR, tid: 5 })].join("\n")}\n`,
      ],
    ]);
    const b = await built(files);
    const m = await run(b.input);
    expect(m.counts.merge).toEqual({ in: 5, out: 5, duplicates: 0 });
    const store = openStore(b.dir, [path.dirname(b.dir)]);
    const users = store.users();
    expect(users).toEqual([...users].sort());
    // addr(1) and addr(257) share bucket 01; addr(2) is in bucket 02.
    expect(bucketOf(addr(257))).toBe(bucketOf(addr(1)));
    const p = store.partition("fills", bucketKey(1), "2025-07")!;
    const user = [...store.column(p, "user")].map((i) => users[i]);
    const time = [...store.column(p, "time")];
    const file = [...store.column(p, "file")];
    expect(user).toEqual([addr(1), addr(1), addr(1), addr(257)]);
    expect(time).toEqual([H0 + 1, H0 + 1, H0 + 5, SWITCH_HOUR]);
    // The two rows of H0 + 1: the first file's first (the pass's order).
    expect(file).toEqual([0, 1, 0, 1]);
    expect([...store.column(p, "iid")]).toEqual([0, 2, 2, 2]);
    expect(store.partition("fills", bucketKey(2), "2025-07")!.rows).toBe(1);
    expect(store.names().dirs).toEqual(["Open Long"]);
  });

  it("keeps a record of the switch hour's two files once, counted; stops on a market taker twice", async () => {
    const maker = t(3, { time: SWITCH_HOUR + 10, tid: 9, crossed: false });
    const files = new Map([
      [keyOf(SWITCH_HOUR, "node_fills"), `${maker}\n`],
      [keyOf(SWITCH_HOUR, "node_fills_by_block"), `${byBlock(1, [maker])}\n`],
    ]);
    const m = await run((await built(files)).input);
    expect(m.counts.merge).toEqual({ in: 2, out: 1, duplicates: 1 });
    const taker = t(3, { time: SWITCH_HOUR + 10, tid: 9 });
    const twice = new Map([
      [keyOf(SWITCH_HOUR, "node_fills"), `${taker}\n`],
      [keyOf(SWITCH_HOUR, "node_fills_by_block"), `${byBlock(1, [taker])}\n`],
    ]);
    await expect(run((await built(twice)).input)).rejects.toThrow(
      "a market taker twice (file 1, 2025-07-27T08:00:00.010Z): its bars would count it twice",
    );
  });

  it("pairs a trade split across two files: the maker takes the taker's reading", async () => {
    const backstop = {
      liquidatedUser: addr(5),
      markPx: "1",
      method: "backstop",
    };
    const files = new Map([
      [
        keyOf(H0, "node_fills"),
        `${t(4, { time: SWITCH_HOUR - 1, tid: 7, side: "A", liquidation: backstop })}\n`,
      ],
      [
        keyOf(SWITCH_HOUR, "node_fills"),
        `${t(5, { time: SWITCH_HOUR - 1, tid: 7, crossed: false })}\n`,
      ],
    ]);
    const b = await built(files);
    const m = await run(b.input);
    expect([m.counts.straddles, m.counts.unpaired]).toEqual([1, []]);
    const store = openStore(b.dir, [path.dirname(b.dir)]);
    const flags = [
      ...store.column(
        store.partition("fills", bucketKey(5), "2025-07")!,
        "flags",
      ),
    ];
    expect(flags[0]! & MARKET).toBe(0);
    expect(flags[0]! & TAKER).toBe(0);
  });
});

describe("the bars", { timeout: 60_000 }, () => {
  it("add the files' minutes, take the latest price, count a pair across files, and stop on files out of time order", async () => {
    const m0 = SWITCH_HOUR - 60_000;
    const files = new Map([
      [
        keyOf(H0, "node_fills"),
        `${[t(1, { time: m0 + 10, tid: 1, px: "10" }), t(1, { time: SWITCH_HOUR - 1_000, tid: 2, px: "11" })].join("\n")}\n`,
      ],
      [
        keyOf(SWITCH_HOUR, "node_fills"),
        `${[t(2, { time: SWITCH_HOUR - 500, tid: 3, px: "12", side: "A" }), t(2, { time: SWITCH_HOUR + 1, tid: 4, px: "13" })].join("\n")}\n`,
      ],
    ]);
    const b = await built(files);
    await run(b.input);
    const store = openStore(b.dir, [path.dirname(b.dir)]);
    const p = store.partition("bars", coinKey(2), "2025-07")!;
    expect(p.start).toBe(H0);
    const k = (time: number) => Math.floor((time - H0) / 60_000);
    const trades = store.column(p, "trades");
    const last = store.column(p, "last");
    const pairs = store.column(p, "pairs");
    expect([trades[k(m0)], trades[k(SWITCH_HOUR)]]).toEqual([3, 1]);
    // In the minute before the switch hour: the latest price is the second file's.
    expect(last[k(m0)]).toBe(12);
    // 11 (B, the first file's last) then 12 (A, the second file's first) 0.5 s apart: one pair across files.
    expect(pairs[k(m0)]).toBe(1);
    expect(store.column(p, "pairGap")[k(m0)]).toBeCloseTo(1 / 11.5, 15);
    const outOfOrder = new Map([
      [
        keyOf(H0, "node_fills"),
        `${t(1, { time: SWITCH_HOUR - 100, tid: 1 })}\n`,
      ],
      [
        keyOf(SWITCH_HOUR, "node_fills"),
        `${t(2, { time: SWITCH_HOUR - 200, tid: 2 })}\n`,
      ],
    ]);
    await expect(run((await built(outOfOrder)).input)).rejects.toThrow(
      "files out of time order need a ruling",
    );
  });
});

describe("the units", { timeout: 60_000 }, () => {
  const many = () =>
    new Map([
      [
        keyOf(H0, "node_fills"),
        `${Array.from({ length: 40 }, (_, i) =>
          trade(addr(1 + i), addr(100 + i), {
            coin: COINS[i % 5]!,
            side: "B",
            time: H0 + i * 1_000,
            tid: i + 1,
          }),
        )
          .flat()
          .join("\n")}\n`,
      ],
      [
        keyOf(SWITCH_HOUR, "node_fills"),
        `${t(9, { time: SWITCH_HOUR, tid: 99 })}\n`,
      ],
    ]);
  const filesOf = (dir: string) => {
    const m = JSON.parse(
      readFileSync(path.join(dir, "manifest.json"), "utf8"),
    ) as {
      partitions: {
        table: string;
        key: string;
        month: string;
        files: Record<string, { sha256: string }>;
      }[];
    };
    return m.partitions.map((p) => [
      partitionDir(p.table as "fills", p.key, p.month),
      p.files,
    ]);
  };

  it("stopped between units and resumed, give the unbroken store, file for file", async () => {
    const a = await built(many());
    await run(a.input);
    const b = await built(many());
    await expect(run({ ...b.input, budget: after(3) })).rejects.toThrow(
      NotFinished,
    );
    await expect(run({ ...b.input, budget: after(2) })).rejects.toThrow(
      "the merge stopped: its minutes are spent",
    );
    await run(b.input);
    expect(filesOf(b.dir)).toEqual(filesOf(a.dir));
  });

  it("run a group above the unit size bucket by bucket, the same store; refuse a bucket above it", async () => {
    const a = await built(many());
    await run(a.input);
    const b = await built(many(), { unitRows: 2 });
    await run(b.input);
    expect(filesOf(b.dir)).toEqual(filesOf(a.dir));
    const big = new Map([
      [
        keyOf(H0, "node_fills"),
        `${[1, 2, 3].map((i) => t(1, { time: H0 + i, tid: i })).join("\n")}\n`,
      ],
    ]);
    await expect(
      run((await built(big, { unitRows: 2 })).input),
    ).rejects.toThrow("3 rows, more than the 2 a unit was measured at");
  });
});

describe("the store", { timeout: 60_000 }, () => {
  it("holds every file to the manifest: a changed one is refused", async () => {
    const b = await built(
      new Map([[keyOf(H0, "node_fills"), `${t(1, { time: H0, tid: 1 })}\n`]]),
    );
    await run(b.input);
    const store = openStore(b.dir, [path.dirname(b.dir)]);
    const p = store.partition("fills", bucketKey(1), "2025-07")!;
    const f = path.join(
      b.dir,
      ...partitionDir("fills", p.key, p.month).split("/"),
      "px.f64",
    );
    writeFileSync(f, Buffer.alloc(8));
    expect(() => store.column(p, "px")).toThrow(StoreError);
    expect(() => store.column(p, "px")).toThrow("differs from the manifest");
    expect(() =>
      openStore(b.dir, [mkdtempSync(path.join(tmpdir(), "x-"))]),
    ).toThrow("outside the run's folders");
  });
});
