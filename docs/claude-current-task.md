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
review's fixes are in and checked ("ready to freeze", 2026-11-20,
POLISH-FIX-CHECK), the owner's options are filled and a new draft list is
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
      and fixed (decisions 2026-11-20, "the code review's fix round"); the
      fix round's fresh check says ready to freeze
      (`docs/reviews/polish-fix-check-2026-11-20.md`).
    - The owner's options are all filled (rules.md P16; decisions
      2026-11-19 `710338f`, 2026-11-20 `04b6b13`): the 715 cut with the
      safety net; option E B, the days without books cut; Q4 BASE.
    - A rehearsal of `main.ts`'s reproduce → 1 → 2 on a synthetic world
      under a synthetic tag passed; on the code before the fix it stops at
      M1 (its scripts in POLISH-FIX's scratch and worker folders).
    - The draft list `polish/FROZEN.draft.sha256`: 125 files,
      `aab29e44…8f69` (`8b15ef8`; a draft, not a freeze).
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07). The
  analyzer reads only local files.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **The freeze** (the owner's talk is done; the fix-check said ready):
   `node tools/polish-freeze.cjs --final --tag 1` from a clean tree, the
   commit tagged `polish-freeze-1` (the owner pushes the tag); `git`
   checked from the launcher's environment. Only a verified list held by
   its tag opens FRESH. After the tag, `pnpm verify` should count 822
   passed + 6 skipped, the frozen state's normal count (the fix-check's
   821 + 6, decisions 2026-11-20, plus c15's one new test; unfrozen 823 +
   5). After any re-freeze, a completed step 1 runs again (rules.md P15,
   step 5).
2. **Look 1** (rules.md P15), the supervisor's runs, one at a time, with
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

## Last session (2026-11-20, POLISH-PREFREEZE)

The last small commit before the exam's freeze, as the fix-check's items
1–4 were ruled (decisions 2026-11-20, "the fix round's fresh check"):
`design.ts`'s `OPTIONS` comment says the options are filled (comment
only) and rules.md P15 step 5 says step 2 refuses another program's or
freeze's `step1.json` (`f1b4350`); two test-only assertions, c10 (DOES
NOT HOLD's sentence with SE above 0) and c15 (the tripwire's share null
with no position), each shown to kill its break in a scratch copy; the
draft list again (`8b15ef8`: 125 files, `aab29e44…8f69`; against
`750b5c64…6a8a` only `dist/polish/exam/design.js` and `polish/rules.md`
differ); these docs. Each commit with `pnpm verify` green in the same
command (823 + 5 tests) and the three freezes verified after (74, 64, 61:
0 differ). Nothing of FRESH was opened.
