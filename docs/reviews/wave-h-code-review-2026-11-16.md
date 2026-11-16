# WAVE-H-CODE-REVIEW — the Final review of WAVE-H's code, before the freeze

WAVE-H-CODE-REVIEW (Sonnet 5.5, max, a different model from the builder's Opus),
2026-11-16, for polymarket-follow's supervisor (UTC; every stamp from `date -u`;
worked 01:58Z to 03:00Z). Under review: WAVE-H-BUILD's commits `83f892d` …
`7589043` (`git log --format='%h %s' | grep "(WAVE-H-BUILD)"`), that is
`apps/poller/src/waveh.ts` and `src/waveh/` (20 files, 3,069 lines),
`tools/waveh-freeze.cjs` (195), `scripts/waveh-reproduce.ts` (178),
`apps/poller/waveh/` (rules, `coins.json`, `sizing.json`, the draft list) and
the tests `test/waveh-*.ts` without the fetch tool's (10 files, 3,460 lines).
HEAD moved from `dc812f1` to `96e171a` while I worked (a docs commit); `apps/`,
`tools/` and the lockfile are identical to `7589043`. `waveh/rules.md` is the
frame; WAVE-H-RULES-REVIEW checks the rules against the code at the same time,
so a finding may be in both reports. **A review decides nothing.** My model is
`market-code-review-2026-11-13.md`. Evidence: the supervisor folder
`workers/WAVE-H-CODE-REVIEW/` (`progress.md`, `checks/`).

**The limits held.** I opened nothing under `F:\polymarket-follow-research\`
(neither WAVE-H's store nor the rehearsal's folder) and took no count from it;
nothing of the collector's recordings or database, the run folder, the paper
experiment's or MARKET-1's data. I ran no WAVE-H, MARKET-1, paper or poller
command against a real path: the built program ran twice, on empty synthetic
folders in my scratchpad (to read its exit codes), and the tests and probes ran
on synthetic stores there. No network call, no deploy, no Task Scheduler. Every
build, deliberate break, freeze-tool run and injected failure was in a scratch
copy (`git archive` of HEAD; each with a real `node_modules` folder of
per-package junctions, vitest and tsc run directly, never pnpm; nothing deleted
recursively).
The only pnpm run was `pnpm verify` in the repository, whose `dist` is
git-ignored. WAVE-H-BUILD's folder was not opened. No agent was started;
polymarket-lab was not touched; the repository changed by this file alone.

## For the owner, in one page

*Words.* The **freeze** locks the program and the rules by a fingerprint; the
look reads nothing from the test months unless it verifies. The **seal** is the
guard that refuses every file dated 2025-08-01 or later until then. The **one
look** has two steps: step 1 reads the data and prints counts, step 2 prices
and writes the verdict. A **deliberate break** is a one-line change I make in a
scratch copy (a wrong limit, a check removed) before running every test; a
break that no test notices — a **survivor** — shows a rule or a guard that
nothing guards. A **pin** is a small test that fixes one such value or guard.

**Verdict: after these fixes.** It is not a rework. `pnpm verify` is green on
HEAD (build, lint, 493 tests in 56 files, format). The code is good, plain and
carefully tested: strict types, no `any`, no suppressed warning, every outside
file parsed at the door, no network call anywhere, pure rules with their
edge cases pinned (2.84 and 2.835, a tie, a 160-bit address, a trade id above
2^53 − 1).
What is wrong is small and sits where the one look meets the real world: how it
writes its result, one data check it does not make, and tests that do not guard
what you asked me to look at.

**What is in order.**
- **The two live programs.** Both freezes verify with their own verifiers on a
  fresh build: MARKET-1's 64 files `b9e17505…2f1d`, the paper experiment's 61
  files `d04d3cd8…f31c`. Since MARKET-1's freeze (tag `market1-freeze-1`) the
  only files outside WAVE-H and the docs that changed are one `.prettierignore`
  line, `apps/poller/package.json` (the decoder `lz4js`, a dev dependency) and
  the lockfile. WAVE-H writes under `dist/waveh*` and `waveh/` only; neither
  program's file scope contains them.
- **The Iron Rules in code.** `dist/waveh.js` and everything it reaches import
  only `node:fs`, `path`, `crypto`, `zlib`, `os`, `url`, `module`, `zod`,
  `pino` and the decoder (the kit it loads adds `fs`, `zlib`, `crypto`): no
  HTTP, socket, process or database module, so no order, fund or signature
  endpoint and no request at all. The fetch tool sends the generic
  `research-check/1.0` and makes only keyless reads (the archive's GETs and
  `fundingHistory`). Nothing that leaves this machine carries the project's or
  the owner's name (the only mention is a local default path in
  `waveh-fetch-start.ps1`), and nothing touches or mentions polymarket-lab.
- **The seal, in code.** Every read of the store goes through one function
  that checks the key's date first; five kinds of key are dated, and a key
  whose date cannot be read is refused even with the gate open. The rehearsal
  never opens a test month: its test lists such files with bytes that would
  fail if opened. `data.sha256` is required by name in the code, and a test
  fails when any of the four names of `waveh/` or any lz4js file leaves the
  list (breaks b07 and b45–b49).
- **The one look.** I traced its writes in a scratch copy: step 2 writes the
  result first, when only `books-needed.txt` and `step1.json` exist, then the
  positions, then the report; nothing is printed or logged about an outcome
  before it. The freeze tool's `--final` works end to end on a clean scratch
  tree (72 files with a synthetic `data.sha256`; the program's own gate
  accepts the list and opens), and
  refuses a dirty tree, a missing `data.sha256` or `sizing.json`, and a
  closure file that differs from MARKET-1's list. The build is reproducible:
  `dist/waveh.js` has the same hash in two folders and equals the draft list's.
- **Memory.** I measured about 0.5 KB a counted fill with its legs, so the
  whole pass holds about 1.2 GB; the builder's 2.8–4 GB is a safe overestimate
  and the 8 GB setting leaves a wide margin.
- **Dead code, slop, fallbacks.** No dead function in a production path; no AI
  filler (the comments mostly say something the code does not); the one
  soft-parse trap the rules name (an unreadable file of ours shown as
  "unknown") is not present. 17 exports are used by no other file, two
  parameters no caller passes, one branch is reached only when no book is
  needed, and a handful of one-line helpers exist two or three times (L6, L10).

**What must change first** (details below):
1. **A failed write after the result strands the look** (M1): the result is
   saved, the report is not, and the program then refuses to run again. The
   write order is right but no test pins it (a break that writes the report
   first survives every test); I give the 12-line test that kills it.
2. **Marks and funding are first read inside step 2** (M2), after the data
   check of step 1: the quirk the rehearsal found in the marks (Q6) could show
   up in the test months only as a spent verdict. Reading them at step 1 is
   cheap and shows no outcome; it is a rules decision (question Q1).
3. **Pins and small fixes** (L1–L12): step 2's cheap checks run only after
   hours of work; the book lines that fail are not counted; the exit codes
   4 and 5, the freeze tool's refusals, the previous-hour book branch and a
   short sealed file have no test; `waveh.ts` still says a 4 GB heap; a
   duplicate key passes the freeze tool and would stop step 1 after the
   freeze; the rehearsal overwrites its sealed outcomes without asking.

**What I could not check.** The test months (sealed), so nothing about real
data beyond what the rehearsal on SIZING showed and the builder's counts (which
I did not open); real timings (I measured only the parse path: about 3 µs a
record on this PC); how Windows' antivirus treats the look's renames (M1 is
shown by an injected failure, not a real one); `tools/waveh-fetch.cjs` beyond
its manifest and its endpoints.

## Findings

Severity as I judge it (the brief fixes none). Line numbers are at `7589043`.
"Break" ids `b01`… are mine, in `checks/`. Tests lie outside the freeze scope
(`gate.ts` `FROZEN_SCOPE`), so a pin added after the freeze changes nothing;
a change to anything under `src/waveh/` or `waveh/` is a new list, and the fix
round makes one anyway (H10's change, the third rehearsal).

*Where this meets WAVE-H-RULES-REVIEW:* M2 changes rules H15's step 1; L2 and
L11 are rule against code (H8 "counted", H2's day).

### High

None.

### Medium

**M1 — A failed write after `result.json` leaves a look with no positions and
no report, and it cannot be run again.** `look.ts:450-473` (the three writes),
`look.ts:262-265` (`writeWhole`). The builder's `81698bd` moved the *computing*
of the report before the result, so a crash in the lines beside is not a look,
and that holds. The *writing* is three separate calls in the right order (traced:
when `result.json` is written the folder holds only `books-needed.txt` and
`step1.json`), but a failure after the first — a full disk, a rename an
antivirus scan or an open reader refuses on Windows, a kill — leaves a verdict
and no report, and the next run throws "already run" (exit 5). I injected a
failure at `report.json` in a scratch copy: `result.json` and
`positions.jsonl.gz` stay, `report.json` is missing, a second run throws
`AlreadyRun`. The hardened version exists in this repository: MARKET-1's
`writeWhole` (`market1/run.ts:109-132`; MARKET-PLAN-REVIEW's F2 tested a Windows
rename) fsyncs and tries the rename 10 times, a second apart; WAVE-H's copy of the same name does neither.
No test pins the order: break b24 (the report written first) survives all
WAVE-H test files. **Fix:** (a) give WAVE-H's `writeWhole` MARKET-1's fsync and
rename retries; (b) build both payloads (the gzip of the positions, the report's
JSON) before the result is written, so only I/O follows it, and keep the three
writes in one small function `writeLook(dir, result, positions, report)`;
(c) one sentence in rules H15 for a crash after the result: the look is
complete when `positions.jsonl.gz` and `report.json` exist; if one is missing,
the supervisor moves `result.json` aside and runs step 2 again, which must end
with the same `positionsSha256` and verdict, else it is a defect (H0);
(d) the pin: in `waveh-look.test.ts` replace `log: () => {}` by a function that,
at the `"result"` event, checks the folder (`result.json` exists, the other two
do not) — 12 lines, no mock; it kills b24 (proved in a scratch copy) — and a
case with the write failing at `report.json` that expects the state (c)
describes.

**M2 — Marks and funding are read for the first time inside step 2, after the
data check of step 1.** `look.ts:373-377`, `rehearse.ts:232-284`; rules
R3/H15. Step 1 reads every fill file and prints R3's counts "before any price
exists", so a data defect is repaired through H0's route while no outcome has
been seen. The test months' 302 `asset_ctxs` day files and their funding
windows (most of the 760) are opened only at step 2, whose result is the look.
The rehearsal showed what to
expect: 2,831 of SIZING's rows for the 38 coins are stamped off the minute, on
12 days, and left 7 of 290 positions without a funding mark (decisions
2026-11-14, Q6). If a stretch of the test months has more of them, a day file
has another header, or a funding window has a hole, it first shows as WITHHELD
(more than 10% unpriced) or TOO FEW TO TELL in the one verdict, which H0's route
can no longer mend. Reading these files takes minutes and shows no outcome.
**Fix** (a rules change, H15's step 1; question Q1): step 1 also reads the day
files and funding windows and writes to `step1.json`, by month and coin: rows,
rows failing, rows given twice, rows from the bound on, minutes with no mark,
settlements with no mark, funding rows. A defect found there is then a step-1
defect. Best in the same fix round as H10's change, which rewrites the same
reader (`ctxs.ts`).

### Low

**L1 — Step 2's cheap refusals come after hours of work.** `look.ts:317` runs
the whole step 1 again (about 2–5 hours on the test months, N2) before
`:346-370` check `step1.json`, the book list and the sealed SIZING outcomes'
file and hash, and `:395` parses that file's lines and holds
them to SIZING's positions only after the tapes and marks are read. A
`rehearsal/` folder missing from `WAVEH_ROOT` or one unanswered book key costs a
whole recompute. **Fix:** check `step1.json`, `books-needed.txt`'s keys against
`books.jsonl`, and the sealed file's presence and SHA-256 before `lookStep1`;
compare the sealed file's positions with SIZING's right after it, before
`readTapes`. No rule changes.

**L2 — H8 says a snapshot line that fails the schema is "dropped and counted";
the count is thrown away.** `books.ts:34-71` returns `lines` and `failed`;
`rehearse.ts:298-299` keeps only `.book`. If the test months' book files had
changed a field, every leg would read "no snapshot" and go to the tape, with the
reason counted but not its cause. **Fix:** carry `lines`/`failed` of each file
read and print their sums, with the files that had a bad line, in
`report.json`'s `prints.files`; a test with a book file holding one bad line.
The same shape, smaller: `ctxs.ts:65` skips a row with no coin cell without
counting it.

**L3 — Tests that do not pin what decides** (the spot-check's survivors; each pin
is a few lines and outside the freeze):
(a) `waveh.ts:109-130` maps errors to exits 4, 5 and 1; the entry test runs only
exit 2, and its header says the look's exits 4 and 5 are tested through the
functions — they are, as thrown classes, not as exit codes: breaks b40 and b41
survive. Put `exitCodeOf(err)` in `run.ts` and test it.
(b) `waveh-freeze.cjs --final`'s refusals and `--data`'s have no test (b42
survives); I ran them in a scratch copy and each refuses as designed. The tests
that exist cover only `manifestLines`, `dataList` and `shortFiles`.
(c) The previous-hour book branch (`rehearse.ts:301-306`, `booksOf`
`:149-157`): a leg within the first 10 seconds of an hour; about 0.3% of legs,
so about 5 legs of the look will take it, and no integration test does (b37,
b38).
(d) A sealed SIZING file with fewer lines than SIZING has positions passes
`look.ts:279` (b39, b59).
(e) The tape's guard `levelsOf` (`price.ts:136`) against a record of size or
price 0 is tested only on its happy path (b67); the write order (b24) is M1.
(f) Four print-only lines beside have no assertion: the SIZING line's BASE (b51),
the excess's lower bound (b56), the five busiest days' share (b65), R9's
quarter-hour step (b66). The survivors are in the table below.

**L4 — The freeze tool accepts a duplicate key.** `waveh-freeze.cjs:49-63`
(`manifestLines`) checks each line's shape but not that keys are new, while
`store.ts:30-33` (`readDataList`) refuses a repeated key. Shown in a scratch
copy: a manifest with one key twice gives a 43-line `data.sha256`, and
`readDataList` throws "line 21 is not a new file's line" — at step 1, after the
freeze, a defect for `waveh-freeze-2`. The download tool itself refuses a
repeated key, so it is defence in depth. **Fix:** two lines in `manifestLines`
and a case in the test.

**L5 — `waveh.ts:5-6` still shows `--max-old-space-size=4096` for both
commands**; the ruling for the look is 8192 (decisions 2026-11-14, Q5). The
file will be frozen, so fix it in this round.

**L6 — One fact in more than one place.**
- `Sizing` (`rehearse.ts:429`) and `SizingFile` (`look.ts:70`) are one file's
  shape twice; `SealedLine` (`look.ts:229-259`) repeats `Priced`, `Leg` and
  `LegPrint`. The code rules say the Zod schema is the type; make the schema
  once and infer the type.
- Helpers: `monthOf` in `pass.ts:55`, `look.ts:97`, `report.ts:25`; `iso` in
  `look.ts:98`, `report.ts:24` (and `dayKey`, `rehearse.ts:74`, the same
  function); `numText` in `fills.ts:33`, `funding.ts:12`, `books.ts:12`;
  `SHA256` in `store.ts:23`, `look.ts:67`; `sha256` in `gate.ts:66`,
  `look.ts:95`.
- The literal `1_000` at `rehearse.ts:363` and `:394` beside MARKET-1's
  `NOTIONAL`, which `price.ts` imports.
- The tests: `waveh-store.test.ts:45-62` defines its own `lz4js`, `frame` and
  scratch folders that `waveh-world.ts` already exports.

**L7 — `rehearse.ts` is named for one command and holds the shared layer.**
`readTapes`, `readMarkets`, `bookFound`, `priceSpot`, `booksOf`, `legsOf`,
`tally`, `coinName`, `CLOSED`, `Ctx`, `BooksNeeded` are used by the look, and
`report.ts` imports `burstiness`, `coinName`, `tally` from it. Split before the
freeze (a pure move, tests re-import): `legs.ts` for the shared layer,
`rehearse.ts` for `sizingPass`, `burstiness` and the command. Also: `late` means
four things (`step.late` the SIZING positions to price again, `pass.late` records
past the bound, the `late` map, THE LATE COINS); `Spot`, `Priced` and `Quote`
exist in MARKET-1 with other shapes; `iso` returns a day. `rehearse()` (`rehearse.ts:438-584`, 147 lines) and
`look()` (`look.ts:304-476`, 173 lines) each read, compute and write in one
body; M1's `writeLook` and a `lookReport()` taken out of `look()` would make
its order readable and testable. After the freeze nothing moves, so this is the
last cheap time.

**L8 — The choice of snapshot is made twice.** `bookFound`
(`rehearse.ts:301-318`) picks the file and age recorded for a leg; `bookAt`
(`price.ts:37-43`) picks the book priced. They agree today; if one changes, the
file kept "so the Final review can reprice" is not the book used. **Fix:** have
`bookAt` return which hour it used and take `file` and `age` from it.

**L9 — The store's key grammar is in six places.** Built or parsed in
`store.ts:141-156` (fill files), `books.ts:28-31`, `rehearse.ts:242` and `:258`
(marks, funding), `pass.ts:76` (the format from the key's prefix) and `gate.ts:
143-153` (`keyDate`, the only parser). A builder that drifts from the parser
fails closed (`SealedError`), which is right, but nothing says so in one place.
**Fix:** a round-trip test: every key `fillKeys`, `bookKey`, the marks' and the
funding's builders make parses to its own date.

**L10 — Unused parameters, exports and branches.** `loadCoins(dir)` and
`loadSizing(dir)` (`coins.ts:47`, `look.ts:90`): no caller passes `dir`. 17
exports are used by no other file, test or script (`CtxsCount`, `LegKind`,
`LZ4JS_SHA256`, `FAIL_SHARE`, `FAIL_LEAST`, `TapeWhy`, `MARKS_START`, `boundOf`,
`sizingPass`, `bookFound`, `LegPrint`, `Sizing`, `WINDOWS`, `TARGET_RATE`,
`FORMAT_SWITCH`, `Step1`, `Decision`). `look.ts:445` `: null` is reached only
when no book file is needed at all; `look.ts:433` casts `counts.topTakerBps`
because `Step1.counts` is `Record<string, unknown>`; `market.ts:29` rebuilds
every funding row only to change its type. Small, but each is code a reader must
wonder about.

**L11 — `pass.ts:135-139` stops on a day's running share, not the day's.** The
check runs after each file on the day so far, so a day whose first file has 10
bad records of 500 stops the run although the whole day might pass. It fails
safe (it stops, H0's route follows) and real hours hold hundreds of thousands of
records; say so in H2, or check at the day's last file.

**L12 — The rehearsal overwrites its own sealed outcomes, and nothing stops two
runs at once.** `rehearse.ts:528`, `:567-570`, `:579-582` use `writeFileSync`
without a check. An accidental second `rehearse` over `WAVEH_ROOT` replaces the
file whose hash `sizing.json` records: with the frozen code it rewrites the same
bytes (the run is deterministic), with any other code the look then stops at
its hash check (exit 5) and the original is gone. Neither command takes a lock
(the collector, the paper experiment and MARKET-1 do, `src/lock.ts`), so two
step 2s could start together and overwrite each other's `result.json`; the
rules say "one at a time" and rely on the supervisor. **Fix:** `rehearse`
refuses when `rehearsal/sizing-outcomes.jsonl.gz` exists (for the third run the
supervisor moves the old folder aside: a conscious act); a lock is optional.

### Notes (not findings)

**N1 — Memory, measured.** About 0.48 KB a counted fill with its two legs in
`seen` (193 B the fill, the rest the keys): the whole look pass holds about 1.2
GB for SIZING plus the test months, 0.5 GB without `seen`. The builder's 2.8–4
GB from the rehearsal's end heap (453 MB, which includes the loaded kit) is a
safe overestimate; the 8 GB run setting leaves about 6 times. `seen` holds every
liquidation leg of the 38 coins only to count the one shared hour (2025-07-27
08h) once; keeping it also guards against a replayed block anywhere, and costs
less than 1 GB. I would keep it.

**N2 — Time and operations.** The parse path costs about 3 µs a record (parse,
schema, no I/O or decode); the test months hold about 2.5 G records, so a pass
is 2–5 hours, and step 2 then reads the fill files of every leg's hour and the
next once more for the tapes (an estimate from the plan's 3.28 entries a slice a
day: about 2,000 legs, up to 4,000 files, 1.5–2 hours) although only legs without
a live book need them; R2's tape-minus-book gap is the reason, so I would leave
it. There is no checkpoint: a reboot or a sleeping PC in step 2 costs the hours
already done. Neither the CPU priority (`PRIORITY_LOW`) nor any watch of the
collector's heartbeat paces the disk: 182 GB read twice on the drive the
collector writes to; the rehearsal's 35 GB showed no harm that I know of.

**N3 — How the one look ends today.** `waveh.ts` exits 0 on a complete step 2,
5 after step 1 (books needed: a success for step 1), 4 when the freeze fails,
1 on a crash. A `SealedError` is a crash (1), which is right: it is a bug.

## The deliberate breaks (the spot-check of the builder's)

I ran **69 deliberate breaks in three rounds, each against all eight WAVE-H test
files** (`b01`–`b69`, lists and per-break logs in `checks/`; each find text
matched exactly once in a dry run; the scratch copy's sources equal the
repository's afterwards). **55 were killed by a failing assertion** (I read
every log: none by a timeout), **13 survived and one is equivalent** (b69, the
tape's per-file coin pre-filter, speed only). The brief asks for five; the
rest are where I thought a test could be missing, and 13 of 69 were.

*Killed (55), by what they break:*
- The seal and the gate (15): b01 a key dated exactly TEST's start escapes;
  b02 `readStoreFile` without the gate; b03 an undated key allowed; b04 the
  tape reads a sealed next hour; b05 the rehearsal's bound is DATA END; b06 the
  look runs with a closed gate; b07 the four `waveh/` files not required by
  name; b32 funding windows from the bound are read; b35 the list inside its own
  scope; b45–b48 each of the four names dropped; b49 `util.js` out of lz4js's
  scope; b50 the first test day's marks read by the rehearsal.
- The readers (11): b08 block checksums accepted; b09 bytes after the frame
  accepted; b10 a backstop's own fill not counted; b11 a mark a minute late;
  b12 a funding stamp floored, not rounded; b13 a snapshot at x itself not
  taken; b27 a fill in both formats counted twice; b28 a day at exactly 1%
  stops; b29 the formats' switch an hour late; b57 a repeated block number;
  b60 a fill told from its counterparty by its trade id alone.
- Pricing, the tape and the verdict (18): b14 and b54–b55 the 10-second
  edges; b15 a backstop's record on the tape; b16 the fee; b17 z; b18 the
  minimum of days and coins; b19 and b20 the scan's stop rate and its tie; b21
  the direction; b30 the entry cost's sign; b31 M BY MONTH's 68 days; b36 B2's
  "alone"; b58 R2's tape-minus-book gap; b61 the tape's next hour; b62 which
  positions the rehearsal leaves; b63 and b64 WITHHELD at 10% and TOO FEW at
  20 days.
- The look and the freeze tool (11): b22 a second look not refused; b23 step 1's
  hash not held; b25 which SIZING positions are priced again; b26 M not held to
  `sizing.json`; b33 and b34 R5's two sides; b52 and b53 a book file listed
  missing; b68 THE LATE COINS; b43 and b44 the freeze tool's R3 (i) threshold
  and torn last line.

*Survived (13 and one equivalent):*

| id | the break | why it matters | the pin |
|---|---|---|---|
| b24 | the report written before the result | R7's order is unpinned (M1) | the `log` hook test, 12 lines; proved to kill it |
| b39, b59 | the sealed SIZING file may hold fewer positions than SIZING has | a missing line would drop a position from the SIZING line silently (`look.ts:279`) | drop the last line of the sealed file in the look test; expect `StoreError` |
| b37, b38 | the previous hour's book: read only when x's file is missing; `booksOf` leaves it out | the glue is unpinned and about 5 legs of the look take it (L3 (c)) | a leg at HH:00:03 whose file starts after x, the hour before's file holding a live book: expect the book, its file in the leg, both keys in `books-needed.txt` |
| b40, b41 | exit 4 → 3, exit 5 → 6 | the supervisor reads these codes | `exitCodeOf(err)` in `run.ts`, a unit test (L3 (a)) |
| b42 | `--final` accepts a dirty tree | the freeze tool's refusals have no test (L3 (b)) | extract the refusals as a function of (status, files present) and test them |
| b67 | a tape record of size 0 or price 0 becomes a level | the guard in `levelsOf` is tested only on its happy path | a tape with one zero-size record |
| b51, b56, b65, b66 | a BASE for the SIZING line's repriced positions; the excess's lower bound with +; the five busiest days as four; R9's quarter-hour as ten minutes | print-only lines beside; none decides | one assertion each in `waveh-report.test.ts` |
| b69 | the tape's per-file coin pre-filter | equivalent: `tapeAt` filters again | none; the filter is speed only |

## How the structure fits later phases (notes; no code for them)

- **What is reusable as it stands.** The venue-specific part is small and
  separate: `lz4.ts`, `store.ts`, `fills.ts`, `books.ts`, `ctxs.ts`,
  `funding.ts`, `coins.ts` and `gate.ts`'s key dates. Everything after `Counted`,
  `Book`, `Trade` and `Market` is venue-free: `slices`, `positions`, the walks
  and `pricePosition` in `price.ts`, `verdict`, `report`. A test of the same wave
  on another venue's archive (WAVE-ELSEWHERE) or the on-chain project's reuse of
  Hyperliquid's files can import them as they are.
- **Frozen means unmovable.** After WAVE-H's freeze, anything a later program
  imports from `src/waveh/` is locked by WAVE-H's list too. A later program
  should import only what it needs and say so in its own freeze closure; shared
  logic that will change belongs in new, unfrozen code with the same
  hash-equality test as `waveh-freeze.test.ts`.
- **The coupling that bites.** Ten MARKET-1 and paper files are WAVE-H's frozen
  closure (R4). MARKET-1's second arm (about 2026-11-20) and v1 must not edit
  them between the freeze and the look; `waveh-freeze.test.ts` fails in the
  session that does, which is the right place. After the look the coupling
  ends.
- **Three copies of one gate.** `gate.ts` is the third copy of the paper
  experiment's and MARKET-1's freeze verifier (`filesUnder`, `frozenFiles`,
  `verifyFreeze`, `Gate`, `gateOf`), and `waveh-freeze.cjs` the third copy of
  the freeze tool. Frozen code cannot be refactored, so the copies are right
  now; the next program should start from one shared freeze helper written in
  new code.
- **One package, four programs.** `apps/poller` holds the collector, the paper
  experiment, MARKET-1 and WAVE-H; their frozen paths (`dist/paper.js`, …) are in
  hashes, so none of them can move to another package. v1's API and web belong
  in new packages that read only documented interfaces.
- **Operations for a one-shot.** What a later one-shot program (another venue's
  look, the on-chain look) would want from this one: the two-step shape with a
  hash held between the steps, the sealed outcomes held by hash, and the
  result-before-outcome write order are right to keep; M1 and M2 above are the
  parts to harden first.

## Questions, with recommendations

- **Q1 — Read the marks and the funding at step 1 (M2)?** Recommend yes: it is
  a counts-only addition to H15's step 1, minutes of work, and it is the one
  place a data defect can still be repaired before a verdict exists. Do it with
  H10's change.
- **Q2 — Split `rehearse.ts` now (L7)?** Recommend yes, as a pure move in the
  fix round, because after the freeze nothing moves and a later program that
  reuses the layer would import a file named for a command.
- **Q3 — Keep the tape for every leg at the look (N2)?** Recommend keep: it
  costs 1.5–2 hours and gives R2's tape-minus-book gap for the Final review.
- **Q4 — Keep `seen` as it is (N1)?** Recommend keep.
- **Q5 — The crash-after-result rule (M1 (c)).** Recommend the sentence as
  worded: a missing report is completed by one more step 2 that must reproduce
  the same hash and verdict.
- **The order I would take in the fix round.** (1) The pure move of L7, so no
  later change collides with it; (2) H10's change and M2 in the same reader;
  (3) M1, L1, L2, L4, L5, L12; (4) the pins of L3 and the survivors' table, and
  the test for L9; (5) `pnpm verify`, the 14 breaks again (`checks/breaks*.mjs`
  run them in a scratch copy; the survivors must now die, b69 stays), the third
  rehearsal (M = 147), the draft list again.
