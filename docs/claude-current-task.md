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
- **Wave 2 is closed.** R3 (decisions 2026-11-07, R3 accepted): the follower
  is priced at the 1 s mark plus the measured spread and depth; a trader is
  judged over a fixed horizon against random trades, never by the trader's
  own exits; a verdict only at E ≥ 400 (20 traders), the pooled board first.
  R2 (decisions 2026-11-08, R2 and R2-LABELS accepted): the boards' tops are
  mostly algorithms, market makers and inactive accounts; the style
  classifier v1 scored blind (trap 2 of 23, both anchors caught) is used for
  the research; v2 is frozen and the app ships only if it passes the forward
  blind test after 2026-11-21 (decisions 2026-11-07, the classifier's
  ruling).
- **Wave 3:** R6 (storage) is accepted (decisions 2026-11-08, R6 accepted): backups on E: and F:, never D: (the owner: D: is unreliable).
- **The weekday measurement is done** (R3-WEEKDAY, 2026-11-09): R8 prices
  the follower with the weekday table in US hours, the Saturday table otherwise
  (decisions 2026-11-09, R8's price table chosen).
- **The v1 defaults are approved** (decisions 2026-11-07, wave 1 closed): the owner chose them before
  the plan; the plan subagent starts from them.
- **The repository holds docs only:** no package.json, no code, no CI.
  GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes.

## Next up — IN ORDER

1. **R8** (does following pay; skill or luck) — **running since 2026-11-09
   08:30Z**: 50 traders, 1,256 entries to judge; its rules file frozen before
   any market data (decisions 2026-11-09, R8's rules file frozen); it captures
   market data now. The price table is chosen (decisions 2026-11-09, R8's
   price table chosen, from R3-WEEKDAY's measurement of that day); at its
   second stop the capture and the analysis are fingerprinted in decisions,
   then the one look.
2. **Wave 4:** R7 (the pages), after R8's verdict.
3. **The owner says the research is complete;** then the v1 plan, approved
   and registered in decisions; then the skeleton and v1 in parts.

## Open questions — the research answers them

- Whether the corrected style classifier (v2) passes its forward blind test
  (after 2026-11-21).
- Whether following pays at all, and whether the leaderboard is skill or luck
  (R8).


## How this file works

Status, next step and open questions come first — they are why this file is
read. It is the ONE file loaded into every session, so its size is a tax on
all of them: **keep it under ~10 KB, the latest value only, never a series.**
**REWRITE it; do not append to it.** Durable content belongs in the other
docs (CLAUDE.md, "Structure & docs"). Old versions:
`git log --follow -- docs/claude-current-task.md`.
