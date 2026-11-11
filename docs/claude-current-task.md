# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) is built, Final-reviewed
and records around the clock; research round 2's FIND stage is done and
nothing passed; v1 is not built; the way forward is the owner's, still
open.** The plan is the plan page (docs/claude-master-plan.md); what exists is
architecture.

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z, read from `date -u`.

## Where things stand

- **The collector is live** (architecture, "The collector"; decisions
  2026-11-11, COLLECTOR-BUILD's technical calls and COLLECTOR-REVIEW's
  calls): books and trades of every market, the minute reads, the nightly
  competition (23:15Z), board (23:38Z) and daily (00:20Z) passes, the rule
  book and universe, health and `status`, the daily backup (05:20Z) with a
  Sunday restore test. Three Windows tasks, registered by the owner: the
  poller (node itself, normal priority), its 5-minute check (proven live
  2026-11-11 20:38Z), the backup. The first competition pass ran 2026-11-11
  23:15Z (58 pages, 5,726 rows, complete).
- **Research:** R1–R8 closed; **R8 FAILS** (decisions 2026-11-09). **Round 2's
  FIND: nothing passes** (decisions 2026-11-11, round 2's FIND results): the
  gate (entry 1) shows no week-to-week persistence of traders' follower
  results, so entry 6 does not run and ranking traders stops for now; entries
  2, 3, 4, 5, 7, 9 and 10 fail; three fresh Final reviews confirmed every
  result with their own code. The reports: `docs/reviews/find-*-2026-11-11.md`.
- **Open, the owner's decision:** the way forward (a small forward paper
  experiment, a pause with the collector recording, a later batch on new
  weeks, or stopping), and with it the exams of 2026-11-30 and 2026-12-19
  (nothing registered to confirm) and the dated checks D1 and D2.
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07, wave 1
  closed); the collector's share is 50 a minute and 30 in 5 s.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes.

## Next up — IN ORDER

1. **The owner's decision on the way forward** (the plan page's "The way
   forward" row). Nothing is started before it.
2. **Small collector follow-ups, when convenient** (COLLECTOR-REVIEW's
   questions as ruled in HANDOVER): drop the boards' `consistent` flag once
   the first board pass is checked; a coverage mark for books that arrive
   late; delete `once.js`.
3. **Whatever the owner chooses**, planned first and approved, by the
   workflow in the supervisor's folder.

## Last session (2026-11-11)

The collector's parts 4–7 were built, deployed and Final-reviewed (14
fixes); the poller task now runs node itself at normal priority; the backup
task was registered. RESEARCH-KIT was accepted with its additions; seven FIND
studies wrote rules, passed a fresh rules review, looked once each, and
failed; three fresh Final reviews confirmed them. Default usage from now on;
Fable only in rare cases (the owner, 2026-11-11).
