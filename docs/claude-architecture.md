# Architecture — what the system IS

This file describes the system as it exists, and only that — no plans, no
history. Every build that changes the shape updates it in the same commit.
What is planned: the plan page. Why: decisions.

## The collector (C1), live since 2026-11-10 (parts 0–6, 2026-11-11)

**What it is.** One Node 24 program, the poller (`apps/poller`, TypeScript,
the only package of a pnpm workspace), that records Polymarket Perps' public
data for later study and never trades: public GET `/v1/info/` routes and the
public WebSocket only, inside a share of 50 weighted tokens a minute and 15
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
  for the owner's re-run): `backup.cjs` daily at 05:20Z, the time computed
  from UTC as the paper task's is.
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
instance holds 50 a minute and 15 in 5 s, the experiment's 120 and 15:
together the operating budget's 30 in 5 s (decisions 2026-11-12, the two
fresh reviews (7)).

## The paper experiment (built and frozen 2026-11-12, `paper-freeze-1`, decisions 2026-11-12, the freeze; deployed by the owner 2026-11-12 20:25:42Z, its task registered, the first run started 20:26:43Z)

**What it is.** A second entry point of the same package, `dist/paper.js`
(`src/paper.ts`, `src/paper/`), that reads the pool's fills and every primary
market's minute data back from the public API once a day and recomputes every
paper copy from 2026-11-07 by the frozen rules, `apps/poller/experiment/rules.md`
(the plan: `docs/reviews/paper-plan-2026-11-12.md` with its review's fixes).
It never trades. Commands: `daily` (the task's), `look <1|2|3>` (once each),
`reparse "<decisions entry>"`; exit codes 0 done or paused, 1 crash, 2 bad
settings, 3 lock held, 4 frozen files differ, 5 look not due or not ready.

**Frozen code.** `apps/poller/research/`: RESEARCH-KIT's kit (34 files,
fingerprint `2d3667b5…09aa`) and FIND-6-EXITS's `lib-exits.mjs` (`612d5836…6330`),
byte for byte (`-text` in `.gitattributes`, out of Prettier and ESLint), loaded
by path and typed in `src/paper/research.ts`; `checkKit()` at every load.
`apps/poller/experiment/`: `rules.md`, `seed.sha256` (the seed's manifest),
`favourites.txt` (written at the freeze: `from <F0>` and ≤ 20 addresses,
read lower-case; checked by the freeze tool: its form, F0 between the cut and
the freeze, no holdout account — a run refuses a holdout favourite too; since
2026-11-12 F0 2026-11-12T20:19:43Z and PAPER-FAV's 20),
`FROZEN.sha256` (the freeze: 61 files, `d04d3cd8…f31c`, tag `paper-freeze-1`;
the gate opens only on it) and `FROZEN.draft.sha256` (the last draft).
`tools/paper-freeze.cjs` builds `dist/paper` afresh and writes the list of
what runs (`--final` refuses a tree that is not clean) (`dist/paper.js`,
`dist/paper/`, `research/`, `experiment/`) with the toolchain in its head.

**The blind gate** (`gate.ts`): a request whose window reaches the cut is
refused unless `experiment/FROZEN.sha256` lists every file of what runs, each
with its hash; a run without it writes one log line and stops (exit 4).

**Its reads** (`reader.ts`, `loop.ts`; its own client: `fills`, `mark-history`,
`klines`, `funding`, 120 a minute and 15 in 5 s, `data-reader/1.0`, ids kept
as their digits): one weekly loop — the week's list (P1 at its Monday, open
copies, favourites) uncapped (safety cap 50 pages a day), the rest of the pool
when its week is over (10 pages an account-week), then the week's
market-days; P moves only when a read finished, the state saved after each
account; the night pause ends a run cleanly; the schema alarm (> 1% rejected
rows, ≥ 10) moves no P.

**Its files** (`PAPER_ROOT`, `F:\polymarket-follow\paper\`; `store.ts`):
`state.json` (each account's P, first read, holes), `seed\` (1,602 accounts'
fills before the cut, written once, manifest), `panel-precut\` (the kit's 92
pinned panel files), `fills\<addr>.json.gz` (each account's rows read since the
cut, rewritten whole), `panel\<iid>\<UTC date>.json.gz` (a market-day, written
once), `raw\<UTC date>\rest-HH.jsonl(.br)` (every reply, the collector's
Recorder: the record), `cache\mondays.json.gz` (labels and habits by account
and Monday), `log\<run date>.jsonl` and `<run date>-positions.jsonl.gz`,
`manifest\<run date>.sha256`, `page\index.html` and `positions.html` (the
static page, no script but a staleness note; its verdict box the latest
look's MAIN verdict and sentence; written after the day's record),
`looks\L<k>\result.json` (the five lines, MAIN's verdict alone, and the
lines beside),
`checks\` (the build's live checks and rehearsal). After each run what cannot
be read again is copied to `PAPER_BACKUP` (`E:\backups\polymarket-follow\paper\`).
Its lock, heartbeat and log: `STATE_DIR\paper.lock`, `paper-heartbeat.json`,
`logs\paper-<UTC date>.log`.

**What it reads from the collector** (a contract: a change there is checked
here): the `rulebook` collection of `polymarket_follow`, read only —
`instruments`/`list` and `instrument`/<id> (close-only, settlement, absence),
`fees`/`schedule` (the base-tier taker rate by category), `splits`/`events`
(each event's numeric `instrument_id` alone read: R6's split days),
`competitions`/`list` and `competition_markets`/<id>; before its first
record (2026-11-11T15:47Z) the kit's `rulebook.json` is the rule book, and a
primary market's fee category missing from a recorded schedule is an alarm.
The seed was built once by `scripts/paper-seed.ts` (outside `dist`).

**How it is to run** (prepared, tested on a scratch run root only):
`tools\deploy.ps1 -Program paper` writes its own run copy,
`E:\polymarket-follow-run\paper\` (the build plus `research\` and
`experiment\`; smoke: exit 2 without settings, the copy's `checkKit()`, and,
once a freeze list is in it, the copy's own gate — a difference keeps the old
copy),
refused while its task runs; `tools\register-tasks.ps1` adds the task
"polymarket-follow paper": node.exe runs `dist\paper.js daily` there daily at
04:00Z (computed from UTC), S4U, IgnoreNew, 36 h at most, priority 7, start
when available; `-PaperOnly` registers that task alone, the collector's three
untouched. Neither is done before the freeze and the owner's word.
