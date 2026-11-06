# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06; **nothing is built.** The plan is the plan
page (docs/claude-master-plan.md).

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z.

## Where things stand

- **Founded** by the owner's decisions (decisions 2026-11-06, polymarket-follow
  founded): its own repository and supervisor, watch-only, perps first,
  Windows notifications first, 5–50 favourites, the data kept in its own
  database and backup folder, research before the plan and the plan before
  code.
- **The research phase is running** (decisions 2026-11-06, the research phase
  approved): wave 1 — R1-API, R4-NOTIFY, R5-TOOLS — started 2026-11-06; waves
  2 and 3 are being revised with the owner's lessons from polymarket-lab.
- **Verified before founding** (external-apis): the public leaderboard, any
  account's fills and open positions by address, the live stream naming no
  account (so following is by polling), the IP budget of 1,000 weighted
  tokens a minute. **Known to be incomplete there until R1 corrects it:** the
  leaderboard pages only to rank 1,000; the spec publishes each endpoint's
  weight; `trade_id` nears JavaScript's largest exact integer; money fields
  are long decimal strings (decisions 2026-11-06, the research phase
  approved).
- **The repository holds docs only:** no package.json, no code, no CI.
  GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes.

## Next up — IN ORDER

1. **Wave 1** reports, each verified by the supervisor and walked through
   with the owner.
2. **Waves 2 and 3** (R2 with a blind re-check, R3; then R6, R7), shown to the
   owner before they start.
3. **The owner says the research is complete;** then the v1 plan, approved
   and registered in decisions.
4. **The skeleton,** then **v1** in parts.

## Open questions — the research answers them

- How often 5, 20, 50 or 100 traders can be checked inside half the budget,
  and the alert's delay each way (R1).
- The PnL history's parameters, and whether it reveals deposits and
  withdrawals (R1).
- How to tell an algorithm or market maker from a directional trader (R2).
- How the poller raises a Windows notification reliably (R4).
- Storage per day, and E:'s room (R6).

## How this file works

Status, next step and open questions come first — they are why this file is
read. It is the ONE file loaded into every session, so its size is a tax on
all of them: **keep it under ~10 KB, the latest value only, never a series.**
**REWRITE it; do not append to it.** Durable content belongs in the other
docs (CLAUDE.md, "Structure & docs"). Old versions:
`git log --follow -- docs/claude-current-task.md`.
