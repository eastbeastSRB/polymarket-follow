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

*Brought in step on 2026-11-06, through decisions 2026-11-06
(polymarket-follow founded).*

- Founded: its own repository, database and supervisor; watch-only; perps
  first (decisions 2026-11-06).
- Nothing is built. The perps API was verified for following before founding:
  public leaderboards 100 a page, any account's fills and open positions by
  address, the rate budget (external-apis).

## The plan — the next steps

| | When | What | Who |
|---|---|---|---|
| 🟢 | next | The supervisor's first session: read everything, report what it understood, propose the research briefs | the supervisor |
| ⬜ | on the owner's yes | The research phase, R1–R7 (below) | subagents, one report each |
| ⬜ | after the research | The v1 plan: what v1 does, what waits; the owner approves; registered in decisions | a plan subagent |
| ⬜ | after the plan | The skeleton: Turborepo, the docs-size report and the decisions guard in the test run, CI | a build subagent |
| ⬜ | after the skeleton | v1, in parts, each planned first and Final-reviewed | build subagents |

## The research phase (R1–R7)

Each topic is one subagent with a written report in `docs/reviews/`, every
number from a saved script output, every fact about an API added to
external-apis, dated and sourced. R1, R4, R5 and R6 can run in parallel; R2
and R3 need R1's facts; R7 comes last.

- ⬜ **R1 — The perps API in full:** every endpoint we would use — the
  leaderboard (how often it refreshes), fills and position-fills by address
  (history depth, paging, the 30-day default window), the portfolio, the PnL
  history (its parameters: a first call answered 400), instruments, funding,
  fees; each read's real weight; freshness; what a 429 looks like; the
  public WebSocket channels.
- ⬜ **R2 — Trader analytics:** what to measure per trader (win rate, average
  hold, leverage, drawdown, PnL by market, trades per day); how to tell an
  algorithm or market maker from a directional trader (the all-time #1 made
  100 fills in 64 minutes); which statistics stay honest at small samples.
- ⬜ **R3 — The paper-follow method:** the entry price after the alert's
  delay, fees, funding, slippage, the exit; the after-following scoreboard
  and its null (polymarket-lab's F9 design: decisions 2026-11-06).
- ⬜ **R4 — Notifications:** Windows notifications from a background process
  (how, and how reliable with the browser closed), what an alert says; later
  phone and email.
- ⬜ **R5 — Existing tools:** trackers that already follow perps or similar
  exchanges' traders, what they show, and what this project does differently.
- ⬜ **R6 — Storage, retention and backup:** bytes per fill and per day at 5,
  50 and 100 followed traders; what to keep; the backup in its own folder on
  E: and F: (E: was 92% full on 2026-11-05).
- ⬜ **R7 — The pages:** the leaderboard, a trader's page, favourites, the
  alert feed, the paper-follow log; the ports, clear of the lab's 3000 and
  4000.

## Later — the backlog

- 🅿️ **Prediction-market traders** (the Polymarket Data API; polymarket-lab's
  external-apis holds verified facts about it, readable as a template).
  Trigger: v1 running well, and the owner's word.
- 🅿️ **Alerts on other devices and by email.** Trigger: Windows alerts working.
- 🅿️ **Paid data** — a higher rate tier or a data vendor. Trigger: research
  shows the free API cannot do something v1 needs; the owner decides.

## Done lately

- ✅ 11-06 **Founded:** the repository, the supervisor folder and the founding
  docs (decisions 2026-11-06, polymarket-follow founded).
