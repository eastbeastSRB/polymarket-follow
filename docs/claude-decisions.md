# Decisions log (append-only; newest on top)

2026-11-13 (WAVE-H's download — the owner's advance approval): **THE
SUPERVISOR MAY START WAVE-H'S DATA DOWNLOAD WITHOUT WAITING FOR THE OWNER,
ONCE THE PLAN AND ITS FRESH REVIEW AGREE ON IT.**

The owner, before an absence: "if that comes and am not here, you have
approve, you can download, everything inside F:, as always careful on
limits and on everything."

**What it covers:** only the download of the public, keyless Hyperliquid
data the plan names (AWS's public bucket), into F:. Iron Rule 1 as widened
the same day applies.

**The conditions:**
- the rate cap and schedule the plan sets, protecting the collector's live
  line;
- the collector's health watched during the download (the price audit's
  timing misses, its coverage and any gap), and a pause on any sign of
  harm;
- no request in the night window 02:35–03:50Z if the plan says so;
- checksums;
- a resumable download.

**The seal:** the test months' files (2025-08-01 to 2026-05-28) are stored
unopened. No code reads them until WAVE-H's freeze list exists.

**What it does not cover:**
- WAVE-H's plan itself and its rules, which still wait for the owner's
  approval;
- the build;
- any account, key or payment, which stay the owner's.

2026-11-13 (the two outside researches — the owner's ruling): **WAVE-H
FIRST, IN THIS PROJECT; IRON RULE 1 WIDENED FOR READ-ONLY RESEARCH DATA;
THE FIRST KEYLESS CHECKS APPROVED; THE ON-CHAIN PROJECT AFTER WAVE-H'S
FIRST ANSWER.** The owner: "am approving everything and agree with your
recommendation … you have approvement to change that Iron rule".

**The reports:** WAVE-ELSEWHERE (`docs/reviews/wave-elsewhere-2026-11-13.md`)
and ONCHAIN-SCOUT (`docs/reviews/onchain-scout-2026-11-13.md`).
- Both researchers' conduct was clean. The supervisor's scans found no
  name in any search, only documentation pages fetched, and no network
  command.
- The supervisor confirmed their load-bearing facts at the primary
  sources:
  - Hyperliquid's WebSocket types: a fill's `liquidation` is
    `{liquidatedUser?, markPx, method}`, and a trade's `users` are
    `[buyer, seller]`;
  - Hyperliquid's archive is requester-pays, and its fills are in the API
    format;
  - AWS's public-blockchain registry lists Hyperliquid and Lighter, with
    "No AWS account required";
  - Lighter publishes free daily trade files from 2025-01-17, columns not
    documented;
  - BIS WP 1062's 42,324 liquidations, its one-hour rule and its 1,028
    waves;
  - Etherscan's free plan and terms, and Binance's dataset terms.

**The calls:**

1. **WAVE-H first, in this project.** It tests MARKET-1's own finding, the
   liquidation wave, on Hyperliquid:
   - by MARKET-1's definition (M3–M6);
   - on days before Polymarket Perps existed (WAVE-ELSEWHERE's design,
     section 4: test months 2025-08-01 → 2026-05-28), so that the sample
     is new;
   - by MARKET-1's road: plan, fresh review, build, fresh reviews, freeze,
     one look.

   The test months' prices stay unread until the freeze. Lighter (WAVE-L)
   comes later at most, as the same evidence seen twice, not a second
   sample. WAVE-H decides nothing for the frozen MARKET-1.
2. **Iron Rule 1, widened.**
   - **Why it exists:** the founding decision's point 2 (2026-11-06) made
     the app safe by construction: no order code, no trading keys,
     nothing that can move money, no secret that can leak.
   - **The new text keeps all of that** and widens only what may be read:
     besides Polymarket's endpoints, other venues' public, read-only data
     endpoints and published data files, for research approved in
     decisions.
   - **Never** an endpoint that places orders, moves funds or needs a
     signature.
   - Any account, key or payment is the owner's decision, and the owner
     makes it.
   - A generic User-Agent, with no name of the project or the owner.
3. **The first checks, approved.** A small worker, WAVE-CHECKS, runs them:
   - **K0:** the AWS public-blockchain listing under `v1.1/hyperliquid/`.
   - **L1:** one Lighter day file of trades. It is read for its columns
     only, from a day in the sizing months, not the test months.
   - **K1, K2:** about seven keyless reads of Hyperliquid's public info
     endpoint (its read requests are POSTs to `/info`; never `/exchange`).
   - **K8:** the venues' and the bucket's terms.

   No price is analysed and nothing is counted. Any paid route (the
   requester-pays archive, about $20–60, through the owner's own AWS
   account) comes back to the owner first.
4. **The on-chain project** (ONCHAIN-SCOUT's) is founded after WAVE-H's
   first answer, in its own repository with its own supervisor. Its key
   and terms decisions are made at its founding.
5. **MARKET-1's second arm** stays at about 2026-11-20, as ruled the same
   day.

2026-11-13 (two outside researches — the owner's approval): **TWO
SEPARATE DESK RESEARCHES ON FABLE 5.2, IN PARALLEL: WAVE-ELSEWHERE (narrow)
AND ONCHAIN-SCOUT (broad).**

The owner: "you have approve for 2 agents on fable 5.2 … if my broader idea
shows potential after investigation idea is to start new project, not
inside this one."

1. **WAVE-ELSEWHERE.** Can MARKET-1's wave be tested on another venue's
   public data, perps exchanges on-chain or not, and how exactly?
   - Which venues publish liquidations at all, with or without the
     account, and how far back.
   - How MARKET-1's definition maps onto each.
   - How honest prices can be had there.
   - A replication design, rules first.

   For this project: a wave seen elsewhere makes MARKET-1's lead more
   credible, and a long public history could answer faster than the forward
   looks. It decides nothing for the frozen MARKET-1.
2. **ONCHAIN-SCOUT.** Is there a promising, testable direction in public
   on-chain data (Etherscan and similar explorers, indexers, many chains)
   for the owner's purpose?
   - It uses what this project learned: copying traders did not pay, while
     forced flows (the wave) did on the old weeks.
   - It maps the data sources (cost, keys, limits, terms, history) and the
     patterns observable on-chain, each with an honest test design.
   - It says what of this project's method and code is reusable, and
     whether a new project should start, with its first steps.
   - It leaves the wave's replication on other venues to WAVE-ELSEWHERE.
3. **Both are reading only:**
   - public documentation, specs, terms and studies;
   - no API call to any venue or explorer;
   - no account and no key;
   - never the owner's details or the project's name in a search.

   Each lists the exact small checks it would want to make next, with a
   recommendation, for the owner to approve.
4. **Iron Rule 1 is unchanged.** A free read-only key for a data source
   (an explorer, for example) would amend it, and that decision is the
   owner's. Any account is created by the owner. No trading key, ever.
5. **Where it lands.** Each report goes to `docs/reviews/` here, as dated
   evidence. If ONCHAIN-SCOUT shows potential, a **new project** is founded
   in its own repository, with its own supervisor and founding decisions,
   not inside polymarket-follow. The report is copied there as founding
   evidence, and the two projects share no runtime code, as with
   polymarket-lab.

2026-11-13 (the owner's rulings after MARKET-1's deploy, on the supervisor's
overview): **A SECOND MARKET-1 ARM WILL BE ADDED; WAVES SHOWN LIVE IN V1 AS
INFORMATION; THE RECORDINGS' SECOND COPY BY THE OWNER WITHIN ONE TO TWO
MONTHS.**

1. **The second arm.** The owner: "I agree about a second MARKET-1 arm, we
   should add it when you think is ideal. record that and we will do it."
   - What it is: the variants parked in "MARKET-1's plan approved" for a
     later arm, run as their own frozen arm with their own START, lines and
     verdict.
   - How: MARKET-1's road (plan, fresh review, build, fresh reviews,
     freeze). The frozen first arm runs on untouched (rules.md M0).
   - Cost: zero API reads.
   - When: the supervisor proposes it after MARKET-1 has run a stable week
     (about 2026-11-20) and before D1, so its clock starts early. The
     owner's yes is needed for its plan, as for every task.
2. **Waves live in v1, as information.** The owner: "yeah I agree with
   this, we should add it."
   - The v1 plan includes a live view of liquidation waves in the small
     coins, labelled as under test and never as advice (Iron Rule 6).
   - **Open question for that plan:** how to see liquidations soon enough
     inside the budget. MARKET-1 sees a wave only once the paper experiment
     has read the accounts involved: about a seventh a day, the rest at its
     Monday sweep.
3. **The recordings' second copy.** The owner will provide the space
   within one to two months; the supervisor then sets up the copy. Until
   then the recordings, which cannot be read again, exist on F: only (1.4
   GB on 2026-11-13, about 0.5 GB a day).

2026-11-13 (MARKET-1 — THE FREEZE): **MARKET-1 IS FROZEN.**
- `apps/poller/market1/FROZEN.sha256`: 64 files, SHA-256
  `b9e17505d8d4dfc87101b35c4908929b4ed18c6dd401cf723dfbab0c15452f1d`.
- Written by `tools/market1-freeze.cjs --final` at 2026-11-13T14:29:11Z,
  from the clean tree at `62341b4`.
- Committed as `4832a6a`, annotated tag `market1-freeze-1` (local; the
  owner pushes it).
- Its 64 hash lines equal the reviewed draft's (`94828ff9…6460`, from
  `43efd04`).

**How it got here:** MARKET-BUILD → MARKET-RULES-REVIEW and
MARKET-CODE-REVIEW → the owner's ruling → MARKET-FIX → MARKET-FIX-CHECK
("ready to freeze after M0's wording") → MARKET-FIX-2 (`afb2e5c` …
`62341b4`).

**The supervisor's checks before `--final`:**
- M0's two bullets are byte-equal to MARKET-FIX-CHECK's text
  (`verify/MARKET-FIX/m0-text.out.txt` in the supervisor's folder: 749 and
  432 bytes); a single hunk; no file under `src/` changed since the check.
- `pnpm verify` green: 46 files plus 1 skipped, 380 tests plus 3 skipped.
- The paper experiment's freeze verifies (61 files, `d04d3cd8…f31c`); no
  paper file changed since `paper-freeze-1`.
- The draft verifies against a fresh build. Its list differs from the
  previous draft only in its head line and `rules.md`'s hash.
- MARKET-FIX-2's access is clean.

**After `--final`:** the final list verifies against the build. `pnpm
verify` gives the same 380 tests with the list present, so the gate's
opening changes no test.

**MARKET-FIX-2's notes:**
1. The paper experiment's frozen `experiment/rules.md` (lines 27–30) has
   the same inexact kit wording as MARKET-1's old N5: the kit is checked in
   `research.ts` when it loads, not in the gate. It is listed, not edited
   (frozen); nothing depends on that wording.
2. The previous entry's headline says "four tests"; its call 3 names seven
   breaks, and all seven are pinned (`43efd04`).

**Next:**
- The owner deploys MARKET-1:
  1. `tools\deploy.ps1 -Program market1`;
  2. from an elevated PowerShell, `tools\register-tasks.ps1 -Market1Only`
     (its daily task at 10:30Z);
  3. the first run by hand, its backlog from START 2026-11-11.
- No paper command by hand while a MARKET-1 run is live (rules.md M2).
- The first real run's `format` line is read before the run is trusted
  (F7 (c)).
- A defect found later is fixed only by M0's road: a decisions entry, a
  failing test, the positions changed, and `market1-freeze-2`.

2026-11-13 (MARKET-FIX-CHECK — the supervisor's last calls before MARKET-1's
freeze, inside the owner's approval of the fix batch): **"READY TO FREEZE
AFTER M0's WORDING"; ONE LAST SMALL BATCH (THE RULE TEXT MADE EXACT, FOUR
TESTS), THEN `--final`.**

**MARKET-FIX** (16 commits `20ec89c` … `4ea4b41`; its entry below) made
calls 1–12. The supervisor verified it on its own path:
- `pnpm verify` green (376 tests passed, 3 skipped);
- the paper experiment's freeze still verifies (61 files);
- the draft list matches the supervisor's build (64 files, `3073e097…ed27`);
- both regex fixes read back from source and build;
- no sealed path touched.

**MARKET-FIX-CHECK** (`docs/reviews/market-fix-check-2026-11-13.md`,
`2e62446` and `20b85c0`; Sonnet, fresh):
- **The findings:** of 23 distinct findings, 17 are fixed, 4 accepted and
  sound, 1 answered without code and 1 a process item done; none is open.
- **The breaks:** all 259 re-run. Exactly MARKET-FIX's claim: 240 killed, 6
  equivalent, 3 on deleted code; none killed by a time limit alone.
- **`lookVerdict`** equals the old assembly and an independent M10/M11 on
  33,000 made-up looks.
- **The draft list** equals a fresh build.

**Its new findings and the calls:**

1. **N1, the rule text.** M0's "every reader … takes the gate" is no longer
   true of the look's two readiness reads (`look.ts:103` `readState()`,
   `:113` `marketDays()`). They are safe by order: the freeze check is the
   first read of `daily` and `look`, and a failed check returns 4 before any
   sealed read. **M0's sealed-data bullet takes MARKET-FIX-CHECK's exact
   wording** (its report, "M0's replacement wording"). A frozen rule says
   exactly what the code does; the code does not change.
2. **N5, the rule text (pre-existing).** M0's first bullet said a bad kit
   fingerprint or lib-exits hash ends in exit 4, but `loadResearch` would
   throw (exit 1). It **takes the report's exact wording** too, in the same
   commit.
3. **N2 and N3, tests outside the list.** Four breaks of the order and the
   exit survive every test today:
   - an early `readState()` before the freeze check, or before the paper
     wait (k01, k02);
   - `process.exit(0)` (k11);
   - `run.close()` removed (k12).

   They survive because a missing path reads as an empty state, so an early
   read leaves no trace. The fix-check's two sketch tests kill all four.
   Three small cases are unpinned too:
   - C's window end (k06);
   - S's zero (k07);
   - the parent of a store allowed (k09).

   All seven get tests now.
4. **N4.** `gate.ts`'s header comment says "every reader". It stays: the
   rule is the authority, and changing the comment changes a frozen file's
   hash for nothing.
5. **MARKET-FIX's Q1.** The rehearsal hook stays: production never passes
   it, and it is how the old-weeks rehearsal re-runs after a defect fix.
6. **MARKET-FIX-CHECK's slip, checked by the supervisor.** It ran
   `pnpm verify` in a scratch copy whose `node_modules` were junctions to the
   repository's, and the install re-pointed two development-only links,
   `node_modules\@eslint\js` and `apps\poller\node_modules\@types\node`, to
   the scratch (13:31:03Z). It restored them at 13:32:29Z. The supervisor
   found:
   - both now equal the lockfile (10.0.1 and 24.19.2);
   - no entry of the repository's `.pnpm` store changed since 12:00Z;
   - the live copies' packages are plain folders with hard-linked files, and
     none of their 521 hard links is missing;
   - no live program starts in that window.

   No effect. The lesson goes to code-rules.
7. **Then:**
   - a fresh small worker (MARKET-FIX-2) applies 1–3 and writes a new draft
     list;
   - the supervisor checks the rule diff word for word against the report
     and the seven breaks killed;
   - `market1-freeze.cjs --final` on a clean tree, with the list's hash and
     the tag `market1-freeze-1` recorded here.

2026-11-13 (MARKET-FIX's technical calls — MARKET-1's fix batch, inside the
owner's ruling of the same day; commits `20ec89c` … `ab19562`): **THE
RULING'S CALLS 1–12 ARE MADE; THE NEW DRAFT LIST IS
`3073e0971016893f47d603f92f3b2844c777c3afabf28e4d3492e5d91b31ed27` (64
FILES, FROM `79312a8`); NOTHING IS FROZEN; THESE CALLS.**
**(1) The freeze's date** is read right after the freeze verified, before
anything sealed is opened, so a list without its `# written` line stops the
run with nothing read (exit 1 by the crash handler). **(2) The settings'
refusal** (call 5): one refine per own folder, naming it; "inside" includes
equal; paths compared by `path.relative` (case ignored on Windows); a sibling
whose name only begins like a store is allowed; the two own folders against
each other were not ruled and are not checked. **(3) The refusal's line**
(call 10): `<setting>: <message>`, joined by "; ", "the command: …" for the
command line. **(4) L5 as ruled, with two consequences:** the look's readiness
reads (`state.json`, the market-day listing) take no gate now — the deleted
check could not fire, they come after the freeze check (MARKET-FIX's Q2);
booksAt trusts the pre-filter's market (a text with a duplicate `ch` key or a
leading zero, which the server does not send, would no longer be skipped).
The rehearsal hook stays: its comments already say the old weeks alone pass
it (MARKET-FIX's Q1). **(5) L6's one-liners** are the code review's Q2 list:
`DAY_MS` and `dayOf` imported, `DayCheck` as `z.infer`, `RunRecord` exported
and used by the look (its log lines, its books file and its manifest); the
reproduction script takes `dayOf` from the paper's stats. **(6)**
`lookVerdict(kit, wave, k)` takes the look, not z: the sentence needs it.
**(7) After a verdict** each later look adds one line on the page, without its
sentence. **(8) The tests:** `market1-look` (MARKET-RULES-REVIEW's made-up
looks rebuilt as pure worlds through `computeAll`), `market1-look-run` (a
small world ready for look 1, with its own frozen package),
`market1-entry` (the built program); `writeDay` moved to `market1-world`.
Exit 4 of the built program is tested through `daily` and `look` (the
repository's package gets its list at `--final`, so a process test would
change meaning); exit 1 through `look 3` before its Monday, which stops at
its first log line with or without a list. The EPERM test runs where the
platform refuses a signal to pid 4 (Windows) or 1. The Student band is
checked against t computed apart (3.695608 and 2.994155 at 9 degrees). The
tests that run looks, processes or held files carry their own time limits,
so a busy machine (or a break run beside other suites) cannot fail them.
MARKET-FIX's own breaks of its fixed lines found two gaps in its own tests (a
folder named "..m1" inside a store; the prints' lower bounds at looks 2 and 3
taken at look 1's z), closed by `ab19562`.
**Checked:** 249 deliberate breaks in scratch copies (MARKET-BUILD's 75, the
rules review's 41, the code review's 77 and its first session's 37 rebuilt
from their recorded descriptions, 19 of MARKET-FIX's own; 13 re-aimed where a
fix moved their text): 238 killed on `da21622` and 2 more (f09, f16) on
`ab19562`, no kill by a time limit alone; 3 broke code that call 8 deleted
(m69, m73, r30); 6 equivalent, listed: an open position at END − 2 ms (the
same minute as END − 1 ms), a forced look's legs past END (in no set), legs
at or past END decided at a look and P's legs decided (record lines only,
no price changes), an account whose P is the cut read (the window [CUT, CUT)
is empty), and f02 (the throw above still guards the line it changed).
MARKET-BUILD's 75: 75 killed. The old weeks: the reproduction's printed
figures pass
before (`3821416`) and after (`79312a8`), and its dumps of every counted fill
(727), entry (153) and position with its price (1,376) are byte-identical
(+309.7 ± 67.7); MARKET-FIND's own lists (MARKET-BUILD's scratchpad) were
outside MARKET-FIX's reads, so their fill-for-fill case was not re-run — the
build it held equal is the one before. The bridge rehearsal after the fixes:
1,363 positions, 1,362 equal to the reproduction to 1e-9 bps, the same one
listed (two BTC legs in one second), 196 pending at the first run and 0 at
the end, 2,709 legs at the book, 5 at the mark through the recorded stop —
MARKET-BUILD's report in every field but its timings. The draft list equals
a clean scratch build and MARKET-1's own gate accepts it. The paper
experiment's freeze, 61 files `d04d3cd8…f31c`, verified after every commit;
`pnpm verify` green (376 tests). **Next:** a fresh fix-check against both
reports and calls 1–12, then `--final`, the hash here and the tag
`market1-freeze-1`, then the owner's deploy and task.

2026-11-13 (MARKET-1's two fresh reviews — the owner's ruling on the fixes,
before the freeze): **BOTH REVIEWS SAY "AFTER THESE FIXES"; THE OWNER
APPROVED THE WHOLE BATCH ("everything is clear, i agree with everything, you
can start"); ONE FRESH FIXER, THEN A FRESH FIX-CHECK, THEN THE FREEZE.**

**The reports.**
- MARKET-RULES-REVIEW (`docs/reviews/market-rules-review-2026-11-13.md`,
  `f4e2e06` and `7af4968`): may freeze after these fixes; 3 medium and 8 low
  findings, numbered 1–11.
- MARKET-CODE-REVIEW (`docs/reviews/market-code-review-2026-11-13.md`,
  `a16d5aa` and `cbd06d1`): after these fixes; no high; 5 medium (M1–M5) and
  11 low (L1–L11).
- A sign-in failure stopped the first pair at about 09:49Z. Successors on the
  same briefs re-confirmed every finding before it went in.

**What both confirm.**
- Every ruling and F1–F19 is in the rules, and nothing is added.
- The draft list (64 files, `cc5cd6bd…6076`) equals a clean build.
- The paper experiment is undisturbed: its freeze verifies (61 files,
  `d04d3cd8…`), nothing writes under its root, and its lock is waited for.
- The seal holds.
- The old-weeks reproduction and the bridge rehearsal re-run equal.

**Access.** The scans are clean. For the rehearsal, a reviewer copied the
paper experiment's `seed` and `panel-precut` and the kit's `pool-weeks`.
These are pre-cut and not sealed, and the seed verified 1,602 of 1,602
against `experiment/seed.sha256` afterwards.

**The calls, all made before `--final`:**

1. `freezeDate` reads `\S+`. A list without its head line is an error, not
   "unknown", and the end-to-end page test asserts the date (rules 1, code
   M1).
2. The book-line pre-filter allows JSON whitespace. The collector stores the
   server's text verbatim, so a spaced frame must still match; it is tested
   with one (code M2).
3. M11 says the order: WITHHELD, then TOO FEW TO TELL, then DROP before KEEP.
   This is the code's order (rules 3).
4. After the test's first KEEP or DROP, the page keeps that look's verdict on
   show and labels each later look "after the verdict", and M14 says so.
   This is what M11 already promises (rules 4, code L7).
5. `MARKET1_ROOT` or `MARKET1_BACKUP` inside `PAPER_ROOT` or
   `RECORDINGS_ROOT` is refused at start (code L8).
6. The look's verdict assembly becomes one small pure function, pinned by
   tests built from MARKET-RULES-REVIEW's made-up looks (rules 2, code M4).
   Those looks are:
   - KEEP;
   - TOO FEW by F1;
   - DROP by the recorded fee;
   - TOO FEW by days, by markets and by noise;
   - KEEP with a forced leg;
   - WITHHELD.
7. New tests kill the surviving deliberate breaks that touch what decides,
   what is frozen, or the live programs' safety. They cover:
   - the look's freeze check and paper-run wait (M3);
   - the recordings reader's integrity branches (M5);
   - the lock and heartbeat names and the paper's, the heartbeat catch,
     `EPERM` read as alive, the 6-hour wait and the rename tries (L1);
   - the recorded fee and the fee alarm (L2);
   - the printed numbers (L3);
   - the backup's seven folders and its hash compare (L4);
   - the builder's own additions a2, d and e (rules 7);
   - START, F5's minimum for DROP, and the exit codes (L8).

   Equivalent breaks are listed, not tested.
8. Dead and test-only code in the frozen scope is deleted (L5). Of the
   copies (L6), only the one-line ones are removed. The `lock.ts` helpers and
   the shared `daily`/`look` preamble stay until a second arm exists.
9. Rule wording is corrected (rules 5, 6 and 11):
   - M1 against M7 (the hour after, and later days' coverage);
   - OWN's "dir ×";
   - the source of the ± for B1, B2, B6 and OWN;
   - the small words.
10. **Accepted as they are:**
    - a malformed `manifest.json` stops the run loudly with exit 1 (rules 9);
    - six support files stay outside the list, as in the paper experiment
      (rules 8);
    - the naming and shape notes (L9, L10) wait for a second arm;
    - the raw Zod dump at a bad setting (L8) becomes one readable line only
      if that is a one-line change.
11. **Answered by the supervisor:**
    - **A book level's size is in units of the coin.** In the founding probe
      (2026-11-06), 100 of 100 fills charge exactly 2.000000 bps of quantity
      × price across 7 instruments, including small coins 10 and 70. The
      spec gives trades' quantity "in no. of contracts" with no multiplier
      anywhere (the supervisor's
      `verify/MARKET-RULES-REVIEW/size-unit.out.txt`). So `book.ts`'s walk
      stands; the first run's data confirm it.
    - **F: has 1,551.6 GB free** (2026-11-13 10:52Z).
    - **The collector's `rulebook` grows only when a rule changes or a
      server closes a connection** (`store/db.ts`, `noteRule` and
      `noteEvent`), so reading it whole each run is cheap.
12. Every fix commit keeps the paper experiment's freeze verifying.
    Deliberate breaks run only in a scratch copy, never in the working tree
    (L11).

**Then:**
- a new draft freeze list and `pnpm verify` green;
- a fresh fix-check against both reports' findings;
- `market1-freeze.cjs --final`, with the hash and the tag `market1-freeze-1`
  recorded here.

2026-11-13 (MARKET-BUILD's technical calls — MARKET-1's build to "rules
ready", inside the plan approved the same day; commits `79b3984` …
`32923a7`): **MARKET-1 IS BUILT TO ITS RULES; ITS DRAFT FREEZE LIST IS
`cc5cd6bd46c64f441416e2f9d10536adaf3d709f95d541f3121eacb75b9c6076` (64 FILES,
FROM `36dcffe`); NOTHING IS FROZEN, DEPLOYED OR REGISTERED; THESE CALLS.**
**(1) Shape:** a third entry point, `dist/market1.js` (`src/market1/`), with
`market1/rules.md`; its list holds the eleven paper files of F8, checked by
its own tool `tools/market1-freeze.cjs` against the paper experiment's
freeze (the paper's tool untouched); the reproduction is a script and a
test, the bridge rehearsal a test, both run on pre-cut data only by a
switch (F12). **(2) The sealed gate** refuses, before anything is opened, a
read reaching the cut while MARKET-1's freeze is not valid, and with the gate
closed any datum at or after the cut; a pre-cut run lists no market-day
folder. **(3) F2:** the paper run is waited for by its lock and heartbeat (a
check a minute, 6 hours, then exit 5); MARKET-1's whole-file writes retry a
refused rename 10 times a second apart, its heartbeat skips a failed write.
**(4) The record's gaps:** from the coverage of every closed day (more than
F3's two); a leg waits until the day after its own is closed or missing
(F3); two gaps the plan's list missed, added to M7 — a refused book channel
(the collector marks no stall for it) to its connection's next open, and a
day whose coverage cannot be read (missing, differing, a line that does not
parse) as a whole day; "no book line" means none in the three hour files
read. **(5) The record:** each closed day checked once and kept
(`days\<date>.json`, with its coverage events); each final leg decided once
and kept with its book line (`books\<run date>-<HHMMSS>.jsonl.gz` — named by
the run's time after the rehearsal found that a second run the same day
replaced the first's file); `seen.json` for the first-seen date. **(6) The
tiers:** J and X join T, R, B8 and B9 in the later arm (the build ran long);
B7, B10, C, S and OWN are built. **(7)** Every line's position needs its
market tradable at t (the plan said it of WAVE). **(8) A look past its
wait** prices at the mark a leg not final ("recording not final at the
look") and leaves pending one without its market-days, both counted as not
at the book. **(9) The page** shows an open position at the mark at
END − 1 ms, labelled (the book there is final two days later), and cuts
WAVE's headline at the Monday of the earliest P among the pool's accounts
without a standing hole (F4). **(10) F9's alarm** only when a recorded rate
for these markets differs from the kit's 4 bps. **(11)** A test brings its
own kit data (the panel pins), as the paper experiment's `fixed`;
`tools\poller.env` holds `MARKET1_ROOT` and `MARKET1_BACKUP`;
`deploy.ps1 -Program market1` and `register-tasks.ps1 -Market1Only` are
prepared (a scratch deploy only; nothing registered). **Checked:** the
reproduction at END = CUT on marks — 727 counted fills fill for fill and the
153 entries entry for entry against MARKET-FIND's lists regenerated by its
own `lib.mjs`; 47 days, 30 markets, 114 sells, 39 buys; +309.7 ± 67.7 (day
60.1, market 53.8), minus BASE +311.3 ± 68.7, the additive net +297.1 ±
67.8, OWN +74.9, the reader model 138; B1 383 +131.9, net +119.5; B2 +22.0;
B3 +292.9 ± 72.7, +309.6 ± 83.1; B4 +274.7 ± 58.9; B5 +434.5 ± 97.1; B6
+274.2 ± 84.1, +413.4; B7 +61.6 ± 37.4, +111.3 ± 48.7; B10 222 +5.3 ± 24.4;
B11 −1,875 (2026-09-09), 2,370, 19, −1,101.9, −699.4; one listed difference,
M10's √max where MARKET-FIND's `cr2` printed the smaller two-way (OWN 49.9
for 48.7, B1 37.7 for 35.1, B2 42.3 for 34.9, B6 buys 100.3 for 98.0); M9's
net (the kit's leg) +297.0 ± 67.7. The bridge rehearsal (F7): 1,363
positions through the forward readers, 1,362 equal to the reproduction's net
to 1e-9 bps, one listed (two BTC legs 4 ms apart in one second: the sampler
keeps the second's last frame, and the earlier instant reads the line
before, as M7 says); 196 legs pending at a first run and repriced from the
record at the second; 5 legs at the mark through a recorded stop. 75
deliberate breaks of what decides and of the run's glue, all killed. A
real-size hour: the day check 6.5 s an hour (about 2.6 min a day). The paper
experiment's freeze, 61 files `d04d3cd8…f31c`, verified after every commit.
`pnpm verify` green. **Next:** a fresh rules review and a fresh code review,
then `--final`, the hash here and the tag `market1-freeze-1`, then the owner's
deploy and task.

2026-11-13 (MARKET-1's plan approved — the owner, "everything clear and
approved. you can start with work", on the supervisor's recommendation):
**MARKET-PLAN IS APPROVED WITH EVERY FIX OF MARKET-PLAN-REVIEW; MARKET-BUILD
BUILDS IT.** Plan `docs/reviews/market-plan-2026-11-13.md` (`86ef4da`);
review `docs/reviews/market-plan-review-2026-11-13.md` (`a281775`: may be
approved after the fixes named; it rebuilt WAVE's 153 entries from the
plan's words, equal). **The rulings:** δ = **+50 bps** a position (the
owner); **KEEP needs both** the money's lower bound above zero **and** the
mean of the positions' gross on marks minus their matched baseline above
zero (F1: a market's drift cannot pass as the effect; not a
basket-adjusted reading); DROP on the money alone; **a verdict needs at
least 20 UTC days and 10 markets with a priced position** (F5); depth-short
legs counted with the mark-priced toward WITHHELD above 10% (F6); MARKET-1
reads the paper experiment's files only when its run is over (its lock and
heartbeat checked, short reads; F2), and nobody runs a paper command during
MARKET-1's run; every leg waits until the day after its own is closed and
reads both days' coverage (F3); the page's headline on complete weeks only,
the current week apart (F4); a bridge rehearsal through the forward
readers before the freeze (F7); MARKET-1's freeze lists the 11 paper files
it imports or reads with (F8); the low findings as the review recommends;
the beside lines in tiers — T, R, B8 and B9 may join later as their own
arm, then J, X, B7, B10, S and C if the build runs long — and never delay
the freeze; the plan's twelve questions as recommended, except Q4 (F1) and
Q12: **the burst stays 30 for all callers** until a reader needs more (not
MARKET-1, which reads nothing from the API). The gates as for the paper
experiment: no MARKET-1 data is read until its rules are frozen and its
hash is recorded here after a fresh rules review; nothing is deployed or
registered without the owner.

2026-11-13 (MARKET-1 to be planned — the owner, after MARKET-FIND: "ok,
everything clear now, approve, continue with market-1 plan", and on where
they would act: "i can start on polymarket if that easiest for me to know
exact numbers, later i can move on binance or similar"): **MARKET-1, A SECOND
FORWARD PAPER EXPERIMENT ON THE MARKET ITSELF, IS PLANNED WITH ONE DECIDING
LINE, WAVE; MARKET-PLAN WRITES IT.** The evidence: MARKET-FIND
(`docs/reviews/market-find-2026-11-13.md`; exploring, on the 68 days before
the cut): when at least two different pool accounts were liquidated on the
same side in small coins within 60 minutes, the coin came back +309.7 ±
67.7 bps over 24 h (153 entries on 47 days; net +297.1; September +255,
October +321; outside a wave nothing); the supervisor's own code gives 174
entries with the beta months, +285.1 ± 58.8 (`verify/MARKET-FIND/wave.mjs`
in the supervisor folder). **Ruled, as MARKET-FIND recommended (its
section 6):** (1) one deciding line, WAVE, in place of three — JUMP and TAPE
printed beside, with every liquidation outside a wave, the late entries and
the market's own moves; (2) the wave counted by accounts (two or more); (3)
held one day; (4) the prints beside as its section 3 names them, XREV among
them; (5) **Polymarket Perps first** — every position priced at
Polymarket's own recorded book as a taker; BTC and ETH at the wave's
moments stay prints. **MARKET-PLAN's frame:** MARKET-FIND's exact rule W
(section 3) as the starting point; the data from the collector's
recordings (books and trades since 2026-11-10 20:59:54Z) and the pool's
fills, read after the freeze only; the same three looks as the paper
experiment (2026-12-19, 2027-02-06, 2027-05-08) and the whole 5% over
them; keep, drop or too few, as verdicts on the test; the recordings, the
collector's database and the paper experiment's new data stay sealed until
MARKET-1's rules are frozen; then a fresh review, the owner's approval, the
build and the freeze, like the paper experiment's. No new API reads unless
the plan shows a need and its cost.

2026-11-13 (the market lead — the owner, on STRATEGY-REVIEW's MARKET-1:
"agree with all your recommendation", then "if you think additional research
narrowed research on this topic would help, then we can do it before plan
Market-1. you can use again Fable5.2 … once we have new info … we will
decide about Market-1. then we build market-1 and finally we are doing
overview"): **BEFORE MARKET-1 IS PLANNED, ONE INVESTIGATION ON THE OLD WEEKS,
MARKET-FIND (Fable 5.2), SHARPENS THE SMALL-COIN LEAD AND SEARCHES FOR AT
MOST TWO MORE MARKET PATTERNS; THE RECORDINGS STAY SEALED UNTIL MARKET-1 IS
FROZEN.** The lead (STRATEGY-REVIEW, `docs/reviews/strategy-review-2026-11-12.md`,
M1, M2, 3.1; exploring, on weeks already studied): in small coins (every
crypto market but BTC and ETH) the price came back after a tracked
account's liquidation (+147.6 ± 36.4 bps over a day, nine of ten weeks)
and after very large 15-minute jumps (+70.9 ± 23.6), and moved the takers'
way where trading was heavy (+36.3 ± 9.1); nothing in BTC, ETH, gold, oil,
indices or stocks; one falling stretch produced every hint. **Agreed for
MARKET-1 when it is planned** (the supervisor's four recommendations): its
three lines (LIQ first, JUMP, TAPE), each a $1,000 paper position priced at
the recorded book and held a day; small coins decide, the large markets
printed beside; the owner says where they would act; the cheap additions
beside the running experiment (its copies priced again at the recorded book,
the "past follower result" list, the opposite side's result) in the same
plan, as new arms with their own start. **MARKET-FIND's frame:** part A
makes the lead's rules exact (what counts as an event, its size, the delay,
the hold, the cells, what a live tool could see, what a real order could
capture, a matched baseline of random minutes in the same coin and hour,
the falling stretch and the bunched days); part B searches for at most two
more candidate lines with a fixed cap on tries, each written down before it
runs; everything is exploring and decides nothing; only data before
2026-11-07 is read (books do not exist before 2026-11-10, so book patterns
wait). Then the owner decides MARKET-1, it is planned, reviewed, built and
frozen like the paper experiment, and the supervisor gives the overview.

2026-11-12 (THE FREEZE of the paper experiment — rules.md R0; the supervisor
records it after verifying it on its own path, inside the owner's approval
of the plan): **THE PAPER EXPERIMENT IS FROZEN: `apps/poller/experiment/FROZEN.sha256`,
61 FILES, SHA-256 `d04d3cd81945057aba59d3475190596090b8962626cec502b006d7430f2ef31c`,
COMMIT `eadf1e5`, TAG `paper-freeze-1`.** Written by `tools/paper-freeze.cjs
--final` at 2026-11-12T20:19:52.394Z on the clean tree of `e3b1700`
(toolchain in its head: node v24.13.0, typescript 6.0.3, zod 4.6.7, mongodb
7.7.0, pino 10.4.0, pnpm-lock `266a3797…`); it lists `dist/paper.js`, 22
files of `dist/paper/`, the 35 vendored files of `research/` (the kit
`2d3667b5…09aa`, lib-exits `612d5836…6330`) and `experiment/` `rules.md`,
`seed.sha256` and `favourites.txt`. **F0 = 2026-11-12T20:19:43Z** (the first
line of `favourites.txt`, 9 s before `--final`; PAPER-FIX-CHECK N6);
`favourites.txt` (SHA-256 `c3fb45f7…d273`) holds exactly PAPER-FAV's 20
(decisions 2026-11-12, "the favourites list fixed before the freeze").
**The supervisor's checks:** a fresh build, then every one of the 61 listed
files equal to its hash; `pnpm verify` green (35 files, 282 tests); the tree
clean; the favourites equal to PAPER-FAV's file; the access scans of
PAPER-FREEZE clean; nothing after the cut read by anyone before this entry.
**The road to it:** PAPER-BUILD's parts 0–5 and its closing tasks;
PAPER-RULES-REVIEW and PAPER-CODE-REVIEW ("after these fixes"); the batch of
13 fixes; PAPER-FIX-CHECK ("not yet, because of four small slips");
PAPER-FREEZE's four mends (no banned word the page can print, the night
test's timeout, R14, R15, R17) and the edge fix (`867ddc6`: MAIN always has
a verdict — WITHHELD when all its copies are unpriced, TOO FEW TO TELL with
no SE). **Accepted with the freeze, as frozen** (PAPER-FIX-CHECK's R-L11):
the builder's operating numbers — the schema alarm at more than 1% and at
least 10 rejected rows, an immediate stop at 1,000; the list accounts'
safety cap of 50 pages a day; the breaker at 5 failed reads in a row; the
120-second wait of a request. **From here:** a change to any frozen file is
a defect fix or a new arm (R0), never a quiet edit; the gate opens on this
list only. **Next:** the owner's deploys — the collector (its generic
User-Agent and its burst of 15), then `-Program paper` — and
`register-tasks.ps1 -PaperOnly` from an elevated PowerShell; the first run
catches up from 2026-11-07; looks at 2026-12-19, 2027-02-06 and 2027-05-08.

2026-11-12 (the favourites list fixed before the freeze — the owner, "keep 20
and mark the 8", on the supervisor's recommendation): **ARM F IS THE 20
ACCOUNTS OF RULE 7'S TOP FIFTH AT THE CUT; THE 8 OF THEM WITH A PROFIT
FACTOR OF AT LEAST 1 IN THE FORMATION WEEKS ARE PRE-REGISTERED AS A SUBSET
PRINTED AT EACH LOOK, DECIDING NOTHING.** PAPER-FAV (`workers/PAPER-FAV/` in
the supervisor folder; FIND-6's frozen code, `FROZEN.sha256` 17 of 17 equal,
the kit `2d3667b5…09aa`; no outcome computed, nothing at or after the cut):
100 CONFIRM candidates on [2026-10-10, 2026-11-07) (5 holdout), 41 eligible
for rule 7, all scored; rule 7's own top fifth (k = 20) holds no holdout
account, so the 20 are exactly it — `favourites-20.txt` SHA-256
`0f6991d1f70c2ef9fcdb3caf9114a6303e951c8e0cf3351024b396ca5005231d`. Only 8
of the 41 eligible had a profit factor of at least 1 after base-tier fees in
those four weeks (rule 7 ranks and has no floor; rank 1's PF is 70.3); all 8
are in the 20, and 12 of the 20 lost money then. **The subset, fixed now**
(sorted; SHA-256 `7ca52f0971aa7fc5b813b9619adc5fed4ada9b9617316b9863e7bbc1d247a8ff`):
0x42aed3bb770d7f028d1a649dc9689f5e1a638a58,
0x5b61eb45bd64d4904e76f69a9f165d7415606926,
0x5fb1929cc30f66758a2668cdab2b5b2219f85a62,
0x7b3675c9e62467a8795cc05f52d246381f4417a2,
0x85792dbba27bdbdbd89b6d06209abc9e9d5ea60d,
0x9f801ef76b7976195a280c95ae84d9aed93d778f,
0xa6a279ae513d06acd243eba5406e3cebed342fb8,
0xfbdbb8db386baefdc4d9a1af75b0d0b1bcc4dece. At each look the supervisor
prints FAV's figures for these 8 and for the other 12 from the day's
position log, with MAIN's statistic, labelled exploring; no code change
and no verdict word. The 20 are written to `favourites.txt` at the freeze;
F0 is the freeze's instant (R2).

2026-11-12 (the favourites line's accounts — the owner, "please find 20
accounts which most fit our requirements we will work test on them. so i
don't need to send you anything", on the supervisor's proposal): **ARM F
(THE FAVOURITES, BESIDE MAIN, DECIDING NOTHING) HOLDS THE 20 ACCOUNTS THAT
BEST FIT THE OWNER'S "DISCIPLINED TRADERS" FILTER ON THE WEEKS BEFORE THE
CUT.** The filter is FIND-6's rule 7 (decisions 2026-11-11, "entry 6 runs
with the owner's filter"; with RULES-REVIEW-6's M1), computed by FIND-6's
own frozen code on its CONFIRM formation window [2026-10-10, 2026-11-07)
over the notional board's candidates (FIND-6 R2, R12); the first 20 in rule
7's order that are not holdout accounts (the experiment refuses those). The
list uses only fills before the cut, so it cannot be fitted to the weeks it
is tested on; FIND-6 found the filter's top fifth no better on the old
weeks, and this line tests it forward. Computed by PAPER-FAV (no repository
change), checked by the supervisor, written to `favourites.txt` at the
freeze; F0 stays the freeze's instant (ruling Q5, as frozen in R2). MAIN —
the slow traders by rule, about 160 accounts — still decides; every
directional trader (BROAD) and the other lines stay beside it.

2026-11-12 (PAPER-BUILD's fixes after the two fresh reviews — its technical
calls inside the supervisor's batch, commits `1d720b7` … `e0c7540`): **THE
BATCH IS IN; THE DRAFT LIST IS `34df20ff…9714` (60 FILES); NOTHING IS FROZEN.**
**(1)** `look()` takes `daily()`'s `io`, one rule-book reader for both; the
band is tCritical(2·normalUpper(z), days − 1) × SE_day. **(2)** The box reads
"Look k (date): the main line V. <sentence>", plus "Next look <date>." unless
V is KEEP or DROP; the next look is the first without a result; the day's
record, manifest and backup come before the page. **(3)** Favourites are
lower-cased and each once; `checkFavourites` (form, CUT ≤ F0 ≤ the freeze's
instant, no holdout) is the program's own, run by `paper-freeze.cjs`.
**(4)** `besideLines` in each look's result (MAIN's voted copies, COMP on
BROAD's too); only MAIN's line has a verdict and a sentence. **(5)** A split
event is known by its JSON text; its days run from the record that first
lists it to the one that drops it, both included, open while listed.
**(6)** `scoreInput` keeps the fills before END for a run and a look alike.
**(7)** The collector's burst 15 delays the first request of a restart by up
to one burst window: the restart test's "at once" bound is now 10 s; the
night pass's peaks stay 49 / 12. **(8)** The freeze tool builds `dist/paper`
afresh (also for the draft); `register-tasks.ps1 -PaperOnly`. **(9)** The
collector's first record is its earliest document; the fee alarm covers the
primary markets' categories. **(10)** The seed's builders live in
`scripts/paper-seed.ts` (type-checked and tested, never built);
`EMPTY_RULE_BOOK` and `CLOSED` in the tests; the kit's competition module is
no longer loaded. **(11)** 50 deliberate breaks of what decides or is frozen:
49 killed; the one left, an entry exactly at END, is equivalent (no fill at
or after END reaches `score`). **(12)** The lows done, but those skipped with
a reason in PAPER-BUILD's progress. **Checked:** the old-weeks reproduction
re-run equal line for line; `pnpm verify` green.

2026-11-12 (the paper experiment's two fresh reviews — the supervisor's calls
inside the approved plan, before the freeze): **BOTH REVIEWS SAY "AFTER
THESE FIXES"; ONE BATCH OF FIXES GOES TO PAPER-BUILD, THEN EACH REVIEWER
RE-CHECKS ITS OWN FINDINGS, THEN THE FREEZE.** PAPER-RULES-REVIEW
(`docs/reviews/paper-rules-review-2026-11-12.md`, `3e59dd3`: may freeze
after these fixes; 1 high, 5 medium, 14 low) and PAPER-CODE-REVIEW
(`docs/reviews/paper-code-review-2026-11-12.md`, `b4320cc`: after these
fixes; 2 high, 6 medium, 11 low); both found the same two faults first —
`look()` and its report are tested by nothing, and the look's Student-t
band is always about 0 (`2·normalUpper(z)`, not `2·(1 − normalUpper(z))`);
both confirm the blind gate, the collector equal apart from its
User-Agent, and MAIN's numbers recomputed equal. Their access scans: clean
(every collector path named was a grep or a stub). **The calls:** (1)
`look()` takes `daily()`'s `io`, and the look and its report get end-to-end
tests; the band uses the day-cluster error, as R14 says; (2) **the daily
page shows the latest look's MAIN verdict and sentence** (the owner's page
ruling); (3) **favourites:** lower-cased when read, checked at the freeze
(format, F0, no holdout, no duplicates), and a holdout favourite is
refused; (4) **every line promised at the looks is printed by `look`** —
STOP2, STOP5, DAYS7, the JUMP and NOTIONAL splits, COMP, the map's closed
copies, with and without gap copies — with MAIN's statistic (the mean net
per copy and its two-way error), **no verdict word for any line but MAIN**,
tested; (5) **a stock split:** the `stock-splits` events have never been
seen non-empty, so the rule needs no knowledge of their shape — a market
named by an event's numeric `instrument_id` (else every equity market) is
out of the primary cells on every UTC day its event is in the recorded list,
a copy of it open across such a day is unpriced, and both are counted,
printed and raised as an alarm on the page (the approved plan said "no split
on t's UTC day"; the build had made it "counted and flagged"); (6) **the
look reads nothing after its own end** (END_k), so a later exit never
reaches an earlier look; (7) **the bursts keep the owner's rule of 30 in 5 s
for all callers** (decisions 2026-11-07): the collector's burst becomes 15
and the experiment's 15 (the collector's measured peak is 12 in 5 s; its
share of 50 a minute is unchanged), tested; (8) `paper-freeze.cjs --final`
refuses a dirty tree and ties `dist` to HEAD; the paper deploy's smoke test
runs the copy's own gate; `register-tasks.ps1` can register the paper task
alone, without touching the collector's three; (9) the page is written after
the day's record; a backup failure and dropped records are visible on the
page; (10) the rule book before the collector's first record (2026-11-11
15:47Z; 11 documents so far, counted by the supervisor without reading
values) is the kit's `rulebook.json`, and a fee category missing from the
schedule raises an alarm; (11) the dead code in the frozen scope is deleted,
the seed's builders move out of `src/`, `start` and the rehearsal stay (for
re-running the old-weeks reproduction after a defect fix); (12) the
surviving deliberate breaks that touch what decides or what is frozen are
killed by new tests; (13) the low findings as each reviewer recommended
(the word "follow" off the page, R1's order enforced, R0's defect fix
means a new list, the entry price and F16(e) in the rules, R12 when the
error cannot be computed). Then a new draft freeze list, `pnpm verify`
green, and each reviewer re-checks its own findings against the fixes.

2026-11-12 (PAPER-BUILD's closing tasks — daily() end to end and the backup
task's time, the supervisor's two tasks before the rules review; commits
`6fa14d3`, `c40c4ea`, `7c6f978`): **A RUN'S OUTSIDE INPUTS ARE ONE OPTIONAL
ARGUMENT OF `daily()`; THE BACKUP TASK'S TIME IS COMPUTED FROM UTC.** **(1)**
`daily(config, log, stage, now, io)`: `io` holds the package folder, the
fetch and clock of the run's client, the rule book's documents and the run's
fixed inputs, each by default the real one (`src/paper.ts` passes none). Two
more than the fetch and package root the task named, because a unit test has
no database and because the kit's pool, markets and panel pin are the kit's
own data under its fingerprint, so a synthetic world cannot come in through
the package folder: the test takes the real `fixedInputs` from its package
folder and replaces only those three. The package folder now also gives the
kit, the experiment's files and the panel's pin (in production the same
folder as before, the program's own). **(2)** `test/paper-daily.test.ts`
drives `daily()` over a synthetic world — the gate's two refusals (no list;
a frozen file changed) with no request sent; a first run from 02:32Z paused
before 02:35Z, resumed at 04:00Z and equal, copy for copy and in its state,
to one run without the pause; a normal day (the list and the day's market
data only); a Monday's sweep; the trader's exits after the cut on every copy;
the log of every copy, the log's record, the page's five lines, the
positions page, the manifest and the backup — and kills 21 of 21 deliberate
slips in `daily()`'s glue. **(3)** The backup task: `Get-DailyUtcStart 5 20`
in place of the literal `06:20` (in memory today both store 05:20Z; a
registration on 2027-04-01 would store 04:20Z from the literal, 05:20Z from
the computed time); nothing registered. The draft freeze list again: 60
files, `d6698333f611133fa9388c86bcaa22f5c7252772128224445170caaaec436db4`
(only `dist/paper/daily.js` changed).

2026-11-12 (PAPER-BUILD's four questions — the supervisor's technical calls
inside the approved plan, before the freeze and before any week after the
cut is read): **THE BUILD STANDS AT "RULES READY"; ITS FOUR QUESTIONS ARE
RULED AS IT RECOMMENDED; ONE END-TO-END TEST COMES BEFORE THE RULES REVIEW.**
Checked on the supervisor's path: `pnpm verify` green at `51bf0a9` (32
files, 248 tests; `tsc` on src and test 0 errors); the tree clean; the
collector's run copy untouched (`dist\index.js` of 2026-11-11 21:22) and its
task Running, its recordings fresh; the access scans — every call naming a
collector path wrote code or docs, none read the recordings, the database or
the run folder; the only holdout name opened was the list `holdout.json`, no
holdout capture. The reproduction is equal to tables the supervisor had
re-priced with its own code (FIND-6-EXITS's 1,918 copies and X3's 1,366):
1,700 of 1,700 non-holdout copies with 0 difference, X3's held 24 h over
FIND-3's voted set +9.1 ± 13.7 (1,293). **The rulings:** (1) X3 needs no
per-copy file: equal by definition, to its printed digits and to FIND-3 for
1,104 of 1,104; (2) **the matched null's removal set is the line's accounts
at the entry's Monday** (fixed at M, no look-ahead), not FIND-3's
whole-study set, which cannot be defined going forward (296 of 1,203 old d
move, at most 40.2 bps); (3) **a Monday's label and habits come from the
fills before that Monday only** (the kit's index looked ahead through an
order event straddling M; 4 old rows of one account change); entries and
exits keep the whole fills; (4) the reproduction leaves out the 6 holdout
accounts' copies, which the experiment never opens. **Before the rules
review:** one test that drives `daily()` end to end with an injected fetch
and root over a synthetic world (the builder's own recommendation), and the
backup task's trigger computed from UTC like the paper's. The builder
reached its context limit once and compacted (peak 966k), so its Final
review goes to a fresh worker.

2026-11-12 (PAPER-BUILD's technical calls — the paper experiment's build,
parts 0–5 to "rules ready", inside the plan approved the same day; commits
`51724ca` … `08147f5`): **THE EXPERIMENT IS BUILT TO ITS RULES; NOTHING IS
FROZEN, DEPLOYED OR REGISTERED; THESE CALLS.** **(1) Where the rules live:**
the experiment's routes, schemas and the id-keeping parse are in
`src/paper/routes.ts`, not in the collector's `ROUTES` (the review's F4 wins
over the plan: every rule that decides what is read is frozen); the client
takes a route table, share, burst and User-Agent per instance —
`data-collector/1.0` (the poller, REST and WebSocket; its behaviour otherwise
equal, the night test's peaks 49 / 12 unchanged) and `data-reader/1.0`
(120 / 15); an HTTP error hands its status and body to the caller (a 400
"account not found" is a standing hole). `once.js` is deleted. **(2) The
stored fills** are per account (`fills\<addr>.json.gz`, the validated rows,
ids as digits), rewritten whole, not the plan's `fills\<run date>`: the
scorer takes one account at a time in bounded memory; the raw replies stay
the append-only record. **(3) The reads:** the schema alarm at more than 1%
rejected rows and at least 10 (1,000 stop the run at once), a read with a
rejected row applied only at the run's end without the alarm; the list's
safety cap 50 pages an account-day; five failed reads in a row end a run;
requests wait up to 120 s so a backed-off one is never dropped; a funding
row is filed under the hour its stamp falls in (equal to the kit's panel on
180 market-days). **(4) A Monday's label and habits come from the fills
before M only** (rules.md R5; the plan's R4 built them on the whole fills):
an order event whose fills straddle M changed 4 of 11,526 old rows (one
account's long share) the kit's way; the facts are then fixed once read and
cached exactly (F11) — the supervisor's question Q3. **(5) d's removal set is
the line's accounts at M** (the plan's R10), not FIND-3's whole study: 296 of
FIND-3's 1,203 d move, at most 40.2 bps — question Q2. **(6) The experiment
runs from its own run copy** (`deploy.ps1 -Program paper`,
`E:\polymarket-follow-run\paper\`), so a collector deploy never changes what
it runs nor waits for its run (F11); its task's trigger is 04:00Z computed
from UTC (stored `04:00:00Z`, checked in memory, nothing registered). **(7)
It backs itself up** after each run to `PAPER_BACKUP` on E: (Q-F): the state,
logs, manifests, looks, page, seed and pre-cut panel. **(8) The daily log
writes every copy's state each day** (gzip), not changes only (F18): the
honest record first; about 1 MB a day. **(9) Venue lines** are look-report
arithmetic outside rules.md (F18); MAKER and VWAP are not built (Q-D).
**Checked:** the seed equals the kit's `readAccount` fill for fill for 1,602
of 1,602 accounts (3,403 more rows: one account's ids above 2^53, which
R2-STYLE stored rounded through a double — the API's are exact); the market
object from the copied panel equals the kit's for 91 of 91 markets bit for
bit; live, pre-cut windows only (777 calls, 5,060 tokens, peaks 120 / 15):
20 accounts' week and 180 market-days equal row for row, 90 joined objects
bit for bit; the reproduction at END = CUT — FIND-6-EXITS 1,700 of 1,700
non-holdout copies equal with 0 difference (exits copied, held 24 h, D = 0;
the 218 others are holdout accounts, never opened), X3's 1,366 copies at its
printed figures (−9.9 ± 9.1; +9.1 ± 13.7; 1,104 of 1,104 per entry), FIND-3's
d 1,086 of 1,203 (the rest in hours of the holdout's trades), labels at 26
Mondays 11,525 of 11,526 pool rows, the main line 1,137 / 157 and 525 / 61;
the rehearsal's compute 12.6 s cold and 4.9 s cached; 45 of 45 deciding
mutants and 29 of 29 of the reads' killed. The draft freeze list:
`FROZEN.draft.sha256` `23f0e3434f3810781b5e30c98bfd8a0cee92ca1e5830b7ac12670932771f4fd4`
(60 files; the scratch deploy holds exactly them).

2026-11-12 (the paper experiment's plan approved — the owner, "yes approve,
lets proceed like that", on the supervisor's recommendation to approve the
plan with every fix of its fresh review and every recommendation; the
owner's aim, the same message: "final idea is to make profitable tool for my
purpose, to understand everything, have prof for that, and basically filter
all 'wrong and bad' and try to found the best results and confirm them"):
**PAPER-PLAN IS APPROVED WITH PAPER-PLAN-REVIEW'S FIXES; PAPER-BUILD BUILDS
IT IN PARTS.** Plan `docs/reviews/paper-plan-2026-11-12.md` (`55e3387`);
review `docs/reviews/paper-plan-review-2026-11-12.md` (`9aac35f`; may be
approved after the fixes named; its two code findings F5 and F9 confirmed by
the supervisor: the kit and lib-exits hold 0 CR bytes, and lib-exits'
`planCopy` compares with the cut at its lines 37 and 45). **The rulings:**
the plan's eleven questions as recommended — Q1 the 24 h cost map is not in
MAIN (its closed cells printed apart); Q2 the whole pool read once a week;
Q3 a cap of 10 pages an account-week for accounts off the lists, with a
safety cap for list accounts; Q4 the code in `apps/poller` (a second entry
point) with the kit and lib-exits vendored byte for byte; Q5 the owner's
favourites count from the freeze, not from the cut; Q6 five lines on the
daily page, the rest at the looks; Q7 as the review's Q-B: **Finotive is
shown only as its rule against copying (help article 955, terms §7.10) and
its cost facts, with no result line and nothing on the daily page**; Q8 the
exams of 2026-11-30 and 2026-12-19 are closed (nothing registered) and
2026-12-19 is the experiment's first look; Q9 and the review's Q-C: D1 and
D2 run after the freeze, with their own budget share; Q10 the experiment's
share of 120 tokens a minute and 15 in 5 s; Q11 the first keep or drop ends
the test — and the review's Q-A one weekly loop for the first run, a missed
day and Mondays (list accounts uncapped, resumable, the figure by formula),
Q-D MAKER and VWAP a separate sub-part that may join later as its own arm
and never delays the freeze, Q-E the freeze hashes what runs and tags its
commit, Q-F the pre-cut panel and the seed copied into the experiment's
folder, checked by manifest and backed up, Q-G when KEEP and DROP both
hold, DROP wins. Every finding F1–F18 is folded into the build and its
rules. **Also:** requests to outside services carry a generic client name
(code-rules, 2026-11-12): the client's User-Agent becomes an option, the
experiment passes a generic one, and the collector's constant changes too
(deployed with the experiment by the owner); `once.js` is deleted. **The
gates:** nothing after the cut is read, and the code refuses it, until
`rules.md` is final, a fresh rules review says "may run" and the supervisor
records the frozen hash here; nothing is deployed or registered without the
owner, who registers the experiment's task.

2026-11-12 (the paper experiment runs daily and gets a page — the owner, "i
think it is better to make some page where i can test that paper in real
time", then, on the supervisor's two-step proposal, "ok, agree, add it"):
**THE EXPERIMENT'S SCRIPT RUNS ONCE A DAY, NOT ONCE A WEEK, AND A SIMPLE
LOCAL PAGE SHOWS ITS LOG.** The page, read only: every paper copy (trader,
market, the follow instant, the price after the delay), which are open and
which closed, the running result per line and per trader with its error
band, and "too early to judge" until each look — keep or drop appear only
at the three looks (2026-12-19, 2027-02-06, 2027-05-08) and are verdicts on
the test, never instructions to trade. Why daily and not live: reading
about 160–330 accounts every half minute would not fit the operating budget;
once a day is cheap. The rules stay frozen whatever the page shows. Live
alerts and live paper copies for the owner's favourites come with v1's app
(its plan stays planned for early December), on the same page. PAPER-PLAN
adds both to its plan: the daily run's budget, where the page lives, how v1
reuses it.

2026-11-12 (APPROACH-REVIEW accepted — the owner, "ok, agree with all
recommendation", on the supervisor's seven recommendations after the Final
review): **THE FORWARD PAPER EXPERIMENT FOLLOWS SLOW TRADERS BY A RULE, NOT
A RANKING, WITH TWO READINGS OF EVERY COPY; ITS PLAN COMES NEXT.** Report
`docs/reviews/approach-review-2026-11-12.md` (`1924799`; its own Final
review `dcf6d21`…`ebf3d03`: F1 high, the main line's rate was taken without
its own minimum of closed cycles, corrected). **The supervisor's own path:**
X3 re-priced with independent code, all 1,366 copies equal; the main line's
counts re-counted from the pool's entries, equal to FR1 (525 copies in the
last 4 weeks before the cut, 131 a week, 61 traders; with a minimum of 3
closed cycles 284 a week, 157 traders; every directional entry 936 a week,
326 traders); a rough scaling of X3's error agrees with the corrected
visible edges; both access scans 0. **The design, as accepted:** who — the
kit's frozen pool, the 100 holdout accounts left out, an entry counting when
its account is labelled directional on the 14 days before the entry's
Monday; the main line — traders whose median hold over the 30 days before is
6 h or more **with at least 3 closed cycles** (question 7), the 10-cycle line
printed beside; what — openings and flips in the primary cells, every hour,
$1,000 a copy at t + R8's delay at a taker's costs with funding; two
readings — the money with the trader's exits copied (FIND-6-EXITS's rule)
and the judgement, d at 24 h against the exact matched null; the data from
the cut, 2026-11-07T00:00Z, with the rules frozen before anyone reads those
weeks; looks at 2026-12-19, 2027-02-06 and 2027-05-08 with the false-pass
budget spent 0.5% / 1.5% / 3%; **keep** when the money's lower bound is
above zero and d is above zero, **drop** when the money's upper bound is
below **δ = +10 bps a copy** (the owner's, on the recommendation), otherwise
too few to tell — verdicts on the test, never instructions to trade; beside
it, deciding nothing: every directional entry (a clear answer on copying
everyone by about 12 bps at the first look), the 10-cycle line, maker
entries with a fill model, stops and a 7-day limit, day-holders, "after a
jump", and **the owner's own favourites**, frozen at the start and judged
whole; the pool only (the wider universe a later arm); **first a weekly
script**, v1's paper log reusing it later. What it can see, with 10 cycles:
about 54 / 33 / 21 bps a copy at the three looks (with 3 cycles more copies,
its noise not yet measured); with no skill "drop" is likely by February or
May. Not run: measuring the 3-cycle group's noise on the seen weeks (the
forward data will show it). **Next:** a plan subagent writes the exact
rules and the build (reading fills past the cut within the budget, the
prices from 2026-11-07 to the collector's start, the kit's pricing past the
cut, one cost line per venue the owner named — Finotive, Binance futures,
Polymarket — from their official pages), a fresh review of the plan, the
owner's approval, the build; the exams of 11-30 and 12-19 and the dated
checks D1 and D2 are ruled in that plan.

2026-11-12 (the way forward — the owner, after FIND-6-EXITS: "yeah, we will do
paper experiment, just want to talk little bit more about everything before i
move on that implementation. i simply want to be sure that i've found
initially the best possible cases and scenarios for use"; then "yeah, let's
do that new search then … also let require from agent to help us to find a
right approach and way of using of this … now we need to understand how to
'handle them' and beside what we know to found 'balance' and find right
combination … please run that agent"): **A FORWARD PAPER EXPERIMENT IS THE
WAY FORWARD; FIRST ONE RESEARCH SUBAGENT, APPROACH-REVIEW, FINDS THE BEST
DESIGN FOR IT.** The owner accepts losses as part of the game; what counts
is that the money won exceeds the money lost. APPROACH-REVIEW (Opus 5.5,
max; brief in the supervisor folder) reads every result so far and answers:
(a) the outside evidence on copy trading, from primary sources — when, if
ever, following has paid and why services that sell it can thrive while
copiers lose; (b) the six untested directions the supervisor named the same
morning — traders who hold for days with their exits copied; cheaper
entries (limit orders, a maker's costs); the later batch's three candidates
("after a jump", the counter-move before agreement, the top accounts' long
holds); what more weeks of the collector buy (the smallest edge a test could
see, month by month); using the data other than by copying (crowd
positioning, liquidation waves), watch-only; prediction-market traders —
each with whether our data can test it now or needs new weeks; (c) **how to
handle the known limits — the balance and the combination** (the owner's
ask): who to follow by a filter fixed in advance, how to copy (exits,
holds, which markets and hours, an entry worth copying only when its usual
move covers its costs), the costs to assume, limits on losses, how long the
experiment runs and the rule by which it is judged, and what each outcome
would mean. **Exploring on the weeks before the cut is allowed and counted:**
each exploration is written down with its reason before it runs, its
numbers are labelled exploring, and nothing on those weeks decides — the
forward experiment, on weeks nobody has seen, is the test. The blind store,
no API calls, never the collector's recordings, database or run folder.
Never personal trading advice: it recommends research and experiment
designs and what the app shows, never what to trade. The exams of 11-30 and
12-19 and the dated checks D1 and D2 are ruled with the experiment's plan.
Then: the experiment's plan, the owner's approval, the build.

2026-11-12 (FIND-6-EXITS's result — the supervisor records the exploring
check; it decides nothing, and the way forward stays the owner's): **COPYING
THE TRADERS' EXITS TOO DOES NOT MAKE ANY GROUP PAY: EVERY GROUP STILL
LOSES.** Report `docs/reviews/find-6-exits-2026-11-12.md` (`4f2a567`; one
run 2026-11-12 08:38:07–08:38:09Z; FROZEN `9aea7d09…`; its plumbing check:
held 24 h equal to FIND-6's `netBps` for 1,918 of 1,918 copies). **The
supervisor's own path:** an independent re-pricing of all 1,918 copies
(`verify/FIND-6-EXITS/reprice.mjs` in the supervisor folder: the exits walked
from the kit's order events, priced in one pass as R8's `mirroredReturn`,
not as a sum of legs) equals the worker's for every copy to 5e-13 bps, with
the same open-at-the-cut flags; page one's group means rebuilt from it;
both access scans 0. **Per copy, ± one error by trader:** every candidate
−15.8 ± 4.9 bps with exits copied against −13.0 ± 10.1 held 24 h (paired
−2.9 ± 9.5); the owner's filter's top fifth −23.9 ± 11.5 (held 24 h −53.0),
its rest −13.7 ± 5.7 (−2.6); top − rest −10 ± 13 bps (exploring p 0.43);
much of the top fifth's gain is one account (`0xc58a5ade…`; without it +13
± 19 bps instead of +29); rule 4's top fifth goes from +21 to −18; no rule's
top fifth is above zero. The traders leave fast (median 47 min; 44% of
copies within 30 min): before costs the copies lost 5.4 bps, a round trip
costs about 10.4. An instant follower (D = 0) loses 16.6: the ~80 s delay
costs nothing measurable here. A liquidation closing the whole copy changes
no group by more than 2.5 bps. 20 copies open at the cut (−575 bps on
average; without them every candidate −9.9), 0 unpriced, 0 crossing a gap
in the capture. With R8's −20.23 bps for its 50 traders with exits copied
(decisions 2026-11-09), the two measurements agree: on these weeks,
copying exits did not rescue copying. **Noted for later (FIND-6-EXITS's
questions, as recommended):** "copy the exits of disciplined traders" only
as a later batch on new weeks with its rules first, copies under about 5
minutes priced by the second (19% of copies here); a forward paper log keeps
both readings of every alert, as R3 already plans (the fixed horizon for
the judgement, the copied exits for the money) — the owner's call when the
way forward is planned.

2026-11-12 (the exploring check's Q1, before any outcome is seen — the
supervisor's correction of its own wording, within the owner's "Yes, run the
check"): **A PARTIAL LIQUIDATION CLOSES ITS SHARE OF THE COPY, NOT THE WHOLE
COPY.** Point (2) of "an exploring check: FIND-6's copies with the trader's
exits copied" said "all of it on a close, flip or liquidation"; the rule it
cites, R8's "mirrored_money", says "all of it on a close or flip", and the
kit's `buildEntries` gives a partial liquidation its share. The words "or
liquidation" were the supervisor's slip; FIND-6-EXITS found the conflict
before pricing anything (no copied-exit number was computed: its plumbing
check only, 2026-11-12 08:32Z, held 24 h equal to FIND-6's `netBps` for 1,918
of 1,918). Why the share: it is R8's rule, so the result compares with R8's
−20.23 bps; a follower at the trader's leverage is cut by the same share.
Beside it, deciding nothing, one line per group where every liquidation fill
closes the whole copy (115 partial liquidations fall in 79 copies of 39
accounts; 15 whole ones close the copy under either reading). Also accepted
as FIND-6-EXITS fixed them before any outcome: the hold is each copy's
share-weighted mean hold (median and quartiles; the time to the last leg
beside); a gap copy is a chain break after the entry's first event up to its
last exit used (to the end of the data while the trader is open); the
entry-weighted top minus rest is a top indicator's coefficient clustered by
trader (CR1, G − 1 degrees of freedom); a leg marked at the cut ends at
CUT − 1 ms, the panel's last minute (2026-11-06T23:59Z), funding of hours in
(tIn, CUT − 1 ms] only.

2026-11-12 (an exploring check: FIND-6's copies with the trader's exits
copied — the owner, "Yes, run the check", 2026-11-12 ~08:05Z, on the
supervisor's recommendation after FIND-REVIEW-6's F6): **FIND-6-EXITS
RE-PRICES FIND-6'S COPIES SO THAT EACH ONE LEAVES WHEN THE TRADER LEAVES; IT
DECIDES NOTHING.** FIND-6's weeks were looked at once already, so this is
exploring: logged, never registered, never a reason to re-run FIND-6 or to
try other numbers for the owner's filter on these weeks; a forward paper
test or a later batch on new weeks decides. Why the studies held a fixed
24 h (told to the owner the same morning): the random-trade yardstick must
be held the same way; a trader's exits can fake a win rate though never
money (R3's disposition trap); 1 and 6 h cannot pay a taker's costs (ruling
(5) of "RESEARCH-KIT accepted"). R8 printed copied exits once, as money, for
its 50 traders: −20.23 bps a copy [−42.23, −2.91], against −16.60 for its
fixed hold (`docs/reviews/r8-pretest-2026-11-09.md`). **Fixed before any
outcome is seen:** (1) **the copies:** FIND-6's deciding line, the same
1,918 entries of the board's candidates in both windows
(`F:\polymarket-follow-research\FIND-6\look-entries.jsonl.gz`), each entered
at its own follow instant t + D, priced as FIND-6 priced it (the kit's
`leg`, the taker setting); (2) **the exit, R8's mirrored money** (decisions
2026-11-09; R8's rules.json "mirrored_money"): each REDUCE, CLOSE, FLIP or
forced event of the trader on the entry's instrument and side after its
first fill (the kit's `buildEntries` exits) closes that share of what is
still open of the copy (all of it on a close, flip or liquidation), at the
event's first fill + the entry's own D; adds are not copied; a re-open
merged inside the 60-s window does not re-open the copy; the copy's result
is the share-weighted sum of the kit's `leg` from t + D to each exit instant
(fees on both legs, spread and depth at each instant, funding on what is
still open); (3) **the cut:** a copy still open at 2026-11-07T00:00Z, or
whose exit instant falls at or after it, is marked at the last mark the kit
serves before the cut with the exit's costs, and flagged; nothing at or
after the cut is read; an unpriced copy (a missing mark, the funding-hour
rule) is counted, never guessed; (4) **the groups:** each of the seven
rules' top fifth and its rest exactly as FIND-6's look formed them
(`result.json`, `board.tops`), and every candidate alike; (5) **printed per
group:** traders, copies, copies open at the cut; the follower's net per
copy with exits copied (the mean over copies, each alike, with its CR1 error
by trader); the same copies held 24 h, which must equal FIND-6's `netBps`
(the check of the plumbing); exits copied minus 24 h, paired; the win share
and the average win against the average loss (exits can flatter both, R3);
the median hold; and beside: the gross before costs, the same exits at D = 0
(what the delay costs), the closed copies only, without account 0xc58a5ade…
(FIND-REVIEW-6, F2–F3), without copies whose exit chain crosses a gap in
the capture (F5); and per rule the top minus the rest (Welch on the traders'
means, and the entry-weighted difference with CR1), every p labelled
exploring; (6) **how:** Opus 5.5, xhigh; tested on synthetic cases (R8's
mirrored-money test among them), the scripts frozen by hash before the one
run; the report `docs/reviews/find-6-exits-2026-11-12.md` with a plain page
for the owner; the supervisor re-prices a seeded sample of copies on its own
path instead of a Final review, since nothing is decided. Never advice.

2026-11-12 (FIND-6's result — the supervisor records the report and its Final
review; the way forward stays the owner's): **FIND-6 FAILS: NO RANKING RULE,
THE OWNER'S FILTER INCLUDED, PICKS TRADERS WHOSE NEXT WEEKS A FOLLOWER COULD
USE.** Report `docs/reviews/find-6-2026-11-12.md` (one look, 2026-11-12
01:57Z); Final review `docs/reviews/find-review-6-2026-11-12.md` (Sonnet,
independent code: every line, the race, the owner's table and all 2,009 copies
rebuilt from the raw fills — equal; the result stands with seven corrections
of wording). The race's smallest adjusted p was 0.112 (rule 3, the wrong way);
the owner's filter (rule 7): adjusted p 0.55, its top fifth −53 bps a copy
against the rest's −3, within chance; its eligible accounts −8 against −19,
within chance; copying every candidate lost about 13 bps a copy (about the
cost of a round trip, 10.2 bps). Not registered; the lift of decisions
2026-11-10 (2) ends here. **What the "no" covers (the Final review):** the
race could see only a large gap — about 65–95 bps a copy for most rules and
about 150 for the owner's filter (F1); the "worst run" column is mostly one
market event (one account's six long copies on 2026-11-04, F2); and every FIND
study judged **entries held a fixed 24 hours**, never a follower who also
copies the trader's exits — so a trader's discipline in cutting losers was not
tested (F6), a candidate for the owner's forward paper experiment or a later
batch.

2026-11-12 (FIND-6's rules review; two rulings fixed before its look — the
supervisor, on RULES-REVIEW-6's recommendations, within the owner's stated
intent for the filter): **THE OWNER'S FILTER COUNTS A LOSER STILL OPEN AT THE
WINDOW'S END; ITS TOP FIFTH IS PRINTED ALSO AS A FIFTH OF THE ELIGIBLE.**
Report `docs/reviews/find-6-rules-review-2026-11-12.md` (RULES-REVIEW-6,
Sonnet, a different model from the study's): FIND-6's rules are fixed, blind
and frozen, the code does what they say, the race keeps its size (re-run in
harsher null worlds: 4.9% and 3.8%); verdict "may look after these fixes"; no
high finding. **(M1) Rule 7, the owner's filter, scores every cycle still open
at the formation window's end as closed at that instant's mark, with a closing
taker fee** — an account that carries its losers open must not score as
disciplined (the owner's words: "more disciplined"); rule 6 stays as entry 6
writes it. **(M2) Rule 7 keeps the race's common k** (a fifth of all
candidates, so about half of its eligible accounts); printed beside, deciding
nothing: the filter's eligible accounts alone, and its top fifth of the
eligible (k = round(eligible ÷ 5)); a test pins k to the candidates. The
owner's page states that a "no" means "no difference large enough for these
weeks to see" (FIND-6 sees about 0.4 risk units, about 62–68 bps) and shows
each rule's top minus the rest with its error and its adjusted p. A run that
crashes before `result.json` exists is not a look. Every other finding
(M3–M5, L1–L13) is fixed by FIND-6 as the review recommends before it freezes
again.

2026-11-11 (entry 6 runs with the owner's filter — the owner lifts the gate for
one study, on the supervisor's proposal): **ONE MORE FIND STUDY, FIND-6: A RACE
BETWEEN RANKING RULES, THE OWNER'S "DISCIPLINED TRADERS" FILTER AMONG THEM.**
The owner ("yeah, let's do that. let try to filter, i really want to see
numbers"): decisions 2026-11-10 (2) stopped ranking traders when entry 1
failed (decisions 2026-11-11, round 2's FIND results); for this one study the
owner lifts that stop. Entry 1 tested whether a trader's past *follower result*
predicts the next weeks; entry 6 tests other ranking rules. **FIND-6 is entry 6
as IDEAS-REVIEW Appendix A writes it** — formation windows of four weeks ending
2026-10-10 and 2026-10-24, each measured on the two weeks after; the top fifth
against the rest by mean d; the best rule judged against the resampled best,
so choosing among the rules is paid for — **with a seventh rule, the owner's
filter:** eligible are accounts with a long, active history (a minimum of
closed positions before the formation window ends and activity in most of its
weeks, whatever the account's size), ranked by discipline (wins against losses
after fees, per dollar traded, with the depth of losing streaks) — its exact
formula written into FIND-6's rules before any outcome is seen. Every ruling
of 2026-11-11 applies: the notional board decides; d at 24 h against the exact
matched null, the class horizon beside; A.0-6's two p-values, the larger
deciding, the entry-weighted CR1 beside; risk units, short windows apart; the
competition strict; the kit's fingerprint pinned. **Printed beside, deciding
nothing, so the owner sees the numbers:** for each rule's top fifth, the
follower's net result per entry at a taker's cost and the delay of R8's
rule, its win share, its average win against its average loss, and its worst
losing streak. The same order as before: rules first, a fresh rules review,
the supervisor's go, one look, a Final review. If FIND-6 passes, its rule goes
to the exams of 2026-11-30 and 2026-12-19.

2026-11-11 (round 2's FIND results — the supervisor records the reports and
their Final reviews; the owner has read them; the way forward is the owner's,
still open): **NOTHING PASSES FIND: NO ENTRY IS REGISTERED, SO ROUND 2'S
EXAMS HAVE NOTHING TO CONFIRM.** Seven studies ran on 2026-11-11 on data up to
2026-11-07, each with rules frozen before one look and read first by a fresh
reviewer (decisions 2026-11-11, the FIND rules review); three fresh Final
reviewers (FIND-REVIEW-A, -B, -C) recomputed every deciding statistic with
their own code and found no error that could hide an effect; every result
stands (corrections marked in place). **Entry 1, the gate** (`find-1`):
directional traders' follower result in odd weeks does not predict their
even weeks (99 traders, 7,252 entries; Spearman 0.066, permutation p 0.51;
it could see a spread of about 46 bps) — so, by decisions 2026-11-10 (2),
**entry 6 does not run and ranking traders stops for now, to be reopened
after six more months.** **Entry 2** (`find-2`): the top accounts' followable
share 0.21, not shown below one half; two accounts' multi-week shorts carry
about half of list (c)'s profit; of R8's 50, 49 banked a loss together in R8's
weeks and #47 made 81% of its profit within two minutes of a fill. **Entry 3**
(`find-3`): slow traders at 24 h about zero (951 entries; p 0.53 / 0.88).
**Entry 4** (`find-4`): no kind of entry passes Holm over eleven; the nearest,
"after a jump", is an unexplained near miss (a candidate only). **Entries 5
and 10** (`find-5-10`): no news in the first 60 s; R8's US-open cell is gone
with the exact matched null (R8's −38.35 came from its own-direction null).
**Entry 7** (`find-7`): joining an algorithm after its fifth taker order loses
about 10 bps at a taker's cost; its busiest accounts the same. **Entry 9**
(`find-9`): no sign of an effect from unlinked traders agreeing. Entry 8 was
left out by ruling. **Candidates for a later batch, on new weeks, nothing
now:** "after a jump" (FIND-4), the counter-move before agreement (FIND-9),
the top accounts' long holds (FIND-2). **For the kit before any later batch**
(the Final reviews): a funding hour without a mark must not drop a gross
result; one random-trade placebo function drawn at least 1,000 times; unique
entry ids; the trader test where the same traders stand in both halves; the
rule written three times across studies moved into the kit; d's limit (a
one-sided trader on its usual side scores only timing inside the hour) in the
rule book. **Open, the owner's:** the way forward — among a small forward
paper experiment, a pause with the collector recording, a later batch, or
stopping — and with it the exams of 2026-11-30 and 2026-12-19 and the dated
checks D1 and D2.

2026-11-11 (entry 5's yardstick — the owner, on RULES-REVIEW's and the
supervisor's recommendation): **IN ENTRY 5, R8'S DRAWN TRADES ARE COMPARED IN
THEIR OWN DIRECTION.** The owner ("i agree with your recommendation"):
reading (10) of the entry "the FIND rules review" is ruled — entry 5's
deciding line compares each entry's 60-second mark move with R8's three
drawn trades taken in the side those trades really took; the matched
direction (a coin at the trader's long share) is printed beside, deciding
nothing. Why: within a minute any taker order moves the mark its own way, so
against a coin the line would only show that the 50's entries are orders
(1,089 of 1,241 entries), not that they carry news. This is the one exception
to ruling (1) of "RESEARCH-KIT accepted" (the matched null as round 2's only
yardstick), and it holds for entry 5 alone; every d-based entry keeps the
exact matched null.

2026-11-11 (the FIND rules review; one reading for all seven studies, fixed
before any look — the supervisor, on RULES-REVIEW's recommendations; the
yardstick of entry 5 waits for the owner): **SEVEN STUDIES HAVE WRITTEN THEIR
RULES AND NONE HAS LOOKED; A FRESH REVIEWER READ THEM; THESE READINGS HOLD FOR
EVERY STUDY.** Report `docs/reviews/find-rules-review-2026-11-11.md`
(RULES-REVIEW, Fable): every tool call of the eight transcripts listed, no
look output anywhere, the kit `2d3667b5…09aa` intact in all seven folders,
every recorded hash equal to its files; no study "must not look yet"; three
high findings (FIND-7's and FIND-9's populations, entry 5's yardstick).
**(1) A.0-8, "competition only":** a FIND pass must hold again without the
competition's days and again without its boosted markets — the finding's
sign on every deciding estimate and an uncorrected p below 0.05 — and the
exams use the same sentence. **(2) A.0-11 with two estimates:** a hypothesis
points FIND's way, or the other way, only when both estimates (day means and
trader means) do; a split stays OPEN. **(3) FIND-1's fifths:** "beats" means
a difference above zero, the p-values printed beside. **(4) The deciding
population is the all-time notional board** in every test of how accounts'
entries, events or runs did; the whole pool is printed beside (accounts that
entered through profit boards were chosen partly on the moves being scored).
FIND-7 and FIND-9 re-count and re-freeze. **(5)** FIND-3's placebo on real
markets and FIND-7's placebo dry run were not looks (neither uses an entry's
side; the expected d is zero by construction); each counts as one logged run
(A.0-15); FIND-7 deletes its dry-run file before its look. **(6) A risk unit
on a short window** (decisions 2026-11-11, Q7): "under 7 days" means under
10,080 starts, and a unit of zero is no unit, everywhere. **(7) CONFIRM
populations follow each entry's letter:** a list frozen and judged whole for
entries 1, 3, 7 and 10; a frozen list whose label is re-read each Monday for
entries 4 and 9 — for both, the notional board's accounts with a directional
week since the launch (FIND-4's 539-account list, `8889dc8a…`); FIND-3's 29
accounts judged whole, its weekly rule printed beside. **(8) The long share
at CONFIRM** is taken as in FIND, each Monday. **(9) Placebos and
leave-one-out** keep each study's regime; every draft register entry states
on its first line what they showed. **(10) Entry 5's yardstick:** RULES-REVIEW
recommends that the drawn trades' own direction decide (a coin at the long
share tests only that the mark moves with any taker order — 1,089 of 1,241
entries); that departs from ruling (1) of "RESEARCH-KIT accepted", so it waits
for the owner. **(11) Places in m** are weighed at the freeze (entries 1, 2, 3
and 9 see only large effects; entry 5 is a minute no follower can act in).
**(12) Every look stops unless the kit's fingerprint equals the frozen
value** (`checkKit()` alone checks the kit only against its own list).
**Entry 7** is registered only if its doubled-cost net mean is also above
zero. Each study fixes its own findings, writes its hashes again and reports;
the supervisor checks them and gives each its go.

2026-11-11 (COLLECTOR-REVIEW's calls — the Final review of the whole
collector, COLLECTOR-PLAN §1.8; its findings and questions are in the
supervisor folder's `workers/COLLECTOR-REVIEW/progress.md`, its fixes the
commits from `62d4d56` on, each named "COLLECTOR-REVIEW F…"): **THE
COLLECTOR STANDS AS BUILT; NO FINDING IN WHAT IT RECORDS; THESE CALLS.**
**(1) The poller task runs at normal priority (4).** At Task Scheduler's
default, 7, a task runs below normal
(Microsoft, TaskSettings.Priority, read 2026-11-11), and on 2026-11-11
between 11:09Z and 14:38Z the books came 7–20 s late in 14 spells while
builds and research loaded this PC: the trades frames were late in the same
seconds, one of the poller's own timers fired 2 s late, and by the server's
`ts` no second was missing. One experiment (17:00:44Z, 16 busy threads for
8 s) made the same picture: no book line for 7 s, then 561 in one second.
So the "stall of the connection" COLLECTOR-BUILD recorded was this PC's
(external-apis, corrected in place). `tools\register-tasks.ps1` carries
`-Priority 4` for the poller task only; it holds from the owner's re-run and
the poller's next start. **(2) A connect that fails is "connect failed", not
a server close:** only the close of an open connection becomes a rule-book
`connection_drop`, so an outage of our own network no longer writes
maintenance marks into the rule book; and a book frame that fails its schema
still counts as a frame of its market — kept raw, it neither stalls the
market nor restarts the connection (after a change of the frame's shape
every market looked stalled, and each restart's wait lost the frames it
skipped). **(3) The poller starts without the recordings' disk**
(COLLECTOR-PLAN §1.7's row made true at start: lines dropped and counted,
the database part runs) **and starts its jobs before
the first market list is read** (a list that cannot be read no longer holds
back the passes). **(4) The heartbeat's `lastFrameAt` of a connection is its
last frame of any kind, a pong too** — the watchdog's own measure — so
`status` shows no WATCH on a quiet trades connection. **(5) The backup**
writes into and removes only a folder that holds nothing but a dump (the
recordings' day folders carry the same names; a date folder that is not a
dump's fails the run), runs its dump through a pipeline (a write error is
its FAILED line, not an uncaught error), and a restore that fails drops the
database it began. **(6) Left as built, each a question for the supervisor**
(the closing message of COLLECTOR-REVIEW): the boards' `consistent` flag
(false on nearly every board by construction — recommended: drop it once the
first night's boards confirm); no mark for books that arrive late in a burst
(recommended: one coverage line a late minute, with the event loop's delay;
the 15 s watchdog unchanged); `once.js` (a second client beside the live
poller — recommended: delete it after the first full pass is verified); the
first-list loop beside the instruments job (the list is read twice at each
start; the plan fixed "retried with back-off"); `Store.close()` waiting for
its queue (only a graceful stop waits, 10 s for each write still queued; the
task's stop is a kill); and COLLECTOR-PLAN §1.7's "a kind failing whole for
a minute is a PROBLEM in `status`", which nobody built — `status` prints the
counts (recommended: with v1's Status page, where every row gets a state).
**(7) Tests added:** the whole night on fake timers through the real client
(the peak is 49 tokens in a minute and 12 in 5 s, so admission never holds a
page; each pass's slot and catch-up window pinned, which no test did), the
backup's Sunday branch, its E: copy and its rotation's guard, the clock
WATCH's log lines, the stall check's rules, and seven rules that had
survived a sample of 38 mutants. The built program was also run with no
network (its `fetch` and `WebSocket` replaced, its clock shifted): the
passes of a whole night, a missing disk, an unreachable database, frames of
a changed shape. `pnpm verify` green: 25 files, 171 tests.

2026-11-11 (the kit's additions accepted; the risk unit on a short window —
the owner, on RESEARCH-KIT's recommendation): **EVERY FIND STUDY IMPORTS THE
KIT `2d3667b5…09aa`; A RISK UNIT ON A SHORT WINDOW IS PRINTED APART.** The
report's "Addendum 2 (2026-11-11)" (`2207b95`) adds to the kit, each with one
definition, tests and killed mutants: A.0-4's d (`dAgainstNull`, the caller
naming whose trades the null leaves out), A.0-5's risk unit (`riskUnit`, 1,
6, 24 and 72 h over the 30 days before the entry), entry 7's runs and entry
9's agreement events (moved from scripts, counts unchanged: 3,182 and 188),
the map frozen in `kit/data/m8-map.tsv` with `mapOpen`, the entry-weighted
mean with CR1 errors (decisions 2026-11-11, RESEARCH-KIT accepted, (6)), and
the competition window with its boosted markets; the proof's numbers are
unchanged byte for byte; the supervisor re-hashed the kit (33 files) and the
map. **Q7 (the owner: "i agree with your recommendation for Q7"):** a risk
unit uses the minutes its 30-day window holds, with that share printed; an
entry with under 7 days of starts in the window, or none, is left out of the
line read in risk units and printed apart with its bps (67 of 10,612 P1
entries at 24 h). **Q8 (the supervisor's call):** the competition's boosted
markets in the kit (ids 97, 22, 26, 89) are compared with the collector's own
rule-book read of the competition (the nightly 23:15Z pass) before the
freeze; a difference is a kit change and a new fingerprint. No extra read.

2026-11-11 (COLLECTOR-BUILD's technical calls — the collector's build,
parts 0–6, inside the plan approved 2026-11-10; the supervisor's answers to
its questions Q1–Q6): **THE COLLECTOR IS BUILT AS PLANNED, WITH THESE
CALLS.** Commits `ab8a4ef` … `0defe9a`; plan
`docs/reviews/collector-plan-2026-11-10.md`. **(1) The plan's deviations
D1–D14 hold as built** (its §1.6 table): no Turborepo; the schemas in
`apps/poller`; no node-cron (one admission queue); Node 24's own WebSocket;
the tasks at start-up outside the session (S4U), no launcher (made true by
(5)); a run copy refreshed by `tools\deploy.ps1` after `pnpm verify`; raw
replies kept beside parsed records; the call lines in the REST files;
streams and replies in Brotli files on F:, MongoDB for what is queried;
Node's `process.loadEnvFile`; no CI yet; PowerShell and CommonJS tools
beside TypeScript; 16 boards; no notifier. **(2) Versions,** each the
newest at least 14 days old on its registry within the plan's majors (and
pnpm's `minimumReleaseAge` of 14 days for the rest): typescript ~6.0.3
(typescript-eslint 8.72 supports below 6.1), zod 4.6.7, pino 10.4.0, vitest
5.0.5, eslint 10.13.0, typescript-eslint 8.72.1, prettier 3.9.10,
@types/node 24.19.2, **mongodb 7.7.0** (7.8.0 was 11 days old; compatible
with MongoDB 8.x and Node 24). **(3) Q1 — the last market list is kept**
in `var\markets.json` and the streams open from it when the first read
fails or is paused, so a start inside the lab's nightly window records
books at once; this reverses one item of the plan's cut ("the stored
market list at start"). **(4) Q4 — the grant:** Task Scheduler gives a
task's own user read only, so `register-tasks.ps1` grants the registering
account read and execute on the poller task; Task Scheduler's restart on
failure looks at no exit code (it retries a start that fails to launch), so
the check task restarts a crash as well as a hang. **(5) Q5 and Q6 — the
poller is stopped through Task Scheduler, and its task runs node.exe
itself:** a normal session can neither read an S4U task's command line nor
open its process, so `deploy.ps1` and `poller-check.ps1` stop the task
(IRegisteredTask::Stop, allowed by read and execute) and wait for the
lock's pid (`tools\poller-task.ps1`). The deploy of 11:27Z showed that the
stop ends only the process the task started (cmd.exe ended, node outlived
it), so `run-poller.cmd` was removed: the action is node.exe by its
absolute path, resolved at registration, and the four settings moved into
**`tools\poller.env`, committed because it holds no secret** (folders and a
database on this PC), copied as the run copy's `.env`. A deploy first starts
the new copy without settings and requires exit 2; the crash handlers are
set before the lock, so a crash at start leaves its last words in the
poller's own log. The owner switched once, elevated (15:46–15:48Z, a 60-s
gap); every deploy since ended node within 1.1 s, gaps 3–4 s. **(6) The
passes and the client:** the board pass paces 1.35 s a token (at most 45
tokens in any minute), reads pages one at a time with 3 tries spaced by the
client's back-off, sends no page after 23:59:30Z, and after a restart inside
its window reads only what the date does not hold; a pass whose whole window
fell in a gap is a `pass_missed` line; the client drops a request whose turn
in the queue came after its deadline. `consistent` (page stamps within 10 s)
is mostly false: pods serve snapshots of different ages, so no pacing makes
a board one snapshot; the flag and the stamps record it. **(7) The rule
book** keeps the market list (whole, on change), fees, competition dates
and boosts, splits, the exchange marks and each server close of a
connection; a settlement's price and debit are left out (values, A.0-9).
**(8) Part 5** as the plan says: C: warns under 15 GiB and stops our
database writes under 6, the recordings' disk warns under 50 and stops the
book and trade lines under 10 (the streams kept for the watchdog); the
clock watch from the books; the boards' `stale` flag (a page over 5 minutes
old at read, 10 for `all`, or the top 100 the day before's); `status` reads
files only, never a recording. **(9) Part 6** as (7) of decisions 2026-11-10
amends the plan, and Q2 (the backup task joins `register-tasks.ps1`; the
owner re-runs it once): the dumps are canonical Extended JSON lines in one
gzip file with an end line, written by the run copy's driver (no Database
Tools); F: keeps 14 daily and 8 weekly (weeks Monday to Sunday), E: only the
newest file, replaced when E: has three times its size plus 5 GiB free; no
stream files on E:; Windows keeps the backup task's trigger in UTC (05:20Z
all year: 06:20 local now, 07:20 in summer time).

2026-11-11 (RESEARCH-KIT accepted — the owner, on the recommendations of
RESEARCH-KIT, its Final review and the supervisor): **THE KIT IS ROUND 2'S
ONE YARDSTICK; THE SIX QUESTIONS OF ITS SECTION 8 ARE RULED AS RECOMMENDED.**
Report `docs/reviews/research-kit-2026-11-11.md` (8 Final-review corrections
by a fresh reviewer, marked in place): the one-minute panel of 91 markets to
2026-11-07T00:00Z (manifest `93c985e5…be15`, on
`F:\polymarket-follow-research\KIT\`, equal to R8's capture wherever both
exist); the kit (fingerprint `7b4179e8…c215`, 26 files) returns R8's 1,272
entries exactly and prices R8's cell by the minute at −16.36 bps against
−16.60, and an independent pricer agrees with it to rounding; the supervisor
re-hashed both, scanned every raw reply for the blind store (none at or after
the cut) and re-ran the proof. The owner ("yes, i agree with all six"):
**(1)** the exact matched random-trade null (A.0-4) is round 2's only
yardstick, R8's drawn trades printed beside where they exist; entry 10's
FIND result, measured against R8's own-direction null, is measured again with
the exact matched null before entry 10 is registered; **(2)** entry 8 (the
funding study) leaves this batch (it can see about 120 bps where its rule
needs under 60) and returns on months of the collector's data; **(3)** the
funding rule is settled by Polymarket's changelog of 2026-09-01 (a position
held when the hour closes pays; one closed before it does not — R3's rule by
nominal hour, as the kit charges it), with no `/v1/info/pnl` read; the quote
is confirmed word for word on the page before the freeze; **(4)** for the
register: entry 2's list (c) is built from the pool's own fills before the
cut, never from a board read after it, with the 139 truncated captures
handled; the 303-account directional list (`out/directional-at-cut.txt`,
SHA-256 `ac3570b6…`) is frozen, and since it holds 16 holdout accounts, D1
is scored before the first exam's capture; (4b) is withdrawn by the Final
review; **(5)** the d-based entries (1, 4, 6, 9, 10) are judged at 24 hours
in their primary cells, the class horizon (and entry 9's 6 hours) printed
beside, deciding nothing — for a taker the 1- and 6-hour cells of the main
markets cannot pay their costs (the map, A.1-8); the map is left out of
entries 7 and 8, whose statistic is already a taker's net result; A.2's
smallest visible effects are recomputed for these horizons before the
register is drafted; **(6)** A.0-6 stays as written (t-tests on day means
and on trader means, the larger p deciding); the entry-weighted mean with its
cluster-robust errors by day and by trader is printed beside every result,
deciding nothing, and each entry names which mean its line tests. Next: the
batch freeze about 2026-11-20 (m, the register, the t values recomputed).

2026-11-10 (round 2's rules and the collector approved — the owner, on the
recommendations of IDEAS-REVIEW, DOCS-SWEEP, COLLECTOR-PLAN and the
supervisor): **ROUND 2 RUNS BY ONE RULE BOOK WITH TWO EXAMS, AND THE COLLECTOR
IS BUILT NOW, RECORDING EVERYTHING ONTO F:.** Phase 0 is complete (P0-1 to
P0-4: `docs/reviews/docs-sweep-2026-11-10.md`, `ideas-review-2026-11-10.md`,
each Final-reviewed). The owner approved all eleven recommendations ("i
agree with your recommendation (eleven of them)"): **(1)** round 2 follows
IDEAS-REVIEW's rule book (its Appendix A.0 as of commit `1e35202` and later
corrections marked in place): one 5% budget for any false pass across the
whole batch — 0.5% at the first exam (about 2026-11-30: pass at p ≤
0.005 ÷ m, drop on a wrong sign, else open), 4.5% by Holm at the final exam
(2026-12-19); p from t-tests on day means and on trader means, the larger
deciding; the batch and m frozen about 2026-11-20 with their t values
recomputed then; the "blind store" by field (after 2026-11-07 FIND may take
only `account` from boards sorted by notional or account value and from the
competition table, plus the rule book); the competition of 2026-11-02 →
11-16 a covariate in every test; **round 2 ends at the final exam**; **(2)**
if study 1 finds no difference between traders, ranking traders stops for
now, to be reopened after six months; **(3)** the same address's record on
another venue: not now, ruled after study 1; **(4)** trader quality as a
short list of tested measures, not one score; an AI's rating only forward,
as a paper profile beside the owner's own "would have taken it" mark;
**(5)** on-chain lookups only for deposits, withdrawals and wallet balances
of favourites, after one more explorer check; **(6)** the collector reads
the competition table with `include_unqualified=true` daily, `exchange`
every 5 minutes, no separate best-price or ticker streams; **(8)** this
approval covers the first app code (`apps/poller` in a pnpm workspace), its
packages and three Windows tasks — an exception to "no code before the v1
plan" (decisions 2026-11-06); **(9)** REST reads pause in the lab's nightly
window, the streams keep running, and the poller starts **with Windows,
outside the owner's session** (S4U, no password stored), changing the
sign-in default of 2026-11-07 for the poller; **(10)** once the exam lists
are frozen, their new fills are stored weekly, unread until an exam;
**(11)** recording starts once build part 3 is verified, before the
collector's Final review. **The collector** follows
`docs/reviews/collector-plan-2026-11-10.md` (15 Final-review corrections;
its deviations from CLAUDE.md's Stack, D1–D14 in its table, are accepted:
no Turborepo or shared package yet, no node-cron, Node's built-in WebSocket,
a run copy outside the working tree, among them). **No data cap** ("full
speed 24h 365days"), so the **full recording**: top-20 books of all 90
markets at most once a second when changed, every trade (24–31 GB a day of
download). **(7) Storage, amending decisions 2026-11-08 (R6 accepted) for
the collector** (E: has ~20 GB free and shrinking; D: is never used): the
recordings on F: only (`F:\polymarket-follow\recordings\`, about 0.4–0.6 GB a
day, 150–220 GB a year; F: ~1.5 TB free); the database on C: (about 2 GB a
year); its dumps daily to F: (`F:\backups\polymarket-follow\db\`, 14 daily
and 8 weekly kept) and only the newest dump on E:; an external disk or
cloud copy later, by the owner. The stated risk: until that copy, an F:
failure loses the recordings. **The follower's costs:** Polymarket Perps'
measured taker costs are the default in every table (about 9–13 bps a round
trip); where the owner acts and at what cost is to be talked through later
(the owner: "this is specific topic and i can explain and show how am doing
… that can come later").

2026-11-09 (the fast track — the owner, on the supervisor's
recommendation): **ROUND 2'S STUDIES FIND IN PARALLEL NOW, THE FIRST EXAM
RUNS ABOUT 2026-11-30, AND THE V1 PLAN STARTS IN EARLY DECEMBER BESIDE THE
FINAL EXAMS.** The owner asked why "research complete" would wait until
mid-December when the data, the parallel subagents and the credits are
there. The supervisor's answer: the work is fast, the calendar is not —
every idea must be confirmed on trading it has never seen (decisions
2026-11-09, the road to v1, M2), and that data arrives a day at a time after
2026-11-07 (about 3 weeks by 2026-11-30, about 6 by mid-December, R8's
length); the clean past since the public launch is about 9 weeks, and R8
used its last 6. The owner chose the fast track: (1) this week the "find"
studies in parallel and the collector (C1) built and started; (2) about
2026-11-30 the first exam on the new weeks, with the dated checks D1 and D2
— it catches false patterns well, while a small real edge may not show yet;
(3) from early December the v1 plan, the final exams running beside it on
more weeks, whatever passes later added to v1. The owner: "we will work
every day and we will see how we will progress … maybe we will [be]
faster".

2026-11-09 (the road to v1 — the owner, with the supervisor): **RESEARCH
ROUND 2 AND A SMALL DATA COLLECTOR COME BEFORE V1, AND EVERY POINT RAISED IS
RECORDED SO NONE IS FORGOTTEN.** The owner: "why to work v1, maybe we will
get more with search 2 round and then will improve this v1 … let's work on
that once we have all documentation, tests"; then thirteen points (staying
in step with the boards; favourites from zero with a per-trader alert
switch; every account ever on a board kept as a universe; stop-loss and
take-profit; trading style as a signal; charts; statistical formulas for
filtering; how bots, market makers and whales work; consensus among
favourites; AI for confirmation or description; whether the documentation
was read whole; block-explorer lookups; a fresh-eyes ideas subagent;
paper-log profiles; the "Claude design" skill) — "please record all of
them, we should cover them all". **Recorded on the plan page, "The road to
v1"**, with IDs: Phase 0 (P0-1 the record, P0-2 a second copy of
R3-WEEKDAY's live books, P0-3 DOCS-SWEEP, P0-4 IDEAS-REVIEW), Phase 1 (C1
the collector — a Windows task, not a subagent, keeping what cannot be
re-read and the universe), Phase 2 (H1–H13 and the dated checks D1, D2),
and the v1 items V1–V7; the method M1–M3 (a hypothesis register before any
test; the data after 2026-11-07 untouched until it confirms; a fresh
subagent per study, the supervisor re-computing what decides). **Facts
checked by the supervisor in the stored specs (2026-11-09):** an order may
carry a TP or SL trigger, but TP/SL updates go only to the authenticated
account, so another trader's stops are never visible; the spec's public
`/info` routes not in R1's table are minor (assets, index, limit tiers,
invite, competition widget) plus a POST "share card" route that stays
off-limits (reads only); withdrawals are on-chain. "Research complete" is
said after round 2. Nothing starts before the owner's go.

2026-11-09 (R7 accepted, and the pages' rules — the owner, on the
supervisor's and R7-PAGES's recommendations): **V1'S PAGES ARE DESIGNED FOR A
WATCHING AND ANALYSIS TOOL.** R7's report (`docs/reviews/r7-pages-2026-11-09.md`,
12 corrections by its own Final review marked in place; a one-page summary
for the owner at its top; the cut-line between what v1 builds and what waits
in its Q1 table) is accepted. The supervisor checked the ports free on this
machine and the ROI base on stored board rows. **Eight pages:** Watch (the
favourites; the first screen), Boards, Trader, Alerts, Paper log, Status,
Method, Settings; **the pages read only the database** — the poller is the
one client of the API, and a page's fresh read is queued to the poller's
50-token reserve, the owner's requests first. **The owner's rulings (R7 §7,
all as recommended):** (1) ports 3300 (development server) and 4300 (the API
and the built app); (2) times in UTC with local time beside them; (3) ROI
shown only on a base of $1,000 or more (tightening "above $100" of
2026-11-07); (4) red only for failures and liquidations, never for a trader's
loss, and every state also has a word or a shape; (5) the page is called
"Paper log", and "follow" and "copy" stay off the screen; (6) "thin
evidence" on a directional label with fewer than 8 decisions and fewer than 3
closed positions (classifier v2's own minimum); (7) the poller labels the top
100 of boards the owner has viewed, at the lowest priority, from what the
reserve has left; (8) a 95% range clustered by day among the paper log's
secondary figures, shown from 20 days (or traders); (9) the paper log starts
with K = 20 trader slots; (10) a liquidation of any favourite always raises a
banner; (11) a dismissible first-run note of three dated findings; (12) the
leaderboard's turnover line and CSV export later, after 30 days of stored
snapshots. **Two technical calls for the v1 plan (the supervisor):** the
favourites' unused share may be lent to the reserve, the total staying 250 a
minute; R4's freshness check reads the public trades WebSocket (no tokens).
The first research phase (R1–R8, R7) is finished; the owner's word "research
complete" opens the v1 plan.

2026-11-09 (R8 accepted — the owner, on the supervisor's recommendations):
**FOLLOWING THE LEADERBOARD'S TOP DIRECTIONAL TRADERS DID NOT PAY; V1 IS
PLANNED AS A WATCHING AND ANALYSIS TOOL.** R8's report
(`docs/reviews/r8-pretest-2026-11-09.md`, 13 corrections by a fresh
subagent's Final review, R8-REVIEW, marked in place) is accepted. The
supervisor re-computed the primary cell with its own code (identical counts
and means) and rebuilt 1,010 of the null draws independently (identical).
**The verdict, by the frozen rules: FAILS** — (i) the follower's net return
−16.6 bps an entry, trader-clustered 95% interval about [−30, −6], below
zero for 200 of 200 bootstrap seeds; (ii) d −13.6 bps against random trades
in the same instrument and hour, its intervals reaching about zero: no
better than random, "worse" not shown; (iii) 21 of 47 traders positive,
p 0.56; 1,249 entries; every secondary fails or is too few to tell. **B:**
no confirmed skill — B1 killed in its find half; B2's find pair passed
(Spearman 0.20, p 0.011) but not at the top, its confirmation needs weeks
9–12. The 50 made $88,018 net of fees in the 30 days before T0 and $92,121
in the 42 days after; without #47 ($109,386 after) the other 49 went from
$72,738 to −$17,266. **The owner's rulings** (R8 §7 and R3-WEEKDAY §7): (1)
v1 is planned as a watching and analysis tool without the copy framing (the
ruling of 2026-11-06 for FAILS); alerts still fire, as information; a pattern
that research round 2 finds and that passes its tests may be added later;
(2) the forward paper-follow log stays as designed, the matched-direction
null and the day clustering shown beside the vote; (3) B2's confirmation:
weeks 9–12 (2026-11-02 to 11-30) rebuilt from a fills read after 2026-11-30
by the frozen rules, the plan recorded here before it runs; (4) #47's exits
are shown only as data on its own page, never as a signal; (5) R3-WEEKDAY's
week of bbo snapshots is folded into v1 and round 2 (the live log stores the
book at every paper entry), not run as a separate job.

2026-11-09 (the owner's direction after R8 — the owner, recorded by the
supervisor): **THE PROJECT CONTINUES: FINISH THE PLANNED RESEARCH, THEN A
SECOND ROUND THAT SEARCHES FOR A "WIN COMBINATION".** R8 found that copying
the top 50 directional traders' entries about 80 s late lost money and was no
better than random trades (its report, Final-reviewed by R8-REVIEW; the
supervisor's own re-computation agrees). The owner: disappointed, does not
give up — "let's complete what we started, then we will talk about research
round 2"; the aim is "right trader, right trades, right pairs, right
momentum", a pattern that pays over many trades, not a perfect record. The
five leads the owner approved for round 2 are kept on the plan page
(backlog, "Research round 2"), with the method: each hypothesis written
before it is tested, found on one stretch of data and confirmed on another
the search never touched, then watched in the forward paper-follow log
before any money relies on it. The app stays watch-only and never advises
(Iron Rules 1 and 6). Whether v1 is planned as a watching tool now, under
the owner's ruling of 2026-11-06, is settled at the walkthrough of R8's
report.

2026-11-09 (R8's capture and analysis fingerprinted before the one look — the
supervisor, at R8-PRETEST's second stop): **EVERYTHING R8'S ONE LOOK READS IS
FINGERPRINTED BEFORE IT RUNS.** The capture ran 09:18–19:03Z: with the
morning's probes and the completed accounts, 17,526 calls today, every one
answered 200, never more than 200 tokens in a minute or 25 in five seconds
(the supervisor's own count, `verify/R8-PRETEST/rate-stop2.out.txt`). By R8's
log: nulls drawn for 1,933 of 1,946 entry groups (13 have none even after
widening — left out of d and counted), 10,284 one-second mark windows,
funding and hourly marks for 80 instruments. **Fingerprints (SHA-256), each
re-checked by the supervisor:** the capture's manifest
`F:\polymarket-follow-research\R8-PRETEST\capture\MANIFEST.sha256`
`fed04beac251616f9c9a6950af361842413a706d54d4beccef84f4dd939fe15f` (474
files, 53 MB, every file verified) and the code-and-outputs manifest
`workers/R8-PRETEST/out/manifest-e.sha256` `f6e2136a…eb62` (97 files, every
file verified); `rules.json`
`4c20eebccdaf5944d5e4b6406a92191df7f54cec95b4fb12b14f73cd51ecd332` — the
frozen `5ae15c85` with only the table and the three secondaries this log
records (trader-weighted (i) and (ii); the weekday table at every instant;
without five unreliable instruments); `price-table.json` (session_pair)
`9f559b4a…f6dd`; `price-table-weekday.json` `485ada74…ad4d`; `analyze.mjs`
`6d15d24f…0d3e`, `b-skill.mjs` `bac79138…2843`, `stats.mjs` `f88afbed…5f59`,
`price.mjs` `0985eb4d…b9a3`, `nulls.mjs` `41923511…b08e`, `draw.mjs`
`22092f5b…198e`, `store.mjs` `aab4ac5e…0c94`, `lib-r8.mjs` `baf5a4da…0e8f`.
**Its tests:** with no edge, PAYS came out in 0 of 400 simulated runs;
planted edges of 20 and 40 bps were found in every run; 12 of 12 deliberately
broken versions were caught; on 11 accounts outside both arms the whole chain
re-drew exactly the captured trades with no unpriced leg. **A correction to
the entry below:** at R8's share of legs in US hours (33%), the choice of
table is worth up to 0.43 bps a round trip (commodities), not "under 0.25"
(R3-WEEKDAY's Final review F3) — still small against about 8 bps of fees.
Now the one look; the supervisor re-computes the primary cell with its own
script from the capture before the verdict goes to the owner.

2026-11-09 (R8's price table chosen — the supervisor, by the procedure the
owner approved on 2026-11-08): **R8 PRICES THE FOLLOWER WITH THE WEEKDAY
TABLE IN US MARKET HOURS AND THE SATURDAY TABLE AT EVERY OTHER INSTANT.**
R3-WEEKDAY measured 2026-11-09 14:30–16:30Z (09:30–11:30 New York) with R3's
scripts (`docs/reviews/r3-weekday-2026-11-09.md`); its table
`workers/R3-WEEKDAY/out/rule-table-weekday.json` in the supervisor folder,
SHA-256 `2578475e8e54237be6b9860ea01b04a98399418fbcf862bd329b1cfb3b5e3dc0`,
is in R3's format (90 instruments, 246 bbo snapshots, 982 books). **Checked
on the supervisor's own path:** the mean half-spread re-computed from the raw
snapshots matches the table to 0.000000 bps for all 90 instruments, field for
field in R3's format (`verify/R3-WEEKDAY/spreads-check.out.txt`); the
subagent's access was clean. **The choice: `session_pair`** (defined in
decisions 2026-11-09, R8's rules file frozen), R3-WEEKDAY's recommendation:
each table is used only in the kind of hours it was measured in (R3's
"Saturday" window was Friday evening in New York, off-hours). On the weekday
morning the Saturday table understated a round trip by about 0.7 bps on
majors and 1.4 bps on commodities; across R8's entries the choice is worth
under 0.25 bps a round trip, against about 8 bps of fees. R8's voted entries
have 33% of their legs in US regular hours (the supervisor's count of times
only, `verify/R8-PRETEST/select-check-sessions.out.txt`). **Two secondaries
added, deciding nothing:** the weekday table at every instant (the choice
that cannot make following look cheaper in any measured hour), and the
primary cell without the instruments whose measured cost or mark is
unreliable — PRL-USD (two holey books gave a depth cost of 181 bps), NCLD-USD
(a stale book), SKHYNIX, SAMSUNG and CXMT (marks away from the book while
their home markets are closed): 8 of the 1,256 voted entries, 4 with a leg in
US hours. The table is used as measured, its means unchanged (the rule:
decisions 2026-11-07, R3 accepted). The capture's manifest and the analysis
script's hash are recorded at R8's second stop, then the one look.

2026-11-09 (R8's rules file frozen — the supervisor, at R8-PRETEST's first
stop): **EVERY RULE OF R8 IS FINGERPRINTED BEFORE IT DOWNLOADS ANY MARKET
DATA.** R8 wrote its rules file from the approved numbers (decisions
2026-11-08, R8's numbers approved, and the entries it completes) with every
threshold, seed and file path and each detail the rules left open:
`workers/R8-PRETEST/rules.json` in the supervisor folder, SHA-256
`5ae15c85dd37e1b7bae07d7a1432d86167e5a1418d71ce609b8005fc8a575841`, written
2026-11-09 09:14Z; its selection `out/selection.json` `c20c3f80…ef68c`.
**Three calls inside the approval, by the supervisor:** (1) the three
directional pool accounts whose history R2's 50-page cap cut short are read
back to their first fill (132 calls) instead of being dropped — dropping
them would bias the selection against the busiest directional accounts; one,
the board's highest-ranked directional account (all-time notional #47), now
enters both arms in place of the 50th; (2) "the horizon class nearest the
trader's median holding time" is nearest on a log scale (boundaries √6 h ≈
2.45 h and 12 h): if an edge builds over the hold and the price is a random
walk, two horizons' votes are equally sensitive at those holds; 7 of the 50
traders get a longer class than "nearest in hours" would give; fixed before
any outcome is seen; (3) the session-aware pair, one of the three candidate
price tables, is defined: R3-WEEKDAY's table at instants in US regular hours
(Mon–Fri 09:30–16:00 New York), R3's Saturday table at every other instant,
for all instruments. A test cohort of 11 accounts outside both arms proves the
analysis on real data and is never part of a result. **Verified on the
supervisor's own path** (`verify/R8-PRETEST/select-check.mjs`, written from
the rules, not from R8's code; outputs `select-check-stop1.out.txt` and
`select-check-stop1b.out.txt`): the frozen classifier v1's hashes; the same 50
traders and the same ratio arm; 194 directional at T0 → 180 at or above
$25,000 → 104 with 10 closed positions; 1,272 entries in [T0, T1), 1,256
voted, 38 traders with at least 5 — far above TOO FEW's 20 traders and 300
entries; no per-trader difference. Before T0 the 50 made $88,018 net of fees
on $71.7M. **Still open:** the price table, chosen after R3-WEEKDAY's report
(2026-11-09 14:30–16:30Z) and recorded here, with the capture's manifest and
the analysis script's hash, before R8's one look. A secondary that decides
nothing may still be added before the look, recorded here with the file's new
hash; nothing changes after it.

2026-11-08 (R8's numbers approved — the owner, on the supervisor's
recommendations): **R8 STARTS FROM 2026-09-26, WITH A FOLLOWER WHO WATCHES
ABOUT 20 TRADERS.** The owner approved the numbers of the supervisor's draft
(`drafts/r8-brief-draft.md` in the supervisor folder), completing R8's rules
(decisions 2026-11-06, the pre-test and waves 2–4 approved, A1–A13 and B1–B4;
2026-11-07, R3 accepted; 2026-11-07, the classifier's ruling; 2026-11-08, R2
and R2-LABELS accepted): **T0 = 2026-09-26** (the 30-day selection window
holds the public launch; a 6-week measured period to T1 = 2026-11-07T00:00Z);
the tracked set — v1-directional on the 14 days before T0, ≥ $25,000 notional
and ≥ 10 closed positions in the window, the top 50 by realized PnL net of
fees (secondary: by PnL ÷ notional; sensitivity: R2's "doubt" rule); **the
delay D = U·T + 1.5 + 0.3 + 0.34 + 60 s with T = 33.3 s** (about 20
favourites at the budget; sensitivity T = 100 s); the base-tier taker fee
0.04% a leg; funding hourly; pre-IPO out of the primary cell; the verdict as
amended. **The one open number:** the price table — R3's Saturday table, the
weekday table or a session-aware pair — chosen after the weekday measurement
of 2026-11-09 14:30–16:30Z by R3-WEEKDAY's recommendation checked by the
supervisor, recorded here before R8's one look. **Timing:** nothing new starts
before the owner's weekly usage resets (the owner, 2026-11-08: at 98%); R8 is
started on 2026-11-09 to prepare its data and code, and makes its one look only
after the price table is recorded.

2026-11-08 (R6 accepted, and where backups go — the owner, on the
supervisor's recommendations): **BACKUPS GO TO E: AND F:, NEVER D:.** R6's
report (`docs/reviews/r6-storage-2026-11-08.md`, 13 Final-review corrections
marked in place) is accepted; the supervisor checked its machine facts itself:
the shared MongoDB server (8.3) keeps its data on C:, listens only on
127.0.0.1, without authentication; C: and E: are two partitions of one NVMe
drive, D: a separate SATA SSD, F: a separate hard disk (1.5 TB free). **The
owner: D: "is not working properly so we should avoid any backups there."**
So R6's suggestion of D: is dropped and the founding decision stands, as the
lab does: our database on the shared server (C:); the backup's first copy on
E: (`E:\backups\polymarket-follow\`, quick to restore, guards against
mistakes but not against the drive failing) and its second on F: (the copy
that survives the C:/E: drive). **Approved with it (v1-plan defaults):** a
daily Node dump script like the lab's (no Database Tools installed), at 06:20
local, clear of the lab's jobs, a weekly test restore into a scratch database;
leaderboard history as one daily copy of the top 1,000 of 8 boards (~0.4–0.6
GB a year); the full order book stored at every paper-follow instant; the
per-call API log as rolling files (14–30 days) with hourly aggregates in the
database; one digest row an hour in the alert feed for favourites labelled
algorithm or market maker (their fills still stored); disk alarms — warn at 15
GB free on C:, stop our writes at 6 GB. **Sizes (modelled, ±25%):** about 0.17
GB a year for 20 typical favourites; the ceiling, every favourite as busy as
the busiest captured account, is 8 / 32 / 79 / 159 GB a year for 5 / 20 / 50 /
100 favourites — C: would fill in about 7 months at 50. Whether our database
stays on the shared server or gets its own on F: is a question for the v1
plan. The research data no API can re-read (R3's live books and the boards as
read, ~10 MB) gets a second copy with a hash list on E:.

2026-11-08 (R2 and R2-LABELS accepted, and the display defaults — the owner,
on the supervisor's recommendations): **THE BOARDS' TOPS ARE MOSTLY
ALGORITHMS, MARKET MAKERS AND INACTIVE ACCOUNTS, AND THE APP SHOWS EVERY LABEL
WITH ITS EVIDENCE.** R2's report (`docs/reviews/r2-trader-style-2026-11-08.md`,
8 Final-review corrections marked in place) and R2-LABELS's
(`r2-labels-2026-11-07.md`) are accepted; the supervisor re-ran the frozen
classifier on all 1,615 non-holdout accounts and joined it with the board
ranks itself — all-time notional top 100: 6 directional, 67 non-directional,
26 with no fill in the two weeks to 2026-11-07 (the first directional at #47);
all-time PnL top 100: 15 / 32 / 40; all 54 competition-disqualified accounts
non-directional. Each week's top 50 by realized PnL (rebuilt inside the pool,
six weeks to 2026-11-02) kept only 18–32 of 50 positive the next week. The
leaderboard's PnL most likely excludes the liquidity rewards (not proven: the
rewards' recipients are not public). **Display defaults for the v1 plan:**
every style label shown with its window, its coverage and its reason; realized
and unrealized PnL side by side with an "underwater" flag; accounts with no
fill in 30 days greyed; "disqualified" a flag, never an automatic label; a win
rate shown only from 20 closed positions, with its interval and shrinkage.
**For R8** (its numbers, shown to the owner before they are frozen): the
capture `F:\polymarket-follow-research\R2-STYLE\` (T_CAP 2026-11-07T00:00Z),
`scripts/r8-pret0.mjs` (v1 on pre-T0 fills only), a $25k notional floor in the
30-day selection window, and R2's written rule for "an account a careful
reader would doubt" (R2 §1 Q10).

2026-11-08 (the style classifier v2 frozen for the forward blind test — the
supervisor): **V2 IS FINGERPRINTED BEFORE THE DATA IT WILL BE TESTED ON
EXISTS.** R2 froze it at 2026-11-08T00:07:16Z, built and checked on
non-holdout accounts only (decisions 2026-11-07, the classifier's ruling):
v1 plus an order-level fixed-size sign and "at least 8 decisions or 3 closed
cycles" before "directional"; v1's files unchanged (hashes re-checked).
`classifier-v2.json` SHA-256
`96f99e1ad4a40c6479748bc3ffb6bfbcf490f82bb68e5c70edcb39c3a35d133e`,
`scripts/classifier-v2.mjs` `1ff0383f…13cb2`, `scripts/label-accounts-v2.mjs`
`19301cbf…7cff` (in `workers/R2-STYLE/`; copies in
`verify/R2-STYLE/frozen-classifier-v2/`). On non-holdout accounts: D 236 · N 192
· U 391 · no fill 796 (v1: 293 directional). R2's Final review disclosed one
more weakness, kept for a v3 and not fixed in v2: tempo is averaged over the
whole window, so a bot active on only one or two days reads slower than it is.
The test: after 2026-11-21, the holdout's fills for 2026-11-07 to 2026-11-21,
labelled blind by a fresh labeller, v2 scored by the frozen rules.

2026-11-07 (the classifier's ruling — the owner, on the supervisor's
recommendations; and the supervisor's prior before R8): **V1 OF THE STYLE
CLASSIFIER IS USED FOR THE RESEARCH; THE APP SHIPS ONLY WITH A V2 THAT PASSES
AN HONEST FORWARD BLIND TEST.** The score (decisions 2026-11-07, R2's
classifier scored: trap 2 of 23, both anchors caught) showed two weak spots —
slow fixed-size algorithms, and "directional" called on thin evidence. A fix
made now would be tuned on labels already seen, so: (1) **R8 uses v1;** its
tracked set already needs 10 closed positions (A3), which removes most thin
evidence, and R8 prints its primary result again with the tracked accounts a
careful reader would doubt left out, as a sensitivity. (2) **R2 designs a v2**
for the two weak spots on non-holdout accounts only, and freezes it with its
hash before the test data exists. (3) **The forward blind test:** after
2026-11-21 the 100 holdout accounts' fills for 2026-11-07 to 2026-11-21 —
data nobody has seen — are pulled, a fresh blind labeller labels them by the
frozen definitions, and the supervisor scores v2 by the same rules; R2 never
opens the holdout's data meanwhile. (4) **In the app, a "directional" label
on thin evidence carries a warning.** **THE SUPERVISOR'S PRIOR FOR R8, written
before its rules are frozen and before its one look:** PAYS ~20%, FAILS ~50%,
TOO FEW TO TELL ~30%. Why: polymarket-lab's F9 found no edge in top
prediction-market wallets; the published evidence on copying finds none after
costs (R5); the best on-chain wallets' information is used within seconds
(R5, Zhai) while a follower here acts 20–80 s late; a round trip costs ~8–10
bps in fees and spread; and most of what tops the boards is algorithms and
market makers (R2-LABELS: 23 of the 37 active holdout accounts with a clear
label). For it: the owner follows directional traders only, perps leaders may
differ from prediction-market ones, and R8's horizons reach 24 h.

2026-11-07 (R2's classifier scored — the supervisor, by the rules fixed
before any label existed): **THE TRAP RATE IS 2 OF 23 (8.7%, 95% INTERVAL
1.1–28.0%); BOTH ANCHORS ARE CAUGHT.** The supervisor ran the frozen
classifier (decisions 2026-11-07, R2's classifier frozen) on R2-LABELS's copy
of the 100 holdout accounts, 2026-11-07 09:43Z (output
`verify/R2-STYLE/classifier-holdout.tsv`, SHA-256 `77c05ec2…c635`), and
scored it with its own script against the fingerprinted blind labels
(`verify/R2-STYLE/score.cjs`, its Clopper–Pearson self-test passed; output
`score.out.txt`). The 40 accounts R2-LABELS found idle the classifier found
idle too; 60 were scored. **Primary:** of the 23 accounts R2-LABELS labelled
non-directional (17 algorithm, 6 market maker), the classifier called 2
directional — `0xc455dbd3` and `0x7d641ac8`, both algorithms trading a fixed
size, which the classifier's fixed-size sign misses below 10 decisions a day.
The two anchors: algorithm. **Secondary:** traders lost (R2-LABELS
directional, classifier non-directional) 1 of 14 (`0x7c97eb77`, 50 large
resting orders, called market maker); risky D (R2-LABELS unclassified,
classifier directional) 6 of 23, all "too few" to the labeller — the
classifier needs 5 decisions, the labeller wanted more; abstentions 6 of 37;
horizon agreement 5 of 8; D/N/U agreement 45 of 60, six-way 40 of 60. **What
it means:** the classifier catches most of the trap but not all of it, and on
thin evidence it says "directional" where a careful reader says "can't
tell". Any change made now is made after seeing the holdout, so it can no
longer be tested on these labels; whether v1 is good enough, and how a
corrected version is tested honestly, is the owner's ruling.

2026-11-07 (R2's classifier frozen — the supervisor, at R2-STYLE's third
stop, before scoring): **THE STYLE CLASSIFIER IS FINGERPRINTED BEFORE THE
SUPERVISOR RUNS IT ON THE HOLDOUT.** R2 built it on non-holdout accounts only
(its run log: three runs, none on the holdout) and froze it at
2026-11-07T09:42:15Z: `classifier-v1.json` (thresholds) SHA-256
`d803192c779e107b61eab13b4bd52fc488b04cd0c9f38939c2efb5acf292e4ad`,
`scripts/classifier.mjs` (the rules) `f7f32f22…8c01`,
`scripts/label-accounts.mjs` (the apply script) `aa9df253…a9a4` (in
`workers/R2-STYLE/`; copies in `verify/R2-STYLE/frozen-classifier/`). On the
1,602 non-holdout accounts it labelled 807 with fills in the window:
directional 288, algorithm 144, market maker 36, churner 7, unclassified —
mixed 113, unclassified — too few 219; both anchors algorithm. The supervisor
now runs it on the 100 holdout accounts and scores it by the rules fixed
before any label existed (decisions 2026-11-07, the style labels' definitions
frozen).

2026-11-07 (R3 accepted, and the pre-test's rules amended — the owner, on the
supervisor's recommendations): **THE FOLLOWER IS PRICED AT THE MARK PLUS THE
MEASURED COST, AND A TRADER IS JUDGED OVER A FIXED HORIZON, NEVER BY THE
TRADER'S OWN EXITS.** R3's report (`docs/reviews/r3-paper-follow-2026-11-07.md`)
was Final-reviewed by a fresh subagent (R3-REVIEW: 12 corrections marked in
place, none high; R3's seeded simulations reproduced exactly; the statistics'
source checked on the paper's text) and checked by the supervisor (the exit
bias analytically; spreads live; the 1 s mark history complete on 2026-09-15
for BTC and NVDA). **Why the change:** a trader with no skill who takes profit
at +0.5% and stops at −2% wins about 80% of trades by arithmetic and nothing on
average; a sign vote on the trader's own exits would have crowned such a
trader in 79% of simulated runs — the leaderboard's own trap — and on this thin
market the next public trade after an alert comes 1.4 to 24 minutes late.
**The owner approved all seven proposals (R3 §7):** (1) **A5 is replaced:** the
follower's price at an instant is the 1 s mark × (1 + s × (the instrument's
mean quoted half-spread + its mean depth cost for $1,000)), from R3's
per-instrument table, on both legs, for the tracked entries and their nulls
alike (s = +1 when the follower buys); A5's first-trade price is printed as a
check, and the half-spread and depth doubled as a sensitivity. (2) **Pre-IPO
entries are left out of R8's primary cell** and reported in a secondary (no
rule priced ANT within ±20 bps). (3) **The vote:** each entry's d is the
follower's net return over a fixed horizon h minus the MEDIAN of its three
nulls' net returns over the same h (A9's mean stays for A11 (i) and (ii));
h is 1 h, 6 h or 24 h, the class nearest the trader's median holding time
over the 30 days before following (under 10 closed positions: 6 h); A11
(iii)'s sign test runs on these fixed-horizon d; the trader's own exits are
shown as paper money, never voted on. (4) **The scoreboard's statistics
(v1):** entries whose windows overlap are merged into one vote; per trader the
two-sided sign e-process E_n = 2ⁿ·k!(n−k)!/(n+1)!, a verdict only at
**E ≥ 20·K with K = 20 trader slots (E ≥ 400; e-Bonferroni, valid however
often the owner looks and under any dependence between traders)**; **the pooled
board of all favourites comes first,** one vote per UTC day, a verdict at
E ≥ 20; ties (|d| < 0.1 bps) dropped; late entries recorded, never voted. The
honest cost: a verdict on one trader needs months to about a year of
following even for a real edge; the pooled board answers sooner. (5) **A
2-hour weekday measurement in US hours, Monday 2026-11-09 14:30–16:30Z,** with
R3's scripts, before R8's numbers are frozen — the rule table is one Saturday
morning's, and spreads and the weekend premium moved by the hour. (6) **Paper
size $1,000 an entry, $10,000 stored beside it** (the live log stores the book,
so any size can be priced later). (7) **A matched-direction e-process**
(nulls drawn with the trader's own long share) **beside each vote,** to tell
skill from a long habit in a rising market. **The live log (v1):** the paper
entry is priced at the book's VWAP for $1,000 at the follow instant (the
alert + 60 s), with the book, bbo and ticker stored as read then. **Costs:**
the base-tier taker fee, 0.04% a leg (ANT 0.02% by its fee override); funding
every whole hour at the published rate.

2026-11-07 (the blind labels fixed — the supervisor): **R2-LABELS'S 100
LABELS ARE FINGERPRINTED BEFORE ANY CLASSIFIER OUTPUT EXISTS.** R2-LABELS
(Sonnet 5.5, xhigh; report `docs/reviews/r2-labels-2026-11-07.md`, `c63c39e`)
labelled the 100 holdout accounts for 2026-10-24 to 2026-11-07 from their raw
fills by the frozen definitions: none (no fill) 40 · unclassified — too few 20
· unclassified — mixed 3 · directional 14 · algorithm 17 · market maker 6 ·
churner 0. Checked by the supervisor: it never opened R2-STYLE's folders
(access scan 0 outside its own); the 40 "none" agree with the supervisor's own
count from the raw files on all 100 accounts (`verify/R2-STYLE/window-fills.cjs`).
`labels.csv` SHA-256 `617c53afb0aa64a25f549dd5b1cdef60a748f1eb3655880e9f479ac8a332b1d0`
and `labels-extras.csv` (the two anchors, outside the score) `dabbbfee…a055`,
2026-11-07 05:08Z; frozen copies in `verify/R2-STYLE/`. Its Final review may
correct a label only where the frozen definitions were misapplied, each change
logged; the supervisor then scores both versions and reports both.

2026-11-07 (the style labels' definitions frozen, and how the classifier is
scored — the supervisor, at R2-STYLE's second stop): **SIX LABELS, WORDS
ONLY, AND THE SCORING FIXED BEFORE ANY LABEL OR CLASSIFIER OUTPUT EXISTS.**
R2 wrote the definitions from non-holdout data only (the supervisor checked:
every analysis script goes through one guard that refuses holdout accounts;
none of the appendix's nine example accounts is in the holdout; R2's
transcript shows no hand access to the holdout folder). The file:
`workers/R2-STYLE/label-definitions.md` in the supervisor folder, copied
unchanged to `workers/R2-LABELS/label-definitions-v1.md`, SHA-256
`29df3f0c5fdec788bc36dc277f66a1b5b4734d201598138933cecc12c6d656a7`
(written 2026-11-07 04:50:35Z; its header's "05:05Z" is a slip). **The
labels:** directional (with a horizon: scalp, intraday, swing, position) ·
market maker · algorithm · churner · unclassified — too few · unclassified —
mixed; a window with no fill gets no label (the dormant flag). Hedger is not a
label (no case among the 547 heaviest non-holdout accounts; offsetting pairs
go to "mixed"); competition player, reward farmer, disqualified status and
linked accounts are flags beside the label, never the label. **The deciding
rule:** read decisions (order events, orders, action groups, position
cycles), never fills; a non-directional label wins when its signs are clear in
most decisions; **in doubt between directional and anything else →
unclassified — mixed, never directional** — the costly error is calling a
non-directional account directional. **The blind labels:** R2-LABELS (Sonnet
5.5, xhigh) labels each of the 100 holdout accounts for one window,
2026-10-24T00:00Z to 2026-11-07T00:00Z, from the raw fills alone (copied to
`F:\polymarket-follow-research\R2-LABELS\holdout\`, 100 files, SHA-256 of
their hash list `cbf25167…a713`), never seeing R2's work; the two anchors are
labelled as named extras, outside the score. **The scoring, fixed now:** the
unit is the holdout account in that window; accounts with no fill in it are
left out and counted. Labels collapse to D (directional, any horizon), N
(market maker, algorithm, churner) and U (either unclassified). **Primary —
the trap rate:** of the accounts R2-LABELS labels N, the share the frozen
classifier labels D, with its exact (Clopper–Pearson) 95% interval; both
anchors must be labelled N by the classifier. **Secondary:** of R2-LABELS's D,
the share the classifier labels N (traders lost); the classifier's D where
R2-LABELS says U (a risky D, counted apart); the classifier's U where
R2-LABELS says D or N (an abstention); the full six-way table; the horizon's
agreement on accounts both call D. The supervisor scores with its own script;
the owner rules on whether the result is good enough for v1.

2026-11-07 (R2's holdout fixed — the supervisor, at R2-STYLE's first stop):
**THE STYLE LABEL WILL BE SCORED ON 100 ACCOUNTS R2 NEVER ANALYSES, DRAWN BY
THE SUPERVISOR BEFORE ANY CLASSIFIER EXISTS.** R2 read the pool — 1,702
accounts: the all-time notional and PnL top 1,000 (overlapping on only 320)
and the PnL top 100 of day, week and month, 2026-11-07 00:48–00:51Z. The
supervisor drew the holdout from leaderboard fields only, with its own script
(`verify/R2-STYLE/draw-holdout.cjs` in the supervisor folder; seed 61107;
re-run identical): R2's six strata by all-time notional rank — N1 ranks 1–50
(10 drawn), N2 51–200 (15), N3 201–500 (20), N4 501–1,000 (20), and accounts
off the notional board split at their median notional, N5 upper (15) and N6
lower (20) — leaving out the 60 accounts R2 had already probed and the two
anchors (`0x4c4f…22b4`, the founding check's all-time PnL #1, and
`0x7930…d132`, notional #1), whose behaviour is already known and so cannot
be tested blind. `holdout.json`, drawn 2026-11-07T01:01:31Z, SHA-256
`c57b17d36b42f6827daf8f69b169cb315faae375ad88b1a2013fa6f224086345`. R2's pull
saves those accounts apart, its analysis scripts skip them, R2-LABELS labels
them blind from their raw fills, and the supervisor scores the frozen
classifier against those labels.

2026-11-07 (the owner's PC — the owner's answer to R4's question 2): **THE PC
IS ALWAYS ON AND THE OWNER ALWAYS SIGNED IN, SO THE POLLER AND THE NOTIFIER
START AT SIGN-IN.** The owner: "i don't turn off my pc and do not switch
logged user, all the time it is turned on. from time to time quick restarts
because of update (i do manually that)." So both processes are "at log on,
run only when the user is logged on" tasks (R4 Q3), which can show
notifications; no boot-started poller is needed. A manual restart leaves a gap
until the owner signs in again: the poller catches up on the fills it missed
and shows them as one late summary, never as fresh alerts, and paper-follow
prices them at the moment they could really be acted on (R4 Q8; R3 decides
the details). The machine's own facts (uptime 16.9 days, never sleeps on mains
power, measured 2026-11-06) agree.

2026-11-07 (wave 1 closed — the owner, on the supervisor's recommendations):
**R1, R4 AND R5 ARE ACCEPTED, AND THE PROJECT RUNS AT A QUARTER OF THE
PUBLISHED RATE LIMIT.** The reports (`docs/reviews/r1-perps-api-2026-11-07.md`,
`r4-notifications-2026-11-06.md`, `r5-existing-tools-2026-11-06.md`) were
verified on the supervisor's own path (R1's facts re-measured live 2026-11-07
00:10–00:11Z, `verify/R1-API/`) and Final-reviewed: 34 corrections, each
marked in place. The API facts are in external-apis. **(1) THE OPERATING
BUDGET — 250 WEIGHTED TOKENS A MINUTE, ALL CALLERS TOGETHER** (a quarter of
the published 1,000; Iron Rule 5's "about half" is the ceiling, this is the
setting). The owner: "we should try to stay under the radar, we don't need to
be in risky position, let's define some real number and start with it." Why
this number: R1 measured a token bucket refilling ~1,000 a minute with a burst
of only ~90–100 tokens, so the rule is about spacing as much as volume. **Every
client sends one request at a time, evenly spaced (a fills read, weight 10,
every 2.4 s at the full 250), never using more than 30 tokens in a burst**,
with an honest client name — small and steady, never disguised. Inside it:
50 a minute in reserve (leaderboard, tickers, retries); 200 for favourites.
What 200 buys (R1's formulas, Q14; average alert delay, the worst about
double): polling positions and reading fills on a change — 5 favourites
≈ 4 s, 20 ≈ 17 s, 50 ≈ 50 s; with the active fifth polled faster, 50
favourites ≈ 20 s for the active ones and ≈ 80 s for the quiet ones. For
research: R2 200, R3 50 (this supersedes the 500 of decisions 2026-11-06, the
research phase approved, which was for R1's measurements). Raising it is the
owner's call. **(2) THE TERMS OF USE** (polymarket.com/tos §4.2 bars crawlers
and scraping of "the Site, any other Interface, or Features" and sets no API
rules; the API is documented as public, with published limits): the project
continues — personal use, watch-only, no resale or sharing of the data, at the
budget above. Asking Polymarket for a confirmation is NOT needed for any
research step; it stays an option for the owner before v1 runs around the
clock (the supervisor's recommendation: not needed at this volume; revisit if
Polymarket publishes API terms or limits our address). **(3) R4's OWNER TEST
SHEET** (`workers/R4-NOTIFY/OWNER-TEST-SHEET.md` in the supervisor folder)
runs later, when the notifier is built, with the supervisor guiding it step by
step; nothing for the owner now. **(4) DEFAULTS FOR THE V1 PLAN, approved
together:** 20% of the budget in reserve; the owner's browser on
polymarket.com/perps shares the bucket — no rule, the poller backs off on a
429; positions polling (weight 5) with a fills read on a change only for
accounts labelled directional and slow, fills polling (10) for the rest (the
style label decides: a scalper's quick open-and-close was missed up to 6.8% of
the time); the exact deposits-and-withdrawals column (`/v2/info/pnl`) only
where it exists, "flows unknown" elsewhere; the unpublished pnl/equity routes
charged 15 tokens, calibrated only if v1 reads them often; Windows' own Do Not
Disturb for quiet hours; open, close, flip and liquidation alerted at once,
adds and reduces grouped for up to 20 s; Windows PowerShell 5.1 as the toast
helper, an own app name by one per-user registry key once the sheet proves it,
no tray icon; two processes at sign-in (poller and notifier, the notifier
also announcing "poller down" and "data stale"); phone alerts (ntfy and a
dead-man's switch) after Windows alerts work; ROI only beside its capital
base, with a display floor above $100; no composite "copy score";
"unclassified" a visible label that warns on favouriting like an algorithm;
competition membership stored and labels on rolling windows; schemas tolerant
of new fields with a daily log of unknown keys, closed lists only where an
unknown value would do harm, and a weekly read of the changelog; no paid data
in v1; a manual "same person" note for linked addresses goes to the backlog.
**What the owner will do with it:** use the information for the owner's own
trading decisions, on Polymarket or elsewhere. The app stays watch-only and
never advises (Iron Rules 1 and 6); R8 and the forward paper-follow log are
how it shows, honestly, whether following the dominant traders pays.

2026-11-06 (the pre-test and waves 2–4 approved — the owner, on the
supervisor's recommendations): **BEFORE V1 IS PLANNED, ONE RETROSPECTIVE LOOK
ASKS WHETHER FOLLOWING PAYS AT ALL, AND WHETHER THE LEADERBOARD IS SKILL OR
LUCK.** The owner sent nine lessons from polymarket-lab's supervisor
(2026-11-06), each with its source in `E:\coding\polymarket-lab`, read only:
the F9 drift probe (`docs/reviews/drift-probe-2026-09-04.md`, its review;
the lab's decisions 2026-09-04), data-hunt Q8
(`docs/reviews/data-hunt-2026-11-04.md`), STATS-1
(`docs/reviews/statistics-methods-2026-09-24.md`; the lab's decisions
2026-09-24, reading methods), READ-64 item 5 (the lab's decisions
2026-10-03), hunt-1 Q2 (`docs/reviews/hunt-1-2026-11-04.md`) and the lab
master-plan's "What the leaderboard is actually for". **Where they landed:**
(1) does following pay and (2) skill or luck → **R8-PRETEST**, one new study;
(3) the scoreboard's statistics → R3: an e-process valid however often the
owner looks (a verdict only at E ≥ 20, as the lab's nightly number), rules
fixed before the data, a correction for testing many traders at once; (4)
realized profit against account value — the perps board counts closed trades
only, so a trader banking small wins and holding big losers open ranks high
while underwater → R2, an "underwater" flag beside the style label; (5)
profit per volume by instrument category (crypto majors, small coins, US
stocks, commodities, pre-IPO) → R2, read relatively, the volume beside it;
(6)–(9) competition players and reward farmers, thin markets and the
follower's slippage, liquidity by hour and stock sessions, data freezes →
already in the plan (R1–R4, the v1 plan), now with the lab's evidence. **THE
WAVES, REVISED:** wave 2 — R2-STYLE (Opus 5.5, max; 350 tokens a minute; it
also collects the pool's fill histories R8 reuses), R2-LABELS (Sonnet 5.5,
xhigh; blind, no API), R3-PAPER (Opus 5.5, max; 100); wave 3 — R8-PRETEST
(Opus 5.5, max; 450), R6-STORAGE (Sonnet 5.5, xhigh; 50); wave 4 — R7-PAGES
(Sonnet 5.5, xhigh), after R8, whose verdict decides what v1 is. **R8'S
RULES, FIXED NOW** — the structure; every number marked [R1], [R2] or [R3]
is filled from those reports, shown to the owner and recorded here BEFORE the
one look:
**A — DOES FOLLOWING PAY?** (A1) *Pool:* the all-time NOTIONAL board's
pageable top 1,000, read at a stamped instant — chosen on activity, not
profit. (A2) *Periods:* selection, the 30 days before T0; measurement, [T0,
T1), as long as the fill history allows [R1]. (A3) *Tracked set, fixed at T0
from pre-T0 data only:* labelled directional by R2's frozen classifier on
pre-T0 fills [R2]; window notional above a floor (the lab's dormant-wallet
trap) [R2]; at least 10 closed positions in the window; the top 50 by
realized PnL minus fees. Secondary arm: the top 50 by PnL / notional. (A4)
*Entry:* each opening from flat and each flip; fills of one order and fills
within 60 s merged; adds secondary. (A5) *The follower's price:* the first
public trade at or after the fill plus the delay the planned poller would
really have had — the next poll at a random phase (fixed seed), the API's lag
[R1], the notification [R4], 60 s to act — plus the cost of crossing the
spread [R3]; never a price before the fill (the follower cannot capture the
trader's own impact: F9). Secondary delays 15 s, 5 min, 30 min. (A6) *Exit:*
mirror the trader's close or liquidation after the same delay; open at T1 →
marked at T1 and flagged; secondary horizons 1 h, 6 h, 24 h. (A7) *Costs:*
the base-tier taker fee on both legs and funding over the hold, signed [R1].
(A8) *Unit:* net return on equal notional per entry. (A9) *Null:* per entry,
3 random public trades in the same instrument and the same UTC hour of the
same day (the tracked accounts' trades removed by trade ID if R1 confirms the
match [R1]), each keeping its own taker direction, with the same delay,
holding time and costs; fixed seed; d = tracked − the mean of its nulls.
(A10) *Honest N is traders:* a paired bootstrap clustered by trader (2,000
resamples), and by calendar day as a second clustering. (A11) *The verdict,
one look, the primary cell only:* **PAYS** only if (i) the mean tracked net
return is above zero with its trader-clustered 95% interval above zero, (ii)
the mean d is above zero with its 95% interval above zero under both
clusterings, and (iii) the exact two-sided sign test, one vote per trader (its
mean d), gives p < 0.05 in favour; **TOO FEW TO TELL** under 20 traders with 5+
entries or under 300 entries; **FAILS** otherwise. The upper end of d's
interval is always printed against the round-trip cost. (A12) Secondaries —
other delays and horizons, the ratio arm, adds, categories, hours, sessions —
decide nothing. (A13) *Frozen before the look:* a rules file with every
threshold, committed and recorded here; the capture stored with its read
instant; the analysis reads only the capture (polymarket-lab 2026-09-04: an
experiment that reads a live collection has no fixed answer); a changed
threshold makes a new run, never a revision.
**B — SKILL OR LUCK?** (one study with A, the same pool) (B1) *Reappearance:*
weekly boards rebuilt within the pool from fills (Monday 00:00 UTC; PnL =
realized − fees, funding estimated and stated), directional accounts only;
the share of week w's PnL top 50 also in week w+1's, against the same share
on the notional board. Find on the first half of the weeks, confirm on the
second; **kill** in the find half unless PnL reappearance exceeds notional
reappearance with a week-block bootstrap interval excluding zero. (B2)
*Persistence:* rank on PnL / notional over 4 weeks, measure the next 4;
Spearman and the top fifth minus the rest against 2,000 permutations; find on
the first pair, confirm on the next; **kill** if the find pair's correlation
is ≤ 0 or its permutation p ≥ 0.05. (B3) Under 8 weeks of history [R1], B is
"not testable yet" and becomes a forward measurement on v1's stored weekly
boards. (B4) A board rebuilt inside the pool is not the real board; stated.
**THE OWNER'S RULINGS WITH IT:** (1) **"Too few to tell" counts as not
proven:** v1 is then planned as a watching tool and the forward paper-follow
log is the real test. (2) **If following fails,** alerts still fire, as
information about what a trader did; what goes is the copy framing and the
scoreboard's headline place. (3) **Bulk research data** goes gzip-compressed
to `F:\polymarket-follow-research\` (E: 16 GB free, 92% full; F: 1,556 GB
free — measured 2026-11-06 22:18Z).

2026-11-06 (the research phase approved — the owner, recorded by this
project's supervisor in its first session): **THE RESEARCH PHASE STARTS, IN
THREE WAVES.** The supervisor's first report (2026-11-06, from the saved spec
in `verify/SEED-PERPS-1106/`) found the founding docs short of what the spec
says: the leaderboard pages only to rank 1,000; the spec publishes each
endpoint's request weight (fills, position-fills, trades and funding 10;
portfolio, leaderboard and klines 5; fills and position-fills cached 2 s, a
cached read costing 1); `trade_id` is a plain JSON integer already at 94.6% of
JavaScript's largest exact integer; `/v2/info/pnl` is not in the saved spec;
money fields are decimal strings of up to 28 digits; and "both sides at once"
cannot be read from one account's net position. R1 corrects external-apis
with live evidence; R2 redefines the style features. **The owner approved, on
the supervisor's recommendations: (1) THE WAVES.** Wave 1: R1-API, R4-NOTIFY
and R5-TOOLS in parallel (Sonnet 5.5, effort xhigh). Wave 2: R2-STYLE and
R3-PAPER (Opus 5.5, effort max — their output decides something: a ship gate
and the honesty method), with R2-LABELS, a blind re-check of R2's labels
(Sonnet 5.5, xhigh). Wave 3: R6-STORAGE and R7-PAGES (Sonnet 5.5, xhigh).
Waves 2 and 3 are revised with the owner's lessons from polymarket-lab and
shown to the owner before they start. R6 waits for R2's fill rates by style
instead of running beside R1 as the plan page said, because **every subagent
that calls the API shares one IP budget** — with each other and with this
machine's other traffic. **(2) THE WEIGHT CHECK:** R1 runs 10 minutes of
steady load at the planned rate (half the budget), which must see zero 429s,
plus ONE ceiling test on fills that stops at the first 429 and pauses 2
minutes — the one deliberate touch of the limit, because the replies carry no
rate-limit header to confirm the published weights by. **(3) TASK
SCHEDULER:** R4 prepares its test task; the owner registers and runs it at a
time agreed with the supervisor (no persistent setting without the owner's
yes: WORKFLOW). **(4) THROWAWAY MEASUREMENT SCRIPTS** in a subagent's own
`workers/<NAME>/` folder are research, not code — like the founding probe; no
app code and no package installs until the owner approves the v1 plan. **(5)
THE OWNER'S RULE — EVERY REPORT GOES BEYOND ITS BRIEF:** besides the
variations, possibilities, problems with their handling and unknowns
(2026-11-06, three more of the owner's requirements), every report has a
"Beyond the brief" section — what nobody asked but matters — and ends with
its questions for the owner, each with a recommendation. The owner: "think
out of the box, try to get everything, predict everything ... all your
subagents which will work should work on same way until we define 100% what
we doing and how we doing." **The rules for every subagent that calls the
API:** the user agent `polymarket-follow-research`; a fixed token share each,
all together at most 500 weighted tokens a minute (half the published 1,000);
stop at the first 429 and pause; no calls during polymarket-lab's nightly
window, 02:35–03:50 UTC; Node's built-ins only.

2026-11-06 (three more of the owner's requirements, before this project's
supervisor starts — recorded by polymarket-lab's supervisor): **(1) ALGORITHMS
AND MARKET MAKERS ARE ALWAYS RECOGNISED, NEVER FOLLOWED BY MISTAKE.** The live
check that founded the project (2026-11-06) found the all-time #1 of the perps
leaderboard making 100 fills in 64.4 minutes across 7 instruments — 48 adds,
52 reductions, every one a taker fill — while holding 11 positions at once: an
algorithm, whose alerts would mean nothing to a follower. The owner: "we need
to avoid this and always recognize so to not get into trap." So every account
the project stores carries a style label computed from its own fills (trades
per day, holding time, both sides at once, positions held), shown wherever the
account appears; alerts and the paper-follow scoreboard cover directional
traders by default; favouriting an account labelled an algorithm or market
maker warns first. R2 designs the classifier and proves it on labelled
examples before v1 is planned; v1 does not ship without it. **(2) EVERYTHING
IS RESEARCHED BEFORE ANYTHING IS BUILT** — the owner: "everything need to be
fully researched all variations, all possibilities, all potential problems,
and everything before i start." Every research report states the variations it
weighed, the possibilities it found, the potential problems and how each would
be handled, and what stays unknown; the supervisor walks the owner through the
reports, and nothing is planned or built until the owner says the research is
complete. **(3) THE LAB'S DATA DOES NOT CARRY OVER TO PERPS.**
polymarket-lab's three months are prediction-market data — its forecasts,
scores and a daily top-50 leaderboard of prediction-market traders since late
August 2026 (its `leaderboard_snapshots`) — and perps is a separate exchange
with its own traders, so perps starts from its own API. When prediction-market
traders are added (the plan page's backlog), that leaderboard series is worth
a one-time read-only export: no API can backfill standings over time
(polymarket-lab's master-plan), and reading is not writing (Iron Rule 2).

2026-11-06 (polymarket-follow founded — the owner's decisions, recorded by
polymarket-lab's supervisor before this project's own supervisor starts):
**A SEPARATE PROJECT, WATCH-ONLY.** The owner wants to follow Polymarket
Perps traders — the leaderboards, favourites, a notification when one opens
or closes a position, statistics on how they trade, and an honest
paper-follow log — outside the forecasting lab ("all of this not have
relation with our laboratory forecasting"). **(1) Its own repository and its
own supervisor chat,** not a module of polymarket-lab: two supervisors in one
repository would edit the same shared files, a failing test here would block
the lab's checks, and this project reads prices and follows wallets, which
the lab's price-blind rules forbid there. The lab's way of working, stack and
documentation system are copied, never shared (the owner: "if you think it is
better like that"). **(2) Watch only:** no order code, no trading keys, no
automatic copying; public endpoints only (CLAUDE.md, Iron Rule 1). **(3)
Perps first,** prediction markets later ("let's try first only with perps").
**(4) Windows notifications first,** other devices and email later. **(5)
Favourites 5–50,** the polling interval set by research from the API's real
limits. **(6) Keep the data,** in this project's own database with its own
backup folder. **(7) Research before the plan, the plan before code:** R1–R7
(the plan page), then a v1 plan the owner approves; the owner is open to
paying for data if research shows a need. **(8) The paper-follow log is
honest by design** (Iron Rule 4): polymarket-lab's F9 probe (2026-09-04, 660
wallets) found tracked top wallets' entries predicted 1–24 h price moves no
better than random trades in the same markets at the same hours, so only a
record kept after following starts, net of the alert's delay, fees and
funding, can show whether following pays. **(9) The simplest good solution,
following current best practices,** checked against official documentation
or the web when unsure — the owner's standing approval, as in forecast-site
(2026-10-28) and polymarket-lab. **VERIFIED BEFORE FOUNDING** (live calls
2026-11-06 13:59Z and 14:35Z; the supervisor folder's
`verify/SEED-PERPS-1106/`): the public leaderboard, fills and open positions
by address, the rate budget — docs/claude-external-apis.md.
