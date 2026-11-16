# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) records around the
clock; the forward paper experiment is FROZEN (2026-11-12, tag
`paper-freeze-1`) and runs daily; MARKET-1, the forward paper test of the
liquidation wave, is FROZEN (2026-11-13, tag `market1-freeze-1`) and runs
daily at 10:30Z. WAVE-H, MARKET-1's wave tested once on Hyperliquid's
history, is built and its two fresh reviews' fixes are in (WAVE-H-FIX,
2026-11-16): the rehearsal held every count a third time (M = 147);
`data.sha256` and a new draft list are committed; one question is open (Q-A:
the 7 "funding without a mark" come from holes in the archive, not from the
off-minute rows); nothing is frozen or run on TEST.** The plan is the plan
page (docs/claude-master-plan.md); what exists is architecture.

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
  entries; 2026-11-16, the supervisor's calls and WAVE-H-FIX's entry):
  - the rules `apps/poller/waveh/rules.md` (H0–H15 with R1–R10, M = 147;
    H10 reads a mark from the latest whole-second stamp in (m, m + 1 min];
    the look's step 1 reads and counts the marks and funding first; step 2's
    cheap refusals first; the recovery rule after a failure between step 2's
    writes; an 8 GB heap); `dist/waveh.js` with `rehearse` and `look`;
  - the download complete (2026-11-16 01:15:30Z): `waveh/data.sha256`, 9,975
    files, `b66a9bb0…676c`; R3 (i)'s short files: the shared hour
    `node_fills_by_block/hourly/20250727/8.lz4` alone;
  - the rehearsal's third run (2026-11-16 05:10–07:11Z, exit 0): every count
    of run 2 held; failing mark rows 2,831 → 0 (the 2,831 off-minute rows now
    read); **but "funding without a mark" stayed 7 and the sealed outcomes'
    hash `1a9f731d…3e59` did not move**: the 7 come from minutes with no row
    for any coin (2025-07-19 09:53, 21 minutes; 07-27 11:53, 8) over a
    funding hour; `sizing.json` unchanged (byte-identical); run 2's folder
    kept as `rehearsal-run2\` beside `rehearsal\`;
  - the draft list, 74 files, `6bd52e61…a5f1` (`c677d17`).
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07):
  - the collector's share is 50 and 15;
  - the experiment's is 120 and 15;
  - MARKET-1 reads nothing from the API; WAVE-H reads Hyperliquid and
    AWS only, never Polymarket.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **Q-A, the supervisor's:** accept the 7 as the rules already say (an
   unpriced position, counted; the test months' holes now show in step 1's
   counts before any verdict), or a rule for archive holes (a new rule, the
   owner's). Then **WAVE-H's fix-check** (a fresh worker on a different
   model) on WAVE-H-FIX's commits; then the owner's go for the freeze (the
   supervisor: `pnpm verify` on a clean tree, `node tools/waveh-freeze.cjs
   --final`, commit, tag `waveh-freeze-1`) and for the one look (H15's two
   steps, `node --max-old-space-size=8192 dist/waveh.js look`; step 1's
   counts read before the books are fetched).
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

## Last session (2026-11-16)

WAVE-H-FIX built the supervisor's 12 calls on WAVE-H's two fresh reviews, one
fix a commit, each gated on `pnpm verify`, both live freezes verified after
each: `--data`'s checks and `data.sha256`; the quality moves (the shared
layer split out, one home for helpers and types, one place for a leg's
snapshot, the store's keys in one place, unused exports cut); H10; the book
lines and cell-less mark rows counted; step 1 reading the marks and funding;
step 2's cheap refusals first; the look's whole-file writes (a copy of
MARKET-1's behaviour, the supervisor's answer) and the recovery rule; the 8 GB
heap; the rules made exact; pins for the reviews' surviving breaks. 58
deliberate breaks in a scratch copy: 55 killed, one more after its test, two
out of a test's reach (an fsync, the freeze tool's main). Then the third
rehearsal (all counts held; H10 priced none of the 7) and the draft list.
