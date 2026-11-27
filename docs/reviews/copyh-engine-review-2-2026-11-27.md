# COPYH-ENGINE-REVIEW-2 — the fresh code review of COPY-H's engine, commits 9–16, 2026-11-27

*A review decides nothing: the supervisor copies what it concludes into
decisions, the code and the rules, or it does not exist.*

**Who and how.** COPYH-ENGINE-REVIEW-2 (Fable 5.2, max, fresh; the builders
were Opus 5.5), 2026-11-27 08:15Z → 09:02Z (every time from `date -u`).
Read only: no file of the repository is changed but this review and its
README row; no network; no data on F:. The code is the commit `8c0310c`
(COPYH-ENGINE-8's commit 16b), read from a `git archive` snapshot in the
scratchpad and as `git diff b689dbc 8c0310c`. Two commits landed while I
read (`a9d923a`, docs; `643450e`, main.ts's options given twice): not
reviewed. `copyh/rules.md` is `200fa7fc…d04e`, as at the first review.

**Read in full:** CLAUDE.md; code-rules; architecture's COPY-H section;
decisions' COPY-H entries of 2026-11-26; the first review
(`copyh-engine-review-2026-11-26.md`, `3111dcf`); `copyh/rules.md` C0–C2,
C4–C16 and C18; the engine's plan. The code: `engine.ts`,
`engine-worker.ts`, the ten `phase-*.ts`, `prints.ts`, `steps.ts`,
`tries.ts`, `rounds.ts`, `choice.ts`, `confirm.ts`, `fresh2.ts`,
`known.ts` (6,253 lines), with `run.ts`, `design.ts`, `seal.ts`,
`verdict.ts`, `twin.ts` and the parts of `markets.ts`, `judge.ts`,
`store.ts`, `range.ts` and `funding.ts` they call; the diffs of `main.ts`,
`gate.ts`, `stores.ts`, the first review's fixes (`484573c`, `d013327`,
`4c3c8b7`), the store fix (`21d2a11`) and `tools/copyh-freeze.cjs`;
`reproduce.ts`'s L7 rework (`e1f8dc9`) and its readings, judgement and
answers; the kit's `leg` and `dAgainstNull`.

**Run** (a scratch copy with its own `dist`, one file at a time): sixteen
of the engine's test files, 174 of 174 tests pass. Five probes of my own
(section 8).

**The question:** does the engine's code from commit 9 on do exactly what
its rules say, and is it simple?

## 1. The verdict

**Commits 9–16 may freeze after these fixes. No rework.**

The logic is right. Every refusal a rule names is there with its exit
code, before the data it guards is read; each step holds its inputs to
their records; Holm's step-down, the
choice and the sealed judgment are C14's, sentence for sentence; no step,
round or choice reads a month before its gate opens it. I found no path
to a wrong number.

What is wrong shows only at full size or after a crash, and nothing before
the freeze runs those paths on real months: the rehearsal may price
nothing (M9). Each finding below is a stop after the freeze that a small
change now removes.

- **One high** (section 3). H1: PRICES gives a coin's positions as one
  buffer, and Node refuses a write of 2 GiB or more (measured). By
  arithmetic on the plan's own count of MAIN's copies, the largest coin's
  part is likely to pass that by step 2.
- **Four medium** (section 4). M1: a heap raised in the middle of a step
  makes every closed phase "of other inputs". M2: RESULT keeps every voted
  copy's readings in memory: by the same count near the 8 GB heap at step
  1 and above it at step 2. M3: a part torn by a crash is never taken, but
  it is met late and under another name. M4: two prints the rules name
  are not in the report, C13's calibration and MAIN without its gap
  copies (C11).
- **Seven low** (section 5).
- **No fix touches a store-closure file** (section 7). E's store need not
  be rebuilt for anything here.
- **Seven questions**, each with a recommendation (section 9).

## 2. What holds

Each line was read against the rule it names.

- **The runner** (`engine.ts`; C15's guard): each part twice, copy a by one
  pool of children and copy b by a new pool, so a part's two copies never
  share a process; both hashed whole from disk; a record only when every
  pair is equal, else exit 7 with the parts named and no record. A part's
  header holds its phase, id and inputs; a part or record of other inputs
  is exit 5. A child's refusal keeps its exit code; a child that dies is a
  crash (exit 1). Later phases read copy a held to the record
  (`heldPart`, `partLines`, `partBytes`).
- **The chain of records:** every phase names, in its parts' inputs, the
  code's fingerprint, the stores' manifests, `dirs.json`, the funding
  list and the earlier phases' records, each by SHA-256. A run of other
  inputs over closed phases is refused at the first phase that differs
  (the end-to-end test, and my reading of each `*Inputs`).
- **C5, C2** (`phase-labels.ts`): the vault accounts left out before any
  label; "no fills in window" from the 14 days' count; the cap before the
  lane; C5's capture `[max(ARCHIVE_START, M − 90 d), M)`. Every `count`
  and `rows` lies inside the window read (the first review's L2).
- **C4–C8, C10's members, C11** (`phase-build.ts`): the fills' count
  before the kit, the exit rows before `buildEntries`; a P1 account's
  habits and lines at its P1 Mondays; an entry a copy only at a Monday
  where its account is P1, in a primary market; the plan to the coin's
  end; the vote by END; the keys of the week of M cut at END, with the
  lines' mask. Two entries of one id stay two copies in the kit's order
  (stable sorts in BUILD, PRICES and the fortnight; RESULT's merge keeps a
  part's order). The prior count reads a copy's latest instant by a loop.
- **C10** (`phase-removal.ts`): the kit's `removalOf` a Monday and a line
  at a time, a trade between two members counted once.
- **C16** (`phase-tripwire.ts`, `steps.ts` `tripwireStop`): MAIN's voted
  set at steps 1 and 2; each chosen try's set on S and each judged set on
  FRESH-2, without the conditions on the prior mean net, which the stop
  names; above 1% exit 6 unless `--past-tripwire`, read again at every
  resumed run; `--past-tripwire` is in no part's inputs.
- **C7–C11, C13** (`phase-prices.ts`): the money on the VWAP object with
  the taker setting; d and x′ a line with that line's table; STOP by
  `stopInstant`, DAYS7, JUMP, the four moved lines each on its own delay
  and marks; the cascade's and Binance's prints. x′ cannot fail where d
  exists: the kit's `dAgainstNull` reads "entry unpriced" from the same
  `leg` (read in `nulls.mjs` and `returns.mjs`).
- **C7's RANK, C14's prior mean net** (`phase-rank.ts`): priced MAIN
  copies whose latest instant lies before M; the sums in PRICES' parts'
  order in the engine and in the fortnight alike.
- **C12, C15's writes** (`phase-result.ts`, `steps.ts` `writeLook`): the
  look's set is MAIN's copies voted by END; z 2.81 and 2.43; "after the
  verdict" from the earlier looks. The positions' lines are hashed as they
  come, written gzipped to a temp in the engine folder, held to RESULT's
  count and hash (exit 6), then `result.json`, the rename, `report.json`.
  Nothing about an outcome is logged: children never log, and the parent
  logs counts, seconds, peaks and hashes.
- **C13** (`prints.ts`): each print of R14's list, the lines, the parts,
  the venues, H1's, concentration, settled, thin and cascade was held to
  C13's text, and the step's counts to its last items; all are there but
  two (M4).
- **C15's step 1** (`steps.ts`): the four refusals, each exit 5, before
  anything is read (a second run first, then the rehearsal's store, the
  reproduction, the unset values). A′:
  the first build's manifest held to E's record field for field but for
  the run's four fields, every file then read whole by K0; the twin built
  only when they differ; both comparisons in `builds.json`. The identity
  is C0's list, item for item.
- **C15's step 2:** the refusals before S is read; step 1's three files
  held to `copyh/look1.sha256`, E's store to step 1's `result.json`; step
  1 recomputed on E's store alone, rows cut at END_E, and held to the
  positions' count and hash (exit 6); look 2 on E ∪ S; CONFIRM.
- **C14** (`tries.ts`, `rounds.ts`, `choice.ts`, `confirm.ts`,
  `fresh2.ts`, `phase-confirm.ts`, `phase-sealed.ts`): a try is data, an
  unknown covariate or key refused; the rounds' refusals; a try's set and
  figures; the choice's four conditions and its ties; s, Holm's order and
  the bars 2.24 and 1.96, the second tested on the first's s alone; the
  sealed readings at 1.96 and 1.645; FRESH-2 judged only on a KEEP or a
  confirmed try, refused before FRESH-2's store is read. The nine
  sentences equal C14's text character for character (my probe).
- **The seals** (`seal.ts`, `main.ts`): step 2's and FRESH-2's raw stores
  are checked only after the gate, under its seal; a step's engine folder
  is closed to every reader but that step's engine; step 2's recompute
  lies in `look2\engine\look1`, FRESH-2's funding list in `fresh2\engine`.
- **The first review's fixes** (M1, M2, L1–L10): each is in as asked.
  `stores.ts` `rangeFiles` gives FRESH-2 the keys its list holds and
  leaves `range.ts` alone.
- **The store fix** (`21d2a11`): a "#" coin is read by its form from the
  text, before any parse, in the pass and in the re-reader alike;
  `chains.ts`'s loop is right.
- **The reproduction's L7 rework** (`e1f8dc9`): entries keyed by id and
  ordinal in both paths, each compared; a known id of two refused.

## 3. The high finding

### H1. PRICES gives a coin's positions as one buffer: 2 GiB or more cannot be written

- **Where:** `phase-prices.ts` lines 298–309 (`pricesPart`: every position
  of the coin in an array, a buffer a line, `Buffer.concat(lines)`);
  `engine.ts` lines 122–125 (`runJob`: a second `Buffer.concat` with the
  header, then `writeUnflushed`, one `writeFileSync`).
- **What:** one write takes at most 2³¹ − 1 bytes. Measured on this
  machine (Node 24.13.0, 2026-11-27): a buffer of 2,147,483,647 bytes
  passes the length check; one of 2,147,483,648 throws `ERR_OUT_OF_RANGE`
  from both `writeSync` and `writeFileSync`. So a part of 2 GiB or more
  fails in its child: exit 1, and every resume meets it again.
- **Can a coin's part be that large?** A MAIN position's line is about
  3.7 KB and a BROAD-only one about 1.35 KB (the schema's fields with
  three exits; my probe). The plan's power table gives about 39,000 MAIN
  copies a week (2026-11-25, from a 1/32 slice). MAIN's lines alone are
  then about 7.0 GB over E's 48 weeks, 10.4 GB over step 2's 72 and
  14.2 GB at FRESH-2's stage. For one coin, against the limit of 2.147 GB:

  | The coin's share | BROAD-only copies | Step 1 | Step 2 | FRESH-2's stage |
  |---|---|--:|--:|--:|
  | 15% | none | 1.04 GB | 1.57 GB | 2.13 GB |
  | 15% | twice MAIN's | 1.80 GB | 2.70 GB | 3.68 GB |
  | 20% | none | 1.39 GB | 2.09 GB | 2.84 GB |
  | 20% | twice MAIN's | 2.40 GB | 3.60 GB | 4.91 GB |
  | 30% | none | 2.09 GB | 3.13 GB | 4.26 GB |

  The share and BROAD's size are not known to me (no data was opened);
  the table is arithmetic on the plan's count. The largest coin passes
  the limit by step 2 in three of the five rows and by FRESH-2's stage in
  four; the fifth ends 1% under it.
- **Memory beside it:** the child holds the coin's positions as objects,
  their lines, and two concatenations: three times the part's bytes
  outside the heap. The first coins by iid run side by side, and they are
  BTC (0) and ETH (1).
- **Why high:** PRICES never runs at full size before the freeze (M9: no
  file of priced copies). The first run that can show this is step 1,
  after the freeze. The fix then goes by C0's route: a new list, the
  reproduction again, every engine part computed again.
- **The fix,** in three files outside the closure:
  1. `engine.ts`: a part's bytes may come as chunks, written through one
     file descriptor, flushed, then renamed:

     ```ts
     /** A part's bytes: whole, or as chunks in order for a part that can pass 2 GiB. */
     export type PartBytes = Uint8Array | Iterable<Uint8Array>;
     // PartFunction returns PartBytes | Promise<PartBytes>.

     function writePart(file: string, header: string, bytes: PartBytes): void {
       const fd = openSync(`${file}.tmp`, "w");
       try {
         const put = (b: Uint8Array) => {
           for (let at = 0; at < b.length;)
             at += writeSync(fd, b, at, Math.min(b.length - at, 2 ** 30));
         };
         put(Buffer.from(`${header}\n`));
         for (const chunk of bytes instanceof Uint8Array ? [bytes] : bytes)
           put(chunk);
         fsyncSync(fd);
       } finally {
         closeSync(fd);
       }
       // then the rename, a refused one tried again RENAME_TRIES times.
     }
     ```

     `runJob` calls `writePart(job.file, job.header, bytes)` in place of
     `writeUnflushed`. The rename's retry is a copy of `run.ts`'s
     `renameOver` loop on its exported `RENAME_TRIES` and
     `RENAME_PAUSE_MS`: **`run.ts` is a closure file and is not edited.**
  2. `phase-prices.ts`: `priceCoin`, `coinPositions` and `pricesPart`
     become generators (`function*`): a copy is priced, its line joined
     into a chunk of about 1 MB, the chunk yielded. Neither the positions
     nor the lines are held whole. The fortnight's loop and the tests'
     `const [pos] = priceCoin(…)` read a generator as they read an array.
  3. `phase-build.ts` line 528 can return `[index line, ...lines]` (an
     array literal, no call) in place of `Buffer.concat`: no copy, and no
     limit for a bucket's part either.
- **Tried** in my scratch copy (`engine.ts` +48 −7, `phase-prices.ts`
  +25 −14, with M3's flush and L1's second condition): `copyh-engine` 10,
  `copyh-phase-prices` 3, `copyh-phase-result` 10, `copyh-phase-tripwire`
  9 and `copyh-steps` 21 pass on it. The copy was then restored to the
  commit (both files' SHA-256 equal to `git show 8c0310c:`'s).
- **Tests to add:** a part given as chunks has the bytes, the record and
  the resume of the same part given whole; a part of many chunks read back
  by `partLines`.
- **Know the size before the freeze:** BUILD's index holds each coin's
  copies' bytes, and the rehearsal runs BUILD on all of E without a price.
  Its print of the largest coin's copies by line projects PRICES' largest
  part (question 2).

## 4. Medium findings

### M1. The lanes' thresholds put the heap into every part's inputs

- **Where:** `steps.ts` lines 1186–1189 (`engineRunOf`: `lanes` from
  `laneLabelFills(o.heapGb)` and `laneHistoryFills(o.heapGb)`);
  `phase-labels.ts` lines 53–54 and 105, `phase-build.ts` lines 72–73 and
  99 (`lane` is in LABELS' and BUILD's inputs).
- **What:** `engine.ts`'s header and decisions (2026-11-26, the builders'
  technical calls) say a part's identity holds no heap. It does, through
  the lane: at 8 GB the label lane is 3,500,000 fills, at 12 GB 5,250,000.
  A step started at one `COPYH_HEAP_GB` and resumed at another finds
  LABELS' record "of other inputs" (exit 5, `engine.ts` lines 313–316),
  and every phase after it hangs on that record.
- **Why it matters:** raising the heap is the one legal answer to a child
  that runs out of memory after the freeze (C15: a later ceiling, never a
  smaller one), and PRICES, RANK and RESULT are the phases no rehearsal
  can measure (M2). As built, that answer costs the whole engine again,
  LABELS first.
- **The fix:** the lanes do not scale. In `engineRunOf`:

  ```ts
  lanes: { labelFills: LANE_LABEL_FILLS, historyFills: LANE_HISTORY_FILLS },
  ```

  and `laneLabelFills` and `laneHistoryFills` are deleted, with "scaled by
  the heap" in their two comments. An account past the base thresholds
  runs in the large lane at any heap: always safe, and the lanes change no
  output. The test belongs to C15 (b)'s world: a step stopped (exit 3) and
  resumed under a larger `COPYH_HEAP_GB` ends with the same records.

### M2. RESULT keeps every voted copy's readings: near the worker heap at step 1, above it at step 2

- **Where:** `phase-result.ts` lines 222–223 (`voted.push(printCopyOf(p,
  rank))` for every voted position of every line); `prints.ts` lines 39–73
  (`PrintCopy` holds the position's `money`, `judged` and `main` objects).
- **Measured** (2026-11-27, positions of the schema's shape parsed as
  RESULT parses them, the heap after a collection): 3,360 B a MAIN voted
  copy, 642 B a BROAD-only one.
- **What follows by the plan's count** (39,000 MAIN copies a week): MAIN
  alone is 6.3 GB (5.9 GiB) at step 1 and 9.4 GB (8.8 GiB) at step 2.
  BROAD-only copies at twice MAIN's number add 2.4 and 3.6 GB, and
  `reportOf` builds its own arrays on top. RESULT's child runs at the
  worker heap: 8 GiB today (`--max-old-space-size=8192`).
- **Why medium:** a child out of memory is exit 1 before `result.json`:
  not a look, and the heap may be raised (once M1 is fixed). But above the
  20 GB cap there is no setting left, RESULT is one part that cannot be
  cut smaller, and nothing before the freeze measures it.
- **The fix, in this order:**
  1. RESULT runs at the heap cap, as the large lanes do: the last argument
     `true` in `runEngine`'s `phaseOf(o, "RESULT", …)` (`steps.ts` lines
     735–753). One child at 20 GB; a ceiling costs nothing until used.
  2. The plan's section 11 measurement, which commit 16 did not bring:
     PRICES on a coin of the largest projected size, RANK and RESULT on
     step 2's projected positions, all made up. The counts that size them
     come from the rehearsal's BUILD (question 2).
  3. If RESULT's measured peak passes half the cap, `PrintCopy` keeps
     numbers in place of the position's objects: a MAIN copy's fourteen
     nets and edges (STOP2, STOP5, DAYS7, J, the four moved lines, the
     cascade, Binance). About 1 KB a MAIN copy in place of 3.4 KB; the
     change stays inside `prints.ts`.
- CONFIRM holds S's voted copies and SEALED FRESH-2's: about half of step
  1's. RANK keeps 219 B a MAIN copy. No change asked there.

### M3. A torn part is never taken, but it is met late and under another name

The brief asks whether the engine's parts do better than the store's
resume, which took a torn part with a whole header (E's build, 2026-11-26
23:23Z: code-rules, `a9d923a`).

- **Where:** `engine.ts` line 122 (`writeUnflushed`: no flush before the
  rename); lines 327–347 (a resume holds an existing part to its header
  line only).
- **Never taken** (my probe on the code): a part torn after its header is
  kept by the resume and caught at the phase's compare, exit 7, "the two
  copies of 1 parts differ". A part torn inside its header, or all zeros,
  is exit 5, "a part of other inputs, to be moved aside by hand". No
  reader takes a part without holding its whole file to the record.
- **What is wrong:** both messages name something else. Exit 7 is the
  alarm for two computations that disagree, and C15 answers it with a
  decisions entry and both copies moved aside. And one case blocks: the
  record is flushed (`writeWhole`) while its last parts are not, so a
  crash right after a phase closes can leave a record whose part is torn.
  Every later phase then stops at "not the part its phase's record holds"
  (exit 5), and the closed phase computes nothing again until the record
  is removed by hand.
- **The fix:** the part is flushed before its rename: `fsyncSync` in H1's
  `writePart`. A renamed part is then whole on disk, and a whole header
  means a whole part. The cost is about 81 ms a part on F: (code-rules):
  about 4 minutes over LABELS' 3,072 part copies at step 1.

### M4. Two prints the rules name are not in the report

**The calibration prints.**

- **The rule:** C13: "The calibration prints … into
  `copyh/calibration.json`, copied into each look's report and held to its
  SHA-256 (RL7)"; its test, "the calibration copied and held to its hash".
- **The code:** `identityOf` names the file's SHA-256 (`steps.ts` lines
  168–176); no line copies its content into `report.json`, and no test
  asks for it (`calibration` appears in `gate.ts`, `steps.ts`'s list and
  two tests of the list).
- **The fix** (`steps.ts`): read the file's bytes once, hold their SHA-256
  to `identity.lists["calibration.json"]` (else exit 5), and set
  `calibration: JSON.parse(bytes)` in step 1's report (line 1313) and step
  2's (line 1542). A test beside `writeLook`'s: the report holds the
  file's content; a file changed after the identity was taken is refused.
  FRESH-2's report: question 4.

**MAIN without its gap copies.**

- **The rule:** C11, R11 unchanged: a gap copy is "flagged, printed with
  and without"; C16's item 5 says it again. The paper's look prints it
  (R14: "MAIN without its gap copies (R11)"; `src/paper/summary.ts`
  `withoutGapCopies`).
- **The code:** `prints.ts` counts the gap copies (`r14.gap`, line 238)
  and prints no figure without them; the settled and the thin copies each
  have theirs (lines 515–525).
- **Why it matters here:** a hole of the archive and a stage's last
  seconds make gap copies (C1, RL1; C3), so the reader of a look wants
  MAIN beside MAIN without them.
- **The fix** (`prints.ts` `reportOf`):

  ```ts
  gap: {
    copies: main.filter((c) => c.gap).length,
    withoutGap: stat(main.filter((c) => !c.gap)),
  },
  ```

  and `gap: r.gap` in `fresh2.ts`'s `fresh2Report`, which takes every
  print by name. Tests: in `copyh-prints`, a gap copy's net leaves the
  figure; in `copyh-fresh2`, the form's keys.

After the freeze either would be a defect by C0's route: the code not
doing what the rules say, though neither decides anything.

## 5. Low findings

Each is a small change outside the store closure.

- **L1. A part whose run file is missing blocks the step's counts for
  good** (`engine.ts` lines 361–374; `steps.ts` lines 831–850). The child
  renames the part; the parent then writes `<id>.run.json`. A parent that
  dies between the two leaves a part without its run file. The resume
  keeps the part (my probe: the phase closes, the run file stays
  missing), and `stepCounts`' `runsOf` then throws ENOENT at every run,
  after every phase is closed. **Fix** in `runPhase`, the header first so
  that a part of other inputs is still refused, never overwritten:

  ```ts
  if (existsSync(file) && headerLine(file) !== headers[i]) throw new StoreError(…);
  if (!existsSync(file) || !existsSync(path.join(dir, `${s.id}.run.json`)))
    todo.push(…);
  ```

  A part computed again is byte-equal. A test: a part's run file removed,
  the phase resumed, the run file back.
- **L2. FRESH-2's composed funding list refuses a key both lists hold,
  the meta reply's among them** (`steps.ts` lines 1658–1679).
  `copyh/funding.sha256` lists `info/meta.json` (its last line). C14 (4)
  2. stores a new meta reply at FRESH-2 and lists the funding "the same
  way". If `funding2.sha256` holds that key too, the stage stops at exit 5
  after FRESH-2's freeze. **Fix:** compose the window lines only (the keys
  `phase-coin.ts`'s `WINDOW` takes; nothing else is read from the list),
  a window in both still refused.
- **L3. `copyh/choice.json` may hold more than two tries**
  (`steps.ts` line 1378: `ChosenFile` has no cap). Three would crash
  CONFIRM's child (`confirm.ts` lines 99–102, exit 1) hours into step 2.
  **Fix:** `.max(CHOSEN_AT_MOST)` on `chosen`, so that `readyForStep2`
  refuses it (exit 5) before anything is read.
- **L4. Three exports serve tests only:** `p1Of` (`phase-labels.ts` line
  285), `buildOf` (`phase-build.ts` line 613) and `positionsOf`
  (`phase-prices.ts` line 326, which reads a whole PRICES part into
  memory). **Fix:** move them to `test/copyh-phase-world.ts`. About sixty
  more names are exported and imported by nothing (the phases' `*Inputs`
  and `*Context` schemas, `steps.ts`'s file schemas and constants): the
  first review's section 8, item 5, read again after part 4, which will
  import some.
- **L5. One name for different things:** `readingOf` (`phase-labels.ts`:
  a reading's stores; `verdict.ts`: MAIN's reading at z), `linesOf`
  (`phase-build.ts`: a run of JSON lines; `phase-result.ts`: positions'
  lines; `prints.ts`: every line's figures), `judgedOf` (`tries.ts`,
  `phase-prices.ts`), `JudgedCopy` and `Coin` (the engine's and
  `reproduce.ts`'s). No file imports two of a pair today. **Fix:** rename
  the newer of each pair at the freeze's tidying.
- **L6. Needless:** `engine.ts` line 378's `why ?? "?"` (a run with parts
  to go always has a why); `phase-sealed.ts` line 91 keeps FRESH-2's voted
  copies when MAIN is not judged, where they are read by nothing.
- **L7. Docs:** architecture's COPY-H section still says the large lane
  "comes with the phases" (its paragraph on the caps), "being built since
  2026-11-26 … the steps' phases … to come" (its heading) and "Built so
  far" (the engine's paragraph); so it does at `643450e`. CLAUDE.md's
  COPY-H line was mended by `a9d923a`.

**Notes, no change asked:**

- **Every child hashes every BUILD part whole before its first coin**
  (`heldPart`, once a process), in TRIPWIRE, REMOVAL and PRICES, and the
  parent again at each run. With runs of 14 minutes and two pools a phase
  that is BUILD's bytes read many times an hour. It is safe; whether it
  is slow shows in the rehearsal's TRIPWIRE and REMOVAL.
- **REMOVAL holds every key of a coin at once.** It reads no price, so
  the rehearsal can run it on all of E and print its peak; S and FRESH-2
  hold more.
- **RANK's part is one JSON line** that grows with the account-Mondays
  that hold a copy: my estimate is under 150 MB at FRESH-2's stage,
  against V8's cap of 512 MB on a string. The measurement of M2 covers it.
- **A look's writes are no part.** Gzipping the positions is tens of
  minutes at full size; it starts only inside the budget and then runs to
  its end, past 15 minutes and into a closed window if one begins.
- **`step1`, `step2` and `fresh2` are run whole by no test at this
  commit;** their pieces are. C15 (b)'s synthetic world is their test.
- **A try may be named "MAIN",** the name FRESH-2's stage gives MAIN's
  judged set.

## 6. The brief's six checks

1. **Correctness against the rules:** holds (section 2), but for M4. The
   order among one step's refusals is the code's own (a second run first,
   then the reproduction, the values, the earlier step's files); the rules
   give them as conditions, each exit 5, and nothing is read before the
   last.
2. **Look-ahead and leaks:** none found. Step 1's seal keeps S closed and
   its stores are E's alone. The rounds read step 1's positions file,
   held twice (the file's hash, then its lines'). Step 2 opens FRESH's
   store only after the gate and its own refusals; its recompute of step
   1 reads E's store and funding rows before END_E. FRESH-2's stage is
   refused with "no yes to confirm" before its store is opened. Before
   the freeze only `reproduce` prices anything, on Polymarket's weeks; the
   fortnight's one output is a hash and counts.
3. **Resume and crash safety:** a resumed phase equals an unbroken one
   (the tests, and my reading of `runPhase`); the lanes change no result
   (five tests). A torn part: M3. A lost run file: L1.
4. **Size:** no array is spread into a call in the new files (each `...`
   read). PRICES' and BUILD's parts are read by streams or by index;
   `partBytes` reads whole only the small parts. The write side: H1.
   Memory: M2.
5. **The store closure:** unchanged since `21d2a11` (section 7).
6. **Simplicity:** L4–L6. The phases are plain: one function a part, one
   schema for its inputs. `steps.ts` is long (1,805 lines) but flat.

## 7. The store closure

- `git diff --stat 21d2a11 8c0310c` over the 25 closure files, with
  `design.ts`, `dirs.ts` and `normalize.ts`, is empty.
- **No finding's fix touches one of them.** H1 and M3 are `engine.ts`,
  `phase-prices.ts` and `phase-build.ts`; M1 and M2 `steps.ts`,
  `phase-labels.ts`, `phase-build.ts` and `prints.ts`; M4 `steps.ts`,
  `prints.ts` and `fresh2.ts`; L1 `engine.ts`; L2 and L3 `steps.ts`;
  L4–L6 the phases' files and tests.
- **The one to watch is H1:** its writer needs `run.ts`'s rename loop,
  and `run.ts` is a closure file. Copy the loop into `engine.ts`; do not
  export `renameOver`.

## 8. My probes (scratch copy only)

- **The write limit** (`write-limit.cjs`): Node 24.13.0, a read-only file
  descriptor, so nothing is written: 2³¹ − 1 bytes pass the length check,
  2³¹ throw `ERR_OUT_OF_RANGE`.
- **A positions line's bytes** (`line-size.cjs`): the schema's fields
  with numbers of full precision, one, three and ten exits.
- **The heap a kept copy costs** (`heap-per-copy.mjs`, the scratch
  `dist`): RESULT 3,360 and 642 B, RANK 219 and 124 B, a parsed position
  4,579 and 1,875 B (MAIN and BROAD-only).
- **A torn part and a lost run file** (a test file in the scratch copy):
  the three outcomes of M3 and L1.
- **C14's sentences and Holm's order** (`sentences.mjs`): nine sentences
  held to `rules.md`'s text with X, Y, P and z put back; the bars and
  readings of a lone try, of two tries, of a first try withheld or with a
  failing sign, of an s exactly at the bar.
- **H1's fix** tried and undone, as above.
- The scripts and their outputs are in this worker's scratchpad
  (`probes\`, `trial\`), which a cleanup can clear: each is described
  here so that it can be written again. The scratch copy's junctions are
  removed; nothing of the repository was written but this file and its
  README row.

## 9. Questions, each with a recommendation

1. **H1's form: chunks through the engine, or PRICES cut by account
   group as the plan had it?** Sixteen parts a coin would also stay under
   the limit, but RESULT would merge 3,760 parts and each coin's objects
   would be built sixteen times. **Recommended:** chunks. It is 73 lines
   added and 21 removed, it removes the three-fold memory as well, and it
   serves every phase.
2. **What may the rehearsal print to size the priced phases?**
   **Recommended:** from BUILD on all of E, the copies by line and coin
   and each part's bytes (counts of instants and memberships: allowed);
   REMOVAL and TRIPWIRE on all of E with their peaks. Then the made-up
   measurement of PRICES, RANK and RESULT at step 2's projected size, in
   a decisions entry before the freeze. Without it the worker heap is set
   from phases that are not the largest.
3. **RESULT at the heap cap** (M2). **Recommended:** yes, now; the
   leaner `PrintCopy` only if the measurement asks for it.
4. **The calibration in FRESH-2's report?** C13 says "each look's
   report"; FRESH-2's stage is no look, and C14's L9 allows only the
   judged copies' figures. **Recommended:** looks 1 and 2 only.
5. **Will `copyh/funding2.sha256` list the new meta reply?** (L2.)
   **Recommended:** rule now that the engine composes window lines only,
   so that the freeze tool's form at part 5 cannot stop the stage.
6. **"Step 2's program again before step 2"** (C15 (a)). Step 2 cannot
   tell a new run of `reproduce` from step 1's: the program and its
   fingerprint are the same. **Recommended:** keep it by hand, the run and
   its `repro.json`'s SHA-256 recorded in decisions before step 2; no code.
7. **FRESH-2's report keeps `withoutItAndTheMostInfluentialDay`,** which
   names a UTC day under its look's name; `worstDay` and `months` were
   renamed "COPY-H's copies by UTC day/month". **Recommended:** rename it
   the same way (one line in `fresh2Report`): C14's L9 names the day
   prints as a kind, and this is one.

## 10. What I did not review

`reproduce.ts`'s `reproduceAccounts` line by line (COPYH-REPRO-2's
`1b2afe0`, `1eea92c`): I read its readings, its judgement, its answers
and the L7 rework; the supervisor's anchor run holds its numbers. The
tests' bodies: read by their cases, run file by file, with the head of
`copyh-engine` and the lanes case line by line. The two commits after
`8c0310c`. `gate.ts`'s kinds of list beyond its two new closure lines.
The breaks round is still to come. No real data was opened: every size
here is arithmetic on the plan's printed count and on made-up lines, not
a measurement of E.
