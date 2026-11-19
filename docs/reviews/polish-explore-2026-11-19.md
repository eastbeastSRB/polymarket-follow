# POLISH-EXPLORE-REPORT — the polishing's exploration on WAVE-H's 10 months: 35 tries, one change adopted, the recipe going to FRESH

POLISH-EXPLORE-REPORT (Opus 5.5), 2026-11-19, for polymarket-follow's supervisor (UTC; every stamp from `date -u`; worked
20:28Z to 20:44Z). This is "its report", step 6 of the polishing plan (`docs/reviews/wave-polish-plan-2026-11-17.md`, section
6), on the five steps the supervisor ran from main's build `dde2bf1` with the cuts of `eccafa0` (decisions 2026-11-19, "the
exploration's five steps ran"). **A report decides nothing.** POLISH-EXPLORE-REVIEW recomputes steps 2–4 with independent code;
then the owner rules on the nominee.

**Every number comes from a saved output** and is cited by file and field. The outputs are in
`F:\polymarket-follow-research\ANALYZER\WAVE-H\explore\`. `tries.W4.stat.mean` means the field `stat.mean` of the entry of
`e.json`'s `tries` whose `name` is W4. Read only:

| File | SHA-256 | Written (its `written`) |
|---|---|---|
| `features.json` | `6b20873f…d6b04f` | 18:59:08Z |
| `cuts.json` | `2040ded3…4e5c`, byte for byte `apps/poller/polish/cuts.json` | — |
| `e.json` | `82cb2a76…ddf274` | 19:12:34Z |
| `choice.json` | `a8866350…78edf3` | 19:17:51Z |
| `c.json` | `945366a6…336d94` | 19:59:00Z |
| `beside.json` | `daa41f88…3bb4db72` | 20:27:07Z |
| `ANALYZER\WAVE-H\gates\gates.json` | `8aef300d…f697b968` | 17:18:01Z |

Also read: the steps' `.out` files in `ANALYZER\` and the log `ANALYZER\WAVE-H\logs\polish-2026-11-19.log`, lines 488–528 (the
explore frame and the steps). Each output's `identity` names the same store (`19b72688…3c92`), `gates.json` (`8aef300d…`), the
store's and the gates' code (`9272a8c1…c45a`, equal), this program (`8ce269e3…0345`), the look's `step1.json` (`5b3e9e57…`) and
`positions.jsonl.gz` (`7d92d625…`), and M 147. Each step's `inputs` names its predecessors' SHA-256, and each equals the file's own.

**Not used: `ANALYZER\WAVE-H\explore-run1\`.** It holds run 1's features step: `features.json` (`c21f6288…a828b`, code
`9272a8c1…`, written 17:25:16Z) and `cuts.json` (`b219cf68…26898`, the one `853c864` committed). That run's E step then
stopped while writing its positions (exit 1 at 17:40:28Z, "RangeError: Invalid string length"; log line 502;
`step-e-run1.out`) and wrote nothing. I read only those files' hashes, `code` and `written`. The two `cuts.json` differ in their
`features` line only.

**The tables** are presentational, made by `workers\POLISH-EXPLORE-REPORT\scripts\tables.cjs` in the supervisor folder
(SHA-256 `14ff1fd3…`; its output `tables.out.md`, `da09ca1c…`). It prints the outputs' fields rounded (bps to 0.1, z and t to
0.01), a day's date from its epoch ms, a coin's name from `apps/poller/waveh/coins.json`, and two sums, each labelled. It
computes no statistic.

**The limits held.** I never opened FRESH, the collector's recordings, database or run folder, or the paper experiment's or
MARKET-1's data. I evaluated nothing on C beyond `c.json`, and opened no positions file except the field names of
`e-positions.jsonl.gz`'s first line (E; section 9). No `dist` program, fetch, network call or agent. Nothing changed in the
repository but this file.

*Holds and does not hold are verdicts on a test, never instructions to trade.*

## For the owner, in one page

**What was tried.** On the explore months (E: entries 2025-06-01 → 12-29) the base wave was measured first. **B0** is WAVE-H's
wave with all 147 slices pooled. Then 35 changes to it, from the try log, in nine families:
- the side;
- three entry delays and five shorter holds;
- five wave sizes;
- four "market before" filters, three coin filters and two time filters;
- a take-profit exit;
- eleven new features, two of them print only.

Each change was tested against B0 by the D-test, which asks whether it raises the result per unit of error. Every loser is
printed below. The stop-loss X2 was printed only.

**What the numbers support.**
1. **The data were sound before any try.**
   - B0 reproduced WAVE-H's EVERY SLICE line exactly: 176,986 positions, difference 0 (`e.json` `reproduction`).
   - The tape priced like the book: tape − book +3.8 ± 2.6 bps on 675 positions (`e.json` `calibration.stat`), under the
     +10 line, so no net was re-based (`calibration.rebasedBy` 0).
2. **B0 on E made +33.7 ± 39.7 bps a position after costs,** over 135,145 priced positions (`e.json` `b0.stat`).
3. **One change cleared every bar: W4 VENUE** (`e.json` `tries.W4`):
   - t 3.03 (the bar 2.5);
   - a gain of +48.6 bps (the floor +10);
   - a mean of +94.7 ± 54.3 (the floor +50).
4. **It held on the check months,** C (entries 2026-01-01 → 05-26), which no choice had touched (`c.json`
   `evaluations[0]`):
   - **+211.3 ± 122.1** on 16,754 priced positions;
   - t 2.22 against B0 (the bar 1.0), every floor met.

   B0 on C made +41.4 ± 48.4 (`c.json` `b0.stat`).
5. **The exam's error measure is honest on these data.** With each cascade's side flipped at random, the rule's line passed
   2.81 errors in 0.11% of 100-day windows, against a nominal 0.25% (`beside.json` `placebo.rule["100 days"].above281`).
6. **W4 was not suggested by WAVE-H's look** (`tries.W4.seeded` false). A useless change of that kind reaches FRESH at most 1.8%
   of the time (`beside.json` `errorRates.unseeded18.reachFresh`).

**What was adopted, and why: W4 alone** (`choice.json` `adopted`).
- W1 THREE also met every bar (t 2.53, `tries.W1.refused` empty). It is in W4's family, and the plan takes one change a family:
  the largest t.
- X1 TARGET had t 2.81, but its mean, +49.5, is under the +50 floor (`tries.X1.refused`: "the mean floor").
- Of the rest, H12 came closest (t 2.09). The delays, forced sells only and the crash filters made B0 worse (section 3).

**The recipe going to the exam: N = B0 + W4** (`c.json` `goes`, `rule`):
- WAVE-H's wave on the 38 small coins, in each address slice;
- $1,000 against the forced side, in at t + 2 minutes, out 24 hours later, no stop;
- **only when at least 336 different accounts had a counted forced fill on that side, across the 38 coins, in the hour up to
  t** (`cuts.json` `cuts.W4.value`);
- the deciding line pools **K = 10 slices**, 0 to 9 (`beside.json` `K.K`).

| N | n | Mean ± error, bps | z | Days | Coins | Against B0 |
|---|---|---|---|---|---|---|
| **On E** (`choice.json` `N.stat`; tests nothing) | 65,533 | +94.7 ± 54.3 | 1.75 | 99 | 33 | — |
| **On C** (`c.json` `evaluations[0]`) | 16,754 | **+211.3 ± 122.1** | 1.73 | 50 | 35 | D +154.7 ± 69.8, **t 2.22** |

**The exam's z is 2.81** (`beside.json` `examZ`). The placebo's own 99.75th percentile for the rule, 2.57, is below the two-look
floor.

**K = 10** (`beside.json` `K`). Its error on E ∪ C is 49.95, within 3% of all 147 slices' 50.74. The book download it needs for
FRESH's ~100 days is about **2.1 GB** (`footprint.freshGB`).

**The projected chance of HOLDS** (`beside.json` `projection`), at the rule's observed window errors:

| Projected from | Mean used | Look 1 | Look 2 |
|---|---|---|---|
| C, less one error (F13) | +89.1 | **3.6%** | **6.5%** |
| E and C pooled, less one error | +67.7 | 2.1% | 3.4% |

The rule's error on a 100-day window is 88.1 bps (`placebo.rule["100 days"].errors.median`). So look 1 can confirm only a large
effect.

**Where the gain sits — the one point that matters for sizing.** The pooled line counts every slice's entry, so a cascade that
many slices enter weighs more. One position per coin-episode made −3.6 ± 69.2 on E and +67.4 ± 65.1 on C (`beside.json`
`lines.rule.E.eventLevel`, `lines.rule.C.eventLevel`). So the gain came from the cascades that many slices entered.

**Trading at a larger size** (`beside.json` `books.walks`, slice 0's B0 entries, not N's). An entry walked at the book cost
this much against the mid:

| Size | On E | On C |
|---|---|---|
| $1,000 | 5.0 bps | 2.3 bps |
| $10,000 | 17.8 | 3.9 |
| $50,000 | 46.6 | 7.5 |

At $50,000, 71 of 1,045 E books and 33 of 369 C books ran out of depth.

---

## 1. The run

From the log (`polish-2026-11-19.log`) and the `.out` files:

| Step | Started (log) | Done (log) | Exit (`.out`) | Its output |
|---|---|---|---|---|
| explore's frame | 17:21:01Z | 17:21:12Z | `explore.out` 0 | "the store is trusted; no try is defined" |
| features, run 1 | 17:21:21Z | 17:25:16Z | `step-features-run1.out` 0 | `explore-run1\` (not used) |
| e, run 1 | 17:36:52Z | crash 17:40:28Z | `step-e-run1.out` 1 | none |
| **features** | 18:55:14Z | 18:59:08Z | `step-features.out` 0 | `features.json`, `cuts.json` |
| **e** | 19:08:32Z | 19:12:34Z | `step-e.out` 0 | `e.json`, `e-positions.jsonl.gz` |
| **choice** | 19:14:52Z | 19:17:51Z | `step-choice.out` 0 | `choice.json`, `choice-positions.jsonl.gz` |
| **c** | 19:56:58Z | 19:59:00Z | `step-c.out` 0 | `c.json`, `c-positions.jsonl.gz` |
| **beside** | 20:00:18Z | 20:27:07Z | `step-beside.out` 0 | `beside.json` |

- Between run 1 and run 2, EXPLORE-FIX-1 made the positions files stream (`dde2bf1`). The program's fingerprint changed from
  `9272a8c1…` to `8ce269e3…` (log lines 496 and 503).
- The cuts were committed twice:
  - `853c864`, from run 1;
  - `eccafa0`, naming run 2's `features.json`.

  Their nine values are equal: `explore\cuts.json` equals the repository's file byte for byte, and differs from
  `explore-run1\cuts.json` in its `features` line only.
- The store's gates passed (`gates.json` `passed` true):
  - G2's `everySlice` 176,986;
  - its positions' SHA-256 `a5506b86…85e5`;
  - G5's `known`: the three listed records.

## 2. The checks before any try

### 2.1 The reproduction of the look's EVERY SLICE line

`e.json` `reproduction`: `equal` true, `positions` 176,986, `onMarks` 176,986, `difference.mean` 0, `difference.se` 0.
- The reference is `LOOK_EXPECTED`: 176,986 positions, +66.13311166059404 ± 31.30967357566865 (decisions 2026-11-18, "the
  exploration built", POLISH-EXPLORE-2's call 3).
- The step stops with exit 6 on any difference of n, or of m or SE beyond 1e-9 bps.

### 2.2 The calibration: b, and no re-base

`e.json` `calibration` covers slice 0's E positions that the look priced at the book at both ends:
- 729 positions, 54 of them unpriced at the tape;
- **b = +3.761 ± 2.650** over n 675 (`seDay` 2.531, `seMarket` 1.784), on 107 days and 30 coins, z 1.42;
- `rebasedBy` 0.

The rule re-bases every net only when b > +10 bps (decisions 2026-11-18, "POLISH-EXPLORE's plan approved", 10). **No net on E
or C was re-based** (`beside.json` `rebasedBy` 0). C's own b is in 5.10.

### 2.3 The features step

`features.json`:
- `counted` 2,421,070 counted fills, equal to G1's;
- `forced` 5,381,897 forced fills, held to the counted ones (exit 6 otherwise);
- `prices.minutes` 20,193,960 coin-minutes checked equal to legs.ts `minutePrice`, `prices.byTrade` 0 of them priced by the
  trade fallback;
- `b0.entries` 210,992 B0 entries, `b0.E` 148,154 of them in E;
- the dry sweep (`dry`): 1,044,692 legs, 88,166,697 trades, 70,094 legs without a trade, over 224 coin-months (a count of
  `dry.byCoinMonth`'s keys).

**Features unknown at B0's E positions** (`features.<try>.unknown`):

| W5 | R1 | R4 | C1, C2, C3 | N2 | N3 | N4 | N7 | N11 | All others |
|---|---|---|---|---|---|---|---|---|---|
| 39 | 4 | 2,681 | 3,929 each | 39 | 931 | 61 | 62 | 849 | 0 |

**The nine cuts** (`cuts.<name>`, the kit's quantile type 7 over B0's E positions with the feature known; equal to
`apps/poller/polish/cuts.json`):

| Cut | q | Value | n | Unknown |
|---|---|---|---|---|
| W4 | 0.5 | 336 | 148,154 | 0 |
| W5 | 0.5 | 0.04556442545719695 | 148,115 | 39 |
| R2 | 0.9 | 993.3591646591786 | 148,154 | 0 |
| R3 | 0.9 | 484.2527582748246 | 148,154 | 0 |
| R4 | 0.5 | 0.1855374657142237 | 145,473 | 2,681 |
| N2 | 0.5 | 0.0036394268226171878 | 148,115 | 39 |
| N7 | 0.5 | 0.0026860926906343238 | 148,092 | 62 |
| N8 | 0.5 | 0.000150424 | 148,154 | 0 |
| N9 | 0.5 | 5.774639223193654 | 148,154 | 0 |

The E step recomputed them and held them to `cuts.json` (exit 6 otherwise; architecture, "The exploration"). It ran to exit 0.

## 3. Every try on E, in the try log's order

**B0 on E** (`e.json` `b0`):
- 148,154 positions, 135,145 priced;
- unpriced: no trade at the entry 1,630, at the exit 9,740, funding without a price 1,639;
- **m +33.7, SE 39.7, z 0.85**, 211 days, 34 coins (`seDay` 39.72, `seMarket` 22.13).

**The bars:**
- **Adopted** when adoptable, t ≥ 2.5, and the floors all hold.
- **The E floors:** mean ≥ +50, priced positions on ≥ 40 days and in ≥ 15 coins.
- **The gain floor** is `e.json` `gain`: 10 bps (F4: max(+10, 10% of |m_B0|)).

`floors.*` and `refused` are as printed. The "gain floor" column reads `refused` for "below the gain floor".

**3.1 The statistic** (`tries.<name>`: `kind`, `seeded`, `venue`, `adoptable`, `positions`, `priced`, `stat.n`, `stat.mean`,
`stat.se`, `stat.z`, `stat.days`, `stat.markets`):

| # | Try | Fam. | Kind | Seeded | Venue | Adoptable | Positions | Priced | m | SE | z | Days | Coins |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | S1 SELLS | S | F | yes | HL | yes | 131,494 | 119,171 | +28.4 | 45.0 | +0.63 | 199 | 34 |
| 2 | D0 | D | V | yes | Both | yes | 148,154 | 135,699 | +10.1 | 57.6 | +0.17 | 211 | 34 |
| 3 | D15 | D | V | yes | Both | yes | 148,154 | 133,242 | +7.0 | 38.7 | +0.18 | 211 | 34 |
| 4 | D60 | D | V | yes | Both | yes | 148,154 | 132,726 | −17.0 | 43.0 | −0.40 | 211 | 34 |
| 5 | H1 | H | V | yes | Both | yes | 148,154 | 140,987 | +31.8 | 13.6 | +2.33 | 211 | 34 |
| 6 | H2 | H | V | yes | Both | yes | 148,154 | 139,610 | +39.5 | 19.4 | +2.03 | 211 | 34 |
| 7 | H4 | H | V | yes | Both | yes | 148,154 | 138,206 | +36.0 | 18.2 | +1.98 | 211 | 34 |
| 8 | H8 | H | V | yes | Both | yes | 148,154 | 137,828 | +49.7 | 20.1 | +2.47 | 211 | 34 |
| 9 | H12 | H | V | yes | Both | yes | 148,154 | 136,049 | +60.9 | 22.1 | +2.76 | 211 | 34 |
| 10 | W1 THREE | W | F | no | Both | yes | 88,097 | 78,204 | +70.6 | 47.6 | +1.48 | 199 | 34 |
| 11 | W2 M DOUBLED | W | V | yes | Both | yes | 143,370 | 131,433 | +94.9 | 47.0 | +2.02 | 211 | 34 |
| 12 | W3 COINS | W | F | no | Both | yes | 125,049 | 112,340 | +45.2 | 42.2 | +1.07 | 211 | 34 |
| 13 | **W4 VENUE** | W | F | no | HL | yes | 74,104 | 65,533 | **+94.7** | 54.3 | +1.75 | 99 | 33 |
| 14 | W5 FLOW | W | F | no | HL | yes | 74,058 | 67,235 | +54.9 | 45.5 | +1.21 | 195 | 34 |
| 15 | R1 TREND | R | F | yes | Both | yes | 107,254 | 98,463 | +69.3 | 54.5 | +1.27 | 206 | 34 |
| 16 | R2 CRASH | R | F | yes | Both | yes | 133,464 | 122,156 | −35.7 | 73.3 | −0.49 | 211 | 34 |
| 17 | R3 BTC CRASH | R | F | yes | Both | yes | 133,437 | 121,845 | −12.5 | 51.9 | −0.24 | 211 | 34 |
| 18 | R4 CALM | R | F | yes | Both | yes | 72,731 | 66,642 | −149.4 | 114.5 | −1.30 | 142 | 34 |
| 19 | C1 THIN | C | F | no | Both | yes | 15,896 | 10,772 | +297.1 | 190.4 | +1.56 | 181 | 23 |
| 20 | C2 WIDE | C | F | no | Both | yes | 35,471 | 29,970 | +126.8 | 84.3 | +1.50 | 206 | 20 |
| 21 | C3 SMALL | C | F | no | Both | yes | 15,830 | 10,775 | +304.4 | 207.1 | +1.47 | 182 | 19 |
| 22 | T1 NOT 08–12 | T | F | no | Both | yes | 135,783 | 123,698 | +38.1 | 41.7 | +0.92 | 211 | 34 |
| 23 | T2 WEEKDAYS | T | F | no | Both | yes | 130,486 | 118,584 | +17.4 | 41.6 | +0.42 | 151 | 34 |
| 24 | X1 TARGET | X | V | yes | Both | yes | 148,093 | 140,421 | +49.5 | 18.3 | +2.71 | 211 | 34 |
| 25 | N1 BURST | N | F | no | Both | yes | 55,011 | 51,569 | −69.5 | 102.0 | −0.68 | 210 | 34 |
| 26 | N2 BIG FILL | N | F | no | Both | yes | 74,058 | 64,178 | +49.4 | 38.4 | +1.29 | 207 | 34 |
| 27 | N3 CROWDED | N | F | no | Both | yes | 8,559 | 8,096 | +74.9 | 110.9 | +0.68 | 134 | 33 |
| 28 | N4 BOUNCED | N | F | no | Both | yes | 147,409 | 134,464 | +34.3 | 39.7 | +0.86 | 211 | 34 |
| 29 | N5 BACKSTOP | N | F | no | HL | yes | 13,584 | 12,013 | +396.6 | 223.1 | +1.78 | 35 | 33 |
| 30 | N6 REPEAT | N | F | no | Both | yes | 79,760 | 69,686 | +25.9 | 32.1 | +0.81 | 211 | 34 |
| 31 | N7 OI DROP | N | F | no | HL | no (print) | 74,041 | 66,867 | +80.7 | 44.1 | +1.83 | 209 | 33 |
| 32 | N8 DISCOUNT | N | F | no | HL | no (print) | 74,077 | 68,139 | +99.2 | 39.2 | +2.53 | 209 | 34 |
| 33 | N9 THROUGH | N | F | no | HL | yes | 74,077 | 68,063 | +74.0 | 43.8 | +1.69 | 207 | 34 |
| 34 | N10 MARKET-WIDE | N | F | no | HL | yes | 133,951 | 121,471 | +42.1 | 42.5 | +0.99 | 208 | 34 |
| 35 | N11 VOLATILE | N | F | no | Both | yes | 29,557 | 27,037 | +307.7 | 117.7 | +2.62 | 120 | 33 |

**3.2 The D-test against B0 and the floors** (`tries.<name>`: `test.k`, `test.d`, `test.se` (SE_D), `test.t`, `floors.mean`,
`floors.days`, `floors.coins`, `refused`). Every try's `test.days` is 211 and `test.coins` 34 (the union with B0's positions).

| # | Try | k | D | SE_D | t | Mean floor | Days floor | Coins floor | Gain floor | `refused` |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | S1 | 1.133 | −9.8 | 8.2 | −1.20 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 2 | D0 | 1.450 | −38.8 | 24.7 | −1.57 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 3 | D15 | 0.974 | −25.8 | 10.2 | −2.52 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 4 | D60 | 1.082 | −53.5 | 14.0 | −3.82 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 5 | H1 | 0.343 | +20.2 | 19.6 | +1.03 | not met | met | met | met | t below 2.5; the mean floor |
| 6 | H2 | 0.489 | +23.0 | 25.2 | +0.91 | not met | met | met | met | t below 2.5; the mean floor |
| 7 | H4 | 0.458 | +20.6 | 22.7 | +0.91 | not met | met | met | met | t below 2.5; the mean floor |
| 8 | H8 | 0.506 | +32.7 | 18.1 | +1.80 | not met | met | met | met | t below 2.5; the mean floor |
| 9 | H12 | 0.556 | +42.1 | 20.2 | +2.09 | met | met | met | met | t below 2.5 |
| 10 | **W1** | 1.197 | +30.3 | 12.0 | **+2.53** | met | met | met | met | **none** (lost its family to W4) |
| 11 | W2 | 1.183 | +55.0 | 48.8 | +1.13 | met | met | met | met | t below 2.5 |
| 12 | W3 | 1.064 | +9.3 | 8.0 | +1.17 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 13 | **W4** | 1.366 | **+48.6** | 16.1 | **+3.03** | met | met | met | met | **none: adopted** |
| 14 | W5 | 1.146 | +16.3 | 14.4 | +1.13 | met | met | met | met | t below 2.5 |
| 15 | R1 | 1.372 | +23.1 | 16.9 | +1.36 | met | met | met | met | t below 2.5 |
| 16 | R2 | 1.846 | −97.9 | 46.1 | −2.12 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 17 | R3 | 1.308 | −56.6 | 30.7 | −1.84 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 18 | R4 | 2.883 | −246.6 | 109.3 | −2.26 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 19 | C1 | 4.793 | +135.6 | 313.8 | +0.43 | met | met | met | met | t below 2.5 |
| 20 | C2 | 2.122 | +55.3 | 98.0 | +0.56 | met | met | met | met | t below 2.5 |
| 21 | C3 | 5.215 | +128.6 | 340.7 | +0.38 | met | met | met | met | t below 2.5 |
| 22 | T1 | 1.049 | +2.8 | 5.6 | +0.50 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 23 | T2 | 1.048 | −17.9 | 15.7 | −1.14 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 24 | **X1** | 0.461 | +34.0 | 12.1 | **+2.81** | **not met** | met | met | met | the mean floor |
| 25 | N1 | 2.567 | −156.0 | 77.0 | −2.03 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 26 | N2 | 0.967 | +16.8 | 13.8 | +1.22 | not met | met | met | met | t below 2.5; the mean floor |
| 27 | N3 | 2.793 | −19.2 | 149.6 | −0.13 | met | met | met | not met | t below 2.5; below the gain floor |
| 28 | N4 | 1.001 | +0.6 | 0.4 | +1.46 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 29 | N5 | 5.618 | +207.2 | 363.2 | +0.57 | met | not met | met | met | t below 2.5; the days floor |
| 30 | N6 | 0.808 | −1.4 | 26.8 | −0.05 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 31 | N7 | 1.110 | +43.3 | 32.9 | +1.32 | met | met | met | met | print only; t below 2.5 |
| 32 | N8 | 0.988 | +65.9 | 30.1 | +2.19 | met | met | met | met | print only; t below 2.5 |
| 33 | N9 | 1.102 | +36.9 | 29.2 | +1.26 | met | met | met | met | t below 2.5 |
| 34 | N10 | 1.070 | +6.0 | 6.9 | +0.87 | not met | met | met | not met | t below 2.5; below the gain floor; the mean floor |
| 35 | N11 | 2.963 | +207.9 | 163.6 | +1.27 | met | met | met | met | t below 2.5 |

**3.3 Left out and unpriced, by reason** (`tries.<name>.left`, a feature unknown at the instant; `tries.<name>.unpriced`):

| # | Try | Left out | Unpriced: no trade at the entry | at the exit | funding without a price |
|---|---|---|---|---|---|
| 1 | S1 | 0 | 1,441 | 9,296 | 1,586 |
| 2 | D0 | 0 | 995 | 9,830 | 1,630 |
| 3 | D15 | 0 | 3,077 | 10,200 | 1,635 |
| 4 | D60 | 0 | 4,961 | 8,877 | 1,590 |
| 5 | H1 | 0 | 1,630 | 5,537 | — |
| 6 | H2 | 0 | 1,630 | 6,914 | — |
| 7 | H4 | 0 | 1,630 | 8,318 | — |
| 8 | H8 | 0 | 1,630 | 8,685 | 11 |
| 9 | H12 | 0 | 1,630 | 10,460 | 15 |
| 10 | W1 | 0 | 1,054 | 7,566 | 1,273 |
| 11 | W2 | 0 | 1,252 | 8,877 | 1,808 |
| 12 | W3 | 0 | 1,617 | 9,582 | 1,510 |
| 13 | W4 | 0 | 759 | 6,549 | 1,263 |
| 14 | W5 | W5 unknown 39 | 548 | 5,587 | 688 |
| 15 | R1 | R1 unknown 4 | 1,284 | 7,476 | 31 |
| 16 | R2 | 0 | 1,540 | 8,129 | 1,639 |
| 17 | R3 | 0 | 1,548 | 8,405 | 1,639 |
| 18 | R4 | R4 unknown 2,681 | 805 | 5,276 | 8 |
| 19 | C1 | C1 unknown 3,929 | 996 | 4,058 | 70 |
| 20 | C2 | C2 unknown 3,929 | 961 | 4,458 | 82 |
| 21 | C3 | C3 unknown 3,929 | 1,037 | 3,959 | 59 |
| 22 | T1 | 0 | 1,494 | 8,964 | 1,627 |
| 23 | T2 | 0 | 1,378 | 8,928 | 1,596 |
| 24 | X1 | X1 unknown 61 | 1,630 | 5,861 | 181 |
| 25 | N1 | 0 | 345 | 2,753 | 344 |
| 26 | N2 | N2 unknown 39 | 1,439 | 7,818 | 623 |
| 27 | N3 | N3 unknown 931 | 44 | 276 | 143 |
| 28 | N4 | N4 unknown 61 | 1,603 | 9,708 | 1,634 |
| 29 | N5 | 0 | 83 | 1,488 | — |
| 30 | N6 | 0 | 1,470 | 8,013 | 591 |
| 31 | N7 | N7 unknown 62 | 696 | 5,471 | 1,007 |
| 32 | N8 | 0 | 899 | 4,724 | 315 |
| 33 | N9 | 0 | 424 | 4,579 | 1,011 |
| 34 | N10 | 0 | 1,510 | 9,385 | 1,585 |
| 35 | N11 | N11 unknown 849 | 204 | 1,540 | 776 |

"—": the reason is absent from the try's `unpriced`. **Depth short** is not printed by try: a leg short of $1,000 is walked at
its last level and priced (section 9).

**The print X2 STOP** (`e.json` `x2`, "printed only (F15)"):
- 148,154 positions, 135,954 priced, none left out;
- unpriced: at the entry 1,630, at the exit 9,061, funding 1,509;
- **m −15.1, SE 56.0, z −0.27**, 211 days, 34 coins;
- no D-test is printed.

**Seeded or not** (`tries.<name>.seeded`): 15 seeded (S1, D0, D15, D60, H1–H12, W2, R1–R4, X1) and 20 not, as the try log
marks them. Of the three tries with t ≥ 2.5, W1 and W4 are unseeded and X1 is seeded.

## 4. The choice

**Adopted** (`choice.json` `adopted`): **W4**, family W, t 3.026901919604694, D 48.64782312751705.
- Every other family's best had t below 2.5 or failed a floor (3.2). W was the one family with an adoptable change.
- W1 met every bar (`tries.W1.refused` empty) but lost the W family to W4's larger t (at most one change a family: THE PLAN
  5.3).

**N** (`choice.json` `rule`): name N, `M2` false, `delay` 120,000 ms, `hold` 86,400,000 ms, `target` false, `filters` ["W4"].

**N's E numbers, which test nothing** (`choice.json` `N`, "N's numbers on E test nothing; N's only test is C (F5)"):
- 74,104 positions, 65,533 priced, none left out;
- unpriced: at the exit 6,549, at the entry 759, funding 1,263;
- m +94.7, SE 54.3 (`seDay` 54.26, `seMarket` 37.21), z 1.75, 99 days, 33 coins;
- **k for C 1.3660997121813154** (`N.k`).

N equals `tries.W4` on E (the same counts and statistic): a single filter on B0's legs.

**The C evaluations reached, in order** (`c.json`):
1. **First, B0 on C, a print** (`b0`, "decides nothing, exempt from the floors (F2)"):
   - 57,495 positions, 52,163 priced;
   - unpriced: at the exit 4,533, at the entry 799;
   - m **+41.4**, SE 48.4, z 0.86, 144 days, 35 coins.
2. **Evaluation (a), N** (`evaluations[0]`):
   - 19,317 positions, 16,754 priced, none left out (`leftShare` 0);
   - unpriced: at the exit 2,325, at the entry 238;
   - **m +211.3, SE 122.1** (`seDay` 122.14, `seMarket` 34.17), z 1.73, 50 days, 35 coins;
   - **the D-test with k from E** (`test`): k 1.3661, **D +154.7, SE_D 69.8, t 2.217**, over 144 days and 35 coins;
   - C's own k, printed beside: 2.525 (`ownK`).

   **F2's floors** (`floors`), each met:

   | Floor | Its bar | N on C |
   |---|---|---|
   | mean | ≥ +25 | +211.3 |
   | days | ≥ 30 | 50 |
   | coins | ≥ 15 | 35 |
   | footprint | every 100-day window of C: ≥ 20 days and ≥ 10 coins | `true` (no window's counts are printed) |

   **Passes:** t ≥ 1.0 and every floor met.
3. **Evaluation (b) was not reached.** It runs only when N fails and more than one change was adopted; here N passed and one
   change was adopted. One of the two allowed evaluations on C was spent.

**What goes to FRESH** (`c.json` `goes`): **N**.

## 5. The prints beside, each as printed

From `beside.json`, for the rule going to FRESH (`goes` N) with B0 beside. Nothing here decides anything but K and z. No net is
re-based (`rebasedBy` 0).

### 5.1 Months, sides and leave-outs (`lines.<rule|b0>.<E|C>`: `all`, `months`, `sides`, `withoutTwoBestDays`, `eventLevel`, `own`)

Each row is n | m | SE | z | days | coins.

**N on E:**

| Line | n | m | SE | z | Days | Coins |
|---|---|---|---|---|---|---|
| all | 65,533 | +94.7 | 54.3 | +1.75 | 99 | 33 |
| 2025-06 | 3,210 | +209.9 | 139.4 | +1.51 | 8 | 29 |
| 2025-07 | 7,860 | −14.1 | 99.1 | −0.14 | 12 | 30 |
| 2025-08 | 9,590 | +171.1 | 111.9 | +1.53 | 15 | 31 |
| 2025-09 | 8,582 | +53.4 | 79.7 | +0.67 | 13 | 32 |
| 2025-10 | 17,916 | +73.9 | 128.2 | +0.58 | 20 | 33 |
| 2025-11 | 13,423 | +144.2 | 159.6 | +0.90 | 20 | 33 |
| 2025-12 | 4,952 | +57.3 | 149.5 | +0.38 | 11 | 32 |
| forced sells | 65,133 | +88.9 | 54.0 | +1.65 | 94 | 33 |
| forced buys | 400 | +1,039.6 | 705.0 | +1.47 | 7 | 29 |
| without the two best days | 61,842 | +44.5 | 40.9 | +1.09 | 97 | 33 |
| event level (F17) | 3,085 | −3.6 | 69.2 | −0.05 | 99 | 33 |
| OWN (F17) | 74,104 | +10.0 | 27.3 | +0.37 | 99 | 33 |

**N on C:**

| Line | n | m | SE | z | Days | Coins |
|---|---|---|---|---|---|---|
| all | 16,754 | +211.3 | 122.1 | +1.73 | 50 | 35 |
| 2026-01 | 7,525 | +40.4 | 100.0 | +0.40 | 13 | 35 |
| 2026-02 | 4,807 | +585.8 | 299.2 | +1.96 | 12 | 35 |
| 2026-03 | 800 | +22.0 | 117.4 | +0.19 | 7 | 32 |
| 2026-04 | 409 | +184.6 | 40.8 | +4.52 | 7 | 28 |
| 2026-05 | 3,213 | +101.6 | 126.9 | +0.80 | 11 | 34 |
| forced sells | 16,188 | +229.1 | 126.1 | +1.82 | 44 | 35 |
| forced buys | 566 | −297.8 | 232.1 | −1.28 | 7 | 30 |
| without the two best days | 13,940 | +64.1 | 69.0 | +0.93 | 48 | 35 |
| event level (F17) | 1,216 | +67.4 | 65.1 | +1.04 | 50 | 35 |
| OWN (F17) | 19,317 | +7.5 | 21.6 | +0.35 | 50 | 35 |

**B0 on E:**

| Line | n | m | SE | z | Days | Coins |
|---|---|---|---|---|---|---|
| all | 135,145 | +33.7 | 39.7 | +0.85 | 211 | 34 |
| 2025-06 | 8,553 | +52.5 | 99.4 | +0.53 | 30 | 29 |
| 2025-07 | 16,805 | −41.9 | 79.7 | −0.53 | 30 | 30 |
| 2025-08 | 19,778 | +108.0 | 73.6 | +1.47 | 31 | 31 |
| 2025-09 | 17,803 | −39.2 | 66.9 | −0.59 | 30 | 32 |
| 2025-10 | 30,178 | −0.0 | 112.5 | −0.00 | 31 | 33 |
| 2025-11 | 29,279 | +78.6 | 107.0 | +0.74 | 30 | 33 |
| 2025-12 | 12,749 | +83.9 | 76.3 | +1.10 | 29 | 34 |
| forced buys | 15,974 | +73.2 | 60.6 | +1.21 | 199 | 34 |
| forced sells | 119,171 | +28.4 | 45.0 | +0.63 | 199 | 34 |
| without the two best days | 129,414 | +2.5 | 33.3 | +0.07 | 209 | 34 |
| event level | 8,688 | −14.2 | 29.5 | −0.48 | 211 | 34 |
| OWN | 148,154 | +4.1 | 19.5 | +0.21 | 211 | 34 |

**B0 on C:**

| Line | n | m | SE | z | Days | Coins |
|---|---|---|---|---|---|---|
| all | 52,163 | +41.4 | 48.4 | +0.86 | 144 | 35 |
| 2026-01 | 16,364 | −43.4 | 63.0 | −0.69 | 31 | 35 |
| 2026-02 | 14,506 | +167.5 | 139.0 | +1.20 | 28 | 35 |
| 2026-03 | 6,164 | +46.9 | 51.7 | +0.91 | 31 | 35 |
| 2026-04 | 4,700 | +92.9 | 60.7 | +1.53 | 28 | 34 |
| 2026-05 | 10,429 | −27.3 | 85.7 | −0.32 | 26 | 35 |
| forced buys | 13,812 | −65.2 | 56.7 | −1.15 | 126 | 35 |
| forced sells | 38,351 | +79.8 | 69.4 | +1.15 | 130 | 35 |
| without the two best days | 47,185 | −7.1 | 36.7 | −0.19 | 142 | 35 |
| event level | 4,954 | −7.9 | 23.5 | −0.34 | 144 | 35 |
| OWN | 57,495 | −7.9 | 14.9 | −0.53 | 144 | 35 |

**A day or a coin left out** (`dayOut`, `coinOut`: the leave-out giving the lowest and the highest mean, and which; dates from
the printed epoch ms, coin names from `waveh/coins.json`):

| Line | Lowest m: day out | Highest m: day out | Lowest m: coin out | Highest m: coin out |
|---|---|---|---|---|
| N on E | 2025-11-04 → +67.0 | 2025-10-10 → +121.0 | ZEC (214) → +74.5 | FARTCOIN (165) → +112.7 |
| N on C | 2026-02-06 → +108.9 | 2026-01-31 → +269.2 | XRP (25) → +195.9 | SOL (5) → +244.2 |
| B0 on E | 2025-11-04 → +15.1 | 2025-10-10 → +55.2 | ZEC (214) → +19.8 | SOL (5) → +43.7 |
| B0 on C | 2026-02-06 → +8.5 | 2026-02-04 → +57.2 | PUMP (200) → +35.6 | SOL (5) → +55.6 |

**The months.** N was positive in 6 of E's 7 months (2025-07 −14.1) and in all 5 of C's.

**The sides.** N's positions are almost all after forced sells: 65,133 of 65,533 on E and 16,188 of 16,754 on C.

**The leave-outs.** Without its two best days, N keeps +44.5 on E and +64.1 on C, and B0 keeps +2.5 and −7.1.

### 5.2 The tail (`lines.<rule|b0>.<E|C>.tail`; sums in bps of $1,000 positions)

| Line | Worst day: day, sum, positions | Largest fall | Most open | Worst position | Worst 5%'s mean |
|---|---|---|---|---|---|
| N on E | 2025-10-10, −985,560, 6,088 | 1,188,309 | 6,279 | −7,747.1 | −2,123.2 |
| N on C | 2026-01-31, −261,064, 2,635 | 438,848 | 2,814 | −2,446.6 | −997.8 |
| B0 on E | 2025-10-10, −2,519,331, 7,023 | 3,895,570 | 7,742 | −18,992.9 | −1,930.9 |
| B0 on C | 2026-02-04, −764,867, 981 | 1,596,506 | 4,340 | −4,032.3 | −1,377.4 |

### 5.3 BTC and ETH at the entries, on marks (`lines.<rule|b0>.<E|C>.large`; CR1 by day)

| Line | BTC gross | BTC excess | ETH gross | ETH excess | n |
|---|---|---|---|---|---|
| N on E | −6.4 ± 28.3 | −0.3 ± 28.3 | +39.2 ± 46.4 | +25.4 ± 46.4 | 74,104 |
| N on C | +96.6 ± 119.1 | +105.4 ± 119.0 | +46.0 ± 138.2 | +66.4 ± 138.1 | 19,317 |
| B0 on E | −4.8 ± 18.8 | −0.0 ± 18.8 | +13.8 ± 30.5 | +2.9 ± 30.6 | 148,154 |
| B0 on C | +16.8 ± 43.9 | +21.5 ± 43.7 | −3.3 ± 53.5 | +7.5 ± 52.9 | 57,495 |

### 5.4 The event-level mean and MARKET-1's OWN line (F17)

These are in the tables of 5.1:
- **The event level** is the earliest priced position of each B1 episode of the pooled counted fills. N: −3.6 ± 69.2 on E (3,085
  episodes) and +67.4 ± 65.1 on C (1,216). B0: −14.2 ± 29.5 and −7.9 ± 23.5.
- **OWN** is the gross on marks less dir × the other small coins' mean move over the same instants. N: +10.0 ± 27.3 on E and
  +7.5 ± 21.6 on C. B0: +4.1 ± 19.5 and −7.9 ± 14.9.

### 5.5 K (F19; `beside.json` `K`)

On E ∪ C, the rule's line pooled over slices 0…K−1 (`K.at`):

| K | n | SE | Days | Coins |
|---|---|---|---|---|
| 1 | 668 | 67.83 | 106 | 33 |
| 5 | 2,945 | 54.11 | 135 | 35 |
| **10** | 5,799 | **49.95** | 143 | 35 |
| 20 | 11,362 | 48.28 | 145 | 35 |
| 50 | 28,010 | 47.37 | 148 | 35 |
| 147 | 82,287 | 50.74 | 149 | 35 |

**K = 10** (`K.K`): the smallest K whose SE is at most 1.03 × the SE of all slices. The error is lowest at K = 50, and all 147
slices' is above K = 20's and K = 50's.

### 5.6 The footprint (`beside.json` `footprint`)

The rule's legs at K = 10, on E ∪ C, priced or not:
- **5,609** distinct (coin, hour) book files, over 144 days;
- **38.95** files a day with a position;
- **2.11 GB** for FRESH's ~100 days at 506 MB a day for the 38 coins (`freshGB`).

The estimate takes every one of the 100 days at the rate of a day with a position (`footprintOf`).

### 5.7 The placebo (F1; `beside.json` `placebo`, seed 20,261,118)

Each B1 episode's side is flipped at random in windows of consecutive days on E ∪ C. "Error" is the unflipped nets' two-way SE
in the window. All three lines are on **every slice**: the rule's 147, B0's 147, and B2, all slices' no-wave episodes on marks.

| Line | Window | Draws | P(t* > 2.58) | P(t* > 2.81) | sd of t* | 99.5th | 99.75th | Error: median (q1–q3) | Student |
|---|---|---|---|---|---|---|---|---|---|
| rule | 100 days | 10,000 | 0.24% | 0.11% | 0.939 | 2.332 | **2.566** | **88.1** (74.0–135.7) | 2.871 |
| rule | 182 days | 10,000 | 0.15% | 0.06% | 0.908 | 2.261 | 2.438 | **68.8** (56.4–80.2) | 2.842 |
| B0 | 100 days | 10,000 | 0.39% | 0.21% | 0.961 | 2.485 | 2.750 | 58.1 (53.0–61.5) | 2.871 |
| B0 | 182 days | 10,000 | 0.15% | 0.07% | 0.927 | 2.273 | 2.445 | 43.1 (41.7–45.4) | 2.842 |
| B2 | 100 days | 10,000 | 0.00% | 0.00% | 0.617 | 1.673 | 1.728 | 27.0 (24.7–34.6) | 2.871 |
| B2 | 182 days | 10,000 | 0.00% | 0.00% | 0.661 | 1.265 | 1.265 | 23.5 (20.6–23.8) | 2.842 |

**The exam's z** = max(2.81, the rule's 99.75th percentile at 100 days) = **2.81** (`examZ`).

### 5.8 The projection (F13; `beside.json` `projection`)

P(HOLDS) = Φ((m_proj − max(z·SE, 50 − z·SE)) ÷ SE), with z 2.81 and SE the rule's median window error: 88.1 at look 1 (100
days) and 68.8 at look 2 (182 days).

| From | m_proj (`mProj`) | Beside (`beside`) | Look 1 | Look 2 |
|---|---|---|---|---|
| C (`fromC`): m_C − SE_C | +89.13 | +211.26, m_C untruncated | **3.61%** | **6.49%** |
| E and C pooled (`pooled`): m − SE | +67.68 | +118.42, the pooled m | 2.06% | 3.39% |

### 5.9 The signal meter (`beside.json` `signal`; descriptive)

- Over the 33 adoptable tries: mean t² **2.778**, sample variance 2.775;
- the verdict "**more than luck alone**" (the line 1.2);
- shrink 0.640;
- the caveat as printed: "the t's are correlated (the review's §9): a description, deciding nothing".

The t's spread on both sides (3.2): D15, D60, R2, R4 and N1 below −2, and W4, X1, W1 and H12 above +2.

Each change's E gain shrunk (`signal.gains`, D × shrink):

| | | | | | | | |
|---|---|---|---|---|---|---|---|
| S1 −6.3 | D0 −24.8 | D15 −16.5 | D60 −34.2 | H1 +12.9 | H2 +14.7 | H4 +13.2 | H8 +20.9 |
| H12 +27.0 | W1 +19.4 | W2 +35.2 | W3 +6.0 | **W4 +31.1** | W5 +10.4 | R1 +14.8 | R2 −62.7 |
| R3 −36.2 | R4 −157.8 | C1 +86.8 | C2 +35.4 | C3 +82.3 | T1 +1.8 | T2 −11.5 | X1 +21.7 |
| N1 −99.8 | N2 +10.8 | N3 −12.3 | N4 +0.4 | N5 +132.6 | N6 −0.9 | N9 +23.6 | N10 +3.9 |
| N11 +133.0 | | | | | | | |

### 5.10 The tape against the book (`beside.json` `books.tapeAgainstBook`, slice 0's B0 positions)

The tape's gain for the follower over the book, a leg, in bps of the book's price (`compared`). `short` counts the walks depth
short at either source; `notCompared` gives the legs not compared, by reason.

| Part | Leg | n | m ± SE | z | Days | Coins | Short | Not compared |
|---|---|---|---|---|---|---|---|---|
| E | entry at 10 s | 1,006 | +4.25 ± 1.97 | +2.15 | 146 | 32 | 29 | not held 27; no book file 102; stale 26; no trade 13; no snapshot 1 |
| E | entry at 2 min | 1,030 | +2.25 ± 1.32 | +1.70 | 149 | 32 | 56 | stale 20; no book file 110; no trade 15 |
| E | entry at 5 min | 971 | +2.47 ± 1.33 | +1.85 | 149 | 32 | 59 | not held 35; no book file 109; stale 26; no trade 34 |
| E | entry at 15 min | 831 | +2.66 ± 1.68 | +1.58 | 141 | 32 | 62 | not held 203; no book file 94; stale 23; no trade 24 |
| E | exit (2 min entry) | 935 | +0.61 ± 0.41 | +1.48 | 148 | 31 | 174 | no book file 119; stale 32; no trade 83; no trade at the entry 6 |
| C | entry at 10 s | 359 | +2.78 ± 1.63 | +1.71 | 87 | 32 | 16 | stale 27; not held 4; no trade 4; no book file 1 |
| C | entry at 2 min | 363 | +0.49 ± 0.60 | +0.82 | 88 | 32 | 23 | stale 25; no trade 6; no book file 1 |
| C | entry at 5 min | 368 | +4.43 ± 1.55 | +2.86 | 87 | 32 | 44 | stale 6; not held 14; no trade 6; no book file 1 |
| C | entry at 15 min | 303 | +0.20 ± 0.72 | +0.28 | 79 | 31 | 41 | not held 71; stale 16; no trade 5 |
| C | exit (2 min entry) | 341 | +1.02 ± 0.72 | +1.41 | 85 | 31 | 91 | stale 9; no trade 41; no trade at the entry 3; no book file 1 |

**b on C** (`beside.json` `calibrationOnC`, slice 0's C positions the look priced at the book at both ends): 360 positions, 318
priced; **+1.14 ± 0.81** (`seDay` 0.80, `seMarket` 0.68), 85 days, 31 coins, z 1.41.

### 5.11 The walks (`beside.json` `books.walks`, slice 0's B0 entry books at x_in)

The cost against the book's mid (`cost`), and the extra over $1,000 (`extra`), each m ± SE in bps. `short` counts the walks
depth short.

| Part | Positions | Not walked | Size | n | Cost | Extra over $1,000 | Short |
|---|---|---|---|---|---|---|---|
| E | 1,175 | stale 20; no book file 110 | $1,000 | 1,045 | +5.04 ± 3.49 | — | 0 |
| E | | | $10,000 | 1,045 | +17.81 ± 14.73 | +11.96 ± 10.44 | 1 |
| E | | | $50,000 | 1,045 | +46.62 ± 40.84 | +38.75 ± 34.54 | 71 |
| C | 395 | stale 25; no book file 1 | $1,000 | 369 | +2.30 ± 0.54 | — | 0 |
| C | | | $10,000 | 369 | +3.90 ± 0.96 | +1.60 ± 0.46 | 0 |
| C | | | $50,000 | 369 | +7.47 ± 1.89 | +5.17 ± 1.38 | 33 |

### 5.12 Prints outside the plan

THE PLAN 6.3 listed these, each labelled; they decide nothing:
1. each try's left-out counts by reason (3.3): feature unknown and unpriced; depth short is not printed;
2. the reproduction check (2.1);
3. each output's identity block, its phases' seconds and its peaks (6);
4. the features step's dry sweep (2.3);
5. the calibration on C (5.10).

Every other print in `beside.json` and `e.json`'s `x2` is in the plan's 1.5 or THE PLAN 6.1–6.2, with their details set by
POLISH-EXPLORE-3's calls 3 and 4 (decisions 2026-11-18, "the exploration built").

## 6. What the run measured

From each output's `seconds` and `peaks` (MB; `maxRssMB` is the process's peak working set). The heap ceiling was 20,672 MB (log
`heapLimitMB`).

| Step | Seconds, by phase (`seconds`) | All | Largest `maxRssMB` (phase) |
|---|---|---|---|
| features | data 37, prices 48, features 75, dry sweep 74 | 234 | 3,666 (dry sweep) |
| e | data 37, reproduction 10, features 65, sweep 105, tries 6 | 242 | 3,706 (sweep, tries) |
| choice | data 32, N on E 146 | 179 | 3,232 (N on E) |
| c | data 18, C 103 | 122 | 2,458 (C) |
| beside | data 18, beside 266, books 1,325 | 1,609 | **6,193 (books)**; beside's 5,627, its `heapUsedMB` 5,005 |

- The five steps took 2,386 s together (a presentational sum, `tables.cjs`).
- The largest peak was 6,193 MB (`beside.json` `peaks.books.maxRssMB`).
- THE PLAN 7 expected:
  - features about 10–15 min, E 15–30, choice a few minutes, C 10–20, beside about 10;
  - a peak of about 3–5 GB, with a stop above 10 GB.

  Features, e and c ran well under their estimates and choice about as expected. Beside took 1,609 s, 1,325 of them the
  books. The peak, 6,193 MB, was above the estimate and under the stop.
- Run 1's E step crashed while writing (section 1). Its phases before that took data 37 s, reproduction 9, features 66, sweep
  94 and tries 6, with a peak of 3,656 MB (log lines 497–501).

## 7. The error rates, plainly

- **The plan's 2.2:** under pure chance, one useless change passes E (t ≥ 2.5) with probability 0.621%. Over 38 tries that is
  at most 23.6%. Passing C (t ≥ 1.0) then has probability 15.87%. So **at most 3.7%** of the time a useless change reaches
  FRESH.
- **F6's split, for the 35 tries as run** (the try log; `beside.json` `errorRates`):

  | Tries | Pass E (at most) | Reach FRESH (at most) |
  |---|---|---|
  | all 33 adoptable | 20.5% | 3.3% |
  | the 18 unseeded | 11.2% | **1.8%** |

  W4 is unseeded (`tries.W4.seeded` false), so 1.8% is its line. For the 15 seeded tries only FRESH is a clean test, and none of
  them was adopted.
- **The review's synthetic check** (review section 2) puts the reach at 2.4–2.7% while B0's true mean is at most about +60. It
  rises to 8.1% at +100. B0's printed means, +33.7 on E and +41.4 on C, lie in the first range.
- **The exam's false HOLDS does not depend on the search.** On these data the placebo puts the rule's chance of t* > 2.81 at
  0.11% on 100 days and 0.06% on 182 days (5.7). Each of two looks is allowed 0.25%.

## 8. For the exam's rules

**The frozen recipe** (`c.json` `rule`; the try log; `cuts.json`):
- **The coins and fills:** the 38 small coins (WAVE-H's H3, `waveh/coins.json`); the counted fills (H4).
- **The slices:** by address mod M, **M = 147** (`identity.M`, the look's `step1.json`). In each slice, MARKET-1's `waveEntries`
  (M5) over `bySlice` of the counted fills from the first file (tries.md 3.2).
- **The deciding line: slices 0–9, K = 10** (`beside.json` `K.K`). All 147 are printed beside (F19).
- **The position:** $1,000 against σ (dir = −σ), x_in = t + 120,000 ms, x_out = x_in + 86,400,000 ms. No stop, no target, M not
  doubled (`rule.delay`, `hold`, `target` false, `M2` false).
- **The filter W4,** with instant t: kept when the number of different accounts with a counted fill of side σ in the 38 coins in
  [t − 3,600,000 ms, t], both ends in, over all accounts, is **≥ 336**.
  - The cut is `cuts.W4.value`: q 0.5 over 148,154 B0 positions of E, 0 unknown.
  - The try log's venue tag is HL.
  - On E and C no position was left out for it (`tries.W4.left`, `evaluations[0].left` empty).
- **The rest as the plan freezes it:**
  - the prices (3.2): the book first, else the tape, else unpriced;
  - 4.5 bps a leg; funding through 1.4's minute price;
  - the verdicts (3.3, with F8, F11): BASE for the 24-hour hold is H10's;
  - **z 2.81** at each of two looks (`beside.json` `examZ`), with F14's rule for the two looks;
  - the deciding days (3.1).

**Known gaps:**
1. **F7's 2026-07-08.** No `asset_ctxs` file and no books exist for that day. The review estimates about 2 entry days of 100
   unpriced. List it at the freeze and budget about 2% toward WITHHELD.
2. **F7's thin day files.** From 2026-09-22 they reach 11-07 → 11-14, segment 2's 8 days, and probably look 2. Print segment
   2 apart.
3. **No books on 2026-07-08 and 07-12 → 17** (plan 3.2). Those legs go to the tape. F8 requires the book-priced mean above 0;
   each price source is printed apart.
4. **The kit's `marketFrom` refuses a panel past 2026-11-07** (decisions 2026-11-18, "For the exam's build"). The exploration's
   minute price and funding avoid it; the exam's build must too.
5. **z and the projection were measured on all 147 slices, while K = 10 decides.** Both `placeboOf` and the window errors behind
   `projection` take the rule's lines of every slice (`steps.ts`, `besideOf`). No placebo percentile or window error is printed
   for slices 0–9. K's own SE on E ∪ C is 49.95, against 50.74 for all (5.5).
6. **The walks are B0's slice-0 entries, not N's** (5.11). No size print exists for N's own entries.
7. **W4 is tagged HL.** By plan section 5, a part tagged HL has no Polymarket form. MARKET-1's second arm must name the nearest
   one, or wait.
8. **W4's cut is a count** of accounts, frozen from E. FRESH's fills are busier (plan 3.5: about 0.94 GB a day against TEST's
   0.61), so the share of FRESH's entries that pass W4 is unknown until the exam's step 1 counts them, before any price.
9. **Two counts are not printed:** depth-short positions by try, and funding hours without a row. Plan 4.3 and THE PLAN 6.3
   (1) name them. Each position's line carries `short` and `missing` (9).
10. **F2's footprint on C is printed as a pass only** (`evaluations[0].floors.footprint` true). The smallest window's days and
    coins are not printed.

## 9. Notes for the Final review

What looked surprising in the outputs, and where:
- **The pooled line and the event level part ways.** N on E: +94.7 pooled against −3.6 ± 69.2 at the event level (`lines.rule.E`).
  On C: +211.3 against +67.4 ± 65.1. The pooled gain comes from the cascades that many slices enter.
- **The gain rests on a few days.** Without its two best days, N falls to +44.5 on E and +64.1 on C, and B0 to +2.5 and −7.1
  (`withoutTwoBestDays`). C's 2026-02 alone made +585.8 ± 299.2 over 4,807 of N's 16,754 positions (`lines.rule.C.months`).
- **The market moved with N on C.** BTC's gross at N's C entries was +96.6 ± 119.1 on marks, against OWN +7.5 ± 21.6
  (`lines.rule.C.large`, `own`).
- **The error is not lowest with every slice.** K = 50's SE is 47.37, all 147 slices' 50.74 (`K.at`). The plan's model put
  all 147 slightly below 20 slices (31.3 against 31.8; plan, "For the owner").
- **E's walks cost several times C's,** with wide errors: 5.04 ± 3.49 against 2.30 ± 0.54 at $1,000 (`books.walks`).
- **N's forced buys on E:** +1,039.6 ± 705.0 on 400 positions over 7 days, and −297.8 ± 232.1 on C (`sides`).
- **B0's worst position on E** lost 18,992.9 bps (`lines.b0.E.tail.worst`).
- **The decisions entry's "peak 5.6 GB"** (2026-11-19, "the five steps ran") is the beside phase's `maxRssMB` 5,627. The books
  phase peaked at 6,193 (`beside.json` `peaks.books.maxRssMB`).
- **The positions lines carry more than the outputs summarise.** `e-positions.jsonl.gz` lines hold `group, slice, t, iid,
  tid, dir, xIn, xOut, net, unpriced, gross, fees, funding, missing, short, pIn, pOut, onMarks` and each filter's feature (S1…N11).
  So the depth-short and missing-funding counts can be summed from them. I read only the first line's field names.

What is as designed, though it may look odd:
- **W1 met every bar and was not adopted:** one change a family, the largest t (4).
- **X1's t of 2.81 was refused** by the +50 mean floor (+49.5).
- **N equals W4 on E,** since W4 is a filter of B0's legs (4).
- **B0 on C has no "funding without a price"** (`c.json` `b0.unpriced`), against 1,639 on E.

## 10. Questions, each with a recommendation

1. **Should the exam's z and the projection come from the deciding line, slices 0–9, rather than all 147?**
   - **Recommendation: yes.** Before the freeze, print the placebo and the window errors on slices 0–9, with the same seed and
     draws, and freeze z = max(2.81, that line's 99.75th percentile).
   - It flips signs of nets already computed, so no new outcome direction is seen.
   - It can only raise z. The projection then comes from that line's errors.
   - POLISH-EXPLORE-REVIEW or POLISH-RULES can do it; the supervisor rules which.
2. **Should a size print be made on N's own entries?**
   - **Recommendation: yes, as a print in the Final review:** the walks on N's slice-0 entry books, E and C.
   - It decides nothing, but it answers the owner's sizing question for the rule that goes, where 5.11 answers it for B0.
3. **Should the two missing counts be summed** (depth-short positions by try, funding hours without a row)?
   - **Recommendation: yes,** by the Final review, from the positions files' `short` and `missing` fields.
   - They change no number above.
4. **The event-level line at the owner's ruling.**
   - **Recommendation:** show it beside N's numbers as printed (5.4). It changes no rule, but it shows where the money came from.
5. **MARKET-1's second arm.**
   - **Recommendation:** its plan names the nearest Polymarket form of W4, the pool's own count of accounts liquidated across the
     small coins in the hour, or the arm waits (plan section 5).
   - The owner's call, after the exam's freeze.
