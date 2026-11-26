/**
 * The counting pass (src/copyh/pass.ts in "count" mode, count.ts; rules.md
 * C15 (c) 1, the supervisor's answer 2): each file's scan written alone,
 * resumed from whole count files of the same input, code and lists; with no
 * `dirs.json`, every `dir` counted as written; a `dir` or coin outside the
 * lists counted, never a stop; the totals: classes, `dir` values with their
 * counts, takers by `dir` and method, values outside the lists, the coins
 * (their first and last times and first Settlement across files), the vault
 * accounts, the records by day and the holes.
 */
import { existsSync, mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { countsOf } from "../src/copyh/count.js";
import {
  countFile,
  readCountFile,
  runPass,
  type FileTask,
  type PassLists,
} from "../src/copyh/pass.js";
import { HOUR_MS } from "../src/schedule.js";
import {
  COINS,
  DIRS,
  addr,
  byBlock,
  keyOf,
  makeStore,
  record,
  trade,
} from "./copyh-world.js";

const T = Date.parse("2025-09-15T13:00:00Z");
const never = { stop: () => null };
const window = { start: T, end: T + 2 * HOUR_MS };
const NO_DIRS: PassLists = {
  iids: COINS.map((c, i) => [c, i] as const),
  kinds: null,
  hashes: { coins: "c1", dirs: "none" },
};

function world() {
  const files = new Map([
    [
      keyOf(T),
      `${byBlock(1, [
        ...trade(addr(1), addr(2), {
          coin: "BTC",
          side: "B",
          time: T + 5,
          tid: 1,
        }),
        record(addr(3), {
          coin: "NEWCOIN",
          side: "A",
          time: T + 6,
          crossed: true,
          tid: 2,
        }),
        record(addr(3), {
          coin: "@1",
          side: "A",
          time: T + 7,
          crossed: true,
          tid: 3,
        }),
        record(addr(4), {
          coin: "xyz:A",
          side: "B",
          time: T + 8,
          crossed: false,
          tid: 4,
        }),
        record(addr(5), {
          coin: "ETH",
          side: "B",
          time: T + 9,
          crossed: true,
          tid: 5,
          dir: "Weird Dir",
        }),
        record(addr(6), {
          coin: "SOL",
          side: "B",
          time: T - 1,
          crossed: true,
          tid: 6,
        }),
      ])}\n`,
    ],
    [
      keyOf(T + HOUR_MS),
      `${byBlock(2, [
        record(addr(7), {
          coin: "HYPE",
          side: "A",
          time: T + HOUR_MS + 120_000,
          crossed: false,
          tid: 7,
          dir: "Settlement",
        }),
        record(addr(8), {
          coin: "HYPE",
          side: "B",
          time: T + HOUR_MS + 130_000,
          crossed: true,
          tid: 8,
          dir: "Net Child Vaults",
        }),
      ])}\n`,
    ],
  ]);
  return worldOf(files);
}

/** A raw store of these files (text by key), and their tasks in order. */
function worldOf(files: ReadonlyMap<string, string>) {
  const s = makeStore(files);
  const tasks: FileTask[] = [...files.keys()].map((key, index) => ({
    index,
    key,
    sha256: s.list.get(key)!,
  }));
  return { s, tasks };
}

const count = async (
  w: ReturnType<typeof world>,
  dir: string,
  lists: PassLists,
) =>
  runPass({
    store: w.s.store,
    parts: dir,
    mode: "count",
    files: w.tasks,
    ...window,
    code: "code-a",
    lists,
    workers: 0,
    roots: [w.s.root],
    budget: never,
    log: () => {},
  });

describe("the counting pass", { timeout: 60_000 }, () => {
  it("writes each file's scan alone, no part, and resumes from whole count files of the same lists", async () => {
    const w = world();
    const dir = mkdtempSync(path.join(tmpdir(), "copyh-counts-"));
    const first = await count(w, dir, NO_DIRS);
    expect([first.extracted, first.skipped]).toEqual([2, 0]);
    expect(readdirSync(dir).sort()).toEqual(["0.json", "1.json"]);
    expect(existsSync(path.join(dir, "0.part"))).toBe(false);
    const again = await count(w, dir, NO_DIRS);
    expect([again.extracted, again.skipped]).toEqual([0, 2]);
    // Other lists: every file read again.
    const withDirs = await count(w, dir, {
      ...NO_DIRS,
      kinds: DIRS,
      hashes: { coins: "c1", dirs: "d1" },
    });
    expect([withDirs.extracted, withDirs.skipped]).toEqual([2, 0]);
    expect(readCountFile(countFile(dir, 0))!.lists).toEqual({
      coins: "c1",
      dirs: "d1",
    });
  });

  it("counts every dir as written without dirs.json, and a value outside the lists without stopping", async () => {
    const w = world();
    const dir = mkdtempSync(path.join(tmpdir(), "copyh-counts-"));
    await count(w, dir, NO_DIRS);
    const files = w.tasks.map((t) => readCountFile(countFile(dir, t.index))!);
    const c = countsOf(files, window);
    expect(c.classes).toEqual({
      kept: 5,
      spot: 1,
      builder: 1,
      outcome: 0,
      early: 1,
      late: 0,
      failed: 0,
      unknownDir: 0,
      unknownCoin: 1,
    });
    expect(c.seen).toBe(9);
    expect(c.dirs).toEqual([
      ["Net Child Vaults", 1],
      ["Open Long", 3],
      ["Settlement", 1],
      ["Weird Dir", 1],
    ]);
    expect(c.takers).toEqual([
      ["Net Child Vaults|", 1],
      ["Open Long|", 2],
      ["Weird Dir|", 1],
    ]);
    expect(c.unknownCoins).toEqual([["NEWCOIN", 1]]);
    // Without dirs.json no record is of kind vault: the vault accounts come with the list.
    expect(c.vaults).toEqual([]);
    expect(c.coins).toEqual([
      [0, 2, T + 5, T + 5, -1],
      [1, 1, T + 9, T + 9, -1],
      [
        3,
        2,
        T + HOUR_MS + 120_000,
        T + HOUR_MS + 130_000,
        T + HOUR_MS + 120_000,
      ],
    ]);
    expect(c.days).toEqual([["2025-09-15", 9]]);
    expect(c.holes).toEqual([
      [T + 9, T + HOUR_MS + 120_000],
      [T + HOUR_MS + 130_000, window.end],
    ]);
    // With dirs.json: the unknown dir counted apart, the vault's account found.
    const dir2 = mkdtempSync(path.join(tmpdir(), "copyh-counts-"));
    await count(w, dir2, {
      ...NO_DIRS,
      kinds: DIRS,
      hashes: { coins: "c1", dirs: "d1" },
    });
    const c2 = countsOf(
      w.tasks.map((t) => readCountFile(countFile(dir2, t.index))!),
      window,
    );
    expect(c2.unknownDirs).toEqual([["Weird Dir", 1]]);
    expect([c2.classes.kept, c2.classes.unknownDir]).toEqual([4, 1]);
    expect(c2.vaults).toEqual([addr(8)]);
  });

  it("takes a coin's first time, last time and first Settlement across files", async () => {
    const btc = (time: number, tid: number) =>
      record(addr(1), { coin: "BTC", side: "B", time, crossed: true, tid });
    const settle = (time: number, tid: number) =>
      record(addr(2), {
        coin: "HYPE",
        side: "A",
        time,
        crossed: false,
        tid,
        dir: "Settlement",
      });
    const w = worldOf(
      new Map([
        [keyOf(T), `${byBlock(1, [btc(T + 5, 1), settle(T + 10, 2)])}\n`],
        [
          keyOf(T + HOUR_MS),
          `${byBlock(2, [btc(T + HOUR_MS + 7, 3), settle(T + HOUR_MS + 10, 4)])}\n`,
        ],
      ]),
    );
    const dir = mkdtempSync(path.join(tmpdir(), "copyh-counts-"));
    await count(w, dir, NO_DIRS);
    const c = countsOf(
      w.tasks.map((t) => readCountFile(countFile(dir, t.index))!),
      window,
    );
    expect(c.coins).toEqual([
      [0, 2, T + 5, T + HOUR_MS + 7, -1],
      [3, 2, T + 10, T + HOUR_MS + 10, T + 10],
    ]);
  });
});
