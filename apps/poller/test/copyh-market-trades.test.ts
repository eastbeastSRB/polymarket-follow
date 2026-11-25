/**
 * Market trades and the bars (src/copyh/market-trades.ts, writers.ts;
 * rules.md C3, C9, M1): a backstop's taker and maker legs, an ADL, a
 * Settlement and a "Net Child Vaults" record on either side, a market liquidation's legs kept as
 * market trades, both records of a trade taking its taker's reading, a
 * record left unpaired keeping its own and listed, the shared `tid` of two
 * trades; the bars from market takers only, in time order, the last price
 * the latest, the opposite-side pairs within 2 s counted in the second's
 * minute, the left-out takers by cause, the Settlement records' sums on
 * either side (RM4).
 */
import { describe, expect, it } from "vitest";
import { isMarket, leftOutOf } from "../src/copyh/market-trades.js";
import { scanFile } from "../src/copyh/scan.js";
import {
  BACKSTOP,
  MARKET,
  OTHER_LIQUIDATION,
  OWN_LIQUIDATION,
  TAKER,
  UNNAMED_LIQUIDATION,
  Writers,
  bucketOf,
} from "../src/copyh/writers.js";
import { HOUR_MS } from "../src/schedule.js";
import {
  LISTS,
  addr,
  byBlock,
  keyOf,
  lz4Of,
  record,
  trade,
  type FillSpec,
} from "./copyh-world.js";

const T = Date.parse("2025-09-15T13:00:00Z");
const run = (records: string[]) => {
  const writers = new Writers();
  scanFile(lz4Of(`${byBlock(1, records)}\n`), {
    key: keyOf(T),
    format: "node_fills_by_block",
    start: T - HOUR_MS,
    end: T + HOUR_MS,
    lists: LISTS,
    sink: writers,
  });
  const done = writers.finish();
  /** Each kept row's account, flags and time, in the file's order within its group. */
  const rows = writers.groups.flatMap((g) =>
    g.time.map((t, i) => ({
      user: writers.users.list[g.user[i]!]!,
      flags: g.flags[i]!,
      time: t,
    })),
  );
  return { writers, done, rows };
};
const flagsOf = (rows: { user: string; flags: number }[], user: string) =>
  rows.filter((r) => r.user === user).map((r) => r.flags);

describe("the rule", { timeout: 60_000 }, () => {
  it("leaves out a backstop's, ADL's, Settlement's and the vault's netting's takers, in that order of causes, and nothing else", () => {
    expect(leftOutOf("backstop", "Auto-Deleveraging")).toBe("backstop");
    expect(leftOutOf("backstop", "Net Child Vaults")).toBe("backstop");
    expect(leftOutOf(null, "Auto-Deleveraging")).toBe("adl");
    expect(leftOutOf("market", "Settlement")).toBe("settlement");
    expect(leftOutOf(null, "Net Child Vaults")).toBe("vault");
    expect(leftOutOf("market", "Liquidated Cross Long")).toBeNull();
    expect(isMarket(null, "Open Long")).toBe(true);
    expect(isMarket(null, "Net Child Vaults")).toBe(false);
  });
});

describe("a trade's reading", { timeout: 60_000 }, () => {
  const liq = (user: string, method: string): FillSpec["liquidation"] => ({
    liquidatedUser: user,
    markPx: "99",
    method,
  });

  it("gives a backstop's two legs the taker's reading: no market trade, the maker's own fields aside", () => {
    // The vault's taker leg, method backstop; the liquidated account's own leg as maker.
    const { rows } = run([
      record(addr(1), {
        coin: "SOL",
        side: "A",
        time: T,
        crossed: true,
        tid: 9,
        startPosition: "0.0",
        liquidation: liq(addr(2), "backstop"),
      }),
      record(addr(2), {
        coin: "SOL",
        side: "B",
        time: T,
        crossed: false,
        tid: 9,
        dir: "Liquidated Isolated Short",
        startPosition: "-3.0",
        liquidation: liq(addr(2), "backstop"),
      }),
    ]);
    expect(flagsOf(rows, addr(1))).toEqual([
      TAKER | OTHER_LIQUIDATION | BACKSTOP,
    ]);
    expect(flagsOf(rows, addr(2))).toEqual([OWN_LIQUIDATION | BACKSTOP]);
  });

  it("gives a market liquidation's legs the market reading, and ADL's and Settlement's on either side none", () => {
    const { rows } = run([
      record(addr(1), {
        coin: "ETH",
        side: "A",
        time: T,
        crossed: true,
        tid: 1,
        dir: "Liquidated Cross Long",
        startPosition: "2.0",
        liquidation: liq(addr(1), "market"),
      }),
      record(addr(2), {
        coin: "ETH",
        side: "B",
        time: T,
        crossed: false,
        tid: 1,
        liquidation: liq(addr(1), "market"),
      }),
      // An ADL taker, its maker an ordinary order: neither is a market trade.
      record(addr(3), {
        coin: "ETH",
        side: "A",
        time: T + 1,
        crossed: true,
        tid: 2,
        dir: "Auto-Deleveraging",
      }),
      record(addr(4), {
        coin: "ETH",
        side: "B",
        time: T + 1,
        crossed: false,
        tid: 2,
      }),
      // A Settlement on the maker's side alone: the taker's reading (a market trade) stands for both.
      record(addr(5), {
        coin: "ETH",
        side: "A",
        time: T + 2,
        crossed: true,
        tid: 3,
      }),
      record(addr(6), {
        coin: "ETH",
        side: "B",
        time: T + 2,
        crossed: false,
        tid: 3,
        dir: "Settlement",
      }),
    ]);
    expect(flagsOf(rows, addr(1))).toEqual([TAKER | OWN_LIQUIDATION | MARKET]);
    expect(flagsOf(rows, addr(2))).toEqual([OTHER_LIQUIDATION | MARKET]);
    expect(flagsOf(rows, addr(3))).toEqual([TAKER]);
    expect(flagsOf(rows, addr(4))).toEqual([0]);
    expect(flagsOf(rows, addr(5))).toEqual([TAKER | MARKET]);
    expect(flagsOf(rows, addr(6))).toEqual([MARKET]);
  });

  it("keeps an unpaired record's own reading, lists it with its place, and marks a liquidation naming no account", () => {
    const { done, writers } = run([
      record(addr(7), {
        coin: "BTC",
        side: "B",
        time: T + 5,
        crossed: false,
        tid: 77,
        dir: "Settlement",
        liquidation: { markPx: "1", method: "market" },
      }),
    ]);
    const g = Math.floor(bucketOf(addr(7)) / 16);
    expect(done.unpaired).toEqual([
      {
        iid: 0,
        time: T + 5,
        tid: "77",
        group: g,
        row: 0,
        taker: false,
        market: false,
      },
    ]);
    expect(writers.groups[g]!.flags).toEqual([UNNAMED_LIQUIDATION]);
  });

  it("pairs two trades of one tid at other times as two trades, and lists a third record and two takers", () => {
    const { done } = run([
      ...trade(addr(1), addr(2), { coin: "HYPE", side: "B", time: T, tid: 5 }),
      ...trade(addr(3), addr(4), {
        coin: "HYPE",
        side: "A",
        time: T + 60_000,
        tid: 5,
      }),
      record(addr(5), {
        coin: "HYPE",
        side: "B",
        time: T + 9,
        crossed: true,
        tid: 6,
      }),
      record(addr(6), {
        coin: "HYPE",
        side: "A",
        time: T + 9,
        crossed: true,
        tid: 6,
      }),
    ]);
    expect(done.unpaired).toEqual([]);
    expect(done.odd).toEqual([`3|${T + 9}|6`]);
  });
});

describe("the bars", { timeout: 60_000 }, () => {
  const t = (
    time: number,
    side: "A" | "B",
    px: string,
    sz = "1.0",
    extra: Partial<FillSpec> = {},
  ) =>
    record(addr(1), {
      coin: "SOL",
      side,
      time,
      crossed: true,
      tid: time,
      px,
      sz,
      ...extra,
    });

  it("take market takers in time order: trades, sums, the latest price, pairs within 2 s in the second's minute", () => {
    const m = Math.floor(T / 60_000) * 60_000;
    const { done } = run([
      t(m + 59_500, "B", "101", "2.0"),
      t(m + 1_000, "A", "99"),
      t(m + 60_400, "A", "100"),
      t(m + 63_000, "B", "100.5"),
      t(m + 63_000, "B", "100.7"),
    ]);
    const [b] = done.bars;
    expect(b).toMatchObject({ iid: 2, start: m });
    expect(b!.trades).toEqual([2, 3]);
    expect(b!.sz).toEqual([3, 3]);
    expect(b!.ntl).toEqual([99 + 202, 100 + 100.5 + 100.7]);
    // Ties in time: the file's later record is the latest.
    expect([b!.lastTime, b!.last]).toEqual([
      [m + 59_500, m + 63_000],
      [101, 100.7],
    ]);
    // 99 → 101 is 58.5 s apart: no pair; 101 → 100 at 0.9 s: a pair in minute 1; 100 → 100.5 at 2.6 s: none.
    expect(b!.pairs).toEqual([0, 1]);
    expect(b!.pairGap[1]).toBeCloseTo(1 / 100.5, 15);
    expect(b!.first).toEqual([m + 1_000, 99, -1]);
    expect(b!.lastTaker).toEqual([m + 63_000, 100.7, 1]);
  });

  it("count the left-out takers by cause, not as trades", () => {
    const m = Math.floor(T / 60_000) * 60_000;
    const { done } = run([
      t(m + 1, "B", "10", "1.0", {
        liquidation: {
          liquidatedUser: addr(2),
          markPx: "1",
          method: "backstop",
        },
      }),
      t(m + 2, "B", "10", "1.0", { dir: "Auto-Deleveraging" }),
      t(m + 3, "B", "10", "1.0", { dir: "Settlement" }),
      t(m + 4, "A", "10"),
      t(m + 5, "B", "10", "1.0", { dir: "Net Child Vaults" }),
    ]);
    const [b] = done.bars;
    expect([
      b!.trades,
      b!.leftBackstop,
      b!.leftAdl,
      b!.leftSettlement,
      b!.leftVault,
    ]).toEqual([[1], [1], [1], [1], [1]]);
    expect(b!.pairs).toEqual([0]);
  });

  it("sum the Settlement records of either side, taker or not, in their minute", () => {
    const m = Math.floor(T / 60_000) * 60_000;
    const settle = (
      time: number,
      side: "A" | "B",
      crossed: boolean,
      sz: string,
    ) =>
      record(addr(crossed ? 3 : 4), {
        coin: "HYPE",
        side,
        time,
        crossed,
        tid: time,
        px: "2.5",
        sz,
        dir: "Settlement",
      });
    const { done } = run([
      settle(m + 10, "A", true, "4.0"),
      settle(m + 10, "B", false, "4.0"),
      settle(m + 61_000, "B", false, "1.5"),
      t(m + 62_000, "A", "10"),
    ]);
    // SOL's one market taker; HYPE's minutes from its Settlement records alone, no trade.
    const hype = done.bars.find((b) => b.iid === 3)!;
    expect(hype).toMatchObject({ start: m, first: null, lastTaker: null });
    expect(hype.trades).toEqual([0, 0]);
    expect(hype.leftSettlement).toEqual([1, 0]);
    expect(hype.settleSz).toEqual([8, 1.5]);
    expect(hype.settleNtl).toEqual([20, 3.75]);
    const sol = done.bars.find((b) => b.iid === 2)!;
    expect([sol.trades, sol.settleSz, sol.settleNtl]).toEqual([[1], [0], [0]]);
  });
});
