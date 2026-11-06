# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06; **nothing is built.** The plan is the plan
page (docs/claude-master-plan.md).

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z.

## Where things stand — 2026-11-06

- **Founded** by the owner's decisions (decisions 2026-11-06, polymarket-follow
  founded): its own repository and supervisor, watch-only, perps first,
  Windows notifications first, 5–50 favourites, the data kept in its own
  database and backup folder, research before the plan and the plan before
  code.
- **Verified before founding** (external-apis): the public leaderboard pages
  100 at a time (34,877 accounts ranked all time); any account's fills
  (open, add, reduce, close, flip, liquidation) and open positions are public
  by address; the live stream names no account, so following is by polling;
  the IP budget is 1,000 weighted tokens a minute.
- **The repository holds the founding docs only:** no package.json, no code,
  no CI. GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes.

## Next up — IN ORDER

1. **The supervisor's first session:** read everything, report what it
   understood, propose the research briefs.
2. **The research phase,** R1–R7 (the plan page), each a subagent with a
   report in docs/reviews/.
3. **The v1 plan** from the research; the owner approves; registered in
   decisions.
4. **The skeleton,** then **v1** in parts.

## Open questions — the research answers them

- The real weight of a per-address read, and so how often 5, 50 or 100
  traders can be checked (R1).
- The PnL history's parameters (R1).
- How to tell an algorithm or market maker from a directional trader (R2).
- How a background process raises a Windows notification reliably (R4).
- Storage per day, and E:'s room (R6).

## How this file works

Status, next step and open questions come first — they are why this file is
read. It is the ONE file loaded into every session, so its size is a tax on
all of them: **keep it under ~10 KB, the latest value only, never a series.**
**REWRITE it; do not append to it.** Durable content belongs in the other
docs (CLAUDE.md, "Structure & docs"). Old versions:
`git log --follow -- docs/claude-current-task.md`.
