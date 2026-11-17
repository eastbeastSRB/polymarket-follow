/**
 * The contexts and the funding (src/polish/ctxs.ts): every case of H10's
 * minute rule against WAVE-H's own `addCtxs` (the mark, its stamp and every
 * count, day by day), the other columns each in its place, a cell that is no
 * number, BTC and ETH apart; the readers on a synthetic store; the funding
 * through WAVE-H's own readers.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { afterAll, describe, expect, it } from "vitest";
import {
  CONTEXT,
  addDay,
  newContexts,
  readContexts,
  readFunding,
} from "../src/polish/ctxs.js";
import { fortyOf } from "../src/polish/writers.js";
import { loadCoins } from "../src/waveh/coins.js";
import { addCtxs, newMarks } from "../src/waveh/ctxs.js";
import { fundingRows, joinFunding } from "../src/waveh/funding.js";
import { ctxsKey, fundingKey } from "../src/waveh/keys.js";
import { StoreError, manifestList } from "../src/waveh/store.js";
import { CTXS_HEAD, cleanScratch, makeStore } from "./waveh-world.js";

afterAll(cleanScratch);

const coins = loadCoins();
const FORTY = fortyOf(coins);
const SMALL = new Set(coins.list.map((c) => c.name));
const MIN = 60_000;
const DAY = 86_400_000;
const D0 = Date.parse("2025-06-10T00:00:00Z");
const stamp = (t: number) => new Date(t).toISOString().replace(".000Z", "Z");

/** A row: `v` gives each CSV column's text by its name, the mark 100 when not given. */
function row(coin: string, t: number, v: Record<string, string> = {}) {
  const cells: Record<string, string> = {
    funding: "0.0000125",
    open_interest: "1000",
    prev_day_px: "99",
    day_ntl_vlm: "5000000",
    premium: "-0.0002",
    oracle_px: "100.1",
    mark_px: "100",
    mid_px: "100.05",
    impact_bid_px: "99.9",
    impact_ask_px: "100.2",
    ...v,
  };
  return [
    stamp(t),
    coin,
    ...CTXS_HEAD.split(",")
      .slice(2)
      .map((name) => cells[name]!),
  ].join(",");
}

function days() {
  // A row stamped at D0 + i minutes gives minute i − 1 (the mark at its end).
  const sol = (i: number) =>
    row("SOL", D0 + i * MIN, { mark_px: `${100 + i}` });
  const d1: string[] = [1, 2, 3, 4, 5].map(sol);
  d1.push(row("SOL", D0 + 5 * MIN + 20_000, { mark_px: "205" })); // off the minute: minute 5 …
  d1.push(...[6, 7, 8, 9, 10].map(sol)); // … then 00:06:00, a later stamp in it, wins
  d1.push(row("SOL", D0 + 6 * MIN, { mark_px: "206" })); // one stamp twice: the first stands
  d1.push(row("kPEPE", D0 + 3 * MIN, { mark_px: "0.01" }));
  d1.push(row("kPEPE", D0 + 3 * MIN, { mark_px: "0.02" })); // one stamp twice: the first stands
  d1.push(row("SOL", D0 + DAY - MIN, { mark_px: "300" })); // minute 23:58
  d1.push(stamp(D0 + 7 * MIN)); // no coin cell
  d1.push(row("TRUMP", D0 + 7 * MIN)); // not one of the 40
  d1.push(row("SOL", D0 + 11 * MIN, { mark_px: "0" })); // fails: a mark of 0
  d1.push(row("SOL", D0 + 12 * MIN, { premium: "abc" })); // kept: premium is no number
  d1.push(row("BTC", D0 + 2 * MIN, { mark_px: "60000" }));
  d1.push(`${stamp(D0 + 4 * MIN)},HYPE,1,2`); // too few cells
  const d2 = [
    row("SOL", D0 + DAY, { mark_px: "301" }), // the next day's 00:00 serves 23:59
    row("SOL", D0 + DAY + 9 * MIN + 30_000, { mark_px: "309" }),
    row("ETH", D0 + DAY + MIN, { mark_px: "2500" }),
  ];
  const d3 = [
    row("SOL", D0 + 2 * DAY + 11 * 3_600_000),
    row("SOL", D0 + 2 * DAY + 13 * 3_600_000), // at or after the end: late
  ];
  return [d1, d2, d3].map((rows) => `${CTXS_HEAD}\n${rows.join("\n")}\n`);
}

const GRID = { start: D0, minutes: 3 * 1440 };
const UNTIL = D0 + 2 * DAY + 12 * 3_600_000;

describe("H10's minute rule, against WAVE-H's own reading", () => {
  const texts = days();
  const theirs = newMarks(coins, D0, D0 + 3 * DAY);
  const mine = newContexts(GRID, FORTY);
  const counts = texts.map((t) => [
    addCtxs(theirs, t, UNTIL),
    addDay(mine, t, UNTIL, SMALL),
  ]);

  it("gives every 38-coin mark, its stamp and every count of a day as WAVE-H does", () => {
    for (const [w, m] of counts) expect(m).toEqual(w);
    expect(counts[0]![1]).toEqual({
      rows: 19,
      failed: 3,
      offMinute: 1,
      late: 0,
      twice: 3,
    });
    expect(counts[2]![1]).toMatchObject({ rows: 2, late: 1 });
    for (const c of coins.list) {
      expect(mine.byCoin.get(c.name)!.get("mark"), c.name).toEqual(
        theirs.byCoin.get(c.name),
      );
      expect(mine.stamps.get(c.name), c.name).toEqual(
        theirs.stamps.get(c.name),
      );
    }
    const sol = mine.byCoin.get("SOL")!.get("mark")!;
    expect([sol[4], sol[5], sol[1438], sol[1439], sol[1440 + 9]]).toEqual([
      105, 106, 300, 301, 309,
    ]);
    expect(mine.byCoin.get("kPEPE")!.get("mark")![2]).toBe(0.01);
  });

  it("puts each column's cell in its own column, a cell that is no number as NaN, and BTC and ETH apart", () => {
    const sol = mine.byCoin.get("SOL")!;
    const want: Record<string, number> = {
      oracle: 100.1,
      mid: 100.05,
      impactBid: 99.9,
      impactAsk: 100.2,
      openInterest: 1000,
      funding: 0.0000125,
      premium: -0.0002,
      dayNtlVlm: 5000000,
      prevDayPx: 99,
    };
    for (const [name] of CONTEXT.slice(1))
      expect(sol.get(name)![0], name).toBe(want[name]);
    expect(sol.get("premium")![11]).toBeNaN();
    expect(sol.get("mark")![11]).toBe(100);
    expect([...mine.badCells]).toEqual([["premium", 1]]);
    expect(mine.byCoin.get("BTC")!.get("mark")![1]).toBe(60000);
    expect(mine.byCoin.get("ETH")!.get("mark")![1440]).toBe(2500);
    expect(mine.large).toEqual({
      rows: 2,
      failed: 0,
      offMinute: 0,
      late: 0,
      twice: 0,
    });
  });
});

describe("the readers on a store", () => {
  it("reads each listed day through the seal and its hash, and stops on a day above WAVE-H's 1% or a day not listed", async () => {
    const texts = days();
    const files = new Map(texts.map((t, i) => [ctxsKey(D0 + i * DAY), t]));
    const { store } = makeStore(files, false);
    const list = manifestList(
      readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
    );
    const read = (l = list, more: string[] = []) =>
      readContexts({
        store,
        list: l,
        days: [D0, D0 + DAY, D0 + 2 * DAY, ...more.map(Number)],
        grid: GRID,
        until: UNTIL,
        forty: FORTY,
        small: SMALL,
        pace: () => Promise.resolve(),
      });
    const c = await read();
    expect([...c.byDay.keys()]).toEqual([
      "2025-06-10",
      "2025-06-11",
      "2025-06-12",
    ]);
    expect(c.byCoin.get("SOL")!.get("mark")![1439]).toBe(301);
    const without = new Map(list);
    without.delete(ctxsKey(D0 + DAY));
    await expect(read(without)).rejects.toThrow(
      `${ctxsKey(D0 + DAY)}: not in the list`,
    );
    const bad = Array.from({ length: 12 }, (_, i) =>
      row("SOL", D0 + 3 * DAY + i * MIN, { mark_px: "-1" }),
    );
    const good = Array.from({ length: 400 }, (_, i) =>
      row("HYPE", D0 + 3 * DAY + i * MIN),
    );
    const w = makeStore(
      new Map([
        [
          ctxsKey(D0 + 3 * DAY),
          `${CTXS_HEAD}\n${[...good, ...bad].join("\n")}\n`,
        ],
      ]),
      false,
    );
    await expect(
      readContexts({
        store: w.store,
        list: manifestList(
          readFileSync(path.join(w.store, "manifest.jsonl"), "utf8"),
        ),
        days: [D0 + 3 * DAY],
        grid: { start: D0 + 3 * DAY, minutes: 1440 },
        until: Infinity,
        forty: FORTY,
        small: SMALL,
        pace: () => Promise.resolve(),
      }),
    ).rejects.toThrow(
      "2025-06-13: 12 of 412 asset_ctxs rows of the small coins fail WAVE-H's schema",
    );
  });

  it("reads each coin's funding windows through WAVE-H's own readers, and refuses two rows of one hour", () => {
    const H = 3_600_000;
    const starts = [D0, D0 + 20 * DAY];
    const reply = (coin: string, hours: number[]) =>
      JSON.stringify(
        hours.map((h) => ({
          coin,
          fundingRate: `${h / 1e12}`,
          premium: "0.0001",
          time: D0 + h * H + 31,
        })),
      );
    const files = new Map([
      [fundingKey("SOL", starts[0]!), reply("SOL", [1, 2, 3])],
      [fundingKey("SOL", starts[1]!), reply("SOL", [20 * 24 + 1, 20 * 24 + 2])],
      [fundingKey("HYPE", starts[0]!), reply("HYPE", [5])],
      [fundingKey("HYPE", starts[1]!), "[]"],
    ]);
    const { store } = makeStore(files, false);
    const list = manifestList(
      readFileSync(path.join(store, "manifest.jsonl"), "utf8"),
    );
    const f = readFunding({
      store,
      list,
      coins: ["SOL", "HYPE"],
      starts,
      until: Infinity,
    });
    const theirs = joinFunding([
      ...fundingRows("SOL", files.get(fundingKey("SOL", starts[0]!))!, Infinity)
        .rows,
      ...fundingRows("SOL", files.get(fundingKey("SOL", starts[1]!))!, Infinity)
        .rows,
    ]);
    expect(f.byCoin.get("SOL")).toEqual(theirs);
    expect(f.byCoin.get("SOL")!.map((r) => r[0])).toEqual(
      [1, 2, 3, 481, 482].map((h) => D0 + h * H),
    );
    expect(f.counts.get("SOL")).toEqual({
      windows: { "2025-06-10": 3, "2025-06-30": 2 },
      failed: 0,
      late: 0,
    });
    expect(f.counts.get("HYPE")).toEqual({
      windows: { "2025-06-10": 1, "2025-06-30": 0 },
      failed: 0,
      late: 0,
    });
    const twice = makeStore(
      new Map([
        [fundingKey("SOL", starts[0]!), reply("SOL", [1, 2])],
        [fundingKey("SOL", starts[1]!), reply("SOL", [2])],
      ]),
      false,
    );
    expect(() =>
      readFunding({
        store: twice.store,
        list: manifestList(
          readFileSync(path.join(twice.store, "manifest.jsonl"), "utf8"),
        ),
        coins: ["SOL"],
        starts,
        until: Infinity,
      }),
    ).toThrow(StoreError);
  });
});
