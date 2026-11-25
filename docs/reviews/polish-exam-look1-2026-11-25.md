# POLISH-EXAM-REVIEW — look 1's report and its Final review (2026-11-25)

POLISH-EXAM-REVIEW (Sonnet 5.5, max), 2026-11-25 00:57–01:33Z (`date -u`), for the supervisor. It reviews
look 1 of the polishing's exam: the frozen program (tag `polish-freeze-1`, list `bd3ac6d3…f0fa`, program
fingerprint `4c9e5c9d…`) run on FRESH, 2026-11-24 → 25. The look's files were read only
(`ANALYZER\FRESH\look1\`, FRESH's store, FRESH's raw books); nothing was run from the exam's program, nothing
fetched. My own code (its folder: `workers/POLISH-EXAM-REVIEW/scripts/` in the supervisor's folder) imports
nothing from `apps/poller/src/`; what I reused from the two models is listed in section 9. The rules,
`polish/rules.md` P0–P17 with THE PLAN, were my specification; the exam's code was opened only after my
numbers were written, to explain differences (section 4.3).

One bps is 0.01%; +4.5 bps on a $1,000 position is 45 cents. "SE" is the error of the mean (MARKET-1's
two-way form, by UTC day of the entry and by coin).

## 1. The review's verdict: **the verdict stands**

WITHHELD is exactly what the frozen rules give for this data, and my independent code reaches it by its own
road: the same 3,078 positions, the same prices, the same 78 unpriced and 278 depth-short, the same 11.566%
(identical to the last digit), the same +4.459 ± 91.70. Of the 248 numbers of `result.json` and `report.json`
I recomputed, none is apart by more than 1e-9 relative (the largest, 5.6e-14), and all 5,930 positions of
`positions.jsonl.gz` match line by line (section 4). The identity chain, the order of the record, the 5%
tripwire and M11 are in order. The exam goes on to look 2, as M11 says.

Why 278 depth short and not 2.2% in all (question 2): not crash-hour depth. The archive's book snapshots became
rare (a gap of 0.54 s until 2026-06-14, 2.2 s for a few days, 5.4 s from late June, then from 2026-11-10 a
median gap of 11 s with silences of two minutes), so 28% of the legs (55% in November) found no live book and
were priced from 60 seconds of trades, where $1,000 often could not be filled. At the book not one leg was
short.

## 2. Findings, by severity

None of these changes the verdict, a number or the order of the record. M1 and M2 matter for look 2.

**High:** none.

**Medium**

- **M1. The WITHHELD projection could not see the archive's book cadence, and look 2 will meet it again.**
  The projection (P16, `withheld.json`) took each leg's chance of falling to the tape from the ten months
  (about 1–3% a leg); in FRESH it was 27.9% of entries and 27.8% of exits. By month of the entry the share
  not priced cleanly was June 0.3%, July 7.2%, August 4.4%, November 22.3%. The tape itself behaved as
  projected (section 5). Look 2's freeze may not change the price (P1, 3.), so if the cadence stays at
  November's, look 2 withholds again: with this look's segment 1 (1,622 positions, 1.9% not priced cleanly)
  and segment 2′ at November's 22.3%, the pooled share passes 10% once segment 2′ holds more than about
  1,070 positions (this look's 8 November days held 1,456). Section 8.
- **M2. The 5% tripwire cannot see book coverage.** It counts left-out positions and funding without a price,
  and read 0% at step 1 (0 of 3,078), as it should; the 11.6% that decided came from book and tape coverage,
  known only at step 2. The data to see it earlier existed: the file sizes of the fetched books (the first
  book file was fetched 2026-11-24 13:54Z; its size and the sizes of the next 3,118 are in `books.jsonl`) and,
  before the freeze, the size column of the archive listing that the supervisor already reads for the
  no-book days (external-apis, 2026-11-14: "the listing's Size"). I found no record in the docs that the
  `l2Book` sizes of the FRESH months were looked at, while the `asset_ctxs` sizes were (F7's thin days).

**Low**

- **L1. Option B cut whole days; the gaps are single hours of one coin.** The 61 book files the archive does not
  have are CASHCAT (60 hours) and LIT (1 hour), 2026-07-11 → 11-15; none is a whole day. 63 of the 715 line's
  positions (and 128 of N's) have a leg on one; 48 of the 278 depth-short and 2 of the 78 unpriced positions are
  among them (question 4).
- **L2. Two wordings read wider than the numbers.** The decisions entry of 2026-11-25 and the plan page say
  "11.6% … left out". In the rules "left out" is P8's holes, and there were none (`leftOut` 0); the frozen
  sentence itself says "left out, unpriced or depth short". Plainly: 78 unpriced and 278 depth short, none left
  out. And "the two best days' share … 11.2" is a multiple of the line's sum (+149,258 bps against +13,378
  bps), not 11.2%.
- **L3. "Extra over $1,000's" in the walks is the ratio of the walk prices, not the difference of the costs**
  (+2.5476 and +7.1792 bps against +2.5493 and +7.1841 as a difference). POLISH-EXPLORE-REVIEW found the
  same (its finding 9, 2026-11-19); a label only, and a print.
- **L4. One rule is read two ways, and no leg of this look depends on it.** H8 says the hour before's file
  is tried when the hour's file "holds none" within the first 10 seconds; the exam also tries it when the
  hour's file is listed missing; my reading (from WAVE-H-LOOK-REVIEW's model) did not. No leg of this look lies
  within 10 s of an hour start with a missing file, and the counts are equal.
- **L5. Print fields that differ from mine, explained by the code (section 4.3):** `file` is null for the 24
  "no snapshot" legs; `depthShort` stays false for unpriced positions; `entryCost` is printed for positions
  unpriced at the exit. No count of the verdict reads them.

## 3. The look's report, in plain words

**What was tested.** The 715 line: after a wave of liquidations, take the opposite side for 24 hours, only
when at least 715 different accounts had a forced fill in the hour before (slices 0–19 pooled), on FRESH's 100
deciding days (entries 2026-05-30 → 08-29 and 11-07 → 11-14; the discovery window apart; the no-book days
07-08 and 07-12 → 17 cut). It needs 20 days and 10 coins; it had 25 and 38. The bars: HOLDS at z 2.8467,
LIKELY at 2.3600.

**The verdict (look 1): WITHHELD** — "the data could not answer." Of the 3,078 deciding positions:

| | positions | share |
|---|---|---|
| left out (a hole in the data) | 0 | 0% |
| unpriced (no book and no trade: 77 at the exit, 1 at the entry) | 78 | 2.5% |
| depth short (a leg priced from too little size) | 278 | 9.0% |
| together | 356 | **11.566%**, above the 10% limit |
| priced | 3,000 | |

The priced positions average **+4.459 ± 91.70 bps** (seMarket 25.79; z 0.049), 25 days, 38 coins. Their bounds:
m − 2.8467·SE = −256.6 (HOLDS needs above 0), m − 2.3600·SE = −212.0 (LIKELY), m + 2.8467·SE = +265.5
(DOES NOT HOLD needs below +50). So, priced as it is, the line would read NOT SETTLED. The mean excess over
BASE is +15.04 (n 3,000); at the book on both legs the mean is −32.54 (n 2,082). Only HOLDS or DOES NOT HOLD
ends the exam (M11), so look 2 follows (about 2027-02-08, FRESH-2's data).

**The prints beside (P13; each one decides nothing; seeded lines were chosen after looking at E):**

| Print | n | mean ± SE (bps) | days | note |
|---|---|---|---|---|
| June 2026 | 1,034 | +1.6 ± 123.2 | 9 | |
| July | 83 | −73.0 ± 162.5 | 3 | |
| August | 505 | −267.0 ± 378.9 | 6 | |
| November | 1,378 | +110.7 ± 72.1 | 7 | |
| forced sells (we buy) | 2,715 | +83.4 ± 61.5 | 21 | z 1.36 |
| forced buys (we sell) | 285 | −747.5 ± 137.8 | 5 | 244 of them on one day, 08-19 |
| without the two best days | 2,581 | −52.6 ± 96.2 | 23 | 2026-11-08 and 08-22 |
| event level (one position a coin-episode) | 654 | −29.2 ± 77.5 | 25 | |
| both legs at the book | 2,082 | −32.5 ± 120.4 | 24 | |
| a leg at the tape | 918 | +88.4 ± 50.7 | 13 | |
| a leg depth short | 278 | +208.6 ± 126.3 | 10 | |
| no leg short | 2,722 | −16.4 ± 97.3 | 25 | |
| N, seeded | 5,826 | −35.4 ± 72.6 | 59 | |
| the 1,391 cut, seeded | 1,230 | +68.2 ± 182.3 | 13 | |
| at the tape, deciding line | 2,745 | −2.1 ± 96.1 | 25 | 333 unpriced there |

The two best days (2026-11-08, +96,677; 2026-08-22, +52,581 bps) add to 11.16 times the whole line's sum
(+13,378). The worst day is 2026-08-19 (244 positions, −208,258). In plain words: the line's total is a few
big days offsetting a few bad ones, and the depth-short positions, whose price rests on a thin slice of
trades, are the best-looking group (+208.6). That is why WITHHELD protects the reading.

## 4. My recomputation and its differences

### 4.1 How

My own code, from FRESH's built store (`ANALYZER\FRESH\store`, every column file held to its size and SHA-256
in the manifest `0f2d550d…ecf1`) and FRESH's raw books (every file held to `books.jsonl` `3cce772e…ca41`), steps
A–G: the counted fills (H4) and their order; the slices (H5); the entries (M5) and W4's feature; the minute
price (mark, back-fill 5 minutes, the last non-backstop trade); BASE; the holes (from `files.jsonl`); the
positions and their `where`; the tape levels of every leg; the book first (H8: the last snapshot ≤ x, live
within 10 s, usable); the walks; fees and funding; the two-way SE; the verdict ladder (P11). One heavy run at
a time, below normal priority, 01:05–01:27Z, each under 2 minutes.

### 4.2 The known answer, first (E from the explored store, read only)

| | mine | the known answer (repro.json (b) "deciding", placebo.json, cuts.json, POLISH-EXPLORE-REVIEW) |
|---|---|---|
| entries in TEST / B0's E entries | 176,986 / 148,154 | 176,986 / 148,154 |
| W4 cuts, type-7 quantiles 0.5 / 0.75 / 0.9 | 336 / 715 / 1,391 | 336 / 715 / 1,391 |
| the 715 line: positions / priced | 5,067 / 4,310 | 5,067 / 4,310 |
| unpriced: entry / exit / funding | 39 / 602 / 116 | 39 / 602 / 116 |
| m | 203.35897184348997 | 203.3589718434901 (1.4e-13) |
| SE / seDay | 79.08321017007263 / 71.6970958771532 | 79.08321017007256 / 71.69709587715313 |
| days / markets | 51 / 33 | 51 / 33 |

The largest relative difference is 1.6e-15 (limit 1e-9).

### 4.3 Look 1 on FRESH

| What | Mine against the outputs |
|---|---|
| counted fills by month and method (step 1 `legs`) | equal: 1,183,083 in all |
| positions by where, four lines (`positions`), `onDeciding` 3,078 / 1,262 / 5,930 / 12,591 | equal, every cell |
| the 23 holes; left out 0 for N, 11 for B0 (a hole in the hour up to t) | equal |
| the safety net: 25 days, 38 coins | equal |
| the minute price's trade fallback, 2,289,347 minutes of the 38 coins, by coin and day | equal, 2,546 cells (BTC and ETH not built) |
| books needed: 3,180 keys (x's hour, and the hour before within 10 s of an hour start) | equal to `books-needed.txt`, both ways; 61 listed missing |
| legs: book 9,279, tape 2,203 stale, 24 no snapshot, 250 no file, none 104 | equal |
| the 5,930 positions, line by line | all present both ways; in715, in1391, dir, side, x_in, x_out, tid, method, where, left, each leg's source, why, age, snapshot time, trades, unpriced reason, deepest level, short: **0 differences**; net ≤ 2.6e-12 bps, gross ≤ 4.5e-13, fees ≤ 1.8e-15, funding ≤ 2.6e-12; gross on marks, excess, p_out, ages exact |
| `result.json`: positions, leftOut, unpriced, depthShort, priced, share, stat, bounds, excess, at the book, bars, verdict, sentence | equal; share 0.11565951916829109 identical |
| `report.json`: months, sides, concentration, event level, segments, source, depth, tail, N, the 1,391 cut, the line at the tape, the discovery window and the days cut at the tape, slice 0, leave-one-out, walks | 248 numbers: none apart by more than 1e-9 relative |

**The largest difference:** 1.5e-10 in absolute size (the worst day's sum, −208,258.27205590912 against
−208,258.27205590924, 6e-16 relative); in relative size 5.6e-14 (June's mean, a number near zero); the
headline m differs by 9.5e-14 bps (4.459367023530142 against 4.4593670235300475). Nothing is apart by more than
rounding; the PC's memory flips were not met (section 9).

**Differences I met and explained** (after reading `src/polish/exam/price.ts`, only these lines): the look
writes `file: null` when a leg has no snapshot (24 legs), where I name the file examined (price.ts line 92);
it sets `depthShort` only after both legs are priced (line 196), so 7 positions unpriced at the exit with a
short entry read false (they are counted once, as unpriced; mine read true); it prints `entryCost` at the entry
step, before the exit is tried (20 positions). The walks' "extra" is the ratio of walk prices (L3). The hour
before's file is tried also for a missing hour file (L4).

### 4.4 The chain, the record, the tripwire, M11, the decisions

- **Identity chain:** 54 hash checks, 0 different. `result.json`, `step1.json`, `repro.json`, `builds.json`,
  `integrity.json`, `books-needed.txt`, `gates.json`, WAVE-H's list, `polish/FROZEN.sha256` (equal to
  `git show polish-freeze-1:…`, commit `13dc55c`, annotated tag), `fresh.sha256`, both store manifests,
  `books.jsonl`, `placebo.json` (`c25345f7…`), the explored files named by `repro.json`, and the truncated
  hashes of the decisions entries.
- **The order of the record:** the decisions entry of 2026-11-24 (`8d9e094`, step 1's counts) was committed
  2026-11-24 13:49:31Z. Step 1 had finished at 13:44:45Z; the first book file was fetched at 13:54:44Z; step 2
  started 2026-11-25 00:28:26Z. So the counts were on record before any price existed and 10 h 39 min before
  step 2. Step 2's log has only phase lines until `result.json` was written (00:42:36.516Z); the first outcome
  line follows 24 ms later (00:42:36.540Z), as H15 requires.
- **The tripwire** read 0 of 3,078 at step 1 (0 left out, 0 funding without a price) and step 2 left out 0, so
  it held; it cannot see the unpriced and depth-short parts (M2).
- **M11:** WITHHELD is not HOLDS or DOES NOT HOLD, `exam` is null in `result.json`, so look 2 runs.
- **The decisions entries** of 2026-11-24 and 25 state every number I could check as the outputs hold it
  (the run times, 1,979 + 1,140 = 3,119 files fetched, 61 missing, 7,843 files in the builds, the reproduction's
  (a), (b), (c), the counts, the verdict, the prints) except the two wordings in L2.

## 5. Question 2 — why depth short was 278 (9.0%), and not near 2.2%

**The short answer.** Not crash-hour depth. The 278 positions have 289 short legs, **all priced from the tape**
(236 after a book too old to use, 53 where the archive has no book file for that hour). At the book, 2,202
entries and 2,222 exits were walked: **0 short**. The thinnest 20-level book on our side held $4,158, the
median $112,700; the largest exit at the book was $1,504. The tape fell short because it is thin: in the 60
seconds after the leg the takers on our side held a median **$253** of the $1,000 needed (25th percentile $69,
75th $588); 85 of the 289 legs got under 10% of the size.

**Why so many legs reached the tape: the archive wrote far fewer snapshots (print, decides nothing).** From the
book files my legs needed (all 3,119 held files; the ten months from a 264-file sample of WAVE-H's store):

| Period (files read) | files | snapshots a file (median) | median gap | 90th-percentile gap | live share of the hour (median) | file size (median) |
|---|---|---|---|---|---|---|
| the ten months, 2025-05 → 2026-05 (a sample) | 264 | about 6,500 | 0.54 s | 0.6 s | 1.00 | 0.65–1.4 MB by month |
| FRESH 2026-06-02 → 06-14 | 788 | 6,657 | 0.54 s | 0.57 s | 1.00 | 865 KB |
| 2026-06-15 → 06-19 | 123 | 1,662 | 2.16 s | 2.2 s | 1.00 | 335 KB |
| 2026-06-23 → 11-09 | 1,395 | 670 | 5.39 s | 5.5 s | 1.00 | 169 KB |
| **2026-11-10 → 11-15** | 813 | **71** | **10.95 s** | **128.8 s** | **0.15** | **23 KB** |

(Live share: the part of an hour in which the last snapshot is at most 10 s old, the exam's liveness line.
No file was read for 06-20 → 06-22 or for 08-30 → 11-06, so the dates of the steps are bracketed by the files
the legs needed.) From 2026-11-10, 64% of the files are live less than half the hour; the median gap rises
from 8.1 s on 11-10 to 12.4 s on 11-14. A stale snapshot's age had a median of 61 s (25th percentile 35 s,
90th 116 s).

**Legs of the 715 line by month (as frozen):** legs 6,156; at the book 4,442 (72.2%), at the tape 1,714.

| Month of the leg | legs | at the book | stale | no snapshot | no book file |
|---|---|---|---|---|---|
| 2026-06 | 2,068 | 2,030 | 19 | 19 | 0 |
| 2026-07 | 166 | 154 | 0 | 0 | 12 |
| 2026-08 | 1,010 | 956 | 0 | 0 | 54 |
| 2026-11 | 2,912 | 1,302 | 1,545 | 5 | 60 |

Entries and exits are alike in November (790 of 1,456 entry legs, 820 of 1,456 exit legs at the tape), so the
cause is the month, not the hour after a cascade. (A small crash effect shows in June, when the cadence was
normal: 35 entry legs against 3 exit legs at the tape, 3.4% against 0.3%.)

**The 278 depth-short positions (print):**

- By leg: exit only 243, entry only 24, both 11 (289 legs: 254 exits, 35 entries). By month of the leg:
  November 258, August 22, July 6, June 3.
- By day of the leg: 2026-11-15 134, 11-14 70, 11-13 27, 11-11 23, 08-23 19, 07-28 6, others 10.
- By hour of the leg (UTC): 03h 50, 16h 48, 20h 35, 15h 30, 21h 25, 13h 22, 04h 19, 05h 19, 22h 16, 14h 13,
  17h 8, 02h 3, 23h 1 (the hours of the waves and, 24 h later, of their exits; no hour is special).
- By coin (legs): CASHCAT 53, DOGE 19, SUI 18, ARB 18, UNI 18, TAO 17, WLD 15, XRP 14, ENA 13, LTC 12, XPL 12.
  CASHCAT's 53 sit mostly on its 60 missing book hours (question 4).
- The 78 unpriced positions are all November (exit days 11-15: 49, 11-14: 14, 11-13: 11, 11-11: 4): 58 with both
  legs stale, 2 with both files missing, 18 with the book at the entry and a stale exit; in the 60 seconds
  after the exit no taker traded on our side.

**What the projection did and did not get right.** It computed WITHHELD from three rates: a leg's chance of
reaching the tape, the tape's chance of being short or empty, and the funding gaps. The tape's rates held:
tape-priced entries short 3.0% in E against 4.3% here (37 of 858), exits short 23.5% against 29.7% (254 of
856), exits with no trade 12.2% against 9.0% (77). The first rate was the miss: 2.2% of entries and 0.7% of
exits reached the tape in the ten months (E's slice 0, `bookRates`), here 27.9% and 27.8%. The funding gaps
(2.4% projected, 116 of E's 5,067 positions had a settlement minute with neither a mark nor a trade in the
5 minutes before) did not occur in FRESH (`fundingWithoutPrice` 0 at step 1; every settlement the positions
needed had a mark or a trade). So a projected 2.2% was funding gaps; the actual 11.6% is tape coverage.

**How a later test could size or price so that it is not caught (prints on seen months; they decide nothing,
and any rule built on them is its own frozen test on months not yet seen).** The same 3,078 positions, the
frozen walk, one thing changed at a time:

| Variant | unpriced | depth short | share |
|---|---|---|---|
| as frozen ($1,000; tape 60 s; live 10 s) | 78 | 278 | 11.57% |
| $500 | 78 | 198 | 8.97% |
| $250 | 78 | 138 | 7.02% |
| $100 | 78 | 84 | 5.26% |
| tape window 5 minutes | 1 | 96 | 3.15% |
| live up to 60 s | 49 | 189 | 7.73% |
| live up to 120 s | 8 | 77 | 2.76% |

Size alone does not cure it (84 positions are still short at $100); the book never was short at $1,000. A
longer tape window or a looser liveness limit does most of it. In none of these variants does the line come
near a verdict: m stays about +4 to +9 ± 90 (m − z·SE about −250, m + z·SE about +265), so it would read NOT
SETTLED, not HOLDS. (The mean for the size variants is not comparable and is not shown.) The simplest
protection for a later test is earlier: read the archive's book-file sizes month by month before the price is
frozen, and project WITHHELD from that month's cadence, not from older months.

## 6. Question 3 — the prints beside, confirmed (each decides nothing)

- **The two sides, confirmed:** forced sells +83.4 ± 61.5 (n 2,715, 21 days, z 1.36); forced buys −747.5 ± 137.8
  (n 285, 5 days). The two differ by about 830 bps, and the buys are one event: 244 of the 285 are on 2026-08-19
  (mean −853.5, sum −208,258 of the buys' −213,040). The sells: 17 of 21 days and 28 of 38 coins positive; best
  days 2026-11-08 (258 positions, +96,677), 08-22 (158, +52,481), 06-02 (153, +40,620), 11-10 (164, +35,118);
  worst 06-04 (228, −104,890), 11-13 (191, −16,018), 06-23 (75, −14,782). Worst coins for the buys: XRP −1,755
  a position (24), HYPE −1,095 (36), PUMP −979 (32). The buys have 4 positive coins of 31.
- **The months, confirmed:** table in section 3 (June, July, August, November: +1.6, −73.0, −267.0, +110.7);
  segment 1 −85.8 ± 147.6 (n 1,622, 18 days), segment 2 +110.7 ± 72.1 (n 1,378, 7 days).
- **N and the 1,391 cut, confirmed (book first, slices 0–19, deciding days, seeded):** N −35.4 ± 72.6
  (5,826 priced, 59 days); the 1,391 cut +68.2 ± 182.3 (1,230, 13 days; its two best days, 2026-11-14 and
  11-08, are 2.34 times its sum). N's sum is negative, so its "share" has no meaning. Every number equals the
  report's.
- **The concentration, confirmed:** the line's sum is +13,378 bps; its two best days, 2026-11-08 (+96,677) and
  2026-08-22 (+52,581), add to +149,258, 11.157 times the sum; without them −52.6 ± 96.2 (n 2,581, 23 days).
  The event-level line (the earliest priced position of each coin-episode of FRESH's counted fills, in time and
  slice order, 654 episodes) is −29.2 ± 77.5. Leaving out one day moves the mean from −30.4 (2026-11-08, the
  best day, out) to +80.4 (2026-08-19, the worst day, out); leaving out one coin, from −6.8 (VVV out) to +18.3
  (XRP out). The walks of the entry books: cost against the mid $1,000 +3.24 ± 0.65, $10,000 +5.79 ± 1.36,
  $50,000 +10.42 ± 2.47 bps (n 2,220; 0 / 21 / 353 short; 858 entries not walked: 773 stale, 22 no snapshot,
  63 no file); the extra over $1,000's is the ratio of the walk prices (L3).

## 7. Question 4 — the 61 missing books

- **Which:** CASHCAT 60 hours, LIT 1 hour (2026-07-11 22h). By month: July 9 (CASHCAT 8, LIT 1), August 26,
  November 26. CASHCAT's hours, UTC: July: 07-19 15h, 23h; 07-20 00h, 15h, 23h; 07-21 00h; 07-27 22h; 07-28
  22h. August: 08-03 18h; 08-04 18h; 08-05 22h; 08-06 12h, 22h; 08-07 12h; 08-09 13h, 14h; 08-10 13h, 14h;
  08-19 15h, 22h; 08-20 15h, 16h, 17h, 22h; 08-21 16h, 17h; 08-22 05h; 08-23 05h; 08-25 00h, 13h; 08-26 00h,
  13h; 08-28 16h; 08-29 16h. November: 11-08 17h, 21h; 11-09 17h, 21h; 11-10 16h, 17h; 11-11 16h, 17h, 23h;
  11-12 23h; 11-13 03h–05h; 11-14 02h–05h, 14h, 16h, 20h, 21h; 11-15 02h, 14h, 16h, 20h, 21h. Each is one
  coin-hour, never a whole day.
- **How many positions:** each of the 61 keys is needed by at least one leg. They touch 253 legs of N's 5,930
  positions (128 positions) and 126 legs of the 715 line (63 positions): 2 of the 78 unpriced and 48 of the 278
  depth-short are among those 63. The archive lists them as not in their hour folder (`listedAt` 2026-11-24
  13:54:43Z); 3,119 of 3,180 keys were fetched, 3,113 read.
- **Reading:** a thin, illiquid coin (CASHCAT) has hours with no book file; the cut for days without books
  (option B) catches a whole day only. These 63 positions went to the tape, and CASHCAT's tape is thin.

## 8. What it means for look 2 and any later test (notes; no code)

1. **Look 2 may withhold again.** Its freeze may change only what P1 3. names, not the price or the verdict. The
   book cadence of 2026-11-10 → 15 (live 14–21% of the hour) is the newest the archive showed. Look 2 reads
   segment 1 again and segment 2′ (2026-11-07 → 2027-02-06). With segment 1's 1.9% and a November-like 22.3%,
   the pooled share passes 10% when segment 2′ has more than about 1,070 of the 715 line's positions
   (2026-11-07 → 14 alone had 1,456). If the cadence has returned to 5.4 s or faster, the share falls toward
   June's and July's levels (0.3% to 7%).
2. **Before FRESH-2 is downloaded or read, list the `l2Book` sizes** of 2026-11-16 → 2027-02-06 (metadata only;
   the listing carries each file's size) and decide on that alone whether look 2 runs as frozen. The cadence is
   a fact of the data, not an outcome of the exam; a decision made on it is not chosen by what the line earned.
3. **A later test** fixes its liveness and fallback against the cadence it will meet, from the listing's
   sizes: the ten months were 0.54 s, mid-2026 5.4 s, November 8–12 s with gaps up to 2 minutes. A tape
   fallback of 60 seconds cannot fill $1,000 in an illiquid coin; at the book $1,000 is never short.
4. **A coverage tripwire** at step 1: the share of the legs' coin-hours whose file is missing or holds fewer
   than a fixed number of snapshots, read from `books-needed.txt` and the listing, before any price.
5. **The projection's rates** (P(tape), P(short | tape)) come from the months being tested, not from older
   months; the tape's own thinness (about 4% at entries, 30% at exits) was right and can be reused.
6. **The look's two prints worth keeping in mind** (decide nothing): the 278 depth-short positions average
   +208.6 against −16.4 for the rest; the line's mean at the book on both legs is −32.5. A reading that
   leans on thin-tape fills would be flattering.
7. **Record these in the files** (the supervisor's call): the archive's cadence by date in external-apis
   (dated, with the source `books.jsonl` and my scratch output), and a line in decisions on look 2's
   condition.

## 9. Method, limits, what I reused

- **Reused, read first and copied:** `lz4.cjs` unchanged from WAVE-H-LOOK-REVIEW (SHA-256 `e465cc8a…4673`, an
  LZ4 decoder written from the format specification that shares nothing with lz4js); the store reader (every
  column held to the manifest) and the CR1 two-way error from POLISH-EXPLORE-REVIEW's `store.cjs`; the walks
  and the net from WAVE-H-LOOK-REVIEW's `lib.cjs`; the book file reader from the models' `books.cjs`, adapted
  to FRESH. Everything else (counted fills, slices, entries, W4, minute price, BASE, holes, positions, `where`,
  the tape levels, the book first, the verdict ladder, the prints, the cadence, the what-ifs) was written
  fresh from the rules. Nothing was imported from `apps/poller/src/polish/` or `src/waveh/`.
- **Runs:** nothing started in the closed windows; no network; the exam's program, `dist/waveh.js` and the
  fetch were not run; FRESH was not written to; the collector's, the paper experiment's and MARKET-1's data
  were not opened; no agents started. Each run was under two minutes (the longest, the books, 81 s) at below
  normal priority. The ceiling was 12 GB; the measured peaks (maxRSS) were 274 MB (books), 582 MB (the tape of
  FRESH), 806 MB (the tape of E) and 588 MB (the counted fills), so no limit was near. A second run of the
  tape, books and counted-fills steps gave byte-identical arrays (SHA-256 equal), so the PC's memory flips
  were not met (every count that must be whole is whole and equals the exam's).
- **Not recomputed:** BTC's and ETH's moves, OWN (those need the 40 coins' minute prices; BTC and ETH are not
  in my build), the lines at the tape on all 147 slices and B0, the base-tier fee check, the placebo's
  percentiles (copied from `placebo.json`, itself held by SHA-256 to rules.md), the run's seconds and peaks.
- **Cadence figures** are from the book files my legs needed (FRESH: all 3,119 held files; the ten months: a
  264-file stratified sample of WAVE-H's 2,903); a day with few files (2026-11-07) is thin evidence. The
  what-ifs change one rule at a time on seen data; the means of the size variants are not valid because my net
  divides by $1,000.
- **Scripts and outputs:** `workers/POLISH-EXAM-REVIEW/scripts/` (`a-counted.cjs` … `o-whatif.cjs`, `lib.cjs`,
  `books.cjs`, `lz4.cjs`) and `out-summary/` (the compared numbers); the big arrays stayed in the scratchpad.
