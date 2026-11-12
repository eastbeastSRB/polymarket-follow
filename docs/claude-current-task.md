# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) is built, Final-reviewed
and records around the clock; research round 2's FIND stage is done and
nothing passed; the forward paper experiment is built, reviewed three times
and FROZEN (2026-11-12 20:19:52Z, tag `paper-freeze-1`), and waits for the
owner's deploy.** The plan is the plan page (docs/claude-master-plan.md);
what exists is architecture.

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z, read from `date -u`.

## Where things stand

- **The collector is live** (architecture, "The collector"): books and trades
  of every market, the minute reads, the nightly passes, the rule book, health
  and `status`, the daily backup. Its code now sends the generic User-Agent
  `data-collector/1.0` and bursts at most 15 in 5 s; the live copy changes at
  its next deploy (the owner's).
- **Research:** R1–R8 closed; R8 FAILS; round 2's FIND: nothing passes; the
  exploring check with exits copied leaves every group losing (decisions
  2026-11-12). The reports: `docs/reviews/`.
- **The paper experiment** (architecture, "The paper experiment"; decisions
  2026-11-12, from "APPROACH-REVIEW accepted" to "the freeze"): MAIN — the
  slow traders of the frozen pool by rule — decides at the looks of
  2026-12-19, 2027-02-06 and 2027-05-08; beside it every directional trader,
  the favourites (the owner's filter's top 20 at the cut, the 8 with a profit
  factor of at least 1 pre-registered) and the other lines. **Frozen:**
  `apps/poller/experiment/FROZEN.sha256`, 61 files, `d04d3cd8…f31c`, F0
  2026-11-12T20:19:43Z; `pnpm verify` green (35 files, 282 tests). **Nothing
  after the cut has been read;** the gate opens only on that list.
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07, wave 1
  closed); the collector's share is 50 a minute and 15 in 5 s, the
  experiment's 120 and 15.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the tag
  `paper-freeze-1` too).

## Next up — IN ORDER

1. **The owner's deploy and registration,** at an agreed time:
   `tools\deploy.ps1` (the collector: its User-Agent and burst),
   `tools\deploy.ps1 -Program paper`, then `tools\register-tasks.ps1
   -PaperOnly` from an elevated PowerShell (the task "polymarket-follow
   paper", daily 04:00Z). The supervisor checks each from its logs.
2. **The first run** reads the backlog from 2026-11-07 (16–26 h, pausing
   02:35–03:50Z); then daily. The supervisor checks its log, budget and page.
3. **D1 and D2,** after the freeze, each with its own share of the remaining
   80 a minute.
4. **Small collector follow-ups, when convenient:** drop the boards'
   `consistent` flag; a coverage mark for books that arrive late; the backup
   task's trigger from UTC takes effect when the tasks are next registered.
5. **The v1 plan** (the plan page), early December.

## Last session (2026-11-12)

FIND-6 (the owner's filter) failed and its Final review confirmed it; an
exploring check with exits copied left every group losing. The owner chose a
forward paper experiment; APPROACH-REVIEW found its design, PAPER-PLAN planned
it, PAPER-PLAN-REVIEW reviewed the plan; PAPER-BUILD built it (parts 0–5, an
end-to-end test, a batch of 13 fixes from PAPER-RULES-REVIEW and
PAPER-CODE-REVIEW); PAPER-FIX-CHECK read the fixes; PAPER-FAV picked the
favourites; PAPER-FREEZE mended four slips and froze it.
