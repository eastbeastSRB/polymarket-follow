/**
 * The calibration prints (src/copyh/ctxs.ts, phase-calibration.ts; rules.md
 * C13, C15 (c) 11; the supervisor's rulings of 2026-11-27 10:25Z), two
 * prices of one moment only:
 * - the asset_ctxs reader, as WAVE-H reads its marks: a minute from the row
 *   of the latest stamp in (m, m + 1 min], the first line on a tie; another
 *   coin's row skipped, a failed row counted, a row at or after the bound
 *   never used; the impact prices of that row;
 * - a cell pairs a minute's tape with that same minute's row alone: never a
 *   difference of two instants;
 * - a book's half-spread and its $1,000 walk from each side, a level crossed;
 *   the book half's days and coins from the book list;
 * - on the phases' world, through real child processes: the mark half's day
 *   held to WAVE-H's list, its one cell at A's trade minute (a row stamped
 *   at that minute's start belongs to the minute before and pairs with
 *   nothing); the book half's one cell, from the last snapshot at or before
 *   the hour start in the hour files WAVE-H reads, against C9's c.
 */
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { ctxsOf } from "../src/copyh/ctxs.js";
import { SPREAD_FALLBACK } from "../src/copyh/design.js";
import { runPhase } from "../src/copyh/engine.js";
import { readBars } from "../src/copyh/markets.js";
import {
  WALK_USD,
  booksOf,
  booksParts,
  bookCell,
  cellsOf,
  marksOf,
  marksParts,
} from "../src/copyh/phase-calibration.js";
import { StoreError, sha256 } from "../src/copyh/run.js";
import { spreadsOf } from "../src/copyh/setting.js";
import { toBook } from "../src/market1/book.js";
import { loadResearch } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import {
  CALIBRATION_DAY,
  END,
  engineDir,
  minuteOf,
  phaseOf,
  phaseWorld,
  wavehWorld,
} from "./copyh-phase-world.js";

const kit = await loadResearch();
const HEADER =
  "time,coin,funding,open_interest,prev_day_px,day_ntl_vlm,premium,oracle_px,mark_px,mid_px,impact_bid_px,impact_ask_px";
const DAY = Date.parse("2025-09-16T00:00:00Z");
const row = (time: string, coin: string, mark: string, bid = "", ask = "") =>
  `${time},${coin},0.00001,10,100,1000,0,${mark},${mark},${mark},${bid},${ask}`;
const SOL = 2;

describe("the asset_ctxs reader (C13's mark half)", () => {
  it("gives each minute the row of the latest stamp in (m, m + 1 min], the first line on a tie; another coin skipped, a failed row counted, a row at or after the bound unused; the impact prices of that row", () => {
    const text = [
      HEADER,
      row("2025-09-16T00:01:00Z", "SOL", "100", "99.9", "100.1"),
      row("2025-09-16T00:01:00Z", "SOL", "101", "99", "103"),
      row("2025-09-16T00:01:30Z", "SOL", "102"),
      row("2025-09-16T00:02:00Z", "SOL", "103", "102.9", "103.1"),
      row("2025-09-16T00:03:00Z", "BTC", "50000"),
      row("2025-09-16T00:04:00Z", "SOL", "x"),
      row("2025-09-16T00:05:00Z", "", "1"),
      row("2025-09-16T00:06:00Z", "SOL", "104"),
      row("2025-09-16T00:30:00Z", "SOL", "105"),
      "",
    ].join("\n");
    const { byCoin, count } = ctxsOf(
      text,
      new Set(["SOL"]),
      DAY,
      DAY + 30 * MINUTE_MS,
    );
    expect([...byCoin.keys()]).toEqual(["SOL"]);
    const d = byCoin.get("SOL")!;
    expect([d.mark[0], d.bid[0], d.ask[0]]).toEqual([100, 99.9, 100.1]);
    expect([d.mark[1], d.bid[1], d.ask[1]]).toEqual([103, 102.9, 103.1]);
    expect(d.mark[5]).toBe(104);
    expect([Number.isNaN(d.bid[5]!), Number.isNaN(d.ask[5]!)]).toEqual([
      true,
      true,
    ]);
    for (const k of [2, 3, 4, 6, 29])
      expect(Number.isNaN(d.mark[k]!), String(k)).toBe(true);
    expect(count).toEqual({ rows: 8, failed: 2, late: 1, twice: 2 });
    expect(() => ctxsOf("time,coin\n", new Set(), DAY, DAY + DAY_MS)).toThrow(
      /asset_ctxs header/,
    );
  });

  it("pairs a minute's tape with that same minute's row alone: never a difference of two instants", () => {
    const tape = (k: number) => [100, 102, Number.NaN, 106][k] ?? Number.NaN;
    const nan = Number.NaN;
    const c = cellsOf(tape, {
      mark: Float64Array.of(100, 102, 104, nan),
      bid: Float64Array.of(99, nan, 103, nan),
      ask: Float64Array.of(101, 103, 105, nan),
    });
    // A pairing shifted by a minute would read 102 against 100, or 106 against 104.
    expect(c.mark).toEqual([0, 0]);
    expect(c.impactMid).toEqual([0]);
    expect(c.impactHalf).toEqual([100]);
  });
});

describe("the book half's pieces (C13)", () => {
  it("gives a book's half-spread and its $1,000 walk from each side, a level crossed, in bps; none for a book not usable", () => {
    const book = toBook(
      0,
      [
        ["99.9", "5"],
        ["99.8", "100"],
      ],
      [
        ["100.1", "5"],
        ["100.2", "100"],
      ],
    );
    const buy = 1000 / (5 + (1000 - 100.1 * 5) / 100.2);
    const sell = 1000 / (5 + (1000 - 99.9 * 5) / 99.8);
    const cell = bookCell(book, 1000)!;
    expect(cell.half).toBeCloseTo((0.1 / 100) * 1e4, 9);
    expect(cell.walk).toBeCloseTo(
      ((buy - 100 + (100 - sell)) / 2 / 100) * 1e4,
      9,
    );
    expect(cell.walk).toBeGreaterThan(cell.half);
    expect(
      bookCell(toBook(0, [["100", "1"]], [["100", "1"]]), 1000),
    ).toBeNull();
  });

  it("takes the book half's days, before END, each with the coins it holds books of", () => {
    const parts = booksParts(
      {
        stores: [],
        dirs: "d",
        code: "made-up",
        end: Date.parse("2025-09-17T00:00:00Z"),
        list: "0".repeat(64),
      },
      [
        "market_data/20250916/10/l2Book/SOL.lz4",
        "market_data/20250916/11/l2Book/BTC.lz4",
        "market_data/20250916/12/l2Book/NONE.lz4",
        "market_data/20250915/23/l2Book/SOL.lz4",
        "market_data/20250917/0/l2Book/SOL.lz4",
        "asset_ctxs/20250916.csv.lz4",
      ],
      new Map([
        ["BTC", 0],
        ["SOL", 2],
      ]),
    );
    expect(
      parts.map((p) => [p.id, (p.inputs as { coins: unknown }).coins]),
    ).toEqual([
      ["d20250915", [[2, "SOL"]]],
      [
        "d20250916",
        [
          [0, "BTC"],
          [2, "SOL"],
        ],
      ],
    ]);
  });
});

describe(
  "the calibration on the phases' world, through real child processes",
  { timeout: 120_000 },
  () => {
    it("pairs A's trade minute with its own row, held to WAVE-H's list; reads the book half's one cell from the last snapshot at or before the hour start, against C9's c", async () => {
      const world = await phaseWorld();
      const trade = 600;
      expect(minuteOf(trade)).toBe(CALIBRATION_DAY + 10 * HOUR_MS);
      const w = wavehWorld({
        rows: [
          [minuteOf(trade), "200", "", ""],
          [minuteOf(trade + 1), "100.05", "99.95", "100.15"],
        ],
        books: new Map([
          [
            CALIBRATION_DAY + 10 * HOUR_MS,
            [
              [
                CALIBRATION_DAY + 11 * HOUR_MS - 2_000,
                [["99.9", "100"]],
                [["100.1", "100"]],
              ],
            ],
          ],
        ]),
      });
      const context = {
        ...world.context,
        roots: [...world.context.roots, w.root],
        wavehStore: w.store,
      };
      const coins: [number, string][] = [[SOL, "SOL"]];
      const engine = engineDir();
      const marks = phaseOf(
        engine,
        "CALIBRATION-MARKS",
        "phase-calibration.js",
        "marksPart",
        marksParts(
          {
            ...world.reading,
            code: "made-up",
            end: END,
            coins,
            list: sha256(readFileSync(w.list)),
          },
          [CALIBRATION_DAY],
        ),
        { ...context, wavehList: w.list },
      );
      const [day] = marksOf(marks.dir, await runPhase(marks));
      const bars = readBars([world.store], SOL, END)!;
      const j = (minuteOf(trade) - bars.start) / MINUTE_MS;
      const tape = bars.ntl[j]! / bars.sz[j]!;
      const bps = (a: number, b: number) => ((a - b) / b) * 1e4;
      const mid = (99.95 + 100.15) / 2;
      expect(day).toEqual({
        day: CALIBRATION_DAY,
        count: { rows: 2, failed: 0, late: 0, twice: 0 },
        byCoin: {
          SOL: {
            mark: [bps(tape, 100.05)],
            impactMid: [bps(tape, mid)],
            impactHalf: [((100.15 - 99.95) / 2 / mid) * 1e4],
          },
        },
      });
      const books = phaseOf(
        engine,
        "CALIBRATION-BOOKS",
        "phase-calibration.js",
        "booksPart",
        booksParts(
          {
            ...world.reading,
            code: "made-up",
            end: END,
            list: sha256(readFileSync(w.books)),
          },
          [`market_data/20250916/10/l2Book/SOL.lz4`],
          new Map([["SOL", SOL]]),
        ),
        { ...context, booksList: w.books },
      );
      const [b] = booksOf(books.dir, await runPhase(books));
      const s = spreadsOf(kit, bars)(CALIBRATION_DAY + 11 * HOUR_MS);
      expect(s).toEqual({ c: SPREAD_FALLBACK, fallback: true });
      // At 10:00 the snapshot is later than the hour start; at 11:00 the hour before's file gives it.
      const cell = bookCell(
        toBook(0, [["99.9", "100"]], [["100.1", "100"]]),
        WALK_USD,
      )!;
      expect(b).toEqual({
        day: CALIBRATION_DAY,
        byCoin: {
          SOL: {
            half: [cell.half],
            walk: [cell.walk],
            c: [SPREAD_FALLBACK * 1e4],
            fallback: 1,
          },
        },
      });
      // The day file changed after its list: refused (exit 5), never read.
      writeFileSync(
        path.join(w.store, "asset_ctxs", "20250916.csv.lz4"),
        "changed",
      );
      const again = phaseOf(
        engineDir(),
        "CALIBRATION-MARKS",
        "phase-calibration.js",
        "marksPart",
        marks.parts,
        { ...context, wavehList: w.list },
      );
      await expect(runPhase(again)).rejects.toThrow(StoreError);
    });
  },
);
