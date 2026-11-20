/**
 * The reproduction (polish/rules.md P15; THE PLAN D47 (a)–(c); the
 * polishing plan 3.7, 2), before FRESH opens and again at look 1 by the
 * frozen program, each part held to what the exploration and WAVE-H's look
 * printed:
 * (a) a store the frozen extraction made again of the ten months: its
 *     manifest the explored store's but for the code, the write's instant,
 *     its seconds and its peaks, and every file the explored manifest lists
 *     read back from it, equal in bytes and SHA-256;
 * (b) N placed and priced at the tape on E and on C as the exploration's
 *     choice and c steps did, equal to `choice.json`'s N and `c.json`'s
 *     first evaluation as JSON; the deciding line, the recipe's cut on
 *     slices 0 to K − 1, on E, equal to `placebo.json`'s;
 * (c) the exam's book-first price on WAVE-H's slice-0 TEST positions, line
 *     for line the look's `positions.jsonl.gz`: each bps field within the
 *     gates' 1e-9, every other field equal.
 */
import { isDeepStrictEqual } from "node:util";
import type { Spot } from "../../waveh/positions.js";
import { compareLine } from "../gates.js";
import {
  FILES_FILE,
  NAMES_FILE,
  USERS_FILE,
  partitionDir,
  type Manifest,
  type Store,
  type StoredFile,
} from "../store.js";
import type { Data } from "../tries/data.js";
import type { Part } from "../tries/parts.js";
import { itemsOf, place, unpricedOf, type Rule } from "../tries/rules.js";
import { statOf } from "../tries/stats.js";
import { priceAll } from "../tries/sweep.js";
import type { CutsFile } from "../tries/trylog.js";
import type { Price } from "./price.js";

/** The manifest's fields a run of other code writes otherwise (THE PLAN D47 (a)): not compared. */
const RUN_FIELDS = ["code", "written", "seconds", "peaks"];

/** (a): the store made again against the explored manifest, `pace` before each file read back. */
export async function matchExtraction(
  explored: Manifest,
  repro: Store,
  pace: () => Promise<void>,
) {
  const problems: string[] = [];
  const keys = (m: Manifest) =>
    Object.keys(m)
      .filter((k) => !RUN_FIELDS.includes(k))
      .sort();
  if (!isDeepStrictEqual(keys(explored), keys(repro.manifest)))
    problems.push("the manifests' fields differ");
  for (const k of keys(explored) as (keyof Manifest)[])
    if (!isDeepStrictEqual(explored[k], repro.manifest[k]))
      problems.push(`the manifest's ${k} differs`);
  const files: [string, StoredFile][] = [
    [USERS_FILE, explored.dict.users.file],
    [NAMES_FILE, explored.dict.names],
    [FILES_FILE, explored.files],
    ...explored.partitions.flatMap((p) =>
      Object.entries(p.files).map(([name, f]): [string, StoredFile] => [
        `${partitionDir(p.table, p.coin, p.month)}/${name}`,
        f,
      ]),
    ),
  ];
  let bytes = 0;
  for (const [rel, want] of files)
    try {
      await pace();
      repro.bytes(rel, want);
      bytes += want.bytes;
    } catch (err) {
      problems.push((err as Error).message);
    }
  return {
    equal: problems.length === 0,
    files: files.length,
    bytes,
    problems: problems.slice(0, 20),
    more: Math.max(0, problems.length - 20),
  };
}

/** A rule's numbers on a part as the choice and c steps print them, its nets re-based by b. */
export async function partOf(
  d: Data,
  o: {
    rule: Rule;
    part: Part;
    M: number;
    cuts: CutsFile["cuts"];
    b: number;
    pace: () => Promise<void>;
    /** Only these slices (the deciding line); all when not given. */
    slices?: number;
  },
) {
  const p = place(d, o.rule, o.part, o.M, o.cuts);
  const keep = p.entries.map((e) =>
    o.slices === undefined ? true : e.slice < o.slices,
  );
  const entries = p.entries.filter((_, i) => keep[i]);
  const specs = p.specs.filter((_, i) => keep[i]);
  const nets = await priceAll(d, specs, o.pace);
  const items = itemsOf(entries, nets, o.b);
  return {
    positions: specs.length,
    priced: items.length,
    left: p.left,
    unpriced: unpricedOf(nets),
    stat: statOf(d.kit, items),
  };
}

/** The fields of a part's numbers held to a printed one, each as JSON (exactly): the names of those that differ. */
export function differs(
  got: Record<string, unknown>,
  printed: Record<string, unknown>,
  fields: readonly string[],
): string[] {
  const json = (v: unknown) => JSON.parse(JSON.stringify(v ?? null)) as unknown;
  return fields.filter(
    (f) => !isDeepStrictEqual(json(got[f]), json(printed[f])),
  );
}

/** (b)'s fields, as `choice.json`'s N and `c.json`'s evaluations print them. */
export const N_FIELDS = [
  "positions",
  "priced",
  "left",
  "unpriced",
  "stat",
] as const;

/** (b)'s deciding line on E against `placebo.json` (its lines' counts and its projection's m, SE, days and coins): counts exact, m and SE to 1e-9 of their size (the sums run in another order). */
export function matchPlacebo(
  got: Awaited<ReturnType<typeof partOf>>,
  printed: {
    positions: number;
    priced: number;
    m: number;
    se: number;
    days: number;
    coins: number;
  },
): string[] {
  const s = got.stat;
  const out: string[] = [];
  if (got.positions !== printed.positions) out.push("positions");
  if (got.priced !== printed.priced) out.push("priced");
  if (s === null || s.days !== printed.days) out.push("days");
  if (s === null || s.markets !== printed.coins) out.push("coins");
  const near = (a: number | null | undefined, b: number) =>
    a != null && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(b));
  if (!near(s?.mean, printed.m)) out.push("m");
  if (!near(s?.se, printed.se)) out.push("se");
  return out;
}

/** (c): each WAVE-H position priced book first, against its line of the look's `positions.jsonl.gz` (set "WAVE-H"). */
export function matchLook(
  spots: readonly Spot[],
  prices: readonly Price[],
  lines: readonly unknown[],
) {
  const problems: string[] = [];
  let bps = 0;
  if (lines.length < spots.length)
    problems.push(
      `${lines.length} lines of the look, ${spots.length} positions`,
    );
  spots.forEach((s, i) => {
    const ref = lines[i];
    if (ref === undefined) return;
    const c = compareLine({ set: "WAVE-H", spot: s, ...prices[i]! }, ref);
    bps = Math.max(bps, c.bps);
    if (!c.equal) problems.push(`line ${i + 1} differs`);
  });
  return {
    equal: problems.length === 0,
    lines: spots.length,
    priced: prices.filter((p) => p.priced.net !== null).length,
    largestBps: bps,
    problems: problems.slice(0, 20),
    more: Math.max(0, problems.length - 20),
  };
}
