# The exploration's try log (tries.md)

The polishing's exploration (`docs/reviews/wave-polish-plan-2026-11-17.md`, sections 1 and 2, with its fresh
review's F1–F19), as POLISH-EXPLORE's plan wrote it before any try ran and the supervisor approved it
(decisions 2026-11-18, "POLISH-EXPLORE's plan approved", `598abd8`): every try's exact definition, cut,
expected way, instant, venue and whether the look seeded it. Copied verbatim from that plan's section 3
(`E:\coding\Claude\supervisor\polymarket-follow\workers\POLISH-EXPLORE\progress.md`, "THE PLAN"), its
headings made this file's. The nine cut values computed from E's features alone are written in
`polish/cuts.json` and committed before any outcome is computed; nothing here changes after that.

_Holds and does not hold are verdicts on a test, never instructions to trade._

The try log's home after approval is `apps/poller/polish/tries.md`
(verbatim from this section and the supervisor's changes). Its frozen cut
values go in `apps/poller/polish/cuts.json` (4.8), both committed before
any outcome.

## 3.1 Conventions

(F10, pinned):

1. **The price at τ:** P_c(τ) = `pc_c` at row ⌊(τ − minuteStart) ÷ 1 min⌋ −
   1 (`knownAt`): the minute price at the end of the last whole minute
   ending at or before τ. NaN is unknown. `pc` is defined in 2 (3) and 4.1.
2. **"Up to t"** is [t − 3,600,000 ms, t], both ends in (H1); every other
   window is [a, b).
3. **Monthly ranks** use data from before the month's first day. Trailing
   30-day measures use the days available, at least 7, until 30 exist; a
   day counts when the store holds data of the measure's source on it (so
   2025-05-25, from 14h for fills, counts). A 7-day window must lie wholly
   at or after its source's start, the first fill file
   (2025-05-25T14:00Z) for traded notional.
4. **No feature reads a record stamped after its instant.** The instant is
   named for each try. Minute-table columns are read only through
   `knownAt`: row k is known at m_k + 1 min.
5. **A feature unknown at a position** leaves that position out of that
   try. It is counted and printed by reason.
6. **σ** is the forced side (−1 a forced sell, +1 a forced buy); dir = −σ.

## 3.2 The parts and B0

(plan 1.1, 1.5):

- **E:** t in [2025-06-01T00:00Z, 2025-12-29T22:00Z), i.e. 50 h before
  2026-01-01T00:00Z.
- **C:** t in [2026-01-01T00:00Z, 2026-05-26T23:00Z), i.e. 50 h before
  DATA END, 2026-05-29T01:00Z (ruled as recommended: decisions 2026-11-18, "POLISH-EXPLORE's plan approved", 6). That gives the plan's "about 212" and
  "about 146" days.
- Every outcome a position reads closes before its part's end. The longest
  is D60 with 24 h: t + 25 h + 60 s.
- **B0:** M = 147; for each slice (`bySlice` of the counted fills, H4's
  order, from the first file, so a block carries in), MARKET-1's
  `waveEntries`; the entries with t in the part. Each position is $1,000
  against σ, x_in = t + 120,000 ms, x_out = x_in + 86,400,000 ms, no stop.
  Every slice is pooled, each position counted alike.

## 3.3 The nine families

(F5): S, D, H, W, R, C, T, X, N. One level each.
N is tested only on C. **35 tries** (the plan's 38 less D5 (F4), H48 and X2
(F15)); 33 adoptable (not N7, N8). X2 is a print.

## 3.4 The tries, in the written order.

Columns: kind (F filter, keeps a subset of B0's positions; V variant);
**seeded** (F6: the look's prints suggested it, so C is not clean for it;
FRESH is its only clean test); venue (PM, HL or Both; F16); the
**instant**; the cut, and from where. "Better" means it should raise the
result per unit of error, i.e. D > 0.

| #   | Try                 | Kind              | Exact definition (and cut)                                                                                                                                                                                                                                                                                                                      | Expected                                        | Instant               | Seeded                 | Venue                                                                 |
| --- | ------------------- | ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------- | ---------------------- | --------------------------------------------------------------------- |
| 1   | S1 SELLS            | F                 | σ = −1 (forced sells; we buy)                                                                                                                                                                                                                                                                                                                   | better                                          | t                     | yes (SIDES)            | HL (F16: Polymarket's sides ran the other way, buys +413, sells +274) |
| 2   | D0                  | V                 | x_in = t + 10,000 ms; x_out = x_in + 24 h                                                                                                                                                                                                                                                                                                       | better                                          | —                     | yes (LATE)             | Both (PM: a paper delay)                                              |
| 3   | D15                 | V                 | x_in = t + 900,000 ms                                                                                                                                                                                                                                                                                                                           | worse (the move back starts at once)            | —                     | yes                    | Both                                                                  |
| 4   | D60                 | V                 | x_in = t + 3,600,000 ms                                                                                                                                                                                                                                                                                                                         | worse                                           | —                     | yes                    | Both                                                                  |
| 5–9 | H1, H2, H4, H8, H12 | V                 | x_out = x_in + 1, 2, 4, 8, 12 h                                                                                                                                                                                                                                                                                                                 | better (less noise)                             | —                     | yes (LATE, F6)         | Both                                                                  |
| 10  | W1 THREE            | F                 | at least 3 different accounts in the slice's wave state for σ at t (`accountsAt`, MARKET-1's B5)                                                                                                                                                                                                                                                | better                                          | t                     | no (MARKET-FIND)       | Both                                                                  |
| 11  | W2 M DOUBLED        | V                 | M = 294, every slice's entries pooled                                                                                                                                                                                                                                                                                                           | better                                          | —                     | yes (M DOUBLED)        | Both (half the pool)                                                  |
| 12  | W3 COINS            | F                 | at least 2 different small coins among the slice's counted fills of σ up to t (`marketsAt`, B4)                                                                                                                                                                                                                                                 | better                                          | t                     | no                     | Both                                                                  |
| 13  | W4 VENUE            | F                 | the different accounts with a counted fill of σ in the 38 coins up to t, all accounts (`accountsAt` on every slice's fills) **≥ E median**                                                                                                                                                                                                      | better                                          | t                     | no                     | HL                                                                    |
| 14  | W5 FLOW             | F                 | (Σ px·sz of the coin's counted fills of σ up to t, all accounts) ÷ (Σ buyNtl + sellNtl of the coin's minutes ended in (t′ − 7 d, t′] ÷ 168), t′ the last minute end ≤ t, **≥ E median**; unknown if the 7 days start before 2025-05-25T14:00Z or the divisor is 0                                                                               | better                                          | t                     | no                     | HL                                                                    |
| 15  | R1 TREND            | F                 | σ·S7 > 0. S7 is MARKET-1's S: the mean over the 38 coins with both prices of (P_c(t) ÷ P_c(t − 7 d) − 1)·10⁴, at least 5 coins; S7 = 0 or under 5 coins is unknown. The far end uses convention 1, at most 1 min earlier than MARKET-1's form.                                                                                                  | better                                          | t                     | yes (the R family, F6) | Both                                                                  |
| 16  | R2 CRASH            | F                 | left out when σ·S24 > **its E 90th percentile**; S24 as S7 over 24 h                                                                                                                                                                                                                                                                            | better                                          | t                     | yes                    | Both                                                                  |
| 17  | R3 BTC CRASH        | F                 | left out when σ·(P_BTC(t) ÷ P_BTC(t − 24 h) − 1)·10⁴ > **its E 90th percentile**                                                                                                                                                                                                                                                                | better                                          | t                     | yes                    | Both                                                                  |
| 18  | R4 CALM             | F                 | kept when the basket's 7-day range < **its E median**. The range is max ÷ min − 1 of L_j = 1 + mean over the coins with both prices of (P_c(h_j) ÷ P_c(t′ − 7 d) − 1), at the 169 points h_j = t′ − j h, j = 0…168. A point under 5 coins makes it unknown.                                                                                     | better                                          | t                     | yes                    | Both                                                                  |
| 19  | C1 THIN             | F                 | kept when the coin is among the ⌊n/2⌋ of the n ranked coins with the least traded notional (Σ buyNtl + sellNtl) over the 30 days before the month of t (ties by asset id); a coin with no trade there is unranked: unknown                                                                                                                      | better                                          | the month's first day | no (MARKET-FIND)       | Both                                                                  |
| 20  | C2 WIDE             | F                 | kept when among the ⌊n/2⌋ widest by the median over those minutes of (impactAsk − impactBid) ÷ mid (rows with all three present, mid > 0)                                                                                                                                                                                                       | better                                          | the month's first day | no                     | Both                                                                  |
| 21  | C3 SMALL            | F                 | kept when among the ⌊n/2⌋ smallest by the mean over those minutes of openInterest × mark (both present)                                                                                                                                                                                                                                         | better                                          | the month's first day | no                     | Both, if Polymarket's open interest is recorded (to be checked)       |
| 22  | T1 NOT 08–12        | F                 | left out when t's UTC hour is 8, 9, 10 or 11                                                                                                                                                                                                                                                                                                    | better                                          | t                     | no (MARKET-FIND)       | Both                                                                  |
| 23  | T2 WEEKDAYS         | F                 | left out when t's UTC day is a Saturday or Sunday                                                                                                                                                                                                                                                                                               | better (thin weekend books let cascades run on) | t                     | no                     | Both                                                                  |
| 24  | X1 TARGET           | V                 | with B = P(t) − P(t − 60 min): if σ·B > 0, out at the first minute end e in (x_in, x_out) at which −σ·(P(e) − P(t)) ≥ ½·σ·B. The exit leg is at e (the next minute's start), priced as any leg. Else, or if no e qualifies, out at x_out. P(t) or P(t − 60 min) unknown leaves the position out; P(e) unknown means that minute cannot trigger. | better                                          | t, then each e        | yes (LATE)             | Both                                                                  |
| 25  | N1 BURST            | F                 | every counted fill of the slice of side σ up to t has its instant ≥ t − 600,000 ms                                                                                                                                                                                                                                                              | better                                          | t                     | no                     | Both                                                                  |
| 26  | N2 BIG FILL         | F                 | the entry fill's px·sz ÷ (Σ buyNtl + sellNtl over the 10,080 minutes ended in (t′ − 7 d, t′] ÷ 10,080) **≥ E median**; unknown as W5                                                                                                                                                                                                            | better                                          | t                     | no                     | Both                                                                  |
| 27  | N3 CROWDED          | F                 | s = −σ·rate of the coin's last settled row stamped ≤ t; kept when s > the 90th percentile (type 7) of −σ·rate over the coin's rows stamped in [t − 30 d, t); under 168 rows there is unknown                                                                                                                                                    | better                                          | t                     | no                     | Both                                                                  |
| 28  | N4 BOUNCED          | F                 | left out when σ·B > 0 and −σ·(P(x_in) − P(t)) ≥ ½·σ·B (B as X1; P(x_in) through convention 1, never the minute holding x_in); a needed price unknown is unknown                                                                                                                                                                                 | better                                          | the rule's x_in       | no                     | Both                                                                  |
| 29  | N5 BACKSTOP         | F                 | some forced fill (H4's rule) of method "backstop" and side σ, in any coin of `liq` (every dex), up to t                                                                                                                                                                                                                                         | better                                          | t                     | no                     | HL                                                                    |
| 30  | N6 REPEAT           | F                 | left out when the slice had an entry in the coin, either side, with instant in [t − 24 h, t)                                                                                                                                                                                                                                                    | better                                          | t                     | no                     | Both                                                                  |
| 31  | N7 OI DROP          | F, **print only** | (OI(t − 60 min) − OI(t)) ÷ OI(t − 60 min) > **its E median**, OI read through `knownAt`                                                                                                                                                                                                                                                         | better                                          | t                     | no                     | HL                                                                    |
| 32  | N8 DISCOUNT         | F, **print only** | σ·premium (`knownAt` at t) > **its E median**                                                                                                                                                                                                                                                                                                   | better                                          | t                     | no                     | HL                                                                    |
| 33  | N9 THROUGH          | F                 | the mean, over the coin's counted fills of σ up to t (all accounts), of σ·(px − markPx) ÷ markPx·10⁴ **≥ E median**                                                                                                                                                                                                                             | better                                          | t                     | no                     | HL                                                                    |
| 34  | N10 MARKET-WIDE     | F                 | BTC, or ETH, had at least 2 different accounts with a forced fill (H4's rule) of σ in that coin up to t                                                                                                                                                                                                                                         | better                                          | t                     | no                     | HL                                                                    |
| 35  | N11 VOLATILE        | F                 | RV(t) ÷ the median of the daily RV over the 30 UTC days before t's day is ≥ 1.5. RV is √Σ r² of the 288 five-minute log returns of P at the minute ends t′ − 5j min, needing at least 230 of 288 (a day: its own 288; at least 7 days)                                                                                                          | better                                          | t                     | no                     | Both                                                                  |

**The print X2 STOP:** like X1, out at the first e in (x_in, x_out) with
dir·(P(e) ÷ P(e₁) − 1)·10⁴ ≤ −1,000, where e₁ is the first minute end after
x_in. It is seeded (the look's worst position).

**The cuts frozen from E** (the kit's `quantile`, type 7, over B0's E
positions whose feature is known):

- medians: W4, W5, R4, N2, N9, and N7, N8 (print only);
- 90th percentiles: R2, R3.

They are computed from features alone, with no price at any leg, written
to `polish/cuts.json` with their n and unknown counts, and committed before
any outcome is computed (9).

**The other cuts are fixed now:** 3, 2, 0, ½, 10 min, 24 h, 1.5, the halves,
the hours and the days.

**Seeded or not** (F6), and what the plan's 3.7% means here:

- **Seeded, 15 tries:** S1, D0, D15, D60, H1–H12, W2, R1–R4, X1.
  - R1 is marked seeded although its lead was MARKET-FIND's: the review
    names the whole R family as seeded and R1 among MARKET-FIND's leads, so
    I take the safer reading.
  - X1 is seeded through LATE (ruled as recommended: decisions 2026-11-18, "POLISH-EXPLORE's plan approved", 7).
- **Not seeded, 20 tries:** W1, W3, W4, W5, C1–C3, T1, T2, N1–N11; 18 of
  them are adoptable.
- Under pure chance, P(t ≥ 2.5) = 0.621% a try. So the chance that a
  useless change reaches FRESH is:

  | Tries            | Pass E (at most) | Reach FRESH (× 15.87%) |
  | ---------------- | ---------------- | ---------------------- |
  | all 33 adoptable | 20.5%            | 3.3%                   |
  | the 18 unseeded  | 11.2%            | **1.8%**               |

  For the seeded tries only FRESH is clean. A wasted exam is their cost,
  never a false HOLDS.
