/**
 * A market past the cut (the plan's R9, with its review's F8 and F10): the
 * kit's pre-cut panel file — copied into the experiment's folder, each file
 * checked against the kit's pinned manifest (`kit/data/panel-manifest.sha256`)
 * when it is loaded — joined with the post-cut market-days, and built into
 * the kit's market object exactly as the kit's `marketFrom` builds it, with
 * END in place of the cut: dense minute marks (NaN where none), trades and
 * volume from klines, the funding prefix sums at the mark of the minute
 * before each hour. The kit's readers then use it unchanged.
 */
import { createHash } from "node:crypto";
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { gunzipSync } from "node:zlib";
import { z } from "zod";
import { DAY_MS, MINUTE_MS } from "../schedule.js";
import type { Market, PanelFile, Research } from "./research.js";
import { readManifest } from "./seed.js";
import type { MarketDay } from "./store.js";

export class MarketEndError extends Error {}

const sha256 = (bytes: Buffer): string =>
  createHash("sha256").update(bytes).digest("hex");

const PanelSchema = z.object({
  iid: z.number().int(),
  symbol: z.string(),
  category: z.string(),
  start: z.number().int(),
  end: z.number().int(),
  firstTrade: z.number().int().nullable(),
  retired: z.unknown(),
  marks: z.array(z.number().nullable()),
  klines: z.object({
    minute: z.array(z.number().int()),
    trades: z.array(z.number().int()),
    volume: z.array(z.number()),
  }),
  funding: z.array(z.tuple([z.number(), z.number(), z.number()])),
});

/** The kit's pinned panel manifest (frozen with the kit). */
export function pinnedPanel(researchRoot: string): Map<string, string> {
  return readManifest(
    readFileSync(
      path.join(researchRoot, "kit", "data", "panel-manifest.sha256"),
      "utf8",
    ),
  );
}

/** Copies every pinned panel file byte for byte and checks each copy; a file already there must hold the same bytes. */
export function copyPrecutPanel(
  from: string,
  to: string,
  pinned: ReadonlyMap<string, string>,
): number {
  mkdirSync(to, { recursive: true });
  for (const [name, hash] of pinned) {
    const target = path.join(to, name);
    if (!existsSync(target)) copyFileSync(path.join(from, name), target);
    const got = sha256(readFileSync(target));
    if (got !== hash)
      throw new Error(
        `panel copy ${name}: SHA-256 ${got} is not the pinned ${hash}`,
      );
  }
  return pinned.size;
}

/** One market's pre-cut panel file from the experiment's copy, checked against the pin. */
export function loadPrecut(
  dir: string,
  pinned: ReadonlyMap<string, string>,
  iid: number,
): PanelFile {
  const name = `${iid}.json.gz`;
  const want = pinned.get(name);
  if (want === undefined)
    throw new Error(`panel file ${name} is not in the kit's pinned manifest`);
  const bytes = readFileSync(path.join(dir, name));
  const got = sha256(bytes);
  if (got !== want)
    throw new Error(
      `panel file ${name}: SHA-256 ${got} differs from the pinned ${want}`,
    );
  const p = PanelSchema.parse(JSON.parse(gunzipSync(bytes).toString("utf8")));
  if (p.iid !== iid)
    throw new Error(`panel file ${name} holds market ${p.iid}`);
  return p;
}

/**
 * The pre-cut panel with the market-days that follow it, day after day,
 * until the first day missing or `end`: a market is never priced across a
 * day it has no data for (its copies there are unpriced, not guessed).
 */
export function joinDays(
  precut: PanelFile,
  days: readonly MarketDay[],
  end: number,
): PanelFile {
  const marks = [...precut.marks];
  const minute = [...precut.klines.minute];
  const trades = [...precut.klines.trades];
  const volume = [...precut.klines.volume];
  const funding = [...precut.funding];
  const byDay = new Map(days.map((d) => [d.day, d]));
  let at = precut.end;
  for (;;) {
    const day = byDay.get(at);
    if (day === undefined || day.iid !== precut.iid || at + DAY_MS > end) break;
    const offset = (at - precut.start) / MINUTE_MS;
    marks.push(...day.marks);
    day.klines.minute.forEach((i, k) => {
      minute.push(offset + i);
      trades.push(day.klines.trades[k]!);
      volume.push(day.klines.volume[k]!);
    });
    funding.push(...day.funding);
    at += DAY_MS;
  }
  return {
    ...precut,
    end: at,
    marks,
    klines: { minute, trades, volume },
    funding,
  };
}

/** The kit's `marketFrom`, step for step, with `end` (the run's END) in place of the cut. */
export function marketThrough(
  kit: Research,
  p: PanelFile,
  end: number,
): Market {
  if (!(p.end <= end)) {
    throw new MarketEndError(
      `market ${p.iid}: the panel ends at ${new Date(p.end).toISOString()}, after the run's end`,
    );
  }
  const n = (p.end - p.start) / MINUTE_MS;
  if (!Number.isInteger(n) || p.marks.length !== n) {
    throw new Error(
      `market ${p.iid}: ${p.marks.length} marks for ${n} minutes`,
    );
  }
  const marks = Float64Array.from(p.marks, (v) => (v === null ? NaN : v));
  const trades = new Int32Array(n);
  const volume = new Float64Array(n);
  p.klines.minute.forEach((i, k) => {
    if (!(i >= 0 && i < n))
      throw new MarketEndError(
        `market ${p.iid}: a kline outside the panel's minutes`,
      );
    trades[i] = p.klines.trades[k]!;
    volume[i] = p.klines.volume[k]!;
  });
  const partial = {
    iid: p.iid,
    symbol: p.symbol,
    category: p.category,
    start: p.start,
    end: p.end,
    n,
    marks,
    trades,
    volume,
    retired: p.retired ?? null,
    firstTrade: p.firstTrade,
  };
  const hours = p.funding.map((r) => r[0]);
  for (const [, , stamp] of p.funding) {
    if (stamp >= end)
      throw new MarketEndError(
        `market ${p.iid}: a funding row stamped at or after the run's end`,
      );
  }
  const cum = new Float64Array(hours.length);
  const cumUnmarked = new Int32Array(hours.length);
  let s = 0;
  let u = 0;
  const mk = partial as Market;
  p.funding.forEach(([hour, rate], i) => {
    const m = kit.panel.markAtMinuteEnd(mk, hour - 1);
    if (m === null) u++;
    else s += rate * m;
    cum[i] = s;
    cumUnmarked[i] = u;
  });
  mk.funding = {
    hour: Float64Array.from(hours),
    rate: Float64Array.from(p.funding, (r) => r[1]),
    cum,
    cumUnmarked,
  };
  return mk;
}
