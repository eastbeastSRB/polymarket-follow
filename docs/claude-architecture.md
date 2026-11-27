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

## MARKET-1 (built 2026-11-13 by MARKET-BUILD, its reviews' fixes by MARKET-FIX and MARKET-FIX-2, frozen the same day, tag `market1-freeze-1`; deployed by the owner 2026-11-13 14:33:39Z, its task daily at 10:30Z)

**What it is.** A third entry point of the same package, `dist/market1.js`
(`src/market1.ts`, `src/market1/`), the forward paper test of the liquidation
wave by its rules, `apps/poller/market1/rules.md` (the plan:
`docs/reviews/market-plan-2026-11-13.md` with its review's fixes; decisions
2026-11-13, "MARKET-1's plan approved", and MARKET-BUILD's technical calls).
One deciding line, WAVE (two or more pool accounts liquidated the same way
in small coins within an hour: $1,000 against the forced side, 2 minutes
later, held a day, priced at the recorded book as a taker); the lines beside
deciding nothing (B1–B7, B10, B11, OWN, P, C, S, BASE; J, T, X, R, B8, B9 are
left for a later arm). It never trades and makes no API call: it has no
client. Commands: `daily` (the task's), `look <1|2|3>` (once each); exit codes
0 done, 1 crash, 2 bad settings, 3 lock held, 4 frozen files differ, 5 a look
not due, not ready or already run, or the paper experiment's run still live
after 6 hours. Settings, no defaults: `STATE_DIR`, `MARKET1_ROOT`,
`MARKET1_BACKUP`, `PAPER_ROOT`, `RECORDINGS_ROOT`, `MONGO_URI`, `MONGO_DB`
(`tools\poller.env`); `MARKET1_ROOT` or `MARKET1_BACKUP` equal to or inside
`PAPER_ROOT` or `RECORDINGS_ROOT` is refused (exit 2, one line naming it).

**Its gates** (`gate.ts`). The freeze: `market1/FROZEN.sha256` must list every
file of what runs — `dist/market1.js`, `dist/market1/`, the eleven paper files
it imports or reads with (`dist/paper/` `instants`, `store`, `routes`,
`rulebook`, `market`, `research`, `seed`, `stats`, `loop`, `reader`,
`reparse`), `research/` and `market1/` — each with its hash; else one log line
and exit 4. The sealed data: every reader of the recordings, the rule book
and the paper experiment's files (`inputs.ts`, `recordings.ts`) takes the
gate and refuses first, before opening anything, a read reaching the cut
while it is closed; the gate is open only from a verified freeze (`gateOf`),
and a look's own readiness reads (`state.json`, the market-day listing) take
no gate: they come after that check and the paper run's wait (rules.md M0,
pinned by `test/market1-order.test.ts`). The kit's fingerprint and
lib-exits' hash are checked when the kit loads, after the freeze check (a
difference is a crash, exit 1). The page's freeze date is read from the
list's head line (a list without it stops the run).
`tools/market1-freeze.cjs` writes the list (`--final` on a clean tree:
`market1/FROZEN.sha256`, the freeze, 64 files, `b9e17505…2f1d`, written
2026-11-13T14:29:11Z, tag `market1-freeze-1`; the gate opens only on it;
the last draft `market1/FROZEN.draft.sha256` has the same 64 hashes) and
refuses when one of the eleven paper files differs from the paper
experiment's freeze. A paper fix to one of the eleven stops MARKET-1 until a
re-freeze; to any other paper file it changes nothing here.

**What it reads, read only, after the gate** (`inputs.ts`, `recordings.ts`;
contracts — a change there is checked here):
- the paper experiment's store (`PAPER_ROOT`): only when its run is over (its
  `paper.lock` and `paper-heartbeat.json` by the shared lock's rule, a check a
  minute, 6 hours at most; `run.ts`), `state.json` first, then each pool
  account's `fills\<addr>.json.gz` (rows from the cut below its P), the
  pre-cut panel and the market-days (`panel\`), all by the paper's own
  frozen readers and schemas;
- the collector's recordings (`RECORDINGS_ROOT`): closed days (with
  `manifest.json`); each closed day checked once — every book hour file
  against its manifest, every line through MARKET-1's own frame schema (a day
  with more than 1% and at least 10 failing lines is a gap), the coverage
  events kept; the book lines of the hour before, the hour and the hour after
  each leg's instant; the gaps from every closed day's `coverage.jsonl`;
- the collector's rule book (`rulebook` in `MONGO_DB`) through the paper's
  `readRuleBook`/`parseRuleBook`: tradable, fees, competitions.

**Its files** (`MARKET1_ROOT`, `F:\polymarket-follow\market1\`):
`books\<run date>-<HHMMSS>.jsonl.gz` (each leg's decision, kept once with the
book line it used: later runs and the looks reprice from it), `days\<UTC
date>.json` (each closed recording day's check), `seen.json` (each position's
first-seen run date), `log\<run date>.jsonl` (the format counts first) and
`<run date>-positions.jsonl.gz`, `manifest\<run date>.sha256`,
`looks\L<k>\result.json`, `page\index.html` and `positions.html` (static, no
script, a link to the paper experiment's page; WAVE's headline on complete
weeks only). After each run its own list (`books`, `days`, `log`,
`manifest`, `looks`, `page`, `seen.json`) is copied to `MARKET1_BACKUP`
(`E:\backups\polymarket-follow\market1\`). Its lock, heartbeat and log:
`STATE_DIR\market1.lock`, `market1-heartbeat.json`,
`logs\market1-<UTC date>.log`; its whole-file writes retry a refused rename.

**How it is to run** (prepared, tested on a scratch run root only):
`tools\deploy.ps1 -Program market1` writes `E:\polymarket-follow-run\market1\`
(the build plus `research\` and `market1\`; smoke: exit 2 without settings,
the kit's fingerprint, and the copy's own gate once a list is in it), refused
while its task runs; `tools\register-tasks.ps1 -Market1Only` adds the task
"polymarket-follow market1" alone: node.exe runs `dist\market1.js daily` there
daily at 10:30Z (computed from UTC), S4U, IgnoreNew, 12 h at most, priority 7,
start when available. Neither is done before the freeze and the owner's word.

**The old weeks** (outside `dist`): `scripts/market1-reproduce.ts` with
`test/market1-reproduce.test.ts`, and `test/market1-rehearsal.test.ts` (the
forward run over the old weeks in a FIND-SLOTS slot), both pre-cut data only,
run when `MARKET1_PRECUT` names the paths.

## WAVE-H's data download (built 2026-11-14 by WAVE-H-FETCH, FRESH's range added 2026-11-17 by FRESH-FETCH, COPY-H's funding 2026-11-25 by COPYH-FUNDING; the supervisor starts it)

`tools/waveh-fetch.cjs`, plain Node with the workspace's Zod (loaded from
`apps/poller`'s install by path), part of no frozen program (decisions
2026-11-14, "WAVE-H's download spec", and WAVE-H-FETCH's technical calls;
2026-11-17, FRESH-FETCH's; 2026-11-25, "COPY-H'S PLAN APPROVED", ruling 5):
files of Hyperliquid's archive (AWS's keyless bucket,
`v1.1/hyperliquid/mainnet/`) and settled funding (`POST /info`
`fundingHistory`) into a store on F:. **A run downloads one range:**
- **WAVE-H's** (the default; `--sizing-only` its first session):
  `node_fills/hourly/`, `node_fills_by_block/hourly/` and `asset_ctxs/` from
  2025-05-25 to DATA END, 760 funding windows aligned to the seal, into
  `F:\polymarket-follow-research\WAVE-H\store\`;
- **FRESH's** (`--fresh`): the months after WAVE-H's data, stored unopened
  until a sharpened rule is frozen: `node_fills_by_block` hours from 2026-05-29
  02h and `asset_ctxs` days from 2026-05-29, both before `FRESH_END`
  (2026-11-16T00:00Z), 342 funding windows on the same 20-day grid from DATA
  END, into `F:\polymarket-follow-research\FRESH\store\`;
- **COPY-H's funding** (`--copyh`): no bucket file.
  - One `{"type":"meta"}` read through the gate, kept as `info\meta.json`
    and held to its manifest line's bytes and SHA-256 by every later run, gives
    the coin list: every coin of its universe in its order, the delisted among
    them (names letters and digits only, unique ignoring case, no Windows
    device name).
  - Then each coin's `fundingHistory` on 26 windows of at most 20 days from M0
    (2025-06-30T00:00Z) to `FRESH_END`, split at END_E (2026-05-29T02:00Z):
    17 in E and 9 in S, none holding both. Window by window, into
    `F:\polymarket-follow-research\COPY-H\funding\`.
  - Each reply is Zod-checked for its shape and times only: the coin asked,
    stamped in its window, in time order, at most its hours; `[]` is valid.
    One that fails is dropped, asked once more, then written as bad.
  - Its manifest lines carry `rows`. A run that goes through all its reads
    writes `funding.sha256` (every stored reply's SHA-256 by key, sha256sum's
    format, sorted by key) and logs its own and the manifest's SHA-256.
  - `--max-reads <n>` ends a session (exit 0); every run logs a `session`
    line with its counts.

A store sits in its range's folder (`…\WAVE-H\store`, `…\FRESH\store` or
`…\COPY-H\funding`, checked before anything is written), and one download
runs at a time on the line: a run refuses to start while another range's
store holds a live lock.
In a store: the keys mirrored, `info\fundingHistory\<coin>\<window start
ms>.json`, `manifest.jsonl` (key, bytes, ETag, LastModified, MD5, SHA-256,
fetch time), and its own `fetch\` (the pid file, which is its lock; the stop
file `waveh-fetch.stop`; `rate.txt`; `problems.jsonl`; `log\<UTC date>.jsonl`).
It hashes the bytes as they come and never decodes, parses or reads back a
data file of WAVE-H's or FRESH's; under `--copyh` it reads back `meta.json`
and each reply it has just written, to check it. Every request passes one
gate: the range's guards on prefix, date and body, one at a time, info reads
at least 6 s apart, a 2 MB/s token bucket, no request 02:30–06:00Z and
10:25–11:15Z, the error ladder, the F: floor and the cap, and the watch on the
collector's `heartbeat.json`:
- its time by stat, its content once a minute at most;
- harm pauses 10 minutes and halves the rate (three pauses in an hour stop the
  day); at a pause's end only a reading taken at or after it counts;
- after 30 clean minutes (every second clear on a reading that judged the
  clock and the price audit, no read failed) the rate doubles back, up to the
  run's full rate, kept in `rate.txt` and logged.

`--plan` prints the plan (under `--copyh` it reads `meta` once when the store
has none, and no `fundingHistory`). `tools\waveh-fetch-start.ps1` (`-Fresh`
for FRESH's range and store, `-CopyH` with `-MaxReads` for COPY-H's) starts it
through WMI at idle priority, so it outlives the session (`-Check` says
whether it runs, on its store or another's); the stop file stops it within a
second. `--books <file>` fetches only the book files a
file names (`market_data/<date>/<h>/l2Book/<COIN>.lz4` of the 38 coins and the
range's hours) under the same gate: each needed key's hour folder listed, each
listed key checked as any file into the store's `books.jsonl`, a key its
listing lacks written there as missing; its cap counts its own keys only; it
takes the store's lock, so it never runs beside a download.
Tests: `test/waveh-fetch.test.ts`, no network; its heartbeats are built from
the collector's `Heartbeat` schema, so a change of those fields fails there
(a contract).

## WAVE-H (built by WAVE-H-BUILD 2026-11-14, its reviews' fixes by WAVE-H-FIX 2026-11-16; frozen 2026-11-16, tag `waveh-freeze-1`; its one look run 2026-11-17: NOT SETTLED)

**What it is.** A fourth entry point of the same package, `dist/waveh.js`
(`src/waveh.ts`, `src/waveh/`), MARKET-1's wave tested once on Hyperliquid's
history by its rules, `apps/poller/waveh/rules.md` (H0–H15, M = 147 written
in H5; the plan `docs/reviews/wave-h-plan-2026-11-13.md` with its review's
R1–R10). Run by hand from the repository's build only (no run copy, no task,
no page), at idle priority, with an 8 GB heap (`node
--max-old-space-size=8192`), one run at a time; it makes no network request.
Its commands: `rehearse` and `look`. Settings, no defaults: `WAVEH_STORE`
(the download's store, read only) and `WAVEH_ROOT` (its own files), neither
inside the other. Exit codes (`exitOf`, `run.ts`): 0 done, 1 a crash, 2 bad
settings, 4 frozen files differ (the look), 5 not ready (book files needed,
a store file missing or failing, a hold of the look) or already run. No file
is started in 02:30–06:00Z or 10:25–11:15Z.

**Its modules.** `instants.ts` (SIZING's start 2025-05-25 14h, TEST
2025-08-01 → 2026-05-28, DATA END 2026-05-29 01h; the day and month of an
instant); `keys.ts` (every store key the program builds — fill files, book
files, `asset_ctxs` days, the funding windows by the download's grid,
`FUNDING_STARTS` — and the one parser of a key's date, `keyDate`); `coins.ts`
(`waveh/coins.json`, M3's 38 by Hyperliquid's names); `fills.ts` (the record
schema, a `tid` of any size kept as digits; H4's counted fill in MARKET-1's
`Liq` shape, the asset id as its market); `slices.ts` (address mod M, M's
scan); `positions.ts` (M6 on each entry of a slice, B1's episodes);
`price.ts` (the snapshot at x chosen in one place, the book at x, the tape,
the net at 4.5 bps a leg); `verdict.ts` (MARKET-1's two-way error, z = 2.58,
H12's order); `pass.ts` (one pass over fill files: the counted fills and the
counts printed before any price); `legs.ts` (the layer the rehearsal and the
look share: the run's context, the legs' book files through a shelf that
counts each file's lines and failing lines, the tapes, a position priced);
`market.ts` (the coins' market objects from the `asset_ctxs` days and the
funding windows, with their counts by day and by coin); `rehearse.ts`;
`look.ts`; `report.ts` (H13's lines beside, H14's prints); `run.ts`
(settings, the windows, the shared files' hashes, whole-file writes, the exit
codes); the store's readers: `gate.ts`, `store.ts`, `lz4.ts`, `ctxs.ts`,
`funding.ts`, `books.ts`. Imported from MARKET-1, never copied: `waves`,
`fills`, `book`, `price`, `stats` (`twoWay`, `byDay`), `lines` (`baseOf`,
`blockOf`), `summary` (`summarize`, `tailOf`, `statOf`: M13's prints); the
paper's `instants`, `stats` and `research` (the kit). One function is a copy:
`run.ts`'s `writeWhole` has MARKET-1's behaviour (`market1/run.ts`, F2) so
that no MARKET-1 process file joins the closure.

**Its gates** (`gate.ts`). The freeze: `waveh/FROZEN.sha256` must list every
file of what runs — `dist/waveh.js`, `dist/waveh/`, the closure of MARKET-1's
and the paper's compiled files its imports reach (`CLOSURE`, exactly: a test
walks the imports), `research/`, lz4js's three files and `waveh/` (its
`rules.md`, `coins.json`, `sizing.json` and `data.sha256` required by name).
The seal: every store read takes the gate and refuses first, before anything
is opened, a key dated at or after 2025-08-01 while the gate is closed, and
any key whose date does not parse. The rehearsal runs with the gate closed
whatever the freeze. `dist/log.js` and `dist/schedule.js` are shared,
unfrozen, their hashes logged at each start. `tools/waveh-freeze.cjs` writes
the list (`--final` on a clean tree, with `sizing.json` and `data.sha256`
present) and refuses a closure file that is in neither MARKET-1's nor the
paper experiment's freeze or differs from one; `--data` writes
`waveh/data.sha256` only when the manifest repeats no key and holds, by
prefix, the files the program reads (1,507 + 7,338 fill files, 370
`asset_ctxs` days, 760 funding windows); `test/waveh-freeze.test.ts` checks a
WAVE-H list's lines against both freezes. `waveh/data.sha256` (9,975 files)
and a draft list, `waveh/FROZEN.draft.sha256`, are committed; no final list.

**Its reads** (`store.ts`): a file only when its SHA-256 equals its list's
line — the download's `manifest.jsonl` in the rehearsal, `waveh/data.sha256`
at the look, `books.jsonl` for a book file — and an `.lz4` file only when its
one frame ends at the file's end (lz4js 0.2.0, a devDependency, its three
files' hashes checked before it loads; block checksums refused, which lz4js
misreads). The marks: `asset_ctxs`, the mark at the end of minute [m, m + 1
min) the row with the latest whole-second stamp in (m, m + 1 min], of two
rows of one stamp the first (H10); funding: the stored `fundingHistory`
replies of the download's 20 windows a coin, a row's hour its stamp rounded
(R1); both into the kit's `marketFrom`. Every day and window a run reads is
checked to be in its list before any is read, and a day with more than 1%,
and at least 10, of its 38 coins' rows failing stops the run.

**The rehearsal** (`rehearse`, the gate closed): every SIZING fill file
through one pass; M's scan; slice 0's SIZING positions; the book files their
legs need written to `WAVEH_ROOT\rehearsal\books-needed.txt`, the run
stopping (exit 5) until the store's `books.jsonl` answers each; then the
tapes, the marks and funding, the legs priced, the outcomes sealed in
`rehearsal\sizing-outcomes.jsonl.gz` with their hash; `counts.json`,
`report.json` (with the marks by day and by coin and the book files' lines)
and `sizing.json` (counts and mechanics only).

**The look** (`look`, H15; only once the freeze verifies, else exit 4;
`waveh/data.sha256` as the list). Step 1: every fill file, `asset_ctxs` day
and funding window named in the list, else exit 5 before any is read; the 38
coins' marks and funding read first, with their counts by day and by coin;
every fill file through one pass, M recomputed from SIZING and held to
`waveh/sizing.json`'s; WAVE-H's positions (slice 0's TEST entries) and the
SIZING positions whose exit reaches 2025-07-31 23h (the rehearsal may have
left them); R3's counts, the marks' and funding's, and the positions' SHA-256
to `WAVEH_ROOT\look\step1.json`, their book files to `look\books-needed.txt`;
exit 5. Step 2 (the same command): first, before any store file is read,
every needed book file answered by `books.jsonl` and the sealed SIZING
outcomes (`WAVEH_ROOT\rehearsal\`) held to `sizing.json`'s hash; then step 1
again, held to `step1.json`'s hash, and the sealed outcomes to SIZING's
positions; every leg priced (BASE from TEST's marks); the positions and the
report made, then `look\result.json` written first (the verdict), then
`positions.jsonl.gz` (each leg's book file or tape `tid`s) and `report.json`
(the lines beside on marks, the sets on the net through MARKET-1's
`summarize`, the SIZING line), each whole (flushed, the rename tried again a
second apart, 10 times). A third run refuses (already run); after a failure
between the writes, H15's recovery moves `result.json` aside and runs step 2
again.

**The old weeks** (outside `dist`): `scripts/waveh-reproduce.ts` with
`test/waveh-reproduce.test.ts`, the pre-cut seed converted to Hyperliquid's
shape (R8), run when `WAVEH_PRECUT` names a JSON file of `{seedDir, out?}`.

## The analyzer: the polishing's store (built 2026-11-17/18 by EXTRACT-BUILD and EXTRACT-BUILD-2, its Final review's fixes by EXTRACT-FIX 2026-11-18, the supervisor's two rulings after it by EXTRACT-FIX-2, the archive's two quirks by EXTRACT-FIX-3 and EXTRACT-FIX-4 2026-11-19; run on the 10 months 2026-11-19, every gate passed; frozen with the exam 2026-11-20, tag `polish-freeze-1`)

**What it is.** A fifth entry point of the same package, `dist/polish.js`
(`src/polish.ts`, `src/polish/`): the polishing plan's extraction
(`docs/reviews/wave-polish-plan-2026-11-17.md`, section 4, with its review's
F3, F9 and F18; decisions 2026-11-17, "THE POLISHING PLAN APPROVED", and
2026-11-18, EXTRACT-BUILD's technical calls, EXTRACT-REVIEW's findings and
EXTRACT-FIX's calls). Run by hand from the repository's build, one run at
a time, at idle priority, as `node dist\polish.js <command>` with no heap
flag; it makes no network request. `polish.ts` is a launcher: it runs the
program (`polish/main.ts`) in a worker thread of a 20 GB heap (decisions
2026-11-18, EXTRACT-FIX verified, 1; the start line, a run's first in the
log, names V8's limit, `heapLimitMB`: 20,672 on 2026-11-18), whose pass
gives each of its workers 4 GB; every ceiling is a worker's own, and V8's
`--max-old-space-size` beats them all, so a heap flag on the command line
or in NODE_OPTIONS is refused (exit 2). Its commands: `extract [--workers
n] [--day YYYY-MM-DD]`, `gates`, `explore [--step <name>]` (the
exploration, its own section below). Settings, no defaults:
`WAVEH_STORE` (WAVE-H's raw store, read only; its last two folders
`WAVE-H\store`), `ANALYZER_ROOT` (the range's folder, neither inside the
other) and, for `gates` and an exploration step, `WAVEH_ROOT` (WAVE-H's
rehearsal and look, whose files are the references, read only); each is
sealed (below) before
anything is made, the log's folder included. The commands print nothing
on success: every line goes to the pino log,
`<ANALYZER_ROOT>\logs\polish-<day>.log`, which `log.ts` prunes after 30
days (copy a run's log to keep it); stderr says only why the program
stopped before its log was open. Exit codes (`exitOf`, `run.ts`): 0 done,
1 a crash (a manifest, `gates.json` or `polish/known-unpaired.json` that
does not parse among them: our own files), 2 bad settings or a heap flag,
4 WAVE-H's freeze does not
verify (every command checks it first: WAVE-H's frozen code runs inside),
5 not ready (a file missing, differing or failing; a sealed path, in the
settings or later; a day above 1% failing; a part of other code; a timing
run's store, or a timing run into a root that holds a store; the gates
not all passed), 6 a gate failed. No file or month is started in
02:30–06:00Z or 10:25–11:15Z (WAVE-H's `windowEnd`). Any change to
`dist/polish*` changes the code's fingerprint, and the next `extract`
redoes the pass (decisions 2026-11-18, EXTRACT-REVIEW's findings, Q5).

**`extract`** (`extract.ts`; `range.ts`: WAVE-H's 8,845 fill files, 370
days, 760 funding windows, 13 months, DATA END; `--day` one day, a timing
run whose store is marked partial, refused into a root that holds a
store). The `.tmp` files a crash left under `parts\` and `store\` are
deleted first. Then:
- **the pass** (`pass.ts`, `worker.ts`): every fill file by a pool of worker
  threads (6 by default, each a 4 GB old-generation ceiling), a file at a
  time, held to `waveh/data.sha256` after the seal (`held.ts`, `seal.ts`:
  FRESH's raw store, `ANALYZER\FRESH\` and any key dated after DATA END are
  refused before anything is opened unless the exam's freeze opens the seal
  (the exam, below), and a key dated at or after FRESH_END always, a path
  by its name and then by its real path, a junction followed; a path
  sealed by its name is never resolved); decoded block by block (`lz4.ts`,
  its own xxh32); scanned (`scan.ts`: each line tiled by its records, read
  from their text; a
  record a writer wants parsed and held to WAVE-H's own schema; the counts
  as WAVE-H's pass keeps them, records by hour, each of the 40 coins'
  takers and makers with their earliest time, the (coin, `tid`)s whose
  taker and maker do not pair inside the file, block-number runs,
  stretches of 60 s with no record, the base-tier rate; the scan's own
  counters: records refused, misread, the slow path's lines and records);
  WAVE-H's 1% day rule; one part a file (`part.ts`, `parts\<n>.part`: a
  header naming the input, the code's fingerprint, the counts and the
  file's dictionaries; the column blobs; the payload's SHA-256). A part of
  the same input and code is not redone, so a stopped pass resumes. Its
  summary (the log's "pass done") names the scan's counters over every
  file, and each thread's memory and heap ceiling go into the manifest's
  peaks;
- **two writers** (`writers.ts`): `taker` (the 40 coins' takers, the
  backstop's flagged) and `liq` (every coin's records with a `liquidation`
  object, both legs); PAPER-H's every-trader fills would be a third;
- **the contexts and funding** (`ctxs.ts`): the `asset_ctxs` days into the
  40 coins' ten context columns by H10's minute rule, with WAVE-H's counts;
  the funding windows through WAVE-H's own readers;
- **the merge** (`merge.ts`), by month, all coins at once: the dictionaries
  first (addresses sorted, so an id's order is its address's; liq's coins,
  methods and `dir`s); each coin's takers in H8's order (time, user, `tid`,
  then the file's), a second record of one (time, user, `tid`) dropped, a
  user's two records of one `tid` less than 60 s apart (WAVE-H's tape
  window) refused, 60 s or more apart kept and counted, two users' records
  of one `tid` kept and counted (Hyperliquid's `tid` is not unique:
  decisions 2026-11-19); liq alike, a (user, `tid`) twice in a month
  refused; a coin's month freed once written; each month's log line names
  its rows dropped and its records kept of a shared `tid` by coin.

**The store** (`<ANALYZER_ROOT>\store\`, `store.ts`; read only through the
manifest, every file held to its size and SHA-256):
- `manifest.json`, written last: the range, the inputs and the list's
  SHA-256, the code's fingerprint (`dist/polish`'s files) and WAVE-H's
  freeze, every partition's rows and every file's bytes and SHA-256, the
  counts (the merge's rows in, out and duplicates by table; `tids`, by
  coin-month the records kept of another user's `tid` (`shared`) and of
  their own 60 s or more apart (`sameUserApart`), and `refused`, 0), the
  peaks and each step's seconds;
- `files.jsonl` (each input file's counts, its `unpaired` (coin, `tid`)s
  among them), `dict\users.bin` (20 bytes an address, sorted),
  `dict\names.json`;
- the partitions, a file a column of little-endian values, its type in its
  name (`f64`; `u64` as two `u32` halves, low first; `u32`, `u16`, `u8`,
  `i8`): `tape\<COIN>\<YYYY-MM>\` (the 38 coins' takers: time, px, sz, side,
  flags, user, tid), `liq\<YYYY-MM>\` (17 columns and `file`, the input's
  index), `minute\<COIN>\<YYYY-MM>\` (the 40 coins, row k the minute
  `start + k min`: the ten contexts as of the minute's END, the
  `asset_ctxs` row stamped in (m, m + 1 min]; the nine bars over
  [m, m + 1 min); an empty cell is NaN, a minute without a trade or a
  context without a row), `funding\<COIN>\<YYYY-MM>\` (time, rate); every
  coin-month written, empty ones too. A row is known only once its minute
  has ended: `knownAt` (`legs.ts`) gives a minute column's value known at
  an instant, never the minute the instant is in.

The parts and columns are written whole but not flushed (`writeUnflushed`);
`users.bin`, `names.json`, `files.jsonl` and the manifest through WAVE-H's
`writeWhole`. The parts stay after the merge; the supervisor deletes
`parts\` once the run is accepted (decisions 2026-11-18, EXTRACT-BUILD's
technical calls, Q4).

**`gates`** (`gates.ts` G0–G5 and `runGates`, `days.ts` G6's sample days,
with `counted.ts` and `legs.ts`): G0–G6 into
`<ANALYZER_ROOT>\gates\gates.json`, which names the manifest's SHA-256 and
every reference's (`look\step1.json`, `look\positions.jsonl.gz`,
`waveh/sizing.json`, the raw store's `books.jsonl`, the data list). The raw
store and the look are sealed first. G0: every file whole and every
partition present, the store and the look made from WAVE-H's list, under
its freeze, by this very code (the store's fingerprint the running
code's); no record refused or misread (`files.jsonl`'s sums 0; the slow
path's printed); every row conserved (the parts' taker and liq rows the
merge's in, in = out + duplicates for tape, bars and liq, the tape and liq
partitions' rows their out). The others run only when G0 passes. G1
`step1.json`'s counts field by field (the counted fills H4 and their parts
H1 from liq and its `file` column; the block gaps replayed from the runs);
G2 M's scan against `sizing.json`, slice 0's positions by `step1.json`'s
SHA-256 and counts, the entries of all 147 slices (176,986); G3 WAVE-H's
`priceSpot` on its positions and SIZING's (the tape from the store, the
books from the raw store) against `positions.jsonl.gz` line by line, its
bps to the plan's 1e-9, the largest difference printed; G4 that no priced
instant needed the minute price's fallback (the kit's mark, else the last
non-backstop trade in the 5 minutes before the minute's end): where WAVE-H
has a mark the minute price is it, by construction, and an instant without
one fails unless the fallback gives none too; G5 each of the 40 coins'
taker records paired with its maker by `tid` in its file, a trade a file
boundary splits as one taker and one maker in two files next in the
range's order (`straddled`; the two 2025-07-27 08h files, 1506 and 1507,
are next to each other), one record left alone in the range's first or
last file, whose other half is in the hour outside the range, counted
apart and every one listed (`edge`, `edges`; decisions 2026-11-18,
EXTRACT-FIX verified, 2), the rest exactly the one-sided trades of
Hyperliquid's archive that `apps/poller/polish/known-unpaired.json` lists,
each on its side (`known`; the list read before G0; decisions 2026-11-19,
EXTRACT-FIX-4), any other record unpaired or a listed one not found
failing, listed by file, coin and `tid`, `day_ntl_vlm`'s ratios by coin and
day printed beside; G6
fifteen sample days (2025-05-31, 06-01, 06-15, 07-27, 08-15, 09-15, 10-10,
11-15, 12-15, 2026-01-15, 02-15, 03-15, 04-15, 05-28 and 05-29, the hour
before DATA END) re-read by WAVE-H's own readers (an hour either side, its
own reviver keeping `tid` and `oid` as digits) and compared cell by cell
with the store: the 38 coins' tape (rows, Σ `tid`, Σ px·sz), every liq row
in all 18 columns, the 40 coins' nine bars and ten contexts minute by
minute, and the minute price's fallback as the tape gives it. The store is
trusted only when each of G0–G6 passed.

**`explore`** (`explore.ts`): opens only a whole store whose `gates.json`
names its manifest and has each of G0–G6 passed, loads its counted fills
and prints the store's identity and counts; alone it is a frame, writing
nothing but its log; `explore --step <name>` runs one step of the
exploration (below). **The library** the exploration imports is
`library.ts` (`Library`, `libraryOf`, `positionsOf`, `GatesFile`), apart
from the gates, with `legs.ts` (`Tape`, `minutePrice`, `minuteColumn`,
`knownAt`).

**What it imports, never changing it:** the compiled closure of
`dist/polish/main.js` is 78 files (2026-11-20, with the exam's): its
own 21, the exploration's 14 (`polish/tries/`) and the exam's 10
(`polish/exam/`); WAVE-H's frozen
`books`, `coins`, `ctxs`, `fills`, `funding`, `gate`, `instants`, `keys`,
`legs`, `look`, `lz4`, `market`, `pass`, `positions`, `price`, `rehearse`,
`report`, `run`, `slices`, `store` and `verdict`; MARKET-1's `book`,
`fills`, `lines`, `price`, `stats`, `summary` and `waves`; the paper
experiment's `instants`, `research` and `stats`; `schedule` and `log`.
Beside them the launcher `dist/polish.js` and the pass's
`dist/polish/worker.js`, started by path, and the kit, which
`paper/research` loads by path (12 named files). The exam's freeze list
carries the closure (the exam, below). Node modules: `node:crypto`, `fs`,
`module`, `os`, `path`, `url`, `util`, `v8`, `worker_threads` and `zlib`,
`pino` and `zod`. A test walks the three frozen programs' imports: none
reaches `dist/polish`.

## The exploration (built 2026-11-18 by POLISH-EXPLORE, POLISH-EXPLORE-2 and POLISH-EXPLORE-3, its positions files as streams by EXPLORE-FIX-1 2026-11-19; its five steps ran 2026-11-19)

**What it is.** `node dist\polish.js explore --step <name>`: the polishing
plan's step 6 (`docs/reviews/wave-polish-plan-2026-11-17.md`, sections 1
and 2, with its review's F1–F19), as POLISH-EXPLORE's plan, approved
(decisions 2026-11-18, "POLISH-EXPLORE's plan approved" and "the
exploration built"). Five steps, each a run of its own, in order:
`features`, `e`, `choice`, `c`, `beside`; between `features` and `e` the
supervisor commits `explore\cuts.json` as `apps/poller/polish/cuts.json`.
The code is `src/polish/tries/` (under the code's fingerprint), imported by
no extraction module; it changes no frozen module. `main.ts` changes only
in its explore branch: `--step` once, WAVEH_ROOT required and sealed for a
step. The try log is `apps/poller/polish/tries.md` (35 tries, nine
families, each try's definition, cut, instant, seeded mark and venue).

**The modules.**
- `parts.ts`: E = entries with t in [2025-06-01, 2025-12-29T22:00Z), C =
  [2026-01-01, 2026-05-26T23:00Z) (50 h before each part's end); every
  slice's entries for any M (MARKET-1's `waveEntries` over `bySlice`); a
  position for any delay and hold; each counted fill's B1 episode.
- `prices.ts`: a coin's minute price column from the minute table alone
  (the mark, else a mark at most 5 minutes old, else the bars' last trade
  of the 5 minutes before the minute's end, else NaN; no kit market object,
  which refuses panels past 2026-11-07); `priceAt` (a decision's price: the
  minute ended by the instant, through `knownAt`); `priceAfter` (an
  outcome's: the end of the leg's minute); BASE for any hold.
- `forced.ts`: every coin's forced fills from `liq` by H4 and
  `countedFrom`'s file bounds; the 38 coins' px, sz and markPx, held to
  the counted fills fill for fill.
- `data.ts`: the one shape every computation reads (`Data`), from the
  trusted store or a world in memory; `levelsAt`, H8's tape at a leg as
  walk levels; `checkPrices`.
- `trylog.ts`, `features.ts`: the 35 tries as data; every filter's feature
  at its pinned instant, never reading a record stamped after it; the nine
  E cuts by the kit's quantile (type 7); `CutsFile`, `cuts.json`'s schema.
- `sweep.ts`: every distinct leg of a step read once, by coin and instant,
  `pace` before each coin-month; the net by H9's formulas at H8's tape
  ($1,000 in, Q out, 4.5 bps a leg, funding at the minute price before
  each hour); the gross on marks.
- `gzlines.ts`: the steps' positions files written and read as streams
  (chunks of 2^20 characters through one gzip stream to `.tmp`, then
  renamed; read 64 KiB at a time, line by line), never one string, which
  V8 caps (decisions 2026-11-19, the E step stopped while writing).
- `rules.ts`: a rule (B0 with M doubled, a delay, a hold, X1's exit,
  filters) placed on a part; X1's and X2's exits; its items re-based by b;
  its statistic and D-test.
- `stats.ts`, `choice.ts`: the statistic (MARKET-1's `twoWay`), the D-test
  by influences, the floors (E +50, 40 days, 15 coins; C +25, 30, 15), the
  gain floor, the 100-day footprint; the choice rule (adopted at t ≥ 2.5
  with the floors, one change a family, three families at most; on C at
  most two evaluations, N, then the largest-t change alone, passing at
  t ≥ 1.0).
- `beside.ts`, `books.ts`: the prints beside (below).
- `steps.ts`: the five steps, their identity, refusals and files;
  `CUTS_FILE`, the committed cuts' path.

**Each step** opens only the trusted store and names its identity first:
the store's manifest SHA-256, `gates.json`'s, the code that made the store
and the code that gated it (equal, else exit 5), this program's
fingerprint, the look's `step1.json` and `positions.jsonl.gz` as
`gates.json` names them, and B0's M (`step1.json`'s: 147). A predecessor's
output missing, or of another identity, this program's fingerprint
included, is not ready (exit 5): the five run with no code change between
them. Every output goes to `<ANALYZER_ROOT>\explore\`, written whole, with
each phase's seconds and the process's sizes (`peaks`, MB).
- **`features`** (no outcome): the forced fills held to the counted fills
  and every price column to legs.ts `minutePrice` (exit 6 otherwise); B0's
  E entries, every filter's feature and the nine cuts; the dry sweep of the
  legs the entries alone fix (counts, nothing walked). Writes
  `features.json`, then `cuts.json` naming its SHA-256.
- **`e`**: `polish/cuts.json` held to `features.json` (its SHA-256 and its
  cuts, else exit 5). First the reproduction: B0 over TEST on marks must
  equal the look's EVERY SLICE line (176,986 positions,
  +66.13311166059404 ± 31.30967357566865), n exactly, m and SE to 1e-9 bps
  (exit 6). Then the features recomputed and their cuts held to
  `cuts.json`'s (exit 6); every group's legs in one sweep; the calibration
  (slice 0's E positions the look priced at the book at both ends,
  repriced at the tape; b = the mean of tape net − book net; every net on
  E and C re-based to x − b when b > +10 bps); B0 and the 35 tries with
  their D-tests against B0 (k = SE_V ÷ SE_B0), floors and refusals; X2
  printed. Writes `e-positions.jsonl.gz`, then `e.json`.
- **`choice`**: the changes adopted on E; N, B0 with them together, placed
  and priced on E, its numbers testing nothing (F5), its k for C. Nothing
  adopted: N is B0, nothing priced. Writes `choice-positions.jsonl.gz`,
  then `choice.json`.
- **`c`**: `choice.json` must name the current `e.json`. B0 on C first,
  deciding nothing; then at most two evaluations, each priced only when its
  turn comes: N; if it fails and more than one change was adopted, the
  adopted change with the largest t on E alone; else B0 goes. Each: the
  D-test with k from E, F2's floors and the footprint (every 100-day window
  of C's 146 entry days with 20 UTC days and 10 coins). Writes
  `c-positions.jsonl.gz`, then `c.json` naming the rule going to FRESH.
- **`beside`**: `c.json` must name the current `choice.json`, and it the
  current `e.json`. From the steps' positions files, for the rule going to
  FRESH with B0 beside, deciding nothing but K and the exam's z (frozen for
  the exam): 6.1's lines on E and C (each month, each side, without the two
  best days, a day or a coin out, the tail, BTC's and ETH's moves, the
  event-level mean, OWN); K, the smallest of 1, 5, 10, 20, 50 and M slices
  whose pooled error is within 3% of all slices'; the book footprint at K;
  the placebo (each B1 episode's sign flipped, 10,000 draws a window of 100
  and 182 days, seed 20,261,118, for the rule, B0 and B2) and the exam's
  z = max(2.81, the rule's 99.75th percentile at 100 days); the
  projection; the signal meter; the error rates; the calibration on C.
  Then **the two book prints** (`books.ts`), the only reads of **WAVE-H's
  raw store** in the exploration: `books.jsonl`, held to the SHA-256
  `gates.json` names (exit 5), and slice 0's held book files, each through
  WAVE-H's own code (the leg's hour file and, in its first 10 s, the hour
  before's; the last snapshot at or before the leg, live within 10 s and
  usable), through the gate and the list's SHA-256, sealed after DATA END,
  `pace` before each file. On slice 0's B0 positions of E and of C:
  - the tape against the book: the entry legs at t + 10 s, 2, 5 and 15
    minutes and the exit at 2 minutes, the tape's gain for the follower
    over the book a leg in bps of the book's price, with its two-way error
    and the legs not compared by reason ("not held": an hour on no line of
    the book list);
  - the walks: each entry book at x_in walked for $1,000, $10,000 and
    $50,000, the cost against the book's mid and the extra over $1,000,
    the walks depth short counted.

  Writes `beside.json` (the book prints as its `books`).

Exit codes as the analyzer's: 0 done, 1 a crash, 2 bad settings (an
unknown or second step, `--step` on another command, a step without
WAVEH_ROOT) or a heap flag, 4 WAVE-H's freeze, 5 not ready, 6 a check
failed (the forced fills against the counted ones, a price column against
`minutePrice`, the reproduction, the E cuts against `cuts.json`). The
tests: `test/polish-tries-*.test.ts`, on worlds in memory with known
answers (`polish-tries-world.ts`: 16 coins, a wave every 2 days, a planted
edge after forced sells), synthetic stores and synthetic lz4 books; the
five steps end to end on the gates world (`polish-gates.test.ts`).

## The exam (built 2026-11-19/20 by POLISH-RULES and its successors 2–5, its rules reviewed by POLISH-RULES-REVIEW and fixed 2026-11-20, its code reviewed by POLISH-CODE-REVIEW and fixed by POLISH-FIX 2026-11-20; every marked option filled by the owner; frozen 2026-11-20, tag `polish-freeze-1`; look 1 run on FRESH 2026-11-24/25: WITHHELD)

**What it is.** `node dist\polish.js exam --step placebo | reproduce | 1 | 2`:
the polishing's one exam on FRESH (the plan's section 3; decisions
2026-11-19, POLISH-RULES's plan and its questions ruled, the owner's 715
cut with the safety net, the placebo and WITHHELD projection ran; decisions
2026-11-20, the reproduction's first run). THE PLAN, whose D-, T- and
Q-numbers the code cites, is `docs/reviews/polish-rules-plan-2026-11-19.md`
(T10–T12: rules.md's head). Its rules are
`apps/poller/polish/rules.md` (P0–P17), final, every marked option filled
by the owner (P16; decisions 2026-11-20 `04b6b13`: WITHHELD's days without
books cut, B; Q4's excess over BASE); the looks are two (look 1
on FRESH's 100 deciding days, look 2 about 2027-02-08, a later build under
its own freeze whose terms P1 fixes). The code is `src/polish/exam/`, under
the code's fingerprint, imported by no extraction module. Settings, no
defaults: `ANALYZER_ROOT` (the ten months' folder: the trusted store,
`gates\`, `explore\`; read only) and `EXAM_ROOT` (the exam's own folder,
`ANALYZER\FRESH` at look 1), neither inside the other; for `reproduce`
`WAVEH_STORE` (`…\WAVE-H\store`) and `WAVEH_ROOT`; for steps 1 and 2
`FRESH_STORE` (`…\FRESH\store`); each read only, outside `EXAM_ROOT`. Each
step names its identity first (the program's fingerprint, WAVE-H's freeze,
the trusted store's manifest and gates, every exploration file it reads),
each held to the SHA-256 `design.ts` names, else exit 5.

**The seal's opening** (`exam/gate.ts`; rules.md P0): FRESH's raw store,
`ANALYZER\FRESH` and every key dated after DATA END stay sealed
(`seal.ts`) unless `polish/FROZEN.sha256` lists every file of what runs
with its SHA-256 (`dist/polish.js`, `dist/polish/`, the 31 compiled files
of WAVE-H, MARKET-1 and the paper experiment the program reaches, each
equal to its own freeze, `research/`, lz4js's three files, `polish/`,
WAVE-H's data list, coins and sizing) and holds exactly one line `# tag
polish-freeze-<n>` whose git tag holds this very list, byte for byte; a
git that cannot run (not on the PATH, or timed out) is named as such, and
the seal stays closed. A key dated at or after FRESH_END is refused, open
or closed. Every exam step runs under the seal the freeze gives, the
reproduction too (look 1's is into `ANALYZER\FRESH\repro`). Steps 1 and 2
stop before anything is opened when the exam's freeze does not verify
(exit 4). `dist/schedule.js` and `dist/log.js` stay shared and unfrozen,
their hashes in each start's log line.

**The modules.**
- `design.ts`: every number the rules fix, one home (K = 20, M = 147, the
  recipe's cuts 715 deciding, 336 N's and 1,391 beside, the safety net's 20
  days and 10 coins, the two segments, the days without books and their
  listing's date (`NO_BOOK_LISTING`), F7's 59 thin `asset_ctxs` days, δ =
  +50, WITHHELD's 10%, TOO FEW's 20 and 10, the placebo's seed and draws,
  the textbook floors, `BARS` (z and z_L of each
  of the two looks, from `placebo.json`), `OPTIONS` (the owner's two, as
  filled: cut and BASE), the exploration files' SHA-256s); `EXAM_DESIGN`, what
  the steps hold their inputs to (the explored files, the recipe, the
  safety net, the draws, `placebo.json`), a test's world passing its own;
  `test/polish-rules.test.ts` holds rules.md's P17 to it row by row.
- `fresh.ts`: FRESH's integrity (G0's `wholeOf` and G5's `pairingOf` on
  FRESH's files; a record alone only in FRESH's first or last file;
  `polish/fresh-unpaired.json`, empty); `inExam` (entries from 2026-05-30
  closing before FRESH_END); `whereOf` (segment 1 or 2, cut by option B
  for a leg on a day without books, or the discovery window); `holesOf`
  and `leftOutOf` (60 s without a record of any coin, in the hour up to t
  or a leg's minute); `safetyNet` (the 715 line's positions not left out,
  at the design's floors).
- `look.ts`: the four lines (715, N, 1391, B0), placed by the
  exploration's `place` with `inExam`, each position with where it stands
  and why it is left out; `onDeciding` (slices 0–19 in a segment); `keyOf`
  (step 2's map key: slice, instant, coin); F7's days; step 1's counts,
  none an outcome (the counted fills and other liquidation legs by month,
  kind and method among them; each line's positions on the deciding days;
  the deciding line's 5% tripwire, `tripwire`: of, left out, funding
  without a price, their share).
- `placebo.ts`: the placebo gate (N's E lines held to B0's at W4 ≥ 336; the
  three cuts recomputed by the kit's type-7 quantile; N at K = 147 equal to
  `beside.json`'s to the bit; both flips on the 715 line from E alone and
  on N over E ∪ C; z and z_L a look; F13's projections; the TOO FEW and
  safety-net shares of every window).
- `price.ts`: the book first (WAVE-H's book code through `bookReader`, a key
  on no line of the book list stopping with books needed), else the
  store's tape, else unpriced; H9's net with the minute price in the kit's
  place (no kit market object); `examBase`, BASE over the two segments'
  whole minutes pooled at 24 hours.
- `verdict.ts`: `decidedOf` (step 2's deciding position: its net, depth
  short, both legs at the book, HOLDS's excess by the option); the verdict
  in its order (WITHHELD, TOO FEW TO TELL, DOES NOT HOLD, HOLDS, LIKELY,
  NOT SETTLED) with its sentence; `examVerdict` (F14 as MARKET-1's M11:
  only HOLDS or DOES NOT HOLD end the exam before its last look).
- `repro.ts`: the reproduction's three comparisons ((c) holds the look's
  WAVE-H lines equal in number to the positions); `lines.ts`: the prints
  beside; `steps.ts`: the four steps (`reproExtraction`: (a) under the
  step's seal; `reproEnd`: `repro.json`'s `passed` and exit 6).

Changed outside `exam/`, each pinned by a test: `seal.ts` (the opening;
FRESH_END), the readers that take the seal (`held.ts`, `store.ts`,
`extract.ts`, `pass.ts`, `ctxs.ts`, `tries/books.ts`); `range.ts`
`FRESH_RANGE` (4,102 fill files, 170 `asset_ctxs` days, 9 funding windows a
coin, before FRESH_END); `counted.ts` and `tries/forced.ts` bounded by the
store's own end; `ctxs.ts` (a FRESH day failing WAVE-H's 1%, or whose
header lacks a column, read as absent and listed); `gates.ts` (`wholeOf`,
`pairingOf`, `byDayOf`, `topTakerOf` on any range's files, G0's and G5's
output unchanged); `tries/rules.ts` (`place` takes a test of the instant);
`tries/beside.ts` (`placeboOf`'s day flips and 97.5th and 98.75th
percentiles; `ownOf`); `run.ts` (the settings, exits 4 and 7).

**The steps** (rules.md P15), one at a time, at idle priority, outside
02:30–06:00Z and 10:25–11:15Z, no build, test or other heavy run on the
machine during the look's:

| Step | When | Writes (in `EXAM_ROOT`) |
|---|---|---|
| `placebo` | before the freeze | `placebo.json` |
| `reproduce` | before FRESH opens; again at look 1 by the frozen program | `repro\` (the ten months extracted again), `repro.json` |
| `1` | the seal open, `repro.json` passed by this very program | `parts\`, `store\` (FRESH's store), `twin\` (its second build), `look1\builds.json`, `integrity.json`, `books-needed.txt`, `step1.json` (naming the books file by SHA-256); then exit 5, books needed |
| the books | after step 1, its counts read (rules.md P15's 5% tripwire, `counts.tripwire.share`) | `node tools\waveh-fetch.cjs --fresh --books <EXAM_ROOT>\look1\books-needed.txt --store <FRESH_STORE> --heartbeat <the collector's heartbeat>` |
| `2` | `step1.json` this program's under this freeze; `builds.json`, `integrity.json` and `books-needed.txt` held to its SHA-256s; every needed book answered | `look1\result.json` (written before anything about an outcome is logged), then `positions.jsonl.gz`, `report.json` |

`placebo.json` (`c25345f7…`) is copied into EXAM_ROOT before the
reproduction and step 2, which hold it to its SHA-256.

Exit codes: 0 done; 1 a crash; 2 bad settings or a heap flag; 4 WAVE-H's
freeze, or for steps 1–2 the exam's, does not verify; 5 not ready (sealed,
a file missing or differing, `repro.json` not passed, books needed, already
run); 6 a check failed (the reproduction, FRESH's integrity, a held
number); 7 FRESH's two builds differ.

**The freeze tool** (`tools/polish-freeze.cjs`): the draft
`polish/FROZEN.draft.sha256` (no tag line), `--final --tag <n>` the freeze
`polish/FROZEN.sha256` (a clean tree holding `rules.md`, `fresh.sha256` and
`fresh-unpaired.json`; the line `# tag polish-freeze-<n>`, 1 when not
given), each from a build made there, every closure file equal to its own
freeze or nothing written; `--look2 <look 1's tag>` (look 2's freeze,
rules.md P1) refuses a list that differs from that tag's outside
`LOOK2_ALLOWED` (six compiled files, two added data lists,
`fresh-unpaired.json`), a file changed, added or gone; `--data` writes
`polish/fresh.sha256` (FRESH's 4,614 files, from its manifest's names,
bytes and SHA-256s alone, the range's keys each once) and prints F7's thin
days (under half the median bytes of WAVE-H's 370), writing nothing unless
they are `design.ts`'s. Option B's days (`NO_BOOK_DAYS`) are written at the
freeze from the archive's latest listing (`waveh-fetch.cjs --fresh --plan
--books <keys> --store … --heartbeat …`, metadata only; rules.md P2): the
listing of 2026-11-13, the refresh of 2026-11-20 finding 2026-11-13 → 15
with books.

**Its runs so far:** the placebo (2026-11-19,
`ANALYZER\POLISH-RULES\placebo.json`, `c25345f7…`); the WITHHELD projection (`withheld.json`, `8e8249d7…`);
`--data` (2026-11-20, `polish/fresh.sha256`, `17de22e5…`); the
reproduction's first run (2026-11-20: (b) and (c) exact, (a) one file of
8,846 read differently, a one-off fault in memory; decisions 2026-11-20),
and its second (06:00–07:34Z: every part passed, decisions 2026-11-20).
The tests:
`test/polish-exam-*.test.ts` (the freeze in a temporary git repository;
FRESH worlds of a few days, `polish-exam-world.ts`; the prints beside,
`polish-exam-lines`), `polish-freeze.test.ts`, `polish-rules.test.ts`; a
breaks round of 314 deliberate breaks and the fix round's 13 (decisions
2026-11-20, the exam built up to rules ready). A rehearsal of `main.ts`'s
reproduce → 1 → 2 on a synthetic world, in a scratch repository whose
design and ranges are patched to it and whose synthetic list a tag holds,
passed (2026-11-20, POLISH-FIX; its scripts outside the repository,
decisions 2026-11-20, the code review's fix round).

## COPY-H (parts 1–2 built 2026-11-25 by COPYH-STORE and COPYH-STORE-2: the store, its readers, seals and gate; part 3, the engine, built 2026-11-26/27 by COPYH-ENGINE to COPYH-ENGINE-10 and reviewed twice; E counted, its store built for the rehearsal from 2026-11-26; the rehearsal and the freeze to come; not frozen; no copy of a real month priced)

**What it is.** A sixth entry point of the same package, `dist/copyh.js`
(`src/copyh.ts`, `src/copyh/`): COPY-H's rules, `apps/poller/copyh/rules.md`
(C0–C18, `f29289e`), the plan `docs/reviews/copy-h-plan-2026-11-25.md`
section 7 parts 1–2. Run by hand from the repository's build, one command
at a time, at idle priority, as `node dist\copyh.js <command>` with no heap
flag; it makes no network request. `copyh.ts` is a launcher: it runs the
program (`copyh/main.ts`) in a worker thread whose old-generation ceiling
is `design.ts`'s `WORKER_HEAP_GB` (8 GB, measured below), the same for
every pass worker; `COPYH_HEAP_GB` raises it for a later step when a
decisions entry names it (a whole number above `WORKER_HEAP_GB`, at most
`WORKER_HEAP_CAP_GB` 20; else exit 2), and a heap flag on the command line
or in NODE_OPTIONS is refused (exit 2). Settings (`run.ts` `Settings`), no
defaults, each held to its folder's name and outside the others but the
funding store inside COPYH_ROOT: `COPYH_ROOT` (`…\COPY-H`, written),
`WAVEH_STORE` (`…\WAVE-H\store`), `COPYH_FUNDING` (`…\COPY-H\funding`,
COPYH-FUNDING's, never written), `FRESH_STORE` (`…\FRESH\store`, step 2),
`FRESH2_STORE` (`…\FRESH-2\store`, FRESH-2's stage), `PAPER_SEED` (the
paper's `…\seed`, the reproduction). Every line goes to the pino log
`<COPYH_ROOT>\logs\copyh-<day>.log` (its start line: node, the code's
fingerprint, the shared files' hashes, the heap); stderr says only why the
program stopped before its log was open. Exit codes (`run.ts` `exitOf`): 0
done, 1 a crash, 2 bad settings, options (one given twice among them) or
heap, 3 not finished (the
run's minutes, 14 or `--minutes`, are spent or a closed window began: run
it again; every heavy command resumes from whole parts), 4 the freeze does
not verify, 5 not ready (sealed; a file missing, differing or failing; a
day over the failure limit; a `dir` or coin outside its list; a record
twice; a taker out of time order across files; a store built), 6 a check
failed, 7 two builds differ. No part starts in 02:30–06:00Z or
10:25–11:15Z. Every number the rules fix is in `design.ts`, held to C18 by
`test/copyh-rules.test.ts` both ways.

**Commands before the freeze** (each under the closed seal):
- `reproduce` (C15 (a)): `reproduce.ts`, the reproduction: the paper's
  seed (PAPER_SEED, each file held to `experiment/seed.sha256`) converted
  record for record and run through COPY-H's mapping and the kit, every
  value held to the kit's own reading of the seed (each entry under its id
  and its ordinal among the account's entries of that id, in the kit's
  order: the kit's id holds no direction, so two entries may share one;
  those ids listed, a known id of two refused); its `reproduce` gives
  `<COPYH_ROOT>\repro.json`'s body, written whole after its identity
  (the program's fingerprint, the kit's, lib-exits', the seed manifest's
  and `copyh/known.json`'s SHA-256); exit 6 unless it passed. A cap still
  unset reads none there (the seed's accounts lie far below either).
- `rehearse [--workers n] [--minutes m]` (C15 (c)): `rehearse.ts`, the
  rehearsal on real months, counts only, by the program to be frozen, on
  E's store (`<COPYH_ROOT>\E\store`, built, twinned and checked by the
  tools) in `<COPYH_ROOT>\E\rehearsal\`; it needs COPYH_FUNDING. Its
  refusals, each exit 5: a second rehearsal, a cap unset, E's store or its
  twin not built, its integrity not passed for both. The engine's phases
  before any price in `E\rehearsal\engine` (LABELS to REMOVAL, then
  TRIPWIRE: MAIN's set under both settlement marks, no stop); its two
  checks (`phase-check.ts`), as parts: KIT, the kit alone on the built
  account with the most exit rows under EXITS_MAX (one child at the heap
  cap when BUILD-L built it; the freeze waits when a run of it passes one
  part's minutes or half its child's heap), and the label bound's check,
  LABELCHECK and LABELCHECK-L, on the eight buckets 0 mod 32 at the four
  check Mondays (each account's label and MAIN's conditions from C5's
  90-day capture and from the whole capture from ARCHIVE_START, every
  difference listed; it passes at a Monday when MAIN's differences number
  under 1% of the accounts meeting MAIN under the whole capture); the
  calibration (C13, C15 (c) 11; `phase-calibration.ts`), as parts:
  CALIBRATION-MARKS, a part an E sample day (C18), and CALIBRATION-BOOKS, a
  part a day WAVE-H's store holds books for (its `books.jsonl`), into
  `E\rehearsal\calibration.json` (`calibrationJson`, its identity first),
  for the supervisor to commit as `copyh/calibration.json`; the values
  its counts set before the freeze (C9's mark: 60 minutes when the 5-minute
  projection is above 0.5%, the freeze waiting while the mark set's is above
  1%; C15's worker heap: twice the largest peak measured, an engine part's,
  a store build's thread's or its own, rounded up to a whole GB); in memory,
  while the run's budget less `FORTNIGHT_MINUTES` allows, the fortnight
  priced at the mark set, then the counts; then `rehearsal.json`
  (`rehearsalJson`), its identity first, for the supervisor to commit as
  `copyh/rehearsal.json`: E's store's record (this build's store closure,
  the manifest without its run fields, the builder's code beside them), the
  fortnight, the caps' base (0.77 and 1.18 KB a fill, half the 20 GB lane),
  the values, the prints (the ids met twice, the entries of size 0, the
  largest merged order event, ruled before the freeze above 100,000) and the
  counts (C15 (c) 1–9: the step's counts, the tripwire's two
  projections, the lines' memberships by Monday, the copies a week by line
  with MAIN's legs by kind, the sizes of the priced phases from BUILD
  (each part's bytes; by coin its copies by line and their lines' bytes:
  COPYH-ENGINE-REVIEW-2 Q2), the survival curve of MAIN's voted copies by
  whole hour with its open share, MAIN's long share by day, each coin's
  first Settlement with its market trades and MAIN's entries after it, the
  exit rows above EXITS_MAX and of the ten largest under it with KIT's
  counts and runs, the caps' counts by Monday (the captures and histories
  past the normal lanes' thresholds and above the caps, with their fills,
  the large lane's labels and the P1 Mondays), the label bound's check,
  E's integrity's K1 and K3). No file of priced copies is written.
- `coins`: `<COPYH_ROOT>\coins.json` from COPYH-FUNDING's stored `meta`
  reply (`info/meta.json`), held to its one line in the funding store's
  `manifest.jsonl`, in the reply's `universe` order (iid = index, delisted
  kept with its flag, `szDecimals` kept), for the supervisor to commit as
  `copyh/coins.json` (append-only: `coins.ts` `checkAppendOnly`).
- `count --range burnin|E`: the pass in counting mode (each file's scan a
  small JSON under `<range>\counts\`, resumed from whole files of the same
  input, code and lists; without `copyh/dirs.json` every `dir` counts as a
  trade's; a `dir` or coin outside the lists counted, never a stop), then
  `<range>\counts.json`: the records by class, every `dir` value exactly as
  written with its count (from which `copyh/dirs.json` is ruled), the
  takers by `dir` and method, the values outside the lists, the coins, the
  vault accounts, the records by day, the holes.
- `build --range burnin|E [--twin] [--workers n]`: the pass and the merge
  into `<range>\store\` (`--twin`: `<range>\twin\store\` from its own
  parts) from `copyh/data.sha256`, `coins.json` and `dirs.json`; a built
  store is refused.
- `integrity --range burnin|E`: the twin (when built) and K0–K3, below.
- The bodies of `build` and `integrity` are `stores.ts`'s (`buildStore`,
  `checkStores`), each in the folder and under the seal its caller gives:
  a tool's `<COPYH_ROOT>\<range>`, step 1's `look1` and `look1\twin`.
- `step1 [--workers n] [--minutes m] [--past-tripwire]`: the gate first
  (exit 4, nothing read), then `steps.ts`'s step 1 (below); it needs
  COPYH_FUNDING. `tries --round n [--minutes m]` and `choice [--minutes
  m]`: the gate first, then a round of the owner's tries or the choice
  (`rounds.ts`, `choice.ts`, below). `step2 [--workers n] [--minutes m]
  [--past-tripwire]`: the gate first, then `steps.ts`'s step 2 (below); it
  needs FRESH_STORE and COPYH_FUNDING, FRESH's store read only after the
  gate opens it. `fresh2 [--workers n] [--minutes m] [--past-tripwire]`:
  the gate first, then `steps.ts`'s FRESH-2 stage (below); it needs
  FRESH2_STORE and COPYH_FUNDING, FRESH-2's store read only after the gate
  opens it.

The ranges (`range.ts`): `burnin` WAVE-H's 850 files before M₀ (counts and
timing only), `E` WAVE-H's 8,845 files [ARCHIVE_START, END_E), `S` FRESH's
4,102 files [END_E, END_S), sealed until step 2 (`<COPYH_ROOT>\S` and
FRESH's store refused by name and real path), `FRESH-2` FRESH-2's 4,368
files [END_S, END_F2), held to `copyh/fresh2.sha256` (the others to
`copyh/data.sha256`), its raw store `FRESH2_STORE`, sealed until FRESH-2's
freeze (`<COPYH_ROOT>\FRESH-2` and its keys). A range's files are
`stores.ts`'s `rangeFiles`: E's and S's every key of the range (one the
list lacks stops, exit 5), FRESH-2's the keys its list holds, in order,
their indices consecutive, so that an hour the archive still lacks is a
hole (C14 (1), RH1 (g); the engine review's M2, fixed outside
`range.ts`). The integrity re-reads design.ts's sample days of its range:
E's for E and the burn-in (which
holds three of them), S's for S, the 15th of each of FRESH-2's months for
FRESH-2. Each store keeps the records of its own files timed in its own
window; one outside is counted, never kept (D7).

**The boundary and the pass** (`scan.ts`, `schema.ts`, `pass.ts`,
`worker.ts`, `part.ts`, `writers.ts`, `market-trades.ts`). A file is read
past the seals (its key's date, its path by name then real path, inside
the run's roots) and held to its SHA-256 in `copyh/data.sha256`; decoded
block by block by the analyzer's `dist/polish/lz4.js`; each record tiled
from the text; builder-dex (`dex:COIN`) and spot (`@n`, `A/B`) records
counted by their coin's form and never parsed; a main-dex-shaped record cut
of `closedPnl`, `fee` and `builderFee` before `JSON.parse` (`cutText`; a
text the cut cannot settle goes to the slow path's reviver, which drops
them at any depth), then held to Zod (`sz` and `startPosition` of at most
15 significant digits, ids above 2^53 as digits); a record that fails is
counted, and a UTC day with more than 1% and at least 10 failing stops
(exit 5). Each kept record goes to its account's bucket group (the
address's last two hex digits; 16 buckets a group); each trade's two
records, paired by (coin, `tid`, `time`), take the taker's market reading
(not "backstop", not "Auto-Deleveraging", "Settlement" or "Net Child
Vaults"); the bars from the market takers in time order (trades, Σ sz,
Σ px·sz, the latest price, opposite-side pairs within 2 s, the left-out
takers by cause, the Settlement records' Σ sz and Σ px·sz). One part a
file (`COPYHPT1`: a JSON header, the stretches each held to its SHA-256),
written whole by a pool of worker threads (3 by default), resumed from
whole parts of the same input, code and lists.

**The merge and the store** (`merge.ts`, `store.ts`). The trades split
across two files next to each other are paired (the maker takes its
taker's reading), the bars' pairs across files added, a file whose first
market taker of a coin is timed before the previous file's last stops
(exit 5); the dictionaries (every address sorted, the `dir` values and
methods); then the units, each written whole with its record, resumed: the
fills by (month, bucket group), or bucket by bucket above `UNIT_ROWS`
(12,000,000 rows, measured below; a bucket above it runs whole, measured
at 48 million rows: a ceiling that decides nothing), rows by
(account, `time`), ties in the pass's order; a record found in both of the
switch hour's files kept once and counted, a market taker twice there or
any other record met twice a stop; the bars by month; `files.jsonl` (each
input's counts); `manifest.json` last. Tables: `fills\<bucket>\<YYYY-MM>\`
(`user` the dictionary's index, `time`, `iid`, `px`, `sz`, `side`,
`startPosition`, `oid` and `tid` as u64, `flags` (taker, own/other/unnamed
liquidation, backstop, market), `dir`, `method`, `file`) and
`bars\<iid>\<YYYY-MM>\` (row k the minute `start + k`: `trades`, `sz`,
`ntl`, `last`, `pairGap`, `pairs`, `leftBackstop`, `leftAdl`,
`leftSettlement`, `leftVault`, `settleSz`, `settleNtl`). Chain heads are
computed when an account is read (`chains.ts`, `normalize.ts`: the kit's
`normFill` fields; a matching event's taker fills chained, each maker fill
its own event, as the paper's order events: cut E); the holes from each file's records' first and last
time by minute (`holes.ts`, exact for the union of files).

**The integrity** (`integrity.ts`, `twin.ts`, `reread.ts`, `digest.ts`), in
units of whole partitions of at most `UNIT_BYTES` (2 GB), each record
written whole and resumed: the twin's manifest equal to the first's but
for the run's fields, every file of the second read back and held to its
line (`builds.json`; exit 7); K0 every file read whole and held to the
manifest, each partition's files and sizes, the inputs and code, each
input's classes, every kept record conserved file by file; K1 no odd
trade, every unpaired record in the range's first or last file or in
`copyh/unpaired.json`; K2 C18's sample days (`sampleDaysOf` in `range.ts`:
S's for S, E's for E and the burn-in, which holds 3 of them) re-read by
`reread.ts`, which shares no code with the pass (lz4js through
`dist/waveh/lz4.js`, a whole-line `JSON.parse` with its own reviver and
checks, a blank line one failed record as the pass reads it, the switch
hour's repeats left out of its rows by its own code as the store leaves
them, the day's files with one file either side), each sample file's rows
held to the store's by
a digest of every cell (SHA-256 a row, added lane by lane), its classes to
the pass's, and the day's bars minute by minute; K3 printed: the holes,
the records by day, the matching events with more than one chain. Written
whole to `<range>\integrity\integrity.json`; a K0–K2 failure is exit 6.

**Seals and gate** (`seal.ts`, `gate.ts`; C0). Always refused: a key whose
date does not parse, anything at or after END_F2, an `ANALYZER` folder, a
path outside the run's roots (by name, then by real path). Until step 2:
FRESH's store, `COPY-H\S`, anything at or after END_E. Until FRESH-2's
freeze: a `FRESH-2` folder and anything at or after END_S. A step's
engine folder (`look1\engine`, `look2\engine`, `fresh2\engine`), to every
reader but that step's own engine, whose seal names it (Q7). Nothing is
written in `COPY-H\funding`. A reader of rows checks each instant
(`checkInstant`). The gate (`verifyGate`): `copyh/FROZEN.sha256` lists every
file of what runs (the program, the closure of other programs' compiled
files its imports reach — D14's list, the engine's `dist/paper/copy.js` and
`stats.js` among them, and the calibration's WAVE-H book reader
(`dist/waveh/books.js`) with what it reaches, `dist/market1/book.js`,
`dist/waveh/fills.js`, `store.js` and `gate.js` — the kit, lz4js's three
files and `copyh/`), its one
tag holds this very list, the kit's `checkKit()` and lib-exits' hash pass,
and the list is of the command's kind by what it holds (RM2: step 1 a list
without `look1.sha256`; the rounds the same with `tries.json` beside it;
step 2 one with `look1.sha256` and `choice.json` and no `fresh2.sha256`;
FRESH-2's stage one with `fresh2.sha256`, `funding2.sha256` and
`look2.sha256`). `sealOf` opens S for step 2 and FRESH-2's stage, and
FRESH-2 for its stage, only on a freeze verified for that very command.

**The lists** (`copyh/`, committed): `rules.md`; `data.sha256` (`tools/
copyh-freeze.cjs --data`: E's 8,845 and S's 4,102 files from the frozen
lists' names and hashes, no data file opened); `coins.json` (the `coins`
command); `dirs.json` (ruled from `count`'s values); `unpaired.json` (ruled
from the rehearsal); `funding.sha256` (`--data --funding <COPYH_FUNDING>`:
the meta reply and every window of every coin, each held to the funding
store's list and manifest and read by `funding.ts`, C9's reader: the
reply's shape, rows of the file's coin, the nominal hour the time rounded
to the nearest hour, no coin's hour twice, no rate used). **The freeze lists** (`copyh/FROZEN.sha256`, the same
tool, one core): every file of what runs (the gate's `frozenFiles`) with
its SHA-256 by path, after a head naming the list, its written time and
commit, the toolchain, the lockfile and `# tag copyh-freeze-<n>`, n the
next free number; each refuses a tree that is not clean and writes nothing
when it refuses. `--final`, the first list: rules.md without a marker
(C17), the program built anew, every `COPYH_FILES` file present and no
later list's file, the closure and lz4js files held to the four freezes
(RL12), the store closure equal to the record. The later lists'
`--rounds` and `--fresh2` come next. Pinned by `test/copyh-freeze.test.ts`
on made-up git repositories, the gate opening on the list once tagged.
`copyh/rehearsal.json` also records
E's store as built before the freeze: the store closure's hashes
(`closure.ts`: the compiled graph of its entry points, `design.js` by the
store values it exports), the manifest without its run fields and every
file's SHA-256. `--final` refuses a candidate whose store closure differs;
step 1's first build is held byte for byte to that record, and when equal
it is step 1's twin (A'). After E is built, no file of the store closure
nor `schedule.ts` changes without the supervisor.

**The engine** (part 3; `step1` reaches it after the gate). The kit and lib-exits
run unchanged, loaded by `dist/paper/research.js`; END and the stage window
are parameters, so one code serves step 1, step 2, FRESH-2's stage, the
rehearsal's fortnight and the tests' worlds. A module a rule:
- `instants.ts` (C1): an instant's stage, its Monday M, its UTC day, week
  and month; each stage's Mondays (48 in E, 24 in S, 26 in FRESH-2).
- `accounts.ts` (C2, C3's reader): a bucket's accounts across the step's
  stores, in address order, joined by address; the window's partitions held
  as columns, an account's rows made on demand as `normalize.ts`'s `Row`
  with its trade's market reading; the vault accounts of a reading.
- `entries.ts` (C4): an account's history as the kit builds it (events,
  cycles, entries over 60 s, liquidation keys, chain breaks); `exitRows`
  counts the exits `buildEntries` would append; an account above
  `HISTORY_FILLS_MAX` or `EXITS_MAX` is not run through the kit and named.
- `labels.ts` (C5): the 90-day capture and the kit's `labelAt`, a capture
  above `LABEL_FILLS_MAX` never P1; P1; the habits at M.
- `markets.ts` (C6, C9): a coin's bars joined minute by minute across the
  stores to END; its end (its first Settlement's minute end, else END) and
  the Settlement price; the primary rule; the VWAP and last-price objects,
  the kit's `marketFrom` step for step with the reading's END as its cut and
  C9's settlement mark (5 or 60 minutes) a parameter, the Settlement minute
  at the Settlement price, every funding row by its nominal hour; thin legs.
- `setting.ts` (C9, C13): c(coin, d) from day d − 1's pairs, with its two
  fallbacks; the taker's setting, the cascade print's and Binance's.
- `money.ts` (C8): a copy's plan, `dist/paper/copy.js`'s
  `planCopyThrough` to END or to its coin's end (a part still open there
  `settled`, at the Settlement price), its price in bps by lib-exits'
  `priceCopy`, and STOP's search end.
- `unpriced.ts` (C11): a reading's holes from every file's minutes across
  its stores (a gap that straddles two stores is one); the gap copy, a
  chain break inside its exits or a hole meeting [t, its last exit].
- `judge.ts` (C10): d, the kit's `dAgainstNull` at 24 h in bps (a null
  long share "no long share"); a line's removal at M, its members'
  market trades' records in the week of M cut at END, through the kit's
  `removalOf` and read back by coin at every minute that holds one (a
  table a part can keep); the vote by END; x′, d less the copy's own
  cost over the same 24 h (the kit's `leg` with C9's setting), null
  exactly when d is.
- `lines.ts` (C7): R7's account-level conditions at M (MAIN, TEN, BROAD,
  DAY) from the label, the habits and the caller's coverage, none for an
  account the kit is not run on; an entry's lines in a primary market
  only; MAIN's copies at another delay or on other marks (DELAY0 and LAST
  on the minute's last price, DELAY+5 and DELAY+15 on C9's marks); RANK's
  top fifth at M; SLICES, the address's number mod 4.
- `verdict.ts` (C12): C12's forms on a set (m and SE by
  `dist/paper/stats.js`'s `twoWay` over the priced copies; m′ over those
  with a d, SE′ the larger of the errors by day and by week; the three
  sign conditions' means), MAIN's reading at a look's z with its
  sentences written in advance and R12's line, and "after the verdict".
- `tripwire.ts` (C16): from a coin's bars, its funding rows' hours and
  the copies' plans alone, each copy's reason to be unpriced as
  `priceCopy` will find it, leg by leg (a minute holds a mark exactly when
  it lies in the object's minutes with a market trade of a size above 0,
  or is its coin's Settlement minute); the counts beside; the projected
  share and the stop above 1% unless `--past-tripwire`.
- `engine.ts`, `engine-worker.ts` (C15, the engine's guard): a phase's
  parts, each computed twice, copy a by a pool of forked children at the
  heap given, then copy b by a new pool, so that a part's two copies never
  share a process; held byte-equal, the phase closed by its record (each
  part's header and bytes by SHA-256), else exit 7 and no record. A part's
  file is its header line (phase, id, inputs) and its bytes, whole or as
  chunks, written through one file descriptor a gigabyte a write at most
  (Node refuses a write of 2 GiB, which a PRICES part can pass), flushed,
  then renamed, so that a part in place is whole on disk; a part or a
  record of other inputs is refused (exit 5); the budget's stop is exit 3,
  resumed from whole parts; each copy's run (pid, seconds, peak RSS, heap)
  beside it. A large lane's phase is the same runner, one child at the heap
  cap. A closed part's lines are read a chunk at a time (`partLines`),
  the file opened for each chunk, so that many parts are read side by side.
- `phase-labels.ts` (C5, C2; the two lanes): LABELS, a part an account
  bucket and a block of 8 Mondays, each store's manifest and dirs.json held
  to the part's inputs: each account's capture counted first from the
  columns (none in the 14 days, above LABEL_FILLS_MAX, past the normal
  lane's threshold deferred), else the kit's label; the vault accounts
  named and never labelled; LABELS-L, the deferred captures one at a time
  at the heap cap; P1 from both, which no lane changes.
- `phase-build.ts` (C2, C4–C8, C10's members, C11): BUILD, a part an
  account bucket: its P1 accounts' histories (above HISTORY_FILLS_MAX or
  EXITS_MAX named, past the lane's threshold deferred to BUILD-L), their
  habits and lines at their P1 Mondays, each entry in a line and a primary
  market a copy (id, D, exits, plan, vote, gap, C14's covariates but the
  prior mean net), and their market trades' keys in the weeks where they
  are in a line, the lines a mask; counted beside, the ids two entries
  share (both copies, the kit's order breaking a tie), the entries of
  direction 0 and the most fills of one order event the kit merged into an
  entry group (its `buildEntries` spreads them into a call: the
  rehearsal's print, above 100,000 ruled before the freeze), and by coin
  the entries of MAIN's accounts after the coin's first Settlement (RL11),
  and the ten built accounts with the most exit rows (C15 (c) 5);
  its bytes an index line, then the facts, each coin's copies
  a JSON line each and its keys in chunks, read a coin at a time (and
  sized by the index alone, `partSizesOf`, the rehearsal's print).
- `phase-removal.ts` (C10): REMOVAL, a part a coin: its keys from every
  BUILD and BUILD-L part (each part held to its record once a process,
  `heldPart`, then its coin's lines read by the index), a Monday at a time
  and by line by the mask, each group through the kit's `removalOf`
  (judge.ts), read back: the coin's removal tables for PRICES.
- `phase-coin.ts` (C9, C16): a coin's reading for TRIPWIRE and PRICES:
  its bars across the reading's stores (`coinOf`) and its funding rows from
  the windows `copyh/funding.sha256` lists for it that start before END,
  each file held to its line and read through the seal, rows at or after
  END dropped.
- `ctxs.ts` (C13's mark half): COPY-H's reader of an `asset_ctxs` day
  file (its own, as WAVE-H's reads no impact price: the supervisor's
  ruling, 2026-11-27): a minute's `mark_px`, `impact_bid_px` and
  `impact_ask_px` from the row of the latest stamp in (m, m + 1 min], the
  first line on a tie, as WAVE-H reads its marks; a failed row counted, a
  row at or after the bound unused.
- `phase-calibration.ts` (C13, C15 (c) 11): the calibration on
  outcome-free cells, two prices of one moment only. CALIBRATION-MARKS, a
  part an E sample day: the day file held to its line in
  `waveh/data.sha256` and decoded by `dist/waveh/lz4.js`; at every whole
  minute where the tape (the minute's market trades' VWAP, `readBars` from
  the day's partition) and the day's row both give a value, the tape
  against `mark_px`, against the impact mid, and the impact half-width, in
  bps. CALIBRATION-BOOKS, a part a day with book files: at each hour start
  each coin's last snapshot at or before it in the hour files WAVE-H reads
  (`lastAtOrBefore` on `bookHours`, each file held to its `books.jsonl`
  line), its half-spread and its $1,000 walk from each side (MARKET-1's
  `walkOpen`) against C9's c of that day. The prints by coin and in all:
  each value's cells, median, quartiles and mean with its SE. Pinned by
  `test/copyh-calibration.test.ts` (a cell pairs a minute's tape with that
  minute's row alone, never two instants).
- `phase-check.ts` (C15 (c) 5 and 7): the rehearsal's checks. KIT, one
  part: an account's fills to END through the kit's history, as BUILD's,
  its bytes the history's counts. LABELCHECK, a part a bucket and a
  Monday: each account but the vault accounts, past the 14 days' check,
  labelled from C5's 90-day capture and from the whole capture from
  ARCHIVE_START, MAIN's account-level conditions under each (the habits
  from its fills before M, `labels.ts` `habitsBefore`); a whole capture
  above LABEL_FILLS_MAX counted apart, one past the normal lane's
  threshold deferred to LABELCHECK-L, one child at the heap cap. Pinned
  where the bound binds by `test/copyh-phase-check.test.ts` (a store past
  90 days, a cycle opened 100 days before M).
- `phase-tripwire.ts` (C16): TRIPWIRE, before any price, a part a coin:
  MAIN's copies voted by END from BUILD and BUILD-L, projected on the
  coin's marks and funding hours under both settlement rules (a coin
  without bars: no mark); beside it each try's set given (at step 2 each
  chosen try's set on S: its line's copies voted by END with t in its
  window, every condition met but those on the prior mean net, a price,
  which the projection leaves out and names); the parts summed
  (`tripwireOf`) into each set's projection.
- `phase-prices.ts` (C7–C11, C13): PRICES, a part a coin, its two market
  objects and settings held one coin at a time: each copy's money (the
  taker setting on the VWAP object), its thin flag, d and x′ in each of its
  lines with that line's removal at M; a MAIN copy's own lines (STOP2 and
  STOP5, DAYS7, JUMP's J, DELAY0, DELAY+5, DELAY+15, LAST) and the
  cascade's and Binance's prints; a coin without an object, every reading
  its reason; one positions line a copy (its Zod schema `Position`), by id
  across BUILD and BUILD-L, a tie of ids in the kit's order, priced one at
  a time and given in chunks of about 1 MB, never held whole.
- `phase-rank.ts` (C7, C14): RANK, one part: MAIN's accounts at each
  Monday from BUILD's and BUILD-L's members, every priced MAIN copy of
  PRICES' parts streamed; RANK's accounts at each Monday (`rankAt`) and each
  trader's prior mean net at each Monday where it has a copy (its priced
  MAIN copies wholly before M; none without one).
- `phase-result.ts` (C12, C14, C15): RESULT, one part: PRICES' parts merged
  by entry id (`positionsInOrder`; a part out of order refused), each
  position's line of `positions.jsonl.gz` (`positionLine`: the copy with
  its prior mean net and RANK's membership) hashed uncompressed as it
  comes, never one string; MAIN's copies voted by END the look's set:
  `statisticOf`, MAIN's reading at the look's z, "after the verdict"; its
  bytes two lines, what `result.json` holds of the outcome, then the
  look's prints for `report.json`.
- `prints.ts` (C13): the prints of a look's voted copies, deciding nothing
  and with no verdict word: R14's list on MAIN's set (the paper's look's
  forms; the smallest edge visible at look 2 at look 1), every line's C12
  figures (TEN, BROAD, DAY on their own x′; STOP2, STOP5, DAYS7 on their own
  net with MAIN's x′; JUMP above and at most 3 and without J; the moved
  lines; RANK), SIDES, MONTHS and SLICES, the venues, H1's prints,
  concentration, the settled and thin copies, MAIN without its gap copies
  (C11) and the cascade print. The
  step's counts (the tripwire's, the accounts left out, the stores') are set
  beside them by the step.
- `steps.ts` (C15, C0's identity, C13's counts, C16's stop): step 1 in
  `<COPYH_ROOT>\look1\`. Its refusals in C15's order, each exit 5: its
  `result.json` (a second step 1), the rehearsal's store
  (`<COPYH_ROOT>\E\store\manifest.json`, sealed), `repro.json` not of
  this program or not passed, a value set before the freeze unset (the
  two caps, the settlement mark). E's store held to a second build (A'):
  `look1\store`, its manifest but for the run's fields held to E's record
  in `copyh/rehearsal.json` (its `store`, that manifest); equal, the
  rehearsal's build is its twin; else `look1\twin\store` is built and the
  two compared (exit 7); both comparisons in `look1\builds.json`. Then
  the integrity (`look1\integrity\`), the engine's phases in
  `look1\engine` (`runEngine`: LABELS, LABELS-L, BUILD, BUILD-L, REMOVAL,
  TRIPWIRE and C16's stop when any set projected is above 1% (exit 6;
  `tripwireStop` names each) unless `--past-tripwire`,
  PRICES, RANK, RESULT; END, the stage, the Mondays and the lanes'
  thresholds its parameters, the thresholds 3,500,000 capture fills and
  2,500,000 history fills at every heap, so that a step resumed under a
  raised `COPYH_HEAP_GB` keeps its closed phases; a large lane, and
  RESULT, which keeps every voted copy's readings, one child at the heap
  cap), the
  step's counts (`stepCounts`: the labels by Monday, the vault accounts,
  BUILD's facts, the tripwire's projection, C3's counts, the holes, the
  left-out takers by cause and month, each phase's runs: its parts and
  seconds, its slowest part and its peak's), and the writes
  (`writeLook`): the positions file gzipped to a temp in the engine
  folder, its lines held to RESULT's hash (exit 6), `result.json` (its
  identity first, naming both hashes), the file renamed into place, then
  `report.json` (RESULT's prints, `copyh/calibration.json` held to the
  SHA-256 the identity names, and the counts); then the logs copied to
  `look1\logs\` (`copyLogs`). Every output's identity (`identityOf`): the
  program, the freeze, the kit, lib-exits, `copyh/`'s seven lists and the
  step's files by SHA-256, the shared files, the heap, Node. The
  rehearsal's priced fortnight (`fortnightOf`, C15 (c) 10), the
  rehearsal's and step 1's: the copies with t in [2025-06-30, 2025-07-14),
  END its end, the unpriced phases as parts (`unpricedPhases`, the head of
  `runEngine`), then each coin's positions and RANK in the parent, in
  memory, no file of priced copies written; its output the SHA-256 of the
  lines `positions.jsonl.gz` would hold, by entry id, their count, the
  copies by line, the legs by kind and its pricing's seconds; the pricing,
  no part, starts only while the run's budget less `FORTNIGHT_MINUTES` (5)
  allows (C15: a run ends inside 15). Step 1 runs it on its own store in
  `look1\engine\fortnight` and prints it beside `copyh/rehearsal.json`'s
  (its `fortnight`), and whether they are equal, deciding nothing.
- `tries.ts` (C14): a try's form, `copyh/tries.json` (each try its line,
  MAIN or BROAD, its conditions on C14's covariates by name, one of `>=`,
  `>`, `<=`, `<`, `=` and `one of`, and why; at most 3 rounds of 8, 6 and 4
  tries), and the set it reads of a positions line.
- `rounds.ts` (C14's explore): `tries --round n` on step 1's positions
  file, held to its `result.json`, and `copyh/tries.json`'s round n;
  refused (exit 5) unless committed as it is (git: the file equal to
  HEAD's), a round written or before its predecessor's output, an earlier
  round changed, or step 1 unfinished; the round one part computed twice
  in `<COPYH_ROOT>\rounds\engine\round-<n>\`: each try's set its line's
  copies voted by END_E meeting every condition (a condition on a
  covariate the copy lacks is false), its figures C12's forms, the weeks,
  m − 2.99·SE and m′ − 2.99·SE′ and the mean without the two best days;
  `rounds\round-<n>.json`, its identity first.
- `choice.ts` (C14's choice): `choice` from the round files alone, each
  held to its SHA-256: a try qualifies when m − 2.99·SE and m′ − 2.99·SE′
  are above 0, the mean of its traders' own means and its mean without its
  two best days are above 0, and its priced copies hold 100 traders and
  100 UTC days; at most two go on, by the highest m − 2.99·SE (ties: the
  earlier round, then the earlier try); one part computed twice;
  `rounds\choice.json`, its identity first, the chosen tries whole for
  step 2; a second choice refused (exit 5).
- `steps.ts`, step 2 (C15) in `<COPYH_ROOT>\look2\`: its refusals in
  C15's order, each exit 5: its `result.json`, `repro.json` not this
  program's, an unset value, step 1's three files not those
  `copyh/look1.sha256` lists (sha256sum's form, names relative to
  `look1`), E's store (its manifest, `builds.json`, the integrity) not
  that step 1's `result.json` names, no `copyh/choice.json`. S's store
  built twice (`look2\store`, `look2\twin\store`; no record, so the twin
  always), its integrity, `look2\builds.json`; step 1 recomputed by this
  program in `look2\engine\look1` past its tripwire and its positions held
  to step 1's (exit 6); the engine on E ∪ S at END_S in `look2\engine`
  (E's and S's 72 Mondays, look 2, after look 1's verdict; C16 on look 2's
  set and each chosen try's set on S); CONFIRM; the writes (`result.json`
  with the confirmations, `report.json` with MAIN on S alone and the
  calibration); the logs.
- `phase-confirm.ts` (C14's confirmation, C13's MAIN on S alone):
  CONFIRM, one part after RANK at step 2, computed twice: of the positions
  with t in S, each chosen try's set (its line's copies voted by END,
  every condition met, the prior mean net's among them), its statistic
  and reading (`confirm.ts`), and the prints of S's voted copies.
- `confirm.ts` (C14's confirmation on S): s = min(m ÷ SE, m′ ÷ SE′), none
  without an error; Holm's order by s (a try with no s second, equal s in
  the choice's order), the first tested at 2.24, the second at 1.96 only
  when the first's s exceeded 2.24; each try's reading, the first that
  holds (WITHHELD, no s, not tested, CONFIRMED with C12's three sign
  conditions, NOT CONFIRMED), its sentences written in advance.
- `fresh2.ts` (C14's sealed judgment): a set's reading on FRESH-2 at z (a
  try's 1.96, MAIN's KEEP 1.645): WITHHELD, no error, CONFIRMED (both
  lower bounds above 0 and the three sign conditions), NOT CONFIRMED;
  `fresh2Report`, MAIN's prints in FRESH-2's form (no cascade print, no
  null mean gross, the day and month prints named "COPY-H's copies by UTC
  day" and "... by UTC month", every other print taken by name).
- `steps.ts`, FRESH-2's stage (C14 (4)) in `<COPYH_ROOT>\fresh2\`: its
  refusals, each exit 5: its `result.json`, `repro.json` not this
  program's, an unset value, step 2's three files not those
  `copyh/look2.sha256` lists, step 1's `result.json` not the one step 2's
  names, E's or S's store not those steps 1 and 2 name, the chosen tries
  not step 2's confirmations, and no yes to confirm (MAIN's verdict, the
  first KEEP or DROP of its looks, no KEEP and no try confirmed on S:
  FRESH-2 is then never read). FRESH-2's store built twice
  (`fresh2\store`, `fresh2\twin\store`), its integrity; one funding list
  composed of `copyh/funding.sha256` and `copyh/funding2.sha256` in
  `fresh2\engine` (both lists' windows in the one funding store); the
  engine on E ∪ S ∪ FRESH-2 at END_F2 on the 98 Mondays with no look
  (`pricedPhases`, the engine through RANK: C16 on the judged sets alone,
  no RESULT); SEALED; the writes (`result.json` with each judged set's
  reading, `report.json` with MAIN's prints when MAIN is judged); the
  logs.
- `phase-sealed.ts` (C14's sealed judgment): SEALED, FRESH-2's stage's one
  part after RANK, in RESULT's place, computed twice: every position's
  line hashed as RESULT hashes it; of those with t in FRESH-2, each judged
  set (MAIN's at a KEEP at 1.645, each try confirmed on S at 1.96: its
  line's copies voted by END, every condition met), its statistic and
  sealed reading; MAIN's prints in FRESH-2's form when MAIN is judged; a
  try's set its statistic and reading only (the supervisor's ruling,
  2026-11-27).

The caps are `design.ts`'s, provisional until the rehearsal: a label
capture of more than 13,000,000 fills and a history of more than 8,500,000
are not run through the kit, so that an account at a cap fits within half
of the 20 GB large lane (the kit's measured 0.77 and 1.18 KB a fill). The
large lanes, LABELS-L and BUILD-L (above), are where the accounts above
the normal lanes' thresholds run, after the normal parts, one child at the
heap cap.

**Measured** (2026-11-25, COPYH-STORE-2, synthetic hours only: 5.8–6 million
records, 2.5 GB decoded, a 14 MB line; each thread's heap polled every 100
ms): a pass worker 1,899 MB of heap with 400,000 accounts in its file and
2,525 MB with 2.6 million (the process 3.6 and 4.2 GB, about 150 s a file);
the merge of a 12-million-row unit with 2,967,257 accounts 1,765 MB (3.8
GB); an integrity unit holding an 11.6-million-row partition 346 MB (1.3
GB); the re-read of a day of three such files 652 MB (4.3 GB, 279 s).
`WORKER_HEAP_GB` = 8, three times the largest, rounded up (D10); three pass
workers at their measured peaks sum to about 12.5 GB of the PC's 31.9 GB,
and the merge and the integrity run alone. The measurement found that
Buffer.indexOf gives a wrong, negative offset for a match past 2^31 bytes
(Node 24.13): the re-reader finds lines a 256 MB window at a time
(`eachLine`); the pass decodes block by block. The scripts and results are
in the supervisor's folder, `workers\COPYH-STORE-2\measure\`.
