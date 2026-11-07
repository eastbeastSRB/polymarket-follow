# Current task

polymarket-follow: a watch-only tracker of Polymarket Perps traders
(CLAUDE.md). Founded 2026-11-06; **nothing is built.** The plan is the plan
page (docs/claude-master-plan.md).

The supervisor is one long-lived chat whose state and method live in its own
folder outside the repo, `E:\coding\Claude\supervisor\polymarket-follow\`
(HANDOVER, WORKFLOW, LESSONS). **This host is UTC+1 (UTC+2 from
2027-03-28):** write every stamp in UTC with Z, read from `date -u`.

## Where things stand

- **Wave 1 of the research is closed** (decisions 2026-11-07, wave 1 closed):
  R1 (the API), R4 (notifications), R5 (existing tools), reports in
  docs/reviews/. The API facts are in external-apis; the coding rules they
  produced are in code-rules ("The Perps API").
- **The operating budget is 250 weighted tokens a minute, all callers
  together, one request at a time, evenly spaced, never more than 30 tokens in
  a burst** (same entry). The limit is a token bucket (burst ~90–100 tokens).
- **Wave 2:** R3 (the paper-follow method) is accepted (decisions 2026-11-07,
  R3 accepted): the follower is priced at the 1 s mark plus the measured
  spread and depth; a trader is judged over a fixed horizon against random
  trades, never by the trader's own exits; a verdict only at E ≥ 400 (20
  traders), the pooled board first. R2-STYLE runs: its definitions and the
  scoring are frozen, R2-LABELS's 100 blind labels are fingerprinted
  (decisions 2026-11-07), its pull ends ~2026-11-08; next it hands over the
  classifier, which the supervisor scores on the holdout.
- **Monday 2026-11-09 14:30–16:30Z:** a two-hour weekday measurement in US
  hours before R8's numbers are frozen.
- **The v1 defaults are approved** (same entry): the owner chose them before
  the plan; the plan subagent starts from them.
- **The repository holds docs only:** no package.json, no code, no CI.
  GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes.

## Next up — IN ORDER

1. **R2's classifier**, scored by the supervisor on the holdout; R2's report,
   verified and walked through with the owner.
2. **Wave 3:** R8 (does following pay; skill or luck — its numbers, from R1,
   R2, R3's corrected report and Monday's measurement, recorded in decisions
   before its one look) and R6 (storage).
3. **Wave 4:** R7 (the pages), after R8's verdict.
4. **The owner says the research is complete;** then the v1 plan, approved
   and registered in decisions; then the skeleton and v1 in parts.

## Open questions — the research answers them

- How to tell an algorithm or market maker from a directional trader, proven
  blind (R2).
- A follower's realistic price on a thin tape (BTC: a page of 100 trades spans
  50–140 minutes), the delay, fees and funding; statistics valid however often
  the owner looks (R3).
- Whether following pays at all, and whether the leaderboard is skill or luck
  (R8).
- Storage per day, and E:'s room (R6).

## How this file works

Status, next step and open questions come first — they are why this file is
read. It is the ONE file loaded into every session, so its size is a tax on
all of them: **keep it under ~10 KB, the latest value only, never a series.**
**REWRITE it; do not append to it.** Durable content belongs in the other
docs (CLAUDE.md, "Structure & docs"). Old versions:
`git log --follow -- docs/claude-current-task.md`.
