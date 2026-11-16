# WAVE-H-FIX-CHECK — a fresh second read of WAVE-H's fixes, before its freeze

WAVE-H-FIX-CHECK (Sonnet 5.5, max; the fixer, WAVE-H-FIX, was Opus), 2026-11-16
07:27Z – 08:20Z (UTC; every stamp from `date -u`), for polymarket-follow's
supervisor. Under review: WAVE-H-FIX's 22 commits `875b9b6` … `f396a8d` (the
diff `1de1010..f396a8d`; the program's last source change is `a186e8c`,
`1987b1c` adds a test), the draft freeze list written after them (`c677d17`)
and the supervisor's records after it (`6d68eeb`, HEAD), against the two fresh
reviews
(`docs/reviews/wave-h-rules-review-2026-11-16.md`,
`docs/reviews/wave-h-code-review-2026-11-16.md`) and the supervisor's 12
calls (decisions 2026-11-16, "the supervisor — WAVE-H's two fresh reviews:
the calls", with the answer to Q1 and Q-A). **A review decides nothing:** the
supervisor and the owner answer. Nothing in the repository was edited but this
report. Evidence: the supervisor folder `workers/WAVE-H-FIX-CHECK/`
(`progress.md`, `scripts/`, `out/`; named in "Evidence").

**The limits held.** Under `F:\polymarket-follow-research\` I opened only the
six run files of the brief's step 4 (`counts.json`, `report.json`,
`sizing.json` in `rehearsal\` and in `rehearsal-run2\`) and the store's
`manifest.jsonl` (metadata: key, size, hash; no data file). I opened no
test-month file, not the sealed outcomes file, nothing of the collector's
recordings or database, the run folder, or the paper experiment's or
MARKET-1's data. I ran `dist/waveh.js`, `tools/waveh-fetch.cjs` and
`tools/waveh-freeze.cjs` on no real path (the freeze tool and the built
program ran only in scratch copies, on made-up folders). No network call, no
deploy, no Task Scheduler, no agent; polymarket-lab not touched. The only
`pnpm` run was `pnpm verify` in the repository (its `dist` is git-ignored);
every build, test and deliberate break ran in scratch copies of `git archive`
(each `node_modules` a real folder of per-package junctions; vitest and tsc
run directly, never pnpm; nothing deleted recursively). In the supervisor
folder I wrote only in `workers/WAVE-H-FIX-CHECK/`, and read WAVE-H-FIX's
`progress.md` and WAVE-H-RULES-REVIEW's `make-junctions.ps1`.

## For the owner, in one page

*Words.* The **freeze** locks the rules and the program by a fingerprint (a
hash); afterwards a mistake can only be put right by a recorded defect fix and
a new fingerprint. The **look** is the one run of the finished program on
Hyperliquid's ten test months. A **fix-check** is this: a second, fresh reader
goes over the repairs made after two earlier reviews. A **deliberate break**
is a small damage I make in a throw-away copy of the code (a wrong limit, a
removed guard) to see whether a test notices; one that no test notices is a
**survivor**. A **pin** is a test that fixes one value or guard.

**Verdict: ready to freeze after these small fixes.** None of them touches the
program's code, a number, the statistic, the data or the budget. They are one
sentence of the rules that is a little shorter than what the program does
(two more are optional) and two small tests that pin what no test pins yet;
the draft freeze list is written again after the sentence changes, and no
rehearsal is needed.

**What I found, in plain words.**

1. **Every repair is in and has its test.** Of the two reviews' 24 findings,
   23 are built as the supervisor ruled; the 24th (a rehearsal overwrites its
   own sealed outcomes, and nothing locks two runs) was ruled to stay and is
   still sound, as are the other things ruled to stay (the tape read for
   every leg, the one global "seen" set, the plan's +309.7 figure). Where a
   repair is a sentence of the rules, I read it against the code.
2. **The program still does the same sums.** I ran the program as it was
   before the repairs and as it is now on two invented stores (a small one
   with one deciding position, and one of 24 positions in 12 coins ending
   HOLDS): the sealed SIZING outcomes
   byte for byte, every position with its legs, prices, funding and excess,
   the verdict, the report and the positions' fingerprint are equal. The new
   program adds counts and nothing else.
3. **The look's first step now looks at the marks and the funding.** Its
   counts agree with a second count I made from the rules' text on invented
   data, and every one of the 370 mark days and 760 funding windows, taken
   out of the list one at a time, stops the look's first step before any
   file is read.
4. **The third rehearsal held every number that had to stay**, and moved the
   three that had to move to the extent the data allows: failing mark rows
   2,831 → 0, the 2,831 off-minute rows now read, `twice` 0 → 1,777. Two
   things the plan expected to move did not (the 7 positions "funding without
   a mark" and the sealed outcomes' fingerprint): as the supervisor ruled,
   their cause is two real holes in the archive's marks, which the rules
   already treat the way the code does (unpriced and counted, 2.4% of SIZING
   against a 10% limit).
5. **The lists.** The draft freeze list (74 files) equals a fresh build file
   for file; it covers every file that runs and names `data.sha256`, whose
   9,975 lines equal the download's manifest line for line and the keys the
   program asks for exactly. MARKET-1's 64 files and the paper experiment's
   61 still verify. I ran the freeze day in a scratch copy: the freeze tool
   refused a dirty tree and a missing `data.sha256`, wrote a final list of 74
   files equal to the draft's line for line, and the program's own gate
   accepted that list and refused a changed or an unlisted file of every kind
   I tried.
6. **The break spot-check.** I made 28 deliberate breaks in a scratch copy:
   25 were caught by a failing test of the repository's 133 WAVE-H tests (none
   only by a time limit); 3 were not. Two are the ones the fixer named: `r03`,
   the flush before a rename, which only a mock can see (I would leave it),
   and `t04`, the freeze tool's main not calling its count check, which the
   fixer calls out of a test's reach and a 25-line test reaches. The third,
   `n_exitwire`, is the program ignoring its own exit-code function. My own
   small tests catch all three.

**What is small and should change first** (details below): one sentence of
H15 (step 2) is short of what the code checks; two more sentences (H10's
bound, H8's coin) are optional exactness; the freeze tool's main and the
program's exit wiring are pinned by no test, and the fixer's claim that the
first is "out of a test's reach" does not hold (a 25-line test reaches it).

**What you decide:** nothing new for the owner; the supervisor's three
questions are at the end, each with my recommendation.

---

## Verdict

**READY TO FREEZE AFTER THESE SMALL FIXES.** No high and no medium finding;
five low (F1–F5) and one note (F6), of which F1 is the one the rules need and
F2–F3 are optional wording. Nothing found changes the design, the statistic,
the data or the budget; no code of the program has to change (so `dist/` and
the frozen code stay as they are), only `waveh/rules.md` (one sentence, two
optional), tests (outside the freeze list) and the draft list written again.
Every claim in the supervisor's and the fixer's records that I could check, I
checked and found true, except one: that `t04` is out of a test's reach (F4).

**The order I would take:** (1) the rules sentence F1 (and F2–F3 in the same
commit): the only change that must come before the freeze, because
`waveh/rules.md` is hashed in the list; (2) the tests F4 and F5 (my files are
ready: `zz-check-tool.test.ts`, `zz-check-exit.test.ts`; F6 optional): they lie
outside the freeze list (`gate.ts` `FROZEN_SCOPE`), so they can go in before or
after the freeze and change no hash; (3) `pnpm verify`; the draft list again
(`node tools/waveh-freeze.cjs`: only `waveh/rules.md`'s line and the head
change; its 73 other lines stay); (4) the supervisor's short read of the
changed sentences; (5) the freeze day as decided.

## Findings of the two reviews and the calls, one row each

*Status:* **fixed** = built as ruled, in the commit named, pinned by the test
named (or, for a sentence, read against the code); **kept** = ruled to stay
as it was, and still sound. "My check" names what I did beyond reading; the
breaks are in the section after.

R1–R10 are the rules review's findings 1–10 and RQ1–RQ6 its questions; M1–M2
and L1–L12 are the code review's findings and CQ1–CQ5 its questions.

### The rules review (findings 1–10, questions Q1–Q6)

| # | Finding (short) | Call | Fixed in | Pinned by | My check | Status |
|---|---|---|---|---|---|---|
| R1 | H10's two clauses (tie, form); nothing pinned | 1 | `6fccbfd` (`ctxs.ts`, H10) | `waveh-store`: the row stamped m + 1 min; off-minute rows, latest stamp, first line of equal stamps, a fraction, a mark of 0, the bound; the `:20` stretch priced through the kit; the 300-file reference | my reference from the text: 4,000 made-up worlds × 38 coins, 0 differences; breaks `n_idx`, `n_tie`, `n_off`, `n_nocoin` | fixed |
| R2 | step 1 reads fills only | 2 | `a3f27f2` (`market.ts`, `look.ts`, `keys.ts`; H2, H9, H10, H15) | `waveh-rehearse`: counts by day/coin/window, the 1% day rule, a missing day or window stops before any read; `waveh-look` step 1; `waveh-store`: the funding grid's contract with the fetch tool | my independent count; all 370 days and 760 windows removed one at a time; breaks `n_fundkeys`, `n_pct`, `n_least`, `n_byday` | fixed |
| R3 | the 8 GB heap in no frozen text | 7 | `c1c82d6` | text only | `waveh.ts:3-7` and `rules.md:453-455` read | fixed |
| R4 | `--data` writes without checking | 6 | `875b9b6`, `708a0d4` | `waveh-freeze`: a repeated key, `DATA_COUNTS` pinned to `fillKeys`, a torn line | `data.sha256` = the manifest, line for line (below); `n_counts` | fixed (main's call of the check unpinned: F4) |
| R5 | H0 wording | 8 | `c943446` | text only | read against `gate.ts`, `waveh.ts`, `run.ts` | fixed |
| R6 | H8's failing book lines were not counted | 5 | `42d136f` | `waveh-rehearse` / `waveh-look`: `bookLines` (files, lines, failed, files with one) | `n_booklines` | fixed (F3: the wording) |
| R7 | H12 silent when no priced position has an excess | 8 | `c943446` (text; code unchanged) | `waveh-price.test.ts:402`: `meanExcess: null` gives NOT SETTLED | read | fixed |
| R8 | H14's two readings | 8 | `c943446` | `waveh-look`: the SIZING lines have no excess | read | fixed |
| R9 | docs out of step | 8, 12 | `70cdda5`, `1d49ebb`, `f396a8d` | — | grep of the living docs: no "4096", "4 GB", "71 files", "M not yet written" | fixed |
| R10 | 13 surviving breaks | 9 | `0f6596f`, `1987b1c`, `40c66fe`, `9299b4e` | see call 9 | `c16`, `k09`, `k10`, `b67`, `j04`, `b37`, `k07`, `b39`, `b40`, `b42`, `l03` killed (below) | fixed as ruled (`d10`, `i05`, `j03`, `j08`, `n01` left unpinned by the ruling) |
| RQ1 | a tie of two rows of one stamp | 1 | `6fccbfd` | the tie test | `n_tie` | fixed (first line) |
| RQ2 | step 1 for marks and funding | 2 | `a3f27f2` | as R2 | as R2 | fixed |
| RQ3 | the 8 GB heap | 7 | `c1c82d6` | text | read | fixed |
| RQ4 | the +309.7 figure | 11 | — | — | R8 and the brief did not ask; the statistic is MARKET-1's frozen `twoWay` | kept, sound |
| RQ5 | the tape of every leg | 11 | — | — | it gives R2's tape − book (median 0 bps each side in all three runs); costs hours, no wrong number | kept, sound |
| RQ6 | a lock for the look | 11 | — | — | the supervisor runs each command by hand, once; the recovery rule (M1 below) is the one procedural change | kept, sound |

### The code review (M1–M2, L1–L12, notes, Q1–Q5)

| # | Finding (short) | Call | Fixed in | Pinned by | My check | Status |
|---|---|---|---|---|---|---|
| M1 | a failed write after `result.json` strands the look | 3 | `a4f1558` (`run.ts` `writeWhole` a copy of MARKET-1's behaviour; payloads built before the result; H15's recovery rule) | `waveh-look`: the files at the "result" event; a failure at the report, `result.json` moved aside, step 2 again, the same result; the retries (10 tries, 9 pauses; held file) | `writeWhole` read against `market1/run.ts:108-132`: same behaviour; breaks `b24`, `n_retry`; `r03` (F6) | fixed |
| M2 | marks and funding first read in step 2 | 2 | `a3f27f2` | as R2 | as R2 | fixed |
| L1 | step 2's cheap refusals after hours of work | 4 | `1c177f2` | `waveh-look`: the refusals test counts `pace` (0 before the recompute, one step 1's worth after) | `n_order` killed: "expected 9215 to be +0" | fixed |
| L2 | failing book lines; a cell-less mark row | 5 | `42d136f` | as R6; `waveh-store`: a row without a coin cell counts failing | `n_nocoin`, `n_booklines` | fixed |
| L3 (a) | exit codes 4, 5 | 9 | `40c66fe` (`exitOf` in `run.ts`) | `waveh-entry`: every case | `b40` | fixed (the catch's wiring unpinned: F5) |
| L3 (b) | `--final`'s refusals | 9 | `9299b4e` (`finalRefusal`) | `waveh-freeze` | `b42`; the freeze day in a scratch repository | fixed |
| L3 (c) | the previous hour's book glue | 9 | `0f6596f` | `waveh-rehearse`: the hour before's book in an hour's first 10 s, both cases | `j04`, `b37` | fixed |
| L3 (d) | a sealed SIZING file one position short | 9 | `0f6596f` | `waveh-look` | `b39` | fixed |
| L3 (e) | a tape record of size or price 0 | 9 | `0f6596f` | `waveh-price` | `b67` | fixed |
| L3 (f) | four print lines | 9 | `0f6596f` | `waveh-report` (the lower bound, the five busiest days, the quarter-hours, the tie, "above zero"), `waveh-look` (SIZING without BASE) | `k07` killed; the other pins I read (exact values), not re-broken | fixed |
| L4 | `--data` accepts a duplicate key | 6 | `875b9b6` | `waveh-freeze`: "line 3 repeats a" | read | fixed |
| L5 | `waveh.ts` says 4096 | 7 | `c1c82d6` | text | `waveh.ts:3-7` | fixed |
| L6 | one fact in one place | 10 | `da6a5fa` | assertions unchanged | old build against the new on two worlds: equal | fixed |
| L7 | `rehearse.ts` holds the shared layer | 10 | `bff471a` (`legs.ts`, `market.ts`, `gate.ts`, `coins.ts`) | assertions unchanged | as L6; the closure test; the seal read (below) | fixed (the review's other notes on `late` and long bodies were not ruled) |
| L8 | the snapshot chosen twice | 10 | `ade159d` (`snapshotAt`) | `waveh-price`, `waveh-rehearse` | `legs.ts` `bookFound` read against the old one: same | fixed |
| L9 | the key grammar in six places | 10 | `b69fdf9` (`keys.ts`) | `waveh-store`: every key built parses to its own date | the program's own builders against `data.sha256`: 9,975 asked, 0 absent | fixed |
| L10 | unused parameters and exports | 10 | `a186e8c` | tests unchanged | my scan: no export that no other file names | fixed (the `: null` branch, the cast and the funding row copy of the review were not ruled) |
| L11 | the day's running share | 8 | `c943446` (H2's text) | text | `pass.ts:133-137` read | fixed |
| L12 | the rehearsal overwrites its sealed outcomes; no lock | 11 | — | — | run 2's folder was moved to `rehearsal-run2` by hand before run 3; the committed `sizing.json`, run 2's and run 3's are one file (SHA-256 `77bf1525…b0ce3`) | kept, sound |
| N1–N3 | memory, time, exits (notes) | — | — | — | the 8 GB setting is in `waveh.ts` and H15 | no action asked |
| CQ1 | marks and funding at step 1 | 2 | `a3f27f2` | as R2 | as R2 | fixed |
| CQ2 | split `rehearse.ts` now | 10 | `bff471a` | as L7 | as L7 | fixed |
| CQ3 | the tape for every leg | 11 | — | — | as RQ5 | kept, sound |
| CQ4 | keep `seen` | 11 | — | — | the code review measured about 1.2 GB for the whole pass; the setting is 8 GB (the look has not run) | kept, sound |
| CQ5 | the crash-after-result sentence | 3 | `a4f1558` (H15) | `waveh-look` recovery test | the sentence read against the code and the test: it holds | fixed |

**Count:** of the two reviews' 24 findings (10 + M1–M2 + L1–L12), **23 are
fixed as ruled and 1 (L12) is kept and sound**; of their 11 questions, 6 were
answered by building (RQ1–RQ3, CQ1–CQ2, CQ5) and 5 by keeping (RQ4–RQ6, CQ3,
CQ4), each still sound. **Open: none of the reviews' findings.** New: F1–F6
below.

### The supervisor's 12 calls

| Call | What | Built in | Status |
|---|---|---|---|
| 1 | H10 as decided with the two clauses | `6fccbfd` | fixed; the text reads as the code does (my reference agrees on 4,000 worlds) |
| 2 | step 1 reads marks and funding, counts only | `a3f27f2` | fixed; counts only, every key checked, the grid pinned to the fetch tool; nothing about an outcome is read or printed |
| 3 | the look's writes (amended by Q1: a copy of the behaviour) | `a4f1558` | fixed; the closure still reaches exactly its ten files |
| 4 | step 2's cheap refusals first | `1c177f2` | fixed |
| 5 | counted as the rules say | `42d136f` | fixed |
| 6 | `--data` checks | `875b9b6`, `708a0d4` | fixed |
| 7 | the 8 GB heap | `c1c82d6` | fixed |
| 8 | rule text made exact | `c943446` | fixed; three sentences still differ in small ways (F1–F3) |
| 9 | tests for the survivors | `40c66fe`, `9299b4e`, `0f6596f`, `1987b1c` | fixed; two more pins wanted (F4, F5) |
| 10 | quality before the freeze | `bff471a`, `da6a5fa`, `ade159d`, `b69fdf9`, `a186e8c` | fixed; no behaviour changed (old build against the new, below) |
| 11 | kept as they are (four items) | — | kept, sound |
| 12 | the third run on a checklist; the lists | the run; `c677d17` | run held; two "must move" items did not move, by the ruling (Q-A); lists verify |

## New findings

None is high or medium. File and line are at HEAD `6d68eeb`.

**F1 — low, the rules (needed). `waveh/rules.md:428-430`, H15 step 2.** The
text says step 2 stops if "the sealed outcomes hold other positions than
SIZING's". The code (`look.ts:235-239`) also stops when a sealed outcome the
rehearsal left unpriced is not one the look prices again (it is SIZING's own
position, so it is not "another"). The code is the safer reading and the test
for it exists (`1987b1c`); the sentence is short. **Replace**
"…or the sealed outcomes hold other positions than SIZING's; then it prices
every leg…" **with** "…or the sealed outcomes hold other positions than
SIZING's, or leave unpriced a position the look does not price again (H1);
then it prices every leg…".

**F2 — low, the rules (optional). `waveh/rules.md:285`, H10.** "A row stamped
at or after DATA END is not read." The bound is the run's own (`boundOf` in
`gate.ts`: DATA END at the look, TEST's start in the rehearsal, which reads
no mark of TEST). **Replace** with "A row stamped at or after the run's end
(DATA END at the look; TEST's start in the rehearsal, H1) is not read."

**F3 — low, the rules (optional). `waveh/rules.md:241`, H8.** "A snapshot
line that fails WAVE-H's schema is dropped and counted." The code
(`books.ts:43`) also counts as failing a line that parses but names another
coin, and H14's print is "lines read and failing". **Replace** with "A
snapshot line that fails WAVE-H's schema, or names another coin, is dropped
and counted as failing."

**F4 — low, tests. `tools/waveh-freeze.cjs:152` (break `t04`).** The records
(decisions, WAVE-H-FIX's entry, and `1987b1c`'s message) say a test of main's
`--data` "would write the real `waveh/data.sha256`". It would not: the tool
writes to `<its own folder>/../apps/poller/waveh/`, so a test that copies the
tool file into a made-up tree and runs it there reaches main. `t04` (main does
not call `checkCounts`) survives the repository's tests and dies to my
test: a manifest with 369 `asset_ctxs` days must exit 1 and leave no
`data.sha256`; a manifest with the right counts must write 9,975 lines. A
25-line test, 0.3 s, no mock (`zz-check-tool.test.ts`). **Fix:** add it to
`waveh-freeze.test.ts` (outside the freeze list; no hash changes).

**F5 — low, tests. `apps/poller/src/waveh.ts:117` (break `n_exitwire`).**
`exitOf` is tested, the program's catch that calls it is not: replacing
`code = exit.code;` with `code = 1;` survives all repository tests. `rehearse`
on made-up folders never depends on the freeze, so the built program can be
run: an empty `manifest.jsonl` gives exit 5 ("not ready", the SIZING files
are not in the list), a missing manifest gives exit 1. 0.7 s
(`zz-check-exit.test.ts`). **Fix:** add it to `waveh-entry.test.ts`.

**F6 — info, tests. `apps/poller/src/waveh/run.ts:103` (break `r03`, no
fsync).** The fixer's "nothing a test can observe" holds for behaviour: the
file system shows no difference. A pass-through spy on `node:fs`'s
`fsyncSync` (a mock, which the code rules prefer to avoid) pins the call and
its order before the rename (`zz-check-fsync.test.ts`). **Recommend leaving it
unpinned**: the line is frozen with the file, and the rename retry path, the
part that bit on Windows, is pinned.

**Reading notes for the look (no change asked).**
- Step 1's "settlements without a mark" per coin counts the series' first
  settlement (2025-05-25 00:00: no mark can precede it), so one is the baseline
  and SIZING's three a coin are two archive holes and that one. In SIZING the
  two holes over a settlement hour left 7 of slice 0's 290 positions
  unpriced (about 3.5 a hole).
- `--data` checks the counts per prefix and that no key repeats; it does not
  check the names. Step 1 checks every name before it reads a file, and I
  checked all 9,975 myself (below), so nothing is open; but a wrong name would
  show at the look, not at `--data`.
- The retry test measures elapsed time (9 pauses of 500 ms must take less
  than 5,000 ms): its margin on a loaded PC is the timer's overshoot, 500 ms.
  It passed in `pnpm verify`, in my runs of the whole WAVE-H set and under
  load; a failure there with no code change is a slow machine.

## The rules text against the code, rule by rule (the ones the fixes touched)

| Rule | The change | The code | Agrees? |
|---|---|---|---|
| H0 | the look checks; the rehearsal runs closed; the shared files named | `waveh.ts` (the look's `verifyFreeze`; `rehearse` with `CLOSED` inside), `run.ts` `sharedHashes` (`dist/schedule.js`, `dist/log.js`) | yes |
| H2 | the running share; marks and funding checked in the list before any is read | `pass.ts:133-137`; `market.ts` `absent` | yes |
| H8 | a failing book line counted | `legs.ts` `Shelf`, `books.ts:43` | yes, with F3 |
| H9 | the 20 funding windows | `keys.ts` `FUNDING_STARTS` (4 + 16 starts; the last 2026-05-28), pinned to `tools/waveh-fetch.cjs` | yes |
| H10 | the latest stamp in (m, m + 1 min]; first line on a tie; whole seconds; a mark above 0; a row without a coin cell fails; the 1% day rule (exit 5) | `ctxs.ts:91-126`, `market.ts:95-98` | yes, with F2 |
| H12 | no excess, HOLDS cannot hold | `verdict.ts:38` | yes |
| H14 | the WITHHELD share; SIZING has no BASE; book lines | `verdict.ts:81-82`, `look.ts:331`, `legs.ts` `bookLines` | yes |
| H15 step 1 | every key first; marks and funding first; the counts written | `look.ts:99-110`, `market.ts:58-106` | yes (the order of the sentence is the order of the code) |
| H15 step 2 | the cheap refusals; the recompute; the writes; the recovery | `look.ts:289-316`, `:398-424` | yes, with F1 |
| H15 Runs | 8 GB | `waveh.ts:3-7` | yes |

The other rules (H1, H3–H7, H11, H13) were not touched by the fixes; their
code moved or lost an `export` only, which the equal outputs of the old and the
new build show.

## The third run's checklist, item by item

From `counts.json`, `report.json` and `sizing.json` of `rehearsal-run2\` and
`rehearsal\` only (my own comparison, leaf by leaf; the sealed file never
read). `counts.json`: 304 leaves in each, one differs (`passMinutes` 55 → 103,
the 50 minutes the run waited out its window). `sizing.json`: 1,044 leaves,
none differs; **byte-identical** in both runs and the repository (SHA-256
`77bf1525…b0ce3`). `report.json`: 35 leaves in run 2, 721 in run 3; three
differ (`ctxs.failed`, `ctxs.twice`, `minutes`); 686 are new (the book lines,
`ctxs.offMinute`, the counts by day and by coin).

| Item | Run 2 → run 3 | |
|---|---|---|
| fill files; records; failing; late | 1,619; 472,259,255; 0; 0 | held |
| counted fills (market + backstop); coins; accounts | 425,433 = 425,300 + 133; 31; 32,885 | held |
| M; scan rows; the scan | 147; 346; equal | held |
| R9 at M and 2M | 3.28 / 5.70 / 5.4% / 3.32 / 7.5 and 1.49 / 3.26 / 2.7% / 1.66 / 6.6 | held |
| slice 0: entries; priceable; left for the look; backstop entries | 290; 283; 7; 0 | held |
| books needed; lacking | 560; 0 | held |
| legs at the book; on the tape; depth short | 283 buy + 283 sell = 566; 0; 0 | held |
| book age p10 / median / p90 | 65 / 295 / 493 ms | held |
| tape − book, buy and sell (n; p10; median; p90) | 275: −7.52, 0, +5.77; 251: −7.23, 0, +7.45 | held |
| highest taker rate by month | 4.5 bps each of the three months | held |
| `asset_ctxs`: files; rows; late | 68; 2,966,816; 0 | held |
| funding: files; rows; failed; late; hours missing | 116; 46,220; 0; 0; 0 | held |
| the missing blocks | 2 on 2025-07-27 (as run 2) | held |
| **failing mark rows** | 2,831 → **0** | moved, as it had to |
| **off-minute rows** | (not counted) → **2,831**, the same rows | moved, as it had to |
| **`twice`** | 0 → **1,777** (on 12 days: 2025-06-08 has 330 for its 1,170 off-minute rows, about one a coin at each stretch's end; 2025-07-27 has 992 for 1,085, where a boundary row shares most of the minutes) | moved, as it had to |
| "funding without a mark" | 7 → **7** | did not move: by the ruling (Q-A), the cause is the holes |
| the sealed outcomes' SHA-256 | `1a9f731d…3e59` → same | did not move: by the ruling |

**Q-A, judged:** the code and the rules treat the 7 exactly as H9 and step 1
say. H9: "a settlement without a mark leaves the position unpriced" — the kit's
`fundingBetween` gives NaN, `pricePosition` returns `unpriced: "funding
without a mark"` (`price.ts:216-219`), the position is counted in H12's
share (`verdict.ts:81`) and in no mean. Step 1 counts the settlements without a
mark by coin (`market.ts:154-160`), before any price. The per-coin figure is 3
for the 28 coins listed from the start and 2 for PUMP (`byCoin`), as the
fixer's account of the holes (2 holes over settlement hours + the series'
first hour) predicts. 7 of 290 is 2.4% against the 10% limit. A rule that
bridged the holes would be a new rule made after seeing SIZING; the
supervisor was right not to make it.

## The lists

- **The draft** (`waveh/FROZEN.draft.sha256`, 74 file lines, SHA-256
  `6bd52e61029556477a51837f3d16b6703b793fc99c1eef4841c6b0b7e2c6a5f1`)
  **equals a fresh build:** `sha256sum -c` of it passes on the build of
  `pnpm verify` and on my own `tsc` build in a scratch copy of `git archive
  HEAD`, every line. It **covers what runs:** the files on disk under each
  scope equal its lines (`dist/waveh.js`; 21 files of `dist/waveh/`; the 10
  closure files; 35 of `research/`; lz4js's 3; the 4 of `waveh/`); the
  closure test (`waveh-freeze.test.ts`) passes: the compiled imports reach
  exactly the closure and the two shared files (`dist/log.js`,
  `dist/schedule.js`), so no MARKET-1 process file joined it. It **names
  `waveh/data.sha256`.** No code changed after the commit it was written
  from (`70cdda5`): `git diff 70cdda5..HEAD` touches only the draft and docs.
- **MARKET-1's 64** (`b9e17505…2f1d`) and **the paper experiment's 61**
  (`d04d3cd8…f31c`) verify against both builds.
- **`waveh/data.sha256`** (9,975 lines, 1,065,279 bytes, LF, sorted by key,
  SHA-256 `b66a9bb0f165685cb9c9a64a9ef0109681e493ada5e65c9f5a85307b8e6c676c`)
  equals the download's `manifest.jsonl` **line for line:** 9,975 keys each,
  none repeated, 0 missing, 0 extra, 0 differing hashes. The keys the program
  asks for, from my own independent builder (8,845 fill files = 1,507
  `node_fills` + 7,338 `node_fills_by_block`, 370 days of `asset_ctxs`, 38
  coins × 20 funding windows = 760) and from the program's own
  (`fillKeys`, `ctxsKey`, `fundingKey`, read through its own `readDataList`),
  are 9,975 and all in the list, none absent, none extra. R3 (i)'s short
  files: `node_fills_by_block/hourly/20250727/8.lz4` alone (1,517,603 bytes
  against a median of 21,576,561.5), the hour both formats share; 97 files
  are under 100 bytes, all of them 2-byte funding windows (`[]`) of eight coins
  not yet listed in them (PONS, CASHCAT and USELESS in all 20 of theirs).
- **The freeze day**, run in a scratch git repository (`copy-final`, a
  `git archive` of HEAD, committed; `scripts/freeze-day.cjs` →
  `out/freeze-day.out`): `node tools/waveh-freeze.cjs --final` **refused** a
  tree that was not clean ("commit first, then freeze") and, with the tree
  clean again, **refused** when `waveh/data.sha256` was missing (nothing
  written); with both in place it deleted and rebuilt `dist/` itself and wrote
  a final list of **74 files whose file lines equal the draft's line for line**
  (only the header, with the commit and the time, differs), naming
  `waveh/data.sha256`. **The program's own gate accepted that list** (`ok`, 74
  files) **and refused** a changed `dist/waveh/look.js`, `waveh/rules.md`,
  `waveh/data.sha256`, `waveh/sizing.json`, a changed closure file
  (`dist/market1/waves.js`), a changed kit file (`research/kit/stats.mjs`) and
  an unlisted file in `dist/waveh/`; it accepted the list again with all
  restored. So the freeze day's two commands behave as the rules say.

## `pnpm verify` and the WAVE-H tests

- **`pnpm verify` in the repository (HEAD `6d68eeb`): green**, exit 0: build,
  eslint, `tsc -p tsconfig.json` and vitest (57 files + 1 skipped, 510 tests +
  6 skipped, 82 s), prettier. The skipped tests are the two real-data
  reproductions and the final list's, which does not exist yet.
- **The WAVE-H tests in my scratch copy** (vitest run directly): 11 files,
  130 passed, 3 skipped; `tsc -p tsconfig.json` exit 0.
- **Old build against new** (`old-new-diff.mjs`): `git archive 1de1010` (before
  the fixes) and HEAD, each built with `tsc`, each run on the same two
  invented stores: the rehearsal, the look's step 1 (stopped, "books
  needed") and step 2. World 1: the look test's, 3 SIZING positions and 1
  WAVE-H position, drifting marks and funding rates, TOO FEW TO TELL. World 2:
  the verdict test's, 24 days × 12 coins, HOLDS, m +235.94 bps, mean excess
  +203.11. **Equal in both worlds:** the rehearsal's `sizing` object and
  sealed outcomes (byte for byte), its counts and report; the look's
  `books-needed.txt`, `step1.json` (every key the old build wrote, the
  positions' SHA-256 included), `result.json` (without `written`),
  `positions.jsonl` (4 and 25 lines, every leg and price), `report.json`
  (every key the old build wrote). The new build adds only counts
  (`ctxs`, `ctxsByDay`, `funding`, `byCoin`, `offMinute`, `bookLines`). So
  the moves of calls 10 and the other fixes changed no price, leg, funding,
  excess or verdict where the marks are on the minute. Where they are not
  (call 1) the third run shows the same: no outcome of SIZING's 290 changed.
- **My own checks of H10 and step 1** (`zz-check-marks.test.ts`, 3 tests, pass
  on HEAD): H10's reader against a reference I wrote from the sentence of the
  rules (the latest whole-second stamp in (m, m + 1 min]; the first line on a
  tie; the bound; rows of another form, a mark not above 0, a row without a
  coin cell; two consecutive day files so that 00:00 serves 23:59): 4,000
  made-up worlds × 38 coins, the counts of every file and every minute's
  mark equal. Step 1's counts on a made-up 370-day store (rows, failing,
  off-minute, late and twice by day; the minutes without a mark by coin;
  funding by window with failing and late rows; the settlements without a
  mark by the kit's 5-minute rule, done by hand) equal an independent count.
  Each of the 370 days and 760 windows, taken out of the list alone, stops
  `readMarkets` (which step 1 runs before it reads any fill file) with its own
  name before any file is read (1,130 runs).
- **The seal:** `readStoreFile` (`store.ts:88-107`) is the only reader of
  store files and still calls `checkSealed` first; the other reads in
  `src/waveh` are our own files (the book list, `step1.json`,
  `books-needed.txt`, `sizing.json`, `coins.json`, the sealed outcomes after
  their hash, the freeze). `keyDate` moved to `keys.ts` unchanged in
  behaviour (the round-trip test and the seal tests pass).

## The break spot-check

**28 deliberate breaks** of WAVE-H's source in a scratch copy of `git archive
HEAD` (`scripts/breaks-list.cjs`, `scripts/run-breaks.cjs`; results in
`out/breaks-repo.jsonl`, `out/breaks-extra.jsonl`, `out/breaks/`). Each find
text matched exactly once (a dry run first: 24 of 24, then 4 of 4); each break
was applied alone, the repository's 11 WAVE-H test files (133 tests) run
directly (vitest, never pnpm), and the file put back from a second archive
after each: at the end the scratch tree equals the pristine one but for my own
`zz-*` test files. A break counts as killed when an assertion fails; I read
every failure message: **none was a time limit**. *Former* = a survivor of
the code or rules review that call 9 aims at; *new* = a break of what the fix
round adds; *named* = one of the two the fixer calls unreachable; *mine* = a
break I added where I suspected a gap.

**25 killed, 3 survived** (`n_exitwire`, `r03`, `t04`).

| Break | Kind | What I broke | The repository's 133 tests | The first failing test | My own test |
|---|---|---|---|---|---|
| `b24` | former | the report written before the result | killed (2) | waveh-look: "step 2 writes the result first…" (the folder holds `[false, false, false]`, not `[true, true, false]`) | |
| `b39` | former | a sealed SIZING file one position short passes | killed (3) | waveh-look: "stops, before reading any store file…" (resolved instead of rejecting) | |
| `b40` | former | exit 4 returned as 3 | killed (1) | waveh-entry: "exits 4 … 5 … 1" | |
| `b42` | former | `--final` accepts a dirty tree | killed (1) | waveh-freeze: "lets --final write only from a clean tree…" | |
| `b67` | former | a tape record of size or price 0 becomes a level | killed (1) | waveh-price: "…walks no tape record of size or price 0" | |
| `c16` | former | an exit leg short of depth is not counted | killed (1) | waveh-price: "flags a position whose exit leg is short of depth…" | |
| `j04` | former | the hour before's book not read when x's file is not in the archive | killed (1) | waveh-rehearse: "reads the hour before's book in an hour's first 10 s…" | |
| `b37` | former | the hour before's book not listed as needed | killed (2) | waveh-rehearse (the same test); waveh-store: "names the files of x's hour, and of the hour before…" | |
| `k09` | former | the look feeds `t = 0` to the verdict | killed (1) | waveh-verdict: "feeds the verdict every position's day and coin, and HOLDS" (TOO FEW TO TELL) | |
| `k10` | former | the look feeds `iid = 0` to the verdict | killed (1) | waveh-verdict (the same) | |
| `k07` | former | SIZING's repriced positions get a BASE | killed (1) | waveh-look: "step 2 priced every leg…" (`[null, 0, 0]`, not `[null, null, null]`) | |
| `l03` | new | a sealed line left for the look, which the look does not price again | killed (3) | waveh-look: "stops, before reading any store file…" ("position 1 was left for the look") | |
| `n_idx` | new | H10's minute index loses its `− 1` | killed (6) | waveh-look: step 1 counts; waveh-rehearse: the counts; waveh-store (4, among them the 300-file reference) | killed (`zz-check-marks`) |
| `n_tie` | new | H10: of two equal stamps the later line stands | killed (3) | waveh-store: "takes the row stamped m + 1 min…" | killed (`zz-check-marks`) |
| `n_off` | new | off-minute rows counted the other way | killed (5) | waveh-look: step 1 counts; waveh-rehearse: the counts; waveh-store (3) | killed (`zz-check-marks`) |
| `n_nocoin` | new | a mark row without a coin cell not counted failing | killed (1) | waveh-store: "counts a row without a coin cell…" | killed (`zz-check-marks`) |
| `n_pct` | new | the 1% day rule stops at exactly 1% | killed (1) | waveh-rehearse: "stops on a day with more than 1%, and at least 10…" | |
| `n_least` | new | the "at least 10" becomes "more than 10" | killed (1) | waveh-rehearse (the same) | |
| `n_fundkeys` | new | the funding windows are not checked against the list first | killed (1) | waveh-rehearse: "stops before reading any file when a day or a funding window is not in the list" | |
| `n_byday` | new | step 1 does not write the mark rows by day | killed (1) | waveh-look: step 1 counts | |
| `n_booklines` | new | the failing book lines are not carried | killed (1) | waveh-rehearse: "prices the legs at the book or the tape…" | |
| `n_order` | new | step 2's cheap refusals after the recompute | killed (3) | waveh-look: "stops, before reading any store file…": 9,215 fill files read before the first refusal | |
| `n_retry` | new | the rename is tried 11 times, not 10 | killed (1) | waveh-look: "WAVE-H's own writes…": 5,088 ms where less than 5,000 is asked | |
| `n_grid` | new | the funding grid's step is 19 days | killed (1) | waveh-store: "names the download's funding windows: a contract with tools/waveh-fetch.cjs" | |
| `n_counts` | new | `--data` expects 369 `asset_ctxs` days | killed (1) | waveh-freeze: "writes nothing unless the files are, by prefix, the ones the program reads" | |
| `n_exitwire` | mine | the program's catch ignores `exitOf`'s code (`waveh.ts:117`) | **survived** | — | killed: the built program exits 1, not 5 (`zz-check-exit`, dist rebuilt for the run) |
| `r03` | named | no `fsync` before the rename (`run.ts:103`) | **survived** | — | killed by a pass-through spy: `['rename']`, not `['fsync', 'rename']` (`zz-check-fsync`) |
| `t04` | named | the freeze tool's main does not call `checkCounts` (`waveh-freeze.cjs:152`) | **survived** | — | killed: exit 0 where 1 is asked (`zz-check-tool`) |

**The fixer's two "unreachable" claims.** `r03`: it holds for behaviour. The
file system shows no difference with or without the flush, so no test without
a mock can see it; a spy on `node:fs`'s `fsyncSync` does (F6), and I would
leave it, as the code rules prefer no mocks and the retry path, the one that
bit on Windows, is pinned. `t04`: it does not hold (F4). The reason given,
that a test of main's `--data` would write the real `waveh/data.sha256`, is
wrong: the tool writes relative to its own file, so a test that copies the tool
into a made-up tree and runs it there reaches main and writes only there. A
third survivor that nobody named is `n_exitwire` (F5).

**What the kills show.** The reviews' survivors that call 9 aims at (`b24`,
`b37`, `b39`, `b40`, `b42`, `b67`, `c16`, `j04`, `k07`, `k09`, `k10`) are now
all killed, each by a test that names its behaviour, and the fix round's own
additions are pinned by tests that fail in the way the break says (9,215 files
read before a refusal; 5,088 ms for 10 tries; a verdict of TOO FEW TO TELL where
HOLDS is asked). My own differential tests of H10 kill four of the H10 breaks
independently of the repository's, so the two agree. The five survivors the
supervisor ruled to leave unpinned (`d10`, `i05`, `j03`, `j08`, `n01`) I did not
re-break.

## What I could not check

The test months and the real archive (sealed, and not mine to open): the real
form of the mark rows and funding replies in TEST (step 1 will show it; a form
that fails stops the look by the 1% day rule, as designed); the look's real
heap and hours. I did not re-run the rehearsal (hours, on real data, outside
my brief) and took its counts from the six permitted files. I did not read the
fixer's transcript or WAVE-H-BUILD's folder.

## Questions, each with my recommendation

1. **The rules sentences (F1, and F2–F3).** Edit them now, in one commit, and
   write the draft list again? *Recommendation: yes for F1 (it is the only
   place where the frozen text is shorter than the frozen code), and F2–F3
   in the same commit (they are free now and a defect-route entry later).*
2. **The tests (F4, F5, F6).** Add `zz-check-tool.test.ts` (to
   `waveh-freeze.test.ts`) and `zz-check-exit.test.ts` (to `waveh-entry.test.ts`),
   and the spy test or not? *Recommendation: the first two, yes (no mock, no
   hash change); the spy no.*
3. **A position-level count in step 1.** The rules review's finding 2 asked
   also for "how many of WAVE-H's positions have a settlement without a
   mark", so that step 1 says whether WITHHELD is coming; the calls built the
   count by coin instead. Add the position count? *Recommendation: no.* It
   would be a change to the frozen look after this check, for a risk the
   by-coin count already bounds: in SIZING the two holes left about 3.5
   positions each unpriced, and WITHHELD needs more than 10% of the plan's
   guide of about 870 positions, that is about 25 such holes in the ten months.

## Slips, all of them

A few of my tool calls hit a transient failure of the tool's safety check and
were repeated (no effect). My first H10 differential test ran into vitest's
default 5 s limit (I gave it 600 s). My first fixture for the freeze tool used
manifest keys that were not dates, and the tool wrote `data.sha256` into my
made-up tree before its R3 (i) list failed on them: harmless with real keys
(the counts are checked first), noted because the order is write, then print.
The repository's `makeStore` puts a store in the system temp folder, so two of
my dumped worlds went there before I moved them into my scratchpad (one tiny
`waveh-dump-*` folder of mine was removed). The break harness's last line says
the scratch tree "DIFFERS" from the pristine one: my own `zz-dump-world*` files
sit in its test folder; a `diff -rq` afterwards shows only my files. My first
draft of the checklist row for `twice` named the wrong day for the most
collisions (2025-06-08 has the most off-minute rows, 2025-07-27 the most
collisions) and a progress note first said 22 of 24 killed (it is 21 of the
first 24, 25 of 28): both corrected from my own output before this report was
committed. None touched a figure the supervisor will use.

## Evidence

All in the supervisor folder `workers/WAVE-H-FIX-CHECK/` (`progress.md`; the
scripts in `scripts/`, what they wrote in `out/`; paths below are relative to
it): `compare-runs.cjs` → `out/compare-runs.out` (the third run, the six
permitted files only); `sum-days.cjs`; `check-manifest.cjs` →
`out/check-manifest.out`; `tiny-files.cjs`; `data-list-check.mjs`;
`scripts/zz-check-marks.test.ts` → `out/zz-check-marks.out`;
`old-new-diff.mjs` → `out/old-new-diff.out`, `out/old-new-diff2.out` (with
`zz-dump-world.test.ts`, `zz-dump-world2.test.ts`); `deadscan.cjs`;
`breaks-list.cjs`, `run-breaks.cjs`, `after.sh`, `exit-break.cjs`, `table.cjs`
→ `out/breaks-repo.jsonl`, `out/breaks-extra.jsonl`, `out/exit-break.out`,
`out/breaks/` (one JSON a break); the three tests I recommend adding
(`zz-check-tool.test.ts`, `zz-check-exit.test.ts`, and the optional
`zz-check-fsync.test.ts`); `freeze-day.cjs` → `out/freeze-day.out`;
`out/verify.out`, `out/head-waveh-tests.out`. Every price, mark, fill and rate
in them is made up; the only real data read is the six run files and the
manifest's metadata.
