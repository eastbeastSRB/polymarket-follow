# COPYH-STORE-REVIEW — the fresh code review of COPY-H's store (parts 1–2), 2026-11-26

*A review decides nothing: the supervisor copies what it concludes into
decisions, the code and the rules, or it does not exist.*

**Who and how.** COPYH-STORE-REVIEW (Fable 5.2, max, fresh; the builders
were Opus 5.5), 2026-11-26 10:31Z → 12:24Z, stopped by a usage limit
from about 11:13Z to 12:12Z (every time from `date -u`).
Read only: no file of the repository is changed but this review and its
README row; no network. The code is the commit `0ec4835`, read from a
`git archive` snapshot in the scratchpad. The engine's files
(`instants.ts`, `accounts.ts`, `entries.ts`, `labels.ts`, their tests)
are left out, as the brief says.

**Read in full:** CLAUDE.md; code-rules; architecture's COPY-H section;
decisions' COPY-H entries of 2026-11-25 and 2026-11-26; `copyh/rules.md`
C0–C9 and C15–C18; the 26 source files of parts 1–2 (6,502 lines) with
`src/copyh.ts` and `tools/copyh-freeze.cjs`; the files of other programs
they call (`polish/lz4.ts`, `polish/tables.ts`, `waveh/keys.ts`,
`waveh/instants.ts`, `waveh/lz4.ts`, `log.ts`); the committed lists; the
store's 18 test files (6,113 lines) by their cases, and line by line where
a finding needed it.

**The question:** is the store's code correct against its rules, and
simple?

## 1. The verdict

**May freeze after these fixes. No rework.** I found no path by which a
record is read, kept, dropped, paired or counted against C3, and none by
which a bad input or a crash gives a store that passes its checks.

- **One high finding, high by its consequence** (H1, section 3): the
  merge refuses a bucket-month above 12,000,000 rows. June 2025's largest
  bucket is at about 58% of that, and the later months are two to three
  times busier. After the freeze the limit could not be raised, so look 2
  could be left "not made" for a size. Found by reading, not seen on data.
  The supervisor approved its fix at 12:12Z.
- **Four medium findings** (section 3): a search with no end in the cut
  (measured: a file of long block lines runs 80 times slower), no finite
  guard on `sz` and `px`, a value outside `dirs.json` named one record at
  a time, and no reason kept for a failed record.
- **Sixteen low** (section 4): one guard on a hand-ruled file, one
  theoretical gap in the cut, the rest dead data, wrong comments, small
  duplicates, fallbacks and savings.
- **Seven questions**, each with a recommendation (section 9).

**E's store build should wait for the fix round** (section 10). Every
code fix changes `dist/copyh`, so the code's fingerprint, and a store built
before it is "of other code" to the integrity. No fix changes a kept
record or a count on real data.

## 2. What holds

Each line below was read against the rule it names.

- **The boundary** (`schema.ts`, C3): every field's check equals C3's
  wording; the cut's eight cases of key position (first, middle, last,
  alone, a run of cut pairs, nested, a value with an escape, a name left
  after the cut) each end in the right text or on the slow path; an id of
  16 digits or more is read from its digits on both paths, and an unsafe
  integer cannot pass as a number.
- **One class a record** (`scan.ts`): builder-dex and spot records by
  their coin's form, never parsed; then the boundary, the window, the
  `dir`'s kind, the coin. The classes' sum equals the records seen on
  every path, and K0 holds it for each file.
- **Pairing** (`market-trades.ts`, `writers.ts`, `merge.ts`
  `straddlesOf`): (coin, `tid`, `time`) in the file, then the next file in
  order; both records take the taker's reading; a record left alone keeps
  its own; two takers or two makers are listed and fail K1.
- **The bars** (`writers.ts` `barsOf`, `merge.ts` `barsUnit`,
  `crossPairsOf`): market takers in `time` order, ties in the file's; the
  sums, the latest price, the pairs within 2,000 ms in the second record's
  minute, the pair across two files, the stop on files out of time order,
  the left-out takers by cause, the Settlement sums of either side. The
  re-reader adds its floats in the same order and grouping, so K2 can hold
  the bars exactly equal (`Object.is`).
- **The holes** (`holes.ts`): exact for the union of the files' records,
  the window's two ends as outer bounds.
- **Parts and resume** (`part.ts`, `pass.ts`): each stretch of a part held
  to its SHA-256 when read; a part reused only for the same input, code
  and lists; the day rule on a day's whole total, again on a resumed pass.
- **The merge** (`merge.ts`): rows by (account, `time`), ties in the
  pass's order; a record of the switch hour's two files kept once and
  counted; a market taker twice, any other record twice and a third copy
  each a stop; units resumed from their records; the manifest last. Its
  one fault is a limit, not a wrong row (H1).
- **The twin and K0–K3** (`twin.ts`, `integrity.ts`, `reread.ts`,
  `digest.ts`): the manifests equal but for the run's fields; every file of
  the second read back; every kept record conserved file by file; the
  re-reader shares no parsing, pairing or bar code with the pass.
- **Seals and gate** (`seal.ts`, `gate.ts`, `main.ts`): the name before
  the real path; the roots by name and by real path; a key's date, a row's
  instant; S and FRESH-2 open only through `sealOf` on a freeze verified
  for that very command; before the freeze every command runs closed, and
  `--range S` stops at the seal (exit 5) before anything is made.
- **Exit codes** (`run.ts` `exitOf`, `main.ts`, `copyh.ts`): as C15 lists
  them.
- **The tests:** the cases cover every rule above by name, and the breaks
  round (207 of 209 killed) shows they bite. I found one title that
  promises more than its test holds (L4).

## 3. High and medium findings

### H1. The merge refuses a bucket-month above `UNIT_ROWS`

- **Where:** `merge.ts` lines 338–341. A month-group above `unitRows`
  (12,000,000) runs bucket by bucket; then one bucket's rows above it
  throw `StoreError` (exit 5): "a ruling sets a larger size".
- **What:** a bucket is 1/256 of the accounts, so one busy account is
  enough. Nothing smaller than a bucket exists to cut to.
- **How close** (counts from decisions 2026-11-26, the burn-in; no data
  opened): the largest account has 7,624,922 records in the burn-in's
  35.4 days, so about 6.5 million in June 2025; with its bucket's other
  accounts about 7.0 million, 58% of the limit. The limit is reached at
  1.7 times that month. The archive's bytes a day are about 0.39 GB on
  2025-07-01, 0.74 GB on 2025-07-28, 0.89 GB in June 2026 and 1.04 GB in
  October 2026 (external-apis): E's later months and all of S run two to
  three times mid-2025.
- **Why it is high:**
  - On E the stop comes in the merge, after the 12 CPU-hour pass.
    `UNIT_ROWS` is a constant of `merge.ts`, so the ruling is a code
    change: a new fingerprint, and the pass again.
  - After the freeze `merge.js` is a frozen file. C17 leaves a stop two
    outcomes: its cause removed without changing a frozen file, or the
    step not run. This cause cannot be removed, so look 2 would be "not
    made" for a size. S's sizes cannot be counted before the freeze.
  - It is a stop of RH1's kind (the rules review) with no written outcome
    and no valve; the heap has `COPYH_HEAP_GB`.
- **Why the refusal is not needed:** a unit's columns are typed arrays
  outside the heap (61 B a row: 0.73 GB at 12 million rows, 2.9 GB at 48
  million); on the heap it holds the rows' indices (16 to 24 B a row).
  The 1,765 MB measured at 12 million rows was mostly the dictionary of 3
  million accounts. The store does not depend on the unit size: the test
  "run a group above the unit size bucket by bucket, the same store" holds
  that.
- **The fix:** delete the refusal. `UNIT_ROWS` then only decides when a
  month-group is cut into its 16 buckets; a bucket above it runs as one
  unit, its rows in the unit's log line. The test's "refuse a bucket above
  it" becomes "a bucket above the unit size runs whole, the same store".
  One synthetic unit of 48 million rows in one bucket is measured, its
  peak written beside `UNIT_ROWS`. The count prints the ten largest
  bucket-months (a 256-number array a file in `Scan`, summed by the key's
  month in `countsOf`), so E's real sizes are known before its build. The
  rules gain one sentence: the merge's unit size is a ceiling like the
  heap, and no output depends on it.
- **State:** sent at about 11:13Z; approved as written at 12:12Z; in
  COPYH-STORE-FIX's round.

### M1. The cut searches each key to the end of its line (speed)

- **Where:** `schema.ts` `cutText`, lines 74 and 83:
  `b.indexOf(key, s)` and `b.indexOf(key, q)`. `Buffer.indexOf` has no end.
- **What:** a record that lacks a key searches on until the next record of
  the line that holds one, or to the line's end. `closedPnl` and `fee` are
  in every record; `builderFee` is in few. In `node_fills` a line is one
  record, so the search stops at once. In `node_fills_by_block` a line is
  a block, so the work grows with the square of a long line's records.
- **Why it matters:** the burn-in is `node_fills` only (the format ends
  2025-07-27), so the by-block path had never run on real data. E's
  largest lines reach about 14 MB (external-apis). Nothing is read
  wrongly; the crash hours would run far past a part's 15 minutes.
- **Measured** (section 7; made-up lines, no `builderFee`): the cut over
  one line of 10,000 records (3.9 MB) takes 8.5 s as built and 0.03 s on
  the record's own bytes; 20,000 records (7.8 MB) 33.9 s and 0.06 s; four
  times the work for twice the records. A file of 200,000 records through
  `scanFile` takes 2.1 s at 20 records a line, 35.7 s at 2,000 a line and
  168.4 s at 10,000 a line; with `builderFee` in every 20th record the
  last takes 2.1 s. The text cut is the same in every case.
- **The fix:** search the record's own bytes.

  ```ts
  /** The key's next place in [from, e), or -1: Buffer.indexOf has no end, and a record without the key would search the rest of its line. */
  const find = (key: Buffer, from: number) => {
    const k = b.subarray(from, e).indexOf(key);
    return k < 0 ? -1 : from + k;
  };
  ```

  Use `find(key, s)` and `find(key, q)` in place of the two `b.indexOf`
  calls; the tests `k < e` and `k + key.length > e` then go.
  `scan.ts` `positions` has the same open search (its second `indexOf`);
  it costs nothing while every record holds `"time":`, and is bounded the
  same way so the file has one rule.
- **State:** sent to the supervisor at 11:01Z; in COPYH-STORE-FIX's round.

### M2. No finite guard on `sz`, and none on `px`

- **Where:** `schema.ts` lines 146–150; `reread.ts` lines 350–353.
- **What:** `exactInDouble` counts significant digits only, so `sz` = "1"
  and 400 zeros passes and is stored as Infinity. `px`'s check is
  `Number(p) > 0`, which Infinity passes. The re-reader has the same two
  gaps, so K2 would agree. Decisions' queued sentence 10 names `sz` only.
- **Why it matters:** an infinite `sz` makes `chains.ts` throw
  (`BigInt("Infinity")`) when the account is read; an infinite `px` puts
  Infinity into a minute's Σ px·sz with no check. No real record has such
  a text. Both shown by running them (section 7). An `sz` so small that
  its double is 0 ("0." and 400 zeros and a 1) passes too; no lot is near
  it, and I would leave that one.
- **The fix:** `px`: `Number.isFinite(Number(p)) && Number(p) > 0`.
  `sz`: `exactInDouble(t) && Number.isFinite(Number(t))`. The same two in
  `reread.ts` in its own code. Tests: both texts refused by both readers.
  The queued sentence names `px` too.
- **State:** approved by the supervisor at 11:08Z; in the fix round.

### M3. A value outside `dirs.json` is named one record at a time

- **Where:** `scan.ts` `take`, lines 402–406 and 416–420.
- **What:** a build stops at the first record whose `dir` or coin is
  outside its list. Every part names `dirs.json`'s hash, so after the
  ruling the whole pass runs again. Before the freeze the `count` command
  lists every value first. At step 2 and at FRESH-2's stage it cannot:
  `count` runs only under the closed seal.
- **Why it matters:** values that arrive together (a new product's three
  operations in one hour) would still cost one round each of ruling,
  re-freeze and pass, on months just opened. No wrong result.
- **The fix:** in `take`, count the value always, as the counting run does
  (the record not kept). In `Scanner.finish`, for a build:

  ```ts
  if (!this.lists.counting && c.unknownDir + c.unknownCoin > 0)
    throw new StoreError(
      `${this.key}: outside the lists, each with its count: dirs ${JSON.stringify([...this.scan.unknownDirs])}, coins ${JSON.stringify([...this.scan.unknownCoins])}: a ruling`,
    );
  ```

  The stop then names every unknown value its file holds; no part is
  written; the pool stops as now. A wider choice for the steps' builder is
  in Q4.
- **State:** approved at 11:11Z (my A1); in the fix round.

### M4. The program never says why a record failed

- **Where:** `scan.ts`: `classes.failed` is a number; six places add to it.
- **What:** the burn-in's 628,022 failures needed a scratch script to
  explain; its last two are still unexplained. C3 (RH1 (d)) says that at
  step 2 a day over the limit is ruled by an entry that "lists the failing
  records' shapes". Then the only way to list them would be a script
  outside the frozen program, on sealed months.
- **The fix:** a tally `failedBy` in `Scan`, `ScanJson`, `countsOf` and the
  manifest's counts: "frame" (not `["0x…",{…}]`), "parse" (its text is no
  JSON), "line" (a line that fails its own shape, each of its records),
  else the schema's first refusal as its field path, never a value (a
  helper in `schema.ts` runs `RecordSchema.safeParse` again on the failed
  record and returns `issues[0].path.join(".")`). K0 holds Σ `failedBy` =
  `failed` for each file. About 25 lines.
- **State:** approved at 11:08Z; in the fix round, so E's count explains
  its own failures. The rule's sentence goes to COPYH-RULES-2.

## 4. Low findings

Each is small. "Fix round" marks those the supervisor approved at 11:11Z.

- **L1. `dirs.json`'s kinds are not held to C3's text** (`dirs.ts`
  `DirsFile`). The market rule reads the literal dirs (`ADL_DIR`,
  `SETTLEMENT_DIR`, `VAULT_DIR`); `forced` and the vault accounts read the
  kind. A slip in a hand ruling ("Settlement" as `trade`) would make
  entries of settlement records with no check. Fix: one refine: for every
  listed dir, `(dir === VAULT_DIR) === (kind === "vault")` and
  `(dir === ADL_DIR || dir === SETTLEMENT_DIR || dir.startsWith("Liquidated ")) === (kind === "forced")`.
  The nine committed values pass it. Fix round (first, before E's dirs are
  ruled).
- **L2. An escaped key slips the cut** (`schema.ts` `cutText`).
  `"\u0066ee":"0.5"` is the key `fee` to `JSON.parse`; neither `KEYS` nor
  `NAMES` sees it, so on the fast path the value reaches the parsed object.
  Zod then drops it and nothing reads it, but C3 says "never reach an
  object". The archive's writer does not escape keys. Fix: the last line
  becomes
  `return NAMES.some((n) => text.includes(n)) || text.includes("\\u") ? null : text;`.
  Shown by running it: the fast path's object holds the key `fee`, the
  record past the schema does not. Fix round.
- **L3. `Scan.runs` is dead data** (`scan.ts` lines 82–83, 460–464;
  `part.ts` lines 105, 290). `blockSeen` fills it; it is written into
  every part header, count file and `files.jsonl` line; no COPY-H code
  reads it (the analyzer's G1 did). Remove `runs`, `blockSeen` and
  `ScanJson.runs`; the `block_number` test that sends a line to the slow
  path stays. Fix round.
- **L4. Wrong comments, and one test title.** `scan.ts` line 75:
  `Scan.coins` says "[iid, count, first time, …]"; the tuple is [count,
  first time, last time, first "Settlement" time or -1], keyed by iid.
  `market-trades.ts` line 54 and `store.ts` line 73 say a third record of
  a trade is listed as odd; the code leaves it waiting, so it ends in the
  unpaired list (K1 still sees it in a middle file).
  `copyh-market-trades.test.ts` line 200 is titled "… lists a third record
  and two takers" and holds no third record: add one or retitle.
  `writers.ts` line 274 says "a loop, not a spread" above three spreads
  into an array; the comment means `Math.min(...times)`. Fix round.
- **L5. The count's identity is read after the work** (`main.ts` `count`,
  lines 249 and 267): `fingerprintOf` runs again when `counts.json` is
  written. Fix: once at the top, as `build` does. Fix round.
- **L6. The literal "backstop"** (`writers.ts` line 182) where
  `market-trades.ts` reads `BACKSTOP_METHOD`. Fix round.
- **L7. A counting run builds `new Writers()`** it never uses (`pass.ts`
  line 174). Fix round.
- **L8. The merge builds its dictionaries with no budget check**
  (`merge.ts` lines 254–276). Every part's addresses are read (E: 8,845
  parts) before the first `due()`, so this part can start after the 14
  minutes are spent or inside a closed window. Fix: `due()` as the first
  line of the `else` branch.
- **L9. `barsUnit` names `lastTime` twice** (`merge.ts` line 680):
  `BARS` already holds it, so each coin allocates one array more and drops
  it. Fix: `BARS.map(([n]) => n)` alone.
- **L10. Needless fallbacks.** `chains.ts` lines 66–67:
  `Math.sign(side) || 1` (a side is +1 or −1). `main.ts` lines 343–348: an
  empty list when `copyh/unpaired.json` is missing; the file is committed
  and the freeze requires it, so a missing one should stop like a missing
  `coins.json`. `main.ts` line 371: `lists.kinds ?? []` after
  `listsOf(false)`, which cannot return null kinds.
- **L11. Unused, or exported for nobody.** `coins.ts` `checkAppendOnly`
  has a test and no caller: it belongs in the freeze tool's check of a
  later list (part 5), which should be said where it stands. `seal.ts`
  `endOf` has no caller in `src`. `export` is not needed on `run.ts`
  `COPYH_DIR`, `gate.ts` `SCOPE`, `merge.ts` `straddlesOf` and
  `crossPairsOf`, `integrity.ts` `FILL_FILES` and `BAR_FILES`.
- **L12. Small duplicates.** `run.ts` `inside` and `seal.ts` `isIn` are
  one function. `MINUTE_MS` is defined again in `writers.ts`, `merge.ts`
  and `integrity.ts` while `scan.ts` imports it from `schedule.js`
  (`reread.ts` keeps its own on purpose). `count.ts` `countsOf` and the
  manifest's counts in `merge.ts` (lines 413–436) fold the scans with two
  copies of the same loops. I would fix the first two and leave the
  third: one caller reads count files, the other part headers.
- **L13. Names.** `GateFailed` and its event "a gate failed" stand for
  exit 6, which C15 calls "a check failed"; in COPY-H "the gate" is the
  freeze's. `extractFile` keeps the analyzer's word for what is here one
  file into its part. Rename the first if any name is touched; leave the
  second.
- **L14. `extractFile` turns every error of the scan into "not ready"**
  (`pass.ts` lines 189–192): a programming error inside `scanFile` would
  exit 5 with its message, not 1. The message is kept, so nothing is
  hidden. I would leave it and say so in the comment.
- **L15. The run logs are deleted after 30 days.** `log.ts` `createLog`
  prunes `copyh-<day>.log` files older than 30 days at every start. Step
  2 follows step 1 by weeks and FRESH-2's stage by months, so step 1's
  logs (its start line, the units' times, the peaks) are gone by then
  unless copied. `log.ts` is shared and not frozen; the simple answer is
  procedure: copy `COPY-H\logs` beside each step's outputs when the step
  ends.
- **L16. Three small savings, optional.** `market-trades.ts` keeps every
  paired trade in `settled` (two objects a trade, millions in the crash
  hour) to set the flags at the file's end; `add` could return the pair
  and `Writers` set both flags at once. `merge.ts` `fillsUnit` builds a
  key string and a Map entry for every row to find repeats, and
  `integrity.ts` `firstUnit` a Map for every (account, `time`) run; both
  could pass over a run of one row. None changes an output. Take them
  only if the rehearsal's times ask.

## 5. The burn-in's lessons

- **The `startPosition` fix (`d42b96a`) is right and whole.** The pass
  (`exactAsDouble`) and the re-reader (`exactDouble`, its own code) read
  the text as its double and hold the double's shortest text to 15
  digits; the store keeps that double; `chains.ts` works on the same
  shortest text as a scaled integer, so the chain rule stays exact. A
  text whose residue moves the double to a neighbour of the lot value
  still fails, which is the careful side. Run on made-up texts with a
  residue of 1e-10: "12345678.0000000001" and "1234567.1200000001" pass
  (their doubles are 12345678 and 1234567.12); "123456.7800000001" and
  "1234567.8900000002" fail (a double of 16 or 17 digits). So a residue
  is absorbed only where the double is coarser than it, from about seven
  whole digits; E's count will show how many records fall on the other
  side.
- **The two records that still fail.** K1 passed with only the four
  hole-edge records, so neither failed record left a kept partner
  unpaired. So they are either the two records of one trade, failing on a
  field both share (`sz`, `px`, `time`, `tid`), or records that are not
  kept anyway (a spot or builder record with a bad frame or time). A
  one-sided failure on `startPosition` is ruled out by K1. `failedBy` (M4)
  answers it in E's count without a script.
- **The four hole-edge records.** Each is the last record before a hole in
  `node_fills`, where a line is one record, so the node stopped between a
  trade's two lines. In `node_fills_by_block` both records of a trade
  stand in one block's line, so a hole between lines cannot split a
  trade. The cases therefore end with the format, on 2025-07-27, inside
  E. See Q2.
- **E's busier months against the sizes** (section 6): one limit can be
  reached, the merge's refusal of a bucket-month (H1); no other. The
  by-block path itself was new to real data; M1 is what the read found
  there.

## 6. Sizes and limits on E

Walked by reading, with the crash hour's 2,100,288,284 B (97.8% of 2^31)
and a line of 14 MB in mind:

| Place | Limit | On E |
|---|---|---|
| The pass's decode | none: block by block (4 MiB), a line carried across blocks | safe past 2^31 |
| A part's payload, one Buffer | 2^31 B by `readFileSync` and `Buffer.concat` | about 0.4 GB for the crash hour (58 B a row) |
| The re-reader's decode buffer | 2^53; `Buffer.indexOf` past 2^31 | about 2.10 GB (501 blocks of 4 MiB), searched in 256 MB windows; measured at 2.5 GB by COPYH-STORE-2 |
| `files.jsonl`, one string | about 2^29 characters | about 0.12 GB for E's 8,845 lines |
| A Map or Set | 2^24 entries | the addresses of a range: under 3 million measured; every other Map is small |
| `file` u16, `iid` u16, `dir` u8, `method` u8 | 65,535; 65,535; 256; 254 names | 8,845 files; 235 coins; `dirs.json`; two methods seen |
| A merge unit | `UNIT_ROWS` 12,000,000: above it a month-group runs bucket by bucket; **a bucket above it is refused** | June 2025: about 9.4 million rows a month-group, about 7.0 million in its largest bucket. E's later months pass the first; one bucket can pass the second (**H1**) |
| An integrity unit | `UNIT_BYTES` 2 GiB of whole partitions | a bucket-month is about 0.1 GB |

**The merge holds every part's header in memory** (`headsOf`): 850 in the
burn-in, 8,845 on E, each with its scan, 16 groups and up to 235 coins. I
estimate 1 to 1.5 GB of heap on E beside the dictionary, under the 8 GB
ceiling; the rehearsal's peak will show it.

## 7. What I ran

All in a scratch copy (`git archive 0ec4835` in the scratchpad, its own
`dist`, its `node_modules` a real folder of seven junctions, removed link
by link at the end), below normal priority, under `verify\VERIFY.lock`
from 12:13:26Z to 12:20Z. Nothing ran in 10:25–11:15Z. No pnpm; no file
of the repository touched.

- **The build:** `tsc -p tsconfig.build.json`, exit 0.
- **The store's 18 test files** (vitest 5.0.5, 4 workers): 18 of 18 files
  and 188 of 188 tests passed, none skipped, in 26 s. Read from the JSON
  report's counts, not only the exit code.
- **The boundary** (`exp-boundary.mjs`, through the compiled `recordOf`,
  `cutText`, `parseFast`, `chainCount`):
  - `sz` and `px` of "1" and 400 zeros are kept, as Infinity;
    `startPosition` of the same text is refused;
  - `chainCount` with an infinite `sz` throws "Cannot convert Infinity to
    a BigInt";
  - a record with the key `"fee"` passes the cut unchanged, and the
    fast path's object holds `fee`;
  - the `startPosition` shapes of section 5.
- **The cut's search** (`exp-cut.mjs`; made-up block lines of records of
  about 390 B with no `builderFee`; "bounded" is the same function given
  the record's own bytes):

  | Records in one line | Line | As built | Bounded |
  |---|---|---|---|
  | 1,000 | 0.39 MB | 86 ms | 4 ms |
  | 5,000 | 1.96 MB | 2,049 ms | 13 ms |
  | 10,000 | 3.91 MB | 8,462 ms | 29 ms |
  | 20,000 | 7.82 MB | 33,946 ms | 55 ms |
  | 40,000, `builderFee` in every 20th | 15.79 MB | 192 ms | 104 ms |

  The cut text is equal in every case. Through `scanFile` (a counting
  run), 200,000 records in all:

  | Lines × records | Seconds |
  |---|---|
  | 10,000 × 20 | 2.1 |
  | 1,000 × 200 | 5.1 |
  | 100 × 2,000 | 35.7 |
  | 20 × 10,000 | 168.4 |
  | 20 × 10,000, `builderFee` in every 20th | 2.1 |

  About 2.3 GB a second is searched. By the square rule one line of
  40,000 such records (the size of the archive's 14 MB line) would take
  over two minutes.
- **A scan of the exports** (`unused-exports.cjs`, text only): L11's list.

The scripts and their outputs stay in the scratchpad
(`COPYH-STORE-REVIEW\exp\`, `out\`); the numbers above are copied from
them.

## 8. The queued rule sentences against the code

Decisions 2026-11-26, "Queued for the rules' last touch":

| # | Sentence | Does the code do it? |
|---|---|---|
| 1 | another repeated record is a stop | Yes: `merge.ts` `fillsUnit`, a record twice outside the switch hour's two files, and a third copy inside them (exit 5) |
| 2 | the heap cap | Yes: `run.ts` `heapOf`, a whole number above 8 and at most 20, else exit 2 |
| 3 | holes at the ends | Yes: `holes.ts`, the window's start and end are the outer bounds |
| 4 | a line that does not tile | Yes: `scan.ts` `slowLine`, parsed whole; one that fails counts its records, one when none can be counted; the re-reader counts the same |
| 5 | C0's funding seal by time | Yes: `funding.ts` `sealedRows` checks each row's `time`, not its nominal hour |
| 6 | the burn-in's sample days | Yes: `range.ts` `sampleDaysOf`; a day without a file of the range is skipped |
| 7 | `startPosition` read as its double | Yes, in both readers (section 5) |
| 8 | LABEL_FILLS_MAX, HISTORY_FILLS_MAX | The engine's; not reviewed here |
| 9 | FRESH-2's sample days | Not yet: `range.ts` has no FRESH-2 range and `design.ts` no days for it. They come with the `fresh2` stage (Q7) |
| 10 | a finite guard on `sz` | No (M2); `px` needs it too |

Two more sentences follow from this review: `failedBy` (M4), and the
store's four liquidation states. C3's store sentence says "the liquidation
(none, own or counterparty)"; the code keeps a fourth, a `liquidation`
object that names no account (`UNNAMED_LIQUIDATION`), which the boundary
allows.

## 9. Questions, each with a recommendation

- **Q1. The fingerprint's scope** (the supervisor's question, 11:03Z).
  `fingerprintOf` covers every file of `dist/copyh`, the engine's too, so
  an E store built before the engine is final is "of other code" to K0
  and to a resumed pass. **Recommendation: keep one fingerprint.** A
  second, store-only fingerprint needs a hand-kept list of the store's
  files, and a file missed from it errs on the unsafe side (a store called
  the same code when it is not). Instead:
  1. land every store fix before E's store is built, from a pinned build;
  2. `rehearsal.json` names the commit that built the rehearsal's store,
     the store's manifest SHA-256, and the SHA-256 of its manifest without
     the run's fields (`twin.ts`'s canonical form);
  3. the rehearsal's later parts read the store through its manifest (the
     engine's readers hold each file to its line and do not ask the code);
  4. step 1 builds E twice by the frozen program in any case; it prints
     whether its build's canonical manifest equals the rehearsal's, as
     C15 (c) 10 does for the priced fortnight, deciding nothing. Equal
     means the rehearsal's store is byte for byte what the frozen program
     builds.
- **Q2. K1: accept a record at a hole's start by rule?** **No: keep
  listing each.** The cases belong to `node_fills` (section 5), which ends
  inside E, where the rehearsal lists every one before the freeze. In the
  by-block months an unpaired record in a middle file would be something
  new, and should stop.
- **Q3. The day rule's denominator.** `pass.ts` divides the failed records
  by every record seen, spot and builder-dex records among them, which are
  never held to the boundary. That is C3's sentence read word for word.
  Builder dexes appear from December 2025 (external-apis) and thin the 1%
  line as their share grows. **Recommendation: keep the code; add to C3
  "of all its records, the spot and builder-dex ones among them"**, so the
  reading is chosen, not met.
- **Q4. Values outside the lists at step 2.** M3 names a file's values
  together. Values that first appear weeks apart still cost a round each.
  The steps' builder could run the counting pass on the stage first and
  stop with every value (one more scan, about a third more pass time).
  **Recommendation: M3 only**; new values are rare and the scan is not.
- **Q5. The bucket mode's speed on E** (beside H1, which is about its
  refusal). A month-group above 12 million rows runs bucket by bucket:
  each of the 16 units reads and hashes the group's whole stretch of
  every part of the month again. June 2025 stayed under it, so real data
  never took this path; most of E will. **Recommendation: measure the
  merge at the rehearsal;** if the 16-fold reading dominates, raise
  `UNIT_ROWS` before the freeze from H1's 48-million-row measurement,
  rather than change the merge.
- **Q6. One-sided failures and K1.** A record that fails the boundary
  leaves its trade's other record unpaired in a middle file, which K1
  stops on. Before the freeze that is one more line in
  `copyh/unpaired.json`; at step 2 it is C0's route for each.
  **Recommendation: read `failedBy` in E's count first.** If the failures
  are two-sided or none, leave it. If one-sided ones exist, rule before
  the freeze how K1 reads a record whose partner failed.
- **Q7. FRESH-2's range and sample days** (queued sentence 9) are not in
  the code. **Recommendation:** add them with the `fresh2` stage: a range
  in `range.ts`, the six 15ths (2026-12-15 to 2027-05-15) in `design.ts`
  and C18.

## 10. For the fix round and E's runs

- **In COPYH-STORE-FIX's round** (approved 11:03Z to 12:12Z): H1, M1, M2,
  M3, M4, L1 to L7.
- **Still to decide, small:** L8, L9, L10, the first two items of L12, and
  L11's `export` words. Each changes `dist/copyh`. If taken, take them
  before E's store is built.
- **Leave:** L13's second name, L14, L12's third item; L16 unless the
  rehearsal's times ask.
- **Procedure:** L15; Q1's four steps.
- **The order:** the count may run once the round is in; the build after
  every accepted code change, from a pinned build.

## 11. What the checks do not see

Stated once, so nobody counts on more:

- **Bars outside the 15 sample days** are held by the twin and the tests
  only. The twin sees a fault in one run, not an error both builds share.
- **The rows' order** in a partition (account, `time`, the pass's order)
  is not in K2: its digest is the same whatever the order. The merge's
  tests and the engine's reader hold it.
- **The holes** have one implementation; the re-reader does not compute
  them.
- **A part's header** (the scan's counts, the unpaired list, the bars'
  first and last taker) carries no hash of its own; a flipped bit there
  shows as a twin difference, not at the read.
- **The count** has no twin; its numbers are for rulings, not for a
  verdict.

## 12. Access

- The repository at `0ec4835`, read; the snapshot, built and run in the
  scratchpad only.
- No file on F: opened. At 11:00Z I listed the names at the top of
  `F:\polymarket-follow-research\COPY-H\` (burnin, coins.json, funding,
  logs) to see whether E's count had started; nothing was opened.
- The supervisor's folder: my own `workers\COPYH-STORE-REVIEW\`, and
  `verify\VERIFY.lock` as the supervisor asked at 10:51Z.
- Four messages to the supervisor before this review, as it asked at
  10:51Z for anything that could not wait: the fingerprint and M1
  (11:01Z); M2, M4 and L3 (11:07Z); M3, L1, L2, L4 to L7 (11:10Z); H1
  (about 11:13Z). Each stamp was written from that turn's earlier
  `date -u`, so the real instants are a minute or two later. A usage
  limit stopped the session from about 11:13Z to 12:12Z.
