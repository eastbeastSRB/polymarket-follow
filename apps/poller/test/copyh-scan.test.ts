/**
 * One raw file through COPY-H's boundary (src/copyh/scan.ts; rules.md C3):
 * made-up records in both formats; every class (kept, spot, builder dex,
 * outcome, before and after the range's time, failing, a value beyond 15
 * significant digits among them), each record in exactly one; the 2025-07-27 switch hour's two files; ADL,
 * Settlement and "Liquidated …" kept; the vault accounts; the coins' first,
 * last and Settlement times; the slow path and `misread`; a `dir` or coin
 * outside its list stopping a build and counted by a counting run; the
 * records by hour and minute, the holes of the union of files' records
 * (holes.ts) and the block runs.
 */
import { describe, expect, it } from "vitest";
import { holesOf } from "../src/copyh/holes.js";
import { scanFile, type Lists, type Scan } from "../src/copyh/scan.js";
import { Writers } from "../src/copyh/writers.js";
import { HOUR_MS } from "../src/schedule.js";
import {
  LISTS,
  addr,
  byBlock,
  keyOf,
  lz4Of,
  record,
  trade,
} from "./copyh-world.js";

const T = Date.parse("2025-09-15T13:00:00Z");
const range = { start: T - HOUR_MS, end: T + HOUR_MS };
const scan = (
  text: string,
  format: "node_fills" | "node_fills_by_block" = "node_fills_by_block",
  lists: Lists = LISTS,
  writers = new Writers(),
) => ({
  writers,
  scan: scanFile(lz4Of(text), {
    key: keyOf(T, format),
    format,
    ...range,
    lists,
    sink: writers,
  }),
});
const sumClasses = (s: Scan) =>
  Object.values(s.classes).reduce((a, b) => a + b, 0);

describe("the classes", { timeout: 60_000 }, () => {
  it("put every record of a block line in exactly one class", () => {
    const text = `${byBlock(7, [
      ...trade(addr(1), addr(2), { coin: "BTC", side: "B", time: T, tid: 1 }),
      record(addr(3), {
        coin: "@107",
        side: "A",
        time: T + 1,
        crossed: true,
        tid: 2,
      }),
      record(addr(3), {
        coin: "PURR/USDC",
        side: "A",
        time: T + 2,
        crossed: true,
        tid: 3,
      }),
      record(addr(4), {
        coin: "xyz:TSLA",
        side: "B",
        time: T + 3,
        crossed: false,
        tid: 4,
      }),
      record(addr(5), {
        coin: "SOL",
        side: "B",
        time: T + 4,
        crossed: true,
        tid: 5,
        dir: "Split Outcome",
      }),
      record(addr(5), {
        coin: "SOL",
        side: "B",
        time: range.start - 1,
        crossed: true,
        tid: 6,
      }),
      record(addr(5), {
        coin: "SOL",
        side: "B",
        time: range.end,
        crossed: true,
        tid: 7,
      }),
      record(addr(6), {
        coin: "SOL",
        side: "B",
        time: T + 5,
        crossed: true,
        tid: 8,
        sz: "1.0000000000000001",
      }),
      record(addr(6), {
        coin: "SOL",
        side: "C" as "A",
        time: T + 6,
        crossed: true,
        tid: 9,
      }),
    ])}\n`;
    const { scan: s, writers } = scan(text);
    expect(s.classes).toEqual({
      kept: 2,
      spot: 2,
      builder: 1,
      outcome: 1,
      early: 1,
      late: 1,
      failed: 2,
      unknownDir: 0,
      unknownCoin: 0,
    });
    expect(s.seen).toBe(10);
    expect(sumClasses(s)).toBe(s.seen);
    expect(writers.groups.reduce((n, g) => n + g.time.length, 0)).toBe(2);
    expect(s.misread).toBe(0);
  });

  it("read node_fills' one record a line, and keep ADL, Settlement and Liquidated records", () => {
    const lines = [
      record(addr(1), {
        coin: "ETH",
        side: "A",
        time: T,
        crossed: true,
        tid: 1,
        dir: "Auto-Deleveraging",
      }),
      record(addr(2), {
        coin: "ETH",
        side: "B",
        time: T,
        crossed: false,
        tid: 1,
        dir: "Auto-Deleveraging",
      }),
      record(addr(3), {
        coin: "HYPE",
        side: "B",
        time: T + 10,
        crossed: true,
        tid: 2,
        dir: "Settlement",
      }),
      record(addr(4), {
        coin: "HYPE",
        side: "A",
        time: T + 20,
        crossed: true,
        tid: 3,
        dir: "Liquidated Cross Long",
        startPosition: "2.0",
        liquidation: { liquidatedUser: addr(4), markPx: "9", method: "market" },
      }),
    ];
    const { scan: s } = scan(`${lines.join("\n")}\n`, "node_fills");
    expect(s.classes.kept).toBe(4);
    expect(s.dirs).toEqual(
      new Map([
        ["Auto-Deleveraging", 2],
        ["Settlement", 1],
        ["Liquidated Cross Long", 1],
      ]),
    );
    expect(s.takers).toEqual(
      new Map([
        ["Auto-Deleveraging|", 1],
        ["Settlement|", 1],
        ["Liquidated Cross Long|market", 1],
      ]),
    );
    // HYPE (iid 3): its first and last kept times and its first Settlement.
    expect(s.coins.get(3)).toEqual([2, T + 10, T + 20, T + 10]);
    expect(s.coins.get(1)).toEqual([2, T, T, -1]);
  });

  it("name the accounts with a kept vault record", () => {
    const { scan: s } = scan(
      `${byBlock(1, [
        record(addr(9), {
          coin: "BTC",
          side: "B",
          time: T,
          crossed: false,
          tid: 1,
          dir: "Net Child Vaults",
        }),
        record(addr(8), {
          coin: "@1",
          side: "B",
          time: T,
          crossed: false,
          tid: 2,
          dir: "Net Child Vaults",
        }),
      ])}\n`,
    );
    expect([...s.vaults]).toEqual([addr(9)]);
  });
});

describe("the lists", { timeout: 60_000 }, () => {
  const unknown = `${byBlock(1, [
    record(addr(1), {
      coin: "BTC",
      side: "B",
      time: T,
      crossed: true,
      tid: 1,
      dir: "Merge Question",
    }),
    record(addr(1), {
      coin: "NEWCOIN",
      side: "B",
      time: T,
      crossed: true,
      tid: 2,
    }),
  ])}\n`;

  it("stop a build at a dir or a coin outside their lists", () => {
    expect(() => scan(unknown)).toThrow(
      'the dir "Merge Question" is not in dirs.json: a ruling gives it its kind',
    );
    const coinOnly = `${byBlock(1, [
      record(addr(1), {
        coin: "NEWCOIN",
        side: "B",
        time: T,
        crossed: true,
        tid: 2,
      }),
    ])}\n`;
    expect(() => scan(coinOnly)).toThrow(
      'the coin "NEWCOIN" is not in coins.json',
    );
  });

  it("count them in a counting run, every value counted, and before dirs.json every dir a trade's", () => {
    const { scan: s } = scan(unknown, "node_fills_by_block", {
      ...LISTS,
      counting: true,
    });
    expect([s.classes.unknownDir, s.classes.unknownCoin]).toEqual([1, 1]);
    expect(s.unknownDirs).toEqual(new Map([["Merge Question", 1]]));
    expect(s.unknownCoins).toEqual(new Map([["NEWCOIN", 1]]));
    const before = scan(unknown, "node_fills_by_block", {
      iids: LISTS.iids,
      kinds: null,
      counting: true,
    }).scan;
    expect([
      before.classes.kept,
      before.classes.unknownDir,
      before.classes.unknownCoin,
    ]).toEqual([1, 0, 1]);
    expect(before.dirs).toEqual(
      new Map([
        ["Merge Question", 1],
        ["Open Long", 1],
      ]),
    );
  });
});

describe("the slow path", { timeout: 60_000 }, () => {
  it("parses whole a record whose fill does not open with its coin, or whose fields the cut cannot settle, and a line that does not tile", () => {
    const odd = `["${addr(1)}",{"px":"151","coin":"SOL","sz":"1.0","side":"B","time":${T},"startPosition":"0.0","dir":"Open Long","closedPnl":"0.0","hash":"0x00","oid":7,"crossed":true,"fee":"0.0068","tid":5,"feeToken":"USDC"}]`;
    const nullFee = record(addr(2), {
      coin: "SOL",
      side: "A",
      time: T,
      crossed: false,
      tid: 5,
    }).replace('"fee":"0.009"', '"fee":null');
    const { scan: s, writers } = scan(`${byBlock(3, [odd, nullFee])}\n`);
    expect([s.slowRecords, s.classes.kept, s.classes.failed]).toEqual([
      2, 2, 0,
    ]);
    expect(writers.groups.flatMap((g) => g.time)).toEqual([T, T]);
    const spaced = `{"block_number":4,"events":[ ${record(addr(3), { coin: "BTC", side: "B", time: T, crossed: true, tid: 6 })}]}`;
    const t2 = scan(`${spaced}\n`);
    expect([t2.scan.slowLines, t2.scan.classes.kept, t2.scan.runs]).toEqual([
      1,
      1,
      [[4, 4]],
    ]);
  });

  it("counts a line that does not parse as its records failing, one when none can be counted", () => {
    const good = record(addr(1), {
      coin: "BTC",
      side: "B",
      time: T,
      crossed: true,
      tid: 1,
    });
    const broken = `{"block_number":5,"events":[${good},${good.slice(0, -3)}`;
    const { scan: s } = scan(`${broken}\nnot json at all\n`);
    expect(s.classes.failed).toBe(2 + 1);
    expect(s.seen).toBe(3);
  });
});

describe("the times", { timeout: 60_000 }, () => {
  it("count records by hour and minute, give the holes of 60 s or more, and the block runs", () => {
    const at = (t: number, tid: number, coin = "BTC") =>
      record(addr(1), { coin, side: "B", time: t, crossed: true, tid });
    const { scan: s } = scan(
      `${[
        byBlock(10, [at(T - 10_000, 1)]),
        byBlock(11, [at(T + 50_000, 2, "@3")]),
        byBlock(12, [at(T + 109_999, 3)]),
        byBlock(14, [at(T + 170_000, 4)]),
      ].join("\n")}\n`,
    );
    expect(s.byHour).toEqual(
      new Map([
        [T - HOUR_MS, 1],
        [T, 3],
      ]),
    );
    const m = T / 60_000;
    expect(s.minutes).toEqual([
      [m - 1, T - 10_000, T - 10_000],
      [m, T + 50_000, T + 50_000],
      [m + 1, T + 109_999, T + 109_999],
      [m + 2, T + 170_000, T + 170_000],
    ]);
    // 60,000 ms is a hole, 59,999 is not; the window's ends bound the first and last.
    expect(holesOf([s.minutes], range.start, range.end)).toEqual([
      [range.start, T - 10_000],
      [T - 10_000, T + 50_000],
      [T + 109_999, T + 170_000],
      [T + 170_000, range.end],
    ]);
    expect(s.runs).toEqual([
      [10, 12],
      [14, 14],
    ]);
  });
});

describe("the holes", { timeout: 60_000 }, () => {
  const H = Date.parse("2025-07-27T08:00:00Z");
  const span = (t: number, ...more: number[]): [number, number, number] => [
    Math.floor(t / 60_000),
    Math.min(t, ...more),
    Math.max(t, ...more),
  ];
  it("are the union's: a gap between two files counts, one file's records fill another's gap", () => {
    // The switch hour's two files: node_fills to 08:45:48.664, by_block from 08:50:10.273.
    const a = [span(H), span(H + 45 * 60_000 + 48_664)];
    const b = [span(H + 50 * 60_000 + 10_273), span(H + 3_599_000)];
    expect(holesOf([a, b], H, H + 3_600_000)).toEqual([
      [H, H + 45 * 60_000 + 48_664],
      [H + 45 * 60_000 + 48_664, H + 50 * 60_000 + 10_273],
      [H + 50 * 60_000 + 10_273, H + 3_599_000],
    ]);
    // A third file whose records fall in those gaps, 20 and 40 s apart, leaves none.
    const c = Array.from({ length: 60 }, (_, k) =>
      span(H + k * 60_000 + 10_000, H + k * 60_000 + 50_000),
    );
    expect(holesOf([a, b, c], H, H + 3_600_000)).toEqual([]);
  });
  it("read a minute's first and last time, whatever the files' order or the records' order in them", () => {
    const x = [span(H + 70_000, H + 61_000, H + 119_000)];
    const y = [span(H + 1_000), span(H + 190_000)];
    for (const files of [
      [x, y],
      [y, x],
    ])
      expect(holesOf(files, H, H + 200_000)).toEqual([
        [H + 1_000, H + 61_000],
        [H + 119_000, H + 190_000],
      ]);
  });
  it("leave out the minutes outside the window", () => {
    const files = [[span(H - 30_000), span(H + 10_000), span(H + 200_000)]];
    expect(holesOf(files, H, H + 120_000)).toEqual([[H + 10_000, H + 120_000]]);
    expect(holesOf([], H, H + 59_999)).toEqual([]);
    expect(holesOf([], H, H + 60_000)).toEqual([[H, H + 60_000]]);
  });
});
