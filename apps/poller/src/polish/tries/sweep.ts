/**
 * The one sweep of the tape a step makes for every leg of its positions
 * (POLISH-EXPLORE's plan 4.2; the polishing plan's review F18): each
 * distinct leg (the coin, buy or sell, its instant) read once, the legs in
 * the order of the coin and the instant, so each coin-month is read once and
 * a leg across a month's end reads the two kept; `pace` before each new
 * coin-month.
 */
import type { Level } from "../../market1/book.js";
import { monthOf } from "../../waveh/instants.js";
import type { Data } from "./data.js";

/** A position to price: the coin's asset id, against the forced side (+1 long), in at x_in, out at x_out. */
export type Spec = { iid: number; dir: 1 | -1; xIn: number; xOut: number };

/** A leg's uses: each position whose entry (`exit` false) or exit is the leg. */
export type Use = { spec: number; exit: boolean };

/** Every distinct leg of `specs` in the sweep's order, with its levels and its uses. */
export async function eachLeg(
  d: Data,
  specs: readonly Spec[],
  pace: () => Promise<void>,
  visit: (
    leg: { coin: string; buy: boolean; x: number },
    levels: readonly Level[],
    uses: readonly Use[],
  ) => void,
): Promise<void> {
  const names = new Map(d.coins.list.map((c) => [c.assetId, c.name]));
  // Use 2k is position k's entry, 2k + 1 its exit; the entry buys for a long, the exit sells.
  const n = 2 * specs.length;
  const coin = new Int32Array(n);
  const x = new Float64Array(n);
  const buy = new Uint8Array(n);
  specs.forEach((s, k) => {
    coin[2 * k] = coin[2 * k + 1] = s.iid;
    x[2 * k] = s.xIn;
    x[2 * k + 1] = s.xOut;
    buy[2 * k] = s.dir > 0 ? 1 : 0;
    buy[2 * k + 1] = s.dir > 0 ? 0 : 1;
  });
  const order = Uint32Array.from({ length: n }, (_, i) => i).sort(
    (a, b) => coin[a]! - coin[b]! || x[a]! - x[b]! || buy[a]! - buy[b]!,
  );
  let month = "";
  for (let i = 0; i < n;) {
    const u = order[i]!;
    const leg = { coin: names.get(coin[u]!)!, buy: buy[u] === 1, x: x[u]! };
    const at = `${leg.coin}|${monthOf(leg.x)}`;
    if (at !== month) {
      await pace();
      month = at;
    }
    const uses: Use[] = [];
    for (
      ;
      i < n &&
      coin[order[i]!] === coin[u] &&
      x[order[i]!] === leg.x &&
      buy[order[i]!] === buy[u];
      i++
    )
      uses.push({ spec: order[i]! >> 1, exit: (order[i]! & 1) === 1 });
    visit(leg, d.levels(leg.coin, leg.buy, leg.x), uses);
  }
}

/** The features step's dry sweep (POLISH-EXPLORE's plan 7): the legs and their trades by coin-month, read as the E step reads them, nothing walked. */
export async function drySweep(
  d: Data,
  specs: readonly Spec[],
  pace: () => Promise<void>,
) {
  const byCoinMonth: Record<string, { legs: number; trades: number }> = {};
  let legs = 0;
  let trades = 0;
  let none = 0;
  await eachLeg(d, specs, pace, (leg, levels) => {
    const key = `${leg.coin}|${monthOf(leg.x)}`;
    const c = (byCoinMonth[key] ??= { legs: 0, trades: 0 });
    c.legs += 1;
    c.trades += levels.length;
    legs += 1;
    trades += levels.length;
    if (levels.length === 0) none += 1;
  });
  return { legs, trades, withoutTrade: none, byCoinMonth };
}
