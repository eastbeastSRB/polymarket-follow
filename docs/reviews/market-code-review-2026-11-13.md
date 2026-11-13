# MARKET-CODE-REVIEW — the Final review of MARKET-1's code, before the freeze

MARKET-CODE-REVIEW (Sonnet 5.5, max, a different model from the builder's
Opus), 2026-11-13, for polymarket-follow's supervisor (UTC; every stamp from
`date -u`). Two sessions of this name worked on it: the first, from 09:21Z,
stopped at about 09:49Z when the session's sign-in failed; I took over at
10:06Z on the same brief and re-confirmed each of its findings before it went
in (its F-A and F-B are M1 and M2 below). Under review: MARKET-BUILD's commits
`79b3984` … `137dfc7` as they stand at `137dfc7` (the code did not move: the
only commits after it are the two reviews' reports, and the tree was clean
while I read and ran it): `apps/poller/src/market1.ts` and `src/market1/` (17
files, 3,358 lines), `tools/market1-freeze.cjs`, the MARKET-1 parts of
`tools/deploy.ps1` and `tools/register-tasks.ps1`, `tools/poller.env`,
`scripts/market1-reproduce.ts`, and the tests `test/market1-*.ts` (9 files,
2,959 lines, 50 tests). `market1/rules.md` is the frame; MARKET-RULES-REVIEW
checks the rules against the code at the same time, so a finding that is also
rules-against-code may appear in both reports. **A review decides nothing.**
Evidence: the supervisor folder `workers/MARKET-CODE-REVIEW/` (`progress.md`,
`checks/`).

**The limits held.** I never opened the collector's recordings, its database,
the run folder (`E:\polymarket-follow-run\`) or the paper experiment's new data
(`fills`, `raw`, `state.json`, `page`), and took no count from them. No call to
any API; no deploy, no Task Scheduler (the two PowerShell scripts were only
parsed, and their per-program names and `Get-DailyUtcStart` evaluated in
memory). No MARKET-1, paper or poller command ran against a real path: I ran
the built program only on scratch folders, with the database address pointing
at a closed port. Every build, test run, probe and deliberate break was in a
scratch copy (`git archive` of `137dfc7`; a second for probes; a third with its
own `git init` for the freeze tool), `node_modules` linked, nothing deleted
recursively. Pre-cut data was read for two re-runs only (the seed's 1,602
files, the kit's panel and labels, copies in the first session's scratchpad).
MARKET-BUILD's folder was read only (its break lists). No agent was started;
polymarket-lab was not touched; the repository changed by this file alone.

## For the owner, in one page

*Words.* The **freeze** locks the program and the rules by a fingerprint;
MARKET-1 reads nothing after the cut unless it verifies. A **look** is the step
that, three times, turns the paper positions into "keep", "drop" or "too few to
tell". A **deliberate break** is a one-line change I make in a scratch copy (a
wrong limit, a check removed) before running every test; a break that no test
notices — a **survivor** — shows a rule or a guard that nothing guards. A
**pin** is a small test that fixes one such value or guard.

**Verdict: after these fixes.** It is not a rework. In a scratch copy of HEAD
the four steps of `pnpm verify` are green (build, type check with the tests,
329 tests, lint, format). The paper experiment's freeze verifies on a fresh
build (61 files, `d04d3cd8…f31c`), and no source of the collector or of the
paper experiment has changed since `paper-freeze-1`: the build added files and
touched nothing else under `src/`. The draft freeze list is exactly this code
(64 files) and the freeze tool reproduces it. Nothing in the program can trade,
make a request to any API, write into the paper experiment's or the
collector's folders, or send a name outside this PC. I re-ran the builder's
bridge rehearsal and the reproduction on the old weeks myself: they give the
builder's numbers (1,362 of 1,363 positions equal to 1e-9 bps; WAVE +309.7 ±
67.7 on 153 entries). The code is good: little slop, a clear shape, pure
rules, and a real world of synthetic recordings written by the collector's own
recorder. What is wrong is small and sits in two places: two defects in frozen
code that cost one line each now and a new freeze later, and tests that do not
guard what you asked me to look at.

**What is in order.**
- **The two live programs.** Nothing MARKET-1 does writes under the paper
  experiment's folder or the recordings; every write goes to its own folder,
  its backup, or its own lock, heartbeat and log, under names that are not the
  collector's or the paper's. It reads the paper experiment's files only after
  its lock and heartbeat say the run is over, one whole file at a time, no
  handle kept. `deploy.ps1 -Program market1` and `register-tasks.ps1
  -Market1Only` can touch only `market1`, `market1.next`, `market1.old` and one
  task; the default and `-PaperOnly` paths are unchanged.
- **The seal.** The gate opens in two places, both after the freeze check
  returned; every reader of the recordings, the rule book and the paper
  experiment's files takes it and refuses first; a changed, missing or unlisted
  file, a missing paper file and a missing scope are each refused and tested.
- **Cost.** A day's check measured at 0.5 minutes (60,000 lines an hour) to 2.9
  minutes (300,000 lines an hour); the builder's 2.6 minutes stands. Reading
  the pool's fills for 68 days takes 6 seconds, about 16 at six months, so no
  stretch starves the lock's heartbeat.
- **The run.** Atomic whole-file writes with a retry, a record kept once per
  closed day, legs decided once and kept with their book line, files named by
  the run's time, a second run the same day tested, a crash leaves a lock that
  the next run takes (I probed it), the 6-hour wait for the paper run tested.

**What must change first** (details below):
1. **The page says "the rules were frozen on unknown"** (M1): one lost
   backslash in `daily.ts:492`. Certain, one character, and a new freeze if
   left until later.
2. **One regex ties every price to the server's JSON spacing** (M2,
   `recordings.ts:350`): a space after one colon would turn every leg into a
   mark-priced one without any check noticing. Unlikely, free to remove now.
3. **The look is the only step that issues your verdict, and its gates and its
   wiring are not tested** (M3, M4): the look's freeze check and its wait for
   the paper run can be deleted and every test passes; so can the numbers it
   hands to the verdict. The code is right as I read it; the guard is missing.
4. **The recordings reader's integrity checks are not tested** (M5): a file
   that changed after its once-only check, an unreadable file, a coverage file
   that differs: 8 breaks survive. The code is right (my five small tests pass
   at HEAD and kill all eight).
5. **Dead and doubled code in frozen files** (L5, L6): cheapest to remove
   before the freeze; I list it line by line.

**What I could not check.** The real frame text (spacing: M2) and a real day's
events, since the recordings are sealed; the collector's real fee schedule and
how many documents its `rulebook` holds (question Q4); the unit of a book
level's size — every walk reads it as base units (`book.ts:57`, `size * price`
is the level's dollars), as the collector's own plan did when it measured
"$1,000 covered", and the rules say so, but no reply of ours is in the
repository to prove it (MARKET-RULES-REVIEW's finding 10: one read of the
spec); Task Scheduler's real behaviour for the new task; the first real run;
anything at the full six-month size beyond the timings above.

## Findings

Severity as the brief fixes it. Line numbers are at `137dfc7`. "Break" ids:
`m…` are the first session's, `r…` mine, `b…` the builder's, all in
`checks/`. Tests lie outside the freeze (`gate.ts` `FROZEN_SCOPE`), so a test
added after it changes nothing; a change to anything under `src/market1/` is a
new list.

*Where this meets MARKET-RULES-REVIEW* (`market-rules-review-2026-11-13.md`,
which I read only after this report was written): its finding 1 is my M1 (it
also has a red test for it); its finding 2 is my M3 and M4 (its breaks of
what `look()` feeds the verdict, the look's freeze check and its wait among
them, and its made-up looks, which give KEEP, DROP, TOO FEW and WITHHELD as the
rules say); its finding 4 is my L7; its finding 8 is my note on the files
outside the list; it re-ran all 75 of the builder's breaks (75 of 75 killed),
where I re-ran 17. In this report alone: the pre-filter's spacing (M2), the
integrity branches (M5), the lock names and the heartbeat's catch (L1), the
dead and doubled code (L5, L6), the cost, the entry point, the tools. In its
report alone: M11's order of WITHHELD and TOO FEW, its wording findings and the
book level's unit (below, under "What I could not check").

### High

None.

### Medium

**M1 — The page's "frozen on" date is always "unknown".** `daily.ts:492`
(`freezeDate`), used at `daily.ts:266`, printed twice at `page.ts:101`. The
pattern is `/^# written (S+)/m`: a literal capital S, not `\S` (a backslash
lost, the failure code-rules already names for a heredoc). The list's second
line is `# written 2026-11-13T…`, so it never matches and the `?? "unknown"`
after it hides the failure: the page prints "Frozen <hash>, unknown. The rules
were frozen on unknown before any MARKET-1 result existed; whatever this page
shows, they do not change" — the one sentence that carries the freeze's
honesty. Reproduced three ways: by reading and `cat -A`, by calling the built
function on the real draft list's head ("unknown"; with `\S+` "2026-11-13"),
and by a failing test (`checks/zz-review-pins.test.ts`, last case). No test
asserts it (break r112 survives; the end-to-end test's list has a dated head
and nothing reads it back). **Fix:** `/^# written (\S+)/m`, written with the
Edit tool; make a missing head line an error, not "unknown" (the list is ours
and was just verified); assert `frozen on 2026-11-20` in the end-to-end page.
Before the freeze.

**M2 — The book lookup depends on how the server spaces its JSON.**
`recordings.ts:350` pre-filters each line of an hour file with
`/"ch":"book::(\d+)"/`, no space allowed; the day check (`:195`) parses every
line with Zod, which does not care. If the server writes `"ch": "book::6"` the
day check says "ok, 0 failed", the alarm stays quiet, and `booksAt` finds no
line for any leg: every leg is "no book line", priced at the mark, and
`assemble.ts:183-199` keeps that decision in `books\` for good. Reproduced on
a synthetic spaced frame (`checks/zz-review-spacing.test.ts`). What the
repository knows: the test world writes compact text; R1's note of the
server's subscribe reply is compact (`{"id":1,"data":[{"status":"ok"},…]}`),
so a spaced frame is unlikely; nothing pins it and I may not open a
recording. A failure would show at once on the first run's page (every leg
flagged "no book line") and cost a re-freeze before look 1. **Fix:**
`/"ch"\s*:\s*"book::(\d+)"/` and a test with a spaced frame; or drop the
pre-filter and take the market from the parsed frame (about 7 s instead of
2.6 s per 300,000-line hour file). If the pre-filter stays, add the number of
lines it matched to the first run's format counts, beside "lines parsed".
Before the freeze.

**M3 — The look's two gates have no test.** `look.ts:54-61` (a changed or
missing frozen file: exit 4, nothing opened) and `look.ts:80-81` (the wait for
a live paper run: exit 5, nothing of it read). Delete either and every test
still passes (breaks r60, r61). The builder's 16 glue breaks tried `daily()`'s
freeze check and wait, never `look()`'s; the look reads the same sealed stores
and writes the verdict. The code is right (read, and the pins below pass at
HEAD). The brief asks a test for each refusal. **Fix:** two cases in
`market1-daily.test.ts`'s world, or the 60-line `checks/zz-review-pins.test.ts`
(with it r60, r61, m60–m64, m62/r93 and m74 die). No freeze impact.

**M4 — The look's wiring into the verdict and its prints is unpinned.**
`look.ts:87-93` readiness (pool read through END, recordings, market-days:
m13, m13d, m14), `:115-117` and `:36` the 7-day wait (m11) and forcing (m13b,
m13c), `:132-140` the verdict's seven inputs — mean, SE, z, mean excess, share
not at the book, days, markets (m80–m85) —, `:141-143` `afterTheVerdict` (m88),
`:158` the sentence's look number (m87), `:170-178` the next look's z (r64),
`:147-149` the hole windows (r65), `:78` the Monday edge (r62), `:136` a null
excess (m57): 18 breaks survive. The only look any test produces is WITHHELD,
from two positions; no test produces KEEP, DROP or TOO FEW through `look()`.
The paper's H2 in another shape: that review could not test its look at all;
this one can, and does not yet. I read every argument at `look.ts:132-140`:
all correct. **Fix:** (a) lift the ten lines `summarize` + `verdict` into one
pure `lookVerdict(kit, wave, z)` in `look.ts` (before the freeze, trivial) and
test KEEP, DROP, TOO FEW and WITHHELD with synthetic positions; or (b) a
second end-to-end world with at least 20 days and 10 markets. Recommended: (a).
Pins before look 1 (2026-12-21), not before the freeze.

**M5 — The recordings reader's integrity branches have no test.**
`recordings.ts:198` (an hour file that matches its manifest but cannot be
decompressed: "unreadable"), `:207`, `:210`, `:223-226` and `:258-259` (a
coverage file missing, differing from its manifest, or holding a line that
does not parse: the whole day is a gap), `:280` (a missing day: its 24 hours),
`:333-341` (**a file that changed after its once-only day check is not read:
its hour is a gap** — the only protection against a file rotting over six
months, since `days\` is checked once and kept) and `:361` (of two lines, the
later `ts` wins): 8 breaks survive (m24b, m54, m72, r21–r25). The code is
right: `checks/zz-review-recordings.test.ts` (5 cases, 100 lines, files written
by hand with real Brotli, manifests and hashes) passes at HEAD and kills all
eight. No freeze impact.

### Low

**L1 — The run's names, limits and the heartbeat's catch are not pinned**
(9 survivors). `run.ts:30-38` the MARKET-1 lock and heartbeat names and the
paper's: change them to the collector's or to each other's and nothing fails
(m60, m61, m63, m64); the tests read the paper's names from MARKET-1's own
constant, so nothing ties them to `paper/run.ts`. `:214-216` the lock's release
(m62). `:191-200` the heartbeat's catch — F2's own requirement ("a heartbeat
whose write fails is logged, never stops the run") — removed: m74. `:138`
`EPERM` read as "alive" (r90): the paper's task runs as S4U and a hand-started
session cannot open its process, so this branch is the one a hand run
meets (the first run is by hand). `:42` the 6 hours (m20), `:43-44` 10 tries a
second apart (m21). **Fix:** the pins in `checks/zz-review-pins.test.ts`
(`PAPER_LOCK` equals `paper/run.ts`'s; the four names differ; a directory in
the heartbeat's place; the lock gone after `close`); a literal 6 h in the wait
test.

**L2 — The recorded fee never meets a test.** `assemble.ts:154-156` (break r40:
ignore the recorded rate, all tests pass) and `daily.ts:181-197` (`feeAlarm`,
m44: never called, all tests pass). The end-to-end rule book is empty, so every
leg takes the kit's 4 bps by the fallback. Today's schedule has no crypto row
(F9), so nothing is wrong; the wiring matters the day the collector records
one. **Fix:** one world with a `fees/schedule` document for crypto at 8 bps;
assert `fees` on a position and the alarm line.

**L3 — Printed numbers with no assertion** (12 survivors): the Student-t band
(`summary.ts:116-119`, m10; its arithmetic is right: t 3.08 at 25 degrees for
z 2.81, where the paper's H1 gave 0), BASE's last minute (`lines.ts:126`,
m40), the 500-row cut (`page.ts:116`, m48), the costliest third
(`summary.ts:132`, r77), the five busiest days (`:215`, r78), the win share
(`:190`, r79), the worst 5% (`:98`, r80), OWN's and S's "at least 5" coins
(`lines.ts:160`, `:179`, r106, r107), the page's band z (`daily.ts:267`, r51),
the coins-left-out record list (`assemble.ts:257`, r44), the page's frozen line
(`page.ts:101`, r112). Each is "beside, deciding nothing", each is a number you
read. **Fix:** pin the ones a rule gives a number to (the 5 coins, the 500
rows, the band at one known value).

**L4 — The backup is tested for four of its seven folders.** `daily.ts:88-96`:
without `looks` or `manifest` in the list every test passes (m22a, m22b) —
`looks\L<k>\result.json` is the verdict —; `:113-118` a file changed with the
same size is only compared by hash, untested (m23, r53). **Fix:** assert the
copy holds the look's result and the manifest, and a same-size change.

**L5 — Dead and test-only code in the frozen scope** (the "extra code" you
asked for). Each is a deletion; none changes a behaviour:
- `gate.ts:102,104` `CLOSED` and `gateOf` are used by tests only; production
  writes `{ open: true }` itself at `daily.ts:225` and `look.ts:82`. Use
  `const gate = gateOf(freeze)` in both: the gate then has one source, the
  freeze, and "no way around it" is structural. `CLOSED` moves to the tests.
- `gate.ts:92` an empty-list guard that no input reaches (m69): the list is
  checked against the scope and the eleven paper files first.
- `look.ts:86` `checkSealed(gate, end, …)` on a gate that is open by
  construction; `look.ts:93` `legFinal(days, end - 1)` is implied by
  `legFinal(days, end)` (all 256 combinations of eight closed days checked:
  `checks/implied.mjs`).
- `recordings.ts:356` `frame.ch !== book::${iid}` can never differ from the
  pre-filter's `iid` (m73, r30).
- `assemble.ts:224-226` returns `days`, `checks` and `checkedNow`, which no
  caller reads; `summary.ts:102` `LineSummary` is unused; `daily.ts:405`
  `?? runDate` is unreachable (every position has a key by `:254`).
- `daily.ts:45-60,209-210,237-239,270-273` and `inputs.ts:75-81` carry a
  `rehearsal` hook and a `from` argument that only the old-weeks test passes
  (the paper review's L1 shape). Kept by design for the bridge rehearsal; say
  so in a comment, or let the rehearsal call `assemble()` and drop them.

**L6 — Copies.** `run.ts:116-140` copies three private functions of `lock.ts`
(`readPid`, `ageMs`, `isAlive`, 25 lines) to read the paper's lock;
`look.ts:38-42` and `:198-207` repeat `RunRecord.logLine` and the manifest
append of `daily.ts:66-85`; `stats.ts:20` `dayOf` is `paper/stats.ts`'s;
`recordings.ts:28` `DAY_MS` is `schedule.ts`'s; `DayCheck` (`recordings.ts:82-93`)
is typed by hand beside its Zod schema (`:95-113`), against "the schema is the
type"; `daily()` (`:206-229`) and `look()` (`:51-84`) open with the same 25
lines (freeze, gate, kit, wait). **Fix:** one exported `lockLive(stateDir,
files, now)` in `lock.ts` (additive; the collector's behaviour is untouched),
`export class RunRecord`, `z.infer`, the two imports. Recommended: the
one-liners now; the shared preamble only when a second arm is built (note in
the structure section).

**L7 — After a verdict the page's box shows the latest look, not the test's
verdict.** `daily.ts:160-178` (`verdictBox`) follows rules M14 to the letter,
which sits oddly with M11 ("the first KEEP or DROP is the test's verdict;
later looks print their figures marked 'after the verdict'"). On the built
function: look 1 KEEP, look 2 TOO FEW TO TELL prints "Look 2 (2027-02-06):
WAVE TOO FEW TO TELL. … Next look 2027-05-08." as if nothing were decided;
`result.json` carries `afterTheVerdict`, the box ignores it. The paper's frozen
page has the same shape. A rules question (Q3), not a slip of the build.

**L8 — The entry point has no test, and two small hardenings.** Exit codes 2,
3, 4, 5 and 1 of `market1.ts` are untested; I ran the built program on scratch
folders and each behaves as designed (checks/entry-probe.mjs; no settings, a
bad command, `look 4` or no command: 2; no freeze list: 4 with one line in the
record's log; a live holder with a fresh heartbeat: 3; `look 1` before its
Monday: 5; the database unreachable: 1 after 10.5 s, the lock left with the
dead pid, a second run takes it). `market1.ts:34` prints Zod's issue list as a
raw JSON dump (tens of lines) for a missing setting. `run.ts:52-62` does not
refuse a `MARKET1_ROOT` or `MARKET1_BACKUP` equal to or inside `PAPER_ROOT` or
`RECORDINGS_ROOT`, or each other: one `refine` would keep MARKET-1's writes
away from the two sealed stores for good.

**L9 — Names and shape.** `waves.ts:61` `Event` shadows the global type's
name (a wave's entry or an episode: `Entry`). `Quote` (`lines.ts:183`),
`LegQuote` (`price.ts:18`), `BookSource` (`book.ts:244`) and `LegRecord`
(`assemble.ts:53`) are four forms of one leg's decision, converted by hand at
`assemble.ts:186-196` and `:93-99`. `daily.ts` (493 lines) holds the record,
the backup, the page's data and the run; `pageData` takes nine positional
arguments (`:333`); `look()` is one 175-line function (`look.ts:44-218`) and
imports from `daily.ts`.

**L10 — Tests.** `market1-daily.test.ts:294-546` is one 250-line `it` in ten
numbered steps, so a failure in step 3 hides steps 4–10 (the paper review's
L10); `market1-world.ts:31` exports `frameText`, used inside the file only;
`market1-book.test.ts:15` redefines `at`, which the world exports.

**L11 — Process: the builder's break harness edits the real working tree.**
`workers/MARKET-BUILD/scripts/mutate.mjs` and `mutate-glue.mjs` rewrite
`E:/coding/polymarket-follow/apps/poller/src/market1/` in place and restore it
after each run (about 10 s each): any session reading the tree in that window
sees broken code. It ended clean, but a review reads the tree. Run breaks in a
scratch copy, as the reviews do (a line for code-rules).

## What the tests missed

139 runs of the whole suite (7 s each) over 136 distinct breaks (the first
session's 62 and my 77, three of them the same break), in scratch copies: **71
killed, 65 survived.** Of the survivors, 10 change nothing a test could see
(the two dead guards of L5, m69 and m73/r30; the exact-fill edge of
`walkClose`, which moves only `deepest`, r05; a second `process_stop`, r09; an
edge at a UTC day's first millisecond, r41; a forced look's legs past END,
which the set excludes anyway, r42; legs at or past END, m70, or P's legs, m71,
decided too, which only adds records; the heartbeat at 60 s, still under the
2-minute rule, r92; an account whose P is the cut, r100) and 55 are real
gaps:

| Survivors | Where | What it guards |
|---|---|---|
| r60, r61 | `look.ts:54-61`, `:80-81` | the look's freeze check and its wait for the paper run (M3) |
| m11, m13, m13b–d, m14, m57, m80–m85, m87, m88, r62, r64, r65 | `look.ts:36,78,87-93,115-117,132-149,158,170-178` | the look's readiness, wait, the verdict's seven inputs, its sentence, its prints (M4) |
| m24b, m54, r21–r25, m72 | `recordings.ts:198,207-226,258-259,280,333-341,361` | unreadable, unparsed, differing and changed files; a missing day; the newest line (M5) |
| m60–m64, m74, m20, m21, r90 | `run.ts:30-44,138,191-216` | lock and heartbeat names, release, catch, EPERM, 6 h, rename tries (L1) |
| r40, m44 | `assemble.ts:154-156`, `daily.ts:181-197` | the recorded fee and its alarm (L2) |
| m10, m40, m48, r44, r51, r77–r80, r106, r107, r112 | see L3 | printed numbers (L3) |
| m22a, m22b, m23, r53 | `daily.ts:88-96,113-118` | the backup's list and compare (L4) |

**What the suite does kill** (the 71 of my runs, by what they guard): a wave
of three accounts, the window's lower end and the 30-minute block, the entry's
2 minutes, the walk's edges, depth short and unusable books (r01–r04, r06),
funding's sign, the live rule's 61 minutes, its edge and a 62-minute version,
every gap kind (a trades connection, the database disk, a crash, a market's
stall against every market's, a refused channel), its 60-second widening and
its ends, the hour before and the hour after, a leg waiting for the next day's
close, a day checked once, the day alarm's two limits, the minimum of 20 days
and 10 markets, the verdict's order, thresholds and the matched baseline
(r70–r76), the freeze scope, a changed, missing or unlisted file and the paper
files (m18, m67, m68, r94–r98), the sealed gate and its datum check (m65, m66),
the paper wait's length of a check, first-seen kept, the look's Monday, its
"already run" and its result file, a missing state's rows, a pre-cut run
listing no market-day folder. **Spot-check of the builder's own breaks:** 17 of
its 75 (the gate's edges and a changed file, the pool read, the paper wait and
the rename retry, `daily()`'s freeze check and wait, a left-out coin, the look's
Monday, trade ids as doubles, tradable, the market object's end, END's set, δ,
the block of either side, the exit fee) re-run with its own find and replace:
**17 of 17 killed.** Its two lists never touched `look()`'s freeze check or
wait, the lock's names, or the heartbeat's catch: that is where M3 and L1 sit.
**With the pins** (`zz-review-pins.test.ts` without the freeze-date case, and
`zz-review-recordings.test.ts`, about 160 lines in all), 16 distinct survivors
die (m24b, m54, m60–m64, m72, m74, r21–r25, r60, r61; r93 is m62 again); the
rest need the look's wiring (M4), the fee world (L2) and the print pins (L3).

## Checked and in order, by the brief's six points

1. **The two live programs stay undisturbed.**
   *Collector and paper experiment.* `git diff paper-freeze-1 HEAD` over
   `apps/poller`: only `src/market1.ts`, `src/market1/`, `market1/`, the
   reproduction script and tests are new; the collector's and the experiment's
   sources, `research/`, `experiment/`, the package file, the lockfile and the
   TypeScript and ESLint configs are byte-identical; the other changes are
   `tools/`, `.prettierignore`, `test/config.test.ts` (extended in step with
   `poller.env`) and docs. A fresh build of HEAD verifies the experiment's
   freeze: 61 files, `d04d3cd8…f31c`; its test (`market1-gate.test.ts:157`)
   says the same. The collector's status and check tools read only
   `heartbeat.json` and `poller.lock`; MARKET-1's two names collide with
   nothing.
   *Reads only after the paper run.* `daily()` waits (`daily.ts:229`) before
   `assemble` reads anything of the store; `look()` waits (`look.ts:80`) before
   `readState` (`:87`). Every read of the store is `readFileSync` of one whole
   file or a directory listing; no write path derives from `PAPER_ROOT` or
   `RECORDINGS_ROOT` (every writing call in the source: `MARKET1_ROOT`, its
   backup, `STATE_DIR`'s own files). The paper's commands (`daily`, `look`,
   `reparse`) all take the lock the wait reads. The wait's `lockHeld` is the
   shared rule (live holder, heartbeat under 2 minutes), with `EPERM` as alive.
   A residual risk the plan already accepted (F2): a paper run starting in the
   milliseconds MARKET-1 holds one of its files (a catch-up after a reboot
   starts both tasks together); the cost would be one paper day's reading.
   *Deploy and task.* Both scripts parse clean. Per program the names are
   disjoint (`poller`, `paper`, `market1`: target, `.next`, `.old`, task,
   entry, frozen folder, gate module, evaluated in memory); a market1 deploy
   refuses while its own task runs, stops and starts no task, deletes only its
   own `.old` and `.next`, smoke-tests with the settings removed from the
   child's environment (the three new names added) and checks the copy's own
   gate once a list is in it; the default and `-PaperOnly` registrations are
   unchanged by the diff; `-Market1Only` registers one task, 10:30Z
   (`Get-DailyUtcStart 10 30` gives 10:30Z on this UTC+1 host), S4U, IgnoreNew,
   12 h, priority 7. The shared `deploy.log` is only appended.
2. **The seal, in code.** The gate is opened at `daily.ts:225` and
   `look.ts:82`, each after the exit-4 return; every reader takes it first:
   `inputs.ts:82,115,132`, `recordings.ts:56,168-169,309,328`. Tested and
   killed: the cut's edge, a datum at the cut, a changed, missing or unlisted
   file, the eleven paper files, the scope's three parts (b01–b03, r94–r98,
   m65–m68). Not tested: the look's refusals (M3). The freeze tool, run in a
   fresh git copy: the draft's 64 hash lines are identical to the committed
   draft; `--final` on a dirty tree refuses; `--final` on a clean tree writes
   a list the built gate accepts. Files the run loads that the list does not
   hold: `schedule.js`, `log.js`, `lock.js`, `store/db.js`, `store/universe.js`,
   `api/schemas.js` — shared code by rule (M0); the last three are loaded only
   because the paper's `rulebook.js` imports `store/db.js` for `checkDbName`,
   and the run's log hashes the first four, not `store/universe.js` or
   `api/schemas.js`.
3. **The recordings' reader.** *Formats:* the manifest is written
   atomically by the collector (`store/files.ts:305-313`), its events go to the
   folder of the day they are written, and its book lines are the raw frame
   text; MARKET-1's own schema equals the collector's `BookFrame` plus finite
   numbers. Real `Recorder` and `BookSampler` write the test world, so the
   event fields are the collector's own types. *The hour before, the hour and
   the hour after:* tested (m52, r27 killed). *Gaps:* every event pair and its
   60 seconds (the real order is close, open, resumed: the gap ends at the
   open, the margin covers the first frame's quarter second); the coverage and
   integrity branches are M5. *Pending legs:* the next day's close, tested
   (m09, r20). *The book walk:* the edges, depth short and the closing side
   are tested (r01–r06). *Its cost, measured* in a scratch bench of
   synthetic book lines (20 levels a side, Brotli): the day check 1.4 s for a
   60,000-line hour, 7.2 s for 300,000; `booksAt` 0.3 s and 2.6 s an hour file
   for 18 legs; the pool's fills 5.9 s for 68 days of the pre-cut seed (727
   counted fills, MARKET-FIND's number). A corrupt, truncated or empty Brotli
   file surfaces as an error through the line reader (checked), so
   "unreadable" works.
4. **The run's safety.** *Lock:* the shared rule, names its own; released at
   `close`, left with a dead pid after a crash and taken by the next run
   (probed). *State:* `writeWhole` writes a temporary file, flushes it, renames,
   and retries a refused rename 10 times a second apart; the record is
   checkpointed by closed day (`days\`), the legs and positions at the end of
   the run, so a crash costs that run's work and nothing else. *Per-run files
   named by time:* `books\<date>-<HHMMSS>`; a look's `-L<k>`. *A second run
   the same day:* tested and rehearsed. *A long wait:* a minute at a time for
   6 hours, then exit 5; the task's limit is 12 hours, and the first run's work
   after a full wait is days × 0.5–2.9 minutes. *The backup:* copies by hash,
   never deletes, its failure is logged and printed on the page. Weak: the
   heartbeat's catch, the release, `EPERM` and the backup's list are unpinned
   (L1, L4).
5. **The tests.** 50 tests in 9 files; they are real: a synthetic world written
   by the collector's own recorder, an end-to-end run, a differential test of
   the market objects against the paper's own, an independent reproduction, a
   bridge rehearsal. They test what decides in the rules, the walk, the gaps and
   the statistic; they do not test the look (M3, M4) or the integrity branches
   (M5). Dead helpers: `frameText`'s export and a copy of `at` (L10). The old
   weeks, re-run by me on the pre-cut data at HEAD: the rehearsal passes (1,363
   positions, 1,362 equal to 1e-9 bps, one listed; 196 legs pending at the
   first run and 0 at the end; 72 s) and the reproduction prints every figure
   of its test (727 counted fills; 153 entries on 47 days in 30 markets, 114
   forced sells and 39 buys; +309.7 ± 67.7, excess +311.3 ± 68.7, additive net
   +297.1 ± 67.8, OWN +74.9; B1–B11), without MARKET-FIND's own lists, which I
   do not have.
6. **Iron Rules in code.** No network call anywhere in the run's import closure
   (a scan of the built files for `fetch`, `http`, `https`, `net`, `tls`,
   `WebSocket`, `child_process` finds none; the only connection is the
   `mongodb` driver to `MONGO_URI`, as the paper experiment's); no POST, no
   key, no route; no `console`, no `any`, no `ts-ignore`, no TODO. Every file it
   reads is Zod-parsed where it enters. No project or personal name in the
   code, the page or anything it sends (the database name is a literal in
   `run.ts:60-61`; `readRuleBook` sets no application name). `MONGO_URI` is any
   `mongodb://` address, as for the collector and the paper experiment; the
   tracked `poller.env` holds 127.0.0.1. The page has no script, no colour for
   a sign, no sort by result, and a test reads its text for the banned words.

## How the structure fits the later phases (notes, no code)

- **The shape is right for one more arm.** `src/market1/` mirrors `src/paper/`;
  the pure modules (`waves`, `fills`, `price`, `book`, `lines`, `stats`,
  `summary`) take no file or clock, so v1's live alert can import the wave and
  the entry as they are, and a later arm (T, R, B8, B9, J, X) can be its own
  program with its own list that imports the frozen modules unchanged. What it
  cannot reuse without copying is what is wired to WAVE: `Line` and `spotsOf`
  (`lines.ts`), `namedSets` (`compute.ts`), the page and the look. Do not
  generalise them now; when that arm comes, export `RunRecord`, `looksDone` and
  the preamble once (L6) and build the arm beside them.
- **Frozen code is the cost of "new arms are new files".** `daily.ts` holds
  seven things; a second arm that wants the record, the backup and the page
  scaffolding will import a 493-line file or copy it. Splitting it before the
  freeze (record and backup in one file, page data in another) is the cheapest
  moment and optional.
- **The collector's formats are a contract with no test on the collector's
  side.** MARKET-1 reads the manifest, the hour files and the coverage events by
  name (`book.ts:119-221`). A new event kind, a renamed field or a changed hour
  file would pass unseen. A small test that lists the collector's
  `CoverageEvent["event"]` names against the ones `gapsOf` handles or ignores
  would make the next collector change decide, in the same commit.
- **`store/db.js` reaches MARKET-1 through the paper's `rulebook.js`** and is
  not frozen (its two imports, `store/universe.js` and `api/schemas.js`, are
  not even hashed in the run's log): keep `checkDbName` stable when the
  skeleton's `packages/shared` and the api arrive, or add the two to the log.
- **`packages/shared` later:** `CUT`, `LOOK_ENDS`, `LOOK_Z` (the paper's),
  `SMALL_COINS`, `START`, `NOTIONAL`, `ENTRY_DELAY_MS`, `HOLD_MS`, `DROP_BPS`,
  `MIN_DAYS`, `MIN_MARKETS`, and the stored shapes `LegRecord`, `DayCheck`,
  `LookResult`, `PageData`; `PageData` is the contract for v1's web.
- **Growth to May:** `readLegs` reads every `books\` file each run (about 20 MB
  of text by May), `seen.json` about 5,000 keys, the positions log a few MB a
  day, `positions.html` about 1,500 rows, `readRuleBook` every document of six
  kinds each run (Q4). All fine at that size; the time is the day checks (0.5–3
  minutes a day) and the first run's catch-up.
- **The run is isolated from later repository work** (its own copy and list);
  its shared files (log, lock, schedule, the database module) come from
  whichever commit is deployed and are hashed for information only.

## Questions, each with my recommendation

- **Q1 — Fix M1 and M2 before `--final`?** Yes: two one-line changes, each a
  test, then `pnpm verify`, a new draft list, `--final`.
- **Q2 — The cleanup of L5 in the same batch?** Yes for the deletions and
  `gateOf` (they remove code and make the gate's source one); for L6 the
  one-liners (`DAY_MS`, `dayOf`, `z.infer`, `export class RunRecord`); the
  `lock.ts` helper and the shared preamble only when a second arm is planned.
- **Q3 — The verdict box after a verdict (L7)?** Show the first look with a
  KEEP or DROP and keep it there; later looks' figures stay in `result.json`
  marked "after the verdict". About five lines in `verdictBox`, a case in the
  test and one sentence in M14, all before the freeze; the paper's frozen page
  keeps its shape. If you would rather not touch it: do not run looks 2 and 3
  after a verdict.
- **Q4 — How many documents does the collector's `rulebook` hold, by kind?**
  MARKET-1 reads every document each run and look (the paper's question Q4,
  never answered in the docs). I may not open the database; the supervisor can
  count once. If it is thousands, read the latest per kind and key plus the fee
  and competition history.
- **Q5 — M4's fix: extract `lookVerdict` or build a second world?** Extract
  (ten lines, pure, four cases); the world only if you want the look's whole
  path under KEEP and DROP.
- **Q6 — Add the pins before the freeze or after?** Tests do not change the
  freeze; land M3, M5 and L1 before the first run, M4 before look 1, and keep
  `pnpm verify` green at the deploy.
- **Q7 — Refuse `MARKET1_ROOT` or its backup inside the sealed stores (L8)?**
  Yes, one `refine`; it is the write-side twin of the seal.
- **For code-rules** (the supervisor's file; nothing here edits it): a regex
  typed through a shell is read back from the built file; a fallback value
  that turns a failed parse of our own file into "unknown" hides a defect;
  break runs belong in a scratch copy, never in the working tree.

## Evidence

`workers/MARKET-CODE-REVIEW/`: `progress.md` (the log, with times) and
`checks/`: `mkscratch.mjs` (the scratch copy), `mutate.mjs` (the break
harness, scratch only) with `list1.mjs` (the first session's 62 breaks, re-run
by me), `list2.mjs` (my 77) and `list3.mjs` (17 of the builder's) and their
results `out1`–`out5`; `check-freezes.mjs` (both freezes and the run's import
closure), `freeze-date.mjs`, `bench.mjs` and `bench-pool.mjs` (cost),
`entry-probe.mjs` (exit codes), `tband.mjs`, `brotli-corrupt.mjs`,
`unused-exports.mjs`, `implied.mjs`, the sketches `zz-review-pins.test.ts`,
`zz-review-recordings.test.ts`, `zz-review-spacing.test.ts` and the re-runs
`zz-reproduce.test.ts` with `precut-config.json` and `rehearsal-out.json`. Also
checked: the freeze tool in a fresh git copy (draft equal, dirty tree refused,
final accepted by the gate); both PowerShell scripts parse; per-program
paths and `Get-DailyUtcStart 10 30` evaluated in memory; the first session's
`m85`, `m87` and `m88` were recorded "killed" with no failed test, an artifact
of its stop: in my run they survive.
