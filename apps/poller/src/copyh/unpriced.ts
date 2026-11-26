/**
 * Unpriced, missing, gap (copyh/rules.md C11, R11 unchanged).
 * - Unpriced: a copy whose leg finds no mark within 5 minutes before an
 *   instant, or a funding settlement without a mark, by lib-exits'
 *   `unpricedReason` (money.ts gives it); left out of every mean, never
 *   guessed. A copy open at its coin's Settlement is priced there (C8).
 * - Missing: a funding hour without a row, charged nothing and counted
 *   (the kit's `fundingMissing`, money.ts).
 * - A gap copy: a chain break on its coin after the entry's first event, up
 *   to its last exit used, or to its plan's end while open (lib-exits'
 *   `chainBreaks` and `crossesBreak`); or a hole (C3) in [t, that instant]:
 *   one whose stretch without a record meets it. A hole begins at the last
 *   record before it, so one that begins at the copy's last exit's own
 *   record lies after the exit, and one that ends at t before the entry.
 *   R11's third case, that instant after the account's P, does not arise:
 *   the archive is read to END.
 */
import type {
  ChainBreaks,
  CopyPlan,
  Group,
  OrderEvent,
  Research,
} from "../paper/research.js";
import { holesOf } from "./holes.js";
import { FileLine } from "./integrity.js";
import type { Store } from "./store.js";

/** C3's holes of a reading: every file's minutes across its stores, from the first store's start to END. */
export function holesOfReading(
  stores: readonly Pick<Store, "manifest" | "fileLines">[],
  END: number,
): [number, number][] {
  const minutes = stores.flatMap((s) =>
    s.fileLines().map((l) => FileLine.parse(l).scan.minutes),
  );
  return holesOf(minutes, stores[0]!.manifest.start, END);
}

/** C11: whether a copy is a gap copy, on its account's whole history, its plan (to `end`, END or its coin's end) and the reading's holes. */
export function isGap(
  kit: Research,
  history: {
    readonly events: readonly OrderEvent[];
    readonly chain: ChainBreaks;
  },
  g: Group,
  plan: CopyPlan,
  holes: readonly (readonly [number, number])[],
  end: number,
): boolean {
  if (kit.exits.crossesBreak(history.chain, history.events, g, plan))
    return true;
  const x = plan.flag === "open" ? end : plan.lastExitT!;
  return holes.some(([a, b]) => a < x && b > g.t);
}
