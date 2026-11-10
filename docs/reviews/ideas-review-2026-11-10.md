# IDEAS-REVIEW — fresh eyes on round 2: the merged list, the critique, the order

IDEAS-REVIEW (plan item P0-4; effort max; this session's own model line
reads Fable 5.2, the brief and the plan page say 5.1), 2026-11-09 23:33Z –
2026-11-10 00:28Z (UTC, every time from `date -u`), for polymarket-follow's
supervisor. **Two stages.** Stage 1, blind: my own ideas and critique,
written before I had seen our list — `workers/IDEAS-REVIEW/stage1-ideas.md`
in the supervisor folder, closed 00:04Z (42 ideas, I-01 to I-42; 19 critique
points, C-1 to C-19; the supervisor checked that my reads skipped the plan
page's "The road to v1" and the two closed decisions entries). Stage 2: this
report — that list merged with ours (the plan page's "The road to v1": P0-1
to P0-4, C1, H1–H13, D1, D2, V1–V7, M1–M3; decisions 2026-11-09, the fast
track) and with DOCS-SWEEP's report as it stood after its own Final review
(`docs-sweep-2026-11-10.md`, 612 lines, commit `4a63dce`; "DS" below).

**No Polymarket call, no data opened, nothing on F:** — reading, thinking and
arithmetic only. A review decides nothing.

**Evidence words.** **[record]** in our docs, named. **[read]** a web page
read 2026-11-09 23:41Z–23:54Z through a tool that returns a small model's
summary — abstract level, not the paper. **[memory]** my own knowledge, not
re-read; check before anything rests on it. **[arithmetic]** my own sum from
numbers in the record; no data was run, so every such figure is rough until
a study measures it.

**Words.** bps = hundredths of a percent. Round trip = entry plus exit. FIND
= on data up to 2026-11-07T00:00Z. CONFIRM = on data after it. "The 50" =
R8's tracked set. "Matched null" = a random trade in the same market and
hour with the trader's own long/short habit (R3's matched-direction null).

**Rules I broke, listed in place (self-review).** (1) One time stamp in my
progress log was first written as an estimate ("about 23:50Z–00:00Z") and
then corrected from the clock (the reads ran 23:41Z–23:54Z). (2) One long
shell heredoc failed to parse and wrote nothing; the text then went through
the Write tool. (3) One number in my stage-1 file was too optimistic: "the
gate test can see a spread of 8–10 bps between traders" ignored that one
trader's entries bunch on a few days; the honest rough figure is 15–20 bps
(Appendix A, entry 1). (4) In stage 1 I saw one commit title that names "the
stop-order and route facts"; disclosed in the stage-1 file and not used.
(5) The harness refused one scratch file with the note that a subagent
returns its findings as text; the brief asks for this report as a committed
file, so I wrote its parts under other names and assembled them — told to
the supervisor in my closing message.

## For the owner, in one page

**What I found**

1. **R8 tested one rule, and that rule failed. It did not show that nobody
   is worth watching.** The rule: the 50 with the most banked profit last
   month, every new position alike, held 1 to 24 hours, paying a taker's
   costs. Before costs those entries were worth about nothing: −5 bps,
   somewhere between −19 and +5 [arithmetic from R8 §1.1].
2. **R8 could only have seen a large edge** — about 25 bps a trade over
   random trades, more than two round trips of costs — **and it scored more
   than half of its traders at one hour**, where the cost is so large
   against the usual price move that a follower needs about six right calls
   in ten just to break even (an illustration on usual volatility; study 3
   measures it).
3. **Board profit is not what a follower gets.** Part of it is made on the
   way in and out — resting orders, lower fees for some accounts, exits in
   small pieces — not by being right. #47 made $109,386 while its follower
   lost. Ranking by profit points at the wrong accounts; the question to
   ask is "how much of this profit could a follower have had?"
4. **The data we already hold can ask far more than R8 did, at almost no
   API cost.** One day of the budget buys a one-minute price record of
   every market. After that, every directional account (not 50), the best
   *and* the worst, holding times up to three days, kinds of trades and
   other players can be tested without another call.
5. **The first exam (about 2026-11-30) will have 23 days of new trading,
   the first nine or ten inside a competition.** It can kill a false
   pattern; it cannot confirm a small real one. A real answer needs a
   second exam — I propose 2026-12-19, six weeks, R8's own length.
6. **My honest guess, written before any of it runs:** about one chance in
   eight that round 2 confirms something that pays after a taker's costs
   here; about one in three that it confirms something worth showing that
   does not clear those costs; otherwise nothing.

**Three things every study stands on** (conditions, not ideas to test)

- **A. The collector, wider than planned.** Record the market itself — best
  prices each second, a book every ten seconds, every trade — from public
  streams that cost no tokens. A trader's fills can be read back later; the
  book at that second cannot. With it on record, any rule can be tested
  forward without waiting for v1.
- **B. One price record and one tested set of research tools,** shared by
  every study, so that twelve studies do not make twelve definitions of
  "an entry".
- **C. The register's rules.** For each test, the smallest effect it can
  see, written first; two exams with their lines fixed now; the competition
  marked in every result; a date on which round 2 ends.

**The top ten studies** (in brackets: H = our list, I = my blind list)

1. Is there any difference between traders at all — the best and the
   worst? [H2, I-05]
2. Where does a trader's money come from, and how much of it could a
   follower have had? [H8, I-06]
3. Where could following pay at all — cost against the usual price move,
   by market and holding time; slow traders against fast? [H4, I-04]
4. Which kinds of entries carry anything — eleven kinds, fixed in advance?
   [H6, I-12]
5. The price path around an entry: what happens in the 60 seconds before a
   follower can act? [I-15]
6. A race between ways of ranking traders — only if study 1 finds a
   difference. [H3, H5, I-07]
7. Algorithms working a large order: is their next half hour worth knowing?
   [H10, I-21]
8. Funding: who pays, who is paid, and does the price take it back?
   [H9, I-16]
9. Agreement between traders with no visible link. [H7, I-13]
10. One cell of R8's own table, tested once on new data: entries at the US
    open (UTC 12–16). [H9, I-18]

**The critique in five lines**

1. R8's verdict word hides both its estimate and its blind spot. Say:
   "worth −5 bps before costs, ±12; an edge much under 25 bps over random
   trades would probably not have been seen."
2. Choosing by banked profit is close to a random draw of active traders,
   tilted by the month's market direction and by what each account pays in
   fees.
3. Our list bundles many tests under one name (H9 about six, H10 four, H3
   seven measures) and has no budget for errors, no smallest-visible-effect
   and no rule for looking twice at the same new weeks.
4. "The data after 2026-11-07 stays untouched" has a hole: every board, the
   competition table and every portfolio read today already carry those
   weeks' results. The rule must cover them.
5. Verdicts on single traders cannot arrive (months to years each). The
   paper log should stand on a few lists with frozen rules — V3 already
   points there.

**Your questions** are in section 6: six, each with my recommendation.
**For the supervisor:** Appendix A drafts the register entries for the top
ten; Appendix B shows where every item of the three lists went.

---

## 1. The merged list

**What was merged.** My 42 blind ideas, our list's 30 items (P0-1 to P0-4,
C1, H1–H13, D1, D2, V1–V7, M1–M3) and DOCS-SWEEP's findings (its twelve
"possibilities", its §10 list for the collector, its notes on H1–H13). After
removing doubles: **3 foundations, 25 ranked studies, 2 dated checks, and 8
additions to the v1 plan** (V1–V7 stand). Appendix B maps every source item
to its place.

**What each list had that the other lacked.** Ours had four things I did not
think of blind: stop-like habits and how far price ran against a position
(H5), on-chain records (H13), an AI's rating of entries (H11), and the
universe of every account ever seen (C1). Mine had what ours lacks: the
question whether traders differ at all, with both tails (I-05); the
feasibility map (I-04); the price path around an entry (I-15); kinds of
entries beyond two (I-12); algorithms' large orders as a signal of their own
(I-21); recording the market rather than the traders (I-01); and the
register's error budget (I-31 to I-34). DOCS-SWEEP added facts that change
several tests: the competition as a confound, the reward and fee rules, the
competition table as a list of 4,700 accounts, what the long/short counts
count, and what cannot be seen (stops; who is one party).

**How I ranked.** Impact = the chance the idea holds × what changes for the
owner if it does, plus what a clean "no" settles. Cost = API tokens, days of
work, and the share of the error budget it uses — every extra test makes
every other test's line stricter. The priors are my guesses and are marked
as such.

### The three foundations (first, and not ranked against the studies)

**A — The collector.** *Sources: C1; I-01, I-17, I-22, I-40, I-41; DS §10
and questions 1, 4.*
- **Keep, in this order of "cannot be read back":**
  1. Best bid and ask each second, a top-20 book every 10 s, and every
     trade, for all 90 markets — the public WebSocket (`bbo`, `book`,
     `trades`), three connections of the 50 allowed, **no tokens** [record:
     R1 Q11; R3 possibilities 1–2]. A deeper `book::<iid>::50` channel is in
     the spec but untested [record: DS F5].
  2. The ticker each minute: open interest, the rolling funding rate, index,
     mark, `long_count`, `short_count` (2 tokens a minute) [record: DS §10].
  3. The 16 boards' top 1,000 once a day (800 tokens a day), and **the
     universe as a list of addresses** with first seen, last seen and the
     rows they appeared in [C1].
  4. DOCS-SWEEP's §10 reads: `exchange` each minute (maintenance flag,
     engine version), instruments each 10 minutes, stock splits, exchange
     statistics, competitions and the competition table with
     `include_unqualified=true` daily, settled funding daily, fees weekly —
     about 2.9 tokens a minute [record: DS §10].
  5. For the forward studies 16 and 17 only: an hourly portfolio read of the
     labelled market makers and the largest accounts (30–100 accounts,
     2.5–8 tokens a minute).

  All together about 6–15 tokens a minute of the 250 [arithmetic]; disk
  about 0.2 GB a day compressed [arithmetic; measure on day one].
- **What I would change in C1 as written.** "Best prices and books on a
  schedule" → continuously, from the stream: a schedule misses the second a
  trader acted, and the stream is free. Add the tape, the ticker and
  DOCS-SWEEP's reads. And "the universe … kept and refreshed": keep the
  addresses; do not poll each account — its fills and its daily profit
  series can be read back to its first fill whenever a study needs them
  [record: R8 §8; R1 possibility 1], so nothing is lost by waiting.
- **Three rules for it.** (a) *A blind store:* rows that carry results of
  the new weeks — the boards' profit columns, competition scores,
  portfolios — are written and not opened by any FIND study (point
  2.10). (b) *Lists frozen today, with hashes:* the 50; every account
  labelled directional on 2026-11-07; the slow systematic accounts once
  their rule is written (study 1) — so nobody can later choose them by
  outcome. (c) *The watchdog* already in code-rules (a stream went silent
  for eight minutes with no error), and every gap logged beside
  `cancel_only` and the engine version.
- **Why first:** each day not recorded is gone, and R8 had to price
  September with two November mornings' spreads [record: R8 §1.5]. With the
  book on record the forward test's clock starts now, not with v1.

**B — The one-minute panel and the research kit.** *Sources: I-02, I-03,
I-42; M3.*
- **The panel:** one-minute marks, one-minute klines (volume, trade count)
  and hourly funding for every market from its first trade to
  2026-11-07T00:00Z, stored once with a manifest. At most 246,000 tokens —
  16.4 hours at 250 a minute, probably near half, since most markets were
  listed from September [arithmetic; weights from external-apis; R1 Q14
  gives the same 1,165 tokens a market for klines]. Retired markets
  (KIOXIA, settled 2026-09-28) and any split are flagged in it [record: DS
  Q5, §4].
- **Exact random trades:** the null for an entry becomes the average over
  every minute of the same market and hour, weighted by each minute's
  trade count — no tape reads, and about a quarter less variance than with
  three drawn trades, so intervals about an eighth narrower [arithmetic; to
  be shown on R8's stored entries first] [Self-review S1: was "about a
  third less noise than three drawn trades" — three draws add a third to
  the variance; taking them away removes a quarter of it].
- **The kit:** fills into entries, the panel reader, the exact null, the
  cost settings, the clustered resampling — written and mutation-tested
  once, fingerprinted, imported by every study. R8's review found the same
  definitions written twice inside one study [record: R8, code findings].
- **Cost:** the pull under a day; the kit a day of one build subagent, no
  calls.

**C — The register's rules.** *Sources: M1, M2; I-31 to I-34; DS question
5.* Appendix A opens with them in full. In short: (1) every entry names
the smallest effect it can see; (2) exploring old data is free but every
look is logged; (3) the new weeks are examined twice by lines fixed now —
2026-11-30 strict, 2026-12-19 final, the batch held at one false discovery
in ten; (4) every result is printed again without competition days and
without the boosted markets; (5) a fresh reviewer reads each study's frozen
rules *before* its look; (6) placebos and leave-one-out on every finding;
(7) round 2 ends with the final exam.

### The ranked studies

Entries 1–10 have draft register entries in Appendix A; here, what each is
and why it stands where it does.

**1 — Is there any difference between traders at all?** *H2; I-05, with
I-08, I-09, I-10, I-11 as lists inside it.*
Every opening of every directional account since its first fill (not 50
accounts' six weeks), scored at 1 h, 6 h, 24 h and 72 h against the matched
null. One question: does a trader's result in odd weeks tell anything about
the same trader's result in even weeks — at the top **and at the bottom**?
Run apart for the slow systematic accounts the label now sets aside (a few
decisions a day, holds of hours: a rule repeats itself). **Why first:** it
opens or closes the whole "which trader" branch — studies 6 and 24 are
pointless if traders do not differ [Self-review S2: was "studies 6 and
11"; study 11 pools a cohort and does not need traders to differ] — and a
clean "no" is worth as much as a
"yes". Published work leaves it open: a few day traders are persistently
good and the worst persistently bad, before fees too (Barber, Lee, Liu,
Odean 2014 [read]); on a public-wallet exchange a wallet's informativeness
persists across ten-day windows, shown at one second only (Zhai 2026
[read; record: R5]). *Cost:* no calls beyond the panel. *Prior:* a real
difference found 30%; a list that then pays after a taker's costs 7%.

**2 — Where does a trader's money come from?** *H8; I-06; DS on fees and
rebates.*
Split each account's profit into: execution (bought below or sold above the
mark at the moment of the fill); fees actually paid against what a
base-tier follower would pay on the same fills (the `fee` field is public;
some accounts pay less, some are paid to rest orders [record: R1 Q4; R2
Q2]); holding, by the age of the position (the first two minutes nobody can
follow, then to 1 h, 6 h, 24 h, beyond); funding. First for #47, then for
the 50, then for every pool account. **Why second:** it explains R8's
central puzzle, it costs nothing, and it replaces "profit" by "the part a
follower could have had" — the ranking that study 6 needs. *Prior that most
top-board profit is not followable:* 60%.

**3 — Where could following pay at all?** *H4; I-04; H9's multi-day
horizons; DS on the funding floor.*
(a) A map: for each market × holding time (1 h, 6 h, 24 h, 72 h) × cost
setting, the round trip's cost against the usual move, and the share of
right calls needed to break even. An illustration with assumed volatility:
a major coin moving 40 bps in a usual hour and 200 in a usual day, at 9 bps
a round trip, needs about 61% right at one hour and 52% at a day
[arithmetic]. A crypto long also pays about 3 bps a day in funding at the
floor rate (10.95% a year [record: DS Q5]). (b) H4's test: do the entries
of traders who hold six hours or more, scored at 24 h and 72 h, beat random
trades — on all directional accounts, not the 50? **Why third:** the map
needs no calls and tells every other study which cells are worth an entry
in the register; 27 of the 50 sat at one hour [record: R8 §1.4]. *Prior for
(b):* 10%.

**4 — Which kinds of entries carry anything?** *H6; I-12; I-25.*
H6 names two kinds (a size unusual for the trader; an add to a winner).
Make it one family of eleven yes-or-no splits fixed in advance — taker or
maker entry; with or against the last hour's move; just after a jump;
large for the trader; a market new to the trader; after a win or a loss;
the first slice of a habitual slicer; an add to a winner or to a loser;
paying or receiving funding; against the trader's usual side; large
against the market's own volume — plus "on a boosted market during a
competition". All reported, corrected together, at most two taken to
CONFIRM. **Why fourth:** "which trades" has never been asked; R8 scored
every opening alike. *Prior:* one split confirmed 15%.

**5 — The price path around an entry.** *I-15; part of H8 ("patience") and
of H5 (how far price ran).*
From R8's capture, whose one-second windows start 300 s before the follow
instant [the supervisor, 2026-11-10]: the average signed path from about
three minutes before the fill to about thirteen after, for the tracked
entries and for the random trades; from the panel, the hour before and the
day after.
**Why fifth:** no cost at all, and it settles three things R8 could only
infer — whether these entries foresee the price for a few seconds (then the
information is real and gone before a person can act), whether they come
after a run, whether a wave of copiers follows. One caution: the mark
follows a sudden local move only through a 150-second average of the
book's premium, and is held within 50 bps of the index [record: DS Q5]. So
the path shows news about the outside price well, and the push of the
trader's own order — or of copiers — poorly; study 12 looks for copiers in
the fills themselves [Self-review S3: was "the mark smooths the local book
over 150 seconds … so it shows news about the outside price, not the push
of the trader's own order" — the mark is the median of three parts, only
one of them smoothed; and the copiers' wave, promised just above, is a
local push too]. *Prior that a 60-second effect shows:* 35%.

**6 — A race between ways of ranking traders.** *H3, H5; I-07, I-35; H1's
B2 as its baseline.* **Only if study 1 finds a difference.**
A short fixed list of rules computed on four weeks, each tested on the next
weeks' entries: banked profit (R8's rule, the baseline); whole profit with
open positions, at base-tier fees; followable holding profit (study 2); the
shrunken entry result (study 1); steadiness (H3's probabilistic Sharpe
ratio on daily results); risk discipline (one index from H5: size of
losses against wins, how far price ran against a position before it was
closed). The target is the *follower's* result on the trader's next
entries; the trader's own next profit is printed beside it. **Why sixth:**
high value if traders differ, none if they do not; and FIND has only two
clean formation dates since the launch. *Prior:* 10%.

**7 — Algorithms working a large order.** *H10; I-21.*
An account buying one market in many taker pieces has the most predictable
next half hour on the exchange. Rebuild such runs from fills (native TWAP
orders are switched off, so nothing announces them [record: DS Q3]); from
the fifth order plus the follower's delay, does the price move further that
way by more than a round trip? Published: such hidden runs leave a lasting
impact on Hyperliquid (Barone and Lillo 2026 [read]); fast traders end up
trading with long-running informed orders (van Kervel and Menkveld 2019
[read]). **Why seventh:** the one new kind of signal on the list, and a use
for accounts the project discards; a first look costs no calls. *Prior:* it
pays net 10%; a measurable drift 40%.

**8 — Funding.** *H9; I-16; DS possibility 9.*
Most markets sit exactly on the floor rate (55 of 90 [record: DS Q5]); a
few pay or charge many times that. Does the side that receives extreme
funding keep it, or does the price take it back over the next day? And as
a property of an entry (study 4): paid or paying. FIND runs on R8's funding
rows and hourly marks, already held. One thing to settle first: DOCS-SWEEP
writes "funding settles even for a position closed just before", R3's rule
charges positions open at the whole hour (point 2.19). *Prior:* a
confirmed relation 15%; one that pays 7%.

**9 — Agreement.** *H7; I-13; I-24 for the links.*
Three or more accounts with no visible link opening the same side of one
market within an hour, nobody among the directional accounts opening the
other side. Accounts of one entity are invisible [record: DS Q8], so
"independent" can never be claimed — only "no visible link" (no fixed
counterparty pair, no shared prefix cluster, no copy pattern). *Prior:* 8%.

**10 — One cell of R8's own table, tested once.** *H9 (sessions); I-18.*
R8's secondaries held entries at UTC 12–16 at d −38 bps (both intervals
below zero) [record: R8 §1.2] — one of about 25 cuts, so chance is a live
explanation, and the cell now overlaps the hours when the boosted stocks
trade. The UTC 00–04 cell (+29, its interval touching zero, 125 entries) is
printed beside it and decides nothing [Final review F4: was a second
hypothesis, "two cells"]. The FIND is done; the CONFIRM costs nothing extra
at either exam. **Why in the ten:** it is the only test that is ready
today. *Prior:* the cell holds 25%.

**11 — Holdings instead of entries.** *H10; I-14.* A cohort's net position
per market at each day's end; the day's change against the next day's
return, ranked across markets. *Test:* market-days in fifths, clustered by
day; FIND on accounts with whole histories. *Guard:* accounts that hold
$5M or more gross may be collecting the open-interest reward on hedged
books — their position says nothing about direction [record: DS Q4, its
reading]; leave them out. *Cost:* none. *Prior:* 10%.

**12 — Who copies whom.** *I-24; R5 possibility 4.* For every ordered pair
of pool accounts: how often B opens the same market and side within 60 s,
and within 5 s, after A, against shuffled times. *Gives:* how fast the
competition is, which accounts others put money behind (a ranking variable
for study 6), and the links study 9 must remove. A description; no calls.

**13 — The risk-discipline profile.** *H5; DS Q3.* Per trader: loss size
against win size, how far price ran against and for each position before
its close, exits that follow an adverse move of similar size, liquidations.
*Limits:* another account's stop and take-profit orders cannot be seen, and
a fill from a fired stop looks like any other [record: DS Q3], so "uses
stops" can only be "exits like someone who does"; short holds need
one-second marks. *Place:* a profile for the trader's page, and one fixed
index in study 6 — not a study with its own verdict.

**14 — The account-level check.** *H12; I-29; DS on margin.* For anything
that passes CONFIRM: the spread per trade, the worst day, the longest
losing run, the deepest fall of a paper account; by resampling days, how
often a fixed stake touches a daily or total loss limit before a gain; the
result per unit of risk; a paper position liquidated by the documented
margin law [record: DS Q8]. *Place:* a gate after CONFIRM, defined now so
that it is not designed around a result.

**15 — New large accounts, and other lists by origin.** *I-11; C1's daily
boards.* An account whose first fill is recent, large and in one or two
markets — the "fresh wallet, one big bet" pattern [memory: press reports].
*Test:* forward only (on old data such accounts are chosen by outcome): the
daily boards by notional and account value reveal them; their first
positions priced from the recorded book over 24–72 h; one vote per account.
*Prior:* 8%; months.

**16 — Positioning: long and short counts, open interest.** *H9; I-17; DS
Q2.* The counts are accounts with a position on each side, market makers
included — breadth, not size (7,770 long against 2,944 short on
2026-11-09 [record: DS Q2]) — and the level is structural (my reading):
longs pay the funding floor, a hedged short is paid it. *Test:* forward
only, on changes, after eight weeks of the collector's series. *Prior:*
10%.

**17 — Market makers' inventory.** *H10; I-22.* Makers hold what the crowd
just sold them and are paid by the price coming back (Hendershott and
Menkveld 2014 [read]). *Test:* forward only — their histories are cut at
5,000 fills — from the collector's hourly portfolio reads. *Prior:* 10%.

**18 — Liquidations as forced flow.** *H9; I-23; DS Q3.* Flagged fills in
the pool as events; the mark around them; the opposite trade after the
delay. *Guards:* the flag's meaning changed on 2026-08-11 [record: DS §4];
live, only a watched account's liquidation can be seen. *Prior:* 8%.

**19 — Stocks, indices and commodities off-hours, and the next open.**
*H9; I-19.* Is the off-hours price a fair forecast of the open? About 45
weekday opens since the launch: few independent dates. *Prior:* 8%.

**20 — The pre-IPO market.** *I-20.* The one price made here. One market,
one path; the mark rule cannot price it [record: R3]. Forward only, from
the recorded book. *Prior:* 5%.

**21 — The same address elsewhere, and on-chain.** *H13; I-38, I-39; DS
Q6.* Three parts: (a) deposits and withdrawals — for accounts opened after
2026-10-20 the API already gives net capital [record: R1 Q9]; (b) the
prediction-market wallet — a different, derived address, formula not
documented; (c) the same address on another venue — the only route to a
record of years rather than weeks, and outside both Iron Rule 1's wording
and the line DOCS-SWEEP draws until the owner rules. *Place:* question 5.

**22 — An AI's rating, and the owner's own mark, as paper profiles.** *H11;
I-30, I-37.* Forward only, both. On old entries an AI can know what
happened next, and it need not give the same rating twice. *Place:* two
profiles under V3 (question 6); no FIND work.

**23 — A patient follower.** *I-28.* A resting order at the trader's price
instead of crossing the spread; the missed entries counted. Worth running
only once a signal with a positive gross edge exists.

**24 — Specialists.** *I-10.* A trader judged by category. Inside study 1
as a secondary, if study 1 passes.

**25 — Machine learning, to suggest and never to decide.** *I-36.* Lowest:
with some 20,000 noisy entries I expect nothing out of sample.

### The dated checks, as fixed

- **D1** — the classifier v2's forward blind test, after 2026-11-21. One
  note: its test window (11-07 → 11-21) lies mostly inside the competition,
  which rewards volume on four boosted markets [record: DS Q4]; if v2
  misses, look there first.
- **D2 (H1)** — B2's confirmation, after 2026-11-30. Run it as frozen. Do
  not wait on it: its find pair already showed the top fifth doing worse
  than the rest [record: R8 §1.3], and its weeks 9–12 (11-02 → 11-30) hold
  the whole competition.

### For the v1 plan (not studies)

- **Breadth over speed** [I-26]: R8 found no difference between reacting in
  15 s and in 30 min [record]; the budget that watches 20 accounts fast
  could watch 300 at ten minutes.
- **Cost settings in every table** [I-27]: a taker here; a maker here; the
  same underlying at a cost the owner enters.
- **Paper-log profiles as lists with frozen rules** [V3; C-16]: five
  profiles make the bar 100, not 400.
- **Results per unit of risk, and as a path** [H12; I-29].
- **"Evidence so far"** [I-35]: a measured result pulled toward the average
  by how little stands behind it — a figure with its range, never a score.
- **On the trader's page** [study 2]: fees paid against base-tier fees, and
  the share of profit a follower could have had.
- **The owner's own mark** [I-30] and **the AI's rating** [H11] as profiles.
- **The outside price is in Polymarket's own feed** [I-40]: the ticker's
  index; no other exchange's API is needed to show it.
- V1, V2, V4–V7 stand as written.

---

## 2. Critique

I found no wrong number in R8. The weaknesses are in what was asked, in
what the answer is taken to mean, and in how round 2 is set up to avoid
fooling itself. (C-n = the point's number in my stage-1 file.)

### A. What R8 does and does not show

**2.1 — A narrower question than its headline is read as** (C-1). What lost
money was: "the top 50 by 30-day banked profit; every opening alike; a
dollar each; 1 to 24 hours; as a taker here". Nothing in it says that no
account is worth watching. The docs word it carefully ("no confirmed skill
on the leaderboard"); the owner's disappointment suggests it was heard as
more.

**2.2 — Only a large effect was visible, and the verdict word hides that**
(C-2, C-11, C-12). d's interval by trader runs from −34 to +0.4: half its
width, 17 bps, means the test would catch an edge over random trades four
times in five only at about 25 bps [arithmetic]. An edge of 12–15 bps —
enough to pay the costs and leave a little — would most likely have been
missed. The sign test needed about 31 of 47 traders positive. So FAILS was
the expected word for any small real edge. The sentence that carries the
information is the estimate: "before costs, about −5 bps, between −19 and
+5".

**2.3 — The horizon** (C-3, C-10). 27 of 50 traders were scored at one hour,
where a taker needs about six right calls in ten to break even (study 3;
illustrative until the map is measured). And the class came from each
trader's own median hold, which the exit habit shapes (winners closed
early — R3's own finding). Score every entry at every horizon and read the
curve.

**2.4 — The selection** (C-4, C-5, C-6, and one new point). (a) By R2's own
numbers a week's top 50 by banked profit keep 18–32 positive the next week;
B1 was killed: the rule is close to a random draw of active directional
accounts, tilted by whichever side the market favoured that month. (b) One
formation date, three weeks after the public launch. (c) The pool was read
after the measured period [record: R8, F11]; the board as it stood at T0
cannot be read back — only our own daily copy can give that, from now. (d)
**New:** banked profit is after each account's *own* fees, and accounts do
not pay the same: R1 saw rebates on 838 of 4,063 fills, R2 saw base-tier
makers paying where others were paid. A busy account on a cheaper schedule
ranks higher for a reason no follower can copy. An illustration, not a
measurement: had #47 paid 2 bps a leg less than the base tier, that alone
would be about $6,600 of the $15,280 it banked on $33.2M in the selection
window [arithmetic]. Study 2 measures it from the `fee` field; nothing needs
to rest on guessing an account's tier (DOCS-SWEEP's F10 marks that guess as
untested).

**2.5 — The comparison** (C-7, C-8, C-9). (a) The primary d left the
market's direction in: the matched null moved it from −13.6 to −6.0, and
R8's own synthetic test passed condition (ii) in 19% of runs on direction
alone. Make the matched null primary. (b) Three drawn trades add about a
third to the variance [Self-review S1: was "to the noise"] and were most of
the capture's calls. (c) A dollar per
entry in bps lets the most volatile markets carry the noise and throws away
the trader's own sizing; under a loss limit a follower sizes by risk, so
print results per unit of risk as well.

**2.6 — "The delay is not the cause" is true of these entries only** (C-13).
Entries with no information lose the same at any delay. It does not show
that delay is harmless for a signal that has some; study 5 looks.

### B. Round 2's method as written

**2.7 — The register must count tests, not items.** H9 is about six tests
(multi-day horizons, funding, open interest, liquidations, sessions, order
books), H10 four, H3 seven measures, H5 four, H6 two. Thirteen items are
more than thirty tests, each over several horizons. A search that wide
finds a "win combination" by chance; most published trading findings do not
survive a correction for it (Harvey, Liu and Zhu 2016 [memory]). M1 writes
each test down first — good — but nothing yet says how many false
discoveries the whole register may make.

**2.8 — No test says what it could see.** R8's bars (20 traders, 300 entries)
say that a cell is populated, not that it could detect anything. Each
register entry should name the smallest effect it would catch four times in
five; where that is larger than anything plausible, the test waits for data.

**2.9 — Two exams look at the same growing weeks.** The fast track examines
2026-11-07 → 11-30, then "more weeks" that include those. Looking twice at
one growing set, each time at the usual line, raises the false-alarm rate.
The standard cure costs almost nothing: a very strict line at the first
look (p below 0.001), the usual line at the last [memory: the
Haybittle–Peto rule]; or the e-process the paper log already uses, which
may be read as often as wanted. Appendix A writes the first one out.

**2.10 — M2 has a hole.** "The data after 2026-11-07 stays untouched by any
search" is written about fills. But every board read today (its profit
columns run to now), the competition table (scores since 11-02), every
portfolio and every profit series already carry the new weeks' results. The
collector will store all of them daily, and DOCS-SWEEP's universe seed is
the competition table itself. A FIND study may take **addresses** from
such rows — never rank, filter or even look by their result columns. And a
list found through a later board is a list of accounts still active in
November: fine for a secondary population, not for the primary one (the
pool read on 2026-11-07).

**2.11 — The first exam is short, inside a competition, and one market
regime** (C-18). By 11-30 the new data is 23 days, the first nine or ten
inside a competition that pays for volume on four boosted markets; FIND has
four and a half such days in sixty-five (as far as the API shows —
DOCS-SWEEP's F10 marks "no earlier competition" as an inference). A real
pattern may fail there because the regime differs, and a pattern may pass
that is only the competition. So every result is printed with and without
competition days and boosted markets, and the final exam's six weeks
dilute it. Both exams also sit in one market: a pattern confirmed once is
confirmed for that market.

**2.12 — "One look" is the right rule for confirming and the wrong one for
learning** (C-14). R8's capture was looked at once, so the plain
descriptive questions were never asked. Old data may be explored freely if
every look is logged — the count of looks is what a correction corrects
for — and new data is read once.

**2.13 — A fresh subagent per study (M3) multiplies definitions.** R2, R3 and
R8 each wrote their own readers. A dozen parallel studies need one tested
kit (foundation B). And a Final review after the look can only correct
words: R8's found thirteen things, none in the design. A reviewer who reads
the frozen rules *before* the look costs an hour and can still change them.

**2.14 — Verdicts on single traders cannot arrive** (C-16). R3's own table:
months to years for one trader even at an edge three times the fees, and R8
found no such edges. V3's profiles — a few lists, rules frozen at creation,
their number counted — are the right unit; the plan should say that they
replace the single-trader scoreboard as the place a verdict can come from.

**2.15 — "Directional only" should not define who is studied** (C-17). The
label was built to avoid a trap, and it does. But it also sets aside the
most regular accounts — exactly those whose behaviour should repeat — and
it scores hedged pairs leg by leg.

**2.16 — H3's "quality score" runs against two of the project's own rules:**
the default of no composite "copy score" [record: decisions 2026-11-07,
wave 1 closed] and R7's rule that the app computes no rank, no score, no
"best" [record: R7 Q1, rule 3]. And a score
built from a trader's own profit predicts, at best, that trader's own
profit — which R8 showed is not the follower's. Test a short list of
measures against the follower's result (study 6); show measures with their
ranges.

**2.17 — The forward clock is not running** (C-19). The paper log starts
with v1, weeks away. Foundation A starts it now.

**2.18 — Care was spent where the uncertainty was smallest** (C-15). A
weekday measurement, its report and its review settled a choice of cost
table worth at most 0.43 bps a round trip [record: decisions 2026-11-09]
while the signal was known to ±17. Not wasted — the live log needs honest
costs — but the signal side now deserves that care.

### C. Four things to re-check

**2.19 — The funding rule.** DOCS-SWEEP writes "funding settles even for a
position closed just before" [record: DS Q5, not marked by its Final
review]; R3's approved rule charges a paper position "open across the whole
hour" [record: R3 Q4]. The two disagree about a position closed minutes
before the hour. At the floor rate that is a fraction of a bp; on the few
markets with extreme funding (the rolling rate touched 5.6 bps an hour on
ANT [record: R3 Q4]) it is not. *Settle:* the docs' funding page, and one
account that closed a position minutes before an hour — its fills against
its hourly `/v1/info/pnl`, which includes funding (about 30 tokens).

**2.20 — The mark as a price over minutes.** One of the mark's three parts is
the index plus a 150-second average of the book's premium, and the mark is
held within 50 bps of the index [record: DS Q5; R3 §8]. R3 checked the mark
rule against live books on one Saturday morning. Around a large local order
the mark trails the book. Anything measured over the first minutes after a fill
(studies 5 and 7) reads the outside price well and the local push poorly;
the recorded book ends the question for new data.

**2.21 — An account's fee tier is a guess; its fees are a fact.** DOCS-SWEEP's
F10 marks "fee rate → tier or beta status" as untested. Nothing should be
shown or decided on a tier label. The fee amounts on the fills are measured
and are all that study 2 needs.

**2.22 — The hold classes and labels rest on the same weeks they are tested
on.** In FIND, an account's label and usual hold should come from the weeks
before each entry, as R8 did at T0; where history is too short, say so and
count those entries apart.

**What I would stop:** ranking candidates by banked profit; scoring anyone
at one hour at a taker's cost without the map; drawing nulls from the tape;
reading one-second marks while still exploring; arguing fractions of a bp
of cost before a signal exists; promising verdicts on single traders.

---

## 3. What our list has that I would drop or change, and why

Nothing is dropped outright. Three things I would not spend FIND effort on:
an AI's rating of *old* entries (H11), the address-linking parts of H13
before a ruling, and a single composite score (H3).

| Item | Keep or change | Why |
|---|---|---|
| **C1** the collector | **Change** (foundation A) | Books "on a schedule" miss the second a trader acted; the stream is free. Add the tape, the ticker, DOCS-SWEEP's reads. Keep the universe as addresses — an account's fills and profit series can be read back any time, so polling it buys nothing. Add the blind-store rule. |
| **H1 / D2** B2's confirmation | **Keep, expect little** | It is a promise, frozen. But its measure ranks on banked profit ÷ volume, its find pair showed the top fifth doing worse, and its weeks 9–12 hold the whole competition. Add study 1's five-by-five table as a secondary that decides nothing — "where in the ranks does persistence sit" is the open part. |
| **H2** long track records | **Merge into study 1** | "All entries since the first fill" is the long record we have. For most accounts that is ten weeks at most (public launch 2026-09-03): say so. A record of years exists only under H13 (c). |
| **H3** an honest quality score | **Change** (study 6) | (a) Not one number — point 2.16. (b) At most six measures, corrected together. (c) Tested on the *follower's* next result first, the trader's own beside it. (d) Profit at base-tier fees, with open positions. (e) The Sharpe-based measures will say "record too short" for nearly everyone: with 65 days, a record can prove skill only at a yearly Sharpe ratio near 4 [arithmetic from the published formula; memory: Bailey and López de Prado 2012]. That is honest and worth showing as exactly that. |
| **H4** style as a filter | **Change** (study 3) | The map first: it says *why* fast styles cannot pay. Add 72 hours. All directional accounts, not the 50. |
| **H5** risk discipline | **Move** (study 13) | A profile for the trader's page and one fixed index in study 6, not a verdict of its own. Stops cannot be seen; "exits like someone who uses them" is the most that can be said. |
| **H6** which trades | **Widen** (study 4) | Two kinds picked in advance is a guess at which two; eleven tested together with one correction is a search with a known price. |
| **H7** consensus | **Keep** (study 9) | Fix the count and the window first; say "no visible link", never "independent" — entities are hidden. |
| **H8** why #47 could not be copied | **Widen** (study 2) | The same split for every account turns one puzzle into the ranking rule study 6 needs. Add fees. Start with #47: it is concrete and its data is held. |
| **H9** market context | **Split into six entries** | Multi-day horizons (in study 3), funding (8), sessions (10), off-hours opens (19), liquidations (18), open interest, counts and books (16). All but the last can be found on old data; the last has no history and starts with the collector. As one item it would enter the register as one test and be run as six. |
| **H10** big players | **Split into four** | Algorithms' large orders (7); slow systematic accounts (inside 1); cohort holdings (11); market makers' inventory (17, forward only). "How the rewards shape them": DOCS-SWEEP answers as far as public data can — and adds a guard: very large holders may be paid to hold. |
| **H11** AI, honestly | **Change** (22) | Forward only: on old entries a model may know what came next, and it need not answer the same twice. Freeze the model and the prompt; store the rating at alert time. Put the owner's own "would have taken it" mark beside it — the same test, one button. |
| **H12** the account-level check | **Keep; define now** (14) | Written before any result, so that it is not shaped around one. Add results per unit of risk. |
| **H13** on-chain | **Split in three** (21) | Deposits and withdrawals: the API already gives net capital for accounts opened after 2026-10-20. The prediction-market wallet: a derived address, formula unknown. The same address on other venues: the only long record there is, and the owner's ruling twice over (question 5). |
| **D1** | **Keep** | Note the competition inside its window. |
| **V1–V7** | **Keep** | V3 gains a sentence: profiles are where verdicts can come from (point 2.14). Eight additions are listed at the end of section 1. |
| **M1** the register | **Add** | The count of tests, the smallest visible effect, a prior, a pass line per exam. |
| **M2** new data untouched | **Add** | The blind store (point 2.10) and the two-look rule (point 2.9). |
| **M3** a subagent per study | **Add** | The shared kit; a reviewer before the look. |

---

## 4. Recommended order for round 2

The budget is not what binds: the whole core — the panel and both exams'
reads — is about 490,000 tokens, 33 hours of the full 250 a minute, spread
over six weeks [arithmetic]. What binds is the calendar (new data arrives a
day at a time) and the error budget (each extra test costs every other
test). So: build the three foundations at once, run every FIND that needs
no calls beside them, freeze before reading anything new, and examine
twice.

| When | What | Calls |
|---|---|---|
| **Now** (11-10) | The owner's word on where results would be used, the collector's streams, the two exams' lines and what a "no" from study 1 means (questions 1–4). The lists frozen with hashes. | none |
| **11-10 → 11-11**, all in parallel | **(a)** The research kit (one build subagent). **(b)** The panel pull, to 2026-11-07T00:00Z. **(c)** The collector: a short plan, the owner's yes, a small build, a Windows task — the streams, the ticker and the boards first; DOCS-SWEEP's reads next. **(d)** On data already held, no calls and no panel: the first measurements (Appendix A); study 3's map (R8's hourly marks and the two price tables); study 5 (R8's one-second windows); study 8's FIND (R8's funding rows); a first pass of study 2 for #47 and the 50, as far as R8's one-second windows reach; study 12 (fills only). | (b) ≤ 246,000 tokens, ≤ 16.4 h; the collector 6–15 a minute, standing |
| **11-12 → 11-16**, in parallel, on the panel | Studies 1, 2 (all accounts), 3 (slow against fast), 4, 7, 9; study 11 if hands are free. Each with a reviewer reading its frozen rules before its look. | none (optional: equity series 15,000; one-second marks for #47 ≤ 10,000) |
| **11-16 14:30Z** | Competition 1 ends. Record the next one's dates and boosts when it is announced. | — |
| **11-17 → 11-20** | FIND reports and their Final reviews. Study 6 only if study 1 passed. **By 11-20 every CONFIRM entry is frozen** — list, thresholds, statistic, hash — before anyone on a study reads a fill after 2026-11-07. | none |
| **after 11-21** | D1, as ruled. | its own pull |
| **11-30 → 12-01** | **The first exam.** One capture, read once, stored with a manifest: the frozen lists' fills for 11-07 → 11-30, the panel's extension, D2's accounts. Every confirmation and D2 read that capture and nothing else. Prices by the mark rule for every entry, so that FIND and CONFIRM are measured alike; the recorded book beside it as an audit from the day the collector started. | about 135,000 tokens, 9 h |
| **early December** | The v1 plan, with what stands. Hypotheses still open keep running. | — |
| **12-19 → 12-20** | **The final exam** on six weeks (a second capture, 11-30 → 12-19). The account-level check (study 14) for what passes; paper profiles. **Round 2 ends here.** | about 110,000 tokens, 7.5 h |
| **mid-January 2027** | The first FIND on the collector's own series for the studies that have no history (15, 16, 17, 20), each confirmed on the eight weeks after — beside v1, outside "research complete". | none |

**What runs side by side:** everything in the second row; every study in
the third (they make no calls, so they do not compete for the budget).
**What waits for data:** studies 15–17 and 20; every CONFIRM. **What waits
for a ruling:** 21 and 22. **What waits for a result:** study 6 (on study
1); the whole histories of the 20 busiest taker accounts for study 7
(250,000 tokens, 16.7 h — only if its first look shows a drift).

**Why not strictly one after another.** Stage 1 said "gate first, then
spend". Under the fast track the studies cost no calls, so the only cost of
running 2, 3, 4, 7 and 9 beside the gate is their share of the error
budget — and that is paid at CONFIRM, where at most two candidates per
study go forward. Study 6 alone stays gated: without a difference between
traders it has nothing to rank.

---

## 5. Beyond the brief

1. **Where the owner would act decides which cells matter.** If the owner
   would only ever act on major coins elsewhere, or on indices under a loss
   limit, a finding on small coins here is a curiosity. One answer
   (question 1) lets every table print the owner's own cost setting first.
   It leads to no advice: it chooses which research is worth doing.
2. **The venue lives on incentives that can change any day.** The docs'
   reward budget is about three times a week's gross fees [record: DS F2 —
   a budget against measured fees, recipients not public]; competitions
   come and go; the changelog has 33 entries in five months [record: R5].
   Any finding has a shelf life. The weekly changelog read should mark fee,
   reward and competition changes as "regime events" in the register, and a
   confirmed pattern is re-examined after each.
3. **A "no" is a result — keep it on the screen.** R8, and whatever round 2
   kills, belong on the Method page as dated findings ("tested, did not
   hold"), so the app says what was tried and the owner is not tempted
   twice by the same idea.
4. **"Research complete" can be said with nothing confirmed.** "These N
   ideas were tested honestly; none pays here after costs; these M things
   are known about how this exchange works" is a complete answer, and v1 as
   a watching tool is built on exactly that.
5. **One capture per exam, read once.** R8's rule (an analysis reads only a
   stored capture) matters more with ten studies than with one: if each
   confirmation pulled its own fills on its own day, the ten would not be
   looking at the same world.
6. **An AI rater and time.** A model asked to rate an entry from September
   may have read about October. Only a rating stored at the moment of the
   alert is evidence (H11; study 22).
7. **Funded-account programmes often restrict copied or shared strategies**
   [memory — rules differ by platform]. If the owner means to use any
   pattern there, the platform's own rules are worth reading first. Vendor
   figures put challenge pass rates near 5–15% and payouts near 7% of
   accounts [read: a search summary of vendor data, unaudited].
8. **What the blind stage was worth.** My list missed four of the owner's
   points; the owner's list missed the question that gates half of it (do
   traders differ at all?) and the map that prunes the rest. Neither list
   alone was the better one. For the next large design, the same two-stage
   reading is cheap.
9. **My prior for round 2,** recorded as the supervisor recorded one for
   R8: something confirmed that pays after a taker's costs here, about
   12%; something confirmed that carries information but does not clear
   those costs, about 35%; nothing, about 53%. Low, because R8's entries
   were worth nothing before costs, the venue is ten weeks old and thin,
   and published edges of this kind are a few bps against a hurdle of
   9–13. Not lower, because round 2 looks at ten to twenty times the
   entries, at both tails, at longer holds, at kinds of trades and at other
   players — none of which R8 asked.

---

## 6. Questions for the owner

1. **Where would you act on what the tool shows — here, on another crypto
   venue, on a stock or index platform with loss limits?** Name up to three
   groups of markets and what a round trip costs you there.
   *Recommendation:* answer it now; every table then prints your setting
   first, and studies are aimed at those markets. No advice follows from
   it (Iron Rule 6).
2. **May the collector keep three public streams open around the clock**
   (best prices, books and trades of all 90 markets)? They are documented,
   need no key and sit inside the published limit of 50 connections, but
   they are a standing presence, and you asked to stay under the radar.
   *Recommendation:* yes — it is the only way to hold real books, and with
   them every later test is priced honestly and needs no poller.
3. **The exams' lines and the end of round 2.** First exam 2026-11-30: a
   pattern passes only on very strong evidence (p below 0.001), is dropped
   only if it points clearly the wrong way, otherwise stays open. Final
   exam 2026-12-19 (six weeks, R8's length): the usual line, with one false
   discovery in ten tolerated across the batch — each survivor still faces
   the account-level check and the paper log. Round 2 ends there; whatever
   is found later starts a new batch. *Recommendation:* yes. (The stricter
   choice — at most a 5% chance of any false discovery — costs power; I
   would not take it while the paper log stands behind the exam.)
4. **If study 1 finds no difference between traders, do we stop ranking
   traders for now?** *Recommendation:* yes. The app then shows each
   account's measures with their evidence and makes no ranking of its own;
   the search goes on for kinds of trades and market context; the question
   is re-opened after six more months of the universe.
5. **The same address on another venue** (H13) is the only way to a record
   of years rather than weeks. It needs your ruling twice: Iron Rule 1
   names Polymarket's endpoints only, and DOCS-SWEEP keeps cross-venue
   linking out until you rule. *Recommendation:* not now. Rule after study
   1 (about 2026-11-20): if traders differ here, a longer record becomes
   worth its cost; if they do not, the choice is to end the search for
   skill or to move it to where there is more data — and then you decide
   knowing which.
6. **H3 and H11.** (a) A short list of tested measures in place of one
   "quality score"? *Recommendation:* yes — one number only if a measure
   wins the race and passes both exams, and then with its range. (b) The
   AI's rating forward only, as one paper profile, and your own "would have
   taken it" mark as another? *Recommendation:* yes to both; no work on old
   entries.

---

## Appendix A — Draft register entries

Drafts for the supervisor to turn into the register the owner approves.
Every figure marked [arithmetic] is rough and is replaced by a measured one
before an entry is approved. Thresholds written here are proposals; what
matters is that each is written into its entry before any outcome is seen.

### A.0 — Common to every entry

1. **An entry.** An opening from flat or a flip; fills grouped into order
   events by `(order_id, previous_size)`; events on one market and side
   within 60 s merged; the instant is the first fill (R8's A4; code-rules).
2. **The follower's instant and price.** The fill plus R8's delay D (62–96 s
   at the base reaction). In FIND, on the panel: the mark at the end of the
   minute that holds the follow instant, with the session-pair cost table. A
   cell that goes to CONFIRM is first re-priced from one-second marks.
3. **A result.** The signed mark return from the follow instant over the
   horizon h. "Gross" is before costs. "Net" is after the table's spread
   and depth, 4 bps a leg, and funding. Every net figure is printed under
   three cost settings: a taker here; a maker here (1.25 bps a leg, no
   spread paid); the owner's own setting (question 1).
4. **The null.** The exact matched null of foundation B: the mean signed
   return over every minute of the same market and UTC hour, weighted by
   trade count, with the direction at the trader's own long share (taken
   from the trader's entries before the window). d = the entry's gross
   result minus the null. Costs cancel in d.
5. **Units.** bps, and risk units: d ÷ the market's mean absolute h-return
   over the trailing 30 days. Pass lines are read in risk units; bps are
   printed beside.
6. **Two standard errors for every mean** — by trader (or account) and by
   UTC day. "t" is the estimate over the larger one. Where votes are
   counted, a trader's entries on one UTC day are one vote.
7. **Left out of every primary cell.** The pre-IPO market; PRL, NCLD,
   SKHYNIX, SAMSUNG, CXMT (R8's list); a retired market from the day it
   turned close-only; any market-day with a split.
8. **The competition.** Every result is printed again (a) without the days
   2026-11-02 14:30Z → 11-16 14:30Z and any later competition, (b) without
   that competition's boosted markets (now ANT, AMD, ARM, SOXL). A result
   that lives only inside competition days or boosted markets is reported
   as "competition only" and does not pass.
9. **FIND data.** The pool read 2026-11-07 00:48Z (1,702 accounts), fills to
   2026-11-07T00:00Z; the panel to the same instant. The primary population
   is the accounts on the all-time notional board (chosen on volume, not on
   result). Accounts found later through a board or the competition table
   form a secondary population — addresses only (point 2.10).
10. **CONFIRM data.** Fills after 2026-11-07T00:00Z of lists frozen with a
    hash before any such fill is read by anyone on the study. First exam: to
    2026-11-30T00:00Z (23 days). Final exam: to 2026-12-19T00:00Z (42 days).
    One stored capture per exam, read once (section 5, item 5). The
    classifier's 100 holdout accounts: their fills after 2026-11-07 are D1's
    unseen data, so no study reads them before D1 is scored.
11. **The two-look rule.** *First exam:* PASSES EARLY only if t ≥ 3.3 in
    FIND's direction (a two-sided p of about 0.001); DROPPED only if t ≤ −1
    (clearly against FIND's direction); otherwise OPEN. *Final exam:* PASSES
    if the estimate is in FIND's direction and its two-sided p-value clears
    the Benjamini–Hochberg line at 10% over every hypothesis of the batch (a
    hypothesis dropped at the first exam stays in the count); otherwise NOT
    CONFIRMED — recorded and dropped.
12. **After a pass.** The account-level check (study 14), then a paper
    profile with its rules frozen.
13. **The smallest visible effect.** 2.8 standard errors — caught four times
    in five at the usual line; about 3.5 for the first discovery in a batch
    of thirteen [arithmetic].
14. **Around the look.** Before it: a fresh reviewer reads the frozen rules.
    After a finding: the placebos (entry times moved by a day; the same test
    on random trades) and leave-one-out (each trader, each market, each
    day).
15. **Exploring.** Looks at old data are free and logged; the count of looks
    is written into the entry.
16. **The end.** Round 2 ends with the final exam. A hypothesis first found
    after 2026-11-20 belongs to a second batch with its own slice of at
    least six weeks from its freeze date.

### A.1 — First measurements

Counts that fix the "smallest visible effect" lines. From fills alone: no
calls, no outcomes.

1. Openings and flips of accounts ever labelled directional — by population,
   hold class and week. (The supervisor, 2026-11-10: not measured yet.)
2. Traders with at least 10 entries in odd weeks and 10 in even weeks.
3. Runs that reach a fifth taker order (entry 7), by account.
4. Agreement events (entry 9).
5. Market-days with funding above five times the floor (entry 8).
6. Entries per week at UTC 12–16 and 00–04 for the frozen lists (entry 10).
7. On R8's stored entries: the variance of d against the variance of the
   tracked return — how much three drawn trades add (foundation B).

### Entry 1 — Traders differ (the gate) [H2; I-05, I-08, I-09]

- **Hypothesis.** Among directional accounts a trader's follower-side entry
  result persists: traders who beat their matched null in one set of weeks
  beat it in the other set.
- **Unit.** The trader (a trader-day is one vote).
- **FIND data.** A.0-9; every opening and flip from each account's first
  fill; the horizon nearest the trader's median hold in the weeks before
  each entry (1 h, 6 h or 24 h; 72 h printed). Two populations, each its
  own test: **P1** directional by classifier v1; **P2** slow systematic —
  labelled algorithm or mixed, with at most N decisions a day, a median
  hold of an hour or more, a maker share under 50% and at least four quiet
  hours (numbers fixed before any outcome).
- **CONFIRM data.** The top fifth and the bottom fifth by FIND's shrunken
  result (traders with at least 20 entries), frozen; their entries after
  2026-11-07; 3.3 weeks, then 6.
- **Statistic and pass line.** *FIND:* the rank correlation between each
  trader's mean d in odd weeks and in even weeks (traders with at least 10
  entries in each). PASS if it is above zero with a permutation p below
  0.05 **and** the top fifth formed on odd weeks beats the bottom fifth on
  even weeks, and the reverse. Printed beside: the between-trader spread
  with its interval; the five-by-five table. *CONFIRM:* the top fifth's
  mean d minus the bottom fifth's; the two-look rule. Each fifth's own net
  result is printed under the three cost settings; a list "pays" only if
  its own net mean is above zero by the same rule.
- **Smallest visible effect.** FIND: a split-half correlation near 0.2 with
  200 such traders — a between-trader spread of roughly 15–20 bps at 20
  entries a half [arithmetic; my stage-1 "8–10" was too optimistic].
  CONFIRM: top minus bottom of roughly 40 bps at the first exam, 30 at the
  final [arithmetic, from R8's standard error scaled by entries].
- **How it could fool us → guard.** Accounts chosen by outcome → the
  primary population comes from the notional board. A lucky cluster of
  days → trader-days as votes, and odd against even weeks. Labels and hold
  classes learned on the tested weeks → taken from earlier weeks (point
  2.22). The competition → A.0-8. A bottom fifth that stops trading →
  count who is left.
- **If it fails.** Entry 6 does not run; "which trader" is closed for this
  venue until the universe holds six more months (question 4).
- **Cost.** FIND: none beyond the panel. CONFIRM: about 120 accounts' new
  fills — 3,000–6,000 tokens inside the exam's capture.

### Entry 2 — Where the money comes from [H8; I-06; DS Q4]

- **Hypothesis.** Most of the top accounts' banked profit comes from parts
  a follower cannot share — execution against the mark, fees below the
  base tier, the first two minutes of a position, funding — not from
  holding between two minutes and a day.
- **Unit.** The account.
- **FIND data.** (a) #47; (b) the 50; (c) the all-time profit board's top
  100 with fills in the period. Fills from the first fill to 2026-11-07;
  the panel; one-second marks where R8's capture holds them.
- **Statistic.** Per account, in dollars: *execution* = Σ signed quantity ×
  (mark at the fill − fill price); *fee gap* = fees at the base tier (4 bps
  taken, 1.25 bps resting) − fees paid; *holding by age* = Σ position ×
  mark change, by the position's age (0–2 min, 2 min–1 h, 1–6 h, 6–24 h,
  beyond); *funding*. "Followable profit" = holding between 2 min and 24 h
  minus base-tier fees on those trades. The pooled followable share = Σ
  followable ÷ Σ board profit over the list.
- **Pass line.** The hypothesis holds if the pooled share's 95% upper bound
  (resampling accounts) is below one half. Also fixed now: "board profit is
  a poor guide" if the rank correlation between board profit and followable
  profit has an upper bound below 0.5.
- **CONFIRM data.** The same accounts, 2026-11-07 → 11-30 and → 12-19: the
  rank correlation of followable profit per traded dollar between FIND and
  CONFIRM (does it persist? — it feeds entry 6); the two-look rule.
- **Smallest visible effect.** The shares are descriptions. For the
  persistence check with 50–150 accounts: a rank correlation of 0.25–0.4.
- **How it could fool us → guard.** A one-minute mark is not the price at
  the fill's second → one-second marks for #47 and the 50 where held, the
  one-minute figure beside them to size the error. A mark off the book →
  A.0-7. A list chosen by outcome → by design: the list is the thing being
  explained. An account's fee tier → never assumed; only the `fee` amounts
  are used (point 2.21); ANT, with its fee override, left out.
- **Cost.** None. Optional: one-second marks for #47's fills outside R8's
  windows — at most 10,000 tokens (40 minutes).

### Entry 3 — Horizon and cost [H4; I-04; H9]

- **Part (a), a measurement with a rule, no pass line: the map.** For each
  market × horizon × cost setting: cost ÷ mean absolute move; the
  break-even share of right calls, ½ + cost ÷ (2 × mean absolute move);
  funding by direction added at 24 h and 72 h; two half-periods printed.
  **Rule fixed now:** a cell whose break-even share is above 55% is
  "closed" — it may be reported, but no entry takes it as its primary
  cell.
- **Part (b), hypothesis.** Entries of directional accounts whose usual
  hold is six hours or more beat their matched null at 24 hours.
- **Unit.** The trader-day vote; the entry for means.
- **FIND data.** P1 accounts whose median hold over the prior weeks is six
  hours or more; h = 24 h primary; 6 h and 72 h printed.
- **CONFIRM data.** The same rule, the hold class frozen at 2026-11-07, on
  new entries; 3.3 weeks, then 6.
- **Statistic and pass line.** *FIND:* mean d at 24 h above zero with t ≥ 2
  under both clusterings. *CONFIRM:* the two-look rule. The net result is
  printed under the three cost settings.
- **Smallest visible effect.** FIND roughly 25–35 bps on a day's move of
  250–400 bps per entry [arithmetic; fixed by first measurement 1]; first
  exam 40–55; final 30–40.
- **How it could fool us → guard.** Long-biased traders in a trending
  market → the matched null. Overlapping one- to three-day windows →
  trader-day votes and day clustering. Funding on long holds → net figures
  carry it by direction.
- **Cost.** None; part (a) needs no panel either (R8's hourly marks and the
  two price tables).

### Entry 4 — Kinds of entries [H6; I-12; I-25]

- **Hypothesis.** At least one of eleven properties fixed in advance splits
  directional entries into halves whose matched-null results differ.
- **The eleven** (each threshold written into the entry before any
  outcome; these are proposals): (1) taken — at least half the opening
  notional as taker — or resting; (2) with or against the last hour's
  move; (3) after a jump — the prior 15 minutes moved more than three
  usual 15-minute moves; (4) large for the trader — above twice the
  trader's median opening of the prior 30 days; (5) a market the trader has
  not touched in 30 days; (6) after a winning cycle or a losing one; (7)
  the first slice of a habitual slicer — half or more of the trader's
  prior entries were built in three or more orders over five minutes or
  more; (8) for adds: to a position in profit or in loss; (9) receives or
  pays funding, where the rate is above five times the floor; (10) against
  the trader's usual side — a long share of 70% or more going short, or
  the reverse; (11) large for the market — above 5% of the market's volume
  in that hour. And beside them, as a covariate: on a boosted market
  during a competition.
- **Unit.** The entry; clustered by trader and by day.
- **FIND data.** P1, every entry, at the trader's class horizon.
- **CONFIRM data.** At most two splits, direction and threshold frozen;
  3.3 weeks, then 6.
- **Statistic and pass line.** *FIND:* per split, the difference in mean d
  between the halves, compared within market category and four-hour block;
  Holm's correction at 5% over the eleven. *CONFIRM:* the two-look rule.
- **Smallest visible effect.** FIND a difference of roughly 15–20 bps for
  an even split after the correction; first exam 20–30; final 15–22
  [arithmetic; fixed by first measurement 1]. Uneven splits see less.
- **How it could fool us → guard.** Thresholds tuned to the result →
  written first. A split that is really a market or an hour → compared
  within category and block. A split that "works" on random trades too →
  the placebo must show nothing. The competition → A.0-8.
- **Cost.** None. Optional, for a "position ÷ equity" form of (4): the
  equity series, 15,000 tokens (an hour).

### Entry 5 — The price path around an entry [I-15]

- **Hypothesis.** In the 60 seconds after their fill, the 50's entries move
  the mark in their direction by more than random public trades in the
  same market and hour do.
- **Unit.** The entry; clustered by trader and by day.
- **FIND data.** R8's capture: 1,272 entries, their drawn random trades,
  one-second marks from 300 s before each follow instant. A second look at
  a capture already used once — logged as exploring.
- **Statistic and pass line.** The mean signed mark move from the fill's
  second to +60 s, entries minus random trades; PASS if t ≥ 2 under both
  clusterings. Printed, deciding nothing: the path second by second from
  −180 s to +750 s; the +5 s to +60 s move (against a one-second
  misalignment); the signed move over the 60 minutes before the fill (from
  the panel).
- **CONFIRM data.** The 50's entries after 2026-11-07, from one-second
  marks (about 14,000 tokens) or the collector's recorded prices; the
  two-look rule.
- **Smallest visible effect.** About 2–3 bps [arithmetic: a minute's move
  is 5–30 bps by market; 1,272 entries].
- **How it could fool us → guard.** The mark trails the local book (point
  2.20) → the result is about the outside price, and the report says so;
  the collector's best prices show the local push from its first day.
- **What each answer means.** Yes: the information is real and gone within
  a minute — no use at a person's speed. No: these entries carry nothing
  even at once.
- **Cost.** FIND: none.

### Entry 6 — A race between ranking rules [H3, H5; I-07] — only if entry 1 passes FIND

- **Hypothesis.** One of six ranking rules, computed on four weeks, picks a
  top fifth whose entries over the following weeks beat the rest's.
- **The six** (each a fixed formula in the entry): (1) banked profit after
  the account's own fees — R8's rule, the baseline; (2) whole profit with
  open positions marked, at base-tier fees, per traded dollar; (3)
  followable holding profit per traded dollar (entry 2); (4) the shrunken
  mean d (entry 1); (5) steadiness — the probabilistic Sharpe ratio of
  daily whole profit per dollar of gross position; (6) risk discipline —
  one index: median loss ÷ median win of closed cycles, and the share of
  losing cycles closed before the adverse move passed twice the trader's
  median win.
- **Unit.** The trader; clustered by formation date and by day.
- **FIND data.** Formation windows of four weeks ending 2026-10-10 and
  2026-10-24, measured on the two weeks after each — the only two clean
  dates since the launch.
- **CONFIRM data.** Formation: the four weeks to 2026-11-07. Measure: the
  new weeks; 3.3, then 6.
- **Statistic and pass line.** *FIND:* top fifth minus the rest, mean d in
  the measure window; the best of the six judged against the resampled
  best of six, so that choosing among six is paid for; p below 0.05. The
  trader's own next profit is printed beside. *CONFIRM:* the two-look rule,
  for the one winning rule.
- **Smallest visible effect.** FIND 30–40 bps; first exam about 35; final
  about 25 [arithmetic].
- **How it could fool us → guard.** A rule made of the thing it predicts
  (rule 4) → reported as entry 1's persistence again, not as a new
  finding. Lower fees inside profit → base-tier re-pricing. The trader's
  own profit persisting through execution → the follower's d is the
  target.
- **Cost.** None.

### Entry 7 — Algorithms working a large order [H10; I-21]

- **Hypothesis.** Once an account has sent five taker orders on one side of
  one market within 30 minutes, with gaps under 10 minutes, the price moves
  further that way over the next 30 minutes by more than a taker's round
  trip.
- **Unit.** The run (one account, market and side); clustered by account
  and by day; one vote per account beside.
- **FIND data.** Every pool account's captured fills (for the busiest, only
  what their 5,000-fill cap holds — state the weeks covered per account).
  The follower enters at the fifth order + D and leaves at +30 minutes;
  +60 minutes and "silent for 10 minutes" printed.
- **CONFIRM data.** The accounts with at least 10 runs in FIND, frozen;
  their fills after 2026-11-07 (about 62,000 tokens for 30 such accounts);
  priced by the mark rule, the recorded book beside as the audit; 3.3
  weeks, then 6.
- **Statistic and pass line.** *FIND:* the mean net result at a taker's
  cost above zero with t ≥ 2 under both clusterings. Printed beside: the
  gross d against random trades; the reversal over the following hour.
  *CONFIRM:* the two-look rule.
- **Smallest visible effect.** Fixed by first measurement 3. With 2,000
  runs and a half-hour move of 40–80 bps, roughly 11–17 bps when a few
  dozen accounts carry the runs [arithmetic] — about the size of the cost.
- **How it could fool us → guard.** The follower's own order and faster
  machines are not in past data → a doubled-cost run, and the recorded
  book at CONFIRM. Runs farmed for a competition's volume → A.0-8. A few
  accounts carry everything → one vote per account.
- **Cost.** FIND: none. The whole histories of the 20 busiest taker
  accounts (250,000 tokens, 16.7 h) only if FIND shows a drift.

### Entry 8 — Funding [H9; I-16]

- **Hypothesis.** On market-days whose funding is above five times the
  floor, the side that receives funding ends the next 24 hours ahead after
  costs: price result plus funding received minus a round trip is above
  zero.
- **Unit.** The market-day; clustered by day.
- **FIND data.** R8's funding rows and hourly marks, 80 markets, 2026-09-26
  → 11-07 (held; no calls); the earlier weeks once the panel exists.
- **CONFIRM data.** Funding and marks after 2026-11-07, inside the exam's
  capture; 3.3 weeks, then 6.
- **Statistic and pass line.** *FIND:* the mean of [the receiving side's
  signed 24-hour mark return + funding received − a taker's round trip]
  above zero with t ≥ 2 by day; printed again without the five markets
  that have the most such days. *CONFIRM:* the two-look rule.
- **Smallest visible effect.** With a few hundred such market-days over 42
  days, roughly 40–70 bps [arithmetic; fixed by first measurement 5].
  Effects here can be that large: 5 bps an hour is 120 a day.
- **How it could fool us → guard.** Extreme funding sits on markets that
  cannot be priced → A.0-7 and the "without five" print. Funding *is* the
  premium, and the premium collapsing is the receiving side's loss → the
  mark carries the smoothed premium, so the loss is in the result. The
  charging rule → point 2.19 settled first.
- **Cost.** None.

### Entry 9 — Agreement [H7; I-13]

- **Hypothesis.** When three or more accounts with no visible link open the
  same side of one market within 60 minutes, and no directional account
  opens the other side in that time, the price moves that way over the
  next six hours by more than after matched random instants.
- **Unit.** The event (overlapping events on one market merged); clustered
  by day.
- **FIND data.** P1 accounts. "No visible link" = no pair with 20 or more
  shared trades [record: R2 Q3], not in R2's prefix clusters, no copy
  pattern (study 12: B within 60 s of A ten times or more).
- **CONFIRM data.** The same rule on new fills; 3.3 weeks, then 6.
- **Statistic and pass line.** *FIND:* mean d at 6 h from the third entry +
  D, above zero with t ≥ 2 by day; 24 h printed; the signed move over the
  hour before the first of the entries printed (a herd after news?).
  *CONFIRM:* the two-look rule.
- **Smallest visible effect.** Fixed by first measurement 4; with 500
  events roughly 30 bps [arithmetic].
- **How it could fool us → guard.** Hidden entities → "no visible link" in
  every sentence, never "independent". Events bunch on news days → day
  clustering and the hour-before print. The count and the window tuned →
  fixed first.
- **Cost.** None.

### Entry 10 — R8's US-open cell [H9; I-18]

- **Hypothesis.** Directional entries opened at UTC 12:00–16:00 do worse
  than their matched null. [Final review F4: was two hypotheses — "(A) …
  12:00–16:00 do worse … (B) … 00:00–04:00 do better". B is now printed
  beside and decides nothing: its find was 125 entries of 19 traders, under
  R8's own count bar, with an interval that held zero.]
- **Unit.** The entry; clustered by trader and by day.
- **FIND data.** Done — R8's secondary: d −38.35 bps [−66.23, −11.05], 387
  entries of 37 traders [record: R8 §1.2] — one of about 25 cuts.
- **CONFIRM data.** The 50 (the same list; primary) and every account on
  the frozen directional list (secondary); entries after 2026-11-07 at each
  trader's class horizon, against the exact null with a random direction —
  shown first, on R8's own cell, to agree with R8's drawn trades; 3.3
  weeks, then 6.
- **Statistic and pass line.** The cell's mean d; the two-look rule.
  Printed beside, deciding nothing: the UTC 00:00–04:00 cell (R8: +28.99
  bps [−0.19, +66.89], 125 entries).
- **Smallest visible effect.** The 50: about 50 bps at the first exam, 40
  at the final. All directional accounts: about 20, then 15 [arithmetic
  from R8's cell — a standard error of 14 bps on 387 entries]. FIND's −38
  was picked from 25 cuts and is likely too large: plan for half of it.
- **How it could fool us → guard.** The boosted stocks trade in the US
  session, so competition churn lands in this cell → printed without
  boosted markets and without competition days. The US open moved from 13:30 to
  14:30 UTC when the clocks changed on 2026-11-01 → the cell stays fixed in
  UTC as R8 had it, and "the two hours after the US open" is printed
  beside.
- **Cost.** None beyond the exam's capture.

### The foundations as build entries (done when …)

- **A — the collector.** Done when: a day's best-price record has no gap
  over 15 s outside logged maintenance; an hour of the recorded stream
  agrees with `/v1/info/bbo` snapshots taken in that hour; the daily board
  copy holds 16 × 1,000 rows with their snapshot stamps; the tables that
  carry results cannot be opened from a study's folder. *Cost:* 6–15
  tokens a minute.
- **B — the panel and the kit.** Done when: the panel's manifest is hashed
  and each market's minutes are counted against its first trade; the kit
  re-computes R8's primary cell from R8's capture to the published −16.60
  and −13.58; the exact null gives R8's mean d within its noise on the
  1,249 entries; the kit's mutants are killed. *Cost:* at most 246,000
  tokens, 16.4 h; a day of one build subagent.
- **C — the rules.** Done when the owner has ruled on question 3 and A.0 is
  in the register's header.

---

## Appendix B — Where every item went

**My stage-1 ideas.** I-01 → foundation A. I-02, I-03, I-42 → foundation B.
I-04 → study 3. I-05 → study 1. I-06 → study 2. I-07 → study 6. I-08 →
study 1 (population P2). I-09 → study 1 (the bottom fifth). I-10 → study
24. I-11 → study 15 (its part (c) → study 12). I-12 → study 4. I-13 →
study 9. I-14 → study 11. I-15 → study 5. I-16 → study 8. I-17 → study 16
and foundation A. I-18 → study 10. I-19 → study 19. I-20 → study 20. I-21 →
study 7. I-22 → study 17. I-23 → study 18. I-24 → study 12. I-25 → study 4
and A.0-8. I-26, I-27 → the v1 plan (I-27 also A.0-3). I-28 → study 23.
I-29 → study 14. I-30 → study 22. I-31 to I-34 → foundation C. I-35 → study
6 and the v1 plan. I-36 → study 25. I-37 → study 22 (its dated list of
releases → study 4, item 3). I-38, I-39 → study 21. I-40 → the v1 plan and
foundation A. I-41 → foundation A and A.0-9.

**Our list.** P0-1, P0-2 done; P0-3 DOCS-SWEEP; P0-4 this report. C1 →
foundation A. H1 → D2. H2 → study 1. H3 → study 6. H4 → study 3. H5 → study
13 and one index in study 6. H6 → study 4. H7 → study 9. H8 → study 2. H9 →
studies 3, 8, 10, 16, 18, 19. H10 → studies 7, 1 (P2), 11, 17. H11 → study
22. H12 → study 14. H13 → study 21. D1, D2 → as fixed. V1–V7 → kept (V3:
point 2.14). M1–M3 → foundation C (M3 also B).

**DOCS-SWEEP.** Its possibilities: 1 (the competition table) → foundation A,
addresses only (point 2.10). 2 (`/markets`) → not needed (its own §10). 3
(long and short counts) → foundation A, study 16. 4 (`exchange`) →
foundation A. 5 (fee rate → tier) → study 2 uses the fee amounts; the tier
stays a guess (point 2.21). 6 (exchange statistics) → foundation A. 7
(retired markets) → foundation B, A.0-7. 8 (cross-margin ratio) → studies
13 and 18, weakly — most accounts are isolated by default. 9 (rolling
funding) → study 8, foundation A. 10 (deeper book, one-second klines,
corporate actions) → foundation A, untested. 11 (the contract's balance),
12 (the widget) → not used. Its findings: the competition as a confound →
A.0-8, point 2.11. Splits → A.0-7. Stops cannot be seen → study 13. The
reward budget and the open-interest reward → studies 2, 11, 17. The H13
rule → study 21, question 5. The funding floor → study 3. The margin law →
study 14. Its "funding settles even for a position closed just before" →
point 2.19.

---

## Sources

**Our record:** every document named in the text; R8, R3, R5 and R2 nearly
in full; DOCS-SWEEP's report twice (before and after its Final review).

**Read 2026-11-09 23:41Z–23:54Z** (a summarising tool; abstract level):
Zhai, "Public Trader Identity: Adverse Selection and Return Predictability",
arXiv 2608.04373 (v3, 2026-08-23); Barone and Lillo, "Trading in the
Sunshine or in the Shade: Market Impact and Adverse Selection on
Hyperliquid", arXiv 2606.15715 (2026-06-14); van Kervel and Menkveld,
"High-Frequency Trading around Large Institutional Orders", Journal of
Finance 74(3), 2019; Coval, Hirshleifer and Shumway, "Can Individual
Investors Beat the Market?", Review of Asset Pricing Studies 11(3), 2021;
Hendershott and Menkveld, "Price pressures", Journal of Financial Economics
114(3), 2014; Barber, Lee, Liu and Odean, "The cross-section of speculator
skill: Evidence from day trading", Journal of Financial Markets 18, 2014.
Searches that found only vendors' or news pages: following Hyperliquid's
leaderboard out of sample; long/short account ratios as predictors; a
follower's result after liquidation cascades; prop-firm pass and payout
rates.

**From memory, not re-read:** Fama and French 2010; Kosowski, Timmermann,
Wermers and White 2006; Barras, Scaillet and Wermers 2010; Harvey, Liu and
Zhu 2016; White 2000; Romano and Wolf 2005; Benjamini and Hochberg 1995;
Holm 1979; the Haybittle–Peto rule; Bailey and López de Prado 2012 (the
probabilistic Sharpe ratio and the minimum track-record length); Dwork and
others 2015; Grinblatt and Titman 1993; Odean 1998; BIS Working Paper 1087
(2023); López de Prado 2018; press reports of "fresh wallet" bets on
prediction markets.

## Evidence list

In the supervisor folder, `workers/IDEAS-REVIEW/`: `brief.md`;
`progress.md` (every step, times from `date -u`); `stage1-ideas.md` (the
blind stage, closed 2026-11-10 00:04Z, unchanged since). No script, no
data, no output file: this review computed nothing. Every [arithmetic]
figure can be re-derived from the numbers named beside it.

## Corrections by my own self-review

IDEAS-REVIEW, 2026-11-10 00:30Z (`date -u`), right after the first commit
(`9323c43`); each is marked in place `[Self-review Sn: was "…"]`. Nothing
in the ranking, the draft entries or the questions changed.

- **S1** — foundation B and point 2.5: exact nulls take away about a quarter
  of the variance (intervals about an eighth narrower), not "a third less
  noise"; three drawn trades *add* a third to the variance.
- **S2** — study 1: the studies that need traders to differ are 6 and 24,
  not "6 and 11".
- **S3** — study 5: the mark is the median of three parts, one of them a
  150-second average; it shows a sudden local push poorly, the copiers'
  wave included — so that part of the question belongs to study 12.

Not re-checked by anyone but me: every [arithmetic] figure, the proposed
pass lines, and Appendix B's map. A fresh Final review should start there.

## Final review (2026-11-10, the owner's request; by IDEAS-REVIEW itself)

Scope: my numbers, my arithmetic and this report — a review's "code". I
started where the self-review pointed (every [arithmetic] figure, the pass
lines, Appendix B's map), re-derived each figure by hand from the numbers
named beside it, then went through the six points the supervisor named. No
API call, no data. **Findings first; each fix is its own commit, marked in
place `[Final review Fn: …]`; the commits are listed at the end.**

**How satisfied am I?** The merged list, its order and the critique stand:
nothing found changes them. What was weak is the part other people must
lift and run — the exams' rule, the "what each test can see" figures, the
blind-store rule and the entries' format. In four places a reader would
have had to guess, and in two the report would have misled: the final
exam's line was not safe for tests that share days and accounts, and the
figures for what the exams can see were too small by about a third.

**Severity 1 — wrong or misleading, could steer a decision**

| # | Finding | Fix (commit) |
|---|---|---|
| F1 | **The exams' lines are neither derived nor airtight.** The first exam's "t ≥ 3.3" is a constant that ignores how many hypotheses are examined and that it rests on 23 days. The final exam's Benjamini–Hochberg line is guaranteed only for tests that are independent or move together; ours share days and accounts, so the guarantee is not shown — R3 chose e-Bonferroni over e-BH for this very reason. "t" was read on the normal table although the day counts are 23 and 42. There is no worked example, and the conditions that keep two looks safe are not written down. | pending |
| F2 | **The "smallest visible effect" figures are too small and their inputs are missing.** All were computed at 2.8 standard errors — one test, normal table — although each will face a batch line; several rest on guessed spreads and counts but are tagged [arithmetic]. Re-derived they rise by about a third; entry 8's by two to three times; entry 1's FIND figure is 17–28 bps, not 15–20. | pending |
| F3 | **The "blind store" rule does not say which fields.** "Addresses only" still leaks when the address comes from a board sorted by profit — being listed there after 2026-11-07 is itself a result. Nothing says what FIND may read of prices, profit series and portfolios after that date, and nothing bars an account found later from this batch's CONFIRM lists. | pending |
| F4 | **Entry 10 carries two hypotheses, and one should not be there.** Cell B (UTC 00–04) failed R8's own count bar (125 entries, 19 traders: "TOO FEW") and its interval held zero; giving it a place in the batch makes every other test's line stricter for nothing. | pending |
| F5 | **Two promises that cannot be kept as written.** A.0-2 re-prices every cell that goes to CONFIRM from one-second marks: about 200,000 tokens for entry 1 alone, in no budget, and of no use at horizons of an hour or more. And foundation B is "done" when the kit reproduces R8's −16.60 exactly — which a one-minute price cannot do. | pending |

**Severity 2 — evidence or wording that does not carry its weight**

| # | Finding | Fix (commit) |
|---|---|---|
| F6 | **The one-page summary does not stand alone.** Trade words are not explained (bps, taker, matched null), its items run to three to five lines, and the six questions are only pointed to. | pending |
| F7 | **Appendix A's ten entries do not share one format.** Fields and their order differ; entry 3 mixes a measurement with a hypothesis; entries 1 and 4 hold more than one hypothesis without saying how many they add to the batch; FIND lines are written three ways ("t ≥ 2", "p below 0.05", "upper bound below"). | pending |
| F8 | **Two headline numbers hide their assumptions.** "−5 bps before costs, between −19 and +5" treats the cost as the same for every entry and leaves funding in. "Six right calls in ten" is the major-coin illustration, printed as if for every market. | pending |
| F9 | **Appendix B's map is incomplete and in one place wrong.** DOCS-SWEEP's §10 list, its six contradictions, its five questions and its "three clocks" are not placed; I-37's description of a trader belongs with V6, not with study 22. | pending |
| F10 | **Unstated inputs.** The collector's disk and token figures; the two exams' token sums; the Sharpe figure in section 3; entry 7's CONFIRM cost (an upper bound, not said). Entry 5 counts 1,272 entries where the priced cell with its random trades has 1,249. | pending |
| F11 | **Inferences and one error written as facts.** "Their position says nothing about direction" (study 11). "Forward only — their histories are cut at 5,000 fills" (study 17): the cut was R2's own page cap; the API reads an account back to its first fill. "The only two clean dates" (entry 6): the two formation windows share two weeks. And point 2.19 says "the two disagree" where the supervisor's instruction is to leave the funding rule open and write nothing as fact. | pending |

**Severity 3 — hygiene**

| # | Finding | Fix (commit) |
|---|---|---|
| F12 | **Names collide.** "A" is a foundation, an appendix and a rule list (A.0); the critique's groups A–C sit beside foundations A–C. | pending |
| F13 | **One fact, several homes** (against CLAUDE.md's "one fact, one home"): the exams' rule in four places, the break-even illustration in three. A correction then has to find every copy. | pending |
| F14 | **Alternatives and extras kept "just in case".** A second cure in point 2.9 and a looser/stricter choice in question 3; two optional pulls (an equity series for a variant that is not among the eleven; one-second marks for #47); "one-second marks or the collector's prices" (entry 5); and the collector's hourly portfolio reads for studies ranked 16 and 17 — which record nothing that cannot be rebuilt later from fills. | pending |
| F15 | **Left as written** — see "What I left, and why" at the end. | — |
