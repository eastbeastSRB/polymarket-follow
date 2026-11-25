# COPY-H's rules (copyh/rules.md)

COPY-H asks the project's founding question on Hyperliquid's archive: does
copying the traders the paper experiment's MAIN rule picks pay a follower
who copies after R8's delay, leaves when the trader leaves, at a taker's
real costs? This file is the draft written before the freeze (C0); then a
fresh rules review, the build's reviews, the freeze and look 1. The plan:
`docs/reviews/copy-h-plan-2026-11-25.md` (`83ac6ba`), section 2 (its draft
C0–C17), with every fix of its review,
`docs/reviews/copy-h-plan-review-2026-11-25.md` (`dda8d38`; H1–H2, M1–M9,
L1–L9), and the owner's eight rulings, decisions 2026-11-25 "COPY-H'S PLAN
APPROVED" (`b0a546e`), folded in. The review's finding is named beside each
rule it changed. Where a rule says "R…", it means the paper experiment's
rule (`apps/poller/experiment/rules.md`, R0–R17) word for word; "the kit's
X" is `research/kit` unchanged and "lib-exits' X" `research/find-6-exits`
unchanged, both run byte for byte. Where a rule names code, the code to be
built in `apps/poller/src/copyh/` (compiled to `dist/copyh/`) does exactly
that, and the test named beside it pins it. Every number a rule fixes has
one home, `src/copyh/design.ts`, and the table at the end (C18) holds this
file to it. A value the sources leave to be set from counts before the
freeze is marked `[SET BEFORE THE FREEZE: …]` with the rule that sets it; a
choice the sources leave open is marked `[OPEN Qn]`, with the recommended
text in place, for the supervisor's ruling. Figures in brackets are prints
from before the freeze, deciding nothing.

*Keep and drop are verdicts on this test, never instructions to trade.*

**Two things to know first** (the review's H1 and M8; the owner's rulings 1
and 2):
- **The money's printed error is smaller than its real spread.** MAIN leans
  long (two entries in three in the planner's sample) and holds for hours to
  days, so copies entered on different days ride the same market moves. Each
  verdict is therefore carried by two readings, each at its own bar: the
  money, and the edge over the market (C10, C12).
- **What a yes would be worth by hand** (the review's arithmetic on the
  plan's counts and X5's 345 bps a copy; deciding nothing): at a true +15
  bps a copy on $1,000, watching 10 of MAIN's accounts gives about 28 copies
  a week, about $42 a week against a weekly swing of about ±$183, and about
  75 weeks before the edge shows at two errors; 50 accounts give about 141
  copies, $212 against ±$410, 15 weeks. The test's larger worth is its most
  likely answer: a clear DROP closes the founding question on both venues.

## C0. Identity and what is frozen

- **One question, one deciding line.** COPY-H is the paper experiment's
  question on Hyperliquid's archive, on every account, judging only what
  follows each week's choice. Its one deciding line is MAIN (C7), the
  paper's rule as frozen on 2026-11-12, before Hyperliquid was thought of.
  Every other line is beside it and decides nothing. **COPY-H decides
  nothing for the paper experiment, MARKET-1, WAVE-H, the exam or "the crash
  side only", and is never combined with their verdicts;** the paper
  experiment's looks run on as frozen.
- **What each answer means** (the plan's section 1, with H2 (a), the owner's
  ruling 3):
  - **KEEP** (C12): on months nobody had studied for this question, copying
    MAIN's traders earned more than a taker's costs, on the money and on the
    edge over the market, and not through a few days, a few traders or thin
    tapes. It is confirmed once on FRESH-2 alone (C14) before anything is
    built on it; only a confirmed KEEP is a yes.
  - **DROP**: neither reading can be +10 bps a copy. **A DROP closes copying
    MAIN's way,** on both venues (FABLE-REVIEW's stop rule).
  - **TOO FEW TO TELL**: no verdict; copying is treated as not shown to pay.
  - **WITHHELD**: more than 2% of MAIN's set unpriced; the data could not
    answer, and a repair would be a new frozen test.
  - **The rounds run whatever look 1 says** (H2 (a)). The rounds' at most
    two tries are the only variants ever judged, once on S and once on
    FRESH-2; nothing else is built or polished on these months (C14).
  - **The stop rule** (decisions 2026-11-25, the owner's rulings on
    FABLE-REVIEW, 6, amended by "COPY-H'S PLAN APPROVED", 4): after COPY-H's
    step 2, no new research is built unless a frozen test has said a clear
    yes.
- **Frozen together, what runs** (`copyh/FROZEN.sha256`, written by
  `tools/copyh-freeze.cjs --final`, sha256sum format, paths relative to the
  package folder, LF bytes as committed; its tag `copyh-freeze-1`):
  - the program `dist/copyh.js` and every file of `dist/copyh/`;
  - **the closure** (`COPYH_CLOSURE`; L5): every compiled file of another
    frozen program that the program's imports reach, each equal, byte for
    byte, to its line in that program's own freeze list (the tool refuses
    otherwise). Named now: `dist/paper/copy.js` (`planCopyThrough`),
    `dist/paper/stats.js` (`twoWay`, R12's two-way error; also in MARKET-1's
    list) and `dist/paper/research.js` (the kit's loader and fingerprint
    check), in `experiment/FROZEN.sha256`; `dist/polish/lz4.js` (the
    analyzer's LZ4 decoder), in `polish/FROZEN.sha256`. Any other file the
    build's imports reach is listed the same way, or the tool refuses;
  - every file of `research/` byte for byte: the kit, fingerprint
    `2d3667b5ce90645b41dfee4e6fc425ab3e64c985cb4973bfed6ece5052c409aa`, and
    lib-exits, `612d58365ba4c2a2d88a3f73a41a08e193d0874458d862b169fc51f218926330`;
  - every file of `copyh/`, these required by name: this file,
    `coins.json` (C3), `dirs.json` (C3), `unpaired.json` (C15),
    `data.sha256` (C3) and `funding.sha256` (C9).

  `dist/schedule.js` and `dist/log.js` are shared and not frozen; their
  hashes are logged at each start (as the exam's P0).
- **When another program re-freezes a file of the closure** (the paper's
  breaker fix waits; decisions 2026-11-25): COPY-H's list never changes for
  it. COPY-H's steps then run from a build of its own tag's tree (a worktree
  at `copyh-freeze-<n>`, compiled by the lockfile's TypeScript), which the
  gate holds to the same list. A defect the other program fixes in a file
  COPY-H runs is COPY-H's own defect too, fixed only by the route below.
  [OPEN Q9]
- **The gate** (`gate.ts`): a step runs only when `copyh/FROZEN.sha256`
  lists every file of what runs with its hash, holds exactly one line
  `# tag copyh-freeze-<n>`, that git tag holds this very list byte for byte,
  the kit's `checkKit()` returns its fingerprint and lib-exits its hash.
  Otherwise the step writes one line, "frozen files differ", and stops
  (exit 4), having read nothing. Every step checks it first. Pinned by
  `test/copyh-gate.test.ts` (an untagged list, an edited list, a file
  changed, a file of the closure changed, the tag holding another list; the
  built program asked through the gate itself, code-rules POLISH-FIX).
- **The seals** (one function, `seal.ts`), each by name and then by real
  path through junctions, the name checked before the path is resolved
  (code-rules, EXTRACT-FIX):
  1. **Before the freeze no copy's result is read on any month,** and no
     file of priced copies is written (M9; C15 (c)). Of the raw stores, only
     WAVE-H's is opened.
  2. **Step 1 reads, of the raw stores, only E's fill files** (`data.sha256`)
     from WAVE-H's store (`WAVEH_STORE`), and of COPY-H's funding store only
     rows whose hour is before END_E. Every reader refuses FRESH's raw store
     and any fill, row or minute at or after END_E.
  3. **FRESH's raw store (S) is not opened at all until step 2**
     (`FRESH_STORE`), whose pass reads it. Step 2 refuses any fill, row or
     minute at or after END_S.
  4. **FRESH-2 is not downloaded before step 2's report is recorded** in
     decisions, and then only if a yes needs confirming (C14). Until FRESH-2's
     freeze (C14) every reader refuses a key at or after END_S, open or not.
  5. **Always:** no reader opens the analyzer's folders (`…\ANALYZER\`: the
     exam's stores, look 1's outputs, the `liq` table that holds
     `closedPnl`); the collector's data; the paper experiment's or MARKET-1's
     run folders and logs, but the paper's seed files held to
     `experiment/seed.sha256` for the reproduction (C15 (a)); the kit's
     holdout files; or anything of polymarket-lab.

  Pinned by `test/copyh-seal.test.ts` (each refusal by name, by a junction to
  the name, and by a key one millisecond either side of each END; the order
  of the name check and the path's resolution).
- **After the freeze nothing changes but by R0's route.** A defect (the code
  not doing what this file says) is written in a dated decisions entry before
  any fix, with the diff, a test that failed before it, the copies whose
  numbers change, and the reason the fix cannot have been chosen by what was
  seen; the fix gets a new list tagged `copyh-freeze-<n + 1>`
  (`--final --tag <n + 1>`). Never a number of this file. **The named
  exceptions**, each allowed to differ only as its own rule says (the tool
  refuses any other difference): the rounds' `copyh-freeze-2` and FRESH-2's
  `copyh-freeze-3` (C14), and a value appended to `dirs.json` or
  `coins.json`, or a record added to `unpaired.json`, by C3's and C15's
  rulings at step 2 or at FRESH-2's stage.
- **Every output names its identity first:** the program's fingerprint;
  COPY-H's freeze list by SHA-256 and its tag; the kit's fingerprint and
  lib-exits' hash; `data.sha256`, `funding.sha256`, `coins.json`,
  `dirs.json` and `unpaired.json` by SHA-256; at step 2 and after, the
  earlier steps' files by SHA-256; the shared files' hashes; Node's version.

## C1. Instants and stages

- **ARCHIVE_START** = 2025-05-25T14:00:00.000Z, the first fill file's hour
  (`node_fills/hourly/20250525/14`). **M₀** = 2025-06-30T00:00:00.000Z, the
  first Monday with 30 days of the archive before it.
- **END_E** = 2026-05-29T02:00:00.000Z, the end of WAVE-H's raw store (its
  last fill file is 2026-05-29 01h). **END_S** = 2026-11-16T00:00:00.000Z
  (FRESH_END; FRESH's last fill file is 2026-11-15 23h). **END_F2** =
  2027-05-17T00:00:00.000Z (L1; the owner's ruling 7).
- **The stages**, by an entry's first fill t:

  | Stage | t in | Its Mondays | What it does |
  |---|---|---|---|
  | burn-in | [ARCHIVE_START, M₀) | none | labels and habits only; judges nothing |
  | **E** | [M₀, END_E) | 2025-06-30 → 2026-05-25 | MAIN's look 1; then the owner's rounds |
  | **S** | [END_E, END_S) | 2026-06-01 → 2026-11-09 | sealed until step 2: MAIN's look 2 (E ∪ S, cumulative); the chosen tries' one confirmation, on S alone |
  | **FRESH-2** | [END_S, END_F2), 26 weeks | 2026-11-16 → 2027-05-10 | sealed until a yes needs confirming: a MAIN KEEP's confirmation and each confirmed try's sealed judgment, on FRESH-2 alone |

  An entry's Monday M can lie in the stage before its own (an entry of
  2026-05-29 03:00Z has M = 2026-05-25): M says only which fills its label
  and habits come from (C5).
- **The looks:** look 1 has END = END_E and judges E's copies; look 2 has
  END = END_S and judges E ∪ S, cumulative. **At step 2: MAIN's look 2 on E
  + S; the at most two chosen tries are confirmed once on S alone.** (This
  sentence mends the plan's recommendation, line 3; decisions 2026-11-25,
  COPY-H's plan review, "a correction".) FRESH-2's stage has END = END_F2.
- **No fill, row or minute at or after the step's END is used.** An exit at
  or after END is "crossing" and marked at END − 1 ms (R8).
- **A fill file holds its writer's hour** (WAVE-H's H11), so a fill timed in
  a stage's last seconds can sit in the next stage's first file, which that
  step does not read. Every exit leg lies at least 62 s after its exit (C4's
  D), so such a fill can change only the marks of the stage's last minutes.
  The records of a stage's first file timed before the stage's start are
  counted when that file is read.
- **Weeks** run Monday 00:00Z to Monday 00:00Z; an entry's **Monday M** is
  the latest Monday 00:00Z at or before t. A UTC day is [00:00Z, +24 h); an
  instant's UTC week is the week that holds it, its UTC month the calendar
  month. Times are a fill's `time` and a funding row's `time`, in ms since
  the epoch, never a file's hour or a writer's clock. A window [a, b)
  includes a and excludes b.
- To be built in `src/copyh/instants.ts`; pinned by
  `test/copyh-instants.test.ts` (every instant above; each stage's Mondays;
  an entry's stage and M 1 ms either side of each boundary).

## C2. Who

- **Every account** of Hyperliquid's main perp dex: every `user` of the
  archive's kept records (C3), lower-cased. No pool list and no holdout, so
  nobody chooses who.
- **Left out, named and counted: the protocol vault's accounts** (L2): at a
  step whose END is END_k, every account with a kept record whose `dir` is
  "Net Child Vaults" in [ARCHIVE_START, END_k), found by that step from its
  own fills and printed with its identity. No list is written before the
  freeze, since S may not be opened then.
- **Other vaults and sub-accounts are accounts like any other;** each
  address stands alone, with no linking.
- **No arm F:** the owner's favourites are Polymarket accounts; a
  Hyperliquid list would be a later arm with its own start.
- **Whose whole history is built** (M4): an account's events, cycles and
  entries (C4) and its habits (C5) are built only when the account is P1
  (C5) at some Monday of the step's stages; every other account gets only
  its label at each Monday. This changes no result: no other account gives
  an entry to any line.
- To be built in `src/copyh/accounts.ts`; pinned by
  `test/copyh-accounts.test.ts` (an account whose one "Net Child Vaults"
  record lies in S: in look 1, out of look 2; addresses read in mixed case;
  the P1-at-some-Monday set, and an account outside it built nothing).

## C3. Fills, coins, dirs and the store

- **The files** (`copyh/data.sha256`, written by
  `tools/copyh-freeze.cjs --data` from WAVE-H's and FRESH's lists alone, no
  data file opened): every fill file of E's range from WAVE-H's store —
  `node_fills/hourly/` from 2025-05-25 14h through 2025-07-27 08h, then
  `node_fills_by_block/hourly/` from 2025-07-27 08h through 2026-05-29 01h
  (the switch hour 2025-07-27 08h in both formats) — and of S's range from
  FRESH's store, `node_fills_by_block/hourly/` 2026-05-29 02h through
  2026-11-15 23h; each line equal to its line in `waveh/data.sha256` or
  `polish/fresh.sha256` (the tool refuses otherwise) [the plan's counts:
  8,845 and 4,102 files]. FRESH-2's files are listed only at its freeze
  (C14).
- **Stops** (exit 5): a listed file missing, differing from its line, or
  failing to decode (`dist/polish/lz4.js`); a UTC day of files (by the
  file's date) with more than 1%, and at least 10, of its records failing the
  boundary below.
- **The boundary** (Zod, Iron Rule 3; `schema.ts`): a record is a `user` and
  its fill object, from a line of either format.
  - `user` is 0x and 40 hex digits, lower-cased when read; `coin` is
    non-empty text; `px` is decimal text above 0; `sz` is unsigned decimal
    text; `startPosition` is signed decimal text; `side` is "A" or "B";
    `time` is a safe integer; `crossed` is a boolean; `oid` and `tid` are
    digits, at most 2^64 − 1, kept as their digits (`JSON.parse`'s
    `context.source`; code-rules, PAPER-BUILD); `dir` is non-empty text;
    `liquidation` is optional, {`liquidatedUser`? (0x and 40 hex digits),
    `method` text}. Other keys are tolerated (`z.object`, never `.strict()`).
  - **`closedPnl`, `fee` and `builderFee` are dropped by the JSON reviver**
    before any object holds them, so no line of COPY-H can read them.
  - A record that fails is dropped and counted, never guessed; a line that
    fails its own shape counts its records as failing (one when none can be
    counted).
- **Kept: main-dex perp records:** a record whose `coin` has no ':', does
  not start with '@' and has no '/', and whose `dir` is not of kind
  `outcome` (below). **Counted and left out, by kind:** spot ('@n' or a pair
  with '/'; its `startPosition` is a balance and breaks half its chains,
  s6); builder dexes ('dex:COIN'); outcome operations; records timed before
  ARCHIVE_START or at or after the step's END. In the switch hour's two
  files a record in both (the same user, coin, `tid` and `time`) counts once
  [the files are disjoint: external-apis, EXTRACT-BUILD's checks].
- **`dirs.json`** (written before the freeze from the rehearsal's pass over
  all of E, C15 (c); values and counts only): every `dir` value of E's
  main-dex-shaped records, each with its kind, ruled from the value's text
  alone:
  - `trade`: a trader's own order ("Open Long", "Close Short", "Long >
    Short", …);
  - `forced`: "Auto-Deleveraging", "Settlement" and every "Liquidated …"
    value: exits only (C4);
  - `vault`: "Net Child Vaults" (its account is left out, C2);
  - `outcome`: an outcome-market operation, left out and counted.

  The store keeps each `dir` as written (a dictionary) and reads its kind
  from `dirs.json`. **A main-dex-shaped record whose `dir` is not in
  `dirs.json` stops the step** (exit 5) before any price. At step 2 or at
  FRESH-2's stage that stop is ruled by C0's route: the supervisor gives the
  new value its kind from its text alone, `dirs.json` is re-frozen with that
  value appended (the only difference), and the step runs again.
- **`coins.json`** (L2): the main-dex coin list of one `meta` reply of
  Hyperliquid's public info API (`{"type":"meta"}`), stored raw, with its
  read instant and SHA-256, by the funding fetch at its start (part 0;
  C9) [OPEN Q12]; in the reply's `universe` order, so that a coin's index
  **iid** is its position in that list (Hyperliquid's asset id), with its
  `isDelisted` flag as read. `coins.json` names the reply's instant and
  SHA-256, and `funding.sha256` lists the reply. [The supervisor's probe of
  2026-11-25 13:21Z read 235 coins, 56 flagged delisted; WAVE-CHECKS's read
  of 2026-11-13, 235 and 59: the list is the stored reply's, whatever its
  counts.] **Append-only:** iid is part of each entry's id, which seeds its
  delay (C4), so an index never changes and a later `meta` read may only
  append. **A kept record whose coin is not in the list stops the step**
  (exit 5); at step 2 or at FRESH-2's stage that stop is ruled by C0's
  route: the coin appended from a new stored `meta` reply (the only
  difference), and the step runs again.
- **Chain heads** (the mapping's one change, measured; L3): one **matching
  event**'s fills — the same user, `oid`, coin and `time` — are split into
  chains. Taken in the order the pass reads them (files in time order,
  records in file order), a fill b follows the earliest earlier fill a of
  its matching event that no fill follows yet and whose `startPosition` plus
  its signed size (+`sz` for "B", −`sz` for "A") equals b's `startPosition`
  **exactly, on the decimal text read as scaled integers**; otherwise b heads
  a new chain. Every fill takes its chain head's `startPosition`. Why:
  Hyperliquid's `startPosition` is per fill, Polymarket's `previous_size`
  per order event; with chain heads the kit's events are one per matching
  event, as on Polymarket. [s6: 10,539 of 10,541 multi-fill events chained
  fill to fill, none per order; with chain heads the kit's events break
  chains 17 times in 109,724 in a normal hour and 315 in 2.96 million in
  the 2025-10-10 21h crash hour, s7.]
- **Normalized into the kit's `normFill` fields** (`normalize.ts`): t =
  `time`; iid = the coin's index in `coins.json`; oid and tid = their digits
  as text; **prevS = the chain head's `startPosition` text**, prev =
  Number(prevS); sgn = +1 for "B", −1 for "A"; px = Number(`px`), q =
  Number(`sz`); fee = 0 and pnl = 0 (C5 shows the label does not need pnl);
  taker = `crossed`; liq = an own liquidation leg (`liquidation` present and
  its `liquidatedUser`, lower-cased, equal to the user); forced = liq, or a
  `dir` of kind `forced`.
- **Market trades** (M1): a **trade** is the two records that share
  (coin, `tid`, `time`) (external-apis, 2026-11-19: a `tid` alone is not
  unique); the kit's `removalOf` keys trades the same way. **A trade is a
  market trade when its taker record's `liquidation.method` is not
  "backstop" and its `dir` is neither "Auto-Deleveraging" nor "Settlement"**:
  the backstop's takeover and the engine's deleveraging and settlement
  prints are prices no follower could trade at (WAVE-H's H8 and the exam's
  P7 leave out the backstop's; on 2025-10-10 its legs were up to 54% of a
  coin's takers; external-apis). The pass gives both records of a trade the
  reading of its taker record; a record whose trade's other record is in
  neither its own file nor the next file in order (C15's pairing) reads its
  own fields, and is counted. [OPEN Q6: "Net Child Vaults" taker records.]
- **The store** (COPY-H's own pass, in the analyzer's proven form, with no
  new dependency):
  - **`fills`**: every kept record of the step's files: `time`, iid,
    `user`, `px`, `sz`, `side`, `startPosition` exactly (its text, or a
    scaled integer that gives the text back) and its chain head's, `oid`
    and `tid` (u64), `crossed`, the liquidation (none, own or counterparty)
    and its `method`, the `dir` (a dictionary), the trade's market reading,
    and the record's order in the pass. Partitioned by account bucket (the
    address's last two hex digits: 256) and UTC month.
  - **`bars`**: each main-dex coin's minute, from its market trades' taker
    records only (one taker record a trade): the trades, Σ sz, Σ px·sz, the
    **last price** (the taker record latest in `time`, ties in the pass's
    order; M7), the opposite-side pairs' relative-gap sum and count (C9),
    and the left-out taker records' count by cause (backstop, ADL,
    Settlement; M1's print). Partitioned by coin and UTC month.
  - One part a file: a stopped pass resumes from whole parts; the manifest
    is written last. Each step builds its store twice (C15).
- **Holes:** a **hole** is a stretch of 60 s or more inside [ARCHIVE_START,
  END) with no record of any coin, from the union of every file's record
  times, so that a gap between files counts (as the exam's P8) [the switch
  hour's 4 min 22 s, 08:45:48.664 → 08:50:10.273: external-apis]; listed at
  each step with the records by day. A hole, or a chain break (lib-exits'
  `chainBreaks` on the account's events), inside a copy's span makes a gap
  copy (C11). **Covered:** every window of an account inside [ARCHIVE_START,
  END) is covered in R3's sense, since the archive holds every trade; holes
  are listed and make gap copies, never quiet days.
- To be built in `src/copyh/schema.ts`, `coins.ts`, `dirs.ts`, `chains.ts`,
  `normalize.ts`, `market-trades.ts`, `pass.ts`, `writers.ts`, `store.ts`
  and `holes.ts`; pinned by `test/copyh-schema.test.ts` (each field's
  refusal; the reviver drops the three fields before any object holds them;
  an id above 2^53; the 1% day stop at both sides), `test/copyh-coins.test.ts`
  (the kept and left-out kinds; a coin outside the list stops; an appended
  list keeps every index), `test/copyh-dirs.test.ts` (each kind; a value
  outside the list stops), `test/copyh-chains.test.ts` (one chain; several
  chains in one matching event; two heads with one text; a fill that
  continues nothing; values `toPrecision(12)` would equate and scaled
  integers do not; an event split by a file boundary; a large close in
  hundreds of fills whose float sum leaves a residue, L3),
  `test/copyh-normalize.test.ts` (every field, an own and a counterparty
  liquidation leg, each forced `dir`), `test/copyh-market-trades.test.ts`
  (a backstop's taker and maker legs, an ADL and a Settlement record on
  either side, a market liquidation's legs kept, a trade split across two
  files, the shared `tid` of two trades) and `test/copyh-pass.test.ts`
  (both formats; the switch hour; a resumed pass equal to an unbroken one; a
  bit flipped in one part caught; rows conserved; the holes).

## C4. Events, cycles, entries, delay

*Written in the next commit.*

## C5. Labels and habits at M

*Written in the next commit.*

## C6. Markets

*Written in the next commit.*

## C7. The lines

*Written in the next commit.*

## C8. The money reading

*Written in the next commit.*

## C9. The taker setting and the market objects

*Written in the next commit.*

## C10. The judgement reading and the edge over the market

*Written in the next commit.*

## C11. Unpriced, missing, gap

*Written in the next commit.*

## C12. The statistic and the verdict

*Written in the next commit.*

## C13. The prints

*Written in the next commit.*

## C14. The owner's rounds, and FRESH-2

*Written in the next commit.*

## C15. The steps, the record, and what runs before the freeze

- **The program:** `node dist\copyh.js <command>`, by hand, from the
  repository's build (or its tag's build, C0), one command at a time, at
  idle priority (the program sets it), with the worker heap of `design.ts`
  [SET BEFORE THE FREEZE: about twice the rehearsal's measured peak, the
  owner's rule; no heap flag]. No part is started in 02:30–06:00Z or
  10:25–11:15Z. **No build, test or other heavy run on the machine during a
  step** (decisions 2026-11-20). Settings, no defaults: `COPYH_ROOT`
  (COPY-H's own folder: its stores, parts and outputs), `WAVEH_STORE` (read
  only), `COPYH_FUNDING` (read only, the funding store, C9), and for step 2
  `FRESH_STORE` (read only).
- **Parts** (the plan's question 8): every heavy run is a chain of
  resumable parts, each written whole (`.tmp`, then renamed) and planned to
  last at most 15 minutes; a crash loses at most the part it was in, and a
  resumed run equals an unbroken one. **A run that crashes before its result
  exists is not a look.**
- **Exit codes:** 0 done; 1 a crash; 2 bad settings or a heap flag; 4 the
  freeze does not verify (C0); 5 not ready (sealed; a listed file missing,
  differing or failing to decode; a day over the record-failure limit; a
  `dir` or coin outside its list; an earlier step's file differing from its
  hash; already run); 6 a check failed (the integrity, the reproduction, a
  held number, the tripwire of C16); 7 the two builds of a store, or the two
  runs of an engine part, differ.
- **Before the freeze** (the plan's part 4; `reproduce.ts`, `rehearse.ts`):
  - **(a) The reproduction: known answers on Polymarket's weeks before the
    cut.** The paper's seed (its files held to `experiment/seed.sha256`; never
    a holdout account) is converted to Hyperliquid's record shape, with
    per-fill `startPosition` chains, then run through COPY-H's mapping (C3's
    chain heads and normalization, C4, C5) and the kit, on the kit's own
    panel and taker setting. It must give the paper's own reproduction's
    known answers (decisions 2026-11-12, PAPER-BUILD's technical calls):
    - FIND-6-EXITS's **1,700 of 1,700** non-holdout copies to 1e-9 bps (the
      plan's "1,918" holds 218 holdout copies, which the seed does not
      hold) [OPEN Q10];
    - X3's 1,366 copies at its printed figures, and 1,104 of 1,104 per
      entry;
    - **P1 at every Monday of the 26 for every account** equal to the
      paper's; labels differing only between "churner" and "unclassified —
      mixed" (pnl 0; L4), every difference listed;
    - FR1's counts, the main line's 1,137 / 157 and 525 / 61.

    A failure is exit 6. The frozen program runs it again before step 1
    (`reproduce`, into `repro.json`, which step 1 requires), and step 2's
    program again before step 2.
  - **(b) A synthetic world** through step 1 → the rounds → step 2 →
    FRESH-2's stage under a synthetic tag, every output asserted; run once
    more on a planted defect's commit as its control, which must stop
    (code-rules: a rehearsal on synthetic data rehearses the wiring).
  - **(c) The rehearsal on real months, counts only** (M2, M3, M4, M9, H1
    fix 7, L3), by the program to be frozen, on all of E from WAVE-H's raw
    store:
    1. the pass (C3) and its counts: records by kind and `dir`; taker
       records by `dir` and `liquidation.method` (M1's left-out; Q6); the
       holes; the chain breaks. `dirs.json` and `unpaired.json` (below) are
       written from them before any later count;
    2. labels at every Monday of E, the lines' memberships, entries and
       exits, no price: copies a week by line;
    3. **C16's counts on all of E,** with the projected unpriced share of
       MAIN's set, which sets C9's settlement mark (M2) [SET BEFORE THE
       FREEZE];
    4. **the survival curve of MAIN copies' holds** (the share of an entry
       day's copies still open at each hour after entry, from entries and
       exits alone) **and MAIN's long share day by day** (H1 fix 7), from
       which the rules review reads the ratio "real ÷ read" by the
       review's section 6 formula;
    5. among the accounts P1 at some Monday of E, the largest account's
       order events and the kit's time and memory on it, which set C4's
       EVENTS_MAX (M4) [SET BEFORE THE FREEZE];
    6. the order events with 1e-9 ≤ |prev + net| < 1e-6 (L3: a float
       residue the kit's 1e-9 would read as a reduce or a flip);
    7. **the label bound's check** (M3): on one 1/32 address slice (the
       addresses whose number is 0 mod 32) [OPEN Q5] at four Mondays where
       the bound binds — 2025-12-01, 2026-02-02, 2026-04-06 and 2026-05-25 —
       the label and MAIN's membership from C5's 90-day capture against the
       whole capture from ARCHIVE_START, every difference listed. **Its pass
       mark, fixed now: MAIN's membership differs for under 1% of MAIN's
       accounts at each of the four Mondays.** If it fails, C5's label reads
       the whole capture from ARCHIVE_START, before the freeze [OPEN Q3];
    8. the label step's measured CPU time in all and its cut into parts
       (M3);
    9. every part's run time and memory peak, which set the worker heap
       [SET BEFORE THE FREEZE];
    10. **the priced copies of E's first two weeks** (entries with t in
        [2025-06-30, 2025-07-14), END 2025-07-14T00:00:00.000Z), by the code
        that prices at step 1, **computed in memory only: no file of priced
        copies is kept** (M9). Only their SHA-256 is printed — of the
        copies' lines as `positions.jsonl.gz` writes them, sorted by entry
        id — with their counts by line and their legs by source. Step 1
        computes the same and prints both hashes side by side, deciding
        nothing;
    11. the calibration prints (C13), on outcome-free cells.

    Every count and print of the rehearsal is a count of instants, sizes,
    labels and memberships: no price change after an instant is computed
    or printed.
- **Step 1** (`dist\copyh.js step1`; the gate at `copyh-freeze-1`;
  `repro.json` passed by this very program, else exit 5):
  1. a second step 1 refuses (exit 5);
  2. **E's pass, twice:** two stores, each built in full from WAVE-H's raw
     files, compared byte for byte — the manifest but for the run's fields
     (the code, the instants, the seconds, the peaks) and every file it
     names — into `look1\builds.json`. A difference stops the step (exit 7)
     with the list; nothing is repaired in code: both builds are moved aside
     in a decisions entry and step 1 runs again;
  3. **the integrity, before any position** (`integrity.ts`, written whole
     to `look1\integrity.json`): every listed file read whole; every
     partition present; records conserved (read = kept + left out by kind +
     failed + not used); **one taker and one maker a trade**, paired by
     (coin, `tid`, `time`) in its own file or the next file in order; a
     record left unpaired only in the stage's first or last file, each
     listed, or when `copyh/unpaired.json` lists it (written from the
     rehearsal's pass and ruled before the freeze, as the exam's
     `known-unpaired.json`); the sample days re-read cell by cell by an
     independent reader (`reread.ts`, sharing no code with the pass):
     2025-07-27, 2025-10-10 and 2026-03-15 [OPEN Q13]; C3's counts, the
     holes and the chain breaks. A failure stops the step (exit 6), every
     record listed, for the supervisor's ruling by C0's route;
  4. the engine's counts, no price: labels at every Monday of E, the P1
     set, the lines' memberships, entries, exits and the legs' instants;
  5. **the tripwire (C16), before any price:** above 1%, the step stops
     (exit 6) for a decisions entry;
  6. the positions and prices, then d and x′ (C8–C11), every engine part
     twice (below);
  7. everything computed first; then **look 1's `result.json`, written
     whole before anything about an outcome is logged,** then
     `positions.jsonl.gz` (every line's copies with their legs and the
     covariates of C14), then `report.json` (C13). After a failure between
     the writes, `result.json` is moved aside (`result.first.json`) in a
     decisions entry and step 1 runs again: the same positions' SHA-256,
     verdict and numbers, else a code defect.
- **The engine's guard** (M4) [OPEN Q4]: every engine part — the labels,
  the removal tables (C10) and each account bucket's positions — is computed
  twice, in separate processes, and the two are held equal by SHA-256
  before either is used (exit 7 on a difference). A step's parts hold
  priced copies on disk before its `result.json` exists; nothing but the
  step itself reads them, and every other reader refuses them by name.
- **Between the steps, the rounds** (C14): `dist\copyh.js tries --round
  <n>`, then `choice`; then `copyh-freeze-2`.
- **Step 2** (`dist\copyh.js step2`; the gate at `copyh-freeze-2`; step 1's
  `result.json`, `positions.jsonl.gz` and `report.json` held to
  `copyh/look1.sha256`, which freeze 2 lists, else exit 5):
  1. a second step 2 refuses (exit 5);
  2. **S's pass, twice,** held equal (`look2\builds.json`, exit 7); S's
     integrity as step 1's 3., its sample days 2026-06-15 and 2026-10-15
     [OPEN Q13]; a record left unpaired outside S's first and last file, a
     new `dir` or a new coin is ruled by C0's route;
  3. **step 1 recomputed** from E's store by this program and held to
     `look1.sha256`'s positions hash (exit 6);
  4. the engine on E ∪ S at END_S, every part twice; the tripwire on look
     2's set and on S's copies alone (above 1%: exit 6);
  5. look 2 (C12); the confirmation of the frozen tries on S alone (C14);
     MAIN on S alone (L8, a print);
  6. `look2\result.json` first, then `positions.jsonl.gz`, then
     `report.json`.
- **Every look** has a report and a Final review with independent code
  before the owner reads its verdict.
- **Machine time** [the plan and its review; deciding nothing]: a store's
  pass about 12 CPU-hours (on 3 workers about 2.4 h of wall time for E and
  1.6 h for S), twice a step; the label step at most about 15 CPU-hours
  (M3), twice; the funding fetch 3.7–8 hours of network at half budget
  (L6).
- To be built in `src/copyh/steps.ts`, `main.ts`, `integrity.ts`,
  `reread.ts`, `twin.ts`, `reproduce.ts` and `rehearse.ts`; pinned by
  `test/copyh-steps.test.ts` (each refusal and exit code; the writes'
  order; a second step refused; a resumed part equal to an unbroken one;
  each twin's difference caught; step 2 refusing a changed `look1.sha256`
  file), `test/copyh-integrity.test.ts` (made-up stores through every check)
  and `test/copyh-rehearse.test.ts` (no priced file written: the rehearsal's
  folder holds no file a priced copy reaches; the hash of the copies'
  lines).

## C16. The coverage tripwire, before any price

- **At each step** (and before the freeze on all of E, C15 (c)), from the
  bars and the copies' plans alone (entries, exits and D; no price), over
  MAIN's set of the look (voted by END):
  1. the follow and exit instants whose coin has no market trade in the 6
     minutes up to the instant's minute end (the minute that holds the
     instant and the 5 before it: the kit's staleness);
  2. **each funding hour inside a copy's hold whose coin has no market
     trade in the 6 minutes before the hour** (M2: the kit's third reason
     for "unpriced", a funding settlement without a mark; under C9's
     60-minute rule, if it is set, the 60 minutes before the hour);
  3. the copies open across their coin's settlement (C6);
  4. the funding hours missing (charged nothing and counted; they unprice
     nothing);
  5. the gap copies (C11: printed with and without, never unpriced);

  and so **the projected unpriced share:** the share of MAIN's set with at
  least one of 1–3. It is exact for those reasons, since a minute has a mark
  exactly when it has a market trade (C9).
- **Above 1%** (half of the 2% WITHHELD line), the step stops before any
  price (exit 6) for a decisions entry.
- **Before the freeze, on all of E** (M2): if the projected share is above
  0.5%, C9's settlement mark becomes the 60-minute rule; if it is still
  above 1% with that, the freeze waits for a decisions entry (the plan gate
  is read again).
- The projection comes from each step's own months, never from older ones
  (look 1's lesson). [In September 2025 the planner measured 0.01% of
  instants without a trade, s8: three hours of one week, weighted to BTC,
  ETH and SOL; the exam's own projection of funding without a price was
  2.4%, look 1's report.]
- To be built in `src/copyh/tripwire.ts`; pinned by
  `test/copyh-tripwire.test.ts` (each reason alone on a made-up coin; a
  quiet :54 → :59 before an hour inside a hold of days; the 1% stop on
  both sides with a margin; on a made-up world, the projection equal to the
  copies the pricing then finds unpriced by reasons 1–3).

## C17. What never changes

*Written in the next commit.*

## C18. The numbers

*Written in the next commit.*
