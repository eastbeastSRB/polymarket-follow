# WAVE-H's rules (rules.md)

Frozen by hash before any record of TEST is opened (H0). The plan:
`docs/reviews/wave-h-plan-2026-11-13.md`, section 1; its review's fixes R1–R10
(`docs/reviews/wave-h-plan-review-2026-11-14.md`) and the owner's approval
(decisions 2026-11-14, "WAVE-H's plan approved") are folded in. Where a rule
names code, the code in `apps/poller/src/waveh/` (compiled to `dist/waveh/`)
does exactly that; a test pins each rule. Where a rule names MARKET-1
(`apps/poller/market1/rules.md`), WAVE-H means it word for word and imports
MARKET-1's frozen code for it. Every number here is fixed now but M, which the
rehearsal computes from SIZING by H5 and writes in before the freeze. Figures
in brackets are exploring prints or counts, deciding nothing.

*Holds and does not hold are verdicts on this test, never instructions to
trade.*

## H0. Identity and what is frozen

- WAVE-H is one test with one deciding line, **WAVE-H**: MARKET-1's WAVE (M3–M6,
  M9–M11) on Hyperliquid's public archive, over days before Polymarket Perps
  existed, run once. Every other line is beside it and decides nothing.
  **WAVE-H decides nothing for MARKET-1** (decisions 2026-11-13, the owner's
  ruling, call 1): MARKET-1 runs on as frozen, whatever WAVE-H says.
- **Frozen together, what runs** (`waveh/FROZEN.sha256`, sha256sum format,
  paths relative to the package folder, LF bytes as committed): the program
  `dist/waveh.js` and every file of `dist/waveh/`; every other file of the
  repository its imports reach (MARKET-1's and the paper experiment's), byte
  for byte as their own freezes list them — the freeze tool walks the closure
  and checks each against `market1/FROZEN.sha256` and
  `experiment/FROZEN.sha256`; every file of `research/` (the kit, for its
  market object and its CR1 errors); the decoder's three files
  (`node_modules/lz4js/lz4.js`, `util.js`, `xxh32.js`, lz4js 0.2.0), whose
  hashes the program also checks before it loads them; every file of `waveh/`:
  this file, `coins.json` (H3), `sizing.json` (H5) and `data.sha256` (H2),
  each of these four required in the list by name.
- **Shared code** the program imports — the schedule's constants
  (`dist/schedule.js`) and the logger (`dist/log.js`) — is not frozen: each
  run's log lists the hashes of the shared files it used and Node's version
  (information, not a stop), as MARKET-1's M0.
- **The look starts by checking them** (`gate.ts`): the list exists, names
  every file of what runs, and each has its hash. Otherwise the run writes one
  line, "frozen files differ", and stops (exit 4) with nothing sealed opened.
  The gate is open only from that check; the rehearsal runs with the gate
  closed, whatever the freeze.
- **The sealed store.** No file of the store dated 2025-08-01 or later (by
  the date in its key) is opened unless the gate is open; a key whose date
  does not parse is refused the same way. Each reader takes the gate and
  refuses first, before it opens anything. The downloader writes such files
  without opening them: it hashes bytes and parses nothing.
- **A defect found before the look** — in the code, or in the data at the
  look's step 1, before any price exists (H15) — is fixed through a decisions
  entry that names it, with a test that failed before the fix, and a new list
  (`waveh-freeze-2`). **A fix to one of MARKET-1's or the paper experiment's
  files in the closure** stops WAVE-H the same way (exit 4) until a re-freeze
  that re-runs the reproduction; a fix to any other of their files changes
  nothing here. After the look, nothing in this file changes; a new idea is a
  new test.

## H1. Instants

- **SIZING** is the records of the fill files dated before 2025-08-01 whose
  `time` is before 2025-08-01T00:00:00Z — the archive's first fill file
  (2025-05-25 14h) to TEST's start, **67 days and 10 hours** — in the
  rehearsal and at the look alike (R5); a record of such a file stamped
  later is dropped and counted. Counts only (H5). Its positions are priced in
  the rehearsal and kept unread until the look; one whose x_out is at or
  after 2025-08-01 is left for the look (its marks are sealed), and so is
  one whose leg found no live book and whose tape would read a file of TEST.
  The look prices again every SIZING position whose x_out is at or after
  2025-07-31T23:00Z (all the rehearsal can have left) and takes, for each
  position, the rehearsal's outcome where it has one, else the look's. A
  counted fill of a file dated 2025-08-01 or later stamped before that is in
  neither part: dropped and counted, so the look's SIZING is the rehearsal's
  fill for fill.
- **TEST** = [2025-08-01T00:00:00Z, 2026-05-28T00:00:00Z), 300 days: every
  deciding position's fill instant lies in it. Polymarket Perps' first mark
  is 2026-05-28T01:26Z (external-apis).
- **DATA END** = 2026-05-29T01:00:00Z: no record at or after it is used. A
  fill file holds its writer's hour, so a fill can sit in the next hour's
  file; the last fill file read is 2026-05-29 01h.
- **Times** are a fill's `time`, a book snapshot's `data.time`, a funding
  row's `time` and a market-context row's `time` (ms), never a file's hour or
  a writer's clock. "The 60 minutes up to t" is [t − 3,600,000, t], both ends
  included; every other window [a, b). A UTC day is [00:00Z, 00:00Z + 24 h).

## H2. Who, and their fills

- **Every account** of Hyperliquid's first perp dex: every `user` of the fill
  records of the archive (AWS's public bucket `aws-public-blockchain`,
  `v1.1/hyperliquid/mainnet/`): `node_fills/hourly/` from its first file
  (2025-05-25 14h) through 2025-07-27 08h, then `node_fills_by_block/hourly/`
  from 2025-07-27 08h. Addresses are read lower-case. A fill found in both
  formats (the same `user` and `tid`) counts once.
- **A record** is `[user, fill]` — one a line in `node_fills`, a block's
  `events` in `node_fills_by_block` — parsed by WAVE-H's own Zod schema:
  `user` 0x and 40 hex digits; `fill` with `coin`, `px`, `sz` (decimal text),
  `side` "A" | "B", `time` (an integer), `startPosition` (decimal text),
  `crossed` (a boolean), `fee` (decimal text), `tid` (a whole number of any
  size, kept as its digits), and `liquidation` optional `{liquidatedUser?,
  markPx, method}`; other keys are kept or ignored, never required. A record
  that fails is dropped and counted.
- **The store's files:** a file is read only when its SHA-256 equals its
  list's line — `waveh/data.sha256` (every file the main download stored
  before the freeze) at the look, the store's manifest in the rehearsal.
  A fill file that is missing, differs or fails to decompress (the frame must
  end at the file's end), and a UTC day of fill files with more than 1%, and
  at least 10, of its records failing the schema (checked after each of the
  day's files, on its records so far), stop the run (exit 5),
  naming it: the waves cannot be computed around a hole in the fills (the
  route: H0's defect fix). So does an `asset_ctxs` day or a funding window
  (H9, H10) that the run reads and that is missing from its list or differs
  from it, or a day file that fails to decompress; every one of them is
  checked to be in the list before any is read.

## H3. The coins

- **The small coins:** MARKET-1's 38 (M3), by Hyperliquid's names on its
  first perp dex (`waveh/coins.json`: name, Hyperliquid's asset id, MARKET-1's
  instrument id): SOL, HYPE, PUMP, ZEC, XRP, LIT, kPEPE, AAVE, UNI, WLD, NEAR,
  kSHIB, FARTCOIN, DOGE, ENA, ONDO, SUI, VVV, TAO, ADA, ZRO, BNB, PONS,
  CASHCAT, USELESS, KAITO, ARB, LDO, AVAX, LTC, XPL, XMR, LINK, VIRTUAL, JUP,
  ETHFI, PENDLE, MORPHO. A fill whose `coin` is not one of these names
  exactly is none of them (builder dexes' `dex:COIN`, spot's `@n` and pairs
  never match).
- **A coin exists from its first fill** in the archive (its listing). A
  counted fill is a fill of its coin at its instant, so every entry's coin is
  tradable at its instant; there is no other test. [The archive's book files
  show 31 coins in SIZING, PUMP from July, XPL from September, ZEC from
  October, LIT and XMR from early 2026, and none of PONS, CASHCAT, USELESS
  through 2026-05-15: 35 can trade in TEST.]
- **The same asset** (`coins.json`): each name is exactly one entry of
  `meta`'s universe, not delisted, its index the asset id (read 2026-11-14);
  and on 2026-11-06, a day of Polymarket's pre-cut weeks, Hyperliquid's hourly
  closes agree with Polymarket's minute marks (the kit's panel) within 1% at
  every hour [WAVE-H-PLAN's check: the worst USELESS 0.35%].

## H4. A counted fill — the mapping of M4

- **A counted fill:** a record of H2 in a small coin whose fill carries a
  `liquidation` object with `liquidatedUser` equal to the record's `user`
  (the liquidated account's own fill), whose `startPosition` is non-zero and
  of the opposite sign to the fill's side ("B" a buy, +1; "A" a sell, −1),
  and which is either `crossed` (a taker's) or of `method` "backstop".
- **Why "or backstop":** on Polymarket a backstop liquidation's own fill is
  `taker` true (order id 0, fee 0), so M4 counts it (32 of the old weeks' 727
  counted fills); on Hyperliquid the same fill is not `crossed`, the backstop
  vault being the aggressor. Counting the own fill of either method keeps the
  two counts the same event for event; the reproduction (R8) converts the
  pre-cut seed to Hyperliquid's shape and counts MARKET-1's 727 (695 + 32).
- **Its side is the forced side:** "A" a forced sell (a long closed), "B" a
  forced buy (a short closed). **Its instant t** is `time`; **its account**,
  `user`.
- **Order** (M4's): by (time, the coin's asset id, user, `tid` compared as a
  whole number of any size).
- **Not counted:** the counterparty's legs (they carry the object with another
  `liquidatedUser`); an own fill that does not reduce; an own fill neither
  `crossed` nor backstop (the shape of Polymarket's maker liquidation fills,
  which M4 leaves out); a `liquidation` object without `liquidatedUser`;
  auto-deleveraging and settlement fills (no object). Each is counted at the
  rehearsal and the look.

## H5. The slices — the pool

- **slice(a)** = the address a, read as a 160-bit whole number, modulo M.
  Every account falls in exactly one slice; nobody chooses who.
- **M** is fixed once, from SIZING, before the freeze: for each M, r(M) = the
  mean over the M slices of the slice's 60-minute episodes in SIZING (B1's
  rule, MARKET-1's `episodes`, on the slice's counted fills in H4's order),
  divided by SIZING's length in days (67 days 10 hours); M is the value whose
  r(M) is nearest **5.68** (MARKET-FIND's 386 episodes in 68 days), a tie
  taking the larger; the scan runs from M = 1 and stops after the first M
  whose r(M) is below 2.84. The rehearsal computes it and writes it, with the
  scan, in `waveh/sizing.json`; the look recomputes it and stops (exit 5) if
  it differs. **M = 147** (the rehearsal's scan, 2026-11-14: 346 rows, on
  SIZING's 425,433 counted fills) [about 119 on the planner's three sample
  days, which one day alone would have put anywhere from 11 to 411].
- **Each slice is a pool** of its own: M5 and every line beside apply inside
  one slice at a time.
- **Burstier than the pool** (R9) [on the planner's three sample days, at the
  episode-matched M a slice saw 2.91 entries a day, a wave state in 6.4% of
  quarter-hours, about 7.9 different liquidated accounts a day and 7.5 counted
  fills an episode; the old weeks' pool 2.25, 3.9% (257 of 6,528), 2.25 and
  1.88; SIZING's own counts at M = 147: 3.28 entries and 5.70 episodes a
  slice a day, a wave state in 5.4% of quarter-hours, 3.32 different
  liquidated accounts a slice a day (over SIZING, ÷ its days) and 7.5 counted
  fills an episode; at 2M = 294: 1.49, 3.26, 2.7%, 1.66 and 6.6]. M DOUBLED
  (H13) comes nearest the pool's wave-state share; it is printed beside.

## H6. The wave and an entry — M5 inside each slice

- MARKET-1's M5 word for word, with "pool addresses" read as "addresses of
  the slice": the wave state for side σ at t holds when at least two
  different addresses of the slice have a counted fill of side σ, in any
  small coin, with its instant in the 60 minutes up to t; an entry is a
  counted fill f of the slice at whose instant the wave state holds for its
  side, when f's coin has had no entry of that slice with an instant in the
  60 minutes up to t, of either side. MARKET-1's `waveEntries` runs over each
  slice's counted fills of every fill file from the first, in H4's order, so
  an entry before TEST still blocks.
- **WAVE-H's positions:** the entries of **slice 0** with t in TEST. Slice 0
  is one pool, as MARKET-1 has one; it was named without looking at any
  slice's own counts. The other slices' entries are lines beside (H13).

## H7. The position — M6

- MARKET-1's M6 word for word: against the forced side (long after a forced
  sell, short after a forced buy; dir = +1 or −1), **$1,000**, opened at
  x_in = t + 120,000 ms, closed at x_out = x_in + 86,400,000 ms, no stop,
  positions overlapping freely, in one coin and across slices too.

## H8. The price as a taker — M7, on Hyperliquid's archive

- **The book at x:** the coin's last snapshot with `data.time` ≤ x in the
  archive's `market_data/<date>/<hour>/l2Book/<COIN>.lz4` of x's UTC hour;
  when that file holds none at or before x and x lies within 10 seconds after
  its hour's start, the last one ≤ x in the hour before's file. (A snapshot
  of an earlier hour is older than 10 s for any later x, so no other file can
  give a live book.) **Live** when its time ≥ x − 10,000 ms (the archive
  writes one every 0.54 s). **Usable** as M7: both sides hold a level with
  price and size above 0 and the best bid is below the best ask (`levels[0]`
  the bids, `levels[1]` the asks).
- **The walk** is M7's (MARKET-1's `walkOpen` and `walkClose`): $1,000 in,
  p_in = 1,000 ÷ Q; Q out, p_out = Σ(price × q) ÷ Q; what the 20 levels cannot
  fill is filled at the last level's price, flagged **depth short**.
- **Else the tape:** the coin's records with `crossed` true on our side ("B"
  when we buy, "A" when we sell) and `time` in [x, x + 60,000 ms), from the
  fill files of x's hour and the next, leaving out every record whose
  `liquidation` object has `method` "backstop" (its price is the engine's,
  not the book's; R2). They are taken in H4's order — a time-ordered sweep,
  the first takers after x, not a price-sorted book — and walked as levels
  [px, sz] by the same functions; less than the leg's size in that minute is
  depth short. The leg is flagged **tape-priced**, with the reason: "no book
  file" (the archive's listing of x's hour has no file of the coin), "no
  snapshot", "stale" or "not usable".
- **Else unpriced:** "no book and no trade at the entry", "… at the exit". An
  unpriced position is left out of every mean, counted and printed, never
  guessed.
- **A book file that is held but cannot be trusted** — its bytes differ from
  its line in the store's book list, or it fails to decompress — stops the
  run (exit 5, H0's defect route): the tape stands only for a file the archive
  does not have (R7). A snapshot line that fails WAVE-H's schema, or names
  another coin, is dropped and counted as failing.
- Prices and sizes are read into doubles (the kit's convention for research
  figures; no money moves).

## H9. Fees, funding, the net — M9

- **Fee:** **4.5 bps** of each leg's notional (1,000 at the entry, p_out × Q
  at the exit): Hyperliquid's base-tier taker rate (its fee page, read
  2026-11-14; and the most any taker paid in SIZING's sample days, 4.5 bps
  exactly). Never a lower tier, a discount or a rebate.
- **Funding:** every settlement whose nominal hour lies in (x_in, x_out]:
  Σ rate × the mark at the end of the minute before the hour, by the kit's
  `fundingBetween` on the coin's market object (H10); a positive rate, longs
  pay. The rates are Hyperliquid's settled hourly rates (`fundingHistory`,
  stamped 17–69 ms after the hour), stored a window a file, each coin's 20
  windows (the download's: from 2025-05-25, 06-14, 07-04 and 07-24, then from
  2025-08-01 every 20 days to 2026-05-28, the last ending at DATA END):
  **a row's nominal hour is its `time` rounded to the nearest hour** (R1).
  An hour without a row is charged nothing and counted; a settlement without
  a mark leaves the position unpriced.
- **The net**, in bps of the $1,000: M9's formulas exactly — gross = dir ×
  (p_out − p_in) × Q ÷ 1,000 × 10⁴; fees = (f × 1,000 + f × p_out × Q) ÷ 1,000 ×
  10⁴; funding = −dir × Σ × Q ÷ 1,000 × 10⁴; **net = gross − fees + funding.**
- **Also kept per position:** the gross on marks, dir × (the mark at x_out ÷
  the mark at x_in − 1) × 10⁴; the excess, that less dir × BASE (H10); the
  entry's cost at the book (dir × (p_in ÷ the book's mid − 1) × 10⁴; none for a
  tape-priced entry); the deepest level walked; the flags; each leg's source
  (the book file and the snapshot's time, or the tape's `tid`s), so the Final
  review can reprice.

## H10. The marks, the market object, BASE — M12's BASE

- **Marks:** Hyperliquid's `asset_ctxs` day files (`asset_ctxs/<date>.csv.lz4`,
  one row a coin a minute, stamped at the minute's start, and in stretches on
  12 of SIZING's 68 days at another second of it). **The mark at the end of
  minute [m, m + 1 min) is the `mark_px` of the coin's row with the latest
  stamp in (m, m + 1 min]** (R1; decisions 2026-11-14, Q6): a row stamped on
  the boundary m + 1 min wins over an earlier one, of two rows of one stamp
  the first line stands, and for 23:59 the next day file's 00:00 row serves.
  A row's time is `YYYY-MM-DDTHH:MM:SSZ`, whole seconds; a row of another
  form, whose `mark_px` is not a number above 0, or without a coin cell fails
  WAVE-H's schema, is dropped and counted; a day file with more than 1%, and
  at least 10, of its rows of the 38 coins failing stops the run (exit 5), as
  H2's rule for fills. A row stamped at or after the run's end (DATA END at
  the look; TEST's start in the rehearsal, H1) is not read. The coin's
  **market object** is the kit's (`marketFrom`), built from those
  marks and the settled funding rows, so the kit's `markAtMinuteEnd` (5
  minutes' staleness at most) and `fundingBetween` read it unchanged.
- **BASE** (MARKET-1's `baseOf`): for coin i and the 4-hour UTC block b of
  x_in, the mean of (marks[j + 1,440] ÷ marks[j] − 1) × 10⁴ over every whole
  minute j in [TEST's start, TEST's end − 24 h) of coin i whose minute lies in
  block b, with both marks present. A cell with no such minute has no BASE:
  its positions' excess is left out and counted.

## H11. The statistic — M10

- **The set:** WAVE-H's positions (H6) with x_out < DATA END.
- **x** = a position's net in bps, each position alike; **m** = the mean over
  the priced ones.
- **SE** = M10's two-way error, MARKET-1's `twoWay`: √max(V_day + V_market −
  V_both, V_day, V_market), the kit's CR1 variances of the mean clustered by
  the UTC day of t, by the coin, and by the (day, coin) pair.
- **z = 2.58** (two-sided 1%; HOLDS and DOES NOT HOLD each one-sided at 0.5%).

## H12. The verdict — M11

- **WITHHELD** when more than **10%** of the set's positions are unpriced or
  have a depth-short leg (a tape-priced leg is priced).
- **TOO FEW TO TELL** when SE cannot be computed, or when the priced
  positions span fewer than **20 UTC days** (of t) or fewer than **10
  coins**.
- **DOES NOT HOLD** when m + z·SE < **δ = +50 bps** (the owner's line).
- **HOLDS** when m − z·SE > 0 **and** the mean excess (H9) over the priced
  positions that have one is above 0 (F1: a market's drift cannot pass as
  the effect); a position without a BASE cell, or without the marks of its
  gross on marks, has no excess: it is left out of that mean and counted.
  When no priced position has one, there is no mean excess, and HOLDS cannot
  hold.
- **NOT SETTLED** otherwise.
- **The order:** WITHHELD, then TOO FEW TO TELL, then DOES NOT HOLD, then
  HOLDS, then NOT SETTLED; the first that holds is the verdict (so a real
  effect below the owner's line is DOES NOT HOLD, as M11 rules).
- **The sentence:** with NOT SETTLED, "No mean result as large as X bps a
  position was seen.", X = m + z·SE; otherwise "Holds and does not hold are
  verdicts on this test, never instructions to trade."

## H13. The lines beside — deciding nothing, no verdict word

On marks only — the gross on marks and the excess, with M10's two-way error
(by the day alone for a set in one coin, as MARKET-1's lines) — unless said;
their positions need no book. A position without both marks, or without a
BASE cell for its excess, is left out of that mean and counted.
- **ALONE** — B1's episodes of every slice, and those at whose first fill
  the wave state of their slice does not hold for its side (B2) [old weeks
  +131.9 ± 35.1; +22.0 ± 34.9].
- **LATE** — WAVE-H's positions entered 1 h and 3 h later (B3).
- **SIDES** — WAVE-H's forced sells and forced buys apart (B6).
- **EVERY SLICE** — the same rule in each of the M slices: each slice's
  mean gross on marks, the share of slices whose mean is above zero, and all
  slices' positions together with M10's error (the pooled reading), so slice
  0's luck is seen.
- **M HALVED, M DOUBLED, M BY MONTH** — the same rule in slice 0 with ⌈M ÷ 2⌉,
  2M, and, for each calendar month of TEST, its own M by H5's procedure on
  the counted fills whose t lies in the 68 days before the month's first day
  — from SIZING's start at the earliest, r(M) divided by that window's
  length in days, so August's window is SIZING's — each month's positions
  taken from slice 0 of its own M.
- **METHOD** — the positions whose entry fill is a backstop's, and TEST's
  counted fills by method, by month.
- **THE LATE COINS** — the positions in the coins with no record in SIZING,
  apart.
- **BY MONTH** — WAVE-H by UTC month of t, with each month's entries and
  episodes a slice a day, the share of quarter-hours in a wave state (old
  weeks 3.9%), liquidated accounts a slice a day and counted fills an
  episode (R9's counts, at M, inside the month).
- **THE BOOK AND THE TAPE** — the positions with both legs at the book and
  those with a leg at the tape, apart, on the net (H14's prints each): the
  first is the mean with the tape-priced left out.
- **THE TAIL** (B11, MARKET-1's) — the worst UTC day, the largest fall from
  a peak, the most positions open at once, the worst position, the worst
  5%'s average, on the net.
- **THE DAY WITH THE MOST POSITIONS** (2025-10-10, the largest liquidation
  crash on record, is inside TEST and the rule has no stop): that day (the
  earlier on a tie) named with its count and its share; m and SE without it;
  m and SE with each UTC day weighted alike (the mean of the day means, its
  error by day); the share of positions on the five busiest days. On the
  net, printed right under the verdict; they never change it.
- **SIZING** — the same line on SIZING, on the net, printed after the
  verdict, labelled "SIZING: days counted before the freeze, outcomes first
  read at the look": the rehearsal's sealed outcomes, their SHA-256 held to
  `sizing.json`'s and their positions to SIZING's recomputed ones, with the
  positions the rehearsal left priced at the look (H1).

## H14. Prints at the look — M13

For WAVE-H and each set on the net (MARKET-1's M13 prints, its `summarize`,
with z): positions, days, coins, slices; unpriced by reason; tape-priced legs
by reason; depth-short legs; the share not at the book (the unpriced
positions and those with a leg short of depth: H12's WITHHELD share, a
tape-priced leg being priced); the money mean with its two-way SE and the
one-way SEs by day and by coin; Student's band on day clusters; the gross
before costs; fees; funding; the win share; the median and quartiles of the
net; the entry's cost at the book (median, p90); the gross on marks; the
excess with its SE and lower bound and the priced positions without one
(SIZING's positions have no BASE cell, so the SIZING line has no excess); the
mean without the two days that add most; each coin left out. For each line on marks: positions, days, coins, slices; the
gross on marks and the excess with their errors, the excess's lower bound,
the positions without marks and without BASE. Once: the counted fills by
method and coin and the left-out legs by reason (H4); the archive's book
holes by day and WAVE-H's legs they touched; the base-tier check (the
highest taker rate a `crossed` fill in the 38 coins without a builder fee
paid, by month: a month above 4.5 bps is printed as an alarm, the verdict
never withheld for it); the store's files read and their lists' hashes; the
book files' lines read and failing, and the files holding a failing line
(H8).

## H15. The one look

- **Step 1** (`waveh look`): the gate; every fill file, `asset_ctxs` day and
  funding window the look reads named in `data.sha256` — every fill file, the
  370 days to DATA END's and each coin's 20 windows (H9) — else it stops
  (exit 5) before reading any; the 38 coins' marks and funding verified and
  read once into their market objects (H10: a day of mark rows failing stops
  it); every fill file verified and read once; M recomputed from SIZING and
  held to `sizing.json`'s (else exit 5); the counted fills, the slices, the
  entries, WAVE-H's positions and the SIZING positions to price again (H1),
  and their legs. Before any book is fetched and before any price exists, it
  writes (R3) to `look/step1.json`: the records failing by day; the counted
  fills and the own legs by month and method; slice 0's episodes a day by
  month; where the block numbers of `node_fills_by_block` run consecutively,
  the missing blocks by day; the coins with a record in SIZING; the mark rows
  of the 38 coins by day — read, failing, stamped off the minute, given twice,
  stamped from DATA END on; by coin, the minutes without a mark between its
  first and last mark, and the settlements without a mark (H9); the funding
  rows by coin and window, and by coin those failing and stamped from DATA
  END on; and the positions' SHA-256. It writes the book files their legs
  need to `look/books-needed.txt`, then stops (exit 5, "books needed"). A
  data defect seen here is fixed by H0's route before step 2; then
  `look/step1.json` is removed by hand, in the same decisions entry, and step
  1 runs again.
- **Between:** the downloader fetches those book files under the same caps
  and watch as the main download, into the store's book list.
- **Step 2** (`waveh look` again): before reading any store file, it stops
  (exit 5) if a book file of `look/books-needed.txt` is neither in the book
  list nor listed missing, or if the sealed SIZING outcomes
  (`rehearsal/sizing-outcomes.jsonl.gz` under `WAVEH_ROOT`) are missing or
  differ from `sizing.json`'s SHA-256; then it recomputes step 1 and stops
  (exit 5) if its positions' SHA-256 differs from `step1.json`'s or the
  sealed outcomes hold other positions than SIZING's, or leave unpriced a
  position the look does not price again (H1); then it prices every leg;
  the statistic and the verdict, written to
  `look/result.json`; then `look/positions.jsonl.gz` (every position with
  its legs' book file and snapshot time or the tape's `tid`s, H9) and
  `look/report.json` (H13, H14), both made before the result is written.
  Each file is written whole: flushed to a file beside it, then renamed over
  it, a refused rename tried again once a second, 10 times in all. Nothing
  about an outcome is printed or logged before `look/result.json` exists
  (R7). A second step 2 refuses (exit 5, "already run"). A run that crashes
  before its result exists is not a look. **The look is complete when
  `look/positions.jsonl.gz` and `look/report.json` exist beside
  `look/result.json`. If one is missing (a failure between the writes), the
  supervisor moves `result.json` aside (to `look/result.first.json`), in a
  decisions entry, and runs step 2 again: it must write the same
  `positionsSha256`, verdict and numbers as the first, else the difference
  is a code defect (the route below).**
- **Then:** the report `docs/reviews/wave-h-look-<date>.md` and a Final review
  that recomputes WAVE-H with independent code, position by position. **A
  code defect it finds** is fixed by M0's route (a decisions entry, a test
  that failed before the fix, the positions whose numbers change, a new
  list) and the same frozen rules re-run (R7).
- **After the look** no number, line, coin, threshold, instant or rule of
  this file changes.
- **Runs:** from the repository's build only (no run copy, no task, no page),
  by hand, one at a time, at idle priority, with an 8 GB heap (`node
  --max-old-space-size=8192 dist/waveh.js rehearse`, and `… look`; decisions
  2026-11-14, Q5), starting no file in 02:30–06:00Z or 10:25–11:15Z: `waveh
  rehearse` (the gate closed whatever the freeze, the download's manifest as
  the list) and `waveh look`. Settings, no defaults:
  `WAVEH_STORE` (the download's store, read only) and `WAVEH_ROOT` (the
  program's own files; the look's must hold the rehearsal's folder). Exit
  codes: 0 done, 1 crash, 2 bad settings, 4 frozen files differ, 5 not ready
  (books needed, a store file missing or failing, a hold above) or already
  run.
