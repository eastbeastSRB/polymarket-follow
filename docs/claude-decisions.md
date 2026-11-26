# Decisions log (append-only; newest on top)

2026-11-26 (the supervisor — COPY-H's PART 3, THE COPY ENGINE: ITS PLAN
APPROVED; A NEW CAP FOR ACCOUNTS THE KIT CANNOT HOLD; THE BURN-IN'S
BOUNDARY FIX): **THE OWNER SAID TO START THE ENGINE ("we can start with copy
engine … let's proceed with that", ~08:45Z). ITS PLAN IS APPROVED WITH THE
RULINGS BELOW. BUILDING STARTS WITH COMMITS 1–2.**

**The plan** (COPYH-ENGINE, Opus 5.5, max, fresh; 08:48–09:25Z; its
`progress.md` sections 0–16; nothing built, no data opened):
- **Seven phases:** LABELS (the kit's `labelAt`, one part per bucket and
  block of 8 Mondays); BUILD (events, cycles, entries, `exitRows`, habits,
  lines, plans); REMOVAL (the kit's `removalOf` per coin); TRIPWIRE;
  PRICES (one coin's market objects in memory at a time); RANK; RESULT.
- Every part runs twice in separate processes, byte-equal before a record
  is written (exit 7 otherwise). Each part is written whole and resumable.
- From the paper: `planCopyThrough`, `stopInstant`, `DAYS7_MS`,
  `jumpRatio`, `twoWay`, `dailyEValue`, `smallestEdge`. The kit and
  lib-exits load through `loadResearch`, never copied.
- 16 commits, about 7,000 lines and 8,000 of tests, 3–4 sessions; a fresh
  worker for its breaks round.
- Its machine-time estimate for step 1's engine: about 29 CPU-hours with
  both copies, about 10 hours on 3 workers. To be replaced by measurement.

**The rulings:**
- **Q1, the main risk:** the kit's `labelAt` holds a 90-day capture in
  memory, and C4 needs the whole history's events before EXITS_MAX can be
  counted. Market makers with tens of millions of fills may not fit.
  - (a) The burn-in reports its largest accounts' records, and the
    rehearsal's counts on E give the 90-day figures. Counts only.
  - (b) The kit's bytes and seconds per fill are measured on synthetic
    accounts at full size.
  - (c) Two new caps beside EXITS_MAX. Above **LABEL_FILLS_MAX** an
    account is not P1 at that Monday. Above **HISTORY_FILLS_MAX** it is in
    no line and no removal set. Each is named, counted and printed at every
    look, and set before the freeze from (a) and (b) with a wide margin.
    Their sentences are queued for the rules' last touch.
- **Q2:** a try using `priorMeanNetBps`: the prior count is over all prior
  MAIN copies. The tripwire projects its set without the mean-net
  condition, and says so.
- **Q3:** on a twin difference (exit 7), both copies are moved aside under
  a decisions entry and computed again. The light phases run twice too.
- **Q4:** `markets.ts` builds the market object with the settlement mark as
  a parameter. It is held field for field to the kit's `marketFrom` and the
  paper's `marketThrough` by mandatory tests.
- **Q17:** FRESH-2's integrity sample days are the 15th of each of its
  months. Queued for the rules' last touch.
- Q5–Q16 and Q18–Q21: as the worker recommends (its `progress.md`). Its
  technical calls come to the supervisor for this log.

**The burn-in's boundary fix** (`d42b96a`, COPYH-GUARDS, approved by the
supervisor; 10 breaks killed; 1,031 tests):
- The burn-in's count found 628,022 records (0.285%) failing the
  boundary, mostly takers.
- COPYH-BURNIN's diagnosis, in a scratch copy over 15 files and counts
  only: all 31,194 failures read failed one check. `startPosition` is
  written with 16–18 significant digits (10 fraction digits, a residue
  under 1e-6 of a lot), and its double equals the lot-grid value's (8–9
  digits). The analyzer accepts these records.
- The check now holds `startPosition` to its double's shortest text, the
  re-reader the same in its own code, with the counter `startByDouble`.
- **The recount:** failed 2 of 220,682,866, both in one file whose makers
  equal its takers. `copyh/dirs.json` was committed (`af8076c`).
- The store and its twin are built: 180,194,608 fill rows, 0 duplicates,
  0 straddles. Integrity is running.

**Queued for the rules' last touch at part 5:** 10 sentences now:
1. another repeated record is a stop;
2. the heap cap;
3. holes at the ends;
4. a line that does not tile;
5. C0's funding seal by time;
6. the burn-in's sample days;
7. C3's `startPosition` read as its double;
8. LABEL_FILLS_MAX and HISTORY_FILLS_MAX;
9. FRESH-2's sample days;
10. a finite guard on `sz` (on the code's fix list too).

2026-11-26 (the supervisor — COPY-H's STORE GUARDED: EVERY KILLABLE BREAK
KILLED; THE BURN-IN STARTS; THE FUNDING DOWNLOAD'S NIGHT STOPS): **207 OF
209 BREAKS NOW KILLED (SL14 EQUIVALENT, D05 PROVISIONAL BY DESIGN).
`dist/copyh.js` RUNS ON REAL DATA FOR THE FIRST TIME, ON THE BURN-IN, COUNTS
AND TIMING ONLY.**

**COPYH-GUARDS** (Opus 5.5, max, fresh; 00:59–06:56Z, pausing heavy runs
02:30–06:00Z; context peak 655,571). Nine commits, each `pnpm verify`
green; files only in `src/copyh/` and `test/copyh-*`:
- `caef6b4`, the three fixes, each with its test:
  - the re-reader reads a blank line as one failed record, C3's own
    reading; the pass is unchanged;
  - the re-reader leaves the switch hour's repeats out of its rows by its
    own code;
  - `sampleDaysOf(range)` in `range.ts`: S's days for S, E's for E and the
    burn-in, which holds 3 of them.
- `c784c44` … `99010f1`, the spec's tests by group. Ends at 1,028 tests + 6
  skipped in 108 files (+1 skipped).
- One verify was rerun after a vitest fork crash in a non-COPY-H file, as
  code-rules says.
- In a new lane from `caef6b4` (control 193 of 193), 88 breaks were re-run
  and 88 killed, 0 invalid: the spec's 80 survivors, X13, and seven breaks
  of the fixes. The supervisor's tally of its `results.jsonl` agrees.
- Its departures from the spec are each forced by the code: R23 (a month
  boundary inside one bucket group), R28 (a part holds at most 256 `dir`
  names), R38 (six events at one account and time), R54 and R16 (the exact
  heap limit).

**Rulings on its questions:**
1. A repeat in the switch hour's bars needs no change: the two files'
   records lie 4 min 22 s apart. The rehearsal's duplicate count confirms 0
   on E.
2. The burn-in re-reads E's 3 days it holds. A sentence on it is the
   sixth one queued for the rules' last touch.
3. `main.ts`'s one-line call is accepted.
4. The docs (architecture's integrity paragraph; two code-rules gotchas)
   are done by the supervisor (`4ed84f2`). COPYH-BREAKS' lane junctions are
   removed (15, link by link; the repository's `node_modules` intact).

**COPYH-BURNIN** (Opus 5.5, xhigh, fresh) started at 06:59Z:
- `coins` runs, and `copyh/coins.json` is committed with `meta.json`'s
  SHA-256;
- `count --range burnin` runs, and its `dir` values and unpaired records
  come to the supervisor, who rules `dirs.json` and `unpaired.json`;
- then `build`, `build --twin` and `integrity` on the burn-in.

**The funding download's night** (COPYH-FUNDING):
- Session 2 was clean: 2,000 reads from 21:46Z to 01:06Z.
- Its chain stopped the fetch four times on the collector's price audit,
  each judged no harm from the collector's own logs:
  1. 01:07Z: 28 timing misses, 0 other.
  2. 01:28Z: one other miss.
  3. ~04:38Z: one or two other misses in three audits running, with no read
     of ours since 02:29:55Z.
  4. 04:48Z: one no-book in an audit of 91 rows, a market just listed. Its
     book came the next audit, and a new instruments key,
     `post_only_since`, appeared at 04:52Z.
- Audits with an other miss, no download involved: 11-20 65 of 135, 11-21
  0 of 136, 11-22 1 of 136, 11-23 12 of 136, 11-24 71 of 132, 11-25 2 of
  135.
- **The chain's stop rule now** (the supervisor's technical call):
  - 10 or more other misses in one audit;
  - a no-book in two audits running, or 3 or more in one;
  - a stale heartbeat or a closed connection;
  - a collector error;
  - the tool's own day stop.
  The tool's own pause below 81 of 90 is unchanged.
- At 06:58Z: 3,568 files stored, the fetch running again since 06:00Z.

2026-11-26 (the supervisor — COPY-H's STORE: THE BREAKS ROUND DONE; ITS
TESTS AND THREE CODE FIXES START): **209 BREAKS, 126 KILLED, 83 SURVIVED, 0
INVALID; NO REAL BUG FOUND; THE 83 ARE TEST GAPS.**

**The round:** COPYH-BREAKS (Sonnet 5.5, max, fresh; 00:12–00:58Z; context
peak 716,210).
- It ran in one scratch lane cut from `9114ae9`, whose code equals HEAD's.
  The control passed 146 of 146 tests in 19 files.
- Each break ran over all 19 COPY-H test files.
- Its predictions were pinned before any run and held: 121 of 122 predicted
  kills killed, 82 of 87 predicted survivors survived. The five surprises
  were kills by an accident of a test.
- **The supervisor's tally** of its `results.jsonl`
  (`verify/COPYH-BREAKS/tally.cjs`) gives the same numbers.
- The weightiest gaps:
  - P04: a resumed pass could lose the 1% day rule;
  - M04: a self-trade taken for a repeat;
  - M06 and M07: the month filter, whose test worlds lie in one month;
  - W04 and W05: ids above 2^31 or of 16 digits;
  - N01: nothing proves the cut fields never reach `JSON.parse`;
  - I01 and I02: the merge's counts;
  - P13: the worker ceiling computed in decimal GB.
- SL14 is shown equivalent. D05 is provisional by design.

**Its findings, on the code's fix list:**
1. The pass counts a blank line as a failed record; the re-reader skips it.
2. The re-reader keeps the switch hour's repeats, which the store drops.
3. The sample days need extracting from `main.ts` (`sampleDaysOf`), so a
   test can reach S's.

**Next:** COPYH-GUARDS (Opus 5.5, max, fresh) makes the three fixes, each
with its test. It then writes the spec's 54 rows (80 of the 83 survivors)
and re-runs each group's breaks in the lane to show them killed. The
burn-in follows on the supervisor's word.

2026-11-26 (the supervisor — COPY-H's STORE BUILT TO ITS MEASURED CEILINGS;
A NODE BUG CHECKED AGAINST EVERY PAST READ; THE BREAKS ROUND RUNS): **PARTS
1–2 ARE BUILT BUT FOR THE BREAKS ROUND'S TESTS. NO PAST RESULT IS TOUCHED BY
THE BUG.**

**COPYH-STORE-2's last commits** (Opus 5.5, max; context peak 733,201 by
the meter; each `pnpm verify` green, its files only):
- `1f7a376` commit 6: the twin, integrity K0–K3, the independent re-reader,
  `integrity --range`.
- `45b5f4c` commit 7: `funding.ts` (C9's reader, the nominal hour by
  `Math.round`) and `copyh-freeze.cjs --data --funding`; a data-list reader
  bug of commit 5 fixed before any run.
- `5121a97` commit 8: `WORKER_HEAP_GB` = 8, three times the largest peak
  measured on full-size synthetic hours (pass worker 2,525 MB heap; merge
  1,765 MB; integrity 346 MB; a re-read day 652 MB; three pass workers at
  their peaks about 12.5 GB of the PC's 31.9 GB). `UNIT_ROWS` 12,000,000
  and `UNIT_BYTES` 2 GB kept. 981 tests + 6 skipped.
- `e77bd6d` commit 9: architecture's "COPY-H" section.
- My rulings on commits 6–7's notes: the re-reader's ±1-file pairing
  accepted; `integrity --diff` only if a K2 failure happens; C3's "a line
  that does not tile" queued for the rules' last touch; `--funding` after
  the download.

**The Node bug** (found by the measurement):
- Node 24.13's `Buffer.indexOf` returns a wrong negative offset for a match
  past 2^31 bytes. The supervisor reproduced it
  (`verify/NODE-INDEXOF/demo.out`: −2,147,483,148 for 2,147,484,148;
  `Uint8Array.indexOf` right).
- COPY-H's re-reader now searches 256 MB windows (`eachLine`).
- The frozen `linesOf` (`src/waveh/store.ts`) searches whole decoded
  files. WAVE-H's pass, WAVE-H's books reader and the analyzer's sample
  days (`polish/days.ts`) read through it.
- **Checked against every file they read:** the stores' manifests rank the
  files. The four over 200 MB were decoded block by block. The largest,
  the crash hour 2025-10-10 21h, is 2,100,288,284 B, 97.8% of 2^31. Every
  other fill file is at most 198 MB compressed against ratios of 4.95–5.85
  (external-apis, "the largest hours"). So no file passed the bound, and
  WAVE-H's look, the analyzer's builds and the exam's look 1 stand as
  recorded.
- COPY-H reads FRESH-2 with its own code, so a larger future hour is safe
  there.

**The breaks round:** COPYH-BREAKS (Sonnet 5.5, max, fresh). Its plan: 201
breaks in 24 files, 117 predicted killed, 83 survivors, 1 equivalent, pinned
before any run. GO at 00:12Z on `e77bd6d`: the 83 survivors and the
equivalent first, then tier 1's kills, a report; then the killing tests
committed. Its rulings: the funding seal by a row's time, tested at
END_E − 500 ms and at END_E (C0's wording queued); blank lines pinned in the
pass and their alignment with the re-reader on the code's fix list.

**Queued for the rules' last touch at part 5:** five sentences (another
repeated record a stop; the heap cap; holes at the ends; a line that does
not tile; C0's funding seal by time).

2026-11-25 (the supervisor — COPY-H's STORE: COMMITS 4 AND 5; THE BUILDER'S
EIGHT QUESTIONS RULED; THREE SENTENCES QUEUED FOR THE RULES' LAST TOUCH):
**`dist/copyh.js` EXISTS (THE SIXTH ENTRY POINT): `coins`, `count`, `build`;
THE STEPS' COMMANDS GATED AND NOT YET BUILT. NOTHING RAN ON REAL DATA.**

**The commits** (COPYH-STORE-2, Opus 5.5, max; each `pnpm verify` green,
its files only):
- `2ff8976` commit 4: the store to the committed C3 and C18 (`design.ts`
  holds every C18 row, held both ways by `test/copyh-rules.test.ts`; "Net
  Child Vaults" left out; the bars' vault and Settlement sums; the 15-digit
  boundary; exact holes over the union of files; a record met twice dropped
  only between the switch hour's two files). 104 test files, 949 tests + 6
  skipped.
- `caf3aab` commit 5: the launcher `src/copyh.ts` and `main.ts` (`coins`,
  `count --range` listing every `dir` exactly, `build --range [--twin]`;
  `step1`, `tries`, `choice`, `step2`, `fresh2` gated, exit 4); the gate's
  closure, `checkKit()` and lists by content; FRESH-2's seal; the settings
  `FRESH2_STORE`, `PAPER_SEED`, `COPYH_HEAP_GB`; `RUN_MINUTES` = 14. 106 test
  files, 964 tests + 6 skipped.
- Between `5a80af5` (22:13Z) and `caf3aab` (22:31Z) a verify would have
  failed on the rules test (C18's new row); no other worker ran one.
- The builder stopped believing its context at 80%; `tools/context-usage.mjs`
  read 485,550 (~50%). It is resumed with its context, for its items 1–2.

**The rulings on its questions:**
1. The Settlement sums count every Settlement record of the minute, either
   side: as built.
2. **A record met twice outside the switch hour stops the build (exit 5).**
   - The analyzer's merge met none: 0 duplicates in 448,389,336 tape,
     247,493,526 bars and 10,763,876 liq records over WAVE-H's months, and
     0 in FRESH's 275,474,513, 87,206,805 and 6,308,826 (its store
     manifests' `counts.merge`, read 22:33Z, counts only).
   - The rehearsal builds E's store before the freeze, so a repeat on E
     would show while it can still be fixed. On S or FRESH-2 it is one of
     C17's other stops.
3. `COPYH_HEAP_GB` is capped at C18's `worker heap cap GB`, 20; above it is
   exit 2, and a step that needs more cuts its parts smaller. The heap
   measurement also reports the sum of all threads' peaks against the
   machine's memory.
4. Holes at the window's ends count, as C3's "inside [ARCHIVE_START, END)"
   already says.
5. The funding hour by `Math.round`, a row at +30 min to the next hour, as
   WAVE-H's H9; pinned by a test with rows 887,645 ms late, at +30 min and
   early. The two late hours are 2025-07-19 10:00Z (+887,645 ms) and
   2025-07-27 12:00Z (+110,963 ms), every coin; the supervisor's
   `store-check.cjs`.
6. The three closure files not yet imported stay in the test's pending
   list until the import comes.
7. C18 and `design.ts` change together.
8. `coins` runs and `coins.json` is committed, naming `meta.json`'s
   SHA-256, before the burn-in's count.

**Queued for the rules' one last touch at part 5,** with the code review's
findings: rulings 2 (C3 and C15's exit-5 list), 3 (C15's cap) and 4 (C3's
holes phrase). The builder builds to them now.

2026-11-25 (the supervisor — COPY-H's RULES READY): **`copyh/rules.md` IS
READY TO FREEZE WITH THE CODE: SHA-256
`38ff9dbdec3ad7a4af0d04fd6ea608b832f4cb88c8cf432f93a0da4240ebc349`, 1,494
LINES, 96,015 B (`5a80af5`). NOT FROZEN UNTIL PART 5.**

**The last round:** COPYH-RULES, resumed 22:12Z, one commit `5a80af5`
(rules.md only; Prettier clean; no CR byte; context peak 703,919). It
applied the fix-check's F1–F7, F9 with its question 2, and F8 (e) in the
check's section 7 wording; kept F8 (a, b, d, f, g); declared F8 (c), the
colon in C9's marker that makes it a marker under C17.

**The supervisor's check:** the diff `9fee674..5a80af5` holds 12 hunks, each
one of those items in section 7's words, and nothing else; the hash and
size equal the report; no `[OPEN Q` marker; the six `[SET BEFORE THE
FREEZE` marks unchanged (the settlement mark and the worker heap).

**What follows for the rules:**
- They change again only through a finding of the code's review (part 5)
  or a value set by the rehearsal (the two marks), each recorded here.
- They freeze with the code under `copyh-freeze-1`.
- COPYH-STORE-2 builds to this text (`38ff9dbd…c349`).

2026-11-25 (the supervisor — COPY-H's RULES FIX-CHECKED): **"READY AFTER
THESE FIXES": 0 HIGH, 1 MEDIUM, 8 LOW, ALL TEXT; NO NUMBER, BAR, DESIGN OR
GUARD TOUCHED. A LAST SMALL ROUND, THEN THE RULES ARE READY TO FREEZE WITH
THE CODE.**

**The check:** `docs/reviews/copyh-rules-fixcheck-2026-11-25.md` (`d703c47`).
- COPYH-RULES-FIXCHECK: Sonnet 5.5, max, fresh, 21:42–22:11Z, context peak
  519,784. Read only; its bar written in its brief before it read the
  text.
- 61 items checked from the text: 48 exact, 12 kept in meaning, 1 partly
  applied (RL1: F2). RM3 (b) and RM4 (b) correctly absent.
- 43 hunks of `fa52406..9fee674`: 36 trace to an item; 7 have no source,
  none changing a rule, a number or a bar.
- The four declared changes of form: each keeps the meaning and was needed.
- Markers: no open question; the six `[SET BEFORE THE FREEZE` marks are
  the settlement mark's and the heap's only. Every C18 row equals its
  mentions; the 15 sample days equal the analyzer's `gates.ts`; the guards
  hold (nothing priced before the freeze but an in-memory hash, FRESH-2
  unseen, no choosing month judges).
- **F1 (medium):** C16's tripwire would count a `settled` copy's last leg
  as unpriced on a quiet coin, though RM4 prices it at the Settlement. The
  supervisor read the lines and agrees.
- **Low:** F2 RL1's "DATA END"; F3 the heap in C0's identity list; F4 C18's
  14 run minutes; F5 C3's `--data` names the funding files; F6 three stops
  in C15's exit-5 list; F7 a test pin for C17's marker definition; F8 (e)
  a lost code-rules pointer restored, (c) the colon in C9's marker kept and
  declared, (a, b, d, f, g) kept; F9 C13's `settled` print.

**The supervisor's rulings on its questions:**
1. A `settled` copy with no d (a Settlement under 24 h after its follow
   instant) is printed only (F9); valuing d at the Settlement would be a
   rule change, not made.
2. Yes: C13 also prints the entries C6's rule 2 leaves out.
3. One small commit by COPYH-RULES now (its context ~70%, the round about
   20 lines, the exact wordings given); the supervisor reads its diff
   against the check's section 7; no second full check.
4. `merge.ts` follows D2's scope: COPYH-STORE-2 has it (its commit 4).

2026-11-25 (the supervisor — COPY-H's RULES FIXED; THE FIX-CHECK STARTS;
THE STORE'S BUILDER HANDED OVER): **THE REVIEW'S FINDINGS AND EVERY RULING
ARE APPLIED; `copyh/rules.md` IS NOW SHA-256
`47bd169acfa9e95b9c9944daadd2ed76b39e946f686a345e9baf7ceb2d3b3b64`, 1,480
LINES. NOT FROZEN: IT FREEZES WITH THE CODE.**

**The fix round:**
- COPYH-RULES (Opus 5.5, max), resumed 21:28Z, done 21:40Z. Context peak
  681,385. Commits `77d014e` (intro, C0–C3), `540a6e3` (C4–C9), `f89dfb1`
  (C10–C14), `9fee674` (C15–C18), each touching only `rules.md`.
- Applied: RH1 (a)–(g) and C17's sentence, RM1–RM8, RL1–RL13, D1–D15, the
  review's section 5 wordings 19 and 20, the owner's RM3 (a) and RM4 (a),
  the supervisor's Q3–Q10, and C0 naming `dist/polish/tables.js` beside
  `lz4.js` (COPYH-STORE's commit 3 added it to the closure).
- **Four changes of form, declared:** RM8's head and C17's marker sentence
  reworded so the file does not itself hold the marker its freeze check
  refuses; C15 (c) 3's marker joined onto one line; D2 kept to the switch
  hour's two files; RM3 (b) and RM4 (b) not applied (the owner chose (a)).
- **The supervisor's check:** the hash and size equal the report; the four
  commits change only `rules.md`; no `[OPEN Q` marker is left; the six
  `[SET BEFORE THE FREEZE` marks all name the two values the rules name
  (C9's settlement mark, C15's worker heap); Prettier clean; no CR byte;
  five fixes read in place (EXITS_MAX in C4 and C18, `settled` in C6 and
  C8, C17's two outcomes, `tables.js` in C0). The access scan: two folder
  listings, nothing opened.

**Next:**
- **COPYH-RULES-FIXCHECK** (Sonnet 5.5, max, fresh): every item applied
  exactly or in full meaning, every hunk of `fa52406..9fee674` traced to an
  item, the four changes of form judged, markers, consistency, the guards.
  Verdict "ready" or "ready after these fixes".
- **The code items the new rules ask of the store** (the review's section
  5) are passed to the store's builder.

**COPYH-STORE handed over.** At 21:30Z its context read 912,605 (~94%),
past the 70% stop; told to stop, it committed commit 3 `36b4924` (the scan,
writers, market-trade pairing, parts, the pass by worker threads, the
merge, the store; `pnpm verify` green, 104 test files, 940 tests + 6
skipped) and wrote its successor's notes. **COPYH-STORE-2** (Opus 5.5, max,
fresh) started 21:37Z on the owner's yes, on the same brief with an
addendum: the commands, the twin, the integrity checks and re-reader, the
measured heap ceilings, the breaks round, then a stop and a report before
the burn-in run.

2026-11-25 (the owner's rulings on RM3 and RM4 — "I agree with your recommendation … let's proceed like you suggested"):
- **RM3:** no filter by side among the rounds' tries. Longs and shorts stay printed apart (SIDES), deciding nothing.
- **RM4:** a copy still open at its coin's first Settlement (a delisting) is valued at the Settlement price, flagged `settled`, and every look prints MAIN with and without such copies (the review's option (a)).

The rules' fix round starts now. COPYH-RULES, resumed, applies:
- the review's RH1, RM1–RM8 and RL1–RL13, each in its given wording;
- D1–D15 (the review's section 4);
- these two rulings;
- the supervisor's rulings on the review's Q3–Q10 (decisions `d8cd4a1`).

Then a short fresh fix-check.

2026-11-25 (the supervisor — COPY-H's RULES REVIEW): **"MAY FREEZE AFTER
THESE FIXES". 1 HIGH, 8 MEDIUM, 13 LOW; NO NEW DESIGN. TWO ITEMS ARE THE
OWNER'S (RM3, RM4).**

**The review:** `docs/reviews/copyh-rules-review-2026-11-25.md` (`4588143`).
- COPYH-RULES-REVIEW: Fable 5.2, max, 17:11–17:55Z and 21:12–21:17Z after
  a usage-limit stop. Context peak 637k. Read only; no data, no network.
- `copyh/rules.md` is unchanged (`f4067942…00ae`).
- **What it confirmed:**
  - all 20 plan-review fixes and the owner's eight rulings are in the text;
  - no choosing month judges; nothing is priced before the freeze but a
    hash; FRESH-2 is unseen;
  - the paper's rules are mapped without a silent change;
  - every bar is recomputed equal;
  - MAIN's 32 states each have one reading.
- **RH1:** seven stops could first fire after look 1's result. Each gets
  written outcomes now, and C17 says a stop after the freeze has two
  outcomes only: run again unchanged, or not run with its months sealed.
  - It includes EXITS_MAX = 20,000,000 (the kit's exit rows) in place of
    EVENTS_MAX;
  - the heap is a ceiling a later step may raise, never lower.
- **RM1–RM8:**
  - a try's readings completed;
  - freeze lists asked for by content, not by number;
  - **RM3 side filters (the owner's)**;
  - **RM4 copies open at a delisting (the owner's)**;
  - the funding from M₀ with every window listed;
  - the known-answer test gains d and the market object;
  - FRESH-2's seal and stage;
  - the file closes when the rehearsal first runs on real months.
- **RL1–RL13:** wording and C18 rows.
- **COPYH-STORE's 15 differences:** it agrees with all 15 and gives their
  wording (its section 4). It lists 23 mismatches with the code, most of
  them parts not built yet.

**The supervisor's rulings on its technical questions (3–10)**, all as it
recommends:
- **Q3:** EXITS_MAX = 20,000,000.
- **Q4:** a try is data (`copyh/tries.json`), not code.
- **Q5:** d in the known-answer test.
- **Q6:** all 15 of the analyzer's sample days on E, written into C18.
- **Q7:** the kit's own panel path, held to its pinned hash.
- **Q8:** the build's fix-check computes H1's ratio, and the file closes
  at the rehearsal's first real run.
- **Q9:** one line in C15 for the `burnin` range.
- **Q10:** the calibration against books only if WAVE-H's reader serves it
  unchanged.

**For the owner** (asked the same day):
- **RM3:** filters by side are not allowed, recommended; longs and shorts
  stay printed apart.
- **RM4:** copies still open when their coin is delisted are valued at the
  settlement price, flagged, and printed with and without, recommended;
  the alternative drops them as the paper does.

**Next:** the rules' fix round. COPYH-RULES, resumed, applies RH1, RM1–RM8,
RL1–RL13, D1–D15 and the owner's two rulings. Then a short fix-check.

2026-11-25 (the supervisor — COPY-H's RULES DRAFTED; THEIR FRESH REVIEW
STARTS): **`apps/poller/copyh/rules.md`, C0–C18, 1,239 lines, SHA-256
`f40679423fa6f11d2a66f418ecd14605d33a1919eb2a5000ed026a86661100ae`, IS
WRITTEN BY COPYH-RULES. IT IS NOT FROZEN. EVERY REVIEW FIX AND OWNER RULING
IS PLACED (ITS TABLE IS IN ITS REPORT).**

**The draft:**
- Commits: `36db11a` (C0–C3, C15–C16 and `.prettierignore`), `02e65bc`
  (C4–C14, C17, C18), `fa52406` (a consistency pass).
- COPYH-RULES: Opus 5.5, max, 16:31–17:10Z. Context peak 518k. No code,
  no data, no network.
- **Corrected from the sources:**
  - the reproduction's FIND-6-EXITS count is 1,700, not 1,918 (218 were
    holdout copies the seed does not hold);
  - the reproduction's labels use R5's whole capture;
  - C9 uses the paper's `marketThrough`, since `marketFrom` refuses an end
    after 2026-11-07;
  - fills at stage boundaries are stated (C1);
  - an always-true "primary" condition is dropped (C6).
- **Guards it added:**
  - a funding file that fails its schema, or two rows in one hour, stops
    the step;
  - MAIN's removal set is used for lines made of MAIN's copies;
  - the rehearsal's store is sealed before step 1.

**The supervisor's provisional rulings on its open questions**
(technical calls, for the rules review to check):
- **Q1** EVENTS_MAX: twice the largest P1 account's count on E, within one
  part.
- **Q2** the heap: twice the rehearsal's peak, at most 20 GB, parts cut
  smaller above that.
- **Q3** a failed label check reads the whole capture (R5); no second
  bound.
- **Q4** every engine part runs twice in separate processes, held equal.
- **Q5** the slice is 0 mod 32.
- **Q6** taker records are printed by dir and method in the rehearsal; any
  vault taker leaves the tape like ADL, ruled before the freeze.
- **Q7** RANK's fifth is the top ⌈n ÷ 5⌉, ties by address.
- **Q8** Holm orders by min(m ÷ SE, m′ ÷ SE′).
- **Q9** COPY-H's list never changes; it runs from its own tag's build.
- **Q10** 1,700 of 1,700.
- **Q11** FRESH-2's reads are asked of the owner only when needed.
- **Q12** `coins.json` from the funding fetch's first stored `meta`.
- **Q13** the sample days 2025-07-27, 2025-10-10, 2026-03-15 (E), 2026-06-15
  and 2026-10-15 (S).

**Next:** COPYH-RULES-REVIEW (Fable 5.2, max, fresh), against the plan, the
review, the rulings and the frozen paper rules. Then fixes, the code's
review and the freeze.

2026-11-25 (the owner's rulings — COPY-H'S PLAN APPROVED): **"i agree with
everything, let's proceed with your suggestion. let's start." THE PLAN
(`83ac6ba`) IS APPROVED WITH EVERY FIX OF ITS REVIEW (`dda8d38`). THE BUILD
STARTS, WITH ITS INDEPENDENT PARTS IN PARALLEL.**

The eight rulings, as the supervisor recommended:
1. **The plan is approved with all the review's fixes,** H1–H2, M1–M9 and
   L1–L9, written into the rules exactly.
2. **H1: the edge over the market decides beside the money.**
   - x′ = d − the copy's own 24-hour cost, with SE′ the larger of the
     two-way errors by UTC day and by UTC week.
   - DROP needs m + z·SE < +10 and m′ + z·SE′ < +10.
   - KEEP needs m − z·SE > 0 and m′ − z·SE′ > 0, plus the two sign
     conditions and M6's thin-tape mean.
   - The same pair holds at the choice, the confirmation and the seal.
3. **H2 (a): the owner's filter rounds run whatever look 1 says.** The at
   most two tries chosen are the only variants ever judged.
4. **The stop rule's "after COPY-H's one look"** now reads "after COPY-H's
   step 2", the hybrid's confirmation (WORKFLOW amended the same day).
5. **The funding fetch:** settled `fundingHistory` for every main-dex coin
   (`meta`: 235, 56 delisted; about 6,100–6,700 keyless reads, about 230 MB,
   3.7–8 hours at half budget, in sessions with a safety stop). Approved
   under Iron Rule 1, Hyperliquid's public read-only info API.
6. **The bar:** δ = +10 bps a copy on Hyperliquid's base-tier taker costs
   (4.5 bps a leg), with the break-even round trip printed. Propr's fees are
   Hyperliquid's (decisions 2026-11-25, PROP-FIRM-FACTS).
7. **FRESH-2's window** is fixed now at 26 weeks, [2026-11-16, 2027-05-17).
   It stays unseen until a yes needs confirming.
8. **The planner's slice rows** (888 hourly files with fill prices, 257 MB,
   in its scratch `COPY-H-PLAN\out\w2025\`): deleted by the supervisor at
   16:28Z. Nothing was computed from them; the counts' outputs stay.

**The build's first parts, started in parallel:**
- **COPYH-RULES** writes `apps/poller/copyh/rules.md` (C0–C17 with every
  fix and ruling), and then gets its fresh rules review.
- **COPYH-FUNDING** (part 0): the fetch tool's funding mode for COPY-H's
  coins, its tests, then the fetch in sessions.
- **COPYH-STORE** (parts 1–2): the readers, the seal, the gate, and the
  pass and store of every main-dex account's perp fills, built twice and
  held equal.

The later parts follow the plan's section 7: the copy engine and the
rounds' runner; the reproduction and the rehearsal; the reviews and the
freeze; look 1; the rounds; look 2.

2026-11-25 (the supervisor — COPY-H's PLAN REVIEW): **"APPROVE AFTER THESE
FIXES". 2 HIGH, 9 MEDIUM, 9 LOW; NONE ASKS FOR A NEW PLAN. NO MONTH THAT
CHOOSES ALSO JUDGES.**

**The review:** `docs/reviews/copy-h-plan-review-2026-11-25.md` (`dda8d38`).
- COPY-H-PLAN-REVIEW: Fable 5.2, max, 13:04–13:49Z, then 16:13–16:21Z
  after a usage-limit stop. Context peak 733k (76%).
- **Access clean:** only COPY-H-PLAN's scripts and outputs and WORKFLOW;
  no file on F:.
- **Its evidence:** four scripts of its own on the plan's numbers (no data
  read), in its `progress.md`. A first formula slip (r1, section D) was
  caught by its simulation and replaced by r3.

**A correction to the supervisor's earlier entry** ("COPY-H's plan is
written; its fresh review runs"): by the plan's C14, a filter chosen on E
is confirmed on S alone, then judged on FRESH-2 alone. MAIN, frozen on
Polymarket's weeks, is judged on E and on E ∪ S. So no choosing month
judges. The plan's recommendation line 3 and that entry read otherwise,
and both are mended by the rules.

**Its findings:**
- **H1 (high).** MAIN leans long (0.32; 63–70% long in every account
  group), and 21% of entries are still open at their week's end. So entry
  days are not independent, and the money reading's true spread is about
  3 times the error an entry-day cluster reads.
  - **Fix:** a second deciding quantity, the edge over the market (x′ = d
    − the copy's own 24-hour cost), with an SE by UTC day and by UTC week.
  - **DROP** needs both m and m′ under +10 at z.
  - **KEEP** needs both above 0, plus the two sign conditions.
  - The same pair holds at the choice, the confirmation and the seal.
- **H2 (high).** What a DROP at look 1 does to the rounds is unwritten.
  **Fix:** one sentence chosen by the owner now.
- **M1–M9:**
  - market trades only, never the backstop's, ADL's or Settlement's;
  - the tripwire's third unpriced reason;
  - the label check moved, and its cost stated (~15 CPU-hours);
  - histories only for accounts that are P1 at some Monday, and a twin
    for the engine's run;
  - the rounds' loose ends (no try from the wave's family, k = 18, Holm's
    m 2);
  - a thin-tape guard;
  - DELAY0 at the minute's last price and no SPEED line;
  - the yes sized on page one;
  - no priced rehearsal file kept.
- **L1–L9:**
  - FRESH-2 fixed now at 26 weeks, [2026-11-16, 2027-05-17);
  - `coins.json` from `meta`;
  - the funding fetch in sessions;
  - the others small.

**The power, recomputed with its own code:** every cell of the plan's table
equal; one differs by a point. With H1's fix, in the central case, no
edge reads DROP about 91% of the time (60% at the worst corner), a real +15
reads KEEP 60–74%, and there is no wrong-side verdict. The plan gate holds.

**For the owner:**
1. approve with the fixes;
2. H1;
3. H2 (rounds still run after a DROP, recommended, or a DROP ends COPY-H);
4. the stop rule's "one look" becomes "after COPY-H's step 2";
5. the funding fetch;
6. the bar at +10 bps on base-tier costs (Propr's are Hyperliquid's);
7. FRESH-2 at 26 weeks;
8. delete the planner's slice rows that hold fill prices (its scratch).

**Then:** a decisions entry with the owner's rulings; the builder writes
`copyh/rules.md` with every fix; its own fresh rules review; the build in
parts.

2026-11-25 (the supervisor — "THE CRASH SIDE ONLY" FROZEN AS ONE PAGE; NOT
BUILT): **`apps/poller/crashside/rules.md`, COMMIT `a2495d0`, SHA-256
`b8295eb6d5bd73c07743cea289d3c15728ca4b465a6db430371051c2477aafd6`, FROZEN
BEFORE FRESH-2 EXISTS ON DISK. ITS PLAN GATE FAILS, SO IT IS NOT BUILT AND
IS LOOKED AT AGAIN ON 2027-05-08.**

**The page** (CRASH-SIDE-PAGE, Opus 5.5, max, 12:52–13:27Z; context
measured at its report):
- **The rule:** the exam's 715 line, slices 0–19, only the positions
  entered on a forced sell (dir +1). Entries are still placed over both
  sides; there is no safety net.
- **The months:** FRESH-2, 2026-11-16 → END 2027-11-16, with one look from
  about 2027-11-18.
- **The price:** every leg at the tape, H8's walk over [x, x + 1 h); no
  `l2Book`. A coverage check at step 1 reads WITHHELD above 5%, before any
  price.
- **The verdict:** P11's ladder at the exam's one-look bars (z 2.6533,
  LIKELY 2.2126).
- **The gate** (from look 1's report: 2,715 forced-sell positions on 21 of
  91 days, an SE of about 106.3/√months): a clear answer in 12 months
  comes 52% of the time at a true +83, 16% at +50, 7% at +25 and 16% at 0.
  Weighted alike: 22.5% at 12 months.

**The supervisor's rulings on its questions:**
1. **The rounding slip** stays in the page and is corrected here: S5's
   "+83 / 18 months 75%" is 74.495%, and the weighted 12-month figure is
   22.500%. They change nothing.
2. **`apps/poller/crashside` joined `.prettierignore`** beside the other
   frozen folders, so a formatter cannot change the hash.
   `prettier --check .` is green.
3. **The tape over one hour, and z from the exam's bars:** accepted as
   written.
4. **F8's book condition** is replaced by the mean of positions with no
   depth-short leg: accepted.
5. **The gate is judged at +50,** or the four alike, not at the +83 picked
   after the look. **It fails, so it is not built** (the owner's ruling
   item 8; WORKFLOW's plan gate).
6. **FRESH-2** may still confirm a COPY-H "yes", because copies are not
   this page's positions. Any print of FRESH-2's crash-hour moves would be
   a look at this page's months, and its plan must say so.
7. **Done:**
   - the plan page's crash-side bullet points to the page, "not built",
     2027-05-08;
   - current-task's item 3 is done;
   - the page's arithmetic scripts read no file, so they fit "no program
     run".

2026-11-25 (the supervisor — PROP-FIRM-FACTS): **OF TWELVE FUNDED-TRADING
FIRMS WITH CRYPTO, ONE, PROPR, PERMITS IN ITS OWN TERMS COPYING FROM AN
OUTSIDE ACCOUNT, AND IT TRADES HYPERLIQUID'S PERPS AT HYPERLIQUID'S FEES.
THE SUPERVISOR READ THE CLAUSE AT ITS SOURCE.**

**The report:** `docs/reviews/prop-firm-facts-2026-11-25.md` (`60a5a36`).
- PROP-FIRM-FACTS: Sonnet 5.5, xhigh, 13:00–13:18Z. Context peak 273k.
- Web reading only (WebFetch and WebSearch): no form, no click, no
  sign-up.
- Every fact is dated and sourced; where its reader paraphrased, the
  report says so.

**The finding:**
- **Propr** (`propr.xyz`, BVI, launched 2026-02-25):
  - The terms page, read by the supervisor in the browser pane on
    2026-11-25 ~13:20Z, says word for word: "Copy trading from an
    external, non-Propr account into a single Account is permitted."
  - Beside it, mirroring across one's own Propr accounts is barred: "Each
    account must be traded independently."
  - Hyperliquid perps with more than $1M open interest, routed through
    Hyperliquid; "standard Hyperliquid maker/taker fees apply".
  - Leverage: 10x on BTC, ETH and SOL, 2x on other crypto.
  - Weekends, news, holding and bots permitted; daily loss 3% or 5%;
    payout 80% in USDC.
  - Young and unregulated, with simulated accounts. Its rulebook and its
    terms disagree on one line.
- **MyFundedPerps** and **FTMO** are unclear or silent and need a written
  answer.
- **Nine forbid following third parties:** Finotive, FundedNext, The5ers,
  Breakout, HyroTrader, Crypto Fund Trader, BrightFunded, E8, HyperPnL.

**Its questions** (for the owner; the supervisor recommends as the report
does):
1. Shortlist Propr, subject to a written answer from its support on
   following public Hyperliquid addresses by hand.
2. Ask MyFundedPerps and FTMO the same as fallbacks.
3. A small read-only follow-up on Propr: its live asset list against the
   38 coins, the rest of its terms, its prices against Hyperliquid's.
4. Hold any account-level test until COPY-H gives a clear yes (the stop
   rule).
5. Read no more firms unless all three fail.

**What it means for COPY-H:** Propr's prices and fees are Hyperliquid's,
so COPY-H's base-tier costs and its +10 bps bar apply there unchanged.

2026-11-25 (the supervisor — HL-FOLLOW-FACTS): **THE FACTS A FOLLOWER WOULD
MEET ARE IN. THEY CONFIRM COPY-H'S BASE-TIER COST (4.5 BPS A LEG) AND MAKE
ITS FUNDING FETCH HOURS, NOT MINUTES.**

**The report:** `docs/reviews/hl-follow-facts-2026-11-25.md` (`19bb0d7`).
- HL-FOLLOW-FACTS: Sonnet 5.5, xhigh, 12:52–13:12Z. Context peak 361k.
- It read official pages only, through the browser pane (the docs,
  Finotive's help centre, Binance). The supervisor read its calls: no API
  call, no sign-in, nothing typed into a site.
- Hyperliquid's facts are in external-apis (the same date).

**Venues, for the owner's talk** (facts only, read 2026-11-25; Finotive's
pages carry no date):
- **Hyperliquid:**
  - 9.0 bps a taker round trip at the base tier;
  - any address watchable with no key;
  - its terms are silent on following.
- **Binance futures:**
  - 37 of the 38 small coins by ticker (not CASHCAT), plus BTC and ETH;
  - 10.0 bps a regular taker round trip, funding every 8 hours;
  - no clause on copying by hand found in the Terms read (its Prohibited
    Use Policy was not read).
- **Finotive:**
  - 14 of the 38 coins, plus BTC, ETH and SOL;
  - crypto leverage 1:10;
  - commission 0.06% (whether per side is not stated); spreads on one
    snapshot BTC ~5, ETH ~6, SOL ~8 bps;
  - no minimum or maximum hold;
  - its accounts are simulated (terms 1.3);
  - help article 955 and terms 7.10 are recorded as found.

**For COPY-H** (passed to COPY-H-PLAN-REVIEW):
- the base-tier taker cost confirmed;
- the funding fetch (~6,700 keyless reads) is about 3.7–8 hours at half
  budget, in short sessions with a safety stop;
- a SPEED line beside, at D in [10 s, 30 s), priced on the tape's first
  taker trade at or after t + D;
- a look column with the share of MAIN's copies in coins Binance lists.

**Open for the owner:** a short read-only probe (one WebSocket connection,
~5 minutes, a few `info` reads) to measure the real fill lag, and to see
whether the public `trades` feed names both accounts. It is new network
use under Iron Rule 1, so it needs the owner's yes.

2026-11-25 (the supervisor — COPY-H'S PLAN IS WRITTEN; ITS FRESH REVIEW
RUNS): **COPY-H-PLAN RECOMMENDS THE PAPER EXPERIMENT'S MAIN, UNCHANGED, ON
EVERY MAIN-DEX HYPERLIQUID ACCOUNT OVER ~72 WEEKS. IT PRICES FROM THE TAPE
WITH SETTLED FUNDING, AND GIVES THE OWNER'S FILTER ROUNDS MONTHS OF THEIR
OWN. THE PLAN GATE PASSES ON COUNTS. COPY-H-PLAN-REVIEW (FABLE 5.2) IS
CHECKING IT.**

**The plan:** `docs/reviews/copy-h-plan-2026-11-25.md` (`83ac6ba`).
- COPY-H-PLAN: Opus 5.5, max, 11:51–13:02Z, across the 12:15Z blue screen,
  resumed by message. Context peak 607k. Access clean.
- **No outcome was computed:**
  - every record was parsed with a reviver that drops `closedPnl`, `fee` and
    `builderFee`;
  - the analyzer's `liq` table was never opened;
  - the tape spread came from same-moment prices (s8).

  The supervisor read the scripts.
- **Its recommendation:**
  1. MAIN unchanged, both readings, R8's delay, base-tier taker costs. MAIN
     alone decides.
  2. One price source for every month: the tape (each minute's trade price,
     a spread from the tape, the 4.5 bps fee) plus settled funding. That
     needs ~6,700 keyless reads (~230 MB) and the owner's yes. No order
     book.
  3. The hybrid schedule:
     - MAIN's look 1 on E (WAVE-H's months, 333 days, z 2.81);
     - the owner's filter rounds on E only (at most 3 rounds and 18 tries,
       the choice rule fixed now);
     - look 2 on E + FRESH (504 days, z 2.43), with at most two chosen
       filters confirmed once;
     - FRESH-2 left unseen.
  4. **The gate passes, from counts:**
     - about 39,000 MAIN copies a week, with the error per day borrowed
       from Polymarket's X3;
     - DROP is the most likely verdict: 99–100% if the truth is −10 bps,
       72% in a stress case;
     - a real +15 bps reads KEEP about 90% of the time (43% in the stress
       case).
  5. **The build:** a sixth entry point reusing the analyzer's LZ4 decoder
     and the paper's frozen kit. The store (~145 GB) is built twice and
     the runs are resumable. About 17 sessions and ~4,500 lines through
     look 2.
- **Its questions for the owner:**
  - the design (hybrid recommended);
  - the funding fetch (yes);
  - where they would act, and so the bar (δ +10 bps on base-tier costs,
    with the break-even printed);
  - the pool (every main-dex account less the protocol vault);
  - the rounds' caps;
  - a 90-day label window;
  - two added sign conditions for KEEP;
  - short runs until the PC is cleared;
  - FRESH-2's length;
  - the lines beside.
- **Its measured facts** are in external-apis (the same date).

**The fresh review** is COPY-H-PLAN-REVIEW: Fable 5.2, max, read only. It
is asked:
- whether any month that chooses also judges. That is the supervisor's
  concern: in the hybrid, filters chosen on E are confirmed on a window
  that includes E;
- to recompute and challenge the power;
- to check the mapping, the price source, Fable's twelve points and the
  build's size;
- whether the owner should approve.

**The owner (~13:05Z):** "let's first we confirm our idea". If it works,
they would enter every trade by hand, with no service or software.

2026-11-25 (the supervisor — COPY-H FIRST, IN PARALLEL; THE PAPER'S SPLIT
DAYS COUNTED): **THE OWNER: "OUR FOCUS NOW SHOULD BE COPY-H … EVERYTHING
WHICH YOU CAN RUN IN PARALLEL … DO THAT. WE HAVE CREDITS FOR THIS WEEK."
TWO MORE WORKERS START BESIDE COPY-H-PLAN. THE SPLIT DAYS TOUCH 0.34% OF
MAIN'S COPIES, SO THEIR FIX WAITS ON A THIRD REFUSED DAY.**

**The paper experiment's refused market-days** (FABLE-REVIEW H1; the
supervisor's completeness count, `verify/PAPER-SPLIT/count.cjs` on
`F:\polymarket-follow\paper\log\2026-11-25-positions.jsonl.gz`; no money, net
or d value read):
- **Where the copies are:** 2,705 copies; MAIN 594.
  - iid 23 (INTC): 11 copies, 1 on MAIN, 1 unpriced.
  - iid 29 (SNDK): 24 copies, 13 on MAIN, 2 unpriced.
  - Every unpriced one is "open across a split day of its market" (rules.md
    R6, as designed).
- **The share:** MAIN's unpriced are 2 of 594 (0.34%), far under the 2%
  WITHHELD line.
- **The remaining risk** is the breaker:
  - rules.md R3a: "Five failed reads in a row end a run ('api failing')";
  - `loop.ts` counts a refused market-day as a failed read, and the two
    fall in one scan;
  - today's run ended "done", with `failedMarketDays` 2.
- **Whether changing that is a defect fix** (R0's route: the code
  against the rule's stated meaning, "api failing") **or a rule change**
  (forbidden in a frozen arm) needs a careful ruling.
- **The supervisor's call,** within the owner's yes to "count and prepare a
  fix", and given the owner's new priority:
  - read `failedMarketDays` at each session;
  - prepare the fix only if a third refused day appears in one scan (one
    more would leave a margin of one before the stop).

**Started in parallel** (briefs in the supervisor folder's `workers\`):
- **HL-FOLLOW-FACTS** (Sonnet 5.5, xhigh): verified facts for COPY-H's
  costs, delay and bar.
  - Hyperliquid's fees and funding.
  - The public, keyless ways to watch any account's fills, with their
    limits and the realistic delay.
  - Hyperliquid's vaults.
  - Each named venue's rule on copying (Finotive re-verified at its source;
    Binance futures).

  Web reading only.
- **CRASH-SIDE-PAGE** (Opus 5.5, max): the ruled page
  `apps/poller/crashside/rules.md`, deliberately outside `polish/`, whose
  files the exam's freeze lists.
  - The 715 line's forced-sell side on FRESH-2's months.
  - One price source.
  - The exam's ladder.
  - The plan gate's arithmetic.

  It is frozen by its commit before FRESH-2 exists on disk.
- **COPY-H-PLAN** was told that the facts come from HL-FOLLOW-FACTS, that
  Finotive forbids copying, and to finish as lean as rigour allows.

2026-11-25 (the owner's rulings on FABLE-REVIEW): **"I agree": the
supervisor's recommendations 1, 3, 4, 5, 6 and 8 hold. The two backup items
(2 and 7) wait: "nothing for now". THE STOP RULE AND THE PLAN GATE ARE NOW
STANDING RULES.**

1. **The paper experiment's refused market-days (H1):** this week the
   supervisor counts the copies the two stock-split days touch, then has a
   fix prepared by rules.md R0's route (a decisions entry, the diff, a test
   that failed before it, the copies whose numbers change, a new freeze).
   It is applied only on the owner's yes, and before the look of
   2026-12-19.
2. **The recordings' second copy:** waits (the owner).
3. **Look 2 is not built.** The exam is recorded as unresolved at look 1
   (WITHHELD; priced, it would read NOT SETTLED). FRESH-2's months (from
   2026-11-16) stay unseen, for confirming a later "yes".
4. **The plan gate, a standing rule** (WORKFLOW, "Standing rules for every
   worker brief"): a test plan's first page states the most likely result
   and the chance of a clear yes or no, from counts and errors known before
   its months are looked at. It is built only if a clear answer is more
   likely than not. COPY-H is the first plan held to it.
5. **Where the owner would act** (venue, size, costs, what its rules allow;
   the record notes that Finotive forbids copying): a short talk before
   COPY-H's bar is frozen.
6. **The stop rule** (the owner's yes to these words): after COPY-H's one
   look, no new research is built unless a frozen test has said a clear yes.
   The forward tests (the paper experiment, MARKET-1) run on to their last
   look on 2027-05-08 at no cost. Then the project becomes what passed, or
   closes with its record.
7. **The supervisor folder's copy and E:'s free space** (19 GB, 91% full,
   2026-11-25): wait (the owner). The supervisor reads E:'s free space at
   each session's start.
8. **"The crash side only":** one page of frozen text now, written before
   anyone looks at FRESH-2's months. It names the rule, the months, the
   price source and the verdict, with the plan gate's arithmetic. Nothing is
   built unless that arithmetic says its test could answer.

2026-11-25 (the supervisor — FABLE-REVIEW, the cold review of the whole
project): **"THE METHOD AND THE NUMBERS ARE SOUND". FIVE HIGH FINDINGS, ONE
OF THEM ACTIONABLE THIS WEEK (THE PAPER EXPERIMENT'S REFUSED MARKET-DAYS).
ONE HABIT TO CHANGE: A PLAN STATES, BEFORE ITS BUILD, THE CHANCE OF A CLEAR
ANSWER.**

**The review:**
- `docs/reviews/fable-review-2026-11-25.md` (`31c2ae4`, `122735e`).
- FABLE-REVIEW: Fable 5.2, max, fresh, 11:51–12:31Z, across the 12:15Z
  blue screen; resumed by message.
- Context peak 541k. Access clean: only WORKFLOW and LESSONS from the
  supervisor folder, as allowed; no data, run folder or program.

**Its findings** (one line each; the evidence in the report):
- **H1:** the paper experiment's two refused market-days (INTC 2026-11-19,
  SNDK 2026-11-20, the venue's stock splits) fail at every run. They put
  every later copy across them out as unpriced, and they count toward the
  breaker of 5 failed reads in a row.
- **H2:** the recordings have one copy.
- **H3:** no test was asked, before its build, whether it could answer.
- **H4:** look 2 can hardly give a verdict: the new days would need about
  +300 to +500 for HOLDS.
- **H5:** the PC is unstable under load (2026-11-20's faults; the 12:15Z
  bugcheck 0xA).
- **M1–M8 and L1–L3:**
  - the check months were not clean for the family that won;
  - a few cascades carry every wave number;
  - two prints were not on record;
  - where the owner acts is still open;
  - stale lines in the state files;
  - other single points: the supervisor folder, E:, and the backup
    task's state;
  - a variant grew from each unclear result;
  - small items.

**The supervisor's checks:**
- **H1, from the code:**
  - `loop.ts` 136–137: `failed()` ends a run at `FAILING_READS` = 5 in a
    row.
  - 254–269: a failed market-day calls it, and only a successful read
    resets it. The two refused days fall in one scan with no success
    between them.
  - Today's run (`F:\polymarket-follow\paper\log\2026-11-25.jsonl`):
    `failedMarketDays` 2, `failedReads` 0, loop end "done".
  - So the risk is latent: three more refused days in one scan would end
    every run early.
  - The review's "both forward tests" was not checked for MARKET-1.
- **M6, the stale lines, fixed in the same commit:**
  - architecture's "not frozen" for WAVE-H, the analyzer and the exam;
  - CLAUDE.md's "not frozen" for the exam;
  - the plan page's "too little book depth in the crash hours" (it was the
    archive's thinning books);
  - "15½" against "about 18 months";
  - the review's "two README cells" are left to the record sweep.

  COPY-PLAN and COPY-H-PLAN in the talk's entry name the same worker,
  COPY-H-PLAN.
- **M3, the two prints, now on record** (look 1's `report.json`, at the
  tape, beside, deciding nothing):
  - **B0 on FRESH, slices 0–19:** −42.9 ± 52.5 bps (11,724 priced, 91
    days, 38 coins); all 147 slices: −49.6 ± 53.4 (83,354).
  - **N in the discovery window** (2026-08-31 → 11-07, slices 0–19, not
    independent): +143.9 ± 45.2 (5,930, 52 days).

**Passed on:** COPY-H-PLAN was sent the review's twelve COPY-H points (its
section 6) and H3's gate:
- the power first;
- one price source for every month;
- FRESH-2 left unseen;
- the tension between "MAIN unchanged, no tuning" (the review) and the
  owner's "filter → test → filter again", laid out both ways for the
  owner.

**For the owner** (their call, the supervisor's recommendation in the
report given to them):
- H1's count and ruling this week;
- the recordings' second copy;
- look 2 decided on the arithmetic;
- the plan gate as a standing rule;
- where the owner would act;
- the stop rule in their words;
- the PC (set aside by the owner at 12:30Z unless it repeats);
- the supervisor folder's copy and E:'s space;
- "the crash side only" as one frozen page.

2026-11-25 (the supervisor — THE CLEANUP ON F:, at the owner's word): **271.4
GB OF COPIES AND INTERMEDIATES DELETED; F: FREE 850.1 → 1,121.8 GB. EVERY
RAW STORE, BOTH ANALYZER STORES AND EVERY RESULT KEPT.**

- **The owner:** "keep history for now and order books, only we can remove
  which is safe and we don't need", then "once you measure everything,
  delete it".
- **The run:** the supervisor's `verify/CLEANUP-1125/cleanup.ps1`,
  12:01:32–12:02:10Z. The log `cleanup.log` records each folder's files
  and bytes, measured just before it was removed. No candidate held a
  reparse point.
- **Deleted, under `F:\polymarket-follow-research\ANALYZER\`:**

  | Folder | Size | What it was |
  |---|---|---|
  | `POLISH-RULES\repro-run1` | 46.1 GB | 2026-11-20's reproduction that misread a file |
  | `POLISH-RULES\repro` | 46.1 GB | the reproduction that passed, a copy of the explored store |
  | `look1-repro-crash1` | 19.8 GB | look 1's first crashed reproduction |
  | `FRESH\repro` | 46.1 GB | look 1's reproduction, equal to the explored store (repro.json (a)) |
  | `FRESH\twin` | 25.6 GB | FRESH's second build, equal to `FRESH\store` (builds.json) |
  | `FRESH\parts` | 13.9 GB | the parts `FRESH\store` was built from |
  | `WAVE-H-gates-failed-1` | 46.1 GB | the superseded first build: `parts` and `store` |
  | `WAVE-H-stopped-1` | 26.9 GB | the stopped build: `parts` and `store` |
  | `timing-2025-10-10` and `-b` | 1.1 GB | the timing runs: `parts` and `store` |

  The old runs' logs and gate outputs stay.
- **Kept:**
  - the raw stores: `WAVE-H\store`, and `FRESH\store` with its books;
  - `ANALYZER\WAVE-H`, the explored store and its outputs;
  - `ANALYZER\FRESH\store` and `look1\`;
  - every `repro.json`, `placebo.json`, withheld and `.out` file;
  - the recordings and the backups.
- **What was lost:** nothing a later step needs. Look 2 runs a new
  reproduction and its own builds under its own freeze, and COPY-H extracts
  afresh from the raw stores.

2026-11-25 (the owner's talk after look 1 — what next): **THE WAVE'S
POLISHING STOPS. v1 WAITS FOR EVIDENCE. TWO WORKERS START IN PARALLEL: THE
PLAN FOR COPYING TRADERS ON HYPERLIQUID'S 15½ MONTHS (COPY-PLAN), AND A
COLD REVIEW OF THE WHOLE PROJECT BY FABLE 5.2 (FABLE-REVIEW). THE REST
WAITS.**

**The owner's words:**
- On look 1: "pretty sure we will have better results … total
  disappointment".
- On v1: "leaderboards doesn't have sense, waves also … alerts or
  anything".
- On copying traders: "use on our 15month history try to filter traders
  which doing type of trades as we doing in our paper experiment".
- Then: "let's start with work, let's run parallel things".

**The rulings** (the supervisor's recommendation, the owner's yes, item by
item):
1. **Copying traders on Hyperliquid's history** (the plan page, "After
   WAVE-H's answer" item 4, the owner's idea of 2026-11-17): **starts with
   its plan.** It is a new question, so all 15½ months (WAVE-H's 10,
   FRESH's 5½) are unseen for it.
   - Until the owner approves the plan, no outcome of any account or copy
     is computed on any month: no profit, return, `closedPnl` or copy
     price. Only the data's shape, sizes and counts may be measured.
   - Plan first, then a fresh review, then the owner's yes, then the build
     and the freeze.
2. **The crash side only:** not now. It can be tested only on months no one
   has seen (FRESH-2, from 2026-11-16), so it is decided with look 2's book
   listing, before February.
3. **Fable 5.2's cold review of the whole project:** starts now, read only.
4. **A dated public events calendar flag** (AI-RESEARCH's alternative):
   not now. It serves the wave rule, which FRESH did not support.
5. **Polymarket trader ideas on new weeks, prediction-market traders, AI
   notes and the 8-week news pilot, other venues (WAVE-L, other venues'
   prices):** not now.
6. **Variations of the wave rule:** skipped, the supervisor's call at the
   owner's word ("it is up to you"). Every one would be chosen after
   seeing FRESH, so it could be tested only on new months, and FRESH's ~0
   makes a large change unlikely.
7. **v1:** held until a test finds something a follower can use.
8. **The frozen tests run on:**
   - the paper experiment's and MARKET-1's first looks, 2026-12-19;
   - the exam's look 2, decided after FRESH-2's book listing.
9. **The cleanup:** only copies and intermediates are deleted (the owner:
   keep the history and the order books). The exact list with sizes goes
   to the owner first, and nothing is deleted before their yes.

2026-11-25 (the supervisor — LOOK 1'S FINAL REVIEW): **"THE VERDICT
STANDS" (WITHHELD). INDEPENDENT CODE GIVES THE SAME 3,078 POSITIONS, PRICES
AND VERDICT. THE 278 DEPTH-SHORT POSITIONS ARE NOT THIN CRASH BOOKS: THE
ARCHIVE'S BOOK SNAPSHOTS THINNED THROUGH 2026, SO LEGS FELL TO THE TAPE.
THAT MATTERS FOR LOOK 2.**

**The review:**
- `docs/reviews/polish-exam-look1-2026-11-25.md` (`246f1f7`).
- POLISH-EXAM-REVIEW: Sonnet 5.5, max, fresh, 00:57–01:33Z. Context peak
  611k (63%). Access clean: only the reviewers' folders it was allowed.
- **The known answer first:** the 715 line on E from the explored store,
  5,067 positions and 4,310 priced, m and SE within 1.4e-13.
- **On FRESH:**
  - all 5,930 positions line by line: 0 categorical differences, net within
    2.6e-12 bps;
  - 248 numbers of result.json and report.json within 1e-9 relative (the
    largest 5.6e-14);
  - 54 identity hashes equal.
- **The record order:** decisions `8d9e094` (step 1's counts) committed
  2026-11-24 13:49:31Z, before the first book was fetched and 10 h 39 min
  before step 2.

**Its answers:**
- **Q2, depth short:**
  - At the book, 0 legs were short. Every short leg was priced from the
    tape, after a stale book or with no book file.
  - The archive's `l2Book` cadence fell: a median gap of 0.54 s to
    2026-06-14, 5.4 s from late June, 11 s with 2-minute silences from
    2026-11-10 (external-apis, the same date).
  - So 28% of legs (55% in November) went to the tape, where takers on our
    side held a median $253 of the $1,000. 258 of the 289 short legs and
    all 78 unpriced positions are in November.
- **Q3, the prints:**
  - The forced buys' −747.5 is one event: 244 of 285 on 2026-08-19,
    −208,258 of −213,040.
  - The two best days (2026-11-08, 08-22) are 11.16 times the line's sum;
    without them the mean is −52.6 ± 96.2. The event-level line is −29.2 ±
    77.5.
- **Q4, the 61 missing books:** CASHCAT 60 coin-hours and LIT 1. They touch
  63 positions of the line.

**Findings:** no high one; none changes a number, the verdict or the
record order.
- **M1:** the WITHHELD projection could not see the cadence. If look 2
  meets November's cadence, its pooled share passes 10% once segment 2′
  holds about 1,070 positions.
- **M2:** the 5% tripwire cannot see book coverage.
- **L1–L5:** small. L2 corrects two wordings in decisions 2026-11-25:
  - "11.6% left out" means 11.6% not priced cleanly (unpriced or depth
    short; P8's leftOut is 0);
  - "11.2" is a multiple of the line's sum, not a percent.

**The supervisor's checks:**
- The commit holds only the report and its README row.
- An editor warning in its `i-verdict.cjs` ("extraR" not found) is stale:
  line 158 declares it.
- `verify/POLISH-LOOK1/review-claims.cjs` on positions.jsonl.gz alone gives:
  - short legs by source: tape 291, book 0;
  - the tape share 26.9%, 54.0% in November;
  - the forced buys 244 of 285 on 2026-08-19, −208,258.27;
  - the two best days 11-08 and 08-22, 11.157 times;
  - the mean without them −52.646.

  These are equal, or near where it counted legs differently (289
  against 291; 28% against 26.9%).

**Rulings on its questions:**
1. FRESH-2's `l2Book` sizes listed (metadata only) and a dated decision
   on whether look 2 runs as frozen: **recommended, for the owner's talk**,
   since it decides whether a frozen look runs.
2. The cadence goes into external-apis (done, dated and sourced), and the
   wordings are corrected here: **yes**.
3. A book-coverage tripwire, and WITHHELD projected from the tested months'
   cadence, for any later test: **yes, noted in the plan page's variations
   for later**.

2026-11-25 (the supervisor — LOOK 1'S VERDICT): **WITHHELD. 11.6% OF THE
715 LINE'S 3,078 DECIDING POSITIONS WERE LEFT OUT: 78 UNPRICED AND 278
DEPTH SHORT, ABOVE THE 10% LIMIT. THE 3,000 PRICED POSITIONS AVERAGE +4.5 ±
91.7 BPS (25 DAYS, 38 COINS, z 0.05). BY THE FROZEN RULES (M11) THE EXAM
GOES ON TO LOOK 2. ITS REPORT AND FINAL REVIEW WITH INDEPENDENT CODE COME
NEXT, AFTER THE OWNER'S WORD.**

**The run:**
- **The books:** `tools/waveh-fetch.cjs --fresh --books`.
  - Day 1: 13:48–14:49Z, 1,979 files. It stopped for the day (exit 4) on
    three audit pauses at the US stock open: 40, 79 and 64 of 90, all
    timing.
  - Day 2: 00:00:59–00:26:05Z, 1,140 files, exit 0.
  - In all: 3,119 fetched, and 61 not in their hour folder's listing.
- **Step 2:** 00:28:30–00:42:36Z, exit 0. `look1/result.json`
  `b7bdc5cd…2881`, `report.json` `d9629892…475b`, `positions.jsonl.gz`
  `fd8e85ba…5659`. It names the exam's freeze `bd3ac6d3…f0fa`
  (`polish-freeze-1`), step1 `af2d9e15…abade` and repro `3ace5b32…67c8`.

**The verdict** (result.json): WITHHELD, "the data could not answer".
- The deciding line is 715: 25 days, 38 coins; options cut and BASE.
- The bars: z 2.847 (LIKELY 2.360).
- **The positions:** 3,078; leftOut 0; unpriced 78; depthShort 278; priced
  3,000; withheldShare 0.11566.
- **The priced stat:** +4.459 ± 91.70 (seDay; seMarket 25.79).
- **The bounds:** holds −256.6, likely −212.0, does not hold +265.5. So,
  priced as it is, the line would read NOT SETTLED, neither HOLDS nor
  DOES NOT HOLD.
- **Beside:** the BASE excess +15.04 (n 3,000); at the book −32.54
  (n 2,082).

**The prints beside** (report.json; P13: they decide nothing):
- **By month:** 2026-06 +1.6 (9 days); 07 −73.0 (3); 08 −267.0 (6); 11
  +110.7 (7).
- **By side:** the forced sells +83.4 ± 61.5 (n 2,715, 21 days, z 1.36);
  the forced buys −747.5 (n 285).
- **N, seeded:** −35.4 ± 72.6 (5,826 priced, 59 days).
- **The 1,391 cut, seeded:** +68.2 ± 182.3 (1,230 priced, 13 days).
- **At the tape:** −2.1 ± 96.1 (2,745 priced).
- The two best days' share of the line's sum: 11.2.

**The supervisor's own check** (`verify/POLISH-LOOK1/result-check.cjs` on
`positions.jsonl.gz` alone, output `result-check.out`): 3,078 in715; 3,000
with a net; 78 unpriced; 278 depth short; share 0.11566; mean +4.4594 over 25
days; side −1 n 2,715 at +83.395 and side +1 n 285 at −747.509. Each equals
result.json and report.json. The SE is left to the Final review.

**For the look's report and review:**
- Depth short was 278 (9.0%). The pre-freeze projection put WITHHELD at
  2.2% (P(WITHHELD) 1.8%), and it did not foresee crash-hour depth.
- The forced-sell side and the forced-buy side differ by ~830 bps. That
  is a print seen after the fact, so it is never a verdict here. Any rule
  built on it is its own frozen test on months not yet seen.

**What the frozen rules say next:** only HOLDS or DOES NOT HOLD end the exam
early (M11), so look 2 follows, about 2027-02-08, on FRESH-2's data (rules.md
P1; window 182 days, z 2.81, LIKELY 2.437).

**Owed:**
1. The look's report.
2. Its Final review with independent code (POLISH-EXAM-REVIEW, fresh).
3. The owner's talk on what next: the AI items, Fable 5.2's cold review,
   the variations, MARKET-1's first look 2026-12-19, the v1 plan.

2026-11-24 (the supervisor — LOOK 1: THE REPRODUCTION PASSED, STEP 1 DONE,
BEFORE ANY PRICE): **THE FROZEN PROGRAM REPRODUCED THE TEN MONTHS EXACTLY.
FRESH WAS OPENED AND BUILT TWICE, AND THE TWO BUILDS ARE EQUAL; ITS
INTEGRITY PASSED. THE 715 LINE DECIDES ON 25 DAYS AND 38 COINS (THE SAFETY
NET DID NOT FIRE), WITH 3,078 POSITIONS AND NONE LEFT OUT. THE BOOKS ARE
BEING FETCHED; STEP 2 COMES NEXT.** Written before step 2, so the counts are
dated before any price.

**The pause and the restart:**
- The owner was back on 2026-11-24.
- Windows Memory Diagnostic (the standard test), 08:27–09:06Z: "detected
  no errors".
- The four days 11-21 → 24: the collector, the paper experiment and
  MARKET-1 ran with no crash and no error (the supervisor folder's
  `verify/PAUSE-CHECK/`).
- The paper's two daily warnings, "two settlements in one hour" for iid 23
  INTC-USD and iid 29 SNDK-USD, are the venue's stock splits
  (`/instruments`: `split_phase` "live"). The frozen reader refuses those
  days, by design.

**The reproduction** (from the run worktree at `polish-freeze-1`,
fingerprint `4c9e5c9d…`):
- **The run:** started 11:18:44Z and passed at 12:13:07Z (exit 0;
  repro.json `3ace5b32…67c8`).
- **Reusing finished parts:** run 2's 6,946 whole parts were moved back.
  The pass skips a part whose header names the same input, SHA-256 and code
  (`pass.ts`), so 1,899 files were done, in 739 s. (a) holds every store
  file to the explored manifest byte for byte, so a reused part cannot
  pass wrongly. The owner asked whether the work could be read "in junk".
- **(a) equal:** 14,563 files, 21,251,178,093 B.
- **(b), differs []:**
  - N on E: +94.686 ± 54.26;
  - N on C: +211.263 ± 122.14;
  - the 715 line on E: +203.36 ± 79.08 (4,310 priced).
- **(c) equal:** 1,299 lines; the largest difference is 0 bps.
- **Against repro-run2.json of 2026-11-20:** 0 differences (the
  supervisor's `verify/POLISH-LOOK1/repro-compare.cjs`).

**Step 1** (started 12:16:46Z; exit 5, books needed, at 13:44:45Z):
- **The two builds:** `look1/builds.json` (`8a6c108d…f8f2`): equal, 7,843
  files, 12,554,255,469 B, no problem.
- **Integrity:** `look1/integrity.json` (`5b2c28f8…f7e8`): pass. Every counter is 0, and the 40 coins' pairing is exact, with no
  straddled pair and no unpaired trade, so H0's route was not needed.
- **The deciding line** (`look1/step1.json`, `af2d9e15…abade`): "715",
  why null, 25 days, 38 coins. The safety net (20 days, 10 coins) did not
  fire.
- **Positions:** 715: 50,121, of which 3,078 on the deciding days. Beside:
  1,391 cut 1,262, N 5,930, B0 12,591.
- **The tripwire:** of 3,078, leftOut 0, fundingWithoutPrice 0, share 0.
- **Books needed:** 3,180 files (`books-needed.txt`, `a71660ad…f766`).

**Next:**
1. **The books:** `tools/waveh-fetch.cjs --fresh --books`, started
   13:48:44Z, detached at idle, under the tool's own gate.
2. **Step 2:** `result.json` first.
3. The look's report and its Final review with independent code.

2026-11-20 (the supervisor — LOOK 1 PAUSED, FRESH UNOPENED): **LOOK 1'S
REPRODUCTION BY THE FROZEN PROGRAM WAS STOPPED TWICE BY A SINGLE FLIPPED BIT
IN THE PC'S MEMORY, AND ITS OWN CHECK CAUGHT BOTH. THE OWNER PAUSES THE EXAM
FOR A FEW DAYS; THE MEMORY TEST COMES FIRST WHEN THE OWNER IS BACK.**

**What happened:**
- **Run 1** started 13:49:41Z and crashed (exit 1) at 14:44:36Z, file
  ~6,150 of 8,845: "a u64 column cannot hold 574225594.5".
- **Run 2** started 15:13:01Z, after a real Windows restart at 15:09:20Z. It
  crashed (exit 1) at 16:08:54Z, file ~6,925: "a u64 column cannot hold
  4900056.84375".
- Both crashes came from `bytesOf`'s check on a TAPE `tid` half.
- **Each value is one bit from a whole number** (the supervisor's
  `verify/POLISH-LOOK1/crash1/bitflip-any.mjs`, output in `crash2/`):
  - 574225594.5 is mantissa bit 22 from 574225594;
  - 4900056.84375 is exponent bit 55 from 1254414552.

  `u64Of` cannot give a non-whole half from digits.
- **Not code and not data:**
  - The reader (scan, writers, part, tables, pass, worker, lz4) has not
    changed since `6fd8458`, which is inside `0532fa8`. That program's
    reproduction passed this morning on the same inputs.
  - The two runs failed at different files.
- **The pattern:** today's faults were:
  1. the morning reproduction's file misread once;
  2. the collector's 0xC0000374 at 07:07Z;
  3. these two flips.
- **The machine:** 4×8 GB DDR4 from two kits (KF3600C17D4/8GX ×2,
  KHX3600C17D4/8GX ×2) at the XMP 3600. The system log has no WHEA events
  (non-ECC). No memory test was ever run. The run's process used about
  4.5 GB, so memory was not full.
- **Nothing wrong was kept:**
  - FRESH was never opened. `ANALYZER\FRESH` holds only `logs\` and
    `placebo.json`.
  - The two half-written folders were moved to
    `ANALYZER\look1-repro-crash1\` and `ANALYZER\look1-repro-crash2\`.
  - The evidence is in the supervisor folder, `verify/POLISH-LOOK1/crash1/`
    and `crash2/`.

**The owner's rulings:**
- **The RAM stays at 3600:** no BIOS change.
- **A restart before a memory test**, then "memory test if it is break
  again": it broke again.
- **"don't start step 1 … we will make a pause few days … when am back we
  will do FRESH check."**

**The collector:**
- The restart left an ~8 min gap (15:04–15:12Z). The boot start exited 3,
  because a 95 s heartbeat (under 2 min) and pid 4456, reused by mongod,
  read as a live holder. The 5-minute "poller check" brought it back at
  15:12:39Z.
- Its price audits dip under the runs, timing only (otherMiss 0): hourly
  minimum 70 at 01Z (the passing reproduction), 75 at 14Z, 71 at 15Z.

**When the owner is back:**
1. The memory test (Windows Memory Diagnostic, about 30–60 min; the
   owner's rule).
2. A restart.
3. The reproduction again.
4. On its pass: step 1, the books, step 2.

Step 1's gate needs only a passed `repro.json` by the program's fingerprint
(`4c9e5c9d…`), with no time limit, so the run worktree's dist is never
rebuilt in the pause. The books never expire: the archive's `l2Book` runs
from 2023-04-15. Step 1 builds FRESH twice and step 2's result is
recomputed by independent code at the look's review, so a flip there shows
as a difference, never as a verdict.

2026-11-20 (the supervisor — THE EXAM IS FROZEN): **`polish/FROZEN.sha256`,
125 FILES, SHA-256 `bd3ac6d3af52c1e42cb2c08446cb89e0e9b7227199e1955c2cc0e03776e3f0fa`,
COMMIT `13dc55c`, TAG `polish-freeze-1`. THE GATE SAYS OK. LOOK 1 ON FRESH
BEGINS.**

**How:**
- **The final tree:** `a1bdf9c`, after POLISH-PREFREEZE's three commits.
  - `f1b4350`: `design.ts`'s comment, P15 step 5's sentence, and tests c10
    and c15, each killing its break.
  - `8b15ef8`: the draft list, `aab29e44…8f69`. Only `design.js`'s and
    rules.md's lines changed.
  - `a1bdf9c`: the docs.
- **The supervisor's checks:**
  - the diff: `design.ts` changed only in a comment, and rules.md only by
    the sentence;
  - `pnpm verify` on `a1bdf9c` green: 89 + 1 files, 823 passed and 5
    skipped; the three freezes 0 differ;
  - the tree clean.
- **The freeze:** `node tools/polish-freeze.cjs --final --tag 1` at
  2026-11-20T13:48:37Z, exit 0. The tool built the program itself from the
  clean tree.
  - The final list's 125 hash lines equal the reviewed draft's.
  - All 125 files verify on disk.
  - `# tag polish-freeze-1`.
- **The commit and the tag:** commit `13dc55c` (the list alone); annotated
  tag `polish-freeze-1` on it. `git show polish-freeze-1:…/FROZEN.sha256`
  hashes to `bd3ac6d3…f0fa`.
- **The gate:** the frozen program's own `verifyExamFreeze` on the main
  tree gives ok, 125 files, tag `polish-freeze-1`
  (`verify/POLISH-LOOK1/gate-main.out`). git is on the detached launcher's
  PATH.

**What is frozen** (rules.md P0–P17):
- **The recipe:** the 715 line decides (B0 + W4 at 715), with N's safety
  net read once at look 1's step 1.
- **The line:** K = 20, slices 0–19 pooled.
- **The looks:** two. Look 1 at z 2.847 and LIKELY 2.360; look 2 at 2.81
  and 2.437.
- **The verdicts:** WITHHELD at 10%, TOO FEW below 20 days or 10 coins,
  DOES NOT HOLD below δ +50 at HOLDS's z, HOLDS with BASE's excess and the
  book-priced mean above 0, LIKELY, NOT SETTLED. Only HOLDS or DOES NOT
  HOLD end the exam early (M11).
- **The options:** B (the no-book days cut); BASE.
- **The prints beside:** N and the 1,391 cut, "seeded, decides nothing".
- **The data:** `fresh.sha256` (4,614 files); FRESH built twice and held
  equal.

**Noted for every later run:**
- **The first `pnpm verify` after the tag reads 822 passed and 6 skipped.**
  That is the sealed-root case skipping, not a lost test (821 + 6 before
  POLISH-PREFREEZE's added test).
- **After any re-freeze** (tag 2, by H0's route), a completed step 1 runs
  again, because step 2 refuses another freeze's `step1.json`.

**Next:** the owner pushes main and `polish-freeze-1`. Then look 1, from
the run worktree checked out at the tag and built clean, its list
verified, `placebo.json` copied into `ANALYZER\FRESH`:
1. the reproduction by the frozen program;
2. step 1;
3. the books;
4. step 2.

Nothing heavy runs beside them.

2026-11-20 (the supervisor — the fix round's fresh check): **"READY TO
FREEZE". EVERY FINDING OF THE CODE REVIEW IS CLOSED AND SHOWN CLOSED. ONE
LAST SMALL COMMIT (A STALE COMMENT, ONE RULES SENTENCE, TWO TEST
ASSERTIONS, THE DOCS SWEEP), THEN THE FREEZE.**

**What:**
- **The check** is `docs/reviews/polish-fix-check-2026-11-20.md`
  (POLISH-FIX-CHECK, Sonnet 5.5, max; the first worker 10:32–10:40Z, its
  successor 10:40–13:00Z; context peak 483k; access clean). It was saved
  unchanged from its final message.
- **What it found:**
  - **M1–M3, L1–L7, L10, L11 and L12:** each closed. For each, it read the
    fix, a test pins it, a break of it is killed, and a run shows it
    working.
  - **The rehearsal:** HEAD runs reproduce → step 1 → step 2. `99dd76c`, and
    HEAD with the closed seal handed in, stop at "FRESH is sealed".
  - **A real `--final --tag 1`** in a scratch repository: the list equals
    the draft, 125 of 125. The gate says no before the tag and ok after.
    The whole suite on the frozen copy: 821 passed, 6 skipped.
  - **The draft list** (`750b5c64…6a8a`) equals a clean build of
    `0f42405`, 125 of 125. The three live freezes are untouched.
  - **Breaks:** 112, of which 106 were killed. sv9 and w19 are equivalent;
    c10, c12, c13 and c15 are test gaps that cannot change a verdict (c12
    and c13 would stop look 1 loudly, and the rehearsal catches them).
  - **The P11 grid:** 30,000 sets, 0 differences. The old against new
    verdict: 120,000 calls, 0 differences.

**The rulings on its questions:**
1. **Yes, one small commit before the freeze:**
   - `design.ts`'s stale comment about the options;
   - P15 step 5's sentence that step 2 refuses another program's or
     freeze's `step1.json` and holds `builds.json` and `integrity.json`;
   - the two test-only assertions (c10: DOES NOT HOLD's sentence in a world
     with SE above 0; c15: the tripwire's share null with no position);
   - the docs sweep's leftovers (architecture's options lines,
     current-task's draft-list and talk lines);
   - then `pnpm verify` and the draft list again.

   The supervisor checks it: the compiled `design.js` differs only in the
   comment, rules.md only by the sentence, and the list again equals a
   clean build.
2. **Yes:** the rehearsal scripts stay outside the repository and are run
   again at look 2's build.
3. **Yes:** the freeze-day decisions entry says the first `pnpm verify`
   after the tag reads 821 passed and 6 skipped. That is the sealed-root
   case skipping, not a lost test.
4. **Yes:** the look-1 runbook says that after any re-freeze, a completed
   step 1 runs again, because step 2 refuses another freeze's
   `step1.json`.

2026-11-20 (the owner — the exam's last two options, before its freeze):
**OPTION E: B, THE DAYS WITHOUT BOOKS ARE CUT. OPTION D (Q4): BASE, NO
CHANGE. EVERY MARKED OPTION IS NOW FILLED.**

The owner, about 10:40Z: "yeah man, let's continue, i agree with all your
recommendation", on the supervisor's recommendation (B and BASE, the
message of about 10:35Z).

**What:**
1. **[OPTION E] WITHHELD's days without books: B, cut.** A deciding
   position with x_in or x_out on a UTC day in `NO_BOOK_DAYS` (2026-07-08
   and 2026-07-12 → 17; the listing of 2026-11-20 found 11-13 → 15 with
   books) is cut from the deciding days and printed apart.
   - On E's rates, P(WITHHELD) is 1.8% against A's 11.6%.
   - The cost is about 10% of the line's positions, and P(HOLDS) at look 1
     moves from 4.3% to 3.9%.
2. **[OPTION D, Q4] HOLDS's second condition: BASE, no change.** The mean
   excess over each coin's BASE is above 0. OWN is printed beside the
   verdict, deciding nothing.
3. **Already filled:**
   - [OPTION A]: the 715 line decides, with the safety net (decisions
     2026-11-19 `710338f`);
   - the looks: two (decisions 2026-11-20 `5f01f05`).
4. **The code's defaults already are these:** `OPTIONS = { noBookDays:
   "cut", excess: "BASE" }`. Only rules.md marks the two options filled.
   - In the same commit, the markers' test (`polish-rules.test.ts`, the
     code review's L12) and the draft list are written again.
   - The fix-check covers that commit.

2026-11-20 (the supervisor — the code review's fix round done): **POLISH-FIX
CLOSED EVERY FINDING RULED. THE REHEARSAL THROUGH MAIN.TS PASSED, AND ON THE
PRE-FIX COMMIT IT STOPS AT M1. THE FRESH FIX-CHECK RUNS.**

**What:**
- **POLISH-FIX's commits** (08:33–10:21Z; context 608k; access clean), each
  with `pnpm verify` green and the three freezes verifying:
  - `31bab2e`: M1, the seal into the reproduction, `reproExtraction`
    tested open and closed;
  - `742b4de`: M2, `onDeciding` and the tripwire's `{of, leftOut,
    fundingWithoutPrice, share}`; M3, the test follows the gate;
  - `21f270b`: L1 (w1, w14, w17) and L3. Step 2 refuses another program's
    or freeze's `step1.json`, and holds the builds and integrity files;
  - `0837596`: L2 and L6;
  - `0e8ffb4`: L7, L10, L11 and the two names;
  - `edf9ce5`: L4 (`NO_BOOK_LISTING`), the rules' listing text, and L5
    (THE PLAN saved as `docs/reviews/polish-rules-plan-2026-11-19.md`, its
    SHA-256 equal to its source);
  - `c7e95a5`: the draft list, 125 files, `b47e9ac3…25b8c9`;
  - `6a8e541`: the docs.
- **Its 15 breaks of its own guards:** all killed.
- **The rehearsal:** a script in `workers/POLISH-FIX/rehearsal/`.
  - The setup is a synthetic world, a synthetic freeze and tag, and
    `main.ts`'s three steps into `…\ANALYZER\FRESH`.
  - The results: reproduce exit 0; step 1 exit 5 (books needed; the twin
    builds equal; integrity passed); step 2 exit 0.
  - On `99dd76c` (before the fix) it stops at the reproduction: "FRESH is
    sealed".
  - It rehearses the wiring, the gate and the seal, not the frozen bytes.
- **The supervisor's checks:**
  - `pnpm verify` on `6a8e541`: green (89 + 1 files, 822 tests; the three
    freezes 0 differ), in `verify/POLISH-RULES/verify-6a8e541.out`;
  - access clean.

**The rulings on its questions:**
1. No P17 row for `NO_BOOK_LISTING`. The look test and P2 hold it.
2. The rehearsal's scripts stay outside the repository until look 2's
   build runs them again.

**Next:**
1. POLISH-FIX-CHECK (Sonnet 5.5, max), started 10:32Z.
2. The owner's two choices: WITHHELD's B or A, and BASE or OWN.
3. The options filled in. In the same commit, the markers' test (L12), a
   rebuild and the draft list again.
4. The freeze: `--final --tag 1`, the commit and the tag, which the owner
   pushes.
5. Look 1.

2026-11-20 (POLISH-FIX — the code review's fix round, as ruled; its
technical calls): **M1–M3, L1–L7, L10 AND L11 ARE FIXED IN SIX GREEN
COMMITS, THE PLAN IS SAVED INTO docs/reviews, AND THE DRAFT LIST IS WRITTEN
AGAIN (125 FILES, `b47e9ac3…b8c9`). A REHEARSAL OF `main.ts`'s REPRODUCE →
1 → 2 ON A SYNTHETIC WORLD, UNDER A SYNTHETIC TAG, PASSED; THE SAME
REHEARSAL ON THE CODE BEFORE M1 STOPS AT M1. NOT FROZEN; FRESH STAYS
SEALED.**

**What** (each commit with `pnpm verify` green in the same command, by
pathspec, the three freezes verifying after; 814 → 822 tests + 5 skipped):
- `31bab2e` M1: the reproduction is given the exam's seal.
- `742b4de` M2, M3: step 1 prints the 5% tripwire's quotient; the
  built program's test follows the gate.
- `21f270b` L1, L3: the 715 line deciding through step 2, `placebo.json`
  held, `step1.json` needed; step 2 holds step 1's program, freeze and
  check files.
- `0837596` L2, L6: (c) holds the look's WAVE-H lines equal in number; the
  gate names a git that cannot run.
- `0e8ffb4` L7, L10, L11, the `key` alias and the `json` shadow.
- `edf9ce5` L4, L5 and the rules: `NO_BOOK_LISTING`; P2, P14, P15 and P16
  written from the code and the 2026-11-20 listing;
  `docs/reviews/polish-rules-plan-2026-11-19.md`.
- `c7e95a5` the draft list from a clean tree, committed alone.

**The rehearsal** (Q5; scripts in POLISH-FIX's scratch folder `rh-src\`,
not a repository test; about an hour of the three-hour box):
- **The setup:** a `git archive` of `edf9ce5`, its `node_modules`
  junctions into the repository's, no pnpm. A vitest file run there wrote
  the world:
  - WAVE-H's "ten months" as nine days, 2025-12-27 → 2026-01-05;
  - eight waves in slices 1–8, its trusted store made by the extraction;
  - its gates, `choice.json`, `c.json`, `e.json` and `placebo.json`
    computed by the exam's own `partOf`;
  - FRESH as the look test's world.
- **The patch:** `design.ts` (the explored hashes, `PLACEBO_JSON`, the
  cuts 3 / 2 / 4) and `range.ts` (the two ranges), the data lists and
  `cuts.json`; a build; WAVE-H's list line for the new data list; a
  synthetic `polish/FROZEN.sha256` (125 files, `# tag polish-freeze-1`),
  committed and tagged. Both gates said ok, and the seal was open.
- **The runs:** `node dist\polish.js exam --step reproduce`, then `1`, the
  books copied in, then `2`, with EXAM_ROOT `…\ANALYZER\FRESH` and
  FRESH_STORE `…\FRESH\store`.
  - reproduce exit 0: `repro.json` passed; (a) 2,243 files equal, (b)
    exact, (c) on 0 lines.
  - step 1 exit 5: the twin builds equal, the integrity passed, N by the
    net, the tripwire 1 + 1 of 3, 4 books.
  - step 2 exit 0: WITHHELD, as the look test.
  - The log says `examSealOpen` true at each start.
- **The control:** the same on `99dd76c`. reproduce exits 5, "…\FRESH\repro:
  FRESH is sealed", which is M1, and steps 1 and 2 then refuse.
- **What it is not:** a rehearsal of the frozen bytes. The explored hashes
  and the ranges cannot match a synthetic world, so it rehearses
  `main.ts`'s wiring, the gate and the seal. It runs again in minutes.

**The technical calls:**
1. **M1:** `seal` is required in `ReproInput`. (a) is
   `reproExtraction(o, explored, range)`, with `range` a required parameter
   (the step passes WAVEH_RANGE), not a default. WAVE-H's own books are
   still read under the closed seal.
2. **M2:** `tripwire` = `{of, leftOut, fundingWithoutPrice, share}`. Share
   = (left out + funding without a price) ÷ of, and null with no
   position. `positions` stays by where over all slices (P14), with
   `onDeciding` beside it. P14 names both prints.
3. **M3:** the sealed-root case is `it.runIf(!verifyExamFreeze(PACKAGE_ROOT).ok)`,
   and the log's `examSealOpen` is expected equal to the gate.
4. **L1:** `ExamDesign.safetyNet`, with EXAM_DESIGN's = SAFETY_NET.
   - `safetyNet` takes its floors as a parameter, and step1.json's inputs
     name them.
   - placebo.ts's projection keeps SAFETY_NET, so `placebo.json` is
     unchanged.
5. **L3:** the builds and integrity hashes are **held**, not dropped: every
   file step 1 names by SHA-256, step 2 reads held, as `books-needed.txt`.
   The program check compares the code and the freeze's SHA-256; the tag
   line is inside the list, so the tag follows.
6. **L4:** `NO_BOOK_LISTING` = "2026-11-13", the listing that found the
   seven days; the refresh of 2026-11-20 found none, so F7's print is
   unchanged. No P17 row: the look test holds the printed date.
7. **L5:** the saved section holds D1–D53, T1–T9 and Q1–Q8. T10–T12 came
   after it, so rules.md's head points to their decisions entries
   (2026-11-20 POLISH-RULES's for T10 and T11; 2026-11-19 `e217fa9` for
   T12). The copy is exact (the copied part's SHA-256 equals the source's,
   `75823228…9100`).
8. **L6:** git's own refusal carries a numeric exit status ("the tag … does
   not hold …"). A git that never ran or was stopped has none ("git could
   not show the tag's list (…)"). It is tested with the PATH emptied
   (`vi.stubEnv`).
9. **L7:** `itemsOf` is exported by `lines.ts`. `dataFrom` takes the
   counted set its caller read (default `countedFrom`), so the
   exploration's callers are unchanged.
10. **L11, one step further:** P2's listing command also lacked `--store`
    and `--heartbeat` (the tool refuses without them), so it is fixed with
    P15's.
11. **Left, as ruled:** `LOOK1` and `BARS[0]` (freeze 2); L8's other names,
    L9 and L12 (the option markers' test changes on the freeze day); no
    file renamed.

The last `pnpm verify`, in the draft's own command on `edf9ce5`'s clean
tree: 89 + 1 files, 822 + 5 tests. Nothing of FRESH, `ANALYZER\FRESH` or
`repro*` was opened. No network, no run on real data.

2026-11-20 (the supervisor — AI-RESEARCH reported): **AN AI MODEL CAN HELP
THE TOOL BUT CANNOT HONESTLY HELP DECIDE A TRADE AT THIS PROJECT'S RATE.
THE USES WORTH HAVING, AND THE OWNER'S FOUR CHOICES, GO TO THE TALK AFTER
FRESH. ONE WORKING RULE NOW: A RULE AN AI SUGGESTS IS A TRY.**

**What:**
- **The report** is `docs/reviews/ai-assist-research-2026-11-20.md`
  (AI-RESEARCH, Sonnet 5.5, xhigh; 09:28–09:45Z; 29 searches, 49 pages).
  It was saved unchanged from its final message. It worked on the web only:
  no code, no API call, no project or owner name sent anywhere; access
  clean.
- **Its findings:**
  1. **No study shows a language model predicting short-horizon crypto
     moves after costs.**
     - The cleanest positive result (headlines to US stocks, 2021–2024)
       decays year by year, dies at a 20 bps cost, and is empty in the
       first 15 minutes.
     - Live tests of AI agents on Hyperliquid perpetuals found no edge.
  2. **Any back-test on the project's months is void.** The Claude 5.5
     models' training data runs to June 2026, so only waves after the model
     id is frozen are clean.
  3. **A filter's value cannot be proven at about 30 trades a month.** The
     gap needed is about 300 bps over a year (the project's own placebo
     errors), and a model id lives about 12–14 months.
  4. **The economic idea is sound in stocks:** news shocks drift, no-news
     shocks revert (Chan 2003; Savor 2012). In a cascade, though, the news
     rarely exists at +2 minutes, and 2025-10-10 had both a trigger and a
     cascade.
- **Its ranked uses:**
  1. a research and review partner (as now);
  2. a plain-language alert explainer, facts and links only, about $3 a
     month, after the freeze;
  3. optionally, an 8-week shadow pilot that measures only whether news
     exists in time, whether repeated answers agree, latency and cost
     ($14–39 a month), never gating a trade;
  4. never an AI verdict in the entry path; never re-labelling the past.
- **An outside-the-box lead:** public, dated calendars (token unlocks,
  delistings, scheduled macro events) as a deterministic, look-ahead-free
  feature. Availability and terms are not verified, and any new source
  needs the owner's approval (Iron Rule 1).

**Now (the supervisor's working rule, as the report advises):** any rule an
AI suggests, the supervisor's included, is a try and goes in the try log
like any other. It never goes straight onto data that has already been
seen.

**For the owner's talk after FRESH:**
1. Iron Rule 1 for outbound calls to Anthropic's API, with public data only
   and the key in `.env`.
2. The alert explainer.
3. The 8-week shadow pilot.
4. A research item on calendar flags.

2026-11-20 (the supervisor — the exam's fresh code review): **"AFTER THESE
FIXES", NOT A REWORK: NO HIGH FINDING, NO SILENT WRONG VERDICT, NOTHING
THAT OPENS FRESH EARLY OR TOUCHES THE LIVE PROGRAMS. THREE MEDIUM, TWELVE
LOW. ITS SEVEN QUESTIONS ARE RULED. THE FIX ROUND GOES TO A FRESH
POLISH-FIX, THEN A FIX-CHECK.**

**What:**
- **The review** is `docs/reviews/polish-code-review-2026-11-20.md`
  (POLISH-CODE-REVIEW, Sonnet 5.5, max; 05:43–08:35Z; context peak 832k).
  It was saved unchanged from its final message.
- **Access was clean.** Nothing of FRESH, no `repro*`, and its runs were
  light (one at a time, 2 vitest workers).
- **Its checks:**
  - 77 breaks, 72 killed: all of the rules review's 47; 15 of its 19
    wiring breaks; 10 of 11 survivor re-breaks;
  - the P11 grid: 30,000 sets, 0 differences;
  - four differentials against brute force, 0 differences;
  - the whole suite in a clean copy: 814 tests;
  - a freeze rehearsal in a scratch repository (tag 1, gate ok, 125 files
    equal to the draft).
- **The medium findings:**
  - **M1:** `reproduceStep` is given no seal, so look 1's reproduction into
    `ANALYZER\FRESH` would be refused.
  - **M2:** step 1 prints no denominator for P15's 5% tripwire.
  - **M3:** a test pins the pre-freeze state, so the first verify after the
    tag goes red.

**The rulings:**
1. **Q1, yes.** M1–M3 and L1–L3 are fixed before the freeze, then `pnpm
   verify`, the draft list again, and a fresh fix-check. The frozen program
   reproduces at look 1 anyway (D47).
2. **Q2, yes.** L7 (duplicates), L10 (one sentence built), L11 (stale
   headers, the fetch command in P15), the `key` alias and the `json`
   shadow. There are no file renames.
3. **Q3:** FRESH-2 is fetched into `…\FRESH\store`, and the allow-list is
   unchanged. `look.ts`'s listing date moves to one `design.ts` constant now
   (L4). `LOOK1` and `BARS[0]` become parameters at freeze 2, which
   `steps.js` may change.
4. **Q4, yes.** THE PLAN is saved as
   `docs/reviews/polish-rules-plan-2026-11-19.md` and indexed (L5).
5. **Q5, yes, time-boxed.** A rehearsal of `main.ts`'s reproduce → step 1
   → step 2 on a small synthetic world named as FRESH's keys, in a scratch
   git repository with a synthetic tag. It would have caught M1. If it
   cannot be built in about three hours of the fix round, the builder says
   why and it moves to look 2's build.
6. **Q6, no.** Step 1's order stays (the twin build, then the integrity).
   Plan for the likely exit 6 at the pairing check: about 75% chance of at
   least one one-sided trade on FRESH, ruled by H0's route.
7. **Q7:** B or A and BASE or OWN stay the owner's at the talk.
   - The recommendations are B and BASE.
   - On the freeze day, the option markers' test (L12) changes in the same
     commit as the answers.
   - The listing's result (decisions `f4ccf50`: 11-13 → 15 have books)
     goes into P2 and P16's placeholder row in the same fix round.

2026-11-20 (the owner — the memory test): **ONLY IF NEEDED. IT BECOMES
NEEDED WHEN ANOTHER GUARD TRIPS: A SECOND CRASH, A DIFFERENCE BETWEEN
FRESH'S TWO BUILDS, OR A REPRODUCTION THAT DIFFERS AGAIN.**

**The owner, about 08:15Z:** "will do that if needed... didn't have this
problems so far".

**The facts on the machine** (read-only `Win32_PhysicalMemory`, 08:1xZ):
- four 8 GB DDR4 modules: Kingston KF3600C17D4/8GX in A1 and B1,
  KHX3600C17D4/8GX in A2 and B2;
- two part numbers, so likely two kits;
- all four run at 3,600 MT/s (their XMP speed);
- 12.3 GB of 31.9 GB free at the time.

Four modules at XMP speed, from two kits, is a common setup that passes
normal use and can slip under long heavy load. The night of 2026-11-19/20
was this PC's heaviest load so far. A rare software fault, or chance, is
not ruled out: both events were Node processes.

**Why waiting is safe:**
- **The exam's guards catch a fault in the data or the code's reading of
  it:**
  - FRESH is built twice and must be equal byte for byte;
  - the frozen program runs the reproduction again at look 1;
  - the look's Final review recomputes its result with independent code.
- **The supervisor keeps heavy runs light,** with one test run at a time
  and few workers.

**The trigger:** any of the three guards trips, or the collector crashes
again. Then the owner runs Windows Memory Diagnostic before the work goes
on. If it finds errors, the usual remedy is a slower memory setting in the
BIOS, which is the owner's call. The supervisor changes no system setting.

2026-11-20 (the supervisor — the collector's first crash): **THE COLLECTOR
STOPPED AT 07:07:12Z WITH A NATIVE HEAP-CORRUPTION EXIT (0xC0000374) AND
ITS WATCHDOG RESTARTED IT AT 07:13:29Z. WITH THE REPRODUCTION'S ONE-OFF
MISREAD, IT POINTS TO THE PC'S MEMORY UNDER HEAVY LOAD. THE OWNER IS ASKED
FOR A MEMORY TEST BEFORE LOOK 1.**

**What happened:**
- **The old process** (pid 22356, running since the PC's restart on
  2026-11-14 14:12Z) logged normally to 07:01:06Z: the hour files
  compressed and checked, audits 86–89 of 90. Its last heartbeat was at
  07:07:04Z.
- **It ended at 07:07:12Z** with return code 3221226356 = 0xC0000374
  (STATUS_HEAP_CORRUPTION), with no log line. That is a crash inside the
  native process, not an error of the program's own code.
- **The watchdog** ("polymarket-follow poller check", every 5 minutes)
  relaunched it at 07:13:29Z (pid 4456). Both connections are open, the
  heartbeat is fresh, and the audits are back to 88 of 90.
- **The recordings have a gap of about 6 minutes**, 07:07 → 07:13Z.
- **No Application Error, WHEA or System event** was logged around it.

**Why it matters:**
- It is the collector's first crash. The only other starts (2026-11-10,
  -11, -12, -14) were deploys and the owner's restart.
- **It is the second sign of a memory fault on the same night.** The
  reproduction's first run read 6 lines of one file wrong, after the
  checksum. Both came during the night's heaviest load: builders' and
  reviewers' tests, 361 deliberate breaks, two reproductions with peaks of
  8.4 GB.
- **Non-ECC memory that fails under load** fits both. A software cause is
  not ruled out, but the two came from different programs.

**What:**
1. **The owner is asked** to run Windows Memory Diagnostic (a restart) at a
   time they choose, before look 1. The tasks start again at sign-in, as on
   2026-11-14.
2. **Until then, heavy runs are kept light:** one test or break run at a
   time, at most 2 vitest workers. POLISH-CODE-REVIEW was told so.
3. **The double build of FRESH and "nothing heavy beside the look" stay.**
   If the memory test finds errors, look 1 waits for the owner's fix.
4. **MARKET-1's run at 10:30Z** reads the recordings with the gap. Its
   frozen coverage rules handle a gap; the supervisor checks its log after
   the run.

2026-11-20 (the supervisor — the reproduction's second run): **EVERY PART
PASSED. THE FIRST RUN'S ONE DIFFERING FILE WAS A ONE-OFF FAULT.**

**The run:** `exam --step reproduce` from the same worktree build of
`0532fa8` (`92722635…`) and the same inputs, started 06:00:42Z
(`verify/POLISH-RULES/repro-0600.cmd`), ended 07:34:38Z, **exit 0**.
`repro.json` (`6477d2c5…`) has `passed: true`.
- **(a):** equal. 14,563 files with no problem, including
  `node_fills_by_block/hourly/20260320/7.lz4`, which run 1 read with 6
  failed lines.
- **(b):** exact.
  - N on E: +94.6856778367026.
  - N on C: +211.26301264344045.
  - The 715 line on E: +203.3589718434901.
  - No differences.
- **(c):** equal; WAVE-H's 1,289 prices, largest difference 0 bps.
- **Times:** 5,636 s in all (extraction 4,570 s); peak 8.4 GB.

**So:**
- The trusted store and the pre-freeze code reproduce each other exactly.
- Run 1's fault (decisions 2026-11-20, the reproduction's first run) was
  a one-off. It came while a builder's `pnpm verify` ran beside it; this
  run had nothing heavy beside it.
- The double build of FRESH and the rule "nothing heavy beside the look"
  stay.
- The frozen program runs the reproduction again at look 1 (D47).

**Disk:** run 1's outputs (`ANALYZER\POLISH-RULES\repro-run1\`, about 68
GB) and this run's parts are deleted after the code review is accepted.
They are derived files, re-creatable.

2026-11-20 (the supervisor — option B's listing refreshed): **2026-11-13 →
15 HAVE THEIR BOOKS. `NO_BOOK_DAYS` STAYS 2026-07-08 AND 07-12 → 17.**

**What:**
- **The listing:** the archive listed SOL's 24 hourly `l2Book` keys for
  each of 2026-11-13, 11-14 and 11-15, metadata only. The command was
  `node tools/waveh-fetch.cjs --fresh --plan --books <the day's 24 keys>
  --store F:\polymarket-follow-research\FRESH\store --heartbeat <the
  collector's>`.
- **When:** 05:48:03Z, 06:00:23Z and 06:00:57Z. The tool waits out the
  02:30–06:00Z window even with `--plan`, so the first run waited until
  06:00Z.
- **The result:** "listed 24 … not in their hour folder's listing 0" each
  day. Nothing was fetched or written. The outputs and key files are in
  `verify/POLISH-RULES/listing-2026111{3,4,5}.out` and `books-*.txt`.

**So:**
- **`NO_BOOK_DAYS`** (option B's days) is 2026-07-08 and 2026-07-12 → 17,
  as it is.
- **P16's "11-13 → 15 without books" rows** describe a case that did not
  happen. Its placeholder row ("[printed after the listing's refresh]")
  becomes "not needed: the listing of 2026-11-20 found 11-13 → 15 with
  books".
- **P2's sentence** names this listing.
- **P16's operating numbers:** B 2.16%, P(WITHHELD) 1.8%; A 5.14%, 11.6%.
- **Timing:** the text edits go in the code review's fix round, with the
  draft list written again.

2026-11-20 (the supervisor — the exam at "rules ready", under the owner's
overnight go): **POLISH-RULES's BUILD IS DONE, ITS RULES REVIEW'S FIXES ARE
IN, AND THE FRESH CODE REVIEW RUNS. ITS THREE LAST QUESTIONS ARE RULED
YES.**

**What:**
- **Successor 5's commits**, each with `pnpm verify` green and the three
  freezes verifying:
  - `ecca416`, the breaks round: 314 breaks, 248 killed at once; 49 more
    killed by new tests; 17 explained;
  - `510c05b`, the rules review's fix round: look 2's freeze in P0/P1/P12
    with the allow-list `LOOK2_ALLOWED` and `--look2 <tag>`; the
    one-later-look branch removed; findings 2–13;
  - `3435f72`, the draft list: 125 files, `1d3aeba8…dd71`;
  - `5e5619f`, the docs.
- **The supervisor's checks:**
  - `pnpm verify` on `5e5619f` green (89 + 1 files, 814 + 5 tests; the
    three freezes 0 differ), in `verify/POLISH-RULES/verify-5e5619f.out`;
  - access clean.
  - Its context peaked at 899k (93%), past the brief's stop at about 70%.
    So the fresh code review reads its last three commits line by line.
- **POLISH-CODE-REVIEW** (Sonnet 5.5, max) has started. Its brief is
  `workers/POLISH-CODE-REVIEW/brief.md`. It re-runs the rules review's 47
  breaks and P11 grid on HEAD, and runs no test or break until the
  reproduction's second run ends.

**The rulings on successor 5's questions:**
1. **FRESH-2's funding grid** starts its own 20-day grid at FRESH_END, so
   every line of `fresh.sha256` stays unchanged.
2. **`polish/look1.sha256`** is an allowed added file at look 2's freeze.
   It holds look 1's `step1.json` and `result.json`, so look 2's reading of
   look 1 is mechanical.
3. **If the refresh finds 2026-11-13 → 15 without books,** they join
   `NO_BOOK_DAYS` before the freeze; P16's "B, 11-13 → 15 cut too" row
   applies (2.34%, P 4.5%). The listing is metadata only, with the
   download tool's `--fresh --plan --books`. The tool waits out 02:30–06:00Z
   even in plan mode, so it runs after 06:00Z.

2026-11-20 (POLISH-RULES — the exam built up to "rules ready", its breaks
round and the rules review's fix round: the technical calls of successors 2
to 5, within THE PLAN and its rulings): **THE EXAM'S RULES, PROGRAM AND
DRAFT FREEZE LIST ARE BUILT AND FIXED, EACH COMMIT GREEN; EVERY DELIBERATE
BREAK OF WHAT DECIDES IS KILLED OR SHOWN EQUIVALENT. NOT FROZEN; FRESH STAYS
SEALED.**

**What is built** (architecture, "The exam"; `apps/poller/polish/rules.md`
P0–P17, final but the owner's two marked options, B or A and BASE or OWN):
`exam --step placebo | reproduce | 1 | 2`; the seal's opening by a tagged
freeze; the freeze tool `tools/polish-freeze.cjs` (the draft, `--final
--tag <n>`, `--look2`, `--data`) and FRESH's data list `polish/fresh.sha256`;
the draft list. The commits: `614262e`, `6fd8458`, `6e8f57b` (successor 2);
`60a7ecc`, `486c7fb`, `0532fa8`, `3e2b421` (successor 3); `de93a83`,
`fd4cb55`, `b979021`, `4e2b276`, `3f01a28`, `abfa530`, `09eaf57`
(successor 4); `ecca416` the breaks round, `510c05b` the fix round, the
draft list `3435f72` (125 files, `1d3aeba8…dd71`), and these docs
(successor 5).

**The breaks round** (`ecca416`): 314 one-line breaks of what decides in
commits 1–9c, each against the exam's test files in scratch copies of
`09eaf57`: 248 killed at once; of the 66 survivors, 49 killed by new tests
(run again after them, re-aimed where a fix moved the text) and 17 shown
equivalent, fail-closed or prints, each explained in POLISH-RULES's
progress. The fix round's 13 breaks: all killed. POLISH-RULES-REVIEW's own
47 breaks and its P11 grid are run again on the fix commit (`3b98568`, Q6).

**The technical calls:**
- **The seal** is the exam's own field (`{ examFrozen }`), so WAVE-H's gate
  (`{ open }`) never passes for it; closed is every reader's default; a key
  dated at or after FRESH_END is refused, open or closed. The freeze opens
  it only when the list verifies and the git tag its one tag line names
  holds this very list (Q1).
- **One z whichever line decides** (T10): the larger of the textbook floor,
  the 715 line's E-only percentile and N's E ∪ C percentile, each at the
  look's length and the larger flip; LIKELY's alike. BARS are
  `placebo.json`'s exact doubles (rules.md prints three decimals).
  `placebo.json`'s SHA-256 is part of the design, read from EXAM_ROOT.
  `placebo.ts` keeps the removed one-later-look row's floors for
  `placebo.json`'s row alone, so its output is unchanged.
- **The books are fetched for N's slices 0–19 legs** on the deciding days
  (T11), a superset of the 715 line's.
- **The safety net counts the 715 line's positions not left out, after
  option B's cut** (the filter inside `safetyNet` since the breaks round).
  Option B matches a leg's UTC day.
- **The day flip** draws each UTC day of the span its own sign; the episode
  flip stays the default, draw for draw.
- **The price:** the deciding line's funding is the exploration's
  settlement code, its unpriced reason "funding without a price"; BASE is
  the two segments' whole minutes pooled at 24 hours (`examBase`), under
  either option.
- **The reproduction's (b)** holds the exam's own placement of the 715 line
  to `placebo.json`'s line; its end (`reproEnd`) writes `passed` only when
  (a), (b) and (c) all held, then exits 6 naming each part.
- **The WITHHELD projection's model** reads a leg's tape chance by its own
  tape and carries the ten months' one funding-gap day (2025-07-18) at E's
  rate; `withheld.mjs` now also prints "B as ruled, 11-13 → 15 without
  books, not cut", run by the supervisor after the listing's refresh.
- **FRESH's integrity** reuses G0's and G5's own checks (`wholeOf`,
  `pairingOf`), their output on the ten months unchanged.
- **Step 1** writes the two builds' comparison and the integrity as their
  own files before `step1.json`; it extracts each time it runs; after a
  difference both builds are moved aside. The positions' SHA-256 covers all
  four lines. It prints the counted fills and other liquidation legs by
  month, kind and method, and names `books-needed.txt` by SHA-256, which
  step 2 holds before its books check.
- **Step 2** builds its deciding set by `decidedOf` (the excess by the
  option, both legs at the book, a left-out position nothing else);
  computes the report before `result.json` and writes it after; keys its
  maps by slice, instant and coin (`keyOf`); labels the W4 lines beside the
  deciding one "seeded, decides nothing".
- **Exit codes:** 4 the exam's freeze not verifying for steps 1–2; 5 books
  needed or already run; 7 the two builds differ.
- **The freeze tool:** `--data` requires FRESH's manifest to be exactly
  FRESH_RANGE's keys and refuses thin days other than `design.ts`'s; the
  list's head, its tag (`--tag <n>`) and the closure's check are tested
  functions; `--look2 <tag>` compares the hash lines with the tag's list
  (comments aside) and refuses a file changed or added outside
  `LOOK2_ALLOWED`, and any file gone.
- **Look 2** (rules.md P1): FRESH-2's funding on its own 20-day grid from
  FRESH_END, so every line of `fresh.sha256` reappears unchanged (DATA
  END's grid would change 38 of them); look 1's `step1.json` and
  `result.json` held to `polish/look1.sha256`, an allowed added file; P17's
  look-1 rows marked.
- **rules.md is formatted by hand and frozen** (`apps/poller/polish` in
  `.prettierignore`); its P17 table and P1's allow-list are held to the code
  by `polish-rules.test.ts`.

2026-11-20 (the supervisor — the exam's fresh rules review, under the
owner's overnight go): **"MAY FREEZE AFTER THESE FIXES": NO HIGH FINDING,
THREE MEDIUM, TEN LOW, NONE CHANGING THE DESIGN, THE STATISTIC OR THE BARS.
ITS SIX QUESTIONS ARE RULED YES; THE FIX ROUND GOES TO POLISH-RULES.**

**What:**
- **The review** is `docs/reviews/polish-rules-review-2026-11-20.md`
  (POLISH-RULES-REVIEW, Sonnet 5.5, max; context peak 765k), on `09eaf57`
  and decisions `5f01f05`.
  - The harness refused the subagent's own report file, so the supervisor
    saved its final message unchanged.
  - Access was clean: no FRESH data, no `ANALYZER\FRESH`, no `repro*`,
    nothing of C for the 715 line. Its real-data reads (E only, two
    manifests, the exam's two outputs) ran 04:11–04:20Z at below-normal
    priority, on the supervisor's words of 04:09Z and 04:15Z.
- **What it recomputed with its own code, all equal:**
  - the 715 line's E-only placebo: to the digit with the exploration's draw
    order; within 0.013 on its own random stream;
  - the 715 line on E: 5,067 / 4,310, +203.359 ± 79.083;
  - W4's three cuts;
  - the funding-gap share, 2.41%;
  - the thin-day worst case, 129 and 201;
  - P16's projection table and the three bars;
  - `fresh.sha256` against FRESH's manifest, 4,614 of 4,614;
  - the 59 thin days;
  - the draft list against a clean build, 125 of 125;
  - `verdictOf` against its own P11 on 30,000 made-up sets, 0
    differences.
- **Its breaks:** 47; 40 killed, 7 survived (v1, v2, p2, n2, m3, d3b, h3),
  all in wiring or edges that no test pins.
- **The medium findings:**
  1. look 2's freeze must be written into the rules now;
  2. option B's no-book days rest on a listing that reached 2026-11-12;
  3. step 2's hand-off into the verdict is not pinned by a test.

**The rulings:**
1. **Q1, yes.** P0, P1 and P12 carry look 2's freeze as the review's nine
   items, with a mechanical allow-list check in the freeze tool. Only the
   named files may differ from freeze 1's list, for the named kinds of
   change, and a test holds the allow-list in rules.md equal to the tool's.
2. **Q2, yes.** After an early verdict at look 1, look 2 is optional and
   printed "after the verdict"; it never changes the verdict (as M11 prints
   MARKET-1's later looks).
3. **Q3, yes.** Before the freeze, the supervisor refreshes option B's
   list with a metadata-only listing for 2026-11-13 → 15. `NO_BOOK_DAYS`,
   P2, P16 and P17 are written from it, and the missing row is printed. B
   stays the recommended default.
4. **Q4, yes, as a sentence.** At step 1, if the deciding line's left-out
   plus funding-without-price share is above 5%, the supervisor rules on
   it as a data defect by H0's route before the books are fetched. It is
   not a new verdict rule.
5. **Q5, yes.** Findings 5–9 and 11 go in now: the "seeded, decides
   nothing" labels, the placebo copy into EXAM_ROOT, the freeze tool's
   `--tag <n>`, the counted-fills print, the books-needed SHA-256, and the
   median's wording. So does finding 13's sentence.
6. **Q6, yes.** Its 47 breaks and the P11 grid are run again on the fix
   commit, before the code review, outside 06:00Z until the supervisor's
   word.
7. **Q7 (B or A; BASE or OWN)** stays the owner's at the talk. The
   recommendations are B after the refresh, and BASE.

2026-11-20 (the supervisor — the exam's looks, under the owner's
overnight go): **TWO LOOKS: LOOK 1 ON FRESH NOW, LOOK 2 ABOUT 2027-02-08.
THE "ONE LATER LOOK" BRANCH IS REMOVED.**

**Why now:**
- **The owner's words already decide it.** "i would like to do shortcut but
  also would like to do FRESH now, not to wait" (2026-11-19, about 22:10Z).
  One later look would keep FRESH sealed until about 2027-02-08.
- **POLISH-RULES-REVIEW found (preliminary, 04:08Z) that the branch is not
  one line.** `OPTIONS.looks` only swaps the bars, while the days and the
  range stay look 1's. So freezing it would run look 1's 100 days at the
  182-day bars.
- **Look 2 is a later build anyway.** FRESH_END and FRESH-2's range must
  change, so P1/P12's "look 2's code byte-identical to look 1's list"
  cannot hold as written.

**What:**
1. **The looks are two.**
   - Look 1 runs on FRESH's deciding days at z 2.847 (LIKELY 2.360).
   - Look 2 runs on those days plus FRESH-2's months at z 2.81 (LIKELY
     2.437).
   - The looks follow M11: only HOLDS or DOES NOT HOLD end the exam early.
2. **The "one later look" branch** comes out of `OPTIONS`, rules.md and
   P16.
3. **P1/P12 are reworded.** Look 2 is a later build under its own freeze.
   `rules.md` stays unchanged, and every look-1 file stays byte-identical
   except those FRESH-2's range must change, which are named in the rules
   (T2).
4. **Still the owner's at the talk:**
   - WITHHELD's option B (recommended) or A;
   - Q4 (the default is no change).

2026-11-20 (the supervisor — the reproduction's first run, under the
owner's overnight go): **PARTS (b) AND (c) REPRODUCED EXACTLY. PART (a)
DIFFERED IN ONE FILE OF 8,846, A ONE-OFF FAULT IN MEMORY. THE TRUSTED STORE
STANDS. FRESH'S STORE WILL BE BUILT TWICE AND MUST MATCH ITSELF BYTE FOR
BYTE. THE REPRODUCTION RUNS AGAIN AT 06:00Z.**

**The run:** `exam --step reproduce` from the detached worktree build of
`0532fa8` (`92722635…`), started 00:30:24Z, ended 02:08:08Z, exit 6. Its
outputs are kept in `ANALYZER\POLISH-RULES\repro-run1\` (`repro.json`,
`repro.out`, the parts, the store), and copied to the supervisor's
`verify/POLISH-RULES/`.
- **(b), exact:**
  - N on E: 65,533 priced, +94.6856778367026 ± 54.25885218671187;
  - N on C: 16,754 priced, +211.26301264344045 ± 122.13521220804039;
  - the 715 line on E (slices 0–19): 4,310 priced, +203.36 ± 79.08;
  - every number equal to the printed outputs.
- **(c), exact:** WAVE-H's 1,299 positions priced book first; 1,289 priced,
  largest difference 0 bps.
- **(a), one difference:** 14,563 files and 21.24 GB written.
  - Apart from run metadata (the code's fingerprint, peaks, seconds,
    times), the only difference is one fill file:
    `node_fills_by_block/hourly/20260320/7.lz4`.
  - The run read 43,220 lines, 347,870 records and 6 failed lines, plus a
    gap of block numbers 929457116–117. The trusted store holds 43,216
    lines, 347,880 records and 0 failed.
  - Every column file is equal; the 10 lost records were not ones the
    store keeps.

**The diagnosis** (the supervisor's checks in `verify/POLISH-RULES/`):
- **The source file and the decoder are sound.** The file's SHA-256 equals
  its list (`d5018198…`). Three decodes with the analyzer's decoder give the
  same bytes (`14a76839…`), 43,216 lines and 0 lines that fail JSON.parse.
  The frame carries a content checksum, which the run also checked.
- **So the decoded bytes changed in memory after the checksum,** in two
  adjacent lines (about 7 KB), once.
- **The trusted store has 0 failed and 0 slow lines in all 8,845 files.**
  It and the run agree on every other file, and the gates G1–G6 passed. The
  trusted store stands.
- **No cause found:** no WHEA (hardware) event in 30 days, no system error
  since 00:30Z, 15.8 GB of RAM free. A heavy `pnpm verify` of the builder
  ran at the same time. The scanner is synchronous and copies a line that
  spans blocks.

**What:**
1. **FRESH's store is built twice at step 1, and the two must be equal byte
   for byte** (the manifest's files, `files.jsonl`, every column file),
   using the reproduction's (a) comparison. A difference stops step 1 with
   the list. Nothing is repaired in code; step 1 is run again.
   - Why: FRESH has no reference store, and a fault like this one could
     also change a number silently.
   - Cost: about 75 minutes more at the look.
2. **The reproduction runs again,** the same build and the same inputs,
   detached, waiting until 06:00:30Z (`verify/POLISH-RULES/repro-0600.cmd`).
   If its (a) is exact, the fault was a one-off.
3. **Nothing heavy runs beside the look.** At look 1, no build, test or
   other run on the machine.
4. **For the owner:** a memory test of the PC (Windows Memory Diagnostic)
   at a restart they choose. It is the owner's call.

2026-11-19 (the supervisor — the exam's placebo and WITHHELD projection
ran; three questions ruled under the owner's overnight go): **z FOR LOOK 1
IS 2.847 (LIKELY 2.360). OPTION B, CUTTING THE DAYS WITHOUT BOOKS, BRINGS
THE CHANCE OF WITHHELD FROM ABOUT 12% TO ABOUT 2%; IT IS THE RECOMMENDED
DEFAULT, AND THE OWNER CONFIRMS IT AT THE TALK. ONLY HOLDS OR DOES NOT HOLD
END THE EXAM EARLY.**

**The owner's go, 2026-11-19 about 23:38Z:** "please continue over the
night. as usually only critical things you should stop, otherwise i agree
on your suggestions".

**The placebo** (`exam --step placebo`, 23:21:16–23:27:39Z, exit 0, peak
2.6 GB; `ANALYZER\POLISH-RULES\placebo.json`, SHA-256 `c25345f7…9575`,
checked by the supervisor):
- **Its checks passed:**
  - N's E lines are B0's at W4 ≥ 336, one for one;
  - W4's E quantiles come out at exactly 336, 715 and 1,391;
  - N at K = 147 equals `beside.json`'s placebo to the bit;
  - K = 10 agrees with POLISH-EXPLORE-REVIEW's independent placebo within
    sampling noise.
- **z by T10:**

  | Looks | HOLDS | LIKELY |
  |---|---|---|
  | Two looks, look 1 (100 days) | 2.847 | 2.360 |
  | Two looks, look 2 (182 days) | 2.81 | 2.437 |
  | One later look | 2.653 | 2.213 |

  Every value above its floor comes from the 715 line's day flips (E
  alone). Its 182-day windows are only 30 distinct starts.
- **The projection** (F13; P(HOLDS) / P(LIKELY or HOLDS)):

  | Line | Look 1 | Look 2 | One later look |
  |---|---|---|---|
  | 715 line (E alone: 203.4 less 79.1; seeded, optimistic) | 4.3% / 11.0% | 10.1% / 18.3% | 13.2% / 24.9% |
  | N (C: 211.3 less 122.1) | 4.6% / 11.5% | 7.9% / 14.9% | 10.4% / 20.7% |

  The safety net and TOO FEW fire in none of E's 100-day windows.

**The WITHHELD projection** (`workers\POLISH-RULES\withheld\withheld.mjs`;
`ANALYZER\POLISH-RULES\withheld\withheld.json`, SHA-256 `8e8249d7…3048`;
counts only):
- **The model is checked.** Every leg of N's slices 0–19 was walked again
  at the tape and equals the sweep (13,002). The model reproduces the
  look's own shares on TEST: 6.02% against 6.02%, and 4.58% against 4.58%.
- **The 715 line under option A** (as planned, E's rates): mean 5.1%,
  P(WITHHELD) 11.6%; 19.6% if 2026-11-13 → 15 also lack books.
- **By part:**
  - book short: 0;
  - tape short: 1.9;
  - unpriced at the tape: 1.0;
  - funding without a price: 2.4 (one day, 2025-07-18);
  - F7's 07-08: 0.07.
- **Option B** (a position with a leg on 2026-07-08 or 07-12 → 17 is cut
  from the deciding days and printed apart):
  - mean 2.2%, P(WITHHELD) 1.8%;
  - with C's rates: 4.3%, 6.3%;
  - cost: 10% of the line's positions (9 entry days), the error about 5%
    larger, P(HOLDS) at look 1 4.3% → 3.9%, the safety net firing in 7.1%
    of E's windows.
- **Options C and D** are not recommended:
  - C, tape-short legs counted as priced: N's short legs carry half its
    gain;
  - D, a higher threshold.

**The rulings:**
1. **Q1, WITHHELD: option B is the marked option's recommended default.**
   - Its days are fixed at the freeze from F7's list, the archive
     listing's metadata (today 2026-07-08 and 07-12 → 17).
   - Step 1's safety net and step 2 cut the same days.
   - A day the fetch later finds without books is not cut; its legs go to
     the tape, as under A.
   - At the owner's talk the owner confirms B or keeps A.
   - Why: it trades about 0.4 points of P(HOLDS) for about 10 points less
     risk of an exam that cannot answer.
2. **Q2, F14 read as MARKET-1's M11, which F14 names:** only HOLDS or DOES
   NOT HOLD end the exam at look 1. WITHHELD, TOO FEW, LIKELY and NOT
   SETTLED let look 2 run, and at the last look the reading stands. Why: a
   data problem at look 1 must not end the exam with no answer. The z of
   each look already pays for two looks.
3. **Q3 (T12) confirmed:** the safety net is read once, at the first look's
   step 1, and the line it picks decides every later look. One rule decides
   the exam.

**For the owner's talk (unchanged):** the looks, WITHHELD's B (recommended)
or A, and Q4. **A correction to the supervisor's rough word to the owner:**
the 715 rule's conservative chance at look 1 is about the same as N's
(4.3% against 4.6%), not double. Its edge shows at look 2 and at one later
look.

2026-11-19 (the owner — the exam's recipe): **THE 715 CUT DECIDES THE EXAM
ON FRESH, WITH THE SAFETY NET. N AND THE 1,391 CUT ARE PRINTED BESIDE.
EVERY OTHER VARIATION IS RECORDED FOR A LATER TALK.**

**The owner, about 22:08Z:** "ok, let's go with 715 shortcut, keep working
and notify me. all other possible variations record for later, we will
discuss."

**What:**
1. **The deciding recipe** is B0 + W4 with W4's cut at **715 accounts**:
   enter only when at least 715 different accounts had a counted fill (H4:
   the liquidated account's own fill) of σ in the 38 coins up to t,
   venue-wide. Everything else is N's. It is D53's branch of POLISH-RULES's
   plan, `[OPTION A]` filled.
2. **The safety net** (decisions 2026-11-19, the 715 option made safe):
   - step 1's counts, before any price, give the 715 line fewer than 20
     UTC days or 10 coins → N decides instead, at the same z;
   - the switch is printed.
3. **Beside the verdict, deciding nothing:** N (W4 ≥ 336) and the 1,391
   cut, labelled; all 147 slices.
4. **z, LIKELY, the floors, K = 20, the verdicts and their order** stay as
   ruled.
5. **Still open, for the owner's talk before the freeze:**
   - the looks: two, or one later look;
   - WITHHELD's option B (cut the no-book days);
   - Q4: a market-adjusted excess, default no change.
6. **Recorded for a later talk** (the plan page's backlog, "Variations for
   later"): the other cuts as their own later tests; bigger trades on
   bigger crashes; N as the clean-checked rule; Q4's market-adjusted
   reading.

**Why** (decisions 2026-11-19, the 715 option made safe):
- on E, the cut keeps 89.1% of N's gain on 48.6% of its positions;
- z rises from 1.75 to 2.58, and the two best days' share falls from 56%
  to 47%;
- a HOLDS on FRESH is proof for any rule frozen before FRESH opens;
- the safety net removes its TOO FEW risk without reading an outcome.

**The honest gap:** it was chosen after looking, and no clean months
checked it before FRESH.

2026-11-19 (the supervisor — the 715 option made safe, for the owner's
choice at the talk): **IF THE OWNER CHOOSES THE 715 CUT TO DECIDE, N TAKES
OVER WHEN STEP 1'S COUNTS, BEFORE ANY PRICE, GIVE THE 715 LINE FEWER THAN
20 DAYS OR 10 COINS. THE CHOICE STAYS THE OWNER'S.**

**The owner, about 22:10Z:** "i would like to do shortcut but also would
like to do FRESH now, not to wait". The owner is weighing the 715 cut
deciding (decisions 2026-11-19, the two stricter crash cuts, item 4)
against N deciding with the cut as a reference.

**The evidence for the shortcut** (E only, seeded;
`verify/CRASH-PRINT/share.out` from `crash-print.out`):
- the 715 cut keeps 48.6% of N's priced positions on E and **89.1% of its
  summed net**;
- the positions between N's cut and 715 (33,673) average +20.0;
- on E's one-way error by day, z rises from 1.75 (N) to 2.58, and the two
  best days' share falls from 56% to 47%.

**Against it:**
- it was chosen after the review showed where the gain sits, and C is spent
  on N, so no clean check exists before FRESH;
- its error is about a quarter larger;
- it had 54 of E's 211 days, which scales to about 26 on FRESH's ~100 clean
  days (fewer if the no-book days are cut), near TOO FEW's 20.

A HOLDS on FRESH would still be proof: any rule frozen before FRESH opens
keeps the 99% bar's protection. What is uncertain is only its chance.

**What (D53's branch, if the owner chooses it):**
1. The 715 line decides at the same z, LIKELY and floors as N.
2. **The safety net:** step 1 (counts only, before any price) counts the 715
   line's positions on the deciding days. If they span fewer than 20 UTC days
   or 10 coins, **N decides instead**, at the same z. The switch is printed.
   It reads no outcome, so the bar keeps its meaning.
3. N and the 1,391 cut are printed beside.
4. **POLISH-RULES prints for both choices,** before the talk: P(HOLDS) and
   P(LIKELY or HOLDS) at each look, P(the safety net fires), and the WITHHELD
   share. For 715 these come from E alone, labelled seeded and optimistic.

**FRESH runs now either way.** Look 1 runs on FRESH as soon as the rules are
reviewed and frozen, not in February. Only look 2 waits for FRESH-2's
months.

2026-11-19 (the supervisor — POLISH-RULES's plan, its eight questions
ruled before the build): **THE EXAM'S PLAN IS ACCEPTED. LIKELY NEVER ENDS
THE EXAM, DOES NOT HOLD KEEPS HOLDS'S z, z COMES FROM THE PLACEBO AT EACH
LOOK'S OWN LENGTH, AND FRESH OPENS ONLY ON A TAGGED FREEZE. A FRESH
POLISH-RULES BUILDS.**

**What:**
- **The plan:** `workers/POLISH-RULES/progress.md`, "THE PLAN"
  (2026-11-19 21:55–22:01Z). It holds rules P0–P16, the definitions
  D1–D53, the code in `src/polish/exam/`, the tests and the breaks, three
  runs on real data, and the WITHHELD projection's method. It includes K =
  20 and the two side cuts. Nothing was built or run, and FRESH was never
  opened.
- **Four traps it found in the code,** each handled in the plan:
  - WAVE-H's frozen `fillKeys` stops at DATA END + 1 h;
  - `countedFrom` and `forcedFrom` drop every record after DATA END;
  - `inPart`'s 50-hour stop would cut about a day per segment;
  - the kit's `marketFrom` refuses dates past 2026-11-07.

**The rulings (the supervisor's, within the owner's rulings above):**
1. **Q1, the seal opens only on a tagged freeze.** `polish/FROZEN.sha256`
   must verify, and the git tag its header names must hold that very file
   byte for byte (`git show <tag>:…`).
2. **Q2, z per look** (F1): the window of the look's own length (100 days
   for look 1; 182 days for look 2 or one later look); the larger of the
   episode flips and the day flips; 100,000 draws.
   - HOLDS: max(2.81, 99.75th) at each of two looks; max(2.58, 99.5th) for
     one look.
   - LIKELY: max(2.24, 98.75th) at each of two looks; max(1.96, 97.5th) for
     one look.
3. **Q3, DOES NOT HOLD keeps HOLDS's z.** A real +50 effect is called DOES
   NOT HOLD at most 0.25–0.5% of the time, not 2.5%.
4. **Q4, LIKELY counts as NOT SETTLED for F14.** After a LIKELY at look 1,
   look 2 still runs. LIKELY is printed by name at each look, and at the last
   look it stands as the exam's reading. This is how "it decides nothing
   HOLDS decides" works in time (the owner, 2026-11-19).
5. **Q5, WITHHELD** stays as plan 3.3 defines it (D37) for now. The
   projection runs early, and its options come with numbers before the
   reviews. Cutting the no-book days from the deciding days (option B,
   fixed from metadata only) or keeping them is the owner's call at the
   talk.
6. **Q6, FRESH's `asset_ctxs` days** that fail WAVE-H's 1% rule, or carry
   another header, are read as absent and listed, never a stop. This is
   F7's pre-stated fallback; nothing that decides needs `asset_ctxs`.
7. **Q7 (a), G5 on FRESH:** any unpaired record beyond the straddles and
   FRESH's two edges stops step 1, with every record listed. It goes by H0's
   route: a `polish/fresh-unpaired.json` data file (empty at the freeze), a
   re-freeze of that file, then step 1 again. There is no waiver in code
   (decisions 2026-11-18).
8. **Q8, BASE on FRESH** comes from the deciding days' minutes, both
   segments pooled by 4-hour block (plan 3.3).
9. **T1–T9 as recommended.**
   - T3 reads FRESH's `manifest.jsonl` for names, bytes and SHA-256s only,
     never a data file.
   - T4's reproduction runs detached, at idle priority, outside 02:30–06:00Z
     and 10:25–11:15Z, on the supervisor's word at the time.

**Why a fresh worker:** the planner's context reached 592k (61%) with the
plan alone, and the build is several sessions. A fresh POLISH-RULES builds
from THE PLAN, as WAVE-H-BUILD's successor did (WORKFLOW, "Size").

2026-11-19 (the owner — two stricter crash cuts beside the exam):
**THE EXAM PRINTS N AT TWO STRICTER CUTS OF W4, AT LEAST 715 AND AT LEAST
1,391 ACCOUNTS, BESIDE ITS VERDICT. THEY DECIDE NOTHING. N KEEPS
DECIDING.**

The owner, about 21:55Z: "ok, that can be good recommendation, i agree",
on the supervisor's recommendation.

**Where the idea came from:**
- **The owner asked** whether a harder filter for crashes could give fewer
  trades at more bps.
- **The supervisor printed B0 on E only** at W4's E quantiles (the
  different accounts liquidated venue-wide on σ in the hour). C and FRESH
  were never read. Outputs: `verify/CRASH-PRINT/crash-print.out` and
  `crash-days.out` in the supervisor folder.
- **This print is seeded:** it was made after the review showed where N's
  gain sits. So it is no evidence; it only shapes this print.

**The print (E, priced positions, a one-way error by day):**

| W4 at least | Quantile | Positions | Days | Mean | SE |
|---|---|---|---|---|---|
| 336 | p50, N | 65,533 | 99 | +94.7 | 54.0 |
| 715 | p75 | 31,860 | 54 | +173.6 | 67.3 |
| 1,391 | p90 | 12,924 | 18 | +258.2 | 92.3 |
| 2,164 | p95 | 6,487 | 8 | +526.8 | 201.0 |
| 4,612 | p98 | 2,776 | 3 | +1,957.8 | 416.4 |

- **The p98 row is one day:** 2025-10-10 has 2,300 positions at +2,350.7.
  The other two days are 2025-09-22 (130 positions, +297.7) and 2025-11-03
  (346 positions, −30.2).
- **The counts are pooled over 147 slices:** about 19 positions a slice at
  p98, 446 at N.

**What:**
1. **The two prints** are N with W4's cut at 715 and at 1,391, the 75th and
   90th percentiles of W4's feature over B0's 148,154 entries on E.
   - They are printed on the deciding line (K = 20, the deciding days)
     beside the verdict, and on all 147 slices.
   - Each shows m ± SE, days, coins and the two best days' share, with the
     label "seeded, decides nothing".
   - They are frozen in `polish/rules.md` with everything else, before
     FRESH opens.
2. **N alone decides** the exam's verdict, at the bars already fixed.
3. **If one cut is clearly stronger on FRESH,** it becomes a new candidate.
   It gets its own rules and test on months after FRESH, planned then.
4. **Making the 715 cut the deciding rule instead of N** stays one of the
   options at the owner's talk before the freeze, with its numbers.

**Why:**
- **One rule decides,** so the 99% bar keeps its meaning. Printing the
  stricter cuts costs nothing and shows them on clean data.
- **The cut was chosen after looking,** and C is spent on N, so no fair
  check exists for it before FRESH.
- **The exam needs at least 20 days.** The 1,391 cut had 18 days in E's 211,
  which scales to about 9 on FRESH's ~100 clean days (TOO FEW). The 715 cut
  scales to about 26.

2026-11-19 (the owner — the exam's slices, before its rules are frozen):
**THE EXAM'S DECIDING LINE POOLS K = 20 SLICES (0–19), NOT 10.**

The owner, about 21:48Z: "ok man! you know the best, let's go with 20 if
you think that will be more reliable", on the supervisor's recommendation
(decisions 2026-11-19, the exploration's Final review verified, Q1).

**What:**
1. **The line:** N on slices 0–19 pooled, on the deciding days. All 147 are
   still printed beside.
2. **z and LIKELY's z** come from the placebo gate run on K = 20, by the
   same rule as before: max(the textbook value, the placebo's percentile).
3. **The books** cover slices 0–19's legs: about 2.8 GB against K = 10's
   2.1 GB (the review's estimate). The exact footprint comes from the
   exam's step 1.

**Why:**
- **F19's count picked K = 10 on slices 0–9's own error,** but those slices
  sit on the lucky side of their own blocks:
  - a typical block of ten is ×1.051 of all 147 slices' error, outside
    F19's 3%;
  - blocks of twenty are ×1.027, inside it.
- **So K = 20 is what F19's count gives** when it is measured on a typical
  block, which is how the exam's error will behave on new months. The line
  also gets slightly more precise (beside.json's K table: SE 48.3 against
  50.0).
- **It is chosen from E and C's counts alone,** before FRESH is opened, so
  it reads nothing of an outcome.

2026-11-19 (the supervisor — the exploration's Final review verified):
**THE CHOICE STANDS. POLISH-EXPLORE-REVIEW REBUILT EVERY NUMBER THAT
DECIDES WITH ITS OWN CODE, AND ALL ARE EQUAL. ITS FINDINGS GO TO
POLISH-RULES AND TO THE OWNER'S TALK BEFORE THE FREEZE.**

**What:**
- **The review** is `docs/reviews/polish-explore-review-2026-11-19.md`
  (`fbf8d5c`, `e135f0d`, `4f2f2d4`; Sonnet 5.5, max; context peak 540k).
  Its verdict: "the choice stands".
- **What it recomputed, from the trusted store's columns,** with code that
  imports nothing of `src/polish/tries/`. It first proved its code on the
  look's EVERY SLICE line (176,986 positions, +66.133 ± 31.310, difference
  5e-13). Then:
  - B0 on E, W4's D-test, the floors and the gain floor;
  - N on E and on C, and B0 on C;
  - all 35 tries and the X2 print;
  - the report's tables 3.1–3.3 (490 numbers, 0 mismatches);
  - the calibration b, the K table, the footprint, the projection at
    K = 147.

  The largest difference is 3.1e-12. Every count is equal.
- **The one difference:** B0's event level on E is −14.146 against the
  report's −14.208. It is a tie-break order (finding 8) and decides nothing.
- **The cuts came before any outcome.** `853c864` was committed at
  17:36:44Z, before E's run 1 started at 17:36:52Z (it crashed and wrote
  nothing). `eccafa0` was committed at 19:08:25Z, before run 2 at 19:08:32Z.

**The supervisor's verification:**
- **Only its report was committed:** three commits, one file.
- **Access was clean.** Outside its own folder it read only the folders its
  brief allowed (POLISH-EXPLORE, POLISH-EXPLORE-2, WAVE-H-LOOK-REVIEW). It
  never touched FRESH, the live data, `dist/polish.js` or the network.
- **The concentration lines, rebuilt on my own path from the exploration's
  positions files.** The output is
  `workers/POLISH-EXPLORE-REVIEW/supervisor-verify/conc-check.out`. All
  equal:
  - **N on E:** 74,104 positions, 65,533 priced, +94.686. The two best
    days (2025-11-04 and 10-11) make 55.7% of the gain. Without the five
    best days, the mean is +16.4.
  - **N on C:** +211.263. The two best days (2026-02-06 and 02-05) make
    74.8%. Without the five best days, −23.4.
  - **Depth short at the tape:** 21.9% on E and 38.1% on C.

**What it concludes, for the exam:**
1. **z stays 2.81 at K = 10.** The placebo's 99.75th percentile is
   2.36–2.40 with episode flips and 2.58–2.63 with day flips. The window
   error at K = 10 is 78.0 at 100 days and 66.6 at 182.
2. **P(HOLDS)** from C minus one error (F13) is 4.8% at look 1 and 7.0% at
   look 2 on slices 0–9's errors. On a typical block of ten slices it is
   about 3.4% / 5.9%.
3. **N's gain rests on a few market-wide cascade days:**
   - the event level is −3.6 (E) and +67.4 (C);
   - the effective days are 36.7 of 99 and 16.6 of 50;
   - OWN is +10.0 and +7.5, so 92% and 97% of the gross is the other
     small coins' own move over the hold.
4. **Depth-short legs at the tape** carry 58% (E) and 46% (C) of N's gain.
   N without a short leg is +50.9 (E) and +185.1 (C).
5. **At the book, $1,000 was never short.** N's walks: $10,000 costs +31.4
   bps on E and +5.5 on C.
6. **`missing` is 0 everywhere.**

**Where its questions go:**
- **To POLISH-RULES, as the supervisor's technical calls:**
  - z 2.81 with both flips' percentiles printed (Q2);
  - printed beside the verdict, deciding nothing (Q3, Q6): OWN, the
    top-two days' share, the event-level mean, and the mean by price
    source and by depth short;
  - LIKELY's z = max(normal, placebo), as HOLDS's (Q5): 1.96 for one look,
    2.24 at each of two;
  - the projection of N's WITHHELD share before the freeze (the
    supervisor's own item: N's tape legs are often depth short, and the
    no-book days fall to the tape).
- **To the owner:**
  - **Q1, K = 10 or K = 20.** F19's count picked 10 on slices 0–9's own
    error, but a typical block of ten is 5.1% above all 147's (outside
    F19's 3%), while blocks of twenty are within 2.7%. K = 20 costs about
    2.8 GB of books against 2.1. The supervisor recommends 20; the owner's
    yes is asked now.
  - **Q4, whether HOLDS should need a market-adjusted excess,** at the talk
    before the freeze. The review recommends no change.
  - **The recipe and the looks,** already open.

2026-11-19 (the owner — the exam's bar, before its rules are written): **HOLDS
STAYS AT 99%; THE EXAM ALSO PRINTS A NAMED 95% READING, "LIKELY". THE REST
IS DECIDED AT THE OWNER'S TALK BEFORE THE FREEZE.**

The owner, about 21:05Z: "ok, agree, we can add LIKELY also, that is good
idea", on the supervisor's recommendation.

**What:**
1. **HOLDS keeps the strict bar:** z = max(2.81, the placebo's 99.75th
   percentile) with two looks, as F1 and decisions 2026-11-17 set it. The
   placebo is to be recomputed on the exam's K = 10 slices by
   POLISH-EXPLORE-REVIEW.
2. **"LIKELY" is a named reading.** It is printed when HOLDS is not
   reached but the same test passes at a 95% bar, in the exam's order:
   - WITHHELD and TOO FEW first;
   - then DOES NOT HOLD;
   - then HOLDS;
   - then LIKELY;
   - otherwise NOT SETTLED.

   Its z is set by the exam's rules, for one or two looks, before the
   freeze. **It decides nothing that HOLDS decides,** and it is never read
   as a HOLDS. It says "very probably real, not yet proven".
3. **Why:**
   - HOLDS is the verdict money may follow, so it stays strict.
   - N's gain rests on a few big cascades, so a lucky stretch is likelier
     than the textbook bar assumes.
   - A strong but unproven result should still be visible, named in
     advance.
4. **Still open, for the owner's talk before the freeze** (POLISH-RULES
   writes them as marked options):
   - the recipe's approval or an override;
   - two looks, or one later look.

**Where it came from:**
- The 99% bar came inside WAVE-H's rules (H11, z 2.58, two-sided 1%),
  which the owner approved with WAVE-H's plan on 2026-11-14.
- The polishing kept it (decisions 2026-11-17).
- The owner's +50 bps line is from 2026-11-13 (MARKET-1's plan).
- MARKET-1's forward test spends 5% over its three looks.

2026-11-19 (the supervisor — the exploration's five steps ran): **THE
NOMINEE IS B0 + W4 (VENUE-WIDE WAVES). IT PASSED THE CHECK MONTHS AND
GOES TO FRESH, SUBJECT TO THE REPORT, ITS INDEPENDENT REVIEW AND THE
OWNER'S RULING.**

All from main's build `dde2bf1` + the cuts `eccafa0` (code `8ce269e3…`),
on the trusted store (manifest `19b72688…`, gates `8aef300d…`).

**The steps:**
- **features:** rerun, exit 0. The nine cuts are equal to `853c864`'s.
- **e:** exit 0 at 19:12:34Z (e.json `82cb2a76…`).
  - **The reproduction:** equal (176,986, difference 0).
  - **The calibration:** tape − book +3.76 ± 2.65 on 675 positions, so no
    re-base.
  - **B0 on E:** +33.7 ± 39.7 (135,145 priced, 211 days, 34 coins).
  - **W4** (at least 336 accounts liquidated venue-wide on σ in the hour):
    t 3.03, +94.7 ± 54.3.
  - **X1** t 2.81 but refused by the mean floor (+49.5 < +50).
  - W1 t 2.53, the same family. H12 t 2.09.
  - S1, the delays and the crash filters were below B0.
- **choice:** exit 0. Adopted W4 alone; N = B0 + W4, which on E is
  65,533 priced, +94.7, z 1.75, 99 days, 33 coins.
- **c:** exit 0.
  - **N on C:** +211.3 ± 122.1 (16,754 priced, 50 days, 35 coins); D 154.7,
    SE_D 69.8, **t 2.22 ≥ 1.0, every floor met**.
  - **B0 on C (a print):** +41.4 ± 48.4.
  - **goes: N.**
- **beside:** exit 0 at 20:27:07Z (beside.json `daa41f88…`).
  - **Months:** 6 of 7 on E positive (July −14), 5 of 5 on C positive.
  - **Sides:** almost all forced sells (65,133 of 65,533 on E).
  - **The worst day:** 2025-10-10.
  - **The signal meter:** "more than luck alone" (mean t² 2.78).
  - **W4 is unseeded:** a useless unseeded change reaches FRESH at most
    1.8% of the time.
  - **K = 10.** The book footprint is 2.1 GB for FRESH.
  - **The placebo:** the rule's 99.75th percentile 2.57, so **the exam's z
    is 2.81**. The rule's median window error on 100 days is 88 bps (B0's
    58).
  - **The projection** (C minus one error, F13): m 89.1, **P(HOLDS) 3.6% at
    look 1, 6.5% at look 2**; pooled E+C m 67.7 (2.1% / 3.4%).
  - **The walks** (slice 0 on E): $1,000 costs about 5.0 bps, $10,000
    about 17.8, $50,000 about 46.6.
  - **calibrationOnC:** +1.14 ± 0.81.
  - The run took 1,609 s (books 1,325 s); peak 5.6 GB.

**The honest power picture, for the owner's ruling:**
- The bar at look 1 is about 2.81 × the window error: about +250 bps on
  100 clean days.
- On the plan's conservative projection, HOLDS at look 1 is unlikely
  (about 4%).
- If the check months' +211 were the true edge, it would be about one in
  three. That is the supervisor's rough arithmetic on beside's error, not
  a plan output.
- Look 2's longer window raises both.

**Next:** POLISH-EXPLORE-REPORT (started 20:30Z), then
POLISH-EXPLORE-REVIEW, then the owner's ruling.

2026-11-19 (EXPLORE-FIX-1 — ruling 1 below, built): **THE POSITIONS FILES
ARE WRITTEN AND READ AS STREAMS (`src/polish/tries/gzlines.ts`): NO STRING
OR BUFFER HOLDS A WHOLE FILE. EACH LINE, AND THE GZIP BYTES, ARE WHAT THE
ONE-STRING WRITER WOULD HAVE WRITTEN.**
- **The writer** (e, choice and c): the lines joined into chunks of 2^20
  characters, each ending at a line's end; one gzip stream into
  `<file>.tmp`, flushed, then renamed with `writeWhole`'s tries (10, 1 s
  apart). Each step awaits it before writing its JSON.
- **The reader** (beside): the file read 64 KiB and gunzipped 16 KiB at a
  time into a Writable that splits at "\n" (a line or a UTF-8 character
  cut between chunks joined, the empty lines left out), each line through
  `Line.parse`, in order. A missing file is still not ready (exit 5); a
  file cut short, or a refused line, rejects with its own error.
- **The largest piece held:** a chunk, under 2^20 characters plus one
  line. On a synthetic 3.0 GB set (5.26 million lines) the built module
  wrote in 18 s and read in 6 s, peak RSS 756 MB, 499 MB of it the lines.
- **Why the reader ends in a Writable:** when an async function ends a
  `pipeline` and throws, its `for await` destroys the source first, and
  the pipeline rejects with an AbortError, losing the line's own error
  (Node 24.13).
- **The other places in `src/polish/`:** none reads or writes millions of
  lines as one string (`bookNets` and G3 read the look's 1,589 lines; the
  steps' JSON files are summaries; the store's `files.jsonl`, its names
  and a day's context CSV are bounded). None changed.
- **Tests:** `polish-tries-gzlines` (new; among them a set past V8's
  longest string, written and read back, where the old join throws
  "Invalid string length"); polish-gates (c's positions file there at its
  step's end; beside refusing a missing positions file and a line that is
  not a `Line`). 35 breaks: 34 killed by assertions; the flush survives (an
  fsync shows only after a power cut).
- **`dist/polish*`:** 37 files, `8ce269e3…0345`, so `features` reruns
  (ruling 2). `cuts.json`, the extraction and the gates are unchanged.

2026-11-19 (the supervisor — the E step stopped while writing; no outcome
seen): **THE POSITIONS FILE IS WRITTEN AS A STREAM (EXPLORE-FIX-1). THEN
THE FEATURES STEP RERUNS, CUTS.JSON'S FEATURES HASH IS UPDATED WITH ITS
NINE VALUES UNCHANGED, AND THE STEPS GO ON.**

**What happened:** `explore --step e` ran from 17:36:52Z (code
`9272a8c1…`).
- Its phases: data 37 s, the reproduction of the look's EVERY SLICE line
  9 s (it passed: a difference stops the step with exit 6), features 66
  s, the sweep 94 s, the tries 6 s. Peak 3.66 GB.
- **Then, at 17:40:28Z, writing the positions file:** "RangeError: Invalid
  string length at Array.join (writePositions)", exit 1.
- Every position of every try was joined into one string: millions of
  lines, past V8's largest string.
- **Nothing was written:** no `e.json`, no `e-positions.jsonl.gz`. The
  log holds only phase lines (times and memory).

**No outcome of any try has been seen by anyone:** the supervisor read
the log's lines from the step's start, and they hold no number of a
try's result.

**The rulings:**
1. **EXPLORE-FIX-1** (a small fresh build) makes `writePositions` stream
   its lines through gzip, in the same line format, for e, choice and c
   alike. One commit with its tests, `pnpm verify` and the freezes.
2. **The code's fingerprint changes,** so the steps refuse
   `features.json` written by `9272a8c1…`.
   - The features step reruns (about 4 minutes).
   - Its nine cut values come from the features alone, so they must come
     out identical. The supervisor checks that value by value against
     `853c864`'s cuts.json.
   - cuts.json is then committed again with the new `features` SHA-256
     and the same nine values, still before any outcome.
   - If any value differed, the run stops for a ruling.
3. **The store and its gates stand:** the steps hold `gates.json`'s code
   (`9272a8c1…`) equal to the manifest's, and the exploration's code was
   always meant to run after the store was built (decisions 2026-11-18).

2026-11-19 (the supervisor — the analyzer's store of WAVE-H's 10 months
is trusted): **EVERY GATE PASSED. THE EXPLORATION RUNS.**

**The run** (main's build `992a44f`, fingerprint `9272a8c1…`, heap
20,672 MB; detached at idle priority from the supervisor's
`verify/POLISH-RUN/`):
- **`extract`:** 15:20:09 → 16:32:54Z, exit 0.
  - Pass 3,106 s, contexts 146 s, funding 6 s, merge 1,112 s.
  - 1,521 partitions.
  - The same 4 shared tids as the first run; 0 same-user pairs; 0
    duplicates.
- **`gates`:** 16:35:38 → 17:18:01Z, exit 0, "every gate passed" (2,548
  s).
  - **G0:** 14,563 files, 21,251,178,093 B; counters 0; the store's code
    equals the gates'.
  - **G1:** 2,421,070 counted fills; no day differing.
  - **G2:** 1,299 positions; everySlice 176,986; the positions' SHA-256
    `a5506b86…85e5`, the look's.
  - **G3:** 1,589 lines, 1,289 priced, largest difference 0 bps.
  - **G4:** 33,514 instants, 0 unmarked.
  - **G5:** 0 straddled, 0 edge, `known` the three listed records, 0
    problems.
  - **G6:** the 15 sample days.
- **`explore`'s frame:** exit 0 at 17:21Z. Store manifest SHA-256
  `19b72688…3c92`; 697,852 users; tape rows 448,389,336 in = out.
- **`gates.json`** SHA-256 `8aef300d…b968`, copied to
  `verify/POLISH-RUN/gates-run2.json`.

**Next:**
1. The five steps from the same build: features, the cuts commit, e,
   choice, c and beside.
2. Then POLISH-EXPLORE-REPORT and POLISH-EXPLORE-REVIEW.
3. After the review closes, the folders `ANALYZER\WAVE-H-stopped-1\` and
   `WAVE-H-gates-failed-1\` are deleted, the timing stores too, and the
   worktree of `598abd8` is removed.

2026-11-19 (EXTRACT-FIX-4 — the supervisor's ruling below, built): **G5
PASSES ONLY WHEN THE RECORDS LEFT UNPAIRED AFTER THE STRADDLES AND THE
EDGES ARE EXACTLY THOSE `apps/poller/polish/known-unpaired.json` LISTS,
EACH ON ITS SIDE; `runGates` READS THE LIST BEFORE G0.**
- **The list:** the ruling's three, each its file key, coin, `tid` as
  digits, the side present and `ruled: "2026-11-19"`; Zod-parsed
  (`KnownUnpaired`: a failure throws; one file, coin and `tid` listed
  twice is refused); its path `KNOWN_UNPAIRED_FILE` (`gates.ts`), pinned
  by a test and passed by name in `main.ts`, as `CUTS_FILE`.
- **The comparison** (`g5(o, lib, known)`): each listed record is the line
  G5 prints for an unpaired one. A record left after the straddles and the
  edges whose line is listed is `known`; any other fails, as before; a
  listed line not found fails too ("…: listed as 1 maker unpaired, not
  found"). So a listed record that pairs, is missing, lies at an edge, or
  is found on the other side, in another file or as two records fails G5.
- **Read before G0,** beside `step1.json`: a list that does not parse
  stops the run at once (exit 1, as for any of our files), not after
  G0–G4's 16 minutes.
- **Tests and breaks:** polish-gates (the world with the three unpaired as
  the 10 months hold them passes, and each case above fails, named;
  `runGates` on the committed list fails G5 alone; a bad list is refused
  before any gate). 37 breaks, all killed by assertions (the supervisor
  folder's `workers\EXTRACT-FIX-4\breaks\`); `main.ts`'s line is reached
  only by the built program on a real store, where a wrong path stops the
  run before G0 or fails G5.
- **Not done:** the list's SHA-256 among `gates.json`'s references
  (`known` prints the records accepted); EXTRACT-FIX-4's report asks.

2026-11-19 (the supervisor — the gates on the 10 months: six pass exactly,
G5 lists three one-sided trades; the supervisor's ruling on the list, as
decided before the run ("the supervisor rules on the list; never a waiver
in code")): **THE THREE ARE ARCHIVE DEFECTS. G5 ACCEPTS EXACTLY THESE
THREE, NAMED IN A COMMITTED LIST, AND NOTHING ELSE. THE RUN REPEATS FROM
THE FIXED BUILD.**

**The run** (main's build `c16b01a`, fingerprint `dc1e54b1…`):
- **`extract`** ended with exit 0 at 13:19:47Z.
  - It took 3,102 s for the pass, 142 for the contexts, 5 for funding and
    1,098 for the merge.
  - 1,521 partitions; the merge's peak was 4.36 GB.
  - It found 4 shared tids (HYPE 2025-06, SUI 2025-07, HYPE 2025-10,
    BTC 2025-11), 0 same-user pairs and 0 duplicates.
- **`gates`** ended with exit 6 at 14:06:47Z.
  - **G0 passed:** 14,563 files, 21.25 GB, counters 0, the code equal.
  - **G1 passed:** 2,421,070 counted fills, no day differing.
  - **G2 passed:** 1,299 positions, everySlice 176,986, the positions'
    SHA-256 `a5506b86…` as the look's.
  - **G3 passed:** 1,289 priced, largest difference 0 bps.
  - **G4 passed:** 33,514 instants.
  - **G6 passed:** 15 days.
  - **G5 failed:** 3 records unpaired, 0 straddles, 0 edges.

**The three, read in the raw files by the supervisor** (`sup\find-tid.mjs`
over every file of their month: June 720, July 745; read only):

| File | Coin | `tid` | Record | Its other side |
|---|---|---|---|---|
| `node_fills/hourly/20250601/11.lz4` | ETH | 6896551551965 | taker B 0.035 @ 2,496.2, `hash` all zeros | in no file of 2025-06 |
| `node_fills/hourly/20250608/9.lz4` | VVV | 250170946875997 | maker B 6.66 @ 2.784 | in no file of 2025-06 |
| `node_fills/hourly/20250712/8.lz4` | PUMP | 12410765120022 | taker B 90,389 @ 0.005549 | in no file of 2025-07 |

All three are one-sided in Hyperliquid's own archive. The ETH record's
zero hash marks a fill outside the normal two-sided matching. WAVE-H read
the same records: G1's counts are equal. They are a negligible part of the
tape: one VVV trade missing from it, and two takers whose makers are
missing.

**The ruling:**
- **G5 reads a committed list** (`apps/poller/polish/known-unpaired.json`:
  file, coin, `tid`, side, and this entry's date).
- **It passes only when the unpaired records equal the list exactly:**
  every listed record is found unpaired, and nothing else is.
- gates.json prints them as `known`.

This is a ruling on named records, not a tolerance: any other unpaired
record, or a listed one that pairs, fails G5. EXTRACT-FIX-4 builds it.
The change is to the code, so `extract` and `gates` run again from the
fixed build (about two hours). The failed run's folder is renamed
`ANALYZER\WAVE-H-gates-failed-1\` and deleted after the new gates pass.

2026-11-19 (EXTRACT-FIX-3 — the supervisor's ruling at 11:28Z on the call
left open below): **ONE USER'S TID AT TWO INSTANTS STOPS THE RUN ONLY WHEN
THE TWO RECORDS ARE LESS THAN 60 S APART; 60 S OR MORE APART THEY ARE TWO
TRADES, KEPT AND COUNTED (`counts.tids.sameUserApart`).** WAVE-H's tape
window is [x, x + 60 s) and skips a seen user and `tid`, so two records 60
s or more apart never meet in one window: WAVE-H keeps both. `checkUnique`
holds each record to its user's previous one of the `tid`, against WAVE-H's
own `TAPE_MS`; the month's log line names `sameUserApart` by coin; Q2–Q4
stand as recommended (`refused` a literal 0, G5 by (coin, `tid`), liq by
month). Tests: 60 s apart kept and counted, 59.999 s refused, a third
record 30 s after a second 70 s after the first refused, the two HYPE
trades made one user's (12 days apart) kept. Breaks: 38, the boundary and
the count among them, each killed by an assertion (the supervisor folder's
`workers\EXTRACT-FIX-3\breaks\`). G6's raw re-read still keeps a record
once by user and `tid` a day, so such a pair inside one sample day would
fail G6, loudly.

2026-11-19 (EXTRACT-FIX-3's technical calls — the supervisor's ruling on the
shared trade id, built before the run): **THE MERGE'S TAKER CHECK KEYS ON
(USER, TID), AS WAVE-H KEYS A FILL: TWO USERS' RECORDS OF ONE TID ARE KEPT
AND COUNTED, AND ONE USER'S TID AT TWO INSTANTS STILL STOPS THE RUN, NAMED.
NO OTHER PLACE IN `src/polish/` TAKES A TID ALONE FOR A TRADE.**

**The records** (the supervisor's two, re-read from WAVE-H's raw store,
each file held to `waveh/data.sha256`):
- `node_fills/hourly/20250618/16.lz4`: a HYPE trade at 1750264851943, px
  38.747, sz 0.57, maker `0xe94b…9958`, taker `0xc5ed…4346`;
- `20250630/1.lz4`: another at 1751247542640, px 40.135, sz 28.61, maker
  `0x7632…0798`, taker `0x0284…3f06`.

Both carry `tid` 899064266001530; each trade's two legs share their time
and hash. Hyperliquid's docs give a `tid` as a 50-bit hash of the two
orders' ids, and (block_time, coin, tid) as a trade's unique id
(external-apis, 2026-11-19).

**The change** (`merge.ts` `checkUnique`; the specification WAVE-H's rule,
rules.md H2, its tape skipping a seen user and `tid`):
- A coin's month of kept takers is still sorted by `tid` natively; only
  the `tid`s met twice are then read user by user. Two users' records are
  two trades: both kept, in H8's order.
- One user's `tid` twice, after the duplicate drop, stops the run (exit
  5), naming the coin-month, the user, the `tid`, both instants and how
  many in all.
- The three counts: the duplicates dropped stay `counts.merge`'s; the
  manifest's new `counts.tids` holds the shared records kept, by
  "<coin> <month>", and `refused: 0` (a refusal stops the merge before the
  manifest; a manifest naming one does not parse); each month's log line
  names its `duplicates` and its `shared` by coin.
- **The duplicate drop agrees with WAVE-H's "counts once":** its key
  (time, user, `tid`) is narrower, but with the check after it each (user,
  `tid`) is kept once in a coin's month, the first file's: dropped at one
  instant, refused at two.

**What the other places do with two trades of one `tid`:**
- **liq's check** keys on (user, `tid`) already: the four legs are kept;
  one user's `tid` twice in a month stops the run. Its scope is a month,
  WAVE-H's pass the whole run: a user's `tid` in two months would be kept
  twice, and G1's legs would show it.
- **G5** pairs by (coin, `tid`) in a file, by count: two whole trades of
  one `tid` are two takers and two makers, paired, which is right. Only
  holes or straddles on exactly those trades can mislead it: two halves of
  different trades missing would pass, in one file or as a straddle of two
  files next to each other; two trades of one `tid` both straddling would
  fail it. Pairing by (coin, `tid`, time), Hyperliquid's trade id, would
  close it; not done.
- **G6's sums** (rows, Σ `tid`, Σ px·sz) count both trades on both sides:
  its raw re-read keeps a record once by user and `tid`.
- **`files.jsonl`'s `unpaired`**: per file and (coin, `tid`), takers less
  makers, as G5 reads them.
- **The exploration:** the forced fills sort by (t, asset id, user, `tid`)
  and match the counted fills one for one; the sweep reads a leg's levels
  by coin, side and time, without `tid`; `beside.ts` finds a line's fill by
  (t, asset id, `tid`) only for its B1 episode, which (t, asset id) alone
  decides.
- The check's scope is a coin's month: one user's `tid` at two instants
  less than 60 s apart across a month's end would be kept twice where
  WAVE-H's tape keeps one.

**Tests:** the merge's (two users' trades of one `tid` at two instants and
at one, SOL's and BTC's; the refusal's message and its count; the two HYPE
trades' four records as the archive wrote them, kept, and refused when both
takers are one user; a manifest naming a refusal) and the gates world's (a
second user's SOL trade of `tid` 7 on WAVE-H's entry tape: G0–G6 pass).

**Breaks:** 30, in two scratch copies of `83c038b` with the change laid
over, the unbroken copies passing first (14 and 25 tests): 28 on the
merge's tests (every rule of the check, its call, the counts, the log line
and the schema; and a wrong fix, the drop by `tid` alone), 2 on the gates
world (the old rule; the wrong fix). All 30 killed, 29 by a test's
assertion and the old rule on the gates world by the extract's own stop in
the world's setup; none by a timeout or a syntax error. Lists, harness and
results: the supervisor folder's `workers\EXTRACT-FIX-3\breaks\`.

**Open, the supervisor's call before the run:** whether one user's `tid`
at two instants 60 s or more apart should be kept instead (WAVE-H's tape
keeps both, each in its own window). EXTRACT-FIX-3's report gives the
estimate and its recommendation.

2026-11-19 (the supervisor — the extraction's run stopped on a shared trade
id; under the owner's go "keep working and notify me"): **THE MERGE'S
GUARD KEYS ON (USER, TID), AS WAVE-H KEYS A FILL. EXTRACT-FIX-3 MAKES THE
FIX. THEN THE WHOLE RUN (EXTRACT, GATES, EXPLORE AND THE FIVE STEPS) RUNS
FROM ONE BUILD OF MAIN.**

**What happened:**
- **FRESH's download ended** at 09:03:35Z: 4,614 files, 161,267,704,895 B.
  The supervisor's `fresh-done.cjs` found 4,102 + 170 + 342 files, 0
  missing, 0 size differences, 0 `.part`, 0 extra, reading names and sizes
  only.
- **`extract` ran** from the worktree of `598abd8` (fingerprint
  `88c6efb0…`, heap 20,672 MB), from 09:09:48Z.
  - The pass read all 8,845 files in about 52 minutes, peak about 3.1 GB.
  - The merge wrote 2025-05, then stopped at 10:07:29Z with exit 5: "HYPE
    2025-06: the tid 899064266001530 is in two records".
- **The supervisor read the two records** (WAVE-H's raw store, read only;
  `sup\find-tid.mjs` over June 2025's 720 files):
  - 2025-06-18 16h: px 38.747, sz 0.57, taker `0xc5ed…4346`;
  - 2025-06-30 01h: px 40.135, sz 28.61, taker `0x0284…3f06`.

  The users, hashes, oids and times all differ. **Two different trades
  share one `tid`: Hyperliquid's `tid` is not unique across trades.**

**The rulings (technical calls within the approved plan):**
1. **WAVE-H's own rule is the specification.**
   - `waveh/rules.md`: "A fill found in both formats (the same `user` and
     `tid`) counts once";
   - its tape skips a seen `user|tid`.

   So WAVE-H kept both trades. The store's taker uniqueness check keys on
   (user, `tid`): the same (user, `tid`) twice still stops the run, and
   two users sharing a `tid` are two trades. EXTRACT-FIX-3 also checks
   every other place in `src/polish/` that assumes a unique `tid`.
2. **The guard did its job:** it stopped rather than guess. The fix makes
   it exact, not looser.
3. **One build for the whole run.** The exploration is built and verified,
   and the fix changes the extraction's code anyway. So `extract`, `gates`,
   `explore` and the five steps run from main's build after the fix. No
   code change lands between them, and the fingerprint is one throughout.
   The worktree of `598abd8` is no longer needed; it is removed after the
   run (its two junctions one by one, then `git worktree remove`).
4. **The stopped run's folder** (`ANALYZER\WAVE-H\`: the parts of
   `88c6efb0` and the partial store) is renamed to
   `ANALYZER\WAVE-H-stopped-1\`, not deleted, before the new run. It is
   deleted only after the new run's gates pass. The new run starts with
   an empty `ANALYZER\WAVE-H\`, and its pass is redone (about 52 minutes),
   since the parts name their code.
5. **The check of the fix:**
   - the supervisor reads the diff and runs `pnpm verify` and the freezes;
   - the gates on the 10 months reproduce WAVE-H's counts, positions and
     prices, so they are the independent check of the store;
   - a fresh fix-check would add little to a one-function change that the
     gates test on real data.

2026-11-18 (the exploration built — the technical calls of POLISH-EXPLORE,
POLISH-EXPLORE-2 and POLISH-EXPLORE-3): **THE EXPLORATION IS BUILT, ITS
BREAKS ROUND DONE AND ITS TWO BOOK PRINTS ADDED: `explore --step features |
e | choice | c | beside`, TO RUN FROM MAIN'S BUILD AFTER THE EXTRACTION'S
GATES PASS ON THE 10 MONTHS. NO OUTCOME HAS BEEN COMPUTED ON ANY REAL
DATA.**

**What:** the approved plan (POLISH-EXPLORE's `progress.md`, "THE PLAN",
with the entry below, "POLISH-EXPLORE's plan approved", Q1–Q13), one commit
a step, each with `pnpm verify` green in the same command and the three
freezes verified after (61 `d04d3cd8…`, 64 `b9e17505…`, 74 `864990da…`):
- POLISH-EXPLORE: `c8821c7` (EXTRACT-FIX-CHECK's pins F1–F3, test-only),
  `8eecde2` parts, `21de3bc` prices, `d1f5bd4` stats, `b7f6860` choice,
  `a08b57c` its first breaks' survivors, `e01d81b` the try log
  `apps/poller/polish/tries.md`;
- POLISH-EXPLORE-2: `d339881` forced, `562e25c` trylog and features,
  `cfbf881` the features step, `2b67786` the E step, `ca27ac1` the choice
  step, `72003ab` the C step, `0d4f8fe` the prints beside;
- POLISH-EXPLORE-3: `8c2f479` the breaks round, `5f3f13f` the two book
  prints, and these docs. At `5f3f13f`: 76 + 1 test files, 689 + 5 tests;
  `dist/polish*` 36 files, digest `00c5e4b1…` (main's build; the run's
  worktree keeps the checked `88c6efb0…` for `extract` and `gates`); the
  compiled closure of `dist/polish/main.js` 67 files.

What it is: architecture, "The exploration". The run's commands:
current-task.

**POLISH-EXPLORE's calls:**
1. All exploration code in `src/polish/tries/`, imported by no extraction
   module; `library.ts`, `legs.ts` and `explore.ts` unchanged.
2. The minute price column comes from the minute table's `mark` and the
   bars' `last`, with no kit market object (the kit's `marketFrom` refuses
   a panel past its CUT, 2026-11-07), so the exam can run on FRESH. It
   equals legs.ts `minutePrice` at every minute (a test through the real
   kit; the features step checks every minute of the 38 coins, exit 6).
3. BASE for a part uses the part's own minutes j in [from, to − h), by the
   4-hour block of minute j, as MARKET-1's `baseOf` (equal for 24 h).
4. The D-test's error at k = 0 equals `twoWay`'s to 1e-12 relative, not to
   the bit: the influences are summed per cluster.
5. F2's footprint windows are the consecutive 100-day windows from C's
   first day: 47 for its 146 entry days.
6. The signal meter is the mean of t² over the adoptable tries with a t,
   the sample variance beside (descriptive).
7. `twoWayFast` counts K as the clusters present in its range.
8. In the F1 pins, the trade before a sample day sits in a `node_fills`
   file, so the world's pinned counts do not move.

**POLISH-EXPLORE-2's calls:**
1. Every computation takes one `Data` shape (`data.ts`): the store's or a
   world in memory's. Only `steps.ts` opens the store.
2. B0's M is the look's `step1.json` M (its SHA-256 the one `gates.json`
   names): 147 in the run. W2 is 2M.
3. The EVERY SLICE reference is a constant, `LOOK_EXPECTED` (176,986;
   +66.13311166059404; 31.30967357566865), as gates.ts's `WAVEH_EXPECTED`.
   A line of one cluster has a null SE, compared as null.
4. A failed check throws run.ts's `GateFailed` (exit 6): the forced fills
   against the counted ones, a price column against `minutePrice`, the
   reproduction, the E step's recomputed cuts against `cuts.json`.
5. The reproduction runs first in the E step, before any leg is read (the
   supervisor's ruling 1 to POLISH-EXPLORE-3: as built).
6. `levelsAt` reads H8's tape straight from the coin-month's columns, equal
   to `levelsOf(Tape.at(…))`.
7. Funding through the minute price: the kit's running sums on `pc`, equal
   to the kit's to the bit before a settlement without a mark; the trade's
   price is charged where the mark is missing.
8. Feature pins met in the build: N11's RV with missing returns is the sum
   of the squares of those there are (at least 230), not rescaled; S24 (R2)
   takes S7's unknown rule; N9 averages the fills with a markPx above 0;
   C1–C3 read the 30 days before the month from each source's start, at
   least 7 days, a coin with no value unranked; X2's P(e₁) unknown leaves
   the position out.
9. The dry sweep counts the legs the entries alone fix (B0, D0, D15, D60,
   H1–H12, W2), not X1's exits.
10. The choice step prices N alone on E (its k uses e.json's SE_B0).
11. The C step prices B0 on C first, also when nothing is adopted.
12. Each step refuses a predecessor of another identity, the program's
    fingerprint included: the five run with no code change between them.
13. `beside` reads the steps' positions files rather than pricing again;
    6.1's lines for E are printed there.
14. The calibration's "at the book at both ends" is WAVE-H's own split
    (both legs' source "book", a net), depth-short legs included.
15. The book footprint counts every position's legs, priced or not.
16. The placebo's seed is 20,261,118, 10,000 draws a window length.
17. The two book-based prints were left for the supervisor (ruled built:
    POLISH-EXPLORE-3's 3–5).

**POLISH-EXPLORE-3's calls:**
1. **The breaks round:** 234 one-line breaks of `src/polish/tries/` and
   `main.ts`'s explore branch (POLISH-EXPLORE-2's list, and mine on what
   decides: the features' instants, each cut's comparison, the
   calibration's +10 and one side, the reproduction, the D-test's k, the
   choice's two evaluations, F2's floors, the placebo's z, K by count, each
   step's refusal of a predecessor), in two scratch copies at below-normal
   priority. 156 were killed at once and 78 survived.
   - **4 are equivalent:** forced's `liqUser === NONE` (NONE is no user's
     id, so `liqUser !== user` already refuses it); X1's `end >= xOut` (at
     end = x_out both return x_out); X2's `<= -1,000` (dir·(q − 1)·10⁴ is
     never exactly −1,000 for a double q; checked over 200,000 ulps either
     side; X2 is a print); the reproduction's `xOut >= DATA_END` (every
     TEST entry's x_out is before 2026-05-29T00:02Z).
   - **The other 74 now die** by an assertion written for each: 6 of the
     forced fills, 24 of the features, 3 of the try log, 2 of the tape at a
     leg, 3 of the rules, 18 of the steps' wiring (k from E, the floors of
     each part, W2 at 2M, the gain floor, C's 146 days, the reproduction's
     two counts, the cuts and predecessors held), 19 of the prints beside
     (a new file, `test/polish-tries-beside.test.ts`, for their pure
     functions), 1 of `main.ts`'s options.
   - **One code change:** the committed cuts' path is `steps.ts`
     `CUTS_FILE`, pinned by a test; `main.ts` passes it. A wrong path could
     only fail loudly (exit 5).
   - The lists, the harness and every result: the supervisor folder's
     `workers\POLISH-EXPLORE-3\breaks\`.
2. **The book prints read WAVE-H's raw store in the beside step only**
   (`tries/books.ts`). `books.jsonl` is held to the SHA-256 `gates.json`
   names (else exit 5). Each book file is read through WAVE-H's own code
   (`bookHours`, `lastAtOrBefore`, `bookAt`; `readLz4` through the gate and
   the list's SHA-256) and polish's seal (`checkKey`: nothing dated after
   DATA END), with `pace` before each file and the last two files kept. An
   hour on no line of the list is "not held", counted. `StepInput` gains
   `raw` (WAVEH_STORE) and `gate` (WAVE-H's, open when its freeze
   verifies); the identity is unchanged; `besideStep` is asynchronous.
3. **The tape against the book:** on slice 0's B0 positions of E and of C,
   each entry leg at t + 10 s, 2, 5 and 15 minutes is walked for $1,000 at
   H8's book and at the tape, and the exit at 2 minutes for the tape
   entry's Q. The print is the tape's gain for the follower in bps of the
   book's price (dir·(book − tape) ÷ book at an entry, dir·(tape − book) ÷
   book at the exit: the calibration's sense), with its two-way error, the
   walks depth short, and the legs not compared by reason.
4. **The walks:** each entry book at x_in is walked for $1,000, $10,000
   and $50,000: the cost against the book's mid and the extra over
   $1,000, each with its two-way error, the walks depth short counted.
5. **Both decide nothing.** They come last, as `beside.json`'s `books`.
   24 breaks of them: 23 killed at once; one (the exit's Q) needed a
   two-level exit tape in the test, and now dies.

2026-11-18 (the owner and the supervisor — POLISH-EXPLORE's plan approved):
**THE EXPLORATION'S PLAN IS APPROVED: 35 TRIES, THE CHOICE RULE AS ADOPTED
(AT MOST TWO EVALUATIONS ON C), AND THE OWNER'S YES TO THE TAPE-AGAINST-BOOK
CORRECTION. THE EXTRACTION RUNS FROM A SEPARATE BUILD OF THE CHECKED CODE,
SO THE EXPLORATION'S CODE CAN LAND ON MAIN NOW.**

**What:** POLISH-EXPLORE's plan, in
`E:\coding\Claude\supervisor\polymarket-follow\workers\POLISH-EXPLORE\progress.md`
under "THE PLAN" (11 sections). Written 12:11–13:17Z. No outcome on any
data. Its one commit, `c8821c7`, holds the test-only pins F1–F3 of
EXTRACT-FIX-CHECK; 16 of 16 of the check's survivors are now killed.
- The supervisor's verify: 65 + 1 files, 617 + 5 tests.
- The freezes: 61, 64 and 74.
- `dist/polish*` is unchanged: its digest is still `88c6efb0692e…`, the
  checked fingerprint.
- The access scan is clean: on F:, only the look's `result.json` and
  `report.json` and the one-day store's manifest. Peak context 516k.

**The fingerprint (its answer, accepted): the extraction needs no change.**
- `explore` opens the store through `trustedStore`: the manifest whole,
  `gates.json`'s manifest SHA-256 and G0–G6 passed. Its own steps also hold
  `gates.json`'s code fingerprint equal to the manifest's, and name both.
- Plan 3.7's reproduction extracts into a new root and compares every
  file the manifest lists, by bytes, but for the manifest itself.
- Gates are re-run only from a build of the run's commit.

**The run from a separate build (the supervisor's technical call).**
FRESH's download is slow (the network path to AWS, decisions above), so
the run may wait a day. So that the exploration's code can land on main
meanwhile without touching the code the run uses:
1. The extraction, its gates and its first `explore` run from a detached
   git worktree of the checked commit, built there.
2. Before the run, `dist/polish*`'s digest must equal `88c6efb0692e…` and
   the three freezes must verify in it.
3. Its `node_modules` are junctions to the repository's, removed one by one
   afterwards.

All work still lands on main; the worktree only runs.

**Its questions, ruled:**
1. **The order:** the run uses the separate build, so POLISH-EXPLORE may
   commit its code on main now. The exploration's steps run only after the
   gates pass.
2. **The supervisor runs the five steps** (features, cuts commit, e,
   choice, c, beside), as with the extraction.
3. **At most two evaluations on C, not four.** The review's F5 says "allow
   the fallback to one change (the largest t), not three, to keep the
   count of C evaluations at two". The approval adopted the review's
   changes where they differ from the plan (decisions 2026-11-17). So:
   N first; if it fails, the adopted change with the largest t on E;
   otherwise B0.
4. **The placebo (F1)** runs in the exploration, after the choice, on the
   rule going to FRESH with B0 beside. The exam's z = max(2.81, the rule's
   own 99.75th percentile), for two looks. Yes.
5. **The 50-hour stop before a part's end stays:** fixed before any
   outcome.
6. **C ends with DATA END:** entries to 2026-05-26T23:00Z. Yes.
7. **The seeded marks as marked** (15 seeded: S1, the D and H families, W2,
   R1–R4, X1).
8. **The signal meter's shrinkage stays, labelled descriptive.**
9. **F2's footprint:** every 100-day window of C's entry days with at
   least 20 days and 10 coins. Yes.
10. **The tape-against-book correction (the owner's yes, about 13:28Z: "i
    agree with your recommendation").**
    - **What it is:** on E only, slice 0's positions priced at the book at
      both ends are repriced at the tape, and b is the mean of tape net −
      book net.
    - **The rule:** if b > +10 bps, every net of every try, on E and later
      on C, is re-based to x − b before any statistic, and each output
      says so first. It is one-sided: it only makes the exploration
      stricter. C's own value is printed after the choice.
    - **Why:** the exam prices at the book. WAVE-H showed tape-priced
      positions at +197 and book-priced at +62, though on different
      positions.
11. **Two checks before any try's number:**
    - a count-only sweep;
    - B0 over TEST on marks must equal the look's EVERY SLICE line exactly
      (176,986 positions, +66.133 ± 31.310), or the step stops.

    Yes.
12. **The new pins** (N3 and N11's rolling windows, N11's 80% coverage,
    R4's hourly points, ⌊n/2⌋, N5 over every dex, N10 per coin): as pinned.
    They can change only before run 1.
13. **A rule with more than 10% of its positions left out on C:** a print,
    no new rule. It is shown at the owner's ruling.

**For the exam's build (noted for POLISH-RULES):** the kit's `marketFrom`
refuses a panel ending after its CUT (2026-11-07), and FRESH runs to
2026-11-16. So WAVE-H's `pricePosition`, `marketsFrom` and `minutePrice`
would throw on FRESH's months. The exploration's minute price and funding
avoid the kit's market object for this reason.

2026-11-18 (the supervisor — a correction to the entry below, "EXTRACT-FIX-CHECK
accepted"): **FRESH'S SLOWDOWN SINCE ABOUT 10:00Z IS THE NETWORK PATH TO
AWS, NOT THE PC'S DISK. THE DOWNLOAD IS RESTARTED AND RUNS ON; ITS END
MOVES LATER.**

**The entry below puts the fall from about 1.9 to about 0.15 MB/s down to
the parallel test runs saturating the C:/E: disk.** That load was real
(228% busy, a queue of 2.3), and the rule of at most two parallel runs
stays. **But it was not the main cause.** Measured 11:52–12:04Z, after the
check had ended:
- **The PC was idle:** C:/E: 0.7% busy, F: idle, the CPU 71% idle. The tool
  still received about 0.19 MB/s over its one connection, against its own
  limit of 2 MB/s.
- **Fresh connections to the same public bucket** (`curl`, 5 or 10 MB
  ranges of a file WAVE-H's store already holds, a generic user agent):
  - 0.12, 4.5, 0.13, 1.2, 0.19 and 0.27 MB/s;
  - each through a different AWS address.

  The path to AWS us-east-2 is slow on most endpoints today.
- **The tool restarted cleanly** (the stop file at 11:59:17Z; started again
  at 11:59:21Z, pid 32624). Its plan: 2,312 of 4,102 fill files in the
  store, 1,790 to fetch, 78.68 GB. The new connection ran at about 0.06
  MB/s, so a restart does not help.

**What follows:**
- The download runs on and keeps its own pace and pauses. It speeds up when
  the path recovers: it ran at about 2 MB/s through the evening and night of
  2026-11-17 and until about 09:50Z on 2026-11-18.
- **The end moves from about 23:00Z on 2026-11-18 to later.** At 2 MB/s
  the rest takes about 11 hours, and the pause windows add more.
- The extraction run waits for it, as decided. Nothing is opened early.

2026-11-18 (the supervisor — EXTRACT-FIX-CHECK accepted, under the owner's
go "continue with the plan"): **THE EXTRACTION IS READY TO RUN. IT RUNS ON
THE 10 MONTHS FROM HEAD'S BUILD WITH NO CODE CHANGE, ONCE FRESH'S DOWNLOAD
HAS ENDED.**

**What:**
- **The check:** `docs/reviews/extract-fix-check-2026-11-18.md` (`33cc2ad`;
  Sonnet 5.5; code at `c8c091e`). Verdict "ready to run".
  - Every finding of EXTRACT-REVIEW, and both later rulings, are fixed as
    ruled. L5 is fixed otherwise, by the launcher.
  - No high or medium finding, and no defect in the code.
  - All 67 of the fixers' breaks were killed by a test assertion. Of its
    own 48, 29 were killed; the 19 survivors are missing test pins (F1–F3)
    or equivalent.
  - **The review's two demonstrations now fail a gate:** a refused record on
    an unsampled day fails G0; the six changed columns fail G6.
  - **Its independent parse of 2025-10-10** against the rebuilt one-day
    store found **0 differences**: 20,826,390 records, 4,712,980 tape rows,
    788,904 liq rows, 540,000 bar cells, 600,000 context cells.
  - The fixed code's column files are byte-identical to those the review
    checked. The fixes changed what the checks say, not what the extraction
    writes.
  - The launcher: `heapLimitMB` 20,672. Every spelling of a heap flag exits
    2. The pass workers run at 4,288 MB.
  - `pnpm verify` green; freezes 61/64/74.
- **Checked by the supervisor (11:51Z):**
  - only its report committed; access clean (reads in the allowed folders
    only, 0 FRESH);
  - a read-only G6-day run on the one-day store, outside its brief, ran 55
    s with no result. It stopped it at the supervisor's word and disclosed
    it.
  - Peak context 692k.

**A constraint met during the check:**
- Until 11:40Z, up to six parallel test runs saturated the C:/E: disk (228%
  busy, queue 2.3) while F: and the CPU were idle. FRESH's download, at Idle
  priority on purpose, fell from about 1.9 MB/s to about 0.15 MB/s from
  about 10:00Z.
- From 11:40Z, at most two runs at a time.
- **The rule from now on:** while a download or a long run is going,
  workers run at most two test or break runs at a time.

**Its questions, ruled:**
1. **Run extract, gates and explore from HEAD's build with no code change:
   yes.**
2. **F1–F3:** the missing pins on G6's liq columns, bars and contexts, G5's
   straddle sum, the launcher's crash handler, the seal's "never resolved",
   and `--max-heap-size`. Yes, as one test-only commit before
   POLISH-EXPLORE, **after the run**: test files are outside `dist`, so the
   fingerprint and the store stay valid, and no test load slows the
   download now.
3. **The tape's `side` and `user` in G6 (I1): not now.** It would change the
   fingerprint and redo the pass. The bars, G2 and G3, and the real-day
   parse cover them. It is a known limit, written down here.
4. **If G0 is false on a refused or misread record, or G5 fails:**
   - list every record with its `sum-files.cjs` and `g5-by-hand.cjs`;
   - the supervisor rules on the list;
   - **never a waiver in code.**

   **`G5.edge`:** zero to a handful is expected. More means a look before
   the store is trusted.
5. **After the run, one day G6 does not sample is checked against an
   independent parse:** yes, as a small read-only task, one run at a time,
   at idle priority, outside the windows.

**Next:**
1. FRESH's "done" check: the counts 4,102 + 170 + 342, no `.part` files,
   bytes equal to the manifest, the data never opened.
2. `extract`, about 70 minutes.
3. `gates`, about 40 minutes.
4. `explore`.

They run from `workers\EXTRACT-FIX-2\run\` (`start.ps1 -Cmd`), detached at
idle priority, outside 02:30–06:00Z and 10:25–11:15Z. Then the independent
day, the F1–F3 tests, and POLISH-EXPLORE.

2026-11-18 (TEST-TEMP's technical calls — the supervisor measured about
43,000 folders, about 8.9 GB, left in `%TEMP%` by `apps/poller`'s tests):
**EVERY TEST RUN KEEPS ITS TEMPORARY FOLDERS IN ONE RUN FOLDER, REMOVED AT
ITS END.**

**What:** `551f7bc`, test setup only (no test file and no code under `src/`
changed):
- vitest's `globalSetup`, `apps/poller/test/temp-root.ts`, named in
  `apps/poller/vitest.config.ts`. Its `setup` makes
  `polymarket-follow-tests-XXXXXX` under the real `tmpdir()` and points
  `TEMP`, `TMP` and `TMPDIR` at it, so every test's
  `mkdtempSync(path.join(tmpdir(), …))` lands inside it. Its teardown
  removes it (`rmSync`, recursive, force, 10 retries).
- `setup` first removes `polymarket-follow-tests-*` folders in the real
  `tmpdir()` last changed 6 hours or more ago: the prefix matched exactly,
  real folders only (by `lstat`; a link with that name is left alone). It
  never removes a younger one: another session's run may be live.

**Checked, not assumed:**
- vitest 5.0.5's default pool (forks) builds each worker's environment as
  a copy of `process.env` when it schedules the files, after the root
  `globalSetup` has run; its teardown runs before the pool closes. A test
  holds it: the worker's `tmpdir()` and the three variables are the run's
  folder.
- Node 24.13's `os.tmpdir()` reads `TEMP` (then `TMP`) at each call on
  Windows (a scratch script).
- `rmSync` removes a junction inside a folder as a link, never following
  it. A test holds it: `setup`, a junction inside the run's folder to a
  folder outside it, the teardown; the target's file is intact.

**Tests:** `test/temp-root.test.ts`, 4. Ten breaks in a scratch copy, its
`TEMP` the scratch's own (so no broken sweep could reach the real
`%TEMP%`), all killed by an assertion: the age boundary, the prefix check
dropped or matched anywhere, links swept, no age check, a teardown that
removes nothing, `TMPDIR` not set, a `setup` that sweeps nothing, the clock
in place of the given instant, a removal that follows links.

**The effect, measured:** `pnpm verify` green in the commit's command
(10:34–10:40Z; 65 files + 1 skipped, 614 + 5 tests). Top-level folders in
the real `%TEMP%` with the tests' five prefixes: 2,175 before, 2,175 after
(these are older leftovers, not removed here); `polymarket-follow-tests-*`:
0 before, 0 after. The run's folder peaked at 3,109.5 MiB and 41,785 files
(10:39:55Z), so a test run needs about 3.1 GB free on C: while it runs.

The three freezes verify after each commit: 61 `d04d3cd8…`, 64
`b9e17505…`, 74 `864990da…`.

2026-11-18 (EXTRACT-FIX-2's technical calls — the supervisor's two rulings
on EXTRACT-FIX's questions, built before any gate has run on the 10
months): **THE PROGRAM'S HEAP CEILING IS 20 GB, NAMED IN THE LOG'S FIRST
LINE; G5 ACCEPTS A RECORD LEFT ALONE ONLY IN THE RANGE'S FIRST OR LAST FILE,
EVERY ONE LISTED; THE TWO 2025-07-27 08h FILES ARE NEXT TO EACH OTHER IN THE
RANGE'S ORDER.**

**What:** three commits, each with `pnpm verify` green in the same command
and the three freezes verified after (61, 64, 74; no dependency or lock
change; 610 + 5 tests in 64 files + 1 skipped):
- `bde3794` the heap: the launcher's program worker gets a 20,480 MB old
  generation; the pass workers keep 4,096. The start line, a run's first
  line in the log, names V8's limit: `heapLimitMB` 20,672 on a synthetic
  root. The test holds the log's first line to the start line and the
  ceiling to at least 20,480 and under 20,992.
- `76e8a57` G5's edges: a (coin, `tid`) left open in one file only, as one
  record, in the range's first file (`node_fills/hourly/20250525/14.lz4`)
  or its last (`node_fills_by_block/hourly/20260529/1.lz4`) is a trade
  whose other half lies in the hour outside the range. G5 counts it as
  `edge`, apart from `straddled`, and lists every one in `edges`, with no
  cap, in the problems' form (file, coin, `tid`, taker or maker). Two
  records of one `tid` at an edge fail, and so does a record whose other
  half lies in the range but not in a file next to it. The count is not
  bounded: a fault confined to an edge file would pass as edges, each one
  listed.
- these docs.

**The 2025-07-27 08h adjacency (the ruling's question):** the range's order
is `fillKeys`' (`waveh/keys.ts`: both formats in the hour they share,
`node_fills` first). `node_fills/hourly/20250727/8.lz4` is file 1506 of
8,845 and `node_fills_by_block/hourly/20250727/8.lz4` is 1507: next to each
other. `node_fills_by_block` 09h is 1508. So a trade split between the two
08h files is an ordinary straddle. A trade split from `node_fills` 08h to
`node_fills_by_block` 09h is two files apart and fails G5. The G5 test pins
the keys and both pairings. EXTRACT-BUILD's C3 found every trade of the
40 coins on 2025-07-27 within one file.

**Breaks:** 18 in two scratch copies of `76e8a57` (`git archive`;
`node_modules` real folders of per-package junctions, each junction
removed alone afterwards; tsc and vitest run directly, never pnpm; `dist`
rebuilt for every heap break). The unbroken copies' target tests passed
first. All 18 were killed by a test's assertion, none by a timeout or a
syntax error:
- the heap's 6: the ceiling 16,384 (16,576 is under 20,480) and 24,576
  (24,768 is not under 20,992); the worker's limits dropped (4,288); the
  start line's `heapLimitMB` renamed (the bound's matcher gets undefined); a
  line before the start line; the pass workers' 8,192 (8,384);
- G5's 12: edges never accepted, or only the last file's, or only the
  first's; the second file's accepted; the last but one's accepted; two
  records at an edge; a record whose other half is two files away; the
  edges not listed; their count 0; the last file off by one; a straddle two
  files apart; an edge counted as a straddle.

Lists, harness and results: the supervisor folder's
`workers\EXTRACT-FIX-2\breaks\`.

**Next (the supervisor's order):** TEST-TEMP → EXTRACT-FIX-CHECK (fresh,
Sonnet), now over these two changes too → the run when FRESH's download
ends, with the command files in the supervisor folder's
`workers\EXTRACT-FIX-2\run\` (the commands unchanged; their notes name the
20 GB and G5's `edges`).

2026-11-18 (the supervisor — EXTRACT-FIX verified; its two questions ruled
before any gate has run on the 10 months): **EXTRACT-FIX IS ACCEPTED.
EXTRACT-FIX-2 RAISES THE PROGRAM'S HEAP CEILING TO 20 GB AND FIXES G5'S
RULE AT THE RANGE'S TWO EDGES.**

**EXTRACT-FIX, checked by the supervisor (09:24Z):**
- 18 commits, `2ca3ae4` … `7840f08`.
- `pnpm verify` green: 64 + 1 files, 610 + 5 tests.
- The freezes verify: 61, 64 and 74. `pnpm-lock.yaml` is unchanged.
- Its decisions entry was only prepended.
- The access scan is clean: no FRESH reads; on F:, writes only in
  `ANALYZER\timing-2025-10-10-b\`. It disclosed one listing of the three
  file names in the run folder's `var\`, opening none of them.
- 49 of 49 breaks were killed by a test assertion, among them EXTRACT-REVIEW's 20
  unbacked survivors.
- The rebuilt one-day store: 52 s; peak 2,670 MiB; every scan counter 0;
  nothing unpaired; every row conserved.

**The rulings:**
1. **The program's heap ceiling becomes 20 GB** (its Q1, as it
   recommended; the owner's standing rule on wide margins). G6 alone used
   8.9 GB of heap (10.4 GB working set) on the crash day, so the gates come
   to about 10 GB of 16: a margin under 2×. The pass workers keep 4 GB. This
   is the same ceiling the plan's review set for the exam (F3).
2. **G5 at the range's two edges** (its Q2, narrowed).
   - **An unpaired half is accepted only in the range's first file or its
     last file,** where its partner would lie outside the range. These are
     counted apart from the straddles and listed one by one in `gates.json`.
   - **At the 2025-07-27 08h format switch,** a pair counts only as an
     ordinary straddle between files next to each other in the range's
     order. If those two files are not next to each other, EXTRACT-FIX-2
     stops and asks.
   - **Any other unpaired record fails G5.**

   **Why now:** G0 refuses a store made by other code (M3), so any change
   to the gates after `extract` would mean a new extraction. These rules
   are fixed before any real result exists.

**Next:**
1. EXTRACT-FIX-2.
2. TEST-TEMP: each test run's temporary folders are removed. The owner's C:
   drive lost about 12 GB to the tests' leftovers in `%TEMP%`; the
   supervisor deleted them with the owner's yes on 2026-11-18 at 09:02Z,
   freeing 11.6 GB.
3. EXTRACT-FIX-CHECK (fresh, Sonnet).
4. The run on the 10 months when FRESH's download ends, about 22:00–23:00Z
   on 2026-11-18.

2026-11-18 (EXTRACT-FIX's technical calls — the fix round of
EXTRACT-REVIEW's findings, under the supervisor's rulings of 2026-11-18):
**EVERY FINDING, M1–M4 AND L1–L12, IS FIXED IN ONE ROUND (L4 BY THE RULING
Q5: NO CODE); G5 IS EXACT ACROSS A FILE BOUNDARY; THE RUN'S COMMAND LOSES
ITS HEAP FLAG.**

**What:** 18 commits, each with its tests, `pnpm verify` green in the same
command, the three freezes verified after each (61, 64, 74;
`pnpm-lock.yaml` unchanged, no new dependency):
- the split and the mediums: `2ca3ae4` Q6 the split (a pure move);
  `86ab8ef` M1; `e53d123` M3; `d3de0ef` G5; `940dc51` M2;
- the lows: `a440a63` L2; `819a890` L1; `62f7719` M4's tests; `27e067a`
  L11's; `b1e659d` L3; `b728ca9` L5; `914e39b` L6; `b48db4c` L7; `3e4aebf`
  L8; `ba5099e` L12; `7a9b386` L9;
- ``6e8b8aa`` the tests' cleanup limit; and these docs (L10).

**G5's form (Q4, the supervisor's call, as it asked):** the scan pairs each
of the 40 coins' records by (coin, `tid`) inside its file: +1 a taker, −1 a
maker, a pair met deleted. The `tid` comes from the parse, or for a record
the writers leave from its text (one `"tid":` of plain digits). A record
whose text does not settle it is parsed (the slow path). What stays open
goes into the part's header and `files.jsonl` as `unpaired`, [coin, `tid`,
takers less makers], usually empty. G5 passes an open (coin, `tid`) only as
one taker and one maker in two files next in the range's order (counted as
`straddled`). Everything else fails, every record listed by file, coin and
`tid`, with no tolerance. The old per-file count check goes: a straddled
trade would fail it. On 2025-10-10 every file's `unpaired` is empty.
Where G5 can still fail on a faithful archive, for the owner to rule on,
never waived in code:
- a record of the range's first file (2025-05-25 14h) or last
  (2026-05-29 01h) whose other half lies outside the range;
- at 2025-07-27 08h, the hour both formats hold, a trade split from
  `node_fills` 08h to 09h: no `node_fills` 09h is in the range, and the
  next file in order is `node_fills_by_block` 08h.

**G6's three days (M2, as ruled):** 2025-05-31 (a month's last day; 2025-05
was never sampled), 2025-06-01 (a month's first day, so the pair crosses a
month's end) and 2026-05-29 (the hour before DATA END: 60 minutes); fifteen
in all. Every column of liq, of the 40 coins' bars and of the contexts is
compared cell by cell. The raw side keeps `tid` and `oid` as digits by its
own reviver: WAVE-H's `parseLine` keeps the `tid` alone, and the pass's
`parseText` is not used, so a fault in one is seen by the other.

**G6's memory on the 2.1 GB hour** (2025-10-10: the built `days.js` on the
new one-day store and WAVE-H's raw files, read only, at idle priority while
the breaks ran):
- 331 s;
- the process's peak working set 10,358 MiB (11,266 paged), its JS heap
  8,926 MiB of the 16,576 ceiling;
- 19,127,562 records; 4,712,980 tape rows; 788,904 liq rows on each side;
- 350 differences, every one a context at 23:59 (35 coins × 10 columns):
  a timing store reads no next day's file, as EXTRACT-REVIEW noted. Nothing
  else differs: no tape number, no liq cell, no bar minute, no fallback
  minute.

With the Library G1–G5 keep, the gates' heap is about 10 GB of 16 on the
crash day. The review had guessed 5.

**L2, read as the review's optional fix:** G6 also compares the minute
price's fallback (`Tape.last` over the 5 minutes before each minute's end,
the window cut at the day's start) with the raw side's, every minute of
each sample day for the 38 coins. G4's text is reworded: it shows that no
priced instant needed the fallback.

**L5:** V8's `--max-old-space-size` is process-wide and beats every
worker's `resourceLimits`. Measured: a 4096 worker got 16,576 MB under the
flag, with `execArgv: []` too, and a worker's `execArgv` cannot carry the
flag. So `dist/polish.js` became a launcher: it runs the program
(`polish/main.js`) in a worker of `resourceLimits` 16384, and its pass
workers keep 4096. A heap flag on the command line or in NODE_OPTIONS is
refused (exit 2). Each thread's `heap_size_limit` goes into the pass's
memory and the manifest's peaks; the program's start line names its own.
On the one-day store: the program 16,576 MB, each of the six pass workers
4,288 MB. A 4096 worker and one with no limit both get 4,288 MB on this PC
(V8's default for 31.9 GB), so a break tells them apart only by another
size: 8192 gave 8,384 and was caught.

**L3:** `checkPath` refuses by name, then by the real path of the path's
longest existing part (`realpathSync.native`: junctions and links
followed, short names expanded). A path sealed by its name is never
resolved, so nothing of FRESH is touched. The program seals its settings
before it makes its log's folder (exit 5), and `runGates` seals the raw
store and the look.

**L12:** `extract` deletes every `.tmp` file under `parts\` and `store\`
first (files only, no link followed). `--day` into a root whose
`store\manifest.json` exists is refused (exit 5).

**The others as the review proposed:**
- L1: 1e-9 bps, the largest printed.
- L6: `knownAt` (`legs.ts`), with the two clocks in architecture.
- L7: `takers.delete(coin)`.
- L8: a 30 s limit; no upper bound. Two more hooks get 120 s. WAVE-H's
  rehearse test's "the look's first step" writes a store to DATA END in its
  `beforeAll`, and it overran vitest's 10 s hook default in two full
  verifies, once on a quiet machine: the suite is heavier now (about 6 min
  of wall). Under the breaks' load the gates file's cleanup did too, so
  every polish test file's cleanup gets the limit. That WAVE-H test is in
  no freeze list.
- L9: 17 exports, the time constants and the duplicate `sha256`.
- L10: architecture.
- L4: no code, by Q5. Any change to `dist/polish*` redoes the pass;
  architecture says so.

**Tests and breaks:** the suite went from 584 + 5 tests to 610 + 5, in 64
files + 1 skipped. 49 breaks ran in three scratch copies of `7a9b386`, in the usual setup:
`git archive`; `node_modules` real folders of per-package junctions; tsc
and vitest run directly, never pnpm. A break that the built program must
carry rebuilt `dist` in its copy; a heavy gates test was filtered with `-t`
to the test that must fail.
- EXTRACT-REVIEW's 20 unbacked survivors (G0b–G0g, G2a, G2c, M5, M9, M12,
  S1, P1–P5, T11b, T1, T2), re-aimed where a fix moved their text, and
  S2–S5: all 24 killed by a test's assertion.
- 25 breaks of the new checks: M1's counters and conservation, the resumed
  part's counters, M3's fingerprint and all-gates rule, G5's pairing and its
  straddle rule, G6's liq, contexts, order and fallback, L3's real path and
  the program's and `runGates`' seals, L5's heap flag and both ceilings,
  L12's refusal and walk, L6's accessor, L1's tolerance. All 25 killed by
  their tests' assertions. N4 and N24 also met the gates file's cleanup
  hook timing out under the load; rerun on a quiet machine, both died by
  their assertions alone.

None died by a syntax error or a timeout alone. Every kill's message is in
the supervisor folder's `workers\EXTRACT-FIX\breaks\`.

**The new one-day store** (`extract --day 2025-10-10 --workers 6`, the fixed
code `a97cfea7…`, into `ANALYZER\timing-2025-10-10-b\`, detached at idle
priority, 2026-11-18 08:30:52–08:31:44Z, the collector's audit 90/90 before
it):
- 52 s: the pass 44 s, the merge 7 s; 138 CPU-s;
- the process's peak working set 2,670 MiB;
- EXTRACT-BUILD-2's: 80 s (40 and 40, the merge then flushing every store
  file), about 120 CPU-s, 2,580 MiB. The merge's 33 s less is the fsync
  call; the pass's 4 s and 15% more CPU are the pairing by `tid` and the
  counters;
- the same store: 1,124 files, tape 179.1 MB, liq 75.7 MB (788,904 rows),
  minute 8.9 MB, 85,636 users;
- records 19,127,562; refused, misread, slow and late all 0; every file's
  `unpaired` empty; every row conserved (4,712,980 + 1,693,757 takers,
  788,904 liq, 0 duplicates).

FRESH's download shares F:, so the figures are pessimistic.

**Next:** EXTRACT-FIX-CHECK (fresh, Sonnet) → the run (`extract`, `gates`,
`explore`) when FRESH ends, with the command files in the supervisor
folder's `workers\EXTRACT-FIX\run\` → POLISH-EXPLORE.

2026-11-18 (the supervisor — EXTRACT-REVIEW's findings, under the owner's
night go): **"AFTER THESE FIXES": EVERY FINDING (M1–M4, L1–L12) IS FIXED IN
ONE ROUND BEFORE THE RUN ON THE 10 MONTHS, BY A FRESH FIXER (EXTRACT-FIX);
A FRESH FIX-CHECK FOLLOWS; THEN THE RUN.**

**What:**
- **The review:** `docs/reviews/extract-review-2026-11-18.md` (`1d63d13`;
  Sonnet 5.5; HEAD `e62e9cd`). Verdict: "after these fixes", not a rework.
  - No high findings. Four medium: M1 refused records unseen by any gate;
    M2 columns and days no gate reads; M3 fingerprints printed, not
    compared, and `trustedStore` trusting `passed` alone; M4 refusals
    untested (20 of its 32 refusal breaks survive).
  - Its independent check on real data found **0 differences**. It used
    its own parse (WAVE-H-LOOK-REVIEW's decoder and `JSON.parse` of every
    line) of 2025-10-10's 24 raw files and the hours either side, against
    the one-day timing store:
    - 19,127,562 records;
    - the 38 coins' 4,712,980 tape rows, every field;
    - liq's 788,904 rows, all 18 columns;
    - 600,000 context cells and the 40 coins' 540,000 bar cells;
    - the pairing, 6,406,737 = 6,406,737.
- **Checked by the supervisor (06:10Z):**
  - only its report committed; the tree clean;
  - access clean: its seal probe ran on a synthetic tree in its scratchpad;
    0 FRESH reads;
  - M1 (`gates.ts` never reads `refused` or `misread`), the hard per-file
    G5 and L1's 0.01 tolerance confirmed in the code.
  - Its context peaked at 887k, so the later read of `gates.json` goes to
    the fix-check.

**The rulings (its seven questions, as it recommended):**
1. **One fix round before the run (Q1).** Any change to `dist/polish*`
   makes a new fingerprint and redoes the pass, so the run waits for the
   round.
2. **G6 widened now (Q2):** every column of liq, the bars and the
   contexts. Three more sample days: a month's first day, a month's last
   day, and the hour before DATA END.
3. **The name `polish` stays (Q3).**
4. **G5 is exact, across a file boundary (Q4, the supervisor's technical
   call).** A taker and its maker share one `tid`, so a trade split
   across two adjacent files of one coin pairs across them. Anything left
   unpaired fails the gate. The gate lists every unpaired record by file,
   coin and `tid`. No tolerance, no waiver in code. The fixer picks the
   simplest exact form and records it in its entry.
5. **No second fingerprint for the parts (Q5):** the round comes before
   the run.
6. **`gates.ts` is split before POLISH-EXPLORE (Q6),** as a pure move in
   a commit of its own. The library POLISH-EXPLORE imports gets a file of
   its own.
7. **A fresh fix-check follows (Q7):** EXTRACT-FIX-CHECK, Sonnet. It
   checks that:
   - the 20 unbacked survivors now die;
   - the new gates pass on the synthetic world and on a rebuilt one-day
     store;
   - the review's `indep2.cjs` finds 0 differences again.

**And the lows, as the review proposed:**
- L1: the tolerance is 1e-9 bps, the plan's, with the largest difference
  printed.
- L2: G4's fallback is tested.
- L3: tests for slashes, `..`, UNC and a junction. The seal resolves the
  real path before it refuses. The log folder is created after the seal.
- L5: the workers' 4 GB ceiling really holds: they no longer inherit the
  main process's heap flag.
- L6: the two clocks are written down (contexts as of the minute's end,
  bars over [m, m + 1 min)), with an accessor that cannot look ahead.
- L7: finished coins' accumulators are freed.
- L8: the timing-dependent tests are fixed.
- L9: the unused exports, the repeated constants and the duplicate helpers
  are removed.
- L10: architecture is corrected.
- L11: the `pace()` calls and `bytesOf`'s edges are tested.
- L12: leftover `.tmp` files are cleaned; `--day` into a root that holds a
  store is refused; G6's memory is measured.

**Why:** the store is the base of the 38 tries and of the exam. A gap that
no gate sees would bend every later result in silence. Fixing it now costs
a few hours; FRESH's download ends around midnight 2026-11-18/19 in any
case.

**Next:** EXTRACT-FIX (Opus, max) → EXTRACT-FIX-CHECK (Sonnet, max) → the
run (`extract`, `gates`, `explore`) when FRESH ends → POLISH-EXPLORE.

2026-11-18 (EXTRACT-BUILD's technical calls — the polishing's extraction,
built by EXTRACT-BUILD and its successor EXTRACT-BUILD-2): **THE ANALYZER'S
FIRST PIECE IS BUILT: `dist/polish.js extract`, `gates` AND THE FRAME OF
`explore`. ITS RUN ON THE 10 MONTHS WAITS FOR FRESH'S DOWNLOAD TO END; THE
SUPERVISOR STARTS IT.**

**What:** the extraction of the approved polishing plan (decisions
2026-11-17, "THE POLISHING PLAN APPROVED"; plan section 4, review F3, F9,
F18), on the plan EXTRACT-BUILD wrote and the supervisor approved at
22:33Z (Q1–Q10, all as recommended; its `progress.md`, "THE PLAN"). Eleven
commits, each with its tests, `pnpm verify` green in the same command, the
three freezes verified after each (61, 64, 74; `pnpm-lock.yaml`
unchanged, no new dependency):
- EXTRACT-BUILD: `b40a3a4` the LZ4 decoder; `819b439` the scanner and its
  two writers; `bb4eec7` the part file, the seal and the pool; `d7a4c4d`
  the contexts and funding; `0813a1e` the merge and the store; `1f2b892`
  the program and `extract`;
- EXTRACT-BUILD-2: `9b0fce1` the parts and columns without fsync;
  `5a5588f` the counted fills, the legs, the gates and `gates`; `161f01f`
  the frame of `explore`; `f914b17` the breaks' survivors' tests; and these docs.

What the program is: architecture, "The analyzer".

**Q1, the build's call (G5): the hard completeness gate is the pairing,
not `day_ntl_vlm`.** F9(a) asked for the tape's taker notional within 1% of
`asset_ctxs`' `day_ntl_vlm` on every day. EXTRACT-BUILD's checks
(`workers\EXTRACT-BUILD\check\`, read only, on WAVE-H's store held to its
list) show it cannot pass on real data:
- **2025-08-15** (`c1-vlm-20250815.txt`; 25 files, 696 MB): `day_ntl_vlm`
  is a rolling 24-hour volume counted once a trade (both legs give 2.0
  times it). At the next midnight it equals the day's taker notional within
  0.3% for most of the 40 coins; BNB +0.83%; VVV +30.4% (a thin coin, about
  $42 K a day).
- **2025-10-10** (`c1-vlm-20251010.txt`, `c2-split-20251010.txt`; 1,602 MB):
  the day's taker notional is 0.95 to 1.96 times `day_ntl_vlm` across the
  40 coins (1.138 in all). The backstop's legs alone are up to 54% of a
  coin's takers (ZRO); without them the ratio is 0.90 to 0.997.
- Every trade of the 40 coins has exactly one taker record and one maker
  record in the same file (C3: every file of 2025-06-15 and 2025-07-27, and
  2025-10-10's 6,406,737 of each): an exact check needing no outside
  number. So G5 is the pairing, every file and coin; `day_ntl_vlm`'s ratios
  by coin and day (with the backstop's legs and without) are printed beside
  and decide nothing. G1's records by day and G6's twelve sample days stand
  beside it.

**The other answers as built:** the tape keeps `user` and `tid` (Q2); liq
gains `dir` and `file`, so H1's split is WAVE-H's own rule (Q3); the parts
stay until EXTRACT-REVIEW closes, then the supervisor deletes `parts\`
(Q4); 176,986 entries in all slices is a constant in `gates.ts` citing
decisions 2026-11-17 (Q5); `explore` is a frame (Q6); the minute price is
the kit's mark at the minute's end, else the last non-backstop trade in the
5 minutes before it, else none (Q7); the timing ran during FRESH's download
(Q8); the manifest names the code by its fingerprint, the run's entry names
the commit (Q9); no start script (Q10).

**The one-day timing** (2025-10-10, the heaviest day; `--day 2025-10-10
--workers 6`, detached at idle priority, 16 GB heap, 2026-11-17
23:40:53–23:42:14Z, into `ANALYZER\timing-2025-10-10\`; the collector's
audit 89/90 before it). FRESH's download shares F:, so every figure is
pessimistic.
- The pass: 40 s; 24 files, 1,489.7 MB read, 8,037.7 MB decoded, 19,127,562
  records, 0 failing; 37 MB/s read and 201 MB/s decoded over the wall, the
  21h file (359 MB) alone on one worker for most of it; about 112 CPU-s.
- The parts: 24 files, 322.2 MB. The store: 1,124 files, 265.6 MB (tape
  179.1 MB, liq 75.7 MB with 788,904 rows, minute 8.9 MB); 85,636 users; 0
  duplicates.
- Contexts and funding 0 s (one day, no funding); the merge 40 s (about 8
  CPU-s; the rest 1,124 small files' writes).
- Memory: the process's peak working set 2,580 MiB in the pass with 6
  workers (the OS's own peak); about 0.9 GB in the merge. Far below 20 GB,
  so `--workers 6` stays and the caps stay.
- **The whole run, scaled** (218.3 GB ÷ 1,489.7 MB = ×146.5): by bytes
  alone the pass 98 min and the merge 98 min, but the day's pass waited on
  its one big file and its merge on per-file writes, which scale by months
  (×13), not bytes. By CPU: the pass about 46 min (6 workers; about 80 MB/s
  read and 17 MB/s of parts written, which the disk carries); the parts
  about 47 GB (×146.5; the crash day's liq share is high; the plan said 34
  GB); the contexts about 3 min; the merge about 12 min of CPU, 9–10 min of
  reads and writes. **About 70 min in all, about 6 GB of memory at most.**

**The fsync call** (the supervisor's rule, given 2026-11-17 23:37Z: more
than about 10% or 10 minutes → no fsync for the parts and columns). Measured
on F: with the timing's files written again in four alternating rounds
(scratchpad `fsync.mjs`): the store's 1,124 files took 0.51 and 0.72 s
without fsync, 33.25 and 33.26 s with it (29.0 ms a file more); the 24
parts 0.92 and 0.88 s without, 2.77 and 2.93 s with (81 ms a part more,
their data's own flush included). Scaled: 14,564 store files × 29 ms = 7.0
min in the merge, plus about 2 min in the pass (8,845 parts × 81 ms ÷ 6
workers): **about 9 minutes of about 70, 13%. So the parts and the store's
columns are written whole but not flushed** (`writeUnflushed`, `run.ts`:
the `.tmp`, then renamed, a refused rename tried again as `writeWhole`);
`users.bin`, `names.json`, `files.jsonl` and `manifest.json` keep
`writeWhole`. A torn part fails the merge's payload hash, naming it; a torn
column fails G0.

**EXTRACT-BUILD-2's own calls:**
- **The SIZING coins exactly.** WAVE-H counts a coin as seen in SIZING only
  for a record stamped before TEST's start; a SIZING file's records from
  TEST's start (R5) do not count. The pairs alone took such a coin (the
  test world's XRP). So the scan keeps each of the 40 coins' earliest time
  in each file (`pairs`: takers, makers, first), and G1 takes a coin when a
  SIZING file's first time is before TEST's start.
- **G6 reads an hour either side of a sample day** and the day before's
  `asset_ctxs`: a record of the day held in the hour before's file, or a
  row of the day in the day before's file, would otherwise be missing from
  the independent side only. Its takers are summed in H8's order on both
  sides, so the sums compare exactly.
- **G4 compares instants, not sums:** at x_in, x_out and each settlement's
  minute of every priced position, the minute price must equal WAVE-H's
  mark (the kit's), so the funding and the gross on marks are unchanged by
  construction; a sum compared would differ by rounding alone.
- **G3** holds the seven bps fields of each line to 0.01 bps and every
  other field equal, as the plan said; **G0 runs first**, and the other
  gates only when the store is whole.
- **The tape is read a coin-month at a time, the last two kept:** the legs
  are asked coin by coin in time order, so G3 never holds the whole tape.
- **The test world writes whole fills and both sides of each trade:**
  WAVE-H's test helpers write fills without `closedPnl`, `oid` and `dir`
  (liq refuses them, as real fills always carry them) and takers without
  makers (the pairing fails). The polish test builds its own records.

**Tests and breaks:** the suite went from 566 + 5 tests (EXTRACT-BUILD's
six commits) to 584 + 5, in 64 files + 1 skipped. `polish-gates.test.ts`
runs a WAVE-H world through WAVE-H's own rehearsal and look, then
`extract` and `gates` on the same raw store: every gate passes, each break
fails its own gate, `explore` opens only the trusted store; the tape and
the minute price apart. 70 breaks in a scratch copy of `161f01f` (`git
archive`; `node_modules` real folders of per-package junctions; no pnpm):
47 killed in round one (k4 only by a syntax error, re-aimed), 23 survived
(the scan's and the pass's boundaries, the merge's first file of a
differing duplicate and the liq bars' own reducing leg, the tape's x
exactly at a trade, the minute grid's order, the funding hour, and nine in
the gates); each now has its test, and in a second copy holding them all
23 and the re-aimed k4 are killed. Every kill's message is kept in
`workers\EXTRACT-BUILD-2\breaks\` (the supervisor's folder).

**Next:** EXTRACT-REVIEW (fresh) reviews the code; the supervisor runs
`extract`, `gates` and `explore` once FRESH's download ends (current-task
has the commands); then POLISH-EXPLORE.

2026-11-17 (the owner — THE POLISHING PLAN APPROVED, with its fresh
review's changes): **THE PLAN IS APPROVED WITH THE REVIEW'S CHANGES F1–F19
AND ITS SIX ANSWERS; EXTRACT-BUILD STARTS.**

**What:**
- **The plan:** `docs/reviews/wave-polish-plan-2026-11-17.md` (`cdaf9f5`).
- **Its fresh review:** `docs/reviews/wave-polish-plan-review-2026-11-17.md`
  (`405c515`, `bf2e2e4`, `179aec3`; Sonnet 5.5): "approve after these
  changes". It worked on synthetic data only and opened no store.
- **The owner, about 21:55Z:** "I agree with your recommendation … so let's
  proceed like you've suggested."
- **Where the plan and the review differ, the review's change holds.** No
  review is edited: this entry is the record.

**The review's changes, adopted:**

| Change | Plan section | What |
|---|---|---|
| F1 | 2.2, 3.2, 3.3, 3.5 | A placebo gate before the exam's freeze sets its z, never below 2.58 for one look or 2.81 for two. The side is flipped per episode over at least 1,000 draws, beside the B2 control, on random 100- and 182-day windows. Observed window errors replace the √(300/D) scaling. |
| F2 | 1.4; 2.1 step 4 | The nominee needs, on the check months, a mean net of at least +25, at least 30 days and 15 coins, and an exam footprint that clears TOO FEW. B0 is exempt as the fallback. |
| F3 | 4.4 | Named memory ceilings, under the owner's standing rule: the extraction 16 GB for the main process plus 4 GB a worker, the exploration 16 GB, the exam 20 GB. Peak memory is logged. The merge runs by month, all coins at once. F: is a hard disk, so one day's pass is timed with its writes before the whole run. |
| F4 | | A gain floor D ≥ max(+10 bps, 10% of \|m_B0\|); D5 is dropped. |
| F5 | | The nine families are named: S, D, H, W, R, C, T, X, N. N is tested on the check months only. |
| F6 | | Each try is marked as seeded by the look or not. The 3.7% is stated for the unseeded tries only. |
| F7 | | 2026-07-08 (no day file, no books) and the thin day files are listed at the freeze, with about 2% budgeted toward WITHHELD. |
| F8 | | HOLDS also needs the book-priced positions' mean above 0 (a sign, no band); each segment is printed apart. |
| F9 | | A tape-completeness gate: taker notional per coin and day against `day_ntl_vlm`, and row counts against a full parse of 12 sample days, including 2025-10-10. |
| F10 | | The timing conventions are pinned: the price at τ, "up to t", the monthly ranks, and the decision instant per try. |
| F11 | | BASE's excess is defined for the 1–12 h holds and the X exits. |
| F12 | | The beta months (2026-05-30 → 08-29) stay among the deciding days, printed apart. |
| F13 | | The projection from the check months is made from their estimate minus one error. |
| F14 | | The first look that is not NOT SETTLED decides; it is never combined with MARKET-1's verdicts. |
| F15 | | H48 is cut; X2 is a print only. |
| F16 | | S1 is tagged for Hyperliquid, not "Both". |
| F17 | | An event-level mean (one position per coin-episode) and MARKET-1's OWN line are printed. |
| F18 | | All tries' legs are priced in one sweep of the tape. |
| F19 | | K, the deciding line's number of slices, is chosen by a count (the smallest K within 3% of all 147's error, about 20 on the plan's model) from the exploration's print, and frozen; all 147 are printed beside. |

**The eight answers of the entry below, as now amended:**
- (2) The discovery window is excluded; the beta months stay (F12).
- (3) Two looks; their z comes from the placebo gate, at least 2.81 each
  (F1).
- (4) δ = +50 for every hold, with each exam's net per hour held printed
  beside, deciding nothing.
- (5) K slices by a count, all 147 beside (F19). This replaces "every
  slice, 20 as the fallback".
- The others stand.

**The re-checks:** the reviewer recomputed every line of the planner's
power file, and the 3.7% false pass while B0's true mean is at most about
+60.

**Next:** EXTRACT-BUILD (Opus 5.5, max): the extraction (plan 4.1–4.6,
with F3, F9, F18) and the frame of `explore`. Its plan comes first. Its run
waits for FRESH's download to end. After it: EXTRACT-REVIEW, then
POLISH-EXPLORE (plan section 6).

2026-11-17 (the owner — the polishing plan, on the supervisor's
recommendations, after its fresh review): **THE PLAN'S EIGHT QUESTIONS ARE
ANSWERED AS RECOMMENDED; A FRESH REVIEW READS IT FIRST; NO RUN MAY HIT A
MEMORY LIMIT AGAIN.**

**What:** the owner, at about 20:55Z: "if those are your recommendation,
let's proceed like that … let's try to not have problem with limits again,
so give more GB if needed for all which will come … let's proceed then with
independent review of polishing plan."

**The answers** to the questions of `docs/reviews/wave-polish-plan-2026-11-17.md`
(`cdaf9f5`) are the ones its planner and the supervisor recommend. Each
holds unless the fresh review changes it, and then it comes back to the
owner.
1. The plan is approved after its fresh review.
2. The exam's deciding days exclude MARKET-FIND's discovery window
   (2026-08-31 → 2026-11-07), which is printed apart.
3. Two looks, each at z 2.81: look 1 on FRESH's clean days; look 2 around
   2027-02-08, with a FRESH-2 download.
4. z as WAVE-H's, and the owner's δ = +50 bps a position for every hold.
5. The deciding line pools every slice, with slice 0 printed beside; 20
   slices are the fallback if the book download passes about 60 GB.
6. Features from any venue may enter the rule, each tagged with the
   venues where it can be seen.
7. MARKET-1's second arm comes as one arm after the polishing's freeze,
   with the polished rule. It is no longer about 2026-11-20.
8. The store has no new dependency, under
   `F:\polymarket-follow-research\ANALYZER\`.

**The fresh review:** WAVE-POLISH-PLAN-REVIEW (Sonnet 5.5, fresh), started
20:59Z. It covers the choice rule's arithmetic, leakage, the discovery
window, the exam's error and power, the extraction, the owner's points and
simplicity.

**Memory, a standing rule from the owner:** every long run gets a generous
heap ceiling from its start, sized from what was measured with a wide
margin, never from an estimate on a smaller sample. The PC has 31.9 GB of
RAM. A ceiling costs nothing until it is used, and a run that dies at its
ceiling costs hours.

2026-11-17 (the supervisor — FRESH-FETCH verified; the fresh months'
download started): **THE DOWNLOAD RUNS, STARTED 18:23:01Z; ITS FILES ARE
NEVER OPENED UNTIL A SHARPENED RULE IS FROZEN.**

**Verified on the supervisor's path (18:22Z):**
- FRESH-FETCH's 11 commits (`54f77fb` … `0ec6296`) changed only the tool,
  its tests and the docs;
- all three freezes verify: the paper experiment's 61, MARKET-1's 64 and
  WAVE-H's 74;
- the access scan finds no read of WAVE-H's store data (only its manifest
  and book list) and nothing outside its bounds;
- its context peaked at 501k.

**The plan step** (`--fresh --plan`, 14 listings, 18:22Z) equals its build
report, file for file:

| Part | Files | Bytes |
|---|---|---|
| Fill files, 2026-05-29 02h → 2026-11-15 23h | 4,102 (351 multipart) | 159.88 GB |
| Day files, 2026-05-29 → 2026-11-15 | 170 (2026-07-08 absent) | 1.38 GB |
| Funding reads | 342 | — |
| **In all** | | **161.34 GB**, cap 164.57 GB |

F: has 1,338.7 GiB free.

**The start:** `tools\waveh-fetch-start.ps1 -Fresh` at 18:23:01Z, pid 18836,
Idle. Its first reading had the audit at 88/90 and the clock at 114 ms. It
fetched at 2 MB/s from 18:23:34Z. The supervisor's watch checks it every 10
minutes.

**Code-rules** gained FRESH-FETCH's gotchas: a reset masked by another; a
break equivalent on the real inputs; PowerShell 5.1's NativeCommandError
under `Stop`. It also gained the supervisor's own: `Get-Date -Format u`
prints local time with a `Z`, and single quotes do not expand a variable.

2026-11-17 (FRESH-FETCH's technical calls — the download of the months
after WAVE-H's data, built): **THE DOWNLOAD TOOL TAKES FRESH'S RANGE INTO ITS
OWN STORE, WITH EVERY GUARD OF THE FIRST DOWNLOAD AND THE THREE FIXES THE
NIGHTS SHOWED. THE SUPERVISOR STARTS IT.**

**What:** in six commits, `tools/waveh-fetch.cjs`, `tools/waveh-fetch-start.ps1`
and `apps/poller/test/waveh-fetch.test.ts`: `54f77fb` (a),
`153fead` (b), `263a6bf` (c), `0525e22` the range, `5a28c47` the store guards
and the start script, `89dcca8` the breaks' tests. Architecture, "WAVE-H's
data download"; external-apis, the AWS bucket's newest days.

**The range, ruled by the supervisor (17:19Z, Q1–Q3 and Q6):**
1. **The last day is 2026-11-15, so `FRESH_END` is 2026-11-16T00:00Z.** It is
   the archive's newest settled day: a day's hours 22–23 are written again on
   the second day after it (the listing, external-apis), and 11-16's had not
   been yet.
2. **Hourly fill files from 2026-05-29 02h** (the first after DATA END's own
   hour) **and day files from 2026-05-29.** `asset_ctxs/20260529.csv.lz4` is
   in FRESH's store too, so the store stands alone. The same key is in
   WAVE-H's store, which WAVE-H's program read; any overlap rule is the
   exam's call.
3. **The funding windows start at DATA END** on WAVE-H's 20-day grid, the last
   cut at `FRESH_END`: 9 a coin, 342 reads. They join WAVE-H's last window, so
   no settlement is read twice or missed.
4. **The size**, from the listing (2026-11-17 17:10:45–17:11:16Z, 14 LIST
   requests): 4,102 fill files (159.9 GB) and 170 day files (1.4 GB); planned
   161,343,914,055 B with the funding reads at 256 KiB each, the cap
   164,570,792,337 B. About 27 h at 2 MB/s with the pause windows. F: had
   1,338.8 GiB free.
5. **`--books` with `--fresh`** takes book keys of FRESH's hours, for the
   exam's books.

**The three fixes:**
- **(a) A `--books` run's cap counts its own keys' bytes only** (those in
  `books.jsonl` and those it fetches): `books.jsonl` keeps earlier runs'
  books, and a second run stopped at its cap on 2026-11-17 00:30Z. The main
  download keeps its total cap on the store.
- **(b) At a pause's end, only a reading taken at or after it counts.** Until
  it comes (the next minute's read), no request starts ("a reading after the
  pause"), and the older reading neither pauses again nor clears. The live
  checks still pause at once, and the content read stays once a minute. A
  reading up to a minute old had re-paused the run on 2026-11-15 00:18Z.
- **(c) The step back (Q4):** after 30 minutes of clean seconds, the rate
  doubles, up to the run's full rate (2 MB/s, or a lower `--rate`). The tool
  writes it to `rate.txt` and logs `rate {from, to, cleanSince}`, and a new
  streak starts.
  - A clean second: not paused, the verdict clear on a fresh reading that
    judged both the clock and the price audit, and no content read failed
    since the last good one.
  - Any other second, or a pause, starts the streak again; the pause windows
    do not.
  - A start at a halved `rate.txt` steps back the same way.
  - A bad reading still pauses at once.

**The two guards (Q5):**
- **A store sits in its range's folder:** `<root>\FRESH\store` with
  `--fresh`, `<root>\WAVE-H\store` otherwise, case-insensitive. It is checked
  in `parseArgs`, before anything is written (exit 2). A test runs the tool
  with a wrong store and finds nothing written.
- **One download at a time on the line:** a run refuses (exit 3) while the
  other range's store, beside its own, holds a live lock touched in the last
  3 minutes. It reads that pid file before taking its own lock, so a refused
  run holds no lock. The start script checks both locks as well.

**FRESH-FETCH's calls:**
- **`sizingOnly` became a range** (WAVE-H, its sizing months, FRESH): parts
  listed month by month, the hours and days admitted (`[from, to)`), the
  windows, the title and the store's folder. Every guard reads the range.
  - WAVE-H's two ranges equal the old rules: the 42 earlier tests pass with
    their calls moved to the ranges.
  - `fundingWindows(sizingOnly)` stays as it was: `test/waveh-store.test.ts`
    pins it with `src/waveh/keys.ts`, and that test is untouched.
- One grid function for all windows. WAVE-H's are grid(2025-05-25, seal)
  followed by grid(seal, DATA END), its same 20.
- A `--books` run's plan line names its range's folder.

**A signal for the exam's design (sizes only; nothing in the new store is
opened):** most `asset_ctxs` day files from 2026-09-22 on are 1.1–5.5 MB,
against 10.0–12.0 MB on most earlier days. Three are 10.4–10.7 MB: 10-03,
11-03 and 11-04. Smaller days before that: 05-30, 08-08, 08-09, 08-27,
08-30, 09-15, 09-16 and 09-18. These may be partial days of marks. The
exam's step 1 counts will show any holes.

**Tests:** 55 in `test/waveh-fetch.test.ts`, up from 41, with no network (a
fake bucket and info API, a fake clock). The 41 still pass, their calls
moved to the ranges.
- Each fix's test failed on the tool before it, in a scratch copy: (a) exit 4
  at the cap; (b) a second pause at the pause's end; (c) no step.
- `pnpm verify` was green after every commit; at the end, 57 files + 1
  skipped, 527 tests + 5 skipped.
- The three freezes were verified after each commit: 61 `d04d3cd8…`, 64
  `b9e17505…`, 74 `864990da…`.

**Breaks,** in scratch copies of `5a28c47` (`git archive`, `node_modules` a
real folder of per-package junctions, vitest run directly, no pnpm):
- **Round one, 58 breaks of the new code:** the range's edges, the grid, the
  guards through the range, the folder rule, the other store's lock, the
  books cap, (b) and (c). **52 killed,** none by a wall-clock limit. Three
  finds were re-aimed after Prettier moved their text (F29, B4, B5); none was
  dropped.
- **Six survived:**
  - F12: the grid's `<=` changes nothing on the three real grids;
  - C2 and C9: the step's cap at the run's `--rate`;
  - C5: a failed read's restart, masked by an audit-less reading in the same
    streak;
  - C7: a reading without a clock minute;
  - C8: a pause after a clean streak.

  `89dcca8` adds a test for each.
- **Round two,** the six and the four breaks whose killing test changed:
  **all 10 killed.**
- The lists and results are in the supervisor folder,
  `workers/FRESH-FETCH/breaks/`.

**The start script**, proven on scratch stores with a heartbeat that does not
exist, so no request could start (2026-11-17 17:39:19–17:39:36Z):
- `-Fresh -SizingOnly` was refused.
- The start was detached: pid 32996 at Idle, and `-Check` saw it.
- A second start was refused.
- A WAVE-H start beside it was refused by the script, and by the tool itself
  (exit 3, logged).
- The stop file ended it in 0.8 s, with no pid file left.
- A start was refused while the stop file was there.

**Not done:** the download itself, which the supervisor starts.

2026-11-17 (the supervisor — WAVE-H's Final review accepted): **THE LOOK
STANDS. Independent code reproduces every position, price and verdict of
WAVE-H's one look exactly; WAVE-H's answer is final, NOT SETTLED.**

**The review:** WAVE-H-LOOK-REVIEW (Sonnet 5.5, fresh), report and Final
review `docs/reviews/wave-h-look-2026-11-17.md`, commit `552b147`.
Verified at 17:55Z:
- the commit holds only that file;
- no tool call read WAVE-H's code;
- 0 sealed-outcome hits;
- the three lists verify.

Its code shares nothing with WAVE-H's but the raw files and the rules'
text: Node built-ins only, with its own LZ4 frame decoder and xxh32
written from the specs (all 12,118 frames' checksums verified).

**What matched:**

| What | Matched |
|---|---|
| WAVE-H positions | 1,299 of 1,299, every field and the exact accounts |
| SIZING positions | 290 of 290 |
| M from SIZING | 147, all 346 scan rows |
| Entries in all 147 slices | 176,986 |
| Priced positions | 1,289 of 1,289 (largest difference in net 1.8e-12 bps) |
| SIZING priced | 283 of 283 |
| Leg prices | all 3,168, with their sources and snapshots |
| Unpriced reasons | all 10 |
| The statistic and the verdict | m +82.5568, SE 40.9102, 212 days, 35 coins, band −22.99 to +188.11, NOT SETTLED |
| Lines beside | 782 fields, 0 differing |
| Counted fills | 2,421,070 |
| Mark rows | 17,618,289 |
| BASE | on every position |
| Funding | per coin |
| Hashes | the data list, the book list and the freeze list (74 files) |

The one difference is the entry cost's median print: the look takes the
mean of the two middle values (n even), which is the ordinary median. It
decides nothing.

**Its notes, kept for the next tests' rules (WAVE-H's frozen rules do not
change):**
- define the median for an even count;
- restate M5's same-millisecond clause with an example (it moves 23 of
  1,299 positions);
- the tape-priced positions (197) average +197.4 ± 124.9 against +61.8 ±
  42.9 at the book: report them as their own line;
- for the fresh-months test, consider an all-slices line, priced at the
  book and the tape, as the deciding line, fixed in advance (SE about 31
  against slice 0's 41).

**Speed:** its one pass over the 8,845 fill files (2.66 billion records)
took 25 minutes, against about 7 hours for WAVE-H's program. Its pipeline
is the natural starting point for the polishing's extraction (the plan
page's polishing row, step 2).

**WAVE-H is closed:** frozen, looked at once, reviewed, and its answer
stands. What follows is the polishing, and the exam on the fresh months.

2026-11-17 (the owner — the fresh months downloaded and sealed; the review
under way): **HYPERLIQUID'S MONTHS AFTER WAVE-H'S DATA ARE DOWNLOADED INTO
THEIR OWN STORE AND KEPT UNOPENED, FOR ONE REAL TEST OF A SHARPENED RULE.**

**What:**
- **The owner's go** (about 16:55Z): "start recomputation now"; then (about
  17:00Z) "start the download of new months then".
- **WAVE-H-LOOK-REVIEW** (Sonnet 5.5, fresh): H15's "Then", that is, the
  look's report and a Final review that recomputes WAVE-H with independent
  code. Started 16:52Z.
- **FRESH-FETCH** (Opus 5.5) extends `tools/waveh-fetch.cjs`:
  - **the range:** from WAVE-H's DATA END to the archive's latest complete
    day (about 5.5 months, about 100 GB);
  - **the store:** its own, `F:\polymarket-follow-research\FRESH\store\`;
  - **the guards:** the same as WAVE-H's download (2 MB/s, the windows, the
    collector watch, the hashes, the floor and a cap);
  - **three fixes** the last nights showed: the `--books` cap counts only
    its run's keys; a fresh reading at a pause's end; and an automatic step
    back to full rate after 30 clean minutes, its exact rule set by the
    supervisor.

  It plans first; the supervisor starts the download.

**Why:** the owner asked how to sharpen the wave (the "polishing").
- The 10 months already seen are the practice ground, explored freely.
- A rule chosen there is proved only on data no rule has seen: one frozen
  test on these fresh months. After that test they join the practice pool,
  and a later version waits for newer months or for MARKET-1's looks.
- More history cannot be had. The archive's fills begin on 2025-05-25, and
  everything since is either the 10 months or these about 5.5. Each new
  month adds one.

**The fresh months stay unopened** until the sharpened rule is frozen: no
file of their store is parsed, and no count is taken from them.

2026-11-17 (WAVE-H — THE ONE LOOK'S RESULT): **WAVE-H IS NOT SETTLED. On
1,289 priced positions it nets +82.6 bps a position, with a two-way SE of
40.9: the band at z 2.58 runs from −23.0 to +188.1.**

**The run:**
- step 2 started 2026-11-17 01:09:21Z, node pid 26652, a 20 GB heap;
- its reading pass ended 13:17:34Z: 8,845 files and 2,421,070 counted
  fills, equal to step 1;
- the positions' SHA-256 `a5506b86…85e5` equals step 1's;
- `look/result.json` was written 16:10:37Z, followed by
  `positions.jsonl.gz` and `report.json`, so the look is complete (H15);
- `dataSha256` `b66a9bb0…676c`, M = 147, z = 2.58.

**The verdict (H12):**
- positions 1,299; priced 1,289; unpriced 10 (no book and no trade at the
  exit); depth short 39;
- not at the book 3.8%, so not WITHHELD;
- 212 days and 35 coins, so not TOO FEW;
- m − z·SE = −23.0, not above 0, so not HOLDS;
- m + z·SE = +188.1, not below +50, so not DOES NOT HOLD;
- **NOT SETTLED.** The sentence: "No mean result as large as 188.1 bps a
  position was seen."

**Printed beside, deciding nothing (H13, H14):**

| Line | bps a position | SE / note |
|---|---|---|
| Excess over each coin's 4-hour BASE | +103.7 | 41.0 (z 2.58 low −2.2) |
| Gross on marks | +95.9 | |
| Gross at the book | +92.3 | |
| Fees | 9.04 | |
| Funding | −0.73 | |
| Win share | 53% | |
| Median | +23.8 | |
| Quartiles | −284.9 / +391.4 | |
| Without the two days that add most | +51.6 | |
| One day left out | +67.0 to +89.3 | |
| One coin left out | +61.8 to +108.3 | |
| Entry cost at the book | 0.85 median, 4.8 p90 | |

- **EVERY SLICE** (all 147 address slices, 176,986 positions, 298 days):
  +66.1 ± 31.3 on marks and +72.0 ± 31.3 excess; 146 of 147 slices'
  means are above 0, the median slice +64.5.
- **The control:** ALONE B2 (episodes without a wave, 167,603) −6.3 ± 17.9;
  B1 (every episode, 303,340) +31.2 ± 21.4.
- **LATE:** +33.0 at 1 h and +32.7 at 3 h, both ± ~41.
- **SIDES:** forced sells (1,050) +121.9 ± 51.7; forced buys (249)
  −19.0 ± 64.8.
- **M halved** (2,257) +10.8 ± 35.2; **M doubled** (603) +205.9 ± 104.6.
- **By month** (on marks): 7 of 10 above 0. February 2026 is +312.7; the
  weakest are January 2026 at −67.7 and September 2025 at −34.5.
- **SIZING** (2025-05-25 → 07-31, 283 priced): −96.9 ± 65.5.
- **The tail:** the worst day 2025-09-08 (−6,141 over 4); the worst
  position −4,906.1; the worst 5% average −1,796.1; the largest fall from a
  peak 19,813; at most 56 open at once.

**What it decides:**
- Nothing for MARKET-1, which keeps its own frozen test.
- WAVE-H's question is answered "not settled": not proven, and effects
  above about +188 bps a position are ruled out on Hyperliquid.
- After the look, no rule of WAVE-H changes (H15).

**Next (H15 "Then"):**
- the look's report `docs/reviews/wave-h-look-2026-11-17.md`;
- a Final review that recomputes WAVE-H with independent code, position
  by position (a fresh worker), before anything is built on the numbers.

Leads for later, as the owner's idea 2 (decisions 2026-11-17, plan
backlog), each to be fixed in advance and confirmed only on data no rule
has seen, such as Hyperliquid's months after 2026-05-28:
- forced sells only;
- the entry's speed;
- larger waves (M doubled).

2026-11-16 (the supervisor — WAVE-H's look, step 1 out of memory; the run's
heap raised): **STEP 1 STOPPED AT THE 8 GB HEAP BEFORE WRITING ANYTHING;
IT RUNS AGAIN WITH A 16 GB HEAP. NO RULE, NUMBER OR FROZEN FILE CHANGES.**

**What happened:** step 1 started 08:38:24Z (pid 34528, idle priority,
`--max-old-space-size=8192`, as H15 "Runs" says). The gate verified the
freeze: 74 files, `864990da…8dd2`. It read 7,000 of 8,845 fill files by
15:18Z (2,210,657 counted fills). It then stopped at about 15:4xZ with
V8's "Ineffective mark-compacts near heap limit … JavaScript heap out of
memory": the last full collections went from 8,156 MB to 8,140 MB.

So the live data really is above 8 GB. It grew about 0.5–0.8 GB per 500
fill files. The reviews' estimates (2.8–4 GB from the rehearsal's heap; a
measured 0.48 KB a counted fill, about 1.2 GB) were too low for the test
months.

**Nothing was spent:**
- `look/` is empty, and no `step1.json`, result or outcome exists;
- H15 says "A run that crashes before its result exists is not a look";
- the test months stay as they were.

**The call:** step 1 runs again, unchanged, with `node
--max-old-space-size=16384`, and step 2 gets a heap set from step 1's last
heap line, at least 16 GB.
- **Why 16 GB:** the end of the fill pass projects to about 10–11 GB. The
  PC has 31.9 GB of RAM (17.8 GB free at 15:46Z) and 54.9 GB with its page
  file.
- **Why it is allowed:**
  - the heap is a run setting: the gate checks the files, not the setting;
  - no frozen file changes, and no number, rule or verdict depends on it;
  - H15's "with an 8 GB heap" records the setting the supervisor ruled on
    2026-11-14 (Q5). That ruling is replaced here, and the frozen text
    stays as it is (a frozen file is never edited).
- **The owner** was told in advance that this would be the route, and
  accepted it ("if that is needed … we can accept that").

**The lesson:** a heap ceiling costs nothing until it is used. On a PC with
spare RAM, it is set generously, and never from an estimate made on a
smaller sample.

2026-11-16 (WAVE-H — THE FREEZE): **WAVE-H IS FROZEN.**

**What:** after WAVE-H-FIX-2 was verified, the supervisor ran
`node tools/waveh-freeze.cjs --final` at 2026-11-16 08:37:06Z, from
`f2836d0` on a clean tree, after `pnpm verify` (57 files + 1 skipped, 512
tests + 6 skipped).

**The frozen list:** `apps/poller/waveh/FROZEN.sha256`, 74 files, SHA-256
`864990dafbc95975bc2cd889352028c42af2e124e8e3cc6da277b142faff8dd2`.
- It verifies against the build (`sha256sum -c`), and its file lines equal
  the draft's (`1d85e2f6…dd38`).
- It names `waveh/rules.md`, `waveh/sizing.json`, `waveh/data.sha256`
  (9,975 files, `b66a9bb0…676c`) and the toolchain: node v24.13.0,
  typescript 6.0.3, zod 4.6.7, pino 10.4.0, lz4js 0.2.0.
- Commit `9f99a0b`, annotated tag `waveh-freeze-1`; the owner pushes the
  tag.
- MARKET-1's 64 files (`b9e17505…2f1d`) and the paper experiment's 61
  (`d04d3cd8…f31c`) still verify.

**WAVE-H-FIX-2, verified first:**
- its commits `6c673ba` (the three rule sentences: the rules' diff is
  exactly those), `326ecd5` (the two tests; it showed each failing on its
  break) and `496ad5d` (the draft list);
- its decisions entry is inside `d72eb10`, word for word, as the worker
  confirmed;
- current-task `9a320ac` and `f2836d0`;
- 0 tool calls under `F:\polymarket-follow-research\`.

**From now on** no rule, number, coin, threshold, instant or file of the
list changes (H15). A code defect found later goes by H0's route, with a new
list and `waveh-freeze-2`.

**Next: the one look** (H15), under the owner's go:
- step 1, counts only, which the supervisor checks;
- the book files it needs, fetched by `tools/waveh-fetch.cjs --books`
  under the download's caps;
- step 2, the verdict.

Every run is started detached at idle priority, with an 8 GB heap,
`WAVEH_STORE=F:\polymarket-follow-research\WAVE-H\store` and
`WAVEH_ROOT=F:\polymarket-follow-research\FIND-SLOTS\WAVE-H-BUILD-rehearsal`
(the rehearsal's folder, as H15 requires).

2026-11-16 (the owner — the go for WAVE-H's freeze and its one look, about
08:30Z): **"you have approvement to continue as you suggested."**

**What it covers:**
1. **The freeze.** After WAVE-H-FIX-2 is verified, the supervisor runs
   `node tools/waveh-freeze.cjs --final` on a clean tree. It commits
   `waveh/FROZEN.sha256` and writes its hash in a decisions entry. That
   commit is tagged `waveh-freeze-1`, and the owner pushes the tag.
2. **The one look.**
   - Step 1 gives counts only. The supervisor checks them before step 2:
     the marks and funding holes, and whether the unpriced share could
     reach WITHHELD.
   - Step 2 gives the verdict.
   - Both run with `node --max-old-space-size=8192 dist/waveh.js look`,
     outside 02:35–03:50Z and 10:25–11:15Z, with the collector watched.

**Afterwards:** the data stays on F:. The look spends only the test months'
independence for this one question. Anything found by exploring them later
is a lead, never proof. A lead is confirmed only on data no rule has seen,
such as Hyperliquid's months after 2026-05-28, or MARKET-1's own looks.

2026-11-16 (WAVE-H-FIX-2's technical calls — the last small fixes of the
entry below, 08:22–08:31Z): **THE THREE SENTENCES AND THE TWO TESTS ARE IN;
THE DRAFT LIST IS WRITTEN AGAIN (74 FILES, `1d85e2f6…dd38`); NOTHING IS
FROZEN OR RUN ON TEST.**

**What:**
- `6c673ba` `waveh/rules.md`: F1 (H15 step 2), F2 (H10's bound) and F3
  (H8's coin), each in the fix-check's exact wording; each old sentence was
  found exactly once (line breaks normalised) before it was replaced.
- `326ecd5` the two tests, no mock:
  - F4 in `test/waveh-freeze.test.ts`: the tool's `--data` run whole from a
    copy in a made-up tree (369 `asset_ctxs` days: exit 1, nothing written;
    the right counts: 9,975 lines); it also checks that the repository's
    `waveh/data.sha256` is byte-unchanged;
  - F5 in `test/waveh-entry.test.ts`: `rehearse` on made-up folders through
    the built program (an empty manifest: exit 5; none: exit 1). `rehearse`
    never reads WAVE-H's freeze, so the answer is the same after `--final`.
- `496ad5d` the draft list (`node tools/waveh-freeze.cjs`, clean tree, after
  `pnpm verify`): 74 files,
  `1d85e2f6276247dae03f0f2ee394255375aa59e28154f7eb5c210cfc1e28dd38`. Against
  `6bd52e61…a5f1` only the head's "written … from commit" line and
  `waveh/rules.md`'s line (`a0dadebc…` → `7e252d04…`) differ.

**Checks:** in a scratch copy (`git archive 6c673ba` and the two test
files), both tests pass; `t04` (main does not call `checkCounts`) fails F4
("expected +0 to be 1"), `n_exitwire` (`code = 1;`) fails F5 ("expected 1
to be 5"); both pass again once restored. Each commit is gated on `pnpm
verify` in the same command (at the end 57 files + 1 skipped, 512 tests + 6
skipped). Both live freezes verify after each (61 `d04d3cd8…f31c`, 64
`b9e17505…2f1d`). The new draft verifies against the build.

**Next:** the owner's go for the freeze and the one look (the entry below).

2026-11-16 (the supervisor — WAVE-H-FIX-CHECK accepted; the last small
fixes): **READY TO FREEZE AFTER THREE RULE SENTENCES AND TWO TESTS; A SMALL
WORKER, WAVE-H-FIX-2, MAKES THEM; THE FREEZE AND THE ONE LOOK WAIT FOR THE
OWNER'S GO.**

**The fix-check** (`docs/reviews/wave-h-fix-check-2026-11-16.md`,
`63b81e9`; Sonnet 5.5, fresh). Verified at 08:21Z: only its report changed;
no sealed file was opened; the three lists verify.

Its verdict is "ready to freeze after these small fixes": no high and no
medium finding.
- The two reviews' 24 findings: 23 fixed as ruled, L12 kept and sound, 0
  open.
- The third run's checklist holds item by item, by its own leaf-by-leaf
  comparison.
- The old build and the new give equal sealed outcomes, positions, legs,
  prices and verdicts on two made-up stores. The fixes moved no price.
- H10 matches a reference written from the rule's text, over 4,000 worlds.
- `data.sha256` and the program's own key builders agree on all 9,975
  keys.
- On a freeze day rehearsed in a scratch repository, the gate accepts the
  list and refuses each kind of change.

**The calls:**
- **F1** (needed; H15 step 2, the sentence that is shorter than the code),
  **F2** (H10, "the run's end") and **F3** (H8, a line naming another coin):
  the fix-check's exact wording, in one commit.
- **F4** (the `--data` main path) and **F5** (the exit code's wiring): its
  two tests, added. Neither uses a mock, and neither changes a frozen hash.
- **F6** (no fsync is visible only to a mock): left as it is.
- **Its Q3** (a count of positions with a settlement without a mark, at step
  1): not added. The per-coin count already bounds it: about 25 holes would
  be needed to reach WITHHELD.
- Then the draft list is written again from a clean tree.

**A correction to the entry below** ("WAVE-H-FIX verified"): its stamp
"07:23–07:40Z" was an estimate. `date -u` read 07:26Z when that check
ended.

**Next:** WAVE-H-FIX-2, then the owner's go. The supervisor runs
`waveh-freeze.cjs --final`, the owner pushes the tag `waveh-freeze-1`, and
then the one look: step 1 (counts only, checked by the supervisor) and then
step 2 (the verdict).

2026-11-16 (the supervisor — WAVE-H-FIX verified; its Q-A to Q-D):
**THE FIX ROUND IS IN AND VERIFIED; THE 7 SIZING POSITIONS WITHOUT A
FUNDING MARK STAY UNPRICED, AS H9 SAYS; NO RULE BRIDGES ARCHIVE HOLES.**

**Verified on the supervisor's path (07:23–07:40Z):**
- 22 commits `875b9b6` … `f396a8d`, every changed file inside WAVE-H or the
  docs, and a clean tree;
- `pnpm verify` green (57 files + 1 skipped, 510 tests + 6 skipped);
- `sha256sum -c` of the three lists: the paper experiment's 61, MARKET-1's 64,
  and the draft's 74 (`6bd52e61…a5f1`);
- `data.sha256` (`b66a9bb0…676c`): all 9,975 lines equal the store's
  manifest, none missing and none extra;
- `sizing.json` is byte-identical in run 2's folder, run 3's folder and the
  repository;
- run 3 against run 2, leaf by leaf:
  - `counts.json` differs only in its run time;
  - `report.json` differs only in failing mark rows 2,831 → 0, off-minute
    rows 2,831, `twice` 0 → 1,777, the new counts (book lines 560 files,
    0 failing; by day; by coin) and the run time;
- the access scan: no read of the sealed outcomes (its four mentions are
  code edits naming the file).

**Q-A, the ruling: the 7 stay unpriced.** WAVE-H-FIX found that their cause
is two whole stretches with no `asset_ctxs` row for any coin (2025-07-19
09:53, 21 minutes; 2025-07-27 11:53, 8 minutes). Each covers a funding
settlement past the kit's 5 minutes. The cause is not the off-minute rows.

So H9 holds as written: "a settlement without a mark leaves the position
unpriced". That is 2.4% of SIZING; WITHHELD needs more than 10%. Step 1 now
counts the settlements without a mark, by coin, before any verdict. A rule
that bridged holes would be a new rule, made after seeing SIZING. It is not
made.

H10's change stays: it is correct, and on 2025-06-08 alone it fills 840
minutes that had no other row. **Call 12's premise "7 → 0" was the
builder's diagnosis and does not hold**: run 3's unchanged `sizing.json` and
sealed hash are right, not a fault.

**Q-B:** the fix-check is told so. **Q-C:** CLAUDE.md's "built so far"
names `dist/waveh.js` (this commit). **Q-D:** the scratch copy with junctions
is left as it is. **Q1's answer** (a copy of `writeWhole`'s behaviour, not an
import) is in WAVE-H-FIX's entry.

**Next:** WAVE-H-FIX-CHECK (fresh, Sonnet 5.5, max); then the owner's go for
the freeze (`waveh-freeze-1`) and the one look.

2026-11-16 (WAVE-H-FIX's technical calls — WAVE-H's fix round, the
supervisor's 12 calls of the entry below and its answers of 03:32Z to the
round's plan): **THE 12 CALLS ARE BUILT, ONE FIX A COMMIT; THE REHEARSAL RAN
A THIRD TIME AND HELD EVERY COUNT, BUT H10'S CHANGE PRICES NONE OF THE 7
"FUNDING WITHOUT A MARK": THEIR CAUSE IS REAL HOLES IN THE ARCHIVE'S MARKS;
`data.sha256` AND A NEW DRAFT LIST ARE COMMITTED; NOTHING IS FROZEN OR RUN ON
TEST.**

**What:** `875b9b6` `--data`'s checks (call 6); `708a0d4` `data.sha256`;
`bff471a` L7, `da6a5fa` L6, `ade159d` L8, `b69fdf9` L9 (call 10's moves);
`6fccbfd` H10 (call 1); `42d136f` the book lines and cell-less mark rows
counted (call 5); `a3f27f2` step 1 reads the marks and funding (call 2);
`1c177f2` step 2's cheap refusals first (call 4); `a4f1558` the look's writes
and the recovery rule (call 3); `c1c82d6` the 8 GB heap (call 7); `c943446`
the rules made exact (call 8); `40c66fe`, `9299b4e`, `0f6596f` the pins
(call 9); `a186e8c` L10's cut (call 10); `1987b1c` a test after the breaks;
`70cdda5` architecture; `c677d17` the draft list; this entry's. Each gated on
`pnpm verify` in the same command (at the end 57 files + 1 skipped, 510 tests
+ 6 skipped); both live freezes verified after each (61 `d04d3cd8…f31c`, 64
`b9e17505…2f1d`). Call 11 kept its four items as they were.

**The supervisor's answers to the plan, recorded as the round's calls:**
1. **Call 3 is amended: "MARKET-1's `writeWhole`" reads "a copy of its
   behaviour".** WAVE-H's own `writeWhole` (`run.ts`) does what MARKET-1's
   does: a `.tmp` file flushed, the rename tried again a second apart, 10
   times in all; its comment names its source (`market1/run.ts`, F2).
   Importing it would have put `dist/market1/run.js` in WAVE-H's frozen
   closure and `dist/lock.js` among its shared files, so a change to
   MARKET-1's process file could stop WAVE-H; the frozen boundary is worth
   20 lines in two homes. The closure stays MARKET-1's and the paper's ten
   files.
2. Step 1's marks counts: the minutes without a mark between a coin's first
   and last mark, and the settlements without a mark by coin (the kit's own
   `cumUnmarked`, its 5-minute rule).
3. "Every expected key": the download's funding grid in `keys.ts`
   (`FUNDING_STARTS`: SIZING's four, then every 20 days from TEST's start),
   pinned to `tools/waveh-fetch.cjs`'s `fundingWindows` by a contract test;
   the readers read the grid's windows, not the list's keys under a prefix.
4. The 1% day rule for mark rows sits in the marks reader (exit 5); its text
   is H10's.
5. Run 2's folder renamed `rehearsal-run2\` before the third run; only its
   `counts.json`, `report.json` and `sizing.json` compared; the sealed file
   moved unread, no line comparison.
6. The checklist gained off-minute rows = 2,831 and `twice` rising.

**WAVE-H-FIX's own calls:**
- **Homes (L7, L9):** `legs.ts` (the run's context, the legs' books and
  tapes, a position priced), `market.ts` (`readMarkets`, `MARKS_START`),
  `gate.ts` (`CLOSED`, `boundOf`), `coins.ts` (`coinName`), `keys.ts` (every
  key builder and `keyDate`, which the seal imports). Tests kept their
  assertions; only their import lines moved.
- **Call 5's book lines:** a `Shelf` (the book list, and each book file read
  once with its lines and failing lines) replaces priceSpot's book list; the
  sums and the files holding a failing line go to the rehearsal's report and
  the look's `prints.files`. A mark row with no coin cell counts as a failing
  row of the day (it may be a small coin's).
- **Call 2:** step 1 reads the marks and funding first (minutes) and the fill
  files after (hours), so a marks defect stops it early; step 2 takes the
  market objects from its own step 1 and reads them once.
- **Call 4:** step 2 checks `books-needed.txt` (step 1's own file) against
  `books.jsonl` before step 1 again; the positions' hash then makes that
  list the recomputed one. The check that a sealed line left for the look is
  one the look prices again moved from the merge to before the tapes.
- **Call 3:** the three writes stay inline in R7's order, after both payloads
  are built (no `writeLook`).
- **Call 9:** `exitOf` sits in `run.ts` with `FrozenDiffer` and `AlreadyRun`
  moved beside it (no import cycle with `look.ts`); `--final`'s refusals are
  `finalRefusal(status, present)`; `test/waveh-verdict.test.ts` is the rules
  review's first made-up look (24 days, 12 coins, HOLDS end to end), so the
  days and coins fed to the verdict are pinned. The survivors call 9 did not
  list stay unpinned: d10, i05, j03, j08, n01 (i03 and j04 came with tests
  written for other calls).

**The breaks** (a scratch copy of `git archive HEAD` at `a186e8c`, a real
`node_modules` folder of junctions, vitest run directly): 58 breaks of what
the round adds and of the reviews' survivors; every find text matched once;
**55 killed by a failing assertion, none by a time limit; 3 survived:** l03
(no test held a sealed line left for the look to the positions priced
again: a test added, `1987b1c`, and l03 killed); r03 (no fsync: nothing a
test can see); t04 (the tool's main not calling its count check: a test of
main's `--data` would write the real `waveh/data.sha256`). The print pins
(b56, b65, b66, l02, l04 of `report.ts`) were broken after, all killed.
`1987b1c`'s message says both r03 and t04 are out of reach for that reason;
it holds for t04 only.

**The lists:** `waveh/data.sha256` from the finished manifest (9,975 lines,
completed 01:15:30Z): 9,975 files, `b66a9bb0f165685cb9c9a64a9ef0109681e493ada5e65c9f5a85307b8e6c676c`;
R3 (i)'s short files: `node_fills_by_block/hourly/20250727/8.lz4` alone,
the hour both formats share. The draft list `waveh/FROZEN.draft.sha256`: 74
files (71 + `data.sha256`, `keys.js`, `legs.js`), from `70cdda5` on a clean
tree, `6bd52e61029556477a51837f3d16b6703b793fc99c1eef4841c6b0b7e2c6a5f1`;
it verifies against the build.

**The rehearsal's third run** (the build of `70cdda5`, `node
--max-old-space-size=8192 dist/waveh.js rehearse`, `WAVEH_ROOT` WAVE-H-BUILD's
slot; started 05:10:40Z, waited out its window to 06:00Z, ended 07:11:48Z,
exit 0). **Every "must not move" held:** `counts.json` equal to run 2's but
the minutes; `report.json`'s legs (566 at the book), book ages, tape − book,
funding (116 files, 46,220 rows), the files and rows of `asset_ctxs` (68,
2,966,816); `sizing.json` byte-identical (M = 147, 346 scan rows, 425,433
counted, 290 positions). **Must move:** failing mark rows 2,831 → 0 and
off-minute rows 2,831 (the same rows, now read), `twice` 0 → 1,777: as
expected. **"Funding without a mark" stayed 7 and the sealed outcomes'
SHA-256 stayed `1a9f731d…3e59`: no outcome changed.** Why, from counts and
times only (the program's readers, the gate closed, SIZING's days): the
off-minute rows fill no minute a SIZING position reads; on most of their 12
days each row shares its minute with the boundary row. The 7 come from
minutes with no row for any coin — 2025-07-19 09:53 (21 minutes) and
2025-07-27 11:53 (8) — which cover the settlements of 10:00 and 12:00 beyond
the kit's 5 minutes; every coin has those two settlements without a mark
(the kit's count, 3 a coin, adds the series' first hour, 2025-05-25 00:00).
Two shorter holes (05-25 14:23, 9 minutes; 06-28 08:18, 7) cover no hour.
H10's change is right and stays (in the test months a stretch without its
boundary rows would otherwise drop marks, as 840 minutes on 2025-06-08 show);
the decided premise that it would price the 7 does not hold. Nothing was
fixed forward; the question is the supervisor's (WAVE-H-FIX's report, Q-A).
`sizing.json` needs no new commit. Facts in external-apis (`asset_ctxs`).

**Not done:** the fix-check, the freeze and the look (the supervisor's, on the
owner's go). R3 (i)'s list was printed, not opened further.

**Slips:** a Bash heredoc halved `\\n` in an edit script (code-rules' own
warning), which broke one test string; seen before the commit and mended by
the Edit tool, scripts written by the Write tool after. A first verify
failed on Prettier alone (a moved file's import line); format runs before
verify since.

2026-11-16 (the supervisor — WAVE-H's two fresh reviews: the calls, under the
owner's go of ~02:00Z, "you have my approvement to start with work"):
**BOTH REVIEWS SAY "AFTER THESE FIXES"; ONE FIX ROUND, WAVE-H-FIX, BUILDS
THEM WITH H10; NOTHING IS FROZEN OR LOOKED AT UNTIL THE OWNER'S GO.**

**The reviews** (`docs/reviews/wave-h-rules-review-2026-11-16.md`, `1bdb0a2`;
`docs/reviews/wave-h-code-review-2026-11-16.md`, `35fc884`):
- each changed only its report;
- neither opened the sealed data;
- the three lists verify (61, 64, draft 71).

They worked independently and agree on the two that matter most:
- the look's step 1 does not yet check the marks and funding;
- a failure after `result.json` would strand the look.

**The calls** (technical, inside the approved plan; none moves a threshold, the
sample, M or the verdict's logic):
1. **H10 as decided, with the rules review's two clauses:** the mark at the
   end of minute [m, m + 1 min) is the `mark_px` of the coin's row with the
   latest stamp in (m, m + 1 min]; two rows of one stamp: the first line
   stands; a stamp is whole seconds, `YYYY-MM-DDTHH:MM:SSZ`, any other form
   fails and is counted. Tests that fail before the change (the reviewer's
   `zz-review-h10.test.ts` may be adapted).
2. **Step 1 reads the marks and funding, counts only** (both reviews):
   - mark rows read, failing, off-minute and twice, by day;
   - minutes without a mark, by coin;
   - funding rows, by coin and window;
   - every expected key in the list;
   - a 1% day rule for mark rows, as H2's for fills.

   So a data defect is seen before step 2 writes a verdict. The worker
   proposes the exact H15 text first.
3. **The look's writes:** MARKET-1's `writeWhole` (fsync, rename retries)
   in place of WAVE-H's own (code M1). H15 gains the recovery rule: if the
   positions or the report are missing after `result.json`, the supervisor
   moves `result.json` aside and runs step 2 again. That run must reproduce
   the same `positionsSha256` and verdict. A test kills break b24.
4. **Step 2's cheap refusals run before its recompute** (code L1).
5. **Counted as the rules say:** a failing book line (H8), and a mark row
   without a coin cell (code L2, rules 6).
6. **`waveh-freeze.cjs --data` checks before it writes:**
   - the counts by prefix (node fills 8,845, `asset_ctxs` 370, funding
     760);
   - no duplicate key (code L4, rules 4).

   Then it is run on the finished download's manifest, and `data.sha256`
   is committed.
7. **The 8 GB heap** in H15 "Runs" and in `waveh.ts`'s header (code L5,
   rules 3).
8. **Rule text made exact:**
   - H0: what each run checks, and the shared `dist/log.js`;
   - H2: the running failure share, as the code stops (code L11);
   - H12: no excess at all → NOT SETTLED;
   - H14: "not at the book" = unpriced + depth short, and SIZING carries no
     BASE;
   - architecture's WAVE-H lines.
9. **Tests for the survivors that matter:**
   - the write order, the exit codes 4 and 5, the `--final` refusals;
   - the previous-hour book glue, a sealed SIZING file with fewer lines,
     the `levelsOf` guard;
   - the exit-leg depth short, the look's days and coins;
   - the print-only lines where cheap.
10. **Quality before the freeze, each a pure move or a small cut with the
    tests unchanged and green:**
    - `rehearse.ts`'s shared reading and pricing layer split out (code Q2,
      L7);
    - one home for the duplicated helpers and types (L6);
    - one place that chooses a leg's snapshot (L8);
    - the store's key grammar in one place, with a round-trip test (L9);
    - unused parameters and exports removed (L10).
11. **Kept as they are:**
    - the tape read for every leg (code Q3; it gives R2's tape-minus-book
      gap);
    - the global `seen` set (Q4);
    - no lock, and the sealed outcomes overwritten by the next rehearsal
      (L12; the supervisor runs each command by hand, once);
    - the plan's +309.7 figure is not built (rules Q4).
12. **Then the rehearsal's third run**, outside 02:35–03:50Z and 10:25–11:15Z,
    on the rules review's checklist:
    - must not move: 425,433 counted fills, M = 147, the 346 scan rows,
      290 / 283 positions, 566 legs at the book, the book ages, the
      tape-minus-book figures, 4.5 bps;
    - must move: failing mark rows 2,831 → 0, "funding without a mark"
      7 → 0, the sealed outcomes' hash.

    Then `sizing.json` and the draft list again (with `data.sha256`, a
    candidate of 72 files).

**Next:** a fresh fix-check on a different model; then the owner's go for the
freeze and for the one look (the supervisor runs both).

2026-11-16 (the owner — the guide covers the paper experiment's page too):
**THE SEPARATE GUIDE PAGE EXPLAINS BOTH PAGES, MARKET-1'S AND THE PAPER
EXPERIMENT'S; BOTH FROZEN PAGES STAY AS THEY ARE.**

**What:** the owner asked for the paper experiment's page to be
explained as MARKET-1's was (decisions 2026-11-15, MARKET-1's page guide).
The guide page will also cover:
- the five lines;
- how to read "m ± SE";
- the band at the next look;
- "against random trades";
- the daily e-value;
- the traders' table;
- the positions' columns and exits.

The owner also noted that repeated exits ("reduce reduce … close") widen
the positions table, and proposed a compact form ("reduce ×6"). That
change, and prices rounded to a sensible number of digits, wait for v1's
page and for arms frozen later.

**Why:** the paper experiment's page is frozen code (its rules R15, frozen
2026-11-12), like MARKET-1's. A change would break the freeze in the middle
of the test. The guide touches no frozen file.

2026-11-15 (the owner — MARKET-1's page guide): **A SEPARATE GUIDE PAGE
EXPLAINS MARKET-1'S PAGE; THE FROZEN PAGE STAYS AS IT IS.**

**What:** the owner asked for MARKET-1's page to be easier to read: a
legend for every number, column and status; colour in the cells for a
position's state; a status column. The owner approved the supervisor's
recommendation:
- **now** (after the owner's usage reset on 2026-11-16): a separate,
  hand-written guide page beside MARKET-1's page. It explains its
  boxes, the lines beside, the columns and the statuses ("pending",
  "open, at the mark", a final net, the flags). It touches no frozen file
  and is written by no program;
- **later:** the status column and status colours in v1's own page, and
  in the page of any arm frozen later.

**Why:** MARKET-1's page is frozen code (its rules M14, frozen 2026-11-13).
A change would break the freeze in the middle of the test. M14 also bars
colours for a result's sign by design, so a running number does not pull
at the test before its looks. Colours for a position's state carry no
result and are allowed in a page frozen later.

2026-11-14 (the supervisor — WAVE-H-BUILD's Q5 and Q6, and the next
steps' order): **H10 READS AN OFF-MINUTE MARK ROW AT THE NEXT MINUTE'S
BOUNDARY; THE LOOK RUNS WITH AN 8 GB HEAP; THE CHANGE IS BUILT IN THE
REVIEWS' FIX ROUND.**

**Verified on the supervisor's path (15:51–15:55Z):** the four commits
`5ac401a`, `c1fbeb8`, `58fc511`, `7589043` and a clean tree; `pnpm verify`
green; both freezes verify (the paper experiment's 61 files, MARKET-1's 64);
the access scan of the builder's transcript finds no sealed-outcome read,
and every mention of a test-month file (2025-08-01 or later) is a
synthetic fixture in a test; its context peaked at 597k.

**Q6, the ruling (a technical call inside the approved plan, R1).** H10's
schema took only rows stamped at a minute's start, and 2,831 of SIZING's
`asset_ctxs` rows for the 38 coins are stamped off the minute, in stretches
on 12 days, so 7 of SIZING's 290 positions had no funding mark. **H10
becomes:** a row stamped s gives the mark at the end of the minute that ends
at or after s (the boundary at or after s); when two rows give one boundary,
the later-stamped one stands; a row stamped on a boundary is read exactly
as now. The mark is still known before the instant it prices, so nothing is
read ahead. Why: it uses data that is there instead of leaving positions
unpriced, and the test months may hold more such stretches, which would
count towards WITHHELD (H12's 10%). It touches neither the counted fills
(M stays 147) nor any threshold.

**Q5, the ruling:** the look runs with `node --max-old-space-size=8192`, a
run setting and no code. The builder's projection from the rehearsal's heap
(453 MB at the end of SIZING's pass; TEST's fill files 5.2 times SIZING's
bytes) is about 2.8 GB at SIZING's density and about 4 GB at 1.5 times it;
this PC has about 34 GB.

**The order (the owner's weekly usage is near its limit until Monday
2026-11-16's reset; the owner agreed at 14:55Z to hold the big runs):** the
fresh WAVE-H rules and code reviews start after the reset, told that H10's
change is decided here; one fix worker then builds H10's change (a test
that fails before it, and a break) with the reviews' findings, runs the
rehearsal a third time (M must stay 147), and rewrites `sizing.json` and
the draft list, which supersede run 2's (`5ac401a`, `c1fbeb8`); a fix-check
follows; the freeze waits for `data.sha256`, after the test months finish
downloading (about 2026-11-15 evening).

2026-11-14 (WAVE-H-BUILD's technical calls, its second session continued,
to 15:50Z — the rehearsal and the draft list): **THE REHEARSAL PASSED ON
SIZING (M = 147, EXIT 0); ITS OUTCOMES ARE SEALED UNREAD; THE DRAFT LIST IS
WRITTEN; ONE MARKS QUESTION IS OPEN.**

**What:** commits after the entry below: `df15448` (the sealed outcomes
Zod-parsed where the look reads them), `b9fe89d` (the entry point's exit-2
refusals tested through the built program; two mislabelled refusals fixed),
`81698bd` (the look computes its report before writing `result.json`, writes
it after), `479a10a` (H5: M = 147, SIZING's R9 counts), `4ce16c4` (the passes
log the heap), `ae478c2` (current-task), `5ac401a` (`waveh/sizing.json`),
`c1fbeb8` (the draft list) and this entry's.

**The rehearsal** (`WAVEH_ROOT` a FIND-SLOTS slot): run one 11:53–12:46Z,
exit 5, 560 book files needed; the supervisor's `--plan` (560 files, 0.71
GB, none missing) and fetch; run two 14:29–15:43Z, exit 0. Counts, deciding
nothing: 1,619 fill files, 472,259,255 records, none failing; 425,433 counted
fills (425,300 market, 133 backstop) in 31 coins; M = 147 again; slice 0's
290 positions, 283 priced in the rehearsal and 7 left for the look; all 566
legs at the book, none on the tape, none depth short; the book's age at a leg
65 / 295 / 493 ms (p10, median, p90); R2's tape − book median 0 bps on each
side (p10 −7.5 and −7.2, p90 +5.8 and +7.4); the highest taker rate 4.5 bps
each month; the sealed outcomes' SHA-256 `1a9f731d…3e59`, in `sizing.json`.

**The draft list** `waveh/FROZEN.draft.sha256`: 71 files from `5ac401a`, its
SHA-256 `4c08ef95b4750fe0e23700baaa44cf7b1b90cd0dddbf3079d3a9f0627b379056`;
without `data.sha256` (the test months first), which the gate requires by
name, so only a list made after `--data` can be final.

**The look's memory (Q5):** SIZING's pass ended at a 453 MB heap sample
(425,433 counted fills, 850,866 legs held for "each fill once"). TEST's fills
are 5.2 times SIZING's bytes (the plan's listing, 182.44 GB against 34.98):
at SIZING's density the look's pass holds about 2.8 GB; at 1.5 times it,
about 4 GB. The PC has 34 GB: the look's runs should take
`--max-old-space-size=8192` (a run setting, not code; the supervisor's).

**Open (Q6, asked):** 2,831 of SIZING's `asset_ctxs` rows of the 38 coins
are stamped off the minute (`…:32:20Z`), in stretches on 12 days; H10's
schema takes only minute-start stamps, so those minutes have no mark and 7
SIZING positions are unpriced, "funding without a mark". A change to H10
(a row stamped s gives the mark at the end of the minute ending at or after
s) would price them and change the sealed outcomes' hash, so the rehearsal
would run a third time.

2026-11-14 (WAVE-H-BUILD's technical calls, its second session, from
10:24Z — the look's code, inside the plan approved the same day): **THE ONE
LOOK IS A COMMAND, TESTED END TO END IN A SYNTHETIC STORE; ITS PRINTS ARE
MARKET-1'S OWN CODE; THE REHEARSAL WAITS FOR THE SIZING DOWNLOAD.**

**What:** commits `ad0f3d7`, `1350e77`, `97310fe`, `4bad8ab` and this
entry's; architecture, "WAVE-H" (the look); rules.md H0, H1, H13, H14 and
H15 made exact to the code; current-task rewritten. `dist/waveh.js look`
(`look.ts`): step 1 writes `look/step1.json` (R3's counts, the positions'
SHA-256) and `look/books-needed.txt` and stops (exit 5); step 2 holds that
hash, the books and the sealed SIZING outcomes, prices every leg, writes
`look/result.json` first, then `positions.jsonl.gz` and `report.json`; a
third run refuses. `report.ts`: H13's lines and H14's prints. Tests
`waveh-look` (the rehearsal, then both steps, each hold, the net by hand) and
`waveh-report` (each line function by hand); builders shared in
`test/waveh-world.ts`. `pnpm verify` green (55 files + 1 skipped, 491 tests +
7 skipped); both freezes verify after every commit (61, 64).

**Calls:**
1. **Step 1 always stops** after writing its files, so R3's counts are read
   before any book is fetched or any price exists (H15); step 2 recomputes
   the pass and stops when the positions' SHA-256 differs from
   `step1.json`'s. After a defect fixed between the steps, `step1.json` is
   removed by hand in the same decisions entry (H15).
2. **The SIZING line** (H13) is the rehearsal's sealed outcomes, held to
   `sizing.json`'s SHA-256 and to SIZING's recomputed positions (in time
   order, the rehearsal's own), with the positions it left priced at the
   look. The look prices every SIZING position whose x_out is at or after
   2025-07-31 23:00Z again (all the rehearsal can leave: an exit in TEST, or
   a tape reaching a file of TEST); the sealed outcome stands where it
   exists. SIZING's positions carry no BASE, as in the rehearsal. The sealed
   file is read from `WAVEH_ROOT\rehearsal\`.
3. **R5's other side (a rule addition, for the reviewers):** a counted fill
   of a file dated 2025-08-01 or later stamped before that is in neither
   part, dropped and counted (`early`), so the look's SIZING is the
   rehearsal's fill for fill. Without it a misfiled fill in TEST's first
   file could change SIZING's last positions and stop step 2 at the sealed
   check. One sentence in H1.
4. **H14's prints are MARKET-1's `summarize` (M13)** through `asPosition`:
   a tape leg is priced (H12), never a mark leg; WAVE-H adds its slices, the
   tape legs by reason and the depth-short legs. MARKET-1's own extra prints
   come along (by week, the costliest third, OWN, which is null here).
5. **The lines on marks use MARKET-1's `statOf`** (the two-way error; by the
   day alone for a set in one coin), as MARKET-1's lines.
6. **M BY MONTH's window:** the 68 days before the month's first day, from
   SIZING's start at the earliest, r(M) over that window's length in days,
   so August's M is H5's M on the same fills.
7. **BY MONTH's R9 counts** run at M inside each month; `burstiness` now
   counts accounts and fills inside its window (the same numbers for
   SIZING, where it was called over the whole list).
8. **LATE is MARKET-1's B3:** in at t + 1 h and t + 3 h; a position whose
   exit marks pass DATA END is counted without marks.
9. **THE DAY WITH THE MOST POSITIONS:** the earlier day on a tie.
10. **Each leg keeps its source** (H9, for the Final review): the book file
    of the snapshot found, or the tape's `tid`s; in the look's positions and
    in the rehearsal's sealed outcomes alike.
11. **The gate requires `waveh/rules.md`, `coins.json`, `sizing.json` and
    `data.sha256` by name** (a list without one: exit 4, not a crash), and
    `tools/waveh-freeze.cjs --final` refuses without the last two.
12. **The closure is now ten files** (R4, walked by the test): MARKET-1's
    `waves`, `fills`, `book`, `price`, `stats`, `lines`, `summary` and the
    paper's `instants`, `stats`, `research`, each equal to its freeze. **What
    a fix to a frozen program does to WAVE-H:** a fix to any of these ten
    stops WAVE-H (exit 4) until a re-freeze (`waveh-freeze-2`) in the same
    decisions entry that re-runs the reproduction; a fix to any other of
    their files changes nothing here; `test/waveh-freeze.test.ts` fails in
    the session that makes such a fix once a WAVE-H list exists.

**Breaks, in scratch copies only** (`git archive`, a real `node_modules`
folder of junctions, vitest run directly, never pnpm): the predicted
survivors were closed with tests first (`1350e77`); round one, 45 breaks of
the look, the readers' gate and the lines: 42 killed; k09 (no BASE for
WAVE-H: `toBeCloseTo(0)` passes on null), k36 (its list named the wrong test)
and k46 (no counted fill outside TEST in the lines' test) survived; round
two, those three with three breaks of the new code: 6 of 6 killed; round
three, LATE's two delays: 2 of 2 killed. None by a time limit. One break
(the sealed file's two-group order) was equivalent: the code now compares in
time order. Lists and results: `workers/WAVE-H-BUILD/` (scratchpad
`breaks/`).

**A slip:** a `node -e` edit mangled four Windows paths in architecture
(code-rules' own warning); repaired from a script file and checked for
control characters.

**Not done:** the rehearsal's run (the SIZING download held 1,452 of the
rehearsal's 1,839 files at 10:48Z, paused for 10:25–11:15Z); its book fetch
(the supervisor's go, asked with `--plan`'s count once `books-needed.txt`
exists); M and SIZING's counts in the rules; `data.sha256` (the whole
download first); the draft freeze list. The order is in
`workers/WAVE-H-BUILD/progress.md`.

2026-11-14 (WAVE-H-BUILD's technical calls — WAVE-H's build, its first
session, inside the plan approved the same day): **THE REPRODUCTION HOLDS
THROUGH WAVE-H'S OWN MAPPING; THE GATE, THE READERS, THE RULES AS PURE
FUNCTIONS AND THE REHEARSAL ARE BUILT AND TESTED; NOTHING IS FROZEN OR RUN ON
TEST.**

**What:** commits `83f892d` … `2e2e19e` and this entry's; architecture,
"WAVE-H". The rules draft `apps/poller/waveh/rules.md` (H0–H15 with R1–R10; M
blank); `waveh/coins.json`; `src/waveh.ts` and `src/waveh/` (the `rehearse`
command; the look's first step as a tested function, `look.ts`, no command
yet); `scripts/waveh-reproduce.ts`; `tools/waveh-freeze.cjs` (with `--data`,
writing `waveh/data.sha256` and R3 (i)'s sizes-only list; not run);
`tools/waveh-fetch.cjs --books` (not run: the running download keeps its
loaded code, and the supervisor reviews the diff before a restart picks it
up); tests `waveh-rules`, `-reproduce`, `-store`, `-price`, `-rehearse`,
`-freeze`, and the fetch tool's (41).

**The reproduction (R8), first:** the pre-cut seed's 927,921 lines in
Hyperliquid's shape (each row its own leg; a liquidation also its
counterparty's leg with the same object; `crossed` false and method
"backstop" for order id "0"), read through WAVE-H's own parser, schema and
H4: **727 counted fills = 695 market + 32 backstop, fill for fill equal to
MARKET-1's `isForced`; 153 entries on 47 days in 30 coins, 114 forced sells
and 39 forced buys, entry for entry equal to MARKET-1's `waveEntries`; 3 of
them backstop legs (the review's 150 without them).** No line failed the
schema.

**The owner's supervisor's answers (09:1xZ):** lz4js 0.2.0 installed from the
registry (`pnpm add -D --save-exact`, its metadata and tarball only); one
keyless `meta` read (request 1, 09:11Z, 235 entries: every one of the 38 names
once, not delisted, its index the planner's asset id), the price agreement
cited from WAVE-H-PLAN's check in `coins.json`. **The frozen lists' comment
naming `pnpm-lock.yaml`'s hash is information only:** the lockfile changed
with lz4js; neither MARKET-1's nor the paper experiment's gate reads it, and
both still verify (64 and 61 files).

**WAVE-H-BUILD's calls:**
1. **H3 and H6: "tradable at t" needs no test.** A counted fill is a fill of
   its coin at its instant, so its coin exists then; a check that cannot fail
   would be dead code. The rule says so.
2. **H8, which book files:** x's hour's file; the hour before's only when x
   lies within 10 s after its hour's start and x's file holds no snapshot at
   or before x (a snapshot of an earlier hour is older than 10 s for any later
   x). The plan's rule made exact; the same outcomes. When x's own file is not
   in the archive, the reason is "no book file".
3. **H8, the tape's files:** x's hour and the next (a fill can sit in its
   writer's next hour). The tape's records are each fill once (account and
   `tid`) in H4's order; a backstop's record never (R2).
4. **H1 with R5:** SIZING is the records of the fill files dated before
   2025-08-01 whose `time` is before it, in the rehearsal and at the look
   alike; a later-stamped record of such a file is dropped and counted. A
   SIZING position whose exit is at or after 2025-08-01, or one whose leg has
   no book and needs a tape from a file of TEST, is left for the look.
5. **H5:** SIZING's length is exactly 67 days 10 hours (the plan's "67.42").
6. **A `tid` of any size:** a line whose `tid` has 16 digits or more is parsed
   with a reviver keeping each `tid` as its digits; a shorter one is a safe
   integer (Zod 4's `.int()` refuses an unsafe one by itself).
7. **lz4js 0.2.0 reads a block checksum from the wrong place** (4 bytes before
   a block's data, where the LZ4 format puts it after): such a frame is
   refused, and so is a dictionary id; a file is decoded only when its one
   frame ends at its end, and its decoded size is checked against its
   header's. The archive's frames carry FLG 0x64 (a content checksum only):
   nothing real is refused. lz4js's three files are checked at load.
8. **The book list is `store\books.jsonl`** (the plan's `books.sha256`): a
   fetched file's manifest line, or a key its hour folder's listing lacks
   written as missing. The book fetch is the download tool's `--books` mode,
   under the same gate and lock, so it never runs beside the main download.
9. **Settings:** `WAVEH_STORE` (read only) and `WAVEH_ROOT`, neither inside
   the other; the reproduction's own `WAVEH_PRECUT`, so MARKET-1's
   `MARKET1_PRECUT` test is not triggered. No file is started in
   02:30–06:00Z or 10:25–11:15Z: the program waits the windows out.
10. **R8's counterparty legs:** a maker closing (`crossed` false, reducing) for
    a market liquidation; the vault opening (`crossed` true, `startPosition`
    0.0) for a backstop.
11. **R4.** The closure is exactly what the compiled imports reach
    (`CLOSURE`, walked by a test): today MARKET-1's `waves`, `fills`, `book`,
    `price` and the paper's `instants`, `research`; the look's verdict and
    BASE will add MARKET-1's `stats` and `lines` and the paper's `stats`.
    `dist/schedule.js` and `dist/log.js` are shared and unfrozen, their
    hashes logged at each start, as MARKET-1's M0. **What a fix to a frozen
    program does to WAVE-H:** a fix to one of MARKET-1's files or the paper
    experiment's in the closure stops WAVE-H (exit 4) until a re-freeze
    (`waveh-freeze-2`) in the same decisions entry that re-runs the
    reproduction; a fix to any other of their files changes nothing here;
    `test/waveh-freeze.test.ts` fails in the session that makes such a fix
    once a WAVE-H list exists (its lines carry their freezes' hashes).

**Breaks, in scratch copies only** (`git archive`, a real `node_modules`
folder of junctions, vitest run directly, never pnpm): parts 1–2, 50 breaks,
49 killed, one equivalent (`.safe()` after Zod 4's `.int()`); part 3, 42, 39
killed in round one and the three survivors in round two after their tests;
part 4 and `--books`, 28, 18 in round one and the ten survivors in round two.
None killed by a time limit alone. Lists and results: the supervisor folder,
`workers/WAVE-H-BUILD/`.

**A slip:** `f77fa89` was committed with `pnpm verify` red (a rehearsal test
timed out at vitest's 5 s under the suite's load); `8dd0f2f` fixed it at once
(the heavy tests carry their own time limits), and every commit since is
gated on the verify's exit code.

**Not done (WAVE-H-BUILD stopped at the context limit, 2026-11-14 10:19Z):**
the rehearsal's run (the SIZING download held 1,432 of the rehearsal's 1,839
files then); the book fetch (no go asked, no book file fetched); the look's
second step, its command and its lines and prints (H13, H14); M and SIZING's
counts in the rules; `data.sha256` and the draft list (they need the whole
download); breaks of the look's first step. The order and the look's design
are in `workers/WAVE-H-BUILD/progress.md` for a fresh WAVE-H-BUILD.

2026-11-14 (WAVE-H's plan approved — the owner): **WAVE-H'S PLAN IS APPROVED
WITH ITS REVIEW'S FIXES R1–R10; ALL ITS DATA STAYS ON F:, THE RAW FILES
KEPT UNTIL THE ON-CHAIN PROJECT'S FOUNDING.** The owner: "yeah you have
approvement for both things. so let's do fixes and we will keep all data
on F:".

1. **The plan.** `docs/reviews/wave-h-plan-2026-11-13.md`, with
   WAVE-H-PLAN-REVIEW's R1–R10 (`docs/reviews/wave-h-plan-review-2026-11-14.md`)
   folded into its rules. The plan's ten questions are answered as its
   review recommended:
   - 1–8 and 10: yes;
   - 4: yes after R2;
   - 9: as point 2 below.

   The build goes MARKET-1's road:
   - parts, with the reproduction on Polymarket's pre-cut weeks (727 = 695
     + 32, 153 entries);
   - the rehearsal on the sizing months, counts and mechanics only;
   - the rules final, and a draft freeze list;
   - then fresh rules and code reviews, the fixes, a fix-check, the
     freeze;
   - the one look.
2. **The data** stays on F: (`F:\polymarket-follow-research\WAVE-H\`).
   The raw files are kept after the look's Final review, until the
   on-chain project's founding decides whether it uses them.
3. **The download** runs on as specified (decisions 2026-11-14, WAVE-H's
   download spec). The book files the rehearsal and the look need are
   fetched under the same guards and the same 2 MB/s, never alongside the
   main download beyond that rate.

2026-11-14 (WAVE-H-FETCH's technical calls — WAVE-H's download tool built):
**THE TOOL AND ITS START SCRIPT ARE BUILT TO THE SPEC (THE ENTRY BELOW) AND
TESTED WITH NO NETWORK; THE SMOKE TEST WAITS FOR 06:00Z AND THE SUPERVISOR'S
GO; THE REAL DOWNLOAD IS THE SUPERVISOR'S TO START.**

**What:** `tools/waveh-fetch.cjs`, `tools/waveh-fetch-start.ps1`,
`apps/poller/test/waveh-fetch.test.ts` (`8f0cbd0`, `f5879fc`, `21bccce`);
architecture, "WAVE-H's data download".

**Ruled by the supervisor (02:32Z), as WAVE-H-FETCH proposed:**
1. **DATA END is 2026-05-29T01:00:00.000Z.** The hourly file of its own
   hour, 2026-05-29 01h, is the last one admitted: a file holds its writer's
   hour (plan H1), the plan's table reads "05-29 00h–01h", and the review
   counts 8,845 fill files. A daily file and a funding window end before
   DATA END.
2. **"Stop for the day"** means the tool exits (code 4) with a log line
   saying why; the supervisor restarts it.
3. **A file found without its manifest line is fetched again,** never
   re-hashed from disk (D6 said re-hash): no data file is read after its
   write.

**WAVE-H-FETCH's calls:**
4. **The start.** WMI's `Win32_Process.Create`, idle (64), hidden: the
   process's parent is `WmiPrvSE.exe`, so it is no child of the session and
   in no job of it. The tool also sets its own priority to idle. Shown on a
   scratch store with no network: started, `-Check`, a second start
   refused, stopped by the stop file in about a second.
5. **Its own files are under the store,** in `store\fetch\`:
   - the pid file is the lock, touched every minute; a holder is a live
     process whose file was touched in the last 3 minutes, so a pid reused
     after a crash or a restart holds nothing;
   - the stop file;
   - `rate.txt`, written by each pause (the halved rate) and read at a start;
     the supervisor raises the rate by editing or deleting it before a start;
   - `problems.jsonl`: the keys missing, bad or changed;
   - `log\<UTC date>.jsonl`.
6. **One gate for every request,** the listings and the funding reads too:
   the stop file, the pause windows, a pause, the watch's first reading, 1 s
   after any request and 6 s after a funding read. A tick each second runs
   the watch and ends a transfer the gate closes on. The file is then fetched
   again from its start when the gate opens; that is no error.
7. **The watch's details.**
   - A stat that fails gives no time that second, so the age grows.
   - A failed content read is tried once more after 1 s, then counts as no
     reading.
   - A reading without a clock minute or an audit judges neither (the
     collector's first minutes); one without a book connection is harm.
   - A fault in the watch pauses the download; a fault in a pause stops it
     (exit 1).
8. **Listings month by month,** 27 for the full plan and 7 for the first
   session, which lists no name of the test months. Each page is validated:
   the bucket, the prefix, KeyCount equal to its entries, the truncation and
   its token. A page that fails is an error of the ladder; an entry that
   fails is dropped and logged.
9. **The replies.**
   - 403 or 404: missing, in `problems.jsonl`, tried again at the next
     start.
   - 429, 5xx, a network error, no byte for 60 s, or a local fault in a file:
     the ladder (the reply is ended).
   - A redirect or any other status: the run ends (exit 1).
   - A file is kept when its size equals the listing's, the reply's ETag
     header equals the listing's, and, single-part, its MD5 equals the
     ETag. A body longer than listed is cut off.
10. **The fundingHistory replies are stored unparsed,** since their test
    windows are sealed. A reply is kept on HTTP 200, a JSON content type and
    a non-empty body, at most 256 KiB. `endTime` is the window's end minus
    1 ms, so a window is [start, end) whatever the API's convention. WAVE-H's
    program parses them at its own boundary (Iron Rule 3).
11. **The cap** is the listed bytes plus 256 KiB a funding read, times 1.02.
    **The token bucket** holds one second of the rate.
12. **A stored file whose listing changed** (its ETag or size) is listed as
    "changed", never fetched again.
13. **A rename refused 10 times** (D6's retry, a second apart) stops the run
    (exit 1); its `.part` is removed at the next start.

**Tests:** 37 in `test/waveh-fetch.test.ts`, with no network: a fake bucket
and info API through the injected fetch, a fake clock that moves only when
the run waits, and heartbeats built from the collector's own `Heartbeat`
schema. A kill is simulated by abandoning a run in a file.

**Breaks,** in scratch copies only (`git archive`, the test file run per
break, no network):
- **Round one, 98 breaks on `8f0cbd0`: 96 killed,** none by a wall-clock
  limit. A17 and A18 (the third pause not stopping the day) were killed by
  the fake clock's six-hour bound: without the stop, the run never ends.
- G17 survived because its target, `keyTime`'s hour check, was dead code: an
  hour past 23 rolls the date, which the round trip already refuses. It is
  deleted in `f5879fc`. G18 survived through the same overlap.
- **Round two, on `f5879fc` with `21bccce`'s tests:** all 101 finds match
  once. G18, E1 (a local fault leaves the reply open), R10 and R11 (the
  rename retry) and S10 (the "changed" report) are all killed.
- The lists and results are in the supervisor folder,
  `workers/WAVE-H-FETCH/`.

**Not done:**
- the smoke test (three keyless requests at most), after 06:00Z on the
  supervisor's go;
- `--plan` against the bucket, which takes 7 listings for the first
  session and 27 for the full plan, more than the smoke test's three.

2026-11-14 (WAVE-H's download spec — the supervisor's calls under the owner's
advance approval): **THE PLAN AND ITS FRESH REVIEW AGREE: THE DOWNLOAD MAY
START, AS SPECIFIED HERE. THE PLAN'S RULES STILL WAIT FOR THE OWNER.**

**The papers:**
- WAVE-H-PLAN: `docs/reviews/wave-h-plan-2026-11-13.md`, `22a4757`.
- WAVE-H-PLAN-REVIEW: `docs/reviews/wave-h-plan-review-2026-11-14.md`,
  `c723e9c`, Sonnet, fresh. Its verdicts:
  - the download is "safe after these changes" (D1–D8);
  - the plan is "approvable after these fixes" (R1–R10, none high).
- Its recount on the pre-cut seed confirms the counted fill: Polymarket's
  backstop own fills are takers with order id "0", and 727 = 695 + 32,
  giving 153 entries.

**The supervisor's checks:**
- Both papers committed only themselves; access clean.
- The planner's downloads: 107, all dated 2025-06-07 to 07-17, 1.56 GB,
  deleted.
- The collector during that planning download (2026-11-14 00:07:45–00:21:24Z,
  about 1.9 MB/s): the price audits at 00:07:51Z and 00:17:51Z agreed
  89/90 and 90/90, with no warning or error line in the window. This is the
  only measured test of the rate on this line.

**The spec of `tools/waveh-fetch.cjs`.** Plan section 3 with D1–D8; the
tool is never part of a frozen program.

1. **The data and guards.**
   - Only the plan's prefixes of `aws-public-blockchain/v1.1/hyperliquid/mainnet/`
     and `POST /info` `fundingHistory`.
   - No date before 2025-05-25 or at or after DATA END.
   - Keyless, `research-check/1.0`, never `/exchange`, no account, key or
     payment.
2. **The store:** `F:\polymarket-follow-research\WAVE-H\store\`, with a
   manifest (key, bytes, ETag, LastModified, MD5, SHA-256, the fetch time).
   - The MD5 must equal the ETag where single-part; the size where
     multipart.
   - **Never a file decoded or parsed.** The test months' files are stored
     unopened.
   - Every file goes on F:. A free-space floor of 200 GiB on F: and a
     total-byte cap of the planned bytes + 2% (D4).
3. **The rate.**
   - **2 MB/s, with no automatic step to 4 MB/s** (D7). The test months are
     not needed before the freeze.
   - One request at a time.
   - Pauses 02:30–06:00Z and 10:25–11:15Z.
   - After an error it waits 30 s, 2 min and 10 min, then stops for the day.
4. **The watch** (D1, D2), failing closed.
   - The heartbeat's age by `statSync`.
   - Its content by one read at most once a minute, right after its time
     moves. A failed read counts as no reading.
   - It pauses for 10 minutes, then halves the rate, on any of:
     - clock offset above 400 ms;
     - `heartbeat.time − lastFrameAt` above 15 s on a book connection;
     - a heartbeat older than 60 s;
     - the latest price audit's `agree` below 90% of its `rows`.
   - After a pause the rate stays halved until the supervisor raises it.
     Three pauses in an hour stop the day.
   - Every reading is logged.
   - The supervisor's measurement behind this (the review's D1): a content
     reader in a tight loop failed 456 of 514 renames, while a stat-only
     reader failed none. The collector's heartbeat write is in a try/catch
     that retries in 10 s.
5. **The funding windows** are aligned to the seal (D5).
   - No window straddles 2025-08-01 or passes DATA END: 20 windows a coin,
     760 reads, at least 6 s apart.
   - `[]` with HTTP 200 for a coin before its listing is valid.
6. **The writes** (D6):
   - `<name>.part`, hashed, then renamed, with a rename retry;
   - errors classed; listings validated;
   - resumable;
   - a kill-and-restart test.
7. **The runner** (D3):
   - one instance, with a pid file and a stop file;
   - idle (below-normal) priority;
   - started detached by the supervisor, so it outlives a chat session.
     This is a deliberate exception to "a subagent's processes end with
     it", recorded here; it is no Windows task, and the owner may stop it
     at any time with the stop file.
8. **The first session downloads the sizing months only** (about 35 GB),
   with one mid-file kill and restart. The supervisor then reads the tool
   against this spec, checks the collector's audits and the tool's log, and
   only then lets it continue into the test months.
9. **The daily check** (D8): the supervisor reads the collector's log
   (price audits, warnings) and MARKET-1's day records. No
   `coverage.jsonl` is read for the download.

**Disclosed by the review:** one live `userFills` reply of the liquidator
vault (its 2,000 newest fills) held records dated inside the sealed span
(2026-05-18 to 05-28). The reviewer used two August fills only and one
count, and deleted the reply. No price of the test months was analysed.

**Left for the owner:**
- the plan's rules and R1–R10;
- question 9: the reviewer recommends keeping the raw files until the
  on-chain project's founding rather than deleting them after the Final
  review.

2026-11-13 (WAVE-H's download — the owner's advance approval): **THE
SUPERVISOR MAY START WAVE-H'S DATA DOWNLOAD WITHOUT WAITING FOR THE OWNER,
ONCE THE PLAN AND ITS FRESH REVIEW AGREE ON IT.**

The owner, before an absence: "if that comes and am not here, you have
approve, you can download, everything inside F:, as always careful on
limits and on everything."

**What it covers:** only the download of the public, keyless Hyperliquid
data the plan names (AWS's public bucket), into F:. Iron Rule 1 as widened
the same day applies.

**The conditions:**
- the rate cap and schedule the plan sets, protecting the collector's live
  line;
- the collector's health watched during the download (the price audit's
  timing misses, its coverage and any gap), and a pause on any sign of
  harm;
- no request in the night window 02:35–03:50Z if the plan says so;
- checksums;
- a resumable download.

**The seal:** the test months' files (2025-08-01 to 2026-05-28) are stored
unopened. No code reads them until WAVE-H's freeze list exists.

**What it does not cover:**
- WAVE-H's plan itself and its rules, which still wait for the owner's
  approval;
- the build;
- any account, key or payment, which stay the owner's.

2026-11-13 (the two outside researches — the owner's ruling): **WAVE-H
FIRST, IN THIS PROJECT; IRON RULE 1 WIDENED FOR READ-ONLY RESEARCH DATA;
THE FIRST KEYLESS CHECKS APPROVED; THE ON-CHAIN PROJECT AFTER WAVE-H'S
FIRST ANSWER.** The owner: "am approving everything and agree with your
recommendation … you have approvement to change that Iron rule".

**The reports:** WAVE-ELSEWHERE (`docs/reviews/wave-elsewhere-2026-11-13.md`)
and ONCHAIN-SCOUT (`docs/reviews/onchain-scout-2026-11-13.md`).
- Both researchers' conduct was clean. The supervisor's scans found no
  name in any search, only documentation pages fetched, and no network
  command.
- The supervisor confirmed their load-bearing facts at the primary
  sources:
  - Hyperliquid's WebSocket types: a fill's `liquidation` is
    `{liquidatedUser?, markPx, method}`, and a trade's `users` are
    `[buyer, seller]`;
  - Hyperliquid's archive is requester-pays, and its fills are in the API
    format;
  - AWS's public-blockchain registry lists Hyperliquid and Lighter, with
    "No AWS account required";
  - Lighter publishes free daily trade files from 2025-01-17, columns not
    documented;
  - BIS WP 1062's 42,324 liquidations, its one-hour rule and its 1,028
    waves;
  - Etherscan's free plan and terms, and Binance's dataset terms.

**The calls:**

1. **WAVE-H first, in this project.** It tests MARKET-1's own finding, the
   liquidation wave, on Hyperliquid:
   - by MARKET-1's definition (M3–M6);
   - on days before Polymarket Perps existed (WAVE-ELSEWHERE's design,
     section 4: test months 2025-08-01 → 2026-05-28), so that the sample
     is new;
   - by MARKET-1's road: plan, fresh review, build, fresh reviews, freeze,
     one look.

   The test months' prices stay unread until the freeze. Lighter (WAVE-L)
   comes later at most, as the same evidence seen twice, not a second
   sample. WAVE-H decides nothing for the frozen MARKET-1.
2. **Iron Rule 1, widened.**
   - **Why it exists:** the founding decision's point 2 (2026-11-06) made
     the app safe by construction: no order code, no trading keys,
     nothing that can move money, no secret that can leak.
   - **The new text keeps all of that** and widens only what may be read:
     besides Polymarket's endpoints, other venues' public, read-only data
     endpoints and published data files, for research approved in
     decisions.
   - **Never** an endpoint that places orders, moves funds or needs a
     signature.
   - Any account, key or payment is the owner's decision, and the owner
     makes it.
   - A generic User-Agent, with no name of the project or the owner.
3. **The first checks, approved.** A small worker, WAVE-CHECKS, runs them:
   - **K0:** the AWS public-blockchain listing under `v1.1/hyperliquid/`.
   - **L1:** one Lighter day file of trades. It is read for its columns
     only, from a day in the sizing months, not the test months.
   - **K1, K2:** about seven keyless reads of Hyperliquid's public info
     endpoint (its read requests are POSTs to `/info`; never `/exchange`).
   - **K8:** the venues' and the bucket's terms.

   No price is analysed and nothing is counted. Any paid route (the
   requester-pays archive, about $20–60, through the owner's own AWS
   account) comes back to the owner first.
4. **The on-chain project** (ONCHAIN-SCOUT's) is founded after WAVE-H's
   first answer, in its own repository with its own supervisor. Its key
   and terms decisions are made at its founding.
5. **MARKET-1's second arm** stays at about 2026-11-20, as ruled the same
   day.

2026-11-13 (two outside researches — the owner's approval): **TWO
SEPARATE DESK RESEARCHES ON FABLE 5.2, IN PARALLEL: WAVE-ELSEWHERE (narrow)
AND ONCHAIN-SCOUT (broad).**

The owner: "you have approve for 2 agents on fable 5.2 … if my broader idea
shows potential after investigation idea is to start new project, not
inside this one."

1. **WAVE-ELSEWHERE.** Can MARKET-1's wave be tested on another venue's
   public data, perps exchanges on-chain or not, and how exactly?
   - Which venues publish liquidations at all, with or without the
     account, and how far back.
   - How MARKET-1's definition maps onto each.
   - How honest prices can be had there.
   - A replication design, rules first.

   For this project: a wave seen elsewhere makes MARKET-1's lead more
   credible, and a long public history could answer faster than the forward
   looks. It decides nothing for the frozen MARKET-1.
2. **ONCHAIN-SCOUT.** Is there a promising, testable direction in public
   on-chain data (Etherscan and similar explorers, indexers, many chains)
   for the owner's purpose?
   - It uses what this project learned: copying traders did not pay, while
     forced flows (the wave) did on the old weeks.
   - It maps the data sources (cost, keys, limits, terms, history) and the
     patterns observable on-chain, each with an honest test design.
   - It says what of this project's method and code is reusable, and
     whether a new project should start, with its first steps.
   - It leaves the wave's replication on other venues to WAVE-ELSEWHERE.
3. **Both are reading only:**
   - public documentation, specs, terms and studies;
   - no API call to any venue or explorer;
   - no account and no key;
   - never the owner's details or the project's name in a search.

   Each lists the exact small checks it would want to make next, with a
   recommendation, for the owner to approve.
4. **Iron Rule 1 is unchanged.** A free read-only key for a data source
   (an explorer, for example) would amend it, and that decision is the
   owner's. Any account is created by the owner. No trading key, ever.
5. **Where it lands.** Each report goes to `docs/reviews/` here, as dated
   evidence. If ONCHAIN-SCOUT shows potential, a **new project** is founded
   in its own repository, with its own supervisor and founding decisions,
   not inside polymarket-follow. The report is copied there as founding
   evidence, and the two projects share no runtime code, as with
   polymarket-lab.

2026-11-13 (the owner's rulings after MARKET-1's deploy, on the supervisor's
overview): **A SECOND MARKET-1 ARM WILL BE ADDED; WAVES SHOWN LIVE IN V1 AS
INFORMATION; THE RECORDINGS' SECOND COPY BY THE OWNER WITHIN ONE TO TWO
MONTHS.**

1. **The second arm.** The owner: "I agree about a second MARKET-1 arm, we
   should add it when you think is ideal. record that and we will do it."
   - What it is: the variants parked in "MARKET-1's plan approved" for a
     later arm, run as their own frozen arm with their own START, lines and
     verdict.
   - How: MARKET-1's road (plan, fresh review, build, fresh reviews,
     freeze). The frozen first arm runs on untouched (rules.md M0).
   - Cost: zero API reads.
   - When: the supervisor proposes it after MARKET-1 has run a stable week
     (about 2026-11-20) and before D1, so its clock starts early. The
     owner's yes is needed for its plan, as for every task.
2. **Waves live in v1, as information.** The owner: "yeah I agree with
   this, we should add it."
   - The v1 plan includes a live view of liquidation waves in the small
     coins, labelled as under test and never as advice (Iron Rule 6).
   - **Open question for that plan:** how to see liquidations soon enough
     inside the budget. MARKET-1 sees a wave only once the paper experiment
     has read the accounts involved: about a seventh a day, the rest at its
     Monday sweep.
3. **The recordings' second copy.** The owner will provide the space
   within one to two months; the supervisor then sets up the copy. Until
   then the recordings, which cannot be read again, exist on F: only (1.4
   GB on 2026-11-13, about 0.5 GB a day).

2026-11-13 (MARKET-1 — THE FREEZE): **MARKET-1 IS FROZEN.**
- `apps/poller/market1/FROZEN.sha256`: 64 files, SHA-256
  `b9e17505d8d4dfc87101b35c4908929b4ed18c6dd401cf723dfbab0c15452f1d`.
- Written by `tools/market1-freeze.cjs --final` at 2026-11-13T14:29:11Z,
  from the clean tree at `62341b4`.
- Committed as `4832a6a`, annotated tag `market1-freeze-1` (local; the
  owner pushes it).
- Its 64 hash lines equal the reviewed draft's (`94828ff9…6460`, from
  `43efd04`).

**How it got here:** MARKET-BUILD → MARKET-RULES-REVIEW and
MARKET-CODE-REVIEW → the owner's ruling → MARKET-FIX → MARKET-FIX-CHECK
("ready to freeze after M0's wording") → MARKET-FIX-2 (`afb2e5c` …
`62341b4`).

**The supervisor's checks before `--final`:**
- M0's two bullets are byte-equal to MARKET-FIX-CHECK's text
  (`verify/MARKET-FIX/m0-text.out.txt` in the supervisor's folder: 749 and
  432 bytes); a single hunk; no file under `src/` changed since the check.
- `pnpm verify` green: 46 files plus 1 skipped, 380 tests plus 3 skipped.
- The paper experiment's freeze verifies (61 files, `d04d3cd8…f31c`); no
  paper file changed since `paper-freeze-1`.
- The draft verifies against a fresh build. Its list differs from the
  previous draft only in its head line and `rules.md`'s hash.
- MARKET-FIX-2's access is clean.

**After `--final`:** the final list verifies against the build. `pnpm
verify` gives the same 380 tests with the list present, so the gate's
opening changes no test.

**MARKET-FIX-2's notes:**
1. The paper experiment's frozen `experiment/rules.md` (lines 27–30) has
   the same inexact kit wording as MARKET-1's old N5: the kit is checked in
   `research.ts` when it loads, not in the gate. It is listed, not edited
   (frozen); nothing depends on that wording.
2. The previous entry's headline says "four tests"; its call 3 names seven
   breaks, and all seven are pinned (`43efd04`).

**Next:**
- The owner deploys MARKET-1:
  1. `tools\deploy.ps1 -Program market1`;
  2. from an elevated PowerShell, `tools\register-tasks.ps1 -Market1Only`
     (its daily task at 10:30Z);
  3. the first run by hand, its backlog from START 2026-11-11.
- No paper command by hand while a MARKET-1 run is live (rules.md M2).
- The first real run's `format` line is read before the run is trusted
  (F7 (c)).
- A defect found later is fixed only by M0's road: a decisions entry, a
  failing test, the positions changed, and `market1-freeze-2`.

2026-11-13 (MARKET-FIX-CHECK — the supervisor's last calls before MARKET-1's
freeze, inside the owner's approval of the fix batch): **"READY TO FREEZE
AFTER M0's WORDING"; ONE LAST SMALL BATCH (THE RULE TEXT MADE EXACT, FOUR
TESTS), THEN `--final`.**

**MARKET-FIX** (16 commits `20ec89c` … `4ea4b41`; its entry below) made
calls 1–12. The supervisor verified it on its own path:
- `pnpm verify` green (376 tests passed, 3 skipped);
- the paper experiment's freeze still verifies (61 files);
- the draft list matches the supervisor's build (64 files, `3073e097…ed27`);
- both regex fixes read back from source and build;
- no sealed path touched.

**MARKET-FIX-CHECK** (`docs/reviews/market-fix-check-2026-11-13.md`,
`2e62446` and `20b85c0`; Sonnet, fresh):
- **The findings:** of 23 distinct findings, 17 are fixed, 4 accepted and
  sound, 1 answered without code and 1 a process item done; none is open.
- **The breaks:** all 259 re-run. Exactly MARKET-FIX's claim: 240 killed, 6
  equivalent, 3 on deleted code; none killed by a time limit alone.
- **`lookVerdict`** equals the old assembly and an independent M10/M11 on
  33,000 made-up looks.
- **The draft list** equals a fresh build.

**Its new findings and the calls:**

1. **N1, the rule text.** M0's "every reader … takes the gate" is no longer
   true of the look's two readiness reads (`look.ts:103` `readState()`,
   `:113` `marketDays()`). They are safe by order: the freeze check is the
   first read of `daily` and `look`, and a failed check returns 4 before any
   sealed read. **M0's sealed-data bullet takes MARKET-FIX-CHECK's exact
   wording** (its report, "M0's replacement wording"). A frozen rule says
   exactly what the code does; the code does not change.
2. **N5, the rule text (pre-existing).** M0's first bullet said a bad kit
   fingerprint or lib-exits hash ends in exit 4, but `loadResearch` would
   throw (exit 1). It **takes the report's exact wording** too, in the same
   commit.
3. **N2 and N3, tests outside the list.** Four breaks of the order and the
   exit survive every test today:
   - an early `readState()` before the freeze check, or before the paper
     wait (k01, k02);
   - `process.exit(0)` (k11);
   - `run.close()` removed (k12).

   They survive because a missing path reads as an empty state, so an early
   read leaves no trace. The fix-check's two sketch tests kill all four.
   Three small cases are unpinned too:
   - C's window end (k06);
   - S's zero (k07);
   - the parent of a store allowed (k09).

   All seven get tests now.
4. **N4.** `gate.ts`'s header comment says "every reader". It stays: the
   rule is the authority, and changing the comment changes a frozen file's
   hash for nothing.
5. **MARKET-FIX's Q1.** The rehearsal hook stays: production never passes
   it, and it is how the old-weeks rehearsal re-runs after a defect fix.
6. **MARKET-FIX-CHECK's slip, checked by the supervisor.** It ran
   `pnpm verify` in a scratch copy whose `node_modules` were junctions to the
   repository's, and the install re-pointed two development-only links,
   `node_modules\@eslint\js` and `apps\poller\node_modules\@types\node`, to
   the scratch (13:31:03Z). It restored them at 13:32:29Z. The supervisor
   found:
   - both now equal the lockfile (10.0.1 and 24.19.2);
   - no entry of the repository's `.pnpm` store changed since 12:00Z;
   - the live copies' packages are plain folders with hard-linked files, and
     none of their 521 hard links is missing;
   - no live program starts in that window.

   No effect. The lesson goes to code-rules.
7. **Then:**
   - a fresh small worker (MARKET-FIX-2) applies 1–3 and writes a new draft
     list;
   - the supervisor checks the rule diff word for word against the report
     and the seven breaks killed;
   - `market1-freeze.cjs --final` on a clean tree, with the list's hash and
     the tag `market1-freeze-1` recorded here.

2026-11-13 (MARKET-FIX's technical calls — MARKET-1's fix batch, inside the
owner's ruling of the same day; commits `20ec89c` … `ab19562`): **THE
RULING'S CALLS 1–12 ARE MADE; THE NEW DRAFT LIST IS
`3073e0971016893f47d603f92f3b2844c777c3afabf28e4d3492e5d91b31ed27` (64
FILES, FROM `79312a8`); NOTHING IS FROZEN; THESE CALLS.**
**(1) The freeze's date** is read right after the freeze verified, before
anything sealed is opened, so a list without its `# written` line stops the
run with nothing read (exit 1 by the crash handler). **(2) The settings'
refusal** (call 5): one refine per own folder, naming it; "inside" includes
equal; paths compared by `path.relative` (case ignored on Windows); a sibling
whose name only begins like a store is allowed; the two own folders against
each other were not ruled and are not checked. **(3) The refusal's line**
(call 10): `<setting>: <message>`, joined by "; ", "the command: …" for the
command line. **(4) L5 as ruled, with two consequences:** the look's readiness
reads (`state.json`, the market-day listing) take no gate now — the deleted
check could not fire, they come after the freeze check (MARKET-FIX's Q2);
booksAt trusts the pre-filter's market (a text with a duplicate `ch` key or a
leading zero, which the server does not send, would no longer be skipped).
The rehearsal hook stays: its comments already say the old weeks alone pass
it (MARKET-FIX's Q1). **(5) L6's one-liners** are the code review's Q2 list:
`DAY_MS` and `dayOf` imported, `DayCheck` as `z.infer`, `RunRecord` exported
and used by the look (its log lines, its books file and its manifest); the
reproduction script takes `dayOf` from the paper's stats. **(6)**
`lookVerdict(kit, wave, k)` takes the look, not z: the sentence needs it.
**(7) After a verdict** each later look adds one line on the page, without its
sentence. **(8) The tests:** `market1-look` (MARKET-RULES-REVIEW's made-up
looks rebuilt as pure worlds through `computeAll`), `market1-look-run` (a
small world ready for look 1, with its own frozen package),
`market1-entry` (the built program); `writeDay` moved to `market1-world`.
Exit 4 of the built program is tested through `daily` and `look` (the
repository's package gets its list at `--final`, so a process test would
change meaning); exit 1 through `look 3` before its Monday, which stops at
its first log line with or without a list. The EPERM test runs where the
platform refuses a signal to pid 4 (Windows) or 1. The Student band is
checked against t computed apart (3.695608 and 2.994155 at 9 degrees). The
tests that run looks, processes or held files carry their own time limits,
so a busy machine (or a break run beside other suites) cannot fail them.
MARKET-FIX's own breaks of its fixed lines found two gaps in its own tests (a
folder named "..m1" inside a store; the prints' lower bounds at looks 2 and 3
taken at look 1's z), closed by `ab19562`.
**Checked:** 249 deliberate breaks in scratch copies (MARKET-BUILD's 75, the
rules review's 41, the code review's 77 and its first session's 37 rebuilt
from their recorded descriptions, 19 of MARKET-FIX's own; 13 re-aimed where a
fix moved their text): 238 killed on `da21622` and 2 more (f09, f16) on
`ab19562`, no kill by a time limit alone; 3 broke code that call 8 deleted
(m69, m73, r30); 6 equivalent, listed: an open position at END − 2 ms (the
same minute as END − 1 ms), a forced look's legs past END (in no set), legs
at or past END decided at a look and P's legs decided (record lines only,
no price changes), an account whose P is the cut read (the window [CUT, CUT)
is empty), and f02 (the throw above still guards the line it changed).
MARKET-BUILD's 75: 75 killed. The old weeks: the reproduction's printed
figures pass
before (`3821416`) and after (`79312a8`), and its dumps of every counted fill
(727), entry (153) and position with its price (1,376) are byte-identical
(+309.7 ± 67.7); MARKET-FIND's own lists (MARKET-BUILD's scratchpad) were
outside MARKET-FIX's reads, so their fill-for-fill case was not re-run — the
build it held equal is the one before. The bridge rehearsal after the fixes:
1,363 positions, 1,362 equal to the reproduction to 1e-9 bps, the same one
listed (two BTC legs in one second), 196 pending at the first run and 0 at
the end, 2,709 legs at the book, 5 at the mark through the recorded stop —
MARKET-BUILD's report in every field but its timings. The draft list equals
a clean scratch build and MARKET-1's own gate accepts it. The paper
experiment's freeze, 61 files `d04d3cd8…f31c`, verified after every commit;
`pnpm verify` green (376 tests). **Next:** a fresh fix-check against both
reports and calls 1–12, then `--final`, the hash here and the tag
`market1-freeze-1`, then the owner's deploy and task.

2026-11-13 (MARKET-1's two fresh reviews — the owner's ruling on the fixes,
before the freeze): **BOTH REVIEWS SAY "AFTER THESE FIXES"; THE OWNER
APPROVED THE WHOLE BATCH ("everything is clear, i agree with everything, you
can start"); ONE FRESH FIXER, THEN A FRESH FIX-CHECK, THEN THE FREEZE.**

**The reports.**
- MARKET-RULES-REVIEW (`docs/reviews/market-rules-review-2026-11-13.md`,
  `f4e2e06` and `7af4968`): may freeze after these fixes; 3 medium and 8 low
  findings, numbered 1–11.
- MARKET-CODE-REVIEW (`docs/reviews/market-code-review-2026-11-13.md`,
  `a16d5aa` and `cbd06d1`): after these fixes; no high; 5 medium (M1–M5) and
  11 low (L1–L11).
- A sign-in failure stopped the first pair at about 09:49Z. Successors on the
  same briefs re-confirmed every finding before it went in.

**What both confirm.**
- Every ruling and F1–F19 is in the rules, and nothing is added.
- The draft list (64 files, `cc5cd6bd…6076`) equals a clean build.
- The paper experiment is undisturbed: its freeze verifies (61 files,
  `d04d3cd8…`), nothing writes under its root, and its lock is waited for.
- The seal holds.
- The old-weeks reproduction and the bridge rehearsal re-run equal.

**Access.** The scans are clean. For the rehearsal, a reviewer copied the
paper experiment's `seed` and `panel-precut` and the kit's `pool-weeks`.
These are pre-cut and not sealed, and the seed verified 1,602 of 1,602
against `experiment/seed.sha256` afterwards.

**The calls, all made before `--final`:**

1. `freezeDate` reads `\S+`. A list without its head line is an error, not
   "unknown", and the end-to-end page test asserts the date (rules 1, code
   M1).
2. The book-line pre-filter allows JSON whitespace. The collector stores the
   server's text verbatim, so a spaced frame must still match; it is tested
   with one (code M2).
3. M11 says the order: WITHHELD, then TOO FEW TO TELL, then DROP before KEEP.
   This is the code's order (rules 3).
4. After the test's first KEEP or DROP, the page keeps that look's verdict on
   show and labels each later look "after the verdict", and M14 says so.
   This is what M11 already promises (rules 4, code L7).
5. `MARKET1_ROOT` or `MARKET1_BACKUP` inside `PAPER_ROOT` or
   `RECORDINGS_ROOT` is refused at start (code L8).
6. The look's verdict assembly becomes one small pure function, pinned by
   tests built from MARKET-RULES-REVIEW's made-up looks (rules 2, code M4).
   Those looks are:
   - KEEP;
   - TOO FEW by F1;
   - DROP by the recorded fee;
   - TOO FEW by days, by markets and by noise;
   - KEEP with a forced leg;
   - WITHHELD.
7. New tests kill the surviving deliberate breaks that touch what decides,
   what is frozen, or the live programs' safety. They cover:
   - the look's freeze check and paper-run wait (M3);
   - the recordings reader's integrity branches (M5);
   - the lock and heartbeat names and the paper's, the heartbeat catch,
     `EPERM` read as alive, the 6-hour wait and the rename tries (L1);
   - the recorded fee and the fee alarm (L2);
   - the printed numbers (L3);
   - the backup's seven folders and its hash compare (L4);
   - the builder's own additions a2, d and e (rules 7);
   - START, F5's minimum for DROP, and the exit codes (L8).

   Equivalent breaks are listed, not tested.
8. Dead and test-only code in the frozen scope is deleted (L5). Of the
   copies (L6), only the one-line ones are removed. The `lock.ts` helpers and
   the shared `daily`/`look` preamble stay until a second arm exists.
9. Rule wording is corrected (rules 5, 6 and 11):
   - M1 against M7 (the hour after, and later days' coverage);
   - OWN's "dir ×";
   - the source of the ± for B1, B2, B6 and OWN;
   - the small words.
10. **Accepted as they are:**
    - a malformed `manifest.json` stops the run loudly with exit 1 (rules 9);
    - six support files stay outside the list, as in the paper experiment
      (rules 8);
    - the naming and shape notes (L9, L10) wait for a second arm;
    - the raw Zod dump at a bad setting (L8) becomes one readable line only
      if that is a one-line change.
11. **Answered by the supervisor:**
    - **A book level's size is in units of the coin.** In the founding probe
      (2026-11-06), 100 of 100 fills charge exactly 2.000000 bps of quantity
      × price across 7 instruments, including small coins 10 and 70. The
      spec gives trades' quantity "in no. of contracts" with no multiplier
      anywhere (the supervisor's
      `verify/MARKET-RULES-REVIEW/size-unit.out.txt`). So `book.ts`'s walk
      stands; the first run's data confirm it.
    - **F: has 1,551.6 GB free** (2026-11-13 10:52Z).
    - **The collector's `rulebook` grows only when a rule changes or a
      server closes a connection** (`store/db.ts`, `noteRule` and
      `noteEvent`), so reading it whole each run is cheap.
12. Every fix commit keeps the paper experiment's freeze verifying.
    Deliberate breaks run only in a scratch copy, never in the working tree
    (L11).

**Then:**
- a new draft freeze list and `pnpm verify` green;
- a fresh fix-check against both reports' findings;
- `market1-freeze.cjs --final`, with the hash and the tag `market1-freeze-1`
  recorded here.

2026-11-13 (MARKET-BUILD's technical calls — MARKET-1's build to "rules
ready", inside the plan approved the same day; commits `79b3984` …
`32923a7`): **MARKET-1 IS BUILT TO ITS RULES; ITS DRAFT FREEZE LIST IS
`cc5cd6bd46c64f441416e2f9d10536adaf3d709f95d541f3121eacb75b9c6076` (64 FILES,
FROM `36dcffe`); NOTHING IS FROZEN, DEPLOYED OR REGISTERED; THESE CALLS.**
**(1) Shape:** a third entry point, `dist/market1.js` (`src/market1/`), with
`market1/rules.md`; its list holds the eleven paper files of F8, checked by
its own tool `tools/market1-freeze.cjs` against the paper experiment's
freeze (the paper's tool untouched); the reproduction is a script and a
test, the bridge rehearsal a test, both run on pre-cut data only by a
switch (F12). **(2) The sealed gate** refuses, before anything is opened, a
read reaching the cut while MARKET-1's freeze is not valid, and with the gate
closed any datum at or after the cut; a pre-cut run lists no market-day
folder. **(3) F2:** the paper run is waited for by its lock and heartbeat (a
check a minute, 6 hours, then exit 5); MARKET-1's whole-file writes retry a
refused rename 10 times a second apart, its heartbeat skips a failed write.
**(4) The record's gaps:** from the coverage of every closed day (more than
F3's two); a leg waits until the day after its own is closed or missing
(F3); two gaps the plan's list missed, added to M7 — a refused book channel
(the collector marks no stall for it) to its connection's next open, and a
day whose coverage cannot be read (missing, differing, a line that does not
parse) as a whole day; "no book line" means none in the three hour files
read. **(5) The record:** each closed day checked once and kept
(`days\<date>.json`, with its coverage events); each final leg decided once
and kept with its book line (`books\<run date>-<HHMMSS>.jsonl.gz` — named by
the run's time after the rehearsal found that a second run the same day
replaced the first's file); `seen.json` for the first-seen date. **(6) The
tiers:** J and X join T, R, B8 and B9 in the later arm (the build ran long);
B7, B10, C, S and OWN are built. **(7)** Every line's position needs its
market tradable at t (the plan said it of WAVE). **(8) A look past its
wait** prices at the mark a leg not final ("recording not final at the
look") and leaves pending one without its market-days, both counted as not
at the book. **(9) The page** shows an open position at the mark at
END − 1 ms, labelled (the book there is final two days later), and cuts
WAVE's headline at the Monday of the earliest P among the pool's accounts
without a standing hole (F4). **(10) F9's alarm** only when a recorded rate
for these markets differs from the kit's 4 bps. **(11)** A test brings its
own kit data (the panel pins), as the paper experiment's `fixed`;
`tools\poller.env` holds `MARKET1_ROOT` and `MARKET1_BACKUP`;
`deploy.ps1 -Program market1` and `register-tasks.ps1 -Market1Only` are
prepared (a scratch deploy only; nothing registered). **Checked:** the
reproduction at END = CUT on marks — 727 counted fills fill for fill and the
153 entries entry for entry against MARKET-FIND's lists regenerated by its
own `lib.mjs`; 47 days, 30 markets, 114 sells, 39 buys; +309.7 ± 67.7 (day
60.1, market 53.8), minus BASE +311.3 ± 68.7, the additive net +297.1 ±
67.8, OWN +74.9, the reader model 138; B1 383 +131.9, net +119.5; B2 +22.0;
B3 +292.9 ± 72.7, +309.6 ± 83.1; B4 +274.7 ± 58.9; B5 +434.5 ± 97.1; B6
+274.2 ± 84.1, +413.4; B7 +61.6 ± 37.4, +111.3 ± 48.7; B10 222 +5.3 ± 24.4;
B11 −1,875 (2026-09-09), 2,370, 19, −1,101.9, −699.4; one listed difference,
M10's √max where MARKET-FIND's `cr2` printed the smaller two-way (OWN 49.9
for 48.7, B1 37.7 for 35.1, B2 42.3 for 34.9, B6 buys 100.3 for 98.0); M9's
net (the kit's leg) +297.0 ± 67.7. The bridge rehearsal (F7): 1,363
positions through the forward readers, 1,362 equal to the reproduction's net
to 1e-9 bps, one listed (two BTC legs 4 ms apart in one second: the sampler
keeps the second's last frame, and the earlier instant reads the line
before, as M7 says); 196 legs pending at a first run and repriced from the
record at the second; 5 legs at the mark through a recorded stop. 75
deliberate breaks of what decides and of the run's glue, all killed. A
real-size hour: the day check 6.5 s an hour (about 2.6 min a day). The paper
experiment's freeze, 61 files `d04d3cd8…f31c`, verified after every commit.
`pnpm verify` green. **Next:** a fresh rules review and a fresh code review,
then `--final`, the hash here and the tag `market1-freeze-1`, then the owner's
deploy and task.

2026-11-13 (MARKET-1's plan approved — the owner, "everything clear and
approved. you can start with work", on the supervisor's recommendation):
**MARKET-PLAN IS APPROVED WITH EVERY FIX OF MARKET-PLAN-REVIEW; MARKET-BUILD
BUILDS IT.** Plan `docs/reviews/market-plan-2026-11-13.md` (`86ef4da`);
review `docs/reviews/market-plan-review-2026-11-13.md` (`a281775`: may be
approved after the fixes named; it rebuilt WAVE's 153 entries from the
plan's words, equal). **The rulings:** δ = **+50 bps** a position (the
owner); **KEEP needs both** the money's lower bound above zero **and** the
mean of the positions' gross on marks minus their matched baseline above
zero (F1: a market's drift cannot pass as the effect; not a
basket-adjusted reading); DROP on the money alone; **a verdict needs at
least 20 UTC days and 10 markets with a priced position** (F5); depth-short
legs counted with the mark-priced toward WITHHELD above 10% (F6); MARKET-1
reads the paper experiment's files only when its run is over (its lock and
heartbeat checked, short reads; F2), and nobody runs a paper command during
MARKET-1's run; every leg waits until the day after its own is closed and
reads both days' coverage (F3); the page's headline on complete weeks only,
the current week apart (F4); a bridge rehearsal through the forward
readers before the freeze (F7); MARKET-1's freeze lists the 11 paper files
it imports or reads with (F8); the low findings as the review recommends;
the beside lines in tiers — T, R, B8 and B9 may join later as their own
arm, then J, X, B7, B10, S and C if the build runs long — and never delay
the freeze; the plan's twelve questions as recommended, except Q4 (F1) and
Q12: **the burst stays 30 for all callers** until a reader needs more (not
MARKET-1, which reads nothing from the API). The gates as for the paper
experiment: no MARKET-1 data is read until its rules are frozen and its
hash is recorded here after a fresh rules review; nothing is deployed or
registered without the owner.

2026-11-13 (MARKET-1 to be planned — the owner, after MARKET-FIND: "ok,
everything clear now, approve, continue with market-1 plan", and on where
they would act: "i can start on polymarket if that easiest for me to know
exact numbers, later i can move on binance or similar"): **MARKET-1, A SECOND
FORWARD PAPER EXPERIMENT ON THE MARKET ITSELF, IS PLANNED WITH ONE DECIDING
LINE, WAVE; MARKET-PLAN WRITES IT.** The evidence: MARKET-FIND
(`docs/reviews/market-find-2026-11-13.md`; exploring, on the 68 days before
the cut): when at least two different pool accounts were liquidated on the
same side in small coins within 60 minutes, the coin came back +309.7 ±
67.7 bps over 24 h (153 entries on 47 days; net +297.1; September +255,
October +321; outside a wave nothing); the supervisor's own code gives 174
entries with the beta months, +285.1 ± 58.8 (`verify/MARKET-FIND/wave.mjs`
in the supervisor folder). **Ruled, as MARKET-FIND recommended (its
section 6):** (1) one deciding line, WAVE, in place of three — JUMP and TAPE
printed beside, with every liquidation outside a wave, the late entries and
the market's own moves; (2) the wave counted by accounts (two or more); (3)
held one day; (4) the prints beside as its section 3 names them, XREV among
them; (5) **Polymarket Perps first** — every position priced at
Polymarket's own recorded book as a taker; BTC and ETH at the wave's
moments stay prints. **MARKET-PLAN's frame:** MARKET-FIND's exact rule W
(section 3) as the starting point; the data from the collector's
recordings (books and trades since 2026-11-10 20:59:54Z) and the pool's
fills, read after the freeze only; the same three looks as the paper
experiment (2026-12-19, 2027-02-06, 2027-05-08) and the whole 5% over
them; keep, drop or too few, as verdicts on the test; the recordings, the
collector's database and the paper experiment's new data stay sealed until
MARKET-1's rules are frozen; then a fresh review, the owner's approval, the
build and the freeze, like the paper experiment's. No new API reads unless
the plan shows a need and its cost.

2026-11-13 (the market lead — the owner, on STRATEGY-REVIEW's MARKET-1:
"agree with all your recommendation", then "if you think additional research
narrowed research on this topic would help, then we can do it before plan
Market-1. you can use again Fable5.2 … once we have new info … we will
decide about Market-1. then we build market-1 and finally we are doing
overview"): **BEFORE MARKET-1 IS PLANNED, ONE INVESTIGATION ON THE OLD WEEKS,
MARKET-FIND (Fable 5.2), SHARPENS THE SMALL-COIN LEAD AND SEARCHES FOR AT
MOST TWO MORE MARKET PATTERNS; THE RECORDINGS STAY SEALED UNTIL MARKET-1 IS
FROZEN.** The lead (STRATEGY-REVIEW, `docs/reviews/strategy-review-2026-11-12.md`,
M1, M2, 3.1; exploring, on weeks already studied): in small coins (every
crypto market but BTC and ETH) the price came back after a tracked
account's liquidation (+147.6 ± 36.4 bps over a day, nine of ten weeks)
and after very large 15-minute jumps (+70.9 ± 23.6), and moved the takers'
way where trading was heavy (+36.3 ± 9.1); nothing in BTC, ETH, gold, oil,
indices or stocks; one falling stretch produced every hint. **Agreed for
MARKET-1 when it is planned** (the supervisor's four recommendations): its
three lines (LIQ first, JUMP, TAPE), each a $1,000 paper position priced at
the recorded book and held a day; small coins decide, the large markets
printed beside; the owner says where they would act; the cheap additions
beside the running experiment (its copies priced again at the recorded book,
the "past follower result" list, the opposite side's result) in the same
plan, as new arms with their own start. **MARKET-FIND's frame:** part A
makes the lead's rules exact (what counts as an event, its size, the delay,
the hold, the cells, what a live tool could see, what a real order could
capture, a matched baseline of random minutes in the same coin and hour,
the falling stretch and the bunched days); part B searches for at most two
more candidate lines with a fixed cap on tries, each written down before it
runs; everything is exploring and decides nothing; only data before
2026-11-07 is read (books do not exist before 2026-11-10, so book patterns
wait). Then the owner decides MARKET-1, it is planned, reviewed, built and
frozen like the paper experiment, and the supervisor gives the overview.

2026-11-12 (THE FREEZE of the paper experiment — rules.md R0; the supervisor
records it after verifying it on its own path, inside the owner's approval
of the plan): **THE PAPER EXPERIMENT IS FROZEN: `apps/poller/experiment/FROZEN.sha256`,
61 FILES, SHA-256 `d04d3cd81945057aba59d3475190596090b8962626cec502b006d7430f2ef31c`,
COMMIT `eadf1e5`, TAG `paper-freeze-1`.** Written by `tools/paper-freeze.cjs
--final` at 2026-11-12T20:19:52.394Z on the clean tree of `e3b1700`
(toolchain in its head: node v24.13.0, typescript 6.0.3, zod 4.6.7, mongodb
7.7.0, pino 10.4.0, pnpm-lock `266a3797…`); it lists `dist/paper.js`, 22
files of `dist/paper/`, the 35 vendored files of `research/` (the kit
`2d3667b5…09aa`, lib-exits `612d5836…6330`) and `experiment/` `rules.md`,
`seed.sha256` and `favourites.txt`. **F0 = 2026-11-12T20:19:43Z** (the first
line of `favourites.txt`, 9 s before `--final`; PAPER-FIX-CHECK N6);
`favourites.txt` (SHA-256 `c3fb45f7…d273`) holds exactly PAPER-FAV's 20
(decisions 2026-11-12, "the favourites list fixed before the freeze").
**The supervisor's checks:** a fresh build, then every one of the 61 listed
files equal to its hash; `pnpm verify` green (35 files, 282 tests); the tree
clean; the favourites equal to PAPER-FAV's file; the access scans of
PAPER-FREEZE clean; nothing after the cut read by anyone before this entry.
**The road to it:** PAPER-BUILD's parts 0–5 and its closing tasks;
PAPER-RULES-REVIEW and PAPER-CODE-REVIEW ("after these fixes"); the batch of
13 fixes; PAPER-FIX-CHECK ("not yet, because of four small slips");
PAPER-FREEZE's four mends (no banned word the page can print, the night
test's timeout, R14, R15, R17) and the edge fix (`867ddc6`: MAIN always has
a verdict — WITHHELD when all its copies are unpriced, TOO FEW TO TELL with
no SE). **Accepted with the freeze, as frozen** (PAPER-FIX-CHECK's R-L11):
the builder's operating numbers — the schema alarm at more than 1% and at
least 10 rejected rows, an immediate stop at 1,000; the list accounts'
safety cap of 50 pages a day; the breaker at 5 failed reads in a row; the
120-second wait of a request. **From here:** a change to any frozen file is
a defect fix or a new arm (R0), never a quiet edit; the gate opens on this
list only. **Next:** the owner's deploys — the collector (its generic
User-Agent and its burst of 15), then `-Program paper` — and
`register-tasks.ps1 -PaperOnly` from an elevated PowerShell; the first run
catches up from 2026-11-07; looks at 2026-12-19, 2027-02-06 and 2027-05-08.

2026-11-12 (the favourites list fixed before the freeze — the owner, "keep 20
and mark the 8", on the supervisor's recommendation): **ARM F IS THE 20
ACCOUNTS OF RULE 7'S TOP FIFTH AT THE CUT; THE 8 OF THEM WITH A PROFIT
FACTOR OF AT LEAST 1 IN THE FORMATION WEEKS ARE PRE-REGISTERED AS A SUBSET
PRINTED AT EACH LOOK, DECIDING NOTHING.** PAPER-FAV (`workers/PAPER-FAV/` in
the supervisor folder; FIND-6's frozen code, `FROZEN.sha256` 17 of 17 equal,
the kit `2d3667b5…09aa`; no outcome computed, nothing at or after the cut):
100 CONFIRM candidates on [2026-10-10, 2026-11-07) (5 holdout), 41 eligible
for rule 7, all scored; rule 7's own top fifth (k = 20) holds no holdout
account, so the 20 are exactly it — `favourites-20.txt` SHA-256
`0f6991d1f70c2ef9fcdb3caf9114a6303e951c8e0cf3351024b396ca5005231d`. Only 8
of the 41 eligible had a profit factor of at least 1 after base-tier fees in
those four weeks (rule 7 ranks and has no floor; rank 1's PF is 70.3); all 8
are in the 20, and 12 of the 20 lost money then. **The subset, fixed now**
(sorted; SHA-256 `7ca52f0971aa7fc5b813b9619adc5fed4ada9b9617316b9863e7bbc1d247a8ff`):
0x42aed3bb770d7f028d1a649dc9689f5e1a638a58,
0x5b61eb45bd64d4904e76f69a9f165d7415606926,
0x5fb1929cc30f66758a2668cdab2b5b2219f85a62,
0x7b3675c9e62467a8795cc05f52d246381f4417a2,
0x85792dbba27bdbdbd89b6d06209abc9e9d5ea60d,
0x9f801ef76b7976195a280c95ae84d9aed93d778f,
0xa6a279ae513d06acd243eba5406e3cebed342fb8,
0xfbdbb8db386baefdc4d9a1af75b0d0b1bcc4dece. At each look the supervisor
prints FAV's figures for these 8 and for the other 12 from the day's
position log, with MAIN's statistic, labelled exploring; no code change
and no verdict word. The 20 are written to `favourites.txt` at the freeze;
F0 is the freeze's instant (R2).

2026-11-12 (the favourites line's accounts — the owner, "please find 20
accounts which most fit our requirements we will work test on them. so i
don't need to send you anything", on the supervisor's proposal): **ARM F
(THE FAVOURITES, BESIDE MAIN, DECIDING NOTHING) HOLDS THE 20 ACCOUNTS THAT
BEST FIT THE OWNER'S "DISCIPLINED TRADERS" FILTER ON THE WEEKS BEFORE THE
CUT.** The filter is FIND-6's rule 7 (decisions 2026-11-11, "entry 6 runs
with the owner's filter"; with RULES-REVIEW-6's M1), computed by FIND-6's
own frozen code on its CONFIRM formation window [2026-10-10, 2026-11-07)
over the notional board's candidates (FIND-6 R2, R12); the first 20 in rule
7's order that are not holdout accounts (the experiment refuses those). The
list uses only fills before the cut, so it cannot be fitted to the weeks it
is tested on; FIND-6 found the filter's top fifth no better on the old
weeks, and this line tests it forward. Computed by PAPER-FAV (no repository
change), checked by the supervisor, written to `favourites.txt` at the
freeze; F0 stays the freeze's instant (ruling Q5, as frozen in R2). MAIN —
the slow traders by rule, about 160 accounts — still decides; every
directional trader (BROAD) and the other lines stay beside it.

2026-11-12 (PAPER-BUILD's fixes after the two fresh reviews — its technical
calls inside the supervisor's batch, commits `1d720b7` … `e0c7540`): **THE
BATCH IS IN; THE DRAFT LIST IS `34df20ff…9714` (60 FILES); NOTHING IS FROZEN.**
**(1)** `look()` takes `daily()`'s `io`, one rule-book reader for both; the
band is tCritical(2·normalUpper(z), days − 1) × SE_day. **(2)** The box reads
"Look k (date): the main line V. <sentence>", plus "Next look <date>." unless
V is KEEP or DROP; the next look is the first without a result; the day's
record, manifest and backup come before the page. **(3)** Favourites are
lower-cased and each once; `checkFavourites` (form, CUT ≤ F0 ≤ the freeze's
instant, no holdout) is the program's own, run by `paper-freeze.cjs`.
**(4)** `besideLines` in each look's result (MAIN's voted copies, COMP on
BROAD's too); only MAIN's line has a verdict and a sentence. **(5)** A split
event is known by its JSON text; its days run from the record that first
lists it to the one that drops it, both included, open while listed.
**(6)** `scoreInput` keeps the fills before END for a run and a look alike.
**(7)** The collector's burst 15 delays the first request of a restart by up
to one burst window: the restart test's "at once" bound is now 10 s; the
night pass's peaks stay 49 / 12. **(8)** The freeze tool builds `dist/paper`
afresh (also for the draft); `register-tasks.ps1 -PaperOnly`. **(9)** The
collector's first record is its earliest document; the fee alarm covers the
primary markets' categories. **(10)** The seed's builders live in
`scripts/paper-seed.ts` (type-checked and tested, never built);
`EMPTY_RULE_BOOK` and `CLOSED` in the tests; the kit's competition module is
no longer loaded. **(11)** 50 deliberate breaks of what decides or is frozen:
49 killed; the one left, an entry exactly at END, is equivalent (no fill at
or after END reaches `score`). **(12)** The lows done, but those skipped with
a reason in PAPER-BUILD's progress. **Checked:** the old-weeks reproduction
re-run equal line for line; `pnpm verify` green.

2026-11-12 (the paper experiment's two fresh reviews — the supervisor's calls
inside the approved plan, before the freeze): **BOTH REVIEWS SAY "AFTER
THESE FIXES"; ONE BATCH OF FIXES GOES TO PAPER-BUILD, THEN EACH REVIEWER
RE-CHECKS ITS OWN FINDINGS, THEN THE FREEZE.** PAPER-RULES-REVIEW
(`docs/reviews/paper-rules-review-2026-11-12.md`, `3e59dd3`: may freeze
after these fixes; 1 high, 5 medium, 14 low) and PAPER-CODE-REVIEW
(`docs/reviews/paper-code-review-2026-11-12.md`, `b4320cc`: after these
fixes; 2 high, 6 medium, 11 low); both found the same two faults first —
`look()` and its report are tested by nothing, and the look's Student-t
band is always about 0 (`2·normalUpper(z)`, not `2·(1 − normalUpper(z))`);
both confirm the blind gate, the collector equal apart from its
User-Agent, and MAIN's numbers recomputed equal. Their access scans: clean
(every collector path named was a grep or a stub). **The calls:** (1)
`look()` takes `daily()`'s `io`, and the look and its report get end-to-end
tests; the band uses the day-cluster error, as R14 says; (2) **the daily
page shows the latest look's MAIN verdict and sentence** (the owner's page
ruling); (3) **favourites:** lower-cased when read, checked at the freeze
(format, F0, no holdout, no duplicates), and a holdout favourite is
refused; (4) **every line promised at the looks is printed by `look`** —
STOP2, STOP5, DAYS7, the JUMP and NOTIONAL splits, COMP, the map's closed
copies, with and without gap copies — with MAIN's statistic (the mean net
per copy and its two-way error), **no verdict word for any line but MAIN**,
tested; (5) **a stock split:** the `stock-splits` events have never been
seen non-empty, so the rule needs no knowledge of their shape — a market
named by an event's numeric `instrument_id` (else every equity market) is
out of the primary cells on every UTC day its event is in the recorded list,
a copy of it open across such a day is unpriced, and both are counted,
printed and raised as an alarm on the page (the approved plan said "no split
on t's UTC day"; the build had made it "counted and flagged"); (6) **the
look reads nothing after its own end** (END_k), so a later exit never
reaches an earlier look; (7) **the bursts keep the owner's rule of 30 in 5 s
for all callers** (decisions 2026-11-07): the collector's burst becomes 15
and the experiment's 15 (the collector's measured peak is 12 in 5 s; its
share of 50 a minute is unchanged), tested; (8) `paper-freeze.cjs --final`
refuses a dirty tree and ties `dist` to HEAD; the paper deploy's smoke test
runs the copy's own gate; `register-tasks.ps1` can register the paper task
alone, without touching the collector's three; (9) the page is written after
the day's record; a backup failure and dropped records are visible on the
page; (10) the rule book before the collector's first record (2026-11-11
15:47Z; 11 documents so far, counted by the supervisor without reading
values) is the kit's `rulebook.json`, and a fee category missing from the
schedule raises an alarm; (11) the dead code in the frozen scope is deleted,
the seed's builders move out of `src/`, `start` and the rehearsal stay (for
re-running the old-weeks reproduction after a defect fix); (12) the
surviving deliberate breaks that touch what decides or what is frozen are
killed by new tests; (13) the low findings as each reviewer recommended
(the word "follow" off the page, R1's order enforced, R0's defect fix
means a new list, the entry price and F16(e) in the rules, R12 when the
error cannot be computed). Then a new draft freeze list, `pnpm verify`
green, and each reviewer re-checks its own findings against the fixes.

2026-11-12 (PAPER-BUILD's closing tasks — daily() end to end and the backup
task's time, the supervisor's two tasks before the rules review; commits
`6fa14d3`, `c40c4ea`, `7c6f978`): **A RUN'S OUTSIDE INPUTS ARE ONE OPTIONAL
ARGUMENT OF `daily()`; THE BACKUP TASK'S TIME IS COMPUTED FROM UTC.** **(1)**
`daily(config, log, stage, now, io)`: `io` holds the package folder, the
fetch and clock of the run's client, the rule book's documents and the run's
fixed inputs, each by default the real one (`src/paper.ts` passes none). Two
more than the fetch and package root the task named, because a unit test has
no database and because the kit's pool, markets and panel pin are the kit's
own data under its fingerprint, so a synthetic world cannot come in through
the package folder: the test takes the real `fixedInputs` from its package
folder and replaces only those three. The package folder now also gives the
kit, the experiment's files and the panel's pin (in production the same
folder as before, the program's own). **(2)** `test/paper-daily.test.ts`
drives `daily()` over a synthetic world — the gate's two refusals (no list;
a frozen file changed) with no request sent; a first run from 02:32Z paused
before 02:35Z, resumed at 04:00Z and equal, copy for copy and in its state,
to one run without the pause; a normal day (the list and the day's market
data only); a Monday's sweep; the trader's exits after the cut on every copy;
the log of every copy, the log's record, the page's five lines, the
positions page, the manifest and the backup — and kills 21 of 21 deliberate
slips in `daily()`'s glue. **(3)** The backup task: `Get-DailyUtcStart 5 20`
in place of the literal `06:20` (in memory today both store 05:20Z; a
registration on 2027-04-01 would store 04:20Z from the literal, 05:20Z from
the computed time); nothing registered. The draft freeze list again: 60
files, `d6698333f611133fa9388c86bcaa22f5c7252772128224445170caaaec436db4`
(only `dist/paper/daily.js` changed).

2026-11-12 (PAPER-BUILD's four questions — the supervisor's technical calls
inside the approved plan, before the freeze and before any week after the
cut is read): **THE BUILD STANDS AT "RULES READY"; ITS FOUR QUESTIONS ARE
RULED AS IT RECOMMENDED; ONE END-TO-END TEST COMES BEFORE THE RULES REVIEW.**
Checked on the supervisor's path: `pnpm verify` green at `51bf0a9` (32
files, 248 tests; `tsc` on src and test 0 errors); the tree clean; the
collector's run copy untouched (`dist\index.js` of 2026-11-11 21:22) and its
task Running, its recordings fresh; the access scans — every call naming a
collector path wrote code or docs, none read the recordings, the database or
the run folder; the only holdout name opened was the list `holdout.json`, no
holdout capture. The reproduction is equal to tables the supervisor had
re-priced with its own code (FIND-6-EXITS's 1,918 copies and X3's 1,366):
1,700 of 1,700 non-holdout copies with 0 difference, X3's held 24 h over
FIND-3's voted set +9.1 ± 13.7 (1,293). **The rulings:** (1) X3 needs no
per-copy file: equal by definition, to its printed digits and to FIND-3 for
1,104 of 1,104; (2) **the matched null's removal set is the line's accounts
at the entry's Monday** (fixed at M, no look-ahead), not FIND-3's
whole-study set, which cannot be defined going forward (296 of 1,203 old d
move, at most 40.2 bps); (3) **a Monday's label and habits come from the
fills before that Monday only** (the kit's index looked ahead through an
order event straddling M; 4 old rows of one account change); entries and
exits keep the whole fills; (4) the reproduction leaves out the 6 holdout
accounts' copies, which the experiment never opens. **Before the rules
review:** one test that drives `daily()` end to end with an injected fetch
and root over a synthetic world (the builder's own recommendation), and the
backup task's trigger computed from UTC like the paper's. The builder
reached its context limit once and compacted (peak 966k), so its Final
review goes to a fresh worker.

2026-11-12 (PAPER-BUILD's technical calls — the paper experiment's build,
parts 0–5 to "rules ready", inside the plan approved the same day; commits
`51724ca` … `08147f5`): **THE EXPERIMENT IS BUILT TO ITS RULES; NOTHING IS
FROZEN, DEPLOYED OR REGISTERED; THESE CALLS.** **(1) Where the rules live:**
the experiment's routes, schemas and the id-keeping parse are in
`src/paper/routes.ts`, not in the collector's `ROUTES` (the review's F4 wins
over the plan: every rule that decides what is read is frozen); the client
takes a route table, share, burst and User-Agent per instance —
`data-collector/1.0` (the poller, REST and WebSocket; its behaviour otherwise
equal, the night test's peaks 49 / 12 unchanged) and `data-reader/1.0`
(120 / 15); an HTTP error hands its status and body to the caller (a 400
"account not found" is a standing hole). `once.js` is deleted. **(2) The
stored fills** are per account (`fills\<addr>.json.gz`, the validated rows,
ids as digits), rewritten whole, not the plan's `fills\<run date>`: the
scorer takes one account at a time in bounded memory; the raw replies stay
the append-only record. **(3) The reads:** the schema alarm at more than 1%
rejected rows and at least 10 (1,000 stop the run at once), a read with a
rejected row applied only at the run's end without the alarm; the list's
safety cap 50 pages an account-day; five failed reads in a row end a run;
requests wait up to 120 s so a backed-off one is never dropped; a funding
row is filed under the hour its stamp falls in (equal to the kit's panel on
180 market-days). **(4) A Monday's label and habits come from the fills
before M only** (rules.md R5; the plan's R4 built them on the whole fills):
an order event whose fills straddle M changed 4 of 11,526 old rows (one
account's long share) the kit's way; the facts are then fixed once read and
cached exactly (F11) — the supervisor's question Q3. **(5) d's removal set is
the line's accounts at M** (the plan's R10), not FIND-3's whole study: 296 of
FIND-3's 1,203 d move, at most 40.2 bps — question Q2. **(6) The experiment
runs from its own run copy** (`deploy.ps1 -Program paper`,
`E:\polymarket-follow-run\paper\`), so a collector deploy never changes what
it runs nor waits for its run (F11); its task's trigger is 04:00Z computed
from UTC (stored `04:00:00Z`, checked in memory, nothing registered). **(7)
It backs itself up** after each run to `PAPER_BACKUP` on E: (Q-F): the state,
logs, manifests, looks, page, seed and pre-cut panel. **(8) The daily log
writes every copy's state each day** (gzip), not changes only (F18): the
honest record first; about 1 MB a day. **(9) Venue lines** are look-report
arithmetic outside rules.md (F18); MAKER and VWAP are not built (Q-D).
**Checked:** the seed equals the kit's `readAccount` fill for fill for 1,602
of 1,602 accounts (3,403 more rows: one account's ids above 2^53, which
R2-STYLE stored rounded through a double — the API's are exact); the market
object from the copied panel equals the kit's for 91 of 91 markets bit for
bit; live, pre-cut windows only (777 calls, 5,060 tokens, peaks 120 / 15):
20 accounts' week and 180 market-days equal row for row, 90 joined objects
bit for bit; the reproduction at END = CUT — FIND-6-EXITS 1,700 of 1,700
non-holdout copies equal with 0 difference (exits copied, held 24 h, D = 0;
the 218 others are holdout accounts, never opened), X3's 1,366 copies at its
printed figures (−9.9 ± 9.1; +9.1 ± 13.7; 1,104 of 1,104 per entry), FIND-3's
d 1,086 of 1,203 (the rest in hours of the holdout's trades), labels at 26
Mondays 11,525 of 11,526 pool rows, the main line 1,137 / 157 and 525 / 61;
the rehearsal's compute 12.6 s cold and 4.9 s cached; 45 of 45 deciding
mutants and 29 of 29 of the reads' killed. The draft freeze list:
`FROZEN.draft.sha256` `23f0e3434f3810781b5e30c98bfd8a0cee92ca1e5830b7ac12670932771f4fd4`
(60 files; the scratch deploy holds exactly them).

2026-11-12 (the paper experiment's plan approved — the owner, "yes approve,
lets proceed like that", on the supervisor's recommendation to approve the
plan with every fix of its fresh review and every recommendation; the
owner's aim, the same message: "final idea is to make profitable tool for my
purpose, to understand everything, have prof for that, and basically filter
all 'wrong and bad' and try to found the best results and confirm them"):
**PAPER-PLAN IS APPROVED WITH PAPER-PLAN-REVIEW'S FIXES; PAPER-BUILD BUILDS
IT IN PARTS.** Plan `docs/reviews/paper-plan-2026-11-12.md` (`55e3387`);
review `docs/reviews/paper-plan-review-2026-11-12.md` (`9aac35f`; may be
approved after the fixes named; its two code findings F5 and F9 confirmed by
the supervisor: the kit and lib-exits hold 0 CR bytes, and lib-exits'
`planCopy` compares with the cut at its lines 37 and 45). **The rulings:**
the plan's eleven questions as recommended — Q1 the 24 h cost map is not in
MAIN (its closed cells printed apart); Q2 the whole pool read once a week;
Q3 a cap of 10 pages an account-week for accounts off the lists, with a
safety cap for list accounts; Q4 the code in `apps/poller` (a second entry
point) with the kit and lib-exits vendored byte for byte; Q5 the owner's
favourites count from the freeze, not from the cut; Q6 five lines on the
daily page, the rest at the looks; Q7 as the review's Q-B: **Finotive is
shown only as its rule against copying (help article 955, terms §7.10) and
its cost facts, with no result line and nothing on the daily page**; Q8 the
exams of 2026-11-30 and 2026-12-19 are closed (nothing registered) and
2026-12-19 is the experiment's first look; Q9 and the review's Q-C: D1 and
D2 run after the freeze, with their own budget share; Q10 the experiment's
share of 120 tokens a minute and 15 in 5 s; Q11 the first keep or drop ends
the test — and the review's Q-A one weekly loop for the first run, a missed
day and Mondays (list accounts uncapped, resumable, the figure by formula),
Q-D MAKER and VWAP a separate sub-part that may join later as its own arm
and never delays the freeze, Q-E the freeze hashes what runs and tags its
commit, Q-F the pre-cut panel and the seed copied into the experiment's
folder, checked by manifest and backed up, Q-G when KEEP and DROP both
hold, DROP wins. Every finding F1–F18 is folded into the build and its
rules. **Also:** requests to outside services carry a generic client name
(code-rules, 2026-11-12): the client's User-Agent becomes an option, the
experiment passes a generic one, and the collector's constant changes too
(deployed with the experiment by the owner); `once.js` is deleted. **The
gates:** nothing after the cut is read, and the code refuses it, until
`rules.md` is final, a fresh rules review says "may run" and the supervisor
records the frozen hash here; nothing is deployed or registered without the
owner, who registers the experiment's task.

2026-11-12 (the paper experiment runs daily and gets a page — the owner, "i
think it is better to make some page where i can test that paper in real
time", then, on the supervisor's two-step proposal, "ok, agree, add it"):
**THE EXPERIMENT'S SCRIPT RUNS ONCE A DAY, NOT ONCE A WEEK, AND A SIMPLE
LOCAL PAGE SHOWS ITS LOG.** The page, read only: every paper copy (trader,
market, the follow instant, the price after the delay), which are open and
which closed, the running result per line and per trader with its error
band, and "too early to judge" until each look — keep or drop appear only
at the three looks (2026-12-19, 2027-02-06, 2027-05-08) and are verdicts on
the test, never instructions to trade. Why daily and not live: reading
about 160–330 accounts every half minute would not fit the operating budget;
once a day is cheap. The rules stay frozen whatever the page shows. Live
alerts and live paper copies for the owner's favourites come with v1's app
(its plan stays planned for early December), on the same page. PAPER-PLAN
adds both to its plan: the daily run's budget, where the page lives, how v1
reuses it.

2026-11-12 (APPROACH-REVIEW accepted — the owner, "ok, agree with all
recommendation", on the supervisor's seven recommendations after the Final
review): **THE FORWARD PAPER EXPERIMENT FOLLOWS SLOW TRADERS BY A RULE, NOT
A RANKING, WITH TWO READINGS OF EVERY COPY; ITS PLAN COMES NEXT.** Report
`docs/reviews/approach-review-2026-11-12.md` (`1924799`; its own Final
review `dcf6d21`…`ebf3d03`: F1 high, the main line's rate was taken without
its own minimum of closed cycles, corrected). **The supervisor's own path:**
X3 re-priced with independent code, all 1,366 copies equal; the main line's
counts re-counted from the pool's entries, equal to FR1 (525 copies in the
last 4 weeks before the cut, 131 a week, 61 traders; with a minimum of 3
closed cycles 284 a week, 157 traders; every directional entry 936 a week,
326 traders); a rough scaling of X3's error agrees with the corrected
visible edges; both access scans 0. **The design, as accepted:** who — the
kit's frozen pool, the 100 holdout accounts left out, an entry counting when
its account is labelled directional on the 14 days before the entry's
Monday; the main line — traders whose median hold over the 30 days before is
6 h or more **with at least 3 closed cycles** (question 7), the 10-cycle line
printed beside; what — openings and flips in the primary cells, every hour,
$1,000 a copy at t + R8's delay at a taker's costs with funding; two
readings — the money with the trader's exits copied (FIND-6-EXITS's rule)
and the judgement, d at 24 h against the exact matched null; the data from
the cut, 2026-11-07T00:00Z, with the rules frozen before anyone reads those
weeks; looks at 2026-12-19, 2027-02-06 and 2027-05-08 with the false-pass
budget spent 0.5% / 1.5% / 3%; **keep** when the money's lower bound is
above zero and d is above zero, **drop** when the money's upper bound is
below **δ = +10 bps a copy** (the owner's, on the recommendation), otherwise
too few to tell — verdicts on the test, never instructions to trade; beside
it, deciding nothing: every directional entry (a clear answer on copying
everyone by about 12 bps at the first look), the 10-cycle line, maker
entries with a fill model, stops and a 7-day limit, day-holders, "after a
jump", and **the owner's own favourites**, frozen at the start and judged
whole; the pool only (the wider universe a later arm); **first a weekly
script**, v1's paper log reusing it later. What it can see, with 10 cycles:
about 54 / 33 / 21 bps a copy at the three looks (with 3 cycles more copies,
its noise not yet measured); with no skill "drop" is likely by February or
May. Not run: measuring the 3-cycle group's noise on the seen weeks (the
forward data will show it). **Next:** a plan subagent writes the exact
rules and the build (reading fills past the cut within the budget, the
prices from 2026-11-07 to the collector's start, the kit's pricing past the
cut, one cost line per venue the owner named — Finotive, Binance futures,
Polymarket — from their official pages), a fresh review of the plan, the
owner's approval, the build; the exams of 11-30 and 12-19 and the dated
checks D1 and D2 are ruled in that plan.

2026-11-12 (the way forward — the owner, after FIND-6-EXITS: "yeah, we will do
paper experiment, just want to talk little bit more about everything before i
move on that implementation. i simply want to be sure that i've found
initially the best possible cases and scenarios for use"; then "yeah, let's
do that new search then … also let require from agent to help us to find a
right approach and way of using of this … now we need to understand how to
'handle them' and beside what we know to found 'balance' and find right
combination … please run that agent"): **A FORWARD PAPER EXPERIMENT IS THE
WAY FORWARD; FIRST ONE RESEARCH SUBAGENT, APPROACH-REVIEW, FINDS THE BEST
DESIGN FOR IT.** The owner accepts losses as part of the game; what counts
is that the money won exceeds the money lost. APPROACH-REVIEW (Opus 5.5,
max; brief in the supervisor folder) reads every result so far and answers:
(a) the outside evidence on copy trading, from primary sources — when, if
ever, following has paid and why services that sell it can thrive while
copiers lose; (b) the six untested directions the supervisor named the same
morning — traders who hold for days with their exits copied; cheaper
entries (limit orders, a maker's costs); the later batch's three candidates
("after a jump", the counter-move before agreement, the top accounts' long
holds); what more weeks of the collector buy (the smallest edge a test could
see, month by month); using the data other than by copying (crowd
positioning, liquidation waves), watch-only; prediction-market traders —
each with whether our data can test it now or needs new weeks; (c) **how to
handle the known limits — the balance and the combination** (the owner's
ask): who to follow by a filter fixed in advance, how to copy (exits,
holds, which markets and hours, an entry worth copying only when its usual
move covers its costs), the costs to assume, limits on losses, how long the
experiment runs and the rule by which it is judged, and what each outcome
would mean. **Exploring on the weeks before the cut is allowed and counted:**
each exploration is written down with its reason before it runs, its
numbers are labelled exploring, and nothing on those weeks decides — the
forward experiment, on weeks nobody has seen, is the test. The blind store,
no API calls, never the collector's recordings, database or run folder.
Never personal trading advice: it recommends research and experiment
designs and what the app shows, never what to trade. The exams of 11-30 and
12-19 and the dated checks D1 and D2 are ruled with the experiment's plan.
Then: the experiment's plan, the owner's approval, the build.

2026-11-12 (FIND-6-EXITS's result — the supervisor records the exploring
check; it decides nothing, and the way forward stays the owner's): **COPYING
THE TRADERS' EXITS TOO DOES NOT MAKE ANY GROUP PAY: EVERY GROUP STILL
LOSES.** Report `docs/reviews/find-6-exits-2026-11-12.md` (`4f2a567`; one
run 2026-11-12 08:38:07–08:38:09Z; FROZEN `9aea7d09…`; its plumbing check:
held 24 h equal to FIND-6's `netBps` for 1,918 of 1,918 copies). **The
supervisor's own path:** an independent re-pricing of all 1,918 copies
(`verify/FIND-6-EXITS/reprice.mjs` in the supervisor folder: the exits walked
from the kit's order events, priced in one pass as R8's `mirroredReturn`,
not as a sum of legs) equals the worker's for every copy to 5e-13 bps, with
the same open-at-the-cut flags; page one's group means rebuilt from it;
both access scans 0. **Per copy, ± one error by trader:** every candidate
−15.8 ± 4.9 bps with exits copied against −13.0 ± 10.1 held 24 h (paired
−2.9 ± 9.5); the owner's filter's top fifth −23.9 ± 11.5 (held 24 h −53.0),
its rest −13.7 ± 5.7 (−2.6); top − rest −10 ± 13 bps (exploring p 0.43);
much of the top fifth's gain is one account (`0xc58a5ade…`; without it +13
± 19 bps instead of +29); rule 4's top fifth goes from +21 to −18; no rule's
top fifth is above zero. The traders leave fast (median 47 min; 44% of
copies within 30 min): before costs the copies lost 5.4 bps, a round trip
costs about 10.4. An instant follower (D = 0) loses 16.6: the ~80 s delay
costs nothing measurable here. A liquidation closing the whole copy changes
no group by more than 2.5 bps. 20 copies open at the cut (−575 bps on
average; without them every candidate −9.9), 0 unpriced, 0 crossing a gap
in the capture. With R8's −20.23 bps for its 50 traders with exits copied
(decisions 2026-11-09), the two measurements agree: on these weeks,
copying exits did not rescue copying. **Noted for later (FIND-6-EXITS's
questions, as recommended):** "copy the exits of disciplined traders" only
as a later batch on new weeks with its rules first, copies under about 5
minutes priced by the second (19% of copies here); a forward paper log keeps
both readings of every alert, as R3 already plans (the fixed horizon for
the judgement, the copied exits for the money) — the owner's call when the
way forward is planned.

2026-11-12 (the exploring check's Q1, before any outcome is seen — the
supervisor's correction of its own wording, within the owner's "Yes, run the
check"): **A PARTIAL LIQUIDATION CLOSES ITS SHARE OF THE COPY, NOT THE WHOLE
COPY.** Point (2) of "an exploring check: FIND-6's copies with the trader's
exits copied" said "all of it on a close, flip or liquidation"; the rule it
cites, R8's "mirrored_money", says "all of it on a close or flip", and the
kit's `buildEntries` gives a partial liquidation its share. The words "or
liquidation" were the supervisor's slip; FIND-6-EXITS found the conflict
before pricing anything (no copied-exit number was computed: its plumbing
check only, 2026-11-12 08:32Z, held 24 h equal to FIND-6's `netBps` for 1,918
of 1,918). Why the share: it is R8's rule, so the result compares with R8's
−20.23 bps; a follower at the trader's leverage is cut by the same share.
Beside it, deciding nothing, one line per group where every liquidation fill
closes the whole copy (115 partial liquidations fall in 79 copies of 39
accounts; 15 whole ones close the copy under either reading). Also accepted
as FIND-6-EXITS fixed them before any outcome: the hold is each copy's
share-weighted mean hold (median and quartiles; the time to the last leg
beside); a gap copy is a chain break after the entry's first event up to its
last exit used (to the end of the data while the trader is open); the
entry-weighted top minus rest is a top indicator's coefficient clustered by
trader (CR1, G − 1 degrees of freedom); a leg marked at the cut ends at
CUT − 1 ms, the panel's last minute (2026-11-06T23:59Z), funding of hours in
(tIn, CUT − 1 ms] only.

2026-11-12 (an exploring check: FIND-6's copies with the trader's exits
copied — the owner, "Yes, run the check", 2026-11-12 ~08:05Z, on the
supervisor's recommendation after FIND-REVIEW-6's F6): **FIND-6-EXITS
RE-PRICES FIND-6'S COPIES SO THAT EACH ONE LEAVES WHEN THE TRADER LEAVES; IT
DECIDES NOTHING.** FIND-6's weeks were looked at once already, so this is
exploring: logged, never registered, never a reason to re-run FIND-6 or to
try other numbers for the owner's filter on these weeks; a forward paper
test or a later batch on new weeks decides. Why the studies held a fixed
24 h (told to the owner the same morning): the random-trade yardstick must
be held the same way; a trader's exits can fake a win rate though never
money (R3's disposition trap); 1 and 6 h cannot pay a taker's costs (ruling
(5) of "RESEARCH-KIT accepted"). R8 printed copied exits once, as money, for
its 50 traders: −20.23 bps a copy [−42.23, −2.91], against −16.60 for its
fixed hold (`docs/reviews/r8-pretest-2026-11-09.md`). **Fixed before any
outcome is seen:** (1) **the copies:** FIND-6's deciding line, the same
1,918 entries of the board's candidates in both windows
(`F:\polymarket-follow-research\FIND-6\look-entries.jsonl.gz`), each entered
at its own follow instant t + D, priced as FIND-6 priced it (the kit's
`leg`, the taker setting); (2) **the exit, R8's mirrored money** (decisions
2026-11-09; R8's rules.json "mirrored_money"): each REDUCE, CLOSE, FLIP or
forced event of the trader on the entry's instrument and side after its
first fill (the kit's `buildEntries` exits) closes that share of what is
still open of the copy (all of it on a close, flip or liquidation), at the
event's first fill + the entry's own D; adds are not copied; a re-open
merged inside the 60-s window does not re-open the copy; the copy's result
is the share-weighted sum of the kit's `leg` from t + D to each exit instant
(fees on both legs, spread and depth at each instant, funding on what is
still open); (3) **the cut:** a copy still open at 2026-11-07T00:00Z, or
whose exit instant falls at or after it, is marked at the last mark the kit
serves before the cut with the exit's costs, and flagged; nothing at or
after the cut is read; an unpriced copy (a missing mark, the funding-hour
rule) is counted, never guessed; (4) **the groups:** each of the seven
rules' top fifth and its rest exactly as FIND-6's look formed them
(`result.json`, `board.tops`), and every candidate alike; (5) **printed per
group:** traders, copies, copies open at the cut; the follower's net per
copy with exits copied (the mean over copies, each alike, with its CR1 error
by trader); the same copies held 24 h, which must equal FIND-6's `netBps`
(the check of the plumbing); exits copied minus 24 h, paired; the win share
and the average win against the average loss (exits can flatter both, R3);
the median hold; and beside: the gross before costs, the same exits at D = 0
(what the delay costs), the closed copies only, without account 0xc58a5ade…
(FIND-REVIEW-6, F2–F3), without copies whose exit chain crosses a gap in
the capture (F5); and per rule the top minus the rest (Welch on the traders'
means, and the entry-weighted difference with CR1), every p labelled
exploring; (6) **how:** Opus 5.5, xhigh; tested on synthetic cases (R8's
mirrored-money test among them), the scripts frozen by hash before the one
run; the report `docs/reviews/find-6-exits-2026-11-12.md` with a plain page
for the owner; the supervisor re-prices a seeded sample of copies on its own
path instead of a Final review, since nothing is decided. Never advice.

2026-11-12 (FIND-6's result — the supervisor records the report and its Final
review; the way forward stays the owner's): **FIND-6 FAILS: NO RANKING RULE,
THE OWNER'S FILTER INCLUDED, PICKS TRADERS WHOSE NEXT WEEKS A FOLLOWER COULD
USE.** Report `docs/reviews/find-6-2026-11-12.md` (one look, 2026-11-12
01:57Z); Final review `docs/reviews/find-review-6-2026-11-12.md` (Sonnet,
independent code: every line, the race, the owner's table and all 2,009 copies
rebuilt from the raw fills — equal; the result stands with seven corrections
of wording). The race's smallest adjusted p was 0.112 (rule 3, the wrong way);
the owner's filter (rule 7): adjusted p 0.55, its top fifth −53 bps a copy
against the rest's −3, within chance; its eligible accounts −8 against −19,
within chance; copying every candidate lost about 13 bps a copy (about the
cost of a round trip, 10.2 bps). Not registered; the lift of decisions
2026-11-10 (2) ends here. **What the "no" covers (the Final review):** the
race could see only a large gap — about 65–95 bps a copy for most rules and
about 150 for the owner's filter (F1); the "worst run" column is mostly one
market event (one account's six long copies on 2026-11-04, F2); and every FIND
study judged **entries held a fixed 24 hours**, never a follower who also
copies the trader's exits — so a trader's discipline in cutting losers was not
tested (F6), a candidate for the owner's forward paper experiment or a later
batch.

2026-11-12 (FIND-6's rules review; two rulings fixed before its look — the
supervisor, on RULES-REVIEW-6's recommendations, within the owner's stated
intent for the filter): **THE OWNER'S FILTER COUNTS A LOSER STILL OPEN AT THE
WINDOW'S END; ITS TOP FIFTH IS PRINTED ALSO AS A FIFTH OF THE ELIGIBLE.**
Report `docs/reviews/find-6-rules-review-2026-11-12.md` (RULES-REVIEW-6,
Sonnet, a different model from the study's): FIND-6's rules are fixed, blind
and frozen, the code does what they say, the race keeps its size (re-run in
harsher null worlds: 4.9% and 3.8%); verdict "may look after these fixes"; no
high finding. **(M1) Rule 7, the owner's filter, scores every cycle still open
at the formation window's end as closed at that instant's mark, with a closing
taker fee** — an account that carries its losers open must not score as
disciplined (the owner's words: "more disciplined"); rule 6 stays as entry 6
writes it. **(M2) Rule 7 keeps the race's common k** (a fifth of all
candidates, so about half of its eligible accounts); printed beside, deciding
nothing: the filter's eligible accounts alone, and its top fifth of the
eligible (k = round(eligible ÷ 5)); a test pins k to the candidates. The
owner's page states that a "no" means "no difference large enough for these
weeks to see" (FIND-6 sees about 0.4 risk units, about 62–68 bps) and shows
each rule's top minus the rest with its error and its adjusted p. A run that
crashes before `result.json` exists is not a look. Every other finding
(M3–M5, L1–L13) is fixed by FIND-6 as the review recommends before it freezes
again.

2026-11-11 (entry 6 runs with the owner's filter — the owner lifts the gate for
one study, on the supervisor's proposal): **ONE MORE FIND STUDY, FIND-6: A RACE
BETWEEN RANKING RULES, THE OWNER'S "DISCIPLINED TRADERS" FILTER AMONG THEM.**
The owner ("yeah, let's do that. let try to filter, i really want to see
numbers"): decisions 2026-11-10 (2) stopped ranking traders when entry 1
failed (decisions 2026-11-11, round 2's FIND results); for this one study the
owner lifts that stop. Entry 1 tested whether a trader's past *follower result*
predicts the next weeks; entry 6 tests other ranking rules. **FIND-6 is entry 6
as IDEAS-REVIEW Appendix A writes it** — formation windows of four weeks ending
2026-10-10 and 2026-10-24, each measured on the two weeks after; the top fifth
against the rest by mean d; the best rule judged against the resampled best,
so choosing among the rules is paid for — **with a seventh rule, the owner's
filter:** eligible are accounts with a long, active history (a minimum of
closed positions before the formation window ends and activity in most of its
weeks, whatever the account's size), ranked by discipline (wins against losses
after fees, per dollar traded, with the depth of losing streaks) — its exact
formula written into FIND-6's rules before any outcome is seen. Every ruling
of 2026-11-11 applies: the notional board decides; d at 24 h against the exact
matched null, the class horizon beside; A.0-6's two p-values, the larger
deciding, the entry-weighted CR1 beside; risk units, short windows apart; the
competition strict; the kit's fingerprint pinned. **Printed beside, deciding
nothing, so the owner sees the numbers:** for each rule's top fifth, the
follower's net result per entry at a taker's cost and the delay of R8's
rule, its win share, its average win against its average loss, and its worst
losing streak. The same order as before: rules first, a fresh rules review,
the supervisor's go, one look, a Final review. If FIND-6 passes, its rule goes
to the exams of 2026-11-30 and 2026-12-19.

2026-11-11 (round 2's FIND results — the supervisor records the reports and
their Final reviews; the owner has read them; the way forward is the owner's,
still open): **NOTHING PASSES FIND: NO ENTRY IS REGISTERED, SO ROUND 2'S
EXAMS HAVE NOTHING TO CONFIRM.** Seven studies ran on 2026-11-11 on data up to
2026-11-07, each with rules frozen before one look and read first by a fresh
reviewer (decisions 2026-11-11, the FIND rules review); three fresh Final
reviewers (FIND-REVIEW-A, -B, -C) recomputed every deciding statistic with
their own code and found no error that could hide an effect; every result
stands (corrections marked in place). **Entry 1, the gate** (`find-1`):
directional traders' follower result in odd weeks does not predict their
even weeks (99 traders, 7,252 entries; Spearman 0.066, permutation p 0.51;
it could see a spread of about 46 bps) — so, by decisions 2026-11-10 (2),
**entry 6 does not run and ranking traders stops for now, to be reopened
after six more months.** **Entry 2** (`find-2`): the top accounts' followable
share 0.21, not shown below one half; two accounts' multi-week shorts carry
about half of list (c)'s profit; of R8's 50, 49 banked a loss together in R8's
weeks and #47 made 81% of its profit within two minutes of a fill. **Entry 3**
(`find-3`): slow traders at 24 h about zero (951 entries; p 0.53 / 0.88).
**Entry 4** (`find-4`): no kind of entry passes Holm over eleven; the nearest,
"after a jump", is an unexplained near miss (a candidate only). **Entries 5
and 10** (`find-5-10`): no news in the first 60 s; R8's US-open cell is gone
with the exact matched null (R8's −38.35 came from its own-direction null).
**Entry 7** (`find-7`): joining an algorithm after its fifth taker order loses
about 10 bps at a taker's cost; its busiest accounts the same. **Entry 9**
(`find-9`): no sign of an effect from unlinked traders agreeing. Entry 8 was
left out by ruling. **Candidates for a later batch, on new weeks, nothing
now:** "after a jump" (FIND-4), the counter-move before agreement (FIND-9),
the top accounts' long holds (FIND-2). **For the kit before any later batch**
(the Final reviews): a funding hour without a mark must not drop a gross
result; one random-trade placebo function drawn at least 1,000 times; unique
entry ids; the trader test where the same traders stand in both halves; the
rule written three times across studies moved into the kit; d's limit (a
one-sided trader on its usual side scores only timing inside the hour) in the
rule book. **Open, the owner's:** the way forward — among a small forward
paper experiment, a pause with the collector recording, a later batch, or
stopping — and with it the exams of 2026-11-30 and 2026-12-19 and the dated
checks D1 and D2.

2026-11-11 (entry 5's yardstick — the owner, on RULES-REVIEW's and the
supervisor's recommendation): **IN ENTRY 5, R8'S DRAWN TRADES ARE COMPARED IN
THEIR OWN DIRECTION.** The owner ("i agree with your recommendation"):
reading (10) of the entry "the FIND rules review" is ruled — entry 5's
deciding line compares each entry's 60-second mark move with R8's three
drawn trades taken in the side those trades really took; the matched
direction (a coin at the trader's long share) is printed beside, deciding
nothing. Why: within a minute any taker order moves the mark its own way, so
against a coin the line would only show that the 50's entries are orders
(1,089 of 1,241 entries), not that they carry news. This is the one exception
to ruling (1) of "RESEARCH-KIT accepted" (the matched null as round 2's only
yardstick), and it holds for entry 5 alone; every d-based entry keeps the
exact matched null.

2026-11-11 (the FIND rules review; one reading for all seven studies, fixed
before any look — the supervisor, on RULES-REVIEW's recommendations; the
yardstick of entry 5 waits for the owner): **SEVEN STUDIES HAVE WRITTEN THEIR
RULES AND NONE HAS LOOKED; A FRESH REVIEWER READ THEM; THESE READINGS HOLD FOR
EVERY STUDY.** Report `docs/reviews/find-rules-review-2026-11-11.md`
(RULES-REVIEW, Fable): every tool call of the eight transcripts listed, no
look output anywhere, the kit `2d3667b5…09aa` intact in all seven folders,
every recorded hash equal to its files; no study "must not look yet"; three
high findings (FIND-7's and FIND-9's populations, entry 5's yardstick).
**(1) A.0-8, "competition only":** a FIND pass must hold again without the
competition's days and again without its boosted markets — the finding's
sign on every deciding estimate and an uncorrected p below 0.05 — and the
exams use the same sentence. **(2) A.0-11 with two estimates:** a hypothesis
points FIND's way, or the other way, only when both estimates (day means and
trader means) do; a split stays OPEN. **(3) FIND-1's fifths:** "beats" means
a difference above zero, the p-values printed beside. **(4) The deciding
population is the all-time notional board** in every test of how accounts'
entries, events or runs did; the whole pool is printed beside (accounts that
entered through profit boards were chosen partly on the moves being scored).
FIND-7 and FIND-9 re-count and re-freeze. **(5)** FIND-3's placebo on real
markets and FIND-7's placebo dry run were not looks (neither uses an entry's
side; the expected d is zero by construction); each counts as one logged run
(A.0-15); FIND-7 deletes its dry-run file before its look. **(6) A risk unit
on a short window** (decisions 2026-11-11, Q7): "under 7 days" means under
10,080 starts, and a unit of zero is no unit, everywhere. **(7) CONFIRM
populations follow each entry's letter:** a list frozen and judged whole for
entries 1, 3, 7 and 10; a frozen list whose label is re-read each Monday for
entries 4 and 9 — for both, the notional board's accounts with a directional
week since the launch (FIND-4's 539-account list, `8889dc8a…`); FIND-3's 29
accounts judged whole, its weekly rule printed beside. **(8) The long share
at CONFIRM** is taken as in FIND, each Monday. **(9) Placebos and
leave-one-out** keep each study's regime; every draft register entry states
on its first line what they showed. **(10) Entry 5's yardstick:** RULES-REVIEW
recommends that the drawn trades' own direction decide (a coin at the long
share tests only that the mark moves with any taker order — 1,089 of 1,241
entries); that departs from ruling (1) of "RESEARCH-KIT accepted", so it waits
for the owner. **(11) Places in m** are weighed at the freeze (entries 1, 2, 3
and 9 see only large effects; entry 5 is a minute no follower can act in).
**(12) Every look stops unless the kit's fingerprint equals the frozen
value** (`checkKit()` alone checks the kit only against its own list).
**Entry 7** is registered only if its doubled-cost net mean is also above
zero. Each study fixes its own findings, writes its hashes again and reports;
the supervisor checks them and gives each its go.

2026-11-11 (COLLECTOR-REVIEW's calls — the Final review of the whole
collector, COLLECTOR-PLAN §1.8; its findings and questions are in the
supervisor folder's `workers/COLLECTOR-REVIEW/progress.md`, its fixes the
commits from `62d4d56` on, each named "COLLECTOR-REVIEW F…"): **THE
COLLECTOR STANDS AS BUILT; NO FINDING IN WHAT IT RECORDS; THESE CALLS.**
**(1) The poller task runs at normal priority (4).** At Task Scheduler's
default, 7, a task runs below normal
(Microsoft, TaskSettings.Priority, read 2026-11-11), and on 2026-11-11
between 11:09Z and 14:38Z the books came 7–20 s late in 14 spells while
builds and research loaded this PC: the trades frames were late in the same
seconds, one of the poller's own timers fired 2 s late, and by the server's
`ts` no second was missing. One experiment (17:00:44Z, 16 busy threads for
8 s) made the same picture: no book line for 7 s, then 561 in one second.
So the "stall of the connection" COLLECTOR-BUILD recorded was this PC's
(external-apis, corrected in place). `tools\register-tasks.ps1` carries
`-Priority 4` for the poller task only; it holds from the owner's re-run and
the poller's next start. **(2) A connect that fails is "connect failed", not
a server close:** only the close of an open connection becomes a rule-book
`connection_drop`, so an outage of our own network no longer writes
maintenance marks into the rule book; and a book frame that fails its schema
still counts as a frame of its market — kept raw, it neither stalls the
market nor restarts the connection (after a change of the frame's shape
every market looked stalled, and each restart's wait lost the frames it
skipped). **(3) The poller starts without the recordings' disk**
(COLLECTOR-PLAN §1.7's row made true at start: lines dropped and counted,
the database part runs) **and starts its jobs before
the first market list is read** (a list that cannot be read no longer holds
back the passes). **(4) The heartbeat's `lastFrameAt` of a connection is its
last frame of any kind, a pong too** — the watchdog's own measure — so
`status` shows no WATCH on a quiet trades connection. **(5) The backup**
writes into and removes only a folder that holds nothing but a dump (the
recordings' day folders carry the same names; a date folder that is not a
dump's fails the run), runs its dump through a pipeline (a write error is
its FAILED line, not an uncaught error), and a restore that fails drops the
database it began. **(6) Left as built, each a question for the supervisor**
(the closing message of COLLECTOR-REVIEW): the boards' `consistent` flag
(false on nearly every board by construction — recommended: drop it once the
first night's boards confirm); no mark for books that arrive late in a burst
(recommended: one coverage line a late minute, with the event loop's delay;
the 15 s watchdog unchanged); `once.js` (a second client beside the live
poller — recommended: delete it after the first full pass is verified); the
first-list loop beside the instruments job (the list is read twice at each
start; the plan fixed "retried with back-off"); `Store.close()` waiting for
its queue (only a graceful stop waits, 10 s for each write still queued; the
task's stop is a kill); and COLLECTOR-PLAN §1.7's "a kind failing whole for
a minute is a PROBLEM in `status`", which nobody built — `status` prints the
counts (recommended: with v1's Status page, where every row gets a state).
**(7) Tests added:** the whole night on fake timers through the real client
(the peak is 49 tokens in a minute and 12 in 5 s, so admission never holds a
page; each pass's slot and catch-up window pinned, which no test did), the
backup's Sunday branch, its E: copy and its rotation's guard, the clock
WATCH's log lines, the stall check's rules, and seven rules that had
survived a sample of 38 mutants. The built program was also run with no
network (its `fetch` and `WebSocket` replaced, its clock shifted): the
passes of a whole night, a missing disk, an unreachable database, frames of
a changed shape. `pnpm verify` green: 25 files, 171 tests.

2026-11-11 (the kit's additions accepted; the risk unit on a short window —
the owner, on RESEARCH-KIT's recommendation): **EVERY FIND STUDY IMPORTS THE
KIT `2d3667b5…09aa`; A RISK UNIT ON A SHORT WINDOW IS PRINTED APART.** The
report's "Addendum 2 (2026-11-11)" (`2207b95`) adds to the kit, each with one
definition, tests and killed mutants: A.0-4's d (`dAgainstNull`, the caller
naming whose trades the null leaves out), A.0-5's risk unit (`riskUnit`, 1,
6, 24 and 72 h over the 30 days before the entry), entry 7's runs and entry
9's agreement events (moved from scripts, counts unchanged: 3,182 and 188),
the map frozen in `kit/data/m8-map.tsv` with `mapOpen`, the entry-weighted
mean with CR1 errors (decisions 2026-11-11, RESEARCH-KIT accepted, (6)), and
the competition window with its boosted markets; the proof's numbers are
unchanged byte for byte; the supervisor re-hashed the kit (33 files) and the
map. **Q7 (the owner: "i agree with your recommendation for Q7"):** a risk
unit uses the minutes its 30-day window holds, with that share printed; an
entry with under 7 days of starts in the window, or none, is left out of the
line read in risk units and printed apart with its bps (67 of 10,612 P1
entries at 24 h). **Q8 (the supervisor's call):** the competition's boosted
markets in the kit (ids 97, 22, 26, 89) are compared with the collector's own
rule-book read of the competition (the nightly 23:15Z pass) before the
freeze; a difference is a kit change and a new fingerprint. No extra read.

2026-11-11 (COLLECTOR-BUILD's technical calls — the collector's build,
parts 0–6, inside the plan approved 2026-11-10; the supervisor's answers to
its questions Q1–Q6): **THE COLLECTOR IS BUILT AS PLANNED, WITH THESE
CALLS.** Commits `ab8a4ef` … `0defe9a`; plan
`docs/reviews/collector-plan-2026-11-10.md`. **(1) The plan's deviations
D1–D14 hold as built** (its §1.6 table): no Turborepo; the schemas in
`apps/poller`; no node-cron (one admission queue); Node 24's own WebSocket;
the tasks at start-up outside the session (S4U), no launcher (made true by
(5)); a run copy refreshed by `tools\deploy.ps1` after `pnpm verify`; raw
replies kept beside parsed records; the call lines in the REST files;
streams and replies in Brotli files on F:, MongoDB for what is queried;
Node's `process.loadEnvFile`; no CI yet; PowerShell and CommonJS tools
beside TypeScript; 16 boards; no notifier. **(2) Versions,** each the
newest at least 14 days old on its registry within the plan's majors (and
pnpm's `minimumReleaseAge` of 14 days for the rest): typescript ~6.0.3
(typescript-eslint 8.72 supports below 6.1), zod 4.6.7, pino 10.4.0, vitest
5.0.5, eslint 10.13.0, typescript-eslint 8.72.1, prettier 3.9.10,
@types/node 24.19.2, **mongodb 7.7.0** (7.8.0 was 11 days old; compatible
with MongoDB 8.x and Node 24). **(3) Q1 — the last market list is kept**
in `var\markets.json` and the streams open from it when the first read
fails or is paused, so a start inside the lab's nightly window records
books at once; this reverses one item of the plan's cut ("the stored
market list at start"). **(4) Q4 — the grant:** Task Scheduler gives a
task's own user read only, so `register-tasks.ps1` grants the registering
account read and execute on the poller task; Task Scheduler's restart on
failure looks at no exit code (it retries a start that fails to launch), so
the check task restarts a crash as well as a hang. **(5) Q5 and Q6 — the
poller is stopped through Task Scheduler, and its task runs node.exe
itself:** a normal session can neither read an S4U task's command line nor
open its process, so `deploy.ps1` and `poller-check.ps1` stop the task
(IRegisteredTask::Stop, allowed by read and execute) and wait for the
lock's pid (`tools\poller-task.ps1`). The deploy of 11:27Z showed that the
stop ends only the process the task started (cmd.exe ended, node outlived
it), so `run-poller.cmd` was removed: the action is node.exe by its
absolute path, resolved at registration, and the four settings moved into
**`tools\poller.env`, committed because it holds no secret** (folders and a
database on this PC), copied as the run copy's `.env`. A deploy first starts
the new copy without settings and requires exit 2; the crash handlers are
set before the lock, so a crash at start leaves its last words in the
poller's own log. The owner switched once, elevated (15:46–15:48Z, a 60-s
gap); every deploy since ended node within 1.1 s, gaps 3–4 s. **(6) The
passes and the client:** the board pass paces 1.35 s a token (at most 45
tokens in any minute), reads pages one at a time with 3 tries spaced by the
client's back-off, sends no page after 23:59:30Z, and after a restart inside
its window reads only what the date does not hold; a pass whose whole window
fell in a gap is a `pass_missed` line; the client drops a request whose turn
in the queue came after its deadline. `consistent` (page stamps within 10 s)
is mostly false: pods serve snapshots of different ages, so no pacing makes
a board one snapshot; the flag and the stamps record it. **(7) The rule
book** keeps the market list (whole, on change), fees, competition dates
and boosts, splits, the exchange marks and each server close of a
connection; a settlement's price and debit are left out (values, A.0-9).
**(8) Part 5** as the plan says: C: warns under 15 GiB and stops our
database writes under 6, the recordings' disk warns under 50 and stops the
book and trade lines under 10 (the streams kept for the watchdog); the
clock watch from the books; the boards' `stale` flag (a page over 5 minutes
old at read, 10 for `all`, or the top 100 the day before's); `status` reads
files only, never a recording. **(9) Part 6** as (7) of decisions 2026-11-10
amends the plan, and Q2 (the backup task joins `register-tasks.ps1`; the
owner re-runs it once): the dumps are canonical Extended JSON lines in one
gzip file with an end line, written by the run copy's driver (no Database
Tools); F: keeps 14 daily and 8 weekly (weeks Monday to Sunday), E: only the
newest file, replaced when E: has three times its size plus 5 GiB free; no
stream files on E:; Windows keeps the backup task's trigger in UTC (05:20Z
all year: 06:20 local now, 07:20 in summer time).

2026-11-11 (RESEARCH-KIT accepted — the owner, on the recommendations of
RESEARCH-KIT, its Final review and the supervisor): **THE KIT IS ROUND 2'S
ONE YARDSTICK; THE SIX QUESTIONS OF ITS SECTION 8 ARE RULED AS RECOMMENDED.**
Report `docs/reviews/research-kit-2026-11-11.md` (8 Final-review corrections
by a fresh reviewer, marked in place): the one-minute panel of 91 markets to
2026-11-07T00:00Z (manifest `93c985e5…be15`, on
`F:\polymarket-follow-research\KIT\`, equal to R8's capture wherever both
exist); the kit (fingerprint `7b4179e8…c215`, 26 files) returns R8's 1,272
entries exactly and prices R8's cell by the minute at −16.36 bps against
−16.60, and an independent pricer agrees with it to rounding; the supervisor
re-hashed both, scanned every raw reply for the blind store (none at or after
the cut) and re-ran the proof. The owner ("yes, i agree with all six"):
**(1)** the exact matched random-trade null (A.0-4) is round 2's only
yardstick, R8's drawn trades printed beside where they exist; entry 10's
FIND result, measured against R8's own-direction null, is measured again with
the exact matched null before entry 10 is registered; **(2)** entry 8 (the
funding study) leaves this batch (it can see about 120 bps where its rule
needs under 60) and returns on months of the collector's data; **(3)** the
funding rule is settled by Polymarket's changelog of 2026-09-01 (a position
held when the hour closes pays; one closed before it does not — R3's rule by
nominal hour, as the kit charges it), with no `/v1/info/pnl` read; the quote
is confirmed word for word on the page before the freeze; **(4)** for the
register: entry 2's list (c) is built from the pool's own fills before the
cut, never from a board read after it, with the 139 truncated captures
handled; the 303-account directional list (`out/directional-at-cut.txt`,
SHA-256 `ac3570b6…`) is frozen, and since it holds 16 holdout accounts, D1
is scored before the first exam's capture; (4b) is withdrawn by the Final
review; **(5)** the d-based entries (1, 4, 6, 9, 10) are judged at 24 hours
in their primary cells, the class horizon (and entry 9's 6 hours) printed
beside, deciding nothing — for a taker the 1- and 6-hour cells of the main
markets cannot pay their costs (the map, A.1-8); the map is left out of
entries 7 and 8, whose statistic is already a taker's net result; A.2's
smallest visible effects are recomputed for these horizons before the
register is drafted; **(6)** A.0-6 stays as written (t-tests on day means
and on trader means, the larger p deciding); the entry-weighted mean with its
cluster-robust errors by day and by trader is printed beside every result,
deciding nothing, and each entry names which mean its line tests. Next: the
batch freeze about 2026-11-20 (m, the register, the t values recomputed).

2026-11-10 (round 2's rules and the collector approved — the owner, on the
recommendations of IDEAS-REVIEW, DOCS-SWEEP, COLLECTOR-PLAN and the
supervisor): **ROUND 2 RUNS BY ONE RULE BOOK WITH TWO EXAMS, AND THE COLLECTOR
IS BUILT NOW, RECORDING EVERYTHING ONTO F:.** Phase 0 is complete (P0-1 to
P0-4: `docs/reviews/docs-sweep-2026-11-10.md`, `ideas-review-2026-11-10.md`,
each Final-reviewed). The owner approved all eleven recommendations ("i
agree with your recommendation (eleven of them)"): **(1)** round 2 follows
IDEAS-REVIEW's rule book (its Appendix A.0 as of commit `1e35202` and later
corrections marked in place): one 5% budget for any false pass across the
whole batch — 0.5% at the first exam (about 2026-11-30: pass at p ≤
0.005 ÷ m, drop on a wrong sign, else open), 4.5% by Holm at the final exam
(2026-12-19); p from t-tests on day means and on trader means, the larger
deciding; the batch and m frozen about 2026-11-20 with their t values
recomputed then; the "blind store" by field (after 2026-11-07 FIND may take
only `account` from boards sorted by notional or account value and from the
competition table, plus the rule book); the competition of 2026-11-02 →
11-16 a covariate in every test; **round 2 ends at the final exam**; **(2)**
if study 1 finds no difference between traders, ranking traders stops for
now, to be reopened after six months; **(3)** the same address's record on
another venue: not now, ruled after study 1; **(4)** trader quality as a
short list of tested measures, not one score; an AI's rating only forward,
as a paper profile beside the owner's own "would have taken it" mark;
**(5)** on-chain lookups only for deposits, withdrawals and wallet balances
of favourites, after one more explorer check; **(6)** the collector reads
the competition table with `include_unqualified=true` daily, `exchange`
every 5 minutes, no separate best-price or ticker streams; **(8)** this
approval covers the first app code (`apps/poller` in a pnpm workspace), its
packages and three Windows tasks — an exception to "no code before the v1
plan" (decisions 2026-11-06); **(9)** REST reads pause in the lab's nightly
window, the streams keep running, and the poller starts **with Windows,
outside the owner's session** (S4U, no password stored), changing the
sign-in default of 2026-11-07 for the poller; **(10)** once the exam lists
are frozen, their new fills are stored weekly, unread until an exam;
**(11)** recording starts once build part 3 is verified, before the
collector's Final review. **The collector** follows
`docs/reviews/collector-plan-2026-11-10.md` (15 Final-review corrections;
its deviations from CLAUDE.md's Stack, D1–D14 in its table, are accepted:
no Turborepo or shared package yet, no node-cron, Node's built-in WebSocket,
a run copy outside the working tree, among them). **No data cap** ("full
speed 24h 365days"), so the **full recording**: top-20 books of all 90
markets at most once a second when changed, every trade (24–31 GB a day of
download). **(7) Storage, amending decisions 2026-11-08 (R6 accepted) for
the collector** (E: has ~20 GB free and shrinking; D: is never used): the
recordings on F: only (`F:\polymarket-follow\recordings\`, about 0.4–0.6 GB a
day, 150–220 GB a year; F: ~1.5 TB free); the database on C: (about 2 GB a
year); its dumps daily to F: (`F:\backups\polymarket-follow\db\`, 14 daily
and 8 weekly kept) and only the newest dump on E:; an external disk or
cloud copy later, by the owner. The stated risk: until that copy, an F:
failure loses the recordings. **The follower's costs:** Polymarket Perps'
measured taker costs are the default in every table (about 9–13 bps a round
trip); where the owner acts and at what cost is to be talked through later
(the owner: "this is specific topic and i can explain and show how am doing
… that can come later").

2026-11-09 (the fast track — the owner, on the supervisor's
recommendation): **ROUND 2'S STUDIES FIND IN PARALLEL NOW, THE FIRST EXAM
RUNS ABOUT 2026-11-30, AND THE V1 PLAN STARTS IN EARLY DECEMBER BESIDE THE
FINAL EXAMS.** The owner asked why "research complete" would wait until
mid-December when the data, the parallel subagents and the credits are
there. The supervisor's answer: the work is fast, the calendar is not —
every idea must be confirmed on trading it has never seen (decisions
2026-11-09, the road to v1, M2), and that data arrives a day at a time after
2026-11-07 (about 3 weeks by 2026-11-30, about 6 by mid-December, R8's
length); the clean past since the public launch is about 9 weeks, and R8
used its last 6. The owner chose the fast track: (1) this week the "find"
studies in parallel and the collector (C1) built and started; (2) about
2026-11-30 the first exam on the new weeks, with the dated checks D1 and D2
— it catches false patterns well, while a small real edge may not show yet;
(3) from early December the v1 plan, the final exams running beside it on
more weeks, whatever passes later added to v1. The owner: "we will work
every day and we will see how we will progress … maybe we will [be]
faster".

2026-11-09 (the road to v1 — the owner, with the supervisor): **RESEARCH
ROUND 2 AND A SMALL DATA COLLECTOR COME BEFORE V1, AND EVERY POINT RAISED IS
RECORDED SO NONE IS FORGOTTEN.** The owner: "why to work v1, maybe we will
get more with search 2 round and then will improve this v1 … let's work on
that once we have all documentation, tests"; then thirteen points (staying
in step with the boards; favourites from zero with a per-trader alert
switch; every account ever on a board kept as a universe; stop-loss and
take-profit; trading style as a signal; charts; statistical formulas for
filtering; how bots, market makers and whales work; consensus among
favourites; AI for confirmation or description; whether the documentation
was read whole; block-explorer lookups; a fresh-eyes ideas subagent;
paper-log profiles; the "Claude design" skill) — "please record all of
them, we should cover them all". **Recorded on the plan page, "The road to
v1"**, with IDs: Phase 0 (P0-1 the record, P0-2 a second copy of
R3-WEEKDAY's live books, P0-3 DOCS-SWEEP, P0-4 IDEAS-REVIEW), Phase 1 (C1
the collector — a Windows task, not a subagent, keeping what cannot be
re-read and the universe), Phase 2 (H1–H13 and the dated checks D1, D2),
and the v1 items V1–V7; the method M1–M3 (a hypothesis register before any
test; the data after 2026-11-07 untouched until it confirms; a fresh
subagent per study, the supervisor re-computing what decides). **Facts
checked by the supervisor in the stored specs (2026-11-09):** an order may
carry a TP or SL trigger, but TP/SL updates go only to the authenticated
account, so another trader's stops are never visible; the spec's public
`/info` routes not in R1's table are minor (assets, index, limit tiers,
invite, competition widget) plus a POST "share card" route that stays
off-limits (reads only); withdrawals are on-chain. "Research complete" is
said after round 2. Nothing starts before the owner's go.

2026-11-09 (R7 accepted, and the pages' rules — the owner, on the
supervisor's and R7-PAGES's recommendations): **V1'S PAGES ARE DESIGNED FOR A
WATCHING AND ANALYSIS TOOL.** R7's report (`docs/reviews/r7-pages-2026-11-09.md`,
12 corrections by its own Final review marked in place; a one-page summary
for the owner at its top; the cut-line between what v1 builds and what waits
in its Q1 table) is accepted. The supervisor checked the ports free on this
machine and the ROI base on stored board rows. **Eight pages:** Watch (the
favourites; the first screen), Boards, Trader, Alerts, Paper log, Status,
Method, Settings; **the pages read only the database** — the poller is the
one client of the API, and a page's fresh read is queued to the poller's
50-token reserve, the owner's requests first. **The owner's rulings (R7 §7,
all as recommended):** (1) ports 3300 (development server) and 4300 (the API
and the built app); (2) times in UTC with local time beside them; (3) ROI
shown only on a base of $1,000 or more (tightening "above $100" of
2026-11-07); (4) red only for failures and liquidations, never for a trader's
loss, and every state also has a word or a shape; (5) the page is called
"Paper log", and "follow" and "copy" stay off the screen; (6) "thin
evidence" on a directional label with fewer than 8 decisions and fewer than 3
closed positions (classifier v2's own minimum); (7) the poller labels the top
100 of boards the owner has viewed, at the lowest priority, from what the
reserve has left; (8) a 95% range clustered by day among the paper log's
secondary figures, shown from 20 days (or traders); (9) the paper log starts
with K = 20 trader slots; (10) a liquidation of any favourite always raises a
banner; (11) a dismissible first-run note of three dated findings; (12) the
leaderboard's turnover line and CSV export later, after 30 days of stored
snapshots. **Two technical calls for the v1 plan (the supervisor):** the
favourites' unused share may be lent to the reserve, the total staying 250 a
minute; R4's freshness check reads the public trades WebSocket (no tokens).
The first research phase (R1–R8, R7) is finished; the owner's word "research
complete" opens the v1 plan.

2026-11-09 (R8 accepted — the owner, on the supervisor's recommendations):
**FOLLOWING THE LEADERBOARD'S TOP DIRECTIONAL TRADERS DID NOT PAY; V1 IS
PLANNED AS A WATCHING AND ANALYSIS TOOL.** R8's report
(`docs/reviews/r8-pretest-2026-11-09.md`, 13 corrections by a fresh
subagent's Final review, R8-REVIEW, marked in place) is accepted. The
supervisor re-computed the primary cell with its own code (identical counts
and means) and rebuilt 1,010 of the null draws independently (identical).
**The verdict, by the frozen rules: FAILS** — (i) the follower's net return
−16.6 bps an entry, trader-clustered 95% interval about [−30, −6], below
zero for 200 of 200 bootstrap seeds; (ii) d −13.6 bps against random trades
in the same instrument and hour, its intervals reaching about zero: no
better than random, "worse" not shown; (iii) 21 of 47 traders positive,
p 0.56; 1,249 entries; every secondary fails or is too few to tell. **B:**
no confirmed skill — B1 killed in its find half; B2's find pair passed
(Spearman 0.20, p 0.011) but not at the top, its confirmation needs weeks
9–12. The 50 made $88,018 net of fees in the 30 days before T0 and $92,121
in the 42 days after; without #47 ($109,386 after) the other 49 went from
$72,738 to −$17,266. **The owner's rulings** (R8 §7 and R3-WEEKDAY §7): (1)
v1 is planned as a watching and analysis tool without the copy framing (the
ruling of 2026-11-06 for FAILS); alerts still fire, as information; a pattern
that research round 2 finds and that passes its tests may be added later;
(2) the forward paper-follow log stays as designed, the matched-direction
null and the day clustering shown beside the vote; (3) B2's confirmation:
weeks 9–12 (2026-11-02 to 11-30) rebuilt from a fills read after 2026-11-30
by the frozen rules, the plan recorded here before it runs; (4) #47's exits
are shown only as data on its own page, never as a signal; (5) R3-WEEKDAY's
week of bbo snapshots is folded into v1 and round 2 (the live log stores the
book at every paper entry), not run as a separate job.

2026-11-09 (the owner's direction after R8 — the owner, recorded by the
supervisor): **THE PROJECT CONTINUES: FINISH THE PLANNED RESEARCH, THEN A
SECOND ROUND THAT SEARCHES FOR A "WIN COMBINATION".** R8 found that copying
the top 50 directional traders' entries about 80 s late lost money and was no
better than random trades (its report, Final-reviewed by R8-REVIEW; the
supervisor's own re-computation agrees). The owner: disappointed, does not
give up — "let's complete what we started, then we will talk about research
round 2"; the aim is "right trader, right trades, right pairs, right
momentum", a pattern that pays over many trades, not a perfect record. The
five leads the owner approved for round 2 are kept on the plan page
(backlog, "Research round 2"), with the method: each hypothesis written
before it is tested, found on one stretch of data and confirmed on another
the search never touched, then watched in the forward paper-follow log
before any money relies on it. The app stays watch-only and never advises
(Iron Rules 1 and 6). Whether v1 is planned as a watching tool now, under
the owner's ruling of 2026-11-06, is settled at the walkthrough of R8's
report.

2026-11-09 (R8's capture and analysis fingerprinted before the one look — the
supervisor, at R8-PRETEST's second stop): **EVERYTHING R8'S ONE LOOK READS IS
FINGERPRINTED BEFORE IT RUNS.** The capture ran 09:18–19:03Z: with the
morning's probes and the completed accounts, 17,526 calls today, every one
answered 200, never more than 200 tokens in a minute or 25 in five seconds
(the supervisor's own count, `verify/R8-PRETEST/rate-stop2.out.txt`). By R8's
log: nulls drawn for 1,933 of 1,946 entry groups (13 have none even after
widening — left out of d and counted), 10,284 one-second mark windows,
funding and hourly marks for 80 instruments. **Fingerprints (SHA-256), each
re-checked by the supervisor:** the capture's manifest
`F:\polymarket-follow-research\R8-PRETEST\capture\MANIFEST.sha256`
`fed04beac251616f9c9a6950af361842413a706d54d4beccef84f4dd939fe15f` (474
files, 53 MB, every file verified) and the code-and-outputs manifest
`workers/R8-PRETEST/out/manifest-e.sha256` `f6e2136a…eb62` (97 files, every
file verified); `rules.json`
`4c20eebccdaf5944d5e4b6406a92191df7f54cec95b4fb12b14f73cd51ecd332` — the
frozen `5ae15c85` with only the table and the three secondaries this log
records (trader-weighted (i) and (ii); the weekday table at every instant;
without five unreliable instruments); `price-table.json` (session_pair)
`9f559b4a…f6dd`; `price-table-weekday.json` `485ada74…ad4d`; `analyze.mjs`
`6d15d24f…0d3e`, `b-skill.mjs` `bac79138…2843`, `stats.mjs` `f88afbed…5f59`,
`price.mjs` `0985eb4d…b9a3`, `nulls.mjs` `41923511…b08e`, `draw.mjs`
`22092f5b…198e`, `store.mjs` `aab4ac5e…0c94`, `lib-r8.mjs` `baf5a4da…0e8f`.
**Its tests:** with no edge, PAYS came out in 0 of 400 simulated runs;
planted edges of 20 and 40 bps were found in every run; 12 of 12 deliberately
broken versions were caught; on 11 accounts outside both arms the whole chain
re-drew exactly the captured trades with no unpriced leg. **A correction to
the entry below:** at R8's share of legs in US hours (33%), the choice of
table is worth up to 0.43 bps a round trip (commodities), not "under 0.25"
(R3-WEEKDAY's Final review F3) — still small against about 8 bps of fees.
Now the one look; the supervisor re-computes the primary cell with its own
script from the capture before the verdict goes to the owner.

2026-11-09 (R8's price table chosen — the supervisor, by the procedure the
owner approved on 2026-11-08): **R8 PRICES THE FOLLOWER WITH THE WEEKDAY
TABLE IN US MARKET HOURS AND THE SATURDAY TABLE AT EVERY OTHER INSTANT.**
R3-WEEKDAY measured 2026-11-09 14:30–16:30Z (09:30–11:30 New York) with R3's
scripts (`docs/reviews/r3-weekday-2026-11-09.md`); its table
`workers/R3-WEEKDAY/out/rule-table-weekday.json` in the supervisor folder,
SHA-256 `2578475e8e54237be6b9860ea01b04a98399418fbcf862bd329b1cfb3b5e3dc0`,
is in R3's format (90 instruments, 246 bbo snapshots, 982 books). **Checked
on the supervisor's own path:** the mean half-spread re-computed from the raw
snapshots matches the table to 0.000000 bps for all 90 instruments, field for
field in R3's format (`verify/R3-WEEKDAY/spreads-check.out.txt`); the
subagent's access was clean. **The choice: `session_pair`** (defined in
decisions 2026-11-09, R8's rules file frozen), R3-WEEKDAY's recommendation:
each table is used only in the kind of hours it was measured in (R3's
"Saturday" window was Friday evening in New York, off-hours). On the weekday
morning the Saturday table understated a round trip by about 0.7 bps on
majors and 1.4 bps on commodities; across R8's entries the choice is worth
under 0.25 bps a round trip, against about 8 bps of fees. R8's voted entries
have 33% of their legs in US regular hours (the supervisor's count of times
only, `verify/R8-PRETEST/select-check-sessions.out.txt`). **Two secondaries
added, deciding nothing:** the weekday table at every instant (the choice
that cannot make following look cheaper in any measured hour), and the
primary cell without the instruments whose measured cost or mark is
unreliable — PRL-USD (two holey books gave a depth cost of 181 bps), NCLD-USD
(a stale book), SKHYNIX, SAMSUNG and CXMT (marks away from the book while
their home markets are closed): 8 of the 1,256 voted entries, 4 with a leg in
US hours. The table is used as measured, its means unchanged (the rule:
decisions 2026-11-07, R3 accepted). The capture's manifest and the analysis
script's hash are recorded at R8's second stop, then the one look.

2026-11-09 (R8's rules file frozen — the supervisor, at R8-PRETEST's first
stop): **EVERY RULE OF R8 IS FINGERPRINTED BEFORE IT DOWNLOADS ANY MARKET
DATA.** R8 wrote its rules file from the approved numbers (decisions
2026-11-08, R8's numbers approved, and the entries it completes) with every
threshold, seed and file path and each detail the rules left open:
`workers/R8-PRETEST/rules.json` in the supervisor folder, SHA-256
`5ae15c85dd37e1b7bae07d7a1432d86167e5a1418d71ce609b8005fc8a575841`, written
2026-11-09 09:14Z; its selection `out/selection.json` `c20c3f80…ef68c`.
**Three calls inside the approval, by the supervisor:** (1) the three
directional pool accounts whose history R2's 50-page cap cut short are read
back to their first fill (132 calls) instead of being dropped — dropping
them would bias the selection against the busiest directional accounts; one,
the board's highest-ranked directional account (all-time notional #47), now
enters both arms in place of the 50th; (2) "the horizon class nearest the
trader's median holding time" is nearest on a log scale (boundaries √6 h ≈
2.45 h and 12 h): if an edge builds over the hold and the price is a random
walk, two horizons' votes are equally sensitive at those holds; 7 of the 50
traders get a longer class than "nearest in hours" would give; fixed before
any outcome is seen; (3) the session-aware pair, one of the three candidate
price tables, is defined: R3-WEEKDAY's table at instants in US regular hours
(Mon–Fri 09:30–16:00 New York), R3's Saturday table at every other instant,
for all instruments. A test cohort of 11 accounts outside both arms proves the
analysis on real data and is never part of a result. **Verified on the
supervisor's own path** (`verify/R8-PRETEST/select-check.mjs`, written from
the rules, not from R8's code; outputs `select-check-stop1.out.txt` and
`select-check-stop1b.out.txt`): the frozen classifier v1's hashes; the same 50
traders and the same ratio arm; 194 directional at T0 → 180 at or above
$25,000 → 104 with 10 closed positions; 1,272 entries in [T0, T1), 1,256
voted, 38 traders with at least 5 — far above TOO FEW's 20 traders and 300
entries; no per-trader difference. Before T0 the 50 made $88,018 net of fees
on $71.7M. **Still open:** the price table, chosen after R3-WEEKDAY's report
(2026-11-09 14:30–16:30Z) and recorded here, with the capture's manifest and
the analysis script's hash, before R8's one look. A secondary that decides
nothing may still be added before the look, recorded here with the file's new
hash; nothing changes after it.

2026-11-08 (R8's numbers approved — the owner, on the supervisor's
recommendations): **R8 STARTS FROM 2026-09-26, WITH A FOLLOWER WHO WATCHES
ABOUT 20 TRADERS.** The owner approved the numbers of the supervisor's draft
(`drafts/r8-brief-draft.md` in the supervisor folder), completing R8's rules
(decisions 2026-11-06, the pre-test and waves 2–4 approved, A1–A13 and B1–B4;
2026-11-07, R3 accepted; 2026-11-07, the classifier's ruling; 2026-11-08, R2
and R2-LABELS accepted): **T0 = 2026-09-26** (the 30-day selection window
holds the public launch; a 6-week measured period to T1 = 2026-11-07T00:00Z);
the tracked set — v1-directional on the 14 days before T0, ≥ $25,000 notional
and ≥ 10 closed positions in the window, the top 50 by realized PnL net of
fees (secondary: by PnL ÷ notional; sensitivity: R2's "doubt" rule); **the
delay D = U·T + 1.5 + 0.3 + 0.34 + 60 s with T = 33.3 s** (about 20
favourites at the budget; sensitivity T = 100 s); the base-tier taker fee
0.04% a leg; funding hourly; pre-IPO out of the primary cell; the verdict as
amended. **The one open number:** the price table — R3's Saturday table, the
weekday table or a session-aware pair — chosen after the weekday measurement
of 2026-11-09 14:30–16:30Z by R3-WEEKDAY's recommendation checked by the
supervisor, recorded here before R8's one look. **Timing:** nothing new starts
before the owner's weekly usage resets (the owner, 2026-11-08: at 98%); R8 is
started on 2026-11-09 to prepare its data and code, and makes its one look only
after the price table is recorded.

2026-11-08 (R6 accepted, and where backups go — the owner, on the
supervisor's recommendations): **BACKUPS GO TO E: AND F:, NEVER D:.** R6's
report (`docs/reviews/r6-storage-2026-11-08.md`, 13 Final-review corrections
marked in place) is accepted; the supervisor checked its machine facts itself:
the shared MongoDB server (8.3) keeps its data on C:, listens only on
127.0.0.1, without authentication; C: and E: are two partitions of one NVMe
drive, D: a separate SATA SSD, F: a separate hard disk (1.5 TB free). **The
owner: D: "is not working properly so we should avoid any backups there."**
So R6's suggestion of D: is dropped and the founding decision stands, as the
lab does: our database on the shared server (C:); the backup's first copy on
E: (`E:\backups\polymarket-follow\`, quick to restore, guards against
mistakes but not against the drive failing) and its second on F: (the copy
that survives the C:/E: drive). **Approved with it (v1-plan defaults):** a
daily Node dump script like the lab's (no Database Tools installed), at 06:20
local, clear of the lab's jobs, a weekly test restore into a scratch database;
leaderboard history as one daily copy of the top 1,000 of 8 boards (~0.4–0.6
GB a year); the full order book stored at every paper-follow instant; the
per-call API log as rolling files (14–30 days) with hourly aggregates in the
database; one digest row an hour in the alert feed for favourites labelled
algorithm or market maker (their fills still stored); disk alarms — warn at 15
GB free on C:, stop our writes at 6 GB. **Sizes (modelled, ±25%):** about 0.17
GB a year for 20 typical favourites; the ceiling, every favourite as busy as
the busiest captured account, is 8 / 32 / 79 / 159 GB a year for 5 / 20 / 50 /
100 favourites — C: would fill in about 7 months at 50. Whether our database
stays on the shared server or gets its own on F: is a question for the v1
plan. The research data no API can re-read (R3's live books and the boards as
read, ~10 MB) gets a second copy with a hash list on E:.

2026-11-08 (R2 and R2-LABELS accepted, and the display defaults — the owner,
on the supervisor's recommendations): **THE BOARDS' TOPS ARE MOSTLY
ALGORITHMS, MARKET MAKERS AND INACTIVE ACCOUNTS, AND THE APP SHOWS EVERY LABEL
WITH ITS EVIDENCE.** R2's report (`docs/reviews/r2-trader-style-2026-11-08.md`,
8 Final-review corrections marked in place) and R2-LABELS's
(`r2-labels-2026-11-07.md`) are accepted; the supervisor re-ran the frozen
classifier on all 1,615 non-holdout accounts and joined it with the board
ranks itself — all-time notional top 100: 6 directional, 67 non-directional,
26 with no fill in the two weeks to 2026-11-07 (the first directional at #47);
all-time PnL top 100: 15 / 32 / 40; all 54 competition-disqualified accounts
non-directional. Each week's top 50 by realized PnL (rebuilt inside the pool,
six weeks to 2026-11-02) kept only 18–32 of 50 positive the next week. The
leaderboard's PnL most likely excludes the liquidity rewards (not proven: the
rewards' recipients are not public). **Display defaults for the v1 plan:**
every style label shown with its window, its coverage and its reason; realized
and unrealized PnL side by side with an "underwater" flag; accounts with no
fill in 30 days greyed; "disqualified" a flag, never an automatic label; a win
rate shown only from 20 closed positions, with its interval and shrinkage.
**For R8** (its numbers, shown to the owner before they are frozen): the
capture `F:\polymarket-follow-research\R2-STYLE\` (T_CAP 2026-11-07T00:00Z),
`scripts/r8-pret0.mjs` (v1 on pre-T0 fills only), a $25k notional floor in the
30-day selection window, and R2's written rule for "an account a careful
reader would doubt" (R2 §1 Q10).

2026-11-08 (the style classifier v2 frozen for the forward blind test — the
supervisor): **V2 IS FINGERPRINTED BEFORE THE DATA IT WILL BE TESTED ON
EXISTS.** R2 froze it at 2026-11-08T00:07:16Z, built and checked on
non-holdout accounts only (decisions 2026-11-07, the classifier's ruling):
v1 plus an order-level fixed-size sign and "at least 8 decisions or 3 closed
cycles" before "directional"; v1's files unchanged (hashes re-checked).
`classifier-v2.json` SHA-256
`96f99e1ad4a40c6479748bc3ffb6bfbcf490f82bb68e5c70edcb39c3a35d133e`,
`scripts/classifier-v2.mjs` `1ff0383f…13cb2`, `scripts/label-accounts-v2.mjs`
`19301cbf…7cff` (in `workers/R2-STYLE/`; copies in
`verify/R2-STYLE/frozen-classifier-v2/`). On non-holdout accounts: D 236 · N 192
· U 391 · no fill 796 (v1: 293 directional). R2's Final review disclosed one
more weakness, kept for a v3 and not fixed in v2: tempo is averaged over the
whole window, so a bot active on only one or two days reads slower than it is.
The test: after 2026-11-21, the holdout's fills for 2026-11-07 to 2026-11-21,
labelled blind by a fresh labeller, v2 scored by the frozen rules.

2026-11-07 (the classifier's ruling — the owner, on the supervisor's
recommendations; and the supervisor's prior before R8): **V1 OF THE STYLE
CLASSIFIER IS USED FOR THE RESEARCH; THE APP SHIPS ONLY WITH A V2 THAT PASSES
AN HONEST FORWARD BLIND TEST.** The score (decisions 2026-11-07, R2's
classifier scored: trap 2 of 23, both anchors caught) showed two weak spots —
slow fixed-size algorithms, and "directional" called on thin evidence. A fix
made now would be tuned on labels already seen, so: (1) **R8 uses v1;** its
tracked set already needs 10 closed positions (A3), which removes most thin
evidence, and R8 prints its primary result again with the tracked accounts a
careful reader would doubt left out, as a sensitivity. (2) **R2 designs a v2**
for the two weak spots on non-holdout accounts only, and freezes it with its
hash before the test data exists. (3) **The forward blind test:** after
2026-11-21 the 100 holdout accounts' fills for 2026-11-07 to 2026-11-21 —
data nobody has seen — are pulled, a fresh blind labeller labels them by the
frozen definitions, and the supervisor scores v2 by the same rules; R2 never
opens the holdout's data meanwhile. (4) **In the app, a "directional" label
on thin evidence carries a warning.** **THE SUPERVISOR'S PRIOR FOR R8, written
before its rules are frozen and before its one look:** PAYS ~20%, FAILS ~50%,
TOO FEW TO TELL ~30%. Why: polymarket-lab's F9 found no edge in top
prediction-market wallets; the published evidence on copying finds none after
costs (R5); the best on-chain wallets' information is used within seconds
(R5, Zhai) while a follower here acts 20–80 s late; a round trip costs ~8–10
bps in fees and spread; and most of what tops the boards is algorithms and
market makers (R2-LABELS: 23 of the 37 active holdout accounts with a clear
label). For it: the owner follows directional traders only, perps leaders may
differ from prediction-market ones, and R8's horizons reach 24 h.

2026-11-07 (R2's classifier scored — the supervisor, by the rules fixed
before any label existed): **THE TRAP RATE IS 2 OF 23 (8.7%, 95% INTERVAL
1.1–28.0%); BOTH ANCHORS ARE CAUGHT.** The supervisor ran the frozen
classifier (decisions 2026-11-07, R2's classifier frozen) on R2-LABELS's copy
of the 100 holdout accounts, 2026-11-07 09:43Z (output
`verify/R2-STYLE/classifier-holdout.tsv`, SHA-256 `77c05ec2…c635`), and
scored it with its own script against the fingerprinted blind labels
(`verify/R2-STYLE/score.cjs`, its Clopper–Pearson self-test passed; output
`score.out.txt`). The 40 accounts R2-LABELS found idle the classifier found
idle too; 60 were scored. **Primary:** of the 23 accounts R2-LABELS labelled
non-directional (17 algorithm, 6 market maker), the classifier called 2
directional — `0xc455dbd3` and `0x7d641ac8`, both algorithms trading a fixed
size, which the classifier's fixed-size sign misses below 10 decisions a day.
The two anchors: algorithm. **Secondary:** traders lost (R2-LABELS
directional, classifier non-directional) 1 of 14 (`0x7c97eb77`, 50 large
resting orders, called market maker); risky D (R2-LABELS unclassified,
classifier directional) 6 of 23, all "too few" to the labeller — the
classifier needs 5 decisions, the labeller wanted more; abstentions 6 of 37;
horizon agreement 5 of 8; D/N/U agreement 45 of 60, six-way 40 of 60. **What
it means:** the classifier catches most of the trap but not all of it, and on
thin evidence it says "directional" where a careful reader says "can't
tell". Any change made now is made after seeing the holdout, so it can no
longer be tested on these labels; whether v1 is good enough, and how a
corrected version is tested honestly, is the owner's ruling.

2026-11-07 (R2's classifier frozen — the supervisor, at R2-STYLE's third
stop, before scoring): **THE STYLE CLASSIFIER IS FINGERPRINTED BEFORE THE
SUPERVISOR RUNS IT ON THE HOLDOUT.** R2 built it on non-holdout accounts only
(its run log: three runs, none on the holdout) and froze it at
2026-11-07T09:42:15Z: `classifier-v1.json` (thresholds) SHA-256
`d803192c779e107b61eab13b4bd52fc488b04cd0c9f38939c2efb5acf292e4ad`,
`scripts/classifier.mjs` (the rules) `f7f32f22…8c01`,
`scripts/label-accounts.mjs` (the apply script) `aa9df253…a9a4` (in
`workers/R2-STYLE/`; copies in `verify/R2-STYLE/frozen-classifier/`). On the
1,602 non-holdout accounts it labelled 807 with fills in the window:
directional 288, algorithm 144, market maker 36, churner 7, unclassified —
mixed 113, unclassified — too few 219; both anchors algorithm. The supervisor
now runs it on the 100 holdout accounts and scores it by the rules fixed
before any label existed (decisions 2026-11-07, the style labels' definitions
frozen).

2026-11-07 (R3 accepted, and the pre-test's rules amended — the owner, on the
supervisor's recommendations): **THE FOLLOWER IS PRICED AT THE MARK PLUS THE
MEASURED COST, AND A TRADER IS JUDGED OVER A FIXED HORIZON, NEVER BY THE
TRADER'S OWN EXITS.** R3's report (`docs/reviews/r3-paper-follow-2026-11-07.md`)
was Final-reviewed by a fresh subagent (R3-REVIEW: 12 corrections marked in
place, none high; R3's seeded simulations reproduced exactly; the statistics'
source checked on the paper's text) and checked by the supervisor (the exit
bias analytically; spreads live; the 1 s mark history complete on 2026-09-15
for BTC and NVDA). **Why the change:** a trader with no skill who takes profit
at +0.5% and stops at −2% wins about 80% of trades by arithmetic and nothing on
average; a sign vote on the trader's own exits would have crowned such a
trader in 79% of simulated runs — the leaderboard's own trap — and on this thin
market the next public trade after an alert comes 1.4 to 24 minutes late.
**The owner approved all seven proposals (R3 §7):** (1) **A5 is replaced:** the
follower's price at an instant is the 1 s mark × (1 + s × (the instrument's
mean quoted half-spread + its mean depth cost for $1,000)), from R3's
per-instrument table, on both legs, for the tracked entries and their nulls
alike (s = +1 when the follower buys); A5's first-trade price is printed as a
check, and the half-spread and depth doubled as a sensitivity. (2) **Pre-IPO
entries are left out of R8's primary cell** and reported in a secondary (no
rule priced ANT within ±20 bps). (3) **The vote:** each entry's d is the
follower's net return over a fixed horizon h minus the MEDIAN of its three
nulls' net returns over the same h (A9's mean stays for A11 (i) and (ii));
h is 1 h, 6 h or 24 h, the class nearest the trader's median holding time
over the 30 days before following (under 10 closed positions: 6 h); A11
(iii)'s sign test runs on these fixed-horizon d; the trader's own exits are
shown as paper money, never voted on. (4) **The scoreboard's statistics
(v1):** entries whose windows overlap are merged into one vote; per trader the
two-sided sign e-process E_n = 2ⁿ·k!(n−k)!/(n+1)!, a verdict only at
**E ≥ 20·K with K = 20 trader slots (E ≥ 400; e-Bonferroni, valid however
often the owner looks and under any dependence between traders)**; **the pooled
board of all favourites comes first,** one vote per UTC day, a verdict at
E ≥ 20; ties (|d| < 0.1 bps) dropped; late entries recorded, never voted. The
honest cost: a verdict on one trader needs months to about a year of
following even for a real edge; the pooled board answers sooner. (5) **A
2-hour weekday measurement in US hours, Monday 2026-11-09 14:30–16:30Z,** with
R3's scripts, before R8's numbers are frozen — the rule table is one Saturday
morning's, and spreads and the weekend premium moved by the hour. (6) **Paper
size $1,000 an entry, $10,000 stored beside it** (the live log stores the book,
so any size can be priced later). (7) **A matched-direction e-process**
(nulls drawn with the trader's own long share) **beside each vote,** to tell
skill from a long habit in a rising market. **The live log (v1):** the paper
entry is priced at the book's VWAP for $1,000 at the follow instant (the
alert + 60 s), with the book, bbo and ticker stored as read then. **Costs:**
the base-tier taker fee, 0.04% a leg (ANT 0.02% by its fee override); funding
every whole hour at the published rate.

2026-11-07 (the blind labels fixed — the supervisor): **R2-LABELS'S 100
LABELS ARE FINGERPRINTED BEFORE ANY CLASSIFIER OUTPUT EXISTS.** R2-LABELS
(Sonnet 5.5, xhigh; report `docs/reviews/r2-labels-2026-11-07.md`, `c63c39e`)
labelled the 100 holdout accounts for 2026-10-24 to 2026-11-07 from their raw
fills by the frozen definitions: none (no fill) 40 · unclassified — too few 20
· unclassified — mixed 3 · directional 14 · algorithm 17 · market maker 6 ·
churner 0. Checked by the supervisor: it never opened R2-STYLE's folders
(access scan 0 outside its own); the 40 "none" agree with the supervisor's own
count from the raw files on all 100 accounts (`verify/R2-STYLE/window-fills.cjs`).
`labels.csv` SHA-256 `617c53afb0aa64a25f549dd5b1cdef60a748f1eb3655880e9f479ac8a332b1d0`
and `labels-extras.csv` (the two anchors, outside the score) `dabbbfee…a055`,
2026-11-07 05:08Z; frozen copies in `verify/R2-STYLE/`. Its Final review may
correct a label only where the frozen definitions were misapplied, each change
logged; the supervisor then scores both versions and reports both.

2026-11-07 (the style labels' definitions frozen, and how the classifier is
scored — the supervisor, at R2-STYLE's second stop): **SIX LABELS, WORDS
ONLY, AND THE SCORING FIXED BEFORE ANY LABEL OR CLASSIFIER OUTPUT EXISTS.**
R2 wrote the definitions from non-holdout data only (the supervisor checked:
every analysis script goes through one guard that refuses holdout accounts;
none of the appendix's nine example accounts is in the holdout; R2's
transcript shows no hand access to the holdout folder). The file:
`workers/R2-STYLE/label-definitions.md` in the supervisor folder, copied
unchanged to `workers/R2-LABELS/label-definitions-v1.md`, SHA-256
`29df3f0c5fdec788bc36dc277f66a1b5b4734d201598138933cecc12c6d656a7`
(written 2026-11-07 04:50:35Z; its header's "05:05Z" is a slip). **The
labels:** directional (with a horizon: scalp, intraday, swing, position) ·
market maker · algorithm · churner · unclassified — too few · unclassified —
mixed; a window with no fill gets no label (the dormant flag). Hedger is not a
label (no case among the 547 heaviest non-holdout accounts; offsetting pairs
go to "mixed"); competition player, reward farmer, disqualified status and
linked accounts are flags beside the label, never the label. **The deciding
rule:** read decisions (order events, orders, action groups, position
cycles), never fills; a non-directional label wins when its signs are clear in
most decisions; **in doubt between directional and anything else →
unclassified — mixed, never directional** — the costly error is calling a
non-directional account directional. **The blind labels:** R2-LABELS (Sonnet
5.5, xhigh) labels each of the 100 holdout accounts for one window,
2026-10-24T00:00Z to 2026-11-07T00:00Z, from the raw fills alone (copied to
`F:\polymarket-follow-research\R2-LABELS\holdout\`, 100 files, SHA-256 of
their hash list `cbf25167…a713`), never seeing R2's work; the two anchors are
labelled as named extras, outside the score. **The scoring, fixed now:** the
unit is the holdout account in that window; accounts with no fill in it are
left out and counted. Labels collapse to D (directional, any horizon), N
(market maker, algorithm, churner) and U (either unclassified). **Primary —
the trap rate:** of the accounts R2-LABELS labels N, the share the frozen
classifier labels D, with its exact (Clopper–Pearson) 95% interval; both
anchors must be labelled N by the classifier. **Secondary:** of R2-LABELS's D,
the share the classifier labels N (traders lost); the classifier's D where
R2-LABELS says U (a risky D, counted apart); the classifier's U where
R2-LABELS says D or N (an abstention); the full six-way table; the horizon's
agreement on accounts both call D. The supervisor scores with its own script;
the owner rules on whether the result is good enough for v1.

2026-11-07 (R2's holdout fixed — the supervisor, at R2-STYLE's first stop):
**THE STYLE LABEL WILL BE SCORED ON 100 ACCOUNTS R2 NEVER ANALYSES, DRAWN BY
THE SUPERVISOR BEFORE ANY CLASSIFIER EXISTS.** R2 read the pool — 1,702
accounts: the all-time notional and PnL top 1,000 (overlapping on only 320)
and the PnL top 100 of day, week and month, 2026-11-07 00:48–00:51Z. The
supervisor drew the holdout from leaderboard fields only, with its own script
(`verify/R2-STYLE/draw-holdout.cjs` in the supervisor folder; seed 61107;
re-run identical): R2's six strata by all-time notional rank — N1 ranks 1–50
(10 drawn), N2 51–200 (15), N3 201–500 (20), N4 501–1,000 (20), and accounts
off the notional board split at their median notional, N5 upper (15) and N6
lower (20) — leaving out the 60 accounts R2 had already probed and the two
anchors (`0x4c4f…22b4`, the founding check's all-time PnL #1, and
`0x7930…d132`, notional #1), whose behaviour is already known and so cannot
be tested blind. `holdout.json`, drawn 2026-11-07T01:01:31Z, SHA-256
`c57b17d36b42f6827daf8f69b169cb315faae375ad88b1a2013fa6f224086345`. R2's pull
saves those accounts apart, its analysis scripts skip them, R2-LABELS labels
them blind from their raw fills, and the supervisor scores the frozen
classifier against those labels.

2026-11-07 (the owner's PC — the owner's answer to R4's question 2): **THE PC
IS ALWAYS ON AND THE OWNER ALWAYS SIGNED IN, SO THE POLLER AND THE NOTIFIER
START AT SIGN-IN.** The owner: "i don't turn off my pc and do not switch
logged user, all the time it is turned on. from time to time quick restarts
because of update (i do manually that)." So both processes are "at log on,
run only when the user is logged on" tasks (R4 Q3), which can show
notifications; no boot-started poller is needed. A manual restart leaves a gap
until the owner signs in again: the poller catches up on the fills it missed
and shows them as one late summary, never as fresh alerts, and paper-follow
prices them at the moment they could really be acted on (R4 Q8; R3 decides
the details). The machine's own facts (uptime 16.9 days, never sleeps on mains
power, measured 2026-11-06) agree.

2026-11-07 (wave 1 closed — the owner, on the supervisor's recommendations):
**R1, R4 AND R5 ARE ACCEPTED, AND THE PROJECT RUNS AT A QUARTER OF THE
PUBLISHED RATE LIMIT.** The reports (`docs/reviews/r1-perps-api-2026-11-07.md`,
`r4-notifications-2026-11-06.md`, `r5-existing-tools-2026-11-06.md`) were
verified on the supervisor's own path (R1's facts re-measured live 2026-11-07
00:10–00:11Z, `verify/R1-API/`) and Final-reviewed: 34 corrections, each
marked in place. The API facts are in external-apis. **(1) THE OPERATING
BUDGET — 250 WEIGHTED TOKENS A MINUTE, ALL CALLERS TOGETHER** (a quarter of
the published 1,000; Iron Rule 5's "about half" is the ceiling, this is the
setting). The owner: "we should try to stay under the radar, we don't need to
be in risky position, let's define some real number and start with it." Why
this number: R1 measured a token bucket refilling ~1,000 a minute with a burst
of only ~90–100 tokens, so the rule is about spacing as much as volume. **Every
client sends one request at a time, evenly spaced (a fills read, weight 10,
every 2.4 s at the full 250), never using more than 30 tokens in a burst**,
with an honest client name — small and steady, never disguised. Inside it:
50 a minute in reserve (leaderboard, tickers, retries); 200 for favourites.
What 200 buys (R1's formulas, Q14; average alert delay, the worst about
double): polling positions and reading fills on a change — 5 favourites
≈ 4 s, 20 ≈ 17 s, 50 ≈ 50 s; with the active fifth polled faster, 50
favourites ≈ 20 s for the active ones and ≈ 80 s for the quiet ones. For
research: R2 200, R3 50 (this supersedes the 500 of decisions 2026-11-06, the
research phase approved, which was for R1's measurements). Raising it is the
owner's call. **(2) THE TERMS OF USE** (polymarket.com/tos §4.2 bars crawlers
and scraping of "the Site, any other Interface, or Features" and sets no API
rules; the API is documented as public, with published limits): the project
continues — personal use, watch-only, no resale or sharing of the data, at the
budget above. Asking Polymarket for a confirmation is NOT needed for any
research step; it stays an option for the owner before v1 runs around the
clock (the supervisor's recommendation: not needed at this volume; revisit if
Polymarket publishes API terms or limits our address). **(3) R4's OWNER TEST
SHEET** (`workers/R4-NOTIFY/OWNER-TEST-SHEET.md` in the supervisor folder)
runs later, when the notifier is built, with the supervisor guiding it step by
step; nothing for the owner now. **(4) DEFAULTS FOR THE V1 PLAN, approved
together:** 20% of the budget in reserve; the owner's browser on
polymarket.com/perps shares the bucket — no rule, the poller backs off on a
429; positions polling (weight 5) with a fills read on a change only for
accounts labelled directional and slow, fills polling (10) for the rest (the
style label decides: a scalper's quick open-and-close was missed up to 6.8% of
the time); the exact deposits-and-withdrawals column (`/v2/info/pnl`) only
where it exists, "flows unknown" elsewhere; the unpublished pnl/equity routes
charged 15 tokens, calibrated only if v1 reads them often; Windows' own Do Not
Disturb for quiet hours; open, close, flip and liquidation alerted at once,
adds and reduces grouped for up to 20 s; Windows PowerShell 5.1 as the toast
helper, an own app name by one per-user registry key once the sheet proves it,
no tray icon; two processes at sign-in (poller and notifier, the notifier
also announcing "poller down" and "data stale"); phone alerts (ntfy and a
dead-man's switch) after Windows alerts work; ROI only beside its capital
base, with a display floor above $100; no composite "copy score";
"unclassified" a visible label that warns on favouriting like an algorithm;
competition membership stored and labels on rolling windows; schemas tolerant
of new fields with a daily log of unknown keys, closed lists only where an
unknown value would do harm, and a weekly read of the changelog; no paid data
in v1; a manual "same person" note for linked addresses goes to the backlog.
**What the owner will do with it:** use the information for the owner's own
trading decisions, on Polymarket or elsewhere. The app stays watch-only and
never advises (Iron Rules 1 and 6); R8 and the forward paper-follow log are
how it shows, honestly, whether following the dominant traders pays.

2026-11-06 (the pre-test and waves 2–4 approved — the owner, on the
supervisor's recommendations): **BEFORE V1 IS PLANNED, ONE RETROSPECTIVE LOOK
ASKS WHETHER FOLLOWING PAYS AT ALL, AND WHETHER THE LEADERBOARD IS SKILL OR
LUCK.** The owner sent nine lessons from polymarket-lab's supervisor
(2026-11-06), each with its source in `E:\coding\polymarket-lab`, read only:
the F9 drift probe (`docs/reviews/drift-probe-2026-09-04.md`, its review;
the lab's decisions 2026-09-04), data-hunt Q8
(`docs/reviews/data-hunt-2026-11-04.md`), STATS-1
(`docs/reviews/statistics-methods-2026-09-24.md`; the lab's decisions
2026-09-24, reading methods), READ-64 item 5 (the lab's decisions
2026-10-03), hunt-1 Q2 (`docs/reviews/hunt-1-2026-11-04.md`) and the lab
master-plan's "What the leaderboard is actually for". **Where they landed:**
(1) does following pay and (2) skill or luck → **R8-PRETEST**, one new study;
(3) the scoreboard's statistics → R3: an e-process valid however often the
owner looks (a verdict only at E ≥ 20, as the lab's nightly number), rules
fixed before the data, a correction for testing many traders at once; (4)
realized profit against account value — the perps board counts closed trades
only, so a trader banking small wins and holding big losers open ranks high
while underwater → R2, an "underwater" flag beside the style label; (5)
profit per volume by instrument category (crypto majors, small coins, US
stocks, commodities, pre-IPO) → R2, read relatively, the volume beside it;
(6)–(9) competition players and reward farmers, thin markets and the
follower's slippage, liquidity by hour and stock sessions, data freezes →
already in the plan (R1–R4, the v1 plan), now with the lab's evidence. **THE
WAVES, REVISED:** wave 2 — R2-STYLE (Opus 5.5, max; 350 tokens a minute; it
also collects the pool's fill histories R8 reuses), R2-LABELS (Sonnet 5.5,
xhigh; blind, no API), R3-PAPER (Opus 5.5, max; 100); wave 3 — R8-PRETEST
(Opus 5.5, max; 450), R6-STORAGE (Sonnet 5.5, xhigh; 50); wave 4 — R7-PAGES
(Sonnet 5.5, xhigh), after R8, whose verdict decides what v1 is. **R8'S
RULES, FIXED NOW** — the structure; every number marked [R1], [R2] or [R3]
is filled from those reports, shown to the owner and recorded here BEFORE the
one look:
**A — DOES FOLLOWING PAY?** (A1) *Pool:* the all-time NOTIONAL board's
pageable top 1,000, read at a stamped instant — chosen on activity, not
profit. (A2) *Periods:* selection, the 30 days before T0; measurement, [T0,
T1), as long as the fill history allows [R1]. (A3) *Tracked set, fixed at T0
from pre-T0 data only:* labelled directional by R2's frozen classifier on
pre-T0 fills [R2]; window notional above a floor (the lab's dormant-wallet
trap) [R2]; at least 10 closed positions in the window; the top 50 by
realized PnL minus fees. Secondary arm: the top 50 by PnL / notional. (A4)
*Entry:* each opening from flat and each flip; fills of one order and fills
within 60 s merged; adds secondary. (A5) *The follower's price:* the first
public trade at or after the fill plus the delay the planned poller would
really have had — the next poll at a random phase (fixed seed), the API's lag
[R1], the notification [R4], 60 s to act — plus the cost of crossing the
spread [R3]; never a price before the fill (the follower cannot capture the
trader's own impact: F9). Secondary delays 15 s, 5 min, 30 min. (A6) *Exit:*
mirror the trader's close or liquidation after the same delay; open at T1 →
marked at T1 and flagged; secondary horizons 1 h, 6 h, 24 h. (A7) *Costs:*
the base-tier taker fee on both legs and funding over the hold, signed [R1].
(A8) *Unit:* net return on equal notional per entry. (A9) *Null:* per entry,
3 random public trades in the same instrument and the same UTC hour of the
same day (the tracked accounts' trades removed by trade ID if R1 confirms the
match [R1]), each keeping its own taker direction, with the same delay,
holding time and costs; fixed seed; d = tracked − the mean of its nulls.
(A10) *Honest N is traders:* a paired bootstrap clustered by trader (2,000
resamples), and by calendar day as a second clustering. (A11) *The verdict,
one look, the primary cell only:* **PAYS** only if (i) the mean tracked net
return is above zero with its trader-clustered 95% interval above zero, (ii)
the mean d is above zero with its 95% interval above zero under both
clusterings, and (iii) the exact two-sided sign test, one vote per trader (its
mean d), gives p < 0.05 in favour; **TOO FEW TO TELL** under 20 traders with 5+
entries or under 300 entries; **FAILS** otherwise. The upper end of d's
interval is always printed against the round-trip cost. (A12) Secondaries —
other delays and horizons, the ratio arm, adds, categories, hours, sessions —
decide nothing. (A13) *Frozen before the look:* a rules file with every
threshold, committed and recorded here; the capture stored with its read
instant; the analysis reads only the capture (polymarket-lab 2026-09-04: an
experiment that reads a live collection has no fixed answer); a changed
threshold makes a new run, never a revision.
**B — SKILL OR LUCK?** (one study with A, the same pool) (B1) *Reappearance:*
weekly boards rebuilt within the pool from fills (Monday 00:00 UTC; PnL =
realized − fees, funding estimated and stated), directional accounts only;
the share of week w's PnL top 50 also in week w+1's, against the same share
on the notional board. Find on the first half of the weeks, confirm on the
second; **kill** in the find half unless PnL reappearance exceeds notional
reappearance with a week-block bootstrap interval excluding zero. (B2)
*Persistence:* rank on PnL / notional over 4 weeks, measure the next 4;
Spearman and the top fifth minus the rest against 2,000 permutations; find on
the first pair, confirm on the next; **kill** if the find pair's correlation
is ≤ 0 or its permutation p ≥ 0.05. (B3) Under 8 weeks of history [R1], B is
"not testable yet" and becomes a forward measurement on v1's stored weekly
boards. (B4) A board rebuilt inside the pool is not the real board; stated.
**THE OWNER'S RULINGS WITH IT:** (1) **"Too few to tell" counts as not
proven:** v1 is then planned as a watching tool and the forward paper-follow
log is the real test. (2) **If following fails,** alerts still fire, as
information about what a trader did; what goes is the copy framing and the
scoreboard's headline place. (3) **Bulk research data** goes gzip-compressed
to `F:\polymarket-follow-research\` (E: 16 GB free, 92% full; F: 1,556 GB
free — measured 2026-11-06 22:18Z).

2026-11-06 (the research phase approved — the owner, recorded by this
project's supervisor in its first session): **THE RESEARCH PHASE STARTS, IN
THREE WAVES.** The supervisor's first report (2026-11-06, from the saved spec
in `verify/SEED-PERPS-1106/`) found the founding docs short of what the spec
says: the leaderboard pages only to rank 1,000; the spec publishes each
endpoint's request weight (fills, position-fills, trades and funding 10;
portfolio, leaderboard and klines 5; fills and position-fills cached 2 s, a
cached read costing 1); `trade_id` is a plain JSON integer already at 94.6% of
JavaScript's largest exact integer; `/v2/info/pnl` is not in the saved spec;
money fields are decimal strings of up to 28 digits; and "both sides at once"
cannot be read from one account's net position. R1 corrects external-apis
with live evidence; R2 redefines the style features. **The owner approved, on
the supervisor's recommendations: (1) THE WAVES.** Wave 1: R1-API, R4-NOTIFY
and R5-TOOLS in parallel (Sonnet 5.5, effort xhigh). Wave 2: R2-STYLE and
R3-PAPER (Opus 5.5, effort max — their output decides something: a ship gate
and the honesty method), with R2-LABELS, a blind re-check of R2's labels
(Sonnet 5.5, xhigh). Wave 3: R6-STORAGE and R7-PAGES (Sonnet 5.5, xhigh).
Waves 2 and 3 are revised with the owner's lessons from polymarket-lab and
shown to the owner before they start. R6 waits for R2's fill rates by style
instead of running beside R1 as the plan page said, because **every subagent
that calls the API shares one IP budget** — with each other and with this
machine's other traffic. **(2) THE WEIGHT CHECK:** R1 runs 10 minutes of
steady load at the planned rate (half the budget), which must see zero 429s,
plus ONE ceiling test on fills that stops at the first 429 and pauses 2
minutes — the one deliberate touch of the limit, because the replies carry no
rate-limit header to confirm the published weights by. **(3) TASK
SCHEDULER:** R4 prepares its test task; the owner registers and runs it at a
time agreed with the supervisor (no persistent setting without the owner's
yes: WORKFLOW). **(4) THROWAWAY MEASUREMENT SCRIPTS** in a subagent's own
`workers/<NAME>/` folder are research, not code — like the founding probe; no
app code and no package installs until the owner approves the v1 plan. **(5)
THE OWNER'S RULE — EVERY REPORT GOES BEYOND ITS BRIEF:** besides the
variations, possibilities, problems with their handling and unknowns
(2026-11-06, three more of the owner's requirements), every report has a
"Beyond the brief" section — what nobody asked but matters — and ends with
its questions for the owner, each with a recommendation. The owner: "think
out of the box, try to get everything, predict everything ... all your
subagents which will work should work on same way until we define 100% what
we doing and how we doing." **The rules for every subagent that calls the
API:** the user agent `polymarket-follow-research`; a fixed token share each,
all together at most 500 weighted tokens a minute (half the published 1,000);
stop at the first 429 and pause; no calls during polymarket-lab's nightly
window, 02:35–03:50 UTC; Node's built-ins only.

2026-11-06 (three more of the owner's requirements, before this project's
supervisor starts — recorded by polymarket-lab's supervisor): **(1) ALGORITHMS
AND MARKET MAKERS ARE ALWAYS RECOGNISED, NEVER FOLLOWED BY MISTAKE.** The live
check that founded the project (2026-11-06) found the all-time #1 of the perps
leaderboard making 100 fills in 64.4 minutes across 7 instruments — 48 adds,
52 reductions, every one a taker fill — while holding 11 positions at once: an
algorithm, whose alerts would mean nothing to a follower. The owner: "we need
to avoid this and always recognize so to not get into trap." So every account
the project stores carries a style label computed from its own fills (trades
per day, holding time, both sides at once, positions held), shown wherever the
account appears; alerts and the paper-follow scoreboard cover directional
traders by default; favouriting an account labelled an algorithm or market
maker warns first. R2 designs the classifier and proves it on labelled
examples before v1 is planned; v1 does not ship without it. **(2) EVERYTHING
IS RESEARCHED BEFORE ANYTHING IS BUILT** — the owner: "everything need to be
fully researched all variations, all possibilities, all potential problems,
and everything before i start." Every research report states the variations it
weighed, the possibilities it found, the potential problems and how each would
be handled, and what stays unknown; the supervisor walks the owner through the
reports, and nothing is planned or built until the owner says the research is
complete. **(3) THE LAB'S DATA DOES NOT CARRY OVER TO PERPS.**
polymarket-lab's three months are prediction-market data — its forecasts,
scores and a daily top-50 leaderboard of prediction-market traders since late
August 2026 (its `leaderboard_snapshots`) — and perps is a separate exchange
with its own traders, so perps starts from its own API. When prediction-market
traders are added (the plan page's backlog), that leaderboard series is worth
a one-time read-only export: no API can backfill standings over time
(polymarket-lab's master-plan), and reading is not writing (Iron Rule 2).

2026-11-06 (polymarket-follow founded — the owner's decisions, recorded by
polymarket-lab's supervisor before this project's own supervisor starts):
**A SEPARATE PROJECT, WATCH-ONLY.** The owner wants to follow Polymarket
Perps traders — the leaderboards, favourites, a notification when one opens
or closes a position, statistics on how they trade, and an honest
paper-follow log — outside the forecasting lab ("all of this not have
relation with our laboratory forecasting"). **(1) Its own repository and its
own supervisor chat,** not a module of polymarket-lab: two supervisors in one
repository would edit the same shared files, a failing test here would block
the lab's checks, and this project reads prices and follows wallets, which
the lab's price-blind rules forbid there. The lab's way of working, stack and
documentation system are copied, never shared (the owner: "if you think it is
better like that"). **(2) Watch only:** no order code, no trading keys, no
automatic copying; public endpoints only (CLAUDE.md, Iron Rule 1). **(3)
Perps first,** prediction markets later ("let's try first only with perps").
**(4) Windows notifications first,** other devices and email later. **(5)
Favourites 5–50,** the polling interval set by research from the API's real
limits. **(6) Keep the data,** in this project's own database with its own
backup folder. **(7) Research before the plan, the plan before code:** R1–R7
(the plan page), then a v1 plan the owner approves; the owner is open to
paying for data if research shows a need. **(8) The paper-follow log is
honest by design** (Iron Rule 4): polymarket-lab's F9 probe (2026-09-04, 660
wallets) found tracked top wallets' entries predicted 1–24 h price moves no
better than random trades in the same markets at the same hours, so only a
record kept after following starts, net of the alert's delay, fees and
funding, can show whether following pays. **(9) The simplest good solution,
following current best practices,** checked against official documentation
or the web when unsure — the owner's standing approval, as in forecast-site
(2026-10-28) and polymarket-lab. **VERIFIED BEFORE FOUNDING** (live calls
2026-11-06 13:59Z and 14:35Z; the supervisor folder's
`verify/SEED-PERPS-1106/`): the public leaderboard, fills and open positions
by address, the rate budget — docs/claude-external-apis.md.
