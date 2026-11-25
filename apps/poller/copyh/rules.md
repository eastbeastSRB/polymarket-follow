# COPY-H's rules (copyh/rules.md)

COPY-H asks the project's founding question on Hyperliquid's archive: does
copying the traders the paper experiment's MAIN rule picks pay a follower
who copies after R4's delay (the research R8's 62–95 s), leaves when the
trader leaves, at a taker's real costs? This file is written before the
freeze (C0): drafted, reviewed fresh and fixed; then the code's reviews, the
freeze and look 1. The plan: `docs/reviews/copy-h-plan-2026-11-25.md`
(`83ac6ba`), section 2 (its draft C0–C17), with every fix of its review,
`docs/reviews/copy-h-plan-review-2026-11-25.md` (`dda8d38`; H1–H2, M1–M9,
L1–L9), and the owner's eight rulings, decisions 2026-11-25 "COPY-H'S PLAN
APPROVED" (`b0a546e`), folded in; then the fixes of this file's own fresh
review, `docs/reviews/copyh-rules-review-2026-11-25.md` (`4588143`; RH1,
RM1–RM8, RL1–RL13, and its wording for COPYH-STORE's differences D1–D15),
with the owner's rulings on RM3 and RM4 (decisions 2026-11-25, `60e694f`)
and the supervisor's on the review's questions (`d8cd4a1`). Each review's
finding is named beside the rule it changed. Where a rule says "R…", it
means the paper experiment's rule (`apps/poller/experiment/rules.md`,
R0–R17) word for word; "the kit's X" is `research/kit` unchanged and
"lib-exits' X" `research/find-6-exits` unchanged, both run byte for byte. A
research report is named in full ("the research R8"); "R…" alone is always
a rule of the paper experiment. "s6" to "s8" are the planner's scripts (the
plan's section 11). Where a rule names code, the code to be built in
`apps/poller/src/copyh/` (compiled to `dist/copyh/`) does exactly that, and
the test named beside it pins it. Every number a rule fixes has one home,
`src/copyh/design.ts`, and the table at the end (C18) holds this file to it.
Two values are set from the rehearsal's counts before the freeze, each
marked where it stands with the rule that sets it: C9's settlement mark and
C15's worker heap (C17). Every choice the draft left open is ruled
(decisions 2026-11-25: the supervisor's provisional rulings as the rules
review checked them, and `d8cd4a1`). Figures in brackets are prints from
before the freeze, deciding nothing.

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
  - **DROP**: on both readings, an edge of +10 bps a copy is ruled out. **A
    DROP closes copying MAIN's way,** on both venues (FABLE-REVIEW, section
    6).
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
    byte, to its line in that program's freeze list at COPY-H's freeze
    commit (the tool refuses otherwise; RL12). Named now:
    `dist/paper/copy.js` (`planCopyThrough`, and R13's `stopInstant`,
    `DAYS7_MS` and `jumpRatio`), `dist/paper/stats.js` (`twoWay`,
    `dailyEValue`, `smallestEdge`; also in MARKET-1's list) and
    `dist/paper/research.js` (the kit's loader and fingerprint check), in
    `experiment/FROZEN.sha256`; `dist/polish/lz4.js` (the pass's LZ4 decoder)
    and `dist/polish/tables.js` (the analyzer's column codecs, the store's
    table format), in `polish/FROZEN.sha256`; `dist/waveh/keys.js` and `dist/waveh/instants.js`
    (`keyDate`, the one parser of a key's date) and `dist/waveh/lz4.js` (the
    independent reader's decoder, C15), in `waveh/FROZEN.sha256`; and lz4js's
    three files (`node_modules/lz4js/lz4.js`, `util.js`, `xxh32.js`), as
    WAVE-H's and the exam's lists name them (D14). Any other file the build's
    imports reach is listed the same way, or the tool refuses;
  - every file of `research/` byte for byte: the kit, fingerprint
    `2d3667b5ce90645b41dfee4e6fc425ab3e64c985cb4973bfed6ece5052c409aa`, and
    lib-exits, `612d58365ba4c2a2d88a3f73a41a08e193d0874458d862b169fc51f218926330`;
  - every file of `copyh/`, these required by name: this file,
    `coins.json` (C3), `dirs.json` (C3), `unpaired.json` (C15),
    `data.sha256` (C3), `funding.sha256` (C9), `calibration.json` (C13) and
    `rehearsal.json` (C15 (c): the counts that set this file's values, the
    label check's result, and the two-week copies' SHA-256) (RL7).

  `dist/schedule.js` and `dist/log.js` are shared and not frozen; their
  hashes are logged at each start (as the exam's P0). The tool is to be
  built in `tools/copyh-freeze.cjs`; pinned by `test/copyh-freeze.test.ts`
  (a closure file differing from its own freeze's line refused; each later
  list's allowed differences, below and C14, and any other refused).
- **When another program re-freezes a file of the closure** (the paper's
  breaker fix waits; decisions 2026-11-25): COPY-H's list never changes for
  it. COPY-H's steps then run from a build of its own tag's tree (a worktree
  at `copyh-freeze-<n>`, compiled by the lockfile's TypeScript), which the
  gate holds to the same list. A defect the other program fixes in a file
  COPY-H runs is COPY-H's own defect too, fixed only by the route below.
- **The gate** (to be built in `src/copyh/gate.ts`): a step runs only when
  `copyh/FROZEN.sha256` lists every file of what runs with its hash, holds
  exactly one line `# tag copyh-freeze-<n>`, that git tag holds this very
  list byte for byte, and the kit's `checkKit()` returns its fingerprint and
  lib-exits its hash; and the list is of the kind the step asks for (below,
  RM2). Otherwise the step writes one line, "frozen files differ", and stops
  (exit 4), having read no data. Every step checks it first. Pinned by
  `test/copyh-gate.test.ts` (an untagged list, an edited list, a file
  changed, a file of the closure changed, the tag holding another list, a
  list of another kind than the step's; the built program asked through the
  gate itself, code-rules POLISH-FIX).
- **The seals** (one function, to be built in `src/copyh/seal.ts`), each by
  name and then by real path through junctions, the name checked before the
  path is resolved (code-rules, EXTRACT-FIX):
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
     decisions, and then only if a yes needs confirming (C14). Every reader
     refuses a key at or after END_S, open or not, but the `fresh2` command
     under a verified FRESH-2 freeze, which reads FRESH-2's store
     (`FRESH2_STORE`) and refuses any fill, row or minute at or after END_F2
     (RM7).
  5. **Always:** every reader refuses a path outside the run's roots, the
     folders its settings name, by its name and then by its real path; and
     inside them the analyzer's folders (`…\ANALYZER\`: the exam's stores,
     look 1's outputs, the `liq` table that holds `closedPnl`). So the
     collector's data, the paper experiment's and MARKET-1's run folders and
     logs, the kit's holdout files and everything of polymarket-lab are
     never reached. One command has one root more: `reproduce` reads the
     paper's seed folder (`PAPER_SEED`), each file held to its line in
     `experiment/seed.sha256` before it is parsed (D15).

  Pinned by `test/copyh-seal.test.ts` (each refusal by name, by a junction to
  the name, and by a key one millisecond either side of each END; the order
  of the name check and the path's resolution; a path outside the roots; a
  junction inside a root that leads out of it).
- **After the freeze nothing changes but by R0's route.** A defect (the code
  not doing what this file says) is written in a dated decisions entry before
  any fix, with the diff, a test that failed before it, the copies whose
  numbers change, and the reason the fix cannot have been chosen by what was
  seen; the fix gets a new list. Never a number of this file. **Lists are
  numbered in the order they are made:** each is tagged `copyh-freeze-<n>`,
  n the next free number (`--tag <n>`), whatever its kind; no rule of this
  file names a list by its number. **The kinds of list after the first,**
  each allowed to differ from the list before it only as its own rule says
  (the tool refuses any other difference): a defect's fix (above); a value
  appended to `dirs.json` or `coins.json`, or a record added to
  `unpaired.json`, by C3's and C15's rulings; **the rounds' freeze** (C14,
  `--rounds`); **FRESH-2's freeze** (C14, `--fresh2`). **A step asks for
  what its list holds, never for a number:** step 1 runs under a list
  without `copyh/look1.sha256`; step 2 under one that holds
  `copyh/look1.sha256` and `copyh/choice.json` and no `copyh/fresh2.sha256`;
  FRESH-2's stage under one that holds `copyh/fresh2.sha256`,
  `copyh/funding2.sha256` and `copyh/look2.sha256`. Before a step runs under
  a list of any of these kinds, a fresh worker reads its lines that differ
  from the list before it (as the exam's P0 for its look 2) (RM2).
- **Every output names its identity first:** the program's fingerprint;
  COPY-H's freeze list by SHA-256 and its tag; the kit's fingerprint and
  lib-exits' hash; `data.sha256`, `funding.sha256`, `coins.json`,
  `dirs.json`, `unpaired.json`, `calibration.json` and `rehearsal.json` by
  SHA-256; the step's stores' manifests,
  `builds.json` and `integrity.json` by SHA-256; at step 2 and after, the
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
  | **S** | [END_E, END_S) | 2026-06-01 → 2026-11-09 (an entry of its first three days has M = 2026-05-25) | sealed until step 2: MAIN's look 2 (E ∪ S, cumulative); the chosen tries' one confirmation, on S alone |
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
- **A fill file holds its writer's hour** (WAVE-H's rules, H1), so a fill
  timed in a stage's last seconds can sit in the next stage's first file.
  Each store keeps the records of its own files timed in its own window, so
  such a fill is kept by no store: it is counted when that file is read, the
  stage's last minute's mark lacks it, and its account's next event shows a
  chain break (a gap copy, C11). Every exit leg lies at least 62 s after its
  exit (C4's D), so nothing else of a copy can change (D7; RL1).
- **Weeks** run Monday 00:00Z to Monday 00:00Z; an entry's **Monday M** is
  the latest Monday 00:00Z at or before t. A UTC day is [00:00Z, +24 h); an
  instant's UTC week is the week that holds it, its UTC month the calendar
  month. Times are a fill's `time` and a funding row's `time`, in ms since
  the epoch, never a file's hour or a writer's clock. A window [a, b)
  includes a and excludes b.
- To be built in `src/copyh/instants.ts` (an instant's stage, Monday, UTC
  day, week and month; the instants themselves are `design.ts`'s, C18;
  D13); pinned by `test/copyh-instants.test.ts` (every instant above; each
  stage's Mondays; an entry's stage and M 1 ms either side of each
  boundary).

## C2. Who

- **Every account** of Hyperliquid's main perp dex: every `user` of the
  archive's kept records (C3), lower-cased. No pool list and no holdout, so
  nobody chooses who.
- **Left out, named and counted: the protocol vault's accounts** (L2): for
  a reading whose END is END_k, every account with a kept record whose `dir`
  is "Net Child Vaults" in [ARCHIVE_START, END_k), found by the step from its
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
  boundary below. At step 2 or at FRESH-2's stage a day over the limit is
  ruled by C0's route as a defect of the boundary: the entry lists the
  failing records' shapes, the boundary is widened to read what the archive
  wrote (never narrowed, and nothing else changes), and the pass runs again,
  before any price of that stage (RH1 (d)).
- **The boundary** (Zod, Iron Rule 3; `schema.ts`): a record is a `user` and
  its fill object, from a line of either format.
  - `user` is 0x and 40 hex digits, lower-cased when read; `coin` is
    non-empty text; `px` is decimal text above 0; `sz` is unsigned decimal
    text and `startPosition` signed decimal text, each of at most 15
    significant digits (a record with more fails the boundary), so a double
    holds each exactly (D5); `side` is "A" or "B"; `time` is a safe integer;
    `crossed` is a boolean; `oid` and `tid` are digits, at most 2^64 − 1,
    kept as their digits; `dir` is non-empty text; `liquidation` is
    optional, {`liquidatedUser`? (0x and 40 hex digits), `method` text}.
    Other keys are tolerated (`z.object`, never `.strict()`).
  - **`closedPnl`, `fee` and `builderFee` never reach an object:** each is
    cut, key and value, from a record's bytes before `JSON.parse`; a record
    whose text the cut cannot settle is parsed with a reviver that drops the
    three at any depth. So no line of COPY-H can read them. On either path an
    `oid` or `tid` of 16 digits or more is read from its digits
    (`context.source`). A record that then does not parse fails the boundary
    (D1).
  - A record that fails is dropped and counted, never guessed; a line that
    fails its own shape counts its records as failing (one when none can be
    counted).
- **Kept: main-dex perp records:** a record whose `coin` has no ':', does
  not start with '@' and has no '/', and whose `dir` is not of kind
  `outcome` (below). **Counted and left out, by kind:** spot ('@n' or a pair
  with '/'; its `startPosition` is a balance and breaks half its chains,
  s6); builder dexes ('dex:COIN'); outcome operations; records timed before
  ARCHIVE_START or at or after the step's END. In the switch hour's two
  files a record found in both (the same user, coin, `tid`, `time`, `side`
  and `crossed`) counts once, the first file's kept, and is counted. If it is
  a market trade's taker record the build stops (exit 5) for a ruling before
  the freeze: the files were measured disjoint (external-apis,
  EXTRACT-BUILD's checks), and a dropped taker would change a minute's bar
  (D2).
- **`dirs.json`** (written before the freeze from the rehearsal's count of
  each value, C15 (c); the file holds each value and its kind): every `dir`
  value of E's main-dex-shaped records, each with its kind, ruled from the
  value's text alone:
  - `trade`: a trader's own order ("Open Long", "Close Short", "Long >
    Short", …);
  - `forced`: "Auto-Deleveraging", "Settlement" and every "Liquidated …"
    value: exits only (C4);
  - `vault`: "Net Child Vaults" (its account is left out, C2, and its
    records are no market trade, below);
  - `outcome`: an outcome-market operation, left out and counted.

  The store keeps each `dir` as written (a dictionary) and reads its kind
  from `dirs.json`. **A main-dex-shaped record whose `dir` is not in
  `dirs.json` stops the step** (exit 5) before any price. At step 2 or at
  FRESH-2's stage that stop is ruled by C0's route: the supervisor gives the
  new value its kind from its text alone, `dirs.json` is re-frozen with that
  value appended (the only difference), and the step runs again.
- **`coins.json`** (L2): the main-dex coin list of one `meta` reply of
  Hyperliquid's public info API (`{"type":"meta"}`), stored raw, with its
  read instant and SHA-256, by the funding fetch at its start (part 0, its
  `info/meta.json`; C9); in the reply's `universe` order, so that a coin's
  index **iid** is its position in that list (Hyperliquid's asset id), with
  its `szDecimals` and its `isDelisted` flag as read. No rule reads the flag:
  a delisting is the Settlement record (C6; RL11). `coins.json` is written by
  `dist\copyh.js coins` from the stored reply, held to the store's manifest
  (RL7); it names the reply's instant and SHA-256, and `funding.sha256`
  lists the reply. [The supervisor's probe of 2026-11-25 13:21Z read 235
  coins, 56 flagged delisted; WAVE-CHECKS's read of 2026-11-13, 235 and 59:
  the list is the stored reply's, whatever its counts.] **Append-only:** iid
  is part of each entry's id, which seeds its delay (C4), so an index never
  changes and a later `meta` read may only append. **A kept record whose
  coin is not in the list stops the step** (exit 5); at step 2 or at
  FRESH-2's stage that stop is ruled by C0's route: the coin appended from a
  new stored `meta` reply (the only difference), and the step runs again.
  Before the freeze, a kept record of E whose coin the reply lacks stops the
  rehearsal's pass; the supervisor rules it in a decisions entry from the
  name alone: the coin is appended after the reply's coins (it has no
  funding rows), or its records are left out and counted as their own kind
  (RL5).
- **Chain heads** (the mapping's one change, measured; L3): one **matching
  event**'s fills — the same user, `oid`, coin and `time` — are split into
  chains when the account's fills are read (`chains.ts`; the store keeps
  each fill's own `startPosition`, never its head's). The event's fills are
  taken in the order of their `startPosition` along the order's side (rising
  for "B", falling for "A"; the pass's order where two are equal). A fill b
  follows a fill a that no fill follows yet and whose `startPosition` plus
  its signed size (+`sz` for "B", −`sz` for "A") equals b's `startPosition`
  **exactly, as decimal numbers (scaled integers, never floats)**; when two
  could precede b, the one earlier in the pass's order does; otherwise b
  heads a new chain. Every fill takes its chain head's `startPosition` (D3,
  D4). Why:
  Hyperliquid's `startPosition` is per fill, Polymarket's `previous_size`
  per order event; with chain heads the kit's events are one per matching
  event, as on Polymarket. [s6: 10,539 of 10,541 multi-fill events chained
  fill to fill, none per order; with chain heads the kit's events break
  chains 17 times in 109,724 in a normal hour and 315 in 2.96 million in
  the 2025-10-10 21h crash hour, s7.]
- **Normalized into the kit's `normFill` fields** (`normalize.ts`): t =
  `time`; iid = the coin's index in `coins.json`; oid and tid = their digits
  as text; **prevS = the chain head's `startPosition` as the shortest text
  of its double** (one text a value, so that the kit's event key cannot
  split one position in two; D5), prev = Number(prevS); sgn = +1 for "B",
  −1 for "A"; px = Number(`px`), q =
  Number(`sz`); fee = 0 and pnl = 0 (C5 shows the label does not need pnl);
  taker = `crossed`; liq = an own liquidation leg (`liquidation` present and
  its `liquidatedUser`, lower-cased, equal to the user); forced = liq, or a
  `dir` of kind `forced`.
- **Market trades** (M1): a **trade** is the two records that share
  (coin, `tid`, `time`) (external-apis, 2026-11-19: a `tid` alone is not
  unique); the kit's `removalOf` keys trades the same way. **A trade is a
  market trade when its taker record's `liquidation.method` is not
  "backstop" and its `dir` is none of "Auto-Deleveraging", "Settlement" and
  "Net Child Vaults"**: the backstop's takeover and the engine's deleveraging
  and settlement prints are prices no follower could trade at (WAVE-H's H8
  and the exam's P7 leave out the backstop's; on 2025-10-10 its legs were up
  to 54% of a coin's takers; external-apis), and a netting inside the
  protocol's vault is no public trade, whatever its count (the rules
  review's section 3, Q6). The rehearsal prints the counts (C15 (c) 1). The
  pass gives both records of a trade the reading of its taker record; a
  record whose trade's other record is in neither its own file nor the next
  file in order (C15's pairing) reads its own fields, and is counted.
- **The store** (COPY-H's own pass, in the analyzer's proven form, with no
  new dependency):
  - **`fills`**: every kept record of the step's files: `time`, iid,
    `user`, `px`, `sz`, `side`, `startPosition` as a double (exact: the
    boundary's 15 digits; D5), `oid` and `tid` (u64), `crossed`, the
    liquidation (none, own or counterparty) and its `method`, the `dir` (a
    dictionary), the trade's market reading; an account's rows in `time`
    order, equal times in the pass's order (files in time order, records in
    file order), each with its file (D6). Partitioned by account bucket (the
    address's last two hex digits: 256) and UTC month.
  - **`bars`**: each main-dex coin's minute, from its market trades' taker
    records only (one taker record a trade): the trades, Σ sz, Σ px·sz, the
    **last price** (the taker record latest in `time`, ties in the pass's
    order; M7), the opposite-side pairs' relative-gap sum and count (C9),
    the left-out taker records' count by cause (backstop, ADL, Settlement,
    "Net Child Vaults"; M1's print), and the Settlement records' Σ sz and
    Σ px·sz (RM4). Partitioned by coin and UTC month.
  - One part a file: a stopped pass resumes from whole parts; the manifest
    is written last. Each step builds its store twice (C15).
  - No minute and no pair is shared by two stores (C1; D7).
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
  refusal; both paths drop the three fields before any object holds them; a
  value of 16 significant digits refused; an id above 2^53; the 1% day stop
  at both sides), `test/copyh-coins.test.ts`
  (the kept and left-out kinds; a coin outside the list stops; an appended
  list keeps every index), `test/copyh-dirs.test.ts` (each kind; a value
  outside the list stops), `test/copyh-chains.test.ts` (one chain; a chain
  the archive lists out of order; several chains in one matching event; two
  heads with one text; a fill that
  continues nothing; values `toPrecision(12)` would equate and scaled
  integers do not; an event split by a file boundary; a large close in
  hundreds of fills whose float sum leaves a residue, L3),
  `test/copyh-normalize.test.ts` (every field, an own and a counterparty
  liquidation leg, each forced `dir`), `test/copyh-market-trades.test.ts`
  (a backstop's taker and maker legs, an ADL, a Settlement and a "Net Child
  Vaults" record on either side, a market liquidation's legs kept, a trade
  split across two files, the shared `tid` of two trades) and
  `test/copyh-pass.test.ts` (both formats; the switch hour, its duplicate
  counted once and a duplicated market taker stopping the build; a resumed
  pass equal to an unbroken one; a bit flipped in one part caught; rows
  conserved; the holes).

## C4. Events, cycles, entries, delay — R4 unchanged

- The kit's `toEvents`, `toCycles` and `buildEntries(events, −∞, ∞,
  60 000)`, unchanged, on each built account's (C2) normalized fills (C3)
  from ARCHIVE_START to the step's END.
- **An entry** is a group of type OPEN or FLIP (adds are never entries;
  forced events are exits only) whose first fill t lies in the stage judged
  (C1). Its id is the kit's `entryId(addr, g)`, which holds the coin's iid;
  its **delay D** the kit's `delayOf(id)`, D in [62.14 s, 95.44 s) (60 s to
  act, up to 33.3 s of polling, 2.14 s of lags: R4's delay (the research
  R8's 62–95 s), frozen with MAIN; it
  fits a manual follower, HL-FOLLOW-FACTS 2.5, and the supervisor's probe of
  2026-11-25 shows that detection, under a second, is not what limits one);
  its **follow instant** t + D.
- **An account the kit cannot hold** (M4): the kit's `buildEntries` appends
  every reducing event to every group still open on its side, so an account
  that adds and trims for months without going flat grows that work with the
  square of its events. The measure is that work itself, the **exit rows**:
  the number of exits `buildEntries` would append over all its groups,
  counted without building them by `exitRows(events)` (the kit's own loop
  with a count in place of each append; a test holds it equal to the exits
  of every group that `buildEntries(events, −∞, ∞, 60 000)` returns, on
  made-up accounts). An account P1 at some Monday whose exit rows over
  [ARCHIVE_START, END) number more than **EXITS_MAX = 20,000,000** (fixed
  now: about 2 GB of exits at about 100 B each; an account never flat on one
  coin reaches it at about 9,000 to 13,000 order events) is not run through
  `buildEntries`, so it has no habits: it is in no line and in no line's
  removal set (C10), and it is named at each look with its exit rows and its
  OPEN and FLIP order events at the Mondays where it is P1 (its entries'
  upper bound). The count reads the account's fills to END, so an account
  can leave a later look for what it did after its copies; the look names
  each such account (RH1 (b)).
- **A float residue** (L3): the kit zeroes a position within an absolute
  1e-9; a close of a large position in hundreds of fills can leave a larger
  residue, which the kit then reads as a reduce or a flip. The rehearsal
  counts the order events with 1e-9 ≤ |prev + net| < 1e-6 (C15 (c) 6); the
  look prints them.
- To be built in `src/copyh/entries.ts`; pinned by
  `test/copyh-entries.test.ts` (an OPEN, a FLIP, an ADD merged inside 60 s
  and one outside, a forced event as an exit only; the id and its delay
  hold the coin's iid; the count equal to the kit's exits; an account above
  EXITS_MAX left out and named; the residue case of C3's chain test).

## C5. Labels and habits at M — R5, with one bound

- **From the fills before M only** (R5): an order event's fills at or after
  M never change the facts at M.
- **The label** = the kit's `labelAt` at M on the account's kept fills in
  [max(ARCHIVE_START, M − 90 d), M), given as a truncated capture whose
  oldest instant is that start (`truncated` true, `oldest` the start): the
  kit's own case for a capture whose older history is unread. Every account
  is labelled at every Monday of the step's stages; one with no fill in
  [M − 14 d, M) gets the classifier's "no fills in window" at once.
- **Why the bound:** the kit recomputes every event of the capture each
  Monday, which grows with the square of the busiest accounts' histories.
  90 days hold the 14-day window and every cycle shorter than 76 days. Where
  it binds (M3), positions older than the capture are missing from
  `maxPositions` (a book of old positions can turn a "mixed" account
  "directional"), and cycles longer than 76 days leave the closed-cycle
  counts. C15 (c) 7 checks it where it binds, at a pass mark fixed now.
- **pnl is 0, and that changes no P1** (read in `classifier.mjs`; the
  review confirmed it): classifier v1 uses pnl only in its churner rule; any
  account that rule reaches (at least 5 fast trips, a fast share of at least
  0.5) is "unclassified — mixed" by the gray zone's fast-trip rule
  otherwise (at least 3 and 0.25); so "directional" never depends on pnl.
- **P1 at M:** the label is "directional", and M − 14 d ≥ ARCHIVE_START
  (true at every Monday from M₀); the window is covered (C3).
- **The habits** = the kit's `habitsAt({cycles, groups}, M)` on the events
  of the account's kept fills before M (from ARCHIVE_START): the cycles
  closed in the 30 days before M whose start is captured, their median hold,
  and the long share of the entries opened in them. The habit window is
  covered when M − 30 d ≥ ARCHIVE_START (true from M₀). The build may
  compute them once from the account's fills to END when no order event of
  the account straddles M (its fills both before M and at or after it);
  the accounts computed apart are counted (L3).
- To be built in `src/copyh/labels.ts`; pinned by
  `test/copyh-labels.test.ts` (the capture's start and `oldest` on both
  sides of M − 90 d = ARCHIVE_START; a fill at M left out; the habits from
  the fills before M equal to the habits from the whole fills without a
  straddling event, and a straddling event computed apart; an account the
  churner rule reaches, never directional with pnl 0).

## C6. Markets — R6 mapped

- An entry's market is **primary** when, checked in this order:
  1. its coin is in `coins.json` (the main dex);
  2. the coin has no "Settlement" record (a delisting) at or before the end
     of t's UTC day (only records before the step's END are read).

  (The plan's middle condition, a fill of the coin at or before t, holds
  for every entry, by its own fill.)
- **A coin's market objects end with its first "Settlement" record** (C9):
  at the end of the minute that holds it, whose mark is the Settlement
  records' own price, their Σ px·sz ÷ Σ sz: what every holder was paid. A
  copy still open then is closed there (C8). [56 of the 235 coins were
  flagged delisted on 2026-11-25.] (RM4 (a), the owner's ruling.)
- Crypto has no splits, and no close-only state is read: the delisting is
  the "Settlement" record.
- Entries in other markets are counted apart and priced in no line.
- To be built in `src/copyh/markets.ts`; pinned by
  `test/copyh-markets.test.ts` (each condition alone; a settlement later on
  t's UTC day; a copy open at a settlement closed there at the Settlement
  price and flagged `settled`; the object's end).

## C7. The lines (each entry's membership fixed at its Monday M)

| Line | Rule | Decides? |
|---|---|---|
| **MAIN** | P1 at M; the habit window covered; median hold ≥ 6 h; at least 3 closed cycles; a primary market | **yes, the only one** |
| TEN | MAIN with at least 10 closed cycles | no |
| BROAD | P1 at M; a primary market | no |
| DAY | MAIN with median hold ≥ 24 h | no |
| STOP2, STOP5 | MAIN's copies, also closed at STOP's instant (R13), on C9's marks, by `dist/paper/copy.js`'s `stopInstant`, unchanged (RL2) | no |
| DAYS7 | MAIN's copies, also closed at t + D + 7 d (R13), by `dist/paper/copy.js`'s `DAYS7_MS`, unchanged | no |
| JUMP | MAIN's copies split by J > 3 against J ≤ 3 (R13), on C9's marks, by `dist/paper/copy.js`'s `jumpRatio`, unchanged | no |
| DELAY0 | MAIN at D = 0, every leg at the last market price of the minute that holds its instant: the end of the trader's own minute, as FIND-6-EXITS (M7) | no |
| DELAY+5, DELAY+15 | MAIN with every leg at its instant + 5 min and + 15 min, on C9's marks (X3's lines; FABLE-REVIEW point 9) | no |
| LAST | MAIN at D, every leg at the last market price of its minute (M7: MAIN once more on DELAY0's price) | no |
| RANK | MAIN's copies of the top fifth of MAIN's accounts at M, ranked by the mean net of their own priced MAIN copies whose follow instant and every leg lie in [M − 12 w, M), at least 5 of them; the top fifth is the first ⌈n ÷ 5⌉ of the n ranked, by that mean, ties by address, the smaller address first | no |
| SLICES | MAIN in four disjoint account groups, the address's number mod 4 | no |
| SIDES, MONTHS | MAIN's longs and shorts apart; MAIN by the UTC month of t | no |

- **Not in COPY-H** (M7; the plan's section 3): **SPEED** — a minute's
  price cannot tell a follow at 0 s from one at 30 s, the line would need a
  second price source, and a follower faster than a hand is an automatic
  one (Iron Rule 1); if DELAY0 beats MAIN by more than its error, a fast
  line is its own small frozen test on unseen months. FAV (no favourites),
  NOTIONAL (no board), COMP (no competitions), MAKER and VWAP (no book).
- TEN's, BROAD's and DAY's accounts are R7's account-level conditions at M.
  Every line's copy carries its own money and its own d at the line's own D
  and marks. TEN, BROAD and DAY take their own accounts as d's removal set
  (C10); every line made of MAIN's copies (STOP2 to MONTHS above) takes
  MAIN's.
- Only MAIN's line carries a verdict and a sentence; every other line
  prints the same figures (C12's m, SE, m′, SE′) with none, deciding
  nothing.
- To be built in `src/copyh/lines.ts`; pinned by `test/copyh-lines.test.ts`
  (each line's membership on both sides of each threshold; RANK's fifth,
  its five copies and its ties; SLICES' groups disjoint and whole; DELAY0's
  and LAST's legs at the minute's last price; DELAY+5's legs moved).

## C8. The money reading (exits copied) — R8 unchanged

- **The copy's exits:** the kit's `buildEntries` exits of the entry's group,
  through lib-exits' `exitsOf` and `liquidationKeys`.
- **The legs:** `planCopyThrough({t, D}, exits, END)` (`dist/paper/copy.js`;
  R8, F9): each exit, at its first fill + D, closes its share of what is
  still open (a partial liquidation its share; a close, flip or full
  liquidation all of it); adds are not copied; a re-open merged inside the
  60-s window does not re-open. An exit instant at or after END flags the
  copy `crossing`; a part still open after the trader's last exit flags it
  `open`; both are marked at END − 1 ms. An entry whose t + D is at or after
  END has no mark at its follow instant and is unpriced.
- **The price:** lib-exits' `priceCopy(mk, {dir, tIn: t + D, legs,
  setting})` with C9's setting on C9's market object: Σ partᵢ × the kit's
  `leg` from t + D to each exit instant; in bps of the copy's $1,000: net,
  gross, fees, funding and the share-weighted hold.
- **A copy still open at its coin's Settlement** (a change from R11,
  declared: Hyperliquid delists far more markets than Polymarket, and Iron
  Rule 4 wants the price a follower could have had): its legs are planned
  with the coin's end in place of END (`planCopyThrough`'s `end`), so what
  is still open is marked at the end's last millisecond, at the Settlement
  price, with C9's spread and fee as on any leg (the settlement itself cost
  neither: a small charge against the copy). It is flagged `settled`, and
  every look prints MAIN with and without such copies (RM4 (a), the owner's
  ruling).
- To be built in `src/copyh/money.ts`; pinned by `test/copyh-money.test.ts`
  (a copy with partial exits, a full close, a flip, a liquidation's share,
  `crossing` and `open` at END, `settled` at its coin's end; every bps field
  asserted on uneven marks with funding, code-rules).

## C9. The taker setting and the market objects — R9 changed, declared

One price source for every month: the tape (FABLE-REVIEW point 4). The
archive's `l2Book` cadence thinned through 2026, and `asset_ctxs` covers
only part of each day from late September 2026 (external-apis); the fills
are the one complete record.

- **Fee:** **4.5 bps a leg** (0.045%), Hyperliquid's base-tier taker rate
  (its fee page, edited 2026-08-19, read 2026-11-25: HL-FOLLOW-FACTS 1.1;
  WAVE-H's H9 read 0.045% on 2026-11-14), on every leg of every month; never
  a lower tier, a staking or referral discount, or a rebate (the owner's
  ruling 6). A taker round trip is 9.0 bps of fees.
- **Spread c(coin, d)**, the tape's quoted half-spread: half the median,
  over the minutes of UTC day d − 1 that hold a pair, of the minute's mean
  relative gap |p_buy − p_sell| ÷ ((p_buy + p_sell) ÷ 2). A **pair** is two
  consecutive market-trade taker records of the coin (consecutive in
  `time`, ties in the pass's order), of opposite sides, at most 2 s apart,
  counted in the minute of its second record. d is the UTC day of the leg's
  instant. With fewer than 30 such minutes on d − 1, the coin's latest
  earlier day with 30 is used, flagged; with none, **25 bps**, flagged. [s8,
  September 2025: 0.78 bps weighted by MAIN's entries; BTC 0.04, ETH 0.11,
  SOL 0.22; the median coin 1.08, the 90th percentile 3.24.] The build takes
  each file's records in `time` order and joins the files in order. A file
  whose first market-trade taker record of a coin is timed before that
  coin's last one in the file before it stops the build (exit 5): the code
  then cannot give the pairs and the last prices this rule defines, which is
  a defect, fixed by C0's route with a sort across the two files (D8; RH1
  (f)).
- **The setting** given to the kit's `leg` and lib-exits' `priceCopy`:
  `fee(iid, t)` = 0.00045; `spread(iid, t)` = c(coin, d), flagged as its
  `fallback` when it came from an earlier day or the 25 bps.
- **The minute mark:** Σ px·sz ÷ Σ sz over the minute's market-trade taker
  records (C3's bars), the minute's volume-weighted mean. It is centred on
  the follow instant on average, where the paper's mark is the minute's end:
  a fair choice, said here and shown by LAST (M7). A minute without a market
  trade has no mark.
- **The market object** (`markets.ts`): the kit's `marketFrom`, step for
  step, with the step's END in place of the kit's cut (the paper's
  `marketThrough` form, since `marketFrom` refuses an end past 2026-11-07),
  per coin from its first market trade's minute to END or the end of its
  first Settlement's minute, whose mark is the Settlement price (C6; RM4):
  the minute marks, the minute's market-trade count as `trades` and its
  Σ sz as `volume`, and the funding rows below.
  The kit's `markAtMinuteEnd` (5 minutes' staleness at most) and
  `fundingBetween` (nominal hours in (tIn, tOut]) run on it unchanged.
- **The last-price object** (M7): the same, with each minute's last price
  (C3's bars) as its marks; for DELAY0 and LAST only.
- **Funding** (the owner's ruling 5): Hyperliquid's settled hourly rates
  (`fundingHistory`, its public info API) for every coin of `coins.json`,
  the hours [M₀, END_S) (no copy is open before M₀), fetched before the
  freeze by `tools/waveh-fetch.cjs`'s funding mode for COPY-H's coins (part
  0, in sessions with a manifest and a safety stop, at most half of the
  published 1,200 weight a minute: Iron Rule 5, HL-FOLLOW-FACTS 2.4; L6,
  RL13) into COPY-H's funding store (`COPYH_FUNDING`), a window a file, no
  window holding both E's and S's hours. **`copyh/funding.sha256`** is
  written by `tools/copyh-freeze.cjs --data` from the store's own list, each
  line held to the store's manifest: the `meta` reply of C3 and **every
  window of every coin of `coins.json`** (an empty reply is a window read:
  the coin had no settlement in it). **The tool refuses** a list that lacks a
  window, and one whose files the program's own reader does not pass: its
  schema (Zod: `coin` text, `fundingRate` and `premium` decimal text, `time`
  a safe integer), and no coin's nominal hour twice. That check reads the
  rows' shape and times only, S's among them, and uses no rate (RM5; RH1
  (e)). **A row's nominal hour is its `time` rounded to the nearest hour**
  (WAVE-H's H9); a positive rate, longs pay. An hour without a row is
  charged nothing and counted. At a step, a window file that fails the
  reader stops the step (exit 5) before any price; after the tool's check
  only a changed file can.
- **The settlement's mark** [SET BEFORE THE FREEZE: by C16's count on all
  of E (M2)]: if the projected unpriced share there is at most 0.5%, the kit's
  rule unchanged — each settlement at the mark at the end of the minute
  before its hour (`markAtMinuteEnd(mk, hour − 1)`, 5 minutes' staleness);
  if it is above 0.5%, each settlement at the coin's latest minute mark
  among the minute that ends at the hour and the 60 before it (the kit's
  rule with a staleness of 60 minutes in place of 5; where the kit's rule
  finds a mark, this one finds the same; RL3). A settlement with no such
  mark leaves the copy unpriced either way.
- **Thin legs** (M6): a leg instant x is **thin** when the coin's market
  trades in the minute that holds x and the five before it sum to under
  $1,000 of notional (Σ px·sz, C3's bars). A copy with a thin leg, its
  follow instant or an exit leg, is a **thin-tape copy** (C12, C13). [Look 1
  of the exam: depth-short positions averaged +208.6 against −16.4 for the
  rest; the tape gave a median $253 of the $1,000 a leg needed.]
- **What the tape leaves out** (the plan's section 5): depth beyond the
  quoted half-spread at $1,000 (the calibration prints show the walks), and
  a cascade minute's slippage (the staleness rule, the STOP lines and M1's
  cascade print see it).
- To be built in `src/copyh/setting.ts` and `markets.ts`; pinned by
  `test/copyh-setting.test.ts` (pairs at 2 s and at 2 s + 1 ms; a pair
  across a minute's boundary; the 30-minute fallback and the 25 bps; c from
  the day before only) and `test/copyh-markets.test.ts` (the object equal,
  field for field, to the kit's `marketFrom` on a made-up panel that ends
  before the kit's cut, the 5-minute rule (RM6); marks from market trades
  only; the object's end at END and at a settlement, its last mark the
  Settlement price; a row's nominal
  hour at ±30 min; two rows in one hour stop; the settlement mark's two
  rules; a thin leg at $999.99 and at $1,000, with uneven sizes, code-rules).

## C10. The judgement reading, and the edge over the market

- **d** — R10 unchanged: the kit's `dAgainstNull(mk, {dir, t, D, h: 24 h,
  longShare, removed})` × 10⁴ bps on C9's market object: the copy's gross
  over 24 h from t + D less the exact matched null's gross (every market
  trade of t's coin and UTC hour equally likely, from the bars' minute
  counts, one market-trade taker record a trade (M1), followed after the
  same D, long with the long share); cost-neutral.
  - **longShare** = the habits' long share at M (C5).
  - **removed** = the kit's `removalOf` over the fills, in the week of M, of
    every account in the copy's line at M (R7's account-level conditions;
    for a line made of MAIN's copies, MAIN's accounts: C7), **their fills of
    market trades only** (M1; C3), counted as distinct
    trades by (coin, `tid`, `time`) across all those accounts, whichever
    bucket holds them. The week is cut at the step's END: only the entry's
    own UTC hour is read, so the cut changes nothing, and S stays closed at
    step 1. A copy has one d per line it is in.
  - **Voted** by END: ⌊t / 1 h⌋·1 h + 1 h + 95.44 s + 24 h ≤ END.
- **x′, the edge over the market** (H1; the owner's ruling 2): for each copy
  with a d, **x′ = d − (L.gross − L.net) × 10⁴**, L the kit's `leg(mk, {dir,
  tIn: t + D, h: 24 h, setting})` with C9's setting: the copy's own cost over
  the same 24 hours, its fees, spread and funding. So x′ is the copy's net
  over 24 h less the null's gross: its result after costs against what the
  market itself did at the trader's usual lean. In bps; x′ exists exactly
  when d does (the same marks and funding hours).
- To be built in `src/copyh/judge.ts`; pinned by `test/copyh-judge.test.ts`
  (d equal to the kit's on a made-up market; the removal of market trades
  only, a trade between two of the line's accounts in two buckets counted
  once, a backstop's leg not removed; the week's cut at END; x′ = d − the
  cost on uneven marks with funding; x′ null exactly when d is).

## C11. Unpriced, missing, gap — R11 unchanged

- A copy whose leg finds no mark within 5 minutes before an instant, or a
  funding settlement without a mark (C9's settlement mark), is
  **unpriced**, counted by reason (lib-exits' `unpricedReason`: "no mark at
  the follow instant", "no mark at an exit instant", "a funding settlement
  without a mark"), and left out of every mean; never guessed. A copy open
  at its coin's Settlement is priced there (C8), flagged and counted (RM4).
- A funding hour without a row is charged nothing and counted.
- d, and with it x′, is null by reason when the entry is unpriced, a null
  minute is unpriced, the hour has no market trade left after the removal,
  or the long share is null.
- **A gap copy:** a chain break (lib-exits' `chainBreaks` and
  `crossesBreak`) on its coin after the entry's first event and up to its
  last exit used (to END while open), or a hole (C3) in [t, that instant];
  flagged, printed with and without. R11's third case, "that instant after
  the account's P", does not arise: the archive is read to END.
- To be built in `src/copyh/unpriced.ts`; pinned by
  `test/copyh-unpriced.test.ts` (each reason; a gap copy by a break and by a
  hole; a hole after the copy's last exit making none).

## C12. The statistic and the verdict (MAIN only)

- **The set of look k:** MAIN's copies voted by END_k (C10); both readings
  on this one set, their money with exits up to END_k.
- **The money:** x = a copy's net in bps, each copy alike; **m** its mean
  over the set's priced copies; **SE** = R12's two-way error,
  √max(V_trader + V_day − V_iid, V_trader, V_day), with V_trader and V_day
  the kit's CR1 variances of the mean (`cr1Test`) clustered by address and
  by the UTC day of t + D, and V_iid = s² ÷ n (s² with n − 1): the paper's
  `twoWay`.
- **The edge over the market** (H1): x′ (C10) over the set's copies with a
  d; **m′** its mean; **SE′** the larger of R12's two-way error computed
  with the UTC day of t + D as its time cluster and the same computed with
  the UTC week of t + D.
- **z:** look 1 **2.81**, look 2 **2.43**: the paper's own L1 and L2 bars
  (two-sided 0.5% and 1.5%, 2% in all; KEEP, one-sided, spends half).
- **The readings, in this order; the first that holds is the look's:**
  1. **WITHHELD** when more than **2%** of the set is unpriced.
  2. **TOO FEW TO TELL** when SE or SE′ cannot be computed (fewer than two
     traders, two days or two weeks).
  3. **DROP** when m + z·SE < **+10 bps** **and** m′ + z·SE′ < **+10 bps**
     (δ, the paper's, on base-tier costs: the owner's ruling 6).
  4. **KEEP** when m − z·SE > 0 **and** m′ − z·SE′ > 0 (in place of R12's
     "the mean d > 0"), **and** the three sign conditions hold: the mean of
     the traders' own means of x > 0; the mean of the UTC days' own means
     of x (the day of t + D) > 0 (FABLE-REVIEW M2 and point 6); the mean of
     x over the copies that are not thin-tape copies (C9) > 0 (M6).
  5. **TOO FEW TO TELL** otherwise, with the sentence of its case.

  When DROP and KEEP would both hold, DROP (the paper's Q-G; the order
  gives it). A set with no copy is TOO FEW TO TELL (no error). A mean over
  no copy is not above 0 (RL8).
- **The sentences, written in advance** (X, Y and P filled from the result,
  X and Y in bps a copy):
  - WITHHELD: "Withheld: P% of MAIN's copies were unpriced, above the 2%
    limit; the data could not answer."
  - TOO FEW, no error: "Too few to tell: no error could be computed."
  - DROP: "Drop: m + z·SE = X bps a copy on the money and m′ + z·SE′ = Y on
    the edge over the market, both below the +10 bps line."
  - KEEP: "Keep: m − z·SE = X bps a copy on the money and m′ − z·SE′ = Y on
    the edge over the market, both above 0; the traders' own means, the
    days' own means and the copies without thin legs are above 0 too."
  - TOO FEW TO TELL when the readings disagree (H1, 4.), every case that
    applies, in this order (RL8):
    - (a) the money's upper bound is below +10 and the edge's is not: "Too
      few to tell: the money's upper bound, X bps a copy, is below the +10
      bps line, but the edge over the market's, Y, is not."
    - (b) the reverse: "Too few to tell: the edge over the market's upper
      bound, Y bps a copy, is below the +10 bps line, but the money's, X, is
      not."
    - (c) the money's lower bound is above 0 and the edge's is not: "Too few
      to tell: the money's lower bound, X bps a copy, is above 0, but the
      edge over the market's, Y, is not; the market's direction may carry
      the money."
    - (d) the reverse: "Too few to tell: the edge over the market's lower
      bound, Y bps a copy, is above 0, but the money's, X, is not."
    - (e) both lower bounds above 0 and a sign condition failing, the first
      in the order above: "Too few to tell: both lower bounds are above 0,
      but <the mean of the traders' own means | the mean of the days' own
      means | the mean without the thin-tape copies> is not."
  - TOO FEW TO TELL when no bound is reached: "Too few to tell: no mean
    result as large as X bps a copy was seen.", X the larger of m + z·SE and
    m′ + z·SE′: the largest mean not ruled out (R12's sentence; the plan's
    section 1; RL8).
  - Every reading then prints R12's line: "Keep and drop are verdicts on
    this test, never instructions to trade."
- **The first KEEP or DROP is COPY-H's verdict on MAIN;** a later look
  prints its figures marked "after the verdict" and changes nothing.
  WITHHELD and TOO FEW TO TELL at look 1 leave the verdict to look 2. Step 2
  runs whatever look 1 says (C14). **A KEEP is confirmed once, on FRESH-2
  alone (C14), before anything is built on it.**
- **What the money's SE is** (H1 fix 8): the error the test prints for the
  money; the money's real spread is larger (about 2 to 4 times in the cases
  that fit the planner's counts: the review's section 6; C15 (c) 4 measures
  the holds it rests on). The bar is carried by the pair, the edge over the
  market's SE′ taking the week as a cluster.
- To be built in `src/copyh/verdict.ts` (with `dist/paper/stats.js`'s
  `twoWay` and the kit's `cr1Test`); pinned by `test/copyh-verdict.test.ts`
  (each reading and each sentence's case on both sides of its bound with a
  margin, code-rules POLISH-RULES; DROP over KEEP; SE′ the larger of the
  day's and the week's; X the larger upper bound; "after the verdict").

## C13. The prints (every line; MAIN's decide)

In each look's `report.json`, written after `result.json`, deciding
nothing:

- **R14's list where it applies:** copies, traders, days; unpriced by reason
  and their share; open, crossing and gap copies; the money's mean with its
  two-way SE and both one-way lower bounds (m − z·SE_trader, m − z·SE_day);
  beside, the band with Student's t at the same level on the day clusters
  (df = days − 1); d's mean with its two-way SE and d's null reasons; the
  gross before costs with its lower bound m_gross − z·SE_gross;
  `breakEvenRoundTrip` (the copies would have paid at any round trip of
  costs below it; the owner's ruling 6); fees and funding; the win share and
  the average win against the average loss, labelled "exits can flatter
  these; only money measures"; the hold (median, quartiles); the worst UTC
  day and the worst trader (lowest sums); the paper equity's largest fall at
  $1,000 a copy, the copies in the order of their follow instants; the mean
  without the most influential account, then also without the most
  influential day; the closed copies only; the long share; the pooled daily
  e-value (R14; `dist/paper/stats.js`'s `dailyEValue`: one vote a UTC day
  of t + D, the sign of the day's mean d, a day within ±0.1 bps a tie,
  dropped; RL2); copies a week; at look 1, the smallest edge visible at look
  2, (2.43 + 0.8416) × SE × √((END_E − M₀) ÷ (END_S − M₀)), and the same
  with SE′ (RL9).
- **The venues, as arithmetic:** Hyperliquid's base-tier 9.0 bps of fees a
  round trip, and Binance futures' regular taker 5 bps a side (10.0 a round
  trip; HL-FOLLOW-FACTS 0 and 5.1), each with COPY-H's spread and funding.
- **H1's prints** (fix 6): the null's mean gross (what the market gave at
  the traders' lean); d; x′ with SE′ by day and by week; the money's two-way
  error with the UTC week, and with the calendar month, as its time cluster.
- **Concentration, printed with the verdict:** the two best days' share of
  the sum, and the mean without them; the top 1% of traders' share of the
  sum (by their sums), and the mean without the top 10 traders; the event
  level: each (coin, side, UTC hour of t) counted once, at its copies' mean;
  the most copies of one trader.
- **By part, each with n, m ± SE and m′ ± SE′:** longs and shorts apart
  (SIDES; a side's m′ carries the market's direction and is no edge: RM3);
  by UTC month (MONTHS); by slice (SLICES); the long share.
- **The `settled` copies** (C8; RM4): their count, and MAIN with and
  without them.
- **The thin tape** (M6): the thin-tape copies' count and share, and MAIN's
  mean with and without them.
- **The market trades** (M1): the left-out taker records by cause and
  month; and **the cascade print**: MAIN with each leg's c taken from the
  leg's own minute where that minute holds a pair, from the day before
  otherwise.
- **The tripwire's counts** (C16); the vault accounts left out (C2); the
  accounts above EXITS_MAX, their exit rows and their entries (C4); C4's
  float residues;
  C3's counts by kind; the holes; run times and memory peaks.
- **MAIN on S alone** (L8), at step 2: S's voted copies alone, every figure
  above; the first reading on months MAIN's look 1 did not hold.
- **The calibration prints** (the plan's section 5), computed before the
  freeze on outcome-free cells of E's months into `copyh/calibration.json`,
  copied into each look's report and held to its SHA-256 (RL7): the tape's
  minute mark against `asset_ctxs`' `mark_px` and its impact prices in the
  same minute; and the tape's c against the book's half-spread and its
  $1,000 walk, where the archive's books are dense, on the book files in
  WAVE-H's store, only if WAVE-H's frozen book reader serves it unchanged
  (imported, never changed; otherwise this print is left out: the review's
  S3, the supervisor's ruling Q10). Two prices of one moment only, never a
  price change across time.
- **FRESH-2's prints** follow C14's L9 rule.
- To be built in `src/copyh/prints.ts`; pinned by `test/copyh-prints.test.ts`
  (each print's numbers on a made-up world; no verdict word for any line but
  MAIN; the calibration copied and held to its hash).

## C14. The owner's rounds, and FRESH-2

- **The rounds run whatever look 1 says** (H2 (a), the owner's ruling 3):
  "The rounds run whatever look 1 says. A DROP closes copying MAIN's way.
  The rounds' at most two tries are the only variants ever judged, once on S
  and once on FRESH-2; nothing else is built or polished on these months."
  Their most likely end is no confirmed try (the review: even a real +15 bps
  filter passes both later stages 28% of the time in the plan's "high" case,
  an upper end).
- **Explore**, after look 1's report is recorded, on E's priced copies only
  (step 1's `positions.jsonl.gz`, held to the SHA-256 its `result.json`
  names); the seal keeps S closed. Each round writes
  `<COPYH_ROOT>\rounds\round-<n>.json`.
  - At most **3 rounds**, of at most **8, 6 and 4 tries** (18 in all). Each
    round declares its tries in `copyh/tries.json` and is committed before
    it runs. **A try is data, never code:** its line (MAIN or BROAD), its
    conditions, all of which must hold, and why, in words. A condition is a
    covariate's name, one of ≥, >, ≤, <, = and "one of", and a constant or a
    list of constants. The frozen program reads them (`dist\copyh.js tries
    --round <n>`): it refuses an uncommitted `tries.json`, a round before the
    one ahead of it has been written, a fourth round and a try over the
    caps. No code is added after the freeze: the rounds run under the gate
    of the list in force, which then allows, beside its list, only
    `copyh/tries.json`; and the rounds' freeze adds only `copyh/tries.json`,
    `copyh/choice.json` and `copyh/look1.sha256` (the review's S1; the
    supervisor's ruling Q4).
  - **A try is a filter over MAIN's or BROAD's priced copies of E, and its
    conditions name only these covariates** (step 1 writes them for every
    MAIN and BROAD copy): the line; the trader's habits at M (closed cycles;
    median hold, the trader's usual hold at M, never the copy's own; long
    share; entries); the coin; the entry's size (its first event's
    notional); the trader's own MAIN copies whose follow instant and every
    leg lie before M: their count and their mean net (RL6). Every covariate
    is known at the entry's instant (M5). A condition on a covariate the
    copy lacks is false. **Never a new price, never a month of S, and never
    a liquidation, a cascade or a price move before the entry: that family
    was printed on FRESH's months** (M5; look 1's report), so no such
    covariate is given. **Nor the side:** a filter by side is not neutral on
    the edge over the market (x′'s null leans with the trader's long share,
    so a long of a trader whose long share is 0.66 carries 0.68 of the
    market's move and a short −1.32), and S's direction is public. SIDES
    prints the two sides, deciding nothing (RM3 (a), the owner's ruling).
  - **Each try prints, on E:** n, traders, days and weeks; m ± SE and
    m′ ± SE′ (C12's forms); m − 2.99·SE and m′ − 2.99·SE′; the choice's
    conditions. Explore spends nothing and decides nothing.
- **The choice**, fixed now (`dist\copyh.js choice`, written by the program
  from the rounds' outputs alone into `<COPYH_ROOT>\rounds\choice.json`): a
  try qualifies when, on E:
  - **m − 2.99·SE > 0 and m′ − 2.99·SE′ > 0** (H1's pair, in place of "its
    mean d > 0"; z = 2.99, the one-sided Bonferroni bar 2.5% ÷ 18, for every
    try whatever the number run: M5);
  - the mean of its traders' own means of x > 0, and its mean of x without
    its two best days (the two UTC days of t + D with the largest sums of x)
    > 0 (RL8);
  - it has at least 100 traders and 100 UTC days (of t + D).

  At most **two** qualifying tries go on, those with the highest
  m − 2.99·SE (ties: the earlier round, then the earlier try in
  `tries.json`); none if none qualifies.
- **The rounds' freeze** (`tools/copyh-freeze.cjs --rounds`, after the last
  round, or at once, with no try, when no round runs; RM2): its list may
  differ from the list before it only by adding `copyh/tries.json`,
  `copyh/choice.json` (held to the program's file) and `copyh/look1.sha256`
  (step 1's `result.json`, `positions.jsonl.gz` and `report.json`); it holds
  no compiled file of its own; the tool refuses any other difference, a file
  of the list before it changed, added elsewhere or gone.
- **The confirmation, once, on S alone, at step 2** (Holm with m = 2
  always: M5): each chosen try on its line's copies with t in S, voted by
  END_S. Its statistic on S is **s = min(m ÷ SE, m′ ÷ SE′)** (C12's forms
  on that set); a try with no copy there, or whose SE or SE′ cannot be
  computed, has no s. The try with the larger s is the first (a try with no
  s is the second; equal s: the choice's order). The first is tested at
  **z = 2.24** (2.5% ÷ 2, one-sided); the second at **1.96**, and only if the
  first's s exceeded 2.24, whatever the first's other conditions say
  (Holm's step-down is on s alone); a lone chosen try is tested at 2.24.
  **A try's reading on S, the first that holds** (RM1):
  1. **WITHHELD** when more than 2% of its set is unpriced: "Withheld on S:
     P% of the copies were unpriced, above the 2% limit."
  2. **NOT CONFIRMED** when it has no s: "Not confirmed on S: no error could
     be computed."
  3. **NOT CONFIRMED** when it was not tested: "Not confirmed on S: not
     tested, since the first try's bounds at 2.24 were not both above 0."
  4. **CONFIRMED** when its s exceeds its bar z and C12's three sign
     conditions hold on S: "Confirmed on S at z: m − z·SE = X bps a copy and
     m′ − z·SE′ = Y, both above 0; the traders' own means, the days' own
     means and the copies without thin legs are above 0 too."
  5. **NOT CONFIRMED** otherwise: "Not confirmed on S at z: m − z·SE = X bps
     a copy and m′ − z·SE′ = Y; a confirmation needs both above 0 and the
     three conditions."

  Each with R12's line. A try that is not CONFIRMED is closed for good and
  never retried on these months.
- **The sealed judgment, once, on FRESH-2 alone:** each confirmed try at
  one-sided 2.5% (**z = 1.96**), and a MAIN KEEP at 5% (**z = 1.645**), each
  on its copies with t in FRESH-2, voted by END_F2. **The reading, the first
  that holds:** **WITHHELD** when more than 2% of the set is unpriced; **NOT
  CONFIRMED** when the set is empty or SE or SE′ cannot be computed ("Not
  confirmed on FRESH-2: no error could be computed."); **CONFIRMED** when
  m − z·SE > 0, m′ − z·SE′ > 0 and C12's three sign conditions hold; **NOT
  CONFIRMED** otherwise. A reading that is not CONFIRMED is no yes, and is
  not judged again (RM1). The sentences:
  - "Confirmed on FRESH-2: m − z·SE = X bps a copy and m′ − z·SE′ = Y, both
    above 0; the traders' own means, the days' own means and the copies
    without thin legs are above 0 too."
  - "Not confirmed on FRESH-2: m − z·SE = X bps a copy and m′ − z·SE′ = Y;
    a yes needs both above 0 and the three conditions."
  - "Withheld on FRESH-2: P% of the copies were unpriced, above the 2%
    limit."

  Each with R12's line. Only a confirmed KEEP, or a confirmed try, is a yes.
- **The error budget:** explore spends nothing and decides nothing. The
  confirmation's 2.5% and the seal's 2.5% are each spent once, on both
  readings, so a useless try reaches a final yes at most about 0.06% of the
  time (2.5% × 2.5%), whatever was explored. MAIN's own budget is C12's,
  untouched by the rounds.
- **FRESH-2's stage** (C1; L1, the owner's ruling 7): [2026-11-16,
  2027-05-17), 26 weeks, fixed now. It runs only if a yes needs confirming:
  MAIN's verdict is KEEP, or a try was confirmed on S. Otherwise COPY-H ends
  at step 2's report, and FRESH-2 is never read by it. Its terms, fixed now
  (as the exam's P1 fixed look 2's):
  1. **When:** after step 2's report is recorded in decisions, and after the
     archive's upload of 2027-05-16's last hours (a day is settled after its
     D+2 upload, at about 09:20–09:30Z: external-apis), so from about
     2027-05-18 10:00Z; the fetch's manifest must hold the exact key set. If
     the archive still lacks an hour of the range on 2027-05-25, the stage
     runs on the keys the manifest holds: the freeze's decisions entry lists
     the missing hours, and each is a hole (C3) (RH1 (g)).
  2. **The data:** the fill files `node_fills_by_block/hourly/` of the hours
     [2026-11-16 00h, 2027-05-17 00h) (182 days, 4,368 files), downloaded by
     `tools/waveh-fetch.cjs` under its guards and listed in
     `copyh/fresh2.sha256` from its manifest (names, bytes and SHA-256; the
     exact key set, each once); every coin's funding rows for the hours
     [END_S, END_F2), fetched as in part 0 and listed in
     `copyh/funding2.sha256` the same way: every window of every coin, and
     the reader's check before FRESH-2's freeze (RM5); and a new stored
     `meta` reply, whose coins beyond `coins.json` are appended (every
     existing line unchanged). Both reads are network reads under Iron Rule
     1, with the owner's yes when the stage is needed.
  3. **FRESH-2's freeze** (`tools/copyh-freeze.cjs --fresh2`; RM2): its list
     may differ from the list before it only by adding `copyh/fresh2.sha256`,
     `copyh/funding2.sha256` and `copyh/look2.sha256` (step 2's three
     files), and by lines appended to `coins.json`; the tool refuses any
     other difference. The stage's program is the one frozen in the first
     list: the synthetic world runs through it (C15 (b)).
  4. **The run** (`dist\copyh.js fresh2`; the gate at FRESH-2's freeze; the
     settings of step 2 and `FRESH2_STORE`, read only), as step 2's: a second
     run refuses (exit 5); FRESH-2's pass twice and held equal (exit 7); its
     integrity; E's and S's stores held to the SHA-256s that steps 1 and 2
     named (exit 5 otherwise); the engine on E ∪ S ∪ FRESH-2 at END_F2 — C4's
     events and C5's habits from ARCHIVE_START, C2's vault accounts and C4's
     accounts the kit cannot hold counted to END_F2 — every part twice; the
     labels at FRESH-2's Mondays, each from the fills before its M; the
     tripwire on each judged set (C16); then `fresh2\result.json` first,
     `positions.jsonl.gz`, `report.json` (RM7).
  5. **What it prints** (L9; decisions 2026-11-25, "the crash side only",
     ruling 6: FRESH-2 is also that frozen page's months): no move of a
     crash hour — no cascade print, and no print of a market's own move
     beside the copies' figures (not C13's null mean gross); only the judged
     copies' figures and their prints, the day and month prints named as
     what they are, "COPY-H's copies by UTC day" and "COPY-H's copies by
     UTC month".
- To be built in `src/copyh/rounds.ts`, `choice.ts`, `confirm.ts` and
  `fresh2.ts`; pinned by `test/copyh-rounds.test.ts` (a round refused before
  its commit, out of order, past three, or past its cap; a try read from
  `tries.json`, its conditions on the covariates only, a condition on any
  other name (the side among them) refused, one on a covariate the copy
  lacks false; the choice's every condition on both sides; at most two
  chosen, by m − 2.99·SE, with its ties), `test/copyh-confirm.test.ts`
  (Holm's order by s, a try with no s second, equal s, the second not
  tested, WITHHELD before the bounds, a lone try at 2.24, the sign
  conditions; each reading and sentence) and `test/copyh-fresh2.test.ts`
  (each reading and sentence; nothing of FRESH-2 read before FRESH-2's
  freeze; the freeze tools' refusals of any other difference; no
  crash-hour print).

## C15. The steps, the record, and what runs before the freeze

- **The program:** `node dist\copyh.js <command>`, by hand, from the
  repository's build (or its tag's build, C0), one command at a time, at
  idle priority (the program sets it), with the worker heap of `design.ts`
  [SET BEFORE THE FREEZE: twice the rehearsal's largest measured peak,
  rounded up to a whole GB, the owner's rule; above 20 GB, the parts are cut
  smaller instead; OPEN Q2] and no heap flag. No part is started in
  02:30–06:00Z or 10:25–11:15Z. **No build, test or other heavy run on the
  machine during a step** (decisions 2026-11-20). Settings, no defaults:
  `COPYH_ROOT` (COPY-H's own folder: its stores, parts and outputs),
  `WAVEH_STORE` (read only), `COPYH_FUNDING` (read only, the funding store,
  C9), for step 2 `FRESH_STORE` (read only), and for the reproduction
  `PAPER_SEED` (the paper's seed folder) and the kit's panel (read only).
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
    a holdout account) is converted, record for record, to Hyperliquid's
    record shape: each order event's fills given per-fill `startPosition`
    chains from its `previous_size`; side, taker, liquidation, ADL and
    settlement in their Hyperliquid fields; the instrument's own id as iid,
    so that ids and delays equal the paper's. It is then run through COPY-H's
    mapping (C3's chain heads and normalization, C4, and C5 but for its
    90-day bound: the label reads R5's whole capture here, since the seed's
    history before its late Mondays can exceed 90 days, and the bound is
    (c) 7's to check) and the kit, on the kit's own panel and taker
    setting. It must give the paper's own reproduction's known answers
    (decisions 2026-11-12, PAPER-BUILD's technical calls):
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
        computes the same copies, compares its hash to the last rehearsal's
        and prints whether they are equal, deciding nothing (a difference is
        explained in the look's report by the commits between the two);
    11. the calibration prints (C13), on outcome-free cells.

    Every count and print of the rehearsal is a count of instants, sizes,
    labels and memberships, or two prices of one moment (11): no price
    change after an instant is printed, and none is computed but 10.'s, in
    memory, whose one output is its hash. **The rehearsal's store is
    sealed:** no reader but the
    rehearsal's opens it, and it is moved aside or deleted (the
    supervisor's call) before step 1, which builds its own two.
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
  3. **step 1 recomputed** from E's store (its manifest, `builds.json` and
     `integrity.json` held to the SHA-256s step 1's `result.json` names,
     else exit 5) by this program, and held to `look1.sha256`'s positions
     hash (exit 6);
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
  1. the follow instants and every leg's instant (an open or crossing
     copy's END − 1 ms among them) whose coin has no market trade in the 6
     minutes up to the instant's minute end (the minute that holds the
     instant and the 5 before it: the kit's staleness);
  2. **each funding hour inside a copy's hold whose coin has no market
     trade in the 6 minutes before the hour** (M2: the kit's third reason
     for "unpriced", a funding settlement without a mark): each settlement
     row whose nominal hour lies in (t + D, the copy's last leg instant];
     under C9's 60-minute rule, if it is set, the 60 minutes before the
     hour;
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

## C17. What never changes — R16

After the freeze no number, line, population, threshold, instant or rule of
this file changes; a new idea is a new frozen test, never a change here.
Every `[SET BEFORE THE FREEZE]` value is set before the freeze, in this file
and in `design.ts`, from the rehearsal's recorded counts, and every
`[OPEN Qn]` is ruled before the freeze, so that the frozen file holds no
open marker. A step runs once (a second run is refused); it runs only when
the earlier step's files are present and held to their hashes. The rounds,
freeze 2 and freeze 3 change only what C14 names; a defect goes by C0's
route. **A run that crashes before its result exists is not a look.**

## C18. The numbers

`src/copyh/design.ts` holds each number below; a test reads this table and
holds it to the code (`test/copyh-rules.test.ts`). The kit's own constants
(its 14 and 30 days, its 5 minutes' staleness, R8's delay) stay the kit's.

| Name | Value |
|---|---|
| ARCHIVE_START | 2025-05-25T14:00:00.000Z |
| M0 | 2025-06-30T00:00:00.000Z |
| END_E | 2026-05-29T02:00:00.000Z |
| END_S | 2026-11-16T00:00:00.000Z |
| END_F2 | 2027-05-17T00:00:00.000Z |
| funding from | 2025-05-25T00:00:00.000Z |
| record failure limit | 0.01 10 |
| buckets | 256 |
| hole seconds | 60 |
| merge ms | 60000 |
| EVENTS_MAX | [SET BEFORE THE FREEZE] |
| label capture days | 90 |
| main hold hours, closed cycles | 6 3 |
| ten closed cycles | 10 |
| day hold hours | 24 |
| stops | 0.02 0.05 |
| days7 days | 7 |
| jump | 3 |
| delay lines minutes | 0 5 15 |
| rank weeks, min copies, share | 12 5 0.2 |
| slices | 4 |
| fee a leg | 0.00045 |
| pair max ms | 2000 |
| spread min minutes | 30 |
| spread fallback | 0.0025 |
| settlement mark minutes | [SET BEFORE THE FREEZE: 5 or 60] |
| settlement mark switch | 0.005 |
| thin leg notional, minutes | 1000 6 |
| d horizon hours | 24 |
| withheld share | 0.02 |
| delta bps | 10 |
| z looks | 2.81 2.43 |
| smallest edge | 2.43 0.8416212335729143 504 |
| rounds | 3 |
| tries a round | 8 6 4 |
| z choice | 2.99 |
| choice min traders, days | 100 100 |
| chosen at most | 2 |
| z confirm | 2.24 1.96 |
| z seal try, main | 1.96 1.645 |
| FRESH-2 fill files | 4368 |
| tripwire minutes | 6 |
| tripwire stop | 0.01 |
| part minutes | 15 |
| closed windows | 02:30-06:00Z 10:25-11:15Z |
| worker heap | [SET BEFORE THE FREEZE] |
| rehearsal window | 2025-06-30T00:00:00.000Z 2025-07-14T00:00:00.000Z |
| label check Mondays | 2025-12-01 2026-02-02 2026-04-06 2026-05-25 |
| label check slice | 32 0 |
| label check pass mark | 0.01 |
| reproduction | 1700 1366 1104 26 1137 157 525 61 |
| reproduction tolerance bps | 1e-9 |
| sample days, E | 2025-07-27 2025-10-10 2026-03-15 |
| sample days, S | 2026-06-15 2026-10-15 |
