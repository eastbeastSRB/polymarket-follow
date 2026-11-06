# polymarket-follow — the plan

The owner's plan page: what is planned, waiting, parked or closed, and why.
What the project is: CLAUDE.md. What is built: architecture. Why a choice
was made: decisions.

## How to read and keep this file

Every work item carries one status marker:

| Marker | Meaning |
|---|---|
| ✅ | done — in "Done lately" for two weeks, then out (its decisions entry stays) |
| 🔵 | running now |
| 🟢 | ready — its trigger has fired; next when there is room |
| ⏳ | waiting on a named trigger |
| 🅿️ | parked — kept with its trigger, not planned |
| 🧹 | a tidy-up waiting for the next touch of its file |
| ⬜ | not started, in the plan's order |
| 🟡 | partly done — what is left is named |
| ❌ | dropped or closed — the reason in decisions |

No heading carries a date: "Where it stands" carries one "Brought in step on"
line instead. After every finished task the supervisor brings this file in
step with the record; only the supervisor sets a marker.

## Where it stands

*Brought in step on 2026-11-06, through decisions 2026-11-06 (the pre-test
and waves 2–4 approved).*

- Founded: its own repository, database and supervisor; watch-only; perps
  first (decisions 2026-11-06).
- Nothing is built. The perps API was verified for following before founding:
  public leaderboards 100 a page, any account's fills and open positions by
  address, the rate budget (external-apis).
- The research phase runs in four waves; wave 1 (R1, R4, R5) is running
  (decisions 2026-11-06, the research phase approved). Before v1 is planned,
  R8 asks once, on the past, whether following pays and whether the
  leaderboard is skill or luck (decisions 2026-11-06, the pre-test and waves
  2–4 approved).

## The plan — the next steps

| | When | What | Who |
|---|---|---|---|
| 🔵 | now | The research phase, R1–R8 (below), in four waves | subagents, one report each |
| ⬜ | after the research | The v1 plan: what v1 does, what waits; the owner approves; registered in decisions | a plan subagent |
| ⬜ | after the plan | The skeleton: Turborepo, the docs-size report and the decisions guard in the test run, CI | a build subagent |
| ⬜ | after the skeleton | v1, in parts, each planned first and Final-reviewed | build subagents |

## The research phase (R1–R8)

Each topic is one subagent with a written report in `docs/reviews/`, every
number from a saved script output, every fact about an API added to
external-apis, dated and sourced. **Every report states the variations it
weighed, the possibilities it found, the potential problems and how each
would be handled, and what stays unknown;** the supervisor walks the owner
through each, and nothing is planned or built until the owner says the
research is complete (decisions 2026-11-06, three more of the owner's
requirements). **Every report also has a "Beyond the brief" section and ends
with its questions for the owner, each with a recommendation** (decisions
2026-11-06, the research phase approved). **The waves** (decisions
2026-11-06, the pre-test and waves 2–4 approved): 1 — R1, R4, R5 in
parallel; 2 — R2 (with R2-LABELS, a blind re-check of its labels) and R3,
after R1; 3 — R8 and R6, after R2 and R3; 4 — R7, after R8. Every subagent
that calls the API shares one IP budget, so the waves are also its schedule;
bulk research data goes gzip-compressed to `F:\polymarket-follow-research\`.

- 🔵 **R1 — The perps API in full:** every endpoint we would use — the
  leaderboard (how often it refreshes), fills and position-fills by address
  (history depth, paging, the 30-day default window), the portfolio, the PnL
  history (its parameters: a first call answered 400), instruments, funding,
  fees; each read's real weight; freshness; what a 429 looks like; the
  public WebSocket channels.
- ⬜ **R2 — Trader analytics:** what to measure per trader (win rate, average
  hold, leverage, drawdown, PnL by market, trades per day), and which
  statistics stay honest at small samples. **A v1 requirement:** a style
  label on every account — algorithm or market maker versus directional
  trader — from its own fills (trades per day, holding time, both sides at
  once, positions held), proven on labelled examples (the all-time #1: 100
  fills in 64 minutes, 11 positions at once); alerts and the scoreboard
  cover directional traders by default (decisions 2026-11-06, three more of
  the owner's requirements). Also: an "underwater" flag (realized profit
  against account value — the board counts closed trades only), profit per
  volume by instrument category, competition players and reward farmers,
  and the pool's fill histories that R8 reuses (decisions 2026-11-06, the
  pre-test and waves 2–4 approved).
- ⬜ **R3 — The paper-follow method:** the entry price after the alert's
  delay, fees, funding, slippage by instrument and hour, the exit; the
  after-following scoreboard and its null (polymarket-lab's F9 design:
  decisions 2026-11-06); the scoreboard's statistics valid however often the
  owner looks — an e-process, a verdict only at E ≥ 20, rules fixed before
  the data, a correction for many traders (decisions 2026-11-06, the
  pre-test and waves 2–4 approved).
- 🔵 **R4 — Notifications:** Windows notifications from a background process
  (how, and how reliable — including under Task Scheduler, where a task run
  "whether the user is logged on or not" cannot show one), what an alert says;
  later phone and email.
- 🔵 **R5 — Existing tools:** trackers that already follow perps or similar
  exchanges' traders, what they show, and what this project does differently.
- ⬜ **R6 — Storage, retention and backup:** bytes per fill and per day at 5,
  50 and 100 followed traders (fill rates from R2); what to keep; the backup
  in its own folder on E: and F: (E: 92% full, 16 GB free, on 2026-11-06).
- ⬜ **R7 — The pages:** the leaderboard, a trader's page, favourites, the
  alert feed, the paper-follow log; the ports, clear of the lab's 3000 and
  4000. After R8: its verdict decides whether v1 is a copy-alert tool or a
  watching tool.
- ⬜ **R8 — Does following pay, and is the leaderboard skill or luck?** One
  retrospective study, one look, its rules fixed in decisions before it
  (decisions 2026-11-06, the pre-test and waves 2–4 approved). If following
  fails or there are too few to tell, v1 is planned as a watching and
  analysis tool, and the forward paper-follow log is the real test.

## Later — the backlog

- 🅿️ **Prediction-market traders** (the Polymarket Data API; polymarket-lab's
  external-apis holds verified facts about it, readable as a template; its
  daily top-50 leaderboard since late August 2026 is worth a one-time
  read-only export, since no API can backfill it). Trigger: v1 running well,
  and the owner's word.
- 🅿️ **Alerts on other devices and by email.** Trigger: Windows alerts working.
- 🅿️ **Paid data** — a higher rate tier or a data vendor. Trigger: research
  shows the free API cannot do something v1 needs; the owner decides.
- 🅿️ **Thinning order books before price jumps, as an alert type**
  (polymarket-lab's `docs/reviews/data-hunt-2026-11-04.md`, Q3). Trigger: v1
  running well, and the owner's word.
- 🅿️ **How fast the leaderboard turns over** (polymarket-lab's master-plan,
  "What the leaderboard is actually for", use 3). Trigger: v1 storing
  leaderboard snapshots.

## Done lately

- ✅ 11-06 **The supervisor's first session:** the founding docs checked
  against the saved spec, the research phase proposed and approved
  (decisions 2026-11-06, the research phase approved).
- ✅ 11-06 **Founded:** the repository, the supervisor folder and the founding
  docs (decisions 2026-11-06, polymarket-follow founded).
