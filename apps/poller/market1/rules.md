# MARKET-1's rules (rules.md)

Frozen by hash before any MARKET-1 result after the cut exists (M0). The plan: `docs/reviews/market-plan-2026-11-13.md`, section 1;
its review's fixes F1–F19 (`docs/reviews/market-plan-review-2026-11-13.md`)
and the rulings of decisions 2026-11-13, "MARKET-1's plan approved", are
folded in. Where a rule names code, the code in `apps/poller/src/market1/`
(compiled to `dist/market1/`) does exactly that; a test pins each rule.
Every number here is fixed now. MARKET-FIND's old-weeks figures are quoted
in brackets as exploring prints, deciding nothing.

*Keep and drop are verdicts on this test, never instructions to trade.*

## M0. Identity and what is frozen

- MARKET-1 is one arm with one deciding line, **WAVE**; every other line is
  beside it and decides nothing. A rule change after the freeze is a new arm
  with its own start instant, lines and budget; the frozen arm runs on.
- **Frozen together, what runs** (`market1/FROZEN.sha256`, sha256sum format,
  paths relative to the package folder, LF bytes as committed): the program
  `dist/market1.js` and every file of `dist/market1/`; the eleven files of the
  paper experiment's program it imports or reads with (F8) —
  `dist/paper/instants.js`, `store.js`, `routes.js`, `rulebook.js`,
  `market.js`, `research.js`, `seed.js`, `stats.js` (imported) and `loop.js`,
  `reader.js`, `reparse.js` (they write what MARKET-1 reads), byte for byte
  as the paper experiment's freeze lists them; every file of `research/` (the
  kit, fingerprint
  `2d3667b5ce90645b41dfee4e6fc425ab3e64c985cb4973bfed6ece5052c409aa`, and
  lib-exits `612d58365ba4c2a2d88a3f73a41a08e193d0874458d862b169fc51f218926330`);
  every file of `market1/` (this file). The list's SHA-256 and the tag
  `market1-freeze-1` are recorded in decisions before the first run after
  the freeze.
- **Every run starts by checking them** (`gate.ts`): the list exists, names
  every file of what runs, and each has its hash; the kit's `checkKit()`
  returns its fingerprint and lib-exits its hash. Otherwise the run writes one
  line, "frozen files differ", and stops (exit 4): nothing sealed opened, no
  page.
- **The sealed-data gate:** no file of the collector's recordings, no
  document of its database (the rule book) and no file the paper experiment
  wrote after the cut (`state.json`, `fills\`, `panel\`) is opened for a
  window that reaches the cut unless that check passed; every reader of them
  takes the gate and refuses first (`checkSealed`). With the gate closed a
  reader also refuses any datum at or after the cut.
- **Shared code** (the logger, the lock, the clock, the schedule) is not
  frozen; each day's log lists the hashes of the shared files the run used
  and Node's version (information, not a stop).
- **A code defect** (the code not doing what this file says) is fixed only
  through a decisions entry that names it, before the next look, with the
  diff, a test that failed before the fix and the list of positions whose
  numbers changed; never a number of this file. A fix is a new list
  (`market1-freeze-2`, …). **A change to one of the eleven paper files** (a
  paper experiment's defect fix) stops MARKET-1 the same way until the
  supervisor's decisions entry re-freezes it with no rule of this file
  changed; a paper fix to any other paper file needs no re-freeze.

## M1. Instants

- **CUT** = 2026-11-07T00:00:00.000Z, the paper experiment's: the pool's
  fills are read from it.
- **START** = 2026-11-11T00:00:00.000Z, the first whole UTC day of the
  collector's books (recorded from 2026-11-10T20:59:54Z; the first three
  hours, to 00:00Z on 2026-11-11, are left out so that every day cluster is a
  whole day). WAVE and every line beside it count entries with t ≥ START,
  but P (M12).
- **A run's END** = 00:00Z of its UTC day; nothing at or after END is used.
- **The looks:** END₁ = 2026-12-19T00:00Z, END₂ = 2027-02-06T00:00Z,
  END₃ = 2027-05-08T00:00Z (the paper experiment's).
- Times are ms since the epoch in the server's time (a fill's `timestamp`, a
  book frame's `ts`), but the recordings' file and coverage times, which are
  our wall clock. **"The 60 minutes up to t"** is [t − 3,600,000, t], both
  ends included; every other window [a, b) includes a and excludes b. A UTC
  day is [00:00Z, 00:00Z + 24 h); a week runs Monday 00:00Z to Monday 00:00Z.

## M2. Who, and their fills

- **The pool:** the paper experiment's (its R2): the 1,602 accounts of the
  kit's `population.json` that are not holdout accounts. No account is ever
  added; no other account's file is opened.
- **Their fills, as the paper experiment stores them** (its R3, R3a), read
  only and never while a paper run is live: first the paper experiment's
  lock and heartbeat (`STATE_DIR\paper.lock`, `paper-heartbeat.json`) are
  read by the shared lock's rule (a holder alive with a heartbeat under 2
  minutes old is a live run); while a run is live MARKET-1 checks again
  every minute, and after 6 hours it stops (exit 5) with nothing written but
  its log (F2). Then `PAPER_ROOT\state.json` (each account's read-through
  instant P and its holes) **first**, then each pool account's
  `fills\<addr>.json.gz`, each file read whole and closed at once; a row
  counts only when its timestamp is at or after CUT and below that account's
  P as read from that state (a file rewritten after the state was read adds
  nothing). Both are parsed by the paper experiment's own frozen schemas.
- **Not seen:** an account's fills at or after its P, or inside one of its
  holes (page cap, safety cap, rejected rows, account not found); they are
  counted at the looks (M13); a later run sees what the paper experiment has
  read by then.
- **The procedure:** no paper command (`daily`, `look`, `reparse`) is started
  by hand while a MARKET-1 run is live (the supervisor's and the owner's
  rule; F2).
- MARKET-1 reads no fill, or anything else, from the API.

## M3. The coins

- **The small coins, fixed:** 8 SOL, 10 HYPE, 31 PUMP, 32 ZEC, 33 XRP, 34 LIT,
  35 KPEPE, 54 AAVE, 55 UNI, 56 WLD, 57 NEAR, 58 KSHIB, 59 FARTCOIN, 60 DOGE,
  61 ENA, 62 ONDO, 63 SUI, 64 VVV, 65 TAO, 66 ADA, 67 ZRO, 68 BNB, 69 PONS,
  70 CASHCAT, 71 USELESS, 72 KAITO, 73 ARB, 74 LDO, 75 AVAX, 76 LTC, 77 XPL,
  78 XMR, 79 LINK, 80 VIRTUAL, 81 JUP, 82 ETHFI, 83 PENDLE, 84 MORPHO (38;
  instrument ids): every crypto market of the kit's rule book but 6 BTC-USD,
  7 ETH-USD and 96 PRL-USD, all listed before START. A market listed later is
  never a small coin here: its pool liquidations are printed (M13), never
  counted toward a wave.
- **The large markets,** for the lines beside only: 6 BTC-USD, 7 ETH-USD.
- **Tradable at t:** the collector's rule book (its database's `rulebook`
  collection), read through the paper experiment's `parseRuleBook` as its
  R6 (3) reads it, shows no close-only state, settlement or absence from the
  market list recorded on or before t's UTC day (`leftOutFrom`). An entry
  needs its market tradable at t; a fill counts toward a wave whatever the
  state. Each coin left out is printed on the page and at a look, with the
  day and the record that left it out (F15).

## M4. A liquidation fill

- **A counted fill:** a row of M2 in a small coin with `liquidation` true,
  `taker` true, and `previous_size` non-zero and of the opposite sign to the
  fill's side (long +1, short −1). Its side is the **forced side**: short is a
  forced sell (a long closed), long a forced buy (a short closed). Its instant
  t is its `timestamp`; its account, its address.
- **Order:** by (timestamp, instrument_id, address, trade_id compared as a
  whole number of any size); only fills at the same millisecond need more
  than the timestamp.

## M5. The wave and an entry — WAVE

- **The wave state** for a side σ at t: at least **two different** pool
  addresses have a counted fill of side σ, in any small coin, with its
  instant in the 60 minutes up to t. Every counted fill with such an instant
  counts, this fill's account and a fill of the same millisecond that sorts
  after it included.
- **An entry:** a counted fill f at whose instant t the wave state holds for
  f's side, when f's market has had no entry with an instant in the 60
  minutes up to t, of either side. The rule runs over every counted fill
  from CUT in M4's order, so an entry before START still blocks.
- **WAVE's positions:** the entries with t ≥ START whose market is tradable
  at t (M3).

[Old weeks, 2026-08-31 to the cut: 153 entries on 47 days in 30 markets, 114
forced sells and 39 forced buys; +309.7 ± 67.7 bps gross on marks, net
+297.1 ± 67.8 on MARKET-FIND's additive costs.]

## M6. The position

- **Against the forced side:** long after a forced sell, short after a forced
  buy (dir = +1 or −1). **$1,000** of notional.
- **Opened at x_in = t + 120,000 ms; closed at x_out = x_in + 86,400,000 ms.**
  No stop and no other exit. Positions overlap freely, in one market too; a
  long and a short in one market are two positions, never netted.

## M7. The price at the recorded book

- **A recording day** is a folder `RECORDINGS_ROOT\<UTC date>\`; it is
  **closed** when it holds `manifest.json`, and **missing** when it has no
  closed folder while a later day's folder is closed.
- **A book line:** a line of the collector's `book-HH.jsonl.br` in a closed
  day, the file's SHA-256 equal to its manifest's, whose text parses by
  MARKET-1's own Zod schema of the documented frame — `ch` "book::<iid>",
  `ts` an integer, `data.b` and `data.a` arrays of levels, each level at
  least [price, size] as decimal strings. A line that fails is dropped and
  counted. A line's instant is its frame's `ts`, never our receive time.
  For an instant x the files of x's UTC hour, the hour before and the hour
  after are read (a file is chosen by receive time, and a frame can arrive
  seconds late).
- **A day's alarm** (F18): when more than 1% of a closed day's book lines,
  and at least 10, fail the schema, the whole day is a gap and the page and
  the log say so.
- **The book at x:** the last book line of the market with `ts` ≤ x in those
  three hour files; none there is "no book line".
- **Live at x** when (1) that line's `ts` ≥ x − 3,660,000 ms — the collector
  writes every live market's book at the start of each hour, so an older line
  means a gap — and (2) no gap covers x.
- **A gap**, from the `coverage.jsonl` of every closed day, read in time
  order (each event's time is our wall clock; every gap is widened by 60 s on
  both sides): a `market_stall` of the market to its next `market_resume`; a
  `ws_close` of a `book-` connection, from its `lastFrameAt` (else the
  event), to that connection's next `ws_resumed` (its `firstFrameAt`) or
  `ws_open`, for every market (the record does not say which markets a
  connection holds); a `sub_refused` of a `book::<iid>` channel: that
  market, to that connection's next `ws_open` (the collector marks no stall
  for a refused channel); a `process_stop` to the next `process_start`, and a
  `process_start`'s `lastHeartbeatAt` to that start; a recordings `disk`
  event in state `stop` to the next recordings `disk` event in another state;
  a `write_failed`, `cut_line_dropped` or `compression_failed` naming a book
  file: that file's hour; a book hour file missing from a closed day's
  manifest or folder, failing to decompress or differing from its manifest:
  its hour; a day with the alarm, a day whose `coverage.jsonl` is missing,
  differs from its manifest or holds a line that does not parse, and a
  missing day: the whole day. A gap opened and not yet closed in the days
  read runs to the end of time.
- **Pending, not a gap** (F3): a leg at x waits, unpriced for now, until the
  UTC day after x's day is closed or missing; the next run prices it.
- **Usable** when both sides hold at least one level with price and size
  above 0 and the best bid is below the best ask; the walk uses only such
  levels, asks sorted ascending and bids descending by price.
- **The walk, as a taker.** Opening: $1,000 of notional taken from the asks
  (a long) or the bids (a short), best level first, q = min(size, the notional
  left ÷ price) at each; Q = Σ q; **p_in = 1,000 ÷ Q**. Closing: Q units taken
  from the bids (a long) or the asks (a short), best level first, q =
  min(size, the units left); **p_out = Σ(price × q) ÷ Q**. What the levels
  cannot fill is filled at the last level's price, and the leg is flagged
  **"depth short"**.
- A level's size is in the instrument's base units, as a fill's quantity
  (the WebSocket spec's book levels). Prices and sizes are read into doubles
  (the kit's convention for research figures; no money moves).

## M8. The mark fallback, and unpriced

- **A leg whose book is not live or not usable is priced at the mark:** the
  kit's `markAtMinuteEnd` at x (the mark at the end of x's minute, at most 5
  minutes stale) on the market object the paper experiment's R9 builds (the
  kit's pre-cut panel joined with the paper experiment's market-days through
  the first missing day), bought at mark × (1 + c) and sold at mark × (1 − c),
  c the kit's taker spread at x (R8's session-pair table: half-spread and
  depth for $1,000). The position is flagged **"mark-priced leg"** with the
  reason (no book line, stale, gap, not usable, the day's alarm).
- **A leg with neither is unpriced,** by reason ("no book and no mark at the
  entry", "… at the exit"; "funding without a mark", M9). An unpriced
  position is left out of every mean, counted and printed, never guessed. A
  market settled during a hold leaves it unpriced this way.
- **Pending:** a position whose leg is pending (M7) or whose market object
  does not yet reach x_out (a market-day of the paper experiment not yet
  read) is priced by a later run.

## M9. Fees, funding, the net

- **Fee** on each leg: the base-tier taker rate at the leg's instant — the
  paper experiment's R9 (`bookTaker` on the collector's rule book; when the
  recorded schedule has no row for the market's category, or before its
  first record, the kit's `feeAt('taker', …)`, 4 bps, which is the case for
  every coin of M3 today) — times the leg's notional (1,000 at the entry,
  p_out × Q at the exit). Never a lower tier or a rebate. Each run's log lists
  the categories of the latest recorded schedule; the page raises an alarm
  only when a recorded schedule or override changes the rate a leg of these
  markets uses away from 4 bps; the verdict is never withheld for it (F9).
- **Funding:** every settlement whose nominal hour lies in (x_in, x_out], by
  the kit's `fundingBetween` on the same market object (Σ rate × the mark at
  the end of the minute before the hour; a positive rate: longs pay). A
  funding hour without a row is charged nothing and counted; a settlement
  without a mark leaves the position unpriced.
- **In bps of the $1,000:** gross = dir × (p_out − p_in) × Q ÷ 1,000 × 10⁴
  (spread and depth inside); fees = (f_in × 1,000 + f_out × p_out × Q) ÷ 1,000
  × 10⁴; funding = −dir × Σ × Q ÷ 1,000 × 10⁴; **net = gross − fees +
  funding.** With both legs at the mark this is the kit's `leg` exactly.
- **Also kept per position,** for the prints: the **gross on marks**,
  dir × (the mark at x_out ÷ the mark at x_in − 1) × 10⁴ (the kit's marks at
  the minutes' ends, the kit's reading); the **excess**, the gross on marks
  − dir × BASE (M12) of its market and x_in's block; the entry's cost at the
  book (dir × (p_in ÷ the book's mid − 1) × 10⁴); the deepest level walked;
  its flags.

## M10. The deciding set and the statistic

- **The set of look k:** WAVE's positions with x_out < END_k.
- **x** = a position's net in bps, each position alike; **m** = the mean over
  the priced ones.
- **SE** = √max(V_day + V_market − V_both, V_day, V_market): V_day, V_market
  and V_both the kit's CR1 variances of the mean (`cr1Test`) clustered by
  the UTC day of t, by the market, and by the (day, market) pair.
- **z:** L1 2.81, L2 2.43, L3 2.17 (two-sided 0.5%, 1.5%, 3%: 5% in all;
  KEEP, one-sided, spends half of it) — the paper experiment's spending.

## M11. The verdict

- **WITHHELD** when more than **10%** of the set is not priced at the book: a
  position with a mark-priced leg, a depth-short leg, or unpriced (F6).
- **TOO FEW TO TELL** when SE cannot be computed, or when the priced
  positions span fewer than **20 UTC days** (of t) or fewer than **10
  markets** (F5).
- **DROP** when m + z·SE < **δ = +50 bps** (the owner's line).
- **KEEP** when m − z·SE > 0 **and** the mean excess (M9) over the set's
  priced positions with a BASE cell is above 0 (F1: a market's drift cannot
  pass as the effect); positions without a BASE cell are left out of that
  mean and counted.
- When KEEP and DROP both hold, **DROP**. **TOO FEW TO TELL** otherwise.
- **The sentence:** at L3, TOO FEW TO TELL with an SE: "No mean result as
  large as X bps a position was seen.", X = m + z·SE; otherwise "Keep and drop
  are verdicts on this test, never instructions to trade."
- The first KEEP or DROP is the test's verdict; later looks print their
  figures marked "after the verdict". Only WAVE carries a verdict.

## M12. The lines beside — deciding nothing, no verdict word

Each is priced as M6–M9 (the book, else the mark) unless said, from its own
instants with t ≥ START (but P), each position needing its market tradable
at t (M3), and printed in three readings: the net at
the book; the gross on marks; and the excess (the gross on marks minus dir ×
BASE). Its statistic: M10's two-way SE when it spans several markets, the
CR1 SE by day for a single market. Each look's set: its positions with
x_out < END_k. [Old weeks, MARKET-FIND, gross on marks unless said.]

- **B1 EPISODES** — every 60-minute episode: a counted fill whose market's
  previous counted fill (in M4's order) is more than 60 minutes before it,
  or none (episodes chain while the gap is at most 60 minutes); against its
  side, x_in = t + 2 min. [386, 383 priced: +131.9 ± 35.1; net +119.5 ± 35.3]
- **B2 ALONE** — B1's episodes at whose first fill the wave state does not
  hold for its side. [254: +22.0 ± 34.9]
- **B3 LATE** — WAVE's positions entered at t + 60 min and at t + 180 min
  instead, each held 24 h. Printed right under WAVE's verdict. [+292.9 ±
  72.7; +309.6 ± 83.1]
- **B4 COINS** — B1's episodes at whose first fill at least two different
  small coins have a counted fill of its side in the 60 minutes up to it.
  [164: +274.7 ± 58.9]
- **B5 THREE** — B1's episodes at whose first fill at least three different
  accounts have one. [76: +434.5 ± 97.1]
- **B6 SIDES** — WAVE's forced sells and forced buys apart. [+274.2 ± 84.1;
  +413.4 ± 98.0]
- **B7 LARGE AT THE WAVE** — at each WAVE position, BTC and ETH, each against
  the forced side, at the same x_in and x_out. [the excess, by day: BTC +61.6
  ± 37.4, ETH +111.3 ± 48.7]
- **B10 LARGE ON THEIR OWN** — B1's rule in BTC and in ETH, from their own
  counted fills (M4 with 6 and 7 in place of the small coins), faded. [222:
  the excess +5.3 ± 24.4]
- **B11 THE TAIL** — WAVE's, from the first day: the worst UTC day (the
  lowest sum of net by the UTC day of t), the largest fall from a peak (the
  running sum of those day sums), the most positions open at once (the most
  with x_in ≤ y < x_out at any x_in = y), the worst position and the worst
  5%'s average (the lowest ⌈5% of n⌉ nets). [on MARKET-FIND's additive net:
  −1,875 on 2026-09-09 over five; 2,370; 19; −1,101.9; −699.4]
- **OWN, the coin's own part** (F1) — WAVE's gross on marks minus the mean
  move, over the same instants, of the other small coins with both marks (at
  least 5 of them). [+74.9 ± 48.7]
- **P BEFORE THE BOOKS** — M5's entries with t in [CUT, START), every leg at
  the mark (no book was recorded), flagged; their windows count no fill
  before CUT (the store starts there).
- **C COMPETITIONS** — WAVE without the positions whose t lies in a
  competition window the collector's rule book lists; and WAVE without those
  in a market boosted above 1 by a competition whose window holds t.
- **S THE MARKET'S DIRECTION** — WAVE by UTC month of t; and by the sign of
  the small-coin basket's move over the 7 days before t (the mean, over the
  small coins with both of the kit's marks, of the mark at t − 1 min ÷ the
  mark at t − 7 d, less 1; at least 5 coins), crossed with forced sells and
  buys.
- **BASE, the matched baseline** (F10) — for market i and the 4-hour UTC
  block b of x_in: the mean of (marks[j + 1,440] ÷ marks[j] − 1) × 10⁴ over
  every whole minute j in [START, END − 24 h) of market i whose minute lies in
  block b, with both of those minute-end marks present, END the run's or
  END_k at a look. A cell with no such minute has no BASE: its positions'
  excess is left out and counted.
- **Not in this arm** (decisions 2026-11-13, the tiers; F14): T TAPE, R
  RANDOM DAYS, B8 BASKET AT THE WAVE, B9 BASKET AFTER 400, J JUMP, X XREV —
  they may join later as their own arm, frozen apart.

## M13. Prints at a look

For WAVE (and for each line beside, its count and the same statistic):
positions, days, markets; unpriced by reason; mark-priced legs by reason;
depth-short legs; the share not priced at the book and the means with and
without those positions (F6); the money mean with its two-way SE and the
one-way SEs by day, by market and by week; the band with Student's t on day
clusters (df = days − 1); the gross before costs with its lower bound; fees;
funding; the win share; the median and quartiles of the net; the entry's
cost at the book (median, p90) and the mean net of the third with the
highest entry cost; the gross on marks; the excess, its two-way SE and its
lower bound (m_ex − z·SE_ex) and the positions without a BASE cell (F1); OWN;
B11; the mean without the two days that add most, each day left out (lowest
and highest), each market left out; the share of positions on the five
busiest days; positions a week; the pool's activity a week (accounts with a
small-coin fill; accounts liquidated in small coins; the pool's counted
fills); the reader's holes (the pool's holes by cause; WAVE's windows
[t − 60 min, t] that touch a hole of any pool account); the pool's
liquidation fills (M4's test) in crypto markets outside M3; the coins left
out (M3); the days with the alarm (M7); the smallest edge visible at the
next look, (z_next + 0.8416) × SE × √(days so far ÷ days at the next look).
Venue lines (another exchange's fees) are reporting arithmetic outside these
rules. The look's report tells the owner that BASE removes a period's
average drift, not a regime inside it (S beside).

## M14. The daily page

- One static file, `MARKET1_ROOT\page\index.html` (and `positions.html` with
  every position), written after each run's record from the same objects the
  log records; no script, inline style; a link at its top to the paper
  experiment's page.
- **Its top:** what the test is in three sentences; "data through <date>";
  "the pool's trades read through <the earliest P of the pool's accounts
  without a standing hole>"; "the waves are found in the accounts the paper
  experiment has read: within a week about a seventh of them, the rest after
  its Monday read" (F4); the alarms (book lines failing, days with the alarm,
  fees); the coins left out (M3); the frozen hash and the freeze's date, with
  "The rules were frozen on <date> before any MARKET-1 result existed;
  whatever this page shows, they do not change."
- **The verdict box:** "Too early to judge — next look <date>." until look 1
  has run; then exactly "Look k (<END_k's date>): WAVE V." (k the latest look
  run, V its verdict), M11's sentence, and "Next look <date>." unless no look
  is left. Once a look has said KEEP or DROP (the test's verdict, M11), that
  look's two lines stay on show, no next look is named, and each later look
  adds one line, "After the verdict: Look j (<END_j's date>): WAVE V."
  (V its verdict); nothing else.
- **WAVE's headline, on complete weeks only** (F4): the positions with t
  before the latest Monday M at which every pool account's P had reached M
  (or it has a standing hole): positions, days, markets; the running mean net
  with its SE and the band m ± z_next·SE ("the band the next look will use;
  a crossing between looks decides nothing"); B11; mark-priced, depth-short,
  pending and unpriced counts. **The current weeks apart**, their positions
  and count only, labelled "partial: the rest of the pool is read on Monday".
  **The lines beside: their counts only;** their results appear at the looks.
  **The pool's counted fills by week** (F18).
- **Every WAVE position,** newest first (the newest 500 on the page): market,
  forced side, the fill's instant, the accounts in the wave, x_in and p_in
  (the book's, or the mark flagged), x_out, the net (an open one shown at the
  mark at END − 1 ms, labelled "open, at the mark"; a pending one labelled
  pending), its flags, the run date it was first seen.
- **Never on the page:** a verdict between looks; any other line's result; a
  sort by result; a probability; the words follow, copy, signal, edge, skill,
  opportunity, recommend (a test reads its text); colours for a sign.

## M15. Runs, reads and what never changes

- **No API call:** MARKET-1 has no client and no route.
- **A daily run** (after the gate, the paper run's wait and the reads of M2):
  reads the rule book, the market objects and the recordings; recomputes
  every entry from CUT; prices each leg not yet in its record and keeps the
  decision with the book line it used in its own record
  (`MARKET1_ROOT\books\<run date>-<HHMMSS>.jsonl.gz`, named by the run's
  time so that a second run the same day keeps the first's), so later runs
  and the looks reprice from the record and get the same number; keeps each
  closed day's check once (`days\<UTC date>.json`: files, lines, failures,
  the alarm, the coverage events); keeps the run date each position was first
  seen (`seen.json`); writes the day's log (the format counts first: days
  closed and checked, hour files found and not, lines parsed and failed, the
  days with the alarm; then every position's state, with the run date it was
  first seen), the manifest, the backup to `MARKET1_BACKUP` (its own list:
  `books\`, `days\`, `log\`, `manifest\`, `looks\`, `page\`, `seen.json`; a
  file is copied when its copy is missing or differs, nothing deleted there;
  F16), and the page last.
- **An entry can move or vanish** when a later read of the paper experiment
  brings an earlier liquidation in the same market (the block of M5) or a
  second account (a new wave): each day's log keeps what that day computed;
  the looks use the reads as complete.
- **A look k** runs once, on or after the Monday after END_k, when every pool
  account's P ≥ END_k or it has a standing hole, every recording day through
  END_k's day and the day after is closed or missing (F11), and the
  market-days of the 40 markets (M3's and the large) before END_k exist; it
  waits at most 7 days past that Monday, then runs, lists what was missing on
  its first page, prices at the mark a leg whose recording days are not
  final (flagged "recording not final at the look") and leaves pending, so
  not priced at the book, one without its market-days. Its result is
  `looks\L<k>\result.json`; the legs it decides are kept as a run's
  (`books\<run date>-L<k>.jsonl.gz`). A run that crashes before its result
  exists is not a look.
- **MARKET-1's own writes** (its heartbeat, record and page) are written
  whole to a temporary name and renamed; a failed rename is retried once a
  second up to 10 times, and its heartbeat's failure is logged and never
  stops the run (F2).
- **After the freeze** no number, line, coin, threshold, instant or rule of
  this file changes; a new idea is a new arm.
