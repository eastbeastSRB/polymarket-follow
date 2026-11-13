# MARKET-PLAN — MARKET-1, the forward paper test of the liquidation wave: its frozen rules, its data, its build

MARKET-PLAN (Opus 5.5, max), 2026-11-13 03:35Z – 04:14Z (UTC; every stamp
from `date -u`), for polymarket-follow's supervisor. The frame: decisions
2026-11-13, "MARKET-1 to be planned" and "the market lead". The evidence for
the lead: MARKET-FIND (`docs/reviews/market-find-2026-11-13.md`) and
STRATEGY-REVIEW (`docs/reviews/strategy-review-2026-11-12.md`). The templates:
the paper experiment's plan, its review and its frozen `rules.md`. Evidence of
this plan: the supervisor folder's `workers/MARKET-PLAN/` (`progress.md`,
`scripts/`, `out/`; paths below are relative to it). **This is a plan: nothing
is built before a fresh review and the owner's approval.** It plans a paper
test; it never trades and tells no one what to trade.

**The blind store held.** Nothing stamped at or after 2026-11-07T00:00:00Z was
read. Never opened: the collector's recordings, its database, the run folder,
and the paper experiment's data after the cut (`fills`, `raw`, `state.json`,
`page`, `panel`). Read for counts and design, all before the cut: the seed
(`F:\polymarket-follow\paper\seed\`), the kit's panel and its `pool-weeks`
labels (`F:\polymarket-follow-research\KIT\`), the repository (the code read
only; the kit's `rulebook.json`, `price-table.json`), MARKET-FIND's scripts
and outputs (`inputs\`). Listed, names only: `F:\polymarket-follow-research\`,
its `KIT\` and `KIT\derived\`, the seed's files. Four counting scripts, counts
and arithmetic only, no outcome computed. No call to Polymarket's API (none
was needed: MARKET-1 makes none). No agent started; polymarket-lab not
touched; nothing in the repository changed but this file.

## For the owner, in one page

*Words.* A **bp** is 0.01%. **Small coins** are every crypto market but BTC
and ETH (38 here, SOL among them). A **liquidation** is the exchange closing a
trader's position by force; a **forced sell** closes a long. The **tracked
accounts** are the 1,602 accounts whose trades the paper experiment already
reads. A **wave** is at least two different tracked accounts liquidated the
same way in small coins within an hour. A **position** here is a $1,000 paper
position against the forced side. A **look** is one of the three dates on
which the test gives its verdict.

**What MARKET-1 does every day.** At 10:30 UTC a program on your PC takes the
tracked accounts' trades that the paper experiment has already read, finds
every moment a wave was on, and writes down one paper position for it: in the
coin of that liquidation, against the forced side, opened 2 minutes after the
liquidation and closed 24 hours later. Each position is priced at the order
book your collector recorded at that second, as a trader who takes the book
would pay: walking the book for $1,000, with Polymarket's fees and hourly
funding. Then it rewrites a page. It never trades, never logs in and sends
nothing to Polymarket.

**What it costs.**
- **No API tokens.** MARKET-1 reads only files on your PC: the paper
  experiment's stored trades, the collector's recorded books and trades, and
  the collector's rule book. All callers stay at 170 of the 250 a minute.
- **The price of that choice:** the paper experiment reads busy accounts only
  up to 1,000 trades a week, so MARKET-1 sees about 9 waves in 10. On the old
  weeks it would have seen 138 of the 153 entries (counted again here,
  `out/c1-reader.out.txt`). Reading the rest would cost 1,000–5,000 tokens a
  normal week and about 30,000 in a competition week — affordable — but it
  needs room in the 5-second burst, and the burst is already fully given out
  (the collector 15, the paper experiment 15, of 30). So: no reads.
- **On the PC:** a few minutes of reading a day, a few MB a day of its own
  record.

**What you see.** A page, `F:\polymarket-follow\market1\page\index.html`,
with a link at its top to the paper experiment's page. Until 2026-12-19 it
says **"Too early to judge"**; it shows every wave position (the coin, the
side, the accounts in the wave, the price paid, the result so far), the
running result with its error band, the worst day and the largest fall, and
how many positions were priced from the mark because the recording had a gap.

**What you do.** Answer the questions below. When the build, its fresh reviews
and the freeze are done: deploy it and register its task from an elevated
PowerShell (one line each). Keep the PC, the collector and the paper
experiment running until May 2027 — MARKET-1 reads them both, whatever the
paper experiment's own verdict.

**What the three looks can show** (2026-12-19, 2027-02-06, 2027-05-08; each
report after the following Monday). Arithmetic from the old weeks' noise, a
guide only (`out/c3-verdicts.out.txt`), with the drop line I recommend:

| If the wave's true result after costs is … | it says "keep" | … "drop" | … "too few to tell" |
|---|---|---|---|
| as on the old weeks, about +300 bps a position | 100% (68% already in December) | 0% | 0% |
| half of it, +150 | 92% (most in Feb. or May) | 0% | 8% |
| a third, +100 | 60% | 0% | 40% |
| +50 | 18% | 2% | 80% |
| nothing | 2% (a false "keep") | 18% | 80% |

"Too few to tell" in May comes with a number: the largest result the test
could still not rule out. The smallest true result it confirms four times in
five: about **336 bps a position in December, 197 in February, 127 in May**.

**Your decisions** (in full in section 8, each with my recommendation):
1. **The trades from the paper experiment's store only, no reads of our own**
   (9 waves in 10) — yes.
2. **Start on 2026-11-11, the first whole day of recorded books;** the days
   from 7 to 11 November printed beside on marks — yes.
3. **The drop line: +50 bps a position** (the paper experiment uses +10; at
   +10 the test could almost never say "drop") — +50.
4. **"Keep" on the money alone** — yes.
5. **A gap in the recording:** that leg priced from the mark and flagged; no
   verdict if more than a tenth of the positions needed it — yes.
6. **The 38 coins fixed now;** coins listed later only counted — yes.
7. **The entry 2 minutes after the liquidation decides** (as found); the
   entry an hour late, what an hourly tool could reach, is printed right under
   the verdict — yes.

---

## 1. The rules — draft `rules.md` for MARKET-1, in full

*To be frozen by hash (section 5, part 6) before anyone opens a recording, the
collector's database or the paper experiment's data after the cut. Every number
below is fixed here; nothing may be chosen later. Where a rule names code, the
code does exactly that and a test pins it. MARKET-FIND's old-weeks figures are
quoted in brackets as exploring prints, deciding nothing.*

### M0. Identity and what is frozen

- MARKET-1 is one arm with one deciding line, **WAVE**; every other line is
  beside it and decides nothing. A rule change after the freeze is a new arm
  with its own start instant, lines and budget; the frozen arm runs on.
- **Frozen together, what runs** (`market1/FROZEN.sha256`, sha256sum format,
  paths relative to the package folder, LF bytes as committed): the program
  `dist/market1.js`; every file of `dist/market1/` and of `dist/paper/` (MARKET-1
  imports the paper experiment's frozen readers, byte for byte as the paper's
  freeze lists them); every file of `research/` (the kit `2d3667b5…09aa` and
  lib-exits `612d5836…6330`); every file of `market1/` (this file). The
  list's SHA-256 and the tag `market1-freeze-1` are recorded in decisions
  before the first run after the freeze.
- **Every run starts by checking them** (`src/market1/gate.ts`): the list exists,
  names every file of what runs, and each has its hash; the kit's `checkKit()`
  returns its fingerprint. Otherwise the run writes one line, "frozen files
  differ", and stops (exit 4): nothing read, no page.
- **The sealed-data gate:** no file of the collector's recordings, no document
  of its database and no file the paper experiment wrote after the cut
  (`fills\`, `state.json`, `panel\`, `raw\`) is opened unless that check
  passed. Every reader of them takes the gate and refuses without it.
- **Shared code** (the logger, the lock, the clock) is not frozen; each day's
  log lists the hashes of the shared files the run used and Node's version.
- **A code defect** (the code not doing what this file says) is fixed only
  through a decisions entry that names it, before the next look, with the diff,
  a test that failed before the fix and the list of positions whose numbers
  changed; never a number of this file. A fix is a new list
  (`market1-freeze-2`, …). **A change to a file of `dist/paper/`** (a paper
  experiment's defect fix) stops MARKET-1 the same way, until its own entry
  re-freezes it with no rule of this file changed.

### M1. Instants

- **CUT** = 2026-11-07T00:00:00.000Z, the paper experiment's: the pool's fills
  are read from it.
- **START** = 2026-11-11T00:00:00.000Z, the first whole UTC day of the
  collector's books (recorded from 2026-11-10T20:59:54Z). WAVE counts entries
  with t ≥ START.
- **A run's END** = 00:00Z of its UTC day; nothing at or after END is used.
- **The looks:** END₁ = 2026-12-19T00:00Z, END₂ = 2027-02-06T00:00Z,
  END₃ = 2027-05-08T00:00Z (the paper experiment's).
- Times are ms since the epoch in the server's time (a fill's `timestamp`, a
  book or trades frame's `ts`). **"The 60 minutes up to t"** is
  [t − 3,600,000, t], both ends included (MARKET-FIND's code); every other
  window [a, b) includes a and excludes b. A UTC day is [00:00Z, 00:00Z + 24 h).

### M2. Who, and their fills

- **The pool:** the paper experiment's (its `rules.md` R2): 1,602 accounts, the
  kit's `population.json` less its 100 holdout accounts. No account is ever
  added; no holdout account's file is opened.
- **Their fills, as the paper experiment stores them** (its R3, R3a), read
  only: `PAPER_ROOT\state.json` (each account's read-through instant P and its
  holes) **first**, then each account's `fills\<addr>.json.gz` (`FillRow`, ids
  as digits); a row counts only when its timestamp is below that account's P
  as read from that state (so a file rewritten after the state was read adds
  nothing). Both are parsed by the paper experiment's own frozen schemas.
- **Not seen:** an account's fills at or after its P, or inside one of its
  holes (page cap, safety cap, rejected rows, account not found). They are
  counted at the looks (M13); a later run sees what the paper experiment has
  read by then.
- MARKET-1 reads no fill, or anything else, from the API.

### M3. The coins

- **The small coins, fixed:** 8 SOL, 10 HYPE, 31 PUMP, 32 ZEC, 33 XRP, 34 LIT,
  35 KPEPE, 54 AAVE, 55 UNI, 56 WLD, 57 NEAR, 58 KSHIB, 59 FARTCOIN, 60 DOGE,
  61 ENA, 62 ONDO, 63 SUI, 64 VVV, 65 TAO, 66 ADA, 67 ZRO, 68 BNB, 69 PONS,
  70 CASHCAT, 71 USELESS, 72 KAITO, 73 ARB, 74 LDO, 75 AVAX, 76 LTC, 77 XPL,
  78 XMR, 79 LINK, 80 VIRTUAL, 81 JUP, 82 ETHFI, 83 PENDLE, 84 MORPHO (38;
  instrument ids): every crypto market of the kit's rule book but 6 BTC-USD,
  7 ETH-USD and 96 PRL-USD (outside the paper experiment's cells), all listed
  before START (`out/c4-coins.out.txt`). A market listed later is never a
  small coin here.
- **The large markets,** for prints only: 6 BTC-USD, 7 ETH-USD.
- **Tradable at t:** the collector's rule book, read through the paper
  experiment's `rulebook.ts` as its R6 (3) reads it, shows no close-only state,
  settlement or absence from the market list recorded on or before t's UTC
  day. An entry needs its market tradable at t; a fill counts toward a wave
  whatever the state.

### M4. A liquidation fill

- **A counted fill:** a row of M2 in a small coin with `liquidation` true,
  `taker` true, and `previous_size` non-zero and of the opposite sign to the
  fill's side (long +1, short −1). Its side is the **forced side**: short is a
  forced sell (a long closed), long a forced buy (a short closed). Its instant
  t is its `timestamp`; its account, its address.
- **Order:** by (timestamp, instrument_id, address, trade_id as a number);
  only fills at the same millisecond need more than the timestamp.

### M5. The wave and an entry — WAVE

- **The wave state** for a side σ at t: at least **two different** pool
  addresses have a counted fill of side σ, in any small coin, with its instant
  in the 60 minutes up to t (this fill's account counts).
- **An entry:** a counted fill f at whose instant t the wave state holds for
  f's side, when f's market has had no entry with an instant in the 60 minutes
  up to t, of either side. The rule runs over every counted fill from CUT in
  M4's order, so an entry before START still blocks.
- **WAVE's positions:** the entries with t ≥ START whose market is tradable at
  t (M3).

[Old weeks, 2026-08-31 to the cut: 153 entries on 47 days in 30 markets, 114
forced sells and 39 forced buys; +309.7 ± 67.7 bps gross on marks, net +297.1
± 67.8; with every account-week capped at 1,000 fills (A13) 138 entries,
+283.8 ± 70.0; the paper experiment's reader, which leaves its list accounts
uncapped, keeps 138 as well (C1, counts only).]

### M6. The position

- **Against the forced side:** long after a forced sell, short after a forced
  buy (dir = +1 or −1). **$1,000** of notional.
- **Opened at x_in = t + 120,000 ms; closed at x_out = x_in + 86,400,000 ms.**
  No stop and no other exit. Positions overlap freely, in one market too; a
  long and a short in one market are two positions, never netted.

### M7. The price at the recorded book

- **A book line:** a line of the collector's `book-HH.jsonl.br` in a closed UTC
  day's folder (one with `manifest.json`; each file's SHA-256 checked against
  it), whose text parses by MARKET-1's own Zod schema of the documented frame —
  `ch` "book::<iid>", `ts` an integer, `data.b` and `data.a` arrays of levels,
  each level at least [price, size] as decimal strings. A line that fails is
  dropped and counted. A line's instant is its frame's `ts`, never our receive
  time. For an instant x the files of x's UTC hour, the hour before and the
  hour after are read (a file is chosen by receive time, and a frame can
  arrive seconds late).
- **The book at x:** the last book line of the market with `ts` ≤ x.
- **Live at x** when (1) that line's `ts` ≥ x − 3,660,000 ms — the collector
  writes every live market's book at the start of each hour, so an older line
  means a gap — and (2) no gap of the collector's record covers x. **A gap**,
  from `coverage.jsonl` (each event's time is our wall clock; every gap is
  widened by 60 s on both sides): a `market_stall` of the market to its next
  `market_resume`; a `ws_close` of a `book-` connection, from its
  `lastFrameAt` (else the event), to that connection's next `ws_resumed`
  (`firstFrameAt`) or `ws_open`, for every market (the record does not say
  which markets a connection holds); a `process_stop` to the next
  `process_start`, and a `process_start`'s `lastHeartbeatAt` to that start; a
  recordings `disk` event in state `stop` to the next recordings `disk` event
  in another state; a `write_failed`, `cut_line_dropped` or
  `compression_failed` naming a book file: that file's hour; a book hour file
  missing from a closed day, failing to decompress or differing from its
  manifest: its hour; a UTC day with no closed folder once a later day's is
  closed: the whole day.
- **Pending, not a gap:** a leg waits, unpriced for now, until the days that
  hold its three hour files are closed (a leg in a day's last hour waits for
  the next day's folder); the next run prices it.
- **Usable** when both sides hold at least one level with price and size above
  0 and the best bid is below the best ask (asks sorted ascending, bids
  descending).
- **The walk, as a taker.** Opening: $1,000 of notional taken from the asks
  (a long) or the bids (a short), best level first, q = min(size, the notional
  left ÷ price) at each; Q = Σ q; **p_in = 1,000 ÷ Q**. Closing: Q units taken
  from the bids (a long) or the asks (a short), best level first, q =
  min(size, the units left); **p_out = Σ(price × q) ÷ Q**. What the 20
  levels cannot fill is filled at the last level's price, flagged "depth
  short".
- A level's size is in the instrument's base units, as a fill's quantity
  (the build cites the WebSocket spec for it). Prices and sizes are read into
  doubles (the kit's convention for research figures; no money moves).

### M8. The mark fallback, and unpriced

- **A leg whose book is not live or not usable is priced at the mark:** the
  kit's `markAtMinuteEnd` at x (the mark at the end of x's minute, at most 5
  minutes stale) on the market object the paper experiment's R9 builds (the
  kit's pre-cut panel joined with the paper experiment's market-days), bought
  at mark × (1 + c) and sold at mark × (1 − c), c the kit's taker spread at x
  (R8's session-pair table: half-spread and depth for $1,000). The position is
  flagged "mark-priced leg".
- **A leg with neither is unpriced,** by reason ("no book and no mark at the
  entry", "… at the exit"; a funding settlement without a mark, M9). An
  unpriced position is left out of every mean, counted and printed, never
  guessed. A market settled during a hold leaves it unpriced this way.

### M9. Fees, funding, the net

- **Fee** on each leg: the base-tier taker rate at the leg's instant — the
  paper experiment's R9 (`bookTaker` on the collector's rule book; before its
  first record the kit's `feeAt('taker', …)`) — times the leg's notional
  (1,000 at the entry, p_out × Q at the exit). Never a lower tier or a rebate.
- **Funding:** every settlement whose nominal hour lies in (x_in, x_out], by
  the kit's `fundingBetween` on the same market object (Σ rate × the mark at
  the end of the minute before the hour; a positive rate: longs pay). A funding
  hour without a row is charged nothing and counted; a settlement without a
  mark leaves the position unpriced.
- **In bps of the $1,000:** gross = dir × (p_out − p_in) × Q ÷ 1,000 × 10⁴
  (spread and depth inside); fees = (f_in × 1,000 + f_out × p_out × Q) ÷ 1,000
  × 10⁴; funding = −dir × Σ × Q ÷ 1,000 × 10⁴; **net = gross − fees +
  funding.** With both legs at the mark this is the kit's `leg` exactly.
- **Also kept per position,** for the prints: the gross on marks (dir × (the
  mark at x_out ÷ the mark at x_in − 1) × 10⁴, the kit's reading); the entry's
  cost at the book (p_in against the book's mid, in bps); the deepest level
  walked; its flags.

### M10. The deciding set and the statistic

- **The set of look k:** WAVE's positions with x_out < END_k.
- **x** = a position's net in bps, each position alike; **m** = the mean over
  the priced ones.
- **SE** = √max(V_day + V_market − V_both, V_day, V_market): V_day, V_market and
  V_both the kit's CR1 variances of the mean (`cr1Test`) clustered by the UTC
  day of t, by the market, and by the (day, market) pair.
- **z:** L1 2.81, L2 2.43, L3 2.17 (two-sided 0.5%, 1.5%, 3%: 5% in all;
  KEEP, one-sided, spends half of it) — the paper experiment's spending.

### M11. The verdict

- **WITHHELD** when more than **10%** of the set is not priced at the book
  (a mark-priced leg, or unpriced).
- **DROP** when m + z·SE < **δ = +50 bps** (the owner's line, Q3).
- **KEEP** when m − z·SE > 0.
- When KEEP and DROP both hold, **DROP**. **TOO FEW TO TELL** otherwise, and
  when SE cannot be computed (fewer than two days or two markets).
- **The sentence:** at L3, TOO FEW TO TELL with an SE: "No mean result as
  large as X bps a position was seen.", X = m + z·SE; otherwise "Keep and drop
  are verdicts on this test, never instructions to trade."
- The first KEEP or DROP is the test's verdict; later looks print their
  figures marked "after the verdict". Only WAVE carries a verdict.

### M12. The lines beside — deciding nothing, no verdict word

Each is priced as M6–M9 (the book, else the mark) unless said, from its own
instants, and printed in three readings: the net at the book; the gross on
marks; and, where MARKET-FIND read it so, the gross on marks minus the matched
baseline (BASE below). Its statistic: M10's two-way SE when it spans several
markets, the CR1 SE by day for a single market or a basket (B7, B8, B9, X).
Each look's set: its positions with x_out < END_k. [Old weeks, MARKET-FIND,
gross on marks unless said.]

- **B1 EPISODES** — every 60-minute episode: a counted fill in a small coin
  whose market's previous counted fill (in M4's order) is more than 60 minutes
  before it, or none (episodes chain while the gap is at most 60 minutes);
  against its side, x_in = t + 2 min. [386, 383 priced: +131.9 ± 35.1; net
  +119.5 ± 35.3]
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
- **B7 LARGE AT THE WAVE** — at each WAVE entry, BTC and ETH, each against
  the forced side, at the same x_in and x_out. [minus BASE, by day: BTC +61.6
  ± 37.4, ETH +111.3 ± 48.7]
- **B8 BASKET AT THE WAVE** — at the first WAVE entry and each later one more
  than 6 hours after the previous B8 entry: every small coin with a price,
  each against the forced side at the same instants; the basket's value = the
  mean of its coins'. [57: +103.8 ± 37.3 minus BASE, by day]
- **B9 BASKET AFTER 400** — every quarter-hour boundary t (:00, :15, :30, :45
  UTC) from START: m4 = the mean, over the small coins with both marks, of
  (the kit's mark at t − 1 min ÷ its mark at t − 4 h − 1), at least 5 coins;
  when |m4| ≥ 400 bps, the basket against m4's sign from t + 2 min for 24 h;
  cells: the wave state for m4's side at t, and not. [by day: +247.2 ± 69.1,
  58 on 12 days; +36.6 ± 74.2, 143 on 20 days]
- **B10 LARGE ON THEIR OWN** — B1's rule in BTC and in ETH (their own counted
  fills), faded. [222: +5.3 ± 24.4 minus BASE]
- **B11 THE TAIL** — WAVE's, from the first day: the worst UTC day (the
  lowest sum of net by the UTC day of t), the largest fall from a peak (the
  running sum of those day sums), the most positions open at once (the most
  with x_in ≤ y < x_out at any x_in = y), the worst position and the worst 5%'s
  average. [−1,875 on 2026-09-09 over five; 2,370; 19; −1,101.9; −699.4]
- **J JUMP** — in each small coin, every UTC quarter-hour w: mv = the minute
  mark at the end of w's last minute ÷ that of the minute before w − 1 (both
  present, no stale fill); U = the mean |mv| over the 2,880 quarter-hours
  before w with both marks, at least 672 of them; J = |mv| ÷ U. **A jump: J
  > 5 and mv ≠ 0;** against mv's sign, x_in = the window's end + 1 min
  (MARKET-FIND's instant, whose mark is 2 minutes after the window), 24 h.
  Cells: the wave state for mv's side at the window's end, and not. [2,039:
  +70.9 ± 23.5; with a wave 458: +324.0 ± 73.5; without 1,569: −3.0 ± 29.2]
- **T TAPE** — the collector's recorded public trades in small coins
  (`trades-HH`, and the trades frames the collector's schema refused for an id
  above 2^53 − 1, kept in `rejected-HH`), ids read as digits, deduplicated by
  (tid, iid), settlements left out, **whose trade id ends in the digits 00**
  (a 1% sample nobody chooses); in the taker's direction (side long: long), x_in
  = the trade's `ts` + 80 s, 24 h. Cells: against the last hour's move (the
  sign of the kit's mark at ts − 1 min ÷ its mark at ts − 61 min − 1,
  opposite to the trade's side), with it, and each market-day once (the mean of
  a market-day's positions; the statistic over market-days). [R8's captured
  trades, busy hours only, no sample: against +86.5 ± 34.6, with −17.3 ±
  32.5, market-days +13.7 ± 4.1]
- **X XREV** — each UTC midnight t from START: the small coins with the kit's
  marks at t − 1 min and at t − 24 h, at least 9; ranked by that move; k =
  ⌊n ÷ 3⌋; each of the k lowest long $1,000, each of the k highest short
  $1,000, x_in = t + 2 min, 24 h; the day's value = the mean of its 2k
  positions' (one value a day). [+35.0 ± 13.7 a position; net +21.9 ± 13.7]
- **P BEFORE THE BOOKS** — M5's entries with t in [CUT, START), every leg at
  the mark (no book was recorded), flagged; their windows count no fill before
  CUT (the store starts there).
- **C COMPETITIONS** — WAVE without the positions whose t lies in a
  competition window the collector's rule book lists, and without those in its
  boosted markets (a boost above 1).
- **S THE MARKET'S DIRECTION** — WAVE by UTC month; and by the sign of the
  small-coin basket's move over the 7 days before t (the mean over coins with
  both of the kit's marks at t − 1 min ÷ at t − 7 d − 1, at least 5 coins),
  crossed with forced sells and buys.
- **R RANDOM DAYS** — 5,000 draws with MARKET-FIND's generator (seed
  20261113, s ← (1,664,525 s + 1,013,904,223) mod 2³², u = s ÷ 2³²); in each
  draw the UTC days holding WAVE positions are taken in the order of their
  first position, and each day's positions move together to the day START +
  ⌊u × (n − 1)⌋ days (one u a day; n = (END_k − START) ÷ 1 day), keeping
  market, clock time and side; each moved position's gross on marks, skipped
  when its exit is not before END_k or a mark is missing; a draw kept when more
  than a third of the set is priced. Printed: the real gross-on-marks mean, the
  draws' mean and sd, the share at or above the real mean. [mean −0.1, sd
  74.7, 1 of 5,000 at or above +309.7]
- **BASE, the matched baseline** — for market i and the 4-hour UTC block b of
  x_in: the mean of (the minute mark of j + 1,440 ÷ that of j − 1) × 10⁴ over
  every whole minute j in [START, END_k − 24 h) of market i in block b with
  both minute marks present.

### M13. Prints at a look

For WAVE (and for each beside line its count and the same statistic): positions,
days, markets; unpriced by reason; mark-priced legs; "depth short"; the money
mean with its two-way SE and the one-way SEs by day, by market and (beside)
by week; the band with Student's t on day clusters (df = days − 1); the gross
before costs with its lower bound, as `breakEvenRoundTrip`; fees; funding;
the win share; the median and quartiles of the net; the entry's cost at the
book (median, p90) and the mean net of the third with the highest entry cost;
B11; the mean without the two days that add most, each day left out (lowest
and highest), each market left out; the share of positions on the five
busiest days; positions a week; the pool's activity a week (accounts with a
small-coin fill; accounts liquidated in small coins); the reader's holes (the
pool's account-weeks with a page-cap or safety-cap hole; WAVE's windows
[t − 60 min, t] that touch a hole of any pool account); the pool's
liquidation fills (M4's test) in crypto markets outside M3; the smallest edge
visible at the next look, (z_next + 0.8416) × SE × √(days so far ÷ days at
the next look).
Venue lines (another exchange's fees) are reporting arithmetic outside these
rules.

### M14. The daily page

- One static file, `MARKET1_ROOT\page\index.html` (and `positions.html` with
  every position), written after each run's record from the same objects the
  log records; no script, inline style; a link at its top to the paper
  experiment's page.
- **Its top:** what the test is in three sentences; "data through <date>";
  "the pool's trades read through <the earliest P of the pool's accounts
  without a standing hole>"; book lines that failed the schema, if any; the
  frozen hash and the freeze's date, with "The rules were frozen on <date>
  before any MARKET-1 result existed; whatever this page shows, they do not
  change."
- **The verdict box:** "Too early to judge — next look <date>." until look 1
  has run; then exactly "Look k (<END_k's date>): WAVE V." (V its verdict),
  M11's sentence, and "Next look <date>." unless V is KEEP or DROP or no look
  is left; nothing else.
- **WAVE:** positions, days, markets, open; the running mean net with its SE
  and the band m ± z_next·SE ("the band the next look will use; a crossing
  between looks decides nothing"); B11; mark-priced and unpriced counts. **The
  lines beside: their counts only;** their results appear at the looks.
- **Every WAVE position,** newest first (the newest 500 on the page): market,
  forced side, the fill's instant, the accounts in the wave, x_in and p_in
  (the book's, or the mark flagged), x_out, the net (an open one at its book
  at END − 1 ms, labelled open), its flags, the run date it was first seen.
- **Never on the page:** a verdict between looks; any other line's result; a
  sort by result; a probability; the words follow, copy, signal, edge, skill,
  opportunity, recommend (a test reads its text); colours for a sign.

### M15. Runs, reads and what never changes

- **No API call:** MARKET-1 has no client and no route.
- **A daily run** (after the gate): reads M2's fills, the rule book, the
  market objects and the recordings; recomputes every entry from CUT; prices
  each leg not yet priced and keeps the book line it used in its own record
  (`MARKET1_ROOT\books\<UTC date>.jsonl.gz`), so later runs and the looks
  reprice from the record and get the same number; writes the day's log
  (every position's state, with the run date it was first seen), the
  manifest, the page, and the backup to `MARKET1_BACKUP`. A position whose
  inputs are not final yet (a recording day not closed, a market-day of the
  paper experiment not read) is pending and is priced by a later run.
- **An entry can move or vanish** when a later read of the paper experiment
  brings an earlier liquidation in the same market (the block of M5) or a
  second account (a new wave): each day's log keeps what that day computed;
  the looks use the reads as complete.
- **A look k** runs once, on or after the Monday after END_k, when every pool
  account's P ≥ END_k or a standing hole, every UTC day of the recordings
  before END_k is closed, and the market-days of the 40 markets before END_k
  exist; it waits at most 7 days past that Monday, then runs and lists what
  was missing on its first page. A run that crashes before its result exists
  is not a look.
- **After the freeze** no number, line, coin, threshold, instant or rule of
  this file changes; a new idea is a new arm.

---

## 2. The data and its sources

| Data | For | Source (read only, after MARKET-1's freeze) | Notes |
|---|---|---|---|
| The pool's fills | the waves, every line built on liquidations | the paper experiment's store: `state.json`, then `fills\<addr>.json.gz` | its R3a: the week's list read daily, uncapped; the rest when the week is over, 10 pages an account-week; frozen formats |
| Books | every leg's price | the collector's `book-HH.jsonl.br`, closed days, `manifest.json`, `coverage.jsonl` | from 2026-11-10T20:59:54Z |
| Public trades | TAPE | the collector's `trades-HH`, and `rejected-HH` frames refused for ids above 2^53 − 1 | the collector's schema reads ids as safe integers (`schemas.ts`), so such a frame is kept raw in `rejected-HH` |
| Minute marks, funding | the mark fallback, funding, JUMP, XREV, B9, BASE, R, S | the kit's pre-cut panel (`paper\panel-precut\`, pinned) joined with the paper experiment's market-days (`paper\panel\<iid>\<date>.json.gz`) — its R9 market object | the 40 markets are among its 84 |
| Fees, tradability, competitions | M3, M9, C | the collector's `rulebook` collection, through the paper experiment's `rulebook.ts` | before its first record (2026-11-11T15:47Z) the kit's `rulebook.json` |
| For the reproduction only | part 4 | the seed (`paper\seed\`), the kit's panel, R8's captured tape | all before the cut |

**The days from 2026-11-07 to the books** (Q2): a later start. WAVE counts
from START = 2026-11-11T00:00Z; the entries of [CUT, START) are line P,
priced at the mark and flagged. At the old rate that is about 9 entries, a
tenth of the first look's days [arithmetic: 4 of 41]. The first three hours
of books (20:59:54Z to 24:00Z on 11-10) are left out so that every day
cluster is a whole day.

**The formats, as documented** (architecture "The collector"; the collector's
code `store/files.ts`, `ws/book-sampler.ts`, `ws/streams.ts`,
`health/coverage.ts`; never a recording): `<RECORDINGS_ROOT>\<UTC
date>\<kind>-<HH>.jsonl`, Brotli `.jsonl.br` once the hour closes, the file
chosen by our receive time (a line received late goes into the open hour's
file); a line is the receive time in ms, a tab, and the text as received (a
text with a line break is written as a JSON string); a book frame `{ch:
"book::<iid>", ts, ets, sq, data: {b, a}}`, levels [price, size] as strings,
top 20 per side, pushed by the server every 100 ms whether changed or not,
stored once a second (the last frame of each second by `ts`) when its levels
changed, and regardless at the first sample of each hour; a trades frame
`{ch: "trades::<iid>", ts, data: [{tid, iid, side, p, qty, ts, hash,
settlement}]}`, the taker's side; a closed day's `manifest.json` (each file's
bytes, SHA-256, lines, first and last receive time); `coverage.jsonl` (every
gap and mark with its cause, the event list in `health/coverage.ts`).

**What MARKET-1 writes** (`MARKET1_ROOT`, `F:\polymarket-follow\market1\`):
`books\<UTC date>.jsonl.gz` (each book line a leg used — the decisive inputs,
kept even if the recordings' disk is lost later; written once a day);
`log\<run date>.jsonl` and `<run date>-positions.jsonl.gz`;
`manifest\<run date>.sha256`; `page\index.html`, `positions.html`;
`looks\L<k>\result.json`; `checks\`. After each run the record is copied to
`MARKET1_BACKUP` (`E:\backups\polymarket-follow\market1\`). Its lock,
heartbeat and log: `STATE_DIR\market1.lock`, `market1-heartbeat.json`,
`logs\market1-<UTC date>.log`.

## 3. The budget

**API: 0 tokens.** MARKET-1 has no client. All callers stay at the
collector's 50 and the paper experiment's 120 of 250 a minute, 15 + 15 of 30
in 5 s.

**The alternative, measured** (`scripts/c1-reader.mjs`, the seed and the
kit's `pool-weeks` labels, counts only): reading the tails the paper
experiment's cap leaves (from the 1,000th fill to the week's end, every
capped account-week, 10 tokens a page):

| Week (Monday) | Capped account-weeks | Fills past the cap | Tokens to read them |
|---|--:|--:|--:|
| 2026-09-28 | 6 | 3,288 | 360 |
| 2026-10-12 | 16 | 10,493 | 1,120 |
| 2026-10-19 | 29 | 14,462 | 1,610 |
| 2026-10-26 | 41 | 44,433 | 4,680 |
| 2026-11-02 (5 days, the competition's first) | 92 | 221,592 | 22,780 |

The earlier weeks undercount (777 account-weeks lie before a truncated seed's
oldest fill). So 1,000–5,000 tokens a normal week and about 30,000 in a
competition week — under 4% of the 80 a minute left. **What it would buy:**
the old-weeks entries the cap hides — of the 153, 137 are found the same from
the stored fills, 16 are lost and 1 more appears moved, 138 in all (661 of
the 727 small-coin liquidation fills are stored; the 66 lost belong to 8
accounts). **Why not:**
the burst. The operating budget allows 30 tokens in any 5 s for all callers
together (decisions 2026-11-07), and the collector's 15 and the paper
experiment's 15 take all of it (decisions 2026-11-12, the two fresh reviews
(7)); a fills page weighs 10. A third reader needs the owner's ruling on the
burst first — D1, D2 and v1's live polling too (section 9).

**On the PC.** Reading the recordings: at most one line a second a market
(853 B of JSON a frame, COLLECTOR-PLAN's measure, 2026-11-10), so up to about
7.8 million lines and 6.6 GB of text a day before Brotli [arithmetic: 90 ×
86,400 × 850 B]; a daily run reads the new day's hour files and the next
day's for exits, once each, through an index per file; the build measures the
real time on a synthetic day of that size (part 2). MARKET-1's own record:
a few MB a day [arithmetic: about 600 positions a day across its lines and
about 1,200 book lines used, each under 1 KB]. The paper experiment's store
and panel: read whole each run, as that experiment itself does.

## 4. How a live tool would see a wave — notes for v1, no code

- **Only in the liquidated accounts' own fills** (external-apis, 2026-11-13):
  the public tape marks only backstop liquidations, and the other side of a
  liquidation trade carries no flag.
- **Whom to poll.** An account can be liquidated only while it holds a
  position. About **201 pool accounts hold a small-coin position at any hour**
  (the four weeks before the cut: p10 182, p90 230; 61 more unknown, truncated
  seeds; `scripts/c2-live.mjs`). Their fills polled every 60 minutes cost
  about **34 tokens a minute**, every 15 minutes about 134 (more than the 80
  left), every 5 minutes about 400. The set must be refreshed, for positions
  opened between polls: the liquidated positions had been open a median 8.0
  hours, and 118 of 450 under an hour.
- **How late is in time.** On the old weeks entering an hour late gave
  +292.9 ± 72.7 against +309.7 ± 67.7, three hours late +309.6 ± 83.1
  (MARKET-FIND, exploring); B3 measures it forward. An hourly poll of the
  holders, with the other active accounts every few hours, would fit about 50
  a minute — once a burst share exists.
- **What a tool would show** (Iron Rule 6): the data and the test's own paper
  result — "two tracked accounts were liquidated short in small coins in the
  last 60 minutes; MARKET-1's paper position: …" — never "buy" or "sell".
- **Public proxies, untested:** open interest and the tickers' long and short
  counts falling (the collector records the REST tickers every minute), or the
  book thinning, might show a wave without account reads. A jump alone showed
  nothing on the old weeks (J); a later study, after MARKET-1's verdict, could
  test them on its own weeks.

## 5. The build, in parts

**Where the code lives:** a third entry point of the poller package, like the
paper experiment's — `apps/poller/src/market1.ts` (`daily`, `look <1|2|3>`,
`reproduce`) and `src/market1/`, compiled to `dist/market1.js` and
`dist/market1/`; `apps/poller/market1/rules.md` (section 1, final at the
freeze) and `FROZEN.sha256`. TypeScript strict, Zod at every boundary (book,
trades and coverage lines, manifests, the paper experiment's files, the rule
book's documents), pino, vitest, `pnpm verify` green at every part, each part
committed by name. Exit codes as the paper experiment's: 0 done, 1 crash, 2
bad settings, 3 lock held, 4 frozen files differ, 5 look not due or not
ready. Settings, no defaults: `STATE_DIR`, `MARKET1_ROOT`, `MARKET1_BACKUP`,
`PAPER_ROOT`, `RECORDINGS_ROOT`, `MONGO_URI`, `MONGO_DB`.

**Reused, imported and never edited** (the paper experiment's frozen code, so
its freeze list stays valid; MARKET-1's list freezes the same bytes again):
`src/paper/instants.ts` (CUT, the looks, a run's END); `store.ts` (`State`,
the fills files, `MarketDay`, `writeAtomic`); `routes.ts` (`FillRow`; TAPE
reads its `tid` as digits by the same `context.source` reviver);
`rulebook.ts` (`readRuleBook`, `parseRuleBook`, `bookTaker`); `market.ts`
(`loadPrecut`, `joinDays`,
`marketThrough`); `research.ts` (the kit: `markAtMinuteEnd`,
`fundingBetween`, the taker spread, `cr1Test`, `tCritical`, `checkKit`);
`seed.ts` (the reproduction); `stats.ts` (`LOOK_Z`, `Z_POWER`); the shared
`lock.ts`, `log.ts`, `schedule.ts`. **New, because the paper's are hard-wired
to its own paths and lines:** the freeze gate (the paper's names
`experiment/FROZEN.sha256`), the verdict (the paper's has δ = 10 and its d),
the two-way error by day and market (the paper's is by trader and day). In
tests only, the collector's own `Recorder` and `BookSampler` write the
synthetic recordings.

**The parts, in order** (no part opens a sealed source before part 6's
freeze; the gate makes that a refusal in the code, not a promise):

| Part | What | Its checks |
|---|---|---|
| 0 | the entry point, settings, lock, log; the freeze gate and the sealed-data gate; `market1/rules.md` as drafted, and `apps/poller/market1` in `.prettierignore` beside `apps/poller/experiment` (a reformat would change its hash) | a missing, changed or extra frozen file refuses with nothing opened (exit 4); each sealed reader refuses while the gate is closed; **the paper experiment's `FROZEN.sha256` still verifies, 61 of 61, after a fresh build of the tree — a test run at every part** |
| 1 | the inputs: the pool's counted fills (state first, rows below P, holes), the coins, the rule book, the market objects | synthetic stores written by the paper experiment's own `PaperStore` (a file newer than the state adds nothing; a hole hides its fills; an account outside the pool is never read); the coin list equals the kit's rule book's crypto markets but 6, 7, 96; on the real seed, the counted fills from 2026-08-31 equal MARKET-FIND's 727 fill for fill |
| 2 | the recordings: manifests, hour files, book, trades and rejected trades lines, the coverage gaps, the book at x with live and usable | synthetic recordings written by the collector's own `Recorder` and `BookSampler`: an unchanged book written only at the hour's start, a frame filed in the next hour, a stall and its resume, a connection closed and resumed, a process stop and start, a recordings disk stop, a cut line, a missing hour, a manifest mismatch, a frame failing the schema, a trades frame with an id above 2^53 − 1 in `rejected-HH`: each answer asserted; the time to read a synthetic day of the real size |
| 3 | the rules, as pure functions: M4–M5 and B1–B5, the walk and the leg (M7–M9), every line of M12, BASE, R, the statistic and the verdict (M10–M11), the page (M14) and the look's prints (M13) | a synthetic world for every rule, every output asserted; the walk on hand-built books (one level, many, depth short, crossed, one side empty); the window's edges (a fill exactly 60 min before; a block at exactly 60 min; two fills in one millisecond); a position with both legs at the mark equals the kit's `leg` to 1e-12; **the mutation check of everything that decides** (two accounts → three, 60 → 61 min, both ends → one, the block of either side, 120 s, 24 h, $1,000, the walk's sides, the fee's legs, funding's sign, the SE's max, z, δ, 10%, DROP wins) — a crash or a timeout counts as killed |
| 4 | **the reproduction on the old weeks:** START = 2026-08-31, END = CUT, the seed's fills, the kit's panel, every leg at the mark, R8's captured tape for TAPE (all its trades, no sample) | **every target in the table below equal**; a difference allowed only where MARKET-FIND's code reads something otherwise than M12 writes it, each listed with its cause; **no new day is priced before then**; a rehearsal page on the old weeks, marked "rehearsal on weeks already studied" |
| 5 | the daily run, the log, the manifest, the backup, the page, the look; `tools\deploy.ps1 -Program market1`; `tools\register-tasks.ps1 -Market1Only`; the freeze tool takes the program's name | an end-to-end test over a synthetic world: the gate's refusals with nothing read; a normal day; a Monday whose sweep adds a wave to last Wednesday (it appears, first seen that day); a recording gap (mark-priced legs; WITHHELD past 10%); a look not ready (exit 5), ready (runs once; a second refused); the page's text (no banned word); the backup; deploy and register on a scratch run root; the paper experiment's tool and task unchanged |
| 6 | **the freeze:** `rules.md` final; `market1/FROZEN.sha256` by the freeze tool (`--final`, a clean tree); a fresh rules review and a fresh code review by different models; the supervisor records the hash and tag in decisions | the reviews' "may run"; the hash in decisions before the first run |
| 7 | the owner's deploy and task; the first run (the backlog from CUT), then daily; each look once, `market1.js look k`, with a report `docs/reviews/market1-look-<k>-<date>.md` and a Final review that recomputes WAVE's numbers with independent code, position by position | the run log's counts; the page; the supervisor's access scan (nothing sealed read before the freeze) |

**The reproduction's targets** (MARKET-FIND's own prints, exploring; part 4):

| Line | Target |
|---|---|
| WAVE | 153 entries on 47 days in 30 markets (114 sells, 39 buys), each entry's market, instant and side equal to MARKET-FIND's U2 list (regenerated from its scripts); gross +309.7 ± 67.7 (by day ± 60.1, by market ± 53.8); MARKET-FIND's additive net +297.1 ± 67.8 recomputed as a check of the inputs, beside M9's net (the kit's leg, new) |
| WAVE under the paper experiment's reader | 138 entries (`out/c1-reader.out.txt`'s model) |
| B1, B2 | 386 episodes, 383 priced, +131.9 ± 35.1; 254, +22.0 ± 34.9 |
| B3 | +292.9 ± 72.7; +309.6 ± 83.1 |
| B4, B5 | 164, +274.7 ± 58.9; 76, +434.5 ± 97.1 |
| B6 | +274.2 ± 84.1; +413.4 ± 98.0 |
| B7, B8 | +61.6 ± 37.4, +111.3 ± 48.7; 57, +103.8 ± 37.3 (minus BASE, by day) |
| B9 | +247.2 ± 69.1 (58 on 12 days); +36.6 ± 74.2 (143 on 20 days) |
| B10, B11 | 222, +5.3 ± 24.4 (minus BASE); on MARKET-FIND's additive net −1,875 (2026-09-09), 2,370, 19, −1,101.9, −699.4 |
| J | 2,039, +70.9 ± 23.5; 458, +324.0 ± 73.5; 1,569, −3.0 ± 29.2 |
| T | +86.5 ± 34.6; −17.3 ± 32.5; +13.7 ± 4.1 |
| X | +35.0 ± 13.7; net +21.9 ± 13.7 |
| R | mean −0.1, sd 74.7, 1 of 5,000 |

The build gets MARKET-FIND's `explore\` scripts and outputs read only (the
supervisor's copy); A14's window is (t − 60 min, t] where M12 writes both
ends, so a fill exactly 60 minutes before a quarter-hour is the one difference
it may list.

**How it runs.** `tools\deploy.ps1 -Program market1` writes its own run copy,
`E:\polymarket-follow-run\market1\` (the build, `research\`, `market1\`;
smoke: exit 2 without settings, the copy's `checkKit()`, and, once a freeze
list is in it, the copy's own gate). The task **"polymarket-follow market1"**:
node.exe runs `dist\market1.js daily` there, daily at **10:30Z** computed from
UTC (`Get-DailyUtcStart`), after the paper experiment's Monday sweep; S4U,
IgnoreNew, 12 hours at most, priority 7, start when available. **The owner
registers it** (`tools\register-tasks.ps1 -Market1Only` from an elevated
PowerShell, the other four tasks untouched) and starts the first run by hand.
A run makes no request, so the night window does not apply.

**Its page:** its own static file with a link to the paper experiment's page
(Q7). One file more than a landing page would need, and nothing frozen
touched.

**The docs the build updates:** architecture (MARKET-1: program, files, page,
task, and its read-only contracts with the paper experiment's store and with
the recordings), current-task, decisions (the build's technical calls; the
freeze's hash); in its closing message, what belongs to code-rules (reading
the recordings by `ts` with the hours around; the refused trades frames;
importing frozen code without editing it) and to the plan page.

## 6. The looks

**Each look's report** (the paper experiment's road): one page for the owner
in plain words — WAVE's verdict and sentence, its positions, days and markets,
the mean net per position with its band, the 1-hour-late line beside it, the
tail, the share priced from the mark — then M13's prints for WAVE and every
line beside, each labelled "deciding nothing". The report is written after the
look runs (on or after the Monday after END_k, when the paper experiment's
sweep has read the last week) and a Final review recomputes WAVE with
independent code.

**What the test can see** [arithmetic, a guide only: MARKET-FIND's old-weeks
net error ± 67.8 over 68 days scaled by the square root of the days; 37, 86 and
177 days of entries; the paper experiment's z; 80% power; `out/c3-verdicts.out.txt`]:

| | 2026-12-19 | 2027-02-06 | 2027-05-08 |
|---|--:|--:|--:|
| days of entries (START to END_k − 24 h) | 37 | 86 | 177 |
| entries at the old rate, 2.25 a day (under the reader's cap, 2.03) | 83 (75) | 194 (175) | 398 (359) |
| SE of the mean net (bps) | 91.9 | 60.3 | 42.0 |
| the smallest true net KEEP confirms four times in five | **336** | **197** | **127** |
| … with the random-day spread (× 1.1) | 370 | 217 | 140 |
| … with the cap's fewer entries as well (× 1.03) | 381 | 224 | 144 |

MARKET-FIND's own table (297 / 195 / 136) split the 5% evenly over the looks;
the paper experiment's spending keeps more for the last look. **Read:** at the
exploring size (+297) December probably says "keep" (68%); half of it is
caught by May nine times in ten; a third, six in ten. With no move at all a
false "keep" comes 2 times in 100, "drop" 18 in 100 with δ = +50 (3 in 100
with δ = +10), and otherwise "too few to tell" with its upper bound. A calmer
market means fewer waves and wider errors than this table.

## 7. Risks, and how each is caught

| Risk | How it is caught |
|---|---|
| **The long losing tail and the worst day** (old weeks: a position's sd 540 bps, the worst −1,102, the worst day −1,875 over five) | no stop, as found; B11 on the page from the first day and at every look; the win share and quartiles; DROP below +50 |
| **Bunched waves** (19 open at once; two days add most) | errors clustered by day and by market, the larger of the one-way and two-way; the mean without the two days that add most, each day and market left out, the five busiest days' share; R (random days) beside |
| **A thin book at entry** | the walk through the recorded levels for $1,000; "depth short" flagged; the entry's cost at the book printed with the net of the costliest third |
| **The collector's gaps** | M7's live rule from `coverage.jsonl` and the hourly forced sample; the mark fallback flagged; WITHHELD past 10%; the book lines used kept in MARKET-1's record and backed up — the recordings have no second copy (architecture), so the owner's second copy (STRATEGY-REVIEW's step) still matters for the days not yet priced |
| **The pool read at the cut** (fewer eyes, fewer waves) | the pool fixed; its weekly activity printed; a falling event rate shows as fewer entries and a wider band, never as a changed rule |
| **The reader's cap** (138 of 153 on the old weeks) | the rule is the wave as the frozen reader stores it; the holes and the windows they touch are printed; the reproduction prints the capped figure beside the full one |
| **A coin listed or delisted** | the 38 fixed; an entry needs its market tradable (M3); a settlement during a hold leaves the position unpriced, counted; fills in markets listed later counted |
| **The competition's days** (competition 1 runs to 2026-11-16T14:30Z) | C without the competitions' days and boosted markets |
| **The falling and rising market** | S by month and by the 7-day basket move, crossed with the side; the old weeks held in a rising September (+255) and a falling October (+321) |
| **What someone saw before the freeze** | the gate refuses every sealed source before the freeze; the access scans of each worker; the freeze as soon as possible — the recordings keep the weeks whole meanwhile |
| **The paper experiment or the collector stops** | MARKET-1 depends on both through May 2027: the look waits up to a week and lists what is missing; the owner keeps both tasks running whatever the paper experiment's own verdict |
| **The 2-minute entry is out of a live tool's reach** | B3 (1 h, 3 h) printed under the verdict at every look; section 4's notes |
| **A frozen paper file changes** | MARKET-1's gate stops it (exit 4) until its own entry re-freezes |
| **Entries move as the reads complete** (a Monday sweep can add an earlier liquidation that blocks a shown entry, or a second account that makes a new one) | each day's log keeps that day's positions with the run date each was first seen; the page says the pool's trades are read through a date; the looks wait for the reads (M15) |

## 8. Questions, each with a recommendation

1. **Fills from the paper experiment's store only?** *Recommendation: yes.*
   Zero tokens and no new reader; it sees about 9 waves in 10 (138 of 153).
   Reading the capped tails costs 1,000–5,000 tokens a normal week and about
   30,000 in a competition week, but needs a burst share that does not exist.
   If the owner ever frees a share (Q12), the full-fills reading can join as
   its own arm.
2. **START on 2026-11-11, the days since the cut printed on marks (P)?**
   *Recommendation: yes.* Mixing two kinds of price in the deciding set for 4
   of 41 days is worse than losing them.
3. **The drop line δ?** *Recommendation: +50 bps a position.* At +10 (the
   paper experiment's) the test almost never says "drop" when there is
   nothing (3%), so a dead lead would end as "too few". At +50 a dead lead is
   dropped 18% of the time and a real +50 only 2%; at +100, 60% and 18%
   (`out/c3-verdicts.out.txt`). +50 is about what the old weeks' stress lines
   take away when each side costs 25 bps more than measured (MARKET-FIND 1.5),
   and a result under it would hardly pay for a position's 540-bps spread.
4. **KEEP on the money alone, without a second reading like the paper
   experiment's d?** *Recommendation: yes.* The position fades the forced
   side, which runs with the market's trend, so the trend works against it; a
   baseline condition would almost never bind. BASE and R are printed beside.
5. **A gap in the recording: the mark for that leg, flagged, and WITHHELD past
   10%?** *Recommendation: yes.* Dropping such positions would lose whole
   days when the PC is off, and the wave's busiest moments may be when a
   connection drops; the mark keeps every entry recorded (Iron Rule 4).
6. **The 38 coins fixed?** *Recommendation: yes.* A coin listed later has no
   panel in the paper experiment (no funding, no mark), and its first weeks
   would mix a new kind of market into the test; its pool liquidations are
   counted.
7. **Its own page with a link to the paper experiment's?** *Recommendation:
   yes;* the frozen page stays untouched and no third page is needed.
8. **The deciding entry 2 minutes after the fill, as found?**
   *Recommendation: yes,* with B3's hour-late figure right under the verdict.
   No tool inside our budget sees a wave in 2 minutes (section 4); the move is
   slow (an hour late +293 on the old weeks), so the two answers should agree
   if the lead is real, and the frame ruled W as found. The other way — the
   hour-late entry deciding — answers "could an hourly tool have earned it"
   directly, at about 7% more noise.
9. **TAPE's sample: trade ids ending in 00 (1%)?** *Recommendation: yes;*
   about 350 trades a day over all hours, chosen by nobody (R8's capture held
   about 740 a day, in busy hours only); its error is set by days and markets
   more than by the count.
10. **May the heaviest beside lines (TAPE, B8, B9, R) join later as their own
    arm if they are not ready, so that they never delay the freeze?**
    *Recommendation: yes* (the paper experiment's Q-D).
11. **The collector and the paper experiment keep running to 2027-05-08,
    whatever the paper experiment's verdict?** *Recommendation: yes* — a
    ruling, since MARKET-1 reads both.
12. **For the supervisor: the burst.** Any new API reader (D1, D2, v1's live
    polling, a full-fills arm) needs a share of the 30 in 5 s, all of which is
    given out; a fills page alone weighs 10, so trimming the collector's 15
    to its measured peak of 12 frees too little. *Recommendation:* rule it
    before D1 and D2 are planned — the simplest is the owner's raising the
    all-callers burst from 30 to 40 (the bucket measured about 90–100 tokens,
    external-apis 2026-11-06), the frozen experiment's 15 untouched.

## 9. Facts for the other docs; slips

**For the docs** (the supervisor's to place):
- *The budget:* the burst of 30 in 5 s is fully given out (15 + 15); the 80
  a minute left cannot be used by a reader without a burst share (current-task
  item 3, D1 and D2).
- *The collector* (architecture or code-rules): its `TradesFrame` reads trade
  ids as safe integers (`schemas.ts`, `id = z.number().int().safe()`), so a
  trades frame holding an id above 2^53 − 1 fails the schema and is kept raw
  in `rejected-HH` — nothing is lost, but a reader of the tape must read
  `rejected-HH` too, with ids as digits.
- *For v1* (the plan page): about 201 pool accounts hold a small-coin position
  at any hour (old weeks); polling them hourly costs about 34 tokens a minute.

**Slips, all of them.** Two progress entries were first stamped by estimate
in the same command that read the clock (03:44:00Z for 03:49:10Z; 03:55:30Z
for 03:54:55Z) and corrected from the clock in place. One edit through
`node -e` broke a quote in `scripts/c2-live.mjs`; the script failed to parse
before it ran, and the line was mended with the Edit tool. None touched a
number in this plan.

## 10. Evidence

**Read:** CLAUDE.md; `docs/claude-current-task.md`, `claude-code-rules.md`,
`claude-architecture.md`, `claude-external-apis.md`; decisions of
2026-11-13 (both) and of 2026-11-12 from "APPROACH-REVIEW accepted" to "the
freeze"; MARKET-FIND in full; STRATEGY-REVIEW's page one, M1, M2 and 3.1;
`paper-plan-2026-11-12.md` (page one, sections 1's end, 2, 3, 5, 6),
`paper-plan-review-2026-11-12.md` (page one, the findings),
`paper-code-review-2026-11-12.md` (page one), `apps/poller/experiment/rules.md`;
`collector-plan-2026-11-10.md` (the book stream's measures, its section 8);
the code: `src/store/files.ts`, `ws/book-sampler.ts`, `ws/streams.ts`,
`health/coverage.ts`, `api/schemas.ts`, `config.ts`, `src/paper/` (`gate`,
`stats`, `instants`, `store`, `routes`, `rulebook`, `market`, `research`,
`run`, and every module's exports), `research/kit/costs.mjs`, `returns.mjs`,
`panel.mjs`, `test/schemas.test.ts`; MARKET-FIND's `lib.mjs`, `a5`, `a9`,
`a10`–`a14`, `a12c`, `b-set1` scripts and outputs (`inputs\market-find-explore\`).

**Counting scripts** (`scripts/`, outputs in `out/`; SHA-256, first and last
eight digits): `c1-reader.mjs` 64252bad…1cef654c → `c1-reader.out.txt`
a430db93…2463fdcd (the reader's coverage and the holes' cost);
`c2-live.mjs` 67175fa5…d252ed0f → `c2-live.out.txt` 7c8eac36…d7e09ee8 (the
holders an hour, the positions' age); `c3-verdicts.mjs` 658d46ac…f61f764c →
`c3-verdicts.out.txt` 6791ce16…c80e56d7 (the verdicts' shares; arithmetic,
no data); `c4-coins.mjs` 24cabbe1…92eed528 → `c4-coins.out.txt`
0493f84f…43cab73f (the coins). **Inputs:** the seed (1,602 files, every row
before the cut — its builder refused later ones; `c1` throws on any row at or
after the cut, `c2` on any small-coin row), the kit's panel and
`derived\pool-weeks.jsonl.gz`, the kit's `rulebook.json` and
`price-table.json`. **No API call, no web search.**
