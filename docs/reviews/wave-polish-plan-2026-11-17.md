# WAVE-POLISH-PLAN — the plan for sharpening the liquidation wave: the candidates, the search, the choice, the extraction and one exam on FRESH

WAVE-POLISH-PLAN (Opus 5.5, max), 2026-11-17 19:49Z – 20:28Z (UTC; every
stamp from `date -u`), for polymarket-follow's supervisor. The frame: the plan
page's polishing row (step 1, "a plan") and the backlog's "After WAVE-H's
answer", ideas 2–4; decisions 2026-11-17 ("WAVE-H — the one look's result",
"the fresh months", "WAVE-H's Final review accepted"). Evidence: the
supervisor folder's `workers/WAVE-POLISH-PLAN/` (`progress.md`; `scripts/`,
`out/`). **This is a plan: nothing is built before a fresh review and the
owner's approval.** It plans paper tests on history; it never trades and
tells no one what to trade.

**What I read and measured.** The project's docs, the four reviews, both rule
files and the look's `result.json` and `report.json` (read only). Three small
measurements on WAVE-H's store, counts and timings only, every file held to
`waveh/data.sha256`; no candidate's return was computed (`out/m1-*.json`,
`out/m2-ctxs.json`, `out/m3-blocks.json`). One arithmetic script reads no data
(`out/power.txt`). **Never opened:** FRESH's store, even its manifest (it was
not needed); `look\` beyond its two files; any frozen file for writing; the
collector's recordings and database, the run folder, the paper experiment's or
MARKET-1's data. No network call, no agent, no fetch, no `dist/waveh.js`;
polymarket-lab not touched. One read was refused by the session's safety
check (the first bytes of WAVE-H's store `manifest.jsonl`); it was not needed
and not retried. Nothing in the repository changed but this file.

*Holds and does not hold are verdicts on a test, never instructions to trade.*

## For the owner, in one page

**What this plan does.** It fixes, before any candidate's result exists:
1. the candidates — 38 named changes to the wave, and how each is measured;
2. the choice rule — how one sharpened rule is picked from them so that the
   choice survives the tries behind it;
3. the exam — how that one rule is tested once on FRESH, Hyperliquid's months
   that no rule has seen;
4. the extraction — the store that makes every try run in minutes, the first
   piece of your analyzer.

**The good news first.**
- **The 10 months are a rich practice ground.** WAVE-H's wave pooled over all
  147 slices made +66.1 ± 31.3 bps before costs over 176,986 positions, with
  146 of 147 slices above zero. Its lines point three ways: forced sells,
  bigger waves and a fast entry.
- **The move back is fast on Hyperliquid.** Entering an hour late cost about
  62 of the 95 bps on marks, so about two thirds of the gain came in the
  first hour.
  **Shorter holds may keep most of the gain with far less noise.** Six hold
  times are on the list. A precise rule is the cheapest way to a clear answer
  (section 3.5).
- **Pooling every slice cuts the error by a quarter** (41 → 31 bps over the
  10 months), and 20 slices already give 31.8.
- **The data hold more than the wave used:**
  - every liquidation of every account, with its mark price;
  - each coin's open interest, oracle price and premium every minute;
  - the backstop fills;
  - the node's own timing: a fill is visible 0.11–0.14 s after its block.
- **The extraction is cheap.** One pass of about an hour builds a 16 GB store
  with no new dependency. Before it is trusted, it must reproduce WAVE-H's
  1,299 positions and 1,289 prices, which are already confirmed twice.

**One problem I found, and its fix.** FRESH runs from 2026-05-29 to 11-15.
**It holds 2026-08-31 → 11-07, the 68 days on which the wave was found on
Polymarket** (MARKET-FIND; STRATEGY-REVIEW before it). Most of the wave's
move back is the whole market's, so Hyperliquid's waves on those days ride
the same market moves. A result there would partly be the discovery seen
again. WAVE-ELSEWHERE kept Polymarket's months out of WAVE-H for this reason.
- **My recommendation:** the exam decides on FRESH's other days, about 100
  of them, and prints the discovery window apart.
- The same cut removes most of FRESH's thin `asset_ctxs` files, which begin
  on 2026-09-22.

**What the exam can and cannot settle** (arithmetic from the 10 months'
errors, `out/power.txt`):

| The rule | Error on FRESH's ~100 clean days | HOLDS needs a mean above | Confirmed 4 times in 5 at |
|---|---|---|---|
| The wave, every slice pooled | 54 bps | +140 | +185 |
| A narrower rule (error 40 over 10 months) | 69 | +179 | +237 |
| A short-hold rule (error 15 over 10 months) | 26 | +67 | +89 |
| The pooled wave, a second look with the months to 2027-02-05 (z 2.81) | 40 | +113 | +147 |

So FRESH can confirm a large effect, or a precise one. A pooled wave of about
+60 bps would most likely come back NOT SETTLED again. That is why the choice
rule judges each change by **the result per unit of its error**, which is
what the exam needs, and not by the mean alone.

**The choice rule, in short.**
- Each of the 38 changes is measured against the base wave on the earlier
  months (2025-06-01 → 12-29).
- A change is kept only when it raises the result per unit of error, by a
  gain of at least 2.5 times its own error there. The gain must then hold on
  the later months (2026-01-01 → 05-26) by at least 1 error.
- At most three changes are combined, one per family.
- Under pure chance, the risk that a useless change reaches FRESH is at most
  about 4%. If nothing passes, the base wave pooled over every slice goes to
  FRESH, a cleaner replication of WAVE-H with a smaller error.

**The try budget, plainly:**
- 38 single tries and 1 combination on the earlier months;
- at most 4 evaluations on the later months;
- one exam on FRESH.

Nothing else touches an outcome. The prints beside are listed now and choose
nothing.

**Your decisions** (section 9, each with my recommendation):
1. the plan itself, after its fresh review (yes);
2. the exam without the discovery window (yes);
3. one look or two (two: the second on the months to 2027-02-05);
4. z and δ as WAVE-H's (yes; δ = +50 bps a position for any hold);
5. every slice pooled as the deciding line (yes);
6. features of any venue allowed, each tagged (yes);
7. MARKET-1's second arm as one arm after the polishing's freeze (yes);
8. the store: no new dependency now; about 16 GB now, about 11 GB for FRESH,
   up to about 50 GB of FRESH's books (yes).

---

## 1. What is explored, and how

### 1.1 The base rule B0

**B0 is WAVE-H's wave, word for word (H4–H7), pooled over every slice:**
- the counted fills (H4) of the 38 small coins;
- the slices (address mod M, M = 147, H5);
- an entry by M5 inside each slice;
- $1,000 against the forced side at x_in = t + 2 min, closed at
  x_out = x_in + 24 h, no stop;
- **every slice's entries together**, each position counted alike.

Its 10-month value before costs is known (+66.1 ± 31.3 on marks). Its net at
the tape is not, and is the first number the exploration prints.

Every candidate is B0 with one change. A filter keeps a subset of B0's
positions. A variant (delay, hold, exit, wave size) moves its legs or its
entries.

### 1.2 The candidates, named in advance

"E median" is the median of the feature over B0's positions in the explore
months. It is computed from the feature alone, before any outcome, and frozen
as a number. "Venue" tags where a feature can be seen:
- PM: Polymarket's pool, so MARKET-1 could run it;
- HL: Hyperliquid's full record only;
- both.

**Side, entry, hold**

| # | Name | The change from B0 | Expected way, and why |
|---|---|---|---|
| 1 | S1 SELLS | forced sells only (we buy) | better: once the longs are closed nobody is left to sell; the look: sells +122 ± 52, buys −19 ± 65 (slice 0). Both |
| 2–5 | D0, D5, D15, D60 | x_in = t + 10 s, 5 min, 15 min, 60 min | faster is better if the move back starts at once; the look's LATE 1 h lost about 62 of 95 bps on marks. D0 is "at once": the node shows a fill 0.11–0.14 s after its block (M3), plus a reader's and an order's time. Both (on Polymarket a paper delay) |
| 6–11 | H1, H2, H4, H8, H12, H48 | x_out = x_in + 1, 2, 4, 8, 12, 48 h | a shorter hold keeps the early move back with less noise; 48 h because MARKET-FIND's second day added +71 with twice the error. Both |

**Wave size** (the brief's accounts, coins, notional)

| # | Name | The change from B0 | Expected way, and why |
|---|---|---|---|
| 12 | W1 THREE | at least 3 different accounts of the slice in the wave | bigger forced flow, bigger overshoot (MARKET-1's B5). Both |
| 13 | W2 M DOUBLED | M = 294, every one of its slices pooled | the look: +206 ± 105 (slice 0). Both (half the pool) |
| 14 | W3 COINS | at least 2 different small coins in the slice's wave | MARKET-1's B4. Both |
| 15 | W4 VENUE | the accounts liquidated on σ in small coins in the 60 minutes up to t, venue-wide, at least the E median | the whole cascade, not a slice's glimpse of it. HL |
| 16 | W5 FLOW | the coin's venue-wide liquidated notional of σ in the 60 minutes, divided by its mean hourly traded notional over the 7 days before, at least the E median | forced flow large against the coin's usual trade. HL |

**The market before the wave** (the owner's observation: crash days hurt,
consolidation helped)

| # | Name | The change from B0 | Expected way, and why |
|---|---|---|---|
| 17 | R1 TREND | the basket's 7-day move went the forced way (it fell before forced sells, rose before forced buys); MARKET-1's S definition | better: capitulation; MARKET-FIND's coin-count wave: sells after a falling week +346, after a rising one +110. Both |
| 18 | R2 CRASH | left out: the basket's 24-hour move the forced way beyond its E 90th percentile | worse: the cascade goes on; the look's worst day lost 6,141 bps over 4 positions. Both |
| 19 | R3 BTC CRASH | left out: BTC's 24-hour move the forced way beyond its E 90th percentile | worse, as R2. Both |
| 20 | R4 CALM | the basket's 7-day range (highest ÷ lowest − 1) below its E median | better: a spike in a quiet market is an overshoot. Both |

The basket is the small coins' mean move, from at least 5 coins with both
prices (MARKET-1's S).

**Coins, session, exits**

| # | Name | The change from B0 | Expected way, and why |
|---|---|---|---|
| 21 | C1 THIN | the less traded half of the 38 coins, ranked each month by traded notional over the 30 days before | better: MARKET-FIND's least traded third +360 against +239 for the most. Both |
| 22 | C2 WIDE | the wider half by median impact spread ((impact ask − impact bid) ÷ mid) over the 30 days before the month | better before costs; the net decides. Both |
| 23 | C3 SMALL | the smaller half by mean open interest × mark over the 30 days before the month | better, as C1. Both, if Polymarket's open interest is recorded (to be checked) |
| 24 | T1 NOT 08–12 | left out: t in 08:00–12:00 UTC | MARKET-FIND's one weak block. Both |
| 25 | T2 WEEKDAYS | left out: Saturdays and Sundays (UTC) | weekend books are thinner, so cascades run further. Both |
| 26 | X1 TARGET | out at the first minute's end at which the price has won back half of its move over [t − 60 min, t], else at the hold's end | the edge is the move back; holding after it comes adds only noise. Both |
| 27 | X2 STOP | out at the first minute's end at which the position is 1,000 bps down on the minute price, else at the hold's end | your tail: the look's worst position lost 4,906 bps. A stop usually costs mean in a move-back trade, so one try only. Both |

An exit's leg is at the next minute's start and is priced like any leg. The
minute price is defined in 1.4.

**Why these exits and no others.** The fixed hold is the honest default, and
the hold family already tests the time. An exit beyond it is worth a try only
with a mechanism:
- the target, because the move back is the edge;
- the stop, because of the tail.

A trailing stop, a time-of-day exit or a stop on the basket would each add
tuning with no mechanism. They are not tried.

### 1.3 The search for new patterns: a fixed feature list

**The fields that exist** (measured, `out/m1-summary.json`, `out/m2-ctxs.json`,
`out/m3-blocks.json`):
- **Every liquidation** carries `{liquidatedUser, markPx, method}` on both
  legs: the forced account's taker leg and the counterparty's maker leg (or
  the backstop vault's taker leg). That is 10,763,982 such records over the
  store, half of them own legs.
- **`dir` gives no cross or isolated flag** for a market liquidation: the
  sample's own legs read "Close Long" and "Close Short". That feature is out.
- **`asset_ctxs` holds every minute's numbers for every coin:** mark, oracle,
  mid, impact bid and ask, open interest, predicted funding, premium and the
  day's volume. Every cell is a number on the three days checked, for the 38
  coins, BTC and ETH.
- **The blocks give the node's timing:** a fill's time is its block's time,
  and the node wrote it 0.11–0.14 s later at the median (p99 about 0.21 s).

**The new features.** Each has one cut, fixed before any outcome, and a way
stated in advance. Each is one try.

| # | Name | The change from B0 | Expected way, and why |
|---|---|---|---|
| 28 | N1 BURST | the slice's wave: every one of its σ fills lies within the 10 minutes up to t | a fast cascade overshoots more. Both |
| 29 | N2 BIG FILL | the entry fill's notional ÷ the coin's mean traded notional a minute over the 7 days before, at least the E median | the forced order's own impact. Both |
| 30 | N3 CROWDED | the coin's last settled funding before t, signed toward the forced side (longs paying, before forced sells), above its 90th percentile of the 30 days before | a crowded side, now cleared. Both |
| 31 | N4 BOUNCED | left out: by x_in the price has already won back half of its move over [t − 60 min, t] | less left to gain. Both |
| 32 | N5 BACKSTOP | a backstop liquidation of σ (any coin, venue-wide) in the 60 minutes up to t | the book could not absorb the forced flow. HL |
| 33 | N6 REPEAT | left out: the slice had an entry in the coin in the 24 hours before (beyond M5's 60-minute block) | a second wave is a trend. Both |
| 34 | N7 OI DROP | the coin's open interest fell over the 60 minutes up to t by more than its E median fall | deleveraging done. HL; **print only** |
| 35 | N8 DISCOUNT | the coin's premium at t the forced way (the perp below the oracle after forced sells) beyond its E median | the perp converges to the oracle. HL; **print only** |
| 36 | N9 THROUGH | how far the coin's counted fills of σ in the 60 minutes traded through their `markPx` (signed mean), at least the E median | forced orders met a thin book. HL |
| 37 | N10 MARKET-WIDE | BTC or ETH had at least two different accounts liquidated on σ, venue-wide, in the 60 minutes up to t | a market-wide cascade. HL |
| 38 | N11 VOLATILE | the coin's realized volatility over the 24 hours before t ÷ its 30-day median, at least 1.5 | larger overshoots in a wild market. Both |

**N7 and N8 are printed, never adopted.** They need `asset_ctxs` at the
instant. FRESH's day files may be partial (3.4), and a rule that needs them
could lose its exam to WITHHELD. They are still counted as tries.

**The counterparties.** The backstop vault is N5. Which market makers took
the forced flow, and whether they profit, needs every trader's history: that
is PAPER-H's store (4.4), a lead for later.

**Not tried:**
- anything from the order book at the entry (spread, imbalance): only slice
  0's legs have archived books in the store;
- the builder and TWAP fields: no mechanism;
- the liquidated accounts' own past: needs PAPER-H's store.

### 1.4 How a try is measured

**The prices.** For the exploration, every leg is priced at the tape: H8's
second rule, the first takers on our side in [x, x + 60 s) walked as levels,
with backstop fills left out.
- The store holds every taker fill of the 38 coins, so every slice's legs
  can be priced. Archived books exist only for slice 0's legs.
- No trade in that minute leaves the position unpriced, and it is counted.
- Fees are 4.5 bps a leg. Funding is settled hourly (H9).
- **The minute price**, used for funding, BASE, the excess, the features and
  the exits, is the mark at the minute's end (H10). Where a coin's minute has
  no mark within 5 minutes, it is the coin's last trade within the 5 minutes
  before. Wherever WAVE-H had a mark this is WAVE-H's reading; the last trade
  only fills WAVE-H's holes. In the 10 months those are few: 0 failing mark
  rows, and 92 funding settlements without a mark, none of them in a
  position WAVE-H priced.

**The statistic of a rule R** on a part:
- m_R, the mean net per position;
- SE_R, M10's two-way error by the UTC day of t and the coin;
- z_R = m_R ÷ SE_R.

The exam's power grows with z (3.5), so z is what a change must raise.

**The test of a change V against B0, the D-test:**
- D = m_V − k · m_B0, where k = SE_V ÷ SE_B0, both on the explore part. D > 0
  exactly when V's result per unit of error beats B0's.
- Its error comes from each position's influence: (x − m_V) ÷ n_V for V's
  positions, minus k · (x − m_B0) ÷ n_B0 for B0's (a position in both
  contributes both).
- The influences are summed by day, by coin and by (day, coin), as the kit's
  CR1 does. SE_D = √max(V_day + V_coin − V_both, V_day, V_coin), and
  t = D ÷ SE_D.
- This one test works for filters (nested), variants (paired) and different
  position sets (W2) alike, with the code that already computes M10.

A change must also keep, on the explore part:
- the rule's mean net at +50 bps or more (your line), so FRESH is never sent a
  rule whose likely answer is "below your line";
- positions on at least 40 days and in at least 15 coins, so the exam's ~100
  days can meet TOO FEW's 20 days and 10 coins.

### 1.5 The split, and what is printed beside

**The two parts** (positions are assigned by t; every part's positions close
inside it):
- **E, explore:** entries 2025-06-01 → 2025-12-29, about 212 days. That is
  SIZING after a 7-day warm-up, plus TEST's first five months, the
  2025-10-10 crash among them.
- **C, check:** entries 2026-01-01 → 2026-05-26, about 146 days. These are the
  months closest to FRESH.

Entries stop 50 hours before a part's end (the longest hold plus the longest
delay). So every candidate uses the same entries, and no position's outcome
crosses into the other part. Trailing 30-day measures use the days available
(at least 7) until 30 exist. A feature that cannot be computed at an entry
leaves that position out of that try, and it is counted.

**Honest about what was seen.** The look printed slice 0's sides, M doubled,
LATE and the months over all 10 months, C's months included. So for S1, W2 and
the delay family, C is not a clean check: those leads were suggested by data
that include C. For them only FRESH is clean. For the other 32 tries, C has
never been looked at.

**Printed beside, choosing nothing** (for B0 and for the nominee):
- each month; each side;
- without the two best days; each day and coin left out;
- the tail: the worst day, the largest fall, the most open at once;
- the error against the number of slices pooled, K = 1, 5, 10, 20, 50, 147;
- **the tape against the book on the same legs:** slice 0's held book legs
  repriced at the tape, at 10 s, 2, 5 and 15 minutes where the held hours
  allow. This measures the method, not a rule;
- the nominee's book footprint (book files a day), to size the exam's book
  download;
- BTC and ETH at the nominee's entries, on marks (MARKET-1's B7);
- the cost of $10,000 and $50,000 walks on slice 0's held books, for sizing
  later (idea 1).

**The try log.** Every try, its exact definition and its cut are written in
the exploration's `progress.md` before it runs, as MARKET-FIND did. Every
result is printed, losers included. Any print outside this list is listed as
such.

## 2. The choice rule (fixed now, before any try runs)

### 2.1 The steps

1. **Gates, no outcome.** The extraction passes its gates (4.5). The E
   medians and percentiles of section 1 are computed from features only and
   frozen in the try log.
2. **E, the tries.** B0's m, SE and z on E. Then each of the 38 changes: its
   D-test against B0 (t_V), its m, SE and z, and its two floors (1.4).
3. **E, the nominee.**
   - A change is adopted when t_V ≥ **2.5**, its floors hold and it is
     adoptable (not N7 or N8).
   - At most one change a family (the largest t_V in it), and at most
     **three** families (the three largest).
   - The **nominee N** is B0 with the adopted changes together: filters
     intersect; the delay, hold, exit and M take the adopted level.
   - N's E numbers are printed. They test nothing.
   - If nothing is adopted, N is B0 and step 4 is skipped.
4. **C, the check.**
   - B0 and N on C, with N's D-test against B0 (k from E). If t_N ≥ **1.0**
     on C, **N goes to FRESH.**
   - Otherwise each adopted change alone is checked on C, in the order of its
     t on E. The first with t ≥ 1.0 goes to FRESH.
   - Otherwise **B0 goes to FRESH.**
   - At most 4 evaluations on C.
5. **The report** prints everything, with the projected exam power (3.5):
   - from N's C estimate (free of the choice);
   - from E and C together.

   A Final review recomputes steps 2–4 with independent code. You rule on the
   result before the exam's rules are written.

If you later prefer a rule other than the one these steps give, that is an
override. It is recorded in decisions as one, and counted as one more try.

### 2.2 The error rates, plainly

- **Under pure chance**, a single useless change passes E with probability
  0.62% (one-sided 2.5 errors). Over 38 tries, at most 23.6% that any one
  does. It then passes C (1 error) with probability 15.9%. **So the chance
  that a useless change reaches FRESH is at most 3.7%** (E and C are
  disjoint).
- **A Bonferroni bar on E alone** would need 3.01 errors for 5% over 38 tries.
  The two-stage bars are kinder to a real change and stricter on luck.
- **A real change with an expected 3 errors on E and 2 on C** is adopted
  about 69% of the time and confirmed about 84% of the time, so 58% of the
  time it reaches FRESH.
- **The exam's own false-HOLDS rate does not depend on the search at all.**
  FRESH is unseen and one rule is tested once. A lucky choice can only waste
  the exam's power, never fake a HOLDS. This is why the search can be broad
  and the exam strict.

### 2.3 The winner's curse

The best of 38 tries looks better on E than it is. Four things protect
against it:
1. **A margin:** 2.5 errors on E, and 1 error again on C, months the choice
   never used.
2. **The projection uses C, not E.** N's C estimate is free of the choice; the
   expected exam result and its power come from it, beside the pooled E and C
   estimate.
3. **A signal meter, printed:** the spread of the 36 adoptable t's against
   chance. If their variance is no more than about 1.2, the search found
   nothing beyond luck, and each change's E gain is shown shrunk by
   max(0, 1 − 1 ÷ variance). This is descriptive.
4. **FRESH decides alone.** No practice number enters the exam's statistic.

### 2.4 One rule, not two

**One rule goes to FRESH.** Two rules would split the exam's 1%: z 2.81 each,
which costs each a quarter of an error of reach (6–16 bps at the errors of
3.5).
- If you want B0 answered too, the cheapest form is a fixed order: N at the
  full z; B0 only after N's verdict is HOLDS. This spends nothing extra.
- My recommendation is to print B0 on FRESH beside N, deciding nothing.

## 3. The exam on FRESH

### 3.1 The window: FRESH without the discovery window

**What FRESH holds:**
- FRESH's fills run from 2026-05-29 02h to 2026-11-15 23h, and its last
  position must close before FRESH_END (2026-11-16T00:00Z).
- **Inside it lie the 68 days 2026-08-31 → 11-07,** on which the wave was
  found on Polymarket's pool (MARKET-FIND, its section 1; STRATEGY-REVIEW's
  lead before it).
- MARKET-FIND measured three quarters of the move back as the whole
  small-coin market's. So Hyperliquid's waves on those days would gain from
  the same market moves that made the wave visible on Polymarket.

**Why it matters:**
- If the wave were real only in that autumn, a test that keeps those days
  could pass on them alone. With the window at +300 and nothing elsewhere,
  the whole of FRESH would average about +120, enough for HOLDS at FRESH's
  error.
- WAVE-ELSEWHERE kept Polymarket's months out of WAVE-H's test for this reason
  ("so no day of it is a day the finding was made on").

**The deciding days.** The positions with:
- t ≥ 2026-05-30T00:00Z and x_out < 2026-08-31T00:00Z; or
- t ≥ 2026-11-07T00:00Z and x_out < 2026-11-16T00:00Z.

For a 24-hour hold that is about 92 + 8 = **100 days**.
- The first day is warm-up, so every entry has its 60 minutes of FRESH's own
  fills.
- Look-backs of up to 30 days reach into the 10 months' store. Those are
  features, not outcomes.
- M5's blocking runs over all of FRESH, as an entry before START still blocks
  in MARKET-1.
- **The discovery window is printed apart,** labelled "not independent".

**The months before it are clean.** MARKET-FIND checked its finished rule on
Polymarket's beta months (2026-05-28 → 08-30) only after the rule was fixed:
22 entries, +129.8 ± 213.7. That look shaped nothing, so those days stay in
the exam. MARKET-1's forward months (from 2026-11-11) are sealed until its
first look, so FRESH's last days share calendar days with MARKET-1 but take
nothing from it.

### 3.2 The deciding line and its statistic

**The rule.** The one rule of section 2, with **every slice pooled** (147, or
294 if W2 is adopted), on the deciding days.

**The price.** At the book first, as H8: the archived snapshot live within
10 s, walked over 20 levels. Else the tape (the first takers in the next
minute). Else unpriced.
- FRESH's books are fetched after step 1 by `tools/waveh-fetch.cjs --fresh
  --books`.
- The archive has no books on 2026-07-08 or 2026-07-12 → 17, so those legs go
  to the tape.

**The net.** Fees 4.5 bps a leg, with the monthly base-tier check of H14.
Funding as 1.4's minute price defines it.

**The statistic.**
- m, the mean net per position;
- SE, M10's two-way error by the UTC day of t and the coin;
- **z = 2.58** for one look, or 2.81 at each of two looks (3.6).

Why the pooled line and not slice 0:
- its error is about a quarter smaller (3.5);
- nobody's luck of address decides;
- it was the Final review's recommendation.

**Its cost is a larger book download:**
- at most every coin-hour of the 38 coins over the ~100 days, about 50 GB at
  TEST's 506 MB a day of books, about 7 hours at 2 MB/s;
- the exploration measures the nominee's own footprint before the freeze;
- if it is above about 60 GB, the cheaper line is **20 slices pooled**, which
  the error model puts at 31.8 against 31.3 over the 10 months. That choice
  is made from the footprint (a count), never from a result.

**Printed beside, deciding nothing:**
- the positions with a tape leg, apart (the Final review's note);
- the book-only mean;
- slice 0 alone (WAVE-H's form);
- B0 on FRESH;
- the discovery window;
- each month;
- the tail;
- the cost of $10,000 and $50,000 walks at the book.

### 3.3 Thresholds and verdicts

WAVE-H's H12, in its order:
1. **WITHHELD** when more than 10% of the deciding positions are unpriced,
   depth short, or left out by 3.4's rules.
2. **TOO FEW TO TELL** under 20 UTC days or 10 coins, or with no SE.
3. **DOES NOT HOLD** when m + z·SE < **δ = +50 bps**.
4. **HOLDS** when m − z·SE > 0 **and** the mean excess over each coin's
   4-hour BASE is above 0. BASE is measured on the deciding days' minute
   prices (1.4).
5. **NOT SETTLED** otherwise, with H12's sentence.

**I keep δ = +50**, your line, for any hold. A short-hold rule nets less per
position but is far more precise, so the line matters more for it: a real
+25 ± 8 would be DOES NOT HOLD (25 + 2.58 × 8 = 45.6, under 50). That is your own definition ("a real effect
below the owner's line is DOES NOT HOLD"). A smaller line for short holds
would be a new ruling of yours, and it must come before the exploration
(question 4).

### 3.4 FRESH's day files, and every other hole

**The signal** (sizes only):
- most `asset_ctxs` files from 2026-09-22 on are 1.1–5.5 MB, against about
  10.7 MB before;
- 10-03, 11-03 and 11-04 are full size;
- smaller days before then: 05-30, 08-08, 08-09, 08-27, 08-30, 09-15, 09-16,
  09-18.

They may hold fewer minutes or fewer coins.

**What they would do under WAVE-H's rules:**
- a funding settlement without a mark leaves the position unpriced (H9), and
  above 10% the exam is WITHHELD;
- the gross on marks and the excess go missing, and HOLDS needs the excess;
- any feature read from the marks is unknown.

**How this exam survives them:**
1. **Nothing that decides needs `asset_ctxs`.** The money is priced at the
   book or the tape, from the fills. Funding, BASE, the excess and every
   feature use 1.4's minute price: the mark, else the last trade within
   5 minutes.
2. **The deciding days already leave out 2026-08-31 → 11-07,** which holds
   most of the small files. In the window remain 05-30, 08-08, 08-09, 08-27,
   08-30 and 11-07 → 11-15.
3. **Step 1 counts before any price exists:** `asset_ctxs` rows by coin and
   day; the minutes served by the fallback; the funding rows by coin; the fill
   files' records by day.
4. **Holes in the fills.** Step 1 lists every stretch of missing block numbers
   of 60 s or more. An entry whose window [t − 60 min, t], or any of whose leg
   windows [x, x + 60 s], touches one is left out and counted. A missing or
   failing fill file stops the run, as H2 does.
5. **A feature unknown at an entry** (no price 7 days before, say) leaves the
   position out, counted.

Rules 4 and 5 count toward WITHHELD's 10%, so the exam says "the data could
not answer" rather than guess.

### 3.5 Its power at FRESH's size

**The method** (`out/power.txt`, `scripts/power.cjs`):
- the error at D days is the 10 months' error × √(300 ÷ D), assuming the
  same day-to-day variance and density of wave days;
- P(HOLDS) is the chance that m clears max(z·SE, 50 − z·SE), because DOES
  NOT HOLD comes first.

**B0 pooled** (31.3 over 300 days, on marks):

| Window | SE | HOLDS needs | 80% power at | P(HOLDS) if the true mean is +50 / +100 / +150 / +200 |
|---|---|---|---|---|
| FRESH whole, 170 days, z 2.58 | 41.6 | +107 | +142 | 8 / 43 / 85 / 99% |
| **FRESH clean, 100 days, z 2.58** | **54.2** | **+140** | **+185** | **5 / 23 / 57 / 87%** |
| look 1 of two, z 2.81 | 54.2 | +152 | +198 | 3 / 17 / 48 / 81% |
| look 2, to 2027-02-05 (182 days), z 2.81 | 40.2 | +113 | +147 | 6 / 37 / 82 / 98% |
| one later look, 182 days, z 2.58 | 40.2 | +104 | +137 | 9 / 46 / 88 / 99% |

**Other shapes on the clean 100 days:**
- slice 0 alone: 71.4, needs +184;
- a narrower rule (error 40 over 10 months): 69.3, needs +179;
- forced sells, slice 0 (51.7): 89.5, needs +231;
- a short-hold rule (error 15 over 10 months): 26.0, needs +67, 80% power at
  +89.

**What this means:**
- **A sharpening pays only if it raises the result per unit of error.** The
  mean alone is not enough, and the D-test measures exactly this.
- **Short holds are the strongest lever on paper:** the error falls roughly
  with the square root of the hold, while the look puts most of the gain in
  the first hour.
- **A narrow filter needs a big effect.** Slice 0's forced sells keep 81% of
  its positions, and their error is 25% larger (51.7 against 41.2).
- **FRESH is also busier:** about 0.94 GB of fills a day against TEST's 0.61.
  If waves come more often, the error is smaller than this table says.

### 3.6 One look or two

**One look now** (z 2.58) on the ~100 clean days answers in about two to
three weeks. It settles a large or a precise effect.

**Two looks** add the months after FRESH, which the archive publishes daily:
- look 1 on the clean days at z 2.81;
- look 2 at about 2027-02-08, on those days plus 2026-11-15 → 2027-02-05,
  also at z 2.81;
- the 1% is split in half by Bonferroni, which is conservative.

It needs one more download (FRESH-2: about 82 days of fills and day files,
roughly 80 GB at FRESH's rate). The frozen rule waits unchanged. It brings
the 80% reach of the pooled wave from +185 to +147. **I recommend two
looks:** without the discovery window, one look is likely to end NOT SETTLED
unless the sharpening is strong.

**Either way, the design is fixed now**, before the exploration. The window,
the line, z, δ and the looks do not depend on which rule wins.

### 3.7 The exam's steps and gates (WAVE-H's H15, adapted)

1. **The freeze.** `polish/FROZEN.sha256` lists:
   - the program and every file it reaches, the extraction included;
   - `polish/rules.md`;
   - FRESH's data list, written from FRESH's manifest at the freeze (metadata
     only);
   - WAVE-H's list for the look-backs.

   Tag `polish-freeze-1`. FRESH's store stays unopened until the gate opens.
2. **The reproduction, before FRESH is opened:**
   - the frozen extraction runs again on the 10 months, and its column files'
     hashes equal the explored store's manifest, file for file;
   - the frozen rule reproduces N's E and C numbers to the digit;
   - the book path reprices WAVE-H's 1,289 positions to 1e-9 bps.
3. **Step 1** (counts only):
   - FRESH extracted by the frozen code, every file held to its list;
   - 3.4's counts and holes;
   - the rule's positions on the deciding days, with no price;
   - the left-out counts;
   - `books-needed.txt`.

   Then it stops. A data defect seen here goes by H0's route before step 2.
4. **The books** are fetched under the download's guards.
5. **Step 2:** the prices, the statistic and the verdict, written as H15
   writes them (`result.json` first, then `positions.jsonl.gz` and
   `report.json`, with its recovery rule). Nothing about an outcome is printed
   before `result.json` exists.
6. **Then** the report and a Final review with independent code, as
   WAVE-H-LOOK-REVIEW did.

All runs at idle priority, outside 02:30–06:00Z and 10:25–11:15Z, with a
generous heap ceiling (WAVE-H's lesson).

## 4. The extraction, the analyzer's first piece

### 4.1 What the store holds

| Table | Rows (10 months + SIZING) | Columns | Size |
|---|---|---|---|
| `liq` — every liquidation record, every coin, both legs | 10,763,982 (the review's count) | time, block number, coin, user and liquidatedUser (dictionary ids), side, crossed, method, px, sz, markPx, startPosition, fee, closedPnl, tid and oid (u64) | about 1.0 GB |
| `tape` — every taker fill of the 38 coins, in H8's order (time, user, tid), the backstop flagged; partitioned by coin and month | about 479 M (36.0% of 2.66 B records are the 38 coins', half of them takers) | time, px, sz (f64), side, flags | about 12.4 GB |
| `minute` — the 38 coins, BTC and ETH, every minute | 40 × 532,800 | from `asset_ctxs`: mark (f64), oracle, mid, impact bid and ask, open interest, predicted funding, premium, day volume; from the fills: last, high and low trade (f64), taker buy and sell notional, trades, liquidated notional by side | about 1.9 GB |
| `funding` — settled hourly rates | 38 × about 8,900 | time, rate | about 5 MB |
| `users` — the address dictionary | about 1 M (estimate) | 20 bytes an address | about 20 MB |
| `manifest.json` | one a range | every file's rows, columns, types and SHA-256; the input list's hash; the code's commit; every count (records by day, failing, duplicates across the two formats, missing blocks, users) | small |

**In all about 15–16 GB.** The counted fills (H4), the slices for any M (from
the address), waves, episodes and every feature of section 1 are computed
from these tables. A candidate is a function over them, and so is the exam.

**The books are not converted.** The pricing code reads a held book file
directly, held to `books.jsonl` (H8). For the 10 months only slice 0's 2,343
files exist; FRESH's are fetched for the exam.

### 4.2 The pass, from WAVE-H-LOOK-REVIEW's pipeline

**What it keeps from the review** (`workers/WAVE-H-LOOK-REVIEW/scripts/`):
- the worker pool of `pass1.cjs`: 6 workers, a file at a time, a result per
  file, so it resumes;
- the LZ4 frame decoder with its own xxh32 (`lz4.cjs`): every frame's
  checksum checked, the frame ending at the file's end;
- the record scanner's snippet parse (`scan.cjs`).

Its pass read 218.3 GB in 24.8 minutes (147 MB/s from disk, 750 MB/s
decoded).

**What it adds:**
1. **Two scans a decoded block.**
   - The `"liquidation"` key scan (the review's) feeds `liq`, for every coin.
   - A coin-first scan reads each record's coin from its text, at the fixed
     offset after the address. It parses only the 38 coins', BTC's and ETH's
     taker records (`"crossed":true`).
   - Measured on one core (`out/m1-summary.json`): decode 338 MB/s, coin-first
     259 MB/s, a full JSON.parse of everything 173 MB/s.
2. **Validation at the boundary** (Iron Rule 3). Each kept record passes
   WAVE-H's record schema (H2) in Zod; a failing record is dropped and
   counted. A day above 1% failing (and 10 records) stops the run.
3. **A file per input file.** It holds the hour's rows of each table as
   typed-array blobs and its counts, written whole (`.tmp`, then renamed).
   Workers share no state, and a crash loses one hour.
4. **The merge**, sequential: per table, coin and month, it gathers the hours
   in time order and deduplicates (user, tid) across the two formats (the
   hour 2025-07-27 08h is in both). It then sorts into H4's order, writes the
   column files, hashes them and writes the manifest. The per-hour files are
   deleted after the merge is verified.
5. **`asset_ctxs` and funding** in a small separate step (370 days and 760
   files; the review's took 3 minutes).
6. **The seal.** Every reader takes a gate that refuses FRESH's store unless
   the exam's freeze verifies (WAVE-H's `checkSealed` pattern).

### 4.3 Format, and whether a dependency is worth adding

**Plain binary columns, no dependency.** A column is one file of
little-endian typed values (f64, u32, u16, u8, u64), one per partition, read
with one call into a Float64Array or its kin.

**Why:**
- every query this plan needs is a scan over sorted arrays or an index
  lookup (a minute, an hour, a coin-month);
- the files are trivial to hash, check and freeze;
- nothing native enters a frozen program, whose every file a reviewer must be
  able to read;
- nothing is installed on this machine.

**An embedded SQL engine is not worth adding now:**
- **DuckDB's Node package** is a columnar engine that reads Parquet and
  spills to disk. It is the natural candidate for PAPER-H's per-trader
  queries over billions of rows (GROUP BY account, windows over a trader's
  fills). It is a native binary that moves fast, so it is weighed at
  PAPER-H's plan with a measured test. The columns here can be loaded into it
  then. Its current API and Windows builds are to be checked at the primary
  docs at that time (this task allowed no web read).
- **Node 24's built-in `node:sqlite`** needs no dependency, but it stores
  rows. It suits small tables, not a 479-million-row tape.

### 4.4 Size, memory, time, and how it grows

**Time.** The pass is about 40–60 minutes: I/O-bound at about 150 MB/s over
218 GB, with about 1.1 TB decoded. The coin-first parse takes about 12
minutes of CPU across 6 workers. The merge takes about 10 minutes.

**Memory.** No pass is ever held in memory:
- a worker holds one file (at most 258 MB compressed in FRESH) and 4 MB
  blocks as they decode, under 1.5 GB;
- the merge holds one partition at a time (tens of MB);
- a candidate loads the counted fills (2.4 M rows, about 100 MB), the minute
  columns it needs (one f64 column of 38 coins is 162 MB) and the tape a
  coin-month at a time (about 25 MB);
- an exploration run stays under 2 GB, against WAVE-H's 9.3 GB.

**FRESH, after the freeze:** the same code, its own folder. FRESH has
4,102 files (160 GB) at about 1.5 times TEST's bytes a day, so about 11 GB
and 30–40 minutes.

**PAPER-H** (the backlog's idea 4) needs every trader's fills:
- the same pass gets one more writer, `fills`: every record, every coin, both
  legs, by account bucket (address mod 256) and month, sorted by (account,
  time). One trader's history is then one bucket's months;
- about 2.66 B rows × 60–70 bytes, so 160–190 GB raw for the 10 months, and
  about as much again for FRESH and newer months;
- a full parse runs at 173 MB/s a core (measured), so about an hour with
  6 workers;
- whether to keep every account or only those PAPER-H's rule can select (a
  first pass of per-account summaries, then a second pass of their fills) is
  PAPER-H's plan's call. F: has about 1.3 TB free.

**Newer months** (FRESH-2, if two looks) get their own range folder; queries
read ranges as one. **A new table is a new writer and one more pass**, never
a new design.

### 4.5 The gates that make it trusted

Before any candidate runs, the store must reproduce what two independent
programs already agree on:
1. **The counts:** records by file-day (370 days), counted fills 2,421,070
   (SIZING 425,433; TEST 1,995,637; 40 from DATA END on), liquidation objects
   10,763,982, mark rows 17,618,289 (4,241 off the minute, 3,118 twice,
   48,300 from DATA END on), funding rows 292,878.
2. **The positions:** M's 346 scan rows and M = 147; slice 0's 1,299 WAVE-H
   positions (t, coin, side, the accounts) and 290 SIZING positions; 176,986
   entries in all slices.
3. **The prices:** the book path and the tape path reprice WAVE-H's 1,289
   priced positions (the look's 2,281 book legs and 307 tape legs) to
   1e-9 bps. The minute price's fallback (1.4) changes none of them.
4. **A test suite on made-up data** (vitest), the project's rules on breaks
   included: every rule broken once in a scratch copy, and a test fails.

### 4.6 Where the code and the store live

**The code** is a fifth entry point of `apps/poller`, `dist/polish.js`
(`src/polish/`), like WAVE-H: TypeScript, Zod, vitest, the same freeze
tooling. Its commands are `extract`, `explore` and `exam`. The exploration
runs the candidates through the functions that the exam later freezes, so the
code that is explored is the code that is examined.
- The analyzer can move to its own package at the skeleton build.
- It imports MARKET-1's and WAVE-H's frozen code only where a rule names them
  (the two-way error, the walks), never changing it.

**The store** lives in `F:\polymarket-follow-research\ANALYZER\WAVE-H\` (the
10 months), and after the freeze `…\ANALYZER\FRESH\`. Both are derived and
rebuildable; the raw stores stay as they are.

## 5. MARKET-1's second arm

**Yes, the sharpened rule should ride on MARKET-1's second arm** as a second
live test on Polymarket, your first venue. But it should ride as that arm's
deciding line, after the polishing's freeze, not before:
- **What:** one new arm on MARKET-1's road (plan, fresh review, build, fresh
  reviews, freeze).
  - Its one deciding line is the frozen polished rule in its Polymarket form:
    the wave counted in pool accounts, with the rule's side, delay, hold,
    exit and filters.
  - Every part tagged "Both" in section 1 runs unchanged. A part tagged HL
    has no Polymarket form; if the rule needs one, the arm's plan names the
    nearest Polymarket form, or the arm waits.
  - The parked lines (T TAPE, R RANDOM DAYS, B8, B9, J JUMP, X XREV) ride
    beside it.
  - Its own START (the day after its freeze), lines and verdict; zero API
    reads.
- **How it leaves MARKET-1's freeze untouched:**
  - its own code and its own `FROZEN.sha256`;
  - it imports MARKET-1's frozen files byte for byte, as WAVE-H does (its
    freeze tool checks each against `market1/FROZEN.sha256`);
  - it reads the paper experiment's files under MARKET-1's M2 procedure;
  - MARKET-1 runs on under M0.
- **When:** about two to three weeks after 2026-11-20, once the polished rule
  is frozen. One build then tests the polished rule on two venues: FRESH on
  Hyperliquid's past, the arm on Polymarket forward. The parked lines decide
  nothing and lose only those weeks.
- **The alternative:** the arm on 2026-11-20 as first ruled, with this plan's
  "Both" candidates added beside it so their Polymarket clock starts now, and
  the polished rule later in a third arm. That means two builds and two review
  rounds for the same end.

## 6. The steps after the plan, in order

| # | Step | Worker | Size |
|---|---|---|---|
| 1 | A fresh review of this plan | WAVE-POLISH-PLAN-REVIEW (fresh; Sonnet 5.5 or Opus, max) | 1 session |
| 2 | Your approval, with the questions of section 9 | the owner | — |
| 3 | The extraction and its gates (4.1–4.5), `explore`'s frame, the tests and breaks | EXTRACT-BUILD (Opus 5.5, max) | 2–3 sessions |
| 4 | The extraction's code review; the fixes; a fix-check if needed | EXTRACT-REVIEW (fresh) | 1–2 sessions |
| 5 | The extraction run on the 10 months, detached, after FRESH's download ends (started 2026-11-17 18:23Z, about 27 h), outside the windows | the supervisor | about 1 h |
| 6 | The exploration: section 1's tries in the written order, the try log first, the choice rule of section 2, its report `docs/reviews/polish-explore-<date>.md` | POLISH-EXPLORE (a study subagent, max) | 1–2 sessions |
| 7 | Its Final review: B0, every adopted change and the nominee recomputed on E and C with independent code | POLISH-EXPLORE-REVIEW (fresh) | 1 session |
| 8 | Your ruling on the nominee | the owner | — |
| 9 | The exam's rules (`polish/rules.md`, from sections 3 and 4), its build, fresh rules and code reviews, the fixes, a fix-check, the freeze (`polish-freeze-1`) | POLISH-RULES, then the reviewers | 3–4 sessions |
| 10 | The exam, look 1: reproduction, step 1, the books, step 2; then its report and a Final review with independent code | the supervisor; POLISH-EXAM-REVIEW (fresh) | 1–2 days elapsed |
| 11 | If two looks: FRESH-2's download (a new range in the download tool), then look 2 at its date | a build subagent; the supervisor | 1 session + the download |
| 12 | MARKET-1's second arm, from the frozen rule (section 5) | MARKET-1's road | 4–6 sessions |
| 13 | PAPER-H, on the same extraction (its own plan) | the plan page's row | later |

The whole polishing to look 1 is about 12–15 sessions over two to three
weeks. The download and the runs happen between sessions.

## 7. Risks, and how each is caught

1. **Low power.** About 100 clean days settle only a large or a precise
   effect. *Caught by* the pooled line, the D-test (result per unit of error),
   the hold family and the second look. Section 3.5 says it in advance.
2. **The discovery window.** *Caught by* the deciding days (3.1).
3. **FRESH's thin day files.** *Caught by* a deciding statistic that needs no
   `asset_ctxs` (3.4).
4. **Holes in fills, books or features.** *Caught by* the tape, the left-out
   rules, step 1's counts and WITHHELD.
5. **Overfitting and the winner's curse.** *Caught by* the fixed list, one
   cut a feature, the try log, the two-stage bars, the projection from C, and
   FRESH (2.2, 2.3).
6. **The look's leads are not clean on C.** *Said plainly* (1.5); FRESH is
   their only clean test.
7. **An extraction defect.** *Caught by* reproducing two independent
   programs' counts, positions and prices, then the frozen code
   re-reproducing the explored store byte for byte (4.5, 3.7).
8. **The tape is not the book.** *Caught by* the calibration on the same legs
   (1.5) and an exam priced at the book first.
9. **FRESH is busier.** With M fixed, a slice sees waves more often. *Caught
   by* printing each month's episodes a slice a day, as WAVE-H did; the rule
   is examined exactly as explored.
10. **The book download** may be large for the pooled line. *Caught by*
    measuring it in the exploration (a count), and the 20-slice fallback.
11. **The disk and the collector.** Every long read runs at idle priority,
    outside the windows and after FRESH's download, reading only.
12. **Memory.** Streaming by design, and generous heap ceilings.
13. **Two tests on shared calendar days.** FRESH's last days (2026-11-11 →
    15), and with two looks all of look 2's months, share calendar days with
    MARKET-1's forward test. Neither sees the other's outcomes, but a HOLDS in
    both would be one market period seen on two venues, as WAVE-ELSEWHERE
    noted, not two independent periods. The reports will say so.

## 8. Beyond the brief

1. **The discovery window inside FRESH** (3.1): the one change to the exam I
   would not skip.
2. **Short holds as the main lever.** On Hyperliquid most of the move back
   comes within the hour. A precise short-hold rule could be settled on FRESH
   where a 24-hour rule cannot (3.5). It also uses capital for hours, not a
   day: worth knowing for idea 1, "using a confirmed wave".
3. **Twenty slices are nearly as good as all of them** (31.8 against 31.3):
   a cheap deciding line if the book download is large.
4. **A venue-wide wave.** Hyperliquid shows every liquidation, so the wave can
   be counted over all accounts (W4, W5) with no slices. That is also the
   form a feed without accounts (Binance's forced orders) allows, the venue
   you named for later. The slice wave is the Polymarket form.
5. **A live reader's real delay:** the node shows a fill 0.11–0.14 s after its
   block. So "at once" (D0) is a realistic entry on Hyperliquid, not a paper
   one.
6. **The exam reprices WAVE-H's 1,289 positions before it opens FRESH,** a
   free end-to-end test against numbers confirmed twice.
7. **BTC and ETH at the wave** (printed): if the wave's move back carries
   into the two deepest books, sizing beyond $1,000 becomes a different
   question. MARKET-FIND saw ETH +111 and BTC +62 at the wave's moments on
   Polymarket.
8. **No cross or isolated flag on market liquidations** (checked): one
   feature fewer than expected.

## 9. Questions for the owner, each with a recommendation

1. **Approve the plan** (sections 1–4 and 6) after its fresh review?
   *Recommendation: yes.*
2. **The exam's deciding days without the discovery window** (2026-08-31 →
   11-07), printed apart? *Recommendation: yes.* It costs about 40% of
   FRESH's days. It is the difference between a clean proof and the
   discovery seen again.
3. **One look or two?** *Recommendation: two.*
   - Look 1 on FRESH's clean days at z 2.81.
   - Look 2 at about 2027-02-08 on those days plus the months to 2027-02-05,
     at z 2.81, after a FRESH-2 download of about 80 GB.
   - One look at z 2.58 gives the answer sooner, but most likely NOT SETTLED
     unless the sharpening is strong.
4. **z and δ:** z as WAVE-H (2.58 for one look, 2.81 for each of two), and
   δ = +50 bps a position for every hold, short ones included?
   *Recommendation: yes to both.* If you want a smaller line for short holds,
   rule it before the exploration starts.
5. **The deciding line: every slice pooled,** with slice 0 printed beside,
   and 20 slices as the fallback only if the book download is above about
   60 GB? *Recommendation: yes.*
6. **Features of any venue may enter the rule,** each tagged with where it
   can be seen, so the best rule is not given up for one venue?
   *Recommendation: yes.* MARKET-1's second arm then tests the rule's
   Polymarket form where one exists.
7. **MARKET-1's second arm:** one arm after the polishing's freeze, the
   polished rule deciding and the parked lines beside (section 5)?
   *Recommendation: yes.* The alternative is the arm on 11-20 plus a third
   arm later.
8. **The store:**
   - no new dependency now;
   - its place, `F:\polymarket-follow-research\ANALYZER\`;
   - about 16 GB now, about 11 GB for FRESH, up to about 50 GB of FRESH's
     books;
   - DuckDB weighed at PAPER-H's plan.

   *Recommendation: yes.*

## 10. Evidence; facts for the other docs

**Evidence** (`workers/WAVE-POLISH-PLAN/` in the supervisor folder):
- `progress.md`;
- `scripts/m1-sample.cjs`, `m1-summary.cjs`, `m2-ctxs.cjs`, `m3-blocks.cjs`,
  `power.cjs`, with `lz4.cjs` (a byte copy of WAVE-H-LOOK-REVIEW's, SHA-256
  `e465cc8a…4673`);
- `out/m1-sample.json`, `out/m1-summary.json`, `out/m2-ctxs.json`,
  `out/m3-blocks.json`, `out/power.txt`.

The sample files are 12 fill hours at 14h on the 15th of each month
(2025-06 → 2026-05) and three `asset_ctxs` days (2025-06-10, 2025-10-10,
2026-05-15). Every one was held to `waveh/data.sha256`.

**Facts for external-apis** (measured 2026-11-17 on WAVE-H's store; the
supervisor places them):
- **Fill records,** in the sample of 12 hours, 5,524,622 records, 416 B a
  record decoded:
  - by coin group: the 38 small coins 36.0%, BTC and ETH 21.4%, other perps
    16.7%, builder dexes (`dex:COIN`) 16.3%, spot (`@n`) 9.6%;
  - takers are exactly half of each group;
  - keys beyond WAVE-H's schema: `cloid` 62%, `twapId` 82%, `builder` 7.2%,
    `deployerFee` 11.4%, `priorityGas` 0.75%.
- **Liquidations:**
  - both legs carry the object, with `markPx` on every one;
  - in the sample every method was "market";
  - the own leg's `dir` is "Close Long" or "Close Short", so there is no
    cross or isolated flag.
- **`node_fills_by_block` lines** (3 hours):
  - `local_time − block_time` median 112–142 ms, p99 about 205 ms, max
    1.26 s;
  - blocks about 70 ms apart at the median;
  - a fill's `time` equals its block's time;
  - `tid` up to 16 digits, none above 2^53 in the sample (so store it as u64,
    never as a double);
  - `oid` up to 12 digits.
- **`asset_ctxs`** (3 days): 199–230 coins and 285,705–331,200 rows a day;
  every column a number on every row of the 38 coins, BTC and ETH.

**Slips:** none in the numbers. One read was refused by the session's safety
check and not retried (the head of WAVE-H's store `manifest.jsonl`);
`data.sha256` and the folder listings gave what was needed.
