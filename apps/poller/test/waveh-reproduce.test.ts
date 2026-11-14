/**
 * WAVE-H's reproduction on Polymarket's old weeks (R8). The conversion is
 * pinned here on made-up rows; the real run reads the pre-cut seed only and
 * runs when WAVEH_PRECUT names a JSON file of `{seedDir, out?}`, writing its
 * report to `out`.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import {
  COUNTERPARTY,
  reproduce,
  toLines,
  type Report,
} from "../scripts/waveh-reproduce.js";
import { PACKAGE_ROOT } from "../src/market1/gate.js";
import type { StoredRow } from "../src/paper/store.js";
import { loadCoins } from "../src/waveh/coins.js";
import {
  countedOf,
  legKind,
  parseLine,
  parseRecord,
} from "../src/waveh/fills.js";

const coins = loadCoins();
const ADDR = `0x${"1".repeat(40)}`;
const row = (over: Partial<StoredRow> = {}): StoredRow => ({
  trade_id: "18446744073709551615",
  order_id: "1234567890123456",
  instrument_id: 8,
  timestamp: Date.parse("2026-09-10T23:24:00Z"),
  side: "short",
  price: "150.25",
  quantity: "3.5",
  previous_size: "3.5",
  fee: "0.21",
  pnl: "-1",
  taker: true,
  liquidation: true,
  ...over,
});
const read = (text: string) => {
  const r = parseRecord(parseLine(text));
  if (r === null) throw new Error("a converted line failed the schema");
  return r;
};

describe("the seed's rows in Hyperliquid's shape (R8)", () => {
  it("writes a market liquidation's own taker leg and the maker's leg, and counts the own one", () => {
    const [own, other, more] = toLines(ADDR, row(), "SOL").map(read);
    expect(more).toBeUndefined();
    expect(own!.user).toBe(ADDR);
    expect(own!.fill).toMatchObject({
      coin: "SOL",
      px: "150.25",
      sz: "3.5",
      side: "A",
      startPosition: "3.5",
      crossed: true,
      fee: "0.21",
      tid: "18446744073709551615",
      liquidation: { liquidatedUser: ADDR, method: "market" },
    });
    expect(other!.user).toBe(COUNTERPARTY);
    expect(other!.fill).toMatchObject({
      side: "B",
      startPosition: "-3.5",
      crossed: false,
      tid: "18446744073709551615",
      liquidation: { liquidatedUser: ADDR, method: "market" },
    });
    expect(countedOf(own!, coins)).toMatchObject({
      iid: 5,
      side: -1,
      tid: "18446744073709551615",
      method: "market",
    });
    expect(legKind(other!)).toBe("counterparty");
  });

  it("writes a backstop (order id 0) as the own leg not crossed and the vault's crossed, and counts the own one", () => {
    const [own, vault] = toLines(
      ADDR,
      row({ order_id: "0", side: "long", previous_size: "-3.5", fee: "0" }),
      "kPEPE",
    ).map(read);
    expect(own!.fill).toMatchObject({
      side: "B",
      crossed: false,
      liquidation: { method: "backstop" },
    });
    expect(countedOf(own!, coins)).toMatchObject({
      iid: 15,
      side: 1,
      method: "backstop",
    });
    expect(vault!.fill).toMatchObject({
      side: "A",
      crossed: true,
      startPosition: "0.0",
    });
    expect(legKind(vault!)).toBe("counterparty");
  });

  it("writes a plain fill as one leg without the object, and a maker's liquidation as not counted", () => {
    const plain = toLines(ADDR, row({ liquidation: false }), "SOL").map(read);
    expect(plain).toHaveLength(1);
    expect(plain[0]!.fill.liquidation).toBeUndefined();
    const [maker] = toLines(ADDR, row({ taker: false }), "SOL").map(read);
    expect(legKind(maker!)).toBe("neither crossed nor backstop");
  });
});

const config = process.env.WAVEH_PRECUT;

describe.runIf(config !== undefined)(
  "the reproduction on the real old weeks (pre-cut data only)",
  () => {
    let report: Report;
    beforeAll(() => {
      const c = JSON.parse(readFileSync(config!, "utf8")) as {
        seedDir: string;
        out?: string;
      };
      if (!existsSync(c.seedDir)) throw new Error(`missing ${c.seedDir}`);
      report = reproduce({ packageRoot: PACKAGE_ROOT, seedDir: c.seedDir });
      if (c.out !== undefined)
        writeFileSync(c.out, `${JSON.stringify(report, null, 2)}\n`);
    }, 600_000);

    it("counts MARKET-1's 727 fills, 695 by the book and 32 backstops, fill for fill", () => {
      expect(report.failed).toBe(0);
      expect(report.counted).toBe(727);
      expect(report.countedByMethod).toEqual({ market: 695, backstop: 32 });
      expect(report.market1.counted).toBe(727);
      expect(report.sameFillsAsMarket1).toBe(true);
    });

    it("finds MARKET-FIND's 153 entries in the pool as one slice, entry for entry", () => {
      expect([
        report.entries,
        report.days,
        report.coins,
        report.sells,
        report.buys,
      ]).toEqual([153, 47, 30, 114, 39]);
      expect(report.entriesByMethod).toEqual({ market: 150, backstop: 3 });
      expect(report.sameEntriesAsMarket1).toBe(true);
    });
  },
);
