# The paper experiment's rules (rules.md)

Frozen by hash before any outcome after the cut exists (R0). The plan:
`docs/reviews/paper-plan-2026-11-12.md`, section 1; its review's fixes F1–F18
(`docs/reviews/paper-plan-review-2026-11-12.md`) and the rulings of decisions
2026-11-12, "the paper experiment's plan approved", are folded in. Where a rule
names code, the code in `apps/poller/src/paper/` (compiled to `dist/paper/`)
does exactly that; a test pins each rule. Every number here is fixed now.

*Keep and drop are verdicts on this test, never instructions to trade.*

## R0. Identity and what is frozen

- Two arms: **arm A** (the pool's lines, R7) and **arm F** (the owner's
  favourites). A rule change after the freeze is a new arm with its own start
  instant, lines and budget; the frozen arms run on unchanged.
- **Frozen together, what runs** (`experiment/FROZEN.sha256`, sha256sum
  format, paths relative to the package folder, LF bytes as committed): the
  program `dist/paper.js` and every file of `dist/paper/` (compiled from the
  freeze commit by the lockfile's TypeScript); every file of `research/` (the
  kit, fingerprint `2d3667b5ce90645b41dfee4e6fc425ab3e64c985cb4973bfed6ece5052c409aa`,
  and lib-exits `612d58365ba4c2a2d88a3f73a41a08e193d0874458d862b169fc51f218926330`,
  byte for byte); every file of `experiment/` (this file, `favourites.txt`,
  `seed.sha256`). The list's own SHA-256 and the freeze commit's tag
  `paper-freeze-1` are recorded in decisions before the first run after the
  freeze.
- **Every run starts by checking them** (`gate.ts`): the list exists, names
  every file of what runs, and each has its hash; the kit's `checkKit()`
  returns its fingerprint and lib-exits its hash. Otherwise the run writes one
  line, "frozen files differ", and stops: no read, no page.
- **The blind gate:** no request whose window reaches the cut is sent unless
  that check passed (`checkWindow`).
- **Shared code** (the client's admission, back-off and User-Agent, the
  Recorder, the clock, the logger) is not frozen; each day's log lists the
  hashes of the shared files the run used, Node's version and the deploy's
  record (information, not a stop). Every rule that decides what is read and
  how a reply is read lives in `src/paper/` and is frozen.
- **A code defect** (the code not doing what this file says) is fixed only
  through a decisions entry that names it, before the next look, with the
  diff, a test that failed before the fix, and the list of copies whose
  numbers changed; never a number of this file.

## R1. Instants

- **CUT** = 2026-11-07T00:00:00.000Z. Arm A counts entries with first fill
  t ≥ CUT.
- **F0** = the freeze's instant, the first line of `favourites.txt` (R2).
  Arm F counts entries with t ≥ F0.
- **A run's END** = 00:00Z of its UTC day; nothing at or after END is used.
- **The looks:** END₁ = 2026-12-19T00:00Z, END₂ = 2027-02-06T00:00Z,
  END₃ = 2027-05-08T00:00Z; look k runs once, on the Monday after its date,
  after that day's run, with END = END_k (R16).
- **Weeks** run Monday 00:00Z to Monday 00:00Z; an entry's **Monday M** is the
  latest Monday 00:00Z at or before t.
- Times are ms since the epoch; a window [a, b) includes a and excludes b.

## R2. Who

- **The pool:** the kit's `data/population.json` (1,702 accounts, SHA-256
  `f2748c42cf3d6d12af1870918cad7f44a6e42cc1dc20b100a5e4239a99418947`) less its
  100 holdout accounts: 1,602 accounts. No account is ever added to arm A; no
  holdout account's file is ever opened.
- **The favourites (arm F):** `experiment/favourites.txt`, written at the
  freeze from the owner's list: a first line `from <F0 as an ISO instant>`,
  then at most 20 lower-case addresses, one a line (lines starting `#` are
  comments). Pool membership is not needed; judged whole, as one set. A
  holdout account on the list joins only after D1 is scored, with that instant
  as its own start; an address added later is a new arm.

## R3. Fills

- **Before CUT, the seed** (`seed.ts`): for every pool account, R8's
  completed file where one exists, else R2-STYLE's `accounts\<addr>.fills.jsonl.gz`
  (never a light file, never the holdout's folder), read the kit's way —
  numbered pages with HTTP 200, deduplicated by (trade_id, instrument_id,
  timestamp), oldest first, `truncated` when the last page said more, a row at
  or after CUT refused — except that trade_id and order_id are kept as their
  text in the file. Written once into the experiment's folder (`seed\`), its
  manifest frozen as `experiment/seed.sha256`; each seed file is checked
  against it when loaded. (R2-STYLE stored ids above 2^53 − 1 rounded through
  a double: one account, 3,403 liquidation fills of 2026-05-07/08; kept as
  stored.)
- **From CUT, the API:** `GET /v1/info/fills?address=&start_timestamp=&end_timestamp=&sort=asc`,
  the cursor followed until `more` is false; ids kept as the reply's digits
  (`JSON.parse`'s `context.source`). Each account has a read-through instant
  P (first CUT; a favourite outside the pool: 30 days before F0's Monday). A
  read asks [P, end) and moves P to its end only when it finished.
- **The boundary check** of a row (Zod, `FillRow`): the kit's `validFill`
  with trade_id and order_id strings of digits. A row that fails it, or lies
  outside its window, is dropped and counted; its account-day (UTC) inside the
  read becomes a hole (a row without an instant: the read's window).
- **The schema alarm (F3):** when a run's rejected rows are more than 1% of its
  rows and at least 10, or reach 1,000 (the run stops at once), the reads that
  had a rejected row write no hole and move no P; the run ends "schema alarm"
  and the page says so. A hole of rejected rows may be closed only by
  re-parsing the kept raw replies (`raw\<UTC date>\rest-HH`) after a code-defect
  fix recorded in decisions (`paper.js reparse`).
- **A standing hole:** an account the API answers HTTP 400 "account not found"
  is a hole from P on, never read again.
- **Normalized** by the kit's `normFill`, oid and tid as text.
- **Covered (F2):** a window [a, b) of an account is covered when P ≥ b, no
  hole of the account meets it, and either a ≥ the account's first read
  instant, or the seed is not truncated, or the seed's oldest fill is at or
  before a. Unread days never count as quiet days.

## R3a. The reading loop (F1, the rule of every run)

From CUT's Monday, week by week, to END:
1. **the week's list** — the pool accounts P1 at its Monday (R5), every account
   with an arm A or arm F copy still open at that Monday (its plan through that
   Monday not closed), and the favourites — is read to the week's end (or END)
   without a page cap, under a **safety cap of 50 pages an account-day** of the
   window, which makes a hole from the last fill read and a warning;
2. when the week is over (its end ≤ END), **every other pool account** is read
   to the week's end, at most **10 pages an account-week**; past the cap,
   [the last fill read, the week's end) is a hole;
3. the week's **market-days** (R9).
The first run, a missed day and every Monday follow this one rule. A run
spends at most the experiment's share (R17); a request inside 02:34:45–03:50Z
is not sent: the run ends there cleanly, the state saved after every account,
and the next run continues from each P. Five failed reads in a row end a run
("api failing").

## R4. Events, cycles, entries, delay

- The kit's `toEvents`, `toCycles` and `buildEntries(events, −∞, ∞, 60 000)`,
  unchanged, on each account's whole fills read so far.
- **An entry** is a group of type OPEN or FLIP (adds are never entries; forced
  events are exits only) whose first fill t lies in [CUT, END) (arm F:
  [F0, END)).
- Its id is the kit's `entryId(addr, g)`; its **delay D** the kit's
  `delayOf(id)` (D in [62.14 s, 95.44 s)); its **paper entry instant** t + D.

## R5. Labels and habits at the entry's Monday

- **From the fills before M only** (the account's fills with t < M and the
  seed's own pages, truncated and oldest): an order event's fills after M
  never change the facts at M, so they are fixed once read, and cached under
  the hash of those fills (a cached value equals a fresh one).
- **The label** = the kit's `labelAt` at M (the frozen classifier v1 on the 14
  days before M); its `covered` is not used.
- **P1 at M:** the label is `directional` and [M − 14 d, M) is covered (R3).
- **The habits** = the kit's `habitsAt` at M on the 30 days before M (closed
  cycles whose start is captured, their median hold, the long share of the
  entries opened in them); the **habit window is covered** when [M − 30 d, M)
  is.

## R6. Markets

An entry's market is **primary** when all hold, checked in this order:
1. the market is in the kit's rule book (listed by 2026-11-10T14:55Z);
2. the kit's `inPrimaryCell(iid, t)` (the pre-IPO market and PRL, NCLD,
   SKHYNIX, SAMSUNG, CXMT out; KIOXIA from its settlement day);
3. for t ≥ CUT only: the collector's rule book (`rulebook` collection, read
   only) shows no close-only state, settlement or absence from the market list
   recorded on or before t's UTC day. A split event in it is counted and
   flagged on the page (its shape is unknown; it is never guessed).
No 24 h cost map (Q1); copies the map would close are printed apart at a
look. Entries in other markets are counted apart and priced in no line.

## R7. The lines (each entry's membership fixed at its Monday M)

| Line | Rule | Decides? |
|---|---|---|
| **MAIN** | P1 at M; the habit window covered; median hold ≥ 6 h; at least 3 closed cycles; a primary market | **yes, the only one** |
| TEN | MAIN with at least 10 closed cycles | no |
| BROAD | P1 at M; a primary market | no |
| DAY | MAIN with median hold ≥ 24 h | no |
| FAV (arm F) | every favourite's entry with t ≥ F0 in a primary market, whatever its label (printed) | no |
| STOP2, STOP5 | MAIN's copies, also closed at STOP's instant (R13) | no |
| DAYS7 | MAIN's copies, also closed at t + D + 7 d | no |
| JUMP | MAIN's copies split by J > 3 against J ≤ 3 | no |
| NOTIONAL | MAIN's copies of accounts on the all-time notional board, and the rest | no |
| COMP | MAIN and BROAD without the competitions' days, and without their boosted markets | no |

MAKER and VWAP are not in this freeze (Q-D): if built, they join later as
their own arm with their own start.

## R8. The money reading (exits copied)

- **The copy's exits:** the kit's `buildEntries` exits of the entry's group
  (each REDUCE, CLOSE, FLIP or forced exit on that instrument and side after
  its first fill, with its share).
- **The legs** (`planCopyThrough`; F9: lib-exits' `planCopy` with END as a
  parameter, equal to it at END = CUT; the vendored one is never called past
  the cut): each exit, at its first fill + D, closes its share of what is still
  open (a partial liquidation its share; a close, flip or full liquidation all
  of it); adds are not copied; a re-open merged inside the 60-s window does not
  re-open. An exit instant at or after END flags the copy `crossing`; a part
  still open after the trader's last exit flags it `open`; both are marked at
  END − 1 ms (the minute that ends at END). An entry whose t + D is at or after
  END has no mark at its paper entry and is unpriced.
- **The price:** lib-exits' `priceCopy` with R9's taker setting: Σ partᵢ × the
  kit's `leg` from t + D to each exit instant; in bps of the copy's $1,000:
  net, gross, fees, funding, the share-weighted hold.

## R9. The taker setting and the panel past the cut

- **Fee** at an instant x: from each collector rule-book record's instant (a
  record is the first time the collector saw a change), the base-tier taker
  rate it records — an instrument's fee override in force at x, else its
  category's rate in the fee schedule; before the first record, the kit's
  `feeAt('taker', iid, x)`. Never a lower tier, never a rebate.
- **Spread and depth:** the kit's `spreadAt` on R8's session-pair table
  (`data/price-table.json`), as the kit's taker setting.
- **The panel past the cut:** per market and UTC day d from CUT,
  `mark-history` 1m asked with `end_timestamp` = d + 1 day (a bucket comes only
  if it ends by then; paged by the last bucket + 1 min while `more`), `klines`
  1m with d + 1 day − 1 ms (paged likewise), `funding` stamped in the day,
  newest first (paged back by the oldest stamp), each settlement filed under
  the hour its stamp falls in. A day whose reply breaks its shape (two values
  in one minute or hour, a value outside the day) is not written and is read
  again next run. The markets read: those primary at the cut by the kit (84).
- **The market object:** the kit's pre-cut panel file (copied into the
  experiment's folder, each file checked against the kit's pinned manifest
  when loaded) joined with the market-days that follow it, day after day, up to
  the first day missing or END, built exactly as the kit's `marketFrom` with
  END in place of CUT. A copy that needs an instant past a missing day is
  unpriced. The kit's `markAtMinuteEnd` (5 minutes' staleness) and
  `fundingBetween` (nominal hours in (tIn, tOut]) unchanged.

## R10. The judgement reading (d at 24 h)

- d = the kit's `dAgainstNull(mk, {dir, t, D, h: 24 h, longShare, removed})`
  × 10⁴ bps: the copy's gross over 24 h from t + D less the exact matched null's
  gross (every public trade of t's market and UTC hour equally likely, from the
  klines' minute counts, after the same D, long with the long share);
  cost-neutral.
- **longShare** = the habits' long share at M. **removed** = the kit's
  `removalOf` over the fills, in the week of M, of every account in the copy's
  line at M (by R7's account-level conditions; FAV: the favourites) — so a
  copy has one d per line it is in.
- **Voted** by END: ⌊t / 1 h⌋·1 h + 1 h + 95.44 s + 24 h ≤ END.

## R11. Unpriced and missing

- A copy whose leg finds no mark within 5 minutes before an instant, or a
  funding settlement without a mark, is **unpriced**, counted by reason ("no
  mark at the follow instant", "no mark at an exit instant", "a funding
  settlement without a mark"), and left out of every mean; never guessed. A
  copy that crosses a settlement is unpriced this way (a small survivorship,
  named at the looks).
- A funding hour without a row is charged nothing and counted.
- d is null, by reason, when the entry is unpriced, a null minute is
  unpriced, the hour has no trade left, or the long share is null.
- **A gap copy:** a chain break (lib-exits' `chainBreaks`) on its instrument
  after the entry's first event and up to its last exit used (to END while
  open), or a hole of the account in [t, that instant]; flagged, printed with
  and without.

## R12. The statistic and the verdict (MAIN only)

- **The set of look k:** MAIN's copies voted by END_k; both readings on this
  one set; their money with exits up to END_k.
- **x** = a copy's net (bps), each copy alike; **m** its mean; **SE** =
  √max(V_trader + V_day − V_iid, V_trader, V_day), V_trader and V_day the
  kit's CR1 variances of the mean (`cr1Test`) clustered by address and by the
  UTC day of t + D, V_iid = s²/n (s² with n − 1).
- **z:** L1 2.81, L2 2.43, L3 2.17 (two-sided 0.5%, 1.5%, 3%: 5% in all,
  two-sided; KEEP, one-sided, spends half of it).
- **WITHHELD** when more than 2% of the set is unpriced.
- **DROP** when m + z·SE < +10 bps.
- **KEEP** when m − z·SE > 0 and the mean d of the set's copies with a d is
  above 0.
- When KEEP and DROP both hold, **DROP** (Q-G). **TOO FEW TO TELL**
  otherwise; at L3 it reads "no edge as large as m + z·SE was seen".
- The first KEEP or DROP is the test's verdict; later looks print their
  figures marked "after the verdict".

## R13. The lines beside — their formulas (F14)

- **STOP2 / STOP5:** m_in = the mark at the end of t + D's minute; the first
  whole minute s after it whose end mark m_s gives dir × (m_s / m_in − 1) ≤
  −0.02 (−0.05), searched up to the copy's last exit instant (END while open);
  if it comes before an exit, all that is still open closes at s + 1 min −
  1 ms, the kit's `leg` to that instant (its funding, spread session and mark).
- **DAYS7:** what is still open at t + D + 7 d closes there (if before END).
- **JUMP:** J = |m(e) / m(e − 15 min) − 1| ÷ U, e = the start of t's minute,
  m(x) = `markAtMinuteEnd(mk, x − 1)`, U = the mean of |m(s + 15 min) / m(s) −
  1| over every whole start minute s with e − 30 d ≤ s and s + 15 min ≤ e and
  both marks; J null without them.
- **NOTIONAL:** `population.json`'s `notionalBoard`.
- **COMP:** every competition the collector's rule book lists whose window
  overlaps [CUT, END), its boosted markets those listed with a boost above 1;
  printed without copies whose t lies in any such window, and without copies in
  a boosted market.

## R14. Prints at a look (every line; MAIN's decide)

Copies, traders, days; unpriced by reason and their share; open, crossing and
gap copies; the money mean with its two-way SE and both one-way lower bounds
(m − z·SE_trader, m − z·SE_day); beside, deciding nothing, the band with
Student's t at the same level on the day clusters (df = days − 1); d's mean
with its two-way SE and d's null reasons; the gross before costs with its lower
bound m_gross − z·SE_gross, worded "positions of this line would have paid at
any round trip below X bps"; fees and funding; the win share and the average
win against the average loss, labelled "exits can flatter these; only money
measures"; the hold (median, quartiles); the worst UTC day and the worst
trader (lowest sums); the paper equity's largest fall at $1,000 a copy, copies
in the order of their paper entry; the mean without the most influential
account, then also without the most influential day; the closed copies only;
the long share; R3's pooled daily e-value; copies a week; the smallest edge
visible at the next look, (z_next + 0.8416) × SE × √(days so far ÷ days at the
next look). Venue lines (Binance's 5 bps a side, the owner's Finotive
figures) are reporting arithmetic outside these rules; Finotive is shown only
as its rule against copying and its cost facts, with no result line (Q7).

## R15. The daily page

- One static file, `paper\page\index.html` (and `positions.html` with every
  position), written after each run from the same objects the log records.
- **Its lines:** MAIN, TEN, BROAD, DAY, FAV: positions, traders, days, open;
  the running money mean with its SE and the band m ± z_next·SE ("the band the
  next look will use; a crossing between looks decides nothing"); the running
  d mean with its band (voted only); R3's e-value (a day's vote: the sign of its
  mean d; a day within ±0.1 bps is a tie, dropped).
- **The verdict box:** "Too early to judge — next look <date>" until L1; at
  and after a look, R12's verdict line and its sentence, nothing else.
- **Every position** newest first (the newest 500 on the page); **one row per
  MAIN trader**, sorted by address: positions, open, the running mean, a 95%
  band (CR1 by UTC day, Student's t on days − 1) from 20 days with a position,
  else "too few days", under the caption that about 5% of such bands exclude
  zero by chance and these rows decide nothing.
- **Never on the page:** a verdict between looks; any other line, threshold or
  filter; a sort by result; a probability; the words follow, copy, signal,
  edge, skill (a test reads its text); colours for a sign.

## R16. What never changes

After the freeze no number, line, population, threshold, instant or rule of
this file changes; a new idea is a new arm. **A look** runs once (a second run
is refused); it waits while reads are unfinished — every account of the last
week's list and every one with an open copy read to END_k, every other to the
latest Monday before it, every market-day present — at most a week past its
Monday, then runs and lists what was not read as holes on its first page. A
run that crashes before its result exists is not a look.

## R17. The reads' budget (Q10, F1, F11)

The experiment's own client: 120 weighted tokens a minute and 15 in any 5 s
beside the collector's 50 and 30 (170 of the 250 allowed); the User-Agent
`data-reader/1.0`; one request at a time, each admitted before it is sent; a
429 backs off from 2 s, an HTTP error from 1 s, doubling to 60 s; each read
tried at most three times. The cost by formula: 10 tokens a fills page, and a
market-day 2 × 5 (marks) + 5 or 10 (klines) + 10 (funding) = 25–30 tokens;
a normal day ≈ 10 × (the list's pages) + 30 × 84; a Monday adds the sweep, ≈
10 × (one page an idle account, ≤ 10 a capped one). D1 and D2 read after the
freeze, each with its own share of the remaining 80 a minute.
