# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) records around the
clock; the forward paper experiment is FROZEN (2026-11-12, tag
`paper-freeze-1`) and runs daily; MARKET-1, the forward paper test of the
liquidation wave, is FROZEN (2026-11-13, tag `market1-freeze-1`) and runs
daily at 10:30Z. WAVE-H, MARKET-1's wave tested once on Hyperliquid's
history, is FROZEN (2026-11-16, tag `waveh-freeze-1`) and its one look says
NOT SETTLED (2026-11-17). The polishing (a sharpened rule chosen on WAVE-H's
10 months, then one exam on FRESH's months) chose its rule on 2026-11-19:
B0 + W4, with the owner's 715 cut deciding and a safety net to N. Its exam
is FROZEN (2026-11-20, `polish/FROZEN.sha256`, tag `polish-freeze-1`).
Look 1 is PAUSED by the owner for a few days: its reproduction by the
frozen program was stopped twice by a single flipped bit in the PC's
memory, each caught by the program's own check. FRESH is unopened.** The plan is the plan
page (docs/claude-master-plan.md); what exists is architecture.

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z, read from `date -u`.

## Where things stand

- **The collector is live** (architecture, "The collector").
- **The paper experiment** (architecture, "The paper experiment"): frozen,
  `apps/poller/experiment/FROZEN.sha256`, 61 files, `d04d3cd8…f31c`; its
  daily task at 04:00Z; looks 2026-12-19, 2027-02-06, 2027-05-08.
- **MARKET-1** (architecture, "MARKET-1"): `dist/market1.js`; frozen,
  `market1/FROZEN.sha256`, 64 files, `b9e17505…2f1d`; its daily task at
  10:30Z.
- **WAVE-H** (architecture, "WAVE-H"; decisions 2026-11-17, "WAVE-H — the
  one look's result"): frozen, `waveh/FROZEN.sha256`, 74 files,
  `864990da…8dd2`; its data `waveh/data.sha256`, 9,975 files; the one look
  NOT SETTLED.
- **FRESH** (architecture, "WAVE-H's data download"): downloaded
  2026-11-19 (4,614 files, 161.27 GB) into
  `F:\polymarket-follow-research\FRESH\store\`, sealed; its data list
  `apps/poller/polish/fresh.sha256` (4,614 files, `17de22e5…2273`), written
  from its manifest's names, bytes and SHA-256s alone.
- **The polishing** (decisions 2026-11-17, "THE POLISHING PLAN APPROVED"):
  - the analyzer's store of the 10 months, trusted (every gate passed;
    decisions 2026-11-19), `F:\polymarket-follow-research\ANALYZER\WAVE-H\`;
  - the exploration's five steps ran (decisions 2026-11-19): N = B0 + W4,
    the check months +211.3 ± 122.1; its Final review: the choice stands;
  - the owner's rulings (decisions 2026-11-19): HOLDS at 99% with LIKELY at
    95%; K = 20 slices; the 715 cut decides, N if the safety net fires;
  - **the exam** (architecture, "The exam"; `apps/poller/polish/rules.md`
    P0–P17; THE PLAN `docs/reviews/polish-rules-plan-2026-11-19.md`):
    `dist/polish.js exam --step placebo | reproduce | 1 | 2`; two looks,
    look 2 a later build under its own freeze whose terms P1 fixes.
    - The placebo ran (`ANALYZER\POLISH-RULES\placebo.json`, `c25345f7…`):
      z at look 1 2.847, LIKELY 2.360; look 2 2.81 and 2.437.
    - The reproduction's second run passed every part (decisions
      2026-11-20); the frozen program runs it again at look 1.
    - Option B's listing was refreshed: 2026-11-13 → 15 have their books,
      so `NO_BOOK_DAYS` stays 2026-07-08 and 07-12 → 17 (P2, P16).
    - The fresh rules review and the fresh code review ("after these
      fixes", `docs/reviews/polish-code-review-2026-11-20.md`) are ruled
      and fixed (decisions 2026-11-20, "the code review's fix round"); the
      fix round's fresh check says ready to freeze
      (`docs/reviews/polish-fix-check-2026-11-20.md`).
    - The owner's options are all filled (rules.md P16; decisions
      2026-11-19 `710338f`, 2026-11-20 `04b6b13`): the 715 cut with the
      safety net; option E B, the days without books cut; Q4 BASE.
    - A rehearsal of `main.ts`'s reproduce → 1 → 2 on a synthetic world
      under a synthetic tag passed; on the code before the fix it stops at
      M1 (its scripts in POLISH-FIX's scratch and worker folders).
    - **The freeze:** `polish/FROZEN.sha256`, 125 files, `bd3ac6d3…f0fa`,
      commit `13dc55c`, annotated tag `polish-freeze-1` (pushed). The gate
      says ok. The frozen state's `pnpm verify` counts 822 passed + 6
      skipped.
    - **Look 1's reproduction** by the frozen program, from the run
      worktree `E:\coding\polymarket-follow-polish-run` (detached at the
      tag, fingerprint `4c9e5c9d…`): two runs crashed (exit 1), each on a
      single-bit flip in a `tid` half (decisions 2026-11-20, "LOOK 1
      PAUSED"). Their folders are `ANALYZER\look1-repro-crash1\` and
      `…-crash2\`; `ANALYZER\FRESH` holds `logs\` and `placebo.json` only.
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07). The
  analyzer reads only local files.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **The pause** (the owner, 2026-11-20): nothing heavy and no step 1
   until the owner is back. Then the memory test (Windows Memory
   Diagnostic; the owner's rule, "if it is break again") and a Windows
   restart. Step 1's gate needs only a passed `repro.json` by the
   program's fingerprint, so the run worktree's dist is never rebuilt
   meanwhile. The archive's books never expire.
2. **Look 1** (rules.md P15), the supervisor's runs, one at a time, with
   nothing heavy beside them: `reproduce` by the frozen program into
   `ANALYZER\FRESH` again; step 1 (FRESH
   built twice and held equal, its integrity, the counts, read with
   `counts.tripwire.share` against the 5%; exit 5, books needed; about 75%
   chance of one exit 6 at the pairing check first, by H0's route); the
   books (`node tools\waveh-fetch.cjs --fresh --books
   ANALYZER\FRESH\look1\books-needed.txt --store <FRESH_STORE> --heartbeat
   <the collector's heartbeat>`); step 2 (`result.json` first). Then the
   report and a Final review with independent code. Look 2 about
   2027-02-08, a later build under its own freeze (rules.md P1), with the
   rehearsal again before it.
3. **MARKET-1's daily runs** (10:30Z): no paper command by hand while a
   MARKET-1 run is live (rules.md M2).
4. **The daily runs:** the supervisor checks each program's log, budget and
   page; no running number is read as evidence before a look.
5. **D1** (the classifier v2's blind test, after 2026-11-21) and **D2**
   (R8's B2 confirmation, after 2026-11-30), each with its own share of the
   remaining 80 a minute.
6. **MARKET-1's second arm** after the polishing's freeze, with the
   polished rule (decisions 2026-11-17, the polishing plan's answers, 7).
7. **Small collector follow-ups, when convenient:** drop the boards'
   `consistent` flag; a coverage mark for books that arrive late; the
   backup task's trigger from UTC; the page's fee-category alarm.
8. **The v1 plan** (the plan page), early December.

## Last session (2026-11-20, the supervisor)

The exam was frozen (`13dc55c`, tag `polish-freeze-1`; decisions `f9e6012`).

Look 1's reproduction ran twice from the run worktree and crashed twice,
each time on a single flipped bit in a `tid` half: mantissa bit 22, then
exponent bit 55 (the supervisor's `verify/POLISH-LOOK1/crash1/bitflip-any.mjs`).

- **The fault is the machine's, not the code's or the data's:** the reader
  code has not changed since the reproduction that passed this morning on
  the same inputs.
- **A real Windows restart** (15:09Z) between the runs did not cure it.
- **The owner** keeps the RAM at 3600 and paused the exam for a few days.

Recorded: decisions "LOOK 1 PAUSED", and the plan page's polishing row and
Q4 line. Nothing of FRESH was opened.
