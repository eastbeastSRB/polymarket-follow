/**
 * MARKET-1's reproduction on the old weeks (the plan's part 4; F12: a script
 * and a test, never a frozen command): MARKET-1's own rules, run from
 * 2026-08-31 to the cut on the seed's fills and the kit's pre-cut panel,
 * every leg at the mark, against MARKET-FIND's printed figures. Exploring
 * figures, deciding nothing. It also models the paper experiment's reader
 * (MARKET-PLAN's c1: the week's list read whole with a safety cap of 5,000
 * fills an account-day, every other account at most 1,000 fills an
 * account-week, oldest first) for the count of entries it would see.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { z } from "zod";
import { computeAll, namedSets } from "../src/market1/compute.js";
import {
  LARGE,
  SMALL_COINS,
  addAccount,
  emptyPoolFills,
  finish,
} from "../src/market1/fills.js";
import { kitData } from "../src/market1/inputs.js";
import type { Position } from "../src/market1/lines.js";
import { statOf, tailOf } from "../src/market1/summary.js";
import { dayOf, type Item, type TwoWay } from "../src/market1/stats.js";
import { waveEntries } from "../src/market1/waves.js";
import { CUT, mondayOf } from "../src/paper/instants.js";
import { loadPrecut, marketThrough } from "../src/paper/market.js";
import {
  loadResearch,
  type Market,
  type Research,
} from "../src/paper/research.js";
import { loadSeed, readManifest } from "../src/paper/seed.js";
import type { StoredRow } from "../src/paper/store.js";

/** The launch week's Monday: MARKET-FIND's old weeks start here. */
export const LAUNCH = Date.parse("2026-08-31T00:00:00Z");

export class ReproductionBlindError extends Error {}

/** MARKET-PLAN's c1 model of the paper experiment's reader, for one account's rows before the cut. */
export function readerKeeps(
  rows: readonly StoredRow[],
  onList: (monday: number) => boolean,
): StoredRow[] {
  const byWeek = new Map<number, StoredRow[]>();
  for (const r of [...rows].sort((a, b) => a.timestamp - b.timestamp)) {
    const M = mondayOf(r.timestamp);
    if (M < LAUNCH) continue;
    byWeek.set(M, [...(byWeek.get(M) ?? []), r]);
  }
  const kept: StoredRow[] = [];
  for (const [M, week] of byWeek) {
    if (!onList(M)) {
      kept.push(...week.slice(0, 1_000));
      continue;
    }
    const perDay = new Map<number, number>();
    for (const r of week) {
      const d = dayOf(r.timestamp);
      const k = perDay.get(d) ?? 0;
      perDay.set(d, k + 1);
      if (k < 5_000) kept.push(r);
    }
  }
  return kept;
}

/** MARKET-FIND's additive net (a12's `fade(…, 'net')`): the gross on marks less 4 bps and the table's spread a leg, less funding's rate sum. */
export function additiveNet(
  kit: Research,
  mk: Market,
  p: Position,
): number | null {
  const gom = p.priced?.grossOnMarks ?? null;
  if (gom === null) return null;
  const leg = (t: number) =>
    kit.costs.feeAt("taker", mk.iid, t) * 1e4 +
    kit.costs.SETTINGS.taker.spread(mk.iid, t).c * 1e4;
  let rates = 0;
  mk.funding.hour.forEach((h, i) => {
    if (h > p.xIn && h <= p.xOut) rates += mk.funding.rate[i]!;
  });
  return gom - leg(p.xIn) - leg(p.xOut) - p.dir * rates * 1e4;
}

/** MARKET-FIND's two-way error (lib.mjs `cr2`): √(V_day + V_market − V_both) when positive, else the larger one-way. */
export function cr2(kit: Research, items: readonly Item[]): number | null {
  const se = (key: (i: Item) => string | number) =>
    kit.stats.cr1Test(items, key, (i) => i.x).se;
  const a = se((i) => dayOf(i.t));
  const b = se((i) => i.iid);
  const c = se((i) => `${dayOf(i.t)}|${i.iid}`);
  if (a === null || b === null || c === null) return null;
  const v = a * a + b * b - c * c;
  return v > 0 ? Math.sqrt(v) : Math.max(a, b);
}

const Labels = z.object({
  addr: z.string(),
  M: z.number(),
  label: z.string(),
  covered: z.boolean(),
});

export type Paths = {
  packageRoot: string;
  seedDir: string;
  panelDir: string;
  /** The kit's `derived/pool-weeks.jsonl.gz` (labels at each Monday). */
  labels: string;
};

const round1 = (x: number | null | undefined) =>
  x === null || x === undefined ? null : Math.round(x * 10) / 10;
const fig = (s: TwoWay | null, mf?: number | null) =>
  s === null
    ? null
    : {
        n: s.n,
        mean: round1(s.mean),
        se: round1(s.se),
        seDay: round1(s.seDay),
        seMarket: round1(s.seMarket),
        days: s.days,
        markets: s.markets,
        ...(mf === undefined ? {} : { cr2: round1(mf) }),
      };

export async function reproduce(paths: Paths) {
  const kit = await loadResearch(path.join(paths.packageRoot, "research"));
  const kd = kitData(paths.packageRoot);
  const manifest = readManifest(
    readFileSync(
      path.join(paths.packageRoot, "experiment", "seed.sha256"),
      "utf8",
    ),
  );
  const labels = new Set<string>();
  for (const line of gunzipSync(readFileSync(paths.labels))
    .toString("utf8")
    .split("\n")) {
    if (line === "") continue;
    const r = Labels.parse(JSON.parse(line));
    if (r.label === "directional" && r.covered) labels.add(`${r.addr}|${r.M}`);
  }
  const crypto = new Set(
    [...kd.markets].filter(([, m]) => m.category === "crypto").map(([i]) => i),
  );
  const known = new Set(kd.markets.keys());
  const all = emptyPoolFills();
  const capped = emptyPoolFills();
  for (const addr of kd.pool) {
    const seed = loadSeed(paths.seedDir, manifest, addr);
    if (seed === null) continue;
    for (const r of seed.rows)
      if (r.timestamp >= CUT)
        throw new ReproductionBlindError(
          `${addr}: a seed row at or after the cut`,
        );
    addAccount(all, addr, seed.rows, LAUNCH, CUT, crypto, known);
    const kept = readerKeeps(seed.rows, (M) => labels.has(`${addr}|${M}`));
    addAccount(capped, addr, kept, LAUNCH, CUT, crypto, known);
  }
  finish(all);
  finish(capped);
  const markets = new Map<number, Market>();
  for (const iid of [...SMALL_COINS, ...LARGE]) {
    const pre = loadPrecut(paths.panelDir, kd.pinned, iid);
    if (pre.end !== CUT)
      throw new ReproductionBlindError(`panel ${iid} does not end at the cut`);
    markets.set(iid, marketThrough(kit, pre, CUT));
  }
  const market = (iid: number) => markets.get(iid) ?? null;
  const positions = computeAll({
    kit,
    small: all.small,
    large: all.large,
    at: { cut: LAUNCH, start: LAUNCH },
    end: CUT,
    tradable: () => true,
    market,
    quote: () => ({ source: "mark", why: "the old weeks: no book" }),
    fee: (iid, t) => kit.costs.feeAt("taker", iid, t),
  });
  const sets = namedSets(positions, CUT, []);
  const items = (ps: readonly Position[], x: (p: Position) => number | null) =>
    ps.flatMap((p) => {
      const v = x(p);
      return v === null ? [] : [{ t: p.t, iid: p.iid, x: v }];
    });
  const gom = (p: Position) => p.priced?.grossOnMarks ?? null;
  const exc = (p: Position) => p.priced?.excess ?? null;
  const net = (p: Position) => p.priced?.net ?? null;
  const add = (p: Position) => additiveNet(kit, markets.get(p.iid)!, p);
  const line = (name: string, x: (p: Position) => number | null) => {
    const ps = sets.get(name) ?? [];
    const it = items(ps, x);
    return fig(statOf(kit, it), cr2(kit, it));
  };
  const wave = sets.get("WAVE")!;
  const waveAdd = wave.map((p) => ({
    ...p,
    priced: p.priced === null ? null : { ...p.priced, net: add(p) },
  }));
  const tail = tailOf(waveAdd);
  return {
    /** The positions on marks, for the bridge rehearsal's comparison. */
    positions,
    markets,
    countedFills: all.small.length,
    episodes: positions.filter((p) => p.line === "B1").length,
    largeEpisodes: positions.filter((p) => p.line === "B10").length,
    fills: all.small.map((f) => ({ ...f })),
    entries: wave.map((p) => ({ iid: p.iid, t: p.t, side: p.side })),
    WAVE: {
      positions: wave.length,
      days: new Set(wave.map((p) => dayOf(p.t))).size,
      markets: new Set(wave.map((p) => p.iid)).size,
      sells: wave.filter((p) => p.side === -1).length,
      buys: wave.filter((p) => p.side === 1).length,
      onMarks: line("WAVE", gom),
      excess: line("WAVE", exc),
      additiveNet: line("WAVE", add),
      own: line("WAVE", (p) => p.own ?? null),
      netKitLeg: line("WAVE", net),
    },
    readerModel: {
      countedFills: capped.small.length,
      entries: waveEntries(capped.small).filter((e) => e.fill.t >= LAUNCH)
        .length,
    },
    B1: {
      ...line("B1 EPISODES", gom),
      additiveNet: line("B1 EPISODES", add),
      positions: (sets.get("B1 EPISODES") ?? []).length,
    },
    B2: line("B2 ALONE", gom),
    B3_60: line("B3 LATE 1 h", gom),
    B3_180: line("B3 LATE 3 h", gom),
    B4: line("B4 COINS", gom),
    B5: line("B5 THREE", gom),
    B6_SELLS: line("B6 FORCED SELLS", gom),
    B6_BUYS: line("B6 FORCED BUYS", gom),
    B7_BTC: line("B7 BTC", exc),
    B7_ETH: line("B7 ETH", exc),
    B10: {
      ...line("B10 LARGE", exc),
      positions: (sets.get("B10 LARGE") ?? []).length,
    },
    B11: {
      worstDay:
        tail.worstDay === null
          ? null
          : { ...tail.worstDay, sum: round1(tail.worstDay.sum) },
      largestFall: round1(tail.largestFall),
      mostOpen: tail.mostOpen,
      worst: round1(tail.worst),
      worstFivePct: round1(tail.worstFivePct),
    },
  };
}

export type Report = Awaited<ReturnType<typeof reproduce>>;
