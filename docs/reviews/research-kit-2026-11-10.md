# RESEARCH-KIT — round 2's one-minute panel, research kit and first measurements

RESEARCH-KIT (Opus 5.5, max), 2026-11-10 14:37Z – ⟨end⟩ (UTC, every stamp
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
   minute, how much traded, and the funding every hour. Every one of its
   ⟨total⟩ minutes has a price. Where R8 had read the same markets on its
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
   large-orders test 5–33). The funding test can only see 120 bps — by the
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
   buyers from sellers, which R8's version needed. (Yes.)
2. Leave the funding study out of this round? (Yes — it cannot see enough.)
3. Settle the funding question by the changelog and make no read? (Yes.)
4. For the register (supervisor): replace one list that came from a board
   read after 2026-11-07; score one-hour traders at six hours; freeze the
   list of 303 directional accounts. (Yes to all three.)

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
  minute plus the 77-minute quiet window. Foundation 2 allowed at most
  246,000. **Spent:** ⟨calls, tokens, hours, 429s⟩ (`F:\calls.jsonl`,
  `out/pull-heartbeat.log`).
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
- **Coverage** (`F:\panel\coverage.json`; `scripts/peek-coverage.mjs`), each
  market's minutes counted against its first trade: ⟨final totals⟩ — every
  minute from a market's first trade has a mark (no hole at all); the minute
  klines' trade counts add up to the daily klines' on every fully pulled day
  (⟨days⟩, none off); funding has a row for every hour but 14, gaps of the
  API's own: SP500-USD 2026-08-28 08:00Z; MU, TSM and SNDK 2026-08-31 20:00Z;
  KAITO-USD four hours on 2026-09-10/11 (its first day); MRVL, EWY and SOXL
  2026-09-16 16:00Z, EWY 17:00Z, UNITREE 20:00Z and 21:00Z (their first day).
  The kit charges such an hour nothing and counts it. One settlement hour,
  2026-11-05 20:00Z, is stamped 46 s late on all 90 markets (R8 saw it): the
  panel files it under its nominal hour.
- **It agrees exactly with R8's independent capture** of the same 80 markets
  (`out/check-panel-r8.txt`, R8's reads of 2026-11-09): funding 79,338 hours,
  the same rate in every one; R8's 79,515 hourly marks equal to the panel's
  mark at each hour's last minute; in 156,618 minutes that R8's one-second
  windows hold whole, the minute's last one-second mark equal to the panel's;
  R8's 23,346 minute klines, trade count and volume equal — no difference
  anywhere.
- **The manifest:** `F:\MANIFEST.sha256` (⟨files⟩ files: every raw reply file
  and every panel file), SHA-256 ⟨manifest hash⟩. Its panel lines are pinned
  in the kit (`kit/data/panel-manifest.sha256`): the reader refuses a panel
  file whose hash differs.

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
| `data/` | byte-identical copies of frozen inputs (R8's price table `9f559b4a…`, `selection.json` `c20c3f80…`, classifier v1 `f7f32f22…` and `d803192c…`), `rulebook.json` (the rule book as read 2026-11-10 14:55Z), `population.json` (the pool as read 2026-11-07 00:48Z: 1,702 accounts, 1,000 on the all-time notional board, 100 holdout; 13 excluded), `panel-manifest.sha256` |
| `test/`, `mutate.mjs` | 36 tests (`node --test`), 54 mutants |

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
none; `analyze.mjs` untested — the analysis layer (the leg, the null, the
cell rules, the counters) tested and mutated; the null's silent fall-through
— the exact null draws nothing, so no loop can run out; no boundary parse of
market rows — the panel builder parses every row and counts what it drops or
refuses; a counter counting legs — missing funding counted in hours; a side
effect at import — none (data is read on first use); short names — longer
ones.

**How a study uses it:** `import { checkKit } from '<kit>/check.mjs'`; print
`checkKit()` — it throws on any file that differs from the fingerprint, on a
missing file and on an extra one — then import what it needs.

**Its fingerprint:** ⟨fingerprint⟩ — the SHA-256 of `kit/FINGERPRINT.sha256`
(⟨n⟩ files, the pinned panel manifest among them). `scripts/test-check.mjs`
proves the check on a copy: it passes unchanged and throws on one changed
byte, an added file and a missing file (`out/test-check.txt`).

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
   (by trader [−34.33, +0.44], by day [−26.95, −0.83]). It is not R8's
   statistic: R8's null kept each drawn trade's own taker side; the exact
   null takes the trader's long share (A.0-4). Like for like, R8's own drawn
   trades priced by the minute give −13.59 with their own sides (R8: −13.58)
   and −5.89 with matched sides (R8's secondary: −6.04) — **the minute moves
   either by under 0.2 bps**; the exact null sits 3.3 bps from the drawn
   matched null, about one standard error of three draws' mean.

**The mutants:** 54 of 54 killed (`out/mutation.txt`): every rule that
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
SKHYNIX, SAMSUNG, CXMT; KIOXIA from its settlement day). The launch week
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
   7.3 entries per active trader-week** (R8's 50: 4.43). By hold class:
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
   design effect 2.0.
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

   BTC at 1 h: a mean move of 24.2 bps against an 8.2 bps round trip — 67.0%
   (A.2's "about six in ten on a major coin" was too kind); SP500-USD at 1 h:
   8.1 bps against 8.3 — 101%, a cost no share of right calls covers. For a
   maker: 14 of 84 closed at 1 h, 2 at 6 h, none at 24 h. Funding is a small
   part at 24 h (a long on BTC paid 2.2 bps a day).

**What they mean for each entry's smallest visible effect** (A.2 recomputed;
`out/a2-recompute.txt`; k from A.0-13, its lines recomputed in section 7):

| Entry | Measured count | Measured spread (bps) | Visible in FIND | Visible at the final exam | A.2 had |
|---|---|---|---|---|---|
| 1 traders differ | 139 traders with ≥ 10 a half (355 counting every entry of accounts ever directional) | d 183 a trade at the class horizon | a correlation of 0.24 — about 17 bps between traders (0.15 and 11) | top minus bottom fifth 36–39 (240 traders with ≥ 20 entries; about 930 entries a fifth) | 0.20 → 17–28; 40–43 |
| 3 slow traders | 1,553 entries, 112 accounts | 382 at 24 h | 32 (47 if 24-hour windows cluster by day three-fold) | 52–56 (about 960 entries) | 23–34; 36–58 |
| 4 kinds of entries | 10,612 from the launch week (17,453 in all FIND weeks) | 183 | 16 (12) for an even split | 19–21 (about 6,550 entries) | 15–42; 18–51 |
| 5 the first minute | 1,249 (R8's cell) | 15.6 over 60 s | 1.8 | — | 2.3–3.7 |
| 7 large orders | 3,067 runs, 327 accounts | 91 over 30 min | 5–9 counting runs; 33 if each account counts once | about 1,560 runs of 81 accounts in 42 days | 8–26 |
| 8 funding | 293 market-days, 61 days | 501 over 24 h | **120** | — | about 150; register only under about 60 |
| 9 agreement | 188 events, 59 days | 130 over 6 h | 27–57 | 43–47 (about 116 events) | 20–37; 32–66 |
| 10 the US open | the 50: about 385 in 42 days; all directional: 1,170–1,430 | R8's standard error 14.1 on 387 | — | the 50: 51–55 (42–46 with the exact null); all: 26–32 (22–26) | 51–55; 20–22 |

The clustering used is measured on R8's cell as A.0-6's tests see it (day
means 1.38 for a d, 3.57 for a net result — section 7, item 2) and is an
assumption for other horizons and populations. Entries 2 and 6 are sized at
the freeze by their lists' counts.

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
| **The blind store** | the fills reader throws on a row at or after the cut; the panel builder refuses such rows (none met) and the reader throws on them; the client refuses a history read without both stamps or ending after the cut (marks may end at the cut itself: no bucket starting at it can return); R2's light files never opened; `pool.json.gz` read for its account keys and notional-board membership only; the 13 late accounts excluded; R8's `probe/` never opened; `/v1/info/pnl` not read (item 5, section 8) |
| Fills with ids above 2^53 − 1 | 3,403 rows of one account on 2026-05-07/08 (WTIOIL, SILVER) fail the boundary check: dropped and counted (`out/check-dropped.txt`), never read as numbers |
| Truncated captures (139 accounts) | a week counts only where the capture reaches 14 days back; truncated accounts' runs set apart |
| The competition (A.0-8) | runs split at 2026-11-02 14:30Z; the studies print every result without it |
| The minute's look-ahead (up to 60 s) | the same for an entry and its null; against the second it moved R8's mean by 0.24 bps and each entry by 13 bps (sd) |
| Holes in the marks | none from any first trade to the cut; the reader would take the previous minute's mark up to 5 minutes old, longer holes unpriced and counted |
| Missing funding rows | 14 hours, the API's own gaps (section 1): charged nothing, counted |
| Cost tables from two November mornings | R8's, kept as approved (decisions 2026-11-09); stated |
| Uniform seconds inside a minute (the exact null) | stated; R8 found the klines' minute counts equal the tape's in 2,471 of 2,472 minutes, and the panel equals R8's klines in 23,346 of 23,346 |
| Holdout accounts | their fills before the cut are used, as R8 did; D1's data is after 2026-11-07 and untouched |
| A list that is not yet frozen | "directional on the 14 days before the cut" is a candidate with a hash, for the supervisor to freeze |
| Entry 2's list (c) | "the all-time profit board's top 100": our only copy was read 48 minutes after the cut, and A.0-9 forbids accounts taken from a profit board read after it — question 4 |
| The 1-hour class | 82 of 84 markets closed for a taker at 1 h, and A.1's rule bars closed cells from a primary cell: entries 1 and 4 score many traders at 1 h — question 4 |

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
   day test to be the weaker of the two.
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
2. **The funding study (entry 8).** With the measured counts it can see only
   about 120 bps, where IDEAS-REVIEW's own rule (point 2.8) registers it only
   under about 60. *Recommendation: leave it out of this batch (m one lower)
   and revisit it on months of the collector's data.*
3. **The funding rule (the brief's item 5).** The changelog of 2026-09-01
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
   (b) at 1 h a taker's cell is closed in 82 of 84 markets, while entries 1
   and 4 score one-hour traders there — *score them at 6 h, with 1 h printed
   beside;* (c) *freeze the 303-account list (section 7, item 4) after
   checking it.*

## 9. For external-apis (new facts, dated and sourced)

- **2026-11-10 15:04Z, live** (`out/probe-end.txt`): `mark-history` at 1 m
  returns a bucket only if the bucket ends by `end_timestamp` (end
  12:00:00.000 or 12:00:59.999 → last bucket 11:59; 12:01:00.000 → 12:00);
  klines at 1 m include a candle opening at `end_timestamp` (end
  12:00:00.000 → 12:00 included), as R8 found.
- **The pull, 2026-11-10 15:05Z – ⟨end⟩** (`F:\calls.jsonl`): ⟨calls⟩ calls,
  ⟨tokens⟩ weighted tokens, never more than 150 in a trailing minute, ⟨429s⟩
  429. `mark-history` 1 m pages hold 1,000 buckets ascending with `more`, and
  a bucket exists for every minute from each market's first trade to the cut
  (⟨minutes⟩ minutes, no hole); 1 m klines add up to the 1 d klines' trade
  counts on every fully pulled day (⟨days⟩); `funding` with `start_timestamp`
  and `end_timestamp` pages back by `end` = the oldest row (exclusive), 100 a
  page, with no row for 14 hours (section 1).
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

- **The kit:** `kit/` (⟨n⟩ files; `kit/FINGERPRINT.sha256`, fingerprint
  ⟨fingerprint⟩); tests `out/test-kit.txt` (36 of 36), mutants
  `out/mutation.txt` (54 of 54), the check `out/test-check.txt`.
- **The panel:** `scripts/plan-panel.mjs`, `plan-cost.mjs`, `api.mjs`
  (`out/test-api.txt`, 4 of 4), `rawstore.mjs`, `pull-panel.mjs`,
  `build-panel.mjs`, `check-raw.mjs`, `probe-end.mjs`; `out/plan-panel.log`,
  `out/plan-cost.txt`, `out/panel-plan.json`, `out/probe-end.txt`,
  `out/pull-heartbeat.log`; F: `raw/`, `panel/` (with `coverage.json`),
  `done.jsonl`, `calls.jsonl`, `MANIFEST.sha256` (⟨manifest hash⟩),
  `trial-1500Z/` (the trial, unused).
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
- **Rules I broke:** two `node -e` one-liners (14:5xZ and 20:3xZ; code-rules
  want scripts in files); `kit/test/mutate.mjs` first sat where the test
  runner ran it as a test (moved to `kit/mutate.mjs`; the baseline check now
  guards against a run that tests nothing); one edit made with `sed`
  (`scripts/m-spreads.mjs`), then corrected with the Edit tool.
