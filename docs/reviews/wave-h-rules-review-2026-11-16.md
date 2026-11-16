# WAVE-H-RULES-REVIEW — the fresh rules review of WAVE-H, before its freeze

WAVE-H-RULES-REVIEW (Sonnet 5.5, max, a different model from the builder's Opus),
2026-11-16 01:58Z – 03:11Z (UTC; every stamp from `date -u`), for polymarket-follow's
supervisor. Under review: `apps/poller/waveh/rules.md` (H0–H15), the code that runs
it (`apps/poller/src/waveh/`, `src/waveh.ts`, the closure it imports from MARKET-1
and the paper experiment, the vendored `research/`, lz4js's three files) and the
tests `test/waveh-*.ts`, at HEAD `dc812f1` (the last commit of code is `5ac401a`;
every commit after it, up to `35fc884` where I commit, changes documents or adds the draft
list only); the draft freeze list
`waveh/FROZEN.draft.sha256` (`4c08ef95…9056`, 71 files) and `waveh/sizing.json`
(M = 147). The model of this review is
`docs/reviews/market-rules-review-2026-11-13.md`. A separate fresh reviewer,
WAVE-H-CODE-REVIEW, read the code's quality at the same time; this review does not
repeat it. Evidence: the supervisor folder `workers/WAVE-H-RULES-REVIEW/`
(`progress.md`, `scripts/`, `out/`; paths below are relative to it). **A review
decides nothing:** the supervisor and the owner answer; nothing in the repository was
edited but this report.

**The blind store held.** I opened repository files, the docs, WAVE-H-BUILD's folder
(`progress.md`, `brief.md`, `supervisor-answers.md`; read only) and my own folders,
nothing else. I did not open anything under `F:\polymarket-follow-research\` (the
store of the sealed test months and the rehearsal's sealed outcomes), the collector's
recordings and database, the run folder, or the paper experiment's and MARKET-1's
data, and took no count from them. Every count of the rehearsal below is the one the
repository already holds (`waveh/sizing.json`, the decisions). I made no network call,
did not run `dist/waveh.js`, `tools/waveh-fetch.cjs` or `tools/waveh-freeze.cjs`
against any real path (the built program ran against made-up folders in a scratch copy
only), no deploy, no Task Scheduler, no agent; polymarket-lab not touched. Every build,
test and deliberate break ran in scratch copies of `git archive HEAD` in my
scratchpad (each `node_modules` a real folder of per-package junctions, vitest run
directly, never pnpm); the repository was clean of my changes at the start and at the
end, and this report is the only file I added. Every price, fill, mark and book in my
scripts is made up.

## For the owner, in one page

*Words.* A **look** is the one run of the finished program on Hyperliquid's ten test
months (2025-08-01 to 2026-05-27). The **freeze** is the moment the rules and the
program are locked by a fingerprint; afterwards a mistake can only be put right by a
recorded "defect fix" and a new fingerprint, and after the look not at all. A **wave**
is at least two accounts of one slice liquidated the same way in small coins within an
hour; a **slice** is a fixed share of all accounts, cut by the digits of the address
(one in 147); a **position** is the $1,000 paper position against the forced side. A
**bp** is 0.01%. **WITHHELD** is the verdict word for "too many positions could not
be priced to answer".

**Verdict: the rules may be frozen after the fixes below.** The design is what you
approved. Every ruling of the plan's approval and every one of the plan review's ten
fixes (R1–R10) is in the rules as decided; nothing is added except the builder's own
calls, which I judged one by one (all sound). The
program does what the rules say. I recomputed the parts that decide with code of my
own, from the text of the rules and not from the program, on made-up worlds: the
counted fill (60,000 records), the slice (20,000 addresses), the wave entries (600
worlds, ties in the same millisecond and gaps of exactly 60 minutes included), the
scan that fixes M and its choice (200 worlds), the book at a leg's instant (20,000
cases) and the tape (3,000), the price of a position with its fees and funding (4,000
positions), the verdict (a grid of 21,600 combinations with every boundary) and the
statistic's bookkeeping (300 sets): **no difference anywhere.** Then I ran the look
itself, end to end, over eleven made-up worlds, which no test in the repository does:
a world with a real effect gives HOLDS; the same books with marks that show no gain
over the market's own drift give NOT SETTLED, because of the baseline condition you
added; a small effect gives DOES
NOT HOLD; a noisy +100 gives NOT SETTLED with its sentence; 19 days or 9 coins give
TOO FEW TO TELL; 3 of 24 and 4 of 30 positions unpriced, and 4 of 30 with a leg short
of depth, give WITHHELD, while exactly 10% does not; and a world whose every entry is
priced from the tape (no book file) is not withheld. Every expected number was my own
arithmetic and matched. The draft list equals a clean build of HEAD, file for file (71
of 71), the two frozen lists it leans on still verify (64 and 61), and I ran the
freeze day's procedure in a scratch copy: the tool refuses without `data.sha256`,
writes a list the program's gate accepts, and the gate refuses a changed or unlisted
file of every kind (`out/verify-final.txt`). Finally I broke the rules' own code on purpose 93 times, in scratch copies (the constants and the branches that decide): the repository's tests caught 80, and the 13 they miss are small gaps in the tests, none a defect of the program (finding 10).

**What must change first** (each is small; none changes the design, the statistic or
the budget; all change frozen text or code, so they are cheap now and cost a
recorded defect fix afterwards):
1. **H10's decided change** (the off-minute mark rows) is right but two clauses short
   (finding 1): what two rows of one stamp do, and which form of time is read. I built
   it in a scratch copy as the review words it: all 113 of the repository's tests for
   WAVE-H still pass unchanged, so nothing pins either the old or the new behaviour;
   the failing-first test is ready (`scripts/zz-review-h10.test.ts`). The
   rehearsal's third run then needs a checklist of what must not move (section "H10").
2. **The look's first step does not look at the marks or the funding** (finding 2).
   The rehearsal found the off-minute rows only because 7 positions came out
   unpriced; in the one look, the same kind of defect in the test months would show
   after the verdict was written, as WITHHELD. Step 1 already reads every fill file
   and prints counts before any price exists; the same counts for the 370 mark days
   and 760 funding windows cost minutes and let a data defect be mended by your own
   defect route before step 2.
3. **One setting and a few clauses** (findings 3–8): the 8 GB heap you ruled is in no
   frozen text and the frozen header says 4 GB; the freeze tool's `--data` should
   check what it freezes; five sentences of the rules say a little more or less than
   the code does.

**What you decide** (section "Questions", each with my recommendation): the tie of two
rows of one stamp; whether step 1 also checks marks and funding; whether the plan's
second reproduction figure (+309.7 ± 67.7 through WAVE-H's statistic) is still wanted;
and three smaller ones (the heap, the tape of every leg, a lock for the look). The
fixes should go into one commit with WAVE-H-CODE-REVIEW's, so the list is written once.

---

## Verdict

**MAY FREEZE AFTER THESE FIXES.** Two medium findings (1, 2) and eight low (3–10);
no high. Findings 1, 2, 3, 5, 6, 7 and 8 change frozen code or text; 4 changes a
tool outside the freeze; 9 is the docs sweep; 10 is tests, outside the list. After the fixes `dist/` and `rules.md`
change, so the draft list is written again (its hash changes) and the rehearsal runs
a third time (decided already, for H10); a short read of the changed lines by the
supervisor is enough, not another full review. Any change WAVE-H-CODE-REVIEW asks for
should go into the same commit, so that the list is written once. Nothing found changes
the design, the statistic, the data or the budget.

## Findings by severity

| # | Sev. | Where | Finding | Fix |
|---|---|---|---|---|
| 1 | medium | H10, `ctxs.ts`; decisions 2026-11-14 (Q6) | **H10's decided change leaves two things open, and no test pins the old or the new behaviour.** (a) "when two rows give one boundary, the later-stamped one stands": for two rows of the *same* stamp the code's own test pins "the first line stands" (`twice` counted), the builder's recommendation said "the later row", and the ruling's "a row stamped on a boundary is read exactly as now" points at the first. (b) The time's form: the schema reads `HH:MM:00Z` only; the decision speaks of "off-minute" rows and the builder's E6 found whole seconds (`…:32:20Z`); other forms (fractions) are unsaid. (c) Which numbers the third run must show. The decided mapping itself (a row stamped s gives the end of the minute that ends at or after s; the later stamp wins) is sound: nothing is read ahead, it is independent of file order, and it leaves boundary rows as they are. | Word H10 as: the mark at the end of minute [m, m + 1 min) is the `mark_px` of the coin's row with the latest stamp in (m, m + 1 min]; two rows of one stamp: the first line stands, as now; the time is `YYYY-MM-DDTHH:MM:SSZ` (any whole second), any other form fails the schema, is dropped and counted. Code: the regex, `ceil` for the index, a stamp kept per minute. A test that fails before (mine: `scripts/zz-review-h10.test.ts`, red on HEAD, green with the change) and the third run's checklist (section "H10"). |
| 2 | medium | H15, R3, `look.ts` `lookStep1` | **Step 1 checks fills only.** `asset_ctxs` day files and funding windows are first read at step 2, after the books are fetched and with the result about to be written. A format defect there is the one thing that can make the single look unanswerable: a settlement without a mark leaves a position unpriced and unpriced counts toward WITHHELD (H12's 10%). It has already happened in SIZING: 2,831 rows of the 38 coins on 12 of 68 days (1,170 on 2025-06-08 alone, 2–3% of that day's rows) failed the schema and were found only through 7 unpriced positions. H2 stops a day of fills with more than 1% failing records; H10 has no such rule; `asset_ctxs` rows failing, late or twice, and funding rows failing, are counted and printed only in `report.json`, after `result.json`. | H15 step 1 also reads every `asset_ctxs` day (370) and funding window (760) of the list, hash first, and writes to `step1.json`: by day the rows of the 38 coins read, failing, late and twice, and the minutes without a mark by coin; by coin and window the funding rows read and failing and the hours without a row after the coin's first fill; and how many of WAVE-H's positions have a settlement in (x_in, x_out] whose minute has no mark (the count only: no value is read), which says before the books are fetched whether WITHHELD is coming. A day with more than 1% (and at least 10) of its `asset_ctxs` rows failing stops (exit 5, H0's route), as H2's rule does for fills. Every expected key must be in the list (all 370 days; each coin's windows). No threshold of the verdict changes. |
| 3 | low | `src/waveh.ts` header, H15 "Runs"; decisions 2026-11-14 (Q5) | **The 8 GB heap is in no frozen text; the frozen header says 4 GB.** `waveh.ts`'s header comment (it reaches `dist/waveh.js`, which the list freezes) shows `--max-old-space-size=4096` twice; H15's "Runs" does not name a heap; only `current-task.md` says 8192. A runner who follows the frozen files runs out of memory hours into the look (the projection is 2.8–4 GB, a denser test month needs more). | `--max-old-space-size=8192` in H15 "Runs" and in the header, in the same commit that rebuilds `dist/` anyway. |
| 4 | low | `tools/waveh-freeze.cjs --data`; H2 | **The freeze tool writes `data.sha256` without checking it.** It prints a total only. A funding window that is missing from the list is read as "charged nothing" with no stop (a missing `asset_ctxs` day stops, a missing window does not: `readMarkets` loops over the list's keys); a duplicate key makes `readDataList` throw at the look's start, from a list that is already frozen. | `--data` prints the counts by prefix and refuses unless they are 8,845 fill files, 370 `asset_ctxs` days and 760 funding windows (38 × 20), no duplicate key, and every `fillKeys` name present. (Tool, outside the freeze.) |
| 5 | low | H0 | **"Every run starts by checking them" is true of the look only.** `rehearse` runs with the gate closed whatever the freeze (H15 says so; `waveh.ts` does not check). H0's shared-code sentence names the schedule's constants; the program also imports `dist/log.js` (its hash is logged with the schedule's). | "The look starts by checking them; the rehearsal runs with the gate closed whatever the freeze"; "the schedule's constants and the logger". |
| 6 | low | H8, `rehearse.ts` `bookFound` | **A snapshot line that fails the schema is "dropped and counted": it is dropped.** `lastAtOrBefore` returns the lines and the failing lines; `bookFound` throws the numbers away. A changed book format would show only as legs sliding from the book to the tape (H14 prints those, by reason). | Count the lines and the failures per file and print them with `files` in the report, or say "dropped". |
| 7 | low | H12, `verdict.ts` | **H12 is silent when no priced position has an excess.** The code gives NOT SETTLED (never HOLDS; a test pins it). MARKET-1's M11 is silent the same way. | One clause: "when none has one, HOLDS cannot hold". |
| 8 | low | H13, H14, `summarize`, `look.ts` | **Two readings H14 leaves to the code.** "The share not at the book" is, for WAVE-H, the unpriced plus the depth-short; tape-priced legs are priced (H12), and M13's words "not priced at the book" invite the other reading. The SIZING line carries no BASE (the code gives a SIZING position none: the builder's call), so its excess print is empty; H13 says "the same line" and H10 defines BASE for any x_in. | Name them in H14: "the share unpriced or with a leg short of depth (the WITHHELD share)" and "SIZING's positions have no BASE cell". |
| 9 | low | docs | **Documents the fix round must bring in step.** `claude-architecture.md` still says "rules.md (a draft: M not yet written…)" (M = 147 is in H5), and its "marks" line will need H10's change; `current-task.md`, the plan page and the decisions entry of the fix round. | The docs sweep of the fix round. |
| 10 | low | tests (outside the freeze list) | **Thirteen of my 93 deliberate breaks survive the repository's suite** (list in "Deliberate breaks"): the exit leg's depth short is not pinned (`c16`), nor the look's feeding of the days and coins to the verdict (`k09`, `k10`: its test has one position), nor a depth-short position counted once (`d10`), a mark of 0 (`i03`), a funding row or a position exactly at the bound (`i05`, `j03`), the hour-before wiring when x's file is missing (`j04`), the days divisor at the rehearsal's and the look's calls of M's scan (`j08`, `n01`), the busiest-day tie and the share above zero (`l02`, `l04`), SIZING's missing BASE (`k07`). My own checks kill the first ones (below); none is a defect of HEAD. | Tests, one each, in the fix round: no hash changes. |

*Notes that are not findings* (each is a line in the section that follows): the plan's
second reproduction figure was not built; `look()` reads the tape of every leg, not
only of the legs the book does not price; the look has no lock against two runs at
once; a SIZING with no position in slice 0 would be refused (unreachable: 290); the
crash window between `result.json` and `report.json`; `rehearse` with a missing store
exits 1, not 2.

## H10's decided change: right, two clauses short, and what moves with it

**What was decided** (decisions 2026-11-14, the supervisor's Q6): an `asset_ctxs` row
stamped s gives the mark at the end of the minute that ends at or after s (the
boundary at or after s); when two rows give one boundary, the later-stamped one
stands; a row stamped on a boundary is read exactly as now. Why: 2,831 of SIZING's
rows of the 38 coins are stamped off the minute, in stretches on 12 days, so the
settlement mark of 7 of the 290 positions was missing ("funding without a mark").
Not yet built; to be built in the fix round with this review's findings.

**Is the text right? Yes.**
- *Nothing is read ahead.* A row stamped s is known at s, and the boundary it prices
  is at or after s. The convention that a mark is "the mark at the end of a minute"
  is R1's and the kit's and stays: a row stamped 10:59:20 serves the minute
  10:59–11:00 exactly as the on-minute row stamped 11:00:00 does today, 40 seconds
  sooner.
- *It does not depend on the order of the file.* The old "first row kept" did; "the
  later stamp stands" does not, and a row on the boundary always beats an earlier
  off-minute row. I wrote my own reference of the rule and ran 3,000 made-up day
  files (off-minute stamps, ties, every order, rows at the bound, malformed rows)
  against the change as I built it in a scratch copy: 0 differences.
- *It touches only marks that were missing.* The counted fills, M (the fill pass reads
  no mark), the scan, every threshold, the sources of the SIZING legs (the 566 at the
  book) cannot move. A position's net moves only through funding, and only from
  "unpriced" to priced or by the difference of two marks of one minute times a rate
  of about 0.00001; the lines on marks (gross on marks, BASE, the excess) gain marks
  where minutes had none.
- *It cures the case it was made for.* A stretch of rows stamped `:20` around a
  funding hour leaves `fundingBetween` without a mark on HEAD (60 failing rows,
  "funding without a mark", net null) and prices the position after the change
  (`scripts/zz-review-h10.test.ts`, red on HEAD and green after).

**Is it complete? Two clauses short.**
1. *Two rows of one stamp.* "The later-stamped one stands" says nothing for equal
   stamps. The repository's own test pins "the first line stands, `twice` counted"
   (`waveh-store`, "takes the row stamped m + 1 min…"), the builder's recommendation
   said "the later row", and the ruling's "read exactly as now" points at the first.
   **Recommendation: the first line stands.** It keeps that test and the ruling's last
   clause literally true.
2. *The form of the time.* The schema takes `HH:MM:00Z` only. The change must say
   what it takes: `YYYY-MM-DDTHH:MM:SSZ`, any whole second (what E6 found); any other
   form (a fraction, a space) fails the schema, is dropped and counted, as today. A
   new form in the test months is what finding 2's step 1 would show before the look.

**The text, as I recommend H10 says it** (the rest of H10, BASE included, unchanged):
> *Marks:* Hyperliquid's `asset_ctxs` day files (one row a coin a minute, stamped at
> the minute's start; in stretches on 12 of SIZING's 68 days at another second).
> **The mark at the end of minute [m, m + 1 min) is the `mark_px` of the coin's row
> with the latest stamp in (m, m + 1 min]**: a row stamped on the boundary m + 1 min
> wins over an earlier one, two rows of one stamp give the first line, and for 23:59
> the next day file's 00:00 row serves. The time is `YYYY-MM-DDTHH:MM:SSZ`; a row of
> another form fails the schema, is dropped and counted. A row stamped at or after
> DATA END is not read. The coin's market object is the kit's (`marketFrom`)…

**What else must change with it**

| Where | Change |
|---|---|
| `src/waveh/ctxs.ts` | the regex takes any whole second; the index is `ceil((s − start) ÷ 1 min) − 1`; a stamp is kept per coin and minute (a `Float64Array`: about 160 MB for the look's 38 coins × 532,800 minutes, inside the 8 GB) and a row replaces the mark only when its stamp is strictly later; `twice` counts a minute given by two rows; the header comment says so |
| `rules.md` H10 | the text above; H1's list of times and H14's `asset_ctxs` print (rows, failed, late, twice) unchanged |
| tests | `waveh-store` passes unchanged (I ran all 113 of the repository's tests for WAVE-H against the change). To add, each failing before: an off-minute row fills the minute whose end is at or after it; the later stamp wins in either file order; a boundary row beats an earlier row; equal stamps give the first line; another form still fails and is counted; a row stamped before the bound whose boundary is the bound is read, a row at the bound is late; end to end, a settlement whose preceding minute holds only an off-minute row is priced (`zz-review-h10.test.ts` has the last two and a randomised reference); and a break of the index (`− 1`) and of the tie (`>` against `≥`) |
| `waveh/sizing.json` | only `outcomes.sha256` can change (`positions` stays 290); `M`, the 346 scan rows, `days` and `counted` are the fills' and must come out identical |
| `waveh/FROZEN.draft.sha256` | the lines of `dist/waveh/ctxs.js`, `waveh/rules.md` and `waveh/sizing.json`, the head, hence the list's hash (and whatever else the round changes: one commit, one list) |
| docs | architecture's "marks" line and its stale "(a draft: M not yet written" (finding 9), `current-task.md`, the round's decisions entry (the diff, the failing-first test, the positions whose numbers changed: the 7 and any whose x_in, x_out or settlement minute lies in a stretch) |

**The third rehearsal's checklist** (counts and mechanics only; no outcome is read).
*Must not move* (they come from the fills and the books): 1,619 fill files; 425,433
counted fills (425,300 market, 133 backstop) in 31 coins; M = 147 and the 346 scan
rows equal to `sizing.json`'s; slice 0's 290 positions, 283 priced in the rehearsal
and 7 left for the look; all 566 legs at the book, none on the tape; the book's age at
a leg (65 / 295 / 493 ms); R2's tape − book (median 0 bps each side); the highest taker
rate (4.5 bps each month). *Must move:* `asset_ctxs` rows failing 2,831 → 0 (any row
still failing is named by day and cell); "funding without a mark" 7 → 0; the sealed
outcomes' SHA-256. *Worth one mechanical check:* compare the sealed file of run 2 and
run 3 line by line by hash, without reading a line: every position whose x_in, x_out
and settlement minutes lie outside every off-minute stretch must be byte-identical.

## The brief's checks, one by one

**1. Every ruling R1–R10 and every plan-review fix is in the rules as decided, and
nothing is added.** Yes. The tables below set the owner's approval, the ten fixes and
the builder's calls against `rules.md` and the code. What the builder added is its own
operating detail, all small and none deciding: the gate requires four `waveh/` files by
name; SIZING is 67 days 10 hours exactly; the two-formats hour (2025-07-27 08h) is
named; the rehearsal's left-over positions are priced again at the look; the table of
what step 1 writes.

*The owner's approval (decisions 2026-11-14, "WAVE-H's plan approved")*

| Ruling | In rules.md and the code | OK? |
|---|---|---|
| The plan with R1–R10 folded in; MARKET-1's road (parts, the reproduction on the old weeks, the rehearsal on SIZING, rules final and a draft list, then reviews, fixes, a fix-check, the freeze, the one look) | H0–H15; `waveh-reproduce`, the rehearsal, `FROZEN.draft.sha256`; this review is the next step | Yes |
| Q1 the counted fill by either method | H4 `legKind`: own leg, reducing, `crossed` or "backstop" | Yes |
| Q2 slice 0 decides, every slice beside on marks | H6 `waveSpots(0, …)`; H13 EVERY SLICE (each slice's mean, the share above zero, the pooled reading) | Yes |
| Q3 M fixed once from SIZING, month by month beside | H5; the look recomputes M from SIZING's files and stops (exit 5) if it differs from `sizing.json`'s; H13 M BY MONTH | Yes |
| Q4 a tape-priced leg counts as priced, after R2 | H8, H12 ("a tape-priced leg is priced"); R2's tape − book printed by the rehearsal | Yes |
| Q5 z 2.58, δ +50 bps, 20 days, 10 coins | H11, H12; `Z = 2.58`, MARKET-1's `DROP_BPS`, `MIN_DAYS`, `MIN_MARKETS`; every boundary tested | Yes |
| Q6 the crash day in, printed apart | H13 THE DAY WITH THE MOST POSITIONS (the day, its count and share; m and SE without it; each day alike; the five busiest days), right under the verdict | Yes |
| Q7 the download: 2 MB/s, the pauses, the watch | `tools/waveh-fetch.cjs`, not a rule of `rules.md` (the supervisor read it against D1–D8); the program keeps its own windows (H15 "Runs") | Outside this review |
| Q8 the books of the legs fetched inside the look | H15 step 1 lists them, step 2 reads them from the store's book list | Yes |
| Q9 the data stays on F:, the raw files kept until the on-chain project's founding | no rule needed; nothing in the code deletes a store file | Yes |
| Q10 WAVE-H without Polymarket's own months | H0: one test, TEST only | Yes |

*R1–R10 (`docs/reviews/wave-h-plan-review-2026-11-14.md`)*

| Fix | In rules.md and the code | Test | OK? |
|---|---|---|---|
| R1 two time conventions | H10: the mark at the end of minute m is the row stamped m + 1 min; H9: a funding row's nominal hour is its stamp rounded; `ctxs.ts`, `funding.ts` | `waveh-store` ("takes the row stamped m + 1 min…", "rounds a funding row's stamp…", "charges a settlement at the mark of the row stamped at its hour") | Yes (H10 changes again: section above) |
| R2 the tape: no backstop record, a time-ordered sweep, tape − book measured before Q4 | H8; `tapeAt` leaves out `method` "backstop", sorts by H4's order; `rehearse.ts` prints `tapeMinusBookBps` by side | `waveh-price` (the tape), `waveh-rehearse`; my 3,000 tapes; the rehearsal's own figure: median 0 bps each side (p10 −7.5 and −7.2, p90 +5.8 and +7.4; decisions) | Yes |
| R3 guards against silent holes and changed formats | (i) `tools/waveh-freeze.cjs --data` prints the fill files under 30% of their 24 neighbours' median; (ii) step 1 writes the failing records by day, the counted fills and own legs by month and method, slice 0's episodes a day by month, the missing blocks by day, the coins with a record in SIZING and the positions' SHA-256 before any book is fetched; (iii) H0 and H15 name the defect route; (iv) H2 names it | `waveh-freeze` (the short files), `waveh-rehearse` (step 1), `waveh-look` | Yes for fills; marks and funding are not covered: finding 2 |
| R4 the coupling to MARKET-1's frozen files | `CLOSURE` (ten files, walked), `dist/schedule.js` and `dist/log.js` shared and unfrozen with their hashes logged at each start, lz4js's three files pinned and listed, a statement of what a fix to a frozen program does (H0) | `waveh-freeze` (the compiled imports reach exactly the closure; each closure file equals both freezes; a WAVE-H list's lines carry their hashes) | Yes (finding 5: wording) |
| R5 SIZING by file, a sizing exit past the seal | H1: SIZING = files dated before 2025-08-01 and records before it, in the rehearsal and the look alike; a position whose exit is at or after TEST's start, or whose leg would read a TEST file, is left for the look | `waveh-rehearse` (left for the look), `waveh-look` | Yes, and the builder's other side below |
| R6 the dead sentence on BTC and ETH | gone from H3 | — | Yes |
| R7 the one look's edges | nothing is printed or logged about an outcome before `look/result.json` (the report is computed first, written after); a book file held but not its list's bytes stops (exit 5); the code-defect route after the look is in H15 | `waveh-look` ("stops … a book file held but not its list's bytes"; the report's keys) | Yes |
| R8 a mapping test with real rows | `scripts/waveh-reproduce.ts`, `test/waveh-reproduce.test.ts` (the pre-cut seed in Hyperliquid's shape) | the conversion pinned on made-up rows; the real run needs `WAVEH_PRECUT` | Yes (below: what it proves) |
| R9 say how much burstier the slices are | H5's bracket (the planner's sample days, the old weeks, SIZING's own counts at M and 2M); H13 BY MONTH prints them by month; M DOUBLED beside | `waveh-report` (R9's counts) | Yes; the figures agree with the decisions entry (3.28, 5.70, 5.4%, 3.32, 7.5; 1.49, 3.26, 2.7%, 1.66, 6.6) |
| R10 four small numbers | H9 "stamped 17–69 ms after the hour"; H5 and H13 "3.9% (257 of 6,528)"; the other two (0.3 MB/s, 9,900 lines) are the plan's and the docs' | — | Yes |

*The builder's own calls* (decisions 2026-11-14, WAVE-H-BUILD's two entries)

| Call | My judgment |
|---|---|
| 1 H3 and H6: "tradable at t" needs no test | **Sound.** A counted fill is a fill of its coin at its instant, so the coin exists then; the plan's own mapping row says "the coin has had a fill at or before t". A check that cannot fail is dead code; H3 says so in one sentence. |
| 2 H8, which book files: the hour before's only when x lies within 10 s after its hour's start | **Sound, same outcomes.** A snapshot of an earlier hour is older than 10 s for any later x, so no other file can give a live book. Two labels only: the plan's text would call such a leg "stale", the rule "no snapshot", and fewer files are fetched. Pinned (`bookHours`, `bookAt`; my 20,000 cases). |
| 3 H8, the tape's files: x's hour and the next; a backstop's record never | **Sound** (a fill can sit in its writer's next hour; R2). Pinned. |
| 4 H1 with R5: SIZING by the file's date and the record's time | **Sound.** R5 asked for the file's date; adding the record's time keeps SIZING inside SIZING. The rehearsal found 0 records stamped from TEST's start in its 1,619 SIZING files. |
| WAVE-H-BUILD's Q4, H1's other side of R5: a counted fill of a file dated 2025-08-01 or later that is stamped before it is in neither part | **Sound and needed.** Without it the look's SIZING could differ from the rehearsal's by a fill in TEST's first file, and step 2 would stop at the sealed check; with it, SIZING is the rehearsal's fill for fill. Its cost is that such a fill also takes no part in the wave state of TEST's first hour: at most a fill or two, 0 seen in SIZING's files. One sentence in H1, written clearly, pinned by a test (two fills at TEST's start − 200 and − 100 ms: counted as `early`, no position). |
| 5–9 (first entry): 67 d 10 h; a `tid` of any size kept as digits; lz4js 0.2.0 reads a block checksum from the wrong place, such frames refused; `books.jsonl`; the two settings | **Sound**, each pinned (my 60,000 records include 16-digit and 21-digit ids). |
| Second entry, 1 step 1 always stops; 2 the SIZING line: the sealed outcomes, with every SIZING position whose exit is at or after 2025-07-31 23:00Z priced again; 4 H14 through MARKET-1's `summarize`; 5 the lines on marks by `statOf`; 6 M BY MONTH's window; 7 BY MONTH's R9 counts; 8 LATE; 9 the earlier day on a tie; 10 each leg keeps its source; 11 the gate requires four names; 12 a closure of ten files | **Sound.** 1 is the plan's H15; 2 completes R5's "left for the look" and is pinned in a made-up look with three kinds of SIZING position (priced, left by a sealed tape, left by an exit in TEST); 6, 8 and 9 are pinned by unit tests; 10 is what the Final review needs; 11 and 12 are R4. |
| WAVE-H-BUILD's Q5, the look's heap: 8 GB, a run setting | **Right setting, not in any frozen text:** finding 3. |
| WAVE-H-BUILD's Q6, H10 reads an off-minute row | The section above. |

**2. The mapping and the reproduction.** WAVE-H's counted fill is MARKET-1's M4 on
Hyperliquid's fields: the account's own fill (`liquidation.liquidatedUser` is the
record's `user`, compared lower-case), reducing (`startPosition` non-zero and of the
sign opposite to the side), and a taker's or a backstop's (`crossed`, or `method`
"backstop"); its wave and entries are M5 inside a slice, by MARKET-1's own `waveEntries`
over each slice's counted fills from the first file, in M4's order. I checked the
mapping three ways. (i) 60,000 made-up records, every combination of coin name
(the 38, large coins, builder dexes, spot, wrong case), side, `startPosition`,
`crossed`, the object's presence, its `liquidatedUser` (own, other, checksum case,
absent) and method: the built classifier equals my reading of H4 on every one, and the
counted fill's fields (instant, asset id, lower-case account, forced side, `tid` as
digits, method) are right. (ii) The reproduction's conversion, run on 100,000 made-up
Polymarket rows through the script's own `toLines`, WAVE-H's parser and H4, against
MARKET-1's `isForced`: equal on 98,226; the 1,774 that differ are all one kind, a
liquidation with `taker` false and order id "0", which the pre-cut seed does not hold
(the plan review's recount: all 295 order-id-0 liquidation fills are takers). So the
real-data run (727 = 695 market + 32 backstop counted fills, fill for fill equal to
MARKET-1's; 153 entries on 47 days in 30 coins, 114 forced sells and 39 forced buys,
entry for entry equal to MARKET-1's; 3 of them backstop legs) proves exactly this: *H4,
the slices at M = 1 and `waveEntries` agree with MARKET-1's M4 and M5 on Polymarket's own
rows converted to Hyperliquid's shape.* I did not re-run it (the seed lies under
`F:\polymarket-follow\paper\`, outside my brief) and take its numbers from the decisions
entry and the plan review's independent recount, which reached the same 727, 695, 32 and
153. (iii) What it cannot prove, because the converted rows are made by the same
hand that wrote the mapping, is that Hyperliquid's archive writes an own backstop leg
as `crossed` false with method "backstop". The archive itself answers: the rehearsal
counted 133 backstop fills among SIZING's 425,433, and for every counted fill exactly
one counterparty leg and no leg of any other kind (not reducing, neither crossed nor
backstop, no account) — and H4 counts the own leg whichever way the archive sets
`crossed`. *Not built:* the plan's section 5 also said WAVE-H's statistic path on
MARKET-1's reproduction positions would give +309.7 ± 67.7. R8 and the build brief
asked for the counts and the entries only; the statistic is MARKET-1's frozen
`twoWay`, which MARKET-RULES-REVIEW recomputed, and my own checks of `decide` and
eleven looks cover WAVE-H's plumbing. I would not build it (question 4).

**3. The verdict.** `verdict.ts` does what H12 says, in H12's order: WITHHELD above
10% (`>`, so exactly 10% is not withheld: checked through the real look at 3 of 30),
TOO FEW TO TELL when the two-way error cannot be computed or the priced positions span
fewer than 20 UTC days or fewer than 10 coins, DOES NOT HOLD when m + 2.58·SE < +50
(before HOLDS, so a real effect below the line is DOES NOT HOLD), HOLDS when
m − 2.58·SE > 0 and the mean excess over the priced positions that have one is above
zero, NOT SETTLED otherwise with its sentence (X = m + 2.58·SE). The count of the share
is (unpriced + priced-with-a-depth-short-leg) ÷ the set, a tape-priced leg counting as
priced. My grid of 21,600 combinations with every boundary (10% and 10.00001%, 19 and
20 days, 9 and 10 coins, 50 and 49.99, 0 and 1e-9, the null excess) agrees with the
built function on all; `decide` agrees with my own counts on 300 made-up sets; and
eleven looks through the real program gave the verdict the rules call for each time
(table below). Two things for the rules: when no priced position has an excess, the
code gives NOT SETTLED and H12 does not say so (finding 7); and "the share not at the
book" in H14 is the WITHHELD share, not a count of tape-priced legs (finding 8).

**4. The slices.** `sliceOf` is the address as a 160-bit number modulo M: equal to
Horner's rule over the hex digits on 20,000 random addresses and M in 1–400 (upper-case
addresses included). `bySlice` keeps each slice in H4's order and puts every fill in
one slice. Slice 0 is the one pool (`waveSpots(0, …)` in the rehearsal, the look and
every other line). **M = 147 comes from SIZING alone:** the rehearsal reads only
SIZING's files, the look recomputes it from the files dated before TEST with records
before TEST and stops (exit 5) on a difference; I recomputed `sizing.json`'s own scan
(346 rows, each rate = episodes ÷ M ÷ 67.41666… days, none below 2.84 before the last,
the last the first below) and the choice (147: 0.017 from 5.68; 146: 0.035; 148:
0.032), and my own scan and choice equal the built `scanM` on 200 made-up worlds, ties
to the larger M included. M cannot be moved by H10's change (it reads no mark).

**5. The pricing.** *The book:* the coin's last snapshot at or before x in x's hour's
file, the hour before's only in the first 10 seconds of x's hour, live within 10 s,
usable; my reference of H8 equals `lastAtOrBefore` with `bookAt` on 20,000 made-up cases
(ties in time, snapshots at exactly x − 10,000 and x − 10,001 ms, absent files, files
with no snapshot at or before x, bids above asks), reasons included. *The tape:*
`crossed` records on our side in [x, x + 60 s) of the fill files of x's hour and the
next, no backstop record, each fill once, in H4's order, walked as levels by MARKET-1's
walks: equal to my filter on 3,000 made-up tapes. *The walks and the net:* equal to my
own walks, fees, funding and gross on marks on 4,000 made-up positions (book and tape
legs mixed, depth short, funding hours without a row); the fee is 4.5 bps of each
leg's notional (`FEE = 0.00045`, the exit's notional p_out × Q), funding is
−dir × Σ rate × the mark at the end of the minute before each settlement in
(x_in, x_out] × Q, longs paying a positive rate; the settled rows are Hyperliquid's
`fundingHistory` with the nominal hour the stamp rounded. *The heap:* finding 3.

**6. The seal.** *Every read of a store file goes through one function*
(`readStoreFile`, `store.ts`), whose first act is `checkSealed`: no file is opened,
hashed or even looked for before the key's date is known, and a key whose date does not
parse is refused. I listed every file read in `src/waveh` (`out/file-reads.txt`): the others are our own files (coins, sizing, data list, book list,
manifest, the rehearsal's sealed outcomes after their hash, the freeze). *Dates:* hour
files by their hour, `asset_ctxs` by their day, funding windows by their start, books
by their hour; the rehearsal bounds every record and mark at TEST's start; the look's
bound is DATA END. With the gate closed, five kinds of TEST key (fills, a mark day, a
book, a funding window, an undated name) are refused (`out/verify-final.txt`); the
tests refuse a sealed file that exists, differs, or does not exist, with the
seal's error and not the file's own. *The gate opens only from `waveh/FROZEN.sha256`:*
the built program's `look` with no list exits 4 after one log line
("frozen files differ") and creates only its log; with a made-up final list the gate
accepts the files as listed and refuses a changed file of every kind (the program, a
closure file, `research/`, `waveh/rules.md`, `sizing.json`, `data.sha256`, lz4js) and
an unlisted one. *`data.sha256` is required by name*, with `rules.md`, `coins.json` and
`sizing.json` (`WAVEH_FILES`): a list without one is refused (exit 4) and
`--final` refuses without the last two. *The look runs once, and writes nothing about
an outcome before its result.* Step 1 writes `books-needed.txt` and `step1.json`
(counts of fills and the positions' hash: no price, no outcome) and stops; step 2
refuses a second time (`result.json` exists: exit 5), computes the report and every
number first, writes `result.json`, logs the verdict, and only then writes the
positions and the report; the log lines before the result hold file counts and the
heap. Two notes that are not findings: the look takes no lock, so two step-2 runs
started at once could both pass the "already run" test (the look is run by hand, once);
and a crash between `result.json` and `report.json` would leave a look with no report
(the numbers are already computed, only their serialisation is left).

## What I ran, in short

In scratch copies of `git archive HEAD` (each `node_modules` a real folder of junctions;
vitest run directly): the build (`tsc -p tsconfig.build.json`, exit 0), the typecheck
(`tsc -p tsconfig.json`, exit 0), and `vitest run test/waveh-`: 10 files, 113 tests
passed and 3 skipped (the two real-data reproductions and the freeze test of the final
list, which does not exist yet), exit 0 (`out/vitest-waveh.txt`). The draft list equals
a clean build of HEAD, line for line, 71 of 71, its SHA-256 `4c08ef95…9056`
(`out/check-draft.txt`); MARKET-1's list (64) and the paper experiment's (61) verify
against the same build. The built program, run against made-up folders: `look` without a
list exits 4 after one log line and creates only its log; `rehearse` against a store
that does not exist exits 1 (a missing manifest: a crash rather than a refused setting).
The freeze day, in a scratch git repository: the tool refuses `--final` without
`data.sha256`; with a made-up one it wrote a list of 72 files, and the built gate accepted
it and refused every change and every unlisted file I tried (`out/verify-final.txt`).
I did not run lint or format: `pnpm verify`'s other steps are the code review's.

*Independent recomputation* (my own code, from the text of the rules, against the built
functions; made-up numbers only; `scripts/zz-review-pure.test.ts`, all 12 tests pass):

| What | Cases | Result |
|---|---|---|
| H4 the counted fill | 60,000 records over every combination of coin name, side, `startPosition`, `crossed`, the object, its `liquidatedUser` (own, other, checksum case, absent), method, `tid` of 1 to 21 digits | 0 differences |
| H5 `slice(a)` | 20,000 addresses (both cases), M in 1–400, by Horner's rule on the hex digits | 0 |
| H6 entries (M5 inside a slice) | 600 worlds with ties in the millisecond, gaps of exactly 60 minutes, ids above 2^53 | 0 |
| H5 the scan of M and its choice | 200 worlds, ties to the larger M | 0 |
| H8 the book at x, reasons included | 20,000 cases: snapshots at x − 10,001 … x + 540 ms, ties in time, files absent or sparse, bids above asks | 0 |
| H8 the tape | 3,000 tapes: window ends, dedupe, backstop records, order | 0 |
| H8–H9 the price of a position | 4,000 positions, book and tape legs mixed, depth short and not, funding with hours missing: gross, fees, funding, net, gross on marks, excess, cost at the book | 0 (to 1e−6 bps) |
| H12 the verdict | a grid of 21,600 combinations with every boundary | 0 |
| H10 BASE | one coin, six cells, 2% of minutes without a mark | 0 |
| H11–H12 `decide` | 300 sets: unpriced, depth short, excess, days, coins | 0 |
| the reproduction's mapping (`zz-review-repro.test.ts`) | 100,000 made-up Polymarket rows through the script's `toLines`, WAVE-H's parser and H4, against MARKET-1's `isForced` | 98,226 equal; the 1,774 others are one kind (a liquidation with `taker` false and order id 0), absent from the seed |
| H10 as decided (`zz-review-h10.test.ts`, in `copy-h10`) | 3,000 made-up day files against my reference of the rule; the `:20` stretch | 0 differences; red on HEAD (60 rows failing; "funding without a mark") |

*Made-up looks* through the real `rehearse` and `look` (`scripts/zz-review-looks.test.ts`,
11 tests; a store of every fill file to DATA END, a SIZING wave for M = 1, 12 coins,
a position a day, books written at x − 2 s by a formula, marks by a formula with a drift
and a step, 24 hourly funding rows at 0.00001; every expected number computed by my own
arithmetic from the formulas, BASE and the excess included; `out/zz-looks-2.txt`):

| World | Mean net ± SE (bps) | Mean excess | Days, coins | Unpriced, short | Verdict |
|---|---|---|---|---|---|
| an effect of about +250 bps, a step in the marks | +235.94 ± 3.99 | +203.11 | 24, 12 | 0, 0 | **HOLDS** |
| the same books, the marks only drift and then fall | +236.11 ± 3.99 | −135.41 | 24, 12 | 0, 0 | **NOT SETTLED** (F1: the excess is not above zero) |
| a real but small effect (+40 bps gross) | +28.26 ± 0.67 | +202.50 | 24, 12 | 0, 0 | **DOES NOT HOLD** |
| a noisy +100 | +68.49 ± 53.22 | +202.50 | 24, 12 | 0, 0 | **NOT SETTLED**, "No mean result as large as 205.8 bps a position was seen." |
| the effect, 19 days | +236.84 ± 4.42 | +202.50 | 19, 12 | 0, 0 | **TOO FEW TO TELL** |
| the effect, 9 coins | +236.92 ± 3.99 | +202.50 | 24, 9 | 0, 0 | **TOO FEW TO TELL** |
| the effect, 3 of 24 unpriced (12.5%) | +238.42 ± 4.40 | +202.50 | 21, 11 | 3, 0 | **WITHHELD** |
| the effect, 3 of 30 unpriced (exactly 10%) | +238.64 ± 3.77 | +202.50 | 27, 12 | 3, 0 | **HOLDS** |
| the effect, 4 of 30 unpriced (13.3%) | +238.19 ± 3.89 | +202.50 | 26, 11 | 4, 0 | **WITHHELD** |
| the effect, 4 of 30 with a depth-short leg (13.3%) | +237.42 ± 3.50 | +202.50 | 30, 12 | 0, 4 | **WITHHELD** |
| the effect, every entry priced from the tape (no book file) | +236.93 ± 3.99 | +202.50 | 24, 12 | 0, 0 | **HOLDS** |

The look's assembly (the days and coins it feeds the verdict, the excess, the
shares, the sentence) is therefore pinned end to end only by these worlds: the
repository's own look test has one position and ends TOO FEW TO TELL (the
verdict's own function is pinned in `waveh-price`). Section "Deliberate breaks"
says what that leaves open.

### Deliberate breaks

**93 breaks of WAVE-H's own source** (`scripts/breaks-list.mjs`; results in
`out/breaks1.jsonl`, `breaks2.jsonl`, `breaks3.jsonl`). Each ran in one of three
scratch copies of the pristine tree: the find text matches exactly once (a dry run
first: 93 of 93), the file is changed, the tests of its area (2–4 of the 10 test files,
1 to 60 s) run directly (vitest, never pnpm), the file is restored; a failing test or a
crash counts as killed. They aim at the constants and branches that decide: the counted
fill (case of the account, reducing, "or backstop", a 16-digit id), M's scan (the stop,
the target, the tie), the book (the 10 s, the first 10 s of the hour, the later line on a
tie), the tape (60 s, both ends, side, backstop, each fill once, order), the fee, funding's
sign, the walks' sides, the verdict (z, 10%, order, each boundary, the sentence), the
pass (1%, 10 records, the bound, builder fees, each fill once), the formats' switch
hour, the seal (the date, an undated key, the lists' names, an unlisted file), R1's
index and "first kept", funding's nominal hour, the look (M held, the positions' hash,
slice 0, R5's other side, the late positions, "already run", the sealed hash, what feeds
the verdict) and the lines beside (the 68 days, LATE's delay, M halved and doubled, the
late coins, the book and the tape).

**The repository's own tests killed 80 of the 93**, none by a time limit, each with at
least one named failing test. **13 survived them.** My own checks (stage 2: the 12 pure
checks and three of my looks, `out/stage2*.jsonl`) kill 4 of those 13; 9 survive
everything. None is a defect of HEAD; each is a test the fix round can add.

| Break | What it would let through | Repository's tests | My checks |
|---|---|---|---|
| `c16` the price keeps `open.short` only | a position whose *exit* leg is short of depth would not count toward WITHHELD | survives | **killed** (4 of 30 depth short; the price check) |
| `d10` depth-short counted over the whole set | an unpriced position with a short leg counted twice in the WITHHELD share | survives | **killed** (`decide`) |
| `k09` the look feeds `t = 0` to the verdict | every position on one day: TOO FEW TO TELL | survives (its test has one position) | **killed** (every look of 20 days or more) |
| `k10` the look feeds `iid = 0` | every position in one coin: TOO FEW TO TELL | survives (the same) | **killed** |
| `i03` a `mark_px` of 0 is read | a zero mark | survives | survives |
| `i05` a funding row stamped exactly at the bound is read | the seal's edge for funding rows (real rows are stamped 17–69 ms after the hour) | survives | survives |
| `j03` a SIZING position with x_out exactly at TEST's start is priced in the rehearsal | it would ask for a sealed key and be refused (a crash, not a leak) | survives | survives |
| `j04` the hour before is not read when x's own file is absent from the archive | a leg in the first 10 s of an hour whose file the archive lacks would use the tape, not the last snapshot of the hour before | survives | survives |
| `j08`, `n01` the days divisor of M's scan at the rehearsal's and at the look's call | a wrong M; the look's step 1 would stop (exit 5) on a difference with `sizing.json` | survive | survive |
| `k07` SIZING's late positions get a BASE | the SIZING line's excess print has a subset | survives | survives |
| `l02` the busiest day's tie goes to the later day | a print | survives | survives |
| `l04` "above zero" reads `≥ 0` | a print | survives | survives |

The look's assembly is the case MARKET-RULES-REVIEW met in MARKET-1 (its finding 2):
what `look()` feeds the verdict (`k09`, `k10`) is pinned by no repository test, only by my
looks. It is the same cheap cure: a look of 20 days and 10 coins in the repository's
look test, which also gives the HOLDS and the DOES NOT HOLD their one end-to-end proof
(`scripts/zz-review-looks.test.ts` is a working start).


## Rule by rule

| Rule | Code | Test | Agrees? |
|---|---|---|---|
| H0 identity, what is frozen, the gate, the seal, the defect route | `gate.ts` (`FROZEN_SCOPE`, `CLOSURE`, `LZ4JS_FILES`, `WAVEH_FILES`, `verifyFreeze`, `frozenFiles`, `checkSealed`, `keyDate`), `waveh.ts` (the look verifies first), `lz4.ts` (pinned hashes), `tools/waveh-freeze.cjs` | `waveh-store` (the list, each refusal, the seal by key), `waveh-freeze` (the closure walked; the lines equal both freezes), `waveh-look` (a closed gate refuses before anything), `waveh-entry`; mine: the freeze day end to end, five closed-gate refusals, the built program's exit 4 | Yes, with notes (findings 4, 5) |
| H1 instants, SIZING and TEST, the two sides of R5 | `instants.ts`; `store.ts` `fillKeys`, `FORMAT_SWITCH`; `rehearse.ts` `boundOf`, `sizingPass`; `look.ts` (`sizingFile`, the early drop, `late`) | `waveh-store` (the 1,507 + 112 + 7,200 + 24 + 2 file names), `waveh-rehearse`, `waveh-look` (a record stamped from TEST's start in a SIZING file; two early fills in TEST's first file; a SIZING position left by a sealed tape and one left by an exit in TEST) | Yes |
| H2 who, their fills, the store's files | `fills.ts`, `pass.ts`, `store.ts`, `lz4.ts` | `waveh-rules` (the schema), `waveh-rehearse` (both formats once; 1% and 10 stop; blocks), `waveh-store` (hash first, one frame) | Yes; marks and funding lie outside it (finding 2) |
| H3 the coins | `coins.ts`, `waveh/coins.json` | `waveh-rules` (the 38 in M3's order, names exact) | Yes |
| H4 a counted fill | `fills.ts` `legKind`, `countedOf` | `waveh-rules`, `waveh-reproduce`; mine: 60,000 records, 100,000 rows | Yes |
| H5 the slices, M | `slices.ts`; `rehearse.ts` `burstiness`; `waveh/sizing.json` | `waveh-rules` (scan, stop, tie), `waveh-rehearse`, `waveh-report` (R9's counts); mine: 200 worlds and `sizing.json`'s own scan | Yes |
| H6 the wave and an entry inside a slice | `positions.ts` `waveSpots`; MARKET-1's `waveEntries` | `waveh-price` (positions), `waveh-rules` (two accounts of one slice), `waveh-reproduce` (153 entries); mine: 600 worlds | Yes |
| H7 the position | `positions.ts`; MARKET-1's `ENTRY_DELAY_MS`, `HOLD_MS`, `NOTIONAL` | `waveh-price` | Yes |
| H8 the price as a taker: the book, then the tape | `books.ts`, `price.ts` `bookAt`, `tapeAt`, `rehearse.ts` `bookFound`, `readTapes` | `waveh-price`, `waveh-store`, `waveh-rehearse`, `waveh-look`; mine: 20,000 and 3,000 cases | Yes, with a note (finding 6) |
| H9 fees, funding, the net | `price.ts` `pricePosition`, `funding.ts` | `waveh-price` (hand computations), `waveh-store`, `waveh-look` (the net by hand); mine: 4,000 positions | Yes |
| H10 the marks, the market object, BASE | `ctxs.ts`, `market.ts`, `report.ts` `markAt`; MARKET-1's `baseOf` | `waveh-store`, `waveh-report` (BASE); mine: BASE, and the decided rule in `copy-h10` | **Differs from the decision** (not yet built: finding 1); BASE agrees |
| H11 the statistic | `verdict.ts` `decide`; MARKET-1's `twoWay` | `waveh-price`, `waveh-look`; mine: `decide` on 300 sets, 11 looks | Yes |
| H12 the verdict, its order, its sentence | `verdict.ts` `verdict`, `sentence` | `waveh-price` (every branch and boundary), `waveh-look` (TOO FEW only); mine: the grid, 11 looks | Yes, with a note (finding 7) |
| H13 the lines beside | `report.ts` `linesBeside`, `marksLine`, `dayMost`, `monthM`, `monthWindow`, `testMonths`; `look.ts` | `waveh-report` (each line by hand), `waveh-look` (the report's keys and counts) | Yes |
| H14 the prints | `report.ts` `netLine`, `asPosition`; `look.ts` `prints`; MARKET-1's `summarize`, `tailOf` | `waveh-report`, `waveh-look` | Yes, with a note (finding 8) |
| H15 the one look and its runs | `look.ts`, `waveh.ts`, `rehearse.ts` | `waveh-look`, `waveh-rehearse` (step 1), `waveh-entry`; mine: 11 looks, the built program | Yes, with notes (findings 2, 3) |

**Counts: agrees 9** (H1, H3, H4, H5, H6, H7, H9, H11, H13), **agrees with notes 6**
(H0, H2, H8, H12, H14, H15), **differs 1** (H10: the decided change is not yet built).

**By the repository's own tests** (the 93 breaks above): **fully pinned 6** (H0, H2, H3, H4,
H6, H7: no break of the area survives; H3 by its test alone), **partly 10** (H1, H5, H8, H9,
H10, H11, H12, H13, H14, H15), **none 0**. "Pinned" means a test asserts the rule's
behaviour and my breaks of it die. With my own checks added, nine items stay open, all
boundaries, wiring or prints (the table of survivors): a zero mark, two bound edges, the
hour-before's wiring, the divisor at two calls of M's scan, two prints and SIZING's BASE.

## What I could not check

The real archive and the test months (sealed, and not mine to open): the real shape of
the book, mark and funding files beyond what the plan, the planner's samples and the
builder's rehearsal report; the real number of WAVE-H's positions (the plan's guide is
about 870) and of legs in a hole; the real peak of the heap and the run's hours. The
two real-data runs: the reproduction on the old weeks (its seed lies outside my brief)
and the rehearsal on SIZING (its store and sealed outcomes do too): I took their counts
from `sizing.json` and the decisions entries and checked every figure of `sizing.json` I
could against itself. `waveh/data.sha256` does not exist yet, nor R3 (i)'s list of
short files (it needs the download's manifest): the freeze day's step is simulated, not
run. Lint and format (`pnpm verify`'s last two steps) and the code's quality:
WAVE-H-CODE-REVIEW's. The download tool (D1–D8 of the plan review): the supervisor
read it. MARKET-1's and the paper experiment's frozen code: their own reviews.

## For the fix round and the freeze day (from this review)

1. **The fixes, in one commit with whatever WAVE-H-CODE-REVIEW asks**, so the list is
   written once: finding 1 (H10, code, the failing-first tests and breaks), finding 2
   (step 1 for marks and funding, with its tests), findings 3, 5, 6, 7, 8 (a few
   sentences of `rules.md`, the header of `waveh.ts`), the docs of finding 9.
2. `pnpm verify`; the rehearsal a third time with its checklist (section "H10");
   `sizing.json` (M must stay 147) and the draft list again.
3. A short read of the changed lines by the supervisor, as decided a fix-check by a fresh
   worker, not another full review.
4. When the test months are stored: `node tools/waveh-freeze.cjs --data <manifest>` (with
   finding 4's checks), read R3 (i)'s list (sizes only; the one name the plan expects is
   `node_fills_by_block/hourly/20250727/8.lz4`, the hour both formats share).
5. `pnpm verify` on a clean tree, `node tools/waveh-freeze.cjs --final`, commit, tag
   `waveh-freeze-1`; the list's SHA-256 and the tag in decisions before the look.
6. The look, by hand, once: `node --max-old-space-size=8192 dist/waveh.js look` at idle,
   never in 02:30–06:00Z or 10:25–11:15Z (the program waits them out); read step 1's counts
   (fills, marks, funding) before the books are fetched; the book fetch on the
   supervisor's go; then step 2.

## Questions, each with my recommendation

1. **Two rows of one stamp (finding 1).** The first line stands, or the later one?
   *Recommendation: the first, as now:* it keeps the repository's test and the ruling's
   "a row stamped on a boundary is read exactly as now".
2. **Step 1 for marks and funding (finding 2).** Add it? *Recommendation: yes.* It is
   about forty lines and one test file, it changes no number of the verdict, and it is
   the only way the one look hears of a data defect before the verdict is written.
3. **The 8 GB heap (finding 3).** In H15 and the header of `waveh.ts`? *Recommendation:
   yes,* in the same commit.
4. **The plan's second reproduction figure** (+309.7 ± 67.7 through WAVE-H's statistic
   path). *Recommendation: do not build it:* R8 and the brief did not ask, the statistic
   is MARKET-1's frozen `twoWay`, and the made-up looks pin the plumbing.
5. **The tape of every leg.** `look()` reads the tape of all legs, about 3 hours more
   in step 2 than reading only the legs the book does not price, and a fault in a tape
   file stops a look whose book prices the leg. *Recommendation: only the legs the book
   does not price,* if the round touches `look.ts` for finding 2 anyway; otherwise leave
   it (WAVE-H-CODE-REVIEW's to say).
6. **A lock for the look.** Three lines make a second step 2 refuse for certain.
   *Recommendation: leave it;* the look is run by hand, once, by the supervisor.

## Slips, all of them

My first made-up looks ran as a nested background job that ended with its parent: I
re-ran them as a direct background job. The first batch of deliberate breaks in the
second scratch copy ran before that copy had a build, so the three results of it that
the freeze test killed by a missing `dist` were thrown away, the copy restored from
the pristine tree and the batch run again. A first listing of the whole temporary
folder, to look for leftovers of my runs, printed thousands of lines of the builders'
old test folders: read, nothing touched. My first version of the book check made 6,000
snapshots a case and was far too slow, and the first run of the price check hit
vitest's default limit of 5 s: both rewritten. My first draft of this page said a verdict
grid of 54,000 combinations; it is 21,600. None of these touched a figure in this report.

## Evidence

All in `workers/WAVE-H-RULES-REVIEW/`. Scripts (`scripts/`) and what they wrote (`out/`):
`make-junctions.ps1` (a real `node_modules` folder of per-package junctions);
`check-draft.mjs` → `out/check-draft.txt`; `zz-review-pure.test.ts` →
`out/zz-pure-3.txt` (and three more seeds, all 12 tests pass each); `zz-review-looks.test.ts`
→ `out/zz-looks-2.txt`; `zz-review-h10.test.ts` → `out/h10-unpatched.txt` (red) and
`out/h10-patched.txt` (green), `out/h10-waveh-tests.txt` (the repository's 113 tests
against the change); `zz-review-repro.test.ts` → `out/zz-repro.txt`; `verify-final.mjs`
→ `out/verify-final.txt`; `number-diff.mjs` (the numbers of the plan's section 1 against
`rules.md`: none changed); `breaks-list.mjs`, `run-breaks.mjs`, `run-stage2.mjs` →
`out/breaks*.jsonl`, `out/stage2*.jsonl`; `out/file-reads.txt` (every file read in `src/waveh`);
`out/vitest-waveh.txt`, `out/tsc-build.txt`, `out/tsc-typecheck.txt`. Every script reads
the repository's source in a scratch copy and writes nothing in the repository; the
numbers in them are made up. `progress.md` holds the log.
