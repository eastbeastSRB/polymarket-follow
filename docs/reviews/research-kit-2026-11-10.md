# RESEARCH-KIT — round 2's one-minute panel, research kit and first measurements

RESEARCH-KIT (Opus 5.5, max), from 2026-11-10 14:37Z (UTC, every stamp from
`date -u`), for polymarket-follow's supervisor: foundation 2 and Appendix A.1
of IDEAS-REVIEW's report (decisions 2026-11-10, round 2's rules and the
collector approved). Evidence: the supervisor folder `workers/RESEARCH-KIT/`
(`kit/`, `scripts/`, `out/`, `progress.md`; paths below are relative to it)
and `F:\polymarket-follow-research\KIT\` ("F:" below). **The blind store held:**
every input ends at 2026-11-07T00:00:00Z; nothing about markets or accounts
after it was read (section 5, first row).

**STATUS: IN PROGRESS** (committed early, by the brief's rule). The pull runs;
sections marked ⟨pending⟩ wait for it.

## For the owner, in one page

⟨written last⟩

## 1. The panel

- **What:** one-minute marks (`mark-history`, 1 m: the last mark of each
  minute), one-minute klines (volume, trade count) and hourly funding of 91
  markets — the 90 enabled and KIOXIA-USD, retired (settled 353.87 at
  2026-09-28T00:33:01.797Z) — from each market's first trading day
  (2026-05-06 for the first, 2026-10-29 for ANT-USD) to the cut. One file a
  market (`F:\panel\<id>.json.gz`): marks dense by the minute (null where
  none), klines sparse, funding by nominal hour with its stamp; a retired
  market carries its settlement. **No split** before the cut (`stock-splits`:
  no events, 2026-11-10 14:55Z).
- **Cost, stated before the pull** (`out/plan-cost.txt`, from one 1 d klines
  read a market): 19,409 calls, at most 107,325 weighted tokens (marks
  57,885; klines at most 28,880; funding 20,560) — 11.9 h of calls at 150 a
  minute plus the 77-minute quiet window. Foundation 2 allowed at most
  246,000. ⟨pending: the real count⟩
- **How it pauses and resumes:** segments of 10,000 minutes from the cut
  backwards, round-robin over the markets, each market's funding chain kept
  level, so the panel is complete from the current segment to the cut at
  every moment (R8's period after 7 segments). The client sleeps through
  02:34–03:51Z; a STOP file or the end time stops it before its next request;
  the first 429 stops it; every reply is appended whole with its read instant
  (`F:\raw\<type>\<id>.jsonl.gz`), then its key to `F:\done.jsonl`, from which
  a restart continues.
- **A trap found and avoided:** a 2.5-minute trial came back one minute short
  in every segment. `mark-history` returns a 1 m bucket only if it *ends* by
  `end_timestamp`, while klines include a candle *opening* at it
  (`out/probe-end.txt`, five calls at a past boundary). So marks ask the
  segment's end itself — for the last segment exactly the cut, which can
  never return a bucket starting at it — and klines the end minus 1 ms. The
  trial's replies are kept apart (`F:\trial-1500Z\`), unused.
- **It agrees exactly with R8's independent capture** of the same 80 markets
  (`out/check-panel-r8.txt`, R8's reads of 2026-11-09): funding 79,338 hours,
  the same rate in every one; R8's 79,515 hourly marks equal to the panel's
  mark at each hour's last minute; in 156,618 minutes that R8's one-second
  windows hold whole, the minute's last one-second mark equal to the panel's
  one-minute mark; R8's 23,346 minute klines, trade count and volume equal —
  **no difference anywhere.**
- ⟨pending: coverage of the whole panel; the manifest's hash⟩

## 2. The kit

**Its parts — one definition of each thing, in one place** (`kit/`; Node 24's
built-ins only):

| Module | What it holds |
|---|---|
| `constants.mjs` | the cut (2026-11-07T00:00:00Z) and where the data lies |
| `fills.mjs` | the fills reader: R2's capture and R8's three completed files, numbered pages only, deduplicated by trade key, R8's boundary check (a failing row dropped and counted), **any row at or after the cut refused (throws)**; R2's light files (portfolio, profit, competition reads made after the cut) are never opened |
| `entries.mjs` | order events by `(order_id, previous_size, instrument)` with same-millisecond chaining, cycles, entries (openings and flips, 60 s merge, adds apart, forced events exits only) — R8's `lib-r8.mjs` step for step; R8's entry id, delay D and voted rule, each once (R8 had two copies) |
| `labels.mjs` | an account's v1 label on the 14 days before an instant (the frozen classifier, byte-identical) and its habits on the 30 days before it (closed cycles, median hold, horizon class, long share) — point 2.22 |
| `panel.mjs` | the panel reader: each file checked against the hash the kit pins; the mark at the end of the minute holding an instant (a missing minute takes the previous within 5 minutes, R8's 300 s); trade counts; funding by **nominal** hour (R8-REVIEW note 4), a mark-less settlement unpriced, a missing row counted |
| `returns.mjs` | one leg by the minute (A.0-2/A.0-3): gross before costs, net after the setting's spread and fee on both legs and funding — R8's `legReturn` on minute marks |
| `nulls.mjs` | **the exact matched null** (A.0-4), and the per-minute count of a population's own trades it leaves out |
| `costs.mjs` | the cost settings: **taker, the default** (base fee 4 bps a leg — ANT-USD 2 bps under its override — plus R8's session-pair table) and maker (1.25 bps a leg, no spread) |
| `stats.mjs` | R8's cluster bootstrap (with the share of resampled means at or above zero) and exact sign test; A.0-6's t-tests on day means and trader means (the larger p decides), the day-by-day difference, Welch on trader means; Spearman with a permutation p; Holm with every frozen hypothesis in m |
| `check.mjs` | the fingerprint check a study calls at its start |
| `data/` | byte-identical copies of the frozen inputs (R8's price table `9f559b4a…`, `selection.json` `c20c3f80…`, classifier v1 `f7f32f22…`/`d803192c…`), `rulebook.json` (the rule book as read 2026-11-10), `population.json` (the pool: 1,702 accounts, 1,000 on the all-time notional board, 100 holdout; 13 excluded), `panel-manifest.sha256` |

**The exact null, in one paragraph.** For an entry at instant t in a market,
every minute of t's UTC hour weighs its trade count (less the trades of the
accounts the study removes); a trade in a minute is followed after the
entry's own delay D and held the entry's horizon, priced like the entry;
its direction is long with the trader's long share (A.0-4). Klines give a
minute's count, not each trade's second, so a trade is taken as uniform
within its minute: its follow instant falls in the minute `floor(D / 1 min)`
after its own with probability 1 − φ and in the next with φ = (D mod 1
min) / 1 min — exact under that assumption (a test checks it against a
millisecond-by-millisecond sum). **Klines carry no taker side, so a null in
each trade's own direction — R8's primary — cannot be built this way;** only
the matched null can.

**R8-REVIEW's code findings, and what became of them:** duplicated
definitions (groups, removal, delay, voted rule) — one each; dead code —
none; `analyze.mjs` untested — the analysis layer (the leg, the null, the
cell rules, the counters) is tested and mutated; the null's silent
fall-through — the exact null draws nothing, so no loop can run out; no
boundary parse of market rows — the panel builder parses every row and
counts what it drops or refuses; a counter counting legs — missing funding
is counted in hours; a side effect at import — none (data is read on first
use); short names — longer ones.

**How a study uses it:** `import { checkKit } from '…/kit/check.mjs'`, print
`checkKit()` (it throws on any file that differs from the fingerprint, on a
missing file and on an extra one), then import what it needs.

**Its fingerprint:** ⟨pending: the SHA-256 of `kit/FINGERPRINT.sha256`, made
after the final panel build⟩.

**Its proof against R8** (foundation 2's "done when"):
1. **The entries — exact.** The kit's builder on R8's 52 tracked accounts
   returns R8's 1,946 groups (1,252 openings, 24 flips, 670 adds) with the
   same account, instrument, first-fill instant, type and side, none missing
   on either side; **the primary arm's openings and flips are R8's 1,272**
   (47 accounts); the delay is R8's for 1,919 of 1,919 (`out/proof-entries.txt`).
2. **Priced by the minute** (the taker setting = R8's costs; `out/proof-pricing.txt`):
   the mean net result on R8's primary cell is **−16.36 bps**, trader-clustered
   [−29.68, −5.54], against R8's **−16.60** [−29.98, −5.87] by the second —
   **the minute costs +0.24 bps on the mean**; entry by entry the two differ
   by 13.0 bps (sd), 7.1 bps on average in size (the mark at the minute's
   end against the mark at the second, at entry and exit).
3. **With the exact null:** d = **−2.64 bps**, by trader [−13.72, +8.16], by
   day [−18.47, +12.94] (1,231 entries; 18 entry hours hold no trade but the
   tracked accounts' own) — **inside R8's intervals around −13.58** (by
   trader [−34.33, +0.44], by day [−26.95, −0.83]). It is not R8's statistic:
   R8's null kept each drawn trade's own taker side, the exact null takes the
   trader's long share (A.0-4). Like for like, R8's own drawn trades priced
   by the minute give −13.59 with their own sides (R8: −13.58) and −5.89 with
   matched sides (R8's secondary: −6.04) — **the minute moves either by under
   0.2 bps**, and the exact null sits 3.3 bps from the drawn matched null,
   about one standard error of three draws' mean.
   The exact null's d has **30.7% less variance** than d with three drawn
   matched trades on the same entries (intervals 16.7% narrower; first
   measurement 7).

**The mutants:** 54 of 54 killed (`out/mutation.txt`; a baseline copy must
pass all 36 tests first, so a run that tests nothing cannot count as a
kill). The first run killed 47 of 52; each survivor was a missing test, now
written.

## 3. The first measurements (counts and spreads only)

Every count uses the kit; "P1 at its week" = the account's v1 label on the
14 days before the entry's Monday is directional and the capture covers
them; primary-cell markets = A.0-7's list left out (pre-IPO, PRL, NCLD,
SKHYNIX, SAMSUNG, CXMT, KIOXIA from its settlement day). The pool's index
(`scripts/index-pool.mjs`, 21 s): 1,702 accounts, 1,272,487 fills, 126,033
openings and flips before the cut, 1,044 accounts ever directional in a
covered week (`out/index-pool.txt`).

1. **Openings and flips of directional accounts** (`out/m1-entries.txt`,
   `.tsv`): 17,453 P1 entries in primary-cell markets (744 accounts); from
   the launch week (2026-08-31, 9.71 weeks) **10,612 — about 1,090 a week,
   578 accounts, 7.3 entries per active trader-week** (R8's 50: 4.43). By
   hold class: under 2.45 h 4,856; 2.45–6 h 1,103; 6–12 h 699; 12 h and more
   854; under 10 closed cycles 3,100. **Slow traders (median hold ≥ 6 h,
   entry 3): 1,553 entries, 112 accounts, 68 days.** The all-time notional
   board carries 85% of them.
2. **Traders with ≥ 10 entries in odd and in even ISO weeks**
   (`out/m2-halves.txt`): **139** (P1 at the entry's week; 77 from the launch
   week alone; A.2 guessed 200); counting every entry of accounts ever
   directional, 355 (242). Traders with ≥ 20 entries in all: 240.
3. **Runs reaching a fifth taker order** (`out/m3-runs.txt`): in weeks the
   capture covers and before the competition, **3,182 runs (350 a week) of
   327 accounts, 81 with ten or more**; 1,116 more inside the competition
   (from 2026-11-02 14:30Z); 6,728 of 89 accounts whose capture R2's page
   cap cut short (their runs bunch in the last days by construction — set
   apart). Mostly algorithms (1,296 of the covered pre-competition runs),
   directional 409.
4. **Agreement events** (`out/m4-agreement.txt`): **188 from the launch week
   (19 a week), on 59 days, 13 markets — 124 on BTC and 36 on ETH**; A.2
   guessed 500. The rule that no directional account opened the other side
   stopped 626 candidates; links stopped 28 (8 pairs with ≥ 20 shared
   trades, 3 copy-pattern pairs, the three-hex-digit prefix).
5. ⟨pending: funding market-days, from the panel⟩
6. **Entries a week at UTC 12–16 and 00–04** (`out/m6-blocks.txt`; the
   follow instant's hour, as R8): the 50 — 64 a week at 12–16, 21 at 00–04,
   **385 and 125 in R8's six weeks; under R8's own cell definition the count
   is 387, R8's figure exactly**. Every account labelled directional on the
   14 days before the cut (303 accounts; `out/directional-at-cut.txt`, a
   candidate list): 239 a week at 12–16 in R8's six weeks, 195 a week in the
   four weeks before its label window — **about 1,170–1,430 entries in a
   42-day exam, 3.0–3.7 times the 50's** (A.2 guessed 6.4).
7. **On R8's stored entries** (`out/m7-variance.txt`, 1,249 entries): var(d)
   / var(r) = **1.376**; the three drawn trades' own noise is **23.8% of
   var(d)**, so an exact null's interval is about **12.7% narrower** — what
   IDEAS-REVIEW's arithmetic said ("a quarter less variance, an eighth
   narrower"). Clustering inflates the variance of a mean **1.0–1.8 times**,
   not the guessed 2–3 times on the standard error: r 1.05 by trader, 1.84 by
   day; d 1.57 / 0.99; matched d 0.98 / 1.59. ⟨pending: the exact null's own
   variance, by the minute⟩
8. ⟨pending: the map⟩

⟨pending: A.2 recomputed, entry by entry⟩

## 4. Variations weighed

- **The exact null's minute:** a trade's follow minute split by D exactly
  (chosen), against treating every trade as at its minute's start or middle
  (a step in D), or reading the tape (the cost the exact null is there to
  avoid).
- **The null's direction:** matched (A.0-4; chosen — the only one klines
  allow), against R8's own taker side (needs the tape of every hour).
- **The pull's order:** 10,000-minute segments from the cut backwards across
  all markets (chosen: R8's period complete after six hours), against market
  by market (the proof would have waited for the last market).
- **Funding:** by nominal hour (chosen; R8-REVIEW note 4, and what the
  changelog of 2026-09-01 describes), against by stamp (R8: differs only in
  the 40 ms after the hour, and once 46 s).
- **Labels:** weekly, from the 14 days before each Monday (chosen, point
  2.22), against one label at one instant (R8's T0).
- **The panel's form:** raw replies kept whole plus a built file a market
  (chosen: one read for a study, hashed, rebuilt from raw byte for byte),
  against raw replies only.
- **The 13 accounts from late boards:** excluded (chosen: they entered from
  profit boards read 2026-11-07 23:50Z — A.0-9 forbids them even as a
  secondary population), against a secondary population.
- **Spreads:** the root mean square of the market's move at the test's
  instants (chosen: direction-free, no outcome), against the spread of d
  itself (an outcome's neighbour).
- **Runs:** only weeks the capture covers (chosen), against every captured
  run (the page cap bunches them at the end).
- **KIOXIA-USD's close-only start:** its settlement day (the only day known
  to be close-only; chosen), against a guess earlier.

## 5. Potential problems, and how each is handled

| Problem | Handling |
|---|---|
| **The blind store** | the fills reader throws on a row at or after the cut; the panel builder refuses such rows (0 met) and the reader throws on them; the client refuses a history read without both stamps or ending after the cut (marks may end at the cut itself: no bucket starting at it can return); R2's light files never opened; `pool.json.gz` read for its account keys and notional-board membership only; the 13 late accounts excluded; R8's `probe/` never opened; `/v1/info/pnl` not read (item 5) |
| A fill whose ids exceed 2^53 − 1 | 3,403 rows of one account on 2026-05-07/08 (WTIOIL, SILVER) fail the boundary check: dropped and counted (`out/check-dropped.txt`), never read as numbers |
| Truncated captures (139 accounts) | a week counts only where the capture reaches 14 days back; runs of truncated accounts set apart |
| The competition (A.0-8) | runs split at 2026-11-02 14:30Z; ⟨other splits pending⟩ |
| The minute's look-ahead (up to 60 s) | the same for an entry and its null; its size against the second: ⟨pending⟩ |
| Holes in the marks | a minute may take the previous minute's mark up to 5 minutes old; longer holes are unpriced and counted |
| Cost tables from two November mornings | R8's, kept as approved (decisions 2026-11-09); stated |
| Uniform seconds inside a minute (the exact null) | stated; R8 found the klines' minute counts equal the tape's in 2,471 of 2,472 minutes |
| Holdout accounts | their fills before the cut are used (as R8 did); D1's data is after 2026-11-07 and untouched |
| A frozen list that is not yet frozen | "directional on the 14 days before the cut" is a candidate with a hash, for the supervisor to freeze |

## 6. What stays unknown

- Whether `/v1/info/pnl` honours `end_timestamp` (documented nowhere; item 5).
- When KIOXIA-USD turned close-only (the API gives only the settlement).
- How strongly entries cluster at 24–72 h horizons and in populations other
  than R8's 50 (the design effects are R8's cell's, mostly 1 h).
- The taker split of each minute's trades (for an own-direction null).
- The owner's own cost setting (to be talked through; decisions 2026-11-10).

## 9. For external-apis (new facts, dated and sourced)

- **2026-11-10 15:04Z, live** (`out/probe-end.txt`): `mark-history` at 1 m
  returns a bucket only if the bucket ends by `end_timestamp` (end
  12:00:00.000 or 12:00:59.999 → last bucket 11:59; 12:01:00.000 → 12:00);
  klines at 1 m include a candle opening at `end_timestamp` (end
  12:00:00.000 → 12:00 included), as R8 found.
- **R2's capture, read 2026-11-10:** fills of 2026-05-07/08 carry `trade_id`
  and `order_id` above 2^53 − 1 (3,403 rows of one account, WTIOIL-USD and
  SILVER-USD) — not exact as JSON numbers; later fills fit.
- **The rule book, 2026-11-10 14:55Z:** 90 instruments; KIOXIA-USD (51)
  `close_only`, settled as recorded; ids 12, 91–95, 98 empty; `stock-splits`
  no events (sequence 102317252065); fees unchanged (taker 0.0004, maker
  0.000125, seven tiers); ANT-USD's override from 2026-10-29T15:23:35.757Z,
  base tier taker 0.0002 and maker 0.0000625.
- **The changelog** (read 2026-11-10 ~15:37Z through a summarising fetch
  tool — quotes as the tool returned them): 2026-09-01 "Funding for a
  just-closed window now settles even if you flattened or flipped just before
  settlement was sequenced"; 2026-09-14 `/v1/info/pnl` and `/v1/info/equity`
  "page by time window, never by cursor"; 2026-10-27 `/v2/info/pnl`: "The
  effective end is the earlier of `end_timestamp` and now, rounded down to
  the minute, exclusive"; 2026-10-29 a funding multiplier applies to a
  period that starts inside its window, the whole period, no proration. No
  entry gives `/v1/info/pnl` an `end_timestamp`.
- ⟨pending: the pull's facts⟩
