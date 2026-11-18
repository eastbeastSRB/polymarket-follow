/**
 * The library the gates after G0 share, and POLISH-EXPLORE imports
 * (decisions 2026-11-18, EXTRACT-REVIEW's findings, Q6): the input files'
 * counts, the counted fills, the marks and markets, the tape; slice 0's
 * positions as WAVE-H's look finds them; the gates' file, by which a store
 * is trusted. It imports no gate.
 */
import { z } from "zod";
import type { Market } from "../paper/research.js";
import { HOUR_MS } from "../schedule.js";
import type { Marks } from "../waveh/ctxs.js";
import {
  DATA_END,
  SIZING_START,
  TEST_END,
  TEST_START,
} from "../waveh/instants.js";
import { waveSpots } from "../waveh/positions.js";
import { bySlice } from "../waveh/slices.js";
import { SHA256 } from "../waveh/store.js";
import { countedFrom, type CountedSet } from "./counted.js";
import type { GatesInput } from "./gates.js";
import { Tape, marketsFrom } from "./legs.js";
import type { FileCounts } from "./store.js";

export const GatesFile = z.object({
  store: z.object({ manifestSha256: z.string().regex(SHA256) }),
  passed: z.boolean(),
  gates: z.record(z.string(), z.object({ pass: z.boolean() }).loose()),
  written: z.string(),
});
export type GatesFile = z.infer<typeof GatesFile>;
/** The gates' folder in the analyzer's folder of the range, and their file. */
export const GATES = "gates";
export const GATES_FILE = "gates.json";

/** What the gates after G0 share: the input files' counts, the counted fills, the marks and markets, the tape. */
export type Library = CountedSet & {
  files: FileCounts[];
  marks: Marks;
  markets: Map<number, Market>;
  tape: Tape;
};

export function libraryOf(o: GatesInput): Library {
  return {
    files: o.store.files(),
    ...countedFrom(o.store, o.coins),
    ...marketsFrom(o.store, o.kit, o.coins),
    tape: new Tape(o.store),
  };
}

/** G2's positions, as WAVE-H's look finds them (look.ts `lookStep1`). */
export function positionsOf(lib: Library, M: number) {
  const slice0 = bySlice(lib.counted, M)[0]!;
  const spots = waveSpots(0, slice0, TEST_START, TEST_END).filter(
    (s) => s.xOut < DATA_END,
  );
  const sizing = waveSpots(0, slice0, SIZING_START, TEST_START);
  const late = sizing.filter((s) => s.xOut >= TEST_START - HOUR_MS);
  return { slice0, spots, sizing, late };
}
