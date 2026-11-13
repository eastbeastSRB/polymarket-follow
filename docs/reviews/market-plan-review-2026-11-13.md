# MARKET-PLAN-REVIEW — the fresh review of MARKET-1's plan, before the owner approves it

MARKET-PLAN-REVIEW (Sonnet 5.5, max, a different model from the plan's),
2026-11-13 04:17Z – 05:02Z (UTC; every stamp from `date -u`), for
polymarket-follow's supervisor. The plan under review is
`docs/reviews/market-plan-2026-11-13.md` (`86ef4da`), written against decisions
2026-11-13, "the market lead" and "MARKET-1 to be planned". Evidence: the
supervisor folder `workers/MARKET-PLAN-REVIEW/` (`progress.md`, `scripts/`,
`out/`; paths below are relative to it; "S1" and the like name its scripts).
**A review decides nothing:** the supervisor and the owner answer; the plan was
not edited.

**The blind store held.** Nothing stamped at or after 2026-11-07T00:00:00Z was
read. Never opened: the collector's recordings, its database, the run folder,
and the paper experiment's data after the cut (`fills`, `raw`, `state.json`,
`page`, `panel`); no count was taken from them. Read for checks, all before the
cut: the seed (`F:\polymarket-follow\paper\seed\`, 1,602 files, no row at or
after the cut), the kit's panel and its `derived\pool-weeks.jsonl.gz`
(`F:\polymarket-follow-research\KIT\`). From MARKET-PLAN's folder (read only) I
read its brief, progress, `scripts\` and `out\`, and, to compare the plan's
words with MARKET-FIND's code, `inputs\market-find-explore\` (`lib.mjs`, `a12`,
`a13`, their outputs); not its transcript. The repository was read only. No call
to Polymarket's API, no web search, no agent started, polymarket-lab not
touched, nothing in the repository changed but this file. The only thing I ran
beyond reading and counting was two small Node processes in my scratchpad to
test a Windows file rename (F2).

## For the owner, in one page

*Words.* A **bp** is 0.01%. A **wave** is at least two different tracked
accounts liquidated the same way in small coins within an hour; MARKET-1's
**paper position** is $1,000 against the forced side. **Drift** is a market's
own steady rise or fall, which pays or costs any holder whatever else is true.
The **sweep** is the paper experiment's Monday read of the rest of the pool. The
**freeze** locks the rules by a fingerprint before anyone reads the weeks after
the cut.

**Verdict: the plan may be approved after the fixes named below.** It is a good
plan. It does what you and the supervisor ruled on 2026-11-13, its rules are
nearly exact enough to freeze, and what I could re-check came out equal:
- I rebuilt the wave rule from the plan's own words, with my own code, on the
  old weeks and got MARKET-FIND's numbers exactly: 153 entries on 47 days in 30
  coins, 114 forced sells and 39 forced buys. The count does not move with the
  corner cases the old weeks can tell apart (S1).
- The plan's table of what the three looks can show comes out the same from my
  own simulation (S7): for a true +300 a position, "keep" 68% already in
  December; for nothing, a false "keep" 2 times in 100.
- The 38 coins equal the rule book's crypto markets but BTC, ETH and PRL,
  symbol for symbol (S6). The paper experiment's freeze still verifies, 61 of
  61 files, list hash `d04d3cd8…f31c` (S0).

Nothing needs a redesign. What is wrong sits in sentences the rules do not yet
say, and in checks the build does not yet have.

**What must change first** (details under "Findings"):
1. **KEEP must not be able to come from a market that simply rose** (F1, the one
   high finding, and your question above all: answer below).
2. **MARKET-1 must keep out of the paper experiment's way** (F2). I tested on
   this PC: while one program has a file open, another cannot replace it by the
   temporary-file rename the paper experiment uses; the replacing program's
   write fails. MARKET-1 will read the paper experiment's files, and a failed
   write stops the paper experiment's run. MARKET-1 must first check that no
   paper run is live.
3. **A recording gap written down the next day must not slip through** (F3):
   every price waits one more day.
4. **The page must say what it sees** (F4). Until the Monday sweep it sees
   about a seventh of a week's waves (22 of the 153 old entries); the plan's
   first page says it "finds every moment a wave was on".
5. **No verdict from a handful of days** (F5); **fills that a thin book could
   not fill are not "priced at the book"** (F6); **say plainly what the
   reproduction does not prove, and add a bridge** (F7).

**Your question above all: should KEEP rest on the money alone?** *No — add one
condition, not two.* About three quarters of a wave's move back is the whole
small-coin market's, and three quarters of the entries are long, so a long rise
could add to the money without any wave effect. Drift alone cannot create a KEEP
from nothing (it would need a rise of more than 1.8% a day at the last look, 5%
a day at the first), but it can add up to about +50 bps to a real but small
effect (the old September's pace, +112 bps a day, would add about +56). So KEEP
should also need the same positions' result, minus what those coins did on
average at the same hours (the plan's BASE), to be above zero, as the paper
experiment's KEEP needs its "d" above zero. It costs nothing on the old weeks
(+309.7 raw, +311.3 minus the baseline). I would **not** make KEEP need the coin
to beat the other small coins: on the old weeks that "own part" was only +74.9 ±
48.7 (about 1.5 errors), because the market's rebound after a wave is the lead
itself, not drift; such a KEEP would be a different, much harder test. Print it
beside, deciding nothing.

**What the verdict needs, in plain numbers.** KEEP needs the mean net result per
position above **+258 bps** at the first look, **+147** at the second and **+91**
at the third (the error times 2.81, 2.43, 2.17). DROP at +50 needs the mean to
be below **−208, −97, −41**: "drop" means a measured loss, and a dead lead is
dropped only 18 times in 100 (my S7 agrees with the plan's table). If the true
result is much smaller than on the old weeks, the likeliest answer is "too few
to tell", with a number.

**The burst** (your rule of 30 tokens in 5 s for all callers, decisions
2026-11-07). MARKET-1 needs none of it. For later readers, raising it to 40
costs no tokens (the 250 a minute stays): the collector's 15 and the paper
experiment's frozen 15 stay, a new reader would get 10 (one fills page at a time),
and the test that sums the callers' literal limits moves from 30 to 40. Our own
traffic would stay at 8 tokens a second at most,
against a measured bucket of about 90–100 tokens that refills about 16.5 a second
(the one accidental 429 came at 27 a second). The one unknown is the bucket's
sharing with your browser on polymarket.com/perps. I would not raise it for
MARKET-1 and would raise it only when a reader needs it.

**Yours to decide** (full list at the end, each with my recommendation): F1's
extra condition (yes); the minimum of days for a verdict (20); whether the
heaviest "beside" lines (TAPE, the random-day draws, the baskets) may wait for
their own arm so they never delay the freeze (yes); the rest as the plan asks. I
agree with ten of its twelve recommendations, differ on Q4 (F1), and Q12 is not
MARKET-1's need.

---

## Verdict

**MAY BE APPROVED AFTER THE FIXES NAMED:** F1 (high) and F2 to F7 (medium) are
additions to the rules text (`rules.md`, built from section 1 at part 6) and to
the build's parts and checks; F8 to F19 are low. None changes the design, the
data source, the deciding line, the statistic's form or the budget. The plan is
dated evidence and is not edited: the fixes travel in the owner's yes (a
decisions entry), into the build brief and into `rules.md`.

## Findings by severity

| F | Sev. | Where in the plan | Finding | Fix |
|---|---|---|---|---|
| F1 | **high** | M11, Q4, section 7 "falling and rising market" | KEEP rests on the money alone: 75% of the old entries are long, three quarters of a wave's move is the market's; a rising market can add to the mean with no wave effect | KEEP also needs the matched-baseline reading above zero (the paper's "d" pattern); no basket-adjusted condition; print the coin's own part |
| F2 | med. | M2, M15, section 5 "How it runs" | A read of a file the paper experiment replaces by rename can make its write fail (EPERM, tested here) and stop its run; its heartbeat timer has no catch; the 10:30Z run can meet a Monday sweep that ends as late as 12:08Z | Check the paper's lock and heartbeat age first and wait; read whole and short; no paper command during a run; MARKET-1's own writes tolerate a failed rename |
| F3 | med. | M7 "live", "pending" | Which `coverage.jsonl` files are read is unsaid; a crash gap recorded in the next day's file (`process_start.lastHeartbeatAt`) is missed except in the day's last hour | Every leg waits for the day after its own to be closed; read the coverage of both days |
| F4 | med. | Page one, M14, section 7 | Within a week only the week's list accounts are read: 22 of 153 old entries visible; the first page says the program "finds every moment a wave was on" | Page headline on complete weeks only, this week apart and labelled; correct page one |
| F5 | med. | M10, M11 | A verdict can come from a few days: only "fewer than two days or two markets" is TOO FEW; the paper's own band needs 20 days | At least 20 UTC days and 10 markets with a priced position, else TOO FEW TO TELL |
| F6 | med. | M7 "walk", M11 | "Depth short" legs are priced at the last level (an optimistic price) and do not count toward WITHHELD | Count them with the mark-priced legs; print the share |
| F7 | med. | Section 5 part 4, section 6 | The reproduction proves the rules' arithmetic on marks, not the forward readers (book walk, gaps, the paper's store with P and holes, pending); no real book can be read before the freeze | Say so; add a bridge rehearsal through the forward readers; format counts and a stop rule at the first real run |
| F8 | low | M0, section 5 "Reused" | The freeze lists all 22 files of `dist/paper/`; a paper fix to a page or look file stops MARKET-1 (exit 4) at its busiest day | List what it imports and what writes what it reads (11 files), say who re-freezes and when |
| F9 | low | M9 | The fee source is silent about categories the collector's schedule lacks (crypto is one): `bookTaker` returns null and the kit's 4 bps prices every leg; the number is right, the rule does not say it | One sentence and an alarm decision |
| F10 | low | M12 BASE | The ratio reads "j − 1", MARKET-FIND's code reads j; the sign for a short is unsaid; no rule for a cell without minutes | Align text and code; BASE signed by the position |
| F11 | low | M15 look | "Every UTC day before END_k is closed": the leg at END_k − 1 min needs END_k's own day | "through END_k's day, and the day after" |
| F12 | low | Section 5 `reproduce` | A frozen command that needs a research-folder path (R8's tape) the run copy has no setting for | A script and a test, not a frozen command |
| F13 | low | M4 order, section 5 "Reused", T | "trade_id as a number" loses digits above 2^53; the paper's reviver keys are `trade_id`, not the tape's `tid`; reading `rejected-HH` is more code than a 1% sample needs | BigInt; own reviver; count refused frames instead |
| F14 | low | M12 | Many beside lines freeze with the program; the heaviest (T: about 350 positions a day) decide nothing | Tiers: WAVE with B1–B6, B11, P, BASE first; the rest as their own arm |
| F15 | low | M3 "tradable" | If one recorded instruments list ever lacked a coin, it would be left out for good; nothing prints which coins are out | Print the coins left out and from when |
| F16 | low | Section 5 backup | The paper's `backupPaper` has a fixed list without `books\`; reuse would not copy MARKET-1's decisive inputs | Own list; say it is a copy of ~25 lines |
| F17 | low | M12, section 7, section 2, page one | Beside lines' `t ≥ START` unsaid; "fills in markets listed later counted" ambiguous; "24:00Z"; "files only" (the rule book is the database) | Wording |
| F18 | low | M7, M14 | No alarm for a day of failing book lines; no weekly count of the pool's liquidation fills on the page (a silent change of the exchange's flag would look like "no waves") | An alarm at 1% as the paper's; a weekly count |
| F19 | low | Section 7 | The recordings' disk through May 2027 is a dependency (about 0.4–0.6 GB a day, the collector's own plan; its guard stops book lines at 10 GiB free) | A question to the supervisor |

### F1 (high) KEEP on the money alone can let a market's drift pass

Where: M11 "KEEP when m − z·SE > 0"; section 8 Q4 ("a baseline condition would
almost never bind"); section 7 "The falling and rising market".

Finding. The position fades the forced side, so it is long after a forced sell
and short after a forced buy. On the old weeks 114 of 153 entries are long (75%,
S2), a net long exposure of 0.5. A market that rises for months pays that
exposure; the money's mean rises with it, and nothing in the verdict can tell. I
measured how much this could be on the weeks we have (S2, exploring, pre-cut):
- the signed matched baseline of the 153 entries is **−1.6 bps** overall
  (September −0.8, October −8.6, November +14.8; the 114 long +10.6, the 39
  short −37.3), so on these weeks the condition below would have changed
  nothing: raw +309.7, minus the baseline +311.3 ± 68.7 (MARKET-FIND A12);
- the small coins' own mean 24 h move from every quarter-hour was +112 bps in
  September, −62 in October, −108 in November (the market rose, then fell), and
  the baseline is a period mean, so it nets out in a mixed period and removes the
  whole drift only in a period that is one rise or one fall;
- the size: a drift of μ bps a day moves the mean by about 0.5·μ. KEEP needs
  m > 258 / 147 / 91 bps at the three looks, so drift alone would need μ above
  516 / 294 / 182 bps a day (5.2%, 2.9%, 1.8% a day): it cannot make a KEEP from
  nothing. It can lift a real but small effect over the line: at the old
  September's pace the lift is about +56.
So the plan's reason ("the trend works against the position; a baseline
condition would almost never bind") is right for the old weeks, and is also the
reason to add the condition: where it does not bind it costs nothing, and where
it binds it is exactly the case the owner asked about.

A reading that removes the *other small coins* is a different thing and should
not be a KEEP condition: on the old weeks the coin's move minus the other small
coins' at the 153 entries was +74.9 ± 48.7 (t 1.5), and for all liquidations a
regression against the basket gave +3.3 ± 24.5 (MARKET-FIND 1.2 and 1.3): the
wave's lead *is* the market's rebound (the basket after a 4-hour move of 400 bps
or more: +247.2 ± 69.1 with a wave, +36.6 ± 74.2 without, A14). Requiring the
coin to beat the basket would ask a different question and, at the old size,
would be confirmed, if at all, only at the third look (my arithmetic: the own
part's error at 177 days is about 30). The basket moves are already B7–B9; add
the coin's own part as a printed fourth reading.

Fix.
- M11: **KEEP** when m − z·SE > 0 **and the mean, over the set's priced
  positions, of (the gross on marks − dir × BASE) is above 0** (a point
  condition, as the paper experiment's "mean d above 0"). Positions without a
  BASE cell are left out of that mean and counted. DROP is unchanged and money
  only (a position that loses is dropped whatever the cause); the excess is
  printed beside it.
- M13 prints for WAVE: the excess's mean, its two-way error and its lower bound
  (m_ex − z·SE_ex), and "the coin's own part" (gross on marks minus the mean of
  the other small coins' move over the same instants; MARKET-FIND's `own`),
  deciding nothing.
- Reproduction targets: the excess +311.3 ± 68.7, the own part +74.9 ± 48.7
  (`a12-wave-accounts` output).
- Tell the owner in the look report that BASE removes a period's average drift,
  not a regime inside it: S (by month and by the 7-day basket move) stays
  beside, and B9's two cells are the control for "the market after a drop".

### F2 (medium) Reading the paper experiment's files can stop its run

Where: M2 ("state first, then each account's file"), M15, section 5 "How it
runs" (10:30Z, "after the paper experiment's Monday sweep").

Finding. The plan reads in the right order for a consistent view (I checked
`loop.ts`: an account's rows are written, then `P` moves and `state.json` is
saved, so a reader that takes the state first and counts rows below that `P`
never sees a row without its `P`). It does not consider that on Windows the
*writer* can fail. Every paper file is written to a temporary name and renamed
over the old one (`writeAtomic`). On this PC, Node v24.13.0 (S5, S5b):
- process A opens `state.json` and holds it; process B writes `state.json.tmp`
  and renames it over: **EPERM**;
- A reads a 1 MB file in a loop for 6 s while B rewrites it 1,500 times the same
  way: **1,316–1,325 of 1,500 renames failed with EPERM (two runs); none of about
  10,800 reads failed**.
The paper experiment saves `state.json` after every account (a thousand times in
a Monday sweep) and rewrites `paper-heartbeat.json` every 10 s through the same
`writeAtomic`, with no catch around it (`run.ts` `beat()`; the collector's
`startHeartbeat` has one); a failure reaches `paper.ts`'s `uncaughtException` or
`unhandledRejection` handler and exits 1. The run continues from its saved `P`
the next day, so the loss is a day's reading, not data; but it is the frozen
program, and MARKET-1 would be the first reader of its files. One run's chance
is small (a read holds a file for milliseconds; my estimate is well under 1% for
a run that overlaps a sweep); the fix is cheap. The Monday worst case (8.1 h,
ends 12:08Z: paper-plan-review's budget table) meets a 10:30Z run; a normal
Monday ends 09:18Z.

Fix. Before it opens any file of the paper's store, MARKET-1 reads
`STATE_DIR\paper.lock` and the heartbeat's age with the paper's own rule
(`lockHeld`, `lock.ts`, with the paper's file names) and, while a paper run is
live, waits (a check a minute, up to a stated limit well inside its 12 hours)
and then exits 5; it reads the paper's files whole and quickly, holding no
handle while it computes; a note in the run's procedure (supervisor and owner):
no paper `daily`, `look` or `reparse` while MARKET-1 runs; MARKET-1's own
heartbeat and page writes catch a failed rename and retry, as the collector's
heartbeat does, not as the paper's. Part 5's end-to-end test adds the two-process
case (`s5b-rename-race.mjs` is the shape).

### F3 (medium) A gap written down the next day can be missed

Where: M7 "Live at x", "A gap … from `coverage.jsonl`", "Pending".

Finding. `Recorder.coverage()` writes each event into the folder of the day it
is *written* (`utcDate(now)`), so an event that describes a gap in day D can sit
in D+1's file: a crash's `process_start` carries `lastHeartbeatAt`; a
`market_stall` is written 15 s after the last frame; a `ws_resumed` closes a gap
that began the evening before. The plan says a leg waits for the next day's
folder only "in a day's last hour", and does not say which coverage files it
reads. Example: the collector dies at 22:40 on day D (no `process_stop`: a
crash) and restarts at 00:10 on D+1. A leg at 22:50 on D has its three hour
files (21, 22, 23) in D; hour 23 is missing, which the plan catches for hour 23
only; the last book line is 11 minutes old, so rule (1) calls it live; the only
record of the gap is in D+1's coverage. The leg is priced from a stale book and
flagged live. Rare, but it is exactly a power cut or a restart across midnight,
and `rules.md` must say it before it is frozen.

Fix. A leg is priced only when the UTC day after its own day is closed; the gaps
are read from the coverage files of both days (the book files stay the three
hours around x). The last closed day is then two days behind the run date; the
page says so. Part 2's tests add: a crash at 22:40 restarted after midnight, a
stall written after midnight, a gap that ends in the next day's file.

### F4 (medium) Within a week the page sees a seventh of the waves

Where: page one ("finds every moment a wave was on"), M14, section 7 "Entries
move as the reads complete".

Finding. The paper experiment reads only each week's list daily (the accounts
labelled directional and covered at the Monday, those with an open copy, the
favourites) and sweeps the rest of the pool after the week is over (`loop.ts`).
On the old weeks, using the plan's own list model (c1: the kit's labels), only
**216 of the 727 counted liquidation fills (30%) come from accounts on their
week's list**, 66 of the 153 liquidated accounts were ever on a list in a week
they were liquidated, and **22 of the 153 wave entries are visible from list
accounts alone** (25 entries appear, 22 of them the same; S3; by week 1 to 5 of
3 to 27). So until the Monday sweep the page shows about a seventh of that week's
positions, selected by the list rule, and the running mean and band mix a partial
week into complete ones. The plan knows entries "move or vanish" (section 7), but
not that the usual in-week picture is a seventh, and its first page says the
opposite. The deciding set is not affected (a look waits for every `P`).

Fix. The page's WAVE headline (positions, running mean and band) uses only
positions before the latest Monday at which every pool account's `P` had reached
that Monday (the look's own readiness test); the current week's positions show
apart, labelled "partial: the rest of the pool is read on Monday". Page one says
"finds the waves in the accounts the paper experiment has read: a seventh of a
week's until its Monday sweep".

### F5 (medium) No minimum number of days and markets for a verdict

Where: M10 ("SE cannot be computed (fewer than two days or two markets)"), M11.

Finding. KEEP and DROP use normal limits (2.81 at the first look) on a
cluster-robust error. With 37 days of entries, about 26 of them wave days
(MARKET-FIND: 47 of 68 days) and perhaps 20 markets, the error is already biased
low (MARKET-FIND: random days spread 1.1 times the clustered error); with 8 or 12
days in a calm market it would be unreliable, and "two days" is all the plan
asks. The paper experiment's own page shows no band for a trader under 20 days
(R15), a precedent.

Fix. M11: a verdict other than TOO FEW TO TELL needs at least 20 UTC days and 10
markets with a priced position; fewer is TOO FEW TO TELL. At the old rate the
first look expects about 26 days.

### F6 (medium) "Depth short" is priced optimistically and not counted

Where: M7 "What the 20 levels cannot fill is filled at the last level's price,
flagged 'depth short'"; M11 WITHHELD.

Finding. A leg that the recorded 20 levels cannot fill at $1,000 is filled as if
the book went on at its last price: a cost lower than any real order would have
paid, in exactly the thin coins at the wave's busiest moment. The collector's own
measure says the thinner side covered $1,000 in all 90 markets and $10,000 in 89
(one 300-second capture at 00:54Z on 2026-11-10); nothing measures it at a wave.
Such legs are neither mark-priced nor unpriced, so the 10% limit does not see
them.

Fix. Count a depth-short position with the "not priced at the book" share for
WITHHELD; print the share and the means with and without them (the plan already
prints "depth short").

### F7 (medium) The reproduction proves less than the plan lets one think

Where: section 5 part 4, "The reproduction's targets"; section 7.

Finding. Part 4 is a strong check of the rules' arithmetic with independent
code: the wave entries, the episodes, the lines beside and the statistic on
marks, against MARKET-FIND (I reproduced the entries myself, S1). What it does
not touch, and what will run after the cut:
- the book walk, the live rule and the gap rules (the old weeks have no books);
- the paper experiment's store with `P`, holes and the cap (the reproduction
  reads the seed; the "138" target is a model of the reader, not the reader);
- TAPE on the collector's files (the reproduction reads R8's captured trades,
  all of them, busy hours only, not the 1% sample);
- pending and repricing from MARKET-1's own record, the fee path through the
  collector's schedule, the real size of a day.
No real book can be read before the freeze (sealed); the plan says "plan from the
documented formats", and its part 2 tests with the collector's own `Recorder` and
`BookSampler`, which is the right way, on small synthetic days.

Fix. (a) Say in section 5 and in the look report what the reproduction proves and
what first meets real data at the first run. (b) Add a bridge rehearsal at part
4, before the freeze: the old weeks through the *forward* readers — the seed
written as a `PaperStore` with `P` at the cut, the kit's minute marks turned into
recordings through the collector's `Recorder` and `BookSampler` (a book at mark ×
(1 ± c), deep enough, at least around WAVE's 153 entries) — which must
reproduce the pure reproduction's net to 1e-9 with the same entries; it is the
only way to test the forward path on real-shaped data at scale, and the place a
day's run time is measured. (c) Part 7's first real run prints format counts
first (hour files found and missing, lines parsed and failed, days closed) and
stops if more than 1% of a day's book lines fail (the paper's schema-alarm
pattern); a fix, if any, is a recorded defect fix.

### F8 (low) The freeze lists more of the paper experiment than MARKET-1 uses

Where: M0 ("every file of `dist/market1/` and of `dist/paper/`"), section 5
"Reused".

Finding. `dist/paper/` has 22 files; MARKET-1 imports eight (`instants`, `store`,
`routes`, `rulebook`, `market`, `research`, `seed`, `stats`) and depends on the
meaning of what three more write (`loop`, `reader`, `reparse`: `P`, holes, the
rows). A defect fix to `daily`, `look`, `page`, `summary`, `score`, `account`,
`copy`, `backup`, `run`, `gate` or `coverage` is a new paper freeze and, as the
plan has it, stops MARKET-1 (exit 4) until a decisions entry re-freezes it. The
paper's first look is on Monday 2026-12-21 and untested on real data: a fix there
lands on MARKET-1's own first-look week. Each run recomputes from the cut, so a
stop costs delay, not data.

Fix. List the eleven files (eight imported, three writers) plus `dist/market1.js`,
`dist/market1/`, `research/` and `market1/`; say who writes the re-freeze entry
and that a paper fix outside the eleven needs none.

### F9 (low) What the fee source does (the paper page's alarm)

Where: M9 "Fee on each leg: … `bookTaker` on the collector's rule book; before its
first record the kit's `feeAt`".

Finding. The brief's question. The kit's copy of the fee schedule (read
2026-11-10) has one perpetual row, category "equity"; the paper's alarm says the
collector's recorded schedule lacks crypto, commodity and index, which is the
same shape. So `bookTaker` returns null for every coin of M3 (crypto) and, as the
paper experiment does, `kit.costs.feeAt('taker')` — the kit's 4 bps — prices
every leg, and the paper's alarm would say so on MARKET-1's page, permanently.
The number is right: in the seed (S4) the highest taker rate paid on 314,512
crypto taker fills before the cut is 4.00 bps, and 4.00 bps in every other
category too (lower tiers appear below it; liquidation fills carry about 52–54
bps, the liquidated account's own fee, not relevant to a taker entered two
minutes later). The rule does not say it, and a permanent alarm hides a real one.

Fix. M9: "when the recorded schedule has no row for a market's category the leg's
fee is the kit's base-tier taker rate (4 bps); that is the case for every coin of
M3 today (S4); each run's log lists the categories of the latest schedule; the
page raises the alarm only if a later schedule *changes* the rate the legs use,
and the verdict is never withheld for it". Do not copy the paper's alarm as it
is.

### F10 (low) BASE: index, sign, empty cell

M12 BASE reads "(the minute mark of j + 1,440 ÷ that of j − 1)"; MARKET-FIND's
`buildBaseline` is `M[i + 1440] / M[i]`. The signed use ("minus BASE") is unsaid
for a short (dir × BASE). A cell with no minute: the position is left out and
counted. Fix: write the code's formula; "the gross minus dir × BASE"; the rule for
an empty cell (F1 needs it).

### F11 (low) A look's readiness is one day short

M15 asks that "every UTC day of the recordings before END_k is closed". A leg at
END_k − 1 min needs the hour after, in END_k's own day, and (F3) the day after
that for the coverage. Fix: closed through END_k's day and the day after.

### F12 (low) `reproduce` as a frozen command

Section 5 gives the program a third command, `reproduce`, which reads R8's
captured tape from `F:\polymarket-follow-research\`, a path the run copy has no
setting for (the settings list stops at seven), and adds frozen surface. The paper
experiment keeps its reproduction in a script and tests. Fix: a script under
`scripts/` (type-checked, tested, never built, as `scripts/paper-seed.ts`) and
the bridge rehearsal (F7) as a test.

### F13 (low) Ids and the tape

M4 orders by "trade_id as a number": ids above 2^53 − 1 exist and the stored ids
are digit strings; use BigInt. Section 5 says TAPE reads `tid` "by the same
`context.source` reviver": the paper's `keepIdDigits` keys are `trade_id` and
`order_id`, so the tape needs its own reviver for `tid`. T's 1% sample of ids
ending in 00 makes a refused frame (an id above 2^53, known so far only from one
account's liquidation fills of 2026-05-07/08) a rare event: reading `rejected-HH`
(two tabs a line, the reason first) is more code than that needs; count the
refused trades frames on the page and leave them out.

### F14 (low) The beside lines are a large frozen surface

M12 has B1–B11, J, T, X, P, C, S, R and BASE beside the one that decides. Each is
frozen code, and a bug in any is a "code defect" procedure; T alone is about 350
positions a day, two book walks each. The decisions ruled J, T and X beside; Q10
already offers TAPE, B8, B9 and R as a later arm. I would offer more: **first
freeze** WAVE with B1–B6 (the same entries), B11, P and BASE; **second arm** J, T,
X, B7–B10, S, C, R. If the owner keeps the ruling that all stay, nothing breaks;
the build is longer.

### F15 (low) Tradable

M3 uses the paper's `leftOutFrom`, which never forgives: if one recorded
instruments list ever lacked a coin (a partial reply, a glitch), that coin would
be left out from that UTC day on, silently. Fix: print, on the page and at a look,
each coin left out, from which day and by which record.

### F16 (low) The backup

`backupPaper` copies a fixed list (`state.json`, `log`, `manifest`, `looks`,
`page`, `seed`, `panel-precut`): reused for `MARKET1_ROOT` it would skip `books\`,
the very inputs the plan keeps "even if the recordings' disk is lost". MARKET-1
needs its own list; say that it is a copy of about 25 lines.

### F17 (low) Wording

The beside lines B1–B6 need `t ≥ START` said. Section 7's "fills in markets listed
later counted" means printed, never counted toward a wave (M3, M13). The first
three hours of books are "20:59:54Z to 24:00Z on 11-10" (to 00:00Z on 11-11). Page
one says MARKET-1 reads "only files on your PC": the rule book is the collector's
database.

### F18 (low) Alarms

A book line that fails MARKET-1's schema is "dropped and counted", but no share
stops the day: a changed frame shape would turn every leg into a mark-priced one
and the verdict into WITHHELD months later. Fix: more than 1% of a day's book
lines (and at least 10) failing makes the day a gap and says so on the page. And
print the pool's liquidation fills by week on the page: a silent change of the
exchange's `liquidation` or `taker` flags would look like "no waves".

### F19 (low) The recordings' disk

The collector's plan puts the recordings at about 0.4–0.6 GB a day compressed:
about 70–110 GB more by May 2027 on F:, with its guard warning at 50 GiB free and
stopping book and trade lines at 10 GiB. MARKET-1 depends on that disk for six
months. A question to the supervisor (free space on F:, not a look at the
recordings).

---

## What I checked and found right

**1. Fidelity.** Every ruling of decisions 2026-11-13 is in the plan:

| Ruling | In the plan |
|---|---|
| (1) one deciding line, WAVE; JUMP and TAPE beside, with every liquidation outside a wave, the late entries and the market's own moves | M0; M12: B1, B2, B3, B9, J, T |
| (2) the wave counted by accounts, two or more | M5 |
| (3) held one day | M6 |
| (4) the prints beside as MARKET-FIND's section 3 names them, XREV among them | M12: B1–B11, J, T, X, R |
| (5) Polymarket first, every position at the recorded book as a taker; BTC and ETH at the wave's moments stay prints | M7–M9; B7 |
| Frame: rule W as the starting point; recordings, database and the paper's new data read after the freeze only; the same three looks and the whole 5%; keep, drop, too few; no API read unless the plan shows a need and its cost | M1, M10, M11, the sealed-data gate (M0); section 3 shows the cost of reading and no need |

Rule W against MARKET-FIND's section 3: W.1, W.2, W.4–W.9 are equal in substance,
and the plan's M4/M5 reproduce MARKET-FIND's loader and U2 code on the old weeks
(S1). One difference is named and argued: W.3 counts "a coin from its listing",
M3 fixes the 38 (Q6; the paper experiment has no market-days for a later coin,
which is true). M5's "of either side" for the block is more exact than W.5's
prose, and equals MARKET-FIND's code. What the plan adds: δ = +50 (Q3), WITHHELD
at 10% (Q5), START and the line P (Q2), and non-deciding prints (C, S, P, R,
BASE); each is asked or decides nothing.

**2. Freezable.** Checked one by one:

| Item | Result |
|---|---|
| The liquidation fill (M4) | Exact; equal to MARKET-FIND's loader: 727 counted fills (S1) |
| The wave window's ends (M1, M5) | Exact, [t − 60 min, t], both ends. On the old weeks the count is 153 whether the ends are included or not and at 59 minutes; 61 minutes gives 154. One of the 153 entries (2026-11-04 03:02:08.884Z, SOL, a forced sell) holds only because another account's fill in the *same millisecond* sorts after it under M4's order: a build that counts only the fills already processed gives 152 (S1c). The plan's part 3 lists "two fills in one millisecond"; pin it |
| One entry per market per 60 minutes | Exact; 153 whether it blocks entries of either side or of the same side |
| The 38 coins (M3) | Equal to the kit's rule book's crypto markets but 6, 7, 96, with the symbols (S6) |
| The book walk, the live rule (M7) | Exact; matches the recorder's code (`BookSampler.emit` writes every market's book at each receive hour's first sample, so the 61 minutes follow); gaps: F3; thin books: F6 |
| The mark fallback and WITHHELD above 10% (M8, M11) | Exact; F6; the 10% is new (Q5) |
| Fees (M9) | F9 |
| Funding (M9) | Exact; equals the kit's `leg` for two mark-priced legs (checked against `returns.mjs`: pIn, pOut, fees, funding) |
| START at 2026-11-11 (M1) | Exact; 4 of 41 first-look days are P; agree |

**3. The statistic and the verdict.** The two-way error `√max(V_day + V_market −
V_both, V_day, V_market)` is MARKET-FIND's two-way (`cr2`) wherever the first
term exceeds the larger one-way variance, as it does on the old weeks (4,583
against 3,612); the kit's `cr1Test` is the same CR1 as MARKET-FIND's `cr`. The
limits 2.81, 2.43, 2.17 are the paper's. The plan's page-one table is right (S7,
different code): KEEP 100 / 92 / 60 / 18 / 2 and DROP 0 / 0 / 0.1 / 2.1 / 18 for
true means +300 / +150 / +100 / +50 / 0 at δ = +50. The SE is taken as known, so
the false-keep share is a floor (MARKET-FIND: random days 1.1 times the clustered
error, so 3 to 4 in 100 is likelier than 2: my estimate). F1 and F5 are what is
missing. "The first KEEP or DROP ends the test" is right; "DROP wins when both
hold" can only matter if the error is under δ ÷ 2z (11.5 bps at the last look,
the plan's is 42), so it is harmless text copied from the paper experiment. A
KEEP in December would rest on 37 days and about 80 positions: read it with F5's
minimum. δ is the owner's: +50 is fine by my numbers (+100 would drop a real +50
18 times in 100).

**4. The data.** Formats: the plan's contract with the paper experiment's store
is right (the store's schemas, `state.json` then rows below `P`). The Monday
sweep against 10:30Z: F2. The cap: 138 of 153 is the plan's own count (my S8 gets
the same 16 missed entries and 66 unseen fills); the sweep reads oldest first
(`loop.ts`), so what a cap hides is the *later* part of a busy account's week: the
unseen fills and the missed entries fall on Tuesday to Sunday, none on Monday, 10
of the 16 entries on a Thursday or Friday. It removes entries and does not change
their result (MARKET-FIND A13: +283.8 ± 70.0 on the 138); the page sees even those
138 only after the sweep (F4). Holes: M13 prints them and the windows they touch.
The collector's books: the recorded format (top 20 a side, strings, once a second
when changed, forced at each hour) supports a taker's walk at $1,000 at the hour
the collector measured, and the hourly forced line makes the live rule sound; at
wave moments it is unmeasured (F6). Stale books and gaps: F3, F18. The four days
before the books: a later start with the days printed on marks (Q2) is the
cleaner choice, and the plan's "first three hours" is right.

**5. The reproduction:** F7.

**6. The budget:** zero API reads is right (no client; the collector's 50 and the
paper experiment's 120 stay at 170 of 250 a minute, the bursts 15 + 15 of 30, as
decisions 2026-11-12 and the paper plan review's budget table have them); the
alternative's cost table is the plan's c1 (I recomputed its entry counts, S8, not
its token costs; 5,000 tokens is 0.6% of the 80 a minute left over a week, 30,000
is 3.7%); the burst is on page one above.

**7. The code's shape:** a third entry point is the simplest honest shape;
`lock.ts`, `log.ts` and `schedule.ts` take the program's names and need no edit;
what the paper hard-wires (the gate, the run's settings, the backup list, the
verdict, the two-way error) MARKET-1 writes anew, perhaps 250 lines in all (my
estimate), which is the price of not editing frozen files; F8, F12, F14 are its
simplifications. For v1 later: keep the wave state and the entries as pure
functions with no file reading, so v1's live alert can import them; the page links
both experiments as the plan says.

**8. Risks the plan missed:** F2 to F6, F18, F19; plus the first real run meeting
the real recordings (F7) and the pool's decay (MARKET-FIND item 6, already in the
plan's section 7).

## The twelve questions

| Q | Plan's recommendation | Mine | Note |
|---|---|---|---|
| 1 | Fills from the paper experiment's store only | Agree | 138 of 153 (c1); F4 on what the page shows |
| 2 | START 2026-11-11, the days since the cut printed on marks (P) | Agree | A later start loses 4 of 41 first-look days; mixing two kinds of price is worse |
| 3 | Drop line δ = +50 bps | Agree (the owner's) | DROP needs the mean below −208 / −97 / −41 at the three looks: it means a measured loss |
| 4 | KEEP on the money alone | **Differ** | Add the matched-baseline condition (F1); not the basket-adjusted one |
| 5 | A gap: the mark, flagged; WITHHELD above 10% | Agree, with F3 and F6 | A leg's gap must be seen first (F3); thin-book fills count toward the 10% (F6) |
| 6 | The 38 coins fixed | Agree | Wording: printed, never counted toward a wave (F17); print the coins left out (F15) |
| 7 | Own page with a link | Agree | The page's headline on complete weeks (F4) |
| 8 | The 2-minute entry decides; the hour-late one printed under the verdict | Agree | Keep B3 beside the verdict in the look report: no tool in budget sees a wave in 2 minutes |
| 9 | TAPE: ids ending in 00 | Agree | 1% is about 349 a day by MARKET-FIND's 2,372,070 small-coin trades in 68 days |
| 10 | Heavy lines may join later as their own arm | Agree, and more | F14: also J, X, B7–B10, S, C |
| 11 | The collector and the paper experiment run to 2027-05-08 | Agree | The paper's *daily task* must keep reading, not only exist; stopping its task after its own verdict would starve MARKET-1 |
| 12 | The burst: the owner may raise it from 30 to 40 | Not MARKET-1's need | Cost and risk on page one: no tokens, a new caller's 10 and one test; our traffic stays under half the measured refill; the browser's sharing is the one unknown |

## My questions, each with my recommendation

1. **F1's extra condition for KEEP** (the matched-baseline reading above zero,
   not the basket-adjusted one)? *Yes.*
2. **A minimum of 20 UTC days and 10 markets for any verdict** (F5)? *Yes.*
3. **The page's headline on complete weeks only** (F4)? *Yes.*
4. **Every leg waits one more day, coverage of both days** (F3)? *Yes.*
5. **MARKET-1 waits for the paper experiment's lock and heartbeat before it
   reads, and nobody starts a paper command while it runs** (F2)? *Yes; the
   supervisor's procedure.*
6. **Freeze eleven paper files, not 22** (F8)? *Yes, or keep all 22 and accept a
   re-freeze at each paper fix.*
7. **Which beside lines wait for their own arm** (F14)? *T, R, B8, B9 first, then
   J, X, B7, B10, S, C if the build runs long.*
8. **Is there room on F: for about 100 GB more by May 2027** (F19)? *A check of
   free space only.*
9. **The burst:** not for MARKET-1; raise it to 40 only when a reader needs it.

## Slips, all of them

My first same-millisecond figure in S1 (73 of 153 entries) came from a check that
also removed the entry's own fill; the corrected check (S1b) gives 2, and 1 that
sorts after it (S1c: 152 under an incremental build). The brief's reading list
names MARKET-PLAN's `brief.md`, `progress.md`, `scripts\` and `out\`; I also read
three scripts and outputs under its `inputs\` (read only), as said above. File
times in that folder are one hour ahead of UTC (local time); every stamp here is
from `date -u`.

## Evidence

Scripts and outputs in `scripts\` and `out\` of my folder (SHA-256, first and last
eight digits, in `progress.md`). All pre-cut, counts and arithmetic only.
- **S0** `check-freeze.mjs`: the repository's files against
  `experiment/FROZEN.sha256`: 61 of 61 equal, list hash `d04d3cd8…f31c`.
- **S1, S1b, S1c** the plan's M3–M5 from its text, independently, on the seed: 153
  entries, 47 days, 30 markets, 114 sells, 39 buys; variants; same-millisecond
  dependence; an incremental build.
- **S2** the signed baseline by month and side; the market's own mean 24 h move.
- **S3** the in-week view from list accounts (the kit's labels): 216 of 727 fills,
  22 of 153 entries.
- **S4** realised taker fee rates by category in the seed.
- **S5, S5b** the rename-over-open-file test on this PC (Node v24.13.0).
- **S6** the coin list against the kit's rule book.
- **S7** the verdict shares and the thresholds, with my own generator.
- **S8** the reader's cap (the plan's own model): 153 entries, 138 seen, 16 missed
  and 66 unseen fills, by day of the week.
Read and not recomputed: c1's token costs and c2 (MARKET-PLAN's counts; c1's
entry counts are S8), MARKET-FIND's figures other than the U2 entries, the paper
experiment's "8.1 h" (its review's table). Not read: the supervisor's `wave.mjs`
(the 174-entry run), STRATEGY-REVIEW, the paper plan beyond its review's budget
table.
