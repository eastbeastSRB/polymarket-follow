# WAVE-POLISH-PLAN-REVIEW — the fresh review of the polishing plan, before anything is built on it

WAVE-POLISH-PLAN-REVIEW (Sonnet 5.5, max; the plan's planner was Opus), 2026-11-17
20:59Z – 21:46Z (UTC; every stamp from `date -u`; the last is in `progress.md`), for
polymarket-follow's supervisor. The plan under review is
`docs/reviews/wave-polish-plan-2026-11-17.md` (`cdaf9f5`); the model of this review is
`docs/reviews/wave-h-plan-review-2026-11-14.md`. Evidence: the supervisor folder
`workers/WAVE-POLISH-PLAN-REVIEW/` (`progress.md`, `scripts/`, `out/`; names below are
relative to it). **A review decides nothing:** the supervisor and the owner answer; the plan
was not edited.

*Holds and does not hold are verdicts on a test, never instructions to trade.*

**Conduct.**
- *Read:* the plan whole; the planner's folder (`brief.md`, `progress.md`, `scripts/power.cjs`,
  `out/`; not its transcript);
  `CLAUDE.md`, code-rules, current-task; decisions from 2026-11-17 down to the WAVE-H freeze;
  `waveh/rules.md` whole; the look's report and Final review; MARKET-FIND's tables and the
  window text of WAVE-ELSEWHERE; MARKET-1's M12; the kit's `cr1Test`; WAVE-H-LOOK-REVIEW's
  `pass1.cjs`, `scan.cjs` and `out/pass1-progress.log`; external-apis' archive section.
- *Computed:* synthetic data only (a generator of my own, `scripts/simlib.cjs`), and
  arithmetic. **No candidate's return on real data, no read of any store.**
- *Never opened:* FRESH's store (not even a listing), WAVE-H's store and `look\`, any frozen
  file for writing, the collector's recordings and database, the run folder, the paper
  experiment's and MARKET-1's data. No network call, no fetch, no `dist/waveh.js`, no agent.
- *Read-only machine facts:* disk types, free space and cores (PowerShell `Get-PhysicalDisk`,
  `Get-Volume`, `Get-CimInstance`).
- Written in the repository: this file only. polymarket-lab not touched.

## For the owner, in one page

**Verdict: approve after these changes.** The plan is honest about what it can and cannot
prove, and the search is protected where it needs to be. Five changes make it safe to build on.
All are text or gates; none touches the design you approved on 2026-11-17.

**What is right, with the evidence.**
1. **The choice rule's arithmetic is correct.** 0.62% a try × 38 = 23.6%; × 15.9% = 3.7%;
   Bonferroni's 3.01; the 69%, 84% and 58% of a real change; every line of the power table.
   I recomputed all of them. On synthetic data with no real effect anywhere, a useless change
   reached FRESH 2.4–2.6% of the time (the plan says at most 3.7%).
2. **The exam decides alone.** FRESH is unseen and one rule is tested once, so the search cannot raise
   the false-HOLDS rate. I found **no feature in the 38 tries or the 11 fixed features
   that needs information after its own decision instant** (the table in section 4).
3. **The discovery window is cut correctly and enough.** 92 + 8 = 100 clean days; the 68
   days of 2026-08-31 → 11-06 are out; the days next to MARKET-1's live start are labelled.
4. **The power table is the right order of size.** In a simulated world calibrated to your published
   error (31 at 298 days), a +100 effect is confirmed on 100 clean days 41% of the time (the
   plan says 23%); +200 is confirmed 84% (the plan says 87%). It is a good first estimate.
5. **The extraction is credible.** Its gates reuse counts two independent programs agree on;
   its sizes and its time follow from the review's own log (218 GB read in 24.8 minutes).

**What to change.**
1. **Measure the exam's size before the freeze (F1).** The plan's z of 2.58 and 2.81 assumes
   the error is honest. In my simulated worlds it is: 0.46% false passes at 2.58 when shocks
   are plain; **but 1.28% (and 0.75% at 2.81) when the big cascades also sit on the volatile
   days**, as liquidations do. Two looks could then carry about 1% of false passes (0.75% at the first look, 0.3% at the
   second, in my runs), double the plan's 0.5%. One cheap gate on the 10 months (a placebo)
   tells the true size, and z is set from it.
2. **Close the check part's gate (F2).** The second test of a chosen change (the check months,
   t ≥ 1.0) is easy to pass for any narrower rule when B0 happens to do badly on those months,
   and the "+50 net" floors are applied to single changes on the explore months only. The
   nominee must meet the floors on the check months too.
3. **Name the memory ceilings and plan for one hard disk (F3).** The plan's figures (under
   1.5 GB a worker, under 2 GB an exploration) are estimates; your rule says never to size a
   ceiling from an estimate. F: is a single 2 TB spinning disk, so the pass, its 16 GB of hour
   files and the merge share one spindle.
4. **List FRESH's one absent day, the price-source mix and the books (F7, F8, F19).**
   2026-07-08 has no day file and no books and sits among the deciding days; tape-priced
   positions looked 3 times better than book-priced ones in WAVE-H (+197 against +62). The
   pooled line should also need the book-priced positions' mean above zero. And the 147-slice
   line costs up to 50 GB of books to save about 2% of error against 20 slices: let a count
   from the exploration choose K.
5. **Tidy the tries (F4–F6, F15).** Define the nine families the plan never defines; drop H48
   and D5 and make the stop a print; add a gain floor so a near-copy of B0 cannot win on a
   tiny error; say which tries the look seeded.

**Could the exam pass for a reason other than a real edge?** Not by a hidden route: no
candidate's outcome reaches the exam, and the search cannot raise the false-HOLDS rate. Three
honest ways remain, each fixed above: the error being too small (F1), the tape's price being
better than the book's (F8), and the days that carry the discovery (F12, already mostly
handled). **Could it fail for a reason other than the effect?** Yes, to WITHHELD, if FRESH's
holes add up past 10%: F7 budgets for it.

**Questions for you** (each with my recommendation; section 10): z set by the placebo gate (yes);
confirm that the beta months stay in (yes, printed apart); the book-only sign condition (yes);
the deciding line's slice count by a count, 20 on the plan's model (yes); the memory ceilings
(yes); δ for short holds (keep).

## Findings, by severity

| # | Sev. | Plan § | Finding | Change |
|---|---|---|---|---|
| F1 | Major | 2.2, 3.2, 3.3, 3.5 | The exam's size is assumed. Synthetic false passes: 0.46% / 0.63% / **1.28%** at z 2.58 and 0.20% / 0.27% / **0.75%** at 2.81 | A placebo gate on E+C sets z before the freeze (floor 2.58 / 2.81); observed window errors replace √(300/D) |
| F2 | Major | 1.4, 2.1 step 4 | The C gate (t ≥ 1.0) is easy for narrow changes when B0's mean is low; the floors cover single changes on E only | N must meet the floors on C and show its exam footprint |
| F3 | Major | 4.4, 7 (12) | Memory and time are estimates; F: is one HDD | Named ceilings, peak logging, merge by month, one HDD plan |
| F4 | Mod. | 1.4, 2.1 | SE_D ignores that k is estimated: near-copies of B0 over-pass (1.1–5.4% a try against 0.62%) | A gain floor; drop D5 |
| F5 | Mod. | 2.1 step 3 | "Family" is never defined | Name the nine; state the nominee is untested on E |
| F6 | Mod. | 1.5, 2.2 | The leads are more than S1, W2 and the delays; the 3.7% covers only the tries the look did not seed | List every seeded try; report the 3.7% for the rest |
| F7 | Mod. | 3.4 | 2026-07-08's day file and books are absent and not listed; the thin files reach the 8 days of segment 2 and look 2 | List it at the freeze; budget WITHHELD; pre-state the fallback |
| F8 | Mod. | 3.2, 3.3 | The deciding line mixes book and tape prices; WAVE-H: tape +197.4, book +61.8; 7 days of segment 1 have no books | HOLDS also needs the book-priced mean above 0; print each segment |
| F9 | Mod. | 4.5 | The 12 GB tape is gated only through 307 legs | A completeness gate against `asset_ctxs` and a full parse of sample days |
| F10 | Mod. | 1.2–1.4 | Four timing conventions are open (none is a leak) | Pin them |
| F11 | Mod. | 3.3 | The excess needs a BASE for the rule's hold; only 24 h exists | Define BASE for 1–12 h holds and the X exits |
| F12 | Mod. | 3.1 | The beta months stay in the deciding days; WAVE-ELSEWHERE called Polymarket's months "not independent" | Disclosed; ask for the owner's separate yes; print the segments apart |
| F13 | Mod. | 2.3 | "The projection from C is free of the choice": N passed t_C ≥ 1.0 | Project from C minus one error, and say so |
| F14 | Mod. | 3.6 | Two looks: no rule for which verdict stands | "The first look that is not NOT SETTLED decides" |
| F19 | Mod. | 3.2, 7 (10) | The 147-slice line needs up to 50 GB of books (506 MB a day × 100 days, about 7 hours at 2 MB/s); the 20-slice fallback is a conditional that must be frozen, and the plan's own model puts 20 slices within 2% of all | Decide K by a count on E+C (the smallest K within 3% of K = 147); freeze K, or the trigger and the slice set |
| F15 | Minor | 1.2 | H48 cannot win and is mis-sized; X2 is a try the plan expects to lose | Drop H48; the stop becomes a print |
| F16 | Minor | 1.2 (1) | S1 is tagged "Both"; Polymarket's sides ran the other way (buys +413, sells +274) | Say so beside S1 |
| F17 | Minor | 1.5, 3.2 | Sizing and overlap need an event-level mean; the coin's own part is not printed | Print one position per coin-episode and MARKET-1's OWN line |
| F18 | Minor | 1.4, 4.2 | One pass for all tries' legs on a HDD; the Zod check adds about 10 minutes | Say so in the build brief |

## 1. Detail: the exam's size (F1)

**What the plan says.** 2.2: the exam's false-HOLDS rate "does not depend on the search at
all"; 3.3 and 3.6: z 2.58 once, or 2.81 at each of two looks (1% in all, split by Bonferroni).
That is true of the *search*. It leaves one assumption: that the two-way error (day, coin,
(day, coin) clusters, the kit's CR1, the max form) is honest on 100 days of pooled positions.

**What I tested** (`scripts/simlib.cjs`, `sim-null-t.cjs`, `sim-blocks.cjs`; all synthetic).
- *The generator.* 35 coins; hourly returns are a market factor plus an own shock, both
  Student-t (3 degrees of freedom); a daily volatility level (log-normal, AR(1)); episodes a
  day ∝ volatility squared; each episode holds w positions that share one outcome (as the
  pooled slices' entries do), w log-normal and larger on volatile days; 80% forced sells; the
  side is independent of the future (no edge). The scale is set so that B0's median two-way
  error over 298 days is 31.4 (published: 31.3).
- *Result,* 10,000 windows of 100 days each, no edge, statistic m ÷ SE as the plan defines it:

| World | P(t > 2.58) | P(t > 2.81) | z for 0.5% | z for 0.25% | sd of t |
|---|---|---|---|---|---|
| Plain (normal shocks, volatility flat) | 0.46% | 0.20% | 2.55 | 2.79 | 1.03 |
| Heavy tails, volatility flat | 0.63% | 0.27% | 2.64 | 2.82 | 1.05 |
| Heavy tails, cascade size tied to volatility | **1.28%** | **0.75%** | 2.94 | 3.17 | 1.18 |
| The plan's nominal | 0.50% | 0.25% | | | 1.00 |

- *Why, most likely.* When the big cascades (many slices enter, so a big weight) fall on the
  volatile days (a big return), a few clusters carry the mean and the cluster error of those
  few is biased low. It is the well-known few-clusters case, here with 35 coins. A Student t on 34 degrees of
  freedom already asks 2.73 and 3.00 instead of 2.58 and 2.81 (the kit's `tCritical`).
- *Neighbouring days.* A 24-hour hold shares 1/6 of its window with the next day's entries; a
  48-hour hold shares half. With flat volatility the day clusters undersize the 24-hour hold
  slightly (0.55–0.85% at 2.58) and the 48-hour hold clearly (1.5%; 3-day blocks bring it to
  0.85–1.05%). WAVE-ELSEWHERE noted this and chose 2.58 for it. It is another reason to measure.

**The change.** In the exploration, before the freeze, **a placebo gate on real data**, no
candidate's outcome in it (code-rules: "at least 1,000 draws"):
- B0's pooled positions on E+C with every episode's side flipped at random (the mean is zero by
  construction, the clusters and weights are the real ones), and the B2 control (WAVE-H's
  no-wave episodes: −6.3 ± 17.9), on random windows of 100 days and of 182 days;
- the share of windows with m > z·SE at 2.58 and 2.81, the sd of t, and the **observed**
  window errors (they replace the √(300 ÷ D) of `power.cjs`);
- **z for the exam is the larger of 2.58 (2.81 for two looks) and the placebo's 99.5th
  (99.75th) percentile**, with Student's t on G − 1 degrees of freedom (2.73 and 3.00 at 34)
  printed as a reference, not a floor: in my plain world the normal values are right and a t
  floor would only cost power. Write the chosen z in `polish/rules.md`. Your answer 4 ("z as
  WAVE-H's") stays as the floor.

## 2. Detail: the choice rule (F2, F4, F5, F6, F13)

**Recomputed, as claimed.** P(t ≥ 2.5) = 0.621%; × 38 = 23.6%; × P(t ≥ 1.0) = 15.87% gives
3.74%. Bonferroni at 5% over 38: z = 3.005. A real change of 3 and 2 errors: Φ(0.5) = 69.1%,
Φ(1.0) = 84.1%, together 58.2%.

**The D-test on synthetic data** (`scripts/sim-dtest.cjs`; E = 212 days, C = 146; the plan's
shapes: side, delays, holds, filters at episode, position, day, coin-month, hour and weekday
level; every change uninformative; k from E as the plan says; 3,000 replications each):

| B0's true mean | Tries | A try passes E (mean) | Any passes E | **Reaches FRESH** (E then C ≥ 1.0) |
|---|---|---|---|---|
| 0, heavy tails | 35 | 0.56% | 14.3% | **2.5%** |
| 0, normal shocks | 35 | 0.49% | 13.2% | **2.6%** |
| 0, no short holds or exits | 28 | 0.53% | 11.8% | **2.4%** |
| +40, the plan's floors on E | 28 | 0.35% | 5.7% | 1.1% |
| +60, the plan's floors on E | 33 | 0.43% | 8.6% | 2.7% |
| **+100**, the plan's floors on E | 33 | 0.91% | 17.5% | **8.1%** |
| −40 (a bad C), no floors | 28 | 2.0% | 35.8% | **13.9%** |

(The 33-try rows leave out the two exits, which in my generator are not uninformative; the
28-try rows also leave out the five short holds, which are better than a negative B0 for real.
The floors are the plan's +50 net, 40 days and 15 coins on E.)

- **The plan's 3.7% holds** while B0's mean is at most about +60 (2.4–2.7%). The union bound
  (23.6%) is conservative because the tries are correlated; the D-test's t has mean about 0
  and sd 0.96–1.10 in the null worlds. `At most 3.7%` is a good headline.
- **F4. It degrades as B0's mean grows.** D = m_V − k·m_B0 with k = SE_V ÷ SE_B0, and SE_D
  treats k as known. A near-copy of B0 (a delay of 5, 15 or 60 minutes; a random position
  subset such as W1 or N2) has a tiny SE_D, so the noise in k times m_B0 decides its t. At +100
  the sd of t is 1.25–1.5 and D5, D15, D60, W1 and N2 pass E at 1.7–5.4% each (nominal 0.62%).
  **Change:** a gain floor beside t ≥ 2.5, **D ≥ max(+10 bps, 10% of |m_B0|)** (a real change
  clears it by a wide margin; a near-copy cannot), and drop D5 (D0, D15, D60 remain).
- **F2. The C gate depends on B0's level on C.** With B0's mean on C near zero or negative,
  `k · m_B0` is a credit: a narrower rule passes t ≥ 1.0 with no merit (the −40 row; on E the
  +50 floor would stop it, but the plan has no floor on C). **Change:** N must also show, on C,
  mean net ≥ +25 (half your line: a point estimate on 146 days has an error near 45, so the
  full +50 would turn away half the real, modest changes), ≥ 30 days and ≥ 15 coins, and a
  projected deciding footprint that meets TOO FEW's 20 days and 10 coins with margin (the plan
  checks days and coins only for single changes on E). Print the D-test on C with C's own k
  beside. B0, the fallback, is exempt from the floors (its E and C means are the first numbers
  printed; say so).
- **The cap of three families.** Under no effect, two or more changes pass E in 1.9–3.2% of
  my replications, so a combination of useless changes is a 1% event and the cap costs the
  3.7% nothing. Its real job is the footprint: three narrow filters can leave a rule that the
  exam's error (or TOO FEW) sinks, which is why F2 asks for the footprint.
- **F5. "Family" is never defined** (lines 93, 345). Name them, one level each: **S** (S1);
  **D** (delays); **H** (holds); **W** (wave size: W1–W5); **R** (market before: R1–R4);
  **C** (coins: C1–C3); **T** (T1, T2); **X** (exits); **N** (the new features). The
  nominee is a combination that is never tested on E ("printed, tests nothing"); say that its
  only test is C. Allow the fallback to one change (the largest t), not three, to keep the
  count of C evaluations at two.
- **F6. The leads are more than three.** The look printed all 10 months, E and C included, so
  for S1, W2 and the delays neither part is clean (the plan says so, 1.5). Also seeded by the
  look's prints: the **R family** (your crash and consolidation reading of its month table and
  worst day) and the **hold family** (from LATE). T1, R1 and C1 come from MARKET-FIND's
  Polymarket window, outside E and C. **Change:** mark each try seeded or not in the try log; state the
  3.7% for the unseeded tries only. For the seeded ones FRESH is the only clean test, as the
  plan says, and a wasted exam is the cost, never a false HOLDS.
- **F13. The projection.** "N's C estimate is free of the choice" (2.3 item 2): N was chosen
  only if t_C ≥ 1.0, so C is truncated below. Project the exam from **C minus one error**, and
  print the untruncated C estimate beside.

## 3. Detail: the exam's line, price sources, FRESH's holes (F7, F8, F11, F12, F14)

- **F8. Book and tape.** WAVE-H: 197 positions with a tape leg averaged **+197.4 ± 124.9**, the
  1,092 at the book at both ends **+61.8 ± 42.9**; the tape legs sit on hole days (the archive's
  books are missing on 2025-10-16 → 22 and 11-17 → 25) and on stale snapshots, so the gap may be
  the days and not the price. The plan prints them apart and decides on the mix. On FRESH, 07-08
  and 07-12 → 17 have no books: **7 of segment 1's 92 days**; with the positions that exit on
  them, 9 entry days of the 100 have a tape leg at least. **Change:** HOLDS also needs the mean over
  positions with both legs at the book to be above 0 (a sign condition, like the excess, no
  confidence band); both segments and both price sources are printed apart. The plan's
  calibration (slice 0's held book legs repriced at the tape) is the gate: if the tape beats the
  book on the same legs by more than 10 bps a position, the explore numbers are re-based by it
  before the D-tests, and you are told.
- **F7. The holes.** (a) **`asset_ctxs` for 2026-07-08 does not exist** (decisions: "170, 2026-07-08
  absent"; external-apis: "No file for 2026-07-08"), and the day has no books. Plan 3.4 lists
  the thin days and does not list this one. A 24-hour position over that day has up to 24
  funding settlements to price; in a thin coin the "last trade within 5 minutes" fallback fails
  on some, and the position is unpriced. About 2 days of 100 (07-07 and 07-08 entries). (b) The
  thin files from 09-22 reach **11-07 → 11-14**, the 8 days of segment 2, and probably every
  day of look 2. **Change:** list both at the freeze; state the expected left-out share (about
  2% for 07-08) so WITHHELD's 10% is not a surprise; add to 1.4 "no mark and no trade within 5
  minutes: unpriced, counted"; and print segment 2 apart from segment 1.
- **F19. The books, and how many slices.** The size claim is right as a ceiling: the 38 coins'
  books are about 506 MB a day (WAVE-H plan, from the archive's sizes), so 100 days is at most
  50.6 GB, about 7 hours of transfer at 2 MB/s (more with the pause windows). Two things follow.
  (a) That ceiling is *below* the plan's 60 GB trigger, so the 20-slice fallback can fire only if
  FRESH's book files are larger than TEST's (its fills are 1.5 times busier a day); the listing
  at step 1 gives their sizes, which is after the freeze. The fallback must therefore be frozen
  as a conditional (trigger: the listed bytes of the keys needed; slice set: 0–19), not decided
  later. (b) The plan's own model puts 20 slices at 31.8 against 31.3 for all 147, and a
  cascade of n accounts gives about n²/294 entries, so 20 slices should touch far fewer coin-hours than
  147 (the exploration's footprint print will show it): most of the 50 GB and most of the 118,000 book walks buy about 2% of error. **Change:**
  the exploration's K print (1, 5, 10, 20, 50, 147; the plan has it) decides K by a count:
  the smallest K whose error on E+C is within 3% of K = 147 is the deciding line, frozen as K
  with slices 0 to K − 1; all 147 are printed beside. No outcome enters the choice.
- **F11. BASE for the rule's hold.** H10's BASE is the coin's mean 24-hour move in a 4-hour
  block. For a 1, 2, 4, 8 or 12 hour hold, or X1 and X2 (exits at no fixed time), "the excess
  over each coin's 4-hour BASE" has no defined horizon. Define it (the mean move over the same
  hold, from the same blocks) or, for exits, over the position's own realised hold.
- **F12. The beta months.** WAVE-ELSEWHERE kept "Polymarket's own months (2026-05-28 to
  2026-11-07)" out of the deciding days and printed them apart "as a second reading that is not
  independent". The plan cuts only the 68
  discovery days and keeps 05-30 → 08-29 (92 of the 100 deciding days), because
  MARKET-FIND looked at those Polymarket weeks once, with the rule fixed (22 entries, +129.8 ±
  213.7), and shaped nothing. That is a sound reason, and it is a **change from an earlier rule of
  yours**. Your answer 2 covered the window; ask separately whether the beta months stay.
  Print segment 1 (92 days) and segment 2 (8 days) apart.
- **F14. Two looks.** Write MARKET-1's rule (its M11) into `polish/rules.md`: "the first look that
  is not NOT SETTLED is the verdict; a later look prints beside it". MARKET-1's looks fall on
  2026-12-19, 2027-02-06 and 2027-05-08, so its first outcome is read before the exam's look 2
  (about 2027-02-08), over days that share the calendar. The rule is frozen, so no rule moves,
  and the two verdicts are never combined; say it.

## 4. Leakage and look-ahead, try by try

I found **no try or feature that uses information from after its own decision instant.**
Four conventions need pinning (F10); none is a leak by the text.

| Try or feature | What it reads, and until when | Result |
|---|---|---|
| S1; the delays; the holds; W1; W2; W3; T1; T2; N1; N6 | the wave's own fills up to t; the clock | fine. D0 (t + 10 s) is real: a fill is visible 0.11–0.14 s after its block |
| W4; W5; N5; N9; N10 | venue-wide liquidations and traded notional up to t, "the 60 minutes" | fine; "up to t" is closed at both ends (H1) |
| R1–R4; N11; X1's reference | basket, BTC, realised volatility: minute prices up to t | fine **if "the price at τ" is the last minute end ≤ τ** (F10) |
| C1–C3 | traded notional, impact spread, open interest over 30 days before the month | fine; C1's text says "30 days before" without "the month": pin |
| N2 | the entry fill's notional ÷ a 7-day mean | fine |
| N3 | the last settled funding stamped ≤ t (17–69 ms after the hour) and its 30-day percentile | fine |
| **N4** | "by x_in the price has already won back half" | fine only if the price is the last minute end ≤ x_in, never the minute containing x_in (up to 60 s ahead) |
| X1, X2 | a minute end's price; the leg at the next minute's start | fine |
| N7, N8 | open interest, premium | print only |
| The E medians and percentiles | features only, frozen before any outcome | fine; for R2 and R3 they lean on a few crash days of E |
| BASE | the deciding days' own future 24-hour moves, as H10 | a drift control, not a candidate; same as WAVE-H |
| M5's same-millisecond clause | counts a fill that sorts after the entry's | moves 23 of 1,299 positions in WAVE-H; harmless at a 10-second delay or more |

**The four conventions (F10).** (1) "The price at τ" is the mark at the end of the last whole
minute ending at or before τ, then the last trade within 5 minutes before that; (2) "up to t"
is [t − 3,600,000, t], both ends in (H1); (3) every monthly rank and percentile uses days
before the month's first day; (4) no feature reads a record stamped after its own decision
instant, and the instant is written for each try (t for the wave's features, x_in for N4, a
minute end for X1 and X2).

## 5. The discovery window and the other overlaps

| Overlap | Where | Right and enough? |
|---|---|---|
| MARKET-FIND's discovery weeks, 2026-08-31 → 11-06 (68 days; its store was blind from 11-07) | inside FRESH | **Yes, cut by position:** t ≥ 11-07 and x_out < 11-16; x_out < 08-31. Three quarters of the wave's move back is the basket's, so Hyperliquid's waves on those days would ride the same moves |
| Polymarket's beta months, 2026-05-28 → 08-30 | inside FRESH, kept | F12: a sound reason, a change from WAVE-ELSEWHERE's rule: ask separately |
| MARKET-1's live days from 2026-11-11 | FRESH's last 4 clean days (11-11 → 14) and look 2 | Calendar only; sealed to its first look. F14 |
| R8's six weeks, STRATEGY-REVIEW's lead | inside the discovery window | covered by the cut |
| WAVE-H's 10 months | E and C: the practice ground | Not clean for the look's leads (F6); every part's positions close inside it |
| DATA END 2026-05-29 01:00Z and FRESH's first file 02h | the boundary | no overlap: deciding days start 05-30; look-backs reach into the 10 months' store as features only |
| The paper experiment and the collector | Polymarket only | none |

## 6. The extraction (F3, F9, F18)

**What holds.** The gates are right and equal the review's: records by file-day 2,658,921,516
in 370 days; counted fills 2,421,070 (SIZING 425,433 + TEST 1,995,637; 40 own fills from DATA
END unused); liquidation objects 10,763,982; mark rows 17,618,289 (4,241 off the minute, 3,118
twice, 48,300 from DATA END on); funding rows 292,878; 1,299, 290 and 176,986 positions; 1,289
prices. Table sizes follow from the counts (479 M tape rows × 26 B = 12.4 GB; `liq` about 1
GB; `minute` 40 × 532,800). The pass's CPU: the review's pass ran at 750 MB/s decoded on 6
workers (24.8 minutes); the plan adds a coin-first scan (3.9 ms a MB), a parse of the 29% of
bytes it keeps (1.7 ms a MB) and Zod; by my sum that is about 13.6 ms a MB a core, 440 MB/s
decoded on 6 workers, 42 minutes for 1.1 TB. "40–60 minutes" is right; the disk is not the
limit until the writes start.

**F3. The machine.** 31.9 GB RAM, 8 cores and 16 threads, **F: is a single WDC WD20PURZ hard
disk** (the pass's 146.6 MB/s is its sequential speed); E: (19 GB free) and C: (30 GB free) are
SSDs. The pass reads 218 GB from F:, and its hour files (about 16 GB), the merge's reads and
its 16 GB of final columns are on the same spindle; random reads cost about 10 ms.
- **Ceilings, from your standing rule** (WAVE-H's step 1 died at 8 GB, then ran at 16 GB with a
  9.3 GB peak, and step 2 at 20 GB with about 17 GB in use): extraction main process
  `--max-old-space-size=16384`, each worker `resourceLimits.maxOldGenerationSizeMb` 4096 (the
  flag applies, but name it); exploration 16 GB; exam 20 GB. Typed arrays are off-heap, so also
  watch the process's total size: log `process.memoryUsage()` every 100 files and write the
  run's peak into the manifest. The plan's "under 1.5 GB a worker" is an estimate and must not
  be a ceiling.
- **The merge by month, all coins at once** (about 1–2 GB of tape a month in memory), not by
  coin and month (456 partitions × 720 hour files of seeks).
- **Measure first:** one day's pass with the writes on, to read the real MB/s before the 8,845
  files; the hour files stay on F: (they do not fit E: with margin, and C: is the system disk).
- **The exploration** should price every try's legs in one sweep of each coin-month of the
  tape, not 35 sweeps (12.4 GB at 150 MB/s is 85 s a sweep).

**F9. The tape's gate.** The tape (12.4 GB, the base of every candidate's price) reaches the
gates only through 307 tape legs. Add: (a) per coin and day, the tape's taker notional against
`asset_ctxs` `day_ntl_vlm` at the next midnight (if the field is the rolling 24-hour notional,
to be seen on the sample first), within 1%, on every day of the 10 months; (b) row counts by
(coin, day) against a full parse of 12 sample days, among them 2025-10-10 and its 2.1 GB 21h
file (4.93 M records), as the review did for its scanner.

**F18.** Each kept record is Zod-parsed (Iron Rule 3): about 500 M records at a few µs each is
about 8–10 minutes on 6 workers; say so in the build brief. `tid` as u64 and the (user, tid)
dedup over the hour both formats share are right.

## 7. Power (recomputed) and the synthetic comparison

`power.cjs` is correct: SE(D) = 31.3 × √(300 ÷ D); bar = max(z·SE, 50 − z·SE); 80% point =
bar + 0.8416·SE. I recomputed every line (170 days 41.6 / +107 / +142; 100 days 54.2 / +140 /
+185; 182 days 40.2 / +113 / +147 and +104 / +137 at z 2.58; slice 0 71.4 / +184; the short
hold 26.0 / +67 / +89). My synthetic worlds (same calibration) give, for P(HOLDS):

| True mean | 100 d, z 2.58 | look 1, z 2.81 | look 2 (182 d), z 2.81 |
|---|---|---|---|
| +50 | 11% (plan 5%) | 8% (3%) | 11% (6%) |
| +100 | 41% (23%) | 35% (17%) | 48% (37%) |
| +150 | 68% (57%) | 62% (48%) | 75% (82%) |
| +200 | 84% (87%) | 80% (81%) | 88% (98%) |

The median error at 100 days in that world is 45.6 (plan 54.2): the √ scaling is cautious for a
typical error. The self-normalised statistic has sd above 1, which costs power at large
effects. **The plan's table is within about ±15–20 points either way; the observed window
errors of F1 settle it.** Short holds are as the plan says the strongest lever (a precise rule
needs an effect near 67–89, not 140–185).

## 8. Coverage of the owner's points

| Point | Where in the plan | Verdict |
|---|---|---|
| The seven leads | S1, D0–D60, W1, W2, W3, the hold family, pricing | covered; F6 on which are clean |
| Crash against consolidation | R1–R4 | covered; R2 and R3 lean on few crash days of E (10-10 and a handful), so their C check has little to see: say it |
| Sessions | T1, T2 | two tries only; fine for the multiplicity budget |
| Sizing and overlap | prints: the tail, most open, $10,000 and $50,000 walks | prints only. The pooled line counts every slice's copy of one event (about n²/294 entries for n liquidated accounts), so its mean is cascade-size weighted; **print the event-level mean** (F17) and MARKET-1's OWN line |
| Exits | X1, X2 | X1 has a mechanism; X2 is expected to lose: make it a print |
| The search for new patterns | N1–N11 | covered, one cut each, honest |
| Growth to the analyzer and PAPER-H | 4.4 | covered; `fills` is one more writer; DuckDB later |

## 9. What I would cut, and ideas beyond the brief

**Cut:** H48 (twice the error, so it cannot win on the plan's own criterion, and the day
clusters undersize it: 2.4–2.7% false passes at 2.58 against 1.1–1.5% for 24 hours); D5 (a
near-copy of D0 and D15); X2 as a try (a print); the signal meter's shrinkage formula (the
variance of 36 correlated t's is not a clean statistic; keep the plain list). That leaves 35
tries, 33 adoptable.

**Beyond the brief** (unasked):
1. *A hedged variant.* Three quarters of the move back is the basket's; MARKET-1's OWN line is
   +74.9 ± 48.7 of +310. A position against the forced side and short the basket removes the
   market's noise and keeps the coin's part. One try, tagged HL: it tells whether the edge is
   "the market rebounds after waves" or "this coin does".
2. *A sign-flip randomisation as the exam's second statistic.* The same placebo as F1, on the
   exam's days, is a distribution-free p-value that does not lean on the cluster formula. HOLDS
   would need both. It costs one function the gate already needs.
3. *M drifts with activity.* FRESH is about 1.5 times busier (0.94 GB of fills a day against
   0.61); WAVE-H's own M by month ran 87–351. The pooled line is exposed to it; printing the
   entries a slice a day by month (risk 9) is right, and W4 and W5 are the form that does not
   drift.

## 10. Questions for the owner, each with a recommendation

1. **Set the exam's z from the placebo gate**, never below 2.58 (one look) or 2.81 (two)? *Yes.*
   It costs one print and can only make the exam's "HOLDS" more believable.
2. **Do the beta months (2026-05-30 → 08-29) stay among the deciding days?** *Yes, printed
   apart.* They are 92 of the 100 days; cutting them leaves 8.
3. **HOLDS also needs the book-priced positions' mean above 0?** *Yes.* A sign condition, no
   band.
4. **The memory ceilings** (extraction 16 GB main and 4 GB a worker; exploration 16 GB; exam 20
   GB)? *Yes.*
5. **The deciding line: K by a count** (the smallest number of slices within 3% of all 147's
   error, 20 on the plan's model), with all 147 printed beside, and the conditional frozen?
   *Yes.* It removes about 40 GB of books and hours of download and walks for 2% of error. You
   answered "every slice, 20 as the fallback above 60 GB"; this changes it, so it is yours.
6. **δ for short holds.** You answered +50 for every hold. A precise short-hold result of +25 ±
   8 is DOES NOT HOLD (the plan's example, 3.3) and a precise +35 ± 10 is HOLDS (my sum). *Keep it; print each
   exam's net per hour held beside the verdict, deciding nothing.*

## 11. Evidence and limits held

`workers/WAVE-POLISH-PLAN-REVIEW/`: `progress.md`; `scripts/` — `simlib.cjs` (generator and the
plan's two-way error), `sim-calib.cjs`, `sim-null-t.cjs`, `sim-blocks.cjs`, `sim-dtest.cjs`,
`sim-power.cjs`; `out/` — `sim-null-t-*.txt`, `sim-blocks-*.txt`, `sim-dtest-*.txt`,
`sim-power-*.txt`. Every number in sections 1, 2 and 7 comes from a saved output there. The
synthetic worlds are mine; they show how the plan's claims move with their assumptions, not
what the real data do. The real answers are the placebo gate (F1) and the exploration's prints.
