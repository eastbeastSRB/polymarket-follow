# Architecture — what the system IS

This file describes the system as it exists, and only that — no plans, no
history. Every build that changes the shape updates it in the same commit.
What is planned: the plan page. Why: decisions.

## The collector (C1), live since 2026-11-10 (parts 0–6, 2026-11-11)

**What it is.** One Node 24 program, the poller (`apps/poller`, TypeScript,
the only package of a pnpm workspace), that records Polymarket Perps' public
data for later study and never trades: public GET `/v1/info/` routes and the
public WebSocket only, inside a share of 50 weighted tokens a minute and 30
in any 5 s, no REST call 02:35–03:50Z (the lab's nightly window). The plan:
`docs/reviews/collector-plan-2026-11-10.md`; its deviations from the stack:
decisions 2026-11-11 (COLLECTOR-BUILD's technical calls).

**What it records.**
- **Streams** (`ws/`): the top-20 book of every listed market at most once a
  second when it changed (the sampler), and every trade, on two connections
  (`book-1`, `trades-1`, at most 100 channels each). A watchdog reconnects
  after 15 s without a frame; a market quiet for 15 s is a stall (a frame
  that fails its schema is kept raw in `rejected` and still counts as a
  frame). The market list comes from `/instruments` every 10 minutes and is
  kept in `var\markets.json`, so a start that cannot read it opens the
  streams from the last one.
- **REST reads** (`jobs/`, one client with admission in `api/rest-client.ts`):
  tickers every minute, exchange every 5 minutes, instruments every 10, the
  price audit (REST best prices against the books) every 10; the
  competition pass 23:15Z, the board pass 23:38Z (16 boards × 1,000 rows,
  no page after 23:59:30Z), the daily reads 00:20Z (splits, fees).
- **Files** (`store/files.ts`, `F:\polymarket-follow\recordings\<UTC date>\`):
  `book-HH`, `trades-HH`, `rest-HH` (every reply raw, with its call line),
  `rejected-HH` (what failed a schema) — one line each: receive time, a tab,
  the text. The open hour is plain; a closed hour is Brotli-compressed and
  checked by its round trip; a closed day gets `manifest.json`;
  `coverage.jsonl` holds every gap and mark with its cause
  (`health/coverage.ts` lists the events).
- **Database** `polymarket_follow` on the shared MongoDB server (C:)
  (`store/db.ts`, Zod-parsed documents, one serial write queue):
  `board_snapshots` (one document a board and pass date: pages with their
  stamps, rows, `consistent`, `complete`, `stale`), `competition_snapshots`,
  `universe` (where each address was seen: source, first and last date — no
  value), `rulebook` (the market list, fees, competition dates and boosts,
  splits, exchange marks, the server's closes of an open connection; stored
  on change).

**Health** (`health/`). `var\heartbeat.json` every 10 s (its fields are the
Zod schema `Heartbeat`: connections, jobs, budget, counts, the price audit,
memory, the clock watch's last minute, the disks); the clock watch (each
minute's smallest receive − `ts` on the books; WATCH over 2 s); the disks at
start and hourly (C: warns under 15 GiB and stops our database writes under
6; the recordings' disk warns under 50 and stops the book and trade lines
under 10; with that disk missing the poller still starts and runs, its lines
dropped and counted); the boards' `stale` flag. A crash's last words go to
the poller's own log, `var\logs\poller-<UTC date>.log` (pino, synchronous,
30 days).

**How it runs on this PC.** The run copy `E:\polymarket-follow-run\poller\`
(written by `tools\deploy.ps1` from a clean, verified tree: the program, its
production packages, `.env` from `tools\poller.env`, the check's scripts and
the backup's; the new copy must start and refuse an empty configuration
before it replaces the old one, kept as `poller.old`); its state in
`E:\polymarket-follow-run\var\` (heartbeat, lock, logs, `deploy.log`,
`check.log`, `backup.log`, `markets.json`). Windows tasks, registered by the
owner elevated with `tools\register-tasks.ps1`, all as the owner's account
outside the session (S4U), run level Limited:
- **"polymarket-follow poller"**: node.exe itself runs `dist\index.js` in the
  run copy's folder; at start-up after 1 minute; one instance; it grants the
  owner's account read and execute, so a normal session can stop and start
  it. A second poller is refused by the lock (exit 3). Its priority is 4,
  normal, in `register-tasks.ps1` (2026-11-11); the task as registered still
  runs at Task Scheduler's default 7, below normal, until the owner's re-run
  and the poller's next start — and at 7 the poller falls seconds behind its
  streams whenever the PC is busy (decisions 2026-11-11, COLLECTOR-REVIEW).
- **"polymarket-follow poller check"**: every 5 minutes, `poller-check.ps1`:
  a heartbeat older than 2 minutes → stop the task, wait for the lock's
  node process to end, start it, one line in `check.log`.
- **"polymarket-follow backup"** (prepared in `register-tasks.ps1`, waiting
  for the owner's re-run): `backup.cjs` daily at 05:20Z.
A deploy stops the task (`tools\poller-task.ps1`), swaps the copy and starts
it again: a gap of a few seconds, logged in `deploy.log` and `coverage.jsonl`.

**Backups** (`tools\backup.cjs`, `tools\restore.cjs`, the run copy's MongoDB
driver, none of the poller's code): every collection as canonical Extended
JSON lines, gzip, into `F:\backups\polymarket-follow\db\<UTC date>\` with its
manifest (14 daily and 8 weekly kept; a folder that holds anything but a
dump is never written into or removed, and fails the run), the newest file
alone in `E:\backups\polymarket-follow\db\`; on Sundays a restore test into
`polymarket_follow_restore_<date>`, dropped after (also when it fails); one
line a run in `backup.log`. The stream files have no second copy.

**Commands.** `pnpm verify` (build, lint, test, format check); `node
dist\status.js` in the run copy's folder (every status row, from files
only, never a recording); `node backup.cjs`, `node restore.cjs <dump>
polymarket_follow_restore_<date> [--drop]` in the run copy's folder.

**The REST client** (`api/rest-client.ts`) is one class with an instance per
program: its route table, its share and burst, and a generic User-Agent
(`data-collector/1.0` for the poller, which also opens the WebSocket with
it; no project or personal name, code-rules 2026-11-12). The poller's
instance holds 50 a minute and 30 in 5 s.
