/**
 * Every filter's feature at its pinned instant (apps/poller/polish/tries.md
 * 3.1 and 3.4, with the pins of decisions 2026-11-18, "POLISH-EXPLORE's plan
 * approved", 12), for a list of entries, and the nine E cuts. A price at an
 * instant is `priceAt`'s, a minute column's value `knownAt`'s: the minute
 * ended by the instant, never the minute it is in. "Up to t" is
 * [t − 60 min, t], both ends in. An unknown feature is NaN.
 */
import { WINDOW_MS, accountsAt, marketsAt } from "../../market1/waves.js";
import { DAY_MS, HOUR_MS, MINUTE_MS } from "../../schedule.js";
import type { Counted } from "../../waveh/fills.js";
import { SIZING_START } from "../../waveh/instants.js";
import { knownAt } from "../legs.js";
import type { Data } from "./data.js";
import type { Entry } from "./parts.js";
import { priceAt } from "./prices.js";
import { CUT_NAMES, FILTERS, TRIES, type Cut } from "./trylog.js";

/** The entries whose features are read; their M's slices (W3, N1) and every entry of that M (N6); the rule's entry delay (N4). */
export type Entries = {
  entries: readonly Entry[];
  slices: readonly (readonly Counted[])[];
  all: readonly Entry[];
  delay: number;
};

/** A basket needs at least 5 coins (R1, R2, R4). */
const BASKET = 5;
const WEEK = 7 * DAY_MS;
/** N1's burst: every fill up to t within 10 minutes of it. */
const BURST_MS = 600_000;
/** N11: 288 five-minute returns, at least 230 of them. */
const RV_RETURNS = 288;
const RV_LEAST = 230;
/** Trailing measures: 30 days, at least 7 (convention 3); N3 at least 168 rows. */
const TRAIL_DAYS = 30;
const LEAST_DAYS = 7;
const N3_LEAST = 168;

/** The first index of an ascending list whose value is at least x, or above x when `above`. */
function bound(a: ArrayLike<number>, x: number, above = false): number {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (a[mid]! < x || (above && a[mid] === x)) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

/** The first instant of t's UTC month. */
const monthStart = (t: number) => {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
};
const dayStart = (t: number) => Math.floor(t / DAY_MS) * DAY_MS;

/** The features of `x.entries`, by filter name, NaN where unknown. */
export function featuresOf(d: Data, x: Entries): Map<string, Float64Array> {
  const n = x.entries.length;
  const out = new Map(
    FILTERS.map((name) => [name, new Float64Array(n).fill(NaN)]),
  );
  const put = (name: string, i: number, v: number) => {
    out.get(name)![i] = v;
  };
  const small = d.coins.list.map((c) => d.pc.get(c.name)!);
  const P = (pc: Float64Array, tau: number) => priceAt(pc, d.start, tau);
  const minuteEnd = (t: number) =>
    d.start + Math.floor((t - d.start) / MINUTE_MS) * MINUTE_MS;

  // The counted fills by coin and forced side: their instants, and running sums of px·sz (W5) and of σ·(px − markPx) ÷ markPx·10⁴ (N9).
  const runs = new Map<
    string,
    { t: number[]; ntl: number[]; through: number[]; known: number[] }
  >();
  d.counted.forEach((f, i) => {
    const key = `${f.iid}|${f.side}`;
    let r = runs.get(key);
    if (r === undefined) {
      r = { t: [], ntl: [0], through: [0], known: [0] };
      runs.set(key, r);
    }
    const k = r.t.length;
    const mark = d.forced.markPx[i]!;
    const v = ((f.side * (d.forced.px[i]! - mark)) / mark) * 1e4;
    const ok = mark > 0 && Number.isFinite(v);
    r.t.push(f.t);
    r.ntl.push(r.ntl[k]! + d.forced.px[i]! * d.forced.sz[i]!);
    r.through.push(r.through[k]! + (ok ? v : 0));
    r.known.push(r.known[k]! + (ok ? 1 : 0));
  });
  const countedT = Float64Array.from(d.counted, (f) => f.t);
  /** The entry fill's row in the counted fills. */
  const rowOf = (f: Counted) => {
    let i = bound(countedT, f.t);
    while (i < d.counted.length && d.counted[i] !== f) i++;
    if (i === d.counted.length)
      throw new Error("an entry's fill is not a counted fill");
    return i;
  };
  const sliceT = new Map<number, Float64Array>();
  const timesOf = (slice: number) => {
    let a = sliceT.get(slice);
    if (a === undefined) {
      a = Float64Array.from(x.slices[slice]!, (f) => f.t);
      sliceT.set(slice, a);
    }
    return a;
  };

  // The forced fills N5 and N10 read: backstops of any coin by side; BTC's and ETH's by side, with the account.
  const backstops = new Map<number, number[]>([
    [1, []],
    [-1, []],
  ]);
  const large = new Map<string, { t: number[]; user: number[] }>();
  const largeId = new Set(
    ["BTC", "ETH"].map((c) => d.forced.coins.indexOf(c)).filter((k) => k >= 0),
  );
  for (let i = 0; i < d.forced.t.length; i++) {
    const s = d.forced.side[i]!;
    if (d.forced.backstop[i] === 1) backstops.get(s)!.push(d.forced.t[i]!);
    if (largeId.has(d.forced.coin[i]!)) {
      const key = `${d.forced.coin[i]}|${s}`;
      const l = large.get(key) ?? { t: [], user: [] };
      l.t.push(d.forced.t[i]!);
      l.user.push(d.forced.user[i]!);
      large.set(key, l);
    }
  }
  for (const a of backstops.values()) a.sort((p, q) => p - q);
  for (const l of large.values()) {
    const order = l.t.map((_, i) => i).sort((p, q) => l.t[p]! - l.t[q]!);
    l.t = order.map((i) => l.t[i]!);
    l.user = order.map((i) => l.user[i]!);
  }

  // N6: each slice's entries by coin, their instants in order.
  const entryTimes = new Map<string, number[]>();
  for (const e of x.all) {
    const key = `${e.slice}|${e.fill.iid}`;
    const a = entryTimes.get(key) ?? [];
    a.push(e.fill.t);
    entryTimes.set(key, a);
  }
  for (const a of entryTimes.values()) a.sort((p, q) => p - q);

  // R1–R4: the baskets at t, by t's minute.
  const basketAt = new Map<number, [number, number, number, number]>();
  const btc = d.pc.get("BTC")!;
  const sMove = (tp: number, back: number) => {
    let s = 0;
    let m = 0;
    for (const pc of small) {
      const a = P(pc, tp - back);
      const b = P(pc, tp);
      if (a > 0 && b > 0) {
        s += (b / a - 1) * 1e4;
        m += 1;
      }
    }
    return m < BASKET || s === 0 ? NaN : s / m;
  };
  const range = (tp: number) => {
    const base = small.map((pc) => P(pc, tp - WEEK));
    let lo = Infinity;
    let hi = -Infinity;
    for (let j = 0; j <= 168; j++) {
      let s = 0;
      let m = 0;
      small.forEach((pc, c) => {
        const p = P(pc, tp - j * HOUR_MS);
        if (base[c]! > 0 && p > 0) {
          s += p / base[c]! - 1;
          m += 1;
        }
      });
      if (m < BASKET) return NaN;
      lo = Math.min(lo, 1 + s / m);
      hi = Math.max(hi, 1 + s / m);
    }
    return hi / lo - 1;
  };
  const baskets = (t: number) => {
    const tp = minuteEnd(t);
    let b = basketAt.get(tp);
    if (b === undefined) {
      const a = P(btc, tp - DAY_MS);
      const z = P(btc, tp);
      b = [
        sMove(tp, WEEK),
        sMove(tp, DAY_MS),
        a > 0 && z > 0 ? (z / a - 1) * 1e4 : NaN,
        range(tp),
      ];
      basketAt.set(tp, b);
    }
    return b;
  };

  x.entries.forEach((e, i) => {
    const { t, side, iid } = e.fill;
    put("S1", i, side);
    put("W1", i, e.accounts.length);
    put("W3", i, marketsAt(x.slices[e.slice]!, t, side).size);
    put("W4", i, accountsAt(d.counted, t, side).size);
    const [s7, s24, b24, r4] = baskets(t);
    put("R1", i, side * s7);
    put("R2", i, side * s24);
    put("R3", i, side * b24);
    put("R4", i, r4);
    put("T1", i, new Date(t).getUTCHours());
    put("T2", i, new Date(t).getUTCDay());
    // N1: the slice's fills of σ up to t all within 10 minutes of t.
    const fills = x.slices[e.slice]!;
    let first = NaN;
    for (
      let k = bound(timesOf(e.slice), t - WINDOW_MS);
      k < fills.length && fills[k]!.t <= t;
      k++
    )
      if (fills[k]!.side === side) {
        first = fills[k]!.t;
        break;
      }
    put("N1", i, first >= t - BURST_MS ? 1 : 0);
    const bs = backstops.get(side)!;
    const b = bound(bs, t - WINDOW_MS);
    put("N5", i, b < bs.length && bs[b]! <= t ? 1 : 0);
    const times = entryTimes.get(`${e.slice}|${iid}`) ?? [];
    const r = bound(times, t - DAY_MS);
    put("N6", i, r < times.length && times[r]! < t ? 1 : 0);
    let wide = 0;
    for (const coin of largeId) {
      const l = large.get(`${coin}|${side}`);
      if (l === undefined) continue;
      const users = new Set<number>();
      for (
        let k = bound(l.t, t - WINDOW_MS);
        k < l.t.length && l.t[k]! <= t;
        k++
      )
        users.add(l.user[k]!);
      if (users.size >= 2) wide = 1;
    }
    put("N10", i, wide);
  });

  // Coin by coin: its minute columns read once.
  const byCoin = new Map<number, number[]>();
  x.entries.forEach((e, i) => {
    const a = byCoin.get(e.fill.iid);
    if (a === undefined) byCoin.set(e.fill.iid, [i]);
    else a.push(i);
  });
  const months = [...new Set(x.entries.map((e) => monthStart(e.fill.t)))];
  // C1–C3: each month's measures by coin, from the 30 days before it.
  const monthly = new Map<
    number,
    { iid: number; thin: number; wide: number; size: number }[]
  >(months.map((m) => [m, []]));
  for (const coin of d.coins.list) {
    const ntl = (() => {
      const buy = d.column(coin.name, "buyNtl");
      const sell = d.column(coin.name, "sellNtl");
      const cum = new Float64Array(d.minutes + 1);
      for (let k = 0; k < d.minutes; k++)
        cum[k + 1] = cum[k]! + buy[k]! + sell[k]!;
      return cum;
    })();
    const ask = d.column(coin.name, "impactAsk");
    const bid = d.column(coin.name, "impactBid");
    const mid = d.column(coin.name, "mid");
    const oi = d.column(coin.name, "openInterest");
    const mark = d.column(coin.name, "mark");
    const premium = d.column(coin.name, "premium");
    const row = (t: number) => Math.floor((t - d.start) / MINUTE_MS);
    for (const m of months) {
      const thinFrom = Math.max(m - TRAIL_DAYS * DAY_MS, SIZING_START);
      const ctxFrom = Math.max(m - TRAIL_DAYS * DAY_MS, d.start);
      const days = (from: number) => Math.ceil((m - dayStart(from)) / DAY_MS);
      const spreads: number[] = [];
      let size = 0;
      let sized = 0;
      for (let k = Math.max(0, row(ctxFrom)); k < row(m); k++) {
        if (mid[k]! > 0 && !Number.isNaN(ask[k]!) && !Number.isNaN(bid[k]!))
          spreads.push((ask[k]! - bid[k]!) / mid[k]!);
        if (!Number.isNaN(oi[k]!) && !Number.isNaN(mark[k]!)) {
          size += oi[k]! * mark[k]!;
          sized += 1;
        }
      }
      const thin =
        days(thinFrom) < LEAST_DAYS || row(m) < 0
          ? NaN
          : ntl[row(m)]! - ntl[Math.max(0, row(thinFrom))]!;
      const ctxOk = days(ctxFrom) >= LEAST_DAYS;
      monthly.get(m)!.push({
        iid: coin.assetId,
        thin: thin > 0 ? thin : NaN,
        wide: ctxOk ? (d.kit.exits.quantile(spreads, 0.5) ?? NaN) : NaN,
        size: ctxOk && sized > 0 ? size / sized : NaN,
      });
    }
    const pc = d.pc.get(coin.name)!;
    const rows = d.funding(coin.name);
    const stamps = rows.map((r) => r[2]);
    const crowd = new Map<string, number>();
    const daily = new Map<number, number>();
    const rvOf = (end: number) => {
      let s = 0;
      let m = 0;
      for (let j = 1; j <= RV_RETURNS; j++) {
        const a = P(pc, end - j * 5 * MINUTE_MS);
        const b = P(pc, end - (j - 1) * 5 * MINUTE_MS);
        if (a > 0 && b > 0) {
          s += Math.log(b / a) ** 2;
          m += 1;
        }
      }
      return m >= RV_LEAST ? Math.sqrt(s) : NaN;
    };
    const dailyRv = (day: number) => {
      let v = daily.get(day);
      if (v === undefined) {
        v = day < dayStart(d.start) ? NaN : rvOf(day + DAY_MS);
        daily.set(day, v);
      }
      return v;
    };
    for (const i of byCoin.get(coin.assetId) ?? []) {
      const e = x.entries[i]!;
      const { t, side } = e.fill;
      const tp = minuteEnd(t);
      // W5 and N2: the coin's traded notional of the 10,080 minutes ended in (t′ − 7 d, t′].
      const k = row(tp);
      const week =
        tp - WEEK < SIZING_START || k - 10_080 < 0
          ? NaN
          : ntl[k]! - ntl[k - 10_080]!;
      const run = runs.get(`${e.fill.iid}|${side}`)!;
      const lo = bound(run.t, t - WINDOW_MS);
      const hi = bound(run.t, t, true);
      const perHour = week / 168;
      put("W5", i, perHour > 0 ? (run.ntl[hi]! - run.ntl[lo]!) / perHour : NaN);
      const own = rowOf(e.fill);
      const perMinute = week / 10_080;
      put(
        "N2",
        i,
        perMinute > 0
          ? (d.forced.px[own]! * d.forced.sz[own]!) / perMinute
          : NaN,
      );
      const known = run.known[hi]! - run.known[lo]!;
      put(
        "N9",
        i,
        known > 0 ? (run.through[hi]! - run.through[lo]!) / known : NaN,
      );
      // N3: the last settled row stamped at or before t against the rows stamped in [t − 30 d, t).
      const last = bound(stamps, t, true) - 1;
      const from = bound(stamps, t - TRAIL_DAYS * DAY_MS);
      const to = bound(stamps, t);
      if (last >= 0 && to - from >= N3_LEAST) {
        const key = `${from}|${to}|${side}`;
        let p90 = crowd.get(key);
        if (p90 === undefined) {
          p90 = d.kit.exits.quantile(
            rows.slice(from, to).map((r) => -side * r[1]),
            0.9,
          )!;
          crowd.set(key, p90);
        }
        put("N3", i, -side * rows[last]![1] > p90 ? 1 : 0);
      }
      // N4: the bounce by the rule's x_in, against the forced move of the hour up to t.
      const pt = P(pc, t);
      const B = pt - P(pc, t - HOUR_MS);
      if (!Number.isNaN(B)) {
        if (side * B <= 0) put("N4", i, 0);
        else {
          const pin = P(pc, t + x.delay);
          if (!Number.isNaN(pin))
            put("N4", i, -side * (pin - pt) >= 0.5 * side * B ? 1 : 0);
        }
      }
      // N7 and N8 (printed only): the open interest's fall over the hour; the premium.
      const oiNow = knownAt(oi, d.start, t);
      const oiBefore = knownAt(oi, d.start, t - HOUR_MS);
      if (oiBefore > 0 && !Number.isNaN(oiNow))
        put("N7", i, (oiBefore - oiNow) / oiBefore);
      put("N8", i, side * knownAt(premium, d.start, t));
      // N11: RV at t against the median daily RV of the 30 UTC days before t's day.
      const days: number[] = [];
      for (let j = 1; j <= TRAIL_DAYS; j++) {
        const v = dailyRv(dayStart(t) - j * DAY_MS);
        if (!Number.isNaN(v)) days.push(v);
      }
      const median =
        days.length >= LEAST_DAYS ? d.kit.exits.quantile(days, 0.5)! : NaN;
      const now = rvOf(tp);
      if (median > 0 && !Number.isNaN(now)) put("N11", i, now / median);
    }
  }
  // C1–C3: kept among the ⌊n/2⌋ thinnest, widest, smallest of the ranked coins, ties by asset id.
  for (const [m, coins] of monthly) {
    for (const [name, key, sign] of [
      ["C1", "thin", 1],
      ["C2", "wide", -1],
      ["C3", "size", 1],
    ] as const) {
      const ranked = coins
        .filter((c) => !Number.isNaN(c[key]))
        .sort((a, b) => sign * (a[key] - b[key]) || a.iid - b.iid);
      const kept = new Set(
        ranked.slice(0, Math.floor(ranked.length / 2)).map((c) => c.iid),
      );
      const rankedIds = new Set(ranked.map((c) => c.iid));
      x.entries.forEach((e, i) => {
        if (monthStart(e.fill.t) !== m || !rankedIds.has(e.fill.iid)) return;
        put(name, i, kept.has(e.fill.iid) ? 1 : 0);
      });
    }
  }
  return out;
}

/** The nine E cuts: the kit's `quantile` (type 7) of each feature over the positions whose feature is known. */
export function cutsOf(
  d: Data,
  features: ReadonlyMap<string, Float64Array>,
): Record<string, Cut> {
  return Object.fromEntries(
    CUT_NAMES.map((name) => {
      const t = TRIES.find((x) => x.name === name)!;
      const q = ("filter" in t ? t.filter.q : undefined)!;
      const all = features.get(name)!;
      const known = Array.from(all).filter((v) => !Number.isNaN(v));
      return [
        name,
        {
          q,
          value: d.kit.exits.quantile(known, q),
          n: known.length,
          unknown: all.length - known.length,
        },
      ];
    }),
  );
}
