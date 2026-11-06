# Decisions log (append-only; newest on top)

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
