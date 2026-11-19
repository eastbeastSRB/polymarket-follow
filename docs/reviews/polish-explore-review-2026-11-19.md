# POLISH-EXPLORE-REVIEW — the Final review of the exploration: its numbers recomputed with code of my own; the choice stands, and the gain is a few market-wide days

POLISH-EXPLORE-REVIEW (Sonnet 5.5), 2026-11-19, for polymarket-follow's supervisor (UTC; every stamp from `date -u`; worked
20:45Z to 21:4xZ). It is step 7 of the polishing plan (`docs/reviews/wave-polish-plan-2026-11-17.md`, section 6): the Final
review of `docs/reviews/polish-explore-2026-11-19.md` (b506a16), with its added points (the supervisor, 20:4xZ). **A review
decides nothing:** the owner rules on the nominee.

*Holds and does not hold are verdicts on a test, never instructions to trade.*

## Verdict: **the choice stands**

- **Every number that decides, recomputed with code of my own, equals the outputs.** B0 on E, W4's D-test against B0, its
  floors and the gain floor, N on E, N and B0 on C, the D-test on C with k from E, F2's floors: the largest difference in any
  statistic is **3.1e-12** (bps or a ratio); every count is equal. Twenty-one of the 35 tries and every table of the report's
  section 3 agree (section 2).
- **The choice rule was applied exactly:** W4 is the only change with t ≥ 2.5 and every floor met in a family that had no
  larger t; W1 (t 2.53) lost its family to W4 (t 3.03); X1 (t 2.81) was refused by the mean floor; one evaluation on C was spent.
- **The four added points are settled** (section 3): **z stays 2.81 at K = 10**; P(HOLDS) is 4.8% at look 1 and 7.0% at
  look 2 on slices 0–9's own errors, and about 3.4% / 5.9% on a typical block of ten slices; the gain sits on a few days and is
  the market's own move; N's size print and the two counts are in.
- **What the owner should weigh before the freeze is not a fault in a number** (findings 1–5, section 5): N's gain is the
  small coins' mean move after a market-wide cascade on a few days (OWN +10.0 ± 27.3 on E and +7.5 ± 21.6 on C); K = 10 sits on
  the lucky side of its own blocks; 22% (E) and 38% (C) of N's priced positions have a leg depth short at the tape, and carry
  58% and 46% of its gain.

## For the owner, in one page

**What I did.** I rebuilt the exploration's numbers from the trusted store's columns (every file held to its manifest size and
SHA-256) with my own code, importing and reading nothing of `src/polish/tries/`, from WAVE-H's frozen rules H4–H9 and the plan, using
WAVE-H-LOOK-REVIEW's pipeline as the model. First proof on a known answer: the look's EVERY SLICE line on marks, 176,986
positions, **+66.13311166059353 ± 31.30967357566873** (the look: …404, …865).

**What holds.**
1. N = B0 + W4 on E: 65,533 priced positions, **+94.69 ± 54.26**, D +48.65, SE_D 16.07, **t 3.027**; on C: 16,754, **+211.26 ±
   122.14**, D +154.69 ± 69.79, **t 2.217**, every F2 floor met. Equal to the outputs to 1e-12.
2. B0 on E +33.70 ± 39.72, on C +41.41 ± 48.36: equal.
3. The cuts were committed before any outcome: 853c864 at 17:36:44Z and eccafa0 at 19:08:25Z, each before the E step that
   followed it (17:36:52Z and 19:08:32Z); the first E run wrote nothing; W4's cut, 336, is my own median too.

**Where the gain sits, plainly** (section 3.2):
- **Few days.** Two days, 2025-11-04 and 2025-10-11, make **56%** of N's gain on E (top five days 84%); on C, 2026-02-06 and
  2026-02-05 make **75%** (top five 108%). Without its five best days N's mean is +16.4 on E and **−23.4** on C. The effective
  number of days is 36.7 of 99 on E and 16.6 of 50 on C.
- **A few cascades.** Twenty of 3,085 episodes make 99% of E's gain; the five largest, all on 2025-10-10 between 20:53Z and
  20:54Z, make 46.5%.
- **The market's move.** N is 99.4% (E) and 96.6% (C) long. Of its gross on marks, +128.7 on E and +228.3 on C, the other small
  coins' own mean move over the same hold is **+118.7 and +220.8**: OWN is **+10.0 ± 27.3 and +7.5 ± 21.6** (z 0.37 and 0.35).
  One position per cascade makes −3.6 ± 69.2 on E and +67.4 ± 65.1 on C.
- So N is, in effect, "buy the small coins after a market-wide liquidation cascade, hold a day", and the exam will be decided by
  whether FRESH's days hold such cascades and which way the market goes after them. That is a legitimate thing to test, and a
  different one from "the coin overshoots after its own forced sells".

**What the exam can see** (K = 10, z 2.81, my window errors 78.0 at 100 days and 66.6 at 182):

| If the true mean is | Look 1 needs +219 | Look 2 needs +187 |
|---|---|---|
| +89 (C less one error) | 4.8% | 7.0% |
| +118 (E and C pooled) | 9.8% | 15.1% |
| +133 (the K = 10 line on E and C) | 13.3% | 20.6% |
| +211 (C's estimate) | 46.0% | 64.1% |

On a typical block of ten slices the errors are about 90 and 71, not 78 and 66 (finding 2): subtract about one point from the
first row.

**Trading at a larger size** (N's own entries, slice 0's books, section 3.3). The cost of the entry alone against the mid:

| Size | On E (559 books) | On C (131 books) |
|---|---|---|
| $1,000 | 8.5 ± 6.1 bps | 3.3 ± 0.8 |
| $10,000 | 31.4 ± 26.1 | 5.5 ± 1.4 |
| $50,000 | 83.5 ± 72.7 | 11.1 ± 2.8 |

At $50,000, 49 of 559 E books and 9 of 131 C books ran out of depth. N's entries cost more than B0's (5.0 / 17.8 / 46.6 on E).

---

## 1. How I recomputed, and what I did not touch

**Code.** Mine, in my scratchpad (`store.cjs`, `core.cjs`, `price.cjs`, `stats.cjs`, run scripts). It reads the store through
its manifest: each column file is held to its size and SHA-256 when read, the dictionary of users (address as a 160-bit number
mod 147), the counted fills from `liq` by H4, the slices, M5's waves and entries (a two-pointer scan a slice), the 40 coins'
minute marks, the tape's takers (`flags` bit 1 = a backstop's record), the funding rows. Prices are H8's second rule (the first
takers on our side in [x, x + 60 s), no backstop's, walked as levels), fees 4.5 bps a leg, funding Σ rate × the mark at the end
of the minute before the hour (H9), statistics the kit's two-way CR1 (M10), the D-test by influences (plan 1.4).

**Independence.** I did not open or import any file of `src/polish/tries/`, nor `beside.ts`. I read `src/polish/writers.ts`
for the store's row format (`BACKSTOP` = 1, `NONE`), saw two lines of `legs.ts` in a search result (the tape's side and backstop
test), read the kit's `mulberry32`, and ran a search for `WAVEH_ROOT` that touched `src/polish/tries/steps.ts` and returned
nothing. The model was WAVE-H-LOOK-REVIEW's scripts (`lib`, `positions`, `counted`, `lines`,
`market`, `tape`; I copied its `lz4.cjs` and `books.cjs` for the book prints).

**The known answer first:** all 147 slices on marks over TEST, 176,986 entries, every one with marks: +66.13311166059353 ±
31.30967357566873; difference to the look's line 5.1e-13 and 7.8e-14. The same pass gave the counted fills, 2,421,070 (equal to
`features.counted`), B0's 210,992 entries, 148,154 in E and 57,495 in C (equal).

**Limits held.** FRESH, the collector's recordings, database and run folder, the paper experiment's and MARKET-1's data: never
opened. No `dist` program, fetch, network, agent, deploy or Task Scheduler. Every analysis script ran at below-normal priority
(`os.setPriority`), at most two at a time, between 20:50Z and 21:30Z (outside 02:30–06:00Z and 10:25–11:15Z); one size listing
(`du`) of the store's folders ran at normal priority for two minutes before I stopped it. **C:** only B0 and N, the evaluations the rule
reached; no other try was computed on C, and no part of C was split by any feature but N's own sides, months, days, episodes
and slices. WAVE-H's raw store was read only for the books of slice 0's entry legs (the list held to `gates.json`'s SHA-256
`5777e154…`, each file to its line) and the look's `positions.jsonl.gz` (`7d92d625…`, the identity's). Writes: my scratchpad,
my folder in the supervisor's, and this file.

## 2. The numbers against the outputs

Mine | output (file field) | |difference|. bps unless a ratio.

| Number | Mine | Output | Diff |
|---|---|---|---|
| B0 on E, m | 33.70021551038479 | 33.70021551038521 (`e.json` `b0.stat.mean`) | 4.3e-13 |
| B0 on E, SE | 39.71807599613217 | 39.71807599613224 | 7.1e-14 |
| B0 on E, priced; unpriced entry / exit / funding | 135,145; 1,630 / 9,740 / 1,639 | same | 0 |
| W4 cut (median, type 7, 148,154 positions) | 336 | 336 (`cuts.json`) | 0 |
| W4 = N on E, positions / priced | 74,104 / 65,533 | same | 0 |
| N on E, m | 94.685677836701 | 94.6856778367026 (`choice.json` `N.stat.mean`) | 1.6e-12 |
| N on E, SE | 54.25885218671197 | 54.25885218671187 | 1.0e-13 |
| k = SE_V ÷ SE_B0 | 1.3660997121813203 | 1.3660997121813154 (`choice.json` `N.k`) | 4.9e-15 |
| D, SE_D, t on E | 48.64782312751588; 16.071820105049806; 3.0269019196046507 | 48.64782312751705; 16.071820105049966; 3.026901919604694 | 1.2e-12; 1.6e-13; 4.3e-14 |
| Floors on E: mean, days, coins; gain floor | 94.7 ≥ 50; 99 ≥ 40; 33 ≥ 15; D 48.6 ≥ max(10, 3.4) = 10 | all `true`; `gain` 10 | — |
| B0 on C, m ; SE; priced | 41.41355083542015 ; 48.3636087852022 ; 52,163 | …039 ; …225 ; 52,163 | 2.3e-13 ; 5.0e-14 ; 0 |
| N on C, m ; SE ; priced | 211.26301264343942 ; 122.13521220804047 ; 16,754 | …4045 ; …039 ; 16,754 | 1.0e-12 ; 8.5e-14 ; 0 |
| N on C, D ; SE_D ; t (k from E) | 154.68797276676548 ; 69.78804278256486 ; 2.2165397767167527 | …64 ; …487 ; …765 | 9.1e-13 ; 1.4e-14 ; 1.2e-14 |
| C's own k | 2.5253535721554785 | 2.525353572155474 | 4.4e-15 |
| F2's floors on C | mean 211 ≥ 25; days 50 ≥ 30; coins 35 ≥ 15; footprint **47 windows of 100 days, fewest days 25 (≥ 20), fewest coins 35 (≥ 10)** | all `true` (the windows' counts are not printed) | — |

**Twenty-one tries on E** (positions, priced, m, SE, k, D, SE_D, t and every refusal reason) with the same pipeline:

| Tries | Result |
|---|---|
| S1, D0, D15, D60, H1, H2, H4, H8, H12, W1, W2, W3, W4, T1, T2, X1, N1, N6 | counts equal; every statistic within **3.1e-12**; every `refused` list equal |
| N4, N5, N10 | counts equal; the statistics equal to the three decimals compared |

The decisive ones in detail: **W1** m +70.617 ± 47.555, D +30.267, SE_D 11.972, t **2.528**, refused none (so W4's t 3.027 decides
the family). **X1** (the target exit, 111,851 exits triggered, 61 positions left out) m **+49.5062** ± 18.292, D +33.986, t
**2.806**: only `the mean floor` refuses it, by **0.494 bps**. **H12** t 2.087, m +60.87 ± 22.09: only `t below 2.5`.

**The tries not recomputed (14):** W5, R1–R4, C1–C3, N2, N3, N7, N8, N9, N11 (and the X2 print). Their reported t lie between
−2.26 and +2.19 (N8, print only, +2.19; R1 +1.36; N11 +1.27; W5 +1.13); none is near 2.5. The 21 that agree share their
legs, prices, statistics and tests, so what remains unchecked is each one's own feature definition.

**The report against `e.json`:** every row of its tables 3.1, 3.2 and 3.3 (35 tries; 490 numbers: positions, priced, m, SE, z,
days, coins, the seeded flag, k, D, SE_D, t, the four floors, the unpriced counts) equals the output as rounded. The 15 seeded
tries are the try log's (S1, D0, D15, D60, H1–H12, W2, R1–R4, X1).

**Prints beside, recomputed:**

| Print | Mine | Report |
|---|---|---|
| Without the two best days, N on E | 61,842; +44.49 ± 40.94 | same |
| … N on C | 13,940; +64.06 ± 69.01 | same |
| … B0 on E / C | 129,414, +2.48 ± 33.34; 47,185, −7.10 ± 36.67 | same |
| Event level, N on E / C | 3,085, −3.63 ± 69.17; 1,216, +67.44 ± 65.05 | −3.6256 ± 69.1696; +67.4398 ± 65.0536 |
| Event level, B0 on C | 4,954; −7.9275 ± 23.47 | same |
| Event level, B0 on E | 8,688; **−14.146** ± 29.54 | −14.208 (finding 8) |
| OWN, N on E / C | +10.008 ± 27.312; +7.523 ± 21.622 | same |
| K table: n, SE, days, coins at K = 1, 5, 10, 20, 50, 147 | 668, 67.83, 106, 33 … 82,287, 50.74, 149, 35 | same (and K by count = 10) |
| Book footprint at K = 10 | 5,609 files, 144 days, 38.95 a day | same (2.11 GB) |
| B0's walks, slice 0 | $1,000 5.04 / 2.30; $10,000 17.81 / 3.90; $50,000 46.62 / 7.47; short 0, 1, 71 and 0, 0, 33 | same |
| b on E | +3.761073138782 ± 2.649656208286, n 675 | same, **with the look's WAVE-H set only** (finding 7) |
| b on C | +1.137173 ± 0.808825, n 318 | same |
| Projection formula, K = 147 | 3.61% / 6.49%; pooled 2.06% / 3.39% | 3.610% / 6.495%; 2.060% / 3.390% |
| Placebo, K = 147 (my draw order) | window error 88.2 (74.0–135.7); sd 0.938; 99.75th 2.50 | 88.1 (74.0–135.7); 0.939; 2.57 |

## 3. The added points

### 3.1 z and the projection on K = 10

**My placebo.** On E ∪ C, N's priced nets of slices 0–9 (5,799 positions); each B1 episode's sign flipped at random; 10,000
draws a window length; windows of 100 and 182 **consecutive calendar days** of the 360 from 2025-06-01 to 2026-05-26, a random
start; mulberry32 with seed 20,261,118; t* = the flipped mean ÷ its two-way SE; the error is the unflipped nets' two-way SE in
the window. **My draw order is my own,** so the draws are not the report's draws: I validated the code on all 147 slices, where
the windows' errors come out equal (88.2 (74.0–135.7) against 88.06 (74.03–135.72); 182 days 69.0 (56.4–82.4) against 68.8
(56.4–80.2)), the sd equal (0.938 against 0.939) and the tail within sampling noise (99.75th 2.50 against 2.57, 99.5th 2.22
against 2.33; P(t* > 2.81) 0.09% against 0.11%).

| Line | Flip | Window | Draws | P(t* > 2.58) | P(t* > 2.81) | sd | 99.5th | 99.75th | Error: median (q1–q3) |
|---|---|---|---|---|---|---|---|---|---|
| **K = 10** | episode | 100 days | 10,000 | 0.12% | 0.04% | 0.919 | 2.154 | **2.360** | **78.0** (68.6–150.1) |
| K = 10 | episode | 100 days | 200,000 | 0.14% | 0.06% | 0.923 | 2.197 | 2.403 | 77.6 (68.6–150.9) |
| K = 10 | episode | 182 days | 10,000 | 0.14% | 0.05% | 0.891 | 2.157 | 2.315 | **66.6** (49.9–82.9) |
| K = 10 | day | 100 days | 10,000 | 0.29% | 0.12% | 1.009 | 2.411 | 2.626 | 77.6 (68.6–136.6) |
| K = 10 | day | 100 days | 200,000 | 0.25% | 0.13% | 1.008 | 2.375 | 2.577 | 78.0 (68.8–150.9) |
| K = 10 | day | 182 days | 10,000 | 0.30% | 0.09% | 1.016 | 2.441 | 2.605 | 66.6 (49.9–81.1) |
| K = 147 | episode | 100 days | 10,000 | 0.17% | 0.09% | 0.938 | 2.222 | 2.495 | 88.2 (74.0–135.7) |
| K = 147 | day | 100 days | 10,000 | 0.53% | 0.29% | 1.060 | 2.592 | **2.850** | 88.1 (74.0–135.9) |
| K = 147 | day | 182 days | 10,000 | 0.51% | 0.28% | 1.034 | 2.599 | 2.823 | 69.0 (56.4–81.3) |

"Flip: episode" is the plan's F1 (the report's). "Flip: day" is my sensitivity: every position of one UTC day takes one random
sign, so a day's positions keep their relative signs (finding 3).

**The exam's z = max(2.81, the rule's 99.75th percentile at 100 days) = 2.81** at K = 10, on both flips (2.36 to 2.40 by
episode, 2.58 to 2.63 by day). The 99.75th percentile of 200,000 draws is a quantile with an error of about 0.015.

For a LIKELY bar at 95% (one look 1.96, two looks 2.24 by the normal), my placebo's 97.5th and 98.75th percentiles at K = 10 and
100 days are 1.71 / 1.92 by episode and 1.87 / 2.10 by day: below the normal values, which therefore bind (100,000 draws).

**The projection.** P(HOLDS) = Φ((m_proj − max(z·SE, 50 − z·SE)) ÷ SE), z 2.81. I reproduced the report's K = 147 figures first
(3.61% / 6.49% from C less one error, 2.06% / 3.39% pooled).

| m_proj from | m_proj | Look 1, SE 78.0 | Look 2, SE 66.6 |
|---|---|---|---|
| **C less one error, all slices (the report's)** | +89.13 | **4.8%** | **7.0%** |
| E ∪ C pooled less one error, all slices (the report's) | +67.68 | 2.6% | 3.6% |
| C less one error, the K = 10 line (254.07 − 136.50) | +117.57 | 9.6% | 14.8% |
| E ∪ C pooled less one error, the K = 10 line (132.59 − 49.95) | +82.64 | 4.0% | 5.8% |

(With the report's all-slice errors 88.1 and 68.8 the first two rows are 3.6% / 6.5% and 2.1% / 3.4%.) **Caution:** the SE
used here is slices 0–9's own median window error. It is the lowest of the 14 blocks of ten slices (80.9 to 108.2 at 100 days,
median **90.3**; at 182 days 61.4 to 83.4, median **71.4**); on the typical block the first row is 3.4% / 5.9%
(finding 2).

### 3.2 The concentration and the event-level line

**N on E and on C** (priced positions; "sum" is the sum of nets in bps of $1,000):

| | E | C |
|---|---|---|
| Positions; sum; mean | 65,533; 6.21 M; +94.7 | 16,754; 3.54 M; +211.3 |
| Best day: its share of the sum | 2025-11-04: 31.9% | 2026-02-06: 51.8% |
| Second | 2025-10-11: 23.7% | 2026-02-05: 23.0% |
| Top 2 / 5 / 10 days | **55.7%** / 84.4% / 113.5% | **74.8%** / 107.5% / 130.2% |
| Mean without the 1 / 2 / 3 / 5 / 10 best days | +67.0 / +44.5 / +33.6 / **+16.4** / −15.5 | +108.9 / +64.1 / +31.2 / **−23.4** / −116.4 |
| Episodes; positions an episode (mean, largest) | 3,085; 21.2, 349 | 1,216; 13.8, 300 |
| Top 5 / 10 / 20 / 50 episodes | 46.5% / 69.1% / **99.0%** / 155% | 31.8% / 43.2% / 59.9% / 94.6% |
| Effective number of days (n² ÷ Σ nᵈ²) | **36.7** of 99 | **16.6** of 50 |
| Effective number of episodes (same measure) | 835 of 3,085 | 297 of 1,216 |
| Event level: one position per episode | −3.6 ± 69.2 (z −0.05) | +67.4 ± 65.1 (z +1.04) |

- On E the five largest episodes are LDO, ZEC, WLD, ETHFI and MORPHO entered on **2025-10-10 at 20:53–20:54Z** (61 to 141
  positions each, +0.37 M to +0.68 M); the same day holds N's worst day (−985,560 over 6,088 positions), so 2025-10-10 as a day
  is not among the top days, and as a set of episodes it is the whole story. On C the largest is XRP on 2026-02-05 at 15:06Z
  (267 positions, 15.7%); all of the top seven episodes start on 2026-02-05 or 02-06.
- **The K = 10 line on E ∪ C** (5,799 positions, 2,006 episodes, 143 days; mean +132.6 ± 49.95; on E +98.9 ± 47.8, on C +254.1 ±
  136.5): the best day 2026-02-06 is 21.1% of its sum, the top 2 days 36.8%, top 5 62.7%, top 10 86.7%; without 1 / 2 / 3 / 5 /
  10 best days +106.3 / +87.7 / +71.5 / +54.7 / +20.6; effective days **50.9** of 143; 881 of its 2,006 episodes have one
  position; the five largest episodes make 35.2%.

**Where the money comes from, by the market's move** (marks, all positions with marks; OWN is the report's line):

| | Gross on marks | The market part: dir × the other small coins' mean move over the hold | OWN = the difference |
|---|---|---|---|
| N on E (74,104) | +128.7 ± 46.4 | +118.7 ± 43.0 | **+10.0 ± 27.3** (z 0.37) |
| N on C (19,317) | +228.3 ± 125.0 | +220.8 ± 126.1 | **+7.5 ± 21.6** (z 0.35) |
| N, K = 10, on E (5,193) / on C (1,455) | +139.9 / +261.5 | +122.3 / +241.1 | +17.6 ± 32.0 / +20.4 ± 26.9 |
| B0 on E / on C | +57.8 / +60.8 | +53.7 / +68.7 | +4.1 ± 19.5 / −7.9 ± 14.9 |

N's positions are **65,133 of 65,533 (99.4%) on E and 16,188 of 16,754 (96.6%) on C after forced sells,** so we are long.
92% of N's gross on E and 97% on C is the market's, not the coin's own.

**What the dose looks like on E only** (B0's priced positions by W4's count of accounts liquidated on the forced side in the
hour; E, never C): fewer than 50: −13.8 ± 20.7; 50–99: −17.0; 100–199: −21.9; 200–335: −33.2; **336–499: +2.8 ± 62.1 (99 days);
500–799: +49.1 ± 82.2; 800–1,499: +122.9 ± 116.7 (45 days); 1,500 and more: +276.9 ± 148.2 (14 days)**. The mean rises with
the cascade's size, and the top bin is 14 days.

**What this means for the exam's pooled line.**
1. The pooled line gives an episode the weight of the slices that entered it: on E an episode has 21 positions on average and
   up to 349; at K = 10, 2.9 on average and up to 26. The pooled mean is a cascade-size-weighted mean. One position per
   cascade shows nothing on E and a +1.0 z on C. The report is right that "the gain came from the cascades that many slices
   entered".
2. Many cascades on one day are one market bet. The independent unit is nearer the day than the episode: 36.7 effective days
   on E, 16.6 on C, 50.9 on the K = 10 line over both. The two-way error clusters by day and coin, and the exam's window error (78
   at 100 days) says what this costs; the placebo says the error is honest if the signs flip by episode (0.04%) and by day
   (0.12%).
3. At K = 10 a 100-day window of FRESH can be expected to hold about 25 to 60 days with a position (the fewest of the 261
   windows of E ∪ C: **23 days and 30 coins**, median 44), so TOO FEW's 20 days and 10 coins are met with a thin margin in a
   quiet stretch. W4's share of entries was 50% on E (the cut is E's median) and 34% on C (19,317 of 57,495).
4. What decides is the market's move after the few big cascades of the window. **The exam's HOLDS also needs the excess over
   each coin's 4-hour BASE,** which removes the coin's drift in a time-of-day block and **not the day's market move**; a rebound
   after a crash day passes it.

### 3.3 N's own size print

Slice 0's entry books at x_in (the last snapshot at or before, live within 10 s, usable; 20 levels; WAVE-H's held files),
N = slice 0's entries with W4 ≥ 336. The cost is dir × (the walk's price ÷ the mid − 1) in bps, the extra is the ratio of the
walk's price to the $1,000 walk's (the report's definition; the difference of the costs is a little larger on E).

| Part | Positions | Not walked | Walked (priced at the tape) | Size | Cost | Extra over $1,000 | Depth short |
|---|---|---|---|---|---|---|---|
| E | 611 | no book file 42; stale 10 | 559 (487) | $1,000 | +8.46 ± 6.13 | — | 0 |
| | | | | $10,000 | +31.37 ± 26.13 | +21.39 ± 18.59 | 0 |
| | | | | $50,000 | +83.47 ± 72.68 | +69.71 ± 61.55 | 49 (8.8%) |
| C | 154 | stale 22; no book file 1 | 131 (112) | $1,000 | +3.27 ± 0.79 | — | 0 |
| | | | | $10,000 | +5.51 ± 1.43 | +2.24 ± 0.74 | 0 |
| | | | | $50,000 | +11.05 ± 2.82 | +7.78 ± 2.12 | 9 (6.9%) |

The same walks for B0's slice 0 reproduce the report (E 5.04 / 17.81 / 46.62, C 2.30 / 3.90 / 7.47). N's entries come after
cascades, so they cost more: on E the median $10,000 entry costs 2.2 bps but the 99th percentile 143.5 and the worst 5,248.5
(one book). A $10,000 follower pays about +21 bps extra on the entry on E, against a mean of +94.7; the exit would add a
similar cost (the exit's book is not walked in this print). At $50,000 the entry alone costs 83 bps on E. On C the sizes cost
little and the gain is large; the two parts differ by a factor of about 2.5 on the cost of $1,000 (8.5 against 3.3).

### 3.4 The two counts

From the positions files (`short`: a leg walked past the tape's depth in its minute; `missing`: funding hours without a row),
summed by group; the filter tries are B0's lines that pass their filter (my masks):

| Group (E) | Positions | Priced | Short, of the priced | `missing` hours |
|---|---|---|---|---|
| B0 | 148,154 | 135,145 | 23,645 (17.5%) | 0 |
| S1 / W1 / W3 / **W4 = N** / T1 / T2 / N1 / N6 | 131,494 / 88,097 / 125,049 / **74,104** / 135,783 / 130,486 / 55,011 / 79,760 | 119,171 / 78,204 / 112,340 / **65,533** / 123,698 / 118,584 / 51,569 / 69,686 | 21,928 (18.4%) / 17,098 (21.9%) / 22,625 (20.1%) / **14,324 (21.9%)** / 21,602 (17.5%) / 21,340 (18.0%) / 7,182 (13.9%) / 17,687 (25.4%) | 0 |
| D0 / D15 / D60 | 148,154 each | 135,699 / 133,242 / 132,726 | 22,392 / 25,010 / 27,027 | 0 |
| H1 / H2 / H4 / H8 / H12 | 148,154 each | 140,987 / 139,610 / 138,206 / 137,828 / 136,049 | 16,344 / 18,923 / 22,120 / 24,890 / 25,920 | 0 |
| W2 / X1 / X2 (print) | 143,370 / 148,093 / 148,154 | 131,433 / 140,421 / 135,954 | 21,580 / 17,161 / 21,739 | 0 |
| **N on C** | 19,317 | 16,754 | **6,383 (38.1%)** | 0 |
| B0 on C | 57,495 | 52,163 | 13,577 (26.0%) | 0 |

- **`missing` is 0 in every group of every file** (e, choice, c), and 0 in my own pricing: no hour of any position lacked a
  funding row. The funding column is complete.
- **Depth short is common.** It is 17.5% of B0's priced positions on E and 26.0% on C, and 21.9% and 38.1% of N's. Most are exits
  (N on E: 13,476 exits and 1,898 entries; on C 6,157 and 814). The tries not listed (W5, R1–R4, C1–C3, N2, N3, N7–N9, N11) are
  filters of B0's lines and I did not sum them (their filters' definitions were not recomputed).
- **They carry the gain.** N on E: the 14,324 short positions average **+251.2 ± 129.7**, the 51,209 others **+50.9 ± 80.2**
  (58% of the sum is in the short ones). N on C: **+253.8 ± 116.0** and **+185.1 ± 128.9** (46%). B0 on E: +150.8 against +8.9;
  B0 on C: +122.7 against +12.8.
- For these legs the tape's price is the last level's for the part the minute's takers could not fill. The calibration puts the
  tape's gain over the book at +0.61 ± 0.41 bps on 935 exits with 174 of them short (report 5.10), which argues against a
  bias, and the exam prices at the book first. The exam's WITHHELD (more than 10% unpriced, depth short or left out) will count
  the tape-priced legs that are short: here 17% to 38% of positions.

## 4. The checks of the brief

| Check | Result |
|---|---|
| The cuts committed before any outcome | **Yes.** `853c864` at 17:36:44Z (committer 18:36:44+01:00), the first E run started 17:36:52Z, ran its reproduction (passed) and its tries and crashed writing at 17:40:28Z; the log has only phase lines. `eccafa0` at 19:08:25Z, the second E run started 19:08:32Z, `e.json` written 19:12:34Z; `features.json` (run 2) 18:59:08Z. `explore\cuts.json` equals the repository's file byte for byte (SHA-256 `2040ded3…`, both). The nine values are features only; W4's, 336, equals my own median. |
| The reproduction check ran, and how | The E step's first phase after loading (log: 9–10 s) prices B0 over TEST on marks and holds it to the look's EVERY SLICE line (n exact, m and SE to 1e-9 bps, else exit 6). It passed both times (`reproduction.equal` true, difference 0). My own pass reproduces the line to 5e-13. |
| Calibration's b, and the re-base | **b = +3.761 ± 2.650 (n 675), below +10, no net re-based** (`rebasedBy` 0, the rule one-sided, E only). Recomputed exactly, with the look's WAVE-H set only (finding 7). b on C +1.137 ± 0.809 equal. |
| The choice rule applied exactly | t ≥ 2.5 and every E floor and the gain floor: W4 only in family W (W1 t 2.528 is smaller); X1 refused by the mean floor; one change adopted, so no family cap acted; N first on C, one evaluation spent of two; F2's floors met. All recomputed. |
| The projection from C less one error | m_C − SE_C = 211.263 − 122.135 = 89.128, untruncated 211.263 beside; formula reproduced. |
| The placebo's z | 2.81 (the floor; the rule's 99.75th is below it on all 147 slices and on slices 0–9). |
| K by count | Smallest of 1, 5, 10, 20, 50, 147 with SE ≤ 1.03 × 50.74 = 52.26: K = 5 is 54.11, **K = 10 is 49.95**. Equal. |
| The seeded marks | The 15 of the try log; W4 is unseeded; the arithmetic of 1.8% and 3.3% is right (18 and 33 tries × 0.621% × 15.87%). |
| The report's numbers | Its tables 3.1–3.3 (490 numbers, the seeded and floor flags) equal `e.json`; every figure of its sections 4 and 5 that I recomputed (section 2) equals the outputs. |

## 5. Findings, by severity

**Major (for the owner's ruling; no number is wrong).**
1. **N's gain is a few days of the market's own move.** Top 2 days 56% (E) and 75% (C) of the gain; without the best 5 days +16.4
   (E) and −23.4 (C); 20 of 3,085 episodes make 99% of E; effective days 36.7 and 16.6; OWN +10.0 ± 27.3 and +7.5 ± 21.6
   (92% and 97% of the gross on marks is the other small coins' move); N is 99.4% / 96.6% long; the event level is −3.6 ± 69.2
   and +67.4 ± 65.1. The report prints these numbers (5.1, 5.4, 9) but its one page sets the sentence "the gain came from the
   cascades that many slices entered" as the whole point. The exam will test "after a market-wide cascade, do the small coins
   rebound within a day", on a handful of events. *Recommendation:* the owner reads this before the talk on the recipe; the
   exam's page prints OWN, the top-2 days' share and the event-level mean beside the verdict.

**Moderate.**
2. **K = 10 is on the lucky side of its own blocks.** The 14 blocks of ten slices have SE 45.7–65.1 on E ∪ C (mean 53.3 =
   ×1.051 of all slices' 50.74; slices 0–9 are ×0.984), and median window errors 78.0 to 108.2 at 100 days: slices 0–9 are the
   lowest, the median block 90.3 (182 days: 66.6 against a median block 71.4). Blocks of 20 slices: SE 45.8–56.8, mean ×1.027.
   The rule "smallest K within 3%" picks K on the first K slices' own luck; the exam will see a typical block. The projection
   at K = 10 is 3.4% / 5.9% on a typical block, not 4.8% / 7.0%. *Recommendation:* K = 20 (slices 0–19: SE 48.28; 7,470 files over
   146 days, about 5,100 for 100 days, about 2.8 GB against 2.1) or keep K = 10 and project with errors of about 90 and 71.
3. **The placebo's episode flips make a long-only book market-neutral.** N is 99% long; flipping each episode's sign at random
   lets a day's cascades cancel. Flipping by day keeps the relative signs: K = 147's 99.75th percentile is **2.85** (100 days)
   and 2.82 (182) against 2.47–2.50 by episode, so z would have risen above 2.81 for all slices; K = 10's is 2.58–2.63 against
   2.36–2.40, so **z stays 2.81 at K = 10 on either flip**, with a margin of about 0.2 on the day-level one. *Recommendation:*
   freeze z = max(2.81, the larger of the two flips' 99.75th percentile) at K = 10 and print both flips.
4. **Depth short at the tape** (section 3.4): 21.9% (E) and 38.1% (C) of N's priced positions, carrying 58% and 46% of its gain;
   without a short leg N's mean is +50.9 ± 80.2 (E) and +185.1 ± 128.9 (C). *Recommendation:* the exam prints the verdict's mean
   by price source and by depth short (F8 already asks for the book-priced mean above 0).
5. **X1 was refused by 0.494 bps** (+49.506 against the +50 floor, t 2.81, a seeded try through LATE). The rule is the rule and
   X1 is not recorded as adopted; had the mean been +50.0 or more, N would have been B0 + W4 + X1 and the second C
   evaluation, W4 alone, would have been the fallback. *Recommendation:* say it beside N so the owner knows how close it was.

**Minor.**
6. **The size print for N** (3.3): at $10,000 the entry costs +31 bps on E against a mean of +94.7; the exit costs the same
   again; at $50,000 the entry alone is +83. The edge on E does not survive $50,000. *Recommendation:* keep the size print in
   the owner's page, B0's beside N's.
7. **The calibration's set** is the look's WAVE-H set only (729 positions, Aug–Dec 2025), as the program has it. The plan says
   "slice 0's positions with t in E": the look's file also holds 274 SIZING-set lines in E (June–July; 267 priced at the book at
   both ends, b +1.52 ± 1.06, n 232); with both sets b is +3.19 ± 2.02 (n 907). Neither is near +10. *Recommendation:* state in
   the architecture that the set is the WAVE-H lines.
8. **The event-level tie-break.** B0 on E: −14.208 in the report, −14.146 from mine; ordering the earliest position of an episode
   by (t, slice) instead of the fill's order reproduces the report to the digit. N's lines and B0 on C are equal either way.
9. **The walks' "extra over $1,000"** is the ratio of walk prices (E: +11.96 at $10,000), not the difference of the costs
   (+12.77); the report does not say so.
10. **F2's footprint is printed as `true` only.** C's 47 windows have at least 25 days and 35 coins against 20 and 10.
11. **Not recomputed:** 14 tries' own features (W5, R1–R4, C1–C3, N2, N3, N7, N8, N9, N11), the signal meter and the error-rate
    arithmetic beyond the check above, the run's seconds and peaks.

## 6. What I could not do, and what is left

- My placebo is my own draw order. Its all-slice version matches the report's windows and sd and its tails within sampling
  noise; I cannot say the draws are the report's.
- The 14 tries listed in finding 11 need their features rebuilt (W5 and N2 from the minute notional, R1–R4 from the minute
  prices, C1–C3 from monthly ranks, N3 from funding, N7, N8 from contexts, N9 from `markPx`, N11 from five-minute returns).
  None is near the bar in the report; their agreement is untested.
- The 2.81 at K = 10 rests on 10,000 draws a window and a 200,000-draw check at 100 days.
- Nothing was run on FRESH or on C beyond B0 and N, and nothing was changed in the repository but this file.

## 7. Questions, each with a recommendation

1. **K: 10 or 20?** Recommendation: **K = 20** if the owner wants the error the rule promised; the books cost about 0.7 GB more.
   Otherwise freeze K = 10 and say the error to expect is about 90 (100 days), not 78.
2. **z at K = 10:** freeze **2.81** (placebo 99.75th 2.36–2.40 by episode, 2.58–2.63 by day, both below it).
3. **Print OWN and the concentration beside the exam's verdict** (the market's part of the gross; the top 2 days' share; the event
   level). Recommendation: yes, deciding nothing.
4. **Should HOLDS also need a market-adjusted excess?** That would change a frozen rule (the coin's 4-hour BASE of H10, read by H12's HOLDS). Recommendation: no
   change to the rule; the owner decides at the talk whether a result carried by the market's rebound after cascades is the
   result he wants "HOLDS" to mean.
5. **LIKELY's z:** my placebo at K = 10 gives 1.71–1.87 (97.5th) and 1.92–2.10 (98.75th) at 100 days; the normal 1.96 and
   2.24 bind. Recommendation: z = max(normal, placebo) as for HOLDS.
6. **The depth-short split** (finding 4): print by price source and by short in the exam. Recommendation: yes.
7. **The report's questions 1–4:** 1 settled above (z 2.81, projection 4.8% / 7.0% at slices 0–9's errors, about 3.4% / 5.9% on
   a typical block); 2 and 3 done in 3.3 and 3.4; 4 yes, with OWN beside it. Question 5 (MARKET-1's second arm) is the owner's.
