/**
 * The reproduction on the old weeks (the plan's part 4). The real run reads
 * pre-cut data only — the seed, the kit's pre-cut panel and its pool-weeks
 * labels — and runs only when MARKET1_PRECUT names a JSON file of those paths
 * and of MARKET-FIND's regenerated lists; it writes its report beside it.
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";
import {
  LAUNCH,
  readerKeeps,
  reproduce,
  type Report,
} from "../scripts/market1-reproduce.js";
import { PACKAGE_ROOT } from "../src/market1/gate.js";
import type { StoredRow } from "../src/paper/store.js";
import { DAY_MS } from "../src/schedule.js";

const row = (n: number, t: number): StoredRow => ({
  trade_id: String(n),
  order_id: String(n),
  instrument_id: 8,
  timestamp: t,
  side: "short",
  price: "1",
  quantity: "1",
  previous_size: "1",
  fee: "0",
  pnl: "0",
  taker: true,
  liquidation: true,
});

describe("the reader model of the reproduction (MARKET-PLAN's c1)", () => {
  it("keeps an off-list account's first 1,000 fills a week and a list account's 5,000 a day", () => {
    const week = Array.from({ length: 1_200 }, (_, i) =>
      row(i, LAUNCH + 7 * DAY_MS + i * 1_000),
    );
    expect(readerKeeps(week, () => false)).toHaveLength(1_000);
    expect(readerKeeps(week, () => false).at(-1)!.trade_id).toBe("999");
    expect(readerKeeps(week, () => true)).toHaveLength(1_200);
    const day = Array.from({ length: 5_003 }, (_, i) =>
      row(i, LAUNCH + 7 * DAY_MS + i),
    );
    expect(readerKeeps(day, () => true)).toHaveLength(5_000);
    expect(readerKeeps([row(1, LAUNCH - 1)], () => true)).toEqual([]);
  });
});

const config = process.env.MARKET1_PRECUT;

describe.runIf(config !== undefined)(
  "the reproduction on the real old weeks (pre-cut data only)",
  () => {
    let report: Report;
    let mf: {
      fills: {
        addr: string;
        iid: number;
        ts: number;
        s: number;
        tid: string;
      }[];
      u2: { iid: number; t0: number; dir: number }[];
    };
    beforeAll(async () => {
      const c = JSON.parse(readFileSync(config!, "utf8")) as {
        seedDir: string;
        panelDir: string;
        labels: string;
        lists: string;
        out: string;
      };
      for (const p of [c.seedDir, c.panelDir, c.labels, c.lists])
        if (!existsSync(p)) throw new Error(`missing ${p}`);
      mf = JSON.parse(readFileSync(c.lists, "utf8")) as typeof mf;
      report = await reproduce({
        packageRoot: PACKAGE_ROOT,
        seedDir: c.seedDir,
        panelDir: c.panelDir,
        labels: c.labels,
      });
      const { fills, positions, markets, ...figures } = report;
      void [fills, positions, markets];
      writeFileSync(c.out, `${JSON.stringify(figures, null, 2)}\n`);
    }, 600_000);

    it("counts MARKET-FIND's 727 fills, fill for fill, and its 153 entries, entry for entry", () => {
      expect(report.countedFills).toBe(727);
      const key = (a: string, iid: number, t: number, s: number, tid: string) =>
        `${a}|${iid}|${t}|${s}|${tid}`;
      expect(
        new Set(
          report.fills.map((f) => key(f.addr, f.iid, f.t, f.side, f.tid)),
        ),
      ).toEqual(
        new Set(mf.fills.map((f) => key(f.addr, f.iid, f.ts, f.s, f.tid))),
      );
      expect(report.entries.map((e) => `${e.iid}|${e.t}|${e.side}`)).toEqual(
        mf.u2.map((e) => `${e.iid}|${e.t0}|${e.dir}`),
      );
    });

    it("prints MARKET-FIND's figures for WAVE and the lines beside", () => {
      const w = report.WAVE;
      expect([w.positions, w.days, w.markets, w.sells, w.buys]).toEqual([
        153, 47, 30, 114, 39,
      ]);
      expect(w.onMarks).toMatchObject({
        n: 153,
        mean: 309.7,
        se: 67.7,
        seDay: 60.1,
        seMarket: 53.8,
      });
      expect(w.excess).toMatchObject({ mean: 311.3, se: 68.7 });
      expect(w.additiveNet).toMatchObject({ mean: 297.1, se: 67.8 });
      // M10 takes the larger one-way error where it exceeds the two-way; MARKET-FIND's cr2 printed the two-way.
      expect(w.own).toMatchObject({ mean: 74.9, se: 49.9, cr2: 48.7 });
      expect(report.readerModel).toEqual({ countedFills: 661, entries: 138 });
      const r = report;
      const pairs: [unknown, Record<string, number>][] = [
        [r.B1, { n: 383, mean: 131.9, cr2: 35.1, se: 37.7 }],
        [r.B1.additiveNet, { n: 383, mean: 119.5, cr2: 35.3, se: 37.7 }],
        [r.B2, { n: 254, mean: 22.0, cr2: 34.9, se: 42.3 }],
        [r.B3_60, { n: 150, mean: 292.9, se: 72.7 }],
        [r.B3_180, { n: 149, mean: 309.6, se: 83.1 }],
        [r.B4, { n: 164, mean: 274.7, se: 58.9 }],
        [r.B5, { n: 76, mean: 434.5, se: 97.1 }],
        [r.B6_SELLS, { n: 114, mean: 274.2, se: 84.1 }],
        [r.B6_BUYS, { n: 39, mean: 413.4, cr2: 98.0, se: 100.3 }],
        [r.B7_BTC, { n: 153, mean: 61.6, se: 37.4 }],
        [r.B7_ETH, { n: 153, mean: 111.3, se: 48.7 }],
        [r.B10, { n: 222, mean: 5.3, se: 24.4 }],
      ];
      for (const [got, want] of pairs) expect(got).toMatchObject(want);
      expect([r.episodes, r.largeEpisodes]).toEqual([386, 225]);
      expect(r.B11).toEqual({
        worstDay: { day: "2026-09-09", sum: -1875.2, positions: 5 },
        largestFall: 2370.3,
        mostOpen: 19,
        worst: -1101.9,
        worstFivePct: -699.4,
      });
    });
  },
);
