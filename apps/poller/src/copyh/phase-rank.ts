/**
 * RANK (copyh/rules.md C7, and C14's prior mean net; the engine's plan,
 * section 1), on engine.ts: one part, after PRICES.
 * - MAIN's accounts at each Monday of the step: BUILD's and BUILD-L's facts'
 *   members whose mask holds MAIN's bit.
 * - Each MAIN copy of PRICES' positions, a coin's part at a time: its
 *   trader, its follow instant, its latest instant (phase-build.ts
 *   `lastInstantOf`) and its net, when priced.
 * - RANK's accounts at each Monday: lines.ts `rankAt` on the priced ones.
 * - C14's prior mean net of each trader at each Monday where it has a copy:
 *   the mean net of its priced MAIN copies whose follow instant and every leg
 *   lie before M, none when it has no such copy (RL6; the engine's plan, Q2),
 *   so known at the entry's instant (M5).
 * A part's bytes: one JSON line, {rank: [[the Monday's index, [address…]]…],
 * prior: [[address, [[the Monday's index, mean or null]…]]…]}, each list
 * rising.
 */
import { z } from "zod";
import type { PartFunction, PartSpec, PhaseRecord } from "./engine.js";
import { partBytes, partLines, recordAt } from "./engine.js";
import { rankAt, type RankCopy } from "./lines.js";
import {
  MASK,
  factsOf,
  lastInstantOf,
  type BuildFacts,
} from "./phase-build.js";
import { Position } from "./phase-prices.js";
import { StoreError } from "./run.js";

const SHA256 = z.string().regex(/^[0-9a-f]{64}$/);
export const RankInputs = z.object({
  code: z.string(),
  /** BUILD's and BUILD-L's records (none: BUILD-L had no part). */
  build: z.tuple([SHA256, SHA256.nullable()]),
  prices: SHA256,
  mondays: z.array(z.number()),
});
export type RankInputs = z.infer<typeof RankInputs>;
/** Where RANK reads: BUILD's, BUILD-L's and PRICES' phase folders. */
export const RankContext = z.object({
  build: z.string(),
  large: z.string(),
  prices: z.string(),
});

export const Rank = z.object({
  rank: z.array(z.tuple([z.number(), z.array(z.string())])),
  prior: z.array(
    z.tuple([
      z.string(),
      z.array(z.tuple([z.number(), z.number().nullable()])),
    ]),
  ),
});
export type Rank = z.infer<typeof Rank>;

/** What RANK reads of a positions line. */
const RankLine = Position.pick({
  addr: true,
  t: true,
  D: true,
  M: true,
  lines: true,
  plan: true,
  money: true,
});

/** A copy as RANK reads it: a MAIN copy priced or not, and its account's Monday. */
export type RankInput = {
  readonly addr: string;
  /** The index of its Monday in the step's. */
  readonly k: number;
  /** Its follow instant, latest instant and net, when a MAIN copy; null else. */
  readonly main: {
    readonly tIn: number;
    readonly lastLeg: number;
    readonly net: number | null;
  } | null;
};

const byAddr = (a: string, b: string) => (a < b ? -1 : a > b ? 1 : 0);

/** RANK's accounts at each Monday and each trader's prior mean net at each Monday where it has a copy, from MAIN's accounts by Monday and the copies. */
export function rankOf(
  mondays: readonly number[],
  main: ReadonlyMap<number, ReadonlySet<string>>,
  copies: readonly RankInput[],
): Rank {
  const priced: RankCopy[] = [];
  const byTrader = new Map<string, { last: number; net: number }[]>();
  const at = new Map<string, Set<number>>();
  for (const c of copies) {
    const ks = at.get(c.addr);
    if (ks === undefined) at.set(c.addr, new Set([c.k]));
    else ks.add(c.k);
    if (c.main === null || c.main.net === null) continue;
    priced.push({ addr: c.addr, ...c.main, net: c.main.net });
    const list = byTrader.get(c.addr);
    const x = { last: c.main.lastLeg, net: c.main.net };
    if (list === undefined) byTrader.set(c.addr, [x]);
    else list.push(x);
  }
  const rank = mondays.map((M, k): [number, string[]] => [
    k,
    [...rankAt(M, main.get(k) ?? new Set(), priced)].sort(byAddr),
  ]);
  const prior = [...at.keys()]
    .sort(byAddr)
    .map((addr): Rank["prior"][number] => {
      const list = (byTrader.get(addr) ?? []).sort((a, b) => a.last - b.last);
      /** The mean net of the copies whose latest instant lies before M: a prefix of the list. */
      const before = (M: number) => {
        let n = 0;
        let sum = 0;
        for (const x of list) {
          if (x.last >= M) break;
          n += 1;
          sum += x.net;
        }
        return n === 0 ? null : sum / n;
      };
      return [
        addr,
        [...at.get(addr)!]
          .sort((a, b) => a - b)
          .map((k): [number, number | null] => [k, before(mondays[k]!)]),
      ];
    });
  return { rank, prior };
}

/** A positions line as RANK reads it: a MAIN copy's follow instant, latest instant and net (null unpriced); a copy of a Monday not the step's refused. */
export function rankInputOf(
  p: z.infer<typeof RankLine>,
  mondays: readonly number[],
): RankInput {
  const k = mondays.indexOf(p.M);
  if (k < 0)
    throw new StoreError(`${p.addr}: a copy of a Monday not the step's`);
  return {
    addr: p.addr,
    k,
    main: p.lines.includes("MAIN")
      ? {
          tIn: p.t + p.D,
          lastLeg: lastInstantOf(p),
          net: p.money.reason === undefined ? p.money.net : null,
        }
      : null,
  };
}

/** MAIN's accounts at each Monday, by its index: the members (BUILD's and BUILD-L's facts) whose mask holds MAIN's bit. */
export function mainAccountsOf(
  members: Iterable<BuildFacts["members"]>,
): Map<number, Set<string>> {
  const main = new Map<number, Set<string>>();
  for (const list of members)
    for (const [addr, at] of list)
      for (const [k, mask] of at) {
        if ((mask & MASK.MAIN) === 0) continue;
        const s = main.get(k);
        if (s === undefined) main.set(k, new Set([addr]));
        else s.add(addr);
      }
  return main;
}

/** RANK's function (engine.ts `PartFunction`). */
export const rankPart: PartFunction = (inputs, ctx) => {
  const i = RankInputs.parse(inputs);
  const c = RankContext.parse(ctx.context);
  const members: BuildFacts["members"][] = [];
  for (const [dir, want] of [
    [c.build, i.build[0]],
    [c.large, i.build[1]],
  ] as const) {
    if (want === null) continue;
    const record = recordAt(dir, want);
    for (const [id] of record.parts)
      members.push(factsOf(dir, record, id).members);
  }
  const main = mainAccountsOf(members);
  const copies: RankInput[] = [];
  const record = recordAt(c.prices, i.prices);
  for (const [id] of record.parts)
    for (const line of partLines(c.prices, record, id))
      copies.push(
        rankInputOf(
          RankLine.parse(JSON.parse(line.toString("utf8"))),
          i.mondays,
        ),
      );
  return Buffer.from(
    `${JSON.stringify(rankOf(i.mondays, main, copies))}\n`,
    "utf8",
  );
};

/** RANK's one part. */
export const rankParts = (o: RankInputs): PartSpec[] => [
  { id: "rank", inputs: o },
];

/** A closed RANK phase's tables, held to its record. */
export const rankTablesOf = (dir: string, record: PhaseRecord): RankTables =>
  tablesOf(
    Rank.parse(JSON.parse(partBytes(dir, record, "rank").toString("utf8"))),
  );

/** RANK's tables: RANK's accounts by Monday and the prior mean net by trader and Monday, each pair RANK holds. */
export type RankTables = {
  readonly inRank: (addr: string, k: number) => boolean;
  readonly prior: (addr: string, k: number) => number | null;
};

/** RANK's tables of its bytes (a closed part's, or the fortnight's in memory). */
export function tablesOf(r: Rank): RankTables {
  const rank = new Map(r.rank.map(([k, addrs]) => [k, new Set(addrs)]));
  const prior = new Map<string, number | null>();
  for (const [addr, at] of r.prior)
    for (const [k, mean] of at) prior.set(`${addr}|${k}`, mean);
  return {
    inRank: (addr: string, k: number) => rank.get(k)?.has(addr) ?? false,
    prior: (addr: string, k: number): number | null => {
      const mean = prior.get(`${addr}|${k}`);
      if (mean === undefined)
        throw new StoreError(`RANK holds no prior mean of ${addr} at ${k}`);
      return mean;
    },
  };
}
