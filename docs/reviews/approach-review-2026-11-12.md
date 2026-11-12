# APPROACH-REVIEW — the forward paper experiment: its best honest design

APPROACH-REVIEW (Opus 5.5, max), 2026-11-12 09:24Z – 10:07Z (UTC; every stamp
from `date -u`), for polymarket-follow's supervisor. The frame is decisions
2026-11-12, "the way forward". Evidence: the supervisor folder
`workers/APPROACH-REVIEW/` (`progress.md`, `scripts/`, `out/`; paths below are
relative to it) and the web pages listed at the end. **A review decides
nothing.** **The blind store held:** nothing stamped at or after
2026-11-07T00:00:00Z was read; the collector's recordings, database and run
folder were never opened; F:'s `R3-PAPER` and `R3-WEEKDAY` (recorded after the
cut) were not opened; no call to Polymarket's API; the kit `2d3667b5…09aa` was
checked at every run and never edited; no search carried the owner's details
or this project's name; polymarket-lab's docs were read only. **Explorations on
the old weeks: five (X1–X5), each written in `progress.md` before it ran, all
exploring; X5 ran twice (its first projection had a modelling error, recorded).**

## For the owner, in one page

*Words.* A **bp** is 0.01% of a copy's size. A **copy** is the paper position a
follower would have opened after a trader's new position. A **taker** trades at
once and pays the fee and the gap between buying and selling prices (here about
8.5–13 bps in and out); a **maker** waits with a limit order, pays 2.5 bps, but
may not be filled. **"Against random trades"** compares a copy with trades
picked by chance in the same market and hour, so that simply being long in a
rising market earns nothing. **Exploring** means measured on weeks we have
already studied: it describes, it never decides.

**The recommended design — "slow traders, two readings, costs measured":**
- **Who:** no ranking. Every account of our frozen pool (1,602 accounts, the
  100 holdout accounts left out) counts while its own trades of the two weeks
  before mark it as a directional trader. The main line takes the copies of
  traders whose **usual hold is 6 hours or more** (their median over the 30
  days before): about 300 new positions a week from about 180 traders, on the
  last weeks we hold.
- **What:** every new position (an opening or a flip; not additions), every
  market but the six we leave out, every hour. Each copy: $1,000, entered about
  80 seconds after the trader, at a taker's costs (fees, spread, depth,
  funding). **Two readings of every copy:** the money — the copy leaves when the
  trader leaves; and the judgement — the copy held 24 hours against random
  trades, which takes the market's own direction out.
- **How long:** from 2026-11-07, the weeks nobody has looked at, if the rules
  are frozen before anyone looks. Three looks: **2026-12-19, 2027-02-06,
  2027-05-08.**
- **How judged, fixed before it starts:** **keep** when the money's lower bound
  is above zero and the judgement points the same way; **drop** when the
  money's upper bound is below +10 bps a copy (the smallest edge worth having:
  yours to fix); otherwise **too few to tell**.
- **Beside it, deciding nothing:** every directional trader's copies (the fast
  ones too); limit-order entries; stops; traders who hold for days; entries
  right after a price jump; your own favourites.

**Why it is the best balance of what we know.** A round trip costs about the
same whatever the hold, while the price move grows with it: at 24 hours a
taker can cover the costs in 80 of 84 markets, at one hour in 2. So a small real
skill has its best chance with slow traders. For them the delay does not matter
(copies taken 5 or 15 minutes later did no worse). Picking traders by their past
failed every test (FIND-1, FIND-6), so the design picks none: a broad rule
gives the most copies and no picking luck. The two readings answer the two
questions apart: does it pay, and is it skill or just the market's direction.
On our old weeks the slow traders' result changed sign between September and
October, while against random trades they stayed about even (FIND-3): that
points to the market's direction, not to the traders. And the outside evidence
agrees: copying has paid only where the leader's information is slow and the
copier's costs are small.

**What it can show, and how soon** (an edge seen four times in five):
- **The main line:** about **40 bps** a copy by 2026-12-19, **25** by February,
  **16** by May. A real edge, if one exists, is probably smaller. So the likely
  answer in December is "too few to tell", and by February or May "drop",
  unless something real is there.
- **Every directional trader:** about 11 bps by December. That gives a clear
  forward answer to "does copying them pay at a taker's cost" within six weeks.
- **On the old weeks (exploring):** slow traders' copies lost 9.9 ± 9.1 bps
  with the exits copied (+1.1 before costs) and made +9.1 ± 13.7 held a day.
  Nothing there predicts a pass.

**The alternatives, one line each.**
1. *Every directional trader as the main line:* the fastest and clearest
   answer, most likely "drop" by December, with less chance of finding an edge.
2. *Your own list of up to 20 traders, live in the app:* personal and true to
   the real alert delay, but small (it sees only about 20–70 bps in 1–3
   months, by reading) and only after the app exists.
3. *Slow traders with limit-order entries as the main line:* the cheapest copy,
   but its fill model is new and untested, so it runs beside first.

**Your decisions** (in full at the end, each with a recommendation): start the
data at the cut (yes); leave the holdout accounts out (yes); the "drop" line,
+10 bps (yours); run it first as a weekly script, not as the app (yes).

*This is research, not advice on what to trade.*

---

## A. The outside evidence on copy trading

Every claim below was read on the source's own page or text on 2026-11-12;
where the fetch tool returned extracts, the sentences were asked for word for
word. Two PDFs (Apesteguia et al.; ESMA's briefing) were read through my own
text extractor because the reader here cannot render PDFs. SSRN (HTTP 403) and
Heidelberg's server (a bot check, not bypassed) could not be read.

### A1. When, if ever, has copying paid a follower after costs?

- **Copying slow leaders' disclosed holdings has paid.** Funds that buy the
  holdings mutual funds disclose earned, after expenses, returns
  "statistically indistinguishable, and possibly higher" than the
  high-expense funds they copied, in the 1990s (Frank, Poterba, Shackelford &
  Shoven, NBER w8653, 2001; J. Law & Econ. 2004). On a later sample, copycats
  were "comparable to their target mutual funds" after trading costs and
  expenses. They did better once disclosure became quarterly in 2004, and best
  when copying past winners and funds whose holdings are representative
  (Verbeek & Wang, J. Banking & Finance 37(9), 2013, abstract). Conditions:
  information that lasts months, buy-and-hold copies, small costs, and a copier
  who saves the leader's own fees.
- **Copying a kind of trade, chosen by a rule, has paid.** Following only the
  "opportunistic" insider trades (routine ones removed) earned 82 bps a month
  value-weighted, while routine insiders' abnormal returns are "essentially
  zero" (Cohen, Malloy & Pomorski, NBER w16454, 2010).
  Two things carry it: the selection is by the kind of trade, not by past
  returns, and the horizon is a month.
- **Fast skill exists, but a follower cannot have it.** The 500 best Taiwanese
  day traders of one year earned 37.9 bps a day after fees the next year. But
  "Less than 1%" of day traders predictably profit (Barber, Lee, Liu & Odean,
  J. Financial Markets 18, 2014, abstract), and the edge is intraday. On a
  perps exchange with public wallets, informed wallets keep their rank between
  ten-day windows (rank correlation 0.52), but at a one-second horizon, and no
  follower's costs or delay are modelled (Zhai, arXiv 2608.04373, 2026). Our
  own FIND-2: #47 made 81% of its profit within two minutes of its trades.
- **Social trading platforms: not after costs.** Investing in the traders with
  the highest accumulated returns "leads to high losses". Taking the Sharpe
  ratio into account helps, but "no strategy reveals a positive abnormal
  return after transaction costs" under a four-factor model; very active
  traders earn less, and follower counts predict nothing (Dorfleitner et al.,
  QREF 70, 2018, abstract). Two positive studies are known to me only through
  Apesteguia et al.'s review, not read in the original: on eToro the followed
  traders are "often but not always" the most successful (Pan et al. 2012), and
  copied trades win more often but lose more when they lose (Liu et al. 2014).
  No peer-reviewed study of crypto or perps copy trading after costs was found
  (searches of 2026-11-12; R5 found none on 2026-11-06).
- **Herding.** Copiers crowd onto a few leaders: on four platforms in May 2018
  the top 5% of leaders held 61.1% (ZuluTrade) to 92.8% (eToro) of copier links
  (Apesteguia et al., their Figure 1). A crowd's own orders move a thin market
  against it; at a $1,000 paper size this does not touch our log, but it would
  touch a real crowd.

**What it says for us.** Copying paid when four conditions held together: the
leader's information lasts much longer than the copier's delay; the costs are
small against the move; the leader or the trade is chosen by a rule about its
kind, not by raw past returns; and nobody else crowds the same trades. Our
traders fail the first condition on average: half of FIND-6-EXITS's copies
were closed within 47 minutes. The design must look where the first two can
hold: slow traders and long holds.

### A2. Why copy-trading services thrive while most copiers lose

- **They are paid for money copied and volume, not for followers' results.**
  - eToro pays its Popular Investors "up to 1.5% of assets under copy (AUC)" a
    year, monthly on the average AUC (its Popular Investor page, read
    2026-11-12).
  - Binance gives lead traders "Up to 30% profit share" of copiers' profits,
    owed only above what was already shared, plus "A 10% commission on their
    copy traders' trading fees" (its lead-trader page, updated 2026-09-22).
  - ZuluTrade paid 0.5 pip on every lot a copier traded, and eToro then paid up
    to 2% of the copying equity with spread rebates (Apesteguia et al., 2018–19).
  - A share of gains with no share of losses is an option on the copiers'
    money, which pays for risk. A fee on volume pays for turnover.
- **Regulators name this.** ESMA's Supervisory Briefing on copy trading (30 March
  2023, ESMA35-42-1428, §2.6, ¶63) says conflicts "can arise in particular from
  the structure of the payment made to the traders whose trades are being
  copied". Its questions ask whether variable pay rests on the "Number and
  value of trades copied", the "Number of followers" or the AUM. It also asks
  that past performance not be the most prominent element and cover the
  preceding five years, and that forecasts not rest on simulated past
  performance.
- **Showing success raises risk-taking.** In a laboratory market, information
  on others' success made 176 subjects take more risk, and a copy button more
  so. 35% of the subjects who could copy did, and 88% of them copied somebody
  who had chosen the riskiest asset. The authors' mechanism: "investors with
  high earnings may have just been lucky", and high returns come with high risk
  (Apesteguia, Oechssler & Weidenholzer, UPF WP 1615, revised 2019;
  Management Science 66(12), 2020).
- **Survivorship and luck.** A ranking shows the survivors of thousands of
  draws. Among US mutual funds, "75% of funds exhibit zero alpha" net of
  expenses, and skilled funds were almost gone by 2006 (Barras, Scaillet &
  Wermers, J. Finance 65(1), 2010, abstract). A vendor's 90-day count on three
  crypto exchanges put 97% of leaders in profit on their own accounts, against
  43.6% of leaders whose followers were in profit (R5's reading of Yieldfund,
  2026-11-06, not re-read; a vendor, one window).
- **The loss counts.** ESMA, on CFDs: "74-89% of retail accounts typically lose
  money", with average losses per client of €1,600 to €29,000 (press release
  27/03/2018, ESMA71-98-128). **The figure the brief asked to confirm is
  confirmed from ESMA's own page.** eToro states today: "55% of retail investor
  accounts lose money when trading CFDs with this provider."

### A3. Picking leaders by their past results

- **Funds:** skill is rare and fades, with three quarters at zero alpha after
  expenses (Barras et al. above, who tie it to Berk and Green's equilibrium).
- **Day traders:** the top of one year stays ahead the next, but it is under
  1% of a population of very many traders over 15 years (Barber et al.).
- **Social trading:** ranking by accumulated returns picks losers; ranking by
  Sharpe ratio helps somewhat (Dorfleitner et al.).
- **Ours:** traders' follower results do not persist from week to week
  (FIND-1: Spearman 0.066, p 0.51; it could see a spread of about 46 bps). No
  ranking rule picks better traders, the owner's filter included (FIND-6). With
  exits copied no rule's top fifth is above zero (FIND-6-EXITS). The month's 50
  most profitable directional traders lost a follower 16.6 bps a copy (R8), and
  in those weeks the 49 besides #47 banked a loss *together*, −$14,511, with 18
  of them above zero and 28 below (FIND-REVIEW-C). [This corrects the brief's
  "49 of the 50 banked a loss themselves": the loss is the 49's sum.]
- **For the design:** do not rank. Take a broad population fixed by rule, and
  choose which copies to count by their cost structure (the hold), never by
  past results.

## B. The six directions we have not tested

### B1. Traders who hold for days, with their exits copied

- **The idea:** a day's move is many times a round trip's cost, so a small
  skill can pay. FIND-2: 68% of the top 100's profit of the 30 days before the
  cut came from positions held past a day.
- **What our results say:**
  - FIND-2: five accounts made 86% of that profit; without them, holds past a
    day are a quarter of the rest's profit.
  - FIND-3: slow traders (usual hold ≥ 6 h) held 24 h are about zero against
    random trades (951 entries; 0 and +9 bps).
  - X3, exploring, FIND-3's population with the exits copied:
    - all slow copies: −9.9 ± 9.1 bps a copy (gross +1.1); held 24 h +9.1 ± 13.7;
    - traders whose usual hold is a day or more: 227 copies of 36 traders,
      −36.8 ± 40.8 with exits copied, −5.6 ± 29.5 held 24 h;
    - **the period decides the sign:** before 2026-10-10 +20.9 ± 11.0, after it
      −59.4 ± 24.2. With the same traders about even against random trades
      (FIND-3), that points to the market's direction, not to the traders.
- **Now or new weeks:** the old weeks are explored (X3); only new weeks can test.
- **Smallest visible edge:** the main line holds ~131 entries a week (FR1, the
  last four weeks before the cut). With exits copied it sees about 54 bps a
  copy at the first look (6 weeks), 33 at 13 weeks and 21 at 26 (FR3; X5's
  model agrees within 1%). Day-holders are 17% of its entries, so alone they
  see about 2.4 times more. [Final review, APPROACH-REVIEW, F1: was "(X5, every
  slow entry, ~316 a week): with exits copied about 37 bps after 1 month, 26
  after 2, 22 after 3, 15 after 6, 11 after 12. Day-holders alone are about a
  third of the copies, so about 1.7 times larger." That count had no minimum of
  closed cycles; the main line's rule has ten.]
- **Verdict: IN the experiment, as its main line** (usual hold ≥ 6 h, the
  rule FIND-3 froze before this review), with day-holders as a line beside.

### B2. Cheaper entries: limit orders at a maker's costs

- **The idea:** a maker's round trip is 2.5 bps against a taker's 8.5–13 (X1).
- **What our results say** (X2, X3, exploring): with every limit order filled
  at the mark, an upper bound:
  - FIND-6-EXITS's copies: −8.0 against −15.8 a copy (gross −5.4);
  - slow copies: −2.0 against −9.9 (gross +1.1);
  - slow copies held 24 h: +17.0 against +9.1.
- **Why it cannot be the fix:**
  - **A cheaper copy of a trade worth nothing is still worth less than
    nothing.** The copies were negative or flat before costs, so lower costs
    shrink the loss and cannot reverse it.
  - Limit orders fill most when the price moves against them, so the true
    result lies between the taker's and the bound.
  - A copied exit cannot wait for a fill.
- **Now or new weeks:** the old weeks cannot model fills; the minute panel has
  no book or tape. The collector's books and every trade, from 2026-11-10
  20:59:54Z, can: a limit at the touch counts as filled when the tape trades
  through it within W minutes, and otherwise the copy crosses or is skipped.
- **Smallest visible edge:** that of the line it sits on, plus the fill rate.
- **Verdict: IN, beside only** (maker entry, taker exit, with the fill rate).
  It matters only if the gross turns out positive. Print each design's
  break-even cost, so that any venue can be judged.

### B3. The later batch's three candidates

- **"After a jump" (FIND-4).**
  - What it found: entries placed right after the price moved more than three
    times its usual 15-minute move did about 51 bps worse at 24 h than the rest
    (mean d −33 against +14). It missed Holm's line (p 0.0082 against 0.0045);
    its one-draw placebo was luck (FIND-REVIEW-A).
  - For a follower it is a *skip* rule: do not copy entries that chase a jump.
  - Now or new weeks: FIND-4's 67 days include our other weeks, so nothing new
    can be learnt from them.
  - Smallest visible edge: the split saw ~81 bps in FIND and ~97–105 bps at a
    six-week exam.
  - **Verdict: IN as a recorded split beside the main line, deciding nothing;**
    every copy stores its jump ratio.
- **The counter-move before agreement (FIND-9).**
  - What it found: three unlinked traders agreeing tend to enter after a move
    against them (−9 bps in the hour before; p 0.37 by trader, a description).
  - Too rare: 19 events a week, 124 of 188 on BTC.
  - Smallest visible edge: ~77–104 bps at an exam.
  - **Verdict: LATER** (store the agreement flag, decide nothing).
- **The top accounts' long holds (FIND-2).**
  - The profit sits in five accounts, which were chosen on that very profit, so
    exploring them on the old weeks is circular.
  - **Verdict: inside the experiment only as the day-holders line;** a study of
    those accounts is LATER.

### B4. What more weeks of the collector buy

- From the real noise of 1,918 and 1,366 copies (X5): sd 193 bps a copy with
  exits copied for the board's mixed traders, 345 for slow traders, 365–397
  held 24 h.
- The error shrinks almost as one over the root of the months for slow
  traders; for the broad line a small trader effect slows it down.
- **The smallest net edge seen 4 times in 5** (two-sided 0.05; at 0.005 about
  1.3 times these):

| Design (entries a week, X1/X5) | Reading | 1 month | 2 | 3 | 6 | 12 |
|---|---|--:|--:|--:|--:|--:|
| Every directional entry (~890–940) | exits copied | 9.5 | 7.3 | 6.3 | 5.2 | 4.6 |
| | held 24 h | 32 | 23 | 20 | 15 | 12 |
| Slow, usual hold ≥ 6 h, *no* minimum of closed cycles (~316) | exits copied | 37 | 26 | 22 | 15 | 11 |
| | held 24 h | 50 | 38 | 33 | 27 | 24 |
| Map-open cells only (~197) | exits copied | 59 | 42 | 34 | 24 | 17 |
| 20 favourites at R8's rate (~89) | exits copied | 31 | 24 | 21 | 18 | 16 |
| | held 24 h | 68 | 52 | 46 | 38 | 34 |

- [Final review, APPROACH-REVIEW, F1: added.] **The main line is not the
  "slow" row above.** Its rule asks for at least 10 closed cycles, which leaves
  ~131 entries a week (FR1). At the three looks (6, 13 and 26 weeks) it sees,
  with exits copied, **54 / 33 / 21 bps**, and held 24 h 71 / 49 / 37 (FR3's
  day-block bootstrap; X5's model gives 54 / 33 / 22 and 73 / 50 / 39). The
  slow row describes the same filter without that minimum.
- If the population's activity decays as a fixed list's does (X1: to about 60%
  within four weeks), these grow by about 15%.
- **R3's judgement on these numbers.** R3's per-trader verdict needs E ≥ 400 at
  K = 20, which takes months to years even for an edge three times the fees.
  R3's pooled daily vote needs P(vote > 0) = 0.60, which is 369 days, or 0.70,
  which is 83 days. X5 puts that at a true edge of ~14–17 and ~28–35 bps a copy
  in d for the broad and slow designs, and ~29 / ~59 for 20 favourites. [Final
  review, APPROACH-REVIEW, F1: added. For the main line, ~19 copies a day, the
  same formula gives ~19 and ~39 bps.]
- **FIND-REVIEW-6's F1 agrees:** a small group (the owner's filter's top fifth)
  could see only ~100–150 bps.
- **What follows:** the money line on a broad, rule-based population is the
  fastest test. Small groups and per-trader verdicts are slow by nature.

### B5. Using the data other than by copying (watch-only)

| Use | What the collector records (from 2026-11-10) | Research or a follower's use? |
|---|---|---|
| Crowd positioning | tickers every minute, with `long_count` / `short_count` (accounts net long and short, market makers included) and the rolling funding rate | research: a contrarian or crowding signal; needs months and its own register entry; a follower would need it to beat costs at a stated horizon, two steps away |
| Liquidation waves | the public tape has no liquidation flag, so a wave is a proxy: a price move with a burst of trades and volume, and open interest falling where a recorded reply carries it (to be checked); flagged liquidation fills only in the accounts whose fills we read | research; liquidation-driven moves may partly revert, untested here; two steps away |
| Funding | hourly settlement rates, the ticker's rolling rate | entry 8 could see only ~120 bps where it needs under 60 (RESEARCH-KIT): months of data first |
| The boards | 16 boards × 1,000 rows nightly; the universe | a watching tool (who is active, turnover); not a signal (R2: the tops are algorithms, market makers and inactive accounts) |

**Verdict: LATER, as research on the collector's months, not in this
experiment's decisions.** The experiment stores each copy's market state at
entry (funding rate, long and short counts, the open-interest change of the
hour before, the 15-minute jump ratio), so that a later study can split its
copies by them at no cost.

### B6. Prediction-market traders

- **The idea:** positions run to resolution over days or weeks, and the
  information is about events, so a delay matters little. That fits A1's
  conditions better than perps do.
- **What we know:**
  - polymarket-lab's verified facts (its external-apis, read only):
    - the Data API is public and keyless: trades by wallet, positions with
      realized profit (capped at 500 rows), a leaderboard (v2, day to all, by
      profit or volume, which froze 10-30 to 11-01), and price history
      (3- and 12-hour series back to 2022-11);
    - maker and taker cannot be told apart from public fills;
    - most top wallets hold to resolution.
  - Our founding decision: polymarket-lab's F9 probe (2026-09-04, 660 wallets)
    found top wallets' entries predicted 1–24 h moves no better than random
    trades.
  - Resolution-horizon following is untested. The prediction-market fees are
    not in the lab's verified facts and must be read before any study.
- **Now or new weeks:** a new venue, new readers and a new yardstick (the
  resolved outcome); nothing of ours is ready.
- **Verdict: LATER (parked, as the plan page has it).** A small scoping study
  (one read-only export of the daily boards, as the plan page notes), on your
  word, once this experiment runs.

## C. The design in full

### C1. Who to follow

- **The population (fixed now; nothing chosen by results):** the kit's pool
  (`kit/data/population.json`, 1,702 accounts, SHA-256 `f2748c42…`) minus the
  100 holdout accounts, so D1, the classifier's blind test, stays clean.
- **The per-entry rule** is P1, the rule of every FIND study: the account's
  frozen classifier v1 label on the 14 days before the entry's Monday is
  directional, and its fills read cover those 14 days. Nothing is ranked.
- **The main line's filter:** the trader's median hold over the 30 days before
  the entry's Monday is at least 6 h, with at least 10 closed cycles. This is
  FIND-3's definition, frozen 2026-11-11 before this review, so no number here
  was tuned on my explorations.
- **How many:** every account that qualifies. On the last four weeks before the
  cut that is ~131 main-line entries a week from 61 traders (~147 a week from
  106 traders since the launch week), and ~935 directional entries a week in
  all (FR1). [Final review, APPROACH-REVIEW, F1: was "~316 slow entries a week
  from ~183 traders", a count without the minimum of 10 closed cycles.]
- **When fixed:** the rules and the pool at the freeze, before any post-cut
  outcome is read. Accounts that appear after the start are left out (a later
  arm may add them, with its own start).

### C2. What is copied

- **Entries:** openings and flips; additions are not copied (R8, FIND-4).
- **Markets:** the primary cells (A.0-7: not the pre-IPO market, PRL, NCLD,
  SKHYNIX, SAMSUNG, CXMT; a retired market from its close-only day). At the
  fixed 24 h horizon 80 of 84 markets are open for a taker on the map (X1), so
  the hold filter, not the market, does the work.
- **Hours:** all. The cost table already prices US hours and other hours
  apart, and R8's US-open cell vanished with the exact null (FIND-10). Picking
  hours by past results is the trap this design avoids.
- **The entry:** $1,000 at t + D, with R8's delay D (62–95 s; the kit's
  `delayOf`), priced by the kit's rule (the minute mark plus the measured
  half-spread and depth, base-tier fees, hourly funding). Beside it: the
  collector's book VWAP for $1,000 at the same instant, from 2026-11-10
  20:59:54Z.
- **Reading 1, the money (exits copied):** FIND-6-EXITS's rule. Each reduce,
  close, flip or liquidation of the trader closes its share at its own time
  + D; adds are not copied; a copy still open at a look is marked at it and
  flagged.
- **Reading 2, the judgement:** d at 24 h against the exact matched null (the
  kit's `dAgainstNull`), cost-neutral. It answers "skill or the market's
  direction".
- **Stored with every copy** for later splits: the trader's usual hold and
  label; the 15-minute jump ratio; funding, long and short counts and the
  open-interest change at entry; the competition flags; the agreement flag.

### C3. The costs to assume, and the break-even

- **Taker (the default of every table):**
  - 4 bps a leg plus half-spread and depth;
  - a round trip of 8.5–9.7 bps on BTC, ETH and SOL, about 13 on small coins,
    equities and indices, 8.6–10 on commodities (X1; R8's session-pair table,
    measured 2026-11-07 and 11-09).
  - Polymarket's tiers go down to 2 bps a leg at $1B of 30-day volume
    (external-apis).
- **Maker:** 1.25 bps a leg, no spread, with fills uncertain (B2); the tiers
  reach −0.5 bps.
- **The break-even cost of each line is its gross per copy before costs;** the
  report prints it with its lower bound.
- **On the old weeks (exploring):**
  - every board candidate: −5.4 with exits copied and −2.7 held 24 h, so no
    cost breaks even;
  - slow traders: +1.1 (exits copied), below any venue's cost; +19.9 ± 13.8
    held 24 h, inside the noise and driven by the period.
- **Your venue:** whatever its cost, the line "pays at any round trip below X"
  answers it once the owner's venue is known (the plan page's backlog).

### C4. Limits on losses

X4, exploring, on the copies with exits copied (bps a copy, ± by trader):

| Rule | FIND-6-EXITS copies (1,918) | Slow copies (1,366) | What it does |
|---|---|---|---|
| none | −15.8 ± 4.9; sd 193; worst 1% −780 | −9.9 ± 9.1; sd 345; worst 1% −1,057 | — |
| stop at 2% against the entry | −10.3 ± 3.7 (paired +5.5 ± 3.3); sd 138; worst 1% −249 | −6.1 ± 5.7 (+3.8 ± 7.5); sd 212 | cuts the tail by 3–4 times and the sd by a third |
| stop at 5% | −15.1 (+0.7 ± 1.9) | −13.2 (−3.3 ± 5.7) | little |
| 7 days at most | −13.5 (+2.3 ± 1.2) | −4.6 (+5.3 ± 4.0) | cuts the long losers |
| daily limit $50 (at $1,000 a copy) | −16.2, 1,612 kept | −12.5, 1,275 kept | fewer copies, the same per copy |
| trader limit $50 | −14.2, 1,514 kept | −4.3, 985 kept | fewer copies; within noise |

- **The reading:** limits cut variance and the worst cases; none turns a mean
  positive, and the changes per copy are within one or two errors. That is
  what theory says: a stop on a price with no drift does not create money.
- The 2% stop's gain here leans on one fall (2026-11-04/05): the worst day holds
  18% (board copies) to 50% (slow copies) of the whole loss.
- **Recommended:** no limit in the main line, since a stop would change what is
  tested and Iron Rule 4 records every followed entry. The 2% and 5% stops and
  the 7-day limit are lines beside. A daily or per-trader limit is the owner's
  own risk tool: the app shows what it would have done (the worst day, the
  worst trader, the paper equity's drawdown), never by dropping copies.

### C5. How long, and the rule by which it is judged (fixed before it starts)

- **The data:** from **2026-11-07T00:00Z**. These are the weeks nobody has seen:
  the exams of 11-30 and 12-19 have nothing registered to confirm (decisions
  2026-11-11), and D1 and D2 stay as planned (holdout left out; D2 is another
  question on the same fills).
- **Three looks, with the false-pass budget spent 0.5% / 1.5% / 3% (5% in all):**

| Look | Data | z (two-sided) | Main line: edge seen 4 in 5 | Broad line, beside |
|---|---|--:|--:|--:|
| L1 2026-12-19 | 6 weeks | 2.81 | ~54 bps (SE ~14.9) | ~11–12 (SE ~3.0–3.2) |
| L2 2027-02-06 | 13 weeks | 2.43 | ~33 (SE ~10.1) | ~8–9 |
| L3 2027-05-08 (final) | 26 weeks | 2.17 | ~21 (SE ~7.1) | ~6–7 |

  (FR3's day-block bootstrap and X5's model, at the last four weeks' rates:
  ~131 a week for the main line, ~935 for the broad line; about 15% wider if
  activity decays.) [Final review, APPROACH-REVIEW, F1: the main line's column
  was "~41 bps (SE ~11.3) / ~25 (SE ~7.7) / ~16 (SE ~5.4)", read at a rate of
  ~316 a week that lacks the minimum of 10 closed cycles. The broad line's
  column was "~11 (SE ~3.1) / ~8 / ~6", and FR3 widens it a little.]
- **The statistic:** the main line's money, the mean net per copy (each copy
  alike), with its **two-way clustered error**: CR1 by trader and CR1 by UTC
  day combined (Var_trader + Var_day − Var_iid), never below either one-way
  error. [Final review, APPROACH-REVIEW, F2: was "with the larger of its two
  errors (CR1 by trader, CR1 by UTC day)". The projections use the two-way
  error, and the larger one-way error can be the smaller of the two, as it is
  for the 24-hour reading here, so one definition now serves both.]
  - **KEEP** at a look if mean − z·SE > 0 **and** the mean d at 24 h against
    the matched null is above zero (so that the market's direction alone
    cannot pass).
  - **DROP** at a look if mean + z·SE < δ, with δ = +10 bps a copy proposed
    as the smallest edge worth having (your number). A drop may come at any
    look; that cannot raise the false-pass rate.
  - **TOO FEW TO TELL** otherwise; at L3 it reads "no edge as large as ~16 bps
    a copy was seen".
- **What the rule does under the likely truth:**
  - if the slow traders carry no skill, the main line's mean sits near −11 (a
    round trip). The drop line is then reached with probability ~0.36 at L2
    and ~0.79 at L3, each look taken alone. The broad line's upper bound
    (−11 + 2.81 × 3.2 ≈ −2) is already below zero at L1;
  - if a real net edge of +20 bps a copy exists, KEEP comes with probability
    ~0.33 at L2 and ~0.74 at L3, provided d agrees.
  - [Final review, APPROACH-REVIEW, F1: was "~0.62 by L2 and ~0.95 by L3" and
    "KEEP is likely by L3". Now Φ((δ − μ − z·SE)/SE) and Φ((μ − z·SE)/SE) on
    FR3's errors.]
- **Never changed after the start.** A new idea becomes a new arm with its own
  start date and its own budget.
- **R3's e-processes stay as R3 designed them,** shown live and valid however
  often anyone looks: the pooled daily vote and per-trader E with K slots. They
  are too slow to decide this experiment (B4).

### C6. What each outcome would mean, and the next step

| Outcome | What it means | Next step |
|---|---|---|
| KEEP | on weeks nobody had seen, copying slow directional traders by a fixed rule earned more than a taker's costs, and not through the market's direction alone | keep the log running as a second, independent confirmation; measure the owner's own costs and the real alert delay (v1); the account-level check (H12: drawdowns, streaks, sizing). Still research, never advice |
| DROP | it does not earn δ at a taker's cost; if the gross's upper bound is also below 2.5 bps, no venue's costs rescue it | close copy-style use; v1 stays a watching and analysis tool; research turns to B5's market uses or B6, by the owner's word |
| TOO FEW TO TELL (at L3) | no edge as large as ~16 bps a copy; any edge left is smaller than one round trip | treat copying as not shown to pay; continue the log only as the app's long-run scoreboard |
| The broad line negative while the main line is not | the slow filter may matter, or the main line is still noisy | read the main line's own looks; nothing is concluded from the difference alone |

### C7. What the app should show (data, never advice; R7's rules)

- **For every copy:** the trader's fill time, the modelled alert time (t + D),
  the entry price (the kit's rule and the book's VWAP), the side and size, each
  cost (fee, spread and depth, funding), **both readings** (money with the
  exits copied; d at 24 h against random trades), the copy's gross, and its
  flags (open and marked, liquidation, gap, late).
- **For each line** (the main line first, then the beside lines):
  - copies, traders, days;
  - the money line with its interval clustered by trader and by day, and "No
    verdict yet" until a look;
  - the gross, and "it pays at any round trip below X bps";
  - the d line, and R3's E track;
  - the win share and the average win against the average loss, labelled
    "exits can flatter these; only money measures";
  - the worst day, the worst trader, the paper equity's drawdown, and the
    copies open now.
- **The look dates and the rule** (C5) on the page from the first day; the
  earlier tests' dated findings collapsed beside them (R7's band).
- **Never:** a sort by result; a hand-picked subset; "copy", "follow",
  "signal", "edge"; a probability for E.

### C8. How it is run

- **First as a weekly script, not as the app.** The experiment needs no live
  alert. Fills can be read back; the prices come from the kit's rule extended
  past the cut and from the collector's books. A fixed delay D models the
  follower, as R8 did.
- So it can start on the cut's data at once, cover hundreds of accounts, and
  give the plan subagent a scorer that v1's paper log later reuses with the
  real, measured alert delay.
- **What it reads:**
  - the pool's fills from 2026-11-07, weekly;
  - the minute marks and funding of the 84 primary markets after the cut;
  - the collector's books and trades (read by the experiment only, after the
    freeze).
- **The rate budget:** reading ~1,600 accounts' fills is ~1,600–5,000 reads a
  week (most accounts are idle; one page each), about 16–50 thousand tokens, or
  2–6 hours a week at 150 tokens a minute. This is my estimate, not a
  measurement: the plan measures it, with a page cap and a coverage flag per
  account (Iron Rule 5).
- **The kit's boundary moves to each look's end** (a new fingerprint). Its
  functions are reused unchanged, so the yardstick stays the one of every
  study.

### C9. The alternatives and their trade-offs

| Design | For | Against |
|---|---|---|
| **Recommended: slow traders, two readings** | the best cost structure for a small skill; the delay does not matter; a rule, not a ranking; both questions answered apart | slow to see: ~54 / 33 / 21 bps at the three looks [Final review, APPROACH-REVIEW, F1: was "~41 / 25 / 16"]; with a minimum of 3 closed cycles instead of 10 (question 7), about twice the entries |
| Every directional trader as the main line | the fastest, clearest answer (~11 bps by L1) | tests what R8 and FIND-6-EXITS already measured; costs dominate short holds (gross ~0 to −5) |
| Your own list of ≤ 20, live in v1 | personal; the real alert delay | needs v1 first; small (~31–70 bps at 1 month); judges your picks as a set, with R3's E ≥ 400 per trader taking months to years |
| Slow traders, limit-order entries as the main line | the cheapest copy (2.5 bps a round trip if filled) | its fill model is new and untested, and from 2026-11-10 only; better beside first |

## The explorations, counted (all on weeks before the cut; all exploring)

| # | What (written in `progress.md` before it ran) | Result |
|---|---|---|
| X1 | counts and costs only: directional entries by usual hold, the map at the trader's horizon, a list's decay, the round-trip cost | 9,796 entries of 549 accounts in 9.7 weeks (holdout out), 935 a week at the end; usual hold < 1 h 42.5%, ≥ 6 h 31%; the map open for a taker at the trader's horizon for 20.6% (0.5% at 1 h, 87% at 24 h); a list fixed on a Monday keeps ~200 of ~270 accounts active over 4 weeks, its entries falling to 42–85% of week 1's (~62% on average) |
| X2 | FIND-6-EXITS's 1,918 copies by the trader's usual hold; the map filter; the maker bound | the plumbing equal (0 difference); usual hold < 1 h −5.9 ± 5.3 (gross +4.1); 1–6 h −18.4 ± 10.4; 6–24 h −45.5 ± 16.9; ≥ 24 h −67 ± 92 (35 copies); map open −24.8 ± 16.8; maker bound −8.0 overall |
| X3 | FIND-3's slow traders (1,366 entries, 105 accounts) with exits copied; maker; delay +5 and +15 min | the plumbing equal to FIND-3's 24 h net (1,104 entries, 0 difference); exits copied −9.9 ± 9.1 (gross +1.1); held 24 h +9.1 ± 13.7; maker −2.0 / +17.0; +5 min −8.4, +15 min −7.2; before 10-10 +20.9 ± 11.0, after −59.4 ± 24.2; day-holders −36.8 ± 40.8 |
| X4 | loss limits: stops 2% and 5%, 7 days, daily and trader limits | C4's table: tails cut, no mean turned positive |
| X5 | the real noise and the smallest visible edge, month by month (dispersion only) | B4's table. **Run 1 was wrong by construction:** a pooled within-trader variance read the different noise of short and long holders as differences between traders, putting a floor of ~22 bps under the broad line's error; run 2 takes the trader component from the observed design effect and reproduces each sample's own error (4.92 against 4.77, 13.97 against 13.97). Both outputs are kept |

Not explored, decided before any run: "after a jump" and the counter-move
before agreement (found on these same weeks, so they cannot add evidence),
FIND-2's five accounts (chosen on their profit in the window), and results by
market or hour (too many cells, chosen by outcome). **No design rule here was
chosen from these results:** the main line's filter is FIND-3's, frozen before;
the explorations size the design and describe it.

## What could fool us

1. **The market's direction.** X3's slow copies swung from +21 to −59 bps
   between two stretches of the old weeks (before and after 2026-10-10). A few
   weeks can pass or fail on the
   drift alone. Guard: KEEP needs d against the matched null to agree; the long
   share is printed.
2. **One day or one account.** The worst day held 18–50% of the losses (X4);
   one account's afternoon shaped FIND-6's table (FIND-REVIEW-6, F2–F3).
   Guard: the larger of the day and trader errors; each line printed without
   its most influential account and day.
3. **Copies open at a look.** FIND-6-EXITS's 20 open copies averaged −575 bps.
   Guard: marked at the look, flagged, printed with and without.
4. **The minute convention for short holds.** 19% of copies are held under 5
   minutes. Guard: the collector's books and the one-second marks for short
   copies, beside.
5. **The modelled delay is not the real one.** For slow traders the delay barely
   matters (X3); v1 measures the real one.
6. **The population ages.** A list's activity decays (X1), which costs power
   but adds no bias; the power table allows for it.
7. **The competition** (2026-11-02 → 11-16) covers the first nine days. Guard:
   the line also without its days and boosted markets (A.0-8).
8. **Many beside lines.** Some will look good by chance; only the main line
   decides.
9. **Changing the rules after seeing numbers.** Forbidden; a new idea is a new
   arm with its own start.
10. **The cost table** was measured on two mornings in November. Guard: the
    book VWAP beside, from 2026-11-10.
11. **The pool** came partly from profit boards read at the cut. Selection on
    the past does not bias a forward measurement, but the notional-board
    accounts' line is printed apart (FIND-3: the profit-board "rest" did
    better in the past, as accounts chosen on that past would).

## What stays unknown

- Whether any edge exists at all for slow traders: FIND-3's 95% intervals run
  from about −23 to +23 bps against random trades by day (−21 to +40 by
  trader), and X3's exits-copied line from about −28 to +8.
- The owner's venue and its costs; the real alert delay; live fill rates for
  limit orders; a follower's own market impact beyond $1,000.
- Whether a result on these months would hold in another market regime.
- The reading budget of the weekly script (C8), until measured.
- Prediction-market fees and whether wallets there predict resolutions (B6).

## Questions, each with a recommendation

1. **Start the experiment's data at the cut, 2026-11-07T00:00Z, with its rules
   frozen before anyone reads those weeks, and reuse 2026-12-19 as its first
   look** (the exams have nothing registered)? *Recommendation: yes.* It gains
   about a month, and every week until the freeze is still unseen. Against it:
   one more thing to freeze before any outcome is read. The supervisor and
   owner rule; the plan subagent fixes it in the rules.
2. **Leave the 100 holdout accounts out of the experiment?** *Recommendation:
   yes.* D1 stays clean, at the cost of about 8% of the entries.
3. **The drop line δ:** the smallest net edge per copy worth having.
   *Recommendation: +10 bps a copy at a taker's costs* (about one round trip,
   so a gross of about two). It is yours to set before the start.
4. **Run it first as a weekly script** (the pool's fills read back, the kit's
   pricing extended past the cut, the collector's books beside), with v1's
   live paper log reusing it later? *Recommendation: yes.* It needs no app,
   covers many accounts and starts on data already recorded.
5. **The population:** the kit's pool only, or also the accounts that the
   collector's notional and account-value boards list up to the freeze?
   *Recommendation: the pool only* — the yardstick of every study, simple. The
   wider universe can be a later arm.
6. **Your own favourites:** a line beside, your list frozen at the start and
   judged whole, deciding nothing? *Recommendation: yes,* if you want to see
   your own choice measured. FIND-6 says not to expect it to differ.
7. [Final review, APPROACH-REVIEW, F1: new.] **The main line's minimum of
   closed cycles: 10 (FIND-3's rule) or 3 (R7's "thin evidence" line,
   decisions 2026-11-09, ruling 6)?**
   - The 10-cycle minimum mechanically removes most multi-day holders, who
     cannot close ten positions in 30 days: of the entries by traders whose
     usual hold is three days or more, 11 of 379 meet it (X1).
   - With 3, the main line holds ~284 entries a week from ~157 traders, 30% of
     them by day-holders (FR1, counts only), against ~131 from 61, and 17%.
   - Its smallest visible edge would be roughly 37 / 23 / 15 bps at the three
     looks *if* its copies were as noisy as X3's. That is not measured: the
     added holds are longer, so they are probably noisier.
   - *Recommendation: 3,* a threshold fixed before this review and chosen here
     by counts, never by results; the 10-cycle line printed beside, for
     comparability with FIND-3.
   - Against it: the usual hold of a trader with 3–9 closed cycles is a rougher
     estimate, and X3's noise does not describe it.

## Evidence list

**Saved outputs** (the supervisor folder `workers/APPROACH-REVIEW/`; SHA-256):

| File | What | SHA-256 |
|---|---|---|
| `out/x1/result.txt` | X1, counts and costs | `93e32e96…a146` |
| `out/x2/result.txt`, `out/x2/copies-x2.jsonl.gz` | X2 | `044d2d22…971f`, `aeab335c…c8bf` |
| `out/x3/result.txt`, `out/x3/copies-x3.jsonl.gz` | X3 | `4685f989…0294`, `2f4790fa…8a63` |
| `out/x4/result.txt` | X4 | `1fd9c51f…66c7` |
| `out/x5/result.txt` (run 2), `out/x5/result-run1.txt` | X5 | `80bb9b42…5483`, `9fa1ca60…4b94` |
| `scripts/common.mjs`, `x1-counts.mjs`, `x2-holdclass.mjs`, `x3-slow.mjs`, `x4-limits.mjs`, `x5-power.mjs` | the scripts | `5cd29ea8…`, `629c45b6…`, `eb7e7bd8…`, `f9c1f6c6…`, `04e90baf…`, `8e89c298…` |
| `scripts/lib-exits.mjs` | FIND-6-EXITS's library, copied byte for byte | `612d5836…6330` (its frozen value) |

**Inputs on F:** (read only): `FIND-6-EXITS\copies.jsonl.gz` `06a8125c…d18195`;
`FIND-6\look-entries.jsonl.gz` `db1d2a7d…68c5`; `FIND-3\population.jsonl.gz`
`fd34f29a…c63d`; `FIND-3\look\entries.jsonl.gz` `8278f544…9feb`;
`KIT\derived\pool-entries.jsonl.gz` `3f9c84ab…3f9f`, `pool-weeks.jsonl.gz`
`5a7dbae3…fa5f`, `pool-labels-cut.jsonl.gz` `58c25174…73f5`; the kit's panel
through `loadMarket` (pinned by its manifest). Every run printed the kit's
fingerprint `2d3667b5…09aa`.

**Web sources** (read 2026-11-12):
- ESMA, "ESMA agrees to prohibit binary options and restrict CFDs to protect
  retail investors", 27/03/2018, ESMA71-98-128 — https://www.esma.europa.eu/node/84933
- ESMA, Supervisory Briefing on copy trading, 30 March 2023, ESMA35-42-1428 —
  https://www.esma.europa.eu/sites/default/files/2023-03/ESMA35-42-1428_Supervisory_Briefing_on_Copy_Trading.pdf
  (and its press release, https://www.esma.europa.eu/press-news/esma-news/esma-provides-guidance-supervision-copy-trading-services)
- eToro, Popular Investor page — https://www.etoro.com/copytrader/popular-investor/
- Binance, "Lead Trader Benefits in Binance Futures Copy Trading" (updated
  2026-09-22) — https://www.binance.com/en/support/faq/lead-trader-benefits-in-binance-futures-copy-trading-ea9bacf82b9e4ddfae50ebc98565241b
- Apesteguia, Oechssler & Weidenholzer, "Copy trading", UPF Economics WP 1615
  (2018, revised 2019) — https://econ-papers.upf.edu/papers/1615.pdf; record
  https://econpapers.repec.org/RePEc:upf:upfgen:1615; Management Science
  66(12):5608–5622, 2020
- Dorfleitner et al., QREF 70:160–171, 2018 — https://ideas.repec.org/a/eee/quaeco/v70y2018icp160-171.html
- Frank, Poterba, Shackelford & Shoven, "Copycat Funds", NBER w8653 —
  https://nber.org/papers/w8653
- Verbeek & Wang, J. Banking & Finance 37(9):3454–3471, 2013 —
  https://ideas.repec.org/a/eee/jbfina/v37y2013i9p3454-3471.html
- Cohen, Malloy & Pomorski, "Decoding Inside Information", NBER w16454 —
  https://www.nber.org/papers/w16454
- Barber, Lee, Liu & Odean, J. Financial Markets 18:1–24, 2014 —
  https://ideas.repec.org/a/eee/finmar/v18y2014icp1-24.html
- Barras, Scaillet & Wermers, J. Finance 65(1):179–216, 2010 —
  https://ideas.repec.org/a/bla/jfinan/v65y2010i1p179-216.html
- Zhai, "Public Trader Identity: Adverse Selection and Return Predictability",
  arXiv 2608.04373 (v3, 2026-08-23) — https://arxiv.org/abs/2608.04373
- Not read (blocked): SSRN; the Heidelberg discussion-paper server.

**Our own reports used:** R3, R8, IDEAS-REVIEW, RESEARCH-KIT, FIND-1 to
FIND-10, FIND-REVIEW-A/B/C, FIND-6, FIND-REVIEW-6, FIND-6-EXITS, R2, R4, R5, R7
(`docs/reviews/`); polymarket-lab's `docs/claude-external-apis.md` (read only).
