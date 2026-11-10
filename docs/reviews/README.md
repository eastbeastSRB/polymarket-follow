# Reviews

Research reports, plans, audits and build reviews, one file per review, named
for what it is and the date it was run. Point-in-time evidence — **never
appended to**; a Final review's corrections are marked in place. A number in
here was true when it was measured and is not maintained afterwards.

**A review decides nothing on its own.** Whatever it concludes has to be
copied into CLAUDE.md, current-task, architecture, decisions, code-rules, the
plan page or external-apis — or it does not exist.

| Review | What | Accepted |
|---|---|---|
| `r1-perps-api-2026-11-07.md` | R1-API: the Perps API in full — endpoints, the token-bucket limit, fills semantics, the tape, history depth, the feasibility table; 14 Final-review corrections (§8) | decisions 2026-11-07, wave 1 closed |
| `r4-notifications-2026-11-06.md` | R4-NOTIFY: Windows notifications from the poller — PowerShell toasts, sessions under Task Scheduler, silent failures, alert noise; the owner test sheet in the supervisor folder; 11 corrections | decisions 2026-11-07, wave 1 closed |
| `r2-trader-style-2026-11-08.md` | R2-STYLE: the style label (v1 scored blind; v2 frozen for the forward test), the boards' population, flags, statistics honest at small N, the capture for R8; 8 Final-review corrections | decisions 2026-11-08, R2 accepted |
| `r2-labels-2026-11-07.md` | R2-LABELS: blind labels of the 100 holdout accounts by the frozen definitions | decisions 2026-11-08, R2 accepted |
| `r3-paper-follow-2026-11-07.md` | R3-PAPER: the follower's price on a thin market (the mark plus the measured cost), the fixed-horizon vote against random trades, e-Bonferroni and the pooled board, proven on simulations; 12 corrections by a fresh reviewer (R3-REVIEW) | decisions 2026-11-07, R3 accepted |
| `r3-weekday-2026-11-09.md` | R3-WEEKDAY: the follower's price on a weekday morning in US hours (2026-11-09 14:30–16:30Z) beside R3's Saturday table, the weekday rule table for R8, session_pair recommended; 10 Final-review corrections | decisions 2026-11-09, R8's price table chosen |
| `collector-plan-2026-11-10.md` | COLLECTOR-PLAN (C1): the plan for the collector — two public streams (books ≤ 1 a second, every trade), REST reads at ~3 tokens a minute, files on F: and a database, a start-up task outside the session, backups, the first code as `apps/poller`, eight build parts; download 24–31 GB a day with lighter options; deviations D1–D14; 15 Final-review corrections | decisions 2026-11-10, round 2's rules and the collector approved |
| `ideas-review-2026-11-10.md` | IDEAS-REVIEW (P0-4, Fable): fresh eyes on everything — a blind stage, then 3 foundations + 25 ranked studies merged with our list and DOCS-SWEEP, the critique of R8 and of our method, Appendix A: the exams' rule (one 5% budget for the batch: 0.5% at the first exam, 4.5% by Holm at the final), the "blind store" rule by field, the first measurements and ten draft register entries; 14 Final-review corrections | decisions 2026-11-10, round 2's rules and the collector approved |
| `docs-sweep-2026-11-10.md` | DOCS-SWEEP (P0-3): every page of Polymarket's Perps documentation and the specs against what we know — routes live but not in the spec, Polygon and the exchange contract, the competition board without a 1,000 cap, TP/SL invisible in fills, the margin, liquidation and rewards rules, six docs-versus-API contradictions, a list for the collector; 12 Final-review corrections | decisions 2026-11-10, round 2's rules and the collector approved |
| `r7-pages-2026-11-09.md` | R7-PAGES: the pages of a watching and analysis tool — eight pages with fields, sources, costs and states, wireframes, the label block, honest statistics on screen, a wording guide, alerts, ports, what v1 builds and what waits; a one-page summary for the owner at its top; 12 Final-review corrections | decisions 2026-11-09, R7 accepted |
| `r8-pretest-2026-11-09.md` | R8-PRETEST: does following the top directional traders pay (FAILS: −16.6 bps an entry, no better than random trades), is the leaderboard skill or luck (no confirmed skill); the capture, the frozen rules, the one look; 13 corrections by a fresh reviewer (R8-REVIEW) | decisions 2026-11-09, R8 accepted |
| `r6-storage-2026-11-08.md` | R6-STORAGE: bytes per record measured on the captures, per day and year (modelled ±25%), the ceiling, retention, the backup script and its schedule, the machine's disks; 13 Final-review corrections (§8) | decisions 2026-11-08, R6 accepted |
| `r5-existing-tools-2026-11-06.md` | R5-TOOLS: existing trackers, copy-trading metrics and the evidence on copying, published bot and market-maker classifiers, competitions and rewards; 9 corrections (§8) | decisions 2026-11-07, wave 1 closed |
