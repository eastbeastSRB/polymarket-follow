/**
 * WAVE-H's rules as pure functions, each in a synthetic world (rules.md H2–H6):
 * the record schema, the counted fill, its order, the slices, M's scan and the
 * wave inside a slice.
 */
import { describe, expect, it } from "vitest";
import { byM4 } from "../src/market1/fills.js";
import { waveEntries } from "../src/market1/waves.js";
import { coinsFrom, loadCoins } from "../src/waveh/coins.js";
import {
  countedOf,
  legKind,
  parseLine,
  parseRecord,
  rawRecords,
  type Counted,
} from "../src/waveh/fills.js";
import { SIZING_DAYS } from "../src/waveh/instants.js";
import {
  STOP_RATE,
  bySlice,
  pickM,
  scanM,
  sliceOf,
} from "../src/waveh/slices.js";

const coins = loadCoins();
const T = Date.parse("2025-07-01T12:00:00Z");
const HOUR = 3_600_000;
const addr = (n: number) => `0x${n.toString(16).padStart(40, "0")}`;

/** A liquidated account's own leg, a forced sell by a taker, unless changed. */
function fill(user: string, over: Record<string, unknown> = {}) {
  return [
    user,
    {
      coin: "SOL",
      px: "150.5",
      sz: "2.0",
      side: "A",
      time: T,
      startPosition: "2.0",
      dir: "Close Long",
      crossed: true,
      fee: "0.135",
      tid: 101,
      liquidation: { liquidatedUser: user, markPx: "150.4", method: "market" },
      ...over,
    },
  ];
}
const recOf = (raw: unknown) => {
  const r = parseRecord(raw);
  if (r === null) throw new Error("the record failed its schema");
  return r;
};

describe("a record (H2)", () => {
  it("reads both formats' lines, a tid of any size kept as its digits", () => {
    const big = JSON.stringify(fill(addr(1))).replace(
      '"tid":101',
      '"tid":123456789012345678901',
    );
    expect(recOf(parseLine(big)).fill.tid).toBe("123456789012345678901");
    // 16 digits, above 2^53 − 1: a float would read 9007199254740992.
    const above = JSON.stringify(fill(addr(1))).replace(
      '"tid":101',
      '"tid":9007199254740993',
    );
    expect(recOf(parseLine(above)).fill.tid).toBe("9007199254740993");
    // A tid that is not written in digits is refused, never read through a float.
    const exp = JSON.stringify(fill(addr(1))).replace(
      '"tid":101',
      '"tid":1e20',
    );
    expect(parseRecord(parseLine(exp))).toBeNull();
    expect(
      recOf(parseLine(JSON.stringify(fill(addr(1), { tid: 964005809299725 }))))
        .fill.tid,
    ).toBe("964005809299725");
    const line = parseLine(JSON.stringify(fill(addr(1))));
    expect(rawRecords("node_fills", line)).toEqual({
      records: [line],
      block: null,
    });
    const block = { block_number: 7, events: [fill(addr(1)), fill(addr(2))] };
    expect(rawRecords("node_fills_by_block", block)).toEqual({
      records: block.events,
      block: 7,
    });
    expect(rawRecords("node_fills_by_block", { events: [] })).toBeNull();
    expect(rawRecords("node_fills_by_block", fill(addr(1)))).toBeNull();
  });

  it("refuses what is not the schema, reads the address lower-case and keeps other keys", () => {
    const upper = `0x${"AB".repeat(20)}`;
    expect(recOf(fill(upper)).user).toBe(`0x${"ab".repeat(20)}`);
    expect(recOf(fill(addr(1), { extra: [1] })).fill.coin).toBe("SOL");
    const bad: Record<string, unknown>[] = [
      { side: "C" },
      { px: "" },
      { px: "abc" },
      { sz: 2 },
      { time: T + 0.5 },
      { tid: -1 },
      { tid: "12a" },
      { tid: 1.5 },
      { crossed: "true" },
      { startPosition: undefined },
      { liquidation: { liquidatedUser: addr(1), method: "market" } },
      { liquidation: { liquidatedUser: addr(1), markPx: "1" } },
    ];
    for (const over of bad) expect(parseRecord(fill(addr(1), over))).toBeNull();
    expect(parseRecord([`0x${"a".repeat(39)}`, fill(addr(1))[1]])).toBeNull();
    expect(parseRecord(fill(addr(1)).slice(1))).toBeNull();
  });
});

describe("a counted fill (H4)", () => {
  it("counts the own reducing fill of either method, its side the forced side", () => {
    const sell = countedOf(recOf(fill(addr(9))), coins);
    expect(sell).toEqual({
      t: T,
      iid: 5,
      addr: addr(9),
      side: -1,
      tid: "101",
      method: "market",
    });
    const buy = countedOf(
      recOf(
        fill(addr(9), { coin: "kPEPE", side: "B", startPosition: "-30.0" }),
      ),
      coins,
    );
    expect(buy).toMatchObject({ side: 1, iid: 15 });
    const backstop = recOf(
      fill(addr(9), {
        side: "B",
        startPosition: "-882.0",
        crossed: false,
        fee: "0.0",
        liquidation: {
          liquidatedUser: addr(9),
          markPx: "1",
          method: "backstop",
        },
      }),
    );
    expect(legKind(backstop)).toBe("counted");
    expect(countedOf(backstop, coins)).toMatchObject({
      side: 1,
      method: "backstop",
    });
    // The liquidated account named in checksum case is the same account.
    const cased = `0x${"Ab".repeat(20)}`;
    expect(
      countedOf(
        recOf(
          fill(cased.toLowerCase(), {
            liquidation: {
              liquidatedUser: cased,
              markPx: "1",
              method: "market",
            },
          }),
        ),
        coins,
      ),
    ).not.toBeNull();
  });

  it("leaves out the counterparty, a fill not reducing, a maker's own fill, an object without an account, and no object", () => {
    const kinds: [Record<string, unknown>, string | null][] = [
      [
        {
          liquidation: {
            liquidatedUser: addr(2),
            markPx: "1",
            method: "market",
          },
        },
        "counterparty",
      ],
      [
        {
          liquidation: {
            liquidatedUser: addr(2),
            markPx: "1",
            method: "backstop",
          },
        },
        "counterparty",
      ],
      [{ startPosition: "0.0" }, "not reducing"],
      [{ startPosition: "-2.0" }, "not reducing"],
      [{ side: "B" }, "not reducing"],
      [{ crossed: false }, "neither crossed nor backstop"],
      [
        { liquidation: { markPx: "1", method: "backstop" }, crossed: false },
        "no liquidatedUser",
      ],
      [{ liquidation: undefined }, null],
    ];
    for (const [over, kind] of kinds) {
      const rec = recOf(fill(addr(1), over));
      expect(legKind(rec)).toBe(kind);
      expect(countedOf(rec, coins)).toBeNull();
    }
  });

  it("counts only the 38 names exactly: no large coin, builder dex, spot or other case", () => {
    for (const coin of [
      "BTC",
      "ETH",
      "xyz:SOL",
      "@107",
      "SOL/USDC",
      "sol",
      "KPEPE",
    ]) {
      const rec = recOf(fill(addr(1), { coin }));
      expect(legKind(rec)).toBe("counted");
      expect(countedOf(rec, coins)).toBeNull();
    }
    expect(coins.list.map((c) => c.name)).toHaveLength(38);
  });

  it("orders counted fills by time, asset id, account and tid as a whole number (M4)", () => {
    const c = (t: number, iid: number, a: string, tid: string): Counted => ({
      t,
      iid,
      addr: a,
      side: -1,
      tid,
      method: "market",
    });
    const fills = [
      c(T, 5, addr(1), "10"),
      c(T, 5, addr(1), "9"),
      c(T, 5, addr(1), "123456789012345678901"),
      c(T, 5, addr(0), "99"),
      c(T, 4, addr(2), "1"),
      c(T - 1, 233, addr(3), "1"),
    ];
    expect(
      [...fills].sort(byM4).map((f) => `${f.t - T}|${f.iid}|${f.tid}`),
    ).toEqual([
      "-1|233|1",
      "0|4|1",
      "0|5|99",
      "0|5|9",
      "0|5|10",
      "0|5|123456789012345678901",
    ]);
  });
});

describe("the coins file (H3)", () => {
  it("holds M3's 38 coins in order, each name and asset id once", () => {
    const text = JSON.stringify({ coins: coins.list });
    expect(coinsFrom(text).list).toEqual(coins.list);
    const swapped = [...coins.list];
    [swapped[0], swapped[1]] = [swapped[1]!, swapped[0]!];
    expect(() => coinsFrom(JSON.stringify({ coins: swapped }))).toThrow(
      "not M3's coins in order",
    );
    const twice = coins.list.map((c, i) =>
      i === 1 ? { ...c, assetId: coins.list[0]!.assetId } : c,
    );
    expect(() => coinsFrom(JSON.stringify({ coins: twice }))).toThrow("twice");
    expect(coins.byName.get("USELESS")).toEqual({
      name: "USELESS",
      assetId: 233,
      iid: 71,
    });
  });
});

describe("the slices (H5)", () => {
  it("reads the address as a 160-bit whole number modulo M", () => {
    expect(sliceOf(addr(255), 7)).toBe(3);
    const top = `0x${"f".repeat(40)}`; // 2^160 − 1
    expect([3, 5, 7, 11].map((M) => sliceOf(top, M))).toEqual([0, 0, 1, 0]);
    expect(sliceOf(`0x${"F".repeat(40)}`, 7)).toBe(1);
    expect(sliceOf(top, 1)).toBe(0);
  });

  it("puts each fill in its slice and keeps the order", () => {
    const f = (n: number, t: number): Counted => ({
      t,
      iid: 5,
      addr: addr(n),
      side: -1,
      tid: String(t),
      method: "market",
    });
    const fills = [f(1, 1), f(2, 2), f(3, 3), f(4, 4), f(6, 5)];
    expect(bySlice(fills, 2).map((l) => l.map((x) => x.t))).toEqual([
      [2, 4, 5],
      [1, 3],
    ]);
    expect(bySlice(fills, 1)).toEqual([fills]);
  });

  it("scans M from 1 to the first rate below 2.84 and takes the rate nearest 5.68", () => {
    // n accounts' fills two hours apart in one coin: every fill an episode in every slicing.
    const world = (n: number): Counted[] =>
      Array.from({ length: n }, (_, i) => ({
        t: T + i * 2 * HOUR,
        iid: 5,
        addr: addr(1000 + i),
        side: -1,
        tid: String(i),
        method: "market",
      }));
    // 71 ÷ 25 is 2.84 exactly: not below, so the scan goes on to 26; 71 ÷ 13 is the nearest 5.68.
    const exact = scanM(world(71), 1);
    expect(exact.scan.map((r) => r.M)).toEqual(
      Array.from({ length: 26 }, (_, i) => i + 1),
    );
    expect(exact.scan[24]!.rate).toBe(2.84);
    expect(exact.M).toBe(13);
    // 56.7 ÷ 20 = 2.835 stops the scan at 20; 56.7 ÷ 10 = 5.67 is the nearest.
    const below = scanM(world(567), 10);
    expect(below.scan).toHaveLength(20);
    expect(below.M).toBe(10);
    const fills: Counted[] = Array.from({ length: 57 }, (_, i) => ({
      t: T + i * 2 * HOUR,
      iid: 5,
      addr: addr(1000 + i),
      side: -1,
      tid: String(i),
      method: "market",
    }));
    const { M, scan } = scanM(fills, 1);
    expect(scan.map((r) => r.M)).toEqual(
      Array.from({ length: 21 }, (_, i) => i + 1),
    );
    expect(scan.every((r) => r.episodes === 57)).toBe(true);
    expect(scan.at(-1)!.rate).toBeLessThan(STOP_RATE);
    expect(scan.at(-2)!.rate).toBeGreaterThanOrEqual(STOP_RATE);
    expect(M).toBe(10);
    // Two hours' episodes chain within 60 minutes: one episode a slice that holds a fill.
    const chained = fills.map((x, i) => ({ ...x, t: T + i * 60_000 }));
    expect(scanM(chained, 1).scan[0]).toEqual({ M: 1, episodes: 1, rate: 1 });
    expect(SIZING_DAYS).toBeCloseTo(67 + 10 / 24, 12);
  });

  it("breaks a tie toward the larger M", () => {
    expect(
      pickM([
        { M: 2, episodes: 10, rate: 5 },
        { M: 4, episodes: 20, rate: 5 },
        { M: 5, episodes: 5, rate: 1 },
      ]),
    ).toBe(4);
    expect(
      pickM([
        { M: 9, episodes: 0, rate: 6 },
        { M: 10, episodes: 0, rate: 5.5 },
      ]),
    ).toBe(10);
    // 5.66 is 0.02 from 5.68, 5.71 is 0.03: the target is 5.68, not 5.7.
    expect(
      pickM([
        { M: 7, episodes: 0, rate: 5.71 },
        { M: 8, episodes: 0, rate: 5.66 },
      ]),
    ).toBe(8);
  });
});

describe("the wave inside a slice (H6)", () => {
  it("needs two accounts of the same slice", () => {
    const liq = (n: number, t: number, iid: number): Counted => ({
      t,
      iid,
      addr: addr(n),
      side: -1,
      tid: String(n),
      method: "market",
    });
    // Accounts 2 and 4 sit in slice 0 of 2; account 3 in slice 1.
    const odd = [liq(2, T, 5), liq(3, T + 60_000, 159)];
    expect(waveEntries(odd)).toHaveLength(1);
    expect(bySlice(odd, 2).map((l) => waveEntries(l).length)).toEqual([0, 0]);
    const even = [liq(2, T, 5), liq(4, T + 3_600_000, 159)];
    expect(bySlice(even, 2).map((l) => waveEntries(l).length)).toEqual([1, 0]);
    expect(waveEntries(bySlice(even, 2)[0]!)[0]!.fill.t).toBe(T + 3_600_000);
  });
});
