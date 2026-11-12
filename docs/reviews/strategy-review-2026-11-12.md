# STRATEGY-REVIEW — fresh eyes on the whole project, on the owner's side

STRATEGY-REVIEW (Fable 5.2, max), 2026-11-12 20:54Z – 21:38Z (UTC; every
stamp from `date -u`), for polymarket-follow's supervisor: a cold read of the
whole record — six of the project's docs (the decisions log in full), the
experiment's frozen `rules.md` and the reports listed in section 9 — to find
what is valuable, what was missed and what to try next. Evidence: the
supervisor folder `workers/STRATEGY-REVIEW/` (`progress.md`; `explore/`, the
scripts and saved outputs of eleven explorations). **A review decides
nothing.**

**The blind store held.** Nothing stamped at or after 2026-11-07T00:00:00Z was
read. The collector's recordings, its database and the run folder were never
opened; of `F:\polymarket-follow\paper\` only `seed\` was read (I listed that
folder's top-level names once; `fills`, `raw`, `state.json` and `checks` stayed
closed). In `F:\polymarket-follow-research\` I read the kit's panel and derived
labels, R8's stored look and captured tape, FIND-4's look records, and nothing
of `R3-PAPER`,
`R3-WEEKDAY`, R8's `probe`, R2's light files, `pool\` or any `holdout\` folder.
(The kit's labels-at-the-cut file lists all 1,702 pool accounts; I used the
labels of the seed's 1,602.) No call to Polymarket's API. Web: three searches
and one abstract, generic words only. No agent started; polymarket-lab not
touched; nothing in the repository changed but this file.

**Explorations on the old weeks: eleven (X1–X11), each written in `progress.md`
with its reason before it ran, all labelled exploring.** They describe weeks
already studied, through hundreds of printed cells; they decide nothing.
Section 7 lists them with every print that was not in the plan written first.

## For the owner, in one page

*Words.* A **bp** is 0.01%. A **taker** trades at once and pays the fee and the
gap between buying and selling prices (here about 9 to 14 bps in and out). A
**copy** is the paper position a follower would have opened after a trader's
new position. **Small coins** are every crypto market but BTC and ETH (R2's
definition; SOL counts as one). **Exploring** means measured on weeks we have
already studied: it describes, it never decides. "± x" is one standard error.

**What you have, and what is valuable in it**

1. **A record that cannot be bought or read back.** Since 2026-11-10 every
   market's order book each second and every trade, and the boards each
   night, on an exchange two months old for which R5 found no public tracker
   (2026-11-06). It is your most valuable asset — and it has no second copy
   (architecture: "The stream files have no second copy").
2. **A method that does not fool itself.** Rules before results, weeks kept
   unseen, a random-trade yardstick, a fresh reviewer each time. In six days it
   turned ten tempting ideas into ten honest answers. It works on any idea,
   your own trading included.
3. **Facts that save money.** The boards' tops are algorithms, market makers
   and quiet accounts (R2). Copying the best traders lost about what a round
   trip costs, however it was cut: any speed, any ranking, your filter, held a
   day or with their exits (R8, FIND-1 to FIND-6-EXITS). A trader's profit is
   not a follower's profit (#47: $109,386 for itself, a loss for its follower).
4. **A frozen forward test** that will answer the copying question by May
   whatever anyone hopes.

**The most important things we missed**

1. **Our own yardstick beat our stars, and nobody asked why.** Random public
   trades, followed in their own direction, lost about 3 bps a trade; the top
   50 traders lost 16.6 (R8; RESEARCH-KIT §7.3). I looked (exploring): overall
   the gap is small and unsure (+7 ± 6 bps). It sits in **small coins** (the
   price moved the takers' way by +36 ± 9 bps over the next day, in each of
   seven weeks, though mostly where trading was heaviest) and it comes from
   **takers we cannot name** — not from the boards' accounts, whose own taking
   was followed by a move against them (−11 ± 6).
2. **In small coins, forced and hurried trading overshoots** (exploring). After
   a liquidation the price moved back, against the forced side, by 148 ± 36
   bps over the next day — in nine of ten weeks, after forced sells and forced
   buys alike, whichever market or account is left out, and still by 123 ± 34
   measured from an hour later. After the very largest jumps it moved back by
   71 ± 24. Liquidations were listed as a study twice and never measured. In
   BTC, ETH, gold, oil, indices and stocks none of my explorations showed
   anything; FIND-4's near miss ("after a jump" entries 51 bps worse) sits
   mostly in those large markets and stays unexplained.
3. **The traders we studied lose as a group, on their own trading** — in
   FIND-6's follow weeks 0.5% to 1.0% of every dollar they traded; R8's other
   49 went from +$72,738 to −$17,266. They leaned long while the market fell,
   entered against the last hour's move, left most positions within the hour,
   and the few they kept were deep losers (20 copies still open at the cut
   averaged −575 bps). "Whom to copy" had little to find.
4. **One weak thread has no line in the running experiment.** Traders ranked
   by their past *follower* result stayed ahead in three prints (FIND-1: 9 of
   20 stayed in the top fifth where chance gives 4; FIND-6's rule 4: +21 ± 22
   bps a copy against −21 ± 11). Each is within chance. Your favourites line
   tests your filter, which did worst there (−53 ± 26).
5. **Three practical gaps.** The experiment prices its copies with a cost table
   from two November mornings although real books are on disk since 11-10
   (`rules.md` R9). Finotive's terms forbid copying third-party trades
   (PAPER-PLAN §4): a "keep" could not be used there as copying. And where you
   act, on which markets and at what cost has been open since 11-10; it now
   decides which research is worth doing, because the hints are in small coins.
6. **#47 made no trade in the last ten days before the cut** (its last fill:
   2026-10-27; exploring, counts only). It is one of the eight favourites
   marked beforehand.

**The best new ideas** (in full in section 3; each with its honest test)

1. **A second paper experiment, on the market itself ("MARKET-1").** Three
   lines in small coins, priced at the recorded book: the other side after a
   liquidation; the other side after a very large jump; a fixed sample of
   public taker trades followed for a day. Rules frozen before anyone opens
   the recordings; the same three look dates. Costs no API tokens.
2. **Cheap additions beside the running experiment,** fixed before its first
   look: every copy priced again at the recorded book; the "past follower
   result" list (point 4 above); and for every line the opposite position's
   result.
3. **Name the flow.** Fills are public by address, so the accounts whose
   taking the price follows can be found — among all accounts, not the boards'
   tops — and tested for whether they stay so.
4. **Your own calls, judged by the same yardstick** from v1's first day: one
   click records what you would do; the tool tells you, honestly and only after
   enough of them, whether your entries beat random ones.
5. **A Markets page:** funding, open interest, how many accounts are long and
   short, the real cost of trading by hour, jumps and liquidations as they
   happen — all from what the collector already records.

**What v1 should be** (section 4). A watching tool for **markets and
traders**, in that order of building: Status and a Markets page first (no new
API reads), then Watch and Alerts for favourites at a slow poll (speed bought
nothing in any test), the experiment's page as the paper log, a Method page
with every dated finding, and your own calls. Leave out for now: verdicts on
single traders (they need months to years), background labelling of whole
boards, comparison charts, AI descriptions, phone alerts.

**Your three next steps**

1. **Two things only you can do, this week:** tell the supervisor where you
   act — venue, markets, what a round trip costs you, what its rules allow —
   and put a second copy of the recordings on another disk or in the cloud.
2. **Have MARKET-1 planned, reviewed and frozen before anyone looks at the
   recordings,** with the cheap additions to the running experiment in the
   same plan.
3. **Have v1 planned around what exists,** the Markets page first.

*This is research and a plan for research. It is not advice on what to trade.*

---

## 1. What we have that is valuable (question 1)

| What | Why it is valuable (source) | What it can become |
|---|---|---|
| **The recordings**: top-20 books of every market at most once a second, every trade, tickers each minute, 16 boards a night, the rule book (architecture, "The collector") | Books and tickers cannot be read back (external-apis: "a past instant cannot be asked"); R5 found no tracker for this exchange on 2026-11-06 | Real costs by market and hour in place of two mornings' table; tests on the market itself with tens of thousands of observations where trader tests have hundreds (X4: 31,221 jump windows in 68 days, error 6.7 bps at 24 h; FIND-3: 951 entries in 64 days, error 11.6–15.1); a fill model for limit orders; v1's Markets page |
| **The pool's fills with trade ids** (the kit: 1,702 accounts, 1,272,487 fills; the experiment's seed: 1,602 accounts) | Both sides of a trade share its id (external-apis), so a public tape trade can be given its account | "Who is on the tape" (X3 named 19.5% of captured trades, 45.7% of their notional); flow by kind of account; the liquidation record (X5) |
| **The kit and the rule book** (RESEARCH-KIT; IDEAS-REVIEW A.0) | One tested yardstick, proven on R8 to the digit; one error budget; rules before looks | The judge of any signal — a market line, an alert type, the owner's own calls |
| **The paper experiment's engine**: gate, reader, scorer, looks, page (`rules.md`; architecture) | Frozen by hash, reviewed three times, resumable, inside the budget | Later arms at little cost; v1's paper log |
| **The style label** (R2; v2 waits for D1) | Trap rate 2 of 23 blind; the boards' tops are 67 non-directional and 26 idle of 100 (R2 Q7) | The Boards page's reason to exist; the filter of alerts |
| **The "no" results** (R8; FIND-1, 2, 3, 4, 5, 7, 9, 10; FIND-6; FIND-6-EXITS) | Each closes a road with its size: copies lose 13–17 bps; the delay is not the cause (R8: 15 s −16.48, 30 min −14.92; FIND-6-EXITS: no delay −16.6 against −15.8); at 1 h a taker needs more than 55 right calls in 100 in 82 of 84 markets (the kit's map) | The Method page's dated findings; the reason to stop paying, in budget and attention, for speed and for rankings |
| **Facts about the exchange** (DOCS-SWEEP; external-apis) | The reward budget is 3.08 times a week's gross fees; longs pay a floor of 10.95% a year on crypto; the mark is built from the index and the local book | "Regime events" to watch (a change of rewards changes spreads, so every cost and result); the reading of any long-held position |

## 2. What we missed (question 2)

Each with its source. "Exploring" marks my own measurements (section 7).

**M1. The yardstick's own direction was treated as a nuisance, never as a
question.** R8's random trades in their own taker direction netted −3.0 bps
against a cost of 11.2 (RESEARCH-KIT §7.3: "random takers' own direction
carried about +8 bps over the next hours"); at UTC 12–16 they did 15.78 to
24.15 bps better than the same trades on a coin (FIND-5-10 §3.1); the kit lists
"The buyer/seller split of each minute's trades" under what stays unknown (§6).
Exploring:
- X1, R8's own rows: own direction minus the coin **+7.25 ± 6.13** bps by day
  (26 of 42 days above zero); at 1 h +1.14 ± 3.06; from 2026-10-17 on +0.68 ±
  10.94. The "+8" is about one error from zero: a hint, not a fact.
- X2, 117,685 captured trades: the tape is balanced (49.4% buys), so its side's
  result is timing, not a lean: +3.13 ± 1.67 (1 h), +8.38 ± 5.07 (24 h). **It
  sits in small coins:** +9.26 ± 3.72 (1 h), **+36.28 ± 9.09** (24 h); BTC and
  ETH +0.75 ± 2.08 and −2.55 ± 2.85; the hour's net imbalance in whole (so
  quieter) hours shows nothing (24 h −1.36 ± 13.48).
- X3, the takers named through the seed: **pool takers −11.40 ± 6.11 at 24 h**
  (accounts labelled algorithm −16.06 ± 7.21; #47 alone −46.42 ± 30.54);
  **takers not in the pool +12.82 ± 6.20, in small coins +51.07 ± 12.21.**
  "Not in the pool" mixes accounts on no board, the 100 holdout accounts and
  the older trades of the busiest accounts (X7: in the last week, where their
  captures reach, the named share doubles).
- X4, prices alone: no momentum (the last hour's move as the sign: −0.4 ± 0.8,
  +0.4 ± 3.8). So the takers' side says something the price path does not.
- X9, how sturdy: in small coins every one of the seven weeks is above zero
  (+82.4 … +13.2), both halves (+34.0 ± 11.5, +40.0 ± 14.1), and no single
  market carries it (+27.4 to +39.7 when each is left out). But for the
  takers not in the pool, with each market-day counted once, it is +19.4 ±
  10.1 (against +51.1 with each trade counted), and +6.7 ± 8.3 without its
  three best days: the result lives where trading is heaviest.

**M2. Two readings of one number were never set side by side.** R8 §4 reads
the matched null's gap as "beta worked *against* the set"; RESEARCH-KIT §7.3
reads it as the takers' direction earning 8 bps. X2: both hold. The market fell
in those hours (the mark moved −6.6 bps in the next hour and −67.9 in the next
day after a captured trade) and the traders leaned long: that is R8's reading.
The tape did not lean (49.4%) and still came out ahead in small coins: that is
the kit's.

**M3. The directional traders lose as a group, and that was never stated as a
finding.** FIND-6, "More facts": the candidates "banked a loss on their own
trading in these weeks, in every group, top and rest (after their own fees,
−0.5% to −1.0% of the dollars they traded …)" — marked untested and left. With
it: R8 §1.4 (the other 49: $72,738 before, −$17,266 after), FIND-REVIEW-C
(−$14,511; 18 above zero, 28 below), R2 Q8 (median profit per volume below
zero in four of six kinds of market, on accounts chosen from boards). How they
lose is in four separate reports: a long lean in a falling market (M2); entries
against the last hour's move (FIND-5: −11.79 bps by day, p 0.026, though −1.98
by trader, p 0.88; FIND-9: −9 bps before agreement, weak); positions left
within the hour (FIND-6-EXITS: median hold 47 minutes); the few kept open deep
in loss (its 20 open copies: −575 bps). For v1 this is a base rate to show
with every trader; for research it says the gain, if any, is on the other
side of such trades or in the market's own habits.

**M4. Liquidations and the largest jumps were never measured; in small coins
the price came back after both.** IDEAS-REVIEW's study 18 and APPROACH-REVIEW
B5 name liquidations; neither ran. Exploring:
- X5, X9: after a pool account's liquidation in a small coin the mark's move,
  signed by the forced side, was **−24.5 ± 8.4** bps in an hour and **−147.6 ±
  36.4** in a day — minus means the price came back (431 market-minutes, 66
  days, 153 accounts). Halves −119.6 ±
  53.5 and −173.8 ± 49.3; nine of ten weeks below zero; without 2026-11-04 and
  11-05 −134.4 ± 35.6; forced sells −150.3 ± 52.4, forced buys −142.9 ± 67.3;
  29 of 36 markets below zero; −164.5 to −139.9 when each market is left out,
  −158.0 to −140.0 when each account is. The sturdiest print of this review.
  In BTC and ETH −11.8 ± 25.4; stocks, commodities and indices nothing clear.
- X11, the same events: entered an hour later **−122.5 ± 34.2**, six hours
  later −76.5 ± 36.7; over three days −275.9 ± 89.8; with a jump above five
  times the usual in the same or the previous quarter-hour −207.0 ± 64.9 (160
  events), without one above three −80.3 ± 48.9 (182); the smallest third by
  size (up to $139) −213.5 ± 53.1, the largest −142.0 ± 52.4. Size does not
  matter: a liquidation marks the moment, it does not make the move.
- X4, X9: after 15-minute moves above five times the usual, **−22.1 ± 9.8**
  over a day in all markets and **−70.9 ± 23.6** in small coins (halves −48.2
  ± 34.6 and −97.5 ± 30.0; eight of ten weeks below zero; "five" was not
  written down before the run). At three times the usual: nothing (−5.3 ±
  6.7).
- **FIND-4's near miss is a different thing.** Its entries after a jump (−33.2
  bps against +14.1; deciding p 0.0082 against a line of 0.0045) are mostly
  in BTC and ETH (541 of 1,134) and stocks (236), where prices show no such
  move back; half go with the jump (−51.7 ± 26.1) and half against it (−14.1
  ± 17.6) (X10). It stays unexplained, as FIND-REVIEW-A left it. Beside it in
  FIND-4's tables, never followed up: additions to a winning position −23.3
  against +28.4 for additions to a losing one (by trader p 0.0069; the
  deciding test 0.45); entries against the trader's usual side +35.3 against
  +2.3.

**M5. A weak thread at the top, with no forward line.** FIND-1's side
observation (9 of 20 in the top fifth of both halves, chance about 4), its
fifths (+0.123 and +0.111 of a usual day's move; their own net at a taker's
cost +38.6 and +20.4 bps), the launch-week line (ρ 0.225, p 0.096), and
FIND-6's rule 4 — entry 1's measure as a ranking — the only top fifth above
zero (+21 ± 22 held a day; −17.6 ± 12.5 with exits copied). All within chance,
all the same measure. The experiment follows rule 7 (arm F), not rule 4.

**M6. Where B2's weak persistence sits was never measured.** R8 §1.3:
Spearman 0.204 (p 0.011) while the top fifth did worse than the rest (−102.6
bps) — "not at the top"; its Final review (F8) notes that where it lies was
not measured. IDEAS-REVIEW §3 asked D2 to print the five-by-five table. D2
runs after 2026-11-30: the table belongs in its plan.

**M7. The experiment's costs are modelled, not measured.** `rules.md` R9
prices spread and depth from R8's table (two mornings, 2026-11-07 and 11-09);
its rule R7 leaves "MAKER and VWAP" out of the freeze; R14 defers every per-copy
covariate (funding, long and short counts, the agreement flag) although
APPROACH-REVIEW C2 asked for them with every copy. Nothing is lost — the books
and tickers are on disk from 2026-11-10 20:59:54Z — but until a later arm
joins them, Iron Rule 4's "the price a follower could have had" rests on a
table.

**M8. Finotive's rule changes what a "keep" can be used for.** PAPER-PLAN §4:
"Copying trades from third-party accounts … signal providers … is prohibited"
(help article 955; §7.10). The plan drew one consequence (no Finotive result
line). The larger one: on that venue the tool's value can only be context for
the owner's own decisions. The owner reads that rule; this is not legal advice.

**M9. The venue question is still parked.** The plan page's backlog: "The
owner's own execution venue and costs … Trigger: the owner's word"
(2026-11-10). Every table uses Polymarket's taker costs. With hints only in
small coins (M1, M4) and nothing in the large markets, it now decides the
primary cells of any new test.

**M10. Speed was bought in the design and found worthless in the research.**
R8: reacting in 15 s, 5 min or 30 min lost −16.48, −17.98, −14.92;
FIND-6-EXITS: no delay at all −16.6 against −15.8; X1: the takers' gap is the
same at 15 s and at 30 min (+7.06, +7.20). IDEAS-REVIEW said "breadth over
speed … the budget that watches 20 accounts fast could watch 300 at ten
minutes". R7-PAGES still spends 200 of 250 tokens a minute on polling
favourites every 8 to 100 seconds (its Watch page; decisions 2026-11-07).

**M11. R7-PAGES's eight pages show traders only.** Its §5: "What `long_count` /
`short_count` on tickers count (no page uses them)". Nothing of the market's
own state — funding, open interest, costs by hour, jumps, liquidations — has a
page, though the collector records all of it.

**M12. Studies listed and never run or scheduled.** IDEAS-REVIEW's studies 11
(holdings), 12 (who copies whom), 16 (positioning), 17 (market makers'
inventory), 18 (liquidations), 19 (off-hours and the open); its schedule's row
for mid-January 2027, "The first FIND on the collector's own series", is not
on the plan page, whose backlog holds only "A later batch, on new weeks".

**M13. Odd accounts.** #47's last fill before the cut is 2026-10-27T18:38Z
(X8); it carried 21.5% of all the captured notional, about half of the small
coins', while the price moved against its taking (X3) — its money is made in
the first two minutes (FIND-2), from whom was never asked. One of the eight
(0x7b3675c9…) has a
seed cut at 5,000 fills, 3,128 of them in one week. FIND-2's five accounts
with 86% of the long-hold profit, two of them short for weeks: X6 finds that
small coins which some pool accounts were short fell more over the next three
days (+103.8 ± 41.1 bps between the most-long and least-long thirds) —
exploring, one falling stretch.

**M14. The incentives are a regime, and nothing watches for its end.**
DOCS-SWEEP Q4: $75,000 a day of liquidity rewards "split evenly over active
markets", 3.08 times the week's gross fees; R2 Q2: the five largest makers
lost $10.5k–$13.8k each on their fills in 9 to 14 days. The thin markets are
the most subsidised, so their spreads — and every cost in every table — hold
only while the programme does. IDEAS-REVIEW §5.2 asked for "regime events"; no
alarm exists.

**M15. A small contradiction.** PAPER-PLAN §4 found "no stock or index perp"
on Binance; its review's index row says "Binance lists stock perps". The venue
lines are outside the frozen rules, so nothing depends on it yet.

## 3. New ideas, ranked by promise and by the cost to test (question 3)

| # | Idea | Promise | Cost to test | Data |
|---|---|---|---|---|
| 1 | MARKET-1: three lines on the market itself | the only hints larger than a round trip | low: no tokens, a plan and a build like PAPER's, smaller | the recordings (new weeks), the experiment's fills |
| 2 | Beside the running experiment: the book's price, rule 4's list, the mirror | honesty and one open thread | very low | already read |
| 3 | Name the flow | could turn "whom to watch" around | medium: about 150,000 tokens of fills | old weeks to find, new weeks to confirm |
| 4 | The owner's own calls | certain value to the owner | low | forward only |
| 5 | The Markets page with measured base rates | certain value | low | the recordings |
| 6 | Positioning, funding and the boards | unknown; nothing stable in 68 days | waits for months of records | the recordings |
| 7 | Where the top's money comes from (#47, the rewards) | explains, does not earn | low | old weeks |
| 8 | Prediction-market traders | fits the outside evidence better | high: a new venue | parked |

### 3.1 MARKET-1 — a forward paper experiment on the market itself

- **Why it might work.** The exchange is young and thin, its makers are paid to
  quote (M14), its directional crowd loses on its own trading (M3). Public work
  finds that order imbalance at quarter-hour openings "predicts returns over
  four to twelve hours" on six Binance perpetual contracts (Kim and Hansen,
  arXiv 2607.09426, abstract only). I found no rigorous public study of a
  reversal after liquidations (search summaries only).
- **What our results say.** M1 and M4, all exploring, all in small coins;
  nothing in BTC, ETH, commodities, indices or stocks; FIND-7's "no" stands
  (joining an algorithm's run: +1.31 / −1.74 bps against random trades at 30
  minutes) and X3 agrees (algorithms' taking −16 ± 7 at 24 h).
- **Three lines, each a $1,000 paper position priced at the recorded book**
  (its own spread and depth, base-tier fees, funding), held 24 hours, in the
  order of how sturdy their hints are (X9):
  - **LIQ:** after a liquidation fill of a pool account (the experiment reads
    them), the other side 2 minutes later. Beside it, what a tool could have
    seen in time: only an account it polls shows a liquidation live; entered
    an hour late the exploring figure is still −122.5 ± 34.2, six hours late
    −76.5 ± 36.7 (X11). The plan may make "a liquidation with a jump" its
    first cell (−207.0 ± 64.9, 160 events).
  - **JUMP:** after a 15-minute move above five times the market's usual (J,
    `rules.md` R13), the other side 2 minutes later. Anyone can see a jump.
  - **TAPE:** a fixed sample of public taker trades (a rule on the trade id,
    so nobody chooses), entered in the trade's direction 80 s later. Its hint
    lives in heavy trading; a line that counts each market-day once is
    printed beside.
- **Primary cells:** small coins. BTC, ETH, gold, oil and the indices printed
  apart — or made primary if the owner's answer (question 1 of section 8)
  says small coins are out, in which case expect "too few to tell".
- **Data.** The recordings from 2026-11-10 20:59:54Z: new weeks nobody has
  read. No API tokens beyond what the experiment already spends.
- **The honest test.** PAPER's road again: a plan, a fresh review, rules and
  code frozen by hash before anyone reads a price or a trade from the
  recordings; one error budget of 5% over the three lines and three looks
  (2026-12-19, 2027-02-06, 2027-05-08); the mean net per position with errors
  clustered by day and by market; keep, drop or too few, as verdicts on the
  test.
- **What it could see** [arithmetic from X2, X4 and X5's errors, a guide only]:
  TAPE about 34 / 20 / 13 bps at the three looks; JUMP about 115 / 70 / 45;
  LIQ about 175 / 105 / 65. The exploring sizes were +36 gross, −71 and −148,
  against a round trip of 12.8–13.6 bps in small coins (APPROACH-REVIEW C3).
- **What could fool us.** One falling stretch produced every hint; jumps and
  liquidations bunch on a few days (2026-11-04 and 11-05 hold 231 of 1,520
  liquidation minutes), so the test must count days, not events; the mark is
  not a price in a thin book — hence the recorded book; the "other side" lines
  have a long losing tail, so the worst day and the largest fall are printed
  from the first day.

### 3.2 Beside the running experiment (also question 5)

- **BOOK:** every copy priced again at the recorded book's VWAP for $1,000 at
  its entry and exits (the plan's unbuilt "VWAP"); and the measured cost by
  market and hour beside R8's table.
- **RULE 4:** the top fifth by past follower result at the cut — FIND-6's
  frozen code on [2026-10-10, 2026-11-07), exactly as PAPER-FAV did for rule
  7 — computed by a worker who has not seen the page, its hash recorded,
  printed at each look as a subset of BROAD with the 24 h reading; and
  FIND-1's own statistic (the share of a top fifth that stays) on the new
  weeks. Deciding nothing.
- **MIRROR:** for MAIN, BROAD, FAV and the JUMP split, the opposite position's
  net (minus the gross, minus the same costs): arithmetic on the position
  log. If copies lose more than two round trips, the other side would have
  paid; the look should say so in a number rather than leave it to be guessed.
- **How to keep it honest:** each is written into decisions with its rule and
  hash before the first look; none carries a verdict word.

### 3.3 Name the flow

- **Why.** On an exchange with public wallets, a wallet's informativeness kept
  its rank between ten-day windows (Zhai, arXiv 2608.04373, abstract, via R5
  and APPROACH-REVIEW) — at one second. Ours at hours is unknown.
- **What our results say.** FIND-1: the boards' directional accounts' entries
  do not persist (ρ 0.066). X3: the pool's taking is not followed; the flow
  that is followed is outside the named set.
- **Data.** Old weeks: addresses from the competition table and the boards
  sorted by volume or account value (the only fields the blind-store rule
  allows) and their fills before the cut — about 150,000 tokens for 5,000
  accounts at three pages each [arithmetic], two to three days of the spare 80
  a minute. Completing the 120 truncated captures costs far more (R1: about
  82,000 tokens for one busy maker); only their small-coin weeks are needed.
- **The honest test.** FIND on R8's six weeks: each account's taker trades in
  small coins scored at 24 h against the matched null; does the score in odd
  weeks predict even weeks (FIND-1's design, with its power computed first)?
  If yes, the list is frozen and judged on the collector's tape and those
  accounts' new fills. If no, "which account" is closed for taking as well.

### 3.4 The owner's own calls

- **Why.** The yardstick that judged 1,600 strangers has never been turned on
  the one trader whose results matter. Decisions 2026-11-10 (4) already plan
  "the owner's own 'would have taken it' mark" as a profile.
- **How.** One click: market, side, intended hold. The tool prices it at the
  recorded book a minute later and scores it against random trades in the
  same market and hour (R3's vote), "no verdict yet" until the bar.
- **The honest test.** Forward only, every call recorded, the rules fixed at
  the first one. It is a record of decisions, not advice.

### 3.5 The Markets page, with measured base rates

- For each market on the owner's list: the mark against the index; funding
  now and as a yearly rate; open interest and its change; accounts long and
  short and their change; the cost of $1,000 and $10,000 now and by hour of
  day; the jump ratio J; liquidations among the accounts the tool reads; the
  hour's net taker flow.
- Beside a figure, its measured base rate with its count, error and dates —
  for example "after J > 5 in small coins, Sep–Nov 2026: −71 ± 24 bps over the
  next day, 2,039 cases, exploring" — and "nothing measurable" where that is
  the truth (BTC and ETH after J > 3: +3.5 ± 3.5, −0.6 ± 6.6, −3.3 ± 8.4).
- **Hours:** no hour effect holds. R8's US-open cell went with the exact
  yardstick (FIND-10), its UTC 00–04 cell changed sign, and X1's 12–16 block
  (+15.39 ± 9.25) is one of six. The hour fact worth having is the measured
  cost by hour, which the recorded books give.
- **Test:** none needed to show data; a figure moves from "exploring" to
  "tested" only through MARKET-1 or a later register entry.

### 3.6 Positioning, funding and the boards — later, on months of records

- X6 (exploring): the pool's net side says nothing (24 h −0.1 ± 21.4, 72 h
  +1.9 ± 34.3); the one clear print is the small-coin shorts of M13; BTC and
  ETH read both ways. Sixty-eight days of one market cannot carry this.
- **The boards as data,** once the nightly copies hold a month or two: how
  fast a board's top turns over (the plan page's backlog); accounts that
  appear large and new (IDEAS-REVIEW's study 15, forward only by its nature);
  and the boards sorted by volume and account value as the address list for
  3.3. None is a signal today; each is a register entry when its data exists.
- **Test:** a register entry once the collector holds eight or more weeks of
  minute tickers: the day's change in the long share of accounts against the
  next day's move, across markets; extreme funding (entry 8, parked by
  RESEARCH-KIT at "about 120 bps visible"). Rules first, then new weeks.

### 3.7 Where the top's money comes from — 3.8 Prediction markets

- **3.7:** #47's counterparties by trade id, its profit by market against that
  market's volume, the makers' fills beside: does the fast money come out of
  quotes paid for by rewards? It would explain the board's top and guard
  against chasing it. Old weeks, no tokens; a description, low priority.
- **3.8:** stays parked as the plan page has it; APPROACH-REVIEW B6 gives the
  reason it fits the outside evidence better (slow information).

## 4. v1: what it should contain, and what to leave out (question 4)

**Contain, in this order of building:**

1. **Status** — as R7 designed it; the collector's heartbeat already feeds it.
2. **Markets** (new; 3.5) — built on the recordings and the database, no new
   API read. Useful on the first day with no favourite chosen.
3. **Watch and Alerts** — R7's, with one change: poll slowly. An alert a
   minute or two late lost nothing in any test (M10). The tokens saved go to
   breadth: more accounts read, liquidations seen, the flow named.
4. **Trader** — R7's basics, plus three things beside every account: the
   group's own record ("the pool's directional candidates lost on their own
   trading in October–November", M3), banked against open money (the
   underwater flag), and "last fill" in large type (R8's best and third-best
   made no entry after T0; #47 is quiet since 10-27).
5. **Paper log** — the frozen experiment's page as it is, linked; MARKET-1's
   beside it. No new scoring code in v1.
6. **Method** — every dated finding, the "no"s first, and the regime line: the
   reward budget, the fee schedule, competitions, with the date each last
   changed (M14).
7. **My calls** (3.4) — one form and one table.

**Leave out of v1:** verdicts on single traders (R3: months to a year each;
the experiment's lines are the unit that can answer); background labelling of
whole boards (tokens for a page that the research says cannot pick traders);
comparison charts (V4) and AI descriptions (V6); phone alerts; anything
called a score. Boards can follow as stored snapshots with labels where the
tool has looked.

## 5. The experiment now running (question 5)

Its frozen rules stay as they are. Beside it, each as a later arm or a print
fixed in decisions before 2026-12-19:

1. **BOOK, RULE 4 and MIRROR** (3.2).
2. **STATE:** each copy joined by time to the collector's records — funding,
   open interest, long and short counts from the minute's ticker; the book's
   spread and imbalance at the follow instant; the hour's net taker flow; "a
   pool liquidation in this market in the last hour"; and, from the log
   itself, the copy's side by kind of market (X6's small-coin shorts). The
   splits to be printed are named before a look (F16 (e)'s deferred
   covariates).
3. **MARKET-1** as its own experiment on the same look dates (3.1).
4. **D2 with its five-by-five table** (M6), deciding nothing.
5. **A note for the first look:** arm F counts from 2026-11-12T20:19:43Z; one
   of its eight marked accounts was silent for the last ten days before the
   cut (X8). If it stays silent, the eight are seven.

## 6. The three next steps, in order (question 6)

1. **The owner, this week.** (a) Where you act: the venue, the markets, a
   round trip's cost, what the venue's rules allow. Twenty minutes with the
   supervisor; recorded in decisions. It sets MARKET-1's primary cells and
   v1's market list. (b) A second copy of `F:\polymarket-follow\recordings\`
   on another disk or in the cloud, then weekly. Every idea above rests on
   those files.
2. **A plan subagent for MARKET-1 and the additions of 3.2,** then a fresh
   review, the owner's approval, the build and the freeze — before anyone
   opens the recordings. The rule-4 list is computed first, by a worker who
   has not seen the experiment's page, because the page shows more every day.
3. **The v1 plan** with section 4's order, the Markets page first.

## 7. The explorations, counted

Eleven, all on data before the cut, all exploring. Scripts and outputs:
`workers/STRATEGY-REVIEW/explore/`. Errors are CR1 by UTC day; they understate
when 24- and 72-hour windows of neighbouring days overlap and markets move
together. Gross bps unless said.

| # | What and why (written first) | Result | Printed outside the written plan |
|---|---|---|---|
| X1 | R8's stored look (1,262 openings and flips with three drawn trades; R8's cell is 1,249): the drawn trades in their own direction against the coin — is "+8 bps" real? | own net −2.90 ± 3.14; coin net −10.15 ± 6.16; **own − coin +7.25 ± 6.13**; day means +13.29 ± 6.79; 1 h +1.14 ± 3.06, 6 h +14.06 ± 15.72, 24 h +14.21 ± 28.67; crypto majors +12.69 ± 6.92, small coins +16.69 ± 11.86, equities −3.05 ± 22.54, indices −8.27 ± 16.12; UTC 12–16 +15.39 ± 9.25 | the two halves (+12.26 ± 6.59; +0.68 ± 10.94); the delays (+7.06 to +8.38); crypto by weekday; widened hours |
| X2 | R8's captured tape (117,685 trades, 75 markets, 42 days) on the kit's panel: the mark's move from t + 80 s signed by the taker's side; lean against timing; by size; the hour's imbalance | all: +3.13 ± 1.67, +4.67 ± 2.86, +8.38 ± 5.07 (1, 6, 24 h); long share 0.494; **small coins timing +9.26 ± 3.72, +10.76 ± 9.06, +36.28 ± 9.09**; each hour alike +5.20 ± 2.34, +8.92 ± 5.92, +15.20 ± 5.27; BTC and ETH +0.75, +0.93, −2.55; middle size third (median $389) +6.99 ± 2.38 and +20.48 ± 8.20, largest ($1,819) +2.81 and +3.70; the hour's imbalance (854 whole hours) −2.35 ± 4.02, +0.75 ± 8.74, −1.36 ± 13.48 | imbalance with or against the hour's own move; the hour's own move as the sign (−4.44 ± 3.72, −2.38 ± 6.65, +5.69 ± 15.14) |
| X3 | The same trades with their taker named through the seed (22,932 trades, 622 accounts): whose taking is followed? | **pool takers +2.57 ± 3.06, −3.27 ± 3.86, −11.40 ± 6.11**; #47 −6.54 ± 7.18, −9.27 ± 17.86, −46.42 ± 30.54; labelled directional +0.78, +2.39, +9.14 ± 7.72; algorithm +7.24 ± 4.86, −8.01 ± 7.42, −16.06 ± 7.21; **not in the pool +3.27 ± 1.86, +6.57 ± 3.45, +12.82 ± 6.20; in small coins +11.62 ± 5.28, +16.16 ± 11.61, +51.07 ± 12.21** (each hour alike +5.41, +13.41, +23.79 ± 9.7) | small coins in hours with and without a #47 trade (without: +4.24 ± 3.31, +20.69 ± 7.61, +35.93 ± 12.59); the ten busiest named takers. My guess before the run — that #47 carried X2 — was wrong |
| X4 | The panel alone (84 markets, 68 days, 497,068 quarter-hours): after a jump J > 3, does the mark go on or come back? plain momentum | J > 3 (31,221): −0.6 ± 2.0, −1.6 ± 3.5, −5.3 ± 6.7; by kind at 24 h −3.3 (majors), −11.8 ± 12.1 (small coins), −4.5 (equities), +10.8 ± 12.2 (indices), −0.4 (commodities); 1 < J ≤ 3 equities +3.7 ± 2.0 (6 h), +6.4 ± 3.4 (24 h); the last hour as the sign (130,105 hours) −0.4 ± 0.8, +0.4 ± 2.0, +0.4 ± 3.8 | **J > 5: all markets 24 h −22.1 ± 9.8; small coins −5.0 ± 10.4, −33.4 ± 17.0, −70.9 ± 23.6** (t −3.0 by day, −2.4 by week); up- and down-jumps apart |
| X5 | The pool's liquidations (3,049 reducing taker fills, 1,520 market-minutes, 68 days): the mark's move from 2 minutes after, signed by the forced side | all −3.4 ± 11.3, −15.3 ± 26.7, −31.8 ± 20.5; **small coins (434) −24.5 ± 8.4, −70.4 ± 26.8, −147.6 ± 36.4**; majors +2.1, −11.0, −11.8 ± 25.4; equities, commodities, indices nothing clear; the largest third (all kinds) +2.9, −3.7, +2.0 | forced sells and buys apart; the largest third in crypto (−45.4 ± 27.1 at 24 h); events with two or more accounts |
| X6 | The pool's positions at each UTC midnight (1,482 untruncated accounts; 3,174 market-days with 5 or more holders; 74% of holders long): the next 24 and 72 h | signed by the holders' net side −0.1 ± 21.4 and +1.9 ± 34.3; most-long minus least-long third +39.5 ± 26.4 and +103.1 ± 51.5 (small coins 72 h +103.8 ± 41.1); BTC and ETH, accounts labelled directional, 72 h −65.1 ± 17.6 while all accounts read the other way: no stable reading | — |
| X7 | Counts: how much of X3's "unnamed" can be the busiest accounts' missing older fills? | 120 truncated seeds, 82 starting inside R8's weeks; named share of captured trades by week, small coins 13.0%, 19.0%, 21.7%, 25.3%, 10.3%, 29.4%; other markets 13.3%, 14.2%, 16.3%, 14.3%, 15.8%, 40.2% | — |
| X8 | Counts: the last fill before the cut of arm F's eight marked accounts | #47: 2026-10-27T18:38Z (10.2 days before the cut; fills by week 2,110, 2,922, 1,725, 2,326, 138, 0); the other seven 0.1–1.6 days before | — |
| X9 | How sturdy are the three small-coin prints at 24 h: halves, weeks, without the days that add most, each market and account left out | **tape** +35.7 ± 9.0 by day (± 8.0 by week); halves +34.0 ± 11.5, +40.0 ± 14.1; seven of seven weeks above zero; without three days +23.7 ± 7.3; each market left out +27.4 to +39.7; not in the pool +51.1 ± 12.2; each market-day alike +19.4 ± 10.1, without three days +6.7 ± 8.3. **Liquidations** −147.6 ± 36.4 (± 27.2 by week); halves −119.6 ± 53.5, −173.8 ± 49.3; nine of ten weeks below zero; without 11-04 and 11-05 −134.4 ± 35.6; sells −150.3 ± 52.4, buys −142.9 ± 67.3; each market left out −164.5 to −139.9, each account −158.0 to −140.0. **J > 5** −70.9 ± 23.6 (± 29.5 by week); halves −48.2 ± 34.6, −97.5 ± 30.0; eight of ten weeks below zero; without three days −41.4 ± 20.8 | "each market-day alike" for the tape |
| X10 | FIND-4's stored records: are its "after a jump" entries with the jump or against it? | 1,134 after a jump (the report: 1,132), d −32.8 ± 17.0 bps; **with the 15-minute move before them 564: −51.7 ± 26.1; against it 570: −14.1 ± 17.6**; the rest 6,412: +14.4 ± 5.7; by kind BTC and ETH 541, stocks 236 (−96.0 ± 53.4), small coins 224, commodities 118, indices 15 | the split by kind; FIND-4's own split-2 flag (−49.7 ± 26.1 and −17.2 ± 20.4) |
| X11 | The 431 small-coin liquidation minutes in the detail a plan needs: a late entry, the path, with or without a jump, by size, bursts | entered 2 min after −147.6 ± 36.4; **1 h after −122.5 ± 34.2** (held 24 h from the entry −133.2 ± 40.0); 6 h after −76.5 ± 36.7 (−118.5 ± 51.2); the path 1 h −24.4 ± 8.4, 6 h −69.9 ± 27.0, 24 h −147.6 ± 36.4, 72 h −275.9 ± 89.8 (390); a jump J > 5 there −207.0 ± 64.9 (160), 3 < J ≤ 5 −178.3 ± 65.8 (89), J ≤ 3 −80.3 ± 48.9 (182); thirds by size −213.5 ± 53.1, −87.2 ± 57.3, −142.0 ± 52.4; the first in a market for 6 h −123.1 ± 42.4 (338), later ones −236.6 ± 54.4 (93) | — |

**What could fool us here.** (1) Hundreds of cells: a few beyond three errors
are expected by chance; those near four (X2, X3 and X5 in small coins at 24 h)
are less likely to be, but the errors are optimistic. (2) One stretch of
weeks, falling. (3) R8's tape holds only hours in which a tracked trader
entered, and of busy hours only the drawn minutes. (4) "Not in the pool" is
three groups (X7). (5) The labels at the cut look back over days these
explorations measure. (6) The mark is not a tradable price in a thin book.
(7) X4's "five" and several other cuts were not written down first.

## 8. Questions for the owner, each with a recommendation

1. **Where do you act, on which markets, at what cost, and what do that
   venue's rules allow — and would you ever act on small coins?**
   *Recommendation: answer now.* It sets what MARKET-1 tests first and what
   the Markets page lists. No advice follows from it.
2. **May a second paper experiment, on the market itself, be planned now and
   frozen before anyone opens the recordings?** *Recommendation: yes* — it
   costs no API tokens, uses weeks nobody has seen, and its three hints are
   the only ones in the whole record larger than a round trip. Against it: all
   three come from one falling stretch and may vanish.
3. **A second copy of the recordings this week?** *Recommendation: yes;* the
   risk was accepted on 2026-11-10 "until that copy".
4. **The three prints beside the running experiment (the book's price, rule
   4's list, the mirror), fixed in decisions before the first look?**
   *Recommendation: yes;* none can change MAIN's verdict.
5. **v1 with a Markets page, built first, and favourites polled slowly?**
   *Recommendation: yes.*
6. **Your own calls logged from v1's first day?** *Recommendation: yes;* a
   month not recorded cannot be recovered.
7. **"Name the flow" (3.3), a few days of spare budget on old weeks?**
   *Recommendation: after MARKET-1 is frozen,* so the two do not compete for
   attention; sooner if you answer question 1 with "small coins, yes".

## 9. Slips and evidence

**Slips, all of them.** One stamp in `progress.md` was first written as an
estimate ("21:07Z") and corrected from the clock in the same minute (20:56Z).
One shell heredoc failed to parse and wrote nothing; that script went through
the Write tool. `x56-crowd.mjs` carries four no-op `.replace` calls. I listed
the top-level names of `F:\polymarket-follow\paper\` (nothing opened). My
guess that #47 carried X2 was wrong (X3). My first draft tied FIND-4's near
miss to the small coins' move back after jumps; X10 showed that wrong, and
the text was corrected before the commit. Prints outside the written plans
are in section 7's last column.

**Read in the repository:** CLAUDE.md, current-task, the plan page,
architecture, external-apis, decisions (whole), `docs/reviews/README.md`,
`apps/poller/experiment/rules.md`; in full R8, R2, FIND-1, FIND-4; page one
and the results of FIND-2, FIND-3, FIND-5-10, FIND-6, FIND-6-EXITS, FIND-7,
FIND-9; IDEAS-REVIEW to Appendix A's entry 3; APPROACH-REVIEW to its
evidence list; RESEARCH-KIT §2–§8; PAPER-PLAN page one and §4; R7 page one,
the cut-line and §3–§6; DOCS-SWEEP's rewards, possibilities and "beyond the
brief"; R5's verdict; R3's first page. Not read: R1, R4, R6, the rest of R3,
the collector's plan, the rules reviews, the Final reviews beyond the
corrections marked in place, the paper experiment's three reviews.

**Inputs on F: (read only, all before the cut):**
`R8-PRETEST\look\entries.jsonl.gz` (1,946 rows; the newest entry
2026-11-06T22:20:36Z); `R8-PRETEST\capture\tape\` (80 files, 4,168 pages; the
newest trade 2026-11-06T22:34:56Z); `KIT\panel\` (92 files; every one used
ends at the cut, checked in the scripts);
`KIT\derived\pool-labels-cut.jsonl.gz`; `FIND-4\look-records.jsonl.gz`
(26,445 rows, none at or after the cut); `F:\polymarket-follow\paper\seed\`
(1,602 files; no row at or after the cut, checked in each script).

**Saved outputs** (`workers/STRATEGY-REVIEW/explore/`; SHA-256, first and last
eight digits): `x1-tape.out.txt` 66cf818d…feb2d79b; `x2-flow.out.txt`
66f5b798…5f3631ac; `x3-who.out.txt` cfd249df…d474a7e3; `x4-jump.out.txt`
75f55cd7…92a38013; `x56-crowd.out.txt` e0691c34…75d4c02d; `x7-named.out.txt`
cfdce399…229bdad1; `x8-last.out.txt` 66a6e6c4…3656ccd6; `x9-robust.out.txt`
adc8b7ad…feb80b19; `x10-jumpside.out.txt` 73928524…4a428c90; `x11-liq.out.txt`
43675e62…0ac652df; the fifteen scripts beside them.

**Web (2026-11-12 21:17–21:18Z; generic queries, no project or owner detail):**
Chan Kim and Peter Reinhard Hansen, "The Quarter-Hour Effect: Periodic
Algorithmic Trading and Return Predictability in Cryptocurrency Futures",
arXiv 2607.09426 (v2, 2026-07-16), abstract only — https://arxiv.org/abs/2607.09426.
Three searches (liquidation cascades and reversal; order-flow imbalance at
hours; retail positioning as a contrarian sign) returned summaries only: no
rigorous study of a post-liquidation reversal and no independent study of
retail positioning were found; nothing in this report rests on them.
