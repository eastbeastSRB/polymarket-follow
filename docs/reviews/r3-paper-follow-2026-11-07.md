# R3-PAPER — the paper-follow method and the scoreboard's statistics

R3-PAPER (Opus 5.5, max), written 2026-11-07 00:40Z – 05:33Z for
polymarket-follow's supervisor (the planned stop with the Q1 and Q6 drafts at
05:25Z; the supervisor's answer at 05:30Z). All times UTC. First API call 00:50:50Z, last
05:20:28Z: **1,796 calls, every one answered 200, no 429** (`out/calls.jsonl`,
`out/an-budget.txt`). **Evidence** is in the supervisor folder
`E:\coding\Claude\supervisor\polymarket-follow\workers\R3-PAPER\` (paths
below are relative to it: `scripts/`, `out/`, `raw/`, `docs/`, `drafts/`) and,
for the large records, `F:\polymarket-follow-research\R3-PAPER\`. Every figure
names its output file; every output prints its run time and its sample sizes.
No real trader's outcome was read: the statistics were proven on simulated
markets, and the pricing rule on live market data only.

**Status of the conclusions.** A review decides nothing. Six answers below
change rules the owner fixed (R8's A5, A11 (iii), the pre-IPO scope; also
A9's d for the vote — the median of the 3 nulls in place of their mean, Q5
and Q6 [Final review F2: added; it was in no proposal, now in question 3]) or set
what the owner will see; **they are proposals awaiting the owner's ruling**
(§7), put to the owner by the supervisor on 2026-11-07 ~05:30Z with the
recommendation "yes" on all six. A ruling that changes anything here becomes a
marked correction.

**Rules I broke, listed in place (self-review).** (1) **The rate share was
exceeded in sliding minutes:** at 53 of 1,796 calls the trailing 60 s held
more than my 50 weighted tokens (maximum 54; the 10 s maximum was 17, under the
30-token burst rule; all in Session B, 03:53–05:20Z; the average was 45 a
minute; Session A's maximum was 49). Cause: my client paced each call by the
*previous* call's weight, so a minute could catch one extra weight-10 tape
read. A token check before sending (the trailing 60 s plus the next call
within the share) caps it; pacing by the next call's weight instead would not
[Final review F7: was "Pacing by the *next* call's weight (a token check
before sending) caps it" — replayed on the 1,796 calls' weights, spacing by
either call's weight reaches 54, the check 50;
`workers/R3-REVIEW/out/check-pacing.txt`]; the code-rule candidate is in §6. (2) One line of `scripts/sim-e2.cjs`
(the horizon read from the environment, 01:08Z) was patched with `sed`, not
the Write or Edit tool; every later script change used them. (3) **The paper
was not read as a PDF:** the brief says "read the paper itself"; the arXiv PDF
could not be rendered on this machine (no PDF tools), so Wang & Ramdas was read
through its ar5iv HTML with the fetch tool, which returns a small model's
extract; the e-BH rule and its Theorem 2 below are quoted from that extract
and agree with the rule implemented in `scripts/sim-lib.cjs`, but no page of
the PDF was seen. [Final review F5: added — the Final review read the PDF's
text (the file R3's fetch saved at 00:57Z) and found the rule, Theorem 2 and
§7's condition as quoted; Q6 item 4.] (4) A draft used a gendered pronoun for the owner;
corrected here (the supervisor's note). Nothing outside my worker folder was opened in the
supervisor folder; polymarket-lab was read only (three files).

**Headline.**

1. **The follower's price:** live, the book's VWAP for the notional at the
   follow instant; historically, **the 1-second mark at that instant plus the
   instrument's mean quoted half-spread and depth cost**. Against 950 live book
   instants on 28 instruments it was within ±1.6 bps per side on average
   outside the pre-IPO (on one Saturday morning, the same morning that gave
   the table [Final review F1: added; see Q1]) — and 1.7–15× less noisy (mean
   absolute error) [Final review F4: was "5–15×"; by category 1.7×
   commodities, 3.4× indices, 4.6× equities, 5.6× majors, 15× small coins,
   `out/an-q1b-N1000.txt`] than A5's "first public trade
   after the delay", which on this Saturday came 1.4 minutes (crypto majors)
   to 24 minutes (indices) after the instant. **ANT, the pre-IPO, cannot be
   priced from history within ±20 bps** by any rule tried.
2. **A sign vote on the trader's own exits measures the exit habit, not the
   skill:** a zero-skill trader who takes profit at +0.5% and stops at −2%
   wins 63% of votes and is crowned by the lab's e-process in 79% of 120-day
   runs. **Vote at a fixed horizon** (1 h, 6 h or 24 h by the trader's own
   holding time); keep the mirrored exits as money, not as a vote.
3. **Many traders watched daily crown a lucky one:** with the lab's E ≥ 20 and
   no correction, a null trader is crowned within a year in 11–13% of runs at
   5 traders and 70–77% at 50. **e-Bonferroni, a verdict at E ≥ 20·K,** holds
   it at 1.3–3.3% under baskets, herding and daily looks; one pooled vote per UTC
   day answers "does following my favourites pay" much sooner.
4. **Verdicts are slow by nature:** an edge three times the fees (P(vote > 0)
   = 0.6) needs 587 merged votes at 20 traders — about a year at two entries a
   day.
5. **Everything was measured on a Saturday**, and the weekend premium and some
   spreads move by the hour (the supervisor's 05:26Z snapshot differed from my
   medians): a weekday run is a condition before R8's numbers are frozen.

---

## 1. The answers

### Q1. The follower's price on a thin market

**Answer.** *Live* (the forward paper log): at the follow instant t_f — the
alert's time + the reaction (60 s) — read the book (`/v1/info/book?depth=100`,
weight 5, or the `book::<iid>` stream, a full top-20 snapshot every 100 ms)
and price the paper entry at **the VWAP that fills the stated notional on the
follower's side** (the asks for a long, the bids for a short): $1,000 primary,
$10,000 stored beside it, with the book's server timestamp and sequence, the
bbo and the ticker (mark, index, funding rate) as read at t_f — never a value
read later. The same at every exit. No model: it is what the book offered.
*Historical* (R8, and the d of the forward log, Q6): **price(t, s, N) =
mark(t) × (1 + s × (h̄ + δ̄(N)))** — mark(t) from the 1-second mark history at
the instant, h̄ the instrument's **mean** quoted half-spread, δ̄(N) its mean
extra cost of filling N beyond the half-spread (per instrument,
`out/rule-table.json` — one Saturday morning's means, 2026-11-07
00:53–05:21Z, from 413 bbo snapshots and 13–14 depth-100 books an
instrument; the supervisor's 05:26Z snapshot differed on indices,
commodities and ANT (below); to be re-measured on a weekday before R8's
numbers are frozen, §7 question 5 [Final review F1: added]), s = +1 for a long's entry or a short's exit, −1
otherwise, both legs, tracked and null alike. The mean, not the median,
because a follower at a random instant pays the mean. **This replaces A5's
"first public trade at or after the fill plus the delay" — a proposal (§7,
question 1).**

**What was measured** (Session A 00:53:52–02:33:00Z and Session B
03:50:39–05:21:00Z, a Saturday; 413 all-instrument bbo snapshots, 1,227
depth-100 books, 22,640 one-second top-20 books of 12 instruments, the
1-second ticker of all 90 instruments from the `tickers::all` stream, and the
tape of 28 instruments, 3,255 trades; `out/an-q1a.txt`, `out/an-ticks.txt`):

| Category | half-spread median / p90 (bps) | crossing $1,000 median / p90 | $10,000 | $50,000 (book sides that 100 levels could not fill) |
|---|---|---|---|---|
| crypto majors (BTC, ETH, SOL) | 0.07 / 0.61 | 0.22 / 1.30 | 0.27 / 2.46 | 0.95 / 3.11 (0%) |
| small coins (38) | 2.44 / 3.39 | 2.64 / 3.59 | 3.03 / 4.19 (1%) | 4.03 / 5.67 (3%) |
| equities (38) | 2.06 / 2.88 | 2.32 / 3.33 | 2.94 / 4.52 | 3.76 / 5.94 (7%) |
| indices (6) | 1.82 / 4.38 | 2.18 / 5.45 (1%) | 2.69 / 5.46 (5%) | 2.89 / 7.87 (17%) |
| commodities (4) | 0.29 / 0.87 | 0.36 / 0.97 | 0.66 / 1.43 | 1.67 / 2.93 (0%) |
| pre-IPO (ANT) | 7.60 / 18.38 | 7.24 / 11.51 | 13.88 / 22.46 | 27.62 / 45.22 (0%) |

The crossing cost includes the half-spread and is one side: a round trip pays
it twice, plus the 4 bps fee each way. [Final review F10: added — the
half-spread column comes from the 413 all-instrument bbo snapshots and the
crossing columns from the 1,227 depth-100 books, 13–14 an instrument at other
instants, so a category's crossing median can sit below its half-spread
median (ANT 7.24 against 7.60). The rule's table (`out/rule-table.json`)
takes each instrument's depth cost from those 13–14 books; at $10,000 it is
not usable for PRL-USD (14 of 28 book sides could not fill it, the others
cost 343–581 bps beyond the half-spread) nor fully for NCLD-USD (9 of 28
could not); `workers/R3-REVIEW/out/check-data-counts.txt`.] BTC's spread is one tick ($1 on
~$75,800). **By the hour the medians move** (half-spread, hours 00–05Z):
indices 2.18 → 1.30, commodities 0.38 → 0.12, ANT between 3.54 and 11.55; the
supervisor's own snapshot at 05:26Z, just after my window, showed indices
2.66, commodities 1.06 and ANT 14.2 (crypto 0.07 / 2.32 and equities 1.92
matched). So the table is **one Saturday morning's**, not a constant.

**Where the mark and the index sit — the follower trades the book.**
mark − book mid, p10 / median / p90 (bps): majors −0.07 / 0.17 / 0.67; small
coins −0.85 / 0.07 / 2.13; equities −4.53 / −0.07 / 0.93; indices −7.50 / 0.00
/ 1.26; commodities −1.77 / 0.00 / 0.12; **ANT −85.5 / −38.9 / +10.3** (the
mark outside the book 77.7% of the time). The last trade is a poor price on
thin books: last − mid for small coins −46.7 / +0.3 / +61.9 (`out/an-q1a.txt`
§3). The 1-second mark history that R8 would read **is** the live mark: in six
1,000-second windows every second was present and equal or within 0.5 bps in
74–100% of seconds, the rest sub-second timing (`out/an-checks.txt`).
[Final review F3: added — the six windows are one window, 01:23:50–01:40:30Z,
on six instruments, read about 2.5 hours later; with a ±1 s shift 97–100% of
seconds agree, so "sub-second timing" holds
(`workers/R3-REVIEW/out/check-markhist.txt`). Whether 1-second buckets exist
for September–October, R8's period, was not checked: one mark-history read
of an old window (weight 5) settles it before R8 relies on the rule.]

**The historical rules, against the live truth** (the VWAP the book offered,
950 instants on 28 instruments; `out/an-q1b-N1000.txt`, `-N10000.txt`; bps,
+ charges the follower more than the book did, − less):

| Category | next public trade after the instant, median / p90 | mark rule, $1,000: mean per side (long / short), mean abs | $10,000 | A5, $1,000: mean (long / short), mean abs |
|---|---|---|---|---|
| crypto majors | 86 s / 362 s | +0.13 / −0.20, 0.29–0.32 | +0.11 / −0.13, 0.29–0.32 | +0.28 / −0.34, 1.7 |
| small coins | 739 s / 1,562 s | +0.68 / −0.84, 1.2–1.3 | +0.72 / −0.89, 1.3 | +6.2 / −6.4, 19.5 |
| equities | 882 s / 2,056 s (3.3% none in 2 h) | −0.93 / +1.17, 1.4 | −1.24 / +1.39, 1.6–1.7 | +0.6 / −0.3, 6.4 |
| indices | 1,436 s / 3,623 s | −0.44 / +1.53, 3.9–4.9 | −0.52 / +0.60, 4.0 | −5.1 / +3.9, 14–15 |
| commodities | 236 s / 1,276 s | −0.60 / +0.68, 0.9–1.0 | −0.79 / +0.85, 1.1–1.2 | +0.2 / −0.1, 1.7 |
| pre-IPO (ANT) | 773 s / 1,175 s | **−22.3 / +25.8, 30–36** | −30.1 / +32.0, 34–40 | −24.6 / +28.0, 70–76 |

- **The mark rule** is within ±1.6 bps per side on average at $1,000 outside
  the pre-IPO (±1.2 outside indices; ±1.4 at $10,000) — a fraction of the
  8 bps round-trip fee. [Final review F1: added — measured on the same
  Saturday morning that gave the table. Within that morning it is not an
  artefact of fitting: with the table built from one session and the error
  measured on the other, the largest per-side mean outside the pre-IPO was
  1.44 bps (in-sample 1.53; `workers/R3-REVIEW/out/check-pricing-xval-N1000.txt`
  in the supervisor folder). On a weekday, in regular sessions and in R8's
  September–October it is not measured; its per-side bias follows where the
  mark sits against the book, which moves with the weekend premium (the
  supervisor's 05:26Z snapshot: indices' book − index −0.14 bps against
  +1.2 to +11.7 by the hour this morning).]
- **A5 as written** ("the first public trade at or after the fill plus the
  delay, plus the cost of crossing the spread") is noisy (mean abs error
  1.7–19.5 bps) because the next trade comes minutes later and the price
  moves meanwhile, and over a few hours it is biased by the drift over that
  gap (small coins: its price 6 bps too high, so a long paid 6 bps more and a
  short 6 less than the book). Its same-side variant (the next trade on the
  follower's side) is worse. Keep A5 as a check.
- **Trade-anchored corrections did not help:** the mark plus a basis from
  recent trades, the last trade moved by the mark, the next trade moved back,
  the buy/sell midpoint against the mark or against the index. Outside ANT
  none was materially better than the plain mark (a fraction of a bp better in
  bias on majors and commodities; on equities the index-anchored and
  next-trade variants had less bias, 0.2–0.5 against the mark's 0.9–1.2 bps,
  but 1.6–1.8 times its mean absolute error; worse on small coins and
  indices [Final review F10: was "worse on small coins, equities and
  indices"]);
  on ANT the anchored ones were 20–39 bps biased the other way, and the
  next-trade variant averaged +8.5 / −5.0 with a mean abs error of 80 bps. Two
  reasons, both measured: real takers pay less than the quoted spread
  (effective half-spread, side × (price − mid 1 s before), median: majors 0.00
  vs quoted 0.07, small coins 2.06 vs 2.10, equities 1.59 vs 2.19, ANT 0.65 vs
  7.60), and on ANT trades cluster when the book is pushed up — after a trade
  under $1,000 the book stayed displaced in the taker's direction by +35 to
  +47 bps relative to the mark for 30–120 s (510 trades) — while ANT's mark
  **switches** between following its index and following its book
  (`out/an-ant.txt`: at 01:02Z mark = index = 1530.7 with the book at
  1551.8 / 1551.9; at 01:38–01:48Z the mark followed the book).
- **ANT (pre-IPO):** no rule tried prices it within ±20 bps; the best, the
  mark, flatters a long by 22 bps on average. **Proposal: R8's primary cell
  without pre-IPO entries, a secondary with them** (§7, question 2).
- **After a trade, at the follow delay** the mark rule ignores a book still
  displaced by the trader's own fill. 60 s after public trades, side ×
  (mid − mark): majors 0.0 to +0.7 bps, small coins −0.5 to +0.4, commodities
  +0.6 to +1.4, equities −0.6 to −8.7 and indices +7.5 to +9.4 (few trades),
  ANT −27.7 to +35.1. The cost of arriving late shows too: on majors the mid
  60 s after a trade sat 1.5–1.9 bps beyond the pre-trade mid in the taker's
  direction; on small coins ~8 bps. The forward log's audit (Q7: the live book
  against the rule at every real follow instant) measures this for the traders
  actually followed.

**What off-hours sessions do to a price** (equities, indices, commodities).
Sessions switch only the external feeds behind the index and the mark's third
candidate (docs, Market Sessions); the mark is the median of three
candidates, one of them index-anchored (docs, Mark Price). On this Saturday
the books traded away from their index, **by an amount that moved by the
hour** (median over instruments of the hourly median book − index, hours
00–05Z, `out/an-ticks.txt`): equities +5.1, +6.9, +1.7, +7.8, +6.7, +2.2 bps;
indices +7.6, +11.7, +5.8, +5.6, +7.5, +1.2; commodities −1.1, +2.1, +0.7,
−9.3, +0.3, +6.1; ANT +57.5, +49.2, +38.9, −58.1 (03:50–03:59 only), +43.9,
+29.9; single equities up to +30 (SKHYNIX, UNITREE). The supervisor's 05:26Z
snapshot: equities +0.68, indices −0.14, commodities +7.54, small coins
−6.96, ANT +67. Funding charged the side the book leaned to (ANT: settled
−1.1e-4 to +2.9e-4 an hour, a long paid 0.17% over the 24 hours to 03:00Z).
For a follower: (1) the price is the book's, never the mark's or the index's;
(2) P&L shown at the mark understates a long's cost of entry when the book
trades rich; (3) when the regular session opens, the index jumps to the real
market and the book converges — a weekend position's P&L contains that
convergence; (4) off-hours, funding can be the largest cost. **The regular
session was not observable** (a Saturday): proposal 5 in §7.

**R8's cost** for the rule: the mark at 4 legs × 2 instants per entry (1 s
windows, weight 5) ≈ 40 tokens, plus the null sampling (Q5, 15–35) ≈ 55–75
tokens an entry for the vote and ~40 more for the mirrored exits; 1,000
entries ≈ 100,000 tokens ≈ **8.3 hours at 200 tokens a minute**, R8's share
at most (the operating budget is 250 for all callers, decisions 2026-11-07).

### Q2. The delay

**Answer: the follower acts at t_follow = the alert's time + a fixed reaction
of 60 s; the alert's own delay is set by the poll interval, and at the
operating budget it is 0.9–34 s (mean 18 s) for 20 favourites.** Evidence
`out/an-delay.txt` (arithmetic from R1's formulas, R4's toast timing and the
decisions' budget).

| Component | Value | Source |
|---|---|---|
| Poll phase | uniform on [0, T); positions polling (weight 5) with a fills read on a change at 200 tokens a minute: T = 7.7 s (5 favourites), 15.8 s (10), 33.3 s (20), 52.9 s (30), 100 s (50); with the active fifth polled 4× as often, 20 → 13.3 s / 53.3 s, 50 → 40 s / 160 s | decisions 2026-11-07; R1 Q14 |
| API lag | the portfolio leads fills (same 5 s tick or one earlier), so the alert carries no fills lag; the fills read for details lags 1–1.5 s and waits ~2 s past the cache, after the alert | R1 Q5, Q7 |
| Request and processing | ~0.3 s + ~0.3 s | R1 Q2 (median 306 ms) |
| Notification | 0.34 s cold, 6–7 ms from a running notifier | R4 Q1 |
| The owner's reaction | 15 s (decided in advance), **60 s (primary, R8 A5)**, 5 min, 30 min | R8 A5 |

With 20 favourites the follower's delay is 61–94 s (mean 78 s) at the primary
reaction; 5 favourites 61–69 s; 50 favourites 61–161 s. **For R8** (no poller
existed): D = U·T + 1.5 s + 0.3 s + 0.34 s + R, U from a fixed seed, T = 33.3 s
(20 favourites, positions polling) — 62–96 s at R = 60 s. The 1.5 s is R1's
fills lag, kept although the portfolio would not have it (a later price is the
conservative side for a test of an edge). Secondaries: R = 15 s, 5 min, 30 min
(A5).

**The PC asleep or offline (R4 Q8): priced when it could really be acted on,
and kept out of the vote.** Every entry is recorded. An entry whose alert came
late because of an outage (the poller's own clock gap over two poll
intervals, or an alert delay over 5 minutes) is priced at its real alert time
+ R and flagged "late"; it counts in the "as experienced" paper P&L and not in
the e-process. Why: the vote tests one fixed strategy (follow within the
normal delay); an outage of this PC is unrelated to what the trader's market
does next, so leaving those entries out of the vote cannot bias it; an alert
late because the exchange's data lagged (and an entry under "data stale", §4)
may fall in fast markets, so for those this is not shown [Final review F12:
was "an outage is unrelated to what the trader's market does next, so
leaving those entries out of the vote cannot bias it", which holds for the
PC's own outages only]; putting them in
would mix a different, random delay into the trader's score. "Not at all" was
rejected because it would drop real entries from the money record (Iron Rule
4). An exit seen late is priced late: the paper position really stays open
until the follower could act.

### Q3. Entries, sizing, exits

**Answer: one paper entry per opening or flip, $1,000 of notional each, scored
at a fixed horizon for the vote and with the trader's exits mirrored for the
money.**

- **Entry** (R8 A4): an opening from flat or a flip. Fills are read per order
  event, grouped by `(order_id, previous_size)` (code-rules: reading fill by
  fill misreads ~11% of events); events on the same instrument and direction
  within 60 s are merged (R4's alert grouping, 20 s and at most 60 s, sits
  inside that, so the alert and the entry agree). The entry's fill time is the
  first fill's `timestamp`. Adds are a secondary arm: each add is its own
  equal-notional paper entry, never mixed into the primary.
- **Size: equal notional per entry, $1,000** (the exchange's own funding
  premium walks the book for $1,000; every recorded book filled it except 1%
  of index book sides — Q1), with $10,000 stored beside it. Proportional
  variants (secondary): the follower's notional ∝ the trader's entry notional
  ÷ the trader's account equity at the entry (portfolio `equity`), which copies
  conviction; never the trader's raw size.
- **Exits.** (a) **The vote: a fixed horizon h** per trader (1 h, 6 h or 24 h,
  Q6), exit at t_follow + h, for the paper entry and its nulls alike. (b) **The
  money: mirror the trader**: a reduce closes the same fraction of the paper
  entry, f = |reduced quantity| / |previous_size|; a close closes it; a flip
  closes it and opens a new entry the other way; each at that event's own
  alert time + R. (c) Secondaries: an own stop (the paper leg closes at −5%,
  stated), a time limit (7 days).
- **The trader's liquidation** (R1: taker reduces at off-market prices): an exit
  like any reduce, priced at the market at alert + R — never at the
  liquidation fill's price — and flagged; it is an event, not a decision.
- **Open when following stops** (the owner unfollows, or R8's T1): marked at
  that instant at the rule's exit price (the bid side for a long) with the exit
  fee and funding to that instant, flagged "open, marked"; never dropped.

### Q4. Costs

**Answer: the base-tier taker fee of the instrument on both legs, funding at
every whole hour the paper position is open, and the spread and depth paid
through the price itself (Q1).**

- **Fee:** the $0-tier taker rate of the instrument at that instant — 0.04%
  (`/v1/info/fees`) — **except where an instrument carries a fee override:
  ANT-USD's base taker is 0.02%** (`fee_override`, from 2026-10-29T15:23:35Z,
  no end; `raw/instruments-*.json`, 2026-11-07 00:50Z). Never the trader's own
  fee (838 of 4,063 corpus fills were rebates, R1). A fee schedule is "now
  only": R8 reads the schedule once and states it; the forward log stores the
  rate with each entry.
- **Funding:** settled at the end of every 1-hour window on open positions
  (docs, Funding; `nxf` in the ticker is the next whole hour). For a paper
  position open across HH:00:00Z: payment = −direction × rate × quantity ×
  mark at that instant (positive rate: longs pay). The published rate already
  contains the non-crypto 0.5 scale — at rest crypto shows 0.0000125 an hour
  and equities, indices and commodities 0.00000625 — and `funding_multiplier`
  is null on all 90 instruments (2026-11-07 00:50Z), so nothing more is
  applied; if it ever becomes non-null, test whether the published rate
  already includes it before using it. The settled rate equals the ticker's
  rolling rate 5 s before the hour (eight instruments, 01:00 and 02:00Z,
  within 0.2% — ZEC 5.470e-6 against 5.480e-6, KAITO −7.682e-5 against
  −7.695e-5, the rest closer or equal [Final review F11: was "to three
  digits"]; `out/an-checks.txt`). Funding is not always small: over the 24
  hours to 03:00Z a long paid 0.169% on ANT-USD (settled rates −1.1e-4 to
  +2.9e-4 an hour; the ticker's rolling rate touched 5.6e-4 an hour on
  Saturday morning) and received 0.183% on KAITO-USD, against 0.030% on BTC
  and ETH (1.25e-5 every hour) — `raw/funding-*.json`.
- **Spread and depth:** inside the follower's price (live: the book's VWAP;
  historical: the rule of Q1), on both legs.

### Q5. The null

**Answer: R8's A9 as written, with three refinements: draw the 3 trades
uniformly over the hour's trades (not over time), take their median for the
vote, and price them with exactly the follower's rule.**

- **Per entry, 3 public trades** in the same instrument and the same UTC hour
  of the same day, drawn with a seed derived from the entry's id, each keeping
  its own taker side (the tape's `side` is the taker's, R1), with the followed
  accounts' trades removed by `trade_id` (a fill's `trade_id` is the tape's,
  R1); each enters at its own time + the same delay D, exits after the same h
  (vote) or the same holding time (money), with the same costs and the same
  pricing rule. An odd number makes the median exact for the sign (Q6).
- **Uniform over trades, not over time.** "The first trade after a random
  instant" picks trades that follow quiet spells more often (a trade is chosen
  in proportion to the gap before it), and quiet spells are not random hours.
  Draw trade indices instead.
- **Cheap sampling:** read the hour's 1-minute klines (weight 5; each row
  carries its trade count), draw three indices, read the tape of the minute or
  minutes that hold them (weight 10 each; a minute rarely holds 100 trades); an
  hour with ≤ 100 trades is one tape read. 15–35 tokens per entry; R8's 1,000
  entries ≈ 25,000 tokens ≈ 2 hours at 200 tokens a minute. The forward log
  does the same an hour after each entry (nothing at alert time). The tape
  accepts `sort` and `cursor` (140 paged reads, `out/sessionb-events.log`).
- **The alternatives R5 found.** *Buy-and-hold / the trader's own habit:*
  nulls whose direction is drawn with the trader's own long share (frozen from
  pre-following entries) — "matched" — keep everything else and remove the
  long/short habit and the market's trend from the comparison (Q6, item 8,
  E5). **It adds something: show it beside the vote as a diagnostic.**
  *Activity-matched placebo cohorts* (Zhai: entries of other accounts with
  similar activity): answers "better than similar traders?", which is R8's
  skill-or-luck question, not "does following pay"; it costs a fills history
  per placebo account. Only if R2's pool histories make it free, and only in
  R8; not in the forward log.

### Q6. The scoreboard's statistics

**Answer.** Each followed entry gets one number, **d = the follower's net
return over a fixed horizon h − the median of the net returns of its 3 null
trades over the same h** (same delay, same pricing rule, same fees and
funding). A trader's entries whose windows overlap (any instrument) are
**merged into one vote**, the sign of their summed d. Per trader the lab's
**two-sided sign e-process E_n = 2ⁿ·k!(n−k)!/(n+1)!** runs on those votes,
updated when a vote completes; the owner may look as often as they like. **A
verdict only at E ≥ 20·K** (e-Bonferroni), K = the number of trader slots in
the scoreboard's run, fixed when the run starts. The **pooled board** (all
favourites as one) uses one vote per UTC day, the sign of that day's summed d,
with a verdict at E ≥ 20. The paper P&L with the trader's exits mirrored is
shown beside it as money, never voted on by sign. Proven on simulated null
paths with daily looks and 5–50 traders, and on stated effects (`out/sim-e1.txt`
… `sim-e5.txt`; scripts seeded, no API). **The fixed-horizon vote, the A11
(iii) change and K are proposals (§7, questions 3 and 4).**

**Why each piece (the evidence).**

1. **A fixed horizon, not the trader's own exit, for the vote.** A sign test
   assumes a vote is a fair coin under "no skill". The trader's exit breaks
   that: a zero-skill trader taking profit at +0.5% and stopping at −2% wins
   62.9% of single comparisons (E4, exact over its 200,000 trials [Final
   review F6: was "63.4% ... (E4, 200,000 trials" — sim-e4 printed a share of
   4,000 resamples of the trials, ±0.8 point; it reproduces exactly, and the
   exact share is 62.85%, `workers/R3-REVIEW/out/check-e4-exact.txt`]; the supervisor's check:
   b/(a+b) = 2/2.5 = 80% before costs) while the mean net return stays
   −10.0 bps, the costs — exits create no money. The sign e-process crowns that
   trader: E ≥ 20 in 79% of 120-day runs, E ≥ 200 in 54%, a family of 10 such
   traders in 100% (E2 S3). At a fixed horizon the same trader votes 50.0% and
   is crowned 2.8% of the time. It is the leaderboard's own trap (small wins
   banked, big losers held). Means are immune (optional stopping), but a
   betting e-process on the mean, legs capped at ±20% so that it stays a valid
   bet, never reached 20 in 120 days in any scenario and in 0.4–1.4% of years
   for real edges (E2): no power. Tighter caps raise the bet size, but a bet is
   valid only if no price can jump past the cap, which weekend reopenings and
   crashes do not guarantee.
2. **The median of 3 nulls, not the mean.** With an odd number of nulls,
   P(tracked > their median) = ½ exactly when the tracked entry is
   exchangeable with random trades, whatever the return distribution; the mean
   of 3 is fair only for symmetric returns. Under baskets the mean version
   inflated more (unmerged: 7.0% vs 5.5%, E2 S1). Store both: the mean is
   right for A11's (i)/(ii).
3. **Merge overlapping entries.** A basket (BTC and ETH long together) makes two
   votes that move together. Unmerged, a null trader reached E ≥ 20 in 5.5% of
   runs (S1) and 4.5–5.1% with herding and baskets mixed (S5); merged,
   2.8–3.3%. The unit: entries whose leg windows (hour start + delay, to the
   last leg's exit) overlap, across instruments; the vote completes when its
   last leg closes; votes are ordered by completion. Votes over disjoint
   windows stay fair coins under the null whatever the instruments'
   correlation, because each tracked leg and its nulls face the same market,
   so BTC and ETH need merging only when they overlap in time; E2's market
   has volatility clustering, so its returns over disjoint windows are not
   independent, and the merged votes held [Final review F12: was "Returns
   over disjoint windows are independent whatever the instruments'
   correlation"].
4. **e-Bonferroni, not e-BH.** Wang & Ramdas (arXiv 2009.02824v5): e-BH
   rejects the k* largest e-values, k* = max{k : k·e_[k]/K ≥ 1/α}, with FDR ≤
   K0·α/K under any dependence (Theorem 2) — at one decision time, with
   e-values valid at that time; their sequential case (§7 of the paper) needs
   each null's increments valid given all earlier information, which two
   traders holding the same or correlated instruments at overlapping times
   break [Final review F5: was "the same instrument at once"]. [Final review
   F5: added — the rule (the paper's eq. 1 and eq. 5), Theorem 2 and §7's
   condition (its Table 1: E[X_j^k | G] ≤ 1, G the information available
   before X_j^k is observed) were checked against the paper's own text, the
   arXiv v5 PDF that R3's fetch saved, read with a text extractor
   (`workers/R3-REVIEW/scripts/pdf-text.cjs`); they are as quoted. The paper
   never mentions Bonferroni or FWER; e-Bonferroni's guarantee below needs
   no paper — Ville's inequality and a union bound.] e-Bonferroni needs only
   each trader's own e-process: Ville gives P(a null trader ever reaches
   20·K) ≤ 1/(20·K), and the union over traders gives **P(any null trader is
   ever flagged, however often the owner looks) ≤ 5%**, under any dependence
   between traders. Measured with idealised votes, 365 days, daily looks
   (E1, 4,000 paths): uncorrected E ≥ 20 crowns a null trader in 11–13% of
   runs at K = 5, 21–25% at 10, 38–43% at 20, 70–77% at 50; e-Bonferroni
   2.3–2.9%. Under the global null e-BH nearly always acts as e-Bonferroni,
   but not always: it rejects r traders at once when each passes K/(r·α),
   below K/α (the paper's self-consistency condition) — in E1's 60,000 null
   paths, 5 times on a day no E had reached 20·K, once where e-Bonferroni
   never rejected (`workers/R3-REVIEW/out/check-e1-ebh.txt`) [Final review
   F5: was "Under the global null e-BH is the same rule (its first rejection
   needs K/α)"]; with real traders present its "ever" family error rose to
   2.3–9.8% (e-Bonferroni 1.2–2.5% in the same runs) for little gain, since
   real edges are expected to be rare. In the market simulation, fixed horizon
   and merged: 1.3–3.0% in every scenario (E2).
5. **The pooled board: one vote per UTC day.** Pooling every entry as its own
   vote is invalid when traders herd or trade baskets (7.5–9.0%, E2 S1, S2,
   S5); merging overlaps across traders glues everything into 1–12 votes in
   120 days at 6–24 h horizons with 2 entries a day (80 for twenty traders at
   half an entry a day; useless; ~700 at 1 h) [Final review F9: was "1–14
   votes"; `sim-e2-S*.txt`, `sim-e2-h*.txt`]. One vote a day held
   1.5–4.3% in every 120-day scenario, including 24 h horizons. Use fixed-
   horizon d there too: with mirrored exits the daily vote reached 4.5–6.75%
   at K = 50 over a year.
6. **The horizon h per trader, frozen when following starts:** the class (1 h,
   6 h, 24 h) nearest the trader's median holding time over the 30 days before
   following; fewer than 10 closed positions → 6 h. A short horizon that
   matches the edge is far more powerful: a 30 bps edge that plays out over an
   hour, 2 entries a day, 120 days → entries 60.5% positive (merged votes
   61.0%) and E ≥ 20 in 60% of runs at h = 1 h, 57% (58.3%) / 23% at 6 h,
   54% (56.7%) / 3.8% at 24 h [Final review F9: the shares were of entries,
   called votes; merged-vote shares from a re-run,
   `workers/R3-REVIEW/out/check-e2-merged-S6-h*.txt`] (E2 S6,
   `sim-e2-h60.txt`, `sim-e2-h1440.txt`).
7. **Two-sided, as the lab's:** a "worse than random" verdict is information
   too. The one-sided version (valid for P(vote > 0) ≤ ½) needs 12–18% fewer
   votes at the bar of 20 and 7–9% fewer at 400 (E3) [Final review F9: was
   "~10–20% fewer votes"; `workers/R3-REVIEW/out/check-arith.txt`] — a
   variation, not the recommendation.
8. **The trader's long/short habit.** With the tape's taker sides as the
   nulls' directions (A9), a no-skill trader who is always long in a strongly
   rising market (+0.25% a day) gets 52.3% positive votes at h = 24 h and
   E ≥ 20 in 6.7% of years; at 6 h 50.8% / 3.7%; at 1 h 50.0% / 3.0%.
   Downward jumps (−2% or −1% at 0.2 a day, mean zero) move the vote by less
   than a point (E5, 300 one-year runs a cell). Matched nulls remove it
   (49.1% / 2.3%). It is beta — real money in a rising market, but not skill,
   and buy-and-hold gives it too. Keep A9's nulls for the vote (as decided, so
   R8 and the forward log measure one thing) and show the matched e-process
   beside it; where they differ, the difference is the habit.
9. **Ties** (|d| < 0.1 bps) are dropped; **late entries** (Q2) are recorded and
   not voted, by a rule set before the outcome.

**The recommended configuration over a year** (daily looks, each trader's h
from its hold class, behaviours mixed — random, baskets, herding, disposition
exits, long bias in a mild bull market; `out/sim-e2-365-*.txt`):

| Runs | Measured | Result |
|---|---|---|
| K = 5, 1,000 paths | a null trader ever E ≥ 20 / the family ever E ≥ 100 / pooled daily ever E ≥ 20 | 2.9% / 2.4% / 3.8% |
| K = 50, 600 paths | the same, family bar 1,000 | 3.1% / 2.8% / 3.3% |
| K = 50, no drift (400) / no herding either (400) | family / pooled daily | 2.75% / 1.75%; 3.25% / 1.75% |
| K = 50, mirrored exits instead (contrast) | a null trader / the family | ~15% / 100% |
| K = 20, 2 traders with a 30 bps edge (1 h decay), 500 paths | each edge trader ever E ≥ 20 / ≥ 400 within the year | 78.8% / 53.9% (entries 59% positive [Final review F9: was "votes 59% positive"], 429 merged votes) |
| K = 20, all 20 with a 15 bps edge, 500 paths | each ever ≥ 400 / pooled daily ever ≥ 20 | 3.6% / 82.4% |

(The 100-path K = 50 runs scatter 0–7% on the pooled board by chance; the
aggregate is the figure. One no-drift run shares its seeds with one drift run.)

**Power: how many votes a verdict needs** (E3, 4,000 paths, 80% power,
two-sided):

| P(vote > 0) | bar 20 (one trader / pooled) | 100 (K = 5) | 400 (K = 20) | 1,000 (K = 50) |
|---|---|---|---|---|
| 0.55 | 1,661 | 2,127 | 2,488 | 2,734 |
| 0.58 | 603 | 778 | 929 | 1,029 |
| 0.60 | 369 | 490 | 587 | 641 |
| 0.65 | 155 | 204 | 242 | 267 |
| 0.70 | 83 | 108 | 130 | 143 |

The exact one-look sign test needs 786 / 199 / 90 / 49 at 0.55 / 0.6 / 0.65 /
0.7: being allowed to look every day costs 1.7–2.1× the votes at the bar of 20
(the supervisor's check: KL(0.6‖0.5) ≈ 0.020 nats a vote). What P(vote > 0) an
edge buys: in the simulated market a 30 bps edge per entry that plays out over
an hour gives 0.61 a merged vote at h = 1 h and 0.58 at 6 h; 15 bps gives 0.54
at 6 h (E2) [Final review F9: was "0.605 at h = 1 h and 0.57 at 6 h; 15 bps
gives 0.536", the shares of entries; E3's P is a merged vote's;
`workers/R3-REVIEW/out/check-e2-merged-S*.txt`]. **Days to a verdict** (`out/an-power-days.txt`, arithmetic from E3 and
E2's merged votes per entry): at 2 entries a day and h = 6 h, P = 0.6 → 506
days at K = 20 (318 alone); P = 0.65 → 209 (134); at h = 1 h, 334 (210) and
138 (88). So **a per-trader verdict at K = 20 takes months to years** even for
an edge three times the fees; the pooled board is faster (twenty traders with
15 bps each: E ≥ 20 within a year in 82% of runs).

**What the owner sees each day** (no verdict below the bar):

    Trader 0x7a3f…c91e · directional · h = 6 h · followed since 2026-12-01
      42 votes (from 77 entries): 23 better than random, 19 worse
      E = 0.23 — a verdict needs 400 (20 traders tested) — no verdict
      beside it: E against the trader's own long/short habit 0.5
      paper P&L, exits mirrored, $1,000 an entry: −$41.20 net (77 entries)
    All favourites, pooled · 30 days: 17 better, 13 worse · E = 0.29 of 20

[Final review F9: the example's E values were 0.6 and 0.5; the lab's formula
gives 0.23 for 23 of 42 and 0.29 for 17 of 30,
`workers/R3-REVIEW/out/check-arith.txt`.]

**For R8 (one look).** A11 (iii), "one vote per trader, its mean d", with
mirrored exits is biased for traders with few entries: zero-skill disposition
traders give a positive vote 57.8% of the time at 5 entries, 54.1% at 10,
52.6% at 20, 51.4% at 50, 50.7% at 100 (E4's trials, 200,000 resamples)
[Final review F6: was "57.9% ... 53.6% at 20, 50.5% at 50 (E4)" — 4,000
resamples, ±0.8 point]; reverse habits bias the other way (41.9% at
5). (i) and (ii) (means) are not biased. **Proposal: compute (iii) on
fixed-horizon d** (or count only traders with ≥ 50 entries in it, which still
leaves a bias of 1.4 points at 50 [Final review F6: added]).

### Q7. What each paper entry stores

**Answer: every value the score uses, each stamped with the instant it was
read, and nothing that was read after the instant it describes** (code-rules:
"a rule that fixes an instant is read at that instant"; the lab's F9 review:
an analysis that reads a live collection has no fixed answer). An entry is
written in steps, each appended once and never edited:

1. **When following of the trader starts (once):** address (lower-case), style
   label and its version, the hold class and horizon h and the long share
   (from the 30 days before following; Q6), the run and slot, the notional.
2. **When the entry is seen:** the order event(s) — instrument, direction,
   kind (open, flip; add in the secondary arm), each fill's `trade_id`,
   `order_id`, `previous_size`, timestamp, price, quantity, `taker`,
   `liquidation`, fee; the merge with events within 60 s; t_fill (the first
   fill); `seen_at` (the poll that saw it), the poll interval then, `alert_at`
   (the toast accepted), the flags late / data-stale / outage with the
   poller's own clock gap.
3. **At t_follow = alert_at + R (and at each secondary reaction):** the book as
   read at that instant (its server `timestamp` and `sequence`, the levels
   used), the bbo, the ticker (mark, index, last, mid, funding rate, next
   funding), the VWAP for $1,000 and $10,000 on the follower's side, the fee
   rate in force, and the paper entry price. The read's own clock time is
   stored beside the server's; a read more than 2 s late is flagged.
4. **At every exit instant** (each mirrored reduce, close, flip or liquidation
   at its alert + R; the fixed-horizon exit at t_follow + h; the "open,
   marked" stop): the same fields as step 3, the fraction closed, and the
   funding rows for every whole hour crossed (the rate as published, read
   after that hour settled, with its read time).
5. **About an hour after the entry (the nulls):** the seed, the hour's trade
   count (from the klines read, with its read time), the three drawn
   `trade_id`s with their time, price, size and side, and each null leg's
   prices by the rule.
6. **When the vote completes:** the rule prices of the tracked leg and the
   nulls (with the rule's version and the capture instant of the history it
   read), d (median and mean of the nulls; also against matched nulls), the
   merge group, the vote, its completion time, and the e-process state (n, k,
   E) after it.

Rule prices come from a deterministic job reading a **stored capture** of the
history it needs (the 1 s mark around each instant, the tape of the null
hours), read once and never re-read; a changed rule is a new rule version and
a new score, never an edit. The live book of step 3 beside the rule price of
step 6 is the **audit** of the historical rule, kept for every real follow.

### Q8. Iron Rule 4, line by line

| Iron Rule 4 says | The design | Where |
|---|---|---|
| "every followed entry is recorded" | every opening and flip of a followed directional trader becomes an entry, also when late, when the data was stale, when a read failed (flagged, never dropped), and when following stops while it is open (marked) | Q2, Q3, Q7 |
| "at the price a follower could have had" | live: the book's VWAP for $1,000 on the follower's side at t_follow; historical: the mark rule, measured within ±1.6 bps per side outside the pre-IPO against live books on one Saturday morning [Final review F1: "on one Saturday morning" added], with the pre-IPO kept out of the primary cell (proposal); never the trader's own fill price, never a price before the fill | Q1 |
| "after the alert's delay" | t_follow = the alert's time + 60 s; R8 simulates the poll phase from a fixed seed; outage entries are priced at their real alert time and kept out of the vote | Q2 |
| "with fees" | the instrument's base-tier taker fee on both legs (0.04%; ANT 0.02% by its override), never the trader's tier or rebate | Q4 |
| "and funding" | every whole hour crossed, signed by direction, at the published rate (the scale inside), on the paper quantity at the mark | Q4 |
| "a trader is judged only on what they do after following starts" | votes only from entries with t_fill ≥ the follow start; the horizon class, long share and slot are fixed from pre-following data, and no pre-following return enters any score | Q6, Q7 |
| "never on the past that put them on a leaderboard" | the leaderboard rank is stored as context only; the scoreboard's only inputs are post-start entries | Q6 |
| (honest, implied) | the same rule prices both arms; no verdict below the bar; e-Bonferroni across traders; mirrored exits are money, not a vote (the disposition trap); the rules are frozen before the data and a changed rule is a new run | Q5, Q6 |

---

## 2. Variations weighed

- **The vote's exit: mirrored vs a fixed horizon.** Mirrored exits are what a
  copier does and stay the money record; as a vote they are invalid (E2 S3,
  E4). Fixed horizon chosen for the vote.
- **One horizon for all vs per trader.** A single 6 h is simplest; a horizon
  matching the trader's own holding time is far more powerful (S6: 60% vs 23%
  vs 3.8% at 1 h / 6 h / 24 h). Chosen: three classes, frozen beforehand.
- **Median vs mean of the nulls.** Median for the vote (exact), mean beside it
  for money.
- **Own-direction (A9) vs matched-direction nulls.** A9 kept for the vote (R8
  and the forward log measure one thing); matched shown beside it.
- **Two-sided vs one-sided e-process.** Two-sided kept; one-sided needs 7–18%
  fewer votes, the fewer the higher the bar [Final review F9: was "~10–20%
  fewer votes"].
- **e-BH vs e-Bonferroni.** e-Bonferroni (time-uniform, any dependence,
  almost the same as e-BH when nothing is real [Final review F5: was
  "identical to e-BH when nothing is real"]); revisit only if several traders
  cross the Bonferroni bar.
- **A sign e-process vs a betting e-process on the mean.** The mean is immune to
  exit habits but had no power with valid caps; kept out of the verdict.
- **Pooled: every entry, merged across traders, or one vote a day.** Daily
  chosen — the only one both valid and useful.
- **The historical price:** the first trade after t (A5), the first same-side
  trade, the mark, the mark plus a local basis, the last trade moved by the
  mark, the next trade moved back, the buy/sell midpoint against the mark or
  the index. The mark chosen (Q1 table).
- **Mean vs median half-spread in the rule.** The mean (a random instant pays
  the mean); quoted spreads at random instants, not the effective spreads of
  real takers (which are smaller).
- **Notional $1,000 vs $10,000 vs proportional.** $1,000 primary; the others
  stored.
- **Late entries: priced late and voted, priced late and not voted, or not
  recorded.** The middle one.

## 3. Possibilities found

1. **`tickers::all` is one WebSocket subscription carrying mark, index, mid,
   last and funding rate for every instrument ten times a second** (one frame
   per instrument, ~900 frames/s, ~180 KB/s) — a free 1-second price record
   of the whole exchange, if v1 wants one.
2. **`book::<iid>` is a full top-20 (or ::50) snapshot every 100 ms**, so a live
   paper entry can be priced from the stream with no HTTP weight.
3. **The all-instrument `bbo` (weight 2) gives every spread in one read**; the
   exchange's spreads every 30 s cost 4 tokens a minute.
4. **R8 needs no tape to price**: the 1 s mark history is the live mark, every
   second present (`out/an-checks.txt`); the tape is needed only for the nulls.
   [Final review F3: added — shown on one recent 1,000 s window; that 1 s
   marks exist for R8's period is not checked (Q1).]
5. **The settled funding equals the ticker's rate 5 s before the hour**
   (within 0.2% [Final review F11: added]), so the
   forward log can take funding from the stream and check it against
   `/v1/info/funding` later.
6. **A permanent audit of the historical rule:** the forward log reads the book
   at every follow instant anyway; the rule's price for the same instant gives
   a running error table, so R8's rule is checked for ever after R8.
7. **The disposition trap is measurable per trader at no cost:** the share of
   positive votes with mirrored exits minus the share at the fixed horizon
   shows how much a trader's exits (not entries) shape their win rate — a fact
   for the trader's page, not a score.
8. **The book-vs-index gap and the funding rate are visible for every
   instrument at every second**, so an off-hours alert can show them as facts.

## 4. Potential problems, and how each would be handled

| Problem | Handling |
|---|---|
| A trader's exit habit fakes a win rate (disposition) | votes at a fixed horizon only; mirrored P&L shown as money with n, never as a verdict (E2 S3, E4) |
| Baskets and herding make votes move together | merge overlapping windows per trader; the pooled board votes per day (E2 S1, S2, S5) |
| Many traders watched daily crown a lucky one | e-Bonferroni, bar 20·K; K fixed per run; shown as "E of the bar" (E1: 70–77% crowned at K = 50 without it) |
| The owner re-adds an unfollowed trader | the trader's e-process resumes from its state; never restarted inside a run (a restart is a fresh chance to cross) |
| The owner adds traders beyond K | a new run with its own α; the old verdicts stand |
| A verdict takes months to years | say so on the page (votes so far, the bar, the votes a 0.6 edge would need); the pooled board answers the group question sooner |
| A long-only habit in a trending market looks like skill | the matched-direction e-process beside the vote (Q5, Q6 item 8) |
| The spread table is one Saturday's; spreads and the weekend premium move by the hour | a weekday run before R8's numbers are frozen (proposal 5); R8's sensitivity with the half-spread and depth doubled; the forward log's audit |
| The mark sits off the book (ANT; off-hours equities and indices, by a few bps) | ANT out of R8's primary cell (proposal 2); the forward log prices at the book; the audit measures the rest |
| The book is quoted with dust (ANT: top levels of 0.007, ~$11) | the price is a VWAP for the notional, which walks through dust; never the top-of-book mid |
| The null hour has fewer than 3 eligible trades | draw with replacement from the hour; none: widen to ±1 hour, flagged; never skip silently |
| A read at t_follow fails or comes late | retry once within 2 s; else price by the historical rule, flagged "rule-priced" |
| Fee schedule or override changes | the rate is stored per entry; R8 states the schedule it used |
| A data freeze (the lab's frozen leaderboard) | entries during "data stale" are flagged and kept out of the vote, like outages |
| A client paced by the previous call's weight overruns a sliding minute (this study's slip) | send only when the trailing 60 s plus the next call stays inside the share [Final review F7: was "pace by the next call's weight: send only when …"; spacing by either call's weight overruns alike] |

## 5. What stays unknown, and what would settle it

- **Regular-session spreads, depth and mark behaviour for equities, indices and
  commodities:** everything here was measured on a Saturday, and even within
  it the premium and some spreads moved by the hour (Q1). A 2-hour run of these
  scripts on a weekday in US hours (14:30–21:00Z) settles the weekday table;
  the forward log's audit settles it for good.
- **How spreads looked in September–October** (R8's period): no past book
  exists. The rule depends on the past through the mark, which history keeps
  exactly, but its half-spread table is today's; R8's sensitivity (doubled
  spreads) bounds the effect.
- **Pricing ANT historically:** no rule found; whether a better one exists
  (for example one that models when ANT's mark follows its index) would need
  weeks of ANT's book.
- **Realistic entry rates and holding times of directional traders:** R2. They
  set how many votes a year a trader gives (E2: ~1.2–1.75 merged votes a day at
  2 entries a day).
- **Whether other copiers move the price after an alert** (ShieldTX's 63 bps on
  Hyperliquid, R5): the audit shows it as the book moving between the alert
  and t_follow.
- **The size of real edges:** unknown by design (R8's one look).
- **Behaviour in the 02:35–03:50Z window:** not observed (no calls, no
  stream).

## 6. Beyond the brief

1. **The sign e-process the brief named would have repeated the leaderboard's
   trap** if run on mirrored exits: it rewards a high win rate, and a trader
   banking small wins and holding big losers has one. This changes R8's
   A11 (iii) too (E4).
2. **Per-trader verdicts are slow by nature.** Even an edge three times the
   fees needs ~600 merged votes at 20 traders; a directional trader gives a few
   hundred a year. The scoreboard should say "too early" plainly for most of
   its life, and the pooled board is the realistic first answer.
3. **Watching more traders costs power:** the bar grows with K (400 at 20,
   1,000 at 50). Testing fewer traders makes verdicts sooner.
4. **The live competition meets the hardest instrument:** the competition
   running to 2026-11-16 boosts ANTH 3× (R1 Q12), so leaderboard traders may be
   heavy in the one instrument the rule cannot price; proposal 2 matters more
   than the instrument count suggests.
5. **Off-hours costs are real money:** on this Saturday equity and index books
   traded above their index by a few bps an hour, ANT by ~40–60, and funding
   charged the side the book leaned to (ANT: a long paid 0.17% over the 24
   hours to 03:00Z; KAITO's shorts paid 0.18%).
6. **A follower's realistic delay (~80 s) is longer than the edge horizon of
   the "fast" wallets Zhai found informative** (one-second returns, R5): the
   design measures what is left after the delay, which is the honest question,
   and should not be compared with studies that ignore the delay.
7. **Code-rule candidate (from this study's slip):** a weight-paced client must
   check the trailing 60 s plus the next call against the share before
   sending [Final review F7: was "must pace by the *next* call's weight (check
   … before sending)"; spacing by the next call's weight alone overruns as
   much as by the previous one, `workers/R3-REVIEW/out/check-pacing.txt`], or
   a sliding minute can exceed the share by one heavy call although the
   average is under it.
8. **ANT's mark switches regime** (following the index, then the book), so
   unrealized P&L at the mark can jump by tens of bps with no trade: show a
   paper position's P&L at the book's exit price, not at the mark.

## 7. Questions for the owner

The first six are **proposals awaiting the owner's ruling** (put by the
supervisor on 2026-11-07 ~05:30Z, recommendation "yes" on all six).

1. **Replace R8's A5 price ("the first public trade at or after the fill plus
   the delay, plus the cost of crossing the spread") by the mark rule** (the
   1 s mark at the follow instant + the instrument's mean quoted half-spread +
   mean depth for $1,000, both legs; `out/rule-table.json`, one Saturday
   morning's table, re-measured under question 5 [Final review F1: added]),
   keeping A5 as a check? *Recommendation: yes* — a mean absolute error of
   0.3–4.9 bps per side outside the pre-IPO (its mean within ±1.6) against
   A5's 1.7–19.5 bps (its mean up to ±6.4) [Final review F4: was "±1.6 bps
   per side outside the pre-IPO against A5's 1.7–19.5 bps mean abs error",
   which set the rule's mean error against A5's mean absolute error].
2. **R8's primary cell without pre-IPO entries (ANT), a secondary with
   them?** *Recommendation: yes* — no rule priced ANT within ±20 bps.
3. **The vote on fixed-horizon d (1 h / 6 h / 24 h by the trader's own holding
   time before following), the mirrored exits as money only, and A11 (iii) on
   fixed-horizon d, each entry's d taken against the median of its 3 nulls
   (A9's mean kept for (i) and (ii))?** [Final review F2: the median added —
   Q5 and Q6 item 2 change A9's "d = tracked − the mean of its nulls" for
   the vote, which no question said] *Recommendation: yes* — mirrored exits crown zero-skill
   disposition traders.
4. **e-Bonferroni with K trader slots per run, K = 20 (a verdict at E ≥ 400),
   and the pooled daily board shown first?** *Recommendation: yes* — fewer
   slots give faster verdicts; the pooled board answers the owner's own
   question months sooner.
5. **A 2-hour weekday measurement in US hours (e.g. Monday 2026-11-09
   14:30–16:30Z) with these scripts, as a condition before R8's numbers are
   frozen?** *Recommendation: yes* — this table is one Saturday morning's, and
   the supervisor's own snapshot showed it moving by the hour.
6. **The paper notional $1,000 ($10,000 stored)?** *Recommendation: yes,*
   unless the owner's own size is very different; the book is stored, so other
   sizes can be priced later.
7. **Show the matched-direction e-process (against the trader's own long/short
   habit) beside each trader's vote?** *Recommendation: yes* — it separates
   timing and direction skill from a long habit in a rising market, at no
   extra API cost.

## 8. For external-apis

New facts, each dated and sourced (this worker's `docs/`, `raw/`, `out/`). For
the supervisor to copy; nothing here was written to external-apis.

- **No sign the specs changed since R1 (2026-11-06):** the saved
  `asyncapi-perps.json` (2026-11-07 00:47Z) is 407,525 bytes and
  `perps-openapi.json` (01:09Z) 383,007 bytes, R1's sizes — `docs/` (not
  diffed: R1's copies are outside this worker's folder) [Final review F8:
  was "Docs changed since R1 … 407,493 bytes … 382,865 bytes" —
  `scripts/dl-docs.mjs` printed a JavaScript string's length (UTF-16 units)
  as bytes; the files hold 16 and 73 non-ASCII characters;
  `workers/R3-REVIEW/out/check-docs-bytes.txt`].
- **Mark price** (docs, Mark Price, read 2026-11-07 00:47Z): the median of
  C1 = index + an EMA over 150 s of (mid − index), C2 = median(best bid, best
  ask, last trade if recent), C3 = an aggregate of external mark feeds;
  recomputed every 200 ms, snapped to the tick; each candidate falls back to
  the index. **Measured:** ANT-USD's mark equalled its index 32.8% of the
  seconds 00:53–05:21Z and otherwise sat between the index and the book mid
  (between them 92.7% of seconds; equal to the ticker mid 8.4%, within 2 bps
  of it 13.1%) [Final review F11: was "and at other times followed the
  book"; `workers/R3-REVIEW/out/check-data-counts.txt`]
  (`out/an-ticks.txt`, `out/an-ant.txt`).
- **Index price** (docs): a weighted average of external feeds (Pyth, Chainlink
  Data Streams, Hyperliquid named) chosen by the market's session; every
  200 ms.
- **Sessions** (docs, Market Sessions): Regular, Overnight, Weekend, Disrupted,
  Halted; they change only which external feeds set the index and C3 — not
  funding, margin, matching or liquidation.
- **Funding** (docs, Funding): a premium sampled every 5 s from the VWAP of
  $1,000 on each side of the book against the index, averaged over the hour;
  F_8h = scale × (mean premium + clamp(0.0001 − mean premium, ±0.0005)), scale
  1.0 crypto, 0.5 otherwise; hourly rate = clamp(F_8h/8, ±4%); settled at the
  end of each 1-hour window on every open position. **Measured:** at rest
  crypto shows 0.0000125 an hour and non-crypto 0.00000625 (the scale is inside
  the published rate); the settled rate (`/v1/info/funding`) equals the
  ticker's `fr` 5 s before the hour within 0.2% [Final review F11: "within
  0.2%" added] (8 instruments, 01:00 and 02:00Z
  2026-11-07); `nxf` is the next whole hour (`out/an-checks.txt`).
- **`funding_multiplier` is null on all 90 instruments; ANT-USD (pre_ipo) has a
  `fee_override`:** from 2026-10-29T15:23:35.757Z, no end; tiers from taker
  0.0002 / maker 0.0000625 down to taker 0.0001 / maker −0.00005; ANT's
  `ui_live_time` 2026-10-29T16:34:50Z (`raw/instruments-*.json`, 00:50Z).
- **WebSocket `tickers::all`** (asyncapi; measured 2026-11-07 00:51Z, 20 s): one
  subscription; one frame per instrument per 100 ms (~900 frames/s, ~180 KB/s
  for 90 instruments); frame {ch "tickers::<iid>", ts, ets, sq, data {iid,
  idx, mark, last, mid, oi, fr, nxf}}; the ticker `mid` is snapped to the tick.
  Ran 00:53–02:33Z and 03:50–05:21Z, one connection each, with no close or
  reconnect (connect 1.1 s both times; `out/wsrec-events.log`).
- **WebSocket `book::<iid>`** (asyncapi): a top-20 snapshot every 100 ms
  (`::50` for 50 levels); data {b, a}; ~10 frames/s, ~8.5 KB/s for BTC. Frames
  still in flight after an unsubscribe arrive for a moment.
- **Inbound WebSocket messages** (asyncapi): each request consumes a weighted
  message token, per IP before authentication; over budget →
  `message_rate_limited`, the socket left open. The `funding` channel is
  private.
- **Mark history** (spec): "Only buckets with at least one mark update are
  included". **Measured:** at `interval=1s` every second was present in one
  1,000 s window (01:23:50–01:40:30Z) on six instruments [Final review F3:
  was "in six 1,000 s windows (01:23–01:40Z)"; older windows not read] and
  matched the live mark (within 0.5 bps in 74–100% of seconds).
- **Trades:** `sort=asc` with `cursor` pages correctly (140 reads, 3,255
  distinct trades, 0 errors; 2026-11-07 03:50–05:20Z).
- **Books on a weekend:** a depth-100 book can hold fewer than 100 levels
  (META-USD 38 bid levels at 00:53Z); ANT's top levels are often dust (0.007
  ANT ≈ $11).
- **Spreads, depth and the book − index premium on Saturday 2026-11-07
  00:53–05:21Z** — the tables in Q1 (`out/an-q1a.txt`, `out/an-ticks.txt`);
  they move by the hour.

---

## Evidence list

All paths are in `E:\coding\Claude\supervisor\polymarket-follow\workers\R3-PAPER\`
unless they start with `F:`. Every figure above comes from one of these; each
output prints its run time (UTC) and sample sizes.

**Scripts** (`scripts/`, written with the Write tool unless noted, run with
`< /dev/null`, to a file, under `timeout`): `lib.mjs` (the HTTP client: public
GETs under `/v1/info/` only, user agent `polymarket-follow-research`, paced by
weight at 45 tokens a minute, every call logged to `out/calls.jsonl`, a stop
file at the first 429, refusal inside 02:35–03:50Z), `dl-docs.mjs`,
`async-channels.cjs`, `probe1.mjs` (instruments), `probe2.mjs` (statistics),
`wsprobe.mjs`, `wsrec.mjs` (WebSocket recorder), `livesampler.mjs` (Session A),
`sessionb.mjs` (Session B: tape, funding, mark history, bbo, books),
`peek-gz.cjs`, `an-load.cjs`, `an-q1a.cjs`, `an-q1b.cjs`, `an-ticks.cjs`,
`an-checks.cjs`, `an-ant.cjs`, `an-table.cjs`, `an-delay.cjs`,
`an-power-days.cjs`, `an-budget.cjs`, `sim-lib.cjs`, `sim-e1.cjs`, `sim-e2.cjs`
(one line patched with `sed` at 01:08Z; later edits with the Edit tool),
`sim-e3.cjs`, `sim-e4.cjs`, `sim-e5.cjs`.

**Simulation outputs** (`out/`, seeded, no API): `sim-e1.txt` (idealised votes,
daily looks, K = 1–50, 4,000 paths, 365 days); `sim-e2-S0_random.txt` …
`sim-e2-S8_slow_traders.txt` (market simulation, 400 paths × 120 days each);
`sim-e2-h60.txt`, `sim-e2-h1440.txt` (horizons); `sim-e2-365-*.txt` (the
recommended configuration over a year: K = 5, 1,000 paths; K = 50, 600 paths
and 400 + 400 variants; K = 20 power, 500 + 500); `sim-e3.txt` (power, 4,000
paths); `sim-e4.txt` (exit habits, 200,000 trials); `sim-e5.txt` (direction
habit, 300 one-year runs a cell); smoke runs `*-smoke.txt`.

**Live outputs** (`out/`): `calls.jsonl` (every HTTP call), `an-budget.txt`,
`an-budget-sessionA.txt`, `probe1.txt`, `probe2.txt`, `wsprobe1.txt`,
`async-channels.txt`, `bbo-*.jsonl` (all-instrument bbo snapshots),
`an-q1a.txt`, `an-q1a-sessionA.txt`, `an-ticks.txt`, `an-ticks-sessionA.txt`,
`an-q1b-N1000.txt`, `an-q1b-N10000.txt`, `an-q1b-sessionA-N1000.txt`,
`an-checks.txt`, `an-ant.txt`, `rule-table.json`, `rule-table.txt`,
`an-delay.txt`, `an-power-days.txt`, `tape/<iid>.jsonl` (28 instruments), the
event logs `wsrec-events.log`, `livesampler-events.log`, `sessionb-events.log`
(+ `-partial` analysis files taken during the runs). **Raw:**
`raw/instruments-*.json`, `raw/statistics-*.json`, `raw/wsprobe-*.json`,
`raw/funding-*.json`, `raw/mark-history-*.json`. **Large data:**
`F:\polymarket-follow-research\R3-PAPER\` — `ticks-*.csv.gz` (the 1-second
ticker of all 90 instruments), `wsbook-*.jsonl.gz` (1-second top-20 books, two
instruments at a time), `books-*.jsonl.gz` (depth-100 books). **Docs as
downloaded:** `docs/` (llms.txt, asyncapi-perps.json, perps-openapi.json, the
mark, index, sessions, funding, fees, liquidation, realtime, market-data,
markets and FAQ pages, 2026-11-07 00:47Z and 01:09Z). **Paper:** Wang &
Ramdas, "False discovery rate control with e-values", arXiv 2009.02824v5
(2021-12-15), read through its ar5iv HTML on 2026-11-07 ~00:58–01:00Z (rules
broken, 3). **Drafts** sent at the planned stop (05:25Z):
`drafts/q1-pricing-rule.md`, `drafts/q6-statistics.md`. **Progress log:**
`progress.md`.

---

## Corrections by the Final review (R3-REVIEW, 2026-11-07)

R3-REVIEW (Opus 5.5, max), a fresh subagent, from 05:34Z, on R3-PAPER's own
brief: the scripts, every number's source, unit and grouping, and whether
each claim follows from its evidence. No API call was made; R3's seeded
simulations were re-run and its saved data re-analysed locally. Evidence: the
supervisor folder's `workers/R3-REVIEW/` (`scripts/`, `out/`, `progress.md`).
Each finding is fixed in its own commit and marked in place
(`[Final review Fn]`), the old text quoted in the marker, never silently
replaced.

**Medium — could mislead a decision or a fact file**

| # | Finding | Fix |
|---|---|---|
| F1 | The rule's table and its ±1.6 bps are one Saturday morning's, but that caveat (with the supervisor's 05:26Z snapshot) stood only beside the category table, in headline 5, §4, §5 and question 5 — not where the rule is used. Checked out of sample within the morning (the table from one session, the error on the other): the largest per-side mean outside the pre-IPO is 1.44 bps (1.53 in-sample), so the small error is not an artefact of fitting; weekdays and R8's period stay unmeasured | caveat added in headline 1, the Q1 answer and its ±1.6 bullet, Q8, §7 question 1; `out/check-pricing-xval-N1000.txt` |
| F2 | Q5 and Q6 item 2 take the vote's d against the median of the 3 nulls; A9 fixes d against their mean, so this changes a rule the owner fixed, yet neither the status paragraph nor any question in §7 said so — a "yes" to question 3 would not cover it | the median added to the status paragraph and to question 3 (the question changes: the supervisor's note to the owner needs it) |
| F3 | "The 1-second mark history that R8 would read is the live mark" and "R8 needs no tape to price" rest on one 1,000 s window (01:23:50–01:40:30Z, six instruments) read 2.5 hours later; whether 1 s buckets exist for September–October, R8's period, was never read, and R8's rule and cost depend on it | stated in Q1, §3 item 4 and §8, with the one read that settles it; the "sub-second timing" claim checked (±1 s shift: 97–100% agree, `out/check-markhist.txt`) |
| F4 | The rule against A5: headline 1's "5–15× less noisy" — the mean absolute error ratio is 1.7× (commodities) to 15× (small coins), under 5× on commodities, indices and equities; and question 1's reason set the rule's mean error (±1.6) against A5's mean absolute error (1.7–19.5), two different measures | headline 1 and question 1 corrected (the rule's mean absolute error is 0.3–4.9 bps a side outside the pre-IPO; A5's mean reaches ±6.4); `out/check-arith.txt` |
| F5 | Q6 item 4 and §2: "Under the global null e-BH is the same rule (its first rejection needs K/α)" is false — e-BH rejects r hypotheses when each passes K/(r·α) (the paper's own self-consistency condition); E1's re-run found it rejecting on a day no E had reached 20·K in 5 of 60,000 null paths, once where e-Bonferroni never did. The choice of e-Bonferroni stands (time-uniform, any dependence). Also "the same instrument at once" should read the same or correlated instruments at overlapping times | corrected in Q6 item 4 and §2; the paper's rule, Theorem 2 and §7's condition verified against its own text (rules broken 3; `scripts/pdf-text.cjs`, `out/check-e1-ebh.txt`) |
| F6 | E4's "63.4% of single comparisons (200,000 trials)" and its n-entry shares are each a share of 4,000 resamples of the trials (±0.8 point): the run reproduces them exactly, but the exact share is 62.85%, and at 20 and 50 entries the bias is 52.6% and 51.4%, not 53.6% and 50.5% — so "count only traders with ≥ 50 entries" does not remove it | Q6 item 1 and the A11 (iii) paragraph corrected; `out/check-e4-exact.txt` |
| F7 | The code-rule candidate (rules broken 1, §4, §6 item 7) said to "pace by the *next* call's weight"; replaying the 1,796 calls' weights, spacing by the next call's weight reaches 54 in a trailing minute exactly as spacing by the previous one does — only the admission check in its parenthesis (trailing 60 s plus the next call within the share) holds 50 | the three places reworded to the admission check; `out/check-pacing.txt` |
| F8 | §8, for external-apis: "Docs changed since R1 — asyncapi 407,493 bytes (R1 407,525), openapi 382,865 (R1 383,007)". `dl-docs.mjs` printed `body.length`, a JavaScript string's UTF-16 length, as bytes; the saved files are 407,525 and 383,007 bytes, R1's own sizes, so there is no evidence of a change | the bullet corrected; `out/check-docs-bytes.txt` |

**Low — a slip; no conclusion changes**

| # | Finding | Fix |
|---|---|---|
| F9 | Q6's figures: "1–14 votes" when merged across traders (the outputs show 1–12 at 2 entries a day, 80 at half an entry); one-sided "~10–20% fewer votes" (12–18% at the bar of 20, 7–9% at 400, the bar recommended); the 30 bps and 15 bps edges' shares are of entries, used as the merged-vote P of E3 (merged votes: 61.0, 58.3, 56.7% at 1, 6, 24 h; 54.2% for 15 bps); the owner's-view example's E (0.6, 0.5) does not match its counts (0.23, 0.29) | corrected in Q6 items 5–7, the power paragraph, the year table, the example and §2; `out/check-e2-merged-S*.txt`, `out/check-arith.txt` |
| F10 | Q1's details: the trade-anchored rules were called worse "on equities", where two of them had less bias than the mark (and more noise); the category table sets medians from two samples side by side (bbo snapshots, rotating books), so ANT's crossing median sits below its half-spread median although crossing includes it; the rule table's $10,000 column is not usable for PRL-USD (half its book sides could not fill $10,000, the rest 343–581 bps) or fully for NCLD-USD, and each depth cost rests on 13–14 books — none of it stated | the three stated in Q1; `out/check-data-counts.txt` |
| F11 | Facts proposed for external-apis: the settled funding "equals" the ticker's rate "to three digits" — ZEC (5.470e-6 against 5.480e-6) and KAITO (−7.682e-5 against −7.695e-5) differ in the third digit, all within 0.2%; ANT-USD's mark "at other times followed the book" — it equalled the ticker mid in 8.4% of seconds and sat between index and book in 92.7% | Q4, §3 item 5 and §8 corrected; `out/check-data-counts.txt` |
| F12 | Two justifications that do not follow: Q6 item 3's "returns over disjoint windows are independent whatever the instruments' correlation" (false under volatility clustering, which E2's own market has; what the merge needs is that each vote stays a fair coin, which E2 shows); Q2's "an outage … cannot bias it", true for this PC's outages but not for alerts late because the exchange's data lagged, which the same rule (and §4's "data stale") leaves out of the vote | both qualified in place |
