# WAVE-H-PLAN — WAVE-H, MARKET-1's wave tested once on Hyperliquid's history: its frozen rules, its data, its build

WAVE-H-PLAN (Opus 5.5, max), 2026-11-13 23:40Z – 2026-11-14 00:32Z (UTC; every stamp
from `date -u`), for polymarket-follow's supervisor. The frame: decisions
2026-11-13, "the two outside researches — the owner's ruling", call 1 (WAVE-H
first, in this project, by MARKET-1's road). Started from WAVE-ELSEWHERE's
design (`docs/reviews/wave-elsewhere-2026-11-13.md`, sections 1.1, 2 and 4)
and WAVE-CHECKS' facts (`docs/reviews/wave-checks-2026-11-13.md`;
external-apis, "Other venues"). The form: MARKET-PLAN and its review.
Evidence: the supervisor folder's `workers/WAVE-H-PLAN/` (`progress.md`;
`requests.tsv`, every network request numbered). **This is a plan: nothing
is built before a fresh review and the owner's approval.** It plans a paper
test on history; it never trades and tells no one what to trade.

**The blind store held.** No file dated 2025-08-01 → 2026-05-28 was
downloaded or opened: the test months were listed only (names and sizes).
Downloads: 1,561,726,689 bytes (1.56 GB) from the sizing months only (2025-06-07 → 2025-07-17),
kept in my scratchpad and deleted at the end. Read for counts and shapes, all
before Polymarket's cut: the paper experiment's seed and pre-cut panel (one
copy each into my scratchpad) and R8's captured tape. Never opened: the
collector's recordings, its database, the run folder, the paper experiment's
data after the cut, MARKET-1's folder. No call to Polymarket's API. 594
network requests, one at a time, at least 1.2 s apart (Hyperliquid's reads
2.5 s), User-Agent `research-check/1.0`: listings and files of AWS's public
bucket without credentials, Hyperliquid's public `POST /info` (never
`/exchange`), one documentation page (Hyperliquid's fees), and one package install into my scratchpad (`lz4js` 0.2.0). No agent started; polymarket-lab not touched; nothing
in the repository changed but this file.

## For the owner, in one page

*Words.* A **bp** is 0.01%. MARKET-1's **wave**: at least two different
tracked accounts liquidated the same way in small coins within an hour; its
**position**: $1,000 against the forced side, 2 minutes later, held a day. A
**slice** is a fixed share of all Hyperliquid's accounts, chosen by the
digits of the address, so nobody picks who is in it. **SIZING** is the 68
days before the test (2025-05-25 → 07-31), read for counts only; **TEST** is
the 300 days 2025-08-01 → 2026-05-27, before Polymarket Perps existed.

**What WAVE-H is.** MARKET-1's own rule, run once on Hyperliquid's public
archive over TEST, frozen by hash before anyone looks, as MARKET-1 was. It
answers one question: did the wave's move back happen on another venue, on
days nobody here has studied? It decides nothing for MARKET-1, which runs on
as frozen.

**The plan in ten lines.**
1. **The counted fill.** On Polymarket a backstop liquidation's own fill is
   a taker's (order id 0, fee 0) and MARKET-1 counts it: 32 of the old
   weeks' 727 counted fills. On Hyperliquid the same fill is not `crossed`.
   So WAVE-H counts the liquidated account's own fill by either method.
2. **The pool.** Hyperliquid's accounts cut into M slices by address, M
   fixed before the freeze from SIZING so that a slice sees liquidations as
   often as Polymarket's pool did (5.68 episodes a day): about 120 on three
   sample days; the rehearsal fixes it on all 67. **Slice 0 decides**;
   every slice is printed beside, on marks.
3. **The coins.** MARKET-1's 38 by Hyperliquid's names (`kPEPE`, `kSHIB`),
   each from its first fill; 35 trade in TEST. Each is one entry of Hyperliquid's market list, and on 2026-11-06 every hourly close was within 0.36% of Polymarket's own mark: the same assets.
4. **Prices.** The archived order book (a snapshot every 0.54 s, 20 levels)
   walked as MARKET-1 walks its book; in the archive's holes (5% of TEST's
   hours, mostly 2025-10-16 → 22 and 11-17 → 25) the next 60 seconds of real
   takers on our side. Fee 4.5 bps a leg (the base tier, read on the fee
   page and paid in the data); settled hourly funding; MARKET-1's matched
   baseline.
5. **The verdict, once.** HOLDS when the mean net minus 2.58 errors is above
   zero and the result beats the baseline; DOES NOT HOLD when the mean plus
   2.58 errors is below +50 bps; otherwise NOT SETTLED, with the largest
   result not ruled out.
6. **The crash day** (2025-10-10) stays in, as MARKET-1 would meet it; it is
   printed apart, with the result without it and with each day alike.
7. **The data.** About 223 GB before the freeze (fills 219 GB, minute marks
   4 GB, funding), free, no account; the books of the positions' legs (a
   few GB) fetched inside the look. At 2 MB/s, paused in the paper
   experiment's and MARKET-1's run windows and whenever the collector shows
   strain: about two days in the background.
8. **The seal.** The test months sit in a store the program refuses to open
   until its freeze list exists (MARKET-1's gate); the downloader never
   opens a file.
9. **The code.** A fourth entry point of the poller, run from the
   repository only (no task, no page), importing MARKET-1's frozen wave,
   walk and statistic code rather than copying it.
10. **Time.** About ten sessions over two weeks; the downloads run beside
    them and never wait on a session.

**What it could show** [arithmetic, a guide only]: if slice 0's waves come
as on the three sample days (2.9 entries a day, on about two days in five:
some 870 positions on 126 days) and a day's noise is the old weeks', its
error is about 40 bps [67.7 × √(47 ÷ 126)]. HOLDS then needs a mean above
about 105 bps: a true +150 is caught about 86 times in 100, a true +100
about 45, the old weeks' +297 nearly always. With nothing there, DOES NOT
HOLD comes about 9 times in 100 and NOT SETTLED otherwise, its sentence
then ruling out about +105 — well under the old weeks' +297.

**Your decisions** (section 8, each with my recommendation): the counted
fill (both methods); slice 0 deciding; M fixed now; the tape counted as a
price; z, δ and the minimums; the crash day in; the download's cap, windows
and watch; the books fetched inside the look; what is deleted after; WAVE-H
without Polymarket's own months.

---

## 1. The rules — draft `apps/poller/waveh/rules.md`, in full

*To be frozen by hash (section 5, part 4) before any record of TEST is
opened. Every number below is fixed here, but M, which the rehearsal
computes from SIZING by H5's procedure and writes in before the freeze.
Where a rule names MARKET-1 (`apps/poller/market1/rules.md`), WAVE-H means
it word for word and imports MARKET-1's frozen code for it. Old-weeks
figures in brackets are MARKET-FIND's exploring prints, deciding nothing.*

*Holds and does not hold are verdicts on this test, never instructions to
trade.*

### H0. Identity and what is frozen

- WAVE-H is one test with one deciding line, **WAVE-H**: MARKET-1's WAVE
  (M3–M6, M9–M11) on Hyperliquid's public archive, over days before
  Polymarket Perps existed, run once. Every other line is beside it and
  decides nothing. **WAVE-H decides nothing for MARKET-1** (decisions
  2026-11-13, the owner's ruling, call 1): MARKET-1 runs on as frozen,
  whatever WAVE-H says.
- **Frozen together** (`waveh/FROZEN.sha256`, sha256sum format, paths
  relative to `apps/poller`, LF bytes as committed): the program
  (`dist/waveh.js`, every file of `dist/waveh/`); the MARKET-1 files it
  imports, byte for byte as MARKET-1's freeze lists them, and the paper and
  shared files those import (the freeze tool lists the closure and checks
  each against MARKET-1's and the paper experiment's freezes); every file of
  `research/` (the kit, for its market object and CR1 errors); every file
  of `waveh/` — this file, `coins.json` (H3), `sizing.json` (H5) and
  `data.sha256` (H2: every file of the store downloaded before the freeze,
  with its SHA-256).
- **Every run starts by checking them** (WAVE-H's `gate.ts`, MARKET-1's
  pattern): the list exists, names every file of what runs, and each has
  its hash; else one line, "frozen files differ", and exit 4, nothing
  sealed opened.
- **The sealed store.** No file of the store dated 2025-08-01 or later
  (by the date in its path) is opened, and no record stamped at or after
  2025-08-01T00:00Z is used, unless that check passed; each reader takes
  the gate and refuses first, before it opens anything (MARKET-1's
  `checkSealed`). The downloader writes such files without opening them:
  it hashes bytes and parses nothing.
- **A defect found before the look** is fixed through a decisions entry
  that names it, with a test that failed before the fix, and a new list
  (`waveh-freeze-2`). After the look, nothing in this file changes; a new
  idea is a new test.

### H1. Instants

- **SIZING** = [2025-05-25T14:00:00Z, 2025-08-01T00:00:00Z): the first
  hour of the archive's fill files to TEST's start (67.4 days). Counts only
  (H5); its positions are priced in the rehearsal and kept unread until the
  look (H15).
- **TEST** = [2025-08-01T00:00:00Z, 2026-05-28T00:00:00Z), 300 days: every
  deciding position's fill instant lies in it. Polymarket Perps' first
  mark is 2026-05-28T01:26Z (external-apis).
- **DATA END** = 2026-05-29T01:00:00Z: no record at or after it is used
  (the last exit is 2026-05-29T00:02Z; a file holds its writer's hour, so a
  fill can sit in the next hour's file).
- **Times** are a fill's `time` and a book snapshot's `data.time` (ms),
  never a file's hour or a writer's clock. "The 60 minutes up to t" is
  [t − 3,600,000, t], both ends included; every other window [a, b). A UTC
  day is [00:00Z, 00:00Z + 24 h).

### H2. Who, and their fills

- **Every account** of Hyperliquid's first perp dex: every `user` of the
  archive's fill records (`v1.1/hyperliquid/mainnet/` of AWS's public bucket
  `aws-public-blockchain`): `node_fills/hourly/` from its first file
  (2025-05-25 14h) through 2025-07-27, then `node_fills_by_block/hourly/`
  (from 2025-07-27). Addresses are read lower-case. A fill found in both
  formats (same `user` and `tid`) counts once.
- **A record** is `[user, fill]` (one a line in `node_fills`; a block's
  `events` in `node_fills_by_block`), parsed by WAVE-H's own Zod schema:
  `user` 0x and 40 hex digits; `fill` with `coin`, `px`, `sz` (decimal
  text), `side` "A" | "B", `time` (integer), `startPosition` (decimal text),
  `crossed` (boolean), `fee` (decimal text), `tid` (digits, any size), and
  `liquidation` optional `{liquidatedUser?, markPx, method}`; other keys
  are kept or ignored, never required. A record that fails is dropped and
  counted.
- **The store's files** (H0's `data.sha256`): a file is read only when its
  SHA-256 equals the list's; a TEST fill file that is missing, differs, or
  fails to decompress stops the look (exit 5), naming it — the waves cannot
  be computed around a hole in the fills. A day with more than 1%, and at
  least 10, of its records failing the schema stops it the same way.

### H3. The coins

- **The small coins:** MARKET-1's 38 (M3), by Hyperliquid's names on its
  first perp dex (`waveh/coins.json`: name, Hyperliquid's asset id,
  MARKET-1's instrument id): SOL, HYPE, PUMP, ZEC, XRP, LIT, kPEPE, AAVE,
  UNI, WLD, NEAR, kSHIB, FARTCOIN, DOGE, ENA, ONDO, SUI, VVV, TAO, ADA, ZRO,
  BNB, PONS, CASHCAT, USELESS, KAITO, ARB, LDO, AVAX, LTC, XPL, XMR, LINK,
  VIRTUAL, JUP, ETHFI, PENDLE, MORPHO. A fill whose `coin` is not one of
  these names exactly is none of them (builder dexes' `dex:COIN`, spot's
  `@n` and pairs never match).
- **Each coin counts from its first fill** in the archive (its listing):
  before it, the coin does not exist here; from it, the coin is tradable.
  [The archive's book files show 31 coins in SIZING, PUMP from July, XPL
  from September, ZEC from October, LIT and XMR from early 2026, and none
  of PONS, CASHCAT, USELESS through 2026-05-15: 35 can trade in TEST.]
- **The same asset** (checked before the freeze, its result in
  `coins.json`): each name is one entry of `meta`'s universe, not delisted,
  its index the asset id; and on 2026-11-06, a day of Polymarket's pre-cut
  weeks, Hyperliquid's hourly closes agree with Polymarket's minute marks
  (the kit's panel) within 1% at every hour. [Checked by this plan, 2026-11-14 (requests 553–591): one entry each, not delisted; every hourly close within 0.36% of Polymarket's mark — the worst USELESS 0.35%, PONS 0.30%, ETHFI 0.25%; kPEPE 0.10%, kSHIB 0.09%.]
- **The large coins,** for lines beside only: BTC, ETH.

### H4. A counted fill — the mapping of M4

- **A counted fill:** a record of H2 in a small coin whose fill carries a
  `liquidation` object with `liquidatedUser` equal to the record's `user`
  (the liquidated account's own fill), whose `startPosition` is non-zero
  and of the opposite sign to the fill's side ("B" a buy, +1; "A" a sell,
  −1), and which is either `crossed` (a taker's) or of `method` "backstop".
- **Why "or backstop"** (the evidence: section 2): on Polymarket a
  backstop liquidation's own fill is `taker` true (order id 0, fee 0), so
  M4 counts it; on Hyperliquid the same fill is not `crossed`, the backstop
  vault being the aggressor. Counting the own fill of either method keeps
  the two counts the same event for event.
- **Its side is the forced side:** "A" a forced sell (a long closed), "B" a
  forced buy (a short closed). **Its instant t** is `time`; **its account**,
  `user`.
- **Order** (M4's): by (time, the coin's asset id, user, `tid` compared as a
  whole number of any size).
- **Not counted, and counted at the look:** the counterparty's legs (they
  carry the object with another `liquidatedUser`; Polymarket marks none of
  them); an own fill that does not reduce; an own fill neither `crossed` nor
  backstop (the shape of Polymarket's 16 maker liquidation fills, which M4
  leaves out; none seen in SIZING's sample days); a `liquidation` object
  without `liquidatedUser`; auto-deleveraging and settlement fills (no
  object).

### H5. The slices — the pool

- **slice(a)** = the address a, read as a 160-bit whole number, modulo M.
  Every account falls in exactly one slice; nobody chooses who.
- **M** is fixed once, from SIZING, before the freeze: for each M, r(M) =
  the mean over the M slices of the slice's 60-minute episodes in SIZING
  (B1's rule on the slice's counted fills, in H4's order), divided by
  SIZING's length in days (67.42); M is the value whose r(M) is nearest
  **5.68** (MARKET-FIND's 386 episodes in 68 days), a tie taking the
  larger; the scan runs from M = 1 and stops once r(M) is below 2.84. The
  rehearsal computes it and writes it, with the scan, in `sizing.json`;
  the look recomputes it and stops if it differs. **M = …** (written in by
  the rehearsal; about 120 on three sample days, which one day alone
  would have put anywhere from 11 to 411).
- **Each slice is a pool** of its own: M5 and every line beside apply
  inside one slice at a time.

### H6. The wave and an entry — M5 inside each slice

- MARKET-1's M5 word for word, with "pool addresses" read as "addresses of
  the slice": the wave state for side σ at t holds when at least two
  different addresses of the slice have a counted fill of side σ, in any
  small coin, with its instant in the 60 minutes up to t; an entry is a
  counted fill f of the slice at whose instant the wave state holds for its
  side, when f's coin has had no entry of that slice with an instant in the
  60 minutes up to t, of either side. MARKET-1's `waveEntries` runs over
  each slice's counted fills from SIZING's start, so an entry before TEST
  still blocks.
- **WAVE-H's positions:** the entries of **slice 0** with t in TEST, their
  coin tradable at t (H3). Slice 0 is one pool, as MARKET-1 has one; it was
  named without looking at any slice's own counts. The other slices'
  entries are lines beside (H13).

### H7. The position — M6

- MARKET-1's M6 word for word: against the forced side (long after a
  forced sell, short after a forced buy; dir = +1 or −1), **$1,000**, opened
  at x_in = t + 120,000 ms, closed at x_out = x_in + 86,400,000 ms, no stop,
  positions overlapping freely, in one coin and across slices too.

### H8. The price as a taker — M7, on Hyperliquid's archive

- **The book at x:** the coin's last snapshot with `data.time` ≤ x in the
  archive's `market_data/<date>/<hour>/l2Book/<COIN>.lz4` of x's hour, or
  of the hour before when x's file holds none at or before x. **Live**
  when that snapshot's time ≥ x − 10,000 ms (the archive writes one every
  0.54 s). **Usable** as M7: both sides hold a level with price and size
  above 0 and the best bid is below the best ask.
- **The walk** is M7's (MARKET-1's `walkOpen` and `walkClose`): $1,000 in,
  p_in = 1,000 ÷ Q; Q out, p_out = Σ(price × q) ÷ Q; what the 20 levels
  cannot fill is filled at the last level's price, flagged **depth short**.
- **Else the tape:** the coin's records with `crossed` true on our side
  ("B" when we buy, "A" when we sell) and `time` in [x, x + 60,000 ms), in
  M4's order, walked as levels [px, sz] by the same functions; less than
  the leg's size in that minute is depth short. The leg is flagged
  **tape-priced**, with the reason (no book file, no snapshot, stale, not
  usable).
- **Else unpriced:** "no book and no trade at the entry", "… at the exit".
  An unpriced position is left out of every mean, counted and printed,
  never guessed.
- Prices and sizes are read into doubles (the kit's convention for research
  figures; no money moves).

### H9. Fees, funding, the net — M9

- **Fee:** **4.5 bps** of each leg's notional (1,000 at the entry, p_out × Q
  at the exit): Hyperliquid's base-tier taker rate (its fee page, read
  2026-11-14; and the most any taker paid in SIZING's sample days, 4.5 bps
  exactly). Never a lower tier, a discount or a rebate.
- **Funding:** every settlement whose hour lies in (x_in, x_out]: Σ rate ×
  the mark at the end of the minute before the hour, by the kit's
  `fundingBetween` on the coin's market object (H10); a positive rate,
  longs pay. The rates are Hyperliquid's settled hourly rates
  (`fundingHistory`); an hour without one is charged nothing and counted; a
  settlement without a mark leaves the position unpriced.
- **The net**, in bps of the $1,000: M9's formulas exactly — gross = dir ×
  (p_out − p_in) × Q ÷ 1,000 × 10⁴; fees = (f × 1,000 + f × p_out × Q) ÷
  1,000 × 10⁴; funding = −dir × Σ × Q ÷ 1,000 × 10⁴; **net = gross − fees +
  funding.**
- **Also kept per position:** the gross on marks, dir × (the mark at x_out
  ÷ the mark at x_in − 1) × 10⁴; the excess, that less dir × BASE (H10);
  the entry's cost at the book; the deepest level walked; the flags; the
  book snapshot's or the trades' identity, so the Final review can reprice.

### H10. The marks, the market object, BASE — M12's BASE

- **Marks:** Hyperliquid's `asset_ctxs` (one row a coin a minute):
  `mark_px` of the row stamped at a minute's end is that minute's mark. The
  coin's **market object** is the kit's (`marketFrom`), built from those
  marks and the settled funding rows, so the kit's `markAtMinuteEnd` (5
  minutes' staleness at most) and `fundingBetween` read it unchanged.
- **BASE** (MARKET-1's `baseOf`): for coin i and the 4-hour UTC block b of
  x_in, the mean of (marks[j + 1,440] ÷ marks[j] − 1) × 10⁴ over every whole
  minute j in [TEST's start, TEST's end − 24 h) of coin i whose minute lies
  in block b, with both marks present. A cell with no such minute has no
  BASE: its positions' excess is left out and counted.

### H11. The statistic — M10

- **The set:** WAVE-H's positions (H6) with x_out < DATA END.
- **x** = a position's net in bps, each position alike; **m** = the mean
  over the priced ones.
- **SE** = M10's two-way error, MARKET-1's `twoWay`: √max(V_day + V_market
  − V_both, V_day, V_market), the kit's CR1 variances of the mean clustered
  by the UTC day of t, by the coin, and by the (day, coin) pair.
- **z = 2.58** (two-sided 1%; HOLDS and DOES NOT HOLD each one-sided at
  0.5%).

### H12. The verdict — M11

- **WITHHELD** when more than **10%** of the set's positions are unpriced
  or have a depth-short leg.
- **TOO FEW TO TELL** when SE cannot be computed, or when the priced
  positions span fewer than **20 UTC days** (of t) or fewer than **10
  coins**.
- **DOES NOT HOLD** when m + z·SE < **δ = +50 bps** (the owner's line).
- **HOLDS** when m − z·SE > 0 **and** the mean excess (H9) over the priced
  positions that have one is above 0 (F1: a market's drift cannot pass as
  the effect).
- **NOT SETTLED** otherwise.
- **The order:** WITHHELD, then TOO FEW TO TELL, then DOES NOT HOLD, then
  HOLDS, then NOT SETTLED; the first that holds is the verdict (so a real
  effect below the owner's line is DOES NOT HOLD, as M11 rules).
- **The sentence:** with NOT SETTLED, "No mean result as large as X bps a
  position was seen.", X = m + z·SE; otherwise "Holds and does not hold are
  verdicts on this test, never instructions to trade."

### H13. The lines beside — deciding nothing, no verdict word

On marks only — the gross on marks and the excess, with M10's two-way
error — unless said; their positions need no book.
- **ALONE** — B1's episodes of every slice, and those at whose first fill
  the wave state does not hold (B2) [old weeks +131.9 ± 35.1; +22.0 ± 34.9].
- **LATE** — WAVE-H's positions entered 1 h and 3 h later (B3).
- **SIDES** — forced sells and forced buys apart (B6).
- **EVERY SLICE** — the same rule in each of the M slices: each slice's
  mean, the share of slices above zero, and all slices' positions together
  with M10's error (the pooled reading), so slice 0's luck is seen.
- **M HALVED, M DOUBLED, M BY MONTH** — the same rule with ⌈M ÷ 2⌉, 2M,
  and M set for each calendar month from the 68 days before it by H5's
  procedure (WAVE-ELSEWHERE's H5).
- **METHOD** — positions whose entry fill is a backstop's, and the counted
  fills by method, by month.
- **THE LATE COINS** — positions in the coins listed after SIZING apart.
- **BY MONTH** — WAVE-H by UTC month of t, with each month's episodes a
  slice a day and the share of quarter-hours in a wave state (old weeks
  3.7%).
- **THE BOOK AND THE TAPE** — the book-priced and the tape-priced positions
  apart; the mean with the tape-priced left out.
- **THE TAIL** (B11) — the worst UTC day, the largest fall from a peak, the
  most positions open at once, the worst position, the worst 5%'s average.
- **THE DAY WITH THE MOST POSITIONS** (2025-10-10, the largest liquidation
  crash on record, is inside TEST and the rule has no stop): that day named
  with its count and its share; m and SE without it; m and SE with each
  UTC day weighted alike (the mean of the day means, its error by day); the
  share of positions on the five busiest days. Printed right under the
  verdict; they never change it.
- **SIZING** — the same line on SIZING, printed after the verdict, labelled
  "SIZING: days counted before the freeze, outcomes first read at the
  look".

### H14. Prints at the look — M13

For WAVE-H and each line beside: positions, days, coins, slices; unpriced
by reason; tape-priced legs by reason; depth-short legs; the share not at
the book; the money mean with its two-way SE and the one-way SEs by day and
by coin; Student's band on day clusters; the gross before costs; fees;
funding; the win share; the median and quartiles of the net; the entry's
cost at the book (median, p90); the gross on marks; the excess with its SE
and lower bound and the priced positions without one; the mean without the
two days that add most; each coin left out; the counted fills by method and
coin and the left-out legs by reason (H4); the archive's holes by day and
the legs they touched; the base-tier check (the highest taker rate a
`crossed` fill without a builder fee paid, by month: a month above 4.5 bps
is printed as an alarm, the verdict never withheld for it); the store's
files read and their hashes' list.

### H15. The one look

- **Step 1** (`waveh look`): the gate; every store file verified; the
  counted fills, the slices, the entries, the positions and their legs;
  the list of the book files WAVE-H's legs need, written with the
  positions' SHA-256; then it stops (exit 5, "books needed").
- **Between:** the downloader fetches those book files (the same caps and
  watch as section 3), appending them to the store's second list,
  `books.sha256`.
- **Step 2** (`waveh look` again): recomputes step 1 and stops if its
  positions' hash differs; prices every leg (a book file missing or
  differing from `books.sha256` gives the tape); the statistic, the verdict
  and every print; `look/result.json` and the report's tables. A second
  step 2 refuses (exit 5, "already run"). A run that crashes before its
  result exists is not a look.
- **Then:** the report `docs/reviews/wave-h-look-<date>.md` and a Final
  review that recomputes WAVE-H with independent code, position by
  position.
- **After the look** no number, line, coin, threshold, instant or rule of
  this file changes.

## 2. MARKET-1's definition, field by field

### 2.1 The mapping

| MARKET-1 (`market1/rules.md`) | WAVE-H on Hyperliquid's archive | Same? |
|---|---|---|
| M2 the pool: 1,602 accounts chosen from the boards | every account, cut into M slices by address; each slice a pool (H5) | the one deliberate change (2.3) |
| M2 their fills, as the paper experiment stores them | every `[user, fill]` record of the fill files | wider: no reader cap (MARKET-1 sees 138 of 153 old entries) |
| M3 38 small coins, fixed | the same 38 by name, each from its first fill; 35 trade in TEST | the same assets (H3's check) |
| M3 tradable at t (the rule book) | the coin has had a fill at or before t | no close-only record exists in the archive |
| M4 `liquidation` true | a `liquidation` object whose `liquidatedUser` is the record's `user` | yes: Polymarket flags only the own leg; Hyperliquid marks both, and the user test keeps the own one |
| M4 `taker` true | `crossed` true, **or** `method` "backstop" | yes, by event (2.2) |
| M4 reducing: `previous_size` non-zero, opposite to the side | `startPosition` non-zero, opposite to the side ("B" +1, "A" −1) | yes (per fill there; per order event here: a liquidation never flips, so the test agrees) |
| M4 the forced side; t; the order | "A" a forced sell, "B" a forced buy; `time`; (time, asset id, user, `tid`) | yes |
| M5 two accounts, one side, small coins, 60 minutes both ends; one entry a coin an hour | the same inside each slice, MARKET-1's `waveEntries` | yes |
| M6 $1,000, t + 120 s, 24 h, no stop | the same | yes |
| M7 the recorded book, walked | the archived book (a snapshot each 0.54 s, 20 levels), walked by MARKET-1's functions | yes; Hyperliquid's book is deeper |
| M8 the mark fallback (± the kit's spread), counted toward WITHHELD | the next minute of real takers on our side, walked; only unpriced and depth-short count toward WITHHELD | changed: 2.4 |
| M9 base-tier taker fee (4 bps); settled funding × the mark | 4.5 bps (Hyperliquid's base tier); settled funding × the mark, by the kit's `fundingBetween` | yes, at the venue's own rates |
| M9 gross on marks, excess | the same, on `asset_ctxs` minute marks | yes |
| M10 mean net, each position alike; two-way SE; z by look | the same; one look, z 2.58 | the z (2.5) |
| M11 WITHHELD, TOO FEW, DROP, KEEP; F1's excess; 20 days, 10 markets | WITHHELD, TOO FEW, DOES NOT HOLD, HOLDS (with F1's excess), NOT SETTLED; 20 days, 10 coins | the words (2.5) |
| M12 BASE over [START, END − 24 h) | the same over TEST | yes |

### 2.2 The counted fill: Polymarket's backstop fills are takers

The brief's question: how do Polymarket's own backstop liquidations appear
in the pre-cut fills — are they `taker` false, outside MARKET-1's count?
**No: they are `taker` true, inside it.** From the paper experiment's seed
(1,602 accounts, 1,136,327 fills, all before the cut) and R8's captured
tape (119,899 trades), counts only (`progress.md`, 23:45–23:54Z):
- **Every liquidation fill with order id "0" is a taker's with fee 0** (295
  fills; no other short order id exists). Every other liquidation fill has
  a 16-digit order id and a positive fee.
- **Order id "0" is the backstop.** Of the seed's liquidation fills that are
  on the captured tape (307), the two with order id "0" are exactly the two
  whose trades the tape marks `liquidation_details {method: "backstop"}`
  (ETH, 2026-10-07 02:01:18.879Z and 10:07:48.980Z: two pool accounts, side
  short, `taker` true, `liquidation` true, fee 0); the 305 others are
  unmarked book liquidations. The other side of those backstop trades, two
  accounts that took the positions over (`0x7af675…`, `0x9fcbd7…`), is
  `taker` false and `liquidation` **false**, order id 0, fee 0.
- **MARKET-1 counts them:** of the old weeks' 727 counted small-coin fills
  (2026-08-31 to the cut), **695 are book liquidations and 32 backstop own
  legs** (4.4%).
- **Hyperliquid writes the same event the other way round**
  (WAVE-CHECKS K2, external-apis): the liquidated account's own backstop
  fill is `crossed` false, fee "0.0", `dir` "Liquidated Isolated Short";
  the liquidator vault's leg is `crossed` true. So H4 as WAVE-ELSEWHERE
  wrote it (`crossed` true only) would drop what M4 counts.
- **The mapping that keeps the two the same:** the own leg (`liquidatedUser`
  = `user`), reducing, and `crossed` **or** method "backstop" (H4).
- **What it leaves out, and why that matches M4:** the counterparty legs
  (Polymarket flags none: 0 of 634); an own leg that is neither a taker's
  nor a backstop's — the shape of Polymarket's 16 `taker`-false liquidation
  fills (13 of them one order at one instant in a commodity; one in a small
  coin, PUMP, 2026-09-06), which M4 leaves out too; none appeared in
  SIZING's 26,297 own legs; a `liquidation` object without
  `liquidatedUser` (none seen); auto-deleveraging and settlement fills.
- **In SIZING's sample days** (three whole days, `progress.md` S1): every
  own leg was method "market", `crossed` true, reducing; no backstop
  appeared. Backstops come in fast markets — the crash day above all — so
  how many TEST counts by method is printed at the look (H13 METHOD).

### 2.3 The pool becomes slices

- **Why not every account:** Hyperliquid shows every account, and with
  everyone in one pool "two accounts within the hour" would hold most of
  the time. On SIZING's sample days the small coins saw 30, 36 and 112 60-minute
  episodes a day across all accounts, against the pool's 5.68.
- **A slice is a pool nobody chose:** addresses are hash values, so
  address mod M is a random cut, fixed before any outcome. M sized so that a
  slice sees liquidations as often as Polymarket's pool did: the wave then
  fires on bursts of the same relative size. On the sample days the
  estimate is **M ≈ 119 (one day alone gave 11, 33 and 411)**: a slice then sees 2.9 wave entries a
  day (old weeks 2.25) and spends 6.4% of its quarter-hours in a wave
  state (old weeks 3.7%). The rehearsal fixes M on all 68 days.
- **M fixed once, not month by month** (the brief's question).
  WAVE-ELSEWHERE set M each month from the 68 days before it. That keeps a
  slice's rate near 5.68 while the venue grows, shrinks or panics, but it
  reads TEST's own counts, changes who is in slice k every month, and makes
  the detector relative to the last two months' calm or storm. MARKET-1's
  pool does none of this: it is fixed, and a stormy month gives it more
  waves. **A fixed M is MARKET-1's situation, one number known before the
  freeze, and simpler code.** The cost: if Hyperliquid's liquidations grew
  a lot after SIZING, every slice fires more often than Polymarket's pool
  did. So the month-by-month M runs beside (H13), and every month prints
  its episodes a slice a day and its wave-state share, so a drift is seen,
  not hidden.
- **How the slices are judged: one, named in advance — slice 0** (the
  brief's question). Judging each slice apart would spend the error budget
  M times; the two honest choices are one slice or all slices pooled into
  one mean. I weighed them:
  - *Pooled* estimates the same quantity without the luck of which
    accounts sit in one slice (a big wave is entered by many slices, a
    small one by few: across slices that is the chance one random pool sees
    it, a ratio estimator of one pool's average), and it uses everyone.
  - *But its days are the same days.* A wave large enough to matter is
    entered by most slices at once, and the evidence is counted in days
    (M10's error): pooling adds near-copies of the same day's positions,
    so its error is only somewhat narrower. On the sample days, M = 119
    gives 347 pooled entries a day against 2.9 for one slice — about
    100,000 positions and 200,000 legs in TEST, needing most of the 186 GB
    of book files, against about 870 positions and 1–2 GB.
  - *One slice is MARKET-1's own situation:* one fixed pool, two of its
    accounts, its waves; its positions can be listed and checked by hand.
  So **slice 0 decides**, named without looking at any slice's own
  counts; every slice is printed beside on marks (H13 EVERY SLICE: each
  slice's mean,
  the share above zero, and the pooled mean with its error), so slice 0's
  luck is shown, never hidden.

### 2.4 Prices: the book, then the tape

- **The archived book** (`market_data`, sampled 2025-07-15 12h–13h, five
  coins): one snapshot every 0.54 s (p90 0.63 s, max 1.37 s), at the same
  instants for every coin, 20 levels a side; the file is cut by the
  writer's clock, so the hour h file runs from about h:00:00.6. H8 takes
  the last snapshot at or before x, from x's file or the one before, live
  within 10 s.
- **Its holes:** listing every hour folder from 2025-05-25 to 2026-05-27:
  none in SIZING; **360 of TEST's 7,200 hours (5.0%)** — 2025-10-16 from
  11h, 10-17 → 10-22 whole, 11-17 from 13h, 11-18 → 11-25 whole. On the 12
  days listed key by key, no coin missing an hour once listed. A leg in a
  hole has no book; the week after the crash (10-16 → 22) is one of them.
- **The fallback: the next minute of real takers.** The fills hold every
  trade with its aggressor, so the honest price of a $1,000 taker order at
  x, when no book exists, is what the takers on our side actually paid
  from x on: walked like levels for $1,000 (or Q out), depth short if a
  minute does not hold that much. It is a real price, unlike MARKET-1's
  mark ± a table spread, so **a tape-priced leg counts as priced**: only
  unpriced and depth-short positions count toward WITHHELD. Counting it
  as MARKET-1 counts mark-priced legs would spend most of the 10% limit
  on an archive artifact: a position touches a hole at its entry or its
  exit, so about 408 of TEST's 7,200 entry hours (5.7%) lead to one, more
  if waves crowd the week after the crash. The book-only result is
  printed beside (H13).
- **The fee, verified:** Hyperliquid's fee page (read 2026-11-14; it carries no date) gives the base tier's taker rate as 0.045% and the maker's as 0.015%, tiers on 14-day volume, discounts for staking and referrals. In SIZING's three sample days, 4.5 bps
  is also the most any taker paid (on 2025-07-17, 361,864 of 2,432,562 `crossed` fills of the 38
  coins without a builder fee; the largest bin, 4.5 bps exactly; lower
  bins are discounts). A change of the base tier inside TEST would show in
  H14's monthly check.
- **Funding:** `asset_ctxs` carries a minute's *predicted* rate, not the
  settled one (SOL 2025-07-15: 0.0000125 at 01:59, 0.0000228666 at 02:00),
  so the settled rates come from the keyless `fundingHistory`
  (on 2025-07-15 its settled rates for SOL and VVV equalled `asset_ctxs`' minute rate in only 9 and 12 of 24 hours). They are fetched into the sealed store before the
  freeze in fixed 20-day windows (480 hourly rows, under the reply's 500),
  so no reply is read to page; the price for funding is the minute mark
  (M9's, via the kit).
- **The matched baseline:** `asset_ctxs` gives `mark_px` every minute for
  every coin, so BASE (H10) and the gross on marks are M12's exactly.

### 2.5 The verdict's words and thresholds

- **Aligned with M10 and M11:** M10's two-way error; F1's condition (HOLDS
  needs the mean excess above zero); F5's minimums (20 UTC days, 10 coins);
  F6's WITHHELD at 10% (unpriced and depth short); δ = +50 bps, the owner's
  line, as DOES NOT HOLD's bar; the order with the "no" before the "yes",
  as M11's DROP before KEEP; the sentence with the largest result not ruled
  out.
- **The words:** WAVE-ELSEWHERE's HOLDS / DOES NOT HOLD / NOT SETTLED, not
  KEEP / DROP: nothing is kept or dropped here; the test says whether the
  rule's move back was there.
- **z = 2.58, not 1.96:** one look, so MARKET-1's 5% could all be spent at
  1.96; but on the old weeks the clustered error was a tenth to a third
  too narrow (random days: spread 74.7 against 67.7), a crash day makes a
  few clusters dominate, and a false HOLDS would raise trust in MARKET-1
  wrongly. 2.58 ÷ 1.3 is still 1.98. The cost: HOLDS needs about a third
  more effect.

### 2.6 What each result means

- **HOLDS:** on ten months of another venue's liquidated accounts, before
  Polymarket Perps existed, the move back after a wave paid after a taker's
  costs and beat the coins' own drift. MARKET-1's lead is then far more
  credible: not one autumn's quirk, not one venue's. What is left for
  MARKET-1 alone is the price at Polymarket's own, thinner book. For the
  on-chain project (to be founded after this first answer): a confirmed
  pattern on public on-chain data, Hyperliquid's archive itself its first
  source.
- **DOES NOT HOLD:** a mean of +50 bps a position or more is ruled out on
  a far larger venue over ten months; the old weeks' +310 was most likely
  that autumn's or that pool's. MARKET-1 runs on to its looks as frozen and
  decides for itself; expectations for it are lower. The on-chain project
  should not start from the wave.
- **NOT SETTLED:** no answer either way; the sentence's X is the largest
  mean not ruled out. If X is below +297, the old weeks' size is ruled out
  though a smaller effect is not. MARKET-1 runs on.
- **WITHHELD or TOO FEW TO TELL:** the data could not answer (too many
  unpriced or depth-short positions, too few days or coins). No inference;
  a repair would be a new frozen test.

## 3. The data: what comes down, where it lives, the seal

### 3.1 What comes down, measured

From the bucket's own listings (N1–N446, names and sizes; the book sizes
from 12 days listed key by key). Prefixes under `v1.1/hyperliquid/mainnet/`
of `aws-public-blockchain` (us-east-2, keyless).

| Data | Keys | Span | Bytes | When |
|---|---|---|--:|---|
| Fills, SIZING | `node_fills/hourly/<date>/<h>.lz4` | 2025-05-25 14h → 07-27 (64 days, 1,507 files) | 31.81 GB | before the freeze, open |
| Fills, SIZING's end | `node_fills_by_block/hourly/…` | 2025-07-27 → 07-31 (5 days) | 3.17 GB | before, open |
| Fills, TEST | the same | 2025-08-01 → 2026-05-27 (300 days, 7,200 files) | 182.44 GB | before, **sealed** |
| Fills, the last exits | the same | 2026-05-28 and 05-29 00h–01h | about 1.2 GB [A] | before, sealed |
| Minute marks | `asset_ctxs/<date>.csv.lz4` | 2025-05-25 → 2026-05-29 (370 files) | about 4.1 GB | before; sealed from 08-01 |
| Settled funding | `POST /info` `fundingHistory`, 38 coins × 19 windows of 20 days | 722 reads, 4.4 s apart (53 min) | about 30 MB | before, sealed windows |
| Books, the rehearsal | `market_data/<date>/<h>/l2Book/<COIN>.lz4` of slice 0's SIZING legs | about 400 files | about 0.3 GB | in the rehearsal |
| Books, the look | the same for TEST's legs | about 1,800 files | 1–2 GB | inside the look (H15) |
| **In all** | | | **≈ 223 GB before the freeze, ≈ 2 GB after** | |

The brief's "220 GB of fills plus the books for 38 coins": the fills are
218.6 GB, but **all the 38 coins' books would be about 186 GB more** (about
506 MB a day). Slice 0's legs need about 1% of them, so only those are
fetched, inside the look (question 8).

### 3.2 Where the files live

- **`F:\polymarket-follow-research\WAVE-H\`**, beside the FIND studies:
  research data, apart from `F:\polymarket-follow\`, whose folders belong to
  the live programs.
  - `store\` — the bucket's keys mirrored (`node_fills_by_block\hourly\20250801\0.lz4`
    …) and `store\info\fundingHistory\<COIN>\<window start ms>.json` (each
    reply's bytes as received);
  - `store\manifest.jsonl` — a line a file: key, bytes, the listing's ETag
    and LastModified, MD5, SHA-256, the fetch time;
  - `rehearsal\`, `look\` — the program's outputs.
- **Disk:** about 225 GB of F:'s 1,551.6 GB free (2026-11-13); the
  collector's recordings guard warns at 50 GiB free and grows about 0.5 GB a
  day, so no conflict.
- **In the repository:** `apps/poller/waveh/data.sha256`, the store's
  manifest in sha256sum form (about 9,600 lines), written at the freeze.

### 3.3 Checksums

- **At download:** the bytes' MD5 equals the listing's ETag (single-part
  uploads: all but 86 `by_block` and 7 `node_fills` keys; it held for all
  107 planning downloads); for the 93 multipart keys the byte count equals
  the listing's size and the ETag is recorded.
- **At rest and at every read:** the SHA-256 in the manifest; the freeze
  lists it (`data.sha256`); the rehearsal and the look recompute it before
  decoding a file. lz4js does not check LZ4's own checksums, so these
  hashes are the integrity; every decoded line must also parse (H2).

### 3.4 What is kept and what is deleted

- **Kept until the look's Final review is accepted:** everything.
- **Then deleted** (question 9): the raw fills and `asset_ctxs` (about 223
  GB; public, and a re-download can be proven identical by the manifest).
- **Kept for good** (a few hundred MB, copied to `E:\backups\polymarket-follow\waveh\`):
  the manifests, the funding replies, every book file a leg used, the
  counted fills of all accounts in the 38 coins (a compact file), the
  positions, the result, the sealed SIZING outcomes.

### 3.5 The fetch: the rate cap, the schedule, the watch

- **The tool,** `tools/waveh-fetch.cjs`: plain Node, no package, never part
  of the frozen program. Listings make the key plan; one request at a time;
  guards on the prefix (the four above, and `POST /info` `fundingHistory`
  only) and on the date (nothing before 2025-05-25 or at or after DATA
  END); each file streamed to `<name>.part`, hashed, renamed; resumable;
  after an error it waits 30 s, 2 min, 10 min, then stops for the day
  (Iron Rule 5); User-Agent `research-check/1.0`. It never decodes or
  parses a file; it pages `fundingHistory` by fixed 20-day windows (480
  rows, under the reply's 500), so it never reads a reply to page.
- **The rate cap: 2 MB/s (16 Mbit/s)** to start. One stream reached about
  7 MB/s here unthrottled (13.7 MB in 2 s, N17); the collector's own
  inbound is its book frames every 100 ms for 90 markets, about 0.8 MB/s
  [A: 90 × 10 × 853 B]. After the first whole day, if the supervisor's
  check below is clean, 4 MB/s.
- **The schedule:** paused 02:30–06:00Z (polymarket-lab's night window
  02:35–03:50Z, then the paper experiment's run from 04:00Z) and
  10:25–11:15Z (MARKET-1's run); running otherwise. 223 GB at 2 MB/s is
  about 31 hours of transfer, so **about two days** with the pauses; at
  4 MB/s about one.
- **The watch** (every 30 s; the collector's health file only): its
  `heartbeat.json` in `E:\polymarket-follow-run\var\`. A pause of 10
  minutes, then half the rate, when (a) `clock.minOffsetMs` — the minute's
  smallest receive − `ts` on the books, 99–120 ms normally — is above 400
  ms, (b) a `book-` connection's `lastFrameAt` is more than 15 s old, or (c)
  the heartbeat itself is more than 60 s old. Three pauses in an hour stop
  the day's download; the tool's log says why.
- **The daily check** (the supervisor, each morning and before raising the
  rate): the collector's price audit lines in its log (`timingMiss`,
  `otherMiss`, `noBook` every 10 minutes) and the day's `coverage.jsonl`
  gap events (`market_stall`, `ws_close`, `process_*`) in the download's
  hours against the same hours of the three days before. A rise stops the
  download until explained. The watch and the check read these three health
  files only, never a recording's book, trade or reply, nor the database
  (question 7).
- **CPU:** the rehearsal and the look decode about 1.1 TB of JSON (the
  files inflate about five times; S1 read a 276 MB day in 9 s). They run at
  idle priority (`os.setPriority`), outside the two pause windows, heap
  ≤ 4 GB, one hour file at a time, in a `FIND-SLOTS` slot, so the
  collector — still at Task Scheduler's below-normal priority until the
  owner's re-registration — is never starved.

### 3.6 The seal, in code

- TEST's files arrive before the freeze; the downloader never opens one.
- **WAVE-H's gate** (MARKET-1's pattern, `src/waveh/gate.ts`):
  `verifyFreeze` of `waveh/FROZEN.sha256`; every store reader calls
  `checkSealed(gate, the file's date, what)` before it opens the file; the
  rehearsal runs with a closed gate, so a TEST file cannot be opened even
  by mistake; a test hands each reader a TEST path with the gate closed and
  asserts the refusal and that nothing was opened.
- **Polymarket's data after the cut is never read:** the reproduction test
  reads only the pre-cut seed and panel, through MARKET-1's readers, which
  refuse anything at or after the cut.

## 4. Where the code lives

| | A frozen research study (round 2's FIND form) | A fourth entry point of `apps/poller` |
|---|---|---|
| MARKET-1's code | loaded by path from compiled files, or copied | imported, compiled together, typed |
| Tests, lint, types | its own, or none | vitest, ESLint, TypeScript strict, `pnpm verify` |
| The freeze | a hash list made by hand | MARKET-1's gate and freeze tool, renamed |
| How it runs | from its folder | from the repository's build; no run copy, no task, no page |
| Risk to the live programs | none | none while no shared file changes; both freeze tools check it |

**Recommendation: the fourth entry point, `dist/waveh.js`, run from the
repository only.** It is the simplest because what WAVE-H needs is already
in that package and frozen; WAVE-H adds readers, the mapping, the tape walk,
its verdict and its report, and imports the rest.

- **Imported from MARKET-1, never copied** (WAVE-H's freeze tool checks
  each still equals MARKET-1's freeze): `waves.ts` (`waveEntries`,
  `episodes`, `accountsAt`), `fills.ts` (`Liq`, `byM4`), `book.ts`
  (`toBook`, `usable`, `walkOpen`, `walkClose`), `stats.ts` (`twoWay`),
  `lines.ts` (`baseOf`, `blockOf`); through them the paper experiment's
  `instants`, `stats`, `research` and the shared `schedule`.
- **From the kit,** through MARKET-1's loader (`loadResearch`, its
  fingerprint checked): `marketFrom`, `markAtMinuteEnd`, `fundingBetween`,
  `cr1Test`.
- **WAVE-H's own** (`src/waveh.ts`, `src/waveh/`): `gate.ts` (MARKET-1's
  names its own files and stays untouched), `store.ts`, `fills.ts` (both
  formats, the counted fills, the tape of a window), `books.ts`, `ctxs.ts`
  and `funding.ts` (the market object), `slices.ts`, `price.ts` (MARKET-1's
  `pricePosition` falls back to the kit's mark and Polymarket's spread
  table, which do not fit here), `verdict.ts`, `report.ts`, `rehearse.ts`,
  `look.ts`.
- **Tools, not frozen:** `tools/waveh-fetch.cjs` (the only network code)
  and `tools/waveh-freeze.cjs` (MARKET-1's tool with WAVE-H's names). The
  frozen program makes no network call, as MARKET-1 makes none.
- **One dev dependency:** `lz4js` 0.2.0 (ISC, plain JavaScript; 68.5 MB
  decoded in 125 ms here), a devDependency so the live programs' deploys
  do not change. MARKET-1's and the paper's lists record the lockfile's hash
  in a comment only, so their gates are untouched.
- **Settings, no defaults:** `WAVEH_ROOT`; for the reproduction test only,
  MARKET-1's `MARKET1_PRECUT` paths. **Exit codes** as MARKET-1's: 0 done,
  1 crash, 2 bad settings, 4 frozen files differ, 5 not ready (books
  needed, a store file missing) or already run.

## 5. The build, in parts, with the rehearsal

| Part | What | Its checks |
|---|---|---|
| 0 | the fetch tool and the store; the downloads start in the background | unit tests of the key plan, the guards, the throttle and the manifest line; a first session of SIZING files only with the watch logging; the supervisor's check of the collector's day; then TEST's fills, `asset_ctxs` and funding, sealed |
| 1 | the readers and the gate | both fill formats, a book file, a CSV day and funding replies built in tests; trimmed SIZING samples as dated fixtures; every reader refuses a TEST path with the gate closed and opens nothing; a file differing from the manifest refuses; a schema failure is counted |
| 2 | the rules as pure functions | a synthetic world per rule: own leg against counterparty, `crossed`, backstop, not reducing, no `liquidatedUser`; the slices and M's scan; MARKET-1's entries inside a slice; the book across an hour's boundary, stale at 10 s, unusable; the tape walk and its shortfall; the fee; funding's sign; the excess; every verdict branch and their order; a position at the book equal to a hand computation. **The mutation check of everything that decides:** the own-leg test, "or backstop", reducing, two accounts, 60 minutes and both ends, the block, slice 0, M ± 1, 120 s, 24 h, $1,000, 10 s, the tape's minute, 4.5 bps, funding's sign, 10%, 20 days, 10 coins, z, δ, the order |
| 3 | **the rehearsal and the reproduction** | see below |
| 4 | the freeze | `rules.md` final with M; `sizing.json`, `coins.json`, `data.sha256`; a fresh rules review and a fresh code review by different models; the fixes; a fresh fix-check; `waveh-freeze.cjs --final` on a clean tree; the supervisor records the hash and the tag `waveh-freeze-1` in decisions |
| 5 | the look | H15's two steps with the book fetch between; the report `docs/reviews/wave-h-look-<date>.md`; a Final review that recomputes WAVE-H with independent code, position by position |

**The rehearsal (part 3), before the freeze:**
- **On SIZING, end to end** (`waveh rehearse`, the gate closed): every
  SIZING file read and verified; the counted fills; M's scan, written to
  `sizing.json`; slice 0's SIZING positions; their book files fetched by
  the tool (SIZING dates); every leg priced at the book or the tape; BASE
  and funding read.
- **What it may print** — counts and mechanics only, each listed in the
  build's progress file before it runs (MARKET-FIND's lesson: exploring is
  labelled and counted): files, lines and records failing; own legs by
  method, `crossed` and reducing; counted fills by coin and day; liquidated
  accounts; episodes; M's scan; a slice's entries a day and its wave-state
  share; legs by source (book, tape, unpriced), depth-short legs, a book's
  age at the leg, trades walked on the tape; funding rows found and
  missing; the highest taker rate paid; run times. **Never before the
  look:** a leg's two prices together, a gross, net, excess, mean, error,
  win share or BASE value. Those are computed (the code must run) and
  written to `rehearsal/sizing-outcomes.jsonl.gz`, whose SHA-256 is
  printed and which the look's report opens first, beside the verdict.
- **The reproduction on Polymarket's pre-cut weeks** (a test, run when
  `MARKET1_PRECUT` names the paths, as MARKET-1's): WAVE-H's slice and
  entry code with M = 1 (the pool itself) on the seed's counted fills
  (MARKET-1's own `isForced`) gives **MARKET-FIND's 153 entries entry for
  entry** — 47 days, 30 markets, 114 forced sells, 39 forced buys — and
  WAVE-H's statistic path on MARKET-1's reproduction positions gives
  **+309.7 ± 67.7**. Already-known figures, no new look.
- **The identity data** into `coins.json` (this plan's check repeated).

## 6. Risks, and how each is caught

| Risk | How it is caught |
|---|---|
| **The download crowds the collector's line** | a 2 MB/s cap, the pause windows, the watch on its heartbeat, the supervisor's daily check of its price audit and coverage; three pauses stop the day |
| **The crash day and other flood days** (2025-10-10: 1.49 GB of fills, the archive's largest day; the rule has no stop) | MARKET-1's rule kept; that day named, with m and SE without it and with each day alike, printed under the verdict (H13); the day-and-coin error widens with it honestly; question 6 |
| **The archive's book holes** (5% of TEST's hours, the week after the crash among them) | the tape walk, a real price; book and tape apart (H13); WITHHELD at 10% unpriced or short |
| **Slice 0's luck** | every slice and the pooled reading printed beside (H13) |
| **Hyperliquid's flow drifts from SIZING's** (busier venue, other months) | by month, a slice's episodes a day and its wave-state share; M halved, doubled and by month beside |
| **Burstier than Polymarket's pool** (at the episode-matched M a slice spends 6.4% of its quarter-hours in a wave state on the sample days, against 3.7%) | printed by month; M doubled (3.5% on the same days) beside |
| **A backstop's own fill in the archive** (seen in the API only, one example; none in S1's 26,297 own legs) | H4 counts it either way; METHOD beside; a synthetic test of the branch |
| **A fee change inside TEST** | H14's monthly check of the highest taker rate paid, an alarm, never a withheld verdict |
| **A wrong asset under a right name** | H3's check: one universe entry each; within 0.36% of Polymarket's marks |
| **Corrupt or missing files** | ETag and SHA-256 at download and at every read; a TEST fill file missing stops the look |
| **Looking before the freeze** | the gate refuses TEST paths in code; the downloader parses nothing; the rehearsal prints no outcome; the access scans of every worker |
| **A frozen MARKET-1 or paper file changes before the look** | WAVE-H's freeze tool and gate stop it (exit 4) until a re-freeze |
| **The terms** (WAVE-CHECKS K8: nothing forbids or grants) | a low-rate personal read; no redistribution; the data stays on this PC |

## 7. Effort and time

| Step | Sessions | Notes |
|---|--:|---|
| The plan's fresh review | 1 | |
| Build parts 0–1 | 1 | the downloads start at once and run in the background for about two days |
| Build part 2 | 1 | |
| Build part 3 (the rehearsal and the reproduction) | 1 | needs SIZING's 35 GB |
| Two fresh reviews (rules, code), in parallel | 2 | |
| The fixes and a fresh fix-check | 2 | |
| The freeze | — | the supervisor |
| The look and its Final review | 2 | the look's book fetch about 15 minutes; the decode a few hours |
| **In all** | **about 10** | **about two weeks**, the downloads never on the critical path |

## 8. Questions, each with a recommendation

1. **The counted fill: the liquidated account's own fill by either method
   (`crossed`, or backstop)?** *Yes.* Polymarket's backstop own fills are
   takers and in MARKET-1's count (32 of 727); Hyperliquid's are not
   `crossed`. Counting by event keeps the two the same.
2. **Slice 0 decides; every slice beside on marks?** *Yes.* One pool is
   MARKET-1's situation, needs 1–2 GB of books, and its days are the days
   that matter; pooling all slices would need about 200,000 legs and most of
   186 GB of books for a modestly narrower error. The alternative is the
   pooled set at the book: say so if you prefer it.
3. **M fixed once from SIZING, not month by month?** *Yes* — MARKET-1's pool
   is fixed too; the month-by-month M runs beside.
4. **A tape-priced leg counts as priced** (WITHHELD only for unpriced and
   depth short)? *Yes:* it is a real trade's price; otherwise the archive's
   holes alone would bring the test near its 10% limit.
5. **z 2.58, δ +50 bps, 20 days, 10 coins?** *Yes:* one look at the 1%
   level, a margin for the clustered error's known narrowness; MARKET-1's δ
   and minimums.
6. **The crash day stays in, printed apart?** *Yes.* MARKET-1 would meet
   such a day forward with the same rule; leaving it out after knowing it
   is extreme would be a choice made with the data in view. The without-it
   and day-alike figures stand right under the verdict.
7. **The download at 2 MB/s (4 after a clean day), paused 02:30–06:00Z and
   10:25–11:15Z, the watch reading the collector's heartbeat, and the daily
   check reading its log's price audit and the day's coverage?** *Yes.*
   Reading those three health files is new for a research tool and is your
   call; nothing else of the collector's is opened.
8. **The books of the legs fetched inside the look** (two steps, about 1–2
   GB), rather than all 38 coins' books before the freeze (about 186 GB)?
   *Yes.*
9. **After the Final review, delete the raw fills and marks** (about 223
   GB), keeping the manifests and everything the look used? *Yes.*
10. **WAVE-H without Polymarket's own months on Hyperliquid**
    (WAVE-ELSEWHERE's APART, about 120 GB more)? *Yes, without:* they are
    the old weeks' own days on a sibling venue, not a new sample; a later,
    small study if ever wanted.

## 9. Facts for the other docs; slips

**For external-apis, "Other venues"** (dated 2026-11-13/14, the supervisor's
to place):
- `node_fills/hourly/` 2025-05-25 14h → 2025-07-27 (its first day 10
  files, its last 9): one `[user, fill]` pair a line, the same fill keys as
  `node_fills_by_block`, `liquidation` included; files are cut by the
  writer's hour (a fill of 11:59:59.869Z in hour 12's file); spot fills
  are in them. Sizes: SIZING 31.81 GB; TEST (by_block 2025-08-01 →
  2026-05-27) 182.44 GB, days 0.25 GB (2026-01-10) to 1.49 GB (2025-10-10).
  ETags single-part MD5 but for 93 keys; LastModified 2026-11-03.
- `market_data`: one snapshot every 0.54 s at the same instants for every
  coin, 20 levels `{px, sz, n}`, `{time, ver_num, raw: {channel, data:
  {coin, time, levels}}}`; holes 2025-10-16 11h → 10-22, 2025-11-17 13h →
  11-25 (360 of TEST's 7,200 hours); the 38 coins about 506 MB a day.
- `asset_ctxs`: a row a coin a minute — `time, coin, funding, open_interest,
  prev_day_px, day_ntl_vlm, premium, oracle_px, mark_px, mid_px,
  impact_bid_px, impact_ask_px`; `funding` is the predicted rate, not the
  settled one.
- `fundingHistory`: `{coin, fundingRate, premium, time}`, hourly, stamped
  hh:00:00.017Z.
- The fees page: base taker 0.045%, maker 0.015% (no date on the page;
  read 2026-11-14); the most any taker paid in 2025-06/07: 4.5 bps.
- The 38 names: one entry each in `meta`, not delisted; hourly closes of
  2026-11-06 within 0.36% of Polymarket's marks.

**For the decisions (when the owner rules):** Polymarket's backstop own
fills are `taker` true, order id "0", fee 0 (295 in the seed; the tape's
two marked backstop trades are exactly the two on it with order id "0");
their counterparties are `taker` false, `liquidation` false.

**Slips:** (1) My first cross-reference of R8's tape read its call records as trade rows and found nothing; rerun on the replies inside, it found the 19 backstop trades. (2) One `node -e` call failed on a Git Bash path (`/f/…` is not translated inside Node); rerun with `F:/…`. (3) A plain `sleep` was refused by the harness; waits became loops on a file's state. (4) Page one's first draft (00:12Z) already named slice 0, before the slice counts ran (00:22Z); those counts are totals over all slices and never looked at one slice's own figures, and the recommendation rests on the data volume (2.3). (5) Two background waits ended with exit code 1 (a `grep` with no match after the job had finished); nothing was lost. None touched a number in this plan.

## 10. Evidence

- **Read:** CLAUDE.md; current-task; code-rules; architecture;
  external-apis; decisions of 2026-11-13 (all eleven); WAVE-ELSEWHERE (all);
  WAVE-CHECKS (all) and its `progress.md`; MARKET-FIND (page one, 1.1–1.3,
  3, 4); MARKET-PLAN (page one, 2, 3, 5–8); MARKET-PLAN-REVIEW (page one,
  verdict, findings); `market1/rules.md`; `src/market1/` waves, fills,
  book, price, stats, gate, compute (and the imports of lines and
  research); `tools/market1-freeze.cjs`; `scripts/market1-reproduce.ts`;
  `src/paper/` seed, routes, market (parts); the kit's `panel.mjs` and
  `stats.mjs` (parts); the collector's `heartbeat.ts`, `clock-watch.ts`,
  `price-audit.ts` and coverage events.
- **Data read, all before the cut:** the seed (copied once; 1,602 files),
  the pre-cut panel (copied once; the 38 coins' files), R8's captured tape.
- **The worker folder** (`workers/WAVE-H-PLAN/`): `progress.md` (every
  step, its stamp, every count before it ran) and `requests.tsv` (594
  numbered requests), `scripts\` (every script that ran) and `out\` (their
  outputs but the large listings and fill lists). The downloads and my
  copies of the seed and the panel were deleted from my scratchpad.
