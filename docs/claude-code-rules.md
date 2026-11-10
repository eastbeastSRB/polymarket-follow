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
- **A `cmd.exe` launcher holds its output file open** while it runs; a second
  launcher must check for it. **pino's asynchronous file destination is not
  open at once** — log synchronously where a process may exit at start.
  **Windows' per-process I/O counters leave out sockets** — measure network
  bytes in the process. **Find a node process by its absolute script path,**
  never by `dist\index.js` alone (the lab's worker has the same).
  **Batch files keep CRLF** (`*.cmd text eol=crlf` in `.gitattributes`)
  (all COLLECTOR-BUILD, 2026-11-10).
- **Never dump window titles or the screen in a test:** they leak the owner's
  private window names (R4, 2026-11-06).
