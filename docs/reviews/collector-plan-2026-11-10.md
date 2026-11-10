# COLLECTOR-PLAN — the collector (C1): what it records, where it lives, how it runs, how it is built

COLLECTOR-PLAN (Opus 5.5, effort max), plan item **C1** of "The road to v1"
(Phase 1), written 2026-11-10 00:45Z – 01:35Z (UTC, every time from
`date -u`) for polymarket-follow's supervisor. **A plan, no code.** It stops for the
owner's yes (WORKFLOW: a plan shows its plan first). A review decides
nothing: what the owner approves is copied into the plan page, decisions and
code-rules by the supervisor.

**Evidence** is in the supervisor folder
`E:\coding\Claude\supervisor\polymarket-follow\workers\COLLECTOR-PLAN\`
(**W** below): `scripts/` (every script as it ran), `out/` (every output),
`raw/` (every REST reply), `docs/` (the AsyncAPI and OpenAPI specs, the
realtime-updates, rate-limits and market-data pages and the changelog, as
downloaded 2026-11-10 00:47–00:48Z; the two specs are byte-identical to
DOCS-SWEEP's: SHA-256 `685bae5e…`, `55b198ce…`), `progress.md`. The raw
WebSocket capture (88 MB of gzip variants) stayed in the session scratchpad
and is not kept; every figure drawn from it is in `out/`.

**What I measured, inside the brief's limits.** *WebSocket:* a 15 s smoke
run and a 300 s run, 2026-11-10 00:54:51–00:59:52Z (a Tuesday: US night,
Asian morning), five connections at once (best prices, top-20 books and
trades of all 90 markets; the ticker and statistics streams; top-50 books of
five markets); then one bare handshake and one 3 s connection — about
5 min 20 s of the 10 allowed. *REST:* 17 public GET reads, 49 tokens, never
more than 20 in a trailing minute or 15 in 5 s, one at a time, user agent
`polymarket-follow-research`, all under `/v1/info/`, all 200, none in
02:35–03:50Z (`out/rest-budget-check.txt`). *Offline:* per-frame
compression, gaps, depth, compressors (`out/offline-analysis.txt`,
`out/depth-coverage.txt`). No account, trade or blp route, no POST, no
credential. polymarket-lab was read only, as a template (`package.json`,
`turbo.json`, the worker's package and `run-worker.bat`, its CI file,
`how-it-works.md` §0–§4, the header of `tools/backup.cjs`).

**Deviations, listed in place.** (1) Two stamps in my progress log were
first typed before reading the clock; both are corrected there. (2)
IDEAS-REVIEW was still running when I first read it and closed meanwhile
(commit `97f5fd6`); the blind store below follows its closed text (A.0-9).

**Words.** *Frame:* one WebSocket message. *Book:* the top 20 price levels on
each side. *Tick:* the server's push every 100 ms. *Token:* a unit of the
API's weighted rate limit — 250 a minute for all our callers together
(decisions 2026-11-07, wave 1 closed). *GB* = 10⁹ bytes; *GiB* = 2³⁰ (the
unit of Windows' free-space figures).

---

## For the owner, in one page

**What it records.**
1. **Every market's order book, each second it changes, and every trade** —
   from Polymarket's public WebSocket, which costs no rate-limit tokens. The
   best bid and ask are the book's first line, so they come with it. A past
   book can never be read back; trades can, but recording them is free.
2. **Once a day, all 16 leaderboards' top 1,000** (four windows × four
   sorts), read in the last 20 minutes of the UTC day, and **the competition
   table** (about 4,700 accounts). Standings exist only "now".
3. **The universe:** every address ever seen on a board or in the
   competition table, kept after it drops off. Nothing more is read per
   account: an account's trades and profit history can be read back to its
   first trade whenever a study needs them.
4. **Small reads:** the ticker each minute (open interest, funding rate, how
   many accounts are long and short), the exchange's maintenance flag every
   5 minutes, the market list every 10 minutes, splits and fees daily.
5. **One audit that proves the record honest:** every 10 minutes the
   recorded best prices against the API's own. [Final review F3: the hourly
   trade audit and the daily exchange statistics are cut — §1.8, "The cut".]

**What it costs.** About **3 tokens a minute** on average (1.3% of the 250);
never more than 50 in a minute — only during the 17-minute board read
before midnight UTC — and never more than 30 in 5 seconds. Research keeps its
200. The streams download **about 25 GB a day** (about 0.8 TB a month,
a steady 2–3 Mbit/s), nearly all of it the books, whose frames come every
tenth of a second whether or not anything changed. The computer's share is
small: reading the books costs about 1% of one processor core (measured
offline; the schema checks add a little), compressing an hour of them about
2 seconds.

**Where it lives.** Streams and every raw reply go to **files on F:** (the 2 TB
disk, 1,555 GiB free): one compressed file per hour and kind, **about
0.4–0.6 GB a day** (140–220 GB a year), with a daily list of hashes. Boards,
the competition table, the universe and the "rule book" go to **our own
database** on the shared MongoDB (C:), about 2 GB a year. Backups: the
database daily to E: and F:; the last 7 days of stream files also on E:.
Older stream files have one copy, on F: (question 5).

**How it runs.** A Windows task starts it **a minute after Windows starts**,
outside your session (no window, no sign-in needed), and restarts it after a
crash; a second small task checks every 5 minutes that it is alive and
restarts it if it hangs, writing down each restart. It never needs a Claude
session. A silent connection is caught within 15
seconds and reopened; every gap is written down. In polymarket-lab's nightly
window (02:35–03:50 UTC) it pauses its REST reads; the streams keep running.

**What research may see.** Everything it stores is after 2026-11-07, so it is
closed to the "find" studies, except addresses from boards sorted by
activity and the rule book (IDEAS-REVIEW's rule, A.0-9). Its storage layout
makes that rule a query, not a matter of care.

**Built** in eight parts by one build subagent, each tested and checked by
the supervisor, then a fresh Final review — about two days. The streams can
start recording after the third part, before the rest is finished, if you
agree (question 10): every day without them is lost for good. **You install
nothing** (Node 24.13 and pnpm 11.20 are on the PC; MongoDB runs); you
register three Windows tasks with a prepared script.

**Your questions** (section 7, each with my recommendation in brackets):
1. Keep two public streams open around the clock — about 25 GB of download a
   day; is your internet free of a data cap? (*Yes, if there is no cap.*)
2. Also record the separate best-price and fast-ticker streams? (*No.*)
3. Read the competition table with its unqualified accounts daily? (*Yes.*)
4. Read the exchange's maintenance flag every 5 minutes, not every
   minute? (*Yes.*)
5. Stream files on F:, the last 7 days also on E:; a monthly copy to an
   external disk if you have one? (*Yes.*)
6. Does this yes also allow the first app code, its packages and three
   Windows tasks? (*Yes.*)
7. Pause the collector's REST reads in the lab's nightly window? (*Yes, for
   now.*)
8. Start the poller with Windows, outside your session, instead of at
   sign-in? (*Yes.*)
9. Once the exam lists are frozen, also store those accounts' new fills
   weekly, unread? (*Yes.*)
10. Start recording as soon as the streams are built and checked, before
    the last parts and the Final review? (*Yes.*)

---

## 1. The decisions

### 1.1 What is recorded, how often, at what cost

**The measurement** (W `out/ws-measure.txt`: 300.1 s from
2026-11-10 00:54:51.759Z; the wire column from `out/offline-analysis.txt`,
each frame deflated alone as the server's compression does it):

| Stream (channel) | Frames a second, all 90 | Per market | Same as the previous frame | JSON a frame | On the wire a frame (est.) | Download a day (est.) |
|---|---|---|---|---|---|---|
| Book, top 20 (`book::<iid>`) | 896 | 9.96: every 100 ms, changed or not | 70.2% | 853 B | 303 B | 23.5 GB |
| Ticker (`tickers::all`) | 896 | 9.96 | 90.1% | 211 B | 127 B | 9.8 GB |
| Best price (`bbo::<iid>`) | 281 | 0.03–40.5 (median 2.0), only on change | 0% | 148 B | 103 B | 2.5 GB |
| Trades (`trades::<iid>`) | 0.76 (247 trades in 300 s, in 34 markets) | — | — | 221 B | 143 B | about 0.01 GB |
| Statistics (`statistics::all`) | 15.5 (each market every ~5.8 s) | — | 23.8% | 1,502 B | 512 B | 0.7 GB |
| Book, top 50 (`book::<iid>::50`), 5 markets | 49.8 | 9.96 | 67.2% | 1,769 B | 582 B | 2.5 (all 90: 45) |

The wire column assumes deflate level 6 (level 1 adds 7% on books); TLS and
WebSocket framing add an estimated 1–3 GB a day, not measured. Books and
tickers are pushed every 100 ms whatever happens, so their download is
about the same at every hour; best prices and trades grow in busy hours.

**What else the run showed.**
- **The book holds the best price.** Its first level equals the latest
  best-price frame at or before it in 99.9% of the seconds compared (17,396
  of 17,410). The best-price stream adds only the exact millisecond of a
  change between two 100 ms book ticks.
- **The best-price stream proves nothing about liveness.** A subscription
  sends no first frame (17 of 90 markets sent one within 1 s of the
  subscription, the last after 47.8 s), and 59 of 90 markets went more than
  15 s without one (the longest 120.6 s). Only the book proves, every
  100 ms, that each market is still being recorded.
- **`sq` is the exchange's own event sequence,** shared by every channel and
  connection: all 90 books of one tick carry the same `sq` and `ts`. It
  orders events; it cannot count lost frames.
- **A trades-only connection went 19.6 s without a frame** at this hour
  (five silences over 15 s): a 15-second watchdog needs the client's own
  pings (a pong is a frame; the round trip was 247–254 ms).
- **Top 20 levels are deep enough:** the thinner side covered $1,000 in all
  90 markets and $10,000 in 89 (PRL-USD's held $4,507 at its thinnest; its
  top-50 book holds no more), and $50,000 in 84 (`out/depth-coverage.txt`).
  The 50-level book doubles the bytes without covering a follower's size
  better.
- **The ticker stream carries no long/short counts** (keys
  `iid,idx,mark,last,mid,oi,fr,nxf`); the REST ticker does (`raw/tickers-*`;
  the changelog of 2026-10-27: "WebSocket tickers are unchanged").

**Recommended — the streams.** Two connections: **books (top 20) and trades
of every enabled market,** 90 subscriptions each (the cap is 100 a
connection; a 91st market opens a second connection of that kind).
- **Books are stored once a second when they changed:** the last frame of
  each second is written if its levels differ from the last written frame of
  that market; at the start of each hour every market's book is written
  once, so an hour's file stands alone.
- **Every trade frame is stored.**
- **Not recorded:** best prices as a stream (in the book); tickers at ten a
  second (the minute REST read covers the ticker; the stream would add
  9.8 GB of download a day for a sub-minute index and open interest);
  statistics and candles (re-readable from klines); the 50-level book.

**Recommended — the REST reads** (weights: external-apis; "charged" = our
accounting where none is published):

| Read | When | Tokens | A minute | Kept |
|---|---|---|---|---|
| `tickers` (all 90) | every 60 s | 2 | 2.0 | the raw reply: rolling funding rate, open interest, index, mark, last, mid, `long_count`, `short_count` |
| `exchange` | every 5 min [Final review F4: was every 60 s, 2.0 a minute] | 2 | 0.4 | the raw reply; each change of `cancel_only` or `engine_version` in the rule book, with the reply's `date` and `age` (CloudFront served it 213 s and 364 s old, so a read every minute mostly returns the same copy) |
| `instruments` | every 10 min | 2 | 0.2 | the raw reply; each change in the rule book; it drives the subscriptions; a market that leaves the list is read once by id for its settlement |
| `bbo` (all 90) — **the price audit** | every 10 min | 2 | 0.2 | each market's bid and ask against the recorded book within 200 ms of the reply's `timestamp` (one stamp for the whole reply): agree or not |
| `competitions`, `competition`, `competition/leaderboard?include_unqualified=true&limit=100` (about 48 pages) | daily 23:15Z, while a competition runs and for 7 days after its end | about 50 | 0.03 | raw pages; the parsed table; the universe |
| `leaderboard`, 16 boards × 10 pages (`limit=100`, offsets 0–900) | daily from 23:38Z: `all`, `month`, `week`, then `day` | 800 | 0.56 | raw pages; parsed boards with every page's snapshot stamp; the universe |
| `stock-splits` (charged 10), `fees` | daily 00:20Z | 12 | 0.01 | raw; parsed |

[Final review F3: cut from this table — `time` every 10 minutes (the books'
own timing watches the clock, §1.4 item 9), the hourly tape audit (10 tokens;
it guarded a partial stall nobody has seen, of a stream whose content can be
read back), and the daily `exchange-stats` (the route serves any past window
up to 31 days, so it is re-readable).]

**Average: about 3 tokens a minute** (1.3% of the 250). The reads every
minute, 5 minutes and 10 minutes make 2.8 a minute, 2.65 after the 75-minute
nightly pause; the daily passes add 862 tokens, 0.60 a minute; together 3.25
[Final review F3 and F4: was 4.67, 4.43, 872, 0.61 and 5.04 with the cut
reads and `exchange` every minute]. **Peak:** the board pass runs at most 50
tokens in any minute and never more than 30 in 5 s; with the other reads
beside it, its 800 tokens take about 17 minutes (23:38 → about 23:55Z), the
day boards last. **The collector's share is therefore the 50 a
minute the budget already reserves for "leaderboard, tickers, retries"**
(decisions 2026-11-07, wave 1 closed); research keeps up to 200 a minute
until v1's favourites take them.

**Not read, and why.** Funding history, klines, mark history and the tape:
re-readable back to launch whenever a study needs them (external-apis); the
exams pull what they need. `exchange-stats`: any past window up to 31 days
can be asked (the spec's text). `/v1/info/markets`: the tickers cover it
(DOCS-SWEEP §10). Per-account reads for the universe (portfolio, the
leaderboard's `address` row, competition rows): everything they give except
an account's rank beyond 1,000 can be rebuilt later from its fills and its
`/v1/info/pnl` and `/v1/info/equity` series; 10,000 addresses a day at 5
tokens would cost 35 tokens a minute to record nothing that is otherwise
lost (IDEAS-REVIEW foundation 1 and its F14).

**The universe.** One record per address (lower-case) holding, for each
source — a board's window and sort, or a competition with its parameter —
the first and last date it was seen there; the address's own first and last
sighting follow from these [Final review F12: they were stored beside them]. Refreshed by each
day's board pass and competition pass; never polled per account. Its size
is unverified: tens of thousands of addresses within a year is a guess from
the inputs (16 boards' top 1,000s, which overlap; the competition table's
4,746 at 00:56Z, `raw/comp-lb-unq-0.json`; R1 saw the all-time board gain
about 200 accounts a day) — a few MB either way.

### 1.2 Where it is stored, how big, how long, and the alarms

| | All in MongoDB | All in files | **Both (recommended)** | An own `mongod` on F: |
|---|---|---|---|---|
| Books (4.5 GB a day uncompressed) | would fill C: (39.1 GiB free) in weeks | fit | files | possible, but a second server to run and back up (R6's option C) |
| Boards, universe (v1's pages query them; R7: "the pages read only the database") | fit | awkward | database | — |
| A database outage at 23:38Z | loses that day's boards | nothing lost | nothing lost: the raw pages are in the day's files | — |

**Recommended: both.** Streams **and every REST reply that passes its
schema** go raw into hourly files on F:; MongoDB holds the parsed, queried
part. Because every reply is also in a file, an outage of the shared server
costs no board: the database can be filled from the files the day it is
needed [Final review F3: was "can be rebuilt from the files — a test proves
it"; the loading command is written when first needed, not now]. This is the
one exception to R6's "parsed records, not raw replies"; it costs a few MB a
day.

**Files:** `F:\polymarket-follow\recordings\<UTC date>\` [Final review F7:
was `…\collector\…`]
- `book-<HH>.jsonl.br`, `trades-<HH>.jsonl.br`, `rest-<HH>.jsonl.br` — one
  line per frame or reply: our receive time (ms), then the text exactly as
  received; for REST also the path, its weight, the status, the answer time
  and the `date` and `age` headers — so the REST files are also the call log
  R6 asked for (decisions 2026-11-08: "rolling files").
- `rejected-<HH>.jsonl.br` — frames or replies that failed their schema, raw,
  with the reason; used by nothing until a corrected schema re-reads them
  (Iron Rule 3: logged and dropped, never guessed).
- `coverage.jsonl` — every connection open and close, watchdog reconnect,
  market stall and resume, REST pause, process start and stop: where the
  record holds and where it does not.
- `manifest.json` — written after the day closes: each file's name, size,
  SHA-256, line count, first and last time.

The current hour is written as plain text and compressed with Brotli when
the hour ends (checked by decompressing and comparing hashes, then the plain
file is deleted). A crash leaves a complete plain file, which the next start
compresses; a last line cut by the crash is dropped there and counted. The
compression runs as a stream in Node's thread pool, never on the main loop:
an hour of books takes about 1.7 s of CPU, and the event loop waited at most
13 ms meanwhile (`out/cpu-bench.txt`), so the sockets keep being read.
**Brotli rather than gzip:** on the books it is 3.2 times
smaller, because a market's previous book lies 90 frames (about 77 KB)
back, beyond gzip's 32 KB window and inside Brotli's (`out/offline-analysis.txt`
§3: 0.371 against 1.197 GB a day); it is part of Node's standard library and
stable.

**Sizes** (measured at 00:55Z; busy hours change more books and trades):

| Kind | A day, compressed | A year |
|---|---|---|
| Books, once a second when changed | 0.37 GB measured (58.7 changed books a second); the ceiling, all 90 markets changing every second at the same bytes a line: 0.57 | 135–210 GB |
| Trades | about 2 MB measured (35 B a trade frame compressed, 227 frames in 300 s); 23 MB if trading were ten times busier all day — busy hours unmeasured | 1–8 GB |
| REST replies (52 MB raw a day) | at most 7.4 MB (each reply compressed alone, `out/rest-size-bound.txt`; a file of many replies is smaller) | under 3 GB |
| **Total on F:** | **about 0.4–0.6 GB** | **about 140–220 GB** of 1,555 GiB free |

[Final review F2: trades were "0.01–0.02 GB in busy hours (est.)" with no
basis — five to ten times the figure its own inputs give; REST replies "a
few MB (est.)".]

**The database:** `polymarket_follow` on the shared server, C: (the founding
decision; R6's option A, decisions 2026-11-08).

| Collection | Holds | Size |
|---|---|---|
| `board_snapshots` | one document per board per pass: window, sort, pass date, each page's offset, snapshot `timestamp`, `total` and read time, the 1,000 rows as parsed (API names, money as strings, addresses lower-cased), `consistent`, `complete` | 16 a day; about 1.2 GB a year (R6: 197 B a row on disk) |
| `competition_snapshots` | one per pass: the competition, `total`, `updated_at`, every row | 1.9 MB a pass (4,746 rows at 391 B, `raw/comp-lb-unq-0.json`); about 1.5 MB on disk at R6's modelled ratio for board rows (197 B on disk for 259 B of BSON); 0.6 GB a year only if a competition runs every day (competition 1: 14 days, then 7 days of reads) |
| `universe` | one per address (above) | unverified: tens of thousands of addresses at a few hundred bytes — a few MB |
| `rulebook` | each observed change of the market list, fees, exchange marks, splits, competitions (dates, boosts) | small |

[Final review F3: six collections cut from the first version —
`exchange_stats` (re-readable), `health_events`, `collector_state`,
`api_usage_minute` and `api_usage_hour` (what R7's Status page will read: v1
adds them with that page; until then the heartbeat file, `coverage.jsonl`,
the call lines in the REST files and `backup.log` hold the same facts),
`rejected` (the `rejected-<HH>` files hold them) and `unknown_keys` (one log
line a day).]

At most about **2 GB a year on C:** (the boards' 1.2 GB on R6's modelled
row size, the competition's 0.6 if one ran every day) — which had 39.1 GiB
free on 2026-11-10 01:09Z,
down from 42.8 GiB on 2026-11-08 (R6), not by us (`out/disk-free.txt`).

**Retention: everything is kept.** No stream, reply or snapshot can be read
again. Revisit when F: is half full, or after a year.

**Alarms** (`fs.statfsSync` every hour, as R6 tested): C: — warn under 15
GiB free, stop our database writes under 6 GiB (decisions 2026-11-08); F: —
warn under 50 GiB, stop the stream files under 10 GiB (new: proposed here);
E: — the backup refuses to write unless the free space is at least three
times the last copy plus 5 GiB (R6 Q5). A stop is logged and shown by the
`status` command [Final review F3: was "a PROBLEM on Status and a
notification from the check task"]; the streams keep running for the
watchdog but are not stored while it lasts.

### 1.3 The blind store

**The rule is IDEAS-REVIEW's A.0-9** (closed, `97f5fd6`); this plan points to
it and does not restate it beyond one line: from anything stored after
2026-11-07T00:00Z a FIND study may take only the `account` of rows on boards
sorted by notional or account value and of the competition table read with
`include_unqualified=true`, and the rule book — never prices, trades, books,
tickers, open interest, funding, counts, portfolios, profit or competition
figures; accounts found that way are a secondary population and enter no
CONFIRM list of this batch.

| | How it is kept | Strength | Cost |
|---|---|---|---|
| (a) The rule in every brief + the supervisor's access scan | as with R2's holdout | proven here | rests on care |
| **(b) A layout that makes the rule a query + the kit's readers + (a)** | addresses, rule book and values stored apart; the research kit's FIND reader opens only `universe` (projected to the address, filtered by source) and `rulebook`, and refuses any row stamped at or after the cut | IDEAS-REVIEW's own design ("the kit's readers enforce A.0-9 by construction") | nothing extra in the collector |
| (c) A separate database with its own users | per-database rights | strong | the shared server has no authentication (R6); turning it on would change the lab's server — Iron Rule 2 |
| (d) Encrypt the result fields | a key held by the supervisor | strong | complexity; v1 must read them |

**Recommended: (b).** What the collector does for it, and nothing more (it
"writes everything and decides nothing about who may read": IDEAS-REVIEW):
1. **`universe` says where each address was seen** — per source, first and
   last date — and holds no value of any row. The allowed set is one query:
   addresses with at least one source among the notional and account-value
   boards and the competition table with `include_unqualified=true`. An
   address seen only on profit- or return-sorted boards never enters it.
2. **`rulebook` holds only the rule book's kinds:** the market list, fees,
   competition dates and boosted markets, maintenance and engine-version
   marks (the exchange's flags and the server's connection drops), splits.
3. **Everything else** — board and competition rows with their values, the
   stream files, the ticker replies, the price audit's figures — stays where no
   research brief points: the other collections and
   `F:\polymarket-follow\recordings\`, never under
   `F:\polymarket-follow-research\`.
4. **The collector computes no research figure.** Its health code reads values
   only to say "agree" or "disagree" (the price audit) and to count.
5. **An exam reads the blind data once,** through a capture copied out with a
   manifest (A.0-10), recorded in decisions.
6. **Later batches** whose data starts with the collector (IDEAS-REVIEW: the
   studies with no history, from mid-January 2027) declare their FIND and
   CONFIRM date slices before any read; the kit's cut moves with the batch.
7. **Checking the collector looks at counts and shapes, never values.** A.0-11
   says the new weeks are read at the two exams "and at no other time, by no
   one, for no reason" — which covers the build's live runs, the `status`
   command, the logs and the supervisor's verification too. They print rows,
   pages, stamps, sizes, gaps, hashes and agree/disagree; never a profit, a
   rank, a price or a move. A test asserts that the board pass's log lines
   and `status` contain no field of a row.
8. **This plan's own reads** (allowed by its brief) touched data after the
   cut: five minutes of books and trades, four pages of the day board and one
   page of the competition table, all of 2026-11-10. Only shapes, sizes,
   rates and counts are reported here; the raw replies and frame samples stay
   in W `raw/` and `out/`, which no FIND brief points to.

### 1.4 How it runs on this PC

| | At sign-in, in the owner's session | **At start-up, "whether logged on or not", no password stored (S4U) — recommended** | A Windows service |
|---|---|---|---|
| Runs after a restart with nobody signed in | no | yes | yes |
| A window to hide | yes: needs a windowless launcher | none: outside the session | none |
| Can show a notification | yes | no (none is needed: §1.8, the cut) | no |
| Registering | the owner, no administrator (R4; not tried) | the owner once, from an elevated PowerShell: the account is an administrator (filtered token) and already runs the lab's worker as a start-up task outside the session (`out/task-facts.txt`) | an administrator, and a service wrapper to install |
| Recorded | the default decided 2026-11-07 (the owner's PC; R4 Q3) | changes that default for the poller only (question 8) | — |

**Recommended: at start-up, outside the session** [Final review F15: was "at
sign-in, as decided", with a windowless launcher compiled from 20 lines of
C# by Windows' own `csc.exe` (present: `out/launcher-facts.txt`) to hide the
console window — itself chosen over R4's `.vbs` because Microsoft writes
"Around 2027, the VBScript FODs will no longer be enabled by default"
(`docs/ms-vbscript-deprecation.html`). Once the check's notification was cut,
neither task needs the desktop: outside the session there is no window to
hide, and a start-up trigger records through a night restart by Windows
Update, paused only to 2026-11-18]. v1's notifier, which must reach the
screen, stays at sign-in (R4's two processes). **Names:** the program, its
tasks and its folders are named for what they stay — the poller, v1's one
API client; "the collector" is this first part's name on the plan page.
[Final review F7: the tasks were "polymarket-follow collector" and
"… collector check", the check script `collector-check.ps1`, the files'
folder `F:\polymarket-follow\collector\` — beside `apps/poller`; registered
tasks and data folders are costly to rename once v1 runs.] The parts:
1. **Task "polymarket-follow poller":** at start-up with a 1-minute delay
   (as the lab's worker); "run whether the user is logged on or not", the
   password not stored (S4U: local resources only, which is all it uses);
   run level Limited; action `<run copy>\run-poller.cmd`, which starts
   `node dist\index.js` and appends its output to `…-run\var\logs\stdout.log`
   — the lab's `run-worker.bat`, copied — so a crash's last words are kept and
   node's exit code reaches Task Scheduler; restart every minute up to three
   times; no time limit; one instance (do not start a new one).
   **The run copy:** the task runs a copy of the built program outside the
   working tree (`E:\polymarket-follow-run\poller\`, written by
   `tools\deploy.ps1` after `pnpm verify` is green), so a build in progress
   can never become what a crash restart runs. Its state — heartbeat, lock,
   logs — lives beside it in `E:\polymarket-follow-run\var\`, which a deploy
   never touches.
2. **A lock inside the program:** a lock file with the process id; a second
   start exits while the holder's heartbeat is fresh. Two collectors would
   double the connections and the tokens.
3. **The heartbeat:** a file, `…-run\var\heartbeat.json`, rewritten every 10 s
   (time, process id, each connection's last frame, each job's last success,
   tokens in the last minute). It works when MongoDB does not. [Final review
   F3: was "and the same in `collector_state`" — the database copy comes with
   v1's Status page.]
4. **Task "polymarket-follow poller check":** at start-up and every 5
   minutes, outside the session like the poller (so no window ever flashes),
   a short PowerShell script. If the heartbeat is older than 2
   minutes, it ends the node process whose command line is the poller's,
   starts the poller task and appends a line to `…-run\var\check.log`. Task
   Scheduler restarts a crash, not a hang (R4 §5); this is what catches a
   hang. [Final review F3: it also showed a Windows notification — cut: R4's
   banner is still unverified (its owner sheet A), and notices belong to v1's
   notifier, which watches the poller by design (R4 §5).]
5. **The watchdog (code-rules):** each connection pings every 10 s; no frame —
   data or pong — for 15 s means close, reopen and resubscribe, with back-off
   of 1, 2, 5, 10, 30 and 60 s, reset after 5 healthy minutes; a connect may
   take 90 s (R1 saw one take 61.8 s). Liveness is judged by the data: each
   market's book comes every 100 ms, so a market with no book frame for 15 s
   while others arrive is logged as a stall, and all markets stalled while
   pongs arrive means reconnect.
6. **Gaps:** every interval without recording, by connection and by market,
   in `coverage.jsonl`, with its cause — our restart, a
   server close and its code, a watchdog reconnect, or the PC off (the time
   since the last heartbeat, found at start).
7. **The lab's nightly window (02:35–03:50Z):** the REST reads pause; the
   streams continue (a separate bucket and host, no tokens; the rate-limits
   page: "Hitting one bucket does not consume another bucket"). No daily job
   is scheduled inside it.
8. **PC restarts:** the tasks start a minute after the PC does, before
   anyone signs in [Final review F15: was "at the next sign-in"]; the gap is
   logged. A day's boards missed while the PC was off are lost and logged as
   missed,
   never filled from a later read (the lab's lesson: "a lost day is gone").
9. **The clock:** every record carries the server's time (`ts`, a board's
   `timestamp`) beside our receive time; the daily times are UTC inside the
   program, so summer time moves nothing. Offset watch: each minute, the
   smallest (receive − `ts`) on the books (102–103 ms in the run; it shifts
   if our clock drifts); WATCH beyond 2 s (R7) [Final review F3: the
   `/v1/info/time` reads beside it are cut — the books give the same signal
   free]. Windows last synced to time.windows.com at 2026-11-09 16:25:56Z and
   polls every 32,768 s (`w32tm /query /status`, 2026-11-10 00:57Z).
10. **R7's Status page later:** its rows — processes, exchange API, data
    freshness, budget, disk, backup, replies, clock — have their sources from
    day one (the heartbeat file, `coverage.jsonl`, the call lines in the
    REST files, the day manifests, `backup.log`); v1 adds the database copies
    the page reads [Final review F3: was "`collector_state` and
    `health_events` carry its rows … so the page needs no new collector
    code"]. Until then the `status` command prints them.
11. **Logs:** pino, JSON lines, one file a UTC day under `…-run\var\logs\`,
    30 days kept; `run-poller.cmd`'s output file catches a crash's last
    words.

### 1.5 Backups

**Recommended** (R6's design; decisions 2026-11-08: E: and F:, never D:):
- **Task "polymarket-follow backup":** daily at 06:20 local (05:20Z now,
  04:20Z after 2027-03-28), "run as soon as possible after a missed start";
  `tools\backup.cjs`, outside the build, using the poller's MongoDB driver —
  a backup must not break with the thing it insures (the lab's rule).
- **The database:** every collection of `polymarket_follow` (a skip list,
  empty now, names any later exception with its reason), as Extended
  JSON, gzip, into `E:\backups\polymarket-follow\db\<date>\` and
  `F:\polymarket-follow\backups\db\<date>\`, `manifest.json` last;
  append-only collections cut at the run's start minus 60 s (R6). Kept: 7
  days on E:; 30 daily, 12 weekly and 12 monthly on F:.
- **The stream files:** yesterday's closed day folder copied to
  `E:\backups\polymarket-follow\stream\<date>\`, each file checked against
  the day's manifest; 7 days kept on E: (3–4 GB, inside R6's "our root on E:
  stays under 8 GB").
- **Checked:** each run re-reads what it wrote against the manifest hashes
  and appends a line to `backup.log` (time, sizes, ok); `status` shows the
  last ok run, WATCH after 36 hours without one (R7).
- **The restore test:** every Sunday after the dump, into
  `polymarket_follow_restore_<date>` (refused if the name exists, any other
  name refused, never over the live database); counts and `_id` sets
  compared; then dropped. Once a quarter the owner runs a full drill (R6).
  [Final review F3: cut — the skip list's two named collections (cut
  themselves), the `health_events` row, and the universe rebuilt from the
  files at each restore test.]
- **One copy only:** stream files older than 7 days live on F: alone; a
  failing F: loses them (question 5).

### 1.6 The first code in the repository

| | (a) The Turborepo skeleton now | **(b) A pnpm workspace with one app (recommended)** | (c) One package at the root | (d) Scripts in `tools\` |
|---|---|---|---|---|
| Grows into v1 | yes | yes: `apps/api`, `apps/web` and `packages/shared` are added beside it; Turborepo comes with the skeleton step | must be moved | rewritten |
| Unneeded now | Turborepo; a shared package with one user | nothing | — | — |

**(b), laid out:**

```
package.json          private; type module; packageManager pnpm@11.20.0; engines node >=24;
                      scripts build, lint, test, format, format:check, verify (= build, lint, test, format:check)
pnpm-workspace.yaml   apps/*, packages/*
tsconfig.base.json, eslint.config.mjs, .prettierrc.json, .prettierignore   (copied from the lab, trimmed)
.env.example          MONGO_URI, MONGO_DB=polymarket_follow, STREAM_ROOT, STATE_DIR, BACKUP_ROOTS
apps/poller/          the one API client (the plan page: "the poller (its first part: the collector)")
  src/index.ts        start: configuration, the lock, the database, connections, schedule, heartbeat
  src/config.ts       the environment, parsed by Zod (Node's own process.loadEnvFile)
  src/api/            rest-client.ts (admission, back-off, nightly pause, allowed routes, call log),
                      admission.ts (pure), schemas.ts (Zod for every reply and frame used)
  src/ws/             connection.ts (open, subscribe, ping, watchdog, reconnect), book-sampler.ts (pure)
  src/jobs/           minute-reads (tickers, exchange), instruments, board-pass, competition-pass,
                      daily-reads (splits, fees), price-audit
  src/store/          files.ts (hourly files, Brotli at the hour, manifests), db.ts (name check, indexes),
                      universe.ts (pure upsert rules)
  src/health/         heartbeat.ts, disk.ts (pure thresholds), coverage.ts, status.ts (the status command)
  src/schedule.ts     pure: next run times in UTC, the nightly window
  test/               vitest; fixtures trimmed from this plan's replies, dated 2026-11-10
tools/                backup.cjs, restore.cjs, run-poller.cmd (copied into the run copy),
                      deploy.ps1 (the run copy), poller-check.ps1, register-tasks.ps1

outside the repository: E:\polymarket-follow-run\poller\ (the run copy), E:\polymarket-follow-run\var\
                      (heartbeat, lock, logs); F:\polymarket-follow\recordings\ (the files)
```

**Technical calls, for the supervisor to record:**
- **No Turborepo and no `packages/shared` yet.** One package gains nothing
  from either. The schemas the api will share move to `packages/shared` when
  the api exists — a move, not a rewrite. The skeleton step still brings
  Turborepo, the docs-size report and the decisions guard (the plan page).
- **Node 24's own WebSocket, not the `ws` package.** It sends our user agent
  (`new WebSocket(url, { headers })`, tested against 127.0.0.1:
  `out/ws-ua-local-test.txt`) and negotiates the server's per-frame
  compression (`out/ws-ext-check.txt`).
- **No node-cron.** Two kinds of schedule (every N seconds; daily at HH:MM
  UTC) feed one queue that admits each request against the budget; a pure
  "next run" function is tested with a fake clock. CLAUDE.md's Stack line
  says "a node-cron poller": a deviation to record.
- **Dependencies:** `zod`, `mongodb` (the driver), `pino`; for development
  `typescript`, `vitest`, `eslint` with `typescript-eslint`, `prettier`,
  `@types/node` — the lab's major versions (zod 4, mongodb 7, pino 10),
  re-checked against their documentation when installed. No dotenv: Node
  reads `.env` itself.
- **The task runs compiled code** (`tsc` into `dist\`), as the lab's does,
  but from a run copy outside the working tree (§1.4, item 1): a change needs
  `pnpm verify`, `tools\deploy.ps1` and a restart of the task — so the work
  of a later build in the same repository (v1's) never runs by accident.
- **Tests:** unit tests for every rule that decides something — admission
  (the 60 s and 5 s windows, the 50 cap), the 429 back-off, the nightly
  pause, the schedule, the book sampler (once a second when changed; the
  hourly full write), the watchdog (fake clock), the board pass (order, the
  page-stamp consistency flag, the 23:59:30Z guard), the
  competition's paging stop, the universe (first seen never moves; sources
  accumulate), the disk thresholds, every schema on the dated fixtures with
  an unknown key added, the file writer (the hour's roll, the Brotli round
  trip, the manifest) — and **an Iron Rule 1 test:** the REST client refuses
  any path outside `/v1/info/`, the WebSocket client can send only `sub`,
  `unsub` and the ping, and no `POST` exists under `src/`. Integration tests
  (local only): the store against `polymarket_follow_test` (the code
  asserts the database name at start) and the backup–restore round trip. A
  manual live smoke command (60 s, prints counts).
- **`pnpm verify`** = build, lint, test, format:check, in that order (CI's,
  once the skeleton step brings CI), green at the end of every part.

**What the owner installs: nothing.** Node v24.13.0 and pnpm 11.20.0 are
installed (`node --version`, `pnpm --version`, 2026-11-10); MongoDB 8.3.7
runs as a service (R6). The build runs `pnpm install` for the packages above
(question 6). The owner registers the three tasks by running
`tools\register-tasks.ps1` (or by hand, guided by the supervisor) and pushes
to GitHub as now.

### 1.7 Failure cases and how each is handled

| Case | Detected by | Handling |
|---|---|---|
| **A 429** | the reply | that request dropped and its job's tick skipped; back-off from 2 s doubling to 60 s (code-rules; R1: "on 429 pause 60 s"); the board pass resumes inside its window; logged and counted (`status`); never a retry loop. Admission (trailing 60 s ≤ 50, trailing 5 s ≤ 30) keeps it rare; the owner's browser on polymarket.com/perps shares the bucket |
| A 5xx, a timeout, the network down | the reply, or none within 15 s | the same with back-off from 1 s; minute reads skip a tick; logged and counted |
| **A silent socket** | no frame, data or pong, for 15 s (pings every 10 s) | close, reopen, resubscribe, back-off; the gap logged from the last frame to the first after |
| One market's book stops while others flow | no book frame from it for 15 s | a stall logged (start, end); all markets stalled while pongs arrive → reconnect |
| A deploy, maintenance, cancel-only | the server closes the connection (changelog: "connections drop when the gateway restarts"); `exchange` marks, up to about 12 minutes late (read every 5 minutes, served up to about 7 minutes old by CloudFront) | reconnect; the gap's cause "server close" with its code; the marks in the rule book |
| A channel refused at subscription | the `sub` reply's `err` | logged; expected for a delisted market; otherwise retried at the next reconnect |
| `message_rate_limited` | the reply | back-off; pings are 12 a minute and a subscription one message per connection, so only a reconnect storm could reach it, and the back-off bounds that |
| **A full disk** | the hourly free-space check | §1.2's alarms; a stop is logged and shown by `status` |
| F: missing or failing | a write error | stream writing stops (that time is lost); logged and shown by `status`; the database writes and the heartbeat go on |
| MongoDB down or restarted | the driver | the files keep every reply, so no board is lost; the database is filled from them if that is ever needed; the heartbeat file goes on |
| **A schema change** (a frame or reply fails Zod) | the parse | dropped, and written raw with its reason to `rejected-<HH>`; counted in the heartbeat; a kind failing whole for a minute is a PROBLEM in `status` — its data is lost until the schema is fixed; never guessed (Iron Rule 3) |
| Unknown keys | the parse (non-strict objects) | kept in the raw text; their paths logged once a day |
| **The API ahead of the spec** (DOCS-SWEEP) | — | only routes read live and recorded in external-apis are called; fields outside the spec (`long_count`, `fee_override`) are optional in the schemas; an unpublished weight is charged 10 (`stock-splits`) |
| **A split** | the daily `stock-splits` (`events`, `sequence`) | the event in the rule book and in `status`; files keep frames as received; readers never join sizes or prices across it (DOCS-SWEEP §4) |
| **A delisting** | `instruments`: `close_only`, then the market leaves the list | marks in the rule book; its settlement read once by id; its channels unsubscribed, no stall alarm after |
| A new market | `instruments` | subscribed on the open connections (one message each); a mark in the rule book |
| The market list unreadable at start | the first `instruments` read fails | retried with back-off; the streams open after the first read [Final review F3: was "the last stored list subscribes the streams" — a fallback for an API that is down anyway] |
| **Clock drift** | the smallest (receive − `ts`) on the books each minute | WATCH over 2 s; records keep the server's time anyway; the program never sets the clock (a system setting) |
| A board read straddles a refresh | its pages' snapshot stamps span more than 10 s | stored with its page stamps and `consistent: false` [Final review F3: was "re-read once if the window allows" — a flag is enough] |
| A list shifts while it is paged — a board refreshing mid-pass, or the competition table growing (4,738 to 4,746 accounts in an hour on 2026-11-10) | the same account on two pages; fewer rows than `total` | rows kept once per account within a pass (the first page's row); every page's `total` and stamp stored; an account skipped at a page boundary is seen the next day [Final review F9: no rule was named] |
| **A frozen source** — the API answers, the data stops moving (the lab's leaderboard froze 2026-10-30 to 11-02, R4 §5) | a board's snapshot stamp older than 5 minutes at read time (10 for `all`; R1 saw at most 60 s and 281 s), or its top 100 identical to the day before | the board stored with `stale: true` [Final review F3: the "no book changed in 5 minutes" watch is cut — a dead stream is caught by the per-market stall check; books that arrive but never change are rare and visible in the files afterwards] |
| The day boards run late | the 23:59:30Z guard | not read after it, logged as missed; a board's day is taken from its snapshot `timestamp`, never from our clock |
| A competition ends, a new one starts | the daily `competitions` read | each competition is read until 7 days after its end (final and paid rows); its dates and boosts in the rule book (A.0-8) |
| A crash | node's exit code, through `run-poller.cmd` | Task Scheduler restarts it three times a minute apart; then the check task |
| A hang | the heartbeat file older than 2 minutes | the check task ends and restarts it, and logs it |
| Two collectors | the lock | the second exits |
| The PC off, asleep or restarted | the time since the last heartbeat, at start | logged as a gap; streams of that time lost; a missed board pass lost and logged |
| The nightly window | the clock | REST paused 02:35–03:50Z |
| An hour's file fails its compression check | the round trip | the plain file kept and retried next hour; a WATCH |
| Memory growing | the heartbeat's memory figure | per-market state is bounded by construction; `status` shows the figure [Final review F3: was "a WATCH over a threshold" — no one can set the threshold before a week of figures] |

### 1.8 The build, in parts

| Part | What | Its tests | Done when |
|---|---|---|---|
| 0 | the workspace, configuration, one empty app with one test | `pnpm verify` runs build, lint, test, format:check in that order | `pnpm verify` green |
| 1 | the REST client (admission, back-off, nightly pause, allowed routes, call log), the schemas, the minute and ten-minute reads, the file writer (hours, Brotli, manifests, coverage) | the unit tests of §1.6 that apply | a live run of at least 30 minutes across an hour's end: no 429, the call log never above 50 tokens a minute or 30 in 5 s, the closed hour's file compressed and verified |
| 2 | the WebSocket (books, trades), pings, the watchdog, reconnects, the sampler, stalls, gaps; the price audit | the sampler, the watchdog, the back-off, the frame schemas | a 60-minute live run: book lines per market as measured here; a forced close reconnects within 20 s and its gap is logged; the price audit agrees in at least 97% of rows, and every miss is a market whose book changed in that second (a timing miss, not a lost frame) — this plan's simulation on its own capture: 177 of 180 rows, the three misses in the markets whose best price changed most often (`out/audit-sim.txt`); CPU, memory and bytes received reported |
| 3 | running on Windows: the heartbeat file, the lock, `run-poller.cmd`, the run copy, the check script, the registration script (prepared, not run by the build) | `run-poller.cmd` passes node's exit code on (a run that exits 3); the lock refuses a second start | the owner registers the tasks once, elevated (question 10: as early as this); after a restart of the PC both tasks run before anyone signs in; an ended node process comes back; a stopped heartbeat (a test switch) makes the check restart it and log it |
| 4 | the MongoDB store; the board pass, the competition pass, the daily reads; the universe; the rule book | board order and guards (fake clock), the re-read, the paging stop, the universe rules | one live board read (50 tokens) stored, its universe updated; then the first night's full pass, watched by the supervisor: 16 × 1,000 rows with their snapshot stamps |
| 5 | health: the disk checks and the stop, the clock watch from the books, the boards' `stale` flag, a `status` command that prints every row from the heartbeat file and the day's folder | thresholds; the status output | `status` prints every row from a live run |
| 6 | backup and restore | the round trip on `polymarket_follow_test` | a backup to E: and F: and a restore test, both ok |
| 7 | docs: architecture's first real section, current-task; the decisions entry for the technical calls; the docs sweep | — | `pnpm verify` green; docs swept |
| 8 (later) | the weekly fills of the frozen exam lists into the blind store (question 9), when the supervisor hands over the list files (about 2026-11-20) | the list's hash checked at start; dedupe by key | a week's fills stored, unread |

**The cut** [Final review F3]. The first version records everything §1.1
asks for and nothing more. Dropped from what this plan first proposed:
- *what v1 adds with its Status page:* the collections `collector_state`,
  `health_events`, `api_usage_minute` and `api_usage_hour` — meanwhile the
  heartbeat file, `coverage.jsonl`, the REST files' call lines and
  `backup.log` hold the same facts, and `status` prints them;
- *copies of something kept elsewhere:* the `rejected` collection (the
  rejected files), `unknown_keys` (one log line a day), `exchange_stats`
  (re-readable for any past window);
- *checks of failures nobody has seen:* the hourly tape audit, the "no book
  changed in 5 minutes" watch, the board re-read (a flag is enough), a memory
  threshold no one can set yet;
- *a second signal for the same thing:* the `/v1/info/time` reads (the books
  time the clock);
- *fallbacks whose data is safe anyway:* the command that loads the database
  from the files (written the day it is needed), the stored market list at
  start (a retry), the universe rebuilt from the files at each restore test;
- *what another phase owns:* the check task's notification (v1's notifier)
  and CI (the skeleton step, as the plan page orders it).

Kept, each because it is the only way to something the brief or a decision
needs: the two streams and the book sampler; the watchdog, the stall check
and `coverage.jsonl`; the board and competition passes; the universe and the
rule book; the price audit (IDEAS-REVIEW's "done" line); the hourly files and
their manifests; the rejected files (Iron Rule 3); the lock; the heartbeat
file and the check task (a hang is otherwise silent); the run copy (§1.4); the disk checks, the backups and the weekly restore test
(R6, decided); the `status` command (the supervisor checks with it).

**Who builds:** one build subagent (Opus 5.5, effort high or max: its code
runs unattended and spends the shared budget), part by part, each part
committed by name on main. It calls only `/v1/info/` and the public
WebSocket, inside the collector's share, and stops every process before it
reports. **How the supervisor verifies each part:** `pnpm verify` run itself;
the diff read; a search for any route outside `/v1/info/`, any `POST`, any
path of polymarket-lab; the live smoke run on its own path, with the files,
the database documents and the call log checked (tokens a minute, 5-second
peaks); each deciding rule broken on purpose — admission, the 23:59:30Z
guard, the sampler, the watchdog, the universe's first seen, the disk stop
— and a test seen to fail. **Then a fresh Final-review subagent** reads the
whole code: before the owner registers the tasks, or — if question 10 is
answered yes — while the early collector runs, its fixes shipped as
deploys. **After start:** the supervisor checks the first 23:38Z board
pass, the first 05:20Z backup and the first day's manifest; after a week
the measured sizes replace this plan's estimates in architecture.

**IDEAS-REVIEW's "done when" for foundation 1, mapped:** (1) "a day's
best-price record has no gap over 15 s outside logged maintenance" → no
interval over 15 s without book frames for a market in `coverage.jsonl`,
outside logged deploys (the best-price stream cannot carry this line: 59 of
90 markets go quiet longer); (2) "an hour of the recorded stream agrees with
`/v1/info/bbo` snapshots" → the price audit, at least 97% within 200 ms with
every miss explained by timing (exact agreement at one instant is impossible
with 100 ms snapshots in the fastest markets: `out/audit-sim.txt`); (3) "the
daily board copy holds 16 × 1,000 rows with their snapshot stamps" → part 4;
(4) "the tables that carry results cannot be opened from a study's folder" →
§1.3's layout and the kit's readers.

**Time:** about two days of build and review — this week (decisions
2026-11-09, the fast track). **Each day before the task runs is a day of
books and boards lost for good,** so question 10 asks whether the tasks may
be registered as soon as part 3 is verified — the streams and the minute
reads recording, with part 1's REST client already checked by the
supervisor — parts 4–6 then shipping as deploys of the running task
(`pnpm verify`, `tools\deploy.ps1`, a restart) and the Final review
following.

---

## 2. Variations weighed

- **Streams.** (S1, recommended) books and trades; (S2) + the best-price
  stream: +2.5 GB of download a day and 0.39 GB of disk a day at the
  measured night rate (more in busy hours, unmeasured) for the exact
  millisecond of changes; (S3) + the ticker stream: +9.8 GB of download for a
  sub-minute index and open interest; (S4, IDEAS-REVIEW's wording) best
  prices each second and a book every 10 s — the book stream is needed
  anyway, and 10 s loses the second a trader acted; (S0) trades only, plus a
  REST book of every market every 10 minutes (1.8 tokens a minute), if the
  download meets a data cap.
- **How often a book is stored** (gzip, a day; `out/ws-measure.txt` and
  `out/offline-analysis.txt` §4): every frame 18.0 GB; every change 3.3; once
  a second when changed 1.2 (Brotli 0.37); every 2 s 0.70; every 5 s 0.33;
  every 10 s 0.19 (Brotli 0.11); every minute 0.04. Once a second keeps the
  second a trader acted for a third of gzip's cost.
- **Book depth:** 20 (recommended) against 50 (twice the bytes, no better
  cover for $1,000–$10,000).
- **Compressor:** gzip (universal; 3.2 times larger on books); Brotli
  quality 5 (recommended: in Node's standard library, stable, fast); Brotli 9
  (11% smaller, slower); zstd level 19 (25% smaller than Brotli 5; in this
  Node, 24.13, but newer there); a columnar format (packages, and a reader
  to maintain).
- **The hour being written:** plain text, compressed at the hour's end
  (recommended: a crash leaves a whole file) against compressing as it goes
  (a crash leaves a truncated stream).
- **`exchange` every minute** (DOCS-SWEEP) against every 5 minutes
  (recommended): CloudFront served it 213–446 s old, so most minute reads
  return the same copy; a minute's read would cost 2 tokens a minute — two
  fifths of the collector's average — to see a change at most 4 minutes
  sooner. [Final review F4: every minute was recommended.]
- **The board pass:** 23:38Z with the day boards last (recommended) against
  after 00:00Z (the day boards have reset) or twice a day (not asked).
  Consistency: flagged when the pages' snapshot stamps span over 10 s, not
  re-read (Final review F3).
- **The universe:** addresses only (recommended) against a daily address row
  per account (35 tokens a minute for 10,000) or weekly.
- **Hiding the window:** in the owner's session a console program needs a
  launcher — R4's `.vbs` (VBScript off by default from about 2027,
  Microsoft) or one compiled by Windows' own `csc.exe`; outside the session
  (recommended, Final review F15) there is no window and no launcher. The
  only thing lost is a notification from the check, which the cut removed.
- **What the task runs:** the working tree, as the lab does, against a run
  copy refreshed only by a deploy after `pnpm verify` (recommended: a build
  in progress can never be what a crash restart starts).
- **Where:** §1.2. **How it runs:** §1.4. **The repository:** §1.6.
- **Watching the collector:** the check task (recommended) against the
  supervisor's daily status only (days of silence possible) or a dead-man's
  switch outside the PC (R4's later phase).
- **Gaps in the trades:** logged only (recommended; the tape is re-readable)
  against re-reading the tape for every outage automatically.

## 3. Possibilities found

1. **Each market's book every 100 ms makes liveness exact per market** — a
   stalled market is visible within 15 s even when its price does not move.
2. **One tick, one `sq`:** all 90 books of a tick share `sq` and `ts`, so the
   whole exchange can be rebuilt at any tick from the files.
3. **An exact book audit is possible:** REST books carry a `sequence` (R1's
   table), comparable with the stream's `sq` (not needed in C1; the best-price
   audit suffices).
4. **Per-frame compression is already on:** Node's own client offers it, the
   server accepts it (`permessage-deflate; server_no_context_takeover;
   client_no_context_takeover; server_max_window_bits=15`): books cost about
   2.8 times less download than their JSON.
5. **Brotli stores books 3.2 times smaller than gzip.**
6. **A fast board pass reads one snapshot:** four pages of the day board read
   2.3 s apart carried snapshot stamps within 262 ms of each other
   (`raw/lb-day-pnl-*.json`, 00:57:23–30Z).
7. **The universe needs no per-account reads:** the boards and the
   competition table refresh it daily for about 850 tokens.
8. **The price audit gives each exam a measured quality line** for the record it
   uses.
9. **A day folder describes itself** (manifest, coverage): a reader needs
   neither the database nor this program.
10. **Every REST record keeps `date` and `age`,** so its true as-of time is
    known although CloudFront serves `exchange` and `instruments` minutes old.
11. **v1's paper log gets its book for free:** the book at a follow instant is
    already in the poller's memory, so no REST book read (2–20 tokens) per
    alert.

## 4. Potential problems, and how each would be handled

Failures at run time are in §1.7; these concern the plan.

| Problem | Handling |
|---|---|
| The download (about 25 GB a day) meets a data cap | question 1; S0 is the fallback (§2) |
| Stream files older than 7 days have one copy | question 5 |
| C: is shrinking — 42.8 GiB free on 11-08, 39.1 on 11-10 — not by us | our share is about 2 GB a year; the alarm at 15 GiB; if C: keeps falling, the owner and the lab's supervisor look at what grows; moving our database (R6's trigger) would need a disk other than D: |
| Windows Update resumes after 2026-11-18 and may restart the PC at night | the start-up tasks run a minute after the restart (§1.4, question 8); the minute of the restart is a logged gap |
| The rates were measured for five minutes at night | the sizes carry their ceilings; the first week's manifests give the real figures |
| A study is tempted to open the stores | §1.3 |
| The collector and research share the 250 | the collector's cap is 50; research's 200; the owner's browser shares the bucket (no rule; back-off) |
| The build itself spends tokens | inside the collector's share, one process at a time |
| The terms of use (R1 Q13) | unchanged from decisions 2026-11-07: personal use, a public documented API, a small steady presence — two connections of the 50 allowed, about 3 tokens a minute |
| A deploy changes a message's shape | §1.7: rejected frames kept raw; a schema fix re-reads them |
| Someone starts a second collector by hand | the lock |
| A launcher that one day starts nothing (VBScript off by default from about 2027) — the poller and its check would fail together, silently | no launcher at all: the tasks run outside the session (§1.4; Final review F15) |
| A later build in the same repository changes what a crash restart runs | the run copy, refreshed only by a deploy after `pnpm verify` (§1.4) |
| Registering a start-up task outside the session needs an administrator | the account is one (filtered token, `out/task-facts.txt`): the owner runs the prepared script once from an elevated PowerShell; nothing else needs elevation |
| The download and TLS figures are estimates | part 2 reports the bytes the process received |

## 5. What stays unknown, and what would settle it

- **A full day's and a full week's rates.** Five minutes on a Tuesday at
  00:55Z; weekday US hours change more books and trades. *Settles:* the first
  week's manifests.
- **Whether a long connection is recycled** after hours or days (none in five
  minutes). *Settles:* the first days' coverage log.
- **How much the four account-value boards repeat one another.** Account
  value is the current equity, and the window only decides who is eligible
  (the spec's text), so the four may be nearly one list — 200 tokens a day.
  *Settles:* the first week's overlap of their rows (counted, not read: §1.3
  item 7); if they repeat, 13 boards would do, which is the owner's call
  since C1 names 16. [Final review F13: unsaid.]
- **The server's compression level and the TLS overhead,** so the download is
  an estimate to about ±15%. *Settles:* part 2's byte count.
- **Whether a CloudFront cache hit spends tokens** (it changes only our
  accounting; we count it), and **how long CloudFront keeps `exchange`**
  (213–446 s seen).
- **How the gateway treats a client that receives about 900 frames a second
  for weeks** (no limit on frames sent to a client is documented).
- **How F:, a hard disk, behaves under months of continuous small writes.**
- **Whether backstop liquidations show `liquidation_details` on the public
  trades** (DOCS-SWEEP: none seen). *Settles:* the trade files.
- **The `corporate-actions::<iid>` channel** (changelog only, untested): not
  subscribed; the daily split read covers splits.
- **Your internet plan.** Question 1.
- **Statistics' cadence:** the spec says every second; measured about every
  5.8 s a market. Not used.

## 6. Beyond the brief

1. **The forward clock starts with the books** (IDEAS-REVIEW 2.17): from day
   one any paper entry can be checked against a recorded book.
2. **The price audit's agreement rate is the honest quality line** for any
   result built on the record; each exam prints them.
3. **The weekly fills of the frozen lists** (IDEAS-REVIEW's addition): if a
   history route were withdrawn before an exam, the exam would not be lost.
   About 0.5 tokens a minute (question 9).
4. **R4's freshness check should read the books, not the trades:** decisions
   2026-11-09 (R7's technical calls) planned it on the trades stream, which
   goes 20 s quiet at night; the books come every 100 ms.
5. **The competition table never lists disqualified or under-review
   accounts** (the spec's text), so the universe from it misses exactly the
   accounts the competition flags; the boards still list them.
6. **The changelog page could be hashed daily** (docs host, no tokens) to mark
   announced changes — for v1, not C1.
7. **Iron Rule 1 becomes a test** (§1.6), not only a rule.
8. **Summer time moves nothing in the collector;** only the backup task's UTC
   hour shifts (R6).
9. **The C: trend** (3.7 GiB in two days, not ours) deserves a look by the
   owner whatever happens to this plan.

## 7. Questions for the owner

1. **May the collector keep two public streams open around the clock — the
   books (top 20) and trades of all 90 markets?** They need no key, sit far
   inside the 50 connections allowed, cost no rate-limit tokens, and download
   about 25 GB a day (about 0.8 TB a month), nearly all of it the books. This
   is IDEAS-REVIEW's question 2 (it named three streams; the measurement
   shows the book already holds the best prices). **Is your internet free of
   a data cap?** *Recommendation:* yes, if there is no cap; with a cap,
   trades only and a book of every market every 10 minutes (§2, S0).
2. **Also record the best-price stream (+2.5 GB of download and 0.39 GB of
   disk a day at the night's rate) and the ticker stream at ten a second
   (+9.8 GB of download)?** [Final review F2: the disk was "0.4–1 GB", the 1
   a guess.]
   *Recommendation:* no — the book holds the best prices at 100 ms, and the
   minute ticker read covers the ticker; both can be added later, though
   what they would have recorded meanwhile is lost.
3. **May the collector read the competition table with
   `include_unqualified=true` (about 48 pages of weight 1) once a day while a
   competition runs and for a week after?** DOCS-SWEEP's question 1.
   *Recommendation:* yes.
4. **Should it read `/v1/info/exchange` every minute (2 tokens)** for the
   maintenance flag and the engine version? DOCS-SWEEP's question 4.
   *Recommendation:* every 5 minutes instead — CloudFront served the reply
   213–446 s old, so a minute's read mostly returns the same copy; 0.4 tokens
   a minute instead of 2 for the same marks, read as a deploy marker up to
   about 12 minutes late; a dropped connection is the live sign. [Final
   review F4: was "yes", every minute.]
5. **Stream files on F:, the last 7 days also on E:?** Older files then have
   one copy, on F:. *Recommendation:* yes; and if you have an external disk,
   a monthly copy of the closed months (your action, about 12–18 GB a month).
6. **Does this yes also allow the first app code and its packages in the
   repository** (an exception to decisions 2026-11-06, "no app code and no
   package installs until the owner approves the v1 plan") **and three
   Windows tasks** (poller, poller check, backup — persistent settings you
   register with a prepared script)? *Recommendation:* yes; the fast track
   (decisions 2026-11-09) already plans the build this week.
7. **Pause the collector's REST reads in polymarket-lab's nightly window
   (02:35–03:50Z), keeping the streams?** *Recommendation:* yes for now — it
   costs a 75-minute hole in the minute reads; v1's poller (alerts) will need
   its own answer.
8. **May the poller start with Windows, outside your session, instead of
   at sign-in** (decided 2026-11-07 for both processes)? *Recommendation:*
   yes — it needs no window and so no launcher, and when Windows Update's
   pause ends (2026-11-18) a night restart costs one minute of recording,
   not the hours until you sign in; you register it once from an elevated
   PowerShell. v1's notifier, which must reach your screen, stays at sign-in.
   [Final review F15: was "keep restarts manual after 2026-11-18?", with a
   start-up task only as the fallback.]
9. **Once the exam lists are frozen (about 2026-11-20), may the collector
   store those accounts' new fills weekly, unread,** as insurance against a
   history route withdrawn before an exam (IDEAS-REVIEW)? *Recommendation:*
   yes — about 0.5 tokens a minute (assumed: about 300 accounts at R6's mean
   of 16.6 fills a day, 100 fills a read of 10 tokens, at least one read an
   account), nothing read by anyone until the exam.
10. **May the collector start recording as soon as part 3 is verified** —
    the streams, the minute reads and the Windows tasks, with the REST
    client already checked by the supervisor — **before the boards, the
    backups and the Final review are done** (§1.8)? Each day without it is a
    day of books, and from part 4 of boards, that no one can record later.
    *Recommendation:* yes. It is watch-only, the streams cost no tokens, the
    REST client is capped at 50 a minute and stops at a 429, and every later
    part ships as a rebuild of the running task. The cost is that it runs
    for a day or two on code the Final review has not yet read.

## 8. For external-apis

New facts, each dated and sourced (UTC; reads from this PC, user agent
`polymarket-follow-research`; W = the evidence folder):

- **2026-11-10, AsyncAPI spec** (`docs/asyncapi-perps.json`, SHA-256
  `685bae5e…`, = DOCS-SWEEP's): `book` = "Order book snapshot updates (top
  20 or, with the ::50 suffix, top 50 levels per side). Pushed every 100ms";
  `tickers` pushed every 100 ms; `statistics` every 1 second; channels
  `bbo::<iid>`, `trades::<iid>` (no `::all`), `book::<iid>(::20|::50)`,
  `tickers::(<iid>|all)`, `statistics::(<iid>|all)`,
  `klines::<iid>::<interval>`; the ping: "Connections are automatically closed
  after 60 seconds of inactivity" (`out/async-updates.txt`).
- **2026-11-10 00:54:51–00:59:52Z, measured, 90 markets**
  (`out/ws-measure.txt`): `book::<iid>` frames every ~100 ms per market
  (9.96 a second) whether or not the book changed (70.2% identical to the
  previous frame), 853 B mean, 20/20 levels in 62% of frames;
  `tickers::all` one frame per market every ~100 ms with `data` an object
  (the spec's example shows an array), 90.1% identical, 211 B, no
  `long_count`/`short_count`; `bbo::<iid>` only on change (0 identical),
  148 B, 0.03–40.5 frames a second per market (median 2.0);
  `statistics::all` about one frame per market every 5.8 s, 1.5 KB;
  `trades` 247 trades in 300 s in 34 markets (227 frames); `book::<iid>::50`
  1,769 B mean. Subscribing to 90 channels in one `sub` message returns 90
  "ok".
- **A best-price subscription sends no first frame:** 17 of 90 markets sent
  one within 1 s of the subscription, 77 within 15 s, the last after 47.8 s;
  59 of 90 went more than 15 s between frames (the longest 120.6 s)
  (`out/offline-analysis.txt` §2).
- **`sq` is the exchange-wide engine sequence,** not a per-connection
  counter: frames of one tick share `sq` and `ts` across channels and
  connections (`tickers::1`, `book::1` and `book::1::50` on three
  connections, `out/ws-samples-smoke.jsonl`); on each connection it rises with
  gaps (`out/ws-measure.txt`). It refines R1's "one growing sequence number
  per connection": gaps in it are normal and do not mean lost frames.
- **The book's first level equals the latest `bbo` at or before its `ts`** in
  99.9% of seconds (17,396 of 17,410).
- **A REST `bbo` reply carries one `timestamp` for all 90 rows** (the
  snapshot's). Against the recorded books, 177 of 180 rows of two replies
  matched a book frame within 200 ms of it; the last frame at or before it
  matched 170; the three misses were SKHYNIX-USD, SNDK-USD and SOXL-USD,
  three of the four markets whose best price changed most often
  (`out/audit-sim.txt`, replies of 00:55:36Z and 00:58:26Z).
- **Top 20 levels:** the thinner side covered $1,000 in 90 of 90 markets,
  $10,000 in 89 (PRL-USD: $4,507), $50,000 in 84 (`out/depth-coverage.txt`).
- **Per-message compression:** the server accepts `permessage-deflate;
  server_no_context_takeover; client_no_context_takeover;
  server_max_window_bits=15`; Node 24.13's built-in WebSocket offers it and
  negotiates it (`ws.extensions`); the handshake passes CloudFront
  (`x-amz-cf-pop: BUD50-P3`, `server: istio-envoy`, `x-pmp-pod:
  gateway-…`), 2026-11-10 01:02:39Z and 01:03:04Z
  (`out/ws-deflate-check.txt`, `out/ws-ext-check.txt`). Each frame deflated
  alone (level 6): book 303 B, ticker 127 B, best price 103 B.
- **Timing:** pong round trip 247–254 ms (70 pongs, five connections);
  receive − `ts` at least 102–103 ms, median 104–106 ms; `ts − ets` median
  1–4 ms; `/v1/info/time` 42 ms ahead of our clock's midpoint at a 300 ms
  round trip (00:58:51Z).
- **Node 24's built-in WebSocket sends a custom user agent** with
  `new WebSocket(url, { headers: { "user-agent": … } })`; its default is
  "node" (local test, `out/ws-ua-local-test.txt`).
- **A trades-only connection** went up to 19.6 s without a frame at 00:55Z.
- **CloudFront ages:** `exchange` 364 s (00:51:52Z) and 213 s (00:59:21Z),
  `instruments` 446 s, despite `cache-control: public, max-age=0`; `tickers`
  1 s (`max-age=2`); competition, leaderboard and stock-splits reads were
  misses (`out/rest-calls.jsonl`).
- **Leaderboard pages** of the day/pnl board read 2.3 s apart (00:57:23–30Z)
  carried snapshot stamps 1794272237289, …316, …551, …492 (262 ms apart,
  not in page order); `total` 6,096; 22.1–23.3 KB a page.
- **The competition table** with `include_unqualified=true`: `total` 4,746 at
  00:56:07Z (`updated_at` 5 s earlier); 39,086 bytes a page of 100; reply
  keys `competition_id, cohort, status, updated_at, next_update_at, total,
  offset, final_results, entries`; the spec: disqualified and under-review
  accounts are never listed.
- **`stock-splits`** 00:56:21Z: `{"events":[],"sequence":101655028994}`.
- **REST `tickers`:** 24,539 bytes for 90 rows; keys `instrument_id, symbol,
  index_price, mark_price, last_price, mid_price, open_interest, long_count,
  short_count, funding_rate, next_funding, timestamp`; no `pricing_status`.

## Evidence list

In W (`E:\coding\Claude\supervisor\polymarket-follow\workers\COLLECTOR-PLAN\`):
- **Scripts** (`scripts/`): `dl-docs.mjs`, `dl-one.mjs` (docs host only),
  `async-inspect.cjs`, `async-updates.cjs` (the AsyncAPI spec), `lib-rest.mjs`
  (the one REST client: admission, 429 stop, nightly window, `/v1/info/`
  only), `rest1.mjs`, `ws-ua-local-test.mjs` (127.0.0.1 only),
  `ws-measure.mjs` (the five connections, the variants, the REST inside the
  run), `ws-deflate-check.mjs`, `ws-ext-check.mjs`, `offline-analysis.mjs`,
  `depth-coverage.mjs`, `audit-sim.mjs` (the price audit on the capture),
  `cpu-bench.mjs` (Brotli and parsing costs), `rest-budget-check.cjs`,
  `disk-free.mjs`, `save-page.mjs` (Microsoft's VBScript page).
- **Outputs** (`out/`): `ws-measure.txt` and `ws-main-stdout.txt` (the 300 s
  run), `ws-smoke.txt` and `ws-smoke-stdout.txt` (the 15 s run),
  `ws-samples.jsonl` and `ws-samples-smoke.jsonl` (the first frames of each
  kind), `ws-events.log` (the trades connection's silences),
  `offline-analysis.txt`, `depth-coverage.txt`, `audit-sim.txt`,
  `cpu-bench.txt`, `ws-deflate-check.txt`, `ws-ext-check.txt`,
  `ws-ua-local-test.txt`, `launcher-facts.txt`, `ms-vbscript-page.txt`,
  `task-facts.txt`, `light-options.txt`, `rest-size-bound.txt`,
  `async-inspect.txt`, `async-updates.txt`, `rest1.txt`, `rest-calls.jsonl`
  (every REST call), `rest-budget-check.txt`, `disk-free.txt`,
  `dl-docs.txt`.
- **Raw replies** (`raw/`): time, instruments, exchange, tickers, bbo (three),
  competitions, competition, the competition table's first page,
  stock-splits, four leaderboard pages.
- **Docs as downloaded** (`docs/`, with `fetch-log.jsonl`), and Microsoft's
  VBScript deprecation page (`docs/ms-vbscript-deprecation.html`, 01:31:03Z).
- **Log:** `progress.md`.

## My own self-review, before the hand-back

Made between the first full plan (`fe1fcc1`, 01:22Z) and the hand-back, in
commits `6ba4687` and `c20d747` and the last one; nothing in the brief's
eight decisions was reversed.
- **The price audit's line** was "at least 99%"; a simulation on the capture
  gives 177 of 180 rows within 200 ms, the misses all in the fastest markets,
  so the line is 97% with every miss explained by timing.
- **Compression and parsing costs** were unstated; measured offline: Brotli
  1.7 s of CPU an hour, run in the thread pool (13 ms of loop delay); book
  parsing about 1% of a core.
- **Added:** the frozen-source checks (a stale or unchanged board; no book
  moving for 5 minutes); IDEAS-REVIEW's four "done when" lines mapped; the
  market list unreadable at start.
- **The build order:** the Windows part moved from fifth to third, so that
  recording can start early (question 10, new).
- **The launcher:** R4's `.vbs` replaced by a windowless launcher compiled by
  Windows' own `csc.exe` — VBScript is to be off by default around 2027
  (Microsoft's page saved, the sentence found verbatim).
- **The run copy:** the task runs a deployed copy outside the working tree,
  its state beside it, so a build in progress is never what a restart runs.
- **The blind store:** every check of the collector prints counts and
  shapes, never values (A.0-11's "by no one"); this plan's own post-cut
  reads disclosed (§1.3, items 7 and 8).
- **Corrected:** eight build parts, not seven; part 1 must cross an hour's
  end; the weekly restore test rebuilds the universe from every day's
  replies, not one day's; `sq` "refines", not "supersedes", R1's wording;
  the scratch capture is 88 MB, not "about 130"; the evidence list named a
  log file that does not exist.
- **Not re-checked by anyone but me:** every estimate marked "est." (the TLS
  overhead, busy-hour trades, the REST replies' compressed size, the weekly
  fills' tokens) and the design choices of §1.4 that only part 3 can prove
  (no window, no admin needed). A fresh reader should start there.

## Final review (2026-11-10, the owner's request; by COLLECTOR-PLAN itself)

Scope: this plan's "code" — its measurements, its numbers and its design —
read for what the owner asked (dead or unused parts, needless fallbacks,
wrong names, repetition, simplicity, fit for the next phases) and for the
supervisor's five points. Started 2026-11-10 02:35Z, inside polymarket-lab's
nightly window, so no API or WebSocket call before 03:50Z; new figures come
from the capture already held (W `out/light-options.txt`,
`out/rest-size-bound.txt`). **Findings first; each fix is its own commit,
marked in place `[Final review Fn: …]`; the commits are listed at the end.**

**How satisfied am I?** The measurements hold and the eight decisions stand.
What is weak: the download — the figure the owner's first question rests on —
was given as one number without its method or range, and no lighter option
was priced; several "est." figures had no inputs, and one was ten times too
high; the first version carried about ten parts nobody uses before v1; one
recommendation (`exchange` every minute) buys almost nothing; one program had
two names; and the plan repeats itself.

**Severity 1 — wrong or misleading, could steer a decision**

| # | Finding | Fix (commit) |
|---|---|---|
| F1 | **The download is given as one number.** "About 25 GB a day" is an estimate: each captured frame re-compressed alone at deflate level 6 (the server's level is unknown; level 1 adds 7%), plus TLS and framing "1–3 GB, not measured", which leaves out the packets' own headers (up to about 5 GB a day if each frame travels alone). And the owner gets no lighter option with its download — only "trades and REST books". | pending |
| F2 | **"est." figures without inputs, one of them wrong.** Busy-hour trades "0.01–0.02 GB a day" has no basis: 35 B a trade frame compressed (227 frames) at the night's rate gives about 2 MB a day, 23 MB if trading were ten times busier all day. REST replies "a few MB": the measured bound is 7.4 MB. The competition's "0.6 GB a year" assumes a competition always running and R6's modelled ratio, unsaid. The universe's "tens of thousands" is a guess. The best-price option's "0.4–1 GB of disk": the 1 is a guess. | pending |
| F3 | **The first version is bigger than what works.** Parts nobody reads before v1, or that repeat another: the collections `collector_state`, `health_events`, `api_usage_minute`, `api_usage_hour`, `unknown_keys`, `rejected` (the rejected files hold the same) and `exchange_stats` (the route serves any past window up to 31 days — re-readable, not "now only"); the hourly tape audit (it guards a partial stall nobody has seen, of a stream whose content can be read back); the `/v1/info/time` reads (the books' own timing watches the clock for free); the check task's notification (R4's banner is unverified; notices are v1's notifier's); the command that loads boards from files after a database outage (the files keep them either way); the universe rebuilt from files in the restore test; the "no book changed in 5 minutes" watch (the per-market stall check covers a dead stream). | pending |
| F4 | **Question 4 buys almost nothing.** It recommends `exchange` every minute, but CloudFront served that reply 213–446 s old: a minute's read mostly returns the same cached copy. Every 5 minutes gives the same marks for 0.4 tokens a minute instead of 2 — two fifths of the collector's whole average. | pending |
| F15 | *Found while fixing F3.* **The launcher is now needless, and so is the wait for a sign-in.** With the check's notification cut, neither task needs the owner's desktop. A task that runs "whether the user is logged on or not" without a stored password (S4U) has no window at all — so no launcher, compiled or `.vbs` — and with a start-up trigger it also records through a night restart by Windows Update (paused only to 2026-11-18), the risk question 8 asked about. This account is an administrator and already runs the lab's worker as a start-up, outside-the-session task (`out/task-facts.txt`). It changes the default decided 2026-11-07 (at sign-in) for the poller only; v1's notifier stays at sign-in. | pending |

**Severity 2 — evidence or wording that does not carry its weight**

| # | Finding | Fix (commit) |
|---|---|---|
| F5 | **The deviations from CLAUDE.md's Stack and from decided practice are scattered** over §1.2, §1.4 and §1.6, and some are missing: raw replies kept beside parsed records (R6, decided: "parsed records, not raw replies"); Brotli files; Node's own `.env` reader instead of the lab's dotenv; CI on Node 24 instead of the lab's Node 22 floor; a C# source file and PowerShell scripts in a TypeScript repository. | pending |
| F6 | **The summary's ten questions** put the question first and the recommendation last, several over two lines; the "one page" runs well past a page. | pending |
| F7 | **One program, two names:** `apps/poller` and the run copy `…\poller\`, but the task "polymarket-follow collector", `collector-check.ps1`, `collector_state` and `F:\polymarket-follow\collector\`. Registered tasks and data folders outlive C1 and are costly to rename once v1 runs. | pending |
| F8 | **One fact, several homes:** the book-against-best-price 99.9% three times; Brotli's 3.2 four times; the CloudFront ages three times; the C: trend three times; §3 restates six decisions and §6 four; §5 keeps an unknown about a channel the plan does not use (statistics' cadence). | pending |
| F9 | **A list that shifts while it is paged** — a board refreshing mid-pass; the competition table grew from 4,738 to 4,746 accounts in an hour — can repeat a row on two pages or skip one; no rule is named. | pending |

**Severity 3 — notes, mostly for the next phases**

| # | Finding | Fix (commit) |
|---|---|---|
| F10 | Reading one market at one instant means decompressing a whole hour's all-market file (about 190 MB of text); an exam over a thousand distinct hours spends minutes on it. Unsaid for the research kit. | pending |
| F11 | Three things v1 will build on are not named as interfaces: the heartbeat file's fields (v1's notifier reads it), the latest book per market held in memory (v1's paper log prices from it), the files' line format (the kit and the exams read it). | pending |
| F12 | The universe keeps an overall first and last seen beside each source's first and last date; the first two follow from the rest. | pending |
| F13 | The four account-value boards may largely repeat one ranking (account value is current equity; the window only decides who is eligible): perhaps 200 tokens a day for one list. Unmeasured. | pending |
| F14 | Small figures: an "18-minute" board read in the summary against "about 17.5" in §1.1; the weekly fills' "about 0.5 tokens a minute" is 0.6 by its own inputs (at least two reads a week for an account's 116 fills); Brotli files need a reader (Node's zlib; Python needs a package). | pending |
