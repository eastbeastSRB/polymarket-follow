/**
 * The lines (copyh/rules.md C7), each entry's membership fixed at its
 * Monday M.
 * - R7's account-level conditions at M: BROAD is P1 (C5); MAIN, P1 with the
 *   habit window covered, a median hold of at least 6 h and at least 3
 *   closed cycles; TEN, MAIN with at least 10; DAY, MAIN with a median hold
 *   of at least 24 h. The coverage is the caller's: COPY-H's (labels.ts
 *   `coverageAt`), or the paper's in the reproduction. An account the kit
 *   is not run on (C4: it has no habits) is in no line.
 * - An entry's lines: its account's at M when its market is primary (C6);
 *   else none (the entry is counted apart). MAIN, TEN, BROAD and DAY each
 *   take their own accounts as d's removal set (C10); every line made of
 *   MAIN's copies takes MAIN's.
 * - MAIN's copies priced at another delay or on other marks (M7; X3's
 *   lines): DELAY0 at D = 0 and LAST at D, each on the minute's last market
 *   price; DELAY+5 and DELAY+15 at D + 5 and D + 15 min on C9's marks. (STOP2,
 *   STOP5, DAYS7 and JUMP are `dist/paper/copy.js`'s, through money.ts.)
 * - RANK: MAIN's copies of the top fifth of MAIN's accounts at M, ranked by
 *   the mean net of their own priced MAIN copies whose follow instant and
 *   every leg lie in [M − 12 w, M), at least 5 of them: the first ⌈n ÷ 5⌉ of
 *   the n ranked, ties by address, the smaller first.
 * - SLICES: four disjoint account groups, the address's number mod 4.
 */
import type { Habits } from "../paper/research.js";
import { HOUR_MS, MINUTE_MS } from "../schedule.js";
import {
  DAY_HOLD_HOURS,
  DELAY_LINES_MINUTES,
  MAIN_CLOSED_CYCLES,
  MAIN_HOLD_HOURS,
  RANK_MIN_COPIES,
  RANK_SHARE,
  RANK_WEEKS,
  SLICES,
  TEN_CLOSED_CYCLES,
} from "./design.js";
import { WEEK_MS } from "./instants.js";
import { isP1, type Coverage } from "./labels.js";
import type { CoinMarkets } from "./markets.js";

/** The lines whose copies have their own accounts, in C7's order. */
export const LINES = ["MAIN", "TEN", "BROAD", "DAY"] as const;
export type Line = (typeof LINES)[number];

/** An account's lines at M: R7's account-level conditions (C7). */
export type AccountLines = Readonly<Record<Line, boolean>>;

const NONE: AccountLines = {
  MAIN: false,
  TEN: false,
  BROAD: false,
  DAY: false,
};

/** The account-level conditions at M from its label and habits there; `habits` null for an account the kit is not run on. */
export function accountLines(
  label: string,
  habits: Pick<Habits, "closed" | "medianHoldMs"> | null,
  coverage: Coverage,
): AccountLines {
  if (habits === null) return NONE;
  const p1 = isP1(label, coverage);
  const hold = habits.medianHoldMs;
  const holds = (hours: number) => hold !== null && hold >= hours * HOUR_MS;
  const main =
    p1 &&
    coverage.habitCovered &&
    holds(MAIN_HOLD_HOURS) &&
    habits.closed >= MAIN_CLOSED_CYCLES;
  return {
    MAIN: main,
    TEN: main && habits.closed >= TEN_CLOSED_CYCLES,
    BROAD: p1,
    DAY: main && holds(DAY_HOLD_HOURS),
  };
}

/** An entry's lines (C6, C7): its account's at M, in C7's order, when its market is primary; else none. */
export const entryLines = (account: AccountLines, primary: boolean): Line[] =>
  primary ? LINES.filter((l) => account[l]) : [];

/** MAIN's copies priced at another delay or on other marks (C7; M7): each line's delay from the entry's D, and its market object. */
export const MOVED: readonly {
  readonly line: "DELAY0" | "DELAY+5" | "DELAY+15" | "LAST";
  readonly delay: (D: number) => number;
  readonly marks: keyof CoinMarkets;
}[] = [
  {
    line: "DELAY0",
    delay: () => DELAY_LINES_MINUTES[0] * MINUTE_MS,
    marks: "last",
  },
  {
    line: "DELAY+5",
    delay: (D) => D + DELAY_LINES_MINUTES[1] * MINUTE_MS,
    marks: "vwap",
  },
  {
    line: "DELAY+15",
    delay: (D) => D + DELAY_LINES_MINUTES[2] * MINUTE_MS,
    marks: "vwap",
  },
  { line: "LAST", delay: (D) => D, marks: "last" },
];

/** A priced MAIN copy as RANK reads it: its trader, its follow instant, its last leg's instant and its net in bps. */
export type RankCopy = {
  readonly addr: string;
  readonly tIn: number;
  readonly lastLeg: number;
  readonly net: number;
};

/** RANK's accounts at M (C7), of MAIN's accounts there, from the priced MAIN copies. */
export function rankAt(
  M: number,
  main: ReadonlySet<string>,
  copies: readonly RankCopy[],
): Set<string> {
  const from = M - RANK_WEEKS * WEEK_MS;
  const sums = new Map<string, { n: number; sum: number }>();
  for (const c of copies) {
    if (!main.has(c.addr) || c.tIn < from || c.lastLeg >= M) continue;
    const s = sums.get(c.addr);
    if (s === undefined) sums.set(c.addr, { n: 1, sum: c.net });
    else {
      s.n += 1;
      s.sum += c.net;
    }
  }
  const ranked = [...sums]
    .filter(([, s]) => s.n >= RANK_MIN_COPIES)
    .map(([addr, s]) => ({ addr, mean: s.sum / s.n }))
    .sort((a, b) => b.mean - a.mean || (a.addr < b.addr ? -1 : 1));
  return new Set(
    ranked.slice(0, Math.ceil(ranked.length * RANK_SHARE)).map((r) => r.addr),
  );
}

/** SLICES (C7): an account's group, the address's number mod 4. */
export const sliceOf = (addr: string): number =>
  Number(BigInt(addr) % BigInt(SLICES));
