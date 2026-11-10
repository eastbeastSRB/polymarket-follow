/**
 * Synthetic replies shaped by the specs of 2026-11-10 (perps-openapi.json
 * 55b198ce…) and by the live keys COLLECTOR-PLAN §8 recorded that day; the
 * values are made up.
 */
import { describe, expect, it } from "vitest";
import {
  BboReply,
  BookFrame,
  CompetitionLeaderboardPage,
  CompetitionReply,
  CompetitionsReply,
  ErrorReply,
  ExchangeReply,
  FeesReply,
  InstrumentsReply,
  LeaderboardPage,
  PongReply,
  StockSplitsReply,
  SubReply,
  TickersReply,
  TradesFrame,
  unknownKeyPaths,
} from "../src/api/schemas.js";
import { boardPage, tablePage } from "./fixtures.js";

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
      [InstrumentsReply, [{ ...instrument, new_field: "0" }], "$[].new_field"],
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

describe("the WebSocket schemas", () => {
  const book = {
    ch: "book::1",
    ts: 1_794_272_437_289,
    ets: 1_794_272_437_287,
    sq: 101_655_028_994,
    data: {
      b: [["100.00", "1.5"]],
      a: [
        ["100.05", "2"],
        ["100.10", "4"],
      ],
    },
  };
  const trades = {
    ch: "trades::1",
    ts: 1_794_272_437_289,
    sq: 101_655_028_995,
    data: [
      {
        tid: 7,
        iid: 1,
        side: "long",
        p: "100.05",
        qty: "0.5",
        ts: 1_794_272_437_200,
        hash: "0x",
        settlement: false,
      },
    ],
  };

  it("take each frame with an unknown key added, and name the key", () => {
    const withKeys = { ...book, extra: 1, data: { ...book.data, mid: "1" } };
    expect(BookFrame.safeParse(withKeys).success).toBe(true);
    expect(unknownKeyPaths(BookFrame, withKeys).sort()).toEqual([
      "$.data.mid",
      "$.extra",
    ]);
    const trade = { ...trades.data[0], maker: "x" };
    const tradesWithKey = { ...trades, data: [trade] };
    expect(TradesFrame.safeParse(tradesWithKey).success).toBe(true);
    expect(unknownKeyPaths(TradesFrame, tradesWithKey)).toEqual([
      "$.data[].maker",
    ]);
    expect(unknownKeyPaths(BookFrame, book)).toEqual([]);
    expect(unknownKeyPaths(TradesFrame, trades)).toEqual([]);
  });

  it("need of a book only its channel, its time and levels of a price and a size", () => {
    const bare = { ch: "book::9", ts: 1, data: { b: [], a: [] } };
    expect(BookFrame.safeParse(bare).success).toBe(true);
    const wider = { ...bare, data: { b: [["1", "2", "3"]], a: [] } };
    expect(BookFrame.safeParse(wider).success).toBe(true);
    const short = { ...bare, data: { b: [["1"]], a: [] } };
    expect(BookFrame.safeParse(short).success).toBe(false);
    expect(BookFrame.safeParse({ ...bare, ch: "book::9::50" }).success).toBe(
      false,
    );
    expect(BookFrame.safeParse({ ...bare, ts: "1" }).success).toBe(false);
  });

  it("tell a subscribe reply, a pong and a refusal apart", () => {
    const sub = {
      id: 1,
      data: [{ status: "ok" }, { status: "err", error: "x" }],
    };
    const pong = { data: { status: "ok", ts: 1, sq: 2 } };
    const refused = {
      id: 3,
      data: { status: "err", error: "message_rate_limited" },
    };
    expect(SubReply.safeParse(sub).success).toBe(true);
    expect(SubReply.safeParse(pong).success).toBe(false);
    expect(PongReply.safeParse(pong).success).toBe(true);
    expect(PongReply.safeParse(refused).success).toBe(false);
    expect(ErrorReply.safeParse(refused).success).toBe(true);
    expect(ErrorReply.safeParse(pong).success).toBe(false);
  });
});

describe("the pass schemas", () => {
  const board = boardPage("day", "pnl", 0, 1_794_272_237_289, 6_096, 2);
  const table = tablePage(1, 0, 4_746, 2, 1_794_272_167_000);
  const list = {
    timestamp: 1,
    live_competition_id: 1,
    competitions: [
      {
        competition_id: 1,
        number: 1,
        name: "C",
        sector_label: "",
        status: "live",
        start_time: 1,
        end_time: 2,
        prize_pool: "1",
        prize_asset_id: 1,
        internal: false,
      },
    ],
  };
  const competition = {
    competition_id: 1,
    status: "live",
    start_time: 1,
    end_time: 2,
    all_markets: true,
    markets: [{ instrument_id: 3, boost: "2" }],
    min_volume: "1000",
  };
  const fees = {
    fee_schedule: [
      {
        instrument_type: "perpetual",
        category: "crypto",
        taker_fee_rate: "0.0004",
        maker_fee_rate: "0.000125",
        tiers: [
          {
            min_volume_30d: "0",
            taker_fee_rate: "0.0004",
            maker_fee_rate: "0.000125",
          },
        ],
      },
    ],
  };
  const splits = { events: [], sequence: 101_655_028_994 };

  it("take each reply with an unknown key added, and name the key", () => {
    const cases = [
      [LeaderboardPage, { ...board, cursor: "x" }, "$.cursor"],
      [
        LeaderboardPage,
        { ...board, entries: [{ ...board.entries[0]!, name: "n" }] },
        "$.entries[].name",
      ],
      [CompetitionsReply, { ...list, page: 1 }, "$.page"],
      [CompetitionReply, { ...competition, tags: [] }, "$.tags"],
      [
        CompetitionLeaderboardPage,
        { ...table, entries: [{ ...table.entries[0]!, badge: "b" }] },
        "$.entries[].badge",
      ],
      [FeesReply, { ...fees, tiers_version: 2 }, "$.tiers_version"],
      [StockSplitsReply, { ...splits, more: false }, "$.more"],
    ] as const;
    for (const [schema, reply, path] of cases) {
      expect(schema.safeParse(reply).success, path).toBe(true);
      expect(unknownKeyPaths(schema, reply)).toContain(path);
    }
  });

  it("names no key of the spec as unknown", () => {
    expect(unknownKeyPaths(LeaderboardPage, board)).toEqual([]);
    expect(unknownKeyPaths(CompetitionsReply, list)).toEqual([]);
    expect(unknownKeyPaths(CompetitionReply, competition)).toEqual([]);
    expect(
      unknownKeyPaths(CompetitionLeaderboardPage, {
        ...table,
        cohort: 1,
        next_update_at: 2,
      }),
    ).toEqual([]);
    expect(unknownKeyPaths(FeesReply, fees)).toEqual([]);
    expect(unknownKeyPaths(StockSplitsReply, splits)).toEqual([]);
  });

  it("refuse a row whose account is not an address, or whose money is not a string", () => {
    const bad = (entry: Record<string, unknown>) => ({
      ...board,
      entries: [{ ...board.entries[0]!, ...entry }],
    });
    expect(LeaderboardPage.safeParse(bad({ account: "0x12" })).success).toBe(
      false,
    );
    expect(LeaderboardPage.safeParse(bad({ pnl: 12.5 })).success).toBe(false);
    expect(
      CompetitionLeaderboardPage.safeParse({
        ...table,
        entries: [{ ...table.entries[0]!, account: "someone" }],
      }).success,
    ).toBe(false);
    expect(
      CompetitionReply.safeParse({ ...competition, markets: [{ boost: "2" }] })
        .success,
    ).toBe(false);
    expect(StockSplitsReply.safeParse({ events: [] }).success).toBe(false);
  });
});
