import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { gzipSync } from "node:zlib";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  LARGE,
  SMALL_COINS,
  byM4,
  isForced,
  type Liq,
} from "../src/market1/fills.js";
import { PACKAGE_ROOT, SealedError } from "../src/market1/gate.js";
import {
  kitData,
  marketsThrough,
  readPool,
  ruleBookDocs,
  standing,
} from "../src/market1/inputs.js";
import { marketsThrough as paperMarketsThrough } from "../src/paper/daily.js";
import { CUT, mondayOf } from "../src/paper/instants.js";
import {
  loadResearch,
  type PanelFile,
  type Research,
} from "../src/paper/research.js";
import {
  FOREVER,
  PaperStore,
  type MarketDay,
  type StoredRow,
} from "../src/paper/store.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";

const OPEN = { open: true };
const CLOSED = { open: false } as const;
let kit: Research;
const scratch: string[] = [];
beforeAll(async () => {
  kit = await loadResearch();
});
afterAll(() => {
  for (const d of scratch) rmSync(d, { recursive: true, force: true });
});
const tmp = (name: string) => {
  const dir = mkdtempSync(path.join(tmpdir(), `market1-${name}-`));
  scratch.push(dir);
  return dir;
};

function fill(n: number, t: number, over: Partial<StoredRow> = {}): StoredRow {
  return {
    trade_id: String(1_000 + n),
    order_id: String(2_000 + n),
    instrument_id: 8,
    timestamp: t,
    side: "short",
    price: "150.5",
    quantity: "2",
    previous_size: "2",
    fee: "0.1",
    pnl: "0",
    taker: true,
    liquidation: true,
    ...over,
  };
}

describe("the coins (M3)", () => {
  it("are the kit's rule book's crypto markets but BTC, ETH and PRL", () => {
    const kitMarkets = kitData(PACKAGE_ROOT).markets;
    const crypto = [...kitMarkets]
      .filter(([, m]) => m.category === "crypto")
      .map(([iid]) => iid)
      .sort((a, b) => a - b);
    expect(crypto.filter((iid) => ![6, 7, 96].includes(iid))).toEqual(
      SMALL_COINS,
    );
    expect(SMALL_COINS).toHaveLength(38);
    expect(LARGE.map((iid) => kitMarkets.get(iid)?.symbol)).toEqual([
      "BTC-USD",
      "ETH-USD",
    ]);
    expect(kitMarkets.get(96)?.symbol).toBe("PRL-USD");
    expect(kitMarkets.get(8)?.symbol).toBe("SOL-USD");
  });

  it("the pool is the kit's population less its holdout: 1,602 accounts, lower-case", () => {
    const pool = kitData(PACKAGE_ROOT).pool;
    expect(pool).toHaveLength(1602);
    expect(pool.every((a) => /^0x[0-9a-f]{40}$/.test(a))).toBe(true);
  });
});

describe("a counted fill (M4)", () => {
  it("is a liquidation, a taker and a reduce; sorted by time, market, address and trade id of any size", () => {
    expect(isForced(fill(1, 0))).toBe(true);
    expect(isForced(fill(1, 0, { liquidation: false }))).toBe(false);
    expect(isForced(fill(1, 0, { taker: false }))).toBe(false);
    expect(isForced(fill(1, 0, { previous_size: "0" }))).toBe(false);
    expect(isForced(fill(1, 0, { previous_size: "-2" }))).toBe(false);
    expect(isForced(fill(1, 0, { side: "long", previous_size: "-2" }))).toBe(
      true,
    );
    const at = (t: number, iid: number, addr: string, tid: string): Liq => ({
      t,
      iid,
      addr,
      side: -1,
      tid,
    });
    const list = [
      at(5, 8, "0xb", "9007199254740993"),
      at(5, 8, "0xb", "9007199254740992"),
      at(5, 8, "0xa", "99999999999999999999"),
      at(5, 6, "0xz", "1"),
      at(4, 99, "0xz", "1"),
    ].sort(byM4);
    expect(list.map((l) => `${l.t} ${l.iid} ${l.addr} ${l.tid}`)).toEqual([
      "4 99 0xz 1",
      "5 6 0xz 1",
      "5 8 0xa 99999999999999999999",
      "5 8 0xb 9007199254740992",
      "5 8 0xb 9007199254740993",
    ]);
  });
});

describe("the pool's fills from the paper experiment's store (M2)", () => {
  const kitSmall = () => {
    const real = kitData(PACKAGE_ROOT);
    const A = real.pool[0]!;
    const B = real.pool[1]!;
    const C = real.pool[2]!;
    return { real, A, B, C };
  };

  it("reads the state first, then each pool account's rows from the cut below its P", () => {
    const { real, A, B, C } = kitSmall();
    const root = tmp("store");
    const store = new PaperStore(root);
    const t0 = CUT + 3 * DAY_MS;
    const P = t0 + DAY_MS;
    store.addRows(A, [
      fill(1, CUT - 1),
      fill(2, t0),
      fill(3, t0 + 1, { liquidation: false }),
      fill(4, t0 + 2, { instrument_id: 6 }),
      fill(5, t0 + 3, { instrument_id: 96 }),
      fill(6, t0 + 4, { instrument_id: 999 }),
      fill(7, t0 + 5, { instrument_id: 1 }),
      fill(8, P),
    ]);
    store.addRows(B, [fill(9, t0 + 10)]);
    store.addRows(C, [fill(10, t0 + 20)]);
    // An address outside the pool, with a file: never read.
    const outsider = `0x${"f".repeat(40)}`;
    store.addRows(outsider, [fill(11, t0 + 30)]);
    store.saveState({
      version: 1,
      accounts: {
        [A]: { P, from: CUT, holes: [] },
        [B]: {
          P: t0 + 11,
          from: CUT,
          holes: [
            {
              from: t0 + 11,
              to: FOREVER,
              cause: "account not found",
              readOn: "2026-11-11",
            },
          ],
        },
        [outsider]: { P, from: CUT, holes: [] },
      },
    });
    const { fills, accounts } = readPool(OPEN, root, real, CUT + 30 * DAY_MS);
    expect(fills.small.map((l) => l.tid)).toEqual(["1002", "1009"]);
    expect(fills.small[0]).toEqual({
      t: t0,
      iid: 8,
      addr: A,
      side: -1,
      tid: "1002",
    });
    expect(fills.large.map((l) => l.tid)).toEqual(["1004"]);
    // Crypto markets outside the small coins and markets the kit does not list; not stocks (1 is an equity).
    expect(real.markets.get(1)?.category).not.toBe("crypto");
    expect([...fills.outside].sort((a, b) => a[0] - b[0])).toEqual([
      [6, 1],
      [96, 1],
      [999, 1],
    ]);
    expect(fills.weeks.get(mondayOf(t0))).toEqual({
      active: 2,
      liquidated: 2,
      counted: 2,
    });
    expect(accounts.get(A)).toEqual({ P, holes: [] });
    expect(standing(accounts.get(B)!)).toBe(true);
    expect(standing(accounts.get(A)!)).toBe(false);
    // C has a file but no state yet: its P is the cut, nothing of it counts.
    expect(accounts.get(C)).toEqual({ P: CUT, holes: [] });
    expect(accounts.has(outsider)).toBe(false);
    expect(accounts.size).toBe(1602);
    // Nothing at or after END is used.
    expect(
      readPool(OPEN, root, real, t0 + 5).fills.small.map((l) => l.tid),
    ).toEqual(["1002"]);
  });

  it("refuses, before opening anything, a read past the cut with the gate closed; and a state past the cut", () => {
    const { real, A } = kitSmall();
    const root = tmp("sealed");
    // state.json as a folder: opening it would throw something else.
    mkdirSync(path.join(root, "state.json"));
    expect(() => readPool(CLOSED, root, real, CUT + 1)).toThrow(SealedError);
    const pre = tmp("precut-store");
    new PaperStore(pre).saveState({
      version: 1,
      accounts: { [A]: { P: CUT + 1, from: CUT, holes: [] } },
    });
    expect(() => readPool(CLOSED, pre, real, CUT)).toThrow(SealedError);
    new PaperStore(pre).saveState({
      version: 1,
      accounts: { [A]: { P: CUT, from: CUT - DAY_MS, holes: [] } },
    });
    new PaperStore(pre).addRows(A, [fill(1, CUT - HOUR_MS)]);
    expect(
      readPool(CLOSED, pre, real, CUT, CUT - DAY_MS).fills.small.map(
        (l) => l.tid,
      ),
    ).toEqual(["1001"]);
  });

  it("the rule book is refused with the gate closed before any connection", async () => {
    await expect(
      ruleBookDocs(CLOSED, CUT + 1, "mongodb://unused", "polymarket_follow"),
    ).rejects.toThrow(SealedError);
  });
});

describe("the market objects (M8): the kit's pre-cut panel joined with the market-days", () => {
  const iid = 8;
  const start = CUT - 2 * DAY_MS;
  function makeRoot(): { root: string; pinned: Map<string, string> } {
    const root = tmp("panel");
    const n = (CUT - start) / MINUTE_MS;
    const marks = Array.from({ length: n }, (_, i) =>
      i % 7 === 3 ? null : 100 + i / 1000,
    );
    const pre: PanelFile = {
      iid,
      symbol: "SOL-USD",
      category: "crypto",
      start,
      end: CUT,
      firstTrade: null,
      retired: null,
      marks,
      klines: { minute: [5, 6], trades: [2, 3], volume: [1.5, 2.5] },
      funding: [
        [start + HOUR_MS, 0.0001, start + HOUR_MS + 60],
        [CUT - HOUR_MS, -0.0002, CUT - HOUR_MS + 70],
      ],
    };
    const bytes = gzipSync(JSON.stringify(pre));
    mkdirSync(path.join(root, "panel-precut"), { recursive: true });
    writeFileSync(path.join(root, "panel-precut", `${iid}.json.gz`), bytes);
    const pinned = new Map([
      [`${iid}.json.gz`, createHash("sha256").update(bytes).digest("hex")],
    ]);
    const day = (d: number): MarketDay => ({
      iid,
      day: d,
      marks: Array.from({ length: 1_440 }, (_, i) => 101 + i / 997),
      klines: { minute: [0], trades: [1], volume: [0.5] },
      funding: [[d + HOUR_MS, 0.0003, d + HOUR_MS + 80]],
    });
    const store = new PaperStore(root);
    store.saveMarketDay(day(CUT));
    store.saveMarketDay(day(CUT + DAY_MS));
    // A gap: the third day is missing, the fourth present.
    store.saveMarketDay(day(CUT + 3 * DAY_MS));
    return { root, pinned };
  }

  it("equal the paper experiment's own, through the first missing day", () => {
    const { root, pinned } = makeRoot();
    const end = CUT + 5 * DAY_MS;
    const mine = marketsThrough(OPEN, kit, root, pinned, end)(iid)!;
    const paper = paperMarketsThrough(
      kit,
      new PaperStore(root),
      end,
      pinned,
    )(iid)!;
    expect(mine).toEqual(paper);
    expect(mine.end).toBe(CUT + 2 * DAY_MS);
    expect(marketsThrough(OPEN, kit, root, pinned, end)(6)).toBeNull();
  });

  it("are refused past the cut with the gate closed; a pre-cut one lists no market-day folder", () => {
    const { root, pinned } = makeRoot();
    expect(() => marketsThrough(CLOSED, kit, root, pinned, CUT + 1)).toThrow(
      SealedError,
    );
    // The market-days folder of the market made unreadable as a folder.
    rmSync(path.join(root, "panel", String(iid)), {
      recursive: true,
      force: true,
    });
    writeFileSync(path.join(root, "panel", String(iid)), "not a folder");
    const mk = marketsThrough(CLOSED, kit, root, pinned, CUT)(iid)!;
    expect(mk.end).toBe(CUT);
    expect(mk.n).toBe(2 * 1_440);
  });
});
