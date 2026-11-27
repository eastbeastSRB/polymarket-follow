/**
 * A made-up world for the engine's phases (phase-labels.ts, phase-build.ts):
 * one store made by the real pass and merge over five weeks of 2025, its
 * accounts in bucket 01 — A a directional taker, MAIN's at M2 with an entry
 * in M2's week; B a maker; C silent from 17 days before M2; V netting in the
 * protocol's vault — and X (bucket 02) everyone's other side; dirs.json;
 * a made-up funding store with its list; and the phases LABELS and LABELS-L
 * run on it through real child processes of the build, in a step's engine
 * folder; the tests' readers of a closed phase (the P1 accounts, a BUILD
 * part, a PRICES part), which no step reads whole.
 */
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  partLines,
  runPhase,
  type Phase,
  type PhaseRecord,
} from "../src/copyh/engine.js";
import {
  coinCopies,
  coinKeys,
  coinsOf,
  factsOf,
} from "../src/copyh/phase-build.js";
import {
  labelsOf,
  labelsParts,
  largeParts,
  type LabelsPart,
  type ReadingInputs,
} from "../src/copyh/phase-labels.js";
import { positionOf, type Position } from "../src/copyh/phase-prices.js";
import { PACKAGE_ROOT, sha256 } from "../src/copyh/run.js";
import { SEALED } from "../src/copyh/seal.js";
import { MANIFEST, type Store } from "../src/copyh/store.js";
import { DAY_MS, HOUR_MS } from "../src/schedule.js";
import { DIRS, addr, byBlock, keyOf, record, trade } from "./copyh-world.js";
import { storeOf } from "./copyh-engine-world.js";

export const M1 = Date.parse("2025-09-08T00:00:00Z");
export const M2 = M1 + 7 * DAY_MS;
export const START = M1 - 21 * DAY_MS;
export const END = M2 + 4 * DAY_MS;
export const A = addr(0xa01);
export const B = addr(0xb01);
export const C = addr(0xc01);
export const V = addr(0xd01);
export const X = addr(0xe02);
/** An instant `day` days and `hour` hours from M2. */
export const at = (day: number, hour: number) =>
  M2 + day * DAY_MS + hour * HOUR_MS;
/** A's orders: [instant, side, size, position before]; the last two are its entry in M2's week and its close. */
export const A_ORDERS: [number, "B" | "A", string, string][] = [
  [at(-13, 10), "B", "2", "0.0"],
  [at(-12, 15), "A", "2", "2.0"],
  [at(-10, 9), "A", "3", "0.0"],
  [at(-9, 20), "B", "3", "-3.0"],
  [at(-6, 11), "B", "1.5", "0.0"],
  [at(-5, 13), "B", "0.5", "1.5"],
  [at(-3, 8), "A", "2", "2.0"],
  [at(1, 10), "B", "2", "0.0"],
  [at(2, 9), "A", "2", "2.0"],
];

/** The world's records, [instant, text]; `extra` beside them. */
function recordsOf(extra: readonly [number, string][]): [number, string][] {
  let tid = 0;
  const out: [number, string][] = [];
  for (const [t, side, sz, startPosition] of A_ORDERS)
    for (const r of trade(A, X, {
      coin: "SOL",
      side,
      sz,
      time: t,
      tid: (tid += 1),
      startPosition,
      oid: tid,
    }))
      out.push([t, r]);
  // B: thirty maker fills, alternating sides, a quarter-hour apart on days −8 and −2.
  for (let k = 0; k < 30; k++) {
    const t = at(k < 15 ? -8 : -2, 1) + k * 15 * 60_000;
    const side = k % 2 === 0 ? "B" : "A";
    out.push(
      [
        t,
        record(X, {
          coin: "ETH",
          side,
          time: t,
          tid: (tid += 1),
          crossed: true,
          oid: tid,
        }),
      ],
      [
        t,
        record(B, {
          coin: "ETH",
          side: side === "B" ? "A" : "B",
          time: t,
          tid,
          crossed: false,
          oid: 5_000 + k,
        }),
      ],
    );
  }
  // C: two taker fills 17 days before M2, nothing after.
  for (const t of [at(-17, 3), at(-17, 9)])
    for (const r of trade(C, X, {
      coin: "BTC",
      side: "B",
      time: t,
      tid: (tid += 1),
      oid: tid,
    }))
      out.push([t, r]);
  // V: the protocol vault's netting.
  const tv = at(-4, 2);
  out.push(
    [
      tv,
      record(V, {
        coin: "SOL",
        side: "B",
        time: tv,
        dir: "Net Child Vaults",
        tid: (tid += 1),
        crossed: true,
      }),
    ],
    [
      tv,
      record(X, {
        coin: "SOL",
        side: "A",
        time: tv,
        dir: "Net Child Vaults",
        tid,
        crossed: false,
      }),
    ],
  );
  return [...out, ...extra];
}

/** One node_fills_by_block file an hour that holds a record. */
function filesOf(records: readonly [number, string][]): Map<string, string> {
  const byHour = new Map<number, string[]>();
  for (const [t, r] of records) {
    const h = Math.floor(t / HOUR_MS) * HOUR_MS;
    byHour.set(h, [...(byHour.get(h) ?? []), r]);
  }
  return new Map(
    [...byHour]
      .sort(([a], [b]) => a - b)
      .map(([h, rs]) => [keyOf(h), `${byBlock(1, rs)}\n`]),
  );
}

export type PhaseWorld = {
  store: Store;
  reading: ReadingInputs;
  context: { stores: string[]; roots: string[]; dirsFile: string };
};

/** The world's store (with `extra` records) and dirs.json, as a phase reads them. */
export async function phaseWorld(
  extra: readonly [number, string][] = [],
): Promise<PhaseWorld> {
  const store = await storeOf(filesOf(recordsOf(extra)), START, END);
  const dirsFile = path.join(
    mkdtempSync(path.join(tmpdir(), "copyh-dirs-")),
    "dirs.json",
  );
  writeFileSync(
    dirsFile,
    JSON.stringify({
      rule: "made-up",
      dirs: DIRS.map(([dir, kind]) => ({ dir, kind })),
    }),
  );
  return {
    store,
    reading: {
      stores: [sha256(readFileSync(path.join(store.dir, MANIFEST)))],
      dirs: sha256(readFileSync(dirsFile)),
    },
    context: {
      stores: [store.dir],
      roots: [path.dirname(store.dir)],
      dirsFile,
    },
  };
}

/** A made-up funding store of these windows (coin, start, rows: [time, rate]), its files at their keys under `…\COPY-H\funding`, and its list in copyh/funding.sha256's form; `absent` windows listed but not written (a reader must not open them). */
export function fundingWorld(
  windows: readonly {
    coin: string;
    start: number;
    rows: readonly (readonly [time: number, rate: string])[];
    absent?: boolean;
  }[],
): { root: string; store: string; list: string; sha256: string } {
  const root = mkdtempSync(path.join(tmpdir(), "copyh-funding-"));
  const store = path.join(root, "COPY-H", "funding");
  const lines = ["# made-up funding list"];
  for (const w of windows) {
    const key = `info/fundingHistory/${w.coin}/${w.start}.json`;
    const bytes = Buffer.from(
      JSON.stringify(
        w.rows.map(([time, rate]) => ({
          coin: w.coin,
          fundingRate: rate,
          premium: "0.0001",
          time,
        })),
      ),
    );
    if (w.absent !== true) {
      const file = path.join(store, ...key.split("/"));
      mkdirSync(path.dirname(file), { recursive: true });
      writeFileSync(file, bytes);
    }
    lines.push(`${sha256(bytes)} *${key}`);
  }
  const list = path.join(root, "funding.sha256");
  writeFileSync(list, `${lines.join("\n")}\n`);
  return { root, store, list, sha256: sha256(readFileSync(list)) };
}

/** A new step's engine folder: `…\COPY-H\look1\engine`. */
export const engineDir = () =>
  path.join(
    mkdtempSync(path.join(tmpdir(), "copyh-phases-")),
    "COPY-H",
    "look1",
    "engine",
  );
export const SEAL = { ...SEALED, engine: "look1" as const };
const never = { stop: () => null };

/** A phase of `module` in the engine folder, one child at 1 GB. */
export const phaseOf = (
  engine: string,
  name: string,
  module: string,
  fn: string,
  parts: Phase["parts"],
  context: unknown,
): Phase => ({
  name,
  dir: path.join(engine, name.toLowerCase()),
  module: path.join(PACKAGE_ROOT, "dist", "copyh", module),
  fn,
  parts,
  context,
  workers: 1,
  heapGb: 1,
  seal: SEAL,
  budget: never,
  log: () => {},
});

/** LABELS, and LABELS-L when it has parts, on bucket 01 at M1 and M2. */
export async function labelsRun(
  w: PhaseWorld,
  engine: string,
  o: { fillsMax?: number; lane?: number | null } = {},
) {
  const parts = labelsParts({
    code: "made-up",
    reading: w.reading,
    mondays: [M1, M2],
    fillsMax: o.fillsMax ?? 1e9,
    lane: o.lane ?? null,
  }).filter((p) => p.id.startsWith("b001-"));
  const main = phaseOf(
    engine,
    "LABELS",
    "phase-labels.js",
    "labelsPart",
    parts,
    w.context,
  );
  const record = await runPhase(main);
  const labels = labelsOf(main.dir, record);
  const large = largeParts(parts, labels);
  const l = phaseOf(
    engine,
    "LABELS-L",
    "phase-labels.js",
    "labelsLargePart",
    large,
    w.context,
  );
  const largeRecord: PhaseRecord | null =
    large.length === 0 ? null : await runPhase(l);
  return {
    labels,
    large:
      largeRecord === null
        ? new Map<string, LabelsPart>()
        : labelsOf(l.dir, largeRecord),
    dirs: { labels: main.dir, large: l.dir },
    records: { labels: record, large: largeRecord },
  };
}

/** Every P1 account at each Monday, from LABELS' and LABELS-L's parts together. */
export function p1Of(
  ...parts: readonly ReadonlyMap<string, LabelsPart>[]
): Map<number, Set<string>> {
  const out = new Map<number, Set<string>>();
  for (const labels of parts)
    for (const part of labels.values())
      for (const d of part.mondays) {
        const set = out.get(d.M) ?? new Set<string>();
        for (const a of d.p1) set.add(a);
        out.set(d.M, set);
      }
  return out;
}

/** A closed BUILD part read by its index: its facts, and each coin's copies and keys. */
export function buildOf(dir: string, record: PhaseRecord, id: string) {
  const one: PhaseRecord = {
    phase: record.phase,
    parts: record.parts.filter(([p]) => p === id),
  };
  return {
    facts: factsOf(dir, record, id),
    coins: new Map(
      coinsOf(dir, one).map((iid) => [
        iid,
        {
          copies: coinCopies(dir, one, iid),
          keys: coinKeys(dir, one, iid),
        },
      ]),
    ),
  };
}

/** A closed PRICES part's positions, held to its record (engine.ts `partLines`), each parsed. */
export function positionsOf(
  dir: string,
  record: PhaseRecord,
  id: string,
): Position[] {
  const out: Position[] = [];
  for (const line of partLines(dir, record, id)) out.push(positionOf(line));
  return out;
}
