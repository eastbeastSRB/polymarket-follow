# COPYH-ENGINE-REVIEW — the fresh code review of COPY-H's engine, commits 1–8, 2026-11-26

*A review decides nothing: the supervisor copies what it concludes into
decisions, the code and the rules, or it does not exist.*

**Who and how.** COPYH-ENGINE-REVIEW (Fable 5.2, max, fresh; the builders
were Opus 5.5), 2026-11-26 18:18Z → 19:06Z (every time from `date -u`).
Read only: no file of the repository is changed but this review and its
README row; no network; no data on F:. The code is the commit `b689dbc`
(COPYH-ENGINE-3's commit 8), read from a `git archive` snapshot in the
scratchpad; the working tree's uncommitted `reproduce.ts` and its test are
another worker's and were not read. `copyh/rules.md` is
`200fa7fc…d04e`, as the brief names it.

**Read in full:** CLAUDE.md; code-rules; architecture's COPY-H section;
decisions' COPY-H entries of 2026-11-25 and 2026-11-26; `copyh/rules.md`
(all of it); the engine's plan; the kit's `fills`, `entries`, `labels`, the classifier,
`panel`, `costs`, `returns`, `nulls`, `stats`, and lib-exits; the paper's
`copy.ts`, `stats.ts`, `market.ts`, `research.ts`, `account.ts`,
`score.ts`, `instants.ts`, `coverage.ts`; the engine's fifteen files
(`instants`, `accounts`, `entries`, `labels`, `markets`, `setting`,
`money`, `unpriced`, `judge`, `lines`, `verdict`, `tripwire`,
`reproduce`, `closure`, `stores`: 2,842 lines) with `normalize.ts`,
`chains.ts`, `funding.ts`, `holes.ts`, `design.ts`, `seal.ts`,
`store.ts`, `dirs.ts`; the whole diff of the store's files since
`0ec4835` (the engine's `e153700`, `79250a6`, `fec8b56` and STORE-FIX's
five commits) and of `tools/copyh-freeze.cjs`. The tests by their cases
against each rule's named pins, `copyh-tripwire` and the head of
`copyh-markets` line by line.

**The question:** does the engine's code so far do exactly what its rules
say, and is it simple?

## 1. The verdict

**Commits 1–8 may freeze after these fixes. No rework.** Every module
does what its rule says. Where a rule says "unchanged", the code calls the
kit, lib-exits or `dist/paper/copy.js` and `stats.js`; where it re-writes
a few lines of the paper (the market object, the lines' conditions, the
vote), a test or my own grid holds the two equal. I found no path by which
a label, a habit, a line or a judgement reads a fill, price or funding row
at or after its own instant. A missing mark, a funding settlement without
a mark and a null long share each end in a reason, never in a number.

- **Two medium findings** (section 3). M1: the tripwire spreads a copy's
  legs into one call, so a copy of more than 124,591 legs crashes the step
  before any price (shown on the code). M2: FRESH-2's range refuses a file
  list that lacks an hour, where C14 says the stage runs on the keys the
  manifest holds; its fix belongs in `stores.ts`, never in `range.ts`.
- **Ten low** (section 4): five missing refusals at the modules' edges,
  one flag's exactness, two items of the reproduction, two tests to add,
  and the tidying.
- **No fix touches a store-closure file** (section 5). E's store need not
  be rebuilt for anything here.
- **Four questions**, each with a recommendation (section 9), and a list
  for the builders of commits 9–16 (section 8).

## 2. What holds

Each line was read against the rule it names.

- **C1** (`instants.ts`): the stages' windows are C1's table; M is the
  latest Monday 00:00Z at or before t; 48, 24 and 26 Mondays; an entry of
  S's first three days has M = 2026-05-25. `mondayOf` and `dayOf` equal
  the paper's on 40,000 instants (my probe).
- **C2, C3's reader** (`accounts.ts`): addresses from the store's
  dictionary, lower-case; an account's rows across E, S and FRESH-2 in
  time order, ties in the pass's order; every file held to its manifest
  line; no partition at or after the seal's end opened; every row through
  `checkInstant`; rows out of account or time order, a column of another
  kind, a user index past the dictionary and a `dir` outside `dirs.json`
  refused. The vault accounts are the union of the stores' own lists.
- **C3's cut E** (`normalize.ts`, `fec8b56`): a matching event's taker
  fills take their chain head, a maker fill its own `startPosition`; the
  chain test and K3's count are untouched (`chains.ts` changed since
  `0ec4835` by a comment and a dead `|| 1` only). Nothing more changed.
- **C4** (`entries.ts`): the kit's `toEvents`, `toCycles`,
  `buildEntries(events, −∞, ∞, 60 000)`, `entryId`, `delayOf`, lib-exits'
  `liquidationKeys` and `chainBreaks`, called. `exitRows` is the kit's
  loop with a count, as C4 declares; it equals the kit's exits on the
  builder's 300 accounts and on 400 of mine. HISTORY_FILLS_MAX is read
  before `toEvents`, EXITS_MAX before `buildEntries`, each "more than".
- **C5** (`labels.ts`): the capture is [max(ARCHIVE_START, M − 90 d), M),
  `truncated` true, `oldest` its start; "no fills in window" first, then
  the cap, then the kit's `labelAt`. The habits are the kit's `habitsAt`;
  read from the whole history only when no order event has fills on both
  sides of M, else computed apart from the fills before M. On 2,400
  random account-Mondays (36 apart) the habits equal the kit's on the
  fills before M alone, and the label's shortcut equals the kit's label.
- **C6, C9** (`markets.ts`, `setting.ts`): the coin's end and Settlement
  price from the first Settlement before END; primary by the end of t's
  UTC day; `marketOf` is the kit's `marketFrom` step for step (a test
  holds it equal, field for field, to `marketFrom` and to the paper's
  `marketThrough`); the 60-minute mark differs only where the kit's finds
  none; a funding row stamped at or after END is refused; c(coin, d) from
  day d − 1 alone, both fallbacks flagged; 4.5 bps a leg; thin legs under
  $1,000 in six minutes.
- **C8, C11** (`money.ts`, `unpriced.ts`): `planCopyThrough` imported from
  the paper, with the coin's end as its `end`; lib-exits' `priceCopy` and
  its reasons; STOP's search end as the paper's scorer; the gap copy by
  `crossesBreak`, or a hole whose stretch without a record meets
  [t, the last exit used], END or the coin's end while open.
- **C10** (`judge.ts`): the kit's `dAgainstNull` at 24 h and `removalOf`,
  called; the members' market trades in the week of M cut at END; "no
  long share" beside the kit's three reasons; x′ = d − (L.gross − L.net),
  null exactly when d is, refused where it cannot be. `votedBy` equals the
  paper's on 160,000 cases (my probe).
- **C7** (`lines.ts`): R7's conditions equal the paper's `linesAt` on a
  grid of 896 cells (my probe); none for an account without habits; the
  moved lines' delays and marks; RANK's window, five copies, ⌈n ÷ 5⌉ and
  ties; SLICES by the address's number mod 4.
- **C12** (`verdict.ts`): m and SE by the paper's `twoWay` over the
  priced copies, by address and the UTC day of t + D; m′ over the copies
  with a d; SE′ the larger of the day's and the week's; the readings in
  C12's order; the eleven sentences equal C12's text character for
  character (a script held them).
- **C16** (`tripwire.ts`): each copy's reason as `priceCopy` will find it,
  leg by leg; a minute has a mark exactly when the VWAP object has one;
  the 61 minutes under the 60-minute rule; the stop above 1%.
- **C15** (`closure.ts`, `stores.ts`, `run.ts`'s exit codes): the closure
  is the 25 files and the 17 design values I find from the sources' own
  imports; `--final` refuses a closure that differs from the record;
  `build` and `integrity` moved into `stores.ts` unchanged; exit 6 for a
  failed check, 7 for two copies that differ.
- **The store's fixes since `0ec4835`** (STORE-FIX): the bounded key
  search, the finite and round-trip guards, the failures by why with K0's
  sum, unknown values named at a file's end, the merge's unit as a
  ceiling. Read as a diff; no defect seen.
- **The tests:** fifteen of the engine's test files run in a scratch copy
  with its own `node_modules`, one at a time: 148 of 148 pass (tripwire 7,
  verdict 11, lines 10, judge 13, money 6, unpriced 9, labels 8, entries
  10, normalize 6, markets 17, setting 7, accounts 12, instants 14,
  reproduce 16, stores 2).

## 3. Medium findings

### M1. The tripwire spreads a copy's legs into one call

- **Where:** `tripwire.ts` line 149,
  `marks.missing(c.tIn, Math.max(c.tIn, ...c.legs))`.
- **What:** a call takes a limited number of arguments. Measured on this
  machine (Node 24.13): 124,592 on a process's main thread, 497,662 in a
  worker thread. The plan runs engine parts in forked processes.
- **Shown on the code** (my probe, `projectionOf` on one made-up copy):
  100,000 legs pass; 130,000 legs throw "RangeError: Maximum call stack
  size exceeded".
- **Can a copy have that many legs?** Each exit of the trader is a leg
  until the copy's share is gone. Under cut E each maker fill is its own
  order event, so a large position closed through resting orders gives
  one leg a fill. EXITS_MAX does not stop it: 125,000 exits on up to 160
  open groups do not pass 20,000,000 exit rows. It is rare, and it is the
  largest traders' shape.
- **Why medium:** the crash is exit 1 before any price. On E the
  rehearsal would show it before the freeze; on S or FRESH-2 it would
  come after, and need C0's defect route for one line.
- **The fix:** a loop in place of the spread, as `writers.ts` already
  does for its times ("A loop, not Math.min(...times)"):

  ```ts
  let last = c.tIn;
  for (const x of c.legs) if (x > last) last = x;
  const missing = marks.missing(c.tIn, last);
  ```

  And a test: a copy of 200,000 legs is projected.
- **Not in a closure file.**

### M2. FRESH-2's range refuses a list that lacks an hour

- **Where:** `stores.ts` `passOf` (lines 75–84) calls `range.ts`
  `filesOf` (lines 124–134), which throws `StoreError` (exit 5) for any
  key of the range that the list lacks. `79250a6` added FRESH-2's range
  with that refusal.
- **The rule:** C14 (1), RH1 (g): "If the archive still lacks an hour of
  the range on 2027-05-25, the stage runs on the keys the manifest holds:
  the freeze's decisions entry lists the missing hours, and each is a
  hole (C3)."
- **What follows as the code stands:** with one hour missing,
  `copyh/fresh2.sha256` lacks its key and FRESH-2's pass stops at exit 5.
  The frozen program could then not run the stage the rule says it runs.
- **Why it is flagged now:** FRESH-2's stage is commit 15's, but the
  refusal sits in `range.ts`, a store-closure file. A fix there after E's
  build means E is rebuilt.
- **The fix, outside the closure:** in `stores.ts` `passOf`, for FRESH-2
  alone, give `filesOf` the range's keys that the list holds:

  ```ts
  const list = readDataList(data.toString("utf8"));
  const fill =
    range.name === "FRESH-2"
      ? range.fill.filter((key) => list.has(key))
      : range.fill;
  return { files: filesOf({ ...range, fill }, list), list: … };
  ```

  The files' indices stay consecutive, which the merge and the integrity
  need (`lines[f.index]`). Nothing else reads `range.fill`. The missing
  hour becomes a hole by itself (`holesOf` reads the union of the files'
  minutes). The records left unpaired at its edges go by C0's route into
  `unpaired.json`, as C15 says for S.
- **Tests:** FRESH-2's list without two hours gives the files it holds,
  in order, indices 0 to n − 1; E's and S's ranges still refuse a missing
  key.
- **Not in a closure file, if fixed as above.**

## 4. Low findings

Each is a small change in a file outside the store closure.

- **L1. A `dir` index past the store's names** (`accounts.ts` line 155):
  `s.kinds[c.dir[i]!]!` is `undefined` for an index the dictionary lacks,
  and the row is then not `forced`, silently. The user index is refused
  (line 202). **Fix:** refuse it the same way (`StoreError`), with a test
  beside the reader's five refusals.
- **L2. Rows asked outside the window read** (`accounts.ts` lines
  127–161): `readBucket` holds the partitions that meet its window;
  `rows(from, to)` and `count(from, to)` outside that window return what
  those partitions happen to hold. A caller's slip would cut a history
  short without a word. **Fix:** `viewOf` takes the window and refuses a
  `from` before it or a `to` after it.
- **L3. A capture that holds a fill at or after M** (`labels.ts`
  `labelOf`, lines 73–84): the kit's classifier builds its events from
  every fill of the capture, so one fill at or after M would change the
  facts at M. No caller passes one today (`boundedCapture` and the
  reproduction's `captureAt` both cut at M); my probe shows `labelOf`
  takes such a capture without a word. **Fix:** one line,
  `if (last.t >= M) throw new Error(…)`, so that C5's first sentence
  holds by construction.
- **L4. The last-price object marks a minute of size-0 trades**
  (`markets.ts` line 333): C9 gives no mark to a minute whose market
  trades' Σ sz is 0, and the last-price object is "the same" with last
  prices. The VWAP object and the tripwire follow it; the last-price
  object takes the bar's `last` (my probe: no VWAP mark, a last-price
  mark of 101.1). It serves DELAY0 and LAST only, and no such trade is
  expected. **Fix:** `bars.sz[k]! > 0 ? bars.last[k]! : NaN`.
- **L5. A coin's object takes any coin's funding rows** (`markets.ts`
  `coinMarkets`, lines 289–295): the settings refuse a leg of another
  coin; the object does not refuse a row of another. **Fix:** refuse a
  row whose `coin` is not `coin.name`.
- **L6. `settled` for a copy never opened** (`money.ts` line 40): a
  primary entry in the last seconds of a UTC day, on a coin whose
  Settlement comes within about 95 s after midnight, has its follow
  instant at or after the coin's end. Its plan is flagged `settled` with
  a leg of negative length (my probe: h = −20,001 ms). It is unpriced
  ("no mark at the follow instant"), so no mean is touched; only C13's
  count of settled copies. **Fix:**
  `settled: coin.settlement !== null && plan.flag !== null && entry.t + entry.D < coin.end`;
  the tripwire test's count of settled copies goes from 4 to 3.
- **L7. The reproduction keys entries by id** (`reproduce.ts` lines
  205–218 and 257–261): the kit's id is account, coin, time and type, with
  no direction. An OPEN long, a CLOSE and an OPEN short of one
  millisecond give two entries with one id (my probe on the kit alone).
  `entries.set(id, …)` then keeps the second in both paths, and the first
  is never compared. **Fix:** refuse a second entry of one id
  (`ReproError`), so that a seed which holds one is seen; the phases:
  section 8.
- **L8. The churner/mixed pairs are counted, not listed**
  (`reproduce.ts` lines 393–397): C15 (a) says "every difference
  listed". **Fix:** list each pair (account, Monday, both labels) beside
  the count.
- **L9. Two tests that hold the engine to the paper's own functions:**
  `accountLines` against `src/paper/account.ts` `linesAt` on a grid, and
  `votedBy` against `src/paper/score.ts` `votedBy`. Both equal today (896
  of 896, 160,000 of 160,000 in my probe); no test of the commit holds
  them, and "MAIN, the paper's rule as frozen" rests on it.
- **L10. Tidying** (the owner's Final review text):
  - `entries.ts` `exitRows` has a `mergeMs` parameter no caller passes
    (code-rules); and its own `WEEK_MS`, which `instants.ts` exports.
  - The check of a partition's column is written twice (`accounts.ts`
    `col`, `markets.ts` `columnOf`): one function serves both.
  - `setting.ts` line 61 clamps an instant past the bars to the last day;
    no caller reaches it (the kit asks a spread only where it found a
    mark). A refusal would say so; the clamp would hide a wrong call.
  - Two comments are stale: `entries.ts` lines 9–11 and `labels.ts` lines
    11–12 say the caps' sentence is "queued for the rules' last touch";
    it is C4's and C5's since COPYH-RULES-2's commits.
  - Architecture's COPY-H section names `rules.md` at `5a80af5`.

**Notes, no change asked:**

- Cut E chains a matching event's taker fills among themselves
  (`normOf`). C3's sentence, "a taker's fill takes its chain head's
  `startPosition`", can also be read as the whole event's chain. The two
  differ only when one order has a maker fill and then a taker fill at one
  `time`; the code's reading is the one that keeps the kit's chain whole.
- `isPrimary` reads a Settlement stamped exactly at the next 00:00:00.000
  as after t's day, by C1's half-open day.
- `chains.ts` line 60 (a closure file) spreads twice an event's fills
  into `Math.max`: it would need more than 62,295 taker fills in one
  matching event. I ask no change.
- The WITHHELD sentence prints P to one decimal, so 2.04% reads "2.0% …
  above the 2% limit". It is the paper's form.

## 5. The store closure

The closure, from the sources' own value imports (my script; the same 25
files and 17 values that decisions record for `closure.ts`): `chains`, `coins`, `digest`, `holes`, `integrity`,
`market-trades`, `merge`, `part`, `pass`, `range`, `reread`, `run`,
`scan`, `schema`, `seal`, `store`, `twin`, `worker`, `writers`;
`polish/lz4`, `polish/tables`; `schedule`; `waveh/instants`,
`waveh/keys`, `waveh/lz4`: 25 files, and design.js by 17 store values, the
five run-only names left out.

- **No finding's fix touches one of them.** M1 is `tripwire.ts`; M2 is
  `stores.ts`; L1–L2 `accounts.ts`; L3 `labels.ts`; L4–L5 `markets.ts`;
  L6 `money.ts`; L7–L8 `reproduce.ts`; L9 tests; L10 `entries.ts`,
  `setting.ts`, `labels.ts`, `accounts.ts`, `markets.ts` and a doc.
- **M2 is the one to watch:** its obvious place, `filesOf`, is in
  `range.ts`. The fix above stays in `stores.ts`.
- `tools/copyh-freeze.cjs` has no `--closure` print at this commit, only
  `--final`'s first check; `closure.ts` and that check read right.

## 6. Look-ahead, silent failure, units

- **Look-ahead.** The label reads [M − 90 d, M); the habits the events
  before M; a line is fixed at M; RANK reads copies whose every leg is
  before M, whose prices do not depend on END; c(coin, d) reads day
  d − 1; the removal reads the week of M cut at END, of which the null
  uses t's own hour (R10's rule). Three things read past an entry's
  instant by their rule, each declared: C6's "by the end of t's UTC
  day", C2's vault list to END, C4's caps to END. L3 and L2 would make
  two of the callers' duties refusals.
- **Silent failure.** A missing mark, a funding settlement without a
  mark and a null long share each end in a reason, never a number; a
  missing funding hour is counted; a Settlement the bars do not hold, a
  funding row at or after END, a store file that differs: refused. The
  gaps I found are L1, L2, L5 (a value that should be a refusal) and M1
  (a crash on a real shape).
- **Units.** SE by address and by the UTC day of t + D; SE′ also by the
  UTC week of t + D; the three sign means over the priced copies, by
  trader, by day of t + D, and without thin-tape copies; WITHHELD and the
  tripwire's share over the whole set; RANK by account.

## 7. My probes (scratch copy only)

- `projectionOf` at 1,000, 100,000, 130,000 and 600,000 legs: M1.
- 400 random accounts at 6 Mondays: the habits, `exitRows` and the
  label's shortcut against the kit: 0 differences in 2,400.
- `accountLines`, `votedBy`, `mondayOf`, `dayOf` against the paper's: 0
  differences.
- The kit alone on two made-up accounts: one id for two entries; an OPEN
  of size 0 gives an entry of direction 0 with no exit (question 3).
- `verdict.ts`'s sentences against C12's text: 11 of 11 the same.
- The scratch copy's junctions are removed; nothing of the repository was
  written.

## 8. For the builders of commits 9–16

1. **Never spread a copy's legs or exits, or an account's rows or fills,
   into a call** (`Math.max(...)`, `push(...)`): M1's family. The paper's
   scorer has `Math.max(0, ...c.plan.legs.map(…))`; do not copy it.
2. **An entry id is not unique** (L7). Keep both entries, as the kit and
   the paper do; never key a copy by its id alone; where positions are
   sorted by id, the kit's order breaks the tie.
3. **The callers' duties in commits 1–8:** a capture holds fills before M
   only; `rows` inside the window read; funding rows before END and of
   the coin; `isGap` on the base plan only (a plan with `closeAt` has no
   last exit to find); a coin without bars or without a market trade
   gives its copies "no mark at the follow instant"; a reading whose END
   lies inside a store (the fortnight) must drop the funding rows at or
   after END before `coinMarkets`, which refuses them.
4. **No edit of a closure file** for the phases: `run.ts`, `seal.ts`,
   `range.ts`, `integrity.ts`, `store.ts`, `schedule.ts` among them. New
   paths, errors and ranges go in the engine's own files.
5. **At the freeze, an export nothing imports is removed:** most exports
   of commits 1–8 have no caller yet, as expected; the second review
   reads the list again.

## 9. Questions, each with a recommendation

1. **M2's reading: must the frozen program itself run FRESH-2 on a list
   that lacks hours?** I read C14 (1) so. **Recommended:** yes; fix in
   `stores.ts` with its test at commit 15, and say in the brief of
   commits 9–16 that `range.ts` is not to be touched for it.
2. **Two entries of one id in the phases** (L7). **Recommended:** both
   are copies (R4 unchanged); the engine never keys a copy by its id
   alone; the rehearsal counts the ids met twice among P1 accounts (a
   count of instants, allowed); one sentence in C4 at the rules' next
   touch.
3. **An entry of direction 0.** A fill of size 0 passes the boundary
   (C9). From flat, the kit reads it as an OPEN of direction 0: an entry
   with no exit, whose copy would stay open to END and earn only its
   costs. None is expected, and the rehearsal already counts size-0
   trades. **Recommended:** decide now, before any count of E, what
   follows if that count is not 0: such a group is no entry, left out and
   counted. The code is one filter in `entriesIn`, written only if the
   count asks for it; the decisions entry names it now so that no count
   can be said to have chosen it (C15 (c)'s rule for a late change).
4. **"The rehearsal's store is sealed"** (C15 (c)): in code or by the
   supervisor's hand? A seal by name would be `seal.ts`, a closure file.
   **Recommended:** no seal by name; `steps.ts` refuses step 1 (exit 5)
   while `<COPYH_ROOT>\E\store\manifest.json` exists, so the rule's
   "moved aside or deleted before step 1" is held by the program.

## 10. What I did not review

Commits 9–16 (not built). The working tree's uncommitted `reproduce.ts`
(another worker's; L7 and L8 are for it). `gate.ts` beyond its one changed
line,
`copyh.ts`, `count.ts`'s body and `main.ts`'s tools beyond their diff
(the store review's). The tests of the closure, the gate and the built
program were read by their cases only and not run (they need the
repository's `dist`). No real data was opened: every statement about
Hyperliquid's sizes is reasoning from the rules' and decisions' printed
counts, not a measurement.
