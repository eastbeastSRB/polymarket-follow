/**
 * The one look's first step (rules.md H15, R3): with the gate open, every
 * fill file read and verified into one pass — SIZING's files first, their
 * records before TEST's start, then TEST's to DATA END's hour — M recomputed
 * from SIZING alone and held to the frozen `sizing.json`; slice 0's TEST
 * positions; the counts printed before any book is fetched or any price
 * exists; the book files their legs need, with the positions' SHA-256 so
 * that step 2 recomputes the same set. Step 2 (the prices, the verdict, the
 * lines) is not built yet.
 */
import { createHash } from "node:crypto";
import { byM4 } from "../market1/fills.js";
import { HOUR_MS } from "../schedule.js";
import { keyDate, type Gate } from "./gate.js";
import {
  DATA_END,
  SIZING_DAYS,
  SIZING_START,
  TEST_END,
  TEST_START,
} from "./instants.js";
import { newPass, passFile } from "./pass.js";
import { episodeSpots, waveSpots, type Spot } from "./positions.js";
import { booksOf, type Ctx } from "./rehearse.js";
import { bySlice, scanM } from "./slices.js";
import { StoreError, fillKeys } from "./store.js";

export type Step1 = {
  M: number;
  spots: Spot[];
  /** The positions' SHA-256: step 2 must recompute the same. */
  sha256: string;
  needed: string[];
  counts: Record<string, unknown>;
};

const monthOf = (t: number) => new Date(t).toISOString().slice(0, 7);
const tally = (xs: readonly string[]) => {
  const out: Record<string, number> = {};
  for (const x of xs) out[x] = (out[x] ?? 0) + 1;
  return out;
};

export async function lookStep1(
  ctx: Ctx,
  gate: Gate,
  frozenM: number,
): Promise<Step1> {
  const keys = fillKeys(SIZING_START, DATA_END + HOUR_MS);
  const absent = keys.filter((k) => !ctx.list.has(k));
  if (absent.length > 0)
    throw new StoreError(
      `${absent.length} fill files are not in the store's list, the first ${absent[0]}`,
    );
  const pass = newPass();
  const seen = new Set<string>();
  const read = async (keys: readonly string[], until: number) => {
    for (const key of keys) {
      await ctx.pace();
      passFile(pass, seen, gate, ctx.store, ctx.list, key, ctx.coins, until);
    }
  };
  const sizingFile = (k: string) => keyDate(k)! < TEST_START;
  await read(keys.filter(sizingFile), TEST_START);
  const { M } = scanM([...pass.counted].sort(byM4), SIZING_DAYS);
  if (M !== frozenM)
    throw new StoreError(`M is ${M} on SIZING, sizing.json's ${frozenM}`);
  await read(
    keys.filter((k) => !sizingFile(k)),
    DATA_END,
  );
  const slice0 = bySlice(pass.counted.sort(byM4), M)[0]!;
  const spots = waveSpots(0, slice0, TEST_START, TEST_END).filter(
    (s) => s.xOut < DATA_END,
  );
  return {
    M,
    spots,
    sha256: createHash("sha256").update(JSON.stringify(spots)).digest("hex"),
    needed: booksOf(spots, ctx.coins),
    counts: {
      files: keys.length,
      days: Object.fromEntries(pass.days),
      late: pass.late,
      legs: Object.fromEntries([...pass.legs].sort()),
      blocks: {
        missing: Object.fromEntries(pass.blocks.missing),
        back: pass.blocks.back,
      },
      topTakerBps: Object.fromEntries(
        [...pass.topTaker].map(([m, r]) => [m, Math.round(r * 1e8) / 1e4]),
      ),
      counted: pass.counted.length,
      M,
      slice0: {
        positions: spots.length,
        byMonth: tally(spots.map((s) => monthOf(s.t))),
        backstopEntries: spots.filter((s) => s.method === "backstop").length,
        episodesByMonth: tally(
          episodeSpots(0, slice0, TEST_START, TEST_END).map((e) =>
            monthOf(e.t),
          ),
        ),
      },
    },
  };
}
