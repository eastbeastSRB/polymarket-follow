# The exam's rules (polish/rules.md)

The polishing's last step: one exam, on FRESH's months, of the rule the
exploration chose on WAVE-H's ten months. Written before the freeze, final
but for the owner's marked options (`[OPTION …]`), which are filled in at the
owner's talk; then fresh reviews, the freeze (P0), and look 1. The plan:
`docs/reviews/wave-polish-plan-2026-11-17.md`, sections 3 and 4, with its
review; the decisions it rests on, newest first: 2026-11-19 "the exam's
placebo and WITHHELD projection ran" (`e217fa9`), the owner's "the 715 cut
decides the exam on FRESH, with the safety net" (`710338f`), "the 715 option
made safe" (`0379582`), "POLISH-RULES's plan, its eight questions ruled"
(`23823bb`), "the exam's deciding line pools K = 20 slices" (`8c0407e`),
"HOLDS stays at 99%; … LIKELY", the exploration's Final review verified;
2026-11-17 "THE POLISHING PLAN APPROVED" (F1–F19). The D-numbers, T-numbers
and Q-numbers are POLISH-RULES's plan ("THE PLAN", D1–D53, its technical
calls and questions), which `23823bb` ruled and the code's comments cite.
Where a rule names WAVE-H
(`apps/poller/waveh/rules.md`, H0–H15) or MARKET-1
(`apps/poller/market1/rules.md`, M1–M13), the exam means it word for word
and runs their frozen code for it. Where a rule names code, the code in
`apps/poller/src/polish/` (compiled to `dist/polish/`) does exactly that, and
a test pins it; every number a rule fixes has one home,
`src/polish/exam/design.ts`, and the table at the end (P17) holds this file to
it. Figures in brackets are prints from before the freeze, deciding nothing.

*Holds and does not hold are verdicts on this test, never instructions to
trade.*

## P0. Identity and what is frozen

- **One test, one deciding line.** The exam is the rule the exploration
  chose, sharpened by the owner (P4), tested once on FRESH: the months after
  WAVE-H's data, which no one has read. Every other line is beside it and
  decides nothing. **The exam decides nothing for MARKET-1, WAVE-H or the
  paper experiment, and is never combined with their verdicts** (F14).
- **Frozen together, what runs** (`polish/FROZEN.sha256`, written by
  `tools/polish-freeze.cjs --final`, sha256sum format, paths relative to the
  package folder): the program `dist/polish.js` and every file of
  `dist/polish/`; the 31 compiled files of WAVE-H, MARKET-1 and the paper
  experiment its imports reach (`EXAM_CLOSURE`), each equal, byte for byte,
  to its line in its own freeze (the tool refuses otherwise); every file of
  `research/` (the kit); lz4js's three files; every file of `polish/` —
  `rules.md`, `cuts.json`, `known-unpaired.json`, `tries.md`, `fresh.sha256`
  and `fresh-unpaired.json` required by name — and WAVE-H's
  `waveh/data.sha256`, `coins.json` and `sizing.json`. `dist/schedule.js` and
  `dist/log.js` are shared and not frozen; their hashes are logged at each
  start (as WAVE-H's H0).
- **The gate** (decisions 2026-11-19, Q1): FRESH opens only when
  `polish/FROZEN.sha256` lists every file of what runs with its hash, holds
  exactly one line `# tag polish-freeze-<n>`, and that git tag holds this
  very list, byte for byte (`exam/gate.ts`). An untagged or edited list
  cannot open FRESH. Until it opens, every reader refuses FRESH's raw store
  (`…\FRESH\store`) and the analyzer's FRESH folder (`…\ANALYZER\FRESH`), by
  name and by real path, and every key dated after DATA END; a key dated at
  or after FRESH_END is refused even open (`seal.ts`).
- **After the freeze nothing changes**, but by H0's route: a defect is
  written in a dated decisions entry before any fix; the fix, its tests and
  a new list tagged `polish-freeze-<n + 1>`; the reason the fix cannot have
  been chosen by what was seen.
- **Every output names its identity first** (D51): the program's
  fingerprint; WAVE-H's freeze; the exam's freeze and its tag (steps 1–2);
  the ten months' trusted store and its gates by SHA-256; the exploration's
  files read; for FRESH, `fresh.sha256`, FRESH's store, `books.jsonl`,
  `step1.json` and `repro.json`.

## P1. Instants and ranges

- **DATA END** = 2026-05-29T01:00:00Z (H1). **FRESH_END** =
  2026-11-16T00:00:00Z, the download's end: no record or row at or after it
  is read.
- **FRESH's range** (`range.ts` FRESH_RANGE, held key for key to
  `tools/waveh-fetch.cjs`'s plan): the 4,102 `node_fills_by_block` files of
  the hours [2026-05-29 02h, FRESH_END); the 170 `asset_ctxs` days of
  [2026-05-29, FRESH_END) but 2026-07-08 (the archive has none); the 38
  coins' `fundingHistory` windows on the 20-day grid from DATA END, the last
  ending at FRESH_END, 9 a coin (342). The minute grid [2026-05-29T00:00Z,
  FRESH_END), 246,240 minutes.
- **The deciding days of look 1** (F12; `design.ts` SEGMENTS): positions
  with t ≥ 2026-05-30T00:00Z and x_out < 2026-08-31T00:00Z (segment 1;
  entries on 92 days), and with t ≥ 2026-11-07T00:00Z and x_out < FRESH_END
  (segment 2; entries on 8 days). The exam's positions are those with t ≥
  2026-05-30 and x_out < FRESH_END (`fresh.ts` inExam), not the parts' 50-hour
  stop; entries of 2026-05-29 decide nothing and still block (M5).
- **The discovery window**: every other exam position (t in
  [2026-08-31, 2026-11-07) or x_out reaching past a segment's end), printed
  apart, "not independent".
- **Look 2** (two looks only, P12): segment 1 and segment 2′, t ≥
  2026-11-07 and x_out < 2027-02-06T00:00Z (`LOOK2_END`), on FRESH and
  FRESH-2, about 182 days, about 2027-02-08. Its code is a later build under
  its own freeze, every file of look 1's list byte-identical and this file
  unchanged.
- Times as H1: "the 60 minutes up to t" is [t − 3,600,000, t], both ends in;
  every other window is [a, b); a UTC day is [00:00Z, +24 h).

## P2. FRESH's data and store

- **The list** `polish/fresh.sha256` (D7; T3): every file of FRESH's range,
  its key and SHA-256 as FRESH's download lists them, written by
  `tools/polish-freeze.cjs --data` from FRESH's `manifest.jsonl` (names,
  bytes and SHA-256s; no data file opened), only when the manifest holds
  exactly the range's 4,614 keys, each once [2026-11-20: 4,614 files,
  SHA-256 `17de22e5…2273`]. Every key the range needs is in the list before
  any is read; a file missing or differing stops step 1 (exit 5): H0's
  route.
- **The extraction** (D8): FRESH is extracted by the frozen extraction
  (`extract`'s pass, writers, contexts, funding and merge) with FRESH's range
  into `<EXAM_ROOT>\store` (`ANALYZER\FRESH` at look 1).
- **The store's integrity, before any position** (D9; decisions 2026-11-19,
  Q7 (a); `fresh.ts` integrityOf, written whole to `look1\integrity.json`):
  - G0's checks (`gates.ts` wholeOf): every file whole, every partition of
    the range present, the store FRESH's, whole, made from `fresh.sha256`
    by this very program under WAVE-H's freeze, `files.jsonl` FRESH's files
    as listed, no record refused or misread, every row conserved;
  - G5's pairing (`pairingOf`): a trade split by a file boundary pairs only
    between files next in order; a record left alone only in FRESH's first
    file (2026-05-29 02h) or its last (2026-11-15 23h), each listed; any
    other record left unpaired fails unless `polish/fresh-unpaired.json`
    (empty at the freeze) lists it on its side.

  A failure stops step 1 (exit 6), every record listed, for the supervisor's
  ruling by H0's route: a re-freeze of `fresh-unpaired.json`, then step 1
  again. Never a waiver in code.
- **An `asset_ctxs` day** of FRESH whose rows fail WAVE-H's 1% rule, or
  whose header lacks a column, is read as absent (no context that day),
  listed in the store's manifest and counted in F7's list; never a stop
  (D11; Q6). The ten months keep WAVE-H's stop.
- **F7's list** (D12), each day with why and, at step 1, the share of the
  715 line's and N's positions on the deciding days, before option B's cut,
  whose [x_in, x_out] meets it:
  - 2026-07-08: no `asset_ctxs` file, and no books;
  - the archive's days without books by its listing of 2026-11-13
    (`NO_BOOK_DAYS`): 2026-07-08 and 2026-07-12 → 17;
  - the thin `asset_ctxs` days (`THIN_CTXS_DAYS`), under half the median
    bytes of WAVE-H's 370 days (11,181,121.5 B), from the two manifests'
    sizes alone (the tool refuses a list that is not its own): 59 days,
    2026-05-30, 08-08, 08-27, 08-30, then 09-15 → 11-15 but 09-17, 09-19,
    09-20, 09-21, 10-03, 11-03 and 11-04 — every day of segment 2 among
    them;
  - any day read as absent, and any day without its file.

  Nothing that decides reads `asset_ctxs` but through the minute price
  (P7), whose trade fallback step 1 counts by coin and day.

## P3. Coins and counted fills

WAVE-H's coins (H3, `waveh/coins.json`: the 38 small coins, BTC and ETH
beside) and its counted fill (H4) word for word, on FRESH's liquidation
records stamped before the store's own end (FRESH_END; `counted.ts`
boundOf), in M4's order (D13).

## P4. The recipe

- **The rule**: B0 + W4, as the exploration explored it (`polish/tries.md`
  3.2 and W4; choice.json's rule): M = 147 (`waveh/sizing.json`), slice(a) =
  a mod 147; in each slice, MARKET-1's `waveEntries` over the slice's FRESH
  counted fills from FRESH's first file (an earlier entry blocks); **W4**
  keeps an entry when the different accounts with a counted fill of σ in
  the 38 coins in [t − 3,600,000, t], over all accounts, number at least
  the cut; never unknown. The position: dir = −σ, $1,000, x_in = t +
  120,000 ms, x_out = x_in + 86,400,000 ms; no stop, no target, M not
  doubled.
- **Placement** is the exploration's own `place`, generalized only in its
  entry test (D15): the code explored is the code examined, which the
  reproduction holds (P15).
- **[OPTION A, filled by the owner, decisions 2026-11-19 `710338f`]: the
  715 line decides** — W4's cut at **715** accounts (the kit's type-7
  quantile at 0.75 of W4 over B0's 148,154 E entries) — with **the safety
  net** (`0379582`): step 1, counts only, before any price, counts the 715
  line's positions on the deciding days, after option B's cut, not left out
  (P8); if they span fewer than 20 UTC days (of t) or 10 coins, **N** (W4's
  cut at 336, `polish/cuts.json`, the quantile 0.5) decides instead, at the
  same z. The net is read once, at look 1's step 1, and its line decides
  every later look (T12). The switch is printed (`step1.json`
  `deciding: { line, why }`) and held by step 2.
- **Beside, deciding nothing** (D52, D53c): N, and W4's cut at **1,391**
  (the quantile 0.9), labelled "seeded, decides nothing" (chosen after
  looking at E); when N decides, the 715 line is beside. The program
  recomputed the three cuts from E's features before the freeze, as the
  design's: 336 / 715 / 1,391 [placebo.json].

## P5. The deciding line

The deciding line's positions on the deciding days (P1), slices 0 to K − 1,
**K = 20** pooled (the owner, decisions 2026-11-19 `8c0407e`), each alike;
after option B's cut (P11). Beside it: every W4 line and B0 on all 147
slices; slice 0 alone; the discovery window; the positions cut by option B
(P13).

## P6. The price

H8 and H9 (WAVE-H) through WAVE-H's own book code, with FRESH's books and
FRESH's store (`exam/price.ts`; D19–D24):

- **The book first**: at a leg x, the coin's last snapshot at or before x
  in x's hour file of FRESH's raw store; in the first 10 s of an hour, when
  that file has none, the hour before's; live when ≥ x − 10,000 ms; usable
  as M7. A book file is read only when held to its line of FRESH's
  `books.jsonl`; a key the list names missing is "no book file"; a key on
  no line stops step 2 before anything is read (books needed, exit 5).
- **The walk** (M7): the entry walks $1,000 over the book's 20 levels on
  our side (asks to buy, bids to sell), Q its units; the exit walks Q; what
  the levels cannot fill is filled at the last level, **depth short**.
- **Else the tape** (H8's second rule): the store's takers on our side in
  [x, x + 60 s), no backstop's, in H8's order, walked as levels, with H8's
  reason (no book file, no snapshot, stale, not usable); depth short when
  they cannot fill the leg.
- **Else unpriced**: "no book and no trade at the entry", "… at the exit".
- **Fees and funding**: 4.5 bps a leg (H9); each settlement whose nominal
  hour lies in (x_in, x_out], rate × the minute price at the end of the
  minute before the hour (P7), a positive rate longs pay; an hour without a
  row charged nothing and counted; a settlement without a minute price
  leaves the position unpriced ("funding without a price"). The net by M9's
  formulas. Each position keeps WAVE-H's `Priced` and its legs' prints.
- **Which legs**: N's positions on the deciding days, not left out, are
  priced book first (T11): the 715 line's are among them, so the fetch
  does not depend on the safety net. The books fetched are those
  `look1\books-needed.txt` lists (step 1), by `tools/waveh-fetch.cjs --fresh
  --books`.

## P7. The minute price, BASE, the excess

- **The minute price** (plan 1.4; `tries/prices.ts` priceColumn): at the
  end of minute k, the mark of row k or of the latest of the 5 rows before
  with one; else the last taker's price but a backstop's in the 5 minutes
  before the minute's end; else none. No kit market object (its
  `marketFrom` refuses a panel past 2026-11-07).
- **The gross on marks**: dir × (the minute price at the end of x_out's
  minute ÷ x_in's − 1) × 10⁴.
- **BASE** (H10 with F11): for the coin and the 4-hour UTC block of x_in,
  the mean of (pc[j + 1,440] ÷ pc[j] − 1) × 10⁴ over the whole minutes j of
  each segment's [start, end − 24 h) whose minute lies in the block, both
  prices present, the two segments pooled; a cell with no minute has no
  BASE, and its positions no excess. BASE's minutes are the segments' whole
  minutes under either option of P11. **The excess** = the gross on marks −
  dir × BASE.
- **[OPTION D, Q4] HOLDS's second condition**: the mean excess over BASE
  above 0 (**default**, H10, the review's recommendation) | OWN's mean above
  0 (the gross on marks less dir × the other small coins' mean move over the
  same instants, at least 5 coins; `tries/beside.ts` ownOf). [The review: OWN
  shows 92% (E) and 97% (C) of N's gross is the other small coins' own
  move.]

## P8. Left out

- **A hole** (D29; `fresh.ts` holesOf): a stretch of 60 s or more, inside
  FRESH's fill files' span, with no record of any coin: from the union of
  every file's record times (its first, its last, its own holes), so a gap
  between files counts. The missing block numbers by day are printed beside.
- **Left out** (D30; leftOutOf): a position whose [t − 60 min, t] (both
  ends in), [x_in, x_in + 60 s) or [x_out, x_out + 60 s) meets a hole;
  counted by reason. No feature leaves one out: W4 is never unknown.
- A left-out position of the deciding line stays in its set (P11), never
  priced.

## P9. The statistic

M10: over the deciding line's priced positions (depth-short ones included),
m and SE by MARKET-1's two-way error (by the UTC day of t, the coin and the
pair, the max form); the days and coins of the priced positions.

## P10. z, from the placebo gate

- **The placebo** (F1; `exam --step placebo`, `exam/placebo.ts`; one code
  path, before the freeze): on the exploration's priced nets of slices
  0–19 — the 715 line from E alone (C is never read for it, T9), N on E ∪
  C — windows of 100 and of 182 consecutive UTC days at a random start,
  100,000 draws a window and flip, seed 20,261,118 (the kit's mulberry32);
  **two flips**: each B1 episode's sign, and each UTC day's sign; t* = the
  flipped mean ÷ its two-way SE; the kit's quantile (type 7). No mean of
  the unflipped nets is printed. N on all 147 slices with 10,000 episode
  draws equals `beside.json`'s placebo to the bit.
- **The percentiles of t*** [placebo.json `c25345f7…`, 2026-11-19
  23:27Z]:

  | Line | Flip | Window | 97.5th | 98.75th | 99.5th | 99.75th | Error |
  |---|---|---|---|---|---|---|---|
  | 715 | episode | 100 | 1.579 | 1.770 | 2.052 | 2.275 | 109.6 |
  | 715 | day | 100 | 2.133 | 2.360 | 2.613 | 2.847 | 109.6 |
  | 715 | episode | 182 | 1.441 | 1.574 | 1.723 | 1.830 | 81.0 |
  | 715 | day | 182 | 2.213 | 2.437 | 2.653 | 2.788 | 81.0 |
  | N, K 20 | episode | 100 | 1.713 | 1.925 | 2.207 | 2.391 | 77.0 |
  | N, K 20 | day | 100 | 1.915 | 2.133 | 2.409 | 2.600 | 77.0 |
  | N, K 20 | episode | 182 | 1.629 | 1.859 | 2.137 | 2.358 | 63.9 |
  | N, K 20 | day | 182 | 1.957 | 2.192 | 2.483 | 2.665 | 63.9 |

  The 715 line's 182-day windows are only 30 distinct starts inside E's 211
  entry days, so their error barely varies. [K = 10 beside, the review's
  check: episode 99.75th at 100 days 2.370 (the review 2.360–2.403), day
  2.539 (2.577–2.626).]
- **The rule for z** (D33 with T10; decisions 2026-11-19 `23823bb` Q2,
  `e217fa9`): one z for the exam whichever line decides — the larger of
  the textbook floor and both lines' larger flip's percentile at the look's
  window length: HOLDS's z at the 99.75th (two looks; floor 2.81) or the
  99.5th (one look; floor 2.58); LIKELY's z_L at the 98.75th (two looks;
  floor 2.24) or the 97.5th (one look; floor 1.96). **DOES NOT HOLD keeps
  HOLDS's z** (Q3).
- **The bars** (`design.ts` BARS, placebo.json's exact doubles; P17):
  - **two looks:** look 1 (the 100-day window) **z = 2.847**,
    **z_L = 2.360** (both the 715 line's day flip); look 2 (182 days)
    **z = 2.81** (the floor; the largest placebo 2.788), **z_L = 2.437**
    (the 715 line's day flip);
  - **one later look** (182 days): **z = 2.653**, **z_L = 2.213** (both the
    715 line's day flip).

## P11. The verdict

At a look (D36–D42; `exam/verdict.ts`), over the deciding line's positions
on the deciding days, the left-out ones included:

1. **WITHHELD** when (left out + unpriced + depth short, a leg short at the
   book or at the tape, each position once) ÷ the positions **> 10%**.
2. **TOO FEW TO TELL** when SE cannot be computed, or the priced positions
   span fewer than 20 UTC days (of t) or 10 coins.
3. **DOES NOT HOLD** when m + z·SE < **+50** (δ, the owner's line).
4. **HOLDS** when m − z·SE > 0, **and** the mean excess (P7, or OWN under
   option D) over the priced positions with one > 0, **and** the mean net
   of the priced positions with both legs at the book > 0 (F8; a sign, no
   band). With no excess, or no position at the book at both ends, HOLDS
   cannot hold.
5. **LIKELY** when the same three hold at z_L. Never read as HOLDS; it
   decides nothing HOLDS decides.
6. **NOT SETTLED** otherwise.

The first that holds is the reading. **The sentences, written in advance**
(X, Y, D, C filled from the result):
- WITHHELD: "Withheld: X% of the deciding positions were left out, unpriced
  or depth short, above the 10% limit; the data could not answer."
- TOO FEW: "Too few to tell: the priced positions span D UTC days and C
  coins; 20 and 10 are needed." (or "… no error could be computed.")
- DOES NOT HOLD: "Does not hold: even m + z·SE = X bps a position is below
  the owner's line of +50."
- HOLDS: "Holds: m − z·SE = X bps a position is above 0, with the excess
  over BASE and the positions priced at the book both above 0." (under
  option D: "… with the move net of the other small coins (OWN) …")
- LIKELY: "Likely, not proven: m − z_L·SE = X bps a position is above 0 at
  the 95% bar, and m − z·SE = Y is not above 0 at the 99% bar. Very probably
  real, not yet proven; it decides nothing that HOLDS decides."
- NOT SETTLED: "No mean result as large as X bps a position was seen."
  (X = m + z·SE, H12's.)
- Every verdict prints H12's line: "Holds and does not hold are verdicts on
  this test, never instructions to trade."

**[OPTION E] The days without books** (decisions 2026-11-19 `e217fa9`,
Q1): **cut (B, the recommended default)** — a deciding position with x_in
or x_out on a day of NO_BOOK_DAYS (P2) is cut from the deciding days and
printed apart, "not independent", in step 1 (the safety net's count) and
step 2 alike; a day the book fetch later finds without books is not cut,
its legs going to the tape; it costs about 9 of the 100 entry days | kept
(A) — those legs go to the tape. The projection of WITHHELD by option is
in P16.

## P12. The looks, F14

- **[OPTION C] two looks (the default, plan 3.6)**: look 1 on P1's deciding
  days at look 1's bars, as soon as the rules are reviewed and frozen; look
  2 on look 2's days (P1) at look 2's bars, about 2027-02-08 | **one later
  look**: one look on look 2's days at the one look's bars, about
  2027-02-08; FRESH stays sealed until then.
- **F14 as MARKET-1's M11** (decisions 2026-11-19 `e217fa9`, Q2): only
  **HOLDS or DOES NOT HOLD** at look 1 ends the exam; WITHHELD, TOO FEW TO
  TELL, LIKELY and NOT SETTLED let look 2 run, every reading printed by
  name; at the last look its reading stands, LIKELY included (Q4: LIKELY
  counts as NOT SETTLED for F14). A later look prints beside the verdict.
  `verdict.ts` examVerdict.
- The safety net is read once, at look 1's step 1 (P4).

## P13. Lines beside, deciding nothing

In `look1\report.json`, written after `result.json` (D46, D52;
`exam/lines.ts`), on the net unless said:
- the deciding line's lines as the exploration printed them beside: each
  month and side; without the two best days, and their share of the gain;
  each day and each coin left out (the lowest and highest m); MARKET-1's
  tail (B11); BTC's and ETH's moves at the entries; the event-level mean
  (one position per coin-episode of FRESH's counted fills); OWN; each
  segment; each price source (both legs at the book, a leg at the tape);
  each depth (a leg short, none); the net per hour held (m ÷ 24);
- the $1,000, $10,000 and $50,000 walks at the deciding line's entry books:
  the cost against the mid and the extra over $1,000's;
- slice 0 alone; the 715 line, N and the 1,391 cut on slices 0–19 of the
  deciding days, book first; at the tape: the deciding line (the same
  positions), each W4 line and B0 on all 147 slices of the deciding days,
  B0 on slices 0–19, the discovery window and the days cut (N, slices 0–19),
  "not independent"; each with n, m ± SE (M10's two-way), the days, the
  coins and the two best days' share of the gain;
- placebo.json's percentiles of both flips and its bars, copied;
- the base-tier fee check by month (H14: the highest taker fee rate a
  month, an alarm above 4.5 bps); the book files read.

## P14. Prints

- **Step 1's** (`look1\step1.json`; D48; none an outcome): the records by
  day and the block numbers missing; the holes; the `asset_ctxs` rows of the
  small coins by day and the days read as absent; the minutes priced by the
  trade fallback, and without a price, by coin and day; the funding rows by
  coin and window; each line's positions by where they stand (segment 1,
  segment 2, cut, discovery); on the deciding days, the left out by reason
  and the positions whose funding has a settlement without a minute price;
  the books needed; F7's list with its shares; the deciding line and why;
  the positions' SHA-256.
- **Step 2's**: `result.json` (the identity, the verdict and its numbers,
  the bars and options, the exam's reading so far, the positions' SHA-256);
  `positions.jsonl.gz` (N's positions on the deciding days, the 715 and
  1,391 lines marked, each priced with its legs, or left out); `report.json`
  (P13).

## P15. Steps and gates

Each `node dist\polish.js exam --step <name>`, from the repository's build,
by hand, one at a time, at idle priority (the program sets it), the
launcher's 20 GB worker heap (F3), no heap flag; no file is started in
02:30–06:00Z or 10:25–11:15Z (`pace`). Settings, no defaults:
`ANALYZER_ROOT` (the ten months' folder: its trusted store, `gates\`,
`explore\`; read only), `EXAM_ROOT` (the exam's own folder: `ANALYZER\FRESH`
at look 1), for the reproduction `WAVEH_STORE` and `WAVEH_ROOT` (read only),
for steps 1 and 2 `FRESH_STORE` (`…\FRESH\store`, read only). Exit codes: 0
done; 1 a crash; 2 bad settings or a heap flag; 4 WAVE-H's freeze, or for
steps 1–2 the exam's, does not verify; 5 not ready (sealed, a file missing
or differing, `repro.json` not passed, books needed, already run); 6 a check
failed (the reproduction, FRESH's integrity, a held number).

1. **`placebo`** (before the freeze): P10, into `<EXAM_ROOT>\placebo.json`;
   every input held to the design's SHA-256.
2. **`reproduce`** (before FRESH opens; again at look 1 by the frozen
   program, into `ANALYZER\FRESH`): (a) the frozen extraction of the ten
   months into `<EXAM_ROOT>\repro\`, every file the explored manifest lists
   equal in bytes and SHA-256; (b) N placed and priced at the tape on E and
   on C as the exploration did, equal to `choice.json` and `c.json`
   exactly, and the 715 line on E equal to placebo.json's line (its counts
   exactly, m and SE to 1e-9 of their size); (c) the book-first price on
   WAVE-H's 1,299 positions equal to the look's lines (each bps field
   within 1e-9). `repro.json` names this program; exit 6 when a part fails.
3. **`1`** (the exam's gate open; `repro.json` passed by this very
   program): FRESH's extraction (P2), its integrity (exit 6 on a failure),
   the lines placed, the safety net read, the counts (P14), the books
   needed; `look1\step1.json` written whole; then exit 5, books needed. A
   data defect seen here: H0's route, then `step1.json` is removed by hand
   in the same decisions entry and step 1 runs again.
4. **The books**: `node tools\waveh-fetch.cjs --fresh --books
   <EXAM_ROOT>\look1\books-needed.txt`, under the download's guards.
5. **`2`**: a second step 2 refuses (already run); every needed book file
   answered by FRESH's `books.jsonl` (a file or missing) before any store
   file is read, else exit 5; FRESH's store step 1's and the positions
   recomputed and held to `step1.json`'s SHA-256, else exit 5; every leg
   priced (P6); everything computed first; then `look1\result.json`, written
   whole before anything about an outcome is logged, then
   `positions.jsonl.gz`, then `report.json`. **H15's recovery**: after a
   failure between the writes, `result.json` is moved aside
   (`result.first.json`) in a decisions entry and step 2 runs again; the
   same `positionsSha256`, verdict and numbers, else a code defect.
6. **Then** the report and a Final review with independent code.

## P16. The owner's options and the projections

Each option's numbers are prints from before the freeze, from E ∪ C (N) or
E alone (the 715 line, labelled seeded and optimistic: chosen after looking
at E); none decides anything.

- **[OPTION A] the recipe — filled**: the 715 line decides, with N by the
  safety net (P4). [The 715 line on E, slices 0–19: 5,067 positions, 4,310
  priced, m 203.4, SE 79.1, 51 days, 33 coins; m_proj = 124.3. N: m_proj =
  C's 211.3 less one error 122.1 = 89.1.]
- **[OPTION C] the looks**: two looks (default) | one later look. P(HOLDS)
  = Φ((m_proj − max(z·SE, 50 − z·SE)) ÷ SE) and P(LIKELY or HOLDS) =
  Φ((m_proj − max(z_L·SE, 50 − z·SE)) ÷ SE), SE the median window error at
  the look's length, each look alone [placebo.json `power`]:

  | Option | Look | SE (715 / N) | 715: P(HOLDS) | 715: P(LIKELY or HOLDS) | N: P(HOLDS) | N: P(LIKELY or HOLDS) |
  |---|---|---|---|---|---|---|
  | two looks | look 1, 100 d | 109.6 / 77.0 | 4.3% | 11.0% | 4.6% | 11.5% |
  | two looks | look 2, 182 d | 81.0 / 63.9 | 10.1% | 18.3% | 7.9% | 14.9% |
  | one later look | 182 d | 81.0 / 63.9 | 13.2% | 24.9% | 10.4% | 20.7% |

  TOO FEW and the safety net on E's windows: 0 of the 715 line's 112
  (100-day) and 30 (182-day) windows; 0 of N's 260 and 178 on E ∪ C.
- **[OPTION E] WITHHELD's days without books**: cut (B, default) | kept (A).
  The projected WITHHELD share of the 715 line on FRESH [withheld.json
  `8e8249d7…`, 2026-11-19 23:43Z; E alone, E's rates, each 100-day window of
  E laid onto the deciding days, 112 windows; the model reproduces the
  look's own share on TEST]:

  | Option | Mean (median) | P(> 10%) | By part (mean) |
  |---|---|---|---|
  | A, kept | 5.14% (5.28%) | 11.6% | tape short 1.89, no trade 0.98, the ten months' funding gaps 2.41, F7's 07-08 0.07, left out 0, book short 0 |
  | A, and 11-13 → 15 without books | 6.40% (6.26%) | 19.6% | |
  | **B, cut** | **2.16% (0.00%)** | **1.8%** | the funding gaps alone; the safety net fires in 7.1% of windows |
  | B, 11-13 → 15 cut too | 2.34% (0.00%) | 4.5% | the net fires in 8.9% |

  [Rejected: only book-short legs counted (6.3%); a threshold of 15% or
  20% (5.4%, 0.0%). N beside on E ∪ C: A 5.36%, P 11.2%; B 2.52%, P 0.0%.]
- **[OPTION D, Q4] HOLDS's second condition**: the excess over BASE
  (default) | OWN (P7).

## P17. The design's numbers

`design.ts` holds each number below; a test reads this table and holds it
to the code (`test/polish-rules.test.ts`).

| Name | Value |
|---|---|
| M | 147 |
| K | 20 |
| W4 deciding | 715 |
| W4 N | 336 |
| W4 beside | 1391 |
| W4 quantiles | 0.5 0.75 0.9 |
| B0's E entries | 148154 |
| safety net days | 20 |
| safety net coins | 10 |
| segment 1 | 2026-05-30T00:00:00.000Z 2026-08-31T00:00:00.000Z |
| segment 2 | 2026-11-07T00:00:00.000Z 2026-11-16T00:00:00.000Z |
| discovery | 2026-08-31T00:00:00.000Z 2026-11-07T00:00:00.000Z |
| look 2 end | 2027-02-06T00:00:00.000Z |
| delta | 50 |
| WITHHELD share | 0.1 |
| TOO FEW days | 20 |
| TOO FEW coins | 10 |
| placebo seed | 20261118 |
| placebo draws | 100000 |
| placebo windows | 100 182 |
| floors, two looks | 2.81 2.24 |
| floors, one look | 2.58 1.96 |
| two looks, look 1 | 100 2.8466835996608553 2.3599581301310213 |
| two looks, look 2 | 182 2.81 2.4374684250380376 |
| one later look | 182 2.6532605728910306 2.212592737897925 |
| placebo.json | c25345f7a5c087c01d82114bf70cd54f7425ae66a25b43657c1379a076ac9575 |
| options | twoLooks cut BASE |
| no-book days | 2026-07-08 2026-07-12 2026-07-13 2026-07-14 2026-07-15 2026-07-16 2026-07-17 |
| thin days | 59 |
