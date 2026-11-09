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
- **Wave 3 is closed.** R6 (decisions 2026-11-08, R6 accepted): backups on E:
  and F:, never D: (the owner: D: is unreliable). **R8 FAILS** (decisions 2026-11-09, R8 accepted): copying
  the top 50 directional traders about 80 s late lost 16.6 bps an entry and
  was no better than random trades; no confirmed skill on the leaderboard.
  v1 is planned as a watching and analysis tool; the owner continues with a
  second research round (decisions 2026-11-09, the owner's direction after
  R8).
- **Wave 4 is closed: R7, the pages** (decisions 2026-11-09, R7 accepted):
  eight pages of a watching and analysis tool; the pages read only the
  database; ports 3300 and 4300.
- **The v1 defaults are approved** (decisions 2026-11-07, wave 1 closed): the owner chose them before
  the plan; the plan subagent starts from them.
- **The repository holds docs only:** no package.json, no code, no CI.
  GitHub: `eastbeastSRB/polymarket-follow`, private; the owner pushes.

## Next up — IN ORDER

1. **The owner's word "research complete"** — the first research phase is
   finished (R7 accepted, decisions 2026-11-09). The owner first pushes and
   checks the work (2026-11-09: "once we agree we will continue").
2. **The v1 plan** — a watching and analysis tool, from the research and the
   owner's rulings (R7's pages, R8's verdict, the v1 defaults); approved and
   registered in decisions; then the skeleton and v1 in parts.
3. **Dated checks:** after 2026-11-21 the style classifier v2's forward
   blind test; after 2026-11-30 B2's confirmation (weeks 9–12, its plan
   recorded in decisions first).
4. **Research round 2** (the plan page's backlog: five leads, the agreed
   method) — on the owner's word, alongside the v1 build.

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
