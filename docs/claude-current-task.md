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
is built up to "rules ready" (2026-11-20, POLISH-RULES), its fresh code
review's fixes are in (2026-11-20, POLISH-FIX) and a new draft list is
written. It is not frozen, and FRESH stays sealed.** The plan is the plan
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
      and fixed (decisions 2026-11-20, "the code review's fix round").
    - A rehearsal of `main.ts`'s reproduce → 1 → 2 on a synthetic world
      under a synthetic tag passed; on the code before the fix it stops at
      M1 (its scripts in POLISH-FIX's scratch and worker folders).
    - The draft list `polish/FROZEN.draft.sha256`: 125 files,
      `b47e9ac3…b8c9` (`c7e95a5`; a draft, not a freeze).
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07). The
  analyzer reads only local files.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **A fresh fix-check of POLISH-FIX's round** (decisions 2026-11-20, the
   exam's fresh code review: "then a fix-check"). After any code or rules
   change, the draft list again: `node tools/polish-freeze.cjs` after
   `pnpm verify` on a clean tree, committed alone.
2. **The owner's talk before the freeze** (rules.md P16, each option with
   its numbers): the days without books (option B, cut, recommended; or A,
   kept); Q4 (the excess over BASE, the default; or OWN). The marked
   options are then filled in, and the option markers' test
   (`polish-rules.test.ts`) changes in the same commit.
3. **The freeze:** `node tools/polish-freeze.cjs --final --tag 1` from a
   clean tree, the commit tagged `polish-freeze-1` (the owner pushes the
   tag); `git` checked from the launcher's environment. Only a verified
   list held by its tag opens FRESH.
4. **Look 1** (rules.md P15), the supervisor's runs, one at a time, with
   nothing heavy beside them: `placebo.json` copied into `ANALYZER\FRESH`;
   `reproduce` by the frozen program into `ANALYZER\FRESH`; step 1 (FRESH
   built twice and held equal, its integrity, the counts, read with
   `counts.tripwire.share` against the 5%; exit 5, books needed; about 75%
   chance of one exit 6 at the pairing check first, by H0's route); the
   books (`node tools\waveh-fetch.cjs --fresh --books
   ANALYZER\FRESH\look1\books-needed.txt --store <FRESH_STORE> --heartbeat
   <the collector's heartbeat>`); step 2 (`result.json` first). Then the
   report and a Final review with independent code. Look 2 about
   2027-02-08, a later build under its own freeze (rules.md P1), with the
   rehearsal again before it.
5. **MARKET-1's daily runs** (10:30Z): no paper command by hand while a
   MARKET-1 run is live (rules.md M2).
6. **The daily runs:** the supervisor checks each program's log, budget and
   page; no running number is read as evidence before a look.
7. **D1** (the classifier v2's blind test, after 2026-11-21) and **D2**
   (R8's B2 confirmation, after 2026-11-30), each with its own share of the
   remaining 80 a minute.
8. **MARKET-1's second arm** after the polishing's freeze, with the
   polished rule (decisions 2026-11-17, the polishing plan's answers, 7).
9. **Small collector follow-ups, when convenient:** drop the boards'
   `consistent` flag; a coverage mark for books that arrive late; the
   backup task's trigger from UTC; the page's fee-category alarm.
10. **The v1 plan** (the plan page), early December.

## Last session (2026-11-20, POLISH-FIX)

The fresh code review's fix round, as ruled (decisions 2026-11-20): M1 the
reproduction given the exam's seal (`31bab2e`); M2 the 5% tripwire's
quotient in step 1's counts and M3 the built program's test following the
gate (`742b4de`); L1 the design's safety-net seam with the 715 line
deciding through step 2, and L3 step 2 holding step 1's program, freeze and
check files (`21f270b`); L2 and L6 (`0837596`); L7, L10, L11 (`0e8ffb4`);
L4 and L5 with the rules' P2, P14, P15 and P16, THE PLAN saved
(`edf9ce5`); the draft list again (`c7e95a5`: 125 files, `b47e9ac3…b8c9`);
the rehearsal and its control; these docs. Each commit with `pnpm verify`
green in the same command (822 + 5 tests at the end) and the three freezes
verified after. Nothing of FRESH was opened.
