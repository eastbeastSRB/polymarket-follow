# RESEARCH-KIT — round 2's one-minute panel, research kit and first measurements

RESEARCH-KIT (Opus 5.5, max), 2026-11-10 14:37Z – 2026-11-11 01:24Z (UTC, every stamp
from `date -u`), for polymarket-follow's supervisor: foundation 2 and
Appendix A.1 of IDEAS-REVIEW's report (decisions 2026-11-10, round 2's rules
and the collector approved). Evidence: the supervisor folder
`workers/RESEARCH-KIT/` (`kit/`, `scripts/`, `out/`, `progress.md`; paths
below are relative to it) and `F:\polymarket-follow-research\KIT\` ("F:"
below). **The blind store held:** every input ends at 2026-11-07T00:00:00Z,
and nothing about markets or accounts after that instant was read (section
5, first row). A review decides nothing; what this one proposes is in
section 8.

## For the owner, in one page

*Words.* A **bp** is 0.01%. A **taker** trades at once and pays the fee and
the gap between buying and selling prices. **"Random trades"** are the
yardstick: what a trade picked by chance in the same market and hour did.
**FIND** is the data up to 2026-11-07, on which ideas may be looked for.

**What was built**

1. **A one-minute record of every market** — 91, including the one that
   closed in September — from its first trade to 2026-11-07: the price every
   minute, how much traded, and the funding every hour. From the launch on,
   every one of its 8.3 million minutes has a price; in the beta months
   before it the exchange itself paused 17 times (1.2% of those minutes have
   no price, and are marked so). Where R8 had read the same markets on its
   own (156,618 minutes, 79,338 funding hours), the two agree to the last
   digit.
2. **One research toolbox for every study**, so that all of round 2 counts
   trades, prices them and tests them the same way. It is sealed by a
   fingerprint: a study refuses to start if any of its files has changed.
3. **It reproduces R8.** It finds R8's 1,272 trades exactly. Priced by the
   minute instead of the second, R8's loss is −16.4 bps a trade instead of
   −16.6.
4. **A better yardstick.** Instead of three random trades per entry, the
   average of every trade in that market and hour: on R8's trades the
   results come out about 17% more precise.

**What the first counts say** (no idea was tested; only how much data each
test has)

5. **One hour is too short for a taker almost everywhere:** costs need more
   than 55 right calls in 100 on 82 of 84 markets — 67 on BTC; on the S&P
   500 the round trip costs more than the average hourly move. At six hours
   half the markets are open, at a day nearly all.
6. **Directional traders made about 1,100 new trades a week** after the
   launch; 139 of them traded often enough in alternate weeks to test
   whether traders differ (the plan guessed 200).
7. **What the planned tests can see:** most of them an effect of about
   15–60 bps a trade (section 3; the first-minute test about 2 bps, the
   large-orders test 5–33). [Final review, F2: as the rule book's tests
   really weigh accounts and days, the large-orders test sees 9–32 and
   "three traders agree" 33–48; at a day's horizon (question 5) the
   figures about double.] The funding test can only see 120 bps — by the
   rule book's own line it should wait for more data. "Three traders agree"
   is rarer than guessed (188 times, not 500).

**Problems found and handled:** the price history returns one minute less
than asked at the end of a range — found in a trial, fixed before the pull.
The funding question (does a position closed just before the hour pay?) is
answered by the exchange's own changelog: a position open at the hour pays,
even if closed in the split second before the payment is booked; one closed
earlier does not. The test read was not made, because it could have shown
data after 2026-11-07.

**Questions** (my recommendation in brackets; in full in section 8)

1. Is the "matched" yardstick round 2's only one? The minute data cannot tell
   buyers from sellers, which R8's version needed. (Yes.) [Final review,
   F5: then R8's US-open finding must be measured again with it before it
   is registered.]
2. Leave the funding study out of this round? (Yes — it cannot see enough.)
3. Settle the funding question by the changelog and make no read? (Yes.)
4. For the register (supervisor): replace one list that came from a board
   read after 2026-11-07; score one-hour traders at six hours; freeze the
   list of 303 directional accounts. (Yes to all three.) [Final review, F1:
   "score one-hour traders at six hours" is withdrawn — see question 5.]
5. [Final review, F1: new.] The rule that bars cells a taker cannot pay
   (above 55% right calls needed) would bar most planned tests as they are
   written: four in five directional entries at their usual horizon, nearly
   every "three traders agree" event at six hours. Judge those tests at a
   day's horizon, where almost every market is open, and leave the rule out
   of the two tests that already measure a taker's net result? (Yes.)
6. [Final review, F3: new.] The rule book's day test counts every day once,
   so it tests the average day, not the average trade (on R8's trades −8 bps
   a day against −17 a trade). Keep it so, and print the average trade
   beside, deciding nothing? (Yes.)

---

## 1. The panel

- **What:** one-minute marks (`mark-history`, 1 m: the last mark of each
  minute), one-minute klines (volume, trade count) and hourly funding of 91
  markets — the 90 enabled and KIOXIA-USD, retired (settled 353.87 at
  2026-09-28T00:33:01.797Z) — from each market's first trading day
  (2026-05-06 for the first, 2026-10-29 for ANT-USD) to the cut. One file a
  market (`F:\panel\<id>.json.gz`): marks dense by the minute (null where
  none), klines sparse, funding by nominal hour with its stamp; a retired
  market carries its settlement and ends there. **No split** before the cut
  (`stock-splits`: no events, 2026-11-10 14:55Z).
- **Cost, stated before the pull** (`out/plan-cost.txt`, from one 1 d klines
  read a market): 19,409 calls, at most 107,325 weighted tokens (marks
  57,885; klines at most 28,880; funding 20,560), 11.9 h of calls at 150 a
  minute plus the 77-minute quiet window [Final review, F8(d): the klines
  figure is a proportional estimate where a segment cuts a day, not a
  bound; the pull spent 12,535 on klines]. Foundation 2 allowed at most
  246,000. **Spent** (`out/audit-calls.txt`, recomputed from `F:\calls.jsonl`):
  the pull 15,944 calls and 89,335 tokens, 2026-11-10 15:05:52Z – 2026-11-11
  01:16:54Z (10 h 11 min; it ended before the quiet window); with the
  planning probe, the trial and the end-rule probe, **16,116 calls and 90,210
  weighted tokens, every one HTTP 200, no network error, no 429**; never more
  than 150 tokens in a trailing minute nor 22 in any 5 s; no call in
  02:34–03:51Z.
- **How it pauses and resumes:** segments of 10,000 minutes from the cut
  backwards, round-robin over the markets, each market's funding chain kept
  level, so the panel is complete from the current segment to the cut at
  every moment (R8's period was complete after 5.5 h, FIND's 65 days after
  7.5 h). The client sleeps through 02:34–03:51Z; a STOP file or the end time
  stops it before its next request; the first 429 stops it; every reply is
  appended whole with its read instant (`F:\raw\<type>\<id>.jsonl.gz`), then
  its key to `F:\done.jsonl`, from which a restart continues.
- **A trap found and avoided:** a 2.5-minute trial came back one minute short
  in every segment. `mark-history` returns a 1 m bucket only if it *ends* by
  `end_timestamp`, while klines include a candle *opening* at it
  (`out/probe-end.txt`, five calls at a past boundary). So marks ask the
  segment's end — for the last segment exactly the cut, which cannot return
  a bucket starting at it — and klines the end minus 1 ms. The trial's
  replies are kept apart (`F:\trial-1500Z\`), unused.
- **Coverage**, each market's minutes counted against its first trade
  (`F:\panel\coverage.json`; by period through the kit's reader,
  `out/coverage-periods.txt`): 11,451,888 minutes in all.
  **From the launch week (2026-08-31) to the cut: 8,304,742 minutes, every one
  with its own mark;** 138,402 funding hours, 13 without a row — the API's
  own gaps, mostly a market's first day (MU, TSM and SNDK 2026-08-31 20:00Z;
  KAITO-USD four hours on 2026-09-10/11; MRVL, EWY and SOXL 2026-09-16 16:00Z,
  EWY 17:00Z, UNITREE 20:00Z and 21:00Z). **Before it**, in the beta months:
  39,187 of 3,147,146 minutes (1.2%) without a mark, nearly all in 17 pauses
  shared by most markets — the longest 1,646 minutes from 2026-06-13 01:20Z,
  then 484 from 06-03 02:40Z and 273 from 08-11 01:01Z; the last minute
  without a mark anywhere is 2026-08-11 11:55Z — and 3,267 of 52,420 funding
  hours without a row. The reader prices none of a pause's minutes past its
  first five and counts them; a missing funding hour is charged nothing and
  counted. The minute klines' trade counts add up to the daily klines' on
  every fully pulled day (8,010 market-days, none off). One settlement hour,
  2026-11-05 20:00Z, is stamped 46 s late on all 90 markets (R8 saw it): the
  panel files it under its nominal hour.
- **It agrees exactly with R8's independent capture** of the same 80 markets
  (`out/check-panel-r8.txt`, R8's reads of 2026-11-09): funding 79,338 hours,
  the same rate in every one; R8's 79,515 hourly marks equal to the panel's
  mark at each hour's last minute; in 156,618 minutes that R8's one-second
  windows hold whole, the minute's last one-second mark equal to the panel's;
  R8's 23,346 minute klines, trade count and volume equal — no difference
  anywhere.
- **The manifest:** `F:\MANIFEST.sha256` (367 files: every raw reply file and
  every panel file), SHA-256
  `93c985e5cbab3ea359fb7aece3d5f93580b01f328a3ae386d96b6d32be25be15`. Its
  panel lines are pinned in the kit (`kit/data/panel-manifest.sha256`): the
  reader refuses a panel file whose hash differs.

## 2. The kit

**Its parts — one definition of each thing, in one place** (`kit/`; Node
24.13's built-ins only):

| Module | What it holds |
|---|---|
| `constants.mjs` | the cut (2026-11-07T00:00:00Z) and where the data lies |
| `fills.mjs` | the fills reader: R2's capture and R8's three completed files, numbered pages only, deduplicated by trade key, R8's boundary check (a failing row dropped and counted), **any row at or after the cut refused (it throws)**; R2's light files — portfolio, profit and competition reads made after the cut — are never opened |
| `entries.mjs` | order events by `(order_id, previous_size, instrument)` with same-millisecond chaining, cycles, entries (openings and flips, the 60 s merge, adds apart, forced events exits only) — R8's `lib-r8.mjs` step for step; R8's entry id, delay D and voted rule, each once (R8 had two copies) |
| `labels.mjs` | an account's v1 label on the 14 days before an instant (the frozen classifier, byte-identical) and its habits on the 30 days before it (closed cycles, median hold, horizon class, long share) — IDEAS-REVIEW point 2.22 |
| `panel.mjs` | the panel reader: each file checked against the pinned hash; the mark at the end of the minute holding an instant (a minute without one takes the previous minute's up to 5 minutes old, R8's 300 s); trade counts; funding by **nominal** hour (R8-REVIEW note 4), a settlement without a mark unpriced, a missing row counted |
| `returns.mjs` | one leg by the minute (A.0-2, A.0-3): gross before costs; net after the setting's spread and fee on both legs and funding — R8's `legReturn` on minute marks |
| `nulls.mjs` | **the exact matched null** (A.0-4), and the per-minute count of a population's own trades it leaves out |
| `costs.mjs` | the cost settings: **taker, the default** (the base fee, 4 bps a leg — ANT-USD 2 bps under its override — plus R8's session-pair table of half-spread and depth) and maker (1.25 bps a leg, no spread); New York sessions kept per minute |
| `stats.mjs` | R8's cluster bootstrap (with the share of resampled means at or above zero) and exact sign test; A.0-6's t-tests on day means and on trader means, the larger p deciding; the day-by-day difference and Welch on trader means; Spearman with a permutation p; Holm with every frozen hypothesis in m; Student's t and its critical value |
| `check.mjs` | the fingerprint check a study calls at its start |
| `cells.mjs` | [Final review, F4: added] the markets an entry may count in (A.0-7): pre-IPO and R8's five out, a retired market from its settlement's UTC day, a split refused until the module handles it — one definition, where five scripts had their own |
| `data/` | byte-identical copies of frozen inputs (R8's price table `9f559b4a…`, `selection.json` `c20c3f80…`, classifier v1 `f7f32f22…` and `d803192c…`), `rulebook.json` (the rule book as read 2026-11-10 14:55Z), `population.json` (the pool as read 2026-11-07 00:48Z: 1,702 accounts, 1,000 on the all-time notional board, 100 holdout; 13 excluded), `panel-manifest.sha256` |
| `test/`, `mutate.mjs` | 36 tests (`node --test`), 54 mutants [Final review, F4 and F7: 37 tests, 59 mutants] |

**The exact null, in one paragraph.** For an entry at instant t in a market,
every minute of t's UTC hour weighs its trade count, less the trades of the
accounts the study removes; a trade is followed after the entry's own delay
D and held the entry's horizon, priced like the entry; its direction is long
with the trader's long share (A.0-4). Klines give a minute's count, not each
trade's second, so a trade is taken as uniform within its minute: its follow
instant falls in the minute `floor(D / 1 min)` after its own with
probability 1 − φ and in the next with φ = (D mod 1 min) / 1 min — exact
under that assumption (a test checks it against a sum over every
millisecond). **Klines carry no buyer or seller side, so a null in each
trade's own direction — R8's primary — cannot be built this way;** only the
matched null can (question 1).

**R8-REVIEW's code findings, and what became of them:** duplicated
definitions (groups, removal, delay, voted rule) — one each; dead code —
none [Final review, F7: wrong — `toEvents`' `takerNotional` (added for entry
4, which is not registered) and `buildEntries`' `reopenedInMerge` (R8's flag
for its mirrored money, which the kit does not compute) had no reader, and
are removed; the fields of R8's event record no script reads (`t1`, `n`,
`notional`, `liq`, `tids`) stay as R8's record, pinned by the tests]; `analyze.mjs` untested — the analysis layer (the leg, the null, the
cell rules, the counters) tested and mutated; the null's silent fall-through
— the exact null draws nothing, so no loop can run out; no boundary parse of
market rows — the panel builder parses every row and counts what it drops or
refuses; a counter counting legs — missing funding counted in hours; a side
effect at import — none (data is read on first use); short names — longer
ones.

**How a study uses it:** `import { checkKit } from '<kit>/check.mjs'`; print
`checkKit()` — it throws on any file that differs from the fingerprint, on a
missing file and on an extra one — then import what it needs. [Final review,
F7: a session that runs the kit's tests or mutants sets `RESEARCH_KIT_TMP` to
its own scratchpad; they wrote by default into this session's scratchpad,
now into a fresh folder in the system's temp folder, removed after.]

**Its fingerprint:**
`872dd5acbe6159052b60faa357446f405e173f1ed727049a93e409b159506246` — the
SHA-256 of `kit/FINGERPRINT.sha256` (24 files, the pinned panel manifest
among them). [Final review, F4 and F7: now
`7b4179e897faa34758de8508cef47a84e7c2504ec5eb9974526f55041bdfc215`, 26
files; the panel manifest unchanged.] [Addendum 2: now `2d3667b5…09aa`, 33
files.] `scripts/test-check.mjs` proves the check on a copy: it passes
unchanged and throws on one changed byte, an added file and a missing file
(`out/test-check.txt`). Every proof and measurement script checks it at its
start; the final run of all twelve (`out/final-run.txt`, 2026-11-11 01:20Z)
gave every printed figure of the earlier runs again, the derived index byte
for byte (the proof's full-precision numbers moved in their 16th digit: the
funding prefix sums now start further back).

**Its proof against R8** (foundation 2's "done when"):

1. **The entries — exact.** The kit's builder on R8's 52 tracked accounts
   returns R8's 1,946 groups (1,252 openings, 24 flips, 670 adds) with the
   same account, instrument, first-fill instant, type and side, none missing
   on either side; **the primary arm's openings and flips are R8's 1,272**
   (47 accounts); the delay is R8's for 1,919 of 1,919
   (`out/proof-entries.txt`). The labeller agrees too: at T0 it calls 194 of
   the notional board's 1,000 accounts directional, R8's count, all 104 of
   R8's eligible accounts among them (`out/check-labels-r8.txt`).
2. **Priced by the minute** (the taker setting = R8's costs;
   `out/proof-pricing.txt`): the mean net result on R8's primary cell is
   **−16.36 bps**, trader-clustered [−29.68, −5.54], against R8's **−16.60**
   [−29.98, −5.87] by the second — **the minute moves the mean by +0.24
   bps**; entry by entry the two differ by 13.0 bps (sd), 7.1 bps on average
   in size (the mark at the minute's end against the mark at the second, at
   entry and at exit).
3. **With the exact null:** d = **−2.64 bps**, by trader [−13.72, +8.16], by
   day [−18.47, +12.94] (1,231 entries; in 18 entry hours no trade is left
   but the tracked accounts' own) — **inside R8's intervals around −13.58**
   (by trader [−34.33, +0.44], by day [−26.95, −0.83]). [Final review,
   F8(b): −2.64 is net minus net, as R8's d was; A.0-4's d, gross minus
   gross, is −2.53, inside both intervals too.] It is not R8's
   statistic: R8's null kept each drawn trade's own taker side; the exact
   null takes the trader's long share (A.0-4). Like for like, R8's own drawn
   trades priced by the minute give −13.59 with their own sides (R8: −13.58)
   and −5.89 with matched sides (R8's secondary: −6.04) — **the minute moves
   either by under 0.2 bps**; the exact null sits 3.3 bps from the drawn
   matched null, about one standard error of three draws' mean.

**The mutants:** 54 of 54 killed [Final review, F4 and F7: 59 of 59, on 37
tests] (`out/mutation.txt`): every rule that
decides something broken on purpose in a copy, the copy's tests run, a
failure expected. A baseline copy must pass all 36 tests first, so a run
that tests nothing cannot count as a kill. The first run killed 47 of 52;
each survivor was a missing test (a flip back after a forced flip,
`total_fee` unlike `fee`, Holm going on after a failure, the permutation p's
+1, adds in the long share), now written.

## 3. The first measurements (counts and spreads only)

Every count uses the kit. "P1 at its week" = the account's v1 label on the
14 days before the entry's Monday is directional and the capture covers
them. Primary-cell markets = A.0-7's list left out (pre-IPO, PRL, NCLD,
SKHYNIX, SAMSUNG, CXMT; KIOXIA from its settlement day). [Final review, F4:
one definition now, `kit/cells.mjs`; three scripts had left KIOXIA out
whole — measurement 5, the spreads and A.2 moved a little; the map leaves
it out as retired before any exam.] The launch week
starts Monday 2026-08-31 (the public launch, 2026-09-03). The pool's index
(`scripts/index-pool.mjs`, 21 s): 1,702 accounts, 1,272,487 fills, 126,033
openings and flips before the cut, 1,044 accounts ever directional in a
covered week (`out/index-pool.txt`; the index itself on `F:\derived\`).
Spreads are root mean squares of the market's own move at the test's
instants — never signed by a trader's side, so no outcome is computed
(`out/m-spreads.txt`).

1. **Openings and flips of directional accounts** (`out/m1-entries.txt`,
   `.tsv`): 17,453 P1 entries in primary-cell markets (744 accounts); from
   the launch week (9.71 weeks) **10,612 — about 1,090 a week, 578 accounts,
   7.3 entries per active trader-week** (R8's 50: 4.43) [Final review,
   F8(a): unlike measures — R8's 4.43 counts every week of its 47 traders,
   active or not; on that basis the 240 traders with 20 entries make 3.24 in
   R8's six weeks, the figure A.2 uses]. By hold class:
   under 2.45 h 4,856; 2.45–6 h 1,103; 6–12 h 699; 12 h and more 854; under
   10 closed cycles 3,100. **Slow traders (median hold ≥ 6 h): 1,553 entries,
   112 accounts, 68 days.** 85% are on the all-time notional board.
2. **Traders with ≥ 10 entries in odd and in even ISO weeks**
   (`out/m2-halves.txt`): **139** (P1 at the entry's week; 77 from the launch
   week alone); counting every entry of accounts ever directional, 355 (242).
   Traders with ≥ 20 entries in all: 240.
3. **Runs reaching a fifth taker order** (`out/m3-runs.txt`): in weeks the
   capture covers and before the competition, **3,182 runs (350 a week) of
   327 accounts, 81 with ten or more**; 1,116 more inside the competition
   (from 2026-11-02 14:30Z); 6,728 of 89 accounts whose capture R2's page cap
   cut short, set apart (their runs bunch in the last days by construction).
   The largest group is algorithms (1,296 of the 3,182); directional 409.
4. **Agreement events** (`out/m4-agreement.txt`): **188 from the launch week
   (19 a week), on 59 days, in 13 markets — 124 on BTC and 36 on ETH.** The
   rule that no directional account opened the other side stopped 626
   candidates; links stopped 28 (8 pairs with ≥ 20 shared trades, 3
   copy-pattern pairs, the three-hex-digit prefix).
5. **Market-days with funding above five times the floor**
   (`out/m5-funding.txt`; the floor 0.0000125 an hour for crypto, 0.00000625
   for the rest): **293 in primary-cell markets** (rate above zero, longs
   pay: 166; below: 127) on 61 days in 49 markets — equities 153, crypto 90,
   commodities 29, indices 21; UNITREE 33, ZM 21, CRCL 18, BRENTOIL 16 the
   most. The next 24 hours' move: RMS **501 bps**; on a day with several
   such markets their raw moves correlate **0.145** (A.2 assumed 0.4);
   design effect 2.0. [Final review, F4: with KIOXIA-USD's days before
   2026-09-28 in, as the stated rule has it: 303 (longs pay 173, shorts 130)
   in 50 markets, equities 163; RMS 502 bps; correlation 0.162; design
   effect 2.1.]
6. **Entries a week at UTC 12–16 and 00–04** (`out/m6-blocks.txt`; the
   follow instant's hour, as R8): the 50 — 64 a week at 12–16, 21 at 00–04;
   **385 and 125 in R8's six weeks; under R8's own cell definition 387, R8's
   figure exactly.** Every account labelled directional on the 14 days
   before the cut (303; `out/directional-at-cut.txt`, a candidate list): 239
   a week at 12–16 in R8's six weeks, 195 in the four weeks before its label
   window — **about 1,170–1,430 entries in a 42-day exam, 3.0–3.7 times the
   50's** (A.2 guessed 6.4).
7. **The variance of d** (`out/m7-variance.txt`, R8's stored 1,249 entries):
   var(d) / var(r) = **1.38**; the three drawn trades' own noise is **23.8%
   of var(d)** — an exact null's interval about 12.7% narrower, what
   IDEAS-REVIEW's arithmetic said. Measured directly by the minute
   (`out/proof-pricing.txt`): the exact null's d has **30.7% less variance**
   than d with three drawn matched trades (intervals **16.7% narrower**), and
   about the variance of r itself.
8. **The map** (`out/m8-map.txt`; every cell, both half-periods and both
   directions in `out/m8-map.tsv`; FIND's 65 days, every minute a start): the
   break-even share of right calls, ½ + cost ÷ (2 × mean absolute move):

   | A taker | 1 h | 6 h | 24 h | 72 h |
   |---|---|---|---|---|
   | primary-cell markets **closed** (above 55%) | **82 of 84** | 41 of 84 | 4 of 84 | 1 of 84 |
   | crypto majors (median) | 63.5% | 55.2% | 52.0% | 50.4% |
   | small coins | 59.2% | 53.6% | 51.5% | 50.6% |
   | equities | 66.9% | 56.2% | 52.4% | 50.7% |
   | indices | 70.4% | 57.3% | 52.4% | 50.5% |
   | commodities | 68.6% | 57.1% | 52.3% | 49.5% |

   A market counts as closed when both directions are; with funding, one
   direction is closed in 15 markets at 24 h and 8 at 72 h. The halves hold
   the picture, the edge cells move: at 1 h 81 then 84 of 84 closed, at 6 h
   44 then 34, at 24 h 9 then 3.
   BTC at 1 h: a mean move of 24.2 bps against an 8.2 bps round trip — 67.0%
   (A.2's "about six in ten on a major coin" was too kind); SP500-USD at 1 h:
   8.1 bps against 8.3 — 101%, a cost no share of right calls covers. For a
   maker: 14 of 84 closed at 1 h, 2 at 6 h, none at 24 h. Funding is a small
   part at 24 h (a long on BTC paid 2.2 bps a day).

**What they mean for each entry's smallest visible effect** (A.2 recomputed;
`out/a2-recompute.txt`; k from A.0-13, its lines recomputed in section 7):

| Entry | Measured count | Measured spread (bps) | Visible in FIND | Visible at the final exam | A.2 had |
|---|---|---|---|---|---|
| 1 traders differ | 139 traders with ≥ 10 a half (355 counting every entry of accounts ever directional) | d 183 a trade at the class horizon | a correlation of 0.24 — about 17 bps between traders (with 355 traders: 0.15, about 11 bps) | top minus bottom fifth 36–39 (240 traders with ≥ 20 entries; about 930 entries a fifth) | 0.20 → 17–28; 40–43 |
| 3 slow traders | 1,553 entries, 112 accounts | 382 at 24 h | 32 (47 if 24-hour windows cluster by day three-fold) | 52–56 (about 960 entries) | 23–34; 36–58 |
| 4 kinds of entries | 10,612 from the launch week (17,453 in all FIND weeks) | 183 | 16 (12) for an even split | 19–21 (about 6,550 entries) | 15–42; 18–51 |
| 5 the first minute | 1,249 (R8's cell) | 15.6 over 60 s | 1.8 [Final review, F2: 1.9 — A.0-6's design effect for R8's drawn d, 1.65, not the entry-level 1.57] | — | 2.3–3.7 |
| 7 large orders | 3,067 runs, 327 accounts [Final review, F4: 3,182, as in section 3] | 91 over 30 min | 5–9 counting runs; 33 if each account counts once [Final review, F2: A.0-6 tests equal-weight account and day means: 9–32 — the account test alone needs 9.4 even if runs were independent, since most of the 327 accounts have few runs] | about 1,560 runs of 81 accounts in 42 days [Final review, F4: about 1,640] | 8–26 |
| 8 funding | 293 market-days, 61 days [Final review, F4: 303] | 501 over 24 h [F4: 502] | **120** | — | about 150; register only under about 60 |
| 9 agreement | 188 events, 59 days | 130 over 6 h | 27–57 [Final review, F2: 33–48 — A.0-6's equal-weight day means, the events independent within a day to a day as one unit] | 43–47 (about 116 events) [Final review, F2: about 52–84, the events a day as in FIND] | 20–37; 32–66 |
| 10 the US open | the 50: about 385 in 42 days; all directional: 1,170–1,430 | R8's standard error 14.1 on 387 | — | the 50: 51–55 (42–46 with the exact null); all: 26–32 (22–26) | 51–55; 20–22 |

The clustering used is measured on R8's cell as A.0-6's tests see it (day
means 1.38 for a d, 3.57 for a net result — section 7, item 2) and is an
assumption for other horizons and populations. Entries 2 and 6 are sized at
the freeze by their lists' counts. [Final review, F8(g): entries 3, 7 and 9
count from the launch week, entry 1 every FIND week, entry 4 both; entry 3
over every week has 2,538 slow entries, not 1,553 (about 25 bps visible,
if the spread holds) — each entry must say which period it uses.] [Final review, F1: every count here is
before A.1-8's map is applied to the entries' own cells; applied as fixed, it
leaves about a fifth of entries 1 and 4 and almost none of entries 7 and 9 —
question 5.] [Final review, F2: entries 7, 8 and 9 were sized with clusters
weighted by their items (Kish's n, a design effect 1 + (m − 1)ρ); A.0-6
tests equal-weight account and day means, so `a2-recompute.mjs` now takes
their standard errors from the measured cluster sizes, the correlation
within a cluster at its bounds (independent; one unit) where it is not
measured. Entry 8 is unchanged by it: 120 bps at the measured correlation.]

## 4. Variations weighed

- **The exact null's minute:** a trade's follow minute split by D exactly
  (chosen), against taking every trade at its minute's start or middle (a
  step in D), or reading the tape (the cost the exact null avoids).
- **The null's direction:** matched (A.0-4; chosen, the only one klines
  allow), against R8's own taker side (the tape of every hour).
- **The pull's order:** 10,000-minute segments from the cut backwards across
  all markets (chosen: R8's period complete after 5.5 hours), against market
  by market (the proof would have waited for the last market).
- **Funding:** by nominal hour (chosen; R8-REVIEW note 4, and what the
  changelog of 2026-09-01 describes), against by stamp (R8: differs only in
  the ~40 ms after the hour, and once 46 s).
- **Labels:** weekly, from the 14 days before each Monday (chosen, point
  2.22), against one label at one instant (R8's T0).
- **The panel's form:** raw replies kept whole plus a built file a market
  (chosen: one read for a study, hashed, rebuilt from raw byte for byte),
  against raw replies only.
- **The 13 accounts from late boards:** excluded (chosen: they came from
  profit boards read 2026-11-07 23:50Z — A.0-9 forbids them even as a
  secondary population), against a secondary population.
- **Spreads:** the root mean square of the market's own move at the test's
  instants (chosen: direction-free, no outcome), against the spread of d
  itself (an outcome's neighbour).
- **Runs:** only weeks the capture covers (chosen), against every captured
  run (the page cap bunches them at the end).
- **Clustering for A.2:** as A.0-6's cluster-mean tests see it on R8's cell
  (chosen: the line a test really faces), against entry-level design effects
  (smaller for a net result: 1.84 against 3.57).
- **KIOXIA-USD's close-only start:** its settlement day (the only day known
  to be close-only; chosen), against a guess earlier.

## 5. Potential problems, and how each is handled

| Problem | Handling |
|---|---|
| **The blind store** | the fills reader throws on a row at or after the cut; the panel builder refuses such rows (none met) and the reader throws on them; the client refuses a history read without both stamps or ending after the cut (marks may end at the cut itself: no bucket starting at it can return); R2's light files never opened; `pool.json.gz` parsed once, and only its account keys and their board names taken (no rank, profit or other value printed or used); the 13 late accounts excluded; R8's `probe/` never opened; `/v1/info/pnl` not read (item 5, section 8) |
| Fills with ids above 2^53 − 1 | 3,403 rows of one account on 2026-05-07/08 (WTIOIL, SILVER) fail the boundary check: dropped and counted (`out/check-dropped.txt`), never read as numbers |
| Truncated captures (139 accounts) | a week counts only where the capture reaches 14 days back; truncated accounts' runs set apart |
| The competition (A.0-8) | runs split at 2026-11-02 14:30Z; the studies print every result without it |
| The minute's look-ahead (up to 60 s) | the same for an entry and its null; against the second it moved R8's mean by 0.24 bps and each entry by 13 bps (sd) |
| Holes in the marks | none from the launch week to the cut; before it 17 exchange-wide pauses (section 1): the reader takes the previous minute's mark up to 5 minutes old, prices nothing later in a pause, and counts it — a study reaching into May–August meets them |
| Missing funding rows | 13 hours from the launch week, 3,267 before it — the API's own gaps (section 1): charged nothing, counted |
| Cost tables from two November mornings | R8's, kept as approved (decisions 2026-11-09); stated |
| Uniform seconds inside a minute (the exact null) | stated; R8 found the klines' minute counts equal the tape's in 2,471 of 2,472 minutes, and the panel equals R8's klines in 23,346 of 23,346 |
| Holdout accounts | their fills before the cut are used, as R8 did; D1's data is after 2026-11-07 and untouched |
| A list that is not yet frozen | "directional on the 14 days before the cut" is a candidate with a hash, for the supervisor to freeze |
| Entry 2's list (c) | "the all-time profit board's top 100": our only copy was read 48 minutes after the cut, and A.0-9 forbids accounts taken from a profit board read after it — question 4 |
| The 1-hour class | 82 of 84 markets closed for a taker at 1 h, and A.1's rule bars closed cells from a primary cell: entries 1 and 4 score many traders at 1 h — question 4 [Final review, F1: and far more — 41 of 84 markets at 6 h with BTC, ETH and SOL; entries 7, 9 and 10 too: question 5] |

## 6. What stays unknown

- Whether `/v1/info/pnl` honours `end_timestamp` (documented nowhere; item 5).
- When KIOXIA-USD turned close-only (the API gives only the settlement).
- How strongly results cluster at 24–72 h and in populations other than R8's
  50: the design effects are R8's cell's, mostly at 1 h.
- The buyer/seller split of each minute's trades (an own-direction null).
- The owner's own cost setting (to be talked through; decisions 2026-11-10).
- How representative the months before the launch are (fills from
  2026-05-06; the studies mostly use the weeks from 2026-08-31).

## 7. Beyond the brief

1. **A.0-11's lines, recomputed** (`out/a2-recompute.txt`; Student's t, A.0-11
   said "recompute at the freeze"): first exam (22 df) t ≥ 3.12, 3.58, 3.79,
   3.99, 4.15 for m = 1, 3, 5, 8, 12 (A.0-11: 3.2, 3.6, 3.8, 4.0, 4.2); the
   final exam's first step (41 df) t ≥ 2.07, 2.54, 2.74, 2.92, 3.07 — k =
   2.91, 3.38, 3.58, 3.76, 3.92 (A.0-13: 2.9, 3.4, 3.6, 3.8, 3.9); FIND k
   2.84 (A.0-13: 2.85); Holm over eleven, first step, k 3.78 (A.2: 3.8).
2. **A.0-6's day test weighs every day the same, and that costs power when
   entries bunch.** On R8's cell the net result's day means average −8.18 bps
   (standard error 11.1, p 0.46) where the entry-weighted mean is −16.60 and
   the day bootstrap's interval excludes zero; the trader means give −19.14
   (p 0.008); the larger p decides. The design effect a line faces is 3.57
   for a net result, 1.38 for d with the exact null (day means). A.2 above
   uses these; a study whose entries bunch on a few days should expect its
   day test to be the weaker of the two. [Final review, F3: −8.18 and −16.60
   are R8's stored results (by the second), −19.14 is the minute's; by the
   second the trader means give −19.69 (p 0.007). And equal day weights cost
   power for the net result (design effect 3.64, against 1.88 for the
   entry-weighted mean with a day-clustered CR1 error), not for d with the
   exact null (1.38 against 1.94); for entries 7 and 9 it depends on how far
   a cluster moves as one (`out/fr-a06.txt`, `out/fr-a2.txt`). Question 6.]
3. **The yardstick's direction moves d by about 11 bps on R8's cell** —
   own taker side −13.6, matched −5.9 (drawn) and −2.6 (exact): random
   takers' own direction carried about +8 bps over the next hours (R8's own
   numbers: its nulls' mean net −3.0 against a cost of 11.2). Whichever null
   a register entry names decides much of its d; A.0-4 names the matched one.
4. **The candidate frozen list:** the 303 accounts labelled directional on
   the 14 days before the cut, `out/directional-at-cut.txt`, SHA-256
   `ac3570b6…e467` — foundation 1's rule (b) and entry 10's CONFIRM list.
5. **The derived index** on `F:\derived\` (every opening and flip of the pool
   with its week's label and habits, the account-weeks, the runs, the shared
   pairs; hashes in `out/index-pool.txt`): a study may start from it, or
   rebuild it with the kit in 21 s.
6. **The panel as a second copy of R8's market data:** it re-reads, minute by
   minute, everything R8's look priced, and agrees to the digit.

## 8. Questions for the owner (each with a recommendation)

1. **One yardstick for round 2.** The exact random-trade yardstick can only
   take the trader's own long share as its direction (A.0-4): the minute data
   cannot tell buyers from sellers, which R8's version used. Building R8's
   kind exactly would mean reading every trade of every hour studied — about
   R8's capture again for each study. *Recommendation: the matched yardstick
   only, as A.0-4 says; R8's drawn trades printed beside where they exist.*
   [Final review, F5: kept, with its cost. Entry 10's FIND pass (R8's d
   −38.35 at UTC 12–16) was measured against R8's own-direction null, and on
   R8's whole cell the direction alone moved d by about 11 bps (section 7,
   item 3). With the matched yardstick as the only one, that cell must be
   measured again with the exact matched null on R8's data before entry 10
   is registered; it may not pass FIND again.]
2. **The funding study (entry 8).** With the measured counts it can see only
   about 120 bps, where IDEAS-REVIEW's own rule (point 2.8) registers it only
   under about 60. *Recommendation: leave it out of this batch (m one lower)
   and revisit it on months of the collector's data.*
3. **The funding rule (the brief's item 5).** [Final review, F8(f): the
   recommendation stands, but the quote below came through a summarising
   fetch tool (section 9); confirm it word for word on the changelog page
   before a rule rests on it.] The changelog of 2026-09-01
   says funding "settles even if you flattened or flipped just before
   settlement was sequenced": the position held when the hour closes pays,
   even if closed in the moment before the payment is booked; one closed
   before the hour does not — R3's rule, by nominal hour, as the kit charges
   it. The empirical check (one account's fills against `/v1/info/pnl`) was
   not made: that route's `end_timestamp` is documented nowhere, and any test
   of it could return profit after 2026-11-07. *Recommendation: settle it by
   the changelog; no read, or one only when reads after the cut are allowed.*
4. **For the register (the supervisor's, before the freeze):** (a) entry 2's
   list (c), "the all-time profit board's top 100", comes from a board read
   48 minutes after the cut — *replace it by the pool accounts with the
   highest realized profit net of fees from their own fills before the cut;*
   [Final review, F6: kept, with one more check — 139 of the pool's captures
   are truncated by R2's page cap, so an all-time sum from captured fills
   undercounts the busiest accounts: rank on a window every capture covers,
   or first complete those captures with fills reads ending before the cut.
   The pool itself rests on the same 00:48Z read, its profit boards included
   (A.0-9 names it the primary population); what A.0-9 forbids here is a
   post-cut row's rank.]
   (b) at 1 h a taker's cell is closed in 82 of 84 markets, while entries 1
   and 4 score one-hour traders there — *score them at 6 h, with 1 h printed
   beside;* [Final review, F1: withdrawn — at 6 h BTC, ETH and SOL are
   closed too, and 7,248 of the 10,612 entries would still sit in closed
   cells; the rule's reach is question 5.] (c) *freeze the 303-account list
   (section 7, item 4) after checking it.* [Final review, F6: checked — all
   303 in the pool, lower case, sorted; 16 are holdout accounts, whose fills
   after the cut are D1's unseen data until D1 is scored (A.0-10), so D1
   must be scored before the first exam's capture; 122 entered the pool
   through the profit boards read at 00:48Z and 181 are on the notional
   board — print the two apart at the exams; 16 of R8's 50 are in it.]
5. **How far the map's rule reaches (A.1-8)** [Final review, F1: new].
   Applied to each entry's own cell — a taker, FIND's 65 days, the entry's
   own direction (`out/fr-a2.txt`): at the class horizon 8,463 of the 10,612
   P1 entries from the launch week sit in closed cells (the 1 h class 4,833
   of 4,856; the 6 h class 3,501 of 4,902, because BTC, ETH and SOL are
   closed at 6 h — 56.7%, 55.2%, 55.05%); entry 9's events at 6 h, 179 of
   188; entry 7's runs, 3,159 of 3,182 already at 1 h, and it holds 30
   minutes; entry 10's cell (R8's 50) is mostly at 1 h. At 24 h, 9,235 of
   the entries and 179 of the events are open. As fixed, the rule leaves
   entries 1 and 4 a fifth of their entries, entry 9 nine events and entry 7
   almost none (23 runs open even at 1 h). *Recommendation: (a) judge the d-based entries (1, 4, 6, 9, 10; 3
   is at 24 h already) in their primary cells at 24 h, the class horizon and
   entry 9's 6 h printed beside, deciding nothing — the round looks for a
   pattern that pays a taker, and at 1 h and 6 h the main markets cannot;
   (b) leave the map out of entries 7 and 8, whose statistic is already a
   taker's net result; (c) recompute A.2 for those horizons before the
   register is drafted: the move at 24 h is about twice the class horizon's
   (RMS about 380–410 bps against 184), so their smallest visible effects
   about double.* The map is a taker's (the default, the owner 2026-11-10);
   the owner's own setting, once defined, may open more cells.
6. **What A.0-6's day test measures** [Final review, F3: new; the brief's
   addendum, point 3]. A plain t-test on day means gives every day one
   weight, so it tests the mean of day means, not the entry-weighted mean
   every report quotes. On R8's cell, by the second (`out/fr-a06.txt`,
   computed without the kit): day means −8.18 (se 11.12, p 0.47), trader
   means −19.69 (se 7.02, p 0.007); the entry-weighted mean −16.60, with a
   cluster-robust (CR1) error by day 8.00 (p 0.044) and by trader 6.04 (p
   0.009). Options: (a) A.0-6 as written — robust to a few busy days or
   accounts ("one day, one vote", like the votes); for d with the exact null,
   the statistic most entries test, it had the smaller error on R8's cell
   (design effect 1.38 against 1.94), for a net result the larger (3.64
   against 1.88); (b) the entry-weighted mean with CR1 errors by day and by
   trader, clusters − 1 degrees of freedom, the larger p deciding — what a
   follower earns, more power for net results and less for d, and one busy
   day or account can carry the estimate; (c) (a) deciding, (b) printed
   beside. *Recommendation: (c) — keep A.0-6 as written; print the
   entry-weighted mean with its two CR1 errors beside every result, deciding
   nothing; name in each entry which mean its line tests. A.2 is computed as
   (a) sees it.*

## 9. For external-apis (new facts, dated and sourced)

- **2026-11-10 15:04Z, live** (`out/probe-end.txt`): `mark-history` at 1 m
  returns a bucket only if the bucket ends by `end_timestamp` (end
  12:00:00.000 or 12:00:59.999 → last bucket 11:59; 12:01:00.000 → 12:00);
  klines at 1 m include a candle opening at `end_timestamp` (end
  12:00:00.000 → 12:00 included), as R8 found.
- **The pull, 2026-11-10 15:05:52Z – 2026-11-11 01:16:54Z**
  (`out/audit-calls.txt`): 15,944 calls (16,116 with the probes), 90,210
  weighted tokens in all, every reply HTTP 200, no 429, at most 150 tokens in
  a trailing minute; latency median 295 ms. `mark-history` 1 m pages hold
  1,000 buckets ascending with `more` [Final review, F8(c): a page is a span
  of time, not 1,000 rows — 169 of the 11,514 pages said `more` with fewer
  rows (453–988), all before the launch where marks have holes, most
  reaching 1,003 minutes past their start; page from the last row, as the
  pull did]; a bucket exists for every minute from
  2026-08-31 to the cut on all 90 markets (8,304,742 minutes); before it the
  history has 17 exchange-wide pauses, the longest 1,646 minutes from
  2026-06-13 01:20Z, the last ending 2026-08-11 11:55Z. 1 m klines add up to
  the 1 d klines' trade counts on every fully pulled market-day (8,010).
  `funding` with `start_timestamp` and `end_timestamp` pages back by `end` =
  the oldest row (exclusive), 100 a page; no row for 13 hours from
  2026-08-31 (mostly a market's first day) and for 3,267 before it.
- **R2's capture, read 2026-11-10:** fills of 2026-05-07/08 carry `trade_id`
  and `order_id` above 2^53 − 1 (3,403 rows of one account, WTIOIL-USD and
  SILVER-USD) — not exact as JSON numbers; later fills fit.
- **The rule book, 2026-11-10 14:55Z:** 90 instruments; KIOXIA-USD (51)
  `close_only`, settled as recorded; ids 12, 91–95, 98 empty; `stock-splits`
  no events (sequence 102317252065); fees unchanged (taker 0.0004, maker
  0.000125, seven tiers); ANT-USD's override from 2026-10-29T15:23:35.757Z,
  base tier taker 0.0002 and maker 0.0000625.
- **The changelog** (read 2026-11-10 ~15:37Z through a summarising fetch tool;
  quotes as the tool returned them): 2026-09-01 "Funding for a just-closed
  window now settles even if you flattened or flipped just before settlement
  was sequenced"; 2026-09-14 `/v1/info/pnl` and `/v1/info/equity` "page by
  time window, never by cursor"; 2026-10-27 `/v2/info/pnl`: "The effective end
  is the earlier of `end_timestamp` and now, rounded down to the minute,
  exclusive"; 2026-10-29 a funding multiplier applies to a period that starts
  inside its window, the whole period, no proration. No entry gives
  `/v1/info/pnl` an `end_timestamp`.

---

## Evidence list

In `workers/RESEARCH-KIT/` unless F: is named.

- **The kit:** `kit/` (24 files [Final review, F4 and F7: 26, fingerprint
  `7b4179e8…c215`] [Addendum 2: 33, `2d3667b5…09aa`]; `kit/FINGERPRINT.sha256`, fingerprint
  `872dd5ac…6246`, `out/fingerprint.txt`); tests `out/test-kit.txt` (36 of
  36), mutants `out/mutation.txt` (54 of 54), the check `out/test-check.txt`;
  the final run `scripts/run-final.mjs` → `out/final-run.txt` (every output's
  SHA-256), with `scripts/add-check.mjs`, `diff-json.mjs`.
- **The panel:** `scripts/plan-panel.mjs`, `plan-cost.mjs`, `api.mjs`
  (`out/test-api.txt`, 4 of 4), `rawstore.mjs`, `pull-panel.mjs`,
  `build-panel.mjs`, `check-raw.mjs`, `probe-end.mjs`; `out/plan-panel.log`,
  `out/plan-cost.txt`, `out/panel-plan.json`, `out/probe-end.txt`,
  `out/pull-heartbeat.log`; F: `raw/`, `panel/` (with `coverage.json`),
  `done.jsonl`, `calls.jsonl`, `MANIFEST.sha256` (`93c985e5…be15`),
  `trial-1500Z/` (the trial, unused); `scripts/audit-calls.mjs`,
  `coverage-periods.mjs` → `out/audit-calls.txt`, `out/coverage-periods.txt`,
  `out/build-panel-final.txt`.
- **The data the kit holds:** `scripts/build-kit-data.mjs`
  (`out/build-kit-data.txt`), `scripts/make-fingerprint.mjs`.
- **The proof:** `scripts/proof-entries.mjs`, `proof-pricing.mjs`,
  `check-panel-r8.mjs`, `check-labels-r8.mjs`; `out/proof-entries.txt`,
  `out/proof-pricing.txt`, `out/check-panel-r8.txt`, `out/check-labels-r8.txt`,
  `out/r8-capture-check.txt` (R8's capture, 474 of 474 files verified).
- **The measurements:** `scripts/index-pool.mjs`, `m-entries.mjs`,
  `m-runs-agree.mjs`, `m5-m8-panel.mjs`, `m7-variance.mjs`, `m-spreads.mjs`,
  `a2-recompute.mjs`, `check-dropped.mjs`, `peek-coverage.mjs`; `out/m1-…`
  to `out/m8-…`, `out/m-spreads.txt`, `out/a2-recompute.txt`,
  `out/numbers-*.json`, `out/index-pool.txt`, `out/check-dropped.txt`,
  `out/directional-at-cut.txt`; F: `derived/`.
- **Inputs:** `inputs/SHA256SUMS` (86 of 86 verified at the start).
- **The Final review** (2026-11-11): `scripts/fr-calls.mjs` →
  `out/fr-calls.txt` (calls against replies; the panel rebuilt from `raw/`);
  `scripts/fr-kit-values.mjs` → `out/fr-kit-values.json` and
  `scripts/fr-pricing.mjs` → `out/fr-pricing.txt` (the independent pricing);
  `scripts/fr-a06.mjs` → `out/fr-a06.txt` (A.0-6, without the kit);
  `scripts/fr-a2.mjs` → `out/fr-a2.txt` (the map on each entry's cell, A.0-6's
  cluster sizes); `progress.md`, section "Final review".
- **Rules I broke:** three `node -e` one-liners — an inspection of
  `selection.json` (2026-11-10 14:5xZ), a print of `numbers-proof.json`
  (20:3xZ), and an empty one typed by mistake (2026-11-11 01:19Z); code-rules
  want scripts in files. `kit/test/mutate.mjs` first sat where the test runner
  ran it as a test (moved to `kit/mutate.mjs`; the baseline check now guards
  against a run that tests nothing). Two edits made with `sed`
  (`scripts/m-spreads.mjs`), the second corrected with the Edit tool.

---

## Final review (2026-11-11 10:40–11:24Z, a fresh RESEARCH-KIT subagent, Opus 5.5, max)

The brief's addendum: is the work right, not only reproducible. No API call
was made; nothing stamped at or after the cut was read. Each correction above
is marked in place ("Final review, F<n>"); nothing was edited silently. The
review's scripts are `scripts/fr-*.mjs`, their outputs `out/fr-*.txt`; the log
is `progress.md`, section "Final review".

**Findings, by severity**

| | Finding | What was done |
|---|---|---|
| F1 high | A.1-8's map reaches far beyond question 4(b): at the class horizon 8,463 of the 10,612 P1 entries from the launch week sit in cells closed for a taker (BTC, ETH and SOL are closed at 6 h too), 179 of entry 9's 188 events at 6 h, entry 7's runs at any horizon up to 1 h; "score one-hour traders at 6 h" leaves 7,248 closed (`out/fr-a2.txt`) | question 4(b) withdrawn; question 5 |
| F2 medium | A.2's figures for entries 7 and 9 weighted clusters by their items, where A.0-6 tests equal-weight account and day means; entry 5 used an entry-level design effect | `a2-recompute.mjs` fixed; the A.2 table corrected |
| F3 medium | Section 7 item 2 (A.0-6's day test) pairs a by-the-second figure with a by-the-minute one, and its "costs power" holds for the net result but not for d | corrected; question 6 |
| F4 medium | The primary-cell market rule (A.0-7) was written in five scripts in two versions (KIOXIA-USD before its settlement day in or out), so entry 7 had 3,182 runs in section 3 and 3,067 in A.2 | one definition in the kit (`cells.mjs`, a test, five mutants); every script on it; numbers that moved corrected |
| F5 medium | Question 1 leaves out its cost: entry 10's FIND pass rests on R8's own-direction null | added to question 1 |
| F6 low | Question 4(a) undercounts the 139 truncated captures; 4(c)'s list holds 16 holdout accounts and 122 from the profit boards | added to question 4 |
| F7 low | The kit's tests wrote into this session's scratchpad by default; three fields nothing reads (`takerNotional`, `reopenedInMerge`; "dead code — none" was wrong) | kit fixed |
| F8 low | Seven small corrections: R8's 4.43 compared with an active-week rate; the headline d is net minus net; a mark-history page is a span of time; the klines "upper bound" is an estimate; a variable named SPLIT; question 3's quote came through a summarising tool; the FIND period differs between entries | corrected in place |

Commits: this section `e097538`; F1 `7faccf0`; F2 `675b8f8`; F3 `46fd67c`;
F4 `e8ffa75`; F5 `c102d4d`; F6 `58001a8`; F7 `b9c5857`; F8 `b4bd2f4`. The
kit and the scripts live outside the repository; their changes are logged in
`progress.md`. Rules I broke: one empty `node -e ""` typed into a shell
line, and one field-name inspection script written through a shell heredoc
instead of the Write tool (the scratchpad).

**The kit after the review.** Fingerprint, old
`872dd5acbe6159052b60faa357446f405e173f1ed727049a93e409b159506246` (24
files), new **`7b4179e897faa34758de8508cef47a84e7c2504ec5eb9974526f55041bdfc215`**
(26 files: `cells.mjs` and its test added; `entries.mjs`, `mutate.mjs` and two
tests changed; the panel manifest unchanged). Tests 37 of 37, mutants 59 of 59,
the fingerprint check 5 of 5; `run-final.mjs` again (`out/final-run.txt`):
the proof's outputs the same but for their stamps (`numbers-proof.json` byte
for byte), so the proof's numbers hold.

**1. The minute pricing, checked independently** (`scripts/fr-pricing.mjs`,
which imports no kit module: it reads the panel files, the price table,
`rules.json`, `selection.json` and the fills itself, computes the New York
session from the 2026 clock changes and the null's follow minutes from
interval overlaps; `out/fr-pricing.txt`). On a seeded draw of 100 entries and
on the whole cell (1,249): the delay equal in every entry and equal to R8's
stored follow instant; net and gross equal to the kit's within 3e-17; the
exact null within 7.5e-12 (my fractions are taken from instants near 1.8e12
ms, the kit's from D: rounding only); the same 18 entries without a null on
both sides; means −16.36 (net), d −2.64 (net minus net) and −2.53 (gross
minus gross). Charging funding by the settlement's stamp, R8's own reading,
changes no entry; no spread came from a category mean; no tracked trade sits
only in a window sample. **No difference beyond floating-point rounding.**

**2. Calls against stored replies** (`scripts/fr-calls.mjs`,
`out/fr-calls.txt`). Every one of the 16,116 calls matches exactly one stored
reply (by its start instant and URL), and every stored reply one call: klines
2,613 = 91 planning reads of 1 d klines (`raw/plan.jsonl.gz`) + 13 in the
trial (`trial-1500Z/`) + 2 in the end-rule probe (`raw/probe-end.jsonl.gz`) +
2,507 in the pull (`raw/k1m/`); mark-history 11,561 = 44 trial + 3 probe +
11,514 pull; funding 1,931 = 8 trial + 1,923 pull. No key is stored twice (the
pull never restarted, so nothing was fetched again or de-duplicated); the
trial's 65 keys were all fetched again by the pull (its done file moved with
it). The panel rebuilt from `raw/` alone equals the panel files in every mark,
kline and funding row: **no stored panel minute rests on a reply outside
`raw/`.**

**3. A.0-6's day test:** F3 and question 6. **4. The questions:** 1 kept,
with F5; 2 kept (even with no clustering entry 8 sees about 83 bps, above
60); 3 kept, with F8(f); 4(a) and 4(c) kept, with F6; 4(b) withdrawn (F1).
**5. The first measurements:** each query, unit and grouping read against
A.1 and the register entries; what does not follow is F1, F2, F4 and F8(a)
and (g).

**How the kit fits the FIND studies to come** (notes; no code added for them):
- Not in the kit, and every study needs it: **A.0-5's risk unit** (d over the
  market's mean absolute h-return of the trailing 30 days — every pass line
  is read in it) and **A.0-4's d** itself (gross minus the exact null's gross;
  a study composes it from `leg` and `exactNull`). The first study should add
  both to the kit, tested and mutated, before any result is read — or each
  study will write its own. [Addendum 2: both in the kit now — `riskUnit`,
  `dAgainstNull`.]
- Entry 7's runs and entry 9's agreement events are defined in scripts
  (`index-pool.mjs`, `m-runs-agree.mjs`): if those entries are registered,
  their definitions move into the kit, or a study writes a second copy.
  [Addendum 2: moved — `runs.mjs`, `agreement.mjs`; the scripts import them.]
- The map's closed cells (A.1-8) are a script output (`out/m8-map.tsv`): if
  question 5 keeps the rule, freeze that table with its hash for the studies.
  [Addendum 2: frozen — `data/m8-map.tsv`, with `mapOpen`.]
- **CONFIRM cannot use the kit's readers as they are:** the fills reader, the
  panel reader and the client refuse anything at or after the FIND cut by
  construction. The exams need their own, deliberate path (the exam's end as
  the bound), designed with the exams — not a switch in these readers.
- The removal in `exactNull` is the caller's: each entry should say whose
  trades its null leaves out (R8: both arms).
- New York sessions are R8's rule as written — Monday to Friday 09:30–16:00,
  no holidays: Labor Day (2026-09-07, inside FIND's 65 days) and Thanksgiving
  (2026-11-26, inside the first exam) are priced with the weekday table.
  Changing that is a rule change; stated so no study is surprised.
- A session runs the kit's tests with `RESEARCH_KIT_TMP` set to its own
  scratchpad (F7); a study prints `checkKit()`'s fingerprint, so any later kit
  change (the risk unit, say) shows in every output.

---

## Addendum 2 (2026-11-11)

2026-11-11 15:53–16:32Z (`date -u`), a fresh RESEARCH-KIT subagent (Opus 5.5,
max), on the brief's Addendum 2: the pieces the note "How the kit fits the
FIND studies to come" names, added to the kit, nothing else. No API call;
nothing stamped at or after the cut read; the proof's numbers unchanged
(`numbers-proof.json` byte for byte). The log: `progress.md`, section
"Addendum 2".

**Added** — one definition each, tested, every mutant killed:

| | Where | What |
|---|---|---|
| A.0-4's d | `nulls.mjs` `dAgainstNull` | the entry's gross at t + D over h minus the exact matched null's gross over t's UTC hour, composed from `leg` and `exactNull`; the caller names whose trades the null leaves out (`removed`, required: `removalOf`, or `() => 0`); the long share must be a number in [0, 1]; d net minus net under a setting only when asked (`netSetting`) |
| A.0-5's risk unit | `returns.mjs` `riskUnit` | the market's mean absolute h-return, h = 1, 6, 24 or 72 h, over the 30 days of whole minutes before the minute that holds the instant — each start and its exit inside them, by `leg`'s convention (the mark at the end of minute s to the mark at the end of minute s + h); it returns the mean and the number of starts it rests on |
| Entry 7's runs | `runs.mjs` `runsOf` | moved from `scripts/index-pool.mjs`, verbatim |
| Entry 9's events | `agreement.mjs` | `sharedTradePairs`, `copyPatternPairs`, `linkOf`, `agreementEvents`, moved from `index-pool.mjs` and `m-runs-agree.mjs`, unchanged in meaning |
| The map | `data/m8-map.tsv` (SHA-256 `d8f8657c…3f77`, `out/m8-map.tsv` byte for byte), `cells.mjs` `mapOpen` | whether a market × horizon × setting cell of FIND's 65 days is open, in the entry's own direction (funding splits the two from 24 h) |
| Question 6's beside-print | `stats.mjs` `cr1Test`, `entryWeightedCR1` | the entry-weighted mean with CR1 errors (K ÷ (K − 1)) by day and by trader, Student's t on K − 1 degrees of freedom |
| The competition | `competition.mjs` `COMPETITION`, `inCompetition` | the window [2026-11-02 14:30Z, 11-16 14:30Z) and its boosted markets ANT, AMD, ARM, SOXL, their ids from the rule book (97, 22, 26, 89): `{ days, boosted }` for a market and an instant |

**The evidence** (`scripts/check-additions.mjs` → `out/check-additions.txt`,
now the last script of `run-final.mjs`):
1. d on R8's cell equals the proof's composition in all 1,231 entries bit for
   bit (d, d net minus net, the null's weight), with the same 18 without a
   null; its means, −2.53 and −2.64 bps, are `numbers-proof.json`'s bit for
   bit.
2. The risk unit equals a direct sum over its window in 32 of 32 cases (BTC,
   ETH, SP500, GOLD; four horizons; two instants); BTC at the cut, 1 h: 24.7
   bps (the map's 65 days: 24.2).
3. **Runs and events:** `index-pool.mjs` and `m-runs-agree.mjs` import the
   kit, their own copies gone; every derived file comes out byte for byte
   (`pool-runs`, `pool-pairs`, `runs-covered`, `agreement-events` among them)
   and `numbers-runs-agree.json` too — **3,182 runs** of 327 accounts (81 with
   ten or more; 1,116 inside the competition), **188 events** on 59 days in
   13 markets.
4. **The map:** `mapOpen` gives first measurement 8's counts (a taker's
   closed markets 82, 41, 4, 1 of 84 at 1, 6, 24, 72 h, one side closed 82,
   41, 15, 8; a maker's 14, 2, 0, 0 — a test) and the Final review's tallies
   of each entry's own cell exactly (`out/fr-a2.txt`: P1 entries at the class
   horizon 2,149 open and 8,463 closed, at 24 h 9,235 and 1,377; events at 6
   h 9 and 179, at 24 h 179 and 9; runs at 1 h 23 and 3,159).
5. CR1 on R8's net result by the second: −16.60, se 8.00 by day (p 0.0442),
   6.04 by trader (p 0.0085) — `out/fr-a06.txt`'s figures, computed without
   the kit, to the printed digit; likewise the minute's net result and d.
6. The competition splits measurement 3's runs as before (1,116 inside).

**The kit:** fingerprint `7b4179e8…c215` (26 files) →
**`2d3667b5ce90645b41dfee4e6fc425ab3e64c985cb4973bfed6ece5052c409aa`** (33
files: `runs.mjs`, `agreement.mjs`, `competition.mjs`, `data/m8-map.tsv` and
three tests added; `cells.mjs`, `nulls.mjs`, `returns.mjs`, `stats.mjs`,
`mutate.mjs` and three tests changed; the panel manifest unchanged). Tests 54
of 54 (`out/test-kit.txt`); mutants 109 of 109, 50 of them new
(`out/mutation.txt`); the check 5 of 5; `run-final.mjs` (`out/final-run.txt`):
every output the same bytes or the same but its stamps, except
`index-pool.txt`'s list of the code it ran. `run-final.mjs` now gives each
script at most 4 GB of heap (it gave 8 GB; the collector shares the machine);
every script ran within it.

**What a FIND study must know**
- *d:* pass `removed` — whose trades the null leaves out is the entry's to
  say (R8 left out both arms) — and a long share. `habitsAt` gives none to a
  trader without an opening in the 30 days before (3 P1 entries from the
  launch week); `dAgainstNull` refuses it rather than guess (R8's analysis
  took 0.5). Near the cut, apply `voted(t, h)`: a null leg that would end past
  the cut leaves the entry unpriced.
- *Risk units:* d ÷ `riskUnit(mk, t, h).value`, t the entry's instant
  (A.0-1); 1, 6, 24 and 72 h only (entry 5's 60 s and entry 7's 30 min are
  not d-based). Not every window is full: question 7.
- *The map:* a taker's and a maker's cells only — the owner's own setting
  has none, and the function refuses it; the entry's own direction, as the
  Final review applied it and the owner ruled on; not applied to entries 7
  and 8.
- *Events:* pass every P1 entry from the first week and take a period from
  the events: an event's merging depends on the events before it.
- *The competition:* pass the entry's instant (A.0-1); an entry made before
  11-02 14:30Z and held into the window counts outside it. Of the 10,612 P1
  entries from the launch week, 913 lie inside the window, 161 in boosted
  markets (AMD 61, ARM 15, SOXL 85; ANT-USD is pre-IPO, outside every primary
  cell), 33 both.
- *Memory:* the risk unit keeps prefix sums of 12 bytes a minute per market
  and horizon (BTC about 3 MB a horizon); load markets one at a time, as
  `check-additions.mjs` does.

**Questions** (for section 8, each with a recommendation)

7. **A risk unit on a short window (A.0-5).** The trailing 30 days are not
   full where a market is younger than 30 days or where the beta months'
   pauses fall inside them. Of the 10,612 P1 entries from the launch week, at
   24 h 8,643 have the full window, 1,210 90–100%, 431 half to 90%, 324 under
   half (63 under 7 days) and 4 none (a market's first day). *Recommendation:
   the unit over the minutes the window holds, its share printed; an entry
   whose window holds under 7 days of starts, or none, is left out of the line
   read in risk units and printed apart, its bps beside — 67 entries at 24 h.
   Seven days, so that every unit spans a whole week, weekend included.*
8. **The competition's source.** No stored rule-book read holds the
   competition: its window and boosts are R1's (read 2026-11-07, "boosts 3x
   ANTH") and DOCS-SWEEP's (read 2026-11-09, "ANT 3×, AMD/ARM/SOXL 2×"); the
   kit takes their markets from the rule book's instruments. *Recommendation:
   one read of `/v1/info/competition?competition_id=` (weight 1, the rule
   book A.0-9 allows after the cut) by the supervisor before the freeze, its
   dates and boosted ids compared with the kit's; a difference is a kit change
   and a new fingerprint.*

Evidence: `kit/` (33 files), `kit/FINGERPRINT.sha256`, `out/fingerprint.txt`,
`out/test-kit.txt`, `out/mutation.txt`, `out/test-check.txt`,
`out/final-run.txt`, `out/check-additions.txt`, `out/freeze-map.txt`; scripts
added `freeze-map.mjs` and `check-additions.mjs`, changed `index-pool.mjs`,
`m-runs-agree.mjs` and `run-final.mjs`. Rules I broke: one kit edit appended
with a shell heredoc instead of the Edit tool (rewritten with it since), and
one time stamp written from an estimate in `progress.md`, corrected from
`date -u`.
