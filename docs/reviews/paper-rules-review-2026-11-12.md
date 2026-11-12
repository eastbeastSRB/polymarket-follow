# PAPER-RULES-REVIEW — the fresh rules review of the paper experiment, before its freeze

PAPER-RULES-REVIEW (Sonnet 5.5, max, a different model from the builder's),
2026-11-12 15:25Z – 15:57Z, then 17:42Z – 17:56Z after a pause for the usage
limit (UTC; every stamp from `date -u`), for
polymarket-follow's supervisor. Under review: `apps/poller/experiment/rules.md`
(R0–R17), the code that runs it (`apps/poller/src/paper/`, `src/paper.ts`, the
vendored `research/`) and the tests `test/paper-*.ts`, at HEAD `8200924` (no
code or rules changed up to `b4320cc`, which adds PAPER-CODE-REVIEW's report
only); the draft freeze list `experiment/FROZEN.draft.sha256` (`d6698333…36db4`, 60
files). Evidence: the supervisor folder `workers/PAPER-RULES-REVIEW/`
(`progress.md`, `scripts/`, `out/`; paths below are relative to it). **A review
decides nothing:** the supervisor and the owner answer; nothing in the
repository was edited but this report.

**The blind store held.** Nothing stamped at or after 2026-11-07T00:00:00Z was
read. I opened repository files, the docs, PAPER-BUILD's folder (read only) and
nothing else: not the collector's recordings, database or run folder, not
`F:\polymarket-follow\`. No call to Polymarket's API, no agent, no download;
polymarket-lab not touched. My scripts use the repository's built files and
made-up numbers only. I ran the repository's eight `paper-*` test files (70 of
70 pass, `out/vitest-paper.txt`), compiled HEAD's sources into the scratch area
(not into `dist/`) and ran a look end to end in a scratch copy of the built
code over a made-up world (fake API, the database driver a stub; H1);
`git status` was clean after all three.

## For the owner, in one page

*Words.* A **look** is one of the three dates (19 December, 6 February, 8 May)
on which the test gives its verdict. The **freeze** is the moment the rules and
the program are locked by a fingerprint; after it a mistake can only be put
right by starting again. The **holdout** is the 100 accounts kept untouched for
a later blind test. A **bp** is 0.01%.

**Verdict: the rules may be frozen after the fixes below.** The design is what
you decided, and the program does what the rules say almost everywhere. I
re-computed the deciding number (the money's error and the words keep, drop,
too few to tell) with code of my own and it agrees to the fourteenth digit; I
checked the part that prices a position after the cut against the old,
proven one 21,000 times and found no difference; the list of locked files is
exactly what a clean build of the code produces; and the blind held: nothing
after 7 November has been read, and the program refuses to ask for it until a
valid freeze exists.

**What must change first** (each is small; none changes the design):
1. The code that writes a look's verdict has no test and cannot be tested as it
   is written (I ran it in a scratch copy and its logic is right; what is
   missing is the test), and it prints one wrong number (a Student-t band that
   comes out as zero).
2. The daily page can never show the verdict, although your ruling says it
   shows keep or drop at the looks.
3. A favourite who is one of the 100 holdout accounts would be read and scored;
   the rules say such an account waits.
4. The rules promise some side lines at the looks (stops, the 7-day limit,
   "after a jump", the competition days, the 24 h map, results with and without
   gaps) that the program does not print.
5. The approved plan left out a market's split day; the final rules only count
   and flag it, and a frozen rule cannot be mended later.

**What you decide** (section "Questions", each with my recommendation): whether
the page shows a look's verdict (yes); what happens on a stock split (equity
markets leave the test from the first split the collector records); whether a
favourite from the holdout is refused (yes); how the side lines are given at the
looks (worded as the report's own arithmetic on the day's log); and that the
fixes are made before the freeze, not after, because afterwards a mistake means
starting again.

*This is research, not advice on what to trade.*

---

## Verdict

**MAY FREEZE AFTER THESE FIXES.** One high finding (H1), five medium (M1–M5),
fourteen low (L1–L14). H1 and M1–M5 change frozen text or code, so they must be
made before the freeze: after it a change is a new arm or a restart (R0, R16).
The low items are wording and definitions and can ride along in the same
commit. Nothing found changes the design, the statistic or the budget. After
the fixes the draft list is written again (its hash changes with `dist/` and
`rules.md`); a short read of the changed lines by the supervisor is enough, not
another full review. Any change PAPER-CODE-REVIEW asks for should go into the
same commit, so that the list is written once. (PAPER-CODE-REVIEW's commit
`b4320cc`, whose title I read only after my findings were written, names four
of the same items: the t band, the look and its report without a test, a
holdout favourite not refused, the page without a verdict.)

## Findings by severity

| # | Sev. | Where | Finding | Fix |
|---|---|---|---|---|
| H1 | **high** | `look.ts`, `summary.ts` `lookReport`, R12, R14, R16 | **The code that decides a look is tested by nothing and cannot be driven by a test.** No test imports `look.js`; `lookReport`, `result.json`, `afterTheVerdict`, `LOOK_WAIT_MS`, `unreadListedAsHoles` appear in no test file (the word "look" occurs in two test titles about other things). `look(config, log, k, now)` has no `io` argument (`daily()` has one, `DailyIo`): its package folder, rule-book read and fixed inputs are hard-wired, so a test could not build a world. What is untested is exactly the deciding assembly of R12: the set (voted, priced), the unpriced share, the mean d, the z of the look, the date gate (R1), the wait (R16), the once-only refusal, `afterTheVerdict`, the result file. `paper.ts`'s dispatch of `look` and `reparse` is untested too. PAPER-BUILD's mutation checks (45 and 21 mutants, its progress.md) name nothing in these lines, because no test reaches them. M1 was found in this code at once. rules.md's header says "a test pins each rule"; for R12's assembly, R14 and R16 it does not. **What I could check by running it:** in a scratch copy of the built experiment, with `look.js` patched in three places exactly as `daily()` is written (an `io` argument), over a made-up world (the daily test's, to February; fake API, no database), the look behaves as R12 and R16 say: exit 5 before its Monday and when not due and on a second run, exit 4 on a changed frozen file, a wait (exit 5) while reads are unfinished and a forced run a week later that lists the unread accounts and the missing market-days (MAIN then WITHHELD at 2.9% unpriced), `afterTheVerdict` set exactly when look 1's MAIN verdict was DROP, and MAIN's copies, mean, error, mean d and verdict equal my own recomputation from the day's position log to 1e-9 (`out/look-e2e.txt`). So the repair of H1 is the injection and the tests, not the logic. | `look()` takes the same `io` as `daily()`; `test/paper-look.test.ts` over the daily test's made-up world extended to 2026-12-21: exit 4 without a freeze; exit 5 before END_k + 2 d; exit 5 with an unread list account or a missing market-day, and after a week a run that lists them; `result.json` with the five lines; a second run refused (5); MAIN's KEEP / DROP / TOO FEW / WITHHELD on set figures (the look's z, voted copies only, the unpriced share, mean d); `afterTheVerdict` from an earlier result. Unit tests of `lookReport` on made-up copies (`scripts/check-lookreport.mjs` is a start). Then mutation-check the deciding lines: the `voted` filter, `unpricedShare`, `d?.mean`, `zs[k-1]`, the date gate, the once-only check. |
| M1 | medium | `summary.ts` ~178–182, R14 | **The printed Student-t band is wrong.** `kit.stats.tCritical(2 * (1 - normalUpper(z)), df)`; `normalUpper` is P(Z>z) (0.0025 at 2.81), so the argument is 1.995 where 0.005 is meant, and `tCritical` (the \|t\| whose two-sided p is the argument) returns 3e-58: the band's half-width is 0 instead of 2.97 / 2.48 / 2.19 at the three looks (`out/check-tband.txt`, `out/check-lookreport.txt`: `tBandHalfWidth` 2e-58). It decides nothing, but it is a frozen print that is simply false, in untested code. | `2 * normalUpper(z)`; a test that the half-width over SE is 2.97 / 2.48 / 2.19 for df 41 / 90 / 181. |
| M2 | medium | `daily.ts` `pageData` (`verdict: null`), R15 | **The daily page never shows a verdict.** R15: "at and after a look, R12's verdict line and its sentence"; the owner's page ruling: keep or drop "appear only at the three looks". `pageData` sets `verdict: null` for ever and nothing reads `looks/L*/result.json`; `renderPage` can print a verdict but nothing gives it one, and no test passes a non-null one. After look 1 the box reads "Too early to judge — next look 2027-02-06" even if look 1 said DROP: in my scratch run look 1's MAIN verdict was DROP and the page written the day after said exactly that (`out/look-e2e.txt` F; `out/check-page-words.txt`). | `daily` reads the looks' result files and gives the box the latest look's MAIN verdict and sentence (and, if it is neither KEEP nor DROP, the next look's date); a test. Or reword R15: the verdict is in the look report only. Recommended: the code. |
| M3 | medium | `daily.ts` `fixedInputs`/`readsOfFavourites`, R2 | **A holdout account on the favourites list is accepted.** R2: "A holdout account on the list joins only after D1 is scored"; plan section 8: "The experiment never reads a holdout account". The code reads any address of `favourites.txt`; a holdout address is not in the pool, so it is treated as an outsider, read from 30 days before F0's Monday and scored in FAV (`out/check-holdout-favourite.txt`). 100 of 1,702 accounts are holdout; a list of 20 favourites taken from the leaderboards has a fair chance of holding one. | `fixedInputs` throws if a favourite is a holdout account (loud, once); R2 says the freeze checks the list against `population.json` and leaves holdout addresses out (a later arm, after D1); a test. |
| M4 | medium | `look.ts` (`LINES`), R6, R7, R11, R13, R14 | **Lines promised "at the looks" are not printed.** R7/R13: STOP2, STOP5, DAYS7, the JUMP split, the NOTIONAL split, COMP (without the competition's days and its boosted markets); R6: "copies the map would close are printed apart"; R11: a gap copy "printed with and without". `look` prints the five lines of `LINES` and the gap *count*. Each copy's `stop2`, `stop5`, `days7`, `jump`, `notional`, `competition`, `mapOpen`, `gap` is in the day's position log, but no rule says who computes the aggregates or with what statistic, so two careful people would differ. They decide nothing. | Recommended (wording): R14 gets a paragraph: these figures are computed at the look from the look day's position log by the look report's arithmetic, on MAIN's voted priced set, as the mean per copy with R12's two-way error; the header's "a test pins each rule" is softened. Or add them to `look` (more frozen code). |
| M5 | medium | `rulebook.ts`, R6 (3) | **The plan's split rule was dropped.** Approved plan R6 (3): "no split on t's UTC day" (the kit: any market-day with a split is out). rules.md: a split event "is counted and flagged on the page (its shape is unknown; it is never guessed)". Copies across a split then carry the ratio jump as a return, and the page's "a recorded fix is needed" is not open to a frozen rule: R0 allows fixes of defects, and this is a rule. Architecture says splits are "counted, never read"; no decisions entry says this replaces the plan's rule. 35 of the 84 primary markets are equities (40 crypto, 5 index, 4 commodity). | Decide now (question 2). Recommended, shape-independent: from the UTC day the collector first records a non-empty split list, every equity market is left out of the primary cells as a settlement is; copies open across that day are unpriced; the count is printed. |
| L1 | low | `daily.ts` flags, R15 | R15 bans the word "follow" on the page; an unpriced position carries lib-exits' reason "no mark at the follow instant" into the Flags column of `index.html` and `positions.html` (`out/check-page-words.txt`); the test reads a sample without one. At about 134 directional entries a day (about 935 a week, the approach review) an entry falls in the last 95 s before END on about one day in seven, and a missing market-day gives the same reason. | Map the reason to "no mark at the paper entry" on the page; add an unpriced row to the page test. |
| L2 | low | `look.ts`, R1 | R1: a look runs "after that day's run"; `look()` checks only `now ≥ END_k + 2 days` and that the reads are done. The data a look needs is complete after the run of END_k's own day. | Reword R1: "on or after the Monday, when the reads are complete". |
| L3 | low | `look.ts`, R1 | R1: "nothing at or after END is used". The look scores with every stored fill, including those read after END_k (up to two days). Only an order event straddling END_k, the open / crossing flag and the gap check can differ from the daily record at END_k; no price does. | `accountData` keeps fills with t < END (one line), or R1 says what a look does. |
| L4 | low | R1, R2, `paper-freeze.cjs` | F0 "= the freeze's instant" is whatever instant is written in `favourites.txt`; nothing says it may not precede the freeze (the point of Q5). `--final` writes over an existing `FROZEN.sha256`, only comments when the tree is dirty, and does not parse `favourites.txt`: a malformed file (an upper-case address, a 21st line, a bad first line) makes `readFavourites` throw and stops every run after the freeze, and it cannot be corrected without a new list. | R1: F0 is the UTC instant, to the second, at which `--final` is run, recorded in decisions with the hash; the tool refuses a dirty tree and an existing list, and parses `favourites.txt` with the run's own `readFavourites` (and, with M3, the holdout check) before it writes. |
| L5 | low | `rulebook.ts`, R6 (3) | R6 (3) says "recorded on or before t's UTC day"; for an `instrument` document with a settlement the code uses the settlement's own day (as the kit's KIOXIA rule), for a list document the record's day. | One sentence. |
| L6 | low | R0, `account.ts` | After a defect fix the `dist` hashes change and `daily` exits 4 until a new list is written; R0 does not say a fix is a new list (hash and tag in decisions). The Monday cache is keyed by the fills' hash, not the code: a fix in `account.ts` would not change a cached value. | R0: a fix = a new list and `paper-freeze-2`; `cache/mondays.json.gz` removed with any change to `account.ts`. |
| L7 | low | `routes.ts`, R3 | R3 says the row check is "the kit's `validFill` with ids as digit strings"; `FillRow` also refuses `adl` or `settlement` that is present but not a boolean. | One clause in R3. |
| L8 | low | `stats.ts`, R12 | R12 is silent when the error cannot be computed (one trader or one day): the code says TOO FEW TO TELL. | One clause. |
| L9 | low | R15, R14, F16 (e) | The entry price on the page (the mark at the end of t + D's minute, plus or minus the spread and depth) is defined only in a code comment. F16 (e) asked to say that per-copy covariates "for later splits" (funding, long and short counts, the agreement flag) are deferred; rules.md does not. | Two sentences. |
| L10 | low | `loop.ts`, R3a | A failed (not paused) list read in a multi-week run leaves P behind; the next week's list is built with that account uncovered, so it is swept with a two-week cap of 20 pages (enough for a directional trader). Recorded as holes. | None needed; know it. |
| L11 | low | R3, R3a, R15, R16 | Numbers that are the builder's own, inside the frozen text: schema alarm 1% / 10 rows / 1,000 rows (the review suggested the 1%), five failed reads, 120 s wait, 50-page safety cap (suggested), the look's 7-day wait, 500 rows on the page. All fixed, none decides a verdict. | Accept in the freeze entry. |
| L12 | low | `score.ts`, R11 | `gap` ignores an unread tail (P < the span's end): after a paused run, or a look forced after its week, a list account's copies show as plain open copies although the trader's exit is unread. | Add `account.state.P < spanEnd` as a further reason for `gap`. |
| L13 | low | `rulebook.ts`, R9 | A category missing from the collector's fee schedule falls back to the kit's rate without a count; R9 says only "before the first record". | Count it; one clause. |
| L14 | low | `look.ts`/`summary.ts` | `lookReport` prints a verdict word (KEEP / DROP / ...) for FAV, BROAD, TEN and DAY; R12 is MAIN only ("the others print the same figures, deciding nothing" is a comment, not a rule). A reader of `result.json` meets "verdict: DROP" on the favourites line (`out/check-lookreport.txt`). | `verdict: null` for the other lines, or label it "deciding nothing". |

## The brief's six checks, one by one

**1. rules.md against the decisions.** Every ruling is there as decided
(table "Every ruling against rules.md" below), with these exceptions: the
approved plan's split rule was dropped (M5), the holdout clause of R2 is
worded but not built (M3), the page's verdict at the looks is worded but not
built (M2), and the lines "at the looks" are worded but not printed (M4).
Nothing is added beyond the rulings except the builder's own operating numbers
(L11) and the definitions F1–F18 asked for (WITHHELD at 2% unpriced, the
look's one-week wait, the newest 500 rows, the safety cap).

**2. Freezable.** Every number and instant is fixed. Two careful people would
differ at: the lines of M4 (no statistic named), F0 (L4), the split day (M5),
the settlement day (L5), the entry price (L9), and a look forced by its week's
wait (R16 "lists what was not read as holes": the list is made, but the copies
are not flagged, L12). Soft wording in rules.md is rare (`grep` for may /
should / about / unless: only operating notes in R17 and the page caption).

**3. rules.md against the code, rule by rule.** Table below: 9 of 19 rules
agree and are pinned by tests; 6 agree with notes (R1, R7, R11, R12, R13,
R16); 4 differ (R2, R6, R14, R15). By test: 9 rules fully pinned, 8 partly
(R1, R2, R6, R7, R11, R12, R13, R15), 2 not at all (R14, R16). The items the
brief names above all:

- *The entries and exits after the cut (`planCopyThrough`, F9).* Agree. It is
  pinned equal to the vendored `planCopy` at END = CUT on 2,000 random
  histories (`paper-copy.test.ts`); I added an oracle at END ≠ CUT: shifting
  every instant of a history by CUT − END turns the vendored function into the
  END version, and for 21,000 made-up histories at seven END values the legs,
  flag and last exit equal after un-shifting, all three flags exercised
  (`out/check-plancopy-shift.txt`). An entry whose t + D reaches END is
  unpriced, not priced backwards (`paper-copy.test.ts`). The market object
  past the cut equals the kit's `marketFrom` bit for bit when the panel is cut
  and joined again (`paper-seed.test.ts`).
- *The label and habits at M from the fills before M.* Agree and pinned
  (`paper-score.test.ts`: an order event straddling M changes `closed` by one;
  coverage by holes; the cache equals a fresh value).
- *MAIN's filter.* Agree: `linesAt` is P1 (directional and read), the habit
  window read, a median hold ≥ 6 h (6 h − 1 ms fails), ≥ 3 closed cycles, a
  primary market; no map (`mapOpen` is stored per copy, never a condition).
- *The delay.* Agree: `delayOf(entryId)` of the kit, D ∈ [62.14 s, 95.44 s),
  the reproduction equal to 1e-9 bps (PAPER-BUILD part 4).
- *Both readings.* Agree: money from `priceCopy` on `planCopyThrough`'s legs,
  d from `dAgainstNull` with `h` = 24 h, ×10⁴; the set of a look is the one set
  of voted copies, money over the priced ones.
- *The matched null's removal set at M.* Agree: `removalFills` per (line, M) =
  the week-of-M fills of the accounts in that line at M (FAV: the
  favourites); pinned by comparing d of one copy under MAIN and BROAD with
  `removalOf` built independently.
- *Unpriced, missing data, holes, coverage (F2).* Agree (`covered` is tested at
  its edges: P short of the window's end, a hole meeting it, the seed whole,
  truncated and absent; a hole is an account-day for rejected rows, the read's
  tail for a cap; a standing hole for 400 "account not found"; the alarm).
  Gaps: L12.
- *The statistic.* Agree. `twoWay` equals my own CR1 code on 300 random sets
  (largest difference 7e-15 bps); `verdict` equals R12 as I read it on a grid
  of 23,688 points (z, mean, error, mean d, unpriced share), 0 differences
  (`out/check-twoway-independent.txt`). z 2.81 / 2.43 / 2.17 are the two-sided
  0.5% / 1.5% / 3% levels (exact 2.807 / 2.432 / 2.170); their spend is 5.006%,
  with the rounded values.
- *Keep / drop / too few.* Agree: DROP before KEEP (Q-G), WITHHELD above 2%,
  SE null → TOO FEW; "the first keep or drop ends the test" is a label
  (`afterTheVerdict`) on later looks, and the daily run goes on, as the plan
  says. The assembly is H1.
- *The favourites (counted from the freeze).* Agree except M3: entries with
  t ≥ F0 only (`g.t >= f0`), judged whole (one FAV line, one removal set; no
  per-favourite row on the page).
- *Five lines on the page, the rest at the looks.* The page has the five; the
  rest is M4.

**4. The blind.** Held. Every request of the four routes goes through one
wrapper, `paperRequest`, which calls `checkWindow` first; the gate is a value
(`{open}`) built after `verifyFreeze` passes; `daily` and `look` verify the
freeze before any read, any rule-book read (the only use of the collector's
database) and any write but the one log line; the tests that touch it assert 0
requests and nothing written (`paper-daily.test.ts` step 1, `paper-score.test.ts`,
`paper-read.test.ts`: a window ending at the cut passes, one millisecond more
does not, for fills and for a market-day). No path in code or tests names the
recordings, the run folder or `F:`; the tests use made-up worlds; the freeze
tool reads the package, `package.json` files, the lockfile and git. The seed
manifest names exactly the 1,602 pool accounts and no holdout account
(`out/check-seed-manifest.txt`); `captureFile` looks only in `accounts`.
PAPER-BUILD's live checks ran with the gate closed (their log says so) and
windows ending at the cut. One hole: a holdout favourite (M3).

**5. The freeze list.** 60 of 60 files verify against the tree, `dist/`
included, and a clean compile of HEAD's sources into a scratch folder gives
byte-identical `dist/paper.js` and `dist/paper/*.js` (23 files): the list is
reproducible. The scope is `dist/paper.js`, `dist/paper/`, `research/` (35
files, LF, `-text`) and `experiment/` (rules, seed manifest; `favourites.txt`
joins at the freeze, then 61); the gate refuses a file of the scope that is not
listed, a listed file that differs or is missing, and an empty list. **Outside
it and able to change a number:** nothing in practice. The shared modules the
experiment imports (`api/rest-client.js`, `api/admission.js`, `api/schemas.js`,
`store/files.js`, `store/db.js`, `schedule.js`, `clock.js`, `log.js`, `lock.js`,
`jobs/paging.js`) are hashed in each day's log, not enforced; they decide
whether and when a request is sent and how a reply's JSON is parsed (the
reviver and the Zod shape come from the frozen `routes.ts`), not a value, apart
from `schedule.js`'s `DAY_MS`/`HOUR_MS`/`MINUTE_MS` and `utcDate`, constants no
one will touch. The toolchain (Node 24.13.0, TypeScript 6.0.3, zod 4.6.7,
mongodb 7.7.0, pino 10.4.0, the lockfile's hash) is in the list's head, so it
is covered by the list's own SHA-256, but nothing enforces it at run time except
TypeScript, through the `dist` hashes. The collector's `rulebook` collection is
an input read at run time (fees, left-out days, competitions), by design
(R6, R9). The final list is longer by `favourites.txt`; a CRLF `favourites.txt`
would hash differently from its committed blob (write it with the Write tool;
check `git ls-files --eol` shows `w/lf`).

**6. The looks.** `look k` (once each; exit 5 if not due, not ready or already
run; run end to end in the scratch copy of H1, `out/look-e2e.txt`): the freeze
is verified; the look's `result.json` refuses a second run;
`now ≥ END_k + 2 d`; the list of the last week and the unread accounts and
market-days are computed and, until a week past the Monday, the look waits;
the scored set is voted copies; each of the five lines gets `lookReport` (copies,
traders, days, unpriced by reason and share, open / crossing / gap counts, the
money with its two-way and one-way errors, the one-way lower bounds, d with its
reasons, the gross with its lower bound = "break-even round trip", fees,
funding, win share and average win against loss with R14's label, the hold's
median and quartiles, the worst day and trader, the equity's fall at $1,000, the
means without the most influential account and day, closed only, long share,
the daily e-value, copies a week, the smallest edge at the next look, the
verdict and its sentence). That list matches R14 except M1 (t band), M4
(beside lines, gap with and without). It runs once (the file check). The
sentences are verdicts on the test: "Keep and drop are verdicts on this test,
never instructions to trade"; at look 3 with TOO FEW it reads "no edge as large as
X bps a copy was seen". Nothing in the result tells anyone to trade: no "buy",
"sell" or size, and the only sentences are the two above and R14's label (the
word "follow" occurs only inside an unpriced reason, lib-exits' text; the ban
of R15 is on the page, L1). See H1 for what is not tested, and L14.

## Rule by rule

| Rule | Code | Test | Agrees? |
|---|---|---|---|
| R0 identity, what is frozen | `gate.ts` `verifyFreeze`, `FROZEN_SCOPE`; `research.ts` `loadResearch`; `daily.ts`, `look.ts` check first; `tools/paper-freeze.cjs` | `paper-read` "opens only on a freeze…"; `paper-research` (4); `paper-score` "a run without a valid freeze"; `paper-daily` step 1 (no list, a changed file). The look's check: none | Yes (L6) |
| R1 instants | `instants.ts`; `look.ts` date gate | `paper-read` "the experiment's instants" (CUT = the kit's, Mondays, `runEnd`, the looks are Saturdays). The date gate: none | Partly (L2, L3) |
| R2 who | `daily.ts` `fixedInputs`, `readFavourites`; `seed.ts` | `paper-daily` (1,602 / 84 / 92, favourites parsed); `paper-seed` (never the holdout folder). Holdout favourite: none | **No** for the holdout clause (M3) |
| R3 fills | `seed.ts`; `routes.ts` `FillRow`; `reader.ts` `readFills`; `loop.ts` `rejectedHoles`, `readAccount`; `coverage.ts`; `reparse.ts` | `paper-seed` (7); `paper-read` (row check, one account's read, holes, `covered`, re-parse); `paper-loop` (alarm, safety cap, five failures) | Yes (L7) |
| R3a reading loop | `loop.ts` `readThrough`; `score.ts` `weekList` | `paper-loop` (9); `paper-score` `weekList`; `paper-daily` (first run paused and resumed = one run, a normal day, a Monday's sweep) | Yes (L10) |
| R4 events, entries, delay | `account.ts` `history`; `score.ts` | `paper-score` (adds never a copy, the END window); `paper-daily` | Yes |
| R5 label and habits at M | `account.ts` `fillsBefore`, `mondayValue`, `mondayFacts` | `paper-score` "a Monday's facts come from the fills before it", "serves a cached Monday only while…" | Yes |
| R6 markets | `score.ts` `primaryMarket`; `rulebook.ts` | `paper-score` (order of checks, the rule book from the cut only, a market without data) | **No**: the split clause (M5); "printed apart" not printed (M4); L5 |
| R7 the lines | `account.ts` `linesAt`; `score.ts` | `paper-score` "account-level conditions at their edges" (6 h − 1 ms, 3 and 10 cycles, 24 h − 1 ms); `paper-daily` | Five lines yes; beside lines only per copy (M4) |
| R8 money reading | `copy.ts` `planCopyThrough`; lib-exits `priceCopy` | `paper-copy` (2,000 histories equal at END = CUT; exits before, at, after END; the last 95 s; STOP and DAYS7 closes); my 21,000-case oracle | Yes |
| R9 taker setting, panel past the cut | `rulebook.ts` `bookTaker`; `score.ts` `takerSetting`; `reader.ts` `readMarketDay`; `market.ts` | `paper-score` (the rule book's fee, override, before the first record); `paper-read` (a market-day, late stamps, broken shapes); `paper-seed` (join = whole, bit for bit) | Yes (L13) |
| R10 d at 24 h | `score.ts` (`removedFor`, `votedBy`, `dAgainstNull`) | `paper-score` "prices the money … and d per line…", "votes an entry when every leg…" | Yes |
| R11 unpriced, missing, gap | `score.ts`; lib-exits `unpricedReason`, `chainBreaks` | `paper-score` (unpriced: no data; gap by a hole and by a chain break); `paper-copy` (the last 95 s) | Partly: "printed with and without", "named at the looks" (M4); L12 |
| R12 statistic, verdict | `stats.ts` `twoWay`, `verdict`, `LOOK_Z`; `summary.ts` `lookReport`; `look.ts` | `paper-stats` (the formula, never below a one-way error, KEEP / DROP / DROP wins / WITHHELD / null error); my independent recompute. The assembly: none | Formulas yes; assembly untested (H1) |
| R13 formulas of the lines beside | `copy.ts` `stopInstant`, `jumpRatio`, `DAYS7_MS`; `score.ts` variants | `paper-copy` (STOP, JUMP without looking past the entry); `paper-score` (weak pins: `stop2` not null, `days7` = net, `notional`) | Per copy yes; not aggregated (M4) |
| R14 prints at a look | `summary.ts` `lookReport` | none | Mostly; **M1**, M4, L14 |
| R15 the daily page | `page.ts`; `daily.ts` `pageData`; `stats.ts` `traderBand`, `dailyEValue` | `paper-score` "the page" (escape, the banned words, "too few days"); `paper-stats` (e-value, band); `paper-daily` (the page's five lines = the log of every copy) | **No** for the verdict box (M2); L1 |
| R16 what never changes | `look.ts` | none | By reading yes (once, wait, a week); L2, L3 |
| R17 the budget | `routes.ts` `PAPER_LIMITS`; shared `rest-client.ts` | `paper-loop` (≤ 120 a minute, ≤ 15 in 5 s, nothing in the pause, a Monday from 02:00Z); `rest-client.test` (generic User-Agent, no name in any header or URL) | Yes |

Counts: **agrees 9** (R0, R3, R3a, R4, R5, R8, R9, R10, R17), **agrees with
notes 6** (R1, R7, R11, R12, R13, R16), **differs 4** (R2, R6, R14, R15). Tests:
**fully pinned 9** (R0 for `daily`, R3, R3a, R4, R5, R8, R9, R10, R17), **partly
8** (R1, R2, R6, R7, R11, R12, R13, R15), **none 2** (R14, R16). "Pinned" means a
test asserts the rule's behaviour; I did not mutate the code myself.
PAPER-CODE-REVIEW's commit title reports 56 of 120 deliberate breaks passing the
suite, so some conditions inside rules I call pinned are probably not; its
report lists them, and the mutation check after the fixes (H1) should cover R5–R12
and R16.

## Every ruling against rules.md

| Ruling | In rules.md | OK? |
|---|---|---|
| APPROACH-REVIEW accepted, 1: data from the cut 2026-11-07T00:00Z, rules frozen first, first look 2026-12-19 | R1, R0 | Yes |
| 2: the 100 holdout accounts left out | R2 | Yes for arm A; M3 for arm F |
| 3: δ = +10 bps a copy | R12 DROP | Yes (`DROP_BPS` 10) |
| 4: a script first (now daily, "the paper experiment runs daily and gets a page") | R3a, R15, R17 | Yes |
| 5: the pool only | R2 | Yes |
| 6: the owner's favourites, frozen at the start, judged whole, deciding nothing | R2, R7 FAV | Yes (M3) |
| 7: 3 closed cycles; the 10-cycle line beside | R7 MAIN, TEN | Yes |
| The design text: who (P1 at M), what (OPEN, FLIP, primary cells, every hour, $1,000 at t + D, taker with funding), two readings, three looks 0.5% / 1.5% / 3%, KEEP / DROP / too few, beside lines | R4–R13 | Yes; MAKER and VWAP out (Q-D) |
| The page ruling: every copy, open and closed, the running result per line and per trader with a band, "too early to judge" until each look, keep or drop only at the looks | R15 | Partly: the verdict is not shown (M2) |
| Q1 no 24 h map in MAIN, its closed cells printed apart | R6 | Map not a condition (yes); not printed (M4) |
| Q2 the whole pool once a week | R3a (2) | Yes |
| Q3 a 10-page cap for accounts off the lists, a safety cap for list accounts | R3a | Yes |
| Q4 the code in `apps/poller`, the kit and lib-exits vendored | R0 | Yes |
| Q5 favourites count from the freeze | R1, R2 | Yes (L4) |
| Q6 five lines, the rest at the looks | R15 | Page yes; the rest M4 |
| Q7 Finotive: its rule against copying and its cost facts, no result line, nothing on the daily page | R14 last sentence | Yes |
| Q8 the exams of 11-30 and 12-19 closed; 12-19 the first look | R1 | Yes |
| Q9 / Q-C D1 and D2 after the freeze, with their own share | R17 | Yes |
| Q10 120 a minute and 15 in 5 s | R17 | Yes |
| Q11 the first keep or drop ends the test | R12 | Yes (a label; the log goes on) |
| Q-A one weekly loop | R3a | Yes |
| Q-D MAKER and VWAP a later arm | R7 | Yes |
| Q-E the freeze hashes what runs and tags its commit | R0 | Yes |
| Q-F the pre-cut panel and the seed copied, checked by manifest, backed up | R3, R9, `backup.ts` | Yes |
| Q-G DROP wins a tie | R12 | Yes |
| F1 one loop | R3a | Yes |
| F2 `P ≥ b` in "covered"; a look waits; a standing hole | R3, R16 | Yes (L12) |
| F3 schema alarm, re-parse | R3 | Yes |
| F4 hash what runs, the toolchain, a tag | R0 | Yes |
| F5 `-text` | `.gitattributes` (35 of 35 files `i/lf w/lf attr/-text`) | Yes |
| F6 a code guard for the blind | R0 | Yes |
| F7 D1 and D2 after the freeze | R17 | Yes |
| F8 two pre-cut checks of the new readers | PAPER-BUILD part 2 (180 market-days, 20 accounts, equal) | Yes (done) |
| F9 `planCopy` re-implemented with END | R8 | Yes |
| F10 panel and seed copied, verified by manifest, backed up | R3, R9 | Yes |
| F11 lock, state, pause, task, deploy, compute, retries, safety cap | R3a, R5, R17; `run.ts`; `tools/*.ps1` | Yes |
| F12 / F13 venues | R14 last sentence | Yes |
| F14 formulas, MAKER and VWAP out | R13, R7 | Yes |
| F15 numbers | R17 | Yes |
| F16 (a) DROP wins (b) formulas (c) 2% unpriced (d) a look once (e) covariates deferred | R12, R14, R16 | (e) not said (L9) |
| F17 the page's words, caption, neutral colours, 500 rows, escaping | R15 | Yes; L1 |
| F18 two-sided "5% in all"; the t band beside; venues outside; the daily log; the collector's formats; `once.js` | R12, R14, architecture | t band wrong (M1); the daily log writes every copy each day (PAPER-BUILD's call (8)) |
| PAPER-BUILD Q1 X3 per copy | none needed | Yes |
| Q2 d's removal set = the line's accounts at M | R10 | Yes |
| Q3 label and habits from the fills before M | R5 | Yes |
| Q4 the holdout left out of the reproduction | none needed | Yes |

## What I could not check

Real behaviour after the cut (blind): what the API returns for a split, the
collector's real rule-book documents (read in the collector's code only: the
shapes match `parseRuleBook`), whether the fee schedule's categories match the
kit's (L13). `look()` as written: it cannot be injected (H1), so I ran it only
in a scratch copy with the proposed injection. The effect of fills read after
END_k on a look (L3): in my made-up world no copy was open at END_k, so the
two looks were identical; a world with an order event straddling END_k would
show it. The favourites list (it does not exist yet; M3).
The Windows tasks and the owner's deploy. A 26-week look's run time
(PAPER-BUILD's rehearsal: 12.6 s cold for four weeks). Code quality
(PAPER-CODE-REVIEW's).

## For the freeze day (from this review)

1. The fixes (H1, M1–M5, the low items you take) in one commit with whatever
   PAPER-CODE-REVIEW asks; `pnpm verify`; `node tools/paper-freeze.cjs` (the
   draft) and a clean compile compared with it.
2. `favourites.txt`: at most 20 lower-case addresses, none in the holdout (check
   against `population.json`), written with the Write tool (LF; `git ls-files
   --eol` shows `w/lf`); its first line is `from` and the ISO instant at which
   `--final` is run. Parse it with the run's own `readFavourites` before `--final`:
   a malformed file stops every run after the freeze.
3. `pnpm verify` on a clean tree, `node tools/paper-freeze.cjs --final`, commit,
   tag `paper-freeze-1`, the list's SHA-256 and the tag in decisions before the
   owner's deploy and the first run.

## Questions

1. **The page's verdict (M2).** Show the latest look's MAIN verdict and
   sentence in the box from that look on, or word R15 so that the verdict is in
   the look report only? *Recommendation: show it* — it is your own page ruling
   and a few lines plus a test.
2. **Split days (M5).** Which rule? *Recommendation:* from the UTC day the
   collector first records a non-empty split list, every equity market is left
   out of the primary cells (as a settlement is), copies open across that day
   are unpriced, and the look prints the count. It needs no shape of the event
   and costs the equities after a split; the alternative (leave it as it is)
   lets one ratio jump into the mean.
3. **Holdout favourites (M3).** Refuse them in the code and check your list
   against the holdout at the freeze? *Recommendation: yes.*
4. **The beside lines (M4).** Word them as the look report's arithmetic on the
   position log, or add them to `look`? *Recommendation: the wording;* add code
   later as a new arm if you want them in the program.
5. **A short second read of the fixes** by the supervisor, not a full review?
   *Recommendation: yes.*

## Evidence

All in `workers/PAPER-RULES-REVIEW/`: `scripts/check-tband.mjs` →
`out/check-tband.txt`; `check-lookreport.mjs` → `out/check-lookreport.txt`;
`check-seed-manifest.mjs` → `out/check-seed-manifest.txt`;
`check-plancopy-shift.mjs` → `out/check-plancopy-shift.txt`;
`check-holdout-favourite.mjs` → `out/check-holdout-favourite.txt`;
`check-page-words.mjs` → `out/check-page-words.txt`;
`check-twoway-independent.mjs` → `out/check-twoway-independent.txt`;
`look-e2e.mjs` → `out/look-e2e.txt` (a look end to end in a scratch copy of the
built experiment, `look.js` patched with the `io` argument, mongodb a stub that
refuses to connect, zod and pino read from the repository by a loader hook);
`out/vitest-paper.txt` (70 of 70). Every script reads the repository's built
files and writes nothing there (the scratch copy and its folders live in the
scratch area); the numbers in them are made up.
