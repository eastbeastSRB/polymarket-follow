/**
 * The merge and the store (src/copyh/merge.ts, store.ts; rules.md C3): the
 * fills by bucket and month, rows by (account, time), ties in the pass's
 * order, every kept row conserved, each month's rows in its own partition;
 * the switch hour's record in both formats kept once (a taker of no market
 * trade too), a market taker twice stopping the merge, and any other record
 * met twice stopping it, not a self-trade's two records or two tids apart in
 * their high half; a trade split across two files paired, its maker taking
 * the taker's reading, whichever file holds the taker; the bars added across
 * files, the last price the latest, a pair across files, files out of time
 * order stopping; a coin's counts across files; names outgrowing their
 * columns, other parts, code, lists or files refused; a merge stopped between
 * units and resumed equal to an unbroken one, a budget spent before the
 * dictionaries building none; a group above the unit size run bucket by
 * bucket, and a bucket above it run whole, the same store; the store read
 * back, a changed file and a junction leading out refused.
 */
import {
  cpSync,
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  rmdirSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
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
async function built(
  files: Map<string, string>,
  o: Partial<MergeInput> = {},
  range = RANGE,
  lists = LISTS,
) {
  const s = makeStore(files);
  const tasks: FileTask[] = [...files.keys()].map((key, index) => ({
    index,
    key,
    sha256: s.list.get(key)!,
  }));
  const parts = mkdtempSync(path.join(tmpdir(), "copyh-mparts-"));
  const passInto = (code: string) =>
    runPass({
      store: s.store,
      parts,
      files: tasks,
      start: range.start,
      end: range.end,
      code,
      lists,
      workers: 0,
      roots: [s.root],
      budget: never,
      log: () => {},
    });
  await passInto("code-a");
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
    range: { ...range, fill: tasks.map((t) => t.key) },
    list: { name: "test", sha256: sha256("list") },
    budget: never,
    unitRows: 1_000_000,
    log: () => {},
    ...o,
  };
  return { s, tasks, parts, dir, input, passInto };
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
    expect(m.counts.merge).toEqual({
      in: 5,
      out: 5,
      duplicates: 0,
      byFile: [],
    });
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
    expect(m.counts.merge).toEqual({
      in: 2,
      out: 1,
      duplicates: 1,
      byFile: [[1, 1]],
    });
    const taker = t(3, { time: SWITCH_HOUR + 10, tid: 9 });
    const twice = new Map([
      [keyOf(SWITCH_HOUR, "node_fills"), `${taker}\n`],
      [keyOf(SWITCH_HOUR, "node_fills_by_block"), `${byBlock(1, [taker])}\n`],
    ]);
    await expect(run((await built(twice)).input)).rejects.toThrow(
      "a market taker twice (file 1, 2025-07-27T08:00:00.010Z): its bars would count it twice",
    );
  });

  it("stops on any other record met twice: in one file, in two files outside the switch hour, a third time", async () => {
    const outside = "a record twice outside the switch hour's two files";
    const maker = t(3, { time: H0 + 10, tid: 9, crossed: false });
    const one = new Map([[keyOf(H0, "node_fills"), `${maker}\n${maker}\n`]]);
    await expect(run((await built(one)).input)).rejects.toThrow(
      `${outside} (file 0, 2025-07-27T07:00:00.010Z): a ruling`,
    );
    const late = t(3, {
      time: SWITCH_HOUR + HOUR_MS + 10,
      tid: 9,
      crossed: false,
    });
    const two = new Map([
      [keyOf(SWITCH_HOUR, "node_fills_by_block"), `${byBlock(1, [late])}\n`],
      [
        keyOf(SWITCH_HOUR + HOUR_MS, "node_fills_by_block"),
        `${byBlock(2, [late])}\n`,
      ],
    ]);
    await expect(run((await built(two)).input)).rejects.toThrow(
      `${outside} (file 1, 2025-07-27T09:00:00.010Z): a ruling`,
    );
    const both = t(3, { time: SWITCH_HOUR + 10, tid: 9, crossed: false });
    const three = new Map([
      [keyOf(SWITCH_HOUR, "node_fills"), `${both}\n`],
      [
        keyOf(SWITCH_HOUR, "node_fills_by_block"),
        `${byBlock(1, [both, both])}\n`,
      ],
    ]);
    await expect(run((await built(three)).input)).rejects.toThrow(
      `${outside} (file 1, 2025-07-27T08:00:00.010Z): a ruling`,
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

  it("pairs a trade whose taker is in the later file: the maker takes the taker's reading", async () => {
    const backstop = {
      liquidatedUser: addr(6),
      markPx: "1",
      method: "backstop",
    };
    const files = new Map([
      [
        keyOf(H0, "node_fills"),
        `${t(5, { time: SWITCH_HOUR - 1, tid: 7, crossed: false })}\n`,
      ],
      [
        keyOf(SWITCH_HOUR, "node_fills"),
        `${t(4, { time: SWITCH_HOUR - 1, tid: 7, side: "A", liquidation: backstop })}\n`,
      ],
    ]);
    const b = await built(files);
    const m = await run(b.input);
    expect([m.counts.straddles, m.counts.unpaired]).toEqual([1, []]);
    const store = openStore(b.dir, [path.dirname(b.dir)]);
    const flags = store.column(
      store.partition("fills", bucketKey(5), "2025-07")!,
      "flags",
    )[0]!;
    expect([flags & MARKET, flags & TAKER]).toEqual([0, 0]);
  });

  it("stops on a record of the switch hour's first file met again in a file after its second", async () => {
    const maker = t(3, { time: SWITCH_HOUR + 10, tid: 9, crossed: false });
    const files = new Map([
      [keyOf(SWITCH_HOUR, "node_fills"), `${maker}\n`],
      [
        keyOf(SWITCH_HOUR, "node_fills_by_block"),
        `${byBlock(1, [t(4, { time: SWITCH_HOUR + 20, tid: 10, crossed: false })])}\n`,
      ],
      [
        keyOf(SWITCH_HOUR + HOUR_MS, "node_fills_by_block"),
        `${byBlock(2, [maker])}\n`,
      ],
    ]);
    await expect(run((await built(files)).input)).rejects.toThrow(
      "a record twice outside the switch hour's two files (file 2, 2025-07-27T08:00:00.010Z): a ruling",
    );
  });

  it("keeps a repeated taker of the switch hour that is no market trade once, counted", async () => {
    const adl = t(3, {
      time: SWITCH_HOUR + 10,
      tid: 9,
      side: "A",
      dir: "Auto-Deleveraging",
    });
    const files = new Map([
      [keyOf(SWITCH_HOUR, "node_fills"), `${adl}\n`],
      [keyOf(SWITCH_HOUR, "node_fills_by_block"), `${byBlock(1, [adl])}\n`],
    ]);
    const m = await run((await built(files)).input);
    expect(m.counts.merge).toEqual({
      in: 2,
      out: 1,
      duplicates: 1,
      byFile: [[1, 1]],
    });
  });

  it("keeps an account's two records of one trade (a self-trade), and two records whose tids differ in their high half alone", async () => {
    const self = trade(addr(3), addr(3), {
      coin: "SOL",
      side: "B",
      time: H0 + 100,
      tid: 9,
    });
    const halves = [
      t(4, { time: H0 + 200, tid: 5, crossed: false }),
      t(4, { time: H0 + 200, tid: 2 ** 32 + 5, crossed: false }),
    ];
    const b = await built(
      new Map([
        [keyOf(H0, "node_fills"), `${[...self, ...halves].join("\n")}\n`],
      ]),
    );
    const m = await run(b.input);
    expect(m.counts.merge).toEqual({
      in: 4,
      out: 4,
      duplicates: 0,
      byFile: [],
    });
    const store = openStore(b.dir, [path.dirname(b.dir)]);
    expect(store.partition("fills", bucketKey(3), "2025-07")!.rows).toBe(2);
    // Two u32s a row, the low half then the high: 5, then 2^32 + 5.
    const p = store.partition("fills", bucketKey(4), "2025-07")!;
    expect([...store.column(p, "tid")]).toEqual([5, 0, 5, 1]);
  });

  it("writes each month's rows in its own partition, a record on the month's first instant in that month", async () => {
    const at = (iso: string) => Date.parse(iso);
    const start = at("2025-07-31T22:00:00Z");
    const end = at("2025-08-01T02:00:00Z");
    const range = { ...RANGE, start, end, months: monthsOf(start, end) };
    const b = await built(
      new Map([
        [
          keyOf(start),
          `${byBlock(1, [t(1, { time: at("2025-07-31T22:30:00Z"), tid: 1 })])}\n`,
        ],
        // The month's last hour holds a record of the next month's first second, of the same bucket group.
        [
          keyOf(at("2025-07-31T23:00:00Z")),
          `${byBlock(2, [t(2, { time: at("2025-07-31T23:59:59.999Z"), tid: 2 }), t(5, { time: at("2025-08-01T00:00:00.500Z"), tid: 5, coin: "ETH" })])}\n`,
        ],
        // A file whose one record is the month's first instant.
        [
          keyOf(at("2025-08-01T00:00:00Z")),
          `${byBlock(3, [t(3, { time: at("2025-08-01T00:00:00.000Z"), tid: 3 })])}\n`,
        ],
        [
          keyOf(at("2025-08-01T01:00:00Z")),
          `${byBlock(4, [t(4, { time: at("2025-08-01T01:15:00Z"), tid: 4 })])}\n`,
        ],
      ]),
      {},
      range,
    );
    const m = await run(b.input);
    expect(m.counts.merge).toEqual({
      in: 5,
      out: 5,
      duplicates: 0,
      byFile: [],
    });
    const store = openStore(b.dir, [path.dirname(b.dir)]);
    const rows = (user: number, month: string) =>
      store.partition("fills", bucketKey(user), month)?.rows ?? null;
    expect([1, 2, 3, 4, 5].map((u) => rows(u, "2025-07"))).toEqual([
      1,
      1,
      null,
      null,
      null,
    ]);
    expect([1, 2, 3, 4, 5].map((u) => rows(u, "2025-08"))).toEqual([
      null,
      null,
      1,
      1,
      1,
    ]);
    // SOL's bars, each month from its first minute in the range: 22:30 and 23:59; then 00:00 and 01:15.
    const july = store.partition("bars", coinKey(2), "2025-07")!;
    const august = store.partition("bars", coinKey(2), "2025-08")!;
    expect([july.start, july.rows, august.start, august.rows]).toEqual([
      start,
      120,
      at("2025-08-01T00:00:00Z"),
      120,
    ]);
    const jt = store.column(july, "trades");
    const atr = store.column(august, "trades");
    expect([jt[30], jt[119], atr[0], atr[75]]).toEqual([1, 1, 1, 1]);
  });

  it("sums a coin's counts across files: its first time, last time and first Settlement", async () => {
    const settle = (time: number, tid: number) =>
      t(2, { coin: "HYPE", time, tid, crossed: false, dir: "Settlement" });
    const files = new Map([
      [
        keyOf(H0, "node_fills"),
        `${[t(1, { time: H0 + 100, tid: 1 }), settle(H0 + 200, 2)].join("\n")}\n`,
      ],
      [
        keyOf(SWITCH_HOUR, "node_fills"),
        `${[t(1, { time: SWITCH_HOUR + 100, tid: 3 }), settle(SWITCH_HOUR + 200, 4)].join("\n")}\n`,
      ],
    ]);
    const m = await run((await built(files)).input);
    expect(m.counts.coins).toEqual([
      [2, 2, H0 + 100, SWITCH_HOUR + 100, -1],
      [3, 2, H0 + 200, SWITCH_HOUR + 200, H0 + 200],
    ]);
  });

  it("refuses a store whose names outgrow their columns, each file's within its part's", async () => {
    const extra = Array.from({ length: 300 }, (_, i): [string, "trade"] => [
      `Extra ${i}`,
      "trade",
    ]);
    // 150 dirs a file (a part's u8 column holds at most 256), 300 in the store.
    const half = (from: number, hour: number) =>
      `${extra
        .slice(from, from + 150)
        .map(([dir], i) => t(1, { time: hour + i, tid: from + i + 1, dir }))
        .join("\n")}\n`;
    const files = new Map([
      [keyOf(H0, "node_fills"), half(0, H0)],
      [keyOf(SWITCH_HOUR, "node_fills"), half(150, SWITCH_HOUR)],
    ]);
    const b = await built(files, {}, RANGE, {
      ...LISTS,
      kinds: [...DIRS, ...extra],
    });
    await expect(run(b.input)).rejects.toThrow(
      "the store's names outgrow their columns",
    );
  });

  it("refuses a merge over other parts, and parts of other code, of other lists, of another file or missing", async () => {
    const files = new Map([
      [keyOf(H0, "node_fills"), `${t(1, { time: H0, tid: 1 })}\n`],
    ]);
    const b = await built(files);
    await run(b.input);
    await b.passInto("code-b");
    await expect(run({ ...b.input, code: "code-b" })).rejects.toThrow(
      "its merge is of other parts: move it aside",
    );
    const c = await built(files);
    const key = c.tasks[0]!.key;
    await expect(run({ ...c.input, code: "other" })).rejects.toThrow(
      "part 0 was written by other code",
    );
    await expect(
      run({ ...c.input, lists: { ...LIST_HASHES, coins: sha256("x") } }),
    ).rejects.toThrow("part 0 was read with other lists");
    await expect(
      run({
        ...c.input,
        files: c.tasks.map((x) => ({ ...x, sha256: "0".repeat(64) })),
      }),
    ).rejects.toThrow(`part 0 is not of ${key} as listed`);
    rmSync(path.join(c.parts, "0.part"));
    await expect(run(c.input)).rejects.toThrow(
      `part 0 (${key}) is missing or not whole`,
    );
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
  it("add the Settlement records' sums and the left-out takers across files", async () => {
    const m0 = SWITCH_HOUR - 60_000;
    const settle = (
      user: number,
      time: number,
      tid: number,
      crossed: boolean,
      sz: string,
    ) =>
      t(user, {
        time,
        tid,
        crossed,
        side: crossed ? "A" : "B",
        px: "4",
        sz,
        coin: "HYPE",
        dir: "Settlement",
      });
    const files = new Map([
      [
        keyOf(H0, "node_fills"),
        `${[settle(1, m0 + 10, 1, true, "1.0"), settle(2, m0 + 10, 1, false, "1.0"), t(3, { time: m0 + 20, tid: 2, coin: "HYPE", dir: "Net Child Vaults" })].join("\n")}\n`,
      ],
      [
        keyOf(SWITCH_HOUR, "node_fills"),
        `${settle(4, m0 + 30_000, 3, false, "2.5")}\n`,
      ],
    ]);
    const b = await built(files);
    await run(b.input);
    const store = openStore(b.dir, [path.dirname(b.dir)]);
    const p = store.partition("bars", coinKey(3), "2025-07")!;
    const k = Math.floor((m0 - H0) / 60_000);
    const at = (name: string) => store.column(p, name)[k];
    expect([
      at("trades"),
      at("leftSettlement"),
      at("leftVault"),
      at("settleSz"),
      at("settleNtl"),
    ]).toEqual([0, 1, 1, 4.5, 18]);
  });

  it("add the pairs and the last price across files: one side at one millisecond, 2,000 ms and 2,001, a file without the coin's market taker, the pair in its second record's minute", async () => {
    const S = SWITCH_HOUR;
    const files = new Map([
      [
        keyOf(H0, "node_fills"),
        `${[
          t(1, { coin: "BTC", px: "10", time: S - 1_000, tid: 1 }),
          t(2, { coin: "ETH", time: S - 3_000, tid: 2 }),
          t(3, { coin: "SOL", time: S - 4_001, tid: 3 }),
          t(4, { coin: "HYPE", time: S - 1_000, tid: 4 }),
          t(5, { coin: "kPEPE", side: "A", time: S - 100, tid: 5 }),
        ].join("\n")}\n`,
      ],
      [
        keyOf(S, "node_fills"),
        `${[
          t(6, { coin: "BTC", px: "11", time: S - 1_000, tid: 6 }),
          t(7, { coin: "ETH", side: "A", time: S - 1_000, tid: 7 }),
          t(8, { coin: "SOL", side: "A", time: S - 2_000, tid: 8 }),
          t(9, {
            coin: "HYPE",
            side: "A",
            time: S - 500,
            tid: 9,
            crossed: false,
            dir: "Settlement",
          }),
          t(10, { coin: "kPEPE", time: S + 400, tid: 10 }),
        ].join("\n")}\n`,
      ],
    ]);
    const b = await built(files);
    await run(b.input);
    const store = openStore(b.dir, [path.dirname(b.dir)]);
    const col = (iid: number, name: string) =>
      store.column(store.partition("bars", coinKey(iid), "2025-07")!, name);
    const k = (time: number) => Math.floor((time - H0) / 60_000);
    // BTC: one side, one millisecond, two files: no pair; the later file's price the latest.
    expect([
      col(0, "pairs")[k(S - 1_000)],
      col(0, "last")[k(S - 1_000)],
    ]).toEqual([0, 11]);
    // ETH 2,000 ms apart: a pair; SOL 2,001 ms apart: none.
    expect(col(1, "pairs")[k(S - 1_000)]).toBe(1);
    expect(col(2, "pairs")[k(S - 2_000)]).toBe(0);
    // HYPE: the second file holds no market taker of it.
    expect([...col(3, "pairs")].every((x) => x === 0)).toBe(true);
    // kPEPE: 500 ms apart across the hour, counted in the second record's minute.
    expect([col(4, "pairs")[k(S + 400)], col(4, "pairs")[k(S - 100)]]).toEqual([
      1, 0,
    ]);
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
    // A budget spent before the first unit: not even the dictionaries are built.
    const c = await built(many());
    await expect(run({ ...c.input, budget: after(0) })).rejects.toThrow(
      NotFinished,
    );
    expect(existsSync(path.join(c.dir, "merge", "dict.json"))).toBe(false);
  });

  it("run a group above the unit size bucket by bucket, the same store; a bucket above the unit size runs whole, the same store", async () => {
    const a = await built(many());
    await run(a.input);
    const b = await built(many(), { unitRows: 2 });
    await run(b.input);
    expect(filesOf(b.dir)).toEqual(filesOf(a.dir));
    // One bucket's three rows against a unit size of 2: one unit, its rows in its log line.
    const big = () =>
      new Map([
        [
          keyOf(H0, "node_fills"),
          `${[1, 2, 3].map((i) => t(1, { time: H0 + i, tid: i })).join("\n")}\n`,
        ],
      ]);
    const whole = await built(big());
    await run(whole.input);
    const cut = await built(big(), { unitRows: 2 });
    const units: object[] = [];
    await run({
      ...cut.input,
      log: (event, fields) => {
        if (event === "unit") units.push(fields);
      },
    });
    expect(filesOf(cut.dir)).toEqual(filesOf(whole.dir));
    expect(units).toContainEqual(
      expect.objectContaining({ unit: "fills-2025-07-g0-b1", rows: 3 }),
    );
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

  it("refuses a store file read through a junction that leads out of the run's folders", async () => {
    const b = await built(
      new Map([[keyOf(H0, "node_fills"), `${t(1, { time: H0, tid: 1 })}\n`]]),
    );
    await run(b.input);
    const store = openStore(b.dir, [path.dirname(b.dir)]);
    const p = store.partition("fills", bucketKey(1), "2025-07")!;
    const inside = path.join(
      b.dir,
      ...partitionDir("fills", p.key, p.month).split("/"),
    );
    const out = mkdtempSync(path.join(tmpdir(), "copyh-out-"));
    cpSync(inside, out, { recursive: true });
    rmSync(inside, { recursive: true });
    symlinkSync(out, inside, "junction");
    try {
      expect(() => store.column(p, "px")).toThrow(
        "outside the run's folders, by its real path",
      );
    } finally {
      // The junction alone, never what it leads to.
      rmdirSync(inside);
    }
  });
});
