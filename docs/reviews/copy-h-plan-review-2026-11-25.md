# COPY-H-PLAN-REVIEW — the fresh review of COPY-H's plan, before the owner approves it

COPY-H-PLAN-REVIEW (Fable 5.2, max, fresh), 2026-11-25 13:04Z – 13:49Z and, after a stop on a usage limit,
16:13Z – 16:21Z (UTC; every stamp from `date -u`), for polymarket-follow's supervisor. It reviews
`docs/reviews/copy-h-plan-2026-11-25.md` (`83ac6ba`, COPY-H-PLAN, Opus 5.5) against its brief's nine checks.
**A review decides nothing:** the supervisor and the owner rule on it. It recommends how a test is designed,
never what to trade.

**The limits held.** Read only. No program of the project was run and nothing was fetched; no web page was read.
Nothing on F: was opened: no raw store, no analyzer store, no look's output. In the supervisor's folder I opened
my brief, WORKFLOW.md (for its standing rules), my own `progress.md`, and COPY-H-PLAN's `scripts\` and `out\`
(read only). polymarket-lab was not touched and no agent was started. Four small scripts of my own ran, on
numbers the plan and the record state and on made-up worlds, never on data: `r1-power.mjs`, `r2-sim.mjs`,
`r2b-sim.mjs` and `r3-cohort.mjs` (section 6 gives their hashes). They are kept in my scratchpad and copied whole
into my `progress.md`. Two inputs came from the coordinator while I worked, and both are used: HL-FOLLOW-FACTS
(`19bb0d7`) and the supervisor's live probe of Hyperliquid's public API (external-apis, `6d4b99d`); section 3
answers them. What I read is listed in section 5.

One bp is 0.01% of a copy's $1,000, so 10 bps is $1. "±" is one standard error.

## For the owner, in one page

**Verdict: approve after these fixes.** The plan is good work and most of it stands. One fix changes how the
verdict is reached; the rest are small.

**What is solid**

- **The question and the rule are right.** MAIN is the paper experiment's rule, frozen on 2026-11-12, before
  anyone thought of Hyperliquid. No month of this data shaped it.
- **The plan's arithmetic is right.** I recomputed its whole power table with my own code. Every cell is equal;
  one differs by a point (44% against 43%).
- **No outcome was computed.** I read the planner's scripts. They count, size and compare prices of the same
  moment.
- **The reading of Hyperliquid's fills is careful and measured.** The one place where Hyperliquid differs from
  Polymarket (the position before each fill) is handled the right way, and I confirmed the plan's proof about
  the label by reading the classifier.
- **No month that chooses a filter judges it.** By the plan's rules a filter you choose on WAVE-H's months is
  judged on FRESH's months alone, and then on FRESH-2 alone.

**The one thing that must change (H1), in plain words**

- MAIN's traders lean long: two entries in three, in each of the planner's four account groups. Many copies
  stay open for days. So on any day thousands of copies are open together, and they rise and fall with the
  market together.
- The test's error treats each entry day as a fresh, independent draw. It is not: yesterday's copies and
  today's ride the same market. By my arithmetic on the plan's own counts, checked on made-up worlds, the money
  number really moves by about 10 bps from the market's path alone (6 to 15 in the cases that fit the counts),
  while the test would print an error of about 3. How large the gap is depends on how long copies stay open,
  which the build can count before any result exists.
- **What that would do.** The test would almost always give a verdict, but partly the market's own. A real
  +10 bps edge would read DROP about 1 time in 4 (1 in 7 in the mildest case). A line that truly earns nothing
  would pass the money bar for KEEP as often. The project has seen this before: on Polymarket the same kind of
  line read +21 in one stretch and −59 in the next, and the record said "the period decides the sign".
- **The fix is small, and the test can still answer.** Each verdict must hold on both readings: the money, and
  the copy's result after costs measured against what the market itself did at the traders' usual lean. That is
  the paper experiment's second reading, given a bar of its own. With it, neither wrong verdict can come from
  the market's direction.

**The chance of a clear answer, honestly.** More likely than not. If copying has no edge, which every earlier
measurement points to, a clear DROP comes about 9 times in 10 with the fix (6 in 10 in the worst case I
computed). A real edge of +15 bps would read KEEP about 6 to 7 times in 10, and never DROP.

**What a yes would be worth if you enter by hand.** +15 bps is $1.50 on a $1,000 copy. Watching 10 of MAIN's
accounts gives about 28 copies a week: about $42 a week, against a weekly swing of about ±$180. It would take
about a year and a half of your own trades to see that edge in your own results. The larger worth of this test
is its most likely answer: a clear DROP closes the founding question on both venues.

**The other fixes, in a line each**

1. Write down what a DROP at look 1 does to your filter rounds. Today the plan says both "no polishing" and
   "rounds after look 1".
2. Build prices from real market trades only. On a crash day the exchange's own takeover trades are up to half
   of a coin's trades, at prices nobody could trade at. The project's earlier tests already left them out.
3. Three checks move before the freeze, where they can still be acted on: the unpriced share on all of WAVE-H's
   months, the label shortcut, and the heaviest accounts.
4. No "fast follower" line. The probe showed a tool can see a trade in under a second, but you act by hand, and
   a price each minute cannot price a delay of seconds.

**The plan's questions.** I agree with nine of its ten recommendations, three of them with changes: the
rounds' rules tightened (5), the label check moved (6), no fast line (10). On the tenth (9) I recommend fixing
FRESH-2's length now, at 26 weeks. Section 2.9 gives each.

---

## Verdict

**Approve after these fixes.** Two high findings, nine medium, nine low. H1 changes the rule that decides
(C12) and the plan's first page; it must be ruled by the owner, since it changes what KEEP and DROP mean. H2 is
one sentence that the owner must choose. Nothing asks for a new plan: the data, the mapping, the store, the
calendar and the seals stand.

## 1. Findings, by severity

### High

**H1. The money reading's error leaves out the market's path. The gate's table and both verdicts rest on it.**

- **What the plan says.** "Single copies' noise averages away, so only the market's own daily move is left. 504
  judged days then give an error of 2–7 bps a copy." The error is R12's: CR1 by trader and by the UTC day of
  t + D. DROP is decided on the money alone. KEEP also needs "the mean d > 0", a sign.
- **Why that error is too small here.**
  - Copies entered on different days are open on the same market days. A line that leans one way then carries
    the market's move in every cohort at once. An error clustered by entry day sees each cohort's own spread
    and misses what the cohorts share. Clustering by trader cannot see it either: 13,900 traders hold the same
    market at the same time.
  - **The lean is real in the plan's own counts, and alike in four separate account groups:** MAIN long 806,
    short 418 in the sample week; 70%, 63%, 64% and 69% long by group (`out/s5b-w2025-p0…p3.txt`). That it
    holds week after week is my assumption; fix 7 measures it.
  - **The holds are long enough:** 259 of the 1,224 entries (21.2%) had no exit by the end of their entry week
    (`out/s5c-w2025.txt`), with a usual hold of 17.5 hours.
  - **My arithmetic** (`r3-cohort.mjs`; a model, not a measurement): a lean of 0.32 and a market that moves
    3–4% a day.

    | Holds | The mean's real spread ÷ the error an entry-day cluster reads | Read, bps | Real, bps |
    |---|--:|--:|--:|
    | every hold exactly 17.5 h, no tail | 1.15 | 2.7–3.6 | 3.1–4.1 |
    | a thin tail fitted to the 21.2% (exponential holds, mean 1.5 days) | 1.92 | 3.3–4.4 | 6.4–8.5 |
    | a long tail fitted to the 21.2%, holds cut at 7 days | 2.25 | 2.8–3.7 | 6.3–8.4 |
    | the same, cut at 14 days | 2.70 | 2.8–3.8 | 7.7–10.2 |
    | the same, cut at 30 days (the central case) | 3.19 | 2.9–3.8 | 9.2–12.2 |
    | the same, cut at 90 days | 3.84 | 2.9–3.8 | 11.1–14.8 |
    | the lean moving day to day (SD 0.15), 30 days | 2.91 | 3.7 | 10.8 |

    The "read" column lands on the plan's own 2.4–4.1. So the plan's table describes what the test would
    print, not how far the money number really moves. Every case that fits the planner's 21.2% lies between
    about 2 and 4 times.
  - **Checked on made-up worlds** (`r2b-sim.mjs`: 504 days, 5,595 copies a day, 300 worlds, a true mean of 0).
    With the 30-day holds the mean really moves 10.7 while the entry-day cluster reads 3.3 (3.21 times; the
    formula says 3.19), and 43% of the worlds lie beyond 2.43 of their own errors, where 1.5% should. With no
    tail it is 1.13 times and 2.3%. With no lean it is 1.01 times and 1.0% (`r2-sim.mjs`). **So the size of
    this rests on the long holds,** and the planner's count says they are there: with no tail 10.4% of a
    week's entries would have no exit by its end, and 21.2% had none.
  - **Wider clusters do not rescue the money reading:** by week the ratio is still 1.62; by 30 days 1.16, with
    16 clusters. And at an honest error near 10 bps the money cannot see ±10 at all.
- **The record already shows it.**
  - X3, the plan's borrowed source: "before 2026-10-10 +20.9 ± 11.0, after it −59.4 ± 24.2 … that points to
    the market's direction, not to the traders" (APPROACH-REVIEW, B1). The two stretches are 3.0 of their own
    errors apart (my arithmetic). So the borrowed day error has the same gap.
  - APPROACH-REVIEW, "What could fool us", 1: "A few weeks can pass or fail on the drift alone. Guard: KEEP
    needs d against the matched null to agree". The guard was set for KEEP only, and as a sign.
  - FIND-6-EXITS: the 20 copies still open at the cut averaged −575 bps and carried about 6 of the 16 bps
    lost. Long holds carry the money number.
- **Why the paper experiment's own rule is sound and this copy of it is not.** At the paper experiment's few
  hundred copies a week the copies' own noise is most of the error (X5: 345 bps a copy), so the missing part is
  small beside it. At 39,000 a week that noise is gone, and what is left is exactly the part the clusters
  cannot see.
- **What C12 as written would do** (the central case: the test reads 3.35, the real spread is 10.7; two
  looks):

  | The true mean, bps a copy | DROP | The money bar for KEEP passed |
  |---|--:|--:|
  | −12.5 (no edge, costs only) | 92% | 4% |
  | 0 | 61% | 27% |
  | +10 | 27% | 61% |
  | +15 | 15% | 76% |
  | +20 | 7% | 88% |

  A verdict nearly every time; near the two bars, often the wrong one. In the mildest case that fits the
  counts (the thin tail, about 2 times) the two wrong rates are about 14% (`r1-power.mjs`, E: high, k 2); the
  bars promise 1.5% or less. KEEP's sign conditions cut its wrong passes by about half. DROP has no guard, and
  DROP is the verdict that "closes copying on both venues".
- **The rounds inherit it.** C14 says a useless try reaches a final KEEP "at most about 0.06% of the time".
  A try such as "longs only" leans fully one way. Each of its stages is then close to a coin toss on the
  market's direction, times a coin toss on d's sign.
- **The exact fix** (C12, C13, C14 and the plan's first page):
  1. **A second deciding quantity on the same set.** For each copy with a d (R10): x′ = d − (that copy's own
     cost over 24 hours at C9's setting: the kit's `leg` at 24 h, its gross less its net), in bps. Its name:
     **the edge over the market**. m′ is its mean. SE′ is R12's two-way error computed twice, with the UTC day
     and with the UTC week of t + D as the time cluster; the larger is used.
  2. **DROP:** m + z·SE < +10 **and** m′ + z·SE′ < +10.
  3. **KEEP:** m − z·SE > 0 **and** m′ − z·SE′ > 0 (in place of "the mean d > 0") and the two sign
     conditions.
  4. When the readings disagree: TOO FEW TO TELL, with one fixed sentence saying which reading failed.
  5. **C14:** the choice on E, the confirmation on S and the sealed judgment on FRESH-2 each use the same pair
     of bounds, in place of "its mean d > 0".
  6. **C13 prints**, deciding nothing: the null's mean gross (what the market gave at the traders' lean); d;
     x′; and the money's error clustered by UTC week and by calendar month.
  7. **Before the freeze, from counts only** (the rehearsal): the survival curve of MAIN copies' holds and the
     long share day by day. The rules review reads the ratio "real ÷ read" from them by section 6's formula, so
     that the size of this is measured, not modelled.
  8. **The first page** says: the SE row is what the test will print for the money; the money's real spread is
     larger; the bar is carried by the edge over the market. And its chances are restated (section 2.2).
- **With the fix** (one look at 504 days, so close to a floor): no edge reads DROP 91% in the central case and
  60% at the worst corner of my grid (`r1-power.mjs`, section F). A real +15 reads KEEP 60–74%, +20 reads
  85–87%. No cell gives the wrong verdict. The gate passes.

**H2. What a DROP at look 1 does to the rounds is not written, and two sentences of the plan disagree.**

- **The plan:** the gate's point 3, "DROP closes copying on both venues, with no polishing"; section 1, "No
  variant of it is polished on these months"; C14, "Explore, after look 1 is recorded, on E's priced copies
  only". C12 ends the test at the first KEEP or DROP. At look 1 DROP is the most likely word (the plan: 88–100%
  at −10 in its low and high cases).
- **Why it is high:** if it is ruled after look 1, it is a rule made on a result. That is the chain
  FABLE-REVIEW's M8 describes.
- **The stop rule's wording** is also touched: decisions 2026-11-25 says "after COPY-H's one look". The hybrid
  has two looks, a rounds stage, one confirmation and a sealed judgment in spring 2027.
- **The exact fix:** one sentence in C14 and one in section 1, chosen by the owner now (my question 2):
  - **(a), recommended:** "The rounds run whatever look 1 says. A DROP closes copying MAIN's way. The rounds'
    at most two tries are the only variants ever judged, once on S and once on FRESH-2; nothing else is built
    or polished on these months." The stop rule then reads "after COPY-H's step 2".
  - **(b):** "A DROP at look 1 ends COPY-H. No round runs, and S stays sealed."
- Either way the first page should say what to expect: the rounds will most likely end with no confirmed
  filter. Even a real +15 filter passes both later stages 28% of the time in the plan's "high" case, and that
  is an upper end.

### Medium

**M1. The tape holds the exchange's own takeover and deleveraging trades. C9 and C10 take every taker record.**

- **The record:** a backstop liquidation's taker leg is the vault's (`crossed` true, `liquidation.method`
  "backstop"); "On 2025-10-10 … the backstop's legs are up to 54% of a coin's takers" (external-apis,
  EXTRACT-BUILD's checks). WAVE-H's frozen rule H8 leaves those records out: "its price is the engine's, not
  the book's". The exam's P7 does the same. The planner's crash hour also holds 35,022 "Auto-Deleveraging"
  records (`out/s7-chain-heads.txt`).
- **The plan:** "a coin's minute mark is Σ px·sz ÷ Σ sz over the minute's taker records"; the null counts
  "one taker record a trade"; the spread pairs "two consecutive taker records".
- **What it does:** in a cascade minute the mark, the spread and the null's weights lean on prices no follower
  could trade at. The copies it touches most are the ones whose exits copy a liquidated trader. The plan's own
  calibration against `asset_ctxs`' `mark_px` may not show it: the engine's price is close to the venue's own
  mark.
- **The exact fix:** C9 and C10 use **market trades only**: a taker record whose `liquidation.method` is not
  "backstop" and whose `dir` is neither "Auto-Deleveraging" nor "Settlement". The `bars` writer keeps the
  left-out records' count a minute, for a print. The removal table (R10) takes the line's fills by the same
  rule. A made-up test pins each case. And one more print, deciding nothing, for the cascade minutes: MAIN with
  c taken from the leg's own minute where it holds a pair (the bars already hold the gap).

**M2. The tripwire leaves out the kit's third reason for "unpriced", the one that grows with a copy's hold.**

- **The kit:** a copy is unpriced when any funding settlement inside its hold has no mark in the 5 minutes
  before the hour (`panel.mjs` `fundingBetween`; R11's "a funding settlement without a mark"). On the tape that
  is a coin with no trade from :54 to :59, at any hour of a hold that may last weeks.
- **C16 counts** the follow and exit instants, the missing funding hours (which unprice nothing) and the gap
  copies. It does not count this. The sample's "0.01% of instants" is three hours of one week, weighted to BTC,
  ETH and SOL.
- **Why it matters:** WITHHELD is at 2%, and "a repair would be a new frozen test". A coin's quiet six minutes
  before an hour unprice every copy of that coin open through it; a venue-wide stop does it for every coin. The
  exam's own projection of this term was 2.4% (look 1's report, section 5), and look 1's lesson was to project
  from the tested months.
- **The exact fix:**
  1. C16 adds: "each funding hour inside a copy's hold whose coin has no market trade in the 6 minutes before
     the hour".
  2. The tripwire's counts run on **all of E before the freeze**, without prices (entries, exits and bars
     only), as part of the rehearsal. S's run at step 2, as planned.
  3. If the projected share is above 0.5%, C9 is changed before the freeze, and named in the plan's section 3
     table: a funding settlement is valued at the coin's latest mark at most 60 minutes old. (The amount
     changes by the rate times an hour's price move.)

**M3. The label bound's check is empty where the plan puts it, and the label step is not cheap.**

- **The check:** section 7 (c) puts "the label bound's check on one slice" in the rehearsal on E's first two
  weeks. There M − 90 d lies before ARCHIVE_START (2025-05-25), so the bound never binds, and the check must
  show no difference.
- **What can differ once it binds** (`classifier.mjs`): positions older than the capture are missing from
  `maxPositions`, so a book of old positions can turn a "mixed" account "directional"; cycles longer than 76
  days leave the closed-cycle counts.
- **The cost:** "The label step is cheap: … 0.03 ms for the median account". The total is carried by the
  heaviest accounts. At the measured 1.42 microseconds a fill (219 ms for 154,303), each kept record lying in
  the 90-day capture of 12.9 Mondays, 3 billion records give about **15 CPU-hours** (`r1-power.mjs`, G), before
  sorting and memory. (An upper estimate: the classifier skips an account with no fill in a Monday's 14 days.)
  It is not in the plan's time budget.
- **The exact fix:**
  1. The check runs on one 1/32 address slice at four Mondays where the bound binds: 2025-12-01, 2026-02-02,
     2026-04-06 and 2026-05-25. Labels and MAIN membership only, the 90-day capture against the whole one,
     every difference listed.
  2. Its pass mark is fixed before it runs. Recommended: MAIN's membership differs for under 1% of MAIN's
     accounts at each Monday.
  3. The plan's section 6 states the label step's measured total and how it is cut into resumable parts.

**M4. The kit runs on every account's whole history, and one of its loops is quadratic for an account that is
never flat.**

- **C4:** "`toEvents`, `toCycles` and `buildEntries(events, −∞, ∞, 60 000)` run on each account's fills from
  ARCHIVE_START."
- **The kit** (`entries.mjs`, `buildEntries`): every reducing event is appended to every group still open on
  that side, and a group leaves only at a close or a flip. An account that adds and trims for months without
  going flat grows that list with the square of its events.
- **The planner's own slice** did not meet it: it capped accounts at 300,000 rows and set aside the three
  heaviest (5.69 million rows in 37 days).
- **The frozen rules must say the case.** An account can be "directional" in one fortnight and carry such a
  history from other months.
- **The exact fix:**
  1. C4 says whose whole history is built: the accounts that are P1 at some Monday of the stage. (It changes no
     result; the others never give an entry.)
  2. The rehearsal counts, among them, the largest account's events and the kit's time and memory on it.
  3. A rule fixed on counts before the freeze names what happens to an account the kit cannot hold.
     Recommended: its entries are in no line, and it is named, with the count of the entries left out.
- **The engine's own guard.** The store is built twice; the engine's run is not. A bit flipped while labels or
  prices are computed is caught only if the Final review recomputes that account. **Fix:** C15 says which: each
  bucket's positions are computed twice in separate processes and held equal by hash, or the Final review's
  independent code covers a set of buckets named before step 1.

**M5. The rounds' rules have loose ends, and one of them touches "no choosing month judges".**

- **A try from the wave's family is not clean on S.** FRESH's months have already printed the wave's results by
  month and by side (look 1's report; decisions 2026-11-25). A try such as "entries after a liquidation
  cascade" would be confirmed on months that suggested it. That is FABLE-REVIEW's M1 again. **Fix:** C14: "a
  try may not use a liquidation, a cascade or a price move before the entry; that family was printed on
  FRESH's months".
- **"The k tries run so far"** leaves open whether an early try is judged at an early, easier bar. **Fix:**
  every try is judged at k = 18 (z 2.99), whatever the number run.
- **Holm "z 2.24, then 1.96 for the second"** leaves one try alone at 1.96 or at 2.24. The gate's table
  assumes 2.24. **Fix:** m is 2 always: the first passes at 2.24, a second at 1.96.
- **"hold"** in the list of what a try may use. **Fix:** "the trader's usual hold at M". Every filter uses only
  what is known at the entry's instant.
- **The wording that worried the supervisor** is in section 2.1.

**M6. Nothing guards against a price from a thin tape, and the record says such prices flatter.**

- **The record:** look 1's depth-short positions averaged +208.6 against −16.4 for the rest; "a reading that
  leans on thin-tape fills would be flattering" (its report, section 8). The tape gave a median $253 of the
  $1,000 a leg needed.
- **The plan:** a leg is priced whenever its coin traded in the last 6 minutes, whatever the size. "What it
  leaves out: depth beyond the quoted half-spread at $1,000".
- **The exact fix:** the bars already hold Σ px·sz a minute. A leg is **thin** when the market trades of its
  minute and the five before it sum to under $1,000. Printed at each look: the thin-leg copies' count and
  share, and MAIN's mean with and without them. KEEP's sign conditions gain one: the mean without them is
  above 0.

**M7. The delay lines: DELAY0's price looks behind the trader, and SPEED cannot be priced by a minute's
price.**

- **DELAY0** enters at the mean price of the minute that holds t. That minute includes trades before the
  trader's fill and the trader's own fills. On Polymarket the D = 0 follower entered "at the end of the trader's
  own minute" (FIND-6-EXITS).
- **MAIN's own mark** is the mean of the minute that holds t + D. It is centred on the follow instant, where
  the paper's mark is the minute's end. That is a fair choice and should be said and shown.
- **SPEED** has no rule yet ("from HL-FOLLOW-FACTS"). HL-FOLLOW-FACTS proposes D in [10 s, 30 s) at the first
  taker trade at or after t + D. That is a second price source: the bars cannot give it, and the fills store is
  cut by account, not by coin and time.
- **The exact fix:**
  1. The bars carry each minute's last market taker price. DELAY0 uses it: the end of the trader's own minute,
     as FIND-6-EXITS did.
  2. MAIN is printed once more on that price, beside, deciding nothing.
  3. SPEED is not in COPY-H (section 3 gives the reasons). If DELAY0 beats MAIN by more than its error, a fast
     line is its own small frozen test on unseen months.

**M8. A yes is not sized.**

- FABLE-REVIEW's gate asks what each answer is worth (its "Improve" 1; M4). The plan says KEEP's worth "depends
  on where you could act". The owner has since said they would enter every trade by hand (decisions 2026-11-25,
  "COPY-H's plan is written").
- **My arithmetic** (`r1-power.mjs`, H; the plan's counts, X5's 345 bps a copy): 2.82 entries a week for each
  MAIN account.

  | Accounts watched | Copies a week | At +15 bps on $1,000 | Weekly swing | Weeks until it shows at two errors |
  |--:|--:|--:|--:|--:|
  | 10 | 28 | $42 a week | ± $183 | 75 |
  | 50 | 141 | $212 a week | ± $410 | 15 |

- At $10,000 a copy each figure is ten times larger, the swing too. The supervisor has since recorded one
  venue whose terms permit copying an outside account at Hyperliquid's own prices and fees (decisions
  2026-11-25, PROP-FIRM-FACTS); its size and loss limits would set the real numbers.
- **The exact fix:** one line on the first page with this arithmetic, and the sentence that the test's larger
  worth is a clear DROP. It changes no rule. δ stays +10.

**M9. The rehearsal prices real copies before the freeze.**

- Section 7 (c): "its priced copies sealed unread, their SHA-256 printed, then recomputed and compared at step
  1". An outcome would then lie on disk before the rules are frozen, kept from eyes by a promise.
- **The exact fix:** before the freeze the rehearsal keeps no file of priced copies. It computes them in
  memory, prints only their SHA-256, and step 1 compares its own to that.

### Low

- **L1. FRESH-2's length** is to be "fixed in step 2's report", after look 2 is seen. **Fix:** fix it now:
  26 weeks, [2026-11-16, 2027-05-17).
- **L2. `coins.json`, `vaults.json`, the coin's index.** The plan does not say where the coin list comes from,
  and S may not be opened to list its coins. **Fix:** the list is the info API's `meta` (235 main-dex coins, 56
  delisted, 2026-11-25; 59 delisted on 2026-11-13: say which reading), in `meta`'s order, append-only (the delay
  is hashed from the index). A main-dex coin in the fills that the list lacks stops the step. The vault rule is
  the predicate, applied to each step's own fills, with the list printed.
- **L3. Three exact words for the mapping.**
  - C5's habits "on the account's whole events" against R5's "from the fills before M only". **Fix:** R5's
    words; the build may compute once from the whole fills where no order event straddles M, shown per account.
  - Chains are matched in the prototype with `toPrecision(12)`. **Fix:** "b follows a" is exact on the decimal
    text, as scaled integers.
  - The kit zeroes a position within an absolute 1e-9. A close of a large position in hundreds of fills can
    leave a larger float residue, and the kit then reads a reduce or a flip. **Fix:** a made-up test of such a
    close, and the rehearsal's count of events with 1e-9 ≤ |prev + net| < 1e-6.
- **L4. The reproduction's "the kit's labels at every one of its 26 Mondays"** cannot hold as written: with
  pnl 0 some "mixed" accounts become "churner". **Fix:** "P1 at every Monday for every account; label
  differences only between churner and unclassified — mixed, listed".
- **L5. Imports from other frozen programs.** `planCopyThrough` and the two-way error live in `dist/paper/`
  (the paper's freeze; `stats.js` is in MARKET-1's too); the decoder in `dist/polish/`. **Fix:** C0 names each
  imported file and says what happens when its own program re-freezes it (the paper's breaker fix is waiting).
- **L6. The funding fetch is hours, not "small":** about 235 coins × 26–28 windows, 6,100–6,600 reads, 3.7 to 8
  hours at half budget (HL-FOLLOW-FACTS 2.4). **Fix:** part 0 plans it in several sessions with a manifest and
  a safety stop.
- **L7. The budget is light.** "about 4,500 with tests, against the polishing's 12,931" compares code with
  tests against code alone: the paper experiment is 4,456 lines of source without its tests. **Fix:**
  restate both sides the same way, and add the machine time (M3; the pass twice; the fetch).
- **L8. MAIN on S alone** is free at step 2 and is the first reading on months MAIN's look 1 did not hold.
  **Fix:** one print, deciding nothing.
- **L9. FRESH-2 is now also the frozen crash-side page's months** (decisions 2026-11-25, "the crash side only",
  ruling 6: "Any print of FRESH-2's crash-hour moves would be a look at this page's months, and its plan must
  say so"). **Fix:** C14 says that COPY-H's judgment on FRESH-2 prints no move of a crash hour; its day and
  month prints there are named as what they are.

## 2. The brief's nine checks

### 2.1 Does any choosing month judge?

**No, by the rules as C14 writes them. Two sentences read otherwise and should be mended.**

| What is judged | The months that judge it | Was it chosen on them? |
|---|---|---|
| MAIN, look 1 (z 2.81) | E: 2025-06-30 → 2026-05-29 02:00Z | no: MAIN was frozen on 2026-11-12 on Polymarket's weeks |
| MAIN, look 2 (z 2.43) | E ∪ S, cumulative, to 2026-11-16 | no; two fixed bars, 2% two-sided in all |
| A MAIN KEEP's confirmation (z 1.645) | FRESH-2 alone | no |
| A try: chosen | E (after look 1) | this is where it is chosen |
| A try: confirmed once (Holm, z 2.24 / 1.96) | **S alone** | no |
| A try: the sealed judgment (z 1.96) | FRESH-2 alone | no |

- **The evidence that the confirmation is on S alone:** C14, "Confirm, once, on S at step 2"; section 4's
  calendar, S "judges … the chosen tries once"; and the gate's arithmetic, which uses S's 171 days for it
  (`s9-power.mjs`, `seS`).
- **The two sentences to mend** (the smallest fix): the recommendation's line 3, "Then look 2 on E + FRESH's
  months (S), where at most two chosen filters are confirmed once", and the decisions entry "COPY-H's plan is
  written" ("look 2 on E + FRESH … with at most two chosen filters confirmed once"). Write: "At step 2: MAIN's
  look 2 on E + S; the at most two chosen filters are confirmed once on S alone."
- **I looked for leaks of E into a try's judgment and found none:** the spread comes from the day before (a
  cost); labels and habits at S's Mondays use fills before each Monday; a try sets no new price; E's copies
  that cross END_E are marked there at look 1.
- **Two real limits, both findings above:** S is not clean for the wave's family (M5), and each stage's bound
  must be one the market's direction cannot pass (H1).

### 2.2 The gate, recomputed and challenged

**The arithmetic is right.** From the plan's stated inputs (X3: 1,366 copies, 65 days, errors 9.1 by trader and
11.3 by day; 1,224 MAIN entries a week in a 1/32 slice; E 333.1 days, S 170.9, 504.0 in all; the z values), my
own code (another Φ, the two looks by integration, not by draws) gives:

| | Mine | The plan's |
|---|---|---|
| The day error: low / high / stress | 54.2 / 91.2 / 150 | the same |
| A: SE; DROP at −10; KEEP at +15 | 2.41 / 4.06 / 6.68; 100 / 99 / 66%; 100 / 87 / 37% | the same |
| Hybrid by look 2: DROP at −10 | 100 / 99 / 72% | the same |
| Hybrid by look 2: KEEP at +15 | 100 / 90 / 44% | 100 / 90 / 43% |
| Hybrid by look 2: DROP at 0 | 96 / 52 / 18% | the same |
| B passes both at +15; the rounds at +15 | 73 / 18 / 3%; 88 / 28 / 5% | the same |
| A MAIN KEEP confirmed at +15 on 180 days | 98 / 71 / 38% | the same |

Also checked: every z against its level; 2.5% × 2.5% = 0.0625%; the calendar, the 72 weeks and the Mondays.
The Bonferroni bars the plan leaves as a formula are 2.73, 2.91 and 2.99 at 8, 14 and 18 tries.

**The inputs, challenged.**

1. **Is Hyperliquid's day error larger or smaller than X3's? Larger, most likely.**
   - Every coin is crypto, most of them small coins; X3's venue also holds stocks, gold, oil and indices.
   - The line leans long by 0.32; a lean times a 3–4% daily move is about 100–130 bps a day by itself.
   - E holds 2025-10-10. CR1 sums squared day totals, so a few such days carry the error.
   - What shrinks it is real but small: the copies' own noise falls from 73 to 4.5 bps a day.
   - So the plan's "stress" case (150) is nearer the middle than the edge.
2. **What if it were twice as large** (182 bps a day, days still independent; `r1-power.mjs`, C)? SE 10.0 at
   look 1, 8.1 at look 2. DROP at −10 falls to 52%, at −15 to 75%; KEEP at +15 to 29%. At 125: DROP 88%, KEEP
   61%. At 300: 18% and 10%.
3. **Copies a week.** 39,168 comes from one week of one month. It hardly matters: an eighth of it would move
   the SE by 0.4–2.5% (`r1-power.mjs`, G), because the copies' own noise is already gone.
4. **The independence of copies.**
   - *Traders:* fair. No account holds more than 40 of the 1,224 entries; the trader clusters hold the rest.
   - *Days:* this is H1. Entry days are not independent for a leaning line held over days.
   - *Episodes:* a print only; fine.
5. **The stress case** treats the lean as more noise on independent days. The lean's real effect is that the
   days stop being independent, which no value of the day error stands for.

**Is a clear answer more likely than not, honestly?** Yes, once the verdict is tied to the reading whose error
is honest (H1's fix).

| The truth | The plan's first page | C12 as written, central case | With the fix, central case |
|---|---|---|---|
| no edge (−10 to −12.5) | DROP 99–100% (72% stress) | DROP 88–92%, the money bar for KEEP 4–7% | DROP 85–91%, KEEP 0% |
| 0 | DROP 52–96% (18%) | DROP 61%, KEEP's money bar 27% | DROP 24–57%, KEEP 0% |
| +10 | — | **DROP 27%**, KEEP's money bar 61% | KEEP 24–57%, DROP 0% |
| +15 | KEEP 90–100% (43%) | KEEP's money bar 76%, **DROP 15%** | KEEP 60–74%, DROP 0% |

- **The central case** is `r3-cohort.mjs`'s: the 30-day holds at a 3.5% daily move, where the test reads 3.35
  and the mean really moves 10.7. With shorter holds the gap is smaller and C12 as written errs less: with no
  long holds at all it is 1.15 times, and the plan's own table then stands almost as printed. Fix 7 of H1
  measures which case is the real one, from counts.
- **The fix's column** is one look at 504 days with SE′ of 2 to 4.5 bps, so it is close to a floor. SE′ cannot
  be measured before the freeze. It is borrowed the plan's way: FIND-3's d had almost no shared daily part (my
  reading of its by-day interval, about ±23 on about a thousand entries, against X5's 365–397 bps a copy), so 2
  to 4.5 is on the cautious side.
- **The fix costs little where it is not needed.** If the money's error were honest after all, the second
  bound would agree with it nearly always, and the plan's chances would hold.

### 2.3 Was any outcome computed?

**No.** I read the planner's scripts and their outputs: eleven line by line, and the abandoned first try
(`s5-slice-window.mjs`, whose output is not used) by a search for every price and outcome field.

- Every reader drops `closedPnl`, `fee` and `builderFee` in the JSON reviver. `s3` splits only the time and the
  coin from `asset_ctxs`. `s1` and `s2` read manifests.
- Prices are used twice: px × sz for sizes (`s4`, `s5b`), and in `s8` the gap between consecutive opposite-side
  takers at most 2 s apart. That is a cost at one moment; no price is compared across time, and none is
  printed.
- **Three things carry a hint, and none can bias a rule:**
  - the long share of MAIN's entries in the sample week (66%). With public prices it hints at that week's sign.
    It shaped only the stress case. MAIN, δ and the bars were fixed before it was seen;
  - the counts of forced fills by side in the 2025-10-10 crash hour: public knowledge;
  - the slice's rows, with each fill's price, lie in the planner's scratch (`s5a` writes them). Nothing was
    computed from them. They could give outcomes, so the supervisor should delete them or list them under the
    seal.
- **What was looked at before, for another question:** WAVE-H's and FRESH's months printed the wave's results.
  That touches only the rounds (M5).

### 2.4 The mapping onto Hyperliquid's fills

| The paper's rule | The plan's mapping | My check |
|---|---|---|
| Events per order (R4) | each fill takes its chain head's `startPosition`; chains by "b follows a" inside one (user, oid, coin, time) | **Faithful.** The kit keys an event by (oid, prevS, coin); with chain heads a matching event is one event, as on Polymarket. Per-fill keys would turn one order into an open and many adds, and change the classifier's open-and-close share. Measured: 17 breaks in 109,724 events, 315 in 2.96 million. Fixes: L3 |
| Cycles, entries, exits (R4, R8) | the kit unchanged | Faithful. Risk: M4 |
| The label (R5) | `labelAt` on a 90-day capture, pnl 0 | **The pnl proof holds:** the churner rule's conditions (≥ 5 fast trips, share ≥ 0.5) imply the gray rule's (≥ 3, ≥ 0.25), so such an account is never "directional" (`classifier.mjs` lines 221–236). The bound: M3. The reproduction's wording: L4 |
| The habits (R5) | `habitsAt` on the whole events | Faithful but for R5's "before M only": L3 |
| The delay (R4) | `delayOf(entryId)`, D in [62.14 s, 95.44 s) | Faithful. The id holds the coin's index, so the coin list's order is frozen (L2) |
| The matched null (R10) | `dAgainstNull` at 24 h; counts from the tape; removal per line and week | Faithful, on market trades only (M1). The removal for E's last week needs only the entry's own hour, so S stays closed |
| Forced fills | own liquidation leg; `dir` "Auto-Deleveraging", "Settlement", "Liquidated …" | Faithful for the account's own events. A backstop's own leg is `crossed` false and is caught by its `dir` (external-apis). On the tape: M1 |
| Spot | left out | Right: its `startPosition` is a balance and breaks half its chains (s6) |
| Builder dexes | left out, counted | Right. Stated limit: an account's builder-dex trading is unseen by its label |
| Vaults, sub-accounts | the protocol vault's accounts out; the rest as accounts | Named, as FABLE-REVIEW asked. L2 |
| Markets (R6) | main-dex coins; a "Settlement" closes a coin | Mapped. A copy open across a settlement is unpriced (R11's small survivorship, to be named at the look). 56 coins are delisted |
| Marks (R9) | the minute's mean taker price | **Changed, and declared.** M1, M6, M7 |
| Spread (R9) | half the day before's median pair gap | A cost from the tape; sound for calm hours, too small in a cascade (2.5) |

### 2.5 The price source

- **One source for every month is honest, and it is the right one.** The fills are the only complete record.
  The books thinned through 2026, and `asset_ctxs` covers part of each day from late September. The tape does
  not change with the calendar, which is what FABLE-REVIEW's point 4 asks.
- **From October 2026 nothing outside checks the tape.** The calibration prints end where the books and
  `asset_ctxs` end. The tripwire per step (C16) is the guard, once it counts all three reasons (M2).
- **What would break it in a crash hour:**
  1. the engine's prints in the marks, the spread and the null's weights: up to 54% of a coin's takers on
     2025-10-10 (M1);
  2. the spread: the day before's median is far below a cascade minute's real cost (M1's last print shows how
     much it matters);
  3. a minute's mean spans a wide range, and a copied forced exit lands in it. This is noise on those copies,
     seen by KEEP's day condition and the concentration prints;
  4. funding hours without a mark, if trading stops (M2);
  5. memory: 6.7 GB for that one hour as objects (s7). The pass must stream it.

### 2.6 FABLE-REVIEW's twelve points

| # | Point | Met? | Why |
|---|---|---|---|
| 1 | one question, one deciding line, each verdict's meaning | **partly** | all there; DROP's meaning disagrees with the rounds (H2) |
| 2 | MAIN unchanged; TEN, BROAD, DAY beside; a ranking as one line | **met** | RANK beside. The rounds are a second road beyond this point, by the owner's wish; the label bound is to be shown (M3) |
| 3 | the power first | **partly** | it is first and its sums are right; its error is not the money's real one (H1) |
| 4 | one price source | **met**, after M1, M2 and M6 | the tape; calibration prints; a tripwire from the tested months |
| 5 | both readings, as R12 | **partly** | to the letter, yes. At this size d's sign is too weak a guard for KEEP, and DROP has none (H1) |
| 6 | a number a few days or accounts cannot carry | **met** | the two-way error, two sign conditions, the concentration prints |
| 7 | the mapping written and tested first; vaults named | **met** | the plan's section 3, s6, s7, made-up tests, the reproduction (L3, L4) |
| 8 | the bar where the owner acts; base-tier costs | **partly** | 4.5 bps a leg is confirmed (HL-FOLLOW-FACTS). The talk is still owed; a yes is not sized (M8) |
| 9 | the delay as frozen; faster and slower beside | **met**, after M7 | R8's D decides; +5 and +15 minutes beside |
| 10 | a build budget | **partly** | given; light on lines and on machine time (L7, M3) |
| 11 | the exam's guards | **met** | twin store, reproduction, independent code, nothing heavy beside. The engine's run has no twin (M4) |
| 12 | FRESH-2 unseen | **met** | sealed until step 2's report. Its length is not yet fixed (L1) |

### 2.7 The build

- **Is it proportionate?** Yes for the question: FABLE-REVIEW calls it "the right last big question", and its
  most likely answer closes copying. It is larger than the plan says (L7): expect about the paper experiment's
  size in code, plus its tests.
- **What carries the size:** the pass over 1.9 TB (about 12 CPU-hours a build, twice); the label step (about 15
  CPU-hours, M3); the engine for about 13,900 MAIN accounts at each Monday.
- **The simplest version that keeps MAIN's answer:**
  - design A's road for MAIN: no rounds stage;
  - **a fixed 1/8 of the accounts** (by address) for the copies, the whole tape for prices and the null. By
    the plan's own model the SE grows by 0.4–2.5% (2.47 / 4.10 / 6.71 against 2.41 / 4.06 / 6.68;
    `r1-power.mjs`, G). The fills store falls from about 145 GB to about 18, the label step to about 2
    CPU-hours, and running the engine twice becomes cheap;
  - the lines that answer a question the owner has: TEN, BROAD, DAY, DELAY0, +5 and +15 minutes, SIDES, MONTHS,
    RANK. Not SPEED; not the calibration against books (`asset_ctxs` covers every coin).
- **What that version gives up:** the rounds' power. A filter that keeps 2% of the copies needs every account.
  So: **every account if the owner keeps the rounds** (the plan's recommendation, and mine); the 1/8 slice if
  the owner picks design A.

### 2.8 The PC

- **Sound as planned:** parts that resume; the manifest written last; the store built twice and held equal;
  one heavy run at a time, at idle, outside the closed windows; independent code before the owner reads a
  verdict; the frozen list checked at every step; "a run that crashes before its result exists is not a look".
- **Not yet covered:**
  - the engine's own run (labels, entries, prices, d) is not doubled, and the Final review's scope is not
    named (M4's fix);
  - the look's own step must also run in parts of 15 minutes. d needs each week's removal table across every
    bucket, so step 1 is two passes. The plan should say that its parts hold prices on disk before
    `result.json` exists, and that nothing reads them;
  - the funding fetch is hours of network, light on the PC, and resumable by its manifest (L6).
- The memory test and the RAM setting stay the owner's.

### 2.9 The plan's ten questions

| # | The plan's question and recommendation | My view |
|---|---|---|
| 1 | A, B or the hybrid: the hybrid | **Agree**, with H1 and H2 fixed. Its MAIN line keeps A's power. Say on the first page that the rounds will most likely confirm nothing |
| 2 | The funding fetch: yes | **Agree.** Funding is about 3 bps a day for a long at the base rate, material against ±10. It is 3.7–8 hours, in sessions (L6) |
| 3 | Where would you act, and the bar: δ +10, the break-even printed | **Agree with δ +10** (the paper's own line). By hand, the places are Hyperliquid itself, Binance futures, or the one funded-trading firm whose terms permit it, at Hyperliquid's prices (decisions 2026-11-25, PROP-FIRM-FACTS). The worth is M8's table. The talk is still owed before the freeze |
| 4 | The pool: every main-dex account | **Agree** if the rounds stay; a 1/8 slice is enough for design A (2.7) |
| 5 | The rounds' caps | **Agree with the caps**; fix M5's four points and use H1's bounds at each stage |
| 6 | The label's 90-day bound | **Agree**, with the check moved to Mondays where it binds and a pass mark fixed first (M3) |
| 7 | KEEP's two added sign conditions | **Agree.** Add H1's bound, and M6's condition |
| 8 | Runs under 15 minutes until the PC is cleared | **Agree**; add the engine's guard (M4) |
| 9 | FRESH-2's length in step 2's report | **Change:** fix it now at 26 weeks (L1) |
| 10 | The lines beside | **Agree**, without SPEED and with DELAY0 at the end of the trader's minute (M7) |

## 3. The coordinator's two inputs

**HL-FOLLOW-FACTS (`19bb0d7`).**

- **The fee:** 4.5 bps a leg is confirmed. No change.
- **Funding:** hourly, capped at 0.5% an hour. The fetch takes 3.7–8 hours at half budget, not minutes (L6).
- **The delay:** R8's 62–95 s "fits a manual follower". No change to the deciding line.
- **Its SPEED proposal** (D in [10 s, 30 s) at the first taker trade): see below.

**The probe (external-apis, `6d4b99d`).**

- **Does it change the deciding delay? No.** The tool could see any account's trade in under a second, so
  detection is not what limits a follower. The owner acts by hand. R8's delay is 60 seconds to act, up to 33
  seconds of polling and about 2 of lags (the kit's `delayOf`); the probe shows the polling part is caution,
  not need. It is frozen with MAIN and stays.
- **A faster SPEED line beside? Not in COPY-H. Recommended: no.**
  - A minute's price cannot tell 0 seconds from 30: both mostly fall in the same minute. SPEED needs the first
    trade after t + D for the entry and for every exit. That is a second price source with its own store, tests
    and review, for a line that decides nothing.
  - A follower who is faster than a hand is an automatic one, and this project never trades (Iron Rule 1).
  - The slope is still seen: DELAY0 at the end of the trader's own minute (about 30 seconds on average), MAIN,
    and +5 and +15 minutes. On Polymarket the delay cost nothing measurable (X3; FIND-6-EXITS).
  - If the owner wants it now: one more session and a coin-and-time index of the tape, and its price rule
    written into C9 before the freeze.
- **The funding fetch's size:** it stands, slightly smaller: 235 coins, not 240; 26 windows of 500 hours cover
  the 540 days; about 6,100–6,600 reads. The 56 delisted coins need their windows too, for copies made before
  they were delisted.
- **One use of `meta`:** it is the coin list C3 and C6 need (L2).
- **For v1, if there is a yes:** the trades feed shows every account at once, so the watcher would not be
  bound by 10 accounts. The owner's hand is the limit (M8).

## 4. My questions, each with a recommendation

1. **H1's fix changes what KEEP and DROP mean: each needs both readings to agree.** Rule it before the rules
   are drafted? **Recommended: yes, as written in H1.** It is the paper experiment's own two readings, with the
   second given a bar. MAIN, who is copied and how, does not change.
2. **A DROP at look 1 and the rounds** (H2): (a) the rounds still run, or (b) the test ends? **Recommended:
   (a).** The rounds are your ask, their error is spent apart, and only unseen months judge them. Expect no
   confirmed filter.
3. **The stop rule's words:** "after COPY-H's one look" becomes "after COPY-H's step 2"? **Recommended: yes,**
   if the hybrid is chosen.
4. **SPEED:** leave it out? **Recommended: yes** (section 3).
5. **The rehearsal keeps no priced file before the freeze** (M9)? **Recommended: yes,** a hash only.
6. **The tripwire's counts on all of E before the freeze** (M2), and the hold and lean counts with them (H1,
   7)? **Recommended: yes.** They are counts, they size two risks while a rule can still be mended, and they
   time the engine on real data.
7. **The planner's slice rows** (2.3): delete them, or list them under the seal? **Recommended: delete;** the
   raw stores hold everything again.
8. **Who writes the fixes in:** the planner, as a marked revision of the plan, or the builder, straight into
   the rules draft? **Recommended:** a decisions entry with the owner's rulings on H1 and H2 first; then the
   builder writes them into `copyh/rules.md`, which gets its own fresh rules review before the freeze (part 5).

## 5. What I read, and what I did not

- **In full:** my brief; CLAUDE.md; current-task; code-rules; the plan; FABLE-REVIEW; WORKFLOW.md (the file
  came whole; its standing rules are what I used); decisions' eleven entries of 2026-11-25 as of 16:18Z (four
  were added while I worked); `apps/poller/experiment/rules.md`; APPROACH-REVIEW; the kit's `entries`, `fills`,
  `labels`, `returns`, `panel`, `nulls`, `costs`, `cells` and `stats` modules, lib-exits and classifier v1 with
  its parameters; the planner's scripts and outputs (section 2.3); external-apis' AWS and Hyperliquid sections.
- **In part:** decisions' paper-experiment entries of 2026-11-12 (the freeze, the plan's approval,
  APPROACH-REVIEW accepted, the way forward, FIND-6-EXITS and FIND-6); PAPER-PLAN (its owner's page; searched
  for how it treats direction and independence) and its review (its headings and the same search); FIND-6 and
  FIND-6-EXITS (their owner's pages and rules); look 1's report (sections 1–3 and 5–9); HL-FOLLOW-FACTS
  (sections 0, 1, 2.4, 2.5, 3, 4.3, 5–7); WAVE-H's and the exam's rules, only for how they treat the
  backstop's trades.
- **Not opened:** any data; HANDOVER, `sessions\`, `drafts\`, `verify\`, LESSONS.md and every other worker's
  folder but COPY-H-PLAN's two.
- **What this limits.** H1's mechanism is certain; its size is a model on two counts of one week (between
  1.15 and about 4 times), and its fix 7 measures it. I could not measure the edge over the market's error, the
  thin-leg share, the funding-hour gaps or the kit's cost on the heaviest accounts: the first is known only at
  the look, the others are counts the rehearsal can make. I did not check the planner's counts against data.

## 6. My arithmetic

Four scripts in my scratchpad (`…\scratchpad\COPY-H-PLAN-REVIEW\`), each copied whole into my `progress.md`
with its output. None reads data.

| Script → output | What | SHA-256 |
|---|---|---|
| `r1-power.mjs` → `r1-power.out` (13:39Z) | A, B: the plan's table recomputed (Φ from a Simpson table of the density; the two looks by integration). C: the day error at 91, 125, 150, 182 and 300, days independent. E, F: C12 as written and with the fix, on a grid of read errors and of real ÷ read. G: a slice's SE; the label step's total. H: a hand follower's week. **Its sections D, I and J are replaced by r3** | `a39a47fa…7478` → `81b1fcb6…6f5b` |
| `r3-cohort.mjs` → `r3-cohort.out` (16:20Z) | the cohort model in continuous time; the central case's two tables | `f4d7282e…6463` → `c0719cab…128b` |
| `r2-sim.mjs` → `r2-sim.out` (13:49Z) | made-up worlds at 100 copies a day, 400 worlds: three hold models and the control with no lean | `d5dc4479…6343` → `133089cb…f219` |
| `r2b-sim.mjs` → `r2b-tail30.out`, `r2b-fixed.out` (16:16Z) | the same at 5,595 copies a day, 300 worlds | `b76526bd…178c` → `ed85d5fe…8625`, `3430fada…b059` |

- **The cohort model** (r3). A cohort is one entry day's copies, entered at a uniform instant. e(t) is the
  share of the cohort open at time t; H is the mean hold. With a steady lean b and a market whose daily move
  has SD σ, independent in time, an error clustered by entry day reads b·σ·√(∫e(t)² dt ÷ N), and the mean
  really moves by b·σ·H ÷ √N. Holds: survival (1 + x ÷ a)^(−α), with a the planner's 17.5 h and α fitted to its
  21.2% without an exit by the week's end, cut at 7, 14, 30 or 90 days; and, as a thin tail, exponential holds
  with the mean (1.5 days) that gives the same 21.2%. The lean: (806 − 418) ÷ 1,224.
- **A slip of mine, found by the simulation and mended.** r1's section D squared each day's average exposure,
  which reads a cohort's own spread too small for short holds: it gave 1.36 for the no-tail case, where r3 and
  the made-up worlds give 1.15 and 1.13. For the long-hold cases the difference is small (3.32 against 3.19).
  Every number in this review is r3's.
- **The made-up worlds** hold what the model assumes and nothing else, so they check the arithmetic, not the
  assumptions: the formula's 3.19 against 3.21 simulated; 1.15 against 1.13; 1.01 with no lean.
- **X3's two stretches:** 80.3 ÷ √(11.0² + 24.2²) = 3.02.
- **The fix's chances:** money ~ N(e, real²) with the bounds at the read error; the edge over the market
  ~ N(e, SE′²), drawn apart; DROP and KEEP as H1 writes them; one look, z 2.43; the copies' mean cost taken
  as 12.5 bps.

**What is assumed, plainly:** market moves independent in time; one lean for every cohort; a copy's result taken
as its side times the market's move while it is open, plus its own noise; the hold curve read from two counts of
one week. None of it is measured on outcomes, and none could be before the plan is approved.
