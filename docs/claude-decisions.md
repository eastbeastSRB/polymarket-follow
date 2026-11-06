# Decisions log (append-only; newest on top)

2026-11-06 (the pre-test and waves 2–4 approved — the owner, on the
supervisor's recommendations): **BEFORE V1 IS PLANNED, ONE RETROSPECTIVE LOOK
ASKS WHETHER FOLLOWING PAYS AT ALL, AND WHETHER THE LEADERBOARD IS SKILL OR
LUCK.** The owner sent nine lessons from polymarket-lab's supervisor
(2026-11-06), each with its source in `E:\coding\polymarket-lab`, read only:
the F9 drift probe (`docs/reviews/drift-probe-2026-09-04.md`, its review;
the lab's decisions 2026-09-04), data-hunt Q8
(`docs/reviews/data-hunt-2026-11-04.md`), STATS-1
(`docs/reviews/statistics-methods-2026-09-24.md`; the lab's decisions
2026-09-24, reading methods), READ-64 item 5 (the lab's decisions
2026-10-03), hunt-1 Q2 (`docs/reviews/hunt-1-2026-11-04.md`) and the lab
master-plan's "What the leaderboard is actually for". **Where they landed:**
(1) does following pay and (2) skill or luck → **R8-PRETEST**, one new study;
(3) the scoreboard's statistics → R3: an e-process valid however often the
owner looks (a verdict only at E ≥ 20, as the lab's nightly number), rules
fixed before the data, a correction for testing many traders at once; (4)
realized profit against account value — the perps board counts closed trades
only, so a trader banking small wins and holding big losers open ranks high
while underwater → R2, an "underwater" flag beside the style label; (5)
profit per volume by instrument category (crypto majors, small coins, US
stocks, commodities, pre-IPO) → R2, read relatively, the volume beside it;
(6)–(9) competition players and reward farmers, thin markets and the
follower's slippage, liquidity by hour and stock sessions, data freezes →
already in the plan (R1–R4, the v1 plan), now with the lab's evidence. **THE
WAVES, REVISED:** wave 2 — R2-STYLE (Opus 5.5, max; 350 tokens a minute; it
also collects the pool's fill histories R8 reuses), R2-LABELS (Sonnet 5.5,
xhigh; blind, no API), R3-PAPER (Opus 5.5, max; 100); wave 3 — R8-PRETEST
(Opus 5.5, max; 450), R6-STORAGE (Sonnet 5.5, xhigh; 50); wave 4 — R7-PAGES
(Sonnet 5.5, xhigh), after R8, whose verdict decides what v1 is. **R8'S
RULES, FIXED NOW** — the structure; every number marked [R1], [R2] or [R3]
is filled from those reports, shown to the owner and recorded here BEFORE the
one look:
**A — DOES FOLLOWING PAY?** (A1) *Pool:* the all-time NOTIONAL board's
pageable top 1,000, read at a stamped instant — chosen on activity, not
profit. (A2) *Periods:* selection, the 30 days before T0; measurement, [T0,
T1), as long as the fill history allows [R1]. (A3) *Tracked set, fixed at T0
from pre-T0 data only:* labelled directional by R2's frozen classifier on
pre-T0 fills [R2]; window notional above a floor (the lab's dormant-wallet
trap) [R2]; at least 10 closed positions in the window; the top 50 by
realized PnL minus fees. Secondary arm: the top 50 by PnL / notional. (A4)
*Entry:* each opening from flat and each flip; fills of one order and fills
within 60 s merged; adds secondary. (A5) *The follower's price:* the first
public trade at or after the fill plus the delay the planned poller would
really have had — the next poll at a random phase (fixed seed), the API's lag
[R1], the notification [R4], 60 s to act — plus the cost of crossing the
spread [R3]; never a price before the fill (the follower cannot capture the
trader's own impact: F9). Secondary delays 15 s, 5 min, 30 min. (A6) *Exit:*
mirror the trader's close or liquidation after the same delay; open at T1 →
marked at T1 and flagged; secondary horizons 1 h, 6 h, 24 h. (A7) *Costs:*
the base-tier taker fee on both legs and funding over the hold, signed [R1].
(A8) *Unit:* net return on equal notional per entry. (A9) *Null:* per entry,
3 random public trades in the same instrument and the same UTC hour of the
same day (the tracked accounts' trades removed by trade ID if R1 confirms the
match [R1]), each keeping its own taker direction, with the same delay,
holding time and costs; fixed seed; d = tracked − the mean of its nulls.
(A10) *Honest N is traders:* a paired bootstrap clustered by trader (2,000
resamples), and by calendar day as a second clustering. (A11) *The verdict,
one look, the primary cell only:* **PAYS** only if (i) the mean tracked net
return is above zero with its trader-clustered 95% interval above zero, (ii)
the mean d is above zero with its 95% interval above zero under both
clusterings, and (iii) the exact two-sided sign test, one vote per trader (its
mean d), gives p < 0.05 in favour; **TOO FEW TO TELL** under 20 traders with 5+
entries or under 300 entries; **FAILS** otherwise. The upper end of d's
interval is always printed against the round-trip cost. (A12) Secondaries —
other delays and horizons, the ratio arm, adds, categories, hours, sessions —
decide nothing. (A13) *Frozen before the look:* a rules file with every
threshold, committed and recorded here; the capture stored with its read
instant; the analysis reads only the capture (polymarket-lab 2026-09-04: an
experiment that reads a live collection has no fixed answer); a changed
threshold makes a new run, never a revision.
**B — SKILL OR LUCK?** (one study with A, the same pool) (B1) *Reappearance:*
weekly boards rebuilt within the pool from fills (Monday 00:00 UTC; PnL =
realized − fees, funding estimated and stated), directional accounts only;
the share of week w's PnL top 50 also in week w+1's, against the same share
on the notional board. Find on the first half of the weeks, confirm on the
second; **kill** in the find half unless PnL reappearance exceeds notional
reappearance with a week-block bootstrap interval excluding zero. (B2)
*Persistence:* rank on PnL / notional over 4 weeks, measure the next 4;
Spearman and the top fifth minus the rest against 2,000 permutations; find on
the first pair, confirm on the next; **kill** if the find pair's correlation
is ≤ 0 or its permutation p ≥ 0.05. (B3) Under 8 weeks of history [R1], B is
"not testable yet" and becomes a forward measurement on v1's stored weekly
boards. (B4) A board rebuilt inside the pool is not the real board; stated.
**THE OWNER'S RULINGS WITH IT:** (1) **"Too few to tell" counts as not
proven:** v1 is then planned as a watching tool and the forward paper-follow
log is the real test. (2) **If following fails,** alerts still fire, as
information about what a trader did; what goes is the copy framing and the
scoreboard's headline place. (3) **Bulk research data** goes gzip-compressed
to `F:\polymarket-follow-research\` (E: 16 GB free, 92% full; F: 1,556 GB
free — measured 2026-11-06 22:18Z).

2026-11-06 (the research phase approved — the owner, recorded by this
project's supervisor in its first session): **THE RESEARCH PHASE STARTS, IN
THREE WAVES.** The supervisor's first report (2026-11-06, from the saved spec
in `verify/SEED-PERPS-1106/`) found the founding docs short of what the spec
says: the leaderboard pages only to rank 1,000; the spec publishes each
endpoint's request weight (fills, position-fills, trades and funding 10;
portfolio, leaderboard and klines 5; fills and position-fills cached 2 s, a
cached read costing 1); `trade_id` is a plain JSON integer already at 94.6% of
JavaScript's largest exact integer; `/v2/info/pnl` is not in the saved spec;
money fields are decimal strings of up to 28 digits; and "both sides at once"
cannot be read from one account's net position. R1 corrects external-apis
with live evidence; R2 redefines the style features. **The owner approved, on
the supervisor's recommendations: (1) THE WAVES.** Wave 1: R1-API, R4-NOTIFY
and R5-TOOLS in parallel (Sonnet 5.5, effort xhigh). Wave 2: R2-STYLE and
R3-PAPER (Opus 5.5, effort max — their output decides something: a ship gate
and the honesty method), with R2-LABELS, a blind re-check of R2's labels
(Sonnet 5.5, xhigh). Wave 3: R6-STORAGE and R7-PAGES (Sonnet 5.5, xhigh).
Waves 2 and 3 are revised with the owner's lessons from polymarket-lab and
shown to the owner before they start. R6 waits for R2's fill rates by style
instead of running beside R1 as the plan page said, because **every subagent
that calls the API shares one IP budget** — with each other and with this
machine's other traffic. **(2) THE WEIGHT CHECK:** R1 runs 10 minutes of
steady load at the planned rate (half the budget), which must see zero 429s,
plus ONE ceiling test on fills that stops at the first 429 and pauses 2
minutes — the one deliberate touch of the limit, because the replies carry no
rate-limit header to confirm the published weights by. **(3) TASK
SCHEDULER:** R4 prepares its test task; the owner registers and runs it at a
time agreed with the supervisor (no persistent setting without the owner's
yes: WORKFLOW). **(4) THROWAWAY MEASUREMENT SCRIPTS** in a subagent's own
`workers/<NAME>/` folder are research, not code — like the founding probe; no
app code and no package installs until the owner approves the v1 plan. **(5)
THE OWNER'S RULE — EVERY REPORT GOES BEYOND ITS BRIEF:** besides the
variations, possibilities, problems with their handling and unknowns
(2026-11-06, three more of the owner's requirements), every report has a
"Beyond the brief" section — what nobody asked but matters — and ends with
its questions for the owner, each with a recommendation. The owner: "think
out of the box, try to get everything, predict everything ... all your
subagents which will work should work on same way until we define 100% what
we doing and how we doing." **The rules for every subagent that calls the
API:** the user agent `polymarket-follow-research`; a fixed token share each,
all together at most 500 weighted tokens a minute (half the published 1,000);
stop at the first 429 and pause; no calls during polymarket-lab's nightly
window, 02:35–03:50 UTC; Node's built-ins only.

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
