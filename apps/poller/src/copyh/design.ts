/**
 * Every number COPY-H's rules fix, one home (copyh/rules.md C18, whose table
 * test/copyh-rules.test.ts holds to this file; the supervisor's ruling 13 on
 * COPYH-STORE's differences, 2026-11-25). Times are ms since the epoch; a
 * window [a, b) includes a and excludes b. A record's instant is its fill's
 * `time`, never its file's hour. The kit's own constants stay the kit's.
 */

/** The archive's first fill file's hour, 2025-05-25 14h (C1). */
export const ARCHIVE_START = Date.parse("2025-05-25T14:00:00Z");
/** M₀: the first Monday with 30 days of the archive before it; E's entries start here, the burn-in ends here (C1). */
export const M0 = Date.parse("2025-06-30T00:00:00Z");
/** E's end: the end of WAVE-H's raw store, whose last fill file is 2026-05-29 01h (C1). */
export const END_E = Date.parse("2026-05-29T02:00:00Z");
/** S's end, FRESH's (FRESH_END): FRESH-2's months start here (C1). */
export const END_S = Date.parse("2026-11-16T00:00:00Z");
/** FRESH-2's end, 26 weeks after END_S (C1; the review's L1, the owner's ruling 7). */
export const END_F2 = Date.parse("2027-05-17T00:00:00Z");
/** The first funding hour read: no copy is open before M₀ (C9; RM5). */
export const FUNDING_FROM = M0;
/** The hour both archive formats hold: `node_fills` through it, `node_fills_by_block` from it (C3). */
export const SWITCH_HOUR = Date.parse("2025-07-27T08:00:00Z");

/** A UTC day of files whose records fail the boundary in more than this share, and at least this many, stops the step (C3). */
export const FAIL_SHARE = 0.01;
export const FAIL_LEAST = 10;
/** `sz` and `startPosition` pass the boundary only with at most this many significant digits, so that a double gives each back exactly (C3; D5). */
export const EXACT_DIGITS = 15;
/** The fills' account buckets: the address's last two hex digits (C3). */
export const BUCKETS = 256;
/** A hole: a stretch of at least this long with no record of any coin (C3). */
export const HOLE_MS = 60_000;
/** The kit's `buildEntries` merge window (C4). */
export const MERGE_MS = 60_000;
/** An account's exit rows at most before the kit is not run on it (C4; RH1 (b)). */
export const EXITS_MAX = 20_000_000;
/** The float residue counted: 1e-9 ≤ |prev + net| < 1e-6 (C15 (c) 6; L3). */
export const RESIDUE_BOUNDS = [1e-9, 1e-6] as const;

/** The `dir` values and the liquidation method that make a trade no market trade (C3, M1; the rules review's Q6). */
export const ADL_DIR = "Auto-Deleveraging";
export const SETTLEMENT_DIR = "Settlement";
export const VAULT_DIR = "Net Child Vaults";
export const BACKSTOP_METHOD = "backstop";

/** The label's capture (C5). */
export const LABEL_CAPTURE_DAYS = 90;
/** MAIN's median hold and closed cycles (C7). */
export const MAIN_HOLD_HOURS = 6;
export const MAIN_CLOSED_CYCLES = 3;
export const TEN_CLOSED_CYCLES = 10;
export const DAY_HOLD_HOURS = 24;
/** The STOP lines' stops (C7). */
export const STOPS = [0.02, 0.05] as const;
export const DAYS7_DAYS = 7;
export const JUMP = 3;
/** The delay lines' minutes (C7). */
export const DELAY_LINES_MINUTES = [0, 5, 15] as const;
/** RANK: its weeks, a trader's least copies and the share kept (C7). */
export const RANK_WEEKS = 12;
export const RANK_MIN_COPIES = 5;
export const RANK_SHARE = 0.2;
export const SLICES = 4;

/** The taker fee a leg (C9). */
export const FEE_A_LEG = 0.00045;
/** Binance's taker fee a side, for the venue print (C13). */
export const BINANCE_FEE_A_SIDE = 0.0005;
/** A spread pair: two consecutive market-trade taker records of opposite sides at most this far apart (C9). */
export const PAIR_MS = 2_000;
export const SPREAD_MIN_MINUTES = 30;
export const SPREAD_FALLBACK = 0.0025;
/** The settlement's mark: 5 or 60 minutes [SET BEFORE THE FREEZE by C16's count on all of E; null until then] (C9). */
export const SETTLEMENT_MARK_MINUTES: 5 | 60 | null = null;
export const SETTLEMENT_MARK_SWITCH = 0.005;
/** A thin leg: under this notional in the minute and the five before it (C9; M6). */
export const THIN_NOTIONAL = 1_000;
export const THIN_MINUTES = 6;
export const D_HORIZON_HOURS = 24;

/** The verdict's numbers (C12). */
export const WITHHELD_SHARE = 0.02;
export const DELTA_BPS = 10;
export const Z_LOOKS = [2.81, 2.43] as const;
export const SMALLEST_EDGE = [2.43, 0.8416212335729143] as const;
/** The concentration print: the best days left out, the top traders' share and count (C13). */
export const CONCENTRATION = { bestDays: 2, topShare: 0.01, topTraders: 10 };

/** The owner's rounds and FRESH-2 (C14). */
export const ROUNDS = 3;
export const TRIES_A_ROUND = [8, 6, 4] as const;
export const Z_CHOICE = 2.99;
export const CHOICE_MIN_TRADERS = 100;
export const CHOICE_MIN_DAYS = 100;
export const CHOICE_BEST_DAYS_LEFT_OUT = 2;
export const CHOSEN_AT_MOST = 2;
export const Z_CONFIRM = [2.24, 1.96] as const;
/** FRESH-2's seal: a try's z and MAIN's. */
export const Z_SEAL = [1.96, 1.645] as const;
export const FRESH2_FILES = 4_368;

/** The tripwire (C16). */
export const TRIPWIRE_MINUTES = 6;
export const TRIPWIRE_STOP = 0.01;

/** A part is planned to last at most this long (C15). */
export const PART_MINUTES = 15;
/** A run starts no new part once these are spent, so that with the work in flight it ends inside PART_MINUTES (C15; the fix-check's F4). */
export const RUN_MINUTES = 14;
/** The UTC minutes of the day in which no part starts: 02:30–06:00 and 10:25–11:15 (C15). */
export const CLOSED_WINDOWS: readonly (readonly [number, number])[] = [
  [150, 360],
  [625, 675],
];
/**
 * Each thread's old-generation ceiling, GB: every pass worker's and the
 * program's own (the merge, the integrity) [SET BEFORE THE FREEZE: twice the
 * rehearsal's largest measured peak; until the rehearsal, three times the
 * peaks measured on synthetic data at full size (C15; D10)]. A later step
 * may raise it by COPYH_HEAP_GB, never lower it (RH1 (c)). Measured
 * 2026-11-25 (COPYH-STORE-2, synthetic hours of 5.8–6 million records, 2.5
 * GB decoded, with a 14 MB line): a pass worker 1,899 MB of heap with 400,000
 * accounts in the file, 2,525 MB with 2.6 million; the merge of a
 * 12-million-row unit with 2,967,257 accounts in the dictionary 1,765 MB; an
 * integrity unit holding an 11.6-million-row partition 346 MB; the re-read of
 * a day of three such files 652 MB. Three times the largest, 7,575 MB,
 * rounded up to a whole GB.
 */
export const WORKER_HEAP_GB = 8;
/** Above this the parts are cut smaller instead (C15). */
export const WORKER_HEAP_CAP_GB = 20;

/** The rehearsal's priced fortnight (C15 (c) 10). */
export const REHEARSAL_WINDOW = [
  Date.parse("2025-06-30T00:00:00Z"),
  Date.parse("2025-07-14T00:00:00Z"),
] as const;
/** The label bound's check (C15 (c) 7). */
export const LABEL_CHECK_MONDAYS = [
  "2025-12-01",
  "2026-02-02",
  "2026-04-06",
  "2026-05-25",
] as const;
export const LABEL_CHECK_SLICE = [32, 0] as const;
export const LABEL_CHECK_PASS = 0.01;
/** The reproduction's known answers and its tolerance (C15 (a)). */
export const REPRODUCTION = [1700, 1366, 1104, 26, 1137, 157, 525, 61] as const;
export const REPRODUCTION_TOLERANCE_BPS = 1e-9;
/** The integrity's sample days, re-read by `reread.ts`: the analyzer's G6 days on E, the 15th of each of S's months (C15; D11, the supervisor's ruling Q6). */
export const SAMPLE_DAYS = {
  E: [
    "2025-05-31",
    "2025-06-01",
    "2025-06-15",
    "2025-07-27",
    "2025-08-15",
    "2025-09-15",
    "2025-10-10",
    "2025-11-15",
    "2025-12-15",
    "2026-01-15",
    "2026-02-15",
    "2026-03-15",
    "2026-04-15",
    "2026-05-28",
    "2026-05-29",
  ],
  S: [
    "2026-06-15",
    "2026-07-15",
    "2026-08-15",
    "2026-09-15",
    "2026-10-15",
    "2026-11-15",
  ],
} as const;
