# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) records around the
clock; the forward paper experiment is FROZEN (2026-11-12, tag
`paper-freeze-1`) and runs daily; MARKET-1, the forward paper test of the
liquidation wave, is FROZEN (2026-11-13, tag `market1-freeze-1`) and runs
daily at 10:30Z. WAVE-H, MARKET-1's wave tested once on Hyperliquid's
history, is built, fixed and checked: the fresh fix-check found it ready to
freeze after small fixes, and WAVE-H-FIX-2 made them (2026-11-16): three
rule sentences, two tests, a new draft list. It waits for the owner's go for
the freeze and the one look; nothing is frozen or run on TEST.** The plan is
the plan page (docs/claude-master-plan.md); what exists is architecture.

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z, read from `date -u`.

## Where things stand

- **The collector is live** (architecture, "The collector").
- **The paper experiment** (architecture, "The paper experiment"; decisions
  2026-11-12, from "APPROACH-REVIEW accepted" to "the freeze"):
  - frozen: `apps/poller/experiment/FROZEN.sha256`, 61 files,
    `d04d3cd8…f31c`;
  - its daily task at 04:00Z;
  - looks 2026-12-19, 2027-02-06, 2027-05-08.
- **MARKET-1** (architecture, "MARKET-1"; decisions 2026-11-13, from "the
  market lead" to "MARKET-1 — the freeze"):
  - `dist/market1.js`, with its rules in `apps/poller/market1/rules.md`;
  - frozen: `market1/FROZEN.sha256`, 64 files,
    `b9e17505d8d4dfc87101b35c4908929b4ed18c6dd401cf723dfbab0c15452f1d`,
    commit `4832a6a`, tag `market1-freeze-1`;
  - START 2026-11-11; looks at the paper experiment's dates;
  - its daily task at 10:30Z.
- **WAVE-H** (architecture, "WAVE-H" and "WAVE-H's data download";
  decisions 2026-11-14, "WAVE-H's plan approved" and the WAVE-H-BUILD
  entries; 2026-11-16, from WAVE-H-FIX's entry to WAVE-H-FIX-2's):
  - the rules `apps/poller/waveh/rules.md` (H0–H15 with R1–R10, M = 147);
    `dist/waveh.js` with `rehearse` and `look`;
  - the download complete (2026-11-16 01:15:30Z): `waveh/data.sha256`, 9,975
    files, `b66a9bb0…676c`;
  - the rehearsal's third run (2026-11-16 05:10–07:11Z) held every count;
    the 7 SIZING positions with a funding settlement without a mark stay
    unpriced, as H9 says (holes in the archive's marks; decisions
    2026-11-16, "WAVE-H-FIX verified", Q-A); `sizing.json` unchanged;
  - the fix-check (`docs/reviews/wave-h-fix-check-2026-11-16.md`): ready to
    freeze after small fixes; F1–F5 made by WAVE-H-FIX-2, F6 and its Q3 left
    as they are;
  - the draft list, 74 files,
    `1d85e2f6276247dae03f0f2ee394255375aa59e28154f7eb5c210cfc1e28dd38`
    (`496ad5d`).
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07):
  - the collector's share is 50 and 15;
  - the experiment's is 120 and 15;
  - MARKET-1 reads nothing from the API; WAVE-H reads Hyperliquid and
    AWS only, never Polymarket.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **The owner's go for WAVE-H's freeze and its one look.** The freeze, by
   the supervisor: `pnpm verify` on a clean tree, `node
   tools/waveh-freeze.cjs --final`, commit; the owner pushes the tag
   `waveh-freeze-1`. Then the look (H15's two steps, `node
   --max-old-space-size=8192 dist/waveh.js look`): step 1's counts checked
   by the supervisor before the books are fetched, then step 2 (the verdict).
2. **MARKET-1's daily runs** (10:30Z): the first decided legs confirm the
   book level's unit (decisions 2026-11-13, call 11); no paper command by
   hand while a MARKET-1 run is live (rules.md M2).
3. **The daily runs:** the supervisor checks each program's log, budget and
   page; no running number is read as evidence before a look.
4. **D1** (the classifier v2's blind test, after 2026-11-21) and **D2**
   (R8's B2 confirmation, after 2026-11-30), each with its own share of the
   remaining 80 a minute (and a burst share: decisions 2026-11-13, Q12).
5. **MARKET-1's second arm** about 2026-11-20 (decisions 2026-11-13, the
   owner's rulings after the deploy); WAVE-H's closure holds ten of
   MARKET-1's and the paper's files until its look.
6. **Small collector follow-ups, when convenient:** drop the boards'
   `consistent` flag; a coverage mark for books that arrive late; the
   backup task's trigger from UTC takes effect when the tasks are next
   registered; the page's fee-category alarm.
7. **The v1 plan** (the plan page), early December.

## Last session (2026-11-16, WAVE-H-FIX-2)

Three commits, each gated on `pnpm verify` (at the end 57 files + 1 skipped,
512 tests + 6 skipped), both live freezes verified after each: `6c673ba`
the fix-check's three rule sentences (F1 H15 step 2, F2 H10's bound, F3
H8's coin); `326ecd5` its two tests (F4: the freeze tool's `--data` run
whole from a copy in a made-up tree; F5: the built program's exit code
through its catch), each shown in a scratch copy to pass and to fail on its
break (`t04`, `n_exitwire`); `496ad5d` the draft list again, differing from
the last one only in `rules.md`'s line and the head.
