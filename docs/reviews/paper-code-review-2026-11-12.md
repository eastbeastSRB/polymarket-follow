# PAPER-CODE-REVIEW — the Final review of the paper experiment's code, before the freeze

PAPER-CODE-REVIEW (Sonnet 5.5, max, a different model from the builder's),
2026-11-12 15:25Z – 17:55Z (UTC; every stamp from `date -u`; the work stood
still between 15:57Z and 17:42Z while the usage limit reset), for
polymarket-follow's supervisor. Under review: PAPER-BUILD's commits `51724ca`
… `3518a76` as they stand at `8200924` (HEAD did not move while I worked; the
only change in the tree was PAPER-RULES-REVIEW's untracked report):
`apps/poller/src/paper.ts` and `src/paper/` (22 files,
4,393 lines with `paper.ts`), the client changes in `src/api/`, `lock.ts`,
`log.ts`, `index.ts`, the vendored `research/` (only as the program uses it),
`tools/deploy.ps1`, `register-tasks.ps1`, `task-access.ps1`,
`paper-freeze.cjs`, `poller.env`, and the tests `test/paper-*.ts` (3,598
lines with the synthetic world). PAPER-RULES-REVIEW checks the rules against
the code at the same time; three findings below (H1's band, M2, M3) are also
rules-against-code and may appear in both reports. **A review decides
nothing.** Evidence: the supervisor folder `workers/PAPER-CODE-REVIEW/`
(`progress.md`, `checks/`).

**The limits held.** Nothing stamped at or after 2026-11-07T00:00Z was read;
the collector's recordings, database and run folder were never opened; no call
was made to Polymarket's API; nothing was deployed or registered and Task
Scheduler was not touched (the scripts were only parsed, and
`Get-DailyUtcStart` was evaluated in memory). The repository was not written
but for this report: every build, test run and deliberate break was done in a
scratch copy (`git archive` of `8200924` in the scratchpad, its
`node_modules` linked read only, its own test cache). PAPER-BUILD's folder was
not opened; no agent was started; polymarket-lab was not touched.

## For the owner, in one page

*Words.* The **look** is the program step that, three times, turns the paper
copies into "keep", "drop" or "too few to tell". The **freeze** is the moment
the rules and the program are locked by a fingerprint. A **deliberate break**:
I changed the code in a scratch copy in one small way (a wrong limit, a
missing check) and ran every test; a break that no test notices shows a number
or a rule that nothing guards.

**Verdict: after these fixes.** It is not a rework. The program does what the
rules say, `pnpm verify`'s four steps are clean in my scratch copy (build and
type check, 249 tests, lint, format), and nothing I looked at can trade, call a private
route, send your name, or read a day it should not. But one number the look
prints is wrong, the look has no test at all, and a few things can only be
fixed cheaply **before** the freeze: afterwards every change to the program
needs its own decisions entry.

**What is in order.**
- Only four public read routes are asked for, one at a time, at 120 tokens a
  minute and 15 in 5 s beside the collector's 50 and 30; the night window is
  checked before every request; a 429 backs off; five failed reads in a row end
  a run.
- The blind gate cannot be got round in the code: every request passes it, a
  closed gate sends nothing, and each way a freeze can be wrong (no list, a
  changed file, a file left out, an extra file) is tested.
- A second run on the same day changes nothing: I ran one over the test world
  (no request, the state byte for byte the same, the day's log gets a second
  line).
- The collector behaves as before apart from the name it announces
  (`data-collector/1.0`); no project or personal name is in any header, URL or
  query, REST or WebSocket.
- The deploy for the experiment writes its own folder (and one line in the
  shared deploy log) and cannot touch the collector's run copy; the task
  triggers are computed from UTC (04:00Z and 05:20Z came out right in memory),
  IgnoreNew, 36 hours, priority 7.
- Little "slop": comments mostly earn their place and names mostly say what
  things are (L7). About 190 of the 4,393 lines never run in production (L1,
  L2).

**What must change first** (details below):
1. **One number in the look report is wrong** (H1): the Student-t band beside
   the verdict is always zero. It decides nothing, but it is in `result.json`.
2. **The look has no test, and cannot be given one as it is written** (H2).
   It is the only thing that produces your verdict.
3. **The favourites file can break every run after the freeze** (M1): one
   pasted address in the mixed capitals the API writes, or a typo, and the
   program stops each morning; the file is locked by the freeze. Also, a favourite
   from the holdout is not refused (M2).
4. **The daily page never shows a verdict after a look** (M3).
5. **The deploy does not check the freeze** (M4): a mismatch shows only at the
   first 04:00Z run.
6. **Write the day's record before the page** (M5), pin what the tests miss
   (M6), and remove the code that never runs (L1) while it is still cheap.

**What I could not check.** The program at full scale (1,602 accounts, 26
weeks): the build's rehearsal took 12.6 s, nothing here measures the late
weeks. The live API, the WebSocket with the new name, Task Scheduler's real
behaviour, and how many documents the collector's `rulebook` holds (I may not
open the database; question Q4).

## Findings

Severity as the brief fixes it. Line numbers are at `8200924`.

### High

**H1 — The Student-t band printed beside every look is always zero.**
`summary.ts:178-182` (`normalUpper`, :273). `tCritical(p, df)` wants the
two-sided p, but the code passes `2 * (1 - normalUpper(z))`, and `normalUpper`
is the *upper* tail: p comes out 1.995 / 1.985 / 1.970, and the t value is 0.
Seen live: I ran `lookReport` over the end-to-end test world's copies and
`tBandHalfWidth` was 1.5e-56 at all three looks (`checks/tband.mjs`: the right
p gives t = 3.59 / 2.94 / 2.87 at z 2.81 and 10 / 50 / 100 degrees of freedom).
No test touches it. R14 prints this band "beside, deciding nothing", so keep
and drop are not affected; the number in `result.json` is. **Fix:**
`kit.stats.tCritical(2 * normalUpper(z), Math.max(1, m.days - 1))`, and decide
the error it multiplies: R14 says "on the day clusters" (`m.seDay`), the code
uses the two-way `m.se` (question Q6). Pin it in a test.

**H2 — The code that produces the verdict has no test, and cannot get one as
written.** `look.ts` (whole file) and `summary.ts:122-270` (`lookReport`). No
test imports either. All ten deliberate breaks I made in them passed the
suite: a look that can run twice, run before its Monday, never wait for
unfinished reads, forget "after the verdict"; a report that counts copies not
yet voted, uses the first look's limit for every look, mis-counts the unpriced
share (which decides WITHHELD), passes a wrong d to KEEP, flips the drawdown,
or counts copies a week over 30 days (`checks/mutants2.out`). H1 is one bug
found by reading; reading found no other: I recomputed the report's mean,
voted count, copies a week, e-value, smallest edge and the look-3 sentence by
hand over the test world and they agree. The cause is that `look()` opens
MongoDB and the package folder itself (`look.ts:48, 68-73`) and takes no
`DailyIo`, so the end-to-end world that tests `daily()` cannot drive it.
**Fix:** give `look()` `daily()`'s `io` (package folder, rule-book documents,
fixed inputs) and add tests in the end-to-end style: the refusals (no freeze →
4; a second run → 5; before its Monday → 5; unread accounts or missing
market-days → it waits, and runs after a week), a ready look's `result.json`
over the world (the voted set, its own look's z, the verdict worked by hand),
`afterTheVerdict`; and each `lookReport` figure against independent code.

### Medium

**M1 — A mistake in `favourites.txt` stops every run after the freeze.**
`daily.ts:82-103` (the strict test at :96, the 20 at :95); `paper-freeze.cjs`
never reads the file. A mixed-case address (the form the API returns, code-rules) throws "at most 20 lower-case addresses" (`checks/favourites.mjs`), at
the first run after the freeze, on every run, and the file is frozen by hash:
the repair is a new freeze. Nothing checks either that F0 lies between the cut
and now. **Fix:** `paper-freeze.cjs --final` parses `experiment/favourites.txt`
with the program's own `readFavourites` (it already imports `gate.js`) and
refuses on an error, F0 before the cut or in the future; and `readFavourites`
lower-cases (code-rules: addresses are stored lower-case) so a pasted address
works.

**M2 — A holdout account among the favourites is read and scored.**
`daily.ts:125-160` (only the pool drops the holdout, :142-145), `:514-522`;
rules.md:66-68 says it joins only after D1 is scored. Run on a list of one
holdout and one pool account (`checks/favourites.mjs`): both accepted, the
holdout not in the pool, so it would be read from F0. It is post-cut data, so
the blind store is not touched, but R2 is not in the code. **Fix:** refuse it
in `fixedInputs` with the address in the message, and test it.

**M3 — After a look the daily page still says "Too early to judge".**
`daily.ts:329` (`verdict: null` always); nothing in `daily.ts` or `page.ts`
reads `looks/L*/result.json`; rules.md:317-318 (R15) wants the verdict line and
its sentence. The "next look" is chosen by END (`daily.ts:269`), so on
2026-12-20 and 21, before L1 has run, the page already says "next look
2027-02-06". `page.ts:127` prints `verdict` without `esc`. **Fix:** read the
latest look's MAIN verdict and sentence into `PageData.verdict` (escaped) and
pick the next look as the first one whose `result.json` is missing — or amend
R15 before the freeze (question Q1).

**M4 — Nothing checks the freeze between the freeze and the first run.**
`deploy.ps1:121-156`: the experiment's smoke starts the copy without settings
(exit 2) and checks the kit; it never runs the copy's own gate.
`paper-freeze.cjs:57-65`: `--final` writes the list from a dirty tree and only
adds "(the tree was not clean)" to a comment line; nothing checks that `dist/`
was built from HEAD. A list that does not match what the deploy rebuilds shows
itself as exit 4 at the first 04:00Z run, and that morning's reading is
wasted. **Fix:** `--final` refuses a dirty tree; the
experiment's smoke runs `verifyFreeze` on the new copy when
`experiment\FROZEN.sha256` exists and keeps the old copy on a mismatch.

**M5 — The page is written before the day's record.** `daily.ts:465-496`: the
two page files, then the positions log, the day's log line, the manifest, and
(:498-505) the backup. On Windows a page file held open by another program
makes the rename throw; the run exits 1 after reading and saving the state, but
without that day's positions log, log line, manifest and backup — against
decisions 2026-11-12 (8), "the honest record first". Also invisible: the
backup's failure is only a pino line (:503-505), and `Recorder.counts.dropped`
(raw replies not stored when the raw disk refuses them) is never read.
**Fix:** record, manifest and backup first; the page last, in its own
try/catch with one line in `lacks`; put the backup's result and the recorder's
`dropped` in the day's log line.

**M6 — The suite lets 56 of 120 deliberate breaks through.** Those that guard
the owner's numbers or the collector are listed in "What the tests missed"
below; the full list is `checks/mutants1-3.out`. Fix them with the tests named
there, in the same pass as H2.

### Low

**L1 — Code in the frozen scope that never runs in production** (about 150
lines; the freeze hashes all of it). `routes.ts:109` `parseFillRows` (a test
calls it; `readFills` does its own checking at `reader.ts:101-111`; the
comment at `routes.ts:26` still names it as the page's check);
`market.ts:54` `copyPrecutPanel` (called nowhere); `seed.ts:24-137`
`buildSeed`, `captureFile`, `readCapture`, `SeedBlindError`, `CaptureRoots`,
`SEED_MANIFEST` (the one-off seed build and its tests; production uses only
`loadSeed` and `readManifest`); `rulebook.ts:98` `EMPTY_RULE_BOOK` and
`gate.ts:18` `CLOSED` (tests only); `score.ts:109, 189-192` `ScoreInput.start`
and `page.ts:47-48, 121` `PageData.rehearsal` (only the old-weeks rehearsal
passes them). **Fix:** delete the dead, move the test-only constants into the
tests and the builders into `tools/` or PAPER-BUILD's folder; keep
`start`/`rehearsal` only if the reproduction is to be re-run after a defect fix
(question Q2). Cheap now, a decisions entry later.

**L2 — Types for kit members nobody calls.** `research.ts:217-350` types
`competition`, `constants`, `fills.validFill/readAccount/BlindStoreError`,
`entries.median`, `labels.LABEL_DAYS/HABIT_DAYS/mondays`,
`panel.MAX_STALE_MINUTES/marketFrom/tradesAt/fundingBetween`,
`exits.OPEN_EPS/planCopy/unpricedReason`, `returns.leg`, and `:386` loads
`kit/competition.mjs`, none used by the program (tests use a few). Type what
runs.

**L3 — The settings are declared three times, the database name twice.**
`paper.ts:23-28` (`Settings`), `run.ts:31-35` (`PaperConfig`), `daily.ts:51-56`
(`DailyConfig`); `paper.ts:25-27` writes the two database names as literals
beside `DB_NAMES`/`checkDbName` (`store/db.ts:19-28`), which `rulebook.ts:252`
applies again. One schema with `MONGO_*` in it and `DailyConfig = Pick<…>`.

**L4 — An unknown account costs three reads.** `jobs/paging.ts:43-50` treats
every `http_error` as worth another try, so the 400 "account not found" is read
three times (30 tokens, a back-off that reaches 4 s) before it becomes a
standing hole (`loop.ts:164-173`). Once per unknown address; accept, or stop after a 400 in
`paperRequest`.

**L5 — The look report.** `summary.ts:170-176`: the day that moves the mean
most is printed as epoch milliseconds (`"1794873600000"`), not a date;
`:145-154`: every line gets a verdict although R12 says only MAIN decides —
null or label the others.

**L6 — Facts written twice.** The kit's fingerprint at `deploy.ps1:39` (and
`research.ts:14`, rules.md); the cut and the three look dates as prose at
`page.ts:122` beside `instants.ts`; `COLLECTOR_SHARE` 50 and `PAPER_LIMITS`
120/15 with nothing that adds them up.

**L7 — Names and size.** `run.ts` is process mechanics (config, lock,
heartbeat) beside `daily.ts` (the run): `process.ts`. `summary.ts` serves both
the page and the look. `coverage.ts` is one 12-line function. `daily.ts` (530
lines) holds the inputs, the cache, the markets, the page's data and the run;
split when the next arm needs the inputs, not now.

**L8 — Churn.** `store.saveState` rewrites `state.json` whole after every
account (my estimate: about 1,600 writes of ~200 KB on a Monday) and the
manifest gets a line for each (`store.ts:82-93`): the day's manifest holds `state.json` 1,600
times; keep the last line per path. `store.ts:142` sorts rows that
`accountData` sorts again.

**L9 — Small robustness.** `reparse.ts:36-46` reads a stored line with a cast
and `JSON.parse`, not Zod; a cut line stops the whole command. `store.ts:74-78`
`writeAtomic` does not flush: after a power cut `state.json` can be empty and
every run stops until it is restored from E:. `run.ts:76`: the lock's heartbeat
runs on the event loop that `score()` and `weekList` block; if they ever run
over two minutes, a hand-started second process would take the lock (the task
itself is IgnoreNew).

**L10 — Test hygiene.** `paper-daily.test.ts` is one 300-line `it` (it has to
run in order; name its steps); `paper-world.ts:79` exports `answer`, used
nowhere else; `stats` tests take their expected values from the production
constants (`DROP_BPS`, `LOOK_Z`) — see M6.

**L11 — Registering the paper task re-registers the collector's three.**
`register-tasks.ps1` replaces all four and starts the poller task again (its
header explains). It is the documented procedure, but a `-Only paper` switch
would add the experiment without touching the collector.

## What the tests missed

Of 120 deliberate breaks in the scratch copy, 64 failed a test and 56 passed.
Six of the 56 change no behaviour (`PAPER_LIMITS` 121 or 16, because every
weight is a multiple of 5; `marketsThrough` with `<=`; the second sort; the
empty-list guard at `gate.ts:85`, which can never fire; the word "missing"
for "changed" in a message). The rest, by what they guard:

| A break that passes | Where | Why it matters |
|---|---|---|
| the drop line +10 → +11 bps | `stats.ts:17` | the tests use `DROP_BPS` as their own expected value; no literal 10 anywhere |
| the freeze scope without `research`, or without `experiment` | `gate.ts:37-42` | only `dist/paper/` has an "extra file" case; a missing listed file is untested |
| the paper writes the poller's `heartbeat.json` | `run.ts:21` | the lock's name is checked against `poller.lock`, the heartbeat's only against its own constant; a slip would keep a dead poller looking alive |
| any HTTP 400 becomes "account not found", a permanent hole; a dropped (budget) request counted as a failure, not the pause | `reader.ts:52, 50` | the text test is missing; the second is nearly unreachable |
| 1,000 rejected rows no longer stop a run | `loop.ts:35, 193` | |
| "five in a row" never resets | `loop.ts:163, 261` | five scattered failures would end a run |
| a week with a missing market-day is skipped, not read again | `loop.ts:215-222` | "read again next run" is untested |
| the standing hole is not saved at once | `loop.ts:172` | |
| the backup compares size only; `looks` not backed up | `backup.ts:50-54, 26` | a changed `state.json` often keeps its size; the look's result is the verdict |
| the pre-cut panel is not checked against its pin; the kit fingerprint not compared | `market.ts:84-87`, `research.ts` | every price stands on them |
| STOP 2 % / 5 %, DAYS7, JUMP wiring; an entry price without the spread | `score.ts:382-385, 335` | the functions are tested, their wiring and the displayed price are not |
| habit window 30 → 29 days; a fill at exactly the Monday counted as "before" it | `account.ts:91, 61-70` | |
| boundaries: an entry at END, a gap hole's edge, a competition's last instant, a copy open at M | `score.ts` | |
| Monday cache never saved; 21 favourites accepted; "data through"; page 500 rows; the 36 h note | `daily.ts:429, 95`, `page.ts` | |
| the collector's burst cap 30 → 31 | `admission.ts:13` | the tests import `BURST_CAP`; no literal 30 |
| the whole look (ten breaks) | `look.ts`, `summary.ts` | H2 |

## Checked and in order, by the brief's seven points

1. **The collector stays equal.** Changed in the client: the User-Agent; the
   constructor takes routes and limits (the collector's: its ten routes,
   `COLLECTOR_LIMITS` = 50 and `BURST_CAP` 30 — the same values the old code
   used inline); `admissionDelay` takes the burst as an argument (30 for the
   collector, identical arithmetic); `JSON.parse(text, undefined)` for its
   routes; a non-429 HTTP error now also returns `status` and `text` (no
   collector caller reads them); the constructor refuses a route heavier than
   its limits (none is); `createLog(…, "poller")` writes the same file names;
   `takeLock`'s default files are the poller's; `once.ts` (a live-check tool)
   is gone and nothing refers to it. No other collector source changed (`git
   diff --stat`). The unchanged tests (admission, night peaks 49 / 12,
   rest-client back-off) pass with only their signatures updated. **One thing
   the tests cannot show:** the WebSocket handshake with `data-collector/1.0`
   has not been used live (the paper's REST name `data-reader/1.0` has, 777
   calls, all 200). After the collector's deploy, look at the heartbeat's
   connections (`book-1`, `trades-1`) for a few minutes before leaving it.
2. **No name leaves the machine.** Headers are `user-agent` and `accept`; the
   URLs and queries carry addresses, instrument ids, intervals and instants;
   the tests scan the user name and the host name too, REST and WebSocket. The
   project's name is in `src/` once, as the local database's application name
   (`store/db.ts:123`), which the existing test allows.
3. **The Iron Rules.** Only four `GET /v1/info/` routes, refused otherwise at
   construction and at call; `redirect: "error"`; a scan finds no POST, PUT,
   PATCH, DELETE under `src/`; no credential anywhere (`poller.env` holds
   folders and a local database). Every reply and every stored file is
   Zod-parsed where it enters (the one cast: `reparse.ts:36`). The night
   window is checked before every send and 15 s ahead (`rest-client.ts:155,
   220`) and tested through the loop. **Budget across the two clients:** the
   shares add to 170 of 250 a minute; the bursts add to 45 against "never more
   than 30 in a burst, all callers together" — the collector's measured peak
   is 12, so the real sum stays under 30, but nothing in the code adds the two
   (question Q5).
4. **The run's safety.** *Lock:* its own files; a live holder with a fresh
   heartbeat refuses (exit 3), tested. *State:* written whole to a temporary
   name and renamed, saved after every account; a crash between the rows file
   and `state.json` only repeats a read (rows are de-duplicated). *Resume:*
   the pause and the resume equal one run without the pause, copy for copy
   (tested); a crash leaves the same state. *Second run, same day:* verified,
   see above. *The breaker:* five failed reads in a row; the schema alarm.
   *A 429:* the client backs off 2 s, doubling to 60 s, three tries a read.
   *Disk full or a locked file:* the write throws, the crash handler logs and
   exits 1, the old file stands; a day's reading is kept but see M5 and L9.
   *A missed week:* the same weekly loop as the first run (tested over 18
   days). *Reads and scoring are separate:* a scoring failure leaves the
   reading of every day intact. *Backup:* copies what cannot be read again,
   by hash, never deletes; its failure is only logged (M5).
5. **Deploy and tasks.** `-Program paper` uses `paper`, `paper.next`,
   `paper.old` beside the collector's `poller…`, never stops or starts a task
   and refuses while its own task runs; the only shared things are the
   repository build and one appended line in `var\deploy.log`. A hand-started
   run in `paper\` should stop the rename (retried 10 s, nothing swapped; by
   the script's own reasoning, not run). Task:
   `node.exe` itself, S4U, Limited, `-Daily -At (Get-DailyUtcStart 4)`,
   `StartWhenAvailable`, `IgnoreNew`, 36 hours, priority 7. Weak: M4, L11.
6. **The blind gate.** `daily.ts:420` is the only place a gate is opened, after
   the freeze check; `reader.ts:35` is the only caller of `client.get` in
   `src/paper/`; every query carries an `end_timestamp` equal to or inside the
   checked window; a window ending at the cut is allowed, one reaching past it
   is refused with nothing sent. The window passed to the gate is stated
   beside the query, not read from it — fine today, a place to harden later.
   Tests: the closed gate, no list, a changed file, a file left out, an extra
   file in `dist/paper/`. Missing: the other two scope entries (M6).
7. **The tests.** 249 pass; they are real (synthetic worlds, a seeded random
   differential test of `planCopyThrough` against the vendored `planCopy`, an
   end-to-end `daily()`), and test what decides in the scorer, the statistics
   and the loop. They miss the look (H2) and the items in the table above.
   Helpers: nothing dead but `answer`'s export.

## How the structure fits the later phases (notes, no code)

- **One package, two entry points** suits the planned layout: `RestClient`
  with a route table, share, burst and User-Agent per instance is the right
  seam for v1's live reads. When `packages/shared` exists, the schemas of the
  experiment's stored files (`State`, `StoredRow`, `MarketDay`, the page data)
  and its constants (`CUT`, `LOOK_ENDS`, `LOOK_Z`, `DROP_BPS`) move there.
  `CopyRecord`, what the positions log holds, has no schema (it is
  `JSON.stringify` of the in-memory record): v1's api needs one when it reads
  the log, not before.
- **The budget** is three constants in three places. With D1, D2 and v1's live
  reads asking for "the remaining 80 a minute", one table of callers with their
  share and burst, and a test that the sum is at most 250, becomes worth having
  — when the third client arrives.
- **New arms** (D1, D2, MAKER, VWAP, a wider universe) will edit frozen files:
  `LINES` is fixed in `score.ts:33` and the page's titles in `daily.ts`, and the
  freeze is one list over all of `dist/paper/`. Any such arm means a new list
  for everything, and "the frozen arms run on unchanged" can then be shown only
  by their outputs staying equal on the old weeks (the reproduction), not by the
  hash. Plan new arms as new files that import the frozen modules unchanged,
  with their own list that `verifyFreeze` also accepts. The universe is
  hard-wired to the kit's `population.json`; a wider one needs its own input.
- **`DailyIo` is the right test seam**; `look()` and `reparse` need the same
  (H2).
- **The experiment's run copy is isolated** from later repository work — good
  for v1 — but the shared files it imports (client, Recorder, lock, log) come
  from whichever commit is deployed and are hashed for information only (R0):
  a v1 refactor of `rest-client.ts` reaches the experiment at its next deploy.
  The daily log's `shared` hashes show it; keep that client's behaviour stable.
- **The page** is a string template over a plain `PageData`; when v1's web
  replaces it, `PageData` is the contract to keep.
- **Growth by May 2027:** about 25,000 copies; `positions.html` ~10 MB, the
  positions log ~3 MB a day gzipped, `readRuleBook` reads every document of
  five kinds on each run and look (Q4). All fine at that size.

## Questions, each with my recommendation

- **Q1 — R15's verdict box: build it or amend the rule?** Build it (M3): about
  15 lines and a test, before the freeze.
- **Q2 — Which build-only code stays in the frozen scope (L1)?** Delete the
  dead, move the builders out of `src/`, and keep `start`/`rehearsal` only if
  the old-weeks reproduction is to be re-run after a defect fix (R0 asks for a
  test that failed before the fix; the reproduction would serve). Your call.
- **Q3 — Give `look()` the same `io` as `daily()`?** Yes (H2).
- **Q4 — How many documents does `rulebook` hold, by kind?** I may not open
  the database. `instruments/list` is stored on any change to any of 90
  markets' fields; if the count runs into thousands, read the latest per kind
  and key plus the fee and competition history, not everything, at
  `rulebook.ts:245-260`. The supervisor can count them once.
- **Q5 — Accept 30 + 15 = 45 for the bursts?** Accept, and write the real rule
  in code-rules ("collector 30, experiment 15; the measured bucket is ~90-100,
  the collector's real peak 12"). Lowering the collector's cap would change the
  collector.
- **Q6 — The Student-t band: which error?** The day clusters' (`m.seDay`),
  as R14 says.
- **Q7 — Lower-case addresses in `readFavourites`, or only refuse at the
  freeze?** Both (M1).

## Evidence

`workers/PAPER-CODE-REVIEW/`: `progress.md`; `checks/harness.mjs` (the
deliberate-break harness, scratch copy only), `mutants1-3.mjs` and their
`.out`; `tband.mjs`; `favourites.mjs`; `holdout.mjs` (the seed manifest lists
exactly the 1,602 pool accounts, none of the 100 holdout); and the two
generators of the scratch-only tests behind "a second run changes nothing" and
the `lookReport` sanity run (`make-second-run-test.mjs`,
`make-look-test.mjs`). Also checked: the draft freeze list (60 files) equals
the repository's files, and a build in another folder gives the same hashes
for all 23 `dist` files (the build is deterministic and path independent); `deploy.ps1`, `register-tasks.ps1`,
`task-access.ps1`, `poller-task.ps1` and `poller-check.ps1` parse without
errors.
