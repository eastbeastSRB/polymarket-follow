# WAVE-H's one look — the report, and its Final review

WAVE-H-LOOK-REVIEW (Sonnet 5.5, max; WAVE-H was built and fixed by Opus),
2026-11-17 16:51Z – 17:54Z (UTC; every stamp from `date -u`), for
polymarket-follow's supervisor. Under review: WAVE-H's one look (the program
frozen 2026-11-16, tag `waveh-freeze-1`, 74 files `864990da…8dd2`; step 2 run
2026-11-17 01:09Z – 16:10Z) and its five files in
`F:\polymarket-follow-research\FIND-SLOTS\WAVE-H-BUILD-rehearsal\look\`:
`result.json`, `report.json`, `positions.jsonl.gz`, `step1.json`,
`books-needed.txt`. Part 1 is the look's report (H15 "Then"); Part 2 is its
Final review, a recomputation with independent code. **A review decides
nothing:** the supervisor and the owner answer. Evidence: the supervisor
folder `workers/WAVE-H-LOOK-REVIEW/` (`progress.md`, `scripts/`, `out/`; every
figure below comes from a saved output there, named in the tables).

## For the owner, in one page

**What was tested.** WAVE-H asked one question: does MARKET-1's liquidation-wave
rule work on Hyperliquid's history, a larger venue with ten months of data from
before Polymarket Perps existed? The rule: when two different accounts are
force-closed (liquidated) in the same direction within one hour, in any of
38 small coins, open $1,000 the other way two minutes later and close it 24
hours later. Hyperliquid has about 160,600 accounts with such a liquidation in
these coins. A fixed address rule split them into 147 equal groups and only
group 0 counted, so nobody picked the accounts. That gave 1,299 simulated
trades between 2025-08-01 and 2026-05-27. Each was priced by walking the
archived order book (the next minute's trades where the archive has no usable
book), with Hyperliquid's fee (4.5 hundredths of a percent a side) and the
funding paid or earned.

**The result: NOT SETTLED.** The average trade made **+82.6 basis points**
(0.83% of $1,000, about +$8.26) with a standard error of 40.9. At the test's
1% level the averages the data allow run from **−23.0 to +188.1**. Your line
was +50. DOES NOT HOLD needed the top of that range under +50; HOLDS needed the
bottom above 0 and the average to beat each coin's own drift. The range
crosses both, so the test says: not proven, not refuted. It does rule out an
average above about +188 basis points a trade. 10 of the 1,299 trades could not
be priced (no book and no trade at the exit) and 39 had a leg that the
available depth could not fill in full: 3.8% together, far from the 10% that
would have withheld the verdict.

**What the lines beside show** (they decide nothing). The direction is
positive in most views. The same rule in all 147 groups gives +66.1 ± 31.3
basis points before costs over 176,986 trades, and 146 of the 147 groups are
positive (group 0, at +94.9, sits in the upper fifth). Larger waves earn more
(+205.9 ± 104.6 on 603 trades). A liquidation after a quiet hour, with no
second account in a wave, earns nothing (−6.3 ± 17.9 on 167,603: the control).
The gain is early: entering one hour or three hours
late gives +33.0 and +32.7. After forced sells (a long closed, so we buy)
the average is +121.9 ± 51.7; after forced buys −19.0 ± 64.8. The result leans
on a few days (without the two best, +51.6) and on trades priced from the
next minute's trades instead of the book: 197 such trades average +197.4 ±
124.9, the 1,092 priced at the book at both ends +61.8 ± 42.9.

**What it decides, and what it does not.** It decides nothing for MARKET-1,
which keeps its own frozen test, and no rule of WAVE-H changes after the look.
The ideas the lines suggest (forced sells only, the entry's speed, larger waves)
are leads: each is fixed in advance and confirmed on data no rule has seen
(decisions 2026-11-17).

**Was the look computed right?** I recomputed it with code that shares no
source file with WAVE-H's, from the raw files, position by position. All 1,299
positions, all 1,289 prices (to a billionth of a basis point), the statistic,
the verdict and every line beside are the same. The Final review's verdict:
**the look stands.** One printed median is defined differently (Part 2, 2.4);
it changes no number that decides anything.

---

# Part 1 — The look's report

## 1.1 What WAVE-H is (the frozen rules, in brief)

Source: `apps/poller/waveh/rules.md` (H0–H15), which copies MARKET-1's
`apps/poller/market1/rules.md` (M3–M13) for the wave, the position and the
statistic.

- **Data:** Hyperliquid's public archive (AWS `aws-public-blockchain`): every
  fill file 2025-05-25 14h → 2026-05-29 01h (8,845 files), `asset_ctxs` marks
  (370 days), settled funding (760 window files) and the archived order books
  (`market_data/…/l2Book`, a snapshot every 0.54 s), all downloaded before the
  freeze and held to `waveh/data.sha256` and `store\books.jsonl`.
- **A counted fill (H4):** a liquidated account's own fill in one of 38 small
  coins that reduces its position and is a taker's (`crossed`) or a backstop's.
  2,421,070 of them (SIZING 425,433; TEST 1,995,637).
- **Slices (H5):** the address read as a 160-bit number, modulo M = 147 (M is
  fixed from SIZING's first 67 days 10 hours); slice 0 is WAVE-H.
- **Wave and entry (H6, M5):** a counted fill is an entry when at least two
  different addresses of the slice have a counted fill of its side in the 60
  minutes up to it and its coin has had no entry of the slice in those 60
  minutes. WAVE-H's positions: slice 0's entries in TEST
  [2025-08-01, 2026-05-28).
- **Position (H7):** against the forced side, $1,000, in at t + 2 min, out 24 h
  later, no stop.
- **Price (H8):** a taker's walk of the archived book at that instant (live
  within 10 s, 20 levels); where the archive has no usable live book, the first
  takers' trades in the next minute; where neither exists, unpriced.
- **Net (H9):** gross − fees (4.5 bps a leg) + funding.
- **Statistic and verdict (H11, H12):** the mean net m over the priced
  positions; the two-way standard error by UTC day and coin; z = 2.58; the
  verdicts in the order WITHHELD, TOO FEW TO TELL, DOES NOT HOLD (m + z·SE <
  +50), HOLDS (m − z·SE > 0 and the mean excess over each coin's 4-hour drift
  > 0), NOT SETTLED.

## 1.2 The verdict, step by step (H12)

| Step | Rule | Value | Holds? |
|---|---|---|---|
| WITHHELD | more than 10% of the 1,299 unpriced or with a depth-short leg | 10 + 39 = 49, 3.77% | no |
| TOO FEW TO TELL | SE not computable, or fewer than 20 days or 10 coins | SE 40.91; 212 days; 35 coins | no |
| DOES NOT HOLD | m + z·SE < +50 | +82.56 + 2.58 × 40.91 = **+188.11** | no |
| HOLDS | m − z·SE > 0 and mean excess > 0 | **−22.99** (excess +103.66) | no |
| NOT SETTLED | otherwise | | **yes** |

The sentence (H12): "No mean result as large as 188.1 bps a position was
seen." Sources: `look/result.json`; recomputed in `out/stat.txt`.

## 1.3 The numbers (WAVE-H, net, bps of the $1,000 a position)

Source: `look/result.json` and `look/report.json`; every line recomputed in
`out/stat.txt` (the saved output of `scripts/stat.cjs`).

| Line | Value | Note |
|---|---|---|
| Positions | 1,299 | slice 0, 212 days, 35 coins |
| Priced | 1,289 | 10 unpriced, all "no book and no trade at the exit" |
| Depth short | 39 positions (40 legs) | priced; counted toward WITHHELD |
| **Mean net m** | **+82.557** | SE 40.910 |
| SE by day / by coin / by (day, coin) | 35.615 / 40.910 / 35.823 | 964 (day, coin) pairs |
| Band at z 2.58 | −22.99 to +188.11 | |
| Gross at the book | +92.33 | |
| Fees | −9.04 | 4.5 bps a leg of the notional |
| Funding | −0.73 | |
| Win share | 52.8% | |
| Median, quartiles | +23.81; −284.91 / +391.38 | index ⌊q·n⌋ |
| Entry's cost at the book | median 0.85, p90 4.80 | 1,138 book entries |
| Gross on marks | +95.87 ± 41.56 | |
| Excess over each coin's BASE | +103.66 ± 41.04 | low at z 2.58: −2.21 |
| Without the two days that add most | +51.62 | |
| One day left out | +67.05 to +89.35 | |
| One coin left out | +61.84 to +108.31 | |
| Busiest day 2025-10-10 | 50 positions (3.8%) | without it +81.08 ± 39.47 |
| Each day weighted alike | +48.38 ± 32.50 | 212 days |
| Five busiest days | 14.1% of the positions | |
| Tail (on the net) | worst day 2025-09-08 −6,140.6 over 4; largest fall from a peak 19,812.9; at most 56 open at once; worst position −4,906.1; worst 5% averages −1,796.1 | |
| Both legs at the book | 1,092 positions, +61.84 ± 42.94 | |
| A tape leg (priced from trades) | 197 positions, +197.38 ± 124.94 | |
| Legs by source | 2,281 at the book; 307 at the tape (81 "stale", 226 "no book file"); 10 with neither | of 2,598 |
| SIZING (2025-05-25 → 07-31) | 290 positions, 283 priced, −96.89 ± 65.53 | 7 unpriced: "funding without a mark" |

## 1.4 The lines beside (decide nothing; on marks, before costs)

Source: `look/report.json`; recomputed in `out/lines.txt` and
`out/compare-lines.txt`. "Excess" is the gross on marks less each coin's own
4-hour baseline (BASE, H10).

| Line | Positions | Gross on marks ± SE | Excess ± SE |
|---|---|---|---|
| WAVE-H itself | 1,299 | +94.9 ± 41.2 | +102.8 ± 40.7 |
| SIDES: forced sells | 1,050 | +121.9 ± 51.7 | +130.7 ± 49.4 |
| SIDES: forced buys | 249 | −19.0 ± 64.8 | −14.4 ± 65.1 |
| LATE 1 h | 1,299 | +33.0 ± 40.9 | +40.9 ± 40.4 |
| LATE 3 h | 1,299 | +32.7 ± 41.5 | +40.5 ± 40.7 |
| ALONE B1: every episode, every slice | 303,340 | +31.2 ± 21.4 | +35.6 ± 21.4 |
| ALONE B2: episodes without a wave | 167,603 | −6.3 ± 17.9 | −3.8 ± 17.8 |
| M halved (74) | 2,257 | +10.8 ± 35.2 | +16.9 ± 35.2 |
| M doubled (294) | 603 | +205.9 ± 104.6 | +214.5 ± 104.4 |
| EVERY SLICE, pooled | 176,986 | +66.1 ± 31.3 | +72.0 ± 31.3 |
| M by month (each month's own M) | 1,023 | +15.8 ± 48.5 | +21.5 ± 46.8 |
| The late coins (ZEC, LIT, PONS, CASHCAT, USELESS, XPL, XMR) | 141 | +139.2 ± 108.6 | +140.5 ± 108.1 |
| Entries from a backstop's fill (4 positions on 2 days: not a result) | 4 | +13,350 ± 4,458 | +13,359 ± 4,472 |

- **EVERY SLICE:** 146 of 147 slice means are above 0; the median slice is
  +64.5; slice 0 (+94.9) has 117 slices below it and 29 above.
- **By month** (on marks): Aug +41.4, Sep −34.5, Oct +149.0, Nov +146.3, Dec
  +148.0, Jan −67.7, Feb +312.7, Mar +187.3, Apr +140.3, May −28.6; 7 of 10
  above 0.
- **M by month** (each month's own M): 147, 190, 220, 268, 351, 250, 164, 172,
  150, 87.

## 1.5 What the result decides, and does not

- It decides nothing for MARKET-1 (decisions 2026-11-13, call 1): MARKET-1 runs
  on as frozen.
- WAVE-H's question is answered "not settled". Effects above about +188
  basis points a trade are ruled out on this test; an effect anywhere in the
  band, from −23 to +188, is neither shown nor excluded.
- After the look no number, line, coin, threshold, instant or rule of WAVE-H
  changes (H15). Anything found by exploring these months later is a lead,
  never proof; it is confirmed on data no rule has seen (decisions 2026-11-16).
- The test's reach is set by its design: one slice of 147 gives 1,299 trades
  and a standard error of 40.9 basis points, so at this error only an average
  above about +106 could have been called a hold (and, for a fail, one below
  about −56).

---

# Part 2 — Final review (WAVE-H-LOOK-REVIEW)

## 2.1 Verdict

**The look stands.** Every position, price, statistic, verdict and line I
recomputed is equal to the look's. The one difference is a printed median that
decides nothing (2.4); five remarks follow (2.5).

## 2.2 How it was recomputed (independence)

- **My spec was the rules' text:** `waveh/rules.md` and MARKET-1's
  `market1/rules.md` (M3–M13). I did not open WAVE-H's code, MARKET-1's, the
  research kit's or anything of `apps/poller/src` or `dist/` (I hashed the
  built files only, 2.3 item 20). Nothing was imported or copied. Data files
  of the repository used as input: `waveh/data.sha256`, `waveh/coins.json`
  (the asset ids, for H4's tie order) and `waveh/sizing.json` (the scan I
  compared with).
- **Language and libraries:** Node 24.13.0 (the machine has no other usable
  runtime), plain JavaScript, built-in modules only (`fs`, `crypto`, `zlib`
  for the look's gzip file, `worker_threads`). No package. **LZ4:** my own
  frame decoder written from the LZ4 frame and block format specifications
  (`scripts/lz4.cjs`): it checks the magic, version, reserved bits and the
  header checksum byte, accepts only independent blocks, bounds every block and
  offset, and verifies the frame's content checksum with my own streaming
  xxh32 (the published test vectors pass). All 12,118 lz4 files I read (8,845
  fill files, 370 `asset_ctxs` days, 2,903 held book files) have the same
  header (FLG 0x64, BD 0x70: independent blocks, a content checksum, 4 MB
  blocks; `out/flg.txt`), so every one was checked and none failed; each fill
  file is one frame. It shares nothing with `lz4js` 0.2.0.
- **What I share with WAVE-H:** the raw store (read only, every file held to
  its SHA-256 line), the rules' text, and Node's `JSON.parse` and hashing.
  Everything else is mine: the record scanner (tested against a full-line
  parse on 4 files, among them the 2025-10-10 21h file of 2.1 GB, 4.93 million
  records and 160,728 rows: identical), the order, slices, waves and entries,
  the marks, BASE, funding, books, tape, walks, net, CR1 variances, verdict and
  every line.
- **Runs** (all read only, idle priority, detached): one pass over the 8,845
  fill files, 218.3 GB, 2,658,921,516 records, 17:02Z–17:27Z at 147 MB/s from
  disk (6 workers); the marks (370 days) 17:06Z–17:09Z and the funding (760
  files) in a few minutes; the prices (books of 2,897 files, then the tape of
  317 legs) 17:29Z–17:36Z. `scripts/` holds every program, `out/` every
  output.

## 2.3 What was compared, and the result

| # | What | Mine | The look | Result (source in `out/`) |
|---|---|---|---|---|
| 1 | Fill files read, each SHA-256 held to its line of `data.sha256`; the list's fill keys against the key set built from H2's text | 8,845, 0 failed | 8,845 | equal (`pass1-progress.log`) |
| 2 | Records per file day | 2,658,921,516 in 370 days | `step1.counts.days` | 370 of 370 equal (`check-counts.txt`) |
| 3 | Liquidation objects; own fills; own fills in the 38 coins | 10,763,982; 5,381,991; 2,421,110 | | each liquidation has two legs: own = half (`counted.txt`) |
| 4 | Counted fills | 2,421,070 (SIZING 425,433, TEST 1,995,637); 40 own fills stamped from DATA END on unused; no (user, tid) twice (the hour both formats share, 2025-07-27 08h, holds no such fill) | `counted` 2,421,070 | equal |
| 5 | Counted by month and method; by coin and method (TEST before 2026-05-28, 1,985,568) | 23 and 68 cells | `legs`, `countedByCoinMethod` | 0 differ |
| 6 | Records from DATA END on | 303,852 | `late` 303,852 | equal (`check-late.txt`) |
| 7 | M from SIZING (H5) | 346 rows of the scan, M = 147 | `sizing.json` | 0 rows differ (`positions.txt`) |
| 8 | Positions, slice 0: t, coin, side, dir, x_in, x_out, entry method, the accounts of the wave | 1,299 WAVE-H, 290 SIZING | `positions.jsonl.gz` | 1,299 of 1,299 and 290 of 290, same order (`compare-positions.txt`) |
| 9 | Entries of all 147 slices in TEST | 176,986 | decisions 2026-11-17 | equal |
| 10 | Marks: rows of the 38 coins; off the minute; minutes served by two rows; from DATA END on | 17,618,289; 4,241; 3,118; 48,300 | `ctxs` | equal (`check-marks.txt`) |
| 11 | Minutes without a mark, per coin | 38 coins | `byCoin` | 38 of 38 equal |
| 12 | BASE: my cell against the BASE implied by the look's (grossOnMarks − excess) ÷ dir | 179 cells, 1,299 positions | | 0 differ (worst 8e-13) |
| 13 | Funding: rows (= settlements, per coin 8,857 for 30 coins, 7,749 PUMP, 5,723 ZEC, 3,777 LIT, 6,711 XPL, 3,208 XMR, none for PONS, CASHCAT, USELESS); settlements without a mark (92: 3 a coin for 30 coins, 2 for PUMP) | 292,878; 92 | `byCoin.funding` | 38 of 38 coins equal |
| 14 | Book files needed | 2,560 keys + 6 hour-before keys | `books-needed.txt` 2,566 | equal as sets (`check-books.txt`) |
| 15 | **Prices:** each of 1,299 + 290 positions: net, gross, fees, funding, funding hours without a row, gross on marks, excess, entry cost, depth-short flag, the unpriced reason, and each leg's source, reason, book file, snapshot time, age, price, deepest level, short flag and the tape's trade ids | 1,572 priced (1,289 + 283); 17 unpriced | `positions.jsonl.gz` | **1,299 of 1,299 and 290 of 290 equal on every field.** Largest differences: net 1.8e-12 bps, gross 1.8e-12, fees 1.8e-15, funding 1.9e-12; gross on marks, excess, entry cost and all 3,168 leg prices 0 (`compare.txt`, `maxdiff.txt`) |
| 16 | **Statistic and verdict:** n, m, SE (day, coin, two-way), days, coins, mean excess, not-at-the-book share, verdict, sentence | 1,289; +82.5568; 40.9102; 35.6149; 40.9102; 212; 35; +103.6596; 3.77%; NOT SETTLED; "…188.1 bps…" | `result.json` | equal (`stat.txt`) |
| 17 | Prints of H14 the decisions list: gross at the book, fees, funding, win share, median and quartiles, p90 of the entry cost, gross on marks and excess with SEs, without the two best days, each day and coin left out, the busiest day, days weighted alike, the five busiest days, most open at once, the tail, both legs at the book / a tape leg, SIZING | | `report.json` | equal, but the entry cost's median (2.4) |
| 18 | **Lines beside:** SIDES, LATE 1 h and 3 h, ALONE B1 and B2 (the control), M HALVED, M DOUBLED, EVERY SLICE (147 slice means, pooled), M BY MONTH, BY MONTH, THE LATE COINS, METHOD backstop | 782 fields | `report.json` | **0 differ**, worst relative difference 1.6e-13 (`compare-lines.txt`) |
| 19 | Sensitivity to the rules' fine print | 2.5 | | `sens.txt` |
| 20 | Integrity: `data.sha256` and `books.jsonl` hashes; the freeze list against the repository | `b66a9bb0…676c`; `5777e154…f16b`; 74 of 74 files | `dataSha256`, `booksSha256`; `864990da…8dd2` | equal (`integrity.txt`) |

## 2.4 Every difference

1. **The entry cost's median** (`report.json` `prints.entryCost.median`): the
   look prints 0.847363; the value at index ⌊n ÷ 2⌋ of the n = 1,138 sorted
   costs is 0.848248. The look prints the mean of the two middle values (the
   usual median for an even n), and with that definition mine is 0.847363,
   equal to the digit. M13 gives the index rule for the net's quartiles only
   (the net's median and quartiles are equal, n = 1,289), and says "(median,
   p90)" for the entry cost. A print that decides nothing; not a defect.

There is no other difference in any figure.

## 2.5 Remarks (none changes a number)

1. **The same-millisecond clause is not neutral.** M5 counts a fill of the same
   millisecond that sorts after the entry's fill in the wave state; both
   programs follow it. Without it slice 0 would have 1,295 positions: 23 of the
   1,299 would not exist and 19 others would (`out/sens.txt`). With the lower
   end of "the 60 minutes up to t" open instead of closed, nothing changes. For
   a future test, write the clause with one example.
2. **The marks' staleness bound is not decisive.** `markAtMinuteEnd` at most 5
   minutes stale: with 4 or 6 no position's gross on marks or funding changes;
   with 0 one position's gross on marks differs. The 7 SIZING positions without
   a funding mark are the same at every bound.
3. **How the verdict leans on parts of the data** (descriptive, per the
   look's own prints): positions priced from the tape average +197.4 (197
   positions; the archive's book holes on 2025-10-16 → 22 and 2025-11-17 → 25
   are in `report.json` `prints.bookHoles`) against +61.8 for the 1,092 priced
   at the book at both ends; without the two best days the mean is +51.6;
   slice 0's gross on marks sits at the 80th percentile of the 147 slices. All
   of it is inside NOT SETTLED.
4. **Print definitions:** besides the median (2.4), the share printed under
   EVERY SLICE `aboveZero` is a fraction (0.9932 = 146 ÷ 147), not a count.
5. **The frozen program is intact:** `sha256sum -c waveh/FROZEN.sha256` in
   `apps/poller` reports 74 of 74 files equal on today's build; the tag
   `waveh-freeze-1` is `9f99a0b`. The repository's HEAD has moved on since
   (FRESH-FETCH commits); none of the 74 files changed.

## 2.6 What I did not recompute

- `positionsSha256` (`a5506b86…85e5`): the rules do not define its serialization
  (24 simple forms tried, none matched: `scripts/try-hash.cjs`). I show
  instead that my positions equal the look's one by one.
- `step1.json`'s missing blocks of `node_fills_by_block` (54 over 10 days;
  not a stop condition in H2), the base-tier check (`topTakerBps`, 4.5 every
  month) and the book lines read and failing (14,816,801, 0): each needs a
  pass I did not make (the first two over every fill file again, the third
  over every line of the book files). Each book file I read was held to its
  line of `books.jsonl`, and I parsed the snapshot lines I used and dropped
  none as failing. The legs of WAVE-H and the late SIZING positions touch
  2,337 held files (2,560 keys, 223 missing from the archive), the look's
  `files.bookLines.files`; all 1,589 positions touch 2,897.
- The sealed SIZING outcomes file (`rehearsal/sizing-outcomes.jsonl.gz`): not
  opened. I priced all 290 SIZING positions afresh from the same data: all
  equal to the look's.
- `coins.json`'s asset ids and the "same asset" price check (read from
  Hyperliquid's API on 2026-11-14): the brief forbids a network call, so I made
  none; the ids were used as given for H4's tie order and agree with
  `docs/claude-external-apis.md` (SOL 5 … USELESS 233).
- The archive's own listing (which book keys are missing, 223): I took
  `books.jsonl` as it is.

## 2.7 Limits held

I opened only: the five files of `look\`; the store (`WAVE-H\store\`: fill
files, `asset_ctxs`, funding, the book files my legs needed, `books.jsonl`,
`manifest.jsonl` for sizes), read only; the repository's docs and rules;
`waveh/coins.json`, `sizing.json`, `data.sha256`; and, in the supervisor
folder, only my own `workers/WAVE-H-LOOK-REVIEW/` and `start-look.ps1` as an
example. I listed the names in the rehearsal folder and did not open them. I did
not run `dist/waveh.js` or `tools/waveh-fetch.cjs`, made no network call,
touched nothing of the collector's recordings or database, the run folder, the
paper experiment's or MARKET-1's data, started no agent and did not touch
polymarket-lab. Written in the repository: this report only.

## 2.8 Evidence

`workers/WAVE-H-LOOK-REVIEW/`: `progress.md`; `scripts/` — `lz4.cjs`,
`scan.cjs`, `pass1.cjs`, `marks.cjs`, `funding.cjs`, `counted.cjs`, `lib.cjs`,
`market.cjs`, `books.cjs`, `tape.cjs`, `positions.cjs`, `price.cjs`,
`lines.cjs`, `stat.cjs`, `compare*.cjs`, `maxdiff.cjs`, `check-*.cjs`,
`sens.cjs`, `selftest-*.cjs`, `flg.cjs`, `try-hash.cjs`, `start.ps1`; `out/` —
the saved outputs named above. The large intermediate files (`counted.json`,
`priced.json`, the per-file pass outputs) are in the scratchpad.
