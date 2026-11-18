/**
 * A world in memory for the exploration's steps, with known answers: 16
 * small coins whose minute price follows a seeded random walk over the whole
 * grid, a wave every 2 days in each coin (two accounts a minute apart,
 * forced sells and forced buys in turn) from E's start to C's end, a tape
 * one level deep at the minute's price (2 bps either side of it), no
 * funding, no notional. With `effect`, the price rises 150 bps over the 24
 * hours after each forced sell's entry: S1's planted edge. `netOf` prices a
 * position by H9's formulas written out, the independent reference.
 */
import { byM4 } from "../src/market1/fills.js";
import { ENTRY_DELAY_MS, HOLD_MS } from "../src/market1/price.js";
import type { Research } from "../src/paper/research.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../src/schedule.js";
import type { Data } from "../src/polish/tries/data.js";
import type { Forced } from "../src/polish/tries/forced.js";
import { fortyOf } from "../src/polish/writers.js";
import { loadCoins } from "../src/waveh/coins.js";
import type { Counted } from "../src/waveh/fills.js";
import { DATA_END } from "../src/waveh/instants.js";
import { addr } from "./polish-world.js";

export const START = Date.parse("2025-05-25T00:00:00Z");
export const MINUTES = (DATA_END - START) / MINUTE_MS;
export const SPREAD = 0.0002;
const FIRST = Date.parse("2025-06-01T00:00:00Z");
const LAST = Date.parse("2026-05-25T00:00:00Z");

export type World = Data & {
  /** The coins' price columns, by asset id. */
  prices: Map<number, Float64Array>;
};

export function makeWorld(kit: Research, effect: boolean, seed = 7): World {
  const coins = loadCoins();
  const sixteen = coins.list.slice(0, 16);
  let s = seed;
  const rand = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  const counted: Counted[] = [];
  const sells = new Map<number, number[]>();
  sixteen.forEach((c, j) => {
    const at: number[] = [];
    for (
      let t = FIRST + j * 3 * HOUR_MS, w = 0;
      t < LAST;
      t += 2 * DAY_MS, w++
    ) {
      const side = w % 2 === 0 ? -1 : 1;
      const a = 2 * (j * 1_000 + w);
      counted.push(
        {
          t,
          iid: c.assetId,
          addr: addr(a),
          side,
          tid: String(2 * a),
          method: "market",
        },
        {
          t: t + MINUTE_MS,
          iid: c.assetId,
          addr: addr(a + 2),
          side,
          tid: String(2 * a + 1),
          method: "market",
        },
      );
      if (side === -1) at.push(t + MINUTE_MS);
    }
    sells.set(c.assetId, at);
  });
  counted.sort(byM4);
  const prices = new Map<number, Float64Array>();
  for (const c of sixteen) {
    const lift = new Float64Array(MINUTES);
    if (effect)
      for (const t of sells.get(c.assetId)!) {
        const k0 = Math.floor((t + ENTRY_DELAY_MS - START) / MINUTE_MS);
        for (let k = 0; k <= 1_440; k++) lift[k0 + k] = (0.015 * k) / 1_440;
      }
    const pc = new Float64Array(MINUTES);
    let walk = 0;
    for (let k = 0; k < MINUTES; k++) {
      walk += 3e-5 * (rand() - 0.5);
      // A lift holds after its day: each sell's 150 bps stay in the price.
      pc[k] = 100 * Math.exp(walk + lift[k]!);
      if (k > 0 && lift[k] === 0 && lift[k - 1]! > 0) walk += lift[k - 1]!;
    }
    prices.set(c.assetId, pc);
  }
  const nan = new Float64Array(MINUTES).fill(NaN);
  const zero = new Float64Array(MINUTES);
  const ones = new Float64Array(counted.length).fill(1);
  const forced: Forced = {
    t: Float64Array.of(),
    coin: Uint16Array.of(),
    user: Uint32Array.of(),
    side: Int8Array.of(),
    backstop: Uint8Array.of(),
    coins: [],
    px: ones.map(() => 100),
    sz: ones,
    markPx: ones.map(() => 100),
  };
  const byName = new Map(sixteen.map((c) => [c.name, prices.get(c.assetId)!]));
  return {
    kit,
    start: START,
    minutes: MINUTES,
    coins,
    counted,
    forced,
    pc: new Map([...fortyOf(coins)].map((c) => [c, byName.get(c) ?? nan])),
    column: (_coin, name) => (name.endsWith("Ntl") ? zero : nan),
    funding: () => [],
    levels: (coin, buy, x) => {
      const p = byName.get(coin)?.[Math.floor((x - START) / MINUTE_MS)];
      return p === undefined || Number.isNaN(p)
        ? []
        : [[p * (buy ? 1 + SPREAD : 1 - SPREAD), 1e9]];
    },
    prices,
  };
}

/** H9's net written out for this world's one-level tape: in at x_in's minute price, out at x_out's, 4.5 bps a leg, no funding. */
export function netOf(
  w: World,
  iid: number,
  dir: 1 | -1,
  xIn: number,
  xOut = xIn + HOLD_MS,
): number {
  const pc = w.prices.get(iid)!;
  const at = (x: number) => pc[Math.floor((x - START) / MINUTE_MS)]!;
  const pIn = at(xIn) * (1 + dir * SPREAD);
  const pOut = at(xOut) * (1 - dir * SPREAD);
  const Q = 1_000 / pIn;
  const k = 1e4 / 1_000;
  return (
    dir * (pOut - pIn) * Q * k - (0.00045 * 1_000 + 0.00045 * pOut * Q) * k
  );
}
