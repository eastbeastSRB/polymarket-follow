# FABLE-REVIEW — a cold, independent review of the whole project

FABLE-REVIEW (Fable 5.2, max), 2026-11-25 11:51Z – 12:15Z and, after the PC's crash, 12:23Z – 12:29Z (UTC;
every stamp from `date -u`), for polymarket-follow's supervisor and the owner. A fresh read of the record as
it is on disk, with no stake in it, before the next big decision (decisions 2026-11-25, "the owner's talk
after look 1", ruling 3). **A review decides nothing:** the supervisor and the owner rule on it. It
recommends research and what the tool shows, never what to trade.

**The PC crashed while this review was being written.** A blue screen, bugcheck 0xA, at 12:15:41Z, a minute
after this file was first saved. The session restarted and I finished from the file on disk, read again
whole. It changes two findings on the data's protection: H2 and the memory finding, which is now H5.

**The limits held.** No program of the project was run and nothing was fetched. Nothing on F: was opened: no
recording, no store, no look's output. Not opened: the collector's run folder and database, polymarket-lab,
and in the supervisor's folder HANDOVER.md, `sessions\`, `drafts\`, `verify\` and every other worker's folder.
There I read WORKFLOW.md and LESSONS.md and wrote my own `progress.md` (at 12:07Z I copied my two scratch
files beside it by mistake and removed them the same minute). No web page was read: the review argues from
the record's own numbers. No agent was started. In the repository only this file and its README row changed.
After the crash I ran two more read-only checks: the System log's last bugcheck events, and `git fsck` (H5).

**What I read** is listed in section 8, with what I read only in part. **Numbers:** every number is quoted
from the record with its place (line numbers as of commit `64e6dec`; the decisions log by its dated entry,
because its lines move). Where the arithmetic is mine it says "my arithmetic"; section 9 gives its inputs and
formulas. Those are sums on numbers already on record, never a run on data.

One bps is 0.01%. "± x" is one standard error.

## For the owner, in one page

**What is solid**

- **The work is honest and the numbers are right.** Every result that mattered was fixed in rules before
  anyone looked, and then recomputed by a second program written from nothing. They agree to the last digit.
  No number in the record needs to be taken back.
- **Copying the leaderboard's traders on Polymarket did not pay.** Four separate measurements say the same
  and say why: those traders leave within the hour, and a round trip's cost is larger than the small move.
- **The recordings are an asset nobody else has:** every book and trade of a young exchange since
  2026-11-10.

**What look 1 really says**

- **It was not a failure of the work, and the record had foreseen it.** Before the freeze the project's own
  projection gave "HOLDS" about a 4% chance at look 1. The test was so strict, on so few crash days, that it
  could hardly say yes or no.
- **What it does tell:** the +200 on the practice months was mostly a few lucky crash days. On months nobody
  had seen, the same rule made about zero, give or take 90.
- **The wave's story is one number shrinking each time it met new data:** +310 where it was found, +83 on
  Hyperliquid's ten months, about 0 on the fresh months. The honest reading: at most a small edge, and most
  of it is the whole market bouncing after a crash. At that size it cannot be proven in less than about two
  to seven years of new data. Stopping the polishing was right. Look 2 cannot change it: the new days would
  have to average about +300 to +500 for a yes.

**The one habit to change.** WAVE-H and the exam were built with great care and could not give a clear
answer, and each time that could be seen before the build. Look 2 would be the third. From now on the first
page of every plan should say the most likely result, and the chance of a clear yes or no. Build only when a
clear answer is more likely than not.

**The road**

- **COPY-H is the right last big question.** It is the project's founding question, on the only data large
  enough to answer it. Its plan must show, before anything is built, that it can give a clear yes or no. It
  should use the paper experiment's frozen rule unchanged, with no tuning, and say in advance that a "no"
  closes copying for good.
- **The two forward tests:** 2026-12-19 will most likely say "too few to tell" for both. That is their
  design, not bad news, and they cost nothing to run. By May the copying test can say "drop"; MARKET-1 can
  confirm only a large effect.
- **v1 stays on hold.** If COPY-H or MARKET-1 says yes, v1 has a purpose and a shape. If nothing passes, the
  honest v1 is none.

**Three things for this week**

1. **A second copy of the recordings on another disk, and the memory test your own rule now calls for.** The
   recordings exist once, on one hard disk, in a PC that showed memory faults on 2026-11-20 and stopped with
   a blue screen today, while this review was being written. They are small: about half a gigabyte a day.
2. **A count and a ruling on the paper experiment's two stock-split days** (INTC, SNDK). The frozen program
   refuses them at every run. Left alone they can withhold December's look, and three more such days would
   stop both forward tests from reading anything new.
3. **Fifteen minutes on where you would act:** the venue, the size, what its rules allow. It sets the bar
   for COPY-H. The record says Finotive forbids copying.

**When to stop, honestly.** After COPY-H's one look, no new research is built unless a frozen test has said
a clear yes. The forward tests run on to 2027-05-08 at no cost. Then the project becomes what passed, or it
closes with its record, which will have saved you from paying the market to learn the same things.

---

## 1. Findings, by severity

### High

**H1. Two market-days of the paper experiment are refused at every run, and the frozen code has no way past
them.** Found by reading the code against one line of the record; not measured (I may not open the run
folder).

- **The record:** decisions 2026-11-24, "LOOK 1: THE REPRODUCTION PASSED…": "The paper's two daily warnings,
  'two settlements in one hour' for iid 23 INTC-USD and iid 29 SNDK-USD, are the venue's stock splits … The
  frozen reader refuses those days, by design." The split rule itself was written when the split events
  "have never been seen non-empty" (decisions 2026-11-12, "the paper experiment's two fresh reviews", (5)).
- **What the code does with a refused day:**
  - `src/paper/reader.ts` line 213 throws on two settlements in one hour, so the day is never written;
    `loop.ts` lines 252–270 try it again at every run. There is no list of days given up.
  - `market.ts` `joinDays` (lines 92–94) ends a market's price history at its first missing day. So every
    copy in that market that needs a price after the split day is unpriced (rules R9, lines 238–239), not
    only the copies open across the split (R6).
  - R12 (line 281) withholds MAIN when more than **2%** of its copies are unpriced.
  - `loop.ts` lines 37 and 135–138: five failed reads in a row end a run ("api failing"). A week that holds a
    refused day is never "done" (`weekDone`, lines 204–224), so every run tries that day again before it
    reaches the current week; the fills reads of a finished week return without a read (line 147), and only a
    successful read sets the count back (lines 163 and 261). **So the two refused days count 2 of 5 at the
    start of every run once their week is past. Three more refused market-days, from any cause, would stop
    every daily run's reading before it reaches anything new.** MARKET-1 takes its fills and its fallback
    prices from the paper experiment's store (its rules M2, M8), so it would stand still too.
- **Not checked:** how many of MAIN's copies sit in the two markets after their split days; whether the
  split events carry a numeric instrument id (without one, R6 takes every equity market out of the primary
  cells while the event is listed); whether more such days have come since 2026-11-24.
- **Why it matters:** a WITHHELD on 2026-12-19 for a mechanical reason would be the third reading in a row
  that settles nothing, after WAVE-H's NOT SETTLED and look 1's WITHHELD. The hole does not heal, so it
  would return at every look.
- **Recommendation:** count now, from the daily log's summary line (`daily.ts` lines 257–259 print the split
  events and the copies unpriced by them) and the page's unpriced counts. Those are counts, not results.
  Then a dated ruling before 2026-12-19: accepted as it is, with the arithmetic written down, or a defect
  fix by R0's route, its rule fixed without reading any result. `loop` and `reader` are among MARKET-1's
  eleven paper files (architecture, lines 205–209, 225–226), so a fix re-freezes both programs.

**H2. The recordings still have one copy.**

- **The record:** architecture line 91, "The stream files have no second copy." Decisions 2026-11-10,
  "round 2's rules and the collector approved", (7): "until that copy, an F: failure loses the recordings."
  STRATEGY-REVIEW, 2026-11-12, lines 44 and 129–131: the owner's first next step, "this week". Decisions
  2026-11-13, "the owner's rulings after MARKET-1's deploy", (3): the space "within one to two months".
- **Why now:** they are the one thing that can never be read again; every price of MARKET-1 comes from them
  (its rules M7); F: is a hard disk (decisions 2026-11-17, F3); since 2026-11-20 the PC has shown memory
  faults; and on 2026-11-25 at 12:15:41Z it stopped with a blue screen (H5). The data is small: about 0.5 GB
  a day by the record's own figure.
- **Recommendation:** an external disk now, not in January. Each closed day copied and checked against the
  SHA-256s in its own `manifest.json`, then weekly. The supervisor's folder goes on the same disk (M7).

**H3. No test was asked, before it was built, whether it could answer.** This is the root of the
disappointment, and it decides whether COPY-H repeats it.

- **WAVE-H** decided on slice 0 alone (error 40.9) when all 147 slices gave 31.3; its Final review said so
  after the look (decisions 2026-11-17, "WAVE-H's Final review accepted").
- **The polishing plan said it on its owner's page:** "A pooled wave of about +60 bps would most likely come
  back NOT SETTLED again" (`wave-polish-plan-2026-11-17.md` lines 82–83; its power table, lines 562–575).
- **The polishing then made the rule harder to prove, not easier.** The window error at 100 days went from
  58 for the unpolished pooled wave (decisions 2026-11-19, "the exploration's five steps ran"; 54 in the
  plan's model, its line 566) to 77 for N and 110 for the 715 line (`polish/rules.md` lines 363–370); look 1
  measured 91.7. The plan's own "strongest lever on paper", shorter holds (lines 580–582), is not what came
  out.
- **The exam's own projection:** P(HOLDS) 4.3% at look 1 and 10.1% at look 2 (decisions 2026-11-19, "the
  exam's placebo and WITHHELD projection ran"). DOES NOT HOLD needed a mean below −211 (my arithmetic:
  50 − 2.847 × 91.7), which a true effect of zero gives about once in a hundred. So a reading that ends
  nothing (NOT SETTLED, LIKELY or WITHHELD) was about nine cases in ten or more, whatever the truth between
  0 and +150.
- **The bars and the effect's size do not meet.** With a 99% bar and the owner's line at +50, an effect of
  the size seen (+50 to +80) gets neither verdict at any sample in reach. For a true +80, HOLDS at four
  chances in five needs an error near 22: about 1.7 years of new months for the unpolished pooled line, and
  4 to 7 years for the polished ones; for a true +50, longer still (my arithmetic).
- **What it cost:** the polishing is 12,931 lines of source, 45% of the repository's 28,810, built in four
  days with over a thousand deliberate breaks.
- **The record hid none of this.** The supervisor wrote "the honest power picture" before the owner's
  ruling (decisions 2026-11-19, "the exploration's five steps ran"), and the owner approved. What is
  missing is a step that acts on it.
- **Recommendation:** a gate on the first page of every plan (section 7, improve 1).

**H4. Look 2 has almost no chance of a verdict. Decide it on that, now.**

- **The arithmetic (mine, from numbers on record):** look 2 pools look 1's days with 2026-11-16 →
  2027-02-06 (`polish/rules.md` P1, lines 97–98). Look 1's 3,000 priced positions sum to +13,378 bps
  (`polish-exam-look1-2026-11-25.md` line 293). The 715 line's error at 182 days is 81.0 on the placebo's
  windows (rules.md line 366), or about 68 if look 1's measured 91.7 is scaled the same way. At z 2.81 HOLDS
  needs a pooled mean above about +190 to +228. So the new positions would have to average **about +300 to
  +500** (5,000 to 2,500 of them), and for DOES NOT HOLD **about −230 to −400**. LIKELY needs nearly as much
  as HOLDS.
- **It may also withhold again:** the review's M1 (lines 38–45), from the archive's thinning books.
- **Its cost:** FRESH-2's download (about 80 GB by the plan's line 599), a later build under its own freeze,
  the rehearsal, the reproduction and a Final review.
- **Recommendation:** a dated entry now, before FRESH-2's listing or data is touched: look 2 is not built,
  and the exam ends unresolved at look 1 (WITHHELD; as priced, NOT SETTLED). It is a stop decided on what
  look 1 already showed and on arithmetic, not on any new outcome, so it is honest. FRESH-2's months then
  stay unseen for whatever is tested next. If the owner wants the frozen form kept, run it knowing its
  likely word in advance.

**H5. The PC is not stable: four memory faults on 2026-11-20, and a blue screen today.** This was M5; the
crash during this review moved it up.

- **Handled well on 2026-11-20:** each fault was traced to one bit (decisions 2026-11-20, "LOOK 1 PAUSED":
  mantissa bit 22, exponent bit 55); nothing wrong was kept; FRESH was built twice and held equal; the
  reproduction ran again; independent code recomputed the look.
- **What stayed true after it:** four events in one day, on four modules from two kits. A file misread
  after its checksum and the collector's 0xC0000374 came in the night's heaviest load. The two flips came in
  the afternoon's reproduction runs, for which the rule was "Nothing heavy runs beside them" (decisions
  2026-11-20, "THE EXAM IS FROZEN" and "LOOK 1 PAUSED"). So heavy load was not the whole of it. The test that
  passed was Windows' standard one, 39 minutes at rest (decisions 2026-11-24).
- **Today** (the System log, read 12:24Z): "The computer has rebooted from a bugcheck. The bugcheck was:
  0x0000000a (0x0000000000000028, 0x0000000000000002, 0x0000000000000000, 0xfffff80378e1ec76)", with a dump
  in `C:\WINDOWS\Minidump\112526-6578-01.dmp`; the shutdown at 12:15:41Z "was unexpected". It is the only
  bugcheck in that log. Its two older unexpected shutdowns (2026-09-21, 2026-09-26) carry no bugcheck code
  and are from before this project.
- **What it is, and is not yet:** kernel code read an address near zero at a raised interrupt level (the
  parameters as Microsoft's bug-check reference describes them; not re-read today). A faulty driver and bad
  memory can both do that, and the dump names the module. Until it is read, this is "the PC is not stable",
  not "the memory again". It came one day after the test's "detected no errors", and I do not know what
  else ran in that minute.
- **The owner's own rule covers it:** the trigger was "… or the collector crashes again. Then the owner
  runs Windows Memory Diagnostic before the work goes on" (decisions 2026-11-20, "the memory test"), and a
  PC that stops takes the collector with it.
- **At risk:**
  - every crash is a hole in the recordings that can never be filled, and a file being written can be torn
    (this report was saved a minute before the crash and is whole; `git fsck` at 12:24Z is clean);
  - the forward tests need this PC for 164 more days, to 2027-05-08, and each look runs once by its frozen
    rules (`look <1|2|3>`, "once each");
  - MARKET-1 withholds above 10% of positions not priced at the book, and a leg inside a gap is priced at
    the mark (its rules M7, M8, M11): frequent crashes, or one long outage while the owner is away, spend
    that margin;
  - the exam's guards are not on the live programs: the collector writes each line once, and a flipped
    digit still parses.
- **Recommendation:**
  1. the dump read and the bugcheck recorded in decisions, before it is blamed on anything;
  2. after any crash, a fixed check before the work goes on: the collector's gap in `coverage.jsonl`, the
     recordings' open hour, the files a daily run rewrites, the database, `git fsck`;
  3. the memory test the rule asks for. The standard one passed on 2026-11-24 and the PC crashed the next
     day, so a longer one under load is what would tell more; it is the owner's call;
  4. for every forward look, nothing heavy beside it, and its result recomputed by independent code before
     the owner reads it;
  5. the RAM setting stays the owner's ruling (decisions 2026-11-20, where the record names the usual
     remedy); this review does not reopen it.

### Medium

**M1. The check months were not clean for the family that won.**

- WAVE-H's look printed all ten months, the check months among them, and showed that bigger waves did
  better (M doubled +205.9 ± 104.6, M halved +10.8) and that February 2026 was the best month (decisions
  2026-11-17, "WAVE-H — THE ONE LOOK'S RESULT").
- The plan's review said the look "printed all 10 months, E and C included", so its leads are clean on
  neither part (`wave-polish-plan-review-2026-11-17.md` lines 210–216). The try log marked W2 (M doubled)
  seeded, and W4, the same idea counted venue-wide, not seeded (`polish/tries.md` lines 124–130).
- So "a useless unseeded change reaches FRESH at most 1.8% of the time" (decisions 2026-11-19, "the
  exploration's five steps ran") understates the luck, and "passed the check months" was not an independent
  confirmation. The gate there was one error (t ≥ 1.0); 75% of the gain was two neighbouring days,
  2026-02-05 and 02-06; without the five best days the check months read −23.4
  (`polish-explore-review-2026-11-19.md` lines 41–43).
- **The cost was hope, not validity:** FRESH's bar was untouched, as the plan's review said ("a wasted exam
  is the cost, never a false HOLDS").

**M2. A few cascade events decide every wave number.**

- "Twenty of 3,085 episodes make 99% of E's gain; the five largest, all on 2025-10-10 between 20:53Z and
  20:54Z, make 46.5%" (`polish-explore-review-2026-11-19.md` lines 44–45). One position per cascade gives
  −3.6 ± 69.2 on the explore months. On FRESH two days are 11.16 times the line's sum, and the event-level
  line is −29.2 ± 77.5 (look 1's report, lines 111, 120–123).
- The deciding number is a mean over positions, and a crash day opens thousands of them the same way. The
  error by day is honest about that, but the question becomes "do the next three cascades bounce", which a
  few months cannot settle.
- The move is the market's: "92% and 97% of the gross is the other small coins' own move" (OWN +10.0 and
  +7.5; decisions 2026-11-19, "the exploration's Final review verified"). The review named it plainly: "buy
  the small coins after a market-wide liquidation cascade, hold a day".
- **For any later test:** where a few days dominate, let the per-day or per-event mean decide, or make its
  sign a condition, as F8 did for the book-priced mean.

**M3. Two prints that close the wave's story are computed and not on record.**

- `look1\report.json` holds, at the tape, B0 on all 147 slices of the deciding days and the discovery
  window (`polish/rules.md` P13, lines 467–473). Decisions 2026-11-25 ("LOOK 1'S VERDICT") lists the months,
  the sides, N, the 1,391 cut and the tape line, and neither of these; the look's report says it did not
  recompute them (its line 360).
- **B0 on FRESH** is the unpolished wave on new months: the one reading free of the polishing's choices, and
  the plan's own recommendation ("print B0 on FRESH beside N", its line 407).
- **The discovery window on Hyperliquid** (2026-08-31 → 11-07) shows whether the +310 of those weeks was
  the market's period or Polymarket's own.
- **Recommendation:** the supervisor copies both into a decisions entry, labelled "beside, decides nothing".
  I may not open F:, so I do not know them.

**M4. Where the owner would act is still open, and no result's worth was ever sized.**

- Open since 2026-11-10 (decisions, "round 2's rules and the collector approved": "that can come later");
  asked again by STRATEGY-REVIEW on 2026-11-12 (lines 90–93, 129–131); still ⏳ on the plan page ("The
  owner's own execution venue and costs").
- **It changes what is worth testing.** "Finotive's terms prohibit copying third-party trades or signal
  providers" (reviews README, PAPER-PLAN's row; decisions 2026-11-12, "the paper experiment's plan
  approved", Q7). A copying "yes" could not be used there.
- **The wave's worth, had it held** (my arithmetic on WAVE-H's own numbers): 1,299 positions in 301 days at
  +82.6 bps of $1,000 is about $1,100 a month, with up to 56 positions open at once and a worst fall of
  about $2,000 (decisions 2026-11-17, "THE ONE LOOK'S RESULT": the tail). At $10,000 a position the entry
  alone costs 31.4 bps on the explore months (the exploration review, "Trading at a larger size"). The
  account-level check (H12 on the plan page) was planned for after the proof; done first, it would have
  shown how much the proof was worth.

**M5. The memory.** Moved to H5 after the blue screen of 12:15:41Z. The number is kept so that the others
do not move.

**M6. The state files carry stale or disproved statements, and the guards meant for day one were never
built.**

- **The plan page, the polishing's row:** "278 with too little book depth in the crash hours". The Final
  review disproved it the same day: at the book no leg was short; the cause was the archive's snapshot
  cadence (decisions 2026-11-25, "LOOK 1'S FINAL REVIEW"). The row and "Where it stands" also keep "left
  out", the wording that entry corrects, and the row's "Now:" still waits for a review and a talk that have
  happened.
- **Architecture** (last touched 2026-11-20 13:37Z, before the freeze): line 323, WAVE-H "not frozen, not
  run on TEST"; line 750, the exam "not frozen; FRESH sealed"; lines 173–183 and 259–266, "How it is to run
  (prepared …) Neither is done before the freeze". Its line 3 says "no plans, no history"; its headings are
  build histories.
- **CLAUDE.md** lines 51–52: the exam "not frozen".
- **The reviews' README:** look 1's row "pending: the supervisor's decisions entry" (the entry exists);
  STRATEGY-REVIEW's row "waiting for the owner" since 2026-11-12.
- **LESSONS 17** ("Size budgets and guards from day one") waits on the skeleton, which is ⬜. Meanwhile
  decisions is 390 KB, architecture 60 KB, the plan page 49 KB with one table row of about 5 KB.
- **A review's findings have no owner.** STRATEGY-REVIEW's two "this week" steps of 2026-11-12 (H2, M4) are
  still open; nothing tracked them.
- **None of this is dishonest:** decisions is true and current. It is the three state files that drift.

**M7. Other single points.**

- **The supervisor's folder** (every worker's evidence, the supervisor's own checks, the transcripts) is on
  E: outside git; WORKFLOW's "The archive" names no copy.
- **E:** was 92% full (WORKFLOW, "Shared machine"). It holds the run copies, the heartbeat, the locks, the
  logs and the E: backups, and the collector watches only C: and the recordings' disk
  (`src/health/disk.ts` lines 28–45).
- **The backup task:** architecture lines 78–79 say "prepared … waiting for the owner's re-run"; the plan
  page says "registered by the owner (2026-11-11)". One line should say whether the daily dump runs and when
  it last passed.
- **Nobody watches while the owner is away.** The supervisor is a chat. The 5-minute check restarts the
  collector, but a daily run that ends "api failing" (H1), or a PC that does not come back from a crash
  (H5), would wait for the next session.

**M8. Each unclear result grew a variant, and the headlines ran ahead of the stated power.**

- The chain: the wave (+310, exploring) → WAVE-H (NOT SETTLED) → the polishing → the 715 cut, chosen on a
  seeded print with "the honest gap" recorded (decisions 2026-11-19, "the exam's recipe") → "the crash side
  only", recorded after look 1. Each step is labelled honestly; the chain itself is the forking path.
- The headlines: "THE NOMINEE … PASSED THE CHECK MONTHS AND GOES TO FRESH", with the 4% lower in the same
  entry; the plan page's "positive but short of the 99% bar, with clear leads". The owner's "pretty sure we
  will have better results" (decisions 2026-11-25) is what that order of words produces.
- WORKFLOW's "Frame findings positively" is the owner's wish and a fair one. It needs one fixed line beside
  it: the most likely result, in plain words, at the top.

### Low

**L1. WAVE-H's summary reads stronger than its numbers.** +82.6 ± 40.9 is two errors. Slice 0 sat in the
upper fifth of the 147 (+94.9 on marks against +66.1 for all; `wave-h-look-2026-11-17.md`, the owner's
page). The positions priced at the book at both ends made +61.8 ± 42.9, and the 197 priced from the tape
+197.4 ± 124.9 (decisions 2026-11-17, "WAVE-H's Final review accepted"). "With clear leads" names three
differences, each inside its own error.

**L2. Dated triggers passed with no ruling on record.**
- D1, the classifier v2's blind test: "Trigger: 2026-11-21" (the plan page; current-task, "Next up" 5).
- MARKET-1's second arm: "Trigger: the polishing's freeze", fired 2026-11-20; its premise, a proven polished
  rule, is gone, and W4's venue-wide count cannot be made on Polymarket, where a liquidation shows only in
  the pool accounts' own fills (MARKET-FIND, the owner's page).
- The backlog's "Trigger: the owner's talk" lines (AI, the variations, WAVE-L): the talk ruled them, and the
  lines still wait.
- "Done lately" keeps entries of 11-06 to 11-09, past its own two weeks (the plan page, line 13).

**L3. Small.**
- "15½ months" (decisions 2026-11-25) against "about 18 months (2025-05-25 → 2026-11-15)" (the plan page's
  COPY-H row): the sizing months make the difference, and COPY-H's plan should say which it uses.
- COPY-PLAN (decisions) and COPY-H-PLAN (the plan page) are one worker.
- The plan page's path `F:polymarket-followmarket1pageindex.html` lost its backslashes.
- WORKFLOW names Fable 5.1 for cold reviews; this one and STRATEGY-REVIEW ran on 5.2.
- The lock read a reused pid as a live holder after the restart of 2026-11-20 (an 8-minute gap, decisions
  "LOOK 1 PAUSED"); it is not among current-task's collector follow-ups, and restarts are no longer rare
  (H5).
- current-task was last rewritten before the talk. The session is still open, so this is only a note.

---

## 2. Question 1 — the findings

**Sound**

1. **Copying the top directional traders on Polymarket lost about a round trip's cost.** R8: −16.6 bps an
   entry, [−30, −6], no better than random trades. FIND-6: about −13. FIND-6-EXITS: −15.8 ± 4.9 with the
   exits copied. The cause is measured: a median hold of 47 minutes, −5.4 bps before costs, a round trip of
   about 10. Four measurements, each recomputed independently.
2. **The boards' tops are mostly algorithms, market makers and quiet accounts** (R2), and a trader's profit
   is not a follower's (#47: FIND-2).
3. **Every computed number.** WAVE-H, the exploration and look 1 were each rebuilt by code that shares
   nothing with the program, the known answer first.
4. **FRESH gives no support to an effect of +200.** The 715 line, N, the event level, the book-priced
   positions and the tape line all lie within one error of zero (look 1's report, section 3).
5. **The facts about the APIs and the archive** in external-apis, each dated and sourced.

**Weaker than the record says**

1. **"Traders do not differ."** FIND-1 could see a spread of about 46 bps, and FIND-6 only 65–95. It is "no
   large difference in ten weeks on a new venue", and the Final reviews say so; the plan page's short form
   ("copying traders did not pay") is fair only for the top-of-the-board traders it measured.
2. **The wave as "the one lead".** +310 ± 68 came from 68 days of one market period, after some forty
   printed explorations of the same weeks (STRATEGY-REVIEW's eleven, MARKET-FIND's eighteen and eleven). At
   the same moments ETH came back +111 and BTC +62 (`market-find-2026-11-13.md`, the owner's page): those
   were the market's own lows. See L1 for WAVE-H.
3. **"N passed the check months."** M1.
4. **"One real test" on FRESH.** H3: it could give one reading.
5. **"FRESH's ~0 makes a large change unlikely"** (decisions 2026-11-25, ruling 6). FRESH's range at 95% is
   about −175 to +184 (my arithmetic). It rules out +200, not +83. The right sentence is "the wave cannot be
   shown", not "the wave is zero".
6. **The best remaining lead is the forced-sell side,** and it is no more than a lead. It is the one reading
   with the same sign in both samples (+121.9 ± 51.7 on WAVE-H's months, +83.4 ± 61.5 on FRESH; together
   about +106 ± 40 by my arithmetic, which mixes two rules and is description only). It is the size of the
   base wave, it is "buy the crash", and it carries H3's arithmetic: years to prove.

**Missed**

1. **Whether each test could answer** (H3), and what an answer would be worth (M4).
2. **The stock-split days against the 2% rule and the breaker** (H1).
3. **The two prints already computed** (M3).
4. **The book cadence before the freeze.** The listing's size column was already read for the days without
   books; the review's own M2 says it.
5. **A futility rule.** The verdict ladders say when a test is won or lost. None says "this test can no
   longer answer; close it" (H4).

## 3. Question 2 — the methods

**Where they were strong.** These are the project's real product so far, and worth keeping whole.

- **Rules before results, held by machinery.** A freeze is a list of hashes under a git tag, and the readers
  refuse sealed data in code until that list verifies. "A run that crashes before its result exists is not a
  look."
- **The order of the record is proven:** counts committed before prices existed (look 1: 10 h 39 min before
  step 2).
- **Independent recomputation,** by a fresh model with its own code, proven first on a known answer, down
  to its own LZ4 decoder.
- **Deliberate breaks** of what decides, in the hundreds, each killed or explained.
- **Controls that bite:** the matched random-trade null, the placebo gate that set z from sign flips by
  day, BASE and OWN, the two-way error, the event-level and leave-one-out prints.
- **Honest labels:** "exploring", "seeded, decides nothing", the safety net read from counts alone.
- **The reproduction** caught two flipped bits that nothing else would have.

**Where bias still got in**

1. **Only one kind of error was budgeted.** Every budget (5% over three looks, 1% over two, 3.7% for the
   search) guards against a false yes. Nothing guarded against "could not tell", which is what happened at
   WAVE-H and at look 1, and is the likely word of look 2 and of December (H3, H4, section 6).
2. **Selection inside months already looked at** (M1), and the 715 cut after the review showed where the
   gain sat (M8). Both were recorded as such; both raised hope and cost power.
3. **Concentration** (M2): a mean over positions when five events carry it.
4. **Thin-tape prices flattered the practice numbers.** Depth-short legs at the tape were 22% and 38% of
   N's positions and carried 58% and 46% of its gain; on FRESH the depth-short positions are again the
   best-looking group (+208.6 against −16.4). The exam's rules guarded against it (WITHHELD, F8); the
   exploration's headline numbers did not.
5. **The ladder has no way out for a middling effect** (H3, the bars).
6. **One narrator.** The supervisor plans, briefs, verifies and writes the record, under a rule to frame
   findings positively. The fresh reviews check the arithmetic against the rules, by design. Only the cold
   reviews ask whether the question is worth asking, and their findings had no tracker (M6).

## 4. Question 3 — the record

- **True:** yes. I found no number in decisions that its sources contradict, and its two wrong wordings were
  corrected in a later entry on the same day.
- **Current:** decisions, yes. The plan page, architecture, CLAUDE.md and the reviews' README each carry
  statements that are no longer so (M6, L2).
- **Usable:** less each week. Decisions is 390 KB and append-only, so a superseded line still reads as
  standing; build workers' "technical calls" entries run past a hundred lines each; no index says which
  rulings are in force. The plan page's rows have become histories. current-task is the right size.
- **What I would do, small:**
  1. one sweep that makes the four state files true (M6's list);
  2. the docs-size report and the decisions guard now, as a test of the existing package, not with the
     skeleton;
  3. a short list, "rulings in force", in the plan page: one line a standing ruling with its entry's date,
     so that nobody greps 390 KB for the current bar;
  4. each finding of a cold review as a line on the plan page until it is ruled;
  5. architecture's headings as names only; its history is already in decisions.

## 5. Question 4 — the data's protection

| What | Where | Copies | Can it be had again? | Risk |
|---|---|---|---|---|
| The recordings (books and trades since 2026-11-10) | `F:\polymarket-follow\recordings\` | one | no | **high** (H2) |
| The collector's database | C:, MongoDB | daily dumps on F: (14 daily, 8 weekly), the newest on E:, a restore test on Sundays | the boards and the universe: no | low, if the task runs (M7) |
| The paper experiment's files | `F:\polymarket-follow\paper\` | what cannot be read again is copied to E: after each run | fills and minute data: from the API | low |
| MARKET-1's files | `F:\polymarket-follow\market1\` | its list copied to E: after each run | only with the recordings | low |
| Hyperliquid's raw stores (WAVE-H 222 GB, FRESH 161 GB and its books) | `F:\polymarket-follow-research\` | one, with hash lists in the repository | yes, free, days of download | low |
| The analyzer's stores and the looks' outputs | `…\ANALYZER\` | one; the results' hashes in decisions | derived | low |
| The repository | E: and GitHub (3 commits waiting at 12:25Z; `git fsck` clean after the crash) | two | — | low |
| The supervisor's folder | E:, outside git | not stated | no | medium (M7) |
| The run copies and their state | `E:\polymarket-follow-run\` | one; rebuilt by a deploy | yes | E: nearly full and unwatched (M7) |

- **The seals and hash lists** protect against change, not against loss: they will say that a file differs,
  and cannot bring it back.
- **The archive is not fixed.** Its older files were "written in bulk" on 2026-11-03 and its book cadence
  changed three times in 2026 (external-apis). The raw stores on F: are therefore the reference for WAVE-H
  and look 1. Keeping them, as the cleanup of 2026-11-25 did, is right.
- **The cleanup** removed only derived copies, each measured first, with the kept list written down
  (decisions 2026-11-25, "THE CLEANUP ON F:"). Well done.
- **The memory faults of 2026-11-20 and the blue screen of 2026-11-25:** H5. The faults were handled well
  where the exam's guards stood. The live programs have no such guards, and the PC has now stopped whole.
- **Everything is in one room on one PC,** and that PC is the weakest part of the whole arrangement. The
  recordings' second copy should end up off the machine.

## 6. Question 5 — the road ahead

### COPY-H

**Is it the right last big question? Yes, on one condition.**

- It is the founding question, and the first copying test with real size: about 18 months, every account's
  every fill, about 698,000 users in ten of them (decisions 2026-11-19, "the analyzer's store … is
  trusted"), and no leaderboard choosing the survivors. Polymarket's tests had 47 to 330 traders over six to
  ten weeks.
- A "no" there closes copying on both venues. A "yes" gives v1 a purpose. Both are worth having, which no
  wave test could offer.
- It builds on what is already built and trusted: the pass over the raw files, the store's format and its
  gates. It needs a new pass, for every account's fills (the plan page's COPY-H row).
- **The condition:** its plan shows, from counts and before any outcome, that a clear yes or no is more
  likely than not (H3). If it cannot see +10 bps a copy, the paper experiment's own line, it should not be
  built.

**What its plan must get right**

1. **One question, one deciding line, and what each verdict means,** written first: yes → what is planned
   next; no → copying is closed, with no polishing.
2. **The paper experiment's MAIN rule unchanged:** directional by the label, a usual hold of 6 hours or
   more, at least 3 closed cycles. It was frozen on 2026-11-12, before anyone thought of Hyperliquid, so
   nothing on these months can have shaped it, and every month is a test month. No explore and check split:
   that is where the polishing lost its way (M1). TEN, BROAD and DAY beside, as there. A ranking by past
   results is a second question; if wanted, it is one named line beside, deciding nothing.
3. **The power, first** (H3): traders, copies a week and days from counts; the error per copy borrowed from
   Polymarket's measured copies and said so; then the smallest edge seen four times in five, and "the most
   likely verdict" in plain words on the owner's page.
4. **One price source for every month.** The books thinned through 2026, so a book-first price would change
   its source with the calendar. Price every leg from the tape or the minute price with a stated cost, keep
   the books for a calibration print on the months where they are dense, project the unpriced share from the
   tested months themselves, and put a coverage tripwire at step 1 (look 1's report, section 8).
5. **Both readings, as R12:** the money with the exits copied, and d against the matched null. A
   long-leaning trader in a rising year must not pass as skill.
6. **A number that a few days or a few accounts cannot carry** (M2): the error by trader and by day, and a
   sign condition on the mean of the traders' own means.
7. **The mapping from Polymarket's fills to Hyperliquid's** (events, cycles, the label), written and tested
   on made-up fills before any outcome; vaults, their children and sub-accounts named.
8. **The bar tied to where the owner would act** (M4), and Hyperliquid's own base-tier costs.
9. **The delay as frozen** (R8's 62–95 s) for the deciding line; faster and slower beside.
10. **A budget for the build** in days and lines, in proportion to the answer's worth. The polishing took
    45% of the repository.
11. **The exam's guards kept:** the store built twice, the reproduction, independent code at the look,
    nothing heavy beside it.
12. **FRESH-2's months left unseen,** as the place where a "yes" would be confirmed.

### The two forward tests

| | 2026-12-19 | 2027-02-06 | 2027-05-08 |
|---|---|---|---|
| The paper experiment's MAIN can see an edge of about (APPROACH-REVIEW, at 10 cycles) | 54 bps | 33 | 21 |
| MARKET-1: KEEP needs a mean above about (my rough arithmetic) | +254 | +145 | +91 |
| MARKET-1: DROP needs a mean below about | −204 | −95 | −41 |

MARKET-1's row scales the old weeks' rate and error (153 entries on 47 of 68 days, ± 67.7) and assumes they
persist; section 9.

- **What December can tell:** whether copying every directional trader still loses about a round trip (the
  BROAD line sees about 11–12 bps by then; it decides nothing); whether Polymarket's wave is as large as the
  +310 it was found at (about two chances in three of KEEP if it is).
- **What December cannot tell:** anything about a small edge. For MAIN the design itself says "the likely
  answer is 'too few to tell' in December and February" (`approach-review-2026-11-12.md`, lines 90–93). For
  MARKET-1, if the truth is near WAVE-H's +83, KEEP is about 3% in December and about 40% even in May; if
  the truth is zero, DROP is about one in six by May. Its most likely last word is "too few to tell".
- **So:** tell the owner now that "too few to tell" on 2026-12-19 is the expected word. Keep both running:
  they cost nothing, and MARKET-1 is the only test that can show Polymarket differs from Hyperliquid. Build
  nothing that waits on them.
- **Before 12-19:** H1's ruling, and H5's routine for the looks.

### When to stop, honestly

1. **The wave:** stopped now, as ruled. Not disproved: unprovable at its size (H3). The exam closes at look
   1 (H4). "The crash side only" may be kept as one page of frozen text; no build until arithmetic says its
   test can answer.
2. **Copying:** COPY-H is the last test. Its verdict and the paper experiment's looks end the question.
3. **The research as a whole:** after COPY-H's one look, no new research build unless a frozen test has said
   a clear yes. If COPY-H's plan cannot pass the gate, it is not built, and the research ends there.
4. **2027-05-08:** the forward tests' last look. Then the project becomes what passed, or closes: the record
   kept, the data archived, the collector stopped or kept as the owner chooses.
5. **A rule against the next variant:** an idea born from a result is tested only when new data can give it
   a clear answer, and only with the owner's line on what a "no" will mean.

### What a useful v1 would be

- **If COPY-H says yes:** a watcher of the accounts its rule picks, with the after-following scoreboard.
  Hyperliquid's fills by address are public (external-apis). Showing another venue in the app is a ruling
  under Iron Rule 1, the owner's.
- **If MARKET-1 says KEEP:** the wave page on Polymarket, as planned.
- **If nothing passes:** none. The founding v1 (favourites, alerts, a paper log) would be built on a premise
  the research did not support, and the owner has said as much (decisions 2026-11-25). The two daily pages
  and their guide already show everything that is being measured. R7's eight pages and a skeleton are out of
  proportion to the evidence.
- **One idea beyond the brief, the owner's call:** what the project has truly built is a bench that tells
  the truth about a rule before money relies on it. It works on any rule that can be written down, the
  owner's own included, and those are the only results usable on an account whose terms forbid copying.
  That would be a new question, with its own short plan and the same gate.

## 7. Question 6 — what to protect and what to improve, ranked

**Protect**

1. **The recordings:** a second copy, checked by hash (H2).
2. **The two forward tests' road to their looks:** H1's ruling; a PC that stays up (H5); the logs read each
   day.
3. **The method** (section 3's first list). Do not loosen it to get an answer sooner.
4. **The raw Hyperliquid stores and their hash lists.**
5. **The supervisor's folder** (M7).
6. **The owner's time and spirits:** the expected word of each test, said before it runs.

**Improve**

1. **A gate before any test is built.** Three lines on the plan's first page: the most likely verdict with
   its chance; the chance of a clear yes or no at the effect size the earlier evidence supports; what the
   owner would do with each answer and what it is worth. Below about one half for a clear answer: redesign
   or do not build.
2. **Where the owner acts** (M4), then every bar from it.
3. **One question at a time, and the stop rule above.**
4. **Deciding numbers that a few days cannot carry** (M2).
5. **The price source checked on the tested months before a freeze** (look 1's M2).
6. **The record:** section 4's five steps.
7. **Effort in proportion:** a build budget for each test.
8. **Operations:** E: watched, the backup task's state on one line, a note of what runs unwatched while the
   owner is away (M7).

## 8. What I read, and what I did not

- **In full:** CLAUDE.md; current-task; the plan page (at `97b8186`, then its changes to `5c7df7e`);
  WORKFLOW.md and LESSONS.md; decisions' entries of 2026-11-25 to 2026-11-19; the reviews' README;
  `polish-exam-look1-2026-11-25.md`; my brief.
- **Decisions, older:** the results and rulings by entry (WAVE-H's look, its Final review and its freeze;
  the fresh months; the polishing plan's approval; the two outside researches; MARKET-1's freeze, plan and
  lead; the paper experiment's freeze, plan, APPROACH-REVIEW and "the way forward"; FIND-6 and FIND-6-EXITS;
  round 2's FIND results and rules review; round 2's rules and the collector; the fast track; the road to
  v1; R7; R8; the founding entries). The builds' "technical calls" entries I read only where a finding
  needed them.
- **Reviews, their owner's pages or summaries and the sections cited:** the polishing plan (its owner's
  page, the choice rule, the exam); the exploration's review; MARKET-FIND; APPROACH-REVIEW; STRATEGY-REVIEW;
  R8; FIND-1; WAVE-H's look.
- **Reviews, through their decisions entries and README rows only:** the polishing plan's review (but its F6
  and F13), the exam's rules review, code review and fix-check, WAVE-H's plan and its reviews, FIND-2 to
  FIND-9 and their Final reviews, FIND-6 and its reviews, the AI research. I did not open R1 to R7, the
  collector's plan, IDEAS-REVIEW, DOCS-SWEEP, the paper experiment's and MARKET-1's plans and reviews, the
  extraction's reviews, WAVE-ELSEWHERE, WAVE-CHECKS or ONCHAIN-SCOUT.
- **The frozen rules:** `polish/rules.md` P0–P13; `market1/rules.md` M1–M11; `experiment/rules.md` R1–R12;
  `waveh/rules.md` H5–H7, H11, H12; `polish/tries.md`, its seeded list.
- **Architecture:** the collector, the paper experiment, MARKET-1, the download, every heading, the exam's
  first part. **External-apis:** "Other venues". **Code-rules:** its headings only.
- **Code, where a claim needed it:** `src/paper/reader.ts`, `loop.ts`, `market.ts`, `daily.ts` (three
  lines), `src/health/disk.ts`; counts of files and lines by `git ls-files`.
- **After the crash, read only:** the System log's bugcheck, Kernel-Power and unexpected-shutdown events
  (the last three of each kind; it holds one bugcheck); `git fsck --no-dangling` (exit 0, no output); this
  file again, whole (no NUL byte, every line as written).
- **What this limits:** H1's size is not measured. M3's two numbers are not known to me. M7 rests on what
  the files say, not on the machine. For H5 I read the log's line, not the dump, and I did not look at the
  recordings, the collector's gap or any run folder after the crash. I checked no number of the looks
  against data; the Final reviews did.

## 9. My arithmetic

Inputs are numbers on record; Φ is the normal distribution. The script and its output are in my scratchpad
(`FABLE-REVIEW\arith.cjs`, `arith.out`), run 12:07Z; both were still there after the crash.

1. **Look 2 (H4).** S₁ = +13,378 bps over n₁ = 3,000 (look 1's report, lines 293 and 94). A pooled mean M
   over n₁ + n₂ positions needs the new ones to average (M × (n₁ + n₂) − S₁) ÷ n₂.
   - With SE 81.0 (rules.md, line 366): HOLDS M > 2.81 × 81.0 = 227.6, so +495 at n₂ = 2,500 and +362 at
     5,000. DOES NOT HOLD M < 50 − 227.6 = −177.6, so −396 and −287. LIKELY M > 2.437 × 81.0 = 197.4, so
     +429 and +313.
   - With SE 91.7 × 81.0 ÷ 109.6 = 67.8: HOLDS M > 190.4, so +414 and +302; DOES NOT HOLD −314 and −227.
   - n₂ is my guess from look 1's rate: 3,078 positions on 100 deciding days, and FRESH-2 adds 82 days. Even
     10,000 new positions would need +295 and +246 for HOLDS (by hand, the same formula).
2. **Look 1 (H3; section 2).** SE 91.7, z 2.847. HOLDS needs m > 261, DOES NOT HOLD m < −211.
   P(m − z·SE > 0) is 0.2% at a true mean of 0, 2.6% at +83 and 25% at +200. P(m + z·SE < 50) is 1.07% at 0.
   The range at 95% is 4.459 ± 1.96 × 91.7, or −175 to +184. +200 lies 2.13 errors from +4.459; +83 lies
   0.86.
3. **Years to prove (H3).** HOLDS at z 2.81 four times in five needs SE ≤ μ ÷ (2.81 + 0.8416): 21.9 for
   μ = +80. Months = the line's months × (its SE ÷ 21.9)², the error falling with the square root of time.
   The unpolished pooled wave, 31.3 over 10 months: 20 months. N at K = 20, 63.9 at 182 days: 51 months. The
   715 line, 81.0 at 182 days: 82 months. For μ = +50: 52, 131 and 210 months.
4. **MARKET-1's looks (section 6).** The old weeks: 153 entries on 47 of 68 days, SE 67.7 (its rules, M5's
   bracket). At a look D days after START, wave days = D × 47 ÷ 68 and SE = 67.7 × √(47 ÷ wave days): 91 at
   38 days, 60 at 87, 42 at 178. KEEP needs m > z × SE and DROP m < 50 − z × SE, with z 2.81, 2.43, 2.17.
   P(KEEP) at a true +300: 69% at L1. At +80: 3%, 14% and 40%. P(DROP) at 0: 1.2%, 5.5% and 16.5%. Each is
   for a look alone; the excess condition and WITHHELD are left out.
5. **The wave's worth (M4).** 1,299 positions ÷ 301 days = 4.32 a day; × $8.26 = $35.6 a day, about $1,085 a
   month.
6. **The forced-sell side (section 2).** Weights 1 ÷ 51.7² and 1 ÷ 61.5² on +121.9 and +83.4: +106.0 ± 39.6.
   It pools WAVE-H's slice 0 with FRESH's 715 line, two different rules. Description only.

## 10. Questions for the supervisor and the owner, each with a recommendation

1. **The paper experiment's refused market-days (H1).** Count now and rule before 2026-12-19?
   **Recommended: yes, this week.** If the 2% line or the breaker is at risk, a defect fix by R0's route with
   both re-freezes, its rule written before any result is read.
2. **The recordings' second copy (H2).** Now, or with the space in January? **Recommended: now,** an
   external disk, each day checked against its manifest; the supervisor's folder with it.
3. **Look 2 (H4).** Decide it on the arithmetic, before FRESH-2's listing? **Recommended: yes; do not build
   it.** The exam is recorded as unresolved at look 1, and FRESH-2's months stay unseen.
4. **B0 on FRESH and the discovery window on Hyperliquid (M3).** Put both on record from look 1's
   `report.json`? **Recommended: yes,** two lines, "beside, decides nothing".
5. **The gate (H3; improve 1).** A standing rule for every plan, COPY-H's first? **Recommended: yes,** in
   WORKFLOW's standing rules, the supervisor's file.
6. **COPY-H's rule.** The paper experiment's MAIN unchanged, every month a test month, one price source?
   **Recommended: yes,** and COPY-H's plan review holds the plan to section 6's twelve points.
7. **Where the owner acts (M4).** Before COPY-H's bar is frozen? **Recommended: yes,** a short talk: venue,
   size, costs, what its rules allow.
8. **The stop rule (section 6).** Written into decisions now? **Recommended: yes,** in the owner's words.
9. **The PC (H5).** The dump read and recorded; a fixed check after any crash; the memory test the owner's
   rule of 2026-11-20 now calls for; and for every forward look nothing heavy beside it, with independent
   code before the owner reads a verdict? **Recommended: yes** to each. The test's kind and length, and the
   RAM setting, are the owner's.
10. **The record (M6, L2).** One sweep of the four state files, the two guards now, "rulings in force", and
    rulings for D1, D2 and the second arm? **Recommended: yes.** For the three: the second arm closed (its
    premise is gone); D1 held until a v1 is planned; D2 run after 2026-11-30 only if COPY-H's plan wants its
    answer.
11. **The supervisor's folder and E: (M7).** Is there a copy off E:, and who watches E:'s free space?
    **Recommended:** the folder joins the weekly copy; E:'s free space is read at each session's start until
    the collector watches it.
12. **"The crash side only."** One page of frozen text now, with no build until the arithmetic says its test
    can answer? **Recommended: yes,** in place of deciding it with look 2's book listing.
