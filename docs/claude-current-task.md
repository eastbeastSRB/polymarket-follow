# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) is built and records
around the clock; v1 is not built.** The plan is the plan page
(docs/claude-master-plan.md); what exists is architecture.

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z, read from `date -u`.

## Where things stand

- **The collector is live** (architecture, "The collector"; decisions
  2026-11-11, COLLECTOR-BUILD's technical calls): parts 0–6 of the plan's
  §1.8 built, verified and deployed (run copy `0defe9a`, 2026-11-11
  16:25Z) — the streams, the minute and ten-minute reads, the passes, the
  rule book and universe, health and `status`, the backup and restore.
  `pnpm verify` green: 24 files, 152 tests.
- **Tonight is the first full pass** of part 4: competitions 23:15Z, boards
  23:38Z, daily reads 00:20Z; the supervisor checks the 16 boards.
- **The backup task waits for the owner:** one elevated run of
  `tools\register-tasks.ps1` adds "polymarket-follow backup" (daily 05:20Z)
  and re-registers the poller and its check. A backup and a restore test
  were run by hand once (2026-11-11 16:26Z): both ok.
- **Research:** waves 1–4 closed (R1–R8; decisions 2026-11-07 to
  2026-11-09). **R8 FAILS** (decisions 2026-11-09): copying the top 50
  directional traders about 80 s late lost 16.6 bps an entry; no confirmed
  skill on the leaderboard; v1 is planned as a watching and analysis tool.
  Round 2's rule book (decisions 2026-11-10) and its yardstick, the research
  kit (decisions 2026-11-11, RESEARCH-KIT accepted), are in place.
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07, wave 1
  closed); the collector's share is 50 a minute and 30 in 5 s.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes.

## Next up — IN ORDER

The road is on the plan page, "The road to v1" (decisions 2026-11-09).

1. **A Final review of the whole collector code** by a fresh subagent; then
   the owner's re-registration for the backup task.
2. **Part 8 of the collector** (about 2026-11-20): the weekly fills of the
   frozen exam lists into the blind store, when the lists are handed over.
3. **Round 2's FIND studies** (the hypothesis register first, on the kit).
4. **About 2026-11-30:** the first exam on the weeks after 2026-11-07, with
   D1 (after 11-21) and D2 (after 11-30).
5. **Early December:** the v1 plan, the final exams beside it; then the
   skeleton and v1.

## Open questions — the research answers them

- Whether the corrected style classifier (v2) passes its forward blind test
  (after 2026-11-21).
- Whether a pattern exists that pays over many trades — the right trader,
  trades, instruments, moment (research round 2).


## How this file works

Status, next step and open questions come first — they are why this file is
read. It is the ONE file loaded into every session, so its size is a tax on
all of them: **keep it under ~10 KB, the latest value only, never a series.**
**REWRITE it; do not append to it.** Durable content belongs in the other
docs (CLAUDE.md, "Structure & docs"). Old versions:
`git log --follow -- docs/claude-current-task.md`.
