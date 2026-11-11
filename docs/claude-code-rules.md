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
  2026-11-07, wave 1 closed). No cron tick that fires many reads at once. On a
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
- **Build the world a rare rule needs:** a synthetic search finds one
  cheaply; when a search finds none, build it from the rule's algebra.
- **A rule that fixes an instant is read at that instant,** never at the
  caller's later time (polymarket-lab, 2026-11-06: a re-read read late took in
  data that arrived after it).
- **Tests use synthetic data;** a real reply saved as a fixture is trimmed to
  what the test needs and dated.

## This machine (Windows, Git Bash)

- **`pnpm verify` = build + lint + test + format:check, in CI's order;**
  running fewer is how a green session still breaks CI.
- **Git normalises line endings to LF** (`.gitattributes`); Prettier expects
  LF.
- **Write scripts to a file** (`.mjs` or `.cjs`) — `node -e` breaks on
  backticks and quotes in Bash.
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
- **Windows PowerShell 5.1 traps:** `Set-Content -Encoding UTF8` writes a
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
  with the Write or Edit tool (COLLECTOR-REVIEW, 2026-11-11).
- **Node's `.env` loader** (`process.loadEnvFile`, Node 24.13) keeps unquoted
  backslashes, and a variable already set in the environment wins
  (COLLECTOR-BUILD, 2026-11-11).
- **Never dump window titles or the screen in a test:** they leak the owner's
  private window names (R4, 2026-11-06).
