/**
 * The prices' phase (src/copyh/phase-prices.ts; rules.md C7–C11, C13), on
 * the phases' made-up world with a dense SOL tape (two accounts outside the
 * built bucket trading every 5 minutes, a dip of 4% for an hour) and hourly
 * funding, through real child processes after LABELS, BUILD and REMOVAL:
 * the P1 account's copy priced as the rules name each reading, each
 * computed here from the market objects, settings and removal tables with
 * the arguments written out — the money on the VWAP object with the taker
 * setting; d and x′ in each of its lines with that line's table at M2;
 * STOP2 closed at the dip, STOP5 not; DAYS7 past END the copy itself; JUMP;
 * DELAY0 and LAST on the last prices, DELAY+5 and DELAY+15 on the VWAP,
 * each at its own delay with MAIN's table; the cascade's and Binance's
 * prints; a coin without an object giving every reading its reason.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { DAYS7_MS, jumpRatio, stopInstant } from "../src/paper/copy.js";
import { loadResearch } from "../src/paper/research.js";
import { STOPS } from "../src/copyh/design.js";
import { runPhase } from "../src/copyh/engine.js";
import { dOf, edgeOf, removedBy } from "../src/copyh/judge.js";
import { MOVED } from "../src/copyh/lines.js";
import { coinMarkets, coinOf } from "../src/copyh/markets.js";
import { moneyOf, planOf, stopUntil } from "../src/copyh/money.js";
import { buildParts, coinCopies, coinsOf } from "../src/copyh/phase-build.js";
import { coinReadingOf } from "../src/copyh/phase-coin.js";
import {
  ENTRY_UNPRICED,
  positionsOf,
  priceCoin,
  pricesParts,
  type Position,
} from "../src/copyh/phase-prices.js";
import { removalParts, removalTablesOf } from "../src/copyh/phase-removal.js";
import { sha256 } from "../src/copyh/run.js";
import { settingsOf } from "../src/copyh/setting.js";
import { HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import { COINS, addr, trade } from "./copyh-world.js";
import {
  END,
  M1,
  M2,
  SEAL,
  START,
  at,
  engineDir,
  fundingWorld,
  labelsRun,
  phaseOf,
  phaseWorld,
} from "./copyh-phase-world.js";

const kit = await loadResearch();
const SOL = 2;
const Y = addr(0xf03);
const Z = addr(0xf04);
/** The dip: an hour of SOL at 96.5, four hours after A's entry at(1, 10). */
const DIP = [at(1, 14), at(1, 15)] as const;
/** Y takes from Z every 5 minutes (each hour's minutes 1, 6, …: the legs' own minutes) from a day before M2 to END, $1,000 or more each, the price uneven, 96.5 in the dip; and 1 s later on the other side at an uneven gap, a spread pair (C9) in each such minute. */
function dense(): [number, string][] {
  const out: [number, string][] = [];
  let k = 0;
  for (let t = at(-1, 0) + MINUTE_MS; t < END; t += 5 * MINUTE_MS, k++) {
    const px =
      t >= DIP[0] && t < DIP[1]
        ? "96.5"
        : (100 + ((k * 7) % 11) / 10).toFixed(1);
    const side = k % 2 === 0 ? "B" : "A";
    for (const r of trade(Y, Z, {
      coin: "SOL",
      side,
      sz: String(10 + 10 * (k % 3)),
      px,
      time: t,
      tid: 50_000 + 2 * k,
      oid: 50_000 + 2 * k,
    }))
      out.push([t, r]);
    for (const r of trade(Y, Z, {
      coin: "SOL",
      side: side === "B" ? "A" : "B",
      sz: "10",
      px: (Number(px) + 0.1 + (k % 4) * 0.1).toFixed(1),
      time: t + 1_000,
      tid: 50_001 + 2 * k,
      oid: 50_001 + 2 * k,
    }))
      out.push([t + 1_000, r]);
  }
  return out;
}
const world = await phaseWorld(dense());
const hoursOf = (from: number, to: number) => {
  const out: number[] = [];
  for (let h = from; h < to; h += HOUR_MS) out.push(h);
  return out;
};
const F = fundingWorld([
  {
    coin: "SOL",
    start: START,
    rows: hoursOf(START, END).map((h, k): [number, string] => [
      h + 3 + (k % 97),
      (((k % 7) - 3) * 1e-5).toFixed(6),
    ]),
  },
]);
const recordSha = (dir: string) =>
  sha256(readFileSync(path.join(dir, "record.json")));

/** LABELS, BUILD and REMOVAL on bucket 01, then PRICES on SOL at a settlement mark. */
async function pricesRun(markMinutes: 5 | 60) {
  const engine = engineDir();
  const l = await labelsRun(world, engine);
  const parts = buildParts({
    ...world.reading,
    code: "made-up",
    end: END,
    stage: [M1, END],
    mondays: [M1, M2],
    labels: [recordSha(l.dirs.labels), null],
    limits: { fills: 1e9, exits: 1e9 },
    lane: null,
  }).filter((p) => p.id === "b001");
  const build = phaseOf(engine, "BUILD", "phase-build.js", "buildPart", parts, {
    ...world.context,
    labels: l.dirs.labels,
    large: l.dirs.large,
  });
  const buildRecord = await runPhase(build);
  const coins = coinsOf(build.dir, buildRecord);
  const removal = phaseOf(
    engine,
    "REMOVAL",
    "phase-removal.js",
    "removalPart",
    removalParts(
      {
        code: "made-up",
        build: [recordSha(build.dir), null],
        mondays: [M1, M2],
      },
      coins,
    ),
    { build: build.dir, large: path.join(engine, "build-l") },
  );
  const removalRecord = await runPhase(removal);
  const context = {
    ...world.context,
    roots: [...world.context.roots, F.root],
    build: build.dir,
    large: path.join(engine, "build-l"),
    fundingStore: F.store,
    fundingList: F.list,
    removal: removal.dir,
  };
  const inputs = {
    ...world.reading,
    code: "made-up",
    build: [recordSha(build.dir), null] as [string, null],
    end: END,
    funding: F.sha256,
    removal: recordSha(removal.dir),
    mondays: [M1, M2],
    markMinutes,
  };
  const prices = phaseOf(
    engine,
    "PRICES",
    "phase-prices.js",
    "pricesPart",
    pricesParts(
      inputs,
      coins.map((iid) => [iid, COINS[iid]!] as const),
    ),
    context,
  );
  const record = await runPhase(prices);
  return {
    copies: coinCopies(build.dir, buildRecord, SOL),
    tables: removalTablesOf(removal.dir, removalRecord, SOL),
    rows: coinReadingOf(context, { ...inputs, iid: SOL, coin: "SOL" }, SEAL)
      .rows,
    positions: positionsOf(prices.dir, record, "c002") as Position[],
  };
}

const run5 = await pricesRun(5);

describe("the prices' phase (C7–C11, C13)", { timeout: 60_000 }, () => {
  it("prices the copy as each rule names it, every reading computed here from the objects, settings and tables", () => {
    const r = run5;
    expect(r.copies).toHaveLength(1);
    expect(r.positions).toHaveLength(1);
    const c = r.copies[0]!;
    const pos = r.positions[0]!;
    const coin = { ...coinOf([world.store], SOL, END)!, name: "SOL" };
    const mk = coinMarkets(kit, coin, r.rows, 5)!;
    const s = settingsOf(kit, coin.bars);
    const tIn = c.t + c.D;
    const f = { dir: c.dir, t: c.t, D: c.D };
    const money = (
      plan: typeof c.plan,
      setting = s.taker,
      m = mk.vwap,
      x = tIn,
    ) => moneyOf(kit, m, { dir: c.dir, tIn: x, plan }, setting);
    const judged = (
      m: typeof mk.vwap,
      g: typeof f,
      line: "MAIN" | "BROAD" | "DAY",
    ) => {
      const d = dOf(
        kit,
        m,
        g,
        c.covariates.longShare,
        removedBy(r.tables.get(`1|${line}`)),
      );
      return { ...d, edge: edgeOf(kit, m, g, s.taker, d) };
    };
    // The copy as BUILD planned it, its money and thin flag.
    expect(pos).toMatchObject(c);
    expect(pos.money).toEqual(money(c.plan));
    expect(pos.money.reason).toBeUndefined();
    expect(pos.thin).toBe(false);
    // d and x′ in each line, with that line's table at M2 (index 1).
    expect(Object.keys(pos.judged)).toEqual(["MAIN", "BROAD", "DAY"]);
    for (const line of ["MAIN", "BROAD", "DAY"] as const)
      expect(pos.judged[line]).toEqual(judged(mk.vwap, f, line));
    expect(pos.judged.MAIN!.d).not.toBeNull();
    // MAIN's own lines.
    const until = stopUntil(c.plan, c.D, END);
    const stops = STOPS.map((stop) =>
      stopInstant(kit, mk.vwap, { dir: c.dir, tIn }, stop, until),
    );
    expect(stops[0]).not.toBeNull();
    expect(stops[1]).toBeNull();
    expect(pos.main!.stop.STOP2).toEqual(
      money(planOf(c, c.exits, coin, stops[0])),
    );
    expect(pos.main!.stop.STOP2).not.toEqual(pos.money);
    expect(pos.main!.stop.STOP5).toEqual(pos.money);
    expect(pos.main!.days7).toEqual(
      money(planOf(c, c.exits, coin, tIn + DAYS7_MS)),
    );
    expect(pos.main!.jump).toEqual(jumpRatio(kit, mk.vwap, c.t));
    for (const v of MOVED) {
      const D = v.delay(c.D);
      const m = mk[v.marks];
      expect(pos.main!.moved[v.line], v.line).toEqual({
        money: money(planOf({ t: c.t, D }, c.exits, coin), s.taker, m, c.t + D),
        judged: judged(m, { dir: c.dir, t: c.t, D }, "MAIN"),
      });
    }
    expect(pos.main!.moved.DELAY0.money).not.toEqual(pos.money);
    expect(pos.main!.cascade).toEqual({
      money: money(c.plan, s.cascade),
      edge: edgeOf(kit, mk.vwap, f, s.cascade, pos.judged.MAIN!),
    });
    expect(pos.main!.cascade.money).not.toEqual(pos.money);
    expect(pos.main!.binance).toEqual(money(c.plan, s.binance));
    expect(pos.main!.binance).not.toEqual(pos.money);
  });

  it("gives every reading of a coin without an object its reason: no mark at the follow instant, d entry unpriced", () => {
    const c = run5.copies[0]!;
    const [pos] = priceCoin(kit, [c], {
      coin: null,
      rows: [],
      tables: new Map(),
      mondays: [M1, M2],
      markMinutes: 5,
    });
    const none = { reason: "no mark at the follow instant" };
    const unjudged = { d: null, reason: ENTRY_UNPRICED, edge: null };
    expect(pos).toMatchObject({
      thin: true,
      money: none,
      judged: { MAIN: unjudged, BROAD: unjudged, DAY: unjudged },
      main: {
        stop: { STOP2: none, STOP5: none },
        days7: none,
        jump: null,
        cascade: { money: none, edge: null },
        binance: none,
      },
    });
    for (const v of MOVED)
      expect(pos!.main!.moved[v.line]).toEqual({
        money: none,
        judged: unjudged,
      });
  });
});
