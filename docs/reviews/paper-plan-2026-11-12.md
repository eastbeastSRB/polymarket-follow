# PAPER-PLAN — the forward paper experiment: its frozen rules, its daily run, its page, its build

PAPER-PLAN (Opus 5.5, max), 2026-11-12 10:53Z – 11:35Z (UTC; every stamp from
`date -u`), for polymarket-follow's supervisor. The frame: decisions
2026-11-12, "APPROACH-REVIEW accepted", and the addition the owner approved the
same day, "the paper experiment runs daily and gets a page". Evidence: the
supervisor folder's `workers/PAPER-PLAN/` (`progress.md`, `scripts/`, `out/`;
paths below are relative to it). **This is a plan: nothing is built before the
owner approves it, after a fresh review.**

**The blind store held.** Nothing stamped at or after 2026-11-07T00:00:00Z was
read: every count used the kit's derived files of the weeks before the cut, and
every API probe asked a window that ends before it (asserted in the script).
The collector's recordings, database and run folder were never opened. Ten API
calls in all, `GET /v1/info/fills` only, 6 s apart, at 11:09–11:10Z. No POST,
no account, trade or blp route, no credential, no download, no agent; the kit
`2d3667b5…09aa` checked at every run and never edited; polymarket-lab not
touched.

## For the owner, in one page

*Words.* A **paper position** (a **copy** below) is the position a follower
would have opened about 80 seconds after one of the traders opened a new
position. A **bp** is 0.01% of its size ($1,000). A **line** is a group of
copies chosen by a rule fixed in advance. A **look** is one of the three dates
on which the test gives its verdict.

**What runs every day.** Each morning at 04:00 UTC (05:00 your time; 06:00
from 2027-03-28) a Windows task on your PC reads, from Polymarket's public
data, the trades of the day before: those of about 300 traders whose own
trading made them "directional" at the week's start, those of your favourites,
and every market's prices and funding. It then rebuilds every paper position
from 2026-11-07 on, by the frozen rules, and rewrites your page. **It costs
about 6,100 weighted API tokens on a normal day (about 51 minutes at its share
of 120 a minute) and about 38,000 on Mondays** (about 5 hours), when it also
reads the rest of the 1,602 accounts once to see who is directional next week.
Together with the collector that stays at 170 of the 250 a minute we allow
ourselves. The first run reads everything since 7 November at once (about
113,000 tokens, about 16 hours, if it starts about three weeks after 7
November).

**Why not live.** Watching the 157 slow traders every 30 seconds would take
about 1,570 tokens a minute, six times our whole budget; the 330 of the
broadest group, 3,300. And the test does not need it: the follower's moment is
modelled from each trade's own time, as R8 did. Live alerts and live paper
positions for your favourites come with the app (v1).

**Your page** — one file on your PC, `F:\polymarket-follow\paper\page\index.html`,
opened in your browser, rebuilt after each morning's run. It needs no server and
no internet, and you cannot change anything from it. It shows:
- at the top: what the test is, in three sentences; "data through
  <date>"; the next look's date; and **"Too early to judge"** — until each
  look. At a look, its verdict appears there, worded as a verdict on the test;
- for each of five lines (the main line first, then the 10-cycle line, every
  directional trader, the day-holders, your favourites): positions,
  traders, days, how many are open; the running result per position with its
  error band; the "against random trades" reading with its band;
- every paper position: trader, market, side, the trader's own time, the
  follower's moment (about 80 s later), the price after the delay, open or
  closed (each exit), its result so far;
- one row per trader of the main line, sorted by address, never by result;
- what the data lacks (gaps, unpriced positions) and what the reads cost.

**The page cannot change the rules.** The rules and the program are frozen by
a fingerprint before any result after 7 November exists; the program refuses
to run if one byte differs; the page has no buttons or filters; verdicts are
computed only at the three looks; a band crossing a line on some Tuesday
decides nothing; a new idea becomes a new test with its own start date.

**What you do:** (1) send your favourites, at most 20 addresses, before the
freeze — they count from the freeze, not from 7 November, because you may
have seen their recent trading; (2) when the build is done, re-run
`tools\register-tasks.ps1` once from an elevated PowerShell (it adds the daily
task); (3) answer the questions below.

**What the three looks show** (2026-12-19, 2027-02-06, 2027-05-08; each report
two days later, after Monday's run): for the main line, the money per copy
with the trader's exits copied, its band, the "against random trades"
reading, and one verdict — **keep** (the band above zero and the judgement
above zero), **drop** (the band below +10 bps a copy), or **too few to tell**.
Beside it, deciding nothing: the other lines, stops, a 7-day limit, "after a
jump", limit-order entries, the order-book price, your favourites, and what
each venue's costs would leave. What it can see: about 54 / 33 / 21 bps a copy
for the 10-cycle line (APPROACH-REVIEW); the 3-cycle main line has about twice
the copies, so probably less, though its noise is not measured yet.

**The venues** (their own pages, read 2026-11-12): Polymarket Perps — 4 bps a
side for a taker plus spread, funding every hour; Binance futures — 5 bps a
side for a taker at the base rate (its own example), funding every 8 hours,
crypto and (since January 2026, press reports) gold and silver, no stocks found;
Finotive — CFDs, daily loss limits of 3–5% and overall 6–10% of equity by
account, and **its terms prohibit copying trades from third-party accounts or
signal providers** (§7.10). Every line prints the round-trip cost below which
it would have paid, so any venue can be read against it.

**Your decisions** (in full in section 10, each with a recommendation): Q1
whether the main line also uses the 24 h cost map (no); Q2 the whole pool read
weekly (yes); Q3 the Monday read's page cap (10); Q4 the code inside the
collector's program (yes); Q5 your favourites from the freeze (yes); Q6 five
lines on the page, the rest at the looks (yes); Q7 the Finotive line given its
copying rule (a cost comparison only, with the rule beside it); Q8 the exams of
11-30 and 12-19 closed, 12-19 the first look (yes); Q9 D1 and D2 as planned,
D2 after D1 (yes); Q10 the share of 120 a minute (yes); Q11 the first keep or
drop ends the test (yes).

*This is research, not advice on what to trade.*

---

## 1. The rules — draft `rules.md`, in full

*To be frozen by hash (section 6, part 5) before any outcome after the cut is
computed. Every number below is fixed here; nothing may be chosen later.*

### R0. Identity and what is frozen

- **The experiment** has two arms: **arm A** (the pool's lines, R7) and **arm F**
  (the owner's favourites). A rule change after the freeze is a new arm with its
  own start instant, its own lines and its own budget; the frozen arms run on
  unchanged.
- **Frozen together** (`FROZEN.sha256`, its SHA-256 recorded in decisions before
  the first run after the freeze): this file; the experiment's code
  (`apps/poller/src/paper/**`); the vendored kit (`apps/poller/research/kit/`,
  33 files, fingerprint `2d3667b5ce90645b41dfee4e6fc425ab3e64c985cb4973bfed6ece5052c409aa`)
  and FIND-6-EXITS's library (`apps/poller/research/find-6-exits/lib-exits.mjs`,
  `612d58365ba4c2a2d88a3f73a41a08e193d0874458d862b169fc51f218926330`), both
  byte-identical; the seed's manifest (R3); the favourites list (R2).
- **Every run starts by checking them:** the kit's `checkKit()` must return the
  pinned fingerprint, lib-exits its hash, and every file of `FROZEN.sha256` its
  hash; otherwise the run writes one line ("frozen files differ") and stops —
  no read, no page.
- **A code defect** (the code not doing what this file says) may be fixed only
  through a decisions entry that names it, before the next look, with the diff,
  a test that failed before the fix, and the list of copies whose numbers
  changed; never a number of this file.

### R1. Instants

- **CUT** = 2026-11-07T00:00:00.000Z. Arm A counts entries with first fill
  t ≥ CUT.
- **F0** = the freeze instant (recorded with the hash). Arm F counts entries with
  t ≥ F0.
- **A run's END** = 00:00Z of the run's UTC day: every input is read up to END
  (exclusive) and nothing at or after it is used.
- **The looks:** L1 END₁ = 2026-12-19T00:00Z, L2 END₂ = 2027-02-06T00:00Z,
  L3 END₃ = 2027-05-08T00:00Z; each look runs once, on the Monday after its date
  (2026-12-21, 2027-02-08, 2027-05-10), after that day's run, with END = END_k.
- **Weeks** run Monday 00:00Z to Monday 00:00Z. An entry's **Monday M** is the
  latest Monday 00:00Z at or before t.
- Times are milliseconds since the epoch; a window [a, b) is start-inclusive,
  end-exclusive, as the API's.

### R2. Who

- **The pool:** the kit's `data/population.json` (1,702 accounts, SHA-256
  `f2748c42cf3d6d12af1870918cad7f44a6e42cc1dc20b100a5e4239a99418947`) minus its
  100 holdout accounts: **1,602 accounts**. No account is ever added to arm A.
- **The favourites (arm F):** at most 20 addresses the owner gives in chat to
  the supervisor before the freeze, lower-cased, frozen in `favourites.txt`;
  pool membership is not needed; **judged whole, as one set**, never trader by
  trader. A holdout account on the list joins only after D1 is scored, with
  that instant as its own start. An address added later is a new arm.

### R3. Fills

- **Before CUT — the seed:** for every pool account, the files the kit's
  `readAccount` opens (R2-STYLE's numbered pages; R8's three completed files),
  read the kit's way (numbered pages, HTTP 200, deduplicated by
  `(trade_id, instrument_id, timestamp)`, the kit's `truncated` and `oldest`),
  **except that `trade_id` and `order_id` are kept as their source text**, so
  fills with ids above 2^53 − 1 are kept (FIND-REVIEW-6, F4; the kit drops
  them). Written once with a manifest.
- **From CUT — the API:** `GET /v1/info/fills?address=&start_timestamp=&end_timestamp=&sort=asc`,
  following `cursor` until `more` is false. Each account has a read-through
  instant P (first CUT). A read asks [P, END) and moves P to END only when it
  completed. A failed or rejected read leaves P where it was; a later run reads
  on from P.
- **The Monday sweep's cap:** in the Monday sweep (section 3), an account's
  read stops after **10 pages**; [the timestamp of the last fill read, END)
  becomes a **hole** of the account (recorded with its bounds, never read
  later) and P moves to END.
- **The boundary check** (Zod, Iron Rule 3): `trade_id`, `order_id` strings of
  digits; `instrument_id`, `timestamp` safe integers; `side` `long` | `short`;
  `price`, `quantity`, `previous_size`, `fee`, `pnl` decimal strings;
  `total_fee` optional decimal string; `taker`, `liquidation` booleans; `adl`,
  `settlement` optional booleans; unknown keys allowed. A failing row is
  dropped and counted, and its account-day becomes a hole.
- **Normalized** as the kit's `normFill` (`t, iid, oid, tid, prevS, prev, sgn,
  px, q, fee, pnl, taker, liq, forced`), with `oid` and `tid` as strings.
- **Covered:** a window [a, b) of an account is covered when no hole of the
  account meets it and either a ≥ CUT, or the seed is not truncated, or the
  seed's oldest fill is at or before a.

### R4. Events, cycles, entries, delay

- The kit's `toEvents`, `toCycles` and `buildEntries(events, −∞, ∞, 60 000)`,
  unchanged, on each account's whole fills (seed and reads).
- **An entry** is a group of type OPEN or FLIP (adds are never entries; forced
  events are exits only) whose first fill t lies in [CUT, END) (arm F:
  [F0, END)).
- Its id is the kit's `entryId(addr, g)`; its **delay D** = the kit's
  `delayOf(id)` (R8's rule: D in [62.14 s, 95.44 s)); its **follow instant** is
  t + D.

### R5. Labels and habits, at the entry's Monday

- **The label** = the kit's `labelAt(account, M)`: the frozen classifier v1 on
  the 14 days before M, given the account's fills with the seed's own
  `pages`, `truncated` and `oldest`. Its `covered` is not used: holes after the
  cut are R3's.
- **P1** at M: the label is `directional` and [M − 14 d, M) is covered (R3).
- **The habits** = the kit's `habitsAt({cycles, groups}, M)` on the 30 days
  before M: closed cycles whose start is captured, their median hold, the long
  share of the entries opened in them. **The habit window is covered** when
  [M − 30 d, M) is covered.

### R6. Markets

An entry's market is **primary** when all hold:
1. the kit's `inPrimaryCell(iid, t)` (the pre-IPO market and PRL, NCLD,
   SKHYNIX, SAMSUNG, CXMT out; KIOXIA from its settlement day);
2. the market is in the kit's rule book (listed by 2026-11-10T14:55Z);
3. the collector's rule book shows, for it, no close-only state, settlement or
   delisting at or before t's UTC day, and no split on t's UTC day.
4. [Only if Q1 is ruled "yes": the kit's `mapOpen(iid, {h: 24 h, setting:
   taker, dir})`.]

Entries in other markets are counted, apart, and priced in no line.

### R7. The lines

Each entry's line membership is fixed at its Monday M.

| Line | Rule | Decides? |
|---|---|---|
| **MAIN** | P1 at M; the habit window covered; median hold ≥ 6 h; at least 3 closed cycles; a primary market | **yes, the only one** |
| TEN | MAIN with at least 10 closed cycles (FIND-3's minimum) | no |
| BROAD | P1 at M; a primary market (every directional entry) | no |
| DAY | MAIN with median hold ≥ 24 h (day-holders) | no |
| FAV (arm F) | every entry of the favourites with t ≥ F0 in a primary market, whatever its label (the label at M printed) | no |
| STOP2, STOP5 | MAIN's copies, also closed whole at the end of the first whole minute after t + D whose mark is 2% (5%) or more against the entry's mark | no |
| DAYS7 | MAIN's copies, also closed whole at t + D + 7 days | no |
| JUMP | MAIN's copies split by the jump ratio J (R13): J > 3 against J ≤ 3 | no |
| MAKER | MAIN's copies with t + D ≥ 2026-11-10T20:59:54Z, entered by a limit order (R13) | no |
| VWAP | MAIN's copies priced at the collector's books (R13) | no |
| NOTIONAL | MAIN's copies of accounts on the all-time notional board (`notionalBoard`), and the rest | no |
| COMP | MAIN and BROAD without the competitions' days, and without their boosted markets (A.0-8, R13) | no |
| Venues | MAIN and BROAD at each venue's costs (section 4) | no |

### R8. The money reading (exits copied)

- **The copy's exits:** the kit's `buildEntries` exits of the entry's group
  (each REDUCE, CLOSE, FLIP or forced exit of the trader on that instrument and
  side after the entry's first fill, with its share).
- **The legs:** FIND-6-EXITS's `planCopy`, with END in place of CUT: each exit,
  at its first fill + D, closes its share of what is still open (a partial
  liquidation its share; a close, flip or full liquidation all of it); adds are
  not copied; a re-open merged inside the 60-s window does not re-open; an exit
  instant at or after END flags the copy `crossing`; a part still open after
  the trader's last exit flags it `open`; both are marked at END − 1 ms (the
  minute that ends at END).
- **The price:** FIND-6-EXITS's `priceCopy` with the taker setting of R9: Σ
  partᵢ × the kit's `leg` from t + D held to each exit instant. In bps of the
  copy's $1,000: net, gross, fees, funding, the share-weighted hold.

### R9. The taker setting and the extended panel

- **Fee** at an instant x: the kit's `feeAt('taker', iid, x)` until the
  collector's rule book records, after 2026-11-10T14:55Z, a change of the
  base-tier taker rate or of an override; from that record's instant, the
  base-tier rate it records (never a lower tier, never a rebate).
- **Spread and depth:** the kit's `spreadAt` on R8's session-pair table
  (`data/price-table.json`, frozen): the weekday table in US regular hours, the
  Saturday table otherwise; the category mean where a market has no value
  (flagged).
- **The panel past the cut** (the yardstick unchanged): per market and UTC day
  from CUT, `mark-history` at 1m asked with `end_timestamp` = the day's end
  (a bucket comes only if it ends by then), `klines` at 1m with the day's end
  − 1 ms, `funding` filed by nominal hour (a row stamped late keeps its hour).
  It is joined to the kit's panel (before CUT) and built into the kit's market
  object exactly as the kit's `marketFrom` builds it (dense minute marks, NaN
  where none; trades and volume from klines; the funding prefix sums at the mark
  of the minute before each hour), with END in place of CUT. The kit's
  `markAtMinuteEnd` (a missing minute takes the latest earlier mark up to 5
  minutes old) and `fundingBetween` (settlements whose nominal hour lies in
  (tIn, tOut]) are used unchanged.

### R10. The judgement reading (d at 24 h)

- d = the kit's `dAgainstNull(mk, {dir, t, D, h: 24 h, longShare, removed})`:
  the copy's gross over 24 h from t + D minus the exact matched null's gross
  (every public trade of t's market and UTC hour equally likely, from the
  klines' minute counts, followed after the same D, long with the trader's long
  share); cost-neutral.
- **longShare** = the habits' long share at M; **removed** = the kit's
  `removalOf` over the fills of every account in the copy's line at M (their
  trades are left out of the null's minutes).
- **Voted** by END: ⌊t / 1 h⌋·1 h + 1 h + 95.44 s + 24 h ≤ END (the kit's
  `voted` rule with END in place of CUT).

### R11. Unpriced and missing

- A copy whose leg finds no mark within 5 minutes before an instant, or a
  funding settlement without a mark, is **unpriced**, counted by reason ("no
  mark at the follow instant", "no mark at an exit instant", "a funding
  settlement without a mark"), and left out of every mean; never guessed.
- A funding hour without a row is charged nothing and counted.
- d is null, counted by reason, when the entry is unpriced, a null minute is
  unpriced, the hour has no trade left, or the long share is null.
- **A gap copy:** a chain break (lib-exits' `chainBreaks`) on its instrument
  after the entry's first event and up to its last exit used, or a hole of the
  account in that span; flagged and printed with and without.

### R12. The statistic and the verdict (MAIN only)

- **The copies of a look:** MAIN's copies voted by END_k (R10); both readings on
  this one set; their money with exits up to END_k.
- **x** = the money reading's net per copy (bps), each copy alike; **m** its
  mean; **SE** = √max(V_trader + V_day − V_iid, V_trader, V_day), where
  V_trader and V_day are the CR1 variances of the mean clustered by address and
  by the UTC day of t + D (the kit's `cr1Test`), and V_iid = s² / n.
- **z:** L1 2.81, L2 2.43, L3 2.17 (two-sided 0.5%, 1.5%, 3%; 5% in all).
- **KEEP** when m − z·SE > 0 **and** the mean d of the set's copies with a d is
  above 0.
- **DROP** when m + z·SE < **+10 bps**.
- **TOO FEW TO TELL** otherwise; at L3 it reads "no edge as large as m + z·SE
  was seen".
- The first KEEP or DROP is the test's verdict; the log keeps running as a
  record, and later looks print their figures marked "after the verdict".
- **These are verdicts on the test, never instructions to trade.**

### R13. The lines beside — their definitions

- **STOP2 / STOP5:** the first minute s ≥ the minute after t + D's minute whose
  end mark m_s gives dir × (m_s / m_in − 1) ≤ −0.02 (−0.05), m_in = the mark at
  the end of t + D's minute; if it comes before a copied exit, what is still
  open closes at the end of minute s (the kit's `leg` to that instant).
- **DAYS7:** what is still open at t + D + 7 d closes there.
- **JUMP:** J = |m(e) / m(e − 15 min) − 1| ÷ U, e = the start of t's minute,
  m(x) = `markAtMinuteEnd(mk, x − 1)`, U = the mean of |m(s + 15 min)/m(s) − 1|
  over every whole start minute s in the 30 days before e with both marks
  (FIND-4's words: "the prior 15 minutes moved more than three usual 15-minute
  moves"); J null without U.
- **MAKER:** a limit order at the follower's touch (the best bid for a long,
  the best ask for a short) of the collector's last book frame with server
  `ts` ≤ t + D, filled at that price if the collector's tape prints a trade of
  that market strictly through it (below the bid, above the ask) within 5
  minutes after t + D, its fill instant that trade's `ts`; fee 1.25 bps a side
  (the kit's maker setting) on entry, the money reading's exits at a taker's
  cost; an unfilled copy is counted and its taker result printed apart; the
  fill rate printed.
- **VWAP:** copies whose every instant has a collector book frame with server
  `ts` within 2 s before it; the price at each instant is the book's VWAP for
  the leg's notional on the follower's side (buying on the ask levels, selling
  on the bid levels); fees and funding as R8; a book too thin for the notional
  leaves the copy out, counted.
- **COMP:** a competition is every one the collector's rule book lists whose
  window overlaps [CUT, END), with its boosted markets (competition 1:
  2026-11-02T14:30Z → 11-16T14:30Z, ANT, AMD, ARM, SOXL). Printed: without
  copies whose t lies in any competition's window; without copies in a boosted
  market.

### R14. Prints at a look (every line; MAIN's decide)

Copies, traders, days; unpriced by reason; open, crossing and gap copies; the
money mean with its two-way SE and both one-way errors; d's mean with its SE;
the gross before costs with its lower bound (**the break-even round trip**:
"it pays at any round trip below X bps"); fees and funding; the win share and
the average win against the average loss, labelled "exits can flatter these;
only money measures"; the hold (median, quartiles); the worst UTC day, the
worst trader, the paper equity's drawdown at $1,000 a copy; the mean without
the most influential account, then also without the most influential day; with
and without open copies; the long share of the copies; R3's pooled daily
e-value (one vote a UTC day, the sign of the day's mean d; deciding nothing
here); the realized copies a week and the smallest edge visible at the next
look with the realized SE.

### R15. The daily page

- **Its lines:** MAIN, TEN, BROAD, DAY, FAV, with copies, traders, days, open
  copies; the running money mean with SE and the band m ± z_next·SE, z_next =
  the next look's z, labelled "the band the next look will use; a crossing
  between looks decides nothing"; the running d mean with its band (voted
  copies only); R3's e-value.
- **The verdict box:** "Too early to judge — next look <date>" until L1; at
  and after a look, R12's verdict line for that look with its sentence, nothing
  else.
- **Every copy** (trader, market, side, the trader's fill time, the follow
  instant, the entry price after the delay, its legs, open or closed, its
  result so far, its flags), newest first; **one row per MAIN trader**
  (copies, open, the running mean, a 95% band clustered by day from 20 days
  with a copy, else "too few days"), sorted by address.
- **Never on the page:** a verdict between looks; any other line, threshold or
  filter; a sort by result; the words "follow", "copy", "signal", "edge",
  "skill"; a probability.

### R16. What never changes

After the freeze no number, line, population, threshold, instant or rule of
this file changes. A new idea is a new arm (R0). A look is run once; a run that
crashes before its result exists is not a look.

### Where these rules extend the kit past the cut (everything else is the kit or lib-exits unchanged)

| Kit or lib-exits piece | Bound to the cut because | Extension |
|---|---|---|
| `fills.mjs` `readAccount`, `validFill` | refuses rows at or after CUT; drops ids above 2^53 | R3: the seed keeps ids as text; the API reads from CUT; holes |
| `labels.mjs` `labelAt`'s `covered` | knows only the capture's old end | R3's covered (holes), used by R5 |
| `cells.mjs` `inPrimaryCell` | the rule book of 2026-11-10; throws on a split | R6 (2)–(3): the collector's rule book for later states |
| `competition.mjs` | competition 1 only | R13 COMP: every competition the collector's rule book lists |
| `costs.mjs` `feeAt` | the fees of 2026-11-10 | R9: the base-tier rate in force from the collector's rule book |
| `panel.mjs` `marketFrom`, `loadMarket` | refuse a panel ending after CUT | R9: the same object built past the cut with END |
| `entries.mjs` `voted` | uses CUT | R10: END in its place |
| lib-exits `planCopy` (`CUT_MARK_T`) | marks at CUT − 1 ms | R8: END − 1 ms |

---

## 2. The data and its sources

| Data | Before the cut | From the cut | Notes |
|---|---|---|---|
| **The traders' fills** | the seed: R2-STYLE's capture (R3), ids kept as text | the API's `fills` by address, daily for the daily list, weekly for the rest (section 3) | the API's history is complete back to each account's first fill (external-apis) |
| **Marks and minute volumes** | the kit's panel (`KIT\panel`, pinned by the kit's manifest) | the API's `mark-history` 1m and `klines` 1m, per market and day | the same routes, intervals and end rule as the kit's panel, so the yardstick is the same |
| **Funding** | the kit's panel | the API's `funding` per market, hourly rows | filed by nominal hour |
| **The null's public trades** | the kit's panel (klines' minute counts) | **the klines' minute counts** | the kit's exact null needs no tape (`nulls.mjs`: "No tape is read and no trade is drawn") — so **the API's tape for the gap is not needed** |
| **Books** | none | the collector's `book-HH` files from 2026-11-10T20:59:54Z | VWAP and MAKER only; a past book cannot be asked of the API |
| **The tape** | none | the collector's `trades-HH` files from 2026-11-10T20:59:54Z | MAKER's fills; a daily check of klines' trade counts against it |
| **The rule book** | the kit's `rulebook.json` (2026-11-10) | the collector's `rulebook` collection (fees, competitions, splits, the market list) | read only, after the freeze |
| **The collector's minute reads** | — | its `rest-HH` tickers | a cross-check only (the mark at each minute against `mark-history`); never a price |

**The gap from 2026-11-07T00:00Z to the collector's start, 2026-11-10T20:59:54Z,
is filled from the API's history, exactly as every later day:** the first run
reads, for every pool account, `fills` over [CUT, END) in one paged read, and for
every market `mark-history`, `klines` and `funding` day by day from 2026-11-07.
Nothing the main line needs comes from the collector, so the gap costs the main
line nothing; only VWAP and MAKER start at the collector's start (copies before
it are counted there as "no book").

**The collector's formats** (architecture; never opened by this plan): files
`F:\polymarket-follow\recordings\<UTC date>\<kind>-<HH>.jsonl`, Brotli `.br` once
the hour closes; a line is our receive time in ms, a tab, the text as received;
book frames `{ch: "book::<iid>", ts, data: {b, a}}` (top 20, at most once a
second when changed); trades frames `{ch: "trades::<iid>", ts, data: [{tid, iid,
side, p, qty, ts, …}]}` (the taker's side); `coverage.jsonl` lists every gap. The
experiment reads them by the server's `ts`, never by receive time, so books that
arrived late in a burst (COLLECTOR-REVIEW) price at their own instant.

**What the experiment writes** (all on F:, append-only; a day's files are never
rewritten):
- `F:\polymarket-follow\paper\raw\<UTC date>\rest-HH.jsonl(.br)` — every reply
  with its call line, the collector's format through its own `Recorder` with this
  root;
- `paper\fills\<run date>.jsonl.gz` — the fills read that day, normalized;
- `paper\panel\<iid>\<UTC date>.json.gz` — one market-day;
- `paper\state.json` — each account's read-through instant and holes;
- `paper\log\<run date>.jsonl` — the run: the frozen hash, counts, coverage, the
  budget spent, and every copy's state as computed that day;
- `paper\manifest\<run date>.sha256` — every file written that day;
- `paper\page\index.html` — the page; `paper\looks\L<k>\` — each look.

Every copy is recomputed from all inputs each day, by the frozen code, so the
look computes what the days computed; the honest log is each day's record of it
(Iron Rule 4: every entry recorded, flagged when late, unpriced or open, never
dropped).

## 3. The rate budget, measured

**Measured inputs** (each from a saved output):

| What | Measured | Source |
|---|---|---|
| fills: a page | 100 rows; an idle account-week answers one call, 0 rows, 24 bytes | P1, 2026-11-12 11:09Z (`out/p1/result.txt`) |
| fills: a directional account-week | median (4 entry groups) 13 fills, 1 page; the busiest of 428 (94 groups) 626 fills, 7 pages | P1; the account-weeks from `out/p0/pick.json` |
| fills: paging | `sort=asc` and `desc` both page by cursor inside [start, end); no row outside, no duplicate, order kept; latency 309–399 ms | P1 |
| marks, klines, funding | weights 5, 5, 10 (charged); 993, 762, 97.5 rows a reply (max 1,000, 1,000, 100); per market-week at most 62.3 + 12.8 + 17.5 tokens | the kit's own pull, 16,116 calls, 0 errors (`out/c2/result.txt`) |
| the pool | 1,602 accounts; 728 with a fill in the last 14-day window before the cut (so about 874 idle); 238–290 directional and covered on each of the last 8 Mondays; 182 algorithm or market maker at the cut | `out/c1/result.txt` |
| fills a day, directional-like accounts | median 3.1, mean 16.6, p99 203.6; machine-tempo median 695 | R6 (`docs/reviews/r6-storage-2026-11-08.md`, 2026-11-08) |

Weights are the spec's published ones (replies carry no rate header, so a
weight cannot be measured; R1 found the bucket consistent with them).

**Why every pool account, not only the 160–330 active ones.** P1 labels an
account from its own fills of the 14 days before each Monday, so knowing who
is directional next week needs every pool account's week: the Monday sweep
reads all 1,602 once (most idle: one call each), and only the ~290 directional
ones, the open copies' traders and the favourites are read every day.

**The runs** (`out/c3/result.txt`; the experiment's share **120 tokens a minute,
15 in any 5 s**; its own client instance, one request at a time, admitted
before it is sent; no call 02:35–03:50Z; a 429 drops the request and backs off
from 2 s):

| Run | What it reads | Tokens | Time at 120 a minute |
|---|---|--:|--:|
| **Daily** (04:00Z) | yesterday's fills of the daily list (the ≤ 290 accounts P1 at this Monday, traders with open copies, ≤ 20 favourites: ~341 calls) + every market's marks, klines, funding for the day (30 a market) | **6,110** | **51 min** |
| **Monday** (04:00Z) | the daily part + the sweep: every other pool account's past week (874 idle × 1 call + 182 machine × the 10-page cap + 256 others × 2) | **38,170** | **5.3 h** |
| **A week** | | 74,830 (10,690 a day) | 6.2% of the share's capacity |
| **The first run** | the backlog since the cut (if frozen ~3 weeks after it) | 112,803 | 15.7 h |

All callers together: the experiment's 120 + the collector's 50 = **170 of 250 a
minute**; bursts 15 + the collector's measured peak of 12 = **27 of 30 in 5 s**.
The rest is headroom for the owner's browser on polymarket.com, which shares
the bucket. The collector's passes (23:15Z, 23:38Z, 00:20Z) end hours before
04:00Z.

**Truly live polling is out — the measured reason** (`out/c3/result.txt`; the
portfolio read weighs 5, a fills read 10):

| Accounts polled | Every 30 s | Every 60 s | With the whole 200 left after the collector |
|---|--:|--:|--:|
| the main line's 157 traders | 1,570 a minute (6.3 × our whole 250) | 785 | one round every 3.9 min |
| the brief's upper 330 | 3,300 (13.2 ×) | 1,650 | every 8.3 min |
| the whole pool, for its labels | 16,020 (64 ×) | 8,010 | every 40 min |

Even the whole budget gives a round of minutes, later than R8's modelled delay
of 62–95 s, so a live copy would price later than the frozen rule; and the test
needs no live read, since each copy's moment is t + D from the fill's own time.
The daily run costs about 6,100 tokens.

## 4. The venues as cost lines

**Their facts** (each venue's own page, read 2026-11-12; "not readable" where
the page loads its figures by JavaScript; no account, no download, no API):

| | Polymarket Perps | Binance USDⓈ-M futures | Finotive Funding |
|---|---|---|---|
| **What it is** | the venue the traders trade on | a crypto futures exchange | a prop firm: CFDs on its own platforms ("powered by Finotive Markets LLC") |
| **Fees** | base tier taker 0.04%, maker 0.0125% of notional; top tier taker 0.02%, maker −0.005% (`/v1/info/fees`, external-apis) | "a Regular User's maker fee is 0.02% and a Regular User's taker fee is 0.05%", given as an example; the live table loads by JavaScript; 10% off when paid in BNB; fee = position value × rate (fee FAQ, updated 2026-05-01) | the commission table (`/trading-symbols`) loads by JavaScript: not readable; the terms name only 2-Step Solo's USD 2.50 round turn (§8.8.3), Pro's 25% lower commission (§10.4), and that Finotive "may amend leverage, margin, symbol availability, commissions, or trading conditions at any time" (§6.4) |
| **Spread** | R8's measured table: a taker's round trip 8.5–13.6 bps by kind of market (APPROACH-REVIEW C3) | not measured by us | not readable |
| **Funding / overnight** | every hour, capped at 4% an hour (docs, external-apis) | default interest 0.01% per 8-hour interval, settlements 00:00, 08:00, 16:00Z; intervals may be 4 or 2 hours; a ±0.05% clamp (funding FAQ, `binance.com/en/support/faq/360033525031`, read through search extracts only) | swaps exist ("Swap-Free" is an add-on, §4, §7.12); amounts not readable |
| **Account rules that matter** | order placement barred in the US and some other places (docs) | the account's eligibility is the owner's to check | daily drawdown 3.0–5.0% and maximum 6.0–10.0% by account type, on equity with floating losses (§7.4, §7.5; e.g. 2-Step 4.5% / 9.0%); floating loss on one symbol at most −2% of the starting balance on Challenge accounts, −1.5% on Instant (`/rules`); open volume at most 1,250% of the balance; under 20% of profit from trades held under 2 minutes (§7.14); a 21:00–22:59Z liquidity rule (§7.17); weekend holding of non-crypto positions on Instant accounts needs an add-on (§7.7); leverage crypto 1:10, indices 1:40 (1:30 Instant), metals 1:20 (§6.4) |
| **Copying** | — | it runs its own copy trading | **"Copying trades from third-party accounts, shared master accounts, signal providers, account managers, challenge-passing services, or third-party trading groups is prohibited"** (help article 955; §7.10, §7.2) |
| **Which copied markets** | all 84 primary markets | crypto perps (which of our 40 crypto markets are listed: from Binance's own instrument list at the build); gold and silver perps since 2026-01-05/07 (press: The Block, 2026-01-08; not found on Binance's own pages); no stock or index perp found on binance.com | "crypto pairs 24/7", FX, metals, indices (§6.4; `/trading-symbols`); single stocks not confirmed; the symbol list is not readable |

**How a cost line is applied.** Each copy's legs keep Polymarket's price path
(the kit's marks): the venue line's net = the copy's gross before costs (the
same legs priced with no fee, spread or funding) − the venue's taker fee on
both legs of every part (the exit's notional scaled as the kit's `leg` does) −
the venue's half-spread on both legs where one is known, else Polymarket's
measured half-spread as a stand-in (flagged) − funding (Polymarket's hourly
funding as the stand-in). Copies in markets the venue does not list are left
out of its line, counted.

**What it leaves out:** the price difference between venues (the basis); the
venue's own spread, depth and slippage at $1,000; its funding schedule (8-hourly
on Binance; swaps on Finotive); its trading hours (a CFD's sessions against
24/7 perps); its margin and liquidation rules; its account limits (a drawdown
rule can close an account the paper line keeps open); and Finotive's rule on
copying.

**Each line's break-even** is printed for every line: the gross per copy
before costs, with its lower bound — "it pays at any round trip below X bps".
The Polymarket line is the main reading itself. The Binance line uses 0.05% a
side (10 bps a round trip, 9 with BNB) until the owner gives a measured spread
and tier. The Finotive line has no official figure to use: it waits for the
owner's own platform figures (commission per side by asset class, a typical
spread, the swap), fixed by a dated decisions entry before they are used (Q7).

## 5. The page

**Where it lives and how it gets its data.** One static file,
`F:\polymarket-follow\paper\page\index.html`, written by the daily run after the
copies are computed, from the same objects the log records; its data is
embedded in the file, its style inline, no script loaded from anywhere, no
server, no port. The owner opens it from a shortcut.

**Why this is the simplest fit with the planned stack.** CLAUDE.md plans React
19 + Vite (web) and Express (api) on ports 3300 and 4300, and nothing of either
exists yet (only `apps/poller`; the skeleton comes after the v1 plan). A static
file needs none of it, cannot be written to by its reader, keeps working when
nothing else runs, and adds no process for the check task to watch. Its
generator is one TypeScript module in the experiment's code, so the page's
rows are typed objects (Zod-parsed when the log is read back).

**How v1 reuses it (notes only, no code now):** v1's "Paper log" (R7, page 5)
replaces the file: the same scorer prices v1's favourites with their real alert
instants (in place of R8's D) and the book read at the follow instant (R3 Q7);
the page's row objects become the API's replies, read from the database by the
React page; the experiment's arms stay on the page as their own runs; R7's
words and rules (no sort by result; "too few" states; no verdict below a bar)
already hold here.

**How the page guards against a rule change:** R0 (the frozen hash checked at
every run; a mismatch writes no page), R15 (no knobs, five fixed lines, no
verdict between looks, the band at the next look's z with "a crossing between
looks decides nothing", no sort by result), R16 (a new idea is a new arm). The
page prints the frozen hash and the freeze's date in its top band, and the
sentence: "The rules were frozen on <date> before any result after 7 November
existed; whatever this page shows, they do not change." At each look the
supervisor checks the hash chain (each day's log carries the frozen hash)
before reading the result.

## 6. The build, in parts

**Where the code lives:** inside `apps/poller` — the one API client's program.
- `src/paper/` (TypeScript strict, Zod at every boundary, pino, vitest): the
  readers, the store, the extensions past the cut (R3, R9's panel, R8's END,
  R10's END, R6's rule-book checks), the lines, the beside lines, the
  statistics, the page, the look.
- The four routes join the client's `ROUTES` (`fills` weight 10,
  `mark-history` 5, `klines` 5, `funding` 10) with their schemas; `fills` is
  parsed with ids kept as source text (Node 24.13's `JSON.parse` reviver
  `context.source`, tested here on 2026-11-12).
- A second entry point `dist/paper.js` (`daily`, `look <k>`, `rehearse`) runs as
  its own process with its own `RestClient` instance (share 120, burst 15 — the
  burst becomes the client's parameter; the poller passes 30, as now) and its
  own `Recorder` root; the live poller's behaviour does not change.
- `research/kit/` (33 files) and `research/find-6-exits/lib-exits.mjs`,
  **byte-identical**, loaded at run time by path and typed by TypeScript
  interfaces in `src/paper/`. They are excluded from ESLint and Prettier, and
  **`.gitattributes` needs `apps/poller/research/** -text`**: the kit's files
  have CRLF line endings (checked 2026-11-12) and the repository's
  `* text=auto eol=lf` would rewrite them, breaking every hash.
- `deploy.ps1` copies `research/` into the run copy; `register-tasks.ps1` adds
  "polymarket-follow paper": daily 04:00Z, node.exe itself running
  `dist\paper.js daily`, S4U like the others, one instance, start when available
  (a missed run is made up when the PC is back).

**The parts, in order** (each ends with `pnpm verify` green and a commit by
name; no part reads anything after the cut before part 5's freeze):

| Part | What | Its checks |
|---|---|---|
| 0 | `.gitattributes`, the vendored kit and lib-exits, their loader and types | a test: `checkKit()` returns the pinned fingerprint from the repo's copy, lib-exits its hash; one changed byte fails |
| 1 | the four routes, the parse that keeps ids, the experiment's client instance, the read-through pointers, holes, the sweep's cap, the files and manifests | synthetic replies through a fake `fetch`: windows [start, end), resume, a failed read keeps P, the cap makes a hole, a row with an id above 2^53 kept exactly, a rejected reply kept raw; **a whole Monday on fake timers: at most 120 a minute and 15 in 5 s, nothing 02:35–03:50Z** |
| 2 | the seed (R3) and the panel join (R9) | the seed equals the kit's `readAccount` fill for fill except rows with ids above 2^53 (counted); the joined market object equals the kit's `marketFrom` on every pre-cut panel file (every array, bit for bit) |
| 3 | the scorer: entries, labels, habits, lines, both readings, the beside lines, the statistics, the verdict function, the page | synthetic worlds for every rule (R4–R15), each output asserted; the mutation check of everything that decides (R5–R12) — a crash or a timeout counts as killed |
| 4 | **the reproduction on the old weeks** (END = CUT, the kit's data): FIND-6-EXITS's 1,918 copies — exits copied, held 24 h (= FIND-6's `netBps`), D = 0 — equal to 1e-9 bps; X3's 1,366 copies, both readings; FIND-3's d of every entry; the kit's labels at every Monday (`pool-weeks`, 26 Mondays); the main line's counts (C1: 1,137 entries and 157 traders in the last 4 weeks; FR1: 525 and 61 for 10 cycles) | **no new week is priced before all are equal**; a difference is allowed only for accounts with ids above 2^53, each listed; a rehearsal page on the old weeks, marked "rehearsal on weeks already studied" |
| 5 | **the freeze:** `rules.md` final, `FROZEN.sha256`, the favourites list; a fresh rules review (a different model, as FIND's); the supervisor records the hash in decisions | the review's verdict "may run"; the hash in decisions before any run after the cut |
| 6 | the first run (the backlog), then daily; the owner's task registration | the run log's counts and budget; the page; the supervisor's access scan (no outcome read before the freeze) |
| 7 | each look: `paper.js look k`, once; a report `docs/reviews/paper-look-<k>-<date>.md` with its page for the owner; a Final review that recomputes the deciding numbers with independent code | the look's head prints the frozen hash; the review's recompute equals it copy by copy |

**The docs the build updates:** architecture (the experiment's program, files,
page, task), external-apis (the fills paging facts of P1, the idle reply, ids
above 2^53 parsed exactly, the daily market-data cost), current-task, decisions
(the build's technical calls; the freeze's hash), and in its closing message
what belongs to code-rules (vendored frozen code; the `-text` attribute; the
`context.source` parse) and to the plan page, which the supervisor keeps.

## 7. The looks

**What each look's report shows the owner, in plain words** (one page first,
then the tables of R14):
- how many paper positions the main line has, from how many traders, over how
  many days, and how many are still open (marked at the look's date);
- the money: what a $1,000 position made or lost on average, after fees,
  spread and funding, with its band;
- the judgement: whether the positions did better than random trades in the
  same market and hour, which takes the market's own direction out;
- **the verdict** — keep, drop or too few to tell — and what it means
  (APPROACH-REVIEW C6), with this sentence: **"Keep and drop are verdicts on
  this test, never instructions to trade."**;
- the round-trip cost below which each line would have paid, and each venue's
  costs against it;
- the lines beside, with the words "they decide nothing";
- what could have fooled the test this time: one account, one day, the open
  positions, the competition's days, the realized noise against the plan's.

## 8. The dated items, each ruled with a recommendation

- **The exams of 2026-11-30 and 2026-12-19** (round 2's CONFIRM; nothing is
  registered to confirm): **close both as exams**; 2026-12-19 becomes L1. A.0-11's
  "the new weeks are read at the two exams and at no other time" is replaced, for
  the pool's fills and the market data, by this experiment's frozen rules from
  its freeze; every other study's use of the new weeks stays sealed until a later
  batch declares its slices (COLLECTOR-PLAN §1.3, item 6). The weekly storage of
  exam lists (decisions 2026-11-10 (10)) is replaced by the experiment's daily
  capture. *Recommendation: yes.*
- **D1, the classifier v2's blind test, after 2026-11-21:** as planned (its own
  brief, its own read of the 100 holdout accounts' fills for 2026-11-07 →
  11-21, one paged read an account — P1: an idle account one call, a
  directional week 1–7 pages — never on a Monday morning, a fresh blind
  labeller).
  The experiment never reads a holdout account and keeps classifier v1 for its
  whole run; if v2 passes, its labels are shown beside, never swapped in.
  *Recommendation: yes.*
- **D2, R8's B2 confirmation (weeks 9–12, 2026-11-02 → 11-30), after
  2026-11-30:** 45 of R8's 50 accounts are in the experiment's capture; 5 are
  holdout accounts (`out/c1/result.txt`), so D2 reads those 5 itself, after D1
  is scored. By R8's frozen rules; it decides nothing for the experiment.
  *Recommendation: yes, after D1.*
- **The collector's small follow-ups** (COLLECTOR-REVIEW, as ruled): the build
  touches the client, so **`once.js` is deleted in part 1** (it is the second
  client the review warned of; `paper.js` replaces the need with its own share);
  the boards' `consistent` flag and the late-book coverage mark are not touched
  (the experiment reads books by server time, so it does not need the mark).

## 9. Risks, and how each is caught

| Risk | How it is caught |
|---|---|
| **An account's capture gaps** (a failed read, a rejected row, the sweep's cap) | holes in `state.json`; a window with a hole is not covered (R3, R5); a hole inside a copy's chain flags it a gap copy (R11), printed with and without; the page lists holes; a failed read is retried the next day from P |
| **API changes** (a field, a meaning, a weight) | Zod at the boundary: a failing reply is kept raw and logged, never guessed; unknown keys logged once a day; a change of meaning shows as chain breaks (R11) and as counts the page prints daily; 429s back off and are counted; a schema fix is a code fix (R0), never a rule change |
| **A day the script misses** (PC off, an update) | the read-through pointers: the next run reads from P; Task Scheduler's "start when available"; the page says "data through <date>" and warns when it is over 36 h old; all inputs but the collector's books stay re-readable from the API's history |
| **The cut's edge** | entries count from t ≥ CUT only; a group whose first fill is before the cut is no entry even if merged fills follow; labels and habits of the first Mondays read the seed and the API together, and the seam is checked by `chainBreaks`; no mark, kline or funding row before CUT is read from the API |
| **The 3-cycle line's unknown noise** | measured, not assumed: each look prints the realized SE and the smallest edge visible at the next look; nothing in the rules depends on it |
| **List decay** (no new accounts join the pool) | the page prints copies and traders a week; each look compares them with the planned rate (284 a week, 157 traders); decay costs power, not honesty; a wider universe is a later arm |
| **The competition's days** (competition 1 covers 2026-11-07 → 11-16 14:30Z) | the COMP lines (R13) for every competition the collector's rule book lists; a result that lives only inside them is named so |
| **Two clients share the bucket** | each admits its own share; shares sum to 170 a minute and 27 in 5 s; the run log prints its peak minute and burst |
| **The vendored code is altered by git** | `-text` on `research/**`; `checkKit()` at every start |
| **A reader is tempted to change a rule** | R0, R15, R16; the hash in every day's log; the supervisor's check at each look |

## 10. Questions, each with a recommendation

1. **The main line and the 24 h cost map.** The decision says "openings and flips
   in the primary cells" — in the kit's words the map is part of a primary cell
   (A.1-8), as in FIND-3's main set — but it quotes FR1's 284 a week from 157
   traders, which used no map. With the map (24 h, taker, the entry's own
   direction: open for longs in 71 of 84 markets, for shorts in 78) the main line
   keeps 224 a week from 149 traders, 21% fewer (`out/c1/result.txt`).
   *Recommendation: no map in the main line,* the map-closed copies printed apart:
   the accepted counts and power assume it; the money reading copies the
   trader's exits, not a 24 h hold; the map was measured on FIND's 65 days.
2. **Read the whole pool weekly** (1,602 accounts; about 32,000 tokens on
   Mondays) rather than a frozen read list (the 820 accounts directional at least
   once since the launch week)? *Recommendation: the whole pool* — the accepted
   design lets every pool account qualify by its own trading; the list would
   shut out accounts that turn directional later.
3. **The Monday sweep's page cap:** 10 pages (1,000 fills) an account-week,
   beyond which the account is not covered for the next two Mondays. The busiest
   directional week measured needed 7 pages; nearly every algorithm needs more.
   *Recommendation: 10* (20 would add about 18,000 tokens on Mondays); its effect
   printed every week (accounts capped, and their last label).
4. **The code inside `apps/poller`** (its client, its file format; a second entry
   point and task), with the kit and lib-exits vendored byte-identical as
   frozen JavaScript — an exception to "TypeScript strict" for frozen research
   code? *Recommendation: yes.* The alternative, a new app with a shared client
   package, moves the live collector's code for no gain now; a TypeScript port of
   the kit would no longer be the frozen yardstick.
5. **Your favourites count from the freeze, not from the cut,** at most 20, given
   before the freeze; any later addition a new arm with its own start.
   *Recommendation: yes* — you may have seen their trading since 7 November, and
   Iron Rule 4 judges a trader only after following starts.
6. **Five lines on the page, the rest only at the looks.** *Recommendation: yes* —
   fewer numbers to over-read every day, and "after a jump" stays unseen for the
   later batch that wants it until L1.
7. **The Finotive line,** given that its terms prohibit copying third-party
   trades and signal providers (§7.10): print it as a cost comparison with the
   rule quoted beside it, once you give its figures from your platform, or leave it
   out? *Recommendation: a cost comparison only, the rule beside it* — the line
   describes costs, never a way to use an account; the decision is yours.
8. **Close the exams of 11-30 and 12-19, and make 12-19 the first look.**
   *Recommendation: yes* (section 8).
9. **D1 after 2026-11-21 and D2 after 2026-11-30, D2 after D1.**
   *Recommendation: yes* (section 8).
10. **The experiment's share: 120 tokens a minute, 15 in 5 s; the first run at
    the same share** (about 16 hours). *Recommendation: yes;* raising it is your
    call, the collector's 50 unchanged.
11. **The first keep or drop ends the test** (R12; later looks print, marked
    "after the verdict"). The accepted design names the three looks and the
    spending but not what follows a verdict; stopping at the first crossing is
    what the spending assumes. *Recommendation: yes.*

## 11. Evidence list

All in the supervisor folder's `workers/PAPER-PLAN/` (SHA-256):

| File | What | SHA-256 |
|---|---|---|
| `scripts/c1-counts.mjs` → `out/c1/result.txt` | counts before the cut: the pool, labels, the lines with and without the map, R8's 50 against the holdout, the map's open markets | `0f23933d…ef66` → `8bd6e2b0…e977` |
| `scripts/c2-market-calls.mjs` → `out/c2/result.txt` | the kit's own call log: weights, rows a reply, tokens per market-week | `3266e61d…2af2` → `16fa70dc…9ffb` |
| `scripts/p0-pick.mjs` → `out/p0/pick.json` | the probe's account-weeks, chosen from the kit's derived data | `06b2255a…10d5` → `8f775ed0…ed5b` |
| `scripts/p1-fills-probe.mjs` → `out/p1/result.txt`, `out/p1/raw.jsonl` | the 10 API calls (windows before the cut) and their raw replies | `56c3cb6d…4c9c` → `6fe13452…19fa`, `80466b4f…8f62` |
| `scripts/c3-budget.mjs` → `out/c3/result.txt` | the budget arithmetic and the live-polling comparison | `96d64c44…fb4b` → `1a439cff…91d6ab` |

Inputs read (pinned or printed by the scripts): the kit `2d3667b5…09aa` (33 files
checked); `KIT\derived\pool-weeks.jsonl.gz` `5a7dbae3…fa5f`, `pool-labels-cut`
`58c25174…73f5`, `pool-entries` `3f9c84ab…3f9f`; `KIT\calls.jsonl` `89d58c93…b94d`,
`done.jsonl` `2b14ecdd…87ce`; `inputs/lib-exits.mjs` `612d5836…6330`.

Web pages (read 2026-11-12, 11:12–11:21Z; "search extract" = known only through
a search engine's summary of the official page):
- Finotive Funding: `finotivefunding.com/rules` (page); `/terms-and-conditions`
  (page, the first 100,000 of 132,113 characters; §1.7, 4, 6.4, 7.2, 7.4, 7.5,
  7.7, 7.9–7.17, 8.8, 10.4); `help.finotivefunding.com/en/articles/955-can-i-copy-trades-from-another-person`
  (page, no date shown); `/trading-symbols` (its table loads by JavaScript).
- Binance: `binance.com/en/support/faq/binance-futures-fee-structure-fee-calculations-360033544231`
  (page, updated 2026-05-01); `binance.com/en/support/faq/360033525031`, the
  funding FAQ (search extract); gold and silver TradFi perpetuals: The Block,
  2026-01-08 (`theblock.co/post/384743`), a press report, not Binance's own page.
- Polymarket Perps: external-apis (fees, funding, geography), not re-read.

*This is research, not advice on what to trade.*
