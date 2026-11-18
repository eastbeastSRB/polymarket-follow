# EXTRACT-REVIEW — the Final review of the polishing's extraction, before its run on the 10 months

EXTRACT-REVIEW (Sonnet 5.5, max, a different model from the builders' Opus), 2026-11-18, for
polymarket-follow's supervisor (UTC; every stamp from `date -u`; worked 01:44Z to 06:09Z). Under review:
EXTRACT-BUILD's and EXTRACT-BUILD-2's commits `b40a3a4` … `36901d0` (`git log --format='%h %s' | grep -E
"\(EXTRACT-BUILD(-2)?\)"`; HEAD `e62e9cd` adds docs only), that is `apps/poller/src/polish.ts` and
`src/polish/` (20 files, 4,731 lines) and the tests `test/polish-*.test.ts` with `polish-world.ts` (7 files, 3,116
lines). Line numbers are at `e62e9cd`. **A review decides nothing.** My model is `wave-h-code-review-2026-11-16.md`.
Evidence: the supervisor folder `workers/EXTRACT-REVIEW/` (`progress.md`, and `evidence/`: the scripts, the probes, the
break lists with their results and the demonstrations' outputs).

**The limits held.** I never opened FRESH (`F:\polymarket-follow-research\FRESH\`), the collector's recordings or
database, the run folder, or the paper experiment's or MARKET-1's data, and wrote nothing under `F:\`. I ran
`dist/polish.js` only on synthetic folders in my scratchpad (`explore`, and an `extract --day` that waited in the
02:30–06:00Z window until I stopped it), the build's functions in-process on synthetic stores, and `dist/waveh.js` and the fetch tool not at all; never
a real path. No network call, no deploy, no Task Scheduler, no agent started; polymarket-lab
untouched. Builds and breaks ran in scratch copies (`git archive` of HEAD; `node_modules` a real folder of per-package
junctions; tsc and vitest run directly, never pnpm there; nothing deleted recursively). The only pnpm run was
`pnpm verify` in the repository, whose `dist` is git-ignored. The one run on real data: 06:00:46Z to 06:04:51Z, at
idle priority, after the 02:30–06:00Z window (the section "The independent check on real data"). The repository
changed by this file alone.

## For the owner, in one page

*Words.* The **store** is the analyzer's copy of WAVE-H's ten months, cut into tables: the tape of takers, the
liquidations, a minute table and funding. A **gate** reproduces numbers that two independent programs already agree
on; the store is trusted only when G0 to G6 all pass. The **seal** keeps FRESH's months shut. A **deliberate break**
is a one-line change I make in a scratch copy and then run the tests; a break no test notices is a **survivor**.
**Conservation** means rows in equal rows out plus the duplicates dropped.

**Verdict: after these fixes.** It is not a rework. The code is plain, strictly typed (no `any`, no suppressed warning,
no TODO), parses every outside file at the door, makes no network call and writes only under its own folder; its
tests assert exact values. `pnpm verify` is green on `e62e9cd` in my own run (64 files + 1 skipped, 584 tests + 5
skipped); the three freezes still verify (61, 64, 74). Of EXTRACT-BUILD-2's 70 breaks I re-ran 19 on HEAD: all 19 are
killed by the tests it named. On a synthetic range across a month's end, with a replayed block, records at the
month's last and first millisecond and ids above 2^53, the store equals my own naive parse of the raw files in every
tape row, every bar, every liquidation column and every context cell (0 differences; the same script finds all 7
silent changes I made in a copy of the store). On the one real day I could compare, 2025-10-10, the crash day (24
files, 19.1 M records, 6.4 M takers, 789 K liquidations, a 14 MB line), the one-day store equals my own parse of the raw
files in every row and every cell: 0 differences.

*How I rate it, in your terms.* **Implementation:** good; the pass, the merge and the store are simple and do what the
plan says. **Alignment with the structure:** good; a fifth entry point beside WAVE-H with the same tools, sharing nothing
with the frozen programs at run time but what it imports; the one shape I would change before the next phase is
`gates.ts`. **Code quality:** good; small modules, pure where a test must pin it, no dead function, no fallback nothing
needs. **Unused code and slop:** 19 exports nobody uses, time constants repeated in six files and three counters nobody reads; no AI
filler, and a few comments that only restate their line. **Tests:** exact on values, thin on refusals (M4).

What is wrong is small and sits in what "every gate passes" proves. Today it proves that the store reproduces WAVE-H's
counts, positions and prices, and that twelve sample days match a second parse. It does not yet prove that no row was
lost or refused on the other days, and it never looks at several columns the explorer will use.

**What must change first** (details below):
1. **No gate or log line reads the scan's own counters, and nothing checks that rows in equal rows out (M1).** A
   record a writer refuses is counted but not stored. I showed it in a scratch copy: two refused records on a day no
   gate samples, and all seven gates pass. The fix is about 30 lines and needs no new reading of data.
2. **Columns and tables no gate reads on real data (M2):** most of the liquidation table's fields, the minute bars of
   the 38 coins, `last`/`high`/`low` and the liquidation bars of all 40; and twelve sample days that hold no month
   boundary, no first day and no DATA END hour.
3. **A store made by other code, and a hand-made gates file, are trusted (M3):** G0 prints the two code fingerprints
   but does not compare them.
4. **The tests pin what the code computes, not what it refuses (M4):** of 32 breaks that delete a refusal or weaken
   an inner check of G0, G2, the merge or the seal, 30 pass every test (10 of them backed by another layer); the 10 that
   change a computed value are all killed.
5. **Pins and small fixes (L1 to L12):** G3's tolerance is 10^7 times looser than the plan's; the window pacing and
   five of six seal call sites have no test; the heap text says 4 GB a worker and it is 16; the minute row mixes two
   clocks and POLISH-EXPLORE should be told; `gates.ts` should be split before POLISH-EXPLORE imports from it.

**What I could not check.** The first run on the ten months: no gate has ever run on real data, so what they show
(G5's pairing across 8,845 files, G6 on the 2.1 GB hour, the merge's real peak) is the supervisor's run. FRESH
(sealed). The collector's side. `gates.json` does not exist yet (section "After the full run").

## Findings

Severity as I judge it (the brief fixes none). "Break" ids `R1`… are mine, in `evidence/breaks/`.

### High

None.

### Medium

**M1 — No gate or log line reads the scan's own counters, and nothing checks that rows in equal rows out.**
`scan.ts:381` counts a record a writer could not store (`refused`); `writers.ts:111-112` refuses a `tid` above 2^64 and
`:218-228` a liquidation whose `closedPnl`, `oid` or `dir` is missing or whose `liquidatedUser` is not an address;
`scan.ts:319` counts `misread` (a record whose parse disagrees with its text's reading), and `slowLines` and
`slowRecords` count the slow path. All are in `files.jsonl` and in no gate, no log line and no `pass done` print. A
refused record is in `records` and in `pairs`, so G1 and G5 pass. `merge.ts:286-293, 391-393, 459-462` count
in, out and duplicates and `:588-589` write each part's `takerRows` and `liqRows`, but G0 (`gates.ts:170-242`) and G5
(`:605-654`) never compare them with anything. A row lost on a day G6 does not sample is invisible.
*Shown* (`refused-demo.txt`, a scratch copy of the gates' world with one file added on 2025-07-05, a day no gate
samples): a SOL taker with a 20-digit `tid` and an ETH liquidation without `dir` give `G0..G6` all true,
`passed: true`, `files.jsonl` says `refused: 2` for that file, and the SOL row and the ETH row are not in the store.
For FRESH's months a change in the archive's shape would show first in these counters.
**Fix:** G0 gains, from the manifest and `files.jsonl` alone and with no reading of data: the sums of `refused` and of
`misread` are 0 (the sums of `slowLines` and `slowRecords` are printed); and conservation: the sum of `takerRows`
equals `merge.tape.in + merge.bars.in`; in equals out plus duplicates for tape, bars and liq; the sum of the tape
partitions' rows equals `merge.tape.out`; the sum of the liq partitions' rows equals
`merge.liq.out`; the sum of `liqRows` equals `merge.liq.in`. The run then completes and reports, and the store is simply
not trusted; no pass is wasted by a stop in the middle. Until it exists `evidence/indep/sum-files.cjs <store>` does it by
hand (tested on a synthetic store). A test: the refused-record world of `refused-demo.txt` must now fail G0. On the one
real day I read, the four counters are 0 and the rows are conserved (6,406,737 takers in and out, 0 duplicates; 788,904
liquidations in and out), so the check costs the run nothing.

**M2 — Columns and tables no gate reads on real data.** G6 (`gates.ts:686-744`) compares per sample day the 38 coins'
tape (rows, sum of `tid`, sum of px·sz), BTC's and ETH's bars as four day totals (`:715-726`), liq as a row count and
a sum of `tid`, and the contexts as ten day sums. Nothing reads: liq's `px`, `sz`, `markPx`, `fee`, `closedPnl`,
`oid`, `dir`, `block`, `startPosition` of counterparty rows and the counterparty `liqUser`; the minute bars `last`,
`high`, `low`, `liqBuyNtl`, `liqSellNtl` of all 40 coins and `trades`, `buyNtl`, `sellNtl`, `backstopNtl` of the 38
(the same code as BTC's and ETH's, never read per minute); the tape's `side`, `flags` and `user` except through G3's
legs; the liq table's all-coin total (the plan's 10,763,982 is not in `step1.json`, which holds the 38 coins' legs
only, so G1 cannot hold it); and the rows stamped at or after DATA END (only the scan's `late` count). The unit tests
pin the mapping: my 10 breaks on these columns (`R1`–`R7` and `R9`–`R11`: the bars' `low`, buy and sell, the liq
bars' side, liq `px`, `closedPnl`, `markPx`, `dir`, `fee`, `oid`, the context shift) are all killed. What no gate adds
is the check against real data. *Shown* (`columns-demo.txt`, the gates' world in a scratch copy): after the extraction
I changed six columns and rewrote the manifest's hashes: liq `px`, `fee`, `closedPnl` and `markPx` in a sample month,
SOL's bars `high` and `liqSellNtl`, and the `side` of one SOL tape row on an unsampled day. G0 to G6 all pass.
The twelve sample days (`gates.ts:84-100`) cover both file formats (2025-06-15 `node_fills`, 2025-07-27 both, the rest
`node_fills_by_block`), the crash day 2025-10-10 and the 2025-07-27 hole. They are all mid-month: 12 of the 13 months
(2025-05 never), no month's last or first day, no first day of the range, no DATA END hour.
**Fix:** widen `DayNumbers` and `dayFromRaw` (`gates.ts:656-744, 762-843`); the raw side already parses every field:
liq sums of px·sz, fee, closedPnl, markPx, startPosition and oid and the counts by `dir` and `method`; tape the
counts of buys and of backstop rows; the four bar sums for all 40 coins and, for one busy hour of each sample day,
`last`, `high`, `low` and the liq bars minute by minute; the all-coin liq total as a constant citing the review's
count; and three more days: 2025-05-25, a month's end and start (2025-08-31 and 2025-09-01), and 2026-05-29's hour.

**M3 — A store of other code, and a hand-made gates file, are trusted.** `gates.ts:238-239` puts the store's and the
gates' fingerprints in `gates.json`, but G0 does not compare them; `explore.ts:38-42` trusts `passed` alone
(`polish-gates.test.ts:607-626` writes `gates: {}` with `passed: true` and `explore` opens). A fix to any polish file
between `extract` and `gates`, or after them, leaves a store the code no longer makes trusted. **Fix:** G0 fails when
`m.code.fingerprint !== o.code`; `trustedStore` requires G0 to G6 each present and passed.

**M4 — The tests pin what the code computes, not what it refuses.** Of my 42 breaks, the 10 that change a computed
value (`R1`–`R7`, `R9`–`R11`: the bars, the liq columns, the context placement) are all killed; of the 32 that delete a
refusal or weaken an inner check, 2 are killed, 10 survive because another layer backs them in a real run (no single
deletion could fail a test: `S2`–`S5`, `G0a`, `G2b`, `G2d`, `M10`, `M11`, `R8`) and 20 survive with nothing behind them,
with all 584 tests green:
- **G0's inner checks** (`gates.ts:173-231`; the tests change the data under G0 twice, another list and one column):
  `partial` (`G0a`, backed by `wholeStore`), `wavehFrozen` (`G0b`), `users.bin`'s size (`G0c`), a missing partition
  (`G0d`), rows × width (`G0e`), `files.jsonl`'s line count (`G0f`) and line identity (`G0g`).
- **G2's** (`:430-439`; four refusals tested): `scan` (`G2a`), `booksNeeded` (`G2b`), `slice0` (`G2c`), `positions`
  (`G2d`); `G2b` and `G2d` are covered by the SHA-256 beside them, the other two are not.
- **The merge's guards:** its own input and code checks on every part (`merge.ts:242, 244`; `M11`, `M10`: the pass
  already redoes any other part), a liquidation's repeated (user, `tid`) (`:397`, `M5`), a taker row outside the
  minute grid (`:492`, `M9`: without the guard a typed array drops the bar silently), and liq's names outgrowing their
  columns (`:268-272`, `M12`).
- The seal's call sites (L3: only `S1`, the root `extract` writes into, has nothing behind it), the window pacing and the
  edges of `bytesOf` and of the settings (L11): the same pattern.
The two killed are `S6` (`readHeld`'s `checkPath`) and `T11a` (the settings). G0 is the gate the others wait for; a check
that a typo turned into "always true" would be found only when a real defect passed it. **Fix:** one refusal test each:
the world's store (G0, G2) or the merge test's parts changed in one thing, the expected message; a `pace` that counts and
blocks; the `checkPath` call sites. The existing G0 tests show the shape.

### Low

**L1 — G3's tolerance is 10^7 times looser than the plan's.** `gates.ts:74-75` (`BPS_TOLERANCE = 0.01`, "the plan:
0.01 bps"); the plan says 1e-9 bps (plan lines 622 and 772); decisions 2026-11-18 (line 114) say "as the plan said".
Zero is expected: the world test's `largestBps` is 0 and the arithmetic is WAVE-H's own. **Fix:** 1e-9 and the
comment; the decisions sentence is corrected by the supervisor's next entry.

**L2 — G4 shows no priced instant needed the fallback; it does not test the fallback.** `gates.ts:578-603` compares
the kit's `markAtMinuteEnd` with `minutePrice`, whose first line is that call on the same store-built market, so they
are equal wherever a mark exists; WAVE-H's own mark reaches the store through G3. architecture:515-517 says "equal to
WAVE-H's mark". The fallback's value (`tape.last`) has a unit test and no real-data check. **Fix:** reword; optionally
compare `tape.last` with the independent takers at 20 chosen minutes in G6.

**L3 — The seal: strong by name, weak at the call sites.** `seal.ts:21-32`, probed on a synthetic tree
(`seal-probe.txt`). Refused: the plain path, any case, forward slashes, `..`, `.`, a doubled slash, `\\?\`,
`\\localhost\F$\`, `ANALYZER\FRESH`. Not refused: a junction named `WAVE-H\store` that points at a FRESH store (it
opens the file) and `FRESH.\store` (it does not open in Node on this Windows: ENOENT). Behind the names there is a
second wall: every key the code asks for is dated at or before DATA END, FRESH holds only later keys, and a key not in
`waveh/data.sha256` is refused as "not in the list". Tests: `checkPath` for case and backslashes, FRESH as
`WAVEH_STORE`, a key after DATA END, an undated key, `ANALYZER\FRESH` (`polish-pass.test.ts:36-64`,
`polish-extract.test.ts:117,321`); none for slashes, `..`, UNC or a junction. **Five of six call sites are
untested:** deleting `checkPath(o.root)` or `checkPath(o.store)` (`extract.ts:58-59`), `checkPath(file)` in
`Store.bytes` (`store.ts:159`), `checkPath(dir)` in `openStore` (`store.ts:226`) or `checkKey(key)` in `readHeld`
(`held.ts:19`) leaves all seven polish test files green (breaks `S1`–`S5`, run on both halves of the suite); only
`checkPath(file)` in `readHeld` (`S6`) is killed. Four of the five survivors have another layer behind them (`S2`:
`readHeld`'s own check and the settings; `S3` and `S4` each other; `S5` the list), so no test could fail on one alone;
`S1`, the root `extract` writes into, has nothing behind it. `createLog` (`polish.ts:88`) creates `ANALYZER_ROOT\logs`
before any seal check. **Fix:** `realpathSync` before `checkPath` when the path exists; one test a call site; the seal check
before `createLog`.

**L4 — Any fix invalidates every part.** `run.ts:103-121`, `pass.ts:196-206`: the fingerprint hashes all of
`dist/polish*`, so a fix even in `gates.ts` makes every part "other code" and the next `extract` redoes the pass (about
46 min); Q4's reason (EXTRACT-BUILD's `progress.md`: a merge fix reruns in about 20 minutes, not the pass's 45) does
not hold as built. **Fix:** a second fingerprint of the part-writing files (lz4, scan, writers, tables, part, pass,
worker, held, seal) for reuse, or say so; and plan this review's fix round before the run, so the run is one run.

**L5 — The workers' heap is 16 GB, not 4 GB.** `pass.ts:3-4, 34-35, 288-290`, architecture:458, decisions (plan
table, F3): `--max-old-space-size=16384` overrides `resourceLimits.maxOldGenerationSizeMb`; measured with
`heap-probe.mjs`: a worker started with 4096 reports a limit of 16,576 MB under the flag and 4,288 MB without it. The
documented run gives each of 6 workers 16 GB. The measured peak (2.6 GB of RSS for the day's pass) makes it moot;
**fix** the text.

**L6 — The minute row mixes two clocks.** The context columns are as of the END of minute k (`ctxs.ts:154`: the row
stamped in (m, m + 1 min]); the nine bars cover [m, m + 1 min) (`merge.ts:491`). A try that reads `mark[floor(t /
60000)]` at the instant t sees up to 59 s ahead. It is the specified rule (Q7, H10) and the merge test says it in a
comment; it is not written where POLISH-EXPLORE will look. **Fix:** one sentence in architecture's store paragraph and
an accessor next to `minutePrice` that returns the mark known at t.

**L7 — Held that need not be.** `merge.ts:316` keeps all 40 coins' accumulators until the month ends
(`takers.delete(coin)` after each coin would free them); all 13 months' contexts (about 1.9 GB) stay while one month is
written. Not needed for the estimate below.

**L8 — Load.** Under the suite's own load (my verbose run, 124 s) every slow test has its own limit (30 to 600 s)
except `polish-ctxs`, "gives every 38-coin mark…" (1.7 s of the default 5 s); `polish-extract.test.ts:147-151` asserts
that nine pauses of 500 ms took less than 5,000 ms (a margin of 500 ms over nine sleeps; Windows timers round up).
**Fix:** a limit on the first, no upper bound on the second.

**L9 — Simplicity.** `tsc --noUnusedLocals --noUnusedParameters` finds no unused local or parameter in `src/polish*`.
(a) 19 exports no other file or test uses: `stepCounts`, `compareLine`, `dayFromStore`,
`dayFromRaw`, `LAST_TRADE_MS`, `monthBounds`, `MergeInput`, `PartRows`, `WORKER_HEAP_MB`, `Done`, `extractFile`,
`PassSummary`, `HOLE_MS`, `parseText`, `LiqRows`, `peakWatch`, `BPS_TOLERANCE`, `Expected`, `GateResult` (WAVE-H's
review found 17 of the same kind). (b) `MINUTE_MS`, `HOUR_MS` and `DAY_MS` are defined again in `legs`, `gates`, `ctxs`,
`scan`, `merge` and `range`, though `schedule.ts` exports them. (c) Names: two `Names` (`writers.ts:30` a class,
`store.ts:126` a schema), two `sha256` (`store.ts:145`, WAVE-H's `gate.ts:67`), `range()` (`part.ts:88`) beside the type
`Range`, three names for a taker row in memory (`Kept`, `Taken`, WAVE-H's `Trade`), `held.ts` for "a raw file held to its
list", `run.ts` beside WAVE-H's `run.ts`, and `writers.ts` holding the coin sets (`fortyOf`, `LARGE_COINS`) and the row
flags (`BACKSTOP`, `LIQUIDATION`, which are `tables.ts`'s). (d) Three counters nobody reads (M1 reads them).
(e) `gates.ts` (985 lines) is three jobs: G0 to G5 and `runGates` (about 700), G6's sample days (`dayFromStore`,
`dayFromRaw`, `ctxsFromRaw`, about 270) and the library POLISH-EXPLORE will import (`Library`, `libraryOf`, `positionsOf`, `GatesFile`): a pure move before POLISH-EXPLORE.
(f) A few comments the delete-the-line test removes (`legs.ts:36`, `tables.ts:45`); one-line doc comments of 250
characters (`gates.ts:656`).

**L10 — Docs.** architecture:458 ("4 GB"); :528-532 lists the direct imports, while the compiled closure of
`dist/polish.js` is 52 files (WAVE-H's `books`, `lz4` and `verdict`, seven of MARKET-1's, three of the paper
experiment's, `schedule` and `log` among them), which is what the exam's freeze list will have to carry; the
commands print nothing: every line goes to the pino log (`polish.ts:172-175`), and `createLog` prunes `polish-*.log`
after 30 days (`log.ts`, KEEP_DAYS), so the run's log must be copied; a manifest that does not parse exits 1, not 5
(`store.ts:233`).

**L11 — Windows and the settings are untested where they bite.** Deleting any `pace()` call (`pass.ts:251` and `:297`,
`merge.ts:297`, `ctxs.ts:188`, `gates.ts:774`) leaves every polish test green (breaks `P1`–`P5`): the rule that no file
or month starts in 02:30–06:00Z or 10:25–11:15Z is the safety net of a 70-minute run and nothing tests it. The
settings' second direction (`run.ts:62`, `WAVEH_STORE` inside `ANALYZER_ROOT`) is untested (`T11b`), and so are
the exact edges of `bytesOf`'s guard (`tables.ts:91-92`: `MAX + 1` and a negative into an unsigned column survive,
`T1`, `T2`; the real ids are far from them) and the exact month edge of `meets` (`merge.ts:301`, break `R8`:
practically equivalent, because a part is read for a month when any coin's rows reach it). **Fix:** a test with a
`pace` that counts and blocks (one call per file, per day, per month; nothing read while it blocks), and one test
line for each other survivor.

**L12 — What the first real run may show.** G5 fails on any (file, coin) whose takers differ from its makers; in the
`node_fills` hours (2025-05-25 to 07-27, about 1,080 hour boundaries) a trade's two lines can fall on both sides of an
hour (EXTRACT-BUILD's check C3 saw none on 24 boundaries): fix the rule before the run (report to the owner, never
waive in code). G6 has not yet run on the 2.1 GB hour file (about 5 GB of memory). G3's `largestBps` should be 0. A
crash leaves `.tmp` files in `parts\` and `store\`; `--day` into a root that holds a full run overwrites parts 0 to
23 and the manifest.

## What a wrong store could be, and which gate sees it

S: an independent number must be reproduced. M: a sample or an indirect sight. **None**: no gate.

| Class | Seen by | |
|---|---|---|
| A raw file other than the listed one | `readHeld` holds every file to `data.sha256` before it is decoded; G0 | S |
| Another list or WAVE-H freeze | G0 | S |
| A timing store taken for the full one | `wholeStore`, G0 (tested) | S |
| A store made by other code | G0 prints both fingerprints | **None** (M3) |
| A wrong LZ4 decode | the decoder's content checksum and sizes; G6's independent lz4js | S |
| A record missed or doubled | G1 records and failures by 370 file-days; G5 pairing per file | S |
| A record misread (`crossed`, coin) | G5; G6 on 12 days; `misread` unasserted | M |
| A record a writer refuses | G6's 12 days only | **None** (M1) |
| Block gaps, the replayed block, H14's rate, the SIZING coins | G1 | S |
| A torn or stale part | the merge's size, SHA-256 and code checks | S |
| Merge order (H8) | G6's order-dependent sums (12 days); G3's leg tids | M |
| A `tid` twice | the merge stops | S |
| Rows lost or doubled on a day G6 does not sample | nothing; month boundaries and the first day included | **None** (M1, M2) |
| User ids | G2's counted fills' accounts | M |
| `tid` halves | G6's sum of `tid`; G3; G2 | S |
| liq: both legs, time, coin, user, own `liqUser`, side, crossed, method, `startPosition` sign, `tid`, `file` (38 coins) | G1 legs by month, kind, method; G2 | S |
| liq: `px`, `sz`, `markPx`, `fee`, `closedPnl`, `oid`, `dir`, `block`, counterparty `liqUser`, the all-coin total | G6 rows and sum of `tid` on 12 days | **None** (M2) |
| Minute `mark` | G1 by coin; G3 at the instants; G6 sums | S |
| The nine other contexts | G6 day sums on 12 days | M |
| Bars: BTC's and ETH's four totals | G6 day totals on 12 days | M |
| Bars: the 38 coins; `last`, `high`, `low`, the liq bars of all 40 | nothing | **None** (M2) |
| Funding | G1 counts and settlements; G3's funding field | S |
| A torn column | G0 | S |
| A row at or after DATA END | the scan's `late` count; unit tests | **None** |
| Counted fills, slices, positions, prices | G2, G3 against WAVE-H's own numbers | S |
| The minute price's fallback | unit tests | **None** (L2) |

## The nine points of the brief

**1. Faithfulness.** The classes are in the table. The records, their order, the duplicate rule, the user dictionary,
the u64 halves, liq with both legs, `dir` and `file`, the minute rule and the ten contexts and nine bars, funding and
`files.jsonl`'s counts are right in the code (I read each against the rules) and pinned by exact tests. The
differential on a synthetic range across a month's end found no difference, and the one real day I could compare
(2025-10-10) shows none either: 4,712,980 tape rows, 540,000 bar cells, 788,904 liquidation rows of 18 columns and
600,000 context cells all equal. The records, their order and the dictionary are therefore right on real data for that
day; what is left open is what the gates must show for the other 369.

**2. The gates.** G1 is strong for what it reads (370 file-days of records and failures, the block-gap replay, the 46
cells of legs, the counted fills, the contexts and funding counts) but reads the scanner's counts, not the stored rows
(M1). G3 is strong: WAVE-H's own `priceSpot` on the store-built tapes, markets and books reprices 1,299 + 290
positions against `positions.jsonl.gz` line by line; the leg prints compare the tape's trade count and `tid`s (tape
legs) and `tapeMinusBook` exactly (book legs), so 3,178 tape windows are read; only the seven bps fields have a
tolerance, and it is 10^7 too loose (L1). G4 is weak by design (L2). G5 is an exact pairing from the scanner's counts:
a statement about the archive's completeness, not about the store (M1). G6: M2. **Passing by construction:** only G4's
non-null branch; G6's raw side shares WAVE-H's schema, its (user, `tid`) rule and `byM4` (specifications, not the
build's code).

**3. The seal:** L3.

**4. Integrity and resume.** Part reuse: L4. The parts and columns are written whole but not flushed: a torn part
fails the merge's size and SHA-256 checks and is named; a torn column fails G0; only a power loss can tear one (a
killed process leaves its cache). A crash in the merge leaves no manifest, or the old one whose hashes then differ and
G0 fails loudly; the manifest is last and flushed. A store of older code: M3. A one-day store taken for the full one:
refused twice (`wholeStore`, G0), tested.

**5. Memory and time.** The workers' real ceiling is 16 GB (L5); the measured peak is 2.6 GB for the day's pass. For the
merge's biggest month (October 2025, about 100 M takers of the 40 coins: the crash day alone has 6.4 M, and I take 3.5 M
a day for the rest) I estimate 7 to 8 GB: 40 B × 100 M of accumulators, 1.9 GB of contexts, the largest coin's sort arrays
and the dictionary; the builders said about 6 GB. Every figure is far under the 16 GB heap and the PC's 31.9 GB, and
the manifest records the real peaks. The merge's own comparator sorts 30 M near-sorted rows (one big coin's month) in
4 s and 1.1 GB (`evidence/sort-bench.mjs`), so the sort is not the cost and the builders' 12 minutes of CPU stands; the
70 minutes in all is plausible. G6 on the crash day holds about 5 GB (the 2.1 GB decoded hour, the day's takers as
objects and the seen set); G3 about 1 GB.

**6. The frozen programs stay undisturbed.** Since `waveh-freeze-1` no file under `apps/poller/src` outside `polish*`
changed, nor any package, lock or config file; four tests got a time limit and the fetch tool changed (FRESH-FETCH).
Polish only reads what it imports. The test that none of the three frozen programs' compiled imports reaches
`dist/polish` is sound for static imports (it misses a bare `import "./x.js"` and a computed dynamic import; a changed
frozen file fails its freeze list anyway).

**7. Tests and breaks.** Of EXTRACT-BUILD-2's 70 breaks I re-ran 19 in a scratch copy of HEAD: `s1 s5 w5 p4 c3 m1 m6 p3
m2 st1 se1 h1 k1 e2 t9 t12 t13 g6 g7`; all killed by the named tests (the kill messages are in `evidence/breaks/out-theirs-*.jsonl`). My own breaks:
`R1`–`R11` (bars, liq columns, context placement) 10 killed, `R8` survives (L11); `S1`–`S6` (the seal's call sites) 1
killed, 5 survive (L3); `P1`–`P5` (pacing) 5 survive, `T11a` killed, `T11b`, `T1`, `T2` survive (L11); `G0a`–`G0g` and
`G2a`–`G2d` (each weakens one inner check of G0 or G2) all 11 survive; `M5`, `M9`–`M12` (the merge's guards) all 5
survive (M4). In all: the 10 breaks that change a computed value are killed, and of the 32 that delete a refusal or
weaken a check 2 are killed, 10 are backed by another layer and 20 survive with nothing behind them. Load: L8.

**8. Iron Rules in code.** The compiled closure of `dist/polish.js` (52 files) imports only `node:crypto`, `fs`,
`module`, `os`, `path`, `url`, `util`, `worker_threads`, `zlib`, `pino` and `zod`: no `http`, `net`, `tls`,
`child_process`, `fetch` or WebSocket, nothing named order, wallet or signature; the kit loads 12 named files (not
`mutate.mjs`). Every write goes under `ANALYZER_ROOT` (`parts`, `store`, `gates`, `logs`).

**9. Simplicity:** L9, L10. The code is plain and follows WAVE-H's habits; it has no dead function, no fallback nothing
needs and no AI filler I could find. The slow path in `scan.ts` is a needed fallback (Iron Rule 3), but its counters
are not read.

## The independent check on real data

**What, when, how.** 2026-11-18 06:00:46Z to 06:04:51Z (the window ended at 06:00Z): a smoke run of 6.6 s on the first
3,000 lines of the first file, then one run of 237 s at idle priority (the limit was 20 minutes). Read only, nothing
written under `F:\`: the one-day timing store `ANALYZER\timing-2025-10-10\store\` by its manifest (every file held to its
size and SHA-256: 0 problems); WAVE-H's raw files of 2025-10-10, the 24 files the store was made from (19,127,562
records) and the hour either side (2 files, 1,698,828 records), each held to `waveh/data.sha256` before it was read;
`asset_ctxs` of 2025-10-10 and of the next day. The parse is my own: WAVE-H-LOOK-REVIEW's decoder (`lz4.cjs`, copied),
`JSON.parse` of every line, my own sort (time, address, `tid` as a whole number) and my own reading of the rules; none
of the build's code. The script is `evidence/indep/indep2.cjs`; before it saw real data it found no difference in two
synthetic stores and all 7 silent changes in a tampered one. Its results are in `evidence/indep/real/`.

| What | My parse of the raw files | The store | |
|---|---|---|---|
| Records of the 24 files | 19,127,562; 0 failing lines; 0 stamped outside the day | `files.jsonl`: 19,127,562, 0 failed | equal |
| Takers of the 38 tape coins | 4,712,980 | 4,712,980 rows in 38 partitions | every row equal: time, px, sz, side, backstop flag, address, `tid` |
| First and last `tid`, per coin, in H8's order | e.g. SOL 274812096539089 … 524386714068461; HYPE 773931439129863 … 64068089014703; kPEPE 406890352802828 … 680991239533614 | the same | equal for all 38 |
| Σ sz and Σ px·sz, per coin | in H8's order, f64; and as exact decimals | the store's | equal bit for bit; the exact decimals within 3.4e-11 relative |
| BTC's and ETH's takers | 1,693,757 (BTC 940,928; ETH 745,798) | in the bars | equal |
| The nine bars, 40 coins × 1,500 minutes | 540,000 cells (trades, buy, sell, backstop, last, high, low, liq buy, liq sell) | | 0 differ; 0 takers outside the grid |
| Liquidation records | 788,904 | 788,904 rows | every row equal in all 18 columns; counts by coin equal for every coin; the sums of px, sz, fee, closedPnl, markPx and startPosition agree with the exact decimals to 5e-13 relative |
| The ten contexts, every minute | 600,000 cells by the minute rule | | 0 differ |
| The ten contexts at 11 chosen minutes by a direct filter of the raw rows (23:59 of the day before, 00:00, 21:15, seven drawn, the last minute) | 4,400 cells | | 0 differ |
| Takers against makers, per file and coin | 6,406,737 and 6,406,737; 0 unequal pairs | | equal (EXTRACT-BUILD's C3) |
| Addresses | 85,636 | the dictionary: 85,636 | equal |
| Duplicates | 0 | 0 | equal |
| The scan's own counters | | `refused` 0, `misread` 0, `slowLines` 0, `slowRecords` 0, `failed` 0, `late` 0 | 0 |
| Liquidation records a writer would refuse (no `closedPnl`, `oid` or `dir`, a bad `liquidatedUser`) | 0 | | 0 |
| The longest line | 14,037,664 bytes | | the 14 MB of C4 |

**What it shows.** On the heaviest day the store is faithful in every table I could read against the raw files, the
bars and the liquidation columns M2 says no gate reads included: the one-day store the supervisor will scale from is
right. The scan's four counters are all 0 on this day, so M1's assertion would pass; and the hours either side hold no
record of the day (0 of 206,412 and 0 of 1,492,416), nor does any of the 24 files hold a record of another day, so G6's
hour either side reads nothing extra here. One thing that looks like a difference is not: the store's context for the
last minute (23:59) is empty because a timing run reads one day's file, and 35 of the 40 coins have a row at the next
midnight; the whole-range run reads every day.

## How the structure fits later phases (notes; no code for them)

- **POLISH-EXPLORE.** The library is typed and tested end to end (counted fills, slices, `Tape.at`, `minutePrice`,
  markets, positions). It will want: a cache of whole-range columns (`minuteColumn` re-reads and re-hashes 13 files a
  call); a coin-month sweep for F18 (`Tape` is a per-leg lookup that keeps two coin-months); the two clocks of the
  minute row written down (L6) with the fact that an empty cell is NaN (a minute without a trade, a context without a
  row), so a try's mean must say what it does with it; `Library`, `libraryOf`, `positionsOf` and `GatesFile` out of
  `gates.ts`, which pulls in the book path and the kit. The store's identity (manifest SHA-256) and the code
  fingerprint belong in the try log. Do not change the extraction after POLISH-EXPLORE starts: plan 3.7 has the frozen code reproduce the explored store, so a
  change means a rebuilt store and new gates.
- **The exam.** `seal.ts` has no opening yet (it says so); `ExtractSettings` hard-codes `…\WAVE-H\store` and `range.ts`
  holds the one range; both change the code fingerprint. FRESH has a day with no `asset_ctxs` file (2026-07-08, plan
  F7): `extract`'s list check (`extract.ts:66-70`) and `readContexts` (`ctxs.ts:192`) refuse a missing day, so the exam's
  range must name the days that may be absent, make their contexts NaN and list them in the manifest. "Byte for byte"
  must mean the column files, the dictionaries and `files.jsonl`, not `manifest.json` (it holds `written`, peaks and
  seconds).
- **PAPER-H.** A writer is `wants` and `add`, which is good, but `part.ts` and `merge.ts` name `taker` and `liq` in
  their headers and loops: a third writer touches the part header, `partOf`, `readPart`, `merge` and the manifest
  schema, and the by-account-bucket layout is a different merge, not a variation of by-month. Split `part.ts` into a
  container and per-writer schemas at PAPER-H's plan, not now. Its parts would be about 170 GB.
- **Names and places.** `polish` names a phase; the plan names the exam's tag `polish-freeze-1`, so keep it (a rename
  must come before the exam's freeze). `apps/poller` now holds five programs; the three frozen ones cannot move (paths
  are in hashes); only `polish` could still move to its own package, before the exam's freeze.

## Questions, with recommendations

- **Q1 — M1 to M4 before the run, in one fix round?** Yes: the run then uses the final code (any code change makes a new
  fingerprint and a new pass, L4), and the check by hand (`evidence/indep/sum-files.cjs`) stays as the fallback.
- **Q2 — Widen G6 (M2) now?** Yes: the store is the base of the 38 tries and the exam; the cost is one fixer session.
- **Q3 — Keep the name `polish`?** Yes (the plan's tags).
- **Q4 — G5 on straddled pairs in the `node_fills` hours:** fix the rule before the run: report to the owner, never
  waive in code.
- **Q5 — A second fingerprint for the parts (L4)?** Only if the fixer has time; otherwise plan the fix round first.
- **Q6 — Split `gates.ts` before POLISH-EXPLORE (a pure move)?** Yes.
- **Q7 — A fix-check after the fixes?** Yes, a small one: the 20 unbacked survivors of this review
  (`evidence/breaks/`) must now die, the new gates run on the synthetic world and on the one-day store, and
  `evidence/indep/indep2.cjs` runs again on the rebuilt timing store.
- **The order I would take:** (1) M1 and M3 (G0 and the pass's assertions) with M4's refusal tests for G0 and G2;
  (2) M2's G6 widening and the three days; (3) L1, the seal's call-site tests and L11's pacing test; (4) the docs (L2,
  L5, L6, L10); (5) the pure moves (L9); (6) `pnpm verify`, the surviving breaks must now die, the gates on the
  synthetic world, then the run.

## After the full run (`gates.json`)

Not yet written. When it exists, read it for: `G0` pass, `storeCode` equal to `thisCode`, 1,521 partitions
(tape 494, liq 13, minute 520, funding 494); `G1` `differ` empty, `counted` 2,421,070, `late` 303,852, `early` 0,
`sizingCoins` 31; `G2` M 147, `positions` 1,299, `sizingPositions` 290, `sizingLate` as in `step1.json`, `everySlice`
176,986; `G3` `lines` 1,589, `priced` 1,289, `largestBps` 0; `G4` `unmarked` 0, no problems; `G5` no problems (and the
ratios of `day_ntl_vlm` beside); `G6` twelve days passing. And from `files.jsonl` and the manifest by hand (or by M1's
gate): the sums of `refused` and `misread` (both 0), `slowLines`, `slowRecords`, the duplicates by table (`blocks.back`
is 1 in `step1.json`: a replayed block may give a few), the conservation formulas of M1, and the peaks
(`manifest.peaks`).
