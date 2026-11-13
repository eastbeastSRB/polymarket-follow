# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06. **The collector (C1) records around the
clock; the forward paper experiment is FROZEN (2026-11-12, tag
`paper-freeze-1`), deployed and reading its backlog; MARKET-1, the forward
paper test of the liquidation wave, is built to "rules ready" (2026-11-13,
MARKET-BUILD) and waits for its two fresh reviews.** The plan is the plan
page (docs/claude-master-plan.md); what exists is architecture.

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
- **MARKET-1** (architecture, "MARKET-1"; decisions 2026-11-13, "MARKET-1's
  plan approved" and "MARKET-BUILD's technical calls"): `dist/market1.js`,
  rules `apps/poller/market1/rules.md` (final text), the draft freeze list
  `market1/FROZEN.draft.sha256` (64 files, `cc5cd6bd…6076`, from `36dcffe`).
  The reproduction on the old weeks equals MARKET-FIND (153 entries, +309.7 ±
  67.7); the bridge rehearsal through the forward readers equals it to 1e-9
  bps for 1,362 of 1,363 positions (one listed). **Nothing after the cut has
  been read for it; its gate opens only on `market1/FROZEN.sha256`.**
- **The operating budget is 250 weighted tokens a minute, all callers
  together, never more than 30 in a burst** (decisions 2026-11-07); the
  collector's share 50 and 15, the experiment's 120 and 15; MARKET-1 reads
  nothing from the API.
- GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes (the
  tags too).

## Next up — IN ORDER

1. **MARKET-1's fresh rules review and fresh code review** (different
   models), against `market1/rules.md` and the build; fixes, if any, as a
   batch; then `node tools/market1-freeze.cjs --final` on a clean tree, the
   hash and the tag `market1-freeze-1` recorded in decisions.
2. **The owner:** `tools\deploy.ps1 -Program market1`, then
   `tools\register-tasks.ps1 -Market1Only` from an elevated PowerShell; the
   first run by hand (its backlog from 2026-11-07). Its first run's format
   counts are read before it is trusted (F7 (c)). No paper command by hand
   while a MARKET-1 run is live (rules.md M2).
3. **The paper experiment's first run** goes on (the supervisor checks its
   log, budget and page); then daily.
4. **D1 and D2,** after the freezes, each with its own share of the
   remaining 80 a minute (and a burst share: decisions 2026-11-13, Q12).
5. **Small collector follow-ups, when convenient:** drop the boards'
   `consistent` flag; a coverage mark for books that arrive late; the backup
   task's trigger from UTC takes effect when the tasks are next registered.
6. **The v1 plan** (the plan page), early December.

## Last session (2026-11-13)

MARKET-FIND sharpened the small-coin lead into the wave; MARKET-PLAN planned
MARKET-1; MARKET-PLAN-REVIEW found it approvable after its fixes; the owner
approved it with every fix; MARKET-BUILD built it to "rules ready" — parts
0–6 (the gates, the inputs, the recordings, the rules, the reproduction and
the bridge rehearsal, the run, its tools, the final rules and the draft
list), 75 deliberate breaks killed, the paper experiment's freeze verified
after every commit.
