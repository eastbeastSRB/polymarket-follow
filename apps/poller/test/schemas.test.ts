/**
 * Synthetic replies shaped by the specs of 2026-11-10 (perps-openapi.json
 * 55b198ce…) and by the live keys COLLECTOR-PLAN §8 recorded that day; the
 * values are made up.
 */
import { describe, expect, it } from "vitest";
import {
  BboReply,
  ExchangeReply,
  InstrumentsReply,
  TickersReply,
  unknownKeyPaths,
} from "../src/api/schemas.js";

const ticker = {
  instrument_id: 1,
  symbol: "BTC-USD",
  index_price: "100.00",
  mark_price: "100.01",
  last_price: "100.02",
  mid_price: "100.015",
  open_interest: "12.5",
  long_count: 40,
  short_count: 30,
  funding_rate: "0.0000125",
  next_funding: 1_794_276_000_000,
  timestamp: 1_794_272_437_289,
};
const exchange = {
  name: "Polymarket Perps",
  version: "1",
  chain_id: 137,
  contract: "0x0000000000000000000000000000000000000001",
  cancel_only: false,
  engine_version: "0.0.86",
};
const instrument = {
  instrument_id: 7,
  instrument_type: "perpetual",
  category: "crypto",
  symbol: "ETH-USD",
  close_only: false,
  max_leverage: 50,
};
const bbo = {
  instrument_id: 1,
  bid_price: "100.00",
  bid_quantity: "1.5",
  ask_price: "100.05",
  ask_quantity: "2",
  timestamp: 1_794_272_437_289,
};

describe("the REST schemas", () => {
  it("take each reply with an unknown key added, and name the key", () => {
    const cases = [
      [
        TickersReply,
        [{ ...ticker, pricing_status: "ok" }],
        "$[].pricing_status",
      ],
      [ExchangeReply, { ...exchange, region: "x" }, "$.region"],
      [
        InstrumentsReply,
        [{ ...instrument, fee_override: "0" }],
        "$[].fee_override",
      ],
      [BboReply, [{ ...bbo, level: 1 }], "$[].level"],
    ] as const;
    for (const [schema, reply, path] of cases) {
      expect(schema.safeParse(reply).success).toBe(true);
      expect(unknownKeyPaths(schema, reply)).toContain(path);
    }
  });

  it("names no key of the spec as unknown", () => {
    expect(unknownKeyPaths(TickersReply, [ticker])).toEqual([]);
    expect(unknownKeyPaths(ExchangeReply, exchange)).toEqual([]);
    expect(unknownKeyPaths(BboReply, [bbo])).toEqual([]);
    const settled = {
      ...instrument,
      settlement: {
        sequence: 1,
        timestamp: 2,
        price: "3",
        insurance_debit: "0",
      },
    };
    expect(unknownKeyPaths(InstrumentsReply, [instrument, settled])).toEqual(
      [],
    );
  });

  it("refuses a reply missing a field it requires, or with a wrong type", () => {
    const noMark: Record<string, unknown> = { ...ticker };
    delete noMark.mark_price;
    expect(TickersReply.safeParse([noMark]).success).toBe(false);
    expect(
      ExchangeReply.safeParse({ ...exchange, cancel_only: "no" }).success,
    ).toBe(false);
    expect(BboReply.safeParse([{ ...bbo, instrument_id: 1.5 }]).success).toBe(
      false,
    );
    expect(InstrumentsReply.safeParse([{ symbol: "X" }]).success).toBe(false);
  });

  it("needs only what drives the subscriptions from the market list", () => {
    const parsed = InstrumentsReply.parse([
      { instrument_id: 7, symbol: "ETH-USD" },
      { instrument_id: 51, symbol: "KIOXIA-USD", settlement: { timestamp: 1 } },
      { instrument_id: 8, symbol: "SOL-USD", settlement: null },
    ]);
    expect(parsed.map((i) => i.settlement != null)).toEqual([
      false,
      true,
      false,
    ]);
  });

  it("keeps money as decimal strings", () => {
    expect(
      TickersReply.safeParse([{ ...ticker, mark_price: 100.01 }]).success,
    ).toBe(false);
  });
});
