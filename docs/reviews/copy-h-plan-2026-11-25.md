# COPY-H-PLAN — COPY-H, the paper experiment's question tested on Hyperliquid's history: the gate, the rules, the data, the build

COPY-H-PLAN (Opus 5.5, max), 2026-11-25 11:51Z – 13:02Z (UTC; every stamp from `date -u`), for
polymarket-follow's supervisor. The frame: decisions 2026-11-25, "the owner's talk after look 1"
(ruling 1); the plan page, "After WAVE-H's answer", item 4; the coordinator's three messages of
2026-11-25 (after the blue screen of 12:15:41Z: runs short, resumable, at idle; the owner's "room to
filter, test, then filter again"; FABLE-REVIEW's twelve points, H3 and M2; HL-FOLLOW-FACTS for the
costs, the delay, vaults and venues). Evidence: the supervisor folder's `workers/COPY-H-PLAN/`
(`progress.md`, `scripts/`, `out/`; section 11). **This is a plan: nothing is built before a fresh
review and the owner's yes.**

**No outcome was computed.** On no month was a profit, a return, `closedPnl`, a price move after a fill
or a copy's result computed or read: every record was parsed with a reviver that drops `closedPnl`,
`fee` and `builderFee` before any object holds them. Measured: sizes, counts, shapes, labels and
habits (holds, sides, sizes, coins), the tape's coverage and its spread (two prices at the same moment).
Section 11 lists every file opened, so that the review can judge any leak. Runs at idle or below
normal, one at a time, none in the closed windows; after the crash each under 5 minutes (the longest
287 s). No network, no download, no agent; F: read only; polymarket-lab untouched. The one run that
was live near the crash (s5, 12:12–12:13Z) had ended on its own error two minutes before it; its output
is not used.

## The gate (FABLE-REVIEW H3) — for the owner, first

*Words.* A **copy** is the position a follower would have opened about 80 seconds after a trader
opened one, leaving when the trader leaves. A **bp** is 0.01% of the copy's $1,000. **MAIN** is the
paper experiment's main line, unchanged: traders the frozen classifier calls "directional" on the 14
days before the week, who usually hold 6 hours or more and closed at least 3 positions in the 30 days
before.

1. **Most likely verdict: DROP** — copying MAIN's traders does not pay a taker on Hyperliquid either.
   Every earlier measurement of this kind lost about a round trip of costs (X3 −9.9 ± 9.1 bps a copy,
   FIND-6-EXITS −15.8 ± 4.9, R8 −20.2). At −10 the chance of DROP is 99–100% (72% in a stress case).
2. **The chance of a clear answer** is high wherever the truth is likely to be: at −10, 99–100%; at 0,
   DROP 52–96% (18% in the stress case); if a real +15 bps exists, KEEP 90–100% (43% in the stress
   case). Only a true edge between about 0 and +10 bps (−5 to +15 in the stress case) would most likely
   read TOO FEW TO TELL. **The gate passes.**
3. **What each answer means:** DROP closes copying on both venues, with no polishing (FABLE-REVIEW's
   stop rule). KEEP is confirmed once on FRESH-2's unseen months before anything is built on it; then
   v1 becomes a watcher of the accounts the rule picks, watch-only. Its worth depends on where you
   could act (question 3).

**The power, from counts only** (`out/s9-power.txt`). The counts come from a 1/32 slice of every
Hyperliquid account; the error per day is borrowed from Polymarket's X3, never from these months.

| Design | Copies a week | Days judged | SE, bps (low / high / stress) | Edge seen 4 in 5 | P(DROP) at −10 | P(KEEP) at +15 | P(KEEP) at +20 |
|---|--:|--:|---|---|---|---|---|
| The paper experiment at 2027-05-08 (for scale) | ~131 | 182 | 7.1 | 21 | — | — | — |
| **A** — MAIN, one look on every month (z 2.58) | ~39,000 | 504 | 2.4 / 4.1 / 6.7 | 8 / 14 / 23 | 100 / 99 / 66% | 100 / 87 / 37% | 100 / 99 / 66% |
| **Hybrid** — MAIN, look 1 on E (z 2.81), look 2 on E + S (z 2.43) | ~39,000 | 333, then 504 | 3.0→2.4 / 5.0→4.1 / 8.2→6.7 | 8 / 13 / 22 at look 2 | 100 / 99 / 72% | 100 / 90 / 43% | 100 / 99 / 72% |
| **B** — a filter explored on 217 days, confirmed once on 116 (z 2.24), judged once on 171 (z 1.96) | ≤ 39,000 | 171 | 4.2 / 7.0 / 11.5 | — | — | 73 / 18 / 3% (passes both) | 96 / 45 / 9% |
| **Hybrid's rounds** — a filter chosen on E, confirmed once on S (z 2.24), sealed once on 180 days of FRESH-2 (z 1.96) | ≤ 39,000 | 171, then 180 | 4.1 / 7.0 / 11.5, then 4.0 / 6.8 / 11.2 | — | — | 88 / 28 / 5% (passes both) | 99 / 61 / 13% |

- *low / high:* X3's day spread split by its own errors: a common part of at least 54 bps, its whole 91
  bps. *stress:* 150 bps, for a line that leans harder one way than X3's: 66% of MAIN's entries were
  long in the sample week. KEEP's other conditions (C12) are taken to agree.
- **Why so much power:** Hyperliquid holds about 140 times the paper experiment's line (about 39,000
  MAIN copies a week against 284). Single copies' noise averages away, so only the market's own daily
  move is left. 504 judged days then give an error of 2–7 bps a copy.
- *A filter chosen among many tries carries the winner's curse:* its true edge is below what the
  explored months show, so the chances for B and for the hybrid's rounds are upper ends.
- *A MAIN KEEP's confirmation* on 180 days of FRESH-2 alone (z 1.645) comes through for a true +15
  bps 98 / 71 / 38% of the time.

**The recommendation in five lines**
1. Test the paper experiment's MAIN unchanged on every Hyperliquid account over about 72 weeks
   (2025-06-30 → 2026-11-15). Both readings; R8's delay; base-tier taker costs. MAIN alone decides.
2. One price source for every month: the tape (each minute's trade price, a spread measured from the
   tape, the 4.5 bps fee), plus Hyperliquid's settled funding for every coin. That needs a small keyless
   fetch, with your yes. No order book.
3. The hybrid schedule. MAIN's look 1 is on WAVE-H's months (E). Then your filter rounds, at most 3,
   on E only. Then look 2 on E + FRESH's months (S), where at most two chosen filters are confirmed
   once. FRESH-2's months (from 2026-11-16) stay unseen until a yes needs confirming.
4. The gate from counts: the most likely verdict is DROP (about 99%). A +15 bps edge would read KEEP
   about 90% of the time (43% in the stress case).
5. The build: a sixth entry point reusing the analyzer's decoder and the paper's frozen kit, the store
   built twice, runs resumable at idle. About 17 sessions through look 2 (A: about 14), about 4,500
   lines with tests.

**The tension, laid out** (question 1).
- FABLE-REVIEW: MAIN unchanged, every month a test month, no explore and check split (where the
  polishing lost its way, its M1).
- You: room to filter, test, and filter again before the final test.
- **A** answers the paper's question with the most power and the least build. Your rounds would then
  come only after its verdict, judged on months not yet downloaded.
- **B** spends the 18 months on a filter search. Its one judgment sits on 171 days, so a modest real
  edge is unlikely to come out clear, and the paper's own question gets a weaker answer.
- **The hybrid** keeps FABLE-REVIEW's deciding line whole, at A's power (the table), and gives your
  rounds months that never judge them:
  - E for exploring, after MAIN's look 1 on E is recorded;
  - S for the one confirmation;
  - FRESH-2 for the one sealed judgment.
- Its price is one more seal and step: about three sessions over A.

---

## 1. The question, the deciding line, and what each verdict means

- **The question** (the founding one, decisions 2026-11-06): does copying the paper experiment's MAIN
  traders pay a follower who copies after R8's delay, exits copied, at a taker's real costs? The test
  runs on Hyperliquid's archive, every account, and judges what follows each week's choice only.
- **The deciding line:** MAIN, exactly as `apps/poller/experiment/rules.md` R7 defines it. It was
  frozen on 2026-11-12, before Hyperliquid was thought of, so no Hyperliquid month can have shaped it.
- **KEEP:** on about 72 weeks nobody had studied for this question, copying MAIN's traders earned more
  than a taker's costs. It was not the market's direction (d > 0), not a few days and not a few traders
  (C12). It is then confirmed once on FRESH-2 before v1 is built on it.
  - **Which traders:** the accounts in MAIN at the latest Monday, about 13,900 at the sample's scale.
    That is far too many to copy, but the verdict is about the rule, so a follower taking a random
    handful of them each week keeps the same expected edge a copy, with more noise.
  - **How to watch them:** their fills are public by address (the channels from HL-FOLLOW-FACTS).
    The app shows them and never trades (Iron Rules 1 and 6).
- **DROP:** it did not earn +10 bps a copy. With Polymarket's results, copying is closed on both venues
  (FABLE-REVIEW's stop rule). No variant of it is polished on these months. The paper experiment's own
  looks run on as frozen.
- **TOO FEW TO TELL:** "no mean result as large as X bps a copy was seen", X being the largest mean not
  ruled out. Copying is treated as not shown to pay.
- **WITHHELD:** more than 2% unpriced. The data could not answer; a repair would be a new frozen test.
  The coverage tripwire (C16) makes this unlikely: 0.01% of instants lacked a price in the sample.

## 2. The draft rules — `apps/poller/copyh/rules.md`, C0–C17

*To be frozen by hash before any copy is priced. Where a rule says "R…, unchanged", it means the paper
experiment's rule word for word, run by the vendored kit and lib-exits byte for byte.*

**C0. Identity and what is frozen.**
- COPY-H is the paper experiment's question on Hyperliquid's archive. Its one deciding line is MAIN;
  every other line is beside and decides nothing. It decides nothing for the paper experiment, which
  runs on as frozen.
- **Frozen together** (`copyh/FROZEN.sha256`, tag `copyh-freeze-1`): `dist/copyh.js` and
  `dist/copyh/`; the compiled files it imports; `research/` byte for byte (the kit `2d3667b5…09aa`,
  lib-exits `612d5836…6330`); and `copyh/` (this file, `coins.json`, `dirs.json`, `vaults.json`,
  `data.sha256` with every raw file read and its SHA-256, `funding.sha256`).
- Every step checks the list first (exit 4 when it differs). A defect is fixed by R0's route, never by
  a number of this file.
- **The seals** (one function):
  - before the freeze, no copy's result is read on any month: the rehearsal's priced copies are
    written sealed and unread;
  - step 1 reads WAVE-H's store only;
  - FRESH's store (S) is not opened at all until step 2, whose pass reads it;
  - FRESH-2 is not downloaded before step 2's report is recorded.

**C1. Instants.**
- ARCHIVE_START is 2025-05-25T14:00Z, the first fill file. M₀ is 2025-06-30, the first Monday with 30
  days of the archive before it.
- **E** holds the entries with t in [M₀, END_E), END_E = 2026-05-29T02:00Z (the end of WAVE-H's store).
- **S** holds t in [END_E, END_S), END_S = 2026-11-16T00:00Z (FRESH_END).
- **FRESH-2** holds t ≥ END_S. Its end is fixed in step 2's report by C14's arithmetic.
- Look 1 has END = END_E and judges E's copies. Look 2 has END = END_S and judges E ∪ S, cumulative.
  An exit at or after END is "crossing" and is marked at END − 1 ms (R8).
- Weeks, a Monday M, windows [a, b) and milliseconds as R1. Times are a fill's `time`, never a file's
  hour.

**C2. Who.**
- **Every account** of Hyperliquid's main perp dex: every `user` of the archive's records,
  lower-cased. No pool list and no holdout, so nobody chooses who.
- Left out, named and counted: the protocol vault's accounts, meaning any account with a fill whose
  `dir` is "Net Child Vaults" (`vaults.json`, written before the freeze).
- Other vaults and sub-accounts are accounts like any other. Each address stands alone, with no
  linking.
- No arm F: the owner's favourites are Polymarket accounts. A Hyperliquid list would be a later arm
  with its own start.

**C3. Fills.**
- **Where:** `node_fills/hourly/` through 2025-07-27 08h, then `node_fills_by_block/hourly/`. A record
  in both formats (same user, coin, `tid` and `time`) counts once.
- **The boundary** (Zod, Iron Rule 3):
  - `user` is 0x and 40 hex digits; `coin`, `px`, `sz` and `startPosition` are decimal text; `side` is
    "A" or "B"; `time` is an integer; `crossed` is a boolean; `oid` and `tid` are digits of any size;
    `dir` is text; `liquidation` is optional {`liquidatedUser`?, `method`};
  - **`closedPnl`, `fee` and `builderFee` are dropped by the JSON reviver** before any object holds
    them, so no line of COPY-H can read them.
- **Kept:** main-dex perp records, those whose coin has no ':' and is not spot ('@n', or a pair with
  '/'). Counted and left out: spot, whose `startPosition` is a balance and breaks half its chains (s6);
  builder dexes ('dex:COIN'); outcome operations.
- **Stops:** a fill file missing, differing from `data.sha256` or failing to decode stops the step
  (exit 5). So does a day with more than 1% (and at least 10) of its records failing.
- **Normalized into the kit's `normFill` fields:**
  - t is `time`; iid is the coin's index in `coins.json`; `oid` and `tid` stay as digits.
  - **prevS / prev is the startPosition of the fill's chain head.** One matching event's fills (the
    same user, oid, coin and time) are split into chains: b follows a when b's startPosition is a's
    plus a's signed size. Every fill takes its chain's first startPosition.
  - Why: Hyperliquid's startPosition is per fill, while Polymarket's previous_size is per order event.
    In s6, 10,539 of 10,541 multi-fill events chained fill to fill, none per order. With chain heads
    the kit's events break chains 17 times in 109,724 (a normal hour) and 315 in 2.96 million (the
    2025-10-10 21h crash hour, s7).
  - sgn is +1 for "B" and −1 for "A"; px and q come from `px` and `sz`; fee and pnl are 0.
  - taker is `crossed`. liq is an own liquidation leg (`liquidatedUser` equals the user).
  - forced is liq, or a `dir` of "Auto-Deleveraging", "Settlement" or "Liquidated …" (all seen). A
    `dir` outside `dirs.json` stops the step.
- **Covered:** every window inside [ARCHIVE_START, END) is covered, since the archive holds every
  trade. Its own gaps are listed: the 4 min 22 s of 2025-07-27 08:45:48–08:50:10, and every 60-s
  stretch with no record of any coin. A copy whose chain crosses one, or crosses a chain break
  (`chainBreaks`), is a gap copy (R11), printed with and without.

**C4. Events, cycles, entries, delay** — R4 unchanged.
- The kit's `toEvents`, `toCycles` and `buildEntries(events, −∞, ∞, 60 000)` run on each account's
  fills from ARCHIVE_START.
- An entry is an OPEN or FLIP group with t in the stage. `entryId` and `delayOf` are unchanged: D lies
  in [62.14 s, 95.44 s). The follow instant is t + D.

**C5. Labels and habits at M** — R5, with one bound.
- **The label** is the kit's `labelAt` on the account's fills in [max(ARCHIVE_START, M − 90 d), M),
  given as a truncated capture whose oldest instant is that start. That is the kit's own case for a
  capture with older history unread.
- **Why the bound:** the kit recomputes every event of the capture each Monday, which grows with the
  square of the busiest accounts' histories. 90 days hold the 14-day window and every cycle shorter
  than 76 days. The rehearsal checks it against full-history labels on one slice and lists every
  difference.
- **pnl is 0, and that changes no P1** (read in `classifier.mjs`):
  - classifier v1 uses pnl only in its churner rule;
  - any account that rule reaches (≥ 5 fast trips, a fast share ≥ 0.5) is "unclassified — mixed" by
    the gray fast-trip rule otherwise (≥ 3 and ≥ 0.25);
  - so "directional" never depends on pnl.
- **P1 at M:** directional, and M − 14 d ≥ ARCHIVE_START.
- **The habits:** the kit's `habitsAt({cycles, groups}, M)` on the account's whole events. The habit
  window is covered when M − 30 d ≥ ARCHIVE_START.

**C6. Markets.**
- An entry's market is primary when its coin is in `coins.json` (the main dex), has had a fill at or
  before t, and has no "Settlement" fill (a delisting) on or before t's UTC day.
- A copy open across a coin's settlement is unpriced (R11). Entries elsewhere are counted and priced in
  no line.

**C7. The lines** (membership fixed at M):

| Line | Rule | Decides |
|---|---|---|
| **MAIN** | P1; the habit window covered; median hold ≥ 6 h; ≥ 3 closed cycles; a primary market | **yes, alone** |
| TEN, BROAD, DAY | as R7 | no |
| STOP2, STOP5, DAYS7, JUMP | as R7 and R13, on C9's marks | no |
| DELAY0, DELAY+5, DELAY+15 | MAIN at D = 0, D + 5 min and D + 15 min (X3's lines; FABLE-REVIEW point 9) | no |
| SPEED | MAIN at Hyperliquid's realistic follower delay, **from HL-FOLLOW-FACTS** | no |
| RANK | MAIN's copies of the top fifth of MAIN's accounts at M by the mean net of their own MAIN copies fully closed in [M − 12 w, M), at least 5 — the ranking by past results, one named line | no |
| SLICES | MAIN in four disjoint account groups (address mod 4) | no |
| SIDES, MONTHS | MAIN's longs and shorts apart; by UTC month of t | no |

Not mapped: FAV (no favourites), NOTIONAL (no board), COMP (no competitions), MAKER and VWAP (no book).

**C8. The money reading** — R8 unchanged: the kit's exits, `planCopyThrough` with END, lib-exits'
`priceCopy` with C9's setting; in bps of $1,000: net, gross, fees, funding and hold.

**C9. The taker setting and the market objects** (section 5).
- **Fee:** 4.5 bps a leg, the base-tier taker rate, **from HL-FOLLOW-FACTS**. The provisional value
  comes from WAVE-H's H9: Hyperliquid's fee page, read 2026-11-14, gives 0.045%, and that was the most
  any taker paid in SIZING's sample days. Never a lower tier.
- **Spread c(coin, d):** half the median, over the minutes of day d − 1 that hold a pair, of the
  minute's mean relative gap |p_buy − p_sell| ÷ their mean. A pair is two consecutive taker records of
  opposite sides at most 2 s apart. With fewer than 30 such minutes, the coin's latest earlier day with
  30 is used, flagged; with none, 25 bps, flagged.
- **Marks:** a coin's minute mark is Σ px·sz ÷ Σ sz over the minute's taker records. The kit's market
  object (`marketFrom`, END in place of CUT) is built from these marks, with the minute's taker count as
  `trades`, and the funding below. `markAtMinuteEnd` (5 minutes' staleness) and `fundingBetween` run
  unchanged.
- **Funding:** Hyperliquid's settled hourly rates (`fundingHistory`) for every coin of `coins.json`,
  fetched into the store before the freeze. A row's hour is its stamp rounded (WAVE-H's R1). A missing
  hour is charged nothing and counted.

**C10. The judgement reading** — R10 unchanged: `dAgainstNull` at 24 h; the trades per minute from the
tape (one taker record a trade); longShare from the habits; removed as `removalOf` over the week-of-M
fills of the line's accounts; voted as R10.

**C11. Unpriced, missing, gap** — R11 unchanged.

**C12. The statistic and the verdict** (MAIN only).
- **The set of look k:** MAIN's copies voted by END_k. x is the net in bps, and SE is as R12 (two-way
  CR1, by trader and by the UTC day of t + D).
- **z:** look 1 **2.81**, look 2 **2.43**, the paper's own L1 and L2 bars (0.5% and 1.5% two-sided).
- **WITHHELD:** more than 2% unpriced.
- **DROP:** m + z·SE < **+10 bps** (the paper's δ; question 3).
- **KEEP:** m − z·SE > 0, **and** the mean d > 0, **and** the mean of the traders' own means > 0,
  **and** the mean of the UTC days' own means > 0 (FABLE-REVIEW M2 and point 6).
- When both hold, DROP. Otherwise TOO FEW TO TELL, with R12's sentence.
- The first KEEP or DROP is COPY-H's verdict; a later look prints "after the verdict". "Keep and drop
  are verdicts on this test, never instructions to trade."
- A KEEP is confirmed once on FRESH-2 alone (C14).

**C13. The prints**, every line; MAIN's decide.
- R14's list where it applies, including the break-even round trip and Binance's 5 bps a side as
  arithmetic.
- **Concentration, printed with the verdict:**
  - the two best days' share of the sum, and the mean without them;
  - the top 1% of traders' share, and the mean without the top 10 traders;
  - the event level: one copy per coin, side and hour;
  - the most copies of one trader.
- Also: the long share, longs and shorts apart, by month and by slice, the calibration prints (section
  5) and the tripwire's counts.

**C14. The owner's rounds, and FRESH-2** (the hybrid).
- **Explore**, after look 1 is recorded, on E's priced copies only; the seal keeps S closed.
  - At most **3 rounds**. Each declares its tries in `copyh/tries.md` (the definition and why) and is
    committed before it runs.
  - At most **8, 6 and 4 tries** (18 in all, about half the polishing's 35).
  - A try is a filter over MAIN's or BROAD's priced copies: the trader's habits at M, coins, size, side,
    hold, the trader's own copies before M. Never a new price, never a month of S.
- **Choice**, fixed now. A try qualifies when, on E:
  - m − z_k·SE > 0, with z_k the one-sided Bonferroni bar for the k tries run so far (2.5% ÷ k);
  - its mean d > 0, the mean of its traders' own means > 0, and the mean without its two best days
    > 0;
  - it has at least 100 traders and 100 days.

  At most **two** qualifying tries go on, those with the highest m − z_k·SE; none if none qualifies.
  They are frozen as `copyh-freeze-2`.
- **Confirm, once, on S at step 2:** Holm at 2.5% one-sided (z 2.24, then 1.96 for the second), with
  C12's sign conditions. A try that fails is closed for good and never retried on these months.
- **The sealed judgment, once, on FRESH-2:**
  - a confirmed try at one-sided 2.5% (z 1.96), and a MAIN KEEP at 5% (z 1.645), each with C12's sign
    conditions;
  - FRESH-2's length is fixed in step 2's report by C12's arithmetic: about 150–180 days, so mid-April
    to mid-May 2027 with the archive's upload lag.
- **The error budget:** explore spends nothing and decides nothing. The confirm's 2.5% and the seal's
  2.5% are each spent once. So a useless try reaches a final KEEP at most about 0.06% of the time,
  whatever was explored. MAIN's own budget is C12's, untouched by the rounds.

**C15. The steps and the record** (the exam's guards).
- **Step 1:**
  - the gate;
  - E's pass run twice, the two stores equal file by file (else exit 7);
  - the integrity (C3's counts, chain breaks, gaps);
  - the tripwire (C16);
  - the positions and prices; look 1's `result.json` first, then the prints.
  - A second step 1 refuses.
- **Step 2:**
  - S's pass run twice and held equal; the integrity; the tripwire;
  - step 1 recomputed and held to its hash;
  - look 2, and the confirm of the frozen tries; `result.json` first.
- **Every look:** a report and a Final review with independent code. Nothing heavy runs beside it; it
  runs at idle, outside 02:30–06:00Z and 10:25–11:15Z.

**C16. The coverage tripwire**, before any price.
- At each step, from the bars alone:
  - the share of the line's follow and exit instants whose coin has no trade in the 6 minutes up to the
    instant's minute end;
  - the funding hours missing;
  - the gap copies;
  - and so the projected unpriced share of MAIN's set.
- Above **1%** (half the 2% line), the step stops before pricing, for a decisions entry. In September
  2025 it measured 0.01% of instants (s8).

**C17. What never changes** — R16.

## 3. The paper's rules, field by field, on Hyperliquid's fills

| Paper (`rules.md`) | COPY-H | Same? |
|---|---|---|
| R0 freeze, gate, the defect route | C0, `copyh-freeze-1` | yes |
| R1 CUT, F0, END, looks, weeks | C1: E, S, FRESH-2; two looks; Mondays | mapped |
| R2 the kit's pool less 100 holdout; favourites | every main-dex account less the protocol vault's | **changed** (no leaderboard here; nobody chooses) |
| R3 seed + API pages, Zod, holes, covered | the archive's records, Zod, a reviver without `closedPnl`/`fee`; the archive's listed gaps | mapped |
| `normFill`: prevS = previous_size (per order event) | the chain head's startPosition (Hyperliquid's is per fill) | **mapped, measured** (s6, s7) |
| `taker`, `liquidation`, `adl`, `settlement` | `crossed`; own `liquidation` leg; `dir` "Auto-Deleveraging", "Settlement", "Liquidated …" | mapped |
| `fee`, `pnl` | not read (0) | unused; proved for the label (C5) |
| R4 events, cycles, entries, D | unchanged | yes |
| R5 the label on the capture before M; habits on 30 d | the label on [M − 90 d, M) as a truncated capture | **bound ruled** (C5) |
| R6 the kit's rule book; close-only, settlement, splits | main-dex coins; a "Settlement" fill closes a coin; no splits | mapped |
| R7 lines | MAIN, TEN, BROAD, DAY, STOP, DAYS7, JUMP kept; FAV, NOTIONAL, COMP not mapped; DELAY, SPEED, RANK, SLICES, SIDES, MONTHS added beside | mapped |
| R8 money, exits copied | unchanged | yes |
| R9 fee from the collector's rule book | 4.5 bps base tier (HL-FOLLOW-FACTS) | mapped |
| R9 spread: R8's session-pair table | the tape's quoted half-spread, by coin and day (crypto has no session split) | **changed** (section 5) |
| R9 marks, klines, funding from the API | the tape's minute VWAP and trade counts; settled `fundingHistory` | **changed** (section 5) |
| R10 d at 24 h, the exact matched null | unchanged, the tape's trade counts | yes |
| R11 unpriced, gap | unchanged | yes |
| R12 statistic, z, WITHHELD, DROP, KEEP | unchanged but z by look (2.81, 2.43) and two sign conditions added to KEEP | extended |
| R13, R14 | kept; concentration added | extended |
| R15 page, R17 budget | none: a history test, with a report | not mapped |

## 4. The months, the looks and the rounds

- **Splits weighed.**
  - MAIN chooses its traders rolling by construction: each Monday's label and habits come from the
    weeks before it only, so every month can judge it.
  - A ranking by past results (RANK) also looks back only, 12 weeks, inside the rule. That is not a
    choice of rule.
  - Choosing a *rule* happens once, on E, in the owner's rounds, and E never judges what it chose.
  - A rolling choice of rules (choose on months 1..k, judge k + 1, roll on) would spend a fresh look
    every month on a thinner block. Its error budget falls apart, so it is not proposed.
- **Looks:** two, E and then E ∪ S. Three would cut the same 504 days into thinner looks for no gain.
- **Units of independence:** traders and UTC days (the two-way error and the sign conditions), and
  episodes (the event-level print). Never fills.
- **The matched null (LESSONS 5):**
  - d against the exact matched null on every copy: a random public trade of the same coin and hour,
    the same delay, the trader's long share;
  - SLICES, the same rule in four random groups of accounts;
  - BROAD beside, every directional trader.
- **The calendar:**

| Stage | Months | Days | Holds | Judges |
|---|---|--:|---|---|
| burn-in | 2025-05-25 14h → 06-29 | 35 | labels and habits only | nothing |
| **E** | 2025-06-30 → 2026-05-29 02h | 333 | MAIN look 1; then the owner's rounds | MAIN (look 1) |
| **S** | 2026-05-29 02h → 11-16 | 171 | sealed until step 2 | MAIN (look 2, cumulative); the chosen tries once |
| **FRESH-2** | from 2026-11-16, not yet downloaded | 150–180 | sealed until a yes | a MAIN KEEP's confirmation; a confirmed try once |

- **Design A:** one step on E ∪ S, one look at z 2.58, no rounds. FRESH-2 confirms a yes; any later
  filter is chosen on the 72 weeks and judged on FRESH-2 and after.
- **Design B:** explore 2025-06-30 → 2026-02-02 (217 days), confirm 2026-02-02 → END_E (116 days), seal
  S (171 days). The deciding line is the chosen filter, with MAIN as its try 0. Its power is in the
  gate's table.

## 5. The price source: one for every month

- **Why the tape** (FABLE-REVIEW point 4):
  - The archive's `l2Book` cadence fell from 0.54 s to about 11 s in November (external-apis), and
    almost no book files are on F: beyond the legs WAVE-H and the exam needed. There are none for BTC
    and ETH, 30% of MAIN's entries in the sample.
  - `asset_ctxs` covers every coin's every minute until 2026-09-10. From 2026-09-25 each day's file
    covers one stretch only: 655, 501 and 197 minutes a coin on 09-25, 10-15 and 11-14 (s3). So the
    venue's own marks go missing for most of the day in late September → November.
  - The fills are the one complete record, and the copies hold for hours: MAIN's traders' median hold
    is 17.5 h (s5), so a few bps of execution detail matter little against the move.
- **What is measured** (September 2025, s8): 173 main-dex coins traded each sample hour. MAIN's entry
  coins had a trade within the kit's staleness at 99.99% of instants. The tape's quoted half-spread,
  weighted by MAIN's entries, was 0.78 bps (BTC 0.04, ETH 0.11, SOL 0.22; the median coin 1.08, the
  90th percentile 3.24). Fee and spread make a round trip of about 10.6 bps, close to Polymarket's
  ~10.4.
- **Calibration prints**, deciding nothing and computed before the freeze on outcome-free cells:
  - the tape's c against the book's half-spread and its $1,000 walk, where the archive's books are
    dense (2025-05 → 2026-06-14; the 34–37 coins of books already on F:);
  - the tape mark against `asset_ctxs`' `mark_px` and its impact prices, where `asset_ctxs` is
    complete.
- **What it leaves out:** depth beyond the quoted half-spread at $1,000 (the walks print it), and
  slippage in a cascade minute (the staleness rule and STOP lines see it).
- **The WITHHELD projection** comes from each step's own months (C16), never from older months: look
  1's lesson.

## 6. The data and its extraction

**Sizes** (from the stores' own manifests and files lists; `out/s1-sizes.txt`, `out/s2-ctxs-days.txt`):

| Range | Fill files | lz4 | Decoded | Records | The analyzer's pass (6 workers) |
|---|--:|--:|--:|--:|--:|
| WAVE-H's store (2025-05-25 14h → 2026-05-29 01h) | 8,845 | 218.3 GB | 1,116.9 GB | 2,658,921,516 | 3,106 s |
| FRESH's store (→ 2026-11-15 23h) | 4,102 | 159.9 GB | 782.9 GB | 1,799,575,535 | 1,875 s |

- **Accounts:**
  - 2,817–13,063 an hour (s4);
  - 5,012 in a 1/32 slice over 37 days, so about 160,000 active in 37 days (s5);
  - the top 1% of an hour's accounts hold 39–58% of its records (s4).
- **Main-dex perps** are 54–86% of an hour's records; the share falls as builder dexes grow from
  December 2025 (s4).
- **COPY-H keeps** about 3 billion records at about 48 bytes each: roughly 145 GB a build (E ~95, S
  ~50), plus about 7 GB of minute bars. F: had 1,121.8 GB free after the cleanup.

**The design — recommended: COPY-H's own pass, in the analyzer's proven form, with no new
dependency.**
- **A sixth entry point,** `dist/copyh.js` (`src/copyh/`), that imports, never changes, the analyzer's
  LZ4 decoder.
- **Why not new writers inside `src/polish`:** the exam's freeze lists `dist/polish/`; the exam is
  closed, with look 2 not built (decisions 2026-11-25), but its record must stay reproducible from its
  tag. And the analyzer's seal keeps FRESH closed unless *that* freeze verifies. COPY-H needs its own
  seal anyway.
- **Writers:**
  1. `fills`: every main-dex perp record. Columns: time, coin, user, px, sz, side, startPosition, oid
     and tid as u64, flags (crossed, own and counterparty liquidation, ADL, settlement, "Liquidated" dir)
     and dir as a dictionary. Partitioned by account bucket (the address's last two hex digits, 256) and
     month.
  2. `bars`: each main-dex coin's minute, from its taker records: trades, Σ sz, Σ px·sz, the opposite-
     side pairs' gap sum and count. Partitioned by coin and month.
- **Parts, merge, manifest:** one part a file, as the analyzer's: a stopped pass resumes, and the
  manifest is written last.
- **A gate set like G0, G5 and G6:** every row conserved; one taker and one maker a trade; sample days
  re-read cell by cell by an independent reader.
- **Weighed: a columnar store with an embedded SQL engine** (the plan page's "analytic engine", e.g.
  DuckDB). It would compress well and make bars a query. But it needs the owner's yes for a native
  dependency, still needs Node to decode the LZ4 JSON, still runs the kit per account in JavaScript,
  and adds a second toolchain to review and freeze. **Not now**; v1 may want it.

**Time and memory, measured:**
- per thread: decode 0.31 GB/s, record tiling 0.57 GB/s (s5a: 888 files, 110 GB, 287 s on 2 workers);
  `JSON.parse` about 37 MB/s (s4).
- **A build ≈ 12 CPU-hours,** about 4 hours on 3 workers (E ~2.4, S ~1.6), twice each, in parts of at
  most 15 minutes at idle while the PC is in doubt (question 8).
- **Peaks:** a worker 2.6 GB (s5a); 1.2 million rows as objects 3.7 GB (s5b); the crash hour's 4.7
  million records as objects 6.7 GB (s7).
- **Ceilings** at about twice the build's own measured peaks, set in its rehearsal (the owner's rule).
- **The label step** is cheap: `labelAt` takes 0.03 ms for the median account, 219 ms for one of
  154,303 fills (s5).

**The 2025-07-27 switch:**
- 08h holds two disjoint files with no record from 08:45:48.664 to 08:50:10.273 (external-apis);
- both are read; a record found in both counts once;
- the hole is listed (C3), and its chain breaks make gap copies.

**The shared `tid`:** trades are keyed by (coin, tid, time), as the kit's `removalOf` already does
(external-apis, 2026-11-19).

## 7. The build, in parts, with the rehearsal; this PC; effort and time

| Part | What | Its checks |
|---|---|---|
| 0 | **funding fetch:** every main-dex coin's settled funding, with the owner's yes, through `tools/waveh-fetch.cjs`'s funding windows under its gate. HL-FOLLOW-FACTS's numbers written in | the manifest; `funding.sha256` |
| 1 | `src/copyh/`: the schema and reviver, chain heads, `coins.json`, `dirs.json`, `vaults.json`, the seals and gate, the steps' frame | made-up records: both formats, the switch hour, one and several chains, ADL, settlement and "Liquidated", a shared `tid`, an id above 2^53; the seals refuse S before step 2 and FRESH-2 always; deliberate breaks |
| 2 | the pass, parts, merge and store; the twin compare; integrity | a resumed pass equals an unbroken one; a bit flipped in one part is caught; made-up stores through every gate |
| 3 | **the copy engine:** accounts → the vendored kit unchanged → lines, entries, legs, the tape's market objects, C9's setting, funding, d and its removal tables, R12's statistic, the prints; the rounds' try runner and choice rule | a synthetic world per rule C3–C16, every output asserted; deliberate breaks of everything that decides |
| 4 | **the reproduction and the rehearsal** (below) | known answers equal |
| 5 | fresh rules and code reviews (other models), fixes, a fix-check, `copyh-freeze-1` | "may freeze" |
| 6 | step 1: look 1, its report, a Final review with independent code | |
| 7 | the owner's rounds (hybrid), `copyh-freeze-2` | `tries.md` committed before each round |
| 8 | step 2: S, look 2, the confirm, the report, a Final review | |
| 9 | FRESH-2 (spring 2027): download, the pass twice, the sealed judgment, the report, a Final review | |

**The reproduction and the rehearsal (part 4), before the freeze:**
- **(a) Known answers on Polymarket's pre-cut weeks.** The seed is converted to Hyperliquid's record
  shape, with per-fill startPosition chains, then run through COPY-H's mapping and the kit on the kit's
  own panel and taker setting. It must give:
  - FIND-6-EXITS's 1,918 copies to 1e-9 bps and X3's 1,366;
  - the kit's labels at every one of its 26 Mondays;
  - FR1's counts.

  These numbers are already known, so this is no new look. It tests the mapping end to end.
- **(b) A synthetic world** through step 1 → rounds → step 2 → FRESH-2 under a synthetic tag. It runs
  once more on a planted defect's commit, as its control, which must stop.
- **(c) The rehearsal on E's first two weeks:**
  - counts and mechanics only (labels, lines, entries, legs by source, the tripwire, run times, memory);
  - its priced copies sealed unread, their SHA-256 printed, then recomputed and compared at step 1;
  - the label bound's check on one slice.

**This PC** (the memory faults of 2026-11-20, the blue screen of 2026-11-25):
- every run resumes from whole parts;
- the store is built twice and must be equal;
- one heavy run at a time, at idle, nothing heavy beside a look;
- independent code before the owner reads a verdict.

**Effort and time:**

| Step | Sessions |
|---|--:|
| this plan's fresh review | 1 |
| parts 0–1 | 1 |
| part 2 | 2 |
| part 3 | 2 |
| part 4 | 2 |
| two fresh reviews (parallel), fixes, a fix-check | 4 |
| step 1 and its Final review | 2 |
| the rounds (hybrid only) | 1 |
| step 2 and its Final review | 2 |
| **in all, through look 2** | **about 17 (A: about 14)** |

- **Lines:** about 4,500 with tests, against the polishing's 12,931, kept down by reusing the decoder,
  the kit, lib-exits and the paper's statistics.
- **Calendar:** about two weeks from the owner's yes to step 1; step 2 within the following week.

## 8. Risks, and how each is caught

| Risk | How it is caught |
|---|---|
| The PC fails mid-run | parts resume whole; the twin builds; idle; independent code at each look |
| The market's direction carries the money reading (66% long in the sample) | d's sign condition; the stress case in the gate; SIDES and MONTHS |
| A few days or traders carry a result | the two-way error; the traders' and days' own means as conditions; the concentration prints |
| The mapping misreads Hyperliquid's fills | made-up records; the reproduction's known answers; chain breaks printed (0.019% in s5) |
| A thin coin's tape mark is noisy or stale | the 5-minute staleness; unpriced counted; the tripwire; the calibration prints |
| Funding missing | the fetch; a missing hour counted, in the tripwire |
| The busiest accounts' size | the 90-day label bound; per-bucket steps; ceilings from measured peaks |
| A look-ahead | labels from fills before M; prices at t + D; c from the day before; settled funding at its hour; the seals by step |
| The rounds' winner's curse | capped tries, the adjusted choice, confirm on unseen S, the seal on FRESH-2 |
| The build grows | the budget above; tries are filters over priced copies, never new prices |

## 9. FABLE-REVIEW's twelve points

| # | Point | Answer | Where |
|---|---|---|---|
| 1 | one question, one deciding line, each verdict's meaning | MAIN alone decides; KEEP, DROP, TOO FEW, WITHHELD each say what follows | §1, C12 |
| 2 | MAIN unchanged; TEN, BROAD, DAY beside; ranking one line beside | yes; RANK beside; the owner's rounds are a separate road that never judges on its own months | C7, C14, question 1 |
| 3 | the power first | the gate's table, counts and a borrowed error | page one |
| 4 | one price source for every month | the tape; books and `asset_ctxs` only as calibration prints; the tripwire | §5, C9, C16 |
| 5 | both readings | money with exits copied, and d | C8, C10, C12 |
| 6 | a number a few days or accounts cannot carry | the two-way error and two sign conditions | C12, C13 |
| 7 | the mapping written and tested first; vaults and sub-accounts named | §3; made-up tests and the reproduction; the protocol vault out, others as accounts | C2, C3, §7 |
| 8 | the bar where the owner acts; base-tier costs | δ +10 and the 4.5 bps base tier provisional; where you act asked | question 3 |
| 9 | the delay as frozen; faster and slower beside | R8's D decides; DELAY0, +5, +15 and SPEED beside | C4, C7 |
| 10 | a build budget | about 17 sessions, about 4,500 lines | §7 |
| 11 | the exam's guards | twice-built store, the reproduction, independent code, nothing heavy beside | C15, §7 |
| 12 | FRESH-2 unseen for confirming a yes | sealed until step 2's report; a yes confirmed there | C0, C14 |

## 10. Questions, each with a recommendation

1. **The design: A, B or the hybrid?** *Recommendation: the hybrid.* It keeps MAIN unchanged as the
   only deciding line at A's power, and gives your rounds months that never judge them. B spends the
   deciding power on a filter search. A is simpler by about three sessions, if you want no rounds.
2. **Fetch Hyperliquid's settled funding for every main-dex coin, 2025-05-25 → 2026-11-15** (about 240
   coins × 28 windows, about 6,700 keyless reads of the public info API that WAVE-H used; about 230
   MB), before the freeze? *Recommendation: yes.* `asset_ctxs` gives only a predicted rate, and is missing
   for most of each day from late September. Without the fetch, funding would be charged nothing on
   much of S.
3. **Where would you act, and so the bar?** *Recommendation: keep δ = +10 bps a copy on Hyperliquid's
   base-tier costs and print the break-even round trip, so any venue can be read against it; answer
   before the freeze.* Which kinds of venue could a yes be used on?
   - (a) Hyperliquid itself, from your own account: the copies are its prices and costs;
   - (b) Hyperliquid's vaults, where depositors follow a vault's trades by design, but only for traders
     who run one (HL-FOLLOW-FACTS);
   - (c) another crypto perp venue at its own prices, costs and funding, if its terms allow trading on
     others' trades;
   - (d) not a prop firm whose terms forbid copying third-party trades, as Finotive's do (decisions
     2026-11-12, Q7).
4. **The pool: every main-dex account,** less the protocol vault, rather than a slice? *Recommendation:
   yes;* the counts make a slice unnecessary, and SLICES prints four.
5. **The rounds' caps** (3 rounds; 8, 6 and 4 tries; at most 2 to confirm; the choice rule, the confirm
   on S, the seal on FRESH-2, C14)? *Recommendation: yes,* fixed now.
6. **The label's 90-day bound** (C5)? *Recommendation: yes;* the rehearsal shows its differences on a
   slice first.
7. **KEEP's two added sign conditions** (each trader alike, each day alike)? *Recommendation: yes*
   (FABLE-REVIEW M2). They can only make a KEEP harder.
8. **Runs under 15 minutes at idle until the PC is cleared,** then longer if your memory test passes?
   *Recommendation: yes.* The build's runner chains short resumable runs. The test and the RAM setting
   are yours.
9. **FRESH-2's length,** fixed in step 2's report from the same arithmetic? *Recommendation: yes.*
   About 150–180 days, so mid-April to mid-May 2027.
10. **The lines beside** (C7; FAV, NOTIONAL, COMP, MAKER and VWAP not mapped)? *Recommendation: yes.*

## 11. What I measured, and what I looked at

**Opened, read only:**
- **WAVE-H's raw store:**
  - `manifest.jsonl` and `books.jsonl`;
  - fill files 2025-06-15 12h; 2025-07-27 08h (both formats); 2025-09-09 03h, 09-10 14h, 09-13 20h,
    09-15 12h; 2025-10-10 21h; 2025-12-15 12h; 2026-03-15 12h;
  - the 888 files 2025-08-09 00h → 2025-09-14 23h, where only a 1/32 address slice was parsed;
  - `asset_ctxs` 2025-08-15, 2025-10-10, 2026-03-15, `time` and `coin` only.
- **FRESH's raw store:**
  - `manifest.jsonl` and `books.jsonl`;
  - fill files 2026-06-15 12h and 2026-10-15 12h, counts only;
  - `asset_ctxs` 2026-06-15, 09-10, 09-25, 10-15, 11-14, `time` and `coin` only.
- **The analyzer's stores:** `manifest.json` and `files.jsonl` of both. No partition was opened; the
  `liq` table, which holds `closedPnl`, was not touched.
- **Imported as a library:** `dist/polish/lz4.js` and the vendored kit and lib-exits. No program was
  run.

**Never opened:** the collector's, the paper experiment's and MARKET-1's data; polymarket-lab;
`LESSONS.md` (outside this worker's folders: its point 5 is used as the brief states it).

**Fields read:** user, coin, px, sz, side, time, startPosition, oid, tid, crossed, dir and liquidation.
px × sz gave sizes; two prices at the same moment gave the spread; no price change after a fill was
computed. Records were parsed with the reviver dropping `closedPnl`, `fee` and `builderFee`.

| Script → output (in `workers/COPY-H-PLAN/`) | What | SHA-256 |
|---|---|---|
| `s1-sizes.mjs` → `s1-sizes.txt` | the stores' files, bytes, records; the pass's times | `877763bd…ae38` → `e48db648…02bc` |
| `s2-ctxs-days.mjs` → `s2-ctxs-days.txt` | `asset_ctxs` rows a day (the analyzer's counts) | `6dbba682…2d06` → `14f8b236…9602` |
| `s3-ctxs-coverage.mjs` → `s3-ctxs-coverage.txt` | `asset_ctxs` minutes a coin, eight days | `4a32464b…55e5` → `a0ec67a8…ffbc` |
| `s4-sample-hours.mjs` → `s4-sample-hours.txt` | eight hours: accounts, coins, dirs, sizes, chains, tids | `f1649be9…8215` → `9dd6d4c9…0828` |
| `s5-slice-window.mjs` → `s5-2025-09-08-s32.txt` | the first try, failed on its own (not used) | `24607f22…bcfe` → `8b7128f3…8fa1` |
| `s5a-slice-pass.mjs` → `s5a-w2025-run1.txt` | the slice's pass: 888 files, 287 s | `4e7f65ae…dfa3` → `d48fd267…8295` |
| `s5b-slice-labels.mjs` → `s5b-w2025-p0…p3.txt` | labels, lines, entries, holds, sides, sizes, coins, in four sub-slices | `f89bb3c9…9d49` → `81b7a941…7530`, `e46b4d5f…8105`, `0565cb31…debf`, `aa31637c…6791` |
| the same → `w2025-labels-0…3of4.json` | the parts' counts for s5c | `2e692352…fc1d`, `ca4e9b28…4a5c`, `2d2c1ac0…7036`, `ca1a9d7f…3993` |
| the same, first try → `s5b-w2025.txt` | ran out of a 10 GB heap (not used) | `8806df0a…633e` |
| `s5c-add-parts.mjs` → `s5c-w2025.txt` | the slice's totals | `1bb9caa5…352c` → `42e1ad51…571e` |
| `s6-events-shape.mjs` → `s6-events-shape-a.txt`, `-crash.txt` | startPosition per fill; dirs | `66177d23…3076` → `163c55ba…11ce`, `bbc78a51…8981` |
| `s7-chain-heads.mjs` → `s7-chain-heads.txt` | chain heads: chain breaks | `8ab70608…3fa9` → `f69fadc7…aa8a` |
| `s8-tape-coverage.mjs` → `s8-tape-coverage.txt` | the tape's coverage and quoted half-spread | `6d113e4c…cb54` → `b5db622a…b086` |
| `s9-power.mjs` → `s9-power.txt` | the gate's power arithmetic | `ca49ac23…5510` → `c95db541…32af` |

*This is research, not advice on what to trade.*
