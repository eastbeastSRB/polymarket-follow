# Decisions log (append-only; newest on top)

2026-11-06 (three more of the owner's requirements, before this project's
supervisor starts — recorded by polymarket-lab's supervisor): **(1) ALGORITHMS
AND MARKET MAKERS ARE ALWAYS RECOGNISED, NEVER FOLLOWED BY MISTAKE.** The live
check that founded the project (2026-11-06) found the all-time #1 of the perps
leaderboard making 100 fills in 64.4 minutes across 7 instruments — 48 adds,
52 reductions, every one a taker fill — while holding 11 positions at once: an
algorithm, whose alerts would mean nothing to a follower. The owner: "we need
to avoid this and always recognize so to not get into trap." So every account
the project stores carries a style label computed from its own fills (trades
per day, holding time, both sides at once, positions held), shown wherever the
account appears; alerts and the paper-follow scoreboard cover directional
traders by default; favouriting an account labelled an algorithm or market
maker warns first. R2 designs the classifier and proves it on labelled
examples before v1 is planned; v1 does not ship without it. **(2) EVERYTHING
IS RESEARCHED BEFORE ANYTHING IS BUILT** — the owner: "everything need to be
fully researched all variations, all possibilities, all potential problems,
and everything before i start." Every research report states the variations it
weighed, the possibilities it found, the potential problems and how each would
be handled, and what stays unknown; the supervisor walks the owner through the
reports, and nothing is planned or built until the owner says the research is
complete. **(3) THE LAB'S DATA DOES NOT CARRY OVER TO PERPS.**
polymarket-lab's three months are prediction-market data — its forecasts,
scores and a daily top-50 leaderboard of prediction-market traders since late
August 2026 (its `leaderboard_snapshots`) — and perps is a separate exchange
with its own traders, so perps starts from its own API. When prediction-market
traders are added (the plan page's backlog), that leaderboard series is worth
a one-time read-only export: no API can backfill standings over time
(polymarket-lab's master-plan), and reading is not writing (Iron Rule 2).

2026-11-06 (polymarket-follow founded — the owner's decisions, recorded by
polymarket-lab's supervisor before this project's own supervisor starts):
**A SEPARATE PROJECT, WATCH-ONLY.** The owner wants to follow Polymarket
Perps traders — the leaderboards, favourites, a notification when one opens
or closes a position, statistics on how they trade, and an honest
paper-follow log — outside the forecasting lab ("all of this not have
relation with our laboratory forecasting"). **(1) Its own repository and its
own supervisor chat,** not a module of polymarket-lab: two supervisors in one
repository would edit the same shared files, a failing test here would block
the lab's checks, and this project reads prices and follows wallets, which
the lab's price-blind rules forbid there. The lab's way of working, stack and
documentation system are copied, never shared (the owner: "if you think it is
better like that"). **(2) Watch only:** no order code, no trading keys, no
automatic copying; public endpoints only (CLAUDE.md, Iron Rule 1). **(3)
Perps first,** prediction markets later ("let's try first only with perps").
**(4) Windows notifications first,** other devices and email later. **(5)
Favourites 5–50,** the polling interval set by research from the API's real
limits. **(6) Keep the data,** in this project's own database with its own
backup folder. **(7) Research before the plan, the plan before code:** R1–R7
(the plan page), then a v1 plan the owner approves; the owner is open to
paying for data if research shows a need. **(8) The paper-follow log is
honest by design** (Iron Rule 4): polymarket-lab's F9 probe (2026-09-04, 660
wallets) found tracked top wallets' entries predicted 1–24 h price moves no
better than random trades in the same markets at the same hours, so only a
record kept after following starts, net of the alert's delay, fees and
funding, can show whether following pays. **(9) The simplest good solution,
following current best practices,** checked against official documentation
or the web when unsure — the owner's standing approval, as in forecast-site
(2026-10-28) and polymarket-lab. **VERIFIED BEFORE FOUNDING** (live calls
2026-11-06 13:59Z and 14:35Z; the supervisor folder's
`verify/SEED-PERPS-1106/`): the public leaderboard, fills and open positions
by address, the rate budget — docs/claude-external-apis.md.
