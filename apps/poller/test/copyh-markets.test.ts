/**
 * A coin's markets (src/copyh/markets.ts; rules.md C6, C9): the object the
 * kit's `marketFrom`, field for field, on a made-up panel that ends before
 * the kit's cut, and the paper's `marketThrough` on one that ends after it,
 * under the kit's 5-minute settlement mark; the 60-minute mark the kit's
 * where the kit's finds one and the latest of 61 minutes where it does not;
 * the object's refusals; a coin's bars from the store's own pass and merge,
 * across a month and across two stores, the pairs at 2 s and 2 s + 1 ms and
 * across a minute, the seal, the reader's refusals; marks from market
 * trades only, the VWAP and last-price objects; the object's start at the
 * first market trade, its end at END and at a Settlement, its last mark the
 * Settlement price, a leg open there valued at it, a Settlement at or after
 * END not read; funding rows by nominal hour (±30 min), two rows in an hour
 * a stop; a coin settling at 23:02 whose 23:00 row is stamped 23:14, held
 * through 23:00, charged (the supervisor's ruling in place of Q9), a row
 * stamped at END refused, a row of another coin refused; a minute of
 * size-0 trades marked in neither object; C6's rule 2 either side of the
 * day's end (rule 1 is the pass's: copyh-scan's test); thin legs at
 * $999.99 and $1,000.
 */
import { describe, expect, it } from "vitest";
import { END_E } from "../src/copyh/design.js";
import { fundingKey, sealedRows } from "../src/copyh/funding.js";
import {
  coinMarkets,
  coinOf,
  isPrimary,
  isThin,
  latestMark,
  marketOf,
  readBars,
  type Bars,
  type BarsSource,
} from "../src/copyh/markets.js";
import { StoreError } from "../src/copyh/run.js";
import { SEALED, SealedError } from "../src/copyh/seal.js";
import type { Manifest, Partition, Store } from "../src/copyh/store.js";
import { marketThrough } from "../src/paper/market.js";
import {
  loadResearch,
  type PanelFile,
  type Setting,
} from "../src/paper/research.js";
import type { Values } from "../src/polish/tables.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { addr, byBlock, keyOf, trade } from "./copyh-world.js";
import { storeOf } from "./copyh-engine-world.js";

const kit = await loadResearch();
const CUT = kit.constants.CUT;
const MIN = MINUTE_MS;

/** A made-up minute mark: uneven (code-rules). */
const markAt = (i: number) => 100 + ((i * i) % 89) / 10;
/** The minutes without a market trade: three quiet stretches, and every thirteenth from the fifth. */
const quiet = (i: number) =>
  (i >= 110 && i < 125) ||
  (i >= 176 && i < 180) ||
  (i >= 236 && i < 300) ||
  i % 13 === 5;
const RATES = [1.25e-5, -3e-6, 7e-6, 2.5e-5, -1.1e-5];

/** A made-up panel of six hours from `start`: its marks, klines, and five funding rows on the hours, each stamped late. */
function panelFrom(start: number): PanelFile {
  const n = 360;
  const minute: number[] = [];
  const trades: number[] = [];
  const volume: number[] = [];
  for (let i = 0; i < n; i++)
    if (!quiet(i)) {
      minute.push(i);
      trades.push(1 + (i % 5));
      volume.push((i % 11) * 0.5 + 0.25);
    }
  return {
    iid: 7,
    symbol: "MADE-UP",
    category: "crypto",
    start,
    end: start + n * MIN,
    firstTrade: start + 2_500,
    retired: null,
    marks: Array.from({ length: n }, (_, i) => (quiet(i) ? null : markAt(i))),
    klines: { minute, trades, volume },
    funding: RATES.map((rate, h): [number, number, number] => [
      start + (h + 1) * HOUR_MS,
      rate,
      start + (h + 1) * HOUR_MS + (h * h + 1) * MIN,
    ]),
  };
}

describe("the market object", () => {
  it("is the kit's marketFrom, field for field, on a panel that ends before the cut (the 5-minute mark)", () => {
    const p = panelFrom(CUT - DAY_MS);
    const mk = marketOf(kit, p, CUT, 5);
    expect(mk).toEqual(kit.panel.marketFrom(p));
    // The panel reaches each branch: a settlement marked on time, two by a stale mark, two without one.
    expect([...mk.funding.cumUnmarked]).toEqual([0, 1, 1, 1, 2]);
  });

  it("is the paper's marketThrough, field for field, on a panel that ends after the cut, which the kit refuses", () => {
    const p = panelFrom(CUT - HOUR_MS);
    const END = CUT + DAY_MS;
    expect(() => kit.panel.marketFrom(p)).toThrow("after the cut");
    expect(marketOf(kit, p, END, 5)).toEqual(marketThrough(kit, p, END));
  });

  it("settles funding at the 60-minute mark: the kit's mark where it finds one, else the latest of the hour's minute and the 60 before it", () => {
    const p = panelFrom(CUT - DAY_MS);
    const five = marketOf(kit, p, CUT, 5);
    const sixty = marketOf(kit, p, CUT, 60);
    for (const [hour] of p.funding) {
      const m = kit.panel.markAtMinuteEnd(five, hour - 1);
      if (m !== null) expect(latestMark(sixty, hour - 1, 60)).toBe(m);
    }
    // The second hour reaches back to minute 108; the fifth finds none in its 61 minutes.
    expect([...sixty.funding.cumUnmarked]).toEqual([0, 0, 0, 0, 1]);
    let s = 0;
    const cum = [59, 108, 175, 235].map((i, h) => (s += RATES[h]! * markAt(i)));
    expect([...sixty.funding.cum]).toEqual([...cum, cum[3]]);
    expect({ ...sixty, funding: null }).toEqual({ ...five, funding: null });
  });

  it("reads the latest mark of a minute and the n before it: the kit's at 5; a mark 60 minutes back found at 60, 61 not", () => {
    const p = panelFrom(CUT - DAY_MS);
    const mk = marketOf(kit, p, CUT, 5);
    for (let t = p.start - MIN; t <= p.end; t += 30_000)
      expect(latestMark(mk, t, 5)).toBe(kit.panel.markAtMinuteEnd(mk, t));
    const lone = marketOf(
      kit,
      {
        ...p,
        marks: p.marks.map((_, i) => (i === 0 ? 50.5 : null)),
        klines: { minute: [0], trades: [1], volume: [2] },
        funding: [],
      },
      CUT,
      5,
    );
    expect(latestMark(lone, p.start + 60 * MIN + 59_999, 60)).toBe(50.5);
    expect(latestMark(lone, p.start + 61 * MIN, 60)).toBeNull();
    expect(latestMark(lone, p.start + 5 * MIN + 59_999, 5)).toBe(50.5);
    expect(latestMark(lone, p.start + 6 * MIN, 5)).toBeNull();
    expect(kit.panel.markAtMinuteEnd(lone, p.start + 5 * MIN + 59_999)).toBe(
      50.5,
    );
    expect(kit.panel.markAtMinuteEnd(lone, p.start + 6 * MIN)).toBeNull();
  });

  it("refuses a panel past its cut, a funding row stamped at the cut, marks of another count and a kline outside", () => {
    const p = panelFrom(CUT - DAY_MS);
    expect(() => marketOf(kit, p, p.end - MIN, 5)).toThrow("after the cut");
    const stamped = (stamp: number): PanelFile => ({
      ...p,
      funding: [[p.start + HOUR_MS, 1e-5, stamp]],
    });
    expect(() => marketOf(kit, stamped(p.end), p.end, 5)).toThrow(StoreError);
    expect([
      ...marketOf(kit, stamped(p.end - 1), p.end, 5).funding.hour,
    ]).toEqual([p.start + HOUR_MS]);
    expect(() =>
      marketOf(kit, { ...p, marks: p.marks.slice(1) }, CUT, 5),
    ).toThrow("359 marks for 360 minutes");
    expect(() =>
      marketOf(
        kit,
        { ...p, klines: { minute: [360], trades: [1], volume: [1] } },
        CUT,
        5,
      ),
    ).toThrow("a kline outside");
  });
});

/** Three hours either side of a month's end, after the switch hour. */
const H0 = Date.parse("2025-08-31T22:00:00Z");
const H1 = H0 + HOUR_MS;
const H2 = H0 + 2 * HOUR_MS;
const SOL = 2;
const HYPE = 3;
const A = addr(0x0a);
const B = addr(0x0b);
const C = addr(0x0c);
const D = addr(0x0d);
const text = (records: readonly string[]) => `${byBlock(1, records)}\n`;

const SOL_0 = [
  // Minute 0: two market trades 10 s apart, no pair.
  ...trade(A, B, {
    coin: "SOL",
    px: "100",
    sz: "2",
    side: "B",
    time: H0 + 10_000,
    tid: 1,
  }),
  ...trade(A, B, {
    coin: "SOL",
    px: "102",
    sz: "1",
    side: "A",
    time: H0 + 20_000,
    tid: 2,
  }),
  // Minutes 1–3: a backstop's takeover, a deleveraging, the vault's netting: no market trade.
  ...trade(C, D, {
    coin: "SOL",
    px: "90",
    sz: "5",
    side: "B",
    time: H0 + MIN + 5_000,
    tid: 3,
    liquidation: { liquidatedUser: D, markPx: "90", method: "backstop" },
  }),
  ...trade(C, D, {
    coin: "SOL",
    px: "95",
    sz: "1",
    side: "A",
    time: H0 + 2 * MIN + 5_000,
    tid: 4,
    dir: "Auto-Deleveraging",
  }),
  ...trade(C, D, {
    coin: "SOL",
    px: "96",
    sz: "1",
    side: "B",
    time: H0 + 3 * MIN + 5_000,
    tid: 5,
    dir: "Net Child Vaults",
  }),
  // Minute 5: a pair at 2 s, then a buy 2 s + 1 ms after the sell: no second pair.
  ...trade(A, B, {
    coin: "SOL",
    px: "101",
    sz: "1",
    side: "B",
    time: H0 + 5 * MIN,
    tid: 6,
  }),
  ...trade(A, B, {
    coin: "SOL",
    px: "100.5",
    sz: "1",
    side: "A",
    time: H0 + 5 * MIN + 2_000,
    tid: 7,
  }),
  ...trade(A, B, {
    coin: "SOL",
    px: "100.8",
    sz: "1",
    side: "B",
    time: H0 + 5 * MIN + 4_001,
    tid: 8,
  }),
  // A pair across minutes 6 and 7, counted in minute 7: its second record's.
  ...trade(A, B, {
    coin: "SOL",
    px: "100",
    sz: "1",
    side: "A",
    time: H0 + 7 * MIN - 500,
    tid: 9,
  }),
  ...trade(A, B, {
    coin: "SOL",
    px: "100.2",
    sz: "1",
    side: "B",
    time: H0 + 7 * MIN + 700,
    tid: 10,
  }),
];
const SOL_1 = trade(A, B, {
  coin: "SOL",
  px: "99",
  sz: "4",
  side: "B",
  time: H1 + 59 * MIN + 30_000,
  tid: 11,
});
const SOL_2 = trade(A, B, {
  coin: "SOL",
  px: "98.5",
  sz: "2",
  side: "A",
  time: H2 + 30_000,
  tid: 12,
});

/** HYPE's first Settlement record, at 23:02:15: two minutes after an hour. */
const SETTLE = H1 + 2 * MIN + 15_000;
const HYPE_END = H1 + 3 * MIN;
const HYPE_0 = [
  ...trade(A, B, {
    coin: "HYPE",
    px: "40",
    sz: "3",
    side: "B",
    time: H0 + 10 * MIN + 1_000,
    tid: 101,
  }),
  ...trade(A, B, {
    coin: "HYPE",
    px: "44",
    sz: "1",
    side: "B",
    time: H0 + 57 * MIN,
    tid: 102,
  }),
];
const HYPE_1 = [
  // A market trade in the Settlement's minute, before it.
  ...trade(A, B, {
    coin: "HYPE",
    px: "60",
    sz: "1",
    side: "B",
    time: H1 + 2 * MIN + 5_000,
    tid: 103,
  }),
  // The delisting: two Settlement trades, their records' Σ px·sz ÷ Σ sz the price.
  ...trade(C, D, {
    coin: "HYPE",
    px: "50",
    sz: "2",
    side: "A",
    time: SETTLE,
    tid: 104,
    dir: "Settlement",
  }),
  ...trade(C, D, {
    coin: "HYPE",
    px: "52",
    sz: "1",
    side: "A",
    time: SETTLE,
    tid: 105,
    dir: "Settlement",
  }),
  // A market trade after it: past the coin's end.
  ...trade(A, B, {
    coin: "HYPE",
    px: "61",
    sz: "1",
    side: "B",
    time: HYPE_END + 1_000,
    tid: 106,
  }),
];
const SETTLEMENT_PRICE = (50 * 2 + 50 * 2 + 52 + 52) / 6;

/** A store built once, on first use. */
function once(make: () => Promise<Store>): () => Promise<Store> {
  let p: Promise<Store> | null = null;
  return () => (p ??= make());
}
const solStore = once(() =>
  storeOf(
    new Map([
      [keyOf(H0), text(SOL_0)],
      [keyOf(H1), text(SOL_1)],
      [keyOf(H2), text(SOL_2)],
    ]),
    H0,
    H2 + HOUR_MS,
  ),
);
const hypeStore = once(() =>
  storeOf(
    new Map([
      [keyOf(H0), text(HYPE_0)],
      [keyOf(H1), text(HYPE_1)],
    ]),
    H0,
    H2,
  ),
);

/** Bars of n minutes from start with no taker. */
function blank(start: number, n: number) {
  return {
    iid: SOL,
    start,
    n,
    trades: new Uint32Array(n),
    sz: new Float64Array(n),
    ntl: new Float64Array(n),
    last: new Float64Array(n).fill(NaN),
    pairGap: new Float64Array(n),
    pairs: new Uint32Array(n),
    settleSz: new Float64Array(n),
    settleNtl: new Float64Array(n),
  };
}

/** SOL's bars over [H0, H2 + 1 h), written out minute by minute. */
function solBars(): Bars {
  const b = blank(H0, 180);
  const put = (
    k: number,
    trades: number,
    sz: number,
    ntl: number,
    last: number,
  ) => {
    b.trades[k] = trades;
    b.sz[k] = sz;
    b.ntl[k] = ntl;
    b.last[k] = last;
  };
  put(0, 2, 3, 100 * 2 + 102, 102);
  put(5, 3, 3, 101 + 100.5 + 100.8, 100.8);
  b.pairs[5] = 1;
  b.pairGap[5] = Math.abs(100.5 - 101) / ((100.5 + 101) / 2);
  put(6, 1, 1, 100, 100);
  put(7, 1, 1, 100.2, 100.2);
  b.pairs[7] = 1;
  b.pairGap[7] = Math.abs(100.2 - 100) / ((100.2 + 100) / 2);
  put(119, 1, 4, 396, 99);
  put(120, 1, 2, 197, 98.5);
  return b;
}

/** A made-up source of SOL's bars partitions, each of `rows` minutes, every column given or zero. */
function stub(
  parts: readonly { start: number; rows: number }[],
  cols: Partial<Record<string, Values>> = {},
  coins: [number, number, number, number, number][] = [],
): BarsSource {
  const partitions: Partition[] = parts.map((x, i) => ({
    table: "bars",
    key: "002",
    month: `2025-${String(8 + i).padStart(2, "0")}`,
    start: x.start,
    rows: x.rows,
    files: {},
  }));
  return {
    manifest: { partitions, counts: { coins } } as unknown as Manifest,
    seal: SEALED,
    column: (p, name) =>
      cols[name] ??
      (name === "trades" || name === "pairs"
        ? new Uint32Array(p.rows)
        : new Float64Array(p.rows)),
  };
}

describe("a coin's bars", { timeout: 60_000 }, () => {
  it("join the store's minutes across a month and across two stores, as the pass and merge wrote them; read from a later minute, the partitions before it left out", async () => {
    const one = await solStore();
    const first = await storeOf(
      new Map([
        [keyOf(H0), text(SOL_0)],
        [keyOf(H1), text(SOL_1)],
      ]),
      H0,
      H2,
    );
    const second = await storeOf(
      new Map([[keyOf(H2), text(SOL_2)]]),
      H2,
      H2 + HOUR_MS,
    );
    expect(readBars([one], SOL, H2 + HOUR_MS)).toEqual(solBars());
    expect(readBars([first, second], SOL, H2 + HOUR_MS)).toEqual(solBars());
    // Read to an END inside the store: its minutes before END only.
    const cut = readBars([one], SOL, H0 + 6 * MIN)!;
    expect(cut.n).toBe(6);
    expect([...cut.trades]).toEqual([2, 0, 0, 0, 0, 3]);
    expect(readBars([one], HYPE, H2 + HOUR_MS)).toBeNull();
    // From a minute of September's partition (the calibration's day, C13): August's left out, the minutes the same; from August's last minute, both.
    const all = solBars();
    const k = (H2 - all.start) / MIN;
    const sep = readBars([one], SOL, H2 + HOUR_MS, H2)!;
    expect([sep.start, sep.n]).toEqual([H2, all.n - k]);
    expect([[...sep.trades], [...sep.ntl]]).toEqual([
      [...all.trades].slice(k),
      [...all.ntl].slice(k),
    ]);
    expect(readBars([one], SOL, H2 + HOUR_MS, H2 - MIN)).toEqual(all);
  });

  it("never open a partition at or after the seal's end: S's minutes under step 1's seal", async () => {
    const files = new Map([
      [
        keyOf(END_E),
        text(
          trade(A, B, { coin: "SOL", side: "B", time: END_E + 1_000, tid: 1 }),
        ),
      ],
    ]);
    const open = { sOpen: true, f2Open: false };
    const sealed = await storeOf(files, END_E, END_E + HOUR_MS, {
      build: open,
    });
    expect(() => readBars([sealed], SOL, END_E + HOUR_MS)).toThrow(SealedError);
    const opened = await storeOf(files, END_E, END_E + HOUR_MS, {
      build: open,
      open,
    });
    expect(readBars([opened], SOL, END_E + HOUR_MS)!.trades[0]).toBe(1);
  });

  it("refuse partitions that overlap or start off a minute, a column of another kind or length, and an END off a minute", () => {
    const read =
      (s: BarsSource, to = H2) =>
      () =>
        readBars([s], SOL, to);
    expect(
      read(
        stub([
          { start: H0, rows: 60 },
          { start: H0 + 30 * MIN, rows: 60 },
        ]),
      ),
    ).toThrow("its start is not a minute after");
    expect(
      read(
        stub([
          { start: H0, rows: 60 },
          { start: H1 + 30_000, rows: 30 },
        ]),
      ),
    ).toThrow("its start is not a minute after");
    expect(
      read(
        stub([{ start: H0, rows: 60 }], {
          sz: new Float32Array(60) as unknown as Values,
        }),
      ),
    ).toThrow("its sz column is not of its kind or length");
    expect(
      read(stub([{ start: H0, rows: 60 }], { pairs: new Uint32Array(59) })),
    ).toThrow("its pairs column is not of its kind or length");
    expect(read(stub([{ start: H0, rows: 60 }]), H1 + 1)).toThrow(
      "is not a minute's start",
    );
  });
});

describe("a coin's end and its objects", { timeout: 60_000 }, () => {
  it("ends at END without a Settlement; at its first Settlement's minute end with one, at the Settlement price; one at or after END is not read", async () => {
    const store = await hypeStore();
    const coin = coinOf([store], HYPE, H2)!;
    expect(coin.end).toBe(HYPE_END);
    expect(coin.settlement).toEqual({ t: SETTLE, price: SETTLEMENT_PRICE });
    expect(coin.bars.n).toBe(120);
    const before = coinOf([store], HYPE, H1 + 2 * MIN)!;
    expect(before.end).toBe(H1 + 2 * MIN);
    expect(before.settlement).toBeNull();
    expect(before.bars.n).toBe(62);
    expect(coinOf([store], SOL, H2)).toBeNull();
    expect(
      coinOf([await solStore()], SOL, H2 + HOUR_MS)!.settlement,
    ).toBeNull();
  });

  it("refuses a first Settlement that its minute's bars do not hold", () => {
    const s = stub([{ start: H0, rows: 60 }], {}, [
      [SOL, 4, H0, H0 + 5 * MIN, H0 + 5 * MIN],
    ]);
    expect(() => coinOf([s], SOL, H1)).toThrow("is not in its minute's bars");
  });

  it("runs from the first market trade's minute to the coin's end, the Settlement minute marked at the Settlement price in both objects", async () => {
    const coin = coinOf([await hypeStore()], HYPE, H2)!;
    const m = coinMarkets(kit, { ...coin, name: "HYPE" }, [], 5)!;
    // Minutes 10 to 62 of the bars: the first market trade's to the Settlement's.
    const start = H0 + 10 * MIN;
    const n = 53;
    const at = (values: Record<number, number>, none: number) =>
      Array.from({ length: n }, (_, i) => values[i] ?? none);
    for (const mk of [m.vwap, m.last]) {
      expect([mk.iid, mk.symbol, mk.start, mk.end, mk.n]).toEqual([
        HYPE,
        "HYPE",
        start,
        HYPE_END,
        n,
      ]);
      expect([mk.firstTrade, mk.retired]).toEqual([start, coin.settlement]);
      expect(mk.marks).toEqual(
        Float64Array.from(at({ 0: 40, 47: 44, 52: SETTLEMENT_PRICE }, NaN)),
      );
    }
    expect([...m.vwap.trades]).toEqual(at({ 0: 1, 47: 1, 52: 1 }, 0));
    expect([...m.vwap.volume]).toEqual(at({ 0: 3, 47: 1, 52: 1 }, 0));
  });

  it("marks the VWAP of the market trades only; the last-price object their last price", async () => {
    const coin = coinOf([await solStore()], SOL, H2 + HOUR_MS)!;
    const m = coinMarkets(kit, { ...coin, name: "SOL" }, [], 5)!;
    expect([m.vwap.start, m.vwap.end, m.vwap.n]).toEqual([
      H0,
      H2 + HOUR_MS,
      180,
    ]);
    const vwap = new Float64Array(180).fill(NaN);
    const last = new Float64Array(180).fill(NaN);
    const put = (k: number, v: number, l: number) => {
      vwap[k] = v;
      last[k] = l;
    };
    put(0, 302 / 3, 102);
    put(5, (101 + 100.5 + 100.8) / 3, 100.8);
    put(6, 100, 100);
    put(7, 100.2, 100.2);
    put(119, 99, 99);
    put(120, 98.5, 98.5);
    expect(m.vwap.marks).toEqual(vwap);
    expect(m.last.marks).toEqual(last);
    // The backstop's, the deleveraging's and the vault's minutes hold no market trade.
    expect([...m.vwap.trades.slice(0, 4)]).toEqual([2, 0, 0, 0]);
  });

  /** A funding window's file of these rows. */
  const windowOf = (
    coin: string,
    rows: readonly { time: number; rate: string }[],
  ) => ({
    key: fundingKey(coin, H0),
    bytes: Buffer.from(
      JSON.stringify(
        rows.map((r) => ({
          coin,
          fundingRate: r.rate,
          premium: "0.0001",
          time: r.time,
        })),
      ),
    ),
  });

  it("takes funding rows by nominal hour (±30 min), each settled at C9's mark; two rows in an hour stop", async () => {
    // H0 + 30 min rounds up to H1; H2 + 29:59.999 down to H2.
    const rows = sealedRows(
      "SOL",
      [
        windowOf("SOL", [
          { time: H0 + 30 * MIN, rate: "0.0000125" },
          { time: H2 + 30 * MIN - 1, rate: "-0.000003" },
        ]),
      ],
      SEALED,
    );
    const coin = {
      ...coinOf([await solStore()], SOL, H2 + HOUR_MS)!,
      name: "SOL",
    };
    const five = coinMarkets(kit, coin, rows, 5)!;
    expect([...five.vwap.funding.hour]).toEqual([H1, H2]);
    expect([...five.vwap.funding.rate]).toEqual([0.0000125, -0.000003]);
    // Before H1 the minutes 54–59 are quiet; before H2 minute 119 holds 99.
    expect([...five.vwap.funding.cumUnmarked]).toEqual([1, 1]);
    expect([...five.vwap.funding.cum]).toEqual([0, -0.000003 * 99]);
    // The 60-minute mark reaches back from minute 59 to minute 7's 100.2.
    const sixty = coinMarkets(kit, coin, rows, 60)!;
    expect([...sixty.vwap.funding.cumUnmarked]).toEqual([0, 0]);
    expect([...sixty.vwap.funding.cum]).toEqual([
      0.0000125 * 100.2,
      0.0000125 * 100.2 + -0.000003 * 99,
    ]);
    expect(() =>
      sealedRows(
        "SOL",
        [
          windowOf("SOL", [
            { time: H1 - 30 * MIN, rate: "0.00001" },
            { time: H1 + 30 * MIN - 1, rate: "0.00001" },
          ]),
        ],
        SEALED,
      ),
    ).toThrow(StoreError);
  });

  it("charges a settled coin's funding row by its hour inside the hold, though stamped after the coin's end; refuses one stamped at END", async () => {
    const coin = { ...coinOf([await hypeStore()], HYPE, H2)!, name: "HYPE" };
    // The coin settles at 23:02:15; its 23:00 row is stamped 23:14, its 00:00 row 23:40.
    const rows = sealedRows(
      "HYPE",
      [
        windowOf("HYPE", [
          { time: H1 + 14 * MIN, rate: "0.00002" },
          { time: H1 + 40 * MIN, rate: "0.00004" },
        ]),
      ],
      SEALED,
    );
    const m = coinMarkets(kit, coin, rows, 5)!;
    expect([...m.vwap.funding.hour]).toEqual([H1, H2]);
    expect([...m.last.funding.hour]).toEqual([H1, H2]);
    // 23:00 at minute 57's 44, two minutes stale; 00:00 past the object's minutes, in no hold.
    expect([...m.vwap.funding.cumUnmarked]).toEqual([0, 1]);
    // A copy open from 22:10 to the coin's end, held through 23:00: charged,
    // and valued at the Settlement price (C8's settled copy).
    const none: Setting = {
      name: "none",
      fee: () => 0,
      spread: () => ({ c: 0, fallback: false }),
    };
    const tIn = H0 + 10 * MIN + 30_000;
    const leg = kit.returns.leg(m.vwap, {
      dir: 1,
      tIn,
      h: coin.end - 1 - tIn,
      setting: none,
    })!;
    expect(leg.funding).toBe((-1 * (0.00002 * 44)) / 40);
    expect(leg.fundingMissing).toBe(0);
    expect(leg.gross).toBe((SETTLEMENT_PRICE - 40) / 40);
    // A row stamped at the reading's END is refused, as the kit refuses one past its cut.
    const late = sealedRows(
      "HYPE",
      [windowOf("HYPE", [{ time: H2, rate: "0.00004" }])],
      SEALED,
    );
    expect(() => coinMarkets(kit, coin, late, 5)).toThrow(StoreError);
  });

  it("has no object for a coin with no market trade before its end", () => {
    const b = blank(H0, 60);
    expect(
      coinMarkets(
        kit,
        { bars: b, end: H1, settlement: null, name: "SOL" },
        [],
        5,
      ),
    ).toBeNull();
  });

  it("gives a minute whose market trades' Σ sz is 0 no mark in either object, its trade still counted (the engine review's L4)", () => {
    const b = blank(H0, 60);
    const put = (k: number, sz: number, last: number) => {
      b.trades[k] = 1;
      b.sz[k] = sz;
      b.ntl[k] = sz * last;
      b.last[k] = last;
    };
    put(0, 2, 100);
    put(3, 0, 101.1);
    put(5, 1, 102);
    const m = coinMarkets(
      kit,
      { bars: b, end: H1, settlement: null, name: "SOL" },
      [],
      5,
    )!;
    expect([m.vwap.marks[3], m.last.marks[3]]).toEqual([NaN, NaN]);
    expect([m.vwap.marks[0], m.last.marks[0], m.last.marks[5]]).toEqual([
      100, 100, 102,
    ]);
    expect([m.vwap.trades[3], m.last.trades[3]]).toEqual([1, 1]);
  });

  it("refuses a funding row of another coin (the engine review's L5)", async () => {
    const coin = {
      ...coinOf([await solStore()], SOL, H2 + HOUR_MS)!,
      name: "SOL",
    };
    const row = (c: string) =>
      sealedRows(c, [windowOf(c, [{ time: H1, rate: "0.00001" }])], SEALED);
    expect(() => coinMarkets(kit, coin, row("ETH"), 5)).toThrow(
      "coin SOL's object given a row of ETH",
    );
    expect([
      ...coinMarkets(kit, coin, row("SOL"), 5)!.vwap.funding.hour,
    ]).toEqual([H1]);
  });
});

describe("C6's primary market", () => {
  it("holds with no Settlement, and with one after t's UTC day; not with one later that day or before t", () => {
    const day = Date.parse("2025-09-10T00:00:00Z");
    const t = day + 9 * HOUR_MS;
    const at = (s: number) => ({ t: s, price: 1 });
    expect(isPrimary(t, null)).toBe(true);
    expect(isPrimary(t, at(day + DAY_MS))).toBe(true);
    expect(isPrimary(t, at(day + DAY_MS - 1))).toBe(false);
    expect(isPrimary(t, at(t))).toBe(false);
    expect(isPrimary(t, at(day - 5 * DAY_MS))).toBe(false);
  });
});

describe("thin legs", () => {
  it("are thin under $1,000 of market-trade notional in the minute and the five before it", () => {
    const b = blank(H0, 20);
    b.ntl.set([100.5, 200.25, 0, 333.375, 165.875, 199.99], 6);
    // Six minutes back: outside the window.
    b.ntl[5] = 5_000;
    const x = H0 + 11 * MIN + 59_999;
    expect(isThin(b, x)).toBe(true);
    b.ntl[11] = 200;
    expect(isThin(b, x)).toBe(false);
    expect(isThin(b, H0 + 11 * MIN)).toBe(false);
    expect(isThin(b, H0 + 12 * MIN)).toBe(true);
    expect(isThin(b, H0 + 10 * MIN + 59_999)).toBe(false);
    expect(isThin(b, H0 - 1)).toBe(true);
  });
});
