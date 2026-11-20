# THE PLAN — POLISH-RULES's plan for the exam (written 2026-11-19 21:55Z, amended 21:58Z; ruled by decisions 2026-11-19, "POLISH-RULES's plan, its eight questions ruled", `23823bb`)
Saved unchanged on 2026-11-20 by POLISH-FIX, as it stands, from `E:\coding\Claude\supervisor\polymarket-follow\workers\POLISH-RULES\progress.md`, "## THE PLAN" to just before "## STATE AT 2026-11-19T21:58Z" (decisions 2026-11-20, the exam's fresh code review, Q4; the review's L5). The exam's rules (`apps/poller/polish/rules.md`) and code cite its D-, T- and Q-numbers.

## THE PLAN

### 0. The frame

- **Mine (plan section 6, step 9, up to "rules ready"):**
  - `apps/poller/polish/rules.md`, final but the owner's marked options;
  - the exam's commands in `dist/polish.js`: `exam --step placebo |
    reproduce | 1 | 2` (plan 3.7's order);
  - the reproduction run and passed on the 10 months;
  - the seal's opening for FRESH, written and tested, **closed** (no freeze
    exists);
  - a draft freeze list written by a tool;
  - z and LIKELY's z from the placebo on **K = 20** (K = 10 beside only for
    the review's check); N's WITHHELD projection by part;
  - the two seeded side prints, N at W4 ≥ 715 and ≥ 1,391 (decisions
    2026-11-19, `a762d3f`), frozen with the rules, deciding nothing; and the
    715 cut as a marked option (default no) with its numbers from E alone.
- **Not mine:** fresh rules and code reviews, fixes, a fix-check, the owner's
  talk, the freeze, look 1, FRESH-2 and look 2's code.
- **Precedence:** decisions, newest first (K = 20; the Final review verified;
  the owner's 99% and LIKELY; the five steps ran; F1–F19), then plan 3–4,
  then `waveh/rules.md`, then the report and its review.

### 1. The rules' outline: `apps/poller/polish/rules.md`, P0–P16

Modelled on WAVE-H's H0–H15; where a rule names WAVE-H or MARKET-1 it means
it word for word and the code imports their frozen code. Marked options are
one line each, `[OPTION X]`, filled in at the owner's talk, every number for
each option printed beside it (P16).

| Rule | What it fixes | Pins (section 2) |
|---|---|---|
| P0 Identity, what is frozen | one test, one deciding line; decides nothing for MARKET-1, WAVE-H or the paper experiment, never combined with them (F14); the freeze list's scope; the gate (list + tag); the seal; H0's defect route (`polish-freeze-2`); nothing changes after look 1 | section 3's scope, Q1, D51 |
| P1 Instants and ranges | DATA END, FRESH_END, FRESH's files and grid, the deciding days of look 1, the discovery window, look 2's days | D1–D6 |
| P2 FRESH's data and store | held to `polish/fresh.sha256`; the frozen extraction; the store's integrity; the `asset_ctxs` fallback; F7's list | D7–D12 |
| P3 Coins, counted fills | H3, H4 by reference, on FRESH's records before FRESH_END | D13 |
| P4 The recipe | N = B0 + W4, exactly as explored `[OPTION A: recipe; default N; the 715 cut, default no]` | D14–D18, D52–D53 |
| P5 The deciding line | slices 0–19 pooled (K = 20, the owner 2026-11-19); all 147 printed beside | D16–D17 |
| P6 The price | H8 at FRESH's books, else the store's tape, else unpriced; H9 | D19–D24 |
| P7 Minute price, BASE, excess | plan 1.4, F11 on the deciding days `[OPTION D: Q4's market-adjusted excess, default no change]` | D25–D28 |
| P8 Left out | 3.4 (4)–(5): holes in the fills | D29–D30 |
| P9 The statistic | M10 | D31 |
| P10 z | the placebo gate on slices 0–19, its numbers with their sources; HOLDS's and LIKELY's z per look `[OPTION C: looks]` | D32–D35 |
| P11 The verdict | WITHHELD, TOO FEW TO TELL, DOES NOT HOLD, HOLDS, LIKELY, NOT SETTLED; each sentence `[OPTION E: WITHHELD, only if the projection asks]` | D36–D42 |
| P12 The looks, F14 | the first look not NOT SETTLED decides; LIKELY's place | D43–D45 |
| P13 Lines beside | deciding nothing; the two seeded side prints (W4 ≥ 715, ≥ 1,391) | D46, D52 |
| P14 Prints | step 1's counts (3.4 (3)) and step 2's (H14's) | D46, D48 |
| P15 Steps and gates | the reproduction, step 1, the books, step 2, then; the runs | D47–D50 |
| P16 The owner's options | one line each with its numbers: the recipe (N; the 715 cut; B0), the looks, Q4, WITHHELD (if needed); the projections P(HOLDS), P(LIKELY), P(TOO FEW), the WITHHELD share by part | D35, D53, section 6 |

### 2. Every pinned definition

**Instants and ranges (P1)**
- **D1.** DATA END = 2026-05-29T01:00:00Z (H1). **FRESH_END =
  2026-11-16T00:00:00Z**: no record or row at or after it is used.
- **D2. FRESH's range**, the download's (`tools/waveh-fetch.cjs` FRESH):
  - fill files `node_fills_by_block/hourly/<YYYYMMDD>/<h>.lz4`, hours
    [2026-05-29 02h, FRESH_END): **4,102**;
  - `asset_ctxs/<YYYYMMDD>.csv.lz4`, days [2026-05-29, FRESH_END) but
    2026-07-08 (the archive has none): **170**;
  - the 38 coins' `fundingHistory` windows on the 20-day grid from DATA END,
    the last cut at FRESH_END: 9 a coin, **342**.

  Built by polish's own key builder (WAVE-H's frozen `fillKeys` stops at DATA
  END + 1 h), held equal to the download tool's plan by a test.
- **D3. FRESH's minute grid:** [2026-05-29T00:00Z, FRESH_END), 246,240
  minutes; months 2026-05 … 2026-11.
- **D4. Look 1's deciding days** (plan 3.1, F12): segment 1, positions with
  t ≥ 2026-05-30T00:00Z and x_out < 2026-08-31T00:00Z (entries on 92 days);
  segment 2, t ≥ 2026-11-07T00:00Z and x_out < FRESH_END (8 days).
  - **The discovery window:** every other position with t ≥ 2026-05-30 and
    x_out < FRESH_END, printed apart, "not independent".
  - Entries of 2026-05-29 decide nothing; they still block (M5).
  - Not `inPart`'s 50-hour stop of E and C: that would cut about a day of
    entries per segment.
- **D5. Look 2** (two looks only): segment 1 and segment 2′, t ≥
  2026-11-07T00:00Z and x_out < 2027-02-06T00:00Z, on FRESH and FRESH-2
  (the archive's fills 2026-11-16 00h → 2027-02-06 00h, downloaded after
  2027-02-07's upload); about 182 days, about 2027-02-08. **One later look:**
  the same days, once, at the same date.
- **D6.** Times as H1: "the 60 minutes up to t" is [t − 3,600,000, t], both
  ends in; every other window [a, b); a UTC day [00:00Z, +24 h).

**FRESH's data and store (P2)**
- **D7.** FRESH's files are read only when held to `polish/fresh.sha256` (D2's
  4,614 keys and SHA-256s, from FRESH's `manifest.jsonl`, metadata only); every
  key the range needs is in the list before any is read, else exit 5 (H2).
- **D8.** FRESH is extracted by the frozen extraction (`extract`'s pass,
  writers, contexts, funding and merge) with D2's range, into
  `<EXAM_ROOT>\store` (the analyzer's FRESH folder at look 1).
- **D9. FRESH's store's integrity, before any position:**
  - G0's checks: every file whole, every partition present, made from
    `fresh.sha256` by this very code, no record refused or misread, every row
    conserved;
  - G5's pairing: a straddle only between files next in order; a record left
    alone only in FRESH's first file (2026-05-29 02h) or its last (2026-11-15
    23h), each listed; any other unpaired record `[Q7]`.

  A failure stops step 1 (exit 6), every record listed.
- **D10.** A fill file missing, differing or failing H2's day rule stops step 1
  (exit 5): H0's route.
- **D11.** `[Q6]` An `asset_ctxs` day of FRESH whose rows fail WAVE-H's 1% rule,
  or whose header lacks a column, is read as **absent** (no context that day),
  listed and counted in F7's list; never a stop. The 10 months keep WAVE-H's
  stop, so their store stays byte for byte.
- **D12. F7's list** (written from FRESH's manifest, metadata only, `[T3]`):
  - 2026-07-08: no `asset_ctxs` file and no books;
  - the thin `asset_ctxs` files: bytes under 50% of the median of WAVE-H's 370
    day files (a fixed reference; FRESH's own neighbours are thin too after
    2026-09-22);
  - the archive's book holes: 2026-07-08 and 07-12 → 17 by the listing of
    2026-11-13, which reached 2026-11-12; any day the book fetch finds with no
    book file;
  - at step 1, the share of the deciding line's positions each touches.

**Counted fills and the recipe (P3–P5)**
- **D13.** FRESH's counted fills: H4 on FRESH's liq table, every record of
  FRESH's files with time before FRESH_END, in M4's order (`counted.ts` and
  `forced.ts` bounded by the store's own end; the 10 months' bounds
  unchanged).
- **D14. The recipe N** (`c.json` `rule`; the try log 3.2 and W4):
  - M = 147 (`waveh/sizing.json`); slice(a) = a mod 147;
  - in each slice, MARKET-1's `waveEntries` over the slice's FRESH counted
    fills from FRESH's first file (an earlier entry blocks);
  - **W4:** kept when the different accounts with a counted fill of σ in the
    38 coins in [t − 3,600,000, t], over all accounts (`accountsAt` on all
    counted fills), number **at least 336** (`polish/cuts.json`
    `cuts.W4.value`); never unknown;
  - the position: dir = −σ, $1,000, x_in = t + 120,000 ms, x_out = x_in +
    86,400,000 ms; no stop, no target, M not doubled.
- **D15.** Placement is the exploration's own `place`, generalized only in its
  entry test (E and C: the 50-hour stop as before; FRESH: D4): the code
  explored is the code examined (plan 4.6), held by the reproduction (D47 b).
- **D16. The deciding line:** N's positions of slices 0–19 on the deciding
  days, each alike.
- **D17. Beside, deciding nothing:** N's 147 slices; B0 (no W4) on slices 0–19
  and on 147; slice 0 alone; the discovery window; the two side prints (D52).
- **D18. `[OPTION A]` the recipe:** N (**default**) | N with W4 ≥ 715 deciding
  instead (**default no**; D53) | B0, the plan's fallback (the same code
  without W4) | any other override: a new build item; it would freeze its
  features' instants and cuts, and a 7- or 30-day look-back would read the 10
  months' store for FRESH's first month.

**The price (P6)**
- **D19. The book at a leg x** (H8, through WAVE-H's own code: `bookHours`,
  `lastAtOrBefore`, `bookAt`): the coin's last snapshot ≤ x in x's hour file
  of FRESH's raw store; in the first 10 s of an hour, when that file has none,
  the hour before's; live when ≥ x − 10,000 ms; usable as M7.
  - A book file is read only when held to its line in FRESH's `books.jsonl`
    (`readLz4`).
  - A needed key on no line stops step 2 (exit 5, books needed).
  - A key listed missing is "no book file".
- **D20. The walk** (M7): the entry walks $1,000 over the book's 20 levels on
  our side (asks to buy, bids to sell), Q its units; the exit walks Q; what
  the levels cannot fill is filled at the last level, **depth short**.
- **D21. Else the tape** (H8's second rule): the store's takers on our side in
  [x, x + 60 s), no backstop's, in H8's order, walked as levels; depth short
  when they cannot fill the leg; tape-priced with H8's reason (no book file,
  no snapshot, stale, not usable).
- **D22. Else unpriced:** "no book and no trade at the entry", "… at the exit".
- **D23. Fees and funding:** 4.5 bps a leg (H9); each settlement whose nominal
  hour lies in (x_in, x_out], rate × the minute price at the end of the minute
  before the hour (D25), a positive rate longs pay; an hour without a row
  charged nothing and counted; a settlement without a minute price leaves the
  position unpriced ("funding without a price"). The net by M9's formulas.
- **D24. Kept per position** (H9): each leg's source, why, price, deepest
  level, short, the snapshot's time and book file or the tape's `tid`s; the
  entry cost at the book; the gross on marks; the excess.

**The minute price, BASE, the excess (P7)**
- **D25. The minute price** (plan 1.4, `priceColumn`): at the end of minute k,
  the mark of row k (H10's row in (m, m + 1 min]) or of the latest of the 5
  rows before with one; else the last taker's price but a backstop's in the 5
  minutes before the minute's end; else none. **No kit market object** (its
  `marketFrom` refuses a panel past 2026-11-07).
- **D26. The gross on marks:** dir × (the minute price at the end of x_out's
  minute ÷ x_in's − 1) × 10⁴.
- **D27. BASE** (H10 with F11; plan 3.3, "measured on the deciding days'
  minute prices"): for coin i and the 4-hour UTC block b of x_in, the mean of
  (pc[j + 1,440] ÷ pc[j] − 1) × 10⁴ over the whole minutes j of the deciding
  days, j in [segment start, segment end − 24 h) for each segment, whose
  minute lies in b, both prices present. A cell with no minute has no BASE:
  its positions have no excess, counted. **The excess** = the gross on marks
  − dir × BASE.
- **D28. `[OPTION D, Q4]`** HOLDS's second condition: the mean excess over
  BASE > 0 (**default**, H10, the review's recommendation) | OWN's mean > 0
  (the gross on marks less dir × the other small coins' mean move over the
  same instants, at least 5 coins).

**Left out (P8)**
- **D29. A hole:** a stretch of 60 s or more, inside FRESH's fill files' span,
  with no record of any coin: the union of every file's record times
  (`files.jsonl` `times`: first, max and its inner holes), so a gap between
  files counts. This reads plan 3.4 (4)'s "missing block numbers of 60 s or
  more" by time, since every record comes from a block; the missing block
  numbers by day are printed beside, from the runs.
- **D30. Left out:** a deciding position whose [t − 60 min, t], [x_in, x_in +
  60 s) or [x_out, x_out + 60 s) meets a hole; counted by reason. A feature
  unknown: never, for W4 (B0 has none).

**The statistic and z (P9, P10)**
- **D31. The statistic** (M10): over the deciding line's priced positions
  (depth-short ones included), m; SE = MARKET-1's `twoWay` (by the UTC day of
  t, the coin and the pair, the max form); the days and coins of the priced
  positions.
- **D32. The placebo gate** (F1), before the freeze, by one code path
  (`exam --step placebo`):
  - on E ∪ C, N's priced nets of slices 0–19 from the exploration's
    `choice-positions.jsonl.gz` (E) and `c-positions.jsonl.gz` (C), each held
    to its SHA-256; no re-base (b = 0);
  - windows of 100 and of 182 consecutive UTC days at a random start in
    [2025-06-01, 2026-05-26T23:00Z), as the exploration's;
  - **100,000 draws** a window length and a flip; seed 20,261,118 (the kit's
    `mulberry32`);
  - **two flips:** each B1 episode's sign (F1's, the exploration's) and each
    UTC day's sign (the review's);
  - t* = the flipped mean ÷ its two-way SE;
  - printed: P(t* > z) for each z of D33, the sd, the 97.5th, 98.75th, 99.5th
    and 99.75th percentiles (the kit's quantile, type 7), the window errors
    (median, quartiles), P(TOO FEW) (a window's positions under 20 days or 10
    coins);
  - **no mean of the unflipped nets is printed** (C stays clean);
  - K = 10 beside (the review's numbers are its check); K = 147 with 10,000
    draws and episode flips must equal `beside.json`'s placebo to the bit (the
    generalization changes nothing).
- **D33. z** (F1; decisions 2026-11-19): for each look, the larger of the
  textbook value and the larger of the two flips' percentile, at the window
  of the look's length `[Q2]`:
  - **two looks:** HOLDS z = max(2.81, 99.75th); LIKELY z_L = max(2.24,
    98.75th); look 1 at the 100-day window, look 2 at the 182-day window;
  - **one later look:** HOLDS max(2.58, 99.5th), LIKELY max(1.96, 97.5th), at
    182 days.

  Written in rules.md as numbers with their source (placebo.json's SHA-256
  and fields).
- **D34.** DOES NOT HOLD uses HOLDS's z `[Q3]`.
- **D35. The projection** (plan 3.5, F13), for each option and look:
  - P(HOLDS) = Φ((m_proj − max(z·SE, 50 − z·SE)) ÷ SE);
  - P(LIKELY or HOLDS) = Φ((m_proj − max(z_L·SE, 50 − z·SE)) ÷ SE);
  - m_proj = C's estimate less one error, **+89.13** (all slices,
    `beside.json`), the pooled +67.68 beside;
  - SE = the slices 0–19 line's median window error at the look's length
    (D32), a typical block's beside where the placebo gives it.

  No new mean of C is computed.

**The verdict (P11)**
- **D36. The set:** the deciding line's positions (D16), the left-out ones
  included.
- **D37. WITHHELD** when (left out + unpriced + depth short, a leg short at
  the book or at the tape) ÷ the set's positions **> 10%** (plan 3.3, H12)
  `[OPTION E, only if the projection asks: section 6]`.
- **D38. TOO FEW TO TELL:** SE cannot be computed, or the priced positions span
  fewer than 20 UTC days (of t) or 10 coins.
- **D39. DOES NOT HOLD:** m + z·SE < **+50** (δ, the owner's line).
- **D40. HOLDS:** m − z·SE > 0, **and** the mean excess (D27/D28) over the
  priced positions with one > 0, **and** the mean net of the priced positions
  with both legs at the book > 0 (F8; a sign, no band). With no excess, or no
  position at the book at both ends, HOLDS cannot hold.
- **D41. LIKELY:** the same three conditions with z_L. Never read as HOLDS;
  decides nothing HOLDS decides.
- **D42. NOT SETTLED** otherwise. **The order:** WITHHELD, TOO FEW, DOES NOT
  HOLD, HOLDS, LIKELY, NOT SETTLED; the first that holds. **The sentences,
  written in advance** (X, Y, D, C filled from the result):
  - WITHHELD: "Withheld: X% of the deciding positions were left out, unpriced
    or depth short, above the 10% limit; the data could not answer."
  - TOO FEW: "Too few to tell: the priced positions span D UTC days and C
    coins; 20 and 10 are needed." (or "no error could be computed").
  - DOES NOT HOLD: "Does not hold: even m + z·SE = X bps a position is below
    the owner's line of +50."
  - HOLDS: "Holds: m − z·SE = X bps a position is above 0, with the excess
    over BASE and the positions priced at the book both above 0."
  - LIKELY: "Likely, not proven: m − z_L·SE = X is above 0 at the 95% bar, and
    m − z·SE = Y is not above 0 at the 99% bar. Very probably real, not yet
    proven; it decides nothing that HOLDS decides."
  - NOT SETTLED: "No mean result as large as X bps a position was seen." (X =
    m + z·SE, H12's.)
  - Every verdict also prints H12's line: "Holds and does not hold are
    verdicts on this test, never instructions to trade."

**The looks (P12)**
- **D43. `[OPTION C]` two looks:** look 1 on D4's days at its z; look 2 on D5's
  at its z. **F14:** the first look that is not NOT SETTLED is the exam's
  verdict; a later look prints beside it. **LIKELY counts as NOT SETTLED for
  F14** `[Q4]`: after a LIKELY at look 1, look 2 still runs; LIKELY is printed
  by name at each look; at the last look it stands as the exam's reading.
  Never combined with MARKET-1's verdicts.
- **D44. `[OPTION C]` one later look:** one look on D5's days at its z, about
  2027-02-08; FRESH stays sealed until then.
- **D45.** Look 2's code is a later build `[T2]`.

**Lines beside, prints (P13, P14)**
- **D46. Beside the verdict, deciding nothing** (on the net unless said):
  - the deciding line's mean by price source (both legs at the book; a leg at
    the tape) and by depth short (the review's finding 4);
  - OWN; the two best days' share of the gain and the mean without them; the
    event-level mean (the earliest priced position of each B1 episode of
    FRESH's pooled counted fills);
  - each segment; each month; each side; a day and a coin left out (lowest,
    highest); the tail (B11); BTC's and ETH's moves at the entries;
  - the net per hour held (m ÷ 24; the answers of 2026-11-17, 4);
  - the deciding line at the tape (every leg, the same positions); slice 0;
    N's 147 slices at the tape; B0 on slices 0–19 and on 147 at the tape; the
    discovery window (N, slices 0–19, at the tape), "not independent";
  - the $10,000 and $50,000 walks at the deciding line's entry books;
  - both flips' placebo percentiles (copied from placebo.json);
  - the two seeded side prints at W4 ≥ 715 and ≥ 1,391 (D52);
  - the base-tier fee check by month (H14, from the scan's `topTaker`).

**Steps and runs (P14, P15)**
- **D47. The steps** (plan 3.7, H15 adapted), each `node dist\polish.js exam
  --step <name>`:
  - **`placebo`** (before the freeze): D32; writes `<EXAM_ROOT>\placebo.json`.
  - **`reproduce`** (before FRESH opens; again at look 1 by the frozen code):
    - (a) the extraction of the 10 months into `<EXAM_ROOT>\repro\`; every
      file the explored manifest lists (each partition's columns,
      `dict\users.bin`, `dict\names.json`, `files.jsonl`) equal in bytes and
      SHA-256; the two manifests differ (code, written, seconds, peaks) and
      are not compared;
    - (b) N placed and priced at the tape on E and on C as the exploration
      did: positions, priced, unpriced by reason, m, SE, days and coins equal
      to `choice.json` `N` and `c.json` `evaluations[0]` exactly (as JSON
      numbers);
    - (c) the exam's book-first price on WAVE-H's 1,299 slice-0 TEST positions
      (placed from the trusted store; books from WAVE-H's raw store, its
      `books.jsonl` held to `gates.json`'s SHA-256): every line equal to the
      look's `positions.jsonl.gz` (each bps field within 1e-9 bps, the excess
      with H10's TEST BASE; every other field equal), 1,289 priced;
    - writes `<EXAM_ROOT>\repro.json`; exit 6 when any part fails.
  - **`1`** (the exam's gate open; `repro.json` passed by this program):
    FRESH's extraction (D8), its integrity (D9), D48's counts, the positions
    with no price, the left-out counts, `look1\books-needed.txt`; writes
    `look1\step1.json` (with the positions' SHA-256); exit 5, "books needed".
    A data defect seen here: H0's route, then `step1.json` is removed by hand
    in the same decisions entry, and step 1 runs again.
  - **the books:** `node tools\waveh-fetch.cjs --fresh --books
    <EXAM_ROOT>\look1\books-needed.txt`, under the download's guards.
  - **`2`:**
    - before any store file is read, every needed key answered by FRESH's
      `books.jsonl` (a file or missing), else exit 5;
    - the positions recomputed and held to `step1.json`'s SHA-256, else exit
      5;
    - every leg priced; the statistic and the verdict to
      `look1\result.json` first, then `positions.jsonl.gz`, then
      `report.json`, each whole (WAVE-H's `writeWhole`);
    - nothing about an outcome logged before `result.json` exists;
    - a second step 2 refuses (exit 5, already run);
    - H15's recovery: after a failure between the writes, `result.json` is
      moved aside (`result.first.json`) in a decisions entry and step 2 runs
      again; the same `positionsSha256`, verdict and numbers, else a code
      defect.
  - **then:** the report and a Final review with independent code.
- **D48. Step 1's prints** (3.4 (3)): the `asset_ctxs` rows of the 38 coins by
  day (read, failing, off the minute, twice, late), the absent days (D11),
  the minutes priced by the trade fallback by coin and day, the funding rows
  by coin and window, the records by day, the holes (D29) and the missing
  block numbers by day, the positions by group and segment, the left-out
  counts by reason, the books needed, F7's list with its shares.
- **D49. Runs:** from the repository's build, by hand, one at a time, at idle
  priority (the program sets it), the launcher's 20 GB worker heap (F3), no
  heap flag; no file started in 02:30–06:00Z or 10:25–11:15Z (`pace`).
- **D50. Settings, no defaults:** `ANALYZER_ROOT` (the 10 months' folder: its
  trusted store, `gates\`, `explore\`; read only), `WAVEH_STORE`, `WAVEH_ROOT`
  (read only), `EXAM_ROOT` (the exam's own folder: `ANALYZER\POLISH-RULES`
  for my runs, `ANALYZER\FRESH` at look 1 `[T7]`), `FRESH_STORE` (steps 1–2).
  **Exit codes:** 0 done; 1 a crash; 2 bad settings or a heap flag; 4 a
  freeze does not verify (WAVE-H's; the exam's, for steps 1–2); 5 not ready
  (sealed, a file missing or differing, `repro.json` not passed, books
  needed, already run); 6 a check failed (the reproduction, FRESH's
  integrity).
- **D51. The identity** every exam output names first: the program's
  fingerprint; WAVE-H's freeze; the exam's freeze and its tag (steps 1–2); the
  explored store's manifest and `gates.json` SHA-256s; the exploration's files
  read (`choice.json`, `c.json`, `beside.json`, `cuts.json` and the two
  positions files) by SHA-256; for FRESH, `fresh.sha256`, FRESH's store
  manifest, `books.jsonl`, `step1.json` and `repro.json`.

**The two stricter cuts (decisions 2026-11-19, `a762d3f`)**
- **D52. The side prints**, labelled "seeded, decides nothing":
  - N with W4's cut at **715** and at **1,391** accounts: the kit's quantile
    (type 7) at 0.75 and 0.9 of W4's feature over B0's 148,154 E entries;
  - **recomputed by the program** from `e-positions.jsonl.gz`'s B0 lines (the
    features only, no outcome) and held to `design.ts`'s two numbers (exit 6
    otherwise); the source and the recomputation's output go into rules.md;
  - **on FRESH:** on the deciding line (slices 0–19, the deciding days; a
    subset of N's positions, priced as N's, book first) and on all 147 slices
    (at the tape, as N's 147). Each: n, m ± SE (M10's two-way), days, coins,
    and the two best days' share of the gain;
  - in `report.json`, written after `result.json`, so nothing of them is seen
    before the verdict exists. **N alone decides.**
- **D53. `[OPTION A]` the 715 cut deciding instead of N (default no):** every
  number the other options have, wherever it can be had **without touching
  C or FRESH**, so from E alone, each labelled "seeded: chosen after
  looking":
  - n, days and coins on E at K = 20 and at 147; m ± SE (two-way) on E;
  - the placebo on E alone (both flips; windows of 100 and 182 days inside
    E's entry days, of which there are 211), and z and z_L by D33's rule;
  - P(TOO FEW) on E's 100-day windows (the supervisor's scaling gives about
    26 days on FRESH's ~100, near TOO FEW's 20);
  - P(HOLDS) and P(LIKELY) by D35 with m_proj = E's m less one error (no C
    estimate exists for it; optimistic, since seeded);
  - the book footprint at K = 20 and the WITHHELD projection with E's rates.

  If chosen, the code is the same with the cut 715 (`design.ts`'s RECIPE); its
  z comes from this E-only placebo `[T9]`.

### 3. The code

**New, `src/polish/exam/`** (under the fingerprint; no extraction module
imports them):

| Module | What |
|---|---|
| `design.ts` | every number the rules fix, one home in code: K = 20, M = 147 (held to `sizing.json`), the recipe, D4's segments, the discovery window, FRESH_END, the looks, z and z_L per look, δ, 10%, 20/10, the placebo's seed and draws, the two side cuts (715, 1,391), the exploration files' SHA-256s, the options' constants (RECIPE N, N715 or B0; HOLDS_EXCESS BASE or OWN) |
| `gate.ts` | the exam's freeze: its scope, `verifyExamFreeze` (the list, every file, the tag through `git show <tag>:apps/poller/polish/FROZEN.sha256`), the exam's gate `[Q1]` |
| `placebo.ts` | D32–D35 on a line of K slices, over E ∪ C (N) or E alone (the 715 option, D53); the side cuts recomputed from E's features (D52) |
| `price.ts` | D19–D24: book-first pricing, funding on the minute price |
| `verdict.ts` | D36–D42 |
| `fresh.ts` | D9 (G0's counters and conservation, G5's pairing on FRESH's files), D29–D30, D48 |
| `lines.ts` | D46 and D52's side prints, reusing `linesBeside`, `tailOf` and the walks |
| `steps.ts` | the four steps: identity, refusals, whole writes, `result.json` first |

**Changed, each a small change whose old behaviour a test pins:**
- `range.ts`: `FRESH_RANGE` (D2, D3) and its key builder.
- `seal.ts`, `held.ts`: the opening, only with the exam's gate; keys at or
  after FRESH_END always refused.
- `counted.ts`, `tries/forced.ts`: the bound is the store's own end.
- `ctxs.ts`: D11, FRESH only `[Q6]`.
- `gates.ts`: G0's counters and conservation and G5 callable on any store's
  files (`Pick<Library, "files">`); their output unchanged.
- `tries/rules.ts`: `place` takes the entry test (D15).
- `tries/beside.ts`: `placeboOf` gains the flip, the 97.5th and 98.75th
  percentiles and P(TOO FEW) (the defaults give today's output to the bit).
- `tries/books.ts`: `heldBooks` takes the exam's gate (FRESH's book keys).
- `run.ts`: `ExamSettings`; `main.ts`: `exam --step placebo | reproduce | 1 |
  2`.

**The tool:** `tools/polish-freeze.cjs`, as `waveh-freeze.cjs`: the draft
(`polish/FROZEN.draft.sha256`), `--final` (a clean tree, `fresh.sha256`
present, the header `# tag polish-freeze-1`), `--data <FRESH
manifest.jsonl>` (writes `polish/fresh.sha256` only when every key is new and
the counts are 4,102 / 170 / 342; prints F7's sizes). It checks each closure
file against WAVE-H's, MARKET-1's and the paper experiment's freezes, byte
for byte.

**The freeze's scope (P0):** `dist/polish.js`, `dist/polish/**`; the compiled
WAVE-H, MARKET-1 and paper files the imports reach (21 + 7 + 3 today), each
equal to its own freeze's line; `research/`; lz4js's three files; `polish/`
(`rules.md`, `cuts.json`, `known-unpaired.json`, `tries.md`, `fresh.sha256`,
each required by name); `waveh/data.sha256`, `coins.json`, `sizing.json`,
equal to WAVE-H's list. `dist/schedule.js` and `dist/log.js` are shared,
unfrozen, their hashes logged at each start, as WAVE-H's H0 `[T8]`.

### 4. The tests and the breaks

- **design:** each constant pinned; M against `sizing.json`, the cut against
  `cuts.json`, the exploration files' hashes against the real files (read
  only, their SHA-256), the rules' table of z against `design.ts`; the side
  cuts' recomputation (type 7 at 0.75 and 0.9) on a world with known
  quantiles, and its refusal when a design number differs.
- **side prints and the 715 option:** the subsets kept at each cut (≥, at
  the cut exactly), their lines, the two best days' share; written in
  `report.json` only, after `result.json`; the recipe N715 placing the same
  entries with the cut 715.
- **gate and seal:** every refusal (no list; a file missing, changed or
  unlisted; a scope file not in the list; a closure file differing from its
  own freeze; no tag line; no such tag; the tag's list differing); FRESH's
  raw store and `ANALYZER\FRESH` refused by name and by real path (a
  junction) while closed; keys after DATA END refused while closed, after
  FRESH_END always; opened only by a valid freeze and tag (a temporary git
  repository in the test's folder, 60 s limit).
- **range, counted, forced:** FRESH_RANGE's 4,102 / 170 / 342 keys (and the
  download tool's plan, by its exported range); a FRESH-dated world's counted
  and forced fills; the 10 months' bounds unchanged.
- **placebo:** episode flips at K = 147 equal today's `placeboOf` to the bit
  on a world; day flips on a world with a known answer (uneven nets,
  code-rules); the percentiles; z per look at each boundary; P(TOO FEW); the
  projection's arithmetic.
- **price:** book first; the tape for no file, no snapshot, stale (10.000 s
  live, 10.001 s stale), not usable; unpriced; depth short at a level boundary
  at each source; funding through the minute price with a missing mark; equal
  to WAVE-H's `pricePosition` on a world inside the kit's panel (1e-12).
- **verdict:** each verdict at each boundary exactly (WITHHELD at 10% and
  just above, TOO FEW at 19/20 days and 9/10 coins, DOES NOT HOLD at
  m + z·SE = 50, HOLDS and LIKELY with each of their three conditions failing
  alone), the order, DOES NOT HOLD's z, Q4's OWN branch, the sentences.
- **steps, on the gates world** (`polish-gates.test.ts`'s): `placebo`;
  `reproduce` (a re-extraction into a new root equal file for file; a changed
  column, a changed N number, a line of the look beyond 1e-9 each fail,
  exit 6); **on a FRESH world** (a few FRESH-dated days with an absent
  `asset_ctxs` day, a thin one, a hole, books for some legs and missing for
  others): step 1 (extract, integrity, counts, positions, `books-needed.txt`,
  exit 5); step 2 (unanswered books refused; positions held to step1.json;
  `result.json` written first, then the others; already run; the recovery;
  no outcome in the log before `result.json`).
- **freeze tool:** the scope equals the compiled imports' closure (a walk, as
  `waveh-freeze.test.ts`), the three freezes' lines, `--final`'s refusals,
  `--data`'s counts and F7's sizes on a synthetic manifest.
- **Breaks:** one-line breaks of what decides (the seal and gate, the
  deciding days, W4's cut and window, K, the walk's side, live/stale, the
  tape window, funding, BASE's minutes, the holes, each verdict condition and
  the order, z per look, the placebo's flips and percentiles, the
  reproduction's three comparisons, the write order), in scratch copies only
  (`git archive`, real folders of per-package junctions, each junction removed
  alone after), at most two runs at a time; every kill's message kept; each
  survivor gets a test.

### 5. The runs on real data (after the build; idle, outside the windows, at most two at a time)

| Run | Command / tool | Reads | Writes | Time, peak (estimates) |
|---|---|---|---|---|
| placebo | `exam --step placebo` | the trusted store's counted fills; `explore\e-`, `choice-` and `c-positions.jsonl.gz` | `ANALYZER\POLISH-RULES\placebo.json` (N on E ∪ C at K = 20, K = 10 and 147 beside; the side cuts recomputed; the 715 option on E alone) | 10–30 min, 3–5 GB |
| projection | a scratch script (section 6) | the look's positions (leg fields only); the store's tape, bars, `files.jsonl`; the positions files' counts | `ANALYZER\POLISH-RULES\withheld\`, copied here | 15–30 min, 3–5 GB |
| reproduce | `exam --step reproduce` | WAVE-H's raw store (8,845 files, slice 0's books); the trusted store; the look | `ANALYZER\POLISH-RULES\repro\` (~21 GB store, ~47 GB parts), `repro.json` | ~70 + ~15 min, detached, **the supervisor's word**; ~5 GB |
| draft list | `node tools\polish-freeze.cjs` | the build | `polish/FROZEN.draft.sha256` | seconds |

### 6. The WITHHELD projection's method

**Goal:** the expected share of the deciding line's positions on FRESH that
will be left out, unpriced or depth short, by part, with its spread; counts
only, never an outcome.

**Inputs, each held to its hash:**
1. **The look's `positions.jsonl.gz`** (slice 0's positions priced at the book
   first): parsed by a schema of leg fields only (`set`, `spot.t`, `spot.iid`,
   each leg's source, why, short; `priced.unpriced`); no net, gross, funding
   or excess is read.
2. **N's lines** (`choice-positions` for E, `c-positions` for C, group N):
   slice, t, iid, x_in, x_out, unpriced; `e-positions`' B0 lines with their W4
   map the look's E positions to N; C's N lines map C's.
3. **The trusted store:** the tape at each leg of slices 0–19 (each leg walked
   again: short or no trade, by leg; counts), the bars' trades a minute (F7),
   `files.jsonl`'s holes.
4. **FRESH's known gaps (metadata):** the book holes (07-08, 07-12 → 17; the
   listing reached 11-12, so 11-13 → 15 is a scenario); the absent
   `asset_ctxs` day (07-08); the thin days in the deciding window (05-30,
   08-08, 08-09, 08-27, 08-30, 11-07 → 15, by size).

**The parts (the brief's names):**
- **book-short:** of N's slice-0 legs at the book (E, C), the share depth
  short at 20 levels, by leg.
- **tape-short and unpriced (no trade):** P(a leg falls to the tape) × P(short
  | tape), and × P(no trade | tape), by leg (entry, exit) and part (E, C):
  - P(tape) = the book's fallback away from whole-day holes (stale, no
    snapshot, not usable, a missing coin-hour; from slice 0's legs) + the
    share of legs on FRESH's no-book days (the calendar);
  - P(short | tape), P(no trade | tape) from the slices 0–19 legs walked at
    the tape on E and C.
- **unpriced (funding):** "funding without a price" on the thin days, as a
  scenario: their marks whole (0) or absent (computed as for 07-08).
- **left out by 3.4's rules:** the share of the line's E ∪ C positions whose
  windows meet a 60 s hole of the 10 months, as a rate.
- **F7's 2% (07-08):** for positions spanning 07-08's settlement hours, P(a
  settlement minute with no trade in its 5 minutes) by coin, from the 10
  months' bars, over the hours spanned, on the line's coin mix; with the share
  of the line's positions on 07-07 and 07-08.

**Combining:** per position, P(withheld) ≈ 1 − (1 − p_entry)(1 − p_exit)(1 −
p_funding) with p_leg = P(book)·P(book short) + P(tape)·(P(short | tape) +
P(no trade | tape)); plus the left-out rate.

**The spread:** N's positions come on few days (effective days 36.7 of 99 on
E), so the share depends on where FRESH's cascades fall. 10,000 draws: a
random 100-day window of E ∪ C's slices 0–19 positions, its days laid onto
D4's calendar in order (window day i → deciding day i), each position's
probability from its legs' days (a no-book day or not) and its part's rates.
Printed: the mean share, its quartiles and P(share > 10%), by part, with E's
rates, C's rates and both; for option A (as planned) and option B below. For
the 715 option (D53): the same with E's positions, rates and day mix only.

**If the expected share is above about 6% — the options, each with its
numbers:**
- **A, as planned** (D37).
- **B, the no-book days cut:** a position with a leg on a UTC day with no book
  file of the deciding line's legs (every needed key of that day listed
  missing in `books.jsonl` after the fetch; today 07-08 and 07-12 → 17) is cut
  from the deciding days and printed apart, like the discovery window. It is
  fixed before the freeze from metadata only; it also removes 07-08's
  missing marks; it costs about 9 of 100 entry days. My likely
  recommendation, if the numbers bear it out.
- **C, WITHHELD counts only book-short legs** (a tape-short leg priced): not
  recommended, since at the tape N's short legs carry 58% (E) and 46% (C) of
  its gain.
- **D, a higher threshold:** not recommended.

A change to WITHHELD or to the deciding days is the owner's call at the talk.

### 7. Docs

- `apps/poller/polish/rules.md` (new).
- Architecture: "The exam" section; the analyzer's and the exploration's
  headings say "not run", and both ran on 2026-11-19 (fixed).
- Decisions: my technical calls, one entry at the top.
- Current-task rewritten at the end.
- The closing message names what belongs to code-rules and the plan page.

### 8. The commits, in order

Each with `pnpm verify` green in the same command and the three freezes
verified after (61 `d04d3cd8…`, 64 `b9e17505…`, 74 `864990da…`); the other
freezes' files never touched.

1. the seal's opening and the exam's gate (`exam/gate.ts`, `seal.ts`,
   `held.ts`, `tries/books.ts`) and their tests;
2. FRESH's range, the bounds by the store's end, D11 if ruled, and their tests;
3. the placebo (`placeboOf` generalized, `exam/placebo.ts`, `exam --step
   placebo`), then its run on real data;
4. the book-first price (`exam/price.ts`);
5. the verdict (`exam/verdict.ts`);
6. the reproduction (`exam --step reproduce`), then its run (detached);
7. steps 1 and 2 (`exam/fresh.ts`, `lines.ts`, `steps.ts`);
8. the freeze tool and the draft list (and `fresh.sha256` if `[T3]` stands);
9. `rules.md`, with the placebo's and the projection's numbers, and its
   pinning test;
10. the breaks round's tests;
11. the docs.

This is more than one session. Near ~70% of context I stop after a finished
commit with this file complete; a fresh POLISH-RULES continues.

### 9. Problems I foresee, and how each is handled

1. **The kit's `marketFrom` refuses FRESH:** no kit market object anywhere in
   the exam (D25, D23); a test prices a FRESH-dated world.
2. **WAVE-H's `fillKeys` stops at DATA END + 1 h:** polish's own key builder
   for FRESH, held to the download tool's plan.
3. **`countedFrom` and `forcedFrom` drop every FRESH record** (their bound is
   DATA END): bounded by the store's own end.
4. **`inPart`'s 50-hour stop** would cut about a day per segment: D4's own
   test.
5. **FRESH's thin `asset_ctxs` files** may fail WAVE-H's 1% rule or change
   their header, which would stop step 1 on data nothing decides: D11.
6. **One-sided trades on FRESH** (the 10 months had 3 in 2.66 billion
   records): D9 and Q7.
7. **No books for 2026-11-13 → 15 in the 11-13 listing:** the fetch writes
   them missing; those legs go to the tape (A) or the days are cut (B).
8. **The tag check needs git at run time:** the exam runs from the repository;
   tests use a temporary repository.
9. **The extraction writes into `ANALYZER\FRESH`:** the seal opens it only
   with the gate; tested by name and by real path.
10. **Disk on F:** the reproduction's store and parts (~68 GB) and FRESH's
    (~50 GB) against about 1.3 TB free; the supervisor deletes the parts once
    each is accepted.
11. **C stays clean:** the placebo prints no mean; the projection counts only;
    the reproduction recomputes only N's and B0's printed numbers.
12. **The review's K = 10 placebo has its own draw order:** my K = 10 numbers
    can match it only within sampling noise (about 0.015 at the 99.75th with
    200,000 draws); K = 147 at 10,000 draws reproduces `beside.json` to the
    bit.
13. **The look's positions file holds nets:** the projection parses leg
    fields only.
14. **Heavy tests:** a 60 s limit on each spawning test, explicit limits on
    heavy hooks (code-rules).

### 10. Questions, each with a recommendation

**These change or fix a rule:**
- **Q1. The seal's opening.** Open only when (a) `polish/FROZEN.sha256`
  verifies and (b) the git tag its header names (`# tag polish-freeze-1`)
  holds this very file (`git show <tag>:apps/poller/polish/FROZEN.sha256`,
  byte for byte). *Recommendation: yes.* An untagged or locally edited list
  then cannot open FRESH; WAVE-H's gate checked the list alone.
- **Q2. z for each look:** from the placebo window matching the look's
  length (look 1: 100 days; look 2 and one later look: 182 days), the larger
  of the two flips, 100,000 draws. *Recommendation: yes.* The exploration
  took the 100-day window for both looks with episode flips only; on K = 10
  every candidate stays below the floors (the review: 2.36–2.63 against 2.81;
  1.71–2.10 against 1.96 and 2.24).
- **Q3. DOES NOT HOLD keeps HOLDS's z** (2.81, or 2.58 for one look).
  *Recommendation: yes,* as the supervisor leans. With LIKELY's z, a real +50
  effect would be called DOES NOT HOLD up to 2.5% of the time instead of
  0.25–0.5%.
- **Q4. LIKELY under F14** counts as NOT SETTLED: look 2 still runs, LIKELY is
  printed by name, and at the last look it stands as the reading.
  *Recommendation: yes.* Otherwise a LIKELY at look 1 would end the exam
  before look 2 could reach HOLDS, so LIKELY would decide something.
- **Q5. WITHHELD** stays as D37 in the rules now; the options (section 6)
  come with the projection's numbers before the reviews.
  *Recommendation: yes; option B is likely,* if the numbers bear it out.
- **Q6. FRESH's `asset_ctxs` days** failing WAVE-H's 1% rule, or with another
  header, read as absent and listed, never a stop (D11). *Recommendation:
  yes.* Nothing that decides needs `asset_ctxs`, and the thin files from
  2026-09-22 are a known signal; this is F7's "pre-state the fallback".
- **Q7. G5 on FRESH:**
  - **(a)** any unpaired record beyond the straddles and FRESH's two edges
    stops step 1, every record listed, for the supervisor's ruling by H0's
    route (a `polish/fresh-unpaired.json` data file, empty at the freeze; a
    re-freeze of that data file; step 1 again, about 2 hours, no outcome
    seen); or
  - **(b)** up to 10 such records pass, each listed in `step1.json`; more
    stop.

  *Recommendation: (a),* your rule of 2026-11-18 ("never a waiver in code").
  `repro.json` names the program's fingerprint, not the list's hash, so a
  data-file re-freeze does not repeat the reproduction.
- **Q8. BASE on FRESH** from the deciding days' minutes (D27), both segments
  pooled by 4-hour block. *Recommendation: yes* (plan 3.3).

**Technical calls, as recommended unless you say otherwise:**
- **T1.** The lines beside are priced at the tape (all 147, B0, the
  discovery window); the deciding line is book-first and also printed at the
  tape. Books are fetched for the deciding line's legs only (slices 0–19,
  about 2.8 GB).
- **T2.** Look 2's code is a later build (FRESH-2's range and data
  list) under its own freeze, with every file of look 1's list byte-identical
  and rules.md unchanged. The rules for both looks are frozen now.
- **T3.** `polish/fresh.sha256` and F7's list are written in my build
  from FRESH's `manifest.jsonl` (names, bytes, SHA-256s; final since
  2026-11-19 09:03Z), so the draft list is whole and F7's list is in the
  rules for the reviews. The freeze re-runs the tool, and the files must come
  out byte-identical.
- **T4.** I run the reproduction once, detached (~85 min), before the
  draft list, into `ANALYZER\POLISH-RULES\repro\`. No `gates` is rerun on it:
  byte equality with the gated store carries the trust.
- **T5.** The projection is a scratch script in this folder. Its
  numbers go into rules.md as a dated print with its source; the rules
  review can recompute them.
- **T6.** Q4's two answers and the recipe's three (N, N at 715, B0) are
  built as constants, every branch tested, so the owner's talk needs no
  rebuild before the freeze.
- **T7.** `EXAM_ROOT` is `ANALYZER\POLISH-RULES` for my runs and
  `ANALYZER\FRESH` at look 1 (the reproduction too, so step 1 finds
  `repro.json` beside it).
- **T8.** `dist/schedule.js` and `dist/log.js` stay shared and
  unfrozen, their hashes logged, as WAVE-H's H0.
- **T9.** The 715 option's numbers come from E alone (D53): its placebo on
  E's own 100- and 182-day windows (only 30 distinct 182-day starts fit in
  E's 211 entry days, so that window is printed with the count), and its
  P(HOLDS) from E's m less one error, labelled seeded and optimistic. The
  side cuts' two numbers are the program's own recomputation; if it does not
  give 715 and 1,391 exactly, I stop and ask.
