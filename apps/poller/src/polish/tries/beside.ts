/**
 * The prints beside (POLISH-EXPLORE's plan 5.5–5.7 and 6; the polishing
 * plan 1.5 with its review's F1, F13, F17 and F19), after the choice, for
 * the rule going to FRESH with B0 beside, from the positions the steps
 * wrote: the lines of 6.1 (months, sides, the two best days out, a day or a
 * coin out, the tail, BTC's and ETH's moves, the event-level mean, OWN); K;
 * the book footprint; the placebo and the exam's z; the projection; the
 * signal meter; the error rates; the calibration on C. They decide nothing
 * but K and the exam's z, which are frozen for the exam.
 */
import { z } from "zod";
import { blockOf } from "../../market1/lines.js";
import { normalUpper, type Item } from "../../market1/stats.js";
import type { Position } from "../../market1/lines.js";
import { tailOf } from "../../market1/summary.js";
import { dayOf } from "../../paper/stats.js";
import { DAY_MS, HOUR_MS } from "../../schedule.js";
import type { Data } from "./data.js";
import { episodeIds } from "./parts.js";
import { baseOf, priceAfter } from "./prices.js";
import { clustersOf, statOf, twoWayFast } from "./stats.js";
import { keeps, TRIES, type CutsFile } from "./trylog.js";
import { monthOf } from "../../waveh/instants.js";
import { LIVE_MS } from "../../waveh/books.js";

const Num = z.number().nullable();
/** A position as a step wrote it (a line of e-, choice- or c-positions.jsonl.gz). */
export const Line = z
  .object({
    group: z.string(),
    slice: z.number(),
    t: z.number(),
    iid: z.number(),
    tid: z.string(),
    dir: z.union([z.literal(1), z.literal(-1)]),
    xIn: z.number(),
    xOut: z.number(),
    net: Num,
    unpriced: z.string().nullable(),
    onMarks: Num,
  })
  .loose();
export type Line = z.infer<typeof Line>;

/** The rule's positions on E and on C, from the steps' lines: B0's, N's, or one change's (a filter's kept from B0's lines on E by its feature and cut). */
export function linesOf(
  goes: string,
  lines: { e: readonly Line[]; choice: readonly Line[]; c: readonly Line[] },
  cuts: CutsFile["cuts"],
): { E: Line[]; C: Line[] } {
  const of = (ls: readonly Line[], g: string) =>
    ls.filter((l) => l.group === g);
  if (goes === "B0" || goes === "N")
    return {
      E: of(goes === "B0" ? lines.e : lines.choice, goes),
      C: of(lines.c, goes),
    };
  const t = TRIES.find((x) => x.name === goes)!;
  const onE =
    "filter" in t
      ? of(lines.e, "B0").filter(
          (l) =>
            keeps(
              t,
              ((l as Record<string, unknown>)[goes] as number) ?? NaN,
              cuts[goes as keyof typeof cuts]?.value ?? null,
            ) === true,
        )
      : of(lines.e, goes);
  return { E: onE, C: of(lines.c, goes) };
}

/** A line's item: its net re-based by b at its entry's instant and coin; none when unpriced. */
const itemOf = (l: Line, b: number): Item | null =>
  l.net === null ? null : { t: l.t, iid: l.iid, x: l.net - b };
const itemsOf = (ls: readonly Line[], b: number) =>
  ls.flatMap((l) => {
    const i = itemOf(l, b);
    return i === null ? [] : [i];
  });

/**
 * 6.1's lines on a set of positions: each UTC month of t and each side;
 * without the two best days (the two largest day sums); each day and each
 * coin left out (the lowest and the highest m, and which); MARKET-1's tail
 * (B11); BTC's and ETH's gross on marks and excess at the entries (B7, CR1
 * by day); the event-level mean (F17: the earliest position of each B1
 * episode of the pooled counted fills); MARKET-1's OWN line (the gross on
 * marks less dir × the mean move of the other small coins with both
 * prices, at least 5).
 */
export function linesBeside(
  d: Data,
  ls: readonly Line[],
  b: number,
  part: { start: number; end: number },
) {
  const kit = d.kit;
  const items = itemsOf(ls, b);
  const by = <K>(key: (l: Line) => K) => {
    const m = new Map<K, Item[]>();
    ls.forEach((l) => {
      const i = itemOf(l, b);
      if (i === null) return;
      const k = key(l);
      const a = m.get(k);
      if (a === undefined) m.set(k, [i]);
      else a.push(i);
    });
    return m;
  };
  const months = Object.fromEntries(
    [...by((l) => monthOf(l.t))].map(([k, v]) => [k, statOf(kit, v)]),
  );
  const sides = Object.fromEntries(
    [...by((l) => (l.dir > 0 ? "forced sells" : "forced buys"))].map(
      ([k, v]) => [k, statOf(kit, v)],
    ),
  );
  const days = [...by((l) => dayOf(l.t))];
  const sums = days
    .map(([day, v]) => [day, v.reduce((s, i) => s + i.x, 0)] as const)
    .sort((x, y) => y[1] - x[1]);
  const best = new Set(sums.slice(0, 2).map(([day]) => day));
  const leaveOut = <K>(groups: [K, Item[]][], key: (i: Item) => K) => {
    let lo: { out: K; mean: number } | null = null;
    let hi: { out: K; mean: number } | null = null;
    for (const [k] of groups) {
      const rest = items.filter((i) => key(i) !== k);
      if (rest.length === 0) continue;
      const m = rest.reduce((s, i) => s + i.x, 0) / rest.length;
      if (lo === null || m < lo.mean) lo = { out: k, mean: m };
      if (hi === null || m > hi.mean) hi = { out: k, mean: m };
    }
    return { lowest: lo, highest: hi };
  };
  const positions: Position[] = ls.map((l) => ({
    line: "WAVE",
    iid: l.iid,
    t: l.t,
    side: l.dir > 0 ? -1 : 1,
    dir: l.dir,
    xIn: l.xIn,
    xOut: l.xOut,
    fillIid: l.iid,
    accounts: [],
    coins: 0,
    priced:
      l.net === null
        ? null
        : {
            net: l.net - b,
            unpriced: null,
            gross: null,
            fees: null,
            funding: null,
            fundingMissing: 0,
            grossOnMarks: l.onMarks,
            excess: null,
            entryCost: null,
            pIn: null,
            pOut: null,
            markLegs: [null, null],
            depthShort: false,
            deepest: [null, null],
          },
  }));
  // B7: BTC's and ETH's moves at the entries, on marks, with their excess over BASE of x_in's block.
  const large = Object.fromEntries(
    ["BTC", "ETH"].map((coin) => {
      const pc = d.pc.get(coin)!;
      const base = baseOf(pc, d.start, part.start, part.end, 1_440);
      const gross: Item[] = [];
      const excess: Item[] = [];
      for (const l of ls) {
        const g =
          l.dir *
          ((priceAfter(pc, d.start, l.xOut) / priceAfter(pc, d.start, l.xIn) -
            1) *
            1e4);
        if (Number.isNaN(g)) continue;
        gross.push({ t: l.t, iid: 0, x: g });
        const bb = base[blockOf(l.xIn)]!;
        if (!Number.isNaN(bb))
          excess.push({ t: l.t, iid: 0, x: g - l.dir * bb });
      }
      const cr1 = (xs: Item[]) => {
        const r = kit.stats.cr1Test(
          xs,
          (i) => dayOf(i.t),
          (i) => i.x,
        );
        return { n: r.n, mean: r.estimate, se: r.se };
      };
      return [coin, { gross: cr1(gross), excess: cr1(excess) }];
    }),
  );
  // F17: one position per coin-episode of the pooled counted fills, the earliest.
  const episode = episodeIds(d.counted);
  const fillOf = new Map(d.counted.map((f) => [`${f.t}|${f.iid}|${f.tid}`, f]));
  const first = new Map<number, Item>();
  for (const l of [...ls].sort((x, y) => x.t - y.t)) {
    const f = fillOf.get(`${l.t}|${l.iid}|${l.tid}`);
    const i = itemOf(l, b);
    if (f === undefined || i === null) continue;
    const id = episode.get(f)!;
    if (!first.has(id)) first.set(id, i);
  }
  // OWN: the gross on marks less dir × the other small coins' mean move over the same instants.
  const smallNames = d.coins.list.map((c) => c.name);
  const own: Item[] = [];
  for (const l of ls) {
    if (l.onMarks === null) continue;
    let s = 0;
    let n = 0;
    for (const name of smallNames) {
      if (d.coins.byName.get(name)!.assetId === l.iid) continue;
      const pc = d.pc.get(name)!;
      const m =
        (priceAfter(pc, d.start, l.xOut) / priceAfter(pc, d.start, l.xIn) - 1) *
        1e4;
      if (Number.isNaN(m)) continue;
      s += m;
      n += 1;
    }
    if (n >= 5)
      own.push({ t: l.t, iid: l.iid, x: l.onMarks - l.dir * (s / n) });
  }
  return {
    all: statOf(kit, items),
    months,
    sides,
    withoutTwoBestDays: statOf(
      kit,
      items.filter((i) => !best.has(dayOf(i.t))),
    ),
    dayOut: leaveOut(days, (i) => dayOf(i.t)),
    coinOut: leaveOut([...by((l) => l.iid)], (i) => i.iid),
    tail: tailOf(positions),
    large,
    eventLevel: statOf(kit, [...first.values()]),
    own: statOf(kit, own),
  };
}

/** F19's K: on E ∪ C, the two-way SE of the line pooled over slices 0…K−1 for each K; the smallest K whose SE is within 3% of all slices'. */
export function kOf(d: Data, ls: readonly Line[], b: number, M: number) {
  const ks = [...new Set([1, 5, 10, 20, 50, M].filter((k) => k <= M))].sort(
    (x, y) => x - y,
  );
  const at = ks.map((K) => {
    const s = statOf(
      d.kit,
      itemsOf(
        ls.filter((l) => l.slice < K),
        b,
      ),
    );
    return {
      K,
      n: s?.n ?? 0,
      se: s?.se ?? null,
      days: s?.days ?? 0,
      coins: s?.markets ?? 0,
    };
  });
  const all = at.at(-1)!.se;
  const K =
    all === null
      ? M
      : (at.find((x) => x.se !== null && x.se <= 1.03 * all)?.K ?? M);
  return { K, at };
}

/** The book files a rule's legs would need at K slices (H8's hour, and the hour before for a leg within 10 s of its hour's start), a day; and FRESH's download for about 100 days at 506 MB a day for the 38 coins. */
export function footprintOf(ls: readonly Line[], K: number) {
  const files = new Set<string>();
  const days = new Set<number>();
  for (const l of ls) {
    if (l.slice >= K) continue;
    days.add(dayOf(l.t));
    for (const x of [l.xIn, l.xOut]) {
      const hour = Math.floor(x / HOUR_MS) * HOUR_MS;
      files.add(`${l.iid}|${hour}`);
      if (x - hour < LIVE_MS) files.add(`${l.iid}|${hour - HOUR_MS}`);
    }
  }
  const perDay = days.size === 0 ? 0 : files.size / days.size;
  return {
    files: files.size,
    days: days.size,
    perDay,
    freshGB: ((perDay / (38 * 24)) * 506 * 100) / 1024,
  };
}

/**
 * F1's placebo on the span [from, to): each B1 episode's sign flipped at
 * random (`flip` "episode", the default), or each UTC day's of the span
 * ("day": POLISH-EXPLORE-REVIEW's; polish/rules.md P10), by the kit's
 * `mulberry32` (the seed printed), `draws` draws for windows of 100 and 182
 * consecutive days at a random start; t* = the flipped mean ÷ its two-way
 * SE. Printed: P(t* > 1.96, 2.24, 2.58 and 2.81), the sd of t*, its 97.5th,
 * 98.75th, 99.5th and 99.75th percentiles, and the window errors of the
 * unflipped nets (median and quartiles), with Student's t at G − 1 beside.
 */
export function placeboOf(
  d: Pick<Data, "counted" | "kit">,
  ls: readonly Line[],
  b: number,
  o: {
    seed: number;
    draws: number;
    from: number;
    to: number;
    flip?: "episode" | "day";
  },
) {
  const priced = ls.filter((l) => l.net !== null).sort((x, y) => x.t - y.t);
  const items = priced.map((l) => itemOf(l, b)!);
  const x = Float64Array.from(items, (i) => i.x);
  const t = Float64Array.from(items, (i) => i.t);
  // Each item's unit whose sign is drawn (−1: never flipped), and how many units a draw signs.
  let unit: Int32Array;
  let units: number;
  if (o.flip === "day") {
    unit = Int32Array.from(t, (v) => Math.floor((v - o.from) / DAY_MS));
    units = Math.ceil((o.to - o.from) / DAY_MS);
  } else {
    const episode = episodeIds(d.counted);
    const fillOf = new Map(
      d.counted.map((f) => [`${f.t}|${f.iid}|${f.tid}`, f]),
    );
    unit = Int32Array.from(priced, (l) => {
      const f = fillOf.get(`${l.t}|${l.iid}|${l.tid}`);
      return f === undefined ? -1 : episode.get(f)!;
    });
    units = Math.max(0, ...unit) + 1;
  }
  const cl = clustersOf(items);
  const rng = (
    d.kit.stats as unknown as { mulberry32: (seed: number) => () => number }
  ).mulberry32(o.seed);
  const lower = (v: number) => {
    let lo = 0;
    let hi = t.length;
    while (lo < hi) {
      const m = (lo + hi) >> 1;
      if (t[m]! < v) lo = m + 1;
      else hi = m;
    }
    return lo;
  };
  const q = (vs: number[], p: number) => d.kit.exits.quantile(vs, p);
  return Object.fromEntries(
    [100, 182].map((days) => {
      const span = o.to - o.from - days * DAY_MS;
      const ts: number[] = [];
      const errors: number[] = [];
      const flipped = new Float64Array(x.length);
      const sign = new Int8Array(units);
      for (let k = 0; k < o.draws && span >= 0; k++) {
        const s = o.from + Math.floor(rng() * (span / DAY_MS + 1)) * DAY_MS;
        const lo = lower(s);
        const hi = lower(s + days * DAY_MS);
        for (let e = 0; e < units; e++) sign[e] = rng() < 0.5 ? -1 : 1;
        let m = 0;
        for (let i = lo; i < hi; i++) {
          flipped[i] = unit[i]! < 0 ? x[i]! : sign[unit[i]!]! * x[i]!;
          m += flipped[i]!;
        }
        const se = twoWayFast(flipped, cl, lo, hi);
        const seOwn = twoWayFast(x, cl, lo, hi);
        if (seOwn !== null) errors.push(seOwn);
        if (se !== null && se > 0) ts.push(m / (hi - lo) / se);
      }
      const mt = ts.reduce((s, v) => s + v, 0) / Math.max(1, ts.length);
      const sd = Math.sqrt(
        ts.reduce((s, v) => s + (v - mt) ** 2, 0) / Math.max(1, ts.length - 1),
      );
      const above = (z: number) =>
        ts.filter((v) => v > z).length / Math.max(1, ts.length);
      return [
        `${days} days`,
        {
          draws: ts.length,
          above258: above(2.58),
          above281: above(2.81),
          sd,
          p995: q(ts, 0.995),
          p9975: q(ts, 0.9975),
          errors: {
            median: q(errors, 0.5),
            q1: q(errors, 0.25),
            q3: q(errors, 0.75),
          },
          /** Student's t at G − 1 (G = the window's days), two-sided 0.5%, as a reference. */
          student: d.kit.stats.tCritical(0.005, days - 1),
          above196: above(1.96),
          above224: above(2.24),
          p975: q(ts, 0.975),
          p9875: q(ts, 0.9875),
        },
      ];
    }),
  ) as Record<string, Placebo>;
}

/** One window length's placebo print. */
export type Placebo = {
  draws: number;
  above258: number;
  above281: number;
  sd: number;
  p995: number | null;
  p9975: number | null;
  errors: { median: number | null; q1: number | null; q3: number | null };
  student: number;
  above196: number;
  above224: number;
  p975: number | null;
  p9875: number | null;
};

/** The exam's z (Q4): max(2.81, the rule's own 99.75th percentile of t* at 100 days), for two looks. */
export const examZ = (p9975: number | null) => Math.max(2.81, p9975 ?? 2.81);

/** F13's projection and the power: m_proj (m_C − SE_C for a rule chosen by passing C; m_C for B0 by default), P(HOLDS) = Φ((m_proj − max(z·SE, 50 − z·SE)) ÷ SE) at each look's observed window error. */
export function projectionOf(
  m: number,
  se: number,
  chosen: boolean,
  z: number,
  errors: { look1: number | null; look2: number | null },
) {
  const proj = chosen ? m - se : m;
  const power = (s: number | null) =>
    s === null || s <= 0
      ? null
      : 1 - normalUpper((proj - Math.max(z * s, 50 - z * s)) / s);
  return {
    mProj: proj,
    beside: chosen ? m : m - se,
    look1: power(errors.look1),
    look2: power(errors.look2),
  };
}

/** The signal meter (5.6, descriptive): the mean of t² over the adoptable tries with a t (chance's centre is 0), the sample variance beside; "nothing beyond luck" at 1.2 or less; each change's E gain shrunk by max(0, 1 − 1 ÷ it). */
export function signalOf(
  tries: readonly {
    name: string;
    adoptable: boolean;
    t: number | null;
    d: number | null;
  }[],
) {
  const ts = tries.filter((x) => x.adoptable && x.t !== null).map((x) => x.t!);
  if (ts.length === 0) return { tries: 0, verdict: "no try has a t" };
  const v = ts.reduce((s, x) => s + x * x, 0) / ts.length;
  const mean = ts.reduce((s, x) => s + x, 0) / ts.length;
  const sample =
    ts.reduce((s, x) => s + (x - mean) ** 2, 0) / Math.max(1, ts.length - 1);
  const shrink = Math.max(0, 1 - 1 / v);
  return {
    tries: ts.length,
    meanSquare: v,
    sampleVariance: sample,
    verdict: v <= 1.2 ? "nothing beyond luck" : "more than luck alone",
    shrink,
    gains: Object.fromEntries(
      tries
        .filter((x) => x.adoptable && x.d !== null)
        .map((x) => [x.name, x.d! * shrink]),
    ),
    caveat:
      "the t's are correlated (the review's §9): a description, deciding nothing",
  };
}

/** 5.7's error rates, as the try log writes them. */
export const ERROR_RATES = {
  perTry: "P(t ≥ 2.5) = 0.621% under pure chance",
  all33: { passE: "20.5%", reachFresh: "3.3%" },
  unseeded18: { passE: "11.2%", reachFresh: "1.8%" },
};

/** The calibration on C (6.2, printed after the choice): b over slice 0's C positions the look priced at the book at both ends. */
export function calibrationOnC(
  d: Data,
  ls: readonly Line[],
  book: ReadonlyMap<string, number>,
) {
  const items: Item[] = [];
  let positions = 0;
  for (const l of ls) {
    const ref = l.slice === 0 ? book.get(`${l.t}|${l.iid}`) : undefined;
    if (ref === undefined) continue;
    positions += 1;
    if (l.net !== null) items.push({ t: l.t, iid: l.iid, x: l.net - ref });
  }
  return { positions, priced: items.length, stat: statOf(d.kit, items) };
}
