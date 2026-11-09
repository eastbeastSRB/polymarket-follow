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

**Two "v1"s — words used here:**
- **v1 (the app):** the first working version of the tool the owner uses —
  leaderboards with style labels, favourites, Windows alerts, trader
  statistics, the paper-follow log. It is planned after the research is
  complete ("The v1 plan" below), then built in parts on a skeleton.
- **The style classifier v1 / v2:** versions of the rule that labels each
  account directional, algorithm, market maker, churner or unclassified (R2).
  Classifier v1 was scored blind and is used for the research; classifier v2
  fixes its two weak spots and must pass a forward blind test after
  2026-11-21 before the app ships with it (decisions 2026-11-07, the
  classifier's ruling).

## Where it stands

*Brought in step on 2026-11-09, through decisions 2026-11-09 (R8's price
table chosen).*

- Founded: its own repository, database and supervisor; watch-only; perps
  first (decisions 2026-11-06).
- Nothing is built. The perps API is researched in full (R1, external-apis):
  everything v1 needs is public and keyless, with history back to launch.
- **The operating budget is 250 weighted tokens a minute, all callers
  together, evenly spaced** (decisions 2026-11-07, wave 1 closed).
- The research phase runs in four waves; waves 1 (R1, R4, R5) and 2 (R2 with
  its blind labels, R3) are closed; in wave 3 R6 and the weekday price measurement are closed and R8 runs, its
  rules and its price table frozen (decisions 2026-11-07, 2026-11-08,
  2026-11-09). **The
  boards' tops are mostly algorithms, market makers and inactive accounts**
  (R2). Before v1 is planned, R8 asks once, on the past, whether
  following pays and whether the leaderboard is skill or luck, by rules the
  owner amended with R3 (decisions 2026-11-06, the pre-test and waves 2–4
  approved; 2026-11-07, R3 accepted).
- **How a trader is judged** (decisions 2026-11-07, R3 accepted): over a fixed
  horizon against random trades, never by the trader's own exits; a verdict
  only at E ≥ 400 for one of 20 followed traders, the pooled board of all
  favourites first.

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

- ✅ **R1 — The perps API in full:** every endpoint we would use — the
  leaderboard (how often it refreshes), fills and position-fills by address
  (history depth, paging, the 30-day default window), the portfolio, the PnL
  history (its parameters: a first call answered 400), instruments, funding,
  fees; each read's real weight; freshness; what a 429 looks like; the
  public WebSocket channels.
- ✅ **R2 — Trader analytics:** what to measure per trader (win rate, average
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
- ✅ **R3 — The paper-follow method:** the entry price after the alert's
  delay, fees, funding, slippage by instrument and hour, the exit; the
  after-following scoreboard and its null (polymarket-lab's F9 design:
  decisions 2026-11-06); the scoreboard's statistics valid however often the
  owner looks — an e-process, a verdict only at E ≥ 20, rules fixed before
  the data, a correction for many traders (decisions 2026-11-06, the
  pre-test and waves 2–4 approved).
- ✅ **R4 — Notifications:** Windows notifications from a background process
  (how, and how reliable — including under Task Scheduler, where a task run
  "whether the user is logged on or not" cannot show one), what an alert says;
  later phone and email.
- ✅ **R5 — Existing tools:** trackers that already follow perps or similar
  exchanges' traders, what they show, and what this project does differently.
- ✅ **R6 — Storage, retention and backup:** bytes per fill and per day at 5,
  50 and 100 followed traders (fill rates from R2); what to keep; the backup
  in its own folder on E: and F: (E: 92% full, 16 GB free, on 2026-11-06).
- ⬜ **R7 — The pages:** the leaderboard, a trader's page, favourites, the
  alert feed, the paper-follow log; the ports, clear of the lab's 3000 and
  4000. After R8: its verdict decides whether v1 is a copy-alert tool or a
  watching tool.
- ⏳ **The classifier v2's forward blind test:** the 100 holdout accounts'
  fills for 2026-11-07 to 2026-11-21, labelled blind by a fresh labeller, v2
  (frozen beforehand on non-holdout accounts) scored by the same rules; the app
  ships only with a v2 that passes (decisions 2026-11-07, the classifier's
  ruling). Trigger: 2026-11-21.
- 🔵 **R8 — Does following pay, and is the leaderboard skill or luck?** One
  retrospective study, one look, its rules fixed in decisions before it
  (decisions 2026-11-06, the pre-test and waves 2–4 approved). Running since
  2026-11-09: 50 traders, 1,256 entries to judge; its rules file frozen
  before any market data (decisions 2026-11-09, R8's rules file frozen); the
  one look waits for the price table. If following
  fails or there are too few to tell, v1 is planned as a watching and
  analysis tool, and the forward paper-follow log is the real test.

## Later — the backlog

- 🅿️ **Research round 2 — the search for a "win combination"** (the owner,
  2026-11-09, after R8 failed: the right trader, the right trades, the right
  instruments, the right moment; not a 10/10 record, a pattern that pays over
  many trades). The five leads recorded with the owner: (1) the weak
  persistence R8's B2 found (4-week profit per dollar traded predicted the
  next 4 weeks; not at the top) — its confirm pair needs weeks 9–12, rebuilt
  from fills read after 2026-11-30; (2) choosing traders on months of track
  record, consistency and small drawdowns instead of one month's top PnL;
  (3) choosing trades, not only traders — size unusual for the trader,
  several directional traders entering one market together, adding to a
  winner; (4) why #47's entries could not be copied at a profit while it made
  $109k (exits, sizing, patience); (5) other horizons and signals —
  multi-day holds for slow traders, order books, funding, prediction markets.
  More may be added then. **The method, agreed:** every hypothesis written
  down before it is tested; found on one stretch of past data and confirmed
  on another the search never touched (the data after 2026-11-07 is unread);
  then watched in the forward paper-follow log before any money relies on
  it. Trigger: the research phase complete (R7), and the owner's word.
- 🅿️ **Prediction-market traders** (the Polymarket Data API; polymarket-lab's
  external-apis holds verified facts about it, readable as a template; its
  daily top-50 leaderboard since late August 2026 is worth a one-time
  read-only export, since no API can backfill it). Trigger: v1 running well,
  and the owner's word.
- ⏳ **R4's owner test sheet** (`workers/R4-NOTIFY/OWNER-TEST-SHEET.md` in the
  supervisor folder: banners, the click, lock screen, Do Not Disturb, the Task
  Scheduler test, the own app name). Trigger: the notifier's build; the
  supervisor guides the owner through it (decisions 2026-11-07, wave 1
  closed).
- 🅿️ **Alerts on other devices and by email** — first ntfy with a long random
  topic, plus a dead-man's switch that alarms from outside when the PC is
  silent (R4 §9). Trigger: Windows alerts working.
- 🅿️ **A manual "same person" note** for addresses the owner links (R5).
  Trigger: v1 running, and the owner's word.
- 🅿️ **Paid data** — a higher rate tier or a data vendor. Trigger: research
  shows the free API cannot do something v1 needs; the owner decides.
- 🅿️ **Thinning order books before price jumps, as an alert type**
  (polymarket-lab's `docs/reviews/data-hunt-2026-11-04.md`, Q3). Trigger: v1
  running well, and the owner's word.
- 🅿️ **How fast the leaderboard turns over** (polymarket-lab's master-plan,
  "What the leaderboard is actually for", use 3). Trigger: v1 storing
  leaderboard snapshots.

## Done lately

- ✅ 11-09 **R3-WEEKDAY — the follower's price on a weekday:** two hours in
  US trading hours beside R3's Saturday table; costs higher on the weekday
  morning for majors, commodities and indices; R8 prices with the weekday
  table in US hours and the Saturday table otherwise (decisions 2026-11-09,
  R8's price table chosen).
- ✅ 11-08 **R6 — storage and backup:** small data for real traders (~0.17 GB a year for 20), a ceiling of 79 GB a year at 50 machine-speed favourites; backups on E: and F:, never D: (decisions 2026-11-08, R6 accepted).
- ✅ 11-08 **R2 — the style label and trader statistics** (with R2-LABELS,
  the blind labels): v1 scored blind (trap 2 of 23, both anchors caught), v2
  frozen for the forward test, the population of the boards' tops, the
  display defaults (decisions 2026-11-07, 2026-11-08).
- ✅ 11-07 **R3 — the paper-follow method:** the mark-plus-cost price, the
  fixed-horizon vote, e-Bonferroni and the pooled board; Final-reviewed by a
  fresh subagent; seven proposals approved (decisions 2026-11-07, R3
  accepted).
- ✅ 11-07 **Wave 1 — R1 (the API), R4 (notifications), R5 (existing
  tools):** verified on the supervisor's path, Final-reviewed (34 marked
  corrections); the operating budget set at 250 tokens a minute; the v1
  defaults approved (decisions 2026-11-07, wave 1 closed).
- ✅ 11-06 **The supervisor's first session:** the founding docs checked
  against the saved spec, the research phase proposed and approved
  (decisions 2026-11-06, the research phase approved).
- ✅ 11-06 **Founded:** the repository, the supervisor folder and the founding
  docs (decisions 2026-11-06, polymarket-follow founded).
