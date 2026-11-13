# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) records around the
clock; the forward paper experiment is FROZEN (2026-11-12, tag
`paper-freeze-1`), deployed and reading its backlog; MARKET-1, the forward
paper test of the liquidation wave, is built, fixed after its two fresh
reviews and fix-checked (2026-11-13, MARKET-BUILD, MARKET-FIX,
MARKET-FIX-CHECK); MARKET-FIX-2 made the last batch (M0's wording, seven
breaks pinned, a new draft list); it waits for the supervisor's check, then
its freeze.** The plan is the plan page
(docs/claude-master-plan.md); what exists is architecture.

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z, read from `date -u`.

## Where things stand

- **The collector is live** (architecture, "The collector").
- **The paper experiment** (architecture, "The paper experiment"; decisions
  2026-11-12, from "APPROACH-REVIEW accepted" to "the freeze"): frozen,
  `apps/poller/experiment/FROZEN.sha256`, 61 files, `d04d3cd8…f31c`; looks
  2026-12-19, 2027-02-06, 2027-05-08.
- **MARKET-1** (architecture, "MARKET-1"; decisions 2026-11-13, from "MARKET-1's
  plan approved" to "MARKET-FIX's technical calls"): `dist/market1.js`, rules
  `apps/poller/market1/rules.md`, the draft freeze list
  `market1/FROZEN.draft.sha256` (64 files, `94828ff9…6460`, from `43efd04`;
  against the last, `3073e097…ed27`, only `market1/rules.md`'s hash differs).
  Both reviews said "after these fixes"; the owner approved the whole batch;
  MARKET-FIX made calls 1–12 (`20ec89c` … `ab19562`); MARKET-FIX-CHECK said
  "ready to freeze after M0's wording"; MARKET-FIX-2 made the supervisor's
  calls 1–3 (decisions 2026-11-13, MARKET-FIX-CHECK): M0's two bullets word
  for word as the report gives them (`afb2e5c`), tests that kill k01, k02,
  k06, k07, k09, k11, k12 (`43efd04`, outside the list), the draft list
  (`6a1ffa9`). The old weeks still
  agree: the reproduction's every fill, entry and position is byte-identical
  before and after the fixes (153 entries, +309.7 ± 67.7); the bridge
  rehearsal equals MARKET-BUILD's (1,362 of 1,363 positions to 1e-9 bps, the
  same one listed). 249 deliberate breaks re-run in scratch copies: 240
  killed, 6 equivalent (listed in decisions), 3 of deleted code.
  **Nothing after the cut has been read for it;
  its gate opens only on `market1/FROZEN.sha256`.**
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07); the
  collector's share 50 and 15, the experiment's 120 and 15; MARKET-1 reads
  nothing from the API.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **The supervisor's check of MARKET-FIX-2:** the rule diff word for word
   against the report, the seven breaks killed.
2. **The freeze:** `node tools/market1-freeze.cjs --final` on a clean tree,
   the hash and the tag `market1-freeze-1` recorded in decisions.
3. **The owner:** `tools\deploy.ps1 -Program market1`, then
   `tools\register-tasks.ps1 -Market1Only` from an elevated PowerShell; the
   first run by hand (its backlog from 2026-11-07). Its first run's format
   counts are read before it is trusted (F7 (c)), and a book level's unit
   confirmed (decisions 2026-11-13, call 11). No paper command by hand while
   a MARKET-1 run is live (rules.md M2).
4. **The paper experiment's first run** goes on (the supervisor checks its
   log, budget and page); then daily.
5. **D1 and D2,** after the freezes, each with its own share of the
   remaining 80 a minute (and a burst share: decisions 2026-11-13, Q12).
6. **Small collector follow-ups, when convenient:** drop the boards'
   `consistent` flag; a coverage mark for books that arrive late; the backup
   task's trigger from UTC takes effect when the tasks are next registered.
7. **The v1 plan** (the plan page), early December.

## Last session (2026-11-13)

MARKET-FIND sharpened the small-coin lead into the wave; MARKET-PLAN planned
MARKET-1; MARKET-BUILD built it to "rules ready"; MARKET-RULES-REVIEW and
MARKET-CODE-REVIEW said "after these fixes" (no high finding); the owner
approved the batch; MARKET-FIX made it: the page's freeze date (`\S+`), the
book lookup's JSON spacing, the settings' refusal of the sealed stores, the
look's verdict as one pure function, the verdict box after a verdict, dead
code out, the rules' wording; new tests for the look end to end, the
recordings' integrity, the run's lock and heartbeat, the prints, the backup
and the entry point; the paper experiment's freeze verified after every
commit. MARKET-FIX-CHECK found every finding fixed or accepted and one rule
sentence no longer exact (M0's "every reader"); MARKET-FIX-2 replaced M0's
two bullets with the report's exact words, pinned the run's order (an early
read of the paper store fails loudly), the program's exit code and lock
release, C's window end, S's zero basket and the parent of a store, and
wrote the new draft list; `pnpm verify` green (380 tests) and the paper
experiment's freeze verified after each commit.
