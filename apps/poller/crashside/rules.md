# The crash side only (crashside/rules.md)

One page of frozen text, as the owner ruled (decisions 2026-11-25, the
owner's rulings on FABLE-REVIEW, item 8), written 2026-11-25 13:18Z by
CRASH-SIDE-PAGE, before anyone had downloaded or opened FRESH-2's months. Its
commit freezes it, and the supervisor records its SHA-256 in decisions. Where
it names the exam (`apps/poller/polish/rules.md`, P0–P17, as frozen at
`polish-freeze-1`; its plan, THE PLAN, is
`docs/reviews/polish-rules-plan-2026-11-19.md`), WAVE-H
(`apps/poller/waveh/rules.md`, H0–H15) or MARKET-1
(`apps/poller/market1/rules.md`, M0–M15), it means them word for word.
Figures in brackets are prints on months already seen; they decide nothing.

_Holds and does not hold are verdicts on this test, never instructions to
trade._

**The gate's answer, first** (the plan gate, decisions 2026-11-25, item 4):

- **The most likely result is NOT SETTLED,** unless the true gain is at least
  the +83 bps a position seen after the look. At FRESH's counts the one look
  gives a clear answer (HOLDS or DOES NOT HOLD) 52% of the time at +83, and
  16% at +50 or at 0 (S5).
- **Recommendation: not built.** A clear answer is more likely than not only
  with a year of FRESH-2, and only at the full +83. The question is looked at
  again on 2027-05-08 (S5).

## S1. The rule

- **The exam's 715 line, its forced-sell side:** P3's coins and counted fills
  (WAVE-H's H3 and H4), on FRESH-2's records stamped before END (S2); P4's
  recipe, B0 + W4 with W4's cut at **715** accounts (M = 147, slice(a) = a mod
  147, MARKET-1's `waveEntries` in each slice from FRESH-2's first file); P5's
  slices **0–19 pooled**, each alike. Of that line's positions, only those
  entered on a **forced sell** (H4: side "A", a long closed, σ = −1), so
  dir = −σ = **+1**: long after a forced sell (M6), $1,000, x_in = t +
  120,000 ms, x_out = x_in + 86,400,000 ms, no stop, no target.
- **Nothing else changes.** The entries are placed over both sides exactly as
  P4 places them (B0's entries of either side block their coin for 60
  minutes, M5), W4's cut is applied, and only then are the forced buys set
  aside. This is the set look 1 printed as "forced sells" (`report.json`
  `deciding.sides`; `tries/beside.ts`: dir > 0).
- **No safety net:** the line is fixed; P4's N is not read. TOO FEW (S4)
  stands in.

## S2. The months

- **FRESH-2:** Hyperliquid's archive from **2026-11-16T00:00Z** (FRESH_END) to
  **END = 2027-11-16T00:00Z**, twelve months: about the shortest window with
  a clear answer more likely than not, and then only at +83 (S5). Its data
  are the kinds P1, 4. names for look 2's FRESH-2, here to END: the fill
  hours [2026-11-16 00h, END), their `asset_ctxs` days, the 38 coins' funding
  windows on FRESH-2's own 20-day grid from FRESH_END (the last ending at
  END), and the minute grid [2026-11-16T00:00Z, END).
- **The deciding positions:** t ≥ **2026-11-17T00:00Z** and x_out ≤ END −
  3,600,000 ms, so each leg's hour of tape (S3) lies inside the data: entries
  on 363 days, 2026-11-17 → 2027-11-14. Placement runs from FRESH-2's first
  file; the entries of 2026-11-16 decide nothing and still block, as P1's of
  2026-05-29.
- **One look, never before the data is whole:** a day's last two hours
  reach the archive two days later (external-apis, 2026-11-17), so END's
  data is whole on 2027-11-17 after about 09:30Z. The look comes at the
  earliest about 2027-11-18, once the last days are downloaded and built.
- **The days, by P2's logic:** FRESH-2's files listed by name, bytes and
  SHA-256 from the download's manifest before any is read (a file missing or
  differing stops step 1: H0's route); the store built twice and held
  equal; G0's and G5's integrity, with FRESH-2's first and last files as its
  edges; an `asset_ctxs` day failing WAVE-H's 1% rule read as absent and
  listed; P8's holes leave a position out, with P8's windows as they are.
  **Option B has no part:** no book is read (S3), so no day is cut for its
  books.

## S3. The price

- **Every leg at the tape,** both legs of every position, with no book first:
  P6's "else the tape" (H8's second rule). The store's records with
  `crossed` true on our side ("B" when we buy, "A" when we sell), no
  backstop's, from x in H4's order, walked as levels by M7's walk ($1,000
  in, Q out), within **[x, x + 3,600,000 ms)** where P6 has 60 s. What an
  hour of takers cannot fill is filled at the last level, **depth short**;
  with no taker at all the position is **unpriced** ("no trade at the
  entry", "… at the exit"). Fees, funding and the net as P6: 4.5 bps a leg,
  funding through P7's minute price (often its trade price, since
  `asset_ctxs` covers only part of each day from about 2026-09-22;
  external-apis, 2026-11-25), M9's formulas. No `l2Book` file is fetched or
  read.
- **Why not the book first:** the archive's books thinned from a snapshot
  every 0.54 s to one every 10.95 s, live 15% of the hour from 2026-11-10
  (external-apis, 2026-11-25), and FRESH-2's are not known. Book first, a
  leg's price source would change with the month [look 1: 22.3% of
  November's positions not priced cleanly, every short leg at the tape]. At
  the tape alone the books cannot withhold.
- **Why an hour, not 60 s:** a day after a wave the tape is quiet [look 1's
  line at the tape alone: of 3,078 positions, 333 unpriced (324 with no
  trade at the exit) and 987 depth short, 42.9%; book first with a 5-minute
  tape, 3.15%]. The walk takes the first takers after x, so a leg that 60 s
  could fill is priced exactly as before; only the others reach further.
- **The coverage check, limit 5%** (step 1, counts only, before any price;
  P15's 5% tripwire widened to the price): the deciding positions that are
  left out (P8), have funding without a price (P6), or have a leg whose hour
  holds no taker on our side, or takers worth less than $1,000 in all (Σ px
  × sz, a size, never a return), each counted once. **Above 5%** of the
  positions, no price is computed and the look reads: "Withheld: X% of the
  deciding positions were left out, lack a funding price or have a leg the
  tape's hour cannot fill, above the check's 5% limit; no price was
  computed, and the data could not answer." FRESH-2's outcomes then stay
  unseen.

## S4. The verdict

P11's ladder at the one look, over the deciding positions (S2), the left-out
ones included, m and SE by P9 (M10's two-way error); the first that holds:

1. **WITHHELD:** S3's check above 5% at step 1; else P11's share (left out,
   unpriced or depth short, each position once) above 10%.
2. **TOO FEW TO TELL:** no SE, or the priced positions span fewer than 20
   UTC days (of t) or 10 coins.
3. **DOES NOT HOLD:** m + z·SE < +50 (δ, the owner's line).
4. **HOLDS:** m − z·SE > 0; and the mean excess over BASE > 0 (P7, BASE over
   the window's own minutes, [2026-11-17T00:00Z, END − 24 h)); and the mean
   net of the priced positions with no depth-short leg > 0. This last stands
   in for F8's positions at the book on both legs, since no leg is priced at
   a book: the same guard against a mean that rests on thin fills [look 1: a
   leg depth short +208.6, none −16.4]. With no excess, or no position
   without a short leg, HOLDS cannot hold.
5. **LIKELY:** the same three at z_L; never read as HOLDS.
6. **NOT SETTLED** otherwise.

**z = 2.6532605728910306 and z_L = 2.212592737897925:** the exam's bars for
one look (THE PLAN's D33, the one-look branch P10 prints beside). HOLDS's z
is the larger of 2.58, the 99% bar, and the placebo's 99.5th percentile; z_L
the larger of 1.96 and its 97.5th; DOES NOT HOLD keeps z. `placebo.json`
(`c25345f7…`, P10) gives both at its longest window, 182 days, from the 715
line's day flip, the largest of its two lines and two flips. E's 211 entry
days hold no longer window, so no new placebo is run. The sentences are
P11's, with X, Y, D and C filled. Printed after the verdict, deciding
nothing: P13's first list for the deciding positions, but its price
sources, and the base-tier fee check.

**What each would mean:**

- **HOLDS:** buying after a wave of forced sells and holding a day beat its
  costs over a year no one had seen, at the 99% bar: a clear yes. What
  follows is the owner's call.
- **LIKELY:** very probably real, not proven; it decides nothing HOLDS
  decides.
- **DOES NOT HOLD:** even the top of its range is below +50 bps a position.
  The crash side is closed for good, with no variant.
- **NOT SETTLED:** the year could not tell. The lead stays unproven, and
  under the stop rule nothing more is built on it.
- **TOO FEW TO TELL or WITHHELD:** too few wave days or coins, or a tape too
  thin to price: no answer from this page.

## S5. The plan gate's arithmetic

From FRESH's counts alone (look 1's `report.json` `d9629892…475b`,
`deciding.sides["forced sells"]`):

- **2,715 priced positions on 21 deciding days,** in 91 entry days (P1's 100
  less option B's 9): **908 positions and 7.0 deciding days a month.**
- **The error:** SE 61.49 over the 21 days (two-way; the error by day
  decides), so 61.49 × √21 = **281.8 bps a deciding day**. After T months SE
  ≈ 281.8 ÷ √(7.0 × T) = 106.3 ÷ √T; this page's window, about 84 deciding
  days, gives SE 30.8.
- **The chances,** for a true gain μ: P(HOLDS) = Φ(μ ÷ SE − z) and P(DOES
  NOT HOLD) = Φ((50 − μ) ÷ SE − z), z = 2.653 (S4). The excess and depth
  conditions, TOO FEW and WITHHELD are left out, so the true chances can only
  be lower.

| True gain | Months for HOLDS one time in two | Four times in five |
| --------- | -------------------------------- | ------------------ |
| +83       | 11.6                             | 20.0               |
| +50       | 31.8                             | 55.2               |
| +25       | 127                              | 221                |

| True gain | A clear answer at 6 months | At 12 months | At 18 months |
| --------- | -------------------------- | ------------ | ------------ |
| +83       | 23%                        | 52%          | 75%          |
| +50       | 7%                         | 16%          | 26%          |
| +25       | 4%                         | 7%           | 10%          |
| 0         | 7%                         | 16%          | 26%          |

- At +83 the clear answer is HOLDS, at 0 DOES NOT HOLD, at +25 either one
  alike. Weighting the four gains alike, a clear answer comes 10%, 22% and
  34% of the time at 6, 12 and 18 months. In this window HOLDS needs m above
  about +82; LIKELY or better comes 69% of the time at +83 and 28% at +50.
- **+83 is likely high:** it is the better of two sides, picked after the
  look, while the whole line read +4.5 ± 91.7 and its event level −29.2 ±
  77.5 [look 1]. Twice FRESH's deciding days a month would halve every count
  of months above; +50 would still need 16 months for one time in two.
- **Recommendation: not built.** The gate passes only with a year of FRESH-2
  and only at the full +83; at +50 it needs 32 months. **The question is
  looked at again on 2027-05-08,** the forward tests' last look and the stop
  rule's date (decisions 2026-11-25, item 6), or sooner if a frozen test says
  a clear yes first. It is built then only if the stop rule allows it and the
  owner wants one look about 2027-11-18 at these odds; until then nothing of
  FRESH-2 is fetched for it.

## S6. What it never does

- **No use of FRESH's months or of the ten months:** no record before
  2026-11-16 is read for a position, a price, BASE or the check, and z is
  the exam's printed number (S4); every other number here is a quote of the
  record or arithmetic on it. A build reads FRESH only to reproduce look 1
  (the forced sells' positions by key, and the 715 line at the 60-second
  tape), which decides nothing.
- **No change after this commit:** another side, cut, window, price, look or
  bar is a new idea, and a new idea is a new page, with its own freeze and
  its own arithmetic.
- **No outcome before the look:** FRESH-2 is not opened for this test before
  a build the owner approves, frozen as the exam was (P0's list under a tag
  and its seal, P2's two builds, P15's independent code at the look), which
  leaves this page unchanged; every output names this page's SHA-256 first.
  Before step 2, only S3's counts.
- **Nothing combined:** it decides nothing for the exam, WAVE-H, MARKET-1,
  the paper experiment or COPY-H, and they decide nothing for it.
