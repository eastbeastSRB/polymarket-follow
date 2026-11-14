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
  this file, `coins.json` (H3), `sizing.json` (H5) and `data.sha256` (H2).
- **Shared code** the program imports (the schedule's constants) is not
  frozen: each run's log lists the hashes of the shared files it used and
  Node's version (information, not a stop), as MARKET-1's M0.
- **Every run starts by checking them** (`gate.ts`): the list exists, names
  every file of what runs, and each has its hash. Otherwise the run writes one
  line, "frozen files differ", and stops (exit 4) with nothing sealed opened.
  The gate is open only from that check.
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
  after 2025-08-01 is left for the look (its marks are sealed).
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
  at least 10, of its records failing the schema, stop the run (exit 5),
  naming it: the waves cannot be computed around a hole in the fills (the
  route: H0's defect fix).

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
  it differs. **M = …** (written in by the rehearsal) [about 119 on the
  planner's three sample days, which one day alone would have put anywhere
  from 11 to 411].
- **Each slice is a pool** of its own: M5 and every line beside apply inside
  one slice at a time.
- **Burstier than the pool** (R9) [on the planner's three sample days, at the
  episode-matched M a slice saw 2.91 entries a day, a wave state in 6.4% of
  quarter-hours, about 7.9 different liquidated accounts a day and 7.5 counted
  fills an episode; the old weeks' pool 2.25, 3.9% (257 of 6,528), 2.25 and
  1.88; SIZING's own counts: written in by the rehearsal]. M DOUBLED (H13)
  matches the pool's wave-state share; it is printed beside.

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
  does not have (R7). A snapshot line that fails WAVE-H's schema is dropped
  and counted.
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
  stamped 17–69 ms after the hour): **a row's nominal hour is its `time`
  rounded to the nearest hour** (R1). An hour without a row is charged
  nothing and counted; a settlement without a mark leaves the position
  unpriced.
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
  one row a coin a minute, stamped at the minute's start). **The mark at the
  end of minute [m, m + 1 min) is the `mark_px` of the coin's row stamped
  m + 1 min** (for 23:59, the next day file's 00:00 row) (R1). A row stamped
  at or after DATA END is not read. The coin's **market object** is the kit's
  (`marketFrom`), built from those marks and the settled funding rows, so the
  kit's `markAtMinuteEnd` (5 minutes' staleness at most) and `fundingBetween`
  read it unchanged.
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
- **NOT SETTLED** otherwise.
- **The order:** WITHHELD, then TOO FEW TO TELL, then DOES NOT HOLD, then
  HOLDS, then NOT SETTLED; the first that holds is the verdict (so a real
  effect below the owner's line is DOES NOT HOLD, as M11 rules).
- **The sentence:** with NOT SETTLED, "No mean result as large as X bps a
  position was seen.", X = m + z·SE; otherwise "Holds and does not hold are
  verdicts on this test, never instructions to trade."

## H13. The lines beside — deciding nothing, no verdict word

On marks only — the gross on marks and the excess, with M10's two-way error —
unless said; their positions need no book.
- **ALONE** — B1's episodes of every slice, and those at whose first fill
  the wave state of their slice does not hold for its side (B2) [old weeks
  +131.9 ± 35.1; +22.0 ± 34.9].
- **LATE** — WAVE-H's positions entered 1 h and 3 h later (B3).
- **SIDES** — WAVE-H's forced sells and forced buys apart (B6).
- **EVERY SLICE** — the same rule in each of the M slices: each slice's
  mean, the share of slices above zero, and all slices' positions together
  with M10's error (the pooled reading), so slice 0's luck is seen.
- **M HALVED, M DOUBLED, M BY MONTH** — the same rule in slice 0 with ⌈M ÷ 2⌉,
  2M, and M set for each calendar month of TEST from the 68 days before it by
  H5's procedure.
- **METHOD** — the positions whose entry fill is a backstop's, and the
  counted fills by method, by month.
- **THE LATE COINS** — the positions in the coins with no fill in SIZING,
  apart.
- **BY MONTH** — WAVE-H by UTC month of t, with each month's episodes a
  slice a day and the share of quarter-hours in a wave state (old weeks
  3.9%).
- **THE BOOK AND THE TAPE** — the book-priced and the tape-priced positions
  apart, at the book's net; the mean with the tape-priced left out.
- **THE TAIL** (B11) — the worst UTC day, the largest fall from a peak, the
  most positions open at once, the worst position, the worst 5%'s average,
  on the net.
- **THE DAY WITH THE MOST POSITIONS** (2025-10-10, the largest liquidation
  crash on record, is inside TEST and the rule has no stop): that day named
  with its count and its share; m and SE without it; m and SE with each UTC
  day weighted alike (the mean of the day means, its error by day); the share
  of positions on the five busiest days. On the net, printed right under the
  verdict; they never change it.
- **SIZING** — the same line on SIZING, on the net, printed after the
  verdict, labelled "SIZING: days counted before the freeze, outcomes first
  read at the look".

## H14. Prints at the look — M13

For WAVE-H and each line beside: positions, days, coins, slices; unpriced by
reason; tape-priced legs by reason; depth-short legs; the share not at the
book; the money mean with its two-way SE and the one-way SEs by day and by
coin; Student's band on day clusters; the gross before costs; fees; funding;
the win share; the median and quartiles of the net; the entry's cost at the
book (median, p90); the gross on marks; the excess with its SE and lower
bound and the priced positions without one; the mean without the two days
that add most; each coin left out; the counted fills by method and coin and
the left-out legs by reason (H4); the archive's book holes by day and the legs
they touched; the base-tier check (the highest taker rate a `crossed` fill
without a builder fee paid, by month: a month above 4.5 bps is printed as an
alarm, the verdict never withheld for it); the store's files read and their
list's hash.

## H15. The one look

- **Step 1** (`waveh look`): the gate; every store file verified; the counted
  fills, the slices, the entries, the positions and their legs. Before any
  book is fetched and before any price exists, it prints (R3): the records
  failing by day; the counted fills and the own legs by month and method; the
  slice's episodes a day by month; and, where the block numbers of
  `node_fills_by_block` run consecutively, the missing blocks by day. It
  writes the list of the book files WAVE-H's legs need with the positions'
  SHA-256, then stops (exit 5, "books needed"). A data defect seen here is
  fixed by H0's route before step 2.
- **Between:** the downloader fetches those book files under the same caps
  and watch as the main download, into the store's book list.
- **Step 2** (`waveh look` again): recomputes step 1 and stops if its
  positions' hash differs; prices every leg; the statistic, the verdict and
  every print. Nothing about an outcome is printed or logged before
  `look/result.json` exists (R7); the report's tables come after it. A second
  step 2 refuses (exit 5, "already run"). A run that crashes before its
  result exists is not a look.
- **Then:** the report `docs/reviews/wave-h-look-<date>.md` and a Final review
  that recomputes WAVE-H with independent code, position by position. **A
  code defect it finds** is fixed by M0's route (a decisions entry, a test
  that failed before the fix, the positions whose numbers change, a new
  list) and the same frozen rules re-run (R7).
- **After the look** no number, line, coin, threshold, instant or rule of
  this file changes.
- **Runs:** from the repository's build only (no run copy, no task, no page),
  by hand, one at a time. Settings, no defaults: `WAVEH_STORE` (the
  download's store, read only) and `WAVEH_ROOT` (the program's own files).
  Exit codes: 0 done, 1 crash, 2 bad settings, 4 frozen files differ, 5 not
  ready (books needed, a store file missing or failing) or already run.
