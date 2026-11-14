# WAVE-H-PLAN-REVIEW — the fresh review of WAVE-H's plan, before the owner approves it and before the download starts

WAVE-H-PLAN-REVIEW (Sonnet 5.5, max, a different model from the plan's Opus),
2026-11-14, started 00:34Z (UTC; every stamp from `date -u`; the last one is in
`progress.md`), for polymarket-follow's supervisor. The plan under review is
`docs/reviews/wave-h-plan-2026-11-13.md` (`22a4757`); the model of this review
is `docs/reviews/market-plan-review-2026-11-13.md`. Evidence: the supervisor
folder `workers/WAVE-H-PLAN-REVIEW/` (`progress.md`, `requests.tsv`,
`scripts\`, `out\`; names below are relative to it). **A review decides
nothing:** the supervisor and the owner answer; the plan was not edited.

**Conduct.**
- *Never opened:* the collector's recordings and database, the run folder
  (the heartbeat is judged from the code), the paper experiment's `fills`,
  `raw`, `state.json` and `page`, and MARKET-1's folder. One directory listing
  of `F:\polymarket-follow\paper\` (entry names only) was made at the start;
  nothing in it was opened. No call to Polymarket's API.
- *Read, all before the cut:* the seed (copied once, 1,602 account files and
  the manifest) and R8's captured tape (copied once, 80 files). The planner's
  `progress.md`, `requests.tsv`, `scripts\` and `out\` were read; its brief and
  transcript were not.
- *Network, one at a time, at least 1.5 s apart, `research-check/1.0`:* 4 of
  the 10 allowed `/info` reads and 2 of the 20 allowed AWS listings (both of
  2025-07-27, a sizing day), no download, no file or listing of 2025-08-01 →
  2026-05-28; and two documentation pages through WebFetch (Hyperliquid's
  rate-limit page and its fee page). Every request is in `requests.tsv`.
- *One disclosure:* the liquidator vault's `userFills` (read 2) returns the
  2,000 newest fills, here 2026-05-18 → 2026-08-22, so it carried records
  stamped inside the span the brief seals for files (2026-05-18 → 05-27). I took
  from it the two fills that carry a backstop mark (both August 2026) and one
  count (2 marked fills in all 2,000); I read no price or other count from the
  part inside the span. The reply is deleted and is not in `out\`.
- *Local tests:* small Node programs in my scratchpad rename and read a file
  there (D1 below). Nothing was written to the repository but this file; no agent
  started; polymarket-lab not touched.

## For the owner, in one page

*Words.* A **backstop** is a liquidation the exchange could not sell into the
book in time, so its own vault takes the position over. A **slice** is a fixed
share of all Hyperliquid accounts, chosen by the digits of the address. The
**heartbeat** is the small file the collector rewrites every 10 seconds to say
it is alive. The **seal** means the test months are downloaded and not opened
until the rules are frozen.

**Answer 1 — the download: safe after these changes.** What the plan sets is
right: 2 MB/s on a line that carried 7 MB/s, a first session of the sizing
months only, pauses in the other programs' windows, a hash of every file, a
watch on the collector, and the test months stored unopened. What is missing
is in the watch and in how the tool runs. Eight changes, all small, all in the
tool's specification (D1–D8 below):
1. The watch reads the heartbeat's file time with a stat, which cannot disturb
   the collector (measured here: 0 failures in 515 renames), and its content
   rarely; a failed read counts as "no reading"; a fault in the watch stops
   the download.
2. Rule (b) is measured against the heartbeat's own time; the price audit
   joins the watch (it is a condition you named); after a pause the rate stays
   halved until the supervisor says.
3. The tool says how it runs: low priority (the collector itself runs below
   normal today), one instance, a stop file, started so that it outlives a
   session.
4. Caps: a total-bytes cap, a free-space floor on F:, every file of the tool on
   F: (E: has 17.9 GB free).
5. The funding windows do not straddle 2025-08-01 or the data's end, and are
   spaced 6 seconds.
6. Errors and restarts are specified.
7. Stay at 2 MB/s; no automatic step to 4.
8. The daily check is a light after-the-fact read of closed days, not an input
   of the tool.

**Answer 2 — the plan: approvable after these fixes.** It is a careful plan
and faithful to MARKET-1. Nothing changes its design, its data, its deciding
line, its statistic or its budget. Four medium fixes and six small ones (R1–R10
below), all wording, tests or prints:
- pin two time conventions the rules leave open (a minute's mark, a funding
  row's hour);
- keep a backstop vault's trades out of the tape price, and measure the tape
  against the book in the rehearsal before you decide question 4;
- add a guard against a silent hole or a changed format in the fills;
- test the code's import closure, because the code imports MARKET-1's frozen
  files.

**The backstop claim, recounted: right.** On the pre-cut seed, all 295
liquidation fills with order id "0" are `taker` true with fee 0; MARKET-1 counts
32 of them among its 727 small-coin fills (695 + 32); each of the 295 has one
counterparty leg in the seed, order id 0, `taker` false, held by only two
accounts. Of the 153 old entries, 3 are themselves backstop legs: without them
the old weeks give 150. I also read a second Hyperliquid example (the plan had
one, WAVE-CHECKS' K2, and none in its sizing days): the liquidated account's own
backstop fill carries the liquidation mark with its own address, `crossed` false
and fee 0, so the plan's "or backstop" branch can fire.

**What the test can show.** The plan's page-one table comes out the same from
its own error (41 bps): a true +150 gives "holds" about 85 times in 100, +100
about 44, the old weeks' +297 nearly always; with nothing there "does not
hold" comes 9 times in 100 and "not settled" otherwise, with a sentence that
then rules out about +107. So the test tells apart "the old weeks' size is
there" from "much smaller", and cannot tell 0 from +100. Read "not settled" as
"no answer", not as "no effect".

**Your decisions** (the plan's ten questions; my answers in one word, reasons
in "The ten questions"): 1 yes · 2 yes · 3 yes · 4 yes, after R2 · 5 yes · 6
yes · 7 yes, after D1–D8 · 8 yes · 9 not yet · 10 yes.

---

## Your questions, answered

| The brief asked | Answer | Where |
|---|---|---|
| Is the read of `heartbeat.json` every 30 s safe? Less often, or the file's time alone? | Safe: at most a few failed beats in two days, each a warn line and a 10 s retry, never near the 2-minute restart. Better: the file's time by stat (cannot block a rename), the content once a minute at most | D1 |
| Is the daily check's reading of `coverage.jsonl` needed, given MARKET-1's own record? | Not for safety: the heartbeat already carries the signals live. Keep a light read of closed days as an audit | D8 |
| Is 2 MB/s, rising to 4, safe against 7 MB/s and the collector's flow? | 2 yes; 4 is safe enough but buys about a day on a path with two weeks of slack: drop it. The collector's flow is about 0.3 MB/s, not 0.8 | D7 |
| Resumability, guards, errors | Sound in outline; the order of writes, the error classes and the guards' details are unsaid | D6, D4, D5 |
| The mapping, the counted fill, the slices, the prices, the verdict, the crash day, the seal, the code's home, the rehearsal, the risks | Faithful; fixes R1–R10 | Answer 2 |
| The ten questions | One line each | "The ten questions" |

## Answer 1 — the download

### What I judged, item by item

| Item (plan section) | My reading |
|---|---|
| The data and the date guards (3.1, 3.5) | Right. Four prefixes, nothing before 2025-05-25 or at or after the data's end; every rule's input is in the table (fills, minute marks, settled funding, the books later); the sizes add to 223 GB; the 7,200 test hour files and the 360 hole hours (5.0%: 13 + 144 + 11 + 192) follow from the plan's own dates. One gap: the funding windows (D5) |
| The store on F: (3.2) | Right. F: has 1,551.4 GB free (2026-11-14), the recordings' guard warns at 50 GiB. Logs and temp files must be on F: too; E: has 17.9 GB free, C: 35.5 (D4) |
| Checksums (3.3) | Right: size against the listing, MD5 against a single-part ETag, SHA-256 in a manifest, a re-hash at every read. All 25 keys I listed on 2025-07-27 are single-part (32 hex digits; LastModified 2026-11-03 15:11–15:12Z) |
| The rate cap (3.5) | 2 MB/s safe; the step to 4 unneeded (D7) |
| The pauses (3.5) | Sound and conservative. The paper run starts 04:00Z but lasts to 09:18Z on a normal Monday and 12:08Z at worst (MARKET-PLAN-REVIEW F2), so the 02:30–06:00Z window covers its start, not its run; that is fine, the download cannot harm the paper run any more than the collector, and the watch protects both. Do not widen it |
| The watch (3.5) | The right signals; the reading method and two rules need change (D1, D2) |
| The collector's safety | The stakes: a gap in the recordings cannot be re-recorded; MARKET-1 prices a leg in a gap at the mark, and above 10% of its positions not priced at the book it withholds its verdict. Harm would need the download to delay the collector's frames or replies by seconds, or to starve it of CPU or disk. At 2 MB/s the line carries 29% of what one stream reached; the collector's own inflow is 24–31 GB a day, 2.3–2.9 Mbit/s (collector plan), about 0.3 MB/s on the wire; the throttle (the planner's per-chunk delay with back-pressure) kept 1.9 MB/s over 1.56 GB on 2026-11-14; the file work is hashing at 2 MB/s; and a late frame is not a wrong frame, since the collector stamps by the server's `ts` and MARKET-1 reads by `ts`. The open point is CPU priority (D3) |
| The daily check (3.5) | D8 |
| Resumability, guards, errors (3.5) | D6 |
| The seal (3.6) | Holds: the tool hashes bytes and parses nothing, the freeze lists the hashes, every reader refuses a path dated from 2025-08-01 before it opens it. Two small leaks, closed by D5 (a funding window that straddles the seal) and R5 (SIZING read by record time, not by file). The plan's use of day sizes (the crash day is the largest) is listing metadata: no price, no outcome |

### The changes, exactly

**D1 (medium). The watch's reads** (3.5, "The watch": every 30 s, `heartbeat.json`).
- *Finding.* The plan does not say how the file is read. The collector writes
  `heartbeat.json.tmp` and renames it over `heartbeat.json` every 10 s; the
  write is in a try/catch that logs "heartbeat not written; next try in 10 s"
  (`src/health/heartbeat.ts`, `startHeartbeat`). The check task reads only the
  file's time (`tools/poller-check.ps1`, `LastWriteTimeUtc`) and restarts at 2
  minutes (`src/lock.ts`, `STALE_HEARTBEAT_MS`).
- *Measured on this PC, 2026-11-14 (Node 24.13.0, scratchpad, a writer renaming
  a 3.5 KB file over its target, a reader in another process; `scripts\rename-*.mjs`).*
  A reader that only stats the file, 835,798 calls in 8 s, made 0 of 515 renames
  fail. A reader of the content in a loop made 456 of 514 fail (88.7%; MARKET-PLAN-REVIEW
  F2 got 88%). The same writer alone: 0 of 669. One content read holds the file
  about 0.55 ms (mean; 99th percentile 0.85 ms).
- *What that means at 30 s.* A single read meets a rename with a chance of the
  order of 1e-5 to 1e-3. (In my accelerated runs both programs woke 64 times a
  second, one per 15.6 ms system tick, and 20–26% of renames failed against a
  duty of 3.5%, which I take to be the two programs' work landing after the same
  tick; so I give the exposure as a range, not a point.) That is 0.1 to 5 failed
  beats in two days. A failed beat costs a warn line and 10 s; a restart needs
  twelve in a row. **The frequency is not a danger; the method can still be
  better for nothing.**
- *Fix.* The age (rule c) from the file's time with `fs.statSync`, as often as
  wanted (every 5 s is free). The content (rules a, b and the audit) with one
  `readFileSync`, at most once a minute, taken right after the file's time has
  moved (the next rename is then about 9 s away) and not at a multiple of 10 s.
  A read that fails (EPERM, EBUSY, ENOENT, a parse error) is "no reading", tried
  once more after 1 s; three in a row (about 3 minutes) pause the download. Any
  exception in the watch pauses it (fail closed: the watch lives in the tool's
  own process, so a dead watch cannot leave a running download). Every reading is
  logged (time, clock offset, each connection's quiet time, the audit, the
  stall and REST counters) to a file on F:.

**D2 (medium). The watch's rules** (3.5, rules a–c; the owner's condition in
decisions 2026-11-13, "WAVE-H's download — the owner's advance approval").
- *(b) as worded* ("`lastFrameAt` more than 15 s old") reads naturally against
  the watch's clock. The heartbeat is up to 10 s old, and 20 s old after one
  failed beat (which a read can cause), so the margin is 5 s at best and a false
  pause follows one missed beat. **Fix:** `heartbeat.time − lastFrameAt > 15 s`, or
  `open` false, or `lastFrameAt` null, exactly the collector's own rule
  (`src/health/status.ts`, `statusLines`, with `SILENCE_MS`).
- *(a)* `clock.minOffsetMs` above 400 ms: keep. It includes our clock's offset
  to the server's (+24 ms on 2026-11-06), so log the day's median beside it; if
  a clock step moves the baseline by 300 ms the supervisor re-sets the number.
- *The price audit is a named condition* ("the price audit's timing misses")
  but only in the next morning's check. The heartbeat carries it live (`audit`:
  `rows`, `agree`, `timingMiss`, `otherMiss`, `noBook`, every 10 minutes,
  `src/jobs/price-audit.ts`). **Fix:** pause when `agree` is below 90% of `rows`
  (the collector plan's bar is 97%); log every audit and the cumulative
  `streams.stalls`, `streams.stalledMarkets`, `rest.timeouts`, `rest.network`
  (no threshold: the daily comparison reads the log).
- *After a pause* "half the rate" must stay halved until the supervisor says
  (a rate file the tool reads), and "stops the day's download" must say until
  whom restarts it.

**D3 (medium). The runner** (3.5; section 7: "the downloads start at once and
run in the background for about two days").
- *Finding.* Nothing says who starts the tool, how it outlives its session, how
  it is stopped, or at what priority it runs. The code rules say every
  background process a session starts is stopped before it reports. The
  collector's task runs at Task Scheduler's below-normal 7 until the owner's
  re-registration (per the architecture file; I could not read the run folder or
  the task), so a normal-priority tool would outrank the recorder on a busy PC;
  the 2026-11-11 book stalls were this PC's, not the server's.
- *Fix.* The tool sets its own priority below normal or idle at start
  (`os.setPriority`); holds one instance (the lock pattern: a lock file with the
  pid); checks a stop file before every request and every 64 KB; writes a pid
  file; is started detached from the session's shell (and the first session
  proves that it survives the session's end) or as a task the owner registers;
  decisions record the exemption from the background-process rule for it; the
  supervisor's morning check says whether it is alive.

**D4 (medium). Caps and disks** (3.2, 3.5).
- *Finding.* The plan sizes the disk ("225 GB of 1,551.6 GB, no conflict") but
  the tool has no guard. The recordings cannot be read again, and their guard
  stops the book and trade lines at 10 GiB free.
- *Fix.* A total-bytes cap from the listing's sizes plus 2%, refusing any write
  beyond it; a free-space floor on F: of 200 GiB (four times the collector's
  warning); every file the tool writes (store, manifest, watch log, error log,
  temp) on F:, none on E: (17.9 GB free of 207, 92% used) or C: (35.5 GB).

**D5 (medium). The funding windows** (3.5: "fixed 20-day windows", 19 a coin).
- *Finding.* Windows of 20 days from 2025-05-25 start on 05-25, 06-14, 07-04 and
  07-24; the fourth runs to 08-13, so a file dated in the sizing months holds 12
  days of the sealed months, and the rehearsal (gate closed) would parse them.
  The last of 19 starts on 2026-05-20 and runs to 06-09, past the data's end,
  against the plan's own date guard.
- *Measured.* One window of exactly 20 days (SOL, [2025-06-14, 2025-07-04)) came
  back as 480 hourly rows, 43,018 B, stamped 00:00:00.047Z … 23:00:00.069Z, no gap,
  no duplicate. A coin before its listing (USELESS, same window) answers HTTP
  200 and `[]` (2 bytes). Hyperliquid's page (read 2026-11-14): 1,200 weight a
  minute per IP, 20 for an info request, plus 1 per 20 items for
  `fundingHistory`, so a full window weighs 44 and the plan's 4.4 s spacing is
  600 a minute, exactly half.
- *Fix.* Windows aligned to the seal: [05-25, 06-14), [06-14, 07-04), [07-04,
  07-24), [07-24, 08-01), then from 2025-08-01 in steps of 20 days to 2026-05-28
  and a last one to the data's end: 20 windows a coin, 760 reads. Spacing at
  least 6 s (76 minutes in all, at worst 440 weight a minute, 37% of the limit).
  `[]` is a valid reply, stored like the rest.

**D6 (low). Errors and restarts** (3.5: "after an error it waits 30 s, 2 min,
10 min, then stops for the day").
- *Order of writes:* `<name>.part`, compare its bytes with the listing's size,
  hash, rename (retry 10 times a second apart, as MARKET-1's writes do: on this
  PC another process holding a file open makes a rename fail), then append the
  manifest line. At start every `.part` is deleted, a torn last manifest line is
  ignored, and a file present without its line is re-hashed, not fetched again.
- *Classes:* a network error, a read with no byte for 60 s, a 5xx, a 429 or
  `SlowDown`: the plan's back-off. A body that disagrees with the listing (size,
  or MD5 against a single-part ETag): fetch once more, then record "bad" and go
  on; a bad test file blocks the look, so the supervisor reads the list of bad
  keys each morning. A 403 or 404: record "missing" and go on. A redirect or any
  URL outside the guard: the tool aborts.
- *Every listing entry is validated* before it enters the key plan (the key
  under a guarded prefix and shaped `<date>/<hour>.lz4`, the size a positive
  integer, the ETag's shape): Iron Rule 3 applies to the listing too.
- *Tests* beyond the plan's: kill the process in the middle of a file and
  restart (the store ends byte-identical to an uninterrupted run); a reader
  holds `heartbeat.json` while the writer renames it (no pause).

**D7 (low). The rate** (3.5).
- 2 MB/s is safe on every measure I have: the line carried 7 MB/s for one
  stream (13.7 MB in 2 s, planner's N17), so the cap is at most 29% of its
  floor and 4 MB/s at most 57%; the collector's inflow is 0.3 MB/s on the wire
  (24–31 GB a day, collector plan), so the plan's 0.8 MB/s is a 3× over-estimate
  and conservative; the harm channel is latency, which the watch sees. The
  planner's own download was a free pilot: 1.56 GB at 1.9 MB/s over 14 minutes
  (2026-11-14 00:07:45–00:21:24Z); the collector's price audit runs at 07:50 past
  every 10 minutes, so two fall in it (00:07:50Z at its start, 00:17:50Z in its
  middle). **The supervisor can read those two audits and the coverage events of
  that quarter hour before day one; I could not (outside my limits).** It also
  fell across the collector's day roll and its 00:20Z daily reads, so a
  disturbance there is not proof of the download.
  The pilot ran without a watch: evidence, not a precedent.
- *Fix.* Stay at 2 MB/s throughout. The step to 4 saves about a day (223 GB in
  about 1.6 days at 2, 0.8 at 4, with the 4.3 pause hours a day) on a path where
  the test months are not needed until the freeze, about two weeks later. If the
  owner wants it, it is a decisions line after the first day's watch log, not an
  automatic rule.

**D8 (low). The daily check** (3.5, question 7).
- *Not needed for safety:* the heartbeat carries the audit, the stall counters,
  the REST counters, the connections and the clock live (D2). *Useful as an
  audit,* and it is the baseline of "the three days before", which only the
  poller log and the closed days' coverage hold. MARKET-1's record is no
  substitute: it keeps each closed day's coverage events in `days\<date>.json`
  (written at its 10:30Z run on the day after) but alarms only on a day whose book
  lines fail its schema or whose coverage cannot be read, never on a gap, and the
  closed day itself is readable from shortly after 00:00Z.
- *Fix.* The supervisor's own read-only script, not the tool: closed days only
  (a `manifest.json` present, so nothing more is appended), read with Node's
  `fs` or PowerShell's `Get-Content`, never .NET's `File.ReadAll*` or
  `OpenRead` (they deny writers; the collector's `appendFileSync` would fail and
  log "coverage line not written", losing that event). The chance is about one
  in a million per read; the rule costs nothing. `node dist\status.js` already
  prints today's event counts from the same file.

### Before the first byte

1. The supervisor reads `tools/waveh-fetch.cjs` against D1–D8 (about 300 lines;
   the only network code of WAVE-H, running unattended against a live recorder).
2. The first session is the sizing months only (35 GB, about 5 hours), as the
   plan has it, with the watch logging; in it, kill the tool in a file and
   restart it.
3. Then the supervisor's check of the collector's day (the planner's pilot
   quarter hour first), then the test months.

## Answer 2 — the plan

### What I judged, item by item

| Item | My reading |
|---|---|
| The mapping, field by field (2.1) | All seventeen rows equal MARKET-1's `rules.md` (M2–M12); every deliberate change is named (the pool, M8's fallback, the fee, the z, the words). Every symbol the plan imports is already exported by a frozen file (`waveEntries`, `episodes`, `accountsAt`, `Liq`, `byM4`, `toBook`, `usable`, `walkOpen`, `walkClose`, `twoWay`, `baseOf`, `blockOf`): no frozen file needs an edit. The kit's `marketFrom` accepts Hyperliquid-shaped input (its only date guard is "ends at or before the Polymarket cut", true here); H10's BASE is `baseOf`'s formula exactly |
| The counted fill (2.2) | Right, and recounted (section below). I added a second Hyperliquid example of the point the plan had least evidence for: the own backstop fill carries the mark |
| The slices (2.3, H5, H6) | Sound. The error budget is spent once: slice 0 is the only deciding set, named by its index before any count of its own; M comes from counts of the sizing months by a fixed rule; every slice, M halved, doubled, by month, the pooled reading, the crash-day variants are printed beside and never change the verdict; z is applied once to each side |
| Prices (2.4, H8, H9) | The book walk is MARKET-1's; the 10 s liveness suits a snapshot every 0.54 s; the tape fallback is honest in outline (R2); 4.5 bps is the base tier on Hyperliquid's own page (read 2026-11-14: taker 0.045%, maker 0.015%, no date on the page) and the most any taker paid on three sizing days (planner's S1); funding is settled, by the kit's `fundingBetween` (R1) |
| The verdict (H12) | Same order as M11 (WITHHELD, TOO FEW, the "no" before the "yes"); the one change, NOT SETTLED where M11 says TOO FEW, is deliberate and explained. The page-one table reproduces (question 5) |
| The crash day (H13) | Right to keep it in and print it apart; the choice is the one made without looking at the data |
| The seal in code (3.6) | Right. Add: a path without a parseable date is refused (fail closed), the downloader never imports a reader, and R5 |
| Where the code lives (4) | A fourth entry point is the simplest honest shape. What it means for the frozen files: R4 |
| The rehearsal and the reproduction (5) | Good: counts and mechanics only, outcomes computed but sealed and hashed. The reproduction tests MARKET-1's `isForced` on Polymarket's rows, not H4's Hyperliquid mapping: add R8 |
| The risks (6) | Complete for what the plan saw. Missing: a silent hole or a changed format (R3), the two time conventions (R1), the tape's backstop prices (R2), the code coupling (R4), the tool's own running (D3), E:'s space (D4) |

### The fixes

**R1 (medium). Pin two time conventions** (H9, H10).
- *H10* says a minute's mark is the `mark_px` of "the row stamped at a minute's
  end". The day files' rows are stamped at minute starts, 00:00:00 … 23:59:00,
  1,440 a coin (planner's `shape-ctxs`), so there is no row stamped at a
  minute's end. The mark at the end of minute [m, m + 1 min) is either the row
  stamped m + 1 min (the last minute of a day then takes the next file's first
  row) or the row stamped m. The two differ by under a minute of price; either is
  fine; **the rule must say which and a test must pin it**, because `marks[]`,
  BASE's `j + 1,440` and `fundingBetween`'s "mark at the end of the minute
  before the hour" all lean on it.
- *H9* says nothing on a funding row's nominal hour. The rows come stamped
  17–69 ms after the hour (planner's .017Z on 2025-07-15; my .047Z on 2025-06-14
  and .069Z on 2025-07-03); the kit's `marketFrom` wants the nominal hour in column
  0 and the stamp
  in column 2. **Fix:** the nominal hour is the stamp rounded to the nearest
  hour (not floored: a stamp a few ms early would fall in the wrong hour).

**R2 (medium). The tape fallback** (H8, 2.4; question 4).
- *Backstop legs.* A backstop's vault leg is `crossed` true, so it enters "the
  records with `crossed` true on our side", but its price is the engine's, not the
  book's: in my read of 2026-08-19 (PURR) the liquidated account's backstop fill
  was at 0.11993 while its market-method fills 10–13 s earlier were at
  0.11778–0.11806. **Fix:** leave out of the tape walk every record carrying a
  `liquidation` object with `method` "backstop".
- *Order.* H8 says the tape is "walked as levels by the same functions" after
  "M4's order". The walk is then a time-ordered sweep (the first $1,000 of
  same-side takers after x), not a price-sorted book. That is the plan's intent
  ("what the takers on our side actually paid from x on"); say it in the rule.
- *Measure it before the owner rules on question 4.* Add to the rehearsal's
  allowed prints, counts only: for sizing legs that have both a book price and a
  tape price, the signed difference tape − book in bps of the price, by side
  (count, median, 10th and 90th percentile). It is not a position's outcome (no
  gross, no net), and it turns "counted as priced" from an argument into a number.

**R3 (medium). A guard against silent holes and changed formats** (H2, H15, 6).
- *Finding.* The plan stops the look for a missing, differing or undecodable file
  and for a day with more than 1% bad records. An intact but short file passes: my
  own listing shows the shape, `node_fills_by_block` 2025-07-27 hour 8 is 1.5 MB
  beside 12.7 MB (`node_fills`, same hour) and 18.1 MB (hour 9). A changed
  meaning (the `liquidation` object missing for two months, `startPosition`
  changing sense) also passes, and would read as "no waves". MARKET-1 has the
  analogue (F18: print the pool's liquidation fills by week).
- *Fix.* (i) Before the freeze, from sizes only (nothing opened): the tool prints
  every fills hour file under 30% of the median of its 24 neighbours; the
  freeze review reads that list. (ii) At step 1 of the look, before any book is
  fetched and before any price exists: print the counted fills and own legs by
  month and method, the slice's episodes a day by month, and, if the block
  numbers of `node_fills_by_block` are consecutive (one sizing hour shows it; the
  plan did not check), the missing blocks by day. (iii) H0
  says that a data defect found there is a defect fix (a decisions entry, a new
  list) made before step 2, as no outcome has been seen. (iv) H2's "stops the
  look" names that route.

**R4 (medium). The coupling to MARKET-1's frozen files** (H0, 4).
- *What it means today.* Nothing in a frozen file changes. WAVE-H's frozen list
  names MARKET-1's files byte for byte, so each is also WAVE-H's frozen file.
- *A later fix to MARKET-1* (M0's road: a decisions entry, a failing test, a new
  list) in `waves`, `fills`, `book`, `stats`, `lines` or `price` stops WAVE-H
  (exit 4) at its next run until a re-freeze (`waveh-freeze-2`), which must be
  the same decisions entry and re-run the reproduction test; a fix elsewhere in
  MARKET-1 changes nothing for WAVE-H. A fix to the paper's `instants`, `stats` or
  `research` stops both. A fix to WAVE-H's own files before its look re-freezes
  WAVE-H alone. After its look the test is done: a later defect is reported, not
  re-run (R7). Neither freeze tool knows the other, so **say this in the
  decisions entry and add a test to `pnpm verify`** that, once `waveh/FROZEN.sha256`
  exists, checks its MARKET-1 and paper lines against `market1/FROZEN.sha256` and
  `experiment/FROZEN.sha256` (a MARKET-1 fix then fails loudly in the session that
  makes it, not at the look).
- *The closure is not what the plan lists.* `lines.ts` imports `price.ts`, which
  the list omits; `book.ts`, `lines.ts` and the paper's `instants.ts` and `stats.ts`
  import `src/schedule.ts`, which no freeze lists and which MARKET-1's M0 calls
  not frozen. It also holds the lab's night-window constants (decisions
  2026-11-10): a legitimate collector change there would stop WAVE-H for nothing.
  **Fix:** a test that walks the compiled imports of `dist/waveh.js` and fails on
  any repository file outside the list, and treat `schedule.js` as MARKET-1 does
  (not frozen; its hash printed in the run's log).
- *The build.* Both freezes hash the repository's compiled `dist/`; a TypeScript
  upgrade or a change to `tsconfig.build.json` would re-hash every list at once
  (the lists' heads record the toolchain). A WAVE-H session changes neither.
- *`lz4js`* decodes every fill. It is a devDependency, pinned by version and the
  lockfile (whose hash is a comment in the list's head), so a wrong decoder would
  change the data without a stop. **Fix:** list its one source file in the freeze,
  or check its SHA-256 at load as the kit's fingerprint is checked.

**R5 (low). SIZING by file, and the rehearsal's positions** (H1, H5, 3.6).
- SIZING is "records stamped before 2025-08-01" but the rehearsal opens files
  dated before 2025-08-01. A file holds its writer's hour, so the last 0.1 s of
  July can sit in `20250801/0.lz4`, which the rehearsal may not open and the look
  does. The chance that a counted fill sits in that 0.1 s is about 1% on a busy
  day (13,406 counted fills on 2025-07-17), and then the look's recomputation of
  M could differ from the rehearsal's by an episode and "stops if it differs".
  **Fix:** SIZING is the records in files dated before 2025-08-01, in both.
- A sizing position whose exit falls on or after 2025-08-01 cannot be priced in
  the rehearsal (its marks are sealed): say it is left for the look.

**R6 (low). A dead sentence** (H3): "The large coins, for lines beside only: BTC,
ETH". No line in H13 uses them. Delete it or define the line; a frozen sentence
with no effect is a trap.

**R7 (low). The one look's edges** (H15).
- Nothing about an outcome is printed or logged before `look/result.json`
  exists, so that "a run that crashes before its result exists is not a look" is
  true.
- A book file present in `books.sha256` whose hash differs stops the look; the tape
  is for a key the archive does not have, not for a file we hold and cannot trust.
- Say what the Final review does if it finds a code defect after the look (MARKET-1's
  M0 route: a decisions entry, a failing test, the positions changed, a new list,
  the same frozen rules re-run), since "after the look nothing changes" is written
  about the rules and can be read as closing this door.

**R8 (low). A mapping test with real rows** (5, part 3). Re-express the seed's
liquidation rows in Hyperliquid's shape (an own leg and a counterparty leg;
`crossed` from `taker`; `liquidation {liquidatedUser, method}` with method
"backstop" and `crossed` false for order id 0; `startPosition` from
`previous_size`) and require H4 to count exactly MARKET-1's 727 (695 + 32), and
the entries to stay 153. It tests the "either method" branch on 32 real events
and H4's own-leg and reducing tests on 727 real rows.

**R9 (low). Say how much burstier the slices are** (2.3, page one). Matching the
episode rate leaves a slice with 2.91 entries a day and 6.4% of quarter-hours in
a wave state on the planner's three sample days, against the old weeks' 2.25
and 3.7% (I get 257 of 6,528, 3.9%, by the planner's own definition; the 242
is MARKET-FIND A14's and I do not reproduce it). The planner's counts also give
about 7.9 distinct liquidated accounts a slice a day against the pool's 2.25 (153
accounts in 68 days), and 7.5 fills an episode against 1.9. So a Hyperliquid slice
sees more different accounts for the same episodes. The plan prints M doubled
(3.5% of quarter-hours); that is the honest answer. Say the numbers in the rules'
page and in the report.

**R10 (low). Small corrections** for the doc pass: the collector's inflow is
about 0.3 MB/s on the wire (the plan's 0.8 is the uncompressed estimate, 3×
high); "about 9,600 lines" in `data.sha256` is about 9,900 (8,845 fills files,
370 `asset_ctxs`, 722 or 760 funding replies); `fundingHistory` rows are stamped
17–69 ms after the hour, not ".017Z"; the old weeks' wave state is 3.9% by the
planner's definition.

## Findings by severity

No high finding. Medium and low, each with the plan's section and the fix (the
detail above).

| ID | Sev. | Answer | Plan section | Finding | Fix |
|---|---|---|---|---|---|
| D1 | med. | 1 | 3.5 watch | How `heartbeat.json` is read is unsaid; a content read can fail the collector's rename (measured); the file's time by stat cannot | Stat for the age; content at most once a minute right after the time moves; a failed read is "no reading"; fail closed; log every reading |
| D2 | med. | 1 | 3.5 watch | Rule (b) reads against the watch's clock; the price audit (a named condition) is only in the next morning's check; the rate after a pause is unsaid | `heartbeat.time − lastFrameAt`; pause on `agree` under 90%; a rate file; log the counters |
| D3 | med. | 1 | 3.5, 7 | No runner, priority, stop or exemption; the collector is below normal | Idle or below-normal priority; one instance; stop and pid files; detached start; decisions line |
| D4 | med. | 1 | 3.2, 3.5 | No byte cap or disk floor; logs' place unsaid; E: has 17.9 GB | Total cap +2%; floor 200 GiB on F:; every file on F: |
| D5 | med. | 1 | 3.5 funding | Windows straddle 2025-08-01 and the data's end; `[]` is valid; 4.4 s is half the limit | Aligned windows (760 reads); 6 s; store `[]` |
| D6 | low | 1 | 3.5 errors | Order of writes, error classes, listing validation, a rename retry | As D6 |
| D7 | low | 1 | 3.5 rate | 4 MB/s buys about a day, none needed; the collector's flow is 0.3 MB/s | Stay at 2 MB/s |
| D8 | low | 1 | 3.5 daily check | Not needed for safety; a deny-write read could drop a coverage line | Closed days only, a share-friendly reader, the supervisor's script |
| R1 | med. | 2 | H9, H10 | The minute mark's stamp ("stamped at a minute's end") matches no row; a funding row's hour is unsaid | Write and test both conventions; nominal hour = stamp rounded |
| R2 | med. | 2 | H8, 2.4, Q4 | The tape walk can take a backstop vault leg at the engine's price; "same functions" hides that it is a time-ordered sweep; Q4 is argued, not measured | Exclude backstop-marked records; say "time order"; print tape − book in the rehearsal |
| R3 | med. | 2 | H2, H15, 6 | An intact but short hour file or a changed meaning passes silently | Sizes-only outlier list; step 1's counts and block gaps; a data-defect route before step 2 |
| R4 | med. | 2 | H0, 4 | The closure is unlisted (`price.js`, `schedule.js`); `lz4js` is outside the freeze; neither freeze tool knows the other | Closure test; `schedule.js` as MARKET-1 treats it; pin `lz4js`; a `pnpm verify` test; the decisions entry says what a fix does |
| R5 | low | 2 | H1, H5, 3.6 | SIZING by stamp but read by file; a sizing exit past the seal | SIZING by file date in both; leave such positions for the look |
| R6 | low | 2 | H3 | A sentence about BTC and ETH with no line | Delete or define |
| R7 | low | 2 | H15 | Outcomes may be logged before the result; a differing book file falls to the tape; a defect after the look is unaddressed | Print nothing before the result file; stop on a differing file; the M0 route |
| R8 | low | 2 | 5 | The reproduction does not test H4's mapping | Convert the seed to Hyperliquid's shape; require 727 = 695 + 32 and 153 entries |
| R9 | low | 2 | 2.3, page one | The slices see about 3.5× more different accounts a day than the pool | Print the numbers; M doubled stays beside |
| R10 | low | 2 | 3.5, 3.2, 9 | Four small numbers | As R10 |

## The recount

Method: my own code (`scripts\recount.mjs`, `recount2.mjs`, `recount3.mjs`,
`waveshare.mjs`), written from `market1/rules.md` M3–M5 and the plan's section 2.2,
not from the planner's scripts, on the pre-cut seed and R8's tape. Counts only.

| What | Plan | My count |
|---|---|---|
| Seed | 1,602 accounts, 1,136,327 fills, all before the cut | The same; none at or after the cut; 120 files marked `truncated` (page cap), 0 rows dropped |
| Liquidation fills with order id "0" | 295; no other short id | **295** (48 small coins, 44 BTC and ETH, 203 other markets); every one `taker` true, fee 0, reducing, not ADL, not settlement. Across all 1,136,327 rows the only short order id is "0" (1,112 rows) |
| Their counterparties | `taker` false, `liquidation` false, order id 0 | **Each of the 295 has exactly one other leg in the seed**: order id 0, `taker` false, `liquidation` false, fee 0, held by two accounts (0x7af67514… 222, 0x9fcbd754… 73). Those two hold 816 of the 817 non-liquidation order-id-0 fills (the 817th is a settlement fill). So order id 0 is the backstop by structure for all 295, not only for the two events the tape marks |
| Other liquidation fills | 16 `taker` false | **16** (1 small coin, PUMP; 15 other); 2 more `taker` true but not reducing (other markets) |
| M4's counted fills, small coins, 2026-08-31 → cut | 727 = 695 + 32 | **727 = 695 + 32** (BTC, ETH: 1,222, of which 13 order id 0) |
| The 32 | 4.4% | 18 accounts, 18 days (2026-09-01 → 10-22), 14 coins; one account has 13 of them |
| Entries (M5, my code) | 153; 47 days; 30 markets; 114 sells; 39 buys | **153; 47; 30; 114; 39** |
| Entries without the 32 | not stated | **150** (3 lost, none new; 46 days; 111 sells, 39 buys). The 3 are themselves backstop legs, all forced sells: 2026-09-05 16:13Z UNI, 2026-09-10 23:24Z HYPE, 2026-09-23 14:12Z KSHIB |
| The tape | 119,899 trades; 19 marked; 307 seed liquidation fills on it; 2 with order id 0, exactly the 2 marked | **4,168 call records, 133,949 rows, 119,899 distinct trades; 19 marked, all "backstop", all ETH, 2026-10-07 (16 at 02:01:18–21Z, 3 at 10:07:48Z); 307 seed liquidation own legs on it; 2 with order id 0, both marked (02:01:18.879Z, 10:07:48.980Z); 305 unmarked, none with order id 0**. Every marked trade has one counterparty leg in the seed (19 of 19) |
| Old weeks' episodes | 386 in 68 days | **386** (5.68 a day); 153 distinct liquidated accounts; 1.88 fills an episode; wave state in 257 of 6,528 quarter-hours (3.9%; the plan's 242 is MARKET-FIND's) |

**Reading.** The claim stands: Polymarket's backstop own fills are `taker` true,
order id "0", fee 0, and inside MARKET-1's count; they are 32 of 727 (4.4%) and
decide 3 of 153 entries. Two limits. The tape ties only two own legs (both ETH,
2026-10-07) to a backstop mark; for the other 293, the 32 small-coin legs the plan
counts among them, the evidence is the structure above (an order-id-0 own leg
always meets one order-id-0, fee-0, `taker`-false leg of one of two accounts). And
the seed is the pool as the paper experiment read it (120 files truncated), so the
counts are MARKET-1's, as intended.

**The Hyperliquid side** (read 2026-11-14, `requests.tsv` 2–3). The liquidator
vault's two backstop fills in its newest 2,000 are `crossed` true, `dir`
"Liquidated Isolated Short", `startPosition` 0.0 (the vault's leg, whose
`liquidatedUser` is the other account). For one liquidated user (2026-08-19
19:21Z, PURR), the reply of `userFillsByTime` holds three market-method fills
(`crossed` true, `liquidation.method` "market") 10–13 s earlier and then **the
user's own backstop fill: `side` B, `dir` "Liquidated Isolated Short",
`crossed` false, fee 0.0, `startPosition` −882.0 (non-zero, opposite to the
side), and `liquidation {liquidatedUser: the user itself, markPx, method:
"backstop"}`**. So H4's gate (the object, its `liquidatedUser` equal to the
record's user) lets the own backstop fill through and "or backstop" is live. The
same reply shows `startPosition` moving fill by fill (−3,119.0, −2,882.0, −2,645.0
before fills of 237, 237 and 1,763; the backstop then starts from −882.0), so
"reducing" is tested per fill there, as the plan says, where Polymarket gives the
position before the whole order. What stays unverified is the archive's own records of a backstop (none appeared in
the planner's 26,297 sizing own legs); the rehearsal's counts by method will say,
and the synthetic test covers the branch (R8 adds a real-row one).

## The ten questions

1. **The counted fill, either method?** *Yes.* Recounted above; verified on the
   Hyperliquid side; add R8.
2. **Slice 0 decides, every slice beside on marks?** *Yes.* The error budget is
   spent once (one named set, one z each side). It is MARKET-1's own situation, it
   needs 1–2 GB of books, and the pooled reading, which would narrow the error
   (more days with positions: about 300 against about 126), is printed beside,
   so slice 0's luck is seen. The cost is power, stated in the plan and
   reproduced: a true +100 is confirmed 44 times in 100. Keep it; read "not settled"
   as "no answer" and use its sentence.
3. **M fixed once from SIZING?** *Yes.* MARKET-1's pool is fixed too, and the
   month-by-month M reads the test's own counts. Note R9: the episode-matched M
   leaves slices burstier than the pool; M doubled, printed, matches its wave-state
   share.
4. **A tape-priced leg counts as priced?** *Yes, after R2:* backstop legs out of
   the walk, and the tape − book difference printed from the rehearsal before
   you rule, so the answer rests on a number.
5. **z 2.58, δ +50 bps, 20 days, 10 coins?** *Yes.* The page-one table
   reproduces from its stated error: 67.7 × √(47 ÷ 126) = 41 bps, so "holds"
   needs a mean above 107; true +150 gives it 85 times in 100, +100 gives 44;
   with nothing there "does not hold" needs a mean below −57, 9 times in 100.
   The order is M11's.
6. **The crash day stays in, printed apart?** *Yes.* Dropping it after
   knowing it is extreme is a choice made with the data in view.
7. **The download: 2 MB/s, the pauses, the watch, the daily check?** *Yes,
   after D1–D8.* Reading the heartbeat is fine (by stat, rarely by content); the
   poller log and `coverage.jsonl` are the supervisor's after-the-fact read of
   closed days, not the tool's.
8. **The books of the legs fetched inside the look?** *Yes,* with the same
   watch and caps, the guard's key list coming from the program's step 1 (and R7:
   a differing file stops, it does not fall to the tape).
9. **Delete the raw fills and marks after the Final review?** *Not yet.* F:
   has 1.3 TB to spare after the download; a re-download costs about 31 hours of
   the line; the on-chain project's first source is this same archive. Keep the raw
   files until that project's founding says whether it reuses them; keep the
   manifests and everything the look used in any case.
10. **WAVE-H without Polymarket's own months?** *Yes.* They are the old weeks'
    own days seen through a sibling venue, not a new sample.

## My questions, each with my recommendation

1. **How does the tool run for two days (D3)?** *A detached process at low
   priority with a stop file and a pid file, started by the supervisor; the first
   session proves it survives the session's end; if it does not, the owner
   registers it as a task (the owner is away, which is why the stop file matters).
   Record the exemption from the background-process rule in decisions.*
2. **Drop the automatic step to 4 MB/s (D7)?** *Yes.*
3. **Align the funding windows to the seal (D5), 760 reads at 6 s?** *Yes.*
4. **May the rehearsal print tape − book per leg (R2)?** *Yes, as a count-only
   figure of the price fallback, not of an outcome. It is the evidence for question 4.*
5. **An integrity-only decode pass of the test files before the freeze?** *No.* A
   corrupt file is found at step 1, before any price exists, and mended by a
   defect entry (R3); a pass would open the sealed files for no outcome-blind
   gain. The sizes-only outlier list (R3 i) is enough before the freeze.
6. **Read the collector's price audits and coverage of 2026-11-14 00:07–00:22Z
   before day one (D7)?** *Yes: it is the only test of 2 MB/s on this line and
   this PC that exists.*
7. **Keep every file of this project's research on F:?** *Yes; E: has 17.9 GB
   free and holds the collector's run folder.*

## What I checked and found right

- **Fidelity.** Every row of section 2.1 against `rules.md` M2–M12; the 38 names
  against M3's 38 ids, one for one and in order; the verdict's order against
  M11; `twoWay`, `baseOf` and the walk functions are imported, not copied.
- **Conduct of the plan.** From `requests.tsv`: 594 requests, all HTTP 200; the
  107 downloads are all dated 2025-06-07 → 07-17 (1,561,726,689 B); the 41
  `/info` reads are 38 `candleSnapshot` (2026-11-06), 2 `fundingHistory`, 1
  `meta`; 361 listings reach the test months (names and sizes only). No test
  file was downloaded.
- **Arithmetic.** 300 test days; 67.4 sizing days; 223 GB; 360 of 7,200 hours;
  the `asset_ctxs` range 2025-05-25 → 2026-05-28 holds 369 daily files, none
  missing; page one's power table (question 5).
- **The planner's M-scan grid** is monotone from M = 1 (59.3 episodes a slice a
  day) down through 5.68 at M = 119, so "nearest 5.68, a tie to the larger" is a
  well-defined, deterministic rule.
- **The format boundary.** On 2025-07-27 `node_fills` holds hours 0–8 and
  `node_fills_by_block` hours 8–23: no hour is missing and hour 8 is in both, so a
  rule that counts a fill once is needed. That the two formats carry the same
  `tid` for one fill is assumed by the plan, not shown; the rehearsal can check it
  on that hour (a sizing hour), counts only.
- **The fee.** Hyperliquid's page (read 2026-11-14): base tier perps taker
  0.045%, maker 0.015%, tiers by 14-day volume; no date on the page.

## Slips

1. My first progress stamp (00:50Z) was typed without the clock, which said
   00:35Z; corrected in place with a note.
2. `node -I` (the harness note on `-I` is for Python) failed at once; nothing ran.
3. My first two accelerated rename runs had both programs asleep on the same
   system timer tick and showed 20–26% failed renames against a duty of 3.5%; I
   report only the stat-versus-read result (which does not depend on that) and the
   exposure at 30 s as a range, not a point.
4. The vault reply's sealed-span records and the one directory listing of
   `paper\`: disclosed above.

## Evidence

In the supervisor folder `workers/WAVE-H-PLAN-REVIEW/`: `progress.md`,
`requests.tsv` (six requests; request 2's reply is deleted, see the disclosure),
`scripts\` (`recount.mjs`, `recount2.mjs`, `recount3.mjs`, `waveshare.mjs`,
`rename-control.mjs`, `rename-duty.mjs`, `rename-duty2.mjs`, `rename-stat.mjs`,
`net.mjs`), `out\` (the recount's outputs, the three kept replies and two
listings). Read and not recomputed: the planner's S1 counts (sizing days),
MARKET-FIND's figures other than those named, the collector's measured inflow.
Not read: the planner's brief and transcript, WAVE-ELSEWHERE's sections other than
1.1, 2.1, 3 and 4, ONCHAIN-SCOUT.
