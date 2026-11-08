# Decisions log (append-only; newest on top)

2026-11-08 (R2 and R2-LABELS accepted, and the display defaults — the owner,
on the supervisor's recommendations): **THE BOARDS' TOPS ARE MOSTLY
ALGORITHMS, MARKET MAKERS AND INACTIVE ACCOUNTS, AND THE APP SHOWS EVERY LABEL
WITH ITS EVIDENCE.** R2's report (`docs/reviews/r2-trader-style-2026-11-08.md`,
8 Final-review corrections marked in place) and R2-LABELS's
(`r2-labels-2026-11-07.md`) are accepted; the supervisor re-ran the frozen
classifier on all 1,615 non-holdout accounts and joined it with the board
ranks itself — all-time notional top 100: 6 directional, 67 non-directional,
26 with no fill in the two weeks to 2026-11-07 (the first directional at #47);
all-time PnL top 100: 15 / 32 / 40; all 54 competition-disqualified accounts
non-directional. Each week's top 50 by realized PnL (rebuilt inside the pool,
six weeks to 2026-11-02) kept only 18–32 of 50 positive the next week. The
leaderboard's PnL most likely excludes the liquidity rewards (not proven: the
rewards' recipients are not public). **Display defaults for the v1 plan:**
every style label shown with its window, its coverage and its reason; realized
and unrealized PnL side by side with an "underwater" flag; accounts with no
fill in 30 days greyed; "disqualified" a flag, never an automatic label; a win
rate shown only from 20 closed positions, with its interval and shrinkage.
**For R8** (its numbers, shown to the owner before they are frozen): the
capture `F:\polymarket-follow-research\R2-STYLE\` (T_CAP 2026-11-07T00:00Z),
`scripts/r8-pret0.mjs` (v1 on pre-T0 fills only), a $25k notional floor in the
30-day selection window, and R2's written rule for "an account a careful
reader would doubt" (R2 §1 Q10).

2026-11-08 (the style classifier v2 frozen for the forward blind test — the
supervisor): **V2 IS FINGERPRINTED BEFORE THE DATA IT WILL BE TESTED ON
EXISTS.** R2 froze it at 2026-11-08T00:07:16Z, built and checked on
non-holdout accounts only (decisions 2026-11-07, the classifier's ruling):
v1 plus an order-level fixed-size sign and "at least 8 decisions or 3 closed
cycles" before "directional"; v1's files unchanged (hashes re-checked).
`classifier-v2.json` SHA-256
`96f99e1ad4a40c6479748bc3ffb6bfbcf490f82bb68e5c70edcb39c3a35d133e`,
`scripts/classifier-v2.mjs` `1ff0383f…13cb2`, `scripts/label-accounts-v2.mjs`
`19301cbf…7cff` (in `workers/R2-STYLE/`; copies in
`verify/R2-STYLE/frozen-classifier-v2/`). On non-holdout accounts: D 236 · N 192
· U 391 · no fill 796 (v1: 293 directional). R2's Final review disclosed one
more weakness, kept for a v3 and not fixed in v2: tempo is averaged over the
whole window, so a bot active on only one or two days reads slower than it is.
The test: after 2026-11-21, the holdout's fills for 2026-11-07 to 2026-11-21,
labelled blind by a fresh labeller, v2 scored by the frozen rules.

2026-11-07 (the classifier's ruling — the owner, on the supervisor's
recommendations; and the supervisor's prior before R8): **V1 OF THE STYLE
CLASSIFIER IS USED FOR THE RESEARCH; THE APP SHIPS ONLY WITH A V2 THAT PASSES
AN HONEST FORWARD BLIND TEST.** The score (decisions 2026-11-07, R2's
classifier scored: trap 2 of 23, both anchors caught) showed two weak spots —
slow fixed-size algorithms, and "directional" called on thin evidence. A fix
made now would be tuned on labels already seen, so: (1) **R8 uses v1;** its
tracked set already needs 10 closed positions (A3), which removes most thin
evidence, and R8 prints its primary result again with the tracked accounts a
careful reader would doubt left out, as a sensitivity. (2) **R2 designs a v2**
for the two weak spots on non-holdout accounts only, and freezes it with its
hash before the test data exists. (3) **The forward blind test:** after
2026-11-21 the 100 holdout accounts' fills for 2026-11-07 to 2026-11-21 —
data nobody has seen — are pulled, a fresh blind labeller labels them by the
frozen definitions, and the supervisor scores v2 by the same rules; R2 never
opens the holdout's data meanwhile. (4) **In the app, a "directional" label
on thin evidence carries a warning.** **THE SUPERVISOR'S PRIOR FOR R8, written
before its rules are frozen and before its one look:** PAYS ~20%, FAILS ~50%,
TOO FEW TO TELL ~30%. Why: polymarket-lab's F9 found no edge in top
prediction-market wallets; the published evidence on copying finds none after
costs (R5); the best on-chain wallets' information is used within seconds
(R5, Zhai) while a follower here acts 20–80 s late; a round trip costs ~8–10
bps in fees and spread; and most of what tops the boards is algorithms and
market makers (R2-LABELS: 23 of the 37 active holdout accounts with a clear
label). For it: the owner follows directional traders only, perps leaders may
differ from prediction-market ones, and R8's horizons reach 24 h.

2026-11-07 (R2's classifier scored — the supervisor, by the rules fixed
before any label existed): **THE TRAP RATE IS 2 OF 23 (8.7%, 95% INTERVAL
1.1–28.0%); BOTH ANCHORS ARE CAUGHT.** The supervisor ran the frozen
classifier (decisions 2026-11-07, R2's classifier frozen) on R2-LABELS's copy
of the 100 holdout accounts, 2026-11-07 09:43Z (output
`verify/R2-STYLE/classifier-holdout.tsv`, SHA-256 `77c05ec2…c635`), and
scored it with its own script against the fingerprinted blind labels
(`verify/R2-STYLE/score.cjs`, its Clopper–Pearson self-test passed; output
`score.out.txt`). The 40 accounts R2-LABELS found idle the classifier found
idle too; 60 were scored. **Primary:** of the 23 accounts R2-LABELS labelled
non-directional (17 algorithm, 6 market maker), the classifier called 2
directional — `0xc455dbd3` and `0x7d641ac8`, both algorithms trading a fixed
size, which the classifier's fixed-size sign misses below 10 decisions a day.
The two anchors: algorithm. **Secondary:** traders lost (R2-LABELS
directional, classifier non-directional) 1 of 14 (`0x7c97eb77`, 50 large
resting orders, called market maker); risky D (R2-LABELS unclassified,
classifier directional) 6 of 23, all "too few" to the labeller — the
classifier needs 5 decisions, the labeller wanted more; abstentions 6 of 37;
horizon agreement 5 of 8; D/N/U agreement 45 of 60, six-way 40 of 60. **What
it means:** the classifier catches most of the trap but not all of it, and on
thin evidence it says "directional" where a careful reader says "can't
tell". Any change made now is made after seeing the holdout, so it can no
longer be tested on these labels; whether v1 is good enough, and how a
corrected version is tested honestly, is the owner's ruling.

2026-11-07 (R2's classifier frozen — the supervisor, at R2-STYLE's third
stop, before scoring): **THE STYLE CLASSIFIER IS FINGERPRINTED BEFORE THE
SUPERVISOR RUNS IT ON THE HOLDOUT.** R2 built it on non-holdout accounts only
(its run log: three runs, none on the holdout) and froze it at
2026-11-07T09:42:15Z: `classifier-v1.json` (thresholds) SHA-256
`d803192c779e107b61eab13b4bd52fc488b04cd0c9f38939c2efb5acf292e4ad`,
`scripts/classifier.mjs` (the rules) `f7f32f22…8c01`,
`scripts/label-accounts.mjs` (the apply script) `aa9df253…a9a4` (in
`workers/R2-STYLE/`; copies in `verify/R2-STYLE/frozen-classifier/`). On the
1,602 non-holdout accounts it labelled 807 with fills in the window:
directional 288, algorithm 144, market maker 36, churner 7, unclassified —
mixed 113, unclassified — too few 219; both anchors algorithm. The supervisor
now runs it on the 100 holdout accounts and scores it by the rules fixed
before any label existed (decisions 2026-11-07, the style labels' definitions
frozen).

2026-11-07 (R3 accepted, and the pre-test's rules amended — the owner, on the
supervisor's recommendations): **THE FOLLOWER IS PRICED AT THE MARK PLUS THE
MEASURED COST, AND A TRADER IS JUDGED OVER A FIXED HORIZON, NEVER BY THE
TRADER'S OWN EXITS.** R3's report (`docs/reviews/r3-paper-follow-2026-11-07.md`)
was Final-reviewed by a fresh subagent (R3-REVIEW: 12 corrections marked in
place, none high; R3's seeded simulations reproduced exactly; the statistics'
source checked on the paper's text) and checked by the supervisor (the exit
bias analytically; spreads live; the 1 s mark history complete on 2026-09-15
for BTC and NVDA). **Why the change:** a trader with no skill who takes profit
at +0.5% and stops at −2% wins about 80% of trades by arithmetic and nothing on
average; a sign vote on the trader's own exits would have crowned such a
trader in 79% of simulated runs — the leaderboard's own trap — and on this thin
market the next public trade after an alert comes 1.4 to 24 minutes late.
**The owner approved all seven proposals (R3 §7):** (1) **A5 is replaced:** the
follower's price at an instant is the 1 s mark × (1 + s × (the instrument's
mean quoted half-spread + its mean depth cost for $1,000)), from R3's
per-instrument table, on both legs, for the tracked entries and their nulls
alike (s = +1 when the follower buys); A5's first-trade price is printed as a
check, and the half-spread and depth doubled as a sensitivity. (2) **Pre-IPO
entries are left out of R8's primary cell** and reported in a secondary (no
rule priced ANT within ±20 bps). (3) **The vote:** each entry's d is the
follower's net return over a fixed horizon h minus the MEDIAN of its three
nulls' net returns over the same h (A9's mean stays for A11 (i) and (ii));
h is 1 h, 6 h or 24 h, the class nearest the trader's median holding time
over the 30 days before following (under 10 closed positions: 6 h); A11
(iii)'s sign test runs on these fixed-horizon d; the trader's own exits are
shown as paper money, never voted on. (4) **The scoreboard's statistics
(v1):** entries whose windows overlap are merged into one vote; per trader the
two-sided sign e-process E_n = 2ⁿ·k!(n−k)!/(n+1)!, a verdict only at
**E ≥ 20·K with K = 20 trader slots (E ≥ 400; e-Bonferroni, valid however
often the owner looks and under any dependence between traders)**; **the pooled
board of all favourites comes first,** one vote per UTC day, a verdict at
E ≥ 20; ties (|d| < 0.1 bps) dropped; late entries recorded, never voted. The
honest cost: a verdict on one trader needs months to about a year of
following even for a real edge; the pooled board answers sooner. (5) **A
2-hour weekday measurement in US hours, Monday 2026-11-09 14:30–16:30Z,** with
R3's scripts, before R8's numbers are frozen — the rule table is one Saturday
morning's, and spreads and the weekend premium moved by the hour. (6) **Paper
size $1,000 an entry, $10,000 stored beside it** (the live log stores the book,
so any size can be priced later). (7) **A matched-direction e-process**
(nulls drawn with the trader's own long share) **beside each vote,** to tell
skill from a long habit in a rising market. **The live log (v1):** the paper
entry is priced at the book's VWAP for $1,000 at the follow instant (the
alert + 60 s), with the book, bbo and ticker stored as read then. **Costs:**
the base-tier taker fee, 0.04% a leg (ANT 0.02% by its fee override); funding
every whole hour at the published rate.

2026-11-07 (the blind labels fixed — the supervisor): **R2-LABELS'S 100
LABELS ARE FINGERPRINTED BEFORE ANY CLASSIFIER OUTPUT EXISTS.** R2-LABELS
(Sonnet 5.5, xhigh; report `docs/reviews/r2-labels-2026-11-07.md`, `c63c39e`)
labelled the 100 holdout accounts for 2026-10-24 to 2026-11-07 from their raw
fills by the frozen definitions: none (no fill) 40 · unclassified — too few 20
· unclassified — mixed 3 · directional 14 · algorithm 17 · market maker 6 ·
churner 0. Checked by the supervisor: it never opened R2-STYLE's folders
(access scan 0 outside its own); the 40 "none" agree with the supervisor's own
count from the raw files on all 100 accounts (`verify/R2-STYLE/window-fills.cjs`).
`labels.csv` SHA-256 `617c53afb0aa64a25f549dd5b1cdef60a748f1eb3655880e9f479ac8a332b1d0`
and `labels-extras.csv` (the two anchors, outside the score) `dabbbfee…a055`,
2026-11-07 05:08Z; frozen copies in `verify/R2-STYLE/`. Its Final review may
correct a label only where the frozen definitions were misapplied, each change
logged; the supervisor then scores both versions and reports both.

2026-11-07 (the style labels' definitions frozen, and how the classifier is
scored — the supervisor, at R2-STYLE's second stop): **SIX LABELS, WORDS
ONLY, AND THE SCORING FIXED BEFORE ANY LABEL OR CLASSIFIER OUTPUT EXISTS.**
R2 wrote the definitions from non-holdout data only (the supervisor checked:
every analysis script goes through one guard that refuses holdout accounts;
none of the appendix's nine example accounts is in the holdout; R2's
transcript shows no hand access to the holdout folder). The file:
`workers/R2-STYLE/label-definitions.md` in the supervisor folder, copied
unchanged to `workers/R2-LABELS/label-definitions-v1.md`, SHA-256
`29df3f0c5fdec788bc36dc277f66a1b5b4734d201598138933cecc12c6d656a7`
(written 2026-11-07 04:50:35Z; its header's "05:05Z" is a slip). **The
labels:** directional (with a horizon: scalp, intraday, swing, position) ·
market maker · algorithm · churner · unclassified — too few · unclassified —
mixed; a window with no fill gets no label (the dormant flag). Hedger is not a
label (no case among the 547 heaviest non-holdout accounts; offsetting pairs
go to "mixed"); competition player, reward farmer, disqualified status and
linked accounts are flags beside the label, never the label. **The deciding
rule:** read decisions (order events, orders, action groups, position
cycles), never fills; a non-directional label wins when its signs are clear in
most decisions; **in doubt between directional and anything else →
unclassified — mixed, never directional** — the costly error is calling a
non-directional account directional. **The blind labels:** R2-LABELS (Sonnet
5.5, xhigh) labels each of the 100 holdout accounts for one window,
2026-10-24T00:00Z to 2026-11-07T00:00Z, from the raw fills alone (copied to
`F:\polymarket-follow-research\R2-LABELS\holdout\`, 100 files, SHA-256 of
their hash list `cbf25167…a713`), never seeing R2's work; the two anchors are
labelled as named extras, outside the score. **The scoring, fixed now:** the
unit is the holdout account in that window; accounts with no fill in it are
left out and counted. Labels collapse to D (directional, any horizon), N
(market maker, algorithm, churner) and U (either unclassified). **Primary —
the trap rate:** of the accounts R2-LABELS labels N, the share the frozen
classifier labels D, with its exact (Clopper–Pearson) 95% interval; both
anchors must be labelled N by the classifier. **Secondary:** of R2-LABELS's D,
the share the classifier labels N (traders lost); the classifier's D where
R2-LABELS says U (a risky D, counted apart); the classifier's U where
R2-LABELS says D or N (an abstention); the full six-way table; the horizon's
agreement on accounts both call D. The supervisor scores with its own script;
the owner rules on whether the result is good enough for v1.

2026-11-07 (R2's holdout fixed — the supervisor, at R2-STYLE's first stop):
**THE STYLE LABEL WILL BE SCORED ON 100 ACCOUNTS R2 NEVER ANALYSES, DRAWN BY
THE SUPERVISOR BEFORE ANY CLASSIFIER EXISTS.** R2 read the pool — 1,702
accounts: the all-time notional and PnL top 1,000 (overlapping on only 320)
and the PnL top 100 of day, week and month, 2026-11-07 00:48–00:51Z. The
supervisor drew the holdout from leaderboard fields only, with its own script
(`verify/R2-STYLE/draw-holdout.cjs` in the supervisor folder; seed 61107;
re-run identical): R2's six strata by all-time notional rank — N1 ranks 1–50
(10 drawn), N2 51–200 (15), N3 201–500 (20), N4 501–1,000 (20), and accounts
off the notional board split at their median notional, N5 upper (15) and N6
lower (20) — leaving out the 60 accounts R2 had already probed and the two
anchors (`0x4c4f…22b4`, the founding check's all-time PnL #1, and
`0x7930…d132`, notional #1), whose behaviour is already known and so cannot
be tested blind. `holdout.json`, drawn 2026-11-07T01:01:31Z, SHA-256
`c57b17d36b42f6827daf8f69b169cb315faae375ad88b1a2013fa6f224086345`. R2's pull
saves those accounts apart, its analysis scripts skip them, R2-LABELS labels
them blind from their raw fills, and the supervisor scores the frozen
classifier against those labels.

2026-11-07 (the owner's PC — the owner's answer to R4's question 2): **THE PC
IS ALWAYS ON AND THE OWNER ALWAYS SIGNED IN, SO THE POLLER AND THE NOTIFIER
START AT SIGN-IN.** The owner: "i don't turn off my pc and do not switch
logged user, all the time it is turned on. from time to time quick restarts
because of update (i do manually that)." So both processes are "at log on,
run only when the user is logged on" tasks (R4 Q3), which can show
notifications; no boot-started poller is needed. A manual restart leaves a gap
until the owner signs in again: the poller catches up on the fills it missed
and shows them as one late summary, never as fresh alerts, and paper-follow
prices them at the moment they could really be acted on (R4 Q8; R3 decides
the details). The machine's own facts (uptime 16.9 days, never sleeps on mains
power, measured 2026-11-06) agree.

2026-11-07 (wave 1 closed — the owner, on the supervisor's recommendations):
**R1, R4 AND R5 ARE ACCEPTED, AND THE PROJECT RUNS AT A QUARTER OF THE
PUBLISHED RATE LIMIT.** The reports (`docs/reviews/r1-perps-api-2026-11-07.md`,
`r4-notifications-2026-11-06.md`, `r5-existing-tools-2026-11-06.md`) were
verified on the supervisor's own path (R1's facts re-measured live 2026-11-07
00:10–00:11Z, `verify/R1-API/`) and Final-reviewed: 34 corrections, each
marked in place. The API facts are in external-apis. **(1) THE OPERATING
BUDGET — 250 WEIGHTED TOKENS A MINUTE, ALL CALLERS TOGETHER** (a quarter of
the published 1,000; Iron Rule 5's "about half" is the ceiling, this is the
setting). The owner: "we should try to stay under the radar, we don't need to
be in risky position, let's define some real number and start with it." Why
this number: R1 measured a token bucket refilling ~1,000 a minute with a burst
of only ~90–100 tokens, so the rule is about spacing as much as volume. **Every
client sends one request at a time, evenly spaced (a fills read, weight 10,
every 2.4 s at the full 250), never using more than 30 tokens in a burst**,
with an honest client name — small and steady, never disguised. Inside it:
50 a minute in reserve (leaderboard, tickers, retries); 200 for favourites.
What 200 buys (R1's formulas, Q14; average alert delay, the worst about
double): polling positions and reading fills on a change — 5 favourites
≈ 4 s, 20 ≈ 17 s, 50 ≈ 50 s; with the active fifth polled faster, 50
favourites ≈ 20 s for the active ones and ≈ 80 s for the quiet ones. For
research: R2 200, R3 50 (this supersedes the 500 of decisions 2026-11-06, the
research phase approved, which was for R1's measurements). Raising it is the
owner's call. **(2) THE TERMS OF USE** (polymarket.com/tos §4.2 bars crawlers
and scraping of "the Site, any other Interface, or Features" and sets no API
rules; the API is documented as public, with published limits): the project
continues — personal use, watch-only, no resale or sharing of the data, at the
budget above. Asking Polymarket for a confirmation is NOT needed for any
research step; it stays an option for the owner before v1 runs around the
clock (the supervisor's recommendation: not needed at this volume; revisit if
Polymarket publishes API terms or limits our address). **(3) R4's OWNER TEST
SHEET** (`workers/R4-NOTIFY/OWNER-TEST-SHEET.md` in the supervisor folder)
runs later, when the notifier is built, with the supervisor guiding it step by
step; nothing for the owner now. **(4) DEFAULTS FOR THE V1 PLAN, approved
together:** 20% of the budget in reserve; the owner's browser on
polymarket.com/perps shares the bucket — no rule, the poller backs off on a
429; positions polling (weight 5) with a fills read on a change only for
accounts labelled directional and slow, fills polling (10) for the rest (the
style label decides: a scalper's quick open-and-close was missed up to 6.8% of
the time); the exact deposits-and-withdrawals column (`/v2/info/pnl`) only
where it exists, "flows unknown" elsewhere; the unpublished pnl/equity routes
charged 15 tokens, calibrated only if v1 reads them often; Windows' own Do Not
Disturb for quiet hours; open, close, flip and liquidation alerted at once,
adds and reduces grouped for up to 20 s; Windows PowerShell 5.1 as the toast
helper, an own app name by one per-user registry key once the sheet proves it,
no tray icon; two processes at sign-in (poller and notifier, the notifier
also announcing "poller down" and "data stale"); phone alerts (ntfy and a
dead-man's switch) after Windows alerts work; ROI only beside its capital
base, with a display floor above $100; no composite "copy score";
"unclassified" a visible label that warns on favouriting like an algorithm;
competition membership stored and labels on rolling windows; schemas tolerant
of new fields with a daily log of unknown keys, closed lists only where an
unknown value would do harm, and a weekly read of the changelog; no paid data
in v1; a manual "same person" note for linked addresses goes to the backlog.
**What the owner will do with it:** use the information for the owner's own
trading decisions, on Polymarket or elsewhere. The app stays watch-only and
never advises (Iron Rules 1 and 6); R8 and the forward paper-follow log are
how it shows, honestly, whether following the dominant traders pays.

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
