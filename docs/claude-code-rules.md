# Code rules — how code is written here, and the gotchas

READ BEFORE writing code. Append when a rule is set or something bites, with
its date and where it came from. Seeded 2026-11-06 with polymarket-lab's
rules that apply to any project; the skeleton build adds this project's own.
The supervisor owns this file (CLAUDE.md, WHO EDITS WHICH DOC).

## The basics

- **TypeScript strict;** no `any`. Zod schemas are the types (`z.infer`) and
  the database's schema (MongoDB's native driver, no ORM).
- **Parse at the boundary:** every external reply and every stored document
  is Zod-parsed where it enters; a failure is logged and dropped, never
  guessed (Iron Rule 3).
- **Logs through pino,** structured; no `console.log` in app code.
- **Configuration from the environment only** (`.env`, never committed, its
  template `.env.example` committed); no key in code or docs.
- **Pure functions for what a test must pin;** I/O at the edges. One client
  per external API holds its rate budget and back-off in one place (Iron
  Rule 5).
- **No speculative abstraction:** no second copy of something that exists, no
  fallback nothing needs, no parameter no caller passes; names say what a
  thing is.
- **Comments: the delete-the-line test.** If deleting a comment loses nothing
  the code does not already say, delete it. A number in a comment carries its
  date; a pointer to the docs names its anchor (a dated decisions entry or a
  section), so a reader opens one entry, not a whole file.

## The Perps API (from the research, 2026-11-07; the facts: external-apis)

- **One client, one request at a time, evenly spaced.** The limit is a token
  bucket with a burst of only ~90–100 tokens; the budget is 250 tokens a minute
  for all callers together, never more than 30 in a burst (decisions
  2026-11-07, wave 1 closed); since 2026-11-12 the collector's client takes
  50 a minute and 15 in 5 s, the paper experiment's 120 and 15 (a test sums
  the callers' literal limits). No cron tick that fires many reads at once. On a
  429: drop the tick, back off at least 2 s, never retry in a loop.
- **Admit each request before sending it:** the tokens spent in the trailing
  60 s plus this request's weight must fit the share, and the trailing 5 s plus
  it must stay within 30. Spacing alone — by the previous call's weight or by
  the next one's — overran a trailing minute in a replay of 1,796 real calls
  (R3 report, Final review F7).
- **Schemas tolerate new fields:** `z.object()` (never `.strict()`) on external
  replies, a daily log of unknown keys; closed lists (`z.enum`) only where an
  unknown value would do harm, and then decide whether one bad row drops the
  row or the page (R5 §6, corrected).
- **IDs:** `z.number().int().safe()`; they are random, so never order or page
  by id; key a fill by `(trade_id, instrument_id, timestamp)`.
- **Money and sizes are decimal strings** (up to 28 digits): never through a
  float for accounting.
- **Read fills per order event:** group by `(order_id, previous_size)` — both
  describe the position before the whole order; reading fill by fill misreads
  ~11% of events (R1 Q4).
- **Addresses are stored lower-case** (the API returns them checksum-cased).
- **Time windows:** `start_timestamp` inclusive, `end_timestamp` exclusive;
  after the first read, resume from the last seen time and dedupe by key.
- **No project or personal name leaves this machine:** a request to any outside
  service (a User-Agent or other header, a URL, a search) carries a generic
  client name, never "polymarket-follow" or anything about the owner. Found
  2026-11-12: the collector's `USER_AGENT` and PAPER-PLAN's probe named the
  project; the client now takes the User-Agent per instance (the collector
  `data-collector/1.0`, the experiment `data-reader/1.0`; PAPER-BUILD), live
  at the collector's next deploy. A source scan for the names reads comments
  too.
- **Ids above 2^53 − 1 exist** (liquidation fills of one account): parse them
  with a `JSON.parse` reviver that reads `context.source` (Node 24) and keep
  them as their digits; R2-STYLE's stored ids of that size are rounded
  (PAPER-BUILD, 2026-11-12).
- **A WebSocket reader needs a no-frame watchdog:** a connection went silent
  for 8 minutes with no close or error event while the recorder kept writing
  its last-seen values as new rows (R3-WEEKDAY, 2026-11-09). Reconnect after
  15 s without a frame; judge liveness and freshness by the data (the newest
  frame's event time), never by the process or the socket being open.

## Tests

- **Assert every output a branch sets,** not only its summary: a mutant
  survives a test that checks a category but not the numbers behind it.
- **A guard tested only on its happy path is untested:** delete it, run the
  suite, see a test fail.
- **Mutation-check what decides something:** break each rule on purpose and
  see a test fail; a crash or a timeout counts as killed.
- **Run deliberate breaks only in a scratch copy** (`git archive HEAD`),
  never in the working tree. A harness that rewrites the real source is one
  crash away from leaving a break behind, and from a frozen list that hashes
  it (MARKET-CODE-REVIEW L11, 2026-11-13).
- **Make the break list's run honest:** dry-run each list first (every find
  text matches exactly once); re-aim a break whose text a fix moved, and list
  which, never dropping one silently; give heavy tests their own time limit
  and record each kill's failure message. A kill by timeout alone is
  unproven (MARKET-FIX, 2026-11-13).
- **`toBeCloseTo(0)` passes on `null`** (null coerces to 0): pin an expected
  zero with `toBe` or `toMatchObject`, or assert it is not null first
  (WAVE-H-BUILD, break k09, 2026-11-14).
- **A `describe(..., { timeout })` does not cover its hooks:** a heavy
  `beforeAll` needs its own limit (vitest's default is 10 s), and a
  file-level `afterEach` cleanup deletes a store a `beforeAll` shares. Gate
  every commit on `pnpm verify`'s exit code in the same command: `f77fa89`
  went in red when a test timed out under load (WAVE-H-BUILD, 2026-11-14).
- **A test run keeps its temporary folders in one folder, removed at its
  end:** `apps/poller/test/temp-root.ts` (vitest's `globalSetup`) points
  `TEMP`, `TMP` and `TMPDIR` at `%TEMP%\polymarket-follow-tests-XXXXXX` and
  removes it when the run ends. It sweeps such folders 6 h old or more:
  real folders only, never a link. A test makes its folders with
  `mkdtempSync(path.join(tmpdir(), …))` and need not remove them. A run
  needs about 3.1 GB free on C: while it runs. Before this, the tests left
  about 43,500 folders (13.6 GB) in the owner's `%TEMP%` in a week
  (TEST-TEMP, 2026-11-18).
- **A test that spawns a process or the built program gets an explicit 60 s
  limit:** a test spawning `dist/polish.js` seven times passed alone and
  timed out at 5.09 s under the full suite's load in the supervisor's
  verify. Six such tests got one (`36901d0`; EXTRACT-BUILD-2, 2026-11-18).
- **WAVE-H's test helpers write incomplete records:** fills without
  `closedPnl`, `oid` and `dir`, and takers without makers. A test of a
  reader that wants whole records builds its own (EXTRACT-BUILD-2,
  2026-11-18).
- **A break that deletes a statement is `void 0`, not an empty line:** an
  empty line can make the next statement an `if`'s body. A break that leaves
  a dangling `else` is killed by a syntax error, which proves nothing:
  re-aim it (EXTRACT-BUILD-2, 2026-11-18).
- **Compare two implementations' floats in the same order, or compare
  instants rather than sums:** a sum in another order differs by rounding
  alone (EXTRACT-BUILD-2, G4 and G6, 2026-11-18).
- **A break in code the built program runs needs `dist` rebuilt in the
  scratch copy,** or the break tests the old build. `vitest -t` narrows a
  heavy break's run (a gates break to about 100 s). **Heavy hooks
  (`beforeAll`, `afterAll`) need explicit limits:** under the full suite's
  load WAVE-H's rehearse hooks passed vitest's 10 s default (EXTRACT-FIX,
  2026-11-18).
- **When a requirement is about a line's position, test the position:** a
  test that finds the start line by its message still passes when another
  line comes first; read the first line (EXTRACT-FIX-2, break H5,
  2026-11-18).
- **After the breaks, remove each junction link in a scratch copy on its
  own** (`cmd /c rmdir <link>`, no `/s`). The copy is then a plain folder,
  and a later cleanup cannot follow it into the repository's `node_modules`
  (EXTRACT-FIX-2, 2026-11-18).
- **typescript-eslint's `require-await` rejects an async stub with no
  `await`:** return `Promise.resolve()` from a plain function instead
  (EXTRACT-FIX, 2026-11-18).
- **Drive a whole run with a fake clock that moves only when the run waits,**
  and bound it in fake time, so a run that never ends fails with a message
  (WAVE-H-FETCH, 2026-11-14).
- **A test of the compiled imports keeps a freeze list exact:** it fails when
  the program reaches a file the list leaves out (WAVE-H-BUILD, 2026-11-14).
- **Check that a break changes the value the test expects:** b66 survived
  because 6/144 happens to equal 4/96 (WAVE-H-FIX, 2026-11-16). A break can
  be equivalent on the real inputs (a grid's `<=` that no real grid
  reaches): test the helper directly on an input that is an exact multiple.
  **A test of one reset rule can be masked by another reset in the same
  run:** give each reset its own observable effect, such as the time of the
  step it delays (FRESH-FETCH, 2026-11-17).
- **A write failure without mocks, on Windows:** opening a folder for
  writing fails at once with EISDIR; renaming onto a non-empty folder fails
  with EPERM every time. **A retry count tested by elapsed time** needs pauses
  that absorb timer overshoot (500 ms; assert 9 pauses ≤ elapsed < 10)
  (WAVE-H-FIX, 2026-11-16).
- **A test gives the same answer before and after a freeze list is
  committed:** test an exit code that depends on the list through the
  functions, not the built program (MARKET-FIX, 2026-11-13).
- **A test that pins an order makes the early read fail loudly** (a folder
  where a file is read): a reader that returns empty for a missing path
  leaves no trace when moved too early (MARKET-FIX-CHECK N2, 2026-11-13).
- **No soft fallback for a parse of our own file:** when a file we write
  (a freeze list, a manifest) fails to parse, raise an error. Never show
  "unknown". MARKET-1's page would have printed "frozen on unknown" for good
  (MARKET-CODE-REVIEW M1, 2026-11-13).
- **Build the world a rare rule needs:** a synthetic search finds one
  cheaply; when a search finds none, build it from the rule's algebra.
- **A rule that fixes an instant is read at that instant,** never at the
  caller's later time (polymarket-lab, 2026-11-06: a re-read read late took in
  data that arrived after it).
- **Tests use synthetic data;** a real reply saved as a fixture is trimmed to
  what the test needs and dated.

## Research studies (round 2, 2026-11-11)

- **A placebo of one random draw can mislead:** draw it at least 1,000 times
  and read the real statistic against that distribution (FIND-REVIEW-A: a
  one-draw coin placebo seemed to "repeat" FIND-4's near miss; 1,000 draws
  showed nothing).
- **A random-trade yardstick has its own move:** a public print is followed
  by about +2 bps its own way within 10 s, whether drawn per print or per
  order — a study of seconds reads the book beside the mark (FIND-REVIEW-B,
  entry 5).
- **Recompute a deciding number with independent code** before a result is
  accepted, unit by unit, not only the mean (the three FIND Final reviews).
- **Vendored frozen code** (the paper experiment's `apps/poller/research/`):
  byte copies, `-text` after `* text=auto` in `.gitattributes`, kept out of
  Prettier and ESLint, loaded by path and typed by interfaces, its
  fingerprint checked at every load; a frozen helper that hard-wires an
  instant (lib-exits' `planCopy` and the cut) is re-implemented with the
  run's own end, never called past it (PAPER-PLAN-REVIEW F9).

## This machine (Windows, Git Bash)

- **`pnpm verify` = build + lint + test + format:check, in CI's order;**
  running fewer is how a green session still breaks CI.
- **Git normalises line endings to LF** (`.gitattributes`); Prettier expects
  LF.
- **Write scripts to a file with the Write tool** (`.mjs` or `.cjs`) —
  `node -e` and heredocs mangle backslashes, backticks and quotes in Bash, and
  a `sed` with `\\r` wrote a CR byte into a source file (2026-11-12).
  **Read a regex back from the file after writing it:** MARKET-1's
  `/^# written (\S+)/` lost its backslash and matched only the letter S, and
  no test noticed (2026-11-13). The rule bit again on 2026-11-14: a `node -e`
  edit mangled four backslashed paths in architecture (WAVE-H-BUILD).
- **Never run pnpm in a scratch copy whose `node_modules` are junctions to
  the repository's:** its install writes through them. On 2026-11-13 two of
  the repository's links pointed into a scratch for 86 s (MARKET-FIX-CHECK).
  Make the scratch's `node_modules` a real folder of per-package junctions,
  so vitest's caches stay in the scratch (WAVE-H-FETCH, 2026-11-14).
- **A process that must outlive a chat session is started through WMI**
  (`Win32_Process` Create), detached and at low priority, its pid written
  down: `tools/waveh-fetch-start.ps1` (WAVE-H-FETCH, 2026-11-14).
- **lz4js 0.2.0 decodes one frame and stops without a word, and misreads
  block checksums:** check that the frame ends at the file's end, and refuse
  frames with the block-checksum flag (WAVE-H-BUILD, 2026-11-14).
- **Zod:** a `refine` at an object's root has an empty path, so give it a
  `path` or its refusal names nothing; Zod 4's `.int()` already refuses
  unsafe integers. **JavaScript's default `sort` puts upper case first**
  (it compares code units) (WAVE-H-BUILD, 2026-11-14).
- **`node --test <directory>` fails in Node 24** (MODULE_NOT_FOUND): pass a
  glob.
- **A Task Scheduler time literal is local:** `-At 'HH:MM'` is read as local
  time when the task is registered and stored in UTC, so a registration made
  in summer time lands an hour earlier in UTC; compute the trigger from the
  UTC instant (`Get-DailyUtcStart` in `tools/task-access.ps1`, used by the
  paper and backup tasks since 2026-11-12).
- **A long run gets a generous heap ceiling from its start** (the owner,
  2026-11-17): size it from a measured peak with a wide margin, never from
  an estimate made on a smaller sample. This PC has 31.9 GB of RAM. WAVE-H's
  step 1 died at an 8 GB ceiling after 7 hours (its live data was above 8
  GB, against the rehearsal's estimate of 2.8–4 GB); it then ran at 16 GB
  (a 9.3 GB peak) and step 2 at 20 GB (about 17 GB in use). A ceiling costs
  nothing until it is used.
- **Use absolute paths;** batched shell calls share one working directory.
- **Run checks with `< /dev/null`, to a file, under `timeout`;** stop a server
  by its port, never by a process name.
- **A background loop needs its own time limit and a liveness check that works
  here:** `pgrep -f` does not work in Git Bash, and two wait loops built on it
  never ended (R1, 2026-11-06). Every background process a session starts is
  stopped before it reports.
- **An argument starting with `/` is rewritten by Git Bash** into a Windows
  path: prefix `MSYS_NO_PATHCONV=1`, and then pass Windows-style paths
  (`E:/…`), not `/e/…`.
- **Windows PowerShell's stdin is code page 437 here:** a Node process feeding
  it text sets `[Console]::InputEncoding` to UTF-8 first, or non-ASCII names
  arrive garbled (R4, measured 2026-11-06).
- **Zod 4 makes a key typed `z.unknown()` required;** mark it `.optional()` when
  a reply may leave it out (COLLECTOR-BUILD, 2026-11-10).
- **`pnpm deploy` rewrites the workspace's install state** as production-only,
  and its default `node_modules` links by absolute path, so a renamed folder
  breaks ("Cannot find package"): deploy hoisted, then re-install the
  workspace (COLLECTOR-BUILD, 2026-11-10).
- **pino's asynchronous file destination is not open at once** — log
  synchronously where a process may exit at start. **Windows' per-process
  I/O counters leave out sockets** — measure network bytes in the process.
  **Batch files keep CRLF** (`*.cmd text eol=crlf` in `.gitattributes`)
  (all COLLECTOR-BUILD, 2026-11-10).
- **A scheduled task runs its program itself, with no launcher:** Task
  Scheduler's stop ends only the process the task started — a node started by
  `cmd.exe` outlived it (COLLECTOR-BUILD, 2026-11-11). A task's own user gets
  read only (FR) unless granted execute, which starting and stopping need;
  Task Scheduler's restart-on-failure ignores the program's exit code.
- **`Stop-ScheduledTask` returns before the process has ended:** a
  `Start-ScheduledTask` right after it meets the old poller still alive, the
  new one exits 3 at the lock, and nothing records until the check task
  restarts it (2026-11-11: 4 min 49 s). Restart through `tools\deploy.ps1`,
  which waits for the pid, or wait until the task is Ready (the supervisor,
  2026-11-11).
- **A normal session cannot see or open an S4U task's processes** (an empty
  command line, OpenProcess refused); `Get-Process -Id` still answers. Stop
  such a process through its task, and judge the stop by the task's state and
  the pid, never by the call's result (`IRegisteredTask::Stop` may return
  S_FALSE) (COLLECTOR-BUILD, 2026-11-11).
- **Test task scripts under a task name that does not exist:** the
  ScheduledTasks module's commands are functions, and once the module loads
  they hide test fakes. **A leftover test process that inherited a tool's
  handle keeps a background run from ending:** stop every test process after
  each case and give each run a time limit (COLLECTOR-BUILD, 2026-11-11).
- **Windows PowerShell 5.1 traps:** `$ErrorActionPreference = 'Stop'` turns
  a native command's stderr into a terminating NativeCommandError, so a
  script stops halfway and can leave what it started running (FRESH-FETCH,
  2026-11-17); `Get-Date -Format u` prints local time with a `Z` (the
  supervisor, 2026-11-16; read UTC from `date -u`); a variable inside a
  single-quoted string is not expanded (`'--x=$n'` passes `$n` literally);
  `Set-Content -Encoding UTF8` writes a
  BOM — use `[IO.File]::WriteAllText` with `UTF8Encoding($false)`;
  `(Get-Content f)[-1]` on a one-line file is its last character — wrap it in
  `@()`; `Get-Content -Raw` of an empty file is `$null`; with
  `Start-Process -PassThru`, read `$p.Handle` before `WaitForExit(ms)` or
  `ExitCode` stays `$null`. **`New-ScheduledTaskTrigger -Daily -At` stores
  the time in UTC:** a daily task keeps its UTC time through summer time
  (all COLLECTOR-BUILD, 2026-11-11).
- **vitest runs test files in parallel:** tests that share one database
  (`polymarket_follow_test`) live in one file. A test that runs the built
  program needs `pnpm verify`'s order — a bare `pnpm test` runs a stale
  `dist` (COLLECTOR-BUILD, 2026-11-11).
- **A scheduled task runs below normal priority by default** (Task Scheduler's
  7): a recorder needs `-Priority 4`, or a busy PC delays its frames — the
  book "stalls" of 2026-11-11 were this PC's, not the server's
  (COLLECTOR-REVIEW, 2026-11-11).
- **`stream.pipe` forwards no error:** use `stream.pipeline`. **Guard a
  recursive delete by what the folder holds, never by its name** (the
  recordings' day folders carry the same names as the backups'). **A
  liveness check counts a frame before it is parsed,** or a changed frame
  shape restarts the connection in a loop. **Mutation-check the constants
  that wire a rule into a job,** not only the rule. **An untracked file of
  another worker blocks a deploy** (it deploys only a clean tree)
  (COLLECTOR-REVIEW, 2026-11-11).
- **A Bash heredoc in this harness halves `\\`:** write regular expressions
  with the Write or Edit tool (COLLECTOR-REVIEW, 2026-11-11; it halved a
  `\\n` in an edit script again on 2026-11-16, WAVE-H-FIX). **Run Prettier
  on the changed files before `pnpm verify`,** or a verify is spent on
  formatting alone. **The harness moves a foreground command to the
  background after about 180 s:** wait on the background task's notice
  (WAVE-H-FIX, 2026-11-16).
- **V8's `--max-old-space-size` is process-wide and beats a worker's
  `resourceLimits`:** a 4 GB worker reported a 16,576 MB ceiling under the
  flag, and a worker's `execArgv` cannot carry it. To give threads different
  ceilings, run the program itself in a worker with its own limit and pass
  no heap flag (`dist/polish.js`'s launcher; EXTRACT-FIX, 2026-11-18).
- **A seal checks the name before it resolves the real path:** a sealed name
  is refused without being opened; then the real path (through junctions)
  is checked again (EXTRACT-FIX, 2026-11-18).
- **While a download or a long run is going, run at most two test or break
  runs at a time.** Six parallel runs saturated the C:/E: disk (228% busy,
  queue 2.3) while F: and the CPU were idle; FRESH's download runs at Idle
  priority on purpose (the supervisor, 2026-11-18).
- **Before blaming the PC for a slow download, test the network path:**
  `curl -r 0-4999999 -w "%{speed_download} %{remote_ip}"` on a public file
  the tool already fetched, a few times (each one a new connection).
  - FRESH's fall from 1.9 to about 0.15 MB/s from about 10:00Z on 2026-11-18
    was first put down to the disk load above.
  - With the CPU and disks idle, four of five fresh connections to the
    bucket ran at 0.13–0.27 MB/s and one at 1.2 MB/s; another pair gave
    0.12 and 4.5 MB/s. So the slowdown was the network path to AWS,
    varying by endpoint.
  - A restart of the tool (a new connection) did not help.

  (The supervisor, 2026-11-18.)
- **An fsync on F: (a hard disk) costs about 29 ms a small file** and about
  81 ms a part file. For many files whose content is held to a hash, write
  whole (`.tmp`, then rename) without the flush, and flush only the
  manifest. **Scale a worker pool's one-day timing by CPU-seconds, not by
  the wall:** one big file can hold a day's pass (EXTRACT-BUILD-2,
  2026-11-18).
- **Node's `.env` loader** (`process.loadEnvFile`, Node 24.13) keeps unquoted
  backslashes, and a variable already set in the environment wins
  (COLLECTOR-BUILD, 2026-11-11).
- **Never dump window titles or the screen in a test:** they leak the owner's
  private window names (R4, 2026-11-06).
