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
| `r6-storage-2026-11-08.md` | R6-STORAGE: bytes per record measured on the captures, per day and year (modelled ±25%), the ceiling, retention, the backup script and its schedule, the machine's disks; 13 Final-review corrections (§8) | decisions 2026-11-08, R6 accepted |
| `r5-existing-tools-2026-11-06.md` | R5-TOOLS: existing trackers, copy-trading metrics and the evidence on copying, published bot and market-maker classifiers, competitions and rewards; 9 corrections (§8) | decisions 2026-11-07, wave 1 closed |
